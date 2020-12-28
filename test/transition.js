const helper = require("./helpers/test_helpers");
const TestLib = require("./helpers/testLib");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
const TransitionContract = artifacts.require("./TellorTransition");

const hash = web3.utils.keccak256;
const BN = web3.utils.BN;

contract("Basic transition tests", function(accounts) {
  let master;
  let env;
  //Hardcoded address because they need to be known when the TransitionCOntract is compiled
  const newAdd = "0x41c4e9D14712560A6707C365dB1c3251E5eD7f78";

  before("Setting up environment", async () => {
    try {
      await TestLib.prepare();
    } catch (error) {
      if (!error.message.includes("has already been linked")) {
        throw error;
      }
    }
  });

  beforeEach("Setup contract for each test", async function() {
    master = await TestLib.getV25(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });

  it("Should transition correctly at the beginning of a block", async () => {
    let newTellor = await TestLib.getNewTellor(env);
    transitionContract = await TestLib.getNewTransition(env);
    newTellor = await Tellor.at(newAdd);

    vars = await master.getNewCurrentVariables();
    await master.changeTellorContract(transitionContract.address);

    await helper.advanceTime(60 * 16);
    await TestLib.mineBlock(env, accounts);

    let timeTarget = await master.getUintVar(hash("timeTarget"));
    let add2 = await master.getAddressVars(hash("tellorContract"));
    assert(
      timeTarget.eq(new BN("240")),
      "contract should set time target properly"
    );
    assert(add2 == newTellor.address, "contract should transition properly");
  });

  it("Should transition correctly mid block", async () => {
    let newTellor = await TestLib.getNewTellor(env);
    transitionContract = await TestLib.getNewTransition(env);

    newTellor = await Tellor.at(newAdd);
    transitionContract = await TransitionContract.new();

    vars = await master.getNewCurrentVariables();
    await helper.advanceTime(60 * 16);
    //Mine First Block
    await master.submitMiningSolution(
      "nonce",
      vars["1"],
      [1200, 1300, 1400, 1500, 1600],
      { from: accounts[0] }
    );

    //Change contract
    await master.changeTellorContract(transitionContract.address);
    let add = await master.getAddressVars(hash("tellorContract"));
    assert(
      add == transitionContract.address,
      "contract should transition properly"
    );

    //Those Should do through old address
    for (var i = 1; i < 5; i++) {
      await master.submitMiningSolution(
        "nonce",
        vars["1"],
        [1200, 1300, 1400, 1500, 1600],
        { from: accounts[i] }
      );
    }
    await helper.advanceTime(60 * 16);
    //This should go to newAdd
    await TestLib.mineBlock(env);
    let timeTarget = await master.getUintVar(hash("timeTarget"));
    let add2 = await master.getAddressVars(hash("tellorContract"));
    assert(
      timeTarget.eq(new BN("240")),
      "contract should set time target properly"
    );
    assert(add2 == newTellor.address, "contract should transition properly");
  });
});
