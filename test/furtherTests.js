/** 
* This contract tests the Tellor functions
*/ 

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');
const helper = require("./helpers/test_helpers");
//const ethers = require('ethers');
const Utilities = artifacts.require("./libraries/Utilities.sol");
const UtilitiesTests = artifacts.require("./UtilitiesTests.sol");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper

var oracleAbi = Tellor.abi;
var masterAbi = TellorMaster.abi;


contract('Further Tests', function(accounts) {
  let oracle;
  let oracle2;
  let oracleBase;
  let master;
  let utilities;

    beforeEach('Setup contract for each test', async function () {
        oracleBase = await Tellor.new();
        oracle = await TellorMaster.new(oracleBase.address);
        master = await new web3.eth.Contract(masterAbi,oracle.address);
        oracle2 = await new web3.eth.Contract(oracleAbi,oracleBase.address);
   });  
   
   it("transferOwnership", async function () {
   	    let checkowner = await oracle.getAddressVars(web3.utils.keccak256("_owner"));
        assert(checkowner == accounts[0], "initial owner acct 0");
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.proposeOwnership(accounts[2]).encodeABI()});
        let pendingOwner = await oracle.getAddressVars(web3.utils.keccak256("pending_owner"));
        assert(pendingOwner == accounts[2], "pending owner acct 2");
        checkowner = await oracle.getAddressVars(web3.utils.keccak256("_owner"));
        assert(checkowner == accounts[0], "initial owner acct 0");
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.claimOwnership().encodeABI()});
        checkowner = await oracle.getAddressVars(web3.utils.keccak256("_owner"));
        assert(checkowner == accounts[2], "new owner acct 2");
   });
    it("Stake miner", async function (){
         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[6],web3.utils.toWei('5000', 'ether')).encodeABI()})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[6],gas:7000000,data:oracle2.methods.depositStake().encodeABI()})
       	let s =  await oracle.getStakerInfo(accounts[6])
        assert(s[0] == 1, "Staked" );
    });
    it("Test New Tellor Storage Contract", async function () {
        let oracleBase2 = await Tellor.new();
         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[2],web3.utils.toWei('5000', 'ether')).encodeABI()})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.proposeFork(oracleBase2.address).encodeABI()})
        for(var i = 1;i<5;i++){
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()})
        }
        await helper.advanceTime(86400 * 8);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()})
        assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == oracleBase2.address);
    });
        it("Test Failed Vote - New Tellor Storage Contract", async function () {
        let oracleBase2 = await Tellor.new();
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[2],web3.utils.toWei('5000', 'ether')).encodeABI()})
        
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.proposeFork(oracleBase2.address).encodeABI()})
        for(var i = 1;i<5;i++){
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()})
        }
        await helper.advanceTime(86400 * 8);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()})
        assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == oracleBase.address, "vote should have failed");
    });
      it("Test Failed Vote - New Tellor Storage Contract--vote fail by 10% quorum", async function () {
        let oracleBase2 = await Tellor.new();
        //print some TRB tokens
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[5],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[4],web3.utils.toWei('2000', 'ether')).encodeABI()})
        console.log("here")
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[4],gas:7000000,data:oracle2.methods.proposeFork(oracleBase2.address).encodeABI()})
        vars = await oracle.getAllDisputeVars(1);
        //check total supply again
        console.log("here2")
        await helper.advanceTime(86400 * 8);
        console.log("here3")
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()})
        //vote should fail
        assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == oracleBase.address, "vote should have failed");
    });
      

      it("Test Failed Vote - New Tellor Storage Contract--vote fail to fail because 10% diff in quorum is not reached", async function () {
        let oracleBase2 = await Tellor.new();
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[5],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[4],web3.utils.toWei('4000', 'ether')).encodeABI()})
        initTotalSupply = await oracle.totalSupply();
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[4],gas:7000000,data:oracle2.methods.proposeFork(oracleBase2.address).encodeABI()})
        vars = await oracle.getAllDisputeVars(1);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[5],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()})
        vars = await oracle.getAllDisputeVars(1);
        newTotalSupply = await oracle.totalSupply();
        it= await web3.utils.fromWei(initTotalSupply, 'ether');
        ts= await web3.utils.fromWei(newTotalSupply, 'ether');         
        await helper.advanceTime(86400 * 8);
        assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == oracleBase.address, "vote should have failed");
    });


      it("Test Vote - New Tellor Storage Contract--vote passed by 10% quorum", async function () {
        let oracleBase2 = await Tellor.new();
        //print some TRB tokens
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[5],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[4],web3.utils.toWei('4000', 'ether')).encodeABI()})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[4],gas:7000000,data:oracle2.methods.proposeFork(oracleBase2.address).encodeABI()})
        //get the initial dispute variables--should be zeros
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()})
        await helper.advanceTime(86400 * 8);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()})
        //vote should fail
        assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == oracleBase2.address, "vote should have passed");
    });

    it("Test Deity Functions", async function () {
    	let owner = await oracle.getAddressVars(web3.utils.keccak256("_deity"));
    	assert(owner == accounts[0])
    	await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeDeity(accounts[1]).encodeABI()})
		owner = await oracle.getAddressVars(web3.utils.keccak256("_deity"));
		assert(owner == accounts[1])
		newOracle = await Tellor.new();
		await web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
		assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == newOracle.address);
    });
       it("Get Symbol and decimals", async function(){
        let symbol =await oracle2.methods.symbol().call()
        assert.equal(symbol,"TRB","the Symbol should be TT");
        data3 =  await oracle2.methods.decimals().call()
        assert(data3 - 0 == 18)
    });
    it("Get name", async function(){
        let name = await oracle2.methods.name().call()
        assert.equal(name,"Tellor Tributes","the Name should be Tellor Tributes");
    });
    it("getStakersCount", async function(){
        let count = await oracle.getUintVar(web3.utils.keccak256("stakerCount"))
        assert(web3.utils.hexToNumberString(count)==6, "count is 6");//added miner
    });
    it("getStakersInfo", async function(){
        let info = await oracle.getStakerInfo(accounts[1])
        let stake = web3.utils.hexToNumberString(info['0']);
        let startDate = web3.utils.hexToNumberString(info['1']);
        let _date = new Date();
        let d = (_date - (_date % 86400000))/1000;
        assert(startDate >= d*1, "startDate is today");
        assert(stake*1 == 1, "Should be 1 for staked address");
     });

   it("Total Supply", async function(){
        supply = await master.methods.totalSupply().call()
        assert.equal(web3.utils.fromWei(supply),6000,"Supply should be 6000");//added miner
    });
 });