/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
var TellorTransfer = artifacts.require("MockTellorTransfer.sol");
var TellorStake = artifacts.require("MockTellorStake.sol");
var TellorLibrary = artifacts.require("MockTellorLibrary.sol");
var Tellor = artifacts.require("MockTellor.sol");
var RefTellorTransfer = artifacts.require("RefTellorTransfer.sol");
var RefTellorStake = artifacts.require("RefTellorStake.sol");
var RefTellorLibrary = artifacts.require("RefTellorLibrary.sol");
var RefTellor = artifacts.require("RefTellor.sol");

/****Uncomment the body to run this with Truffle migrate for truffle testing*/

/**
 *@dev Use this for setting up contracts for testing
 *this will link the Factory and Tellor Library
 *These commands that need to be ran:
 *truffle migrate --network rinkeby
 *truffle exec scripts/Migrate_1.js --network rinkeby
 *truffle exec scripts/Migrate_2.js --network rinkeby
 */

module.exports = async function(deployer) {
  await deployer.deploy(TellorTransfer);
  await deployer.link(TellorTransfer, TellorStake);
  await deployer.deploy(TellorStake);
  await deployer.link(TellorTransfer, TellorLibrary);
  await deployer.link(TellorStake, TellorLibrary);
  await deployer.deploy(TellorLibrary);
  await deployer.link(TellorTransfer, Tellor);
  await deployer.link(TellorStake, Tellor);
  await deployer.link(TellorLibrary, Tellor);
  await deployer.deploy(Tellor);

  await deployer.deploy(RefTellorTransfer);
  await deployer.link(RefTellorTransfer, RefTellorStake);
  await deployer.deploy(RefTellorStake);
  await deployer.link(RefTellorTransfer, RefTellorLibrary);
  await deployer.link(RefTellorStake, RefTellorLibrary);
  await deployer.deploy(RefTellorLibrary);
  await deployer.link(RefTellorTransfer, RefTellor);
  await deployer.link(RefTellorStake, RefTellor);
  await deployer.link(RefTellorLibrary, RefTellor);
  await deployer.deploy(RefTellor);
};
/****Uncomment the body to run this with Truffle migrate for truffle testing*/
