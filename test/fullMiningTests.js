// /**
//  * This tests the oracle functions, including mining.
//  */
// const Web3 = require("web3");
// const web3 = new Web3(
//   new Web3.providers.WebsocketProvider("ws://localhost:8545")
// );
// //var web3 = new Web3('http://localhost:8545');
// const helper = require("./helpers/test_helpers");
// const TellorMaster = artifacts.require("./TellorMaster.sol");
// const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
// var oracleAbi = Tellor.abi;
// var oracleByte = Tellor.bytecode;
// var OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
// var oldTellorABI = OldTellor.abi;

// var masterAbi = TellorMaster.abi;
// var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";

//   //Hardcoded adress because they need to be known when the TransitionCOntract is compiled
//   const baseAdd = "0x6511D2957aa09350494f892Ce2881851f0bb26D3";
//   const newAdd = "0x032Aa32e4069318b15e6462CE20926d4d821De90";


// function promisifyLogWatch(_address, _event) {
//   return new Promise((resolve, reject) => {
//     web3.eth.subscribe(
//       "logs",
//       {
//         address: _address,
//         topics: [web3.utils.sha3(_event)],
//       },
//       (error, result) => {
//         if (error) {
//           console.log("Error", error);
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       }
//     );
//   });
// }

// contract("Full Mining Tests", function(accounts) {
//   let oracle;
//   let oracle2;
//   let oracle3;
//   let newOracle;
//   let master;

//   beforeEach("Setup contract for each test", async function() {
//     oldTellor = await OldTellor.new();
//     oracle = await TellorMaster.new(oldTellor.address);
//     oracleBase = await Tellor.new();
//     oracle2 = await new web3.eth.Contract(oracleAbi, oracle.address);
//     master = await new web3.eth.Contract(masterAbi, oracle.address);
//     oldTellorinst = await new web3.eth.Contract(
//       oldTellorABI,
//       oldTellor.address
//     );
//     for (var i = 0; i < 10; i++) {
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
//     for (var i = 6; i < 10; i++) {
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[i],
//         gas: 7000000,
//         data: oldTellorinst.methods.depositStake().encodeABI(),
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
//     await oracle.changeTellorContract(oracleBase.address);
//     for (var i = 0; i < 5; i++) {
//       await web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[i],
//         gas: 7000000,
//         data: oracle2.methods[
//           "testSubmitMiningSolution(string,uint256,uint256)"
//         ]("nonce", 1, 1200).encodeABI(),
//       });
//     }

//     let newTellor = await Tellor.new({ from: accounts[9] });
//     transitionContract = await TransitionContract.new();
//     newTellor = await Tellor.at(newAdd);
//     let currTellor = await Tellor.at(baseAdd);
//     vars = await oracle2.methods.getNewCurrentVariables().call();
//     await oracle.changeTellorContract(transitionContract.address);
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
//     let add2 = await oracle.getAddressVars(
//       web3.utils.keccak256("tellorContract")
//     );
//     assert(add2 == newTellor.address, "contract should transition properly");
//   });
// //   it("Test miner", async function() {
// //      console.log("START MINING RIG!!");
// //      console.log(oracle.address)
// //     var logMineWatcher = await promisifyLogWatch(
// //       oracle.address,
// //       "NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)"
// //     );
// //     res = web3.eth.abi.decodeParameters(
// //       ["uint256", "uint256"],
// //       logMineWatcher.data
// //     );
// //     assert(res["1"] > 0, "value should be positive");
// //   });

// // it("Test 2 Mines", async function () {
// //   console.log(oracle.address)
// //       for(var i = 0;i < 2;i++){
// //           logMineWatcher = await promisifyLogWatch(oracle.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
// //     }
// //       res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
// //       assert(res[0] > 0, "value should be positive");
// //   });

// // it("Test Total Supply Increase", async function () {
// //       initTotalSupply = await oracle.totalSupply();
// //       logMineWatcher = await promisifyLogWatch(oracle.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
// //       newTotalSupply = await oracle.totalSupply();
// //       it= await web3.utils.fromWei(initTotalSupply, 'ether');
// //       ts= await web3.utils.fromWei(newTotalSupply, 'ether');
// //       assert(ts-it >= 13,"Difference should equal the payout");
// //       assert(ts-it < 15,"Difference should equal the payout");
// //   });

// // it("Test Total Supply decreasing increase", async function () {
// //       initTotalSupply = await oracle.totalSupply();
// //       logMineWatcher = await promisifyLogWatch(oracle.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
// //       newTotalSupply = await oracle.totalSupply();
// //       it= await web3.utils.fromWei(initTotalSupply, 'ether');
// //       ts= await web3.utils.fromWei(newTotalSupply, 'ether');
// //       tsChange = ts-it
// //       initTotalSupply = await oracle.totalSupply();
// //       logMineWatcher = await promisifyLogWatch(oracle.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
// //       newTotalSupply = await oracle.totalSupply();
// //       it= await web3.utils.fromWei(initTotalSupply, 'ether');
// //       ts= await web3.utils.fromWei(newTotalSupply, 'ether');
// //       tsChange2 = ts-it
// //       assert(tsChange2 < tsChange,"TS change should go down");
// //   });
// //   it("Test Is Data", async function () {
// //       res = await promisifyLogWatch(oracle.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
// //       res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.data)
// //       data = await oracle.getMinedBlockNum(1,res[1]);
// //       assert(data > 0, "Should be true if Data exist for that point in time");
// //   });
// //   it("Test Get Last Query", async function () {
// //       res = await promisifyLogWatch(oracle.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
// //       res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.data)
// //       res2 = await oracle.getLastNewValue();
// //       assert(res2 = res[0][4], "Ensure data exist for the last mine value");
// //   });
// //   it("Test Data Read", async function () {
// //       res = await promisifyLogWatch(oracle.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
// //       res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.data)
// //       res2 = await oracle.retrieveData(1,res[1]);
// //       assert(res2 = res[0][1], "Ensure data exist for the last mine value");
// //       res2 = await oracle.getTimestampbyRequestIDandIndex(2,0);
// //       assert(res2 == res[1]);
// //   });
// it("Test Miner Payout", async function () {
//     balances = []
//     for(var i = 0;i<6;i++){
//         balances[i] = await oracle.balanceOf(accounts[i]);
//     }
//     logMineWatcher = await promisifyLogWatch(oracle.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//     new_balances = []
//     for(var i = 0;i<6;i++){
//         new_balances[i] = await oracle.balanceOf(accounts[i]);
//     }
//     console.log(web3.utils.fromWei(new_balances[0]),web3.utils.fromWei(balances[0]))
//     assert(new_balances[0] -balances[0] <= web3.utils.toWei('3.75', 'ether'));
//     assert(new_balances[1] -balances[1] <= web3.utils.toWei('2.5', 'ether'));
//     assert(new_balances[2] - balances[2] <= web3.utils.toWei('2.5', 'ether'));
//     assert(new_balances[3] -balances[3] <= web3.utils.toWei('2.5', 'ether'));
//     assert(new_balances[4] -balances[4] <= web3.utils.toWei('2.5', 'ether'));
//     assert(new_balances[0] -balances[0] > web3.utils.toWei('2.5', 'ether'));
//     assert(new_balances[1] -balances[1] > web3.utils.toWei('2', 'ether'));
//     assert(new_balances[2] -balances[2] > web3.utils.toWei('2', 'ether'));
//     assert(new_balances[3] -balances[3] > web3.utils.toWei('2', 'ether'));
//     assert(new_balances[4] -balances[4] > web3.utils.toWei('2', 'ether'));
// });
// // it("Test miner upgrade", async function () {
// //         oldTellor = await OldTellor.new()
// //         oracle = await TellorMaster.new(oldTellor.address);
// //         master = await new web3.eth.Contract(masterAbi,oracle.address);
// //         oldTellorinst = await new web3.eth.Contract(oldTellorABI,oldTellor.address);
// //         for(var i = 0;i<6;i++){
// //             //print tokens
// //             await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.theLazyCoon(accounts[i],web3.utils.toWei('1100', 'ether')).encodeABI()})
// //         }
// //         for(var i=0; i<52;i++){
// //             x = "USD" + i
// //             apix = api + i
// //             await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.requestData(apix,x,1000,52-i).encodeABI()})
// //         }
// //         let q = await oracle.getRequestQ();
// //         //Deploy new upgraded Tellor
// //         oracleBase = await Tellor.new();
// //         oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);
// //         await oracle.changeTellorContract(oracleBase.address)
// //         for(var i = 0;i<5;i++){
// //           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods['submitMiningSolution(string,uint256,uint256)']("nonce",1,1200).encodeABI()})
// //         }
// //         res = await promisifyLogWatch(oracle.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');
// //         res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.data)
// //         data = await oracle.getMinedBlockNum(1,res[1]);
// //         assert(data > 0, "Should be true if Data exist for that point in time");
// //    })
// });
