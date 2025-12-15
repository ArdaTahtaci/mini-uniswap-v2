import { cn } from "../utils/cn"
import { ReactNode } from "react"

interface StatCardProps {
    label: string
    value: ReactNode
    hint?: string
    className?: string
    onClick?: () => void
}

export function StatCard({ label, value, hint, className, onClick }: StatCardProps) {
    const interactive = Boolean(onClick)
    return (
        <div
            className={cn(
                "group relative rounded-xl border border-white/10 p-4 overflow-hidden",
                "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm",
                "transition-all duration-300",
                "shadow-sm hover:shadow-md",
                interactive && "cursor-pointer hover:border-primary/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]",
                className
            )}
            onClick={onClick}
        >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
                <div className="text-xs text-muted-foreground font-medium">{label}</div>
                <div className="text-xl font-bold text-foreground mt-1.5">{value}</div>
                {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
            </div>
        </div>
    )
}
