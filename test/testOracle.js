const helper = require("./helpers/test_helpers");
const TestLib = require("./helpers/testLib");
// const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");

contract("Test Oracle", function(accounts) {
  let master = {};
  let env = {};

  before("Setting up enviroment", async () => {
    try {
      await TestLib.prepare();
    } catch (error) {
      if (!error.message.includes("has already been linked")) {
        throw error;
      }
    }
  });

  beforeEach("Setup contract for each test", async function() {
    master = await TestLib.getEnv(accounts, true);
    env.master = master;
    env.accounts = accounts;
  });

  it("test utilities", async function() {
    var myArr = [];
    for (var i = 50; i >= 0; i--) {
      myArr.push(i);
    }
    utilities = await UtilitiesTests.new(master.address);
    top5N = await utilities.testgetMax5(myArr);
    let q = await master.getRequestQ();
    for (var i = 0; i < 5; i++) {
      assert(top5N["_max"][i] == myArr[i + 1]);
      assert(top5N["_index"][i] == i + 1);
    }
  });

  it("getVariables", async function() {
    await master.addTip(1, 20);
    let vars = await master.getNewCurrentVariables();
    assert(vars["1"].length == 5, "ids should be populated");
    assert(vars["2"] > 0, "difficulty should be correct");
    assert(vars["3"] > 0, "tip should be correct");
  });
  it("getTopRequestIDs", async function() {
    vars = await master.getTopRequestIDs();
    for (var i = 0; i < 5; i++) {
      assert((vars[0] = i + 6));
    }
  });
  it("Test miner", async function() {
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);
    vars = await master.getLastNewValueById(5);
    assert(vars[0] > 0, "value should be positive");
    assert(vars[1] == true, "value should be there");
  });

  it("Test Get MinersbyValue ", async function() {
    //Here we're testing with randomized values. This way, we can be sure that
    //both the values and the miners are being properly sorted
    let res;
    let prices = [1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900];
    let requestValues = [[], [], [], [], []];
    let requestVals = {};
    let minersByVal = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {} };

    await helper.advanceTime(60 * 60 * 16);
    let currrVars = await env.master.getNewCurrentVariables();
    let reqs = currrVars["1"];

    let timestamps = [];
    for (var k = 0; k < 5; k++) {
      requestVals[reqs[k]] = [];
    }
    for (var i = 0; i < 5; i++) {
      //Getting a random number
      let vals = [];
      for (var j = 0; j < 5; j++) {
        let rd = Math.floor(Math.random() * (7 - 0));
        vals.push(prices[rd]);
        requestVals[reqs[j]].push(prices[rd]);
        minersByVal[j][accounts[i]] = prices[rd];
      }
      await master.testSubmitMiningSolution("nonce", reqs, vals, {
        from: accounts[i],
      });
    }
    for (var i = 0; i < 5; i++) {
      //Getting a random number
      let count = await master.getNewValueCountbyRequestId(reqs[i]);
      let timestamp = await master.getTimestampbyRequestIDandIndex(
        reqs[i],
        count.toNumber() - 1
      );
      timestamps.push(timestamp);
    }

    for (var i = 0; i < 5; i++) {
      let sortReq = requestVals[reqs[i]].sort();
      var values = await master.getSubmissionsByTimestamp(
        reqs[i],
        timestamps[i]
      );
      var miners = await master.getMinersByRequestIdAndTimestamp(
        reqs[i],
        timestamps[i]
      );

      for (var j = 0; j < 5; j++) {
        assert(
          minersByVal[i.toString()][miners[j]] == values[j].toNumber(),
          "wrong miner to value relationship"
        );
        assert(values[j].toNumber() == sortReq[j], "wrong value"); //Make sure that the medians are right
      }
    }
  });

  it("Test dev Share", async function() {
    await helper.advanceTime(60 * 16);
    await TestLib.mineBlock(env);

    let begbal = await master.balanceOf(accounts[0]);
    await helper.advanceTime(60 * 15);
    vars = await master.getNewCurrentVariables();
    await TestLib.mineBlock({
      master: master,
      accounts: accounts.slice(1),
    });
    endbal = await master.balanceOf(accounts[0]);
    assert((endbal - begbal) / 1e18 >= 1.5, "devShare");
    assert((endbal - begbal) / 1e18 <= 1.6, "devShare2");
  });

  it("Test miner, alternating api request on Q and auto select", async function() {
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);

    await helper.advanceTime(60 * 60 * 16);
    await master.addTip(30, 1000, { from: accounts[2] });

    // await helper.advanceTime(60 * 60 * 16);
    // await TestLib.mineBlock(env);
    let data = await master.getNewVariablesOnDeck();
    for (var i = 0; i <= 4; i++) {
      data[0][i] = data[0][i] * 1 - 0;
    }
    assert(data[0].includes(30), "ID on deck should be 30");

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

  it("Test 50 requests, proper booting, and mining of 5", async function() {
    await helper.advanceTime(60 * 60 * 16);
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
    assert(data * 1 > 0, "Should be true if Data exist for that point in time");
    for (var i = 11; i <= 20; i++) {
      apix = "api" + i;
      await master.addTip(i + 2, i, { from: accounts[2] });
    }
    await master.addTip(2, 21, { from: accounts[2] });
    vars = await master.getNewCurrentVariables();
    await helper.advanceTime(60 * 60 * 16);
    let res = await TestLib.mineBlock(env);
    count = await master.getNewValueCountbyRequestId(vars["1"][0]);
    timestamp = await master.getTimestampbyRequestIDandIndex(
      vars["1"][0],
      count.toNumber() - 1
    );
    data = await master.getMinedBlockNum(vars["1"][0], timestamp);
    assert(data * 1 > 0, "Should be true if Data exist for that point in time");
    for (var i = 21; i <= 30; i++) {
      await master.addTip(i + 2, i, { from: accounts[2] });
    }
    await master.addTip(1, 31, { from: accounts[2] });

    await helper.advanceTime(60 * 60 * 16);
    vars = await master.getNewCurrentVariables();
    res = await TestLib.mineBlock(env);
    await helper.advanceTime(60 * 60 * 16);
    count = await master.getNewValueCountbyRequestId(2);
    timestamp = await master.getTimestampbyRequestIDandIndex(
      2,
      count.toNumber() - 1
    );
    data = await master.getMinedBlockNum(2, timestamp);
    //assert(data*1 > 0, "Should be true if Data exist for that point in time");
    for (var i = 31; i <= 40; i++) {
      await master.addTip(i + 2, i, { from: accounts[2] });
    }
    await master.addTip(2, 41, { from: accounts[2] });

    vars = await master.getNewCurrentVariables();
    await helper.advanceTime(60 * 60 * 16);
    res = await TestLib.mineBlock(env);
    count = await master.getNewValueCountbyRequestId(1);
    timestamp = await master.getTimestampbyRequestIDandIndex(
      1,
      count.toNumber() - 1
    );
    data = await master.getMinedBlockNum(1, timestamp);
    assert(data > 0, "Should be true if Data exist for that point in time");
    for (var i = 41; i <= 55; i++) {
      apix = "api" + i;
      await master.addTip(i + 2, i, { from: accounts[2] });
    }
    await master.addTip(1, 56, { from: accounts[2] });
    await helper.advanceTime(60 * 60 * 16);
    vars = await master.getNewCurrentVariables();
    res = await TestLib.mineBlock(env);
    count = await master.getNewValueCountbyRequestId(2);
    timestamp = await master.getTimestampbyRequestIDandIndex(
      2,
      count.toNumber() - 1
    );
    data = await master.getMinedBlockNum(2, timestamp);
    assert(data * 1 > 0, "Should be true if Data exist for that point in time");
    apiVars = await master.getRequestVars(52);
    apiIdforpayoutPoolIndex = await master.getRequestIdByRequestQIndex(50);

    vars = await master.getNewVariablesOnDeck();
    let apiOnQ = vars["0"];
    apiIdforpayoutPoolIndex2 = await master.getRequestIdByRequestQIndex(49);
    for (var i = 0; i <= 4; i++) {
      vars["1"][i] = vars["1"][i] * 1 - 0;
      apiOnQ[i] = apiOnQ[i] * 1 - 0;
    }
    assert(apiIdforpayoutPoolIndex == 52, "position 1 should be booted");
    assert(vars["1"].includes(51), "API on Q payout should be 51");
    assert(apiOnQ.includes(51), "API on Q should be 51");
    assert(apiVars[5] == 51, "value at position 52 should have correct value");
    assert(apiIdforpayoutPoolIndex2 == 3, "position 2 should be in same place");
  });
});
