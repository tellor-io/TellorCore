pragma solidity ^0.5.16;

import "./SafeMath.sol";
import "./Utilities.sol";
import "./TellorStorage.sol";
import "./TellorTransfer.sol";
import "./TellorDispute.sol";
import "./TellorStake.sol";
import "./TellorGettersLibrary.sol";

import "hardhat/console.sol";

/**
 * @title Tellor Oracle System Library
 * @dev Contains the functions' logic for the Tellor contract where miners can submit the proof of work
 * along with the value and smart contracts can requestData and tip miners.
 */
library TellorLibrary {
    using SafeMath for uint256;

    // bytes32 public constant devShare = 0x8fe9ded8d7c08f720cf0340699024f83522ea66b2bbfb8f557851cb9ee63b54c; //keccak256("devShare")
    // bytes32 public constant runningTips = 0xdb21f0c4accc4f2f5f1045353763a9ffe7091ceaf0fcceb5831858d96cf84631; //keccak256("runningTips")
    // bytes32 public constant currentReward = 0x9b6853911475b07474368644a0d922ee13bc76a15cd3e97d3e334326424a47d4; //keccak256("currentReward")
    bytes32 public constant requestCount =
        0x05de9147d05477c0a5dc675aeea733157f5092f82add148cf39d579cafe3dc98; //keccak256("requestCount")
    bytes32 public constant totalTip =
        0x2a9e355a92978430eca9c1aa3a9ba590094bac282594bccf82de16b83046e2c3; //keccak256("totalTip")
    bytes32 public constant _tBlock =
        0x969ea04b74d02bb4d9e6e8e57236e1b9ca31627139ae9f0e465249932e824502; //keccak256("_tBlock")
    bytes32 public constant timeOfLastNewValue =
        0x97e6eb29f6a85471f7cc9b57f9e4c3deaf398cfc9798673160d7798baf0b13a4; //keccak256("timeOfLastNewValue")
    bytes32 public constant difficulty =
        0xb12aff7664b16cb99339be399b863feecd64d14817be7e1f042f97e3f358e64e; //keccak256("difficulty")
    bytes32 public constant timeTarget =
        0xad16221efc80aaf1b7e69bd3ecb61ba5ffa539adf129c3b4ffff769c9b5bbc33; //keccak256("timeTarget")
    bytes32 public constant total_supply =
        0xb1557182e4359a1f0c6301278e8f5b35a776ab58d39892581e357578fb287836; //keccak256("total_supply")
    bytes32 public constant _owner =
        0x9dbc393ddc18fd27b1d9b1b129059925688d2f2d5818a5ec3ebb750b7c286ea6; //keccak256("_owner")
    bytes32 public constant requestQPosition =
        0x1e344bd070f05f1c5b3f0b1266f4f20d837a0a8190a3a2da8b0375eac2ba86ea; //keccak256("requestQPosition")
    bytes32 public constant currentTotalTips =
        0xd26d9834adf5a73309c4974bf654850bb699df8505e70d4cfde365c417b19dfc; //keccak256("currentTotalTips")
    bytes32 public constant slotProgress =
        0x6c505cb2db6644f57b42d87bd9407b0f66788b07d0617a2bc1356a0e69e66f9a; //keccak256("slotProgress")
    bytes32 public constant pending_owner =
        0x44b2657a0f8a90ed8e62f4c4cceca06eacaa9b4b25751ae1ebca9280a70abd68; //keccak256("pending_owner")
    bytes32 public constant currentRequestId =
        0x7584d7d8701714da9c117f5bf30af73b0b88aca5338a84a21eb28de2fe0d93b8; //keccak256("currentRequestId")

    event TipAdded(
        address indexed _sender,
        uint256 indexed _requestId,
        uint256 _tip,
        uint256 _totalTips
    );
    //emits when a new challenge is created (either on mined block or when a new request is pushed forward on waiting system)
    event NewChallenge(
        bytes32 indexed _currentChallenge,
        uint256[5] _currentRequestId,
        uint256 _difficulty,
        uint256 _totalTips
    );
    //Emits upon a successful Mine, indicates the blockTime at point of the mine and the value mined
    event NewValue(
        uint256[5] _requestId,
        uint256 _time,
        uint256[5] _value,
        uint256 _totalTips,
        bytes32 indexed _currentChallenge
    );
    //Emits upon each mine (5 total) and shows the miner, nonce, and value submitted
    event NonceSubmitted(
        address indexed _miner,
        string _nonce,
        uint256[5] _requestId,
        uint256[5] _value,
        bytes32 indexed _currentChallenge,
        uint256 _slot
    );

    /*Functions*/
    /**
     * @dev Add tip to Request value from oracle
     * @param _requestId being requested to be mined
     * @param _tip amount the requester is willing to pay to be get on queue. Miners
     * mine the onDeckQueryHash, or the api with the highest payout pool
     */
    function addTip(
        TellorStorage.TellorStorageStruct storage self,
        uint256 _requestId,
        uint256 _tip
    ) public {
        require(_requestId != 0, "RequestId is 0");
        require(_tip != 0, "Tip should be greater than 0");
        uint256 _count = self.uintVars[requestCount] + 1;
        if (_requestId == _count) {
            self.uintVars[requestCount] = _count;
        } else {
            require(_requestId < _count, "RequestId is not less than count");
        }
        TellorTransfer.doTransfer(self, msg.sender, address(this), _tip);
        //Update the information for the request that should be mined next based on the tip submitted
        updateOnDeck(self, _requestId, _tip);
        emit TipAdded(
            msg.sender,
            _requestId,
            _tip,
            self.requestDetails[_requestId].apiUintVars[totalTip]
        );
    }

    /**
     * @dev This function is called by submitMiningSolution and adjusts the difficulty, sorts and stores the first
     * 5 values received, pays the miners, the dev share and assigns a new challenge
     * @param _nonce or solution for the PoW  for the requestId
     * @param _requestId for the current request being mined
     */
    function newBlock(
        TellorStorage.TellorStorageStruct storage self,
        string memory _nonce,
        uint256[5] memory _requestId
    ) public {
        TellorStorage.Request storage _tblock =
            self.requestDetails[self.uintVars[_tBlock]];

        //Sets time of value submission rounded to 1 minute
        bytes32 _currChallenge = self.currentChallenge;
        uint256 _previousTime = self.uintVars[timeOfLastNewValue];
        uint256 _timeOfLastNewValue = block.timestamp;
        self.uintVars[timeOfLastNewValue] = _timeOfLastNewValue;
        uint256[5] memory a;
        for (uint256 k = 0; k < 5; k++) {
            for (uint256 i = 1; i < 5; i++) {
                uint256 temp = _tblock.valuesByTimestamp[k][i];
                address temp2 = _tblock.minersByValue[k][i];
                uint256 j = i;
                while (j > 0 && temp < _tblock.valuesByTimestamp[k][j - 1]) {
                    _tblock.valuesByTimestamp[k][j] = _tblock.valuesByTimestamp[
                        k
                    ][j - 1];
                    _tblock.minersByValue[k][j] = _tblock.minersByValue[k][
                        j - 1
                    ];
                    j--;
                }
                if (j < i) {
                    _tblock.valuesByTimestamp[k][j] = temp;
                    _tblock.minersByValue[k][j] = temp2;
                }
            }
            TellorStorage.Request storage _request =
                self.requestDetails[_requestId[k]];
            //Save the official(finalValue), timestamp of it, 5 miners and their submitted values for it, and its block number
            a = _tblock.valuesByTimestamp[k];
            _request.finalValues[_timeOfLastNewValue] = a[2];
            _request.minersByValue[_timeOfLastNewValue] = _tblock.minersByValue[
                k
            ];
            _request.valuesByTimestamp[_timeOfLastNewValue] = _tblock
                .valuesByTimestamp[k];
            delete _tblock.minersByValue[k];
            delete _tblock.valuesByTimestamp[k];
            _request.requestTimestamps.push(_timeOfLastNewValue);
            _request.minedBlockNum[_timeOfLastNewValue] = block.number;
            _request.apiUintVars[totalTip] = 0;
        }
        emit NewValue(
            _requestId,
            _timeOfLastNewValue,
            a,
            self.uintVars[currentTotalTips],
            _currChallenge
        );
        //map the timeOfLastValue to the requestId that was just mined
        self.requestIdByTimestamp[_timeOfLastNewValue] = _requestId[0];
        //add timeOfLastValue to the newValueTimestamps array
        self.newValueTimestamps.push(_timeOfLastNewValue);

        address[5] memory miners =
            self.requestDetails[_requestId[0]].minersByValue[
                _timeOfLastNewValue
            ];
        //payMinersRewards
        _payReward(self, miners, _previousTime);

        self.uintVars[_tBlock]++;
        uint256[5] memory _topId = TellorStake.getTopRequestIDs(self);
        for (uint256 i = 0; i < 5; i++) {
            self.currentMiners[i].value = _topId[i];
            self.requestQ[
                self.requestDetails[_topId[i]].apiUintVars[requestQPosition]
            ] = 0;
            self.uintVars[currentTotalTips] += self.requestDetails[_topId[i]]
                .apiUintVars[totalTip];
        }
        //Issue the the next challenge

        _currChallenge = keccak256(
            abi.encode(_nonce, _currChallenge, blockhash(block.number - 1))
        );
        self.currentChallenge = _currChallenge; // Save hash for next proof
        emit NewChallenge(
            _currChallenge,
            _topId,
            self.uintVars[difficulty],
            self.uintVars[currentTotalTips]
        );
    }

    function adjustDifficulty(TellorStorage.TellorStorageStruct storage self)
        internal
    {
        // If the difference between the timeTarget and how long it takes to solve the challenge this updates the challenge
        //difficulty up or down by the difference between the target time and how long it took to solve the previous challenge
        //otherwise it sets it to 1
        uint256 timeDiff = now - self.uintVars[timeOfLastNewValue];
        int256 _change = int256(SafeMath.min(1200, timeDiff));
        int256 _diff = int256(self.uintVars[difficulty]);
        _change =
            (_diff * (int256(self.uintVars[timeTarget]) - _change)) /
            4000;
        if (_change == 0) {
            _change = 1;
        }
        self.uintVars[difficulty] = uint256(SafeMath.max(_diff + _change, 1));
    }

    /**
     * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
     * @param _nonce uint submitted by miner
     * @param _requestId is the array of the 5 PSR's being mined
     * @param _value is an array of 5 values
     */
    function submitMiningSolution(
        TellorStorage.TellorStorageStruct storage self,
        string calldata _nonce,
        uint256[5] calldata _requestId,
        uint256[5] calldata _value
    ) external {
        if (self.uintVars[slotProgress] != 4) {
            _verifyNonce(self, _nonce);
        }
        _submitMiningSolution(self, _nonce, _requestId, _value);
    }

    function _submitMiningSolution(
        TellorStorage.TellorStorageStruct storage self,
        string memory _nonce,
        uint256[5] memory _requestId,
        uint256[5] memory _value
    ) internal {
        //Verifying Miner Eligibility
        bytes32 _hashMsgSender = keccak256(abi.encode(msg.sender));
        require(
            self.stakerDetails[msg.sender].currentStatus == 1,
            "Miner status is not staker"
        );
        require(
            now - self.uintVars[_hashMsgSender] > 15 minutes,
            "Miner can only win rewards once per 15 min"
        );
        require(
            _requestId[0] == self.currentMiners[0].value,
            "Request ID is wrong"
        );
        require(
            _requestId[1] == self.currentMiners[1].value,
            "Request ID is wrong"
        );
        require(
            _requestId[2] == self.currentMiners[2].value,
            "Request ID is wrong"
        );
        require(
            _requestId[3] == self.currentMiners[3].value,
            "Request ID is wrong"
        );
        require(
            _requestId[4] == self.currentMiners[4].value,
            "Request ID is wrong"
        );
        self.uintVars[_hashMsgSender] = now;

        bytes32 _currChallenge = self.currentChallenge;
        uint256 _slotProgress = self.uintVars[slotProgress];
        //Saving the challenge information as unique by using the msg.sender

        //Checking and updating Miner Status
        require(
            self.minersByChallenge[_currChallenge][msg.sender] == false,
            "Miner already submitted the value"
        );
        //Update the miner status to true once they submit a value so they don't submit more than once
        self.minersByChallenge[_currChallenge][msg.sender] = true;

        //Updating Request
        TellorStorage.Request storage _tblock =
            self.requestDetails[self.uintVars[_tBlock]];

        //Assigning directly is cheaper than using a for loop
        _tblock.valuesByTimestamp[0][_slotProgress] = _value[0];
        _tblock.valuesByTimestamp[1][_slotProgress] = _value[1];
        _tblock.valuesByTimestamp[2][_slotProgress] = _value[2];
        _tblock.valuesByTimestamp[3][_slotProgress] = _value[3];
        _tblock.valuesByTimestamp[4][_slotProgress] = _value[4];
        _tblock.minersByValue[0][_slotProgress] = msg.sender;
        _tblock.minersByValue[1][_slotProgress] = msg.sender;
        _tblock.minersByValue[2][_slotProgress] = msg.sender;
        _tblock.minersByValue[3][_slotProgress] = msg.sender;
        _tblock.minersByValue[4][_slotProgress] = msg.sender;

        if (_slotProgress + 1 == 4) {
            adjustDifficulty(self);
        }

        if (_slotProgress + 1 == 5) {
            //slotProgress has been incremented, but we're using the variable on stack to save gas
            newBlock(self, _nonce, _requestId);
            self.uintVars[slotProgress] = 0;
        } else {
            self.uintVars[slotProgress]++;
        }
        emit NonceSubmitted(
            msg.sender,
            _nonce,
            _requestId,
            _value,
            _currChallenge,
            _slotProgress
        );
    }

    function _verifyNonce(
        TellorStorage.TellorStorageStruct storage self,
        string memory _nonce
    ) internal view {
        // console.log(now - (now % 1 minutes));
        // console.log(self.uintVars[timeOfLastNewValue]);
        console.log(
            (now - (now % 1 minutes)) - self.uintVars[timeOfLastNewValue]
        );
        require(
            uint256(
                sha256(
                    abi.encodePacked(
                        ripemd160(
                            abi.encodePacked(
                                keccak256(
                                    abi.encodePacked(
                                        self.currentChallenge,
                                        msg.sender,
                                        _nonce
                                    )
                                )
                            )
                        )
                    )
                )
            ) %
                self.uintVars[difficulty] ==
                0 ||
                (now - (now % 1 minutes)) - self.uintVars[timeOfLastNewValue] >=
                15 minutes,
            "Incorrect nonce for current challenge"
        );
    }

    /**
     * @dev Internal function to calculate and pay rewards to miners
     *
     */
    function _payReward(
        TellorStorage.TellorStorageStruct storage self,
        address[5] memory miners,
        uint256 _previousTime
    ) internal {
        //_timeDiff is how many minutes passed since last block
        uint256 _timeDiff = block.timestamp - _previousTime;
        uint256 _currReward = 1e18;
        uint256 reward = (_timeDiff * _currReward) / 300;
        uint256 _tip = self.uintVars[currentTotalTips] / 10;
        uint256 _devShare = reward / 2;

        TellorTransfer.doTransfer(
            self,
            address(this),
            miners[0],
            reward + _tip
        );
        TellorTransfer.doTransfer(
            self,
            address(this),
            miners[1],
            reward + _tip
        );
        TellorTransfer.doTransfer(
            self,
            address(this),
            miners[2],
            reward + _tip
        );
        TellorTransfer.doTransfer(
            self,
            address(this),
            miners[3],
            reward + _tip
        );
        TellorTransfer.doTransfer(
            self,
            address(this),
            miners[4],
            reward + _tip
        );

        //update the total supply
        self.uintVars[total_supply] +=
            _devShare +
            reward *
            5 -
            (self.uintVars[currentTotalTips] / 2);
        TellorTransfer.doTransfer(
            self,
            address(this),
            self.addressVars[_owner],
            _devShare
        );
        self.uintVars[currentTotalTips] = 0;
    }

    /**
     * @dev This function updates APIonQ and the requestQ when requestData or addTip are ran
     * @param _requestId being requested
     * @param _tip is the tip to add
     */
    function updateOnDeck(
        TellorStorage.TellorStorageStruct storage self,
        uint256 _requestId,
        uint256 _tip
    ) public {
        TellorStorage.Request storage _request =
            self.requestDetails[_requestId];
        _request.apiUintVars[totalTip] = _request.apiUintVars[totalTip].add(
            _tip
        );
        if (
            self.currentMiners[0].value == _requestId ||
            self.currentMiners[1].value == _requestId ||
            self.currentMiners[2].value == _requestId ||
            self.currentMiners[3].value == _requestId ||
            self.currentMiners[4].value == _requestId
        ) {
            self.uintVars[currentTotalTips] += _tip;
        } else {
            //if the request is not part of the requestQ[51] array
            //then add to the requestQ[51] only if the _payout/tip is greater than the minimum(tip) in the requestQ[51] array
            if (_request.apiUintVars[requestQPosition] == 0) {
                uint256 _min;
                uint256 _index;
                (_min, _index) = Utilities.getMin(self.requestQ);
                //we have to zero out the oldOne
                //if the _payout is greater than the current minimum payout in the requestQ[51] or if the minimum is zero
                //then add it to the requestQ array and map its index information to the requestId and the apiUintVars
                if (_request.apiUintVars[totalTip] > _min || _min == 0) {
                    self.requestQ[_index] = _request.apiUintVars[totalTip];
                    self.requestDetails[self.requestIdByRequestQIndex[_index]]
                        .apiUintVars[requestQPosition] = 0;
                    self.requestIdByRequestQIndex[_index] = _requestId;
                    _request.apiUintVars[requestQPosition] = _index;
                }
                // else if the requestId is part of the requestQ[51] then update the tip for it
            } else {
                self.requestQ[_request.apiUintVars[requestQPosition]] += _tip;
            }
        }
    }
}
