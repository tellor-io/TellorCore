const helper = require("./helpers/test_helpers");
const TestLib = require("./helpers/testLib");
const testLib = require("./helpers/testLib");
const Tellor = artifacts.require("TellorTest");

const hash = web3.utils.keccak256;
const BN = web3.utils.BN;



contract("Dispute Tests", function(accounts) {
  let master;
  let env;
  let disputeFee;

  before("Setting up enviroment", async() => {
    try {
      await TestLib.prepare()
    } catch (error) {
      if (!error.message.includes("has already been linked")) {
        throw error;
      }
    }
  })


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
    // await takeFifteen();
    // await TestLib.mineBlock(env);
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
    let diputer;
    let disputed;
    let res;

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
      assert(dispInfo[7][2] == 1200, "value submited should be right");
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
  // it("Test multiple dispute to the same miner", async function() {
  //   let times = []
  //   for (j = 0; j < 5; j++) {
  //     await master.addTip(1, 1000);
  //     await takeFifteen();
  //     console.log("lala");
  //     await TestLib.mineBlock(env);
  //     let count = await master.getNewValueCountbyRequestId(1);
  //     let timestamp = await master.getTimestampbyRequestIDandIndex(1,count.toNumber() - 1);
  //     times.push(timestamp)
  //   }
  //   console.log("After");
  //   let balance1 = await master.balanceOf(accounts[1]);
  //   let dispBal1 = await master.balanceOf(accounts[2]);
  //   let orig_dispBal4 = await master.balanceOf(accounts[4]);

  //   await master.beginDispute(1, times[0], 2, { from: accounts[0] });
  //   await master.beginDispute(1, times[1], 2, { from: accounts[1] });
  //   await master.beginDispute(1, times[2], 2, { from: accounts[0] });

  //   //dispute votes and tally
  //   await master.vote(1, true, { from: accounts[3] });
  //   await master.vote(2, true, { from: accounts[3] });
  //   await master.vote(3, true, { from: accounts[3] });

  //   await helper.advanceTime(86400 * 22);
  //   await master.tallyVotes(1);
  //   await master.tallyVotes(2);
  //   await master.tallyVotes(3);
  //   await helper.advanceTime(86400 * 2);

  //   await master.unlockDisputeFee(1, { from: accounts[0] });
  //   await master.unlockDisputeFee(2, { from: accounts[0] });
  //   await master.unlockDisputeFee(3, { from: accounts[0] });

  //   dispInfo = await master.getAllDisputeVars(1);
  //   assert(dispInfo[7][0] == 1);
  // //   assert(dispInfo[7][1] == resVars[0][1]);
  //   assert(dispInfo[7][2] == 1600);
  //   assert(dispInfo[2] == true, "Dispute Vote passed");
  //   voted = await master.didVote(1, accounts[3]);
  //   assert(voted == true, "account 3 voted");
  //   voted = await master.didVote(1, accounts[5]);
  //   assert(voted == false, "account 5 did not vote");
  //   let value = await master.retrieveData(1, times[0]);
  //   assert(value.toNumber() > 0)



  //   //checks balances after dispute 1
  //   let balance2 = await master.balanceOf(accounts[1]);
  //   let dispBal2 = await master.balanceOf(accounts[2]);
  //   console.log(web3.utils.fromWei(balance2));
  //   console.log(web3.utils.fromWei(balance1));
  //   console.log(web3.utils.fromWei(balance2) - web3.utils.fromWei(balance1));
  //   assert(
  //     web3.utils.fromWei(balance2) - web3.utils.fromWei(balance1) == 1000,
  //     "reporting miner's balance should change correctly"
  //   );
    
  //   assert(
  //     web3.utils.fromWei(dispBal1) - web3.utils.fromWei(dispBal2) == 500,
  //     "reported party's balance should change correctly"
  //   );
  //   s = await master.getStakerInfo(accounts[1]);
  //   assert(s != 1, " Not staked");
  //   dispInfo = await master.getAllDisputeVars(3);
  //   let dispBal4 = await master.balanceOf(accounts[4]);
  //   assert(dispBal4 - orig_dispBal4 == 0, "a4 shouldn't change'");
  // });


  it("Test multiple dispute to official value/miner index 2", async function() {
    let times = []
    for (j = 0; j < 3; j++) {
      await master.addTip(1, 1000);
      await takeFifteen();
      await takeFifteen();
      await TestLib.mineBlock(env);
      let count = await master.getNewValueCountbyRequestId(1);
      let timestamp = await master.getTimestampbyRequestIDandIndex(1,count.toNumber() - 1);
      times.push(timestamp)
      console.log(timestamp);
    }
    let balance1 = await master.balanceOf(accounts[2]);
    orig_dispBal4 = await master.balanceOf(accounts[4]);
    let dispBal1 = await master.balanceOf(accounts[1]);
    await master.beginDispute(1, times[0], 2, { from: accounts[1] });
    await master.beginDispute(1, times[1], 2, { from: accounts[3] });
    await master.beginDispute(1, times[2], 2, { from: accounts[4] });


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

    assert(dispInfo[7][0] == 1);
    console.log(dispInfo[7][2].toString());
    assert(dispInfo[7][2] == 1600);
    assert(dispInfo[2] == true, "Dispute Vote passed");
    voted = await master.didVote(1, accounts[1]);
    assert(voted == true, "account 3 voted");
    voted = await master.didVote(1, accounts[3]);
    assert(voted == false, "account 5 did not vote");
    let value = await master.retrieveData(1, times[0]);
    assert(value.toNumber() == 0)
    //checks balances after dispute 1
    balance2 = await master.balanceOf(accounts[2]);
    dispBal2 = await master.balanceOf(accounts[1]);

    assert(
      web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 500,
      "reported miner's balance should change correctly"
    );
    assert(
      web3.utils.fromWei(dispBal2) - web3.utils.fromWei(dispBal1) == 500,
      "disputing party's balance should change correctly"
    );
    s = await master.getStakerInfo(accounts[2]);
    assert(s != 1, " Not staked");
    dispBal4 = await master.balanceOf(accounts[4]);
    assert(dispBal4 - orig_dispBal4 == 0, "a4 shouldn't change'");
  });


  it("Test multiple dispute rounds -- proposed fork", async function() {
    let master2 = await Tellor.new();
    await master.proposeFork(master2.address, { from: accounts[1] });

    for (var i = 1; i < 5; i++) {
      await master.theLazyCoon(accounts[i], web3.utils.toWei("1000", "ether"));
      await master.vote(1, true, { from: accounts[i] });
    }
    await helper.advanceTime(86400 * 8);
    await master.tallyVotes(1);

    await helper.advanceTime(100);
    dispInfo = await master.getAllDisputeVars(1);
    assert(dispInfo[2] == true, "Dispute Vote passed");
    assert(
      (await master.getAddressVars(hash("tellorContract"))) != master.address
    );
    await master.proposeFork(master.address);

    for (var i = 1; i < 5; i++) {
      await master.vote(2, false, { from: accounts[i] });
    }
    await helper.advanceTime(86400 * 8);
    await master.tallyVotes(2);

    // await helper.expectThrow(await master.updateTellor(1)); //try to withdraw
    await helper.advanceTime(86400 * 8);
    await helper.expectThrow(master.updateTellor(2));
    assert(
      (await master.getAddressVars(hash("tellorContract"))) != master.address
    );
  });
  it("Test allow tip of current mined ID", async function() {
    vars = await master.getNewCurrentVariables();
    await master.addTip(1, 10000);
    await takeFifteen()
    await testLib.mineBlock(env)
    vars2 = await master.getNewCurrentVariables();
    assert(vars2[3] > 10000, "tip should be big");
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
