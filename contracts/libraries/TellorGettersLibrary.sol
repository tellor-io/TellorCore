pragma solidity ^0.5.0;

import "./SafeMath.sol";
import "./Utilities.sol";

/**
 * @title Tellor Oracle System Library
 * @dev Oracle contract where miners can submit the proof of work along with the value.
 * @dev Note at the top is the struct.  THE STRUCT SHOULD ALWAYS BE THE SAME AS TELLORDATA.SOL
 * @dev Failure to do so will result in errors with the fallback proxy
 */
library TellorGettersLibrary{
    using SafeMath for uint256;

    struct Details {
        uint value;
        address miner;
    }

    struct Dispute {
        bytes32 hash;
        int tally;//current tally of votes for - against measure
        bool executed;//is the dispute settled
        bool disputeVotePassed;//did the vote pass?
        bool isPropFork; //true for fork proposal NEW
        address reportedMiner; //miner who alledgedly submitted the 'bad value' will get disputeFee if dispute vote fails
        address reportingParty;//miner reporting the 'bad value'-pay disputeFee will get reportedMiner's stake if dispute vote passes
        address proposedForkAddress;
        mapping(bytes32 => uint) disputeUintVars;
        //Each of the variables below is saved in the mapping disputeUintVars for each disputeID
        //e.g. TellorStorageStruct.DisputeById[disputeID].disputeUintVars[keccak256("requestId")] 
            // uint keccak256("requestId");//apiID of disputed value
            // uint keccak256("timestamp");//timestamp of distputed value
            // uint keccak256("value"); //the value being disputed
            // uint keccak256("minExecutionDate");//7 days from when dispute initialized
            // uint keccak256("numberOfVotes");//the number of parties who have voted on the measure
            // uint keccak256("blockNumber");// the blocknumber for which votes will be calculated from
            // uint keccak256("minerSlot"); //index in dispute array
            // uint keccak256("quorum"); //quorum for dispute vote NEW
        mapping (address => bool) voted; //mapping of address to whether or not they voted
    }  
    struct StakeInfo {
        uint currentStatus;//0-not Staked, 1=Staked, 2=LockedForWithdraw 3= OnDispute
        uint startDate; //stake start date
    }
    struct  Checkpoint {
        uint128 fromBlock;// fromBlock is the block number that the value was generated from
        uint128 value;// value is the amount of tokens at a specific block number
    }
    struct Request{
        string queryString;//id to string api
        string dataSymbol;//short name for api request
        bytes32 queryHash;//hash of string
        uint[]  requestTimestamps; //array of all newValueTimestamps requested
        mapping(bytes32 => uint) apiUintVars;
        //Each of the variables below is saved in the mapping apiUintVars for each api request
        //e.g. requestDetails[_requestId].apiUintVars[keccak256("totalTip")]
            // uint keccak256("granularity"); //multiplier for miners
            // uint keccak256("requestQPosition"); //index in requestQ
            // uint keccak256("totalTip");//bonus portion of payout
        mapping(uint => uint) minedBlockNum;//[apiId][minedTimestamp]=>block.number
        mapping(uint => uint) finalValues;//This the time series of finalValues stored by the contract where uint UNIX timestamp is mapped to value
        mapping(uint => bool) inDispute;//checks if API id is in dispute or finalized.
        mapping(uint => address[5]) minersByValue;  
        mapping(uint => uint[5])valuesByTimestamp;
    }    


    struct TellorStorageStruct{
        bytes32 currentChallenge; //current challenge to be solved
        bytes32 onDeckQueryHash; //string of current api with highest PayoutPool not currently being mined
        string _name; //name of the Token
        string _symbol;//Token Symbol
        uint[5]  miningRewardDistributions;//The structure of the payout (how much uncles vs winner recieve)[1,5,10,5,1]
        uint[51]  requestQ; //uint50 array of the top50 requests by payment amount
        uint[]  newValueTimestamps; //array of all timestamps requested
        Details[5]  currentMiners; //This struct is for organizing the five mined values to find the median
        mapping(bytes32 => address) addressVars;
        //Address fields in the Tellor contract are saved the addressVars mapping
        //e.g. addressVars[keccak256("tellorContract")] = address
            // address keccak256("tellorContract");//Tellor address
            // address  keccak256("_owner");//Tellor Owner address
        mapping(bytes32 => uint) uintVars; 
        //uint fields in the Tellor contract are saved the uintVars mapping
        //e.g. uintVars[keccak256("decimals")] = uint
            // keccak256("decimals");    //18 decimal standard ERC20
            // keccak256("disputeFee");//cost to dispute a mined value
            // keccak256("disputeCount");//totalHistoricalDisputes
            // keccak256("total_supply"); //total_supply of the token in circulation
            // keccak256("stakeAmount");//stakeAmount for miners (we can cut gas if we just hardcode it in...or should it be variable?)
            // keccak256("stakerCount"); //number of parties currently staked
            // keccak256("timeOfLastNewValue"); // time of last challenge solved
            // keccak256("difficulty"); // Difficulty of current block
            // keccak256("onDeckRequestId"); // apiId of the on queue request
            // keccak256("onDeckTotalTips"); //value of highest api/timestamp PayoutPool
            // keccak256("currentTotalTips"); //value of highest api/timestamp PayoutPool
            // keccak256("currentRequestId"); //API being mined--updates with the ApiOnQ Id 
            // keccak256("requestCount"); // total number of requests through the system
            // keccak256("slotProgress");//Number of miners who have mined this value so far
            // keccak256("miningReward");//Mining Reward in PoWo tokens given to all miners per value
            // keccak256("timeTarget"); //The time between blocks (mined Oracle values)
        mapping(bytes32 => mapping(address=>bool)) minersByChallenge;//This is a boolean that tells you if a given challenge has been completed by a given miner
        mapping(uint => uint) requestIdByTimestamp;//minedTimestamp to apiId 
        mapping(uint => uint) requestIdByRequestQIndex; //link from payoutPoolIndex (position in payout pool array) to apiId
        mapping(uint => Dispute) disputesById;//disputeId=> Dispute details
        mapping (address => Checkpoint[]) balances; //balances of a party given blocks
        mapping(address => mapping (address => uint)) allowed; //allowance for a given party and approver
        mapping(address => StakeInfo)  stakerDetails;//mapping from a persons address to their staking info
        mapping(uint => Request) requestDetails;//mapping of apiID to details
        mapping(bytes32 => uint) requestIdByQueryHash;// api bytes32 gets an id = to count of requests array
        mapping(bytes32 => uint) disputeIdByDisputeHash;//maps a hash to an ID for each dispute
    }

    event Approval(address indexed _owner, address indexed _spender, uint256 _value);//ERC20 Approval event
    event DataRequested(address indexed _sender, string _query,string _querySymbol,uint _granularity, uint indexed _requestId, uint _totalTips);//Emits upon someone adding value to a pool; msg.sender, amount added, and timestamp incentivized to be mined
    event DisputeVoteTallied(uint indexed _disputeID, int _result,address indexed _reportedMiner,address _reportingParty, bool _active);//emitted upon dispute tally
    event NewChallenge(bytes32 _currentChallenge,uint indexed _currentRequestId,uint _difficulty,uint _multiplier,string _query,uint _totalTips); //emits when a new challenge is created (either on mined block or when a new request is pushed forward on waiting system)
    event NewDispute(uint indexed _disputeId, uint indexed _requestId, uint _timestamp, address _miner);//emitted when a new dispute is initialized
    event NewRequestOnDeck(uint indexed _requestId, string _query, bytes32 _onDeckQueryHash, uint _onDeckTotalTips); //emits when a the payout of another request is higher after adding to the payoutPool or submitting a request
    event NewStake(address indexed _sender);//Emits upon new staker
    event NewTellorAddress(address _newTellor); //emmited when a proposed fork is voted true
    event NewValue(uint indexed _requestId, uint _time, uint _value,uint _totalTips,bytes32 _currentChallenge);//Emits upon a successful Mine, indicates the blocktime at point of the mine and the value mined
    event NonceSubmitted(address indexed _miner, string _nonce, uint indexed _requestId, uint _value,bytes32 _currentChallenge);//Emits upon each mine (5 total) and shows the miner, nonce, and value submitted
    event OwnershipTransferred(address indexed _previousOwner, address indexed _newOwner);
    event StakeWithdrawn(address indexed _sender);//Emits when a staker is now no longer staked
    event StakeWithdrawRequested(address indexed _sender);//Emits when a staker begins the 7 day withdraw period
    event TipAdded(address indexed _sender,uint indexed _requestId, uint _tip, uint _totalTips);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);//ERC20 Transfer Event
    event Voted(uint indexed _disputeID, bool _position, address indexed _voter);//emitted when a new vote happens
    
    //Tellor Getters
    /**
    * @param _user address
    * @param _spender address
    * @return Returns the remaining allowance of tokens granted to the _spender from the _user
    */
    function allowance(TellorStorageStruct storage self,address _user, address _spender) public view returns (uint) {
       return self.allowed[_user][_spender]; }


    /**
     *@dev This function returns whether or not a given user is allowed to trade a given amount  
     *@param address of user
     *@param address of amount
    */
    function allowedToTrade(TellorStorageStruct storage self,address _user,uint _amount) internal view returns(bool){
        if(self.stakerDetails[_user].currentStatus >0){
            if(balanceOf(self,_user).sub(self.uintVars[keccak256("stakeAmount")]).sub(_amount) >= 0){
                return true;
            }
        }
        else if(balanceOf(self,_user).sub(_amount) >= 0){
                return true;
        }
        return false;
    }


    /**
    * @dev Gets balance of owner specified
    * @param _user is the owner address used to look up the balance
    * @return Returns the balance associated with the passed in _user
    */
    function balanceOf(TellorStorageStruct storage self,address _user) internal view returns (uint) { 
        return balanceOfAt(self,_user, block.number); 
    }

    
    /**
    * @dev Queries the balance of _user at a specific _blockNumber
    * @param _user The address from which the balance will be retrieved
    * @param _blockNumber The block number when the balance is queried
    * @return The balance at _blockNumber
    */
    function balanceOfAt(TellorStorageStruct storage self,address _user, uint _blockNumber) internal view returns (uint) {
        if ((self.balances[_user].length == 0) || (self.balances[_user][0].fromBlock > _blockNumber)) {
                return 0;
        }
     else {
        Checkpoint[] storage checkpoints = self.balances[_user];
        if (checkpoints.length == 0) return 0;
        if (_blockNumber >= checkpoints[checkpoints.length-1].fromBlock)
            return checkpoints[checkpoints.length-1].value;
        if (_blockNumber < checkpoints[0].fromBlock) return 0;
        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length-1;
        while (max > min) {
            uint mid = (max + min + 1)/ 2;
            if (checkpoints[mid].fromBlock<=_blockNumber) {
                min = mid;
            } else {
                max = mid-1;
            }
        }
        return checkpoints[min].value;
     }
    }


    /**
    * @dev This function tells you if a given challenge has been completed by a given miner
    * @param _challenge the challenge to search for
    * @param _miner address that you want to know if they solved the challenge
    * @return true if the _miner address provided solved the 
    */
    function didMine(TellorStorageStruct storage self, bytes32 _challenge,address _miner) internal view returns(bool){
        return self.minersByChallenge[_challenge][_miner];
    }
    

    /**
    * @dev Checks if an address voted in a dispute
    * @param _disputeId to look up
    * @param _address to look up
    * @return bool of whether or not party voted
    */
    function didVote(TellorStorageStruct storage self,uint _disputeId, address _address) internal view returns(bool){
        return self.disputesById[_disputeId].voted[_address];
    }


    //self.addressVars[keccak256("_owner")]
    //addressVars[keccak256("tellorContract")]
    function getAddressVars(TellorStorageStruct storage self, bytes32 _data) view internal returns(address){
        return self.addressVars[_data];
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
    function getAllDisputeVars(TellorStorageStruct storage self,uint _disputeId) internal view returns(bytes32, bool, bool, bool, address, address, address,uint[8] memory, int){
        Dispute storage disp = self.disputesById[_disputeId];
        return(disp.hash,disp.executed, disp.disputeVotePassed, disp.isPropFork, disp.reportedMiner, disp.reportingParty,disp.proposedForkAddress,[disp.disputeUintVars[keccak256("requestId")], disp.disputeUintVars[keccak256("timestamp")], disp.disputeUintVars[keccak256("value")], disp.disputeUintVars[keccak256("minExecutionDate")], disp.disputeUintVars[keccak256("numberOfVotes")], disp.disputeUintVars[keccak256("blockNumber")], disp.disputeUintVars[keccak256("minerSlot")], disp.disputeUintVars[keccak256("quorum")]],disp.tally);
    }


    /**
    * @dev Getter function for currentChallenge difficulty
    * @return current challenge, MiningApiID, level of difficulty
    */
    function getCurrentVariables(TellorStorageStruct storage self) internal view returns(bytes32, uint, uint,string memory,uint,uint){    
        return (self.currentChallenge,self.uintVars[keccak256("currentRequestId")],self.uintVars[keccak256("difficulty")],self.requestDetails[self.uintVars[keccak256("currentRequestId")]].queryString,self.requestDetails[self.uintVars[keccak256("currentRequestId")]].apiUintVars[keccak256("granularity")],self.requestDetails[self.uintVars[keccak256("currentRequestId")]].apiUintVars[keccak256("totalTip")]);
    }


    /**
    * @dev Checks if a given hash of miner,apiId has been disputed
    * @param _hash of sha256(abi.encodePacked(_miners[2],_requestId));
    * @return uint disputeId
    */
    function getDisputeIdByDisputeHash(TellorStorageStruct storage self,bytes32 _hash) internal view returns(uint){
        return  self.disputeIdByDisputeHash[_hash];
    }


    function getDisputeUintVars(TellorStorageStruct storage self,uint _disputeId,bytes32 _data) internal view returns(uint){
        return self.disputesById[_disputeId].disputeUintVars[_data];
    }


    /**
    * @dev Gets the a value for the latest timestamp available
    * @return value for timestamp of last proof of work submited
    */
    function getLastNewValue(TellorStorageStruct storage self) internal view returns(uint,bool){
        return (retrieveData(self,self.requestIdByTimestamp[self.uintVars[keccak256("timeOfLastNewValue")]], self.uintVars[keccak256("timeOfLastNewValue")]),true);
    }


    /**
    * @dev Gets blocknumber for mined timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestamp to look up blocknumber
    * @return uint of the blocknumber which the dispute was mined
    */
    function getMinedBlockNum(TellorStorageStruct storage self,uint _requestId, uint _timestamp) internal view returns(uint){
        return self.requestDetails[_requestId].minedBlockNum[_timestamp];
    }


    /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function getMinersByRequestIdAndTimestamp(TellorStorageStruct storage self, uint _requestId, uint _timestamp) internal view returns(address[5] memory){
        return self.requestDetails[_requestId].minersByValue[_timestamp];
    }


    function getNewValueCountbyRequestId(TellorStorageStruct storage self, uint _requestId) internal view returns(uint){
        return self.requestDetails[_requestId].requestTimestamps.length;
    }

    /**
    * @dev Getter function for the apiId for the specified requestQ index
    * @param _index to look up the apiId
    * @return apiId
    */
    function getRequestIdByRequestQIndex(TellorStorageStruct storage self, uint _index) internal view returns(uint){
        return self.requestIdByRequestQIndex[_index];
    }

    /**
    * @dev Getter function for apiId based on timestamp. Only one value is mined per
    * timestamp and each timestamp can correspond to a different API. 
    * @param _timestamp to check APIId
    * @return apiId
    */
    function getRequestIdByTimestamp(TellorStorageStruct storage self, uint _timestamp) internal view returns(uint){    
        return self.requestIdByTimestamp[_timestamp];
    }

    /**
    * @dev Getter function for apiId based on api hash
    * @param _queryHash string to check if it already has an apiId
    * @return uint apiId
    */
    function getRequestIdByQueryHash(TellorStorageStruct storage self, bytes32 _queryHash) internal view returns(uint){    
        return self.requestIdByQueryHash[_queryHash];
    }


    function getRequestQ(TellorStorageStruct storage self) view internal returns(uint[51] memory){
        return self.requestQ;
    }


    function getRequestUintVars(TellorStorageStruct storage self,uint _requestId,bytes32 _data) internal view returns(uint){
        return self.requestDetails[_requestId].apiUintVars[_data];
    }


    /**
    * @dev Gets the API struct variables that are not mappings
    * @param _requestId to look up
    * @return string of api to query
    * @return string of symbol of api to query
    * @return bytes32 hash of string
    * @return uint of index in PayoutPool array
    * @return uint of current payout for this api
    */
    function getRequestVars(TellorStorageStruct storage self,uint _requestId) internal view returns(string memory,string memory, bytes32,uint, uint, uint) {
        Request storage _request = self.requestDetails[_requestId]; 
        return (_request.queryString,_request.dataSymbol,_request.queryHash, _request.apiUintVars[keccak256("granularity")],_request.apiUintVars[keccak256("requestQPosition")],_request.apiUintVars[keccak256("totalTip")]);
    }


    /**
     *@dev This function allows users to retireve all information about a staker
     *@param address of staker enquiring about
     *@return uint current state of staker
     *@return uint startDate of staking
    */
    function getStakerInfo(TellorStorageStruct storage self,address _staker) internal view returns(uint,uint){
        return (self.stakerDetails[_staker].currentStatus,self.stakerDetails[_staker].startDate);
    }


    /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function getSubmissionsByTimestamp(TellorStorageStruct storage self, uint _requestId, uint _timestamp) internal view returns(uint[5] memory){
        return self.requestDetails[_requestId].valuesByTimestamp[_timestamp];
    }


    function getTimestampbyRequestIDandIndex(TellorStorageStruct storage self,uint _requestID, uint _index) internal view returns(uint){
        return self.requestDetails[_requestID].requestTimestamps[_index];
    }


    //self.uintVars[keccak256("stakerCount")]
    function getUintVar(TellorStorageStruct storage self,bytes32 _data) view internal returns(uint){
        return self.uintVars[_data];
    }


    /**
    * @dev Getter function for api on queue
    * @return apionQ hash, id, payout, and api string
    */
    function getVariablesOnDeck(TellorStorageStruct storage self) internal view returns(uint, uint,string memory){    
        return (self.uintVars[keccak256("onDeckRequestId")],self.uintVars[keccak256("onDeckTotalTips")],self.requestDetails[self.uintVars[keccak256("onDeckRequestId")]].queryString);
    }


    /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _requestId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function isInDispute(TellorStorageStruct storage self, uint _requestId, uint _timestamp) internal view returns(bool){
        return self.requestDetails[_requestId].inDispute[_timestamp];
    }

    //add tests for these
    //should I just drop these?
    function name(TellorStorageStruct storage self) internal returns(string memory){
        return self._name;
    }

    /**
    * @dev Retreive value from oracle based on timestamp
    * @param _requestId being requested
    * @param _timestamp to retreive data/value from
    * @return value for timestamp submitted
    */
    function retrieveData(TellorStorageStruct storage self, uint _requestId, uint _timestamp) internal view returns (uint) {
        return self.requestDetails[_requestId].finalValues[_timestamp];
    }

    function symbol(TellorStorageStruct storage self) internal returns(string memory){
        return self._symbol;
    } 

    //Only needs to be in library
    function tellorMasterConstructor(TellorStorageStruct storage self,address _tellorContract) internal{
        self.addressVars[keccak256("_owner")] = msg.sender;
        self.addressVars[keccak256("tellorContract")]= _tellorContract;
        emit NewTellorAddress(_tellorContract);
    }


    /**
    * @dev Getter for the total_supply of oracle tokens
    * @return total supply
    */
    function totalSupply(TellorStorageStruct storage self) internal view returns (uint) {
       return self.uintVars[keccak256("total_supply")];
    }

}
