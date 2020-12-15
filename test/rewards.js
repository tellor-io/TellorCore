
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var masterAbi = Tellor.abi;
const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");

contract("Reward Tests", function(accounts) {
  let master;
  let env;

    before("Setting up enviroment", async() => {
    console.log("Before all");
    try {
      await TestLib.prepare()
    } catch (error) {
      if (!error.message.includes("has already been linked")) {
        throw error;
      }
    }
    console.log("end of before");
  })


  beforeEach("Setup contract for each test", async function() {
    //Could use the getV25(accounts, true), since you're upgrading in the first line of tests. I added full tips to getV25 in testLib already
    master = await TestLib.getEnv(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });

  it("Inflation is fixed", async function() {
    await helper.advanceTime(60 * 60 * 16)
  	await TestLib.mineBlock(env);
    let rew = await master.getUintVar(web3.utils.keccak256("currentReward"));
    assert.equal(rew.toString(), "1000000000000000000");
  });

  it("Rewards are proportional to time passed", async () => {
    await helper.advanceTime(60 * 60 * 16)  
    await TestLib.mineBlock(env);
    await helper.advanceTime(60 * 5 * 8)
    let balBef = await master.balanceOf(accounts[1]);
    await TestLib.mineBlock(env);
    let balAfter = await master.balanceOf(accounts[1]);
    // console.log(balBef.toString());
    // console.log(balAfter.toString());
    // console.log(balAfter.sub(balBef).toString());
    assert(web3.utils.fromWei(balAfter) - web3.utils.fromWei(balBef) >= 7.9)
    assert(web3.utils.fromWei(balAfter) - web3.utils.fromWei(balBef) <= 8.1)
  });

    it("Test allow tip of current mined ID", async function() {
    vars = await master.getNewCurrentVariables();
    await master.addTip(1, 10000);
    await takeFifteen()
    await testLib.mineBlock(env)
    vars2 = await master.getNewCurrentVariables();
    assert(vars2[3] > 10000, "tip should be big");
  });

  it("Test zeroing out of currentTips", async function() {
    let tip = await master.getUintVar(hash("currentTotalTips"))
    await master.addTip(1, 100000000000);
    //Weirdly we need two blocks here
    await takeFifteen();
    await TestLib.mineBlock(env);
    await takeFifteen();
    await TestLib.mineBlock(env);
    let tip1 =  await master.getRequestUintVars(1, hash("totalTip"))
    assert(tip1.toString() == "0", "tip for request one should be zeroed");
  });

  it("Test lower difficulty target (5 min)", async function() {
    assert((await master.getUintVar(hash("timeTarget"))) == 300);
  });

});
