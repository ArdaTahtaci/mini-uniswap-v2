import { Link, NavLink } from "react-router-dom"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Button } from "../ui/button"
import { cn } from "../../utils/cn"
import type { ReactNode } from "react"

interface AppChromeProps {
    children: ReactNode
}

export function AppChrome({ children }: AppChromeProps) {
    const { address } = useAccount()
    const shortAccount = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"
    const { connect, connectors, isPending } = useConnect()
    const { disconnect } = useDisconnect()

    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-90" aria-hidden>
                <div className="absolute inset-0 bg-grid-lines" />
                <div className="absolute inset-0 bg-radial-fade" />
            </div>

            <div className="relative mx-auto flex max-w-6xl flex-col px-4 py-6 lg:px-8 lg:py-8 gap-6">
                <header className="relative flex flex-col gap-5 rounded-2xl border border-white/15 px-6 py-5 backdrop-blur-xl overflow-hidden bg-gradient-to-br from-card/95 to-card/80 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(139,92,246,0.15)]">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent" aria-hidden />

                    <div className="relative flex items-center justify-between gap-3">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative size-11 rounded-xl overflow-hidden shadow-lg transition-all group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    {/* Background gradient */}
                                    <defs>
                                        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                                            <stop offset="50%" style={{ stopColor: '#E879F9', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                                        </linearGradient>
                                        <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#A78BFA', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>

                                    {/* Background */}
                                    <rect width="100" height="100" fill="url(#bgGradient)" />

                                    {/* Geometric DEX symbol - Hexagon with arrows */}
                                    <g className="transition-transform group-hover:scale-110" transform-origin="50 50">
                                        {/* Outer hexagon */}
                                        <path
                                            d="M 50 15 L 75 28 L 75 54 L 50 67 L 25 54 L 25 28 Z"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="3"
                                            opacity="0.9"
                                        />

                                        {/* Inner hexagon */}
                                        <path
                                            d="M 50 25 L 65 33 L 65 49 L 50 57 L 35 49 L 35 33 Z"
                                            fill="url(#innerGradient)"
                                            opacity="0.7"
                                        />

                                        {/* Swap arrows - curved bidirectional */}
                                        <g opacity="0.95">
                                            {/* Top right arrow */}
                                            <path
                                                d="M 58 35 Q 65 38 62 45"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                            />
                                            <polygon
                                                points="63,44 62,48 58,45"
                                                fill="white"
                                            />

                                            {/* Bottom left arrow */}
                                            <path
                                                d="M 42 47 Q 35 44 38 37"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                            />
                                            <polygon
                                                points="37,38 38,34 42,37"
                                                fill="white"
                                            />
                                        </g>

                                        {/* Center dot - liquidity pool symbol */}
                                        <circle
                                            cx="50"
                                            cy="41"
                                            r="3.5"
                                            fill="white"
                                            opacity="0.95"
                                        />
                                    </g>
                                </svg>
                            </div>
                            <div>
                                <div className="text-lg font-bold tracking-tight leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">MiniDEX</div>
                                <div className="text-xs text-muted-foreground">Base Sepolia</div>
                            </div>
                        </Link>

                        <div className="flex items-center gap-3">
                            <span className="hidden rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-1.5 text-xs font-mono text-foreground sm:inline-flex backdrop-blur-sm">
                                {shortAccount}
                            </span>
                            <Button
                                size="lg"
                                variant={address ? "secondary" : "primary"}
                                onClick={() => {
                                    if (address) {
                                        disconnect()
                                    } else {
                                        const connector = connectors[0]
                                        if (connector) {
                                            connect({ connector })
                                        }
                                    }
                                }}
                                disabled={isPending}
                            >
                                {address ? "Disconnect" : isPending ? "Connecting..." : "Connect"}
                            </Button>
                        </div>
                    </div>

                    <nav className="relative flex flex-wrap items-center gap-3">
                        <NavItem to="/" label="Dashboard" />
                        <NavItem to="/pairs" label="Markets" />
                        <NavItem to="/liquidity" label="Liquidity" />
                    </nav>
                </header>

                <main className="flex-1">{children}</main>
            </div>
        </div>
    )
}

function NavItem({ to, label, disabled }: { to: string; label: string; disabled?: boolean }) {
    if (disabled) {
        return <span className="px-6 py-3 text-base text-muted-foreground/50 cursor-not-allowed">{label}</span>
    }

    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "relative px-6 py-3 text-base font-bold rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
                    "hover:bg-white/15 hover:scale-105 hover:shadow-lg",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
                    "before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
                    isActive
                        ? "bg-gradient-to-r from-primary/25 to-primary/10 text-primary shadow-[0_0_25px_rgba(139,92,246,0.4)] border border-primary/30"
                        : "text-foreground/80 hover:text-foreground border border-transparent hover:border-white/20"
                )
            }
        >
            <span className="relative z-10">{label}</span>
        </NavLink>
    )
}
