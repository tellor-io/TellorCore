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
    master = await TestLib.getEnv(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });

  it("Test Difficulty Adjustment", async function() {
    await helper.advanceTime(60 * 60 * 16);
    await master.manuallySetDifficulty(100000000000);
    await TestLib.mineBlock(env);

    let diff1 = await master.getNewCurrentVariables();
    assert(diff1[2] > 1, "difficulty greater than 1"); //difficulty not changing.....
    let vars = await master.getNewCurrentVariables();
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);
    vars = await master.getNewCurrentVariables();
    assert(vars[2] < diff1[2], "difficulty should continue to move down");
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
    ),
      "difficulty should be 240";
  });

  describe("Difficulty on 4th slot", async () => {
    beforeEach(async () => {
      //Stake accounts 20...40
      for (var i = 20; i < accounts.length; i++) {
        await master.theLazyCoon(
          accounts[i],
          web3.utils.toWei("7000", "ether")
        );
        let info = await env.master.getStakerInfo(accounts[i]);
        if (info["0"].toString() != "1") {
          await env.master.depositStake({ from: accounts[i] });
        }
      }
    });

    it("Difficulty decrease based on the 4th slot", async () => {
      await helper.takeFifteen();
      await TestLib.mineBlock(env);
      await master.manuallySetDifficulty(1000);
      let currentDiff = await getDiff();

      await helper.takeFifteen();

      // Mine 4 slots:
      let vars = await env.master.getNewCurrentVariables();
      const values = [1000, 1000, 1000, 1000, 1000];
      for (var i = 0; i < 4; i++) {
        res = await master.testSubmitMiningSolution(
          "nonce",
          vars["1"],
          values,
          {
            from: accounts[i + 25],
          }
        );
      }

      let afterDiff = await getDiff();
      assert(currentDiff > afterDiff, "Difficulty should have decreased");
    });

    it("Difficulty increase based on the 4th slot", async () => {
      await helper.takeFifteen();
      await TestLib.mineBlock(env);
      await master.manuallySetDifficulty(1000);
      let currentDiff = await getDiff();

      //move only 1 minute
      await helper.advanceTime(60);

      // Mine 4 slots:
      let vars = await env.master.getNewCurrentVariables();
      const values = [1000, 1000, 1000, 1000, 1000];
      for (var i = 0; i < 4; i++) {
        res = await master.testSubmitMiningSolution(
          "nonce",
          vars["1"],
          values,
          {
            from: accounts[i + 25],
          }
        );
      }

      let afterDiff = await getDiff();
      assert(currentDiff < afterDiff, "Difficulty should have increase");
    });

     it("Test nonce bypass", async () => {
      await helper.takeFifteen();
      await TestLib.mineBlock(env);
      await master.manuallySetDifficulty(1000);
      let currentDiff = await getDiff();

      let vars = await env.master.getNewCurrentVariables();
      const values = [1000, 1000, 1000, 1000, 1000];
      await helper.expectThrow(
        master.submitMiningSolution("nonce", vars["1"], values, {
          from: accounts[26],
        })
      );
    });

    it("Zero difficulty on the 5th slot", async () => {
      // Increasing the diff
      await TestLib.mineBlock({
        master: master,
        accounts: accounts.slice(30, 35),
      });
      await master.manuallySetDifficulty(1000);

      await helper.advanceTime(61);

      let vars = await env.master.getNewCurrentVariables();
      const values = [1000, 1000, 1000, 1000, 1000];

      //Try mine first slot with incorrect nonce
      await helper.expectThrow(
        master.submitMiningSolution("nonce", vars["1"], values, {
          from: accounts[20],
        })
      );

      // Mine 4 slots bypassing the nonce:
      for (var i = 0; i < 4; i++) {
        res = await master.testSubmitMiningSolution(
          "nonceer",
          vars["1"],
          values,
          {
            from: accounts[i + 25],
          }
        );
      }

      //Mine the 5th with any nonce
      await master.submitMiningSolution("nonce", vars["1"], values, {
        from: accounts[20],
      });

      let requestId = vars["1"][0];
      let count = await master.getNewValueCountbyRequestId(requestId);
      let timestamp = await master.getTimestampbyRequestIDandIndex(
        requestId,
        count.toNumber() - 1
      );

      let miners = await master.getMinersByRequestIdAndTimestamp(
        requestId,
        timestamp
      );
      assert(miners.indexOf(accounts[20]) != -1, "miner should have mined");
    });
  });
});
