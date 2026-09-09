"use client"

import { InboxIcon, type LucideIcon } from "lucide-react"
import { FadeIn } from "@/components/motion/fade-in"
import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  /** 通常是一个按钮，让空状态有真实的出路（例如"清除筛选"）。 */
  action?: React.ReactNode
  className?: string
}

/** Friendly empty result — always paired with a real way out. */
export function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <FadeIn
      duration={0.2}
      className={cn("flex flex-col items-center justify-center gap-2 py-8 text-center", className)}
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <span className="text-sm font-medium">{title}</span>
      {description ? (
        <span className="max-w-sm text-caption text-muted-foreground">{description}</span>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </FadeIn>
  )
}