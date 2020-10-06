// const TellorMaster = artifacts.require("./TellorMaster.sol");
// const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper

// var oracleAbi = Tellor.abi;
// var masterAbi = TellorMaster.abi;


// contract("ERC20 Token Functionality", function(accounts) {
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
//   it("Get Symbol and decimals", async function() {
//     let symbol = await oracle2.methods.symbol().call();
//     assert.equal(symbol, "TRB", "the Symbol should be TT");
//     data3 = await oracle2.methods.decimals().call();
//     assert(data3 - 0 == 18);
//   });
//   it("Get name", async function() {
//     let name = await oracle2.methods.name().call();
//     assert.equal(name, "Tellor Tributes", "the Name should be Tellor Tributes");
//   });

//   it("Total Supply", async function() {
//     supply = await master.methods.totalSupply().call();
//     assert.equal(web3.utils.fromWei(supply), 6000, "Supply should be 6000"); //added miner
//   });

//   it("Token transfer", async function() {
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[0],
//       gas: 7000000,
//       data: oracle2.methods
//         .theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"))
//         .encodeABI(),
//     });
//     balance2 = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[2]).encodeABI(),
//     });
//     t = web3.utils.toWei("5", "ether");
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 700000,
//       data: oracle2.methods.transfer(accounts[5], t).encodeABI(),
//     });
//     balance2a = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[2]).encodeABI(),
//     });
//     balance5 = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[5]).encodeABI(),
//     });
//     assert(
//       web3.utils.fromWei(balance2a, "ether") == 4995,
//       web3.utils.fromWei(balance2a, "ether") + "should be 995"
//     );
//     assert(web3.utils.fromWei(balance5) == 1005, "balance for acct 5 is 1005");
//   });
//   it("Approve and transferFrom", async function() {
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[0],
//       gas: 7000000,
//       data: oracle2.methods
//         .theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"))
//         .encodeABI(),
//     });
//     t = web3.utils.toWei("7", "ether");
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 700000,
//       data: oracle2.methods.approve(accounts[1], t).encodeABI(),
//     });
//     balance0a = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[2]).encodeABI(),
//     });
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 700000,
//       data: oracle2.methods
//         .transferFrom(accounts[2], accounts[5], t)
//         .encodeABI(),
//     });
//     balance5a = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[5]).encodeABI(),
//     });
//     assert(web3.utils.fromWei(balance5a) == 1007, "balance for acct 5 is 1007");
//   });
//   it("Allowance after approve and transferFrom", async function() {
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[0],
//       gas: 7000000,
//       data: oracle2.methods
//         .theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"))
//         .encodeABI(),
//     });
//     t = web3.utils.toWei("7", "ether");
//     t2 = web3.utils.toWei("6", "ether");
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[2],
//       gas: 700000,
//       data: oracle2.methods.approve(accounts[1], t).encodeABI(),
//     });
//     balance0a = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[2]).encodeABI(),
//     });
//     await web3.eth.sendTransaction({
//       to: oracle.address,
//       from: accounts[1],
//       gas: 700000,
//       data: oracle2.methods
//         .transferFrom(accounts[2], accounts[5], t2)
//         .encodeABI(),
//     });
//     balance5a = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.balanceOf(accounts[5]).encodeABI(),
//     });
//     assert.equal(
//       web3.utils.fromWei(balance5a),
//       1006,
//       "balance for acct 5 is 1006"
//     );
//     allow = await web3.eth.call({
//       to: oracle.address,
//       data: master.methods.allowance(accounts[2], accounts[1]).encodeABI(),
//     });
//     assert.equal(
//       web3.utils.fromWei(allow, "ether"),
//       1,
//       "Allowance shoudl be 1 eth"
//     );
//   });
// });
