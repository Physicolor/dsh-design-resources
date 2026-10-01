# PanelSeat · SPEC

- id: panel-seat
- category: patterns
- source: `components/patterns/PanelSeat/`（`index.tsx` / `panel-seat.module.css`）
- official-counterpart: 无。官方 `lib/index.js` 的导出列表里没有这个骨架；每条几何都锚定一个已核实数值，逐条见下
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

逐条读作「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| 容器圆角 `12px` | `ReadBlock.module.css` → `.block`（`--dsl-read-radius: 12px`） |
| `surface` 底色 `--dsw-alias-markdown-code-block` | `ReadBlock.module.css` → `.block`（`background`） |
| 标题行 `gap: 12px` | `ReadBlock.module.css` → `.banner`（`gap: 12px`） |
| 标题 `font-size: 14px` / `line-height: 22px` | `Button.module.css` → `.button`、`Modal.module.css` → `.description` |
| 标题 `font-weight: 500` | `Modal.module.css` → `.title`、`Tag.module.css` → `.tag`（`font-weight: 500`） |
| 标题行底部 hairline `0.5px` + `--dsw-alias-border-l1` | `Menu.module.css` → `.separator`（`height: 0.5px` / `background: var(--dsw-alias-border-l1)`） |
| 操作区 `gap: 4px` | `Button.module.css` → `.button`（`gap: 4px`） |
| `inset` 内边距 `12px 16px` | `HoverCard.module.css` → `.card`（`padding: 12px 16px`） |

两处「借用」而非「同用途」，说明如下：

- 官方 `.separator` 是独立元素，本组件把同样的 **0.5px 宽度 + `--dsw-alias-border-l1` 颜色**改由
  `border-bottom` 承载，因此不会出现官方那种「上下各 4px 留白」——标题行与正文之间只留一组内边距。
- `12px 16px` 来自官方 `HoverCard` 的浮层内边距；本组件与它同为「浮在内容之上的小块」，量级可比。

### 本仓库建议值（无官方来源）

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

### 实现说明

实现为本仓库原创（用 CSS 变量承载几何 + 单类切换），未复制官方 CSS 源码。

## api

`PanelSeatProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>`，`forwardRef<HTMLDivElement, PanelSeatProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | 必填 | 标题行文本；`aria-labelledby` 指向它 |
| `actions` | `ReactNode` | 无 | 标题行右侧的操作区，通常是 1 个 `sm` 尺寸的 `Button` |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | 标题的语义级别 |
| `variant` | `'plain' \| 'surface'` | `'plain'` | `plain` 透明底；`surface` 填 `--dsw-alias-markdown-code-block` |
| `inset` | `boolean` | `false` | 是否给容器加 `12px 16px` 内边距 |
| `role` | `string` | 无（组件默认补 `'group'`） | 显式传入时覆盖默认角色，例如 `'region'` |
| `className` | `string` | 无 | 与内部类名拼接 |
| 其余 | `Omit<HTMLAttributes<HTMLDivElement>, 'title'>` | — | 透传到根 `<div>` |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到根 `<div>` |

`PanelHeadingLevel` 为导出的类型别名。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认 | 始终 | 根元素 `display: inline-flex` + `flex-direction: column` + `max-width: 100%`，圆角 12px |
| 透明底 | `variant === 'plain'`（默认） | 无背景色，靠排版与父容器区分 |
| 纸面感 | `variant === 'surface'` | `background: var(--dsw-alias-markdown-code-block)` |
| 无内边距 | `inset === false`（默认） | 容器不加 padding，间距交给宿主 |
| 有内边距 | `inset === true` | `padding: 12px 16px` |
| 默认角色 | 未显式传 `role` | 根元素 `role="group"`，不产生地标 |
| 显式地标 | 传入 `role="region"` | 根元素角色被覆盖，成为可跳转区域 |
| 标题超长 | 标题超出可用宽度 | `text-overflow: ellipsis` + `white-space: nowrap` + `overflow: hidden` |
| 无操作区 | `actions == null` | 操作区不渲染 |
| 正文首尾元素 | 始终 | `.body > :first-child { margin-top: 0 }`、`.body > :last-child { margin-bottom: 0 }` |
| 焦点与交互 | — | 组件自身不设 `tabIndex`、不 `autoFocus`、不监听全局按键；hover / active / disabled 均未定义 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-primary` — 标题与正文文字色
- `--dsw-alias-border-l1` — 标题行底部 hairline
- `--dsw-alias-markdown-code-block` — `surface` 形态底色

组件级 CSS 变量（本仓库内部，不是 DSH token；定义在 `.seat`）：

- `--dsh-pseat-radius` = `12px`
- `--dsh-pseat-pad-x` = `16px`
- `--dsh-pseat-pad-y` = `12px`
- `--dsh-pseat-gap` = `12px`
- `--dsh-pseat-header-gap` = `8px`（`§ 建议值`）
- `--dsh-pseat-action-gap` = `4px`
- `--dsh-pseat-body-gap` = `12px`（`§ 建议值`）

## a11y

- 不抢焦点：组件不设 `tabIndex`、不做 `autoFocus`、不监听全局按键，也不会在挂载时移动焦点。插件插入一个区块不应该把用户的输入焦点从输入框里夺走。
- 标题行是真正的标题元素（默认 `<h3>`），`aria-labelledby` 指向它，辅助技术能念出「这是哪个区块」。同一会话里插入多个 PanelSeat 时，标题文本要能互相区分（「构建结果」而不是「结果」）。
- 默认 `role="group"`，不产生地标；需要让用户用快捷键在区块间跳转时才传 `role="region"`，并控制数量（`FL-RC-05` 建议同一段内可见控件不超过 6 个，地标同理宜少不宜多）。
- 标题超长会省略号截断（`text-overflow: ellipsis`）。不要把只有视觉省略号、没有 `title` 属性的关键信息放在标题里——屏幕阅读器读得到，明眼用户读不全；关键信息放正文。
- `actions` 里的按钮必须自己带可读文本或 `aria-label`（尤其仅图标按钮）。
- 正文里的交互控件遵守顺序：`role="group"` 不改变 Tab 顺序，键盘会按 DOM 顺序走完标题行操作再进正文。
- 正文首尾元素的外边距被清零，避免与容器内边距叠出双层留白（不影响焦点环与命中区）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 根元素输出 `aria-labelledby`，且指向标题元素的 `id`。
2. 未显式传 `role` 时，根元素角色为 `group`；传入 `role` 时以传入值为准（不得被默认值覆盖）。
3. 源码中不出现 `tabIndex`、`autoFocus`、`document.addEventListener`、`focus()` 调用。
4. `headingLevel` 渲染为 `h2`–`h6` 之一，不渲染 `h1`。
5. 容器为 `display: inline-flex` + `max-width: 100%`（不铺满宽度），可由父容器以 `width: 100%` 覆盖。
6. `variant === 'surface'` 时底色为 `--dsw-alias-markdown-code-block`；`plain` 时不声明 `background`。
7. `inset === true` 时 padding 为 `12px 16px`；`false` 时容器无 padding。
8. 标题行 `border-bottom` 宽度为 `0.5px`、颜色为 `--dsw-alias-border-l1`。
9. 正文首尾元素的外边距为 0（`.body > :first-child` / `.body > :last-child` 两条规则均存在）。
10. 标题元素声明 `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap`。
11. `actions == null` 时不渲染操作区容器。
12. 组件不 import 仓库内其它组件（源码中无相对路径 import，仅 `react` 与自身 CSS Modules）。
13. 会话流内插入时不得自带外间距（`.seat` 不声明 `margin`），间距交由宿主控制（`FL-AD-07` 建议 16px）。
14. 放置位置必须是会话区座位（`conversation.view` / `conversation.session` / `conversation.input.dock` 之类的纵向插入点），不得用于设置页或右栏（人审，`spec/10-frame-layout.md` 第 4 节）。
15. 同一段会话内相邻 PanelSeat 的标题文本不得重复（人审，见 `README.md`「怎么用得好」）。
16. `actions` 内的可见控件不超过 2 个（`FL-RC-05` 的同一段可见控件上限为 6，其中一块内容只应占用少量，对应 `spec/70-checklist.md` 的 `B01`，人审）。

## demo

- `components/patterns/PanelSeat/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A43`、`B01`）
- 跨区域决策与间距条款：`spec/10-frame-layout.md`（`FL-AD-07`、`FL-RC-05`）
