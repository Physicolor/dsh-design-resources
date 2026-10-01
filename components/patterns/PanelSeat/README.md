# PanelSeat 会话区插槽容器

插件往会话流里插入一个区块时的骨架：一个带标题行的容器。

## 是什么

一个 `<div role="group">`，里面是「标题行（标题 + 右对齐操作区）+ 正文」两段。
正文与操作全部由调用方通过 `children` / `actions` 插槽传入。

| 属性 | 作用 |
| --- | --- |
| `title` | 必填。标题文本，同时作为 `aria-labelledby` 的目标 |
| `actions` | 标题行右侧的操作区，通常放 1 个 `Button size="sm"` |
| `headingLevel` | 标题的语义级别，默认 `3` |
| `variant` | `plain`（默认，透明底）/ `surface`（官方代码块同款底色） |
| `inset` | 是否给容器加 `12px 16px` 内边距，默认 `false` |

零依赖，只用到 `react` 和 CSS Modules。不 import 仓库内任何其它组件。

## 什么时候用

- 插件要在会话流（`conversation.view` / `conversation.session`，或 `conversation.input.dock` 之类的纵向插入点）里
  放一块**自带说明的结构化内容**：构建结果、引用来源、待确认项、插件的局部状态。
- 这块内容需要有标题、且标题右边有一两个操作。
- 内容宽度不定，希望按内容收缩而不是硬撑满整行。

## 什么时候不要用

- **不是会话内容**：全局设置、对象切换分别属于设置页与左栏（`spec/10-frame-layout.md` 第 4 节），
  不要借会话流的壳把它们塞进来。
- **只是一个短提示**：用 `Toast`（瞬时）或 `Tag`（静态标签），不要为一行字套一个带标题的容器。
- **需要用户必须先处理才能继续**：用 `Modal` 或 `RiskConfirmation`。PanelSeat 是会话流里的一块内容，
  默认不抢焦点、不拦截操作，**不适合承载必经流程**。
- **需要常驻可见、与当前会话弱相关的面板**：那属于右栏，不属于会话流。
- **就是一个等宽代码/输出块**：用 `ReadBlock` / `CodeBlock` / `TerminalBlock`，它们已经处理了行号与横向滚动。
- **面板 / 抽屉 / 侧栏顶部的标题条**：用 `PanelHeader`（固定 44px / 36px 高度、标题不是标题元素、左右 12px 内边距）。PanelSeat 没有固定高度、宽度按内容收缩，标题是真 heading 并用 `aria-labelledby` 关联——职责与几何都不同，不要互替。

## 几何来源

官方**没有** PanelSeat 对应物（`lib/index.js` 的导出里没有这个骨架）。每条几何都是锚定一个已核实数值：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| 容器圆角 `12px` | `ReadBlock.module.css` `.block`（`--dsl-read-radius: 12px`） |
| `surface` 底色 `--dsw-alias-markdown-code-block` | `ReadBlock.module.css` `.block`（`background`） |
| 标题行 `gap: 12px` | `ReadBlock.module.css` `.banner`（`gap: 12px`） |
| 标题 `font-size: 14px` / `line-height: 22px` | `Button.module.css` `.button`、`Modal.module.css` `.description` |
| 标题 `font-weight: 500` | `Modal.module.css` `.title`、`Tag.module.css` `.tag`（`font-weight: 500`） |
| 标题行底部 hairline `0.5px` + `--dsw-alias-border-l1` | `Menu.module.css` `.separator`（`height: 0.5px` / `background: var(--dsw-alias-border-l1)`） |
| 操作区 `gap: 4px` | `Button.module.css` `.button`（`gap: 4px`） |
| `inset` 内边距 `12px 16px` | `HoverCard.module.css` `.card`（`padding: 12px 16px`） |

说明两处「借用」而非「同用途」：

- 官方 `.separator` 是独立元素，本组件把同样的 **0.5px 宽度 + `--dsw-alias-border-l1` 颜色**改由
  `border-bottom` 承载，因此不会出现官方那种「上下各 4px 留白」——标题行与正文之间只留一组内边距。
- `12px 16px` 来自官方 `HoverCard` 的浮层内边距；本组件与它同为「浮在内容之上的小块」，量级可比。

**本仓库建议值（无官方来源）：**

- `.seat` 用 `display: inline-flex` + `max-width: 100%`：**会话流里不该铺满宽度**。官方 `ReadBlock.module.css`
  的 `.block` 不设宽度（块级、随父容器），它的宽度由宿主内容列决定；PanelSeat 是插件自加的块，
  收缩到内容宽度可以避免一条两行字的提示占满整个消息区。需要撑满时由父容器给 `width: 100%`。
- 标题行 `padding-bottom: 8px`：4 的倍数；给标题文字与 hairline 之间留呼吸。
- 正文 `padding-top: 12px`：4 的倍数；与 `--dsh-pseat-gap: 12px` 取同一量级，让标题行上下节奏一致。
- `role="group"` 而非让 `<section>` 变成 `region` landmark：官方侧没有约定，本仓库选择「不产生地标」——
  一次会话里可以出现十几个 PanelSeat，若每个都注册 `region`，屏幕阅读器的地标列表会失去意义。
  需要地标时显式传 `role="region"`。
- `inset` 默认 `false`：会话流的行间距由宿主控制（`spec/10-frame-layout.md` `FL-AD-07` 建议 16px）。
  容器再加一圈内边距会与宿主间距叠加成双层留白；只有 `variant="surface"` 需要独立纸面感时才开 `inset`。
- 正文首尾元素 `margin-top/bottom: 0`：避免与容器内边距叠出双层留白。

实现为本仓库原创（用 CSS 变量承载几何 + 单类切换），未复制官方 CSS 源码。

## 该和哪些组件搭配

- 标题行右侧的操作：`Button`（`size="sm"`，`variant="ghost"`）。
- 正文里的清单：`ListRowGroup` + `ListRow`。
- 正文里的状态：`StateDot`（`done` / `ongoing` / `warning` / `error`）。
- 正文里的标签：`Tag`；正文里的等宽内容：`CodeBlock` / `ReadBlock`。
- 需要用户确认才能继续时，不要在这里硬塞按钮，改用 `RiskConfirmation` / `Modal`。

## 可访问性要点

- **不该抢焦点**：组件不设 `tabIndex`、不做 `autoFocus`、不监听全局按键，也不会在挂载时移动焦点。
  插件插入一个区块不应该把用户的输入焦点从输入框里夺走。
- 标题行是真正的标题元素（默认 `<h3>`），`aria-labelledby` 指向它，因此辅助技术能念出「这是哪个区块」。
  同一个会话里插入多个 PanelSeat 时，标题文本要能互相区分（「构建结果」而不是「结果」）。
- 默认 `role="group"`，不产生地标；需要让用户用快捷键在区块间跳转时才传 `role="region"`，
  并控制数量（`spec/10-frame-layout.md` `FL-RC-05` 建议同一段内可见控件不超过 6 个，地标同理宜少不宜多）。
- 标题超长会省略号截断（`text-overflow: ellipsis`）。**不要**把只有视觉省略号、没有 `title` 属性的关键信息
  放在标题里——屏幕阅读器读得到，但明眼用户读不全；把关键信息放正文。
- `actions` 里的按钮必须自己带可读文本或 `aria-label`（尤其仅图标按钮）。
- 正文里的交互控件要遵守顺序：`role="group"` 不改变 Tab 顺序，键盘会按 DOM 顺序走完标题行操作再进正文。
