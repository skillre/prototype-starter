import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

import {
  STYLE_PRESENCE_PROBE,
  UA_BASELINE_DOCUMENT,
  compareStylePresence,
} from "../.qa/style-presence.mjs"
import { walkScoped } from "../scripts/lib/kits-seam.mjs"

/**
 * Core neutrality (Factory v1.2 · N1 = F3 + F4).
 *
 * The claim being tested is not "the Reference Sample got prettier or plainer".
 * It is narrower and checkable:
 *
 *   **A route that opts into nothing must not inherit Art Direction personality.**
 *
 * Two halves, because either alone can be satisfied dishonestly:
 *
 *   static   — where the personality lives, and that the Core primitives that
 *              consume it all have a neutral default;
 *   runtime  — what a neutral surface and a sample surface actually compute.
 *
 * The runtime half also re-asserts the Phase A style-presence gate on both, so
 * "neutral" can never be achieved by deleting the stylesheet.
 */

const ROOT = process.cwd()
const read = (path: string) => readFileSync(join(ROOT, path), "utf8")

/** Everything that reads as lighting / glow / halo rather than as structure. */
const PERSONALITY_PATTERN =
  /--ambient-|--hero-|--chart-glow|\bambient-wash\b|\bambient-grid\b|\bhero-wash\b|\bsurface-sheen\b|\bchart-glow\b|\blive-halo\b/

/**
 * Core files that name a personality token directly, and the gate each must
 * keep. A file that is not here may not mention one at all; a file that is here
 * must still contain the opt-in test named below.
 *
 * This is "no new glow defaults" (N1 · AC 9) as data: adding a reference without
 * declaring its opt-in fails, and so does removing the default that makes the
 * opt-in meaningful.
 */
const GATED_PERSONALITY_CONSUMERS: Record<string, string[]> = {
  "components/layout/sidebar.tsx": ["brand.sheen ?", "status.pulse ?"],
  "components/prototype/ai-summary-panel.tsx": ["glow = false"],
  "components/prototype/open-section.tsx": ['ambient = "none"'],
  // The capability itself. It paints nothing unless a caller asks, so the
  // neutrality rule lands on its callers — see CAPABILITY_DEFAULTS.
  "components/prototype/ambient-backdrop.tsx": ["export function AmbientBackdrop"],
}

/**
 * Core components that consume the personality layer **indirectly**, through the
 * capability component, and the neutral default each must keep.
 *
 * These two are why "the capability stays, the default changes" is the right
 * fix: the shell keeps the ability to be lit, and stops lighting itself.
 */
const CAPABILITY_DEFAULTS: Record<string, string> = {
  "components/layout/page-container.tsx": "ambient = false",
  "components/prototype/command-palette.tsx": "ambient = false",
}

/* -------------------------------------------------------------------------- */
/* static — where the personality lives                                        */
/* -------------------------------------------------------------------------- */

test.describe("the neutral layer", () => {
  test("globals.css carries no ambient / hero / glow token or utility", () => {
    const css = read("app/globals.css")
    for (const needle of [
      "--ambient-",
      "--hero-",
      "--chart-glow",
      "ambient-wash",
      "ambient-grid",
      "hero-wash",
      "surface-sheen",
      "chart-glow",
      "live-halo",
      "ambient-drift",
    ]) {
      expect(css, `中性层不得出现 ${needle}`).not.toContain(needle)
    }
  })

  test("the personality still exists — it moved, it was not deleted", () => {
    const sample = read("app/sample-command-center.css")
    for (const needle of [
      "--ambient-brand",
      "--hero-base",
      "--chart-glow",
      ".ambient-wash",
      ".ambient-grid",
      ".hero-wash",
      ".surface-sheen",
      ".chart-glow",
      "@keyframes live-halo",
    ]) {
      expect(sample, `Reference Sample 的性格层必须包含 ${needle}`).toContain(needle)
    }
    // And it is opt-in by import — the mechanism, stated in the file itself.
    expect(sample).toContain("Personality must be explicit")
  })

  test("only the sample imports the sample layer", () => {
    const { files } = walkScoped(ROOT, { roots: ["app", "components"], excludeTrees: [] })
    // An *import*, not a mention: `globals.css` points at the file in prose
    // where the layer used to be, and prose is not a dependency.
    const IMPORT_RE = /^\s*import\s+["'][^"']*sample-command-center\.css["']/m
    const importers = files.filter((file) => IMPORT_RE.test(read(file)))
    // Exactly the three Reference Sample entry points. A fourth importer means
    // the personality is leaking back into a surface nobody decided about.
    expect(new Set(importers)).toEqual(
      new Set([
        "app/page.tsx",
        "app/demo/_components/demo-app.tsx",
        "app/crm/_components/crm-shell.tsx",
      ]),
    )
  })

  test("every Core consumer of personality is gated, and keeps its neutral default", () => {
    const { files } = walkScoped(ROOT, { roots: ["components"], excludeTrees: [] })
    const offenders: string[] = []

    for (const file of files) {
      if (!PERSONALITY_PATTERN.test(read(file))) continue
      const gates = GATED_PERSONALITY_CONSUMERS[file]
      if (!gates) {
        offenders.push(`${file} — 未声明 gate`)
        continue
      }
      const source = read(file)
      for (const gate of gates) {
        if (!source.includes(gate)) offenders.push(`${file} — 缺少 gate: ${gate}`)
      }
    }

    expect(
      offenders,
      "共享组件要消费性格就必须显式 opt-in（默认关闭）。新增引用请同时更新 GATED_PERSONALITY_CONSUMERS。",
    ).toEqual([])
  })

  test("the declared gate list has no stale entries", () => {
    for (const file of Object.keys(GATED_PERSONALITY_CONSUMERS)) {
      expect(PERSONALITY_PATTERN.test(read(file)), `${file} 已不再消费性格，请从清单里移除`).toBe(true)
    }
  })

  test("the capability keeps its neutral default", () => {
    // "The ability stays, the default changes." Both halves are asserted: the
    // opt-in must exist AND must default to off.
    for (const [file, gate] of Object.entries(CAPABILITY_DEFAULTS)) {
      const source = read(file)
      expect(source, `${file} 必须保留中性默认：${gate}`).toContain(gate)
      expect(source, `${file} 必须仍然具备这个能力`).toContain("AmbientBackdrop")
    }
  })

  test("the neutral shell is still a designed shell", () => {
    // Neutral is not "empty". These must NOT have been removed along with the
    // personality: structure, type, surfaces, focus, rules.
    const css = read("app/globals.css")
    for (const needle of [
      "--background",
      "--foreground",
      "--surface",
      "--muted-foreground",
      "--border",
      "--hairline",
      "--ring",
      "--radius",
      "font-sans",
      "@utility section-tick",
      "@utility kbd-chip",
    ]) {
      expect(css, `中性层必须保留 ${needle}`).toContain(needle)
    }
  })
})

/* -------------------------------------------------------------------------- */
/* runtime — what a neutral surface computes                                   */
/* -------------------------------------------------------------------------- */

const NEUTRAL_ROUTE = "/this-route-does-not-exist"

const TOKEN_PROBE = `(() => {
  const root = getComputedStyle(document.documentElement)
  const read = (name) => root.getPropertyValue(name).trim()
  const personality = [
    "--ambient-brand",
    "--ambient-warm",
    "--ambient-hero-brand",
    "--ambient-grid",
    "--ambient-ring",
    "--hero-base",
    "--chart-glow",
  ]
  return {
    personalityDeclared: personality.filter((name) => read(name) !== ""),
    neutral: {
      background: read("--background"),
      foreground: read("--foreground"),
      border: read("--border"),
      ring: read("--ring"),
    },
    personalityElements: document.querySelectorAll(
      ".ambient-wash, .ambient-grid, .hero-wash, .surface-sheen, .chart-glow",
    ).length,
  }
})()`

/**
 * WCAG contrast, measured on the *computed* colours.
 *
 * The colours are rasterised through a canvas because the computed values come
 * back as `lab()` / `oklab()` — parsing those by hand would be a second colour
 * implementation, and the browser already has one.
 */
const CONTRAST_PROBE = `(() => {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext("2d")
  const raster = (color) => {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    return { r, g, b, a }
  }
  const luminance = ({ r, g, b }) => {
    const channel = (value) => {
      const scaled = value / 255
      return scaled <= 0.03928 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  }
  const surface = raster(getComputedStyle(document.body).backgroundColor)
  const textEl = document.querySelector("main p") || document.querySelector("main") || document.body
  const ink = raster(getComputedStyle(textEl).color)
  const light = luminance(surface)
  const dark = luminance(ink)
  return {
    surface,
    ink,
    ratio: (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05),
    sampledTag: textEl.tagName.toLowerCase(),
  }
})()`

interface TokenProbeResult {
  personalityDeclared: string[]
  neutral: Record<string, string>
  personalityElements: number
}
interface ContrastProbeResult {
  surface: { r: number; g: number; b: number; a: number }
  ink: { r: number; g: number; b: number; a: number }
  ratio: number
  sampledTag: string
}

async function styleBaseline(page: Page, theme: "light" | "dark") {
  await page.emulateMedia({ colorScheme: theme })
  await page.setContent(UA_BASELINE_DOCUMENT)
  return page.evaluate(STYLE_PRESENCE_PROBE)
}

test.describe("a route that opts into nothing", () => {
  test("does not inherit the ambient / hero / glow tokens", async ({ page }) => {
    await page.goto(NEUTRAL_ROUTE, { waitUntil: "domcontentloaded" })
    const result = (await page.evaluate(TOKEN_PROBE)) as TokenProbeResult

    expect(result.personalityDeclared, "中性路由不得解析出性格 token").toEqual([])
    expect(result.personalityElements, "中性路由不得出现性格元素").toBe(0)
    // …while still being a styled page: the neutral layer is present.
    expect(result.neutral.background).not.toBe("")
    expect(result.neutral.foreground).not.toBe("")
    expect(result.neutral.border).not.toBe("")
  })

  test("is still a styled page — Phase A's gate must not be gamed", async ({ page }) => {
    const baseline = await styleBaseline(page, "light")
    await page.goto(NEUTRAL_ROUTE, { waitUntil: "domcontentloaded" })
    const sample = await page.evaluate(STYLE_PRESENCE_PROBE)
    const presence = compareStylePresence(baseline, sample, { minChannels: 2 })
    expect(presence.styled, `中性路由仍必须是有样式的页面（不同通道 ${JSON.stringify(presence.differing)}）`).toBe(
      true,
    )
  })

  test("is readable in both themes", async ({ page }) => {
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme })
      await page.goto(NEUTRAL_ROUTE, { waitUntil: "domcontentloaded" })
      const contrast = (await page.evaluate(CONTRAST_PROBE)) as ContrastProbeResult

      expect(contrast.surface.a, `${theme}: body 必须有实体底色（不能透明）`).toBeGreaterThan(0)
      expect(
        contrast.ratio,
        `${theme}: 正文对比度 ${contrast.ratio.toFixed(2)} 过低（底色 ${JSON.stringify(contrast.surface)} / 文字 ${JSON.stringify(contrast.ink)}）`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })
})

test.describe("the Reference Sample opts in explicitly", () => {
  test("/crm keeps its personality — and it is the sample's own layer", async ({ page }) => {
    await page.goto("/crm", { waitUntil: "domcontentloaded" })
    await page.waitForTimeout(300)
    const result = (await page.evaluate(TOKEN_PROBE)) as TokenProbeResult

    expect(result.personalityDeclared).toContain("--ambient-brand")
    // The sidebar brand mark opts in to its sheen…
    expect(await page.locator(".surface-sheen").count()).toBeGreaterThan(0)
    // …and the live status dot opts in to its halo.
    const halo = await page.evaluate(
      `document.querySelectorAll('[class*="live-halo"]').length`,
    )
    expect(halo).toBeGreaterThan(0)
  })

  test("/demo opts in to the page-level ambient backdrop", async ({ page }) => {
    await page.goto("/demo", { waitUntil: "domcontentloaded" })
    const result = (await page.evaluate(TOKEN_PROBE)) as TokenProbeResult

    expect(result.personalityDeclared).toContain("--ambient-brand")
    expect(result.personalityElements, "PageContainer 显式 ambient 后应当有环境光元素").toBeGreaterThan(0)
  })

  test("/ opts in to the hero backdrop", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" })
    const result = (await page.evaluate(TOKEN_PROBE)) as TokenProbeResult
    expect(result.personalityElements).toBeGreaterThan(0)
  })

  test("the sample surfaces are styled too", async ({ page }) => {
    const baseline = await styleBaseline(page, "light")
    for (const route of ["/", "/demo", "/crm"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" })
      const sample = await page.evaluate(STYLE_PRESENCE_PROBE)
      const presence = compareStylePresence(baseline, sample, { minChannels: 2 })
      expect(presence.styled, `${route} 必须仍然是有样式的页面`).toBe(true)
    }
  })

  test("reduced motion still collapses the personality motion", async ({ browser }) => {
    // The moving parts are the sample's; the rule is the Factory's.
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    })
    try {
      const page = await context.newPage()
      await page.goto("/crm", { waitUntil: "domcontentloaded" })
      await page.waitForTimeout(300)
      const running = await page.evaluate(
        `document.getAnimations().filter((a) => a.playState === "running" && a.effect &&
          a.effect.getComputedTiming().iterations === Infinity).length`,
      )
      expect(running, "reduced-motion 下不得有无限循环动画").toBe(0)
    } finally {
      await context.close()
    }
  })
})
