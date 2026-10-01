# ListRowGroup 列表行组

分组标题 + 一组成员行 + 行间分隔线。

## 是什么

导出三个组件：

| 导出 | 作用 |
| --- | --- |
| `ListRowGroup` | 行组外壳。`title` 是分组标题，`children` 是行 |
| `ListRow` | 一行。默认渲染 `<div>`（展示行，行内可放按钮）；`interactive` 时渲染 `<button>` |
| `ListRowSeparator` | 独立分隔线元素，用于需要官方那种留白的场合 |

行几何与官方菜单单元一致（`min-height: 40px` / `padding: 8px 10px` / `border-radius: 10px`），
但它是**布局行**，不自带菜单语义。

零依赖，只用到 `react` 和 CSS Modules。不 import 仓库内任何其它组件。

## 什么时候用

- 设置页、右栏面板、插件弹层里的一串**同类条目**：开关项、导航项、文件项、结果项。
- 需要给这一串条目一个**小标题**（「启动行为」「已连接的账号」）来分组。
- 行之间需要 0.5px 的 hairline 分隔（行间距为 0，靠线而不是靠空隙分段）。

## 什么时候不要用

- **行自己就是一次「动作」且需要明确的按钮外观**：用 `Button`。`ListRow interactive` 提供的是
  整行可点的列表语义，不是按钮的视觉重量。
- **是互斥选项**：用 `Pill` 或 `Switch`。行组不表达「选中状态」，`aria-current` / `aria-checked`
  要由行内的控件自己声明。
- **是浮层菜单**：官方 `Menu` 已经提供菜单卡（圆角 20px、`box-shadow: var(--dsw-elevation-prominent)`、
  4px 内边距、键盘上下导航）。ListRowGroup 没有菜单的键盘模型与浮层外观，浮层里请用 `Menu`。
- **行数很少（1–2 行）且属于别的内容块**：不要为两行套一个带标题的分组，直接写。
- **需要在行里放多个可交互控件**：不要用 `interactive`（会嵌套按钮）；改用默认的 `<div>` 行，
  把操作放在行的右侧，并自己保证点击区域不重叠。
- **设置面板里「标签 + 控件」的表单行**：用 `SettingsRow`（根节点是 `<label>`，点标题就能操作右侧控件）。`ListRow` 是列表 / 菜单语义的行，不是表单行。

## 几何来源

官方**没有** ListRowGroup 对应物（`lib/index.js` 的导出里没有行组）。每条几何都取自官方菜单的对应单元：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| 分组标题 `padding: 8px 10px`、`font-size: 12px`、`line-height: 16px` | `Menu.module.css` `.label` |
| 分组标题颜色 `--dsw-alias-label-tertiary` | `Menu.module.css` `.label`（`color`） |
| 行 `min-height: 40px`、`padding: 8px 10px`、`border-radius: 10px`、`gap: 8px`、`font-size: 14px`、`line-height: 22px` | `Menu.module.css` `.item` |
| 行文字颜色 `--dsw-alias-label-primary` | `Menu.module.css` `.item`（`color`） |
| 行 hover 底色、active 底色 | `Menu.module.css` `.item:hover:not(:disabled)`；active 用 `Button.module.css` `.ghost:active` 的 `--dsw-alias-interactive-bg-active` |
| 行 disabled `opacity: 0.4` | `Menu.module.css` `.item:disabled` |
| 前置图标容器 `16×16` + `--dsw-alias-label-tertiary` | `Menu.module.css` `.itemIcon` |
| 行文字省略（`min-width: 0` / `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap`） | `Menu.module.css` `.itemLabel` |
| 行间距 `0` | `Menu.module.css` `.list`（`gap: 0`） |
| 分隔线 `height: 0.5px`、`margin: 4px 2px`、`background: var(--dsw-alias-border-l1)` | `Menu.module.css` `.separator` |
| 自动 hairline 的宽度与颜色（`0.5px` + `--dsw-alias-border-l1`） | 同上（`Menu.module.css` `.separator`），改由 `border-top` 承载 |
| 尾部内容 `gap: 8px` | `Menu.module.css` `.item`（`gap: 8px`）、`.check` 的 `flex: none` |

**本仓库建议值（无官方来源）：**

- 自动 hairline 用 `.rows > * + * { border-top: 0.5px solid var(--dsw-alias-border-l1) }` 实现：
  官方是让调用方插入独立 `.separator` 元素。本仓库默认自动画（省掉调用方的插入负担），
  但**不复制**官方两侧各 2px、上下各 4px 的留白——边框贴着行边，行本身已有 8px 内边距。
  需要官方那种带留白的分隔线时，传 `separator="none"` 并自行插入 `ListRowSeparator`。
  两者同时用会出现双线。
- `.groupLabel` 的 `font-weight: inherit`：官方 `.label` 不设字重（继承父级），
  而本组件的标题用 `<hN>` 承载语义，浏览器默认会给标题加粗，因此显式继承以还原官方观感。
- `interactive` 行的 `:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px }`：
  官方 `Menu.module.css` 没有定义在 `.item` 上的焦点样式；写法与官方 `Switch.module.css` 的
  `:focus-visible` 保持一致。
- `interactive` 行的 active 底色用 `--dsw-alias-interactive-bg-active`：官方 `Menu.module.css` 只定义了
  hover，没有 `:active`；本组件借用官方 `Button.module.css` `.ghost:active` 的同一 token，让「按下」有反馈。
- `interactive` 默认 `false`：官方 `.item` 生来就是按钮（菜单单元一定是可点的）。行组里的行经常只是
  展示（带一个右侧的操作按钮），默认当按钮会让「点了没反应」变成常态，因此默认 `<div>`，
  由调用方显式选择。

实现为本仓库原创（用 CSS 变量承载几何 + 单类切换），未复制官方 CSS 源码。

## 该和哪些组件搭配

- 行里的开关：`Switch`；行里的输入：`Input`。
- 设置面板里的表单行（标签 ↔ 控件）：`SettingsRow`，本组件负责列表 / 导航性质的行组。
- 行右侧的操作：`Button`（`size="sm"`，`variant="ghost"`）。
- 行里的状态：`StateDot`；行里的静态标记：`Tag`。
- 分组之上：`SettingsPage` 的 `SettingsSection`，或 `PanelSeat` 的正文。

## 可访问性要点

- 分组标题是真正的标题元素（默认 `<h3>`，可用 `headingLevel` 调整），并且是 `aria-labelledby` 的目标，
  所以辅助技术会把它当作这一组的名字。标题文本要能独立读懂（「启动行为」而不是「行为」）。
- **`interactive` 只用于整行就是一个动作的行**：此时渲染 `<button type="button">`，键盘与屏幕阅读器
  都能正常工作。**行内绝对不要再放按钮或链接**——嵌套按钮是无效 HTML，且点击语义不确定。
- 默认 `<div>` 行本身**不可聚焦、不进入 Tab 顺序**，这是刻意的：行内如果有按钮，焦点应该落在按钮上，
  而不是先在行上停一次。不要为了「让整行可点」给 div 加 `onClick` 而不给角色——那是键盘用户够不到的操作。
- 行内被省略号截断的文本：屏幕阅读器读得到全量，明眼用户读不全。关键信息（文件名、账号名）应能在
  hover 时通过 `title` 属性或行内展开看到。
- 行高固定 40px，请保证行内控件的命中区不小于 28×28（见 `Button` 的 `sm` 尺寸）。把
  28px 的图标按钮放进 40px 的行里仍有 8px 内边距，不要靠负 margin 去「对齐」。
- 分隔线是纯装饰（`ListRowSeparator` 带 `aria-hidden="true"`），不承载信息；不要用「有线 / 没线」表达分组层级，
  层级由分组标题表达。
