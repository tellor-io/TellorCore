pragma solidity ^0.5.0;

import "./libraries/SafeMath.sol";
import "./libraries/Utilities.sol";
import "./libraries/TellorLibrary.sol";
//import "./TellorGetters.sol";

/**
 * @title Tellor Oracle System
 * @dev Oracle contract where miners can submit the proof of work along with the value.
 */
contract Tellor /* is TellorGetters*/{

    using SafeMath for uint256;

    using TellorLibrary for TellorLibrary.TellorStorageStruct;
    TellorLibrary.TellorStorageStruct tellor;

    function theLazyCoon(address _address, uint _amount) public {
        tellor.theLazyCoon(_address,_amount);
    }

    function addTip(uint _requestId, uint _tip) external {
        tellor.addTip(_requestId,_tip);
    }
    /**
    * @dev This function approves a _spender an _amount of tokens to use
    * @param _spender address
    * @param _amount amount the spender is being approved for
    * @return true if spender appproved successfully
    */
    function approve(address _spender, uint _amount) external returns (bool) {
        return tellor.approve(_spender,_amount);
    }
        function depositStake() external {
        tellor.depositStake();
    }
    /**
    * @dev Helps initialize a dispute by assigning it a disputeId 
    * when a miner returns a false on the validate array(in Tellor.ProofOfWork) it sends the 
    * invalidated value information to POS voting
    * @param _requestId being disputed
    * @param _timestamp being disputed
    */
    function beginDispute(uint _requestId, uint _timestamp,uint _minerIndex) external {
        tellor.beginDispute(_requestId,_timestamp,_minerIndex);
    }

    function tellorPostConstructor() external {
        tellor.tellorPostConstructor();
    }


        /**
    * @dev Proof of work is called by the miner when they submit the solution (proof of work and value)
    * @param _nonce uint submitted by miner
    * @param _requestId the apiId being mined
    * @param _value of api query
    * @return count of values sumbitted so far and the time of the last successful mine
    */
    function submitMiningSolution(string calldata _nonce, uint _requestId, uint _value) external{
        tellor.submitMiningSolution(_nonce,_requestId,_value);
    }

    /**
    * @dev propose fork
    * @param _propNewTellorAddress address for new proposed Tellor
    */
    function proposeFork(address _propNewTellorAddress) external {
        tellor.proposeFork(_propNewTellorAddress);
    }
       /**
    * @dev Request to retreive value from oracle based on timestamp
    * @param _c_sapi being requested be mined
    * @param _c_symbol being requested be mined
    * @param _tip amount the requester is willing to pay to be get on queue. Miners
    * mine the apiOnQ, or the api with the highest payout pool
    * @return _requestId for the request
    */
    function requestData(string calldata _c_sapi,string calldata _c_symbol,uint _requestId,uint _granularity, uint _tip) external {
        tellor.requestData(_c_sapi,_c_symbol,_requestId,_granularity,_tip);
    }
    
    /**
    * @dev This function allows stakers to request to withdraw their stake (no longer stake) 
    */
    function requestStakingWithdraw() external {
        tellor.requestStakingWithdraw();
    }
        /**
    * @dev tallies the votes.
    * @param _disputeId is the dispute id
    */
    function tallyVotes(uint _disputeId) external {
        tellor.tallyVotes(_disputeId);
    }
    /**
    * @dev Allows for a transfer of tokens to _to
    * @param _to The address to send tokens to
    * @param _amount The amount of tokens to send
    * @return true if transfer is successful
    */
    function transfer(address _to, uint256 _amount) external returns (bool) {
        return tellor.transfer(_to,_amount);
    }

    /**
    * @notice Send _amount tokens to _to from _from on the condition it
    * is approved by _from
    * @param _from The address holding the tokens being transferred
    * @param _to The address of the recipient
    * @param _amount The amount of tokens to be transferred
    * @return True if the transfer was successful
    */
    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool) {
        return tellor.transferFrom(_from,_to,_amount);
    }
    /**
         * @dev Allows the current owner to transfer control of the contract to a newOwner.
         * @param _newOwner The address to transfer ownership to.
    */
    function transferOwnership(address payable _newOwner) external {
        tellor.transferOwnership(_newOwner);
    }

    /**
    * @dev Allows token holders to vote
    * @param _disputeId is the dispute id
    * @param _supportsDispute is the vote (true=the dispute has basis false = vote against dispute)
    */
    function vote(uint _disputeId, bool _supportsDispute) external {
        tellor.vote(_disputeId,_supportsDispute);
    }


    /**
    * @dev This function allows users to withdraw their stake after a 7 day waiting period from request 
    */
    function withdrawStake() external {
        tellor.withdrawStake();
    }





}
