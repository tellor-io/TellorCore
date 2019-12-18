pragma solidity ^0.5.0;

/*
@title ADOInterface 
@notice This inteface is the standard interface for price oracles
*/

interface ADOInterface {
		function resultFor(bytes32 Id) view external returns (uint256 timestamp, int256 outcome, int256 status);
}

