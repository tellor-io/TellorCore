const TellorMaster = artifacts.require("./TellorMaster.sol");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper

var oracleAbi = Tellor.abi;
var masterAbi = TellorMaster.abi;

contract("Further Tests", function(accounts) {
  let oracle;
  let oracle2;
  let oracleBase;
  let master;
  let utilities;

  beforeEach("Setup contract for each test", async function() {
    oracleBase = await Tellor.new();
    oracle = await TellorMaster.new(oracleBase.address);
    master = await new web3.eth.Contract(masterAbi, oracle.address);
    oracle2 = await new web3.eth.Contract(oracleAbi, oracleBase.address);
  });

  it("transferOwnership", async function() {
    let checkowner = await oracle.getAddressVars(
      web3.utils.keccak256("_owner")
    );
    assert(checkowner == accounts[0], "initial owner acct 0");
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods.proposeOwnership(accounts[2]).encodeABI(),
    });
    let pendingOwner = await oracle.getAddressVars(
      web3.utils.keccak256("pending_owner")
    );
    assert(pendingOwner == accounts[2], "pending owner acct 2");
    checkowner = await oracle.getAddressVars(web3.utils.keccak256("_owner"));
    assert(checkowner == accounts[0], "initial owner acct 0");
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[2],
      gas: 7000000,
      data: oracle2.methods.claimOwnership().encodeABI(),
    });
    checkowner = await oracle.getAddressVars(web3.utils.keccak256("_owner"));
    assert(checkowner == accounts[2], "new owner acct 2");
  });

  it("Test Deity Functions", async function() {
    let owner = await oracle.getAddressVars(web3.utils.keccak256("_deity"));
    assert(owner == accounts[0]);
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: master.methods.changeDeity(accounts[1]).encodeABI(),
    });
    owner = await oracle.getAddressVars(web3.utils.keccak256("_deity"));
    assert(owner == accounts[1]);
    newOracle = await Tellor.new();
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[1],
      gas: 7000000,
      data: master.methods.changeTellorContract(newOracle.address).encodeABI(),
    });
    assert(
      (await oracle.getAddressVars(web3.utils.keccak256("tellorContract"))) ==
        newOracle.address
    );
  });
  it("Test Changing Dispute Fee", async function() {
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods
        .theLazyCoon(accounts[6], web3.utils.toWei("5000", "ether"))
        .encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: oracle2.methods
        .theLazyCoon(accounts[7], web3.utils.toWei("5000", "ether"))
        .encodeABI(),
    });
    var disputeFee1 = await oracle.getUintVar(
      web3.utils.keccak256("disputeFee")
    );
    newOracle = await Tellor.new();
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[0],
      gas: 7000000,
      data: master.methods.changeTellorContract(newOracle.address).encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[6],
      gas: 7000000,
      data: oracle2.methods.depositStake().encodeABI(),
    });
    await web3.eth.sendTransaction({
      to: oracle.address,
      from: accounts[7],
      gas: 7000000,
      data: oracle2.methods.depositStake().encodeABI(),
    });
    assert(
      (await oracle.getUintVar(web3.utils.keccak256("disputeFee"))) <
        disputeFee1,
      "disputeFee should change"
    );
  });
});
