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
    * @param _user address
    * @param _spender address
    * @return Returns the remaining allowance of tokens granted to the _spender from the _user
    */
    function allowance(address _user, address _spender) external view returns (uint) {
       return tellor.allowance(_user,_spender);
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
    * @dev Gets balance of owner specified
    * @param _user is the owner address used to look up the balance
    * @return Returns the balance associated with the passed in _user
    */
    function balanceOf(address _user) external view returns (uint) { 
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
    * @dev This function tells you if a given challenge has been completed by a given miner
    * @param _challenge the challenge to search for
    * @param _miner address that you want to know if they solved the challenge
    * @return true if the _miner address provided solved the 
    */
    function didMine(bytes32 _challenge,address _miner) external view returns(bool){
        return tellor.didMine(_challenge,_miner);
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


    //self.addressVars[keccak256("_owner")]
    //addressVars[keccak256("tellorContract")]
    function getAddressVars(bytes32 _data) view external returns(address){
        return tellor.getAddressVars(_data);
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
    function getAllDisputeVars(uint _disputeId) public view returns(bytes32, bool, bool, bool, address, address, address,uint[8] memory, int){
        return tellor.getAllDisputeVars(_disputeId);
    }

         /**
    * @dev Getter function for currentChallenge difficulty_level
    * @return current challenge, MiningApiID, level of difficulty_level
    */
    function getCurrentVariables() external view returns(bytes32, uint, uint,string memory,uint,uint){    
        return tellor.getCurrentVariables();
    }

    /**
    * @dev Checks if a given hash of miner,apiId has been disputed
    * @param _hash of sha256(abi.encodePacked(_miners[2],_requestId));
    * @return uint disputeId
    */
    function getDisputeIdByDisputeHash(bytes32 _hash) external view returns(uint){
        return  tellor.getDisputeIdByDisputeHash(_hash);
    }
    
    function getDisputeUintVars(uint _disputeId,bytes32 _data) external view returns(uint){
        return tellor.getDisputeUintVars(_disputeId,_data);
    }
    /**
    * @dev Gets the a value for the latest timestamp available
    * @return value for timestamp of last proof of work submited
    */
    function getLastNewValue() external view returns(uint,bool){
        return tellor.getLastNewValue();
    }

    /**
    * @dev Gets blocknumber for mined timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestamp to look up blocknumber
    * @return uint of the blocknumber which the dispute was mined
    */
    function getMinedBlockNum(uint _requestId, uint _timestamp) external view returns(uint){
        return tellor.getMinedBlockNum(_requestId,_timestamp);
    }
    /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function getMinersByRequestIdAndTimestamp(uint _requestId, uint _timestamp) external view returns(address[5] memory){
        return tellor.getMinersByRequestIdAndTimestamp(_requestId,_timestamp);
    }


    function getNewValueCountbyRequestId(uint _requestId) external view returns(uint){
        return tellor.getNewValueCountbyRequestId(_requestId);
    }
        /**
    * @dev Getter function for the apiId for the specified payoutPool index
    * @param _index to look up the apiId
    * @return apiId
    */
    function getRequestIdByRequestQIndex(uint _index) external view returns(uint){
        return tellor.getRequestIdByRequestQIndex(_index);
    }
        /**
    * @dev Getter function for apiId based on timestamp. Only one value is mined per
    * timestamp and each timestamp can correspond to a different API. 
    * @param _timestamp to check APIId
    * @return apiId
    */
    function getRequestIdByTimestamp(uint _timestamp) external view returns(uint){    
        return tellor.getRequestIdByTimestamp(_timestamp);
    }
   /**
    * @dev Getter function for apiId based on api hash
    * @param _request string to check if it already has an apiId
    * @return uint apiId
    */
    function getRequestIdByQueryHash(bytes32 _request) external view returns(uint){    
        return tellor.getRequestIdByQueryHash(_request);
    }

    function getRequestUintVars(uint _requestId,bytes32 _data) external view returns(uint){
        return tellor.getRequestUintVars(_requestId,_data);
    }

      /**
    * @dev Gets the API struct variables that are not mappings
    * @param _requestId to look up
    * @return string of api to query
    * @return bytes32 hash of string
    * @return uint of index in PayoutPool array
    * @return uint of current payout for this api
    */
    function getRequestVars(uint _requestId) external view returns(string memory, string memory,bytes32,uint, uint, uint) {
        return tellor.getRequestVars(_requestId);
    }



    function getRequestQ() view public returns(uint[51] memory){
        return tellor.getRequestQ();
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
            /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function getSubmissionsByTimestamp(uint _requestId, uint _timestamp) external view returns(uint[5] memory){
        return tellor.getSubmissionsByTimestamp(_requestId,_timestamp);
    }

     function getTimestampbyRequestIDandIndex(uint _requestID, uint _index) external view returns(uint){
        return tellor.getTimestampbyRequestIDandIndex(_requestID,_index);
    }


    function getUintVar(bytes32 _data) view public returns(uint){
        return tellor.getUintVar(_data);
    }



    /**
    * @dev Getter function for api on queue
    * @return apionQ hash, id, payout, and api string
    */
    function getVariablesOnDeck() external view returns(uint, uint,string memory){    
        return tellor.getVariablesOnDeck();
    }
    
    /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function isInDispute(uint _requestId, uint _timestamp) external view returns(bool){
        return tellor.isInDispute(_requestId,_timestamp);
    }
    function name() external view returns(string memory){
        return tellor.name();
    }

    /**
    * @dev Retreive value from oracle based on timestamp
    * @param _requestId being requested
    * @param _timestamp to retreive data/value from
    * @return value for timestamp submitted
    */
    function retrieveData(uint _requestId, uint _timestamp) external view returns (uint) {
        return tellor.retrieveData(_requestId,_timestamp);
    }

    function symbol() external view returns(string memory){
        return tellor.symbol();
    } 

    /**
    * @dev Getter for the total_supply of oracle tokens
    * @return total supply
    */
    function totalSupply() external view returns (uint) {
       return tellor.totalSupply();
    }

}