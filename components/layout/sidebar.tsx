"use client"

import Link from "next/link"
import { motion } from "motion/react"
import {
  ActivityIcon,
  BlocksIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  RefreshCwIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useMessages } from "@/components/i18n/locale-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { durations, easings } from "@/lib/motion-presets"

/**
 * 导航项 id：由调用方自行定义（demo 用 overview/customers/activity/settings，
 * CRM 用 dashboard/customers/tasks/activities）。保持 string 以便复用同一套
 * Sidebar / MobileNav。
 */
export type NavId = string

export interface NavItemDef {
  id: NavId
  label: string
  icon: LucideIcon
  /** 可选徽标数字（例如未读数）；为 0 或未传时不渲染。 */
  badge?: number
  /**
   * 可选真实路由。提供时导航项渲染为 <Link>（可新开标签、可分享 URL），
   * 否则退回为 button + onNavigate（Starter 的 /demo 仍走这条路径）。
   */
  href?: string
  /**
   * "action" 表示这是一个动作（例如打开对话框）而不是页面跳转，
   * 会与页面导航之间加分隔线并使用强调样式，避免语义混淆。
   */
  tone?: "nav" | "action"
}

export interface NavBrandDef {
  name: string
  subtitle: string
  icon?: LucideIcon
  /** 自定义品牌图形（单个汉字或字母），优先于 icon。 */
  mark?: React.ReactNode
}

export interface NavUserDef {
  name: string
  email: string
  initials: string
}

export interface NavUsageDef {
  label: string
  value: string
  progress: number
  hint: string
}

/**
 * 工作区上下文块：侧栏底部用真实派生数据说明"这个工作区现在处于什么状态"。
 * 它是侧栏留白的主体填充物，也是产品身份的一部分——不是装饰卡片。
 */
export interface NavContextDef extends NavUsageDef {
  /** 目标的另一半，例如 "¥2,400万"。渲染为 value / target。 */
  target?: string
}

/**
 * 系统状态块：实时指示 + 刷新。刷新是真实动作（调用方传入 handler）。
 */
export interface NavStatusDef {
  label: string
  hint: string
  busy?: boolean
  onRefresh?: () => void
  refreshLabel?: string
}

/**
 * 内置演示（/demo）的默认导航项——未传 items 时使用。
 * 文案来自词典的 `demo` 分组，组件本身不含硬编码文案。
 */
export function defaultNavItems(t: ReturnType<typeof useMessages>): NavItemDef[] {
  return [
    { id: "overview", label: t.demo.nav.overview, icon: LayoutDashboardIcon },
    { id: "customers", label: t.demo.nav.customers, icon: UsersIcon },
    { id: "activity", label: t.demo.nav.activity, icon: ActivityIcon },
    { id: "settings", label: t.demo.nav.settings, icon: SettingsIcon },
  ]
}

/**
 * 品牌标识。
 *
 * 这是侧栏里唯一的"产品身份"时刻：一个实心品牌色方块 + 一条内高光，
 * 右侧是产品名 + 工作区语境。刻意不用渐变、不用发光——识别度来自
 * 方块本身的分量（36px、接近满饱和）而不是特效。
 */
function Brand({ brand }: { brand: NavBrandDef }) {
  const Icon = brand.icon ?? BlocksIcon
  return (
    <div className="flex items-center gap-2.5 px-3 pt-4 pb-3.5">
      <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-brand text-brand-foreground shadow-subtle ring-1 ring-brand/25 ring-inset">
        {/* 内高光：让实心块有"材质"，不需要阴影堆叠。 */}
        <span aria-hidden className="surface-sheen absolute inset-0" />
        {brand.mark ?? <Icon className="relative size-4" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-none">
        <span className="truncate text-body-sm font-semibold tracking-[0.01em]">
          {brand.name}
        </span>
        <span className="truncate text-[0.6875rem] text-muted-foreground">
          {brand.subtitle}
        </span>
      </div>
    </div>
  )
}

/** 导航列——桌面 Sidebar 与移动 Drawer 共用。 */
export function SidebarNav({
  active,
  onNavigate,
  brand,
  items,
  user,
  /** 传 null 隐藏底部用量卡片。 */
  usage,
  /** 工作区上下文块（优先于 usage，二者形状相同）。 */
  context,
  /** 状态块——传了才渲染。 */
  status,
  /** 点击用户卡片时的真实动作（例如打开个人资料对话框）。 */
  onOpenAccount,
  accountHint,
  /** 页面导航上方的分组标题。 */
  sectionLabel,
  navLabel,
  /** 顶部动作按钮组（例如命令面板 / 主题）。 */
  utilities,
}: {
  active: NavId
  onNavigate: (id: NavId) => void
  brand?: NavBrandDef
  items?: NavItemDef[]
  user?: NavUserDef
  usage?: NavUsageDef | null
  context?: NavContextDef | null
  status?: NavStatusDef | null
  onOpenAccount?: () => void
  accountHint?: string
  sectionLabel?: string
  navLabel?: string
  utilities?: React.ReactNode
}) {
  const t = useMessages()
  const resolvedBrand: NavBrandDef = brand ?? {
    name: t.demo.brandName,
    subtitle: t.demo.brandSubtitle,
    icon: BlocksIcon,
  }
  const resolvedItems = items ?? defaultNavItems(t)
  const resolvedUser: NavUserDef = user ?? {
    name: t.demo.userName,
    email: t.demo.userEmail,
    initials: t.demo.userInitials,
  }
  const resolvedContext: NavContextDef | null = context ?? null
  const resolvedUsage: NavUsageDef | null =
    resolvedContext ??
    (usage === undefined
      ? { label: t.demo.usageLabel, value: t.demo.usageValue, progress: 64, hint: t.demo.usageHint }
      : usage)

  const pageItems = resolvedItems.filter((item) => item.tone !== "action")
  const actionItems = resolvedItems.filter((item) => item.tone === "action")

  return (
    <div className="flex h-full flex-col">
      <Brand brand={resolvedBrand} />
      <span aria-hidden className="mx-3 h-px bg-sidebar-border" />

      <nav
        className="flex flex-col gap-0.5 px-2 pt-3"
        aria-label={navLabel ?? t.a11y.primaryNav}
      >
        {sectionLabel ?? t.a11y.sectionLabel ? (
          <span className="eyebrow px-2.5 pb-2 text-muted-foreground/55">
            {sectionLabel ?? t.a11y.sectionLabel}
          </span>
        ) : null}

        {pageItems.map((item) => {
          const isActive = item.id === active
          const Icon = item.icon
          const itemClass = cn(
            "group/nav-item relative flex h-9 items-center gap-2.5 rounded-field px-2.5 text-body-sm outline-none transition-[color,background-color] duration-hover ease-standard",
            "focus-visible:ring-2 focus-visible:ring-ring/50",
            isActive
              ? "bg-brand-soft font-semibold text-brand ring-1 ring-brand/12 ring-inset"
              : "font-medium text-muted-foreground hover:bg-interactive hover:text-foreground"
          )
          const content = (
            <>
              {/* 激活指示：一条从条目中心长出来的左侧轨道。 */}
              {isActive ? (
                <motion.span
                  aria-hidden
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: durations.hover, ease: easings.outExpo }}
                  className="absolute top-1/2 left-0 h-4.5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand"
                />
              ) : null}
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform duration-hover ease-standard",
                  isActive ? "text-brand" : "group-hover/nav-item:translate-x-0.5"
                )}
              />
              <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <Badge
                  className={cn(
                    "h-4.5 min-w-4.5 px-1 text-[10px] font-medium tabular-nums",
                    isActive
                      ? "bg-brand/15 text-brand"
                      : "bg-muted text-muted-foreground group-hover/nav-item:bg-background"
                  )}
                >
                  {item.badge}
                </Badge>
              ) : null}
            </>
          )

          // 有真实路由时用 <Link>：可分享 URL、可新开标签、可被爬虫/测试直接访问。
          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                /* 显式 aria-label：徽标数字是补充信息，不能让可访问名变成
                   "客户 22"——导航项的名字始终只有它的页面名。 */
                aria-label={item.label}
                data-testid={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={itemClass}
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              data-testid={`nav-${item.id}`}
              className={itemClass}
            >
              {content}
            </button>
          )
        })}

        {actionItems.length > 0 ? (
          <>
            <span aria-hidden className="mx-2.5 my-2.5 h-px bg-sidebar-border" />
            {actionItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  data-testid={`nav-${item.id}`}
                  className={cn(
                    "group/nav-action flex h-9 items-center gap-2.5 rounded-field px-2.5 text-body-sm font-medium outline-none transition-[color,background-color] duration-hover ease-standard",
                    "text-muted-foreground hover:bg-brand-soft hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
                  )}
                >
                  <Icon className="size-4 shrink-0 transition-transform duration-hover ease-standard group-hover/nav-action:rotate-90" />
                  <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                </button>
              )
            })}
          </>
        ) : null}
      </nav>

      {/*
        工作区上下文紧跟导航，而不是被推到底部：它回答的是"我在哪、这个
        工作区现在怎么样"，属于导航的一部分。底部只留状态与身份。
        剩下那段留白因此读作"内容结束后的呼吸"，而不是"这里缺一块"。
      */}
      {resolvedUsage ? (
        <div className="px-3 pt-4">
          <div className="rounded-panel border border-sidebar-border bg-surface/55 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="eyebrow text-muted-foreground/70">{resolvedUsage.label}</span>
              <span className="numeric text-label font-semibold">{resolvedUsage.progress}%</span>
            </div>

            <div className="mt-2 flex items-baseline gap-1">
              <span className="numeric text-subtitle font-semibold tracking-[-0.02em]">
                {resolvedUsage.value}
              </span>
              {resolvedContext?.target ? (
                <span className="numeric text-label text-muted-foreground">
                  / {resolvedContext.target}
                </span>
              ) : null}
            </div>

            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-brand"
                initial={{ width: 0 }}
                animate={{ width: `${resolvedUsage.progress}%` }}
                transition={{ duration: durations.slow, ease: easings.outExpo }}
              />
            </div>
            <p className="mt-2 text-[0.6875rem] leading-snug text-muted-foreground">
              {resolvedUsage.hint}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-2.5 p-3">
        {status ? (
          <div className="flex items-center gap-2 rounded-field px-2.5 py-1.5">
            <span className="relative flex size-2 shrink-0 items-center justify-center">
              <span aria-hidden className="absolute size-2 rounded-full bg-success/35 [animation:live-halo_3.2s_ease-out_infinite]" />
              <span className="relative size-1.5 rounded-full bg-success" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-label font-medium">{status.label}</span>
              <span className="truncate text-[0.6875rem] text-muted-foreground">{status.hint}</span>
            </span>
            {status.onRefresh ? (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={status.refreshLabel}
                      onClick={status.onRefresh}
                      data-testid="sidebar-refresh"
                      className="text-muted-foreground hover:text-foreground"
                    />
                  }
                >
                  <RefreshCwIcon className={cn(status.busy && "animate-spin")} />
                </TooltipTrigger>
                <TooltipContent side="top">{status.refreshLabel}</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        ) : null}

        {utilities ? <div className="flex items-center gap-1 px-0.5">{utilities}</div> : null}

        {/* 用户身份：有真实目的地时是按钮（进入个人资料），否则是纯展示。 */}
        {onOpenAccount ? (
          <button
            type="button"
            onClick={onOpenAccount}
            aria-label={accountHint}
            data-testid="sidebar-account"
            className="group/account flex w-full items-center gap-2.5 rounded-panel border border-sidebar-border bg-surface/55 p-2 text-left outline-none transition-colors duration-hover hover:border-brand/25 hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-brand-soft text-brand">
                {resolvedUser.initials}
              </AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-label font-semibold">{resolvedUser.name}</span>
              <span className="truncate text-[0.6875rem] text-muted-foreground">
                {resolvedUser.email}
              </span>
            </span>
            <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-hover group-hover/account:translate-x-0.5 group-hover/account:text-brand" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 rounded-panel border border-sidebar-border bg-surface/55 p-2 transition-colors duration-hover hover:bg-surface">
            <Avatar size="sm">
              <AvatarFallback className="bg-brand-soft text-brand">
                {resolvedUser.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-label font-semibold">{resolvedUser.name}</span>
              <span className="truncate text-[0.6875rem] text-muted-foreground">
                {resolvedUser.email}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** 固定桌面侧栏——`lg` 以下隐藏。 */
export function Sidebar({
  active,
  onNavigate,
  brand,
  items,
  user,
  usage,
  context,
  status,
  onOpenAccount,
  accountHint,
  utilities,
  sectionLabel,
  navLabel,
}: {
  active: NavId
  onNavigate: (id: NavId) => void
  brand?: NavBrandDef
  items?: NavItemDef[]
  user?: NavUserDef
  usage?: NavUsageDef | null
  context?: NavContextDef | null
  status?: NavStatusDef | null
  onOpenAccount?: () => void
  accountHint?: string
  utilities?: React.ReactNode
  sectionLabel?: string
  navLabel?: string
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <SidebarNav
        active={active}
        onNavigate={onNavigate}
        brand={brand}
        items={items}
        user={user}
        usage={usage}
        context={context}
        status={status}
        onOpenAccount={onOpenAccount}
        accountHint={accountHint}
        utilities={utilities}
        sectionLabel={sectionLabel}
        navLabel={navLabel}
      />
    </aside>
  )
}
