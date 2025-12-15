import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, ROUTER_ABI } from "../contracts";
import { erc20Abi } from "viem";

/**
 * Hook to add liquidity to a pool via the MiniRouter contract
 */
export function useAddLiquidity() {
    const { writeContractAsync, data: hash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    /**
     * Approve token spending for the router
     */
    const approveToken = async (tokenAddress: `0x${string}`, amount: bigint) => {
        return await writeContractAsync({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "approve",
            args: [CONTRACTS.ROUTER, amount],
        });
    };

    /**
     * Add liquidity to a pool
     * @param tokenA - First token address
     * @param tokenB - Second token address
     * @param amountA - Amount of tokenA to add
     * @param amountB - Amount of tokenB to add
     * @param to - Address to receive LP tokens
     */
    const addLiquidity = async (
        tokenA: `0x${string}`,
        tokenB: `0x${string}`,
        amountA: bigint,
        amountB: bigint,
        to: `0x${string}`
    ) => {
        return await writeContractAsync({
            address: CONTRACTS.ROUTER,
            abi: ROUTER_ABI,
            functionName: "addLiquidity",
            args: [tokenA, tokenB, amountA, amountB, to],
        });
    };

    return {
        approveToken,
        addLiquidity,
        isPending,
        isConfirming,
        isConfirmed,
        hash,
    };
}
