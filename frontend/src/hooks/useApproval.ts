import { useWriteContract } from "wagmi"
import { CONTRACTS } from "../contracts"
import { maxUint256 } from 'viem';
import { erc20Abi } from 'viem'


export function useApproval(token?: `0x${string}`) {
    const { writeContract, isPending } = useWriteContract()

    function approve() {
        if (!token) return

        return writeContract({
            address: token,
            abi: erc20Abi,
            functionName: "approve",
            args: [CONTRACTS.ROUTER, maxUint256],
        })
    }

    return { approve, isApproving: isPending }
}
