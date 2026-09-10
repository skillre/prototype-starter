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
  ACTIVITY_META,
  CRM_OWNERS,
  type ActivityKind,
  type CrmActivity,
  type CrmOwner,
} from "@/lib/crm-data"
import { selectActivities, useCrmStore } from "@/stores/crm-store"
import { durations, easings } from "@/lib/motion-presets"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<ActivityKind, typeof MailIcon> = {
  email: MailIcon,
  call: PhoneIcon,
  meeting: CalendarIcon,
  note: StickyNoteIcon,
  status: ZapIcon,
}

const KIND_ORDER: ActivityKind[] = ["email", "call", "meeting", "note", "status"]

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

type ActivitiesViewProps = {
  /** 点击企业名进入该客户详情页。 */
  onOpenCustomer: (customerId: string) => void
}

export function ActivitiesView({ onOpenCustomer }: ActivitiesViewProps) {
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
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={kindFilter}
          onValueChange={(value) => setKindFilter(value as ActivityKind | "all")}
        >
          <SelectTrigger size="sm" className="w-40" data-testid="activity-filter-kind">
            <SelectValue>
              {(value) => (
                <span className="truncate">
                  {value && value !== "all"
                    ? ACTIVITY_META[value as ActivityKind].label
                    : "All types"}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {KIND_ORDER.map((kind) => (
              <SelectItem key={kind} value={kind}>
                {ACTIVITY_META[kind].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={ownerFilter}
          onValueChange={(value) => setOwnerFilter(value as CrmOwner | "all")}
        >
          <SelectTrigger size="sm" className="w-40" data-testid="activity-filter-owner">
            <SelectValue>
              {(value) => (
                <span className="truncate">
                  {value && value !== "all" ? String(value) : "All owners"}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {CRM_OWNERS.map((owner) => (
              <SelectItem key={owner} value={owner}>
                {owner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-caption text-muted-foreground">
          {visible.length} of {activities.length} events
        </span>

        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => {
              setKindFilter("all")
              setOwnerFilter("all")
            }}
          >
            <RotateCcwIcon />
            Reset filters
          </Button>
        ) : null}
      </div>

      {/* 类型分布 */}
      <div className="flex flex-wrap gap-2">
        {KIND_ORDER.map((kind) => {
          const Icon = KIND_ICON[kind]
          return (
            <Badge key={kind} variant="outline" className="gap-1.5 font-normal">
              <Icon className="size-3" />
              {ACTIVITY_META[kind].label}
              <span className="tabular-nums text-muted-foreground">{counts[kind]}</span>
            </Badge>
          )
        })}
      </div>

      <Card size="sm">
        <CardHeader className="border-b pb-3">
          <div>
            <CardTitle>Activity timeline</CardTitle>
            <CardDescription>
              Emails, calls, meetings, notes and status changes across every account.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {visible.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No activity matches"
              description="No events for this type and owner combination. Reset the filters to see the full timeline."
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
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ol className="flex flex-col" data-testid="activity-timeline">
              {visible.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  company={companyOf.get(event.customerId)?.company ?? "—"}
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
  company,
  isLast,
  onOpen,
}: {
  event: CrmActivity
  company: string
  isLast: boolean
  onOpen: () => void
}) {
  const Icon = KIND_ICON[event.kind]

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.fast, ease: easings.outExpo }}
      className="relative flex gap-3 pb-5 last:pb-0"
    >
      {!isLast ? (
        <span aria-hidden className="absolute top-9 left-[15px] h-[calc(100%-2.25rem)] w-px bg-border" />
      ) : null}

      <span
        className={cn(
          "relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card",
          event.kind === "status" ? "text-chart-2" : "text-muted-foreground"
        )}
      >
        <Icon className="size-3.5" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium">{event.title}</span>
          <Badge variant="outline" className="h-5 px-1.5 text-label font-normal">
            {ACTIVITY_META[event.kind].label}
          </Badge>
          <span className="ml-auto shrink-0 text-label text-muted-foreground">{event.time}</span>
        </div>

        <p className="text-caption leading-relaxed text-muted-foreground">{event.detail}</p>

        <div className="flex items-center gap-2">
          <Avatar size="sm" className="size-5">
            <AvatarFallback className="text-[9px]">{initials(event.actor)}</AvatarFallback>
          </Avatar>
          <span className="text-label text-muted-foreground">{event.actor}</span>
          <span aria-hidden className="text-label text-muted-foreground">
            ·
          </span>
          <button
            type="button"
            onClick={onOpen}
            className="rounded-sm text-label text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            {company}
          </button>
        </div>
      </div>
    </motion.li>
  )
}
