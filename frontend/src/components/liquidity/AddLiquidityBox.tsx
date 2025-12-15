import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { Panel } from "../layout/Panel";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TokenBadge } from "../TokenBadge";
import { useAllPairs } from "../../hooks/useAllPairs";
import { usePairTokens } from "../../hooks/usePairTokens";
import { useTokenMetadata } from "../../hooks/useTokenMetadata";
import { useAllowance } from "../../hooks/useAllowance";
import { useAddLiquidity } from "../../hooks/useAddLiquidity";

export function AddLiquidityBox() {
    const { address: account } = useAccount();
    const [selectedPool, setSelectedPool] = useState<`0x${string}` | "">("");
    const [amountA, setAmountA] = useState("");
    const [amountB, setAmountB] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch all available pairs
    const { pairs, isLoading: loadingPairs } = useAllPairs();

    // Get token addresses from selected pool
    const { token0, token1 } = usePairTokens(selectedPool as `0x${string}`);

    // Get token metadata
    const meta0 = useTokenMetadata(token0);
    const meta1 = useTokenMetadata(token1);

    // Get allowances
    const allowanceA = useAllowance(token0, account);
    const allowanceB = useAllowance(token1, account);

    // Add liquidity hook
    const { approveToken, addLiquidity, isPending, isConfirming } = useAddLiquidity();

    // Parse amounts to Wei
    const amountAWei = useMemo(() => {
        if (!amountA || !meta0.decimals) return 0n;
        try {
            return parseUnits(amountA, meta0.decimals);
        } catch {
            return 0n;
        }
    }, [amountA, meta0.decimals]);

    const amountBWei = useMemo(() => {
        if (!amountB || !meta1.decimals) return 0n;
        try {
            return parseUnits(amountB, meta1.decimals);
        } catch {
            return 0n;
        }
    }, [amountB, meta1.decimals]);

    // Check if approvals are needed
    const needsApprovalA = amountAWei > 0n && allowanceA < amountAWei;
    const needsApprovalB = amountBWei > 0n && allowanceB < amountBWei;

    const canAddLiquidity = !!(
        selectedPool &&
        token0 &&
        token1 &&
        account &&
        amountA &&
        amountB &&
        amountAWei > 0n &&
        amountBWei > 0n &&
        !isProcessing &&
        !isPending &&
        !isConfirming
    );

    const handleAddLiquidity = async () => {
        if (!token0 || !token1 || !account || !selectedPool) return;

        setIsProcessing(true);

        try {
            // Step 1: Approve token A if needed
            if (needsApprovalA) {
                console.log("Approving token A...");
                await approveToken(token0, amountAWei);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Step 2: Approve token B if needed
            if (needsApprovalB) {
                console.log("Approving token B...");
                await approveToken(token1, amountBWei);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Step 3: Add liquidity
            console.log("Adding liquidity...");
            await addLiquidity(token0, token1, amountAWei, amountBWei, account);

            console.log("Liquidity added successfully!");

            // Reset form
            setAmountA("");
            setAmountB("");
        } catch (error) {
            console.error("Error adding liquidity:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Panel className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">Add Liquidity</h3>
                <p className="text-sm text-muted-foreground my-1">Deposit tokens to the pool</p>
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

            {/* Token Amount Inputs - Only show when pool is selected */}
            {selectedPool && token0 && token1 && (
                <div className="space-y-3 mb-3">
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">{meta0.symbol} Amount</label>
                        <Input
                            value={amountA}
                            onChange={(e) => setAmountA(e.target.value)}
                            placeholder="0.0"
                            className="h-10 text-base"
                        />
                        <TokenBadge symbol={meta0.symbol} address={token0} decimals={meta0.decimals} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">{meta1.symbol} Amount</label>
                        <Input
                            value={amountB}
                            onChange={(e) => setAmountB(e.target.value)}
                            placeholder="0.0"
                            className="h-10 text-base"
                        />
                        <TokenBadge symbol={meta1.symbol} address={token1} decimals={meta1.decimals} />
                    </div>
                </div>
            )}

            {/* Status Messages */}
            <div className="text-xs p-3 border-t border-white/10">
                {!account ? (
                    <span className="text-muted-foreground">Connect wallet to add liquidity</span>
                ) : !selectedPool ? (
                    <span className="text-muted-foreground">Select a pool to continue</span>
                ) : (needsApprovalA || needsApprovalB) && amountA && amountB ? (
                    <span className="text-amber-400/80">⚠️ Approval needed - clicking Add Liquidity will request approvals first</span>
                ) : canAddLiquidity ? (
                    <span className="text-green-400/80">✓ Ready to add liquidity</span>
                ) : (
                    <span className="text-muted-foreground">Enter amounts to continue</span>
                )}
            </div>

            <Button
                fullWidth
                disabled={!canAddLiquidity}
                onClick={handleAddLiquidity}
                className="h-12 text-base font-bold"
            >
                {!account ? "Connect Wallet" :
                    isProcessing || isPending || isConfirming ? "Processing..." :
                        "Add Liquidity"}
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
