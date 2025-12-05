// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MiniFactory.sol";
import "./MiniPair.sol";
import {
    IERC20
} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

/// @notice Minimal Uniswap V2-style router.
///         - Factory üzerinden dinamik pair discovery
///         - add/remove liquidity
///         - swapExactTokensForTokens (single hop)
contract MiniRouter {
    MiniFactory public immutable factory;

    constructor(address _factory) {
        require(_factory != address(0), "ZERO_FACTORY");
        factory = MiniFactory(_factory);
    }

    // ─────────────────────────────────────────
    //              LIQUIDITY
    // ─────────────────────────────────────────

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountA,
        uint amountB,
        address to
    ) external returns (uint liquidity) {
        require(amountA > 0 && amountB > 0, "INVALID_AMOUNTS");
        require(tokenA != tokenB, "IDENTICAL_TOKENS");

        address pairAddr = factory.getPair(tokenA, tokenB);
        require(pairAddr != address(0), "PAIR_NOT_EXISTS");

        IERC20(tokenA).transferFrom(msg.sender, pairAddr, amountA);
        IERC20(tokenB).transferFrom(msg.sender, pairAddr, amountB);

        liquidity = MiniPair(pairAddr).mint(to);
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        address to
    ) external returns (uint amountA, uint amountB) {
        require(liquidity > 0, "INVALID_LIQUIDITY");

        address pairAddr = factory.getPair(tokenA, tokenB);
        require(pairAddr != address(0), "PAIR_NOT_EXISTS");

        MiniPair pair = MiniPair(pairAddr);

        IERC20(pairAddr).transferFrom(msg.sender, pairAddr, liquidity);

        (uint amount0, uint amount1) = pair.burn(to);

        address token0 = pair.token0();
        if (tokenA == token0) {
            amountA = amount0;
            amountB = amount1;
        } else {
            amountA = amount1;
            amountB = amount0;
        }
    }

    // ─────────────────────────────────────────
    //                SWAP
    // ─────────────────────────────────────────

    function swapExactTokensForTokens(
        uint amountIn,
        uint minAmountOut,
        address tokenIn,
        address tokenOut,
        address to
    ) external returns (uint amountOut) {
        require(amountIn > 0, "INVALID_AMOUNT_IN");
        require(tokenIn != tokenOut, "IDENTICAL_TOKENS");

        address pairAddr = factory.getPair(tokenIn, tokenOut);
        require(pairAddr != address(0), "PAIR_NOT_EXISTS");

        MiniPair pair = MiniPair(pairAddr);

        IERC20(tokenIn).transferFrom(msg.sender, pairAddr, amountIn);

        (uint112 r0, uint112 r1) = pair.getReserves();
        address token0 = pair.token0();
        address token1 = pair.token1();

        if (tokenIn == token0 && tokenOut == token1) {
            amountOut = getAmountOut(amountIn, r0, r1);
            require(amountOut >= minAmountOut, "SLIPPAGE_EXCEEDED");
            pair.swap(0, amountOut, to);
        } else if (tokenIn == token1 && tokenOut == token0) {
            amountOut = getAmountOut(amountIn, r1, r0);
            require(amountOut >= minAmountOut, "SLIPPAGE_EXCEEDED");
            pair.swap(amountOut, 0, to);
        } else {
            revert("INVALID_PATH");
        }
    }

    /// @notice Calculate price impact in basis points (bps) for a given swap
    function getPriceImpact(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) public pure returns (uint priceImpactBps) {
        uint oldPrice = (reserveOut * 1e18) / reserveIn;

        // expected out from AMM formula
        uint amountOut = getAmountOut(amountIn, reserveIn, reserveOut);

        uint newReserveIn = reserveIn + amountIn;
        uint newReserveOut = reserveOut - amountOut;

        uint newPrice = (newReserveOut * 1e18) / newReserveIn;

        priceImpactBps = ((oldPrice - newPrice) * 10_000) / oldPrice;
    }

    // ─────────────────────────────────────────
    //           PRICING HELPER
    // ─────────────────────────────────────────

    /// @notice Uniswap V2 getAmountOut formula
    function getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) public pure returns (uint amountOut) {
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");

        uint amountInWithFee = amountIn * 997;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = reserveIn * 1000 + amountInWithFee;
        amountOut = numerator / denominator;
    }
}
