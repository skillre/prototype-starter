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
  type LucideIcon,
} from "lucide-react"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"
import { AmbientBackdrop } from "@/components/prototype/ambient-backdrop"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMessages } from "@/components/i18n/locale-provider"
// Reference Sample 的**性格层**：环境光 / Hero 光 / 图表辉光 / 实时光晕。
// 这一层不属于 Factory Core —— 它只跟着显式 import 它的模块图走（Factory v1.2 · N1）。
import "@/app/sample-command-center.css"

/** 图标与文案一一对应——文案在词典里，图标留在组件里。 */
const FEATURE_ICONS: LucideIcon[] = [
  MousePointerClickIcon,
  PaintbrushIcon,
  TerminalSquareIcon,
  TestTube2Icon,
]

export default function LandingPage() {
  const t = useMessages()
  const copy = t.landing

  return (
    /* data-factory-landing：这是 Factory 的落地页，不是某个产品的。
       派生新原型时必须写自己的首页并移除这个标记 —— 由 scripts/verify-init.mjs 检查。 */
    <main data-factory-landing className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b">
        <AmbientBackdrop variant="hero" grid />
        <div className="relative mx-auto flex w-full max-w-content flex-col items-center gap-6 px-gutter py-20 text-center sm:py-28">
          <FadeIn>
            <Badge variant="outline" className="gap-1.5 bg-surface/70 text-label tracking-normal">
              <BlocksIcon className="size-3.5" />
              {copy.badge}
            </Badge>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="text-display">{copy.title}</h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="max-w-xl text-body text-muted-foreground sm:text-subtitle">
              {copy.description}
            </p>
          </FadeIn>
          <FadeIn delay={0.24} className="flex flex-wrap items-center justify-center gap-3">
            {/* 主 CTA 指向 Factory 自己的东西，不指向参考原型：
                参考原型是示例，不是这个 baseline 的产品入口。 */}
            <Link href="#reference-sample" className={buttonVariants({ size: "lg" })}>
              {copy.primaryCta}
              <ArrowRightIcon />
            </Link>
            <Link href="#stack" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {copy.secondaryCta}
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b bg-muted/40">
        <StaggerContainer className="mx-auto grid w-full max-w-content grid-cols-2 gap-x-6 gap-y-3 px-gutter py-8 sm:grid-cols-3">
          {copy.highlights.map((item) => (
            <div key={item} className="flex items-center gap-2 text-body-sm text-muted-foreground">
              <CheckCircle2Icon className="size-4 shrink-0 text-success" />
              <span>{item}</span>
            </div>
          ))}
        </StaggerContainer>
      </section>

      {/* Stack */}
      {/* Reference Sample：显式标注的示例入口。
          data-reference-sample 是机器可读的标记 —— 它同时告诉 verify-init：
          链接到这里是「被标注的示例」，而不是「把 CRM 当成产品主入口」。 */}
      <section
        id="reference-sample"
        data-reference-sample
        className="border-b bg-muted/20 px-gutter py-12 sm:py-14"
      >
        <div className="mx-auto flex w-full max-w-content flex-col gap-6">
          <FadeIn className="flex flex-col gap-2">
            <span className="eyebrow text-muted-foreground">{copy.sampleTitle}</span>
            <p className="max-w-2xl text-body text-muted-foreground">{copy.sampleDescription}</p>
          </FadeIn>
          <StaggerContainer className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/crm"
              className="flex items-center justify-between gap-4 rounded-panel border bg-surface px-5 py-4 transition-colors duration-hover hover:border-brand/40"
            >
              <span className="text-body font-medium">{copy.sampleCrmCta}</span>
              <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </Link>
            <Link
              href="/demo"
              className="flex items-center justify-between gap-4 rounded-panel border bg-surface px-5 py-4 transition-colors duration-hover hover:border-brand/40"
            >
              <span className="text-body font-medium">{copy.sampleDemoCta}</span>
              <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </StaggerContainer>
          <p className="text-caption text-muted-foreground">{copy.sampleNote}</p>
        </div>
      </section>

      <section id="stack" className="mx-auto w-full max-w-content px-gutter py-16 sm:py-20">
        <FadeIn className="mb-10 flex flex-col gap-2">
          <h2 className="text-title">{copy.stackTitle}</h2>
          <p className="max-w-lg text-body text-muted-foreground">
            {copy.stackDescriptionPrefix}{" "}
            <code className="rounded-field bg-muted px-1.5 py-0.5 font-mono text-label">/demo</code>{" "}
            {copy.stackDescriptionSuffix}
          </p>
        </FadeIn>
        <StaggerContainer className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
          {copy.features.map((item, index) => {
            const Icon = FEATURE_ICONS[index] ?? MousePointerClickIcon
            /* 能力清单读起来应该像一份规格表：四块排开的文字 + hairline，
               而不是四张一模一样的卡片。图标只是行首的一个标记。 */
            return (
              <div
                key={item.title}
                className="flex gap-3.5 border-t border-hairline py-6"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-field bg-brand-soft text-brand">
                  <Icon className="size-4" />
                </span>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h3 className="text-body font-semibold">{item.title}</h3>
                  <p className="text-body-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </StaggerContainer>

        <div className="mt-10 flex flex-col gap-1 overflow-x-auto border-l-2 border-brand/45 py-1 pl-4 font-mono text-label leading-relaxed text-muted-foreground">
          {copy.commands.map((command) => (
            <span key={command} className="whitespace-nowrap">
              <span className="mr-2 text-brand">$</span>
              {command}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t py-6">
        <p className="mx-auto w-full max-w-content px-gutter text-center text-label text-muted-foreground">
          {copy.footer}
        </p>
      </footer>
    </main>
  )
}
