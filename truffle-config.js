require('dotenv').config()
const HDWalletProvider = require("@truffle/hdwallet-provider");

 const mnemonic = process.env.ETH_MNEMONIC;
 const accessToken = process.env.WEB3_INFURA_PROJECT_ID;

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 6721975, // default ganache-cli value
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider("3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216", `https://rinkeby.infura.io/v3/${accessToken}`),
      network_id: 4,
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider(mnemonic, `https://mainnet.infura.io/v3/${accessToken}`),
      network_id: 1,
      gas: 4700000,
      gasPrice: 8000000000,
    },
    mocha: {
      enableTimeouts: false,
      before_timeout: 210000, // Here is 2min but can be whatever timeout is suitable for you.
    },
  }
};