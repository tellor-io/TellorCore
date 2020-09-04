pragma solidity ^0.5.16;


/**
* @title Tellor Transfer
* @dev Contains the methods related to transfers and ERC20. Tellor.sol and TellorGetters.sol
* reference this library for function's logic.
*/
library RefTellorTransfer {
    using RefSafeMath for uint256;

    event Approval(address indexed _owner, address indexed _spender, uint256 _value); //ERC20 Approval event
    event Transfer(address indexed _from, address indexed _to, uint256 _value); //ERC20 Transfer Event

    /*Functions*/

    /**
    * @dev Allows for a transfer of tokens to _to
    * @param _to The address to send tokens to
    * @param _amount The amount of tokens to send
    * @return true if transfer is successful
    */
    function transfer(RefTellorStorage.TellorStorageStruct storage self, address _to, uint256 _amount) public returns (bool success) {
        doTransfer(self, msg.sender, _to, _amount);
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
    function transferFrom(RefTellorStorage.TellorStorageStruct storage self, address _from, address _to, uint256 _amount)
        public
        returns (bool success)
    {
        require(self.allowed[_from][msg.sender] >= _amount, "Allowance is wrong");
        self.allowed[_from][msg.sender] -= _amount;
        doTransfer(self, _from, _to, _amount);
        return true;
    }

    /**
    * @dev This function approves a _spender an _amount of tokens to use
    * @param _spender address
    * @param _amount amount the spender is being approved for
    * @return true if spender appproved successfully
    */
    function approve(RefTellorStorage.TellorStorageStruct storage self, address _spender, uint256 _amount) public returns (bool) {
        require(_spender != address(0), "Spender is 0-address");
        require(self.allowed[msg.sender][_spender] == 0 || _amount == 0, "Spender is already approved");
        self.allowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    /**
    * @param _user address of party with the balance
    * @param _spender address of spender of parties said balance
    * @return Returns the remaining allowance of tokens granted to the _spender from the _user
    */
    function allowance(RefTellorStorage.TellorStorageStruct storage self, address _user, address _spender) public view returns (uint256) {
        return self.allowed[_user][_spender];
    }

    /**
    * @dev Completes POWO transfers by updating the balances on the current block number
    * @param _from address to transfer from
    * @param _to addres to transfer to
    * @param _amount to transfer
    */
    function doTransfer(RefTellorStorage.TellorStorageStruct storage self, address _from, address _to, uint256 _amount) public {
        //require(_amount != 0, "Tried to send non-positive amount");
        //require(_to != address(0), "Receiver is 0 address");
        require(allowedToTrade(self, _from, _amount), "Should have sufficient balance to trade");
        uint256 previousBalance = balanceOf(self, _from);
        updateBalanceAtNow(self.balances[_from], previousBalance - _amount);
        previousBalance = balanceOf(self,_to);
        require(previousBalance + _amount >= previousBalance, "Overflow happened"); // Check for overflow
        updateBalanceAtNow(self.balances[_to], previousBalance + _amount);
        emit Transfer(_from, _to, _amount);
    }

    /**
    * @dev Gets balance of owner specified
    * @param _user is the owner address used to look up the balance
    * @return Returns the balance associated with the passed in _user
    */
    function balanceOf(RefTellorStorage.TellorStorageStruct storage self, address _user) public view returns (uint256) {
        return balanceOfAt(self, _user, block.number);
    }

    /**
    * @dev Queries the balance of _user at a specific _blockNumber
    * @param _user The address from which the balance will be retrieved
    * @param _blockNumber The block number when the balance is queried
    * @return The balance at _blockNumber specified
    */
    function balanceOfAt(RefTellorStorage.TellorStorageStruct storage self, address _user, uint256 _blockNumber) public view returns (uint256) {
        RefTellorStorage.Checkpoint[] storage checkpoints = self.balances[_user];
        if (checkpoints.length == 0|| checkpoints[0].fromBlock > _blockNumber) {
            return 0;
        } else {
            if (_blockNumber >= checkpoints[checkpoints.length - 1].fromBlock) return checkpoints[checkpoints.length - 1].value;
            // Binary search of the value in the array
            uint256 min = 0;
            uint256 max = checkpoints.length - 2;
            while (max > min) {
                uint256 mid = (max + min + 1) / 2;
                if  (checkpoints[mid].fromBlock ==_blockNumber){
                    return checkpoints[mid].value;
                }else if(checkpoints[mid].fromBlock < _blockNumber) {
                    min = mid;
                } else {
                    max = mid - 1;
                }
            }
            return checkpoints[min].value;
        }
    }
    /**
    * @dev This function returns whether or not a given user is allowed to trade a given amount
    * and removing the staked amount from their balance if they are staked
    * @param _user address of user
    * @param _amount to check if the user can spend
    * @return true if they are allowed to spend the amount being checked
    */
    function allowedToTrade(RefTellorStorage.TellorStorageStruct storage self, address _user, uint256 _amount) public view returns (bool) {
        if (self.stakerDetails[_user].currentStatus != 0 && self.stakerDetails[_user].currentStatus < 5) {
            //Subtracts the stakeAmount from balance if the _user is staked
            if (balanceOf(self, _user)- self.uintVars[keccak256("stakeAmount")] >= _amount) {
                return true;
            }
            return false;
        } 
        return (balanceOf(self, _user) >= _amount);
    }

    /**
    * @dev Updates balance for from and to on the current block number via doTransfer
    * @param checkpoints gets the mapping for the balances[owner]
    * @param _value is the new balance
    */
    function updateBalanceAtNow(RefTellorStorage.Checkpoint[] storage checkpoints, uint256 _value) public {
        if (checkpoints.length == 0 || checkpoints[checkpoints.length - 1].fromBlock != block.number) {
           checkpoints.push(RefTellorStorage.Checkpoint({
                fromBlock : uint128(block.number),
                value : uint128(_value)
            }));
        } else {
            RefTellorStorage.Checkpoint storage oldCheckPoint = checkpoints[checkpoints.length - 1];
            oldCheckPoint.value = uint128(_value);
        }
    }
}

/**
* itle Tellor Stake
* @dev Contains the methods related to miners staking and unstaking. Tellor.sol
* references this library for function's logic.
*/

library RefTellorStake {
    event NewStake(address indexed _sender); //Emits upon new staker
    event StakeWithdrawn(address indexed _sender); //Emits when a staker is now no longer staked
    event StakeWithdrawRequested(address indexed _sender); //Emits when a staker begins the 7 day withdraw period

    /*Functions*/

    /**
    * @dev Getter function for the top 5 requests with highest payouts. This function is used within the getNewVariablesOnDeck function
    * @return uint256[5] is an array with the top 5(highest payout) _requestIds at the time the function is called
    */
    function getTopRequestIDs(RefTellorStorage.TellorStorageStruct storage self) internal view returns (uint256[5] memory _requestIds) {
        uint256[5] memory _max;
        uint256[5] memory _index;
        (_max, _index) = RefUtilities.getMax5(self.requestQ);
        for(uint i=0;i<5;i++){
            if(_max[i] != 0){
                _requestIds[i] = self.requestIdByRequestQIndex[_index[i]];
            }
            else{
                _requestIds[i] = self.currentMiners[4-i].value;
            }
        }
    }
 
}



pragma solidity ^0.5.16;

//Slightly modified SafeMath library - includes a min and max function, removes useless div function
library RefSafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }

    function add(int256 a, int256 b) internal pure returns (int256 c) {
        if (b > 0) {
            c = a + b;
            assert(c >= a);
        } else {
            c = a + b;
            assert(c <= a);
        }
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    function max(int256 a, int256 b) internal pure returns (uint256) {
        return a > b ? uint256(a) : uint256(b);
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function sub(int256 a, int256 b) internal pure returns (int256 c) {
        if (b > 0) {
            c = a - b;
            assert(c <= a);
        } else {
            c = a - b;
            assert(c >= a);
        }

    }
}

pragma solidity ^0.5.0;

/**
 * @title Tellor Oracle Storage Library
 * @dev Contains all the variables/structs used by Tellor
 */

library RefTellorStorage {
    //Internal struct for use in proof-of-work submission
    struct Details {
        uint256 value;
        address miner;
    }

    struct Dispute {
        bytes32 hash; //unique hash of dispute: keccak256(_miner,_requestId,_timestamp)
        int256 tally; //current tally of votes for - against measure
        bool executed; //is the dispute settled
        bool disputeVotePassed; //did the vote pass?
        bool isPropFork; //true for fork proposal NEW
        address reportedMiner; //miner who alledgedly submitted the 'bad value' will get disputeFee if dispute vote fails
        address reportingParty; //miner reporting the 'bad value'-pay disputeFee will get reportedMiner's stake if dispute vote passes
        address proposedForkAddress; //new fork address (if fork proposal)
        mapping(bytes32 => uint256) disputeUintVars;
        //Each of the variables below is saved in the mapping disputeUintVars for each disputeID
        //e.g. TellorStorageStruct.DisputeById[disputeID].disputeUintVars[keccak256("requestId")]
        //These are the variables saved in this mapping:
        // uint keccak256("requestId");//apiID of disputed value
        // uint keccak256("timestamp");//timestamp of distputed value
        // uint keccak256("value"); //the value being disputed
        // uint keccak256("minExecutionDate");//7 days from when dispute initialized
        // uint keccak256("numberOfVotes");//the number of parties who have voted on the measure
        // uint keccak256("blockNumber");// the blocknumber for which votes will be calculated from
        // uint keccak256("minerSlot"); //index in dispute array
        // uint keccak256("fee"); //fee paid corresponding to dispute
        mapping(address => bool) voted; //mapping of address to whether or not they voted
    }

    struct StakeInfo {
        uint256 currentStatus; //0-not Staked, 1=Staked, 2=LockedForWithdraw 3= OnDispute 4=ReadyForUnlocking 5=Unlocked
        uint256 startDate; //stake start date
    }

    //Internal struct to allow balances to be queried by blocknumber for voting purposes
    struct Checkpoint {
        uint128 fromBlock; // fromBlock is the block number that the value was generated from
        uint128 value; // value is the amount of tokens at a specific block number
    }

    struct Request {
        string queryString; //id to string api
        string dataSymbol; //short name for api request
        bytes32 queryHash; //hash of api string and granularity e.g. keccak256(abi.encodePacked(_sapi,_granularity))
        uint256[] requestTimestamps; //array of all newValueTimestamps requested
        mapping(bytes32 => uint256) apiUintVars;
        //Each of the variables below is saved in the mapping apiUintVars for each api request
        //e.g. requestDetails[_requestId].apiUintVars[keccak256("totalTip")]
        //These are the variables saved in this mapping:
        // uint keccak256("granularity"); //multiplier for miners
        // uint keccak256("requestQPosition"); //index in requestQ
        // uint keccak256("totalTip");//bonus portion of payout
        mapping(uint256 => uint256) minedBlockNum; //[apiId][minedTimestamp]=>block.number
        //This the time series of finalValues stored by the contract where uint UNIX timestamp is mapped to value
        mapping(uint256 => uint256) finalValues;
        mapping(uint256 => bool) inDispute; //checks if API id is in dispute or finalized.
        mapping(uint256 => address[5]) minersByValue;
        mapping(uint256 => uint256[5]) valuesByTimestamp;
    }

    struct TellorStorageStruct {
        bytes32 currentChallenge; //current challenge to be solved
        uint256[51] requestQ; //uint50 array of the top50 requests by payment amount
        uint256[] newValueTimestamps; //array of all timestamps requested
        Details[5] currentMiners; //This struct is for organizing the five mined values to find the median
        mapping(bytes32 => address) addressVars;
        //Address fields in the Tellor contract are saved the addressVars mapping
        //e.g. addressVars[keccak256("tellorContract")] = address
        //These are the variables saved in this mapping:
        // address keccak256("tellorContract");//Tellor address
        // address  keccak256("_owner");//Tellor Owner address
        // address  keccak256("_deity");//Tellor Owner that can do things at will
        // address  keccak256("pending_owner"); // The proposed new owner
        mapping(bytes32 => uint256) uintVars;
        //uint fields in the Tellor contract are saved the uintVars mapping
        //e.g. uintVars[keccak256("decimals")] = uint
        //These are the variables saved in this mapping:
        // keccak256("decimals");    //18 decimal standard ERC20
        // keccak256("disputeFee");//cost to dispute a mined value
        // keccak256("disputeCount");//totalHistoricalDisputes
        // keccak256("total_supply"); //total_supply of the token in circulation
        // keccak256("stakeAmount");//stakeAmount for miners (we can cut gas if we just hardcode it in...or should it be variable?)
        // keccak256("stakerCount"); //number of parties currently staked
        // keccak256("timeOfLastNewValue"); // time of last challenge solved
        // keccak256("difficulty"); // Difficulty of current block
        // keccak256("currentTotalTips"); //value of highest api/timestamp PayoutPool
        // keccak256("currentRequestId"); //API being mined--updates with the ApiOnQ Id
        // keccak256("requestCount"); // total number of requests through the system
        // keccak256("slotProgress");//Number of miners who have mined this value so far
        // keccak256("miningReward");//Mining Reward in PoWo tokens given to all miners per value
        // keccak256("timeTarget"); //The time between blocks (mined Oracle values)
        // keccak256("_tblock"); //
        // keccak256("runningTips"); // VAriable to track running tips
        // keccak256("currentReward"); // The current reward
        // keccak256("devShare"); // The amount directed towards th devShare
        // keccak256("currentTotalTips"); //
        //This is a boolean that tells you if a given challenge has been completed by a given miner
        mapping(bytes32 => mapping(address => bool)) minersByChallenge;
        mapping(uint256 => uint256) requestIdByTimestamp; //minedTimestamp to apiId
        mapping(uint256 => uint256) requestIdByRequestQIndex; //link from payoutPoolIndex (position in payout pool array) to apiId
        mapping(uint256 => Dispute) disputesById; //disputeId=> Dispute details
        mapping(address => Checkpoint[]) balances; //balances of a party given blocks
        mapping(address => mapping(address => uint256)) allowed; //allowance for a given party and approver
        mapping(address => StakeInfo) stakerDetails; //mapping from a persons address to their staking info
        mapping(uint256 => Request) requestDetails; //mapping of apiID to details
        mapping(bytes32 => uint256) requestIdByQueryHash; // api bytes32 gets an id = to count of requests array
        mapping(bytes32 => uint256) disputeIdByDisputeHash; //maps a hash to an ID for each dispute
    }
}

pragma solidity ^0.5.16;

//Functions for retrieving min and Max in 51 length array (requestQ)
//Taken partly from: https://github.com/modular-network/ethereum-libraries-array-utils/blob/master/contracts/Array256Lib.sol

library RefUtilities {
    /**
    * @dev Returns the max value in an array.
    * The zero position here is ignored. It's because 
    * there's no null in solidity and we map each address 
    * to an index in this array. So when we get 51 parties, 
    * and one person is kicked out of the top 50, we 
    * assign them a 0, and when you get mined and pulled 
    * out of the top 50, also a 0. So then lot's of parties 
    * will have zero as the index so we made the array run 
    * from 1-51 with zero as nothing.
    * @param data is the array to calculate max from
    * @return max amount and its index within the array
    */
    function getMax(uint256[51] memory data) internal pure returns (uint256 max, uint256 maxIndex) {
        maxIndex = 1;
        max = data[maxIndex];
        for (uint256 i = 2; i < data.length; i++) {
            if (data[i] > max) {
                max = data[i];
                maxIndex = i;
            }
        }
    }

    /**
    * @dev Returns the minimum value in an array.
    * @param data is the array to calculate min from
    * @return min amount and its index within the array
    */
    function getMin(uint256[51] memory data) internal pure returns (uint256 min, uint256 minIndex) {
        minIndex = data.length - 1;
        min = data[minIndex];
        for (uint256 i = data.length - 2; i > 0; i--) {
            if (data[i] < min) {
                min = data[i];
                minIndex = i;
            }
        }
    }

    /**
    * @dev Returns the 5 requestsId's with the top payouts in an array.
    * @param data is the array to get the top 5 from
    * @return to 5 max amounts and their respective index within the array
    */
    function getMax5(uint256[51] memory data) internal pure returns (uint256[5] memory max, uint256[5] memory maxIndex) {
        uint256 min5 = data[1];
        uint256 minI = 1;
        for(uint256 j=0;j<5;j++){
            max[j]= data[j+1];//max[0]=data[1]
            maxIndex[j] = j+1;//maxIndex[0]= 1
            if(max[j] < min5){
                min5 = max[j];
                minI = j;
            }
        }
        for(uint256 i = 5; i < data.length; i++) {
            if (data[i] > min5) {
                max[minI] = data[i];
                maxIndex[minI] = i;
                min5 = data[i];
                for(uint256 j=0;j<5;j++){
                    if(max[j] < min5){
                        min5 = max[j];
                        minI = j;
                    }
                }
            }
        }
    }
}



/**
 * @title Tellor Oracle System Library
 * @dev Contains the functions' logic for the Tellor contract where miners can submit the proof of work
 * along with the value and smart contracts can requestData and tip miners.
 */
library RefTellorLibrary {
    using RefSafeMath for uint256;

    event TipAdded(address indexed _sender, uint256 indexed _requestId, uint256 _tip, uint256 _totalTips);
    //emits when a new challenge is created (either on mined block or when a new request is pushed forward on waiting system)
    event NewChallenge(
        bytes32 indexed _currentChallenge,
        uint256[5] _currentRequestId,
        uint256 _difficulty,
        uint256 _totalTips
    );
    //Emits upon a successful Mine, indicates the blocktime at point of the mine and the value mined
    event NewValue(uint256[5] _requestId, uint256 _time, uint256[5] _value, uint256 _totalTips, bytes32 indexed _currentChallenge);
    //Emits upon each mine (5 total) and shows the miner, nonce, and value submitted
    event NonceSubmitted(address indexed _miner, string _nonce, uint256[5] _requestId, uint256[5] _value, bytes32 indexed _currentChallenge);
    event OwnershipTransferred(address indexed _previousOwner, address indexed _newOwner);
    event OwnershipProposed(address indexed _previousOwner, address indexed _newOwner);

    /*Functions*/
    /**
    * @dev Add tip to Request value from oracle
    * @param _requestId being requested to be mined
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the onDeckQueryHash, or the api with the highest payout pool
    */
    function addTip(RefTellorStorage.TellorStorageStruct storage self, uint256 _requestId, uint256 _tip) public {
        require(_requestId != 0, "RequestId is 0");
        require(_tip != 0, "Tip should be greater than 0");
        uint256 _count =self.uintVars[keccak256("requestCount")] + 1;
        if(_requestId == _count){
            self.uintVars[keccak256("requestCount")] = _count;
        }
        else{
            require(_requestId < _count, "RequestId is not less than count");
        }
        RefTellorTransfer.doTransfer(self, msg.sender, address(this), _tip);
        //Update the information for the request that should be mined next based on the tip submitted
        updateOnDeck(self, _requestId, _tip);
        emit TipAdded(msg.sender, _requestId, _tip, self.requestDetails[_requestId].apiUintVars[keccak256("totalTip")]);
    }

   /**
    * @dev This function is called by submitMiningSolution and adjusts the difficulty, sorts and stores the first
    * 5 values received, pays the miners, the dev share and assigns a new challenge
    * @param _nonce or solution for the PoW  for the requestId
    * @param _requestId for the current request being mined
    */
    function newBlock(RefTellorStorage.TellorStorageStruct storage self, string memory _nonce, uint256[5] memory _requestId) public {
        RefTellorStorage.Request storage _tblock = self.requestDetails[self.uintVars[keccak256("_tblock")]];
        // If the difference between the timeTarget and how long it takes to solve the challenge this updates the challenge
        //difficulty up or donw by the difference between the target time and how long it took to solve the previous challenge
        //otherwise it sets it to 1
        int256 _change = int256(RefSafeMath.min(1200, (now - self.uintVars[keccak256("timeOfLastNewValue")])));
        int256 _diff = int256(self.uintVars[keccak256("difficulty")]);
        _change = (_diff * (int256(self.uintVars[keccak256("timeTarget")]) - _change)) / 4000;
        if (_change == 0) {
                _change = 1;
            }
        self.uintVars[keccak256("difficulty")]  = uint256(RefSafeMath.max(_diff + _change,1));
        //Sets time of value submission rounded to 1 minute
        uint256 _timeOfLastNewValue = now - (now % 1 minutes);
        self.uintVars[keccak256("timeOfLastNewValue")] = _timeOfLastNewValue;
        uint[5] memory a; 
        for (uint k = 0; k < 5; k++) {
            a =  _tblock.valuesByTimestamp[k];
            address[5] memory b = _tblock.minersByValue[1];
            for (uint i = 1; i < 5; i++) {
                uint256 temp = a[i];
                address temp2 = b[i];
                uint256 j = i;
                while (j > 0 && temp < a[j - 1]) {
                    a[j] = a[j - 1];
                    b[j] = b[j - 1];
                    j--;
                }
                if (j < i) {
                    a[j] = temp;
                    b[j] = temp2;
                }
            }
            RefTellorStorage.Request storage _request = self.requestDetails[_requestId[k]];
            //Save the official(finalValue), timestamp of it, 5 miners and their submitted values for it, and its block number
            _request.finalValues[_timeOfLastNewValue] = a[2];
            _request.requestTimestamps.push(_timeOfLastNewValue);
            //these are miners by timestamp
            _request.minersByValue[_timeOfLastNewValue] = [b[0], b[1], b[2], b[3], b[4]];
            _request.valuesByTimestamp[_timeOfLastNewValue] = [a[0],a[1],a[2],a[3],a[4]];
            _request.minedBlockNum[_timeOfLastNewValue] = block.number;
            _request.apiUintVars[keccak256("totalTip")] = 0;
        }
            emit NewValue(
                _requestId,
                _timeOfLastNewValue,
                a,
                self.uintVars[keccak256("runningTips")],
                self.currentChallenge
            );
        //map the timeOfLastValue to the requestId that was just mined
        self.requestIdByTimestamp[_timeOfLastNewValue] = _requestId[0];
        if (self.uintVars[keccak256("currentReward")] > 1e18) {
            //These number represent the inflation adjustement that started in 03/2019
            self.uintVars[keccak256("currentReward")] = self.uintVars[keccak256("currentReward")] - self.uintVars[keccak256("currentReward")] *  15306316590563/1e18; 
            self.uintVars[keccak256("devShare")] = self.uintVars[keccak256("currentReward")] * 50/100;
        } else {
            self.uintVars[keccak256("currentReward")] = 1e18;
        }
        //update the total supply
        self.uintVars[keccak256("total_supply")] +=  self.uintVars[keccak256("devShare")] + self.uintVars[keccak256("currentReward")]*5 - (self.uintVars[keccak256("currentTotalTips")]);
        RefTellorTransfer.doTransfer(self, address(this), self.addressVars[keccak256("_owner")],  self.uintVars[keccak256("devShare")]);
        //add timeOfLastValue to the newValueTimestamps array
        self.newValueTimestamps.push(_timeOfLastNewValue);
        self.uintVars[keccak256("_tblock")] ++;

        uint256[5] memory _topId = RefTellorStake.getTopRequestIDs(self);
        for(uint i = 0; i< 5;i++){
            self.currentMiners[i].value = _topId[i];
            self.requestQ[self.requestDetails[_topId[i]].apiUintVars[keccak256("requestQPosition")]] = 0;
            self.uintVars[keccak256("currentTotalTips")] += self.requestDetails[_topId[i]].apiUintVars[keccak256("totalTip")];
        }
        //Issue the the next challenge
        self.currentChallenge = keccak256(abi.encode(_nonce, self.currentChallenge, blockhash(block.number - 1))); // Save hash for next proof
        emit NewChallenge(
            self.currentChallenge,
            _topId,
            self.uintVars[keccak256("difficulty")],
            self.uintVars[keccak256("currentTotalTips")]
        );
    }

    /**
    * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
    * @param _nonce uint submitted by miner
    * @param _requestId is the array of the 5 PSR's being mined
    * @param _value is an array of 5 values
    */
    function submitMiningSolution(RefTellorStorage.TellorStorageStruct storage self, string memory _nonce,uint256[5] memory _requestId, uint256[5] memory _value)
        public
    {
        //require(self.stakerDetails[msg.sender].currentStatus == 1, "Miner status is not staker");
        for(uint i=0;i<5;i++){
            require(_requestId[i] >=0);
            //require(_requestId[i] ==  self.currentMiners[i].value,"Request ID is wrong");
        }
        RefTellorStorage.Request storage _tblock = self.requestDetails[self.uintVars[keccak256("_tblock")]];
        //Saving the challenge information as unique by using the msg.sender
        // require(uint256(
        //         sha256(abi.encodePacked(ripemd160(abi.encodePacked(keccak256(abi.encodePacked(self.currentChallenge, msg.sender, _nonce))))))
        //     ) %
        //         self.uintVars[keccak256("difficulty")] == 0
        //         || (now - (now % 1 minutes)) - self.uintVars[keccak256("timeOfLastNewValue")] >= 15 minutes,
        //     "Incorrect nonce for current challenge"
        // );
        require(now - self.uintVars[keccak256(abi.encode(msg.sender))] > 15 minutes, "Miner can only win rewards once per fifteen minutes");

        //Make sure the miner does not submit a value more than once
        require(self.minersByChallenge[self.currentChallenge][msg.sender] == false, "Miner already submitted the value");
        //require the miner did not receive awards in the last hour
        self.uintVars[keccak256(abi.encode(msg.sender))] = now;
        if(self.uintVars[keccak256("slotProgress")] == 0){
            self.uintVars[keccak256("runningTips")] = self.uintVars[keccak256("currentTotalTips")];
        }
        uint _extraTip = (self.uintVars[keccak256("currentTotalTips")]-self.uintVars[keccak256("runningTips")])/(5-self.uintVars[keccak256("slotProgress")]);
        RefTellorTransfer.doTransfer(self, address(this), msg.sender, self.uintVars[keccak256("currentReward")]  + self.uintVars[keccak256("runningTips")] / 2 / 5 + _extraTip);
        self.uintVars[keccak256("currentTotalTips")] -= _extraTip;

        //Save the miner and value received
        _tblock.minersByValue[1][self.uintVars[keccak256("slotProgress")]]= msg.sender;

        //this will fill the currentMiners array
        for (uint j = 0; j < 5; j++) {
            _tblock.valuesByTimestamp[j][self.uintVars[keccak256("slotProgress")]] = _value[j];

        }
        self.uintVars[keccak256("slotProgress")]++;
        //Update the miner status to true once they submit a value so they don't submit more than once
        self.minersByChallenge[self.currentChallenge][msg.sender] = true;
        emit NonceSubmitted(msg.sender, _nonce, _requestId, _value, self.currentChallenge);
        if (self.uintVars[keccak256("slotProgress")] == 5) {
            newBlock(self, _nonce, _requestId);
            self.uintVars[keccak256("slotProgress")] = 0;
        }
        
    }

    function updateOnDeck(RefTellorStorage.TellorStorageStruct storage self, uint256 _requestId, uint256 _tip) public {
        RefTellorStorage.Request storage _request = self.requestDetails[_requestId];
        _request.apiUintVars[keccak256("totalTip")] = _request.apiUintVars[keccak256("totalTip")].add(_tip);
        if(self.currentMiners[0].value == _requestId || self.currentMiners[1].value== _requestId ||self.currentMiners[2].value == _requestId||self.currentMiners[3].value== _requestId || self.currentMiners[4].value== _requestId ){
            self.uintVars[keccak256("currentTotalTips")] += _tip;
        }
        else {
            //if the request is not part of the requestQ[51] array
            //then add to the requestQ[51] only if the _payout/tip is greater than the minimum(tip) in the requestQ[51] array
            if (_request.apiUintVars[keccak256("requestQPosition")] == 0) {
                uint256 _min;
                uint256 _index;
                (_min, _index) = RefUtilities.getMin(self.requestQ);
                //we have to zero out the oldOne
                //if the _payout is greater than the current minimum payout in the requestQ[51] or if the minimum is zero
                //then add it to the requestQ array aand map its index information to the requestId and the apiUintvars
                if (_request.apiUintVars[keccak256("totalTip")] > _min || _min == 0) {
                    self.requestQ[_index] = _request.apiUintVars[keccak256("totalTip")];
                    self.requestDetails[self.requestIdByRequestQIndex[_index]].apiUintVars[keccak256("requestQPosition")] = 0;
                    self.requestIdByRequestQIndex[_index] = _requestId;
                    _request.apiUintVars[keccak256("requestQPosition")] = _index;
                }
                // else if the requestid is part of the requestQ[51] then update the tip for it
            } else{
                self.requestQ[_request.apiUintVars[keccak256("requestQPosition")]] += _tip;
            }
        }
    }


/**********************CHEAT Functions for Testing******************************/
/**********************CHEAT Functions for Testing******************************/
/**********************CHEAT Functions for Testing--No Nonce******************************/


    // /*This is a cheat for demo purposes, will delete upon actual launch*/
    function theLazyCoon(RefTellorStorage.TellorStorageStruct storage self,address _address, uint _amount) public {
        self.uintVars[keccak256("total_supply")] += _amount;

        RefTellorTransfer.updateBalanceAtNow(self.balances[_address],_amount);
    } 

}
