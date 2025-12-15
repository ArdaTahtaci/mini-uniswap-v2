import { useReadContract } from "wagmi"
import { erc20Abi } from 'viem'

export function useTokenMetadata(token?: `0x${string}`) {
    const { data: symbolRaw } = useReadContract({
        address: token,
        abi: erc20Abi,
        functionName: "symbol",
        query: { enabled: !!token },
    })

    const { data: decimalsRaw } = useReadContract({
        address: token,
        abi: erc20Abi,
        functionName: "decimals",
        query: { enabled: !!token },
    })

    return {
        symbol: typeof symbolRaw === "string" ? symbolRaw : "-",
        decimals: typeof decimalsRaw === "number" ? decimalsRaw : 18,
    }
}
