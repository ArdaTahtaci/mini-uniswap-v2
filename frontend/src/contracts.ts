// -----------------------------
// Contract Addresses
// -----------------------------
export const CONTRACTS = {
    TRUMP: "0x3910E9BE916f5dCBb7C935dFEdF19789AdD4C8D2",
    PENGU: "0xD5407870F14c6e2354f1a103F37b5f290B3cBc32",
    WETH: "0x14Cb556f6ed240A493145A9cE822e990C01f8518",
    USDC: "0x1A3E14D5d990E82eACf87fa5ae50Fd89f6e750ea",

    FACTORY: "0x55e9496bA862395D6eF171a6C16aca8BaE310734",
    ROUTER: "0x41DB9ACd41ebe98A9e6C1Db407814f3190316666"
} as const;


// -----------------------------
// ABIs
// -----------------------------
import factoryAbi from "./abi/factory.json";
import routerAbi from "./abi/router.json";
import pairAbi from "./abi/pair.json";
import type { Abi } from "viem";

// Export as constants for wagmi/viem usage
export const FACTORY_ABI = factoryAbi.abi as Abi;
export const ROUTER_ABI = routerAbi.abi as Abi;
export const PAIR_ABI = pairAbi.abi as Abi;


// -----------------------------
// Typed helpers (optional but recommended)
// -----------------------------
export type ContractAddressKey = keyof typeof CONTRACTS;
export type ContractAddress = (typeof CONTRACTS)[ContractAddressKey];
