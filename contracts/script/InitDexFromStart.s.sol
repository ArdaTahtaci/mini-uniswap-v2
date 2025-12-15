// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {
    IERC20
} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../src/TestToken.sol";
import "../src/MiniFactory.sol";
import "../src/MiniRouter.sol";
import "../src/MiniPair.sol";

contract InitDexFromStart is Script {
    function run() external {
        vm.startBroadcast();

        IERC20 trump = IERC20(0x3910E9BE916f5dCBb7C935dFEdF19789AdD4C8D2);
        IERC20 pengu = IERC20(0xD5407870F14c6e2354f1a103F37b5f290B3cBc32);
        IERC20 weth = IERC20(0xcB3c90ae1558F7137b0B722e697F974320f96453);
        IERC20 usdc = IERC20(0x1A3E14D5d990E82eACf87fa5ae50Fd89f6e750ea);

        // 2) Deploy factory
        MiniFactory factory = new MiniFactory();
        MiniRouter router = new MiniRouter(address(factory));

        trump.approve(address(router), type(uint).max);
        pengu.approve(address(router), type(uint).max);
        weth.approve(address(router), type(uint).max);
        usdc.approve(address(router), type(uint).max);

        address pairtrumppengu = factory.createPair(
            address(trump),
            address(pengu)
        );
        MiniPair trump_pengu = MiniPair(pairtrumppengu);

        address pairpenguusdc = factory.createPair(
            address(pengu),
            address(usdc)
        );
        MiniPair pengu_usdc = MiniPair(pairpenguusdc);

        address pairtrumpusdc = factory.createPair(
            address(trump),
            address(usdc)
        );
        MiniPair trump_usdc = MiniPair(pairtrumpusdc);

        address pairwethusdc = factory.createPair(address(weth), address(usdc));
        MiniPair weth_usdc = MiniPair(pairwethusdc);

        // Add liquidity

        router.addLiquidity(
            address(trump),
            address(pengu),
            40 ether,
            20000 ether,
            msg.sender
        );

        router.addLiquidity(
            address(weth),
            address(usdc),
            100 ether,
            300000 * 1e6,
            msg.sender
        );

        router.addLiquidity(
            address(trump),
            address(usdc),
            1000 ether,
            5100 * 1e6,
            msg.sender
        );

        router.addLiquidity(
            address(pengu),
            address(usdc),
            40000 ether,
            400 * 1e6,
            msg.sender
        );

        vm.stopBroadcast();

        console.log("FACTORY:", address(factory));
        console.log("ROUTER:", address(router));
        console.log("TRUMP-PENGU PAIR:", address(trump_pengu));
        console.log("PENGU-USDC PAIR:", address(pengu_usdc));
        console.log("TRUMP-USDC PAIR:", address(trump_usdc));
        console.log("WETH-USDC PAIR:", address(weth_usdc));
    }
}
