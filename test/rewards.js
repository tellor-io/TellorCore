// const Web3 = require("web3");
// const web3 = new Web3(
//   new Web3.providers.WebsocketProvider("ws://localhost:8545")
// );
// const helper = require("./helpers/test_helpers");
// const TellorMaster = artifacts.require("./TellorMaster.sol");
// const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
// var oracleAbi = Tellor.abi;
// var oracleByte = Tellor.bytecode;
// var OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
// var oldTellorABI = OldTellor.abi;
// var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");

// var masterAbi = TellorMaster.abi;
// var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
// var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";

// const takeFive = async (times = 1) => {
//   helper.advanceTime(60 * 5 * times);
// };

// contract("Further Tests w/ Upgrade", function(accounts) {
//   let oracleBase;
//   let oracle;
//   let oracle2;
//   let master;
//   let oldTellor;
//   let oldTellorinst;
//   let utilities;

//   const gerRequestsId = async () => {
//     vars = await oracle2.methods.getNewCurrentVariables().call();
//     return vars["_requestIds"];
//   };

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
//     await helper.advanceTime(60 * 5);
//     for (var i = 0; i < 5; i++) {
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[i],
//         gas: 10000000,
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
//   it("Inflation is fixed", async function() {
//     let rew = await oracle.getUintVar(web3.utils.keccak256("currentReward"));
//     assert.equal(rew.toString(), "1000000000000000000");
//   });

//   it("Rewards are proportional to time passed", async () => {
//     await takeFive(8); // take * times 5min
//     let ids = await gerRequestsId();
//     let res;
//     let balBef = await oracle.balanceOf(accounts[1]);
//     for (var i = 0; i < 5; i++) {
//       res = await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[i],
//         gas: 10000000,
//         data: oracle2.methods
//           .testSubmitMiningSolution("nonce", ids, [
//             1200,
//             1300,
//             1400,
//             1500,
//             1600,
//           ])
//           .encodeABI(),
//       });
//     }
//     let balAfter = await oracle.balanceOf(accounts[1]);
//     console.log(balBef.toString());
//     console.log(balAfter.toString());
//     console.log(balAfter.sub(balBef).toString());
//   });
// });
