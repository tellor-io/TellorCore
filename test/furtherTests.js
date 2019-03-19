// /** 
// * This contract tests the Oracle functions
// */ 

// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
// const BN = require('bn.js');
// const helper = require("./helpers/test_helpers");
// //const ethers = require('ethers');

// const Oracle = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
// var Reader = artifacts.require("Reader.sol");
// var oracleAbi = Oracle.abi;
// var oracleByte = Oracle.bytecode;

// var api = 'json(https://api.gdax.com/products/BTC-USD/ticker).price';
// var api2 = 'json(https://api.gdax.com/products/ETH-USD/ticker).price';

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

// contract('Further Tests', function(accounts) {
//   let oracle;
//   let oracle2;
//   let owner;
//   let reader;
//   let logNewValueWatcher;
//   let logMineWatcher;
//   let res0;

//     beforeEach('Setup contract for each test', async function () {
//         owner = accounts[0];
//         oracle = await Oracle.new();
//         oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);

//         //Deploy tellorStorage
//         tellorStorage= await TellorStorage.new();
//         //set tellorContract on tellor storage
//         await tellorStorage.setTellorContract(oracle.address); 

//         await oracle.initStake();
//         res0 = await oracle.requestData(api,0);
//         await helper.advanceTime(86400 * 8);
//         let withdrawreq = await oracle.requestWithdraw({from:accounts[2]});
//         await helper.advanceTime(86400 * 8);
//         await oracle.withdrawStake({from:accounts[2]});
//    });  
//     it("transferOwnership", async function () {
//         let checkowner = await oracle.owner();
//         console.log("init owner", checkowner);
//         console.log("acct 0", accounts[0] );
//         assert(checkowner == accounts[0], "initial owner acct 0");
//         await oracle.transferOwnership(accounts[2], {from:accounts[0] } );
//         checkowner = await oracle.owner();
//         assert(checkowner == accounts[2], "initial owner acct 2");
//    });

//     it("Request data", async function () {
//         let res = await oracle.requestData(api2, 20, {from:accounts[2]});
//         let resSapi = await res.logs[2].args._sapi;
//         let resApiHash = await res.logs[2].args._apiHash;
//         let resApiId = await res.logs[2].args._apiId;
//         apiId = await oracle.getApiId(resApiHash);  
//         let valuePool = await oracle.getValuePoolAt(resApiId);
//         assert( web3.utils.hexToNumberString(valuePool) == 20, "value pool should be 20");
//         let apionQ = await res.logs[1].args._apiOnQ;
//         let apiIdonQ = await res.logs[1].args._apiId;
//         let apiOnQPayout = await res.logs[1].args._apiOnQPayout;
//         assert(web3.utils.hexToNumberString(apiOnQPayout) == 20, "Current payout on Q should be 20");
//         assert(web3.utils.hexToNumberString(apionQ) == web3.utils.hexToNumberString(resApiHash), "api on Q should be apiId");
//         assert(web3.utils.hexToNumberString(apiIdonQ) == web3.utils.hexToNumberString(resApiId), "timestamp on Q should be apiID");
//     });

//     it("several request data", async function () {
//     //I need more apis'
//        test1 = "https://api.gdax.com/products/ETH-USD/ticker";
//        test2 = "https://api.gdax.com/products/BTC-USD/ticker";
//        req1 = await oracle.requestData(test1, 20, {from:accounts[2]});
//        //console.log('req1');
//        //variables = await oracle.getVariablesOnQ();
//        onQ = await oracle.apiIdOnQ.call();
//        //console.log("q1",onQ);
//        assert(web3.utils.hexToNumberString(onQ) == 2, "should be 2");
//        req2 = await oracle.requestData(api2, 40, {from:accounts[2]});
//        //console.log('req2');
//        //variables2 = await oracle.getVariablesOnQ();
//        onQ = await oracle.apiIdOnQ.call();
//        //console.log("q2",onQ);
//        assert(web3.utils.hexToNumberString(onQ) == 3, "should be 3");
//        req3 = await oracle.addToValuePool(2, 31, {from:accounts[2]});
//        //console.log('req3');
//        //variables3 = await oracle.getVariablesOnQ();
//        onQ = await oracle.apiIdOnQ.call();
//        //console.log("q3",onQ);
//        assert(web3.utils.hexToNumberString(onQ) == 2, "should be 2");
//        req4 = await oracle.requestData(test2, 60, {from:accounts[2]});
//        //console.log('req2');
//        //variables2 = await oracle.getVariablesOnQ();
//        onQ = await oracle.apiIdOnQ.call();
//        //console.log("q4",onQ);
//        assert(web3.utils.hexToNumberString(onQ) == 4, "should be 4");
//     });

//     it("Request data and change on queue with another request", async function () {
//         balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         test1 = 'test';
//         let pay = web3.utils.toWei('20', 'ether');
//         let pay2 = web3.utils.toWei('50', 'ether');
//         //data request 1
//         let res = await oracle.requestData(test1, pay, {from:accounts[2]});
//         let resSapi = await res.logs[2].args._sapi;
//         //console.log("resSApi", resSapi);
//         let resApiHash = await res.logs[2].args._apiHash;
//         //console.log("resApiHash", resApiHash);
//         let resApiId = await res.logs[2].args._apiId;
//         //console.log("resApiId", resApiId);
//         //check apid can be retrieved through getter
//         apiId = await oracle.getApiId(resApiHash);  
//         //console.log("apiId from hash",apiId);
//         //check value pool
//         let valuePool = await oracle.getValuePoolAt(resApiId);
//         assert( web3.utils.fromWei(valuePool) == 20, "value pool should be 20");
//         //check apionQ updated via requestData
//         let apionQ = await res.logs[1].args._apiOnQ;
//         let apiIdonQ = await res.logs[1].args._apiId;
//         let apiOnQPayout = await res.logs[1].args._apiOnQPayout;
//         //console.log("apiIdonQ",apiIdonQ);
//         //console.log("resApiId",resApiId);
//         assert(web3.utils.fromWei(apiOnQPayout) == 20, "Current payout on Q should be 20");
//         assert(web3.utils.hexToNumberString(apionQ) == web3.utils.hexToNumberString(resApiHash), "api on Q should be apiId");
//         assert(web3.utils.hexToNumberString(apiIdonQ) == web3.utils.hexToNumberString(resApiId), "timestamp on Q should be apiID");
//         //data request 2
//         res2 = await oracle.requestData(api2, pay2, {from:accounts[2]});
//         let resApi2 = await res2.logs[2].args._apiHash;
//         let resApiId2 = await res2.logs[2].args._apiId;
//         let resSapi2 = await res2.logs[2].args._sapi;
//         let valuePool2 = await oracle.getValuePoolAt(2);
//         let apionQ2 = await res2.logs[1].args._apiOnQ;
//         let ApiIdonQ2 = await res2.logs[1].args._apiId;
//         let apiOnQPayout2 = await res2.logs[1].args._apiOnQPayout;
//         assert(web3.utils.fromWei(apiOnQPayout2) == 50, "2Current payout on Q should be 50");
//         assert(web3.utils.hexToNumberString(apionQ2) == web3.utils.hexToNumberString(resApi2), "2api on Q should be apiId");
//         assert(web3.utils.hexToNumberString(ApiIdonQ2) == web3.utils.hexToNumberString(resApiId2), "2timestamp on Q should be apiTimestamp");
//         balance2 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 70, "balance should be down by 70");
//     });

//   it("Test Add Value to Pool and change on queue", async function () {
//         balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         test1 = 'test';
//         let pay = web3.utils.toWei('20', 'ether');
//         let pay2 = web3.utils.toWei('30', 'ether');
//         let res = await oracle.requestData(test1, pay, {from:accounts[2]});
//         let resSapi = await res.logs[2].args._sapi;
//         let resApiHash = await res.logs[2].args._apiHash;
//         let resApiId = await res.logs[2].args._apiId;
//         //check apid can be retrieved through getter
//         apiId = await oracle.getApiId(resApiHash);  

//         //check value pool
//         let valuePool = await oracle.getValuePoolAt(resApiId);
//         assert( web3.utils.fromWei(valuePool) == 20, "value pool should be 20");

//         //check apionQ updated via requestData
//         let apionQ = await res.logs[1].args._apiOnQ;
//         let apiIdonQ = await res.logs[1].args._apiId;
//         let apiOnQPayout = await res.logs[1].args._apiOnQPayout;
//         assert(web3.utils.fromWei(apiOnQPayout) == 20, "Current payout on Q should be 20");
//         assert(web3.utils.hexToNumberString(apionQ) == web3.utils.hexToNumberString(resApiHash), "api on Q should be apiId");
//         assert(web3.utils.hexToNumberString(apiIdonQ) == web3.utils.hexToNumberString(resApiId), "timestamp on Q should be apiID");
        
//         //data request 2
//         let res2 = await oracle.requestData(api2, pay2, {from:accounts[2]});
//         let resApi2 = await res2.logs[2].args._apiHash;
//         let resApiId2 = await res2.logs[2].args._apiId;
//         let resSapi2 = await res2.logs[2].args._sapi;
//         let valuePool2 = await oracle.getValuePoolAt(2);
//         let apionQ2 = await res2.logs[1].args._apiOnQ;
//         let ApiIdonQ2 = await res2.logs[1].args._apiId;
//         let apiOnQPayout2 = await res2.logs[1].args._apiOnQPayout;
//         assert(web3.utils.fromWei(apiOnQPayout2) == 30, "2Current payout on Q should be 30");
//         assert(web3.utils.hexToNumberString(apionQ2) == web3.utils.hexToNumberString(resApi2), "2api on Q should be apiId");
//         assert(web3.utils.hexToNumberString(ApiIdonQ2) == web3.utils.hexToNumberString(resApiId2), "2timestamp on Q should be apiTimestamp");

//         //balance check
//         balance2 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 50, "balance should be down by 50")

//         //add to value pool of request not on Q 
//         let addvaluePool = await oracle.addToValuePool(2,pay,{from:accounts[2]});
//         getValuePool = await oracle.getValuePoolAt(1);
//         balance3 = await (oracle.balanceOf(accounts[2],{from:accounts[0]}));
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance3) == 70, "balance should be down by 70")
        
//         //check request on Q updates via addToValuePool
//         let vpApiOnQ = await addvaluePool.logs[1].args._apiOnQ;
//         let vpApiIdonQ = await addvaluePool.logs[1].args._apiId;
//         let vpapiOnQPayout = await addvaluePool.logs[1].args._apiOnQPayout;
//         assert(web3.utils.fromWei(vpapiOnQPayout) == 40, "Current payout on Q should be 40");
//         assert(web3.utils.hexToNumberString(vpApiOnQ) == web3.utils.hexToNumberString(resApiHash), "api on Q should be apiId");
//         assert(web3.utils.hexToNumberString(vpApiIdonQ) == web3.utils.hexToNumberString(resApiId), "timestamp on Q should be apiTimestamp");        
//     }); 
//     it("Test 51 request and lowest is kicked out", async function () {
//         apiHash = await oracle.getApiHash(1); 
//         apiIdforpayoutPoolIndex = await oracle.getpayoutPoolIndexToApiId(0);
//         apiId = await oracle.getApiId(apiHash);
//         assert(web3.utils.hexToNumberString(apiId) == 1, "timestamp on Q should be 1");
//         payoutp = await oracle.getValuePoolAt(1);
//         console.log("51 requests....");
//          for(var i = 1;i <=51 ;i++){
//         	apix= ("api" + i);
//             await oracle.requestData(apix,i, {from:accounts[2]});
//         }
//         payoutP = await oracle.getValuePoolAt(52);
//         apiIdforpayoutPoolIndex = await oracle.getpayoutPoolIndexToApiId(50);
//         apiHash = await oracle.getApiHash(52);
//         vars = await oracle.getVariablesOnQ();
//         let apiOnQ = web3.utils.hexToNumberString(vars['0']);
//         let apiPayout = web3.utils.hexToNumberString(vars['1']);
//         let sapi = vars['2'];
//         apiIdforpayoutPoolIndex2 = await oracle.getpayoutPoolIndexToApiId(49);
//         assert(apiIdforpayoutPoolIndex == 52, "position 1 should be booted"); 
//         assert(sapi == "api51", "API on Q string should be correct"); 
//         assert(apiPayout == 51, "API on Q payout should be 51"); 
//         assert(apiOnQ == 52, "API on Q should be 51"); 
//         assert(payoutP == 51, "position 1 should have correct value"); 
//         assert(apiIdforpayoutPoolIndex2 == 3, "position 2 should be in same place"); 
//    });
//     it("Test Throw on wrong apiId", async function () {
//         await helper.expectThrow(oracle.proofOfWork("2",4,3000,{from:accounts[1]}));
//         await oracle.proofOfWork("2",1,3000,{from:accounts[1]})
//     });
//     it("Stake miner", async function (){
//          balance2 = await oracle.balanceOf(accounts[2]);
//         await oracle.transfer(accounts[6],balance2,{from:accounts[2]});
//         await oracle.depositStake({from:accounts[6]});
//         assert(await oracle.isStaked(accounts[6]) == true, "Staked" );
//     });
    
//     it("Test competing API requests - multiple switches in API on Queue", async function () {
//         await oracle.requestData(api,0, {from:accounts[2]});
//         await oracle.requestData(api2,0, {from:accounts[2]});
//         await oracle.requestData("api3",1, {from:accounts[2]});
//         await oracle.requestData(api2,2, {from:accounts[2]});
//         await oracle.requestData("api3",3, {from:accounts[2]});
//         await oracle.requestData(api2,4, {from:accounts[2]});
//         vars = await oracle.getVariablesOnQ();
//         let apiOnQ = web3.utils.hexToNumberString(vars['0']);
//         let apiPayout = web3.utils.hexToNumberString(vars['1']);
//         let sapi = vars['2'];
//         assert(sapi == api2, "API on Q string should be correct"); 
//         assert(apiPayout == 6, "API on Q payout should be 4"); 
//         assert(apiOnQ == 2, "API on Q should be 2"); 
//     });
    
// });
