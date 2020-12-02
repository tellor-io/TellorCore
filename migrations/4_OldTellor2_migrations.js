/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
var TellorLibrary = artifacts.require("./libraries/TellorLibrary.sol");
var TellorGettersLibrary = artifacts.require(
  "./libraries/TellorGettersLibrary.sol"
);
var OldTellor2 = artifacts.require("./oldContracts2/OldTellor2.sol");
var OldTellorMaster2 = artifacts.require(
  "tellorlegacy/contracts/oldContracts2/OldTellorMaster2.sol"
);
var Old2TellorStake = artifacts.require(
  "tellorlegacy/contracts/oldContracts2/libraries/Old2TellorStake.sol"
);
var Old2TellorTransfer = artifacts.require(
  "tellorlegacy/contracts/oldContracts2/libraries/Old2TellorTransfer.sol"
);
var Old2TellorDispute = artifacts.require(
  "tellorlegacy/contracts/oldContracts2/libraries/Old2TellorDispute.sol"
);
var Old2TellorLibrary = artifacts.require(
  "tellorlegacy/contracts/oldContracts2/libraries/Old2TellorLibrary.sol"
);
/****Uncomment the body to run this with Truffle migrate for truffle testing*/

/**
 *@dev Use this for setting up contracts for testing
 *this will link the Factory and Tellor Library
 *These commands that need to be ran:
 *truffle migrate --network rinkeby
 *truffle exec scripts/Migrate_1.js --network rinkeby
 *truffle exec scripts/Migrate_2.js --network rinkeby
 */
// function sleep_s(secs) {
//   secs = (+new Date) + secs * 1000;
//   while ((+new Date) < secs);
// }
/****Uncomment the body below to run this with Truffle migrate for truffle testing*/

module.exports = async function(deployer) {
  console.log("MIGRATIONS 4");
  // //Old2 DEPS
  // await deployer.deploy(Old2TellorTransfer);

  // //deploy dispute
  // await deployer.link(Old2TellorTransfer, Old2TellorDispute);
  // await deployer.deploy(Old2TellorDispute);

  // // deploy stake
  // await deployer.link(Old2TellorTransfer, Old2TellorStake);
  // await deployer.link(Old2TellorDispute, Old2TellorStake);
  // await deployer.deploy(Old2TellorStake);

  // // deploy getters lib
  // await deployer.deploy(TellorGettersLibrary);

  // // deploy lib
  // await deployer.link(Old2TellorDispute, Old2TellorLibrary);
  // await deployer.link(Old2TellorTransfer, Old2TellorLibrary);
  // await deployer.link(Old2TellorStake, Old2TellorLibrary);
  // await deployer.deploy(Old2TellorLibrary);

  // // deploy tellor
  // await deployer.link(Old2TellorTransfer, OldTellor2);
  // await deployer.link(Old2TellorDispute, OldTellor2);
  // await deployer.link(Old2TellorStake, OldTellor2);
  // await deployer.link(Old2TellorLibrary, OldTellor2);
  // await deployer.deploy(OldTellor2);

  // // deploy tellor master
  // await deployer.link(Old2TellorTransfer, OldTellorMaster2);
  // await deployer.link(TellorGettersLibrary, OldTellorMaster2);
  // await deployer.link(Old2TellorStake, OldTellorMaster2);
  // await deployer.deploy(OldTellor2).then(async function() {
  //   await deployer.deploy(OldTellorMaster2, OldTellor2.address);
  // });
};
