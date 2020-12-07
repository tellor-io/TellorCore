var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
var masterAbi = Tellor.abi;
const TestLib = require("./helpers/testLib");
const helper = require("./helpers/test_helpers");

contract("Utilities Tests", function(accounts) {
  let oracle;
  let oldTellor;
  let utilities;
  let master;
  let env;

  beforeEach("Setup contract for each test", async function() {
    //Could use the getV25(accounts, true), since you're upgrading in the first line of tests. I added full tips to getV25 in testLib already
    master = await TestLib.getV25Empty(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
    utilities = await UtilitiesTests.new(master.address);
  });
  it("Test possible duplicates on top Requests", async function() {
    const testGetMax = async () => {
      let queue = [0];
      let ref = [0];
      for (var i = 0; i < 50; i++) {
        let x = Math.floor(Math.random() * 998) + 1;
        queue.push(x);
        ref.push(x);
      }
      // console.log(queue);

      let res = await utilities.testgetMax5(queue);
      let values = [];
      let idexes = [];

      let tempsorted = queue.sort((a, b) => a - b);
      let sorted = tempsorted.slice(46);
      for (var i = 0; i < 5; i++) {
        values.push(res["0"][i].toNumber());
        idexes.push(res["1"][i].toNumber());
      }
      let svals = values.sort((a, b) => a - b);
      for (var i = 0; i < 5; i++) {
        assert(svals[i] == sorted[i], "Value supposed to be on the top5");
      }
    };

    for (var k = 0; k < 25; k++) {
      await testGetMax();
    }
  });
});
