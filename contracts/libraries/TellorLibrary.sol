pragma solidity ^0.5.0;

import "./SafeMath.sol";
import "./Utilities.sol";

/**
 * @title Tellor Oracle System Library
 * @dev Contains the functions' logic for the Tellor contract where miners can submit the proof of work along with the value.
 * @dev Note at the top is the struct.  THE STRUCT SHOULD ALWAYS BE THE SAME AS TellorGettersLibrary.SOL
 * @dev Failure to do so will result in errors with the fallback proxy
 */
library TellorLibrary{
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
        bytes32 queryHash;//hash of api string and granularity e.g. keccak256(abi.encodePacked(_sapi,_granularity))
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
        mapping(uint => uint[5]) valuesByTimestamp;
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

    /*Functions*/
    /*This is a cheat for demo purposes, will delete upon actual launch*/
    function theLazyCoon(TellorStorageStruct storage self,address _address, uint _amount) public {
        self.uintVars[keccak256("total_supply")] += _amount;
        updateBalanceAtNow(self.balances[_address],_amount);
    }

    /*
    * @dev This function gives 5 miners the inital staked tokens in the system.  
    * It would run with the constructor, but throws on too much gas
    * It only runs once or only when the requestCount is zero. 
    */
    function tellorPostConstructor(TellorStorageStruct storage self) public{
        require(self.uintVars[keccak256("requestCount")] == 0);
        //Give this contract 5000 Tellor Tributes so that it can stake the initial 5 miners
        updateBalanceAtNow(self.balances[address(this)], 2**256-1 - 5000e18);

        //the initial 5 miner addresses are specfied below
        //changed payable[5] to 6
        address payable[6] memory _initalMiners = [address(0xE037EC8EC9ec423826750853899394dE7F024fee),
        address(0xcdd8FA31AF8475574B8909F135d510579a8087d3),
        address(0xb9dD5AfD86547Df817DA2d0Fb89334A6F8eDd891),
        address(0x230570cD052f40E14C14a81038c6f3aa685d712B),
        address(0x3233afA02644CCd048587F8ba6e99b3C00A34DcC),
        address(0xe010aC6e0248790e08F42d5F697160DEDf97E024)];
        //Stake each of the 5 miners specified above
        for(uint i=0;i<6;i++){//6th miner to allow for dispute
            updateBalanceAtNow(self.balances[_initalMiners[i]],1000e18);
            self.stakerDetails[_initalMiners[i]] = StakeInfo({
                currentStatus: 1,
                startDate: now - (now % 86400)
                });
            emit NewStake(_initalMiners[i]);
        }
        //update the stakers coutn
        self.uintVars[keccak256("stakerCount")] += 6;//6th miner to allow for dispute
        //update the total suppply
        self.uintVars[keccak256("total_supply")] += 6000e18;//6th miner to allow for dispute
        //Initiate requestQ array...is there a better way?
        for(uint i = 49;i > 0;i--) {
            self.requestQ[i] = 0;
        }
        //set Constants
        self.uintVars[keccak256("decimals")] = 18;
        self.uintVars[keccak256("disputeFee")] = 1e18;
        self.uintVars[keccak256("disputeFee")] = 1e18;
        self.uintVars[keccak256("stakeAmount")] = 1000e18;
        self.uintVars[keccak256("timeTarget")]= 10 * 60;
        self.uintVars[keccak256("timeOfLastNewValue")] = now - now  % self.uintVars[keccak256("timeTarget")];
        self.uintVars[keccak256("difficulty")] = 1;
        self.uintVars[keccak256("miningReward")] = 22e18;
        self.miningRewardDistributions =  [1e18,5e18,10e18,5e18,1e18]; 
        self._name = "Tellor Tributes";
        self._symbol = "TT";
    }


    /**
    * @dev This function returns whether or not a given user is allowed to trade a given amount 
    * and removing the staked amount from their balance if they are staked
    * @param _user address of user
    * @param _amount to check if the user can spend
    * @return true if they are allowed to spend the amount being checked
    */
    function allowedToTrade(TellorStorageStruct storage self,address _user,uint _amount) public view returns(bool){
        if(self.stakerDetails[_user].currentStatus >0){
            //Removes the stakeAmount from balance if the _user is staked
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
    * @dev This function approves a _spender an _amount of tokens to use
    * @param _spender address
    * @param _amount amount the spender is being approved for
    * @return true if spender appproved successfully
    */
    function approve(TellorStorageStruct storage self, address _spender, uint _amount) public returns (bool) {
        require(allowedToTrade(self,msg.sender,_amount));
        self.allowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }


    /**
    * @dev Gets balance of owner specified
    * @param _user is the owner address used to look up the balance
    * @return Returns the balance associated with the passed in _user
    */
    function balanceOf(TellorStorageStruct storage self,address _user) public view returns (uint) { 
        return balanceOfAt(self,_user, block.number); 
    }


    /**
    * @dev Queries the balance of _user at a specific _blockNumber
    * @param _user The address from which the balance will be retrieved
    * @param _blockNumber The block number when the balance is queried
    * @return The balance at _blockNumber specified
    */
    function balanceOfAt(TellorStorageStruct storage self,address _user, uint _blockNumber) public view returns (uint) {
        if ((self.balances[_user].length == 0) || (self.balances[_user][0].fromBlock > _blockNumber)) {
                return 0;
        }
     else {
        return getBalanceAt(self.balances[_user], _blockNumber);
     }
    }

    /** 
    * @dev Completes POWO transfers by updating the balances on the current block number
    * @param _from address to transfer from
    * @param _to addres to transfer to
    * @param _amount to transfer 
    */
    function doTransfer(TellorStorageStruct storage self, address _from, address _to, uint _amount) public {
        require(_amount > 0);
        require(_to != address(0));
        require(allowedToTrade(self,_from,_amount)); //allowedToTrade checks the stakeAmount is removed from balance if the _user is staked
        uint previousBalance = balanceOfAt(self,_from, block.number);
        updateBalanceAtNow(self.balances[_from], previousBalance - _amount);
        previousBalance = balanceOfAt(self,_to, block.number);
        require(previousBalance + _amount >= previousBalance); // Check for overflow
        updateBalanceAtNow(self.balances[_to], previousBalance + _amount);
        emit Transfer(_from, _to, _amount);
    }

    
    /**
    * @dev Getter for balance for owner on the specified _block number
    * @param checkpoints gets the mapping for the balances[owner]
    * @param _block is the block number to search the balance on
    * @return the balance at the checkpoint
    */
    function getBalanceAt(Checkpoint[] storage checkpoints, uint _block) view public returns (uint) {
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



    /**
    * @dev This function allows miners to deposit their stake.
    */
     function depositStake(TellorStorageStruct storage self) public {
        require( balanceOf(self,msg.sender) >= self.uintVars[keccak256("stakeAmount")]);
        
        //Ensure they can only stake if they are not currrently staked or if their stake time frame has ended 
        //and they are currently locked for witdhraw
        require(self.stakerDetails[msg.sender].currentStatus == 0 || self.stakerDetails[msg.sender].currentStatus == 2);
        self.uintVars[keccak256("stakerCount")] += 1;
        self.stakerDetails[msg.sender] = StakeInfo({
            currentStatus: 1,
            
            //this resets their stake start date to today
            startDate: now - (now % 86400)
            });
        emit NewStake(msg.sender);
    }



    /**
    * @dev Helps initialize a dispute by assigning it a disputeId 
    * when a miner returns a false on the validate array(in Tellor.ProofOfWork) it sends the 
    * invalidated value information to POS voting
    * @param _requestId being disputed
    * @param _timestamp being disputed
    * @param _minerIndex the index of the miner that submitted the value being disputed. Since each official value 
    * requires 5 miners to submit a value.
    */
    function beginDispute(TellorStorageStruct storage self,uint _requestId, uint _timestamp,uint _minerIndex) public {
        Request storage _request = self.requestDetails[_requestId];
        //require that no more than a day( (24 hours * 60 minutes)/10minutes=144 blocks) has gone by since the value was "mined" 
        require(block.number- _request.minedBlockNum[_timestamp]<= 144);
        require(_request.minedBlockNum[_timestamp] > 0);
        require(_minerIndex < 5);
        
        //_miner is the miner being disputed. For every mined value 5 miners are saved in an array and the _minerIndex 
        //provided by the party initiating the dispute 
        address _miner = _request.minersByValue[_timestamp][_minerIndex];
        bytes32 _hash = keccak256(abi.encodePacked(_miner,_requestId,_timestamp));
        
        //Ensures that a dispute is not already open for the that miner, requestId and timestamp
        require(self.disputeIdByDisputeHash[_hash] == 0);
        doTransfer(self,msg.sender,address(this), self.uintVars[keccak256("disputeFee")]);
        
        //Increase the dispute count by 1
        self.uintVars[keccak256("disputeCount")] =  self.uintVars[keccak256("disputeCount")] + 1;
        
        //Sets the new disputeCount as the disputeId
        uint disputeId = self.uintVars[keccak256("disputeCount")];
        
        //maps the dispute hash to the disputeId
        self.disputeIdByDisputeHash[_hash] = disputeId;
        //maps the dispute to the Dispute struct
        self.disputesById[disputeId] = Dispute({
            hash:_hash,
            isPropFork: false,
            reportedMiner: _miner, 
            reportingParty: msg.sender, 
            proposedForkAddress:address(0),
            executed: false,
            disputeVotePassed: false,
            tally: 0
            });
        
        //Saves all the dispute variables for the disputeId
        self.disputesById[disputeId].disputeUintVars[keccak256("requestId")] = _requestId;
        self.disputesById[disputeId].disputeUintVars[keccak256("timestamp")] = _timestamp;
        self.disputesById[disputeId].disputeUintVars[keccak256("value")] = _request.valuesByTimestamp[_timestamp][_minerIndex];
        self.disputesById[disputeId].disputeUintVars[keccak256("minExecutionDate")] = now + 7 days;
        self.disputesById[disputeId].disputeUintVars[keccak256("blockNumber")] = block.number;
        self.disputesById[disputeId].disputeUintVars[keccak256("minerSlot")] = _minerIndex;
        
        //Values are sorted as they come in and the official value is the median of the first five
        //So the "official value" miner is always minerIndex==2. If the official value is being 
        //disputed, it sets its status to inDispute(currentStatus = 3) so that users are made aware it is under dispute
        if(_minerIndex == 2){
            self.requestDetails[_requestId].inDispute[_timestamp] = true;
        }
        self.stakerDetails[_miner].currentStatus = 3;
        emit NewDispute(disputeId,_requestId,_timestamp,_miner);
    }

    /**
    * @dev Allows for a transfer of tokens to _to
    * @param _to The address to send tokens to
    * @param _amount The amount of tokens to send
    * @return true if transfer is successful
    */
     function transfer(TellorStorageStruct storage self, address _to, uint256 _amount) internal returns (bool success) {
        doTransfer(self,msg.sender, _to, _amount);
        return true;
    }


    /**
    * @notice Send _amount tokens to _to from _from on the condition it
    * is approved by _from
    * @param _from The address holding the tokens being transferred
    * @param _to The address of the recipient
    * @param _amount The amount of tokens to be transferred
    * @return True if the transfer was successful
    */
    function transferFrom(TellorStorageStruct storage self, address _from, address _to, uint256 _amount) internal returns (bool success) {
        require(self.allowed[_from][msg.sender] >= _amount);
        self.allowed[_from][msg.sender] -= _amount;
        doTransfer(self,_from, _to, _amount);
        return true;
    }

    /**
    * @dev Allows for a fork to be proposed
    * @param _propNewTellorAddress address for new proposed Tellor
    */
    function proposeFork(TellorStorageStruct storage self, address _propNewTellorAddress) internal {
        bytes32 _hash = keccak256(abi.encodePacked(_propNewTellorAddress));
        require(self.disputeIdByDisputeHash[_hash] == 0);
        //Should the fork fee be the same as the dispute fee??? should it be higher?
        doTransfer(self,msg.sender,address(this), self.uintVars[keccak256("disputeFee")]);//This is the fork fee
        self.uintVars[keccak256("disputeCount")]++;
        uint disputeId = self.uintVars[keccak256("disputeCount")];
        self.disputeIdByDisputeHash[_hash] = disputeId;
        self.disputesById[disputeId] = Dispute({
            hash: _hash,
            isPropFork: true,
            reportedMiner: msg.sender, 
            reportingParty: msg.sender, 
            proposedForkAddress: _propNewTellorAddress,
            executed: false,
            disputeVotePassed: false,
            tally: 0
            }); 
        self.disputesById[disputeId].disputeUintVars[keccak256("blockNumber")] = block.number;
        self.disputesById[disputeId].disputeUintVars[keccak256("minExecutionDate")] = now + 7 days;
    }

    /**
    * @dev Add tip to Request value from oracle
    * @param _requestId being requested to be mined
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the onDeckQueryHash, or the api with the highest payout pool
    */
    function addTip(TellorStorageStruct storage self,uint _requestId, uint _tip) public {
        require(_requestId > 0);
        
        //If the tip > 0 transfer the tip to this contract
        if(_tip > 0){
            doTransfer(self,msg.sender,address(this),_tip);
        }
        
        //Update the information for the request that should be mined next based on the tip submitted
        updateOnDeck(self,_requestId,_tip,false);
        emit TipAdded(msg.sender,_requestId,_tip,self.requestDetails[_requestId].apiUintVars[keccak256("totalTip")]);
    }

    /**
    * @dev Request to retreive value from oracle based on timestamp. The tip is not required to be 
    * greater than 0 because there are no tokens in circulation for the initial(genesis) request 
    * @param _c_sapi string API being requested be mined
    * @param _c_symbol is the short string symbol for the api request
    * @param _requestId being requested be mined if it exist otherwise use zero(0)
    * @param _granularity is the number of decimals miners should include on the submitted value
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the onDeckQueryHash, or the api with the highest payout pool
    */
    function requestData(TellorStorageStruct storage self,string memory _c_sapi,string memory _c_symbol, uint _requestId,uint _granularity, uint _tip) internal {
        //Require at least one decimal place
        require(_granularity > 0);
        
        //But no more than 18 decimal places
        require(_granularity <= 1e18);
        
        //If the requestId is not provided check if the string Api (_c_s_sapi) and granularity has already been requested
        // and if it has been requested before then add the tip to it otherwise create the queryHash for it
        if(_requestId == 0){
            string memory _sapi = _c_sapi;
            string memory _symbol = _c_symbol;
            require(bytes(_sapi).length > 0);
            require(bytes(_symbol).length < 64);
            bytes32 _queryHash = keccak256(abi.encodePacked(_sapi,_granularity));
            
            //If this is the first time the API and granularity combination has been requested then create the API and granularity hash 
            //otherwise the tip will be added to the requestId submitted
            if(self.requestIdByQueryHash[_queryHash] == 0){
                self.uintVars[keccak256("requestCount")]++;
                _requestId=self.uintVars[keccak256("requestCount")];
                self.requestDetails[_requestId] = Request({
                    queryString : _sapi, 
                    dataSymbol: _symbol,
                    queryHash: _queryHash,
                    requestTimestamps: new uint[](0)
                    });
                self.requestDetails[_requestId].apiUintVars[keccak256("granularity")] = _granularity;
                self.requestDetails[_requestId].apiUintVars[keccak256("requestQPosition")] = 0;
                self.requestDetails[_requestId].apiUintVars[keccak256("totalTip")] = 0;
                self.requestIdByQueryHash[_queryHash] = _requestId;
                
                //If the tip > 0 it tranfers the tip to this contract
                if(_tip > 0){
                    doTransfer(self,msg.sender,address(this),_tip);
                }
                updateOnDeck(self,_requestId,_tip,false);
                emit DataRequested(msg.sender,self.requestDetails[_requestId].queryString,self.requestDetails[_requestId].dataSymbol,_granularity,_requestId,_tip);
            }
            else{
                addTip(self,self.requestIdByQueryHash[_queryHash],_tip);
            }

        }
        else{
            addTip(self,_requestId,_tip);
        }
    }
    

    /**
    * @dev This function allows stakers to request to withdraw their stake (no longer stake) 
    * once they lock for withdraw(stakes.currentStatus = 2) they are locked for 7 days before they 
    * can withdraw the stake
    */
    function requestStakingWithdraw(TellorStorageStruct storage self) internal {
        StakeInfo storage stakes = self.stakerDetails[msg.sender];
        //Require that the miner is staked
        require(stakes.currentStatus == 1);

        //Change the miner staked to locked to be withdrawStake
        stakes.currentStatus = 2;

        //Change the startDate to now since the lock up period begins now
        //and the miner can only withdraw 7 days later from now(check the withdraw function)
        stakes.startDate = now -(now % 86400);

        //Reduce the staker count
        self.uintVars[keccak256("stakerCount")] -= 1;

        emit StakeWithdrawRequested(msg.sender);
    }


    /**
    * @dev tallies the votes.
    * @param _disputeId is the dispute id
    */
    function tallyVotes(TellorStorageStruct storage self, uint _disputeId) internal {
        Dispute storage disp = self.disputesById[_disputeId];
        Request storage _request = self.requestDetails[disp.disputeUintVars[keccak256("requestId")]];

        //Ensure this has not already been executed/tallied
        require(disp.executed == false);

        //Ensure the time for voting has elapsed
        require(now > disp.disputeUintVars[keccak256("minExecutionDate")]);  

        //If the vote is not a proposed fork 
        if (disp.isPropFork== false){
        StakeInfo storage stakes = self.stakerDetails[disp.reportedMiner];  
            //If the vote for disputing a value is succesful(disp.tally >0) then unstake the reported 
            // miner and transfer the stakeAmount and dispute fee to the reporting party 
            if (disp.tally > 0 ) { 

                //Changing the currentStatus and startDate unstakes the reported miner and allows for the
                //transfer of the stakeAmount
                stakes.currentStatus = 0;
                stakes.startDate = now -(now % 86400);

                //Decreases the stakerCount since the miner's stake is being slashed
                self.uintVars[keccak256("stakerCount")]--;

                //Transfers the StakeAmount from the reporded miner to the reporting party
                doTransfer(self,disp.reportedMiner,disp.reportingParty, self.uintVars[keccak256("stakeAmount")]);
                
                //Returns the dispute fee to the reportingParty
                doTransfer(self,msg.sender,disp.reportingParty, self.uintVars[keccak256("disputeFee")]);
                
                //Set the dispute state to passed/true
                disp.disputeVotePassed = true;

                //If the dispute was succeful(miner found guilty) then update the timestamp value to zero
                //so that users don't use this datapoint
                if(_request.inDispute[disp.disputeUintVars[keccak256("timestamp")]] == true){
                    _request.finalValues[disp.disputeUintVars[keccak256("timestamp")]] = 0;
                }

            //If the vote for disputing a value is unsuccesful then update the miner status from being on 
            //dispute(currentStatus=3) to staked(currentStatus =1) and tranfer the dispute fee to the miner
            } else {
                //Update the miner's current status to staked(currentStatus = 1)
                stakes.currentStatus = 1;

                //update the dispute status to executed
                disp.executed = true;//???should this be right above the emit DisputeVoteTallied??? 

                //Set the dispute state to failed/false
                disp.disputeVotePassed = false;
                
                //tranfer the dispute fee to the miner
                doTransfer(self,msg.sender,disp.reportedMiner, self.uintVars[keccak256("disputeFee")]);
                if(_request.inDispute[disp.disputeUintVars[keccak256("timestamp")]] == true){
                    _request.inDispute[disp.disputeUintVars[keccak256("timestamp")]] = false;
                }
            }

        emit DisputeVoteTallied(_disputeId,disp.tally,disp.reportedMiner,disp.reportingParty,disp.disputeVotePassed); 
        //If the vote is for a proposed fork require a 20% quorum before exceduting the update to the new tellor contract address
        } else {
            //require (disp.tally > 0 ); ??? should this be here too?
            //requires a 20% quorum
            require(disp.disputeUintVars[keccak256("quorum")] >  (self.uintVars[keccak256("total_supply")] * 20 / 100));
            self.addressVars[keccak256("tellorContract")] = disp.proposedForkAddress;
            emit NewTellorAddress(disp.proposedForkAddress);
        }
    }


    /**
    * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
    * @param _nonce uint submitted by miner
    * @param _requestId the apiId being mined
    * @param _value of api query
    */
    function submitMiningSolution(TellorStorageStruct storage self,string memory _nonce, uint _requestId, uint _value) internal{
        //requre miner is staked
        require(self.stakerDetails[msg.sender].currentStatus == 1);
        require(_requestId == self.uintVars[keccak256("currentRequestId")]);
        
        //Saving the challenge information as unique by using the msg.sender
        bytes32 n = sha256(abi.encodePacked(ripemd160(abi.encodePacked(keccak256(abi.encodePacked(self.currentChallenge,msg.sender,_nonce))))));
        require(uint(n) % self.uintVars[keccak256("difficulty")] == 0);
        
        //Make sure the miner does not submit a value more than once
        require(self.minersByChallenge[self.currentChallenge][msg.sender] == false); 
        
        //Save the miner and value received
        self.currentMiners[self.uintVars[keccak256("slotProgress")]].value = _value;
        self.currentMiners[self.uintVars[keccak256("slotProgress")]].miner = msg.sender;
        
        //Add to the count how many values have been submitted, since only 5 are taken per request
        self.uintVars[keccak256("slotProgress")]++;
        
        //Update the miner status to true once they submit a value so they don't submit more than once
        self.minersByChallenge[self.currentChallenge][msg.sender] = true;

        emit NonceSubmitted(msg.sender,_nonce,_requestId,_value,self.currentChallenge);
        
        //If 5 values have been received, adjust the difficulty otherwise sort the values until 5 are received
        if(self.uintVars[keccak256("slotProgress")] == 5) { 
            Request storage _request = self.requestDetails[_requestId];
            
            // If the difference between the timeTarget and how long it takes to solve the challenge this updates the challenge 
            //difficulty up or donw by the difference between the target time and how long it took to solve the prevous challenge
            //otherwise it sets it to 1
            if(int(self.uintVars[keccak256("difficulty")]) + (int(self.uintVars[keccak256("timeTarget")]) - int(now - self.uintVars[keccak256("timeOfLastNewValue")]))/60 > 0){
                self.uintVars[keccak256("difficulty")] = uint(int(self.uintVars[keccak256("difficulty")]) + (int(self.uintVars[keccak256("timeTarget")]) - int(now - self.uintVars[keccak256("timeOfLastNewValue")]))/60);
            }
            else{
                self.uintVars[keccak256("difficulty")] = 1;
            }
            
            //Sets time of value submission rounded to 1 minute
            self.uintVars[keccak256("timeOfLastNewValue")] = now - (now % 1 minutes);
            
            //The sorting algorithm that sorts the values of the first five values that come in
            Details[5] memory a = self.currentMiners;
            uint i;
            for (i = 1;i <5;i++){
                uint temp = a[i].value;
                address temp2 = a[i].miner;
                uint j = i;
                while(j > 0 && temp < a[j-1].value){
                    a[j].value = a[j-1].value;
                    a[j].miner = a[j-1].miner;   
                    j--;
                }
                if(j<i){
                    a[j].value = temp;
                    a[j].miner= temp2;
                }
            }
            
            //Pay the miners according to the reward distribution
            for (i = 0;i <5;i++){
                doTransfer(self,address(this),a[i].miner,self.miningRewardDistributions[i] + self.uintVars[keccak256("currentTotalTips")]/22 * self.miningRewardDistributions[i] / 1e18);
            }
            emit NewValue(_requestId,self.uintVars[keccak256("timeOfLastNewValue")],a[2].value,self.uintVars[keccak256("currentTotalTips")] - self.uintVars[keccak256("currentTotalTips")]%22,self.currentChallenge);
            
            //update the total supply
            self.uintVars[keccak256("total_supply")] += self.uintVars[keccak256("currentTotalTips")] - self.uintVars[keccak256("currentTotalTips")]%22 + self.uintVars[keccak256("miningReward")]*110/100;//can we hardcode this?
            
            //pay the dev-share
            doTransfer(self,address(this),self.addressVars[keccak256("_owner")],(self.uintVars[keccak256("miningReward")] * 10 / 100));//The ten there is the devshare
            //Save the official(finalValue), timestamp of it, 5 miners and their submitted values for it, and its block number
            _request.finalValues[self.uintVars[keccak256("timeOfLastNewValue")]] = a[2].value;
            _request.requestTimestamps.push(self.uintVars[keccak256("timeOfLastNewValue")]);
            //these are miners by timestamp
            _request.minersByValue[self.uintVars[keccak256("timeOfLastNewValue")]] = [a[0].miner,a[1].miner,a[2].miner,a[3].miner,a[4].miner];
            _request.valuesByTimestamp[self.uintVars[keccak256("timeOfLastNewValue")]] = [a[0].value,a[1].value,a[2].value,a[3].value,a[4].value];
            _request.minedBlockNum[self.uintVars[keccak256("timeOfLastNewValue")]] = block.number;
            //miners by challenge hash
            
            //Update the current request to be mined to the requestID with the highest payout??????
            self.uintVars[keccak256("currentRequestId")] = self.uintVars[keccak256("onDeckRequestId")]; 
            self.uintVars[keccak256("currentTotalTips")] = self.uintVars[keccak256("onDeckTotalTips")];
            
            //map the timeOfLastValue to the requestId that was just mined
            self.requestIdByTimestamp[self.uintVars[keccak256("timeOfLastNewValue")]] = _requestId;
            
            //add timeOfLastValue to the newValueTimestamps array
            self.newValueTimestamps.push(self.uintVars[keccak256("timeOfLastNewValue")]);
            
            //re-start the count for the slot progress to zero before the new request mining starts
            self.uintVars[keccak256("slotProgress")] = 0;
            
            //Remove the currentRequestId/onDeckRequestId from the requestQ array containing the rest of the 50 requests
            self.requestQ[self.requestDetails[self.uintVars[keccak256("onDeckRequestId")]].apiUintVars[keccak256("requestQPosition")]] = 0;
            
            //unmap the currentRequestId/onDeckRequestId from the requestIdByRequestQIndex
            self.requestIdByRequestQIndex[self.requestDetails[self.uintVars[keccak256("onDeckRequestId")]].apiUintVars[keccak256("requestQPosition")]] = 0;
            
            //Remove the requestQposition for the currentRequestId/onDeckRequestId since it will be mined next
            self.requestDetails[self.uintVars[keccak256("onDeckRequestId")]].apiUintVars[keccak256("requestQPosition")] = 0;
            
            //Reset the requestId TotalTip to 0 for the currentRequestId/onDeckRequestId since it will be mined next
            //and the tip is going to the current timestamp miners. The tip for the API needs to be reset to zero
            self.requestDetails[self.uintVars[keccak256("onDeckRequestId")]].apiUintVars[keccak256("totalTip")] = 0;
            uint[2] memory nums; //reusable number array -- _amount,_paid,payoutMultiplier
            
            //if the currentRequestId is not zero(currentRequestId exists/something is being mined) select the requestId with the hightest payout 
            //and issue a challenge otherwise dont mine??????? what is the else???
            if(self.uintVars[keccak256("currentRequestId")] > 0){
                
                //gets the max tip in the in the requestQ[51] array and its index within the array??
                (nums[0],nums[1]) = Utilities.getMax(self.requestQ);
                
                //map the onDeckRequestId(select the requestId with highest payout)to the index of highest tip in the requestQ[51] 
                self.uintVars[keccak256("onDeckRequestId")] = self.requestIdByRequestQIndex[nums[1]];
                
                //Set the OnDeckQueryHas to the querHash(api hash) of the selected request
                self.onDeckQueryHash = self.requestDetails[self.uintVars[keccak256("onDeckRequestId")]].queryHash;
                
                //set the totalTips for the OnDeckRequestId to the current total tips for the highest tip request
                self.uintVars[keccak256("onDeckTotalTips")] = nums[0];
                
                //Issue the the next challenge
                self.currentChallenge = keccak256(abi.encodePacked(_nonce,self.currentChallenge, blockhash(block.number - 1))); // Save hash for next proof
                emit NewChallenge(self.currentChallenge,self.uintVars[keccak256("currentRequestId")],self.uintVars[keccak256("difficulty")],self.requestDetails[self.uintVars[keccak256("currentRequestId")]].apiUintVars[keccak256("granularity")],self.requestDetails[self.uintVars[keccak256("currentRequestId")]].queryString,self.uintVars[keccak256("currentTotalTips")]);   
                emit NewRequestOnDeck(self.uintVars[keccak256("onDeckRequestId")],self.requestDetails[self.uintVars[keccak256("onDeckRequestId")]].queryString,self.onDeckQueryHash,self.uintVars[keccak256("onDeckTotalTips")]);    
            }
            else{
                self.uintVars[keccak256("onDeckRequestId")] = 0;
                self.uintVars[keccak256("onDeckTotalTips")] = 0;
                self.onDeckQueryHash = "";
                self.currentChallenge = "";
            }
        }
    }


    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param _newOwner The address to transfer ownership to.
    */
    function transferOwnership(TellorStorageStruct storage self,address payable _newOwner) internal {
            require(msg.sender == self.addressVars[keccak256("_owner")]);
            emit OwnershipTransferred(self.addressVars[keccak256("_owner")], _newOwner);
            self.addressVars[keccak256("_owner")] = _newOwner;
    }


    /**
    * @dev Updates balance for from and to on the current block number via doTransfer
    * @param checkpoints gets the mapping for the balances[owner]
    * @param _value is the new balance
    */
    function updateBalanceAtNow(Checkpoint[] storage checkpoints, uint _value) internal  {
        if ((checkpoints.length == 0) || (checkpoints[checkpoints.length -1].fromBlock < block.number)) {
               Checkpoint storage newCheckPoint = checkpoints[ checkpoints.length++ ];
               newCheckPoint.fromBlock =  uint128(block.number);
               newCheckPoint.value = uint128(_value);
        } else {
               Checkpoint storage oldCheckPoint = checkpoints[checkpoints.length-1];
               oldCheckPoint.value = uint128(_value);
        }
    }
    

    /**
    @dev This function updates APIonQ and the requestQ when requestData or addTip are ran
    @param _requestId being requested
    @param _tip is the tip to add
    @param _mine is 
    */
    function updateOnDeck(TellorStorageStruct storage self,uint _requestId, uint _tip,bool _mine) internal {
        Request storage _request = self.requestDetails[_requestId];
        //If the tip >0 update the tip for the requestId
        if (_tip > 0){
            _request.apiUintVars[keccak256("totalTip")] = _request.apiUintVars[keccak256("totalTip")].add(_tip);
        }
        //Set _payout for the submitted request
        uint _payout = _request.apiUintVars[keccak256("totalTip")];
        
        //If there is no current request being mined
        //then set the currentRequestId to the requestid of the requestData or addtip requestId submitted,
        // the totalTips to the payout/tip submitted, and issue a new mining challenge
        if(self.uintVars[keccak256("currentRequestId")] == 0){
            _request.apiUintVars[keccak256("totalTip")] = 0;
            self.uintVars[keccak256("currentRequestId")] = _requestId;
            self.uintVars[keccak256("currentTotalTips")] = _payout;
            self.currentChallenge = keccak256(abi.encodePacked(_payout, self.currentChallenge, blockhash(block.number - 1))); // Save hash for next proof
            emit NewChallenge(self.currentChallenge,self.uintVars[keccak256("currentRequestId")],self.uintVars[keccak256("difficulty")],self.requestDetails[self.uintVars[keccak256("currentRequestId")]].apiUintVars[keccak256("granularity")],self.requestDetails[self.uintVars[keccak256("currentRequestId")]].queryString,self.uintVars[keccak256("currentTotalTips")]);
        }
        else{

            //If a request is being mined and the _requestId submitted is the request next in line to be mined(OnDeckRequestId)
            // then add the _payout to the OnDeckRequestId 
            if(_requestId == self.uintVars[keccak256("onDeckRequestId")]){
                self.uintVars[keccak256("onDeckTotalTips")] = _payout;
            }
            
            //if the _payout/tip for the submitted request is higher than the OnDecktotaltips
            //or the there is no OnDeckRequestId  && it has not been mined ??? wha is "_mine == false"
            //then replace/add the requestId to be the OnDeckRequestId, queryHash and OnDeckTotalTips(current highest payout, aside from what
            //is being currently mined)
            else if (_payout > self.uintVars[keccak256("onDeckTotalTips")] || (self.uintVars[keccak256("onDeckRequestId")] == 0) && _mine == false) {
                    self.uintVars[keccak256("onDeckRequestId")] = _requestId;
                    self.onDeckQueryHash = _request.queryHash;
                    self.uintVars[keccak256("onDeckTotalTips")] = _payout;
                    //let everyone know the next on queue has been replaced
                    emit NewRequestOnDeck(_requestId,_request.queryString,self.onDeckQueryHash,_payout);
            }
            
            //if the request is not part of the requestQ[51] array and it is not currenlty being mined???
            //then add to the requestQ[51] only if the _payout/tip is greater than the minimum(tip) in the requestQ[51] array
            if(_request.apiUintVars[keccak256("requestQPosition")] == 0 && _mine == false){
                uint _min;
                uint _index;
                (_min,_index) = Utilities.getMin(self.requestQ);
                //if the _payout is greater than the current minimum payout in the requestQ[51] or if the minimum is zero
                //then add it to the requestQ array aand map its index information to the requestId and the apiUintvars
                if(_payout > _min || _min == 0){
                    self.requestQ[_index] = _payout;
                    self.requestIdByRequestQIndex[_index] = _requestId;
                    _request.apiUintVars[keccak256("requestQPosition")] = _index;
                }
            }
            //else if the requestid is part of the requestQ[51] then update the tip for it
            else if (_tip > 0 && _mine == false){
                self.requestQ[_request.apiUintVars[keccak256("requestQPosition")]] += _tip;
            }
        }
    }


    /**
    * @dev Allows token holders to vote
    * @param _disputeId is the dispute id
    * @param _supportsDispute is the vote (true=the dispute has basis false = vote against dispute)
    */
    function vote(TellorStorageStruct storage self, uint _disputeId, bool _supportsDispute) internal {
        Dispute storage disp = self.disputesById[_disputeId];
        
        //Get the voteWeight or the balance of the user at the time/blockNumber the disupte began
        uint voteWeight = balanceOfAt(self,msg.sender,disp.disputeUintVars[keccak256("blockNumber")]);
        
        //Require that the msg.sender has not voted
        require(disp.voted[msg.sender] != true);
        
        //Requre that the user had a balance >0 at time/blockNumber the disupte began
        require(voteWeight > 0);
        
        //ensures miners that are under dispute cannot vote
        require(self.stakerDetails[msg.sender].currentStatus != 3);
        
        //Update user voting status to true
        disp.voted[msg.sender] = true;
        
        //Update the number of votes for the dispute
        disp.disputeUintVars[keccak256("numberOfVotes")] += 1;
        
        //Update the quorum by adding the voteWeight
        disp.disputeUintVars[keccak256("quorum")] += voteWeight; 
        
        //If the user supports the dispute increase the tally for the dispute by the voteWeight
        //otherwise decrease it
        if (_supportsDispute) {
            disp.tally = disp.tally + int(voteWeight);
        } else {
            disp.tally = disp.tally - int(voteWeight);
        }
        
        //Let the network know the user has voted on the dispute and their casted vote
        emit Voted(_disputeId,_supportsDispute,msg.sender);
    }


    /**
    * @dev This function allows users to withdraw their stake after a 7 day waiting period from request 
    */
    function withdrawStake(TellorStorageStruct storage self) internal {
        StakeInfo storage stakes = self.stakerDetails[msg.sender];
        uint _today = now - (now % 86400);

        //Require the staker has locked for withdraw(currentStatus ==2) and that 7 days have 
        //passed by since they locked for withdraw
        require(_today - stakes.startDate >= 7 days && stakes.currentStatus == 2);

        stakes.currentStatus = 0;
        emit StakeWithdrawn(msg.sender);
    }
}
