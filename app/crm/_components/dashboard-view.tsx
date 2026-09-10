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
import { StatsCard } from "@/components/prototype/stats-card"
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
  type CustomerStatus,
} from "@/lib/crm-data"
import { selectKpis, useCrmStore } from "@/stores/crm-store"
import { formatCurrency, formatCurrencyCompact } from "@/lib/format"
import { durations } from "@/lib/motion-presets"
import { cn } from "@/lib/utils"

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontSize: 12,
  boxShadow: "0 10px 28px rgb(0 0 0 / 0.1)",
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

type DashboardViewProps = {
  onOpenCustomer: (customerId: string) => void
  onGoToTasks: () => void
  /** KPI 下钻：进入客户列表并按状态预筛选。 */
  onGoToCustomers: (filter?: { status?: CustomerStatus }) => void
}

export function DashboardView({ onOpenCustomer, onGoToTasks, onGoToCustomers }: DashboardViewProps) {
  const customers = useCrmStore((s) => s.customers)
  const activities = useCrmStore((s) => s.activities)
  const tasks = useCrmStore((s) => s.tasks)

  const kpis = useMemo(() => selectKpis(customers), [customers])

  const stageData = useMemo(
    () =>
      (Object.keys(STAGE_COLORS) as (keyof typeof STAGE_COLORS)[])
        .map((status) => ({
          name: STATUS_META[status].label,
          value: customers.filter((c) => c.status === status).length,
          color: STAGE_COLORS[status],
        }))
        .filter((slice) => slice.value > 0),
    [customers]
  )

  const recent = useMemo(
    () =>
      [...activities]
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 6)
        .map((activity) => ({
          ...activity,
          company: customers.find((c) => c.id === activity.customerId)?.company ?? "—",
        })),
    [activities, customers]
  )

  const openTasks = useMemo(
    () =>
      TASK_COLUMNS.map((column) => ({
        column,
        items: tasks[column.id] ?? [],
      })),
    [tasks]
  )

  const totalOpen = openTasks.reduce((sum, group) => sum + group.items.length, 0)
  const dueThisWeek = openTasks
    .flatMap((group) => group.items)
    .filter((task) => task.due <= "2026-09-14").length

  return (
    <div className="flex flex-col gap-6">
      {/* KPI 数字卡片——数字由当前 customers 实时派生，新增客户会真实变化 */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          label="Total customers"
          testId="kpi-total-customers"
          onActivate={() => onGoToCustomers()}
          value={kpis.totalCustomers}
          icon={UsersIcon}
          hint="View all customers"
        />
        <StatsCard
          label="New this month"
          testId="kpi-new-this-month"
          onActivate={() => onGoToCustomers()}
          value={kpis.newThisMonth}
          icon={UserPlusIcon}
          delta={18.2}
          deltaLabel="vs last month"
        />
        <StatsCard
          label="Active deals"
          testId="kpi-active-deals"
          onActivate={() => onGoToCustomers({ status: "lead" })}
          value={kpis.activeDeals}
          icon={ListChecksIcon}
          hint="View open leads and trials"
        />
        <StatsCard
          label="Revenue"
          testId="kpi-revenue"
          onActivate={onGoToTasks}
          value={kpis.revenue}
          format="currency"
          icon={CircleDollarSignIcon}
          delta={9.6}
          deltaLabel="vs last month"
        />
        <StatsCard
          label="Conversion rate"
          testId="kpi-conversion-rate"
          onActivate={() => onGoToCustomers({ status: "active" })}
          value={kpis.conversionRate}
          format="percent"
          icon={PercentIcon}
          delta={2.1}
          deltaLabel="closed-won share"
        />
      </StaggerContainer>

      {/* 图表 */}
      <StaggerContainer className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Pipeline performance"
          description="Closed-won against open pipeline, last 12 months"
          className="lg:col-span-2"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PIPELINE_SERIES} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="crm-won-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(value: number) => formatCurrencyCompact(value)}
                width={48}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  String(name) === "won" ? "Closed won" : "Open pipeline",
                ]}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: "var(--muted-foreground)", marginBottom: 4 }}
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ stroke: "var(--border)" }}
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
          title="Pipeline by stage"
          description="Live distribution across every customer record"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stageData}
                dataKey="value"
                nameKey="name"
                innerRadius="58%"
                outerRadius="82%"
                paddingAngle={2}
                strokeWidth={0}
                animationDuration={durations.glacial * 1000}
              >
                {stageData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} customers`]}
                contentStyle={TOOLTIP_STYLE}
                itemStyle={{ color: "var(--foreground)" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </StaggerContainer>

      {/* 最近动态 + 任务总览 */}
      <StaggerContainer className="grid gap-4 lg:grid-cols-2">
        <Card size="sm" className="transition-colors hover:border-foreground/20">
          <CardHeader>
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest touchpoints across the book.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3.5">
              {recent.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => onOpenCustomer(event.customerId)}
                    aria-label={`Open ${event.company} — ${event.title}`}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-field px-2 py-1.5 text-left transition-colors outline-none",
                      "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/60"
                    )}
                  >
                    <Avatar size="sm">
                      <AvatarFallback>{initials(event.actor)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="truncate text-sm">
                        <span className="font-medium">{event.title}</span>
                      </p>
                      <p className="truncate text-caption text-muted-foreground">
                        {event.company} · {event.time}
                      </p>
                    </div>
                    <ArrowUpRightIcon className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card size="sm" className="transition-colors hover:border-foreground/20">
          <CardHeader>
            <div>
              <CardTitle>Tasks overview</CardTitle>
              <CardDescription>
                {totalOpen} open · {dueThisWeek} due this week
              </CardDescription>
            </div>
            <CardAction>
              <Button type="button" variant="outline" size="sm" onClick={onGoToTasks}>
                Open board
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2.5">
              {openTasks.map(({ column, items }) => (
                <li key={column.id}>
                  <button
                    type="button"
                    onClick={onGoToTasks}
                    aria-label={`Open ${column.title} on the task board`}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-field px-2 py-1.5 text-left transition-colors outline-none",
                      "hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/60"
                    )}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-label font-medium tabular-nums text-muted-foreground">
                      {items.length}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{column.title}</span>
                      <span className="truncate text-caption text-muted-foreground">
                        {items[0]?.company ?? "Nothing queued"}
                      </span>
                    </div>
                    <Badge variant="outline" className="shrink-0 font-normal">
                      {column.hint}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center gap-2 rounded-field border bg-muted/40 p-2.5">
              <SparklesIcon className="size-4 shrink-0 text-chart-2" />
              <p className="text-caption text-muted-foreground">
                {dueThisWeek} tasks are due within the next five days — clear the Follow up
                column first.
              </p>
            </div>
          </CardContent>
        </Card>
      </StaggerContainer>

      {/* 高价值账户 */}
      <StaggerContainer className="grid gap-4">
        <Card size="sm" className="transition-colors hover:border-foreground/20">
          <CardHeader>
            <div>
              <CardTitle>Highest-value accounts</CardTitle>
              <CardDescription>Ranked by annual contract value.</CardDescription>
            </div>
            <CardAction>
              <Badge variant="outline" className="gap-1 font-normal">
                <CheckCircle2Icon className="size-3" />
                Live from store
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {[...customers]
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((customer) => (
                  <li key={customer.id}>
                    <button
                      type="button"
                      onClick={() => onOpenCustomer(customer.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-field border bg-card px-3 py-2.5 text-left transition-colors outline-none",
                        "hover:border-foreground/20 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring/60"
                      )}
                    >
                      <Avatar size="sm">
                        <AvatarFallback>{initials(customer.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="truncate text-sm font-medium">{customer.company}</span>
                        <span className="truncate text-caption text-muted-foreground">
                          {customer.name} · {customer.owner}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "hidden items-center gap-1.5 text-caption sm:inline-flex",
                          STATUS_META[customer.status].text
                        )}
                      >
                        <span
                          className={cn("size-1.5 rounded-full", STATUS_META[customer.status].dot)}
                        />
                        {STATUS_META[customer.status].label}
                      </span>
                      <span className="shrink-0 text-sm font-medium tabular-nums">
                        {customer.value > 0 ? formatCurrency(customer.value) : "—"}
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
