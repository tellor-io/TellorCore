/**
 * This tests the oracle functions, including mining.
 */
// const Web3 = require("web3");
// const web3 = new Web3(
//   new Web3.providers.WebsocketProvider("ws://localhost:8545")
// );
// //var web3 = new Web3('http://localhost:8545');
// const helper = require("./helpers/test_helpers");
// const TellorMaster = artifacts.require("./TellorMaster.sol");

// var OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
// var oldTellorABI = OldTellor.abi;
// const TransitionContract = artifacts.require("./TellorTransition");
// const TestLib = require("./helpers/testLib");
// const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
// var oracleAbi = Tellor.abi;
// var oracleByte = Tellor.bytecode;

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
//   let transitionContract

//   beforeEach("Setup contract for each test", async function() {
//         master = await TestLib.getV25(accounts, true);
//     env = {
//       master: master,
//       accounts: accounts,
//     };  
    // var transition = false
    // oldTellor = await OldTellor.new();
    // oracle = await TellorMaster.new(oldTellor.address);
    // oracleBase = await Tellor.new();
    // oracle2 = await new web3.eth.Contract(oracleAbi, oracle.address);
    // master = await new web3.eth.Contract(masterAbi, oracle.address);
    // oldTellorinst = await new web3.eth.Contract(
    //   oldTellorABI,
    //   oldTellor.address
    // );
    // for (var i = 0; i < 10; i++) {
    //   //print tokens
    //   await web3.eth.sendTransaction({
    //     to: oracle.address,
    //     from: accounts[0],
    //     gas: 7000000,
    //     data: oldTellorinst.methods
    //       .theLazyCoon(accounts[i], web3.utils.toWei("1100", "ether"))
    //       .encodeABI(),
    //   });
    // }
    // for (var i = 6; i < 10; i++) {
    //   await web3.eth.sendTransaction({
    //     to: oracle.address,
    //     from: accounts[i],
    //     gas: 7000000,
    //     data: oldTellorinst.methods.depositStake().encodeABI(),
    //   });
    // }
    // for (var i = 0; i < 52; i++) {
    //   x = "USD" + i;
    //   apix = api + i;
    //   await web3.eth.sendTransaction({
    //     to: oracle.address,
    //     from: accounts[0],
    //     gas: 7000000,
    //     data: oldTellorinst.methods
    //       .requestData(apix, x, 1000, 52 - i)
    //       .encodeABI(),
    //   });
    // }
    // let q = await oracle.getRequestQ();
    // //Deploy new upgraded Tellor
    // await oracle.changeTellorContract(oracleBase.address);
    // for (var i = 0; i < 5; i++) {
    //   await web3.eth.sendTransaction({
    //     to: oracle.address,
    //     from: accounts[i],
    //     gas: 7000000,
    //     data: oracle2.methods[
    //       "submitMiningSolution(string,uint256,uint256)"
    //     ]("nonce", 1, 1200).encodeABI(),
    //   });
    // }

	//   let newTellor = transition
	//     ? await Tellor.new({ from: accounts[9] })
	//     : await Tellor.new();

	//   transitionContract = await TransitionContract.new();
	//   newTellor = await Tellor.at(newAdd);
    // await oracle.changeTellorContract(transitionContract.address);
    // await helper.advanceTime(60 * 15);
  //});
//   it("Test miner", async function() {
//      console.log("START MINING RIG!!");
//      console.log(oracle.address)
//     var logMineWatcher = await promisifyLogWatch(
//       oracle.address,
//       "NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)"
//     );
//     res = web3.eth.abi.decodeParameters(
//       ["uint256", "uint256"],
//       logMineWatcher.data
//     );
//     assert(res["1"] > 0, "value should be positive");
//   });

// it("Test 2 Mines", async function () {
//   console.log(master.address)
//       for(var i = 0;i < 2;i++){
//           logMineWatcher = await promisifyLogWatch(master.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//     }
//       res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
//       assert(res[0] > 0, "value should be positive");
//   });

// it("Test Total Supply Increase", async function () {
//       initTotalSupply = await master.totalSupply();
//       logMineWatcher = await promisifyLogWatch(master.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//       newTotalSupply = await master.totalSupply();
//       it= await web3.utils.fromWei(initTotalSupply, 'ether');
//       ts= await web3.utils.fromWei(newTotalSupply, 'ether');
//       console.log(ts-it);
//       assert(ts-it >= 16.5,"Difference should equal the payout");
//       assert(ts-it < 20,"Difference should equal the payout");
//   });

// it("Test Total Supply decreasing increase", async function () {
//       initTotalSupply = await master.totalSupply();
//       logMineWatcher = await promisifyLogWatch(master.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//       newTotalSupply = await master.totalSupply();
//       it= await web3.utils.fromWei(initTotalSupply, 'ether');
//       ts= await web3.utils.fromWei(newTotalSupply, 'ether');
//       tsChange = ts-it
//       initTotalSupply = await master.totalSupply();
//       logMineWatcher = await promisifyLogWatch(master.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//       newTotalSupply = await master.totalSupply();
//       it= await web3.utils.fromWei(initTotalSupply, 'ether');
//       ts= await web3.utils.fromWei(newTotalSupply, 'ether');
//       tsChange2 = ts-it
//       assert(tsChange2 < tsChange,"TS change should go down");
//   });
//   it("Test Is Data", async function () {
//       res = await promisifyLogWatch(master.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//       res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.data)
//       data = await master.getMinedBlockNum(1,res[1]);
//       assert(data > 0, "Should be true if Data exist for that point in time");
//   });
//   it("Test Get Last Query", async function () {
//       res = await promisifyLogWatch(master.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//       res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.data)
//       res2 = await master.getLastNewValue();
//       assert(res2 = res[0][4], "Ensure data exist for the last mine value");
//   });
//   it("Test Data Read", async function () {
//       res = await promisifyLogWatch(master.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//       res = web3.eth.abi.decodeParameters(['uint256[5]','uint256','uint256[5]','uint256'],res.data)
//       res2 = await master.retrieveData(1,res[1]);
//       assert(res2 = res[0][1], "Ensure data exist for the last mine value");
//       res2 = await master.getTimestampbyRequestIDandIndex(2,0);
//       assert(res2 == res[1]);
//   });
// it("Test Miner Payout", async function () {
//     balances = []
//     for(var i = 0;i<6;i++){
//         balances[i] = await master.balanceOf(accounts[i]);
//     }
//     logMineWatcher = await promisifyLogWatch(master.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//     new_balances = []
//     for(var i = 0;i<6;i++){
//         new_balances[i] = await master.balanceOf(accounts[i]);
//     }
//     console.log(web3.utils.fromWei(new_balances[0]),web3.utils.fromWei(balances[0]))
//     assert(new_balances[0] -balances[0] <= web3.utils.toWei('5', 'ether'));
//     assert(new_balances[1] -balances[1] <= web3.utils.toWei('3.5', 'ether'));
//     assert(new_balances[2] - balances[2] <= web3.utils.toWei('3.5', 'ether'));
//     assert(new_balances[3] -balances[3] <= web3.utils.toWei('3.5', 'ether'));
//     assert(new_balances[4] -balances[4] <= web3.utils.toWei('3.5', 'ether'));
//     assert(new_balances[0] -balances[0] > web3.utils.toWei('4.5', 'ether'));
//     assert(new_balances[1] -balances[1] > web3.utils.toWei('3', 'ether'));
//     assert(new_balances[2] -balances[2] > web3.utils.toWei('3', 'ether'));
//     assert(new_balances[3] -balances[3] > web3.utils.toWei('3', 'ether'));
//     assert(new_balances[4] -balances[4] > web3.utils.toWei('3', 'ether'));
// });
//});