import { Link } from "react-router-dom";
import { Panel } from "../components/layout/Panel";
import { TokenBadge } from "../components/TokenBadge";
import { usePairTokens } from "../hooks/usePairTokens";
import { useTokenMetadata } from "../hooks/useTokenMetadata";
import { useReserves } from "../hooks/useReserves";
import { useAllPairs } from "../hooks/useAllPairs";
import { isReserveTuple } from "../utils/isReserveTuple";
import { formatUnits } from "viem";

export function PairsPage() {
    const { pairs, isLoading: loadingPairs } = useAllPairs();

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold leading-tight">Markets</h1>
                    <p className="text-sm text-muted-foreground mt-1">Available trading pairs</p>
                </div>
            </div>

            {loadingPairs ? (
                <div className="text-center text-muted-foreground py-12">Loading pools...</div>
            ) : pairs.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">No pools available</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {pairs.map((pair) => (
                        <PairCard key={pair} pair={pair} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PairCard({ pair }: { pair: `0x${string}` }) {
    const { token0, token1 } = usePairTokens(pair);
    const meta0 = useTokenMetadata(token0);
    const meta1 = useTokenMetadata(token1);
    const { data: reservesRaw, isLoading } = useReserves(pair);
    const reserves = isReserveTuple(reservesRaw) ? reservesRaw : null;

    const price = computePrice(reserves, meta0.decimals, meta1.decimals, meta0.symbol, meta1.symbol);
    const liquidity = computeLiquidity(reserves, meta0.decimals, meta1.decimals);

    return (
        <Link to={`/pair/${pair}`} className="no-underline block">
            <Panel className="cursor-pointer transition hover:border-primary/40 hover:bg-primary/5 space-y-4">
                {/* Price - Prominent at top */}
                <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent p-3">
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="text-base font-semibold font-mono">
                        {isLoading ? "Loading..." : price ?? "—"}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {token0 && <TokenBadge symbol={meta0.symbol} address={token0} decimals={meta0.decimals} />}
                    <span className="text-muted-foreground">/</span>
                    {token1 && <TokenBadge symbol={meta1.symbol} address={token1} decimals={meta1.decimals} />}
                </div>

                <div className="pt-3 border-t border-white/10">
                    <div className="text-xs text-muted-foreground mb-1">Total Liquidity</div>
                    <div className="text-sm font-semibold font-mono">
                        {isLoading ? "Loading..." : liquidity ?? "—"}
                    </div>
                </div>

                <div className="text-xs text-muted-foreground font-mono truncate pt-2 border-t border-white/10">
                    {pair}
                </div>

                <div className="text-xs text-primary hover:underline pt-2">
                    View Details →
                </div>
            </Panel>
        </Link>
    );
}

function computePrice(
    reserves: readonly [bigint, bigint] | null,
    dec0: number,
    dec1: number,
    sym0: string,
    sym1: string
) {
    if (!reserves) return null;
    const [r0, r1] = reserves;
    if (r0 === 0n) return null;
    const price = Number(formatUnits(r1, dec1)) / Number(formatUnits(r0, dec0));
    if (!Number.isFinite(price)) return null;
    return `${price.toFixed(4)} ${sym1} per ${sym0}`;
}

function computeLiquidity(reserves: readonly [bigint, bigint] | null, dec0: number, dec1: number) {
    if (!reserves) return null;
    const [r0, r1] = reserves;
    const n0 = Number(formatUnits(r0, dec0));
    const n1 = Number(formatUnits(r1, dec1));
    if (!Number.isFinite(n0 + n1)) return null;
    return (n0 + n1).toLocaleString(undefined, { maximumFractionDigits: 2 });
}
