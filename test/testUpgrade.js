/** 
* This tests the oracle functions, including mining.
*/
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');  
const helper = require("./helpers/test_helpers");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
const OldTellor = artifacts.require("./oldContracts/OldTellor.sol")
const OldMaster = artifacts.require("./oldContracts/OldTellorMaster.sol")
const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
const OldTellor2 = artifacts.require("./oldContracts2/OldTellor2.sol")
const OldMaster2 = artifacts.require("./oldContracts2/OldTellorMaster2.sol")

var oracleAbi = Tellor.abi;
var oracleByte = Tellor.bytecode;
//var OldTellor = artifacts.require("./oldContracts/OldTellor.sol")
var masterAbi = TellorMaster.abi;
var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";

contract('Upgrade Tests', function(accounts) {
  let oracle;
  let oracle2;
  let newOracle;
  let master;
  let oldTellor;

   beforeEach('Setup contract for each test', async function () {
        oracleBase = await Tellor.new();
        oracle = await TellorMaster.new(oracleBase.address);
        master = await new web3.eth.Contract(masterAbi,oracle.address);
        oracle2 = await new web3.eth.Contract(oracleAbi,oracleBase.address);
   });  
    it("Test Triple upgrade", async function () {
        let oracleBase2 = await Tellor.new();
         await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.theLazyCoon(accounts[2],web3.utils.toWei('5000', 'ether')).encodeABI()})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.proposeFork(oracleBase2.address).encodeABI()})
        for(var i = 1;i<5;i++){
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()})
        }
        await helper.advanceTime(86400 * 8);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()})
        assert(await oracle.getAddressVars(web3.utils.keccak256("tellorContract")) == oracleBase2.address);
    });
   it("Test upgrade with full queue", async function () {
  		assert(0==1)
   });
   it("Test upgrade with no queue", async function () {
  		assert(0==1)
   });
    it("Test upgrade halfway through mining", async function () {
  		assert(0==1)
   });
        it("Test upgrade halfway through dispute", async function () {
  		assert(0==1)
   });
   it("Test switch partially through with tips added before new block", async function () {
   	   assert(0==1)
   });
      it("Test switch no IDs on Q", async function () {
   	   assert(0==1)
   });
 });    