/** 
* This tests the oracle functions, including mining.
*/
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');  
const helper = require("./helpers/test_helpers");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
const Reader = artifacts.require("./userFiles/Reader.sol"); // globally injected artifacts helper
const UserContract = artifacts.require("./userFiles/UserContract.sol"); // globally injected artifacts helper
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

contract('UserContract Tests', function(accounts) {
  let oracle;
  let oracle2;
  let logMineWatcher;
  let reader;
  let userContract;

    beforeEach('Setup contract for each test', async function () {
        oracleBase = await Oracle.new();
        oracle = await TellorMaster.new(oracleBase.address);
        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);///will this instance work for logWatch? hopefully...
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000, data: web3.utils.keccak256("tellorPostConstructor()")})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,0).encodeABI()})
        userContract = await UserContract.new(oracle.address);
        reader = await Reader.new(userContract.address,100,86400,[1],86400)
    });
    it("Test Base Derivative Contract - Optimistic Up Move", async function(){
      await reader.testContract(7 * 86400)
      var startTime = await reader.startDateTime.call();
      assert(startTime > 0, "Start time should be positive")
      assert(startTime == await reader.endDateTime.call() - 86400*7,"end date should be in a week")
      await reader.setValue(startTime, 1000);
      assert(await reader.getMyValuesByTimestamp(startTime) == 1000, "Start time should have the correct value");
      assert(await reader.getIsValue(startTime) == true, "get Is Value should be true");
      await helper.advanceTime(86400 * 10);
      await reader.setValue(await reader.endDateTime.call(), 2000);
      await reader.settleContracts();
      assert(reader.getIsValue(await reader.endDateTime.call()),"endTime should have a value");
      assert(await reader.getMyValuesByTimestamp(await reader.endDateTime.call()) == 2000, "End date should have correct value");
      assert(await reader.startValue.call() > 0, "Start Value should be positive");
      assert(await reader.endValue.call() > 0, "End Value should be positive")
      assert(await reader.longWins.call(), "Long should win");
      assert(await reader.contractEnded.call(), "the contract should be ended")
      let vars = await reader.getLastValueAfter(startTime*1 + 1);
      assert(vars[1] == 2000, "Get last value should work");

    })
    it("Test Base Derivative Contract - Optimistic Down Move", async function(){
      await reader.testContract(7 * 86400)
      var startTime = await reader.startDateTime.call();
      await reader.setValue(startTime, 1000);
      await helper.advanceTime(86400 * 10);
      console.log(startTime)
      console.log(7*86400 + 1 * startTime)
      console.log(await reader.endDateTime.call());
      await reader.setValue(await reader.endDateTime.call(), 500);
      await reader.settleContracts();
      assert(await reader.longWins.call() == false, "long should not win")
      assert(await reader.contractEnded.call(), "Contract should be ended")
    })
    it("Test Base Derivative Contract - Disputed Up Move", async function(){
      await reader.testContract(7 * 86400)
      assert(await reader.longWins.call())
      assert(await reader.contractEnded.call())
    })
    it("Test Base Derivative Contract - Disputed Down Move", async function(){
      await reader.testContract(7 * 86400)
      assert(await reader.longWins.call() == false)
      assert(await reader.contractEnded.call())
    })
    it("Test Ownership Transfer", async function(){
      assert(await reader.owner.call() == accounts[0]);
      await reader.transferOwnership(accounts[1]);
      assert(await reader.owner.call() == accounts[1]);
    })
    it("Test No Tributes in User Contract w/Solution", async function(){
    })
    it("Test 3 request ID avearge for Optimistic disputed Value", async function(){
      await reader.testContract(7 * 86400)
      assert(await reader.longWins.call())
      assert(await reader.contractEnded.call())
    })
    /*
List of All functions to Test

Optimistic 

  uint[] timestamps; //timestamps with values
  mapping(uint => bool) public disputedValues;
  mapping(uint => uint[]) public requestIdsIncluded;
  uint[] requestIds;
  uint public granularity;
  uint public disputeFee; //In Tributes
  uint public disputePeriod;

  //FUNCTIONS
  disputeOptimisticValue
  getNumberOfValuesPerTimestamp
  getTellorValues
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

    */
});