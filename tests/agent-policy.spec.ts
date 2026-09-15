import { execFileSync } from "node:child_process"
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import {
  KEY_VALUE_PATHS,
  PolicyScopeError,
  UPSTREAM_LOCK_ID,
  assertNonVacuousPolicyScan,
  blockAnchors,
  collectPolicyDocs,
  compareManagedBlock,
  detectUpstreamReuse,
  inspectCiWorkflow,
  inspectPackageWiring,
  renderManagedBlock,
  scanProhibitionConflicts,
  schemaConstAt,
  validateAgainstSchema,
  valueAtDotPath,
} from "../scripts/lib/agent-policy.mjs"
import { stripComments } from "../scripts/lib/kits-seam.mjs"

/**
 * The agent-policy gate (Factory v1.3 · POLICY).
 *
 * These are the executable form of what `AGENTS.md`'s managed block states in
 * prose. The suite spends most of its effort on the *negative* cases, because
 * the rule this gate replaced — v1.2's flat ban on "Multi-agent orchestration" —
 * was not wrong about a detail. It was unenforceable in both directions: nobody
 * could follow it and nobody could break it, so nothing noticed either way.
 *
 * A gate that only proves it passes on a good tree proves very little.
 */

const ROOT = process.cwd()
const GUARD = join(ROOT, "scripts/guard-agent-policy.mjs")
const read = (path: string) => readFileSync(join(ROOT, path), "utf8")

type UnresolvedFact = {
  id: string
  what: string
  why: string
  probe: string
  checkedOn: string
  value: null
}

type FactoryLock = {
  schemaVersion: number
  kind: string
  starter: { packageName: string; version: string; commit: string; recordedOn: string }
  policy: { version: string }
  managedSurfaces: string[]
  unresolved: UnresolvedFact[]
  note: string
}

const policy = JSON.parse(read("factory-policy.json"))
const schema = JSON.parse(read("lib/factory-policy.schema.json"))
const lock: FactoryLock = JSON.parse(read("factory.lock.json"))

/** The exact line v1.2 shipped. It must never come back unnoticed. */
const LEGACY_BAN =
  "- ❌ 禁止加入 Database / Supabase / Authentication / Docker / Kubernetes / Monorepo / " +
  "Turborepo / Microservices / Backend service / MCP / Multi-agent orchestration / " +
  "GitHub Actions / Vercel API & CLI automation / Cloudflare / 任何新的 deployment platform。这些以后再处理。"

/* -------------------------------------------------------------------------- */
/* the gate runs and passes on this tree                                       */
/* -------------------------------------------------------------------------- */

test("the gate passes on this repository", () => {
  const stdout = execFileSync(process.execPath, [GUARD], { cwd: ROOT, encoding: "utf8" })
  expect(stdout).toContain("Agent policy OK")
  expect(stdout).toContain(policy.modelRouting.provider)
})

test("a tampered policy fails the gate end to end", () => {
  const dir = mkdtempSync(join(tmpdir(), "factory-policy-"))
  const tampered = structuredClone(policy)
  // The one value the whole boundary rests on, flipped to its opposite.
  tampered.agentOrchestration.dshSubagents = "forbidden"
  const path = join(dir, "tampered-policy.json")
  writeFileSync(path, JSON.stringify(tampered, null, 2))

  let output = ""
  let failed = false
  try {
    execFileSync(process.execPath, [GUARD, "--policy", path], { cwd: ROOT, encoding: "utf8", stdio: "pipe" })
  } catch (error) {
    failed = true
    output = String((error as { stdout?: string }).stdout ?? "")
  }
  expect(failed, "改了关键值还绿灯 = 门禁没有真的在读它").toBe(true)
  expect(output).toContain("[policy/schema]")
})

/* -------------------------------------------------------------------------- */
/* §1 — the prohibition conflict scan                                          */
/* -------------------------------------------------------------------------- */

test("the v1.2 blanket ban is caught, with the reason named", () => {
  const result = scanProhibitionConflicts([{ path: "AGENTS.md", text: LEGACY_BAN }])
  expect(result.conflicts).toHaveLength(1)
  expect(result.conflicts[0].code).toBe("policy/unscoped-prohibition")
  expect(result.conflicts[0].line).toBe(1)
  expect(result.linesScanned).toBe(1)
})

test("a scoped prohibition is not a conflict", () => {
  const scoped = [
    "- ❌ 禁止在**产品应用代码**里引入编排框架或编排运行时。",
    "- ❌ 禁止在产品代码及其运行时依赖里出现 agent framework / orchestrator runtime / 多 agent 调度依赖。",
  ].join("\n")
  expect(scanProhibitionConflicts([{ path: "AGENTS.md", text: scoped }]).conflicts).toEqual([])
})

test("stating the allowance is not a prohibition", () => {
  const allowance = "- ✅ DSH 宿主侧的**多 Subagent 编排**：允许并要求，边界见管理块。"
  const result = scanProhibitionConflicts([{ path: "AGENTS.md", text: allowance }])
  expect(result.conflicts).toEqual([])
  // …and it was actually examined, rather than skipped as "no term found".
  expect(result.linesScanned).toBe(1)
})

test("the real docs are scanned, and the scan is not vacuous", () => {
  const docs = collectPolicyDocs(ROOT)
  const scan = scanProhibitionConflicts(docs)
  assertNonVacuousPolicyScan(scan) // throws if filesScanned / linesScanned is 0
  expect(scan.filesScanned).toBeGreaterThan(1)
  expect(scan.linesScanned).toBeGreaterThan(100)
  expect(scan.conflicts).toEqual([])
})

test("a scan that looked at nothing refuses to be called a pass", () => {
  expect(() => assertNonVacuousPolicyScan({ filesScanned: 0, linesScanned: 0 })).toThrow(PolicyScopeError)
  expect(() => assertNonVacuousPolicyScan({ filesScanned: 4, linesScanned: 0 })).toThrow(/0 行/)
})

/* -------------------------------------------------------------------------- */
/* §2 — the managed block is rendered, then verified verbatim                  */
/* -------------------------------------------------------------------------- */

test("the renderer still states every rule the policy is about", () => {
  const anchors = blockAnchors(policy)
  expect(anchors.length).toBeGreaterThanOrEqual(12)
  const rendered = renderManagedBlock(policy)
  for (const anchor of anchors) {
    expect(anchor.pattern.test(rendered), `管理块缺少规则：${anchor.id} — ${anchor.hint}`).toBe(true)
  }
})

test("AGENTS.md's block is exactly what the policy renders", () => {
  const result = compareManagedBlock(read("AGENTS.md"), policy)
  expect(result.ok, result.message).toBe(true)
})

test("an edited block is reported as drift, not waved through", () => {
  const agents = read("AGENTS.md")
  const drifted = agents.replace("没有 HVA 就没有发布", "验收可以晚点再说")
  expect(drifted).not.toBe(agents)

  const result = compareManagedBlock(drifted, policy)
  expect(result.ok).toBe(false)
  expect(result.reason).toBe("drift")
  expect(result.message).toContain("第一处差异")
})

test("a missing or duplicated marker is its own failure, not drift", () => {
  const agents = read("AGENTS.md")
  const withoutEnd = agents.replace(policy.managedBlock.end, "")
  expect(compareManagedBlock(withoutEnd, policy).reason).toBe("markers")

  const duplicated = agents.replace(policy.managedBlock.begin, `${policy.managedBlock.begin}\n${policy.managedBlock.begin}`)
  expect(compareManagedBlock(duplicated, policy).reason).toBe("markers")
})

/* -------------------------------------------------------------------------- */
/* §3 — key values live in the schema, once                                    */
/* -------------------------------------------------------------------------- */

test("every key value is pinned as a const, and the policy agrees with it", () => {
  expect(KEY_VALUE_PATHS.length).toBeGreaterThanOrEqual(15)
  for (const dotPath of KEY_VALUE_PATHS) {
    const declared = schemaConstAt(schema, dotPath)
    expect(declared.declared, `${dotPath} 没有被 schema 钉成 const`).toBe(true)
    expect(valueAtDotPath(policy, dotPath), dotPath).toBe(declared.value)
  }
})

test("the schema actually constrains the boundary — a flipped value is rejected", () => {
  const tampered = structuredClone(policy)
  tampered.agentOrchestration.dshSubagents = "forbidden"
  tampered.agentOrchestration.productAppFrameworks = "allowed"
  const result = validateAgainstSchema(tampered, schema)
  expect(result.ok).toBe(false)
  expect(result.issues.some((issue) => issue.path.includes("agentOrchestration"))).toBe(true)
})

test("relaxing the schema cannot hide a drift — the check loses its reference and fails", () => {
  const relaxed = structuredClone(schema)
  delete relaxed.properties.agentOrchestration.properties.dshSubagents.const
  // The guard fails when a key value is not pinned (`policy/key-value-not-pinned`),
  // so a missing const is a loud failure rather than a silent pass.
  expect(schemaConstAt(relaxed, "agentOrchestration.dshSubagents").declared).toBe(false)
  expect(schemaConstAt(schema, "agentOrchestration.dshSubagents").value).toBe("required")
})

test("the enforcement code keeps no copy of the policy values", () => {
  for (const file of ["scripts/guard-agent-policy.mjs", "scripts/lib/agent-policy.mjs"]) {
    const code = stripComments(read(file))
    for (const token of [
      policy.modelRouting.provider,
      policy.modelRouting.model,
      policy.managedBlock.begin,
      policy.managedBlock.end,
    ]) {
      expect(code.includes(token), `${file} 抄了一份 ${token}——值只应存在于 schema/policy`).toBe(false)
    }
  }
})

/* -------------------------------------------------------------------------- */
/* §4 — the lock: 未知不猜                                                      */
/* -------------------------------------------------------------------------- */

test("the lock conforms to its schema and lists real managed surfaces", () => {
  const lockSchema = JSON.parse(read("lib/factory-lock.schema.json"))
  const result = validateAgainstSchema(lock, lockSchema)
  expect(result.ok, JSON.stringify(result.issues)).toBe(true)

  expect(lock.kind).toBe("factory-baseline")
  expect(lock.starter.commit).toMatch(/^[0-9a-f]{40}$/)
  expect(lock.policy.version).toBe(policy.policyVersion)

  expect(lock.managedSurfaces.length).toBeGreaterThan(0)
  for (const surface of lock.managedSurfaces) {
    expect(existsSync(join(ROOT, surface)), `受管面不存在：${surface}`).toBe(true)
  }
})

test("unmatched facts are recorded as unknown, never guessed", () => {
  expect(lock.unresolved.length).toBeGreaterThan(0)
  for (const entry of lock.unresolved) {
    expect(entry.value, `${entry.id} 不能有一个猜出来的值`).toBeNull()
    expect(entry.probe.length, `${entry.id} 必须写清楚怎么核的`).toBeGreaterThan(10)
  }
})

/* -------------------------------------------------------------------------- */
/* §5 — CI: a quality gate, never a deployment path                            */
/* -------------------------------------------------------------------------- */

const GOOD_CI = [
  "jobs:",
  "  gate:",
  "    steps:",
  "      - run: pnpm factory:agents",
  "      - run: pnpm test",
  "  browser-qa:",
  "    needs: gate",
  "    steps:",
  "      - run: pnpm qa",
].join("\n")

test("a serial, credential-free workflow passes", () => {
  expect(inspectCiWorkflow(GOOD_CI).problems).toEqual([])
  expect(inspectCiWorkflow(GOOD_CI).jobs).toBe(2)
})

test("running test and qa in one job is caught", () => {
  const sameJob = GOOD_CI.replace("      - run: pnpm test", "      - run: pnpm test\n      - run: pnpm qa")
  const codes = inspectCiWorkflow(sameJob).problems.map((problem) => problem.code)
  expect(codes).toContain("ci/test-qa-same-job")
})

test("a qa job that does not depend on the test job is caught", () => {
  const noNeeds = GOOD_CI.replace("    needs: gate\n", "")
  const codes = inspectCiWorkflow(noNeeds).problems.map((problem) => problem.code)
  expect(codes).toContain("ci/test-qa-not-serial")
})

test("CI may not hold deployment credentials or call the Vercel CLI", () => {
  const withCli = `${GOOD_CI}\n      - run: ${["npx", "vercel", "deploy"].join(" ")}`
  expect(inspectCiWorkflow(withCli).problems.map((problem) => problem.code)).toContain("ci/vercel-cli")

  const tokenName = ["VERCEL", "TOKEN"].join("_")
  const withToken = `${GOOD_CI}\n    env:\n      ${tokenName}: \${{ secrets.${tokenName} }}`
  expect(inspectCiWorkflow(withToken).problems.map((problem) => problem.code)).toContain("ci/deployment-credential")
})

test("a workflow that drops the policy gate is caught", () => {
  const withoutGate = GOOD_CI.replace("      - run: pnpm factory:agents\n", "")
  expect(inspectCiWorkflow(withoutGate).problems.map((problem) => problem.code)).toContain("ci/no-policy-gate")
})

test("a workflow with no jobs section cannot be reported as serial", () => {
  const problems = inspectCiWorkflow("on: push\n").problems.map((problem) => problem.code)
  expect(problems).toContain("ci/jobs-unparsed")
})

test("this repository's workflow satisfies the contract, and calls nothing upstream", () => {
  const ci = read(".github/workflows/ci.yml")
  expect(inspectCiWorkflow(ci).problems).toEqual([])

  // The upstream switch is *commented out* on purpose — a comment is not a call.
  expect(detectUpstreamReuse(ci)).toEqual([])
  const active = "    uses: skillre/prototype-factory-control/.github/workflows/reusable-prototype-ci.yml@v1"
  expect(detectUpstreamReuse(active)).toHaveLength(1)

  // …and while it is commented out, the lock must say so.
  expect(lock.unresolved.some((entry) => entry.id === UPSTREAM_LOCK_ID && entry.value === null)).toBe(true)
})

test("the policy gate runs before anything else is called green in CI", () => {
  const ci = read(".github/workflows/ci.yml")
  const agentsLine = ci.indexOf("pnpm factory:agents")
  expect(agentsLine).toBeGreaterThan(-1)
  for (const later of ["pnpm lint", "pnpm typecheck", "pnpm test"]) {
    expect(ci.indexOf(later), `${later} 必须排在策略门禁之后`).toBeGreaterThan(agentsLine)
  }
})

/* -------------------------------------------------------------------------- */
/* §6 — wiring: the gate must actually run                                     */
/* -------------------------------------------------------------------------- */

test("package.json runs the gate, as the first item of check", () => {
  const pkg = JSON.parse(read("package.json"))
  expect(inspectPackageWiring(pkg).problems).toEqual([])
  expect(pkg.scripts.check.startsWith("pnpm factory:agents &&")).toBe(true)
})

test("a gate that is present but not wired is caught", () => {
  const pkg = JSON.parse(read("package.json"))

  const late = structuredClone(pkg)
  late.scripts.check = "pnpm lint && pnpm factory:agents"
  expect(inspectPackageWiring(late).problems.map((problem) => problem.code)).toContain("package/check-order")

  const missing = structuredClone(pkg)
  delete missing.scripts["factory:agents"]
  expect(inspectPackageWiring(missing).problems.map((problem) => problem.code)).toContain("package/missing-script")

  const wrongTarget = structuredClone(pkg)
  wrongTarget.scripts["factory:agents"] = "node scripts/something-else.mjs"
  expect(inspectPackageWiring(wrongTarget).problems.map((problem) => problem.code)).toContain("package/script-target")
})
