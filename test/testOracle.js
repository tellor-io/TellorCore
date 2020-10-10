
const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws://localhost:8545")
);
const TransitionContract = artifacts.require("./TellorTransition");
const helper = require("./helpers/test_helpers");
const TestLib = require("./helpers/testLib");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var masterAbi = Tellor.abi;
var masterByte = Tellor.bytecode;
var OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
var oldTellorABI = OldTellor.abi;
var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");

const baseAdd = "0x6511D2957aa09350494f892Ce2881851f0bb26D3";
const newAdd = "0x032Aa32e4069318b15e6462CE20926d4d821De90";

contract("Mining Tests", function(accounts) {
  let master;
  let env;

  beforeEach("Setup contract for each test", async function() {
    master = await TestLib.getV25(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });

  // it("test utilities", async function() {
  //   var myArr = [];
  //   for (var i = 50; i >= 0; i--) {
  //     myArr.push(i);
  //   }
  //   utilities = await UtilitiesTests.new(master.address);
  //   top5N = await utilities.testgetMax5(myArr);
  //   let q = await master.getRequestQ();
  //   for (var i = 0; i < 5; i++) {
  //     assert(top5N["_max"][i] == myArr[i + 1]);
  //     assert(top5N["_index"][i] == i + 1);
  //   }
  // });

  // it("getVariables", async function() {
  //   await master.addTip(1, 20);
  //   let vars = await master.getNewCurrentVariables();
  //   assert(vars["1"].length == 5, "ids should be populated");
  //   assert(vars["2"] > 0, "difficulty should be correct");
  //   assert(vars["3"] > 0, "tip should be correct");
  // });
  // it("getTopRequestIDs", async function() {
  //   vars = await master.getTopRequestIDs();
  //   for (var i = 0; i < 5; i++) {
  //     assert((vars[0] = i + 6));
  //   }
  // });
  // it("Test miner", async function() {
  //   await TestLib.mineBlock(env);
  //   vars = await master.getLastNewValueById(5);
  //   assert(vars[0] > 0, "value should be positive");
  //   assert(vars[1] == true, "value should be there");
  // });
  // it("Test Difficulty Adjustment", async function() {
  //   await TestLib.mineBlock(env);

  //   let diff1 = await master.getNewCurrentVariables();
  //   assert(diff1[2] > 1, "difficulty greater than 1"); //difficulty not changing.....
  //   let vars = await master.getNewCurrentVariables();
  //   await helper.advanceTime(60 * 60 * 16);
  //   await TestLib.mineBlock(env);
  //   vars = await master.getNewCurrentVariables();
  //   assert(vars[2] > diff1[2], "difficulty should continue to move up");
  // });
  // it("Test Get MinersbyValue ", async function() {
  //   //Here we're testing with randomized values. This way, we can be sure that
  //   //both the values and the miners are being properly sorted
  //   let res;
  //   let prices = [1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900];
  //   let requestValues = [[], [], [], [], []];
  //   let minersByVal = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {} };

  //   let timestamps = [];
  //   for (var i = 0; i < 5; i++) {
  //     //Getting a random number
  //     let vals = [];
  //     for (var j = 0; j < 5; j++) {
  //       let rd = Math.floor(Math.random() * (7 - 0));
  //       vals.push(prices[rd]);
  //       requestValues[j].push(prices[rd]);
  //       minersByVal[j][accounts[i]] = prices[rd];
  //     }
  //     await master.testSubmitMiningSolution("nonce", [1, 2, 3, 4, 5], vals, {
  //       from: accounts[i],
  //     });
  //     let count = await master.getNewValueCountbyRequestId(1);
  //     let timestamp = await master.getTimestampbyRequestIDandIndex(
  //       1,
  //       count.toNumber() - 1
  //     );
  //     timestamps.push(timestamp);
  //   }
  //   // console.log(res.logs);
  //   // console.log(res.logs["1"].data);
  //   // res = web3.eth.abi.decodeParameters(
  //   //   ["uint256[5]", "uint256", "uint256[5]", "uint256"],
  //   //   res.logs["0"].data
  //   // );

  //   for (var i = 0; i < 5; i++) {
  //     let sortReq = requestValues[i].sort();
  //     var values = await master.getSubmissionsByTimestamp(i + 1, timestamps[i]);
  //     var miners = await master.getMinersByRequestIdAndTimestamp(
  //       i + 1,
  //       timestamps[i]
  //     );
  //     for (var j = 0; j < 5; j++) {
  //       assert(
  //         minersByVal[i.toString()][miners[j]] == values[j].toNumber(),
  //         "wrong miner to value relationship"
  //       );
  //       assert(values[j].toNumber() == sortReq[j], "wrong value"); //Make sure that the medians are right
  //     }
  //   }
  // });

  it("Test dev Share", async function() {
    await TestLib.mineBlock(env);
    let begbal = await master.balanceOf(accounts[0]);
    await helper.advanceTime(60 * 5);
    for (var i = 1; i < 6; i++) {
      await master.testSubmitMiningSolution(
        "nonce",
        [1, 2, 3, 4, 5],
        [1200, 1300, 1400, 1500, 1600],
        { from: accounts[i] }
      );
    }
    endbal = await master.balanceOf(accounts[0]);
    console.log(web3.utils.fromWei(endbal) - web3.utils.fromWei(begbal));
    assert((endbal - begbal) / 1e18 >= 0.5, "devShare");
    assert((endbal - begbal) / 1e18 <= 0.6, "devShare2");
  });

  it("Test miner, alternating api request on Q and auto select", async function() {
    await TestLib.mineBlock(env);

    await helper.advanceTime(60 * 60 * 16);
    let vars = await master.getNewCurrentVariables();
    await TestLib.mineBlock(env);

    await master.addTip(30, 1000, { from: accounts[2] });

    // await helper.advanceTime(60 * 60 * 16);
    // await TestLib.mineBlock(env);
    let data = await master.getNewVariablesOnDeck();
    assert(data[0].includes("30"), "ID on deck should be 30");
    console.log(data[0]);
    console.log(data[1][1] * 1);

    assert(data[1][1] > 1000, "Tip should be over 1000");

    await master.addTip(31, 2000);

    data = await master.getNewVariablesOnDeck();
    var x = 0;
    for (var i = 0; i < 5; i++) {
      if (data[0][i] == 30) {
        assert(data[1][i] > 1000);
        x++;
      } else if (data[0][i] == 31) {
        assert(data[1][i] > 2000);
        x++;
      }
    }
    assert(x == 2);
  });

  it("Test time travel in data -- really long timesincelastPoof and proper difficulty adjustment", async function() {
    for (var j = 0; j < 6; j++) {
      let vars = await master.getNewCurrentVariables();
      await master.addTip(1, 500);

      await helper.advanceTime(60 * 60 * 16);
      await TestLib.mineBlock(env);
    }
    vars = await master.getNewCurrentVariables();
    var oldDiff = vars[2];
    assert(vars[2] > 1, "difficulty should be greater than 1"); //difficulty not changing.....
    await helper.advanceTime(86400 * 20);
    vars = await master.getNewCurrentVariables();
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);

    vars = await master.getNewCurrentVariables();
    var newDiff = vars[2];
    assert(newDiff < oldDiff, "difficulty should be lower");
    assert(
      (await master.getNewValueCountbyRequestId(1)) == 5,
      "Request ID 1 should have 8 mines"
    );
  });

  it("Test time travel in data -- really long timesincelastPoof and proper difficulty adjustment", async function() {
    for (var j = 0; j < 6; j++) {
      vars = await master.getNewCurrentVariables();
      await master.addTip(1, 500);
      await helper.advanceTime(60 * 60 * 16);
      await TestLib.mineBlock(env);
    }
    vars = await master.getNewCurrentVariables();
    var oldDiff = vars[2];
    assert(vars[2] > 1, "difficulty should be greater than 1"); //difficulty not changing.....
    await helper.advanceTime(86400 * 20);
    await TestLib.mineBlock(env);
    vars = await master.getNewCurrentVariables();
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);
    for (var i = 0; i < 5; i++) vars = await master.getNewCurrentVariables();
    var newDiff = vars[2];
    assert(newDiff < oldDiff, "difficulty should be lower");
    assert(
      (await master.getNewValueCountbyRequestId(1)) == 5,
      "Request ID 1 should have 8 mines"
    );
  });

  it("Test 50 requests, proper booting, and mining of 5", async function() {
    vars = await master.getNewCurrentVariables();
    await TestLib.mineBlock(env);

    await helper.advanceTime(60 * 60 * 16);
    for (var i = 1; i <= 10; i++) {
      await master.addTip(i + 2, i);
    }
    await master.addTip(1, 11);

    vars = await master.getNewCurrentVariables();
    await TestLib.mineBlock(env);
    await helper.advanceTime(60 * 60 * 16);
    // res = web3.eth.abi.decodeParameters(
    //   ["uint256[5]", "uint256", "uint256[5]", "uint256"],
    //   res.logs["0"].data
    // );
    let count = await master.getNewValueCountbyRequestId(1);
    let timestamp = await master.getTimestampbyRequestIDandIndex(
      1,
      count.toNumber() - 1
    );
    data = await master.getMinedBlockNum(1, timestamp);
    console.log("data1", data * 1);
    assert(data * 1 > 0, "Should be true if Data exist for that point in time");
    for (var i = 11; i <= 20; i++) {
      apix = "api" + i;
      await master.addTip(i + 2, i, { from: accounts[2] });
    }
    await master.addTip(2, 21, { from: accounts[2] });
    vars = await master.getNewCurrentVariables();
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);
    res = web3.eth.abi.decodeParameters(
      ["uint256[5]", "uint256", "uint256[5]", "uint256"],
      res.logs["0"].data
    );
    data = await master.getMinedBlockNum(vars["1"][0], res[1]);
    console.log("data2", data * 1);
    assert(data * 1 > 0, "Should be true if Data exist for that point in time");
    for (var i = 21; i <= 30; i++) {
      apix = "api" + i;
      await master.addTip(i + 2, i, { from: accounts[2] });
    }
    await master.addTip(1, 31, { from: accounts[2] });

    vars = await master.getNewCurrentVariables();
    await TestLib.mineBlock(env);
    await helper.advanceTime(60 * 60 * 16);
    res = web3.eth.abi.decodeParameters(
      ["uint256[5]", "uint256", "uint256[5]", "uint256"],
      res.logs["0"].data
    );
    data = await master.getMinedBlockNum(2, res[1]);
    console.log("data3", data * 1);
    //assert(data*1 > 0, "Should be true if Data exist for that point in time");
    for (var i = 31; i <= 40; i++) {
      await master.addTip(i + 2, i, { from: accounts[2] });
    }
    await master.addTip(2, 41, { from: accounts[2] });

    vars = await master.getNewCurrentVariables();
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);
    res = web3.eth.abi.decodeParameters(
      ["uint256[5]", "uint256", "uint256[5]", "uint256"],
      res.logs["0"].data
    );
    data = await master.getMinedBlockNum(1, res[1]);
    console.log("data4", data * 1);
    assert(data > 0, "Should be true if Data exist for that point in time");
    for (var i = 41; i <= 55; i++) {
      apix = "api" + i;
      await master.addTip(i + 2, i, { from: accounts[2] });
    }
    await master.addTip(1, 56, { from: accounts[2] });
    await helper.advanceTime(60 * 60 * 16);
    vars = await master.getNewCurrentVariables();
    await TestLib.mineBlock(env);
    res = web3.eth.abi.decodeParameters(
      ["uint256[5]", "uint256", "uint256[5]", "uint256"],
      res.logs["0"].data
    );
    data = await master.getMinedBlockNum(2, res[1]);
    console.log("data5", data * 1);
    assert(data * 1 > 0, "Should be true if Data exist for that point in time");
    apiVars = await master.getRequestVars(52);
    apiIdforpayoutPoolIndex = await master.getRequestIdByRequestQIndex(50);
    vars = await master.getNewVariablesOnDeck();
    let apiOnQ = vars["0"];
    apiIdforpayoutPoolIndex2 = await master.getRequestIdByRequestQIndex(49);
    assert(apiIdforpayoutPoolIndex == 1, "position 1 should be booted");
    assert(vars["1"].includes("51"), "API on Q payout should be 51");
    assert(apiOnQ.includes("51"), "API on Q should be 51");
    assert(apiVars[5] == 51, "value at position 52 should have correct value");
    assert(apiIdforpayoutPoolIndex2 == 3, "position 2 should be in same place");
  });
});

