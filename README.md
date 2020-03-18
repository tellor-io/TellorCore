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

Documentation for implementing Tellor into your project, become a miner and learn how Tellor works is available at:  [tellor.readthedocs.io/en/latest/](https://tellor.readthedocs.io/en/latest/). Quick references are included below: 

* <b>Implement Tellor into your project</b>

1. Use npm to istall the [usingTellor](https://github.com/tellor-io/usingtellor) repo.

```bash
npm install usingTellor
```

2. Import UsingTellor.sol into your smart contract and ensure your contract inherits from it by adding "is UsingTellor".

3. Pass through the user contract address (
[0x09459fdafD6Fdce14E04B3487A656FBca0b953ea](https://etherscan.io/address/0x09459fdafd6fdce14e04b3487a656fbca0b953ea#code) ) in your constructor. See example below:

```solidity
pragma solidity ^0.5.0;

import './UsingTellor.sol';
import '../TellorMaster.sol';
import '../Tellor.sol';

contract YourContract is UsingTellor{
 ...
    constructor(address _userContract) UsingTellor(_userContract) public{

    }   

    function getFirstUndisputedValueAfter(uint _timestamp) public view returns(bool,uint, uint _timestampRetrieved){
        uint _count = timestamps.length;
        if(_count > 0){
                for(uint i = _count;i > 0;i--){
                    if(timestamps[i-1] >= _timestamp && disputedValues[timestamps[i-1]] == false){
                        _timestampRetrieved = timestamps[i-1];
                    }
                }
                if(_timestampRetrieved > 0){
                    return(true,getMyValuesByTimestamp(_timestampRetrieved),_timestampRetrieved);
                }
        }
        return(false,0,0);
    }   
 ...
}
```


* <b>Become a miner</b>

    * [Become Setup](https://tellor.readthedocs.io/en/latest/MinerSetup/)

    * [Miner Implentation from source](https://tellor.readthedocs.io/en/latest/MinerSetupFromSource/)

* <b>General Tellor Developer's [Documentation](https://tellor.readthedocs.io/en/latest/DevDocumentation/)</b>


### Useful Links

Metamask - www.metamask.io 
<br>
Truffle - http://truffleframework.com/


#### Maintainers <a name="maintainers"> </a> 
[@themandalore](https://github.com/themandalore)
<br>
[@brendaloya](https://github.com/brendaloya) 


#### How to Contribute<a name="how2contribute"> </a>  
Join our Discord or Telegram:
[<img src="./public/telegram.png" width="24" height="24">](https://t.me/tellor)
[<img src="./public/discord.png" width="24" height="24">](https://discord.gg/zFcM3G)

Check out our issues log here on Github or contribute to our future plans to build a better miner and more examples of data secured by Tellor. 


#### Contributors<a name="contributors"> </a>

This repository is maintained by the Tellor team - [www.tellor.io](https://www.tellor.io)


#### Copyright

Tellor Inc. 2019
