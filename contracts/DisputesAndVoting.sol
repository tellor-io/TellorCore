pragma solidity ^0.5.0;


import "./TokenAndStaking.sol";


/**
* @title Disputes and Voting
* @dev This contract contains the functions to initiate disputes, vote and execute
* the tally(which will slash the stake or provide the dispute fee to the miner) 
*/
contract DisputesAndVoting is TokenAndStaking {
    
    /*****************Disputes and Voting Functions***************/
    /**
    * @dev Helps initialize a dispute by assigning it a disputeId 
    * when a miner returns a false on the validate array(in Tellor.ProofOfWork) it sends the 
    * invalidated value information to POS voting
    * @param _apiId being disputed
    * @param _timestamp being disputed
    */
    function initDispute(uint _apiId, uint _timestamp,uint _minerIndex) external {
        API storage _api = apiDetails[_apiId];
        require(block.number- _api.minedBlockNum[_timestamp]<= 144);
        require(_api.minedBlockNum[_timestamp] > 0);
        require(_minerIndex < 5);
        address _miner = _api.minersbyvalue[_timestamp][_minerIndex];
        bytes32 _hash = keccak256(abi.encodePacked(_miner,_apiId));
        require(disputeHashToId[_hash] == 0);
        doTransfer(msg.sender,address(this), disputeFee);
        disputeCount++;
        uint disputeId = disputeCount;
        disputeHashToId[_hash] = disputeId;
        disputes[disputeId] = Dispute({
            hash:_hash,
            isPropFork: false,
            reportedMiner: _miner, 
            reportingParty: msg.sender,
            apiId: _apiId,
            timestamp: _timestamp,
            value: _api.valuesByTimestamp[_timestamp][_minerIndex],  
            minExecutionDate: now + 7 days, 
            numberOfVotes: 0,
            executed: false,
            disputeVotePassed: false,
            blockNumber: block.number,
            tally: 0,
            index:disputeId,
            quorum: 0
            });
        if(_minerIndex == 2){
            apiDetails[_apiId].inDispute[_timestamp] = true;
        }
        staker[_miner].current_state = 3;
        emit NewDispute(disputeId,_apiId,_timestamp );
    }

    /**
    * @dev propose fork
    * @param _propNewTellorAddress address for new proposed Tellor
    */
    function propFork(address _propNewTellorAddress) external {
        bytes32 _hash = keccak256(abi.encodePacked(_propNewTellorAddress));
        require(disputeHashToId[_hash] == 0);
        doTransfer(msg.sender,address(this), disputeFee);//This is the fork fee
        disputeCount++;
        uint disputeId = disputeCount;
        disputeHashToId[_hash] = disputeId;
        disputes[disputeId] = Dispute({
            hash: _hash,
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
            if (disp.tally > 0 ) { 
                stakes.current_state = 0;
                stakes.startDate = now -(now % 86400);
                stakers--;
                doTransfer(disp.reportedMiner,disp.reportingParty, stakeAmt);
                transfer(disp.reportingParty, disputeFee);
                disp.disputeVotePassed = true;
                if(_api.inDispute[disp.timestamp] == true){
                    _api.values[disp.timestamp] = 0;
                }
            } else {
                stakes.current_state = 1;
                disp.executed = true;
                disp.disputeVotePassed = false;
                transfer(disp.reportedMiner, disputeFee);
                if(_api.inDispute[disp.timestamp] == true){
                    _api.inDispute[disp.timestamp] = false;
                }
            }
        emit DisputeVoteTallied(_disputeId,disp.tally,disp.reportedMiner,disp.reportingParty,disp.disputeVotePassed); 
        } else {
            require(disp.quorum >  (total_supply * 50 / 100));
            tellorContract = propForkAddress[_disputeId];
            emit NewTellorAddress(propForkAddress[_disputeId]);
        }
    }
}