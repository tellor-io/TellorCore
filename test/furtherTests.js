const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");
const Tellor = artifacts.require("./TellorTest.sol");
contract("Further tests", function(accounts) {
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

  it("transferOwnership", async function() {
    let checkowner = await master.getAddressVars(
      web3.utils.keccak256("_owner")
    );
    assert(checkowner == accounts[0], "initial owner acct 0");
    await master.proposeOwnership(accounts[2])
    let pendingOwner = await master.getAddressVars(
      web3.utils.keccak256("pending_owner")
    );
    assert(pendingOwner == accounts[2], "pending owner acct 2");
    checkowner = await master.getAddressVars(web3.utils.keccak256("_owner"));
    assert(checkowner == accounts[0], "initial owner acct 0");
    await master.claimOwnership({from:accounts[2]})
    checkowner = await master.getAddressVars(web3.utils.keccak256("_owner"));
    assert(checkowner == accounts[2], "new owner acct 2");
  });
  it("Test Deity Functions", async function() {
    let owner = await master.getAddressVars(web3.utils.keccak256("_deity"));
    assert(owner == accounts[0]);
    await master.changeDeity(accounts[1])
    owner = await master.getAddressVars(web3.utils.keccak256("_deity"));
    assert(owner == accounts[1]);
    let newOracle = await Tellor.new();
    master.changeTellorContract(newOracle.address,{from:accounts[1]})
    assert(
      (await master.getAddressVars(web3.utils.keccak256("tellorContract"))) ==
        newOracle.address
    );
  });
  it("Get Symbol and decimals", async function() {
    let symbol = await master.symbol()
    assert.equal(symbol, "TRB", "the Symbol should be TT");
    data3 = await master.decimals()
    assert(data3 - 0 == 18);
  });
  it("Get name", async function() {
    let name = await master.name();
    assert.equal(name, "Tellor Tributes", "the Name should be Tellor Tributes");
  });

  it("Total Supply", async function() {
    let supply = await master.totalSupply();
    assert(web3.utils.fromWei(supply) > 0, "Supply should not be 0"); //added miner
    assert(web3.utils.fromWei(supply) < 200000, "Supply should be less than 100k"); //added miner
  });
  it("Test Changing Dispute Fee", async function() {
    await  master.theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"))
    await master.theLazyCoon(accounts[7], web3.utils.toWei("5000", "ether"))
    var disputeFee1 = await master.getUintVar(
      web3.utils.keccak256("disputeFee")
    );
    newOracle = await Tellor.new();
    await master.changeTellorContract(newOracle.address)
    await master.depositStake({from:accounts[6]})
    await  master.depositStake({from:accounts[7]})
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
    new_balances = [];
    for (var i = 0; i < 6; i++) {
      new_balances[i] = await master.balanceOf(accounts[i]);
    }
    changes = [];
    for (var i = 0; i < 6; i++) {
      changes[i] = new_balances[i] - balances[i];
    }
    newTotalSupply = await master.totalSupply();

    assert(changes[0] <= web3.utils.toWei("107.58", "ether"));
    assert(changes[1] <= web3.utils.toWei("105.72", "ether"));
    assert(changes[2] <= web3.utils.toWei("105.72", "ether"));
    assert(changes[3] <= web3.utils.toWei("105.72", "ether"));
    assert(changes[4] <= web3.utils.toWei("105.72", "ether"));
    console.log(initTotalSupply.toString());
    console.log(newTotalSupply.toString());
    console.log(initTotalSupply.sub(newTotalSupply).toString());
    console.log(web3.utils.toWei("479", "ether"));
    assert(
      initTotalSupply - newTotalSupply > web3.utils.toWei("479", "ether"),
      "total supply should drop significatntly"
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
  it("Test Proper zeroing of Payout Test", async function() {
    vars = await master.getNewCurrentVariables();
    await takeFifteen();
    await TestLib.mineBlock(env);
    vars = await master.getRequestVars(vars["1"][0]);
    assert(vars["5"] == 0, "api payout should be zero");
    vars = await master.getUintVar(web3.utils.keccak256("currentTotalTips"));
    assert(vars == 0, "api payout should be zero");
  });
});
