// pragma solidity ^0.5.0;

// import '../Tellor.sol';
// import '../TellorMaster.sol';
// import './UserContract.sol';
// /**
// * @title UsingTellor
// * This contracts creates for easy integration to the Tellor Tellor System
// */
// contract UsingTellor{
// 	UserContract tellorUserContract;
// 	address public owner;
	
// 	event OwnershipTransferred(address _previousOwner,address _newOwner);


//     constructor(address _user)public {
//     	tellorUserContract = UserContract(_user);
//     	owner = msg.sender;
//     }

// 	function getCurrentValue(uint _requestId) public view returns(bool ifRetrieve, uint value, uint _timestampRetrieved) {
// 		TellorMaster _tellor = TellorMaster(tellorUserContract.tellorStorageAddress());
// 		uint _count = _tellor.getNewValueCountbyRequestId(_requestId) ;
// 		if(_count > 0){
// 				_timestampRetrieved = _tellor.getTimestampbyRequestIDandIndex(_requestId,_count -1);//will this work with a zero index? (or insta hit?)
// 				return(true,_tellor.retrieveData(_requestId,_timestampRetrieved),_timestampRetrieved);
//         }
//         return(false,0,0);
// 	}

// 	//How can we make this one more efficient?
// 	function getFirstVerifiedDataAfter(uint _requestId, uint _timestamp) public returns(bool,uint,uint _timestampRetrieved) {
// 		TellorMaster _tellor = TellorMaster(tellorUserContract.tellorStorageAddress());
// 		uint _count = _tellor.getNewValueCountbyRequestId(_requestId);
// 		if(_count > 0){
// 				for(uint i = _count;i > 0;i--){
// 					if(_tellor.getTimestampbyRequestIDandIndex(_requestId,i-1) > _timestamp && _tellor.getTimestampbyRequestIDandIndex(_requestId,i-1) < block.timestamp - 86400){
// 						_timestampRetrieved = _tellor.getTimestampbyRequestIDandIndex(_requestId,i-1);//will this work with a zero index? (or insta hit?)
// 					}
// 				}
// 				if(_timestampRetrieved > 0){
// 					return(true,_tellor.retrieveData(_requestId,_timestampRetrieved),_timestampRetrieved);
// 				}
//         }
//         return(false,0,0);
// 	}
	
// 	event Print(string _s,uint _num);

// 	function getAnyDataAfter(uint _requestId, uint _timestamp) public  returns(bool _ifRetrieve, uint _value, uint _timestampRetrieved){
// 		TellorMaster _tellor = TellorMaster(tellorUserContract.tellorStorageAddress());
// 		uint _count = _tellor.getNewValueCountbyRequestId(_requestId) ;
// 		if(_count > 0){
// 				emit Print("count",_count);
// 				for(uint i = _count;i > 0;i--){
// 					emit Print('tester',_tellor.getTimestampbyRequestIDandIndex(_requestId,i-1));
// 					emit Print('actual', _timestamp);

// 					if(_tellor.getTimestampbyRequestIDandIndex(_requestId,i-1) >= _timestamp){
// 						_timestampRetrieved = _tellor.getTimestampbyRequestIDandIndex(_requestId,i-1);//will this work with a zero index? (or insta hit?)
// 						emit Print("_timestampRetrieved",_timestampRetrieved);
// 						emit Print("value",_tellor.retrieveData(_requestId,_timestampRetrieved));
// 					}
// 				}
// 				if(_timestampRetrieved > 0){
// 					return(true,_tellor.retrieveData(_requestId,_timestampRetrieved),_timestampRetrieved);
// 				}
//         }
//         return(false,0,0);
// 	}

// 	function requestData(string calldata _request,string calldata _symbol,uint _granularity, uint _tip) external{
// 		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
// 		if(_tip > 0){
// 			require(_tellor.transferFrom(msg.sender,address(this),_tip));
// 		}
// 		_tellor.requestData(_request,_symbol,_granularity,_tip);
// 	}

// 	function requestDataWithEther(string calldata _request,string calldata _symbol,uint _granularity, uint _tip) payable external{
// 		tellorUserContract.requestDataWithEther.value(msg.value)(_request,_symbol,_granularity,_tip);
// 	}

// 	function addTip(uint _requestId, uint _tip) public {
// 		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
// 		require(_tellor.transferFrom(msg.sender,address(this),_tip));
// 		_tellor.addTip(_requestId,_tip);
// 	}

// 	function addTipWithEther(uint _requestId, uint _tip) public payable {
// 		UserContract(tellorUserContract).addTipWithEther.value(msg.value)(_requestId,_tip);
// 	}

// 	function setUserContract(address _userContract) public {
// 		require(msg.sender == owner);//who should this be?
// 		tellorUserContract = UserContract(_userContract);
// 	}

// 	function transferOwnership(address payable _newOwner) external {
//             require(msg.sender == owner);
//             emit OwnershipTransferred(owner, _newOwner);
//             owner = _newOwner;
//     }
// }


