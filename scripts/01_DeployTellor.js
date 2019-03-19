function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}
//truffle-flattener ./contracts/proofOfWorkToken.sol > ./flat_files/proofOfWorkToken_flat.sol
// truffle exec scripts/DeployOracleandOracleVote.js --network rinkeby


var oracle = artifacts.require("Oracle");



module.exports =async function(callback) {
    let oracle;
    
        oracle = await Oracle.new();
        console.log("oracle address", oracletoken.address);

}
