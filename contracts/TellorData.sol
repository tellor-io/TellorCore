pragma solidity ^0.5.0;

import "./libraries/SafeMath.sol"; 

contract TellorData {
    using SafeMath for uint256;
    /*TellorStorage*/ address public tellorContract;//Tellor address
    /*Variables ownable*/
    /*Ownable*/ address public _owner;//Tellor Owner address
    /*Variables Tellor*/
    /*Tellor*/ bytes32 public currentChallenge; //current challenge to be solved
    /*Tellor*/ bytes32 public apiOnQ; //string of current api with highest PayoutPool not currently being mined

    /*DisputesAndVoting*/ uint8 public constant decimals = 18;//18 decimal standard ERC20
    /*DisputesAndVoting*/ uint constant public disputeFee = 1e18;//cost to dispute a mined value
    /*TokenAndStaking*/ uint public total_supply; //total_supply of the token in circulation
    /*TokenAndStaking*/ uint constant public stakeAmt = 1000e18;//stakeAmount for miners (we can cut gas if we just hardcode it in...or should it be variable?)
    /*TokenAndStaking*/ uint public stakers; //number of parties currently staked


    /*Tellor*/ uint public timeOfLastProof = now - now  % timeTarget; // time of last challenge solved
    /*Tellor*/ uint256 public difficulty_level = 1; // Difficulty of current block
    /*Tellor*/ uint public apiIdOnQ; // apiId of the on queue request
    /*Tellor*/ uint public apiOnQPayout; //value of highest api/timestamp PayoutPool
    /*Tellor*/ uint public miningApiId; //API being mined--updates with the ApiOnQ Id 
    /*Tellor*/ uint public requests; // total number of requests through the system
    /*Tellor*/ uint public count;//Number of miners who have mined this value so far
    /*Tellor*/ uint  constant public payoutTotal = 22e18;//Mining Reward in PoWo tokens given to all miners per value
    /*Tellor*/ uint constant public timeTarget = 10 * 60; //The time between blocks (mined Oracle values)
    /*Tellor*/ uint[5] public payoutStructure =  [1e18,5e18,10e18,5e18,1e18];//The structure of the payout (how much uncles vs winner recieve)
    /*Tellor*/ uint[51] public payoutPool; //uint50 array of the top50 requests by payment amount
    /*Tellor*/ uint[] public timestamps; //array of all timestamps requested
    /*DisputesAndVoting*/ uint[] public disputesIds; //array of all disputes

    /*Tellor*/ mapping(bytes32 => mapping(address=>bool)) miners;//This is a boolean that tells you if a given challenge has been completed by a given miner
    /*Tellor*/ mapping(uint => uint) timeToApiId;//minedTimestamp to apiId 
    /*Tellor*/ mapping(uint => uint) payoutPoolIndexToApiId; //link from payoutPoolIndex (position in payout pool array) to apiId
    /*DisputesAndVoting*/ mapping(uint => Dispute) disputes;//disputeId=> Dispute details
    /*DisputesAndVoting*/ mapping(bytes32 => uint) apiId;// api bytes32 gets an id = to count of requests array
    /*TokenAndStaking*/ mapping (address => Checkpoint[]) balances; //balances of a party given blocks
    /*TokenAndStaking*/ mapping(address => mapping (address => uint)) internal allowed; //allowance for a given party and approver
    /*TokenAndStaking*/ mapping(address => StakeInfo)  staker;//mapping from a persons address to their staking info
    /*DisputesAndVoting*/ mapping(uint => API) apiDetails;//mapping of apiID to details
    /*DisputesAndVoting*/mapping(uint => address) propForkAddress;//maps proposalID to struct propFork
    /*DisputesAndVoting*/mapping(bytes32 => uint) disputeHashToId;//maps a hash to an ID for each dispute

    /*DisputesAndVoting*/ string public constant name = "Tellor Tributes"; //name of the Token
    /*DisputesAndVoting*/ string public constant symbol = "TT";//Token Symbol

 
    /*Tellor*/ Details[5] public first_five; //This struct is for organizing the five mined values to find the median
    /*Tellor*/ struct Details {
        uint value;
        address miner;
    }

    /*DisputesAndVoting*/ struct Dispute {
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

    /*TokenAndStaking*/ struct StakeInfo {
        uint current_state;//1=started, 2=LockedForWithdraw 3= OnDispute
        uint startDate; //stake start date
    }
    /*TokenAndStaking*/ struct  Checkpoint {
        uint128 fromBlock;// fromBlock is the block number that the value was generated from
        uint128 value;// value is the amount of tokens at a specific block number
    }

    /*DisputesAndVoting*/ struct API{
        string apiString;//id to string api
        bytes32 apiHash;//hash of string
        uint granularity; //multiplier for miners
        uint index; //index in payoutPool
        uint payout;//current payout of the api, zeroed once mined
        mapping(uint => uint) minedBlockNum;//[apiId][minedTimestamp]=>block.number
        mapping(uint => uint) values;//This the time series of values stored by the contract where uint UNIX timestamp is mapped to value
        mapping(uint => address[5]) minersbyvalue;  
    }    
    event NewValue(uint _apiId, uint _time, uint _value);//Emits upon a successful Mine, indicates the blocktime at point of the mine and the value mined
    event DataRequested(address sender, string _sapi,uint _granularity, uint _apiId, uint _value);//Emits upon someone adding value to a pool; msg.sender, amount added, and timestamp incentivized to be mined
    event NonceSubmitted(address _miner, string _nonce, uint _apiId, uint _value);//Emits upon each mine (5 total) and shows the miner, nonce, and value submitted
    event NewAPIonQinfo(uint _apiId, string _sapi, bytes32 _apiOnQ, uint _apiOnQPayout); //emits when a the payout of another request is higher after adding to the payoutPool or submitting a request
    event NewChallenge(bytes32 _currentChallenge,uint _miningApiId,uint _difficulty_level,string _api); //emits when a new challenge is created (either on mined block or when a new request is pushed forward on waiting system)

    event Approval(address indexed owner, address indexed spender, uint256 value);//ERC20 Approval event
    event Transfer(address indexed from, address indexed to, uint256 value);//ERC20 Transfer Event
    event NewStake(address _sender);//Emits upon new staker
    event StakeWithdrawn(address _sender);//Emits when a staker is now no longer staked
    event StakeWithdrawRequested(address _sender);//Emits when a staker begins the 7 day withdraw period
    event NewDispute(uint _DisputeID, uint _apiId, uint _timestamp);//emitted when a new dispute is initialized
    event Voted(uint _disputeID, bool _position, address _voter);//emitted when a new vote happens
    event DisputeVoteTallied(uint _disputeID, int _result,address _reportedMiner,address _reportingParty, bool _active);//emitted upon dispute tally
    event NewTellorAddress(address _newTellor); //emmited when a proposed fork is voted true
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    /**
    * @dev Get Dispute information
    * @param _disputeId is the dispute id to check the outcome of
    * @return uint of the API id being disputed
    * @return uint of the timestamp being disputed
    * @return uint disputed value
    * @return bool of whether or not vote passed (false until vote is over)
    */
    function getDisputeInfo(uint _disputeId) view external returns(uint, uint, uint,bool) {
        Dispute storage disp = disputes[_disputeId];
        return(disp.apiId, disp.timestamp, disp.value, disp.disputeVotePassed);
    }

    /**
    * @dev Gets length of array containing all disputeIds
    * @return number of disputes through system
    */
    function countDisputes() view external returns(uint) {
        return disputesIds.length;
    }

    /**
    * @dev getter function to get all disputessIds
    * @return uint array of all disputeIds;
    */
    function getDisputesIds() view external returns (uint[] memory){
        return disputesIds;
    }

    /**
    * @dev Gets blocknumber for mined timestamp 
    * @param _apiId to look up
    * @param _timestamp is the timestamp to look up blocknumber
    * @return uint of the blocknumber which the dispute was mined
    */
    function getMinedBlockNum(uint _apiId, uint _timestamp) external view returns(uint){
        return apiDetails[_apiId].minedBlockNum[_timestamp];
    }

    /**
    * @dev Gets the API struct variables that are not mappings
    * @param _apiId to look up
    * @return string of api to query
    * @return bytes32 hash of string
    * @return uint of index in PayoutPool array
    * @return uint of current payout for this api
    */
    function getApiVars(uint _apiId) external view returns(string memory, bytes32,uint, uint, uint) {
        API storage _api = apiDetails[_apiId]; 
        return (_api.apiString, _api.apiHash, _api.granularity,_api.index,_api.payout);
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
        Dispute storage disp = disputes[_disputeId];
        return(disp.reportedMiner, disp.reportingParty, disp.apiId, disp.minExecutionDate, 
            disp.numberOfVotes, disp.blockNumber, disp.index,disp.tally,disp.executed); 
    }
    
    /**
    * @dev Checks if an address voted in a dispute
    * @param _disputeId to look up
    * @param _address to look up
    * @return bool of whether or not party voted
    */
    function didVote(uint _disputeId, address _address) external view returns(bool){
        return disputes[_disputeId].voted[_address];
    }
    /**
    * @dev Checks if a given hash of miner,apiId has been disputed
    * @param _hash of sha256(abi.encodePacked(_miners[2],_apiId));
    * @return uint disputeId
    */
    function getDisputeHashToId(bytes32 _hash) external view returns(uint){
        return  disputeHashToId[_hash];
    }
/**
     *@dev This function returns whether or not a given user is allowed to trade a given amount  
     *@param address of user
     *@param address of amount
    */
    function allowedToTrade(address _user,uint _amount) public view returns(bool){
        if(staker[_user].current_state >0){
            if(balanceOf(_user).sub(stakeAmt).sub(_amount) >= 0){
                return true;
            }
        }
        else if(balanceOf(_user).sub(_amount) >= 0){
                return true;
        }
        return false;
    }

    /**
     *@dev This function tells user is a given address is staked 
     *@param address of staker enquiring about
     *@return bool is the staker is currently staked
    */
    function isStaked(address _staker) public view returns(bool){
        return (staker[_staker].current_state == 1);
    }

    /**
     *@dev This function allows users to retireve all information about a staker
     *@param address of staker enquiring about
     *@return uint current state of staker
     *@return uint startDate of staking
    */
    function getStakerInfo(address _staker) public view returns(uint,uint){
        return (staker[_staker].current_state,staker[_staker].startDate);
    }

    /*****************ERC20 Functions***************/
    /**
    * @dev Gets balance of owner specified
    * @param _user is the owner address used to look up the balance
    * @return Returns the balance associated with the passed in _user
    */
    function balanceOf(address _user) public view returns (uint bal) { 
        return balanceOfAt(_user, block.number); 
    }
/**
    * @dev Queries the balance of _user at a specific _blockNumber
    * @param _user The address from which the balance will be retrieved
    * @param _blockNumber The block number when the balance is queried
    * @return The balance at _blockNumber
    */
    function balanceOfAt(address _user, uint _blockNumber) public view returns (uint) {
        if ((balances[_user].length == 0) || (balances[_user][0].fromBlock > _blockNumber)) {
                return 0;
        }
     else {
        return getValueAt(balances[_user], _blockNumber);
     }
    }
 /**
    * @param _user address
    * @param _spender address
    * @return Returns the remaining allowance of tokens granted to the _spender from the _user
    */
    function allowance(address _user, address _spender) public view returns (uint) {
       return allowed[_user][_spender]; }

    /**
    * @dev Getter for the total_supply of oracle tokens
    * @return total supply
    */
    function totalSupply() public view returns (uint) {
       return total_supply;
    }
    /**
    * @dev Gets the 5 miners who mined the value for the specified apiId/_timestamp 
    * @param _apiId to look up
    * @param _timestamp is the timestampt to look up miners for
    */
    function getMinersByValue(uint _apiId, uint _timestamp) external view returns(address[5] memory){
        return apiDetails[_apiId].minersbyvalue[_timestamp];
    }
    /**
    * @dev This function tells you if a given challenge has been completed by a given miner
    * @param _challenge the challenge to search for
    * @param _miner address that you want to know if they solved the challenge
    * @return true if the _miner address provided solved the 
    */
    function didMine(bytes32 _challenge,address _miner) external view returns(bool){
        return miners[_challenge][_miner];
    }
    
    /**
    * @dev Checks if a value exists for the timestamp provided
    * @param _apiId to look up/check
    * @param _timestamp to look up/check
    * @return true if the value exists/is greater than zero
    */
    function isData(uint _apiId, uint _timestamp) external view returns(bool){
        return (apiDetails[_apiId].values[_timestamp] > 0);
    }

    /**
    * @dev Getter function for currentChallenge difficulty_level
    * @return current challenge, MiningApiID, level of difficulty_level
    */
    function getVariables() external view returns(bytes32, uint, uint,string memory,uint){    
        return (currentChallenge,miningApiId,difficulty_level,apiDetails[miningApiId].apiString,apiDetails[miningApiId].granularity);
    }

    /**
    * @dev Getter function for api on queue
    * @return apionQ hash, id, payout, and api string
    */
    function getVariablesOnQ() external view returns(uint, uint,string memory){    
        return (apiIdOnQ,apiOnQPayout,apiDetails[apiIdOnQ].apiString);
    }

    /**
    * @dev Gets the a value for the latest timestamp available
    * @return value for timestamp of last proof of work submited
    */
    function getLastQuery() external view returns(uint,bool){
        return (retrieveData(timeToApiId[timeOfLastProof], timeOfLastProof),true);
    }
    /**
    * @dev Getter function for apiId based on timestamp. Only one value is mined per
    * timestamp and each timestamp can correspond to a different API. 
    * @param _timestamp to check APIId
    * @return apiId
    */
    function getApiForTime(uint _timestamp) external view returns(uint){    
        return timeToApiId[_timestamp];
    }

    /**
    * @dev Getter function for hash of the api based on apiID
    * @param _apiId the apiId to look up the api string
    * @return api hash - bytes32
    */
    function getApiHash(uint _apiId) external view returns(bytes32){    
        return apiDetails[_apiId].apiHash;
    }

    /**
    * @dev Getter function for apiId based on api hash
    * @param _api string to check if it already has an apiId
    * @return uint apiId
    */
    function getApiId(bytes32 _api) external view returns(uint){    
        return apiId[_api];
    }

    /**
    * @dev Getter function for the payoutPool total for the specified _apiId
    * @param _apiId to look up the total payoutPool value
    * @return the value of the total payoutPool
    */
    function getValuePoolAt(uint _apiId) external view returns(uint){
        return apiDetails[_apiId].payout;
    }

    /**
    * @dev Getter function for the apiId for the specified payoutPool index
    * @param _payoutPoolIndexToApiId to look up the apiId
    * @return apiId
    */
    function getpayoutPoolIndexToApiId(uint _payoutPoolIndexToApiId) external view returns(uint){
        return payoutPoolIndexToApiId[_payoutPoolIndexToApiId];
    }

    /**
    * @dev Retreive value from oracle based on timestamp
    * @param _apiId being requested
    * @param _timestamp to retreive data/value from
    * @return value for timestamp submitted
    */
    function retrieveData(uint _apiId, uint _timestamp) public view returns (uint) {
        return apiDetails[_apiId].values[_timestamp];
    }

        /**
     * @return the address of the owner.
    */
    function owner() public view returns (address) {
        return _owner;
    }

        /**
    * @dev Getter for balance for owner on the specified _block number
    * @param checkpoints gets the mapping for the balances[owner]
    * @param _block is the block number to search the balance on
    */
    function getValueAt(Checkpoint[] storage checkpoints, uint _block) view internal returns (uint) {
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
    event Print(bytes32 _hash);
    event Print2(address _a);
}