"use client"

import { useMemo } from "react"
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
import { useDashboardStore } from "@/stores/dashboard-store"

export type NavId = "overview" | "customers" | "activity" | "settings"

export interface NavItemDef {
  id: NavId
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItemDef[] = [
  { id: "overview", label: "总览", icon: LayoutDashboardIcon },
  { id: "customers", label: "客户", icon: UsersIcon },
  { id: "activity", label: "动态", icon: ActivityIcon },
  { id: "settings", label: "快速上手", icon: SettingsIcon },
]

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-3 py-4">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <BlocksIcon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">Northwind</span>
        <span className="truncate text-xs text-muted-foreground">分析工作区</span>
      </div>
    </div>
  )
}

/** Navigation column — shared by the desktop sidebar and the mobile drawer. */
export function SidebarNav({
  active,
  onNavigate,
}: {
  active: NavId
  onNavigate: (id: NavId) => void
}) {
  const notifications = useDashboardStore((state) => state.notifications)
  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  )

  return (
    <div className="flex h-full flex-col">
      <Brand />
      <nav className="flex flex-col gap-1 px-2" aria-label="主导航">
        {NAV_ITEMS.map((item) => {
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
              {item.id === "activity" && unreadCount > 0 ? (
                <Badge
                  className={cn(
                    "h-4.5 min-w-4.5 px-1 text-[10px]",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {unreadCount}
                </Badge>
              ) : null}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 p-3">
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">用量</span>
            <span className="text-muted-foreground">64%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[64%] rounded-full bg-chart-1" />
          </div>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            专业版已使用 206 / 320 个席位。
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border bg-card p-2">
          <Avatar size="sm">
            <AvatarFallback>TW</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-medium">Taylor Wu</span>
            <span className="truncate text-[11px] text-muted-foreground">taylor@northwind.dev</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Fixed desktop sidebar — hidden below the `lg` breakpoint. */
export function Sidebar({
  active,
  onNavigate,
}: {
  active: NavId
  onNavigate: (id: NavId) => void
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <SidebarNav active={active} onNavigate={onNavigate} />
    </aside>
  )
}