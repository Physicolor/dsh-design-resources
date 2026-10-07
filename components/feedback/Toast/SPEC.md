# Toast · SPEC

- id: toast
- category: feedback
- source: `components/feedback/Toast/`（`index.tsx` / `toast.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Toast.module.css` 与同目录 `lib/index.js` 的 `Toast()`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

写法为「数值 ← 文件名 选择器」：左列是箭头左侧，右列是「文件名 + 选择器」。
官方来源为 `@deepseek-ai/dsh-client-ui-primitives/lib/`。

| 数值 | 出处 |
| --- | --- |
| `position: fixed` / `top: 40px` / `left: 50%` / `z-index: 1100` / `pointer-events: none` | `Toast.module.css` → `.toast` |
| `display: flex` / `align-items: center` / `gap: 10px` | `Toast.module.css` → `.toast` |
| `width: max-content` / `max-width: min(640px, calc(100vw - 48px))` | `Toast.module.css` → `.toast` |
| `padding: 12px 16px` / `border-radius: 14px` | `Toast.module.css` → `.toast` |
| `font-size: 14px` / `line-height: 22px` | `Toast.module.css` → `.toast` |
| `background: var(--dsw-alias-button-contrast-fill)` / `color: var(--dsw-alias-label-primary-inverted)` | `Toast.module.css` → `.toast` |
| `box-shadow: var(--dsw-shadow-lv3)` / `transform: translateX(-50%)` | `Toast.module.css` → `.toast` |
| `animation: dsh-toast-in 160ms ease-out, dsh-toast-fade 1000ms ease var(--dsh-toast-hold, 3000ms) forwards` | `Toast.module.css` → `.toast` |
| 滑入关键帧 `translate(-50%, -6px)` → `translate(-50%, 0)`，`opacity 0` → `1` | `Toast.module.css` → `@keyframes dsh-toast-in` |
| 淡出关键帧 `opacity: 0` | `Toast.module.css` → `@keyframes dsh-toast-fade` |
| 减弱动态效果时去掉滑入、只保留延迟淡出 | `Toast.module.css` → `@media (prefers-reduced-motion: reduce) .toast` |
| `display: grid` / `place-items: center` / `flex: none` / `color: var(--dsw-alias-state-warn-label)` | `Toast.module.css` → `.icon` |
| `min-width: 0` | `Toast.module.css` → `.text` |
| `HOLD_MS = 3000` / `FADE_MS = 1000` / 卸载计时器为 `holdMs + FADE_MS` | `index.js` → `Toast()` 及同文件的 `HOLD_MS` / `FADE_MS` 常量 |
| `createPortal(..., document.body)` / `role="alert"` / 内联自定义属性 `--dsh-toast-hold` | `index.js` → `Toast()` |
| 可选锚点按 `rect.left + rect.width / 2` 定位，并监听窗口 `resize` 重新测量 | `index.js` → `Toast()` |

### 本仓库建议值（非官方数值）

- `--dsh-toast-icon-size: 16px`：官方 `.icon` 只有布局属性，没有边长；图标尺寸随调用方传入的 svg 决定。16px 与本仓库 `Button`、`Input` 的图标容器一致，也等于官方 `IconWarningOutline16` 的默认尺寸。
- `box-sizing: border-box`：官方 `.toast` 未声明。盒子宽度是 `max-content` 且带左右内边距，声明 border-box 后 `max-width` 的封顶值才是「连内边距一起 640px」，与 `calc(100vw - 48px)` 的留边意图一致。
- `font-family: inherit`：官方 `.toast` 未声明字体族（靠祖先继承）。显式写 inherit 不改变结果，只是避免被 demo / 宿主页面的 `body` 规则意外改掉。

### 实现说明

- 本仓库实现为原创：几何由 `.toast` 上的一组 `--dsh-toast-*` 组件级变量承载，关键帧名沿用官方语义但由本仓库自行组织。
- 官方 `Toast.module.css` 的 `.toast` 只声明 `font-size` / `line-height`，没有声明 `font-family`；本仓库补 `inherit`（见上）。

## api

`ToastProps`，函数组件 `Toast()`，未使用 `forwardRef`（没有可暴露的 DOM 句柄）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `text` | `ReactNode` | 无（必填） | 提示文案；由调用方给出已本地化的字符串或节点 |
| `icon` | `ReactNode` | 无 | 前置图标节点，放进 16×16 的图标容器，容器取警告色；图标自身需 `aria-hidden` |
| `anchor` | `HTMLElement \| null` | 无 | 水平中心跟随的锚点元素；缺省时居中于视口 |
| `holdMs` | `number` | `TOAST_HOLD_MS`（`3000`） | 全不透明停留时长（毫秒） |
| `onDone` | `() => void` | 无（必填） | 淡出动画结束且停留计时走完时调用一次；调用方在此卸载节点 |
| `className` | `string` | 无 | 追加在根节点类名之后 |

导出的常量：`TOAST_HOLD_MS`（`3000`）、`TOAST_FADE_MS`（`1000`）。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 进场 | 挂载 | `dsh-toast-in` 160ms ease-out：`opacity 0 → 1`，`translate(-50%, -6px) → translate(-50%, 0)` |
| 停留 | 进场结束至 `holdMs` | 全不透明、静止；`pointer-events: none` |
| 淡出 | 延迟 `holdMs` 后 | `dsh-toast-fade` 1000ms ease forwards → `opacity: 0` |
| 结束回调 | 挂载后 `holdMs + 1000ms` | 调用 `onDone()`，由调用方移除节点 |
| 锚点定位 | 传入 `anchor` | 内联 `left` 设为锚点水平中心；监听窗口 `resize` 重测；卸载时移除监听 |
| 减弱动态效果 | `prefers-reduced-motion: reduce` | 去掉滑入位移，只保留延迟淡出 |
| 指针交互 | 任意时刻 | 无：根节点 `pointer-events: none`，不接收点击 |
| 无 `icon` | `icon === undefined` | 图标容器不渲染 |
| 非浏览器环境 | `typeof document === 'undefined'` | 返回 `null`（SSR 守卫） |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-button-contrast-fill` — `.toast` 底色
- `--dsw-alias-label-primary-inverted` — `.toast` 文字色
- `--dsw-alias-state-warn-label` — `.icon` 图标色
- `--dsw-shadow-lv3` — `.toast` 阴影

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-toast-offset-top`（`40px`）
- `--dsh-toast-z`（`1100`）
- `--dsh-toast-gap`（`10px`）
- `--dsh-toast-pad-y`（`12px`）/ `--dsh-toast-pad-x`（`16px`）
- `--dsh-toast-radius`（`14px`）
- `--dsh-toast-max-w`（`640px`）/ `--dsh-toast-inset`（`48px`）
- `--dsh-toast-font-size`（`14px`）/ `--dsh-toast-line-height`（`22px`）
- `--dsh-toast-icon-size`（`16px`，本仓库建议值）
- `--dsh-toast-hold`：由组件内联写入，值为 `holdMs + 'ms'`；同时驱动淡出动画延迟与卸载计时器（官方同名用法）

## a11y

- 根节点是 `role="alert"`：屏幕阅读器会打断当前朗读播报这条文案（官方同款）。
- 根节点不得被 `aria-hidden` 包裹：`role="alert"` 是它唯一的语义来源。
- 图标容器带 `aria-hidden="true"`；图标应为纯装饰性 svg，语义写在文案里。
- `pointer-events: none` 是刻意的：提示条不接收点击，因此不能承载唯一入口的操作。
- `prefers-reduced-motion: reduce` 下去掉滑入位移，只保留纯透明度变化。
- 定时关闭对认知障碍用户不友好：信息量大或重要时应调长 `holdMs`，或改用 `InlineNotice`。
- 重挂载而非原地改文案：同一实例上改 `text` 不会重播动画与计时，需要调用方给 `key`。
- 命中区结论：不适用。组件整体 `pointer-events: none`，不是可交互元素，`AC-MF-01` 的命中区要求不作用于它。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 根节点存在 `role="alert"`。
2. 根节点不带 `aria-hidden`（`AC-MF-14` 的反向检查）。
3. 传入 `icon` 时，图标容器带 `aria-hidden="true"`。
4. 源码中根节点 `pointer-events` 解析为 `none`，且根节点未绑定 `onClick` 等指针事件处理器。
5. 存在 `@media (prefers-reduced-motion: reduce)` 分支，且该分支内的动画不含 `transform` 位移（`MO-RC-09`；清单 `A34`）。
6. 卸载计时器表达式为 `holdMs + TOAST_FADE_MS`，且 `TOAST_FADE_MS` 与淡出关键帧的 `1000ms` 一致。
7. 内联自定义属性 `--dsh-toast-hold` 的取值由 `holdMs` 派生（同一值同时驱动动画延迟与计时器）。
8. 传入 `anchor` 时注册 `window` 的 `resize` 监听，并在清理函数中移除。
9. 根节点通过 `createPortal` 挂载到 `document.body`。
10. 根节点宽度为 `max-content` 且带 `max-width`，未使用固定宽度夹死文本容器（`AC-RC-17`；清单 `B13`）。
11. 时长取值：滑入 `160ms`、淡出 `1000ms`，均取自官方 CSS，**不在** `MO-RC-01` 允许的五档（100 / 150 / 200 / 300 / 350）之内，也不满足「不超过 350ms」。本仓库以官方锚点优先，此项需人工确认（对照清单 `A30`）。
12. 过渡曲线为 `ease-out` / `ease`，取自官方，不等于 `MO-RC-04` 的标准曲线（`MO-RC-06` 对非官方默认曲线的禁令）。以官方锚点优先，此项需人工确认（对照清单 `A31`）。
13. 文案为单句短文本（人审，见 `README.md`「怎么用得好」）。
14. 未在组件内部维护队列：同一时刻多条提示的覆盖行为由调用方（`key` 重挂载）决定（人审，见 `README.md`「什么时候不要用它」）。

## demo

- `components/feedback/Toast/demo.html`

## 真实场景（docs/reference 截图核对）

**截图未覆盖**：7 张截图顶部中央都没有横幅。Toast 由交互触发（写入失败一类），而采集脚本全程只读、不改设置、不发消息，所以拍不到。

处理规则：demo 用 `.toast-static` 关掉 `position: fixed` 与两段动画（**几何数值一个不动**）做静态复现，文案一律「示例提示文本」，并注明「此场景未在截图中出现，仅按几何复现」。

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A30`、`A34`、`B13`）
