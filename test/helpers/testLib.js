// const { web3, BN } = require("./setup");
// const { fromWei } = require("web3-utils");

const helper = require("./test_helpers");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
const ITellorI = artifacts.require("ITellorI.sol");
const ITellorII = artifacts.require("ITellorII.sol");
var oracleAbi = Tellor.abi;
var oracleByte = Tellor.bytecode;
var OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
var oldTellorABI = OldTellor.abi;
const TellorMaster = artifacts.require("./TellorMaster.sol");
var OldTellor2 = artifacts.require("./oldContracts2/OldTellor2.sol");
var oldTellor2ABI = OldTellor2.abi;
var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");
var masterAbi = TellorMaster.abi;

var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";

class TestLib {
  constructor(env) {
    this.env = env;
  }

  hash(str) {
    return web3.utils.keccak256(str);
  }

  async addTip(id, amount, sender = accounts[2]) {
    return await web3.eth.sendTransaction({
      to: this.env.oracle.address,
      from: sender,
      gas: 7000000,
      data: this.env.oracle2.methods.addTip(id, amount).encodeABI(),
    });
  }

  async lazyCoon(accs) {
    for (var i = 0; i < accs.length; i++) {
      await web3.eth.sendTransaction({
        to: this.env.oracle.address,
        from: this.env.accounts[0],
        gas: 7000000,
        data: oracle2.methods
          .theLazyCoon(accs[i], web3.utils.toWei("1100", "ether"))
          .encodeABI(),
      });
    }
  }

  async mineBlock() {
    let vars = await this.getCurrentVars();
    for (var i = 0; i < 5; i++) {
      await web3.eth.sendTransaction({
        to: this.env.oracle.address,
        from: this.env.accounts[i],
        gas: 10000000,
        data: this.env.oracle2.methods
          .testSubmitMiningSolution("nonce", vars["1"], [
            1200,
            1300,
            1400,
            1500,
            1600,
          ])
          .encodeABI(),
      });
    }
  }

  async getCurrentVars() {
    return await this.env.oracle2.methods.getNewCurrentVariables().call();
  }
}

function initEnv(env) {
  let lib = new TestLib(env);
  return lib;
}

// async function createV2Env(accounts) {
//   let oracle;
//   let master;
//   let oldTellor;
//   let utilities;

//   oldTellor = await OldTellor.new();
//   oracle = await TellorMaster.new(oldTellor.address);
//   master = await ITellorI.at(oracle.address);
//   for (var i = 0; i < 6; i++) {
//     await master.theLazyCoon(accounts[i], web3.utils.toWei("5000", "ether"));
//   }
//   for (var i = 0; i < 52; i++) {
//     x = "USD" + i;
//     apix = api + i;
//     await master.requestData(apix, x, 1000, 52 - i);
//   }

//   //Deploy new upgraded Tellor
//   newOracle = await Tellor.new();
//   await master.changeTellorContract(newOracle.address);
//   console.log("here");
//   master1 = await ITellorII.at(master.address);
//   console.log("pa");
//   for (var i = 0; i < 5; i++) {
//     console.log(i);
//     await master1.submitMiningSolution("nonce", 1, 1200, { from: accounts[i] });
//   }
//   return {
//     master: master1,
//   };
// }

async function createV2Env(accounts) {
  let oracleBase;
  let oracle;
  let oracle2;
  let master;
  let oldTellor;
  var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";

  oldTellor = await OldTellor.new();
  oracle = await TellorMaster.new(oldTellor.address);
  master = await ITellorI.at(oracle.address);
  oldTellorinst = await new web3.eth.Contract(oldTellorABI, oldTellor.address);
  for (var i = 0; i < 6; i++) {
    //print tokens
    await master.theLazyCoon(accounts[i], web3.utils.toWei("7000", "ether"));
  }
  for (var i = 0; i < 52; i++) {
    x = "USD" + i;
    apix = api + i;
    await master.requestData(apix, x, 1000, 0);
  }
  //Deploy new upgraded Tellor
  oracleBase = await Tellor.new();
  oracle2 = await ITellorII.at(oracle.address);
  await master.changeTellorContract(oracleBase.address);

  for (var i = 0; i < 5; i++) {
    oracle2.submitMiningSolution("nonce", 1, 1200, { from: accounts[i] });
  }

  return {
    master: oracle2,
  };
}
module.exports = {
  init: initEnv,
  getV2: createV2Env,
};
