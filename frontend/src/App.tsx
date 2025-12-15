import { Routes, Route } from "react-router-dom";
import { AppChrome } from "./components/layout/AppChrome";
import { DashboardPage } from "./pages/DashboardPage";
import { PairPage } from "./pages/PairPage";
import { PairsPage } from "./pages/PairsPage";
import { LiquidityPage } from "./pages/LiquidityPage";

export default function App() {
    return (
        <AppChrome>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/pairs" element={<PairsPage />} />
                <Route path="/pair/:address" element={<PairPage />} />
                <Route path="/liquidity" element={<LiquidityPage />} />
            </Routes>
        </AppChrome>
    );
}
