"use client"

import { useMemo, useState } from "react"
import { BellIcon, CheckCheckIcon, CreditCardIcon, UserPlusIcon, ZapIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/prototype/empty-state"
import { useDashboardStore } from "@/stores/dashboard-store"
import { cn } from "@/lib/utils"

const KIND_ICON = {
  payment: CreditCardIcon,
  trial: UserPlusIcon,
  usage: ZapIcon,
  report: BellIcon,
} as const

/**
 * 通知动态页。使用真实的 shadcn Tabs（全部 / 未读），单条点击即标为已读，
 * 当"未读"为空时展示空状态。
 */
export function ActivitySection() {
  const notifications = useDashboardStore((s) => s.notifications)
  const markAllNotificationsRead = useDashboardStore((s) => s.markAllNotificationsRead)
  const markNotificationRead = useDashboardStore((s) => s.markNotificationRead)
  const [tab, setTab] = useState("all")

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  )
  const visible = useMemo(
    () => (tab === "unread" ? notifications.filter((n) => n.unread) : notifications),
    [notifications, tab]
  )

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={setTab} data-testid="activity-tabs">
        <TabsList data-testid="activity-tabs-list">
          <TabsTrigger value="all" data-testid="tab-activity-all">
            全部 <span className="text-muted-foreground">{notifications.length}</span>
          </TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-activity-unread">
            未读{" "}
            <span className={cn(unreadCount > 0 && "text-chart-1")}>{unreadCount}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card size="sm" className="min-h-72">
        <CardHeader className="border-b pb-3">
          <div>
            <CardTitle>通知</CardTitle>
            <CardDescription>
              点击条目标记为已读，顶栏与侧栏的徽标会同步更新。
            </CardDescription>
          </div>
          <CardAction>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={markAllNotificationsRead}
              disabled={unreadCount === 0}
              data-testid="mark-all-read"
            >
              <CheckCheckIcon />
              全部标为已读
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {visible.length === 0 ? (
            <EmptyState
              icon={BellIcon}
              title="没有未读通知"
              description="所有通知都已读——切换到「全部」查看历史记录。"
              action={
                <Button type="button" variant="outline" size="sm" onClick={() => setTab("all")}>
                  查看全部通知
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col">
              {visible.map((notification) => {
                const Icon = KIND_ICON[notification.kind]
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => markNotificationRead(notification.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring/60",
                        notification.unread && "bg-accent/40"
                      )}
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          {notification.title}
                          {notification.unread ? (
                            <span className="size-1.5 shrink-0 rounded-full bg-chart-1" />
                          ) : null}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {notification.description}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}