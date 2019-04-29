pragma solidity ^0.5.0;

import './UsingTellor.sol';
import '../TellorMaster.sol';
import '../Tellor.sol';
/**
* @title UsingTellor
* This contracts creates for easy integration to the Tellor Tellor System
*/
contract Optimistic is UsingTellor{

	//Can we rework soem of these mappings into a struct?
	mapping(uint => bool) public isValue;
	uint[] timestamps; //timestamps with values
	mapping(uint => bool) public disputedValues;
	mapping(uint => uint[]) public requestIdsIncluded;
	uint[] requestIds;
	uint public granularity;
	uint public disputeFee; //In Tributes
	uint public disputePeriod;
	mapping(uint => uint) valuesByTimestamp;


	event NewValueSet(uint indexed _timestamp, uint _value);
	event ValueDisputed(address _disputer,uint _timestamp, uint _value);

	//A list of parties who can set the values (must not be blank)
	//The off
	constructor(address _userContract, uint _disputeFeeRequired, uint _disputePeriod, uint[] memory _requestIds, uint _granularity) UsingTellor(_userContract) public{
		disputeFee = _disputeFeeRequired;
		disputePeriod = _disputePeriod;
		granularity = _granularity;
		requestIds = _requestIds;
	}


	function setValue(uint _timestamp, uint _value) external{
		require(msg.sender == owner);
		require(getIsValue(_timestamp) == false);
		valuesByTimestamp[_timestamp] = _value;
		isValue[_timestamp] = true;
		timestamps.push(_timestamp);
		emit NewValueSet(_timestamp,_value);

	}

	function disputeOptimisticValue(uint _timestamp) external{
		TellorMaster _tellor = TellorMaster(tellorUserContract.tellorStorageAddress());
		require(_tellor.balanceOf(address(this)) >= disputeFee);
		require(isValue[_timestamp]);
		require(now - now % granularity  < _timestamp + disputePeriod);
		disputedValues[_timestamp] = true;
		emit ValueDisputed(msg.sender,_timestamp,valuesByTimestamp[_timestamp]);
		getTellorValues(_timestamp);
	}


	function getMyValuesByTimestamp(uint _timestamp) public view returns(uint value){
		return valuesByTimestamp[_timestamp];
	}


	function getNumberOfValuesPerTimestamp(uint _timestamp) external view returns(uint){
			return requestIdsIncluded[_timestamp].length;
	}

	function getIsValue(uint _timestamp) public view returns(bool){
		return isValue[_timestamp];
	}

	function getTellorValues(uint _timestamp) public returns(uint _value, bool _didGet){
		//We need to get the tellor value within the granularity.  If no Tellor value is available...what then?  Simply put no Value?  
		//No basically, the dispute period for anyValue is within the granularity
		TellorMaster _tellor = TellorMaster(tellorUserContract.tellorStorageAddress());
		Tellor _tellorCore = Tellor(tellorUserContract.tellorStorageAddress());
		uint _retrievedTimestamp;
		uint _initialBalance = _tellor.balanceOf(address(this));
		for(uint i = 0; i < requestIds.length; i++){
			//Get all timestamps for that requestId
			//Check if any is after your given timestamp
			//If yes, return that value to the .  If no, then request that Id
			(_didGet,_value,_retrievedTimestamp) = getFirstVerifiedDataAfter(i,_timestamp);
			if(_didGet){
				valuesByTimestamp[_retrievedTimestamp - _retrievedTimestamp % granularity] = (_value + valuesByTimestamp[_retrievedTimestamp - _retrievedTimestamp % granularity] * requestIdsIncluded[_timestamp].length) / (requestIdsIncluded[_timestamp].length + 1);
				requestIdsIncluded[_retrievedTimestamp - _retrievedTimestamp % granularity].push(i); //how do we make sure it's not called twice?
			}
			else{
				if(_tellor.balanceOf(address(this)) > requestIds.length){
					_tellorCore.addTip(i, _initialBalance / requestIds.length);
				}
			}
		}
	}

	function getLastValueAfter(uint _timestamp) external view returns(bool,uint,uint _timestampRetrieved){
		uint _count = timestamps.length ;
		if(_count > 0){
				for(uint i = _count - 1;i > 0;i--){
					if(timestamps[i] >= _timestamp){
						_timestampRetrieved = timestamps[i];
					}
				}
				if(_timestampRetrieved > 0){
					return(true,getMyValuesByTimestamp(_timestampRetrieved),_timestampRetrieved);
				}
        }
        return(false,0,0);
	}

	function getLastUndisputedValueAfter(uint _timestamp) external view returns(bool,uint, uint _timestampRetrieved){
		uint _count = timestamps.length;
		if(_count > 0){
				for(uint i = _count - 1;i > 0;i--){

					if(timestamps[i] >= _timestamp && timestamps[i] > block.timestamp - disputePeriod){
						_timestampRetrieved = timestamps[i];
					}
				}
				if(_timestampRetrieved > 0){
					return(true,getMyValuesByTimestamp(_timestampRetrieved),_timestampRetrieved);
				}
        }
        return(false,0,0);
	}

	function getCurrentValue() external view returns(uint){
		return getMyValuesByTimestamp(timestamps[timestamps.length -1]);
	}

	function getTimestamps() external view returns(uint[] memory){
		return timestamps;
	}
}

//On get last query, should be by requestId
//add a sender to each of pieces (requestData/addValuePool)
//remove requestId from requestData
//somehow be able to get the most recent tip (or payout) and that is the dispute Fee
//make sure we use SafeMath
//add usingEther