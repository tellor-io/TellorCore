/** 
* This contract tests the Tellor functions
*/ 

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');
const helper = require("./helpers/test_helpers");
//const ethers = require('ethers');
const Utilities = artifacts.require("./libraries/Utilities.sol");
const UtilitiesTests = artifacts.require("./UtilitiesTests.sol");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
var OldTellor = artifacts.require("./oldContracts/OldTellor.sol")

var oracleAbi = Tellor.abi;
var masterAbi = TellorMaster.abi;
var oracleByte = Tellor.bytecode;

var api = 'json(https://api.gdax.com/products/BTC-USD/ticker).price';
var api2 = 'json(https://api.gdax.com/products/ETH-USD/ticker).price';

function promisifyLogWatch(_contract,_event) {
  return new Promise((resolve, reject) => {
    web3.eth.subscribe('logs', {
      address: _contract.options.address,
      //topics:  ['0xba11e319aee26e7bbac889432515ba301ec8f6d27bf6b94829c21a65c5f6ff25']
    }, (error, result) => {
        if (error){
          console.log('Error',error);
          reject(error);
        }
        web3.eth.clearSubscriptions();
        //console.log(result);
        resolve(result);
    })
  });
}

contract('Further Tests', function(accounts) {
  let oracle;
  let oracle2;
  let oracleBase;
  let logNewValueWatcher;
  let master;
  let utilities;
  let newOracle;

    beforeEach('Setup contract for each test', async function () {
        oracleBase = await OldTellor.new();
        oracle = await TellorMaster.new(oracleBase.address);
        master = await new web3.eth.Contract(masterAbi,oracle.address);
        oracle2 = await new web3.eth.Contract(oracleAbi,oracleBase.address);///will this instance work for logWatch? hopefully...
        //await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.init().encodeABI()})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
        await helper.advanceTime(86400 * 8);
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestStakingWithdraw().encodeABI()})
        await helper.advanceTime(86400 * 8);
        await web3.eth.sendTransaction({to:oracle.address,from:accounts[2],data:oracle2.methods.withdrawStake().encodeABI()})
        utilities = await UtilitiesTests.new();
        await utilities.setTellorMaster(oracle.address);
   });  

   it("Test 5 values per block", async function () {
   	   assert(0==1)
   });
   it("Test lower difficulty target (5 min)", async function () {
   	   assert(0==1)
   });
    it("Test Adjusted Rounding Issue", async function () {
   	   assert(0==1)
   });
   it("Test limited rewards per miner", async function () {
   	   assert(0==1)
   });
   it("Test no time limit on disputes", async function () {
   	   assert(0==1)
   });
   it("Test multiple dispute rounds", async function () {
   	   assert(0==1)
   });
   it("Test multiple dispute rounds - different scenario", async function () {
   	   assert(0==1)
   });
   it("Test multiple dispute rounds - different scenario 2", async function () {
   	   assert(0==1)
   });
   it("Test allow tip of current mined ID", async function () {
   	   assert(0==1)
   });
      it("Test removal of request data", async function () {
   	   assert(0==1)
   });
   it("Test token fee burning", async function () {
   	   assert(0==1)
   });
   it("Test initial difficulty drop", async function () {
   	   assert(0==1)
   });
 });