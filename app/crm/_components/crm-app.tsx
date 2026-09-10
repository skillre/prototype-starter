"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { toast } from "sonner"
import {
  ActivityIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  PlusIcon,
  RotateCwIcon,
  SunMoonIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react"
import {
  Sidebar,
  type NavBrandDef,
  type NavItemDef,
  type NavUserDef,
} from "@/components/layout/sidebar"
import { TopNav } from "@/components/layout/top-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { PageContainer } from "@/components/layout/page-container"
import { PageTransition } from "@/components/motion/page-transition"
import { LoadingState } from "@/components/prototype/loading-state"
import { ErrorState } from "@/components/prototype/error-state"
import { CommandPalette, type PaletteGroup } from "@/components/prototype/command-palette"
import { useHotkey } from "@/hooks/use-hotkey"
import { useCrmStore } from "@/stores/crm-store"
import { DashboardView } from "./dashboard-view"
import { CustomersView } from "./customers-view"
import { TasksView } from "./tasks-view"
import { ActivitiesView } from "./activities-view"
import { AddCustomerDialog } from "./add-customer-dialog"
import { CustomerDetailDrawer } from "./customer-detail-drawer"

type CrmTab = "dashboard" | "customers" | "tasks" | "activities"

const BRAND: NavBrandDef = {
  name: "AI CRM",
  subtitle: "Sales workspace",
  mark: (
    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <span className="text-[13px] font-semibold tracking-tight">AI</span>
    </span>
  ),
}

const ACCOUNT: NavUserDef = {
  name: "Maya Chen",
  email: "maya@salestudio.ai",
  initials: "MC",
}

const TAB_META: Record<CrmTab, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Pipeline health · September 2026" },
  customers: { title: "Customers", subtitle: "Every account in the book" },
  tasks: { title: "Tasks", subtitle: "Drag cards between columns" },
  activities: { title: "Activities", subtitle: "Full engagement timeline" },
}

const NOTIFICATIONS = [
  {
    id: "cn1",
    kind: "trial" as const,
    title: "Trial ending soon",
    description: "Helio Semiconductor's trial closes in 5 days",
    time: "2h ago",
    unread: true,
  },
  {
    id: "cn2",
    kind: "payment" as const,
    title: "Contract signed",
    description: "Beacon Health Group returned the 3-year term",
    time: "5h ago",
    unread: true,
  },
  {
    id: "cn3",
    kind: "usage" as const,
    title: "Account at risk",
    description: "Verdant Agriculture has gone 12 days without contact",
    time: "1d ago",
    unread: true,
  },
  {
    id: "cn4",
    kind: "report" as const,
    title: "Weekly pipeline report",
    description: "Aug 31 – Sep 6 summary is ready",
    time: "3d ago",
    unread: false,
  },
]

export function CrmApp() {
  const [activeTab, setActiveTab] = useState<CrmTab>("dashboard")
  const [commandOpen, setCommandOpen] = useState(false)
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)

  const status = useCrmStore((s) => s.status)
  const errorMessage = useCrmStore((s) => s.errorMessage)
  const initialize = useCrmStore((s) => s.initialize)
  const refresh = useCrmStore((s) => s.refresh)
  const simulateError = useCrmStore((s) => s.simulateError)
  const reset = useCrmStore((s) => s.reset)
  const selectCustomer = useCrmStore((s) => s.selectCustomer)
  const selectedCustomerId = useCrmStore((s) => s.selectedCustomerId)

  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    initialize()
  }, [initialize])

  useHotkey("k", () => setCommandOpen(true), { mod: true })

  const navigate = useCallback(
    (id: string) => {
      if (id === "add-customer") {
        setAddCustomerOpen(true)
        return
      }
      setActiveTab(id as CrmTab)
    },
    []
  )

  const navItems = useMemo<NavItemDef[]>(
    () => [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
      { id: "customers", label: "Customers", icon: UsersIcon },
      { id: "tasks", label: "Tasks", icon: ListChecksIcon },
      { id: "activities", label: "Activities", icon: ActivityIcon },
      { id: "add-customer", label: "Add Customer", icon: PlusIcon },
    ],
    []
  )

  const openCustomer = useCallback(
    (id: string) => {
      selectCustomer(id)
    },
    [selectCustomer]
  )

  const paletteGroups = useMemo<PaletteGroup[]>(
    () => [
      {
        heading: "Navigate",
        items: [
          {
            id: "go-dashboard",
            label: "Go to Dashboard",
            icon: LayoutDashboardIcon,
            keywords: "home overview kpi",
            shortcut: "G D",
            onSelect: () => setActiveTab("dashboard"),
          },
          {
            id: "go-customers",
            label: "Go to Customers",
            icon: UsersIcon,
            keywords: "accounts table list",
            shortcut: "G C",
            onSelect: () => setActiveTab("customers"),
          },
          {
            id: "go-tasks",
            label: "Open Tasks",
            icon: ListChecksIcon,
            keywords: "board kanban drag",
            shortcut: "G T",
            onSelect: () => setActiveTab("tasks"),
          },
          {
            id: "go-activities",
            label: "Go to Activities",
            icon: ActivityIcon,
            keywords: "timeline events emails calls",
            shortcut: "G A",
            onSelect: () => setActiveTab("activities"),
          },
        ],
      },
      {
        heading: "Actions",
        items: [
          {
            id: "add-customer",
            label: "Add Customer",
            icon: PlusIcon,
            keywords: "new create account",
            shortcut: "N",
            onSelect: () => setAddCustomerOpen(true),
          },
          {
            id: "toggle-theme",
            label: "Toggle theme",
            icon: SunMoonIcon,
            keywords: "dark light mode appearance",
            onSelect: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
          },
          {
            id: "refresh",
            label: "Refresh data",
            icon: RotateCwIcon,
            keywords: "reload sync",
            onSelect: () => {
              refresh()
              toast.success("Pipeline refreshed")
            },
          },
          {
            id: "simulate-error",
            label: "Simulate API failure",
            icon: TriangleAlertIcon,
            keywords: "error state offline",
            onSelect: () => {
              simulateError()
              toast.error("Request failed", { description: "Switched to the error state." })
            },
          },
        ],
      },
    ],
    [refresh, resolvedTheme, setTheme, simulateError]
  )

  const meta = TAB_META[activeTab]

  return (
    <div data-testid="crm-root" className="flex min-h-dvh">
      <Sidebar active={activeTab} onNavigate={navigate} brand={BRAND} items={navItems} user={ACCOUNT} usage={null} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="hidden lg:block">
          <TopNav
            title={meta.title}
            subtitle={meta.subtitle}
            onOpenCommand={() => setCommandOpen(true)}
            onNavigate={navigate}
            dataSource={{
              notifications: NOTIFICATIONS,
              status,
              onRefresh: refresh,
              onSimulateFailure: simulateError,
              onReset: reset,
              onMarkAllRead: () => toast.success("All notifications marked as read"),
              onOpenNotification: (title) => {
                setActiveTab("activities")
                toast.info(title)
              },
              settingsNavId: "add-customer",
              account: { name: ACCOUNT.name, email: ACCOUNT.email, initials: ACCOUNT.initials },
            }}
          />
        </div>
        <div className="lg:hidden">
          <MobileNav
            title={meta.title}
            active={activeTab}
            onNavigate={navigate}
            onOpenCommand={() => setCommandOpen(true)}
            brand={BRAND}
            items={navItems}
            user={ACCOUNT}
            usage={null}
          />
        </div>

        <main className="flex-1">
          <PageContainer
            title={meta.title}
            description={meta.subtitle}
            actions={
              <span className="hidden items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs text-muted-foreground lg:flex">
                <kbd className="rounded bg-muted px-1 font-mono text-[10px]">⌘K</kbd>
                Open command palette
              </span>
            }
          >
            {status === "error" ? (
              <div data-testid="crm-error">
                <ErrorState description={errorMessage ?? undefined} onRetry={refresh} />
              </div>
            ) : status === "loading" ? (
              <div data-testid="crm-loading" className="flex flex-col gap-6">
                <LoadingState variant="cards" count={5} />
                <LoadingState variant="section" />
                <LoadingState variant="rows" count={3} />
              </div>
            ) : (
              <div data-testid="crm-content">
                <PageTransition transitionKey={activeTab}>
                  {activeTab === "dashboard" ? (
                    <DashboardView
                      onOpenCustomer={openCustomer}
                      onGoToTasks={() => setActiveTab("tasks")}
                    />
                  ) : null}
                  {activeTab === "customers" ? (
                    <CustomersView onAddCustomer={() => setAddCustomerOpen(true)} />
                  ) : null}
                  {activeTab === "tasks" ? <TasksView /> : null}
                  {activeTab === "activities" ? <ActivitiesView /> : null}
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

      <AddCustomerDialog
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        onCreated={(id) => {
          // 新建后自动打开详情抽屉，并跳到客户列表以便看到新行。
          setActiveTab("customers")
          selectCustomer(id)
        }}
      />

      {selectedCustomerId ? <CustomerDetailDrawer /> : null}
    </div>
  )
}
