pragma solidity ^0.5.16;

import "./libraries/TellorStorage.sol";

/**
* @title Tellor Master
* @dev This is a transaction contract designed to perform a temporary configuration on a Tellor Update.
*/
contract TellorTransition {

    TellorStorage.TellorStorageStruct tellor;

    address public constant newTellor = 0x032Aa32e4069318b15e6462CE20926d4d821De90;
    address public constant currentTellor = 0x6511D2957aa09350494f892Ce2881851f0bb26D3;

    /**
    * @dev Function to be executed before the first transaction to new version is called. After performing
    * the necessary steps, it just sets the "tellorContract" to the actual new version. 
    */
    function _transition() internal {
        //Perfomr all necessary steps for the transition
        tellor.uintVars[keccak256("currentReward")] = 1e18;
        tellor.uintVars[keccak256("stakeAmount")] = 500e18;
        tellor.uintVars[keccak256("disputeFee")] = 500e18;

        //After, change the "tellorAddress" to the new version
        tellor.addressVars[keccak256("tellorContract")] = newTellor;
    } 

    /**
    * @dev Function to be verify if the system is in the correct state for executing a transition.
    *  Ex: we're not in the middle of a block;
    */
    function _isReady() internal view returns(bool){
        if(tellor.uintVars[keccak256("slotProgress")] == 0){
            return true;
        }
        return false;
    }

    function() external payable{
        
        address addr = currentTellor;
        //If contract is ready, perform the transition and set the definitive address as TellorContract;
        if(_isReady()){
            _transition();
            addr = newTellor;
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