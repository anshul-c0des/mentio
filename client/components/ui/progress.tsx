// components/ui/progress.tsx
"use client"
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

// 🟢 ADD indicatorClassName to the ProgressProps interface/type
interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    indicatorClassName?: string; // <--- ADD THIS LINE
}

// 🟢 UPDATE the component function signature
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps // <--- USE the extended ProgressProps
>(({ className, value, indicatorClassName, ...props }, ref) => ( // <--- ACCEPT indicatorClassName
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    {/* 🟢 APPLY indicatorClassName to the indicator element */}
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-primary transition-transform duration-500 ease-in-out",
        indicatorClassName // <--- USE IT HERE
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }