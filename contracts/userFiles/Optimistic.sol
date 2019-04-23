pragma solidity ^0.5.0;

import './Tellor.sol';
import './UserContract.sol';
/**
* @title UsingTellor
* This contracts creates for easy integration to the Tellor Tellor System
*/
contract Optimistic is UsingTellor{

	address public tellorStorageAddress;
	address public tellorUserContract;
	mapping(uint => bool) public isValue;
	uint[] timestamps; //timestamps with values
	mapping(uint => bool) public disputedValues;
	mapping(uint => uint[]) public requestIdsIncluded;
	address public owner;
	uint[] requestIds;
	uint public granularity;
	uint public disputeFee; //In Tributes
	uint public disputePeriod;
	mapping(uint => uint) valuesByTimestamp;


	event NewOwner(address _newOwner);
	event NewValueSet(uint indexed _timestamp, uint _value);
	event ValueDisputed(address _disputer,uint _timestamp, uint _value);

	//A list of parties who can set the values (must not be blank)
	//The off
	function constructor(address _owner, uint _disputeFeeRequired, uint _disputePeriod, uint[] _requestIds, uint _granularity){
		owner = _owner;
		disputeFee = _disputeFeeRequired;
		disputePeriod = _disputePeriod;
		granularity = _granularity;
		requestIds = _requestIds;
	}

	function transferOwnership(address _newOwner){
		require(msg.sender == owner());
		owner = _newOwner;
		emit NewOwner(_newOwner);
	}

	function setValue(uint _timestamp, uint _value){
		require(msg.sender == owner());
		require(getIsValue(_timestamp) == false);
		valuesByTimestamp[_timestamp] = _value;
		emit NewValueSet(_timestamp,_value);

	}

	function disputeOptimisticValue(uint _timestamp){
		require(tellor.balanceOf(address(this)) >= disputeFee);
		require(isValue[_timestamp]);
		require(now - now % granularity  < _timestamp + disputePeriod);
		disputedValues[_timestamp] = true;
		emit ValueDisputed(msg.sender,_timestamp,valuesByTimestamp[_timestamp]);
		getTellorValues(_timestamp);
	}


	function getMyValuesByTimestamp(uint _timestamp) external view returns(uint value){
		return valuesByTimestamp[_timestamp];
	}


	function getNumberOfValuesPerTimestamp(uint _timestamp) external view returns(uint){
			return requestIdsIncluded[_timestamp].length;
	}

	function getIsValue(uint _timestamp) external view returns(bool){
		return isValue[_timestamp];
	}

	function getTellorValues(uint _timestamp) external returns(uint _value, bool _didGet){
		//We need to get the tellor value within the granularity.  If no Tellor value is available...what then?  Simply put no Value?  
		//No basically, the dispute period for anyValue is within the granularity
		uint _retrievedTimestamp;
		uint _initialBalance = tellor.balanceOf(address(this));
		for(uint i = 0; i < requestIds.length; i++){
			//Get all timestamps for that requestId
			//Check if any is after your given timestamp
			//If yes, return that value to the .  If no, then request that Id
			_value,_didGet,_retrievedTimestamp = getFirstVerifiedDataAfter(i,_timestamp);
			if(_didGet){
				valuesByTimestamp[_retrievedTimestamp - _retrievedTimestamp % granularity] = (_value + valuesByTimestamp[_retrievedTimestamp - _retrievedTimestamp % granularity] * requestIdsIncluded[_timestamp].length) / (requestIdsIncluded[_timestamp].length + 1);
				requestIdsIncluded[_retrievedTimestamp - _retrievedTimestamp % granularity] = i;
			}
			else{
				if(tellor.balanceOf(address(this)) > requestIds.length){
					addTip(i, _initialBalance / requestIds.length);
				}
			}
		}
	}

	function getLastValueAfter(uint _timestamp) external view returns(uint){

	}

	function getLastUndisputedValueAfter(uint _timestamp) external view returns(uint){
		
	}
}

//On get last query, should be by requestId
//add a sender to each of pieces (requestData/addValuePool)
//remove requestId from requestData
//somehow be able to get the most recent tip (or payout) and that is the dispute Fee
//make sure we use SafeMath