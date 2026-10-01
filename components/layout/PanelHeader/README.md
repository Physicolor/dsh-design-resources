# PanelHeader 面板标题栏

面板 / 抽屉 / 侧栏顶部的标题条：左侧标题，右侧动作区，底部一条 hairline。

## 是什么

一个不渲染任何交互的 `<div>` 头部容器：

- 左列 `heading`：`title`（14/22，字重 500）+ 可选 `description`（12/18）；
- 右列 `actions`：任意节点，通常放若干 `Button`；
- 底部 hairline：`0.5px` 的 `var(--dsw-alias-border-l1)`，可用 `divider={false}` 关掉。

零依赖，只用到 `react` 和 CSS Modules。

| 尺寸 | 高度 | 左右内边距 |
| --- | --- | --- |
| `md`（默认） | 44px | 12px |
| `sm` | 36px | 8px |

传了 `description` 后高度改由内容撑开（`min-height` 仍在），避免说明文字被裁。

## 什么时候用

- 一个可关闭的面板、抽屉、侧栏、浮层的顶部标题区。
- 需要在标题右边放「关闭 / 更多 / 折叠」这类动作时。
- 面板内部按段分隔，需要一条与官方同款的细分割线时。

## 什么时候不要用

- 对话框标题：官方 `Modal.module.css` 已有成套的 `.header` / `.title`（16/24/500，`padding: 22px 14px 12px 24px`），不要用本组件替代。
- 页面级大标题（`<h1>`）或导航栏：字号体系不同，这里固定 14/22。
- 只想放一条分割线：直接用 `0.5px solid var(--dsw-alias-border-l1)` 的 `<hr>` 或伪元素，不必套标题栏。
- 需要滚动吸顶的整条工具条：用 `ToolbarRow`，它带 `sticky` 支持。

## 几何来源

数值全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib`：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| `font-weight: 500`、`color: var(--dsw-alias-label-primary)` | `Modal.module.css` `.title`（原注释：figma wt510，渲染 500） |
| 标题字号取 `14px / 22px` | `Button.module.css` `.button`（`font-size: 14px; line-height: 22px`）——面板标题比对话框标题低一档，故不取 `Modal` 的 16/24 |
| `display: flex; align-items: center; justify-content: space-between; gap: 8px` | `Modal.module.css` `.header` |
| `gap: 4px`（动作区内部间距） | `Button.module.css` `.button`（`gap: 4px`） |
| hairline `0.5px` + `var(--dsw-alias-border-l1)` | `Menu.module.css` `.separator`（`height: 0.5px; background: var(--dsw-alias-border-l1)`） |
| `--dsw-alias-label-tertiary`（说明文字色） | `DisclosureRow.module.css` `.leading` / `Menu.module.css` `.itemIcon` 的次级文字色 |

`--dsw-alias-label-primary` / `--dsw-alias-label-tertiary` / `--dsw-alias-border-l1` 均在 `website/css/dsh-tokens.css` 中查到（第 139 / 142 / 102 行，light 与 dark 两套都有）。

**为什么用 `border-l1` 而不是 `border-l2`：** 官方对「行内/同层分隔」用 l1（`Menu.module.css` 的 `.separator`），对「浮层与页面之间的边界」用 l2（`Menu.module.css` 的 `.footer` 顶边）。面板标题栏属于前者：它分割的是同一块面板表面内部的两段内容。

**本仓库建议值（非官方数值）：**

- `min-height: 44px`（`md`）/ `36px`（`sm`）：官方没有面板标题栏。44px 的取法：标题行高 22px 上下各留 11px 视觉余量不成立，故直接取 4 的倍数 44（= 22 + 11 + 11 向上取整到 4 的倍数），并让右侧 28px 的图标按钮（官方 `Modal.module.css` `.close` 的 28×28）有足够点击面积；`sm` 的 36px 对齐官方 `Button.module.css` `.md` 的 36px 高度，使标题栏与并排的 `md` 按钮等高。之所以选 44 而不是 40：`Modal` 的 `.close` 是 28px，44 - 28 = 16，上下各 8px 留白；40 - 28 = 12，上下各 6px，视觉偏挤。
- `padding: 0 12px`（`md`）/ `0 8px`（`sm`）：官方没有面板标题栏的水平内边距。12px 与官方 `Menu.module.css` `.item` 的 `padding: 8px 10px`、`Modal.module.css` `.header` 的 `padding: … 14px … 24px` 都不同，本仓库取 12px 作为「面板边缘到文字」的中间档，且是 4 的倍数；`sm` 取 8px 保持同一节奏。
- `heading` 的 `gap: 4px`（标题与说明之间）：官方没有这个间距。取值遵守本仓库「自造间距用 4 的倍数」的规则；比 4px 更紧的 2px 观感更贴，但不合规，故不采用。若标题与说明需贴得更近，请由使用方自行覆盖。
- hairline 的实现方式（`box-shadow: inset 0 -0.5px 0 0`）：官方用 `border-top` / `background` 实现（`Modal.module.css` `.footer`、`Menu.module.css` `.separator`）。本仓库改用 inset `box-shadow`，是因为标题栏有固定 `min-height`，`border-bottom` 会把总高度顶成 44.5px；`box-shadow` 不参与布局，高度仍是整数。

实现为本仓库原创（CSS 变量承载几何 + 单类切换尺寸），几何等价但不是官方 CSS 的复制。

## 可访问性要点

- `title` 是纯文本容器，不是标题元素。如果面板有 `<section>` / `<aside>` 语义，请自行给它 `aria-labelledby` 并在标题上挂 `id`，或直接在 `title` 里传 `<h2>`。
- `actions` 里的按钮如果是**仅图标**，必须给 `aria-label`（例：`aria-label="关闭面板"`）；图标本身应 `aria-hidden="true"`，避免读两遍。
- 标题过长时本组件用 `text-overflow: ellipsis` 截断，不换行——截断只影响视觉，屏幕阅读器仍能读到完整文本。
- 底部 hairline 是纯装饰，不要给它任何语义（不要用 `<hr>` 冒充）。
- `title` 传字符串时会被放进一个 `min-width: 0` 的 flex 子项，因此标题不会把右侧动作区挤出容器。
