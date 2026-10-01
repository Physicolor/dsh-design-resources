# Stepper · SPEC

- id: stepper
- category: controls
- source: `components/controls/Stepper/`（`index.tsx` / `stepper.module.css`）
- official-counterpart: 官方没有此控件。几何逐条借用官方 `Input.module.css` / `Button.module.css` / `Menu.module.css` 的选择器（见下）
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

外壳与状态色全部来自官方 CSS，本仓库没有这两个组件的官方对应物，所有几何都是「官方锚点 + 建议值」拼装。写法为「数值 ← 文件名 选择器」。

| 数值 ← 文件名 选择器 |
| --- |
| `height: 32px` / `padding: 0 8px` / `gap: 6px` ← `Input.module.css` `.wrap` |
| `border: 0.5px solid var(--dsw-alias-border-l4)` / `border-radius: 8px` ← `Input.module.css` `.wrap` |
| `background: var(--dsw-alias-bg-layer-1)` ← `Input.module.css` `.wrap` |
| `:focus-within { border-color: var(--dsw-alias-brand-primary) }` ← `Input.module.css` `.wrap:focus-within` |
| `font-size: 14px` / `line-height: 22px` / `color: var(--dsw-alias-label-primary)` ← `Input.module.css` `.input`（本组件在 `.field` 上用 `color: inherit` 继承外壳同名 token） |
| 图标容器 `16×16` ← `Button.module.css` `.icon`；`Input.module.css` `.icon` 同值 |
| hover 底色 `--dsw-alias-interactive-bg-hover` ← `Button.module.css` `.ghost:hover`（`Pill.module.css` `.interactive:hover` 同值） |
| active 底色 `--dsw-alias-interactive-bg-active` ← `Button.module.css` `.ghost:active` |
| `cursor: not-allowed` / `opacity: 0.4` ← `Button.module.css` `.button:disabled` |
| 按钮字形色 `var(--dsw-alias-label-primary)` ← `Button.module.css` `.button` |
| 禁用态文字 `var(--dsw-alias-label-tertiary)` ← `Menu.module.css` `.label` 与 `Input.module.css` `.icon` 使用的三级文字 token（`CT-MF-09` 指定） |
| `display: inline-flex` / `align-items: center` ← `Input.module.css` `.wrap`；`.icon` 的 `align-items` / `justify-content` 居中 ← `Button.module.css` `.icon` |

### 本仓库建议值（非官方数值）

官方没有这些数值，逐条给理由。

| 数值 | 理由 |
| --- | --- |
| 加减按钮 `28×28` | 官方未定义步进器按钮尺寸。[HIG] 常规控件命中区 28×28（`spec/60-accessibility.md` `AC-MF-01` / `AC-MF-04`）；外壳内容高 31px（32 − 0.5×2），28×28 正好放得下且不与外壳冲撞。不用 32×32：会顶满外壳高度，边缘没有余量。 |
| 加减按钮 `border-radius: 8px` | 外壳官方圆角就是 r8（`Input.module.css` `.wrap`），内件取同值，避免引入官方尺度表之外的 r10/r12（`TK-MF-03`）。 |
| 数字区 `width: 40px` | 官方 `Input.module.css` `.input` 是 `flex: 1`，在固定宽度的步进器里需要显式宽度。40px 是 4 的倍数，按 14px 字号下等宽数字每字不超过 0.7em（≈10px）估算可容纳 4 位数字。宿主需要更宽时用 `className` 覆盖。 |
| `font-variant-numeric: tabular-nums` | 等宽数字，加减时读数不横向跳动。官方在 CSS 里没有这条（它的输入框是自由文本）。 |
| `text-align: center` | 步进器的通行读数方式；官方 Input 未规定对齐（自由文本默认左对齐，不适用于此形态）。 |
| 焦点环 `outline: 2px solid var(--dsw-alias-brand-primary)`，偏移 `0` | 官方 `Button.module.css` 没有焦点样式，`AC-MF-10` / `AC-MF-11` 要求可见焦点环。偏移取 0 而非规范建议的 2px：外壳内容高只有 31px、按钮 28px，2px 外偏移会把焦点环画到外壳边框之外；0 偏移时环恰好落在外壳内（28 + 2×2 = 32 = 外壳高度）。 |
| 输入框也补 2px 焦点环 | 官方 `Input.module.css` 只用 `.wrap:focus-within` 的 `border-color` 变色表达焦点；0.5px 细线变色在浅色与深色主题下都偏弱，故额外补环（保留官方的 `border-color` 变色）。同样取 `outline-offset: 0`，理由同上。 |
| 数字区 `border-radius: var(--dsh-stepper-radius)`（即 r8） | 焦点环跟随圆角，与外壳同值；官方 Input 未定义数字区的独立圆角。 |

### 实现说明

- 本仓库实现为原创：几何由 `.wrap` 上的组件级 CSS 变量承载（`--dsh-stepper-height` / `--dsh-stepper-pad-x` / `--dsh-stepper-gap` / `--dsh-stepper-radius` / `--dsh-stepper-button` / `--dsh-stepper-icon` / `--dsh-stepper-button-radius` / `--dsh-stepper-field-width`），未复制官方 CSS 源码。
- `--dsh-stepper-*` 是本仓库内部变量，不是 DSH token。
- 加减图标为内联 SVG（`viewBox="0 0 16 16"`，`fill="currentColor"`，横竖条同为 1.6 单位粗）；`16×16` 图标容器取自官方 `Button.module.css` `.icon`（对应 `IC-MF-01` 的官方尺寸族）。

## api

`StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'aria-label' | 'children'>`，`forwardRef<HTMLInputElement, StepperProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | 必填 | 当前值，受控；组件自己不保存已提交的值 |
| `onChange` | `(value: number) => void` | 必填 | 值变化回调；收到的值一定已按 `min` / `max` 收敛，并按 `step` 或当前值中更细的小数位取整（消除浮点误差） |
| `min` | `number` | 无 | 下界（含）。到界时减号按钮变为 `disabled` |
| `max` | `number` | 无 | 上界（含）。到界时加号按钮变为 `disabled` |
| `step` | `number` | `1` | 每次加减的步长；非正数或非有限数按 `1` 处理 |
| `disabled` | `boolean` | `false` | 整组禁用：两个按钮与输入框都不可交互 |
| `aria-label` | `string` | 必填 | 可访问名称，落在内部数字输入框（`role="spinbutton"`）上 |
| `decreaseLabel` | `string` | `'减少'` | 减号按钮的可访问名称 |
| `increaseLabel` | `string` | `'增加'` | 加号按钮的可访问名称 |
| `id` | `string` | 无 | 数字输入框的 `id`，给外部 `<label htmlFor>` 用；外壳 `<div>` 不带 `id` |
| 其余 | `HTMLAttributes<HTMLDivElement>` | — | 透传到外壳 `<div>` |
| `ref` | `Ref<HTMLInputElement>` | 无 | 透传到内部数字输入框 |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认 | `.wrap` | 描边 `0.5px solid var(--dsw-alias-border-l4)`；底色 `--dsw-alias-bg-layer-1`；文字 `--dsw-alias-label-primary` |
| 聚焦 | `.wrap:focus-within` 与 `.field:focus-visible` | 外壳 `border-color: var(--dsw-alias-brand-primary)`；数字区另有 2px 焦点环、偏移 0 |
| 按钮 hover | `.button:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-hover)` |
| 按钮 active | `.button:active:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-active)` |
| 按钮 focus-visible | `.button:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 0` |
| 到达下界 | `min` 有值且 `value <= min`，或整组 `disabled` | 减号按钮渲染为原生 `disabled`（`cursor: not-allowed` + `opacity: 0.4`） |
| 到达上界 | `max` 有值且 `value >= max`，或整组 `disabled` | 加号按钮渲染为原生 `disabled` |
| 整组禁用 | `disabled` | 外壳带 `data-disabled`（`cursor: not-allowed`）；数字区文字降为 `--dsw-alias-label-tertiary`（`CT-MF-09`，不靠整体降透明度） |
| 编辑草稿 | 输入能在界内解析时立即提交；越界或空值留在 `draft`，失焦或 Enter 时收敛 | 显示值 = `draft ?? String(value)`；`Escape` 丢弃草稿 |
| 键盘 | `.field` 上 `ArrowUp` / `ArrowDown` / `Enter` / `Escape` | `↑` `↓` 各走一格（`preventDefault`）；`Enter` 提交草稿；`Escape` 丢弃草稿 |
| 非法输入 | 不匹配 `^-?\d*\.?\d*$` 的按键 | 直接丢弃，不进入 `draft` |
| 减弱动效 | — | 组件不含过渡与动画，无 `prefers-reduced-motion` 分支 |

## tokens

DSH 语义 token：

- `--dsw-alias-border-l4` — 外壳描边色
- `--dsw-alias-bg-layer-1` — 外壳底色
- `--dsw-alias-brand-primary` — 聚焦描边色与焦点环颜色
- `--dsw-alias-label-primary` — 外壳文字与按钮字形色
- `--dsw-alias-label-tertiary` — 整组禁用时的数字文字色
- `--dsw-alias-interactive-bg-hover` — 按钮悬停底色
- `--dsw-alias-interactive-bg-active` — 按钮按下底色

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-stepper-height`（`32px`）
- `--dsh-stepper-pad-x`（`8px`）
- `--dsh-stepper-gap`（`6px`）
- `--dsh-stepper-radius`（`8px`）
- `--dsh-stepper-button`（`28px`）
- `--dsh-stepper-button-radius`（`8px`，本仓库建议值）
- `--dsh-stepper-field-width`（`40px`，本仓库建议值）
- `--dsh-stepper-icon`（`16px`）

## a11y

- `aria-label` 是必填 prop，落在内部数字输入框上；外部若另有 `<label>`，用 `id` 关联，不要让两处名字打架（读屏会以 `<label>` 为准）。
- 数字输入框为 `role="spinbutton"` + `aria-valuenow` / `aria-valuemin` / `aria-valuemax`；`min` / `max` 未传时对应属性不下发，读屏不会报出一个假的边界。输入框 `type="text"` + `inputMode="numeric"` + `autoComplete="off"`。
- 「−」/「+」是纯图标按钮，各自带 `aria-label`（`decreaseLabel` / `increaseLabel`，默认「减少」「增加」）；图标本身 `aria-hidden`，避免读两遍。多语言站点请显式传入本地化文案（`AC-MF-14`）。
- 边界即禁用：到 `min` / `max` 时按钮是真的 `disabled`（不是 `aria-disabled`），焦点与点击都被拦住，读屏也会播报为不可用。
- 键盘可达：两个按钮是原生 `<button type="button">`，`Tab` 可到、`Enter` / `Space` 可触发，且不会在 `<form>` 里意外提交；数字区支持 `↑` / `↓` / `Enter` / `Esc`。
- 焦点环用 `outline` 而非 `box-shadow`，不会被父级 `overflow: hidden` 裁掉（`AC-MF-12`）；数字区的环偏移为 0（本仓库建议值，理由见 `geometry-source`）。
- 命中区：按钮 28×28，达到 `AC-MF-01` 的常规控件目标；数字区高度随外壳内容高 31px。
- 已知限制（照实说）：单击「+」后焦点留在按钮上，屏幕阅读器**不会**自动播报新的数值（数值变的是另一个元素）。需要播报的宿主请自行在外部加一个 `aria-live="polite"` 区域显示当前值；本组件不内置，以免与宿主的播报策略重复。
- 已知取舍：数字区在每次合法输入后立即回写受控值，数字被规范化时（例如手输 `007` 变成 `7`）光标会跳到末尾。宁可规范化，也不要让显示值与 `value` 长期不一致。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `aria-label` 为必填属性，最终落在内部数字输入框上，不允许为空字符串。
2. 数字输入框的 `role="spinbutton"` 与 `aria-valuenow` 同时存在；`aria-valuemin` / `aria-valuemax` 只在传了 `min` / `max` 时下发。
3. `min` 有值且 `value <= min` 时减号按钮为原生 `disabled`；`max` 有值且 `value >= max` 时加号按钮为原生 `disabled`。
4. 两个按钮均为原生 `<button type="button">`，各带非空 `aria-label`，图标节点 `aria-hidden`。
5. `onChange` 收到的值必定落在 `[min, max]` 内，且小数位不超过 `step` 与当前值中更细者。
6. `step` 传非正数或非有限数时按 `1` 处理。
7. 输入框只接受匹配 `^-?\d*\.?\d*$` 的中间态，其余按键不改变 `draft`。
8. 数字区为等宽数字（`font-variant-numeric: tabular-nums`）且居中（本仓库建议值）。
9. 外壳与按钮存在 `:focus-visible` 焦点样式，且不以 `outline: none` 移除后无替代（`AC-MF-10`）。
10. 焦点环规格为 2px 实线 + `--dsw-alias-brand-primary`；数字区与按钮的偏移均为 0（本仓库建议值，`AC-MF-11` 的 2px 外偏移在此因外壳高度不足而改为 0）。
11. 整组禁用时数字文字降为 `--dsw-alias-label-tertiary`，不用整体降低不透明度代替（`CT-MF-09`）。
12. 加减按钮为 28×28，不小于 `AC-MF-01` 的 20×20，且达到常规控件目标 28×28。
13. 图标容器固定 16×16 且 `flex: none`，SVG 使用 `currentColor`、不写死宽高（`IC-MF-08`、`IC-MF-12`）。
14. 组件不含过渡与动画，因此没有需要 `prefers-reduced-motion` 覆盖的位移（`MO-MF-09` 的适用前提不成立）。

## demo

- `components/controls/Stepper/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A16`、`A18`、`A19`、`A36`、`A40`、`A43`、`A44`、`A47`、`A48`、`A49`）
