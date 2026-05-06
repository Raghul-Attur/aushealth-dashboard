import { cn } from "@/lib/utils"
import { type HTMLAttributes, forwardRef } from "react"

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("card", className)} {...props} />
  )
)
Card.displayName = "Card"

export const CardRaised = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("card-raised", className)} {...props} />
  )
)
CardRaised.displayName = "CardRaised"