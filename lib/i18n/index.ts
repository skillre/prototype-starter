import { zhCN, type Messages } from "./zh-CN"

/**
 * Locale registry — the only place that knows which dictionaries exist.
 *
 * Default is `zh-CN`. Adding `en-US` is a two-line change: create
 * `lib/i18n/en-US.ts` exporting a `Messages`-shaped object, then append the tag
 * to `LOCALES` and the map below. No component needs to know.
 *
 * ## 覆盖范围（重要：把「界面文案」和「业务内容」分开）
 *
 * 词典负责 **界面文案**，以及由界面生成的文案模板：
 *   ✅ components/**        所有共享 UI（含 Sidebar / TopNav / FilterBar /
 *                           Pagination / DetailDrawer 等组件的默认文案）
 *   ✅ app/crm/**           CRM 产品的全部界面文案
 *   ✅ lib/ai-summary.ts    AI 摘要的生成模板（是文案，不是数据）
 *
 * 词典**不**负责 **业务记录内容**——那是数据，不是可翻译的文案：
 *   ⛔ lib/crm-data.ts      客户名、公司名、备注、活动标题、标签、金额
 *
 * 尚未迁移：`app/demo/**`（Starter 自带演示版块）与 `app/page.tsx`（Starter
 * 落地页）的版块文案仍写在 JSX 里；它们的**共享布局文案**已经走词典。
 * 剩余部分是机械迁移，不影响本阶段结论，但新增原型应直接从词典取文案。
 */
export const LOCALES = ["zh-CN"] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "zh-CN"

const dictionaries: Record<Locale, Messages> = {
  "zh-CN": zhCN,
}

/** Messages for a locale, falling back to the default for anything unknown. */
export function getMessages(locale: Locale = DEFAULT_LOCALE): Messages {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** Non-hook accessor for server components and non-React modules. */
export const messages = getMessages(DEFAULT_LOCALE)

export { zhCN }
export type { Messages }
