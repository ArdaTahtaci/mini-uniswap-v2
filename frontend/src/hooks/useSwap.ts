import { useWriteContract } from "wagmi";
import { CONTRACTS, ROUTER_ABI } from "../contracts";

export function useSwap() {
    const { writeContractAsync, isPending, isSuccess, isError, data, error } =
        useWriteContract();

    async function swapExactTokensForTokens(
        amountIn: bigint,
        minOut: bigint,
        tokenIn: `0x${string}`,
        tokenOut: `0x${string}`,
        to: `0x${string}`
    ) {
        try {
            const txHash = await writeContractAsync({
                address: CONTRACTS.ROUTER,
                abi: ROUTER_ABI,
                functionName: "swapExactTokensForTokens",
                args: [amountIn, minOut, tokenIn, tokenOut, to],
            });

            console.log("Swap TX sent:", txHash);
            return txHash;
        } catch (err) {
            console.error("Swap error:", err);
            throw err;
        }
    }

    return { swapExactTokensForTokens, isPending, isSuccess, isError, data, error };
}
