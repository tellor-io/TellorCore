// const BN = require('bn.js');
// const TellorMaster = artifacts.require("./TellorMaster.sol");
// const Oracle = artifacts.require("./Tellor.sol");
// var oracleAbi = Oracle.abi;
// var oracleByte = Oracle.bytecode;
const Web3 = require('web3');


//Mainnet
// var tellorMasterAddress = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e';

const myOracle = "0x3f1571E4DFC9f3A016D90e0C9824C56fD8107a3e";
var multi = '0x2F51C4Bf6B66634187214A695be6CDd344d4e9d1';

function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

const BN = require('bn.js');
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./Tellor.sol");
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;


module.exports = function() {

  async function requestData() {
    let ins = await Oracle.at(myOracle);
    let ins2 = await TellorMaster.at(myOracle);

    for(i=4;i<51;i++){
           let req = 'PSR' + i
           console.log(req)
           await ins.requestData(req,req,10,0)
           console.log('sent req',i)
        } 

    }
  
  requestData();
}


module.exports = async function(callback) {
  console.log("contract:",web3.utils.keccak256("tellorContract"));
  //console.log("keccak256owner:",web3.utils.keccak256("_deity"));

}