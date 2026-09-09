"use client"

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type ChartCardProps = {
  title: string
  description?: string
  /** Extra action in the header (select, buttons, …). */
  action?: React.ReactNode
  height?: number
  loading?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Card shell for recharts visualizations. Give the chart a fixed height
 * through `height` (ResponsiveContainer needs a sized parent).
 */
export function ChartCard({
  title,
  description,
  action,
  height = 288,
  loading = false,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="border-b pb-3">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton style={{ height }} className="w-full rounded-lg" />
        ) : (
          <div style={{ height }} className="w-full">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}