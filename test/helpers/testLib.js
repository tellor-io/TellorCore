// const { web3, BN } = require("./setup");
// const { fromWei } = require("web3-utils");

const helper = require("./test_helpers");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
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

async function createV2Env(accounts) {
  oldTellor = await OldTellor.new();
  oracle = await TellorMaster.new(oldTellor.address);
  master = await new web3.eth.Contract(masterAbi, oracle.address);
  oldTellorinst = await new web3.eth.Contract(oldTellorABI, oldTellor.address);
  for (var i = 0; i < 6; i++) {
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oldTellorinst.methods
        .theLazyCoon(accounts[i], web3.utils.toWei("5000", "ether"))
        .encodeABI(),
    });
  }
  for (var i = 0; i < 52; i++) {
    x = "USD" + i;
    apix = api + i;
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oldTellorinst.methods
        .requestData(apix, x, 1000, 52 - i)
        .encodeABI(),
    });
  }
  //Deploy new upgraded Tellor
  oracleBase = await Tellor.new();
  oracle2 = await new web3.eth.Contract(oracleAbi, oracle.address);
  await oracle.changeTellorContract(oracleBase.address);
  for (var i = 0; i < 5; i++) {
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[i],
      gas: 7000000,
      data: oracle.methods["submitMiningSolution(string,uint256,uint256)"](
        "nonce",
        1,
        1200
      ).encodeABI(),
    });
    return {
      accounts: accounts,
      oracleBase: oracleBase,
      oracle: oracle,
      oracle2: oracle2,
      master: master,
      oldTellor: oldTellor,
      oldTellorinst: oldTellorinst,
      utilities: utilities,
    };
  }
}
module.exports = {
  init: initEnv,
  v2Env: createV2Env,
};
