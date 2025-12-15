import { useReadContract } from "wagmi"
import { CONTRACTS } from "../contracts"
import { erc20Abi } from 'viem'

export function useAllowance(
    token?: `0x${string}`,
    owner?: `0x${string}`
) {
    const { data } = useReadContract({
        address: token,
        abi: erc20Abi,
        functionName: "allowance",
        args: owner && token ? [owner, CONTRACTS.ROUTER] : undefined,
        query: { enabled: !!owner && !!token },
    })

    return typeof data === "bigint" ? data : 0n
}
