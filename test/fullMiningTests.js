// /** 
// * This tests the oracle functions, including mining.
// */
// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
// const helper = require("./helpers/test_helpers");
// const TellorMaster = artifacts.require("./TellorMaster.sol");
// const Tellor = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
// var oracleAbi = Tellor.abi;
// var oracleByte = Tellor.bytecode;
// var OldTellor = artifacts.require("./oldContracts/OldTellor.sol")
// var oldTellorABI = OldTellor.abi;

// var masterAbi = TellorMaster.abi;
// var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";


// function promisifyLogWatch(_address,_event) {
//   return new Promise((resolve, reject) => {
//     web3.eth.subscribe('logs', {
//       address: _address,
//       topics: [web3.utils.sha3(_event)]
//     }, (error, result) => {
//         if (error){
//           console.log('Error',error);
//           reject(error);
//         }
//         else{
//        	resolve(result);
//     	}
//     })
//   });
// }

// contract('Mining Tests', function(accounts) {
//   let oracle;
//   let oracle2;
//   let oracle3;
//   let newOracle;
//   let master;

//     beforeEach('Setup contract for each test', async function () {
//         oldTellor = await OldTellor.new()    
//         oracle = await TellorMaster.new(oldTellor.address);
//         master = await new web3.eth.Contract(masterAbi,oracle.address);
//         oldTellorinst = await new web3.eth.Contract(oldTellorABI,oldTellor.address);
//         for(var i = 0;i<6;i++){
//             //print tokens 
//             await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.theLazyCoon(accounts[i],web3.utils.toWei('1100', 'ether')).encodeABI()})
//         }
//         for(var i=0; i<52;i++){
//             x = "USD" + i
//             apix = api + i
//             await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.requestData(apix,x,1000,52-i).encodeABI()})
//         }
//         let q = await oracle.getRequestQ();
//         //Deploy new upgraded Tellor
//         oracleBase = await Tellor.new();
//         oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);
//         await oracle.changeTellorContract(oracleBase.address)
//         for(var i = 0;i<5;i++){
//           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods['testSubmitMiningSolution(string,uint256,uint256)']("nonce",1,1200).encodeABI()})
//         }
//     });
//     console.log('START MINING RIG!!');
//     it("Test miner", async function () {
// 		var logMineWatcher = await promisifyLogWatch(oracle.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');
//         res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
//         assert(res['1'] > 0, "value should be positive");
//    });

//  	it("Test 2 Mines", async function () {
//         for(var i = 0;i < 2;i++){
//             logMineWatcher = await promisifyLogWatch(oracle.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//     	}
//         res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
//         assert(res[0] > 0, "value should be positive");
//     });
       
//   it("Test Total Supply Increase", async function () {
//         initTotalSupply = await oracle.totalSupply();
//         logMineWatcher = await promisifyLogWatch(oracle.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//         newTotalSupply = await oracle.totalSupply();
//         it= await web3.utils.fromWei(initTotalSupply, 'ether');
//         ts= await web3.utils.fromWei(newTotalSupply, 'ether');         
//         assert(ts-it >= 27,"Difference should equal the payout");
//     });

//   it("Test Total Supply decreasing increase", async function () {
//         initTotalSupply = await oracle.totalSupply();
//         logMineWatcher = await promisifyLogWatch(oracle.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//         newTotalSupply = await oracle.totalSupply();
//         it= await web3.utils.fromWei(initTotalSupply, 'ether');
//         ts= await web3.utils.fromWei(newTotalSupply, 'ether');         
//         tsChange = ts-it
//         await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",1000,0).encodeABI()})
//         initTotalSupply = await oracle.totalSupply();
//         logMineWatcher = await promisifyLogWatch(oracle.address,'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//         newTotalSupply = await oracle.totalSupply();
//         it= await web3.utils.fromWei(initTotalSupply, 'ether');
//         ts= await web3.utils.fromWei(newTotalSupply, 'ether');   
//         tsChange2 = ts-it      
//         assert(tsChange2 < tsChange,"TS change should go down");
//     });
//     it("Test Is Data", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
//         data = await oracle.getMinedBlockNum(1,res[0]);
//         assert(data > 0, "Should be true if Data exist for that point in time");
//     });
//     it("Test Get Last Query", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
//         res2 = await oracle.getLastNewValue();
//         assert(res2 = res[1], "Ensure data exist for the last mine value");
//     });
//     it("Test Data Read", async function () {
//         logMineWatcher = await promisifyLogWatch(oracle.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
//         res2 = await oracle.retrieveData(1,res[0]);
//         assert(res2 = res[1], "Ensure data exist for the last mine value");
//         res2 = await oracle.getTimestampbyRequestIDandIndex(1,0);
//         assert(res2 == res[0]);
//     });
//     it("Test Miner Payout", async function () {
//         balances = []
//         for(var i = 0;i<6;i++){
//             balances[i] = await oracle.balanceOf(accounts[i]);
//         }
//         logMineWatcher = await promisifyLogWatch(oracle.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');//or Event Mine?
//         new_balances = []
//         for(var i = 0;i<6;i++){
//             new_balances[i] = await oracle.balanceOf(accounts[i]);
//         }
//         assert((web3.utils.hexToNumberString(new_balances[5]) - web3.utils.hexToNumberString(balances[5])) < web3.utils.toWei('5', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[1]) - web3.utils.hexToNumberString(balances[1])) < web3.utils.toWei('5', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[2]) - web3.utils.hexToNumberString(balances[2])) < web3.utils.toWei('5', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[3]) - web3.utils.hexToNumberString(balances[3])) < web3.utils.toWei('5', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[4]) - web3.utils.hexToNumberString(balances[4])) < web3.utils.toWei('5', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[5]) - web3.utils.hexToNumberString(balances[5])) > web3.utils.toWei('4.99', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[1]) - web3.utils.hexToNumberString(balances[1])) > web3.utils.toWei('4.99', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[2]) - web3.utils.hexToNumberString(balances[2])) > web3.utils.toWei('4.99', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[3]) - web3.utils.hexToNumberString(balances[3])) > web3.utils.toWei('4.99', 'ether'));
//         assert((web3.utils.hexToNumberString(new_balances[4]) - web3.utils.hexToNumberString(balances[4])) > web3.utils.toWei('4.99', 'ether'));
//         //assert((web3.utils.hexToNumberString(new_balances[4]) - web3.utils.hexToNumberString(balances[4])) == web3.utils.toWei('1.1', 'ether'));
//     });
// it("Test miner upgrade", async function () {
//         oldTellor = await OldTellor.new()    
//         oracle = await TellorMaster.new(oldTellor.address);
//         master = await new web3.eth.Contract(masterAbi,oracle.address);
//         oldTellorinst = await new web3.eth.Contract(oldTellorABI,oldTellor.address);
//         for(var i = 0;i<6;i++){
//             //print tokens 
//             await web3.eth.sendTransaction({to:oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.theLazyCoon(accounts[i],web3.utils.toWei('1100', 'ether')).encodeABI()})
//         }
//         for(var i=0; i<52;i++){
//             x = "USD" + i
//             apix = api + i
//             await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oldTellorinst.methods.requestData(apix,x,1000,52-i).encodeABI()})
//         }
//         let q = await oracle.getRequestQ();
//         //Deploy new upgraded Tellor
//         oracleBase = await Tellor.new();
//         oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);
//         await oracle.changeTellorContract(oracleBase.address)
//         for(var i = 0;i<5;i++){
//           await web3.eth.sendTransaction({to:oracle.address,from:accounts[i],gas:7000000,data:oracle2.methods['submitMiningSolution(string,uint256,uint256)']("nonce",1,1200).encodeABI()})
//         }
//         await promisifyLogWatch(oracle.address, 'NewValue(uint256[5],uint256,uint256[5],uint256,bytes32)');
//         res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
//         data = await oracle.getMinedBlockNum(1,res[0]);
//         assert(data > 0, "Should be true if Data exist for that point in time");
//    })

//    it("Test limited rewards per miner", async function () {
//    	   assert(0==1)
//    });

//  });    