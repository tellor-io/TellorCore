/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
var TellorTransfer = artifacts.require("./libraries/TellorTransfer.sol");
var TellorDispute = artifacts.require("./libraries/TellorDispute.sol");
var TellorStake = artifacts.require("./libraries/TellorStake.sol");
var TellorLibrary = artifacts.require("./libraries/TellorLibrary.sol");
var TellorGettersLibrary = artifacts.require(
  "./libraries/TellorGettersLibrary.sol"
);
var Tellor = artifacts.require("./TellorTest.sol");
var TellorMaster = artifacts.require("./TellorMaster.sol");
var TellorTest = artifacts.require("TellorTest.sol");
var TellorLibraryTest = artifacts.require("TellorLibraryTest.sol");

/**
 *@dev Use this for setting up contracts for testing
 *this will link the Factory and Tellor Library
 **/

module.exports = async function(deployer) {
  // deploy transfer
  await deployer.deploy(TellorTransfer);
  // sleep_s(30);

  // deploy dispute
  await deployer.link(TellorTransfer, TellorDispute);
  await deployer.deploy(TellorDispute);
  //sleep_s(30);
  // deploy stake
  await deployer.link(TellorTransfer, TellorStake);
  await deployer.link(TellorDispute, TellorStake);
  await deployer.deploy(TellorStake);
  //sleep_s(30);

  // deploy getters lib
  await deployer.deploy(TellorGettersLibrary);
  //sleep_s(30);

  // deploy lib
  await deployer.link(TellorDispute, TellorLibrary);
  await deployer.link(TellorTransfer, TellorLibrary);
  await deployer.link(TellorStake, TellorLibrary);
  await deployer.deploy(TellorLibrary);
  //sleep_s(60);

  await deployer.link(TellorTransfer, TellorLibraryTest);
  await deployer.deploy(TellorLibraryTest);

  // deploy tellor
  await deployer.link(TellorTransfer, TellorTest);
  await deployer.link(TellorDispute, TellorTest);
  await deployer.link(TellorStake, TellorTest);
  await deployer.link(TellorLibrary, TellorTest);
  await deployer.link(TellorLibraryTest, TellorTest);
  await deployer.deploy(TellorTest);
  //sleep_s(60);

  //deploy tellor master
  await deployer.link(TellorTransfer, TellorMaster);
  await deployer.link(TellorGettersLibrary, TellorMaster);
  await deployer.link(TellorStake, TellorMaster);
  await deployer.deploy(TellorTest).then(async function() {
    await deployer.deploy(TellorMaster, TellorTest.address);
  });
};
/****Uncomment the body to run this with Truffle migrate for truffle testing*/
