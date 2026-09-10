"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
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
import { CommandPalette, type PaletteGroup } from "@/components/prototype/command-palette"
import { ProfileDialog, type ProfileDetails } from "@/components/prototype/profile-dialog"
import { SignOutDialog } from "@/components/prototype/sign-out-dialog"
import { useHotkey } from "@/hooks/use-hotkey"
import { useCrmStore } from "@/stores/crm-store"
import { AddCustomerDialog } from "./add-customer-dialog"
import { CustomerDetailDrawer } from "./customer-detail-drawer"

/** CRM 的真实路由表——导航、命令面板与详情页都以此为唯一来源。 */
export const CRM_ROUTES = {
  dashboard: "/crm",
  customers: "/crm/customers",
  tasks: "/crm/tasks",
  activities: "/crm/activities",
} as const

export type CrmRouteKey = keyof typeof CRM_ROUTES

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

const PROFILE: ProfileDetails = {
  name: "Maya Chen",
  email: "maya@salestudio.ai",
  initials: "MC",
  role: "Senior Account Executive",
  workspace: "AI CRM",
  plan: "Growth (internal)",
}

export const CRM_PAGE_META: Record<CrmRouteKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Dashboard", subtitle: "Pipeline health · September 2026" },
  customers: { title: "Customers", subtitle: "Every account in the book" },
  tasks: { title: "Tasks", subtitle: "Drag cards between columns" },
  activities: { title: "Activities", subtitle: "Full engagement timeline" },
}

type ShellContextValue = {
  /** 打开「添加客户」对话框（任何页面都能调用）。 */
  openAddCustomer: () => void
  /** 打开命令面板。 */
  openCommandPalette: () => void
}

const ShellContext = createContext<ShellContextValue>({
  openAddCustomer: () => {},
  openCommandPalette: () => {},
})

/** 页面内组件用它触发 shell 级交互（对话框 / 命令面板）。 */
export function useCrmShell(): ShellContextValue {
  return useContext(ShellContext)
}

/**
 * AI CRM 的共享外壳：Sidebar / TopNav / MobileNav / CommandPalette /
 * Add Customer Dialog / Customer Detail Drawer。放在 app/crm/layout.tsx，
 * 因此每个真实路由都拥有同一套导航与全局交互，切换页面不会重建外壳。
 */
export function CrmShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const [commandOpen, setCommandOpen] = useState(false)
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)

  const status = useCrmStore((s) => s.status)
  const initialize = useCrmStore((s) => s.initialize)
  const refresh = useCrmStore((s) => s.refresh)
  const simulateError = useCrmStore((s) => s.simulateError)
  const reset = useCrmStore((s) => s.reset)
  const selectCustomer = useCrmStore((s) => s.selectCustomer)
  const selectedCustomerId = useCrmStore((s) => s.selectedCustomerId)
  const notifications = useCrmStore((s) => s.notifications)
  const markAllNotificationsRead = useCrmStore((s) => s.markAllNotificationsRead)

  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    initialize()
  }, [initialize])

  useHotkey("k", () => setCommandOpen(true), { mod: true })

  // 当前激活的路由 key（用于侧栏高亮）。详情页归属 Customers。
  const activeRoute: CrmRouteKey = useMemo(() => {
    if (pathname.startsWith("/crm/customers")) return "customers"
    if (pathname.startsWith("/crm/tasks")) return "tasks"
    if (pathname.startsWith("/crm/activities")) return "activities"
    return "dashboard"
  }, [pathname])

  const navItems = useMemo<NavItemDef[]>(
    () => [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboardIcon, href: CRM_ROUTES.dashboard },
      { id: "customers", label: "Customers", icon: UsersIcon, href: CRM_ROUTES.customers },
      { id: "tasks", label: "Tasks", icon: ListChecksIcon, href: CRM_ROUTES.tasks },
      { id: "activities", label: "Activities", icon: ActivityIcon, href: CRM_ROUTES.activities },
      // 「Add Customer」是一个动作而不是页面：用 tone 与页面导航区分开。
      { id: "add-customer", label: "Add Customer", icon: PlusIcon, tone: "action" },
    ],
    []
  )

  const navigate = useCallback(
    (id: string) => {
      // 账户菜单里的动作有真实目的地：对话框，而不是「稍后提供」。
      if (id === "add-customer") {
        setAddCustomerOpen(true)
        return
      }
      if (id === "profile") {
        setProfileOpen(true)
        return
      }
      const href = CRM_ROUTES[id as CrmRouteKey]
      if (href) router.push(href)
    },
    [router]
  )

  /**
   * 抽屉里的「Open account」：关闭抽屉并停留在详情页。
   * 抽屉是 modal，若不关闭会一直遮挡底下的详情页并拦截点击。
   */
  const openAccountPage = useCallback(
    (customerId: string) => {
      selectCustomer(null)
      router.push(`/crm/customers/${customerId}`)
    },
    [router, selectCustomer]
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
            onSelect: () => router.push(CRM_ROUTES.dashboard),
          },
          {
            id: "go-customers",
            label: "Go to Customers",
            icon: UsersIcon,
            keywords: "accounts table list",
            shortcut: "G C",
            onSelect: () => router.push(CRM_ROUTES.customers),
          },
          {
            id: "go-tasks",
            label: "Open Tasks",
            icon: ListChecksIcon,
            keywords: "board kanban drag",
            shortcut: "G T",
            onSelect: () => router.push(CRM_ROUTES.tasks),
          },
          {
            id: "go-activities",
            label: "Go to Activities",
            icon: ActivityIcon,
            keywords: "timeline events emails calls",
            shortcut: "G A",
            onSelect: () => router.push(CRM_ROUTES.activities),
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
    [refresh, resolvedTheme, router, setTheme, simulateError]
  )

  const shellValue = useMemo<ShellContextValue>(
    () => ({
      openAddCustomer: () => setAddCustomerOpen(true),
      openCommandPalette: () => setCommandOpen(true),
    }),
    []
  )

  const meta = CRM_PAGE_META[activeRoute]

  return (
    <ShellContext.Provider value={shellValue}>
      <div data-testid="crm-root" className="flex min-h-dvh">
        <Sidebar
          active={activeRoute}
          onNavigate={navigate}
          brand={BRAND}
          items={navItems}
          user={ACCOUNT}
          usage={null}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="hidden lg:block">
            <TopNav
              // 面包屑式上下文（不是重复页面 H1——页面头部才是标题本体）。
              title={`AI CRM / ${meta.title}`}
              subtitle="Sales workspace"
              onOpenCommand={() => setCommandOpen(true)}
              onNavigate={navigate}
              dataSource={{
                notifications,
                status,
                onRefresh: refresh,
                onSimulateFailure: simulateError,
                onReset: reset,
                onMarkAllRead: () => {
                  markAllNotificationsRead()
                  toast.success("All notifications marked as read")
                },
                // 通知携带 customerId 时直达客户详情页，否则回到动态页。
                notificationHref: (notification) =>
                  notification.customerId
                    ? `/crm/customers/${notification.customerId}`
                    : CRM_ROUTES.activities,
                onSignOut: () => setSignOutOpen(true),
                primaryNavId: "profile",
                primaryNavLabel: "Profile",
                account: { name: ACCOUNT.name, email: ACCOUNT.email, initials: ACCOUNT.initials },
                labels: {
                  simulateSlowLoad: "Simulate slow load",
                  simulateFailure: "Simulate API failure",
                  resetData: "Reset prototype data",
                  resetToastTitle: "Prototype data reset",
                  resetToastDescription: "All customers, tasks and filters are back to their seed state.",
                  markAllRead: "Mark all as read",
                  signOut: "Sign out",
                  signOutToastTitle: "Signed out of the prototype",
                  signOutToastDescription: "Local session state has been reset.",
                  notificationsEmpty: "You're all caught up.",
                  prototypeState: "Prototype state",
                  prototypeStateDescription:
                    "Force the loading, error and reset flows to preview every state.",
                  accountMenu: "Account menu",
                },
              }}
            />
          </div>
          <div className="lg:hidden">
            <MobileNav
              title={meta.title}
              active={activeRoute}
              onNavigate={navigate}
              onOpenCommand={() => setCommandOpen(true)}
              brand={BRAND}
              items={navItems}
              user={ACCOUNT}
              usage={null}
            />
          </div>

          <main className="flex-1">{children}</main>
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
            // 新建后回到客户列表并打开抽屉：新行可见，同时能立即查看详情。
            router.push(CRM_ROUTES.customers)
            selectCustomer(id)
          }}
        />

        {selectedCustomerId ? <CustomerDetailDrawer onViewAccount={openAccountPage} /> : null}

        <ProfileDialog
          open={profileOpen}
          onOpenChange={setProfileOpen}
          profile={PROFILE}
          testId="profile-dialog"
        />

        <SignOutDialog
          open={signOutOpen}
          onOpenChange={setSignOutOpen}
          accountEmail={ACCOUNT.email}
          testId="sign-out-dialog"
          onConfirm={reset}
        />
      </div>
    </ShellContext.Provider>
  )
}
