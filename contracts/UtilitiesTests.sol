pragma solidity ^0.5.0;

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
    address public tellorMasterAddress;

    /**
    * @dev The constructor sets the owner
    */
    constructor(address payable _TellorMasterAddress) public {
        owner = msg.sender;
        tellorMasterAddress = _TellorMasterAddress;
    }

    function testgetMax() public view returns (uint256 _max, uint256 _index) {
        uint256[51] memory requests = tellorMaster.getRequestQ();
        (_max, _index) = Utilities.getMax(requests);
    }

    function testgetMin() public view returns (uint256 _min, uint256 _index) {
        uint256[51] memory requests = tellorMaster.getRequestQ();
        (_min, _index) = Utilities.getMin(requests);
    }

    function testgetMax5(uint256[51] memory requests) public view returns (uint256[5] memory _max, uint256[5] memory _index) {
        (_max, _index) = Utilities.getMax5(requests);
    }

    function testgetMins(uint256[51] memory requests) public view returns (uint256 _min, uint256 _index) {
        (_min, _index) = Utilities.getMin(requests);
    }



}
