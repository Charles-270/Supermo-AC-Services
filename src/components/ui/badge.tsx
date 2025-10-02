import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-500 text-white shadow hover:bg-primary-600",
        secondary:
          "border-transparent bg-accent-500 text-white shadow hover:bg-accent-600",
        destructive:
          "border-transparent bg-error text-white shadow hover:bg-error/90",
        success:
          "border-transparent bg-success text-white shadow hover:bg-success/90",
        warning:
          "border-transparent bg-warning text-white shadow hover:bg-warning/90",
        outline: "text-neutral-950 border-neutral-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
