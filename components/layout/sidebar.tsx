"use client"

import Link from "next/link"
import { motion } from "motion/react"
import {
  ActivityIcon,
  BlocksIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useMessages } from "@/components/i18n/locale-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
  /** 自定义品牌图形，优先于 icon。 */
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

function Brand({ brand }: { brand: NavBrandDef }) {
  const Icon = brand.icon ?? BlocksIcon
  return (
    <div className="group/nav-brand flex items-center gap-2.5 px-3 py-4">
      <span className="relative flex size-9 shrink-0 items-center justify-center">
        {/* Ring tint gives the mark depth without a gradient or a glow. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-card bg-brand/12 ring-1 ring-brand/20 transition-colors duration-hover group-hover/nav-brand:bg-brand/18"
        />
        {brand.mark ?? (
          <span className="relative flex size-7 items-center justify-center rounded-field bg-primary text-primary-foreground shadow-subtle">
            <Icon className="size-4" />
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-body-sm font-semibold">{brand.name}</span>
        <span className="truncate text-label text-muted-foreground">{brand.subtitle}</span>
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
  /** 页面导航上方的分组标题。 */
  sectionLabel,
  navLabel,
}: {
  active: NavId
  onNavigate: (id: NavId) => void
  brand?: NavBrandDef
  items?: NavItemDef[]
  user?: NavUserDef
  usage?: NavUsageDef | null
  sectionLabel?: string
  navLabel?: string
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
  const resolvedUsage: NavUsageDef | null =
    usage === undefined
      ? { label: t.demo.usageLabel, value: t.demo.usageValue, progress: 64, hint: t.demo.usageHint }
      : usage

  const pageItems = resolvedItems.filter((item) => item.tone !== "action")
  const actionItems = resolvedItems.filter((item) => item.tone === "action")

  return (
    <div className="flex h-full flex-col">
      <Brand brand={resolvedBrand} />

      <nav
        className="flex flex-col gap-0.5 px-2"
        aria-label={navLabel ?? t.a11y.primaryNav}
      >
        {sectionLabel ?? t.a11y.sectionLabel ? (
          <span className="px-2.5 pt-1 pb-1.5 text-label font-medium tracking-[0.14em] text-muted-foreground/70 uppercase">
            {sectionLabel ?? t.a11y.sectionLabel}
          </span>
        ) : null}

        {pageItems.map((item) => {
          const isActive = item.id === active
          const Icon = item.icon
          const itemClass = cn(
            "group/nav-item relative flex h-9 items-center gap-2.5 rounded-field px-2.5 text-body-sm transition-[color,background-color,box-shadow] duration-hover ease-standard outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring/50",
            isActive
              ? "bg-brand-soft font-semibold text-brand shadow-subtle"
              : "font-medium text-muted-foreground hover:bg-interactive hover:text-foreground"
          )
          const content = (
            <>
              {/* Active marker: grows out of the item's own centre. */}
              {isActive ? (
                <motion.span
                  aria-hidden
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: durations.hover, ease: easings.outExpo }}
                  className="absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-brand"
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
                    "h-4.5 min-w-4.5 px-1 text-[10px]",
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
              data-testid={`nav-${item.id}`}
              className={itemClass}
            >
              {content}
            </button>
          )
        })}

        {actionItems.length > 0 ? (
          <>
            <Separator className="my-2.5" />
            {actionItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  data-testid={`nav-${item.id}`}
                  className={cn(
                    "group/nav-action flex h-9 items-center gap-2.5 rounded-field border border-dashed border-border px-2.5 text-body-sm font-medium outline-none transition-[color,background-color,border-color] duration-hover ease-standard",
                    "text-muted-foreground hover:border-solid hover:border-brand/40 hover:bg-brand-soft hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
                  )}
                >
                  <Icon className="size-4 shrink-0 transition-transform duration-hover ease-standard group-hover/nav-action:scale-110" />
                  <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                </button>
              )
            })}
          </>
        ) : null}
      </nav>

      <div className="mt-auto flex flex-col gap-3 p-3">
        {resolvedUsage ? (
          <div className="rounded-card border border-sidebar-border bg-surface/60 p-3 shadow-subtle">
            <div className="flex items-center justify-between text-label">
              <span className="font-medium">{resolvedUsage.label}</span>
              <span className="numeric text-muted-foreground">{resolvedUsage.value}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-brand"
                initial={{ width: 0 }}
                animate={{ width: `${resolvedUsage.progress}%` }}
                transition={{ duration: durations.slow, ease: easings.outExpo }}
              />
            </div>
            <p className="mt-2 text-label leading-snug text-muted-foreground">{resolvedUsage.hint}</p>
          </div>
        ) : null}

        <div className="flex items-center gap-2.5 rounded-card border border-sidebar-border bg-surface/60 p-2 shadow-subtle transition-colors duration-hover hover:bg-surface">
          <Avatar size="sm">
            <AvatarFallback className="bg-brand-soft text-brand">
              {resolvedUser.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-label font-medium">{resolvedUser.name}</span>
            <span className="truncate text-label text-muted-foreground">{resolvedUser.email}</span>
          </div>
        </div>
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
  sectionLabel,
  navLabel,
}: {
  active: NavId
  onNavigate: (id: NavId) => void
  brand?: NavBrandDef
  items?: NavItemDef[]
  user?: NavUserDef
  usage?: NavUsageDef | null
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
        sectionLabel={sectionLabel}
        navLabel={navLabel}
      />
    </aside>
  )
}
