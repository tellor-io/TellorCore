const BN = require('bn.js');
        console.log(1)
/*var TellorMaster = artifacts.require("./TellorMaster.sol");
var Tellor = artifacts.require("./Tellor.sol");
var tellorAbi = Oracle.abi;
var tellorByte = Oracle.bytecode;*/
const Web3 = require('web3');
        console.log(2)


const TellorTransfer = require("../build/contracts/TellorTransfer.json")
        console.log(3)
const TellorDispute = require("../build/contracts/TellorDispute.json")
        console.log(4)
const TellorStake = require("../build/contracts/TellorStake.json")
console.log(5)
const TellorGettersLibrary = require("../build/contracts/TellorGettersLibrary.json")
console.log(6)
const TellorLibrary = require("../build/contracts/TellorLibrary.json")

console.log(7)
const TellorMaster = require("../build/contracts/TellorMaster.json")
console.log(8)
const Tellor = require("../build/contracts/Tellor.json")


console.log(9)

//Mainnet
// var tellorMasterAddress = '0x0Ba45A8b5d5575935B8158a88C631E9F9C95a2e';
// var multi = '';

//Rinkeby
const tellorMasterAddress = "0x3f1571E4DFC9f3A016D90e0C9824C56fD8107a3e";
var multi = '0x2F51C4Bf6B66634187214A695be6CDd344d4e9d1';

function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}


//Deploy old Tellor
module.exports = async function(callback) {
console.log('vars')
    let master
    let tellor
    let tellorTransfer
    let tellorDispute
    let tellorStake
    let tellorLibrary 
    let tellorGettersLibrary
    console.log("end vars")

        /**********Start: Manually Deploy Tellor*******************************/
        //Deploy TellorTransfer library
        let t = await new web3.eth.Contract(TellorTransfer.abi)
        console.log(10)
        tellorTransfer  =await t.deploy({data:TellorTransfer.bytecode}).send({from:accounts[0], gas:3000000})  
        console.log(1)
        t = await new web3.eth.Contract(TellorGettersLibrary.abi)
        //Deploy TellorGetters library
        tellorGettersLibrary  =await t.deploy({data:TellorGettersLibrary.bytecode}).send({from:accounts[0], gas:3000000})
        console.log(2)
        //Link TellorTransfer to TellorDispute
        var libBytes = TellorDispute.bytecode.replace(
          /_+TellorTransfer_+/g,
          tellorDispute._address.replace("0x", "")
        );

        //Deploy TellorDispute library
        tellorDispute  =await t.deploy({data:TellorDispute.bytecode}).send({from:accounts[0], gas:3000000})
        

        //Link TellorTransfer to TellorStake
        var libBytes = TellorStake.bytecode.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );

        //Link TellorDispute to TellorStake
        var libBytes = TellorStake.bytecode.replace(
          /_+TellorDispute_+/g,
          tellorDispute._address.replace("0x", "")
        );

        //Deploy TellorStake library
        tellorStake  =await t.deploy({data:TellorStake.bytecode}).send({from:accounts[0], gas:3000000})
        

        //Link TellorLibary to TellorTransfer
        var libBytes = TellorLibrary.bytecode.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        //Deploy TellorLibary
        t = await new web3.eth.Contract(TellorLibrary.abi)
        tellorLibrary  =await t.deploy({data:libBytes}).send({from:accounts[0], gas:5000000})
        
        //Link Tellor to TellorTranfer
        var mainBytes = Tellor.bytecode.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );
        console.log("TellorTransfer", tellorTransfer._address )

        //Link Tellor to TellorDispute
        var mainBytes = Tellor.bytecode.replace(
          /_+TellorDispute_+/g,
          tellorDispute._address.replace("0x", "")
        );
        console.log("TellorDispute", tellorDispute._address )

        //Link Tellor to TellorStake
        var mainBytes = Tellor.bytecode.replace(
          /_+TellorStake_+/g,
          tellorStake._address.replace("0x", "")
        );
        console.log("TellorStake", tellorStake._address )

        //Link Tellor to TellorLibrary 
        mainBytes = mainBytes.replace(
          /_+TellorLibrary_+/g,
          tellorLibrary._address.replace("0x", "")
        );
        console.log("TellorLibrary", tellorLibrary._address )


        //Deploy Tellor
        t = await new web3.eth.Contract(Tellor.abi)
        tellor  =await t.deploy({data:mainBytes}).send({from:accounts[0], gas:5000000})
        /**********End: Manually Deploy Tellor*******************************/

        /**********Start: Manually Deploy Tellor Master*******************************/
        
        //Link TellorMaster to TellorGettersLibrary
        var masterBytes = TellorMaster.bytecode.replace(
          /_+TellorGettersLibrary_+/g,
          tellorGettersLibrary._address.replace("0x", "")
        );

        //Link TellorMaster to TellorTransfer library
        masterBytes = masterBytes.replace(
          /_+TellorTransfer_+/g,
          tellorTransfer._address.replace("0x", "")
        );

        //Link TellorMaster to TellorStake library
        masterBytes = masterBytes.replace(
          /_+TellorStake_+/g,
          tellorStake._address.replace("0x", "")
        );

        //Deploy TellorMaster
        t = await new web3.eth.Contract(TellorMaster.abi)
        master  =await t.deploy({data:masterBytes,arguments:[tellor._address]}).send({from:accounts[0], gas:4000000})
        
        /**********End: Manually Deploy Tellor Master*******************************/

}

//50 PSRs
module.exports = function() {

  async function requestData() {
    let ins = await Tellor.at(tellorMasterAddress);
    let ins2 = await TellorMaster.at(tellorMasterAddress);

    for(i=4;i<51;i++){
           let req = 'PSR' + i
           console.log(req)
           await ins.requestData(req,req,10,0)
           console.log('sent req',i)
        } 

    }
  
  requestData();
}


//Deploy New Tellor
module.exports = async function(callback) {
//use Deploy old tellor if it runs

}

//Change Deity
module.exports = async function(callback) {
    let ins = await TellorMaster.at(tellorMasterAddress);
    await inst.changeDeity(multis);
    console.log("Deity changed to", multis)
}

//Upgrade TellorContractAddress
module.exports = async function(callback) {
    let ins = await TellorMaster.at(tellorMasterAddress);
    await inst.changeTellorContract(tellorContractAddress);
    console.log("tellorContractAddress changed to", tellorContractAddress)


}