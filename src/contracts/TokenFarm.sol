// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm is Ownable, Pausable {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    mapping(address => uint) public dappTokenBalance;
    uint public interestRate;
    uint public lastUpdateTime; // last block updated time  
    uint constant secondsPerYear = 31556952;

    constructor (DappToken _dappToken, DaiToken _daiToken) {
        dappToken = _dappToken;
        daiToken = _daiToken;
        lastUpdateTime = block.timestamp;
    }

    function stakeTokens(uint _amount) public whenNotPaused {

        require (_amount > 0, "Tokens should be more than 0");
        daiToken.transferFrom(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] += _amount; 

        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        } 

        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    function unstake() public {
        uint balance = stakingBalance[msg.sender];  
        require(balance > 0, "withdraw amount has to greater than zero");
        daiToken.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }

    function issueTokens() public {
        if(getTimeGapSinceLastBlock() == 0) {
            return;
        }
        lastUpdateTime = block.timestamp; // update timestamp
        //https://solidity-by-example.org/defi/staking-rewards/
        for(uint i = 0; i  < stakers.length; i++) {
            address receipient = stakers[i];
            uint balance = stakingBalance[receipient];  

            if (balance > 0) {
                dappTokenBalance[msg.sender] += rewardPerAmount(balance);
            }
        }
    }

    function getTimeGapSinceLastBlock() public view returns (uint) {
        return (lastUpdateTime - block.timestamp);
    } 

    function rewardPerAmount(uint _amount) public view returns (uint) {
        if(_amount == 0) {
            return 0;
        }
        return _amount * (interestRate / 100) * (getTimeGapSinceLastBlock() / secondsPerYear);
    }

    function claimRewards() public {
        uint balance = dappTokenBalance[msg.sender];  
        require(balance > 0 && dappTokenBalance[msg.sender] >= balance, "claim amount has to greater than zero ");
        dappToken.transfer(msg.sender, balance);

        dappTokenBalance[msg.sender] -= balance;
    }

    function setInterest(uint _interestRate) public onlyOwner {
        interestRate = _interestRate;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
