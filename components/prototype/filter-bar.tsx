"use client"

import { RotateCcwIcon, SearchIcon } from "lucide-react"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type FilterBarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  /** 筛选控件（下拉、开关等）从这里插入。 */
  children?: React.ReactNode
  /** 右对齐的操作（例如"添加客户"）。 */
  actions?: React.ReactNode
  /** 例如"14 位客户中的 12 位"这类结果计数。 */
  resultCaption?: string
  hasActiveFilters?: boolean
  onReset?: () => void
  className?: string
  /** Lands on the search input — used by e2e tests. */
  searchTestId?: string
  /** 无障碍标签可覆盖，默认沿用 Starter 中文文案。 */
  clearSearchLabel?: string
  resetLabel?: string
}

/**
 * Standard filter toolbar: search field on the left, configurable filters,
 * result caption and a reset control that only appears when something is
 * actually filtered.
 */
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "搜索…",
  children,
  actions,
  resultCaption,
  hasActiveFilters = false,
  onReset,
  className,
  searchTestId,
  clearSearchLabel = "清除搜索",
  resetLabel = "重置筛选",
}: FilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      <InputGroup className="w-full sm:max-w-xs">
        <span className="pl-2.5 text-muted-foreground">
          <SearchIcon className="size-4" />
        </span>
        <InputGroupInput
          data-testid={searchTestId}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
        />
        {searchValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={clearSearchLabel}
            onClick={() => onSearchChange("")}
          >
            ×
          </Button>
        ) : null}
      </InputGroup>

      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}

      <div className="flex items-center gap-2 sm:ml-auto">
        {resultCaption ? (
          <span className="text-caption text-muted-foreground whitespace-nowrap">
            {resultCaption}
          </span>
        ) : null}
        {hasActiveFilters && onReset ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={resetLabel}
                  onClick={onReset}
                />
              }
            >
              <RotateCcwIcon />
            </TooltipTrigger>
            <TooltipContent side="bottom">{resetLabel}</TooltipContent>
          </Tooltip>
        ) : null}
        {actions}
      </div>
    </div>
  )
}