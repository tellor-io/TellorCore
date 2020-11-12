<p align="center">
  <a href='https://www.tellor.io/'>
    <img src= 'https://raw.githubusercontent.com/tellor-io/TellorBrandMaterials/master/LightBkrnd_RGB.png' width="250" height="200" alt='tellor.io' />
  </a>
</p>

<p align="center">
  <a href='https://twitter.com/WeAreTellor'>
    <img src= 'https://img.shields.io/twitter/url/http/shields.io.svg?style=social' alt='Twitter WeAreTellor' />
  </a> 
</p>


## Overview <a name="overview"> </a>  
Ethereum smart contracts cannot access off-chain data. If your smart contract relies on off-chain (e.g. internet) data to evaluate or execute a function, you either have to manually feed the data to your contract, incentivize users to do it, or rely on a centralized party to provide the data.

<b>The Tellor oracle</b> is a decentralized oracle. It provides an option for contracts to securely interact with and obtain data from off-chain.

For more indepth information about Tellor checkout our [documenation](https://github.com/tellor-io/TellorMiner), [whitepaper](https://tellor.io/whitepaper/) and [FAQ](https://tellor.io/faq/) page. 

Quick references are included below: 

* <b>Implement Tellor into your project</b>

1. Use npm to install the [usingTellor](https://github.com/tellor-io/usingtellor) repo.

```bash
npm install usingtellor
```

2. Import UsingTellor.sol into your smart contract and ensure your contract inherits from it by adding "is UsingTellor".

3. Pass through the user contract address (
[0x09459fdafD6Fdce14E04B3487A656FBca0b953ea](https://etherscan.io/address/0x09459fdafd6fdce14e04b3487a656fbca0b953ea#code) ) in your constructor. See example below:

```solidity
pragma solidity ^0.5.0;

import './UsingTellor.sol';

contract YourContract is UsingTellor{
 ...
    constructor(address _userContract) UsingTellor(_userContract) public{

    }   
    /**
    * @dev Allows the user to get the latest value for the requestId specified
    * @param _requestId is the requestId to look up the value for
    * @return bool true if it is able to retreive a value, the value, and the value's timestamp
    */
    function getLastValue(uint256 _requestId) public view returns (bool ifRetrieve, uint256 value, uint256 _timestampRetrieved) {
        return getCurrentValue(_requestId);
    }
 ...
}
```


* <b>Miner [Documentation](https://github.com/tellor-io/TellorMiner/)</b>

* <b>General Tellor Developer's [Documentation](https://app.gitbook.com/@tellor-2/s/tellor-docs/dev-documentation/)</b>

## Maintainers <a name="maintainers"> </a> 
This repository is maintained by the [Tellor team](https://github.com/orgs/tellor-io/people)


## How to Contribute<a name="how2contribute"> </a>  
Join our Discord or Telegram:
[<img src="./public/telegram.png" width="24" height="24">](https://t.me/tellor)
[<img src="./public/discord.png" width="24" height="24">](https://discord.gg/zFcM3G)

Check out our issues log here on Github or contribute to our future plans to build a better miner and more examples of data secured by Tellor. 

## Copyright

Tellor Inc. 2019
