pragma solidity ^0.5.0;

import "./libraries/SafeMath.sol";
import "./libraries/Utilities.sol";
import "./DisputesAndVoting.sol";


/**
 * @title Tellor Oracle System
 * @dev Oracle contract where miners can submit the proof of work along with the value.
 */
contract Tellor is DisputesAndVoting{
    using SafeMath for uint256;
    /*Functions*/
    /*
     *This function gives 5 miners the inital staked tokens in the system.  
     * It would run with the constructor, but throws on too much gas
    */
    function initStake() public{
        require(requests == 0);
        updateValueAtNow(balances[address(this)], 2**256-1 - 5000e18);
        address payable[5] memory _initalMiners = [address(0xE037EC8EC9ec423826750853899394dE7F024fee),
        address(0xcdd8FA31AF8475574B8909F135d510579a8087d3),
        address(0xb9dD5AfD86547Df817DA2d0Fb89334A6F8eDd891),
        address(0x230570cD052f40E14C14a81038c6f3aa685d712B),
        address(0x3233afA02644CCd048587F8ba6e99b3C00A34DcC)];
        for(uint i=0;i<5;i++){
            updateValueAtNow(balances[_initalMiners[i]],1000e18);
            staker[_initalMiners[i]] = StakeInfo({
                current_state: 1,
                startDate: now - (now % 86400)
                });
            emit NewStake(_initalMiners[i]);
        }
        stakers += 5;
        total_supply += 5000e18;
        for(uint i = 49;i > 0;i--) {
            payoutPool[i] = 0;
        }
    }
    /**
    * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
    * @param nonce uint submitted by miner
    * @param _apiId the apiId being mined
    * @param value of api query
    * @return count of values sumbitted so far and the time of the last successful mine
    */
    function proofOfWork(string calldata nonce, uint _apiId, uint value) external{
        require(isStaked(msg.sender));
        require(_apiId == miningApiId);
        bytes32 n = sha256(abi.encodePacked(ripemd160(abi.encodePacked(keccak256(abi.encodePacked(currentChallenge,msg.sender,nonce))))));
        require(uint(n) % difficulty_level == 0);
        require(miners[currentChallenge][msg.sender] == false); 
        first_five[count].value = value;
        first_five[count].miner = msg.sender;
        count++;
        miners[currentChallenge][msg.sender] = true;
        emit NonceSubmitted(msg.sender,nonce,_apiId,value);
        if(count == 5) { 
            API storage _api = apiDetails[_apiId];
            if(int(difficulty_level) + (int(timeTarget) - int(now - timeOfLastProof))/60 > 0){
                difficulty_level = uint(int(difficulty_level) + (int(timeTarget) - int(now - timeOfLastProof))/60);
            }
            else{
                difficulty_level = 1;
            }
            timeOfLastProof = now - (now % timeTarget);
            Details[5] memory a = first_five;
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
                doTransfer(address(this),a[i].miner,payoutStructure[i] + _api.payout/22 * payoutStructure[i] / 1e18);
            }
            _api.payout = 0; 
            total_supply += payoutTotal + payoutTotal*10/100;
            doTransfer(address(this),owner(),(payoutTotal * 10 / 100));//The ten there is the devshare
            _api.values[timeOfLastProof] = a[2].value;
            _api.minersbyvalue[timeOfLastProof] = [a[0].miner,a[1].miner,a[2].miner,a[3].miner,a[4].miner];
            _api.minedBlockNum[timeOfLastProof] = block.number;
            miningApiId = apiId[apiOnQ]; 
            timeToApiId[timeOfLastProof] = _apiId;
            timestamps.push(timeOfLastProof);
            count = 0;
            payoutPool[apiDetails[apiIdOnQ].index] = 0;
            payoutPoolIndexToApiId[apiDetails[apiIdOnQ].index] = 0;
            apiDetails[apiIdOnQ].index = 0;
            uint[2] memory nums; //reusable number array -- _amount,_paid,payoutMultiplier
            if(miningApiId > 0){
                (nums[0],nums[1]) = Utilities.getMax(payoutPool);
                apiIdOnQ = payoutPoolIndexToApiId[nums[1]];
                apiOnQ = apiDetails[apiIdOnQ].apiHash;
                apiOnQPayout = nums[0];
                currentChallenge = keccak256(abi.encodePacked(nonce, currentChallenge, blockhash(block.number - 1))); // Save hash for next proof
                emit NewChallenge(currentChallenge,miningApiId,difficulty_level,apiDetails[miningApiId].apiString);   
                emit NewAPIonQinfo(apiIdOnQ,apiDetails[apiIdOnQ].apiString,apiOnQ,apiOnQPayout);    
            }
            emit NewValue(_apiId,timeOfLastProof,a[2].value);
        }
    }

   /**
    * @dev Request to retreive value from oracle based on timestamp
    * @param c_sapi being requested be mined
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the apiOnQ, or the api with the highest payout pool
    * @return _apiId for the request
    */
    function requestData(string calldata c_sapi,uint c_apiId,uint _granularity, uint _tip) external {
        uint _apiId = c_apiId;
        require(_granularity > 0);
        if(_apiId == 0){
            string memory _sapi = c_sapi;
            require(bytes(_sapi).length > 0);
            bytes32 _apiHash = sha256(abi.encodePacked(_sapi,_granularity));
            if(apiId[_apiHash] == 0){
                requests++;
                _apiId=requests;
                apiDetails[_apiId] = API({
                    apiString : _sapi, 
                    apiHash: _apiHash,
                    granularity:  _granularity,
                    payout: 0,
                    index: 0
                    });
                apiId[_apiHash] = _apiId;
            }
            else{
                _apiId = apiId[_apiHash];
            }
        }
        if(_tip > 0){
            doTransfer(msg.sender,address(this),_tip);
            apiDetails[_apiId].payout = apiDetails[_apiId].payout.add(_tip);
        }
        updateAPIonQ(_apiId);
        emit DataRequested(msg.sender,apiDetails[_apiId].apiString,_granularity,_apiId,_tip);
    }

    /**
    @dev This function updates APIonQ and the payoutPool when requestData or addToValuePool are ran
    @param _apiId being requested
    */
    function updateAPIonQ (uint _apiId) internal {
        API storage _api = apiDetails[_apiId];
        uint _payout = _api.payout;
        if(miningApiId == 0){
            miningApiId = _apiId;
            currentChallenge = keccak256(abi.encodePacked(_payout, currentChallenge, blockhash(block.number - 1))); // Save hash for next proof
            emit NewChallenge(currentChallenge,miningApiId,difficulty_level,apiDetails[miningApiId].apiString);
            return;
        }
        if (_payout > apiOnQPayout || apiIdOnQ == 0) {
                apiIdOnQ = _apiId;
                apiOnQ = _api.apiHash;
                apiOnQPayout = _payout;
                emit NewAPIonQinfo(_apiId,_api.apiString,apiOnQ,apiOnQPayout);
        }
        if(_api.index == 0){
            uint _min;
            uint _index;
            (_min,_index) = Utilities.getMin(payoutPool);
            if(_payout > _min || _min == 0){
                payoutPool[_index] = _payout;
                payoutPoolIndexToApiId[_index] = _apiId;
                _api.index = _index;
            }
        }
        else{
            payoutPool[_api.index] = _payout;
        }
    }
}
