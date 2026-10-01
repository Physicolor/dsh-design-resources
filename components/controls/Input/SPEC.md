# Input · SPEC

- id: input
- category: controls
- source: `components/controls/Input/`（`index.tsx` / `input.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Input.module.css` 与 `lib/index.js` 的 `function Input`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 `Input.module.css`，写法为「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| `height: 32px` / `padding: 0 8px` / `gap: 6px` / `border-radius: 8px` | `Input.module.css` → `.wrap` |
| `border: 0.5px solid var(--dsw-alias-border-l4)` / `background: var(--dsw-alias-bg-layer-1)` / `display: inline-flex` / `align-items: center` | `Input.module.css` → `.wrap` |
| `border-color: var(--dsw-alias-brand-primary)` | `Input.module.css` → `.wrap:focus-within` |
| `width: 16px` / `height: 16px` / `align-items: center` / `justify-content: center` / `color: var(--dsw-alias-label-tertiary)` | `Input.module.css` → `.icon` |
| `flex: 1` / `min-width: 0` / `border: none` / `outline: none` / `background: transparent` | `Input.module.css` → `.input` |
| `font-size: 14px` / `line-height: 22px` / `color: var(--dsw-alias-label-primary)` | `Input.module.css` → `.input` |
| `color: var(--dsw-alias-label-dimmed)` | `Input.module.css` → `.input::placeholder` |
| 结构：外壳 `<span class=wrap>`，有 `icon` 时先插一个 `<span class=icon>`，随后是 `<input class=input>`，其余属性全部展开到 `<input>` 上 | `lib/index.js` → `function Input({ icon, className, ...rest })` |

### 本仓库建议值（非官方数值）

- `.wrap:has(.input:disabled) { opacity: 0.4; cursor: not-allowed; }`：官方 `Input.module.css` 完全没有 disabled 视觉，禁用的输入框看起来和可用的一模一样，用户会先点一下才发现不能用。两个取值都直接沿用官方 `Button.module.css` 的 `.button:disabled`（`cursor: not-allowed` + `opacity: 0.4`），让「禁用 = 0.4」成为全库同一条读法。依赖 `:has()`（Chrome 105+ / Safari 15.4+ / Firefox 121+）；需要兼容更老的运行时，由调用方在外壳上加一个 class。
- `.icon` 上的 `flex: none`：官方只写了 `display: inline-flex` + 16×16。容器没有收缩约束时，长内容可能把图标压扁；`flex: none` 锁住 16×16。
- `.input` 上的 `font-family: inherit`：官方未声明。`<input>` 不会从祖先继承字体，不写的话浏览器会用系统默认字体，和页面其余文字不一致。
- `.wrap` 上的 `box-sizing: border-box`：官方未声明。外壳有 `0.5px` 边框，没有 `border-box` 时实际高度会多出 1px。

### 实现说明

- 本仓库实现为原创：几何由 `.wrap` 上的组件级 CSS 变量承载（`--dsh-input-height` / `--dsh-input-pad-x` / `--dsh-input-gap` / `--dsh-input-radius` / `--dsh-input-icon-size` / `--dsh-input-font-size` / `--dsh-input-line-height`），结构为外壳 / 图标 / 输入三段式。
- `--dsh-input-*` 是本仓库内部变量，不是 DSH token。
- `ref` 透传到内部原生 `<input>`（不是外壳），`ref.current.focus()` 与 `selectionStart` 都可用。

## api

`InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>`，`forwardRef<HTMLInputElement, InputProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `icon` | `ReactNode` | 无 | 可选前置图标节点，放进 16×16 图标容器；传 `null` / `undefined` 时容器整个不渲染 |
| `className` | `string` | 无 | 追加到**外层容器**的 class，用于外部布局定位 |
| 其余 | `InputHTMLAttributes<HTMLInputElement>` | — | `value` / `onChange` / `placeholder` / `type` / `disabled` / `readOnly` / `autoFocus` / `onKeyDown` / `aria-*` 等原样透传到内部 `<input>` |
| `ref` | `Ref<HTMLInputElement>` | 无 | 透传到内部 `<input>` |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认 | `.wrap` | 描边 `0.5px solid var(--dsw-alias-border-l4)`；底色 `var(--dsw-alias-bg-layer-1)`；圆角 8px |
| 聚焦（含内部输入框聚焦） | `.wrap:focus-within` | `border-color: var(--dsw-alias-brand-primary)`；内部输入框自身 `outline: none`，焦点只由外壳这一处表达 |
| 占位文字 | `.input::placeholder` | `color: var(--dsw-alias-label-dimmed)` |
| 已输入 | `.input` | 文字 `--dsw-alias-label-primary`，14 / 22 |
| 禁用 | `.wrap:has(.input:disabled)` | `opacity: 0.4` + `cursor: not-allowed`（本仓库建议值） |
| 只读 | `readOnly` | 无独立视觉；`readOnly` 不在 Tab 序列中消失，仍可被读出与选中 |
| hover / active | — | 未定义。输入框不表达按下，没有 `:hover` 视觉 |
| 错误 | — | 本组件不含错误态；由外层容器渲染错误文案，`aria-invalid` / `aria-describedby` 由调用方透传 |

## tokens

DSH 语义 token：

- `--dsw-alias-border-l4` — 外壳描边色
- `--dsw-alias-bg-layer-1` — 外壳底色
- `--dsw-alias-brand-primary` — 聚焦时的描边色
- `--dsw-alias-label-tertiary` — 前置图标颜色
- `--dsw-alias-label-primary` — 输入文字颜色
- `--dsw-alias-label-dimmed` — 占位文字颜色

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-input-height`（`32px`）
- `--dsh-input-pad-x`（`8px`）
- `--dsh-input-gap`（`6px`）
- `--dsh-input-radius`（`8px`）
- `--dsh-input-icon-size`（`16px`）
- `--dsh-input-font-size`（`14px`）
- `--dsh-input-line-height`（`22px`）

## a11y

- 输入框需要一个可访问名。占位文字不是名字（输入后消失，读屏软件也不总把它当标签）；请提供 `aria-label`，或让外层 `<label htmlFor>` 指到内部 input 的 `id`。
- 前置图标应带 `aria-hidden="true"`，否则图标里的文本节点会被读一遍；图标含义应由输入框自己的名字承担（`AC-MF-14`）。
- 焦点只用一个信号：内部 `<input>` 设了 `outline: none`，焦点靠外壳的 `:focus-within` 边框变色表达。这是官方做法，不要再给内部输入框加第二个焦点环，否则会出现两圈。此处 `outline: none` 不违反 `AC-MF-10`，因为同一区域的替代焦点样式存在；`AC-MF-10` 的自动判定需按「同一选择器无替代」而非「出现 `outline: none`」来执行。
- 错误态不是本组件的职责：透传 `aria-invalid` 与 `aria-describedby`，由外层渲染错误文案。
- `disabled` 会让输入框从 Tab 序列里消失。如果只是想「暂时不给改但还要能被读到」，用 `readOnly` 并配 `aria-readonly`。
- `type` 请按语义选（`email` / `url` / `search`），移动端会给出更合适的键盘。
- 命中区：高 32px，达到 `AC-MF-01` 的常规控件目标 28×28。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `ref` 指向内部 `<input>`（`ref.current` 具备 `focus` 与 `selectionStart`），不是外壳 `<span>`。
2. `className` 挂在外壳上、不出现在内部 `<input>` 的 class 列表里。
3. `icon` 为 `null` / `undefined` 时不渲染图标容器；有 `icon` 时容器为 16×16 且带 `flex: none`。
4. `.wrap` 上存在 `box-sizing: border-box`（本仓库建议值，保证 32px 与实际渲染高度一致）。
5. 存在聚焦视觉：`.wrap:focus-within` 的 `border-color` 为 `--dsw-alias-brand-primary`。
6. 内部 `<input>` 为 `outline: none`，且同一区域内存在替代焦点样式（`AC-MF-10` 的替代判定）。
7. `.input` 声明 `font-family: inherit`（本仓库建议值，避免 `<input>` 回退到系统字体）。
8. 禁用态存在视觉（`opacity: 0.4` + `cursor: not-allowed`），取值与官方 `Button.module.css` 的 `.button:disabled` 一致（本仓库建议值）。
9. 源码中不出现硬编码色值（`TK-MF-01`），六个颜色全部来自 `--dsw-alias-*`。
10. 高度按 `CT-MF-01` 复用官方几何 32px，不得被外部覆盖为 36px 或 28px。

## demo

- `components/controls/Input/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A18`、`A19`、`A23`、`A43`、`A48`、`A49`）
