pragma solidity ^0.5.0;

import './Tellor.sol';
/**
* @title Reader
* This contracts tests for authorized and unauthorized access to data
*/
contract Reader{

	uint public value;
	bool public ifRetrieve;

    /**
    @dev Getter function to get value for last mined _timestamp
    @param _oracle_add Tellor Address
    */
	function getLastValue(address _oracle_add) public {
		Tellor doracle = Tellor(_oracle_add);
		(value,ifRetrieve) = doracle.getLastQuery();
	}
}