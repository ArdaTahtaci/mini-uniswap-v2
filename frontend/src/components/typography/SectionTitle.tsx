import { cn } from "../../utils/cn"

interface SectionTitleProps {
    title: string
    subtitle?: string
    className?: string
}

export function SectionTitle({ title, subtitle, className }: SectionTitleProps) {
    return (
        <div className={cn("space-y-1", className)}>
            <h2 className="text-2xl font-semibold leading-tight">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
    )
}
