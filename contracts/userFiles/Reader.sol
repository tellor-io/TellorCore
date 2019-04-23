pragma solidity ^0.5.0;

import './Tellor.sol';
/**
* @title Reader
* This contracts is a pretend contract using Tellor that compares two time values
*/
contract Reader is Optimistic{

	uint public startDateTime;
	uint public endDateTime;
	uint public startValue;
	uint public endValue;
	bool public longWins;
	bool public contractEnded;


	function testContract(uint _duration){
		startDateTime = now - now % granularity;
		endDateTime = now + _duration - now % granularity;
	}

	function settleContracts(){
		if(getIsValue(startDateTime)){
			startValue =  getMyValuesByTimestamp(startDateTime);
			if(getIsValue(endDateTime)){
				endValue = getMyValuesByTimestamp(endDateTime);
				if(endValue > startValue){
					longWins = true;
				}
				contractEnded = true;
			}
		}
	}
}