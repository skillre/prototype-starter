import type { Metadata } from "next"
import { CrmApp } from "./_components/crm-app"

export const metadata: Metadata = {
  title: "AI CRM",
  description:
    "A high-fidelity interactive AI CRM prototype — pipeline dashboard, customer table, detail drawer, drag-and-drop tasks and an activity timeline.",
}

export default function CrmPage() {
  return <CrmApp />
}
