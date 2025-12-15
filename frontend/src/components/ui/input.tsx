import * as React from "react";

import { cn } from "../../utils/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "h-10 w-full min-w-0 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] px-4 py-2.5 text-base",
        "shadow-sm backdrop-blur-sm transition-all duration-200 outline-none",
        "focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
        "hover:border-white/20 hover:bg-white/[0.08]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "aria-invalid:border-error/50 aria-invalid:ring-error/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
