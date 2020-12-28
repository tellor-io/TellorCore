const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");
const Tellor = artifacts.require("./TellorTest.sol");
contract("Further tests", function(accounts) {
  let master;
  let env;

  const takeFifteen = async () => {
    await helper.advanceTime(60 * 18);
  };

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

  it("Test Changing Dispute Fee", async function() {
    await master.theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"));
    await master.theLazyCoon(accounts[7], web3.utils.toWei("5000", "ether"));
    var disputeFee1 = await master.getUintVar(
      web3.utils.keccak256("disputeFee")
    );
    // newOracle = await Tellor.new();
    // await master.changeTellorContract(newOracle.address)
    await master.depositStake({ from: accounts[6] });
    await master.depositStake({ from: accounts[7] });
    assert(
      (await master.getUintVar(web3.utils.keccak256("disputeFee"))) <
        disputeFee1,
      "disputeFee should change"
    );
  });

  it("Test token fee burning", async function() {
    await master.theLazyCoon(accounts[1], web3.utils.toWei("2000", "ether"));

    await master.addTip(1, web3.utils.toWei("1000", "ether"));
    vars = await master.getNewCurrentVariables();
    assert(vars[3] >= web3.utils.toWei("1000", "ether"), "tip should be big");
    balances = [];
    for (var i = 0; i < 6; i++) {
      balances[i] = await master.balanceOf(accounts[i]);
    }
    initTotalSupply = await master.totalSupply();
    await takeFifteen();
    await TestLib.mineBlock(env);
    await takeFifteen();
    await TestLib.mineBlock(env);
    new_balances = [];
    for (var i = 0; i < 6; i++) {
      new_balances[i] = await master.balanceOf(accounts[i]);
    }
    changes = [];
    for (var i = 0; i < 6; i++) {
      changes[i] = new_balances[i] - balances[i];
    }
    newTotalSupply = await master.totalSupply();

    assert(changes[0] <= web3.utils.toWei("110.86", "ether"));
    assert(changes[1] <= web3.utils.toWei("107.24", "ether"));
    assert(changes[2] <= web3.utils.toWei("107.24", "ether"));
    assert(changes[3] <= web3.utils.toWei("107.24", "ether"));
    assert(changes[4] <= web3.utils.toWei("107.24", "ether"));

    let diff = initTotalSupply.sub(newTotalSupply);
    assert(
      diff > web3.utils.toWei("459", "ether"),
      "total supply should drop significantly"
    );
  });

  it("Test add tip on very far out API id (or on a tblock id?)", async function() {
    await helper.expectThrow(master.addTip(web3.utils.toWei("1"), 1));
    await helper.expectThrow(master.addTip(66, 2000));
    assert(
      (await master.getUintVar(web3.utils.keccak256("requestCount"))) == 52
    );
    await master.addTip(53, 2000);
    assert(
      (await master.getUintVar(web3.utils.keccak256("requestCount"))) == 53
    );
    let vars = await master.getNewCurrentVariables();
    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);

    await helper.advanceTime(60 * 60 * 16);
    await TestLib.mineBlock(env);
    vars = await master.getNewCurrentVariables();
    // vars = await master.getLastNewValue();
    assert(vars[0] > 0);
  });
});
