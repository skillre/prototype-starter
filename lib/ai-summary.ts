/**
 * 确定性的 mock "AI Summary" 生成器。
 *
 * 刻意不调用任何真实 AI API：相同输入永远得到相同输出，便于演示与 Playwright
 * 断言。文案由客户自身的真实字段（status / value / tags / lastTouchHours /
 * notes）派生，因此看起来像是对这条记录的分析，而不是通用模板。
 */

import type { CrmCustomer } from "@/lib/crm-data"
import { STATUS_META } from "@/lib/crm-data"

export interface AiSummary {
  /** 一句话结论。 */
  headline: string
  /** 3–4 条基于数据的关键信号。 */
  signals: string[]
  /** 建议的下一步动作。 */
  nextStep: string
  /** 0–100 的确定性置信度评分。 */
  confidence: number
  /** 展示用的生成时间（由 createdAt 派生，保证确定性）。 */
  model: string
}

/** 模拟推理耗时（毫秒）——store 用它驱动 loading 状态。 */
export const AI_SUMMARY_LATENCY = 1400

const currency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)

/** 确定性哈希——同样的 id 永远得到同样的"置信度"。 */
function hash(input: string): number {
  let acc = 0
  for (let i = 0; i < input.length; i += 1) {
    acc = (acc * 31 + input.charCodeAt(i)) % 100000
  }
  return acc
}

function ageInDays(createdAt: string): number {
  const created = new Date(`${createdAt}T00:00:00Z`).getTime()
  const now = new Date("2026-09-10T00:00:00Z").getTime()
  return Math.max(0, Math.round((now - created) / 86_400_000))
}

/** 自然语言化"多久以前"，避免出现 "0 days ago" 这类生硬文案。 */
function relativeAge(createdAt: string): string {
  const days = ageInDays(createdAt)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 14) return "last week"
  if (days < 60) return `${Math.round(days / 7)} weeks ago`
  return `${Math.round(days / 30)} months ago`
}

/** 触达间隔的自然语言化（当天创建的新客户不应显示 "0 days"）。 */
function relativeTouch(hours: number): { phrase: string; days: number } {
  const days = Math.round(hours / 24)
  if (hours < 1) return { phrase: "in the last hour", days: 0 }
  if (hours < 24) return { phrase: "today", days: 0 }
  if (days === 1) return { phrase: "yesterday", days: 1 }
  return { phrase: `${days} days ago`, days }
}

const HEADLINES: Record<CrmCustomer["status"], (c: CrmCustomer) => string> = {
  lead: (c) =>
    `Qualified inbound lead at ${c.company}, sourced ${relativeAge(c.createdAt)} and last touched ${relativeTouch(c.lastTouchHours).phrase}.`,
  trial: (c) =>
    `Active trial at ${c.company} on the ${c.plan} plan — started ${relativeAge(c.createdAt)} with an estimated ${currency(c.value)} annual value.`,
  active: (c) =>
    `Healthy ${c.plan} account at ${c.company}, worth ${currency(c.value)} annually and last touched ${relativeTouch(c.lastTouchHours).phrase}.`,
  "at-risk": (c) =>
    `Retention risk at ${c.company}: ${currency(c.value)} of annual value has gone quiet since the last touch ${relativeTouch(c.lastTouchHours).phrase}.`,
  churned: (c) =>
    `Churned account — ${c.company} left the ${c.plan} plan and currently contributes no recurring revenue.`,
}

const NEXT_STEPS: Record<CrmCustomer["status"], (c: CrmCustomer) => string> = {
  lead: (c) =>
    `Book a 30-minute discovery call with ${c.name} within 48 hours and confirm budget ownership before the lead cools further.`,
  trial: (c) =>
    `Schedule a technical validation session with ${c.name}'s team before the trial window closes, and attach a ${c.plan} pricing sheet.`,
  active: (c) =>
    `Open an expansion conversation with ${c.name} — the account is well positioned for an upsell into the next tier.`,
  "at-risk": (c) =>
    `Escalate to an executive sponsor and request a 20-minute health check with ${c.name} this week.`,
  churned: (c) =>
    `Add ${c.company} to the FY27 win-back sequence and re-qualify once the Starter tier pricing revision ships.`,
}

/**
 * 由客户记录派生一份确定性摘要。相同客户 → 相同结果。
 */
export function buildAiSummary(customer: CrmCustomer): AiSummary {
  const signals: string[] = []

  // 状态本身
  signals.push(
    `Lifecycle stage is ${STATUS_META[customer.status].label}, on the ${customer.plan} plan.`
  )

  // 金额
  signals.push(
    customer.value > 0
      ? `Estimated annual value is ${currency(customer.value)}, ranked against the team's open book.`
      : "No recurring revenue attached to this record yet."
  )

  // 触达间隔
  const touch = relativeTouch(customer.lastTouchHours)
  signals.push(
    touch.days === 0
      ? "Touched within the last 24 hours — momentum is intact."
      : `${touch.days} days since the last recorded touch, which is ${
          touch.days > 30 ? "well beyond" : "approaching"
        } the 30-day follow-up threshold.`
  )

  // tags
  if (customer.tags.length > 0) {
    signals.push(`Signals on file: ${customer.tags.slice(0, 3).join(", ")}.`)
  }

  // 备注里的一句话
  const firstSentence = customer.notes.split(/(?<=\.)\s+/)[0]
  if (firstSentence) {
    signals.push(`Latest note: ${firstSentence}`)
  }

  const statusWeight: Record<CrmCustomer["status"], number> = {
    active: 24,
    trial: 16,
    lead: 8,
    "at-risk": -14,
    churned: -22,
  }
  const recencyPenalty = Math.min(30, Math.round(touch.days / 4))
  const confidence = Math.max(
    12,
    Math.min(97, 68 + statusWeight[customer.status] - recencyPenalty + (hash(customer.id) % 9))
  )

  return {
    headline: HEADLINES[customer.status](customer),
    signals: signals.slice(0, 4),
    nextStep: NEXT_STEPS[customer.status](customer),
    confidence,
    model: "sales-copilot · deterministic mock",
  }
}
