pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address owner;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;


    constructor (DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    function stakeTokens(uint _amount) public {

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
        require(msg.sender== owner, "caller must be owner");
        for(uint i = 0; i  < stakers.length; i++) {
            address receipient = stakers[i];
            uint balance = stakingBalance[receipient];  

            if (balance > 0) {
                dappToken.transfer(receipient, balance);
            }

        }
    }
}
