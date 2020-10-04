// const helper = require("./helpers/test_helpers");
// const TellorMaster = artifacts.require("./TellorMaster.sol");
// let Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
// const TransitionContract = artifacts.require("./TellorTransition");
// var oracleAbi = Tellor.abi;
// var oracleByte = Tellor.bytecode;
// var OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
// var oldTellorABI = OldTellor.abi;
// var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");

// var masterAbi = TellorMaster.abi;
// var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
// var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";

// contract("Transition Tests", function(accounts) {
//   let oracleBase;
//   let oracle;
//   let oracle2;
//   let master;
//   let oldTellor;
//   let oldTellorinst;
//   let utilities;

//   //Hardcoded adress because they need to be known when the TransitionCOntract is compiled
//   const baseAdd = "0x6511D2957aa09350494f892Ce2881851f0bb26D3";
//   const newAdd = "0x032Aa32e4069318b15e6462CE20926d4d821De90";

//   beforeEach("Setup contract for each test", async function() {
//     oldTellor = await OldTellor.new();
//     oracle = await TellorMaster.new(oldTellor.address);
//     master = await new web3.eth.Contract(masterAbi, oracle.address);
//     oldTellorinst = await new web3.eth.Contract(
//       oldTellorABI,
//       oldTellor.address
//     );
//     for (var i = 0; i < 6; i++) {
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[0],
//         gas: 7000000,
//         data: oldTellorinst.methods
//           .theLazyCoon(accounts[i], web3.utils.toWei("5000", "ether"))
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
//         data: oldTellorinst.methods
//           .requestData(apix, x, 1000, 52 - i)
//           .encodeABI(),
//       });
//     }
//     let q = await oracle.getRequestQ();
//     //Deploy new upgraded Tellor
//     oracleBase = await Tellor.new({ from: accounts[9] });
//     oracle2 = await new web3.eth.Contract(oracleAbi, oracle.address);
//     await oracle.changeTellorContract(oracleBase.address);
//     for (var i = 0; i < 5; i++) {
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[i],
//         gas: 7000000,
//         data: oracle2.methods["testSubmitMiningSolution(string,uint256,uint256)"](
//           "nonce",
//           1,
//           1200
//         ).encodeABI(),
//       });
//     }
//     await helper.advanceTime(60 * 16);
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

//   it("Should transition correctly at the beginning of a block", async () => {
//     let add = await oracle.getAddressVars(
//       web3.utils.keccak256("tellorContract")
//     );
//     console.log("add", add);
//     let stakeAmount = await oracle.getUintVar(
//       web3.utils.keccak256("stakeAmount")
//     );
//     console.log("stakeAmount", stakeAmount.toString());

//     let newTellor = await Tellor.new({ from: accounts[9] });
//     transitionContract = await TransitionContract.new();

//     newTellor = await Tellor.at(newAdd);
//     let currTellor = await Tellor.at(baseAdd);

//     console.log("base", currTellor.address);
//     console.log("new", newTellor.address);
//     console.log("trans", transitionContract.address);
//     vars = await oracle2.methods.getNewCurrentVariables().call();
//     await oracle.changeTellorContract(transitionContract.address);
//     let add1 = await oracle.getAddressVars(
//       web3.utils.keccak256("tellorContract")
//     );
//     console.log("add1", add1);
//     await helper.advanceTime(60 * 16);
//     for (var i = 0; i < 5; i++) {
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[i],
//         gas: 10000000,
//         data: oracle2.methods
//           .testSubmitMiningSolution("nonce", vars["1"], [
//             1200,
//             1300,
//             1400,
//             1500,
//             1600,
//           ])
//           .encodeABI(),
//       });
//     }
//     // vars = await oracle2.methods.getNewCurrentVariables().call();
//     // console.log(vars);
//     let stakeAmount2 = await oracle.getUintVar(
//       web3.utils.keccak256("stakeAmount")
//     );
//     console.log("stakeAmount2", stakeAmount2.toString());
//     let add2 = await oracle.getAddressVars(
//       web3.utils.keccak256("tellorContract")
//     );
//     assert(add2 == newTellor.address, "contract should transition properly");
//     console.log("add2", add2);
//   });

//   it("Should transition correctly mid block", async () => {
//     let add = await oracle.getAddressVars(
//       web3.utils.keccak256("tellorContract")
//     );
//     console.log("add", add);
//     let stakeAmount = await oracle.getUintVar(
//       web3.utils.keccak256("stakeAmount")
//     );
//     console.log("stakeAmount", stakeAmount.toString());

//     let newTellor = await Tellor.new({ from: accounts[9] });
//     let transitionContract = await TransitionContract.new();

//     newTellor = await Tellor.at(newAdd);
//     let currTellor = await Tellor.at(baseAdd);
//     transitionContract = await TransitionContract.new();

//     console.log("base", currTellor.address);
//     console.log("new", newTellor.address);
//     console.log("trans", transitionContract.address);
//     vars = await oracle2.methods.getNewCurrentVariables().call();
//     await helper.advanceTime(60 * 16);
//     //Mine First Block
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[0],
//       gas: 10000000,
//       data: oracle2.methods
//         .testSubmitMiningSolution("nonce", vars["1"], [
//           1200,
//           1300,
//           1400,
//           1500,
//           1600,
//         ])
//         .encodeABI(),
//     });
//     //Change contract
//     await oracle.changeTellorContract(transitionContract.address);
//         let add2 = await oracle.getAddressVars(
//       web3.utils.keccak256("tellorContract")
//     );
//     assert(add2 == transitionContract.address, "contract should transition properly");
//         await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 10000000,
//       data: oracle2.methods
//         .testSubmitMiningSolution("nonce", vars["1"], [
//           1200,
//           1300,
//           1400,
//           1500,
//           1600,
//         ])
//         .encodeABI(),
//     });
//     await oracle.changeTellorContract(transitionContract.address);
//     add2 = await oracle.getAddressVars(
//       web3.utils.keccak256("tellorContract")
//     );
//     assert(add2 == transitionContract.address, "contract should transition properly");
//     //Those Should do through old address
//     for (var i = 2; i < 5; i++) {
//       let stakeAmount = await oracle.getUintVar(
//         web3.utils.keccak256("stakeAmount")
//       );
//       console.log("stakeAmount", stakeAmount.toString());
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[i],
//         gas: 10000000,
//         data: oracle2.methods
//           .testSubmitMiningSolution("nonce", vars["1"], [
//             1200,
//             1300,
//             1400,
//             1500,
//             1600,
//           ])
//           .encodeABI(),
//       });
//     }
//     vars = await oracle2.methods.getNewCurrentVariables().call();
//     await helper.advanceTime(60 * 16);
//     //This should go to newAdd
//     for (var i = 0; i < 5; i++) {
//       console.log("New Block ------------");
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[i],
//         gas: 10000000,
//         data: oracle2.methods
//           .testSubmitMiningSolution("nonce", vars["1"], [
//             1200,
//             1300,
//             1400,
//             1500,
//             1600,
//           ])
//           .encodeABI(),
//       });
//       let stakeAmount = await oracle.getUintVar(
//         web3.utils.keccak256("stakeAmount")
//       );
//       console.log("stakeAmount2", stakeAmount.toString());
//     }

//     // vars = await oracle2.methods.getNewCurrentVariables().call();
//     // console.log(vars);
//     let stakeAmount2 = await oracle.getUintVar(
//       web3.utils.keccak256("stakeAmount")
//     );
//     console.log("stakeAmount2", stakeAmount2.toString());
//     add2 = await oracle.getAddressVars(
//       web3.utils.keccak256("tellorContract")
//     );
//     assert(add2 == newTellor.address, "contract should transition properly");
//     console.log("add2", add2);
//   });
// });
