import type { Metadata } from "next"
import { NotFoundState } from "@/components/prototype/not-found-state"

export const metadata: Metadata = { title: "Not found" }

/**
 * /crm 段内的 404 —— 例如访问不存在的 /crm/reports。
 * 直接给出真实可用的下一步，而不是让用户卡在死胡同。
 */
export default function CrmNotFound() {
  return (
    <div className="mx-auto w-full max-w-dashboard px-gutter py-10 sm:px-8">
      <NotFoundState
        code="404"
        testId="crm-not-found"
        title="That CRM page doesn't exist"
        description="The page you're looking for isn't part of this prototype. Pick a destination below to keep going."
        action={{ label: "Back to dashboard", href: "/crm" }}
        suggestions={[
          { label: "Customers", href: "/crm/customers" },
          { label: "Tasks", href: "/crm/tasks" },
          { label: "Activities", href: "/crm/activities" },
        ]}
      />
    </div>
  )
}
