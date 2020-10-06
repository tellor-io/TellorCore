const TestLib = require("./helpers/testLib");

contract("V2.5 Tests", function(accounts) {
  beforeEach("Setup contract for each test", async function() {
    let lib = await TestLib.getV2(accounts);
  });

  it("Test Proposing Transotion Contract", async function() {});
});
