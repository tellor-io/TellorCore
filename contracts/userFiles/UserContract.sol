pragma solidity ^0.5.0;

import '../TellorMaster.sol';
import '../Tellor.sol';

/**
* @title UsingTellor
* This contracts creates for easy integration to the Tellor Tellor System
* This contract holds the Ether and Tributes for interacting with the system
* Note it is centralized (we can set the price of Tellor Tributes)
* Once the tellor system is running, this can be set properly.  
* Note deploy through centralized 'Tellor Master contract'
*/
contract UserContract{

	address payable public owner;
	uint public tributePrice;
	address payable public tellorStorageAddress;

	event OwnershipTransferred(address _previousOwner,address _newOwner);
	event NewPriceSet(uint _newPrice);


    /*Constructor*/
    /**
    * @dev the constructor sets the storage address and owner
    * @param _storage is the TellorMaster address ???
    */
    constructor(address payable _storage) public{
    	tellorStorageAddress = _storage;
    	owner = msg.sender;
    }

    /*Functions*/
    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address payable newOwner) external {
            require(msg.sender == owner);
            emit OwnershipTransferred(owner, newOwner);
            owner = newOwner;
    }


    /**
    * @dev This function allows the owner to withdraw the ETH paid for requests
    */
	function withdrawEther() external {
		require(msg.sender == owner);
		owner.transfer(address(this).balance);

	}

	/**
    * @dev Allows the user to submit a request for data to the oracle using ETH
    * @param c_sapi string API being requested to be mined
    * @param _c_symbol is the short string symbol for the api request
    * @param _granularity is the number of decimals miners should include on the submitted value
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the onDeckQueryHash, or the api with the highest payout pool
    */
	function requestDataWithEther(string calldata c_sapi, string calldata _c_symbol,uint _granularity, uint _tip) external payable{
		TellorMaster _tellorm = TellorMaster(tellorStorageAddress);
		require(_tellorm.balanceOf(address(this)) >= _tip);
		require(msg.value >= _tip * tributePrice);
		Tellor _tellor = Tellor(tellorStorageAddress); //we should delcall here
		_tellor.requestData(c_sapi,_c_symbol,_granularity,_tip);
	}


    /**
    * @dev Allows the user to tip miners using ether
    * @param _apiId to tip
    * @param _tip amount
    */
	function addTipWithEther(uint _apiId, uint _tip) external payable {
		TellorMaster _tellorm = TellorMaster(tellorStorageAddress);
		require(_tellorm.balanceOf(address(this)) >= _tip);
		require(msg.value >= _tip * tributePrice);
		Tellor _tellor = Tellor(tellorStorageAddress); //we should delcall here
		_tellor.addTip(_apiId,_tip);
	}


    /**
    * @dev Allows the owner to set the Tribute token price.
    * @param _price to set for Tellor Tribute token
    */
	function setPrice(uint _price) public {
		require(msg.sender == owner);
		tributePrice = _price;
		emit NewPriceSet(_price);
	}

}

//Cryptic Nick notes about UsingTellor
//On get last query, we should remove the bool return---sure, why not, BL
// //On get last query, should be by requestId---you already did this, BL
// //remove requestId from requestData---you already did this, BL