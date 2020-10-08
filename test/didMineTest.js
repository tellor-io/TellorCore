const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));


const TestLib = require("./helpers/testLib");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
const TransitionContract = artifacts.require("./TellorTransition");
const helper = require("./helpers/test_helpers");
const TellorMaster = artifacts.require("./TellorMaster.sol");
var oracleAbi = Tellor.abi;
var oracleByte = Tellor.bytecode;
var OldTellor = artifacts.require("./oldContracts/OldTellor.sol")
var oldTellorABI = OldTellor.abi;

var masterAbi = TellorMaster.abi;
var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";

const BN = web3.utils.BN;

contract('DidMine test', function(accounts) {
  let master;
  let env;
  //Hardcoded adress because they need to be known when the TransitionCOntract is compiled
  const baseAdd = "0x6511D2957aa09350494f892Ce2881851f0bb26D3";
  const newAdd = "0x032Aa32e4069318b15e6462CE20926d4d821De90";
  const oldStake = new BN(web3.utils.toWei("1000", "ether"));
  const newStake = new BN(web3.utils.toWei("500", "ether"));

  const upgrade = async () => {
    let newTellor = await Tellor.new({ from: accounts[9] });
    transitionContract = await TransitionContract.new();
    // newTellor = await Tellor.at(newAdd);

    vars = await master.getNewCurrentVariables();
    await master.changeTellorContract(transitionContract.address);
    await helper.advanceTime(60 * 16);
    await TestLib.mineBlock(env, accounts);
  };

  beforeEach("Setup contract for each test", async function() {
    master = await TestLib.getV2Full(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });

    it("Test didMine ", async function () {
    	await upgrade();
    	console.log("1")
        let vars = await master.getNewCurrentVariables().call()
        console.log("2")
        for(var i = 0;i<5;i++){
            res = await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:master.methods.testSubmitMiningSolution("nonce",[1,2,3,4,5],[1200,1300,1400,1500,1600]).encodeABI()})
        }
        console.log(vars[0],accounts[2])
        let didMine = await master.didMine(vars[0],accounts[2],{from:accounts[0],gas:7000000});
        assert(didMine);
    });
 });    