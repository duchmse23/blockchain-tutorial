// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract SimpleEscrowEth {
    address public lender;
    address public borrower;
    uint public amount;
    uint public unlockTime;
    bool public released;

    function fund(address _borrower, uint _unlockTime) public payable {
        require(lender == address(0), "Forbidden switching lender");
        lender = msg.sender;
        borrower = _borrower;
        amount = msg.value;
        unlockTime = _unlockTime;
        released = false;
    }

    function release() public {
        require(block.timestamp > unlockTime, "Can not be released yet");
        if (!released) {
            payable(borrower).transfer(amount);
            released = true;
        }
    }
}
