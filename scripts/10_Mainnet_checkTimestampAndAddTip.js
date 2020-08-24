
//require('dotenv').config();
const Web3 = require('web3');
var HDWalletProvider = require("@truffle/hdwallet-provider");
var fs = require('fs');
const fetch = require('node-fetch-polyfill');

const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./Tellor.sol");
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;


function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}

//https://ethgasstation.info/json/ethgasAPI.json
//https://www.etherchain.org/api/gasPriceOracle
async function fetchGasPrice() {
  const URL = `https://www.etherchain.org/api/gasPriceOracle`;
  try {
    const fetchResult = fetch(URL);
    const response = await fetchResult;
    const jsonData = await response.json();
    const gasPriceNow = await jsonData.standard*1;
    const gasPriceNow2 = await (gasPriceNow + 1)*1000000000;
    console.log(jsonData);
    //console.log("gasPriceNow", gasPriceNow);
    //console.log("gasPriceNow2", gasPriceNow2);
    return(gasPriceNow2);
  } catch(e){
    throw Error(e);
  }
}


/*var mnemonic = process.env.ETH_MNEMONIC;
var accessToken = process.env.INFURA_ACCESS_TOKEN;
var web3 = new Web3(new HDWalletProvider(mnemonic,"https://rinkeby.infura.io/v3"+ accessToken));
*/
//var mnemonic = "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish";
var web3 = new Web3(new HDWalletProvider("3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216","https://mainnet.infura.io/v3/7f11ed6df93946658bf4c817620fbced"));

var _UTCtime  = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
var gas_Limit= 4700000;

//Rinkeby
//var tellorMasterAddress = '0xFe41Cb708CD98C5B20423433309E55b53F79134a' ;
//var accountFrom = '0xe010ac6e0248790e08f42d5f697160dedf97e024';

//rinkeby setup for V2 update
// const myOracle = "0x37e7C91aFB1475eE0687bA28E002273d7058b06b";
// const marchTellor = "0x8FB343F8fe21bcce23173b6975050eE8B1b5b65A";
// const v2tellor = "0x6CC73A7cb32B5978dA026b8fB8A33C080a9a0Fe4";

//Mainnet
var tellorMasterAddress = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5';
var accountFrom = '0xe010ac6e0248790e08f42d5f697160dedf97e024';

console.log(_UTCtime);
console.log("Mainnet address: ", tellorMasterAddress);
console.log('<https://www.etherchain.org/api/gasPriceOracle>')

module.exports =async function(callback) {
    try{
    var gasP = await fetchGasPrice();
    console.log("gasP1", gasP);
    } catch(error){
        console.error(error);
        console.log("no gas price fetched");
    }
  if (gasP < 50000000000){
    let tellorMaster = await TellorMaster.at(tellorMasterAddress);  
    try{
             let balNow = await web3.eth.getBalance(accountFrom);
             console.log("Requests Address", accountFrom);
             console.log("ETH Balance",  web3.utils.fromWei(balNow,'ether'));
             let ttbalanceNow = await tellorMaster.balanceOf(accountFrom);
             //console.log('Tellor Tributes balance', web3.utils.hexToNumberString(ttbalanceNow));
             let tributesBal =  await web3.utils.fromWei(ttbalanceNow,'ether');
             console.log('Tellor Tributes balance', tributesBal); 

    /*****Get last request timestamp*******/
    for(i=1;i<52;i++){
       let count = await tellorMaster.getNewValueCountbyRequestId(i);
       let lastTime = await tellorMaster.getTimestampbyRequestIDandIndex(i, count - 1); //will this work with a zero index? (or insta hit?)


    let TimefromLastTimestamp = (Date.now())/1000 - web3.utils.hexToNumberString(lastTime);
    //console.log("TimefromLastTimestamp", TimefromLastTimestamp)
    let howlong = (TimefromLastTimestamp)/3600;

    console.log("It has been ", howlong.toFixed(2), " hours since it was last mined");
    console.log('<https://etherscan.io/address/',tellorMasterAddress,'>')
    

    if (gasP != 0 ) {
        try{
            var oracle = await new web3.eth.Contract(oracleAbi,tellorMasterAddress);
            console.log("awaitOracle");
            //sleep_s(30);
        } catch(error) {
            console.error(error);
            console.log("oracle not instantiated");
        }
        console.log("Was request sent for request id", i)
        if (howlong.toFixed(2)>24) {
        try{
            await oracle.methods.addTip(i,1).send({from: accountFrom,gas: gas_Limit,gasPrice: gasP })
            .on('transactionHash', function(hash){
                var link = "".concat('<https://etherscan.io/tx/',hash,'>' );
                var ownerlink = "".concat('<https://etherscan.io/address/',tellorMasterAddress,'>' );
                 console.log('Yes, a request was sent for request id', i);
                console.log("Hash link: ", link);
                console.log("Contract link: ", ownerlink);
            })

            .on('error', console.error); // If there's an out of gas error the second parameter is the receipt.

        } catch(error) {
        console.error(error);
        }
        } else {
            console.log("No, no request was sent for request id" ,i)
        }

    } 

    } //for loop

    } catch(error) {
         console.error(error);
         }

  } 


    process.exit()

}

