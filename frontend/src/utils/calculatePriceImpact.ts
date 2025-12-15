import { formatUnits } from "viem";


export function calculatePriceImpact(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    decimalsIn: number,
    decimalsOut: number
): number {
    if (amountIn === 0n || reserveIn === 0n || reserveOut === 0n) {
        return 0;
    }

    // Calculate the current price (how much out token you get per in token)
    const currentPrice = Number(formatUnits(reserveOut, decimalsOut)) / Number(formatUnits(reserveIn, decimalsIn));

    // Calculate the new reserves after the swap (with 0.3% fee)
    const amountInWithFee = amountIn * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;
    const amountOut = denominator === 0n ? 0n : numerator / denominator;

    // Calculate the new reserves
    const newReserveIn = reserveIn + amountIn;
    const newReserveOut = reserveOut - amountOut;

    // Calculate the new price after the swap
    const newPrice = Number(formatUnits(newReserveOut, decimalsOut)) / Number(formatUnits(newReserveIn, decimalsIn));

    // Calculate price impact as percentage
    const priceImpact = ((currentPrice - newPrice) / currentPrice) * 100;

    return Math.abs(priceImpact);
}

/**
 * Get price impact severity level
 * @param priceImpact - Price impact percentage
 * @returns Severity level: "low", "medium", "high", or "critical"
 */
export function getPriceImpactSeverity(priceImpact: number): "low" | "medium" | "high" | "critical" {
    if (priceImpact < 1) return "low";
    if (priceImpact < 3) return "medium";
    if (priceImpact < 5) return "high";
    return "critical";
}

/**
 * Get color class for price impact warning
 */
export function getPriceImpactColor(severity: "low" | "medium" | "high" | "critical"): string {
    switch (severity) {
        case "low":
            return "text-green-400";
        case "medium":
            return "text-yellow-400";
        case "high":
            return "text-orange-400";
        case "critical":
            return "text-red-400";
    }
}
