# SidebarRow 侧边栏行

侧边栏 / 列表里可悬停、可选中、可多选的一行，几何直接锚定官方 `Menu` 的行单元格。

## 是什么

一个 `<button type="button">`，内部固定三段：前置图标（16×16）/ 标题（可省略号截断）/ 尾部（计数、快捷键、对勾）。

| 属性 | 说明 |
| --- | --- |
| `icon` | 前置图标，被包进 16×16 的 `leading` 容器；图标请自带 `aria-hidden="true"` |
| `selected` | 是否选中，同时写进 `aria-pressed` |
| `selectionStyle` | `check`（默认，尾部对勾 + 透明底）/ `fill`（整行铺 `--dsw-alias-interactive-bg-hover`） |
| `checkbox` + `checked` | 多选行：渲染真实 `<input type="checkbox">`，点行任意位置都会切换 |
| `trailing` | 尾部节点（计数、快捷键提示）；`check` 选中时对勾会追加在它右边 |

| 尺寸 | 值 |
| --- | --- |
| 最小高度 | 40px |
| 内边距 | 8px 10px |
| 圆角 | 10px |
| 图标与文字间距 | 8px |
| 字号 / 行高 | 14px / 22px |

零依赖，只用到 `react` 和 CSS Modules。

## 什么时候用

- 侧边栏的会话 / 文件 / 页面列表项。
- 任何需要在列表项右侧挂状态（计数、未读点、快捷键）的场景。
- 需要「当前选中项」的列表：用 `selectionStyle="check"` 与官方 `Menu` 保持一致。

## 什么时候不要用

- 弹出菜单里的项：用官方 `Menu` 的 `.item`，它自带 portal、方向键导航与子菜单。
- 只是跳转的外部链接：用 `<a>`，不要用按钮假装链接（那会丢掉「在新标签打开」等浏览器能力）。
- 一行里要塞多行内容（标题 + 说明 + 标签）：用 `SettingsRow`，它的结构是给设置项准备的。
- 纯展示、不可点的行：不要用本组件——一个永远可点但什么都不做的按钮是键盘用户的陷阱。

## 几何来源

数值全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/Menu.module.css`：

| 数值 | 出处（选择器） |
| --- | --- |
| `min-height: 40px`、`padding: 8px 10px`、`border-radius: 10px`、`gap: 8px`、`font-size: 14px`、`line-height: 22px`、`color: var(--dsw-alias-label-primary)`、`text-align: left` | `.item`（原注释：figma `.Menu_cell`，min-h 40 / r10 / pad 10/8 / 14-22 / gap 8） |
| 悬停底 `var(--dsw-alias-interactive-bg-hover)` | `.item:hover:not(:disabled)` |
| `opacity: 0.4`、`cursor: not-allowed` | `.item:disabled` |
| 图标容器 `16×16`、`flex: none`、`color: var(--dsw-alias-label-tertiary)` | `.itemIcon` |
| `flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap` | `.itemLabel` |
| 尾部对勾 `flex: none`、`color: var(--dsw-alias-label-primary)` | `.check` |
| 选中态填充 `var(--dsw-alias-interactive-bg-hover)` | `.selectedFill`（原注释：Fill-mode selection: the row holds the hover fill instead of a check） |
| 选中态保持透明底 | `.selected`（原注释：Selected cell keeps the plain fill (marker is the trailing check)） |
| 按压态 / 悬停加深 `var(--dsw-alias-interactive-bg-active)` | `Button.module.css` `.ghost:active`；该 token 亦在 `website/css/dsh-tokens.css` 第 126 行查到 |

**为什么 `fill` 用 `var(--dsw-alias-interactive-bg-hover)` 而不是 `var(--dsw-alias-bg-module-platform)`：** 官方 `Menu.module.css` 已经把 `.selectedFill` 定义为 hover 底色（见上表），这是仓库里唯一一处官方认可的「填充式选中」，直接用它的值风险最低。`--dsw-alias-bg-module-platform` 是模块级表面色（官方 `Tag.module.css` 的 `neutral` 音调用它做标签底），拿来做行底会把「选中」和「标签底噪」混成同一个灰。若你的侧边栏整体已经是 `--dsw-specific-sidebar-fill`，想用更接近 `--dsw-specific-sidebar-nav-item-active`（官方 sidebar 家族，`website/css/dsh-tokens.css` 第 194 行）的值，请自行覆盖 `.selectedFill` 的 `background` —— 本仓库不使用它，因为该 token 属于 `--dsw-specific-*` 家族而非 `--dsw-alias-*`，不在组件约定可用的语义 token 表内。

**本仓库建议值（非官方数值）：**

- `border-radius: 10px` 保留原值（官方 `.item` 就是 10px，不是 4 的倍数，**不**做整数化）。
- `checkbox` 的 `16×16` + `margin: 0` + `accent-color: var(--dsw-alias-button-primary-fill)`：官方 `Menu` 没有复选框行。尺寸对齐官方 `RiskConfirmation.module.css` 的 `.acknowledgement input`（`width: 16px; height: 16px`，`accent-color: var(--dsw-alias-button-primary-fill)`），两者都是「行内的原生复选框」。
- `:focus-visible` 的 `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: -2px`：官方 `Menu.module.css` 没有行内焦点样式（菜单靠 `aria-activedescendant` 或整体焦点）。侧边栏行是真按钮，必须有可见焦点环；用负偏移是为了让环落在行内，不会被侧栏的 `overflow: hidden` 裁掉。写法与官方 `Switch.module.css` / `ConnectionIndicator.module.css` 的 `:focus-visible` 同款，只改了 offset。
- `.trailing` 的 `12px / 18px`：官方 `Menu.module.css` 没有尾部文本槽位。取官方 `Button.module.css` `.sm` 的 12/18（该文件里最小的文字档），让计数/快捷键这类辅助信息比标题轻一档。
- `.row` 上的 `min-width: 0`：官方把它写在 `.itemLabel` 上；本组件额外写在按钮上，因为真实侧边栏用 `width: 100%` 的按钮承载行，按钮自身也需要可压缩。

实现为本仓库原创（CSS 变量承载几何 + 单类切换选中态），几何等价但不是官方 CSS 的复制。

## 可访问性要点

- 行是 `<button>`，天然可 Tab 到、可用 Enter/Space 激活，不要用 `<div onClick>` 替代。
- `selected` 会写成 `aria-pressed={true|false}`；**每组**可选中行应放在一个有 `aria-label` 的容器里（如 `<nav aria-label="对话列表">`），否则用户不知道这排按钮是一组互斥选择。
- `checkbox` 形态下：`aria-pressed` 不再渲染（避免和复选框的 `checked` 语义打架），`<input>` 自身 `readOnly` 且 `tabIndex={-1}`——焦点留在按钮上，复选框只是状态显示，切换请监听按钮的 `onClick`（`<input>` 是 `readOnly`，它的 `onChange` 不会因用户操作而触发）。屏幕阅读器读到的是按钮名字与复选框的 `checked` 状态。行内没有可读文本时**必须**传 `checkboxLabel`。
- 图标必须 `aria-hidden="true"`：本组件的 `leading` 容器整体标了 `aria-hidden`，图标内部再标一次也无害。名字由行的文字提供。
- 尾部对勾是纯装饰（`aria-hidden`），选中语义已经由 `aria-pressed` 表达，不要指望屏幕阅读器读那个勾。
- 禁用时用 `disabled` 属性而不是 `opacity` 类，这样焦点与点击都被真正拦住。
- 标题过长会被省略号截断（`text-overflow: ellipsis`），截断只影响视觉，屏幕阅读器仍能读到完整文本；如果你需要悬停显示全文，请自行加 `title` 属性。
