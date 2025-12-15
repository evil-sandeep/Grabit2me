import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-12 w-full min-w-0 border-[3px] border-foreground bg-card px-4 py-3 text-base font-mono font-medium tracking-wide shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base",
        "focus:translate-y-0.5 focus:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] focus:border-[#E07A3E]",
        "placeholder:uppercase placeholder:tracking-wider placeholder:text-xs placeholder:font-bold",
        className
      )}
      {...props}
    />
  )
}

export { Input }
