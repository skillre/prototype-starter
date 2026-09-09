import { cn } from "@/lib/utils"

type PageContainerProps = {
  title?: string
  description?: string
  /** Right-aligned header actions (buttons, selectors). */
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Constrain content width; passthrough to the inner wrapper. */
  contentClassName?: string
}

/**
 * Standard page shell: optional header block with clear visual hierarchy,
 * then the content on a consistent max width with breathing room.
 */
export function PageContainer({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-dashboard px-gutter py-6 sm:px-8 sm:py-8", className)}>
      {title ? (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-title font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn("flex flex-col gap-6", contentClassName)}>{children}</div>
    </div>
  )
}