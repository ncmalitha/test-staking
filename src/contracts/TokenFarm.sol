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


    constructor (DappToken _dappToken, DaiToken _daiToken) {
        dappToken = _dappToken;
        daiToken = _daiToken;
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

    function issueTokens() public onlyOwner {
        for(uint i = 0; i  < stakers.length; i++) {
            address receipient = stakers[i];
            uint balance = stakingBalance[receipient];  

            if (balance > 0) {
                dappToken.transfer(receipient, balance);
            }

        }
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function withdrawAmount(uint _amount) public {
        uint balance = stakingBalance[msg.sender];  
        require(balance >= _amount, "withdraw amount has to greater than or equal to staked balance");
        daiToken.transfer(msg.sender, _amount);

        stakingBalance[msg.sender] -= _amount;
        if(stakingBalance[msg.sender] == 0) {
            isStaking[msg.sender] = false;
        }
    }

}
