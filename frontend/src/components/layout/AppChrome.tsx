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
                                <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-accent-secondary" />
                                <div className="absolute inset-[2px] rounded-lg bg-gradient-to-br from-primary/80 to-accent/60" />
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
                        <NavItem to="/swap" label="Swap" />
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
