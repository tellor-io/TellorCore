
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
var web3 = new Web3(new HDWalletProvider('3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216',"https://rinkeby.infura.io/v3/7f11ed6df93946658bf4c817620fbced"));
//var web3 = new Web3(new HDWalletProvider("","https://mainnet.infura.io/v3/bc3e399903ae407fa477aa0854a00cdc"));

/*notes for validating contract
//solc: 0.5.8+commit.23d335f2.Emscripten.clang
// truffle-flattener ./contracts/01_DeploySaleContract.sol > ./flat_files/01_DeploySaleContract.sol
// truffle exec scripts/01_DeployTellor.js --network rinkeby

/*Variables*/
//rinkeby
tellorMaster = '0xFe41Cb708CD98C5B20423433309E55b53F79134a';

//mainnet
//tellorMaster = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5';

var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
var bytes = web3.utils.keccak256(api, 1000);
console.log("bytes", bytes);

console.log("start");
module.exports =async function(callback) {
    let userContract;
    let oracleIDDescriptions;
   console.log("1")
//     oa = (web3.utils.toChecksumAddress(tellorMaster));
//     // tm = (web3.utils.toChecksumAddress(tellorMaster));
//     // console.log("tm", tm);
//     userContract = await UserContract.new(oa);
//     console.log("userContract address:", userContract.address);
//     sleep_s(30)


//     usingTellor = await UsingTellor.new(userContract.address)

//     console.log("using tellor", usingTellor.address);
//     sleep_s(30)

//     oracleIDDesc = await OracleIDDescriptions.new();
//     console.log("oracleIDDesc address:", oracleIDDesc.address);
//     sleep_s(30)
a = '0x0D17ED8DDE4AF196ff638F3704e94A77419Df2b8'
userContract = await UserContract.at(a);
oracleIDDesc = await OracleIDDescriptions.at('0x28c029d6a3F4aE13ed4d031BAF07E31e89428573')
    await userContract.setOracleIDDescriptors(oracleIDDesc.address);
    console.log("user contract setOracleIdDescriptors address");
    sleep_s(30)
    

    // await userContract.setPrice(web3.utils.toWei(.03,'ether'));
    // console.log("userContract set Price ")
    // sleep_s(30)
/*
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
    console.log("defineTellorIdtoBytesId");*/


process.exit()
}
