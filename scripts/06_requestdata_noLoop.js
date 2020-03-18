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
const myOracle = "0xFe41Cb708CD98C5B20423433309E55b53F79134a";


//mainnet
//let acct  =  "0xC840ba62Aab90B8cD629649822F04300Ef5D1963";
//const myOracle = "0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e";

function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

api1 = "json(https://api.coindesk.com/v1/bpi/currentprice.json).bpi.USD.rate"; 
api2 = "json(https://api.binance.com/api/v1/klines?symbol=BTCUSDT&interval=1d&limit=1).0.4";


module.exports = function() {

  async function requestData() {
    let ins = await Oracle.at(myOracle);

           console.log("request about to be sent")
           await ins.requestData(api2,"BTC/USD",10000,0)
           console.log('sent req')
        

    }
  
  requestData();
}