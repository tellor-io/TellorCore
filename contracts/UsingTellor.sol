// pragma solidity ^0.5.0;

// import './Tellor.sol';
// import './UserContract.sol';
// /**
// * @title UsingTellor
// * This contracts creates for easy integration to the Tellor Tellor System
// */
// contract UsingTellor{

// 	address public tellorStorageAddress;
// 	address public tellorUserContract;


//     constructor(address _storage, address _user)public {
//     	tellorStorageAddress = _storage;
//     	tellorUserContract = _user;
//     }

// 	function getLastValue(uint _apiId) public returns(bool ifRetrieve, uint value) {
// 		Tellor doracle = Tellor(tellorStorageAddress);
// 		 return doracle.getLastQuery();
// 	}

// 	function getFirstVerifiedDataAfter(uint _apiId, uint _timestamp) public view returns(uint,bool) {
// 		Tellor doracle = Tellor(tellorStorageAddress);
// 		for(uint i = _timestamp - _timestamp % doracle.timeTarget;i < block.timestamp - 86400;i += doracle.timeTarget){
// 			if(doracle.isData(_apiId,i)){
// 				return (doracle.retrieveData(_apiId,i),true);
// 			}
// 		}
// 		return (0,false);
// 	}

// 	function isData(uint _apiId, uint _timestamp) public view returns(bool) {
// 		Tellor doracle = Tellor(tellorStorageAddress);
// 		return doracle.isData(_apiId,_timestamp);
// 	}

// 	function getAnyDataAfter(uint _apiId, uint _timestamp) public view returns(bool ifRetrieve, uint value){
// 		Tellor doracle = Tellor(tellorStorageAddress);
// 		for(uint i = _timestamp - _timestamp % doracle.timeTarget;i < block.timestamp;i += doracle.timeTarget){
// 			if(doracle.isData(_apiId,i)){
// 				return doracle.retrieveData(_apiId,i);
// 			}
// 		}
// 		(value,ifRetrieve) = doracle.getLastQuery();
// 	}

// 	function requestData(string calldata c_sapi, uint _tip) external returns(uint _apiId){
// 		Tellor doracle = Tellor(tellorStorageAddress);
// 		if(_tip > 0){
// 			doracle.transfer(address(this),_tip);
// 		}
// 		return doracle.requestData(c_sapi,_tip);
// 	}

// 	function requestDataWithEther(string calldata c_sapi, uint _tip) payable external returns(uint _apiId){
// 		UserContract(tellorUserContract).requestDataWithEther(c_sapi,_tip);
// 	}

// 	function addToValuePool(uint _apiId, uint _tip) public {
// 		Tellor doracle = Tellor(tellorStorageAddress);
// 		doracle.transfer(address(this),_tip);
// 		doracle.addToValuePool(_apiId,_tip);
// 	}

// 	function addValueToPoolWithEther(uint _apiId, uint _tip) public {
// 		UserContract(tellorUserContract).addValueToPoolWithEther(_apiId,_tip);
// 	}
// }

// //On get last query, should be by apiId
// //add a sender to each of pieces (requestData/addValuePool)
// //get rid of addValuePool?  (id option in requestData)
