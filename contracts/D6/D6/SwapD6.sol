// - Advance2: hỗ trợ depositLiquidity/withdrawLiquidity. Hệ số k có thể thay đổi, bằng cách tăng/giảm cặp bnb/usdt mà ko làm thay đổi tỷ lệ của chúng trong bể.
// - Advance3: erc20 hóa việc sở hữu liquidity pool token (LP token)
//   - Ví dụ: khi khởi tạo cặp BNB/USDT với 10BNB/20000USDT => mint 10 LP token cho sender (= với lượng BNB)
//   - Xử lý deposit/withdraw liquidity -> mint/burn LP token
// - Advance4:
//   - 0.13% không gửi cho "rewarder" nữa, mà chia cho người đang sử hữu LP token dựa vào tỷ lệ sở hữu
//   - Ví dụ: bán 1 BNB để lấy 200$ => trích 0.26$ chia cho những người đang sở hữu LP.
//   - cái này thiên thuật toán :v

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "../../D4/Token.sol";

contract SwapD6 is ERC20 {
    // uint256 private _totalSupply;
    // uint8 private _decimals;
    Token public token0;
    Token public token1;
    uint public k;
    uint public amount0;
    uint public amount1;

    constructor(Token _token0, Token _token1) ERC20("", "") {
        token0 = _token0;
        token1 = _token1;
    }

    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    function init(uint _amount0, uint _amount1) public {
        require(k == 0, "Can not init again");
        k = _amount0 * _amount1;
        require(k > 0, "Invalid constant amount");
        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), _amount1);
        uint mintAmount = _amount0 * 10 ** (decimals() - token0.decimals());
        _mint(msg.sender, mintAmount);
        amount0 = _amount0;
        amount1 = _amount1;
    }

    function buy(uint _amount0) public {
        require(k > 0, "Bro i'm broke");
        uint remaining = amount0 - _amount0;
        uint rate = k / remaining;
        uint cost = rate - amount1;
        token1.transferFrom(msg.sender, address(this), cost);
        token0.transfer(msg.sender, _amount0);
        amount0 = remaining;
        amount1 = rate;
    }

    function deposit(uint _amount0) public {
        uint newAmount0 = amount0 + _amount0;
        uint newAmount1 = (amount1 * newAmount0) / amount0;
        k = newAmount0 * newAmount1;
        token0.transferFrom(msg.sender, address(this), _amount0);
        token1.transferFrom(msg.sender, address(this), newAmount1 - amount1);
        amount0 = newAmount0;
        amount1 = newAmount1;
    }
}
