import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../../utils/cn"

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
    className?: string
    children: ReactNode
}

export function Panel({ className, children, ...props }: PanelProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 p-6 backdrop-blur-xl",
                "bg-linear-to-br from-card/90 to-card/70",
                "shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(139,92,246,0.1)]",
                "transition-all duration-300",
                className
            )}
            {...props}
        >
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:var(--panel-gradient)]" aria-hidden />
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139, 92, 246, 0.1), transparent 50%)"
                }}
                aria-hidden
            />
            <div className="relative z-10">{children}</div>
        </div>
    )
}
