pragma solidity ^0.5.16;

import "./TellorGetters.sol";

/**
 * @title Tellor Getters Helper
 * @dev Oracle contract for an easy way to call the tellor getter functions.
 **/
contract TellorGettersHelper {
    address public _owner;
    TellorGetters public _getter;

    /*Constructor*/
    /**
     * @dev the constructor sets the storage address and owner
     * @param getter is the TellorGetter address
     */
    constructor(address payable getter) public {
        _getter = TellorGetters(getter);
        _owner = msg.sender;
    }

    /**
     * @param requestID is the ID for which the function returns the total tips.
     * @return Returns the current tips for a give request ID.
     */
    function totalTip(uint256 requestID) external view returns (uint256) {
        return _getter.getRequestUintVars(requestID, keccak256("totalTip"));
    }
}
