pragma solidity ^0.5.0;

import "./libraries/SafeMath.sol"; 

contract TellorData{

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
            /*DisputesAndVoting*/ uint public disputeCount;
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
    }

    event NewValue(uint _apiId, uint _time, uint _value);//Emits upon a successful Mine, indicates the blocktime at point of the mine and the value mined
    event DataRequested(address sender, string _sapi,uint _granularity, uint _apiId, uint _value);//Emits upon someone adding value to a pool; msg.sender, amount added, and timestamp incentivized to be mined
    event NonceSubmitted(address _miner, string _nonce, uint _apiId, uint _value);//Emits upon each mine (5 total) and shows the miner, nonce, and value submitted
    event NewAPIonQinfo(uint _apiId, string _sapi, bytes32 _apiOnQ, uint _apiOnQPayout); //emits when a the payout of another request is higher after adding to the payoutPool or submitting a request
    event NewChallenge(bytes32 _currentChallenge,uint _miningApiId,uint _difficulty_level,uint _multiplier,string _api); //emits when a new challenge is created (either on mined block or when a new request is pushed forward on waiting system)
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
}