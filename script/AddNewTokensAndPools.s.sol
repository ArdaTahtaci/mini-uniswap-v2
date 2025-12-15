// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "forge-std/Script.sol";

import "../src/TestToken.sol";
import "../src/MiniFactory.sol";
import "../src/MiniRouter.sol";

contract AddNewTokensAndPools is Script {
    function run() external {
        uint256 deployer = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployer);

        // EXISTING DEPLOYED CONTRACTS
        address factoryAddr = 0xA889aFEE0058bFC92C35fF81d43BBcDFE294e759;
        address routerAddr = 0x112ab1B4c4ab3aC18cE633995dbd8e1fE98106cB;

        MiniFactory factory = MiniFactory(factoryAddr);
        MiniRouter router = MiniRouter(routerAddr);

        // DEPLOY NEW TOKENS
        TestToken fweth = new TestToken("Wrapped Ether", "WETH");
        TestToken fusdc = new TestToken("USD Coin", "USDC");

        fweth.mint(msg.sender, 1_000_000 ether);
        fusdc.mint(msg.sender, 10_000_000 * 1e6);

        // CREATE NEW PAIRS
        address pair_fweth_trump = factory.createPair(
            address(fweth),
            0x3910E9BE916f5dCBb7C935dFEdF19789AdD4C8D2
        );
        address pair_fweth_pengu = factory.createPair(
            address(fweth),
            0xD5407870F14c6e2354f1a103F37b5f290B3cBc32
        );
        address pair_fweth_fusdc = factory.createPair(
            address(fweth),
            address(fusdc)
        );

        // APPROVE ROUTER
        fweth.approve(address(router), type(uint256).max);
        fusdc.approve(address(router), type(uint256).max);

        // ADD INITIAL LIQUIDITY (EXAMPLE VALUES)
        router.addLiquidity(
            address(fweth),
            0x3910E9BE916f5dCBb7C935dFEdF19789AdD4C8D2,
            4000 ether,
            19926 ether,
            msg.sender
        );
        router.addLiquidity(
            address(fweth),
            0xD5407870F14c6e2354f1a103F37b5f290B3cBc32,
            19245 ether,
            40000 ether,
            msg.sender
        );
        router.addLiquidity(
            address(fweth),
            address(fusdc),
            250 ether,
            750_000 * 1e6,
            msg.sender
        );

        vm.stopBroadcast();
    }
}
