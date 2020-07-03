pragma solidity >=0.5.0 <0.7.0;
import "./TellorStorage.sol";
import "./TellorTransfer.sol";
//import "./SafeMath.sol";

/**
* @title Tellor Dispute
* @dev Contains the methods related to disputes. Tellor.sol references this library for function's logic.
*/

library TellorDispute {
    using SafeMath for uint256;
    using SafeMath for int256;

    //emitted when a new dispute is initialized
    event NewDispute(uint256 indexed _disputeId, uint256 indexed _requestId, uint256 _timestamp, address _miner);
    //emitted when a new vote happens
    event Voted(uint256 indexed _disputeID, bool _position, address indexed _voter);
    //emitted upon dispute tally
    event DisputeVoteTallied(uint256 indexed _disputeID, int256 _result, address indexed _reportedMiner, address _reportingParty, bool _active);
    event NewTellorAddress(address _newTellor); //emmited when a proposed fork is voted true

    /*Functions*/

    /**
    * @dev Helps initialize a dispute by assigning it a disputeId
    * when a miner returns a false on the validate array(in Tellor.ProofOfWork) it sends the
    * invalidated value information to POS voting
    * @param _requestId being disputed
    * @param _timestamp being disputed
    * @param _minerIndex the index of the miner that submitted the value being disputed. Since each official value
    * requires 5 miners to submit a value.
    */
    function beginDispute(TellorStorage.TellorStorageStruct storage self, uint256 _requestId, uint256 _timestamp, uint256 _minerIndex) public {
        TellorStorage.Request storage _request = self.requestDetails[_requestId];
        //require that no more than a day( (24 hours * 60 minutes)/10minutes=144 blocks) has gone by since the value was "mined"
        //require(now - _timestamp <= 1 days, "The value was mined more than a day ago");
        require(_request.minedBlockNum[_timestamp] > 0, "Mined block is 0");
        require(_minerIndex < 5, "Miner index is wrong");

        //_miner is the miner being disputed. For every mined value 5 miners are saved in an array and the _minerIndex
        //provided by the party initiating the dispute
        address _miner = _request.minersByValue[_timestamp][_minerIndex];
        bytes32 _hash = keccak256(abi.encodePacked(_miner, _requestId, _timestamp));



        //Increase the dispute count by 1

        self.uintVars[keccak256("disputeCount")] = self.uintVars[keccak256("disputeCount")] + 1;

        //Sets the new disputeCount as the disputeId
        uint256 disputeId = self.uintVars[keccak256("disputeCount")];
                //Ensures that a dispute is not already open for the that miner, requestId and timestamp
        if(self.disputeIdByDisputeHash[_hash] > 0){
            self.disputesById[disputeId].disputeUintVars[keccak256("origID")] = self.disputeIdByDisputeHash[_hash];

        }
        else{
            self.disputeIdByDisputeHash[_hash] = disputeId;
        }
        uint256 origID = self.disputeIdByDisputeHash[_hash];

        self.disputesById[origID].disputeUintVars[keccak256("disputeRounds")]++;
        self.disputesById[origID].disputeUintVars[keccak256(abi.encodePacked(self.disputesById[origID].disputeUintVars[keccak256("disputeRounds")]))] = disputeId;
        if(disputeId != origID){
            uint256 lastID =  self.disputesById[origID].disputeUintVars[keccak256(abi.encodePacked(self.disputesById[origID].disputeUintVars[keccak256("disputeRounds")]-1))];
            require(self.disputesById[lastID].disputeUintVars[keccak256("minExecutionDate")] < now, "Dispute is already open");
            if(self.disputesById[lastID].executed){
                require(now - self.disputesById[lastID].disputeUintVars[keccak256("tallyDate")] <= 1 days, "Time for voting haven't elapsed");
            }
        }
        uint256 _fee = self.uintVars[keccak256("disputeFee")] * self.disputesById[origID].disputeUintVars[keccak256("disputeRounds")];
        
        //maps the dispute hash to the disputeId

        //maps the dispute to the Dispute struct
        self.disputesById[disputeId] = TellorStorage.Dispute({
            hash: _hash,
            isPropFork: false,
            reportedMiner: _miner,
            reportingParty: msg.sender,
            proposedForkAddress: address(0),
            executed: false,
            disputeVotePassed: false,
            tally: 0
        });

        //Saves all the dispute variables for the disputeId
        self.disputesById[disputeId].disputeUintVars[keccak256("requestId")] = _requestId;
        self.disputesById[disputeId].disputeUintVars[keccak256("timestamp")] = _timestamp;
        self.disputesById[disputeId].disputeUintVars[keccak256("value")] = _request.valuesByTimestamp[_timestamp][_minerIndex];
        self.disputesById[disputeId].disputeUintVars[keccak256("minExecutionDate")] = now + 2 days * self.disputesById[origID].disputeUintVars[keccak256("disputeRounds")];
        self.disputesById[disputeId].disputeUintVars[keccak256("blockNumber")] = block.number;
        self.disputesById[disputeId].disputeUintVars[keccak256("minerSlot")] = _minerIndex;
        self.disputesById[disputeId].disputeUintVars[keccak256("fee")] = _fee;
  
        TellorTransfer.doTransfer(self, msg.sender, address(this),_fee);

        //Values are sorted as they come in and the official value is the median of the first five
        //So the "official value" miner is always minerIndex==2. If the official value is being
        //disputed, it sets its status to inDispute(currentStatus = 3) so that users are made aware it is under dispute
        if (_minerIndex == 2) {
            _request.inDispute[_timestamp] = true;
            _request.finalValues[_timestamp] = 0;
        }
        if (self.stakerDetails[_miner].currentStatus != 4){
            self.stakerDetails[_miner].currentStatus = 3;
        }
        emit NewDispute(disputeId, _requestId, _timestamp, _miner);
    }

    /**
    * @dev Allows token holders to vote
    * @param _disputeId is the dispute id
    * @param _supportsDispute is the vote (true=the dispute has basis false = vote against dispute)
    */
    function vote(TellorStorage.TellorStorageStruct storage self, uint256 _disputeId, bool _supportsDispute) public {
        TellorStorage.Dispute storage disp = self.disputesById[_disputeId];

        //Get the voteWeight or the balance of the user at the time/blockNumber the disupte began
        uint256 voteWeight = TellorTransfer.balanceOfAt(self, msg.sender, disp.disputeUintVars[keccak256("blockNumber")]);

        //Require that the msg.sender has not voted
        require(disp.voted[msg.sender] != true, "Sender has already voted");

        //Requre that the user had a balance >0 at time/blockNumber the disupte began
        require(voteWeight > 0, "User balance is 0");

        //ensures miners that are under dispute cannot vote
        require(self.stakerDetails[msg.sender].currentStatus != 3, "Miner is under dispute");

        //Update user voting status to true
        disp.voted[msg.sender] = true;

        //Update the number of votes for the dispute
        disp.disputeUintVars[keccak256("numberOfVotes")] += 1;

        //If the user supports the dispute increase the tally for the dispute by the voteWeight
        //otherwise decrease it
        if (_supportsDispute) {
            disp.tally = disp.tally.add(int256(voteWeight));
        } else {
            disp.tally = disp.tally.sub(int256(voteWeight));
        }

        //Let the network know the user has voted on the dispute and their casted vote
        emit Voted(_disputeId, _supportsDispute, msg.sender);
    }

    /**
    * @dev tallies the votes.
    * @param _disputeId is the dispute id
    */
    function tallyVotes(TellorStorage.TellorStorageStruct storage self, uint256 _disputeId) public {
        TellorStorage.Dispute storage disp = self.disputesById[_disputeId];

        //Ensure this has not already been executed/tallied
        require(disp.executed == false, "Dispute has been already executed");
        require(now > disp.disputeUintVars[keccak256("minExecutionDate")], "Time for voting haven't elapsed");
        require(disp.reportingParty != address(0));
        //If the vote is not a proposed fork
        if (disp.isPropFork == false) {
                //Ensure the time for voting has elapsed
                    TellorStorage.StakeInfo storage stakes = self.stakerDetails[disp.reportedMiner];
                    //If the vote for disputing a value is succesful(disp.tally >0) then unstake the reported
                    // miner and transfer the stakeAmount and dispute fee to the reporting party
                    if (disp.tally > 0) {
                        //Set the dispute state to passed/true
                        disp.disputeVotePassed = true;
                    }
                    if(stakes.currentStatus == 3){
                        stakes.currentStatus = 4;
                    }
        } else {
            if (disp.tally > 0 && uint(disp.tally) >= ((self.uintVars[keccak256("total_supply")] * 10) / 100)) {
                disp.disputeVotePassed = true;
                emit NewTellorAddress(disp.proposedForkAddress);
            }
        }
        disp.disputeUintVars[keccak256("tallyDate")] = now;
        disp.executed = true;
        emit DisputeVoteTallied(_disputeId, disp.tally, disp.reportedMiner, disp.reportingParty, disp.disputeVotePassed);
    }

    /**
    * @dev Allows for a fork to be proposed
    * @param _propNewTellorAddress address for new proposed Tellor
    */
    function proposeFork(TellorStorage.TellorStorageStruct storage self, address _propNewTellorAddress) public {
        bytes32 _hash = keccak256(abi.encodePacked(_propNewTellorAddress));
        TellorTransfer.doTransfer(self, msg.sender, address(this), 100e18); //This is the fork fee (just 100 tokens flat, no refunds)
        self.uintVars[keccak256("disputeCount")]++;
        uint256 disputeId = self.uintVars[keccak256("disputeCount")];
        if(self.disputeIdByDisputeHash[_hash] > 0){
            self.disputesById[disputeId].disputeUintVars[keccak256("origID")] = self.disputeIdByDisputeHash[_hash];
        }
        else{
            self.disputeIdByDisputeHash[_hash] = disputeId;
        }
        uint256 origID = self.disputeIdByDisputeHash[_hash];

        self.disputesById[origID].disputeUintVars[keccak256("disputeRounds")]++;
        self.disputesById[origID].disputeUintVars[keccak256(abi.encodePacked(self.disputesById[origID].disputeUintVars[keccak256("disputeRounds")]))] = disputeId;
        if(disputeId != origID){
            uint256 lastID =  self.disputesById[origID].disputeUintVars[keccak256(abi.encodePacked(self.disputesById[origID].disputeUintVars[keccak256("disputeRounds")]-1))];
            require(self.disputesById[lastID].disputeUintVars[keccak256("minExecutionDate")] < now, "Dispute is already open");
            if(self.disputesById[lastID].executed){
                require(now - self.disputesById[lastID].disputeUintVars[keccak256("tallyDate")] <= 1 days, "Time for voting haven't elapsed");
            }
        }
        self.disputesById[disputeId] = TellorStorage.Dispute({
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

    function updateTellor(TellorStorage.TellorStorageStruct storage self, uint _disputeId) internal {
        bytes32 _hash = self.disputesById[_disputeId].hash;
        uint256 origID = self.disputeIdByDisputeHash[_hash];
        uint256 lastID =  self.disputesById[origID].disputeUintVars[keccak256(abi.encodePacked(self.disputesById[origID].disputeUintVars[keccak256("disputeRounds")]))];
        TellorStorage.Dispute storage disp = self.disputesById[lastID];
        require(disp.disputeVotePassed == true, "vote needs to pass");
        require(now - disp.disputeUintVars[keccak256("tallyDate")] > 1 days, "Time for voting for further disputes has not passed");
        self.addressVars[keccak256("tellorContract")] = disp.proposedForkAddress;
    }

    function unlockDisputeFee (TellorStorage.TellorStorageStruct storage self, uint _disputeId) internal {
        bytes32 _hash = self.disputesById[_disputeId].hash;
        uint256 origID = self.disputeIdByDisputeHash[_hash];
        uint256 lastID =  self.disputesById[origID].disputeUintVars[keccak256(abi.encodePacked(self.disputesById[origID].disputeUintVars[keccak256("disputeRounds")]))];
        if(lastID == 0){
            lastID = origID;
        }
        TellorStorage.Dispute storage disp = self.disputesById[origID];
        TellorStorage.Dispute storage last = self.disputesById[lastID];
                if(disp.disputeUintVars[keccak256("disputeRounds")] == 0){
                  disp.disputeUintVars[keccak256("disputeRounds")] = 1;  
                }
        require(disp.disputeUintVars[keccak256("paid")] == 0,"already paid out");
        require(now - last.disputeUintVars[keccak256("tallyDate")] > 1 days, "Time for voting haven't elapsed");
        TellorStorage.StakeInfo storage stakes = self.stakerDetails[disp.reportedMiner];
        disp.disputeUintVars[keccak256("paid")] = 1;
        if (last.disputeVotePassed == true){
                //Changing the currentStatus and startDate unstakes the reported miner and transfers the stakeAmount
                stakes.startDate = now - (now % 86400);

                //Reduce the staker count
                self.uintVars[keccak256("stakerCount")] -= 1;

                //Update the minimum dispute fee that is based on the number of stakers 
                updateMinDisputeFee(self);
                //Decreases the stakerCount since the miner's stake is being slashed
                if(stakes.currentStatus == 4){
                    TellorTransfer.doTransfer(self,disp.reportedMiner,disp.reportingParty,self.uintVars[keccak256("stakeAmount")]);
                    stakes.currentStatus =0 ;
                }
                for(uint i = 0; i < disp.disputeUintVars[keccak256("disputeRounds")];i++){
                    uint256 _id = disp.disputeUintVars[keccak256(abi.encodePacked(disp.disputeUintVars[keccak256("disputeRounds")]-i))];
                    if(_id == 0){
                        _id = origID;
                    }
                    TellorStorage.Dispute storage disp2 = self.disputesById[_id];
                    TellorTransfer.doTransfer(self,address(this),disp2.reportingParty,disp2.disputeUintVars[keccak256("fee")]);
                }
            }
            else {
                stakes.currentStatus = 1;
                TellorStorage.Request storage _request = self.requestDetails[disp.disputeUintVars[keccak256("requestId")]];
                if(disp.disputeUintVars[keccak256("minerSlot")] == 2) {
                    //note we still don't put timestamp back into array (is this an issue? (shouldn't be))
                  _request.finalValues[disp.disputeUintVars[keccak256("timestamp")]] = disp.disputeUintVars[keccak256("value")];
                }
                if (_request.inDispute[disp.disputeUintVars[keccak256("timestamp")]] == true) {
                    _request.inDispute[disp.disputeUintVars[keccak256("timestamp")]] = false;
                }
                for(uint i = 0; i < disp.disputeUintVars[keccak256("disputeRounds")];i++){
                    uint256 _id = disp.disputeUintVars[keccak256(abi.encodePacked(disp.disputeUintVars[keccak256("disputeRounds")]-i))];
                    if(_id != 0){
                        last = self.disputesById[_id];//handling if happens during an upgrade
                    }
                    TellorTransfer.doTransfer(self,address(this),last.reportedMiner,self.disputesById[_id].disputeUintVars[keccak256("fee")]);
                }
            }
    }


    function updateMinDisputeFee(TellorStorage.TellorStorageStruct storage self) public {
        self.uintVars[keccak256("disputeFee")] = SafeMath.max(15e18,
                (self.uintVars[keccak256("stakeAmount")]-
                (self.uintVars[keccak256("stakeAmount")]* 
                (SafeMath.min(self.uintVars[keccak256("targetMiners")],self.uintVars[keccak256("stakerCount")])*1000)/
                self.uintVars[keccak256("targetMiners")])/1000));
    }
}
