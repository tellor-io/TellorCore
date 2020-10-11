// const helper = require("./helpers/test_helpers");
// const TestLib = require("./helpers/testLib");
// const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
// const TransitionContract = artifacts.require("./TellorTransition");

// const hash = web3.utils.keccak256;
// const BN = web3.utils.BN;

// contract("Basic transition tests", function(accounts) {
//   let master;
//   let env;
//   //Hardcoded adress because they need to be known when the TransitionCOntract is compiled
//   const baseAdd = "0x6511D2957aa09350494f892Ce2881851f0bb26D3";
//   const newAdd = "0x032Aa32e4069318b15e6462CE20926d4d821De90";

//   beforeEach("Setup contract for each test", async function() {
//     master = await TestLib.getV2(accounts, true);
//     env = {
//       master: master,
//       accounts: accounts,
//     };
//   });

//   it("Should transition correctly at the beginning of a block", async () => {
//     let newTellor = await Tellor.new({ from: accounts[9] });
//     transitionContract = await TransitionContract.new();
//     newTellor = await Tellor.at(newAdd);

//     vars = await master.getNewCurrentVariables();
//     await master.changeTellorContract(transitionContract.address);

//     await helper.advanceTime(60 * 16);
//     await TestLib.mineBlock(env, accounts);

//     let stakeAmount = await master.getUintVar(hash("stakeAmount"));
//     let add2 = await master.getAddressVars(hash("tellorContract"));
//     assert(
//       stakeAmount.eq(new BN(web3.utils.toWei("500", "ether"))),
//       "contract should set stake amount transition properly"
//     );
//     assert(add2 == newTellor.address, "contract should transition properly");
//   });

//   it("Should transition correctly mid block", async () => {
//     let newTellor = await Tellor.new({ from: accounts[9] });
//     let transitionContract = await TransitionContract.new();

//     newTellor = await Tellor.at(newAdd);
//     transitionContract = await TransitionContract.new();

//     vars = await master.getNewCurrentVariables();
//     await helper.advanceTime(60 * 16);
//     //Mine First Block
//     await master.submitMiningSolution(
//       "nonce",
//       vars["1"],
//       [1200, 1300, 1400, 1500, 1600],
//       { from: accounts[0] }
//     );

//     //Change contract
//     await master.changeTellorContract(transitionContract.address);
//     let add = await master.getAddressVars(hash("tellorContract"));
//     assert(
//       add == transitionContract.address,
//       "contract should transition properly"
//     );

//     //Those Should do through old address
//     for (var i = 1; i < 5; i++) {
//       await master.submitMiningSolution(
//         "nonce",
//         vars["1"],
//         [1200, 1300, 1400, 1500, 1600],
//         { from: accounts[i] }
//       );
//     }
//     await helper.advanceTime(60 * 16);
//     //This should go to newAdd
//     await TestLib.mineBlock(env);
//     let stakeAmount = await master.getUintVar(hash("stakeAmount"));
//     let add2 = await master.getAddressVars(hash("tellorContract"));
//     assert(
//       stakeAmount.eq(new BN(web3.utils.toWei("500", "ether"))),
//       "contract should set stake amount transition properly"
//     );
//     assert(add2 == newTellor.address, "contract should transition properly");
//   });
// });

// contract("Execution during transition time", function(accounts) {
//   let master;
//   let env;
//   //Hardcoded adress because they need to be known when the TransitionCOntract is compiled
//   const baseAdd = "0x6511D2957aa09350494f892Ce2881851f0bb26D3";
//   const newAdd = "0x032Aa32e4069318b15e6462CE20926d4d821De90";

//   beforeEach("Setup contract for each test", async function() {
//     master = await TestLib.getV2(accounts, true);
//     env = {
//       master: master,
//       accounts: accounts,
//     };
//     let newTellor = await Tellor.new({ from: accounts[9] });
//     transitionContract = await TransitionContract.new();
//     newTellor = await Tellor.at(newAdd);

//     vars = await master.getNewCurrentVariables();
//     await master.changeTellorContract(transitionContract.address);

//     await helper.advanceTime(60 * 16);
//     await TestLib.mineBlock(env, accounts);
//   });

//   describe("Token  Functions", async () => {
//     it("Get Symbol and decimals", async function() {
//       let symbol = await master.symbol();
//       assert.equal(symbol, "TRB", "the Symbol should be TT");
//       let data = await master.decimals();
//       assert(data.toString() == "18");
//     });
//     it("Get name", async function() {
//       let name = await master.name();
//       assert.equal(
//         name,
//         "Tellor Tributes",
//         "the Name should be Tellor Tributes"
//       );
//     });

//     it("Token transfer", async function() {
//       let am = new BN(web3.utils.toWei("5", "ether"));
//       let balance2 = await master.balanceOf(accounts[2]);
//       let balance5 = await master.balanceOf(accounts[5]);
//       await master.transfer(accounts[5], am, { from: accounts[2] });
//       let balance2a = await master.balanceOf(accounts[2]);
//       let balance5a = await master.balanceOf(accounts[5]);

//       assert(balance2.sub(am).eq(balance2a), "Should have transfered balance");
//       assert(balance5.add(am).eq(balance5a), "Should have received amount");
//     });
//     it("Approve and transferFrom", async function() {
//       let am = new BN(web3.utils.toWei("7", "ether"));
//       await master.approve(accounts[1], am, { from: accounts[2] });

//       let balance2 = await master.balanceOf(accounts[2]);
//       let balance5 = await master.balanceOf(accounts[5]);
//       let balance1 = await master.balanceOf(accounts[1]);

//       await master.transferFrom(accounts[2], accounts[5], am, {
//         from: accounts[1],
//       });

//       let balance2a = await master.balanceOf(accounts[2]);
//       let balance5a = await master.balanceOf(accounts[5]);
//       let balance1a = await master.balanceOf(accounts[1]);

//       assert(balance2.sub(am).eq(balance2a), "Should have transfered balance");
//       assert(balance5.add(am).eq(balance5a), "Should have received amount");
//       assert(balance1.eq(balance1a), "Shouldn't have balance altered");
//     });
//   });
// });
