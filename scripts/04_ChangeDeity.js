const BN = require('bn.js');
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./Tellor.sol");
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;
const Web3 = require('web3');


//Mainnet
// var tellorMasterAddress = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e';
// var tellorAddress ='0x350E67De9E92f55c1164556b02deB320b45a4a2a';

/*//Rinkeby
var tellorMasterAddress = '0x3f1571E4DFC9f3A016D90e0C9824C56fD8107a3e' ;
var tellorAddress = '0xAf96A11a622f78399b5a12503D429750525273Bd'  ;
var acct = '0xe010ac6e0248790e08f42d5f697160dedf97e024';*/

//let acct  =  "0xe010ac6e0248790e08f42d5f697160dedf97e024";
//Rinkeby
const myOracle = "0x3f1571E4DFC9f3A016D90e0C9824C56fD8107a3e";
var multi = '0x2F51C4Bf6B66634187214A695be6CDd344d4e9d1';

//mainnet
//let acct  =  "0xC840ba62Aab90B8cD629649822F04300Ef5D1963";
//const myOracle = "0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e";
//var multi = '0x39E419bA25196794B595B2a595Ea8E527ddC9856';



function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}


module.exports = async function(callback) {
  console.log("contract:",web3.utils.keccak256("tellorContract"));
  console.log("keccak256owner:",web3.utils.keccak256("_deity"));

}