const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");

contract("DidMine test", function(accounts) {
  let master;
  let env;

  before("Setting up enviroment", async () => {
    try {
      await TestLib.prepare();
    } catch (error) {
      if (!error.message.includes("has already been linked")) {
        throw error;
      }
    }
  });

  beforeEach("Setup contract for each test", async function() {
    //Could use the getV25(accounts, true), since you're upgrading in the first line of tests. I added full tips to getV25 in testLib already
    master = await TestLib.getEnv(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
  });

  it("Test didMine ", async function() {
    await helper.advanceTime(60 * 16);

    //TestLib.mineBlock(env) already fetches the currentVariables. Fetching here to use in the verification
    let v = await master.getNewCurrentVariables();
    await TestLib.mineBlock(env);
    //Could use the short version
    let didMine = await master.didMine(v[0], accounts[2]);
    assert(didMine);
  });
});
