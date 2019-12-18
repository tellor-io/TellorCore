pragma solidity ^0.5.0;

import "../TellorMaster.sol";
import "../Tellor.sol";
import "./OracleIDDescriptions.sol";
import "../interfaces/ADOInterface.sol";

/**
* @title UserContract
* This contracts creates for easy integration to the Tellor Tellor System
* This contract holds the Ether and Tributes for interacting with the system
* Note it is centralized (we can set the price of Tellor Tributes)
* Once the tellor system is running, this can be set properly.
* Note deploy through centralized 'Tellor Master contract'
*/
contract UserContract is ADOInterface{
    //in Loyas per ETH.  so at 200$ ETH price and 3$ Trib price -- (3/200 * 1e18)
    uint256 public tributePrice;
    address payable public owner;
    address payable public tellorStorageAddress;
    address public oracleIDDescriptionsAddress;
    Tellor _tellor;
    TellorMaster _tellorm;
    OracleIDDescriptions descriptions;

    event OwnershipTransferred(address _previousOwner, address _newOwner);
    event NewPriceSet(uint256 _newPrice);
    event NewDescriptorSet(address _descriptorSet);

    /*Constructor*/
    /**
    * @dev the constructor sets the storage address and owner
    * @param _storage is the TellorMaster address ???
    */
    constructor(address payable _storage) public {
        tellorStorageAddress = _storage;
        _tellor = Tellor(tellorStorageAddress); //we should delcall here
        _tellorm = TellorMaster(tellorStorageAddress);
        owner = msg.sender;
    }

    /*Functions*/
    /*
    * @dev Allows the owner to set the address for the oracleID descriptors
    * used by the ADO members for price key value pairs standarization 
    * _oracleDescriptos is the address for the OracleIDDescptions contract
    */
    function setOracleIDDescriptors(address _oracleDescriptors) external {
        require(msg.sender == owner, "Sender is not owner");
        oracleIDDescriptionsAddress = _oracleDescriptors;
        descriptions = OracleIDDescriptions(_oracleDescriptors);
        emit NewDescriptorSet(_oracleDescriptors);
    }

    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address payable newOwner) external {
        require(msg.sender == owner, "Sender is not owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
    * @dev This function allows the owner to withdraw the ETH paid for requests
    */
    function withdrawEther() external {
        require(msg.sender == owner, "Sender is not owner");
        owner.transfer(address(this).balance);
    }

    /**
    * @dev Allows the contract owner(Tellor) to withdraw any Tributes left on this contract
    */
    function withdrawTokens() external {
        require(msg.sender == owner, "Sender is not owner");
        _tellor.transfer(owner, _tellorm.balanceOf(address(this)));
    }

    /**
    * @dev Allows the user to submit a request for data to the oracle using ETH
    * @param c_sapi string API being requested to be mined
    * @param _c_symbol is the short string symbol for the api request
    * @param _granularity is the number of decimals miners should include on the submitted value
    */
    function requestDataWithEther(string calldata c_sapi, string calldata _c_symbol, uint256 _granularity) external payable {
        uint _amount = (msg.value / tributePrice)*1e18;
        require(_tellorm.balanceOf(address(this)) >= _amount, "Balance is lower than tip amount");
        _tellor.requestData(c_sapi, _c_symbol, _granularity, _amount);
    }

    /**
    * @dev Allows the user to tip miners using ether
    * @param _apiId to tip
    */
    function addTipWithEther(uint256 _apiId) external payable {
        uint _amount = (msg.value / tributePrice)*1e18;
        require(_tellorm.balanceOf(address(this)) >= _amount, "Balance is lower than tip amount");
        _tellor.addTip(_apiId, _amount);
    }

    /**
    * @dev Allows the owner to set the Tribute token price.
    * @param _price to set for Tellor Tribute token
    */
    function setPrice(uint256 _price) public {
        require(msg.sender == owner, "Sender is not owner");
        tributePrice = _price;
        emit NewPriceSet(_price);
    }

    /**
    * @dev Allows the user to get the latest value for the requestId specified
    * @param _requestId is the requestId to look up the value for
    * @return bool true if it is able to retreive a value, the value, and the value's timestamp
    */
    function getCurrentValue(uint256 _requestId) public view returns (bool ifRetrieve, uint256 value, uint256 _timestampRetrieved) {
        uint256 _count = _tellorm.getNewValueCountbyRequestId(_requestId);
        if (_count > 0) {
            _timestampRetrieved = _tellorm.getTimestampbyRequestIDandIndex(_requestId, _count - 1); //will this work with a zero index? (or insta hit?)
            return (true, _tellorm.retrieveData(_requestId, _timestampRetrieved), _timestampRetrieved);
        }
        return (false, 0, 0);
    }

    /**
    * @dev Allows the user to get the latest value for the requestId specified using the 
    * ADO specification for the standard inteface for price oracles
    * @param _bytesId is the ADO standarized bytes32 price/key value pair identifier
    * @return the timestamp, outcome or value/ and the status code (for retreived, null, etc...)
    */
    function resultFor(bytes32 _bytesId) view external returns (uint256 timestamp, int outcome, int status) {
        uint _id = descriptions.getTellorIdFromBytes(_bytesId);
        if (_id > 0){
            bool _didGet;
            uint256 _returnedValue;
            uint256 _timestampRetrieved;
            (_didGet,_returnedValue,_timestampRetrieved) = getCurrentValue(_id);
            if(_didGet){
                return (_timestampRetrieved, int(_returnedValue),descriptions.getStatusFromTellorStatus(1));
            }
            else{
                return (0,0,descriptions.getStatusFromTellorStatus(2));
            }
        }
        return (0, 0, descriptions.getStatusFromTellorStatus(0));
    }
    /**
    * @dev Allows the user to get the first verified value for the requestId after the specified timestamp
    * @param _requestId is the requestId to look up the value for
    * @param _timestamp after which to search for first verified value
    * @return bool true if it is able to retreive a value, the value, and the value's timestamp, the timestamp after
    * which it searched for the first verified value
    */
    function getFirstVerifiedDataAfter(uint256 _requestId, uint256 _timestamp) public view returns (bool, uint256, uint256 _timestampRetrieved) {
        uint256 _count = _tellorm.getNewValueCountbyRequestId(_requestId);
        if (_count > 0) {
            for (uint256 i = _count; i > 0; i--) {
                if (
                    _tellorm.getTimestampbyRequestIDandIndex(_requestId, i - 1) > _timestamp &&
                    _tellorm.getTimestampbyRequestIDandIndex(_requestId, i - 1) < block.timestamp - 86400
                ) {
                    _timestampRetrieved = _tellorm.getTimestampbyRequestIDandIndex(_requestId, i - 1); //will this work with a zero index? (or insta hit?)
                }
            }
            if (_timestampRetrieved > 0) {
                return (true, _tellorm.retrieveData(_requestId, _timestampRetrieved), _timestampRetrieved);
            }
        }
        return (false, 0, 0);
    }

    /**
    * @dev Allows the user to get the first value for the requestId after the specified timestamp
    * @param _requestId is the requestId to look up the value for
    * @param _timestamp after which to search for first verified value
    * @return bool true if it is able to retreive a value, the value, and the value's timestamp
    */
    function getAnyDataAfter(uint256 _requestId, uint256 _timestamp)
        public
        view
        returns (bool _ifRetrieve, uint256 _value, uint256 _timestampRetrieved)
    {
        uint256 _count = _tellorm.getNewValueCountbyRequestId(_requestId);
        if (_count > 0) {
            for (uint256 i = _count; i > 0; i--) {
                if (_tellorm.getTimestampbyRequestIDandIndex(_requestId, i - 1) >= _timestamp) {
                    _timestampRetrieved = _tellorm.getTimestampbyRequestIDandIndex(_requestId, i - 1); //will this work with a zero index? (or insta hit?)
                }
            }
            if (_timestampRetrieved > 0) {
                return (true, _tellorm.retrieveData(_requestId, _timestampRetrieved), _timestampRetrieved);
            }
        }
        return (false, 0, 0);
    }

}
