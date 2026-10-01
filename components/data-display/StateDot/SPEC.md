# StateDot · SPEC

- id: state-dot
- category: data-display
- source: `components/data-display/StateDot/`（`index.tsx` / `state-dot.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/StateDot.module.css` 与同目录 `lib/index.js` 的 `function StateDot({ state, size = 10, className })`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

逐条读作「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| 默认外径 `10px`（Figma 尺寸） | `lib/index.js` → `function StateDot({ state, size = 10, ... })` |
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

### 本仓库建议值（非官方数值）

- `@media (prefers-reduced-motion: reduce)` 分支：官方 `StateDot.module.css` 完全没有这条分支。
  本仓库补上，取 `animation: none` + 全部格子停在中间档 `opacity: 0.6`。
  理由：`spec/40-motion.md` 的 `MO-MF-09` 是强制项（判定方式就是「样式表中不含
  `prefers-reduced-motion` 即违规」），而追逐动画属于该条所说的「非必要的持续运动」；
  停掉动画后 ongoing 仍能靠「方块矩阵的形状 + 蓝色」与其余四个状态区分（`AC-MF-07` 不靠动画承载信息）。
- 关键帧名改用 `dsh-design-state-dot-chase`（官方叫 `dsh-state-dot-chase`）：**这不是数值建议，
  是命名决策**。理由是同一页面上若同时加载官方主题与本仓库源码，同名关键帧会互相覆盖；
  取值逐条与官方一致。

### 实现说明

实现为本仓库原创：几何由组件级变量（`--dsh-statedot-ongoing`）承载、规则重新组织、关键帧改名，数值与官方等价但不是官方 CSS 的复制。

## api

`StateDotProps`，`forwardRef<StateDotRef, StateDotProps>`；`StateDotRef = HTMLSpanElement | SVGSVGElement`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `state` | `'done' \| 'warning' \| 'ongoing' \| 'error' \| 'idle'` | 必填 | 要表达的状态；`ongoing` 渲染方块矩阵，其余渲染实心圆点 |
| `size` | `number` | `10` | 外径（px）；光环与实心核按比例缩放（`inset: 20%`） |
| `className` | `string` | 无 | 额外的布局类名，由调用方决定外边距、对齐等 |
| `ref` | `Ref<StateDotRef>` | 无 | 圆点形态透传 `<span>`，矩阵形态透传 `<svg>` |

`StateDotState` / `StateDotRef` 为导出的类型别名。本组件不接 `...rest`，除上述三个属性外不接受其它 props。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| `done` | `state="done"` | `<span aria-hidden="true">`，`width` / `height` 取 `size`，颜色 `--dsw-alias-state-success-primary` |
| `warning` | `state="warning"` | 同上，颜色 `--dsw-alias-state-warn-primary` |
| `error` | `state="error"` | 同上，颜色 `--dsw-alias-state-error-primary` |
| `idle` | `state="idle"` | 同上，颜色 `--dsw-alias-label-tertiary`（三种结果色之外的「没有活动」） |
| `ongoing` | `state="ongoing"` | `<svg>` + `data-state="ongoing"`，`viewBox="0 0 10 10"`，8 个 `2×2` 方块跑 1s 无限追逐动画 |
| 减少动态 | `prefers-reduced-motion: reduce` | `.cell` 的 `animation: none`，全部格子停在 `opacity: 0.6`（`§ 建议值`） |
| 尺寸 | `size` | 外径 = `size`；内圈比例不变（`::after` 的 `inset: 20%` 是百分比） |
| 装饰性 | 全部状态 | 组件与 `<svg>` 均硬编码 `aria-hidden="true"`，不进入无障碍树 |
| 交互态 | — | 无 hover / active / focus / disabled；不可聚焦、不进入 Tab 顺序 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-state-success-primary` — `done`
- `--dsw-alias-state-warn-primary` — `warning`
- `--dsw-alias-state-error-primary` — `error`
- `--dsw-alias-label-tertiary` — `idle`
- `--dsw-static-deepseek-450` — `ongoing`（static 色阶；官方注释说明 alias 层的 `state-business-primary` 是 500 档）

组件级 CSS 变量（本仓库内部，不是 DSH token；定义在 `.dot` / `.matrix`）：

- `--dsh-statedot-ongoing` = `var(--dsw-static-deepseek-450)`

## a11y

- 两个分支都硬编码 `aria-hidden="true"`：状态信息对辅助技术完全不可见，必须由旁边的文字承担语义（`<span><StateDot state="error" /> 构建失败</span>`）。只有圆点没有文字的用法是缺陷。
- 状态不得只靠颜色表达（`AC-MF-07`）：转成灰度后 `done` 的绿与 `idle` 的灰可能接近，文字里要写清结果，而不是只给一个圆点。
- `ongoing` 的无限循环动画被 `MO-MF-07` 放行（该条只允许「表达正在进行的进程」的循环动画）；其余四个状态不得加循环动画。
- `size` 只改外径，不改内圈比例。官方默认 10px；放大到 12–16px 用于行首时需自行确认与同行文字的行高对齐，官方没有给出 10px 以外尺寸的用例。
- `idle` 用 `--dsw-alias-label-tertiary`：它是三级文字色，在 `bg-layer-1/2` 上的非文本对比度约与正文辅助文字同级。把 `idle` 圆点放在更浅或更深的底色上时需复核对比度（`AC-MF-06` 建议非文本元素 ≥3:1）。
- 减少动态时动画被停掉，但 ongoing 仍能靠「方块矩阵的形状 + 蓝色」与其余四态区分，信息不依赖动画（`AC-MF-07`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 圆点分支与矩阵分支都输出 `aria-hidden="true"`。
2. `state === 'ongoing'` 时渲染 `<svg>`，`viewBox` 为 `0 0 10 10`，并含 8 个 `2×2` 的 `<rect>`。
3. 矩阵方块的 `animationDelay` 为 `(index - 8) * 125`（单位 ms），不是固定值。
4. 其余四个状态的 `data-state` 与 `state` 一致，且颜色映射唯一对应 `success` / `warn` / `error` / `label-tertiary` 四类 token。
5. `ongoing` 的蓝色取自 `--dsw-static-deepseek-450`，不得改用 `--dsw-alias-state-business-primary`。
6. 样式表包含 `@media (prefers-reduced-motion: reduce)` 分支，且该分支下 `.cell` 的 `animation` 为 `none`（`MO-MF-09`，对应 `spec/70-checklist.md` 的 `A34`）。
7. 关键帧名为 `dsh-design-state-dot-chase`，不得使用官方的 `dsh-state-dot-chase`（避免同名覆盖）。
8. 关键帧四段台阶为 `1 / 0.6 / 0.35 / 0.15`，分界在 `0 / 12.5% / 25% / 37.5%`。
9. 除 `ongoing` 外，任何状态都不得声明 `animation` 或 `@keyframes`（`MO-MF-07`）。
10. `.dot::after` 的 `inset` 为 `20%`（百分比，保证缩放时内圈比例不变），不得写成固定 px。
11. 组件不接受 `...rest` 透传，源码中不得出现将其它 props 铺到根元素上的写法。
12. 状态不得只靠颜色：使用处必须有相邻的可读文本（人审，`AC-MF-07`，对应 `spec/70-checklist.md` 的 `A46`）。

## demo

- `components/data-display/StateDot/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A32`、`A34`、`A46`）
- 动效条款：`spec/40-motion.md`（`MO-MF-07`、`MO-MF-09`）
- 无障碍条款：`spec/60-accessibility.md`（`AC-MF-06`、`AC-MF-07`）
