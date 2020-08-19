const BN = require('bn.js');
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./Tellor.sol");
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;


//Mainnet
// var tellorMasterAddress = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e';
// var tellorAddress ='0x350E67De9E92f55c1164556b02deB320b45a4a2a';

/*//Rinkeby
var tellorMasterAddress = '0xFe41Cb708CD98C5B20423433309E55b53F79134a' ;
var tellorAddress = '0x795d57eC055226e99D95DF41E4Bd00e719dCF855'  ;
var acct = '0xe010ac6e0248790e08f42d5f697160dedf97e024';*/

//let acct  =  "0xe010ac6e0248790e08f42d5f697160dedf97e024";
//Rinkeby
const myOracle = "0x37e7C91aFB1475eE0687bA28E002273d7058b06b";


//mainnet
//let acct  =  "0xC840ba62Aab90B8cD629649822F04300Ef5D1963";
//const myOracle = "0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e";

function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

let myarr = ["0xe0d7bae200f0994b11423e8be8f386060bbdd808","0xe7e5c22a8f366b4418a06dab6438fba3a7259cea","0x5d4ed2cc2c46f4144ec45c39c5af9b69c7cda8e8"]

module.exports = function() {
    let ins = Oracle.at(myOracle).then(ins=>{
      console.log(ins)
      for(i=0;i< myarr.length;i++){
           ins.theLazyCoon(myarr[i],2000000000000000000000).then(res=>
            {console.log('newBalance', myarr[i])}
            )
           
      }
    }
      );
}