

const Web3 = require("web3");
const fs = require('fs');
const Tx = require('ethereumjs-tx')
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545/'))
var json = require('../build/contracts/Tellor.json');

solution = process.argv[2]
apiId = process.argv[3] - 0
value = process.argv[4] - 0


console.log('Nonce submitted: ',solution,'      ')
console.log('Value submitted: ',value,'              ')


var address = process.argv[5];
var abi = json.abi;
var account = process.argv[6];
var privateKey = new Buffer(process.argv[7], 'hex');
console.log('Presolution',solution);
//solution = web3.utils.toHex(solution);
console.log('My Solution',solution);

let myContract = new web3.eth.Contract(abi,address);
let data = myContract.methods.proofOfWork(solution,apiId,value).encodeABI();
// let rawTx = {
//     "nonce" = nonce,
//     "to": address,
//     gasLimit: web3.utils.toHex(6000000),
//     "value": "0x00",
//     "from":account,
//     "data": data,
// }
// const tx = new Tx(rawTx)
// tx.sign(privateKey)
// let serializedTx = "0x" + tx.serialize().toString('hex');


  web3.eth.getTransactionCount(account, function (err, nonce) {
     var tx = new Tx({
      nonce: nonce,
      gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
      gasLimit: 1000000,
      to: address,
      value: 0,
      data: data,
    });
    tx.sign(privateKey);

    var raw = '0x' + tx.serialize().toString('hex');
    web3.eth.sendSignedTransaction(raw).on('transactionHash', function (txHash) {
      }).on('receipt', function (receipt) {
          console.log("receipt:" + receipt);
      }).on('confirmation', function (confirmationNumber, receipt) {
          //console.log("confirmationNumber:" + confirmationNumber + " receipt:" + receipt);
      }).on('error', function (error) {
    });
  });