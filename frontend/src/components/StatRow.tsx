import { cn } from "../utils/cn"
import { ReactNode } from "react"

interface StatRowProps {
    label: string
    value: ReactNode
    className?: string
    valueClassName?: string
    mono?: boolean
}

export function StatRow({ label, value, className, valueClassName, mono = false }: StatRowProps) {
    return (
        <div className={cn("flex items-center justify-between text-sm", className)}>
            <span className="text-muted-foreground">{label}</span>
            <span className={cn("text-foreground font-semibold", mono && "font-mono", valueClassName)}>
                {value}
            </span>
        </div>
    )
}
