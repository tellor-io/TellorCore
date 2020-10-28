
const Web3 = require('web3');
var HDWalletProvider = require("@truffle/hdwallet-provider");
var web3 = new Web3(new HDWalletProvider("3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216","https://mainnet.infura.io/v3/7f11ed6df93946658bf4c817620fbced"));

const TransitionContract = artifacts.require("./TellorTransition");

console.log(1)

module.exports =async function(callback) {

  let tc = await TransitionContract.new();
  console.log("tc address", tc.address);

  process.exit()


}
