pragma solidity ^0.5.0;

import "./libraries/SafeMath.sol";
import "./Ownable.sol";

/**
* @title TokenAndStaking
* @dev This contracts contains the ERC20 token functions and staking functions for 
* Tellor Tributes
*/
contract TokenAndStaking is Ownable{
    using SafeMath for uint256;

    /*Functions*/
    /*****************Staking Functions***************/
    /**
    * @dev This function allows users to stake 
    */
    function depositStake() external {
        require( balanceOf(msg.sender) >= stakeAmt);
        require(staker[msg.sender].current_state == 0 || staker[msg.sender].current_state == 2);
        stakers += 1;
        staker[msg.sender] = StakeInfo({
            current_state: 1,
            startDate: now - (now % 86400)
            });
        emit NewStake(msg.sender);
    }
    /**
    * @dev This function allows users to withdraw their stake after a 7 day waiting period from request 
    */
    function withdrawStake() external {
        StakeInfo storage stakes = staker[msg.sender];
        uint _today = now - (now % 86400);
        require(_today - stakes.startDate >= 7 days && stakes.current_state == 2);
        stakes.current_state = 0;
        emit StakeWithdrawn(msg.sender);
    }

    /**
    * @dev This function allows stakers to request to withdraw their stake (no longer stake) 
    */
    function requestWithdraw() external {
        StakeInfo storage stakes = staker[msg.sender];
        require(stakes.current_state == 1);
        stakes.current_state = 2;
        stakes.startDate = now -(now % 86400);
        stakers -= 1;
        emit StakeWithdrawRequested(msg.sender);
    }

    
    /**
    * @dev Allows for a transfer of tokens to _to
    * @param _to The address to send tokens to
    * @param _amount The amount of tokens to send
    * @return true if transfer is successful
    */
     function transfer(address _to, uint256 _amount) public returns (bool success) {
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
    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
        require(allowed[_from][msg.sender] >= _amount);
        allowed[_from][msg.sender] -= _amount;
        doTransfer(_from, _to, _amount);
        return true;
    }

    /**
    * @dev This function approves a _spender an _amount of tokens to use
    * @param _spender address
    * @param _amount amount the spender is being approved for
    * @return true if spender appproved successfully
    */
    function approve(address _spender, uint _amount) public returns (bool) {
        require(allowedToTrade(msg.sender,_amount));
        allowed[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    /**
    * @dev Updates balance for from and to on the current block number via doTransfer
    * @param checkpoints gets the mapping for the balances[owner]
    * @param _value is the new balance
    */
    function updateValueAtNow(Checkpoint[] storage checkpoints, uint _value) internal  {
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
    function doTransfer(address _from, address _to, uint _amount) internal {
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
