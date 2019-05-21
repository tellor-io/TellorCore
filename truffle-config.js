
var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
        "optimizer": {
        "enabled": true,
        "runs": 1
      },

  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
