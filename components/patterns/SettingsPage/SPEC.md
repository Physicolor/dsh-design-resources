# SettingsPage · SPEC

- id: settings-page
- category: patterns
- source: `components/patterns/SettingsPage/`（`index.tsx` / `settings-page.module.css`）
- official-counterpart: 官方 primitives 包（`lib/index.js`）里没有这个组件；但**产品里有设置窗口本身**——采集到的实测几何见下节。本组件是给插件用的骨架建议，不是「产品没有设置页」的意思。

## 产品里的设置窗口（实测）

`docs/reference/settings-panel.json`（1570×905 视口，窗口盒子 [385, 53, 800, 800]），demo 就是照这一份渲染的。

| 部位 | 实测值 |
| --- | --- |
| 遮罩 | 全屏 `--dsw-alias-bg-mask-1`（计算值 `rgba(0,0,0,.24)`） |
| 窗口 | **800 × 800** · 圆角 **28px** · 白底 · `box-shadow` = `--dsw-elevation-prominent`（计算值 `0 0 0 .5px rgba(0,0,0,.16), 0 3px 8px rgba(0,0,0,.04), 0 0 20px rgba(0,0,0,.05)`） |
| 导航列 | **188 宽** · padding `22px 12px 0` · 标题与列表 gap 18 · 列表行距 4 |
| 导航格 | **164 × 40** · 圆角 **12** · padding `9px 16px 9px 12px` · gap 8 · 选中底 `rgb(235,238,242)` |
| 内容列 | **612 宽** · 头部 54 高（padding `20px 14px 8px 10px`）· 选项区 padding `0 24px 24px` |
| 分区标题 | **18/26 · 600**（`h2`） |
| 分区说明 | **13/20** · 下方 12 |
| 设置行 | padding `16px 0` · 标题 **14/22** · 说明 **12/18** · 行间一条 hairline · 文字列右侧留 48 |
| 选择器 | 高 **36** · 圆角 **12** · padding `0 14` · gap 12 · 底 `rgb(245,246,247)` · 折角 14×14 |
| 主题方块 | **183 × 84** · 圆角 **20** · padding `20px 32px` · 选中底 `rgb(245,246,247)` |
| 开关 | **36 × 20** · 圆角 999 · 滑块 16 · 打开时 `--dsw-alias-brand-primary` |
| 数字微调 | 上下两枚 **17 × 12** 箭头 · 圆角 4（字号大小那一行） |

注意两处与本组件原先的建议值不一致，以实测为准：导航格圆角是 12（不是 10）、设置行说明是 12/18（不是 13/20）。

## geometry-source

逐条读作「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| 导航行 `min-height: 40px`、`padding: 8px 10px`、`border-radius: 10px`、`gap: 8px`、`font-size: 14px`、`line-height: 22px` | `Menu.module.css` → `.item` |
| 导航行 hover 底色 `--dsw-alias-interactive-bg-hover` | `Menu.module.css` → `.item:hover:not(:disabled)` |
| 选中行底色 `--dsw-alias-interactive-bg-hover` | `Menu.module.css` → `.selectedFill` |
| 导航行 disabled `opacity: 0.4` | `Menu.module.css` → `.item:disabled` |
| 导航图标容器 `16×16` + `--dsw-alias-label-tertiary` | `Menu.module.css` → `.itemIcon` |
| 导航行文字省略（`min-width: 0` / `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap`） | `Menu.module.css` → `.itemLabel` |
| 导航容器内边距 `4px` | `Menu.module.css` → `.list` |
| 导航容器圆角 `12px` | `ReadBlock.module.css` → `.block`（`--dsl-read-radius: 12px`） |
| 导航容器底色 `--dsw-alias-bg-module-platform` | `Tag.module.css` → `.tag[data-tone="neutral"]`（同一个 token） |
| 页面标题 `font-size: 16px` / `line-height: 24px` / `font-weight: 500` | `Modal.module.css` → `.title` |
| 页面描述 `font-size: 14px` / `line-height: 22px` | `Modal.module.css` → `.description` |
| 页面描述颜色 `--dsw-alias-label-secondary` | `Pill.module.css` → `.pill`（`color`） |
| 分区标题 `font-size: 14px` / `line-height: 22px` | `Button.module.css` → `.button` |
| 分区标题 `font-weight: 500` | `Modal.module.css` → `.title` |
| 分区标题/描述与内容之间、标题与操作区之间 `gap: 8px` | `Modal.module.css` → `.header` / `.footer`（`gap: 8px`） |
| 分区描述 `font-size: 12px` / `line-height: 18px` | `ReadBlock.module.css` → `.label` |
| 分区描述颜色 `--dsw-alias-label-tertiary` | `ReadBlock.module.css` → `.count`（`color`） |
| 标题与内容块之间 `20px` | `Modal.module.css` → `.dialog`（`gap: 20px`）、`.body`（`margin-top: 20px`） |
| 导航列宽 `218px` | `Menu.module.css` → `.list`（`min-width: 218px`，官方菜单卡外宽） |

以上除「导航列宽」外，都是把官方某个既有数值借到本组件的语境里；「导航列宽」是把官方菜单卡外宽借来当导航列宽。

### 本仓库建议值（无官方来源）

- `--dsh-settings-pad: 24px`（页面内边距）：4 的倍数；量级对齐官方 `Modal.module.css` `.root { padding: 24px }` 与 `.header/.body/.footer` 的 24px 水平内边距——设置页与对话框同属「居中的内容容器」。
- `--dsh-settings-gap: 32px`（导航列与内容列的列间距）：4 与 8 的倍数；`spec/10-frame-layout.md` `FL-AD-07` 规定分区之间的最小间距为 16px，导航列与内容列是两个并列分区，取 2 倍即 32px 以拉开「导航 / 内容」的重心差。
- `--dsh-settings-block-gap: 24px`（内容列里分区之间的距离）：4 的倍数，与页面内边距取同一值，避免同一页出现第四种间距量级。
- `--dsh-settings-content-max: 640px`（内容列最大宽度）：官方 `Toast.module.css` `.toast { max-width: min(640px, calc(100vw - 48px)) }` 已把 640px 当作可读宽度上限，设置页表单同理；超过后用户的视线要横扫，标签与控件对不上。
- 导航行未选中文字用 `--dsw-alias-label-secondary`：官方 `Menu.module.css` `.item` 对所有行都用 `label-primary`，靠尾部对勾区分选中。本组件没有对勾位，改用文字色深浅区分「非当前项 / 当前项」，选中项同时拿到 `label-primary`。
- 设置项描述 `margin-top: 4px`、分区描述 `margin-top: 4px`、分区内容 `margin-top: 8px`：4 的倍数。
- 导航行的 `:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px }`：官方无对应物；写法与官方 `Switch.module.css` 的 `:focus-visible` 保持一致，让键盘用户在所有控件上看到同一种焦点环。

### 实现说明

实现为本仓库原创（用 CSS 变量承载几何 + 单类切换尺寸），几何等价但不是官方 CSS 的复制。

## api

导出三个组件：`SettingsPage`、`SettingsNavItem`、`SettingsSection`。

`SettingsPageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>`，`forwardRef<HTMLDivElement, SettingsPageProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `nav` | `ReactNode` | 必填 | 左列导航内容，通常是若干 `SettingsNavItem` |
| `navLabel` | `string` | `'设置分区'` | 导航列的无障碍名称，落在 `<nav aria-label>` 上 |
| `title` | `ReactNode` | 无 | 页面标题；不传则不渲染标题区 |
| `description` | `ReactNode` | 无 | 标题下方的说明 |
| `titleLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1` | 页面标题的语义级别 |
| `navWidth` | `number \| string` | 无（CSS 默认 `218px`） | 覆盖左列宽度；数字按 px 处理，写进 `--dsh-settings-nav-width` |
| `className` | `string` | 无 | 与内部类名拼接 |
| `style` | `CSSProperties` | 无 | 与 `navWidth` 计算的变量合并，`navWidth` 优先 |
| 其余 | `Omit<HTMLAttributes<HTMLDivElement>, 'title'>` | — | 透传到根 `<div>` |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到根 `<div>` |

`SettingsNavItemProps extends HTMLAttributes<HTMLElement>`，`forwardRef<HTMLElement, SettingsNavItemProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `active` | `boolean` | `false` | 是否当前分区；为真时带 `aria-current="page"` 与选中底色 |
| `href` | `string` | 无 | 传了渲染 `<a>`（页面内锚点），否则渲染 `<button type="button">` |
| `icon` | `ReactNode` | 无 | 前置图标节点，放进 16×16 容器 |
| `className` | `string` | 无 | 与内部类名拼接 |

`SettingsSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'>`，`forwardRef<HTMLElement, SettingsSectionProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | 无 | 分区标题；不传则不渲染标题行，也不输出 `aria-labelledby` |
| `description` | `ReactNode` | 无 | 标题下方的补充说明 |
| `actions` | `ReactNode` | 无 | 右对齐的操作区，通常是 1 个 `Button` |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | 分区标题的语义级别 |
| `className` | `string` | 无 | 与内部类名拼接 |

`HeadingLevel` 为导出的类型别名。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 页面骨架 | 始终 | 根 `<div>` 为 `display: flex` + `align-items: flex-start`，`gap` 取 `--dsh-settings-gap`，`padding` 取 `--dsh-settings-pad` |
| 导航列 | 始终 | `<nav aria-label={navLabel}>`，宽 `--dsh-settings-nav-width`、圆角 12px、内边距 4px、底色 `--dsw-alias-bg-module-platform` |
| 导航项未选中 | `active === false`（默认） | `color: var(--dsw-alias-label-secondary)`，透明底 |
| 导航项选中 | `active === true` | `aria-current="page"` + `color: var(--dsw-alias-label-primary)` + `background: var(--dsw-alias-interactive-bg-hover)` |
| 导航项 hover | `.navItem:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-hover)` |
| 导航项 disabled | `.navItem:disabled` | `opacity: 0.4` + `cursor: not-allowed`（仅 `<button>` 形态可禁用） |
| 键盘焦点 | `.navItem:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`（`§ 建议值`） |
| 导航项超长 | 标题超出列宽 | `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap` |
| 页面标题 | `title != null` | 渲染 `<hN>`（`titleLevel`，默认 `<h1>`），16/24/500 |
| 页面描述 | `description != null` | 渲染 `<p>`，14/22，`margin-top: 4px`（`§ 建议值`） |
| 分区有标题 | `title != null` | 标题行渲染 `<hN>`（默认 `<h2>`）；`actions` 存在时渲染右对齐操作区 |
| 分区有描述 | `description != null` | 渲染 `<p>`，12/18，`margin-top: 4px`（`§ 建议值`） |
| 内容列最大宽度 | 始终 | `max-width: var(--dsh-settings-content-max)` |
| 响应式 | — | 无内建断点：窄屏下导航列仍为固定宽度，由调用方在自身断点里调 `navWidth` |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-primary` — 页面标题、分区标题、导航项选中态文字色
- `--dsw-alias-label-secondary` — 页面描述色、导航项未选中文字色（`§ 建议值`）
- `--dsw-alias-label-tertiary` — 导航图标色、分区描述色
- `--dsw-alias-bg-module-platform` — 导航列底色（`§ 建议值`）
- `--dsw-alias-interactive-bg-hover` — 导航项 hover 与选中底色
- `--dsw-alias-brand-primary` — 焦点环颜色（`§ 建议值`）

组件级 CSS 变量（本仓库内部，不是 DSH token；定义在 `.page`，`navWidth` 可覆盖第一个）：

- `--dsh-settings-nav-width` = `218px`（`navWidth` 可覆盖）
- `--dsh-settings-gap` = `32px`
- `--dsh-settings-pad` = `24px`
- `--dsh-settings-block-gap` = `24px`
- `--dsh-settings-radius` = `12px`
- `--dsh-settings-nav-pad` = `4px`
- `--dsh-settings-content-max` = `640px`

## a11y

- 左列是 `<nav aria-label="…">`；页面上还有别的 `<nav>`（例如宿主侧栏）时，务必用 `navLabel` 指定不同的名称，否则屏幕阅读器的地标列表里会出现多个同名导航。
- 当前分区用 `aria-current="page"`（`active` 为真时自动加）。不要只靠底色表达「你在哪」。
- 页面标题用 `<h1>`（`titleLevel` 可降级）；`SettingsSection` 默认 `<h2>`，`ListRowGroup` 默认 `<h3>`；保持标题层级连续，不要跳级。
- 导航项是 `<button>` 时由调用方接管点击后的路由切换；是页面内锚点时传 `href="#id"`，让浏览器原生跳转与「后退」都能工作。
- 导航列宽度固定，窄屏下会挤压内容列。本组件不做响应式折叠（那需要知道宿主的断点），请在宿主侧断点里自行调小 `navWidth` 或改成横向滚动。
- 内容列 `max-width` 只约束上限；不要给导航列加 `overflow: hidden`，否则导航行的焦点环会被裁掉（`AC-MF-12`）。
- 焦点环用 `outline` 而非 `box-shadow`，规格为 2px 实线 + `--dsw-alias-brand-primary` + 2px 外偏移（`AC-MF-11`）。
- 导航行高 40px，命中区不低于 `AC-MF-01` 的常规控件目标 28×28。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 左列根元素是 `<nav>` 且带非空 `aria-label`；`navLabel` 的默认值为 `'设置分区'`。
2. `active === true` 的导航项输出 `aria-current="page"`；`active === false` 时不输出。
3. `href` 存在时渲染 `<a href>`；不存在时渲染 `<button type="button">`。
4. `SettingsSection` 在 `title` 存在时输出 `aria-labelledby` 指向标题元素；`title` 不存在时不输出。
5. `titleLevel` 默认 `1`，`SettingsSection` 的 `headingLevel` 默认 `2`，`headingLevel` 取值落在 `1`–`6`。
6. 导航项存在 `:focus-visible` 焦点样式，规格为 `2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`（`AC-MF-10` / `AC-MF-11`，对应 `spec/70-checklist.md` 的 `A48`）。
7. 导航列不得声明 `overflow: hidden`（否则焦点环被裁，`AC-MF-12`）。
8. 导航项命中区高度不小于 28px（`AC-MF-01`，对应 `spec/70-checklist.md` 的 `A43`）。
9. 内容列声明 `max-width: var(--dsh-settings-content-max)`，导航列 `flex: none`、内容列 `flex: 1` + `min-width: 0`。
10. 导航项文字容器同时声明 `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap`。
11. `navWidth` 为数字时写成 `px`，为字符串时原样写入 `--dsh-settings-nav-width`。
12. 分区之间的垂直间距取自 `--dsh-settings-block-gap`，不得小于 `spec/10-frame-layout.md` `FL-AD-07` 的 16px。
13. 组件不 import 仓库内其它组件（源码中无相对路径 import，仅 `react` 与自身 CSS Modules）。
14. 使用位置必须属于设置区域（插件自己的独立设置页），不得用于会话区（人审，`spec/10-frame-layout.md` 第 4 节的跨区域决策表）。
15. 窄屏处理由调用方在宿主断点内完成（调小 `navWidth` 或改为横向滚动），文档示例中必须给出其中一种做法（人审，`AC-MF-16`）。

## demo

- `components/patterns/SettingsPage/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A43`、`A48`、`B01`）
- 跨区域决策与间距条款：`spec/10-frame-layout.md`（`FL-AD-07`、`FL-RC-05`）
- 无障碍条款：`spec/60-accessibility.md`（`AC-MF-01`、`AC-MF-10`、`AC-MF-11`、`AC-MF-12`、`AC-MF-16`）
- 座位说明：`spec/11-slot-seats.md` 第 4 节
