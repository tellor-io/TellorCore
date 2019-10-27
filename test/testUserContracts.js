/** 
* This tests the oracle functions, including mining.
*/
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');  
const helper = require("./helpers/test_helpers");
const UserContract = artifacts.require("./UserContract.sol");
const Reader = artifacts.require("./TestContract.sol");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
//var OldTellor = artifacts.require("./oldContracts/OldTellor.sol")
var masterAbi = TellorMaster.abi;
const oracleAbi = Tellor.abi;

var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
var api3 = "json(https://api.gdax.com/products/ETH-BTC/ticker).price";
var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";

function promisifyLogWatch(_address,_event) {
  return new Promise((resolve, reject) => {
    web3.eth.subscribe('logs', {
      address: _address,
      topics: [web3.utils.sha3(_event)]
    }, (error, result) => {
        if (error){
          console.log('Error',error);
          reject(error);
        }
        else{
       	resolve(result);
    	}
    })
  });
}

contract('UserContract Tests', function(accounts) {
  let oracle;
  let oracle2;
  let logMineWatcher;
  let reader;
  let oa;
  let master;
  let userContract;
  let newOracle;

    beforeEach('Setup contract for each test', async function () {
        //oracleBase = await OldTellor.new();
oracleBase = await Tellor.new();
        oracle = await TellorMaster.new(web3.utils.toChecksumAddress(oracleBase.address));
                master = await new web3.eth.Contract(masterAbi,oracle.address);
        oa = (web3.utils.toChecksumAddress(oracle.address))
        oracle2 = await new web3.eth.Contract(oracleAbi,oa);///will this instance work for logWatch? hopefully...
        await web3.eth.sendTransaction({to:oa,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
        userContract = await UserContract.new(oa);
        reader = await Reader.new(userContract.address,10,86400*3,[1],86400)
        await reader.setUserContract(userContract.address);
        await web3.eth.sendTransaction({to:oa,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[2],web3.utils.toWei('5000', 'ether')).encodeABI()})
        newOracle = await Tellor.new();
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:master.methods.changeTellorContract(newOracle.address).encodeABI()})
    });
    /*it("Test Base Derivative Contract - Optimistic Up Move", async function(){
      await reader.testContract(7 * 86400)
      var startTime = await reader.startDateTime.call();
      assert(startTime > 0, "Start time should be positive")
      assert(startTime == await reader.endDateTime.call() - 86400*7,"end daSte should be in a week")
      await reader.setValue(startTime, 1000);
      assert(await reader.getMyValuesByTimestamp(startTime) == 1000, "Start time should have the correct value");
      assert(await reader.getIsValue(startTime) == true, "get Is Value should be true");
      await helper.advanceTime(86400 * 110);
      await reader.setValue(await reader.endDateTime.call(), 2000);
      await reader.settleContracts();
      assert(reader.getIsValue(await reader.endDateTime.call()),"endTime should have a value");
      assert(await reader.getMyValuesByTimestamp(await reader.endDateTime.call()) == 2000, "End date should have correct value");
      assert(await reader.startValue.call() > 0, "Start Value should be positive");
      assert(await reader.endValue.call() > 0, "End Value should be positive")
      assert(await reader.longWins.call(), "Long should win");
      assert(await reader.contractEnded.call(), "the contract should be ended")
      let vars = await reader.getFirstUndisputedValueAfter(startTime*1 + 1);
      assert(vars[1] == 2000, "Get last value should work");

    })
    it("Test Base Derivative Contract - Optimistic Down Move", async function(){
      await reader.testContract(7 * 86400)
      var startTime = await reader.startDateTime.call();
      await reader.setValue(startTime, 1000);
      await helper.advanceTime(86400 * 11);
      await reader.setValue(await reader.endDateTime.call(), 500);

      await reader.settleContracts();
      assert(await reader.longWins.call() == false, "long should not win")
      assert(await reader.contractEnded.call(), "Contract should be ended")
      let vars = await reader.getTimestamps()
      assert(vars[0] * 1 == startTime * 1 , "Start time should be correct");
      assert(await reader.getCurrentValue() == 500, "endValue should be currentValue")
    })
    it("Test Ownership Transfer", async function(){
      assert(await reader.owner.call() == accounts[0]);
      await reader.transferOwnership(accounts[1]);
      assert(await reader.owner.call() == accounts[1]);
      assert(await userContract.owner.call() == accounts[0])
      await userContract.transferOwnership(accounts[1]);
      assert(await userContract.owner.call() == accounts[1]);
    })
    it("Test Base Derivative Contract - Disputed Up Move", async function(){
      await reader.testContract(7 * 86400)
      var startTime = await reader.startDateTime.call();
      var endTime = await reader.endDateTime.call();
      await reader.setValue(startTime, 1000);
      await helper.advanceTime(86400 * 10);
      await reader.setValue(await reader.endDateTime.call(), 500);
      let vars = await reader.getTimestamps()
      assert(vars[0] - startTime == 0, "getTimestamps should work");
      assert(vars[1] - endTime == 0, "getTimestamps should work");
      assert(await reader.disputeFee.call() == 10);
      assert(await reader.disputePeriod.call() == 86400*3, "dispute Period should be correct");
      assert(await reader.granularity.call() == 86400);
      //launch and mine one on Tellor
      //set up the contracts to handle getting the value
      console.log('START MINING RIG!!');
      logMineWatcher = await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      let res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
      assert(res['0'] - 0 > 0, "value should be positive");
      let mydata = oracle2.methods.approve(reader.address,10).encodeABI()
      let x = await web3.eth.sendTransaction({to:oa,from:accounts[2],gas:7000000,data:mydata})
      assert(await oracle.getNewValueCountbyRequestId(1) == 1, "should have a newValue count")
      await reader.disputeOptimisticValue(endTime,{from:accounts[2],value:10})
      await helper.advanceTime(86400 * 10);
      await reader.getTellorValues(endTime);
      vars = await reader.getFirstUndisputedValueAfter(startTime*1 + 1);
      await reader.settleContracts();
      assert(await reader.longWins.call(),"Long should Win")
      assert(await reader.contractEnded.call(), "Contract should be ended")
    });
    
    it("Test Base Derivative Contract - Disputed Down Move", async function(){
      await reader.testContract(7 * 86400)
      let startTime = await reader.startDateTime.call();
      var endTime = await reader.endDateTime.call();
      await reader.setValue(startTime, 50000000);
      await helper.advanceTime(86400 * 10);
      await reader.setValue(await reader.endDateTime.call(), 500);
      //launch and mine one on Tellor
      //set up the contracts to handle getting the value
      logMineWatcher = await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
      await web3.eth.sendTransaction({to: oa,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
      logMineWatcher = await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      assert(res[0] > 0, "value should be positive");
      await web3.eth.sendTransaction({to: oa,from:accounts[2],gas:7000000,data:oracle2.methods.approve(reader.address,10).encodeABI()})
      await reader.disputeOptimisticValue(endTime,{from:accounts[2],value:10})
      assert(await reader.isDisputed((await reader.endDateTime.call()) * 1) == true, "isDisputed should work");
      await helper.advanceTime(86400 * 10);
      await reader.getTellorValues(await reader.endDateTime.call());
      await reader.settleContracts();
      assert(await reader.longWins.call() == false)
      assert(await reader.contractEnded.call(), "Contract should be ended")
      await reader.getAnyDataAfter(1,startTime*1 + 1)
      var mynum = await reader.getAnyDataAfter.call(1,startTime*1 + 1) 
      assert(mynum['2'] == res[0], "get any data should work");
      assert(await reader.getNumberOfDisputedValues() == 1);
      assert(await reader.getDisputedValueByIndex(0) - await reader.endDateTime.call() == 0, "Disputed value should be endtime");
      mynum = await reader.getDisputedValues()
      assert(mynum['0'] - await reader.endDateTime.call() == 0, "getDisputedValues should work")
    });
    it("Test Disputed Start and End Timestamps and someone wins", async function(){
     logMineWatcher = await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      await reader.testContract(7 * 86400)
      var startTime = await reader.startDateTime.call();
      await reader.setValue(startTime, 500000000);
      await web3.eth.sendTransaction({to: oa,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
      await promisifyLogWatch(oa,'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      await web3.eth.sendTransaction({to:oa,from:accounts[2],gas:7000000,data:oracle2.methods.approve(reader.address,10).encodeABI()})
      await reader.disputeOptimisticValue(startTime,{from:accounts[2],value:10})
      await reader.getTellorValues(startTime);
      await helper.advanceTime(86400 * 10);
      await reader.setValue(await reader.endDateTime.call(), 500);
      //launch and mine one on Tellor
      //set up the contracts to handle getting the value
      await web3.eth.sendTransaction({to: oa,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
      logMineWatcher = await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
      assert(res[0] > 0, "value should be positive");
      await web3.eth.sendTransaction({to: oa,from:accounts[2],gas:7000000,data:oracle2.methods.approve(reader.address,10).encodeABI()})
      var myend = 1* (await reader.endDateTime.call());
      await reader.disputeOptimisticValue(myend,{from:accounts[2],value:10})
      await helper.advanceTime(86400 * 10);
      await reader.getTellorValues(await reader.endDateTime.call());
      await reader.settleContracts();
      assert(await reader.longWins.call() == false, "long should not win")
      assert(await reader.contractEnded.call(), "Contract should be ended")
      var mynum = await reader.getAnyDataAfter.call(1,startTime*1 + 86400*9)
      assert(mynum['2']-res[0] == 0,"getAnyDataAfter should work");
      assert(await reader.getNumberOfDisputedValues() == 2, "there should be two disputed value");
      assert(await reader.isDisputed(myend) == true, "value should be disputed");
      assert(await reader.getDisputedValueByIndex(1) == 1 * (await reader.endDateTime.call()), "getDisputedValueByIndex should work");
      mynum = await reader.getDisputedValues();
      assert(mynum['0'] - startTime ==0, "getDisputedValues should work")
      assert(mynum['1'] - myend == 0)
    })
    it("Test No Tributes in User Contract w/Solution", async function(){

      await reader.testContract(7 * 86400)
      var startTime = await reader.startDateTime.call();
      await reader.setValue(startTime, 1000);
      await helper.advanceTime(86400 * 10);
      await reader.setValue(await reader.endDateTime.call(), 2000);
      //launch and mine one on Tellor
      //set up the contracts to handle getting the value
      await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      await web3.eth.sendTransaction({to:oa,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
      await web3.eth.sendTransaction({to:oa,from:accounts[2],gas:7000000,data:oracle2.methods.approve(reader.address,10).encodeABI()})
      await reader.disputeOptimisticValue(await reader.endDateTime.call(),{from:accounts[2],value:10})
      await userContract.setPrice(web3.utils.toWei("1","ether"));
      assert(await userContract.tributePrice.call() == web3.utils.toWei("1","ether"), "Tribute Price should be correct");
       await web3.eth.sendTransaction({to: oa,from:accounts[2],gas:7000000,data:oracle2.methods.transfer(userContract.address,web3.utils.toWei("1","ether")).encodeABI()})
      await reader.addTipWithEther(1,{value:web3.utils.toWei("1","ether"),from:accounts[3]})
      logMineWatcher = await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      await helper.advanceTime(86400 * 8);
      await reader.getTellorValues(await reader.endDateTime.call());
      await reader.settleContracts();
      await reader.testContract(7 * 86400)
      assert(await reader.longWins.call() == true, "long should win")
      assert(await reader.contractEnded.call(), "contract should be ended")
      var bal1 = await web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether');
      await userContract.withdrawEther();
      var bal2 = await web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether');
      assert(bal2 - bal1 -1 < .01, "balance should change correctly");

    })
    it("Lots of Stuff", async function(){
      logMineWatcher = await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
      assert(res[0] > 0, "value should be positive");
      await userContract.setPrice(web3.utils.toWei("1","ether"));
       await web3.eth.sendTransaction({to: oa,from:accounts[2],gas:7000000,data:oracle2.methods.transfer(userContract.address,web3.utils.toWei("1","ether")).encodeABI()})
      await userContract.requestDataWithEther(api2,"ETH-USD",1000,web3.utils.toWei("1","ether"),{from:accounts[1], value:web3.utils.toWei('1','ether')});
      logMineWatcher = await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
      assert(res[0] > 0, "value should be positive");
      await web3.eth.sendTransaction({to: oa,from:accounts[2],gas:7000000,data:oracle2.methods.transfer(userContract.address,web3.utils.toWei("5","ether")).encodeABI()})
      await userContract.addTipWithEther(1,{value:web3.utils.toWei("5","ether"),from:accounts[2]});
      await web3.eth.sendTransaction({to: oa,from:accounts[1],gas:7000000,data:oracle2.methods.approve(reader.address,web3.utils.toWei("5","ether")).encodeABI()})
      await reader.addTip(2,web3.utils.toWei("5","ether"),{from:accounts[1]});
      vars = await oracle.getVariablesOnDeck();
      let apiOnQ = web3.utils.hexToNumberString(vars['0']);
      assert(apiOnQ == 2,"ApiID on Q should be 2");
      await reader.requestData(api2,"ETH-USD",1000,0);
    })
    */
    it("Test 3 request ID avearge for Optimistic disputed Value", async function(){
      reader = await Reader.new(userContract.address,10,86400*3,[1,2,3],86400)
      await reader.setUserContract(userContract.address);
      await reader.testContract(7 * 86400)
      var startTime = await reader.startDateTime.call();
      var endTime = await reader.endDateTime.call();
      await reader.setValue(startTime, 1000);
      await helper.advanceTime(86400 * 10);
      await reader.setValue(await reader.endDateTime.call(), 500);
      await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      await web3.eth.sendTransaction({to: oa,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api2,"BTC/USD2",100,0).encodeABI()})
            await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      await web3.eth.sendTransaction({to: oa,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api3,"BTC/USD3",1000000,1).encodeABI()})
            await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      await web3.eth.sendTransaction({to: oa,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api3,"BTC/USD3",1000000,10).encodeABI()})
      //set up the contracts to handle getting the value
      logMineWatcher = await promisifyLogWatch(oa, 'NewValue(uint256,uint256,uint256,uint256,bytes32)');//or Event Mine?
      res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
      assert(res[0] > 0, "value should be positive");
      await web3.eth.sendTransaction({to: oa,from:accounts[2],gas:7000000,data:oracle2.methods.approve(reader.address,10).encodeABI()})
      assert(await oracle.getNewValueCountbyRequestId(3) == 2, "new value count should be correct")
      await reader.disputeOptimisticValue(endTime,{from:accounts[2],value:10})
      await helper.advanceTime(86400 * 10);
      await reader.getTellorValues(await reader.endDateTime.call());
      await reader.settleContracts();
      assert(await reader.longWins.call(), "Long should win")
      assert(await reader.contractEnded.call(), "Contract should be ended")
      var rIds = await reader.getRequestIds();
      assert(rIds['0'] == 1, "getRequestIds should work")
      assert(rIds['1'] == 2)
      assert(rIds['2'] == 3)
      let vars= await reader.getTimestamps();
      assert(await reader.getNumberOfValuesPerTimestamp(vars[vars.length -1]*1) == 3, "number of values per timestamp should work");
      rIds = await reader.getRequestIdsIncluded(vars[vars.length -1]*1);
      assert(rIds['0'] == 1, "included Id's should be correct")
      assert(rIds['1'] == 2)
      assert(rIds['2'] == 3)
      console.log(await reader.endValue.call() ,res[1] )
      assert(await reader.endValue.call() > res[1] * 1, 'value should be an average')
       });
      it("Test Real Value", async function(){
      await reader.testContract(7 * 86400)
      var startTime = await reader.startDateTime.call();
      await reader.setValue(startTime, 1000);
      await helper.advanceTime(86400 * 10);
      await reader.setValue(await reader.endDateTime.call(), 2000);
      await userContract.setPrice(web3.utils.toWei(".015",'ether'));
      await web3.eth.sendTransaction({to:oa,from:accounts[2],gas:7000000,data:oracle2.methods.transfer(userContract.address,web3.utils.toWei("10",'ether')).encodeABI()})
      //await helper.expectThrow(reader.addTipWithEther(1,{value:web3.utils.toWei(".14",'ether'),from:accounts[3]}));
      await reader.addTipWithEther(1,{value:web3.utils.toWei(".15",'ether'),from:accounts[3]})
    })
});