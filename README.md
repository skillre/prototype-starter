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
  real interactions only, lint/typecheck/test/build before done) and
  `skills/interactive-prototype/SKILL.md` defines the full build workflow
  (Understand → Inspect → Plan → Build → Run → Browser Validate → Fix → Polish → Test).
- **Verified.** 5 Playwright e2e flows cover page load, dialog, drawer, tabs and filtering.

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
skills/interactive-prototype/  # agent skill
```

## Stack notes

- **shadcn/ui "base-nova"** is built on **Base UI**, not Radix — use the `render` prop
  instead of `asChild`, `swipeDirection` on Drawer, `(value) => …` children on `Select.Value`.
- **Next.js 16** has breaking changes; read `node_modules/next/dist/docs/` when in doubt
  (`next lint` is gone, `params` is async, Turbopack is the default bundler).
- **Zustand**: selectors must return stable references — derive with `useMemo` in
  components, never create arrays/objects inside selectors.
