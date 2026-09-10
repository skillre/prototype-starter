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
import { useMessages } from "@/components/i18n/locale-provider"
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

/** 页面元信息（眉标/标题/副标题）由词典提供，见下方的 useCrmPageMeta。 */
export function useCrmPageMeta(): Record<
  CrmRouteKey,
  { eyebrow: string; title: string; description: string }
> {
  const t = useMessages()
  return useMemo(
    () => ({
      dashboard: t.page.dashboard,
      customers: t.page.customers,
      tasks: t.page.tasks,
      activities: t.page.activities,
    }),
    [t]
  )
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
 * 智销云 CRM 的共享外壳：Sidebar / TopNav / MobileNav / CommandPalette /
 * Add Customer Dialog / Customer Detail Drawer。放在 app/crm/layout.tsx，
 * 因此每个真实路由都拥有同一套导航与全局交互，切换页面不会重建外壳。
 */
export function CrmShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useMessages()

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

  const brand = useMemo<NavBrandDef>(
    () => ({
      name: t.brand.name,
      subtitle: t.brand.subtitle,
      mark: (
        <span className="relative flex size-7 items-center justify-center rounded-field bg-primary text-[13px] font-semibold text-primary-foreground shadow-subtle">
          {t.brand.mark}
        </span>
      ),
    }),
    [t]
  )

  const account = useMemo<NavUserDef>(
    () => ({
      name: t.account.name,
      email: t.account.email,
      initials: t.account.initials,
    }),
    [t]
  )

  const profile = useMemo<ProfileDetails>(
    () => ({
      name: t.account.name,
      email: t.account.email,
      initials: t.account.initials,
      role: t.account.role,
      workspace: t.account.workspace,
      plan: t.account.plan,
    }),
    [t]
  )

  const pageMeta = useCrmPageMeta()

  // 当前激活的路由 key（用于侧栏高亮）。详情页归属 Customers。
  const activeRoute: CrmRouteKey = useMemo(() => {
    if (pathname.startsWith("/crm/customers")) return "customers"
    if (pathname.startsWith("/crm/tasks")) return "tasks"
    if (pathname.startsWith("/crm/activities")) return "activities"
    return "dashboard"
  }, [pathname])

  const navItems = useMemo<NavItemDef[]>(
    () => [
      { id: "dashboard", label: t.nav.dashboard, icon: LayoutDashboardIcon, href: CRM_ROUTES.dashboard },
      { id: "customers", label: t.nav.customers, icon: UsersIcon, href: CRM_ROUTES.customers },
      { id: "tasks", label: t.nav.tasks, icon: ListChecksIcon, href: CRM_ROUTES.tasks },
      { id: "activities", label: t.nav.activities, icon: ActivityIcon, href: CRM_ROUTES.activities },
      // 「添加客户」是一个动作而不是页面：用 tone 与页面导航区分开。
      { id: "add-customer", label: t.nav.addCustomer, icon: PlusIcon, tone: "action" },
    ],
    [t]
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
   * 抽屉里的「查看客户档案」：关闭抽屉并停留在详情页。
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
        heading: t.palette.navigate,
        items: [
          {
            id: "go-dashboard",
            label: t.palette.goDashboard,
            icon: LayoutDashboardIcon,
            keywords: t.palette.keywords.dashboard,
            shortcut: "G D",
            onSelect: () => router.push(CRM_ROUTES.dashboard),
          },
          {
            id: "go-customers",
            label: t.palette.goCustomers,
            icon: UsersIcon,
            keywords: t.palette.keywords.customers,
            shortcut: "G C",
            onSelect: () => router.push(CRM_ROUTES.customers),
          },
          {
            id: "go-tasks",
            label: t.palette.goTasks,
            icon: ListChecksIcon,
            keywords: t.palette.keywords.tasks,
            shortcut: "G T",
            onSelect: () => router.push(CRM_ROUTES.tasks),
          },
          {
            id: "go-activities",
            label: t.palette.goActivities,
            icon: ActivityIcon,
            keywords: t.palette.keywords.activities,
            shortcut: "G A",
            onSelect: () => router.push(CRM_ROUTES.activities),
          },
        ],
      },
      {
        heading: t.palette.actions,
        items: [
          {
            id: "add-customer",
            label: t.palette.addCustomer,
            icon: PlusIcon,
            keywords: t.palette.keywords.addCustomer,
            shortcut: "N",
            onSelect: () => setAddCustomerOpen(true),
          },
          {
            id: "toggle-theme",
            label: t.palette.toggleTheme,
            icon: SunMoonIcon,
            keywords: t.palette.keywords.theme,
            onSelect: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
          },
          {
            id: "refresh",
            label: t.palette.refresh,
            icon: RotateCwIcon,
            keywords: t.palette.keywords.refresh,
            onSelect: () => {
              refresh()
              toast.success(t.toast.refreshed)
            },
          },
          {
            id: "simulate-error",
            label: t.palette.simulateError,
            icon: TriangleAlertIcon,
            keywords: t.palette.keywords.error,
            onSelect: () => {
              simulateError()
              toast.error(t.toast.refreshFailed, { description: t.toast.refreshFailedDescription })
            },
          },
        ],
      },
    ],
    [refresh, resolvedTheme, router, setTheme, simulateError, t]
  )

  const shellValue = useMemo<ShellContextValue>(
    () => ({
      openAddCustomer: () => setAddCustomerOpen(true),
      openCommandPalette: () => setCommandOpen(true),
    }),
    []
  )

  const meta = pageMeta[activeRoute]

  return (
    <ShellContext.Provider value={shellValue}>
      <div data-testid="crm-root" className="flex min-h-dvh">
        <Sidebar
          active={activeRoute}
          onNavigate={navigate}
          brand={brand}
          items={navItems}
          user={account}
          usage={null}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="hidden lg:block">
            <TopNav
              // 面包屑式上下文（不是重复页面 H1——页面头部才是标题本体）。
              title={t.page.breadcrumb(meta.title)}
              subtitle={t.brand.subtitle}
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
                  toast.success(t.toast.notificationsRead)
                },
                // 通知携带 customerId 时直达客户详情页，否则回到动态页。
                notificationHref: (notification) =>
                  notification.customerId
                    ? `/crm/customers/${notification.customerId}`
                    : CRM_ROUTES.activities,
                onSignOut: () => setSignOutOpen(true),
                primaryNavId: "profile",
                primaryNavLabel: t.dialogs.profile.title,
                account: { name: account.name, email: account.email, initials: account.initials },
              }}
            />
          </div>
          <div className="lg:hidden">
            <MobileNav
              title={meta.title}
              active={activeRoute}
              onNavigate={navigate}
              onOpenCommand={() => setCommandOpen(true)}
              brand={brand}
              items={navItems}
              user={account}
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
          profile={profile}
          testId="profile-dialog"
        />

        <SignOutDialog
          open={signOutOpen}
          onOpenChange={setSignOutOpen}
          accountEmail={account.email}
          testId="sign-out-dialog"
          onConfirm={reset}
        />
      </div>
    </ShellContext.Provider>
  )
}
