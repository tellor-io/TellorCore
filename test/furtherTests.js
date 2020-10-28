// const TestLib = require("./helpers/testLib");
// const helper = require("./helpers/test_helpers");
// const Tellor = artifacts.require("./TellorTest.sol");
// contract("Further tests", function(accounts) {
//   let master;
//   let env;

//   beforeEach("Setup contract for each test", async function() {
//     //Could use the getV25(accounts, true), since you're upgrading in the first line of tests. I added full tips to getV25 in testLib already
//     master = await TestLib.getV25(accounts, true);
//     env = {
//       master: master,
//       accounts: accounts,
//     };
//   });

//   it("transferOwnership", async function() {
//     let checkowner = await master.getAddressVars(
//       web3.utils.keccak256("_owner")
//     );
//     assert(checkowner == accounts[0], "initial owner acct 0");
//     await master.proposeOwnership(accounts[2])
//     let pendingOwner = await master.getAddressVars(
//       web3.utils.keccak256("pending_owner")
//     );
//     assert(pendingOwner == accounts[2], "pending owner acct 2");
//     checkowner = await master.getAddressVars(web3.utils.keccak256("_owner"));
//     assert(checkowner == accounts[0], "initial owner acct 0");
//     await master.claimOwnership({from:accounts[2]})
//     checkowner = await master.getAddressVars(web3.utils.keccak256("_owner"));
//     assert(checkowner == accounts[2], "new owner acct 2");
//   });
//   it("Test Deity Functions", async function() {
//     let owner = await master.getAddressVars(web3.utils.keccak256("_deity"));
//     assert(owner == accounts[0]);
//     await master.changeDeity(accounts[1])
//     owner = await master.getAddressVars(web3.utils.keccak256("_deity"));
//     assert(owner == accounts[1]);
//     let newOracle = await Tellor.new();
//     master.changeTellorContract(newOracle.address,{from:accounts[1]})
//     assert(
//       (await master.getAddressVars(web3.utils.keccak256("tellorContract"))) ==
//         newOracle.address
//     );
//   });
//   it("Get Symbol and decimals", async function() {
//     let symbol = await master.symbol()
//     assert.equal(symbol, "TRB", "the Symbol should be TT");
//     data3 = await master.decimals()
//     assert(data3 - 0 == 18);
//   });
//   it("Get name", async function() {
//     let name = await master.name();
//     assert.equal(name, "Tellor Tributes", "the Name should be Tellor Tributes");
//   });

//   it("Total Supply", async function() {
//     supply = await master.totalSupply();
//     assert(web3.utils.fromWei(supply) > 0, "Supply should not be 0"); //added miner
//     assert(web3.utils.fromWei(supply) < 100000, "Supply should be less than 100k"); //added miner
//   });
//   it("Test Changing Dispute Fee", async function() {
//     await  master.theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"))
//     await master.theLazyCoon(accounts[7], web3.utils.toWei("5000", "ether"))
//     var disputeFee1 = await master.getUintVar(
//       web3.utils.keccak256("disputeFee")
//     );
//     newOracle = await Tellor.new();
//     await master.changeTellorContract(newOracle.address)
//     await master.depositStake({from:accounts[6]})
//     await  master.depositStake({from:accounts[7]})
//     assert(
//       (await master.getUintVar(web3.utils.keccak256("disputeFee"))) <
//         disputeFee1,
//       "disputeFee should change"
//     );
//   });
// });
