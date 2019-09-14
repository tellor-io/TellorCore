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
var mnemonic = "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish";

const Web3 = require('web3')
var HDWalletProvider = require("@truffle/hdwallet-provider");
var web3 = new Web3(new HDWalletProvider(mnemonic,"https://rinkeby.infura.io/v3/72bb9acde80d4a9ca803274f42f77612"));
//const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./Tellor.sol");
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;
var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
let acct  =  "0xe010ac6e0248790e08f42d5f697160dedf97e024";
let myOracle = "0xDae06771E342fc7A8BddBe9b159bB9fa8cE4D626"

function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}




module.exports = async function(callback) {
  console.log('starting')
    let oracle;
    let oracle2;
    oracle = await new web3.eth.Contract(TellorMaster.abi,myOracle)
    console.log('oracle address',oracle.address)
    //console.log(await web3.utils.fromWei(await web3.eth.getBalance(myOracle), 'ether'))
    console.log(await oracle.methods.getUintVar(web3.utils.keccak256("slotProgress")).call())
    console.log(await oracle.methods.getCurrentVariables().call())
    await web3.eth.sendTransaction({to:oracle.address,from:acct,gas:4000000,data:oracle2.methods.submitMiningSolution("5",5,5000000).encodeABI()})
    console.log('done')
    //oracle2 = await new web3.eth.Contract(oracleAbi,myOracle);///will this instance work for logWatch? hopefully...
    // try {
    //   // await web3.eth.sendTransaction({to: oracle.address,from:acct,gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()}, (e,r)=>{
    //   //   console.log("Requested data", e, r);
    //   // });
    //   await web3.eth.sendTransaction({to: oracle.address,from:acct,gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()}, (e,r)=>{
    //     console.log("Count", e, r);
    //   });
    // } catch (e) {
    //   console.log("Problem sending requestData txn", e);
    // }
}
