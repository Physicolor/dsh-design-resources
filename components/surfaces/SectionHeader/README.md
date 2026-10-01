# SectionHeader 区块表头

设置页里每一组设置的抬头：一行标题 + 一句话副标题 + 一条底部 hairline。

## 是什么

零依赖的 `<div>` 包装，只 import `react` 与 CSS Modules。三件事：

| 部分 | 渲染成 | 排版 |
| --- | --- | --- |
| `title` | `<h2>`（`titleAs` 可换成 `h3` / `h4`） | 18px / 600，`--dsw-alias-label-primary`（§ 本仓库建议值） |
| `description` | `<p>`，可不传 | `var(--dsw-font-xs-13)`（13/20），`--dsw-alias-label-tertiary` |
| hairline | 容器自身的 `border-bottom` | `0.5px solid var(--dsw-alias-border-l2)` |

组件不带任何外边距（`margin` 交给使用方），只负责自己的高度与那条 hairline；
区块之间的纵向间距请在使用方用统一的间距档控制。

## 什么时候用

- 设置页 / 首选项面板里，把一组相关选项和一个标题对齐。
- 长表单需要分段，每段要一句说明「这一组是干什么的」。
- 内容区需要跟导航或页面标题拉开层次，靠 hairline 而不是靠加粗。

## 什么时候不要用

- 对话框标题：那是 `Modal` 的 `.title` 几何（16/24/500），层级和间距都不同，别混用。
- 卡片内部的标题：用 `Card` 的 `title` 插槽（16/24/500），区块表头的 18px 在卡片里会顶破层级。
- 需要可展开 / 可折叠的组：那是一个折叠控件（`DisclosureRow` 一类），标题要能点击、要带展开状态。
- 只想要一条分隔线：直接用 `border-top: 0.5px solid var(--dsw-alias-border-l2)`，不要为了画线塞一个空标题。
- 页面主标题：那是 `h1`，一个页面只应有一个。

## 几何来源

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| 副标题 `font: var(--dsw-font-xs-13)`（13px / 20px） | `ReadBlock.module.css` `.count`、`.copyButton`（官方对这条合成 token 的实际用法）；token 本体定义在官方主题，demo 脚手架的 `:root` 里逐字内联 |
| 副标题色 `var(--dsw-alias-label-tertiary)` | `Menu.module.css` `.label`；`ReadBlock.module.css` `.count` / `.lang`（官方把补充说明设为该 token） |
| `border-bottom: 0.5px solid var(--dsw-alias-border-l2)` | `markdown/MarkdownText.module.css` `.markdown hr`（`height: 0.5px` + `background: var(--dsw-alias-border-l2)`）；同款 hairline 写法见 `Menu.module.css` `.footer` 的 `border-top` |
| 标题色 `var(--dsw-alias-label-primary)` | `Modal.module.css` `.title` |
| 副标题的 `font` 简写写法（而不是 `font-size` + `line-height`） | `ReadBlock.module.css` `.count`（`font: var(--dsw-font-xs-13)`） |

**本仓库建议值（非官方数值）：**

- **标题 `18px` + `font-weight: 600` + `line-height: 26px`：来自官方设置页的实测值，不是本仓库发明的。**
  锚点是官方设置页自己的表头——Agent Presets 与 Models 页的 `h2.<hash>_title` 与 `p.<hash>_intro`——对已发布的 Web UI 实测得到 `18px/26px/600 + var(--dsw-alias-label-primary)`。同一份实测还给出了副标题 `13px/20px` 与 hairline 的写法，记录见 dsh-ui-harmonizer 的 `docs/settings-section-style.md`（该文档标题即写明 "measured against the shipped web UI"）。
  为什么在官方 primitives 包里找不到这个字号：primitives 的 `.module.css` 里确实没有任何 `18px`（已逐文件确认），因为设置页样式在 `@deepseek-ai/dsh-client-ui-settings` 的构建产物中，而本机该包的 junction 已失效、读不到原文。**读不到原文不等于该数值没有官方依据**——依据来自对渲染结果的实测。
- `.sectionHeader { gap: 4px }`：4 的倍数，且 4px 是官方最小的间距档（`Button.module.css` `.button`、`Pill.module.css` `.pill` 的 `gap: 4px`）。
- `.sectionHeader { padding-bottom: 12px }`（副标题到 hairline 的距离）：4 的倍数；取 12px 与官方内联内容的纵向间距同档（`HoverCard.module.css` `.card` 纵向 `padding: 12px`、`ReadBlock.module.css` `.body` 纵向 `padding: 12px`）。再小（8px）hairline 会贴住文字降部，再大（16px）表头会显得空。
- `titleAs` 默认 `h2` 与 `description` 用 `<p>` 渲染：API 选择，不是数值。设置页的大纲是「页面 `h1` → 区块 `h2`」，所以默认 `h2`；视觉完全由 CSS 决定，改 `titleAs` 不会改字号。

实现为本仓库原创（用 CSS 变量承载几何 + 一个容器同时表达标题、副标题与 hairline）。

## 可访问性要点

- **标题必须是真标题**：`title` 渲染成 `<h2>`（`titleAs` 可改级别），这是屏幕阅读器在设置页里按标题跳转的锚点。不要把标题写成 `<div>` + 加粗。
- 按大纲选级别，不要按视觉选级别：字号由 CSS 固定，`titleAs` 只影响标签。页面 `h1` 只有一个，区块用 `h2`，区块内的子组用 `h3`。
- 副标题是补充，不是正文：不要把它当成唯一的信息载体（三级色 + 13px 对低视力用户可读性最差），关键约束（如「此操作不可撤销」）应放进正文或用状态的语义色。
- hairline 是装饰，不承载语义。区块之间的分隔不能只靠这条线，仍要有间距；也不要为过不了对比度的浅线调深颜色。
- `font: var(--dsw-font-xs-13)` 依赖宿主注入该合成 token：宿主没注入时这条声明整体无效，副标题会退回继承字号（不会崩版）。本仓库 `demo.html` 已在 `:root` 内联该 token。
