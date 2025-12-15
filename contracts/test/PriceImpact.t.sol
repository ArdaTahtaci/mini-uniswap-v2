// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../src/MiniFactory.sol";
import "../src/MiniRouter.sol";
import "../src/MiniPair.sol";
import "../src/TestToken.sol";

import "../lib/forge-std/src/Test.sol";

contract MiniRouterPriceImpactTest is Test {
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

        address pairAddr = factory.createPair(address(token0), address(token1));
        pair = MiniPair(pairAddr);

        // Seed liquidity (100/100)
        token0.mint(address(this), 200e18);
        token1.mint(address(this), 200e18);

        token0.transfer(pairAddr, 100e18);
        token1.transfer(pairAddr, 100e18);

        pair.sync();
    }

    function testPriceImpactComputation() public {
        uint amountIn = 10e18;

        (uint112 r0, uint112 r1) = pair.getReserves();

        uint priceImpact = router.getPriceImpact(amountIn, r0, r1);

        // Price impact MUST be > 0 for any nonzero swap
        assertGt(priceImpact, 0, "Price impact should be positive");

        // Price impact SHOULD NOT be crazy high for 10% pool swap in symmetric pool
        // Rough theoretical upper bound example: < 15000 bps (<150%)
        // (Sadece performans sanity check, exact değer değil)
        assertLt(priceImpact, 15000, "Price impact unreasonably large");
    }
}
