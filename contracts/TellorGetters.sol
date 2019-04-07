pragma solidity ^0.5.0;

import "./libraries/SafeMath.sol"; 
import "./libraries/TellorGettersLibrary.sol";

//add in base getters for eteernal storage
//add in getters for public variables

contract TellorGetters{
    using SafeMath for uint256;
    using TellorGettersLibrary for TellorGettersLibrary.TellorStorageStruct;
    TellorGettersLibrary.TellorStorageStruct tellor;
    /**
    * @dev Get Dispute information
    * @param _disputeId is the dispute id to check the outcome of
    * @return uint of the API id being disputed
    * @return uint of the timestamp being disputed
    * @return uint disputed value
    * @return bool of whether or not vote passed (false until vote is over)
    */
    function getDisputeInfo(uint _disputeId) view external returns(uint, uint, uint,bool) {
        return tellor.getDisputeInfo(_disputeId);
    }

    /**
    * @dev Gets blocknumber for mined timestamp 
    * @param _apiId to look up
    * @param _timestamp is the timestamp to look up blocknumber
    * @return uint of the blocknumber which the dispute was mined
    */
    function getMinedBlockNum(uint _apiId, uint _timestamp) external view returns(uint){
        return tellor.getMinedBlockNum(_apiId,_timestamp);
    }

    /**
    * ADD EVERYTHING TO THIS
    * @dev Gets the API struct variables that are not mappings
    * @param _apiId to look up
    * @return string of api to query
    * @return bytes32 hash of string
    * @return uint of index in PayoutPool array
    * @return uint of current payout for this api
    */
    function getApiVars(uint _apiId) external view returns(string memory, bytes32,uint, uint, uint) {
        return tellor.getApiVars(_apiId);
    }

    /**
    * @dev Gets all dispute variables
    * @param _disputeId to look up
    * @return address of reported miner
    * @return address of reporting party
    * @return disputed apiId
    * @return disputed minimum execution date
    * @return uint number of votes
    * @return uint blockNumber of vote
    * @return uint index in disputeId array
    * @return int count of the current tally
    * @return bool of whether vote has been tallied
    */
    function getAllDisputeVars(uint _disputeId) external view returns(address, address, uint, uint, uint ,uint, uint, int, bool){
        return tellor.getAllDisputeVars(_disputeId);
    }
    
    /**
    * @dev Checks if an address voted in a dispute
    * @param _disputeId to look up
    * @param _address to look up
    * @return bool of whether or not party voted
    */
    function didVote(uint _disputeId, address _address) external view returns(bool){
        return tellor.didVote(_disputeId,_address);
    }
    /**
    * @dev Checks if a given hash of miner,apiId has been disputed
    * @param _hash of sha256(abi.encodePacked(_miners[2],_apiId));
    * @return uint disputeId
    */
    function getDisputeHashToId(bytes32 _hash) external view returns(uint){
        return  tellor.getDisputeHashToId(_hash);
    }
/**
     *@dev This function returns whether or not a given user is allowed to trade a given amount  
     *@param address of user
     *@param address of amount
    */
    function allowedToTrade(address _user,uint _amount) external view returns(bool){
        return tellor.allowedToTrade(_user,_amount);
    }

    /**
     *@dev This function tells user is a given address is staked 
     *@param address of staker enquiring about
     *@return bool is the staker is currently staked
    */
    function isStaked(address _staker) external view returns(bool){
        return tellor.isStaked(_staker);
    }

        function stakerCount() external view returns(uint){
        return tellor.stakerCount();
    }

    /**
     *@dev This function allows users to retireve all information about a staker
     *@param address of staker enquiring about
     *@return uint current state of staker
     *@return uint startDate of staking
    */
    function getStakerInfo(address _staker) external view returns(uint,uint){
        return tellor.getStakerInfo(_staker);
    }

    /*****************ERC20 Functions***************/
    /**
    * @dev Gets balance of owner specified
    * @param _user is the owner address used to look up the balance
    * @return Returns the balance associated with the passed in _user
    */
    function balanceOf(address _user) external view returns (uint bal) { 
        return tellor.balanceOf(_user);
    }
/**
    * @dev Queries the balance of _user at a specific _blockNumber
    * @param _user The address from which the balance will be retrieved
    * @param _blockNumber The block number when the balance is queried
    * @return The balance at _blockNumber
    */
    function balanceOfAt(address _user, uint _blockNumber) external view returns (uint) {
        return tellor.balanceOfAt(_user,_blockNumber);
    }
 /**
    * @param _user address
    * @param _spender address
    * @return Returns the remaining allowance of tokens granted to the _spender from the _user
    */
    function allowance(address _user, address _spender) external view returns (uint) {
       return tellor.allowance(_user,_spender);
    }

    /**
    * @dev Getter for the total_supply of oracle tokens
    * @return total supply
    */
    function totalSupply() external view returns (uint) {
       return tellor.totalSupply();
    }
    /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _apiId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function getMinersByValue(uint _apiId, uint _timestamp) external view returns(address[5] memory){
        return tellor.getMinersByValue(_apiId,_timestamp);
    }
        /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _apiId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function getSubmissionsByTimestamp(uint _apiId, uint _timestamp) external view returns(uint[5] memory){
        return tellor.getSubmissionsByTimestamp(_apiId,_timestamp);
    }
    /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _apiId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function isInDispute(uint _apiId, uint _timestamp) external view returns(bool){
        return tellor.isInDispute(_apiId,_timestamp);
    }
    /**
    * @dev This function tells you if a given challenge has been completed by a given miner
    * @param _challenge the challenge to search for
    * @param _miner address that you want to know if they solved the challenge
    * @return true if the _miner address provided solved the 
    */
    function didMine(bytes32 _challenge,address _miner) external view returns(bool){
        return tellor.didMine(_challenge,_miner);
    }
    
    /**
    * @dev Checks if a value exists for the timestamp provided
    * @param _apiId to look up/check
    * @param _timestamp to look up/check
    * @return true if the value exists/is greater than zero
    */
    function isData(uint _apiId, uint _timestamp) external view returns(bool){
        return tellor.isData(_apiId,_timestamp);
    }

    /**
    * @dev Getter function for currentChallenge difficulty_level
    * @return current challenge, MiningApiID, level of difficulty_level
    */
    function getVariables() external view returns(bytes32, uint, uint,string memory,uint){    
        return tellor.getVariables();
    }

    /**
    * @dev Getter function for api on queue
    * @return apionQ hash, id, payout, and api string
    */
    function getVariablesOnQ() external view returns(uint, uint,string memory){    
        return tellor.getVariablesOnQ();
    }

    /**
    * @dev Gets the a value for the latest timestamp available
    * @return value for timestamp of last proof of work submited
    */
    function getLastQuery() external view returns(uint,bool){
        return tellor.getLastQuery();
    }
    /**
    * @dev Getter function for apiId based on timestamp. Only one value is mined per
    * timestamp and each timestamp can correspond to a different API. 
    * @param _timestamp to check APIId
    * @return apiId
    */
    function getApiForTime(uint _timestamp) external view returns(uint){    
        return tellor.getApiForTime(_timestamp);
    }

    /**
    * @dev Getter function for hash of the api based on apiID
    * @param _apiId the apiId to look up the api string
    * @return api hash - bytes32
    */
    function getApiHash(uint _apiId) external view returns(bytes32){    
        return tellor.getApiHash(_apiId);
    }

    /**
    * @dev Getter function for apiId based on api hash
    * @param _api string to check if it already has an apiId
    * @return uint apiId
    */
    function getApiId(bytes32 _api) external view returns(uint){    
        return tellor.getApiId(_api);
    }

    /**
    * @dev Getter function for the payoutPool total for the specified _apiId
    * @param _apiId to look up the total payoutPool value
    * @return the value of the total payoutPool
    */
    function getValuePoolAt(uint _apiId) external view returns(uint){
        return tellor.getValuePoolAt(_apiId);
    }

    /**
    * @dev Getter function for the apiId for the specified payoutPool index
    * @param _payoutPoolIndexToApiId to look up the apiId
    * @return apiId
    */
    function getpayoutPoolIndexToApiId(uint _payoutPoolIndexToApiId) external view returns(uint){
        return tellor.getpayoutPoolIndexToApiId(_payoutPoolIndexToApiId);
    }

    /**
    * @dev Retreive value from oracle based on timestamp
    * @param _apiId being requested
    * @param _timestamp to retreive data/value from
    * @return value for timestamp submitted
    */
    function retrieveData(uint _apiId, uint _timestamp) external view returns (uint) {
        return tellor.retrieveData(_apiId,_timestamp);
    }

        /**
     * @return the address of the owner.
    */
    function owner() external view returns (address) {
        return tellor._owner;
    }

            /**
     * @return the address of the owner.
    */
    function getTellorContract() external view returns (address) {
        return tellor.tellorContract;
    }

        function getUintVar(bytes32 _data) view public returns(uint){
        return tellor.getUintVar(_data);
    }
}