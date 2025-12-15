import { cn } from "../utils/cn"

interface TokenBadgeProps {
    symbol: string
    address: `0x${string}`
    decimals?: number
    className?: string
}

function shorten(address: `0x${string}`) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function TokenBadge({ symbol, address, decimals, className }: TokenBadgeProps) {
    return (
        <div className={cn(
            "inline-flex items-center gap-3 rounded-xl border border-white/10 px-4 py-2.5",
            "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm",
            "hover:border-primary/30 transition-all duration-200",
            "shadow-sm hover:shadow-md",
            className
        )}>
            <div className="relative size-6 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-accent-secondary animate-spin-slow" />
                <div className="absolute inset-[2px] rounded-full bg-card" />
                <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-primary/60 to-accent/40" />
            </div>
            <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-foreground">{symbol || "—"}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                    {shorten(address)}{decimals !== undefined ? ` · ${decimals}d` : ""}
                </span>
            </div>
        </div>
    )
}
