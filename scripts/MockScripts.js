/*
This deploys base contracts to run with the demo
and makes first request
*/






function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}



//truffle-flattener ./contracts/OracleVote.sol > ./flat_files/OracleVote_flat.sol
// truffle exec scripts/DeployOracleandOracleVote.js --network rinkeby


var OracleToken = artifacts.require("OracleToken");
var OracleVote = artifacts.require("OracleVote");
var Reader = artifacts.require("Reader");
var timeframe2 = (86400/60)/6; //10mins
var timeframe = (86400); //Daily

var voteAdd = "0xbdfc820b1450dea533d23d9a30ee4b2c323c3586";
contract_addresses =["0x7a59bcbaf3bc4316c70338215446fd7a0456252c","0xc37b5b861bfc1a96f3ecef106392db42711d5c4d"];//one day and ten minute

var myAddress = "0xc69c64c226fEA62234aFE4F5832A051EBc860540";
var reader_add = "0x167f4eb0d6b90004870122c2bb0014c599d4f57d";

public_keys = ["0xe010ac6e0248790e08f42d5f697160dedf97e024","0xcdd8fa31af8475574b8909f135d510579a8087d3","0xb9dd5afd86547df817da2d0fb89334a6f8edd891","0x230570cd052f40e14c14a81038c6f3aa685d712b","0x3233afa02644ccd048587f8ba6e99b3c00a34dcc"]

module.exports =async function(callback) {
        let reader;
    reader = await Reader.at(reader_add);
    let oracleVote;
    oracleVote = await OracleVote.at(voteAdd);
    //await oracleVote.transfer(myAddress,10);
    //console.log(await oracleVote.balanceOf(myAddress));
    for(i in public_keys){
            console.log(public_keys[i], await oracleVote.balanceOf(public_keys[i]));
    }
    for(i in contract_addresses){
        let oracleToken;
        oracleToken = await OracleToken.at(contract_addresses[i]);
        console.log(await oracleToken.timeOfLastProof());
        console.log(await oracleVote.balanceOf(reader.address));
        console.log(await oracleToken.readFee());
        await oracleVote.transfer(reader.address,22);
        await reader.getLastValue(contract_addresses[i]);
        console.log(await reader.value())
    }
}

//transfer and check balances
//check data reads


//check difficulty adjustment

