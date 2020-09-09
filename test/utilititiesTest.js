const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws://localhost:8545")
);
const TellorMaster = artifacts.require("./TellorMaster.sol");
var OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
var UtilitiesTests = artifacts.require("./UtilitiesTests.sol");

contract("Utilities Tests", function(accounts) {
  let oracle;
  let oldTellor;
  let utilities;

  beforeEach("Setup contract for each test", async function() {
    oldTellor = await OldTellor.new();
    oracle = await TellorMaster.new(oldTellor.address);
    utilities = await UtilitiesTests.new(oracle.address);
  });
  it("Test possible duplicates on top Requests", async function() {
    console.log("Test Utilitty Function");
    let queue = [];
    for (var i = 0; i < 51; i++) {
      queue.push(1);
    }
    queue[5] = 10;
    let res = await utilities.testgetMax5(queue);
    let values = [];
    let ids = [];

    for (var i = 0; i < 5; i++) {
      values.push(res["0"][i].toNumber());
      ids.push(res["1"][i].toNumber());
      if (i != 0) {
        assert.isTrue(values[i] >= values[i - 1]);
      }
    }

    // console.log("Values", values);
  });
});
