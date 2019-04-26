/** 
* This tests the oracle functions, including mining.
*/
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');  
const helper = require("./helpers/test_helpers");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;

var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";
function promisifyLogWatch(_contract,_event) {
  return new Promise((resolve, reject) => {
    web3.eth.subscribe('logs', {
      address: _contract.options.address,
      topics: [web3.utils.sha3(_event)]
    }, (error, result) => {
        if (error){
          console.log('Error',error);
          reject(error);
        }
        web3.eth.clearSubscriptions();
        resolve(result);
    })
  });
}

contract('Mining Tests', function(accounts) {
  let oracle;
  let oracle2;
  let logMineWatcher;

    beforeEach('Setup contract for each test', async function () {
        oracleBase = await Oracle.new();
        oracle = await TellorMaster.new(oracleBase.address);
        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);///will this instance work for logWatch? hopefully...
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000, data: web3.utils.keccak256("tellorPostConstructor()")})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,0).encodeABI()})
    });
    it("Test Base Derivative Contract - Optimistic Up Move", async function(){
    })
    it("Test Base Derivative Contract - Optimistic Down Move", async function(){
    })
    it("Test Base Derivative Contract - Disputed Up Move", async function(){
    })
    it("Test Base Derivative Contract - Disputed Down Move", async function(){
    })
    it("Test Ownership Transfer", async function(){
    })
    it("Test No Tributes in User Contract w/Solution", async function(){
    })
    it("Test 3 request ID avearge for Optimistic disputed Value", async function(){
    })
    /*
List of All functions to Test
Reader 

  uint public startDateTime;
  uint public endDateTime;
  uint public startValue;
  uint public endValue;
  bool public longWins;
  bool public contractEnded;

  //Functions
  testContract
  settleContracts

Optimistic 

  uint[] timestamps; //timestamps with values
  mapping(uint => bool) public disputedValues;
  mapping(uint => uint[]) public requestIdsIncluded;
  uint[] requestIds;
  uint public granularity;
  uint public disputeFee; //In Tributes
  uint public disputePeriod;

  //FUNCTIONS
  setValue
  disputeOptimisticValue
  getMyValuesByTimestamp
  getNumberOfValuesPerTimestamp
  getIsValue
  getTellorValues
  getLastValueAfter
  getLastUndisputedValueAfter
  getCurrentValue() 

User Contract 

  address payable public owner;
  uint public apiId;
  uint public spread;//in thousands * 100.  So a 5% spread is 1000  + .05 *1000 = 1050
  uint public tributePrice;
  address payable public tellorStorageAddress;

  //FUNCTIONS
  transferOwnership
  withdrawEther
  requestDataWithEther
  addTipWithEther
  setSpread
  setPrice

UsingTellor
  address public owner;

  //Functions
   getCurrentValue
   getFirstVerifiedDataAfter
   getAnyDataAfter
   requestData
   requestDataWithEther
   addTip
   addTipWithEther
   setUserContract
   transferOwnership

    */
});