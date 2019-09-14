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
var mnemonic = "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish";
var web3 = new Web3(new HDWalletProvider("3a10b4bc1258e8bfefb95b498fb8c0f0cd6964a811eabca87df5630bcacd7216","https://rinkeby.infura.io/v3/7f11ed6df93946658bf4c817620fbced"));

var _UTCtime  = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

//Rinkeby
var tellorMasterAddress = '0x3f1571E4DFC9f3A016D90e0C9824C56fD8107a3e' ;

console.log(_UTCtime);


module.exports =async function(callback) {

    let tellorMaster = await TellorMaster.at(tellorMasterAddress);  
    let stakerCount;
    let disputeCount;
    stakerCount = await tellorMaster.getUintVar(web3.utils.keccak256("stakerCount"));
    console.log("stakercount",  web3.utils.hexToNumberString(stakerCount));
    disputeCount = await tellorMaster.getUintVar(web3.utils.keccak256("disputeCount"));
    console.log("diputecount",  web3.utils.hexToNumberString(disputeCount));
/*    let last = await tellorMaster.getUintVar(web3.utils.keccak256("timeOfLastNewValue"));
    //console.log("Timestamp of last submitted value", web3.utils.hexToNumberString(last));
    let TimefromLastTimestamp = Date.now() - (web3.utils.hexToNumberString(last)*1000);
    let howlong = (TimefromLastTimestamp/1000)/3600;
    if (howlong > 1){
        console.log("Red Flag!!! No mining has occurred in more than 1 hour, ensure requests are being made");
        console.log("It has been ", howlong, " hours since last mined value");
    } else {
        console.log("It has been ", howlong, " hours since last mined value");
    }

   
    let _now  =  Date.now();
        //console.log("_now",_now)
    var stats = "stats";
        stats = {staker_count: stakerCount,
            dispute_count: disputeCount,
            timeChecked: _now
            }
    var jsonStats = JSON.stringify(stats);
    //console.log("Staker and Dispute counts", jsonStats);
    let filename = "./scripts/stats.json";
    fs.writeFile(filename, jsonStats, function(err) {
        if (err) {
            console.log(err);
        }
    });*/


    let miners = ['0xb9dD5AfD86547Df817DA2d0Fb89334A6F8eDd891',
    '0x230570cD052f40E14C14a81038c6f3aa685d712B'];
/*
    let mainMiners=['0xC840ba62Aab90B8cD629649822F04300Ef5D1963',
    '0x3564E17D5f6B7c9A3c6Bd6248BF7B3EeB4927e50',
    '0x4c49172a499d18ea3093d59a304eef63f9754e25',
    '0xbfc157b09346ac15873160710b00ec8d4d520c5a',
    '0xa3792188e76c55b1a649fe5df77ddd4bfd6d03db',
    '0xbaf31bbbba24af83c8a7a76e16e109d921e4182a',
    '0x8c9841feae5fc2061f2163033229ce0d9dfabc71',
    '0xc31ef608ada4003aad4d2d1ec2be72232a9e2a86'
    ];
*/
 let i;
    for(i = 0; i <= 1; i++){
        try{
            let minerAddress = miners[i];
            let bal = await web3.eth.getBalance(minerAddress);
            //console.log("Miner ETH Balance", i,minerAddress, web3.utils.fromWei(bal));
            let ttbalance = await tellorMaster.balanceOf(minerAddress);
            //console.log('Tellor Tributes balance', web3.utils.hexToNumberString(ttbalance));  
            let txnonce = await web3.eth.getTransactionCount(minerAddress);
            let pendnonce = await web3.eth.getTransactionCount(minerAddress, 'pending');
            //console.log("tx", i,minerAddress,txnonce );
            //console.log("tx pending",i,minerAddress,pendnonce );
            var _nowUTC  =  Date.now();
            //console.log("_nowUTC",_nowUTC);
            var name = "miner" + i;
            name = {miner: i,
                    txnonce: txnonce,
                    timeChecked: _nowUTC,
                    ethBalance: web3.utils.fromWei(bal),
                    tributesBalance: web3.utils.fromWei(web3.utils.hexToNumberString(ttbalance))
                }
            var jsonName = JSON.stringify(name);
            console.log("InitialMiner info", jsonName);
            let filename = "./scripts/miner" + i + ".json";
            fs.writeFile(filename, jsonName, function(err) {
                if (err) {
                    console.log(err);
                }
            });

        } catch(error) {
        console.error(error);
        }
    }

  process.exit()
}