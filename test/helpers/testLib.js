const helper = require("./test_helpers");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
const ITellorI = artifacts.require("ITellorI.sol");
const ITellorII = artifacts.require("ITellorII.sol");
const ITellorIIV = artifacts.require("ITellorIIV.sol");
const OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
const TellorV2 = artifacts.require("./v2/v2Tellor.sol");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const TransitionContract = artifacts.require("./TellorTransition");

async function mineBlock(env) {
  let vars = await env.master.getNewCurrentVariables();
  if (vars["1"][0].toString() == "0") {
    vars["1"] = [1, 2, 3, 4, 5];
  }
  console.log("right before", vars["1"]);
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

async function createV25Env(accounts, transition = false) {
  let oracleBase;
  let oracle;
  let oracle2;
  let master;
  let oldTellor;
  var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
  const baseAdd = "0x6511D2957aa09350494f892Ce2881851f0bb26D3";
  const newAdd = "0x032Aa32e4069318b15e6462CE20926d4d821De90";

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

  oracleBase = await Tellor.new();
  await master.changeTellorContract(oracleBase.address);

  for (var i = 0; i < 5; i++) {
    await master.submitMiningSolution("nonce", 1, 1200, { from: accounts[i] });
  }

  oracle2 = await ITellorII.at(oracle.address);

  let newTellor = transition
    ? await Tellor.new({ from: accounts[9] })
    : await Tellor.new();

  transitionContract = await TransitionContract.new();
  newTellor = await Tellor.at(newAdd);

  vars = await oracle2.getNewCurrentVariables();
  await oracle2.changeTellorContract(transitionContract.address);

  await helper.advanceTime(60 * 16);
  await mineBlock({
    master: oracle2,
    accounts: accounts,
  });
  let oracle3 = ITellorIIV.at(oracle2.address);
  return oracle3;
}

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
  oracleBase = await Tellor.new();
  await master.changeTellorContract(oracleBase.address);

  for (var i = 0; i < 5; i++) {
    await master.submitMiningSolution("nonce", 1, 1200, { from: accounts[i] });
  }
  oracle2 = await ITellorII.at(oracle.address);

  console.log("OPOP");
  let vars = await master.getNewCurrentVariables();
  console.log(vars["1"]);

  return oracle2;
}

module.exports = {
  mineBlock: mineBlock,
  getV2: createV2Env,
  getV25: createV25Env,
};
