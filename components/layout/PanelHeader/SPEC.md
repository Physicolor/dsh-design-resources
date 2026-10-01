# PanelHeader · SPEC

- id: panelheader
- category: layout
- source: `components/layout/PanelHeader/`（`index.tsx` / `panelheader.module.css`）
- official-counterpart: 无同名组件；几何锚点取自 `@deepseek-ai/dsh-client-ui-primitives/lib/` 的 `Modal.module.css` / `Button.module.css` / `Menu.module.css` / `DisclosureRow.module.css`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

写法为「数值 ← 文件名 选择器」：左列是箭头左侧，右列是「文件名 + 选择器」。
官方来源为 `@deepseek-ai/dsh-client-ui-primitives/lib/`。

| 数值 | 出处 |
| --- | --- |
| `font-weight: 500` / `color: var(--dsw-alias-label-primary)` | `Modal.module.css` → `.title`（原注释：figma wt510，渲染 500） |
| 标题字号 `font-size: 14px` / `line-height: 22px` | `Button.module.css` → `.button`（面板标题比对话框标题低一档，故不取 `Modal` 的 16/24） |
| `display: flex` / `align-items: center` / `justify-content: space-between` / `gap: 8px` | `Modal.module.css` → `.header` |
| 动作区内部 `gap: 4px` | `Button.module.css` → `.button`（`gap: 4px`） |
| hairline `0.5px` + `background: var(--dsw-alias-border-l1)` | `Menu.module.css` → `.separator`（`height: 0.5px; background: var(--dsw-alias-border-l1)`） |
| `--dsw-alias-label-tertiary`（说明文字色） | `DisclosureRow.module.css` → `.leading` / `Menu.module.css` → `.itemIcon`（官方次级 / 三级文字色的用法） |
| `28×28`（动作区常见图标按钮尺寸，非本组件几何） | `Modal.module.css` → `.close`（`width: 28px; height: 28px`） |

### 为什么用 `border-l1` 而不是 `border-l2`

官方对「行内 / 同层分隔」用 l1（`Menu.module.css` 的 `.separator`），对「浮层与页面之间的边界」用 l2（`Menu.module.css` 的 `.footer` 顶边）。面板标题栏属于前者：它分割的是同一块面板表面内部的两段内容。

### 本仓库建议值（非官方数值）

- `min-height: 44px`（`md`）/ `36px`（`sm`）：官方没有面板标题栏。44px 的取法：标题行高 22px 上下各留 11px 视觉余量不成立，故直接取 4 的倍数 44（= 22 + 11 + 11 向上取整到 4 的倍数），并让右侧 28px 的图标按钮（官方 `Modal.module.css` `.close` 的 28×28）有足够点击面积；`sm` 的 36px 对齐官方 `Button.module.css` `.md` 的 36px 高度，使标题栏与并排的 `md` 按钮等高。之所以选 44 而不是 40：`Modal` 的 `.close` 是 28px，44 - 28 = 16，上下各 8px 留白；40 - 28 = 12，上下各 6px，视觉偏挤。
- `padding: 0 12px`（`md`）/ `0 8px`（`sm`）：官方没有面板标题栏的水平内边距。12px 与官方 `Menu.module.css` `.item` 的 `padding: 8px 10px`、`Modal.module.css` `.header` 的 `padding: … 14px … 24px` 都不同，本仓库取 12px 作为「面板边缘到文字」的中间档，且是 4 的倍数；`sm` 取 8px 保持同一节奏。
- `heading` 的 `gap: 4px`（标题与说明之间）：官方没有这个间距。取值遵守本仓库「自造间距用 4 的倍数」的规则；比 4px 更紧的 2px 观感更贴，但不合规，故不采用。若标题与说明需贴得更近，请由使用方自行覆盖。
- hairline 的实现方式（`box-shadow: inset 0 -0.5px 0 0`）：官方用 `border-top` / `background` 实现（`Modal.module.css` `.footer`、`Menu.module.css` `.separator`）。本仓库改用 inset `box-shadow`，是因为标题栏有固定 `min-height`，`border-bottom` 会把总高度顶成 44.5px；`box-shadow` 不参与布局，高度仍是整数。

### 实现说明

- 本仓库实现为原创：几何由 `--dsh-ph-*` 组件级变量承载 + 单类切换尺寸，几何等价但不是官方 CSS 的复制。
- `--dsh-ph-*` 是本仓库内部变量，不是 DSH token。
- `--dsw-alias-label-primary` / `--dsw-alias-label-tertiary` / `--dsw-alias-border-l1` 均在 `website/css/dsh-tokens.css` 中查到（light 与 dark 两套都有）。

## api

`PanelHeaderProps extends HTMLAttributes<HTMLDivElement>`，`forwardRef<HTMLDivElement, PanelHeaderProps>`。导出类型 `PanelHeaderSize`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | 无（必填） | 左侧标题文本，渲染为 `<div>`，14/22、字重 500 |
| `description` | `ReactNode` | 无 | 标题下方的补充说明（12/18、三级文字色）；传入后标题栏高度由内容撑开，不再锁定 `--dsh-ph-height` |
| `actions` | `ReactNode` | 无 | 右侧动作区内容，通常是若干 `Button` / 图标按钮 |
| `size` | `'md' \| 'sm'` | `'md'` | `md` 高 44px、左右内边距 12px；`sm` 高 36px、左右内边距 8px。传了 `description` 时只影响内边距 |
| `divider` | `boolean` | `true` | 是否绘制底部 hairline |
| `children` | `ReactNode` | 无 | 追加在 `heading` 内、`description` 之后 |
| `className` | `string` | 无 | 与内部类名拼接 |
| 其余 | `HTMLAttributes<HTMLDivElement>` | — | `id` / `aria-*` 等原样透传到根 `<div>` |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到根 `<div>` |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认（`md`） | `size` 缺省 | `min-height: 44px`；`padding: 0 12px` |
| `sm` | `size="sm"` | `min-height: 36px`；`padding: 0 8px` |
| 有分隔线 | `divider` 为真（默认） | `box-shadow: inset 0 -0.5px 0 0 var(--dsw-alias-border-l1)` |
| 无分隔线 | `divider={false}` | 无 `box-shadow` |
| 有说明 | `description != null` | `.description` 渲染；高度由内容撑开（`min-height` 仍生效） |
| 无说明 | `description` 为 `null` / `undefined` | `.description` 不渲染 |
| 无动作 | `actions` 为 `null` / `undefined` | `.actions` 不渲染 |
| 标题过长 | 文本宽度超过可用空间 | `.title` 以 `text-overflow: ellipsis` 截断，不换行 |
| 说明过长 | 同上 | `.description` 同样截断 |
| 标题挤压动作区 | 标题自然宽度过大 | `.heading` 的 `min-width: 0` 让其收缩，`.actions` 为 `flex: none` 保持完整 |
| 交互 | 任意时刻 | 无：本组件不渲染任何交互元素 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-primary` — `.title` 文字色
- `--dsw-alias-label-tertiary` — `.description` 文字色
- `--dsw-alias-border-l1` — 底部 hairline 颜色

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-ph-height`（`44px` / `.sm` 下 `36px`）
- `--dsh-ph-pad-x`（`12px` / `.sm` 下 `8px`）
- `--dsh-ph-gap`（`8px`）
- `--dsh-ph-title-size`（`14px`）
- `--dsh-ph-title-line`（`22px`）

## a11y

- `title` 是纯文本容器，不是标题元素。面板若有 `<section>` / `<aside>` 语义，调用方应给它 `aria-labelledby` 并在标题上挂 `id`，或直接在 `title` 里传 `<h2>`。
- `actions` 里的按钮若是仅图标，必须由调用方提供 `aria-label`；图标本身应 `aria-hidden="true"`（`AC-MF-14`；清单 `A49`）。
- 标题过长时以省略号截断，不换行——截断只影响视觉，屏幕阅读器仍能读到完整文本。
- 底部 hairline 是纯装饰，不带任何语义（不用 `<hr>` 冒充）。
- `title` 放在 `min-width: 0` 的 flex 子项里，标题不会把右侧动作区挤出容器（`AC-MF-16` / `FL-RC-05` 的窄容器可用性）。
- 命中区结论：本组件不含可交互元素，命中区要求不作用于根节点；`actions` 内的控件由各自组件负责（`AC-MF-01`）。含图标按钮时，容器行高 `md` 44px / `sm` 36px，均 ≥ 28px（`AC-MF-04`；清单 `A44`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `title` 节点带 `text-overflow: ellipsis` + `white-space: nowrap` + `overflow: hidden`，不换行。
2. `description` 节点同样三件套齐备。
3. `.heading` 带 `min-width: 0`，`.actions` 带 `flex: none`。
4. `actions` 为 `null` / `undefined` 时，源码不渲染 `.actions` 节点。
5. `divider` 为假时不渲染 hairline 的 `box-shadow`。
6. hairline 用 `box-shadow` 而非 `border-bottom`，根节点高度为整数（44 / 36）而非 44.5 / 36.5。
7. `size` 取值属于 `md` / `sm`，否则回落 `md`。
8. 高度为 `44px`（`md`）/ `36px`（`sm`），均 ≥ 28px（`AC-MF-04`；清单 `A44`）。
9. 类名拼接顺序为「基础类 + 尺寸类 + divider 类 + 外部 className」，外部类名最后追加。
10. 颜色全部来自 `--dsw-*` 语义 token，源码中无硬编码色值（清单 `A19` / `A23`）。
11. 本组件源码不出现 `onClick` / `tabIndex` / `role`（它不渲染交互）。
12. 传字符串 `title` 时不被渲染成 `<h1>`–`<h6>`（避免破坏页面标题大纲）。
13. 使用方自行加边框时传 `divider={false}`，源码中不出现「同时有 `border` 与 hairline」的组合（人审）。

## demo

- `components/layout/PanelHeader/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A19`、`A23`、`A44`、`A49`）
