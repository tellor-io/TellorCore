pragma solidity ^0.5.0;

contract Ownable{
    /*Variables*/
    address payable public _owner;//Tellor Owner address
    /*Event*/
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
    */
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
    /**
     * @return the address of the owner.
    */
    function owner() public view returns (address) {
        return _owner;
    }
}