const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var masterAbi = Tellor.abi;
var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");
const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");
const BN = web3.utils.BN;

contract("Request and tip tests", function(accounts) {
  let master;
  let env;

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
    env = {
      master: master,
      accounts: accounts,
    };
  });
  it("test utilities", async function() {
    var myArr = [];
    for (var i = 50; i >= 0; i--) {
      myArr.push(i);
    }
    utilities = await UtilitiesTests.new(master.address);
    let minT = await utilities.testgetMins(myArr);
    assert(minT[0] == 0);
    assert(minT[1] == 50, "index should be correct");
  });
  it("Add Tip", async function() {
    let vars = await master.getRequestVars(11);
    let initialTip = vars[5];
    apiVars = await master.getRequestVars(11);
    res = await master.addTip(11, 20);
    apiVars = await master.getRequestVars(11);
    assert(
      apiVars[5].toNumber() == initialTip.toNumber() + 20,
      "value pool should be 20"
    );
  });
  it("several request data", async function() {
    let req1 = await master.addTip(41, 500, { from: accounts[2] });
    req1 = await master.addTip(42, 500, { from: accounts[2] });
    req1 = await master.addTip(43, 500, { from: accounts[2] });
    req1 = await master.addTip(44, 500, { from: accounts[2] });
    req1 = await master.addTip(31, 400, { from: accounts[2] });
    data = await master.getNewVariablesOnDeck();
    let ids = data["0"].map((i) => i.toString());
    let tips = data["1"].map((i) => i.toString());

    assert(ids.includes("41"), "ID on deck should be 41");
    assert(ids.includes("31"), "ID on deck should be 31");
    assert(tips.includes("422"), "Tip should be over 110");
    req1 = await master.addTip(32, 410, { from: accounts[2] });
    data = await master.getNewVariablesOnDeck();
    ids = data["0"].map((i) => i.toString());
    tips = data["1"].map((i) => i.toString());
    assert(ids.includes("42"), "ID on deck should be 41");
    assert(ids.includes("32"), "ID on deck should be 30");
    assert(tips.includes("431"), "Tip should be 110");
    await master.addTip(33, 550, { from: accounts[2] });
    data = await master.getNewVariablesOnDeck();
    ids = data["0"].map((i) => i.toString());
    tips = data["1"].map((i) => i.toString());
    assert(ids.includes("43"), "ID on deck should be 43");
    assert(ids.includes("33"), "ID on deck should be 33");
    assert(tips.includes("570"), "Tip should be 150");
    req1 = await master.addTip(34, 660, { from: accounts[2] });
    data = await master.getNewVariablesOnDeck();
    ids = data["0"].map((i) => i.toString());
    tips = data["1"].map((i) => i.toString());
    assert(ids.includes("43"), "ID on deck should be 43");
    assert(ids.includes("34"), "ID on deck should be 34");
    assert(tips.includes("679"), "Tip should be 60");
  });
  it("Request data and change on queue with another request", async function() {
    let vars31 = await master.getRequestVars(31);
    let vars32 = await master.getRequestVars(32);
    let tipBefore31 = vars31[5];
    let tipBefore32 = vars32[5];

    balance1 = await master.balanceOf(accounts[2], { from: accounts[1] });
    let pay = new BN(web3.utils.toWei("20", "ether"));
    let pay2 = new BN(web3.utils.toWei("50", "ether"));
    let res3 = await master.addTip(31, pay, { from: accounts[2] });
    apiVars = await master.getRequestVars(31);
    assert(apiVars[5].eq(pay.add(tipBefore31)), "value pool should be 20");
    data = await master.getNewVariablesOnDeck();
    ids = data["0"].map((i) => i.toString());
    assert(ids.includes("31"), "ID on deck should be 31");
    res3 = await master.addTip(32, pay2, { from: accounts[2] });
    data = await master.getNewVariablesOnDeck();
    ids = data["0"].map((i) => i.toString());
    tips = data["1"].map((i) => i.toString());
    assert(ids.includes("31"), "ID on deck should be 31");
    assert(ids.includes("32"), "ID on deck should be 31");
    assert(
      tips.includes(pay.add(tipBefore31).toString()),
      "Tipdson deck should be 31"
    );
    assert(
      tips.includes(pay2.add(tipBefore32).toString()),
      "Tipds on deck should be 31"
    );
    balance2 = await master.balanceOf(accounts[2], { from: accounts[1] });
    assert(
      web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 70,
      "balance should be down by 70"
    );
  });

  it("Test 51 request and lowest is kicked out", async function() {
    let previousTips = [];
    for (var i = 0; i <= 56; i++) {
      let tip = await master.getRequestVars(i);
      previousTips.push(tip[5]);
    }

    await master.theLazyCoon(accounts[2], web3.utils.toWei("1000", "ether"));
    for (var i = 1; i <= 56; i++) {
      await master.addTip(i, i, {
        from: accounts[2],
      });
    }

    let payoutPool = await master.getRequestQ();
    for (var i = 11; i <= 36; i++) {
      assert(
        payoutPool[i].toNumber() == previousTips[i].toNumber() + i,
        "should be equal"
      );
    }
    apiVars = await master.getRequestVars(47);
    apiIdforpayoutPoolIndex = await master.getRequestIdByRequestQIndex(50);
    vars = await master.getNewVariablesOnDeck();
    let apiOnQ = vars[0];
    let apiPayout = vars[1];
    for (var i = 0; i <= 4; i++) {
      apiPayout[i] = apiPayout[i] * 1 - 0;
      apiOnQ[i] = apiOnQ[i] * 1 - 0;
    }

    assert(
      apiIdforpayoutPoolIndex.toString() == "56",
      "position 1 should be booted"
    );
    assert(apiPayout.includes(56), "API on Q payout should be 56");
    assert(apiOnQ.includes(56), "API on Q should be 56");
    assert(apiVars[4] == 5, "position 1 should have correct value");
  });

  it("Test Throw on wrong apiId", async function() {
    vars = await master.getNewCurrentVariables();
    await helper.expectThrow(
      master.testSubmitMiningSolution(
        "nonce",
        [60, 2, 3, 4, 5],
        [1200, 1300, 1400, 1500, 1600]
      )
    );
  });
});
