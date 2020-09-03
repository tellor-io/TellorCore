const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws://localhost:8545")
);

const Tellor = artifacts.require("MockTellor.sol"); // globally injected artifacts helper
const RefTellor = artifacts.require("RefTellor.sol");

contract("Gas Tests", function(accounts) {
  let oracleBase;
  let oracle;
  let oracleRef;
  let master;
  let oldTellor;
  let oldTellorinst;
  let utilities;

  beforeEach("Setup contract for each test", async function() {
    oracle = await Tellor.new();
    oracleRef = await RefTellor.new();
  });

  it("Passes", async () => {
    assert.isTrue(true);
  });
});
