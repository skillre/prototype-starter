"use client"

import { useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { MoonIcon, PanelLeftIcon, SearchIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  SidebarNav,
  type NavBrandDef,
  type NavId,
  type NavItemDef,
  type NavUsageDef,
  type NavUserDef,
} from "@/components/layout/sidebar"

type MobileNavProps = {
  title: string
  active: NavId
  onNavigate: (id: NavId) => void
  onOpenCommand: () => void
  /** 以下均为可选：不传时沿用 Starter 默认品牌与导航。 */
  brand?: NavBrandDef
  items?: NavItemDef[]
  user?: NavUserDef
  usage?: NavUsageDef | null
}

/** Sticky mobile header with a slide-in navigation drawer. `lg` and up uses TopNav instead. */
export function MobileNav({
  title,
  active,
  onNavigate,
  onOpenCommand,
  brand,
  items,
  user,
  usage,
}: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  const navigate = (id: NavId) => {
    setOpen(false)
    onNavigate(id)
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b bg-background/85 px-3 backdrop-blur-md lg:hidden">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="打开导航"
                onClick={() => setOpen(true)}
                data-testid="mobile-nav"
              />
            }
          >
            <PanelLeftIcon />
          </TooltipTrigger>
          <TooltipContent side="bottom">菜单</TooltipContent>
        </Tooltip>

        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</span>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="打开命令面板"
                onClick={onOpenCommand}
              />
            }
          >
            <SearchIcon />
          </TooltipTrigger>
          <TooltipContent side="bottom">搜索</TooltipContent>
        </Tooltip>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="切换主题"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
      </header>

      <Drawer open={open} onOpenChange={setOpen} modal swipeDirection="left">
        <DrawerContent className="w-[78%] max-w-72 bg-sidebar text-sidebar-foreground">
          <SidebarNav
            active={active}
            onNavigate={navigate}
            brand={brand}
            items={items}
            user={user}
            usage={usage}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}