const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var masterAbi = Tellor.abi;
var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");
const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");

contract("Request and tip tests", function(accounts) {
  let master;
  let env;
  beforeEach("Setup contract for each test", async function() {
    //Could use the getV25(accounts, true), since you're upgrading in the first line of tests. I added full tips to getV25 in testLib already
    master = await TestLib.getV25(accounts, true);
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
  // it("Add Tip", async function() {
  //   let vars = await master.getRequestVars(11) 
  //   let initialTip = vars[5] 
  //   apiVars = await master.getRequestVars(11);
  //   res = await master.addTip(11, 20)
  //   apiVars = await master.getRequestVars(11);
  //   assert(apiVars[5].toNumber() == initialTip.toNumber() + 20, "value pool should be 20");
  // });
  it("several request data", async function() {
    let req1 = await master.addTip(41, 500, { from: accounts[2] });
    req1 = await master.addTip(42, 500, { from: accounts[2] });
    req1 = await master.addTip(43, 500, { from: accounts[2] });
    req1 = await master.addTip(44, 500, { from: accounts[2] });
    req1 = await master.addTip(31, 400, { from: accounts[2] });
    data = await master.getNewVariablesOnDeck();
    let ids = data["0"].map((i) => i.toString());
    let tips = data["1"].map((i) => i.toString());

    console.log(ids);
    console.log(tips);

    assert(ids.includes("41"), "ID on deck should be 41");
    assert(ids.includes("31"), "ID on deck should be 31");
    assert(tips.includes("422"), "Tip should be over 110");
    req1 = await master.addTip(32, 410, { from: accounts[2] });
    data = await master.getNewVariablesOnDeck();
    ids = data["0"].map((i) => i.toString());
    tips = data["1"].map((i) => i.toString());
    assert(ids.includes("42"), "ID on deck should be 41");
    assert(ids.includes("32"), "ID on deck should be 30");
    assert(tips.includes("110"), "Tip should be 110");
    master.addTip(33, 150, { from: accounts[2] });
    data = await master.getNewVariablesOnDeck();
    ids = data["0"].map((i) => i.toString());
    tips = data["1"].map((i) => i.toString());
    assert(ids.includes("43"), "ID on deck should be 43");
    assert(ids.includes("33"), "ID on deck should be 33");
    assert(tips.includes("150"), "Tip should be 150");
    req1 = await master.addTip(34, 160, { from: accounts[2] });
    data = await master.getNewVariablesOnDeck();
    ids = data["0"].map((i) => i.toString());
    tips = data["1"].map((i) => i.toString());
    assert(ids.includes("44"), "ID on deck should be 44");
    assert(ids.includes("34"), "ID on deck should be 34");
    assert(tips.includes("160"), "Tip should be 60");
  });
  // it("Request data and change on queue with another request", async function() {
  //   balance1 = await master.balanceOf(accounts[2], { from: accounts[1] });
  //   let pay = web3.utils.toWei("20", "ether");
  //   let pay2 = web3.utils.toWei("50", "ether");
  //   let res3 = await master.addTip(31, pay, { from: accounts[2] });
  //   apiVars = await master.getRequestVars(31);
  //   assert(apiVars[5] == pay, "value pool should be 20");
  //   data = await master.getNewVariablesOnDeck();
  //   ids = data["0"].map((i) => i.toString());
  //   assert(ids.includes("31"), "ID on deck should be 31");
  //   res3 = await master.addTip(32, pay2, { from: accounts[2] });
  //   data = await master.getNewVariablesOnDeck();
  //   ids = data["0"].map((i) => i.toString());
  //   tips = data["1"].map((i) => i.toString());
  //   assert(ids.includes("31"), "ID on deck should be 31");
  //   assert(ids.includes("32"), "ID on deck should be 31");
  //   assert(tips.includes(pay), "Tipdson deck should be 31");
  //   assert(tips.includes(pay2), "Tipds on deck should be 31");
  //   balance2 = await master.balanceOf(accounts[2], { from: accounts[1] });
  //   assert(
  //     web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 70,
  //     "balance should be down by 70"
  //   );
  // });
  // it("Test getMax payout and index 51 req with overlapping tips and requests", async function() {
  //   utilities = await UtilitiesTests.new(master.address);
  //   for (var i = 1; i <= 21; i++) {
  //     await master.addTip(i, i, { from: accounts[2] });
  //   }
  //   for (var j = 15; j <= 45; j++) {
  //     apix = "api" + j;
  //     await master.addTip(j, j, { from: accounts[2] });
  //   }
  //   max = await utilities.testgetMax();
  //   assert(web3.utils.hexToNumberString(max[0]) == 45, "Max should be 45");
  //   assert(web3.utils.hexToNumberString(max[1]) == 11, "Max should be 11"); //note first 5 are added
  // });

  // it("Test getMax payout and index 60 requests", async function() {
  //   utilities = await UtilitiesTests.new(master.address);
  //   for (var i = 1; i <= 60; i++) {
  //     await master.addTip(i, i, { from: accounts[2] });
  //   }
  //   max = await utilities.testgetMax();
  //   assert(max[0] == 60, "Max should be 60");
  //   assert(max[1] == 46, "Max should be 46");
  // });

  // it("Test getMax payout and index 100 requests", async function() {
  //   utilities = await UtilitiesTests.new(master.address);
  //   for (var i = 1; i <= 55; i++) {
  //     apix = "api" + i;
  //     await master.addTip(i, i, { from: accounts[2] });
  //   }
  //   for (var j = 50; j <= 95; j++) {
  //     apix = "api" + j;
  //     await master.addTip(j, j, { from: accounts[2] });
  //   }

  //   req = await master.getRequestQ();
  //   max = await utilities.testgetMax();
  //   assert(max[0] == 110, "Max should be 110");
  //   assert(max[1] == 1, "Max should be 46");
  // });

  // it("utilities Test getMin payout and index 10 req with overlapping tips and requests", async function() {
  //   utilities = await UtilitiesTests.new(master.address);
  //   apiVars = await master.getRequestVars(1);
  //   apiIdforpayoutPoolIndex = await master.getRequestIdByRequestQIndex(0);
  //   apiId = await master.getRequestIdByQueryHash(apiVars[2]);
  //   assert(
  //     web3.utils.hexToNumberString(apiId) == 1,
  //     "timestamp on Q should be 1"
  //   );
  //   for (var i = 10; i >= 1; i--) {
  //     await master.addTip(i, i, { from: accounts[2] });
  //   }

  //   req = await master.getRequestQ();
  //   min = await utilities.testgetMin();
  //   assert(min[0] == 0, "Min should be 0");
  //   assert(min[1] == 45, "Min should be 40");
  // });

  // it("Test getMin payout and index 51 req count down with overlapping tips and requests", async function() {
  //   utilities = await UtilitiesTests.new(master.address);
  //   apiVars = await master.getRequestVars(1);
  //   apiIdforpayoutPoolIndex = await master.getRequestIdByRequestQIndex(0);
  //   apiId = await master.getRequestIdByQueryHash(apiVars[2]);
  //   assert(
  //     web3.utils.hexToNumberString(apiId) == 1,
  //     "timestamp on Q should be 1"
  //   );
  //   for (var i = 21; i >= 1; i--) {
  //     await master.addTip(i, i, { from: accounts[2] });
  //   }

  //   for (var j = 45; j >= 15; j--) {
  //     await master.addTip(j, j, { from: accounts[2] });
  //   }

  //   req = await master.getRequestQ();
  //   min = await utilities.testgetMin();
  //   assert(min[0] == 0, "Min should be 0");
  //   assert(min[1] == 10, "Min should be 5");
  //   assert(req[44] == 30, "request 15 is submitted twice this should be 30");
  //   assert(req[50] == 42, "request 21 is submitted twice this should be 42");
  // });

  // it("Test getMin payout and index 55 requests", async function() {
  //   utilities = await UtilitiesTests.new(master.address);
  //   for (var i = 1; i <= 55; i++) {
  //     await master.addTip(i, i, { from: accounts[2] });
  //   }
  //   req = await master.getRequestQ();
  //   min = await utilities.testgetMins(req);
  //   assert(min[0] == 6, "Min should be 6");
  //   assert(min[1] == 50, "Min should be 45");
  // });

  // it("Test 51 request and lowest is kicked out", async function() {
  //   await master.theLazyCoon(accounts[2], web3.utils.toWei("1000", "ether"));
  //   for (var i = 1; i <= 56; i++) {
  //     await master.addTip(i, i, { from: accounts[2] });
  //   }
  //   let payoutPool = await master.getRequestQ();
  //   for (var i = 6; i <= 45; i++) {
  //     assert(payoutPool[i] == 51 - i + 5, "should be equal");
  //   }
  //   apiVars = await master.getRequestVars(52);
  //   apiIdforpayoutPoolIndex = await master.getRequestIdByRequestQIndex(50);
  //   vars = await master.getNewVariablesOnDeck();
  //   let apiOnQ = vars[0];
  //   let apiPayout = vars[1];
  //   for(var i = 0; i <= 4; i++){
  //     apiPayout[i] = apiPayout[i] *1 -0
  //     apiOnQ[i] = apiOnQ[i]*1-0
  //   }
  //   console.log(apiOnQ,apiVars)
  //   assert(apiIdforpayoutPoolIndex == 56, "position 1 should be booted");
  //   assert(apiPayout.includes(56), "API on Q payout should be 56");
  //   assert(apiOnQ.includes(56), "API on Q should be 56");
  //   assert(apiVars[4] == 4, "position 1 should have correct value");
  // });

  // it("Test Throw on wrong apiId", async function() {
  //   vars = await master.getNewCurrentVariables();
  //   await helper.expectThrow(
  //     master.testSubmitMiningSolution(
  //       "nonce",
  //       [60, 2, 3, 4, 5],
  //       [1200, 1300, 1400, 1500, 1600]
  //     )
  //   );
  //   await TestLib.mineBlock(env);
  // });
});
