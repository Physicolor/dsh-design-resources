# Modal · SPEC

- id: modal
- category: surfaces
- source: `components/surfaces/Modal/`（`index.tsx` / `modal.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Modal.module.css` 与同目录 `index.js` 的 `Modal`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 `Modal.module.css` 与同目录 `index.js` 里的 `Modal` 实现，写法为「数值 ← 文件名 选择器 / 实现」。

| 数值 | 出处 |
| --- | --- |
| `position: fixed`、`inset: 0`、`z-index: 1000`、`padding: 24px`、居中 flex | ← `Modal.module.css` `.root` |
| `background: var(--dsw-alias-bg-mask-1)`、`backdrop-filter: var(--dsw-mask-blur)` | ← `Modal.module.css` `.mask` |
| `gap: 20px`、`width: min(380px, 100%)`、`padding: 0 0 24px`、`border-radius: 24px`、`background: var(--dsw-alias-bg-layer-2)`、`box-shadow: var(--dsw-elevation-prominent)`、`overflow: hidden`、`border: 0`、`position: relative`、`z-index: 1` | ← `Modal.module.css` `.dialog` |
| `display: flex` / `flex-direction: column` / `width: 100%` | ← `Modal.module.css` `.content` |
| `padding: 22px 14px 12px 24px`、`gap: 8px`、`align-items: center`、`justify-content: space-between` | ← `Modal.module.css` `.header` |
| `font-size: 16px`、`line-height: 24px`、`font-weight: 500`、`color: var(--dsw-alias-label-primary)`、`margin: 0` | ← `Modal.module.css` `.title` |
| `width: 28px`、`height: 28px`、`border-radius: 8px`、`border: none`、`background: transparent`、`color: var(--dsw-alias-label-secondary)`、`cursor: pointer`、`flex: none` | ← `Modal.module.css` `.close` |
| `background: var(--dsw-alias-interactive-bg-hover)` | ← `Modal.module.css` `.close:hover` |
| `margin: 0`、`padding: 0 24px`、`font-size: 14px`、`line-height: 22px`、`font-weight: 400`、`color: var(--dsw-alias-label-primary)` | ← `Modal.module.css` `.description` |
| `margin-top: 20px`、`padding: 0 24px`、`min-width: 0`、`flex-direction: column` | ← `Modal.module.css` `.body` |
| `justify-content: flex-end`、`gap: 8px`、`padding: 0 24px`、`align-items: center` | ← `Modal.module.css` `.footer` |
| 关闭图标 `14px` | ← 官方 `index.js` 的 `Modal`：`jsx(IconCloseOutline16, { size: 14 })` |
| `createPortal(..., document.body)`、`role="dialog"`、`aria-modal="true"`、`aria-label={title}`、根为 `role="presentation"`、遮罩 `aria-hidden="true"`、点遮罩 `onClick={onClose}`、document 级 `keydown` 判 `Escape` 调 `onClose` | ← 官方 `index.js` 的 `Modal` |

官方文件顶部注释写明这组几何来自 Figma（Mask + Dialog）：

- `Mask + Dialog 451:18655`（`.root` 注释）——遮罩 + 居中卡片。注意该文件遮罩注释声称 light 主题遮罩是 `rgba(0,0,0,0.24)` + `blur(2px)`，但线上 `--dsw-mask-blur` 的实际值是 `none`，本仓库按实际值使用，不把那句注释当事实。
- `r24, elevation-prominent, layer-2 fill, pb 24`（`.dialog` 注释）。
- `Title row: pad l24/t22/r14/b12, SPACE_BETWEEN`（`.header` 注释）。
- `wt510, rendered 500`（`.title` 注释）——Figma 的 510 落到 CSS 是 500。

### 本仓库建议值（非官方数值）

- **焦点陷阱**：官方 Modal 没有做焦点陷阱。官方 `index.js` 只监听 document 的 `Escape`；整个 primitives 包里只有 `OnboardingSurface` 用了宿主 `inert`。但官方的对话框已经写了 `aria-modal="true"`，这是向辅助技术承诺「其余内容不可达」；没有陷阱时 Tab 会一路跑到遮罩背后的页面上，承诺与行为不一致。本仓库补上：打开时把焦点移进对话框（优先第一个可聚焦元素，没有则落在对话框本体）、Tab / Shift+Tab 在对话框内循环、关闭后把焦点还给打开它的那个元素。实现只用 `document.activeElement` 与 `querySelectorAll`，不引入依赖。
- `.dialog { outline: none }`：对话框本体要能被 `.focus()`（配 `tabIndex={-1}`），但它是容器不是控件，不该画默认焦点环。官方没有显式声明这一条。
- `.close { padding: 0 }` 与 `.dialog` / `.close` 上的 `box-sizing: border-box`：官方 CSS 没有写 `box-sizing`，也依赖宿主的全局 `border-box` reset——官方 `.close` 是 `width/height: 28px` 加浏览器默认按钮内边距，只有在全局 `border-box` 下才是 28×28 的方块。本仓库组件不假定宿主有 reset，所以显式声明 `box-sizing: border-box`，并把关闭按钮的内边距归零（`0` 不涉及几何取舍，只是把默认值摆平）；`Button` 组件的 `.button` 同样显式声明了 `box-sizing`。
- `.close:focus-visible` 的 `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`：官方 `.close` 没有焦点样式。键盘用户需要看见焦点在哪，写法与官方 `Switch.module.css` 的 `:focus-visible` 一致。
- 不做滚动锁定（`body { overflow: hidden }`）：官方没做，本仓库保持一致；需要锁滚动请在调用方处理，别改这个组件。

### 本仓库决策（改写官方行为）

- 焦点陷阱（同上）：官方只有 `aria-modal="true"` 的承诺、没有对应行为，本仓库补齐，属主动改写官方行为。除此之外，几何、`aria` 结构、`Escape` 与遮罩点击行为均与官方一致，未作改写。

实现为本仓库原创（用 CSS 变量承载几何 + 结构化 DOM），几何等价但不是官方 CSS 的复制。

## api

`ModalProps`，`forwardRef<HTMLDivElement, ModalProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | 必填 | 是否显示；为 `false` 时不渲染任何内容（不留 DOM 残留） |
| `onClose` | `() => void` | 必填 | 关闭回调：Escape、点击遮罩、点击关闭按钮都会调用 |
| `title` | `string` | 必填 | 既渲染成 `<h2>` 文本，也作为对话框的 `aria-label`；必须是纯字符串 |
| `closeLabel` | `string` | 必填 | 关闭按钮的可访问名（如「关闭」/ `Close`） |
| `description` | `ReactNode` | 无 | 标题下方一句话说明；为空字符串时不渲染 |
| `children` | `ReactNode` | 无 | 主体内容，渲染进 `.body` |
| `footer` | `ReactNode` | 无 | 底部操作行，右对齐 |
| `className` | `string` | 无 | 追加到对话框本体（拉宽、换底色） |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到对话框本体，同时供内部焦点陷阱使用 |

引用了这个组件就不要再自己写遮罩层：遮罩的点击关闭、Escape、焦点归还都由组件负责。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 关闭 | `open === false` | `return null`，不渲染 portal |
| 打开 | `open === true` | portal 到 `document.body`，渲染 `.root` / `.mask` / `.dialog` |
| 无说明 | `description == null` 或 `=== ''` | 不渲染 `.description` |
| 无正文 | `children == null` | 不渲染 `.body` |
| 无底部 | `footer == null` | 不渲染 `.footer` |
| 关闭按钮悬停 | `.close:hover` | `background: var(--dsw-alias-interactive-bg-hover)` |
| 关闭按钮键盘焦点 | `.close:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`（本仓库建议值） |
| 对话框聚焦 | `.dialog` 配 `tabIndex={-1}` | `outline: none`（容器不作焦点指示） |
| Escape | document 级 `keydown` | 调 `onClose` |
| 点击遮罩 | `.mask` 的 `onClick` | 调 `onClose` |
| 焦点进入 | `open` 变真时 | 聚焦对话框内第一个可聚焦元素（`a[href]` / `button:not([disabled])` / `input:not([disabled]):not([type="hidden"])` / `select` / `textarea` / `[tabindex]:not([tabindex="-1"])`，且非 `disabled`、非 `aria-hidden="true"`）；没有则聚焦对话框本体 |
| 焦点循环 | 框内按 Tab / Shift+Tab | 在首尾之间循环；焦点若已在框外则拉回（本仓库建议值） |
| 焦点归还 | 关闭时 | `restore?.focus()` 还给打开前的 `document.activeElement`（本仓库建议值） |

## tokens

DSH 语义 token：

- `--dsw-alias-bg-mask-1` — `.mask` 遮罩底色
- `--dsw-mask-blur` — `.mask` 的 `backdrop-filter`（线网实际值为 `none`）
- `--dsw-alias-bg-layer-2` — `.dialog` 底色
- `--dsw-elevation-prominent` — `.dialog` 阴影
- `--dsw-alias-label-primary` — `.title` / `.description` 颜色
- `--dsw-alias-label-secondary` — `.close` 图标颜色
- `--dsw-alias-interactive-bg-hover` — `.close:hover` 底色
- `--dsw-alias-brand-primary` — 焦点环颜色（本仓库建议值）

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-modal-z`（`1000`）
- `--dsh-modal-pad`（`24px`，`.root` 的视口内边距）
- `--dsh-modal-width`（`380px`）
- `--dsh-modal-radius`（`24px`）
- `--dsh-modal-gap`（`20px`，`.dialog` 的 `gap` 与 `.body` 的 `margin-top` 共用）
- `--dsh-modal-pad-x`（`24px`，`.description` / `.body` / `.footer` 的水平内边距）

## a11y

- **`title` 必须是纯字符串**：官方用它同时做标题文本和 `aria-label`。传节点（例如带图标或 `<code>` 的标题）会让对话框没有可访问名。
- **`closeLabel` 必填**：关闭按钮里只有一个图标，没有名字时屏幕阅读器读出的就是一个空按钮。请传本地化文案（`关闭` / `Close`）。符合 `AC-MF-14`。
- 焦点陷阱（本仓库建议值）：打开时焦点进入对话框 ⇒ Tab 只在对话框内循环 ⇒ 关闭后回到触发按钮。这三步缺一不可，只做第一步会让键盘用户「进去出不来」或「出来找不到位置」。
- Escape 关闭是必备出口，不要为了「强制选择」把它禁掉；真正的强制流程应该改产品设计而不是拿掉键盘出口。
- 遮罩点击关闭对触摸用户是必要的（触摸端没有 Escape 键）；但如果这个关闭动作会丢数据，请在 `onClose` 里自己加二次确认。
- 对话框里不要放自动聚焦 + 立即提交的组合（例如输入框回车即销毁），误触代价太高。
- 图标为 `aria-hidden="true"`，名字由按钮的 `aria-label` 提供，避免读两遍。
- 关闭按钮命中区 28×28，达到 `AC-MF-01` 的常规控件目标 28×28。
- 焦点环用 `outline` 而不是 `box-shadow`，避免被父级 `overflow: hidden` 裁掉（`AC-MF-12`）。
- `z-index: 1000` 是官方值：宿主里还有 `Toast`(1100) / `Tooltip`(100) 等层级，覆盖层顺序不要在这个组件里改，避免出现提示被遮住的情况。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `open === false` 时组件返回 `null`，不渲染任何 DOM。
2. 对话框存在可访问名，且来源为纯字符串 `title`（`aria-label={title}`）；`title` 的类型不得放宽为 `ReactNode`。
3. `closeLabel` 在类型中为必填（不可选）。
4. 焦点陷阱三步齐全：打开时聚焦框内第一个可聚焦元素（无则对话框本体）、Tab / Shift+Tab 在框内循环、关闭时把焦点还给打开前的 `document.activeElement`。
5. 对话框本体带 `tabIndex={-1}`，且 `.dialog` 声明 `outline: none`。
6. 关闭按钮存在 `:focus-visible` 样式（`AC-MF-10`、清单 `A48`）。
7. 焦点环规格为 2px 实线 + `--dsw-alias-brand-primary` + 2px 外偏移（`AC-MF-11`、清单 `A48`）。
8. Escape 关闭存在（document 级 `keydown` 判 `Escape`），不得移除。
9. 遮罩为 `aria-hidden="true"`，且其点击调用 `onClose`。
10. 渲染位置为 `document.body` 之下（`createPortal`）；`.root` 的 `z-index: 1000` 与官方一致，组件内不得改写。
11. 不做滚动锁定：源码中不得出现对 `document.body` 的 `overflow` 写入。
12. 关闭图标为 `aria-hidden="true"`，可访问名只由按钮的 `aria-label` 提供（`AC-MF-14`）。
13. 关闭按钮命中区 ≥ 20×20（实际 28×28，`AC-MF-01`）。
14. `.dialog` 与 `.close` 声明 `box-sizing: border-box`，`.close` 的 `padding` 为 `0`。
15. `modal.module.css` 中不出现十六进制颜色字面量（`#`）、`rgb(`、`hsl(`；颜色全部走 `var(--dsw-*)`。
16. 组件不 import 除 `react` / `react-dom`（仅 `createPortal`）以外的任何运行时依赖（含 `@deepseek-ai/*`）。
17. 不嵌套使用：同一时刻只允许一个 Modal 打开（人审，见 `README.md`「什么时候不要用它」）。

## demo

- `components/surfaces/Modal/demo.html`

## 真实场景（docs/reference 截图核对）

**截图未覆盖**：7 张截图里没有任何一处是 Modal。

逐一排除过的候选：

| 候选 | 图 | 实拍 | 为什么不是本组件 |
| --- | --- | --- | --- |
| 设置面板 | `03-settings-open.png` / `04-settings-models.png` / `05-settings-components.png` | 约 790 × 800，**背后内容没有被压暗或模糊**（无 mask） | 宽度不是 `min(380px, 100%)`；没有 `bg-mask-1` 遮罩层；它是另一个表面，不是 dialog |

处理规则：demo 只做**中性几何复现**（标题写「示例标题」、按钮写「取消 / 确定」），并在页面上注明「此场景未在截图中出现，仅按几何复现」，不编任何使用场合。

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 相关条款：`spec/60-accessibility.md`（`AC-MF-01`、`AC-MF-10`、`AC-MF-11`、`AC-MF-12`、`AC-MF-14`）、`spec/70-checklist.md`（`A48`）
