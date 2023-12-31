// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// từ _startTime, băm số tiền thành _steps lần và giải ngân theo từng tuần
// ví dụ sau 3 tuần từ _startTime, borrower call release => giải ngân tổng 3 phần tiền
// ... 10 tuần => giải ngân tổng 10 phần tiền

import "hardhat/console.sol";

contract StepperEscrowEth {
    address public lender;
    address public borrower;
    uint public amount;
    uint public totalReleased;
    uint public unlockTime;
    uint public startTime;
    uint public steps;

    function getStepsBetween(
        uint _start,
        uint _end
    ) private pure returns (uint) {
        require(_end > _start, "Invalid range to get steps");
        uint result = (_end + 1 - _start) / 1 weeks;
        return result;
    }

    function fund(address _borrower, uint _unlockTime) public payable {
        lender = msg.sender;
        borrower = _borrower;
        amount = msg.value;
        startTime = block.timestamp;
        unlockTime = _unlockTime;
        steps = getStepsBetween(startTime, _unlockTime);
    }

    function release() public {
        uint currentStep = getStepsBetween(startTime, block.timestamp);
        if (currentStep > steps) {
            revert("Late");
        }
        console.log("ogAmount %s %s %s", amount, steps, totalReleased);
        if (totalReleased < amount) {
            uint releasePerStep = amount / steps;
            uint stepsElapsed = totalReleased / releasePerStep;
            uint releasableSteps = currentStep - stepsElapsed;
            uint remainingAmount = amount - totalReleased;
            uint expectableAmount = releasableSteps * releasePerStep;
            uint releasableAmount = expectableAmount > remainingAmount
                ? remainingAmount
                : expectableAmount;
            totalReleased += releasableAmount;
            payable(borrower).transfer(releasableAmount);
        }
    }
}
