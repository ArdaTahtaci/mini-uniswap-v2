// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/MiniFactory.sol";
import "../src/MiniRouter.sol";
import "../src/MiniPair.sol";
import "../src/TestToken.sol";

import "../lib/forge-std/src/Test.sol";

contract MiniRouterTest is Test {
    MiniFactory factory;
    MiniRouter router;
    MiniPair pair;

    TestToken token0;
    TestToken token1;

    address user = address(0xBEEF);

    function setUp() public {
        token0 = new TestToken("Token0", "TK0");
        token1 = new TestToken("Token1", "TK1");

        factory = new MiniFactory();
        router = new MiniRouter(address(factory));

        // create pair via factory
        address pairAddr = factory.createPair(address(token0), address(token1));
        pair = MiniPair(pairAddr);

        // mint tokens for user
        token0.mint(user, 1000e18);
        token1.mint(user, 1000e18);

        // user approvals
        vm.startPrank(user);
        token0.approve(address(router), type(uint256).max);
        token1.approve(address(router), type(uint256).max);
        IERC20(address(pair)).approve(address(router), type(uint256).max);
        vm.stopPrank();
    }

    // ────────────────────────────────────────────────
    //               ADD LIQUIDITY TEST
    // ────────────────────────────────────────────────

    function testAddLiquidity() public {
        vm.startPrank(user);

        uint amount0 = 100e18;
        uint amount1 = 100e18;

        uint liquidity = router.addLiquidity(
            address(token0),
            address(token1),
            amount0,
            amount1,
            user
        );

        vm.stopPrank();

        assertGt(liquidity, 0, "LP mint failed");

        (uint112 r0, uint112 r1) = pair.getReserves();
        assertEq(r0, amount0, "Incorrect reserve0");
        assertEq(r1, amount1, "Incorrect reserve1");
    }

    // ────────────────────────────────────────────────
    //              REMOVE LIQUIDITY TEST
    // ────────────────────────────────────────────────

    function testRemoveLiquidity() public {
        // first add
        vm.startPrank(user);
        uint liquidity = router.addLiquidity(
            address(token0),
            address(token1),
            100e18,
            100e18,
            user
        );
        vm.stopPrank();

        // Now remove
        vm.startPrank(user);
        (uint amount0, uint amount1) = router.removeLiquidity(
            address(token0),
            address(token1),
            liquidity,
            user
        );
        vm.stopPrank();

        assertEq(amount0, 100e18);
        assertEq(amount1, 100e18);

        (uint112 r0, uint112 r1) = pair.getReserves();
        assertEq(r0, 0);
        assertEq(r1, 0);
    }

    // ────────────────────────────────────────────────
    //              SWAP token0 → token1
    // ────────────────────────────────────────────────

    function testSwapToken0ForToken1() public {
        // add liquidity first
        vm.startPrank(user);
        router.addLiquidity(
            address(token0),
            address(token1),
            100e18,
            100e18,
            user
        );
        vm.stopPrank();

        address t0 = pair.token0();
        address t1 = pair.token1();

        vm.startPrank(user);

        uint before = IERC20(t1).balanceOf(user);

        uint amountIn = 10e18;

        (uint112 r0, uint112 r1) = pair.getReserves();
        uint expectedOut = router.getAmountOut(amountIn, r0, r1);

        router.swapExactTokensForTokens(
            amountIn,
            0, // no slippage check
            t0,
            t1,
            user
        );

        uint afterBal = IERC20(t1).balanceOf(user);
        vm.stopPrank();

        assertEq(afterBal - before, expectedOut, "Incorrect swap output");
    }

    // ────────────────────────────────────────────────
    //              SWAP token1 → token0
    // ────────────────────────────────────────────────

    function testSwapToken1ForToken0() public {
        // add liquidity first
        vm.startPrank(user);
        router.addLiquidity(
            address(token0),
            address(token1),
            100e18,
            100e18,
            user
        );
        vm.stopPrank();

        address t0 = pair.token0();
        address t1 = pair.token1();

        vm.startPrank(user);

        uint before = IERC20(t0).balanceOf(user);

        uint amountIn = 10e18;

        (uint112 r0, uint112 r1) = pair.getReserves();
        uint expectedOut = router.getAmountOut(amountIn, r1, r0);

        router.swapExactTokensForTokens(amountIn, 0, t1, t0, user);

        uint afterBal = IERC20(t0).balanceOf(user);
        vm.stopPrank();

        assertEq(afterBal - before, expectedOut, "Incorrect swap output");
    }

    // ────────────────────────────────────────────────
    //           NON-EXISTENT PAIR REVERT TEST
    // ────────────────────────────────────────────────

    function testRevertWhenPairDoesNotExist() public {
        TestToken fakeToken = new TestToken("Fake", "FAKE");

        vm.startPrank(user);
        vm.expectRevert("PAIR_NOT_EXISTS");

        router.swapExactTokensForTokens(
            1e18,
            0,
            address(fakeToken),
            address(token0),
            user
        );
        vm.stopPrank();
    }
}
