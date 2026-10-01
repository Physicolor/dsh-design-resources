# Modal 对话框

居中的对话框：一层遮罩 + 一张 r24 卡片，portal 到 `document.body`。

## 是什么

零依赖的对话框，只 import `react`、`react-dom`（`createPortal`）与 CSS Modules。
几何逐条对齐官方 Modal，另加一个官方没有的焦点陷阱。

| prop | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 是否显示；`false` 时不渲染 |
| `onClose` | `() => void` | Escape、点击遮罩、点击关闭按钮都会调用 |
| `title` | `string` | 必填。既是 `<h2>` 文本，也是对话框的 `aria-label` |
| `closeLabel` | `string` | 必填。关闭按钮的可访问名 |
| `description` | `ReactNode` | 标题下方的一句话说明 |
| `children` | `ReactNode` | 主体内容 |
| `footer` | `ReactNode` | 底部操作行，右对齐 |
| `className` | `string` | 追加到对话框本体（拉宽、换底色） |

引用了这个组件就不要再自己写遮罩层：遮罩的点击关闭、Escape、焦点归还都由组件负责。

## 什么时候用

- 需要用户先回答再做下一步：确认创建、输入名称、选择保存位置。
- 一个动作有不可逆后果、需要显式确认时（配合 `RiskConfirmation` 那一类内容）。
- 错误 / 失败需要用户当场决定怎么办（重试 / 取消）。

## 什么时候不要用

- 只是告知：用 `Toast`，通知不该拦住用户手上的事。
- 内容很多、需要滚动阅读：用 `Drawer` 或独立页面，对话框适合短决策。
- 嵌套对话框：不要在一个 Modal 上再开一个 Modal，改成在对话框内切换内容。
- 二选一且不需解释：用行内的确认按钮组，不必抬一层遮罩。
- 频繁触发的流程：每次都弹会打断节奏，考虑内联表单。

## 几何来源

全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/Modal.module.css` 与同目录 `index.js` 里的 `Modal` 实现：

| 数值 | 出处（文件名 + 选择器 / 实现） |
| --- | --- |
| `position: fixed`、`inset: 0`、`z-index: 1000`、`padding: 24px`、居中 flex | `Modal.module.css` `.root` |
| `background: var(--dsw-alias-bg-mask-1)`、`backdrop-filter: var(--dsw-mask-blur)` | `.mask` |
| `gap: 20px`、`width: min(380px, 100%)`、`padding: 0 0 24px`、`border-radius: 24px`、`background: var(--dsw-alias-bg-layer-2)`、`box-shadow: var(--dsw-elevation-prominent)`、`overflow: hidden`、`border: 0`、`position: relative`、`z-index: 1` | `.dialog` |
| `display: flex` / `flex-direction: column` / `width: 100%` | `.content` |
| `padding: 22px 14px 12px 24px`、`gap: 8px`、`align-items: center`、`justify-content: space-between` | `.header` |
| `font-size: 16px`、`line-height: 24px`、`font-weight: 500`、`color: var(--dsw-alias-label-primary)`、`margin: 0` | `.title` |
| `width: 28px`、`height: 28px`、`border-radius: 8px`、`border: none`、`background: transparent`、`color: var(--dsw-alias-label-secondary)`、`cursor: pointer`、`flex: none` | `.close` |
| `background: var(--dsw-alias-interactive-bg-hover)` | `.close:hover` |
| `margin: 0`、`padding: 0 24px`、`font-size: 14px`、`line-height: 22px`、`font-weight: 400`、`color: var(--dsw-alias-label-primary)` | `.description` |
| `margin-top: 20px`、`padding: 0 24px`、`min-width: 0`、`flex-direction: column` | `.body` |
| `justify-content: flex-end`、`gap: 8px`、`padding: 0 24px`、`align-items: center` | `.footer` |
| 关闭图标 14px | 官方 `index.js` 的 `Modal`：`jsx(IconCloseOutline16, { size: 14 })` |
| `createPortal(..., document.body)`、`role="dialog"`、`aria-modal="true"`、`aria-label={title}`、`role="presentation"` 的根、`aria-hidden="true"` 的遮罩、点遮罩 `onClick={onClose}`、document 级 `keydown` 判 `Escape` 调 `onClose` | 官方 `index.js` 的 `Modal` |

官方文件顶部注释写明这组几何来自 Figma（Mask + Dialog）：

- `Mask + Dialog 451:18655`（`.root` 注释）——遮罩 + 居中卡片。注意该文件第 12–13 行的注释声称 light 主题遮罩是 `rgba(0,0,0,0.24)` + `blur(2px)`，但线上 `--dsw-mask-blur` 的实际值是 `none`，本仓库按实际值使用，不把那句注释当事实。
- `r24, elevation-prominent, layer-2 fill, pb 24`（`.dialog` 注释）。
- `Title row: pad l24/t22/r14/b12, SPACE_BETWEEN`（`.header` 注释）。
- `wt510, rendered 500`（`.title` 注释）——Figma 的 510 落到 CSS 是 500。

**本仓库建议值（非官方数值）：**

- **焦点陷阱**：官方 Modal 没有做焦点陷阱。官方 `index.js` 只监听 document 的 `Escape`；整个 primitives 包里只有 `OnboardingSurface` 用了宿主 `inert`。但官方的对话框已经写了 `aria-modal="true"`，这是向辅助技术承诺「其余内容不可达」；没有陷阱时 Tab 会一路跑到遮罩背后的页面上，承诺与行为不一致。本仓库补上：打开时把焦点移进对话框（优先第一个可聚焦元素，没有则落在对话框本体）、Tab / Shift+Tab 在对话框内循环、关闭后把焦点还给打开它的那个元素。实现只用 `document.activeElement` 与 `querySelectorAll`，不引入依赖。
- `.dialog { outline: none }`：对话框本体要能被 `.focus()`（配 `tabIndex={-1}`），但它是容器不是控件，不该画默认焦点环。官方没有显式声明这一条。
- `.close { padding: 0 }` 与 `.dialog` / `.close` 上的 `box-sizing: border-box`：官方 CSS 没有写 `box-sizing`，也依赖宿主的全局 `border-box` reset——官方 `.close` 是 `width/height: 28px` 加浏览器默认按钮内边距，只有在全局 `border-box` 下才是 28×28 的方块。本仓库组件不假定宿主有 reset，所以显式声明 `box-sizing: border-box`，并把关闭按钮的内边距归零（`0` 不涉及几何取舍，只是把默认值摆平）；`Button` 组件的 `.button` 同样显式声明了 `box-sizing`。
- `.close:focus-visible` 的 `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`：官方 `.close` 没有焦点样式。键盘用户需要看见焦点在哪，写法与官方 `Switch.module.css` 的 `:focus-visible` 一致。
- 不做滚动锁定（`body { overflow: hidden }`）：官方没做，本仓库保持一致；需要锁滚动请在调用方处理，别改这个组件。

实现为本仓库原创（用 CSS 变量承载几何 + 结构化 DOM），几何等价但不是官方 CSS 的复制。

## 可访问性要点

- **`title` 必须是纯字符串**：官方用它同时做标题文本和 `aria-label`。传节点（例如带图标或 `<code>` 的标题）会让对话框没有可访问名。
- **`closeLabel` 必填**：关闭按钮里只有一个图标，没有名字时屏幕阅读器读出的就是一个空按钮。请传本地化文案（`关闭` / `Close`）。
- 焦点陷阱（§ 本仓库建议值）：打开时焦点进入对话框 ⇒ Tab 只在对话框内循环 ⇒ 关闭后回到触发按钮。这三步缺一不可，只做第一步会让键盘用户「进去出不来」或「出来找不到位置」。
- Escape 关闭是必备出口，不要为了「强制选择」把它禁掉；真正的强制流程应该改产品设计而不是拿掉键盘出口。
- 遮罩点击关闭对触摸用户是必要的（触摸端没有 Escape 键）；但如果这个关闭动作会丢数据，请在 `onClose` 里自己加二次确认。
- 对话框里不要放自动聚焦 + 立即提交的组合（例如输入框回车即销毁），误触代价太高。
- `z-index: 1000` 是官方值：宿主里还有 `Toast`(1100) / `Tooltip`(100) 等层级，覆盖层顺序不要在这个组件里改，避免出现提示被遮住的情况。
