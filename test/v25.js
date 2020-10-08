// const helper = require("./helpers/test_helpers");
// const TestLib = require("./helpers/testLib");
// const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
// const TransitionContract = artifacts.require("./TellorTransition");

// const hash = web3.utils.keccak256;
// const BN = web3.utils.BN;

// contract("Tests for V2.5", function(accounts) {
//   let master;
//   let env;
//   //Hardcoded adress because they need to be known when the TransitionCOntract is compiled
//   const baseAdd = "0x6511D2957aa09350494f892Ce2881851f0bb26D3";
//   const newAdd = "0x032Aa32e4069318b15e6462CE20926d4d821De90";
//   const oldStake = new BN(web3.utils.toWei("1000", "ether"));
//   const newStake = new BN(web3.utils.toWei("500", "ether"));

//   const upgrade = async () => {
//     let newTellor = await Tellor.new({ from: accounts[9] });
//     transitionContract = await TransitionContract.new();
//     // newTellor = await Tellor.at(newAdd);

//     vars = await master.getNewCurrentVariables();
//     await master.changeTellorContract(transitionContract.address);
//     await helper.advanceTime(60 * 16);
//     await TestLib.mineBlock(env, accounts);
//   };

//   beforeEach("Setup contract for each test", async function() {
//     master = await TestLib.getV2(accounts, true);
//     env = {
//       master: master,
//       accounts: accounts,
//     };
//   });

//   describe("Staking and Withdrawing", async () => {
//     it("Stake amount changes correctly", async () => {
//       await upgrade();
//       let stakeAmount = await master.getUintVar(hash("stakeAmount"));
//       assert(
//         stakeAmount.eq(newStake),
//         "contract should set stake amount transition properly"
//       );
//     });

//     it("New miner can stake new stake amount", async () => {
//       await upgrade();

//       let staker = accounts[8];
//       let info = await master.getStakerInfo(staker);

//       assert(info["0"].toString() == "0", "Account shouldn't be staked");
//       await master.approve(master.address, newStake, { from: staker });
//       await master.depositStake({ from: staker });

//       let info2 = await master.getStakerInfo(staker);

//       assert(info2["0"].toString() == "1", "Account should be staked");
//     });

//     it("Previous staker can withdraw difference", async () => {
//       let staker = accounts[8];
//       let previousBal = await master.balanceOf(staker);

//       await master.approve(master.address, newStake, { from: staker });
//       await master.depositStake({ from: staker });

//       let info = await master.getStakerInfo(staker);
//       assert(info["0"].toString() == "1", "Account should be staked");

//       await upgrade();

//       let info2 = await master.getStakerInfo(staker);
//       assert(info2["0"].toString() == "1", "Account should be staked");

//       await master.transfer(accounts[0], previousBal.sub(newStake), {
//         from: staker,
//       });

//       let newBalance = await master.balanceOf(staker);
//       assert(newBalance.eq(newStake), "Staker should have only the stake left");
//     });
//   });

//   describe("Handling open disputes during upgrade", async () => {
//     let disputeId;
//     let requestId = 1;
//     let disputer = accounts[5];
//     let disputed;

//     beforeEach(async () => {
//       await helper.advanceTime(60 * 16);
//       await TestLib.mineBlock(env);

//       let count = await master.getNewValueCountbyRequestId(requestId);
//       let timestamp = await master.getTimestampbyRequestIDandIndex(
//         requestId,
//         count.toNumber() - 1
//       );
//       await master.beginDispute(requestId, timestamp, 2, { from: disputer });
//       disputeId = await master.getUintVar(hash("disputeCount"));
//       let disp = await master.getAllDisputeVars(disputeId);
//       disputed = disp["4"];
//     });

//     it("Dispute fee is upgraded", async () => {
//       await upgrade();
//       let disputeFee = await master.getUintVar(hash("disputeFee"));
//       assert(disputeFee.eq(newStake));
//     });

//     it("Disputed miner can withdraw unslashed stake", async () => {
//       let initBal = await master.balanceOf(disputed);

//       await master.vote(1, true, { from: accounts[3] });
//       await helper.advanceTime(86400 * 22);
//       await master.tallyVotes(1);
//       await helper.advanceTime(60 * 60 * 25);
//       await upgrade();

//       await master.unlockDisputeFee(disputeId, { from: disputer });

//       let info = await master.getStakerInfo(disputed);
//       assert(info["0"].toString() == "0", "Disputed miner shouldn't be staked");
//       assert(
//         await master.allowedToTrade(disputed, initBal.sub(newStake)),
//         "Miner should be able to trade remaining amount"
//       );
//     });

//     it("Diputer only receive half of slashed stake", async () => {
//       let fee = await master.getDisputeUintVars(1, hash("fee"));
//       await master.vote(1, true, { from: accounts[3] });
//       await helper.advanceTime(86400 * 22);
//       await master.tallyVotes(1);
//       await helper.advanceTime(60 * 60 * 25);
//       await upgrade();

//       let initBal = await master.balanceOf(disputer);
//       await master.unlockDisputeFee(disputeId, { from: disputer });

//       let endBalance = await master.balanceOf(disputer);
//       assert(
//         initBal
//           .add(newStake)
//           .add(fee)
//           .eq(endBalance),
//         "Miner should be able to trade remaining amount"
//       );
//     });
//   });
// });
