"use client"

import { useEffect, useMemo, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { toast } from "sonner"
import {
  ActivityIcon,
  LayoutDashboardIcon,
  LightbulbIcon,
  PlusIcon,
  RotateCwIcon,
  SunMoonIcon,
  UsersIcon,
} from "lucide-react"
import { Sidebar, defaultNavItems, type NavId } from "@/components/layout/sidebar"
import { TopNav } from "@/components/layout/top-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { PageContainer } from "@/components/layout/page-container"
import { PageTransition } from "@/components/motion/page-transition"
import { LoadingState } from "@/components/prototype/loading-state"
import { ErrorState } from "@/components/prototype/error-state"
import { CommandPalette, type PaletteGroup } from "@/components/prototype/command-palette"
import { OnboardingWizard } from "@/components/prototype/onboarding-wizard"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useHotkey } from "@/hooks/use-hotkey"
import { useMessages } from "@/components/i18n/locale-provider"
import { useDashboardStore } from "@/stores/dashboard-store"
import { OverviewSection } from "./overview-section"
import { CustomersSection } from "./customers-section"
import { ActivitySection } from "./activity-section"

const TAB_META: Record<Exclude<NavId, "settings">, { title: string; subtitle: string }> = {
  overview: { title: "总览", subtitle: "Northwind Analytics · 9月1日 – 9月7日" },
  customers: { title: "客户", subtitle: "专业版及以下套餐的账户" },
  activity: { title: "动态", subtitle: "工作区内的所有事件" },
}

export function DemoApp() {
  const t = useMessages()
  const [activeTab, setActiveTab] = useState<Exclude<NavId, "settings">>("overview")
  const [commandOpen, setCommandOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)

  const status = useDashboardStore((s) => s.status)
  const errorMessage = useDashboardStore((s) => s.errorMessage)
  const notifications = useDashboardStore((s) => s.notifications)
  const initialize = useDashboardStore((s) => s.initialize)
  const refresh = useDashboardStore((s) => s.refresh)
  const resetDemo = useDashboardStore((s) => s.resetDemo)

  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    initialize()
  }, [initialize])

  useHotkey(
    "k",
    () => setCommandOpen(true),
    { mod: true }
  )

  const navigate = (id: NavId) => {
    if (id === "settings") {
      setWizardOpen(true)
      return
    }
    setActiveTab(id)
  }

  // 未读徽标由调用方派生（SidebarNav 本身不再读取 store，以便被其他原型复用）。
  const navItems = useMemo(
    () =>
      defaultNavItems(t).map((item) =>
        item.id === "activity"
          ? { ...item, badge: notifications.filter((n) => n.unread).length }
          : item
      ),
    [notifications, t]
  )

  const meta = TAB_META[activeTab]

  const paletteGroups = useMemo<PaletteGroup[]>(
    () => [
      {
        heading: "导航",
        items: [
          { id: "nav-overview", label: "前往总览", icon: LayoutDashboardIcon, keywords: "dashboard 首页", onSelect: () => setActiveTab("overview") },
          { id: "nav-customers", label: "前往客户", icon: UsersIcon, keywords: "账户 表格", onSelect: () => setActiveTab("customers") },
          { id: "nav-activity", label: "前往动态", icon: ActivityIcon, keywords: "通知 动态", onSelect: () => setActiveTab("activity") },
        ],
      },
      {
        heading: "操作",
        items: [
          { id: "add-customer", label: "添加客户", icon: PlusIcon, keywords: "新建 账户", onSelect: () => { setActiveTab("customers"); setAddCustomerOpen(true) } },
          { id: "refresh", label: "刷新数据", icon: RotateCwIcon, keywords: "重新加载", onSelect: refresh },
          { id: "wizard", label: "快速上手", icon: LightbulbIcon, keywords: "引导 设置", onSelect: () => setWizardOpen(true) },
          { id: "theme", label: "切换主题", icon: SunMoonIcon, keywords: "深浅色", shortcut: "⌘K →", onSelect: () => setTheme(resolvedTheme === "dark" ? "light" : "dark") },
          { id: "reset", label: "重置演示数据", icon: RotateCwIcon, keywords: "恢复", onSelect: () => { resetDemo(); toast.success("演示数据已重置") } },
        ],
      },
    ],
    [resolvedTheme, resetDemo, refresh, setTheme]
  )

  return (
    <div data-testid="demo-root" className="flex min-h-dvh">
      <Sidebar active={activeTab} onNavigate={navigate} items={navItems} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden lg:block">
          <TopNav
            title={meta.title}
            subtitle={meta.subtitle}
            onOpenCommand={() => setCommandOpen(true)}
            onNavigate={navigate}
          />
        </div>
        <div className="lg:hidden">
          <MobileNav
            title={meta.title}
            active={activeTab}
            onNavigate={navigate}
            onOpenCommand={() => setCommandOpen(true)}
            items={navItems}
          />
        </div>

        <main className="flex-1">
          <PageContainer
            title={meta.title}
            description={meta.subtitle}
            actions={
              <span className="hidden items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs text-muted-foreground lg:flex">
                <kbd className="rounded bg-muted px-1 font-mono text-[10px]">⌘K</kbd>
                打开命令面板
              </span>
            }
          >
            {status === "error" ? (
              <div data-testid="error-state">
                <ErrorState
                  description={errorMessage ?? undefined}
                  onRetry={refresh}
                />
              </div>
            ) : status === "loading" ? (
              <div data-testid="loading-state" className="flex flex-col gap-6">
                <LoadingState variant="cards" count={4} />
                <LoadingState variant="section" />
                <LoadingState variant="rows" count={3} />
              </div>
            ) : (
              <div data-testid="demo-content">
                <PageTransition transitionKey={activeTab}>
                  {activeTab === "overview" ? <OverviewSection /> : null}
                  {activeTab === "customers" ? (
                    <CustomersSection
                      addOpen={addCustomerOpen}
                      onAddOpenChange={setAddCustomerOpen}
                    />
                  ) : null}
                  {activeTab === "activity" ? <ActivitySection /> : null}
                </PageTransition>
              </div>
            )}
          </PageContainer>
        </main>
      </div>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        groups={paletteGroups}
        testId="command-palette"
      />

      <OnboardingWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        testId="onboarding-wizard"
        steps={[
          {
            id: "welcome",
            title: "欢迎使用",
            description: "简单告诉我们你将如何使用 Northwind。",
            render: ({ data, setData }) => (
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={(data.haveTeam as boolean) ?? false}
                    onCheckedChange={(checked) => setData("haveTeam", checked === true)}
                  />
                  团队共享
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={(data.personal as boolean) ?? false}
                    onCheckedChange={(checked) => setData("personal", checked === true)}
                  />
                  主要用于个人原型
                </label>
              </div>
            ),
          },
          {
            id: "role",
            title: "你的角色",
            description: "我们会据此定制引导流程。",
            render: ({ data, setData }) => (
              <RadioGroup
                value={String(data.role ?? "")}
                onValueChange={(next) => setData("role", next)}
              >
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted/60">
                  <RadioGroupItem value="designer" id="role-designer" />
                  <span className="text-sm">产品设计师</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted/60">
                  <RadioGroupItem value="engineer" id="role-engineer" />
                  <span className="text-sm">工程师</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted/60">
                  <RadioGroupItem value="founder" id="role-founder" />
                  <span className="text-sm">创始人 / 产品经理</span>
                </label>
              </RadioGroup>
            ),
            validate: (data) => (data.role ? null : "请选择一个角色后再继续。"),
          },
          {
            id: "confirm",
            title: "确认信息",
            description: "检查你的答案，然后完成设置。",
            render: ({ data }) => (
              <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <li>工作区：<span className="font-medium text-foreground">Northwind Analytics</span></li>
                <li>
                  团队账户：{" "}
                  <span className="font-medium text-foreground">
                    {data.haveTeam === true ? "是" : "否"}
                  </span>
                </li>
                <li>
                  角色：{" "}
                  <span className="font-medium text-foreground">{String(data.role ?? "—")}</span>
                </li>
              </ul>
            ),
          },
        ]}
        onComplete={() => {
          setWizardOpen(false)
          toast.success("工作区设置完成", {
            description: "这个向导是可复用的通用组件，见 components/prototype/onboarding-wizard。",
          })
        }}
      />
    </div>
  )
}