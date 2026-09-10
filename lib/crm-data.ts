/**
 * AI CRM 的真实感 mock 数据。
 *
 * 与 lib/mock-data.ts（Northwind 演示仪表盘）相互独立——CRM 原型拥有自己的
 * 客户、任务、活动与图表数据，但共用同一套 UI primitive、motion preset 与
 * design token。所有金额、时间戳、公司名都按真实 SaaS 销售场景构造。
 */

/* -------------------------------------------------------------------------- */
/* Customers                                                                   */
/* -------------------------------------------------------------------------- */

export type CustomerStatus = "lead" | "trial" | "active" | "churned" | "at-risk"

export type CustomerPlan = "Starter" | "Growth" | "Scale" | "Enterprise"

export interface CrmCustomer {
  id: string
  name: string
  company: string
  email: string
  phone: string
  title: string
  status: CustomerStatus
  owner: string
  /** 合同金额（美元），未成交的为预估 pipeline 金额。 */
  value: number
  plan: CustomerPlan
  /** ISO 日期，用于排序与"本月新增"统计。 */
  createdAt: string
  /** 距上次触达的小时数——排序用，不直接展示。 */
  lastTouchHours: number
  tags: string[]
  notes: string
}

export const CRM_OWNERS = [
  "Maya Chen",
  "Daniel Okafor",
  "Sofia Ricci",
  "Jonas Weber",
  "Priya Nair",
] as const

export type CrmOwner = (typeof CRM_OWNERS)[number]

/** Owner 头像用的首字母。 */
export const ownerInitials = (owner: string): string =>
  owner
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

export const STATUS_META: Record<
  CustomerStatus,
  { label: string; dot: string; text: string; chip: string }
> = {
  lead: {
    label: "Lead",
    dot: "bg-chart-2",
    text: "text-chart-2",
    chip: "border-transparent bg-chart-2/12 text-chart-2",
  },
  trial: {
    label: "Trial",
    dot: "bg-chart-4",
    text: "text-chart-4",
    chip: "border-transparent bg-chart-4/12 text-chart-4",
  },
  active: {
    label: "Active",
    dot: "bg-chart-3",
    text: "text-chart-3",
    chip: "border-transparent bg-chart-3/12 text-chart-3",
  },
  "at-risk": {
    label: "At risk",
    dot: "bg-chart-5",
    text: "text-chart-5",
    chip: "border-transparent bg-chart-5/12 text-chart-5",
  },
  churned: {
    label: "Churned",
    dot: "bg-muted-foreground/50",
    text: "text-muted-foreground",
    chip: "border-transparent bg-muted text-muted-foreground",
  },
}

export const STATUS_ORDER: CustomerStatus[] = ["lead", "trial", "active", "at-risk", "churned"]

export const CRM_CUSTOMERS: CrmCustomer[] = [
  {
    id: "c-001",
    name: "Amelia Hartley",
    company: "Northwind Logistics",
    email: "amelia.hartley@northwind-logistics.com",
    phone: "+1 (415) 555-0142",
    title: "VP Operations",
    status: "active",
    owner: "Maya Chen",
    value: 148000,
    plan: "Enterprise",
    createdAt: "2026-08-19",
    lastTouchHours: 3,
    tags: ["enterprise", "renewal-q4", "fleet-api"],
    notes:
      "Renewal lands in November. Ops team is pushing for a fleet telemetry API before they sign — engineering scoping call booked for next Tuesday.",
  },
  {
    id: "c-002",
    name: "Tobias Lindqvist",
    company: "Helio Semiconductor",
    email: "t.lindqvist@helio-semi.com",
    phone: "+46 8 555 0117",
    title: "Head of Procurement",
    status: "trial",
    owner: "Daniel Okafor",
    value: 96000,
    plan: "Scale",
    createdAt: "2026-09-02",
    lastTouchHours: 20,
    tags: ["trial-day-9", "security-review"],
    notes:
      "Nine days into the trial. Security questionnaire came back clean; legal is the remaining gate before a Q4 start.",
  },
  {
    id: "c-003",
    name: "Renata Alves",
    company: "Verdant Agriculture",
    email: "renata.alves@verdant-ag.com",
    phone: "+55 11 5550 0193",
    title: "Director of IT",
    status: "at-risk",
    owner: "Sofia Ricci",
    value: 72000,
    plan: "Growth",
    createdAt: "2026-03-11",
    lastTouchHours: 288,
    tags: ["champion-left", "renewal-q3"],
    notes:
      "Our champion moved to a competitor in July. New director has not joined a call in six weeks — needs an executive-level re-introduction.",
  },
  {
    id: "c-004",
    name: "Marcus Bell",
    company: "Beacon Health Group",
    email: "marcus.bell@beaconhealth.org",
    phone: "+1 (617) 555-0188",
    title: "Chief Information Officer",
    status: "active",
    owner: "Maya Chen",
    value: 210000,
    plan: "Enterprise",
    createdAt: "2026-01-27",
    lastTouchHours: 8,
    tags: ["enterprise", "hipaa", "expansion"],
    notes:
      "Expansion conversation started for two additional clinics. HIPAA addendum is signed and on file; procurement wants a 3-year term.",
  },
  {
    id: "c-005",
    name: "Yuki Tanaka",
    company: "Kite Robotics",
    email: "yuki.tanaka@kite-robotics.jp",
    phone: "+81 3 5550 0126",
    title: "Engineering Manager",
    status: "trial",
    owner: "Jonas Weber",
    value: 54000,
    plan: "Growth",
    createdAt: "2026-09-05",
    lastTouchHours: 44,
    tags: ["trial-day-6", "self-serve"],
    notes:
      "Signed up self-serve and invited eleven engineers on day one. Usage is well above the trial median — good candidate for a fast close.",
  },
  {
    id: "c-006",
    name: "Priyanka Raman",
    company: "Solstice Energy",
    email: "priyanka.raman@solstice-energy.com",
    phone: "+1 (713) 555-0164",
    title: "VP Finance",
    status: "active",
    owner: "Priya Nair",
    value: 132000,
    plan: "Scale",
    createdAt: "2026-05-14",
    lastTouchHours: 30,
    tags: ["finance-buyer", "usage-based"],
    notes:
      "Wants usage-based pricing instead of seat pricing before the next term. Finance is modelling overage scenarios internally.",
  },
  {
    id: "c-007",
    name: "Henrik Sorensen",
    company: "Fjord Maritime",
    email: "henrik.sorensen@fjord-maritime.no",
    phone: "+47 22 555 0198",
    title: "Fleet Director",
    status: "churned",
    owner: "Daniel Okafor",
    value: 0,
    plan: "Starter",
    createdAt: "2025-11-08",
    lastTouchHours: 1440,
    tags: ["churned", "budget-cut"],
    notes:
      "Cancelled in June after a budget freeze across the fleet division. Left the door open to revisit in FY27 — set a reminder for January.",
  },
  {
    id: "c-008",
    name: "Clara Nguyen",
    company: "Lumen Diagnostics",
    email: "clara.nguyen@lumendx.com",
    phone: "+1 (206) 555-0131",
    title: "Lab Director",
    status: "active",
    owner: "Sofia Ricci",
    value: 88000,
    plan: "Growth",
    createdAt: "2026-06-30",
    lastTouchHours: 52,
    tags: ["integration", "lims"],
    notes:
      "LIMS integration went live last month. Lab throughput reporting is the feature they cite most in internal reviews.",
  },
  {
    id: "c-009",
    name: "Diego Marquez",
    company: "Cobalt Manufacturing",
    email: "diego.marquez@cobalt-mfg.com",
    phone: "+1 (312) 555-0175",
    title: "Plant Manager",
    status: "lead",
    owner: "Jonas Weber",
    value: 41000,
    plan: "Starter",
    createdAt: "2026-09-08",
    lastTouchHours: 12,
    tags: ["inbound", "demo-booked"],
    notes:
      "Inbound from the manufacturing webinar. Demo booked for Thursday — main question is whether we support offline floor tablets.",
  },
  {
    id: "c-010",
    name: "Ingrid Bauer",
    company: "Aurora Insurance",
    email: "ingrid.bauer@aurora-insure.de",
    phone: "+49 30 5550 0154",
    title: "Head of Claims",
    status: "at-risk",
    owner: "Priya Nair",
    value: 115000,
    plan: "Scale",
    createdAt: "2026-02-20",
    lastTouchHours: 336,
    tags: ["renewal-q3", "support-escalation"],
    notes:
      "Escalated two P2 tickets in August. Both resolved, but sentiment dipped — schedule a health check with the claims leads.",
  },
  {
    id: "c-011",
    name: "Samuel Adeyemi",
    company: "Terraform Capital",
    email: "samuel.adeyemi@terraformcap.com",
    phone: "+44 20 5550 0102",
    title: "Partner",
    status: "active",
    owner: "Maya Chen",
    value: 175000,
    plan: "Enterprise",
    createdAt: "2025-12-04",
    lastTouchHours: 15,
    tags: ["enterprise", "advocacy", "case-study"],
    notes:
      "Agreed to a joint case study for the Q4 launch. Legal is reviewing the quote; comms wants final sign-off by October.",
  },
  {
    id: "c-012",
    name: "Lucia Ferraro",
    company: "Meridian Retail",
    email: "lucia.ferraro@meridian-retail.it",
    phone: "+39 02 5550 0187",
    title: "Digital Commerce Lead",
    status: "trial",
    owner: "Sofia Ricci",
    value: 63000,
    plan: "Growth",
    createdAt: "2026-08-28",
    lastTouchHours: 68,
    tags: ["trial-day-13", "peak-season"],
    notes:
      "Trial ends before peak season. Decision hinges on whether the rollout can finish before the November traffic spike.",
  },
  {
    id: "c-013",
    name: "Nathan Cole",
    company: "Ironclad Security",
    email: "nathan.cole@ironclad-sec.com",
    phone: "+1 (512) 555-0119",
    title: "CISO",
    status: "active",
    owner: "Daniel Okafor",
    value: 164000,
    plan: "Enterprise",
    createdAt: "2026-04-09",
    lastTouchHours: 22,
    tags: ["enterprise", "soc2", "security"],
    notes:
      "CISO personally ran the security review and signed off in four days. Strong internal advocate for the platform team rollout.",
  },
  {
    id: "c-014",
    name: "Fatima Al-Rashid",
    company: "Dune Analytics Partners",
    email: "fatima.alrashid@dune-partners.ae",
    phone: "+971 4 555 0166",
    title: "Managing Director",
    status: "lead",
    owner: "Priya Nair",
    value: 58000,
    plan: "Scale",
    createdAt: "2026-09-06",
    lastTouchHours: 36,
    tags: ["referral", "multi-region"],
    notes:
      "Referred by Terraform Capital. Needs multi-region data residency, which our EU and UAE regions already cover.",
  },
  {
    id: "c-015",
    name: "Oliver Grant",
    company: "Pinnacle Aerospace",
    email: "oliver.grant@pinnacle-aero.com",
    phone: "+1 (303) 555-0148",
    title: "Program Director",
    status: "at-risk",
    owner: "Jonas Weber",
    value: 98000,
    plan: "Scale",
    createdAt: "2026-01-15",
    lastTouchHours: 400,
    tags: ["renewal-q4", "compliance"],
    notes:
      "Programme paused pending an ITAR review. Not a product issue, but the renewal date will slip unless we re-engage this month.",
  },
  {
    id: "c-016",
    name: "Beatriz Santos",
    company: "Horizon Telecom",
    email: "beatriz.santos@horizon-telecom.br",
    phone: "+55 21 5550 0173",
    title: "Network Operations Manager",
    status: "active",
    owner: "Sofia Ricci",
    value: 121000,
    plan: "Scale",
    createdAt: "2026-07-22",
    lastTouchHours: 40,
    tags: ["expansion", "api-heavy"],
    notes:
      "API volume grew 3× since onboarding. Ops wants a dedicated support tier before the next billing cycle.",
  },
  {
    id: "c-017",
    name: "Erik Lund",
    company: "Nordic Fintech Labs",
    email: "erik.lund@nordic-fintech.se",
    phone: "+46 31 555 0121",
    title: "Head of Platform",
    status: "trial",
    owner: "Maya Chen",
    value: 79000,
    plan: "Growth",
    createdAt: "2026-09-01",
    lastTouchHours: 26,
    tags: ["trial-day-10", "psd2"],
    notes:
      "PSD2 compliance questions answered by our solutions engineer. Waiting on their architecture review board, which meets Fridays.",
  },
  {
    id: "c-018",
    name: "Grace Whitfield",
    company: "Sterling Legal",
    email: "grace.whitfield@sterlinglegal.co.uk",
    phone: "+44 161 555 0139",
    title: "Operations Partner",
    status: "churned",
    owner: "Priya Nair",
    value: 0,
    plan: "Starter",
    createdAt: "2025-09-30",
    lastTouchHours: 2160,
    tags: ["churned", "competitor"],
    notes:
      "Moved to a competitor in April on price. Worth a win-back attempt once our Starter tier pricing is revised.",
  },
  {
    id: "c-019",
    name: "Andre Kowalski",
    company: "Vistula Pharma",
    email: "andre.kowalski@vistula-pharma.pl",
    phone: "+48 22 555 0158",
    title: "Quality Director",
    status: "active",
    owner: "Daniel Okafor",
    value: 142000,
    plan: "Enterprise",
    createdAt: "2026-05-27",
    lastTouchHours: 47,
    tags: ["gxp", "audit-trail"],
    notes:
      "Passed their GxP audit in July with no findings on our audit-trail module. Quality team is now a reference account.",
  },
  {
    id: "c-020",
    name: "Mei Lin Chow",
    company: "Pacific Rim Shipping",
    email: "meilin.chow@pacificrim-ship.com",
    phone: "+65 6555 0114",
    title: "Regional Logistics Head",
    status: "lead",
    owner: "Sofia Ricci",
    value: 47000,
    plan: "Growth",
    createdAt: "2026-09-09",
    lastTouchHours: 6,
    tags: ["inbound", "pricing"],
    notes:
      "Requested a pricing sheet for four APAC ports. Volume discount tiers are the deciding factor for them.",
  },
  {
    id: "c-021",
    name: "Victor Osei",
    company: "Accra Solar Ventures",
    email: "victor.osei@accrasolar.gh",
    phone: "+233 30 555 0191",
    title: "Head of Field Operations",
    status: "trial",
    owner: "Jonas Weber",
    value: 36000,
    plan: "Starter",
    createdAt: "2026-09-07",
    lastTouchHours: 32,
    tags: ["trial-day-4", "offline-first"],
    notes:
      "Field teams work with intermittent connectivity. Offline sync is the single feature that decides this trial.",
  },
  {
    id: "c-022",
    name: "Elena Petrova",
    company: "Baltic Freight Union",
    email: "elena.petrova@balticfreight.lv",
    phone: "+371 6 555 0128",
    title: "Deputy Director",
    status: "active",
    owner: "Maya Chen",
    value: 67000,
    plan: "Growth",
    createdAt: "2026-08-12",
    lastTouchHours: 58,
    tags: ["seasonal", "expansion"],
    notes:
      "Seasonal volume spike handled cleanly this year. Discussing a second region for the spring contract.",
  },
]

/* -------------------------------------------------------------------------- */
/* Tasks — 横向拖拽看板                                                        */
/* -------------------------------------------------------------------------- */

export type TaskColumnId = "follow-up" | "call" | "proposal" | "demo" | "onboarding"

export interface CrmTask {
  id: string
  title: string
  /** 关联客户的 company 名称。 */
  company: string
  owner: string
  /** ISO 日期。 */
  due: string
  /** 0–100，低于 30 显示为逾期风险。 */
  progress: number
}

export interface TaskColumn {
  id: TaskColumnId
  title: string
  hint: string
}

export const TASK_COLUMNS: TaskColumn[] = [
  { id: "follow-up", title: "Follow up", hint: "Awaiting reply" },
  { id: "call", title: "Call customer", hint: "Phone conversation" },
  { id: "proposal", title: "Send proposal", hint: "Quote or contract" },
  { id: "demo", title: "Product demo", hint: "Live walkthrough" },
  { id: "onboarding", title: "Onboarding", hint: "Getting started" },
]

export const CRM_TASKS: Record<TaskColumnId, CrmTask[]> = {
  "follow-up": [
    { id: "t-101", title: "Re-introduce new IT director", company: "Verdant Agriculture", owner: "Sofia Ricci", due: "2026-09-11", progress: 20 },
    { id: "t-102", title: "Send APAC pricing sheet", company: "Pacific Rim Shipping", owner: "Sofia Ricci", due: "2026-09-12", progress: 55 },
    { id: "t-103", title: "Share case study draft", company: "Terraform Capital", owner: "Maya Chen", due: "2026-09-15", progress: 70 },
  ],
  call: [
    { id: "t-201", title: "Renewal scoping call", company: "Northwind Logistics", owner: "Maya Chen", due: "2026-09-11", progress: 40 },
    { id: "t-202", title: "Claims team health check", company: "Aurora Insurance", owner: "Priya Nair", due: "2026-09-14", progress: 25 },
    { id: "t-203", title: "ITAR review follow-up", company: "Pinnacle Aerospace", owner: "Jonas Weber", due: "2026-09-16", progress: 15 },
  ],
  proposal: [
    { id: "t-301", title: "Draft 3-year enterprise term", company: "Beacon Health Group", owner: "Maya Chen", due: "2026-09-12", progress: 65 },
    { id: "t-302", title: "Usage-based pricing model", company: "Solstice Energy", owner: "Priya Nair", due: "2026-09-18", progress: 35 },
  ],
  demo: [
    { id: "t-401", title: "Offline floor-tablet demo", company: "Cobalt Manufacturing", owner: "Jonas Weber", due: "2026-09-11", progress: 45 },
    { id: "t-402", title: "Multi-region residency demo", company: "Dune Analytics Partners", owner: "Priya Nair", due: "2026-09-17", progress: 30 },
    { id: "t-403", title: "Peak-season rollout plan", company: "Meridian Retail", owner: "Sofia Ricci", due: "2026-09-19", progress: 50 },
  ],
  onboarding: [
    { id: "t-501", title: "Fleet telemetry API scope", company: "Northwind Logistics", owner: "Maya Chen", due: "2026-09-13", progress: 60 },
    { id: "t-502", title: "LIMS post-launch review", company: "Lumen Diagnostics", owner: "Sofia Ricci", due: "2026-09-20", progress: 80 },
    { id: "t-503", title: "Dedicated support tier setup", company: "Horizon Telecom", owner: "Sofia Ricci", due: "2026-09-22", progress: 10 },
  ],
}

/* -------------------------------------------------------------------------- */
/* Activities — 客户时间线                                                     */
/* -------------------------------------------------------------------------- */

export type ActivityKind = "email" | "call" | "meeting" | "note" | "status"

export interface CrmActivity {
  id: string
  customerId: string
  kind: ActivityKind
  title: string
  detail: string
  actor: string
  /** 展示用相对时间。 */
  time: string
  /** ISO 时间戳，用于排序。 */
  at: string
}

export const ACTIVITY_META: Record<
  ActivityKind,
  { label: string; icon: "mail" | "phone" | "calendar" | "note" | "status" }
> = {
  email: { label: "Email", icon: "mail" },
  call: { label: "Call", icon: "phone" },
  meeting: { label: "Meeting", icon: "calendar" },
  note: { label: "Note", icon: "note" },
  status: { label: "Status change", icon: "status" },
}

export const CRM_ACTIVITIES: CrmActivity[] = [
  { id: "a-001", customerId: "c-001", kind: "meeting", title: "Renewal scoping meeting", detail: "Walked through the fleet telemetry API requirements with ops and engineering.", actor: "Maya Chen", time: "3 hours ago", at: "2026-09-10T07:15:00Z" },
  { id: "a-002", customerId: "c-004", kind: "email", title: "Sent 3-year term draft", detail: "Attached the enterprise agreement with the HIPAA addendum referenced in section 7.", actor: "Maya Chen", time: "8 hours ago", at: "2026-09-10T02:40:00Z" },
  { id: "a-003", customerId: "c-002", kind: "status", title: "Moved to Trial", detail: "Security questionnaire returned clean; trial extended by seven days.", actor: "Daniel Okafor", time: "20 hours ago", at: "2026-09-09T14:20:00Z" },
  { id: "a-004", customerId: "c-011", kind: "call", title: "Case study kickoff call", detail: "Agreed on the narrative arc and a two-week review window with their comms team.", actor: "Maya Chen", time: "15 hours ago", at: "2026-09-09T19:05:00Z" },
  { id: "a-005", customerId: "c-016", kind: "note", title: "API volume up 3×", detail: "Flagged for a dedicated support tier conversation before the next billing cycle.", actor: "Sofia Ricci", time: "1 day ago", at: "2026-09-09T06:00:00Z" },
  { id: "a-006", customerId: "c-010", kind: "status", title: "Marked At risk", detail: "Sentiment dipped after two P2 escalations in August; both since resolved.", actor: "Priya Nair", time: "2 days ago", at: "2026-09-08T09:30:00Z" },
  { id: "a-007", customerId: "c-013", kind: "meeting", title: "Security review sign-off", detail: "CISO completed the review personally and approved the platform rollout.", actor: "Daniel Okafor", time: "2 days ago", at: "2026-09-08T05:45:00Z" },
  { id: "a-008", customerId: "c-020", kind: "email", title: "Inbound pricing request", detail: "Asked for volume discount tiers across four APAC ports.", actor: "Sofia Ricci", time: "6 hours ago", at: "2026-09-10T04:10:00Z" },
  { id: "a-009", customerId: "c-008", kind: "note", title: "Post-launch review notes", detail: "LIMS integration stable for four weeks; throughput reporting is the most-cited feature.", actor: "Sofia Ricci", time: "3 days ago", at: "2026-09-07T08:00:00Z" },
  { id: "a-010", customerId: "c-019", kind: "status", title: "GxP audit passed", detail: "No findings on the audit-trail module. Quality team offered to act as a reference.", actor: "Daniel Okafor", time: "4 days ago", at: "2026-09-06T11:25:00Z" },
  { id: "a-011", customerId: "c-005", kind: "email", title: "Trial check-in", detail: "Eleven engineers invited on day one; usage is well above the trial median.", actor: "Jonas Weber", time: "1 day ago", at: "2026-09-09T03:20:00Z" },
  { id: "a-012", customerId: "c-012", kind: "call", title: "Peak-season feasibility call", detail: "Discussed whether rollout can complete before the November traffic spike.", actor: "Sofia Ricci", time: "2 days ago", at: "2026-09-08T13:50:00Z" },
  { id: "a-013", customerId: "c-022", kind: "note", title: "Seasonal spike handled", detail: "Volume peak processed without incidents; spring contract expansion under discussion.", actor: "Maya Chen", time: "5 days ago", at: "2026-09-05T07:40:00Z" },
  { id: "a-014", customerId: "c-007", kind: "status", title: "Churned", detail: "Cancelled after a fleet-division budget freeze. Revisit scheduled for January.", actor: "Daniel Okafor", time: "1 week ago", at: "2026-09-03T10:15:00Z" },
  { id: "a-015", customerId: "c-009", kind: "call", title: "Inbound demo booked", detail: "Main question is offline support for floor tablets; demo set for Thursday.", actor: "Jonas Weber", time: "12 hours ago", at: "2026-09-09T22:05:00Z" },
  { id: "a-016", customerId: "c-017", kind: "email", title: "PSD2 answers sent", detail: "Solutions engineer answered the compliance questions; awaiting architecture review.", actor: "Maya Chen", time: "1 day ago", at: "2026-09-09T01:30:00Z" },
  { id: "a-017", customerId: "c-021", kind: "note", title: "Offline sync requirement", detail: "Field teams work with intermittent connectivity — offline sync decides this trial.", actor: "Jonas Weber", time: "2 days ago", at: "2026-09-08T04:55:00Z" },
  { id: "a-018", customerId: "c-015", kind: "status", title: "Flagged At risk", detail: "Programme paused pending an ITAR review; renewal date will slip without re-engagement.", actor: "Jonas Weber", time: "6 days ago", at: "2026-09-04T09:05:00Z" },
  { id: "a-019", customerId: "c-003", kind: "note", title: "Champion departure noted", detail: "Primary champion moved to a competitor in July; new director unresponsive.", actor: "Sofia Ricci", time: "1 week ago", at: "2026-09-02T15:30:00Z" },
  { id: "a-020", customerId: "c-006", kind: "meeting", title: "Pricing model workshop", detail: "Finance is modelling overage scenarios for a usage-based structure.", actor: "Priya Nair", time: "4 days ago", at: "2026-09-06T06:20:00Z" },
]

/* -------------------------------------------------------------------------- */
/* Dashboard series                                                            */
/* -------------------------------------------------------------------------- */

export interface PipelinePoint {
  month: string
  won: number
  pipeline: number
}

export const PIPELINE_SERIES: PipelinePoint[] = [
  { month: "Oct", won: 118000, pipeline: 265000 },
  { month: "Nov", won: 132000, pipeline: 288000 },
  { month: "Dec", won: 156000, pipeline: 271000 },
  { month: "Jan", won: 141000, pipeline: 312000 },
  { month: "Feb", won: 168000, pipeline: 334000 },
  { month: "Mar", won: 159000, pipeline: 305000 },
  { month: "Apr", won: 184000, pipeline: 348000 },
  { month: "May", won: 197000, pipeline: 366000 },
  { month: "Jun", won: 212000, pipeline: 352000 },
  { month: "Jul", won: 226000, pipeline: 391000 },
  { month: "Aug", won: 244000, pipeline: 412000 },
  { month: "Sep", won: 268000, pipeline: 438000 },
]

export interface StageSlice {
  name: string
  value: number
  color: string
}

/** 按当前客户状态实时计算的 pipeline 分布（在视图中由 store 数据派生）。 */
export const STAGE_COLORS: Record<CustomerStatus, string> = {
  lead: "var(--chart-2)",
  trial: "var(--chart-4)",
  active: "var(--chart-3)",
  "at-risk": "var(--chart-5)",
  churned: "var(--chart-1)",
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

export interface CrmNotification {
  id: string
  kind: "trial" | "payment" | "usage" | "report"
  title: string
  description: string
  time: string
  unread: boolean
  /** 关联客户——点击通知可直接进入该客户详情页。 */
  customerId?: string
}

export const CRM_NOTIFICATIONS: CrmNotification[] = [
  {
    id: "cn1",
    kind: "trial",
    title: "Trial ending soon",
    description: "Helio Semiconductor's trial closes in 5 days",
    time: "2h ago",
    unread: true,
    customerId: "c-002",
  },
  {
    id: "cn2",
    kind: "payment",
    title: "Contract signed",
    description: "Beacon Health Group returned the 3-year term",
    time: "5h ago",
    unread: true,
    customerId: "c-004",
  },
  {
    id: "cn3",
    kind: "usage",
    title: "Account at risk",
    description: "Verdant Agriculture has gone 12 days without contact",
    time: "1d ago",
    unread: true,
    customerId: "c-003",
  },
  {
    id: "cn4",
    kind: "report",
    title: "Weekly pipeline report",
    description: "Aug 31 – Sep 6 summary is ready",
    time: "3d ago",
    unread: false,
  },
]
