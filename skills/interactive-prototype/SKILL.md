---
name: interactive-prototype
description: 在本项目（Prototype Starter，Next.js 16 + shadcn/base-nova + Motion + Zustand）中开发高保真 Interactive Prototype 的标准工作流：Understand → Inspect → Plan → Build → Run → Browser Validate → Fix → Polish → Test。适用于所有交互式原型/演示页开发任务。
---

# Interactive Prototype 开发 Skill

## 目标

把需求变成**真实可交互的高保真原型**——不是静态 mockup，不是假按钮；每个可见控件都作用于真实 local state。

## 前置约束（必须先读）

1. 先读 `AGENTS.md`（含 Next.js 16 的版本注意点）。
2. 只做 Frontend + local state + realistic mock data；**禁止** Database / Auth / Docker / monorepo / backend。
3. 组件库：`components/ui`（shadcn base-nova，**Base UI**：`render` prop 代替 `asChild`）、`components/prototype`、`components/motion`、`components/layout`。
4. 数据：`lib/mock-data.ts` 的 realistic mock data；禁用 lorem ipsum。
5. 视觉：只使用 `app/globals.css` 的 design token 与 `lib/motion-presets.ts` 的时长/缓动。

## 工作流（逐阶段执行，不跳步）

### 1. Understand
- 澄清需求：页面目标、核心用户动作、必须演示的交互点。
- 确认边界：哪些交互是"演示必须真实"的（表单提交、筛选、拖拽、抽屉等）。

### 2. Inspect
- 分析现有 repo：读 `AGENTS.md`，浏览 `components/`、`app/`、`stores/`、`lib/mock-data.ts`。
- 分析页面、状态与交互：画出页面结构 → 列出需要新增的状态与 action（优先并入现有 zustand store）。
- 确定 reusable components：优先复用 `components/prototype`、`components/motion`、`components/layout`、`components/ui`；缺什么再补什么。

### 3. Plan
- 输出简短计划：页面/组件文件清单、store action 清单、复用清单、无重复组件声明。
- 计划经过确认（或至少自查）后再动手。

### 4. Build
- 按计划实现：页面在 `app/<route>/`，可复用业务组件进 `components/prototype/`（或 motion/layout）。
- 所有交互连到真实状态；必须考虑 loading / empty / error 三态；必须 responsive。
- 使用 design token 与 motion presets；禁止 magic number、禁止新造同质组件。

### 5. Run
- `pnpm dev` 启动项目（http://localhost:3000），确认无编译错误。

### 6. Browser Validate
- 用真实浏览器验证（Playwright 或浏览器手工）：逐一点击每个交互控件，检查状态流转、控制台错误。
- 新增关键交互时，在 `tests/demo.spec.ts` 或新增 spec 中补一条端到端测试。

### 7. Fix
- 修复验证中发现的问题（状态、样式、可访问性、移动端）。

### 8. Polish
- 视觉与动效 polish：统一间距/圆角/字号 token；Motion 动画使用 presets；信息层级清晰；空/错/载入态美观。

### 9. Test
- 依次执行并全部通过：
  ```bash
  pnpm lint && pnpm typecheck && pnpm test && pnpm build
  ```
- 有错误自行修复后重跑，直至全绿。

## 完成标准（Definition of Done）

- [ ] 所有可见交互真实可用（无 fake button）
- [ ] loading / empty / error 三种状态齐全且可触发
- [ ] 桌面与移动端均可用
- [ ] 无重复组件、无 magic number、无 lorem ipsum
- [ ] realistic mock data
- [ ] lint / typecheck / test / build 全部通过
- [ ] 核心流程经真实浏览器验证

## 参考文件

- `AGENTS.md` — 项目规则（必读）
- `app/globals.css` — design tokens
- `lib/motion-presets.ts` — motion durations/easings
- `components/prototype/*` — 可复用产品组件
- `stores/dashboard-store.ts` — zustand 模式参考
- `playwright.config.ts` + `tests/demo.spec.ts` — e2e 模式参考
