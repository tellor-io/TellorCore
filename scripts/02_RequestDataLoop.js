const BN = require('bn.js');
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./oldContracts/Tellor.sol");
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;


//Mainnet
// var tellorMasterAddress = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e';
// var tellorAddress ='0x350E67De9E92f55c1164556b02deB320b45a4a2a';

/*//Rinkeby
var tellorMasterAddress = '0x724D1B69a7Ba352F11D73fDBdEB7fF869cB22E19' ;
var tellorAddress = '0x167bAB26405b2E50e46A6126c59590f3f393A347'  ;
var acct = '0xe010ac6e0248790e08f42d5f697160dedf97e024';*/

//let acct  =  "0xe010ac6e0248790e08f42d5f697160dedf97e024";
//Rinkeby
const myOracle = "0xA624528740ec3F8f2e7a012a7c21c3A890dC0B8d";


//mainnet
//let acct  =  "0xC840ba62Aab90B8cD629649822F04300Ef5D1963";
//const myOracle = "0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5";
//Rinkeby
function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}


module.exports = function() {

  async function requestData() {
    let ins = await Oracle.at(myOracle);
    let ins2 = await TellorMaster.at(myOracle);

    for(i=1;i<51;i++){
           let req = 'PSR' + i
           console.log(req)
           await ins.requestData(req,req,10,0)
           console.log('sent req',i)
        } 

    }
  
  requestData();
}