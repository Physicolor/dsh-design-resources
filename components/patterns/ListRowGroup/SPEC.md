# ListRowGroup · SPEC

- id: list-row-group
- category: patterns
- source: `components/patterns/ListRowGroup/`（`index.tsx` / `list-row-group.module.css`）
- official-counterpart: **产品里有对应的界面**：带分组标题的行组由产品自有 CSS 模块渲染——`fO69Vq_groupTitle` 28 × 22 + `count` 8 × 19（slot=main）、`RotMhW_groupTitle` 56 × 22 + `groupToggle` 76 × 22（slot=settings.plugins.tab）、`cc-group` 564 × 225、`KZf9OG_groupHead` 564 × 16（slot=settings.section）。官方 `lib/index.js` 的导出列表里没有行组；每条几何取自官方 `Menu.module.css` 的对应单元
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

逐条读作「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| 分组标题 `padding: 8px 10px`、`font-size: 12px`、`line-height: 16px` | `Menu.module.css` → `.label` |
| 分组标题颜色 `--dsw-alias-label-tertiary` | `Menu.module.css` → `.label`（`color`） |
| 行 `min-height: 40px`、`padding: 8px 10px`、`border-radius: 10px`、`gap: 8px`、`font-size: 14px`、`line-height: 22px` | `Menu.module.css` → `.item` |
| 行文字颜色 `--dsw-alias-label-primary` | `Menu.module.css` → `.item`（`color`） |
| 行 hover 底色 | `Menu.module.css` → `.item:hover:not(:disabled)` |
| 行 active 底色 | `Button.module.css` → `.ghost:active` 的 `--dsw-alias-interactive-bg-active` |
| 行 disabled `opacity: 0.4` | `Menu.module.css` → `.item:disabled` |
| 前置图标容器 `16×16` + `--dsw-alias-label-tertiary` | `Menu.module.css` → `.itemIcon` |
| 行文字省略（`min-width: 0` / `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap`） | `Menu.module.css` → `.itemLabel` |
| 行间距 `0` | `Menu.module.css` → `.list`（`gap: 0`） |
| 分隔线 `height: 0.5px`、`margin: 4px 2px`、`background: var(--dsw-alias-border-l1)` | `Menu.module.css` → `.separator` |
| 自动 hairline 的宽度与颜色（`0.5px` + `--dsw-alias-border-l1`） | 同上（`Menu.module.css` → `.separator`），改由 `border-top` 承载 |
| 尾部内容 `gap: 8px` | `Menu.module.css` → `.item`（`gap: 8px`）、`.check` 的 `flex: none` |

### 本仓库建议值（无官方来源）

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

### 实现说明

实现为本仓库原创（用 CSS 变量承载几何 + 单类切换），未复制官方 CSS 源码。

## api

导出三个组件：`ListRowGroup`、`ListRow`、`ListRowSeparator`。

`ListRowGroupProps extends Omit<HTMLAttributes<HTMLElement>, 'title'>`，`forwardRef<HTMLElement, ListRowGroupProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | 无 | 分组标题；不传则不渲染标题行，也不输出 `aria-labelledby` |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | 标题的语义级别 |
| `separator` | `'hairline' \| 'none'` | `'hairline'` | 行间分隔线：自动细线，或交给调用方插 `ListRowSeparator` |
| `className` | `string` | 无 | 与内部类名拼接 |
| 其余 | `Omit<HTMLAttributes<HTMLElement>, 'title'>` | — | 透传到根 `<section>` |
| `ref` | `Ref<HTMLElement>` | 无 | 透传到根 `<section>` |

`ListRowProps extends HTMLAttributes<HTMLElement>`，`forwardRef<HTMLElement, ListRowProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `interactive` | `boolean` | `false` | 整行是否渲染成 `<button type="button">`；开启后行内不得再有可交互控件 |
| `disabled` | `boolean` | `false` | 仅 `interactive` 时生效，透传到原生 `disabled` |
| `leading` | `ReactNode` | 无 | 前置内容，放进 16×16 的图标容器 |
| `trailing` | `ReactNode` | 无 | 尾部内容（计数、状态点、箭头） |
| `className` | `string` | 无 | 与内部类名拼接 |
| 其余 | `HTMLAttributes<HTMLElement>` | — | `interactive` 时作为 `ButtonHTMLAttributes<HTMLButtonElement>` 透传到 `<button>`，否则透传到 `<div>` |
| `ref` | `Ref<HTMLElement>` | 无 | 透传到根元素 |

`ListRowSeparatorProps = HTMLAttributes<HTMLDivElement>`，`forwardRef<HTMLDivElement, ListRowSeparatorProps>`；固定输出 `aria-hidden="true"`。

`ListRowHeadingLevel` / `ListRowSeparatorMode` 为导出的类型别名。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 分组有标题 | `title != null` | 渲染 `<hN id>`，根 `<section>` 输出 `aria-labelledby` 指向它 |
| 分组无标题 | `title == null` | 不渲染标题行，不输出 `aria-labelledby` |
| 自动 hairline | `separator === 'hairline'`（默认） | `.rows > * + *` 加 `border-top: 0.5px solid var(--dsw-alias-border-l1)` |
| 手动分隔线 | `separator === 'none'` | 不加边框，由调用方插入 `ListRowSeparator` |
| 展示行 | `interactive === false`（默认） | 根元素 `<div>`，无 `cursor: pointer`、无 hover / active / focus 样式、不进入 Tab 顺序 |
| 可交互行 | `interactive === true` | 根元素 `<button type="button">`，`cursor: pointer` |
| hover | `.rowInteractive:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-hover)` |
| active | `.rowInteractive:active:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-active)` |
| disabled | `.rowInteractive:disabled` | `opacity: 0.4` + `cursor: not-allowed` |
| 键盘焦点 | `.rowInteractive:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`（`§ 建议值`） |
| 文字超长 | 行标题超出可用宽度 | `overflow: hidden` + `text-overflow: ellipsis` + `white-space: nowrap` |
| 无前置 / 无尾部 | `leading` / `trailing` 为 `null` | 对应容器不渲染 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-tertiary` — 分组标题色、前置图标色、尾部内容色
- `--dsw-alias-label-primary` — 行文字色
- `--dsw-alias-border-l1` — 自动 hairline 与 `ListRowSeparator` 的颜色
- `--dsw-alias-interactive-bg-hover` — 行 hover 底色
- `--dsw-alias-interactive-bg-active` — 行 active 底色（`§ 建议值`）
- `--dsw-alias-brand-primary` — 焦点环颜色（`§ 建议值`）

本组件未定义组件级 CSS 变量，几何直接写在类上。

## a11y

- 分组标题是真正的标题元素（默认 `<h3>`，可用 `headingLevel` 调整），并且是 `aria-labelledby` 的目标，辅助技术会把它当作这一组的名字。标题文本要能独立读懂（「启动行为」而不是「行为」）。
- `interactive` 只用于整行就是一个动作的行：此时渲染 `<button type="button">`，键盘与屏幕阅读器都能正常工作。行内绝对不要再放按钮或链接——嵌套按钮是无效 HTML，且点击语义不确定。
- 默认 `<div>` 行不可聚焦、不进入 Tab 顺序，这是刻意的：行内如果有按钮，焦点应该落在按钮上，而不是先在行上停一次。不要为了「让整行可点」给 `<div>` 加 `onClick` 而不给角色。
- 行内被省略号截断的文本：屏幕阅读器读得到全量，明眼用户读不全。关键信息应能在悬停时通过 `title` 属性或行内展开看到。
- 行高固定 40px，行内控件的命中区不得小于 28×28（见 `Button` 的 `sm` 尺寸，`AC-MF-01`）。把 28px 的图标按钮放进 40px 的行里仍有 8px 内边距，不要用负 margin 去「对齐」。
- 分隔线是纯装饰（`ListRowSeparator` 带 `aria-hidden="true"`），不承载信息；不要用「有线 / 没线」表达分组层级，层级由分组标题表达。
- 可交互行的焦点环用 `outline` 而非 `box-shadow`，写法与官方 `Switch.module.css` 的 `:focus-visible` 一致（`AC-MF-11`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `title` 存在时，根 `<section>` 的 `aria-labelledby` 指向标题元素的 `id`；`title` 不存在时不输出该属性。
2. `headingLevel` 渲染为 `h2`–`h6` 之一，不渲染 `h1`。
3. `separator === 'hairline'` 时，自动细线只落在 `.rows > * + *` 上（第一行之前没有线）。
4. `interactive === true` 时，根元素是 `<button>` 且 `type="button"`；`interactive === false` 时根元素是 `<div>`。
5. `interactive === true` 的行内不得出现 `<button>` / `<a>` / `[role="button"]`（由调用方保证，lint 可对 demo 与文档示例扫描）。
6. `interactive === false` 的行不输出 `tabIndex`、不绑定 `onClick` / `onKeyDown`。
7. `interactive === true` 时存在 `:focus-visible` 焦点样式，规格为 `2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`（`AC-MF-10` / `AC-MF-11`）。
8. 行内控件的命中区 ≥ 28×28（`AC-MF-01` 常规控件目标，对应 `spec/70-checklist.md` 的 `A43`）。
9. `ListRowSeparator` 固定输出 `aria-hidden="true"`。
10. 行文字容器同时声明 `overflow: hidden` / `text-overflow: ellipsis` / `white-space: nowrap`。
11. `interactive` 的默认值为 `false`（源码中 `interactive = false` 不得被移除）。
12. `headingLevel` 的默认值为 `3`；`separator` 的默认值为 `'hairline'`。
13. `ListRowSeparator` 的几何为 `height: 0.5px` / `margin: 4px 2px` / `background: var(--dsw-alias-border-l1)`。
14. 被省略号截断的关键信息必须有看到全量的途径：行元素带 `title`，或行内提供展开入口（人审，见 `README.md`「怎么用得好」）。
15. 同一组内的行数不超过 6；超过时应重新分组（`FL-RC-05` 建议同一段内可见控件不超过 6 个，对应 `spec/70-checklist.md` 的 `B01`，人审）。

## demo

- `components/patterns/ListRowGroup/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A43`、`A48`、`B01`）
- 无障碍条款：`spec/60-accessibility.md`（`AC-MF-01`、`AC-MF-10`、`AC-MF-11`）
- 布局条款：`spec/10-frame-layout.md`（`FL-RC-05`）
