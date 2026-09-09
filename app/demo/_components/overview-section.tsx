"use client"

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
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowUpRightIcon,
  DollarSignIcon,
  GripVerticalIcon,
  PercentIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react"
import { StatsCard } from "@/components/prototype/stats-card"
import { ChartCard } from "@/components/prototype/chart-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StaggerContainer } from "@/components/motion/stagger-container"
import { CHANNEL_SHARE, REVENUE_SERIES, type Priority } from "@/lib/mock-data"
import { useDashboardStore } from "@/stores/dashboard-store"
import { formatCurrency, formatCurrencyCompact } from "@/lib/format"
import { cn } from "@/lib/utils"

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontSize: 12,
  boxShadow: "0 10px 28px rgb(0 0 0 / 0.1)",
}

const TONE_CLASS: Record<Priority["tagTone"], string> = {
  blue: "border-transparent bg-chart-1/15 text-chart-1",
  violet: "border-transparent bg-chart-2/15 text-chart-2",
  emerald: "border-transparent bg-chart-3/15 text-chart-3",
  amber: "border-transparent bg-chart-4/15 text-chart-4",
  rose: "border-transparent bg-chart-5/15 text-chart-5",
}

function SortablePriority({ item }: { item: Priority }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex cursor-grab touch-none items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 active:cursor-grabbing",
        isDragging && "z-10 opacity-80 shadow-lg ring-1 ring-ring/30"
      )}
      {...attributes}
      {...listeners}
    >
      <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
      <Badge className={cn("h-5 px-1.5 text-[10px]", TONE_CLASS[item.tagTone])}>{item.tag}</Badge>
    </li>
  )
}

export function PriorityList() {
  const priorities = useDashboardStore((s) => s.priorities)
  const reorderPriorities = useDashboardStore((s) => s.reorderPriorities)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = priorities.findIndex((p) => p.id === active.id)
    const to = priorities.findIndex((p) => p.id === over.id)
    if (from === -1 || to === -1) return
    reorderPriorities(arrayMove(priorities, from, to))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={priorities.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {priorities.map((item) => (
            <SortablePriority key={item.id} item={item} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

export function OverviewSection() {
  const kpis = useDashboardStore((s) => s.kpis)
  const activities = useDashboardStore((s) => s.activities)
  const status = useDashboardStore((s) => s.status)
  const loading = status === "loading"

  return (
    <div className="flex flex-col gap-6">
      {/* KPI 数字卡片 */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="月经常性收入"
          value={kpis.mrr}
          format="currency"
          delta={kpis.mrrDelta}
          deltaLabel="较上月"
          icon={DollarSignIcon}
          loading={loading}
        />
        <StatsCard
          label="活跃账号"
          value={kpis.activeUsers}
          format="integer"
          delta={kpis.activeUsersDelta}
          deltaLabel="较上月"
          icon={UsersIcon}
          loading={loading}
        />
        <StatsCard
          label="试用转化率"
          value={kpis.conversionRate}
          format="percent"
          delta={kpis.conversionDelta}
          deltaLabel="较上月"
          icon={PercentIcon}
          loading={loading}
        />
        <StatsCard
          label="平均会话时长"
          value={kpis.avgSessionSeconds}
          format="duration"
          delta={kpis.avgSessionDelta}
          deltaLabel="较上月"
          icon={TimerIcon}
          loading={loading}
        />
      </StaggerContainer>

      {/* 图表 */}
      <StaggerContainer className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="月度经常性收入"
          description="近 12 个月收入与支出对比"
          className="lg:col-span-2"
          height={300}
          loading={loading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_SERIES} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
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
                  String(name) === "revenue" ? "收入" : "支出",
                ]}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: "var(--muted-foreground)", marginBottom: 4 }}
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ stroke: "var(--border)" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#revenue-fill)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="expenses"
                stroke="var(--chart-2)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="获客渠道"
          description="本月新增注册占比"
          height={300}
          loading={loading}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={CHANNEL_SHARE}
                dataKey="value"
                nameKey="name"
                innerRadius="58%"
                outerRadius="82%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {CHANNEL_SHARE.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`]}
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

      {/* 本周聚焦 + 最近动态 */}
      <StaggerContainer className="grid gap-4 lg:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>本周聚焦</CardTitle>
            <CardDescription>拖拽排序，顺序保存在本地状态。</CardDescription>
          </CardHeader>
          <CardContent>
            <PriorityList />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle>最近动态</CardTitle>
            <CardDescription>工作区最新事件。</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3.5">
              {activities.slice(0, 5).map((event) => (
                <li key={event.id} className="flex items-start gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{event.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-sm">
                      <span className="font-medium">{event.actor}</span>{" "}
                      <span className="text-muted-foreground">{event.action}</span>
                    </p>
                    <span className="text-xs text-muted-foreground">{event.time}</span>
                  </div>
                  <ArrowUpRightIcon className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </StaggerContainer>
    </div>
  )
}