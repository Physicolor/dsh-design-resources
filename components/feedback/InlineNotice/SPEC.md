# InlineNotice · SPEC

- id: inline-notice
- category: feedback
- source: `components/feedback/InlineNotice/`（`index.tsx` / `inline-notice.module.css`）
- official-counterpart: **产品里有对应的界面**：官方 `ConnectionIndicator`（断连 / 重连提示）被客户端真实挂载（`state` / `disconnectedLabel` / `onReconnect`）。单行几何实测为 `height: 28px` / `padding: 0 8px` / `border-radius: var(--dsw-radius-sm)`（8px）/ `font 12px 500 / 18px` / `display: inline-grid` + `14px max-content` + `column-gap: 4px`，取自产品 `app.asar` 内的 `@deepseek-ai/dsh-client-ui-primitives/lib/ConnectionIndicator.module.css`（2026-10-02 复核，替换掉旧版采集的 32px / 0 10px）。warn / success 用语气的三级底色，派生手法借用 `Tag.module.css` 的 `color-mix`；info / error 两种语气产品里没有对应物。
- 与本组件的差别（有意，不是抄错）：官方 `ConnectionIndicator` 是 14px 图标 + 一段状态文字的连接指示器，实测单行 **28 高 / padding 0 8px**；本组件是通用提示条，单行取 **32 高 / padding 0 10px**（本仓库建议值，20×20 的关闭控件要塞进去，推导见下）。要与产品原生提示并排时，改用官方的 28 / 0 8
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

写法为「数值 ← 文件名 选择器」：左列是箭头左侧，右列是「文件名 + 选择器」。
官方来源为 `@deepseek-ai/dsh-client-ui-primitives/lib/`。

| 数值 | 出处 |
| --- | --- |
| `height: 28px` / `padding: 0 8px` / `border-radius: 8px` | `ConnectionIndicator.module.css` → `.indicator` |
| `box-sizing: border-box` / `border: none` | `ConnectionIndicator.module.css` → `.indicator` |
| `font-size: 12px` / `font-weight: 500` / `line-height: 18px` / `white-space: nowrap` | `ConnectionIndicator.module.css` → `.indicator` |
| `display: inline-grid` / `grid-template-columns: 14px max-content` / `column-gap: 4px` / `align-items: center` | `ConnectionIndicator.module.css` → `.indicator` |
| `transition: background-color 160ms ease-out, color 160ms ease-out` | `ConnectionIndicator.module.css` → `.indicator` |
| 图标容器 `14×14` / `display: grid` / `place-items: center` | `ConnectionIndicator.module.css` → `.icon` |
| `warn` = `background: var(--dsw-alias-state-warn-tertiary)` + `color: var(--dsw-alias-state-warn-label)` + `cursor: pointer` | `ConnectionIndicator.module.css` → `.warning` |
| 按下时 `background: color-mix(in srgb, var(--dsw-alias-state-warn-tertiary), var(--dsw-alias-state-warn-primary) 10%)` | `ConnectionIndicator.module.css` → `.warning:active` |
| `success` = `background: var(--dsw-alias-state-success-tertiary)` + `color: var(--dsw-alias-state-success-primary)` | `ConnectionIndicator.module.css` → `.success` |
| 焦点环 `outline: 2px solid` 语气色 + `outline-offset: 2px` | `ConnectionIndicator.module.css` → `.warning:focus-visible`（本仓库把颜色换成逐语气变量） |
| `gap: 4px`（本仓库 flex 形态沿用的间距值） | `ConnectionIndicator.module.css` → `.indicator` 的 `column-gap` |
| `color-mix(in srgb, 主色 10%, transparent)` 派生底色 | `Tag.module.css` → `.tag` 各 tone 分支（该文件对 success / info / danger 用同一手法，warning 用 12%） |

`flex: none` 官方写在 `.indicator` 上；本仓库根节点是行内 flex 容器、不需要收缩保护，改写在 `.icon` 上。

### 本仓库决策（改写官方行为）

- **布局用 flex 而不是官方那套两列网格**：官方的 `grid-template-columns: 14px max-content` 是为了让 hover 前后的两段文案互相撑住宽度、避免抖动，这个需求只有 ConnectionIndicator 有。通用提示条的文案长度本来就随内容变，用 `inline-flex + gap: 4px`（gap 值仍是官方的 4px）等价且更简单。关闭按钮出现时右侧也不会有多余空列。
- **有 `onDismiss` 时根节点变成 `<button>`，整条可点关闭**：官方 ConnectionIndicator 的 warning 分支也是整条 `<button>`（点击重连），这里沿用同一交互模型。
- **关闭控件用 `role="button"` + `tabIndex=0` 的 `<span>` 而不是 `<button>`**：传了 `onDismiss` 时根节点本身就是 `<button>`，而 HTML 不允许按钮嵌套按钮。键盘 Enter / 空格由组件自己处理（`preventDefault` + `stopPropagation`，避免触发两次）。

### 本仓库建议值（非官方数值）

- **`info` / `error` 的底色**：官方没有「三级底 + 主色」的完整组合可用——
  `--dsw-alias-state-success-tertiary` / `--dsw-alias-state-warn-tertiary` 都存在，`--dsw-alias-state-business-tertiary`（= `--dsw-static-deepseek-100`）虽然存在，但它在 dark 主题下被定义成 `--dsw-static-deepseek-800` 这类「深色底」，直接当浅色提示条的底色会在 light 主题下显得过深；`--dsw-alias-state-error` 则根本没有 tertiary 变体，只有 `primary` / `secondary`。
  为了一条规则覆盖两种主题，本仓库不新增任何 token，改用官方 `Tag.module.css` 已经用过的手法 `color-mix(in srgb, 主色 10%, transparent)` 从对应主色派生底色。
- **多行形态 `.multiline`**：官方 ConnectionIndicator 只有单行 28px。高度改 `auto` + `min-height: 32px`，上下内边距取 `6px`。
  6px 的来历：单行形态把 18px 行高在 32px 里居中后，上下各留 `(32 - 18) / 2 = 7px`；自造间距按本仓库规则取 4 的倍数，4px 比原形态更紧，所以取 6px 作为「介于 4 与 7 之间、视觉上不松」的值，同时仍让单行时总高回到 32px 附近（6 + 18 + 6 = 30 < 32，靠 `min-height` 兜底到 32）。
- **多行时图标的 `margin-top: 2px`**：文案首行行高 18px、图标 14px，居中差为 `(18 - 14) / 2 = 2px`。这是从官方数值推导出来的，不是新造尺寸。
- **关闭控件 `.dismiss`**：官方没有关闭态。20×20 热区、圆角 6px、`margin: 0 -4px 0 2px`（右侧负外边距抵掉一部分 10px 内边距，让图标视觉上仍贴着右边缘）、默认 `opacity: 0.75`、hover 底色 `color-mix(in srgb, currentColor 12%, transparent)`。
  20px 热区达到 `AC-MF-01` 的 20×20 下限，但小于同条的「常规控件目标 28×28」；提示条本身只有 32px 高，这是有意取舍。

### 实现说明

- 本仓库实现为原创：几何由 `--dsh-notice-*` 变量承载、语气用四个类改同一组变量。
- 配色 token 逐个在 `website/css/dsh-tokens.css` 里核对过存在（light 与 dark 两套都有）：`--dsw-alias-state-business-primary` / `--dsw-alias-state-success-primary` / `--dsw-alias-state-success-tertiary` / `--dsw-alias-state-warn-label` / `--dsw-alias-state-warn-primary` / `--dsw-alias-state-warn-tertiary` / `--dsw-alias-state-error-primary`。

## api

`InlineNoticeProps extends HTMLAttributes<HTMLElement>`，`forwardRef<HTMLElement, InlineNoticeProps>`。导出类型 `InlineNoticeTone`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tone` | `'info' \| 'success' \| 'warn' \| 'error'` | `'info'` | 语气，决定底色与文字 / 图标色 |
| `icon` | `ReactNode` | 无 | 前置状态图标，放进 14×14 容器，颜色跟随语气文字色 |
| `children` | `ReactNode` | 无 | 文案 |
| `multiline` | `boolean` | `false` | 多行形态：高度 `auto` + `min-height: 32px`，上下内边距各 6px |
| `onDismiss` | `() => void` | 无 | 传入即渲染右侧关闭控件，并把根节点改为 `<button type="button">` |
| `dismissLabel` | `string` | `'关闭提示'` | 关闭控件的无障碍名称 |
| `className` | `string` | 无 | 追加在根节点类名之后 |
| 其余 | `HTMLAttributes<HTMLElement>` | — | `role` / `onClick` / `aria-*` 等原样透传到根节点 |
| `ref` | `Ref<HTMLElement>` | 无 | 透传到根节点 |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认（info） | `tone` 缺省 | 底色 `var(--dsw-alias-bg-module-platform)`；文字 `var(--dsw-alias-label-secondary)`；强调色 `var(--dsw-alias-state-business-primary)` |
| `info` | `tone="info"` | 底色 `color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent)`；文字与强调色为 `--dsw-alias-state-business-primary`（建议值） |
| `success` | `tone="success"` | 底色 `--dsw-alias-state-success-tertiary`；文字与强调色 `--dsw-alias-state-success-primary` |
| `warn` | `tone="warn"` | 底色 `--dsw-alias-state-warn-tertiary`；文字与强调色 `--dsw-alias-state-warn-label` |
| `error` | `tone="error"` | 底色 `color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent)`；文字与强调色 `--dsw-alias-state-error-primary`（建议值） |
| 单行 | `multiline` 为假 | `white-space: nowrap`；`height: 32px`；`align-items: center` |
| 多行 | `multiline` 为真 | `white-space: normal`；`height: auto` + `min-height: 32px`；`align-items: flex-start`；`padding: 6px 10px` |
| 多行图标 | `.multiline` 且传入 `icon` | 图标 `margin-top: 2px` |
| 可关闭 | 传入 `onDismiss` | 根节点为 `<button type="button">`，`cursor: pointer`；关闭控件渲染 |
| 按压 | `.actionable:active` | 底色 `color-mix(in srgb, var(--dsh-notice-bg), var(--dsh-notice-accent) 10%)` |
| 关闭控件默认 | `.dismiss` | `20×20`、圆角 `6px`、`margin: 0 -4px 0 2px`、`opacity: 0.75` |
| 关闭控件悬停 | `.dismiss:hover` | 底色 `color-mix(in srgb, currentColor 12%, transparent)`、`opacity: 1` |
| 关闭控件键盘焦点 | `.dismiss:focus-visible` | `outline: 2px solid currentColor` + `outline-offset: 1px` + `opacity: 1` |
| 根按钮悬停 / 聚焦 | `.actionable:hover .dismiss` / `.actionable:focus-visible .dismiss` | 关闭控件 `opacity: 1` |
| 键盘焦点 | `.notice:focus-visible` | `outline: 2px solid var(--dsh-notice-accent)` + `outline-offset: 2px` |
| 减弱动态效果 | `prefers-reduced-motion: reduce` | `transition: none` |
| 无 `icon` | `icon === undefined` | 图标容器不渲染 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-secondary` — 默认文字色
- `--dsw-alias-bg-module-platform` — 默认底色
- `--dsw-alias-state-business-primary` — `info` 的强调色与派生底色的来源
- `--dsw-alias-state-success-tertiary` / `--dsw-alias-state-success-primary` — `success` 底色 / 文字
- `--dsw-alias-state-warn-tertiary` / `--dsw-alias-state-warn-label` — `warn` 底色 / 文字
- `--dsw-alias-state-error-primary` — `error` 的强调色与派生底色的来源

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-notice-text`（默认 `--dsw-alias-label-secondary`；四个语气类各覆盖一次）
- `--dsh-notice-bg`（默认 `--dsw-alias-bg-module-platform`；四个语气类各覆盖一次）
- `--dsh-notice-accent`（逐语气；同时用于图标色、焦点环色）
- `--dsh-notice-pad-y`（`6px`，本仓库建议值）
- `--dsh-notice-dismiss-size`（`20px`，本仓库建议值）

## a11y

- 无 `onDismiss` 时根节点是 `<div>`，调用方传入的 `role` 原样保留（例如 `role="status"`）；有 `onDismiss` 时根节点是 `<button type="button">`，需要调用方同时传 `aria-label` 说明点它会做什么。
- 需要被屏幕阅读器主动播报时由调用方传 `role="alert"`；静态展示不传，`alert` 会打断当前朗读。
- 图标容器带 `aria-hidden="true"`：图标是装饰，语义必须写在文案里。
- 颜色不是唯一线索（`AC-MF-07`）：四种底色在灰度或色觉障碍下差别有限，需带图标或在文案中写明状态。
- 焦点环用 `outline`（`AC-MF-10` / `AC-MF-11` / `AC-MF-12`）：颜色取当前语气的 `--dsh-notice-accent`，使用 `outline` 而不是 `box-shadow`，不被父级 `overflow: hidden` 裁掉。
- 关闭控件带 `aria-label`（默认「关闭提示」，可用 `dismissLabel` 覆盖），自身可聚焦（`tabIndex=0`），Enter / 空格可触发（`AC-MF-09`）。
- 关闭后焦点会落回 `body`：调用方应在卸载后把焦点还给触发它的元素。
- 命中区结论：单行形态高 `32px`、关闭控件 `20×20`，均达到 `AC-MF-01` 的 `20×20` 下限；关闭控件未达到同条的常规控件目标 `28×28`（有意取舍，见上）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `tone` 取值属于 `info` / `success` / `warn` / `error`，否则回落 `info`。
2. 根节点类名同时包含语气类；`multiline` 为真时包含多行类。
3. 传入 `onDismiss` 时，根节点渲染为 `<button>` 且 `type="button"`；未传入时渲染为 `<div>`。
4. 传入 `onDismiss` 时，关闭控件为 `role="button"` 的 `<span>`（源码中不得出现按钮嵌套按钮）。
5. 传入 `onDismiss` 时，关闭控件带非空 `aria-label`（`AC-MF-14`；清单 `A49`）。
6. 关闭控件的 `onClick` 与 `onKeyDown` 均调用 `stopPropagation`，且 `onKeyDown` 对 Enter / 空格调用 `preventDefault`（避免触发两次）。
7. 传入 `icon` 时，图标容器带 `aria-hidden="true"`。
8. 根节点存在 `:focus-visible` 焦点样式，且不使用 `outline: none` 后无替代（`AC-MF-10`；清单 `A48`）。
9. 焦点环为 2px 实线 + 2px 外偏移（`AC-MF-11`）。
10. 关闭控件存在 `:focus-visible` 样式（清单 `A48`）。
11. 存在 `@media (prefers-reduced-motion: reduce)` 分支（`MO-RC-09`；清单 `A34`）。
12. 底色与文字色全部来自 `--dsw-*` 语义 token 或 `color-mix` 派生，源码中无硬编码色值（清单 `A19` / `A23`）。
13. 相邻命中区不重叠（`AC-MF-03`）：关闭控件与根按钮是同一命中区内的主从关系，关闭控件自身不构成独立相邻元素。
14. 四种语气在灰度下可区分或有图标 / 文案补充（`AC-MF-07`；清单 `A46`，半自动）。
15. 单行形态下文案长度超出容器时不换行（`white-space: nowrap`）——需调用方改用多行形态（人审，见 `README.md`「怎么用得好」）。

## demo

- `components/feedback/InlineNotice/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A19`、`A23`、`A34`、`A46`、`A48`、`A49`）
