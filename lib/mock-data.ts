/**
 * 演示产品的真实感 mock 数据（B2B 分析产品 "Northwind"）。
 * 界面文案与叙事性字段全部为中文；公司名 / 联系人 / 邮箱保留英文以模拟真实客户名单。
 */

export type Plan = "基础版" | "专业版" | "企业版"
export type CustomerStatus = "活跃" | "试用" | "逾期" | "已流失"

export interface Customer {
  id: string
  name: string
  contact: string
  email: string
  plan: Plan
  status: CustomerStatus
  mrr: number
  region: string
  lastActive: string
  /** 距上次活跃的小时数——用于排序（不直接展示）。 */
  lastActiveHours: number
  since: string
  seats: number
}

export const CUSTOMERS: Customer[] = [
  { id: "acme",    name: "Acme Corp",          contact: "Alicia Monroe",   email: "alicia@acmecorp.com",     plan: "专业版", status: "活跃",   mrr: 1250, region: "美国", lastActive: "2小时前",  lastActiveHours: 2,   since: "2025年1月", seats: 42 },
  { id: "wayne",   name: "Wayne Enterprises",  contact: "Bruce W.",         email: "bruce@wayne.com",         plan: "企业版", status: "活跃",   mrr: 7900, region: "美国", lastActive: "12分钟前", lastActiveHours: 0.2, since: "2024年3月", seats: 240 },
  { id: "globex",  name: "Globex",             contact: "Hank Scorpio",     email: "hank@globex.io",          plan: "企业版", status: "活跃",   mrr: 4800, region: "英国", lastActive: "26分钟前", lastActiveHours: 0.4, since: "2024年9月", seats: 130 },
  { id: "umbrella",name: "Umbrella Health",    contact: "Albert Wesker",    email: "wesker@umbrella.health",  plan: "企业版", status: "活跃",   mrr: 6200, region: "德国", lastActive: "1小时前",  lastActiveHours: 1,   since: "2024年11月", seats: 175 },
  { id: "piedpiper",name:"Pied Piper",         contact: "Richard Hendricks",email: "richard@piedpiper.com",    plan: "专业版", status: "活跃",   mrr: 2340, region: "美国", lastActive: "4分钟前",  lastActiveHours: 0.1, since: "2025年2月", seats: 68 },
  { id: "massivedy",name:"Massive Dynamic",    contact: "Nina Sharp",       email: "nina@massivedynamic.com", plan: "专业版", status: "活跃",   mrr: 1980, region: "加拿大", lastActive: "1天前",  lastActiveHours: 26,  since: "2025年4月", seats: 51 },
  { id: "tyrell",  name: "Tyrell Corp",        contact: "Eldon Tyrell",     email: "eldon@tyrell.com",        plan: "专业版", status: "活跃",   mrr: 3100, region: "英国", lastActive: "55分钟前", lastActiveHours: 0.9, since: "2024年6月", seats: 88 },
  { id: "genco",   name: "Genco Olive Oil",    contact: "Vito Corleone",    email: "vito@genco.com",          plan: "基础版", status: "活跃",   mrr: 240,  region: "意大利", lastActive: "6小时前", lastActiveHours: 6,   since: "2025年8月", seats: 6 },
  { id: "initech", name: "Initech",            contact: "Peter Gibbons",    email: "peter@initech.com",       plan: "专业版", status: "试用",   mrr: 0,    region: "美国", lastActive: "3天前",  lastActiveHours: 72,  since: "2026年9月", seats: 0 },
  { id: "hooli",   name: "Hooli",              contact: "Gavin Belson",     email: "gavin@hooli.com",         plan: "企业版", status: "试用",   mrr: 0,    region: "美国", lastActive: "2天前",  lastActiveHours: 48,  since: "2026年9月", seats: 0 },
  { id: "stark",   name: "Stark Industries",   contact: "Pepper Potts",     email: "pepper@stark.com",        plan: "专业版", status: "逾期",   mrr: 1420, region: "美国", lastActive: "5天前",  lastActiveHours: 120, since: "2024年12月", seats: 54 },
  { id: "aperture",name: "Aperture Labs",      contact: "Cave Johnson",     email: "cave@aperture.science",   plan: "基础版", status: "逾期",   mrr: 180,  region: "美国", lastActive: "9天前",  lastActiveHours: 216, since: "2025年7月", seats: 8 },
  { id: "cyberdyne",name:"Cyberdyne Systems",  contact: "Miles Dyson",      email: "miles@cyberdyne.com",     plan: "基础版", status: "已流失", mrr: 0,    region: "日本", lastActive: "32天前", lastActiveHours: 768, since: "2024年5月", seats: 0 },
  { id: "wonka",   name: "Wonka Industries",   contact: "Willy Wonka",      email: "willy@wonka.com",         plan: "基础版", status: "已流失", mrr: 0,    region: "英国", lastActive: "41天前", lastActiveHours: 984, since: "2024年1月", seats: 0 },
]

export interface RevenuePoint {
  month: string
  revenue: number
  expenses: number
}

export const REVENUE_SERIES: RevenuePoint[] = [
  { month: "1月", revenue: 58200,  expenses: 41500 },
  { month: "2月", revenue: 61300,  expenses: 42800 },
  { month: "3月", revenue: 66000,  expenses: 43900 },
  { month: "4月", revenue: 71200,  expenses: 45100 },
  { month: "5月", revenue: 74800,  expenses: 46800 },
  { month: "6月", revenue: 79500,  expenses: 47900 },
  { month: "7月", revenue: 84100,  expenses: 49200 },
  { month: "8月", revenue: 90800,  expenses: 50300 },
  { month: "9月", revenue: 96300,  expenses: 51800 },
  { month: "10月", revenue: 104200, expenses: 53400 },
  { month: "11月", revenue: 114800, expenses: 55100 },
  { month: "12月", revenue: 128450, expenses: 56900 },
]

export interface ChannelShare {
  name: string
  value: number
  color: string
}

export const CHANNEL_SHARE: ChannelShare[] = [
  { name: "自然搜索", value: 38, color: "var(--chart-1)" },
  { name: "付费广告", value: 24, color: "var(--chart-2)" },
  { name: "客户推荐", value: 19, color: "var(--chart-3)" },
  { name: "社交媒体", value: 12, color: "var(--chart-4)" },
  { name: "直接访问", value: 7,  color: "var(--chart-5)" },
]

export interface Priority {
  id: string
  title: string
  tag: string
  tagTone: "blue" | "violet" | "emerald" | "amber" | "rose"
}

export const PRIORITIES: Priority[] = [
  { id: "p1", title: "上线 2.0 版引导流程", tag: "产品", tagTone: "blue" },
  { id: "p2", title: "复盘第四季度增购管线", tag: "收入", tagTone: "emerald" },
  { id: "p3", title: "修复 iOS 端移动导航卡顿", tag: "缺陷", tagTone: "rose" },
  { id: "p4", title: "起草按席位计价的定价方案", tag: "定价", tagTone: "violet" },
  { id: "p5", title: "安排 5 场用户访谈", tag: "调研", tagTone: "amber" },
]

export interface AppNotification {
  id: string
  kind: "payment" | "trial" | "usage" | "report"
  title: string
  description: string
  time: string
  unread: boolean
}

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", kind: "trial",    title: "新的企业试用",   description: "Hooli 开始了 14 天试用",           time: "2小时前", unread: true },
  { id: "n2", kind: "payment",  title: "付款逾期",        description: "Stark Industries 有一笔账单逾期",   time: "5小时前", unread: true },
  { id: "n3", kind: "usage",    title: "用量达到上限",    description: "Wayne Enterprises 席位使用达 90%", time: "1天前",   unread: true },
  { id: "n4", kind: "report",   title: "每周报告已生成",  description: "9月1日 – 9月7日 摘要已就绪",       time: "2天前",   unread: false },
  { id: "n5", kind: "usage",    title: "用量突增",        description: "Pied Piper 今日 API 调用翻倍",     time: "2天前",   unread: false },
]

export interface ActivityEvent {
  id: string
  actor: string
  initials: string
  action: string
  time: string
}

export const ACTIVITY: ActivityEvent[] = [
  { id: "a1", actor: "Alicia Monroe",     initials: "AM", action: "将 Acme Corp 升级到专业版",          time: "18分钟前" },
  { id: "a2", actor: "Richard Hendricks", initials: "RH", action: "邀请 12 位成员加入 Pied Piper",       time: "1小时前" },
  { id: "a3", actor: "Gavin Belson",      initials: "GB", action: "在 Hooli 开始试用",                   time: "2小时前" },
  { id: "a4", actor: "Pepper Potts",      initials: "PP", action: "导出 Stark 的账单历史",               time: "4小时前" },
  { id: "a5", actor: "Vito Corleone",     initials: "VC", action: "为 Genco 新建了一个工作区",          time: "6小时前" },
]

/** 总览页 KPIs——均由 mock 数据汇总而来。 */
export const KPIS = {
  mrr: 36150,
  mrrDelta: 12.4,
  activeUsers: 8429,
  activeUsersDelta: 8.1,
  conversionRate: 3.42,
  conversionDelta: -0.4,
  avgSessionSeconds: 278,
  avgSessionDelta: 5.2,
} as const