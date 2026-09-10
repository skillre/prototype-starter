"use client"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { useMessages } from "@/components/i18n/locale-provider"
import { AmbientBackdrop } from "@/components/prototype/ambient-backdrop"
import type { LucideIcon } from "lucide-react"

export interface PaletteItem {
  id: string
  label: string
  icon?: LucideIcon
  /** e.g. "⌘K" — rendered right-aligned. */
  shortcut?: string
  /** Extra tokens for fuzzy matching beyond the label. */
  keywords?: string
  onSelect: () => void
}

export interface PaletteGroup {
  heading?: string
  items: PaletteItem[]
}

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: PaletteGroup[]
  placeholder?: string
  /** Lands on the dialog panel — used by e2e tests. */
  testId?: string
}

/**
 * ⌘K command palette built on the shadcn CommandDialog. Every item runs a
 * real action — navigation, dialogs, data operations.
 *
 * This is one of the few places that gets the full ambient treatment: it is a
 * deliberate, temporary focus surface, so a soft brand wash plus a hairline
 * grid inside a floating panel reads as "premium" rather than as decoration.
 */
export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder,
  testId,
}: CommandPaletteProps) {
  const t = useMessages()

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.palette.placeholder}
      description={t.a11y.commandHint}
    >
      <div data-testid={testId} className="relative isolate overflow-hidden rounded-panel">
        <AmbientBackdrop variant="panel" grid />
        <Command loop className="relative bg-transparent">
          <CommandInput placeholder={placeholder ?? t.palette.placeholder} />
          <CommandList className="max-h-80">
            <CommandEmpty>{t.palette.empty}</CommandEmpty>
            {groups.map((group, index) => (
              <CommandGroup key={group.heading ?? index} heading={group.heading}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.id}
                      value={`${item.label} ${item.keywords ?? ""}`}
                      onSelect={() => {
                        item.onSelect()
                        onOpenChange(false)
                      }}
                      className="group/item gap-2.5 rounded-field py-2 transition-colors duration-hover data-selected:bg-brand-soft data-selected:text-brand"
                    >
                      {Icon ? (
                        <Icon className="text-muted-foreground transition-colors duration-hover group-data-selected/item:text-brand" />
                      ) : null}
                      <span className="truncate">{item.label}</span>
                      {item.shortcut ? (
                        <CommandShortcut className="kbd-chip ml-auto tracking-normal">
                          {item.shortcut}
                        </CommandShortcut>
                      ) : null}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </div>
    </CommandDialog>
  )
}
