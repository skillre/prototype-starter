# Prototype Starter — Prototype Factory

An agent-friendly foundation for building **high-fidelity interactive prototypes**:
Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui (Base UI) + Motion + Zustand —
frontend only, local state, realistic mock data. No database, no auth, no backend service.

It is a **Factory**: it defines *how a prototype is produced*. It deliberately does **not**
define what a prototype looks like — that belongs to **Prototype Kits**, chosen per product
through a Visual Manifest.

## Quick start

```bash
pnpm install
pnpm exec playwright install chromium   # first e2e / QA run only

pnpm dev          # http://localhost:3000 — neutral demo at /demo
pnpm check        # lint + typecheck + test + build + qa
pnpm build        # production build (Turbopack)
```

## What changed in v1.1

v1.0.0 worked, but it had one systemic flaw: **product identity lived in shared defaults.**

- `components/layout/sidebar.tsx` fell back to one product's nav, brand, user, and a literal
  `progress: 64`.
- `components/layout/top-nav.tsx` imported `@/stores/dashboard-store` as its default data
  source and fell back to another product's account (`陈美雅 / meiya.chen@zhiwu.cn`) — so the
  neutral `/demo` page displayed the CRM's account identity.
- `AGENTS.md` and this README documented one product's art direction — "Design System V4 —
  AI Sales Command Center" — as if it were the Factory's own rule.
- Playwright ran on port 3000 with `reuseExistingServer` on, which adopts *any* server that
  answers the readiness URL while performing **no identity check**.
- There was no accessibility check, no overflow check, and no guard against a probe that
  measured nothing and passed anyway.

v1.1 removes the defaults, adds the missing gates, and backports the mechanisms that two rounds
of real production use (AI CRM, AI Finance) and Prototype Kits v0.1.1 proved out.

The full audit is in `docs/factory-audit-v1.1.md`.

## What changed in v1.2

v1.2 turns six things that used to be judgement calls into contracts, and adds the layer that was
missing entirely: what happens **after** the Preview.

| Capability | Gate | Contract |
|---|---|---|
| Deployment authorization | `pnpm factory:deploy` | `docs/vercel-bootstrap.md` §0 |
| Kits seam (managed / adapters / Product) | `pnpm factory:manifest --kits …` | `docs/kits-ownership.md` |
| Generic style-presence QA | `pnpm qa` | `docs/browser-qa.md` §7 |
| Art Direction decisions (deviations, signature budget, motion cross-check) | `pnpm factory:manifest` | `docs/visual-manifest.md` |
| Core Neutrality (personality is an explicit opt-in) | `pnpm qa` + contract tests | `AGENTS.md` §Core Neutrality |
| Product Semantic Contract (declared ↔ enforced) | `pnpm factory:contract` | `docs/prototype-creation-workflow.md` §4 |
| Initialization Boundary (baseline vs product) | `pnpm factory:init` | `docs/product-initialization.md` |
| Remote Online QA (the deployment, not the dev server) | `pnpm qa:online` | `docs/browser-qa.md` §8 |
| Release: RC → HVA → Source → Production → tag | — (a person decides) | `docs/release-runbook.md` |

Two of these are deliberately *not* automatable: **Human Visual Acceptance** and the **Art
Direction checkpoint** are human decisions, and the release contract refuses to invent a state
that skips them.

### Shared components now require injection

`Sidebar` / `MobileNav` take `brand`, `items`, `user` as **required** props. `TopNav` takes a
**required** `dataSource`. There is no fallback, because a fallback is a Factory opinion about
what the product is called.

```tsx
<Sidebar
  active={activeTab}
  onNavigate={navigate}
  items={navItems}   // required — the product's navigation
  brand={brand}      // required — the product's identity
  user={account}     // required — the product's account
  usage={usage}
/>
```

The Factory's own neutral demo does exactly this (`app/demo/_components/demo-app.tsx`) — the
same thing an AI CRM or an AI Finance must do. `components/**` may not import a store, product
data, or a product route; a contract test enforces it.

## The production flow

```
Understand → Inspect → Product Model → Visual Direction → Visual Manifest
→ 【human / explicit Art Direction checkpoint】
→ kits add → Build → Invariant tests → Browser QA → Test → Preview
→ Online QA (same RC SHA) → 【Human Visual Acceptance】
→ source release (ff-only → main) → Production (SHA == RC) → annotated tag → housekeeping
```

Full detail: `docs/prototype-creation-workflow.md`; the release half is `docs/release-runbook.md`
(a release candidate is a **SHA**, and no machine may declare the human step done).

### Visual Manifest — the Art Direction Gate

No business prototype may start UI work without one. The Factory owns the *contract* (field set,
shape, non-vacuity rules, registry cross-check); Prototype Kits owns the *creative semantics*
(which pack fits, how many signature components, what `avoid` should say).

```json
{
  "productType": "ai-finance-console",
  "firstVisual": "深色空间里从左上打下来的环境光，标题浮在光里，下方一条发光曲线",
  "stylePack": "cinematic",
  "signatureComponents": ["interactive-hero", "data-cursor"],
  "effects": ["ambient-glow"],
  "motionDirection": "atmospheric",
  "density": "medium",
  "avoid": ["generic-ai-dashboard", "card-everywhere", "animation-everywhere"]
}
```

`firstVisual` and `avoid` are **hard constraints**: an impression-only `firstVisual`
(「现代简洁」) and an empty `avoid` are both validation errors.

The schema enumerates **no asset ids** — legal values are read from the Kits registry at
verification time. A contract test asserts Factory Core source never names a specific Style
Pack, so adding a pack to Kits requires **zero** Factory changes.

See `docs/visual-manifest.md`.

### Kits Source Installation

```bash
pnpm factory:manifest          # validate the manifest (+ upstream cross-check)
pnpm factory:kits              # dry-run: show the plan
pnpm factory:kits --write      # install → verify lock → run doctor
pnpm qa:doctor                 # doctor gate
```

The Factory **calls** the Kits CLI; it does not reimplement it. Ownership is a file-system fact,
not a convention:

| Path | Owner |
|---|---|
| `lib/kits/installed/` | **Kits-managed** — overwritten on reinstall; never hand-edit |
| `lib/kits/.kits/` | **Kits-managed** tooling |
| `lib/kits/kits.lock.json` | **Kits-managed** state — the only evidence of install state |
| `lib/kits/adapters/` | **Product-owned** — Kits never overwrites |

Product code must go `Product → adapters → installed`.

When the Kits checkout is absent, the doctor reports `[upstream-unavailable]` and says in as many
words that **no upstream comparison was performed**. A standalone product is a normal state;
claiming a check you did not run is not.

See `docs/kits-ownership.md`.

## Browser QA

```bash
pnpm qa                    # every discovered route × 2 viewports × 2 themes + capability probes
pnpm qa --routes=/demo
pnpm qa:online --base-url=https://<deployment> --identity=<deployment.json> --expect-sha=<rc-sha>
```

The two entries share **one** sweep (`.qa/sweep.mjs`): same probes, same thresholds, same
style-presence channels. They differ in one variable — the origin. `pnpm qa` starts and stops its
own dev server; `pnpm qa:online` sweeps a URL this run does not own and is an **observer**: it
never starts a server, never deploys, never creates a bypass token, and never prints a secret. A
protected URL is reported as protected — not as a deployment failure, and not as public.

Routes, viewports, themes and tolerances live in `.qa/qa.config.mjs` — the sweep knows no route
names and discovers them from `app/`.

Target state:

```
0 console error · 0 page error · 0 request failure · 0 horizontal overflow · 0 viewport expansion
```

### The checks that exist because of a real regression

- **Three mobile criteria, never one.** `scrollWidth - innerWidth` alone reports a false green:
  Chromium silently widens the *layout* viewport to fit overflowing content, so both values grow
  together and the difference stays ~0 while the page is laid out for a screen the user does not
  have. QA also asserts the requested width was honoured, and that `scrollTo(9999, 0)` leaves
  `scrollX ≈ 0`.
- **No Invisible Semantics.** Being visible is not the same as being *in the accessibility tree*.
  For `button` / `link` / `heading`, the count of semantics-contributing DOM elements must equal
  the count of that role in the browser's real accessibility tree (read over CDP, since
  `page.accessibility` was removed in Playwright 1.63). An `aria-hidden` ancestor holding real
  interactive content is a failure.
- **Probe integrity.** Every numeric probe goes through `measure()`, which fails loudly on
  `NaN` / `Infinity` / a non-number / an unexplained `0`. The bug it prevents:
  `Math.abs(NaN - expected) > tolerance` is `false`, so a probe that measured **nothing** used to
  report success.
- **Reduced motion, coarse pointer, observer failure.** Content must be visible without hover,
  without animation, and even when the `IntersectionObserver` that was supposed to reveal it
  never fires.
- **Port isolation.** A dedicated port, `reuseExistingServer: false` unconditionally, a pre-flight
  guard that names the process holding the port, and process-group teardown so only the server
  this run started is ever stopped.

Full rationale, including the browser behaviours that a probe must model correctly: `docs/browser-qa.md`.

## Kits-agnostic by construction

The Factory does not know any Style Pack, Signature Component or Effect. That is enforced, not
just intended: a contract test scans `lib/`, `components/`, `app/`, `scripts/`, `hooks/` and
`stores/` for every known Kits asset id and fails if one appears.

## What's in the box

| Area | Contents |
|---|---|
| **Design tokens** | one layer in `app/globals.css` + a JS mirror in `lib/motion-presets.ts`. A neutral fallback — a Style Pack may override it |
| **UI primitives** | `components/ui/*` (shadcn "base-nova", built on **Base UI** — use the `render` prop, not `asChild`) |
| **Product components** | `components/prototype/*` (OpenSection, SectionHeading, MetricStrip, DataTable, FilterBar, DetailDrawer, CommandPalette, EmptyState, LoadingState, ErrorState, OnboardingWizard, StatsCard, ChartCard, AmbientBackdrop) |
| **Motion** | `components/motion/*` (FadeIn, SlideIn, ScaleIn, PageTransition, StaggerContainer, AnimatedNumber) |
| **Layout** | `components/layout/*` (Sidebar, TopNav, MobileNav, PageContainer) — all injection-required |
| **i18n** | `lib/i18n/*` + `components/i18n/*`; every user-visible string resolves through the dictionary |
| **Contract** | `lib/visual-manifest.ts` + `.schema.json`, `lib/product-contract.schema.json`, `lib/init-contract.schema.json`, `product-contract.json`, `init-contract.json` |
| **Tooling** | `scripts/install-kits.mjs`, `scripts/validate-manifest.mjs`, `scripts/doctor-gate.mjs`, `scripts/check-qa-port.mjs`, `scripts/verify-deployment.mjs`, `scripts/verify-product-contract.mjs`, `scripts/verify-init.mjs`, `.qa/*` |
| **Docs** | `docs/visual-manifest.md`, `docs/kits-ownership.md`, `docs/browser-qa.md`, `docs/prototype-creation-workflow.md`, `docs/vercel-bootstrap.md`, `docs/release-runbook.md`, `docs/product-initialization.md`, `docs/factory-audit-v1.1.md` |
| **Skills** | `skills/interactive-prototype/SKILL.md`, `skills/git-delivery/SKILL.md` |

### Still in the repo: the reference product

`app/crm/**` is the **AI CRM** reference prototype, built with the pre-v1.1 flow. It stays working
and is still covered by tests, but it has been demoted out of Factory Core: v1.1's rules no longer
describe it, and it is no longer the definition of the Factory's visual direction. Treat it as a
sample, not as a template.

The neutral demo is `/demo` — non-CRM, non-Finance, no Style Pack.

v1.2 makes that boundary machine-readable. Three layers, three dispositions — `pnpm factory:init`
enforces them, and `docs/product-initialization.md` is the checklist a person follows:

| Layer | Paths | When deriving a product |
|---|---|---|
| **Factory Core** | `components/**` `lib/**` `scripts/**` `.qa/**` `hooks/**` `stores/**` `skills/**` | copy as-is |
| **Reference Sample** | `app/crm/**` `app/demo/**` `app/_sample/**` `app/sample-command-center.css` | reference; delete by default — keeping it requires an explicit sample label |
| **Initialization Surface** | `package.json` `README.md` `app/layout.tsx` `app/page.tsx` `app/not-found.tsx` `lib/i18n/zh-CN.ts` | rewrite |

## Structure

```
app/                     # routes: / (landing), /demo (neutral demo), /crm (reference product)
components/
  ui/                    # shadcn/ui primitives (Base UI "base-nova")
  prototype/             # reusable product components — injection-required
  motion/                # Motion-based animation components
  layout/                # Sidebar, TopNav, MobileNav, PageContainer
  i18n/                  # LocaleProvider, useMessages()
hooks/                   # useMediaQuery, useDebouncedValue, useHotkey
lib/
  i18n/                  # dictionaries (zh-CN) + locale registry
  visual-manifest.ts     # the Art Direction contract
  motion-presets.ts      # JS mirror of the motion tokens
stores/                  # Zustand stores (demo + reference product)
tests/                   # Playwright e2e + Factory contract tests
.qa/                     # Browser QA sweep, config, probes, probe guard
scripts/                 # Kits manifest / install / doctor / port guard
docs/                    # the contracts, in prose
skills/                  # agent skills (interactive-prototype, git-delivery)
```

## Commands

```bash
pnpm dev               # http://localhost:3000
pnpm lint              # ESLint
pnpm typecheck         # next typegen + tsc --noEmit
pnpm test              # Playwright (port guard + self-managed server)
pnpm build             # production build (Turbopack)
pnpm qa                # Browser QA sweep (starts its own server, port 3200)
pnpm qa:online         # Online QA against a URL this run does not own
pnpm check             # all five, in order

pnpm factory:manifest  # validate visual-manifest.json
pnpm factory:kits      # install Kits assets from the manifest (dry-run by default)
pnpm factory:deploy    # deployment authorization + identity (actions / preflight / verify / access)
pnpm factory:contract  # product semantic invariants: declared ↔ enforced
pnpm factory:init      # initialization boundary: baseline / product, residual identity
pnpm qa:doctor         # Kits doctor gate
```

> `pnpm test` and `pnpm qa` cannot run at the same time: Next 16's dev server takes a
> **per-project** lock (`.next/dev/lock`), not a per-port one.

## Stack notes

- **shadcn/ui "base-nova"** is built on **Base UI**, not Radix — use `render` instead of `asChild`,
  `swipeDirection` on Drawer, `(value) => …` children on `Select.Value`.
- **Next.js 16** has breaking changes; read `node_modules/next/dist/docs/` when in doubt
  (`next lint` is gone, `params` is async, Turbopack is the default bundler).
- **Zustand**: selectors must return stable references — derive with `useMemo` in components, never
  create arrays/objects inside selectors.

## Git workflow

```
main → feature/<name> → development → QA → commit → push → Vercel Preview
     → online QA → human review → ff-only merge main → Production → annotated tag (target == RC)
```

`main` is the stable baseline; agents never develop on it and never merge to it by default. Git
safety rules live in `AGENTS.md`; the delivery checklist is in `skills/git-delivery/SKILL.md`;
Vercel setup is in `docs/vercel-bootstrap.md`; the release half — including the STOP before
pushing a Production Branch — is in `docs/release-runbook.md`.
