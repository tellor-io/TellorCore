
/**
* @title Deploy User Contracts 
* @dev This allows Tellor deploy the community sale contract
*/

/*Imports*/
var UserContract = artifacts.require("UserContract");
var UsingTellor = artifacts.require("UsingTellor");
var OracleIDDescriptions = artifacts.require("OracleIDDescriptions");

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
//tellorMaster = '0x724D1B69a7Ba352F11D73fDBdEB7fF869cB22E19';

//mainnet
tellorMaster = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5';

var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
var bytes = web3.utils.keccak256(api, 1000);
console.log("bytes", bytes);

console.log("start");
module.exports =async function(callback) {
    let userContract;
    let oracleIDDescriptions;
   console.log("1")
    // oa = (web3.utils.toChecksumAddress(tellorMaster));
    // // tm = (web3.utils.toChecksumAddress(tellorMaster));
    // // console.log("tm", tm);
    // userContract = await UserContract.new(oa);
    // console.log("userContract address:", userContract.address);
    // sleep_s(30)

a = '0x09459fdafD6Fdce14E04B3487A656FBca0b953ea'
userContract = await UserContract.at(a);
    usingTellor = await UsingTellor.new(userContract.address)

    console.log("using tellor", usingTellor.address);
    sleep_s(30)

    oracleIDDesc = await OracleIDDescriptions.new();
    console.log("oracleIDDesc address:", oracleIDDesc.address);
    sleep_s(30)

    await userContract.setOracleIDDescriptors(oracleIDDesc.address);
    console.log("user contract setOracleIdDescriptors address");
    sleep_s(30)
    

    await userContract.setPrice(web3.utils.toWei(.03,'ether'));
    console.log("userContract set Price ")
    sleep_s(30)

    await oracleIDDesc.defineTellorCodeToStatusCode(0,400);
    console.log("status code 0")
    sleep_s(30)
    await oracleIDDesc.defineTellorCodeToStatusCode(1,200);
    console.log("status code 1")
    sleep_s(30)
    await oracleIDDesc.defineTellorCodeToStatusCode(2,404);
    console.log("status code 2")
    sleep_s(30)


    await oracleIDDesc.defineTellorIdToBytesID(1,bytes);
    console.log("defineTellorIdtoBytesId");


process.exit()
}
