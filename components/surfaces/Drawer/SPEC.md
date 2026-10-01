# Drawer · SPEC

- id: drawer
- category: surfaces
- source: `components/surfaces/Drawer/`（`index.tsx` / `drawer.module.css`）
- official-counterpart: 官方无抽屉组件；面板几何复用 `@deepseek-ai/dsh-client-ui-primitives/lib/Modal.module.css` 的内层结构与 `.mask`，只把「居中浮层」换成「贴边满高」
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

官方没有抽屉组件，面板的每一段几何都从已核实的官方选择器借用，写法为「数值 ← 文件名 选择器 / 实现」。

| 数值 | 出处 |
| --- | --- |
| 遮罩 `position: absolute`、`inset: 0`、`background: var(--dsw-alias-bg-mask-1)`、`backdrop-filter: var(--dsw-mask-blur)` | ← `Modal.module.css` `.mask` |
| 面板底色 `var(--dsw-alias-bg-layer-2)` | ← `Modal.module.css` `.dialog` |
| 面板阴影 `var(--dsw-elevation-prominent)` | ← `Modal.module.css` `.dialog`；`Menu.module.css` `.list` |
| `position: fixed`、`inset: 0`、`z-index: 1000` | ← `Modal.module.css` `.root` |
| `.content` 的 `display: flex` / `flex-direction: column` / `width: 100%` | ← `Modal.module.css` `.content` |
| `padding: 22px 14px 12px 24px`、`gap: 8px`、`align-items: center`、`justify-content: space-between` | ← `Modal.module.css` `.header` |
| `font-size: 16px`、`line-height: 24px`、`font-weight: 500`、`color: var(--dsw-alias-label-primary)`、`margin: 0` | ← `Modal.module.css` `.title` |
| `width: 28px`、`height: 28px`、`border-radius: 8px`、`border: none`、`background: transparent`、`color: var(--dsw-alias-label-secondary)`、`flex: none` | ← `Modal.module.css` `.close` |
| `background: var(--dsw-alias-interactive-bg-hover)` | ← `Modal.module.css` `.close:hover` |
| `padding: 0 24px`、`font-size: 14px`、`line-height: 22px`、`font-weight: 400`、`color: var(--dsw-alias-label-primary)` | ← `Modal.module.css` `.description` |
| `margin-top: 20px`、`padding: 0 24px`、`min-width: 0` | ← `Modal.module.css` `.body` |
| `justify-content: flex-end`、`gap: 8px`、`padding: 0 24px`、`align-items: center` | ← `Modal.module.css` `.footer` |
| `gap: 20px`（内容区与 footer 之间）、`padding: 0 0 24px`（面板底边留白） | ← `Modal.module.css` `.dialog` |
| 关闭图标 `14px` | ← 官方 `index.js` 的 `Modal`：`jsx(IconCloseOutline16, { size: 14 })` |
| `createPortal(..., document.body)`、`role="dialog"`、`aria-modal="true"`、`aria-label={title}`、根为 `role="presentation"`、遮罩 `aria-hidden="true"`、点遮罩 `onClick={onClose}`、document 级 `keydown` 判 `Escape` | ← 官方 `index.js` 的 `Modal` |

### 本仓库建议值（非官方数值）

- **面板宽度默认 `320px`**：官方没有抽屉。320 是 4 的倍数，也是中文界面下「一列设置项 + 控件」不被挤压的下限（官方对话框是 `min(380px, 100%)`，抽屉比它窄一档，才不会在 1024px 宽的窗口里占掉三分之一页面）。`width` 支持字符串，需要 `'40vw'` 这类比例宽度时直接传。
- **面板圆角为 0**：官方 `.dialog` 的 `border-radius: 24px` 是「居中浮层」的几何；抽屉满高贴边，圆角会在面板与视口边缘之间露出缝隙。官方 `Menu.module.css` `.list` 的 `border-radius: 20px` 同理（它是浮层菜单，不是贴边面板）。
- **`.panel { justify-content: flex-end / flex-start }` 由 `data-side` 切换**：官方没有抽屉，方向切换的写法是本仓库选择的（只用一个属性选择器，不需要两份规则）。
- **`.content { flex: 1; min-height: 0; overflow-y: auto }`**：官方 `.dialog` 高度自适应，不需要滚动容器；抽屉是满高的，内容过长必须能在面板内滚动，否则内容会被 `overflow: hidden` 直接裁掉。`min-height: 0` 是让 flex 子项真正能收缩的必要条件。
- **`.footer { flex: none }`**：保证底部操作行不被滚动的兄弟节点挤压。
- **焦点陷阱**：与 `Modal` 同款（打开时焦点移进面板、Tab 在面板内循环、关闭后把焦点还给触发元素），在本目录内独立实现，不跨目录引用。官方 Modal 没有做焦点陷阱，抽屉更是没有官方实现可参照。
- `.panel { outline: none }`、`.close { padding: 0 }`、`.panel` / `.close` 上的 `box-sizing: border-box`：同 `Modal` 的理由——面板要能被 `.focus()`（配 `tabIndex={-1}`）但不该画容器焦点环；官方 CSS 依赖宿主的全局 `border-box` reset，本仓库组件不假定宿主有 reset。
- `.close:focus-visible` 的 `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`：官方 `.close` 没有焦点样式，写法对齐官方 `Switch.module.css`。
- 不做滑入 / 滑出动画，也不做滚动锁定：官方 Modal 没有任何进出场动画，本仓库保持一致（要给抽屉加动画，请自行加并在 `prefers-reduced-motion` 下关掉）。

### 本仓库决策（改写官方行为）

- 面板几何（宽度、圆角、满高、方向切换、滚动容器）与焦点陷阱为本仓库对官方 Modal 行为的改写与补充：官方没有抽屉可对齐，本组件把官方对话框的内层结构原样搬过来，只改外层落位。改写点已在上面逐条列明。

实现为本仓库原创（用 CSS 变量承载几何 + `data-side` 切方向），几何等价但不是官方 CSS 的复制。

## api

`DrawerProps`，`forwardRef<HTMLDivElement, DrawerProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | 必填 | 是否显示；为 `false` 时不渲染任何内容 |
| `onClose` | `() => void` | 必填 | 关闭回调：Escape、点击遮罩、点击关闭按钮都会调用 |
| `title` | `string` | 必填 | 既渲染成 `<h2>` 文本，也作为面板的 `aria-label`；必须是纯字符串 |
| `closeLabel` | `string` | 必填 | 关闭按钮的可访问名（如「关闭」/ `Close`） |
| `side` | `'left' \| 'right'` | `'right'` | 停靠方向，写到 `.root` 的 `data-side` |
| `width` | `number \| string` | `320` | 面板宽度；数字按 px 处理，字符串（如 `'40vw'`）原样写进 `--dsh-drawer-width` |
| `description` | `ReactNode` | 无 | 标题下方一句话说明；为空字符串时不渲染 |
| `children` | `ReactNode` | 无 | 主体内容，超出高度时在 `.content` 内滚动 |
| `footer` | `ReactNode` | 无 | 底部操作行，右对齐 |
| `className` | `string` | 无 | 追加到面板本体 |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到面板本体，同时供内部焦点陷阱使用 |

`DrawerSide` 为导出的类型别名。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 关闭 | `open === false` | `return null`，不渲染 portal |
| 打开 | `open === true` | portal 到 `document.body`，渲染 `.root` / `.mask` / `.panel` |
| 停靠右侧 | `side === 'right'`（默认） | `.root[data-side='right'] { justify-content: flex-end }` |
| 停靠左侧 | `side === 'left'` | `.root[data-side='left'] { justify-content: flex-start }` |
| 自定义宽度 | `width` 为数字或字符串 | 数字拼成 `Npx`，字符串原样写入 `--dsh-drawer-width`；`.panel` 另有 `max-width: 100%` |
| 内容溢出 | `.content` 内高度超出 | `flex: 1; min-height: 0; overflow-y: auto`，在面板内滚动 |
| 无说明 | `description == null` 或 `=== ''` | 不渲染 `.description` |
| 无底部 | `footer == null` | 不渲染 `.footer`；`.footer` 为 `flex: none` |
| 关闭按钮悬停 | `.close:hover` | `background: var(--dsw-alias-interactive-bg-hover)` |
| 关闭按钮键盘焦点 | `.close:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`（本仓库建议值） |
| 面板聚焦 | `.panel` 配 `tabIndex={-1}` | `outline: none`（容器不作焦点指示） |
| Escape | document 级 `keydown` | 调 `onClose` |
| 点击遮罩 | `.mask` 的 `onClick` | 调 `onClose` |
| 焦点进入 / 循环 / 归还 | 同 `Modal` | 打开时聚焦面板内第一个可聚焦元素（无则面板本体），Tab / Shift+Tab 在面板内循环，关闭后还给打开前的 `document.activeElement`（本仓库建议值） |

## tokens

DSH 语义 token：

- `--dsw-alias-bg-mask-1` — `.mask` 遮罩底色
- `--dsw-mask-blur` — `.mask` 的 `backdrop-filter`
- `--dsw-alias-bg-layer-2` — `.panel` 底色
- `--dsw-elevation-prominent` — `.panel` 阴影
- `--dsw-alias-label-primary` — `.title` / `.description` 颜色
- `--dsw-alias-label-secondary` — `.close` 图标颜色
- `--dsw-alias-interactive-bg-hover` — `.close:hover` 底色
- `--dsw-alias-brand-primary` — 焦点环颜色（本仓库建议值）

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-drawer-z`（`1000`）
- `--dsh-drawer-width`（默认 `320px`，可由 `width` 覆盖；`.panel` 上另有 `max-width: 100%`）

## a11y

- **`title` 必须是纯字符串**、**`closeLabel` 必填**：面板用 `aria-label={title}` 命名，关闭按钮里只有一个图标。缺了这两样，屏幕阅读器读到的就是一个没有名字的对话框和一个空按钮（`AC-MF-14`）。
- 遮罩点击关闭对触摸用户是必需的：触摸端没有 Escape 键，只留 Escape 等于把触摸用户关在抽屉里。
- 焦点陷阱（本仓库建议值）：聚焦第一个可聚焦元素 ⇒ Tab / Shift+Tab 在面板内循环 ⇒ 关闭后焦点回到触发元素。抽屉没有陷阱时，Tab 会跑到底层页面上，键盘用户看不出现在在哪一层。
- 内容区可滚动但不进 Tab 序列：Tab 到面板内的元素时浏览器会自动把它滚入视野。如果抽屉里全是不可聚焦的长文本，请自己给内容包一层 `tabindex="0"` + `role="region"` + `aria-label`（官方 `markdown/MarkdownText.module.css` 的 `.tableScroll` 就是这么处理可滚动容器的）。注意这会给焦点陷阱多加一个 Tab 停留点。
- 关闭按钮命中区 28×28，达到 `AC-MF-01` 的常规控件目标 28×28。
- 焦点环用 `outline` 而不是 `box-shadow`，避免被父级 `overflow: hidden` 裁掉（`AC-MF-12`）。
- 抽屉比对话框更宽、更容易容纳长文，但它仍然是「临时层」：不要把只能在这里读到的关键信息放进去，用户按 Escape 就回到原页面了。
- `z-index: 1000` 与官方对话框同层：两者不要同时打开（同一个位置会出现两层遮罩，焦点陷阱也会互相抢 Tab）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `open === false` 时组件返回 `null`，不渲染任何 DOM。
2. 面板存在可访问名，且来源为纯字符串 `title`（`aria-label={title}`）；`title` 的类型不得放宽为 `ReactNode`。
3. `closeLabel` 在类型中为必填（不可选）。
4. 焦点陷阱三步齐全：打开时聚焦面板内第一个可聚焦元素（无则面板本体）、Tab / Shift+Tab 在面板内循环、关闭时把焦点还给打开前的 `document.activeElement`。
5. 面板带 `tabIndex={-1}`，且 `.panel` 声明 `outline: none`。
6. 关闭按钮存在 `:focus-visible` 样式（`AC-MF-10`、清单 `A48`）。
7. 焦点环规格为 2px 实线 + `--dsw-alias-brand-primary` + 2px 外偏移（`AC-MF-11`、清单 `A48`）。
8. Escape 关闭存在（document 级 `keydown` 判 `Escape`），不得移除。
9. 遮罩为 `aria-hidden="true"`，且其点击调用 `onClose`。
10. 方向由 `.root` 的 `data-side` 单一属性切换，且渲染出的面板不含圆角（`border-radius` 为 0 或不声明）。
11. `.content` 同时声明 `flex: 1`、`min-height: 0`、`overflow-y: auto`；`.footer` 声明 `flex: none`。
12. `.panel` 声明 `max-width: 100%`，宽度不超过视口。
13. 不做滚动锁定，也不做进出场动画：源码中不得出现 `@keyframes` / `transition` / `animation` 声明。
14. 关闭图标为 `aria-hidden="true"`，可访问名只由按钮的 `aria-label` 提供（`AC-MF-14`）。
15. 关闭按钮命中区 ≥ 20×20（实际 28×28，`AC-MF-01`）。
16. `drawer.module.css` 中不出现十六进制颜色字面量（`#`）、`rgb(`、`hsl(`；颜色全部走 `var(--dsw-*)`。
17. 组件不 import 除 `react` / `react-dom`（仅 `createPortal`）以外的任何运行时依赖（含 `@deepseek-ai/*`）；焦点陷阱在本目录内独立实现，不跨目录引用 `Modal`。
18. 不嵌套使用：同一时刻只允许一个抽屉或对话框打开（人审，见 `README.md`「什么时候不要用它」）。

## demo

- `components/surfaces/Drawer/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 相关条款：`spec/60-accessibility.md`（`AC-MF-01`、`AC-MF-10`、`AC-MF-11`、`AC-MF-12`、`AC-MF-14`）、`spec/70-checklist.md`（`A48`）
