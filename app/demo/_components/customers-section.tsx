"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { BanIcon, CopyIcon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { FilterBar } from "@/components/prototype/filter-bar"
import { DataTable, type TableColumn } from "@/components/prototype/data-table"
import { EmptyState } from "@/components/prototype/empty-state"
import { DetailDrawer } from "@/components/prototype/detail-drawer"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useDashboardStore,
  selectFilteredCustomers,
  type PlanFilter,
  type SortKey,
  type StatusFilter,
} from "@/stores/dashboard-store"
import type { Customer, CustomerStatus, Plan } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const STATUS_TONE: Record<CustomerStatus, { dot: string; text: string }> = {
  活跃: { dot: "bg-chart-3", text: "text-chart-3" },
  试用: { dot: "bg-chart-4", text: "text-chart-4" },
  逾期: { dot: "bg-chart-5", text: "text-chart-5" },
  已流失: { dot: "bg-muted-foreground/50", text: "text-muted-foreground" },
}

const STATUS_OPTIONS: CustomerStatus[] = ["活跃", "试用", "逾期", "已流失"]
const PLAN_OPTIONS: Plan[] = ["基础版", "专业版", "企业版"]
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "lastActiveHours", label: "最近活跃" },
  { value: "mrr", label: "月经常性收入" },
  { value: "name", label: "名称" },
  { value: "since", label: "入驻时间" },
]

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

export function CustomersSection({
  addOpen,
  onAddOpenChange,
}: {
  addOpen: boolean
  onAddOpenChange: (open: boolean) => void
}) {
  const customers = useDashboardStore((s) => s.customers)
  const search = useDashboardStore((s) => s.search)
  const statusFilter = useDashboardStore((s) => s.statusFilter)
  const planFilter = useDashboardStore((s) => s.planFilter)
  const sortKey = useDashboardStore((s) => s.sortKey)
  const sortDir = useDashboardStore((s) => s.sortDir)
  const setSearch = useDashboardStore((s) => s.setSearch)
  const setStatusFilter = useDashboardStore((s) => s.setStatusFilter)
  const setPlanFilter = useDashboardStore((s) => s.setPlanFilter)
  const setSortKey = useDashboardStore((s) => s.setSortKey)
  const closeCustomerAccount = useDashboardStore((s) => s.closeCustomerAccount)
  const reopenCustomerAccount = useDashboardStore((s) => s.reopenCustomerAccount)

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      selectFilteredCustomers({
        customers,
        search,
        statusFilter,
        planFilter,
        sortKey,
        sortDir,
      } as Parameters<typeof selectFilteredCustomers>[0]),
    [customers, search, statusFilter, planFilter, sortKey, sortDir]
  )

  const selected = selectedId ? (customers.find((c) => c.id === selectedId) ?? null) : null
  const hasActiveFilters = search !== "" || statusFilter !== "all" || planFilter !== "all"

  const resetFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setPlanFilter("all")
  }

  const copyEmail = async () => {
    if (!selected) return
    try {
      await navigator.clipboard.writeText(selected.email)
      toast.success("邮箱已复制", { description: selected.email })
    } catch {
      toast.error("无法访问剪贴板", {
        description: "请授权剪贴板权限后重试。",
      })
    }
  }

  const columns: TableColumn<Customer>[] = [
    {
      key: "customer",
      header: "客户",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>{initials(row.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium">{row.name}</span>
            <span className="truncate text-xs text-muted-foreground">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "套餐",
      cell: (row) => <Badge variant="outline">{row.plan}</Badge>,
    },
    {
      key: "status",
      header: "状态",
      cell: (row) => {
        const tone = STATUS_TONE[row.status]
        return (
          <span className={cn("inline-flex items-center gap-1.5 text-sm", tone.text)}>
            <span className={cn("size-1.5 rounded-full", tone.dot)} />
            {row.status}
          </span>
        )
      },
    },
    {
      key: "mrr",
      header: "月经常性收入",
      className: "text-right",
      cell: (row) => (
        <span className={cn("text-sm tabular-nums", row.mrr === 0 && "text-muted-foreground")}>
          {row.mrr > 0 ? formatCurrency(row.mrr) : "—"}
        </span>
      ),
    },
    {
      key: "region",
      header: "地区",
      className: "hidden md:table-cell",
      cell: (row) => <span className="text-sm text-muted-foreground">{row.region}</span>,
    },
    {
      key: "lastActive",
      header: "最近活跃",
      cell: (row) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground">{row.lastActive}</span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="搜索名称、邮箱或地区…"
        searchTestId="customer-search"
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        resultCaption={`${filtered.length} / ${customers.length} 位客户`}
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => onAddOpenChange(true)}
            data-testid="add-customer"
          >
            <PlusIcon />
            添加客户
          </Button>
        }
      >
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger size="sm" className="w-32" data-testid="filter-status">
            <SelectValue>
              {(value) => (
                <span className="truncate">{value ? String(value) : "全部状态"}</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={planFilter} onValueChange={(value) => setPlanFilter(value as PlanFilter)}>
          <SelectTrigger size="sm" className="w-32" data-testid="filter-plan">
            <SelectValue>
              {(value) => (
                <span className="truncate">{value ? String(value) : "全部套餐"}</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部套餐</SelectItem>
            {PLAN_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
          <SelectTrigger size="sm" className="w-40" data-testid="filter-sort">
            <SelectValue>
              {(value) => (
                <span className="truncate">
                  排序：{String(value) || "最近活跃"}
                  {sortDir === "desc" ? " ↓" : " ↑"}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        testId="customers-table"
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        onRowClick={(row) => setSelectedId(row.id)}
        emptyState={
          <EmptyState
            title="没有符合条件的客户"
            description={`${search ? `未找到与「${search}」匹配的记录` : "当前筛选条件下没有记录"}，试试清除筛选或切换状态。`}
            action={
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcwIcon />
                清除筛选
              </Button>
            }
          />
        }
      />

      <AddCustomerDialog open={addOpen} onOpenChange={onAddOpenChange} />

      {selected ? (
        <DetailDrawer
          testId="customer-drawer"
          open={Boolean(selected)}
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
          title={selected.name}
          description={selected.email}
          footer={
            <>
              <Button type="button" variant="outline" className="flex-1" onClick={copyEmail}>
                <CopyIcon />
                复制邮箱
              </Button>
              {selected.status === "已流失" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    reopenCustomerAccount(selected.id)
                    toast.success("账户已重新启用", {
                      description: `${selected.name} 已恢复为活跃状态，月经常性收入 ${formatCurrency(selected.mrr)}。`,
                    })
                  }}
                >
                  <RotateCcwIcon />
                  重新启用
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    closeCustomerAccount(selected.id)
                    toast.success("账户已关停", {
                      description: `${selected.name} 已标记为已流失，月经常性收入归零。`,
                    })
                  }}
                >
                  <BanIcon />
                  关停账户
                </Button>
              )}
            </>
          }
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <InfoRow label="联系人" value={selected.contact} />
            <InfoRow label="套餐" value={selected.plan} />
            <InfoRow label="状态" value={selected.status} />
            <InfoRow
              label="月经常性收入"
              value={selected.mrr > 0 ? formatCurrency(selected.mrr) : "—"}
            />
            <InfoRow label="席位" value={selected.seats > 0 ? String(selected.seats) : "—"} />
            <InfoRow label="地区" value={selected.region} />
            <InfoRow label="入驻时间" value={selected.since} />
            <InfoRow label="最近活跃" value={selected.lastActive} />
          </div>

          <Separator className="my-5" />

          <div className="flex flex-col gap-1">
            <span className="text-label text-muted-foreground">账户备注</span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {selected.contact} 每周会收到摘要邮件，并已签署数据处理协议。续费将在{" "}
              <span className="font-medium text-foreground">{selected.since}</span>{" "}
              的周年日自动进行。
            </p>
          </div>
        </DetailDrawer>
      ) : null}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-label text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  )
}

const EMAIL_RE = /^\S+@\S+\.\S+$/

function AddCustomerDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const addCustomer = useDashboardStore((s) => s.addCustomer)
  const setSearch = useDashboardStore((s) => s.setSearch)

  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [region, setRegion] = useState("")
  const [plan, setPlan] = useState<Plan>("专业版")
  const [status, setStatus] = useState<CustomerStatus>("活跃")
  const [mrr, setMrr] = useState("1200")
  const [seats, setSeats] = useState("12")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = "请填写公司名称。"
    if (!contact.trim()) next.contact = "请填写联系人。"
    if (!EMAIL_RE.test(email.trim())) next.email = "请输入有效的邮箱地址。"
    if (Number.isNaN(Number(mrr)) || Number(mrr) < 0) next.mrr = "月经常性收入必须是非负数字。"
    if (Number.isNaN(Number(seats)) || Number(seats) < 1) next.seats = "席位至少为 1。"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = () => {
    if (!validate()) return
    addCustomer({
      name,
      contact,
      email,
      plan,
      status,
      mrr: Number(mrr),
      seats: Number(seats),
      region: region.trim() || "美国",
    })
    setSearch("")
    toast.success(`已添加 ${name.trim()}`, {
      description: `套餐 ${plan}，月经常性收入 ${formatCurrency(Number(mrr))}。表格中已实时生效。`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setErrors({})
        }
        onOpenChange(next)
      }}
    >
      <DialogContent data-testid="add-customer-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加客户</DialogTitle>
          <DialogDescription>
            在本地 store 中创建一条真实记录，筛选、排序与表格会立即响应。
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Field label="公司名称" error={errors.name} className="col-span-2">
            <Input
              data-testid="add-customer-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Acme Corp"
              aria-invalid={Boolean(errors.name)}
            />
          </Field>
          <Field label="联系人" error={errors.contact}>
            <Input
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="Alicia Monroe"
              aria-invalid={Boolean(errors.contact)}
            />
          </Field>
          <Field label="邮箱" error={errors.email}>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="alicia@acme.com"
              aria-invalid={Boolean(errors.email)}
            />
          </Field>
          <Field label="套餐">
            <Select value={plan} onValueChange={(value) => setPlan(value as Plan)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="状态">
            <Select value={status} onValueChange={(value) => setStatus(value as CustomerStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="月经常性收入（美元）" error={errors.mrr}>
            <Input
              type="number"
              min={0}
              value={mrr}
              onChange={(event) => setMrr(event.target.value)}
              aria-invalid={Boolean(errors.mrr)}
            />
          </Field>
          <Field label="席位" error={errors.seats}>
            <Input
              type="number"
              min={1}
              value={seats}
              onChange={(event) => setSeats(event.target.value)}
              aria-invalid={Boolean(errors.seats)}
            />
          </Field>
          <Field label="地区" className="col-span-2">
            <Input
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              placeholder="美国"
            />
          </Field>
        </div>

        <DialogFooter showCloseButton={false}>
          <DialogClose render={<Button type="button" variant="outline" />}>
            取消
          </DialogClose>
          <Button type="button" onClick={submit} data-testid="add-customer-submit">
            <PlusIcon />
            添加客户
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error ? (
        <span role="alert" className="text-xs text-destructive">
          {error}
        </span>
      ) : null}
    </div>
  )
}