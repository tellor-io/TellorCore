const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var masterAbi = Tellor.abi;
const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");

contract("Token Tests", function(accounts) {
  let master;
  let env;

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
  it("Get Symbol and decimals", async function() {
    let symbol = await master.symbol();
    assert.equal(symbol, "TRB", "the Symbol should be TT");
    data3 = await master.decimals();
    assert(data3 - 0 == 18);
  });
  it("Get name", async function() {
    let name = await master.name();
    assert.equal(name, "Tellor Tributes", "the Name should be Tellor Tributes");
  });

  it("Total Supply", async function() {
    supply = await master.totalSupply();
    assert(
      web3.utils.fromWei(supply) < 500000,
      "Supply should be less than 100k"
    ); //added miner
  });

  it("Token transfer", async function() {
    await master.theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"));
    balance2 = await master.balanceOf(accounts[2]);
    t = web3.utils.toWei("5", "ether");
    balance5 = await master.balanceOf(accounts[5]);
    await master.transfer(accounts[5], t, { from: accounts[2] });
    balance2a = await master.balanceOf(accounts[2]);
    balance5a = await master.balanceOf(accounts[5]);
    assert(
      web3.utils.fromWei(balance2a, "ether") == 4995,
      web3.utils.fromWei(balance2a, "ether") + "should be 995"
    );
    assert(
      web3.utils.fromWei(balance5a) - web3.utils.fromWei(balance5) == 5,
      "balance should change by 5"
    );
  });
  it("Approve and transferFrom", async function() {
    await master.theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"));
    t = web3.utils.toWei("7", "ether");
    await master.approve(accounts[1], t, { from: accounts[2] });
    balance5 = await master.balanceOf(accounts[5]);
    balance0a = await master.balanceOf(accounts[2]);
    await master.transferFrom(accounts[2], accounts[5], t, {
      from: accounts[1],
    });
    balance5a = await master.balanceOf(accounts[5]);
    assert(
      web3.utils.fromWei(balance5a) - web3.utils.fromWei(balance5) == 7,
      "balance should change by 7"
    );
  });
  it("Allowance after approve and transferFrom", async function() {
    await master.theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"));
    t = web3.utils.toWei("7", "ether");
    t2 = web3.utils.toWei("6", "ether");
    await master.approve(accounts[1], t, { from: accounts[2] });
    balance0a = await master.balanceOf(accounts[2]);
    await master.transferFrom(accounts[2], accounts[5], t2, {
      from: accounts[1],
    });
    balance5a = await master.balanceOf(accounts[5]);
    assert(
      web3.utils.fromWei(balance5a) - web3.utils.fromWei(balance5) == 6,
      "balance for acct 5 should get 6"
    );
    allow = await master.allowance(accounts[2], accounts[1]);
    assert.equal(
      web3.utils.fromWei(allow, "ether"),
      1,
      "Allowance shoudl be 1 eth"
    );
  });
});
