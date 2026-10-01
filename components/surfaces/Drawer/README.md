# Drawer 抽屉

从侧边停靠的满高面板：一层遮罩 + 一块贴边面板，portal 到 `document.body`。

## 是什么

零依赖的侧边抽屉，只 import `react`、`react-dom`（`createPortal`）与 CSS Modules。
官方没有对应组件，所以面板几何复用官方 Modal 对话框的内层结构（header / title /
close / description / body / footer）与官方遮罩 `.mask`，只把「居中浮层」换成
「贴边满高」。

| prop | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 是否显示；`false` 时不渲染 |
| `onClose` | `() => void` | Escape、点击遮罩、点击关闭按钮都会调用 |
| `title` | `string` | 必填。既是 `<h2>` 文本，也是抽屉的 `aria-label` |
| `closeLabel` | `string` | 必填。关闭按钮的可访问名 |
| `side` | `'left' \| 'right'` | 停靠方向，默认 `right` |
| `width` | `number \| string` | 面板宽度，数字按 px 处理，默认 `320` |
| `description` | `ReactNode` | 标题下方的一句话说明 |
| `children` | `ReactNode` | 主体内容，超出高度时在面板内滚动 |
| `footer` | `ReactNode` | 底部操作行，右对齐 |
| `className` | `string` | 追加到面板本体 |

## 什么时候用

- 需要「不离开当前页面」的附属内容：文件树、会话列表、插件详情、检查器。
- 内容比对话框长、需要滚动，但又不想让用户切走。
- 右侧工具面板（`side="right"`，默认）与左侧导航栏（`side="left"`）。

## 什么时候不要用

- 短决策（确认、输入一个名字）：用 `Modal`，它居中、宽度受控、注意力更集中。
- 常驻导航：抽屉会遮住内容，常驻侧栏应该直接占位（不压遮罩、不锁交互）。
- 需要用户填一整套表单：抽屉宽度有限，长表单用独立页面。
- 一次开多个抽屉：会互相盖住遮罩，改成抽屉内换内容。
- 只是提示：用 `Toast`。

## 几何来源

官方没有抽屉组件，所以面板的每一段几何都从已核实的官方选择器借用：

| 数值 | 出处（文件名 + 选择器 / 实现） |
| --- | --- |
| 遮罩 `position: absolute`、`inset: 0`、`background: var(--dsw-alias-bg-mask-1)`、`backdrop-filter: var(--dsw-mask-blur)` | `Modal.module.css` `.mask` |
| 面板底色 `var(--dsw-alias-bg-layer-2)` | `Modal.module.css` `.dialog` |
| 面板阴影 `var(--dsw-elevation-prominent)` | `Modal.module.css` `.dialog`；`Menu.module.css` `.list` |
| `position: fixed`、`inset: 0`、`z-index: 1000` | `Modal.module.css` `.root` |
| `.content` 的 `display: flex` / `flex-direction: column` / `width: 100%` | `Modal.module.css` `.content` |
| `padding: 22px 14px 12px 24px`、`gap: 8px`、`align-items: center`、`justify-content: space-between` | `Modal.module.css` `.header` |
| `font-size: 16px`、`line-height: 24px`、`font-weight: 500`、`color: var(--dsw-alias-label-primary)`、`margin: 0` | `Modal.module.css` `.title` |
| `width: 28px`、`height: 28px`、`border-radius: 8px`、`border: none`、`background: transparent`、`color: var(--dsw-alias-label-secondary)`、`flex: none` | `Modal.module.css` `.close` |
| `background: var(--dsw-alias-interactive-bg-hover)` | `Modal.module.css` `.close:hover` |
| `padding: 0 24px`、`font-size: 14px`、`line-height: 22px`、`font-weight: 400`、`color: var(--dsw-alias-label-primary)` | `Modal.module.css` `.description` |
| `margin-top: 20px`、`padding: 0 24px`、`min-width: 0` | `Modal.module.css` `.body` |
| `justify-content: flex-end`、`gap: 8px`、`padding: 0 24px`、`align-items: center` | `Modal.module.css` `.footer` |
| `gap: 20px`（内容区与 footer 之间）、`padding: 0 0 24px`（面板底边留白） | `Modal.module.css` `.dialog` |
| 关闭图标 14px | 官方 `index.js` 的 `Modal`：`jsx(IconCloseOutline16, { size: 14 })` |
| `createPortal(..., document.body)`、`role="dialog"`、`aria-modal="true"`、`aria-label={title}`、`role="presentation"` 的根、`aria-hidden="true"` 的遮罩、点遮罩 `onClick={onClose}`、document 级 `Escape` | 官方 `index.js` 的 `Modal` |

**本仓库建议值（非官方数值）：**

- **面板宽度默认 `320px`**：官方没有抽屉。320 是 4 的倍数，也是中文界面下「一列设置项 + 控件」不被挤压的下限（官方对话框是 `min(380px, 100%)`，抽屉比它窄一档，才不会在 1024px 宽的窗口里占掉三分之一页面）。`width` 支持字符串，需要 `'40vw'` 这类比例宽度时直接传。
- **面板圆角为 0**：官方 `.dialog` 的 `border-radius: 24px` 是「居中浮层」的几何；抽屉满高贴边，圆角会在面板与视口边缘之间露出缝隙。官方 `Menu.module.css` `.list` 的 `border-radius: 20px` 同理（它是浮层菜单，不是贴边面板）。
- **`.panel { justify-content: flex-end / flex-start }` 由 `data-side` 切换**：官方没有抽屉，方向切换的写法是本仓库选择的（只用一个属性选择器，不需要两份规则）。
- **`.content { flex: 1; min-height: 0; overflow-y: auto }`**：官方 `.dialog` 高度自适应，不需要滚动容器；抽屉是满高的，内容过长必须能在面板内滚动，否则内容会被 `overflow: hidden` 直接裁掉。`min-height: 0` 是让 flex 子项真正能收缩的必要条件。
- **`.footer { flex: none }`**：保证底部操作行不被滚动的兄弟节点挤压。
- **焦点陷阱**：与 `Modal` 同款（打开时焦点移进面板、Tab 在面板内循环、关闭后把焦点还给触发元素），在本目录内独立实现，不跨目录引用。官方 Modal 没有做焦点陷阱，抽屉更是没有官方实现可参照。
- `.panel { outline: none }`、`.close { padding: 0 }`、`.panel` / `.close` 上的 `box-sizing: border-box`：同 `Modal` 的理由——面板要能被 `.focus()`（配 `tabIndex={-1}`）但不该画容器焦点环；官方 CSS 依赖宿主的全局 `border-box` reset，本仓库组件不假定宿主有 reset。
- `.close:focus-visible` 的 `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`：官方 `.close` 没有焦点样式，写法对齐官方 `Switch.module.css`。
- 不做滑入 / 滑出动画，也不做滚动锁定：官方 Modal 没有任何进出场动画，本仓库保持一致（要给抽屉加动画，请自行加并在 `prefers-reduced-motion` 下关掉）。

实现为本仓库原创（用 CSS 变量承载几何 + `data-side` 切方向），几何等价但不是官方 CSS 的复制。

## 可访问性要点

- **`title` 必须是纯字符串**、**`closeLabel` 必填**：面板用 `aria-label={title}` 命名，关闭按钮里只有一个图标。缺了这两样，屏幕阅读器读到的就是一个没有名字的对话框和一个空按钮。
- 遮罩点击关闭对触摸用户是必需的：触摸端没有 Escape 键，只留 Escape 等于把触摸用户关在抽屉里。
- 焦点陷阱（§ 本仓库建议值）：聚焦第一个可聚焦元素 ⇒ Tab / Shift+Tab 在面板内循环 ⇒ 关闭后焦点回到触发元素。抽屉没有陷阱时，Tab 会跑到底层页面上，键盘用户看不出现在在哪一层。
- 内容区可滚动但不进 Tab 序列：Tab 到面板内的元素时浏览器会自动把它滚入视野。如果抽屉里全是不可聚焦的长文本，请自己给内容包一层 `tabindex="0"` + `role="region"` + `aria-label`（官方 `markdown/MarkdownText.module.css` 的 `.tableScroll` 就是这么处理可滚动容器的）。注意这会给焦点陷阱多加一个 Tab 停留点。
- 抽屉比对话框更宽、更容易容纳长文，但它仍然是「临时层」：不要把只能在这里读到的关键信息放进去，用户按 Escape 就回到原页面了。
- `z-index: 1000` 与官方对话框同层：两者不要同时打开（同一个位置会出现两层遮罩，焦点陷阱也会互相抢 Tab）。
