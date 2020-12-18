const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var masterAbi = Tellor.abi;
const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");

contract("Staking Tests", function(accounts) {
  let master;
  let env;

    before("Setting up enviroment", async() => {
    try {
      await TestLib.prepare()
    } catch (error) {
      if (!error.message.includes("has already been linked")) {
        throw error;
      }
    }
  })


  beforeEach("Setup contract for each test", async function() {
    master = await TestLib.getEnv(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });
  it("Stake miner", async function() {
    await master.theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"))
    await master.depositStake({from:accounts[6]})
    let s = await master.getStakerInfo(accounts[6]);
    assert(s[0] == 1, "Staked");
  });

  it("getStakersCount", async function() {
    let count = await master.getUintVar(web3.utils.keccak256("stakerCount"));
    assert(web3.utils.hexToNumberString(count) == 6, "count is 6"); //added miner
  });
  it("getStakersInfo", async function() {
    let info = await master.getStakerInfo(accounts[1]);
    let stake = web3.utils.hexToNumberString(info["0"]);
    let startDate = web3.utils.hexToNumberString(info["1"]);
    let _date = new Date();
    let d = (_date - (_date % 86400000)) / 1000;
    assert(startDate >= d * 1, "startDate is today");
    assert(stake * 1 == 1, "Should be 1 for staked address");
  });

  it("Staking, requestStakingWithdraw, withdraw stake", async function() {
    let withdrawreq = await master.requestStakingWithdraw({
      from: accounts[1],
    });
    await helper.advanceTime(86400 * 8);
    s = await master.getStakerInfo(accounts[1]);
    assert(s['0'] *1-0 == 2, " Should be 2");
    await master.withdrawStake({ from: accounts[1] });
    s = await master.getStakerInfo(accounts[1]);
    assert(s['0'] *1-0 == 0, "not Staked");
  });
  it("Attempt to Allow and transferFrom more than balance - stake", async function() {
    await master.theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"));
    await master.transfer(accounts[8], web3.utils.toWei("500"), {
      from: accounts[1],
    });
    var tokens = web3.utils.toWei("2", "ether");
    var tokens2 = web3.utils.toWei("530", "ether");
    await master.transfer(accounts[1], tokens, { from: accounts[2] });
    balance1 = await master.balanceOf(accounts[1]);
    await master.approve(accounts[6], tokens2, { from: accounts[1] });
    await helper.expectThrow(
      master.transferFrom(accounts[1], accounts[8], "1" + tokens2.toString(), {
        from: accounts[6],
      })
    );
    balance1b = await master.balanceOf(accounts[1]);
    assert(
      web3.utils.fromWei(balance1b) * 1 == web3.utils.fromWei(balance1) * 1,
      "Balance for acct 1 should not change "
    );
  });
  it("Attempt to withdraw unnaproved", async function() {
    balance1 = await master.balanceOf(accounts[1])
    await helper.expectThrow(
       master.withdrawStake({from:accounts[1]})
    );
    s = await master.getStakerInfo(accounts[1]);
    assert(s[0] == 1, " Staked");
    balance1b = await master.balanceOf(accounts[1])
    assert(
      web3.utils.fromWei(balance1b) *1 == web3.utils.fromWei(balance1) * 1,
      "Balance for acct 1 should not change "
    );
  });
  it("Attempt to transfer more than balance - stake", async function() {
    await master.theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"))
    var tokens = web3.utils.toWei("1", "ether");
    var tokens2 = web3.utils.toWei("2000000", "ether");
    await master.transfer(accounts[1], tokens,{from:accounts[2]})
    balance1 = await master.balanceOf(accounts[1])
    await helper.expectThrow(
      master.transfer(accounts[2], tokens2,{from:accounts[1]})
    );
    balance1b = await master.balanceOf(accounts[1])
    assert(
      web3.utils.fromWei(balance1b) *1 == web3.utils.fromWei(balance1) * 1,
      "Balance for acct 1 should not change "
    );
  });
  it("re-Staking without withdraw ", async function() {
    await helper.advanceTime(86400 * 10);
    let withdrawreq = await master.requestStakingWithdraw({
      from: accounts[1],
    });
    await helper.advanceTime(86400 * 10);
    let s = await master.getStakerInfo(accounts[1]);
    assert(s[0] == 2, "is not Staked");
    await master.depositStake({ from: accounts[1] });
    s = await master.getStakerInfo(accounts[1]);
    assert(s[0] == 1, "is not Staked");
  });
  it("withdraw and re-stake", async function() {
    await helper.advanceTime(86400 * 10);
    let withdrawreq = await master.requestStakingWithdraw({
      from: accounts[1],
    });
    await helper.advanceTime(86400 * 10);
    let s = await master.getStakerInfo(accounts[1]);
    assert(s[0] == 2, "is not Staked");
    await master.withdrawStake({ from: accounts[1] });
    s = await master.getStakerInfo(accounts[1]);
    assert(s[0]  == 0, " not Staked");
    await master.depositStake({ from: accounts[1] });
    s = await master.getStakerInfo(accounts[1]);
    assert(s[0] == 1, " Staked");
  });
});
