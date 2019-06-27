// pragma solidity ^0.5.0;

// import './Optimistic.sol';
// /**
// * @title Reader
// * This contracts is a pretend contract using Tellor that compares two time values
// */
// contract Reader is Optimistic{

// 	uint public startDateTime;
// 	uint public endDateTime;
// 	uint public startValue;
// 	uint public endValue;
// 	bool public longWins;
// 	bool public contractEnded;
// 	event ContractSettled(uint _svalue, uint _evalue);

// 	constructor(address _userContract, uint _disputeFeeRequired, uint _disputePeriod, uint[] memory _requestIds, uint _granularity) Optimistic(_userContract,_disputeFeeRequired,_disputePeriod, _requestIds,_granularity) public {}

// 	function testContract(uint _duration) external {
// 		startDateTime = now - now % granularity;
// 		endDateTime = now - now % granularity + _duration;
// 	}

// 	function settleContracts() external{
// 		bool _didGet;
// 		uint _time;
// 		if(getIsValue(startDateTime)){
// 			(_didGet, startValue, _time) = getFirstUndisputedValueAfter(startDateTime);
// 			if(_didGet && getIsValue(endDateTime)){
// 				(_didGet, endValue, _time) = getFirstUndisputedValueAfter(endDateTime);
// 				if(_didGet){
// 					if(endValue > startValue){
// 						longWins = true;
// 					}
// 					contractEnded = true;
// 					emit ContractSettled(startValue, endValue);
// 				}

// 			}
// 		}
// 	}
// }