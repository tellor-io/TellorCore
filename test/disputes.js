const helper = require("./helpers/test_helpers");
const TestLib = require("./helpers/testLib");

const { stakeAmount } = require("./helpers/constants");
const hash = web3.utils.keccak256;
const BN = web3.utils.BN;

contract("Dispute Tests", function(accounts) {
  let master;
  let env;
  let disputeFee;

  before("Setting up enviroment", async () => {
    try {
      await TestLib.prepare();
    } catch (error) {
      if (!error.message.includes("has already been linked")) {
        throw error;
      }
    }
  });

  const takeFifteen = async () => {
    await helper.advanceTime(60 * 18);
  };
  const startADispute = async (from, requestId = 1, minerIndex = 2) => {
    let count = await master.getNewValueCountbyRequestId(requestId);
    let timestamp = await master.getTimestampbyRequestIDandIndex(
      requestId,
      count.toNumber() - 1
    );
    await master.beginDispute(requestId, timestamp, minerIndex, { from: from });
    let disputeId = await master.getUintVar(hash("disputeCount"));
    let disp = await master.getAllDisputeVars(disputeId);
    return {
      fee: disp["8"],
      id: disputeId,
      diputer: disp["5"],
      disputed: disp["4"],
    };
  };

  beforeEach("Setup contract for each test", async function() {
    master = await TestLib.getEnv(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });

  it("Test no time limit on disputes", async function() {
    await takeFifteen();
    await TestLib.mineBlock(env);
    await helper.advanceTime(86400 * 22);
    await startADispute(accounts[1]);
    let count = await master.getUintVar(hash("disputeCount"));
    assert(count == 1);
  });

  describe("testing disputes", async () => {
    let disputeId;

    beforeEach("Start a dispute", async () => {
      await takeFifteen();
      res = await TestLib.mineBlock(env);
      let disp = await startADispute(accounts[1]);
      disputeId = disp.id;
      diputer = disp.disputer;
      disputed = disp.disputed;
      disputeFee = await master.getUintVar(hash("disputeFee"));
    });
    it("Test basic dispute", async function() {
      balance1 = await master.balanceOf(accounts[2]);
      dispBal1 = await master.balanceOf(accounts[1]);
      count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
      await master.vote(1, true, { from: accounts[3] });
      await helper.advanceTime(86400 * 22);
      await master.tallyVotes(1);
      await helper.advanceTime(86400 * 2);
      await master.unlockDisputeFee(1);
      dispInfo = await master.getAllDisputeVars(1);
      assert(dispInfo[7][0] == 1, "request id should be right");
      assert(dispInfo[7][2] == 3300, "value submited should be right");
      assert(dispInfo[2] == true, "Dispute Vote passed");
      voted = await master.didVote(1, accounts[3]);
      assert(voted == true, "account 3 voted");
      voted = await master.didVote(1, accounts[5]);
      assert(voted == false, "account 5 did not vote");
      balance2 = await master.balanceOf(accounts[2]);
      dispBal2 = await master.balanceOf(accounts[1]);
      assert(
        web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 500,
        "reported miner's balance should change correctly"
      );

      assert(
        web3.utils.fromWei(dispBal2) -
          web3.utils.fromWei(dispBal1) -
          web3.utils.fromWei(disputeFee) ==
          500,
        "disputing party's balance should change correctly"
      );
      s = await master.getStakerInfo(accounts[2]);
      assert(s != 1, " Not staked");
    });

    it("Test multiple dispute rounds, passing all three", async function() {
      let balance1 = await master.balanceOf(accounts[2]);
      let dispBal1 = await master.balanceOf(accounts[1]);

      let count = await master.getUintVar(hash("disputeCount"));

      //vote 1 passes
      await master.vote(disputeId, true);
      await helper.advanceTime(86400 * 3);
      await master.tallyVotes(disputeId);

      await helper.expectThrow(
        master.unlockDisputeFee(disputeId, { from: accounts[0] })
      );

      //try to withdraw
      dispInfo = await master.getAllDisputeVars(disputeId);
      assert(
        dispInfo[4] == accounts[2],
        "account 2 should be the disputed miner"
      );
      assert(dispInfo[2] == true, "Dispute Vote passed");

      //vote 2 - passes
      await master.theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"));
      let disp2 = await startADispute(accounts[6]);
      count = await master.getUintVar(hash("disputeCount"));
      await master.vote(disp2.id, true, { from: accounts[6] });
      await master.vote(disp2.id, true, { from: accounts[4] });
      await helper.advanceTime(86400 * 5);
      await master.tallyVotes(disp2.id);
      dispInfo = await master.getAllDisputeVars(2);
      assert(dispInfo[2] == true, "Dispute Vote passes again");

      // vote 3 - passes
      await master.theLazyCoon(accounts[3], web3.utils.toWei("5000", "ether"));
      let disp3 = await startADispute(accounts[3]);
      count = await master.getUintVar(hash("disputeCount"));
      assert(count == 3);

      await master.vote(disp3.id, false, { from: accounts[6] });
      await master.vote(disp3.id, true, { from: accounts[3] });
      await master.vote(disp3.id, true, { from: accounts[4] });

      await helper.advanceTime(86400 * 9);
      await master.tallyVotes(disp3.id);
      await helper.advanceTime(86400 * 2);

      dispInfo = await master.getAllDisputeVars(3);
      assert(dispInfo[2] == true, "Dispute Vote passed");

      await master.unlockDisputeFee(1, { from: accounts[0] });
      dispInfo = await master.getAllDisputeVars(1);
      assert(dispInfo[2] == true, "Dispute Vote passed");
      let balance2 = await master.balanceOf(accounts[2]);
      let dispBal2 = await master.balanceOf(accounts[1]);
      let disputeFee = await master.getUintVar(hash("disputeFee"));

      assert(
        balance1.sub(balance2).toString() == web3.utils.toWei("500"),
        "reported miner's balance should change correctly"
      );
      assert(
        dispBal2.sub(dispBal1).toString() == web3.utils.toWei("1000"),
        "disputing party's balance should change correctly"
      );
    });

    it("Test multiple dispute rounds - passing, then failing", async function() {
      balance1 = await master.balanceOf(accounts[2]);
      dispBal1 = await master.balanceOf(accounts[1]);
      count = await master.getUintVar(hash("disputeCount"));
      await master.vote(1, { from: accounts[3] });

      await helper.advanceTime(86400 * 3);
      await master.tallyVotes(disputeId);

      await helper.expectThrow(
        master.unlockDisputeFee(1, { from: accounts[0] })
      ); //try to withdraw
      dispInfo = await master.getAllDisputeVars(1);
      assert(
        dispInfo[4] == accounts[2],
        "account 2 should be the disputed miner"
      );
      assert(dispInfo[2] == true, "Dispute Vote passed");
      let disp2 = await startADispute(accounts[1]);
      count = await master.getUintVar(hash("disputeCount"));
      await master.vote(disp2.id, false, { from: accounts[6] });
      await master.vote(disp2.id, false, { from: accounts[4] });
      await helper.advanceTime(86400 * 5);

      await master.tallyVotes(disp2.id);
      dispInfo = await master.getAllDisputeVars(2);
      assert(dispInfo[2] == false, "Dispute Vote failed");
      await helper.advanceTime(86400 * 2);

      await master.unlockDisputeFee(1, { from: accounts[6] });

      dispInfo = await master.getAllDisputeVars(1);
      assert(dispInfo[2] == true, "Dispute Vote passed");
      dispInfo2 = await master.getAllDisputeVars(2);
      balance2 = await master.balanceOf(accounts[2]);
      dispBal2 = await master.balanceOf(accounts[1]);
      let disputeFee = await master.getUintVar(hash("disputeFee"));

      assert(
        dispBal1
          .sub(dispBal2)
          .sub(disputeFee)
          .eq(dispInfo[7][8]),
        "reported miner's balance should change correctly"
      );

      assert(
        dispBal1
          .sub(dispBal2)
          .sub(disputeFee)
          .eq(dispInfo[7][8]),
        "disputing party's balance should change correctly"
      );
    });

    it("Test multiple dispute rounds - failing, then passing", async function() {
      balance1 = await master.balanceOf(accounts[2]);
      dispBal1 = await master.balanceOf(accounts[1]);

      count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
      //vote 1 fails
      await master.vote(1, false);

      await helper.advanceTime(86400 * 3);
      await master.tallyVotes(1);

      await helper.expectThrow(master.unlockDisputeFee(1)); //try to withdraw
      dispInfo = await master.getAllDisputeVars(1);
      assert(
        dispInfo[4] == accounts[2],
        "account 2 should be the disputed miner"
      );
      assert(dispInfo[2] == false, "Dispute Vote failed");

      //vote 2 - passes
      let disp2 = await startADispute(accounts[1]);

      count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
      await master.vote(disp2.id, true, { from: accounts[6] });
      await master.vote(disp2.id, true, { from: accounts[4] });

      await helper.advanceTime(86400 * 5);
      await master.tallyVotes(disp2.id);

      dispInfo = await master.getAllDisputeVars(2);
      assert(dispInfo[2] == true, "Dispute Vote passed");
      await helper.advanceTime(86400 * 2);
      await master.unlockDisputeFee(1);

      balance2 = await master.balanceOf(accounts[2]);
      dispBal2 = await master.balanceOf(accounts[1]);
      let disputeFee = await master.getUintVar(hash("disputeFee"));

      assert(
        balance1 - balance2 ==
          (await master.getUintVar(web3.utils.keccak256("stakeAmount"))),
        "reported miner's balance should change correctly"
      );
      assert(
        web3.utils.fromWei(dispBal2) - web3.utils.fromWei(dispBal1) == 1000,
        "disputing party's balance should change correctly"
      );
      assert(
        web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 500,
        "Account 2 balance should be correct"
      );
    });
  });

  //This test cases needs to be fixed!
  it("Test multiple dispute to the same miner", async function() {
    let times = [];
    let blocks = [];
    const reportingMiner = accounts[5];
    const reportedMiner = accounts[1];
    const reportedIndex = 1;

    const requestId = 1;
    for (j = 0; j < 4; j++) {
      await master.addTip(1, 1000);
      await takeFifteen();
      await TestLib.mineBlock(env);

      await takeFifteen();
      let block = await TestLib.mineBlock(env);
      let count = await master.getNewValueCountbyRequestId(requestId);
      let timestamp = await master.getTimestampbyRequestIDandIndex(
        requestId,
        count.toNumber() - 1
      );
      blocks.push(block);
      times.push(timestamp);
    }
    let balance1 = await master.balanceOf(reportingMiner);
    let dispBal1 = await master.balanceOf(reportedMiner);
    let orig_dispBal4 = await master.balanceOf(accounts[4]);

    await master.beginDispute(requestId, times[0], reportedIndex, {
      from: reportingMiner,
    });
    await master.beginDispute(requestId, times[1], reportedIndex, {
      from: reportingMiner,
    });
    await master.beginDispute(requestId, times[2], reportedIndex, {
      from: reportingMiner,
    });

    //dispute votes and tally
    await master.vote(1, true, { from: accounts[3] });
    await master.vote(2, true, { from: accounts[3] });
    await master.vote(3, true, { from: accounts[3] });

    await helper.advanceTime(86400 * 22);
    await master.tallyVotes(1);
    await master.tallyVotes(2);
    await master.tallyVotes(3);
    await helper.advanceTime(86400 * 2);

    await master.unlockDisputeFee(1, { from: accounts[0] });
    await master.unlockDisputeFee(2, { from: accounts[0] });
    await master.unlockDisputeFee(3, { from: accounts[0] });

    dispInfo = await master.getAllDisputeVars(1);
    assert(dispInfo[7][0] == requestId);
    assert(dispInfo[7][2] == blocks[0].values[reportedIndex][0]);
    assert(dispInfo[2] == true, "Dispute Vote passed");

    voted = await master.didVote(1, accounts[3]);
    assert(voted == true, "account 3 voted");
    voted = await master.didVote(1, accounts[5]);
    assert(voted == false, "account 5 did not vote");
    let value = await master.retrieveData(1, times[0]);
    assert(value.toNumber() > 0);

    //checks balances after dispute 1
    let balance2 = await master.balanceOf(reportingMiner);
    let dispBal2 = await master.balanceOf(reportedMiner);

    assert(
      balance2.sub(balance1).eq(stakeAmount),
      "reporting miner's balance should change correctly"
    );

    assert(
      dispBal1.sub(dispBal2).eq(stakeAmount),
      "reported party's balance should change correctly"
    );
    s = await master.getStakerInfo(accounts[1]);
    assert(s != 1, " Not staked");
    dispInfo = await master.getAllDisputeVars(3);
    let dispBal4 = await master.balanceOf(accounts[4]);
    assert(dispBal4 - orig_dispBal4 == 0, "a4 shouldn't change'");
  });

  it("Test multiple dispute to official value/miner index 2", async function() {
    let requetsId = 1;

    let times = [];
    let blocks = [];
    for (j = 0; j < 3; j++) {
      await master.addTip(requetsId, 1000);
      await takeFifteen();
      await TestLib.mineBlock(env);
      await takeFifteen();
      let block = await TestLib.mineBlock(env);
      blocks.push(block);
      let count = await master.getNewValueCountbyRequestId(1);
      let timestamp = await master.getTimestampbyRequestIDandIndex(
        1,
        count.toNumber() - 1
      );
      times.push(timestamp);
    }
    let balance1 = await master.balanceOf(accounts[2]);
    orig_dispBal4 = await master.balanceOf(accounts[4]);
    let dispBal1 = await master.balanceOf(accounts[1]);
    await master.beginDispute(requetsId, times[0], 2, { from: accounts[1] });
    await master.beginDispute(requetsId, times[1], 2, { from: accounts[3] });
    await master.beginDispute(requetsId, times[2], 2, { from: accounts[4] });

    //dispute votes and tally
    await master.vote(1, true, { from: accounts[1] });
    await master.vote(2, true, { from: accounts[1] });
    await master.vote(3, true, { from: accounts[1] });

    await helper.advanceTime(86400 * 22);
    await master.tallyVotes(1);
    await master.tallyVotes(2);
    await master.tallyVotes(3);

    await helper.advanceTime(86400 * 2);
    await master.unlockDisputeFee(1, { from: accounts[0] });
    await master.unlockDisputeFee(2, { from: accounts[0] });
    await master.unlockDisputeFee(3, { from: accounts[0] });

    dispInfo = await master.getAllDisputeVars(1);

    assert(dispInfo[7][0] == requetsId);
    assert(dispInfo[7][2] == blocks[0].submitted[requetsId][2]);
    assert(dispInfo[2] == true, "Dispute Vote passed");
    voted = await master.didVote(1, accounts[1]);
    assert(voted == true, "account 1 voted");
    voted = await master.didVote(1, accounts[3]);
    assert(voted == false, "account 3 did not vote");
    let value = await master.retrieveData(1, times[0]);
    assert(value.toNumber() == 0);
    //checks balances after dispute 1
    balance2 = await master.balanceOf(accounts[2]);
    dispBal2 = await master.balanceOf(accounts[1]);

    assert(
      balance1.sub(balance2).eq(stakeAmount),
      "reported miner's balance should change correctly"
    );
    assert(
      dispBal2.sub(dispBal1).eq(stakeAmount),
      "disputing party's balance should change correctly"
    );
    s = await master.getStakerInfo(accounts[2]);
    assert(s != 1, " Not staked");
    dispBal4 = await master.balanceOf(accounts[4]);
    assert(dispBal4 - orig_dispBal4 == 0, "a4 shouldn't change'");
  });

  it("Test multiple dispute rounds -- proposed fork", async function() {
    let add = "0x0BB7087eE6F9D4Cf664F863EDf2b70293b29D71d";
    await master.proposeFork(add, { from: accounts[1] });

    for (var i = 1; i < 5; i++) {
      await master.theLazyCoon(accounts[i], web3.utils.toWei("1000", "ether"));
      await master.vote(1, true, { from: accounts[i] });
    }
    await helper.advanceTime(86400 * 8);
    await master.tallyVotes(1);

    await helper.advanceTime(100);
    dispInfo = await master.getAllDisputeVars(1);
    assert(dispInfo[2] == true, "Dispute Vote passed");
    assert((await master.getAddressVars(hash("tellorContract"))) != add);
    await master.proposeFork(add);

    for (var i = 1; i < 5; i++) {
      await master.vote(2, false, { from: accounts[i] });
    }
    await helper.advanceTime(86400 * 8);
    await master.tallyVotes(2);

    // await helper.expectThrow(await master.updateTellor(1)); //try to withdraw
    await helper.advanceTime(86400 * 8);
    await helper.expectThrow(master.updateTellor(2));
    assert((await master.getAddressVars(hash("tellorContract"))) != add);
  });

  it("Test proposed fork fee increase", async function() {
    let add = "0x0BB7087eE6F9D4Cf664F863EDf2b70293b29D71d";
    let baseFee = new BN(web3.utils.toWei("100", "ether"));

    for (var i = 1; i < 5; i++) {
      let initBal = await master.balanceOf(master.address);
      await master.proposeFork(add, {
        from: accounts[1],
      });
      let secBal = await master.balanceOf(master.address);
      let pot = new BN("2").pow(new BN(i - 1));
      assert(
        secBal.sub(initBal).eq(baseFee.mul(pot)),
        "fee incorrectly calculated"
      );
      //await 7 days
      await helper.advanceTime(60 * 60 * 24 * 7);
    }
  });

  it("Test multiple dispute rounds, assure increasing per dispute round", async function() {
    await master.theLazyCoon(accounts[1], web3.utils.toWei("500", "ether"));
    await takeFifteen();
    let res = await TestLib.mineBlock(env);
    await master.theLazyCoon(accounts[1], web3.utils.toWei("5000", "ether"));
    let balance1 = await master.balanceOf(accounts[2]);
    let dispBal1 = await master.balanceOf(accounts[1]);
    await startADispute(accounts[1]);

    count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
    //vote 1 passes
    await master.vote(1, true, { from: accounts[3] });

    await helper.advanceTime(86400 * 3);
    await master.tallyVotes(1);

    await helper.expectThrow(master.unlockDisputeFee(1, { from: accounts[0] })); //try to withdraw
    dispInfo = await master.getAllDisputeVars(1);
    assert(
      dispInfo[4] == accounts[2],
      "account 2 should be the disputed miner"
    );
    assert(dispInfo[2] == true, "Dispute Vote passed");
    assert(web3.utils.fromWei(dispInfo[7][8]) == 500, "fee should be correct");
    //vote 2 - fails
    await master.theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"));
    await startADispute(accounts[1]);

    count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
    await master.vote(2, true, { from: accounts[4] });
    await master.vote(2, true, { from: accounts[6] });

    await helper.advanceTime(86400 * 5);
    await master.tallyVotes(2);

    dispInfo = await master.getAllDisputeVars(2);
    assert(dispInfo[2] == true, "Dispute Vote passes again");
    assert(web3.utils.fromWei(dispInfo[7][8]) == 1000, "fee should be correct");
    await helper.advanceTime(86400 * 2);
    dispInfo = await master.getAllDisputeVars(1);
    assert(dispInfo[2] == true, "Dispute Vote passed");
    await master.unlockDisputeFee(1, { from: accounts[0] });

    dispInfo = await master.getAllDisputeVars(1);
    assert(dispInfo[2] == true, "Dispute Vote passed");
    let balance2 = await master.balanceOf(accounts[2]);
    let dispBal2 = await master.balanceOf(accounts[1]);
    assert(
      balance1 - balance2 == web3.utils.toWei("500"),
      "reported miner's balance should change correctly"
    );
    assert(
      dispBal2 - dispBal1 == web3.utils.toWei("500"),
      "disputing party's balance should change correctly"
    );
  });
  it("Test multiple dispute rounds, assure increasing per dispute round (nonZero)", async function() {
    await master.theLazyCoon(accounts[1], web3.utils.toWei("500", "ether"));
    await takeFifteen();
    res = await TestLib.mineBlock(env);
    // console.log(res);
    // res = web3.eth.abi.decodeParameters(
    //   ["uint256[5]", "uint256", "uint256[5]", "uint256"],
    //   res.logs["1"].data
    // );
    await master.theLazyCoon(accounts[1], web3.utils.toWei("5000", "ether"));

    let balance1 = await master.balanceOf(accounts[3]);
    let dispBal1 = await master.balanceOf(accounts[1]);
    await startADispute(accounts[1], 1, 3);

    count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
    //vote 1 passes
    await master.vote(1, true, { from: accounts[2] });

    await helper.advanceTime(86400 * 3);
    await master.tallyVotes(1);

    await helper.expectThrow(master.unlockDisputeFee(1, { from: accounts[0] })); //try to withdraw
    dispInfo = await master.getAllDisputeVars(1);
    assert(
      dispInfo[4] == accounts[3],
      "account 2 should be the disputed miner"
    );
    assert(dispInfo[2] == true, "Dispute Vote passed");
    assert(web3.utils.fromWei(dispInfo[7][8]) == 500, "fee should be correct");
    //vote 2 - fails
    await master.theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"));
    await startADispute(accounts[0], 1, 3);

    count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
    await master.vote(2, true, { from: accounts[6] });
    await master.vote(2, true, { from: accounts[4] });

    await helper.advanceTime(86400 * 5);
    await master.tallyVotes(2);

    dispInfo = await master.getAllDisputeVars(2);
    assert(dispInfo[2] == true, "Dispute Vote passes again");
    assert(
      web3.utils.fromWei(dispInfo[7][8]) == 500 * 2,
      "fee should be correct"
    );
    await helper.advanceTime(86400 * 2);
    dispInfo = await master.getAllDisputeVars(1);
    assert(dispInfo[2] == true, "Dispute Vote passed");
    await master.unlockDisputeFee(1, { from: accounts[0] });

    dispInfo = await master.getAllDisputeVars(1);
    assert(dispInfo[2] == true, "Dispute Vote passed");
    let balance2 = await master.balanceOf(accounts[3]);
    let dispBal2 = await master.balanceOf(accounts[1]);

    assert(
      balance1 - balance2 == web3.utils.toWei("500"),
      "reported miner's balance should change correctly"
    );
    assert.equal(
      dispBal2.sub(dispBal1).toString(),
      web3.utils.toWei("500"),
      "disputing party's balance should change correctly"
    );
  });
});
