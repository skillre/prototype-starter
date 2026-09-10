import { AmbientBackdrop } from "@/components/prototype/ambient-backdrop"
import { cn } from "@/lib/utils"

type PageContainerProps = {
  /** Small line above the H1 — breadcrumb / section context. */
  eyebrow?: string
  title?: string
  description?: string
  /** Right-aligned header actions (buttons, selectors). */
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Constrain content width; passthrough to the inner wrapper. */
  contentClassName?: string
  /** Set false on dense pages (board, wide table) that need the full canvas. */
  ambient?: boolean
}

/**
 * Standard page shell: an ambient backdrop, then a header block with a clear
 * type hierarchy, then the content on a consistent max width.
 *
 * The header is where the "premium" reads first — a small tracked eyebrow, a
 * tighter display-ish title and generous breathing room below it. Everything
 * else on the page inherits that rhythm.
 */
export function PageContainer({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
  ambient = true,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "relative isolate mx-auto w-full max-w-dashboard px-gutter py-6 sm:px-8 sm:py-8",
        className
      )}
    >
      {ambient ? <AmbientBackdrop variant="page" /> : null}

      {title ? (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            {eyebrow ? (
              <span className="text-label font-medium tracking-[0.14em] text-brand uppercase">
                {eyebrow}
              </span>
            ) : null}
            <h1 className="text-title text-balance">{title}</h1>
            {description ? (
              <p className="text-body-sm text-pretty text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>
          ) : null}
        </div>
      ) : null}

      <div className={cn("flex flex-col gap-6", contentClassName)}>{children}</div>
    </div>
  )
}
