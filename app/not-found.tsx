import type { Metadata } from "next"
import Link from "next/link"
import { NotFoundState } from "@/components/prototype/not-found-state"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = { title: "Not found" }

/**
 * 全站 404。未匹配的 URL（例如 /crm/whatever）由这里兜底，
 * 永远给出真实可用的下一步，避免死胡同。
 */
export default function AppNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-gutter py-16">
      <div className="w-full max-w-content">
        <NotFoundState
          code="404"
          testId="app-not-found"
          title="This page doesn't exist"
          description="The URL you followed isn't part of this prototype. Everything below is a real, working destination."
          action={{ label: "AI CRM dashboard", href: "/crm" }}
          suggestions={[
            { label: "Customers", href: "/crm/customers" },
            { label: "Tasks", href: "/crm/tasks" },
            { label: "Activities", href: "/crm/activities" },
          ]}
        />
        <div className="mt-6 flex justify-center">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Back to the landing page
          </Link>
        </div>
      </div>
    </main>
  )
}
