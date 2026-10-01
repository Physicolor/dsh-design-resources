# SettingsRow 设置项行

设置面板里的一行：左边标题（可选说明），右边控件，行间一条 hairline。

## 是什么

根节点是 `<label>` 的布局行：

- `.text` 竖排：标题（14/22）+ 可选说明（13/20）；
- `.control`：`flex: none` 的右侧控件区（`Switch` / `Input` / `Button` / `<select>`）；
- `.divider`：`0.5px` 的 `var(--dsw-alias-border-l2)`。

| 尺寸 | 值 |
| --- | --- |
| 最小高度 | 44px |
| 上下内边距 | 12px |
| 左右内边距 | 12px |
| 文字区与控件区间距 | 12px |
| 标题与说明间距 | 4px |
| 圆角 | 10px |

因为根节点是 `<label>`，把控件放进 `control` 之后**点标题就能操作控件**，不需要 `htmlFor`。
零依赖，只用到 `react` 和 CSS Modules。

## 什么时候用

- 设置面板 / 首选项页面里「一个开关控制一件事」的行。
- 需要标题 + 一行解释（13/20 灰色小字）的设置项。
- 一侧是标签、另一侧是输入框或下拉的表单行。

## 什么时候不要用

- 侧边栏 / 导航列表的可选中行：用 `SidebarRow`（它是按钮，有选中语义）。
- 表单里的多字段堆叠（标签在上、输入在下）：用常规 `<label>` + 表单布局，本行是左右分栏。
- 一行里有多个并列控件时：`control` 里塞多个控件是允许的，但若彼此语义不相关，请拆成两行。
- 可点整行跳转的入口：那是 `SidebarRow`，设置行表达的是「改一个值」不是「去一个地方」。

## 几何来源

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| 标题 `font-size: 14px; line-height: 22px` | `Button.module.css` `.button`（面板/设置项标题沿用这一档字号，与 `PanelHeader` 一致） |
| 标题色 `var(--dsw-alias-label-primary)` | `Modal.module.css` `.title` / `Button.module.css` `.button` |
| 说明 `font: var(--dsw-font-xs-13)`（13px/20px）+ `var(--dsw-alias-label-tertiary)` | 合成 token `--dsw-font-xs-13` 由本仓库 demo 脚手架与官方主题定义（`ReadBlock.module.css` 的 `.count` 即用它）；`--dsw-alias-label-tertiary` 见 `Menu.module.css` `.itemIcon` |
| 分隔线 `0.5px` + `var(--dsw-alias-border-l2)` | `Menu.module.css` `.footer`（`border-top: 0.5px solid var(--dsw-alias-border-l2)`） |
| `border-radius: 10px` | `Menu.module.css` `.item`（`border-radius: 10px`）——只为让悬停底不露直角 |
| 悬停底 `var(--dsw-alias-interactive-bg-hover)` | `Menu.module.css` `.item:hover:not(:disabled)` / `Button.module.css` `.ghost:hover` |

`--dsw-alias-label-primary` / `--dsw-alias-label-tertiary` / `--dsw-alias-border-l2` / `--dsw-alias-interactive-bg-hover` 均在 `website/css/dsh-tokens.css` 中查到（第 139 / 142 / 104 / 130 行，light 与 dark 两套都有）。

**为什么分隔线用 `border-l2` 而不是 `border-l1`：** 官方把 `l2` 用在「浮层/分区与外部之间的边界」（`Menu.module.css` `.footer` 的顶边，注释原话：*l1 is near-invisible on the menu surface*），把 `l1` 用在同层内容分隔（`.separator`）。设置项之间是一条需要看得见的分区线，因此取 `l2`。

**本仓库建议值（非官方数值，全部为 4 的倍数）：**

- `min-height: 44px`：官方没有设置行。44 的取法：标题行高 22 + 上下各 11px 视觉留白 → 取 4 的倍数 44；同时保证右侧放一个 28px 的图标按钮（官方 `Modal.module.css` `.close` 的 28×28）时上下各余 8px。
- `padding: 12px`（上下、左右同值）：`12` 是 4 的倍数，也是本仓库面板类组件的统一水平节奏（`PanelHeader` 的 `md` 档同样是 12px），把设置面板与面板标题栏左对齐。
- `gap: 12px`（文字区 ↔ 控件区）：4 的倍数。取 12px 而不是 8px，是为了让「标签」和「开关」之间有明确的呼吸感——8px 在长标题行上会让两者视觉粘连。
- `.text` 的 `gap: 4px`：官方 `Button.module.css` `.button` 的 `gap: 4px` 同值，用于标题与说明之间。
- `.control` 的 `gap: 8px`：官方 `Menu.module.css` `.item` 的 `gap: 8px` 同值，一行里放多个控件时用。
- `.row:hover` 的整行悬停底：官方没有任何「设置行」可参照。加它是因为本组件根节点可点（`<label>`），需要让鼠标用户看出来。若你不希望行有悬停反馈，请自行覆盖 `.row:hover` 的 `background`。
- 圆角 `10px` 纯为悬停底服务；不想要悬停底也就不需要圆角。
- hairline 用 `box-shadow: inset 0 -0.5px 0 0` 而非官方 `border-bottom`：本行有 `min-height` 和圆角，`border-bottom` 会把总高度顶成 44.5px，且会被圆角切成弧线。`box-shadow` 不参与布局。

实现为本仓库原创（CSS 变量承载几何 + 单类切换分隔线），几何等价但不是官方 CSS 的复制。

## 可访问性要点

- 根节点是 `<label>`，行内的第一个表单控件会被它隐式关联——**一行只放一个表单控件**，放两个会导致标签指向第一个、第二个没有名字。多个控件请各自给 `aria-label`。
- `<label>` 上的 `onClick` 会被控件自身也触发一次（事件冒泡），在 `onClick` 里做切换逻辑时注意别切两次；能交给控件自己的 `onChange` 就交给控件。
- 标题是 `<span>` 不是标题元素。如果整块设置区有 `<section>` 语义，请自行给该 section `aria-labelledby` 或直接用字段集 `<fieldset><legend>`。
- 右侧控件若是仅图标按钮，必须给 `aria-label`；`Switch` 必须给 `aria-label`（官方 `Switch` 的 `role="switch"` 需要一个可读名字）。
- 说明文字是灰色 13/20（`var(--dsw-alias-label-tertiary)`）：它承载的是补充信息，不要把「必须知道才能操作」的内容只写在说明里——对比度低、某些用户会忽略。
- 行间分隔线是纯装饰，不要给它语义。
