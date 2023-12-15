// Bài tập buổi 4: tạo contract mua BNB bằng USDT
// USDT
// BNB // eth hoặc erc20
// 1 BNB = 200 USDT

// 1. Gửi BNB vào contract. bnb.transfer(contract.address, 1000)
// 2. Tạo hàm swap(bnbAmount) để swap BNB sang USDT
//  - usdtValue = bnbAmount * 200
//  - chuyển usdtValue của người dùng vào contract
//  - chuyển bnbAmount từ contract tới ví người dùng.

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Token.sol";
import "hardhat/console.sol";

contract Swap {
    uint _rate;
    Token baseToken;
    Token exchangeToken;

    constructor(Token _bnb, Token _usdt) {
        baseToken = _bnb;
        exchangeToken = _usdt;
        _rate = 200 * 10 ** exchangeToken.decimals();
    }

    function exchangableAmount(uint _bnbAmount) public view returns (uint) {
        return _bnbAmount * _rate;
    }

    function swap(uint _bnbAmount) public returns (bool) {
        // require(
        //     baseToken.balanceOf(address(this)) > _bnbAmount,
        //     "Not enough to swap"
        // );
        // require(
        //     exchangeToken.allowance(msg.sender, address(this)) > 0,
        //     "NO NO NO"
        // );
        uint exchangeValue = (_bnbAmount * _rate) /
            (10 ** baseToken.decimals());
        // console.log("usdt value: %s", exchangeValue);

        // bool baseApproved = baseToken.approve(msg.sender, _bnbAmount);
        // if (baseApproved == false) {
        //     return false;
        // }

        console.log("exchangeValue=", exchangeValue);

        exchangeToken.transferFrom(msg.sender, address(this), exchangeValue);
        baseToken.transfer(msg.sender, _bnbAmount);
        return true;
    }
}
