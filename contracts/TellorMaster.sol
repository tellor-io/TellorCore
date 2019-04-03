pragma solidity ^0.5.0;

import "./TellorGetters.sol";
import "./libraries/TellorLibrary.sol";

contract TellorMaster is TellorGetters{

    using TellorLibrary for TellorLibrary.TellorStorageStruct;
    TellorLibrary.TellorStorageStruct public tellor;
    /**
     * @dev The constructor sets the original `tellorStorageOwner` of the contract to the sender
     * account.
    */

    constructor (address _tellorContract)  public{
        tellor.tellorMasterConstructor(_tellorContract);
    }

    function () external payable {
        address addr = tellorContract;
        assembly {
            let freememstart := mload(0x40)
            calldatacopy(freememstart, 0, calldatasize())
            let success := delegatecall(not(0), addr, freememstart, calldatasize(), freememstart, 32)
            switch success
            case 0 { revert(freememstart, 32) }
            default { return(freememstart, 32) }
        }
    }

}