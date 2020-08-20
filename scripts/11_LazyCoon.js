// ["0xe0d7bae200f0994b11423e8be8f386060bbdd808","0xe7e5c22a8f366b4418a06dab6438fba3a7259cea","0x5d4ed2cc2c46f4144ec45c39c5af9b69c7cda8e8"]
const BN = require('bn.js');
const TellorMaster = artifacts.require("./TellorMaster.sol");
var masterAbi = TellorMaster.abi;
const Oracle = artifacts.require("./Tellor.sol");
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;

const Web3 = require('web3')
var HDWalletProvider = require("@truffle/hdwallet-provider");
var web3 = new Web3(new HDWalletProvider('3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216',"https://rinkeby.infura.io/v3/4944b10f2cbd4e1d8c03e0e8ff2cd985"));

//let acct  =  "0xe010ac6e0248790e08f42d5f697160dedf97e024";
//Rinkeby
//const myOracle = "0xFe41Cb708CD98C5B20423433309E55b53F79134a";
const myOracle = "0x37e7C91aFB1475eE0687bA28E002273d7058b06b";//test
const newTellor = "0xCC132D31Dca0C1e5FBBE615A06fF97C84aa34930";




let myarr = ["0xe0d7BAE200F0994B11423E8BE8F386060bBdd808","0xE7E5c22A8f366B4418a06Dab6438fbA3a7259ceA","0x5d4eD2cC2C46f4144EC45C39C5aF9B69C7CDa8E8"]


module.exports = async function(callback) {


let ins = await Oracle.at(myOracle);

for(i=1;i<3;i++){
await ins.theLazyCoon(myarr[i],web3.utils.toWei('1000', 'ether'))
}

process.exit()

}



