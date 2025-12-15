import { useReadContract } from "wagmi"
import { PAIR_ABI } from "../contracts"

export function useReserves(pair?: `0x${string}`) {
    return useReadContract({
        address: pair,
        abi: PAIR_ABI,
        functionName: "getReserves",
        query: {
            enabled: Boolean(pair),
            refetchInterval: 10000, // canlı fiyat için
        },
    })
}
