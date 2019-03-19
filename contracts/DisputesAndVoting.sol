pragma solidity ^0.5.0;


import "./TokenAndStaking.sol";


/**
* @title Disputes and Voting
* @dev This contract contains the functions to initiate disputes, vote and execute
* the tally(which will slash the stake or provide the dispute fee to the miner) 
*/
contract DisputesAndVoting is TokenAndStaking {
    
    /*Events*/
    event NewDispute(uint _DisputeID, uint _apiId, uint _timestamp);//emitted when a new dispute is initialized
    event Voted(uint _disputeID, bool _position, address _voter);//emitted when a new vote happens
    event DisputeVoteTallied(uint _disputeID, int _result,address _reportedMiner,address _reportingParty, bool _active);//emitted upon dispute tally
    event NewTellorAddress(address _newTellor); //emmited when a proposed fork is voted true
    /*****************Disputes and Voting Functions***************/
    /**
    * @dev Helps initialize a dispute by assigning it a disputeId 
    * when a miner returns a false on the validate array(in Tellor.ProofOfWork) it sends the 
    * invalidated value information to POS voting
    * @param _apiId being disputed
    * @param _timestamp being disputed
    */
    function initDispute(uint _apiId, uint _timestamp) external {
        API storage _api = apiDetails[_apiId];
        require(block.number- _api.minedBlockNum[_timestamp]<= 144);
        require(_api.minedBlockNum[_timestamp] > 0);
        doTransfer(msg.sender,address(this), disputeFee);
        uint disputeId = disputesIds.length + 1;
        address[5] memory _miners = _api.minersbyvalue[_timestamp];
        disputes[disputeId] = Dispute({
            isPropFork: false,
            reportedMiner: _miners[2], 
            reportingParty: msg.sender,
            apiId: _apiId,
            timestamp: _timestamp,
            value: _api.values[_timestamp],  
            minExecutionDate: now + 7 days, 
            numberOfVotes: 0,
            executed: false,
            disputeVotePassed: false,
            blockNumber: block.number,
            tally: 0,
            index:disputeId,
            quorum: 0
            });
        disputesIds.push(disputeId);
        staker[_miners[2]].current_state = 3;
        emit NewDispute(disputeId,_apiId,_timestamp );
    }

    /**
    * @dev propose fork
    * @param _propNewTellorAddress address for new proposed Tellor
    */
    function propFork(address _propNewTellorAddress) external {
        doTransfer(msg.sender,address(this), 10000e18);//This is the fork fee
        uint disputeId = disputesIds.length + 1;
        disputes[disputeId] = Dispute({
            isPropFork: true,
            reportedMiner: msg.sender, 
            reportingParty: msg.sender,
            apiId: 0,
            timestamp: 0,
            value: 0,  
            minExecutionDate: now + 7 days, 
            numberOfVotes: 0,
            executed: false,
            disputeVotePassed: false,
            blockNumber: block.number,
            tally: 0,
            index:disputeId,
            quorum: 0
            });
        disputesIds.push(disputeId);    
        propForkAddress[disputeId] = _propNewTellorAddress;
    }

    /**
    * @dev Allows token holders to vote
    * @param _disputeId is the dispute id
    * @param _supportsDispute is the vote (true=the dispute has basis false = vote against dispute)
    */
    function vote(uint _disputeId, bool _supportsDispute) external {
        Dispute storage disp = disputes[_disputeId];
        uint voteWeight = balanceOfAt(msg.sender,disp.blockNumber);
        require(disp.voted[msg.sender] != true);
        require(voteWeight > 0);
        require(staker[msg.sender].current_state != 3);
        disp.voted[msg.sender] = true;
        disp.numberOfVotes += 1;
        disp.quorum += voteWeight; //NEW
        if (_supportsDispute) {
            disp.tally = disp.tally + int(voteWeight);
        } else {
            disp.tally = disp.tally - int(voteWeight);
        }
        emit Voted(_disputeId,_supportsDispute,msg.sender);
    }


    /**
    * @dev tallies the votes.
    * @param _disputeId is the dispute id
    */
    function tallyVotes(uint _disputeId) public {
        Dispute storage disp = disputes[_disputeId];
        API storage _api = apiDetails[disp.apiId];
        require(disp.executed == false);
        require(now > disp.minExecutionDate); //Uncomment for production-commented out for testing 
        if (disp.isPropFork== false){
        StakeInfo storage stakes = staker[disp.reportedMiner];  
            if (disp.tally != 0 ) { 
                stakes.current_state = 0;
                stakes.startDate = now -(now % 86400);
                stakers--;
                doTransfer(disp.reportedMiner,disp.reportingParty, stakeAmt);
                disp.disputeVotePassed = true;
                _api.values[disp.timestamp] = 0;
            } else {
                stakes.current_state = 1;
                disp.executed = true;
                disp.disputeVotePassed = false;
                transfer(disp.reportedMiner, disputeFee);
            }
        emit DisputeVoteTallied(_disputeId,disp.tally,disp.reportedMiner,disp.reportingParty,disp.disputeVotePassed); 
        } else {
            uint minQuorum = (total_supply * 75 / 100);
            require(disp.quorum > minQuorum);
            emit NewTellorAddress(propForkAddress[_disputeId]);
        }
    }

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
    function getApiVars(uint _apiId) external view returns(string memory, bytes32, uint, uint) {
        API storage _api = apiDetails[_apiId]; 
        return (_api.apiString, _api.apiHash, _api.index,_api.payout);
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


}