const { default: Web3 } = require("web3");

const BN = web3.utils.BN;

module.exports = {
  stakeAmount: new BN(web3.utils.toWei("500", "ether")),
  timeTarget: 240,
};
