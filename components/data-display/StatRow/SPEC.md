# StatRow · SPEC

- id: stat-row
- category: data-display
- source: `components/data-display/StatRow/`（`index.tsx` / `stat-row.module.css`）
- official-counterpart: 无。官方 `@deepseek-ai/dsh-client-ui-primitives/lib/index.js` 的导出列表里没有 StatRow；几何逐条锚定官方既有选择器（见下）
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

逐条读作「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| 标签 `font-size: 13px`、`line-height: 24px` | `DisclosureRow.module.css` → `.title` |
| 标签色 `var(--dsw-alias-label-secondary)` | `DisclosureRow.module.css` → `.title` |
| 数值 `font-size: 14px`、`line-height: 22px` | `Button.module.css` → `.button` |
| 数值色 `var(--dsw-alias-label-primary)` | `Button.module.css` → `.button` |
| 单位与变化量 `font-size: 12px`、`line-height: 18px` | `Button.module.css` → `.sm` |
| 单位与变化量色 `var(--dsw-alias-label-tertiary)` | `Menu.module.css` → `.label`（同为三级文字的取色） |
| 分隔线 `border-top: 0.5px solid var(--dsw-alias-border-l2)` | `markdown/MarkdownText.module.css` → `.markdown hr`（`height: 0.5px` + `background: var(--dsw-alias-border-l2)`） |
| 变化量色 `--dsw-alias-state-{success\|warn\|error}-primary` | `Tag.module.css` → `.tag[data-tone='success'\|'warning'\|'danger']` 用的同批状态主色 token；取值见 `website/css/dsh-tokens.css` |

`DisclosureRow.module.css` 的 `.title` 把字号写成 `var(--dsh-content-font-size-secondary, 13px)`、行高写成 `calc(24px + var(--dsh-content-font-delta, 0px))`；本组件取字体偏好默认值（delta = 0）后的 13/24，不实现该偏好联动。

### 本仓库建议值（非官方数值）

- `min-height: 32px`：**数值**来自官方 `Input.module.css` 的 `.wrap`（`height: 32px`），但把它用作指标行行高是本仓库决定——让指标行与表单控件同高，成列时节奏一致；同时是 4 的倍数。
- `.row` 的 `gap: 8px`、`.valueGroup` 的 `gap: 4px`、`.valueGroup` 的 `margin-left: auto`：官方没有行内间距可抄，取 4 的倍数（8px = 4×2，4px = 4×1）。8px 是标签与数值之间「同组但可区分」的最小距离；`margin-left: auto` 实现右对齐，不引入额外数值。
- `font-variant-numeric: tabular-nums`（数值 / 单位 / 变化量）：官方文件未使用该属性。多行指标纵向排列时，比例数字会让小数点位置左右跳动；等宽数字消除抖动。用属性而非数值，不影响几何。
- 变化量色：官方没有「变化量」这个概念，本仓库把状态主色 token 复用为涨跌语义。默认 `neutral` → `--dsw-alias-label-tertiary`（无好坏倾向），涨/跌由调用方通过 `deltaTone` 指定，不在这里假定「涨=好」。
- `divider` 画在**行上方**（`border-top`）：官方 `.markdown hr` 是一条独立横线，没有「行分隔」写法，本仓库选上边框以便用「除第一行外都加」的简单规则。

### 实现说明

实现为本仓库原创：用 CSS 变量 + 单个 `data-divider` 属性组织规则，几何等价但非官方 CSS 的复制。

## api

`StatRowProps extends HTMLAttributes<HTMLDivElement>`，`forwardRef<HTMLDivElement, StatRowProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `label` | `ReactNode` | 必填 | 左侧标签，例如「缓存命中率」 |
| `value` | `ReactNode` | 必填 | 右侧数值，例如 `92.4` |
| `unit` | `ReactNode` | 无 | 数值单位，以更小字号贴在数值右侧 |
| `delta` | `ReactNode` | 无 | 变化量文本；调用方需自带 `+` / `-` 符号 |
| `deltaTone` | `'success' \| 'danger' \| 'warn' \| 'neutral'` | `'neutral'` | 变化量色调 |
| `divider` | `boolean` | `false` | 是否在本行上方画一条 hairline |
| `className` | `string` | 无 | 与内部类名拼接，供外部布局使用 |
| 其余 | `HTMLAttributes<HTMLDivElement>` | — | 原样透传到根元素 |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到根元素 |

`StatRowDeltaTone` 为导出的类型别名。`label` 与 `value` 无默认值、无校验，传空值时仍会渲染空文本节点。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 基础行 | `label` + `value` | 根元素 `display: flex` + `align-items: center`，数值组靠 `margin-left: auto` 顶到右侧 |
| 带单位 | `unit != null` | 单位以 12/18 渲染在数值右侧，两者基线对齐、间隔 4px |
| 带变化量 | `delta != null` | 变化量渲染在数值组之后，`flex: none` |
| 变化量色调 | `deltaTone` | `neutral` → `--dsw-alias-label-tertiary`；`success` → `--dsw-alias-state-success-primary`；`warn` → `--dsw-alias-state-warn-primary`；`danger` → `--dsw-alias-state-error-primary` |
| 分隔线 | `divider === true` | 根元素承载 `data-divider='true'`，`border-top: 0.5px solid var(--dsw-alias-border-l2)` |
| 无分隔线 | `divider === false`（默认） | 不输出 `data-divider`，不画线 |
| 交互态 | — | 本组件无 hover / active / focus / disabled；不可聚焦、不进入 Tab 顺序 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-secondary` — 标签文字色
- `--dsw-alias-label-primary` — 数值文字色
- `--dsw-alias-label-tertiary` — 单位、变化量默认（`neutral`）色
- `--dsw-alias-border-l2` — 分隔线颜色
- `--dsw-alias-state-success-primary` / `--dsw-alias-state-warn-primary` / `--dsw-alias-state-error-primary` — 变化量语义色

组件级 CSS 变量（本仓库内部，不是 DSH token；定义在 `.row`）：

- `--dsh-statrow-min-height` = `32px`
- `--dsh-statrow-gap` = `8px`

## a11y

- 读屏顺序为「标签 → 数值 → 单位 → 变化量」，与视觉顺序一致（数值组在 DOM 中位于标签之后）。源码中不得用 CSS `order` 或反向 `flex-direction` 打乱视觉顺序。
- 标签与数值是两个独立文本节点，屏幕阅读器会连读成「缓存命中率 92.4 %」；这是期望读法，因此不要给行加 `aria-label`（会覆盖内部更细的文本）。
- `delta` 只通过 `deltaTone` 改颜色，颜色不得是涨跌方向的唯一线索（`AC-MF-07`）。符号必须由 `delta` 文本自带。
- 数值必须是纯文本（`value="92.4"`），不得传纯图标或图片；图标对读屏没有可读名称。
- 纯展示元素：不设 `tabIndex`、不绑定点击；需要跳转时由调用方在外部包 `<a>` 或 `<button>`，并把整行文本作为其可访问名称。
- 行高 32px，高于 `AC-MF-01` 的常规控件目标 28×28；但本组件不产生命中区（不可交互）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 根元素为 `<div>`，且 `label` 与 `value` 均在同一行内渲染（标签在数值组之前）。
2. 源码中不存在用于该行的 `order` / `flex-direction: row-reverse`，DOM 顺序与视觉顺序一致。
3. 根元素不输出 `tabIndex`、不绑定 `onClick` / `onKeyDown`（纯展示）。
4. 未传 `aria-label` 时，全部可见文本仍能表达该行含义；源码不得主动为根元素注入 `aria-label`。
5. 数值、单位、变化量三个类均声明 `font-variant-numeric: tabular-nums`（`§ 建议值`）。
6. `deltaTone` 只影响 `color`，不得影响字号、字重、位置。
7. `delta` 存在时，文本中必须含 `+` 或 `-`（或等义的方向词）；仅靠颜色区分涨跌判违规（`AC-MF-07`，对应 `spec/70-checklist.md` 的 `A46`，半自动）。
8. `divider === false` 时不得输出 `data-divider`；`divider === true` 时 `border-top` 宽度为 `0.5px`、颜色为 `--dsw-alias-border-l2`。
9. `value` / `unit` / `delta` 的渲染顺序固定为「数值 → 单位 → 变化量」，不得调换。
10. 行高 `min-height` 为 `32px`（`§ 建议值`），且取自 `--dsh-statrow-min-height`，不得写死为字面量。
11. 同一组指标行里 `unit` 的写法保持一致：要么每行都带单位，要么都不带；把单位混写进 `label`（例如「首字延迟（毫秒）」）判为不一致（人审，见 `README.md`「怎么用得好」）。

## demo

- `components/data-display/StatRow/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A46`）
- 无障碍条款：`spec/60-accessibility.md`（`AC-MF-07`）
