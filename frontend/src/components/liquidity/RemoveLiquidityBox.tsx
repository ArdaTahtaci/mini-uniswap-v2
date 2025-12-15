import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { Panel } from "../layout/Panel";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TokenBadge } from "../TokenBadge";
import { useAllPairs } from "../../hooks/useAllPairs";
import { usePairTokens } from "../../hooks/usePairTokens";
import { useTokenMetadata } from "../../hooks/useTokenMetadata";
import { useAllowance } from "../../hooks/useAllowance";
import { useRemoveLiquidity } from "../../hooks/useRemoveLiquidity";

export function RemoveLiquidityBox() {
    const { address: account } = useAccount();
    const [selectedPool, setSelectedPool] = useState<`0x${string}` | "">("");
    const [lpAmount, setLpAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch all available pairs
    const { pairs, isLoading: loadingPairs } = useAllPairs();

    // Get token addresses from selected pool
    const { token0, token1 } = usePairTokens(selectedPool as `0x${string}`);

    // Get token metadata
    const meta0 = useTokenMetadata(token0);
    const meta1 = useTokenMetadata(token1);

    // Remove liquidity hook
    const { useLPBalance, approveLPToken, removeLiquidity, isPending, isConfirming } = useRemoveLiquidity();

    // Get LP token balance
    const { data: lpBalance } = useLPBalance(selectedPool as `0x${string}`, account);

    // Get LP token allowance
    const lpAllowance = useAllowance(selectedPool as `0x${string}`, account);

    // Parse LP amount to Wei (LP tokens have 18 decimals)
    const lpAmountWei = useMemo(() => {
        if (!lpAmount) return 0n;
        try {
            return parseUnits(lpAmount, 18);
        } catch {
            return 0n;
        }
    }, [lpAmount]);

    // Format LP balance for display
    const lpBalanceDisplay = useMemo(() => {
        if (!lpBalance) return "0";
        const formatted = formatUnits(lpBalance, 18);
        const num = Number(formatted);
        if (!Number.isFinite(num)) return formatted;
        return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
    }, [lpBalance]);

    // Check if approval is needed
    const needsApproval = lpAmountWei > 0n && lpAllowance < lpAmountWei;
    const insufficientBalance = lpAmountWei > 0n && lpBalance !== undefined && lpBalance < lpAmountWei;

    const canRemoveLiquidity = !!(
        selectedPool &&
        token0 &&
        token1 &&
        account &&
        lpAmount &&
        lpAmountWei > 0n &&
        !insufficientBalance &&
        !isProcessing &&
        !isPending &&
        !isConfirming
    );

    const handleRemoveLiquidity = async () => {
        if (!token0 || !token1 || !account || !selectedPool) return;

        setIsProcessing(true);

        try {
            // Step 1: Approve LP token if needed
            if (needsApproval) {
                console.log("Approving LP token...");
                await approveLPToken(selectedPool as `0x${string}`, lpAmountWei);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Step 2: Remove liquidity
            console.log("Removing liquidity...");
            await removeLiquidity(token0, token1, lpAmountWei, account);

            console.log("Liquidity removed successfully!");

            // Reset form
            setLpAmount("");
        } catch (error) {
            console.error("Error removing liquidity:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSetMax = () => {
        if (lpBalance) {
            const formatted = formatUnits(lpBalance, 18);
            setLpAmount(formatted);
        }
    };

    return (
        <Panel className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">Remove Liquidity</h3>
                <p className="text-sm text-muted-foreground my-1">Withdraw your position</p>
            </div>

            {/* Pool Selection */}
            <div className="space-y-2 my-2">
                <label className="text-sm text-muted-foreground">Select Pool</label>
                <Select value={selectedPool} onValueChange={(value) => setSelectedPool(value as `0x${string}`)}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={loadingPairs ? "Loading pools..." : "Choose a liquidity pool"} />
                    </SelectTrigger>
                    <SelectContent>
                        {pairs.map((pairAddress) => (
                            <SelectItem key={pairAddress} value={pairAddress}>
                                <PoolOption pairAddress={pairAddress} />
                            </SelectItem>
                        ))}
                        {pairs.length === 0 && !loadingPairs && (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">No pools available</div>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/* LP Token Amount Input - Only show when pool is selected */}
            {selectedPool && token0 && token1 && (
                <>
                    <div className="space-y-2 my-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-muted-foreground">LP Token Amount</label>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Balance: {lpBalanceDisplay}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSetMax}
                                    className="h-6 px-2 text-xs text-primary hover:text-primary"
                                >
                                    MAX
                                </Button>
                            </div>
                        </div>
                        <Input
                            value={lpAmount}
                            onChange={(e) => setLpAmount(e.target.value)}
                            placeholder="0.0"
                            className={`h-10 text-base ${insufficientBalance ? "border-red-500/40 bg-red-500/5" : ""}`}
                        />
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/10 mb-3">
                        <div className="text-xs text-muted-foreground mb-2">You will receive:</div>
                        <div className="flex flex-col gap-2">
                            <TokenBadge symbol={meta0.symbol} address={token0} decimals={meta0.decimals} />
                            <TokenBadge symbol={meta1.symbol} address={token1} decimals={meta1.decimals} />
                        </div>
                    </div>
                </>
            )}

            {/* Status Messages */}
            <div className="text-xs p-3 border-t border-white/10">
                {!account ? (
                    <span className="text-muted-foreground">Connect wallet to remove liquidity</span>
                ) : !selectedPool ? (
                    <span className="text-muted-foreground">Select a pool to continue</span>
                ) : insufficientBalance ? (
                    <span className="text-red-400">❌ Insufficient LP token balance. You have {lpBalanceDisplay} but trying to remove {lpAmount}</span>
                ) : needsApproval && lpAmount ? (
                    <span className="text-amber-400/80">⚠️ Approval needed - clicking Remove Liquidity will request approval first</span>
                ) : canRemoveLiquidity ? (
                    <span className="text-green-400/80">✓ Ready to remove liquidity</span>
                ) : (
                    <span className="text-muted-foreground">Enter amount to continue</span>
                )}
            </div>

            <Button
                variant="secondary"
                fullWidth
                disabled={!canRemoveLiquidity}
                onClick={handleRemoveLiquidity}
                className="h-12 text-base font-bold"
            >
                {!account ? "Connect Wallet" :
                    isProcessing || isPending || isConfirming ? "Processing..." :
                        "Remove Liquidity"}
            </Button>
        </Panel>
    );
}

// Helper component to display pool option with token names
function PoolOption({ pairAddress }: { pairAddress: `0x${string}` }) {
    const { token0, token1 } = usePairTokens(pairAddress);
    const meta0 = useTokenMetadata(token0);
    const meta1 = useTokenMetadata(token1);

    if (!token0 || !token1) {
        return <span className="font-mono text-xs">{pairAddress.slice(0, 10)}...</span>;
    }

    return (
        <div className="flex items-center gap-2">
            <span className="font-semibold">{meta0.symbol} / {meta1.symbol}</span>
            <span className="text-xs text-muted-foreground font-mono">
                {pairAddress.slice(0, 6)}...{pairAddress.slice(-4)}
            </span>
        </div>
    );
}
