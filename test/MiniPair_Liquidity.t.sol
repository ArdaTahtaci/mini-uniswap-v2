// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MiniPair.sol";
import "../src/TestToken.sol";

contract MiniPairLiquidityTest is Test {
    TestToken token0;
    TestToken token1;
    MiniPair pair;

    address user;

    function setUp() public {
        token0 = new TestToken("Token0", "TK0");
        token1 = new TestToken("Token1", "TK1");

        pair = new MiniPair(address(token0), address(token1));

        user = address(0xBEEF);

        token0.mint(user, 1_000e18);
        token1.mint(user, 1_000e18);
    }

    function testInitialMint() public {
        vm.startPrank(user);

        // first LP: deposit 100 token0 and 100 token1
        token0.transfer(address(pair), 100e18);
        token1.transfer(address(pair), 100e18);

        uint liquidity = pair.mint(user);

        // expected: sqrt(100 * 100) = 100
        assertEq(liquidity, 100e18, "Initial liquidity incorrect");

        // LP token balance
        assertEq(pair.balanceOf(user), liquidity);

        // reserves should match
        (uint112 r0, uint112 r1) = pair.getReserves();
        assertEq(r0, 100e18);
        assertEq(r1, 100e18);

        vm.stopPrank();
    }

    function testSecondMint() public {
        vm.startPrank(user);

        // first LP: 100/100
        token0.transfer(address(pair), 100e18);
        token1.transfer(address(pair), 100e18);
        pair.mint(user);

        uint initialSupply = pair.totalSupply();
        assertEq(initialSupply, 100e18);

        // second LP: deposit 50/50
        token0.transfer(address(pair), 50e18);
        token1.transfer(address(pair), 50e18);

        uint liquidity = pair.mint(user);

        // proportional: should mint (50 * 100) / 100 = 50
        assertEq(liquidity, 50e18, "Second liquidity mint incorrect");

        assertEq(pair.totalSupply(), 150e18);

        vm.stopPrank();
    }

    function testBurnLiquidity() public {
        vm.startPrank(user);

        // add 100/100 liquidity
        token0.transfer(address(pair), 100e18);
        token1.transfer(address(pair), 100e18);
        pair.mint(user);

        uint lp = pair.balanceOf(user);

        // user sends LP back to pair
        pair.transfer(address(pair), lp);

        // burn
        (uint amount0, uint amount1) = pair.burn(user);

        assertEq(amount0, 100e18);
        assertEq(amount1, 100e18);

        vm.stopPrank();
    }

    function testLPValueIncreasesAfterSwap() public {
        address lpProvider = address(0xAAA);
        address trader = address(0xBBB);

        token0.mint(lpProvider, 1_000e18);
        token1.mint(lpProvider, 1_000e18);
        token0.mint(trader, 1_000e18);

        // LP ADD: 100 / 100
        vm.startPrank(lpProvider);
        token0.transfer(address(pair), 100e18);
        token1.transfer(address(pair), 100e18);
        pair.mint(lpProvider);
        uint lp = pair.balanceOf(lpProvider);
        vm.stopPrank();

        // K eski
        (uint112 r0Before, uint112 r1Before) = pair.getReserves();
        uint oldK = uint(r0Before) * uint(r1Before); // 100 * 100

        // TRADER SWAP: 10 token0 input
        vm.startPrank(trader);
        token0.transfer(address(pair), 10e18);

        // Çıkışı formülle hesaplayalım (zorlama 9e18 yerine)
        uint expectedOut = _getAmountOut(10e18, r0Before, r1Before);
        pair.swap(0, expectedOut, trader);
        vm.stopPrank();

        // K yeni
        (uint112 r0After, uint112 r1After) = pair.getReserves();
        uint newK = uint(r0After) * uint(r1After);

        assertGt(newK, oldK, "k should increase due to fee");

        // LP tüm payını burn ediyor
        vm.startPrank(lpProvider);
        pair.transfer(address(pair), lp);
        (uint amount0, uint amount1) = pair.burn(lpProvider);
        vm.stopPrank();

        // LP'nin çektiği product, ilk product'tan daha büyük olmalı
        uint finalProduct = amount0 * amount1;
        assertGt(
            finalProduct,
            oldK,
            "LP product of amounts should increase after fee accumulation"
        );
    }

    function _getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) internal pure returns (uint) {
        uint amountInWithFee = amountIn * 997;
        uint numerator = amountInWithFee * reserveOut;
        uint denominator = reserveIn * 1000 + amountInWithFee;
        return numerator / denominator;
    }
}
