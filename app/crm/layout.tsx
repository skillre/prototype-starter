import type { Metadata } from "next"
import { CrmShell } from "./_components/crm-shell"

export const metadata: Metadata = {
  title: "AI CRM",
  description:
    "A high-fidelity interactive AI CRM prototype — pipeline dashboard, customer table, detail pages, drag-and-drop tasks and an activity timeline.",
}

export default function CrmLayout({ children }: LayoutProps<"/crm">) {
  return <CrmShell>{children}</CrmShell>
}
