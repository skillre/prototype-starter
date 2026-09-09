"use client"

import { TriangleAlertIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScaleIn } from "@/components/motion/scale-in"
import { cn } from "@/lib/utils"

type ErrorStateProps = {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

/** Full-surface error state. `onRetry` must actually recover (demo re-runs its loader). */
export function ErrorState({
  title = "数据加载失败",
  description,
  onRetry,
  retryLabel = "重试",
  className,
}: ErrorStateProps) {
  return (
    <ScaleIn
      from={0.97}
      duration={0.25}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-destructive/40 bg-destructive/5 px-6 py-16 text-center",
        className
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-5" />
      </span>
      <span className="text-base font-medium">{title}</span>
      {description ? (
        <span className="max-w-md font-mono text-xs text-muted-foreground">{description}</span>
      ) : null}
      {onRetry ? (
        <Button onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      ) : null}
    </ScaleIn>
  )
}