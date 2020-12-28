const helper = require("./test_helpers");

//Interface Imports
const ITellorI = artifacts.require("ITellorI.sol");
const ITellorII = artifacts.require("ITellorII.sol");
const ITellorIIV = artifacts.require("ITellorIIV.sol");

//Current contracts imports
const Tellor = artifacts.require("./TellorTest.sol");
const TellorTransfer = artifacts.require("./libraries/TellorTransfer.sol");
const TellorDispute = artifacts.require("./libraries/TellorDispute.sol");
const TellorStake = artifacts.require("./libraries/TellorStake.sol");
const TellorLibraryTest = artifacts.require(
  "./libraries/TellorLibraryTest.sol"
);
const TellorLibrary = artifacts.require("./libraries/TellorLibrary.sol");
const TransitionContract = artifacts.require("./TellorTransition");

//OldTellor Imports
const TellorMaster = artifacts.require("./TellorMaster.sol");
const OldTellor = artifacts.require("oldContracts/OldTellor.sol");
const OldTellorStake = artifacts.require(
  "oldContracts/libraries/OldTellorStake"
);
const OldTellorTransfer = artifacts.require(
  "oldContracts/libraries/OldTellorTransfer"
);
const OldTellorDispute = artifacts.require(
  "oldContracts/libraries/OldTellorDispute"
);

const OldTellorLibrary = artifacts.require(
  "oldContracts/libraries/OldTellorLibrary"
);

//V2 tellor imports
const TellorV2 = artifacts.require("v2/v2Tellor.sol");
const V2TellorStake = artifacts.require("v2/libraries/v2TellorStake");
const V2TellorTransfer = artifacts.require("v2/libraries/v2TellorTransfer");
const V2TellorDispute = artifacts.require("v2/libraries/v2TellorDispute");
const V2TellorLibrary = artifacts.require("v2/libraries/v2TellorLibrary");

//v25 tellor imports
const v25TellorTest = artifacts.require("v25/mocks/v25TellorTest.sol");
const v25TellorStake = artifacts.require("v25/libraries/v25TellorStake");
const v25TellorTransfer = artifacts.require("v25/libraries/v25TellorTransfer");
const v25TellorDispute = artifacts.require("v25/libraries/v25TellorDispute");
const v25TellorLibrary = artifacts.require("v25/libraries/v25TellorLibrary");
const v25TellorLibraryTest = artifacts.require(
  "v25/mocks/v25TellorLibraryTest"
);
const v25TransitionContract = artifacts.require("v25/v25TellorTransition");

const prepareTellorTest = async () => {
  const ttransfer = await TellorTransfer.new();

  await TellorDispute.link(ttransfer);
  const tdispute = await TellorDispute.new();

  await TellorStake.link(tdispute);
  await TellorStake.link(ttransfer);
  const tstake = await TellorStake.new();

  await TellorLibrary.link(ttransfer);
  const tlib = await TellorLibrary.new();

  await TellorLibraryTest.link(ttransfer);
  const tlibtest = await TellorLibraryTest.new();

  await Tellor.link(ttransfer);
  await Tellor.link(tdispute);
  await Tellor.link(tstake);
  await Tellor.link(tlib);
  await Tellor.link(tlibtest);
};

const prepareTellorV25 = async () => {
  const v25ttransfer = await v25TellorTransfer.new();

  await v25TellorDispute.link(v25ttransfer);
  const v25tdispute = await v25TellorDispute.new();

  await v25TellorStake.link(v25tdispute);
  await v25TellorStake.link(v25ttransfer);
  const v25tstake = await v25TellorStake.new();

  await v25TellorLibrary.link(v25ttransfer);
  const v25tlib = await v25TellorLibrary.new();

  await v25TellorLibraryTest.link(v25ttransfer);
  const v25tlibTest = await v25TellorLibraryTest.new();

  await v25TellorTest.link(v25ttransfer);
  await v25TellorTest.link(v25tdispute);
  await v25TellorTest.link(v25tstake);
  await v25TellorTest.link(v25tlib);
  await v25TellorTest.link(v25tlibTest);
};

const prepareTellorV2 = async () => {
  const v2ttransfer = await V2TellorTransfer.new();

  await V2TellorDispute.link(v2ttransfer);
  const v2tdispute = await V2TellorDispute.new();

  await V2TellorStake.link(v2tdispute);
  await V2TellorStake.link(v2ttransfer);
  const v2tstake = await V2TellorStake.new();

  await V2TellorLibrary.link(v2ttransfer);
  const v2tlib = await V2TellorLibrary.new();

  await TellorV2.link(v2ttransfer);
  await TellorV2.link(v2tdispute);
  await TellorV2.link(v2tstake);
  await TellorV2.link(v2tlib);
};

const prepareOldTellor = async () => {
  const oldttransfer = await OldTellorTransfer.new();

  await OldTellorDispute.link(oldttransfer);
  const oldtdispute = await OldTellorDispute.new();

  await OldTellorStake.link(oldttransfer);
  await OldTellorStake.link(oldtdispute);
  const oldtstake = await OldTellorStake.new();

  await OldTellorLibrary.link(oldttransfer);
  const oldtlib = await OldTellorLibrary.new();

  await OldTellor.link(oldttransfer);
  await OldTellor.link(oldtdispute);
  await OldTellor.link(oldtstake);
  await OldTellor.link(oldtlib);

  await TellorMaster.link(oldttransfer);
  await TellorMaster.link(oldtstake);
};

async function prepareEnv() {
  await prepareOldTellor();
  await prepareTellorV2();
  await prepareTellorV25();
  await prepareTellorTest();
}

async function mineBlock(env) {
  let vars = await env.master.getNewCurrentVariables();
  let miners = 0;
  let m = [];
  const values = [1, 1, 1, 1, 1];
  const finalVals = [];
  let submitted = {};
  let timestamp;
  for (var i = 0; i < 5; i++) {
    submitted[vars["1"][i].toString()] = [];
  }
  for (var i = 0; i < 5; i++) {
    let minerVals = values.map((value) => {
      return (i + 1) * 1100;
    });
    for (var j = 0; j < 5; j++) {
      submitted[vars["1"][j].toString()].push(minerVals[j]);
    }
    finalVals.push(minerVals);
    try {
      // console.log(minerVals);
      res = await env.master.testSubmitMiningSolution(
        "nonce",
        vars["1"],
        minerVals,
        {
          from: env.accounts[i],
          value: "0",
        }
      );
      m.push(env.accounts[i]);
      miners++;
    } catch (e) {
      console.log(minerVals, vars["1"]);
      assert.isTrue(
        false,
        "miner of index " + i + " coudln't mine a block. Reason: " + e
      );
    }
    if (miners == 5) {
      break;
    }
  }
  let block = await web3.eth.getBlock("latest");

  return {
    miners: m,
    values: finalVals,
    submitted: submitted,
    requests: vars["1"],
    timestamp: block.timestamp,
  };
}

async function createV26Env(accounts, transition = false) {
  let oracleBase;
  let oracle;
  let oracle2;
  let master;
  let oldTellor;
  var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
  const baseAdd = "0x6511D2957aa09350494f892Ce2881851f0bb26D3";
  const newAdd = "0x032Aa32e4069318b15e6462CE20926d4d821De90";
  const newAdd25 = "0x41c4e9D14712560A6707C365dB1c3251E5eD7f78";

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

  oracleBase = await TellorV2.new({ from: accounts[9] });
  let base = await TellorV2.at(baseAdd);
  await master.changeTellorContract(base.address);

  for (var i = 0; i < 5; i++) {
    await master.submitMiningSolution("nonce", 1, 1200, { from: accounts[i] });
  }

  oracle2 = await ITellorII.at(oracle.address);

  let newTellorFirst = await v25TellorTest.new({ from: accounts[9] });
  let newTellor = await v25TellorTest.at(newAdd);

  transitionContract = await v25TransitionContract.new();
  vars = await oracle2.getNewCurrentVariables();
  await oracle2.changeTellorContract(transitionContract.address);
  let add2 = await master.getAddressVars(
    web3.utils.keccak256("tellorContract")
  );
  await helper.advanceTime(60 * 16);
  await mineBlock({
    master: oracle2,
    accounts: accounts,
  });

  //Deploy New version:
  let tellorFirst = await Tellor.new({ from: accounts[9] });
  let tellor = await Tellor.at(newAdd25);

  transitionContract = await TransitionContract.new();
  vars = await oracle2.getNewCurrentVariables();
  await oracle2.changeTellorContract(transitionContract.address);

  await helper.advanceTime(60 * 16);
  await mineBlock({
    master: oracle2,
    accounts: accounts,
  });

  // vars = await oracle2.getNewCurrentVariables();
  let oracle3 = await ITellorIIV.at(oracle2.address);
  return oracle3;
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

  oracleBase = await TellorV2.new({ from: accounts[9] });
  let base = await TellorV2.at(baseAdd);
  await master.changeTellorContract(base.address);

  for (var i = 0; i < 5; i++) {
    await master.submitMiningSolution("nonce", 1, 1200, { from: accounts[i] });
  }

  oracle2 = await ITellorII.at(oracle.address);

  let newTellorFirst = await v25TellorTest.new({ from: accounts[9] });
  let newTellor = await v25TellorTest.at(newAdd);

  transitionContract = await v25TransitionContract.new();
  vars = await oracle2.getNewCurrentVariables();
  await oracle2.changeTellorContract(transitionContract.address);

  await helper.advanceTime(60 * 16);
  await mineBlock({
    master: oracle2,
    accounts: accounts,
  });
  let oracle3 = await ITellorIIV.at(oracle2.address);
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
  oracleBase = await TellorV2.new({ from: accounts[9] });
  await master.changeTellorContract(oracleBase.address);

  for (var i = 0; i < 5; i++) {
    await master.testSubmitMiningSolution("nonce", 1, 1200, {
      from: accounts[i],
    });
  }
  oracle2 = await ITellorII.at(master.address);
  await mineBlock({
    accounts: accounts,
    master: oracle2,
  });
  return oracle2;
}

const getNewTellor = async (env) => {
  let t = await Tellor.new({ from: env.accounts[9] });
  return t;
};

const getNewTransition = async (env) => {
  let t = await TransitionContract.new();
  return t;
};

module.exports = {
  prepare: prepareEnv,
  mineBlock: mineBlock,
  getV2: createV2Env,
  getV25: createV25Env,
  getV2Full: createV2EnvFull,
  getV25Empty: createV25EnvEmpty,
  getNewTellor: getNewTellor,
  getNewTransition: getNewTransition,
  //This supposed to return the most updated enviroment. Version agnostic tests should always use this.
  getEnv: createV26Env,
};
