"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  ListChecksIcon,
  PercentIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import { StatsCard, type StatsTone } from "@/components/prototype/stats-card"
import { ChartCard } from "@/components/prototype/chart-card"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StaggerContainer } from "@/components/motion/stagger-container"
import {
  PIPELINE_SERIES,
  STAGE_COLORS,
  STATUS_META,
  TASK_COLUMNS,
  personInitials,
  type CustomerStatus,
} from "@/lib/crm-data"
import { selectKpis, selectMonthlySeries, useCrmStore } from "@/stores/crm-store"
import { formatCurrency, formatCurrencyCompact } from "@/lib/format"
import { durations } from "@/lib/motion-presets"
import { useMessages } from "@/components/i18n/locale-provider"
import { cn } from "@/lib/utils"

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--elevated)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-card)",
  fontSize: 12,
  boxShadow: "var(--elevation-floating)",
  padding: "8px 10px",
}

type DashboardViewProps = {
  onOpenCustomer: (customerId: string) => void
  onGoToTasks: () => void
  /** KPI 下钻：进入客户列表并按状态预筛选。 */
  onGoToCustomers: (filter?: { status?: CustomerStatus }) => void
}

export function DashboardView({ onOpenCustomer, onGoToTasks, onGoToCustomers }: DashboardViewProps) {
  const t = useMessages()
  const customers = useCrmStore((s) => s.customers)
  const activities = useCrmStore((s) => s.activities)
  const tasks = useCrmStore((s) => s.tasks)

  const kpis = useMemo(() => selectKpis(customers), [customers])
  // 迷你走势全部由真实客户数据派生，不是装饰曲线。
  const series = useMemo(() => selectMonthlySeries(customers), [customers])

  const stageData = useMemo(
    () =>
      (Object.keys(STAGE_COLORS) as (keyof typeof STAGE_COLORS)[])
        .map((status) => ({
          name: t.status[status],
          value: customers.filter((c) => c.status === status).length,
          color: STAGE_COLORS[status],
        }))
        .filter((slice) => slice.value > 0),
    [customers, t]
  )

  const recent = useMemo(
    () =>
      [...activities]
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 6)
        .map((activity) => ({
          ...activity,
          company: customers.find((c) => c.id === activity.customerId)?.company ?? t.common.notAvailable,
        })),
    [activities, customers, t]
  )

  const openTasks = useMemo(
    () =>
      TASK_COLUMNS.map((column) => ({
        column,
        meta: t.tasks.columns[column.id],
        items: tasks[column.id] ?? [],
      })),
    [tasks, t]
  )

  const totalOpen = openTasks.reduce((sum, group) => sum + group.items.length, 0)
  const dueThisWeek = openTasks
    .flatMap((group) => group.items)
    .filter((task) => task.due <= "2026-09-14").length

  const topAccounts = useMemo(
    () => [...customers].sort((a, b) => b.value - a.value).slice(0, 5),
    [customers]
  )

  const kpiDefs: {
    key: string
    label: string
    value: number
    format?: "currency" | "currencyCompact" | "integer" | "percent"
    delta?: number
    deltaLabel?: string
    hint?: string
    tone: StatsTone
    trend: number[]
    onActivate: () => void
    activateLabel: string
  }[] = [
    {
      key: "kpi-total-customers",
      label: t.dashboard.kpi.totalCustomers,
      value: kpis.totalCustomers,
      hint: t.dashboard.kpi.viewAllCustomers,
      tone: "brand",
      trend: series.map((point) => point.cumulative),
      onActivate: () => onGoToCustomers(),
      activateLabel: t.dashboard.kpi.viewAllCustomers,
    },
    {
      key: "kpi-new-this-month",
      label: t.dashboard.kpi.newThisMonth,
      value: kpis.newThisMonth,
      delta: 18.2,
      deltaLabel: t.dashboard.kpi.vsLastMonth,
      tone: "info",
      trend: series.map((point) => point.added),
      onActivate: () => onGoToCustomers(),
      activateLabel: t.dashboard.kpi.viewAllCustomers,
    },
    {
      key: "kpi-active-deals",
      label: t.dashboard.kpi.activeDeals,
      value: kpis.activeDeals,
      hint: t.dashboard.kpi.viewOpenLeads,
      tone: "warning",
      trend: series.map((point) => point.openDeals),
      onActivate: () => onGoToCustomers({ status: "lead" }),
      activateLabel: t.dashboard.kpi.viewOpenLeads,
    },
    {
      key: "kpi-revenue",
      label: t.dashboard.kpi.revenue,
      value: kpis.revenue,
      format: "currencyCompact",
      delta: 9.6,
      deltaLabel: t.dashboard.kpi.vsLastMonth,
      tone: "success",
      trend: series.map((point) => point.value),
      onActivate: onGoToTasks,
      activateLabel: t.dashboard.kpi.viewSignedTasks,
    },
    {
      key: "kpi-conversion-rate",
      label: t.dashboard.kpi.conversionRate,
      value: kpis.conversionRate,
      format: "percent",
      delta: 2.1,
      deltaLabel: t.dashboard.kpi.closedWonShare,
      tone: "brand",
      trend: series.map((point) => point.conversion),
      onActivate: () => onGoToCustomers({ status: "active" }),
      activateLabel: t.dashboard.kpi.viewActive,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* KPI 数字卡片——数字由当前 customers 实时派生，新增客户会真实变化 */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiDefs.map((kpi) => (
          <StatsCard
            key={kpi.key}
            label={kpi.label}
            testId={kpi.key}
            value={kpi.value}
            format={kpi.format}
            delta={kpi.delta}
            deltaLabel={kpi.deltaLabel}
            hint={kpi.hint}
            tone={kpi.tone}
            trend={kpi.trend}
            icon={
              kpi.key === "kpi-total-customers"
                ? UsersIcon
                : kpi.key === "kpi-new-this-month"
                  ? UserPlusIcon
                  : kpi.key === "kpi-active-deals"
                    ? ListChecksIcon
                    : kpi.key === "kpi-revenue"
                      ? CircleDollarSignIcon
                      : PercentIcon
            }
            onActivate={kpi.onActivate}
            activateLabel={kpi.activateLabel}
          />
        ))}
      </StaggerContainer>

      {/* 图表 */}
      <StaggerContainer className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title={t.dashboard.pipeline.title}
          description={t.dashboard.pipeline.description}
          className="lg:col-span-2"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PIPELINE_SERIES} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="crm-won-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.36} />
                  <stop offset="70%" stopColor="var(--chart-1)" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 6"
                stroke="var(--border)"
                vertical={false}
                opacity={0.7}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(value: number) => formatCurrencyCompact(value)}
                width={52}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  String(name) === "won"
                    ? t.dashboard.pipeline.won
                    : t.dashboard.pipeline.pipeline,
                ]}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: "var(--muted-foreground)", marginBottom: 4 }}
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ stroke: "var(--brand)", strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <Area
                type="monotone"
                dataKey="pipeline"
                name="pipeline"
                stroke="var(--chart-2)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="transparent"
                animationDuration={durations.glacial * 1000}
              />
              <Area
                type="monotone"
                dataKey="won"
                name="won"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#crm-won-fill)"
                animationDuration={durations.glacial * 1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={t.dashboard.stage.title}
          description={t.dashboard.stage.description}
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stageData}
                dataKey="value"
                nameKey="name"
                innerRadius="56%"
                outerRadius="80%"
                paddingAngle={3}
                strokeWidth={0}
                animationDuration={durations.glacial * 1000}
              >
                {stageData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [t.dashboard.stage.customers(Number(value))]}
                contentStyle={TOOLTIP_STYLE}
                itemStyle={{ color: "var(--foreground)" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)", paddingTop: 4 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerContainer>

      {/* 最近动态 + 任务总览 */}
      <StaggerContainer className="grid gap-4 lg:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <div>
              <CardTitle>{t.dashboard.recentActivity.title}</CardTitle>
              <CardDescription>{t.dashboard.recentActivity.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1">
              {recent.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => onOpenCustomer(event.customerId)}
                    aria-label={t.dashboard.recentActivity.open(event.company, event.title)}
                    className={cn(
                      "group/row flex w-full items-start gap-3 rounded-field px-2 py-2 text-left transition-colors duration-hover outline-none",
                      "hover:bg-brand-soft/50 focus-visible:ring-2 focus-visible:ring-ring/50"
                    )}
                  >
                    <Avatar size="sm">
                      <AvatarFallback className="bg-muted/70 transition-colors duration-hover group-hover/row:bg-brand-soft group-hover/row:text-brand">
                        {personInitials(event.actor, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="truncate text-body-sm">
                        <span className="font-medium">{event.title}</span>
                      </p>
                      <p className="truncate text-label text-muted-foreground">
                        {event.company} · {event.time}
                      </p>
                    </div>
                    <ArrowUpRightIcon className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-transform duration-hover group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5 group-hover/row:text-brand" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <div>
              <CardTitle>{t.dashboard.tasksOverview.title}</CardTitle>
              <CardDescription className="numeric">
                {t.dashboard.tasksOverview.summary(totalOpen, dueThisWeek)}
              </CardDescription>
            </div>
            <CardAction>
              <Button type="button" variant="outline" size="sm" onClick={onGoToTasks}>
                {t.dashboard.tasksOverview.openBoard}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1">
              {openTasks.map(({ column, meta, items }) => (
                <li key={column.id}>
                  <button
                    type="button"
                    onClick={onGoToTasks}
                    aria-label={t.dashboard.tasksOverview.openColumn(meta.title)}
                    className={cn(
                      "group/row flex w-full items-center gap-3 rounded-field px-2 py-2 text-left transition-colors duration-hover outline-none",
                      "hover:bg-brand-soft/50 focus-visible:ring-2 focus-visible:ring-ring/50"
                    )}
                  >
                    <span className="numeric flex size-7 shrink-0 items-center justify-center rounded-field bg-muted text-label font-medium text-muted-foreground transition-colors duration-hover group-hover/row:bg-brand-soft group-hover/row:text-brand">
                      {items.length}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-body-sm font-medium">{meta.title}</span>
                      <span className="truncate text-label text-muted-foreground">
                        {items[0]?.company ?? t.dashboard.tasksOverview.nothingQueued}
                      </span>
                    </div>
                    <Badge variant="outline" className="shrink-0 font-normal">
                      {meta.hint}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-start gap-2.5 rounded-card border border-brand/15 bg-brand-soft/50 p-3">
              <SparklesIcon className="mt-0.5 size-4 shrink-0 text-brand" />
              <p className="text-caption text-pretty text-muted-foreground">
                {t.dashboard.tasksOverview.insight(dueThisWeek, t.tasks.columns["follow-up"].title)}
              </p>
            </div>
          </CardContent>
        </Card>
      </StaggerContainer>

      {/* 高价值账户 */}
      <StaggerContainer className="grid gap-4">
        <Card size="sm">
          <CardHeader>
            <div>
              <CardTitle>{t.dashboard.accounts.title}</CardTitle>
              <CardDescription>{t.dashboard.accounts.description}</CardDescription>
            </div>
            <CardAction>
              <Badge variant="outline" className="gap-1 font-normal text-success">
                <CheckCircle2Icon className="size-3" />
                {t.dashboard.accounts.live}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {topAccounts.map((customer) => (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => onOpenCustomer(customer.id)}
                    className={cn(
                      "group/row flex w-full items-center gap-3 rounded-card border border-border/60 bg-surface/50 px-3 py-2.5 text-left transition-[background-color,border-color,transform] duration-hover ease-standard outline-none",
                      "hover:-translate-y-0.5 hover:border-brand/30 hover:bg-surface hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring/50"
                    )}
                  >
                    <Avatar size="sm">
                      <AvatarFallback>{personInitials(customer.name, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-body-sm font-medium">{customer.company}</span>
                      <span className="truncate text-label text-muted-foreground">
                        {customer.name} · {customer.owner}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "hidden items-center gap-1.5 text-label sm:inline-flex",
                        STATUS_META[customer.status].text
                      )}
                    >
                      <span
                        className={cn("size-1.5 rounded-full", STATUS_META[customer.status].dot)}
                      />
                      {t.status[customer.status]}
                    </span>
                    <span className="numeric shrink-0 text-body-sm font-medium">
                      {customer.value > 0 ? formatCurrencyCompact(customer.value) : t.common.notAvailable}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </StaggerContainer>
    </div>
  )
}
