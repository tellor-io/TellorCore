require("@nomiclabs/hardhat-truffle5");
require("solidity-coverage");
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.5.16",

  networks: {
    hardhat: {
      accounts: {
        mnemonic:
          "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish",
      },
      count: 40,
    },
  },
};
