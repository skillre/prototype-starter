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

- **Real interactions, no mockups.** Every visible control works against local state:
  filters, drag-and-drop ordering, add-customer dialog, detail drawer, command palette
  (⌘K), sign-out, theme toggle, loading/empty/error states.
- **Design System V2.** A complete token hierarchy in one layer (`app/globals.css`) with a
  JS mirror (`lib/motion-presets.ts`) — Light and Dark, semantic colour roles, type scale,
  radius & elevation semantics, and intent-named motion. See below.
- **Chinese-first localization.** Every user-visible string in `app/**` and `components/**`
  resolves through `lib/i18n` — landing page, demo dashboard, CRM and 404s alike.
  No scattered copy; adding a locale is one file.
- **Reusable component library.** Generic building blocks you copy into new prototypes:
  `components/prototype/*` (StatsCard, ChartCard, DataTable, FilterBar, DetailDrawer,
  CommandPalette, EmptyState, LoadingState, ErrorState, OnboardingWizard, AmbientBackdrop),
  `components/motion/*` (FadeIn, SlideIn, ScaleIn, PageTransition, StaggerContainer,
  AnimatedNumber), `components/layout/*` (Sidebar, TopNav, MobileNav, PageContainer).
- **Agent-first.** `AGENTS.md` pins development rules (inspect first, reuse components,
  real interactions only, browser QA, quality gates, git safety & branch strategy).
  `skills/interactive-prototype/SKILL.md` defines the full build workflow
  and `skills/git-delivery/SKILL.md` defines the delivery workflow.
- **Verified.** 59 Playwright e2e flows cover routing integrity, navigation, forms,
  drawers, drag-and-drop, the command palette, English-leakage auditing, theme tokens and
  mobile viewports.

## Design System V2

Premium interactive SaaS: depth through layering, not effects.

### Tokens (`app/globals.css`)

| Group | Tokens |
| --- | --- |
| Colour roles | `background` · `surface` · `elevated` · `interactive` · `foreground` · `muted` · `border` · `accent` · `accent-soft` · `brand` · `success` · `warning` · `danger` · `info` (each with a `-soft` where it matters) |
| Typography | `text-display` · `text-title` · `text-heading` · `text-subtitle` · `text-body` · `text-body-sm` · `text-caption` · `text-label` · `text-numeric` + the `.numeric` utility (tabular figures) |
| Radius | `rounded-field` (controls) · `rounded-card` · `rounded-panel` · `rounded-floating` |
| Elevation | `shadow-subtle` · `shadow-card` · `shadow-elevated` · `shadow-floating` — Light and Dark differ |
| Motion | `duration-instant/fast/normal/slow/glacial` + `duration-press/hover/enter/exit/modal/drawer/list/page`; `ease-standard/out-expo/out-back/spring/emphasized` |
| Ambient | `ambient-grid` · `ambient-wash` · `surface-sheen` · `kbd-chip` utilities |

Rules: never hardcode a colour, duration or easing outside the token layer; pick motion by
**intent** (`motion.enter`, `motion.press`) rather than by feel.

### Themes

- **Light** — premium clean SaaS: cool near-white canvas, white surfaces, soft elevations.
- **Dark** — premium immersive SaaS: layered charcoal (never pure black), inset hairlines,
  brand-tinted accents and a controlled ambient wash in the brand-blue family.
- The brand is deep azure — deliberately not the "AI purple" template look.

### Ambient layer

`components/prototype/ambient-backdrop.tsx` is the only place that adds decoration. It is
used on the page background, the dashboard hero, chart surfaces and the command palette —
always `pointer-events-none` and always behind content.

### i18n (`lib/i18n/`)

```ts
// lib/i18n/zh-CN.ts   — the reference dictionary (source of truth for the shape)
// lib/i18n/index.ts   — locale registry, `getMessages`, `messages` (non-hook accessor)
// components/i18n/    — <LocaleProvider>, useMessages(), useLocale()
```

```tsx
const t = useMessages()
return <h1>{t.page.dashboard.title}</h1>
```

Adding `en-US`: create `lib/i18n/en-US.ts` typed as `Messages`, append `"en-US"` to
`LOCALES` and the dictionary map. No component changes.

**Dictionary = interface copy.** Record content (customer names, notes, amounts) lives in
`lib/crm-data.ts` / `lib/mock-data.ts` and is intentionally *not* translated. Route slugs
stay English.

`tests/support/localization.ts` holds the single allow-list for Latin text (brand names,
URLs, emails, tech-stack names, keyboard shortcuts) and the visible-text scanner; the
specs assert **zero** non-allow-listed English on `/`, `/demo` and every `/crm` route,
including dialogs, drawers, menus and the command palette.

## Structure

```
app/                     # routes: / (landing), /demo (demo dashboard), /crm (AI CRM)
  crm/                   #   /crm · /crm/customers · /crm/customers/[id] · /crm/tasks · /crm/activities
components/
  ui/                    # shadcn/ui primitives (Base UI "base-nova" style)
  prototype/             # reusable product components
  motion/                # Motion-based animation components
  layout/                # Sidebar, TopNav, MobileNav, PageContainer
  i18n/                  # LocaleProvider, useMessages()
hooks/                   # useMediaQuery, useDebouncedValue, useHotkey
lib/
  i18n/                  # dictionaries (zh-CN) + locale registry
  crm-data.ts            # AI CRM mock records (Chinese business data)
  mock-data.ts           # demo workspace mock records (Chinese business data)
  format.ts              # money / number / date formatting + personInitials
  motion-presets.ts      # JS mirror of the motion tokens
stores/                  # Zustand stores (dashboard demo + CRM)
tests/                   # Playwright e2e specs
  support/               # shared test helpers (English allow-list + text scanner)
skills/                  # agent skills (interactive-prototype, git-delivery)
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