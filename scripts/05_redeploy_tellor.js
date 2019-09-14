
/**
* @title Deploy Tellor 
*/

/*Imports*/
var Tellor = artifacts.require("Tellor");

/*Helper functions*/
function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

const Web3 = require('web3')
var HDWalletProvider = require("@truffle/hdwallet-provider");
//var web3 = new Web3(new HDWalletProvider('4bdc16637633fa4b4854670fbb83fa254756798009f52a1d3add27fb5f5a8e16',"https://rinkeby.infura.io/v3/7f11ed6df93946658bf4c817620fbced"));
var web3 = new Web3(new HDWalletProvider("","https://mainnet.infura.io/v3/bc3e399903ae407fa477aa0854a00cdc"));

/*notes for validating contract
//solc: 0.5.8+commit.23d335f2.Emscripten.clang
// truffle-flattener ./contracts/01_DeploySaleContract.sol > ./flat_files/01_DeploySaleContract.sol
// truffle exec scripts/01_DeployTellor.js --network rinkeby

/*Variables*/
//rinkeby
//tellorMaster = '0x3f1571E4DFC9f3A016D90e0C9824C56fD8107a3e';

//mainnet
tellorMaster = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5';

console.log("start");
module.exports =async function(callback) {
    let tellor;

   console.log("1")
    

    tellor = await Tellor.new();
    
    console.log("Tellor address:", tellor.address);

process.exit()
}
