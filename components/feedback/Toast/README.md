# Toast 瞬时提示

贴在窗口顶部居中、自己淡出的单行提示条。保存成功、复制成功、后台任务完成这类「不需要用户回应」的反馈用它。

## 是什么

一个传送到 `document.body` 的 `position: fixed` 提示条：可选前置图标 + 一段文案。
没有按钮、没有关闭箭头——它靠时间自己消失。零依赖，只用到 `react`、`react-dom`（仅 `createPortal`）和 CSS Modules。

组件把两件事拆开：

| 层 | 归谁管 | 具体表现 |
| --- | --- | --- |
| 呈现层 | `toast.module.css` | 几何、进场滑入 160ms、`--dsh-toast-hold` 之后 1000ms 淡出 |
| 生命周期 / 定时关闭 | 调用方 + 组件的一个定时器 | 组件在 `holdMs + 1000ms` 后调用 `onDone`，调用方在回调里卸载节点 |

两条时间线共用同一个 `holdMs`：CSS 读它当动画延迟（`--dsh-toast-hold`），组件拿它算卸载计时器。
所以改 `holdMs` 不会出现「动画没放完就被拆掉」。默认 `holdMs = 3000`。

## 什么时候用

- 动作已经完成，用户不需要做任何事：`已保存`、`已复制 3 项`、`已重新连接`。
- 需要「稍纵即逝」的确认感，又不想在页面里永久占一块位置。

## 什么时候不要用

- 需要用户读很久或需要操作（重试 / 查看详情）：用 `InlineNotice`，它是留在文档流里的。
- 页面内的表单校验、字段级错误：用 `InlineNotice` 贴着字段放。
- 阻塞式确认（删除前问一句）：用对话框（`Modal` / `RiskConfirmation`），Toast 不拦截点击也无法承载按钮。
- 同一时刻多个提示叠罗汉：Toast 固定在同一个位置，会互相盖住。用 `key` 重挂载来「后一条顶掉前一条」，或者改用队列式的行内提示。
- 页面首次加载的欢迎语：那是静态内容，不需要动画和计时。

## 几何来源

读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/Toast.module.css`：

| 数值 | 出处（选择器） |
| --- | --- |
| `position: fixed`、`top: 40px`、`left: 50%`、`z-index: 1100` | `.toast` |
| `pointer-events: none` | `.toast` |
| `display: flex`、`align-items: center`、`gap: 10px` | `.toast` |
| `width: max-content`、`max-width: min(640px, calc(100vw - 48px))` | `.toast` |
| `padding: 12px 16px`、`border-radius: 14px` | `.toast` |
| `font-size: 14px`、`line-height: 22px` | `.toast` |
| `background: var(--dsw-alias-button-contrast-fill)`、`color: var(--dsw-alias-label-primary-inverted)` | `.toast` |
| `box-shadow: var(--dsw-shadow-lv3)`、`transform: translateX(-50%)` | `.toast` |
| `animation: dsh-toast-in 160ms ease-out, dsh-toast-fade 1000ms ease var(--dsh-toast-hold, 3000ms) forwards` | `.toast` |
| `translate(-50%, -6px)` → `translate(-50%, 0)` 的滑入关键帧 | `@keyframes dsh-toast-in` |
| `opacity: 0` 的淡出关键帧 | `@keyframes dsh-toast-fade` |
| 减弱动态效果时只保留淡出、去掉滑入 | `@media (prefers-reduced-motion: reduce) .toast` |
| `display: grid`、`place-items: center`、`flex: none`、`color: var(--dsw-alias-state-warn-label)` | `.icon` |
| `min-width: 0` | `.text` |
| `holdMs` 默认 3000、淡出 1000ms、`holdMs + FADE_MS` 后卸载 | `lib/index.js` 的 `HOLD_MS` / `FADE_MS` / `Toast()` |
| 传送到 `document.body`、`role="alert"`、`--dsh-toast-hold` 内联变量 | `lib/index.js` 的 `Toast()` |
| 可选锚点按 `rect.left + rect.width / 2` 定位、监听 `resize` | `lib/index.js` 的 `Toast()` |

**本仓库建议值（非官方数值）：**

- `--dsh-toast-icon-size: 16px`：官方 `.icon` 只有布局属性，没有边长；图标尺寸随调用方传入的 svg 决定。16px 与本仓库 `Button`、`Input` 的图标容器一致，也等于官方 `IconWarningOutline16` 的默认尺寸。
- `box-sizing: border-box`：官方 `.toast` 未声明。盒子宽度是 `max-content` 且带左右内边距，声明 border-box 后 `max-width` 的封顶值才是「连内边距一起 640px」，与 `calc(100vw - 48px)` 的留边意图一致。
- `font-family: inherit`：官方 `.toast` 未声明字体族（靠祖先继承）。显式写 inherit 不改变结果，只是避免被 demo / 宿主页面的 `body` 规则意外改掉。

实现为本仓库原创：几何用一组 `--dsh-toast-*` 变量承载，关键帧名沿用官方语义但由本仓库自行组织，不是官方 CSS 的复制。

## 可访问性要点

- 根节点是 `role="alert"`：屏幕阅读器会打断当前朗读播报这条文案，这正是瞬时反馈想要的语义（官方同款）。
- `pointer-events: none` 是刻意的：提示条不接收点击，因此它绝不能承载唯一入口的操作。要操作就换成 `InlineNotice`。
- **不要用 `aria-hidden` 包住整条提示**：`role="alert"` 是它的语义来源，藏起来等于用户永远不知道操作成功了。
- 图标容器已经是 `aria-hidden="true"`，图标请提供纯装饰性 svg，语义写在文案里，避免读两遍。
- 文案保持一句短句。「已保存」优于「操作已成功完成，你的更改已经保存在本地」。
- `prefers-reduced-motion: reduce` 时滑入被去掉，只留淡出——移动会触发前庭不适，纯透明度变化不会。
- 定时关闭对认知障碍用户不友好：如果这条提示信息量大或重要，把 `holdMs` 调长，或者干脆改用不会消失的 `InlineNotice`。
- 重挂载而不是原地改文案：给 `<Toast>` 加 `key={showSeq}`，否则同一实例上改 `text` 不会重播动画和计时。
