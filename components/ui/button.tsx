import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold tracking-wider uppercase transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none border-[3px] border-foreground active:translate-y-[2px] active:shadow-none relative",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:shadow-none",
        destructive:
          "bg-destructive text-white shadow-[4px_4px_0px_0px_rgba(200,75,49,1)] hover:shadow-[2px_2px_0px_0px_rgba(200,75,49,1)] active:shadow-none border-destructive",
        outline:
          "border-[3px] border-foreground bg-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:bg-muted active:shadow-none",
        secondary:
          "bg-[#E07A3E] text-foreground shadow-[4px_4px_0px_0px_rgba(224,122,62,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(224,122,62,0.5)] active:shadow-none border-[#E07A3E]",
        ghost:
          "border-transparent hover:bg-muted hover:border-foreground shadow-none",
        link: "border-transparent underline-offset-4 hover:underline shadow-none uppercase tracking-wider",
      },
      size: {
        default: "h-11 px-6 py-3 text-sm has-[>svg]:px-4",
        sm: "h-9 px-4 py-2 text-xs has-[>svg]:px-3",
        lg: "h-14 px-8 py-4 text-base has-[>svg]:px-6",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
