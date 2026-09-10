"use client"

import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CrmDataBoundary } from "./_components/crm-data-boundary"
import { useCrmShell } from "./_components/crm-shell"
import { DashboardView } from "./_components/dashboard-view"

/** /crm —— Dashboard 路由。 */
export default function CrmDashboardPage() {
  const router = useRouter()
  const openAddCustomer = useCrmShell().openAddCustomer

  // 仪表盘是跨场景跳转：直接进入客户记录页，而不是在仪表盘上盖一层抽屉。
  const openCustomer = (customerId: string) => {
    router.push(`/crm/customers/${customerId}`)
  }

  return (
    <CrmDataBoundary
      route="dashboard"
      actions={
        <Button type="button" size="sm" onClick={openAddCustomer} data-testid="dashboard-add-customer">
          <PlusIcon />
          Add Customer
        </Button>
      }
    >
      <DashboardView
        onOpenCustomer={openCustomer}
        onGoToTasks={() => router.push("/crm/tasks")}
        onGoToCustomers={(filter) => {
          const query = filter?.status ? `?status=${filter.status}` : ""
          router.push(`/crm/customers${query}`)
        }}
      />
    </CrmDataBoundary>
  )
}
