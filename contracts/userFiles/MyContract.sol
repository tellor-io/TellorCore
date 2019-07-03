pragma solidity ^0.5.0;

import './UsingTellor.sol';
import '../TellorMaster.sol';
import '../Tellor.sol';

contract MyContract is UsingTellor{

    struct infoForTimestamp {
     	bool isValue;
     	uint valuesByTimestamp;
     }
    mapping(uint => infoForTimestamp) public infoForTimestamps;//mapping timestampt to InfoForTimestamp struct
	uint[] timestamps; //timestamps with values

	event TellorValuePlaced(uint _timestamp, uint _value);


 	constructor(address _userContract) UsingTellor(_userContract) public{
	}	

    //Congratulations!! You can use all functions within UsingTellor. Just add your contract logic//

}