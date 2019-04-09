/** 
* This tests the oracle functions, including mining.
*/
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');  
const helper = require("./helpers/test_helpers");
const TellorMaster = artifacts.require("./TellorMaster.sol");
const Oracle = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;

var api = "json(https://api.gdax.com/products/BTC-USD/ticker).price";
var api2 = "json(https://api.gdax.com/products/ETH-USD/ticker).price";
function promisifyLogWatch(_contract,_event) {
  return new Promise((resolve, reject) => {
    web3.eth.subscribe('logs', {
      address: _contract.options.address,
      topics: [web3.utils.sha3(_event)]
      //topics:  ['0x1c59b53c2f787064c7f5aae431916a0600db3a76bb4029c09e24fe8313042674']
    }, (error, result) => {
        if (error){
          console.log('Error',error);
          reject(error);
        }
        web3.eth.clearSubscriptions();
        //console.log(result);
        resolve(result);
    })
  });
}

contract('Mining Tests', function(accounts) {
  let oracle;
  let oracle2;
  let logNewValueWatcher;
  let logMineWatcher;

    beforeEach('Setup contract for each test', async function () {
    	//old form
    	// oracle = await Oracle.new();
    	// oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);///will this instance work for logWatch? hopefully...
       
        oracleBase = await Oracle.new();
        oracle = await TellorMaster.new(oracleBase.address);
        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);///will this instance work for logWatch? hopefully...
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000, data: web3.utils.keccak256("initStake()")})
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,0).encodeABI()})
    });

    
    /*it("getStakersCount", async function(){
        let count = await oracle.stakerCount();
        assert(web3.utils.hexToNumberString(count)==5, "count is 5");
    });

   it("getStakersInfo", async function(){
        let info = await oracle.getStakerInfo(accounts[1])
        let stake = web3.utils.hexToNumberString(info['0']);
        let startDate = web3.utils.hexToNumberString(info['1']);
        let _date = new Date();
        let d = (_date - (_date % 86400000))/1000;
        assert(d*1==startDate, "startDate is today");
        assert(stake*1 == 1, "Should be 1 for staked address");
     });
    it("getVariables", async function(){
        var vars = await oracle.getVariables()
        let miningApiId = web3.utils.hexToNumberString(vars['1']);
        let difficulty = web3.utils.hexToNumberString(vars['2']);
        let sapi = vars['3'];
        assert(miningApiId == 1, "miningApiId should be 1");
        assert(difficulty == 1, "Difficulty should be 1");
        assert.equal(sapi,api, "sapi = api");
        let _id = 1;     
    });
    
    it("Test miner", async function () {
        console.log('START MINING RIG!!');
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        console.log(logMineWatcher.data)
        res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
        assert(res[0] > 0, "value should be positive");
   });
   it("Test 5 Mines", async function () {
        for(var i = 0;i < 5;i++){
            logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,0).encodeABI()});
        }
        res = web3.eth.abi.decodeParameters(['uint256','uint256'],logMineWatcher.data);
        assert(res[0] > 0, "value should be positive");
    });
  it("Test Total Supply Increase", async function () {
        initTotalSupply = await oracle.totalSupply();
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        newTotalSupply = await oracle.totalSupply();
        payout = await oracle.getUintVar(web3.utils.keccak256("payoutTotal"));
        it= await web3.utils.fromWei(initTotalSupply, 'ether');
        ts= await web3.utils.fromWei(newTotalSupply, 'ether');
        pt= await web3.utils.fromWei(payout, 'ether');            
        assert((Math.round(ts-it)) == Math.round(pt * 1.1) ,ts + "Difference should equal the payout" + Math.round(pt*1.1));
    });
    it("Test Is Data", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
        data = await oracle.isData(1,res[0]);
        assert(data == true, "Should be true if Data exist for that point in time");
    });
    it("Test Get Last Query", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
        res2 = await oracle.getLastQuery();
        assert(res2 = res[1], "Ensure data exist for the last mine value");
    });
    
    it("Test Data Read", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
        res2 = await oracle.retrieveData(1,res[0]);
        assert(res2 = res[1], "Ensure data exist for the last mine value");
    });
   it("Test Miner Payout", async function () {
        balances = []
        for(var i = 0;i<6;i++){
            balances[i] = await oracle.balanceOf(accounts[i]);
        }
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        new_balances = []
        for(var i = 0;i<6;i++){
            new_balances[i] = await oracle.balanceOf(accounts[i]);
        }
        assert((web3.utils.hexToNumberString(new_balances[5]) - web3.utils.hexToNumberString(balances[5])) == web3.utils.toWei('1', 'ether'));
        assert((web3.utils.hexToNumberString(new_balances[1]) - web3.utils.hexToNumberString(balances[1])) == web3.utils.toWei('5', 'ether'));
        assert((web3.utils.hexToNumberString(new_balances[2]) - web3.utils.hexToNumberString(balances[2])) == web3.utils.toWei('10', 'ether'));
        assert((web3.utils.hexToNumberString(new_balances[3]) - web3.utils.hexToNumberString(balances[3])) == web3.utils.toWei('5', 'ether'));
        assert((web3.utils.hexToNumberString(new_balances[4]) - web3.utils.hexToNumberString(balances[4])) == web3.utils.toWei('1', 'ether'));
        //assert((web3.utils.hexToNumberString(new_balances[4]) - web3.utils.hexToNumberString(balances[4])) == web3.utils.toWei('1.1', 'ether'));
    });
   it("Test Difficulty Adjustment", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        diff1 =await oracle.getVariables();
        assert((web3.utils.hexToNumberString(diff1[2])*1) > 1, "difficulty greater than 1");//difficulty not changing.....
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,0).encodeABI()});
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        vars = await oracle.getVariables();
        assert((web3.utils.hexToNumberString(vars[2])*1) > (web3.utils.hexToNumberString(diff1[2])*1), "difficulty should continue to move up");
    });
    it("Test didMine ", async function () {
        vars = await oracle.getVariables();
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        didMine = oracle.didMine(vars[0],accounts[1]);
        assert(didMine);
    });
    it("Test Get MinersbyValue ", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
        miners = await oracle.getMinersByValue(1, res[0]);
        assert(miners = [accounts[4],accounts[3],accounts[2],accounts[1],accounts[5]])
    });
    it("Test dev Share", async function(){
        begbal = await oracle.balanceOf(accounts[0]);
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        endbal = await oracle.balanceOf(accounts[0]);
        assert((endbal - begbal)/1e18  == 2.2, "devShare")
    }); 

    it("Test miner, alternating api request on Q and auto select", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,0).encodeABI()});
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,1).encodeABI()});  
        data = await oracle.getVariablesOnQ();
        assert(data[0] == 0, 'There should be no API on Q');
        var vars = await oracle.getVariables();
        assert(vars[1] == 1, "miningApiId should be 1");
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",0,1000,5).encodeABI()});  
        data = await oracle.getVariablesOnQ();
        assert(data[0] == 2, "API on q should be #2");
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,6).encodeABI()});
        data = await oracle.getVariablesOnQ();
        assert(data[0] == 1, "API on q should be #1");
    });
    it("Test dispute", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
        balance1 = await oracle.balanceOf(accounts[2]);
        dispBal1 = await oracle.balanceOf(accounts[1])
        blocknum = await oracle.getMinedBlockNum(1,res[0]);
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.initDispute(1,res[0],2).encodeABI()});
        count = await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()});  ;
        await helper.advanceTime(86400 * 22);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});  ;
        dispInfo = await oracle.getDisputeInfo(1);
        assert(dispInfo[0] == 1)
        assert(dispInfo[1] == res[0])
        assert(dispInfo[2] == res[1])
        assert(dispInfo[3] == true,"Dispute Vote passed")
        voted = await oracle.didVote(1, accounts[3]);
        assert(voted == true, "account 3 voted");
        voted = await oracle.didVote(1, accounts[5]);
        assert(voted == false, "account 5 did not vote");
        apid2valueF = await oracle.retrieveData(1,res[0]);
        assert(apid2valueF == 0 ,"value should now be zero this checks updateDisputeValue-internal fx  works");
        balance2 = await oracle.balanceOf(accounts[2]);
        dispBal2 = await oracle.balanceOf(accounts[1])
        assert(balance1 - balance2 == await oracle.getUintVar(web3.utils.keccak256("stakeAmt")),"reported miner's balance should change correctly");
        assert(dispBal2 - dispBal1 == await oracle.getUintVar(web3.utils.keccak256("stakeAmt")), "disputing party's balance should change correctly")
        assert(await oracle.isStaked(accounts[2])==false, "reported miner should no longer be staked")
    });
    it("Ensure Miner staked after failed dispute", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
        balance1 = await oracle.balanceOf(accounts[2]);
        dispBal1 = await oracle.balanceOf(accounts[1])
        blocknum = await oracle.getMinedBlockNum(0,res[0]);
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.initDispute(1,res[0],2).encodeABI()});
        count = await await oracle.getUintVar(web3.utils.keccak256("disputeCount"));
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[3],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()});  ;
        await helper.advanceTime(86400 * 22);
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});  ;
        balance2 = await oracle.balanceOf(accounts[2]);
        dispBal2 = await oracle.balanceOf(accounts[1])
        assert(balance2 - balance1 == await oracle.getUintVar(web3.utils.keccak256("disputeFee")),"balance1 should equal balance2")
        assert(dispBal1 - dispBal2 == await oracle.getUintVar(web3.utils.keccak256("disputeFee")))
        assert(await oracle.isStaked(accounts[2])==true, "reported miner should still be staked")
    });
    
   it("Test time travel in data -- really long timesincelastPoof and proper difficulty adjustment", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        vars = await oracle.getVariables()
        assert((web3.utils.hexToNumberString(vars[2])*1) > 1, "difficulty should be greater than 1");//difficulty not changing.....
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,0).encodeABI()});
        await helper.advanceTime(86400 * 20);
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        vars = await oracle.getVariables();
        assert((web3.utils.hexToNumberString(vars[2])*1) == 1,"difficulty should be 1 now");
    });
    it("Test 50 requests, proper booting, and mining of 5", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",0,1000,0).encodeABI()});
        console.log("10 then mine requests....");
         for(var i = 1;i <=10 ;i++){
            apix= ("api" + i);
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"t",0,1000,i).encodeABI()});
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,11).encodeABI()});
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
        data = await oracle.isData(2,res[0]);

        assert(data == true, "Should be true if Data exist for that point in time");
        console.log("10 then mine requests....");
         for(var i = 11;i <=20 ;i++){
            apix= ("api" + i);
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"test",0,1000,i).encodeABI()});
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",0,1000,21).encodeABI()});
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
        data = await oracle.isData(1,res[0]);
        assert(data == true, "Should be true if Data exist for that point in time");
        console.log("10 then mine requests....");
         for(var i = 21;i <=30 ;i++){
            apix= ("api" + i);
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"test",0,1000,i).encodeABI()});
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,31).encodeABI()});
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
        data = await oracle.isData(2,res[0]);
        assert(data == true, "Should be true if Data exist for that point in time");
        console.log("10 then mine requests....");
         for(var i = 31;i <=40 ;i++){
            apix= ("api" + i);
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"test",0,1000,i).encodeABI()});
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",0,1000,41).encodeABI()});
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
        data = await oracle.isData(1,res[0]);
        assert(data == true, "Should be true if Data exist for that point in time");
        console.log("10 then mine requests....");
         for(var i =41;i <=55 ;i++){
            apix= ("api" + i);
            await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(apix,"test",0,1000,i).encodeABI()});
        }
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,56).encodeABI()});
        vars = await oracle.getVariablesOnQ();
        let sapi = vars['2'];
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
        data = await oracle.isData(2,res[0]);
        assert(data == true, "Should be true if Data exist for that point in time");
        payoutP = await oracle.getValuePoolAt(52);
        apiIdforpayoutPoolIndex = await oracle.getpayoutPoolIndexToApiId(50);
        vars = await oracle.getVariablesOnQ();
        let apiOnQ = web3.utils.hexToNumberString(vars['0']);
        let apiPayout = web3.utils.hexToNumberString(vars['1']);
        sapi = vars['2'];
        apiIdforpayoutPoolIndex2 = await oracle.getpayoutPoolIndexToApiId(49);
        assert(apiIdforpayoutPoolIndex == 53, "position 1 should be booted"); 
        assert(sapi == "api55", "API on Q string should be correct"); 
        assert(apiPayout == 55 , "API on Q payout should be 51"); 
        assert(apiOnQ == 57, "API on Q should be 51"); 
        assert(payoutP == 50, "value at position 52 should have correct value"); 
        assert(apiIdforpayoutPoolIndex2 == 54, "position 2 should be in same place"); 
    });
    it("Test 404 api request", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData("api2.....","fail",0,1000,41).encodeABI()});
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
        assert(res[1] == 0, "Data should be zero");
    });
    it("Test Granularity in Data", async function () {
        var vars = await oracle.getVariables()
        assert(vars['4'] == 1000);
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        await web3.eth.sendTransaction({to: oracle.address,from:accounts[2],gas:7000000,data:oracle2.methods.requestData(api2,"ETH/USD",0,1,2).encodeABI()})
        vars = await oracle.getVariables()
        assert(vars['4']==1 );
    });
    */
    
        it("Test Throw on Multiple Disputes", async function () {
        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)     
        balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[4]}));
        blocknum = await oracle.getMinedBlockNum(1,res[0]);
        await  web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.initDispute(1,res[0],2).encodeABI()});
        await helper.expectThrow(web3.eth.sendTransaction({to: oracle.address,from:accounts[1],gas:7000000,data:oracle2.methods.initDispute(1,res[0],2).encodeABI()}));
        let miners =await oracle.getMinersByValue(1,res[0]);
        let _var = await oracle.getDisputeHashToId( web3.utils.soliditySha3({t:'address',v:miners[2]},{t:'uint256',v:1},{t:'uint256',v:res[0]}));
        console.log(_var);
        assert(_var == 1, "hash should be same");
    });
  
    /*it("Test Dispute of different miner Indexes", async function () {
        for(var i = 0;i<4;i++){
        	var k;
        	var j;
        	if(i>0){
        		j = i -1;
        		if(j>0){
	        		k = j -1;
	        	}
	        	else{
	        		k = 4;
        		}
        	}
        	else{
        		j = 4;
        		k = j -1;
        	}
	        oracle = await TellorMaster.new(oracleBase.address);
	        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);///will this instance work for logWatch? hopefully...
	        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000, data: web3.utils.keccak256("initStake()")})
	        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,0).encodeABI()})
	        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
	        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
	        let miners =await oracle.getMinersByValue(1,res[0]);
	        await  web3.eth.sendTransaction({to: oracle.address,from:miners[j],gas:7000000,data:oracle2.methods.initDispute(1,res[0],i).encodeABI()});
	        let disputeVars = await oracle.getAllDisputeVars(1);
	        let vals = await oracle.getSubmissionsByTimestamp(1,res[0]);
	        console.log(disputeVars['0'],web3.utils.soliditySha3({t:'address',v:miners[i]},{t:'uint256',v:1},{t:'uint256',v:res[0]}) )
	        assert(disputeVars['0'] == web3.utils.soliditySha3({t:'address',v:miners[i]},{t:'uint256',v:1},{t:'uint256',v:res[0]}),"hash Should be correct");
	        assert(disputeVars['1'] == false);
	        assert(disputeVars['2'] == false);
	        assert(disputeVars['5'] == miners[j], "reporter should be correct");
	        assert(disputeVars['6'][0] == 1)
	        assert(disputeVars['6'][1] == res[0], "timestamp should be correct")
	        assert(disputeVars['6'][2] -  vals[i] == 0, "value should be correct")
	        assert(disputeVars['6'][4] == 0)
	        assert(disputeVars['6'][6] == i, "index should be correct")
	        assert(disputeVars['6'][7] == 0)
	        assert(disputeVars['7'] == 0, "Tally should be correct")
	        balance1 = await oracle.balanceOf(miners[i]);
	        assert(disputeVars['4'] == miners[i],"miner should be correct")
	        await web3.eth.sendTransaction({to: oracle.address,from:miners[k],gas:7000000,data:oracle2.methods.vote(1,true).encodeABI()});
	        await helper.advanceTime(86400 * 22);
	        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
	        if(i==2){
	        	assert(await oracle.isInDispute(1,res[0]) == true)
	        }
	        else{
	        	assert(await oracle.isInDispute(1,res[0]) == false,"isInDispute should be correct")
	        }
	         balance2 = await oracle.balanceOf(miners[i]);
	        assert(balance1 - balance2 == await oracle.getUintVar(web3.utils.keccak256("stakeAmt")),"reported miner's balance should change correctly");
	        assert(await oracle.isStaked(miners[i])==false, "reported miner should no longer be staked")
	        }

    });
    it("Test failed Dispute of different miner Indexes", async function () {
        for(var i = 0;i<4;i++){
        	var k;
        	var j;
        	if(i>0){
        		j = i -1;
        		if(j>0){
	        		k = j -1;
	        	}
	        	else{
	        		k = 4;
        		}
        	}
        	else{
        		j = 4;
        		k = j -1;
        	}
        	oracle = await TellorMaster.new(oracleBase.address);
	        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);///will this instance work for logWatch? hopefully...
	        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000, data: web3.utils.keccak256("initStake()")})
	        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.requestData(api,"BTC/USD",0,1000,0).encodeABI()})
	        logMineWatcher = await promisifyLogWatch(oracle2, 'NewValue(uint256,uint256,uint256,uint256)');//or Event Mine?
	        res = web3.eth.abi.decodeParameters(['uint256','uint256','uint256'],logMineWatcher.data)
	        let miners =await oracle.getMinersByValue(1,res[0]);
	        await  web3.eth.sendTransaction({to: oracle.address,from:miners[j],gas:7000000,data:oracle2.methods.initDispute(1,res[0],i).encodeABI()});
	        console.log(1);
	        let disputeVars = await oracle.getAllDisputeVars(1);
	        balance1 = await oracle.balanceOf(miners[i]);
	        assert(disputeVars['4'] == miners[i],"miner should be correct")
	        await web3.eth.sendTransaction({to: oracle.address,from:miners[k],gas:7000000,data:oracle2.methods.vote(1,false).encodeABI()});
	        await helper.advanceTime(86400 * 22);
	        await web3.eth.sendTransaction({to: oracle.address,from:accounts[0],gas:7000000,data:oracle2.methods.tallyVotes(1).encodeABI()});
	        assert(await oracle.isInDispute(1,res[0]) == false)
	     	balance2 = await oracle.balanceOf(miners[i]);
	        assert(balance2-balance1 == await oracle.getUintVar(web3.utils.keccak256("disputeFee")),"reported miner's balance should change correctly");
	        assert(await oracle.isStaked(miners[i])==true, "reported miner should no longer be staked")
	     }
    });*/
});