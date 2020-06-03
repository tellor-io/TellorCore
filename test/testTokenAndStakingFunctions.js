// /** 
// * This contract tests the Oracle token and staking functions
// */ 

// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
// const BN = require('bn.js');
// const helper = require("./helpers/test_helpers");
// const TellorMaster = artifacts.require("./TellorMaster.sol");
// const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
// var OldTellor = artifacts.require("./oldContracts/OldTellor.sol")
// var oracleAbi = Tellor.abi;
// var tellorAbi = TellorMaster.abi;
// var masterAbi = TellorMaster.abi;
// var oracleByte = Tellor.bytecode;
// var api = 'json(https://api.gdax.com/products/BTC-USD/ticker).price';
// var api2 = 'json(https://api.gdax.com/products/ETH-USD/ticker).price';


// contract('Token and Staking Tests', function(accounts) {
//   let oracle;
//   let oracle2;
//   let oracleBase;
//   let oracle3;
//   let master;
//   let logNewValueWatcher;
//   let logMineWatcher;
//   let newOracle; 
//     beforeEach('Setup contract for each test', async function () {
//         oracleBase = await OldTellor.new();
//         oracle = await TellorMaster.new(oracleBase.address);
//                 master = await new web3.eth.Contract(masterAbi,oracle.address);
//         oracle3 = await new web3.eth.Contract(tellorAbi,oracleBase.address);
//         oracle2 = await new web3.eth.Contract(oracleAbi,oracleBase.address);///will this instance work for logWatch? hopefully...
//         // await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.init().encodeABI()})
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
//         await helper.advanceTime(86400 * 8);
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestStakingWithdraw().encodeABI()})
//         await helper.advanceTime(86400 * 8);
//         await web3.eth.sendTransaction({to:oracle.address,from:accounts[2],data:oracle2.methods.withdrawStake().encodeABI()})
//  });
//     it("getVariables", async function(){
//     	                    newOracle = await Tellor.new();
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//     	let res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,20).encodeABI()}) 
//         vars = await oracle.getCurrentVariables();
//         let miningApiId =vars['1'];
//         let difficulty = vars['2']
//         let sapi = vars['3'];
//         assert(miningApiId == 1, "miningApiId should be 1");
//         assert(difficulty == 1, "Difficulty should be 1");
//         assert.equal(sapi,api, "sapi = api");
//         assert(vars['4'] ==1000)
//     }); 

//     it("Get apiId", async function () {
//         balance1 = await web3.eth.call({to:oracle.address,data:oracle3.methods.balanceOf(accounts[2]).encodeABI()})
//         let res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,20).encodeABI()}) 
//                             newOracle = await Tellor.new();
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         apiVars= await oracle.getRequestVars(1)
//         apiId = await oracle.getRequestIdByQueryHash(apiVars[2]) 
//         assert(apiId == 1, "apiId should be 1");
//     });
//     it("Get apiHash", async function () {
//     	                    newOracle = await Tellor.new();
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
//         apiVars= await oracle.getRequestVars(1)
//         assert(apiVars[2] == web3.utils.soliditySha3({t:'string',v:api},{t:'uint256',v:1000}), "api on Q should be apiId");
//     });

//  });