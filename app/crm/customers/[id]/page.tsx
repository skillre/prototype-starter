"use client"

import { use, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarIcon,
  CopyIcon,
  KanbanSquareIcon,
  MailIcon,
  PhoneIcon,
  StickyNoteIcon,
  UserIcon,
  ZapIcon,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState } from "@/components/prototype/empty-state"
import { NotFoundState } from "@/components/prototype/not-found-state"
import { AiSummaryPanel } from "@/components/prototype/ai-summary-panel"
import { CrmDataBoundary } from "../../_components/crm-data-boundary"
import { TASK_COLUMNS, STATUS_META, ACTIVITY_META, type ActivityKind } from "@/lib/crm-data"
import { selectActivities, useCrmStore } from "@/stores/crm-store"
import { formatCurrency } from "@/lib/format"
import { durations, easings } from "@/lib/motion-presets"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<ActivityKind, typeof MailIcon> = {
  email: MailIcon,
  call: PhoneIcon,
  meeting: CalendarIcon,
  note: StickyNoteIcon,
  status: ZapIcon,
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

export default function CrmCustomerDetailPage({ params }: PageProps<"/crm/customers/[id]">) {
  // Next.js 16：params 是 Promise，用 React.use() 解包。
  const { id } = use(params)

  const customers = useCrmStore((s) => s.customers)
  const activities = useCrmStore((s) => s.activities)
  const tasks = useCrmStore((s) => s.tasks)
  const status = useCrmStore((s) => s.status)
  const aiStatus = useCrmStore((s) => s.aiStatus)
  const aiSummary = useCrmStore((s) => s.aiSummary)
  const selectCustomer = useCrmStore((s) => s.selectCustomer)
  const generateAiSummary = useCrmStore((s) => s.generateAiSummary)
  const router = useRouter()

  const customer = useMemo(() => customers.find((c) => c.id === id) ?? null, [customers, id])

  const timeline = useMemo(
    () =>
      selectActivities({
        activities: activities.filter((a) => a.customerId === id),
        activityKindFilter: "all",
        activityOwnerFilter: "all",
      }),
    [activities, id]
  )

  const relatedTasks = useMemo(
    () =>
      TASK_COLUMNS.flatMap((column) =>
        (tasks[column.id] ?? [])
          .filter((task) => task.company === customer?.company)
          .map((task) => ({ task, column }))
      ),
    [tasks, customer]
  )

  // 数据尚未加载完成时不要误报 404。
  if (status === "ready" && !customer) {
    return (
      <CrmDataBoundary route="customers" title="Customer not found" loadingVariant="rows">
        <NotFoundState
          code="404"
          testId="customer-not-found"
          title="We couldn't find that customer"
          description={`No record matches the id “${id}”. It may have been removed, or the link may be out of date.`}
          action={{ label: "Back to customers", href: "/crm/customers" }}
          suggestions={[{ label: "Go to dashboard", href: "/crm" }]}
        />
      </CrmDataBoundary>
    )
  }

  return (
    <CrmDataBoundary
      route="customers"
      title={customer?.company ?? "Customer"}
      description={customer ? `${customer.name} · ${customer.title}` : "Loading record…"}
      loadingVariant="rows"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/crm/customers"
            data-testid="back-to-customers"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeftIcon />
            Back
          </Link>
          {customer ? (
            <Button
              size="sm"
              variant="outline"
              data-testid="detail-open-drawer"
              onClick={() => {
                selectCustomer(customer.id)
                router.push("/crm/customers")
              }}
            >
              Open in list
            </Button>
          ) : null}
        </div>
      }
    >
      {customer ? (
        <div className="flex flex-col gap-5">
          {/* 概要 */}
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
            {customer.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
            <span className="ml-auto text-subtitle font-semibold tabular-nums">
              {customer.value > 0 ? formatCurrency(customer.value) : "—"}
              <span className="ml-1.5 text-caption font-normal text-muted-foreground">
                annual value
              </span>
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* 左列：资料 + 备注 + AI */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <Card size="sm">
                <CardHeader className="border-b pb-3">
                  <div>
                    <CardTitle>Account details</CardTitle>
                    <CardDescription>Everything on file for this record.</CardDescription>
                  </div>
                  <CardAction>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(customer.email)
                          toast.success("Email copied", { description: customer.email })
                        } catch {
                          toast.error("Clipboard unavailable")
                        }
                      }}
                      data-testid="detail-copy-email"
                    >
                      <CopyIcon />
                      Copy email
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <InfoRow icon={UserIcon} label="Primary contact" value={customer.name} />
                    <InfoRow icon={Building2Icon} label="Job title" value={customer.title} />
                    <InfoRow icon={MailIcon} label="Email" value={customer.email} />
                    <InfoRow icon={PhoneIcon} label="Phone" value={customer.phone} />
                    <InfoRow icon={UserIcon} label="Owner" value={customer.owner} />
                    <InfoRow icon={CalendarIcon} label="Customer since" value={customer.createdAt} />
                  </dl>

                  <Separator className="my-5" />

                  <div className="flex flex-col gap-1.5">
                    <span className="text-label text-muted-foreground">Notes</span>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {customer.notes}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <AiSummaryPanel
                testId="ai-summary-page"
                status={aiStatus}
                summary={aiSummary}
                onGenerate={() => generateAiSummary(customer.id)}
              />

              {/* 完整时间线 */}
              <Card size="sm">
                <CardHeader className="border-b pb-3">
                  <div>
                    <CardTitle>Activity timeline</CardTitle>
                    <CardDescription>
                      {timeline.length} recorded {timeline.length === 1 ? "event" : "events"} for
                      this account.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {timeline.length === 0 ? (
                    <EmptyState
                      icon={CalendarIcon}
                      title="No activity yet"
                      description="Emails, calls and meetings logged against this customer will appear here."
                      action={
                        <Link
                          href="/crm/activities"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Browse all activities
                        </Link>
                      }
                    />
                  ) : (
                    <ol className="flex flex-col" data-testid="detail-timeline">
                      {timeline.map((event, index) => {
                        const Icon = KIND_ICON[event.kind]
                        return (
                          <motion.li
                            key={event.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: durations.fast, ease: easings.outExpo }}
                            className="relative flex gap-3 pb-5 last:pb-0"
                          >
                            {index !== timeline.length - 1 ? (
                              <span
                                aria-hidden
                                className="absolute top-9 left-[15px] h-[calc(100%-2.25rem)] w-px bg-border"
                              />
                            ) : null}
                            <span className="relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground">
                              <Icon className="size-3.5" />
                            </span>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-sm font-medium">{event.title}</span>
                                <Badge variant="outline" className="h-5 px-1.5 text-label font-normal">
                                  {ACTIVITY_META[event.kind].label}
                                </Badge>
                                <span className="ml-auto shrink-0 text-label text-muted-foreground">
                                  {event.time}
                                </span>
                              </div>
                              <p className="text-caption leading-relaxed text-muted-foreground">
                                {event.detail}
                              </p>
                              <span className="text-label text-muted-foreground">
                                {event.actor}
                              </span>
                            </div>
                          </motion.li>
                        )
                      })}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右列：相关任务 */}
            <div className="flex flex-col gap-4">
              <Card size="sm">
                <CardHeader className="border-b pb-3">
                  <div>
                    <CardTitle>Open tasks</CardTitle>
                    <CardDescription>Linked to this account.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {relatedTasks.length === 0 ? (
                    <EmptyState
                      icon={KanbanSquareIcon}
                      title="No open tasks"
                      description="Nothing queued for this account right now."
                      action={
                        <Link
                          href="/crm/tasks"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Open task board
                        </Link>
                      }
                    />
                  ) : (
                    <ul className="flex flex-col gap-2.5">
                      {relatedTasks.map(({ task, column }) => (
                        <li
                          key={task.id}
                          className="flex flex-col gap-1.5 rounded-field border bg-card p-3"
                        >
                          <span className="text-sm font-medium">{task.title}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-5 px-1.5 text-label font-normal">
                              {column.title}
                            </Badge>
                            <span className="inline-flex items-center gap-1 text-label text-muted-foreground">
                              <CalendarIcon className="size-3" />
                              {task.due}
                            </span>
                          </div>
                        </li>
                      ))}
                      <li>
                        <Link
                          href="/crm/tasks"
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "w-full",
                          })}
                        >
                          Open task board
                        </Link>
                      </li>
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <div>
                    <CardTitle>Owner</CardTitle>
                    <CardDescription>Account executive</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback>{initials(customer.owner)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-sm font-medium">{customer.owner}</span>
                      <span className="truncate text-caption text-muted-foreground">
                        {customer.owner.toLowerCase().replace(" ", ".")}@salestudio.ai
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <div>
                    <CardTitle>Notes on file</CardTitle>
                    <CardDescription>Internal only</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 text-caption text-muted-foreground">
                    <StickyNoteIcon className="mt-0.5 size-3.5 shrink-0" />
                    <p className="leading-relaxed">{customer.notes}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </CrmDataBoundary>
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
