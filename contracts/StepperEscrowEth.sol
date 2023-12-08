// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// từ _startTime, băm số tiền thành _steps lần và giải ngân theo từng tuần
// ví dụ sau 3 tuần từ _startTime, borrower call release => giải ngân tổng 3 phần tiền
// ... 10 tuần => giải ngân tổng 10 phần tiền

import "hardhat/console.sol";

contract StepperEscrowEth {
    struct ReleaseTransaction {
        uint when;
        uint amount;
    }

    address public lender;
    address public borrower;
    uint public amount;
    uint public amountEachStep;
    uint public unlockTime;
    uint public startTime;
    uint public steps;
    mapping(uint => ReleaseTransaction) releaseHistory;

    function getStepsBetween(
        uint _start,
        uint _end
    ) private pure returns (uint) {
        require(_end > _start, "Invalid range to get steps");
        uint result = (_end + 1 - _start) / 1 weeks;
        console.log("result %s %s %s", result, _start, _end);
        return result;
    }

    function fund(address _borrower, uint _unlockTime) public payable {
        lender = msg.sender;
        borrower = _borrower;
        amount = msg.value;
        startTime = block.timestamp;
        unlockTime = _unlockTime;
        steps = getStepsBetween(startTime, _unlockTime);
        amountEachStep = amount / steps;
    }

    function release() public {
        uint currentStep = getStepsBetween(startTime, block.timestamp);
        console.log("amount %s", amount);
        if (amount == 0) {
            revert("Poor");
        }
        if (currentStep > steps) {
            revert("Late");
        }
        uint ogAmount = steps * amountEachStep;
        console.log("ogAmount %s %s %s", ogAmount, steps, amountEachStep);
        if (amount <= ogAmount) {
            uint stepsElapsed = (ogAmount - amount) / amountEachStep;
            uint releasableSteps = currentStep - stepsElapsed;
            console.log("releasableSteps %s", releasableSteps);
            uint releasableAmount = releasableSteps * amountEachStep;
            payable(borrower).transfer(releasableAmount);
            amount -= releasableAmount;
        }
    }
}
