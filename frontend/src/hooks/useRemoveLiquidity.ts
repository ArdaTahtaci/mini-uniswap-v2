import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACTS, ROUTER_ABI } from "../contracts";
import { erc20Abi } from "viem";

/**
 * Hook to remove liquidity from a pool via the MiniRouter contract
 */
export function useRemoveLiquidity() {
    const { writeContractAsync, data: hash, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    /**
     * Get LP token balance for a pair
     */
    const useLPBalance = (pairAddress: `0x${string}` | undefined, account: `0x${string}` | undefined) => {
        return useReadContract({
            address: pairAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: account ? [account] : undefined,
            query: {
                enabled: !!(pairAddress && account),
                refetchInterval: 5000,
            },
        });
    };

    /**
     * Approve LP token spending for the router
     */
    const approveLPToken = async (pairAddress: `0x${string}`, amount: bigint) => {
        return await writeContractAsync({
            address: pairAddress,
            abi: erc20Abi,
            functionName: "approve",
            args: [CONTRACTS.ROUTER, amount],
        });
    };

    /**
     * Remove liquidity from a pool
     * @param tokenA - First token address
     * @param tokenB - Second token address
     * @param liquidity - Amount of LP tokens to burn
     * @param to - Address to receive tokens
     */
    const removeLiquidity = async (
        tokenA: `0x${string}`,
        tokenB: `0x${string}`,
        liquidity: bigint,
        to: `0x${string}`
    ) => {
        return await writeContractAsync({
            address: CONTRACTS.ROUTER,
            abi: ROUTER_ABI,
            functionName: "removeLiquidity",
            args: [tokenA, tokenB, liquidity, to],
        });
    };

    return {
        useLPBalance,
        approveLPToken,
        removeLiquidity,
        isPending,
        isConfirming,
        isConfirmed,
        hash,
    };
}
