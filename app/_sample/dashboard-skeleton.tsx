"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Reference Sample · dashboard skeleton.
 *
 * ===========================================================================
 * Why this is not in `components/prototype/loading-state.tsx`
 * ===========================================================================
 * F5. `LoadingState`'s `cards` variant used to be exactly this: a hero block, a
 * 20rem/1fr split, and a **four-column metric strip** with dividers. It was
 * documented as a generic skeleton and was in fact one product's composition —
 * which is the kind of thing a new product inherits without deciding anything.
 *
 * "If it is sample-specific, the Sample owns it." So the shape lives here, next
 * to the two surfaces that actually have a hero and a metric strip, and Core's
 * `LoadingState` keeps only structure (rows, a section, and a count-driven card
 * grid with no fixed column count).
 *
 * The visual result is unchanged — this is the same markup in a different
 * place. What changed is who owns the assumption.
 */

/** 与 MetricStrip 相同的竖分隔线位置，保证骨架和真身对齐。 */
const METRIC_DIVIDERS = [
  "",
  "border-l",
  "border-t lg:border-t-0 lg:border-l",
  "border-t border-l lg:border-t-0",
]

/**
 * 骨架的价值在于"换上去的时候页面不动"，所以它的形状必须跟着真实构图走：
 * hero + 指标带。如果仍然画卡片墙，加载完成的那一刻整页会明显地重排一次，
 * 那比没有骨架更糟。
 */
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-9", className)}>
      <div className="flex flex-col gap-6 rounded-panel bg-surface/50 px-4 py-6 sm:px-6 sm:py-8">
        <Skeleton className="h-3 w-24" />
        <div className="grid gap-7 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-end">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-12 w-52" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <Skeleton className="h-[190px] w-full rounded-card sm:h-[210px]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-5 lg:grid-cols-4">
        {METRIC_DIVIDERS.map((divider, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col gap-2 border-hairline px-4 odd:pl-0 lg:px-6 lg:first:pl-0",
              divider
            )}
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
