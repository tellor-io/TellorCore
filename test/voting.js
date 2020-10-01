const helper = require("./helpers/test_helpers");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper

var oracleAbi = Tellor.abi;
var masterAbi = TellorMaster.abi;

contract("Voting Tests", function(accounts) {
  let oracle;
  let oracle2;
  let oracleBase;

  beforeEach("Setup contract for each test", async function() {
    oracleBase = await Tellor.new();
    oracle = await TellorMaster.new(oracleBase.address);
    master = await new web3.eth.Contract(masterAbi, oracle.address);
    oracle2 = await new web3.eth.Contract(oracleAbi, oracleBase.address);
  });

  it("Test New Tellor Storage Contract", async function() {
    let oracleBase2 = await Tellor.new();
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods
        .theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"))
        .encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[2],
      gas: 7000000,
      data: oracle2.methods.proposeFork(oracleBase2.address).encodeABI(),
    });
    for (var i = 1; i < 5; i++) {
      await web3.eth.sendTransaction({
        to: oracle.address,
        from: accounts[i],
        gas: 7000000,
        data: oracle2.methods.vote(1, true).encodeABI(),
      });
    }
    await helper.advanceTime(86400 * 8);
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[i],
      gas: 7000000,
      data: oracle2.methods.tallyVotes(1).encodeABI(),
    });
    await helper.advanceTime(86400 * 2);
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods.updateTellor(1).encodeABI(),
    });
    assert(
      (await oracle.getAddressVars(web3.utils.keccak256("tellorContract"))) ==
        oracleBase2.address
    );
  });
  it("Test Failed Vote - New Tellor Storage Contract", async function() {
    let oracleBase2 = await Tellor.new();
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods
        .theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"))
        .encodeABI(),
    });

    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[2],
      gas: 7000000,
      data: oracle2.methods.proposeFork(oracleBase2.address).encodeABI(),
    });
    for (var i = 1; i < 5; i++) {
      await web3.eth.sendTransaction({
        to: oracle.address,
        from: accounts[i],
        gas: 7000000,
        data: oracle2.methods.vote(1, false).encodeABI(),
      });
    }
    await helper.advanceTime(86400 * 8);
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[i],
      gas: 7000000,
      data: oracle2.methods.tallyVotes(1).encodeABI(),
    });
    assert(
      (await oracle.getAddressVars(web3.utils.keccak256("tellorContract"))) ==
        oracleBase.address,
      "vote should have failed"
    );
  });
  it("Test Failed Vote - New Tellor Storage Contract--vote fail by 10% quorum", async function() {
    let oracleBase2 = await Tellor.new();
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[5],
      gas: 7000000,
      data: oracle2.methods
        .theLazyCoon(accounts[4], web3.utils.toWei("2000", "ether"))
        .encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[4],
      gas: 7000000,
      data: oracle2.methods.proposeFork(oracleBase2.address).encodeABI(),
    });
    vars = await oracle.getAllDisputeVars(1);
    await helper.advanceTime(86400 * 8);
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods.tallyVotes(1).encodeABI(),
    });
    assert(
      (await oracle.getAddressVars(web3.utils.keccak256("tellorContract"))) ==
        oracleBase.address,
      "vote should have failed"
    );
  });
  it("Test Failed Vote - New Tellor Storage Contract--vote fail to fail because 10% diff in quorum is not reached", async function() {
    let oracleBase2 = await Tellor.new();
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[5],
      gas: 7000000,
      data: oracle2.methods
        .theLazyCoon(accounts[4], web3.utils.toWei("4000", "ether"))
        .encodeABI(),
    });
    initTotalSupply = await oracle.totalSupply();
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[4],
      gas: 7000000,
      data: oracle2.methods.proposeFork(oracleBase2.address).encodeABI(),
    });
    vars = await oracle.getAllDisputeVars(1);
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods.vote(1, false).encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[5],
      gas: 7000000,
      data: oracle2.methods.vote(1, false).encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[1],
      gas: 7000000,
      data: oracle2.methods.vote(1, false).encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[2],
      gas: 7000000,
      data: oracle2.methods.vote(1, false).encodeABI(),
    });
    vars = await oracle.getAllDisputeVars(1);
    newTotalSupply = await oracle.totalSupply();
    it = await web3.utils.fromWei(initTotalSupply, "ether");
    ts = await web3.utils.fromWei(newTotalSupply, "ether");
    await helper.advanceTime(86400 * 8);
    assert(
      (await oracle.getAddressVars(web3.utils.keccak256("tellorContract"))) ==
        oracleBase.address,
      "vote should have failed"
    );
  });

  it("Test Vote - New Tellor Storage Contract--vote passed by 10% quorum", async function() {
    let oracleBase2 = await Tellor.new();
    //print some TRB tokens
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[5],
      gas: 7000000,
      data: oracle2.methods
        .theLazyCoon(accounts[4], web3.utils.toWei("4000", "ether"))
        .encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[4],
      gas: 7000000,
      data: oracle2.methods.proposeFork(oracleBase2.address).encodeABI(),
    });
    //get the initial dispute variables--should be zeros
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods.vote(1, false).encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[1],
      gas: 7000000,
      data: oracle2.methods.vote(1, true).encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[3],
      gas: 7000000,
      data: oracle2.methods.vote(1, true).encodeABI(),
    });
    await helper.advanceTime(86400 * 8);
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods.tallyVotes(1).encodeABI(),
    });
    await helper.advanceTime(86400 * 2);
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods.updateTellor(1).encodeABI(),
    });
    assert(
      (await oracle.getAddressVars(web3.utils.keccak256("tellorContract"))) ==
        oracleBase2.address,
      "vote should have passed"
    );
  });
});
