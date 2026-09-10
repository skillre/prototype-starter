"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import { toast } from "sonner"
import {
  ArrowRightIcon,
  Building2Icon,
  CalendarIcon,
  CopyIcon,
  MailIcon,
  PhoneIcon,
  StickyNoteIcon,
  UserIcon,
  ZapIcon,
} from "lucide-react"
import { DetailDrawer } from "@/components/prototype/detail-drawer"
import { AiSummaryPanel } from "@/components/prototype/ai-summary-panel"
import { EmptyState } from "@/components/prototype/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ACTIVITY_META,
  STATUS_META,
  type ActivityKind,
  type CrmActivity,
} from "@/lib/crm-data"
import { selectActivities, useCrmStore } from "@/stores/crm-store"
import { formatCurrency } from "@/lib/format"
import { durations, easings } from "@/lib/motion-presets"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<ActivityKind, typeof MailIcon> = {
  email: MailIcon,
  call: PhoneIcon,
  meeting: CalendarIcon,
  note: StickyNoteIcon,
  status: ZapIcon,
}

/**
 * 客户详情抽屉：资料、标签、备注、AI 摘要与活动时间线。
 *
 * `onViewAccount` 由 shell 注入：抽屉底部的「Open account」会导航到真实的
 * /crm/customers/[id] 页面，而不是停留在提示性的 toast。
 */
export function CustomerDetailDrawer({
  onViewAccount,
}: {
  onViewAccount: (customerId: string) => void
}) {
  const selectedCustomerId = useCrmStore((s) => s.selectedCustomerId)
  const customers = useCrmStore((s) => s.customers)
  const activities = useCrmStore((s) => s.activities)
  const aiStatus = useCrmStore((s) => s.aiStatus)
  const aiSummary = useCrmStore((s) => s.aiSummary)
  const selectCustomer = useCrmStore((s) => s.selectCustomer)
  const generateAiSummary = useCrmStore((s) => s.generateAiSummary)

  const customer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  )

  // 该客户自己的时间线，按时间倒序。
  const timeline = useMemo(
    () =>
      customer
        ? selectActivities({
            activities: activities.filter((a) => a.customerId === customer.id),
            activityKindFilter: "all",
            activityOwnerFilter: "all",
          })
        : [],
    [activities, customer]
  )

  const open = Boolean(customer)

  const copyEmail = async () => {
    if (!customer) return
    try {
      await navigator.clipboard.writeText(customer.email)
      toast.success("Email copied", { description: customer.email })
    } catch {
      toast.error("Clipboard unavailable", { description: "Grant clipboard access and retry." })
    }
  }

  return (
    <DetailDrawer
      testId="customer-drawer"
      closeLabel="Close"
      open={open}
      onOpenChange={(next) => {
        if (!next) selectCustomer(null)
      }}
      title={customer?.name}
      description={customer?.company}
      className="sm:data-[swipe-axis=x]:[--drawer-content-width:32rem]"
      footer={
        customer ? (
          <>
            <Button type="button" variant="outline" className="flex-1" onClick={copyEmail}>
              <CopyIcon />
              Copy email
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => onViewAccount(customer.id)}
              data-testid="open-account"
            >
              Open account
              <ArrowRightIcon />
            </Button>
          </>
        ) : null
      }
    >
      {customer ? (
        <div className="flex flex-col gap-5 pt-1">
          {/* 头部：状态 + 金额 */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-medium",
                STATUS_META[customer.status].chip
              )}
            >
              <span className={cn("size-1.5 rounded-full", STATUS_META[customer.status].dot)} />
              {STATUS_META[customer.status].label}
            </span>
            <Badge variant="outline">{customer.plan}</Badge>
            <span className="ml-auto text-sm font-semibold tabular-nums">
              {customer.value > 0 ? formatCurrency(customer.value) : "—"}
            </span>
          </div>

          {/* 资料 */}
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <InfoRow icon={UserIcon} label="Owner" value={customer.owner} />
            <InfoRow icon={Building2Icon} label="Title" value={customer.title} />
            <InfoRow icon={MailIcon} label="Email" value={customer.email} />
            <InfoRow icon={PhoneIcon} label="Phone" value={customer.phone} />
            <InfoRow icon={CalendarIcon} label="Created" value={customer.createdAt} />
            <InfoRow
              icon={StickyNoteIcon}
              label="Last touch"
              value={
                customer.lastTouchHours < 24
                  ? `${Math.max(1, Math.round(customer.lastTouchHours))}h ago`
                  : `${Math.round(customer.lastTouchHours / 24)}d ago`
              }
            />
          </dl>

          {/* 标签 */}
          {customer.tags.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-label text-muted-foreground">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {/* 备注 */}
          <div className="flex flex-col gap-1.5">
            <span className="text-label text-muted-foreground">Notes</span>
            <p className="text-sm leading-relaxed text-muted-foreground">{customer.notes}</p>
          </div>

          <AiSummaryPanel
            testId="ai-summary"
            status={aiStatus}
            summary={aiSummary}
            onGenerate={() => generateAiSummary(customer.id)}
          />

          <Separator />

          {/* 活动时间线 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-label text-muted-foreground">Activity timeline</span>
              <span className="text-label text-muted-foreground">{timeline.length} events</span>
            </div>

            {timeline.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No activity yet"
                description="Emails, calls and meetings logged against this customer will appear here."
              />
            ) : (
              <ol className="flex flex-col">
                {timeline.map((event, index) => (
                  <TimelineRow
                    key={event.id}
                    event={event}
                    isLast={index === timeline.length - 1}
                  />
                ))}
              </ol>
            )}
          </div>
        </div>
      ) : null}
    </DetailDrawer>
  )
}

function TimelineRow({ event, isLast }: { event: CrmActivity; isLast: boolean }) {
  const Icon = KIND_ICON[event.kind]
  return (
    <motion.li
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: durations.fast, ease: easings.outExpo }}
      className="relative flex gap-3 pb-4 last:pb-0"
    >
      {/* 竖线 */}
      {!isLast ? (
        <span aria-hidden className="absolute top-8 left-[13px] h-[calc(100%-2rem)] w-px bg-border" />
      ) : null}

      <span className="relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground">
        <Icon className="size-3.5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium">{event.title}</span>
          <span className="shrink-0 text-label text-muted-foreground">{event.time}</span>
        </div>
        <span className="text-caption text-muted-foreground">{event.detail}</span>
        <span className="text-label text-muted-foreground">
          {ACTIVITY_META[event.kind].label} · {event.actor}
        </span>
      </div>
    </motion.li>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MailIcon
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-label text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium">{value}</dd>
      </div>
    </div>
  )
}
