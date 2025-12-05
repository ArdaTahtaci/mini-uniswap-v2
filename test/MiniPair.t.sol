// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/forge-std/src/Test.sol";

import "../src/MiniPair.sol";
import "../src/TestToken.sol";

contract MiniPairTest is Test {
    TestToken token0;
    TestToken token1;
    MiniPair pair;
    address user;

    function setUp() public {
        // 1) İki ayrı test token üret
        token0 = new TestToken("Token0", "TK0");
        token1 = new TestToken("Token1", "TK1");

        // 2) Pair deploy et
        pair = new MiniPair(address(token0), address(token1));

        // 3) Test hesabımıza bol miktarda token mintle
        token0.mint(address(this), 1_000e18);
        token1.mint(address(this), 1_000e18);

        // 4) Havuzu seed et (ör: 100-100)
        token0.transfer(address(pair), 100e18);
        token1.transfer(address(pair), 100e18);

        pair.sync(); // reserve0 = 100, reserve1 = 100

        // 5) Kullanıcı adresini ayarla ve ona token mintle
        user = address(0xBEEF);
        token0.mint(user, 10e18);
    }

    // -------------------------------------------------------------
    //               BASIC TOKEN0 -> TOKEN1 SWAP TEST
    // -------------------------------------------------------------
    function testSwapToken0ForToken1() public {
        vm.startPrank(user);

        token0.transfer(address(pair), 1e18);

        (uint112 r0, uint112 r1) = pair.getReserves();

        uint expectedOut = _getAmountOut(1e18, r0, r1);

        pair.swap(0, expectedOut, user);

        vm.stopPrank();

        assertEq(
            token1.balanceOf(user),
            expectedOut,
            "User should receive correct amount"
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
