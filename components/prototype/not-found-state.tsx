"use client"

import Link from "next/link"
import { ArrowLeftIcon, CompassIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { FadeIn } from "@/components/motion/fade-in"
import { cn } from "@/lib/utils"

type NotFoundStateProps = {
  /** 例如 "404"。 */
  code?: string
  title: string
  description?: string
  /** 主行动：返回一个真实存在的路由。 */
  action?: {
    label: string
    href: string
  }
  /** 次级建议路由，避免用户走进死胡同。 */
  suggestions?: { label: string; href: string }[]
  className?: string
  testId?: string
}

/**
 * 404 / 找不到内容的统一兜底界面。刻意做成可复用组件：任何原型都可以在
 * `not-found.tsx` 或详情页里使用它，并且永远提供真实的返回路径。
 */
export function NotFoundState({
  code = "404",
  title,
  description,
  action,
  suggestions,
  className,
  testId,
}: NotFoundStateProps) {
  return (
    <FadeIn
      duration={0.25}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed px-6 py-16 text-center",
        className
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <CompassIcon className="size-5" />
      </span>

      <span className="font-mono text-label tracking-widest text-muted-foreground">{code}</span>
      <span className="text-base font-medium" data-testid={testId}>
        {title}
      </span>

      {description ? (
        <span className="max-w-md text-caption text-muted-foreground">{description}</span>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {action ? (
          <Link href={action.href} className={buttonVariants()}>
            <ArrowLeftIcon />
            {action.label}
          </Link>
        ) : null}
        {suggestions?.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={buttonVariants({ variant: "outline" })}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </FadeIn>
  )
}
