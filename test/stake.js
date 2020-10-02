// const helper = require("./helpers/test_helpers");
// const TellorMaster = artifacts.require("./TellorMaster.sol");
// const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper

// var oracleAbi = Tellor.abi;
// var masterAbi = TellorMaster.abi;

// contract("Staking tests", function(accounts) {
//   let oracle;
//   let oracle2;
//   let oracleBase;
//   let master;

//   beforeEach("Setup contract for each test", async function() {
//     oracleBase = await Tellor.new();
//     oracle = await TellorMaster.new(oracleBase.address);
//     master = await new web3.eth.Contract(masterAbi, oracle.address);
//     oracle2 = await new web3.eth.Contract(oracleAbi, oracleBase.address);
//   });
//   it("Stake miner", async function() {
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[0],
//       gas: 7000000,
//       data: oracle2.methods
//         .theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"))
//         .encodeABI(),
//     });
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[6],
//       gas: 7000000,
//       data: oracle2.methods.depositStake().encodeABI(),
//     });
//     let s = await oracle.getStakerInfo(accounts[6]);
//     assert(s[0] == 1, "Staked");
//   });

//   it("getStakersCount", async function() {
//     let count = await oracle.getUintVar(web3.utils.keccak256("stakerCount"));
//     assert(web3.utils.hexToNumberString(count) == 6, "count is 6"); //added miner
//   });
//   it("getStakersInfo", async function() {
//     let info = await oracle.getStakerInfo(accounts[1]);
//     let stake = web3.utils.hexToNumberString(info["0"]);
//     let startDate = web3.utils.hexToNumberString(info["1"]);
//     let _date = new Date();
//     let d = (_date - (_date % 86400000)) / 1000;
//     assert(startDate >= d * 1, "startDate is today");
//     assert(stake * 1 == 1, "Should be 1 for staked address");
//   });

//   it("Staking, requestStakingWithdraw, withdraw stake", async function() {
//     let withdrawreq = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 7000000,
//       data: oracle2.methods.requestStakingWithdraw().encodeABI(),
//     });
//     let weSender = await web3.eth.abi.decodeParameter(
//       "address",
//       withdrawreq.logs[0].topics[1]
//     );
//     assert(weSender == accounts[1], "withdraw request by account 1");
//     await helper.advanceTime(86400 * 8);
//     s = await oracle.getStakerInfo(accounts[1]);
//     assert(s != 1, " Staked");
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 7000000,
//       data: oracle2.methods.withdrawStake().encodeABI(),
//     });
//     s = await oracle.getStakerInfo(accounts[1]);
//     assert(s != 1, "not Staked");
//   });
//   it("Attempt to Allow and transferFrom more than balance - stake", async function() {
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[0],
//       gas: 7000000,
//       data: oracle2.methods
//         .theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"))
//         .encodeABI(),
//     });
//     var tokens = web3.utils.toWei("2", "ether");
//     var tokens2 = web3.utils.toWei("3", "ether");
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.transfer(accounts[1], tokens).encodeABI(),
//     });
//     balance1 = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[1]).encodeABI(),
//     });
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 1000000,
//       data: oracle2.methods.approve(accounts[6], tokens2).encodeABI(),
//     });
//     await helper.expectThrow(
//       web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[6],
//         gas: 7000000,
//         data: oracle2.methods
//           .transferFrom(accounts[1], accounts[8], tokens2)
//           .encodeABI(),
//       })
//     );
//     balance1b = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[1]).encodeABI(),
//     });
//     assert(
//       1000 + web3.utils.fromWei(tokens) * 1 == web3.utils.fromWei(balance1) * 1,
//       "Balance for acct 1 should == 1000 + transferred amt "
//     );
//   });
//   it("Attempt to withdraw unnaproved", async function() {
//     balance1b = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[1]).encodeABI(),
//     });
//     await helper.expectThrow(
//       web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[1],
//         gas: 7000000,
//         data: oracle2.methods.withdrawStake().encodeABI(),
//       })
//     );
//     s = await oracle.getStakerInfo(accounts[1]);
//     assert(s[0] == 1, " Staked");
//     assert(
//       web3.utils.fromWei(balance1b) == 1000,
//       "Balance should equal transferred amt"
//     );
//   });
//   it("Attempt to transfer more than balance - stake", async function() {
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[0],
//       gas: 7000000,
//       data: oracle2.methods
//         .theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"))
//         .encodeABI(),
//     });
//     var tokens = web3.utils.toWei("1", "ether");
//     var tokens2 = web3.utils.toWei("2000000", "ether");
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 7000000,
//       data: oracle2.methods.transfer(accounts[1], tokens).encodeABI(),
//     });
//     balance1 = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[1]).encodeABI(),
//     });
//     await helper.expectThrow(
//       web3.eth.sendTransaction({
//         to: oracle.address,
//         from: accounts[1],
//         gas: 7000000,
//         data: oracle2.methods.transfer(accounts[1], tokens2).encodeABI(),
//       })
//     );
//     balance1b = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[1]).encodeABI(),
//     });
//     assert(
//       web3.utils.fromWei(balance1b) == 1001,
//       "Balance should == (1000 + tokens)"
//     );
//   });
//   it("re-Staking without withdraw ", async function() {
//     await helper.advanceTime(86400 * 10);
//     let withdrawreq = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 7000000,
//       data: oracle2.methods.requestStakingWithdraw().encodeABI(),
//     });
//     let weSender = await web3.eth.abi.decodeParameter(
//       "address",
//       withdrawreq.logs[0].topics[1]
//     );
//     assert(weSender == accounts[1], "withdraw request by account 1");
//     await helper.advanceTime(86400 * 10);
//     let s = await oracle.getStakerInfo(accounts[1]);
//     assert(s[0] != 1, "is not Staked");
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 7000000,
//       data: oracle2.methods.depositStake().encodeABI(),
//     });
//     s = await oracle.getStakerInfo(accounts[1]);
//     assert(s[0] == 1, "is not Staked");
//   });
//   it("withdraw and re-stake", async function() {
//     await helper.advanceTime(86400 * 10);
//     let withdrawreq = await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 7000000,
//       data: oracle2.methods.requestStakingWithdraw().encodeABI(),
//     });
//     let weSender = await web3.eth.abi.decodeParameter(
//       "address",
//       withdrawreq.logs[0].topics[1]
//     );
//     assert(weSender == accounts[1], "withdraw request by account 1");
//     await helper.advanceTime(86400 * 10);
//     let s = await oracle.getStakerInfo(accounts[1]);
//     assert(s[0] != 1, "is not Staked");
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 7000000,
//       data: oracle2.methods.withdrawStake().encodeABI(),
//     });
//     s = await oracle.getStakerInfo(accounts[1]);
//     assert(s[0] != 1, " not Staked");
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 7000000,
//       data: oracle2.methods.depositStake().encodeABI(),
//     });
//     s = await oracle.getStakerInfo(accounts[1]);
//     assert(s[0] == 1, " Staked");
//   });
// });
