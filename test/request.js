// const helper = require("./helpers/test_helpers");
// const TellorMaster = artifacts.require("./TellorMaster.sol");
// const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
// var oracleAbi = Tellor.abi;
// var OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
// var oldTellorABI = OldTellor.abi;
// var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");

// var masterAbi = TellorMaster.abi;
// var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
// var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";

// contract("Request and tip tests", function(accounts) {
//   let oracleBase;
//   let oracle;
//   let oracle2;
//   let master;
//   let oldTellor;
//   let oldTellorinst;
//   let utilities;

//   beforeEach("Setup contract for each test", async function() {
//     //deploy old, request, update address, mine old challenge.
//     oldTellor = await OldTellor.new();
//     oracle = await TellorMaster.new(oldTellor.address);
//     master = await new web3.eth.Contract(masterAbi, oracle.address);
//     oldTellorinst = await new web3.eth.Contract(
//       oldTellorABI,
//       oldTellor.address
//     );
//     for (var i = 0; i < 6; i++) {
//       //print tokens
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[0],
//         gas: 7000000,
//         data: oldTellorinst.methods
//           .theLazyCoon(accounts[i], web3.utils.toWei("1100", "ether"))
//           .encodeABI(),
//       });
//     }
//     for (var i = 0; i < 52; i++) {
//       x = "USD" + i;
//       apix = api + i;
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[0],
//         gas: 7000000,
//         data: oldTellorinst.methods.requestData(apix, x, 1000, 0).encodeABI(),
//       });
//     }
//     //Deploy new upgraded Tellor
//     oracleBase = await Tellor.new();
//     oracle2 = await new web3.eth.Contract(oracleAbi, oracle.address);
//     await oracle.changeTellorContract(oracleBase.address);
//     for (var i = 0; i < 5; i++) {
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[i],
//         gas: 7000000,
//         data: oracle2.methods["submitMiningSolution(string,uint256,uint256)"](
//           "nonce",
//           1,
//           1200
//         ).encodeABI(),
//       });
//     }
//   });

//   it("test utilities", async function() {
//     var myArr = [];
//     for (var i = 50; i >= 0; i--) {
//       myArr.push(i);
//     }
//     utilities = await UtilitiesTests.new(oracle.address);
//     let minT = await utilities.testgetMins(myArr);
//     assert(minT[0] == 0);
//     assert(minT[1] == 50, "index should be correct");
//   });
//   it("Add Tip", async function() {
//     res = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[0],
//       gas: 7000000,
//       data: oracle2.methods.addTip(11, 20).encodeABI(),
//     });
//     apiVars = await oracle.getRequestVars(11);
//     assert(apiVars[5] == 20, "value pool should be 20");
//   });
//   it("several request data", async function() {
//     let req1 = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.addTip(41, 100).encodeABI(),
//     });
//     req1 = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.addTip(42, 100).encodeABI(),
//     });
//     req1 = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.addTip(43, 100).encodeABI(),
//     });
//     req1 = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.addTip(44, 100).encodeABI(),
//     });
//     req1 = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.addTip(31, 20).encodeABI(),
//     });
//     data = await oracle2.methods.getNewVariablesOnDeck().call();
//     assert(data[0].includes("41"), "ID on deck should be 41");
//     assert(data[0].includes("31"), "ID on deck should be 31");
//     assert(data[1].includes("20"), "Tip should be over 20");
//     req1 = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.addTip(32, 40).encodeABI(),
//     });
//     data = await oracle2.methods.getNewVariablesOnDeck().call();
//     assert(data[0].includes("42"), "ID on deck should be 41");
//     assert(data[0].includes("32"), "ID on deck should be 30");
//     assert(data[1].includes("40"), "Tip should be 30");
//     req1 = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.addTip(33, 50).encodeABI(),
//     });
//     data = await oracle2.methods.getNewVariablesOnDeck().call();
//     assert(data[0].includes("43"), "ID on deck should be 43");
//     assert(data[0].includes("33"), "ID on deck should be 30");
//     assert(data[1].includes("50"), "Tip should be 50");
//     req1 = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.addTip(34, 60).encodeABI(),
//     });
//     data = await oracle2.methods.getNewVariablesOnDeck().call();
//     assert(data[0].includes("44"), "ID on deck should be 44");
//     assert(data[0].includes("34"), "ID on deck should be 30");
//     assert(data[1].includes("60"), "Tip should be 60");
//   });
//   it("Request data and change on queue with another request", async function() {
//     balance1 = await oracle.balanceOf(accounts[2], { from: accounts[1] });
//     let pay = web3.utils.toWei("20", "ether");
//     let pay2 = web3.utils.toWei("50", "ether");
//     let res3 = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.addTip(31, pay).encodeABI(),
//     });
//     apiVars = await oracle.getRequestVars(31);
//     assert(apiVars[5] == pay, "value pool should be 20");
//     data = await oracle2.methods.getNewVariablesOnDeck().call();
//     assert(data[0].includes("31"), "ID on deck should be 31");
//     res3 = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.addTip(32, pay2).encodeABI(),
//     });
//     data = await oracle2.methods.getNewVariablesOnDeck().call();
//     assert(data[0].includes("31"), "ID on deck should be 31");
//     assert(data[0].includes("32"), "ID on deck should be 31");
//     assert(data[1].includes(pay), "ID on deck should be 31");
//     assert(data[1].includes(pay2), "ID on deck should be 31");
//     balance2 = await oracle.balanceOf(accounts[2], { from: accounts[1] });
//     assert(
//       web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 70,
//       "balance should be down by 70"
//     );
//   });
//   it("Test getMax payout and index 51 req with overlapping tips and requests", async function() {
//     utilities = await UtilitiesTests.new(oracle.address);
//     for (var i = 1; i <= 21; i++) {
//       //apix= ("api" + i);
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[2],
//         gas: 7000000,
//         data: oracle2.methods.addTip(i, i).encodeABI(),
//       });
//     }
//     for (var j = 15; j <= 45; j++) {
//       apix = "api" + j;
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[2],
//         gas: 7000000,
//         data: oracle2.methods.addTip(j, j).encodeABI(),
//       });
//     }
//     max = await utilities.testgetMax();
//     assert(web3.utils.hexToNumberString(max[0]) == 45, "Max should be 45");
//     assert(web3.utils.hexToNumberString(max[1]) == 11, "Max should be 11"); //note first 5 are added
//   });

//   it("Test getMax payout and index 60 requests", async function() {
//     utilities = await UtilitiesTests.new(oracle.address);
//     for (var i = 1; i <= 60; i++) {
//       apix = "api" + i;
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[2],
//         gas: 7000000,
//         data: oracle2.methods.addTip(i, i).encodeABI(),
//       });
//     }
//     max = await utilities.testgetMax();
//     assert(max[0] == 60, "Max should be 60");
//     assert(max[1] == 46, "Max should be 46");
//   });

//   it("Test getMax payout and index 100 requests", async function() {
//     utilities = await UtilitiesTests.new(oracle.address);
//     for (var i = 1; i <= 55; i++) {
//       apix = "api" + i;
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[2],
//         gas: 7000000,
//         data: oracle2.methods.addTip(i, i).encodeABI(),
//       });
//     }
//     for (var j = 50; j <= 95; j++) {
//       apix = "api" + j;
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[2],
//         gas: 7000000,
//         data: oracle2.methods.addTip(j, j).encodeABI(),
//       });
//     }

//     req = await oracle.getRequestQ();
//     max = await utilities.testgetMax();
//     assert(max[0] == 110, "Max should be 110");
//     assert(max[1] == 1, "Max should be 46");
//   });

//   it("utilities Test getMin payout and index 10 req with overlapping tips and requests", async function() {
//     utilities = await UtilitiesTests.new(oracle.address);
//     apiVars = await oracle.getRequestVars(1);
//     apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(0);
//     apiId = await oracle.getRequestIdByQueryHash(apiVars[2]);
//     assert(
//       web3.utils.hexToNumberString(apiId) == 1,
//       "timestamp on Q should be 1"
//     );
//     for (var i = 10; i >= 1; i--) {
//       apix = "api" + i;
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[2],
//         gas: 7000000,
//         data: oracle2.methods.addTip(i, i).encodeABI(),
//       });
//     }

//     req = await oracle.getRequestQ();
//     min = await utilities.testgetMin();
//     assert(min[0] == 0, "Min should be 0");
//     assert(min[1] == 45, "Min should be 40");
//   });

//   it("Test getMin payout and index 51 req count down with overlapping tips and requests", async function() {
//     utilities = await UtilitiesTests.new(oracle.address);
//     apiVars = await oracle.getRequestVars(1);
//     apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(0);
//     apiId = await oracle.getRequestIdByQueryHash(apiVars[2]);
//     assert(
//       web3.utils.hexToNumberString(apiId) == 1,
//       "timestamp on Q should be 1"
//     );
//     for (var i = 21; i >= 1; i--) {
//       apix = "api" + i;
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[2],
//         gas: 7000000,
//         data: oracle2.methods.addTip(i, i).encodeABI(),
//       });
//     }

//     for (var j = 45; j >= 15; j--) {
//       apix = "api" + j;
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[2],
//         gas: 7000000,
//         data: oracle2.methods.addTip(j, j).encodeABI(),
//       });
//     }

//     req = await oracle.getRequestQ();
//     min = await utilities.testgetMin();
//     assert(min[0] == 0, "Min should be 0");
//     assert(min[1] == 10, "Min should be 5");
//     assert(req[44] == 30, "request 15 is submitted twice this should be 30");
//     assert(req[50] == 42, "request 21 is submitted twice this should be 42");
//   });

//   it("Test getMin payout and index 55 requests", async function() {
//     utilities = await UtilitiesTests.new(oracle.address);
//     for (var i = 1; i <= 55; i++) {
//       apix = "api" + i;
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[2],
//         gas: 7000000,
//         data: oracle2.methods.addTip(i, i).encodeABI(),
//       });
//     }
//     req = await oracle.getRequestQ();
//     min = await utilities.testgetMins(req);
//     assert(min[0] == 6, "Min should be 6");
//     assert(min[1] == 50, "Min should be 45");
//   });

//   it("Test 51 request and lowest is kicked out", async function() {
//     for (var i = 1; i <= 56; i++) {
//       apix = "api" + i;
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[2],
//         gas: 7000000,
//         data: oracle2.methods.addTip(i, i).encodeABI(),
//       });
//     }
//     let payoutPool = await oracle.getRequestQ();
//     for (var i = 6; i <= 45; i++) {
//       assert(payoutPool[i] == 51 - i + 5, "should be equal");
//     }
//     apiVars = await oracle.getRequestVars(52);
//     apiIdforpayoutPoolIndex = await oracle.getRequestIdByRequestQIndex(50);
//     vars = await oracle2.methods.getNewVariablesOnDeck().call();
//     let apiOnQ = vars[0];
//     let apiPayout = vars[1];
//     assert(apiIdforpayoutPoolIndex == 56, "position 1 should be booted");
//     assert(apiPayout.includes("56"), "API on Q payout should be 51");
//     assert(apiOnQ.includes("56"), "API on Q should be 51");
//     assert(apiVars[4] == 4, "position 1 should have correct value");
//   });

//   it("Test Throw on wrong apiId", async function() {
//     await helper.expectThrow(
//       web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[0],
//         gas: 7000000,
//         data: oracle2.methods
//           .testSubmitMiningSolution(
//             "nonce",
//             [6, 2, 3, 4, 5],
//             [1200, 1300, 1400, 1500, 1600]
//           )
//           .encodeABI(),
//       })
//     );
//     for (var i = 0; i < 5; i++) {
//       res = await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[i],
//         gas: 7000000,
//         data: oracle2.methods
//           .testSubmitMiningSolution(
//             "nonce",
//             [1, 2, 3, 4, 5],
//             [1200, 1300, 1400, 1500, 1600]
//           )
//           .encodeABI(),
//       });
//     }
//   });
// });
