pragma solidity ^0.5.0;

import "./TellorStorage.sol";
import "./TellorTransfer.sol";
import "./TellorDispute.sol";

// methods related to stake
library TellorStake {
    event NewStake(address indexed _sender);//Emits upon new staker
    event StakeWithdrawn(address indexed _sender);//Emits when a staker is now no longer staked
    event StakeWithdrawRequested(address indexed _sender);//Emits when a staker begins the 7 day withdraw period

    /**
    * @dev This function allows stakers to request to withdraw their stake (no longer stake)
    * once they lock for withdraw(stakes.currentStatus = 2) they are locked for 7 days before they
    * can withdraw the deposit
    */
    function requestStakingWithdraw(TellorStorage.TellorStorageStruct storage self) public {
        TellorStorage.StakeInfo storage stakes = self.stakerDetails[msg.sender];
        //Require that the miner is staked
        require(stakes.currentStatus == 1);

        //Change the miner staked to locked to be withdrawStake
        stakes.currentStatus = 2;

        //Change the startDate to now since the lock up period begins now
        //and the miner can only withdraw 7 days later from now(check the withdraw function)
        stakes.startDate = now -(now % 86400);

        //Reduce the staker count
        self.uintVars[keccak256("stakerCount")] -= 1;
        TellorDispute.updateDisputeFee(self);

        emit StakeWithdrawRequested(msg.sender);
    }

    /**
    * @dev This function allows users to withdraw their stake after a 7 day waiting period from request 
    */
    function withdrawStake(TellorStorage.TellorStorageStruct storage self) public {
        TellorStorage.StakeInfo storage stakes = self.stakerDetails[msg.sender];
        //Require the staker has locked for withdraw(currentStatus ==2) and that 7 days have 
        //passed by since they locked for withdraw
        require(now - (now % 86400) - stakes.startDate >= 7 days);
        require(stakes.currentStatus == 2);
        stakes.currentStatus = 0;
        emit StakeWithdrawn(msg.sender);
    }

    /**
    * @dev This function allows miners to deposit their stake.
    */
    function depositStake(TellorStorage.TellorStorageStruct storage self) public {
      newStake(self, msg.sender);
      //self adjusting disputeFee
      TellorDispute.updateDisputeFee(self);
    }

    function newStake(TellorStorage.TellorStorageStruct storage self, address staker) public {
        require(TellorTransfer.balanceOf(self,staker) >= self.uintVars[keccak256("stakeAmount")]);

        //Ensure they can only stake if they are not currrently staked or if their stake time frame has ended
        //and they are currently locked for witdhraw
        require(self.stakerDetails[staker].currentStatus == 0 || self.stakerDetails[staker].currentStatus == 2);
        self.uintVars[keccak256("stakerCount")] += 1;
        self.stakerDetails[staker] = TellorStorage.StakeInfo({
            currentStatus: 1,
            //this resets their stake start date to today
            startDate: now - (now % 86400)
        });
        emit NewStake(staker);
    }
}
