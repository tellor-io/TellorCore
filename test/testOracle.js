// /** 
// * This tests the oracle functions, including mining.
// */
// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
// const BN = require('bn.js');
// const helper = require("./helpers/test_helpers");

// const Oracle = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
// var Reader = artifacts.require("Reader.sol");
// var oracleAbi = Oracle.abi;
// var oracleByte = Oracle.bytecode;

// var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
// var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";
// function promisifyLogWatch(_contract,_event) {
//   return new Promise((resolve, reject) => {
//     web3.eth.subscribe('logs', {
//       address: _contract.options.address,
//       topics:  ['0xba11e319aee26e7bbac889432515ba301ec8f6d27bf6b94829c21a65c5f6ff25']
//     }, (error, result) => {
//         if (error){
//           console.log('Error',error);
//           reject(error);
//         }
//         web3.eth.clearSubscriptions();
//         //console.log(result);
//         resolve(result);
//     })
//   });
// }

// contract('Mining Tests', function(accounts) {
//   let oracle;
//   let oracle2;
//   let owner;
//   let reader;
//   let logNewValueWatcher;
//   let logMineWatcher;

//     beforeEach('Setup contract for each test', async function () {
//         owner = accounts[0];
//         oracle = await Oracle.new();
//         oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);

//         //Deploy tellorStorage
//         tellorStorage= await TellorStorage.new();
//         //set tellorContract on tellor storage
//         await tellorStorage.setTellorContract(oracle.address);

//         await oracle.initStake();
//         await oracle.requestData(api,0);
//     });

    
//     it("getStakersCount", async function(){
//         let count = await oracle.stakers.call();
//         assert(web3.utils.hexToNumberString(count)==5, "count is 5");
//     });

//    it("getStakersInfo", async function(){
//         let info = await oracle.getStakerInfo(accounts[1]);
//         let stake = web3.utils.hexToNumberString(info['0']);
//         let startDate = web3.utils.hexToNumberString(info['1']);
//         let _date = new Date();
//         let d = (_date - (_date % 86400000))/1000;
//         assert(d*1==startDate, "startDate is today");
//         assert(stake*1 == 1, "Should be 1 for staked address");
//      });
    

//     it("getVariables", async function(){
//         var vars = await oracle.getVariables();
//         let miningApiId = web3.utils.hexToNumberString(vars['1']);
//         let difficulty = web3.utils.hexToNumberString(vars['2']);
//         let sapi = vars['3'];
//         assert(miningApiId == 1, "miningApiId should be 1");
//         assert(difficulty == 1, "Difficulty should be 1");
//         assert.equal(sapi,api, "sapi = api");
//     }); 

//     it("Test miner", async function () {
//         console.log('Oracle Address ',oracle.address);
//         console.log('START MINING RIG!!');
//         var val = await oracle.getVariables();
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data);
//         assert(res[2] > 0, "value should be positive");
//    });
//    it("Test 5 Mines", async function () {
//         for(var i = 0;i < 5;i++){
//             logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//             await oracle.requestData(api,0);
//         }
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data);
//         assert(res[2] > 0, "value should be positive");
//     });

//   it("Test Total Supply Increase", async function () {
//         initTotalSupply = await oracle.totalSupply();
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         newTotalSupply = await oracle.totalSupply();
//         payout = await oracle.payoutTotal.call();
//         it= await web3.utils.fromWei(initTotalSupply, 'ether');
//         ts= await web3.utils.fromWei(newTotalSupply, 'ether');
//         pt= await web3.utils.fromWei(payout, 'ether');            
//         assert((ts-it) == pt , "Difference should equal the payout");
//     });
//     it("Test Is Data", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
//         data = await oracle.isData(1,res[1]);
//         assert(data == true, "Should be true if Data exist for that point in time");
//     });
//     it("Test Get Last Query", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
//         res2 = await oracle.getLastQuery();
//         assert(res2 = res[2], "Ensure data exist for the last mine value");
//     });
    
//     it("Test Data Read", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
//         res2 = await oracle.retrieveData(1,res[1]);
//         console.log("data", res2);
//         assert(res2 = res[2], "Ensure data exist for the last mine value");
//     });
//    it("Test Miner Payout", async function () {
//         balances = []
//         for(var i = 0;i<6;i++){
//             balances[i] = await oracle.balanceOf(accounts[i]);
//             console.log("balance",i, web3.utils.hexToNumberString(balances[i]));
//         }
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         new_balances = []
//         for(var i = 0;i<6;i++){
//             new_balances[i] = await oracle.balanceOf(accounts[i]);
//             console.log("new balance",i, web3.utils.hexToNumberString(new_balances[i]));
//         }
//         assert((web3.utils.hexToNumberString(new_balances[5]) - web3.utils.hexToNumberString(balances[5])) == web3.utils.toWei('1', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[1]) - web3.utils.hexToNumberString(balances[1])) == web3.utils.toWei('5', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[2]) - web3.utils.hexToNumberString(balances[2])) == web3.utils.toWei('10', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[3]) - web3.utils.hexToNumberString(balances[3])) == web3.utils.toWei('5', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[4]) - web3.utils.hexToNumberString(balances[4])) == web3.utils.toWei('1', 'ether'));
//         //assert((web3.utils.hexToNumberString(new_balances[4]) - web3.utils.hexToNumberString(balances[4])) == web3.utils.toWei('1.1', 'ether'));
//     });
    
//    it("Test Difficulty Adjustment", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         diff1 = await oracle.getVariables();
//         console.log("diff1", web3.utils.hexToNumberString(diff1[2]));
//         assert((web3.utils.hexToNumberString(diff1[2])*1) > 1, "difficulty greater than 1");//difficulty not changing.....
//         await oracle.requestData(api,0);
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         vars = await oracle.getVariables();
//         console.log("diff2", web3.utils.hexToNumberString(vars[2]));
//         assert((web3.utils.hexToNumberString(vars[2])*1) > (web3.utils.hexToNumberString(diff1[2])*1), "difficulty should continue to move up");
//     });
//     it("Test didMine ", async function () {
//         vars = await oracle.getVariables();
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         didMine = oracle.didMine(vars[0],accounts[1]);
//         assert(didMine);
//     });

//     it("Test Get MinersbyValue ", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
//         miners = await oracle.getMinersByValue(1, res[1]);
//         assert(miners = [accounts[4],accounts[3],accounts[2],accounts[1],accounts[5]])
//     });
//     it("Test dev Share", async function(){
//         begbal = await oracle.balanceOf(accounts[0]);
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         endbal = await oracle.balanceOf(accounts[0]);
//         assert((endbal - begbal)/1e18  == 2.2, "devShare")
//     }); 
//     it("Test miner, alternating api request on Q and auto select", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         await oracle.requestData(api,0);
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         await oracle.requestData(api,1,{from:accounts[2]});
//         data = await oracle.getVariablesOnQ();
//         assert(data[0] == 0, 'There should be no API on Q');
//         var vars = await oracle.getVariables();
//         assert(vars[1] == 1, "miningApiId should be 1");
//         await oracle.requestData(api2,5,{from:accounts[2]});
//         data = await oracle.getVariablesOnQ();
//         assert(data[0] == 2, "API on q should be #2");
//         await oracle.requestData(api,6,{from:accounts[2]});
//         data = await oracle.getVariablesOnQ();
//         assert(data[0] == 1, "API on q should be #1");
//     });
//     it("Test dispute", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
//         balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[4]}));
//         blocknum = await oracle.getMinedBlockNum(res[0],res[1]);
//         await oracle.initDispute(res[0],res[1], {from:accounts[1]});
//         count = await oracle.countDisputes();
//         await oracle.vote(1, true, {from:accounts[3]});
//         await helper.advanceTime(86400 * 22);
//         await oracle.tallyVotes(1);
//         dispInfo = await oracle.getDisputeInfo(1);
//         assert(dispInfo[0] == res[0])
//         assert(dispInfo[1] == res[1])
//         assert(dispInfo[2] == res[2])
//         assert(dispInfo[3] == true,"Dispute Vote passed")
//         voted = await oracle.didVote(1, accounts[3]);
//         assert(voted == true, "account 3 voted");
//         voted = await oracle.didVote(1, accounts[5]);
//         assert(voted == false, "account 5 did not vote");
//         alldisp = await oracle.getDisputesIds();
//         assert(alldisp.length == 1, "Dispute ids should be correct")
//         assert(alldisp[0] == 1, "Dispute ids should be correct")
//         apid2valueF = await oracle.retrieveData(res[0],res[1]);
//         assert(apid2valueF == 0 ,"value should now be zero this checks updateDisputeValue-internal fx  works");
//         balance2 = await (oracle.balanceOf(accounts[2],{from:accounts[4]}));
//     });

//     it("Test time travel in data -- really long timesincelastPoof and proper difficulty adjustment", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         vars = await oracle.getVariables();
//         console.log("vars", web3.utils.hexToNumberString(vars[2]));
//         assert((web3.utils.hexToNumberString(vars[2])*1) > 1, "difficulty should be greater than 1");//difficulty not changing.....
//         await oracle.requestData(api,0);
//         await helper.advanceTime(86400 * 20);
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         vars = await oracle.getVariables();
//         assert((web3.utils.hexToNumberString(vars[2])*1) == 1,"difficulty should be 1 now");
//     });
//     it("Test 50 requests, proper booting, and mining of 5", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');
//         await oracle.requestData(api2,0, {from:accounts[2]});
//         console.log("10 then mine requests....");
//          for(var i = 1;i <=10 ;i++){
//             apix= ("api" + i);
//             await oracle.requestData(apix,i, {from:accounts[2]});
//         }
//         await oracle.requestData(api,11, {from:accounts[2]});
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
//         data = await oracle.isData(2,res[1]);

//         assert(data == true, "Should be true if Data exist for that point in time");
//         console.log("10 then mine requests....");
//          for(var i = 11;i <=20 ;i++){
//             apix= ("api" + i);
//             await oracle.requestData(apix,i, {from:accounts[2]});
//         }
//         await oracle.requestData(api2,21, {from:accounts[2]});
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
//         data = await oracle.isData(1,res[1]);
//         assert(data == true, "Should be true if Data exist for that point in time");
//         console.log("10 then mine requests....");
//          for(var i = 21;i <=30 ;i++){
//             apix= ("api" + i);
//             await oracle.requestData(apix,i, {from:accounts[2]});
//         }
//         await oracle.requestData(api,31, {from:accounts[2]});
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
//         data = await oracle.isData(2,res[1]);
//         assert(data == true, "Should be true if Data exist for that point in time");
//         console.log("10 then mine requests....");
//          for(var i = 31;i <=40 ;i++){
//             apix= ("api" + i);
//             await oracle.requestData(apix,i, {from:accounts[2]});
//         }
//         await oracle.requestData(api2,41, {from:accounts[2]});
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
//         data = await oracle.isData(1,res[1]);
//         assert(data == true, "Should be true if Data exist for that point in time");
//         console.log("10 then mine requests....");
//          for(var i =41;i <=55 ;i++){
//             apix= ("api" + i);
//             await oracle.requestData(apix,i, {from:accounts[2]});
//         }
//         await oracle.requestData(api,56, {from:accounts[2]});
//         vars = await oracle.getVariablesOnQ();
//         let sapi = vars['2'];
//         console.log(sapi);
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
//         data = await oracle.isData(2,res[1]);
//         assert(data == true, "Should be true if Data exist for that point in time");
//         payoutP = await oracle.getValuePoolAt(52);
//         apiIdforpayoutPoolIndex = await oracle.getpayoutPoolIndexToApiId(50);
//         vars = await oracle.getVariablesOnQ();
//         let apiOnQ = web3.utils.hexToNumberString(vars['0']);
//         let apiPayout = web3.utils.hexToNumberString(vars['1']);
//         sapi = vars['2'];
//         console.log(apiOnQ,apiPayout,sapi);
//         apiIdforpayoutPoolIndex2 = await oracle.getpayoutPoolIndexToApiId(49);
//         assert(apiIdforpayoutPoolIndex == 53, "position 1 should be booted"); 
//         assert(sapi == "api55", "API on Q string should be correct"); 
//         assert(apiPayout == 55 , "API on Q payout should be 51"); 
//         assert(apiOnQ == 57, "API on Q should be 51"); 
//         assert(payoutP == 50, "value at position 52 should have correct value"); 
//         assert(apiIdforpayoutPoolIndex2 == 54, "position 2 should be in same place"); 
//     });
    
//     it("Test 404 api request", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');//or Event Mine?
//         await oracle.requestData("api2",41, {from:accounts[2]});
//         logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue');
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
//         data = await oracle.isData(1,res[1]);
//         assert(res['2'] == 0, "Data should be zero");
//     });

// });