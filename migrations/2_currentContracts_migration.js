/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
var TellorTransfer = artifacts.require("./libraries/TellorTransfer.sol");
var TellorDispute = artifacts.require("./libraries/TellorDispute.sol");
var TellorStake = artifacts.require("./libraries/TellorStake.sol");
var TellorLibrary = artifacts.require("./libraries/TellorLibrary.sol");
var TellorGettersLibrary = artifacts.require(
  "./libraries/TellorGettersLibrary.sol"
);
var Tellor = artifacts.require("./Tellor.sol");
var OldTellorStake = artifacts.require(
  "tellorlegacy/contracts/oldContracts/libraries/OldTellorStake"
);
var OldTellorTransfer = artifacts.require(
  "tellorlegacy/contracts/oldContracts/libraries/OldTellorTransfer"
);
var OldTellorDispute = artifacts.require(
  "tellorlegacy/contracts/oldContracts/libraries/OldTellorDispute"
);
var TellorMaster = artifacts.require("./TellorMaster.sol");
const v2Tellor = artifacts.require("v2/v2Tellor");
const v2TellorMaster = artifacts.require("v2/v2TellorMaster");
const v2TellorStake = artifacts.require("v2/libraries/v2TellorStake");
const v2TellorTransfer = artifacts.require("v2/libraries/v2TellorTransfer");
const v2TellorDispute = artifacts.require("v2/libraries/v2TellorDispute");
const v2TellorLibrary = artifacts.require("v2/libraries/v2TellorLibrary");
const v2TellorGettersLibrary = artifacts.require(
  "v2/v2TellorGettersLibrary.sol"
);
/****Uncomment the body to run this with Truffle migrate for truffle testing*/

/**
*@dev Use this for setting up contracts for testing 
*this will link the Factory and Tellor Library

*These commands that need to be ran:
*truffle migrate --network rinkeby -f 1 --to 2 --skip-dry-run
*truffle exec scripts/Migrate_1.js --network rinkeby
*truffle exec scripts/Migrate_2.js --network rinkeby
*/
// function sleep_s(secs) {
//   secs = (+new Date) + secs * 1000;
//   while ((+new Date) < secs);
// }
/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
// module.exports = function (deployer) {
//     deployer.deploy(TellorLibrary).then(() => {
//         deployer.deploy(Tellor);
//     });
//     deployer.link(TellorLibrary, Tellor);
// };

module.exports = async function(deployer) {
  console.log("MIGRATIONS 2");
  
  // deploy transfer
  await deployer.deploy(TellorTransfer);
  console.log("TellorTransfer.address", TellorTransfer.address)
 
  // sleep_s(30);

  // deploy dispute
  await deployer.link(TellorTransfer, TellorDispute);
  console.log("linking tranfer to Dispute")
 
  await deployer.deploy(TellorDispute);
   console.log("TellorDispute.address", TellorDispute.address)

  //sleep_s(30);
  // deploy stake
  await deployer.link(TellorTransfer, TellorStake);
  console.log("linking tranfer to TellorStake")

  await deployer.link(TellorDispute, TellorStake);
  console.log("linking TellorDispute to TellorStake")
 
  await deployer.deploy(TellorStake);
    console.log("TellorStake.address", TellorStake.address)
 
  //sleep_s(30);

  // deploy lib
  await deployer.link(TellorDispute, TellorLibrary);
  await deployer.link(TellorTransfer, TellorLibrary);
    console.log("linking TellorTransfer to TellorLibrary")
 
  await deployer.link(TellorStake, TellorLibrary);
  await deployer.deploy(TellorLibrary);
    console.log("TellorLibrary.address", TellorLibrary.address)
 
  //sleep_s(60);

  // deploy tellor
  await deployer.link(TellorTransfer, Tellor);
   console.log("linking TellorTransfer to Tellor")

  await deployer.link(TellorDispute, Tellor);
    console.log("linking TellorDispute to Tellor")
 
  await deployer.link(TellorStake, Tellor);
    console.log("linking TellorStake to Tellor")

  await deployer.link(TellorLibrary, Tellor);
   console.log("linking TellorLibrary to Tellor")

  await deployer.deploy(Tellor);
    console.log("tellor.address", Tellor.address)

  //sleep_s(60);

  // deploy getters lib
  await deployer.deploy(TellorGettersLibrary);
  //sleep_s(30);

  //****************************for Tests only*********************************/
  // //OLD DEPS
//   await deployer.deploy(OldTellorTransfer);

//   await deployer.link(OldTellorTransfer, OldTellorDispute);
//   await deployer.deploy(OldTellorDispute);
//   // deploy stake
//   await deployer.link(OldTellorTransfer, OldTellorStake);
//   await deployer.link(OldTellorDispute, OldTellorStake);
//   await deployer.deploy(OldTellorStake);

//   // deploy tellor master
//   await deployer.link(OldTellorTransfer, TellorMaster);
//   await deployer.link(TellorGettersLibrary, TellorMaster);
//   await deployer.link(OldTellorStake, TellorMaster);
//   await deployer.deploy(Tellor).then(async function() {
//     await deployer.deploy(TellorMaster, Tellor.address);
//   });

//   //Deploy Tellor V2
//   await deployer.deploy(v2TellorTransfer);

//   //deploy dispute
//   await deployer.link(v2TellorTransfer, v2TellorDispute);
//   await deployer.deploy(v2TellorDispute);

//   // deploy stake
//   await deployer.link(v2TellorTransfer, v2TellorStake);
//   await deployer.link(v2TellorDispute, v2TellorStake);
//   await deployer.deploy(v2TellorStake);

//   // deploy getters lib
//   await deployer.deploy(v2TellorGettersLibrary);

//   // deploy lib
//   await deployer.link(v2TellorDispute, v2TellorLibrary);
//   await deployer.link(v2TellorTransfer, v2TellorLibrary);
//   await deployer.link(v2TellorStake, v2TellorLibrary);
//   await deployer.deploy(v2TellorLibrary);

//   // deploy tellor
//   await deployer.link(v2TellorTransfer, v2Tellor);
//   await deployer.link(v2TellorDispute, v2Tellor);
//   await deployer.link(v2TellorStake, v2Tellor);
//   await deployer.link(v2TellorLibrary, v2Tellor);
//   await deployer.deploy(v2Tellor);

//   // deploy tellor master
//   await deployer.link(v2TellorTransfer, v2TellorMaster);
//   await deployer.link(v2TellorGettersLibrary, v2TellorMaster);
//   await deployer.link(v2TellorStake, v2TellorMaster);
//   await deployer.deploy(v2Tellor).then(async function() {
//     await deployer.deploy(v2TellorMaster, v2Tellor.address);
//   });
// };
/****Uncomment the body to run this with Truffle migrate for truffle testing*/
