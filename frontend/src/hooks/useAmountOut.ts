import { useMemo } from "react"
import { parseUnits, formatUnits } from "viem"

export function useAmountOut(
    amountIn: string,
    reserveIn?: bigint,
    reserveOut?: bigint,
    decimalsIn: number = 18,
    decimalsOut: number = 18
) {
    return useMemo(() => {
        if (!reserveIn || !reserveOut || !amountIn) {
            return { outRaw: 0n, outFormatted: "0" }
        }

        let amountInWei: bigint
        try {
            amountInWei = parseUnits(amountIn, decimalsIn)
        } catch {
            return { outRaw: 0n, outFormatted: "0" }
        }

        const amountInWithFee = amountInWei * 997n
        const numerator = amountInWithFee * reserveOut
        const denominator = reserveIn * 1000n + amountInWithFee

        const out = denominator === 0n ? 0n : numerator / denominator

        return {
            outRaw: out,
            outFormatted: formatUnits(out, decimalsOut),
        }
    }, [amountIn, reserveIn, reserveOut, decimalsIn, decimalsOut])
}
