# DisclosureRow · SPEC

- id: disclosure-row
- category: data-display
- source: `components/data-display/DisclosureRow/`（`index.tsx` / `disclosure-row.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/DisclosureRow.module.css` 与同目录 `lib/index.js`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 `DisclosureRow.module.css` / `lib/index.js`，写法为「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| `display: flex` / `flex-direction: column` / `width: 100%` / `min-width: 0` | `DisclosureRow.module.css` → `.root` |
| `position: relative` / `overflow: hidden` / `display: flex` / `align-items: center` / `min-width: 0` | `DisclosureRow.module.css` → `.row` |
| 行高 `24px` | `DisclosureRow.module.css` → `.row`（官方为 `height: calc(24px + var(--dsh-content-font-delta, 0px))`，取 delta 缺省值 0） |
| `cursor: pointer` | `DisclosureRow.module.css` → `.row[data-expandable]` |
| leading `16×16` / `position: relative` / `flex: none` / `inline-flex` 居中 / `margin-right: 6px` / `padding: 0` / `border: none` / `background: none` | `DisclosureRow.module.css` → `.leading` |
| leading 颜色 `var(--dsw-alias-label-tertiary)` | `DisclosureRow.module.css` → `.leading` |
| 行内字形 `14×14` | `DisclosureRow.module.css` → `.leading svg:not([data-state])`（文件注释：带 `data-state` 的 StateDot 保持自身固定尺寸，不走这条规则） |
| `cursor: pointer` | `DisclosureRow.module.css` → `button.leading` |
| `opacity: 1` / `transition: opacity 100ms ease` | `DisclosureRow.module.css` → `.iconIdle` |
| `position: absolute` / `inset: 0` / `margin: auto` / `opacity: 0` / `transition: opacity 100ms ease` | `DisclosureRow.module.css` → `.chevronHover` |
| 悬停时 `iconIdle → 0`、`chevronHover → 1` | `DisclosureRow.module.css` → `.row:hover .iconIdle`、`.row:hover .chevronHover` |
| 标题 `flex: none` / `13px` / `line-height: 24px` / `color: var(--dsw-alias-label-secondary)` | `DisclosureRow.module.css` → `.title`（官方为 `var(--dsh-content-font-size-secondary, 13px)` 与 `calc(24px + delta)`，取缺省值） |
| 折叠态渲染「图标 + 悬停箭头」，展开态只渲染箭头；箭头预览默认跟随 `expandable` | `lib/index.js` → `previewChevron = expandable` 与 `collapsedLeading` |
| 可展开且整行可点时：`role="button"` / `tabIndex=0` / `aria-expanded` / `onClick` / `onKeyDown` | `lib/index.js` → `rowExpands` 分支 |
| 仅图标按钮形态：`<button type="button" aria-expanded>` | `lib/index.js` → `expandable && !rowExpands` 分支 |
| Enter 与空格触发，且 `event.preventDefault()` | `lib/index.js` → `toggleFromKeyboard` |
| `collapsedContent` 只在未展开时渲染 | `lib/index.js` → `(keepContentWhenOpen \|\| !open) && collapsedContent`（本仓库不暴露 `keepContentWhenOpen`，固定取 `false`） |
| 箭头图形：14×14、1.4px 描边 | 本仓库自绘，**未复制官方 path 数据**；官方用 `IconChevronDownOutline14`（14×14 填充轮廓形）。官方在「折叠悬停」与「已展开」两态用同一方向的箭头（不旋转），本组件保持一致 |

### 本仓库建议值（非官方数值）

- `.row:focus-visible` → `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`。官方 `DisclosureRow.module.css` 没有任何焦点样式。规格取自 `spec/60-accessibility.md` 的 `AC-MF-11`，写法与官方 `Switch.module.css` 的 `:focus-visible` 一致。
- `.leading:focus-visible` → 同样的 2px brand-primary，`outline-offset: -2px`（内偏移）。官方 `.row` 有 `overflow: hidden`，leading 左边贴着行左边缘，2px 外偏移的焦点环会被裁掉；`AC-MF-12` 明确要求这种情况改用内偏移。
- `button.leading::after { inset: -4px }` → 无背景、无边框的透明伪元素，把仅图标形态的热区四周各扩 4px。左侧 4px 被 `.row` 的 `overflow: hidden` 裁掉，**实际有效热区 20×24**（`AC-MF-01` 下限 20×20；常规控件目标 28×28 未达到，因此更推荐 `expandOnRowClick`）。可见几何不变。
- `@media (prefers-reduced-motion: reduce)` 分支 → `transition: none`。官方没有这条分支。原 README 记录的理由：`spec/40-motion.md` 的 `MO-RC-09` 是强制项；对应的自动判定条目是 `spec/70-checklist.md` 的 `A34`（样式表中不含 `prefers-reduced-motion` 即违规）。

### 本仓库决策（改写官方行为，不是新增数值）

- 官方 `.row` 高度为 `calc(24px + var(--dsh-content-font-delta, 0px))`、`.leading` 盒子为 `calc(16px + delta)`、行内字形为 `calc(14px + delta)`、标题字号为 `var(--dsh-content-font-size-secondary, 13px)`，整套用于跟随 DSH 的字体大小偏好（宿主在 `body` 上发布 `--dsh-content-font-delta`）。**本仓库有意删掉这条轴，把四个值固定为 delta = 0 时的官方默认值**（24px / 16px / 14px / 13px-24px）。
  1. 这两个变量不在本仓库只读的 token 表 `website/css/dsh-tokens.css` 里（全文 grep `content-font-delta`、`content-font-size-secondary` 均无结果），它们是运行时由宿主发布的，第三方插件在自己的 demo 或独立页面拿不到。
  2. 本仓库定位是「拿来即用的零依赖源码」，一条在宿主之外静默失效的自适应轴只会增加理解成本。
  需要跟随字体偏好的作者，把四个 CSS 变量换回官方那套 `calc(... + var(--dsh-content-font-delta, 0px))` 即可，几何结构不用动。
- 实现为本仓库原创：几何由 `.root` 上的组件级 CSS 变量承载、规则重新组织，数值与官方逐条等价，不是官方 CSS 的复制。

## api

`DisclosureRowProps`（`index.tsx`），`forwardRef<HTMLDivElement, DisclosureRowProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `icon` | `ReactNode` | 无 | 折叠态行内图标；放在 16×16 盒子里、内部按 14×14 渲染；悬停整行时淡出 |
| `title` | `ReactNode` | 必填 | 行标题，13px / 24px |
| `open` | `boolean` | 必填（受控） | 是否展开；组件自身不保存状态 |
| `expandable` | `boolean` | 必填 | 是否可展开；`false` 时无箭头、无交互语义、不可 Tab |
| `onToggle` | `() => void` | 必填 | 展开 / 收起回调；键盘与点击都走它 |
| `expandOnRowClick` | `boolean` | `false` | 整行是否可点击切换；`false` 时只有左侧 16×16 图标按钮可切换 |
| `collapsedContent` | `ReactNode` | 无 | 折叠时挂在标题后的次要信息；展开后不再渲染 |
| `children` | `ReactNode` | 无 | 展开后渲染在行下方的详情 |
| `className` | `string` | 无 | 根元素类名，供外部布局使用 |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到根元素 |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 折叠 | `open === false` | leading 渲染「图标 + 悬停箭头」（`expandable` 为真时）；`collapsedContent` 渲染 |
| 展开 | `open === true` | leading 只渲染箭头；`collapsedContent` 不渲染；`children` 渲染在行下方 |
| 不可展开 | `expandable === false` | 无箭头、无 `role`、无 `tabIndex`、无 `aria-expanded`、无 `cursor: pointer` |
| 整行可点 | `expandable && expandOnRowClick` | 行本身是按钮，`cursor: pointer`（`.row[data-expandable]`） |
| 仅图标可点 | `expandable && !expandOnRowClick` | 行不是按钮，leading 是 `<button type="button">` |
| 悬停（折叠态） | `.row:hover` | `.iconIdle` → `opacity: 0`、`.chevronHover` → `opacity: 1`，各 100ms ease，只动 `opacity` |
| 键盘焦点 | `:focus-visible` | 2px 实线 `--dsw-alias-brand-primary`；`.row` 外偏移 2px，`button.leading` 内偏移 -2px |
| 减少动态 | `prefers-reduced-motion: reduce` | `.iconIdle` / `.chevronHover` 的 `transition: none` |
| 禁用 | — | 本组件无 `disabled` 状态；不可交互时用 `expandable={false}` |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-tertiary` — leading 图标与箭头颜色
- `--dsw-alias-label-secondary` — 标题颜色
- `--dsw-alias-brand-primary` — 焦点环颜色（本仓库建议值）

组件级 CSS 变量（本仓库内部，不是 DSH token；定义在 `.root`）：

- `--dsh-disclosure-row-height` = `24px`
- `--dsh-disclosure-leading-size` = `16px`
- `--dsh-disclosure-glyph-size` = `14px`
- `--dsh-disclosure-title-size` = `13px`

## a11y

- 整行按钮形态（`expandable && expandOnRowClick`）：行元素带 `role="button"`、`tabIndex={0}`、`aria-expanded={open}`、`onClick`、`onKeyDown`。
- 仅图标按钮形态（`expandable && !expandOnRowClick`）：`aria-expanded={open}` 落在左侧 16×16 的 `<button type="button">` 上，行本身不是按钮。
- 键盘：`toggleFromKeyboard` 处理 Enter 与空格；空格调用 `event.preventDefault()`（否则页面滚动）。仅图标形态由原生 `<button>` 提供 Enter / 空格。
- 展开的内容区域没有 `role="region"`，也没有与行之间的 `aria-controls` 关联（官方实现如此）。展开 / 折叠状态由行的 `aria-expanded` 承载。
- 折叠态的可展开线索是「图标 vs 箭头」的**形状**差异，不依赖颜色（`AC-MF-07`）。悬停提示只对鼠标存在，键盘用户依赖焦点环与 `aria-expanded`。
- 焦点样式用 `outline` 而非 `box-shadow`：`.row` 有 `overflow: hidden`，`outline` 画在元素自身盒子上、不受裁剪。
- 行高 24px 低于 `AC-MF-01` 的常规命中区目标 28×28；触摸为主的场景请用 `expandOnRowClick`，或在外层给更大的行距。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 当 `expandable && expandOnRowClick` 为真时，行元素必须同时具有 `role="button"`、`tabIndex` 与 `aria-expanded`。否 → 违规（`CT-MF-11` 的反例口径为「出现 `role="button"` 但无键盘事件处理」）。
2. 当 `expandable && expandOnRowClick` 为真时，行元素必须绑定 `onKeyDown`，且该处理函数覆盖 Enter 与空格并调用 `preventDefault()`。
3. 当 `expandable && !expandOnRowClick` 为真时，`aria-expanded` 必须出现在 leading 的 `<button>` 上，且该元素 `type="button"`。
4. 当 `expandable === false` 时，不得输出 `role`、`tabIndex`、`aria-expanded`、`data-expandable`、箭头图形。
5. 组件不得持有展开状态：源码中不得出现 `useState` / `useReducer` 用于 `open`。
6. `collapsedContent` 必须仅在 `open === false` 时渲染。
7. 仅图标形态的可交互元素有效命中区 ≥ 20×20（`AC-MF-01` 下限）：由 `button.leading::after { inset: -4px }` 与 `.row` 左侧裁剪共同决定，实际 20×24 → 通过；是否达到常规目标 28×28 → 不满足。
8. 存在 `:focus-visible` 焦点样式，且不以 `outline: none` 移除后无替代（`AC-MF-10`）。
9. `overflow: hidden` 容器内的控件使用内偏移焦点环（`AC-MF-12`）：`button.leading` 的 `outline-offset` 必须为负值。
10. 样式表包含 `@media (prefers-reduced-motion: reduce)` 分支（`A34`，自动判定）。
11. 自绘箭头描边宽度落在 `IC-MF-05` 建议区间 1.25–1.5（当前 1.4）。
12. 折叠态的可展开线索不得只靠颜色：悬停前后必须存在形状差异（图标 vs 箭头）（`AC-MF-07`）。
13. 展开态与折叠态使用同一方向的箭头，不做旋转。
14. 全库固定 `keepContentWhenOpen = false`：源码中不得出现该属性。

## demo

- `components/data-display/DisclosureRow/demo.html`

## 真实场景（docs/reference 截图核对）

| 图 | 区域 | 上下文 | 实拍 |
| --- | --- | --- | --- |
| `02-session.png` | 会话流，每次工具调用之前 | 「已完成分析」/「已读取文件」/「已写入文件并执行了命令」/「修改了文件并执行了命令」/「正在运行命令」 | 行高 24；前置盒 16×16（内嵌图标约 14）；图标到文字 6px；标题 13px `label-secondary` |
| `07-composer.png` | 输入区上方 | 「深度求索中，用时 7 分 25 秒 …」 | 同几何，但图标与文字是蓝色 |

核对结论：前置 16×16 + `margin-right: 6px` + 标题 13px 与 `.leading` / `.title` 逐条吻合。

### 已知偏差（截图核对新增）

- 「深度求索中，用时 X 分 X 秒 …」那一行**几何与本组件一致**，但图标和文字被染成了业务蓝，不是 `.title` 的 `label-secondary`。它是使用方对 title 的染色用法，**不计入本组件的默认观感**，demo 里没有收录。
- 截图拍到的**全是折叠态**：`.row:hover` 的 `iconIdle → chevronHover` 换形、以及展开体（`data-expandable` + `aria-expanded="true"`）在截图里都没有依据，demo 中相应分组已标注「截图未覆盖」。

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A02`、`A20`、`A34`、`A38`、`A43`、`A46`、`A48`）
