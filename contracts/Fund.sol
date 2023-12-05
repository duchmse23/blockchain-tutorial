// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./IERC20.sol";
import "hardhat/console.sol";

contract Fund is IERC20 {
    uint public unlockTime;
    address public owner;
    mapping(address => bool) public authorizedWithdrawers;
    uint public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;
    event Withdrawal(uint amount, uint when);

    constructor() {
        owner = msg.sender;
    }

    function transfer(address recipient, uint amount) public returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) public returns (bool) {
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function mint(uint amount) public {
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function deposit(uint amount, uint _unlockTime) external returns (bool) {
        require(msg.sender == owner, "You aren't the owner");
        // require(msg.value == _amount, "Invalid amount");
        // console.log("Address token %s", address(this));
        transfer(address(this), amount);
        unlockTime = _unlockTime;
        return true;
    }

    function withdraw() external {
        require(address(this).balance > 0, "Insufficient fund");
        address payable withdrawer;
        if (msg.sender == owner) {
            require(block.timestamp < unlockTime, "You can't withdraw yet");
        } else if (msg.sender != owner) {
            require(
                isAuthorizedWithdrawer(msg.sender),
                "Unauthorized withdrawal"
            );
            require(block.timestamp >= unlockTime, "You can't withdraw yet");
        }
        withdrawer = payable(msg.sender);
        emit Withdrawal(address(this).balance, block.timestamp);
        withdrawer.transfer(address(this).balance);
    }

    function isAuthorizedWithdrawer(
        address _address
    ) public view returns (bool) {
        return authorizedWithdrawers[_address];
    }

    function addAuthorizedWithdrawer(address _address) external {
        authorizedWithdrawers[_address] = true;
    }

    function removeAuthroizedWithdrawer(address _address) external {
        authorizedWithdrawers[_address] = false;
    }
}
