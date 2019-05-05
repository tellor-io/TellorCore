pragma solidity ^0.5.0;

import '../Tellor.sol';
import '../TellorMaster.sol';
import './UserContract.sol';
/**
* @title UsingTellor
* This contracts creates for easy integration to the Tellor Tellor System
*/
contract UsingTellor{
	UserContract tellorUserContract;
	address public owner;
	
	event OwnershipTransferred(address _previousOwner,address _newOwner);


    constructor(address _user)public {
    	tellorUserContract = UserContract(_user);
    	owner = msg.sender;
    }

	function getCurrentValue(uint _requestId) public view returns(bool ifRetrieve, uint value, uint _timestampRetrieved) {
		TellorMaster _tellor = TellorMaster(tellorUserContract.tellorStorageAddress());
		uint _count = _tellor.getNewValueCountbyRequestId(_requestId) ;
		if(_count > 0){
				_timestampRetrieved = _tellor.getTimestampbyRequestIDandIndex(_requestId,_count -1);//will this work with a zero index? (or insta hit?)
				return(true,_tellor.retrieveData(_requestId,_timestampRetrieved),_timestampRetrieved);
        }
        return(false,0,0);
	}

	function getFirstVerifiedDataAfter(uint _requestId, uint _timestamp) public view returns(bool,uint,uint _timestampRetrieved) {
		TellorMaster _tellor = TellorMaster(tellorUserContract.tellorStorageAddress());
		uint _count = _tellor.getNewValueCountbyRequestId(_requestId) ;
		if(_count > 0){
				for(uint i = _count - 1;i > 0;i--){
					if(_tellor.getTimestampbyRequestIDandIndex(_requestId,i) < _timestamp && _tellor.getTimestampbyRequestIDandIndex(_requestId,i) < block.timestamp - 86400){
						_timestampRetrieved = _tellor.getTimestampbyRequestIDandIndex(_requestId,i + 1);//will this work with a zero index? (or insta hit?)
						i  = 0;
					}
				}
				if(_timestampRetrieved > 0){
					return(true,_tellor.retrieveData(_requestId,_timestampRetrieved),_timestampRetrieved);
				}
        }
        return(false,0,0);
	}
	

	function getAnyDataAfter(uint _requestId, uint _timestamp) public view returns(bool _ifRetrieve, uint _value, uint _timestampRetrieved){
		TellorMaster _tellor = TellorMaster(tellorUserContract.tellorStorageAddress());
		uint _count = _tellor.getNewValueCountbyRequestId(_requestId) ;
		if(_count > 0){
				for(uint i = _count - 1;i > 0;i--){
					if(_tellor.getTimestampbyRequestIDandIndex(_requestId,i) < _timestamp){
						_timestampRetrieved = _tellor.getTimestampbyRequestIDandIndex(_requestId,i + 1);//will this work with a zero index? (or insta hit?)
						i  = 0;
					}
				}
				if(_timestampRetrieved > 0){
					return(true,_tellor.retrieveData(_requestId,_timestampRetrieved),_timestampRetrieved);
				}
        }
        return(false,0,0);
	}

	function requestData(string calldata _request,string calldata _symbol,uint _granularity, uint _tip) external{
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
		if(_tip > 0){
			_tellor.transfer(address(this),_tip);
		}
		_tellor.requestData(_request,_symbol,_granularity,_tip);
	}

	function requestDataWithEther(string calldata _request,string calldata _symbol,uint _granularity, uint _tip) payable external{
		tellorUserContract.requestDataWithEther(_request,_symbol,_granularity,_tip);
	}

	function addTip(uint _requestId, uint _tip) public {
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress());
		_tellor.transfer(address(this),_tip);
		_tellor.addTip(_requestId,_tip);
	}

	function addTipWithEther(uint _requestId, uint _tip) public {
		UserContract(tellorUserContract).addTipWithEther(_requestId,_tip);
	}

	function setUserContract(address _userContract) public {
		require(msg.sender == owner);//who should this be?
		tellorUserContract = UserContract(_userContract);
	}

	function transferOwnership(address payable _newOwner) external {
            require(msg.sender == owner);
            emit OwnershipTransferred(owner, _newOwner);
            owner = _newOwner;
    }
}


