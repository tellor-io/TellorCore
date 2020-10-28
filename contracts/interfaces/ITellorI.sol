pragma solidity ^0.5.0;


contract ITellorI {
    
    function changeDeity(address _newDeity) external;
    function changeTellorContract(address _tellorContract) external;
    function allowance(address _user, address _spender) external view returns (uint);
    function allowedToTrade(address _user,uint _amount) external view returns(bool);
    function balanceOf(address _user) external view returns (uint);
    function balanceOfAt(address _user, uint _blockNumber) external view returns (uint);
    function didMine(bytes32 _challenge, address _miner) external view returns(bool);
    function didVote(uint _disputeId, address _address) external view returns(bool);
    function getAddressVars(bytes32 _data) view external returns(address);
    function getAllDisputeVars(uint _disputeId) public view returns(bytes32, bool, bool, bool, address, address, address,uint[9] memory, int);
    function getCurrentVariables() external view returns(bytes32, uint, uint,string memory,uint,uint);
    function getDisputeIdByDisputeHash(bytes32 _hash) external view returns(uint);
    function getDisputeUintVars(uint _disputeId,bytes32 _data) external view returns(uint);
    function getLastNewValue() external view returns(uint,bool);
    function getLastNewValueById(uint _requestId) external view returns(uint,bool);
    function getMinedBlockNum(uint _requestId, uint _timestamp) external view returns(uint);
    function getMinersByRequestIdAndTimestamp(uint _requestId, uint _timestamp) external view returns(address[5] memory);
    function getName() external pure returns(string memory);
    function getNewValueCountbyRequestId(uint _requestId) external view returns(uint);
    function getRequestIdByRequestQIndex(uint _index) external view returns(uint);
    function getRequestIdByTimestamp(uint _timestamp) external view returns(uint);
    function getRequestIdByQueryHash(bytes32 _request) external view returns(uint);
    function getRequestQ() view public returns(uint[51] memory);
    function getRequestUintVars(uint _requestId,bytes32 _data) external view returns(uint);
    function getRequestVars(uint _requestId) external view returns(string memory, string memory,bytes32,uint, uint, uint);
    function getStakerInfo(address _staker) external view returns(uint,uint);
    function getSubmissionsByTimestamp(uint _requestId, uint _timestamp) external view returns(uint[5] memory);
    function getSymbol() external pure returns(string memory);
    function getTimestampbyRequestIDandIndex(uint _requestID, uint _index) external view returns(uint);
    function getUintVar(bytes32 _data) view public returns(uint);
    function getVariablesOnDeck() external view returns(uint, uint,string memory);
    function isInDispute(uint _requestId, uint _timestamp) external view returns(bool);    
    function retrieveData(uint _requestId, uint _timestamp) external view returns (uint);
    function totalSupply() external view returns (uint) ;    
    function theLazyCoon(address _address, uint _amount) public;
    function beginDispute(uint _requestId, uint _timestamp,uint _minerIndex) external;
    function vote(uint _disputeId, bool _supportsDispute) external;
    function tallyVotes(uint _disputeId) external;
    function proposeFork(address _propNewTellorAddress) external;
    function addTip(uint _requestId, uint _tip) external;
    function requestData(string calldata _c_sapi,string calldata _c_symbol,uint _granularity, uint _tip) external;
    function submitMiningSolution(string calldata _nonce, uint _requestId, uint _value) external;
    function testSubmitMiningSolution(string calldata _nonce, uint256 _requestId, uint256 _value) external;
    function proposeOwnership(address payable _pendingOwner) external;
    function claimOwnership() external;
    function depositStake() external;
    function requestStakingWithdraw() external;
    function withdrawStake() external;
    function approve(address _spender, uint _amount) external returns (bool);
    function transfer(address _to, uint256 _amount) external returns (bool);
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool);
}
