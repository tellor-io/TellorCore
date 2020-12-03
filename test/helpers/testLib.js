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
  let miners = 0;
  let m = []
  let res;
  for (var i = 0; i < env.accounts.length; i++) {
    let info = await env.master.getStakerInfo(env.accounts[i]);
    if (i > 5 && info["0"].toString() != "1") {
      try {
        await env.master.depositStake({ from: env.accounts[i] });
      } catch {
        continue;
      }
    }
    try {
      res = await env.master.submitMiningSolution(
        "nonce",
        vars["1"],
        [1200, 1300, 1400, 1500, 1600],
        {
          from: env.accounts[i],
        }
      );
      miners++;
    } catch (e){
      if (miners < 5 && i == env.accounts.length - 1) {
        assert.isTrue(false, "Couldn't mine a block");
      }
    }
    if (miners == 5) {
      break;
    }
  }
  return res;
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
    await master.requestData(apix, x, 1000, 52 - i);
  }

  oracleBase = await TellorV2.new({ from: accounts[9] })
  let base = await TellorV2.at(baseAdd)
  await master.changeTellorContract(base.address);

  for (var i = 0; i < 5; i++) {
    await master.submitMiningSolution("nonce", 1, 1200, { from: accounts[i] });
  }

  oracle2 = await ITellorII.at(oracle.address);

  
  let newTellorFirst = await Tellor.new({from: accounts[9]})
  let newTellor = await Tellor.at(newAdd);


  transitionContract = await TransitionContract.new();

  vars = await oracle2.getNewCurrentVariables();
  await oracle2.changeTellorContract(transitionContract.address);

  await helper.advanceTime(60 * 16);
  await mineBlock({
    master: oracle2,
    accounts: accounts,
  });
  vars = await oracle2.getNewCurrentVariables();
  let oracle3 = await ITellorIIV.at(oracle2.address);
  
  vars = await oracle3.getNewCurrentVariables();
  return oracle3;
}

async function createV25EnvEmpty(accounts, transition = false) {
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
    await master.requestData(apix, x, 1000,0);
  }

  oracleBase = transition
    ? await TellorV2.new({ from: accounts[9] })
    : await TellorV2.new();
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

  // await helper.advanceTime(60 * 16);
  // await mineBlock({
  //   master: oracle2,
  //   accounts: accounts,
  // });
  let oracle3 = ITellorIIV.at(oracle2.address);
  return oracle3;
}

async function createV2Env(accounts, transition) {
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
    ? await TellorV2.new({ from: accounts[9] })
    : await TellorV2.new();
  await master.changeTellorContract(oracleBase.address);
  
  for (var i = 0; i < 5; i++) {
    await master.submitMiningSolution("nonce", 1, 1200, { from: accounts[i] });
  }
  oracle2 = await ITellorII.at(oracle.address);
  await mineBlock({
    accounts: accounts,
    master: oracle2,
  });
  return oracle2;
}

async function createV2EnvFull(accounts, transition) {
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
    await master.requestData(apix, x, 1000, 52 - i);
  }
  //Deploy new upgraded Tellor
  oracleBase = await TellorV2.new({ from: accounts[9] })
  await master.changeTellorContract(oracleBase.address);

  for (var i = 0; i < 5; i++) {
    await master.testSubmitMiningSolution("nonce", 1, 1200, { from: accounts[i] });
  }
  oracle2 = await ITellorII.at(master.address);
  await mineBlock({
    accounts: accounts,
    master: oracle2,
  });
  return oracle2;
}

module.exports = {
  mineBlock: mineBlock,
  getV2: createV2Env,
  getV25: createV25Env,
  getV2Full: createV2EnvFull,
  getV25Empty: createV25EnvEmpty,
};
