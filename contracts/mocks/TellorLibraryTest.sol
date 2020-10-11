pragma solidity ^0.5.16;


import "../libraries/SafeMath.sol";
import "../libraries/TellorLibrary.sol";
/**
 * @title Tellor Oracle System Library
 * @dev Contains the functions' logic for the Tellor contract where miners can submit the proof of work
 * along with the value and smart contracts can requestData and tip miners.
 */
library TellorLibraryTest {

    using TellorLibrary for TellorStorage.TellorStorageStruct;
    
    bytes32 public constant requestCount = 0x05de9147d05477c0a5dc675aeea733157f5092f82add148cf39d579cafe3dc98; //keccak256("requestCount")
    bytes32 public constant totalTip = 0x2a9e355a92978430eca9c1aa3a9ba590094bac282594bccf82de16b83046e2c3; //keccak256("totalTip")
    bytes32 public constant _tBlock = 0x969ea04b74d02bb4d9e6e8e57236e1b9ca31627139ae9f0e465249932e824502; //keccak256("_tBlock")
    bytes32 public constant timeOfLastNewValue = 0x97e6eb29f6a85471f7cc9b57f9e4c3deaf398cfc9798673160d7798baf0b13a4; //keccak256("timeOfLastNewValue")
    bytes32 public constant difficulty = 0xb12aff7664b16cb99339be399b863feecd64d14817be7e1f042f97e3f358e64e; //keccak256("difficulty")
    bytes32 public constant timeTarget = 0xad16221efc80aaf1b7e69bd3ecb61ba5ffa539adf129c3b4ffff769c9b5bbc33; //keccak256("timeTarget")
    bytes32 public constant runningTips = 0xdb21f0c4accc4f2f5f1045353763a9ffe7091ceaf0fcceb5831858d96cf84631; //keccak256("runningTips")
    bytes32 public constant currentReward = 0x9b6853911475b07474368644a0d922ee13bc76a15cd3e97d3e334326424a47d4; //keccak256("currentReward")
    bytes32 public constant total_supply = 0xb1557182e4359a1f0c6301278e8f5b35a776ab58d39892581e357578fb287836; //keccak256("total_supply")
    bytes32 public constant devShare = 0x8fe9ded8d7c08f720cf0340699024f83522ea66b2bbfb8f557851cb9ee63b54c; //keccak256("devShare")
    bytes32 public constant _owner =  0x9dbc393ddc18fd27b1d9b1b129059925688d2f2d5818a5ec3ebb750b7c286ea6; //keccak256("_owner")
    bytes32 public constant requestQPosition = 0x1e344bd070f05f1c5b3f0b1266f4f20d837a0a8190a3a2da8b0375eac2ba86ea; //keccak256("requestQPosition")
    bytes32 public constant currentTotalTips = 0xd26d9834adf5a73309c4974bf654850bb699df8505e70d4cfde365c417b19dfc; //keccak256("currentTotalTips")
    bytes32 public constant slotProgress =0x6c505cb2db6644f57b42d87bd9407b0f66788b07d0617a2bc1356a0e69e66f9a; //keccak256("slotProgress")
    bytes32 public constant pending_owner = 0x44b2657a0f8a90ed8e62f4c4cceca06eacaa9b4b25751ae1ebca9280a70abd68; //keccak256("pending_owner")
    bytes32 public constant currentRequestId = 0x7584d7d8701714da9c117f5bf30af73b0b88aca5338a84a21eb28de2fe0d93b8; //keccak256("currentRequestId")

    /*This is a cheat for demo purposes, will delete upon actual launch*/
    function theLazyCoon(TellorStorage.TellorStorageStruct storage self,address _address, uint _amount) public {
        self.uintVars[total_supply] += _amount;
        TellorTransfer.updateBalanceAtNow(self.balances[_address],_amount);
    }

    function manuallySetDifficulty(TellorStorage.TellorStorageStruct storage self,uint256 _diff) public{
        self.uintVars[difficulty] = _diff;
        
    }
    //Outdated Functions needed for upgrading
    /**
    * @dev This function is called by submitMiningSolution and adjusts the difficulty, sorts and stores the first
    * 5 values received, pays the miners, the dev share and assigns a new challenge
    * @param _nonce or solution for the PoW  for the requestId
    * @param _requestId for the current request being mined
    */
    function newBlock(TellorStorage.TellorStorageStruct storage self, string memory _nonce, uint256 _requestId) public {
        TellorStorage.Request storage _request = self.requestDetails[_requestId];

        // If the difference between the timeTarget and how long it takes to solve the challenge this updates the challenge
        //difficulty up or donw by the difference between the target time and how long it took to solve the prevous challenge
        //otherwise it sets it to 1
        int256 _change = int256(SafeMath.min(1200, (now - self.uintVars[timeOfLastNewValue])));
        int256 _diff = int256(self.uintVars[difficulty]);
        _change = (_diff * (int256(self.uintVars[timeTarget]) - _change)) / 4000;
        
        if (_change == 0) {
                _change = 1;
            }
        self.uintVars[difficulty]  = uint256(SafeMath.max(_diff+ _change,1));
        //Sets time of value submission rounded to 1 minute
        uint256 _timeOfLastNewValue = now - (now % 1 minutes);
        self.uintVars[timeOfLastNewValue] = _timeOfLastNewValue;

        //The sorting algorithm that sorts the values of the first five values that come in
        TellorStorage.Details[5] memory a = self.currentMiners;
        uint256 i;
        for (i = 1; i < 5; i++) {
            uint256 temp = a[i].value;
            address temp2 = a[i].miner;
            uint256 j = i;
            while (j > 0 && temp < a[j - 1].value) {
                a[j].value = a[j - 1].value;
                a[j].miner = a[j - 1].miner;
                j--;
            }
            if (j < i) {
                a[j].value = temp;
                a[j].miner = temp2;
            }
        }

        //Pay the miners 
        //adjust by payout = payout * ratio 0.000030612633181126/1e18  
        if(self.uintVars[currentReward] == 0){
            self.uintVars[currentReward] = 5e18;
        }
        if (self.uintVars[currentReward] > 1e18) {
        self.uintVars[currentReward] = self.uintVars[currentReward] - self.uintVars[currentReward] * 30612633181126/1e18; 
        self.uintVars[devShare] = self.uintVars[currentReward] * 50/100;
        } else {
            self.uintVars[currentReward] = 1e18;
        }
        for (i = 0; i < 5; i++) {
            TellorTransfer.doTransfer(self, address(this), a[i].miner, self.uintVars[currentReward]  + self.uintVars[currentTotalTips] / 5);
        }
        //update the total supply
        self.uintVars[total_supply] +=  self.uintVars[devShare] + self.uintVars[currentReward]*5 ;
        //pay the dev-share
        TellorTransfer.doTransfer(self, address(this), self.addressVars[_owner],  self.uintVars[devShare]);
        //Save the official(finalValue), timestamp of it, 5 miners and their submitted values for it, and its block number
        _request.finalValues[_timeOfLastNewValue] = a[2].value;
        _request.requestTimestamps.push(_timeOfLastNewValue);
        //these are miners by timestamp
        _request.minersByValue[_timeOfLastNewValue] = [a[0].miner, a[1].miner, a[2].miner, a[3].miner, a[4].miner];
        _request.valuesByTimestamp[_timeOfLastNewValue] = [a[0].value, a[1].value, a[2].value, a[3].value, a[4].value];
        _request.minedBlockNum[_timeOfLastNewValue] = block.number;
        //map the timeOfLastValue to the requestId that was just mined
        self.requestIdByTimestamp[_timeOfLastNewValue] = _requestId;
        //add timeOfLastValue to the newValueTimestamps array
        self.newValueTimestamps.push(_timeOfLastNewValue);
        //re-start the count for the slot progress to zero before the new request mining starts
        self.uintVars[slotProgress] = 0;

        if(self.uintVars[timeTarget] == 600){
            self.uintVars[timeTarget] = 300;
            self.uintVars[currentReward] = self.uintVars[currentReward]/2;
            self.uintVars[_tBlock] = 1e18;
            self.uintVars[difficulty] = SafeMath.max(1,self.uintVars[difficulty]/3);
        }
        for(i = 0; i< 5;i++){
            self.currentMiners[i].value = i+1;
            self.requestQ[self.requestDetails[i+1].apiUintVars[requestQPosition]] = 0;
            self.uintVars[currentTotalTips] += self.requestDetails[i+1].apiUintVars[totalTip];
        }
        self.currentChallenge = keccak256(abi.encode(_nonce, self.currentChallenge, blockhash(block.number - 1))); // Save hash for next proof
    }

    /**
    * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
    * @param _nonce uint submitted by miner
    * @param _requestId the apiId being mined
    * @param _value of api query
    */
    function submitMiningSolution(TellorStorage.TellorStorageStruct storage self, string memory _nonce, uint256 _requestId, uint256 _value)
        public
    {
        
        require (self.uintVars[timeTarget] == 600, "Contract has upgraded, call new function");
        //require miner is staked
        require(self.stakerDetails[msg.sender].currentStatus == 1, "Miner status is not staker");

        //Check the miner is submitting the pow for the current request Id
        require(_requestId == self.uintVars[currentRequestId], "RequestId is wrong");

        //Saving the challenge information as unique by using the msg.sender
        //Ignoring difficulty since this can only be called on testing enviroment
        // require(
        //     uint256(
        //         sha256(abi.encodePacked(ripemd160(abi.encodePacked(keccak256(abi.encodePacked(self.currentChallenge, msg.sender, _nonce))))))
        //     ) %
        //         self.uintVars[difficulty] ==
        //         0,
        //     "Incorrect nonce for current challenge"
        // );

        //Make sure the miner does not submit a value more than once
        require(self.minersByChallenge[self.currentChallenge][msg.sender] == false, "Miner already submitted the value");

        //Save the miner and value received
        self.currentMiners[self.uintVars[slotProgress]].value = _value;
        self.currentMiners[self.uintVars[slotProgress]].miner = msg.sender;

        //Add to the count how many values have been submitted, since only 5 are taken per request
        self.uintVars[slotProgress]++;

        //Update the miner status to true once they submit a value so they don't submit more than once
        self.minersByChallenge[self.currentChallenge][msg.sender] = true;
        if (self.uintVars[slotProgress] == 5) {
            newBlock(self, _nonce, _requestId);
        }
    } 
}
