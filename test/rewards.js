const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var masterAbi = Tellor.abi;
const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");
const hash = web3.utils.keccak256;
var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");

contract("Reward Tests", function(accounts) {
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
    //Could use the getV25(accounts, true), since you're upgrading in the first line of tests. I added full tips to getV25 in testLib already
    master = await TestLib.getEnv(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });

  it("Inflation is fixed", async function() {
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);
    let rew = await master.getUintVar(web3.utils.keccak256("currentReward"));
    assert.equal(rew.toString(), "1000000000000000000");
  });

  ////Adjust this test when fixing the smart contracts
  it("Rewards are proportional to time passed", async () => {
    //  zeroing tips
    for (var i = 0; i < 10; i++) {
      await helper.takeFifteen();
      await TestLib.mineBlock(env);
    }

    //Add tip and mine 2 blocks to clear tips
    await master.addTip(52, 1);
    await helper.advanceTime(60 * 16);
    await TestLib.mineBlock(env);
    await helper.advanceTime(60 * 16);
    let tx = await TestLib.mineBlock(env);

    let balBef = await master.balanceOf(accounts[1]);
    // console.log(web3.utils.fromWei(balBef.toString()));
    await helper.advanceTime(60 * 15);
    await TestLib.mineBlock(env);
    let balAfter = await master.balanceOf(accounts[1]);

    //15 min passed, should have 3 TRBs as reward, 1 per each 5 min
    assert(web3.utils.fromWei(balAfter) - web3.utils.fromWei(balBef) >= 3.0);
    assert(web3.utils.fromWei(balAfter) - web3.utils.fromWei(balBef) <= 3.1);
  });

  it("Test allow tip of current mined ID", async function() {
    vars = await master.getNewCurrentVariables();
    await master.addTip(1, 10000);
    await helper.takeFifteen();
    await TestLib.mineBlock(env);
    vars2 = await master.getNewCurrentVariables();
    assert(vars2[3] > 10000, "tip should be big");
  });

  it("Test zeroing out of currentTips", async function() {
    let tip = await master.getUintVar(hash("currentTotalTips"));
    await master.addTip(1, 100000000000);
    await helper.takeFifteen();
    await TestLib.mineBlock(env);
    await helper.takeFifteen();
    await TestLib.mineBlock(env);
    let tip1 = await master.getRequestUintVars(1, hash("totalTip"));
    assert(tip1.toString() == "0", "tip for request one should be zeroed");
  });

  it("Test Proper zeroing of Payout Test", async function() {
    vars = await master.getNewCurrentVariables();
    for (var i = 0; i < 11; i++) {
      //we need to mine ~10 blocks to clear all tips
      await helper.takeFifteen();
      await TestLib.mineBlock(env);
    }
    vars = await master.getRequestVars(vars["1"][0]);
    assert(vars["5"] == 0, "api payout should be zero");
    vars = await master.getUintVar(web3.utils.keccak256("currentTotalTips"));
    assert(vars == 0, "api payout should be zero");
  });
});
