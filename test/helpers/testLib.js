// const { web3, BN } = require("./setup");
// const { fromWei } = require("web3-utils");

class TestLib {
  constructor(env) {
    this.env = env;
  }

  hash(str) {
    return web3.utils.keccak256(str);
  }

  async addTip(id, amount, sender = accounts[2]) {
    return await web3.eth.sendTransaction({
      to: this.env.oracle.address,
      from: sender,
      gas: 7000000,
      data: this.env.oracle2.methods.addTip(id, amount).encodeABI(),
    });
  }

  async lazyCoon(accs) {
    for (var i = 0; i < accs.length; i++) {
      await web3.eth.sendTransaction({
        to: this.env.oracle.address,
        from: this.env.accounts[0],
        gas: 7000000,
        data: oracle2.methods
          .theLazyCoon(accs[i], web3.utils.toWei("1100", "ether"))
          .encodeABI(),
      });
    }
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

module.exports = {
  init: initEnv,
};
