pragma solidity ^0.5.0;

import "./libraries/SafeMath.sol";
import "./libraries/Utilities.sol";
import "./TellorData.sol";

//What getters do we need to add?
owner()
isStaked()


/**
 * @title Tellor Oracle System
 * @dev Oracle contract where miners can submit the proof of work along with the value.
 */
contract TellorLibrary is TellorData{
    using SafeMath for uint256;

    function tellorMasterConstructor(TellorStorageStruct storage self,address _tellorContract) internal{
        self._owner = msg.sender;
        self.tellorContract = _tellorContract;
        emit NewTellorAddress(_tellorContract);
    }
    /**
         * @dev Allows the current owner to transfer control of the contract to a newOwner.
         * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(TellorStorageStruct storage self,address payable newOwner) internal {
            require(msg.sender == self._owner);
            emit OwnershipTransferred(_owner, newOwner);
            self._owner = newOwner;
    }
    /*Functions*/
    /*
     *This function gives 5 miners the inital staked tokens in the system.  
     * It would run with the constructor, but throws on too much gas
    */
    function initStake(TellorStorageStruct storage self) internal{
        require(self.requests == 0);
        self._owner = msg.sender;
        updateValueAtNow(self.balances[address(this)], 2**256-1 - 5000e18);
        address payable[5] memory _initalMiners = [address(0xE037EC8EC9ec423826750853899394dE7F024fee),
        address(0xcdd8FA31AF8475574B8909F135d510579a8087d3),
        address(0xb9dD5AfD86547Df817DA2d0Fb89334A6F8eDd891),
        address(0x230570cD052f40E14C14a81038c6f3aa685d712B),
        address(0x3233afA02644CCd048587F8ba6e99b3C00A34DcC)];
        for(uint i=0;i<5;i++){
            updateValueAtNow(self.balances[_initalMiners[i]],1000e18);
            self.staker[_initalMiners[i]] = StakeInfo({
                current_state: 1,
                startDate: now - (now % 86400)
                });
            emit NewStake(_initalMiners[i]);
        }
        self.stakers += 5;
        self.total_supply += 5000e18;
        //Initiate payoutPool array...is there a better way?
        for(uint i = 49;i > 0;i--) {
            self.payoutPool[i] = 0;
        }
    }
    /**
    * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
    * @param nonce uint submitted by miner
    * @param _apiId the apiId being mined
    * @param value of api query
    * @return count of values sumbitted so far and the time of the last successful mine
    */
    function proofOfWork(TellorStorageStruct storage self,string calldata _nonce, uint _apiId, uint _value) internal{
        require(isStaked(msg.sender));
        require(self._apiId == miningApiId);
        bytes32 n = sha256(abi.encodePacked(ripemd160(abi.encodePacked(keccak256(abi.encodePacked(self.currentChallenge,msg.sender,_nonce))))));
        require(uint(n) % self.difficulty_level == 0);
        require(self.miners[currentChallenge][msg.sender] == false); 
        self.first_five[count].value = _value;
        self.first_five[count].miner = msg.sender;
        self.count++;
        self.miners[currentChallenge][msg.sender] = true;
        emit NonceSubmitted(msg.sender,_nonce,_apiId,_value);
        if(self.count == 5) { 
            API storage _api = self.apiDetails[_apiId];
            if(int(self.difficulty_level) + (int(self.timeTarget) - int(now - self.timeOfLastProof))/60 > 0){
                self.difficulty_level = uint(int(self.difficulty_level) + (int(self.timeTarget) - int(now - self.timeOfLastProof))/60);
            }
            else{
                self.difficulty_level = 1;
            }
            self.timeOfLastProof = now - (now % self.timeTarget);
            Details[5] memory a = self.first_five;
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
            for (i = 0;i <5;i++){
                doTransfer(address(this),a[i].miner,self.payoutStructure[i] + _api.payout/22 * self.payoutStructure[i] / 1e18);
            }
            _api.payout = 0; 
            self.total_supply += self.payoutTotal + self.payoutTotal*10/100;//can we hardcode this?
            doTransfer(address(this),self._owner,(self.payoutTotal * 10 / 100));//The ten there is the devshare
            _api.values[timeOfLastProof] = a[2].value;
            _api.minersbyvalue[timeOfLastProof] = [a[0].miner,a[1].miner,a[2].miner,a[3].miner,a[4].miner];
            _api.valuesByTimestamp[timeOfLastProof] = [a[0].value,a[1].value,a[2].value,a[3].value,a[4].value];
            _api.minedBlockNum[timeOfLastProof] = block.number;
            self.miningApiId = self.apiId[apiOnQ]; 
            self.timeToApiId[timeOfLastProof] = self._apiId;
            self.timestamps.push(self.timeOfLastProof);
            self.count = 0;
            self.payoutPool[self.apiDetails[self.apiIdOnQ].index] = 0;
            self.payoutPoolIndexToApiId[self.apiDetails[self.apiIdOnQ].index] = 0;
            self.apiDetails[self.apiIdOnQ].index = 0;
            uint[2] memory nums; //reusable number array -- _amount,_paid,payoutMultiplier
            if(self.miningApiId > 0){
                (nums[0],nums[1]) = Utilities.getMax(payoutPool);
                self.apiIdOnQ = self.payoutPoolIndexToApiId[nums[1]];
                self.apiOnQ = self.apiDetails[self.apiIdOnQ].apiHash;
                self.apiOnQPayout = nums[0];
                self.currentChallenge = keccak256(abi.encodePacked(_nonce,self.currentChallenge, blockhash(block.number - 1))); // Save hash for next proof
                emit NewChallenge(self.currentChallenge,self.miningApiId,self.difficulty_level,self.apiDetails[miningApiId].granularity,self.apiDetails[miningApiId].apiString);   
                emit NewAPIonQinfo(self.apiIdOnQ,self.apiDetails[self.apiIdOnQ].apiString,self.apiOnQ,self.apiOnQPayout);    
            }
            emit NewValue(_apiId,self.timeOfLastProof,a[2].value);
        }
    }

   /**
    * @dev Request to retreive value from oracle based on timestamp
    * @param c_sapi being requested be mined
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the apiOnQ, or the api with the highest payout pool
    * @return _apiId for the request
    */
    function requestData(TellorStorageStruct storage self,string calldata _c_sapi,uint _c_apiId,uint _granularity, uint _tip) internal {
        uint _apiId = _c_apiId;
        require(_granularity > 0);
        require(_granularity <= 1e18);
        if(_apiId == 0){
            uint[2] nums;
            (nums[0],nums[1]) = Utilities.getMin(self.payoutPool);
            require(_tip >= nums[0]);
            string memory _sapi = _c_sapi;
            require(bytes(_sapi).length > 0);
            bytes32 _apiHash = sha256(abi.encodePacked(_sapi,_granularity));
            if(self.apiId[_apiHash] == 0){
                self.requests++;
                _apiId=self.requests;
                self.apiDetails[_apiId] = API({
                    apiString : _sapi, 
                    apiHash: _apiHash,
                    granularity:  _granularity,
                    payout: 0,
                    index: 0
                    });
                self.apiId[_apiHash] = _apiId;
            }
            else{
                _apiId = self.apiId[_apiHash];
            }
        }
        if(_tip > 0){
            doTransfer(msg.sender,address(this),_tip);
            self.apiDetails[_apiId].payout = self.apiDetails[_apiId].payout.add(_tip);
        }
        updateAPIonQ(_apiId);
        emit DataRequested(msg.sender,self.apiDetails[_apiId].apiString,_granularity,_apiId,_tip);
    }

    /**
    @dev This function updates APIonQ and the payoutPool when requestData or addToValuePool are ran
    @param _apiId being requested
    */
    function updateAPIonQ(TellorStorageStruct storage self,uint _apiId) internal {
        API storage _api = self.apiDetails[_apiId];
        uint _payout = _api.payout;
        if(self.miningApiId == 0){
            self.miningApiId = _apiId;
            self.currentChallenge = keccak256(abi.encodePacked(_payout, self.currentChallenge, blockhash(block.number - 1))); // Save hash for next proof
            emit NewChallenge(self.currentChallenge,self.miningApiId,self.difficulty_level,self.apiDetails[miningApiId].granularity,self.apiDetails[miningApiId].apiString);
            return;
        }
        if (_payout > self.apiOnQPayout || self.apiIdOnQ == 0) {
                self.apiIdOnQ = _apiId;
                self.apiOnQ = _api.apiHash;
                self.apiOnQPayout = _payout;
                emit NewAPIonQinfo(_apiId,_api.apiString,self.apiOnQ,self.apiOnQPayout);
        }
        if(_api.index == 0){
            uint _min;
            uint _index;
            (_min,_index) = Utilities.getMin(self.payoutPool);
            if(_payout > _min || _min == 0){
                self.payoutPool[_index] = _payout;
                self.payoutPoolIndexToApiId[_index] = _apiId;
                _api.index = _index;
            }
        }
        else{
            self.payoutPool[_api.index] = _payout;
        }
    }

    /*****************Disputes and Voting Functions***************/
    /**
    * @dev Helps initialize a dispute by assigning it a disputeId 
    * when a miner returns a false on the validate array(in Tellor.ProofOfWork) it sends the 
    * invalidated value information to POS voting
    * @param _apiId being disputed
    * @param _timestamp being disputed
    */
    function initDispute(TellorStorageStruct storage self,uint _apiId, uint _timestamp,uint _minerIndex) internal {
        API storage _api = apiDetails[_apiId];
        require(block.number- _api.minedBlockNum[_timestamp]<= 144);
        require(_api.minedBlockNum[_timestamp] > 0);
        require(_minerIndex < 5);
        address _miner = _api.minersbyvalue[_timestamp][_minerIndex];
        bytes32 _hash = keccak256(abi.encodePacked(_miner,_apiId));
        require(self.disputeHashToId[_hash] == 0);
        doTransfer(msg.sender,address(this), self.disputeFee);
        self.disputeCount++;
        uint disputeId = self.disputeCount;
        self.disputeHashToId[_hash] = self.disputeId;
        self.disputes[disputeId] = Dispute({
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
            self.apiDetails[_apiId].inDispute[_timestamp] = true;
        }
        self.staker[_miner].current_state = 3;
        emit NewDispute(disputeId,_apiId,_timestamp );
    }

    /**
    * @dev propose fork
    * @param _propNewTellorAddress address for new proposed Tellor
    */
    function propFork(TellorStorageStruct storage self, address _propNewTellorAddress) internal {
        bytes32 _hash = keccak256(abi.encodePacked(_propNewTellorAddress));
        require(self.disputeHashToId[_hash] == 0);
        doTransfer(msg.sender,address(this), self.disputeFee);//This is the fork fee
        self.disputeCount++;
        uint disputeId = self.disputeCount;
        self.disputeHashToId[_hash] = disputeId;
        self.disputes[disputeId] = Dispute({
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
        self.propForkAddress[disputeId] = _propNewTellorAddress;
    }

    /**
    * @dev Allows token holders to vote
    * @param _disputeId is the dispute id
    * @param _supportsDispute is the vote (true=the dispute has basis false = vote against dispute)
    */
    function vote(TellorStorageStruct storage self, uint _disputeId, bool _supportsDispute) internal {
        Dispute storage disp = self.disputes[_disputeId];
        uint voteWeight = balanceOfAt(msg.sender,disp.blockNumber);
        require(disp.voted[msg.sender] != true);
        require(voteWeight > 0);
        require(self.staker[msg.sender].current_state != 3);
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
    function tallyVotes(TellorStorageStruct storage self, uint _disputeId) internal {
        Dispute storage disp = self.disputes[_disputeId];
        API storage _api = self.apiDetails[disp.apiId];
        require(disp.executed == false);
        require(now > disp.minExecutionDate); //Uncomment for production-commented out for testing 
        if (disp.isPropFork== false){
        StakeInfo storage stakes = self.staker[disp.reportedMiner];  
            if (disp.tally > 0 ) { 
                stakes.current_state = 0;
                stakes.startDate = now -(now % 86400);
                self.stakers--;
                doTransfer(disp.reportedMiner,disp.reportingParty, self.stakeAmt);
                transfer(disp.reportingParty, self.disputeFee);
                disp.disputeVotePassed = true;
                if(_api.inDispute[disp.timestamp] == true){
                    _api.values[disp.timestamp] = 0;
                }
            } else {
                stakes.current_state = 1;
                disp.executed = true;
                disp.disputeVotePassed = false;
                transfer(disp.reportedMiner, self.disputeFee);
                if(_api.inDispute[disp.timestamp] == true){
                    _api.inDispute[disp.timestamp] = false;
                }
            }
        emit DisputeVoteTallied(_disputeId,disp.tally,disp.reportedMiner,disp.reportingParty,disp.disputeVotePassed); 
        } else {
            require(disp.quorum >  (self.total_supply * 20 / 100));
            self.tellorContract = self.propForkAddress[_disputeId];
            emit NewTellorAddress(self.propForkAddress[_disputeId]);
        }
    }

     function depositStake(TellorStorageStruct storage self) internal {
        require( balanceOf(msg.sender) >= self.stakeAmt);
        require(self.staker[msg.sender].current_state == 0 || self.staker[msg.sender].current_state == 2);
        self.stakers += 1;
        self.staker[msg.sender] = StakeInfo({
            current_state: 1,
            startDate: now - (now % 86400)
            });
        emit NewStake(msg.sender);
    }
    /**
    * @dev This function allows users to withdraw their stake after a 7 day waiting period from request 
    */
    function withdrawStake(TellorStorageStruct storage self) internal {
        StakeInfo storage stakes = self.staker[msg.sender];
        uint _today = now - (now % 86400);
        require(_today - stakes.startDate >= 7 days && stakes.current_state == 2);
        stakes.current_state = 0;
        emit StakeWithdrawn(msg.sender);
    }

    /**
    * @dev This function allows stakers to request to withdraw their stake (no longer stake) 
    */
    function requestWithdraw(TellorStorageStruct storage self) internal {
        StakeInfo storage stakes = self.staker[msg.sender];
        require(stakes.current_state == 1);
        stakes.current_state = 2;
        stakes.startDate = now -(now % 86400);
        self.stakers -= 1;
        emit StakeWithdrawRequested(msg.sender);
    }

    
    /**
    * @dev Allows for a transfer of tokens to _to
    * @param _to The address to send tokens to
    * @param _amount The amount of tokens to send
    * @return true if transfer is successful
    */
     function transfer(TellorStorageStruct storage self, address _to, uint256 _amount) internal returns (bool success) {
        doTransfer(msg.sender, _to, _amount);
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
        doTransfer(_from, _to, _amount);
        return true;
    }

    /**
    * @dev This function approves a _spender an _amount of tokens to use
    * @param _spender address
    * @param _amount amount the spender is being approved for
    * @return true if spender appproved successfully
    */
    function approve(TellorStorageStruct storage self, address _spender, uint _amount) internal returns (bool) {
        require(allowedToTrade(msg.sender,_amount));
        self.allowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    /**
    * @dev Updates balance for from and to on the current block number via doTransfer
    * @param checkpoints gets the mapping for the balances[owner]
    * @param _value is the new balance
    */
    function updateValueAtNow(TellorStorageStruct storage self, Checkpoint[] storage checkpoints, uint _value) internal  {
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
    * @dev Completes POWO transfers by updating the balances on the current block number
    * @param _from address to transfer from
    * @param _to addres to transfer to
    * @param _amount to transfer 
    */
    function doTransfer(TellorStorageStruct storage self, address _from, address _to, uint _amount) internal {
        require(_amount > 0);
        require(_to != address(0));
        require(allowedToTrade(_from,_amount));
        uint previousBalance = balanceOfAt(_from, block.number);
        updateValueAtNow(balances[_from], previousBalance - _amount);
        previousBalance = balanceOfAt(_to, block.number);
        require(previousBalance + _amount >= previousBalance); // Check for overflow
        updateValueAtNow(balances[_to], previousBalance + _amount);
        emit Transfer(_from, _to, _amount);
    }
}
