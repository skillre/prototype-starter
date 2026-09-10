<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Prototype Starter — Agent Instructions

这是一个**长期复用的 AI Agent 驱动 Interactive Prototype Starter**：只做「Frontend + local state + realistic mock data」。

## 项目边界

- ✅ Next.js 16 App Router · TypeScript · Tailwind v4 · pnpm
- ✅ shadcn/ui（**base-nova 风格，基于 Base UI**，而非 Radix）· Motion 13 · Zustand 5 · Recharts 3 · dnd-kit · Playwright
- ❌ 禁止加入 Database / Supabase / Authentication / Docker / Kubernetes / Monorepo / Turborepo / Microservices / Backend service / MCP / Multi-agent orchestration / GitHub Actions / Vercel API & CLI automation / Cloudflare / 任何新的 deployment platform。这些以后再处理。

## 开发原则（必须遵守）

1. **先 inspect，再修改**。动手前先读 `AGENTS.md`、相关组件与数据，配置有疑问时查阅 `node_modules/next/dist/docs/`（Next 16 有 breaking changes，如 `next lint` 已移除、`params` 为 Promise、`middleware` 改名为 `proxy`）。
2. **优先复用现有组件**：`components/ui/`（shadcn primitives）、`components/prototype/`（StatsCard、DataTable、FilterBar、DetailDrawer、CommandPalette、EmptyState、LoadingState、ErrorState、OnboardingWizard、ChartCard）、`components/motion/`（FadeIn、SlideIn、ScaleIn、PageTransition、StaggerContainer、AnimatedNumber）、`components/layout/`（Sidebar、TopNav、MobileNav、PageContainer）。
3. **禁止无意义重复组件**。相似 UI 先考虑扩展现有组件，而不是复制新文件。
4. **所有可见交互必须真实可用**。每个按钮/开关/菜单都连到 state、store 或真实行为；**不允许 fake buttons**、不允许仅视觉装饰。
5. **不制作静态 mockup**。页面必须由真实组件 + 局部状态驱动，数据来自 `lib/mock-data.ts`（realistic mock data，禁止 lorem ipsum）。
6. **shadcn/ui 优先作为 UI primitive**。注意 base-nova 风格 API 与旧版不同：用 `render` prop 而不是 `asChild`；Drawer 用 `swipeDirection`；`Select.Value` 的 children 可以是 `(value) => ReactNode`。
7. **Motion 优先负责交互动画**。时长与缓动只从 `lib/motion-presets.ts` / CSS token 取，禁止硬编码 duration/ease。
8. **使用 realistic mock data**：公司、金额、时间戳都要像真实 SaaS 数据。
9. **重要功能必须浏览器验证**：`pnpm dev` 后走一遍流程，或用 Playwright（`pnpm test`）覆盖（详见下方 Browser QA 规则）。
10. **修改时尽量保持现有 architecture**：app 页面在 `app/`，可复用业务组件按职责放入 `components/*`，状态在 `stores/`，mock 数据在 `lib/mock-data.ts`。
11. **必须考虑 responsive**：桌面（Sidebar + TopNav）与移动（MobileNav + Drawer + 单列 grid）都要可用。
12. **必须实现 loading / empty / error states**，并用全局（LoadingState / ErrorState / EmptyState）组件表达。
13. **完工前执行 `pnpm lint`**。
14. **完工前执行 `pnpm typecheck`**。
15. **完工前执行 `pnpm test`**（Playwright）。
16. **完工前执行 `pnpm build`**。
17. **不要假设代码结构**。任何结论都以实际读到的代码为准；route、组件、store、token 的名与实都以仓库现状为准。
18. **先理解现有架构，修改应尽量局部、可控、可回滚**；不进行没有必要的大规模重构。
19. **不覆盖用户已有修改**。开工前确认工作区状态；发现与任务无关的用户改动时，先停止并报告，绝不擅自覆盖或丢弃。

## Prototype 规则

- 所有可见交互控件**必须真实可用**：连接 state / store / 真实行为；**不允许 fake buttons**，不允许仅视觉装饰。
- **不允许纯静态 mockup 冒充 interactive prototype**：页面必须由真实组件 + 局部状态驱动。
- UI primitive 优先 **shadcn/ui**（base-nova API）；业务组件优先复用 `components/prototype`；动画优先复用 `components/motion`。
- 视觉只使用 `app/globals.css` 的 **design tokens** 与 `lib/motion-presets.ts`；禁止 magic number。
- 数据来自 **realistic mock data**；**不使用 lorem ipsum**。
- 必须考虑 **loading / empty / error** 三态（用全局组件表达）。
- 必须考虑 **responsive**（桌面与移动端都要可用）。
- **重要交互必须经过真实浏览器验证**（见 Browser QA 规则）。

## Browser QA 规则（重要交互必做）

对于重要交互，**不能只通过源码阅读判断**。必须：

1. 启动应用（`pnpm dev`，demo 在 http://localhost:3000/demo）
2. 实际打开浏览器
3. 执行关键用户流程
4. 检查页面结果
5. 检查 console error
6. 必要时截图
7. 发现问题后修复（找到根因、最小范围修复）
8. 修复后重新验证

浏览器验证优先关注：navigation / buttons / forms / tabs / dialogs / drawers / filters / drag and drop / command palette / responsive / loading / empty / error states。

## Quality Gates

任何 Prototype 在「完成」之前必须全部通过：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

任何一项失败：**禁止声称完成**。必须修复后重新执行，直至全部通过。

## Git 工作流与安全

### Git 安全规则（红线）

Agent 默认**禁止**执行：

- `git reset --hard`
- `git clean -fd`
- `git push --force`
- `git push --force-with-lease`
- `git branch -D`
- `git checkout .`
- `git restore .`
- `rm -rf`

除非用户明确要求（force 类操作还需用户确认风险）。对于任何可能覆盖用户修改的命令：**先停止并报告**，不允许擅自覆盖用户工作。

### Branch Strategy

- **`main` 是稳定基线**：只保存稳定、可展示、可部署版本。
- 开发一律在 **`feature/<name>`**：
  - 每个新 Prototype 使用独立 feature branch；**一个 Prototype 对应一个 feature branch**。
  - 不同 Prototype 不混在同一个 feature branch。
  - 不重复使用旧 feature branch 做完全不同的 Prototype。
  - Agent **默认不直接在 `main` 开发**。
- 命名要求：**lowercase、kebab-case、简洁、英文、无空格、无中文**。
- 推荐命名：`feature/ai-crm`、`feature/ai-dashboard`、`feature/analytics`、`feature/workflow`、`feature/mobile-app`。

### 开始新 Prototype 的 Branch 工作流

每次开始新 Prototype：

```bash
git status                 # 确认没有未提交的用户修改
git branch --show-current   # 确认当前位置

git checkout main
git pull --ff-only origin main   # 若有远程仓库

git checkout -b feature/<name>   # 例如 feature/ai-crm

git branch --show-current         # 必须是 feature/<name>
```

**只有确认在 `feature/<name>` 之后才开始开发。** 如果当前已经在其他 feature branch：**不把新 Prototype 混进去，先停止并报告**；不自动删除旧 branch。

### 在 feature branch 上开发

所有新 Prototype 的修改发生在 `feature/<name>`，允许有多个合理 commit。推荐 commit 类型：

`feat:` `fix:` `refactor:` `style:` `test:` `docs:` `chore:`

例如：`feat: add customer detail drawer`、`fix: improve mobile dashboard layout`、`test: add customer workflow coverage`。

禁止无意义的：`update` / `changes` / `work` / `misc` / `final`。

### Commit 规则

commit 之前必须：

1. `git status` → `git diff --stat` → `git diff`，检查：unintended changes、secrets、API keys、`.env`、`node_modules`、`.next`、`test-results`、临时文件、无关改动。
2. 全部通过 `pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build` 以后才能 commit。
3. 尽量使用 `git add <explicit-files>`；不要盲目 `git add -A`，除非已明确确认所有变更都属于当前任务。
4. commit 后再次 `git status` 确认。

### Push 规则

**默认不 push。** 只有以下情况才允许 push：用户明确要求 push、当前任务明确要求 delivery / publish。

push 之前必须 `git branch --show-current` 确认当前**不是 `main`**，然后：

```bash
git push -u origin feature/<name>
```

禁止 `git push --force` / `git push --force-with-lease`，除非用户明确要求并确认风险。

### Merge 规则

`main` 表示稳定版本。标准流程：

```
feature branch → development → browser QA → Playwright
→ lint/typecheck/build → commit → push → Vercel Preview
→ 人工确认 → merge into main
```

Agent 默认**禁止自动 merge**；默认禁止 push main、合并 main、删除 feature branch。只有用户明确要求时才执行 merge。发生 merge conflict：**停止并报告**，不擅自进行高风险 conflict resolution。

## 设计 Token

一切视觉常量来自 `app/globals.css` 的 design token 层（typography `text-display/title/subtitle/caption/label`、semantic spacing `p-gutter/gap-stack/mt-section`、radius `rounded-field/rounded-card`、motion `duration-*`/`ease-*`、内容宽度 `max-w-dashboard/content/text`）。禁止在页面里撒 magic number。

## Zustand 约定

- selector 只取**原始值**（如 `customers` 数组本身），派生（filter/sort/计数）在组件内用 `useMemo`。**禁止在 selector 里返回新数组/新对象**（zustand v5 会无限渲染）。
- 参考 `stores/dashboard-store.ts` 的 `selectFilteredCustomers` 纯函数。

## 常用命令

```bash
pnpm dev          # http://localhost:3000 ，demo 在 /demo
pnpm lint         # ESLint
pnpm typecheck    # next typegen + tsc --noEmit
pnpm test         # Playwright E2E（自动启动 dev server，需先 pnpm exec playwright install chromium）
pnpm check        # lint + typecheck + test
pnpm build        # production build（Turbopack）
```

- 开发高保真交互原型时，请同时加载 `skills/interactive-prototype/SKILL.md` 的完整工作流。
- 完成原型、准备交付时，请加载 `skills/git-delivery/SKILL.md` 的 Git 交付工作流。