const helper = require("./helpers/test_helpers");
const TestLib = require("./helpers/testLib");

const hash = web3.utils.keccak256;
const BN = web3.utils.BN;

contract("v2 Tests", function(accounts) {
  let master;
  let env;

  const takeFifteen = async () => {
    await helper.advanceTime(60 * 16);
  };
  const startADispute = async (from, requestId = 1) => {
    let count = await master.getNewValueCountbyRequestId(requestId);
    let timestamp = await master.getTimestampbyRequestIDandIndex(
      requestId,
      count.toNumber() - 1
    );
    await master.beginDispute(requestId, timestamp, 2, { from: from });
    let disputeId = await master.getUintVar(hash("disputeCount"));
    let disp = await master.getAllDisputeVars(disputeId);
    return {
      id: disputeId,
      diputer: disp["5"],
      disputed: disp["4"],
    };
  };

  beforeEach("Setup contract for each test", async function() {
    master = await TestLib.getV25(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });
  //   it("Test zeroing out of currentTips", async function() {
  //     await master.addTip(1, 100000000000);
  //     await TestLib.mineBlock(env);
  //     assert((await master.getUintVar(hash("currentTotalTips"))) == 0);
  //   });

  //   it("Test lower difficulty target (5 min)", async function() {
  //     assert((await master.getUintVar(hash("timeTarget"))) == 300);
  //   });

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

    beforeEach("Start a dispute", async () => {
      await takeFifteen();
      await TestLib.mineBlock(env);
      let disp = await startADispute(accounts[1]);

      disputeId = disp.id;
      diputer = disp.disputer;
      disputed = disp.disputed;
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

      //vote 2 - fails
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[0],
        gas: 7000000,
        data: master.methods
          .theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"))
          .encodeABI(),
      });
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[6],
        gas: 7000000,
        data: master.methods.beginDispute(1, res[1], 2).encodeABI(),
      });
      count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[6],
        gas: 7000000,
        data: master.methods.vote(2, true).encodeABI(),
      });
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[4],
        gas: 7000000,
        data: master.methods.vote(2, true).encodeABI(),
      });
      await helper.advanceTime(86400 * 5);

      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[0],
        gas: 7000000,
        data: master.methods.tallyVotes(2).encodeABI(),
      });
      dispInfo = await master.getAllDisputeVars(2);
      assert(dispInfo[2] == true, "Dispute Vote passes again");
      // vote 3 - passes
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[0],
        gas: 7000000,
        data: master.methods
          .theLazyCoon(accounts[3], web3.utils.toWei("5000", "ether"))
          .encodeABI(),
      });
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[1],
        gas: 7000000,
        data: master.methods.beginDispute(1, res[1], 2).encodeABI(),
      });
      count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
      assert(count == 3);
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[6],
        gas: 7000000,
        data: master.methods.vote(3, false).encodeABI(),
      });
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[3],
        gas: 7000000,
        data: master.methods.vote(3, true).encodeABI(),
      });
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[4],
        gas: 7000000,
        data: master.methods.vote(3, true).encodeABI(),
      });
      await helper.advanceTime(86400 * 9);
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[0],
        gas: 7000000,
        data: master.methods.tallyVotes(3).encodeABI(),
      });
      await helper.advanceTime(86400 * 2);
      dispInfo = await master.getAllDisputeVars(1);
      assert(dispInfo[2] == true, "Dispute Vote passed");
      await web3.eth.sendTransaction({
        to: master.address,
        from: accounts[0],
        gas: 9000000,
        data: master.methods.unlockDisputeFee(1).encodeABI(),
      });
      dispInfo = await master.getAllDisputeVars(1);
      assert(dispInfo[2] == true, "Dispute Vote passed");
      balance2 = await master.balanceOf(accounts[2]);
      dispBal2 = await master.balanceOf(accounts[1]);
      assert(
        balance1 - balance2 == web3.utils.toWei("1000"),
        "reported miner's balance should change correctly"
      );
      assert(
        dispBal2 - dispBal1 == web3.utils.toWei("1000"),
        "disputing party's balance should change correctly"
      );
    });
  });
  //   it("Test multiple dispute rounds -- proposed fork", async function() {
  //     for (var i = 0; i < 5; i++) {
  //       res = await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods
  //           .testSubmitMiningSolution(
  //             "nonce",
  //             [1, 2, 3, 4, 5],
  //             [1200, 1300, 1400, 1500, 1600]
  //           )
  //           .encodeABI(),
  //       });
  //     }
  //     res = web3.eth.abi.decodeParameters(
  //       ["uint256[5]", "uint256", "uint256[5]", "uint256"],
  //       res.logs["1"].data
  //     );
  //     balance1 = await master.balanceOf(accounts[2]);
  //     dispBal1 = await master.balanceOf(accounts[1]);

  //     let master = await Tellor.new();
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[2],
  //       gas: 7000000,
  //       data: master.methods.proposeFork(master.address).encodeABI(),
  //     });
  //     for (var i = 1; i < 5; i++) {
  //       await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods.vote(1, true).encodeABI(),
  //       });
  //     }
  //     await helper.advanceTime(86400 * 8);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[i],
  //       gas: 7000000,
  //       data: master.methods.tallyVotes(1).encodeABI(),
  //     });
  //     await helper.advanceTime(100);
  //     dispInfo = await master.getAllDisputeVars(1);
  //     assert(dispInfo[2] == true, "Dispute Vote passed");
  //     assert(
  //       (await master.getAddressVars(web3.utils.keccak256("tellorContract"))) !=
  //         master.address
  //     );
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[3],
  //       gas: 7000000,
  //       data: master.methods.proposeFork(master.address).encodeABI(),
  //     });
  //     for (var i = 1; i < 5; i++) {
  //       await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods.vote(2, false).encodeABI(),
  //       });
  //     }
  //     await helper.advanceTime(86400 * 8);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.tallyVotes(2).encodeABI(),
  //     });
  //     await helper.expectThrow(
  //       web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[0],
  //         gas: 7000000,
  //         data: master.methods.updateTellor(1).encodeABI(),
  //       })
  //     ); //try to withdraw
  //     await helper.advanceTime(86400 * 8);
  //     await helper.expectThrow(
  //       web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[0],
  //         gas: 7000000,
  //         data: master.methods.updateTellor(2).encodeABI(),
  //       })
  //     );
  //     assert(
  //       (await master.getAddressVars(web3.utils.keccak256("tellorContract"))) !=
  //         master.address
  //     );
  //   });
  //   it("Test multiple dispute rounds - passing, then failing", async function() {
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods
  //         .theLazyCoon(accounts[6], web3.utils.toWei("3000", "ether"))
  //         .encodeABI(),
  //     });

  //     for (var i = 0; i < 5; i++) {
  //       res = await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods
  //           .testSubmitMiningSolution(
  //             "nonce",
  //             [1, 2, 3, 4, 5],
  //             [1200, 1300, 1400, 1500, 1600]
  //           )
  //           .encodeABI(),
  //       });
  //     }
  //     res = web3.eth.abi.decodeParameters(
  //       ["uint256[5]", "uint256", "uint256[5]", "uint256"],
  //       res.logs["1"].data
  //     );
  //     balance1 = await master.balanceOf(accounts[2]);
  //     dispBal1 = await master.balanceOf(accounts[1]);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[1],
  //       gas: 7000000,
  //       data: master.methods.beginDispute(1, res[1], 2).encodeABI(),
  //     });

  //     count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[3],
  //       gas: 7000000,
  //       data: master.methods.vote(1, true).encodeABI(),
  //     });
  //     await helper.advanceTime(86400 * 3);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.tallyVotes(1).encodeABI(),
  //     });
  //     await helper.expectThrow(
  //       web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[0],
  //         gas: 7000000,
  //         data: master.methods.unlockDisputeFee(1).encodeABI(),
  //       })
  //     ); //try to withdraw
  //     dispInfo = await master.getAllDisputeVars(1);
  //     assert(
  //       dispInfo[4] == accounts[2],
  //       "account 2 should be the disputed miner"
  //     );
  //     assert(dispInfo[2] == true, "Dispute Vote passed");
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[6],
  //       gas: 7000000,
  //       data: master.methods.beginDispute(1, res[1], 2).encodeABI(),
  //     });
  //     count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[6],
  //       gas: 7000000,
  //       data: master.methods.vote(2, false).encodeABI(),
  //     });
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[4],
  //       gas: 7000000,
  //       data: master.methods.vote(2, false).encodeABI(),
  //     });
  //     await helper.advanceTime(86400 * 5);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.tallyVotes(2).encodeABI(),
  //     });
  //     dispInfo = await master.getAllDisputeVars(2);
  //     assert(dispInfo[2] == false, "Dispute Vote failed");
  //     await helper.advanceTime(86400 * 2);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.unlockDisputeFee(1).encodeABI(),
  //     });
  //     dispInfo = await master.getAllDisputeVars(1);
  //     assert(dispInfo[2] == true, "Dispute Vote passed");
  //     dispInfo2 = await master.getAllDisputeVars(2);
  //     balance2 = await master.balanceOf(accounts[2]);
  //     dispBal2 = await master.balanceOf(accounts[1]);
  //     assert(
  //       web3.utils.fromWei(balance2) - web3.utils.fromWei(balance1) ==
  //         web3.utils.fromWei(dispInfo[7][8]) * 1 +
  //           web3.utils.fromWei(dispInfo2[7][8]) * 1,
  //       "reported miner's balance should change correctly"
  //     );
  //     assert(
  //       web3.utils.fromWei(dispBal1) - web3.utils.fromWei(dispBal2) ==
  //         web3.utils.fromWei(dispInfo[7][8]) * 1,
  //       "disputing party's balance should change correctly"
  //     );
  //   });
  //   it("Test multiple dispute rounds - failing, then passing", async function() {
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods
  //         .theLazyCoon(accounts[6], web3.utils.toWei("4000", "ether"))
  //         .encodeABI(),
  //     });

  //     for (var i = 0; i < 5; i++) {
  //       res = await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods
  //           .testSubmitMiningSolution(
  //             "nonce",
  //             [1, 2, 3, 4, 5],
  //             [1200, 1300, 1400, 1500, 1600]
  //           )
  //           .encodeABI(),
  //       });
  //     }
  //     res = web3.eth.abi.decodeParameters(
  //       ["uint256[5]", "uint256", "uint256[5]", "uint256"],
  //       res.logs["1"].data
  //     );
  //     balance1 = await master.balanceOf(accounts[2]);
  //     dispBal1 = await master.balanceOf(accounts[1]);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[1],
  //       gas: 7000000,
  //       data: master.methods.beginDispute(1, res[1], 2).encodeABI(),
  //     });
  //     count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
  //     //vote 1 fails
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[3],
  //       gas: 7000000,
  //       data: master.methods.vote(1, false).encodeABI(),
  //     });
  //     await helper.advanceTime(86400 * 3);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.tallyVotes(1).encodeABI(),
  //     });
  //     await helper.expectThrow(
  //       web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[0],
  //         gas: 7000000,
  //         data: master.methods.unlockDisputeFee(1).encodeABI(),
  //       })
  //     ); //try to withdraw
  //     dispInfo = await master.getAllDisputeVars(1);
  //     assert(
  //       dispInfo[4] == accounts[2],
  //       "account 2 should be the disputed miner"
  //     );
  //     assert(dispInfo[2] == false, "Dispute Vote failed");
  //     //vote 2 - passes
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[6],
  //       gas: 7000000,
  //       data: master.methods.beginDispute(1, res[1], 2).encodeABI(),
  //     });
  //     count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[6],
  //       gas: 7000000,
  //       data: master.methods.vote(2, true).encodeABI(),
  //     });
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[4],
  //       gas: 7000000,
  //       data: master.methods.vote(2, true).encodeABI(),
  //     });
  //     await helper.advanceTime(86400 * 5);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.tallyVotes(2).encodeABI(),
  //     });
  //     dispInfo = await master.getAllDisputeVars(2);
  //     assert(dispInfo[2] == true, "Dispute Vote passed");
  //     await helper.advanceTime(86400 * 2);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.unlockDisputeFee(1).encodeABI(),
  //     });
  //     balance2 = await master.balanceOf(accounts[2]);
  //     dispBal2 = await master.balanceOf(accounts[1]);
  //     assert(
  //       balance1 - balance2 ==
  //         (await master.getUintVar(web3.utils.keccak256("stakeAmount"))),
  //       "reported miner's balance should change correctly"
  //     );
  //     assert(
  //       web3.utils.fromWei(dispBal2) - web3.utils.fromWei(dispBal1) == 1000,
  //       "disputing party's balance should change correctly"
  //     );
  //     assert(
  //       web3.utils.fromWei(balance1) - web3.utils.fromWei(balance2) == 1000,
  //       "Account 2 balance should be correct"
  //     );
  //   });
  //   it("Test allow tip of current mined ID", async function() {
  //     vars = await master.methods.getNewCurrentVariables().call();
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.addTip(1, 10000).encodeABI(),
  //     });
  //     vars2 = await master.methods.getNewCurrentVariables().call();
  //     assert(vars2[3] - 10000 == vars[3], "tip should be big");
  //   });
  //   it("Test removal of request data", async function() {
  //     await helper.expectThrow(
  //       web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[0],
  //         gas: 7000000,
  //         data: oldTellorinst.methods
  //           .requestData("api", "x", 1000, 0)
  //           .encodeABI(),
  //       })
  //     );
  //   });
  //   it("Test token fee burning", async function() {
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods
  //         .theLazyCoon(accounts[1], web3.utils.toWei("2000", "ether"))
  //         .encodeABI(),
  //     });
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[1],
  //       gas: 7000000,
  //       data: master.methods
  //         .addTip(1, web3.utils.toWei("1000", "ether"))
  //         .encodeABI(),
  //     });
  //     vars = await master.methods.getNewCurrentVariables().call();
  //     assert(vars[3] >= web3.utils.toWei("1000", "ether"), "tip should be big");
  //     balances = [];
  //     for (var i = 0; i < 6; i++) {
  //       balances[i] = await master.balanceOf(accounts[i]);
  //     }
  //     initTotalSupply = await master.totalSupply();
  //     for (var i = 0; i < 5; i++) {
  //       await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods
  //           .testSubmitMiningSolution(
  //             "nonce",
  //             [1, 2, 3, 4, 5],
  //             [1200, 1300, 1400, 1500, 1600]
  //           )
  //           .encodeABI(),
  //       });
  //     }
  //     new_balances = [];
  //     for (var i = 0; i < 6; i++) {
  //       new_balances[i] = await master.balanceOf(accounts[i]);
  //     }
  //     changes = [];
  //     for (var i = 0; i < 6; i++) {
  //       changes[i] = new_balances[i] - balances[i];
  //     }
  //     newTotalSupply = await master.totalSupply();
  //     assert(changes[0] <= web3.utils.toWei("103.75", "ether"));
  //     assert(changes[1] <= web3.utils.toWei("102.5", "ether"));
  //     assert(changes[2] <= web3.utils.toWei("102.5", "ether"));
  //     assert(changes[3] <= web3.utils.toWei("102.5", "ether"));
  //     assert(changes[4] <= web3.utils.toWei("102.5", "ether"));
  //     assert(
  //       initTotalSupply - newTotalSupply > web3.utils.toWei("480", "ether"),
  //       "total supply should drop significatntly"
  //     );
  //   });

  //   it("Test automatic pulling of top ID's (the last ones)", async function() {
  //     let vars = await master.methods.getNewCurrentVariables().call();
  //     for (var i = 0; i < 5; i++) {
  //       await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods
  //           .testSubmitMiningSolution("nonce", vars["1"], [
  //             1200,
  //             1300,
  //             1400,
  //             1500,
  //             1600,
  //           ])
  //           .encodeABI(),
  //       });
  //     }
  //     vars = await master.methods.getNewCurrentVariables().call();
  //     for (var i = 0; i < 5; i++) {
  //       assert(vars[1][i] == 5 - i);
  //     }
  //   });
  //   it("Test add tip on very far out API id (or on a tblock id?)", async function() {
  //     await helper.expectThrow(
  //       web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[0],
  //         gas: 7000000,
  //         data: master.methods.addTip(web3.utils.toWei("1"), 1).encodeABI(),
  //       })
  //     );
  //     await helper.expectThrow(
  //       web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[0],
  //         gas: 7000000,
  //         data: master.methods.addTip(66, 2000).encodeABI(),
  //       })
  //     );
  //     assert(
  //       (await master.getUintVar(web3.utils.keccak256("requestCount"))) == 52
  //     );
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.addTip(53, 2000).encodeABI(),
  //     });
  //     assert(
  //       (await master.getUintVar(web3.utils.keccak256("requestCount"))) == 53
  //     );
  //     let vars = await master.methods.getNewCurrentVariables().call();
  //     await helper.advanceTime(60 * 60 * 16);
  //     for (var i = 0; i < 5; i++) {
  //       await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods
  //           .testSubmitMiningSolution("nonce", vars["1"], [
  //             1200,
  //             1300,
  //             1400,
  //             1500,
  //             1600,
  //           ])
  //           .encodeABI(),
  //       });
  //     }
  //     console.log("Here");
  //     await helper.advanceTime(60 * 60 * 16);
  //     vars = await master.methods.getNewCurrentVariables().call();
  //     for (var i = 0; i < 5; i++) {
  //       await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods
  //           .testSubmitMiningSolution("nonce", vars["1"], [
  //             1200,
  //             1300,
  //             1400,
  //             1500,
  //             1600,
  //           ])
  //           .encodeABI(),
  //       });
  //     }
  //     vars = await master.getLastNewValue();
  //     assert(vars[0] > 0);
  //   });
  //   it("Test Proper zeroing of Payout Test", async function() {
  //     vars = await master.methods.getNewCurrentVariables().call();
  //     for (var i = 0; i < 5; i++) {
  //       await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods
  //           .testSubmitMiningSolution("nonce", vars["1"], [
  //             1200,
  //             1300,
  //             1400,
  //             1500,
  //             1600,
  //           ])
  //           .encodeABI(),
  //       });
  //     }
  //     vars = await master.getRequestVars(vars["1"][0]);
  //     assert(vars["5"] == 0, "api payout should be zero");
  //     vars = await master.getUintVar(web3.utils.keccak256("currentTotalTips"));
  //     assert(vars == 0, "api payout should be zero");
  //   });
  //   it("Test multiple dispute rounds, assure increasing per dispute round", async function() {
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods
  //         .theLazyCoon(accounts[1], web3.utils.toWei("500", "ether"))
  //         .encodeABI(),
  //     });
  //     for (var i = 0; i < 5; i++) {
  //       res = await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods
  //           .testSubmitMiningSolution(
  //             "nonce",
  //             [1, 2, 3, 4, 5],
  //             [1200, 1300, 1400, 1500, 1600]
  //           )
  //           .encodeABI(),
  //       });
  //     }
  //     res = web3.eth.abi.decodeParameters(
  //       ["uint256[5]", "uint256", "uint256[5]", "uint256"],
  //       res.logs["1"].data
  //     );
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods
  //         .theLazyCoon(accounts[1], web3.utils.toWei("5000", "ether"))
  //         .encodeABI(),
  //     });
  //     balance1 = await master.balanceOf(accounts[2]);
  //     dispBal1 = await master.balanceOf(accounts[1]);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[1],
  //       gas: 7000000,
  //       data: master.methods.beginDispute(1, res[1], 2).encodeABI(),
  //     });
  //     count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
  //     //vote 1 passes
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[3],
  //       gas: 7000000,
  //       data: master.methods.vote(1, true).encodeABI(),
  //     });
  //     await helper.advanceTime(86400 * 3);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.tallyVotes(1).encodeABI(),
  //     });
  //     await helper.expectThrow(
  //       web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[0],
  //         gas: 7000000,
  //         data: master.methods.unlockDisputeFee(1).encodeABI(),
  //       })
  //     ); //try to withdraw
  //     dispInfo = await master.getAllDisputeVars(1);
  //     assert(
  //       dispInfo[4] == accounts[2],
  //       "account 2 should be the disputed miner"
  //     );
  //     assert(dispInfo[2] == true, "Dispute Vote passed");
  //     assert(web3.utils.fromWei(dispInfo[7][8]) == 1000, "fee should be correct");
  //     //vote 2 - fails
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods
  //         .theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"))
  //         .encodeABI(),
  //     });
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[6],
  //       gas: 7000000,
  //       data: master.methods.beginDispute(1, res[1], 2).encodeABI(),
  //     });
  //     count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[6],
  //       gas: 7000000,
  //       data: master.methods.vote(2, true).encodeABI(),
  //     });
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[4],
  //       gas: 7000000,
  //       data: master.methods.vote(2, true).encodeABI(),
  //     });
  //     await helper.advanceTime(86400 * 5);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.tallyVotes(2).encodeABI(),
  //     });
  //     dispInfo = await master.getAllDisputeVars(2);
  //     assert(dispInfo[2] == true, "Dispute Vote passes again");
  //     assert(web3.utils.fromWei(dispInfo[7][8]) == 2000, "fee should be correct");
  //     await helper.advanceTime(86400 * 2);
  //     dispInfo = await master.getAllDisputeVars(1);
  //     assert(dispInfo[2] == true, "Dispute Vote passed");
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 9000000,
  //       data: master.methods.unlockDisputeFee(1).encodeABI(),
  //     });
  //     dispInfo = await master.getAllDisputeVars(1);
  //     assert(dispInfo[2] == true, "Dispute Vote passed");
  //     balance2 = await master.balanceOf(accounts[2]);
  //     dispBal2 = await master.balanceOf(accounts[1]);
  //     assert(
  //       balance1 - balance2 == web3.utils.toWei("1000"),
  //       "reported miner's balance should change correctly"
  //     );
  //     assert(
  //       dispBal2 - dispBal1 == web3.utils.toWei("1000"),
  //       "disputing party's balance should change correctly"
  //     );
  //   });
  //   it("Test multiple dispute rounds, assure increasing per dispute round (nonZero)", async function() {
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods
  //         .theLazyCoon(accounts[1], web3.utils.toWei("500", "ether"))
  //         .encodeABI(),
  //     });
  //     for (var i = 0; i < 5; i++) {
  //       res = await web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[i],
  //         gas: 7000000,
  //         data: master.methods
  //           .testSubmitMiningSolution(
  //             "nonce",
  //             [1, 2, 3, 4, 5],
  //             [1200, 1300, 1400, 1500, 1600]
  //           )
  //           .encodeABI(),
  //       });
  //     }
  //     res = web3.eth.abi.decodeParameters(
  //       ["uint256[5]", "uint256", "uint256[5]", "uint256"],
  //       res.logs["1"].data
  //     );
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods
  //         .theLazyCoon(accounts[1], web3.utils.toWei("5000", "ether"))
  //         .encodeABI(),
  //     });
  //     balance1 = await master.balanceOf(accounts[3]);
  //     dispBal1 = await master.balanceOf(accounts[1]);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[1],
  //       gas: 7000000,
  //       data: master.methods.beginDispute(1, res[1], 3).encodeABI(),
  //     });
  //     count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
  //     //vote 1 passes
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[2],
  //       gas: 7000000,
  //       data: master.methods.vote(1, true).encodeABI(),
  //     });
  //     await helper.advanceTime(86400 * 3);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.tallyVotes(1).encodeABI(),
  //     });
  //     await helper.expectThrow(
  //       web3.eth.sendTransaction({
  //         to: master.address,
  //         from: accounts[0],
  //         gas: 7000000,
  //         data: master.methods.unlockDisputeFee(1).encodeABI(),
  //       })
  //     ); //try to withdraw
  //     dispInfo = await master.getAllDisputeVars(1);
  //     assert(
  //       dispInfo[4] == accounts[3],
  //       "account 2 should be the disputed miner"
  //     );
  //     assert(dispInfo[2] == true, "Dispute Vote passed");
  //     assert(web3.utils.fromWei(dispInfo[7][8]) == 970, "fee should be correct");
  //     //vote 2 - fails
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods
  //         .theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"))
  //         .encodeABI(),
  //     });
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[6],
  //       gas: 7000000,
  //       data: master.methods.beginDispute(1, res[1], 3).encodeABI(),
  //     });
  //     count = await master.getUintVar(web3.utils.keccak256("disputeCount"));
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[6],
  //       gas: 7000000,
  //       data: master.methods.vote(2, true).encodeABI(),
  //     });
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[4],
  //       gas: 7000000,
  //       data: master.methods.vote(2, true).encodeABI(),
  //     });
  //     await helper.advanceTime(86400 * 5);
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 7000000,
  //       data: master.methods.tallyVotes(2).encodeABI(),
  //     });
  //     dispInfo = await master.getAllDisputeVars(2);
  //     assert(dispInfo[2] == true, "Dispute Vote passes again");
  //     assert(
  //       web3.utils.fromWei(dispInfo[7][8]) == 970 * 2,
  //       "fee should be correct"
  //     );
  //     await helper.advanceTime(86400 * 2);
  //     dispInfo = await master.getAllDisputeVars(1);
  //     assert(dispInfo[2] == true, "Dispute Vote passed");
  //     await web3.eth.sendTransaction({
  //       to: master.address,
  //       from: accounts[0],
  //       gas: 9000000,
  //       data: master.methods.unlockDisputeFee(1).encodeABI(),
  //     });
  //     dispInfo = await master.getAllDisputeVars(1);
  //     assert(dispInfo[2] == true, "Dispute Vote passed");
  //     balance2 = await master.balanceOf(accounts[3]);
  //     dispBal2 = await master.balanceOf(accounts[1]);
  //     assert(
  //       balance1 - balance2 == web3.utils.toWei("1000"),
  //       "reported miner's balance should change correctly"
  //     );
  //     assert(
  //       dispBal2 - dispBal1 == web3.utils.toWei("1000"),
  //       "disputing party's balance should change correctly"
  //     );
  //   });
});
