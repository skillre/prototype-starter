"use client"

import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import { toast } from "sonner"
import {
  BellIcon,
  ChevronDownIcon,
  CreditCardIcon,
  FlaskConicalIcon,
  LogOutIcon,
  MoonIcon,
  RotateCwIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  TriangleAlertIcon,
  UserPlusIcon,
  ZapIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDashboardStore } from "@/stores/dashboard-store"
import type { NavId } from "@/components/layout/sidebar"
import type { AppNotification } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const KIND_ICON = {
  payment: CreditCardIcon,
  trial: UserPlusIcon,
  usage: ZapIcon,
  report: BellIcon,
} as const

/**
 * 顶栏的数据来源。默认（不传）时行为与 Starter 完全一致：读取 dashboard-store。
 * 其他原型（如 AI CRM）可注入自己的通知、状态与动作，而无需复制这个组件。
 */
/** 通知条目可携带关联客户 id，用于生成真实详情页链接。 */
export interface TopNavNotification extends AppNotification {
  customerId?: string
}

export interface TopNavDataSource {
  notifications: TopNavNotification[]
  status: "loading" | "ready" | "error"
  onRefresh: () => void
  onSimulateFailure?: () => void
  onReset?: () => void
  onMarkAllRead: () => void
  /** 传入后，「退出登录」调用它（CRM 用它打开真实确认对话框）。 */
  onSignOut?: () => void
  /** 传入后，通知条目会导航到对应客户的详情页（而不是只弹 toast）。 */
  notificationHref?: (notification: TopNavNotification) => string
  /** 账户菜单里第一项的目标 id（默认「快速上手」）。 */
  primaryNavId?: NavId
  /** 账户菜单里第一项的文案（默认「快速上手」）。 */
  primaryNavLabel?: string
  account: { name: string; email: string; initials: string }
  /** 文案可覆盖，未传时沿用 Starter 中文默认值。 */
  labels?: {
    simulateSlowLoad?: string
    simulateFailure?: string
    resetData?: string
    resetToastTitle?: string
    resetToastDescription?: string
    markAllRead?: string
    signOut?: string
    signOutToastTitle?: string
    signOutToastDescription?: string
    notificationsEmpty?: string
    prototypeState?: string
    prototypeStateDescription?: string
    accountMenu?: string
  }
}

type TopNavProps = {
  title: string
  subtitle: string
  onOpenCommand: () => void
  onNavigate: (id: NavId) => void
  /** 不传则使用内置的 dashboard-store 数据源。 */
  dataSource?: TopNavDataSource
}

/** 桌面端顶栏：页面标题、全局搜索、刷新、主题、通知、演示控制、账户菜单。 */
export function TopNav({
  title,
  subtitle,
  onOpenCommand,
  onNavigate,
  dataSource,
}: TopNavProps) {
  // Hooks 必须无条件调用；未注入时读到的 store 值仅用于兜底默认行为。
  const storeNotifications = useDashboardStore((state) => state.notifications)
  const storeMarkAll = useDashboardStore((state) => state.markAllNotificationsRead)
  const storeRefresh = useDashboardStore((state) => state.refresh)
  const storeSimulateFailure = useDashboardStore((state) => state.simulateApiFailure)
  const storeReset = useDashboardStore((state) => state.resetDemo)
  const storeStatus = useDashboardStore((state) => state.status)

  const notifications = dataSource?.notifications ?? storeNotifications
  const markAllNotificationsRead = dataSource?.onMarkAllRead ?? storeMarkAll
  const refresh = dataSource?.onRefresh ?? storeRefresh
  const simulateApiFailure = dataSource?.onSimulateFailure ?? storeSimulateFailure
  const resetDemo = dataSource?.onReset ?? storeReset
  const status = dataSource?.status ?? storeStatus
  const account = dataSource?.account ?? { name: "Taylor Wu", email: "taylor@northwind.dev", initials: "TW" }
  const primaryNavId = dataSource?.primaryNavId ?? "settings"
  const primaryNavLabel = dataSource?.primaryNavLabel ?? "快速上手"
  const notificationHref = dataSource?.notificationHref
  const onSignOut = dataSource?.onSignOut
  const labels = {
    simulateSlowLoad: "模拟慢加载",
    simulateFailure: "模拟接口失败",
    resetData: "重置演示数据",
    resetToastTitle: "演示数据已重置",
    resetToastDescription: "所有筛选、编辑与状态改动都已恢复。",
    markAllRead: "全部标为已读",
    signOut: "退出登录",
    signOutToastTitle: "已退出登录",
    signOutToastDescription: "已回到演示初始状态。",
    notificationsEmpty: "没有新通知了。",
    prototypeState: "原型状态",
    prototypeStateDescription: "强制触发加载、错误与重置流程，预览所有状态。",
    accountMenu: "账户菜单",
    ...dataSource?.labels,
  }

  const { resolvedTheme, setTheme } = useTheme()

  const unreadCount = notifications.filter((n) => n.unread).length

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")

  const handleReset = () => {
    resetDemo()
    toast.success(labels.resetToastTitle, {
      description: labels.resetToastDescription,
    })
  }

  const openNotification = (title: string) => {
    // 通知条目在有 href 时会自行导航；这里只负责「无链接」时的兜底反馈。
    if (notificationHref) return
    onNavigate("activity")
    toast.info(title)
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold">{title}</span>
        <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="打开命令面板"
                onClick={onOpenCommand}
                data-testid="open-command"
              />
            }
          >
            <SearchIcon />
            <kbd className="hidden text-xs font-normal text-muted-foreground lg:inline">⌘K</kbd>
          </TooltipTrigger>
          <TooltipContent side="bottom">搜索或运行命令</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="刷新数据"
                onClick={refresh}
                data-testid="refresh-data"
              />
            }
          >
            <RotateCwIcon className={cn(status === "loading" && "animate-spin")} />
          </TooltipTrigger>
          <TooltipContent side="bottom">刷新数据</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="切换主题"
                onClick={toggleTheme}
                data-testid="toggle-theme"
              />
            }
          >
            {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
          </TooltipTrigger>
          <TooltipContent side="bottom">切换主题</TooltipContent>
        </Tooltip>

        {/* 通知 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Notifications"
                      data-testid="notifications"
                      className="relative"
                    />
                  }
                />
              }
            >
              <BellIcon />
              {unreadCount > 0 ? (
                <span className="absolute top-0.5 right-0.5 flex size-3.5 items-center justify-center rounded-full bg-chart-5 text-[9px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </TooltipTrigger>
            <TooltipContent side="bottom">Notifications</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            {notifications.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                {labels.notificationsEmpty}
              </p>
            ) : (
              notifications.map((notification) => {
                const Icon = KIND_ICON[notification.kind]
                const rowContent = (
                  <>
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="size-3.5" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-xs font-medium">
                        {notification.title}
                        {notification.unread ? (
                          <span className="size-1.5 rounded-full bg-chart-1" />
                        ) : null}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {notification.description}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{notification.time}</span>
                    </span>
                  </>
                )

                // 有对应客户时渲染为真实链接——通知条目本身可导航，不嵌套额外按钮。
                const href = notificationHref?.(notification)
                if (href) {
                  return (
                    <DropdownMenuItem
                      key={notification.id}
                      render={<Link href={href} />}
                      onSelect={() => openNotification(notification.title)}
                      className="items-start gap-2.5 py-2"
                    >
                      {rowContent}
                    </DropdownMenuItem>
                  )
                }

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    onSelect={() => openNotification(notification.title)}
                    className="items-start gap-2.5 py-2"
                  >
                    {rowContent}
                  </DropdownMenuItem>
                )
              })
            )}
            {unreadCount > 0 ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={markAllNotificationsRead} className="justify-center">
                  {labels.markAllRead}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 演示控制——演示中唯一的"元"操作区，所有按钮都是真实动作。 */}
        <Popover>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="演示控制"
                      data-testid="demo-controls"
                    />
                  }
                />
              }
            >
              <FlaskConicalIcon />
            </TooltipTrigger>
            <TooltipContent side="bottom">演示控制</TooltipContent>
          </Tooltip>
          <PopoverContent align="end" className="w-64">
            <PopoverHeader>
              <PopoverTitle>{labels.prototypeState}</PopoverTitle>
              <PopoverDescription>{labels.prototypeStateDescription}</PopoverDescription>
            </PopoverHeader>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" type="button" className="justify-start" onClick={refresh}>
                <RotateCwIcon /> {labels.simulateSlowLoad}
              </Button>
              <Button
                variant="ghost"
                type="button"
                className="justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  simulateApiFailure()
                  toast.error("Request failed", {
                    description: "The dashboard switched to its error state.",
                  })
                }}
              >
                <TriangleAlertIcon /> {labels.simulateFailure}
              </Button>
              <Separator className="my-1" />
              <Button variant="ghost" type="button" className="justify-start" onClick={handleReset}>
                <RotateCwIcon /> {labels.resetData}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* 账户 */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={labels.accountMenu}
                data-testid="account-menu"
                className="gap-2 pl-1.5"
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback>{account.initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-xs font-medium lg:inline">{account.name}</span>
            <ChevronDownIcon className="hidden size-3 text-muted-foreground lg:inline" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              {account.name}
              <span className="text-[10px] font-normal text-muted-foreground">
                {account.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onNavigate(primaryNavId)}>
              <SettingsIcon /> {primaryNavLabel}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                if (onSignOut) {
                  onSignOut()
                  return
                }
                handleReset()
                toast.success(labels.signOutToastTitle, {
                  description: labels.signOutToastDescription,
                })
              }}
            >
              <LogOutIcon /> {labels.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}