import { useReadContracts } from "wagmi"
import { PAIR_ABI } from "../contracts"

function isHexAddress(v: unknown): v is `0x${string}` {
    return typeof v === "string" && v.startsWith("0x") && v.length === 42
}

export function usePairTokens(pair?: `0x${string}`) {
    const isValid = isHexAddress(pair)

    const { data, isLoading, error } = useReadContracts({
        contracts: isValid
            ? [
                {
                    address: pair,
                    abi: PAIR_ABI,
                    functionName: "token0",
                },
                {
                    address: pair,
                    abi: PAIR_ABI,
                    functionName: "token1",
                },
            ]
            : [],
        query: { enabled: isValid },
    })

    const raw0 = data?.[0]?.result
    const raw1 = data?.[1]?.result

    const token0 = isHexAddress(raw0) ? raw0 : undefined
    const token1 = isHexAddress(raw1) ? raw1 : undefined

    return {
        token0,
        token1,
        isLoading,
        error,
        isValid,
    }
}
