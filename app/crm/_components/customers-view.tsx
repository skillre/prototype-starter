"use client"

import { useMemo } from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  PlusIcon,
  RotateCcwIcon,
  UsersIcon,
} from "lucide-react"
import { FilterBar } from "@/components/prototype/filter-bar"
import { DataTable, type TableColumn } from "@/components/prototype/data-table"
import { Pagination } from "@/components/prototype/pagination"
import { EmptyState } from "@/components/prototype/empty-state"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CRM_OWNERS,
  STATUS_META,
  STATUS_ORDER,
  type CrmCustomer,
  type CrmOwner,
} from "@/lib/crm-data"
import {
  PAGE_SIZE,
  paginate,
  selectFilteredCustomers,
  useCrmStore,
  type CrmOwnerFilter,
  type CrmSortKey,
  type CrmStatusFilter,
} from "@/stores/crm-store"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

const SORT_OPTIONS: { value: CrmSortKey; label: string }[] = [
  { value: "createdAt", label: "Created" },
  { value: "value", label: "Deal value" },
  { value: "name", label: "Name" },
  { value: "company", label: "Company" },
  { value: "lastTouchHours", label: "Last touch" },
]

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

type CustomersViewProps = {
  onAddCustomer: () => void
  /** 打开客户详情（shell 负责同时更新 store 与 URL）。 */
  onOpenCustomer: (customerId: string) => void
}

export function CustomersView({ onAddCustomer, onOpenCustomer }: CustomersViewProps) {
  const customers = useCrmStore((s) => s.customers)
  const search = useCrmStore((s) => s.search)
  const statusFilter = useCrmStore((s) => s.statusFilter)
  const ownerFilter = useCrmStore((s) => s.ownerFilter)
  const sortKey = useCrmStore((s) => s.sortKey)
  const sortDir = useCrmStore((s) => s.sortDir)
  const page = useCrmStore((s) => s.page)

  const setSearch = useCrmStore((s) => s.setSearch)
  const setStatusFilter = useCrmStore((s) => s.setStatusFilter)
  const setOwnerFilter = useCrmStore((s) => s.setOwnerFilter)
  const setSort = useCrmStore((s) => s.setSort)
  const setPage = useCrmStore((s) => s.setPage)
  const resetFilters = useCrmStore((s) => s.resetFilters)

  // 派生数据在组件内 useMemo —— selector 只取原始值（zustand v5 约定）。
  const filtered = useMemo(
    () =>
      selectFilteredCustomers({
        customers,
        search,
        statusFilter,
        ownerFilter,
        sortKey,
        sortDir,
      }),
    [customers, search, statusFilter, ownerFilter, sortKey, sortDir]
  )

  const paged = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page])

  const hasActiveFilters =
    search !== "" || statusFilter !== "all" || ownerFilter !== "all"

  // 普通渲染函数（不是组件）——避免每次 render 产生新的组件类型而重挂载。
  const sortHeader = (column: CrmSortKey, label: string) => {
    const active = sortKey === column
    const Icon = !active ? ArrowUpDownIcon : sortDir === "asc" ? ArrowUpIcon : ArrowDownIcon
    return (
      <button
        type="button"
        onClick={() => setSort(column)}
        aria-label={`Sort by ${label}`}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60",
          active && "text-foreground"
        )}
      >
        {label}
        <Icon className="size-3" />
      </button>
    )
  }

  const columns: TableColumn<CrmCustomer>[] = [
    {
      key: "customer",
      header: sortHeader("name", "Customer"),
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>{initials(row.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium">{row.name}</span>
            <span className="truncate text-xs text-muted-foreground">{row.company}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => {
        const meta = STATUS_META[row.status]
        return (
          <span className={cn("inline-flex items-center gap-1.5 text-sm", meta.text)}>
            <span className={cn("size-1.5 rounded-full", meta.dot)} />
            {meta.label}
          </span>
        )
      },
    },
    {
      key: "owner",
      header: "Owner",
      className: "hidden md:table-cell",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Avatar size="sm" className="size-6">
            <AvatarFallback className="text-[10px]">{initials(row.owner)}</AvatarFallback>
          </Avatar>
          <span className="text-sm whitespace-nowrap text-muted-foreground">{row.owner}</span>
        </div>
      ),
    },
    {
      key: "value",
      header: sortHeader("value", "Deal value"),
      className: "text-right",
      cell: (row) => (
        <span className={cn("text-sm tabular-nums", row.value === 0 && "text-muted-foreground")}>
          {row.value > 0 ? formatCurrency(row.value) : "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: sortHeader("createdAt", "Created"),
      className: "hidden lg:table-cell",
      cell: (row) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          {row.createdAt}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, company, email…"
        searchTestId="crm-search"
        clearSearchLabel="Clear search"
        resetLabel="Reset filters"
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
        resultCaption={`${filtered.length} of ${customers.length} customers`}
        actions={
          <Button type="button" size="sm" onClick={onAddCustomer} data-testid="add-customer">
            <PlusIcon />
            Add Customer
          </Button>
        }
      >
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as CrmStatusFilter)}
        >
          <SelectTrigger size="sm" className="w-36" data-testid="crm-filter-status">
            <SelectValue>
              {(value) => (
                <span className="truncate">
                  {value && value !== "all" ? STATUS_META[value as CrmCustomer["status"]].label : "All statuses"}
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_ORDER.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_META[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={ownerFilter}
          onValueChange={(value) => setOwnerFilter(value as CrmOwnerFilter)}
        >
          <SelectTrigger size="sm" className="w-36" data-testid="crm-filter-owner">
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
            {CRM_OWNERS.map((owner: CrmOwner) => (
              <SelectItem key={owner} value={owner}>
                {owner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortKey} onValueChange={(value) => setSort(value as CrmSortKey)}>
          <SelectTrigger size="sm" className="w-40" data-testid="crm-filter-sort">
            <SelectValue>
              {(value) => (
                <span className="truncate">
                  Sort: {SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Created"}
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
        testId="crm-table"
        columns={columns}
        rows={paged.rows}
        rowKey={(row) => row.id}
        onRowClick={(row) => onOpenCustomer(row.id)}
        emptyState={
          <EmptyState
            icon={UsersIcon}
            title="No customers match"
            description={
              search
                ? `Nothing matched “${search}”. Try a different name, company or email.`
                : "No records in this status or owner. Reset the filters to see the full book."
            }
            action={
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RotateCcwIcon />
                Clear filters
              </Button>
            }
          />
        }
      />

      <Pagination
        testId="crm-pagination"
        page={paged.page}
        totalPages={paged.totalPages}
        caption={
          paged.total === 0
            ? "No results"
            : `${(paged.page - 1) * PAGE_SIZE + 1}–${Math.min(paged.page * PAGE_SIZE, paged.total)} of ${paged.total}`
        }
        onPageChange={setPage}
      />
    </div>
  )
}
