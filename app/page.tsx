"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  BlocksIcon,
  CheckCircle2Icon,
  MousePointerClickIcon,
  PaintbrushIcon,
  TerminalSquareIcon,
  TestTube2Icon,
} from "lucide-react"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const HIGHLIGHTS = [
  "shadcn/ui（Base UI）基础组件",
  "Motion 驱动的动画组件库",
  "Zustand 本地状态 + 真实感 mock 数据",
  "Recharts 图表、拖拽排序与命令面板",
  "设计 Token：排版 / 间距 / 圆角 / 动效",
  "Playwright 端到端测试",
]

const STACK = [
  { icon: MousePointerClickIcon, title: "真实交互", description: "没有假按钮。筛选、拖拽、增删、恢复——每个可见控件都作用于本地状态。" },
  { icon: PaintbrushIcon, title: "设计 Token", description: "排版、间距、圆角、动效时长与内容宽度集中在同一层，杜绝散落的魔法数字。" },
  { icon: TerminalSquareIcon, title: "对 Agent 友好", description: "AGENTS.md 规则与 interactive-prototype Skill 要求先检查、复用组件、并在浏览器中验证。" },
  { icon: TestTube2Icon, title: "测试把关", description: "lint、类型检查、Playwright 与生产构建全绿后才算完成：pnpm check。" },
]

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--chart-1)_14%,transparent),transparent)]"
        />
        <div className="relative mx-auto flex w-full max-w-content flex-col items-center gap-6 px-gutter py-20 text-center sm:py-28">
          <FadeIn>
            <Badge variant="outline" className="gap-1.5 text-xs">
              <BlocksIcon className="size-3.5" />
              Next.js 16 · Tailwind v4 · shadcn/ui · Motion
            </Badge>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="max-w-2xl text-display font-semibold tracking-tight">
              交互式原型 Starter
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="max-w-xl text-lg text-muted-foreground">
              面向高保真产品原型的可复用基础：纯前端 + 本地状态 + 真实感 mock 数据——没有任何静态假页面。
            </p>
          </FadeIn>
          <FadeIn delay={0.24} className="flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/demo" />} size="lg">
              打开演示仪表盘
              <ArrowRightIcon />
            </Button>
            <Button render={<Link href="#stack" />} variant="outline" size="lg">
              里面有什么
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b bg-muted/40">
        <StaggerContainer className="mx-auto grid w-full max-w-content grid-cols-2 gap-x-6 gap-y-3 px-gutter py-8 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2Icon className="size-4 shrink-0 text-chart-3" />
              <span>{item}</span>
            </div>
          ))}
        </StaggerContainer>
      </section>

      {/* Stack */}
      <section id="stack" className="mx-auto w-full max-w-content px-gutter py-16 sm:py-20">
        <FadeIn className="mb-10 flex flex-col gap-2">
          <h2 className="text-title font-semibold tracking-tight">为高效迭代而生</h2>
          <p className="max-w-lg text-muted-foreground">
            打开 <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/demo</code>{" "}
            即可看到一整套 SaaS 仪表盘演示，随后直接复用其中的模式。
          </p>
        </FadeIn>
        <StaggerContainer className="grid gap-4 sm:grid-cols-2">
          {STACK.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="rounded-card border bg-card p-5 ring-1 ring-foreground/5"
              >
                <span className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </span>
                <h3 className="mb-1 text-sm font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            )
          })}
        </StaggerContainer>

        <FadeIn delay={0.1} className="mt-12 rounded-card border bg-card p-5 font-mono text-xs leading-relaxed text-muted-foreground">
          <span className="mr-2 text-foreground">$</span>pnpm dev — 打开 /demo<br />
          <span className="mr-2 text-foreground">$</span>pnpm check — lint + 类型检查 + Playwright<br />
          <span className="mr-2 text-foreground">$</span>pnpm build — 交付前的生产构建
        </FadeIn>
      </section>

      <footer className="border-t py-6">
        <p className="mx-auto w-full max-w-content px-gutter text-center text-xs text-muted-foreground">
          原型 Starter —— 前端 + 本地状态 + 真实感 mock 数据。刻意不做后端。
        </p>
      </footer>
    </main>
  )
}