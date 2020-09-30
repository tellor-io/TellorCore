pragma solidity ^0.5.16;

import "./libraries/SafeMath.sol";
import "./libraries/TellorStorage.sol";
import "./libraries/TellorTransfer.sol";
import "./libraries/TellorGettersLibrary.sol";
import "./libraries/TellorStake.sol";

/**
* @title Tellor Master
* @dev This is a transaction contract designed to perform a temporary configuration on a Tellor Update.
*/
contract TellorTransition {


    using TellorTransfer for TellorStorage.TellorStorageStruct;
    using TellorGettersLibrary for TellorStorage.TellorStorageStruct;
    using TellorStake for TellorStorage.TellorStorageStruct;

    TellorStorage.TellorStorageStruct tellor;

    address public newTellor;
    address public currentTellor;

    /**
    * @dev The constructor sets the original `tellorStorageOwner` of the contract to the sender
    * account, the tellor contract to the Tellor master address and owner to the Tellor master owner address
    * @param _tellorContract is the address for the tellor contract
    */
    constructor(address _currentContract, address _newContract) public {
        currentTellor = _currentContract;
        newTellor = _newContract;
    }


    /**
    * @dev Function to be executed before the first transaction to new version is called. After performing
    * the necessary steps, it just sets the "tellorContract" to the actual new version. 
    */
    function _transition() internal {
        //Perfomr all necessary steps for the transition
        tellor.uintVars[keccak256("currentReward")] = 1e18;
        tellor.uintVars[keccak256("stakeAmount")] = 500e18;

        //After, change the "tellorAddress" to the new version
        tellor.addressVars[keccak256("tellorContract")] = newTellor;
    } 

    /**
    * @dev Function to be verify if the system is in the correct state for executing a transition.
    *  Ex: we're not in the middle of a block;
    */
    function _isReady() internal returns(bool){
        if(tellor.uintVars[keccak256("slotProgress")] == 0){
            return true;
        }
        return false;
    }

   
    /**
    * @dev This will perform the transition and then call the the newer Tellor version
    */
    function() external payable {
        address addr = currentTellor;
        //If contract is ready, perform the transition and set the definitive address as TellorContract;
        if(_isReady()){
            _transition();
        } 
        bytes memory _calldata = msg.data;
        assembly {
            let result := delegatecall(not(0), addr, add(_calldata, 0x20), mload(_calldata), 0, 0)
            let size := returndatasize
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)
            // revert instead of invalid() bc if the underlying call failed with invalid() it already wasted gas.
            // if the call returned error data, forward it
            switch result
                case 0 {
                    revert(ptr, size)
                }
                default {
                    return(ptr, size)
                }
        }
    }
}