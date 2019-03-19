// pragma solidity ^0.5.0;

// import './Ownable.sol';
// import './Tellor.sol';
// /**
// * @title UsingTellor
// * This contracts creates for easy integration to the Tellor Tellor System
// */
// contract UserContract is Ownable{


// 	uint public tellorPrice;
// 	uint public apiId;
// 	uint public spread;//in thousands * 100.  So a 5% spread is 1000  + .05 *1000 = 1050
// 	address public tellorStorageAddress;


//     constructor(address _storage) public{
//     	tellorStorageAddress = _storage;
//     }

// 	function depositTributes(uint _amount) external {
// 		Tellor doracle = Tellor(tellorStorageAddress);
// 		doracle.transfer(address(this),_amount);
// 	}

// 	function withdrawEther() external {
// 		require(msg.sender == owner());
// 		_owner.transfer(address(this).balance);

// 	}

// 	function requestDataWithEther(string calldata c_sapi, uint _tip) external payable{
// 		Tellor doracle = Tellor(tellorStorageAddress);
// 		require(doracle.balanceOf(address(this)) > _tip * tellorPrice);
// 		doracle.requestData(c_sapi,_tip);
// 	}

// 	function addValueToPoolWithEther(uint _apiId, uint _tip) public {
// 		Tellor doracle = Tellor(tellorStorageAddress);
// 		require(doracle.balanceOf(address(this)) > _tip * tellorPrice);
// 		doracle.addToValuePool(_apiId,_tip);
// 	}

// 	function setTellor(uint _id, uint _spread) public{
// 		require(msg.sender == owner());
// 		apiId = _id;
// 		spread = _spread;
// 	}


// 	function setPrice() external {
// 		Tellor doracle = Tellor(tellorStorageAddress);
// 		uint value;
// 		bool ifRetrieve;
// 		(value,ifRetrieve) = doracle.getLastQuery(apiId);
// 		if(ifRetrieve && value != tellorPrice / (spread/1000)){
// 			tellorPrice = value * spread / 1000;
// 		}
// 	}

// }

// //On get last query, we should remove the bool return
// //