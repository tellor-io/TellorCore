const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const helper = require("./helpers/test_helpers");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
var oracleAbi = Tellor.abi;
var oracleByte = Tellor.bytecode;
var OldTellor = artifacts.require("./oldContracts/OldTellor.sol")
var oldTellorABI = OldTellor.abi;
var UtilitiesTests = artifacts.require("./UtilitiesTests.sol")

var masterAbi = TellorMaster.abi;
var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";

contract('v2 Tests', function(accounts) {
  let oracleBase;
  let oracle;
  let oracle2;
  let master;
  let oldTellor;
  let oldTellorinst;
  let utilities;

    beforeEach('Setup contract for each test', async function () {
        //deploy old, request, update address, mine old challenge.
        oldTellor = await OldTellor.new()    
        oracle = await TellorMaster.new(oldTellor.address);
        master = await new web3.eth.Contract(masterAbi,oracle.address);
        oldTellorinst = await new web3.eth.Contract(oldTellorABI,oldTellor.address);
        for(var i = 0;i<6;i++){
            //print tokens 
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.theLazyCoon(accounts[i],web3.utils.toWei('1100', 'ether')).encodeABI()})
        }
        for(var i=0; i<52;i++){
            x = "USD" + i
            apix = api + i
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.requestData(apix,x,1000,0).encodeABI()})
        }
        let q = await oracle.getRequestQ();
        //Deploy new upgraded Tellor
        oracleBase = await Tellor.new();
        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);
        await oracle.changeTellorContract(oracleBase.address)
        for(var i = 0;i<5;i++){
          await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods['testSubmitMiningSolution(string,uint256,uint256)']("nonce",1,1200).encodeABI()})
        }
    });
   it("Test lower difficulty target (5 min)", async function () {
   	   assert(await oracle.getUintVars(keccak256("timeTarget")) == 300)
   });
   it("Test no time limit on disputes", async function () {
        for(var i = 0;i<5;i++){
            res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        balance1 = await oracle.balanceOf(accounts[2]);
        blocknum = await oracle.getMinedBlockNum(1,res[0]);
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[1],web3.utils.toWei('5000', 'ether')).encodeABI()})
        dispBal1 = await oracle.balanceOf(accounts[1])
        await helper.advanceTime(86400 * 22);
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,res[0],2).encodeABI()});
        count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
        assert(count == 1)
   });
   it("Test multiple dispute rounds, passing all three", async function () {
   	       	await tellorToken.approve(oracle.address,web3.utils.toWei('100','ether'),{from:accounts[2]});
      await oracle.depositStake(web3.utils.toWei('100'),{from:accounts[2],gas:2000000})
            await tellorToken.mint(accounts[1],web3.utils.toWei("500"));
      let vars = await oracle.getStakerInfo(accounts[2])
      assert(vars[2] == 2, "should only be staked once now");
      for(var i = 0;i<5;i++){
        res = await oracle.submitMiningSolution(1,100 + i,{from:accounts[i]});
      }
      await tellorToken.mint(accounts[1],web3.utils.toWei("500"));
       balance1 = web3.utils.fromWei(await oracle.balanceOf(accounts[2]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[2]))*1;
      dispBal1 = web3.utils.fromWei(await oracle.balanceOf(accounts[1]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[1]))*1;
      await tellorToken.approve(oracle.address,web3.utils.toWei('10','ether'),{from:accounts[1]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[1],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      //vote 1 passes
      await oracle.vote(1,true,{from:accounts[3],gas:2000000})
      await helper.advanceTime(86400 * 3);
      await oracle.tallyVotes(1,{from:accounts[0],gas:2000000})
      await helper.expectThrow(oracle.unlockDisputeFee(1,{from:accounts[0],gas:2000000})) //try to withdraw
        dispInfo = await oracle.getAllDisputeVars(1);
        assert(dispInfo[3] == accounts[2], "account 2 should be the disputed miner")
      	assert(dispInfo[2] == true,"Dispute Vote passed")
      //vote 2 - fails
      await tellorToken.mint(accounts[6],web3.utils.toWei("500"));
      await tellorToken.approve(oracle.address,web3.utils.toWei('20','ether'),{from:accounts[6]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[6],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      await oracle.vote(2,false,{from:accounts[6],gas:2000000})
      await oracle.vote(2,true,{from:accounts[4],gas:2000000})
      await helper.advanceTime(86400 * 5);
      await oracle.tallyVotes(2,{from:accounts[0],gas:2000000})
       dispInfo = await oracle.getAllDisputeVars(2);
      assert(dispInfo[2] == false,"Dispute Vote failed")
      // vote 3 - passes
      await tellorToken.approve(oracle.address,web3.utils.toWei('40','ether'),{from:accounts[1]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[1],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      await oracle.vote(3,false,{from:accounts[6],gas:2000000})
      await oracle.vote(3,true,{from:accounts[1],gas:2000000})
      await oracle.vote(3,true,{from:accounts[4],gas:2000000})
      await helper.advanceTime(86400 * 9);
      await oracle.tallyVotes(3,{from:accounts[0],gas:2000000})
      await helper.advanceTime(86400 * 2 )
      dispInfo = await oracle.getAllDisputeVars(1);
      assert(dispInfo[2] == true,"Dispute Vote passed")
      await oracle.unlockDisputeFee(1,{from:accounts[0],gas:2000000})
      dispInfo = await oracle.getAllDisputeVars(1);
      assert(dispInfo[2] == true,"Dispute Vote passed")
       balance2 = web3.utils.fromWei(await oracle.balanceOf(accounts[2]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[2]))*1;
      dispBal2 = web3.utils.fromWei(await oracle.balanceOf(accounts[1]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[1]))*1;
      dispBal6 = await tellorToken.balanceOf(accounts[6])
      assert(balance1 - balance2 == web3.utils.fromWei(await oracle.getUintVar(web3.utils.keccak256("minimumStake")))*1,"reported miner's balance should change correctly");
      assert(dispBal2 - dispBal1 == web3.utils.fromWei(await oracle.getUintVar(web3.utils.keccak256("minimumStake")))*1, "disputing party's balance should change correctly")
      assert(await oracle.balanceOf(accounts[2]) == web3.utils.toWei('100'),"Account 2 balance should be correct")
      vars = await oracle.getStakerInfo(accounts[2])
      assert(vars[2] == 1, "should only be staked once now");
      assert(0==1)
   });
   it("Test multiple dispute rounds -- proposed fork", async function () {
   	       	await tellorToken.approve(oracle.address,web3.utils.toWei('100','ether'),{from:accounts[2]});
      await oracle.depositStake(web3.utils.toWei('100'),{from:accounts[2],gas:2000000})
            await tellorToken.mint(accounts[1],web3.utils.toWei("500"));
      let vars = await oracle.getStakerInfo(accounts[2])
      assert(vars[2] == 2, "should only be staked once now");
      for(var i = 0;i<5;i++){
        res = await oracle.submitMiningSolution(1,100 + i,{from:accounts[i]});
      }
      await tellorToken.mint(accounts[1],web3.utils.toWei("500"));
       balance1 = web3.utils.fromWei(await oracle.balanceOf(accounts[2]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[2]))*1;
      dispBal1 = web3.utils.fromWei(await oracle.balanceOf(accounts[1]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[1]))*1;
      await tellorToken.approve(oracle.address,web3.utils.toWei('10','ether'),{from:accounts[1]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[1],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      //vote 1 passes
      await oracle.vote(1,true,{from:accounts[3],gas:2000000})
      await helper.advanceTime(86400 * 3);
      await oracle.tallyVotes(1,{from:accounts[0],gas:2000000})
      await helper.expectThrow(oracle.unlockDisputeFee(1,{from:accounts[0],gas:2000000})) //try to withdraw
        dispInfo = await oracle.getAllDisputeVars(1);
        assert(dispInfo[3] == accounts[2], "account 2 should be the disputed miner")
      	assert(dispInfo[2] == true,"Dispute Vote passed")
      //vote 2 - fails
      await tellorToken.mint(accounts[6],web3.utils.toWei("500"));
      await tellorToken.approve(oracle.address,web3.utils.toWei('20','ether'),{from:accounts[6]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[6],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      await oracle.vote(2,false,{from:accounts[6],gas:2000000})
      await oracle.vote(2,true,{from:accounts[4],gas:2000000})
      await helper.advanceTime(86400 * 5);
      await oracle.tallyVotes(2,{from:accounts[0],gas:2000000})
       dispInfo = await oracle.getAllDisputeVars(2);
      assert(dispInfo[2] == false,"Dispute Vote failed")
      // vote 3 - passes
      await tellorToken.approve(oracle.address,web3.utils.toWei('40','ether'),{from:accounts[1]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[1],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      await oracle.vote(3,false,{from:accounts[6],gas:2000000})
      await oracle.vote(3,true,{from:accounts[1],gas:2000000})
      await oracle.vote(3,true,{from:accounts[4],gas:2000000})
      await helper.advanceTime(86400 * 9);
      await oracle.tallyVotes(3,{from:accounts[0],gas:2000000})
      await helper.advanceTime(86400 * 2 )
      dispInfo = await oracle.getAllDisputeVars(1);
      assert(dispInfo[2] == true,"Dispute Vote passed")
      await oracle.unlockDisputeFee(1,{from:accounts[0],gas:2000000})
      dispInfo = await oracle.getAllDisputeVars(1);
      assert(dispInfo[2] == true,"Dispute Vote passed")
       balance2 = web3.utils.fromWei(await oracle.balanceOf(accounts[2]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[2]))*1;
      dispBal2 = web3.utils.fromWei(await oracle.balanceOf(accounts[1]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[1]))*1;
      dispBal6 = await tellorToken.balanceOf(accounts[6])
      assert(balance1 - balance2 == web3.utils.fromWei(await oracle.getUintVar(web3.utils.keccak256("minimumStake")))*1,"reported miner's balance should change correctly");
      assert(dispBal2 - dispBal1 == web3.utils.fromWei(await oracle.getUintVar(web3.utils.keccak256("minimumStake")))*1, "disputing party's balance should change correctly")
      assert(await oracle.balanceOf(accounts[2]) == web3.utils.toWei('100'),"Account 2 balance should be correct")
      vars = await oracle.getStakerInfo(accounts[2])
      assert(vars[2] == 1, "should only be staked once now");
      assert(0==1)
   });
   it("Test multiple dispute rounds - passing, then failing", async function () {
   	       	await tellorToken.approve(oracle.address,web3.utils.toWei('100','ether'),{from:accounts[2]});
      await oracle.depositStake(web3.utils.toWei('100'),{from:accounts[2],gas:2000000})
            await tellorToken.mint(accounts[1],web3.utils.toWei("500"));
      let vars = await oracle.getStakerInfo(accounts[2])
      assert(vars[2] == 2, "should only be staked once now");
      for(var i = 0;i<5;i++){
        res = await oracle.submitMiningSolution(1,100 + i,{from:accounts[i]});
      }
      await tellorToken.mint(accounts[1],web3.utils.toWei("500"));
       balance1 = web3.utils.fromWei(await oracle.balanceOf(accounts[2]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[2]))*1;
      dispBal1 = web3.utils.fromWei(await oracle.balanceOf(accounts[1]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[1]))*1;
      await tellorToken.approve(oracle.address,web3.utils.toWei('10','ether'),{from:accounts[1]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[1],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      //vote 1 passes
      await oracle.vote(1,true,{from:accounts[3],gas:2000000})
      await helper.advanceTime(86400 * 3);
      await oracle.tallyVotes(1,{from:accounts[0],gas:2000000})
      await helper.expectThrow(oracle.unlockDisputeFee(1,{from:accounts[0],gas:2000000})) //try to withdraw
        dispInfo = await oracle.getAllDisputeVars(1);
        assert(dispInfo[3] == accounts[2], "account 2 should be the disputed miner")
      	assert(dispInfo[2] == true,"Dispute Vote passed")
      //vote 2 - fails
      await tellorToken.mint(accounts[6],web3.utils.toWei("500"));
      await tellorToken.approve(oracle.address,web3.utils.toWei('20','ether'),{from:accounts[6]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[6],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      await oracle.vote(2,false,{from:accounts[6],gas:2000000})
      await oracle.vote(2,true,{from:accounts[4],gas:2000000})
      await helper.advanceTime(86400 * 5);
      await oracle.tallyVotes(2,{from:accounts[0],gas:2000000})
       dispInfo = await oracle.getAllDisputeVars(2);
      assert(dispInfo[2] == false,"Dispute Vote failed")
      // vote 3 - passes
      await tellorToken.approve(oracle.address,web3.utils.toWei('40','ether'),{from:accounts[1]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[1],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      await oracle.vote(3,false,{from:accounts[6],gas:2000000})
      await oracle.vote(3,true,{from:accounts[1],gas:2000000})
      await oracle.vote(3,true,{from:accounts[4],gas:2000000})
      await helper.advanceTime(86400 * 9);
      await oracle.tallyVotes(3,{from:accounts[0],gas:2000000})
      await helper.advanceTime(86400 * 2 )
      dispInfo = await oracle.getAllDisputeVars(1);
      assert(dispInfo[2] == true,"Dispute Vote passed")
      await oracle.unlockDisputeFee(1,{from:accounts[0],gas:2000000})
      dispInfo = await oracle.getAllDisputeVars(1);
      assert(dispInfo[2] == true,"Dispute Vote passed")
       balance2 = web3.utils.fromWei(await oracle.balanceOf(accounts[2]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[2]))*1;
      dispBal2 = web3.utils.fromWei(await oracle.balanceOf(accounts[1]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[1]))*1;
      dispBal6 = await tellorToken.balanceOf(accounts[6])
      assert(balance1 - balance2 == web3.utils.fromWei(await oracle.getUintVar(web3.utils.keccak256("minimumStake")))*1,"reported miner's balance should change correctly");
      assert(dispBal2 - dispBal1 == web3.utils.fromWei(await oracle.getUintVar(web3.utils.keccak256("minimumStake")))*1, "disputing party's balance should change correctly")
      assert(await oracle.balanceOf(accounts[2]) == web3.utils.toWei('100'),"Account 2 balance should be correct")
      vars = await oracle.getStakerInfo(accounts[2])
      assert(vars[2] == 1, "should only be staked once now");
      assert(0==1)
   });
   it("Test multiple dispute rounds - failing, then passing", async function () {
   	      	await tellorToken.approve(oracle.address,web3.utils.toWei('100','ether'),{from:accounts[2]});
      await oracle.depositStake(web3.utils.toWei('100'),{from:accounts[2],gas:2000000})
            await tellorToken.mint(accounts[1],web3.utils.toWei("500"));
      let vars = await oracle.getStakerInfo(accounts[2])
      assert(vars[2] == 2, "should only be staked once now");
      for(var i = 0;i<5;i++){
        res = await oracle.submitMiningSolution(1,100 + i,{from:accounts[i]});
      }
      await tellorToken.mint(accounts[1],web3.utils.toWei("500"));
       balance1 = web3.utils.fromWei(await oracle.balanceOf(accounts[2]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[2]))*1;
      dispBal1 = web3.utils.fromWei(await oracle.balanceOf(accounts[1]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[1]))*1;
      await tellorToken.approve(oracle.address,web3.utils.toWei('10','ether'),{from:accounts[1]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[1],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      //vote 1 passes
      await oracle.vote(1,true,{from:accounts[3],gas:2000000})
      await helper.advanceTime(86400 * 3);
      await oracle.tallyVotes(1,{from:accounts[0],gas:2000000})
      await helper.expectThrow(oracle.unlockDisputeFee(1,{from:accounts[0],gas:2000000})) //try to withdraw
        dispInfo = await oracle.getAllDisputeVars(1);
        assert(dispInfo[3] == accounts[2], "account 2 should be the disputed miner")
      	assert(dispInfo[2] == true,"Dispute Vote passed")
      //vote 2 - fails
      await tellorToken.mint(accounts[6],web3.utils.toWei("500"));
      await tellorToken.approve(oracle.address,web3.utils.toWei('20','ether'),{from:accounts[6]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[6],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      await oracle.vote(2,false,{from:accounts[6],gas:2000000})
      await oracle.vote(2,true,{from:accounts[4],gas:2000000})
      await helper.advanceTime(86400 * 5);
      await oracle.tallyVotes(2,{from:accounts[0],gas:2000000})
       dispInfo = await oracle.getAllDisputeVars(2);
      assert(dispInfo[2] == false,"Dispute Vote failed")
      // vote 3 - passes
      await tellorToken.approve(oracle.address,web3.utils.toWei('40','ether'),{from:accounts[1]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[1],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      await oracle.vote(3,false,{from:accounts[6],gas:2000000})
      await oracle.vote(3,true,{from:accounts[1],gas:2000000})
      await oracle.vote(3,true,{from:accounts[4],gas:2000000})
      await helper.advanceTime(86400 * 9);
      await oracle.tallyVotes(3,{from:accounts[0],gas:2000000})
      await helper.advanceTime(86400 * 2 )
      dispInfo = await oracle.getAllDisputeVars(1);
      assert(dispInfo[2] == true,"Dispute Vote passed")
      await oracle.unlockDisputeFee(1,{from:accounts[0],gas:2000000})
      dispInfo = await oracle.getAllDisputeVars(1);
      assert(dispInfo[2] == true,"Dispute Vote passed")
       balance2 = web3.utils.fromWei(await oracle.balanceOf(accounts[2]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[2]))*1;
      dispBal2 = web3.utils.fromWei(await oracle.balanceOf(accounts[1]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[1]))*1;
      dispBal6 = await tellorToken.balanceOf(accounts[6])
      assert(balance1 - balance2 == web3.utils.fromWei(await oracle.getUintVar(web3.utils.keccak256("minimumStake")))*1,"reported miner's balance should change correctly");
      assert(dispBal2 - dispBal1 == web3.utils.fromWei(await oracle.getUintVar(web3.utils.keccak256("minimumStake")))*1, "disputing party's balance should change correctly")
      assert(await oracle.balanceOf(accounts[2]) == web3.utils.toWei('100'),"Account 2 balance should be correct")
      vars = await oracle.getStakerInfo(accounts[2])
      assert(vars[2] == 1, "should only be staked once now");
      assert(0==1)
   });
   it("Test allow tip of current mined ID", async function () {
   	    	await tellorToken.approve(oracle.address,web3.utils.toWei('100','ether'),{from:accounts[2]});
      await oracle.depositStake(web3.utils.toWei('100'),{from:accounts[2],gas:2000000})
            await tellorToken.mint(accounts[1],web3.utils.toWei("500"));
      let vars = await oracle.getStakerInfo(accounts[2])
      assert(vars[2] == 2, "should only be staked once now");
      for(var i = 0;i<5;i++){
        res = await oracle.submitMiningSolution(1,100 + i,{from:accounts[i]});
      }
      await tellorToken.mint(accounts[1],web3.utils.toWei("500"));
       balance1 = web3.utils.fromWei(await oracle.balanceOf(accounts[2]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[2]))*1;
      dispBal1 = web3.utils.fromWei(await oracle.balanceOf(accounts[1]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[1]))*1;
      await tellorToken.approve(oracle.address,web3.utils.toWei('10','ether'),{from:accounts[1]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[1],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      //vote 1 passes
      await oracle.vote(1,true,{from:accounts[3],gas:2000000})
      await helper.advanceTime(86400 * 3);
      await oracle.tallyVotes(1,{from:accounts[0],gas:2000000})
      await helper.expectThrow(oracle.unlockDisputeFee(1,{from:accounts[0],gas:2000000})) //try to withdraw
        dispInfo = await oracle.getAllDisputeVars(1);
        assert(dispInfo[3] == accounts[2], "account 2 should be the disputed miner")
      	assert(dispInfo[2] == true,"Dispute Vote passed")
      //vote 2 - fails
      await tellorToken.mint(accounts[6],web3.utils.toWei("500"));
      await tellorToken.approve(oracle.address,web3.utils.toWei('20','ether'),{from:accounts[6]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[6],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      await oracle.vote(2,false,{from:accounts[6],gas:2000000})
      await oracle.vote(2,true,{from:accounts[4],gas:2000000})
      await helper.advanceTime(86400 * 5);
      await oracle.tallyVotes(2,{from:accounts[0],gas:2000000})
       dispInfo = await oracle.getAllDisputeVars(2);
      assert(dispInfo[2] == false,"Dispute Vote failed")
      // vote 3 - passes
      await tellorToken.approve(oracle.address,web3.utils.toWei('40','ether'),{from:accounts[1]});
      await  oracle.beginDispute(1,res.logs[1].args['_time'],2,{from:accounts[1],gas:2000000});
      count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
      await oracle.vote(3,false,{from:accounts[6],gas:2000000})
      await oracle.vote(3,true,{from:accounts[1],gas:2000000})
      await oracle.vote(3,true,{from:accounts[4],gas:2000000})
      await helper.advanceTime(86400 * 9);
      await oracle.tallyVotes(3,{from:accounts[0],gas:2000000})
      await helper.advanceTime(86400 * 2 )
      dispInfo = await oracle.getAllDisputeVars(1);
      assert(dispInfo[2] == true,"Dispute Vote passed")
      await oracle.unlockDisputeFee(1,{from:accounts[0],gas:2000000})
      dispInfo = await oracle.getAllDisputeVars(1);
      assert(dispInfo[2] == true,"Dispute Vote passed")
       balance2 = web3.utils.fromWei(await oracle.balanceOf(accounts[2]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[2]))*1;
      dispBal2 = web3.utils.fromWei(await oracle.balanceOf(accounts[1]))*1 +web3.utils.fromWei(await tellorToken.balanceOf(accounts[1]))*1;
      dispBal6 = await tellorToken.balanceOf(accounts[6])
      assert(balance1 - balance2 == web3.utils.fromWei(await oracle.getUintVar(web3.utils.keccak256("minimumStake")))*1,"reported miner's balance should change correctly");
      assert(dispBal2 - dispBal1 == web3.utils.fromWei(await oracle.getUintVar(web3.utils.keccak256("minimumStake")))*1, "disputing party's balance should change correctly")
      assert(await oracle.balanceOf(accounts[2]) == web3.utils.toWei('100'),"Account 2 balance should be correct")
      vars = await oracle.getStakerInfo(accounts[2])
      assert(vars[2] == 1, "should only be staked once now");
   	   assert(0==1)
   });
   it("Test removal of request data", async function () {
   	   await helper.expectThrow(web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.requestData("api","x",1000,0).encodeABI()}));
   });
   it("Test token fee burning", async function () {
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.addTip(1,1200).encodeABI()})
   	        balances = []
        for(var i = 0;i<6;i++){
            balances[i] = await oracle.balanceOf(accounts[i]);
        }
        for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        new_balances = []
        for(var i = 0;i<6;i++){
            new_balances[i] = await oracle.balanceOf(accounts[i]);
        }
        changes = []
                for(var i = 0;i<6;i++){
            changes[i] = new_balances[i] - balances[i]
        }
        vars =  await oracle2.methods.getNewCurrentVariables().call()
        assert(vars[2] == 10000, "tip should be big")
        for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        new_balances2 = []
        for(var i = 0;i<6;i++){
            new_balances2[i] = await oracle.balanceOf(accounts[i]);
        }
        changes2 = []
        for(var i = 0;i<6;i++){
            changes2[i] = new_balances2[i] - new_balances[i]
        }
        assert(changes2[1] < changes[1]);
        assert(changes2[2] < changes[2]);
        assert(changes2[3] < changes[4]);
        assert(changes2[4] < changes[4]);
        assert(changes2[0] < changes[0], "miner payout should be decreasing");
   	   assert(,"half of tip tokens were burnt")
   });
   it("Test initial difficulty drop", async function () {
   	           //deploy old, request, update address, mine old challenge.
        oldTellor = await OldTellor.new()    
        oracle = await TellorMaster.new(oldTellor.address);
        master = await new web3.eth.Contract(masterAbi,oracle.address);
        oldTellorinst = await new web3.eth.Contract(oldTellorABI,oldTellor.address);
        for(var i = 0;i<6;i++){
            //print tokens 
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.theLazyCoon(accounts[i],web3.utils.toWei('1100', 'ether')).encodeABI()})
        }
        for(var i=0; i<52;i++){
            x = "USD" + i
            apix = api + i
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.requestData(apix,x,1000,52-i).encodeABI()})
        }
        let q = await oracle.getRequestQ();
        //Deploy new upgraded Tellor
        oracleBase = await Tellor.new();
        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);
        await oracle.changeTellorContract(oracleBase.address)
        diff1 = await oracle.getCurrentVariables();
        for(var i = 0;i<5;i++){
          await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods['testSubmitMiningSolution(string,uint256,uint256)']("nonce",1,1200).encodeABI()})
        }
        diff2 = await oracle.getCurrentVariables();
        assert(diff2 == round(diff1/ 3),"difficulty should drop")

   });
   it("Test automatic pulling of top ID's (the last ones)", async function () {
        for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        vars =  await oracle2.methods.getNewCurrentVariables().call()
        asset(vars == [1,2,3,4,5]);
   });
    it("Test add tip on very far out API id (or on a tblock id?)", async function () {
    	   await helper.expectThrow(web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.addTip(1e18,2000).encodeABI()}));
   			assert(await oracle.getUintVar(web3.keccak256("requestCount")) == 52)
   			await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.addTip(53,2000).encodeABI()})
   	    assert(await oracle.getUintVar(web3.keccak256("requestCount")) == 53)
   	           for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        vars =  await oracle2.methods.getNewCurrentVariables().call()
        asset(vars == [1,2,3,4,5]);
                for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        vars =  await oracle.getLastNewValue(53);
        assert(vars[0] == true)
   });
 });