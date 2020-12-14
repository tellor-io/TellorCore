const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var masterAbi = Tellor.abi;
const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");

contract("Voting Tests", function(accounts) {
  let master;
  let env;

  beforeEach("Setup contract for each test", async function() {
    //Could use the getV25(accounts, true), since you're upgrading in the first line of tests. I added full tips to getV25 in testLib already
    master = await TestLib.getV25Empty(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });

  it("Test New Tellor Storage Contract", async function() {
    let oracleBase2 = await Tellor.new();
    await master.theLazyCoon(accounts[2], web3.utils.toWei("5000", "ether"))
    await master.proposeFork(oracleBase2.address,{from:accounts[2]})
    for (var i = 1; i < 5; i++) {
      await master.vote(1, true,{from:accounts[i]})
    }
    await helper.advanceTime(86400 * 8);
    await master.tallyVotes(1,{from:accounts[5]})
    await helper.advanceTime(86400 * 2);
    await master.updateTellor(1)
    assert(
      (await master.getAddressVars(web3.utils.keccak256("tellorContract"))) ==
        oracleBase2.address
    );
  });
  it("Test Failed Vote - New Tellor Storage Contract", async function() {
    await TestLib.mineBlock(env);
    let oracleBase2 = await Tellor.new();
    let oracleBase = await master.getAddressVars(web3.utils.keccak256("tellorContract"));
    await master.theLazyCoon(accounts[6], web3.utils.toWei("1000000", "ether"))
    await  master.proposeFork(oracleBase2.address,{from:accounts[2]})
    for (var i = 1; i < 5; i++) {
      await master.vote(1, false,{from:accounts[i]})
    }
    await helper.advanceTime(86400 * 8);
    await master.tallyVotes(1,{from:accounts[5]})
    await helper.advanceTime(86400 * 2);
    await helper.expectThrow(master.updateTellor(1))
    var newAddy = await master.getAddressVars(web3.utils.keccak256("tellorContract"))
    assert(newAddy == oracleBase,"vote should have failed");
  });
  it("Test Failed Vote - New Tellor Storage Contract--vote fail to fail because 10% diff in quorum is not reached", async function() {
    await TestLib.mineBlock(env);
    let oracleBase2 = await Tellor.new();
    let oracleBase = await master.getAddressVars(web3.utils.keccak256("tellorContract"));
    await master.theLazyCoon(accounts[1], web3.utils.toWei("100000", "ether"))
    await master.proposeFork(oracleBase2.address,{from:accounts[4]})
    vars = await master.getAllDisputeVars(1);
    await master.vote(1, false)
    vars = await master.getAllDisputeVars(1);
    await helper.advanceTime(86400 * 8);
     await master.tallyVotes(1,{from:accounts[5]})
    await helper.advanceTime(86400 * 2);
    await helper.expectThrow(master.updateTellor(1))
    var newAddy = await master.getAddressVars(web3.utils.keccak256("tellorContract"))
    assert(newAddy == oracleBase,"vote should have failed");
  });

  it("Test Vote - New Tellor Storage Contract--vote passed by 10% quorum", async function() {
    let oracleBase2 = await Tellor.new();
    //print some TRB tokens
    await master.theLazyCoon(accounts[4], web3.utils.toWei("4000", "ether"))
    await master.proposeFork(oracleBase2.address,{from:accounts[4]})
    //get the initial dispute variables--should be zeros
    await master.vote(1, false)
    await master.vote(1, true,{from:accounts[1]})
    await master.vote(1, true,{from:accounts[3]})
    await helper.advanceTime(86400 * 8);
    await master.tallyVotes(1)
    await helper.advanceTime(86400 * 2);
    await master.updateTellor(1)
    assert(
      (await master.getAddressVars(web3.utils.keccak256("tellorContract"))) ==
        oracleBase2.address,
      "vote should have passed"
    );
  });
});
