pragma solidity ^0.5.0;
import './Tellor.sol';
/**
* @title UsingTellor
* This contracts creates for easy integration to the Tellor Tellor System
* This contract holds the Ether and Tributes for interacting with the system
* Note it is centralized (we can set the price of Tellor Tributes)
* Once the tellor system is running, this can be set properly.  
* Note deploy through centralized 'Tellor Master contract'
*/
contract UserContract is Optimistic{


	uint public tellorPrice;
	uint public apiId;
	uint public spread;//in thousands * 100.  So a 5% spread is 1000  + .05 *1000 = 1050
	address public tellorStorageAddress;

    constructor ()  public{
            _owner = msg.sender;
    }
        /**
         * @dev Allows the current owner to transfer control of the contract to a newOwner.
         * @param newOwner The address to transfer ownership to.
        */
    function transferOwnership(address payable newOwner) external {
            require(msg.sender == owner());
            emit OwnershipTransferred(_owner, newOwner);
            _owner = newOwner;
    }


    constructor(address _storage) public{
    	tellorStorageAddress = _storage;
    }

	function depositTributes(uint _amount) external {
		Tellor doracle = Tellor(tellorStorageAddress);
		doracle.transfer(address(this),_amount);
	}

	function withdrawEther() external {
		require(msg.sender == owner());
		_owner.transfer(address(this).balance);

	}

	//allow them to pay with their own Tributes (prevents us from increasing spread too high)
	function requestDataWithEther(string calldata c_sapi, uint _tip) external payable{
		Tellor doracle = Tellor(tellorStorageAddress);
		require(doracle.balanceOf(address(this)) > _tip * tellorPrice);
		doracle.requestData(c_sapi,_tip);
	}

	function addValueToPoolWithEther(uint _apiId, uint _tip) public {
		Tellor doracle = Tellor(tellorStorageAddress);
		require(doracle.balanceOf(address(this)) > _tip * tellorPrice);
		doracle.addTip(_apiId,_tip);
	}

	function setSpread(uint _spread) public{
		require(msg.sender == owner());
		apiId = _id;
		spread = _spread;
	}

}

//On get last query, we should remove the bool return
// //On get last query, should be by requestId
// //remove requestId from requestData