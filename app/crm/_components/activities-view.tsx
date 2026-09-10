"use client"

import { useMemo } from "react"
import { motion } from "motion/react"
import {
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  RotateCcwIcon,
  StickyNoteIcon,
  ZapIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState } from "@/components/prototype/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CRM_OWNERS,
  personInitials,
  type ActivityKind,
  type CrmActivity,
  type CrmOwner,
} from "@/lib/crm-data"
import { selectActivities, useCrmStore } from "@/stores/crm-store"
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

const KIND_ORDER: ActivityKind[] = ["email", "call", "meeting", "note", "status"]

type ActivitiesViewProps = {
  /** 点击企业名进入该客户详情页。 */
  onOpenCustomer: (customerId: string) => void
}

export function ActivitiesView({ onOpenCustomer }: ActivitiesViewProps) {
  const t = useMessages()
  const activities = useCrmStore((s) => s.activities)
  const customers = useCrmStore((s) => s.customers)
  const kindFilter = useCrmStore((s) => s.activityKindFilter)
  const ownerFilter = useCrmStore((s) => s.activityOwnerFilter)
  const setKindFilter = useCrmStore((s) => s.setActivityKindFilter)
  const setOwnerFilter = useCrmStore((s) => s.setActivityOwnerFilter)

  const companyOf = useMemo(() => {
    const map = new Map<string, { company: string; id: string }>()
    for (const customer of customers) {
      map.set(customer.id, { company: customer.company, id: customer.id })
    }
    return map
  }, [customers])

  const visible = useMemo(
    () => selectActivities({ activities, activityKindFilter: kindFilter, activityOwnerFilter: ownerFilter }),
    [activities, kindFilter, ownerFilter]
  )

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: activities.length }
    for (const kind of KIND_ORDER) {
      base[kind] = activities.filter((a) => a.kind === kind).length
    }
    return base
  }, [activities])

  const hasFilters = kindFilter !== "all" || ownerFilter !== "all"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 rounded-panel bg-surface/70 p-2.5 shadow-card ring-1 ring-border/60">
        <Select
          value={kindFilter}
          onValueChange={(value) => setKindFilter(value as ActivityKind | "all")}
        >
          <SelectTrigger size="sm" className="w-32" data-testid="activity-filter-kind">
            <SelectValue>
              {(value) => (
                <span className="truncate">
                  {value && value !== "all"
                    ? t.activities.kinds[value as ActivityKind]
                    : t.activities.allTypes}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.activities.allTypes}</SelectItem>
            {KIND_ORDER.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {t.activities.kinds[kind]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={ownerFilter}
          onValueChange={(value) => setOwnerFilter(value as CrmOwner | "all")}
        >
          <SelectTrigger size="sm" className="w-32" data-testid="activity-filter-owner">
            <SelectValue>
              {(value) => (
                <span className="truncate">
                  {value && value !== "all" ? String(value) : t.activities.allOwners}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.activities.allOwners}</SelectItem>
            {CRM_OWNERS.map((owner) => (
              <SelectItem key={owner} value={owner}>
                {owner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="numeric text-caption text-muted-foreground">
          {t.activities.resultCaption(visible.length, activities.length)}
        </span>

        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto text-muted-foreground hover:text-foreground"
            onClick={() => {
              setKindFilter("all")
              setOwnerFilter("all")
            }}
          >
            <RotateCcwIcon />
            {t.activities.resetFilters}
          </Button>
        ) : null}
      </div>

      {/* 类型分布 */}
      <div className="flex flex-wrap gap-2">
        {KIND_ORDER.map((kind) => {
          const Icon = KIND_ICON[kind]
          const active = kindFilter === kind
          return (
            <button
              key={kind}
              type="button"
              aria-pressed={active}
              onClick={() => setKindFilter(active ? "all" : kind)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-4xl border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,background-color,border-color] duration-hover ease-standard outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                active
                  ? "border-transparent bg-brand-soft text-brand"
                  : "border-border/70 bg-surface/60 text-muted-foreground hover:bg-interactive hover:text-foreground"
              )}
            >
              <Icon className="size-3" />
              {t.activities.kinds[kind]}
              <span className="numeric opacity-70">{counts[kind]}</span>
            </button>
          )
        })}
      </div>

      <Card size="sm">
        <CardHeader className="border-b border-border/60 pb-3">
          <div>
            <CardTitle>{t.activities.timelineTitle}</CardTitle>
            <CardDescription>{t.activities.timelineDescription}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {visible.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title={t.activities.empty.title}
              description={t.activities.empty.description}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setKindFilter("all")
                    setOwnerFilter("all")
                  }}
                >
                  <RotateCcwIcon />
                  {t.common.clearFilters}
                </Button>
              }
            />
          ) : (
            <ol className="flex flex-col" data-testid="activity-timeline">
              {visible.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  kindLabel={t.activities.kinds[event.kind]}
                  company={companyOf.get(event.customerId)?.company ?? t.common.notAvailable}
                  isLast={index === visible.length - 1}
                  onOpen={() => onOpenCustomer(event.customerId)}
                />
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TimelineItem({
  event,
  kindLabel,
  company,
  isLast,
  onOpen,
}: {
  event: CrmActivity
  kindLabel: string
  company: string
  isLast: boolean
  onOpen: () => void
}) {
  const Icon = KIND_ICON[event.kind]

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.list, ease: easings.outExpo }}
      className="group/item relative flex gap-3 pb-5 last:pb-0"
    >
      {!isLast ? (
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
          <Badge variant="outline" className="h-5 px-1.5 text-label font-normal">
            {kindLabel}
          </Badge>
          <span className="numeric ml-auto shrink-0 text-label text-muted-foreground">
            {event.time}
          </span>
        </div>

        <p className="text-caption leading-relaxed text-pretty text-muted-foreground">
          {event.detail}
        </p>

        <div className="flex items-center gap-2">
          <Avatar size="sm" className="size-5">
            <AvatarFallback className="text-[9px]">{personInitials(event.actor, 1)}</AvatarFallback>
          </Avatar>
          <span className="text-label text-muted-foreground">{event.actor}</span>
          <span aria-hidden className="text-label text-muted-foreground">
            ·
          </span>
          <button
            type="button"
            onClick={onOpen}
            className="rounded-sm text-label text-muted-foreground underline-offset-4 outline-none transition-colors duration-hover hover:text-brand hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {company}
          </button>
        </div>
      </div>
    </motion.li>
  )
}
