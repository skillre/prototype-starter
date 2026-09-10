"use client"

import { AnimatePresence, motion } from "motion/react"
import { RefreshCwIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { durations, easings } from "@/lib/motion-presets"
import type { AiSummary } from "@/lib/ai-summary"
import { cn } from "@/lib/utils"

export type AiSummaryStatus = "idle" | "loading" | "ready" | "error"

type AiSummaryPanelProps = {
  status: AiSummaryStatus
  summary: AiSummary | null
  onGenerate: () => void
  className?: string
  testId?: string
}

/**
 * 客户详情里的 AI 摘要区块：idle → loading（骨架屏）→ ready（结果淡入）。
 * 结果是确定性 mock（见 lib/ai-summary.ts），可反复重新生成。
 */
export function AiSummaryPanel({
  status,
  summary,
  onGenerate,
  className,
  testId,
}: AiSummaryPanelProps) {
  const loading = status === "loading"

  return (
    <section
      data-testid={testId}
      aria-labelledby="ai-summary-heading"
      className={cn(
        "flex flex-col gap-3 rounded-card border bg-muted/30 p-gutter",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3
            id="ai-summary-heading"
            className="flex items-center gap-1.5 text-sm font-semibold"
          >
            <SparklesIcon className="size-4 text-chart-2" />
            AI Summary
          </h3>
          <p className="text-caption text-muted-foreground">
            Deterministic summary derived from this record — no external API.
          </p>
        </div>

        {status !== "idle" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={loading}
            data-testid={testId ? `${testId}-regenerate` : undefined}
          >
            <RefreshCwIcon className={cn(loading && "animate-spin")} />
            {loading ? "Generating" : "Regenerate"}
          </Button>
        ) : null}
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {status === "idle" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durations.fast, ease: easings.standard }}
            className="flex flex-col items-start gap-2"
          >
            <p className="text-sm text-muted-foreground">
              No summary yet. Generate a brief from this account&rsquo;s stage, value and engagement history.
            </p>
            <Button type="button" size="sm" onClick={onGenerate} data-testid={testId ? `${testId}-generate` : undefined}>
              <SparklesIcon />
              Generate AI Summary
            </Button>
          </motion.div>
        ) : null}

        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durations.fast, ease: easings.standard }}
            className="flex flex-col gap-2.5"
            role="status"
            aria-live="polite"
          >
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-3/5" />
            <span className="sr-only">Generating summary…</span>
          </motion.div>
        ) : null}

        {status === "ready" && summary ? (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durations.normal, ease: easings.outExpo }}
            className="flex flex-col gap-3"
          >
            <p className="text-sm leading-relaxed font-medium">{summary.headline}</p>

            <ul className="flex flex-col gap-1.5">
              {summary.signals.map((signal) => (
                <li key={signal} className="flex gap-2 text-caption text-muted-foreground">
                  <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-chart-2" />
                  <span className="leading-relaxed">{signal}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-field border bg-background/70 p-2.5">
              <span className="text-label text-muted-foreground">Recommended next step</span>
              <p className="mt-0.5 text-caption leading-relaxed">{summary.nextStep}</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-muted-foreground">
              <span>Confidence {summary.confidence}%</span>
              <span aria-hidden>·</span>
              <span className="font-mono">{summary.model}</span>
            </div>
          </motion.div>
        ) : null}

        {status === "error" ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durations.fast, ease: easings.standard }}
            className="flex items-center gap-2 text-caption text-destructive"
          >
            <TriangleAlertIcon className="size-4 shrink-0" />
            Generation failed. Please try again.
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
