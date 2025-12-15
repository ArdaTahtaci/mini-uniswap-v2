import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { formatUnits } from "viem";
import { SwapBox } from "../components/SwapBox";
import { useReserves } from "../hooks/useReserves";
import { isReserveTuple } from "../utils/isReserveTuple";
import { Button } from "../components/ui/button";
import { usePairTokens } from "../hooks/usePairTokens";
import { useTokenMetadata } from "../hooks/useTokenMetadata";
import { Panel } from "../components/layout/Panel";
import { TokenBadge } from "../components/TokenBadge";
import { StatRow } from "../components/StatRow";

export function PairPage() {
    const { address } = useParams();
    const pair = address as `0x${string}`;

    const { token0, token1, isLoading: tokensLoading, error: tokensError } = usePairTokens(pair);
    const meta0 = useTokenMetadata(token0);
    const meta1 = useTokenMetadata(token1);

    const { data: reservesRaw, refetch, isLoading: reservesLoading, error: reservesError } = useReserves(pair);
    const reserves = isReserveTuple(reservesRaw)
        ? reservesRaw
        : null;

    const reserve0Display = reserves ? formatPretty(reserves[0], meta0.decimals) : "—";
    const reserve1Display = reserves ? formatPretty(reserves[1], meta1.decimals) : "—";

    const price = useMemo(() => {
        if (!reserves || reserves[0] === 0n) return null;
        const price = Number(formatUnits(reserves[1], meta1.decimals)) / Number(formatUnits(reserves[0], meta0.decimals));
        if (!Number.isFinite(price)) return null;
        return `1 ${meta0.symbol} ≈ ${price.toFixed(6)} ${meta1.symbol}`;
    }, [reserves, meta0.decimals, meta0.symbol, meta1.decimals, meta1.symbol]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold leading-tight">Pair Details</h1>
                    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                        {pair}
                    </div>
                </div>
                <Button
                    variant="secondary"
                    onClick={() => refetch()}
                    title="Refresh reserves and token metadata"
                >
                    Refresh
                </Button>
            </div>

            {/* Two-column layout */}
            <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
                {/* Pool Info */}
                <Panel className="space-y-6">
                    <h2 className="text-lg font-semibold mb-2">Pool Info</h2>

                    {/* Price - Prominent at top */}
                    {price && (
                        <div className="rounded-lg border border-primary/30 bg-linear-to-r from-primary/15 via-primary/10 to-transparent p-4 my-2">
                            <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                            <div className="text-base font-semibold font-mono">{price}</div>
                        </div>
                    )}

                    {tokensError && (
                        <p className="text-xs text-red-400">Error loading tokens: {tokensError.message}</p>
                    )}
                    {reservesError && (
                        <p className="text-xs text-red-400">Error loading reserves: {String(reservesError.message || reservesError)}</p>
                    )}

                    {tokensLoading ? (
                        <p className="text-sm text-muted-foreground">Loading tokens...</p>
                    ) : (
                        <div className="space-y-4 my-4">
                            <div>
                                <div className="text-xs text-muted-foreground mb-3">Token 0</div>
                                {token0 && <TokenBadge symbol={meta0.symbol} address={token0} decimals={meta0.decimals} />}
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground mb-3">Token 1</div>
                                {token1 && <TokenBadge symbol={meta1.symbol} address={token1} decimals={meta1.decimals} />}
                            </div>
                        </div>
                    )}

                    {reservesLoading ? (
                        <div className="text-sm text-muted-foreground">Loading reserves...</div>
                    ) : reserves ? (
                        <div className="space-y-3 pt-6 border-t border-white/10">
                            <StatRow
                                label={`Reserve ${meta0.symbol}`}
                                value={reserve0Display}
                                mono
                            />
                            <StatRow
                                label={`Reserve ${meta1.symbol}`}
                                value={reserve1Display}
                                mono
                            />
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">No reserve data available</div>
                    )}
                </Panel>

                {/* Swap Box */}
                <Panel>
                    <h2 className="text-lg font-semibold mb-4">Swap</h2>
                    <SwapBox initialPair={pair} />
                </Panel>
            </div>
        </div>
    );
}

function formatPretty(value: bigint, decimals: number): string {
    const formatted = formatUnits(value, decimals);
    const num = Number(formatted);
    if (!Number.isFinite(num)) return formatted;
    return num.toLocaleString(undefined, { maximumFractionDigits: 6 });
}
