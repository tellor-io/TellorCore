// const { web3, BN } = require("./setup");
// const { fromWei } = require("web3-utils");

const helper = require("./test_helpers");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
const ITellorI = artifacts.require("ITellorI.sol");
const ITellorII = artifacts.require("ITellorII.sol");
const OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
const TellorMaster = artifacts.require("./TellorMaster.sol");

async function mineBlock(env) {
  let vars = await env.master.getNewCurrentVariables();
  for (var i = 0; i < 5; i++) {
    await env.master.submitMiningSolution(
      "nonce",
      vars["1"],
      [1200, 1300, 1400, 1500, 1600],
      {
        from: env.accounts[i],
      }
    );
  }
}

async function createV2Env(accounts, transition = false) {
  let oracleBase;
  let oracle;
  let oracle2;
  let master;
  let oldTellor;
  var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";

  oldTellor = await OldTellor.new();
  oracle = await TellorMaster.new(oldTellor.address);
  master = await ITellorI.at(oracle.address);
  for (var i = 0; i < accounts.length; i++) {
    //print tokens
    await master.theLazyCoon(accounts[i], web3.utils.toWei("7000", "ether"));
  }
  for (var i = 0; i < 52; i++) {
    x = "USD" + i;
    apix = api + i;
    await master.requestData(apix, x, 1000, 0);
  }
  //Deploy new upgraded Tellor
  oracleBase = transition
    ? await Tellor.new({ from: accounts[9] })
    : await Tellor.new();
  await master.changeTellorContract(oracleBase.address);

  for (var i = 0; i < 5; i++) {
    await master.submitMiningSolution("nonce", 1, 1200, { from: accounts[i] });
  }
  oracle2 = await ITellorII.at(oracle.address);
  return oracle2;
}

module.exports = {
  mineBlock: mineBlock,
  getV2: createV2Env,
};
