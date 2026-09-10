# Prototype Starter

A reusable, agent-friendly foundation for building **high-fidelity interactive prototypes**:
Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Motion + Zustand —
frontend only, local state, realistic mock data. No database, no auth, no backend service.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000 — demo dashboard at /demo
pnpm check        # lint + typecheck + Playwright e2e
pnpm build        # production build (Turbopack)
```

First e2e run needs browsers once: `pnpm exec playwright install chromium`.

## Why this starter

- **Real interactions, no mockups.** Every visible control in `/demo` works against local
  state: filters, drag-and-drop ordering, add-customer dialog, detail drawer, command
  palette (⌘K), onboarding wizard, theme toggle, loading/empty/error states.
- **Design tokens.** Typography, spacing, radius semantics, motion durations/easings and
  content widths live in one layer (`app/globals.css`) with a JS mirror
  (`lib/motion-presets.ts`) — no magic numbers.
- **Reusable component library.** Generic building blocks you copy into new prototypes:
  `components/prototype/*` (StatsCard, ChartCard, DataTable, FilterBar, DetailDrawer,
  CommandPalette, EmptyState, LoadingState, ErrorState, OnboardingWizard),
  `components/motion/*` (FadeIn, SlideIn, ScaleIn, PageTransition, StaggerContainer,
  AnimatedNumber), `components/layout/*` (Sidebar, TopNav, MobileNav, PageContainer).
- **Agent-first.** `AGENTS.md` pins development rules (inspect first, reuse components,
  real interactions only, browser QA, quality gates, git safety & branch strategy).
  `skills/interactive-prototype/SKILL.md` defines the full build workflow
  (Understand → Inspect → Plan → Build → Run → Browser Validate → Fix → Polish → Test)
  and `skills/git-delivery/SKILL.md` defines the delivery workflow
  (Inspect → Branch Check → Diff Review → Quality Gates → Commit → Push → Preview).
- **Verified.** 10 Playwright e2e flows cover page load, dialog, drawer, tabs, filtering,
  command palette, add-customer, detail drawer, drag-and-drop and a mobile smoke test.

## Structure

```
app/                     # routes: / (landing), /demo (SaaS dashboard demo)
components/
  ui/                    # shadcn/ui primitives (Base UI "base-nova" style)
  prototype/             # reusable product components
  motion/                # Motion-based animation components
  layout/                # Sidebar, TopNav, MobileNav, PageContainer
hooks/                   # useMediaQuery, useDebouncedValue, useHotkey
lib/                     # utils, mock data, formatters, motion presets
stores/                  # Zustand store (dashboard demo)
tests/                   # Playwright e2e specs
skills/
  interactive-prototype/ # agent skill: build + browser QA workflow
  git-delivery/          # agent skill: git delivery workflow
```

## Stack notes

- **shadcn/ui "base-nova"** is built on **Base UI**, not Radix — use the `render` prop
  instead of `asChild`, `swipeDirection` on Drawer, `(value) => …` children on `Select.Value`.
- **Next.js 16** has breaking changes; read `node_modules/next/dist/docs/` when in doubt
  (`next lint` is gone, `params` is async, Turbopack is the default bundler).
- **Zustand**: selectors must return stable references — derive with `useMemo` in
  components, never create arrays/objects inside selectors.

## Agent Development Workflow

The standard loop every prototype goes through (see `skills/interactive-prototype/SKILL.md`):

```
Understand → Inspect → Plan → Build → Run → Browser Validate → Fix → Polish → Test → Git Delivery
```

After Build, keep the **Browser QA Loop** running until it converges:

```
Implement → Run → Browser → Interact → Inspect → Detect → Fix → Browser again → Test
```

Important interactions are validated in a real browser — execute the key user flows,
inspect the results and console errors, screenshot when needed — not only by reading code.

## Git Branch Workflow

```
main → feature/<name> → development → QA → commit → push → Vercel Preview → human review → merge main
```

- `main` = the stable, demoable, deployable baseline
- `feature/*` = prototype development — **one prototype per feature branch**
- Agents never develop directly on `main` and never merge to `main` by default
- Full git safety rules (blacklisted commands, commit/push/merge rules) live in `AGENTS.md`;
  the delivery checklist lives in `skills/git-delivery/SKILL.md`

## Example

Creating an "AI CRM" prototype:

```bash
git status                     # confirm no uncommitted user changes
git checkout main
git pull --ff-only origin main
git checkout -b feature/ai-crm
git branch --show-current      # must be feature/ai-crm
```

After development:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Then:

```bash
git status
git diff --stat
git diff
git add <explicit-files>
git commit -m "feat: add ai crm prototype"
git push -u origin feature/ai-crm
```

Then: GitHub → Vercel → Preview URL. After human confirmation of the preview, consider
merging `feature/ai-crm` into `main` — only when the user explicitly asks.

## New Prototype Standard Flow

1. Update `main`
2. Create the feature branch
3. Understand the requirement
4. Inspect
5. Plan
6. Build
7. Run
8. Browser QA
9. Fix
10. Polish
11. Playwright
12. `pnpm lint`
13. `pnpm typecheck`
14. `pnpm build`
15. Diff review
16. Commit
17. Push
18. Vercel Preview
19. Human confirmation
20. Merge into `main` (only when the user asks)