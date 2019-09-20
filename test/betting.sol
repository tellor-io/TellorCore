pragma solidity ^0.5.0;


contract Betting {

	uint public startTime;
	uint public endTime;
	uint public startValue;
	uint public endValue;
	uint public longWins;
	mapping(uint => uint) valuesByTimestamp;

	constructor(uint _duration) external{
		startTime = now;
		endTime = now + _duration;
	}

	function setValue(uint _time,uint _value) external{
		valuesByTimestamp[_time] = _value;
	}

	function settleContract() external{
		require (now > endTime);
		startValue = valuesByTimestamp[startTime];
		endValue = valuesByTimestamp[endTime];
		require(startValue > 0 && endValue > 0);
		if(endValue > startValue){
			longWins;
		}
	}

}