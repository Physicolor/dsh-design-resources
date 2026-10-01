# Card 卡片

内联内容卡片：一层 `--dsw-alias-bg-layer-2` 底色 + 一条 0.5px hairline 描边，
可选标题 / 说明 / 正文 / 底部四个插槽。

## 是什么

零依赖的 `<section>` 包装，只 import `react` 与 CSS Modules。四个插槽全部可选：

| 插槽 | 渲染成 | 排版 |
| --- | --- | --- |
| `title` | `<h3>`（`titleAs` 可换成 `h2` / `h4`） | 16px / 24px / 500，`--dsw-alias-label-primary` |
| `description` | `<p>` | 14px / 22px，`--dsw-alias-label-secondary` |
| `children` | `<div>`（正文） | 继承 14px / 22px，`--dsw-alias-label-primary` |
| `footer` | `<div>` | 与正文之间一条 0.5px `--dsw-alias-border-l2` hairline |

四个插槽都不传时卡片只剩一个空的描边盒子——没有内容就不要渲染卡片。

## 什么时候用

- 把一组相关信息收进一个视觉整体：统计摘要、设置分组、插件详情、空状态说明。
- 页面上并排几块内容、需要一眼看出边界。
- 需要「标题 + 说明 + 正文 + 底部操作」这种固定结构，又不想每次重写间距。

## 什么时候不要用

- 浮在页面之上的层：用 `Modal` / `Drawer` / 菜单，它们用 elevation 表达「浮起来」，卡片用的是贴地的 hairline。
- 列表项：一排卡片会把列表读成「一堆并列的盒子」而不是「一条序列」，长列表应该用行 + hairline 分隔。
- 整块可点击：卡片没有交互语义。要点整块跳转，请把内容放进 `<a>` / `<button>`，或把操作放进 `footer`。
- 只想要一个背景色块：直接给容器 `background: var(--dsw-alias-bg-layer-2)`，不必套卡片。
- 卡片里再套卡片：两层描边会把间距读乱，内层改用分组标题 + 间距。

## 几何来源

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| `border-radius: 12px` | `HoverCard.module.css` `.card`；`ReadBlock.module.css` `.block` 的 `--dsl-read-radius: 12px` |
| `border: 0.5px solid var(--dsw-alias-border-l1)` | `markdown/MarkdownText.module.css` `.markdown :not(pre) > code`；同一几何也出现在官方合成 token `--dsw-elevation-stroke: 0 0 0 .5px var(--dsw-elevation-stroke-color)`（该 token 的颜色即 `--dsw-alias-border-l1`） |
| `background: var(--dsw-alias-bg-layer-2)` | `Modal.module.css` `.dialog`（官方浮层底色用的同一 token） |
| 标题 `16px` / `line-height: 24px` / `font-weight: 500` | `Modal.module.css` `.title` |
| 正文 `14px` / `line-height: 22px` | `Modal.module.css` `.description` |
| 说明文字色 `var(--dsw-alias-label-secondary)` | `Modal.module.css` `.close`、`Pill.module.css` `.pill`（官方把次级文字设为该 token 的两处） |
| footer 上方 hairline `0.5px` + `var(--dsw-alias-border-l2)` | `Menu.module.css` `.footer`（`border-top: 0.5px solid var(--dsw-alias-border-l2)`） |

**本仓库建议值（非官方数值）：**

- `padding: 16px`：官方没有对应的内联卡片。取 16px——它是 4 的倍数，并且与官方 `HoverCard.module.css` `.card` 的水平内边距 `16px` 同档；再小（12px）配 16/24 的标题会显得挤，再大（24px，那是 Modal 对话框的水平内边距）对卡片来说过空。
- `.card { gap: 12px }`（插槽之间的纵向间距）：4 的倍数，取 12px 是因为官方 `HoverCard.module.css` `.card` 的纵向内边距、`ReadBlock.module.css` `.body` 的纵向内边距都是 `12px`，同一档间距。
- `.header { gap: 4px }`（标题与说明之间）：4 的倍数，且 4px 是官方最小的间距档（`Button.module.css` `.button` 的 `gap: 4px`、`Pill.module.css` `.pill` 的 `gap: 4px`）。
- `.footer { padding-top: 12px }`：与插槽间距同档（12px），让 hairline 上下的呼吸一致。
- **边框与阴影二选一：本组件选 `border: 0.5px solid var(--dsw-alias-border-l1)`，不用 `box-shadow: var(--dsw-shadow-lv1)`。** 理由：官方用阴影的场合全是「脱离文档流的浮层」——`HoverCard.module.css` `.card` 用 `--dsw-shadow-lv3`、`Menu.module.css` `.list` 与 `Modal.module.css` `.dialog` 用 `--dsw-elevation-prominent`；而官方真正的内联容器（`ReadBlock.module.css` `.block`）只有底色、没有高程。卡片并排出现时，逐张投影会互相叠出脏边，hairline 才是官方内联这一层的语言。
- 代价说明：`0.5px` 描边在 `box-sizing: border-box` 下让盒子每边多占 0.5px（合计 1px），这是刻意的实描边，不是 padding 的一部分。

实现为本仓库原创（用 CSS 变量承载几何 + 单类槽位结构），几何等价但不是官方 CSS 的复制。

## 可访问性要点

- 根元素是 `<section>`，`title` 默认渲染成 `<h3>`。标题级别由 `titleAs` 决定，请跟页面大纲走（页面标题 `h1` → 区块 `h2` → 卡片 `h3`），不要为了字号跳级；`titleAs` 只改标签，不改视觉。
- 卡片是纯容器，不承载交互：不要给它加 `onClick` 而不给键盘出口。整块可点的卡片对键盘和屏幕阅读器都不可用。
- 给卡片命名时用真实标题（`title`）而不是 `aria-label`——屏幕阅读器的「跳到某个区块」列表读的是标题。
- `description` 是说明而不是必读内容：把关键信息放正文，别把唯一的状态提示塞进次级色小字里。
- 颜色只走 `var(--dsw-*)`：卡片本身不写死颜色，因此浅色 / 深色主题都成立。
