# Browser QA Standard

`pnpm qa` —— Factory v1.1 的浏览器质量门。跑在 `.qa/browser-qa.mjs`，配置在 `.qa/qa.config.mjs`。

这份文档说明**为什么**是这些判据。每一条都来自一次真实的假绿或真实回归，不是清单式的最佳实践。

---

## 怎么跑

```bash
pnpm qa                    # 全量扫描
pnpm qa --routes=/demo     # 只扫部分路由
pnpm qa --headed           # 看着它跑
QA_VERBOSE=1 pnpm qa       # 打印每一项通过
```

**路由、视口、主题、容差全部来自 `.qa/qa.config.mjs`。** 扫描脚本本身不知道任何路由名：默认从 `app/` 目录自动发现（`**/page.tsx`）。派生项目只需要改配置文件。

### 默认矩阵

| 维度 | 取值 |
|---|---|
| 视口 | desktop **1440×900**（fine pointer）· mobile **390×844**（coarse pointer + touch） |
| 主题 | dark · light |
| 路由 | `app/` 下自动发现的全部静态路由 |

动态段（`[id]`）无法静态发现，会被跳过并在输出里说明；具体路径写进配置的 `extraRoutes`。

---

## 1 · 三条移动端判据（不能只用一条）

**背景**：`scrollWidth - innerWidth > 0` 单独用会假绿。Chromium 在移动端会为溢出内容**自动扩张布局视口**——扩张之后 `scrollWidth` 和 `innerWidth` 一起变大，差值接近 0，看起来"没有溢出"，而页面实际上是按一个用户并不存在的宽度排版的。

所以三条一起查，缺一不可：

| # | 判据 | 通过条件 | 抓的是什么 |
|---|---|---|---|
| 1 | `abs(window.innerWidth - 请求宽度) <= 1` | 请求 390 就必须是 390 | 布局视口被扩张 |
| 2 | `documentElement.scrollWidth <= 请求宽度 + 1` | 不超出 | 内容真的比视口宽 |
| 3 | `scrollTo(9999, 0)` 后 `scrollX ≈ 0` | 不能横向平移 | 最终裁决：页面到底能不能左右滑 |

第 3 条是决定性的：前两条都是间接指标，只有它直接回答"用户能不能把页面滑出去"。

`tests/qa-probes.spec.ts` 里有一组测试用真实页面复现了三者各自的命中与静默，包括"裸判据接近 0 但 `innerWidth` 已经漂移"的那一类假绿。

---

## 2 · No Invisible Semantics

> **看得到 ≠ accessibility tree 看得到。**

`aria-hidden="true"` 会**剪掉整棵子树**，而屏幕上一切正常：布局没变、颜色没变、鼠标照样能点。只有屏幕阅读器和 `getByRole` 会看不到。

这正是 AI Finance 那次真实回归（K-01）的形状。当时产品为了绕过一个问题把 `aria-hidden` 加在了真实内容祖先上，视觉验收完全通过，而所有基于 role 的断言失效。

### 判据

对 `button` / `link` / `heading`，逐个比较：

```
DOM 中真正贡献语义的元素数  ==  无障碍树中该 role 的节点数
```

两边都必须排除框架开发浮层（`<nextjs-portal>`），否则比的是 Next 的调试按钮而不是你的应用。注意它藏在 shadow root 里——**`document.querySelectorAll` 穿不过 shadow 边界，无障碍树可以**。这是探针必须递归遍历 shadow root 的原因。

另外单独检查：**`aria-hidden` / `inert` 宿主里不得有可聚焦内容**。装饰性元素才允许 `aria-hidden`。

### 两条检查是互补的，任何一条单独都不够

| 检查 | 能发现 | 单独使用时的盲区 |
|---|---|---|
| role 数量对齐（DOM == AX） | 某个子树被剪掉后，两侧数量**不一致** | 剪枝会**同时**从两侧移除节点——整块内容被隐藏时两侧依然相等，判据全绿 |
| `aria-hidden` 宿主内可交互内容扫描 | 被隐藏区域里仍有真实控件 | 只覆盖 `aria-hidden` / `inert` 宿主，不看数量漂移 |

所以 **`DOM == AX` 不是「没有 Invisible Semantics」的充分条件**，它只是必要条件；真正的检测器是那条被隐藏宿主扫描。
两条必须同时跑，任何一条被删掉都会让这一类回归重新变成静默通过。

### 关于 pruned 的精确定义

| 写在祖先上 | 效果 |
|---|---|
| `aria-hidden="true"` | 剪掉整棵子树 |
| `hidden` / `inert` | 剪掉整棵子树 |
| `display:none` / `visibility:hidden` | 剪掉整棵子树 |
| `role="presentation"` / `role="none"` | **只去掉该节点自己的语义，不剪子树** |

最后一行是探针最容易写错的地方：把它当成剪枝会漏数（假通过），忽略它会误报不匹配。它必须在**候选元素自身**上判断，而不是在祖先链上。

---

## 3 · QA Probe Integrity

> **一个静默通过的探针，比没有探针更危险。**

真实事故的形状：

```js
const v = getComputedStyle(el).getPropertyValue('--x')   // 选择器没命中 → 0
Math.abs(coarse / fine - 1.5) > 0.02                      // 0/0 = NaN → 比较为 false
// → 断言通过。QA 报绿。这个特性从未被验证过。
```

NaN 与任何值的比较都是 `false`，所以"没量到"会被当成"满足条件"。

### 规则

所有数值探针必须经过 `.qa/probe-guard.mjs` 的 `measure()`：

- 首先 `Number.isFinite(value)`；
- `NaN` / `Infinity` / `undefined` / 非数字 → **fail loudly**；
- 得到 `0` 而本不应为零 → 失败（在实践中这几乎总是"选择器没命中"或"CSS 变量没在该元素上解析"，而不是真实的零）；
- 确实允许为零时显式传 `allowZero`；
- 比例类断言统一走 `expectRatio()`，让 `Math.abs(NaN - expected)` 这个坑只在一个地方被堵住。

`tests/qa-probes.spec.ts` 先复现裸比较确实会静默通过，再证明守卫会报错——两种行为都被固定下来。

> **CSS 自定义属性只在声明它的元素及其后代上可见。** 把探针挂到 `<body>` 上去读一个声明在 `.kits-grid` 上的变量，一定读到 0。这是上面那条规则最常见的触发原因。

---

## 4 · Reduced Motion / Coarse Pointer / 观察者失效

任何 Signature Component 都要经过三种状态。

| 检查 | 判据 |
|---|---|
| **reduced-motion** | `prefers-reduced-motion: reduce` 下内容完整可见；没有无限循环动画还在跑 |
| **coarse pointer** | touch 上下文下 `(pointer: coarse)` 必须命中；细指针必须不命中；粗细指针的间距/缩放比例必须有可测差异 |
| **观察者失效** | 删掉 `IntersectionObserver` 之后，内容**仍然可见** |
| **默认可见** | 不依赖任何动画/观察者，`<main>` 里就有可见文本；内容区块不得停在 `opacity: 0` |

最后两条防的是同一个失效模式：reveal-on-scroll 实现习惯把内容初始设为 `opacity: 0` 等观察者回调。观察者缺失、失败、或永远不触发时，内容就**永久不可见**——而任何"已经滚到位"的截图都看不出来。

**coarse pointer 必须是独立的 browser context**：`hasTouch` / `isMobile` 是 context 属性，不是 viewport 属性。改 `setViewportSize` 不会让 `(pointer: coarse)` 变成 true。

---

## 5 · Port Isolation

### 问题

Playwright 的 `reuseExistingServer` 会接受**任何**以 2xx/3xx 应答就绪 URL 的 HTTP server，**不做任何身份校验**。端口 3000 是 Next 的默认端口，于是：

- 一个残留的 dev server，或者同机的另一个原型，会被当成"被测应用"；
- 整套断言在**错误的页面**上通过；
- 更糟的是它不会失败——它报绿。

同机的兄弟项目已经各自规避了这一点（hub 固定 3100，finance 固定 3210），而 finance 的配置注释里**点名**了本仓库的 3000 是那个危险源。

### 规则

| 规则 | 实现 |
|---|---|
| 不复用 3000 | `.qa/qa.config.mjs` 的 `QA_PORT = 3200`（Factory 自己的槽位） |
| 不自动连接已存在的未知 server | `reuseExistingServer: false`，**永远**，不是 `!process.env.CI` |
| server 必须由当前 run 管理 | `pnpm dev --hostname ... --port ...` 显式固定端口，Next 不会自动 +1 |
| 完成后只停止自己启动的 process | `detached: true` spawn，`process.kill(-pid)` 杀**进程组** |
| 端口被占用时 fail loudly | `scripts/check-qa-port.mjs`，已接入 `pnpm test` |

### 为什么必须杀进程组

`pnpm dev` 是一层包装：杀掉 `pnpm` 进程会把真正的 `next-server` 孙子进程留成孤儿，而它仍然占着端口。第一版 QA 脚本就是这样漏的——下一次运行直接被端口守卫拦下。所以 spawn 时 `detached: true`，停止时杀掉整个进程组。

### 禁止

```bash
pkill -f "next dev"        # ✗ 会杀掉同机其它原型，甚至你自己的开发服务器
pkill -f "next-server"     # ✗ 同上
```

端口守卫在失败信息里直接写明了这一点——规则要出现在 Agent 真正会读到的地方，也就是失败现场。

---

## 6 · 其他每页检查

| 检查 | 判据 |
|---|---|
| console error | 0 |
| page error | 0 |
| request failure | 0（`requestfailed`，网络层失败也要抓，不只是 HTTP ≥ 400） |
| HTTP ≥ 400 | 0 |
| 横向溢出 | 见第 1 节 |
| 内容默认可见 | 见第 4 节 |
| **样式真的加载了** | 见第 7 节 |

---

## 7 · Style Presence —— 这一页不是一份没写 CSS 的 HTML

**背景**：第三个 Prototype 发布过一条**整页退回浏览器默认样式**的路由。App Router 按**模块图**打包 CSS：
某条路由的入口组件没有 import 那份样式表，它就永远到不了浏览器。

那个状态下：

- 不报错、不警告；
- DOM 完整——每个元素都在、每个 `data-testid` 都能找到；
- `pnpm test` 全绿、`pnpm qa` 全绿、console / 溢出 / 无障碍树全部通过。

因为**每一条检查都在问「这个元素对不对」，没有一条在问「样式加载了吗」**。

### 禁止的做法

| 做法 | 为什么不行 |
|---|---|
| `document.styleSheets.length > 0` | 根布局的样式表还在，缺的是这条路由的 |
| 检查 CSS 文件请求存在 | 200 的那个文件不一定是这一页需要的那个 |
| 只检查 CSS 变量是否声明 | 声明 ≠ 生效；变量挂错元素一定解析为空（见第 3 节） |
| `fontFamily !== ""` | **UA 默认字体也是非空字符串**。实测未加样式的页面返回 `"Times"`，不是 `""`——这条断言永远不会失败 |
| 引用某个产品专属 class | Factory 不认识任何产品 class；而且"产品自己的名字"正是必须靠猜的那种信息 |
| 注入 debug marker | 测的是 marker，不是页面 |

### 做法：和**同一个浏览器**的未加样式基线做差

扫描器在**同一个 browser context** 里渲染一份没有任何作者样式的裸文档，测同一组计算样式，然后要求被测页面在至少
`stylePresenceMinChannels` 个**互相独立的样式域**上与它不同：

| 通道 | 类别 | UA baseline（实测） | Factory baseline（实测） |
|---|---|---|---|
| `box-reset` | 几何 | `body margin 8px / 8px` | `0px / 0px` |
| `type` | 排版 | `"Times"` | `"Geist, … sans-serif"` |
| `surface` | 绘制 | `rgba(0, 0, 0, 0)` | `lab(97.9058 -0.49 …)` |
| `ink` | 绘制 | `rgb(0, 0, 0)` | `lab(4.78297 …)` |

**它是 generic 的，因为它断言的是关系而不是数值**：判据是「这一页不是浏览器默认态」，不是「body margin 必须是 0」。
不涉及任何路由名、class 名、token 名，也不假设产品画了边框（`border-width` 刻意**不在**通道里——Factory 必须支持不画边框的产品）。

**阈值是 2**，不是 4：4 会让判据依赖「产品把四个域全都画了」，一个只重置 margin + 声明字体的产品会被误杀。
也不能是 1：单个属性不同只是一条零散规则就能造成的证据强度。

### 探针本身也会坏

- 基线必须**自己**是默认态。参照物一旦被作者样式污染，之后的比较就变成「两个有样式的页面像不像」——一个没有错误答案的问题。
  所以基线 `body margin` 为 0 时**判探针故障**，不是判产品失败。
- 测量值缺失 / 非有限 / 空字符串 → **fail loudly**，不允许和「有样式」得到同一个答案。

### mutation：让它真的能红

把 `app/layout.tsx` 里的 `import "./globals.css"` 注释掉，重跑 `pnpm qa`：

| 状态 | 结果 |
|---|---|
| healthy | 4/4 通道与 baseline 不同 → PASS |
| mutated | **0/4 通道不同，整页与 UA baseline 逐项相同** → FAIL，失败点就是 `style-loaded` |
| restored | 回到 4/4 → PASS |

「只能绿不能红」的探针不算完成，所以这三个状态都跑过并记录在 v1.2 的实现报告里。

### 已知边界（写明，不掩饰）

这条探针检测的是**整页处于浏览器默认态**。它**不能**检测「根样式表加载了、只是这条路由自己的样式表没加载」——
也就是第三个 Prototype 的精确形状（`globals.css` 生效，只有 `research-shell.css` 缺失）。

任何产品无关的计算样式探针都做不到这件事：**"这条路由自己的 CSS" 按定义就是产品知识**，当时抓住它的信号也是一条产品专属断言
（`.rs-finding__section` 的 `border-bottom-width` 必须非零）。Factory 保证的是通用情形；这种产品内部的样式缺口由产品自己断言。

---

## 判据来自哪里

| 判据 | 来源 |
|---|---|
| 三条移动端判据 | 移动端 QA 假绿调查 |
| No Invisible Semantics | AI Finance K-01 回归（`aria-hidden` 剪掉真实内容祖先） |
| Probe integrity | AI Finance K-02 回归（`0/0 = NaN` 静默通过） |
| shadow DOM 感知 | Factory v1.1 首次全量扫描：每条路由都因 Next 调试浮层报 `DOM n ≠ AX n+1` |
| coarse pointer 用独立 context | 同上首次扫描：`setViewportSize` 不会改变 `(pointer: coarse)` |
| 进程组清理 | 同上首次扫描：`pnpm dev` 的孙子进程泄漏，端口被占 |
| Style Presence（第 7 节） | 第三个 Prototype：Finding 路由的样式表没进入模块图，整页退回浏览器默认态，而所有既有检查全绿 |
