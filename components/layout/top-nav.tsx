"use client"

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
  UsersIcon,
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
import { cn } from "@/lib/utils"

const KIND_ICON = {
  payment: CreditCardIcon,
  trial: UserPlusIcon,
  usage: ZapIcon,
  report: BellIcon,
} as const

type TopNavProps = {
  title: string
  subtitle: string
  onOpenCommand: () => void
  onNavigate: (id: NavId) => void
}

/** 桌面端顶栏：页面标题、全局搜索、刷新、主题、通知、演示控制、账户菜单。 */
export function TopNav({ title, subtitle, onOpenCommand, onNavigate }: TopNavProps) {
  const notifications = useDashboardStore((state) => state.notifications)
  const markAllNotificationsRead = useDashboardStore((state) => state.markAllNotificationsRead)
  const refresh = useDashboardStore((state) => state.refresh)
  const simulateApiFailure = useDashboardStore((state) => state.simulateApiFailure)
  const resetDemo = useDashboardStore((state) => state.resetDemo)
  const status = useDashboardStore((state) => state.status)

  const { resolvedTheme, setTheme } = useTheme()

  const unreadCount = notifications.filter((n) => n.unread).length

  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark")

  const handleReset = () => {
    resetDemo()
    toast.success("演示数据已重置", {
      description: "所有筛选、编辑与状态改动都已恢复。",
    })
  }

  const openNotification = (title: string) => {
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
                      aria-label="通知"
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
            <TooltipContent side="bottom">通知</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>通知</DropdownMenuLabel>
            {notifications.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                没有新通知了。
              </p>
            ) : (
              notifications.map((notification) => {
                const Icon = KIND_ICON[notification.kind]
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    onSelect={() => openNotification(notification.title)}
                    className="items-start gap-2.5 py-2"
                  >
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
                  </DropdownMenuItem>
                )
              })
            )}
            {unreadCount > 0 ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={markAllNotificationsRead} className="justify-center">
                  全部标为已读
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
              <PopoverTitle>原型状态</PopoverTitle>
              <PopoverDescription>
                强制触发加载、错误与重置流程，预览所有状态。
              </PopoverDescription>
            </PopoverHeader>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" type="button" className="justify-start" onClick={refresh}>
                <RotateCwIcon /> 模拟慢加载
              </Button>
              <Button
                variant="ghost"
                type="button"
                className="justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  simulateApiFailure()
                  toast.error("请求失败", {
                    description: "仪表盘已切换到错误状态。",
                  })
                }}
              >
                <TriangleAlertIcon /> 模拟接口失败
              </Button>
              <Separator className="my-1" />
              <Button variant="ghost" type="button" className="justify-start" onClick={handleReset}>
                <RotateCwIcon /> 重置演示数据
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
                aria-label="账户菜单"
                data-testid="account-menu"
                className="gap-2 pl-1.5"
              />
            }
          >
            <Avatar size="sm">
              <AvatarFallback>TW</AvatarFallback>
            </Avatar>
            <span className="hidden text-xs font-medium lg:inline">Taylor Wu</span>
            <ChevronDownIcon className="hidden size-3 text-muted-foreground lg:inline" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              Taylor Wu
              <span className="text-[10px] font-normal text-muted-foreground">
                taylor@northwind.dev
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onNavigate("settings")}>
              <SettingsIcon /> 快速上手
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toast.info("当前仅有一个工作区", {
                  description: "多工作区切换会在后续版本提供。",
                })
              }
            >
              <UsersIcon /> 工作区
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                handleReset()
                toast.error("已退出登录", { description: "已回到演示初始状态。" })
              }}
            >
              <LogOutIcon /> 退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}