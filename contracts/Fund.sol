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

    constructor(uint _unlockTime) {
        owner = msg.sender;
        unlockTime = _unlockTime;
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

    function deposit(uint amount) external returns (bool) {
        require(msg.sender == owner, "You aren't the owner");
        // require(msg.value == _amount, "Invalid amount");
        // console.log("Address token %s", address(this));
        transfer(address(this), amount);
        // unlockTime = _unlockTime;
        return true;
    }

    function withdraw(uint amount) external payable returns (bool) {
        console.log("Balance %s", balanceOf[address(this)]);
        require(balanceOf[address(this)] > 0, "Insufficient fund");
        // address payable withdrawer;
        // if (msg.sender == owner) {
        console.log("enter %s, %s", block.timestamp, unlockTime);
        if (block.timestamp < unlockTime) {
            revert("You can't withdraw yet");
        }
        // require(block.timestamp < unlockTime, "You can't withdraw yet");
        console.log("enter 2");
        // } else if (msg.sender != owner) {
        //     require(
        //         isAuthorizedWithdrawer(msg.sender),
        //         "Unauthorized withdrawal"
        //     );
        //     require(block.timestamp > unlockTime, "You can't withdraw yet");
        // }
        // withdrawer = payable(msg.sender);
        console.log(
            "amount %s, sender is owner %s",
            amount,
            msg.sender == owner
        );

        console.log("before %s", balanceOf[address(this)]);
        address payable sender = payable(msg.sender);
        sender.transfer(amount);
        balanceOf[msg.sender] += amount;
        balanceOf[address(this)] -= amount;
        console.log("After %s", balanceOf[address(this)]);
        // approve()
        // transferFrom(address(this), msg.sender, amount);
        emit Transfer(address(this), msg.sender, amount);
        // emit Withdrawal(address(this).balance, block.timestamp);
        // withdrawer.transfer(address(this).balance);
        return true;
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
