// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {
    IERC20
} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {
    ERC20
} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

/// @notice Mini Uniswap V2-style pair:
///         - Constant product AMM (x * y = k)
///         - 0.3% fee
///         - LP token as ERC20 (this contract)
///         - mint/burn for add/remove liquidity
contract MiniPair is ERC20 {
    address public immutable token0;
    address public immutable token1;

    uint112 private reserve0;
    uint112 private reserve1;

    uint32 private blockTimestampLast; // ileride TWAP istersen kullanırsın

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

    constructor(
        address _token0,
        address _token1
    ) ERC20("Mini LP Token", "MLP") {
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
        // blockTimestampLast = uint32(block.timestamp);
        emit Sync(reserve0, reserve1);
    }

    /// @notice Manually sync reserves with current balances.
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

        // 4) Apply 0.3% fee (997 / 1000)
        uint balance0Adjusted = balance0 * 1000 - amount0In * 3;
        uint balance1Adjusted = balance1 * 1000 - amount1In * 3;

        require(
            balance0Adjusted * balance1Adjusted >=
                uint(_reserve0) * uint(_reserve1) * (1000 ** 2),
            "K"
        );

        _update(balance0, balance1);

        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    /// @notice Mint LP tokens to `to` based on current deposited amounts.
    function mint(address to) external nonReentrant returns (uint liquidity) {
        (uint112 _reserve0, uint112 _reserve1) = getReserves();

        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));

        uint amount0 = balance0 - _reserve0;
        uint amount1 = balance1 - _reserve1;

        uint _totalSupply = totalSupply();

        if (_totalSupply == 0) {
            // initial liquidity: geometric mean
            liquidity = sqrt(amount0 * amount1);
            require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_MINTED");
            _mint(to, liquidity);
        } else {
            uint liquidity0 = (amount0 * _totalSupply) / _reserve0;
            uint liquidity1 = (amount1 * _totalSupply) / _reserve1;
            liquidity = liquidity0 < liquidity1 ? liquidity0 : liquidity1;
            require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_MINTED");
            _mint(to, liquidity);
        }

        _update(balance0, balance1);
    }

    /// @notice Burn LP tokens from the pair and return underlying tokens to `to`.

    function burn(
        address to
    ) external nonReentrant returns (uint amount0, uint amount1) {
        uint balance0 = IERC20(token0).balanceOf(address(this));
        uint balance1 = IERC20(token1).balanceOf(address(this));

        uint liquidity = balanceOf(address(this)); // LP tokens sent to pair
        uint _totalSupply = totalSupply();

        amount0 = (liquidity * balance0) / _totalSupply;
        amount1 = (liquidity * balance1) / _totalSupply;

        require(amount0 > 0 && amount1 > 0, "INSUFFICIENT_LIQUIDITY_BURNED");

        _burn(address(this), liquidity);

        _safeTransfer(token0, to, amount0);
        _safeTransfer(token1, to, amount1);

        balance0 = IERC20(token0).balanceOf(address(this));
        balance1 = IERC20(token1).balanceOf(address(this));

        _update(balance0, balance1);
    }

    /// @notice Babylonian method to compute square roots.
    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
