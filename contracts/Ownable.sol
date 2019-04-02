pragma solidity ^0.5.0;

import "./TellorData.sol";

contract Ownable is TellorData{
    /*Variables*/
    /*Event*/
    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
    */
    constructor ()  public{
        _owner = msg.sender;
    }
    // /**
    //  * @dev Allows the current owner to transfer control of the contract to a newOwner.
    //  * @param newOwner The address to transfer ownership to.
    // */
    // function transferOwnership(address payable newOwner) external {
    //     require(msg.sender == owner());
    //     emit OwnershipTransferred(_owner, newOwner);
    //     _owner = newOwner;
    // }
}