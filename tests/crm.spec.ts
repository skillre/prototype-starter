import { test, expect, type Page } from "@playwright/test"

/**
 * AI CRM 端到端覆盖。
 *
 * 选择器策略与既有 spec 一致：优先 role + accessible name，其次 label，
 * 最后才用 data-testid。不使用 nth() 与脆弱的 CSS 选择器。
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/crm")
  // 等待模拟的初始加载（骨架屏 → 就绪）。
  await expect(page.getByTestId("crm-content")).toBeVisible({ timeout: 20_000 })
})

/** 收集控制台错误，断言页面无运行时异常。 */
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  page.on("pageerror", (error) => errors.push(error.message))
  return errors
}

test("dashboard renders KPIs, charts and live sections", async ({ page }) => {
  const errors = trackConsoleErrors(page)

  await expect(page.getByTestId("crm-root")).toBeVisible()
  await expect(page.getByText("Total customers")).toBeVisible()
  await expect(page.getByText("New this month")).toBeVisible()
  await expect(page.getByText("Active deals")).toBeVisible()
  await expect(page.getByText("Revenue")).toBeVisible()
  await expect(page.getByText("Conversion rate")).toBeVisible()

  await expect(page.getByText("Pipeline performance")).toBeVisible()
  await expect(page.getByText("Pipeline by stage")).toBeVisible()
  await expect(page.getByText("Recent activity")).toBeVisible()
  await expect(page.getByText("Tasks overview")).toBeVisible()
  await expect(page.getByText("Highest-value accounts")).toBeVisible()

  // KPI 数字是真实派生值（22 位种子客户）。
  await expect(page.getByTestId("kpi-total-customers")).toContainText("22")

  expect(errors).toEqual([])
})

test("navigates to Customers and paginates the table", async ({ page }) => {
  await page.getByTestId("nav-customers").click()

  const table = page.getByTestId("crm-table")
  await expect(table).toBeVisible()
  await expect(page.getByTestId("crm-pagination")).toContainText("1–8 of 22")

  await page.getByRole("button", { name: "Page 2" }).click()
  await expect(page.getByTestId("crm-pagination")).toContainText("9–16 of 22")

  await page.getByRole("button", { name: "Previous page" }).click()
  await expect(page.getByTestId("crm-pagination")).toContainText("1–8 of 22")
})

test("search filters rows and shows an empty state that recovers", async ({ page }) => {
  await page.getByTestId("nav-customers").click()
  const table = page.getByTestId("crm-table")
  await expect(table).toBeVisible()

  await page.getByTestId("crm-search").fill("Northwind")
  await expect(page.getByTestId("crm-pagination")).toContainText("of 1")

  await page.getByTestId("crm-search").fill("zzz-no-such-customer")
  await expect(page.getByText("No customers match")).toBeVisible()

  // 空状态必须提供真实的出路。
  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(page.getByTestId("crm-pagination")).toContainText("1–8 of 22")
})

test("status and owner filters narrow the table", async ({ page }) => {
  await page.getByTestId("nav-customers").click()
  await expect(page.getByTestId("crm-table")).toBeVisible()

  await page.getByTestId("crm-filter-status").click()
  await page.getByRole("option", { name: "Active" }).click()
  await expect(page.getByTestId("crm-pagination")).toContainText("of 9")

  await page.getByTestId("crm-filter-owner").click()
  await page.getByRole("option", { name: "Maya Chen" }).click()
  await expect(page.getByTestId("crm-pagination")).not.toContainText("of 9")

  await page.getByRole("button", { name: "Reset filters" }).click()
  await expect(page.getByTestId("crm-pagination")).toContainText("1–8 of 22")
})

test("sorts the table by deal value", async ({ page }) => {
  await page.getByTestId("nav-customers").click()
  await expect(page.getByTestId("crm-table")).toBeVisible()

  await page.getByRole("button", { name: "Sort by Deal value" }).click()
  // 升序：最低金额出现在第一行。
  await expect(page.getByTestId("crm-table").locator("tbody tr").first()).toContainText("—")

  await page.getByRole("button", { name: "Sort by Deal value" }).click()
  // 降序：最高金额出现在第一行。
  await expect(page.getByTestId("crm-table").locator("tbody tr").first()).toContainText("$210,000")
})

test("adds a customer, updates the table, KPIs and activity feed", async ({ page }) => {
  const errors = trackConsoleErrors(page)

  await page.getByTestId("nav-customers").click()
  await expect(page.getByTestId("crm-pagination")).toContainText("of 22")

  await page.getByTestId("add-customer").click()
  const dialog = page.getByTestId("add-customer-dialog")
  await expect(dialog).toBeVisible()

  await page.getByTestId("add-customer-name").fill("Nadia Rahman")
  await page.getByTestId("add-customer-company").fill("Quanta Robotics")
  await page.getByTestId("add-customer-email").fill("nadia@quantarobotics.io")
  await page.getByTestId("add-customer-phone").fill("+1 (408) 555-0177")
  await page.getByTestId("add-customer-value").fill("88000")
  await page.getByTestId("add-customer-submit").click()

  await expect(dialog).not.toBeVisible()
  await expect(page.getByText("Quanta Robotics added")).toBeVisible()

  // 表格真实增加一条记录。
  await expect(page.getByTestId("crm-pagination")).toContainText("of 23")
  await expect(page.getByTestId("crm-table")).toContainText("Quanta Robotics")

  // 新建后详情抽屉可打开查看新客户。
  const drawer = page.getByTestId("customer-drawer")
  await expect(drawer).toBeVisible()
  await expect(drawer.getByText("Nadia Rahman")).toBeVisible()

  await drawer.getByRole("button", { name: "Close" }).click()
  await expect(drawer).not.toBeVisible()

  // KPI 真实联动。
  await page.getByTestId("nav-dashboard").click()
  await expect(page.getByTestId("kpi-total-customers")).toContainText("23")

  // 新客户写入活动流，并排在最前。
  await page.getByTestId("nav-activities").click()
  await expect(page.getByTestId("activity-timeline").locator("li").first()).toContainText(
    "Quanta Robotics"
  )

  expect(errors).toEqual([])
})

test("validates the add customer form", async ({ page }) => {
  await page.getByTestId("nav-customers").click()
  await page.getByTestId("add-customer").click()
  await expect(page.getByTestId("add-customer-dialog")).toBeVisible()

  // 空表单直接提交 → 出现校验错误，且记录不会被创建。
  await page.getByTestId("add-customer-submit").click()
  await expect(page.getByRole("alert").first()).toBeVisible()
  await expect(page.getByTestId("add-customer-dialog")).toBeVisible()

  await page.getByTestId("add-customer-name").fill("Broken Email")
  await page.getByTestId("add-customer-company").fill("Bad Data Inc")
  await page.getByTestId("add-customer-email").fill("not-an-email")
  await page.getByTestId("add-customer-phone").fill("+1 555 0000")
  await page.getByTestId("add-customer-submit").click()
  await expect(page.getByText("Enter a valid email address.")).toBeVisible()
  await expect(page.getByTestId("add-customer-dialog")).toBeVisible()
})

test("opens the customer detail drawer with record data", async ({ page }) => {
  await page.getByTestId("nav-customers").click()
  await expect(page.getByTestId("crm-table")).toBeVisible()

  // 默认按创建时间倒序，先用搜索定位到目标记录。
  await page.getByTestId("crm-search").fill("Beacon Health Group")
  await expect(page.getByTestId("crm-pagination")).toContainText("of 1")
  await page.getByTestId("crm-table").getByText("Beacon Health Group").click()

  const drawer = page.getByTestId("customer-drawer")
  await expect(drawer).toBeVisible()
  await expect(drawer.getByText("Marcus Bell")).toBeVisible()
  await expect(drawer.getByText("marcus.bell@beaconhealth.org")).toBeVisible()
  await expect(drawer.getByText("+1 (617) 555-0188")).toBeVisible()
  await expect(drawer.getByText("Chief Information Officer")).toBeVisible()
  await expect(drawer.getByText("hipaa", { exact: true })).toBeVisible()
  await expect(drawer.getByText("Activity timeline")).toBeVisible()
  await expect(drawer.getByRole("button", { name: "Copy email" })).toBeVisible()

  await drawer.getByRole("button", { name: "Close" }).click()
  await expect(drawer).not.toBeVisible()
})

test("generates an AI summary with a loading state, then regenerates", async ({ page }) => {
  await page.getByTestId("nav-customers").click()
  await page.getByTestId("crm-search").fill("Beacon Health Group")
  await expect(page.getByTestId("crm-pagination")).toContainText("of 1")
  await page.getByTestId("crm-table").getByText("Beacon Health Group").click()

  const panel = page.getByTestId("ai-summary")
  await expect(panel).toBeVisible()

  // 初始为 idle，只有一个生成入口。
  await panel.getByTestId("ai-summary-generate").click()

  // loading：出现 status 区域的骨架屏。
  await expect(panel.getByRole("status")).toBeVisible()

  // 结果淡入并包含确定性内容。
  await expect(panel.getByText(/Healthy Enterprise account at Beacon Health Group/)).toBeVisible({
    timeout: 10_000,
  })
  await expect(panel.getByText("Recommended next step")).toBeVisible()
  await expect(panel.getByText(/Confidence \d+%/)).toBeVisible()

  // 可重新生成。
  await panel.getByTestId("ai-summary-regenerate").click()
  await expect(panel.getByRole("status")).toBeVisible()
  await expect(panel.getByText(/Healthy Enterprise account at Beacon Health Group/)).toBeVisible({
    timeout: 10_000,
  })
})

test("command palette opens with ⌘K/Ctrl+K and runs real commands", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+K")

  const palette = page.getByTestId("command-palette")
  await expect(palette).toBeVisible()

  // 导航命令真实切换页面。
  await page.getByRole("option", { name: "Open Tasks" }).click()
  await expect(palette).not.toBeVisible()
  await expect(page.getByTestId("task-board")).toBeVisible()

  // 操作命令真实打开对话框。
  await page.keyboard.press("ControlOrMeta+K")
  await page.getByRole("option", { name: "Add Customer" }).click()
  await expect(page.getByTestId("add-customer-dialog")).toBeVisible()
  await page.getByRole("button", { name: "Cancel" }).click()
  await expect(page.getByTestId("add-customer-dialog")).not.toBeVisible()

  // 主题命令真实切换 dark class。
  const html = page.locator("html")
  const wasDark = await html.evaluate((el) => el.classList.contains("dark"))
  await page.keyboard.press("ControlOrMeta+K")
  await page.getByRole("option", { name: "Toggle theme" }).click()
  await expect(html).toHaveClass(wasDark ? /^(?!.*dark).*$/ : /dark/)
})

test("switching pages via sidebar keeps navigation state", async ({ page }) => {
  await page.getByTestId("nav-activities").click()
  await expect(page.getByTestId("activity-timeline")).toBeVisible()
  await expect(page.getByText("Activity timeline")).toBeVisible()

  await page.getByTestId("nav-tasks").click()
  await expect(page.getByTestId("task-board")).toBeVisible()
  await expect(page.getByRole("button", { name: "Reset board" })).toBeVisible()

  await page.getByTestId("nav-dashboard").click()
  await expect(page.getByText("Pipeline performance")).toBeVisible()
})

test("drag and drop moves a task to another column and persists", async ({ page }) => {
  await page.getByTestId("nav-tasks").click()
  await expect(page.getByTestId("task-board")).toBeVisible()

  const followUp = page.getByTestId("task-column-follow-up")
  const proposal = page.getByTestId("task-column-proposal")

  await expect(followUp.locator("article")).toHaveCount(3)
  await expect(proposal.locator("article")).toHaveCount(2)

  const card = followUp.locator("article").first()
  const cardBox = await card.boundingBox()
  const targetBox = await proposal.boundingBox()
  if (!cardBox || !targetBox) throw new Error("task board columns are not rendered")

  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 3)
  await page.mouse.down()
  await page.mouse.move(cardBox.x + cardBox.width / 2 + 30, cardBox.y + 40, { steps: 8 })
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 120, { steps: 20 })
  await page.mouse.up()

  // 顺序真实改变：源列 -1，目标列 +1。
  await expect(followUp.locator("article")).toHaveCount(2)
  await expect(proposal.locator("article")).toHaveCount(3)
  await expect(proposal).toContainText("Re-introduce new IT director")

  // 重新挂载后仍然保留（写入的是 store，不是 DOM 顺序）。
  await page.getByTestId("nav-dashboard").click()
  await page.getByTestId("nav-tasks").click()
  await expect(page.getByTestId("task-column-proposal")).toContainText(
    "Re-introduce new IT director"
  )
})

test("activities timeline renders every event type and filters", async ({ page }) => {
  await page.getByTestId("nav-activities").click()

  const timeline = page.getByTestId("activity-timeline")
  await expect(timeline).toBeVisible()
  await expect(timeline.locator("li")).toHaveCount(20)

  await page.getByTestId("activity-filter-kind").click()
  await page.getByRole("option", { name: "Email" }).click()
  await expect(timeline.locator("li")).toHaveCount(4)

  await page.getByTestId("activity-filter-owner").click()
  await page.getByRole("option", { name: "Maya Chen" }).click()
  await expect(timeline.locator("li")).toHaveCount(2)

  await page.getByRole("button", { name: "Reset filters" }).click()
  await expect(timeline.locator("li")).toHaveCount(20)
})

test.describe("mobile viewport (390×844)", () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test("renders the mobile shell and navigates via the drawer", async ({ page }) => {
    await expect(page.getByTestId("mobile-nav")).toBeVisible()
    await expect(page.locator("aside")).toBeHidden()
    await expect(page.getByTestId("crm-content")).toBeVisible()

    // 移动端导航抽屉可用。
    await page.getByTestId("mobile-nav").click()
    const navDrawer = page.getByRole("dialog")
    await expect(navDrawer.getByTestId("nav-customers")).toBeVisible()
    await navDrawer.getByTestId("nav-customers").click()

    // 客户页在移动端完整可用：表格、搜索、筛选、添加都在。
    await expect(page.getByTestId("crm-table")).toBeVisible()
    await expect(page.getByTestId("crm-search")).toBeVisible()
    await expect(page.getByTestId("crm-filter-status")).toBeVisible()
    await expect(page.getByTestId("add-customer")).toBeVisible()
  })

  test("completes the mobile customer flow: search, drawer, AI summary", async ({ page }) => {
    await page.getByTestId("mobile-nav").click()
    await page.getByRole("dialog").getByTestId("nav-customers").click()
    await expect(page.getByTestId("crm-table")).toBeVisible()

    await page.getByTestId("crm-search").fill("Helio")
    await expect(page.getByTestId("crm-pagination")).toContainText("of 1")

    await page.getByTestId("crm-table").locator("tbody tr").click()
    const drawer = page.getByTestId("customer-drawer")
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText("Tobias Lindqvist")).toBeVisible()

    // 抽屉在移动端适配屏幕宽度，AI 摘要流程可用。
    const box = await drawer.boundingBox()
    expect(box?.width).toBeGreaterThan(300)

    await drawer.getByTestId("ai-summary-generate").click()
    await expect(drawer.getByRole("status")).toBeVisible()
    await expect(drawer.getByText(/Active trial at Helio Semiconductor/)).toBeVisible({
      timeout: 10_000,
    })

    await drawer.getByRole("button", { name: "Close" }).click()
    await expect(drawer).not.toBeVisible()
  })

  test("adds a customer from the mobile viewport", async ({ page }) => {
    await page.getByTestId("mobile-nav").click()
    await page.getByRole("dialog").getByTestId("nav-customers").click()

    await page.getByTestId("add-customer").click()
    const dialog = page.getByTestId("add-customer-dialog")
    await expect(dialog).toBeVisible()

    await page.getByTestId("add-customer-name").fill("Pocket Tester")
    await page.getByTestId("add-customer-company").fill("Pocket Labs")
    await page.getByTestId("add-customer-email").fill("tester@pocketlabs.io")
    await page.getByTestId("add-customer-phone").fill("+1 (555) 010-0100")
    await page.getByTestId("add-customer-submit").click()

    await expect(dialog).not.toBeVisible()
    await expect(page.getByTestId("crm-pagination")).toContainText("of 23")
  })

  test("command palette works on mobile", async ({ page }) => {
    await page.getByTestId("mobile-nav").click()
    await page.getByRole("dialog").getByTestId("nav-tasks").click()
    await expect(page.getByTestId("task-board")).toBeVisible()

    await page.getByRole("button", { name: "打开命令面板" }).click()
    await expect(page.getByTestId("command-palette")).toBeVisible()
    await page.getByRole("option", { name: "Go to Dashboard" }).click()
    await expect(page.getByText("Pipeline performance")).toBeVisible()
  })
})
