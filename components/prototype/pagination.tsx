"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaginationProps = {
  page: number
  totalPages: number
  /** 当前页显示区间，例如 "1–8 / 22"。 */
  caption?: string
  onPageChange: (page: number) => void
  className?: string
  testId?: string
  /** 无障碍文案可覆盖，默认英文。 */
  labels?: {
    nav?: string
    previous?: string
    next?: string
    page?: (page: number) => string
  }
}

/**
 * 受控分页控件。与 DataTable 搭配使用：调用方负责切片，这里只渲染页码与
 * 上一页/下一页。所有按钮都连到真实回调（无装饰性控件）。
 */
export function Pagination({
  page,
  totalPages,
  caption,
  onPageChange,
  className,
  testId,
  labels,
}: PaginationProps) {
  const pages = buildPageList(page, totalPages)
  const navLabel = labels?.nav ?? "Pagination"
  const previousLabel = labels?.previous ?? "Previous page"
  const nextLabel = labels?.next ?? "Next page"
  const pageLabel = labels?.page ?? ((value: number) => `Page ${value}`)

  return (
    <nav
      aria-label={navLabel}
      data-testid={testId}
      className={cn("flex flex-wrap items-center justify-between gap-3", className)}
    >
      <span className="text-caption text-muted-foreground">{caption}</span>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={previousLabel}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon />
        </Button>

        {pages.map((entry, index) =>
          entry === "gap" ? (
            <span
              key={`gap-${index}`}
              aria-hidden
              className="px-1 text-caption text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={entry}
              type="button"
              variant={entry === page ? "default" : "outline"}
              size="icon-sm"
              aria-label={pageLabel(entry)}
              aria-current={entry === page ? "page" : undefined}
              onClick={() => onPageChange(entry)}
              className="tabular-nums"
            >
              {entry}
            </Button>
          )
        )}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={nextLabel}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </nav>
  )
}

/** 最多显示 5 个页码，两端各保留一页，其余折叠为 gap。 */
function buildPageList(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const result: (number | "gap")[] = []
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push("gap")
    result.push(value)
  })
  return result
}
