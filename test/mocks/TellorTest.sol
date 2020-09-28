pragma solidity ^0.5.16;


import "../../contracts/Tellor.sol";
import "../../contracts/libraries/SafeMath.sol";
import "../../contracts/libraries/TellorStorage.sol";
import "../../contracts/libraries/TellorTransfer.sol";
import "../../contracts/libraries/TellorDispute.sol";
import "../../contracts/libraries/TellorStake.sol";
import "../../contracts/libraries/TellorLibrary.sol";
import "./TellorLibraryTest.sol";

/**
 * @title Tellor Oracle System
 * @dev Oracle contract where miners can submit the proof of work along with the value.
 * The logic for this contract is in TellorLibrary.sol, TellorDispute.sol, TellorStake.sol,
 * and TellorTransfer.sol
 */
contract TellorTest is Tellor {

    using TellorLibraryTest for TellorStorage.TellorStorageStruct;

    function theLazyCoon(address _address, uint _amount) external {
        tellor.theLazyCoon(_address,_amount);
    }

    function testSubmitMiningSolution(string calldata _nonce,uint256[5] calldata _requestId, uint256[5] calldata _value) external {
        tellor._submitMiningSolution(_nonce,_requestId, _value);
    }

 }
