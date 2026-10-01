# SettingsPage 设置页骨架

设置页整页骨架：左列分区导航 + 右列内容列。

## 是什么

一个纯布局外壳，导出三个组件：

| 导出 | 作用 |
| --- | --- |
| `SettingsPage` | 整页骨架。`nav` 插槽放导航，`children` 放内容 |
| `SettingsNavItem` | 导航列的一行。传 `href` 渲染 `<a>`，否则 `<button>`；`active` 表示当前分区 |
| `SettingsSection` | 内容列里的一个分区：标题行（可带右对齐操作区）+ 可选描述 + 内容 |

零依赖，只用到 `react` 和 CSS Modules。不 import 仓库内任何其它组件。

## 什么时候用

- 插件提供一个**独立设置页**（占用 `settings.section` 之外的整页空间，或在独立窗口/标签页里渲染）。
- 设置项多到需要左侧分区导航（≥ 3 个分区）才能扫读。
- 内容列里需要「标题 + 若干行」的重复结构，直接用 `SettingsSection` 统一排版。

## 什么时候不要用

- **只给宿主设置页加一个分区**：那属于 `settings.section` 座位（`single` 类型，见 `spec/11-slot-seats.md` 第 4 节），宿主会给你一个已经排好版的容器，用本组件会把设置页套成两层导航。
- **只有 1–2 个分区**：不需要导航列，直接用一个标题 + 若干 `ListRowGroup` 即可；左侧空导航是纯浪费。
- **不是设置**：会话语义的内容属于会话区，不要借设置页的壳（`spec/10-frame-layout.md` 第 4 节的跨区域决策表）。
- 不要用本组件承载主流程必经操作——设置页是可以被用户不去的地方。
- **只要一个区块抬头，不要整页骨架**：用 `SectionHeader`（标题 + 副标题 + hairline 自成一体，它的 18/600 标题是它自己标注的建议值）。`SettingsSection` 是整页骨架里的一级分区（14/22 标题、无 hairline）；两者择一，叠用会出现双层标题。

## 几何来源

官方**没有** SettingsPage 对应物（`lib/index.js` 的导出里没有设置页骨架）。因此本组件的每条几何都是
「锚定某个已核实数值」，而不是「抄自某个官方类」：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| 导航行 `min-height: 40px`、`padding: 8px 10px`、`border-radius: 10px`、`gap: 8px`、`font-size: 14px`、`line-height: 22px` | `Menu.module.css` `.item` |
| 导航行 hover 底色 `--dsw-alias-interactive-bg-hover` | `Menu.module.css` `.item:hover:not(:disabled)` |
| 选中行底色 `--dsw-alias-interactive-bg-hover` | `Menu.module.css` `.selectedFill` |
| 导航行 disabled `opacity: 0.4` | `Menu.module.css` `.item:disabled` |
| 导航图标容器 `16×16` + `--dsw-alias-label-tertiary` | `Menu.module.css` `.itemIcon` |
| 导航行文字省略（`min-width: 0` / `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap`） | `Menu.module.css` `.itemLabel` |
| 导航容器内边距 `4px` | `Menu.module.css` `.list` |
| 导航容器圆角 `12px` | `ReadBlock.module.css` `.block`（`--dsl-read-radius: 12px`） |
| 导航容器底色 `--dsw-alias-bg-module-platform` | `Tag.module.css` `.tag[data-tone="neutral"]`（同一个 token） |
| 页面标题 `font-size: 16px` / `line-height: 24px` / `font-weight: 500` | `Modal.module.css` `.title` |
| 页面描述 `font-size: 14px` / `line-height: 22px` | `Modal.module.css` `.description` |
| 页面描述颜色 `--dsw-alias-label-secondary` | `Pill.module.css` `.pill`（`color`） |
| 分区标题 `font-size: 14px` / `line-height: 22px` | `Button.module.css` `.button` |
| 分区标题 `font-weight: 500` | `Modal.module.css` `.title` |
| 分区标题/描述与内容之间、标题与操作区之间 `gap: 8px` | `Modal.module.css` `.header` / `.footer`（`gap: 8px`） |
| 分区描述 `font-size: 12px` / `line-height: 18px` | `ReadBlock.module.css` `.label` |
| 分区描述颜色 `--dsw-alias-label-tertiary` | `ReadBlock.module.css` `.count`（`color`） |
| 标题与内容块之间 `20px` | `Modal.module.css` `.dialog`（`gap: 20px`）、`.body`（`margin-top: 20px`） |
| 导航列宽 `218px` | `Menu.module.css` `.list`（`min-width: 218px`，官方菜单卡外宽） |

以上除「导航列宽」外，都是把官方某个既有数值**借到本组件的语境**里；「导航列宽」是把官方菜单卡外宽
借来当导航列宽。

**本仓库建议值（无官方来源）：**

- `--dsh-settings-pad: 24px`（页面内边距）：4 的倍数；量级对齐官方 `Modal.module.css` `.root { padding: 24px }` 与 `.header/.body/.footer` 的 24px 水平内边距——设置页与对话框同属「居中的内容容器」。
- `--dsh-settings-gap: 32px`（导航列与内容列的列间距）：4 与 8 的倍数；`spec/10-frame-layout.md` `FL-AD-07` 规定分区之间的最小间距为 16px，导航列与内容列是两个并列分区，取 2 倍即 32px 以拉开「导航 / 内容」的重心差。
- `--dsh-settings-block-gap: 24px`（内容列里分区之间的距离）：4 的倍数，与页面内边距取同一值，避免同一页出现第四种间距量级。
- `--dsh-settings-content-max: 640px`（内容列最大宽度）：官方 `Toast.module.css` `.toast { max-width: min(640px, calc(100vw - 48px)) }` 已把 640px 当作可读宽度上限，设置页表单同理；超过后用户的视线要横扫，标签与控件对不上。
- 导航行未选中文字用 `--dsw-alias-label-secondary`：官方 `Menu.module.css` `.item` 对所有行都用 `label-primary`，靠尾部对勾区分选中。本组件没有对勾位，改用文字色深浅区分「非当前项 / 当前项」，选中项同时拿到 `label-primary`。
- `设置项描述 margin-top: 4px`、`分区描述 margin-top: 4px`、`分区内容 margin-top: 8px`：4 的倍数。
- 导航行的 `:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px }`：官方 `SettingsPage` 无对应物；写法与官方 `Switch.module.css` 的 `:focus-visible` 保持一致，让键盘用户在所有控件上看到同一种焦点环。

实现为本仓库原创（用 CSS 变量承载几何 + 单类切换尺寸），几何等价但不是官方 CSS 的复制。

## 该和哪些组件搭配

- 导航行：本组件的 `SettingsNavItem`。
- 分区标题右侧的操作：`Button`（`size="sm"`，`variant="ghost"`）。
- 分区里的设置项列表：`ListRowGroup` + `ListRow`。
- 「标签 + 控件」形态的设置项行：`SettingsRow`（根节点是 `<label>`，点标题即可操作控件）；只有列表 / 导航性质的行才用 `ListRowGroup` + `ListRow`。
- 区块抬头（标题 + 副标题 + hairline）：`SectionHeader`；整页骨架里的一级分区用本组件的 `SettingsSection`。
- 单行开关：`Switch`；表单输入：`Input`；互斥选项：`Pill`。
- 保存成功的反馈：`Toast`（不要用 `Modal` 报成功）。

## 可访问性要点

- 左列是 `<nav aria-label="…">`；如果页面上还有别的 `<nav>`（比如宿主的侧栏），务必用 `navLabel` 指定不同的名称，否则屏幕阅读器的地标列表里会出现多个同名导航。
- 当前分区用 `aria-current="page"`（组件在 `active` 时自动加）。不要只靠底色表达「你在哪」。
- 页面标题用 `<h1>`（`titleLevel` 可降级）。`SettingsSection` 默认 `<h2>`，`ListRowGroup` 默认 `<h3>`，保持标题层级连续，不要跳级。
- 导航行如果是 `<button>`，请自己接管点击后的路由切换；如果是页面内锚点，用 `href="#id"`，让浏览器原生跳转与「后退」都能工作。
- 导航列宽度固定 218px，窄屏下会挤压内容列。本组件不做响应式折叠（那需要知道宿主的断点），请在宿主侧断点里自行把 `navWidth` 调小或改成横向滚动。
- 内容列 `max-width: 640px` 只约束上限；不要给导航列加 `overflow: hidden`，否则导航行的焦点环会被裁掉。
