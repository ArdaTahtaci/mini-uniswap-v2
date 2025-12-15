// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "forge-std/Script.sol";

import "../src/TestToken.sol";
import "../src/MiniFactory.sol";
import "../src/MiniRouter.sol";

contract AddNewPool is Script {
    function run() external {
        uint256 deployer = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployer);

        TestToken usdc = new TestToken("USD Coin", "USDC");
        usdc.mint(msg.sender, 1_000_000 * 1e18);

        // EXISTING DEPLOYED CONTRACTS
        address factoryAddr = 0xA889aFEE0058bFC92C35fF81d43BBcDFE294e759;
        address routerAddr = 0x112ab1B4c4ab3aC18cE633995dbd8e1fE98106cB;

        MiniFactory factory = MiniFactory(factoryAddr);
        MiniRouter router = MiniRouter(routerAddr);

        usdc.approve(address(router), type(uint256).max);

        address pair_weth_usdc = factory.createPair(
            address(0x14Cb556f6ed240A493145A9cE822e990C01f8518),
            address(usdc)
        );

        router.addLiquidity(
            0x14Cb556f6ed240A493145A9cE822e990C01f8518,
            address(usdc),
            750_000 * 1e6,
            250 ether,
            msg.sender
        );

        vm.stopBroadcast();
    }
}
