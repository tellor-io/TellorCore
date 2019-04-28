function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}
// truffle-flattener ./contracts/Tellor.sol > ./flat_files/Tellor_flat.sol
// truffle exec scripts/01_DeployTellor.js --network rinkeby

var oracle = artifacts.require("Tellor");
var oracle = artifacts.require("TellorMaster");

module.exports =async function(callback) {
    let oracleBase;
    let oracle;
    s
        oracleBase = await Oracle.new();
        console.log("Tellor address", oracleBase.address);
        oracle = await TellorMaster.new(oracleBase.address);
        console.log("Tellor Master address", oracle.address);

}
