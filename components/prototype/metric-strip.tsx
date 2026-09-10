"use client"

import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react"
import { AnimatedNumber, formatSeconds } from "@/components/motion/animated-number"
import { formatCurrency, formatCurrencyCompact, formatNumber } from "@/lib/format"
import { durations } from "@/lib/motion-presets"
import { cn } from "@/lib/utils"

type FormatKind = "currency" | "currencyCompact" | "integer" | "percent" | "duration"

const FORMATTERS: Record<FormatKind, (value: number) => string> = {
  currency: (value) => formatCurrency(value),
  currencyCompact: (value) => formatCurrencyCompact(value),
  integer: (value) => formatNumber(value),
  percent: (value) => value.toFixed(1),
  duration: formatSeconds,
}

/**
 * 次级指标条。
 *
 * V2 的仪表盘是五张等宽 KPI 卡；那是"AI 生成 SaaS"最明显的信号：
 * 五块同样重的矩形 + 五条通栏 sparkline，视觉重量完全相同。
 *
 * V3 把它拆成两层——主指标升进 Hero（`text-metric`），其余指标降级成
 * 这一条**没有卡片、只有竖分隔线**的指标带：字号小一档（`text-metric-sm`），
 * 没有边框、没有阴影、没有背景，靠排版与 hairline 与页面融为一体。
 * 于是"哪个数字更重要"变成一眼可读，而不是需要逐张卡片去比。
 *
 * 顺序即重量：调用方按重要性排列，而不是按数据种类排列。
 */
export function MetricStrip({
  children,
  label,
  className,
}: {
  children: React.ReactNode
  /** 可选的眉标，画在整条指标带上方。 */
  label?: string
  className?: string
}) {
  const items = Array.isArray(children) ? children : [children]
  // 分隔线按位置决定：移动端 2×2 → 第 3 项补上边线；桌面 4 列 → 全部竖线。
  const dividers = [
    "",
    "border-l",
    "border-t lg:border-t-0 lg:border-l",
    "border-t border-l lg:border-t-0",
  ]

  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      {label ? (
        <span className="eyebrow text-muted-foreground/60">
          <span aria-hidden className="section-tick" />
          {label}
        </span>
      ) : null}
      <div className="grid grid-cols-2 gap-y-5 lg:grid-cols-4">
        {items.map((child, index) => (
          <div
            key={index}
            className={cn(
              "flex min-w-0 flex-col gap-1.5 border-hairline px-4 odd:pl-0 lg:px-6 lg:first:pl-0",
              dividers[index]
            )}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

type MetricItemProps = {
  label: string
  value: number
  format?: FormatKind
  /** 有符号百分比，例如 18.2 / -0.4。 */
  delta?: number
  deltaLabel?: string
  /** 无 delta 时展示的说明文案。 */
  hint?: string
  /** 传了才成为真实的按钮；没有目的地的指标保持纯展示。 */
  onActivate?: () => void
  activateLabel?: string
  testId?: string
  className?: string
}

/** 指标带里的单个指标。字号固定 `text-metric-sm`——层级由位置决定。 */
export function MetricItem({
  label,
  value,
  format = "integer",
  delta,
  deltaLabel,
  hint,
  onActivate,
  activateLabel,
  testId,
  className,
}: MetricItemProps) {
  const deltaTone = delta === undefined ? "none" : delta >= 0 ? "positive" : "negative"
  const DeltaIcon =
    deltaTone === "positive"
      ? ArrowUpRightIcon
      : deltaTone === "negative"
        ? ArrowDownRightIcon
        : MinusIcon

  const body = (
    <>
      <span className="eyebrow truncate text-muted-foreground/70">{label}</span>

      <span className="flex items-baseline gap-0.5">
        <AnimatedNumber
          value={value}
          duration={durations.slow}
          formatValue={FORMATTERS[format]}
          /* 纯数字才吃负字距：时长（"4分38秒"）里带中文量词，
             负 tracking 会把中文压紧——中文不该借用数字的紧缩。 */
          className={cn("text-metric-sm", format === "duration" ? "tracking-normal" : "numeric")}
        />
        {format === "percent" ? (
          <span className="text-body font-medium text-muted-foreground">%</span>
        ) : null}
      </span>

      <span className="flex min-w-0 items-center gap-1.5">
        {delta !== undefined ? (
          <>
            <span
              className={cn(
                "numeric inline-flex items-center gap-0.5 text-label font-medium",
                deltaTone === "positive" && "text-success",
                deltaTone === "negative" && "text-danger"
              )}
            >
              <DeltaIcon className="size-3" />
              {delta > 0 ? "+" : ""}
              {delta}%
            </span>
            {deltaLabel ? (
              <span className="truncate text-label text-muted-foreground">{deltaLabel}</span>
            ) : null}
          </>
        ) : hint ? (
          <span className="truncate text-label text-muted-foreground">{hint}</span>
        ) : null}
      </span>
    </>
  )

  if (!onActivate) {
    return <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>{body}</div>
  }

  return (
    <button
      type="button"
      onClick={onActivate}
      aria-label={activateLabel ?? label}
      data-testid={testId}
      className={cn(
        "group/metric flex min-w-0 cursor-pointer flex-col gap-1.5 rounded-field text-left outline-none",
        "transition-colors duration-hover ease-standard",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      {body}
    </button>
  )
}
