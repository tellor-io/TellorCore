// pragma solidity ^0.5.0;

// import './UsingTellor.sol';
// import '../TellorMaster.sol';
// import '../Tellor.sol';
// /**
// * @title UsingTellor
// * This contracts creates for easy integration to the Tellor Tellor System
// */
// contract Optimistic is UsingTellor{

// 	//Can we rework soem of these mappings into a struct?
// 	mapping(uint => bool) public isValue;
// 	uint[] timestamps; //timestamps with values
// 	mapping(uint => bool) public disputedValues;
// 	mapping(uint => uint[]) public requestIdsIncluded;
// 	uint[] requestIds;
// 	uint[] disputedValuesArray;
// 	uint public granularity;
// 	uint public disputeFee; //In Tributes
// 	uint public disputePeriod;
// 	mapping(uint => uint) valuesByTimestamp;


// 	event NewValueSet(uint indexed _timestamp, uint _value);
// 	event ValueDisputed(address _disputer,uint _timestamp, uint _value);

// 	//A list of parties who can set the values (must not be blank)
// 	//The off
// 	constructor(address _userContract, uint _disputeFeeRequired, uint _disputePeriod, uint[] memory _requestIds, uint _granularity) UsingTellor(_userContract) public{
// 		disputeFee = _disputeFeeRequired;
// 		disputePeriod = _disputePeriod;
// 		granularity = _granularity;
// 		requestIds = _requestIds;
// 	}


// 	function setValue(uint _timestamp, uint _value) external{
// 		require(msg.sender == owner);
// 		require(getIsValue(_timestamp) == false);
// 		valuesByTimestamp[_timestamp] = _value;
// 		isValue[_timestamp] = true;
// 		timestamps.push(_timestamp);
// 		emit NewValueSet(_timestamp,_value);

// 	}

// 	event Print(bool _call);
// 	event Print2(uint _1, uint _2);
// 	function disputeOptimisticValue(uint _timestamp) external{
// 		bytes memory sig = abi.encodeWithSignature("transferFrom(address,address,uint256)",msg.sender,address(this),disputeFee);
// 		address addr  = tellorUserContract.tellorStorageAddress();
// 		(bool success, bytes memory data) = addr.call(sig);
// 		require(success);
// 		require(isValue[_timestamp]);
// 		require(now - now % granularity  <= _timestamp + disputePeriod);// assert disputePeriod is still open
// 		disputedValues[_timestamp] = true;
// 		disputedValuesArray.push(_timestamp);
// 		emit ValueDisputed(msg.sender,_timestamp,valuesByTimestamp[_timestamp]);
// 	}


// 	function getMyValuesByTimestamp(uint _timestamp) public view returns(uint value){
// 		return valuesByTimestamp[_timestamp];
// 	}


// 	function getNumberOfValuesPerTimestamp(uint _timestamp) external view returns(uint){
// 			return requestIdsIncluded[_timestamp].length;
// 	}

// 	function getIsValue(uint _timestamp) public view returns(bool){
// 		return isValue[_timestamp];
// 	}

// 	event TellorValuePlaced(uint _timestamp, uint _value);
// 	function getTellorValues(uint _timestamp) public returns(uint _value, bool _didGet){
// 		//We need to get the tellor value within the granularity.  If no Tellor value is available...what then?  Simply put no Value?  
// 		//No basically, the dispute period for anyValue is within the granularity
// 		TellorMaster _tellor = TellorMaster(tellorUserContract.tellorStorageAddress());
// 		Tellor _tellorCore = Tellor(tellorUserContract.tellorStorageAddress());
// 		uint _retrievedTimestamp;
// 		uint _initialBalance = _tellor.balanceOf(address(this));
// 		for(uint i = 1; i <= requestIds.length; i++){
// 			//Get all timestamps for that requestId
// 			//Check if any is after your given timestamp
// 			//If yes, return that value to the .  If no, then request that Id
// 			(_didGet,_value,_retrievedTimestamp) = getFirstVerifiedDataAfter(i,_timestamp);
// 			if(_didGet){
// 				uint _newTime = _retrievedTimestamp - _retrievedTimestamp % granularity;
// 				uint _newValue =(_value + valuesByTimestamp[_newTime] * requestIdsIncluded[_newTime].length) / (requestIdsIncluded[_newTime].length + 1);
// 				valuesByTimestamp[_newTime] = _newValue;
// 				emit TellorValuePlaced(_newTime,_newValue);
// 				emit Print2(_newValue,_value);
// 				requestIdsIncluded[_newTime].push(i); //how do we make sure it's not called twice?
// 				if(isValue[_newTime] == false){
// 							timestamps.push(_newTime);
// 							isValue[_newTime] = true;
// 							emit NewValueSet(_newTime,_value);
// 				}
// 				else if(disputedValues[_newTime] == true){
// 					disputedValues[_newTime] = false;
// 				}
// 			}
// 			else{
// 				if(_tellor.balanceOf(address(this)) > requestIds.length){
// 					_tellorCore.addTip(i, _initialBalance / requestIds.length);
// 				}
// 			}
// 		}
// 	}

// 	function getFirstUndisputedValueAfter(uint _timestamp) public view returns(bool,uint, uint _timestampRetrieved){
// 		uint _count = timestamps.length;
// 		if(_count > 0){
// 				for(uint i = _count;i > 0;i--){
// 					if(timestamps[i-1] >= _timestamp && disputedValues[timestamps[i-1]] == false){
// 						_timestampRetrieved = timestamps[i-1];
// 					}
// 				}
// 				if(_timestampRetrieved > 0){
// 					return(true,getMyValuesByTimestamp(_timestampRetrieved),_timestampRetrieved);
// 				}
//         }
//         return(false,0,0);
// 	}

// 	function getCurrentValue() external view returns(uint){
//	    require(timestamps.length > 0);
// 		return getMyValuesByTimestamp(timestamps[timestamps.length -1]);
// 	}

// 	function getTimestamps() external view returns(uint[] memory){
// 		return timestamps;
// 	}
// 	function getRequestIds() external view returns(uint[] memory){
// 		return requestIds;
// 	}
// 	function getRequestIdsIncluded(uint _time) external view returns(uint[] memory){
// 		return requestIdsIncluded[_time];
// 	}

// 	function getNumberOfDisputedValues() external view returns(uint){
// 		return disputedValuesArray.length;
// 	}

// 	function isDisputed(uint _time) external view returns(bool){
// 		return disputedValues[_time];
// 	}

// 	function getDisputedValueByIndex(uint _index) external view returns(uint){
// 		return disputedValuesArray[_index];
// 	}

// 	function getDisputedValues() external view returns(uint[] memory){
// 		return disputedValuesArray;
// 	}
// }

// //somehow be able to get the most recent tip (or payout) and that is the dispute Fee
// //make sure we use SafeMath
// //add usingEther