# DisclosureRow 可展开行

一行 24px 的紧凑标题，点开后在下方展开详情。设置面板、文件改动摘要、工具调用详情都用它。

## 是什么

- 一个 24px 高的行：`[16×16 leading 图标] 6px 间距 [标题] [可选的折叠态次要信息]`。
- 受控组件：`open` 决定展开与否，`onToggle` 是唯一的切换入口。
- 两种命中形态：
  - 默认（`expandOnRowClick={false}`）：只有左侧 16×16 的图标按钮可切换。
  - `expandOnRowClick`：整行变成 `role="button"`，点行内任意位置都能切换。
- 折叠态悬停整行时，行内图标 100ms 淡出、箭头 100ms 淡入（两个过渡都只动 `opacity`）。
- 零依赖，只用到 `react` 和 CSS Modules。

| 属性 | 说明 |
| --- | --- |
| `icon` | 折叠态行内图标，放在 16×16 盒子里、内部按 14×14 渲染 |
| `title` | 行标题（13px/24px） |
| `open` / `onToggle` | 受控展开状态与切换回调 |
| `expandable` | 是否可展开。`false` 时无箭头、无交互语义、不可 Tab |
| `expandOnRowClick` | 整行可点（默认 `false`） |
| `collapsedContent` | 折叠时挂在标题后的次要信息，展开后不再渲染 |
| `children` | 展开后渲染在行下方的详情 |
| `className` | 根元素类名，供外部布局使用 |

## 什么时候用

- 折叠／展开一段**次级**内容：设置项的高级选项、文件改动的逐文件明细、工具调用的原始参数。
- 需要在 24px 的同一行里同时表达「有内容可看」与「当前是展开还是收起」。
- 一屏里有很多条同类信息，默认全部收起、让用户按需展开时。

## 什么时候不要用

- 内容属于主流程必经步骤：默认折叠会让用户找不到（`spec/70-checklist.md` 的 `A02`）。
- 展开的内容是**主内容**而不是次级信息：直接用标题 + 正文，不要藏在折叠行后面。
- 纯导航跳转：用链接，`aria-expanded` 表达的是「展开」不是「跳转」。
- 需要在一组互斥内容间切换：那是 Tab / `Pill`；DisclosureRow 的多个实例可以同时展开。
- 只是想省地方而折叠了唯一入口：`AC-MF-16` 要求功能不随空间变化，窗口窄时应收起进菜单，而不是把入口折叠掉。
- 一个 24px 行里塞超过「图标 + 标题 + 一段次要信息」的内容：行高只有 24px，塞不下，请换布局。

## 几何来源

数值全部读自官方
`@deepseek-ai/dsh-client-ui-primitives/lib/DisclosureRow.module.css` 与同目录 `lib/index.js`
的 `function DisclosureRow({ icon, title, open, expandable, onToggle, expandOnRowClick = false, ... })`：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| `display: flex`、`flex-direction: column`、`width: 100%`、`min-width: 0` | `DisclosureRow.module.css` → `.root` |
| `position: relative`、`overflow: hidden`、`display: flex`、`align-items: center`、`min-width: 0` | `DisclosureRow.module.css` → `.row` |
| 行高 `24px` | `DisclosureRow.module.css` → `.row` 的 `height: calc(24px + var(--dsh-content-font-delta, 0px))`，取 delta 缺省值 0 时的结果 |
| `cursor: pointer` | `DisclosureRow.module.css` → `.row[data-expandable]` |
| leading `16×16`、`position: relative`、`flex: none`、`inline-flex` 居中、`margin-right: 6px`、`padding: 0`、`border: none`、`background: none` | `DisclosureRow.module.css` → `.leading` |
| leading 颜色 `var(--dsw-alias-label-tertiary)` | `DisclosureRow.module.css` → `.leading` |
| 行内字形 `14×14` | `DisclosureRow.module.css` → `.leading svg:not([data-state])`（文件注释说明：带 `data-state` 的 StateDot 保持自己的固定尺寸，不随这条规则缩放） |
| `button.leading { cursor: pointer }` | `DisclosureRow.module.css` → `button.leading` |
| `.iconIdle` → `opacity: 1`、`transition: opacity 100ms ease` | `DisclosureRow.module.css` → `.iconIdle` |
| `.chevronHover` → `position: absolute`、`inset: 0`、`margin: auto`、`opacity: 0`、同样的 100ms 过渡 | `DisclosureRow.module.css` → `.chevronHover` |
| `.row:hover` 时 `iconIdle → 0`、`chevronHover → 1` | `DisclosureRow.module.css` → `.row:hover .iconIdle`、`.row:hover .chevronHover` |
| 标题 `flex: none`、`13px`、`line-height: 24px`、`color: var(--dsw-alias-label-secondary)` | `DisclosureRow.module.css` → `.title`（官方是 `var(--dsh-content-font-size-secondary, 13px)` 与 `calc(24px + delta)`，取缺省值） |
| 折叠态渲染「图标 + 悬停箭头」，展开态只渲染箭头；箭头预览默认跟随 `expandable` | `lib/index.js` → `previewChevron = expandable` 与 `collapsedLeading` |
| 可展开且整行可点时：`role="button"`、`tabIndex=0`、`aria-expanded`、`onClick`、`onKeyDown` | `lib/index.js` → `rowExpands` 分支 |
| 仅图标按钮形态：`<button type="button" aria-expanded>` | `lib/index.js` → `expandable && !rowExpands` 分支 |
| Enter 与空格触发，且 `event.preventDefault()` | `lib/index.js` → `toggleFromKeyboard` |
| 折叠态细节：`collapsedContent` 只在未展开时渲染 | `lib/index.js` → `(keepContentWhenOpen \|\| !open) && collapsedContent`（本仓库不暴露 `keepContentWhenOpen`，固定取 `false`） |

箭头图形本身**不是**抄自官方：官方用 `IconChevronDownOutline14`（14×14、填充轮廓形），
本仓库自绘同尺寸（14×14）、1.4px 描边的等价箭头（描边落在 `spec/70-checklist.md` 的
`IC-MF-05` 建议区间 1.25–1.5 内），未复制官方 path 数据。
另外，官方在「折叠悬停」与「已展开」两态用的是**同一个方向**的箭头（不做旋转），本组件保持一致。

**本仓库建议值（非官方数值）：**

- `.row:focus-visible` → `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`：
  官方 `DisclosureRow.module.css` 没有任何焦点样式。键盘用户需要可见焦点，规格取自
  `spec/60-accessibility.md` 的 `AC-MF-11`（2px 实线 + brand-primary + 2px 外偏移），
  写法与官方 `Switch.module.css` 的 `:focus-visible` 一致。
- `.leading:focus-visible` → 同样的 2px brand-primary，但偏移取 **-2px（内偏移）**：
  官方 `.row` 有 `overflow: hidden`，而 leading 的左边正好贴着行左边缘，2px 外偏移的焦点环
  会被裁掉；`AC-MF-12` 明确要求这种情况改用内偏移。
- `button.leading::after { inset: -4px }`：官方 leading 的命中区就是 16×16，低于
  `AC-MF-01` 的 20×20 下限。这里用无背景、无边框的透明伪元素把热区四周各扩 4px；
  左侧 4px 会被 `.row` 的 `overflow: hidden` 裁掉，**实际有效热区 20×24**（≥20×20，
  仍低于常规控件目标 28×28，所以更推荐 `expandOnRowClick`）。可见几何一点没变。
- `@media (prefers-reduced-motion: reduce)` 分支：官方没有这条分支，本仓库补上，
  取 `transition: none`。理由：`spec/40-motion.md` 的 `MO-MF-09`
  是强制项，判定方式就是「样式表中不含 `prefers-reduced-motion` 即违规」。

**本仓库决策（改写官方行为，不是新增数值）：**

- 官方 `.row` 的高度是 `calc(24px + var(--dsh-content-font-delta, 0px))`、`.leading` 的盒子是
  `calc(16px + delta)`、行内字形是 `calc(14px + delta)`、标题字号是
  `var(--dsh-content-font-size-secondary, 13px)`——这一整套是为了跟随 DSH 的
  「设置 → 字体大小」偏好（宿主在 `body` 上发布 `--dsh-content-font-delta`）。
  **本仓库有意删掉这条轴，把四个值固定为 delta = 0 时的官方默认值**
  （24px / 16px / 14px / 13px-24px）。理由有两条：
  1. 这两个变量不在本仓库只读的 token 表 `website/css/dsh-tokens.css` 里（全文 grep
     `content-font-delta`、`content-font-size-secondary` 均无结果）——它们是运行时由宿主
     `body` 发布的，第三方插件在自己的 demo、独立页面或宿主的其他地方拿不到它，
     写死回落值和写死常量在效果上等价，但写死常量不会让人以为它真的会跟随设置变化。
  2. 本仓库的定位是「拿来即用的零依赖源码」，一条在宿主之外静默失效的自适应轴只会增加
     理解成本。
  需要跟随字体偏好的作者，把四个 CSS 变量换回官方那套 `calc(... + var(--dsh-content-font-delta, 0px))`
  即可，几何结构不用动。

实现为本仓库原创：几何由 `.root` 上的组件级 CSS 变量承载、规则重新组织，
数值与官方逐条等价，但不是官方 CSS 的复制。

## 可访问性要点

- **可展开时整行是按钮**：`expandOnRowClick` 打开后，行本身带 `role="button"`、`tabIndex=0`、
  `aria-expanded`，并处理 Enter 与空格（空格会 `preventDefault`，否则页面会滚动）。
  `spec/20-controls.md` 的 `CT-MF-11` 禁止「`div` 冒充按钮」，其自动判定口径是
  「出现 `role="button"` 但无键盘事件处理」——本组件实现了完整键盘处理，不落入该判定。
- **仅图标按钮形态要单独给 `aria-expanded`**：`expandOnRowClick={false}` 时，行不是按钮，
  展开状态挂在左侧 16×16 的 `<button>` 上（`aria-expanded={open}`）。
  此时命中区只有 20×24（见上），**建议直接用 `expandOnRowClick`**，让整行成为命中区。
- 标题文字要能独立说明「展开后会看到什么」，不要写成「详情」「更多」——读屏用户只听到
  行标题与「已折叠 / 已展开」，没有上下文。可以用 `collapsedContent` 补充当前值
  （例如「已修改文件 3 个」），它是行内文本，会被一起朗读。
- 展开的内容区域本身没有 `role="region"`、也没有与行的 `aria-controls` 关联（官方实现
  如此）。如果展开内容很长，请自行给容器加标题与结构；折叠状态由行的 `aria-expanded` 承载。
- 折叠态悬停用「图标 vs 箭头」的**形状**差异表达可展开，不靠颜色
  （`AC-MF-07`）。但悬停只有鼠标有：键盘用户靠焦点环与 `aria-expanded`，所以焦点环不能省。
- 行高 24px 是官方的紧凑值，低于 `AC-MF-01` 的常规命中区目标 28×28；
  触摸为主的场景请用 `expandOnRowClick`，或在外层给更大的行距。
- 焦点环用 `outline` 而不是 `box-shadow`：`.row` 有 `overflow: hidden`，
  `outline` 画在元素自己的盒子上、不受它裁剪（leading 按钮那处例外，已改用内偏移）。
