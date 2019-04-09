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
        bool executed;//is the dispute settled
        bool disputeVotePassed;//did the vote pass?
        bool isPropFork; //true for fork proposal NEW
        address reportedMiner; //miner who alledgedly submitted the 'bad value' will get disputeFee if dispute vote fails
        address reportingParty;//miner reporting the 'bad value'-pay disputeFee will get reportedMiner's stake if dispute vote passes
        uint apiId;//apiID of disputed value
        uint timestamp;//timestamp of distputed value
        uint value; //the value being disputed
        uint minExecutionDate;//7 days from when dispute initialized
        uint numberOfVotes;//the number of parties who have voted on the measure
        uint  blockNumber;// the blocknumber for which votes will be calculated from
        uint index; //index in dispute array
        uint quorum; //quorum for dispute vote NEW
        int tally;//current tally of votes for - against measure
        mapping (address => bool) voted; //mapping of address to whether or not they voted
    } 
    struct StakeInfo {
        uint current_state;//1=started, 2=LockedForWithdraw 3= OnDispute
        uint startDate; //stake start date
    }
    struct  Checkpoint {
        uint128 fromBlock;// fromBlock is the block number that the value was generated from
        uint128 value;// value is the amount of tokens at a specific block number
    }
    struct API{
        string apiString;//id to string api
        string apiSymbol;
        bytes32 apiHash;//hash of string
        uint granularity; //multiplier for miners
        uint index; //index in payoutPool
        uint payout;//current payout of the api, zeroed once mined
        mapping(uint => uint) minedBlockNum;//[apiId][minedTimestamp]=>block.number
        mapping(uint => uint) values;//This the time series of values stored by the contract where uint UNIX timestamp is mapped to value
        mapping(uint => bool) inDispute;//checks if API id is in dispute or finalized.
        mapping(uint => address[5]) minersbyvalue;  
        mapping(uint => uint[5])valuesByTimestamp;
    }    
    struct TellorStorageStruct{
            /*TellorStorage*/ 
            address tellorContract;//Tellor address
            /*Ownable*/ address  _owner;//Tellor Owner address
            /*Tellor*/ bytes32 currentChallenge; //current challenge to be solved
            /*Tellor*/ bytes32 apiOnQ; //string of current api with highest PayoutPool not currently being mined
            mapping(bytes32 => uint) uintVars; 
            // /*DisputesAndVoting*/  keccak256("decimals");    //18 decimal standard ERC20
            // /*DisputesAndVoting*/ keccak256("disputeFee");//cost to dispute a mined value
            // /*DisputesAndVoting*/keccak256("disputeCount");
            // /*TokenAndStaking*/ keccak256("total_supply"); //total_supply of the token in circulation
            // /*TokenAndStaking*/ keccak256("stakeAmt");//stakeAmount for miners (we can cut gas if we just hardcode it in...or should it be variable?)
            // /*TokenAndStaking*/ keccak256("stakers"); //number of parties currently staked
            // /*Tellor*/ keccak256("timeOfLastProof"); // time of last challenge solved
            // /*Tellor*/ keccak256("difficulty_level"); // Difficulty of current block
            // /*Tellor*/ keccak256("apiIdOnQ"); // apiId of the on queue request
            // /*Tellor*/ keccak256("apiOnQPayout"); //value of highest api/timestamp PayoutPool
            //keccak256("miningPayout"); //value of highest api/timestamp PayoutPool
            // /*Tellor*/ keccak256("miningApiId"); //API being mined--updates with the ApiOnQ Id 
            // /*Tellor*/ keccak256("requests"); // total number of requests through the system
            // /*Tellor*/ keccak256("count");//Number of miners who have mined this value so far
            // /*Tellor*/ keccak256("payoutTotal");//Mining Reward in PoWo tokens given to all miners per value
            // /*Tellor*/ keccak256("timeTarget"); //The time between blocks (mined Oracle values)
            /*Tellor*/ uint[5]  payoutStructure;//The structure of the payout (how much uncles vs winner recieve)
            /*Tellor*/ uint[51]  payoutPool; //uint50 array of the top50 requests by payment amount
            /*Tellor*/ uint[]  timestamps; //array of all timestamps requested

            /*Tellor*/ mapping(bytes32 => mapping(address=>bool)) miners;//This is a boolean that tells you if a given challenge has been completed by a given miner
            /*Tellor*/ mapping(uint => uint) timeToApiId;//minedTimestamp to apiId 
            /*Tellor*/ mapping(uint => uint) payoutPoolIndexToApiId; //link from payoutPoolIndex (position in payout pool array) to apiId
            /*DisputesAndVoting*/ mapping(uint => Dispute) disputes;//disputeId=> Dispute details
            /*DisputesAndVoting*/ mapping(bytes32 => uint) apiId;// api bytes32 gets an id = to count of requests array
            /*TokenAndStaking*/ mapping (address => Checkpoint[]) balances; //balances of a party given blocks
            /*TokenAndStaking*/ mapping(address => mapping (address => uint)) allowed; //allowance for a given party and approver
            /*TokenAndStaking*/ mapping(address => StakeInfo)  staker;//mapping from a persons address to their staking info
            /*DisputesAndVoting*/ mapping(uint => API) apiDetails;//mapping of apiID to details
            /*DisputesAndVoting*/mapping(uint => address) propForkAddress;//maps proposalID to struct propFork
            /*DisputesAndVoting*/mapping(bytes32 => uint) disputeHashToId;//maps a hash to an ID for each dispute
            /*DisputesAndVoting*/ string name; //name of the Token
            /*DisputesAndVoting*/ string symbol;//Token Symbol
            /*Tellor*/ Details[5]  first_five; //This struct is for organizing the five mined values to find the median
    }

    event NewValue(uint indexed _apiId, uint _time, uint _value,uint _payout);//Emits upon a successful Mine, indicates the blocktime at point of the mine and the value mined
    event DataRequested(address indexed _sender, string _sapi,string _symbol,uint _granularity, uint indexed _apiId, uint _value);//Emits upon someone adding value to a pool; msg.sender, amount added, and timestamp incentivized to be mined
    event NonceSubmitted(address indexed _miner, string _nonce, uint indexed _apiId, uint _value);//Emits upon each mine (5 total) and shows the miner, nonce, and value submitted
    event NewAPIonQinfo(uint indexed _apiId, string _sapi, bytes32 _apiOnQ, uint _apiOnQPayout); //emits when a the payout of another request is higher after adding to the payoutPool or submitting a request
    event NewChallenge(bytes32 _currentChallenge,uint indexed _miningApiId,uint _difficulty_level,uint _multiplier,string _api); //emits when a new challenge is created (either on mined block or when a new request is pushed forward on waiting system)
    event Approval(address indexed owner, address indexed spender, uint256 value);//ERC20 Approval event
    event Transfer(address indexed from, address indexed to, uint256 value);//ERC20 Transfer Event
    event NewStake(address indexed _sender);//Emits upon new staker
    event StakeWithdrawn(address indexed _sender);//Emits when a staker is now no longer staked
    event StakeWithdrawRequested(address indexed _sender);//Emits when a staker begins the 7 day withdraw period
    event NewDispute(uint indexed _DisputeID, uint indexed _apiId, uint _timestamp);//emitted when a new dispute is initialized
    event Voted(uint indexed _disputeID, bool _position, address indexed _voter);//emitted when a new vote happens
    event DisputeVoteTallied(uint indexed _disputeID, int _result,address indexed _reportedMiner,address _reportingParty, bool _active);//emitted upon dispute tally
    event NewTellorAddress(address _newTellor); //emmited when a proposed fork is voted true
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TipAdded(address indexed _sender,uint indexed _apiId, uint _tip, uint _payout);
    //Tellor Getters

    function tellorMasterConstructor(TellorStorageStruct storage self,address _tellorContract) internal{
        self._owner = msg.sender;
        self.tellorContract = _tellorContract;
        emit NewTellorAddress(_tellorContract);
    }

    
    function getDisputeInfo(TellorStorageStruct storage self,uint _disputeId) view public returns(uint, uint, uint,bool) {
        Dispute storage disp = self.disputes[_disputeId];
        return(disp.apiId, disp.timestamp, disp.value, disp.disputeVotePassed);
    }

    /**
    * @dev Gets blocknumber for mined timestamp 
    * @param _apiId to look up
    * @param _timestamp is the timestamp to look up blocknumber
    * @return uint of the blocknumber which the dispute was mined
    */
    function getMinedBlockNum(TellorStorageStruct storage self,uint _apiId, uint _timestamp) public view returns(uint){
        return self.apiDetails[_apiId].minedBlockNum[_timestamp];
    }

    /**
    * @dev Gets the API struct variables that are not mappings
    * @param _apiId to look up
    * @return string of api to query
    * @return string of symbol of api to query
    * @return bytes32 hash of string
    * @return uint of index in PayoutPool array
    * @return uint of current payout for this api
    */
    function getApiVars(TellorStorageStruct storage self,uint _apiId) public view returns(string memory,string memory, bytes32,uint, uint, uint) {
        API storage _api = self.apiDetails[_apiId]; 
        return (_api.apiString,_api.apiSymbol,_api.apiHash, _api.granularity,_api.index,_api.payout);
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
    function getAllDisputeVars(TellorStorageStruct storage self,uint _disputeId) public view returns(bytes32, bool, bool, bool, address, address, uint[8] memory, int){
        Dispute storage disp = self.disputes[_disputeId];
        return(disp.hash,disp.executed, disp.disputeVotePassed, disp.isPropFork, disp.reportedMiner, disp.reportingParty,[disp.apiId, disp.timestamp, disp.value, disp. minExecutionDate, disp.numberOfVotes, disp.blockNumber, disp.index, disp.quorum],disp.tally);
    }
    /**
    * @dev Checks if an address voted in a dispute
    * @param _disputeId to look up
    * @param _address to look up
    * @return bool of whether or not party voted
    */
    function didVote(TellorStorageStruct storage self,uint _disputeId, address _address) public view returns(bool){
        return self.disputes[_disputeId].voted[_address];
    }
    /**
    * @dev Checks if a given hash of miner,apiId has been disputed
    * @param _hash of sha256(abi.encodePacked(_miners[2],_apiId));
    * @return uint disputeId
    */
    function getDisputeHashToId(TellorStorageStruct storage self,bytes32 _hash) public view returns(uint){
        return  self.disputeHashToId[_hash];
    }
/**
     *@dev This function returns whether or not a given user is allowed to trade a given amount  
     *@param address of user
     *@param address of amount
    */
    function allowedToTrade(TellorStorageStruct storage self,address _user,uint _amount) public view returns(bool){
        if(self.staker[_user].current_state >0){
            if(balanceOf(self,_user).sub(self.uintVars[keccak256("stakeAmt")]).sub(_amount) >= 0){
                return true;
            }
        }
        else if(balanceOf(self,_user).sub(_amount) >= 0){
                return true;
        }
        return false;
    }

    /**
     *@dev This function tells user is a given address is staked 
     *@param address of staker enquiring about
     *@return bool is the staker is currently staked
    */
    function isStaked(TellorStorageStruct storage self,address _staker) public view returns(bool){
        return (self.staker[_staker].current_state == 1);
    }

    /**
     *@dev This function allows users to retireve all information about a staker
     *@param address of staker enquiring about
     *@return uint current state of staker
     *@return uint startDate of staking
    */
    function getStakerInfo(TellorStorageStruct storage self,address _staker) public view returns(uint,uint){
        return (self.staker[_staker].current_state,self.staker[_staker].startDate);
    }

    function stakerCount(TellorStorageStruct storage self) external view returns(uint){
        return self.uintVars[keccak256("stakers")];
    }

    /*****************ERC20 Functions***************/
    /**
    * @dev Gets balance of owner specified
    * @param _user is the owner address used to look up the balance
    * @return Returns the balance associated with the passed in _user
    */
    function balanceOf(TellorStorageStruct storage self,address _user) public view returns (uint bal) { 
        return balanceOfAt(self,_user, block.number); 
    }
/**
    * @dev Queries the balance of _user at a specific _blockNumber
    * @param _user The address from which the balance will be retrieved
    * @param _blockNumber The block number when the balance is queried
    * @return The balance at _blockNumber
    */
    function balanceOfAt(TellorStorageStruct storage self,address _user, uint _blockNumber) public view returns (uint) {
        if ((self.balances[_user].length == 0) || (self.balances[_user][0].fromBlock > _blockNumber)) {
                return 0;
        }
     else {
        return getValueAt(self.balances[_user], _blockNumber);
     }
    }
 /**
    * @param _user address
    * @param _spender address
    * @return Returns the remaining allowance of tokens granted to the _spender from the _user
    */
    function allowance(TellorStorageStruct storage self,address _user, address _spender) internal view returns (uint) {
       return self.allowed[_user][_spender]; }

    /**
    * @dev Getter for the total_supply of oracle tokens
    * @return total supply
    */
    function totalSupply(TellorStorageStruct storage self) internal view returns (uint) {
       return self.uintVars[keccak256("total_supply")];
    }
    /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _apiId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function getMinersByValue(TellorStorageStruct storage self, uint _apiId, uint _timestamp) internal view returns(address[5] memory){
        return self.apiDetails[_apiId].minersbyvalue[_timestamp];
    }
        /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _apiId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function getSubmissionsByTimestamp(TellorStorageStruct storage self, uint _apiId, uint _timestamp) internal view returns(uint[5] memory){
        return self.apiDetails[_apiId].valuesByTimestamp[_timestamp];
    }
    /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _apiId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function isInDispute(TellorStorageStruct storage self, uint _apiId, uint _timestamp) internal view returns(bool){
        return self.apiDetails[_apiId].inDispute[_timestamp];
    }
    /**
    * @dev This function tells you if a given challenge has been completed by a given miner
    * @param _challenge the challenge to search for
    * @param _miner address that you want to know if they solved the challenge
    * @return true if the _miner address provided solved the 
    */
    function didMine(TellorStorageStruct storage self, bytes32 _challenge,address _miner) internal view returns(bool){
        return self.miners[_challenge][_miner];
    }
    
    /**
    * @dev Checks if a value exists for the timestamp provided
    * @param _apiId to look up/check
    * @param _timestamp to look up/check
    * @return true if the value exists/is greater than zero
    */
    function isData(TellorStorageStruct storage self, uint _apiId, uint _timestamp) internal view returns(bool){
        return (self.apiDetails[_apiId].values[_timestamp] > 0);
    }

    /**
    * @dev Getter function for currentChallenge difficulty_level
    * @return current challenge, MiningApiID, level of difficulty_level
    */
    function getVariables(TellorStorageStruct storage self) internal view returns(bytes32, uint, uint,string memory,uint){    
        return (self.currentChallenge,self.uintVars[keccak256("miningApiId")],self.uintVars[keccak256("difficulty_level")],self.apiDetails[self.uintVars[keccak256("miningApiId")]].apiString,self.apiDetails[self.uintVars[keccak256("miningApiId")]].granularity);
    }

    /**
    * @dev Getter function for api on queue
    * @return apionQ hash, id, payout, and api string
    */
    function getVariablesOnQ(TellorStorageStruct storage self) internal view returns(uint, uint,string memory){    
        return (self.uintVars[keccak256("apiIdOnQ")],self.uintVars[keccak256("apiOnQPayout")],self.apiDetails[self.uintVars[keccak256("apiIdOnQ")]].apiString);
    }

    /**
    * @dev Gets the a value for the latest timestamp available
    * @return value for timestamp of last proof of work submited
    */
    function getLastQuery(TellorStorageStruct storage self) internal view returns(uint,bool){
        return (retrieveData(self,self.timeToApiId[self.uintVars[keccak256("timeOfLastProof")]], self.uintVars[keccak256("timeOfLastProof")]),true);
    }
    /**
    * @dev Getter function for apiId based on timestamp. Only one value is mined per
    * timestamp and each timestamp can correspond to a different API. 
    * @param _timestamp to check APIId
    * @return apiId
    */
    function getApiForTime(TellorStorageStruct storage self, uint _timestamp) internal view returns(uint){    
        return self.timeToApiId[_timestamp];
    }

    /**
    * @dev Getter function for hash of the api based on apiID
    * @param _apiId the apiId to look up the api string
    * @return api hash - bytes32
    */
    function getApiHash(TellorStorageStruct storage self, uint _apiId) internal view returns(bytes32){    
        return self.apiDetails[_apiId].apiHash;
    }

    /**
    * @dev Getter function for apiId based on api hash
    * @param _api string to check if it already has an apiId
    * @return uint apiId
    */
    function getApiId(TellorStorageStruct storage self, bytes32 _api) public view returns(uint){    
        return self.apiId[_api];
    }

    /**
    * @dev Getter function for the payoutPool total for the specified _apiId
    * @param _apiId to look up the total payoutPool value
    * @return the value of the total payoutPool
    */
    function getValuePoolAt(TellorStorageStruct storage self, uint _apiId) public view returns(uint){
        return self.apiDetails[_apiId].payout;
    }

    /**
    * @dev Getter function for the apiId for the specified payoutPool index
    * @param _payoutPoolIndexToApiId to look up the apiId
    * @return apiId
    */
    function getpayoutPoolIndexToApiId(TellorStorageStruct storage self, uint _payoutPoolIndexToApiId) public view returns(uint){
        return self.payoutPoolIndexToApiId[_payoutPoolIndexToApiId];
    }

    /**
    * @dev Retreive value from oracle based on timestamp
    * @param _apiId being requested
    * @param _timestamp to retreive data/value from
    * @return value for timestamp submitted
    */
    function retrieveData(TellorStorageStruct storage self, uint _apiId, uint _timestamp) public view returns (uint) {
        return self.apiDetails[_apiId].values[_timestamp];
    }

        /**
     * @return the address of the owner.
    */
    function owner(TellorStorageStruct storage self) public view returns (address) {
        return self._owner;
    }

            /**
     * @return the address of the owner.
    */
    function getTellorContract(TellorStorageStruct storage self) public view returns (address) {
        return self.tellorContract;
    }

        /**
    * @dev Getter for balance for owner on the specified _block number
    * @param checkpoints gets the mapping for the balances[owner]
    * @param _block is the block number to search the balance on
    */
    function getValueAt(Checkpoint[] storage checkpoints, uint _block) view public returns (uint) {
        if (checkpoints.length == 0) return 0;
        if (_block >= checkpoints[checkpoints.length-1].fromBlock)
            return checkpoints[checkpoints.length-1].value;
        if (_block < checkpoints[0].fromBlock) return 0;
        // Binary search of the value in the array
        uint min = 0;
        uint max = checkpoints.length-1;
        while (max > min) {
            uint mid = (max + min + 1)/ 2;
            if (checkpoints[mid].fromBlock<=_block) {
                min = mid;
            } else {
                max = mid-1;
            }
        }
        return checkpoints[min].value;
    }

    function getUintVar(TellorStorageStruct storage self,bytes32 _data) view public returns(uint){
        return self.uintVars[_data];
    }

    function getPayoutPool(TellorStorageStruct storage self) view public returns(uint[51] memory){
        return self.payoutPool;
    }
}
