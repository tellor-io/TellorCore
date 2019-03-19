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

// contract('Tellor User Contract Tests', function(accounts) {
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
//         tellorStorage= await TellorStorage.new();
//         await tellorStorage.setTellorContract(oracle.address);

//         await oracle.initStake();
//         await oracle.requestData(api,0);
//     });



// });