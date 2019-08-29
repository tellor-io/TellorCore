//require('dotenv').config();
const Web3 = require('web3');
var HDWalletProvider = require("truffle-hdwallet-provider");
var fs = require('fs');

/**
*Send Oraclize query for the Eth oracle
*/

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

var _nowUTC  = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');



console.log(_nowUTC);


module.exports =async function(callback) {
/*let i = '0xb9dD5AfD86547Df817DA2d0Fb89334A6F8eDd891';
let bal = await web3.eth.getBalance(i);
console.log(i, web3.utils.fromWei(bal));*/
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
            console.log(i,minerAddress, web3.utils.fromWei(bal));
            let txnonce = await web3.eth.getTransactionCount(minerAddress);
            let pendnonce = await web3.eth.getTransactionCount(minerAddress, 'pending');
            console.log("tx", i,minerAddress,txnonce );
            console.log("tx pending",i,minerAddress,pendnonce );
            var name = "miner" + i;
            name = {miner: i,
                    txnonce: txnonce}
            var jsonName = JSON.stringify(name);
            console.log("jsonName", jsonName);
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

    for(let b = 0; b <= 1; b++){
        try{
            let minerAddress = miners[b];
            let txnonceNow = await web3.eth.getTransactionCount(minerAddress);
            let filename = "./scripts/miner" + b + ".json";
            fs.readFile(filename,'utf8', jsonName, function(err, data) {
                if (err) throw err;
                let minerInfo = JSON.parse(data);
                console.log("minerInfo", minerInfo);
            });
        
        } catch(error) {
        console.error(error);
        }
    }
    


}