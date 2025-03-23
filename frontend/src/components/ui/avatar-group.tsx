import * as React from "react"
import { cn } from "@/lib/utils"

export function AvatarGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex -space-x-2 overflow-hidden isolate",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 