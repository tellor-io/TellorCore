/**
* Deploy Libraries
*/

function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}
// truffle-flattener ./contracts/Tellor.sol > ./flat_files/Tellor_flat.sol
// truffle exec scripts/01_DeployTellor.js --network rinkeby

var TellorTransfer = artifacts.require("./libraries/TellorTransfer.sol");
var TellorDispute = artifacts.require("./libraries/TellorDispute.sol");
var TellorStake = artifacts.require("./libraries/TellorStake.sol");
var TellorLibrary = artifacts.require("./libraries/TellorLibrary.sol");
var TellorGettersLibrary = artifacts.require("./libraries/TellorGettersLibrary.sol");
var Tellor = artifacts.require("./Tellor.sol");
var TellorMaster = artifacts.require("./TellorMaster.sol");



module.exports =async function(callback) {
	let transfer;
	let dispute;
	let stake;
	let getters;
	let tellorLib;
    let tellor;
    let tellorMaster;
    

  // deploy transfer
  tranfer = await TellorTransfer.new();
  console.log('TellorTransfer address:', transfer.address);
  console.log('Use TellorTransfer address(without the 0x) to link library in TellorDispute json file');
  sleep_s(10);

  // // deploy dispute
  // dispute = await TellorDispute.new();
  // console.log('TellorDispute address:', dispute.address);
  // console.log('Use TellorTransfer and TellorDispute addresses to link library in TellorStake json file');
  // sleep_s(10);

  // // deploy stake
  // stake = await TellorStake.new();
  // console.log('TellorStake address:', stake.address);
  // sleep_s(10);

  // // deploy getters lib
  // getters = await TellorGettersLibrary.new();
  // console.log('TellorGettersLibrary address:', getters.address);
  // console.log('Use TellorTransfer, TellorDispute and TellorStake addresses to link library in TellorLibrary json file');
  // sleep_s(10);

  // // deploy lib

  // tellorLib = await TellorLibrary.new();
  // console.log('TellorLib address:', tellorLib.address);
  // console.log('Use TellorTransfer, TellorDispute,TellorStake, TellorLibrary addresses to link library in Tellor json file');
  // sleep_s(10);

  // // deploy tellor
  // tellor = await Tellor.new();
  // console.log('Tellor address:', tellor.address);
  // console.log('Use TellorTransfer, TellorGettersLibrary,TellorStake addresses to link library in TellorMaster json file');
  // sleep_s(10);

  // // deploy tellor master
  // tellorMaster = await TellorMaster(Tellor.address);
  // console.log('TellorMaster address:', tellorMaster.address);

}
