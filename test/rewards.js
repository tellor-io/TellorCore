
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var masterAbi = Tellor.abi;
const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");

contract("Reward Tests", function(accounts) {
  let master;
  let env;

  beforeEach("Setup contract for each test", async function() {
    //Could use the getV25(accounts, true), since you're upgrading in the first line of tests. I added full tips to getV25 in testLib already
    master = await TestLib.getV25(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });

  it("Inflation is fixed", async function() {
    await helper.advanceTime(60 * 60 * 16)
  	await TestLib.mineBlock(env);
    let rew = await master.getUintVar(web3.utils.keccak256("currentReward"));
    assert.equal(rew.toString(), "1000000000000000000");
  });

  it("Rewards are proportional to time passed", async () => {
    await helper.advanceTime(60 * 60 * 16)  
    await TestLib.mineBlock(env);
    await helper.advanceTime(60 * 5 * 8)
    let balBef = await master.balanceOf(accounts[1]);
    await TestLib.mineBlock(env);
    let balAfter = await master.balanceOf(accounts[1]);
    // console.log(balBef.toString());
    // console.log(balAfter.toString());
    // console.log(balAfter.sub(balBef).toString());
    assert(web3.utils.fromWei(balAfter) - web3.utils.fromWei(balBef) >= 7.9)
    assert(web3.utils.fromWei(balAfter) - web3.utils.fromWei(balBef) <= 8.1)
  });
});
