<p align="center">
  <a href='https://www.tellor.io/'>
    <img src= './public/Tellor.png' width="200" height="200" alt='tellor.io' />
  </a>
</p>

<p align="center">
  <a href='https://deriveth.slack.com/'>
    <img src= ./public/Chat-Slack-blue.svg alt='Slack' />
  </a>
  <a href='https://t.me/daxiachat'>
    <img src= ./public/Chat-Telegram-blue.svg alt='Telegram DaxiaChat' />
  </a>
  <a href='https://twitter.com/DaxiaOfficial'>
    <img src= 'https://img.shields.io/twitter/url/http/shields.io.svg?style=social' alt='Twitter DaxiaOfficial' />
  </a> 
</p>

## Table of Contents
*  [Documentation](#Documentation)
    * [Operator Setup](#operator-setup)
      * [Testing](#testing)
    * [User functions](#user-fx)
    * [Miner function](#miner-fx)
    * [Contracts Description](#Contracts-Description)
    * [Scripts Description](#Scripts-Description)

 <details><summary>Contributing information</summary>

   * [Maintainers](#Maintainers)
   * [How to Contribute](#how2contribute)
   * [Copyright](#copyright)
 </details>

## Documentation <a name="Documentation"> </a>  
The documentation is broken down into four parts: steps for setting up, quick instructions for setting up and test using Truffle, users' and miners' functions, contracts' descriptions, and scripts' (javascript) descriptions.


### Operator Setup <a name="operator-setup"> </a>  
The setup documentation is noted for acting as the operator. Specific contract details are laid out for ease of use regardless of dev environment. 

**Step 1: Operator - Deploy Tellor.sol**  
The first deployed Tellor.sol.

```solidity
Tellor();
TellorMaster(Tellor.address); //where the tellor.address is the address of the deployed Tellor() above.
```
Congrats!!

<!---

  $ npm install tellor

On contracts use “is usingTellor” to access these functions: requestData, retreiveData,  getLastQuery.
-->

### Instructions for quick start with Truffle Deployment <a name="Quick-Deployment"> </a> 
Follow the steps below to launch the Oracle contracts using Truffle. 

1. Open two terminals.

2. On one terminal run:
    Clone the repo, cd into it, and then run:

    $ npm install

    $ truffle compile

    $ truffle migrate

    $ truffle exec scripts/01_DeployTellor.js

#### Testing through Truffle<a name="testing"> </a>

3. On the second terminal run:
```solidity
   $ ganache-cli -m "nick lucian brenda kevin sam fiscal patch fly damp ocean produce wish"
```
4. On the first terminal run: 
```solidity
    $   truffle test
```
5. And wait for the message 'START MINING RIG!!'

6. Kick off the python miner file [./miner/testMinerB.py](./miner/testMinerB.py). If you are using Sublime text editor, open the python miner and press Ctrl + B at the same time to start the miner.

Production and test python miners are available under the miner subdirectory [here](./miner/). You will need to get at least 5 miners running.

### User functions <a name="user-fx"> </a>  
Once the operator deploys the Tellor Oracle. Users can buy the ERC-20 Tellor Tributes (TT) token via an exchange or mine them.

To request data, users will need Tributes to call this function:
* <b>requestData</b> function allows the user to specify the API, timestamp and tip (this can be thought of as “gas”, the higher the tip/payout the higher the probability it will get mined next) for the value they are requesting.  If multiple parties are requesting the same data at the same time, their tips are combined to further incentivize miners at that time period and/or API. 

```javascript
oracle.requestData(string s_api, uint _timestamp, uint _tip)
```
* s_apiId -- is the API string
* \_timestamp -- is the unix timestamp 
* \_tip -- is the tip for miners

To read data, users will need to call these two functions: 
* <b>retreiveData</b> function allows the user to read the data for the given API and timestamp
```javascript
oracle.retrieveData(uint _apiId, uint _timestamp)
```
where:
* \_apiId -- is the API ID
* \_timestamp -- is the unix timestamp to retrieve a value from

* <b>getLastQuery</b> function allows the user to read data from the latest API and timestamp mined. 
```javascript
oracle.getLastQuery()
```

This is an example of a function that would need to be added to a contract so that it can read data from an oracle contact if the contract holds Tributes:

contract Oracle is usingTellor {
             ...
  function getLastValue() public returns(uint,bool) {
    (value,ifRetrieve)  = getLastQuery();
                           return (value, ifRetreive);
             ...
  }

### Miner functions <a name="miner-fx"> </a>  
Miners engage in a POW competition to find a nonce which satisfies the requirement of the challenge.  The first five miners who solve the PoW puzzle provide the nonce, API ID, and value and receive native tokens in exchange for their work.  The oracle data submissions are stored in contract memory as an array - which is subsequently operated upon to derive the median value and the miner payout. 

Miners need to extract the current challenge, API ID and difficulty by calling the getVariables function before they can begin solving the PoW.

```javascript
oracl.getVariables()
```

The getVariables solidity function returns all the necessary variables. 
```solidity
    function getVariables() external view returns(bytes32, uint, uint){    
        return (currentChallenge,miningApiId,difficulty);
    }
```

Miners can use the proofOfWork function to submit the PoW, API ID, and off-chain value. Production and test python miners are available under the miner subdirectory [here](./miner/).  The PoW challenge is different than the regular PoW challenge used in Bitcoin. 

```javascript
oracle.proofOfWork(string calldata nonce, uint _apiId, uint value)
```
where 
* nonce -- is the string submitted by miner
* \_apiId -- is the API ID for the API on queue
* value -- is the value of api query

In the future, we plan to switch to a GPU miner (not built on python) but this will suffice for now for the proof of concept.

### Contracts Description <a name="Contracts-Description"> </a>
* <b>Oracle.sol</b> -- is the Oracle contract. Only one contract is deployed. Oracle is OracleToken and OracleToken is Token. The Oracle.sol allows miners to submit the proof of work and value, sorts the values, pays the miners, allows the data users to request data and "tip" the miners for providing values, allows the users to retrieve and dispute the values.
    * <b>OracleToken.sol</b> --contains specialized transfer functions
    * <b>Token.sol</b> -- contains all the staking and ERC20 token functionality for the Tellor Tributes


### Scripts Description <a name="Scripts-Description"> </a>

* <b>01_DeployTellor.js</b> -- deploys the Oracle.sol


#### Maintainers <a name="maintainers"> </a> 
[@themandalore](https://github.com/themandalore)
<br>
[@brendaloya](https://github.com/brendaloya) 


#### How to Contribute<a name="how2contribute"> </a>  
Join our slack, shoot us an email or contact us: [<img src="./public/slack.png" width="24" height="24">](https://deriveth.slack.com/)
[<img src="./public/telegram.png" width="24" height="24">](https://t.me/ddaorg)
[<img src="./public/discord.png" width="24" height="24">](https://discordapp.com/invite/xtsdpbS)

Check out or issues log here on Github or contribute to our future plans to implement a GPU miner (not built in python), provide a way to pay in Ether for data, and improve our reward/incentives mechanism. 

Any contributions are welcome!

#### Copyright

DDA Inc. 2018