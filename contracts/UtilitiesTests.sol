pragma solidity ^0.5.16;

import "./libraries/Utilities.sol";
import "./libraries/TellorGettersLibrary.sol";
import "./TellorMaster.sol";

/**
* @title Utilities Tests
* @dev These are the getter function for the two assembly code functions in the
* Utilities library
*/
contract UtilitiesTests {
    address internal owner;
    TellorMaster internal tellorMaster;
    address payable public tellorMasterAddress;

    /**
    * @dev The constructor sets the owner
    */
    constructor(address payable _TellorMasterAddress) public {
        owner = msg.sender;
        tellorMasterAddress = _TellorMasterAddress;
        tellorMaster = TellorMaster(tellorMasterAddress);
    }

    /**
    * @dev Gets the max of the requestQ array
    */
    function testgetMax() public view returns (uint256 _max, uint256 _index) {
        uint256[51] memory requests = tellorMaster.getRequestQ();
        (_max, _index) = Utilities.getMax(requests);
    }

    /**
    * @dev Gets the min of the requestQ array
    */
    function testgetMin() public view returns (uint256 _min, uint256 _index) {
        uint256[51] memory requests = tellorMaster.getRequestQ();
        (_min, _index) = Utilities.getMin(requests);
    }

    /**
    * @dev Gets the top 5 of the array provided
    * @param requests is an array of length 51
    * @return the top 5 and their respective index within the array
    */
    function testgetMax5(uint256[51] memory requests) public pure returns (uint256[5] memory _max, uint256[5] memory _index) {
        (_max, _index) = Utilities.getMax5(requests);
    }

    /**
    * @dev Gets the min of the array provided
    * @param requests is an array of length 51
    * @return the min and its respective index within the array
    */
    function testgetMins(uint256[51] memory requests) public pure returns (uint256 _min, uint256 _index) {
        (_min, _index) = Utilities.getMin(requests);
    }



}
