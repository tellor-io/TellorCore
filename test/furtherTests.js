// /** 
// * This contract tests the Tellor functions
// */ 

// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
// const BN = require('bn.js');
// const helper = require("./helpers/test_helpers");
// //const ethers = require('ethers');
// const Utilities = artifacts.require("./libraries/Utilities.sol");
// const UtilitiesTests = artifacts.require("./UtilitiesTests.sol");
// const TellorMaster = artifacts.require("./TellorMaster.sol");
// const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
// var OldTellor = artifacts.require("./oldContracts/OldTellor.sol")

// var oracleAbi = Tellor.abi;
// var masterAbi = TellorMaster.abi;
// var oracleByte = Tellor.bytecode;

// var api = 'json(https://api.gdax.com/products/BTC-USD/ticker).price';
// var api2 = 'json(https://api.gdax.com/products/ETH-USD/ticker).price';

// function promisifyLogWatch(_contract,_event) {
//   return new Promise((resolve, reject) => {
//     web3.eth.subscribe('logs', {
//       address: _contract.options.address,
//       //topics:  ['0xba11e319aee26e7bbac889432515ba301ec8f6d27bf6b94829c21a65c5f6ff25']
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
//   let oracleBase;
//   let logNewValueWatcher;
//   let master;
//   let utilities;
//   let newOracle;

//     beforeEach('Setup contract for each test', async function () {
//         oracleBase = await OldTellor.new();
//         oracle = await TellorMaster.new(oracleBase.address);
//         master = await new web3.eth.Contract(masterAbi,oracle.address);
//         oracle2 = await new web3.eth.Contract(oracleAbi,oracleBase.address);///will this instance work for logWatch? hopefully...
//         //await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.init().encodeABI()})
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
//         await helper.advanceTime(86400 * 8);
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestStakingWithdraw().encodeABI()})
//         await helper.advanceTime(86400 * 8);
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[2],data:oracle2.methods.withdrawStake().encodeABI()})
//         utilities = await UtilitiesTests.new();
//         await utilities.setTellorMaster(oracle.address);

//    });  

//    it("transferOwnership", async function () {
//    	        newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         let checkowner = await oracle.getAddressVars(web3.utils.keccak256("_owner"));
//         assert(checkowner == accounts[0], "initial owner acct 0");

//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.proposeOwnership(accounts[2]).encodeABI()});
//         let pendingOwner = await oracle.getAddressVars(web3.utils.keccak256("pending_owner"));
//         assert(pendingOwner == accounts[2], "pending owner acct 2");
//         checkowner = await oracle.getAddressVars(web3.utils.keccak256("_owner"));
//         assert(checkowner == accounts[0], "initial owner acct 0");

//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.claimOwnership().encodeABI()});
//         checkowner = await oracle.getAddressVars(web3.utils.keccak256("_owner"));
//         assert(checkowner == accounts[2], "new owner acct 2");
//    });
//    it("Request data", async function () {
//         let res2 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",1000,20).encodeABI()})
//         let res = await web3.eth.abi.decodeParameters(['string','string','uint256','uint256'],res2.logs[2].data);
//         let resSapi = res['0']
//                 newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         let resApiId = await web3.eth.abi.decodeParameter('uint256',res2.logs[2].topics[2])
//         apiVars = await oracle.getRequestVars(resApiId);
//         assert( apiVars[5] == 20, "value pool should be 20");
//         res3 = await web3.eth.abi.decodeParameters(['string','bytes32','uint256'],res2.logs[1].data);
//         let apiIdonQ = await web3.eth.abi.decodeParameter('uint256',res2.logs[1].topics[1])
//         let apiOnQPayout = res3['2'];
//         assert(resSapi == api2,"string should be correct");
//         assert(web3.utils.hexToNumberString(apiOnQPayout) == 20, "Current payout on Q should be 20");
//         assert(web3.utils.hexToNumberString(apiIdonQ) == resApiId, "timestamp on Q should be apiID");
//         vars = await oracle.getRequestVars(2);
//         assert(vars[1] == "ETH/USD")
//     });
//     it("several request data", async function () {
//         test1 = "https://api.gdax.com/products/ETH-USD/ticker";
//         test2 = "https://api.gdax.com/products/BTC-USD/ticker";
//         let req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(test1,"ETH/USD",1000,20).encodeABI()})
//         onQ = await web3.eth.abi.decodeParameter('uint256',req1.logs[1].topics[1])
//         assert(web3.utils.hexToNumberString(onQ) == 2, "should be 2");
//        req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",1000,40).encodeABI()})
//         onQ = await web3.eth.abi.decodeParameter('uint256',req1.logs[1].topics[1])
//        assert(web3.utils.hexToNumberString(onQ) == 3, "should be 3");
//        req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(test1,"ETH/USD",1000,31).encodeABI()})
//         onQ = await web3.eth.abi.decodeParameter('uint256',req1.logs[1].topics[1])
//        assert(web3.utils.hexToNumberString(onQ) == 2, "should be 2");
//                newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//        req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(test2,"ETH/USD",1000,60).encodeABI()})
//         onQ = await web3.eth.abi.decodeParameter('uint256',req1.logs[1].topics[1])
//        assert(web3.utils.hexToNumberString(onQ) == 4, "should be 4");

//     });
//     it("Request data and change on queue with another request", async function () {
//     	        newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         test1 = 'test';
//         let pay = web3.utils.toWei('20', 'ether');
//         let pay2 = web3.utils.toWei('50', 'ether');
//         let res3 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(test1,"ETH/USD",1000,pay).encodeABI()})
//         let res = await web3.eth.abi.decodeParameters(['string','string','uint256','uint256'],res3.logs[2].data);
//         let resSapi = res['0']
//         newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         let resApiId = await web3.eth.abi.decodeParameter('uint256',res3.logs[2].topics[2])
//         apiVars = await oracle.getRequestVars(resApiId)
//         assert( apiVars[5] == pay, "value pool should be 20");
//         let res2 = await web3.eth.abi.decodeParameters(['string','bytes32','uint256'],res3.logs[1].data);
//         let apiIdonQ = await web3.eth.abi.decodeParameter('uint256',res3.logs[1].topics[1])
//         let apiOnQPayout = res2['2'];
//         assert(web3.utils.fromWei(apiOnQPayout) == 20, "Current payout on Q should be 20");
//         assert(apiIdonQ== resApiId, "timestamp1 on Q should be apiID");
//         res3 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",1000,pay2).encodeABI()})
//         res = await web3.eth.abi.decodeParameters(['string','string','uint256','uint256'],res3.logs[2].data);
//         let resSapi2 = res['0']
//         let resApiId2 = await web3.eth.abi.decodeParameter('uint256',res3.logs[2].topics[2])
//         res2 = await web3.eth.abi.decodeParameters(['string','bytes32','uint256'],res3.logs[1].data);
//         let apiIdonQ2 = await web3.eth.abi.decodeParameter('uint256',res3.logs[1].topics[1])
//         let apiOnQPayout2 = res2['2'];
//         assert(web3.utils.fromWei(apiOnQPayout2) == 50, "2Current payout on Q should be 50");
//         assert(apiIdonQ2 == resApiId2, "2timestamp on Q should be apiTimestamp");
//         balance2 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 70, "balance should be down by 70");
//     });

//   it("Test Add Value to Pool and change on queue", async function () {
//         balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         test1 = 'test';
//         let pay = web3.utils.toWei('20', 'ether');
//         let pay2 = web3.utils.toWei('30', 'ether');
//         let res3 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(test1,"ETH/USD",1000,pay).encodeABI()})
//         let res = await web3.eth.abi.decodeParameters(['string','string','uint256','uint256'],res3.logs[2].data);
//         let resSapi = res['0']
//         let resApiId = await web3.eth.abi.decodeParameter('uint256',res3.logs[2].topics[2])
//         apiVars = await oracle.getRequestVars(resApiId)
//         assert( apiVars[5] == pay, "value pool should be 20");
//         let res2 = await web3.eth.abi.decodeParameters(['string','bytes32','uint256'],res3.logs[1].data);
//         let apiIdonQ = await web3.eth.abi.decodeParameter('uint256',res3.logs[1].topics[1])
//         let apiOnQPayout = res2['2'];
//                 newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         assert(web3.utils.fromWei(apiOnQPayout) == 20, "Current payout on Q should be 20");
//         assert(apiIdonQ == resApiId, "timestamp on Q should be apiID");
//         res3 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",1000,pay2).encodeABI()}) 
// 		res = await web3.eth.abi.decodeParameters(['string','string','uint256','uint256'],res3.logs[2].data);
//         let resSapi2 = res['0']
//         let resApiId2 = await web3.eth.abi.decodeParameter('uint256',res3.logs[2].topics[2])
//         res2 = await web3.eth.abi.decodeParameters(['string','bytes32','uint256'],res3.logs[1].data);
//         let apiIdonQ2 = await web3.eth.abi.decodeParameter('uint256',res3.logs[1].topics[1])
//         let apiOnQPayout2 = res2['2'];
//         assert(web3.utils.fromWei(apiOnQPayout2) == 30, "2Current payout on Q should be 30");
//         assert(web3.utils.hexToNumberString(apiIdonQ2) == web3.utils.hexToNumberString(resApiId2), "2timestamp on Q should be apiTimestamp");
//         balance2 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 50, "balance should be down by 50")
//         let addvaluePool =await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(test1,"ETH/USD",1000,pay).encodeABI()})
//         balance3 = await (oracle.balanceOf(accounts[2],{from:accounts[0]}));
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance3) == 70, "balance should be down by 70")
//         res2 = await web3.eth.abi.decodeParameters(['string','bytes32','uint256'],addvaluePool.logs[1].data);
//         let vpApiIdonQ = await web3.eth.abi.decodeParameter('uint256',addvaluePool.logs[1].topics[1])
//         let vpapiOnQPayout = res2['2'];
//         assert(web3.utils.fromWei(vpapiOnQPayout) == 40, "Current payout on Q should be 40");
//         assert(web3.utils.hexToNumberString(vpApiIdonQ) == 2, "timestamp on Q should be apiTimestamp");        
//     }); 


//     it("Test getMax payout and index 51 req with overlapping tips and requests", async function () {
//    	    apiVars= await oracle.getRequestVars(1);
//         apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(0);
//         apiId = await oracle.getRequestIdByQueryHash(apiVars[2]);
//         assert(web3.utils.hexToNumberString(apiId) == 1, "timestamp on Q should be 1");
//         console.log("51 requests....");
//          for(var i = 1;i <=21 ;i++){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,i).encodeABI()})
//         }
//         newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         for(var j = 15;j <= 45 ;j++){
//         	apix= ("api" + j);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,j).encodeABI()})
//         } 

//         req = await oracle.getRequestQ();
//         max = await utilities.testgetMax();
//         assert(web3.utils.hexToNumberString(max[0])== 45, "Max should be 45")
//         assert(web3.utils.hexToNumberString(max[1])== 6, "Max should be 6")
//     });

//     it("Test getMax payout and index 55 requests", async function () {
//         console.log("55 requests....");
//          for(var i = 1;i <=55 ;i++){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,i).encodeABI()})
//         }

//         req = await oracle.getRequestQ();
//         max = await utilities.testgetMax();
//         assert(web3.utils.hexToNumberString(max[0])== 55, "Max should be 55")
//         assert(web3.utils.hexToNumberString(max[1])== 46, "Max should be 46")    
//     });

//     it("Test getMax payout and index 100 requests", async function () {
//         console.log("55 requests....");
//          for(var i = 1;i <=55 ;i++){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,i).encodeABI()})
//         }
//         newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         for(var j = 50;j <= 95 ;j++){
//         	apix= ("api" + j);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,j).encodeABI()})
//         } 

//         req = await oracle.getRequestQ();
//         max = await utilities.testgetMax();
//         assert(web3.utils.hexToNumberString(max[0])== 110, "Max should be 110")
//         assert(web3.utils.hexToNumberString(max[1])== 46, "Max should be 46") 
//     });


//     it("utilities Test getMin payout and index 10 req with overlapping tips and requests", async function () {
//    	    apiVars= await oracle.getRequestVars(1);
//    	            newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(0);
//         apiId = await oracle.getRequestIdByQueryHash(apiVars[2]);
//         assert(web3.utils.hexToNumberString(apiId) == 1, "timestamp on Q should be 1");
//         console.log("10 equests....");
//          for(var i = 10;i >=1 ;i--){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,i).encodeABI()})
//         }

//         req = await oracle.getRequestQ();
//         min = await utilities.testgetMin();
//         assert(web3.utils.hexToNumberString(min[0])== 0, "Min should be 0")
//         assert(web3.utils.hexToNumberString(min[1])== 40, "Min should be 40")
//     });


//     it("Test getMin payout and index 51 req count down with overlapping tips and requests", async function () {
//    	    apiVars= await oracle.getRequestVars(1);
//         apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(0);
//                 newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         apiId = await oracle.getRequestIdByQueryHash(apiVars[2]);
//         assert(web3.utils.hexToNumberString(apiId) == 1, "timestamp on Q should be 1");
//         console.log("51 requests....");
//          for(var i = 21;i >=1 ;i--){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,i).encodeABI()})
//         }

//         for(var j = 45;j >= 15 ;j--){
//         	apix= ("api" + j);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,j).encodeABI()})
//         } 

//         req = await oracle.getRequestQ();
//         min = await utilities.testgetMin();
//         assert(web3.utils.hexToNumberString(min[0])== 0, "Min should be 0")
//         assert(web3.utils.hexToNumberString(min[1])== 5, "Min should be 5")
//         assert(web3.utils.hexToNumberString(req[44])==30, "request 15 is submitted twice this should be 30")
//         assert(web3.utils.hexToNumberString(req[50])==42, "request 21 is submitted twice this should be 42")
      
//     });

//     it("Test getMin payout and index 56 req with overlapping tips and requests", async function () {
//    	    apiVars= await oracle.getRequestVars(1);
//         apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(0);
//         apiId = await oracle.getRequestIdByQueryHash(apiVars[2]);
//         assert(web3.utils.hexToNumberString(apiId) == 1, "timestamp on Q should be 1");
//         console.log("56 requests....");
//          for(var i = 21;i >=1 ;i--){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,i).encodeABI()})
//         }
//         newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         for(var j = 50;j >= 15 ;j--){
//         	apix= ("api" + j);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,j).encodeABI()})
//         } 

//         req = await oracle.getRequestQ();
//         min = await utilities.testgetMin();
//         assert(web3.utils.hexToNumberString(min[0])== 1, "Min should be 1")
//         assert(web3.utils.hexToNumberString(min[1])== 30, "Min should be 30")
//     });

//     it("Test getMin payout and index 55 requests", async function () {
//         console.log("55 requests....");
//          for(var i = 1;i <=55 ;i++){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,i).encodeABI()})
//         }
//         newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         req = await oracle.getRequestQ();
//         min = await utilities.testgetMin();
//         assert(web3.utils.hexToNumberString(min[0])== 6, "Min should be 6")
//         assert(web3.utils.hexToNumberString(min[1])== 45, "Min should be 45")    
//     });



//    it("Test 51 request and lowest is kicked out", async function () {
//    	       apiVars= await oracle.getRequestVars(1)
//         apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(0);
//         apiId = await oracle.getRequestIdByQueryHash(apiVars[2]);
//         assert(web3.utils.hexToNumberString(apiId) == 1, "timestamp on Q should be 1");
//         console.log("51 requests....");
//          for(var i = 1;i <=51 ;i++){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"",1000,i).encodeABI()})
//         }
//         let payoutPool = await oracle.getRequestQ();
//         for(var i = 2;i <=49 ;i++){
//         	assert(payoutPool[i] == 51-i)

//         }
//                 newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         apiVars= await oracle.getRequestVars(52)
//         apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(50);
//         vars = await oracle.getVariablesOnDeck();
//         let apiOnQ = web3.utils.hexToNumberString(vars['0']);
//         let apiPayout = web3.utils.hexToNumberString(vars['1']);
//         let sapi = vars['2'];
//         apiIdforpayoutPoolIndex2 = await oracle.getRequestIdByRequestQIndex(49);
//         assert(apiIdforpayoutPoolIndex == 52, "position 1 should be booted"); 
//         assert(sapi == "api51", "API on Q string should be correct"); 
//         assert(apiPayout == 51, "API on Q payout should be 51"); 
//         assert(apiOnQ == 52, "API on Q should be 51"); 
//         assert(apiVars[5] == 51, "position 1 should have correct value"); 
//         assert(apiIdforpayoutPoolIndex2 == 3, "position 2 should be in same place"); 
//    });


//     it("Test Throw on wrong apiId", async function () {
//     	        newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         await helper.expectThrow(web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.submitMiningSolution("2",4,3000).encodeABI()}) );
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.submitMiningSolution("2",1,3000).encodeABI()})
//     });
//     it("Stake miner", async function (){
//     	        newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//          balance2 = await oracle.balanceOf(accounts[2]);
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.transfer(accounts[6],web3.utils.hexToNumberString(balance2)).encodeABI()})
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[6],gas:7000000,data:oracle2.methods.depositStake().encodeABI()})
//        	let s =  await oracle.getStakerInfo(accounts[6])
//         assert(s[0] == 1, "Staked" );
//     });
//     it("Test competing API requests - multiple switches in API on Queue", async function () {
//     	 await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",1000,0).encodeABI()})
//          await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData("api3","",1000,1).encodeABI()})
//          await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",1000,2).encodeABI()})
//          await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData("api3","",1000,3).encodeABI()})
//          await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",1000,4).encodeABI()})
//         vars = await oracle.getVariablesOnDeck();
//         let apiOnQ = web3.utils.hexToNumberString(vars['0']);
//         let apiPayout = web3.utils.hexToNumberString(vars['1']);
//         let sapi = vars['2'];
//         assert(apiOnQ == 2, "API on Q should be 2"); 
//         assert(sapi == api2, "API on Q string should be correct"); 
//         assert(apiPayout == 6, "API on Q payout should be 6"); 
//     });
//     it("Test New Tellor Storage Contract", async function () {
//     	    	        newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
       
//         assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == newOracle.address, "tellorContract should be Tellor Base");
//         let oracleBase2 = await Tellor.new();
//          await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[2],web3.utils.toWei('5000', 'ether')).encodeABI()})
//        console.log('test', await oracle.balanceOf(accounts[1]))
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.proposeFork(oracleBase2.address).encodeABI()})
//         for(var i = 1;i<5;i++){
//             await web3.eth.sendTransaction({to: oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()})
//         }
//         await helper.advanceTime(86400 * 8);
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()})
//         console.log(1);
//         assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == oracleBase2.address);
//     });
//         it("Test Failed Vote - New Tellor Storage Contract", async function () {
//         	    	        newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
       
//         assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == newOracle.address, "tellorContract should be Tellor Base");
//         let oracleBase2 = await Tellor.new();
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[2],web3.utils.toWei('5000', 'ether')).encodeABI()})
        
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.proposeFork(oracleBase2.address).encodeABI()})
//         for(var i = 1;i<5;i++){
//             await web3.eth.sendTransaction({to: oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()})
//         }
//         await helper.advanceTime(86400 * 8);
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()})
//         assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == newOracle.address, "vote should have failed");
//     });
//     it("Test Deity Functions", async function () {
//     	let owner = await oracle.getAddressVars(web3.utils.keccak256("_deity"));
//     	assert(owner == accounts[0])
//     	await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeDeity(accounts[1]).encodeABI()})
// 		owner = await oracle.getAddressVars(web3.utils.keccak256("_deity"));
// 		assert(owner == accounts[1])
// 		newOracle = await Tellor.new();
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
// 		assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == newOracle.address);
//     });
// });