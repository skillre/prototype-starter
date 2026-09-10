"use client"

import { use, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "motion/react"
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
import { TASK_COLUMNS, STATUS_META, personInitials, type ActivityKind } from "@/lib/crm-data"
import { selectActivities, useCrmStore } from "@/stores/crm-store"
import { formatCurrency, formatDate, formatDateShort } from "@/lib/format"
import { durations, easings } from "@/lib/motion-presets"
import { useMessages } from "@/components/i18n/locale-provider"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<ActivityKind, typeof MailIcon> = {
  email: MailIcon,
  call: PhoneIcon,
  meeting: CalendarIcon,
  note: StickyNoteIcon,
  status: ZapIcon,
}

export default function CrmCustomerDetailPage({ params }: PageProps<"/crm/customers/[id]">) {
  // Next.js 16：params 是 Promise，用 React.use() 解包。
  const { id } = use(params)
  const t = useMessages()

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
      <CrmDataBoundary
        route="customers"
        eyebrow={t.customer.eyebrow}
        title={t.customer.notFound.pageTitle}
        loadingVariant="rows"
      >
        <NotFoundState
          code="404"
          testId="customer-not-found"
          title={t.customer.notFound.title}
          description={t.customer.notFound.description(id)}
          action={{ label: t.customer.notFound.back, href: "/crm/customers" }}
          suggestions={[{ label: t.customer.notFound.dashboard, href: "/crm" }]}
        />
      </CrmDataBoundary>
    )
  }

  return (
    <CrmDataBoundary
      route="customers"
      eyebrow={t.customer.eyebrow}
      title={customer?.company ?? t.customer.eyebrow}
      description={customer ? `${customer.name} · ${customer.title}` : t.common.loading}
      loadingVariant="rows"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/crm/customers"
            data-testid="back-to-customers"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeftIcon />
            {t.customer.actions.back}
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
              {t.customer.actions.openInList}
            </Button>
          ) : null}
        </div>
      }
    >
      {customer ? (
        <div className="flex flex-col gap-5">
          {/* 概要 */}
          <div className="flex flex-wrap items-center gap-2 rounded-panel bg-surface/60 px-3 py-2.5 shadow-card ring-1 ring-border/60">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-medium",
                STATUS_META[customer.status].chip
              )}
            >
              <span className={cn("size-1.5 rounded-full", STATUS_META[customer.status].dot)} />
              {t.status[customer.status]}
            </span>
            <Badge variant="outline">{t.plan[customer.plan]}</Badge>
            {customer.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
            <span className="numeric ml-auto text-subtitle font-semibold">
              {customer.value > 0 ? formatCurrency(customer.value) : t.common.notAvailable}
              <span className="ml-1.5 text-caption font-normal text-muted-foreground">
                {t.customer.windowLabel}
              </span>
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* 左列：资料 + 备注 + AI */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <Card size="sm">
                <CardHeader className="border-b border-border/60 pb-3">
                  <div>
                    <CardTitle>{t.customer.sections.account}</CardTitle>
                    <CardDescription>{t.customer.sections.accountDescription}</CardDescription>
                  </div>
                  <CardAction>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(customer.email)
                          toast.success(t.toast.emailCopied, { description: customer.email })
                        } catch {
                          toast.error(t.toast.clipboardUnavailable)
                        }
                      }}
                      data-testid="detail-copy-email"
                    >
                      <CopyIcon />
                      {t.customer.actions.copyEmail}
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                    <InfoRow
                      icon={UserIcon}
                      label={t.customer.fields.contact}
                      value={customer.name}
                    />
                    <InfoRow
                      icon={Building2Icon}
                      label={t.customer.fields.title}
                      value={customer.title}
                    />
                    <InfoRow icon={MailIcon} label={t.customer.fields.email} value={customer.email} />
                    <InfoRow icon={PhoneIcon} label={t.customer.fields.phone} value={customer.phone} />
                    <InfoRow
                      icon={UserIcon}
                      label={t.customer.fields.owner}
                      value={customer.owner}
                    />
                    <InfoRow
                      icon={CalendarIcon}
                      label={t.customer.fields.since}
                      value={formatDate(customer.createdAt)}
                    />
                  </dl>

                  <Separator className="my-5" />

                  <div className="flex flex-col gap-1.5">
                    <span className="text-label text-muted-foreground">
                      {t.customer.fields.notes}
                    </span>
                    <p className="text-body-sm leading-relaxed text-pretty text-muted-foreground">
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
                <CardHeader className="border-b border-border/60 pb-3">
                  <div>
                    <CardTitle>{t.customer.sections.activities}</CardTitle>
                    <CardDescription className="numeric">
                      {t.customer.sections.activitiesDescription(timeline.length)}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {timeline.length === 0 ? (
                    <EmptyState
                      icon={CalendarIcon}
                      title={t.customer.empty.activities}
                      description={t.customer.empty.activitiesDescription}
                      action={
                        <Link
                          href="/crm/activities"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          {t.customer.empty.browseActivities}
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
                            transition={{ duration: durations.list, ease: easings.outExpo }}
                            className="group/item relative flex gap-3 pb-5 last:pb-0"
                          >
                            {index !== timeline.length - 1 ? (
                              <span
                                aria-hidden
                                className="absolute top-9 left-[15px] h-[calc(100%-2.25rem)] w-px bg-border transition-colors duration-hover group-hover/item:bg-brand/30"
                              />
                            ) : null}
                            <span
                              className={cn(
                                "relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-hover",
                                event.kind === "status"
                                  ? "border-brand/30 bg-brand-soft text-brand"
                                  : "border-border/70 bg-surface text-muted-foreground group-hover/item:text-foreground"
                              )}
                            >
                              <Icon className="size-3.5" />
                            </span>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-body-sm font-medium">{event.title}</span>
                                <Badge
                                  variant="outline"
                                  className="h-5 px-1.5 text-label font-normal"
                                >
                                  {t.activities.kinds[event.kind]}
                                </Badge>
                                <span className="numeric ml-auto shrink-0 text-label text-muted-foreground">
                                  {event.time}
                                </span>
                              </div>
                              <p className="text-caption leading-relaxed text-pretty text-muted-foreground">
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

            {/* 右列：相关任务 + 负责人 + 备注 */}
            <div className="flex flex-col gap-4">
              <Card size="sm">
                <CardHeader className="border-b border-border/60 pb-3">
                  <div>
                    <CardTitle>{t.customer.sections.openTasks}</CardTitle>
                    <CardDescription>{t.customer.sections.openTasksDescription}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {relatedTasks.length === 0 ? (
                    <EmptyState
                      icon={KanbanSquareIcon}
                      title={t.customer.empty.tasks}
                      description={t.customer.empty.tasksDescription}
                      action={
                        <Link
                          href="/crm/tasks"
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          {t.customer.empty.openBoard}
                        </Link>
                      }
                    />
                  ) : (
                    <ul className="flex flex-col gap-2.5">
                      {relatedTasks.map(({ task, column }) => (
                        <li
                          key={task.id}
                          className="flex flex-col gap-1.5 rounded-card border border-border/60 bg-surface/50 p-3 transition-colors duration-hover hover:border-brand/25 hover:bg-surface"
                        >
                          <span className="text-body-sm font-medium">{task.title}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-5 px-1.5 text-label font-normal">
                              {t.tasks.columns[column.id].title}
                            </Badge>
                            <span className="numeric inline-flex items-center gap-1 text-label text-muted-foreground">
                              <CalendarIcon className="size-3" />
                              {formatDateShort(task.due)}
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
                          {t.customer.empty.openBoard}
                        </Link>
                      </li>
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <div>
                    <CardTitle>{t.customer.sections.owner}</CardTitle>
                    <CardDescription>{t.customer.sections.ownerDescription}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-brand-soft text-brand">
                        {personInitials(customer.owner, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-body-sm font-medium">{customer.owner}</span>
                      <span className="truncate text-label text-muted-foreground">
                        {t.brand.name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <div>
                    <CardTitle>{t.customer.sections.notes}</CardTitle>
                    <CardDescription>{t.customer.sections.notesDescription}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 text-caption text-muted-foreground">
                    <StickyNoteIcon className="mt-0.5 size-3.5 shrink-0" />
                    <p className="leading-relaxed text-pretty">{customer.notes}</p>
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
        <dd className="truncate text-body-sm font-medium">{value}</dd>
      </div>
    </div>
  )
}
