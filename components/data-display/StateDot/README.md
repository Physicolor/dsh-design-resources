# StateDot 状态圆点

一个 10px 的圆点，用来表达「完成 / 警告 / 进行中 / 失败 / 空闲」中的一种状态。

## 是什么

- `done` / `warning` / `error` / `idle`：一个 `<span>`，外圈是同色 10% 的光环，内圈是 60%
  直径的实心核，颜色由 `data-state` 决定。
- `ongoing`：一个 10×10 viewBox 的 `<svg>`，外圈 8 个 2×2 方块跑 1s 的像素追逐动画。
- 两种形态都是 `aria-hidden="true"` 的纯装饰元素——圆点不携带可读文本。
- 零依赖，只用到 `react` 和 CSS Modules。

| `state` | 颜色 token | 语义 |
| --- | --- | --- |
| `done` | `--dsw-alias-state-success-primary` | 成功结束 |
| `warning` | `--dsw-alias-state-warn-primary` | 有警告地结束 |
| `error` | `--dsw-alias-state-error-primary` | 失败 |
| `idle` | `--dsw-alias-label-tertiary` | 没有活动（不是第四种结果） |
| `ongoing` | `--dsw-static-deepseek-450` | 进行中 |

## 什么时候用

- 列表行、时间线、步骤条左侧的状态标记：`<StateDot state="done" /> 构建成功`。
- 会话 / 任务 / 工具的运行状态：`ongoing` 表达「正在进行，还没有结论」。
- 状态需要在一列里纵向对齐、并且颜色要跟主题走的时候——圆点用 `currentColor` 派生，
  换主题不用改代码。

## 什么时候不要用

- **单独用**。组件是 `aria-hidden` 的，页面上只有圆点、没有文字时，屏幕阅读器读不到任何
  状态（见「可访问性要点」）。没有文字可配时请用 `Tag` 或带文本的 `ConnectionIndicator`。
- 表达布尔开关或可点击的选中态：那是 `Switch` / `Pill`，圆点不可交互、也不接受点击。
- 表达进度百分比：圆点只有离散状态，没有连续量。
- 表达「文件类型」：那是 `FileTypeIcon`。
- 在只有一种状态、永远不变的场景里当装饰点：那是纯装饰，用不带语义的样式即可，不必引入组件。

## 几何来源

数值全部读自官方
`@deepseek-ai/dsh-client-ui-primitives/lib/StateDot.module.css` 与同目录 `lib/index.js`
的 `function StateDot({ state, size = 10, className })`：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| 默认外径 10px（Figma 尺寸） | `lib/index.js` → `function StateDot({ state, size = 10, ... })` |
| `flex: none` | `StateDot.module.css` → `.dot`、`.matrix` |
| `position: relative`、`display: inline-block` | `StateDot.module.css` → `.dot` |
| 光环 `inset: 0`、`border-radius: 50%`、`background: currentColor`、`opacity: 0.1` | `StateDot.module.css` → `.dot::before` |
| 实心核 `inset: 20%`、`border-radius: 50%`、`background: currentColor` | `StateDot.module.css` → `.dot::after`（文件注释写明是 6/10 缩放） |
| `corner-shape: round` | `StateDot.module.css` → `.dot::before`、`.dot::after` |
| `done` → `var(--dsw-alias-state-success-primary)` | `StateDot.module.css` → `.dot[data-state='done']` |
| `warning` → `var(--dsw-alias-state-warn-primary)` | `StateDot.module.css` → `.dot[data-state='warning']` |
| `error` → `var(--dsw-alias-state-error-primary)` | `StateDot.module.css` → `.dot[data-state='error']` |
| `idle` → `var(--dsw-alias-label-tertiary)` | `StateDot.module.css` → `.dot[data-state='idle']` |
| `ongoing` → `var(--dsw-static-deepseek-450)` | `StateDot.module.css` → `.dot, .matrix { --dsh-state-ongoing: ... }`；文件顶部注释写明「ongoing 蓝在 alias 层没有对应 token，`state-business-primary` 是 500 档、不是这里的 450 档」 |
| `viewBox="0 0 10 10"`、`shape-rendering: crispEdges` | `lib/index.js` → `StateDot` 的 `ongoing` 分支 |
| 8 个 `2×2` 方块、外圈坐标 `0/4/8`、从左上起顺时针 | `lib/index.js` → `const MATRIX_CELLS`（注释：*Outer 3x3 matrix cells (2px pixels on a 10px grid), clockwise from top-left*） |
| `animation-delay = (index - 8) × 125ms`（8 格依次错开一档） | `lib/index.js` → `StateDot` 的 `ongoing` 分支里 `animationDelay` 由 `(index - MATRIX_CELLS.length) * 125` 算出 |
| `.cell` → `fill: currentColor`、`opacity: 0.15`、`animation: 1s infinite` | `StateDot.module.css` → `.cell` |
| 关键帧四段台阶 `1 / 0.6 / 0.35 / 0.15`，分界在 `0 / 12.5% / 25% / 37.5%` | `StateDot.module.css` → `@keyframes dsh-state-dot-chase` |
| 组件与 svg 均 `aria-hidden="true"` | `lib/index.js` → 两个分支 |

**本仓库建议值（非官方数值）：**

- `@media (prefers-reduced-motion: reduce)` 分支：官方 `StateDot.module.css` 完全没有这条分支。
  本仓库补上，取 `animation: none` + 全部格子停在中间档 `opacity: 0.6`。
  理由：`spec/40-motion.md` 的 `MO-MF-09` 是强制项（判定方式就是「样式表中不含
  `prefers-reduced-motion` 即违规」），而追逐动画属于该条所说的「非必要的持续运动」；
  停掉动画后 ongoing 仍能靠「方块矩阵的形状 + 蓝色」与其余四个状态区分（`AC-MF-07` 不靠动画承载信息）。
- 关键帧名改用 `dsh-design-state-dot-chase`（官方叫 `dsh-state-dot-chase`）：**这不是数值建议，
  是命名决策**。理由是同一页面上若同时加载官方主题与本仓库源码，同名关键帧会互相覆盖；
  取值逐条与官方一致。

实现为本仓库原创：几何由组件级变量（`--dsh-statedot-ongoing`）承载、规则重新组织、
关键帧改名，数值与官方等价但不是官方 CSS 的复制。

## 可访问性要点

- **圆点必须配文字，否则屏幕阅读器读不到状态。** 组件两个分支都硬编码了
  `aria-hidden="true"`，状态信息对辅助技术完全不可见。正确写法是让文字承担语义：
  `<span><StateDot state="error" /> 构建失败</span>`；只有圆点没有文字的用法是缺陷。
- 状态**不能只靠颜色表达**（`spec/60-accessibility.md` 的 `AC-MF-07`）。转成灰度后
  `done` 的绿与 `idle` 的灰可能接近，所以文字里要写清结果（「成功」「失败」「进行中」），
  而不是只给一个圆点。
- `ongoing` 的动画是无限循环：它被允许，因为 `spec/40-motion.md` 的 `MO-MF-07`
  只放行「表达正在进行的进程」的循环动画——圆点表达的正是这个。其余状态不得加循环动画。
- `size` 只改外径，不改内圈比例（`::after` 的 `inset: 20%` 是百分比）。
  官方默认 10px 是 Figma 尺寸；放大到 12–16px 用于行首时请自行确认与同行文字的行高对齐，
  官方没有给出 10px 以外尺寸的用例。
- `idle` 用 `--dsw-alias-label-tertiary`：它是三级文字色，在 `bg-layer-1/2` 上的非文本对比度
  约与正文辅助文字同级。把 `idle` 圆点放在更浅或更深的底色上时请复核对比度
  （`AC-MF-06` 建议非文本元素 ≥3:1）。
