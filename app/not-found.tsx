import type { Metadata } from "next"
import { NotFoundState } from "@/components/prototype/not-found-state"
import { messages } from "@/lib/i18n"

export const metadata: Metadata = { title: messages.notFound.app.metaTitle }

const t = messages.notFound.app

/**
 * 全站 404。未匹配的 URL（例如 /crm/whatever）由这里兜底，
 * 永远给出真实可用的下一步，避免死胡同。
 */
export default function AppNotFound() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-gutter py-16">
      <div className="w-full max-w-content">
        {/* 全站 404 不属于任何产品：主行动回到首页。
            Reference Sample 的导航不能出现在这里 —— 那会让派生出来的新原型
            看起来"默认就是 CRM"（INIT 边界审计的重点之一）。 */}
        <NotFoundState
          code="404"
          testId="app-not-found"
          title={t.title}
          description={t.description}
          action={{ label: t.action, href: "/" }}
        />
      </div>
    </main>
  )
}
