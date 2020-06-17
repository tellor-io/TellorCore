// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
// const helper = require("./helpers/test_helpers");
// const TellorMaster = artifacts.require("./TellorMaster.sol");
// const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
// var oracleAbi = Tellor.abi;
// var oracleByte = Tellor.bytecode;
// var OldTellor = artifacts.require("./oldContracts/OldTellor.sol")
// var oldTellorABI = OldTellor.abi;
// var UtilitiesTests = artifacts.require("./UtilitiesTests.sol")

// var masterAbi = TellorMaster.abi;
// var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
// var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";

// contract('Further Tests w/ Upgrade', function(accounts) {
//   let oracleBase;
//   let oracle;
//   let oracle2;
//   let master;
//   let oldTellor;
//   let oldTellorinst;
//   let utilities;

//     beforeEach('Setup contract for each test', async function () {
//         //deploy old, request, update address, mine old challenge.
//         oldTellor = await OldTellor.new()    
//         oracle = await TellorMaster.new(oldTellor.address);
//         master = await new web3.eth.Contract(masterAbi,oracle.address);
//         oldTellorinst = await new web3.eth.Contract(oldTellorABI,oldTellor.address);
//         for(var i = 0;i<6;i++){
//             //print tokens 
//             await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.theLazyCoon(accounts[i],web3.utils.toWei('1100', 'ether')).encodeABI()})
//         }
//         for(var i=0; i<52;i++){
//             x = "USD" + i
//             apix = api + i
//             await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.requestData(apix,x,1000,0).encodeABI()})
//         }
//         //Deploy new upgraded Tellor
//         oracleBase = await Tellor.new();
//         oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);
//         await oracle.changeTellorContract(oracleBase.address)
//         for(var i = 0;i<5;i++){
//           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods['testSubmitMiningSolution(string,uint256,uint256)']("nonce",1,1200).encodeABI()})
//         }
//     });
  
//    it("Add Tip", async function () {
//         res = await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.addTip(11,20).encodeABI()})
//         apiVars = await oracle.getRequestVars(11);
//         assert(apiVars[5] == 20, "value pool should be 20");
//     });
//     it("several request data", async function () {
//         let req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(41,100).encodeABI()})
//         req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(42,100).encodeABI()})
//         req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(43,100).encodeABI()})
//         req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(44,100).encodeABI()})
//         req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(31,20).encodeABI()})
//         data = await oracle2.methods.getNewVariablesOnDeck().call();
//         console.log(data)
//         assert(data[0][0] == 41, 'ID on deck should be 41');
//         assert(data[0][4] == 31, 'ID on deck should be 30');
//         assert(data[1][4] == 20, 'Tip should be over 1000');
//        req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(32,40).encodeABI()})
//         data = await oracle2.methods.getNewVariablesOnDeck().call();
//          assert(data[0][1] == 42, 'ID on deck should be 41');
//         assert(data[0][4] == 32, 'ID on deck should be 30');
//         assert(data[1][4] == 30, 'Tip should be over 1000');
//        req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(33,50).encodeABI()})
//         data = await oracle2.methods.getNewVariablesOnDeck().call();
//          assert(data[0][2] == 43, 'ID on deck should be 43');
//         assert(data[0][4] == 33, 'ID on deck should be 30');
//         assert(data[1][4] == 50, 'Tip should be over 1000');
//        req1 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(34,60).encodeABI()})
//         data = await oracle2.methods.getNewVariablesOnDeck().call();
//          assert(data[0][3] == 44, 'ID on deck should be 44');
//         assert(data[0][4] == 34, 'ID on deck should be 30');
//         assert(data[1][4] == 60, 'Tip should be over 1000');
//     });
//     it("Request data and change on queue with another request", async function () {
//     	balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         let pay = web3.utils.toWei('20', 'ether');
//         let pay2 = web3.utils.toWei('50', 'ether');
//         let res3 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(31,pay).encodeABI()})
//         apiVars = await oracle.getRequestVars(31)
//         assert( apiVars[5] == pay, "value pool should be 20");
//         data = await oracle2.methods.getNewVariablesOnDeck().call();
//         assert(data[0][0] == 31, 'ID on deck should be 31');
//         res3 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(32, pay2).encodeABI()})
//         res = await web3.eth.abi.decodeParameters(['string','string','uint256','uint256'],res3.logs[2].data);
//         data = await oracle2.methods.getNewVariablesOnDeck().call();
//         assert(data[0][1] == 31, 'ID on deck should be 31');
//         assert(data[0][0] == 32, 'ID on deck should be 31');
//         assert(data[1][1] == pay, 'ID on deck should be 31');
//         assert(data[1][0] == pay2, 'ID on deck should be 31');
//         balance2 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 70, "balance should be down by 70");
//     });

//   it("Test Add Value to Pool and change on queue", async function () {
//         balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
//         test1 = 'test';
//         let pay = web3.utils.toWei('20', 'ether');
//         let pay2 = web3.utils.toWei('30', 'ether');
//         let res3 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1, pay).encodeABI()})
//         let res = await web3.eth.abi.decodeParameters(['string','string','uint256','uint256'],res3.logs[2].data);
//         let resSapi = res['0']
//         let resApiId = await web3.eth.abi.decodeParameter('uint256',res3.logs[2].topics[2])
//         apiVars = await oracle.getRequestVars(resApiId)
//         assert( apiVars[5] == pay, "value pool should be 20");
//         let res2 = await web3.eth.abi.decodeParameters(['string','bytes32','uint256'],res3.logs[1].data);
//         let apiIdonQ = await web3.eth.abi.decodeParameter('uint256',res3.logs[1].topics[1])
//         let apiOnQPayout = res2['2'];
//         assert(web3.utils.fromWei(apiOnQPayout) == 20, "Current payout on Q should be 20");
//         assert(apiIdonQ == resApiId, "timestamp on Q should be apiID");
//         res3 = await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,pay2).encodeABI()}) 
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
//         let addvaluePool =await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,pay).encodeABI()})
//         balance3 = await (oracle.balanceOf(accounts[2],{from:accounts[0]}));
//         assert(web3.utils.fromWei(balance1) - web3.utils.fromWei(balance3) == 70, "balance should be down by 70")
//         res2 = await web3.eth.abi.decodeParameters(['string','bytes32','uint256'],addvaluePool.logs[1].data);
//         let vpApiIdonQ = await web3.eth.abi.decodeParameter('uint256',addvaluePool.logs[1].topics[1])
//         let vpapiOnQPayout = res2['2'];
//         assert(web3.utils.fromWei(vpapiOnQPayout) == 40, "Current payout on Q should be 40");
//         assert(web3.utils.hexToNumberString(vpApiIdonQ) == 2, "timestamp on Q should be apiTimestamp");        
//     }); 


//     it("Test getMax payout and index 51 req with overlapping tips and requests", async function () {
//         utilities = await UtilitiesTests.new(oracle.address);
//          for(var i = 1;i <=21 ;i++){
//         	//apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i,i).encodeABI()})
//         }
//        for(var j = 15;j <= 45 ;j++){
//         	apix= ("api" + j);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(j,j).encodeABI()})
//         } 
//         max = await utilities.testgetMax();
//         assert(web3.utils.hexToNumberString(max[0])== 45, "Max should be 45")
//         assert(web3.utils.hexToNumberString(max[1])== 6, "Max should be 6")
//     });

//     it("Test getMax payout and index 55 requests", async function () {
//         utilities = await UtilitiesTests.new(oracle.address);
//          for(var i = 1;i <=55 ;i++){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i,i).encodeABI()})
//         }
//         max = await utilities.testgetMax();
//         assert(web3.utils.hexToNumberString(max[0])== 55, "Max should be 55")
//         assert(web3.utils.hexToNumberString(max[1])== 46, "Max should be 46")    
//     });

//     it("Test getMax payout and index 100 requests", async function () {
//          for(var i = 1;i <=55 ;i++){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i,i).encodeABI()})
//         }
//         for(var j = 50;j <= 95 ;j++){
//         	apix= ("api" + j);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(j,j).encodeABI()})
//         } 

//         req = await oracle.getRequestQ();
//         max = await utilities.testgetMax();
//         assert(web3.utils.hexToNumberString(max[0])== 110, "Max should be 110")
//         assert(web3.utils.hexToNumberString(max[1])== 46, "Max should be 46") 
//     });


//     it("utilities Test getMin payout and index 10 req with overlapping tips and requests", async function () {
//    	    apiVars= await oracle.getRequestVars(1);
//    	    apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(0);
//         apiId = await oracle.getRequestIdByQueryHash(apiVars[2]);
//         assert(web3.utils.hexToNumberString(apiId) == 1, "timestamp on Q should be 1");
//          for(var i = 10;i >=1 ;i--){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i,i).encodeABI()})
//         }

//         req = await oracle.getRequestQ();
//         min = await utilities.testgetMin();
//         assert(web3.utils.hexToNumberString(min[0])== 0, "Min should be 0")
//         assert(web3.utils.hexToNumberString(min[1])== 40, "Min should be 40")
//     });


//     it("Test getMin payout and index 51 req count down with overlapping tips and requests", async function () {
//    	    apiVars= await oracle.getRequestVars(1);
//         apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(0);
//         apiId = await oracle.getRequestIdByQueryHash(apiVars[2]);
//         assert(web3.utils.hexToNumberString(apiId) == 1, "timestamp on Q should be 1");
//          for(var i = 21;i >=1 ;i--){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i,i).encodeABI()})
//         }

//         for(var j = 45;j >= 15 ;j--){
//         	apix= ("api" + j);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(j,j).encodeABI()})
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
//          for(var i = 21;i >=1 ;i--){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i,i).encodeABI()})
//         }
//         for(var j = 50;j >= 15 ;j--){
//         	apix= ("api" + j);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(j,j).encodeABI()})
//         } 

//         req = await oracle.getRequestQ();
//         min = await utilities.testgetMin();
//         assert(web3.utils.hexToNumberString(min[0])== 1, "Min should be 1")
//         assert(web3.utils.hexToNumberString(min[1])== 30, "Min should be 30")
//     });

//     it("Test getMin payout and index 55 requests", async function () {
//          for(var i = 1;i <=55 ;i++){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i,i).encodeABI()})
//         }
//         req = await oracle.getRequestQ();
//         min = await utilities.testgetMin();
//         assert(web3.utils.hexToNumberString(min[0])== 6, "Min should be 6")
//         assert(web3.utils.hexToNumberString(min[1])== 45, "Min should be 45")    
//     });

//    it("Test 51 request and lowest is kicked out", async function () {
//    	    apiVars= await oracle.getRequestVars(1)
//         apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(0);
//         apiId = await oracle.getRequestIdByQueryHash(apiVars[2]);
//         assert(web3.utils.hexToNumberString(apiId) == 1, "timestamp on Q should be 1");
//          for(var i = 1;i <=51 ;i++){
//         	apix= ("api" + i);
//         	await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(i,i).encodeABI()})
//         }
//         let payoutPool = await oracle.getRequestQ();
//         for(var i = 2;i <=49 ;i++){
//         	assert(payoutPool[i] == 51-i)

//         }
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
//      	await helper.expectThrow(web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.submitMiningSolution("2",4,3000).encodeABI()}) );
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.submitMiningSolution("2",1,3000).encodeABI()})
//     });
//     it("Test competing API requests - multiple switches in API on Queue", async function () {
//     	 await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,0).encodeABI()})
// 		await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(2,0).encodeABI()})
//          await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(1,1).encodeABI()})
//          await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(2,2).encodeABI()})
//          await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(3,3).encodeABI()})
//          await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.addTip(4,4).encodeABI()})
//         vars = await oracle.getVariablesOnDeck();
//         let apiOnQ = web3.utils.hexToNumberString(vars['0']);
//         let apiPayout = web3.utils.hexToNumberString(vars['1']);
//         let sapi = vars['2'];
//         assert(apiOnQ == 2, "API on Q should be 2"); 
//         assert(sapi == api2, "API on Q string should be correct"); 
//         assert(apiPayout == 6, "API on Q payout should be 6"); 
//     });
//  });