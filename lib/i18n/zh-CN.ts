import type { ActivityKind, CustomerPlan, CustomerStatus, TaskColumnId } from "@/lib/crm-data"

/**
 * zh-CN — the reference dictionary.
 *
 * Every user-visible string in the product lives here. Components never inline
 * copy: they read it through `useMessages()`. Adding a locale therefore means
 * adding one sibling file (`en-US.ts`) that satisfies the same shape — no
 * component needs to change.
 *
 * Conventions
 *   • Parameterised copy is a function, never string concatenation.
 *   • Keys describe meaning (`customers.empty.noMatch`), not position.
 *   • Route slugs, code identifiers, keyboard shortcuts and brand names that
 *     are genuinely proper nouns stay as-is by design.
 */
export const zhCN = {
  /* ------------------------------------------------------------------ meta */
  locale: {
    label: "简体中文",
    short: "中",
  },

  common: {
    cancel: "取消",
    close: "关闭",
    confirm: "确认",
    save: "保存",
    back: "返回",
    retry: "重试",
    reset: "重置",
    search: "搜索",
    searchPlaceholder: "搜索…",
    clearSearch: "清除搜索",
    resetFilters: "重置筛选",
    clearFilters: "清除筛选",
    loading: "加载中",
    loadFailed: "数据加载失败",
    copy: "复制",
    copied: "已复制",
    openMenu: "打开菜单",
    more: "更多",
    none: "暂无",
    notAvailable: "—",
    unit: {
      customer: "位客户",
      task: "项任务",
      event: "条活动",
      day: "天",
      hour: "小时",
    },
  },

  /**
   * 内置演示（/demo）的默认文案。Sidebar / TopNav / MobileNav 是共享布局组件，
   * 未注入配置时就取这里的默认值——组件本身因此不含任何硬编码文案。
   */
  demo: {
    brandName: "Northwind",
    brandSubtitle: "分析工作区",
    userName: "Taylor Wu",
    userEmail: "taylor@northwind.dev",
    userInitials: "TW",
    usageLabel: "用量",
    usageValue: "64%",
    usageHint: "专业版已使用 206 / 320 个席位。",
    quickStart: "快速上手",
    nav: {
      overview: "总览",
      customers: "客户",
      activity: "动态",
      settings: "快速上手",
    },
  },

  /** 通用分页文案——Pagination 的默认标签取这里，调用方无需重复传入。 */
  pagination: {
    nav: "分页",
    previous: "上一页",
    next: "下一页",
    page: (value: number) => `第 ${value} 页`,
    noResults: "暂无结果",
    range: (from: number, to: number, total: number) =>
      `第 ${from}–${to} 条，共 ${total} 条`,
  },

  /** 通用多步向导文案——OnboardingWizard 的默认文案。 */
  wizard: {
    title: "设置你的工作区",
    description: "一分钟即可完成设置，之后随时可以修改。",
    step: (index: number, total: number) => `第 ${index} 步，共 ${total} 步`,
    back: "上一步",
    next: "下一步",
    finish: "完成",
  },

  /**
   * 由表单动作**生成**的记录内容——不是界面文案，但同样是集中管理的用户可见文本。
   */
  data: {
    tagInbound: "主动咨询",
    tagNew: "新建",
    placeholderNote: "由「添加客户」表单创建。",
    createdActivityTitle: "新建客户",
    createdActivityDetail: (owner: string, company: string) =>
      `${owner} 将「${company}」加入管道。`,
    justNow: "刚刚",
  },

  a11y: {
    primaryNav: "主导航",
    openNav: "打开导航",
    openCommand: "打开命令面板",
    commandHint: "搜索或运行命令",
    toggleTheme: "切换主题",
    refreshData: "刷新数据",
    notifications: "通知",
    accountMenu: "账户菜单",
    prototypeControls: "演示控制",
    backToTop: "回到顶部",
    sectionLabel: "工作区",
    skipToContent: "跳到主要内容",
  },

  brand: {
    name: "智销云",
    subtitle: "AI 销售工作台",
    mark: "智",
    metaTitle: "智销云 · AI CRM 原型",
    metaDescription:
      "高保真交互式 AI CRM 原型——管道仪表盘、客户名册、客户档案、可拖拽任务看板与活动时间线。",
  },

  nav: {
    dashboard: "总览",
    customers: "客户",
    tasks: "任务",
    activities: "活动",
    addCustomer: "添加客户",
  },

  page: {
    dashboard: {
      eyebrow: "销售管道",
      title: "总览",
      description: "管道健康度 · 2026 年 9 月",
    },
    customers: {
      eyebrow: "客户管理",
      title: "客户",
      description: "名册中的全部客户",
    },
    tasks: {
      eyebrow: "销售执行",
      title: "任务",
      description: "在列之间拖动卡片即可调整顺序",
    },
    activities: {
      eyebrow: "互动记录",
      title: "活动",
      description: "完整的客户互动时间线",
    },
    breadcrumb: (section: string) => `智销云 / ${section}`,
  },

  /* --------------------------------------------------------------- statuses */
  status: {
    lead: "线索",
    trial: "试用",
    active: "合作中",
    "at-risk": "流失风险",
    churned: "已流失",
  } satisfies Record<CustomerStatus, string>,

  plan: {
    Starter: "基础版",
    Growth: "成长版",
    Scale: "规模版",
    Enterprise: "旗舰版",
  } satisfies Record<CustomerPlan, string>,

  /* -------------------------------------------------------------- dashboard */
  dashboard: {
    kpi: {
      totalCustomers: "客户总数",
      newThisMonth: "本月新增",
      activeDeals: "进行中商机",
      revenue: "合同总额",
      conversionRate: "成交转化率",
      viewAllCustomers: "查看全部客户",
      viewOpenLeads: "查看线索与试用中的客户",
      viewSignedTasks: "查看已签约客户的跟进任务",
      viewActive: "查看合作中的客户",
      vsLastMonth: "环比上月",
      closedWonShare: "已签约客户占比",
      activate: (label: string) => `${label} —— 查看明细`,
    },
    pipeline: {
      title: "管道表现",
      description: "近 12 个月已签约金额与在谈管道",
      won: "已签约",
      pipeline: "在谈管道",
    },
    stage: {
      title: "阶段分布",
      description: "按每位客户的当前阶段实时统计",
      customers: (value: number) => `${value} 位客户`,
    },
    recentActivity: {
      title: "最近动态",
      description: "名册中最新发生的触达记录。",
      open: (company: string, title: string) => `打开「${company} · ${title}」`,
    },
    tasksOverview: {
      title: "任务总览",
      summary: (open: number, dueThisWeek: number) =>
        `待办 ${open} 项 · 本周到期 ${dueThisWeek} 项`,
      openBoard: "打开看板",
      nothingQueued: "暂无排期",
      openColumn: (title: string) => `在看板中打开「${title}」列`,
      insight: (count: number, column: string) =>
        `未来五天内有 ${count} 项任务到期，建议先清空「${column}」列。`,
    },
    accounts: {
      title: "高价值客户",
      description: "按年度合同金额排序。",
      live: "实时数据",
    },
  },

  /* -------------------------------------------------------------- customers */
  customers: {
    searchPlaceholder: "搜索客户名称、公司或邮箱…",
    addCustomer: "添加客户",
    resultCaption: (visible: number, total: number) => `共 ${total} 位客户，当前显示 ${visible} 位`,
    filters: {
      allStatuses: "全部状态",
      allOwners: "全部负责人",
      sortPrefix: "排序",
    },
    sort: {
      createdAt: "创建时间",
      value: "合同金额",
      name: "客户名称",
      company: "公司",
      lastTouchHours: "最近联系",
      aria: (label: string) => `按${label}排序`,
    },
    columns: {
      customer: "客户",
      status: "状态",
      owner: "负责人",
      value: "合同金额",
      createdAt: "创建时间",
      updatedAt: "最近联系",
    },
    empty: {
      title: "没有匹配的客户",
      noSearch: "当前状态或负责人下没有记录。重置筛选即可查看完整名册。",
      withSearch: (query: string) =>
        `没有找到与「${query}」匹配的记录，换一个名称、公司或邮箱试试。`,
    },
  },

  /* ---------------------------------------------------------- customer page */
  customer: {
    eyebrow: "客户档案",
    windowLabel: "年度合同额",
    notFound: {
      pageTitle: "未找到客户",
      title: "找不到这位客户",
      description: (id: string) =>
        `没有与 id「${id}」匹配的记录。它可能已被移除，或者链接已经过期。`,
      back: "返回客户列表",
      dashboard: "前往总览",
    },
    actions: {
      back: "返回列表",
      openInList: "在列表中查看",
      openAccount: "查看客户档案",
      copyEmail: "复制邮箱",
    },
    sections: {
      account: "客户资料",
      accountDescription: "这条记录的全部档案信息。",
      activities: "活动时间线",
      activitiesDescription: (count: number) => `该客户共记录 ${count} 条活动。`,
      openTasks: "待办任务",
      openTasksDescription: "与这位客户关联的待办。",
      owner: "负责人",
      ownerDescription: "对接的客户经理",
      notes: "内部备注",
      notesDescription: "仅内部可见",
    },
    fields: {
      contact: "主要联系人",
      title: "职位",
      email: "邮箱",
      phone: "电话",
      owner: "负责人",
      since: "合作起始",
      tags: "标签",
      notes: "备注",
      lastTouch: "最近联系",
      created: "创建时间",
    },
    empty: {
      activities: "暂无活动记录",
      activitiesDescription: "与该客户相关的邮件、通话与会议会显示在这里。",
      browseActivities: "查看全部活动",
      tasks: "暂无待办任务",
      tasksDescription: "这位客户当前没有排期中的任务。",
      openBoard: "打开任务看板",
    },
  },

  /* ------------------------------------------------------------------- tasks */
  tasks: {
    hint: "拖动卡片到其他列即可调整顺序，结果会直接写入状态。",
    resetBoard: "重置看板",
    progress: "进度",
    dropHere: "拖放任务到此处",
    columns: {
      "follow-up": { title: "跟进", hint: "等待客户回复" },
      call: { title: "电话沟通", hint: "电话交流" },
      proposal: { title: "发送方案", hint: "报价或合同" },
      demo: { title: "产品演示", hint: "在线演示" },
      onboarding: { title: "交付上线", hint: "启动阶段" },
    } satisfies Record<TaskColumnId, { title: string; hint: string }>,
  },

  /* -------------------------------------------------------------- activities */
  activities: {
    allTypes: "全部类型",
    allOwners: "全部负责人",
    resultCaption: (visible: number, total: number) => `共 ${total} 条记录，显示 ${visible} 条`,
    resetFilters: "重置筛选",
    timelineTitle: "活动时间线",
    timelineDescription: "覆盖全部客户的邮件、通话、会议、备注与状态变更。",
    empty: {
      title: "没有匹配的活动",
      description: "当前类型与负责人组合下没有记录。重置筛选即可查看完整时间线。",
    },
    kinds: {
      email: "邮件",
      call: "通话",
      meeting: "会议",
      note: "备注",
      status: "状态变更",
    } satisfies Record<ActivityKind, string>,
  },

  /* --------------------------------------------------------------- ai brief */
  aiSummary: {
    title: "AI 智能摘要",
    description: "基于这条记录确定性生成，不调用任何外部 API。",
    generate: "生成 AI 摘要",
    regenerate: "重新生成",
    generating: "生成中",
    generatingSr: "正在生成摘要…",
    idleHint: "还没有摘要。根据客户所处阶段、金额与互动历史生成一份简报。",
    recommendedNextStep: "建议的下一步",
    confidence: (value: number) => `置信度 ${value}%`,
    failed: "生成失败，请重试。",
    /** 生成摘要的文案模板——与 lib/ai-summary.ts 的确定性逻辑一一对应。 */
    generated: {
      ageToday: "今天",
      ageYesterday: "昨天",
      ageDays: (days: number) => `${days} 天前`,
      ageLastWeek: "上周",
      ageWeeks: (weeks: number) => `${weeks} 周前`,
      ageMonths: (months: number) => `${months} 个月前`,
      touchJustNow: "刚刚",
      touchToday: "今天",
      touchYesterday: "昨天",

      headlineLead: (company: string, age: string, touch: string) =>
        `${company} 是${age}进入的主动咨询线索，最近一次触达在${touch}。`,
      headlineTrial: (company: string, plan: string, age: string, value: string) =>
        `${company} 正处于${plan}试用期，${age}开始，预估年度合同额 ${value}。`,
      headlineActive: (company: string, plan: string, value: string, touch: string) =>
        `${company} 是健康的${plan}客户，年度合同额 ${value}，最近一次触达在${touch}。`,
      headlineAtRisk: (company: string, value: string, touch: string) =>
        `${company} 存在续约风险：对应 ${value} 的年度合同额，最后一次触达已经是${touch}。`,
      headlineChurned: (company: string, plan: string) =>
        `${company} 已流失，退出${plan}版本，目前不再产生经常性收入。`,

      nextStepLead: (name: string) =>
        `48 小时内与${name}约一次 30 分钟的沟通电话，确认预算归属，避免线索继续降温。`,
      nextStepTrial: (name: string, plan: string) =>
        `在试用窗口关闭前，与${name}的团队安排一次技术验证会，并附上${plan}报价单。`,
      nextStepActive: (name: string) =>
        `与${name}开启一次增购沟通——这位客户已经具备升级到下一档位的条件。`,
      nextStepAtRisk: (name: string) =>
        `升级到高管层面介入，并在本周内与${name}安排一次 20 分钟的客户健康检查。`,
      nextStepChurned: (company: string) =>
        `把${company}加入 FY27 赢回名单，等基础版定价调整落地后重新做一次需求确认。`,

      signalStage: (status: string, plan: string) =>
        `客户生命周期阶段为「${status}」，当前版本为${plan}。`,
      signalValue: (value: string) =>
        `预估年度合同额为 ${value}，在团队在谈名册中处于较前位置。`,
      signalNoValue: "这条记录目前尚未关联任何经常性收入。",
      signalTouchFresh: "24 小时内有过触达，客户热度仍在。",
      signalTouchStale: (days: number, beyond: boolean) =>
        `距离最近一次触达已有 ${days} 天，${beyond ? "已明显超出" : "正在接近"}30 天的跟进阈值。`,
      signalTags: (tags: string) => `记录中的标签：${tags}。`,
      signalNote: (note: string) => `最新备注：${note}`,
    },
  },

  /* ---------------------------------------------------------- command palette */
  palette: {
    title: "命令面板",
    placeholder: "输入命令或搜索…",
    empty: "没有匹配的命令。",
    navigate: "导航",
    actions: "操作",
    goDashboard: "前往总览",
    goCustomers: "前往客户",
    goTasks: "前往任务",
    goActivities: "前往活动",
    addCustomer: "添加客户",
    toggleTheme: "切换主题",
    refresh: "刷新数据",
    simulateError: "模拟接口失败",
    keywords: {
      dashboard: "首页 概览 指标 仪表盘",
      customers: "客户 名册 列表 表格",
      tasks: "任务 看板 拖动",
      activities: "活动 时间线 邮件 通话",
      addCustomer: "新建 客户 添加",
      theme: "深色 浅色 外观 主题",
      refresh: "刷新 重新加载 同步",
      error: "错误 失败 离线",
    },
  },

  /* ---------------------------------------------------------------- dialogs */
  dialogs: {
    addCustomer: {
      title: "添加客户",
      description: "会在本地状态中真实创建一条记录——表格、指标与活动流会立即更新。",
      name: "联系人姓名",
      company: "公司名称",
      email: "邮箱",
      phone: "电话",
      owner: "负责人",
      status: "状态",
      value: "合同金额（元）",
      notes: "备注",
      notesPlaceholder: "补充背景、下一步动作、采购限制等…",
      placeholderName: "陈晨",
      placeholderCompany: "北辰物流",
      placeholderEmail: "chenchen@beichen-logistics.cn",
      placeholderPhone: "+86 138 0013 8462",
      submit: "添加客户",
      created: (company: string) => `已添加「${company}」`,
      validation: {
        name: "请输入联系人姓名。",
        company: "请输入公司名称。",
        email: "请输入有效的邮箱地址。",
        phone: "请输入电话号码。",
        value: "合同金额必须是非负数字。",
      },
    },
    profile: {
      title: "个人资料",
      description: (workspace: string) => `你当前登录的是 ${workspace} 工作区。`,
      email: "邮箱",
      workspace: "工作区",
      role: "角色",
      plan: "版本",
    },
    signOut: {
      title: "确认退出登录？",
      description: (email?: string) =>
        `这是一个纯前端原型，没有真实鉴权。继续会把本地会话${
          email ? `（${email}）` : ""
        }恢复到初始状态——所有客户、任务与筛选都会回到最初的样子。`,
      confirm: "退出登录",
    },
  },

  /* --------------------------------------------------------- notifications */
  notifications: {
    title: "通知",
    empty: "没有新通知了。",
    markAllRead: "全部标为已读",
    unreadCount: (count: number) => `${count} 条未读`,
  },

  /* ----------------------------------------------------- prototype controls */
  prototype: {
    title: "原型状态",
    description: "强制触发加载、错误与重置流程，预览所有状态。",
    simulateSlowLoad: "模拟慢加载",
    simulateFailure: "模拟接口失败",
    resetData: "重置原型数据",
    resetToastTitle: "原型数据已重置",
    resetToastDescription: "所有客户、任务与筛选都已恢复初始状态。",
  },

  /* ----------------------------------------------------------------- toasts */
  toast: {
    refreshed: "数据已刷新",
    refreshFailed: "请求失败",
    refreshFailedDescription: "已切换到错误状态。",
    emailCopied: "邮箱已复制",
    clipboardUnavailable: "无法访问剪贴板",
    clipboardUnavailableDescription: "请授予剪贴板权限后重试。",
    notificationsRead: "已将全部通知标为已读",
    signedOut: "已退出登录",
    signedOutDescription: "本地会话状态已重置。",
  },

  /* ------------------------------------------------------------------- 404 */
  notFound: {
    app: {
      metaTitle: "页面不存在",
      title: "这个页面不存在",
      description: "你访问的地址不属于这个原型，下面都是真实可用的入口。",
      action: "AI CRM 总览",
      backHome: "返回首页",
    },
    crm: {
      metaTitle: "页面不存在",
      title: "找不到这个 CRM 页面",
      description: "这个页面不在原型范围内，选择一个入口继续浏览。",
      action: "返回总览",
    },
  },

  /* ---------------------------------------------------------------- account */
  account: {
    name: "陈美雅",
    initials: "陈",
    email: "meiya.chen@zhixiao.cn",
    role: "高级客户经理",
    workspace: "智销云",
    plan: "成长版（内部）",
  },
}

/** Shape every locale must satisfy. */
export type Messages = typeof zhCN
