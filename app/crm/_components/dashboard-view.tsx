"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ArrowRightIcon, ArrowUpRightIcon, SparklesIcon } from "lucide-react"
import { OpenSection } from "@/components/prototype/open-section"
import { SectionHeading } from "@/components/prototype/section-heading"
import { MetricItem, MetricStrip } from "@/components/prototype/metric-strip"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  PIPELINE_SERIES,
  STAGE_COLORS,
  STATUS_META,
  STATUS_ORDER,
  TASK_COLUMNS,
  type CustomerStatus,
  type PipelinePoint,
} from "@/lib/crm-data"
import { selectKpis, selectStageBreakdown, useCrmStore } from "@/stores/crm-store"
import { formatCurrency, formatCurrencyCompact, formatDateShort, formatRelativeHours, personInitials } from "@/lib/format"
import { groupActivitiesByDay } from "@/lib/activity-groups"
import { durations, easings } from "@/lib/motion-presets"
import { useMessages } from "@/components/i18n/locale-provider"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

type DashboardViewProps = {
  onOpenCustomer: (customerId: string) => void
  onGoToTasks: () => void
  /** KPI 下钻：进入客户列表并按状态预筛选。 */
  onGoToCustomers: (filter?: { status?: CustomerStatus }) => void
}

/** 统计区间——真实切换图表数据，并重放走势绘制动画。 */
type RangeKey = 12 | 6 | 3
const RANGES: RangeKey[] = [12, 6, 3]

/**
 * 仪表盘。
 *
 * V3 的构图原则：**一层只能有一个主角**。
 *   Hero      —— 合同总额（`text-metric`）+ 大型走势图，页面唯一的第一视觉焦点
 *   指标带     —— 四个次级指标，只有排版与竖分隔线，没有卡片
 *   主数据区   —— 阶段分布 / 负责人业绩（58 : 42，非对称）
 *   支撑区     —— 动态与任务（58 : 42）
 *   清单       —— 高价值客户，开放式数据列表
 *
 * 全页只有 Hero 使用 ambient 光效；其余区块靠留白、hairline 与字号层次
 * 建立结构。没有一处用 Card 包裹——需要 elevation 的只有浮层。
 */
export function DashboardView({ onOpenCustomer, onGoToTasks, onGoToCustomers }: DashboardViewProps) {
  const t = useMessages()
  const customers = useCrmStore((s) => s.customers)
  const activities = useCrmStore((s) => s.activities)
  const tasks = useCrmStore((s) => s.tasks)

  const [range, setRange] = useState<RangeKey>(12)

  const kpis = useMemo(() => selectKpis(customers), [customers])
  const stageBreakdown = useMemo(() => selectStageBreakdown(customers), [customers])

  /* ---- Hero ------------------------------------------------------------- */

  const trend = useMemo<PipelinePoint[]>(
    () => PIPELINE_SERIES.slice(Math.max(0, PIPELINE_SERIES.length - range)),
    [range]
  )
  const latest = trend[trend.length - 1]
  const coverage = latest && latest.won > 0 ? latest.pipeline / latest.won : 0

  /* ---- 阶段分布：按金额决定条长，按数量做注解 --------------------------- */

  const stageValue = useMemo(() => {
    const map = new Map<CustomerStatus, number>()
    for (const status of STATUS_ORDER) map.set(status, 0)
    for (const customer of customers) {
      if (customer.status === "churned") continue
      map.set(customer.status, (map.get(customer.status) ?? 0) + customer.value)
    }
    return map
  }, [customers])

  const maxStageValue = useMemo(
    () => Math.max(1, ...STATUS_ORDER.map((status) => stageValue.get(status) ?? 0)),
    [stageValue]
  )

  /* ---- 负责人业绩 ------------------------------------------------------- */

  const ownerStats = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>()
    for (const customer of customers) {
      const entry = map.get(customer.owner) ?? { count: 0, value: 0 }
      entry.count += 1
      if (customer.status !== "churned") entry.value += customer.value
      map.set(customer.owner, entry)
    }
    return [...map.entries()]
      .map(([owner, stats]) => ({ owner, ...stats }))
      .sort((a, b) => b.value - a.value)
  }, [customers])

  const maxOwnerValue = useMemo(
    () => Math.max(1, ...ownerStats.map((owner) => owner.value)),
    [ownerStats]
  )

  /* ---- 最近动态：开放时间线，并按真实时间戳分组 ------------------------- */

  const activityGroups = useMemo(() => {
    const sorted = [...activities].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 7)
    return groupActivitiesByDay(sorted).map((group) => ({
      ...group,
      items: group.items.map((event) => ({
        ...event,
        company: customers.find((c) => c.id === event.customerId)?.company ?? t.common.notAvailable,
      })),
    }))
  }, [activities, customers, t])

  /* ---- 任务：按到期时间排序的优先队列 ----------------------------------- */

  const openTasks = useMemo(
    () =>
      TASK_COLUMNS.map((column) => ({
        column,
        meta: t.tasks.columns[column.id],
        items: tasks[column.id] ?? [],
      })),
    [tasks, t]
  )

  const taskQueue = useMemo(
    () =>
      openTasks
        .flatMap(({ column, meta, items }) => items.map((task) => ({ task, column, meta })))
        .sort((a, b) => a.task.due.localeCompare(b.task.due))
        .slice(0, 5),
    [openTasks]
  )

  const totalOpen = openTasks.reduce((sum, group) => sum + group.items.length, 0)
  const dueThisWeek = openTasks
    .flatMap((group) => group.items)
    .filter((task) => task.due <= "2026-09-14").length

  const topAccounts = useMemo(
    () => [...customers].sort((a, b) => b.value - a.value).slice(0, 5),
    [customers]
  )

  return (
    <div className="flex flex-col gap-9 sm:gap-11">
      {/* ================================================================ */}
      {/* HERO —— 页面唯一的第一视觉焦点                                   */}
      {/* ================================================================ */}
      <OpenSection
        ambient="hero"
        className="-mx-4 sm:-mx-6"
        contentClassName="flex flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <span className="eyebrow text-muted-foreground/60">
            <span aria-hidden className="section-tick" />
            {t.dashboard.hero.sectionLabel}
          </span>

          {/* 统计区间：真实切换数据，并重放走势绘制动画。 */}
          <div
            role="group"
            aria-label={t.dashboard.hero.rangeLabel}
            className="inline-flex items-center gap-0.5 rounded-field border border-border/60 bg-surface/70 p-0.5"
          >
            {RANGES.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={range === value}
                onClick={() => setRange(value)}
                data-testid={`hero-range-${value}`}
                className={cn(
                  "h-7 cursor-pointer rounded-[7px] px-2.5 text-label font-medium tabular-nums transition-colors duration-hover ease-standard outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  range === value
                    ? "bg-brand text-brand-foreground shadow-subtle"
                    : "text-muted-foreground hover:bg-interactive hover:text-foreground"
                )}
              >
                {t.dashboard.hero.range[`m${value}`]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-end lg:gap-10">
          {/* 主指标 */}
          <div className="flex flex-col gap-3" data-testid="kpi-revenue">
            <span className="eyebrow text-muted-foreground/70">{t.dashboard.kpi.revenue}</span>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <HeroNumber value={kpis.revenue} />
              <span className="inline-flex items-center gap-1 text-body font-medium text-success">
                <ArrowUpRightIcon className="size-4" />
                <span className="numeric">+9.6%</span>
                <span className="text-label font-normal text-muted-foreground">
                  {t.dashboard.kpi.vsLastMonth}
                </span>
              </span>
            </div>

            <p className="text-body-sm text-muted-foreground">{t.page.dashboard.description}</p>

            <button
              type="button"
              onClick={onGoToTasks}
              aria-label={t.dashboard.kpi.viewSignedTasks}
              data-testid="kpi-revenue-action"
              className="group/cta inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-field py-1 text-body-sm font-medium text-brand outline-none transition-colors duration-hover hover:text-brand/80 focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {t.dashboard.hero.action}
              <ArrowRightIcon className="size-3.5 transition-transform duration-hover group-hover/cta:translate-x-0.5" />
            </button>
          </div>

          {/* 走势图 */}
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-body font-semibold">{t.dashboard.pipeline.title}</span>
              <span className="text-label text-muted-foreground">
                {t.dashboard.pipeline.description}
              </span>
            </div>

            <div
              className="h-[190px] w-full sm:h-[210px]"
              role="img"
              aria-label={t.dashboard.hero.chartLabel}
            >
              <HeroChart data={trend} rangeKey={range} />
            </div>
          </div>
        </div>

        {/* 事实行：Hero 的落款，不是另一组卡片 */}
        <dl className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-hairline pt-4">
          <HeroFact
            label={t.dashboard.pipeline.won}
            value={formatCurrencyCompact(latest?.won ?? 0)}
          />
          <HeroFact
            label={t.dashboard.pipeline.pipeline}
            value={formatCurrencyCompact(latest?.pipeline ?? 0)}
          />
          <HeroFact
            label={t.dashboard.hero.coverage}
            value={t.dashboard.hero.coverageValue(coverage.toFixed(1))}
            hint={t.dashboard.hero.coverageHint}
          />

          <div className="ml-auto flex items-center gap-2">
            <span className="relative flex size-2 shrink-0 items-center justify-center">
              <span
                aria-hidden
                className="absolute size-2 rounded-full bg-success/35 [animation:live-halo_3.2s_ease-out_infinite]"
              />
              <span className="relative size-1.5 rounded-full bg-success" />
            </span>
            <span className="text-label font-medium">{t.dashboard.hero.live}</span>
            <span className="hidden text-label text-muted-foreground sm:inline">
              {t.dashboard.hero.liveHint}
            </span>
          </div>
        </dl>
      </OpenSection>

      {/* ================================================================ */}
      {/* 次级指标 —— 没有卡片，只有排版与竖分隔线                          */}
      {/* ================================================================ */}
      <MetricStrip label={t.dashboard.metrics.sectionLabel}>
        <MetricItem
          label={t.dashboard.kpi.totalCustomers}
          value={kpis.totalCustomers}
          hint={t.dashboard.metrics.cumulativeHint}
          testId="kpi-total-customers"
          activateLabel={t.dashboard.kpi.viewAllCustomers}
          onActivate={() => onGoToCustomers()}
        />
        <MetricItem
          label={t.dashboard.kpi.newThisMonth}
          value={kpis.newThisMonth}
          delta={18.2}
          deltaLabel={t.dashboard.kpi.vsLastMonth}
          testId="kpi-new-this-month"
          activateLabel={t.dashboard.kpi.viewAllCustomers}
          onActivate={() => onGoToCustomers()}
        />
        <MetricItem
          label={t.dashboard.kpi.activeDeals}
          value={kpis.activeDeals}
          hint={t.dashboard.kpi.viewOpenLeads}
          testId="kpi-active-deals"
          activateLabel={t.dashboard.kpi.viewOpenLeads}
          onActivate={() => onGoToCustomers({ status: "lead" })}
        />
        <MetricItem
          label={t.dashboard.kpi.conversionRate}
          value={kpis.conversionRate}
          format="percent"
          delta={2.1}
          deltaLabel={t.dashboard.kpi.closedWonShare}
          testId="kpi-conversion-rate"
          activateLabel={t.dashboard.kpi.viewActive}
          onActivate={() => onGoToCustomers({ status: "active" })}
        />
      </MetricStrip>

      {/* ================================================================ */}
      {/* 主数据区 58 / 42                                                 */}
      {/* ================================================================ */}
      <div className="grid gap-9 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-10">
        {/* 阶段分布 */}
        <section className="flex min-w-0 flex-col gap-4">
          <SectionHeading
            title={t.dashboard.stage.title}
            description={t.dashboard.stage.description}
          />

          <ul className="flex flex-col" data-testid="stage-breakdown">
            {stageBreakdown.map(({ status, count }) => {
              const value = stageValue.get(status) ?? 0
              const meta = STATUS_META[status]
              const width = value === 0 ? 0 : Math.max(2, (value / maxStageValue) * 100)

              return (
                <li key={status}>
                  <button
                    type="button"
                    onClick={() => onGoToCustomers({ status })}
                    aria-label={t.dashboard.stage.drilldown(t.status[status])}
                    className="group/stage flex w-full cursor-pointer items-center gap-3 rounded-field border-b border-hairline py-3 text-left outline-none transition-colors duration-hover ease-standard last:border-b-0 hover:bg-brand-soft/35 focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <span className="flex w-24 shrink-0 items-center gap-2">
                      <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
                      <span className="truncate text-body-sm font-medium">{t.status[status]}</span>
                    </span>

                    <span className="relative hidden h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-border/70 sm:block">
                      <motion.span
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ background: STAGE_COLORS[status] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: durations.slow, ease: easings.outExpo }}
                      />
                    </span>

                    <span className="numeric w-20 shrink-0 text-right text-body-sm font-semibold sm:w-24">
                      {value > 0 ? formatCurrencyCompact(value) : t.common.notAvailable}
                    </span>

                    <span className="numeric w-14 shrink-0 text-right text-label text-muted-foreground">
                      {t.dashboard.stage.countUnit(count)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        {/* 负责人业绩 */}
        <section className="flex min-w-0 flex-col gap-4">
          <SectionHeading
            eyebrow={t.dashboard.owners.sectionLabel}
            title={t.dashboard.owners.title}
            description={t.dashboard.owners.description}
          />

          <ul className="flex flex-col gap-3.5">
            {ownerStats.map((owner) => (
              <li key={owner.owner} className="flex items-center gap-3">
                <Avatar size="sm" className="size-7 shrink-0">
                  <AvatarFallback className="bg-brand-soft text-brand">
                    {personInitials(owner.owner, 1)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-body-sm font-medium">{owner.owner}</span>
                    <span className="numeric shrink-0 text-body-sm font-semibold">
                      {formatCurrencyCompact(owner.value)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="relative h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-border/60">
                      <motion.span
                        className="absolute inset-y-0 left-0 rounded-full bg-brand"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(3, (owner.value / maxOwnerValue) * 100)}%` }}
                        transition={{ duration: durations.slow, ease: easings.outExpo, delay: 0.06 }}
                      />
                    </span>
                    <span className="numeric shrink-0 text-label text-muted-foreground">
                      {t.dashboard.owners.deals(owner.count)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ================================================================ */}
      {/* 动态 / 任务 58 / 42 —— 一个是时间线，一个是优先队列             */}
      {/* ================================================================ */}
      <div className="grid gap-9 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-10">
        {/* 最近动态：开放时间线，按天分组 */}
        <section className="flex min-w-0 flex-col gap-4">
          <SectionHeading
            title={t.dashboard.recentActivity.title}
            description={t.dashboard.recentActivity.description}
          />

          <div className="flex flex-col gap-4">
            {activityGroups.map((group) => (
              <div key={group.key} className="flex flex-col gap-1">
                <span className="eyebrow pb-1 text-muted-foreground/50">
                  {t.common.activityGroups[group.key]}
                </span>

                <ul className="flex flex-col">
                  {group.items.map((event, index) => (
                    <li key={event.id} className="relative">
                      {/* 时间线导轨：只在组内相邻条目之间绘制。 */}
                      {index < group.items.length - 1 ? (
                        <span
                          aria-hidden
                          className="absolute top-6 left-[9px] h-[calc(100%-0.5rem)] w-px bg-muted-foreground/20"
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={() => onOpenCustomer(event.customerId)}
                        aria-label={t.dashboard.recentActivity.open(event.company, event.title)}
                        className="group/row relative flex w-full cursor-pointer items-start gap-3 rounded-field py-2 pr-2 pl-0 text-left outline-none transition-colors duration-hover ease-standard hover:bg-brand-soft/35 focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="relative z-10 mt-1 flex size-[19px] shrink-0 items-center justify-center rounded-full border border-border/70 bg-surface text-[7px] font-semibold text-muted-foreground transition-colors duration-hover group-hover/row:border-brand/40 group-hover/row:bg-brand-soft group-hover/row:text-brand">
                          {personInitials(event.actor, 1)}
                        </span>

                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-body-sm font-medium">{event.title}</span>
                          <span className="truncate text-label text-muted-foreground">
                            {event.company} · {event.actor} · {event.time}
                          </span>
                        </span>

                        <ArrowUpRightIcon className="mt-1.5 size-3.5 shrink-0 text-muted-foreground/0 transition-all duration-hover group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-brand" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 任务总览：按到期时间的优先队列 */}
        <section className="flex min-w-0 flex-col gap-4">
          <SectionHeading
            title={t.dashboard.tasksOverview.title}
            description={t.dashboard.tasksOverview.summary(totalOpen, dueThisWeek)}
            action={
              <Button type="button" variant="outline" size="sm" onClick={onGoToTasks}>
                {t.dashboard.tasksOverview.openBoard}
              </Button>
            }
          />

          <ul className="flex flex-col" data-testid="task-queue">
            {taskQueue.map(({ task, meta }) => {
              const overdue = task.due < "2026-09-10"
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={onGoToTasks}
                    aria-label={t.dashboard.tasksOverview.openColumn(meta.title)}
                    className="group/task flex w-full cursor-pointer items-center gap-3 border-b border-hairline py-2.5 text-left outline-none transition-colors duration-hover ease-standard last:border-b-0 hover:bg-brand-soft/35 focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <span
                      className={cn(
                        "numeric w-16 shrink-0 text-label font-medium whitespace-nowrap",
                        overdue ? "text-warning" : "text-muted-foreground"
                      )}
                    >
                      {formatDateShort(task.due)}
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate text-body-sm font-medium">{task.title}</span>
                      <span className="flex items-center gap-2">
                        <span className="relative h-0.5 w-12 shrink-0 overflow-hidden rounded-full bg-border/70">
                          <span
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full",
                              overdue ? "bg-warning" : "bg-brand"
                            )}
                            style={{ width: `${task.progress}%` }}
                          />
                        </span>
                        <span className="truncate text-label text-muted-foreground">
                          {task.company}
                        </span>
                      </span>
                    </span>

                    <Badge
                      variant="outline"
                      className="hidden shrink-0 text-label font-normal text-muted-foreground sm:inline-flex"
                    >
                      {meta.title}
                    </Badge>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* 洞察块：品牌左轨 + 排版，不是又一个色块 */}
          <div className="mt-1 flex items-start gap-3 border-l-2 border-brand/45 pl-3.5">
            <SparklesIcon className="mt-0.5 size-3.5 shrink-0 text-brand" />
            <p className="text-caption text-pretty text-muted-foreground">
              {t.dashboard.tasksOverview.insight(dueThisWeek, t.tasks.columns["follow-up"].title)}
            </p>
          </div>
        </section>
      </div>

      {/* ================================================================ */}
      {/* 高价值客户 —— 开放式数据列表                                     */}
      {/* ================================================================ */}
      <section className="flex min-w-0 flex-col gap-4">
        <SectionHeading
          title={t.dashboard.accounts.title}
          description={t.dashboard.accounts.description}
          action={
            <span className="numeric text-label text-muted-foreground">
              {t.dashboard.accounts.showingTop(topAccounts.length, customers.length)}
            </span>
          }
        />

        <div className="flex flex-col">
          {/* 表头：与数据行同栅格，才能看出这是一张表而不是一叠行。 */}
          <div className="hidden grid-cols-[minmax(0,1fr)_8rem_7rem_6rem_7rem] items-center gap-4 border-b border-hairline pb-2.5 lg:grid">
            <span className="eyebrow text-muted-foreground/50">
              {t.dashboard.accounts.columns.account}
            </span>
            <span className="eyebrow text-muted-foreground/50">
              {t.dashboard.accounts.columns.owner}
            </span>
            <span className="eyebrow text-muted-foreground/50">
              {t.dashboard.accounts.columns.status}
            </span>
            <span className="eyebrow text-muted-foreground/50">
              {t.dashboard.accounts.columns.touch}
            </span>
            <span className="eyebrow text-right text-muted-foreground/50">
              {t.dashboard.accounts.columns.value}
            </span>
          </div>

          <ul className="flex flex-col">
            {topAccounts.map((customer) => {
              const meta = STATUS_META[customer.status]
              const value = customer.value > 0 ? formatCurrencyCompact(customer.value) : t.common.notAvailable
              return (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => onOpenCustomer(customer.id)}
                    aria-label={t.dashboard.accounts.open(customer.company, value)}
                    className={cn(
                      "group/acct relative grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-hairline py-3.5 pr-1 pl-3 text-left outline-none transition-colors duration-hover ease-standard last:border-b-0 hover:bg-brand-soft/35 focus-visible:ring-2 focus-visible:ring-ring/50",
                      "lg:grid-cols-[minmax(0,1fr)_8rem_7rem_6rem_7rem] lg:pl-4"
                    )}
                  >
                    {/* hover 左轨：把整行变成一个目标，而不是加一层边框 */}
                    <span
                      aria-hidden
                      className="absolute inset-y-1.5 left-0 w-[2px] origin-center scale-y-0 rounded-r-full bg-brand transition-transform duration-hover ease-standard group-hover/acct:scale-y-100"
                    />

                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar size="sm" className="size-8 shrink-0">
                        <AvatarFallback>{personInitials(customer.name, 1)}</AvatarFallback>
                      </Avatar>
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate text-body font-semibold">
                          {customer.company}
                        </span>
                        <span className="truncate text-label text-muted-foreground">
                          {customer.name} · {customer.title}
                        </span>
                      </span>
                    </span>

                    <span className="hidden min-w-0 items-center gap-2 lg:flex">
                      <Avatar size="sm" className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {personInitials(customer.owner, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-body-sm text-muted-foreground">
                        {customer.owner}
                      </span>
                    </span>

                    <span className="hidden items-center gap-1.5 lg:flex">
                      <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
                      <span className={cn("truncate text-body-sm", meta.text)}>
                        {t.status[customer.status]}
                      </span>
                    </span>

                    <span className="hidden numeric text-body-sm whitespace-nowrap text-muted-foreground lg:block">
                      {formatRelativeHours(customer.lastTouchHours)}
                    </span>

                    <span className="numeric text-right text-subtitle font-semibold">
                      {value}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Hero 局部组件                                                               */
/* -------------------------------------------------------------------------- */

/** 主数字：全页最大的排版元素，由 AnimatedNumber 计数到目标值。 */
function HeroNumber({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.enter, ease: easings.outExpo }}
      className="numeric text-metric"
    >
      <AnimatedNumber
        value={value}
        duration={durations.glacial}
        formatValue={formatCurrencyCompact}
      />
    </motion.span>
  )
}

function HeroFact({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="eyebrow text-muted-foreground/55">{label}</dt>
      <dd className="flex items-baseline gap-2">
        <span className="numeric text-subtitle font-semibold">{value}</span>
        {hint ? <span className="text-label text-muted-foreground">{hint}</span> : null}
      </dd>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Hero 走势图                                                                 */
/* -------------------------------------------------------------------------- */

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--elevated)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-card)",
  boxShadow: "var(--elevation-floating)",
  padding: "10px 12px",
}

/**
 * 近 12/6/3 个月已签约金额与在谈管道。
 *
 * 与"组件库默认图表"的区别全部在这里：品牌渐变填充、只在横轴留虚线网格、
 * 品牌色光标线、悬停时才出现的活动点、自定义读数面板（含覆盖倍数），
 * 以及区间切换时重放一次 900ms 的绘制动画。
 */
function HeroChart({ data, rangeKey }: { data: PipelinePoint[]; rangeKey: number }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        key={rangeKey}
        data={data}
        margin={{ top: 14, right: 6, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="hero-won-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
            <stop offset="48%" stopColor="var(--chart-1)" stopOpacity={0.13} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="2 6"
          stroke="var(--border)"
          vertical={false}
          opacity={0.6}
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickMargin={9}
          interval="preserveStartEnd"
          minTickGap={14}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          tickFormatter={(value: number) => formatCurrencyCompact(value)}
          width={50}
          /* 收紧上界并取整洁刻度：默认会顶到 ¥600万，让两条曲线挤在下半屏，
             大片空白反而削弱了"数字是主角"的构图。 */
          domain={[0, niceCeiling(Math.max(...data.map((point) => point.pipeline)))]}
          tickCount={4}
        />

        <Tooltip
          content={<HeroReadout />}
          contentStyle={TOOLTIP_STYLE}
          cursor={{ stroke: "var(--brand)", strokeWidth: 1, strokeDasharray: "3 4" }}
        />

        {/* 在谈管道：虚线 + 品牌青，作为"潜力"的参照系 */}
        <Area
          type="monotone"
          dataKey="pipeline"
          stroke="var(--data-accent)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="transparent"
          dot={false}
          activeDot={{ r: 3, fill: "var(--data-accent)", strokeWidth: 0 }}
          animationDuration={durations.glacial * 1000}
          animationEasing="ease-out"
        />

        {/* 已签约：实线 + 品牌渐变 + 唯一的一处光晕 */}
        <Area
          type="monotone"
          dataKey="won"
          stroke="var(--chart-1)"
          strokeWidth={2}
          className="chart-glow"
          fill="url(#hero-won-fill)"
          dot={false}
          activeDot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--surface)", strokeWidth: 2 }}
          animationDuration={durations.glacial * 1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/**
 * 取一个"整洁"的 Y 轴上界：1.5 的倍数（¥150万 一档），并且刚好包住峰值。
 * 刻意**不加**额外余量——加了余量就会跳到下一档（438万 → 600万），
 * 两条曲线被压到下半屏，Hero 反而空了一半。顶部留白交给 margin 处理。
 */
function niceCeiling(max: number): number {
  const step = 1_500_000
  return Math.max(step, Math.ceil(max / step) * step)
}

/** 悬停读数：月名 + 两个序列 + 覆盖倍数。 */
function HeroReadout({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name?: string; value?: number }[]
  label?: string
}) {
  const t = useMessages()
  if (!active || !payload?.length) return null

  const won = payload.find((entry) => entry.name === "won")?.value ?? 0
  const pipeline = payload.find((entry) => entry.name === "pipeline")?.value ?? 0

  return (
    <div className="rounded-card border border-border/70 bg-elevated px-3 py-2.5 shadow-floating">
      <p className="eyebrow pb-1.5 text-muted-foreground/60">
        {t.dashboard.hero.reading(label ?? "")}
      </p>
      <div className="flex flex-col gap-1">
        <ReadoutRow color="var(--chart-1)" label={t.dashboard.pipeline.won} value={won} />
        <ReadoutRow
          color="var(--data-accent)"
          label={t.dashboard.pipeline.pipeline}
          value={pipeline}
          dashed
        />
      </div>
      <p className="mt-2 border-t border-hairline pt-1.5 text-label text-muted-foreground">
        {t.dashboard.hero.coverage}
        <span className="numeric ml-1.5 font-medium text-foreground">
          {t.dashboard.hero.coverageValue(won > 0 ? (pipeline / won).toFixed(1) : "—")}
        </span>
      </p>
    </div>
  )
}

function ReadoutRow({
  color,
  label,
  value,
  dashed = false,
}: {
  color: string
  label: string
  value: number
  dashed?: boolean
}) {
  return (
    <span className="flex items-baseline gap-2 text-body-sm">
      <span
        aria-hidden
        className={cn("mt-2 h-0 w-3 shrink-0 border-t-2", dashed && "border-dashed")}
        style={{ borderColor: color }}
      />
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="numeric font-medium">{formatCurrency(value)}</span>
    </span>
  )
}
