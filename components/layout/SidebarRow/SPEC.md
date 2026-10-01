# SidebarRow · SPEC

- id: sidebarrow
- category: layout
- source: `components/layout/SidebarRow/`（`index.tsx` / `sidebarrow.module.css`）
- official-counterpart: 无同名组件；几何逐条锚定 `@deepseek-ai/dsh-client-ui-primitives/lib/Menu.module.css` 的 `.item` 家族
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

写法为「数值 ← 文件名 选择器」：左列是箭头左侧，右列是「文件名 + 选择器」。
官方来源为 `@deepseek-ai/dsh-client-ui-primitives/lib/`。

| 数值 | 出处 |
| --- | --- |
| `min-height: 40px` / `padding: 8px 10px` / `border-radius: 10px` / `gap: 8px` / `font-size: 14px` / `line-height: 22px` / `color: var(--dsw-alias-label-primary)` / `text-align: left` | `Menu.module.css` → `.item`（原注释：figma `.Menu_cell`，min-h 40 / r10 / pad 10/8 / 14-22 / gap 8） |
| 悬停底 `background: var(--dsw-alias-interactive-bg-hover)` | `Menu.module.css` → `.item:hover:not(:disabled)` |
| `opacity: 0.4` / `cursor: not-allowed` | `Menu.module.css` → `.item:disabled` |
| 图标容器 `16×16` / `flex: none` / `color: var(--dsw-alias-label-tertiary)` | `Menu.module.css` → `.itemIcon` |
| `flex: 1` / `min-width: 0` / `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap` | `Menu.module.css` → `.itemLabel` |
| 尾部对勾 `flex: none` / `color: var(--dsw-alias-label-primary)` | `Menu.module.css` → `.check` |
| `fill` 选中态 `background: var(--dsw-alias-interactive-bg-hover)` | `Menu.module.css` → `.selectedFill`（原注释：Fill-mode selection: the row holds the hover fill instead of a check） |
| `check` 选中态保持透明底 | `Menu.module.css` → `.selected`（原注释：Selected cell keeps the plain fill (marker is the trailing check)） |
| 按压态 / 悬停加深 `background: var(--dsw-alias-interactive-bg-active)` | `Button.module.css` → `.ghost:active` |
| 复选框 `16×16` / `margin: 0` / `accent-color: var(--dsw-alias-button-primary-fill)` | `RiskConfirmation.module.css` → `.acknowledgement input`（`width: 16px; height: 16px; accent-color: var(--dsw-alias-button-primary-fill)`） |

### 本仓库决策（改写官方行为）

- **`fill` 用 `var(--dsw-alias-interactive-bg-hover)` 而不是 `var(--dsw-alias-bg-module-platform)`**：官方 `Menu.module.css` 已经把 `.selectedFill` 定义为 hover 底色，这是仓库里唯一一处官方认可的「填充式选中」，直接用它的值风险最低。`--dsw-alias-bg-module-platform` 是模块级表面色（官方 `Tag.module.css` 的 `neutral` 音调用它做标签底），拿来做行底会把「选中」和「标签底噪」混成同一个灰。
- **不使用 `--dsw-specific-sidebar-nav-item-active`**：该 token 属于 `--dsw-specific-*` 家族而非 `--dsw-alias-*`，不在组件约定可用的语义 token 表内。若侧边栏整体已经是 `--dsw-specific-sidebar-fill`，调用方可自行覆盖 `.selectedFill` 的 `background`。

### 本仓库建议值（非官方数值）

- `border-radius: 10px` 保留原值：官方 `.item` 就是 10px，不是 4 的倍数，**不**做整数化。
- `:focus-visible` 的 `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: -2px`：官方 `Menu.module.css` 没有行内焦点样式（菜单靠 `aria-activedescendant` 或整体焦点）。侧边栏行是真按钮，必须有可见焦点环；用负偏移是为了让环落在行内，不会被侧栏的 `overflow: hidden` 裁掉（`AC-MF-12`）。写法与官方 `Switch.module.css` / `ConnectionIndicator.module.css` 的 `:focus-visible` 同款，只改了 offset。
- `.trailing` 的 `12px / 18px`：官方 `Menu.module.css` 没有尾部文本槽位。取官方 `Button.module.css` `.sm` 的 12/18（该文件里最小的文字档），让计数 / 快捷键这类辅助信息比标题轻一档。
- `.row` 上的 `min-width: 0`：官方把它写在 `.itemLabel` 上；本组件额外写在按钮上，因为真实侧边栏用 `width: 100%` 的按钮承载行，按钮自身也需要可压缩。

### 实现说明

- 本仓库实现为原创：CSS 变量承载几何 + 单类切换选中态，几何等价但不是官方 CSS 的复制。
- `--dsh-sb-*` 是本仓库内部变量，不是 DSH token。
- `--dsw-alias-interactive-bg-active` 已核对存在于 `website/css/dsh-tokens.css`（官方 `Button.module.css` 的 `.ghost:active` 亦使用该 token）。

## api

`SidebarRowProps extends ButtonHTMLAttributes<HTMLButtonElement>`，`forwardRef<HTMLButtonElement, SidebarRowProps>`。导出类型 `SidebarRowSelectionStyle`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | 无 | 行标题 |
| `icon` | `ReactNode` | 无 | 前置图标，放进 16×16 的 leading 容器；图标节点请自行给 `aria-hidden="true"` |
| `selected` | `boolean` | `false` | 是否选中；写入 `aria-pressed`（`checkbox` 形态下不写） |
| `checkbox` | `boolean` | `false` | 多选形态：渲染真实 `<input type="checkbox">`，点行任意位置都会切换；此时不要再传 `selected` |
| `checked` | `boolean` | `false` | `checkbox` 形态下的勾选状态 |
| `checkboxLabel` | `string` | 无 | 复选框的 `aria-label`；行内没有可读文本时必填 |
| `selectionStyle` | `'check' \| 'fill'` | `'check'` | 选中态画法：`check` 保持透明底 + 尾部对勾；`fill` 整行铺 hover 底色 |
| `trailing` | `ReactNode` | 无 | 尾部节点，如计数、快捷键提示；`check` 选中时对勾追加在其右侧 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 组件固定默认值，避免在表单中意外提交 |
| `className` | `string` | 无 | 与内部类名拼接，外部类名最后追加 |
| 其余 | `ButtonHTMLAttributes<HTMLButtonElement>` | — | `onClick` / `disabled` / `aria-*` 等原样透传到 `<button>` |
| `ref` | `Ref<HTMLButtonElement>` | 无 | 透传到 `<button>` |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认 | — | `background: transparent`；文字 `var(--dsw-alias-label-primary)` |
| 悬停 | `.row:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-hover)` |
| 按压 | `.row:active:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-active)` |
| 禁用 | `.row:disabled` | `opacity: 0.4` + `cursor: not-allowed` |
| 键盘焦点 | `.row:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: -2px` |
| 选中（`check`） | `selected` 且 `selectionStyle="check"` | 保持透明底；尾部渲染 `16×16` 对勾，色 `var(--dsw-alias-label-primary)`；`aria-pressed="true"` |
| 选中（`fill`） | `selected` 且 `selectionStyle="fill"` | 整行 `background: var(--dsw-alias-interactive-bg-hover)` |
| 选中（`fill`）悬停 | `.selectedFill:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-active)` |
| 多选 | `checkbox` 为真 | leading 位置渲染 `<input type="checkbox" readOnly tabIndex={-1}>`；不渲染 `aria-pressed`；不渲染尾部对勾 |
| 无图标 | `icon` 未传且 `checkbox` 为假 | leading 节点不渲染 |
| 已选但未选中 | `selected` 为假 | 不渲染对勾、不加填充类 |
| 标题过长 | 文本宽度超过可用空间 | `.label` 以 `text-overflow: ellipsis` 截断，不换行 |
| 无尾部 | `trailing` 未传 | `.trailing` 不渲染 |
| 未选中（`fill`） | `selected` 为假 | 不加 `.selectedFill` |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-primary` — 行文字色 / 尾部对勾色
- `--dsw-alias-label-tertiary` — leading 图标色 / `.trailing` 文字色
- `--dsw-alias-interactive-bg-hover` — 悬停底 / `fill` 选中底色
- `--dsw-alias-interactive-bg-active` — 按压底 / `fill` 选中悬停底
- `--dsw-alias-brand-primary` — 焦点环颜色
- `--dsw-alias-button-primary-fill` — 复选框的 `accent-color`

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-sb-min-height`（`40px`）
- `--dsh-sb-pad-x`（`10px`）/ `--dsh-sb-pad-y`（`8px`）
- `--dsh-sb-gap`（`8px`）
- `--dsh-sb-radius`（`10px`）

## a11y

- 行是 `<button type="button">`，天然可 Tab 到、可用 Enter / Space 激活（`AC-MF-09`）；不要用 `<div onClick>` 替代。
- `selected` 写成 `aria-pressed={true|false}`；每组可选中行应由调用方放在带 `aria-label` 的容器里（如 `<nav aria-label="对话列表">`），否则用户不知道这排按钮是一组互斥选择。
- `checkbox` 形态下不渲染 `aria-pressed`（避免与复选框的 `checked` 语义冲突）；`<input>` 自身 `readOnly` 且 `tabIndex={-1}`，焦点留在按钮上，复选框只作状态显示。`<input>` 是 `readOnly`，其 `onChange` 不会因用户操作触发；切换请监听按钮的 `onClick`。
- `checkbox` 形态下若行内没有可读文本，`checkboxLabel` 必填（`AC-MF-14`）。
- 图标必须 `aria-hidden="true"`：`leading` 容器整体标了 `aria-hidden`；名字由行的文字提供（`AC-MF-14`；清单 `A49`）。
- 尾部对勾是纯装饰（`aria-hidden`）：选中语义已由 `aria-pressed` 表达。
- 禁用使用原生 `disabled` 属性，不是 `opacity` 类，焦点与点击都被真正拦住。
- 标题过长时以省略号截断，截断只影响视觉，屏幕阅读器仍能读到完整文本；需要悬停显示全文时由调用方加 `title`。
- 焦点环用 `outline` + 负偏移，避免被侧栏 `overflow: hidden` 裁剪（`AC-MF-10` / `AC-MF-11` / `AC-MF-12`；清单 `A48`）。
- 命中区结论：行高 `min-height: 40px`、宽度 `100%`，远大于 `AC-MF-01` 的 20×20 与常规控件目标 28×28；`checkbox` 形态下 `16×16` 的复选框是行内状态显示、`tabIndex={-1}`，不构成独立命中区。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 行节点为 `<button>` 且 `type` 默认值为 `button`（源码中 `type = 'button'` 不得被移除）。
2. `checkbox` 为假时，`aria-pressed` 等于 `selected`；为真时不渲染 `aria-pressed`。
3. `checkbox` 为真时渲染 `<input type="checkbox">`，并带 `readOnly` 与 `tabIndex={-1}`。
4. `checkbox` 为真时，`<input>` 的尺寸为 `16×16`，`accent-color` 为 `var(--dsw-alias-button-primary-fill)`（清单 `A19`）。
5. `checkbox` 为真且行内无可读文本时，`checkboxLabel` 必须存在（`AC-MF-14`）。
6. `<input>` 的 `onClick` 调用 `stopPropagation`，避免行按钮的 `click` 被触发两次。
7. `selectionStyle` 取值属于 `check` / `fill`，否则回落 `check`。
8. `selected` 为真且 `selectionStyle` 为 `check` 时渲染尾部对勾；为 `fill` 时给根节点加填充类，且不渲染对勾。
9. `icon` 存在时，`leading` 容器带 `aria-hidden="true"`；容器尺寸 `16×16`。
10. `.label` 三件套齐备：`overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap`。
11. 存在 `:focus-visible` 焦点样式，且不使用 `outline: none` 后无替代（`AC-MF-10`）。
12. 焦点环为 2px 实线 + `--dsw-alias-brand-primary`；偏移为 `-2px`（`AC-MF-11` / `AC-MF-12`；清单 `A48`）。
13. 禁用状态使用原生 `disabled`，源码中不得出现以 `aria-disabled` 替代 `disabled` 的写法。
14. 行最小高度 ≥ 28px（实测 `40px`；`AC-MF-01` / `AC-MF-04`；清单 `A43` / `A44`）。
15. `.row` 带 `min-width: 0`（按钮自身可压缩）。
16. 类名拼接顺序为「基础类 + 选中填充类 + 外部 className」，外部类名最后追加。
17. 颜色全部来自 `--dsw-*` 语义 token，源码中无硬编码色值（清单 `A23`）。
18. 不得把本组件用于纯展示：源码中不出现「既不可点、也无 `onClick`、也无 `aria-pressed` 变化」的静态用法（人审，见 `README.md`「怎么用得好」）。

## demo

- `components/layout/SidebarRow/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A19`、`A23`、`A43`、`A44`、`A48`、`A49`）
