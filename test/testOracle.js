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

contract('Mining Tests', function(accounts) {
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
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.requestData(apix,x,1000,52-i).encodeABI()})
        }
        let q = await oracle.getRequestQ();
        //Deploy new upgraded Tellor
        oracleBase = await Tellor.new();
        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);
        await oracle.changeTellorContract(oracleBase.address)
        for(var i = 0;i<5;i++){
          await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods['testSubmitMiningSolution(string,uint256,uint256)']("nonce",1,1200).encodeABI()})
        }
        // for(var i = 1;i<6;i++){
        //     await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.addTip(i,i).encodeABI()})
        // }
    });
   //  it("test utilities",async function(){
   //      var myArr = []
   //      for(var i=50;i>=0;i--){
   //          myArr.push(i)
   //      }
   //      utilities = await UtilitiesTests.new(oracle.address)
   //      top5N = await utilities.testgetMax5(myArr)
   //      let q = await oracle.getRequestQ();
   //      for(var i=0;i<5;i++){
   //          assert(top5N['_max'][i] == myArr[i+1])
   //          assert(top5N['_index'][i] == i+1)
   //      }

   //  });
   //  it("getVariables", async function(){
   //      //vars = await web3.eth.call({to:oracle.address,from:accounts[0],data:oracle2.methods.getNewCurrentVariables().encodeABI()})
        
   //      vars =  await oracle2.methods.getNewCurrentVariables().call()
   //      assert(vars['1'].length == 5, "ids should be populated");
   //      assert(vars['2'] > 0, "difficulty should be correct")
   //      assert(vars['3'] > 0, "tip should be correct");  
   //  });
   //  it("getTopRequestIDs", async function(){
   //      vars = await oracle2.methods.getTopRequestIDs().call()
   //      for(var i = 0;i<5;i++){
   //          assert(vars[0]= i+6)
   //      }
   //  });
   //  it("Test miner", async function () {
   //      for(var i = 0;i<5;i++){
   //          await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:10000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
   //      }
   //      vars = await oracle.getLastNewValueById(5);
   //      assert(vars[0] > 0, "value should be positive");
   //      assert(vars[1] == true, "value should be there")
   // });
   //  it("Test Miner decreasing payout", async function () {
   //      balances = []
   //      for(var i = 0;i<6;i++){
   //          balances[i] = await oracle.balanceOf(accounts[i]);
   //      }
   //      for(var i = 0;i<5;i++){
   //          await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
   //      }
   //      new_balances = []
   //      for(var i = 0;i<6;i++){
   //          new_balances[i] = await oracle.balanceOf(accounts[i]);
   //      }
   //      changes = []
   //              for(var i = 0;i<6;i++){
   //          changes[i] = new_balances[i] - balances[i]
   //      }
   //      vars =  await oracle2.methods.getNewCurrentVariables().call()
   //      for(var i = 0;i<5;i++){
   //          await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
   //      }
   //      new_balances2 = []
   //      for(var i = 0;i<6;i++){
   //          new_balances2[i] = await oracle.balanceOf(accounts[i]);
   //      }
   //      changes2 = []
   //      for(var i = 0;i<6;i++){
   //          changes2[i] = new_balances2[i] - new_balances[i]
   //      }
   //      assert(changes2[1] < changes[1]);
   //      assert(changes2[2] < changes[2]);
   //      assert(changes2[3] < changes[4]);
   //      assert(changes2[4] < changes[4]);
   //      assert(changes2[0] < changes[0], "miner payout should be decreasing");
   //  });
   // it("Test Difficulty Adjustment", async function () {
   //      for(var i = 0;i<5;i++){
   //          await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
   //      }
   //      diff1 =await oracle2.methods.getNewCurrentVariables().call()
   //      assert((web3.utils.hexToNumberString(diff1[2])*1) > 1, "difficulty greater than 1");//difficulty not changing.....
   //      vars =  await oracle2.methods.getNewCurrentVariables().call()
   //      for(var i = 0;i<5;i++){
   //          await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
   //      }
   //      vars = await oracle2.methods.getNewCurrentVariables().call()
   //      assert((web3.utils.hexToNumberString(vars[2])*1) > (web3.utils.hexToNumberString(diff1[2])*1), "difficulty should continue to move up");
   //  });

   //  it("Test didMine ", async function () {
   //      vars = await oracle2.methods.getNewCurrentVariables().call()
   //      for(var i = 0;i<5;i++){
   //          await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
   //      }
   //      didMine = oracle.didMine(vars[0],accounts[1]);
   //      assert(didMine);
   //  });
    // it("Test Get MinersbyValue ", async function () {
    //     let res;
    //     for(var i = 0;i<5;i++){
    //         res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
    //     }    
    //     res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
    //     miners = await oracle.getMinersByRequestIdAndTimestamp(1, res[1]);
    //     for(var i=0;i<5;i++){
    //     	assert(miners[i] == accounts[i], "miner should be correct")
    //     }
    // });
    
    // it("Test dev Share", async function(){
    //     begbal = await oracle.balanceOf(accounts[0]);
    //     for(var i = 1;i<6;i++){
    //         await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
    //     }
    //     endbal = await oracle.balanceOf(accounts[0]);
    //     assert((endbal - begbal)/1e18  >= 1.2, "devShare")
    //     assert((endbal - begbal)/1e18  <= 1.25, "devShare2")
    // }); 

    it("Test miner, alternating api request on Q and auto select", async function () {
        for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        vars =  await oracle2.methods.getNewCurrentVariables().call()
        for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(30,1000).encodeABI()});  
        data = await oracle2.methods.getNewVariablesOnDeck().call();
        console.log(data)
        assert(data[0][2] == 30, 'ID on deck should be 30');
        assert(data[1][2] >1000, 'Tip should be over 1000');
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(31,2000).encodeABI()}); data = await oracle.getNewVariablesOnDeck();
        data = await oracle2.methods.getNewVariablesOnDeck().call();
         console.log(data)
        assert(data[0][1] == 30, 'T');
        assert(data[1][1] >1000, 'Th');
        assert(data[0][2] == 31, 'The');
        assert(data[1][2] >2000, 'Ther');
    });
    
    it("Test dispute", async function () {
        for(var i = 0;i<5;i++){
            res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        balance1 = await oracle.balanceOf(accounts[2]);
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[1],web3.utils.toWei('5000', 'ether')).encodeABI()})
        dispBal1 = await oracle.balanceOf(accounts[1])
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,res[0],2).encodeABI()});
        count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()});
        await helper.advanceTime(86400 * 22);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
        dispInfo = await oracle.getAllDisputeVars(1);
        assert(dispInfo[7][0] == 1)
        assert(dispInfo[7][1] == res[0])
        assert(dispInfo[7][2] == res[1])
        assert(dispInfo[2] == true,"Dispute Vote passed")
        voted = await oracle.didVote(1, accounts[3]);
        assert(voted == true, "account 3 voted");
        voted = await oracle.didVote(1, accounts[5]);
        assert(voted == false, "account 5 did not vote");
        apid2valueF = await oracle.retrieveData(1,res[0]);
        assert(apid2valueF == 0 ,"value should now be zero this checks updateDisputeValue-internal fx  works");
        balance2 = await oracle.balanceOf(accounts[2]);
        dispBal2 = await oracle.balanceOf(accounts[1])
        assert(balance1 - balance2 == await oracle.getUintVar(web3.utils.keccak256("stakeAmount")),"reported miner's balance should change correctly");
        assert(dispBal2 - dispBal1 == await oracle.getUintVar(web3.utils.keccak256("stakeAmount")), "disputing party's balance should change correctly")
        s =  await oracle.getStakerInfo(accounts[2])
        assert(s != 1, " Not staked" );
    });
    
    it("Test multiple dispute to one miner", async function () {
        for(var i = 0;i<5;i++){
            res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        balance1 = await oracle.balanceOf(accounts[2]);
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[0],web3.utils.toWei('5000', 'ether')).encodeABI()})
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[1],web3.utils.toWei('5000', 'ether')).encodeABI()})
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[4],web3.utils.toWei('5000', 'ether')).encodeABI()})
        resVars = []
        for(i=0;i<3;i++){
            vars =  await oracle2.methods.getNewCurrentVariables().call()
            for(var i = 0;i<5;i++){
                await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
            }
            await helper.advanceTime(1000);
        }
         dispBal1 = await oracle.balanceOf(accounts[1])
        orig_dispBal4 = await oracle.balanceOf(accounts[4])
        //1st dispute to miner
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[0][0],2).encodeABI()});
        count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
        //2nd dispute to same miner
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[4],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[1][0],2).encodeABI()});
        count2 = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));

        //3rd dispute to same miner
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[2][0],2).encodeABI()});
        count2 = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
        //dispute 1 votes and tally
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()});
        await helper.advanceTime(86400 * 22);
        balance1 = await oracle.balanceOf(accounts[2]);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
        dispInfo = await oracle.getAllDisputeVars(1);
        assert(dispInfo[7][0] == 1)
        assert(dispInfo[7][1] == resVars[0][0])
        assert(dispInfo[7][2] == resVars[0][1])
        assert(dispInfo[2] == true,"Dispute Vote passed")
        voted = await oracle.didVote(1, accounts[3]);
        assert(voted == true, "account 3 voted");
        voted = await oracle.didVote(1, accounts[5]);
        assert(voted == false, "account 5 did not vote");
        apid2valueF = await oracle.retrieveData(1,resVars[0][0]);
        assert(apid2valueF == 0 ,"value should now be zero this checks updateDisputeValue-internal fx  works");
        //checks balances after dispute 1
        balance2 = await oracle.balanceOf(accounts[2]);
        dispBal2 = await oracle.balanceOf(accounts[1])
        assert(balance1 - balance2 == await oracle.getUintVar(web3.utils.keccak256("stakeAmount")),"reported miner's balance should change correctly");
        assert(dispBal2 - dispBal1 == await oracle.getUintVar(web3.utils.keccak256("stakeAmount")), "disputing party's balance should change correctly")
        s =  await oracle.getStakerInfo(accounts[2])
        assert(s != 1, " Not staked" );
        //dispute 2 votes and tally
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(2,true).encodeABI()});
        await helper.advanceTime(86400 * 22);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(2).encodeABI()});
        dispBal4 = await oracle.balanceOf(accounts[4])
        assert(dispBal4 - orig_dispBal4 == 0,"a4 shouldn't change'")
         });

   it("Test time travel in data -- really long timesincelastPoof and proper difficulty adjustment", async function () {
        for(var j = 0; j<6;j++){
          vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
          }
        }   
        vars = await oracle.getCurrentVariables()
        var oldDiff = web3.utils.hexToNumberString(vars[2])*1
        assert((web3.utils.hexToNumberString(vars[2])*1) > 1, "difficulty should be greater than 1");//difficulty not changing.....
		await helper.advanceTime(86400 * 20);
        vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
          }
        vars = await oracle2.methods.getNewCurrentVariables().call()
        var newDiff = web3.utils.hexToNumberString(vars[2])*1
        assert( newDiff < oldDiff,"difficulty should be 1 now");
        console.log(await oracle.getNewValueCountbyRequestId(1))
        assert(await oracle.getNewValueCountbyRequestId(1) == 7, "Request ID 1 should have 8 mines");
    });
    it("Test 50 requests, proper booting, and mining of 5", async function () {
          vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
          }
          await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(2,0).encodeABI()});
         for(var i = 1;i <=10 ;i++){
            apix= ("api" + i);
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i+2,i).encodeABI()});
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,11).encodeABI()});
        vars =  await oracle2.methods.getNewCurrentVariables().call()
        for(var i = 0;i<5;i++){
          res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
        data = await oracle.getMinedBlockNum(2,res[1]);

        assert(data>0, "Should be true if Data exist for that point in time");
         for(var i = 11;i <=20 ;i++){
            apix= ("api" + i);
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i+2,i).encodeABI()});
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(2,21).encodeABI()});
        vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        data = await oracle.getMinedBlockNum(1,res[0]);
        assert(data > 0, "Should be true if Data exist for that point in time");
         for(var i = 21;i <=30 ;i++){
            apix= ("api" + i);
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i+2,i).encodeABI()});
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,31).encodeABI()});
        vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
          }
        data = await oracle.getMinedBlockNum(2,res[0]);
        assert(data > 0, "Should be true if Data exist for that point in time");
         for(var i = 31;i <=40 ;i++){
            apix= ("api" + i);
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i=2,i).encodeABI()});
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(2,41).encodeABI()});
        vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
          }
        data = await oracle.getMinedBlockNum(1,res[0]);
        assert(data > 0, "Should be true if Data exist for that point in time");
         for(var i =41;i <=55 ;i++){
            apix= ("api" + i);
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i+2,i).encodeABI()});
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,56).encodeABI()});
        vars = await oracle.getVariablesOnDeck();
        let sapi = vars['2'];
        vars =  await oracle2.methods.getNewCurrentVariables().call()
        for(var i = 0;i<5;i++){
          res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
        data = await oracle.getMinedBlockNum(2,res[1]);
        assert(data > 0, "Should be true if Data exist for that point in time");
        apiVars = await oracle.getRequestVars(52)
        apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(50);
        vars = await oracle.getVariablesOnDeck();
        let apiOnQ = web3.utils.hexToNumberString(vars['0']);
        let apiPayout = web3.utils.hexToNumberString(vars['1']);
        sapi = vars['2'];
        apiIdforpayoutPoolIndex2 = await oracle.getRequestIdByRequestQIndex(49);
        assert(apiIdforpayoutPoolIndex == 53, "position 1 should be booted"); 
        assert(sapi == "api55", "API on Q string should be correct"); 
        assert(apiPayout == 55 , "API on Q payout should be 51"); 
        assert(apiOnQ == 57, "API on Q should be 51"); 
        assert(apiVars[5] == 50, "value at position 52 should have correct value"); 
        assert(apiIdforpayoutPoolIndex2 == 54, "position 2 should be in same place"); 
    });
    it("Test Throw on Multiple Disputes", async function () {
                  vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
          }
        balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[4]}));
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[1],web3.utils.toWei('5000', 'ether')).encodeABI()})
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,res[0],2).encodeABI()});
        await helper.expectThrow(web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,res[0],2).encodeABI()}));
        let miners =await oracle.getMinersByRequestIdAndTimestamp(1,res[0]);
        let _var = await oracle.getDisputeIdByDisputeHash( web3.utils.soliditySha3({t:'address',v:miners[2]},{t:'uint256',v:1},{t:'uint256',v:res[0]}));
        assert(_var == 1, "hash should be same");
    });
    it("Test Dispute of different miner Indexes", async function () {
        for(var i = 0;i<4;i++){
        	var k;
        	var j;
        	if(i>0){
        		j = i -1;
        		if(j>0){
	        		k = j -1;
	        	}
	        	else{
	        		k = 4;
        		}
        	}
        	else{
        		j = 4;
        		k = j -1;
        	}
	        oracle = await TellorMaster.new(oracleBase.address);
	        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);///will this instance work for logWatch? hopefully...
          vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
          }
          let miners =await oracle.getMinersByRequestIdAndTimestamp(1,res[0]);
	        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(miners[j],web3.utils.toWei('5000', 'ether')).encodeABI()})
	        await  web3.eth.sendTransaction({to: oracle.address,from:miners[j],gas:7000000,data:oracle2.methods.beginDispute(1,res[0],i).encodeABI()});
	        let disputeVars = await oracle.getAllDisputeVars(1);
	        let vals = await oracle.getSubmissionsByTimestamp(1,res[0]);
	        assert(disputeVars['0'] == web3.utils.soliditySha3({t:'address',v:miners[i]},{t:'uint256',v:1},{t:'uint256',v:res[0]}),"hash Should be correct");
	        assert(disputeVars['1'] == false);
	        assert(disputeVars['2'] == false);
	        assert(disputeVars['5'] == miners[j], "reporter should be correct");
	        assert(disputeVars['7'][0] == 1)
	        assert(disputeVars['7'][1] == res[0], "timestamp should be correct")
	        assert(disputeVars['7'][2] -  vals[i] == 0, "value should be correct")
	        assert(disputeVars['7'][4] == 0)
	        assert(disputeVars['7'][6] == i, "index should be correct")
	        assert(disputeVars['7'][7] == 0)
	        assert(disputeVars['8'] == 0, "Tally should be correct")
	        balance1 = await oracle.balanceOf(miners[i]);

	        assert(disputeVars['4'] == miners[i],"miner should be correct")
	        await web3.eth.sendTransaction({to: oracle.address,from:miners[k],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()});
	        await helper.advanceTime(86400 * 22);
	        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
	        if(i==2){
	        	assert(await oracle.isInDispute(1,res[0]) == true)
	        }
	        else{
	        	assert(await oracle.isInDispute(1,res[0]) == false,"isInDispute should be correct")
	        }
	         balance2 = await oracle.balanceOf(miners[i]);
	        assert(balance1 - balance2 == await oracle.getUintVar(web3.utils.keccak256("stakeAmount")),"reported miner's balance should change correctly");
	        s =  await oracle.getStakerInfo(miners[i])
        	assert(s[0] !=1, " Staked" );
	        }

    });
    it("Ensure Miner staked after failed dispute", async function () {
        vars =  await oracle2.methods.getNewCurrentVariables().call()
        for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        balance1 = await oracle.balanceOf(accounts[2]);
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[1],web3.utils.toWei('5000', 'ether')).encodeABI()})
        dispBal1 = await oracle.balanceOf(accounts[1])
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,res[0],2).encodeABI()});
        count = await await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()});
        await helper.advanceTime(86400 * 22);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
        balance2 = await oracle.balanceOf(accounts[2]);
        dispBal2 = await oracle.balanceOf(accounts[1])
        let df = await oracle.getUintVar(web3.utils.keccak256("disputeFee"));
        console.log(web3.utils.fromWei(balance2,"ether") - web3.utils.fromWei(balance1,"ether"),web3.utils.fromWei(df),'ether')
        assert(balance2 - balance1 == await oracle.getUintVar(web3.utils.keccak256("disputeFee")),"balance1 should equal balance2 plus disputeBal")
        assert(dispBal1 - dispBal2 == await oracle.getUintVar(web3.utils.keccak256("disputeFee")))
                s =  await oracle.getStakerInfo(accounts[2])
        assert(s[0] ==1, " Staked" );
    });
    
   it("Test failed Dispute of different miner Indexes", async function () {
       for(var i = 0;i<4;i++){
        	var k;
        	var j;
        	if(i>0){
        		j = i -1;
        		if(j>0){
	        		k = j -1;
	        	}
	        	else{
	        		k = 4;
        		}
        	}
        	else{
        		j = 4;
        		k = j -1;
        	}
        	oracle = await TellorMaster.new(oracleBase.address);
	        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);///will this instance work for logWatch? hopefully...
		 vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var i = 0;i<5;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
          }
          let miners =await oracle.getMinersByRequestIdAndTimestamp(1,res[0]);
	        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(miners[j],web3.utils.toWei('5000', 'ether')).encodeABI()})
	        await  web3.eth.sendTransaction({to: oracle.address,from:miners[j],gas:7000000,data:oracle2.methods.beginDispute(1,res[0],i).encodeABI()});
	        let disputeVars = await oracle.getAllDisputeVars(1);
	        balance1 = await oracle.balanceOf(miners[i]);
	        assert(disputeVars['4'] == miners[i],"miner should be correct")
	        await web3.eth.sendTransaction({to: oracle.address,from:miners[k],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()});
	        await helper.advanceTime(86400 * 22);
	        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
	        assert(await oracle.isInDispute(1,res[0]) == false)
	     	balance2 = await oracle.balanceOf(miners[i]);
	        assert(balance2-balance1 == await oracle.getUintVar(web3.utils.keccak256("disputeFee")),"reported miner's balance should change correctly");
	        s =  await oracle.getStakerInfo(miners[i])
        	assert(s[0] ==1, " Staked" );
	     }
    })

    // it("Test Proper zeroing of Payout Test", async function () {
    // 	vars =  await oracle2.methods.getNewCurrentVariables().call()
    //       for(var i = 0;i<5;i++){
    //         await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
    //       }
    //     vars = await oracle.getRequestVars(vars['1'][0])
    //     assert(vars['5'] == 0  , "api payout should be zero")
    //     vars = await oracle.getUintVar(web3.utils.keccak256("currentTotalTips"))
    //     assert(vars == 0, "api payout should be zero")
    // });
    // it("Test Same ID mining and OnQ", async function () {
    // 	  let vars =  await oracle2.methods.getNewCurrentVariables().call()
    //     for(var i = 0;i<5;i++){
    //       await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
    //     }
    //     await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,3).encodeABI()});
    //     await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,3).encodeABI()})
    //     await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,3).encodeABI()})
    //     vars  = await oracle2.methods.getNewCurrentVariables().call()
    //     assert(vars[1].includes('1') , "mining APIID is 1")
    //     vars = await oracle.getVariablesOnDeck();
    //     assert(vars[0] == 1, "apiOnQ is 1")
    //     vars =  await oracle2.methods.getNewCurrentVariables().call()
    //     for(var i = 0;i<5;i++){
    //         await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
    //     }
    //     assert(res['2'] == 0 , "last payout had a tip of 0")
    //     vars  = await  oracle.getCurrentVariables();
    //     assert(vars[1]==1, "mining APIID is 1")
    //     vars = await oracle.getVariablesOnDeck();
    //     assert(vars[0] == 0 , "apiOnQ is 0");
    //     vars =  await oracle2.methods.getNewCurrentVariables().call()
    //     for(var i = 0;i<5;i++){
    //         await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
    //     }
    //     assert(res['2'] == 5 , "last payout had a tip of 5")
    // });

 });    