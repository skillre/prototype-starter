"use client"

import { motion } from "motion/react"
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon, type LucideIcon } from "lucide-react"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedNumber, formatSeconds } from "@/components/motion/animated-number"
import { cn } from "@/lib/utils"
import { softSpring } from "@/lib/motion-presets"

type FormatKind = "currency" | "integer" | "percent" | "duration"

const FORMAT_OPTIONS: Record<FormatKind, Intl.NumberFormatOptions | null> = {
  currency: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  integer: { maximumFractionDigits: 0 },
  percent: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  duration: null,
}

type StatsCardProps = {
  label: string
  /** Animates from the previous value to this one. */
  value: number
  format?: FormatKind
  /** Signed percentage change, e.g. 12.4 or -0.4. */
  delta?: number
  /** Short hint under the delta, e.g. "vs last month". */
  deltaLabel?: string
  icon?: LucideIcon
  hint?: string
  loading?: boolean
  className?: string
  /** Lands on the KPI card — used by e2e tests. */
  testId?: string
}

/** KPI card with an animated number, delta chip and optional hint. */
export function StatsCard({
  label,
  value,
  format = "integer",
  delta,
  deltaLabel,
  icon: Icon,
  hint,
  loading = false,
  className,
  testId,
}: StatsCardProps) {
  // 布局占位同样带上 testId，避免加载态与就绪态出现两套选择器。
  if (loading) {
    return (
      <Card className={className} data-testid={testId}>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="gap-2.5">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    )
  }

  const deltaTone =
    delta === undefined ? "neutral" : delta >= 0 ? "positive" : "negative"
  const DeltaIcon =
    deltaTone === "positive"
      ? ArrowUpRightIcon
      : deltaTone === "negative"
        ? ArrowDownRightIcon
        : MinusIcon

  return (
    <motion.div
      className={className}
      whileHover={{ y: -3 }}
      transition={softSpring}
    >
      <Card size="sm" className="h-full" data-testid={testId}>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
          {Icon ? (
            <CardAction>
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-4" />
              </span>
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent className="gap-2.5">
          <div className="flex items-baseline gap-1.5">
            {format === "duration" ? (
              <AnimatedNumber
                value={value}
                formatValue={formatSeconds}
                className="text-title tracking-tight font-semibold"
              />
            ) : (
              <AnimatedNumber
                value={value}
                formatOptions={FORMAT_OPTIONS[format] ?? undefined}
                prefix={format === "currency" ? undefined : undefined}
                className="text-title tracking-tight font-semibold"
              />
            )}
            {format === "percent" ? <span className="text-lg font-medium">%</span> : null}
          </div>
          {delta !== undefined ? (
            <div className="flex items-center gap-1.5">
              <Badge
                className={cn(
                  "h-5 px-1.5 font-medium",
                  deltaTone === "positive" &&
                    "border-transparent bg-chart-3/15 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3",
                  deltaTone === "negative" &&
                    "border-transparent bg-chart-5/15 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5",
                  deltaTone === "neutral" && "border-transparent bg-muted text-muted-foreground"
                )}
              >
                <DeltaIcon className="size-3" />
                {delta > 0 ? "+" : ""}
                {delta}%
              </Badge>
              {deltaLabel ? (
                <span className="text-caption text-muted-foreground">{deltaLabel}</span>
              ) : null}
            </div>
          ) : hint ? (
            <span className="text-caption text-muted-foreground">{hint}</span>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  )
}