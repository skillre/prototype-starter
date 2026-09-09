"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface TableColumn<T> {
  key: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  /** Tailwind alignment + width classes for both header and cell. */
  className?: string
}

type DataTableProps<T> = {
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  emptyState?: React.ReactNode
  loading?: boolean
  skeletonRows?: number
  className?: string
  /** Lands on the <table> element — used by e2e tests. */
  testId?: string
}

/**
 * Minimal, typed data table. Handles loading skeletons and an empty state;
 * row clicks are optional (calls `onRowClick`). Scrolls horizontally on
 * narrow screens instead of collapsing columns.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyState,
  loading = false,
  skeletonRows = 6,
  className,
  testId,
}: DataTableProps<T>) {
  return (
    <div className={cn("relative overflow-x-auto rounded-xl ring-1 ring-foreground/10", className)}>
      <table data-testid={testId} className="w-full min-w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn("px-4 py-2.5 font-medium whitespace-nowrap", column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, row) => (
                <tr key={row} className="border-b last:border-0">
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-4 py-3", column.className)}>
                      <Skeleton className="h-4 w-full max-w-28" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => {
                const key = rowKey(row)
                const interactive = Boolean(onRowClick)
                return (
                  <tr
                    key={key}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-b transition-colors last:border-0",
                      interactive &&
                        "cursor-pointer hover:bg-accent/60 focus-within:bg-accent/60 outline-none",
                      "data-[selected=true]:bg-accent/60"
                    )}
                    tabIndex={interactive ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault()
                              onRowClick(row)
                            }
                          }
                        : undefined
                    }
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={cn("px-4 py-3 align-middle", column.className)}>
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                )
              })}
        </tbody>
      </table>
      {!loading && rows.length === 0 && emptyState ? (
        <div className="px-4 py-10">{emptyState}</div>
      ) : null}
    </div>
  )
}