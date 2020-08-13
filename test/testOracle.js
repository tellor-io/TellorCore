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
        oldTellor = await OldTellor.new()    
        oracle = await TellorMaster.new(oldTellor.address);
        master = await new web3.eth.Contract(masterAbi,oracle.address);
        oldTellorinst = await new web3.eth.Contract(oldTellorABI,oldTellor.address);
        for(var i = 0;i<6;i++){
            await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.theLazyCoon(accounts[i],web3.utils.toWei('5000', 'ether')).encodeABI()})
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

  //   it("test utilities",async function(){
  //       var myArr = []
  //       for(var i=50;i>=0;i--){
  //           myArr.push(i)
  //       }
  //       utilities = await UtilitiesTests.new(oracle.address)
  //       top5N = await utilities.testgetMax5(myArr)
  //       let q = await oracle.getRequestQ();
  //       for(var i=0;i<5;i++){
  //           assert(top5N['_max'][i] == myArr[i+1])
  //           assert(top5N['_index'][i] == i+1)
  //       }

  //   });
  //   it("getVariables", async function(){
  //       vars = await web3.eth.call({to:oracle.address,from:accounts[0],data:oracle2.methods.getNewCurrentVariables().encodeABI()})
        
  //       vars =  await oracle2.methods.getNewCurrentVariables().call()
  //       assert(vars['1'].length == 5, "ids should be populated");
  //       assert(vars['2'] > 0, "difficulty should be correct")
  //       assert(vars['3'] > 0, "tip should be correct");  
  //   });
  //   it("getTopRequestIDs", async function(){
  //       vars = await oracle2.methods.getTopRequestIDs().call()
  //       for(var i = 0;i<5;i++){
  //           assert(vars[0]= i+6)
  //       }
  //   });
  //   it("Test miner", async function () {
  //       for(var i = 0;i<5;i++){
  //           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:10000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
  //       }
  //       vars = await oracle.getLastNewValueById(5);
  //       assert(vars[0] > 0, "value should be positive");
  //       assert(vars[1] == true, "value should be there")
  //  });
  //   it("Test Miner decreasing payout", async function () {
  //       balances = []
  //       for(var i = 0;i<6;i++){
  //           balances[i] = await oracle.balanceOf(accounts[i]);
  //       }
  //       for(var i = 0;i<5;i++){
  //           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
  //       }
  //       new_balances = []
  //       for(var i = 0;i<6;i++){
  //           new_balances[i] = await oracle.balanceOf(accounts[i]);
  //       }
  //       changes = []
  //               for(var i = 0;i<6;i++){
  //           changes[i] = new_balances[i] - balances[i]
  //       }
  //       vars =  await oracle2.methods.getNewCurrentVariables().call()
  //       for(var i = 0;i<5;i++){
  //           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
  //       }
  //       new_balances2 = []
  //       for(var i = 0;i<6;i++){
  //           new_balances2[i] = await oracle.balanceOf(accounts[i]);
  //       }
  //       changes2 = []
  //       for(var i = 0;i<6;i++){
  //           changes2[i] = new_balances2[i] - new_balances[i]
  //       }
  //       assert(changes2[1] < changes[1]);
  //       assert(changes2[2] < changes[2]);
  //       assert(changes2[3] < changes[4]);
  //       assert(changes2[4] < changes[4]);
  //       assert(changes2[0] < changes[0], "miner payout should be decreasing");
  //   });
  //  it("Test Difficulty Adjustment", async function () {
  //       for(var i = 0;i<5;i++){
  //           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
  //       }
  //       diff1 =await oracle2.methods.getNewCurrentVariables().call()
  //       assert(diff1[2] > 1, "difficulty greater than 1");//difficulty not changing.....
  //       vars =  await oracle2.methods.getNewCurrentVariables().call()
  //       for(var i = 0;i<5;i++){
  //           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
  //       }
  //       vars = await oracle2.methods.getNewCurrentVariables().call()
  //       assert(vars[2] > diff1[2], "difficulty should continue to move up");
  //   });
  //   it("Test Get MinersbyValue ", async function () {
  //       let res;
  //       for(var i = 0;i<5;i++){
  //           res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
  //       }    
  //       res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
  //       var miners = await oracle.getMinersByRequestIdAndTimestamp(1, res[1]);
  //       for(var i=0;i<5;i++){
  //       	assert(miners[i] == accounts[i], "miner should be correct")
  //       }
  //   });
    
  //   it("Test dev Share", async function(){
  //       begbal = await oracle.balanceOf(accounts[0]);
  //       for(var i = 1;i<6;i++){
  //           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
  //       }
  //       endbal = await oracle.balanceOf(accounts[0]);
  //       assert((endbal - begbal)/1e18  >= 1.2, "devShare")
  //       assert((endbal - begbal)/1e18  <= 1.25, "devShare2")
  //   }); 

  //   it("Test miner, alternating api request on Q and auto select", async function () {
  //       for(var i = 0;i<5;i++){
  //           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
  //       }
  //       vars =  await oracle2.methods.getNewCurrentVariables().call()
  //       for(var i = 0;i<5;i++){
  //           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
  //       }
  //       await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(30,1000).encodeABI()});  
  //       data = await oracle2.methods.getNewVariablesOnDeck().call();
  //       assert(data[0].includes('30'), 'ID on deck should be 30');
  //       assert(data[1][2] >1000, 'Tip should be over 1000');
  //       await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(31,2000).encodeABI()});
  //       data = await oracle2.methods.getNewVariablesOnDeck().call();
  //        var x=0;
  //        for(var i =0;i<5;i++){
  //        	if(data[0][i] == 30){
  //        		assert(data[1][i] >1000)
  //        		x++;
  //        	}
  //        	else if(data[0][i]==31){
  //        		assert(data[1][i]>2000)
  //        		x++
  //        	}
  //        }
  //       assert(x==2);
  //   });


  //   it("Test dispute", async function () {
  //       for(var i = 0;i<5;i++){
  //           res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
  //       }
  //       res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
  //       balance1 = await oracle.balanceOf(accounts[2]);
  //       await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[1],web3.utils.toWei('5000', 'ether')).encodeABI()})
  //       dispBal1 = await oracle.balanceOf(accounts[1])
  //       await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,res[1],2).encodeABI()});
  //       count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
  //       await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()});
  //       await helper.advanceTime(86400 * 22);
  //       await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
  //       await helper.advanceTime(86400 * 2 )
  //     	await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(1).encodeABI()})
  //     	dispInfo = await oracle.getAllDisputeVars(1);
  //       assert(dispInfo[7][0] == 1)
  //       assert(dispInfo[7][1] == res[1])
  //       assert(dispInfo[7][2] == 1200)
  //       assert(dispInfo[2] == true,"Dispute Vote passed")
  //       voted = await oracle.didVote(1, accounts[3]);
  //       assert(voted == true, "account 3 voted");
  //       voted = await oracle.didVote(1, accounts[5]);
  //       assert(voted == false, "account 5 did not vote");
  //       apid2valueF = await oracle.retrieveData(1,res[1]);
  //       assert(apid2valueF == 0 ,"value should now be zero this checks updateDisputeValue-internal fx  works");
  //       balance2 = await oracle.balanceOf(accounts[2]);
  //       dispBal2 = await oracle.balanceOf(accounts[1])
		// assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 1000 ,"reported miner's balance should change correctly");
  //       assert(web3.utils.fromWei(dispBal2) - web3.utils.fromWei(dispBal1) == 1000, "disputing party's balance should change correctly")
  //       s =  await oracle.getStakerInfo(accounts[2])
  //       assert(s != 1, " Not staked" );
  //   });
//     it("Test multiple dispute to the same miner", async function () {
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[0],web3.utils.toWei('5000', 'ether')).encodeABI()})
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[2],web3.utils.toWei('5000', 'ether')).encodeABI()})
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[4],web3.utils.toWei('5000', 'ether')).encodeABI()})
//         resVars = []
//         for(j=0;j<5;j++){
//           await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.addTip(1,1000).encodeABI()});
//             vars =  await oracle2.methods.getNewCurrentVariables().call()
//             for(var i = 0;i<5;i++){
//                 res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//             }
//             resVars[j] = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
//             await helper.advanceTime(1000);
//         }
//         balance1 = await oracle.balanceOf(accounts[1]);
//           console.log('reported miner', web3.utils.fromWei(balance1))
//          dispBal1 = await oracle.balanceOf(accounts[2])
//          console.log('disputer', web3.utils.fromWei(dispBal1))
//         orig_dispBal4 = await oracle.balanceOf(accounts[4])
//         //1st dispute to miner
//         await  web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[0][1],1).encodeABI()});
//         count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
//         await  web3.eth.sendTransaction({to: oracle.address,from:accounts[4],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[2][1],1).encodeABI()});
//         count2 = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));

//         //3rd dispute to same miner
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[4][1],1).encodeABI()});
//         count2 = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
//         //dispute votes and tally
//                 await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()});
//                 await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(2,true).encodeABI()});
//                 await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(3,true).encodeABI()});
//         await helper.advanceTime(86400 * 22);
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(2).encodeABI()});
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(3).encodeABI()});
//         await helper.advanceTime(86400 * 2 )
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(1).encodeABI()})
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(2).encodeABI()})
//       await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(3).encodeABI()})
//       dispInfo = await oracle.getAllDisputeVars(1);
//         assert(dispInfo[7][0] == 1)
//         assert(dispInfo[7][1] == resVars[0][1])
//         assert(dispInfo[7][2] == 1200)
//         assert(dispInfo[2] == true,"Dispute Vote passed")
//         voted = await oracle.didVote(1, accounts[3]);
//         assert(voted == true, "account 3 voted");
//         voted = await oracle.didVote(1, accounts[5]);
//         assert(voted == false, "account 5 did not vote");
//         apid2valueF = await oracle.retrieveData(1,resVars[0][1]);
//         assert( apid2valueF*1 > 0 ,"value should not be zero since the disputed miner index is not 2/official value this checks updateDisputeValue-internal fx  works");

//         //checks balances after dispute 1
//         balance2 = await oracle.balanceOf(accounts[1]);
//         console.log('reported miner', web3.utils.fromWei(balance2))
//         dispBal2 = await oracle.balanceOf(accounts[2])
//         console.log(web3.utils.fromWei(balance1),web3.utils.fromWei(balance2))
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) >999,"reported miner's balance should change correctly");
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) <1001,"reported miner's balance should change correctly");
//         assert(web3.utils.fromWei(dispBal2)- web3.utils.fromWei(dispBal1) == 1000, "disputing party's balance should change correctly")
//         s =  await oracle.getStakerInfo(accounts[1])
//         assert(s != 1, " Not staked" );
//     dispBal4 = await oracle.balanceOf(accounts[4])
//         assert(dispBal4 - orig_dispBal4 == 0,"a4 shouldn't change'")
//          });

//     it("Test multiple dispute to official value/miner index 2", async function () {
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[0],web3.utils.toWei('5000', 'ether')).encodeABI()})
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[1],web3.utils.toWei('5000', 'ether')).encodeABI()})
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[4],web3.utils.toWei('5000', 'ether')).encodeABI()})
//         resVars = []
//         for(j=0;j<5;j++){
//           await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.addTip(1,1000).encodeABI()});
//             vars =  await oracle2.methods.getNewCurrentVariables().call()
//             for(var i = 0;i<5;i++){
//                 res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//             }
//             resVars[j] = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
//             await helper.advanceTime(1000);
//         }
//                 balance1 = await oracle.balanceOf(accounts[2]);
//          dispBal1 = await oracle.balanceOf(accounts[1])
//         orig_dispBal4 = await oracle.balanceOf(accounts[4])
//         //1st dispute to miner
//         await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[0][1],2).encodeABI()});
//         count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
//         //2nd dispute to same miner
//         console.log("2")
//         await  web3.eth.sendTransaction({to: oracle.address,from:accounts[4],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[2][1],2).encodeABI()});
//         count2 = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));

//         //3rd dispute to same miner
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[4][1],2).encodeABI()});
//         count2 = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
//         //dispute votes and tally
//                 await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()});
//                 await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(2,true).encodeABI()});
//                 await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(3,true).encodeABI()});
//         await helper.advanceTime(86400 * 22);
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(2).encodeABI()});
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(3).encodeABI()});
//         await helper.advanceTime(86400 * 2 )
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(1).encodeABI()})
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(2).encodeABI()})
//       await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(3).encodeABI()})
//       dispInfo = await oracle.getAllDisputeVars(1);
//         assert(dispInfo[7][0] == 1)
//         assert(dispInfo[7][1] == resVars[0][1])
//         assert(dispInfo[7][2] == 1200)
//         assert(dispInfo[2] == true,"Dispute Vote passed")
//         voted = await oracle.didVote(1, accounts[3]);
//         assert(voted == true, "account 3 voted");
//         voted = await oracle.didVote(1, accounts[5]);
//         assert(voted == false, "account 5 did not vote");
//         apid2valueF = await oracle.retrieveData(1,resVars[0][1]);
//         assert(apid2valueF == 0 ,"value should now be zero this checks updateDisputeValue-internal fx  works");
//         //checks balances after dispute 1
//         balance2 = await oracle.balanceOf(accounts[2]);
//         dispBal2 = await oracle.balanceOf(accounts[1])
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) > 999.99,"reported miner's balance should change correctly");
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) <=1000,"reported miner's balance should change correctly");
//         assert(web3.utils.fromWei(dispBal2)- web3.utils.fromWei(dispBal1) == 1000, "disputing party's balance should change correctly")
//         s =  await oracle.getStakerInfo(accounts[2])
//         assert(s != 1, " Not staked" );
//     dispBal4 = await oracle.balanceOf(accounts[4])
//         assert(dispBal4 - orig_dispBal4 == 0,"a4 shouldn't change'")
//          });





//    it("Test time travel in data -- really long timesincelastPoof and proper difficulty adjustment", async function () {
//         for(var j = 0; j<6;j++){
//           vars =  await oracle2.methods.getNewCurrentVariables().call()
//           await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.addTip(1,500).encodeABI()})
//           for(var i = 0;i<5;i++){
//             await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//           }
//         }   
//         vars = await oracle2.methods.getNewCurrentVariables().call()
//         var oldDiff = vars[2]
//         assert(vars[2] > 1, "difficulty should be greater than 1");//difficulty not changing.....
//     await helper.advanceTime(86400 * 20);
//         vars =  await oracle2.methods.getNewCurrentVariables().call()
//           for(var i = 0;i<5;i++){
//             await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//           }
//         vars = await oracle2.methods.getNewCurrentVariables().call()
//         var newDiff = vars[2]
//         assert( newDiff < oldDiff,"difficulty should be lower");
//         assert(await oracle.getNewValueCountbyRequestId(1) == 5, "Request ID 1 should have 8 mines");
//     });

// //index 2 dispute fee updates
//     it("Test multiple dispute to official value/miner index 2", async function () {
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[0],web3.utils.toWei('5000', 'ether')).encodeABI()})
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[1],web3.utils.toWei('5000', 'ether')).encodeABI()})
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[4],web3.utils.toWei('5000', 'ether')).encodeABI()})
//         resVars = []
//         for(j=0;j<5;j++){
//           await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.addTip(1,1000).encodeABI()});
//             vars =  await oracle2.methods.getNewCurrentVariables().call()
//             for(var i = 0;i<5;i++){
//                 res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//             }
//             resVars[j] = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
//             await helper.advanceTime(1000);
//         }
//                 balance1 = await oracle.balanceOf(accounts[2]);
//          dispBal1 = await oracle.balanceOf(accounts[1])
//         orig_dispBal4 = await oracle.balanceOf(accounts[4])
//         //1st dispute to miner
//         await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[0][1],2).encodeABI()});
//         count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
//         await  web3.eth.sendTransaction({to: oracle.address,from:accounts[4],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[2][1],2).encodeABI()});
//         count2 = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.beginDispute(1,resVars[4][1],2).encodeABI()});
//         count2 = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
//         //dispute votes and tally
//                 await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()});
//                 await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(2,true).encodeABI()});
//                 await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(3,true).encodeABI()});
//         await helper.advanceTime(86400 * 22);
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(2).encodeABI()});
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(3).encodeABI()});
//         await helper.advanceTime(86400 * 2 )
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(1).encodeABI()})
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(2).encodeABI()})
//       await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(3).encodeABI()})
//       dispInfo = await oracle.getAllDisputeVars(1);
//         assert(dispInfo[7][0] == 1)
//         assert(dispInfo[7][1] == resVars[0][1])
//         assert(dispInfo[7][2] == 1200)
//         assert(dispInfo[2] == true,"Dispute Vote passed")
//         voted = await oracle.didVote(1, accounts[3]);
//         assert(voted == true, "account 3 voted");
//         voted = await oracle.didVote(1, accounts[5]);
//         assert(voted == false, "account 5 did not vote");
//         apid2valueF = await oracle.retrieveData(1,resVars[0][1]);
//         assert(apid2valueF == 0 ,"value should now be zero this checks updateDisputeValue-internal fx  works");
//         //checks balances after dispute 1
//         balance2 = await oracle.balanceOf(accounts[2]);
//         dispBal2 = await oracle.balanceOf(accounts[1])
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) >999,"reported miner's balance should change correctly");
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) <1001,"reported miner's balance should change correctly");
//         assert(web3.utils.fromWei(dispBal2)- web3.utils.fromWei(dispBal1) == 1000, "disputing party's balance should change correctly")
//         s =  await oracle.getStakerInfo(accounts[2])
//         assert(s != 1, " Not staked" );
//     dispBal4 = await oracle.balanceOf(accounts[4])
//         assert(dispBal4 - orig_dispBal4 == 0,"a4 shouldn't change'")
//          });
//    it("Test time travel in data -- really long timesincelastPoof and proper difficulty adjustment", async function () {
//         for(var j = 0; j<6;j++){
//           vars =  await oracle2.methods.getNewCurrentVariables().call()
//           await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.addTip(1,500).encodeABI()})
//           for(var i = 0;i<5;i++){
//             await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//           }
//         }   
//         vars = await oracle2.methods.getNewCurrentVariables().call()
//         var oldDiff = vars[2]
//         assert(vars[2] > 1, "difficulty should be greater than 1");//difficulty not changing.....
// 		await helper.advanceTime(86400 * 20);
//         vars =  await oracle2.methods.getNewCurrentVariables().call()
//           for(var i = 0;i<5;i++){
//             await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//           }
//         vars = await oracle2.methods.getNewCurrentVariables().call()
//         var newDiff = vars[2]
//         assert( newDiff < oldDiff,"difficulty should be lower");
//         assert(await oracle.getNewValueCountbyRequestId(1) == 5, "Request ID 1 should have 8 mines");
//     });
//     it("Test 50 requests, proper booting, and mining of 5", async function () {
//           vars =  await oracle2.methods.getNewCurrentVariables().call()
//           for(var i = 0;i<5;i++){
//             await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//           }
//          for(var i = 1;i <=10 ;i++){
//             apix= ("api" + i);
//             await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i+2,i).encodeABI()});
//         }
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,11).encodeABI()});
//         vars =  await oracle2.methods.getNewCurrentVariables().call()
//         for(var i = 0;i<5;i++){
//           res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//         }
//         res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
//         data = await oracle.getMinedBlockNum(2,res[1]);
//         assert(data>0, "Should be true if Data exist for that point in time");
//          for(var i = 11;i <=20 ;i++){
//             apix= ("api" + i);
//             await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i+2,i).encodeABI()});
//         }
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(2,21).encodeABI()});
//         vars =  await oracle2.methods.getNewCurrentVariables().call()
//           for(var i = 0;i<5;i++){
//             res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//         }
//         res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
//         data = await oracle.getMinedBlockNum(1,res[1]);
//         assert(data > 0, "Should be true if Data exist for that point in time");
//          for(var i = 21;i <=30 ;i++){
//             apix= ("api" + i);
//             await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i+2,i).encodeABI()});
//         }
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,31).encodeABI()});
//         vars =  await oracle2.methods.getNewCurrentVariables().call()
//           for(var i = 0;i<5;i++){
//             res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//           }
//           res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
//         data = await oracle.getMinedBlockNum(2,res[1]);
//         assert(data > 0, "Should be true if Data exist for that point in time");
//          for(var i=31;i<=40;i++){
//             await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i+2,i).encodeABI()});
//         }
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(2,41).encodeABI()});
//         vars =  await oracle2.methods.getNewCurrentVariables().call()
//           for(var i = 0;i<5;i++){
//             res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//           }
//           res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
//         data = await oracle.getMinedBlockNum(1,res[1]);
//         assert(data > 0, "Should be true if Data exist for that point in time");
//          for(var i =41;i <=55 ;i++){
//             apix= ("api" + i);
//             await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i+2,i).encodeABI()});
//         }
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,56).encodeABI()});
//         vars =  await oracle2.methods.getNewCurrentVariables().call()
//         for(var i = 0;i<5;i++){
//           res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
//         }
//         res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
//         data = await oracle.getMinedBlockNum(2,res[1]);
//         assert(data > 0, "Should be true if Data exist for that point in time");
//         apiVars = await oracle.getRequestVars(52)
//         apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(50);
//         vars = await oracle2.methods.getNewVariablesOnDeck().call();
//         let apiOnQ = vars['0'];
//         apiIdforpayoutPoolIndex2 = await oracle.getRequestIdByRequestQIndex(49);
//         assert(apiIdforpayoutPoolIndex == 1, "position 1 should be booted"); 
//         assert(vars['1'].includes('51') , "API on Q payout should be 51"); 
//         assert(apiOnQ.includes('51'), "API on Q should be 51"); 
//         assert(apiVars[5] == 51, "value at position 52 should have correct value"); 
//         assert(apiIdforpayoutPoolIndex2 == 3, "position 2 should be in same place"); 
//     });
    it("Test Throw on Multiple Disputes", async function () {
                  vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var i = 0;i<5;i++){
            res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
          }
          res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
        balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[4]}));
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[1],web3.utils.toWei('5000', 'ether')).encodeABI()})
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,res[1],2).encodeABI()});
        await helper.expectThrow(web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,res[1],2).encodeABI()}));
        let miners =await oracle.getMinersByRequestIdAndTimestamp(1,res[1]);

		let disp = await oracle.getAllDisputeVars(1);
        let _var = await oracle.getDisputeIdByDisputeHash(web3.utils.soliditySha3({t:'address',v:miners[2]},{t:'uint256',v:1},{t:'uint256',v:res[1]}));
        assert(_var == 1, "hash should be same");
    });
    it("Ensure Miner staked after failed dispute", async function () {
        vars =  await oracle2.methods.getNewCurrentVariables().call()
        for(var i = 0;i<5;i++){
            res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
        balance1 = await oracle.balanceOf(accounts[2]);
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[1],web3.utils.toWei('5000', 'ether')).encodeABI()})
        dispBal1 = await oracle.balanceOf(accounts[1])
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.beginDispute(1,res[1],2).encodeABI()});
        count = await await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()});
        await helper.advanceTime(86400 * 22);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
        await helper.advanceTime(86400 * 2 )
      	await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(1).encodeABI()})
      	balance2 = await oracle.balanceOf(accounts[2]);
        dispBal2 = await oracle.balanceOf(accounts[1])
        let df = await oracle.getUintVar(web3.utils.keccak256("disputeFee"));
        assert(web3.utils.fromWei(balance2) - web3.utils.fromWei(balance1) == 1000,"balance1 should equal balance2 plus disputeBal")
        assert(web3.utils.fromWei(dispBal1) - web3.utils.fromWei(dispBal2) == 1000,"disputers balance shoudl change properly")
                s =  await oracle.getStakerInfo(accounts[2])
        assert(s[0] ==1, " Staked" );
    });
    
   it("Test failed Dispute of different miner Indexes", async function () {
       for(var i = 1;i<5;i++){
			vars =  await oracle2.methods.getNewCurrentVariables().call()
          for(var ii = 1;ii<6;ii++){
            res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[ii],gas:7000000,data:oracle2.methods.testSubmitMiningSolution("nonce",vars['1'],[1200,1300,1400,1500,1600]).encodeABI()})
          }
          res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.logs['2'].data)
          let miners =await oracle.getMinersByRequestIdAndTimestamp(vars['1'][0],res[1]);
	        	await  web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.beginDispute(vars['1'][0],res[1],i-1).encodeABI()});
	        let disputeVars = await oracle.getAllDisputeVars(i);
	        balance1 = await oracle.balanceOf(miners[i-1]);
	        assert(disputeVars['4'] == miners[i-1],"miner should be correct")
	        await web3.eth.sendTransaction({to: oracle.address,from:accounts[i+1],gas:7000000,data:oracle2.methods.vote(i,false).encodeABI()});
	        await helper.advanceTime(86400 * 7);
	        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(i).encodeABI()});
	        await helper.advanceTime(86400 * 2 )
      		await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:9000000,data:oracle2.methods.unlockDisputeFee(i).encodeABI()})
      		assert(await oracle.isInDispute(vars['1'][0],res[1]) == false)
	     	balance2 = await oracle.balanceOf(miners[i-1]);
	     	dispVars = await oracle.getAllDisputeVars(i)
	        assert(web3.utils.fromWei(balance2)-web3.utils.fromWei(balance1) == web3.utils.fromWei(dispVars[7][8]),"reported miner's balance should change correctly");
	        s =  await oracle.getStakerInfo(miners[i-1])
        	assert(s[0] ==1, " Staked" );
	     }
    })
 });    