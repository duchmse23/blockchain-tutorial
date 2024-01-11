// ...- tạo 1 bể thanh khoản có 100BNB, 20.000 USDT
// - áp dụng công thức của uniswap để cho người dùng mua bán.
// - buy: đổi usdt lấy bnb trong bể
// - sell: đổi bnb lấy usdt trong bể

// - advantage: mỗi giao dịch mua bán, gửi 0.15% giá trị tới "rewarder". (ví dụ mua 1BNB bằng 200USDT, thì lấy 0.0013BNB gửi tới ví "rewarder")
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "../D4/Token.sol";
import "hardhat/console.sol";

contract LiquidityPool {
    Token public bnb;
    Token public usdt;
    address public recipient;
    uint k;

    constructor(Token _bnb, Token _usdt, address _recipient) {
        bnb = _bnb;
        usdt = _usdt;
        recipient = _recipient;
    }

    function lock() public {
        k = x() * y();
    }

    function x() public view returns (uint) {
        return bnb.balanceOf(address(this));
    }

    function y() public view returns (uint) {
        return usdt.balanceOf(address(this));
    }

    function x_decimals() internal view returns (uint) {
        return 10 ** bnb.decimals();
    }

    function y_decimals() internal view returns (uint) {
        return 10 ** usdt.decimals();
    }

    function getCommission(uint _amount) internal pure returns (uint) {
        return (_amount * 3) / 2000;
    }

    function rate() internal view returns (uint) {
        return k / x();
    }

    function buy(uint _amount) public {
        // đổi usdt lấy bnb trong bể
        // cần phải approve trước
        uint usdtValue = (_amount * rate()) / x_decimals();
        console.log("rate %s", rate());
        // console.log("commission %s", commission);
        // console.log("price %s", price);
        console.log("amount %s", _amount);
        console.log("usdt %s", usdtValue);
        bnb.transferFrom(address(this), msg.sender, _amount);
        usdt.transferFrom(msg.sender, address(this), usdtValue);
        // bnb.transferFrom(address(this), recipient, commission);
    }

    function sell(uint _amount) public {
        // đổi bnb lấy usdt trong bể
        uint commission = getCommission(_amount);
        uint usdtValue = (_amount * rate()) / x_decimals();
        console.log("rate %s", rate());
        console.log("commission %s", commission);
        // console.log("price %s", price);
        console.log("amount %s", _amount);
        console.log("usdt %s", usdtValue);
        bnb.transferFrom(msg.sender, address(this), _amount);
        usdt.transferFrom(address(this), msg.sender, usdtValue);
        usdt.transferFrom(address(this), recipient, commission);
    }
}
