// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import "../src/TestToken.sol";
import "../src/MiniFactory.sol";
import "../src/MiniRouter.sol";
import "../src/MiniPair.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // 1) Deploy test tokens
        TestToken token0 = new TestToken("OfficialTrump", "TRUMP");
        TestToken token1 = new TestToken("Pudgy Penguins", "PENGU");

        // 2) Deploy factory
        MiniFactory factory = new MiniFactory();

        // 3) Create pair
        address pairAddr = factory.createPair(address(token0), address(token1));
        MiniPair pair = MiniPair(pairAddr);

        // 4) Deploy router
        MiniRouter router = new MiniRouter(address(factory));

        vm.stopBroadcast();

        console.log("TRUMP:", address(token0));
        console.log("PENGU:", address(token1));
        console.log("FACTORY:", address(factory));
        console.log("PAIR:", address(pair));
        console.log("ROUTER:", address(router));
    }
}
