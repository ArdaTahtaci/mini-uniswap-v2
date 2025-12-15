import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Panel } from "../components/layout/Panel";
import { StatRow } from "../components/StatRow";
import { useAllPairs } from "../hooks/useAllPairs";
import { usePairTokens } from "../hooks/usePairTokens";
import { useTokenMetadata } from "../hooks/useTokenMetadata";
import { useReserves } from "../hooks/useReserves";
import { isReserveTuple } from "../utils/isReserveTuple";
import { formatUnits } from "viem";

export function DashboardPage() {
    const navigate = useNavigate();
    const { pairs } = useAllPairs();

    // Use the first pair as default, or null if no pairs exist
    const defaultPair = pairs.length > 0 ? pairs[0] : null;

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <Panel className="relative bg-linear-to-br from-primary/10 via-transparent to-transparent border-primary/20">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        DEX Interface
                    </div>
                    <h1 className="text-3xl font-semibold leading-tight md:text-4xl max-w-2xl">
                        Trade Base Sepolia pairs with a clean, minimal interface
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        {defaultPair && (
                            <Button size="lg" onClick={() => navigate(`/pair/${defaultPair}`)}>
                                Open Pair
                            </Button>
                        )}
                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => navigate("/pairs")}
                        >
                            View Markets
                        </Button>
                    </div>
                </div>
            </Panel>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Panel>
                    <StatRow label="Active Pairs" value={pairs.length || 1} />
                </Panel>
                <Panel>
                    <StatRow label="Router" value="MiniRouter v1" mono />
                </Panel>
                <Panel>
                    <StatRow label="Network" value="Base Sepolia" mono />
                </Panel>
            </div>

            {/* Pairs List */}
            <Panel>
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Available Markets</h2>
                        <p className="text-sm text-muted-foreground mt-1">Click to view pair details and swap</p>
                    </div>

                    <div className="space-y-3">
                        {pairs.map((pair) => (
                            <MarketCard key={pair} pair={pair} onClick={() => navigate(`/pair/${pair}`)} />
                        ))}
                    </div>
                </div>
            </Panel>
        </div>
    );
}

// Market card component showing pair name and price
function MarketCard({ pair, onClick }: { pair: `0x${string}`; onClick: () => void }) {
    const { token0, token1 } = usePairTokens(pair);
    const meta0 = useTokenMetadata(token0);
    const meta1 = useTokenMetadata(token1);
    const { data: reservesRaw } = useReserves(pair);
    const reserves = isReserveTuple(reservesRaw) ? reservesRaw : null;

    // Calculate price
    const price = reserves && reserves[0] !== 0n
        ? (Number(formatUnits(reserves[1], meta1.decimals)) / Number(formatUnits(reserves[0], meta0.decimals))).toFixed(4)
        : "—";

    return (
        <div
            className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-primary/40 hover:bg-primary/5"
            onClick={onClick}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-base font-semibold">{meta0.symbol}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-base font-semibold">{meta1.symbol}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Price</div>
                        <div className="font-mono text-sm font-semibold">{price} {meta1.symbol}</div>
                    </div>
                    <div className="text-xs text-primary group-hover:underline shrink-0">
                        →
                    </div>
                </div>
            </div>
        </div>
    );
}
