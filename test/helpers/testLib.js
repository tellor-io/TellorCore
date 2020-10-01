// const { web3, BN } = require("./setup");
// const { fromWei } = require("web3-utils");

class TestLib {
  constructor(env) {
    this.env = env;
  }

  async mineBlock() {
    let vars = await this.getCurrentVars();
    for (var i = 0; i < 5; i++) {
      await web3.eth.sendTransaction({
        to: this.env.oracle.address,
        from: this.env.accounts[i],
        gas: 10000000,
        data: this.env.oracle2.methods
          .testSubmitMiningSolution("nonce", vars["1"], [
            1200,
            1300,
            1400,
            1500,
            1600,
          ])
          .encodeABI(),
      });
    }
  }

  async getCurrentVars() {
    return await this.env.oracle2.methods.getNewCurrentVariables().call();
  }
}

function initEnv(env) {
  let lib = new TestLib(env);
  return lib;
}

// async function balanceCurrent(account, unit = "wei") {
//   return new BN(fromWei(await web3.eth.getBalance(account), unit));
// }

module.exports = {
  init: initEnv,
};
