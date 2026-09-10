"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type LoadingStateProps = {
  variant?: "cards" | "rows" | "section"
  /** Meaningful for `cards` (skeleton cards) and `rows` (skeleton lines). */
  count?: number
  className?: string
}

/**
 * Layout-preserving loading placeholders. `cards` mirrors a KPI grid,
 * `rows` mirrors a table, `section` is a single content block.
 *
 * The shapes mirror the real components closely enough that the swap on load
 * does not move the page — which is the whole point of a skeleton.
 */
export function LoadingState({
  variant = "cards",
  count = 4,
  className,
}: LoadingStateProps) {
  if (variant === "cards") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} size="sm">
            <CardHeader>
              <Skeleton className="h-3.5 w-24" />
            </CardHeader>
            <CardContent className="gap-3">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3.5 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === "rows") {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <Skeleton className="h-9 w-full max-w-64" />
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="mt-3 h-40 w-full rounded-card" />
    </div>
  )
}
