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

  const printRequestQ = async () => {
    let q = await master.getRequestQ();
    // console.log("Q index and total rewards");
    // for (var i = 1; i < 60; i++) {
    //   let pos;
    //   if (i < 51) {
    //     pos = await master.getRequestIdByRequestQIndex(i);
    //   }
    //   let rewards = await master.getRequestVars(i);
    //   console.log("Id:", i);
    //   console.log("Qpos: ", pos?.toString());
    //   console.log("rewards", rewards["5"].toString());
    // }

    console.log("Request Q");
    q.map((i) => console.log(i.toString()));
  };

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
    master = await TestLib.getEnv(accounts, true);
    env = {
      master: master,
      accounts: accounts,
    };
    utilities = await UtilitiesTests.new(master.address);

    //  clearing tips before tests
    for (var i = 0; i < 10; i++) {
      await helper.takeFifteen();
      await TestLib.mineBlock(env);
    }

    //Add tip and mine 2 blocks to clear tips
    await master.addTip(52, 1);
    await helper.advanceTime(60 * 16);
    await TestLib.mineBlock(env);
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

  // it("Test getMax payout and index 51 req with overlapping tips and requests", async function() {
  //   utilities = await UtilitiesTests.new(master.address);
  //   for (var i = 1; i <= 21; i++) {
  //     await master.addTip(i, i, { from: accounts[2] });
  //   }
  //   for (var j = 15; j <= 45; j++) {
  //     apix = "api" + j;
  //     await master.addTip(j, j, { from: accounts[2] });
  //   }
  //   max = await utilities.testgetMax();
  //   console.log(max["0"].toString());
  //   console.log(max["1"].toString());
  //   assert(
  //     web3.utils.hexToNumberString(max["0"].toString()) == "45",
  //     "Max should be 45"
  //   );
  //   assert(
  //     web3.utils.hexToNumberString(max["1"].toString()) == "6",
  //     "Max should be 11"
  //   ); //note first 5 are added
  // });
  it("Test getMax payout and index 60 requests", async function() {
    utilities = await UtilitiesTests.new(master.address);
    let queue = [0];
    let ref = [0];
    for (var i = 1; i < 60; i++) {
      let x = Math.floor(Math.random() * 998) + 1;
      await master.addTip(i, x);
      queue.push(x);
      ref.push(x);
    }
    let res = await utilities.testgetMax(queue);
    let values = [];
    let idexes = [];

    let tempsorted = queue.sort((a, b) => a - b);
    let sorted = tempsorted.slice(46);
    for (var i = 0; i < res.length; i++) {
      values.push(res["0"][i].toNumber());
      idexes.push(res["1"][i].toNumber());
    }
    let svals = values.sort((a, b) => a - b);
    for (var i = 0; i < res.length; i++) {
      assert(svals[i] == sorted[i], "Value supposed to be on the top5");
    }
  });

  it("Test getMax payout and index 100 requests", async function() {
    utilities = await UtilitiesTests.new(master.address);
    let queue = [0];
    let ref = [0];
    for (var i = 1; i < 100; i++) {
      let x = Math.floor(Math.random() * 998) + 1;
      await master.addTip(i, x);
      queue.push(x);
      ref.push(x);
    }
    let res = await utilities.testgetMax(queue);
    let values = [];
    let idexes = [];

    let tempsorted = queue.sort((a, b) => a - b);
    let sorted = tempsorted.slice(46);
    for (var i = 0; i < res.length; i++) {
      values.push(res["0"][i].toNumber());
      idexes.push(res["1"][i].toNumber());
    }
    let svals = values.sort((a, b) => a - b);
    for (var i = 0; i < res.length; i++) {
      assert(svals[i] == sorted[i], "Value supposed to be on the top5");
    }
  });

  it("Timestamp on Q", async () => {
    utilities = await UtilitiesTests.new(master.address);
    apiVars = await master.getRequestVars(1);
    apiIdforpayoutPoolIndex = await master.getRequestIdByRequestQIndex(0);
    apiId = await master.getRequestIdByQueryHash(apiVars[2]);
    assert(
      web3.utils.hexToNumberString(apiId) == 1,
      "timestamp on Q should be 1"
    );
  });

  it("utilities Test getMin payout and index 10 req with overlapping tips and requests", async function() {
    utilities = await UtilitiesTests.new(master.address);
    let queue = [0];
    let ref = [[0, 0]];
    for (var i = 1; i < 60; i++) {
      let x = Math.floor(Math.random() * 998) + 1;
      await master.addTip(i, x);
      queue.push(x);
      ref.push([i, x]);
    }
    let res = await utilities.testgetMax(queue);
    let values = [];
    let idexes = [];

    let tempsorted = queue.sort((a, b) => a - b);
    let sorted = tempsorted.slice(46);
    for (var i = 0; i < res.length; i++) {
      values.push(res["0"][i].toNumber());
      idexes.push(res["1"][i].toNumber());
    }
    let svals = values.sort((a, b) => a - b);
    let sref = values.sort((a, b) => a[1] - b[1]);
    for (var i = 0; i < res.length; i++) {
      assert(
        svals[i] == sorted[res.length - 1 - i],
        "Value supposed to be on the top5"
      );
      assert(sref[i[0]] == res["0"], "Id supposed to be on correct");
    }
  });

  // //Double check on this 2 test cases
  // it("Test getMin payout and index 51 req count down with overlapping tips and requests", async function() {
  //   utilities = await UtilitiesTests.new(master.address);
  //   let queue = [0];
  //   let ref = [[0, 0]];
  //   for (var i = 1; i < 60; i++) {
  //     let x = Math.floor(Math.random() * 998) + 1;
  //     await master.addTip(i, x);
  //     queue.push(x);
  //     ref.push([i, x]);
  //   }

  //   for (var i = 1; i < 60; i = i + 5) {
  //     let x = Math.floor(Math.random() * 998) + 1;
  //     await master.addTip(i, x);
  //     queue[i] += x;
  //     ref[i][1] += x;
  //   }

  //   let svals = queue.sort((a, b) => a - b);
  //   let sref = ref.sort((a, b) => a[1] - b[1]);

  //   min = await utilities.testgetMin();

  //   console.log(sref);
  //   console.log(svals);
  //   console.log(min[0].toNumber(), min[1].toNumber());
  //   console.log(sref[0][0], svals[0]);
  //   assert(min[0] == sref[0][0], "Min should be 0");
  //   assert(min[1] == svals[0], "Min should be 5");

  //   // assert(req[44] == 30, "request 15 is submitted twice this should be 30");
  //   // assert(req[50] == 42, "request 21 is submitted twice this should be 42");
  // });

  // it("Test getMin payout and index 55 requests", async function() {
  //   utilities = await UtilitiesTests.new(master.address);
  //   for (var i = 1; i <= 55; i++) {
  //     await master.addTip(i, i, { from: accounts[2] });
  //   }
  //   req = await master.getRequestQ();
  //   min = await utilities.testgetMins(req);
  //   assert(min[0] == 6, "Min should be 6");
  //   assert(min[1] == 50, "Min should be 45");
  // });
});
