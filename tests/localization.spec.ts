import { test, expect, type Page } from "@playwright/test"

/**
 * 本地化完整性（Phase 12 — No English Leakage）。
 *
 * 目标：CRM 的**界面文案**全部为中文。数据里的专有名词（客户公司名、人名、
 * 品牌名、URL、技术标识、快捷键、邮箱）不在断言范围内——它们是内容，不是 UI 文案。
 */

const CRM_ROUTES = [
  "/crm",
  "/crm/customers",
  "/crm/customers/c-004",
  "/crm/tasks",
  "/crm/activities",
]

/**
 * 允许出现的西文片段：
 *   • 纯数字 / 金额 / 日期 / 邮箱 / URL
 *   • 品牌名与技术栈名称
 *   • 键盘快捷键与产品品牌
 *   • 种子数据里的专有名词（公司、人名、邮箱域名）
 * 其余「纯西文且不含中文」的可见文本一律视为漏翻。
 */
const ALLOWED = [
  /^[\d\s.,:%¥$+\-–—/()]+$/,
  /^(AI|CRM|AI CRM|G D|G C|G T|G A|N|K|⌘K|zhixiao-copilot-v2)$/,
  /@/,
  /^https?:\/\//,
  /^\d{4}-\d{2}-\d{2}/,
  /^(GET|POST|PUT|DELETE)\s/,
  /^(Next\.js|Tailwind|shadcn|Motion|Zustand|Recharts|Playwright|Base UI)\b/,
]

async function visibleUntranslatedText(page: Page) {
  return page.evaluate(() => {
    const found: string[] = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node: Node | null
    while ((node = walker.nextNode())) {
      const text = (node.textContent ?? "").trim()
      if (!text || text.length > 120) continue
      const parent = node.parentElement
      if (!parent) continue
      if (parent.closest("[aria-hidden='true'], .sr-only, script, style, code, pre")) continue
      const style = getComputedStyle(parent)
      if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") continue
      found.push(text)
    }
    return found
  })
}

test.describe("CRM UI copy is fully localized", () => {
  test("html declares zh-CN", async ({ page }) => {
    await page.goto("/crm")
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN")
  })

  for (const route of CRM_ROUTES) {
    test(`${route} renders no untranslated UI copy`, async ({ page }) => {
      await page.goto(route)
      await expect(page.getByTestId("crm-content")).toBeVisible({ timeout: 20_000 })
      await page.waitForTimeout(500)

      const texts = await visibleUntranslatedText(page)
      const unlocalized = texts.filter((text) => {
        // 含中文 → 已本地化（中英混排的品牌名也归此类）。
        if (/[\u4e00-\u9fff]/.test(text)) return false
        // 不含连续 3 个以上字母 → 不是文案。
        if (!/[A-Za-z]{3,}/.test(text)) return false
        return !ALLOWED.some((rule) => rule.test(text))
      })

      expect(unlocalized).toEqual([])
    })
  }

  test("key navigation and control labels are Chinese", async ({ page }) => {
    await page.goto("/crm")
    await expect(page.getByTestId("crm-content")).toBeVisible({ timeout: 20_000 })

    // 侧栏导航文案
    await expect(page.getByTestId("nav-dashboard")).toContainText("总览")
    await expect(page.getByTestId("nav-customers")).toContainText("客户")
    await expect(page.getByTestId("nav-tasks")).toContainText("任务")
    await expect(page.getByTestId("nav-activities")).toContainText("活动")
    await expect(page.getByTestId("nav-add-customer")).toContainText("添加客户")

    // 账户菜单
    await page.getByTestId("account-menu").click()
    await expect(page.getByRole("menuitem", { name: "个人资料" })).toBeVisible()
    await expect(page.getByRole("menuitem", { name: "退出登录" })).toBeVisible()
    await page.keyboard.press("Escape")
  })

  test("light and dark both expose the full semantic token set", async ({ page }) => {
    await page.goto("/crm")
    await expect(page.getByTestId("crm-content")).toBeVisible({ timeout: 20_000 })

    const readTokens = () =>
      page.evaluate(() => {
        const style = getComputedStyle(document.documentElement)
        const names = [
          "--background",
          "--surface",
          "--elevated",
          "--interactive",
          "--foreground",
          "--muted",
          "--border",
          "--accent",
          "--accent-soft",
          "--success",
          "--warning",
          "--danger",
          "--info",
          "--brand",
          "--elevation-subtle",
          "--elevation-card",
          "--elevation-elevated",
          "--elevation-floating",
          "--duration-press",
          "--duration-enter",
          "--duration-drawer",
          "--motion-ease-spring",
          "--radius",
        ]
        return Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()]))
      })

    const light = await readTokens()
    for (const [name, value] of Object.entries(light)) {
      expect(value, `${name} must be defined in the light theme`).not.toBe("")
    }

    await page.getByTestId("toggle-theme").click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    const dark = await readTokens()
    for (const [name, value] of Object.entries(dark)) {
      expect(value, `${name} must be defined in the dark theme`).not.toBe("")
    }

    // Light 与 Dark 必须真的不同，否则暗色主题等于没生效。
    expect(dark["--background"]).not.toBe(light["--background"])
    expect(dark["--surface"]).not.toBe(light["--surface"])
    expect(dark["--elevation-card"]).not.toBe(light["--elevation-card"])
  })
})
