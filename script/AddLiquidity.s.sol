// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {
    IERC20
} from "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../src/MiniRouter.sol";

contract AddLiquidity is Script {
    function run() external {
        address TRUMP = 0x3910E9BE916f5dCBb7C935dFEdF19789AdD4C8D2;
        address PENGU = 0xD5407870F14c6e2354f1a103F37b5f290B3cBc32;
        address ROUTER = 0x112ab1B4c4ab3aC18cE633995dbd8e1fE98106cB;

        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);

        IERC20 trump = IERC20(TRUMP);
        IERC20 pengu = IERC20(PENGU);
        MiniRouter router = MiniRouter(ROUTER);

        trump.approve(address(router), type(uint).max);
        pengu.approve(address(router), type(uint).max);

        router.addLiquidity(TRUMP, PENGU, 1000 ether, 2000 ether, msg.sender);

        vm.stopBroadcast();
    }
}
