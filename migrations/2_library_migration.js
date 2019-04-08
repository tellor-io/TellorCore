/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
var Tellor = artifacts.require("./Tellor.sol");
var TellorGetters = artifacts.require("./TellorGetters.sol");
var TellorMaster = artifacts.require("./TellorMaster.sol");
var TellorLibrary = artifacts.require("./libraries/TellorLibrary.sol");
var TellorGettersLibrary = artifacts.require("./libraries/TellorGettersLibrary.sol");

/****Uncomment the body to run this with Truffle migrate for truffle testing*/

/**
*@dev Use this for setting up contracts for testing 
*this will link the Factory and Tellor Library

*These commands that need to be ran:
*truffle migrate --network rinkeby
*truffle exec scripts/Migrate_1.js --network rinkeby
*truffle exec scripts/Migrate_2.js --network rinkeby
*/
function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}
/****Uncomment the body below to run this with Truffle migrate for truffle testing*/
// module.exports = function (deployer) {
//     deployer.deploy(TellorLibrary).then(() => {
//         deployer.deploy(Tellor);
//     });
//     deployer.link(TellorLibrary, Tellor);
// };

module.exports = async function (deployer) {
	await deployer.deploy(TellorGettersLibrary);
    await deployer.deploy(TellorLibrary);
    await deployer.link(TellorGettersLibrary,Tellor);
    await deployer.link(TellorGettersLibrary,TellorMaster);
    await deployer.link(TellorLibrary,Tellor);
    await deployer.deploy(Tellor);
};
/****Uncomment the body to run this with Truffle migrate for truffle testing*/