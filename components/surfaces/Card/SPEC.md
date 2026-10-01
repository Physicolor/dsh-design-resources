# Card · SPEC

- id: card
- category: surfaces
- source: `components/surfaces/Card/`（`index.tsx` / `card.module.css`）
- official-counterpart: 官方没有这个组件——`@deepseek-ai/dsh-client-ui-primitives/lib/` 下没有任何卡片实现；几何逐条借用已核实选择器，见 `geometry-source`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 primitives 包，写法为「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| `border-radius: 12px` | ← `HoverCard.module.css` `.card`；`ReadBlock.module.css` `.block` 的 `--dsl-read-radius: 12px` |
| `border: 0.5px solid var(--dsw-alias-border-l1)` | ← `markdown/MarkdownText.module.css` `.markdown :not(pre) > code`；同一几何也出现在官方合成 token `--dsw-elevation-stroke: 0 0 0 .5px var(--dsw-elevation-stroke-color)`（该 token 的颜色即 `--dsw-alias-border-l1`） |
| `background: var(--dsw-alias-bg-layer-2)` | ← `Modal.module.css` `.dialog`（官方浮层底色用的同一 token） |
| 标题 `16px` / `line-height: 24px` / `font-weight: 500` | ← `Modal.module.css` `.title` |
| 正文 `14px` / `line-height: 22px` | ← `Modal.module.css` `.description` |
| 说明文字色 `var(--dsw-alias-label-secondary)` | ← `Modal.module.css` `.close`、`Pill.module.css` `.pill`（官方把次级文字设为该 token 的两处） |
| footer 上方 hairline `0.5px` + `var(--dsw-alias-border-l2)` | ← `Menu.module.css` `.footer`（`border-top: 0.5px solid var(--dsw-alias-border-l2)`） |
| 标题色 `var(--dsw-alias-label-primary)` | ← `Modal.module.css` `.title` |

### 本仓库建议值（非官方数值）

- `padding: 16px`：官方没有对应的内联卡片。取 16px——它是 4 的倍数，并且与官方 `HoverCard.module.css` `.card` 的水平内边距 `16px` 同档；再小（12px）配 16/24 的标题会显得挤，再大（24px，那是 Modal 对话框的水平内边距）对卡片来说过空。
- `.card { gap: 12px }`（插槽之间的纵向间距）：4 的倍数，取 12px 是因为官方 `HoverCard.module.css` `.card` 的纵向内边距、`ReadBlock.module.css` `.body` 的纵向内边距都是 `12px`，同一档间距。
- `.header { gap: 4px }`（标题与说明之间）：4 的倍数，且 4px 是官方最小的间距档（`Button.module.css` `.button` 的 `gap: 4px`、`Pill.module.css` `.pill` 的 `gap: 4px`）。
- `.footer { padding-top: 12px }`：与插槽间距同档（12px），让 hairline 上下的呼吸一致。
- **边框与阴影二选一：本组件选 `border: 0.5px solid var(--dsw-alias-border-l1)`，不用 `box-shadow: var(--dsw-shadow-lv1)`。** 理由：官方用阴影的场合全是「脱离文档流的浮层」——`HoverCard.module.css` `.card` 用 `--dsw-shadow-lv3`、`Menu.module.css` `.list` 与 `Modal.module.css` `.dialog` 用 `--dsw-elevation-prominent`；而官方真正的内联容器（`ReadBlock.module.css` `.block`）只有底色、没有高程。卡片并排出现时，逐张投影会互相叠出脏边，hairline 才是官方内联这一层的语言。
- 代价说明：`0.5px` 描边在 `box-sizing: border-box` 下让盒子每边多占 0.5px（合计 1px），这是刻意的实描边，不是 padding 的一部分。

### 本仓库决策（改写官方行为）

- 无。官方没有内联卡片组件，本组件属新增而非改写；`box-sizing: border-box` 是显式声明，用于免除对宿主全局 reset 的依赖（官方 `.dialog` / `.close` 同样依赖宿主 reset，本仓库不假定）。

实现为本仓库原创（用 CSS 变量承载几何 + 单类槽位结构），几何等价但不是官方 CSS 的复制。

## api

`CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'>`，`forwardRef<HTMLElement, CardProps>`。原生 `title`（浏览器 tooltip）被标题插槽占用，因此先从 `HTMLAttributes` 摘除再声明。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | 无 | 卡片标题，渲染成标题元素（级别由 `titleAs` 决定）；不传则不渲染标题行 |
| `description` | `ReactNode` | 无 | 标题下方补充说明；字号与正文相同，用 `--dsw-alias-label-secondary` 区分层级 |
| `titleAs` | `'h2' \| 'h3' \| 'h4'` | `'h3'` | 标题渲染成哪个级别的标题；只改标签，不改视觉 |
| `footer` | `ReactNode` | 无 | 底部插槽（操作按钮、链接、脚注）；与正文之间加一条 hairline |
| `children` | `ReactNode` | 无 | 正文 |
| `className` | `string` | 无 | 与内部类名拼接，追加在最后 |
| 其余 | `HTMLAttributes<HTMLElement>` | — | 除 `title` 外原样透传到根元素 |
| `ref` | `Ref<HTMLElement>` | 无 | 透传到根元素 |

`CardTitleAs` 为导出的类型别名。`hasHeader = title != null || description != null`，为假时不渲染 `.header`。

## states

组件为纯容器，没有交互状态；下表是全部渲染分支。

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 空卡片 | `title` / `description` / `children` / `footer` 全为空 | 仍渲染根元素，只剩描边与底色的空盒（调用方须避免） |
| 无标题行 | `title` 与 `description` 均为空 | 不渲染 `.header` |
| 无标题有说明 | `title` 为空、`description` 非空 | 渲染 `.header`，其中只有 `.description` |
| 无正文 | `children` 为空 | 不渲染 `.body` |
| 无底部 | `footer` 为空 | 不渲染 `.footer`，也因此不出现 footer 上方的 hairline |
| 标题级别 | `titleAs` | 依次渲染为 `h2` / `h3` / `h4`，视觉不变 |
| 悬停 / 聚焦 / 禁用 | — | 组件不定义任何 `:hover` / `:focus` / `:disabled` 样式 |

## tokens

DSH 语义 token：

- `--dsw-alias-bg-layer-2` — `.card` 底色
- `--dsw-alias-border-l1` — `.card` 描边色
- `--dsw-alias-border-l2` — `.footer` 上方 hairline 色
- `--dsw-alias-label-primary` — `.card` 基础文字色、`.title` 颜色
- `--dsw-alias-label-secondary` — `.description` 颜色

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-card-radius`（`12px`）
- `--dsh-card-padding`（`16px`）
- `--dsh-card-gap`（`12px`，同时用于 `.footer` 的 `padding-top`）
- `--dsh-card-head-gap`（`4px`）

## a11y

- 根元素是 `<section>`，`title` 默认渲染成 `<h3>`。标题级别跟页面大纲走（页面标题 → 区块 → 卡片），不要为了字号跳级；`titleAs` 只改标签，不改视觉。
- 卡片是纯容器，不承载交互：不给它加 `onClick` 而不给键盘出口。整块可点的卡片对键盘和屏幕阅读器都不可用。
- 给卡片命名用真实标题（`title`），不要用 `aria-label`——屏幕阅读器的「跳到某个区块」列表读的是标题。
- `description` 是说明而非必读内容：关键信息放正文，不把唯一的状态提示塞进次级色小字。
- 颜色只走 `var(--dsw-*)`：卡片本身不写死颜色，浅色 / 深色主题都成立。
- 组件内没有可聚焦元素，因此不需要焦点样式；`AC-MF-10` / `AC-MF-11` 在本组件不适用（一旦调用方在卡片内放入交互元素，由其自身承担焦点环）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 根元素标签为 `<section>`。
2. `titleAs` 的取值集合恰为 `h2` / `h3` / `h4`，默认 `h3`。
3. `title` 非空时渲染的是标题元素，不得渲染成 `<div>` 加粗。
4. `titleAs` 只影响标签：`.title` 的 `font-size` / `line-height` / `font-weight` 为固定声明，不随 `titleAs` 变化。
5. 卡片根元素不绑定 `onClick` / `onKeyDown` / `onKeyUp`（源码中无交互处理）。
6. 边框与阴影二选一：`.card` 同时出现 `border` 与 `box-shadow` 即违规（本仓库建议值，理由见上）。
7. `.card` 声明 `box-sizing: border-box`。
8. `.description` 的颜色为 `--dsw-alias-label-secondary`，不得与 `.title` 同色。
9. `card.module.css` 中不出现十六进制颜色字面量（`#`）、`rgb(`、`hsl(`；颜色全部走 `var(--dsw-*)`。
10. `.card` 不出现 `:focus-visible`（组件内无交互元素）；若新增交互元素必须同时补焦点样式（`AC-MF-10`）。
11. 类名拼接顺序为「基础类 + 外部 className」，外部类名最后追加，以便覆盖。
12. 不 import 除 `react` 以外的任何运行时依赖（含 `@deepseek-ai/*`）。

## demo

- `components/surfaces/Card/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 相关条款：`spec/60-accessibility.md`（`AC-MF-10`、`AC-MF-11`）
