/** 
* This contract tests the Oracle functions
*To write - testing forks, adding only owner to forks?
*/ 

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
const BN = require('bn.js');
const helper = require("./helpers/test_helpers");

const TellorStorage = artifacts.require("./TellorStorage.sol");
const Oracle = artifacts.require("./Tellor.sol"); // globally injected artifacts helper
var Reader = artifacts.require("Reader.sol");
var oracleAbi = Oracle.abi;
var oracleByte = Oracle.bytecode;

var api = 'json(https://api.gdax.com/products/BTC-USD/ticker).price';
var api2 = 'json(https://api.gdax.com/products/ETH-USD/ticker).price';

function promisifyLogWatch(_contract,_event) {
  return new Promise((resolve, reject) => {
    web3.eth.subscribe('logs', {
      address: _contract.options.address,
      topics:  ['0xba11e319aee26e7bbac889432515ba301ec8f6d27bf6b94829c21a65c5f6ff25']
    }, (error, result) => {
        if (error){
          console.log('Error',error);
          reject(error);
        }
        web3.eth.clearSubscriptions();
        resolve(result);
    })
  });
}

contract('Token and Staking Tests', function(accounts) {
  let oracle;
  let oracle2;
  let tellorStorage;
  let owner;
  let reader;
  let logNewValueWatcher;
  let logMineWatcher;
  let res0;

    beforeEach('Setup contract for each test', async function () {
        owner = accounts[0];
        //deploy tellor
        oracle = await Oracle.new();
        console.log("1");
        oracle2 = await new web3.eth.Contract(oracleAbi,oracle.address);///will this instance work for logWatch? hopefully...
        console.log("2");
        //Deploy tellorStorage
        tellorStorage= await TellorStorage.new();
        console.log("3");
        //set tellorContract on tellor storage
        await tellorStorage.setTellorContract(oracle.address);
        console.log("4");
        await oracle.initStake();
        console.log("5");
        res0 = await oracle.requestData(api,0);
        console.log("6");
        await helper.advanceTime(86400 * 8);
        console.log("7");
        let withdrawreq = await oracle.requestWithdraw({from:accounts[2]});
        console.log("8");
        await helper.advanceTime(86400 * 8);
        console.log("9");
        await oracle.withdrawStake({from:accounts[2]});
   });  
    it("Token transfer", async function(){
        balance2 = await oracle.balanceOf(accounts[2]);
        t = web3.utils.toWei('5', 'ether');
        await oracle.transfer(accounts[5],t,{from:accounts[2]});
        balance2a = await oracle.balanceOf(accounts[2]);
        balance5 = await oracle.balanceOf(accounts[5]);
        assert(web3.utils.fromWei(balance2a, 'ether') == 995, "balance for acct 2 is 995");
        assert(web3.utils.fromWei(balance5) == 1005, "balance for acct 5 is 1005");
    });

   /* it("Approve and transferFrom", async function(){
    	t = web3.utils.toWei('7', 'ether');
        await oracle.approve(accounts[1], t, {from:accounts[2]});
        balance0a = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
        await oracle.transferFrom(accounts[2], accounts[5], t, {from:accounts[1]}); 
        balance5a = await (oracle.balanceOf(accounts[5]));
        assert(web3.utils.fromWei(balance5a) == 1007, "balance for acct 5 is 1007");
    });

    it("Allowance after approve and transferFrom", async function(){
    	t = web3.utils.toWei('7', 'ether');
    	t2 = web3.utils.toWei('6', 'ether');
        await oracle.approve(accounts[1], t, {from:accounts[2]});
        balance0a = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
        await oracle.transferFrom(accounts[2], accounts[5], t2, {from:accounts[1]}); 
        balance5a = await (oracle.balanceOf(accounts[5]));
        assert.equal(web3.utils.fromWei(balance5a), 1006, "balance for acct 5 is 1006");
        allow = await oracle.allowance(accounts[2], accounts[1]);
        assert.equal(web3.utils.fromWei(allow, 'ether'), 1, "Allowance shoudl be 1 eth");
    });

    it("Total Supply", async function(){
        supply = await oracle.totalSupply();
        assert.equal(web3.utils.fromWei(supply),5000,"Supply should be 10000");
    });

    it("re-Staking without withdraw ", async function(){
    	await helper.advanceTime(86400 * 10);
        let withdrawreq = await oracle.requestWithdraw({from:accounts[1]});
        let weSender =  await withdrawreq.logs[0].args._sender;
        assert(weSender == accounts[1], "withdraw request by account 1");
        await helper.advanceTime(86400 * 10);
        assert(await oracle.isStaked(accounts[1]) == false, "is not Staked" );
        await oracle.depositStake({from:accounts[1]});
        assert(await oracle.isStaked(accounts[1]) == true, "Staked" );
    });    

    it("withdraw and re-stake", async function(){
    	await helper.advanceTime(86400 * 10);
        let withdrawreq = await oracle.requestWithdraw({from:accounts[1]});
        let weSender =  await withdrawreq.logs[0].args._sender;
        assert(weSender == accounts[1], "withdraw request by account 1");
        await helper.advanceTime(86400 * 10);
        assert(await oracle.isStaked(accounts[1]) == false, "is not Staked" );
        await oracle.withdrawStake({from:accounts[1]});
        assert(await oracle.isStaked(accounts[1]) == false, " not Staked" );
        await oracle.depositStake({from:accounts[1]}); 
        assert(await oracle.isStaked(accounts[1]) == true, " Staked" );
    }); 

    it("Attempt to transfer more than balance - stake", async function(){
        var tokens = web3.utils.toWei('1', 'ether');
        var tokens2 = web3.utils.toWei('2', 'ether');
        await oracle.transfer(accounts[1],tokens,{from:accounts[2]});
        balance1 = await (oracle.balanceOf(accounts[1],{from:accounts[2]}));
        await helper.expectThrow(oracle.transfer(accounts[1],tokens2,{from:accounts[1]}));
        balance1b = await (oracle.balanceOf(accounts[1],{from:accounts[2]}));
        assert( web3.utils.fromWei(balance1b) == 1001, "Balance should == (1000 + tokens)");
    });

    it("Attempt to Allow and transferFrom more than balance - stake", async function(){
        var tokens = web3.utils.toWei('2', 'ether');
        var tokens2 = web3.utils.toWei('3', 'ether');
        await oracle.transfer(accounts[1],tokens,{from:accounts[2]});
        balance1 = await (oracle.balanceOf(accounts[1],{from:accounts[2]}));
        await helper.expectThrow(oracle.approve(accounts[6],tokens2,{from:accounts[1]}));
        await helper.expectThrow(oracle.transferFrom(accounts[1], accounts[8],tokens2,{from:accounts[6]}));
        balance1b = await (oracle.balanceOf(accounts[1],{from:accounts[2]})); 
        assert((1000 + web3.utils.fromWei(tokens)*1) == web3.utils.fromWei(balance1)*1, "Balance for acct 1 should == 1000 + transferred amt ");
    });

    it("Attempt to withdraw before stake time is up", async function(){ 
        balance1b = await (oracle.balanceOf(accounts[1]));
        await helper.expectThrow(oracle.withdrawStake({from:accounts[1]}));
        assert(await oracle.isStaked(accounts[1]) == true, "still isStaked" );
        assert(web3.utils.fromWei(balance1b) == 1000, "Balance should equal transferred amt");
    });

    it("Staking, requestWithdraw, withdraw stake", async function(){
        let withdrawreq = await oracle.requestWithdraw({from:accounts[1]});
        let weSender =  await withdrawreq.logs[0].args._sender;
        assert(weSender == accounts[1], "withdraw request by account 1");
        await helper.advanceTime(86400 * 8);
        assert(await oracle.isStaked(accounts[1]) == false, "is not Staked" );//should the requestWitdraw change the stakeState
        await oracle.withdrawStake({from:accounts[1]});
        assert(await oracle.isStaked(accounts[1]) == false, " not Staked" );
    });

    it("getVariables", async function(){
    	let res = await oracle.requestData(api, 20, {from:accounts[2]});
        vars = await oracle.getVariables();
        let miningApiId = web3.utils.hexToNumberString(vars['1']);
        let difficulty = web3.utils.hexToNumberString(vars['2']);
        let sapi = vars['3'];
        assert(miningApiId == 1, "miningApiId should be 1");
        assert(difficulty == 1, "Difficulty should be 1");
        assert.equal(sapi,api, "sapi = api");
    }); 

    it("Get apiId", async function () {
        balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
        let res = await oracle.requestData(api, 20, {from:accounts[2]});
        let resApiId = await res.logs[2].args._apiId;
        apiHash = await oracle.getApiHash(1); 
        apiId = await oracle.getApiId(apiHash);  
        assert(web3.utils.hexToNumberString(apiId) == web3.utils.hexToNumberString(resApiId), "timestamp on Q should be apiID");
    });

    it("Get apiHash", async function () {
        balance1 = await (oracle.balanceOf(accounts[2],{from:accounts[1]}));
        let res = await oracle.requestData(api2, 20, {from:accounts[2]});
        let resApiHash = await res.logs[2].args._apiHash;
        apiHash = await oracle.getApiHash(2); 
        assert(web3.utils.hexToNumberString(apiHash) == web3.utils.hexToNumberString(resApiHash), "api on Q should be apiId");
    });*/
});
