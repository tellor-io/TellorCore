/**
* Deploy Libraries
*/

function sleep_s(secs) {
  secs = (+new Date) + secs * 1000;
  while ((+new Date) < secs);
}
// truffle-flattener ./contracts/Tellor.sol > ./flat_files/Tellor_flat.sol
// truffle exec scripts/01_DeployTellor.js --network rinkeby
// const Web3 = require('web3');
// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

const TellorFund = artifacts.require("./TellorFund.sol");
const TellorTransfer = require("usingtellor/build/contracts/TellorTransfer.json")
const TellorGettersLibrary = require("usingtellor/build/contracts/TellorGettersLibrary.json")
const TellorLibrary = require("usingtellor/build/contracts/TellorLibrary.json")


const TellorMaster = require("usingtellor/build/contracts/TellorMaster.json")
const Tellor = require("usingtellor/build/contracts/Tellor.json")

const UserContract = require("usingtellor/build/contracts/UserContract.json")
const UsingTellor = require("usingtellor/build/contracts/UsingTellor.json")
const OracleIDDescriptions = require("usingtellor/build/contracts/OracleIDDescriptions.json")

var calls = 0;
var _date = Date.now()/1000- (Date.now()/1000)%86400;
var bytes = "0x0d7effefdb084dfeb1621348c8c70cc4e871eba4000000000000000000000000";


advanceTime = (time) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [time],
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err); }
            return resolve(result);
        });
    });
}
module.exports =async function(callback) {
    let oracle, event, _endDate
    let master
    let tellor
    let userContract
    let usingTellor
    let tellorOracle
    let tellorFallbackOracle
    let tellorOracleFactory
    let tellorFallbackOracleFactory
    let tellorTransfer
    let tellorGettersLibrary
    let tellorLibrary 
    let tellorFund
    let factory
    let oracleIDDescriptions

        _endDate = ((_date - (_date % 86400000))/1000) + 86400 + (86400 * 4 * calls);
        calls = calls + 1
        /**********Start: Manually Deploy Tellor*******************************/
        //Deploy TellorTransfer library
        let t = await new web3.eth.Contract(TellorTransfer.abi)
        let tellorTransfer = await t.deploy({data:TellorTransfer.bytecode}).send({from:accounts[0], gas:3000000})
        t = await new web3.eth.Contract(TellorGettersLibrary.abi)
        //Deploy TellorGetters library
        tellorGettersLibrary  =await t.deploy({data:TellorGettersLibrary.bytecode}).send({from:accounts[0], gas:3000000})
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
        //Link Tellor to TellorLibrary 
        mainBytes = mainBytes.replace(
          /_+TellorLibrary_+/g,
          tellorLibrary._address.replace("0x", "")
        );
        //Deploy Tellor
        t = await new web3.eth.Contract(Tellor.abi)
        tellor  =await t.deploy({data:mainBytes}).send({from:accounts[0], gas:5000000})
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
        //Deploy TellorMaster
        t = await new web3.eth.Contract(TellorMaster.abi)
        master = await t.deploy({data:masterBytes,arguments:[tellor._address]}).send({from:accounts[0], gas:4000000})
        /**********End: Manually Deploy Tellor*******************************/

  // // deploy dispute
  // dispute = await TellorDispute.new();
  // console.log('TellorDispute address:', dispute.address);
  // console.log('Use TellorTransfer and TellorDispute addresses to link library in TellorStake json file');
  // sleep_s(10);

  // // deploy stake
  // stake = await TellorStake.new();
  // console.log('TellorStake address:', stake.address);
  // sleep_s(10);

  // // deploy getters lib
  // getters = await TellorGettersLibrary.new();
  // console.log('TellorGettersLibrary address:', getters.address);
  // console.log('Use TellorTransfer, TellorDispute and TellorStake addresses to link library in TellorLibrary json file');
  // sleep_s(10);

  // // deploy lib

  // tellorLib = await TellorLibrary.new();
  // console.log('TellorLib address:', tellorLib.address);
  // console.log('Use TellorTransfer, TellorDispute,TellorStake, TellorLibrary addresses to link library in Tellor json file');
  // sleep_s(10);

  // // deploy tellor
  // tellor = await Tellor.new();
  // console.log('Tellor address:', tellor.address);
  // console.log('Use TellorTransfer, TellorGettersLibrary,TellorStake addresses to link library in TellorMaster json file');
  // sleep_s(10);

  // // deploy tellor master
  // tellorMaster = await TellorMaster(Tellor.address);
  // console.log('TellorMaster address:', tellorMaster.address);

}
