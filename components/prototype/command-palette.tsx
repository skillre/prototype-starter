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
 */
export function CommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = "输入命令或搜索…",
  testId,
}: CommandPaletteProps) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="命令面板"
      description="输入命令或搜索…"
    >
      <div data-testid={testId}>
        <Command loop>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>没有匹配的命令。</CommandEmpty>
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
                    >
                      {Icon ? <Icon className="text-muted-foreground" /> : null}
                      {item.label}
                      {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
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