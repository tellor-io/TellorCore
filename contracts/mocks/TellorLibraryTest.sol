pragma solidity ^0.5.16;


import "../libraries/SafeMath.sol";
import "../libraries/TellorLibrary.sol";
/**
 * @title Tellor Oracle System Library
 * @dev Contains the functions' logic for the Tellor contract where miners can submit the proof of work
 * along with the value and smart contracts can requestData and tip miners.
 */
library TellorLibraryTest {

    using TellorLibrary for TellorStorage.TellorStorageStruct;
    bytes32 public constant total_supply = 0xb1557182e4359a1f0c6301278e8f5b35a776ab58d39892581e357578fb287836; //keccak256("total_supply")

    /*This is a cheat for demo purposes, will delete upon actual launch*/
    function theLazyCoon(TellorStorage.TellorStorageStruct storage self,address _address, uint _amount) public {
        self.uintVars[total_supply] += _amount;
        TellorTransfer.updateBalanceAtNow(self.balances[_address],_amount);
    } 
}
