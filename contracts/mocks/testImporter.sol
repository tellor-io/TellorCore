pragma solidity 0.5.16;


//Hack for hardhat find this artifacts to compile

//Old Contracts
import "tellorlegacy/contracts/oldContracts/OldTellor.sol";
import "tellorlegacy/contracts/oldContracts/OldTellorMaster.sol";
import "tellorlegacy/contracts/oldContracts/libraries/OldTellorStake.sol";
import "tellorlegacy/contracts/oldContracts/libraries/OldTellorTransfer.sol";
import "tellorlegacy/contracts/oldContracts/libraries/OldTellorDispute.sol";
import "tellorlegacy/contracts/oldContracts/libraries/OldTellorLibrary.sol";

//V2
import "tellorlegacy/contracts/v2/v2Tellor.sol";
import "tellorlegacy/contracts/v2/v2TellorMaster.sol";
import "tellorlegacy/contracts/v2/libraries/v2TellorStake.sol";
import "tellorlegacy/contracts/v2/libraries/v2TellorTransfer.sol";
import "tellorlegacy/contracts/v2/libraries/v2TellorDispute.sol";
import "tellorlegacy/contracts/v2/libraries/v2TellorLibrary.sol";

//v25
import "tellorlegacy/contracts/v25/v25Tellor.sol";
import "tellorlegacy/contracts/v25/v25TellorMaster.sol";
import "tellorlegacy/contracts/v25/v25Transition.sol";
import "tellorlegacy/contracts/v25/mocks/v25TellorTest.sol";
import "tellorlegacy/contracts/v25/mocks/v25TellorLibraryTest.sol";
import "tellorlegacy/contracts/v25/libraries/v25TellorStake.sol";
import "tellorlegacy/contracts/v25/libraries/v25TellorTransfer.sol";
import "tellorlegacy/contracts/v25/libraries/v25TellorDispute.sol";
import "tellorlegacy/contracts/v25/libraries/v25TellorLibrary.sol";

contract testImporter {}