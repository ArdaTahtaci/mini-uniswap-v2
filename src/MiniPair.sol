// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {
    IERC20
} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

/// @notice Mini Uniswap V2-style pair, swap-only, no LP tokens, no mint/burn.
contract MiniPair {
    address public immutable token0;
    address public immutable token1;

    uint112 private reserve0; // uses single storage slot with reserve1 in real Uni;
    uint112 private reserve1;

    uint32 private blockTimestampLast;

    bool private locked;

    event Swap(
        address indexed sender,
        uint amount0In,
        uint amount1In,
        uint amount0Out,
        uint amount1Out,
        address indexed to
    );

    event Sync(uint112 reserve0, uint112 reserve1);

    constructor(address _token0, address _token1) {
        require(_token0 != _token1, "IDENTICAL_ADDRESSES");
        require(_token0 != address(0) && _token1 != address(0), "ZERO_ADDRESS");

        token0 = _token0;
        token1 = _token1;
    }

    modifier nonReentrant() {
        require(!locked, "LOCKED");
        locked = true;
        _;
        locked = false;
    }

    function getReserves()
        public
        view
        returns (uint112 _reserve0, uint112 _reserve1)
    {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

    /// @notice Internal helper to transfer tokens safely.
    function _safeTransfer(address token, address to, uint amount) private {
        bool success = IERC20(token).transfer(to, amount);
        require(success, "TRANSFER_FAILED");
    }

    /// @notice Update stored reserves to match actual balances.
    function _update(uint balance0, uint balance1) private {
        require(
            balance0 <= type(uint112).max && balance1 <= type(uint112).max,
            "OVERFLOW"
        );
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        // blockTimestampLast = uint32(block.timestamp); // ileride TWAP vb. istersen burayı kullanabilirsin
        emit Sync(reserve0, reserve1);
    }

    /// @notice One-time helper to seed initial liquidity (only for this mini project). No LP mint/burn
    function sync() external {
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));
        _update(balance0, balance1);
    }

    /// @notice Core swap function, Uniswap V2-style.
    function swap(
        uint amount0Out,
        uint amount1Out,
        address to
    ) external nonReentrant {
        require(amount0Out > 0 || amount1Out > 0, "INSUFFICIENT_OUTPUT_AMOUNT");

        (uint112 _reserve0, uint112 _reserve1) = getReserves();
        require(
            amount0Out < _reserve0 && amount1Out < _reserve1,
            "INSUFFICIENT_LIQUIDITY"
        );

        require(to != token0 && to != token1, "INVALID_TO");

        address _token0 = token0;
        address _token1 = token1;

        // 1) Send out
        if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out);
        if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out);

        // 2) Get new balances
        uint balance0 = IERC20(_token0).balanceOf(address(this));
        uint balance1 = IERC20(_token1).balanceOf(address(this));

        // 3) calculate real input amounts
        uint amount0In = 0;
        if (balance0 > _reserve0 - amount0Out) {
            amount0In = balance0 - (_reserve0 - amount0Out);
        }

        uint amount1In = 0;
        if (balance1 > _reserve1 - amount1Out) {
            amount1In = balance1 - (_reserve1 - amount1Out);
        }

        require(amount0In > 0 || amount1In > 0, "INSUFFICIENT_INPUT_AMOUNT");

        // 4) Apply 0.3% fee
        // Uniswap V2:
        // fee = 0.3% -> 1000 - 3 = 997
        // balance0Adjusted = balance0 * 1000 - amount0In * 3
        // balance1Adjusted = balance1 * 1000 - amount1In * 3
        // require(balance0Adjusted * balance1Adjusted >= reserve0 * reserve1 * 1000^2)

        uint balance0Adjusted = balance0 * 1000 - amount0In * 3;
        uint balance1Adjusted = balance1 * 1000 - amount1In * 3;

        require(
            balance0Adjusted * balance1Adjusted >=
                uint(_reserve0) * uint(_reserve1) * (1000 ** 2),
            "K"
        );

        // 5) reserve'leri güncelle
        _update(balance0, balance1);

        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }
}
