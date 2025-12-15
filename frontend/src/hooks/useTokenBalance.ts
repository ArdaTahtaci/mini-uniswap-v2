import { useReadContract } from "wagmi"
import { erc20Abi } from 'viem'

export function useTokenBalance(
    token?: `0x${string}`,
    account?: `0x${string}`
) {
    const { data } = useReadContract({
        address: token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: account && token ? [account] : undefined,
        query: {
            enabled: !!account && !!token,
            refetchInterval: 5000, // Refresh every 5 seconds
        },
    })

    return typeof data === "bigint" ? data : 0n
}
