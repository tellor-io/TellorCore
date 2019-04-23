pragma solidity ^0.5.0;

import './Tellor.sol';
import './UserContract.sol';
/**
* @title UsingTellor
* This contracts creates for easy integration to the Tellor Tellor System
*/
contract UsingTellor{
	address public tellorUserContract;
	address public owner;
	bool public canSet;



    constructor(address _storage, address _user, bool _canSet)public {
    	tellorUserContract = _user;
    	owner = msg.sender;
    }

	function getLastValue(uint _requestId) public returns(bool ifRetrieve, uint value) {
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress);
		 return _tellor.getLastQuery();
	}

	function getFirstVerifiedDataAfter(uint _requestId, uint _timestamp) public view returns(uint,bool) {
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress);
		for(uint i = _timestamp - _timestamp % _tellor.timeTarget;i < block.timestamp - 86400;i += _tellor.timeTarget){
			if(_tellor.isData(_requestId,i)){
				return (_tellor.retrieveData(_requestId,i),true);
			}
		}
		return (0,false);
	}

	function isData(uint _requestId, uint _timestamp) public view returns(bool) {
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress);
		return _tellor.isData(_requestId,_timestamp);
	}

	function getAnyDataAfter(uint _requestId, uint _timestamp) public view returns(bool ifRetrieve, uint value){
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress);
		for(uint i = _timestamp - _timestamp % _tellor.timeTarget;i < block.timestamp;i += _tellor.timeTarget){
			if(_tellor.isData(_requestId,i)){
				return _tellor.retrieveData(_requestId,i);
			}
		}
		(value,ifRetrieve) = _tellor.getLastQuery();
	}

	function requestData(string calldata _request,string calldata _symbol,uint _requestId,uint _granularity, uint _tip) external returns(uint _requestId){
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress);
		if(_tip > 0){
			_tellor.transfer(address(this),_tip);
		}
		return _tellor.requestData(_request,_symbol,_requestId,_granularity,_tip);
	}

	function requestDataWithEther(string calldata c_srequest, uint _tip) payable external returns(uint _requestId){
		UserContract(tellorUserContract).requestDataWithEther(c_srequest,_tip);
	}

	function addTip(uint _requestId, uint _tip) public {
		Tellor _tellor = Tellor(tellorUserContract.tellorStorageAddress);
		_tellor.transfer(address(this),_tip);
		_tellor.addToValuePool(_requestId,_tip);
	}

	function addTipWithEther(uint _requestId, uint _tip) public {
		UserContract(tellorUserContract).addValueToPoolWithEther(_requestId,_tip);
	}

	function setUserContract(address _userContract) public {
		require(msg.sender == owner);
		tellorUserContract = _userContract
	}

	function transferOwnership(address payable newOwner) external {
            require(msg.sender == owner);
            emit OwnershipTransferred(_owner, newOwner);
            _owner = newOwner;
    }
}


