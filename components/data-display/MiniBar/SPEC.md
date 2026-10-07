# MiniBar · SPEC

- id: mini-bar
- category: data-display
- source: `components/data-display/MiniBar/`（`index.tsx` / `mini-bar.module.css`）
- official-counterpart: 无。官方 `@deepseek-ai/dsh-client-ui-primitives/lib/index.js` 的导出列表里没有 MiniBar；几何逐条锚定官方既有选择器（见下）
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

逐条读作「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| 圆角 `border-radius: 999px` | `Tag.module.css` → `.tag`（胶囊几何） |
| 过渡 `transition: width 120ms ease` | `Switch.module.css` → `.thumb`（`transition: transform 120ms ease`，时长与缓动照抄） |
| 填充色 `var(--dsw-alias-state-business-primary)`（默认） | `Tag.module.css` → `.tag[data-tone='info']` 用的同一批状态主色 token（Tag 里这个 tone 叫 `info`，本组件叫 `business`）；取值见 `website/css/dsh-tokens.css` |
| `success` / `warn` / `error` 填充色 | `Tag.module.css` → `.tag[data-tone='success'\|'warning'\|'danger']` 的同批 token（`--dsw-alias-state-{success,warn,error}-primary`；Tag 里 warn 写作 `warning`） |
| 百分比文本 `font-size: 12px`、`line-height: 18px` | `Button.module.css` → `.sm` |
| 百分比文本色 `var(--dsw-alias-label-tertiary)` | `Menu.module.css` → `.label`（三级文字取色） |
| `prefers-reduced-motion: reduce` 时去掉过渡 | 做法与 `Toast.module.css` 一致（它在该媒体查询里只保留淡出） |

### 本仓库建议值（非官方数值）

- 条高 `8px`：官方没有条形图可抄。取 8px 是 4 的倍数（保持全库间距/尺寸的栅格一致），并且与列表行 32px 的行高搭配。更常见的 6px 更纤细，但不是 4 的倍数，本仓库不用；4px 在浅色轨道上太细、圆角几乎看不出来。
- 条形与百分比之间的 `gap: 8px`：4 的倍数，与相邻行的间距同值，两组件并排时不出现两套间距。
- 轨道色选 `var(--dsw-alias-border-l1)` 而不是 `var(--dsw-alias-bg-module-platform)`：前者是半透明叠加色（light `#0000000a`、dark `#ffffff0f`，见 `website/css/dsh-tokens.css`），能自适应它所在的任意表面；后者是不透明的固定表面色（light `#f9fafb`、dark `#353638`，同样见该文件），嵌在 `--dsw-alias-bg-layer-2` 卡片上时会和卡片底色对一个「近似但不相等」的灰，边缘显得脏。
  **代价要说清楚**：在浅色 `bg-layer-1` 上轨道只有约 `#f5f5f5`，非常淡。因此 MiniBar 不把「轨道可见性」当作信息载体——数值始终由 `aria-valuenow` / `aria-valuemax` 承载，需要视觉读数时加 `showPercent`。
- `overflow: hidden`（轨道）：官方没有对应写法。填充与轨道同为 999px 圆角，正常情况下不会溢出；加上它是为了防止极窄宽度下浏览器夹紧圆角时填充的方角露出来。
- `font-variant-numeric: tabular-nums`（百分比）：官方未使用该属性；多个条形纵向排列时，等宽数字让百分比列宽度不抖动。
- `aria-hidden="true"` 加在可见百分比上：`role="progressbar"` 的后代按 ARIA 规范已经是 presentational，这里显式标出是为了避免个别读屏实现把「82%」和 `aria-valuenow` 读两遍。
- 不变式：根元素即 `role="progressbar"`，`{...rest}` 先展开、计算出的 `aria-valuenow/min/max` 后写，保证这三个值永远由 `value`/`max` 推导，不会被外部 props 覆盖。

### 实现说明

实现为本仓库原创：用 CSS 变量 + `data-tone` 属性组织规则（挑色写法参照官方 Tag），几何等价但非官方 CSS 的复制。

## api

`MiniBarProps extends HTMLAttributes<HTMLDivElement>`，`forwardRef<HTMLDivElement, MiniBarProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | 必填 | 当前值；超出 `[0, max]` 会被夹紧，非有限数按 0 |
| `max` | `number` | `100` | 满值；`<= 0` 时按 0 处理，进度恒为 0 |
| `showPercent` | `boolean` | `false` | 右侧显示百分比文本（`Math.round` 取整） |
| `tone` | `'business' \| 'success' \| 'warn' \| 'error'` | `'business'` | 填充的语义色 |
| `label` | `string` | 无 | 可访问名称；未传且外部传了 `aria-label` 时取后者 |
| `aria-label` | `string` | 无 | 同 `label`，`label` 优先 |
| `className` | `string` | 无 | 与内部类名拼接 |
| 其余 | `HTMLAttributes<HTMLDivElement>` | — | 原样透传到根元素（`aria-valuenow/min/max` 会被组件覆盖） |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到根元素 |

`MiniBarTone` 为导出的类型别名。夹紧规则：`safeMax = Number.isFinite(max) && max > 0 ? max : 0`；`safeValue = Number.isFinite(value) ? value : 0`；`clamped = safeMax > 0 ? Math.min(Math.max(safeValue, 0), safeMax) : 0`。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认 | — | 轨道 `flex: 1`、填充宽度 `percent%`，根元素 `role="progressbar"` |
| 显示百分比 | `showPercent === true` | 右侧渲染取整百分比文本，`aria-hidden="true"` |
| 不显示百分比 | `showPercent === false`（默认） | 只渲染轨道与填充 |
| 色调 | `tone` | `business`（默认）/ `success` / `warn` / `error` 各自覆盖填充底色 |
| 值更新 | `value` 变化 | 填充宽度 120ms ease 过渡 |
| 减少动态 | `prefers-reduced-motion: reduce` | `.fill` 的 `transition: none` |
| 退化输入 | `max <= 0` 或非有限数 | `aria-valuemax` 为 0，进度恒为 0（`percent = 0`） |
| 越界值 | `value` 超出 `[0, max]` | 夹紧后参与计算，`aria-valuenow` 也取夹紧值，不出现非法值 |
| 无名字 | 未传 `label` 与 `aria-label` | 根元素无 `aria-label`（读屏只剩「进度条」），由调用方负责补齐 |
| 交互态 | — | 本组件无 hover / active / focus / disabled；不可聚焦、不进入 Tab 顺序 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-border-l1` — 轨道底色（本仓库选定的 token）
- `--dsw-alias-state-business-primary` — 默认填充色
- `--dsw-alias-state-success-primary` / `--dsw-alias-state-warn-primary` / `--dsw-alias-state-error-primary` — 语义填充色
- `--dsw-alias-label-tertiary` — 百分比文本色

组件级 CSS 变量（本仓库内部，不是 DSH token；定义在 `.bar`）：

- `--dsh-bar-height` = `8px`
- `--dsh-bar-gap` = `8px`

## a11y

- 必须给可访问名称：`label="缓存命中率"` 或外部传 `aria-label`。没有名字时读屏只念出「进度条 82%」，用户不知道这是什么指标。
- `role="progressbar"` 与 `aria-valuemin`（固定 0）/ `aria-valuemax` / `aria-valuenow` 三者缺一不可：读屏靠 `valuenow / valuemax` 换算百分比，只给 `valuenow` 会被当成 0–100 解释。
- `value` 会先夹紧再写入 `aria-valuenow`，不会出现 `aria-valuenow` 超出 `aria-valuemax` 的非法状态。
- `max <= 0` 时 `aria-valuemax` 为 0，这是退化输入（例如分母为 0 的比率）。此时调用方应改用 `aria-valuetext="暂无数据"`，不要把「无法计算」显示成「0%」。
- `showPercent` 的可见文本标了 `aria-hidden`，不得当作唯一数值来源；数值要么在 `aria-*` 里，要么另写一段可见文本。
- `tone` 只改颜色，颜色不是唯一线索（`AC-MF-07`）：`warn` / `error` 若表达「超标」这类必须知道的信息，请在旁边文本里也写出来。
- 条形是纯展示元素，不可聚焦、不可交互；行内其他文本保持正常 DOM 顺序，不要用 CSS `order` 打乱。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 根元素带 `role="progressbar"`，且同时输出 `aria-valuemin` / `aria-valuemax` / `aria-valuenow`。
2. `label` 与 `aria-label` 至少有一个非空，否则判违规（读屏无可访问名称）。
3. `{...rest}` 的展开位置在 `role` 与三个 `aria-value*` 之前：外部传入的 `aria-valuenow` / `aria-valuemax` / `aria-valuemin` 不得覆盖组件计算值。
4. `aria-valuenow` 的取值必须落在 `[0, aria-valuemax]` 闭区间内。
5. `max <= 0` 或非有限数时，`aria-valuemax` 输出 0、填充宽度为 0（不得为 `NaN` 或负数）。
6. `showPercent === true` 时，百分比文本节点带 `aria-hidden="true"`。
7. 填充元素声明 `transition: width 120ms ease`，且样式表包含 `@media (prefers-reduced-motion: reduce)` 分支（`MO-RC-09`，对应 `spec/70-checklist.md` 的 `A34`）。
8. 轨道与填充的 `border-radius` 均为 `999px`，轨道声明 `overflow: hidden`。
9. 百分比文本声明 `font-variant-numeric: tabular-nums`（`§ 建议值`）。
10. `tone` 只影响 `background`，不得改变高度、宽度或圆角。
11. 条形为纯展示：源码中不得出现 `tabIndex`、`onClick`、`onKeyDown`。
12. 使用处不得让颜色成为唯一线索：`tone` 为 `warn` / `error` 时，相邻必须存在可读文本说明该状态（人审，`AC-MF-07`，对应 `spec/70-checklist.md` 的 `A46`）。

## demo

- `components/data-display/MiniBar/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A34`、`A46`）
- 无障碍条款：`spec/60-accessibility.md`（`AC-MF-07`）
- 动效条款：`spec/40-motion.md`（`MO-RC-09`）
