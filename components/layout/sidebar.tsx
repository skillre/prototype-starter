"use client"

import {
  ActivityIcon,
  BlocksIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

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

/** 默认导航项——与既有 /demo 完全一致；未传 items 时使用。 */
export const NAV_ITEMS: NavItemDef[] = [
  { id: "overview", label: "总览", icon: LayoutDashboardIcon },
  { id: "customers", label: "客户", icon: UsersIcon },
  { id: "activity", label: "动态", icon: ActivityIcon },
  { id: "settings", label: "快速上手", icon: SettingsIcon },
]

const DEFAULT_BRAND: NavBrandDef = { name: "Northwind", subtitle: "分析工作区", icon: BlocksIcon }
const DEFAULT_USER: NavUserDef = {
  name: "Taylor Wu",
  email: "taylor@northwind.dev",
  initials: "TW",
}
const DEFAULT_USAGE: NavUsageDef = {
  label: "用量",
  value: "64%",
  progress: 64,
  hint: "专业版已使用 206 / 320 个席位。",
}

function Brand({ brand }: { brand: NavBrandDef }) {
  const Icon = brand.icon ?? BlocksIcon
  return (
    <div className="flex items-center gap-2.5 px-3 py-4">
      {brand.mark ?? (
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Icon className="size-4" />
        </span>
      )}
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">{brand.name}</span>
        <span className="truncate text-xs text-muted-foreground">{brand.subtitle}</span>
      </div>
    </div>
  )
}

/** 导航列——桌面 Sidebar 与移动 Drawer 共用。 */
export function SidebarNav({
  active,
  onNavigate,
  brand = DEFAULT_BRAND,
  items = NAV_ITEMS,
  user = DEFAULT_USER,
  /** 传 null 隐藏底部用量卡片。 */
  usage = DEFAULT_USAGE,
}: {
  active: NavId
  onNavigate: (id: NavId) => void
  brand?: NavBrandDef
  items?: NavItemDef[]
  user?: NavUserDef
  usage?: NavUsageDef | null
}) {
  return (
    <div className="flex h-full flex-col">
      <Brand brand={brand} />
      <nav className="flex flex-col gap-1 px-2" aria-label="主导航">
        {items.map((item) => {
          const isActive = item.id === active
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? "page" : undefined}
              data-testid={`nav-${item.id}`}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring/60",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <Badge
                  className={cn(
                    "h-4.5 min-w-4.5 px-1 text-[10px]",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.badge}
                </Badge>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 p-3">
        {usage ? (
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{usage.label}</span>
              <span className="text-muted-foreground">{usage.value}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-chart-1"
                style={{ width: `${usage.progress}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{usage.hint}</p>
          </div>
        ) : null}

        <div className="flex items-center gap-2.5 rounded-lg border bg-card p-2">
          <Avatar size="sm">
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-medium">{user.name}</span>
            <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
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
}: {
  active: NavId
  onNavigate: (id: NavId) => void
  brand?: NavBrandDef
  items?: NavItemDef[]
  user?: NavUserDef
  usage?: NavUsageDef | null
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <SidebarNav
        active={active}
        onNavigate={onNavigate}
        brand={brand}
        items={items}
        user={user}
        usage={usage}
      />
    </aside>
  )
}
