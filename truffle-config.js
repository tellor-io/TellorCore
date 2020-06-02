require('dotenv').config()
const HDWalletProvider = require("@truffle/hdwallet-provider");

 //const mnemonic = process.env.ETH_MNEMONIC;
 const accessToken = process.env.WEB3_INFURA_PROJECT_ID;
 const mnemonic = "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish";


// ganache-cli -m "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish" -l 12000000
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
        new HDWalletProvider(process.env.PRIVATE_KEY, `https://rinkeby.infura.io/v3/${accessToken}`),
      network_id: 4,
      gas: 4700000,
      gasPrice: 8000000000,
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider("", `https://mainnet.infura.io/v3/${accessToken}`),
      network_id: 1,
      gas: 200000,
      gasPrice: 8000000000,
    },
    mocha: {
      enableTimeouts: false,
      before_timeout: 210000, // Here is 2min but can be whatever timeout is suitable for you.
    },
  }
};