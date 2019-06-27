// pragma solidity ^0.5.0;

// import '../TellorMaster.sol';
// import '../Tellor.sol';
// /**
// * @title UsingTellor
// * This contracts creates for easy integration to the Tellor Tellor System
// * This contract holds the Ether and Tributes for interacting with the system
// * Note it is centralized (we can set the price of Tellor Tributes)
// * Once the tellor system is running, this can be set properly.  
// * Note deploy through centralized 'Tellor Master contract'
// */
// contract UserContract{

// 	address payable public owner;
// 	uint public tributePrice;
// 	address payable public tellorStorageAddress;

// 	event OwnershipTransferred(address _previousOwner,address _newOwner);
// 	event NewPriceSet(uint _newPrice);



//     constructor(address payable _storage) public{
//     	tellorStorageAddress = _storage;
//     	owner = msg.sender;
//     }


//     /**
//          * @dev Allows the current owner to transfer control of the contract to a newOwner.
//          * @param newOwner The address to transfer ownership to.
//      */
//     function transferOwnership(address payable newOwner) external {
//             require(msg.sender == owner);
//             emit OwnershipTransferred(owner, newOwner);
//             owner = newOwner;
//     }

// 	function withdrawEther() external {
// 		require(msg.sender == owner);
// 		owner.transfer(address(this).balance);

// 	}

// 	//allow them to pay with their own Tributes (prevents us from increasing spread too high)
// 	function requestDataWithEther(string calldata c_sapi, string calldata _c_symbol,uint _granularity, uint _tip) external payable{
// 		TellorMaster _tellorm = TellorMaster(tellorStorageAddress);
// 		require(_tellorm.balanceOf(address(this)) >= _tip);
// 		require(msg.value >= _tip * tributePrice);
// 		Tellor _tellor = Tellor(tellorStorageAddress); //we should delcall here
// 		_tellor.requestData(c_sapi,_c_symbol,_granularity,_tip);
// 	}

// 	function addTipWithEther(uint _apiId, uint _tip) external payable {
// 		TellorMaster _tellorm = TellorMaster(tellorStorageAddress);
// 		require(_tellorm.balanceOf(address(this)) >= _tip);
// 		require(msg.value >= _tip * tributePrice);
// 		Tellor _tellor = Tellor(tellorStorageAddress); //we should delcall here
// 		_tellor.addTip(_apiId,_tip);
// 	}

// 	function setPrice(uint _price) public {
// 		require(msg.sender == owner);
// 		tributePrice = _price;
// 		emit NewPriceSet(_price);
// 	}

// }

// //On get last query, we should remove the bool return
// // //On get last query, should be by requestId
// // //remove requestId from requestData