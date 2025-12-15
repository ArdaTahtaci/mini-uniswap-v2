import { SectionTitle } from "../components/typography/SectionTitle";
import { AddLiquidityBox } from "../components/liquidity/AddLiquidityBox";
import { RemoveLiquidityBox } from "../components/liquidity/RemoveLiquidityBox";

export function LiquidityPage() {
    return (
        <div className="space-y-6">
            <SectionTitle title="Liquidity" subtitle="Add or remove liquidity from pools" />

            <div className="grid gap-6 lg:grid-cols-2">
                <AddLiquidityBox />
                <RemoveLiquidityBox />
            </div>
        </div>
    );
}
