import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

import { usePairTokens } from "../hooks/usePairTokens";
import { useReserves } from "../hooks/useReserves";
import { useTokenMetadata } from "../hooks/useTokenMetadata";
import { useAllowance } from "../hooks/useAllowance";
import { useApproval } from "../hooks/useApproval";
import { useAmountOut } from "../hooks/useAmountOut";
import { useSwap } from "../hooks/useSwap";
import { useTokenBalance } from "../hooks/useTokenBalance";
import { parseUnits, formatUnits } from "viem";
import { TokenBadge } from "../components/TokenBadge";
import { baseSepolia } from 'wagmi/chains'
import { calculatePriceImpact, getPriceImpactSeverity, getPriceImpactColor } from "../utils/calculatePriceImpact";


interface SwapBoxProps {
    initialPair: `0x${string}`;
}

export function SwapBox({ initialPair }: SwapBoxProps) {
    const { address: account, chain } = useAccount();

    // Get token0/token1 from pair
    const { token0, token1, isValid } = usePairTokens(initialPair)

    // Swap direction: token0 -> token1 or token1 -> token0
    const [direction, setDirection] = useState<"AtoB" | "BtoA">("AtoB");

    const tokenIn = direction === "AtoB" ? token0 : token1;
    const tokenOut = direction === "AtoB" ? token1 : token0;

    // Amount input
    const [amountIn, setAmountIn] = useState("");

    // Pool reserves
    const { data: reservesRaw } = useReserves(initialPair);
    const reserves = Array.isArray(reservesRaw) ? reservesRaw : null;

    const reserveIn = reserves ? (direction === "AtoB" ? reserves[0] : reserves[1]) : undefined;
    const reserveOut = reserves ? (direction === "AtoB" ? reserves[1] : reserves[0]) : undefined;

    // Token metadata
    const metaIn = useTokenMetadata(tokenIn);
    const metaOut = useTokenMetadata(tokenOut);

    // AmountOut calculation
    const { outRaw, outFormatted } = useAmountOut(
        amountIn,
        reserveIn,
        reserveOut,
        metaIn.decimals,
        metaOut.decimals
    );
    const outDisplay = useMemo(() => {
        if (!outRaw) return "0";
        const val = Number(formatUnits(outRaw, metaOut.decimals));
        if (!Number.isFinite(val)) return outFormatted;
        return val.toLocaleString(undefined, { maximumFractionDigits: 6 });
    }, [outRaw, metaOut.decimals, outFormatted]);

    // Allowance + Approval
    const allowance = useAllowance(tokenIn, account);
    const { approve, isApproving } = useApproval(tokenIn);

    // Token Balance
    const tokenInBalance = useTokenBalance(tokenIn, account);

    const [isProcessing, setIsProcessing] = useState(false);
    const amountInWei = useMemo(() => {
        if (!amountIn || !metaIn.decimals) return 0n;
        try {
            return parseUnits(amountIn, metaIn.decimals);
        } catch {
            return 0n;
        }
    }, [amountIn, metaIn.decimals]);

    const needsApproval = amountInWei > 0n && allowance < amountInWei;
    const insufficientBalance = amountInWei > 0n && tokenInBalance < amountInWei;

    // Format balance for display
    const balanceDisplay = useMemo(() => {
        if (!tokenInBalance || !metaIn.decimals) return "0";
        const formatted = formatUnits(tokenInBalance, metaIn.decimals);
        const num = Number(formatted);
        if (!Number.isFinite(num)) return formatted;
        return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
    }, [tokenInBalance, metaIn.decimals]);

    // Swap
    const { swapExactTokensForTokens, isPending: swapPending } = useSwap();

    const priceLine = useMemo(() => {
        if (!reserveIn || !reserveOut) return null;
        const inHuman = Number(formatUnits(reserveIn, metaIn.decimals));
        const outHuman = Number(formatUnits(reserveOut, metaOut.decimals));
        if (!Number.isFinite(inHuman) || !Number.isFinite(outHuman) || inHuman === 0) return null;
        const price = outHuman / inHuman;
        return `Price: 1 ${metaIn.symbol} ≈ ${price.toFixed(6)} ${metaOut.symbol}`;
    }, [reserveIn, reserveOut, metaIn.decimals, metaIn.symbol, metaOut.decimals, metaOut.symbol]);

    // Price Impact calculation
    const priceImpact = useMemo(() => {
        if (!amountInWei || !reserveIn || !reserveOut || amountInWei === 0n) return null;
        const impact = calculatePriceImpact(amountInWei, reserveIn, reserveOut, metaIn.decimals, metaOut.decimals);
        const severity = getPriceImpactSeverity(impact);
        return { impact, severity };
    }, [amountInWei, reserveIn, reserveOut, metaIn.decimals, metaOut.decimals]);

    const swapDisabled = !account || !amountIn || !tokenIn || !tokenOut || !reserveIn || !reserveOut || isProcessing || swapPending || isApproving || insufficientBalance;

    async function handleSwap() {
        if (!tokenIn || !tokenOut || !account || !outRaw) return;

        setIsProcessing(true);

        try {
            // Step 1: Check if approval is needed and approve
            if (needsApproval) {
                console.log("Step 1: Approving token...");
                await approve();
                // Wait a bit for allowance to update
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Step 2: Execute swap
            console.log("Step 2: Executing swap...");
            console.log("CURRENT CHAIN:", chain);
            console.log(baseSepolia);

            const minOut = outRaw * 995n / 1000n; // 0.5% slippage

            await swapExactTokensForTokens(
                amountInWei,
                minOut,
                tokenIn,
                tokenOut,
                account,
            );
            console.log("Swap completed successfully!");
        } catch (e) {
            console.error("Transaction error:", e);
        } finally {
            setIsProcessing(false);
        }
    }

    if (!isValid) {
        return (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
                Invalid pair address.
            </div>
        );
    }

    if (!token0 || !token1) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-muted-foreground">
                Loading pair tokens...
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {metaIn.symbol} → {metaOut.symbol}
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setDirection(direction === "AtoB" ? "BtoA" : "AtoB")}
                    title="Reverse swap direction"
                >
                    ⇅
                </Button>
            </div>

            {/* Price Display - Prominent */}
            {priceLine && (
                <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent p-3">
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="text-base font-semibold font-mono">{priceLine.replace('Price: ', '')}</div>
                </div>
            )}

            {/* From Input */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span>From</span>
                    <span className="flex items-center gap-2">
                        <span>Balance: {balanceDisplay}</span>
                        <span>•</span>
                        <span>{metaIn.decimals} decimals</span>
                    </span>
                </div>
                <div className={`rounded-xl border p-5 ${insufficientBalance
                    ? "border-red-500/40 bg-red-500/5"
                    : "border-white/10 bg-white/5"
                    }`}>
                    <div className="flex items-center gap-3 mb-3">
                        <Input
                            className="flex-1 h-auto border-0 bg-transparent px-2 py-1 text-2xl font-semibold focus-visible:ring-0"
                            value={amountIn}
                            onChange={(e) => setAmountIn(e.target.value)}
                            placeholder="0.0"
                        />
                        <div className="shrink-0 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold font-mono">
                            {metaIn.symbol}
                        </div>
                    </div>
                    {tokenIn && <TokenBadge symbol={metaIn.symbol} address={tokenIn} decimals={metaIn.decimals} />}
                </div>
            </div>

            {/* To Output */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <span>To (estimated)</span>
                    <span>Live reserves</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 text-2xl font-semibold font-mono text-muted-foreground">
                            {outDisplay}
                        </div>
                        <div className="shrink-0 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold font-mono">
                            {metaOut.symbol}
                        </div>
                    </div>
                    {tokenOut && <TokenBadge symbol={metaOut.symbol} address={tokenOut} decimals={metaOut.decimals} />}
                </div>
            </div>

            {/* Summary & Action */}
            <div className="space-y-3 pt-2">
                {insufficientBalance && (
                    <div className="text-xs text-red-400 px-1 flex items-center gap-1 font-semibold">
                        <span>❌</span>
                        <span>Insufficient {metaIn.symbol} balance. You have {balanceDisplay} but trying to swap {amountIn}</span>
                    </div>
                )}

                {needsApproval && !insufficientBalance && (
                    <div className="text-xs text-amber-400/80 px-1 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>Approval needed - clicking Swap will request approval first</span>
                    </div>
                )}

                {priceImpact && priceImpact.impact > 0.5 && (
                    <div className={`text-xs px-1 flex items-center gap-1 font-semibold ${getPriceImpactColor(priceImpact.severity)}`}>
                        <span>{priceImpact.severity === "critical" ? "🚨" : priceImpact.severity === "high" ? "⚠️" : "ℹ️"}</span>
                        <span>
                            Price Impact: {priceImpact.impact.toFixed(2)}%
                            {priceImpact.severity === "critical" && " - Very High Impact!"}
                            {priceImpact.severity === "high" && " - High Impact"}
                        </span>
                    </div>
                )}

                <Button
                    className="w-full h-14 text-lg font-bold"
                    onClick={handleSwap}
                    disabled={swapDisabled}
                    size="lg"
                >
                    {!account
                        ? "Connect wallet"
                        : isProcessing
                            ? needsApproval
                                ? "Approving..."
                                : "Swapping..."
                            : swapPending
                                ? "Confirming..."
                                : isApproving
                                    ? "Approving..."
                                    : needsApproval
                                        ? `Approve & Swap ${metaIn.symbol}`
                                        : "Swap"}
                </Button>

                {(!reserveIn || !reserveOut) && (
                    <div className="text-xs text-muted-foreground px-1">Waiting for reserve data...</div>
                )}
            </div>
        </div>
    );
}
