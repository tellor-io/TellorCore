const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");
const { timeTarget } = require("./helpers/constants");

contract("Difficulty tests", function(accounts) {
  let master;
  let env;

  const getDiff = async () => {
    let diff = await master.getNewCurrentVariables();
    return diff[2].toNumber();
  };

  before("Setting up environment", async () => {
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

  it("Test Difficulty Adjustment", async function() {
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);

    let diff1 = await master.getNewCurrentVariables();
    assert(diff1[2] > 1, "difficulty greater than 1"); //difficulty not changing.....
    let vars = await master.getNewCurrentVariables();
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);
    vars = await master.getNewCurrentVariables();
    assert(vars[2] > diff1[2], "difficulty should continue to move up");
  });

  it("Test time travel in data -- really long time since last Poof and proper difficulty adjustment", async function() {
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);
    await master.manuallySetDifficulty(1000);
    vars = await master.getNewCurrentVariables();
    var oldDiff = vars[2];
    assert(vars[2] > 1, "difficulty should be greater than 1"); //difficulty not changing.....
    await helper.advanceTime(86400 * 20);
    await TestLib.mineBlock(env);
    vars = await master.getNewCurrentVariables();
    var newDiff = vars[2];
    assert(newDiff * 1 + 0 < oldDiff * 1 + 0, "difficulty should be lower");
  });

  it("Test lower difficulty target (4 min)", async function() {
    assert(
      (await master.getUintVar(web3.utils.keccak256("timeTarget"))) ==
        timeTarget
    );
  });

  it("Difficulty increase based on the 4th slot", async () => {
    //mine a block
    let block = await testLib.mineBlock({
      master: master,
      accounts: accounts.slice(20, 5),
    });
    let currentDiff = await getDiff();

    await helpers.takeFifteen();

    // Mine 4 slots:
    let vars = await env.master.getNewCurrentVariables();
    const values = [1000, 1000, 1000, 1000, 1000];
    for (var i = 0; i < 4; i++) {
      res = await master.testSubmitMiningSolution("nonce", vars["1"], values, {
        from: accounts[i + 25],
      });
    }

    let afterDiff = await getDiff();

    console.log(currentDiff, afterDiff);
    //make assertion here
  });

  it("Difficulty decrease based on the 4th slot", async () => {
    //mine a block
    let block = await testLib.mineBlock({
      master: master,
      accounts: accounts.slice(20, 5),
    });
    let currentDiff = await getDiff();

    //move only 1 minute
    await helpers.advanceTime(60);

    // Mine 4 slots:
    let vars = await env.master.getNewCurrentVariables();
    const values = [1000, 1000, 1000, 1000, 1000];
    for (var i = 0; i < 4; i++) {
      res = await master.testSubmitMiningSolution("nonce", vars["1"], values, {
        from: accounts[i + 25],
      });
    }

    let afterDiff = await getDiff();

    console.log(currentDiff, afterDiff);
  });
});