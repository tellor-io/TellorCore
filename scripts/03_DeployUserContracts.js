
/**
* @title Deploy User Contracts 
* @dev This allows Tellor deploy the community sale contract
*/

/*Imports*/
var UserContract = artifacts.require("UserContract");
var UsingTellor = artifacts.require("UsingTellor");
var Optimistic = artifacts.require("Optimistic");
var TestContract = artifacts.require("TestContract");

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
    let userContract;
   // let testContract;
   console.log("1")
    
    // tm = (web3.utils.toChecksumAddress(tellorMaster));
    // console.log("tm", tm);
    userContract = await UserContract.new(tellorMaster);
    
    console.log("userContract address:", userContract.address);
/*    testContract = await testContract.new(userContract.address,10,86400*3,[1],86400);
    console.log("testContract address:", testContract.address);
    await testContract.setUserContract(userContract.address);
    console.log("UserContract set on test contract");  
    await testContract.testContract(7 * 86400);
    var startTime = await testContract.startDateTime.call(); 
    console.log('StartTime', startTime);*/
process.exit()
}
