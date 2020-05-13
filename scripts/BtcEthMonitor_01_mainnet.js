//require('dotenv').config();
const Web3 = require('web3');
var HDWalletProvider = require("@truffle/hdwallet-provider");
var fs = require('fs');

const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./Tellor.sol");
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;


function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}


/*var mnemonic = process.env.ETH_MNEMONIC;
var accessToken = process.env.INFURA_ACCESS_TOKEN;
var web3 = new Web3(new HDWalletProvider(mnemonic,"https://rinkeby.infura.io/v3"+ accessToken));
*/
//var mnemonic = "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish";
var web3 = new Web3(new HDWalletProvider("3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216","https://rinkeby.infura.io/v3/7f11ed6df93946658bf4c817620fbced"));

var _UTCtime  = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

//Rinkeby
var tellorMasterAddress = '0xFe41Cb708CD98C5B20423433309E55b53F79134a' ;
var reqAddress = '0xe010ac6e0248790e08f42d5f697160dedf97e024';

//var tellorMasterAddress = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e5';

console.log(_UTCtime);


module.exports =async function(callback) {
    let tellorMaster = await TellorMaster.at(tellorMasterAddress);  
        try{

             let balNow = await web3.eth.getBalance(reqAddress);
             console.log("Requests Address", reqAddress);
             console.log("Miner ETH Balance",  web3.utils.fromWei(balNow,'ether'));
             let ttbalanceNow = await tellorMaster.balanceOf(reqAddress);
             //console.log('Tellor Tributes balance', web3.utils.hexToNumberString(ttbalanceNow));
             let tributesBal =  await web3.utils.fromWei(ttbalanceNow,'ether');
             console.log('Tellor Tributes balance', tributesBal); 

    /*****Get BTC last request*******/
    let btcCount = await tellorMaster.getNewValueCountbyRequestId(2);
    let btc = await tellorMaster.getTimestampbyRequestIDandIndex(2, btcCount - 1); //will this work with a zero index? (or insta hit?)
    //console.log("btc", web3.utils.hexToNumberString(btc))
    let btcDat =  await tellorMaster.retrieveData(2, btc);
    console.log("btcDat", web3.utils.hexToNumberString(btcDat))


   let btcLast = web3.utils.hexToNumberString(btc)*1000
   //console.log("btc", btcLast)  
   var dt = new Date(btcLast);
   //console.log(dt); // Gives Tue Mar 22 2016 09:30:00 GMT+0530 (IST)

   dt.setTime(dt.getTime()+dt.getTimezoneOffset()*60*1000);
   //console.log(dt); // Gives Tue Mar 22 2016 04:00:00 GMT+0530 (IST)

    var offset = -240; //Timezone offset for EST in minutes.
    var btcEstDate = new Date(dt.getTime() + offset*60*1000);
    console.log("Last Mine Time BTC", btcEstDate);

    let BtcTimefromLastTimestamp = (Date.now())/1000 - web3.utils.hexToNumberString(btc);
    //console.log("TimefromLastTimestamp", TimefromLastTimestamp)
    let btcHowlong = (BtcTimefromLastTimestamp)/3600;
    //console.log("BtcHowlong", btcHowlong)

    /*****END Get BTC last request*******/

    /*****Get ETH last request*******/
    let ethCount = await tellorMaster.getNewValueCountbyRequestId(1);
    let eth = await tellorMaster.getTimestampbyRequestIDandIndex(1, ethCount - 1); //will this work with a zero index? (or insta hit?)
    let ethDat =  await tellorMaster.retrieveData(1, eth);
    console.log("ethDat", web3.utils.hexToNumberString(ethDat))


    let ethLast = web3.utils.hexToNumberString(eth)*1000
    var dte = new Date(ethLast);
    //console.log(dt); // Gives Tue Mar 22 2016 09:30:00 GMT+0530 (IST)

    dte.setTime(dte.getTime()+dte.getTimezoneOffset()*60*1000);
    //console.log(dt); // Gives Tue Mar 22 2016 04:00:00 GMT+0530 (IST)


    var ethEstDate = new Date(dte.getTime() + offset*60*1000);
    console.log("Last Mine Time ETH", ethEstDate);


    let EthTimefromLastTimestamp = (Date.now())/1000 - web3.utils.hexToNumberString(eth);
    let ethHowlong = (EthTimefromLastTimestamp)/3600;
    //console.log("EthHowlong", ethHowlong)

    /*****END Get ETH last request*******/


    console.log("It has been ", ethHowlong.toFixed(2), " hours since ETH was last mined");
    console.log("It has been ", btcHowlong.toFixed(2), " hours since BTC was last mined");
    console.log('<https://rinkeby.etherscan.io/address/0xfe41cb708cd98c5b20423433309e55b53f79134a>')
    
    if (btcHowlong.toFixed(2)>12) {
        let ins = await Oracle.at(tellorMasterAddress);
        await ins.addTip(2,1)
        console.log('sent request for BTC price')
    }

    if (ethHowlong.toFixed(2)>12) {  
        let ins = await Oracle.at(tellorMasterAddress);
        await ins.addTip(2,1)
        console.log('sent request for Eth price')
    }


         } catch(error) {
         console.error(error);
         }






    process.exit()

}