const hre = require("hardhat");
const Tellor = artifacts.require("./TellorTest.sol"); // globally injected artifacts helper
const ITellorI = artifacts.require("ITellorI.sol");
const ITellorII = artifacts.require("ITellorII.sol");
const ITellorIIV = artifacts.require("ITellorIIV.sol");
const OldTellor = artifacts.require("./oldContracts/OldTellor.sol");
const TellorV2 = artifacts.require("./v2/v2Tellor.sol");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const TransitionContract = artifacts.require("./TellorTransition");
const TellorTransfer = artifacts.require("./libraries/TellorTransfer.sol");
const TellorDispute = artifacts.require("./libraries/TellorDispute.sol");
const TellorStake = artifacts.require("./libraries/TellorStake.sol");
const TellorLibraryTest = artifacts.require("./libraries/TellorLibraryTest.sol");
const TellorLibrary = artifacts.require("./libraries/TellorLibrary.sol");

const OldTellorStake = artifacts.require(
  "tellorlegacy/contracts/oldContracts/libraries/OldTellorStake"
);
const OldTellorTransfer = artifacts.require(
  "tellorlegacy/contracts/oldContracts/libraries/OldTellorTransfer"
);
const OldTellorDispute = artifacts.require(
  "tellorlegacy/contracts/oldContracts/libraries/OldTellorDispute"
);

const OldTellorLibrary = artifacts.require(
  "tellorlegacy/contracts/oldContracts/libraries/OldTellorLibrary"
);

const OldTellorGettersLibrary = artifacts.require(
  "tellorlegacy/contracts/oldContracts/libraries/OldTellorGettersLibrary"
);

const V2TellorStake = artifacts.require("v2/libraries/v2TellorStake");
const V2TellorTransfer = artifacts.require("v2/libraries/v2TellorTransfer");
const V2TellorDispute = artifacts.require("v2/libraries/v2TellorDispute");
const V2TellorLibrary = artifacts.require("v2/libraries/v2TellorLibrary");

const prepareTellorTest = async() => {
   const ttransfer = await TellorTransfer.new();

  await TellorDispute.link(ttransfer);
  const tdispute = await TellorDispute.new()

  await TellorStake.link(tdispute);
  await TellorStake.link(ttransfer);
  const tstake = await TellorStake.new();

  await TellorLibrary.link(ttransfer);
  const tlib = await TellorLibrary.new();

  await TellorLibraryTest.link(ttransfer);
  const tlibtest = await TellorLibraryTest.new();

  await Tellor.link(ttransfer);
  await Tellor.link(tdispute);
  await Tellor.link(tstake);
  await Tellor.link(tlib)
  await Tellor.link(tlibtest)
}

const prepareTellorV2 = async() => {
  const v2ttransfer = await V2TellorTransfer.new();

  await V2TellorDispute.link(v2ttransfer);
  const v2tdispute = await V2TellorDispute.new()

  await V2TellorStake.link(v2tdispute);
  await V2TellorStake.link(v2ttransfer);
  const v2tstake = await V2TellorStake.new();

  await V2TellorLibrary.link(v2ttransfer);
  const v2tlib = await V2TellorLibrary.new();

  await TellorV2.link(v2ttransfer);
  await TellorV2.link(v2tdispute);
  await TellorV2.link(v2tstake);
  await TellorV2.link(v2tlib)
}

const prepareOldTellor = async() => {
  const oldttransfer = await OldTellorTransfer.new();
  OldTellorTransfer.setAsDeployed(oldttransfer)


  await OldTellorDispute.link(oldttransfer);
  const oldtdispute = await OldTellorDispute.new()
  OldTellorDispute.setAsDeployed(oldtdispute)

  await OldTellorStake.link(oldttransfer);
  await OldTellorStake.link(oldtdispute);
  const oldtstake = await OldTellorStake.new();

  await OldTellorLibrary.link(oldttransfer);
  const oldtlib = await OldTellorLibrary.new();

  await OldTellor.link(oldttransfer);
  await OldTellor.link(oldtdispute);
  await OldTellor.link(oldtstake);
  await OldTellor.link(oldtlib)
  await TellorMaster.link(oldttransfer);
  await TellorMaster.link(oldtstake);
}


const prepareAll = async() => {
  await prepareOldTellor()
  await prepareTellorTest()
  await prepareTellorV2()

}
async function main() {
    await prepareAll()
    await hre.run("test");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });