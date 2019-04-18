/*
This deploys base contracts to run with the demo
and makes first request
*/
/*
Directions:
truffle migrate
truffle exec scripts/MockScripts.js
Run mockMiner.py

*/
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');  
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./Tellor.sol");
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;
var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
let acct  =  "0xe010ac6e0248790e08f42d5f697160dedf97e024";


function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}




module.exports = async function(callback) {
    let oracle;
    let oracle2;
    oracle = await TellorMaster.deployed()
    console.log('oracle address',oracle.address)
    oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);///will this instance work for logWatch? hopefully...
    console.log(await oracle.getRequestQ());
    console.log(await oracle.getCurrentVariables());
    console.log(await oracle.getVariablesOnDeck());
    console.log('Ready!')
    return true;
}