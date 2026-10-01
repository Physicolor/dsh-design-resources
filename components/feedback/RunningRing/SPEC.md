# RunningRing · SPEC

- id: running-ring
- category: feedback
- source: `components/feedback/RunningRing/`（`index.tsx` / `running-ring.module.css`）
- official-counterpart: 产品里真实存在——左栏会话行首那一枚运行字形，出自客户端 CSS 模块 `_spinner_1i3xo_37`（与 `_dot_1i3xo_2` 静态状态点同模块）。官方 primitives 包里**没有**这个组件；包里给 `ongoing` 的是另一套像素追逐矩阵（`StateDot.module.css` `.matrix`）。
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

采集自运行中的产品：`docs/reference/running-row.json`（1570×905 视口，左栏会话行首）。

| 数值 | 出处 |
| --- | --- |
| `width/height: 14`（行内实渲）· `viewBox="0 0 24 24"` | `_spinner_1i3xo_37` 的 SVG 属性（实采 `<svg class="_spinner_1i3xo_37" data-state="ongoing" width="14" height="14" viewBox="0 0 24 24">`） |
| 两个 `circle`：`cx/cy 12`、`r 9.5`、`fill: none`、`stroke: currentColor`、`stroke-width: 2`、`stroke-linecap: round` | `_spinnerTrack_1i3xo_47` / `_spinnerArc_1i3xo_48` |
| 轨道 `opacity: .25` | `_spinnerTrack_1i3xo_47` |
| 弧 `stroke-dasharray: 12 150` | `_spinnerArc_1i3xo_48` |
| 旋转 `1.5s linear infinite`，`transform-origin: center` | `_spinnerMotion_1i3xo_42`（`animation: _dsh-state-dot-spin_1i3xo_1 1.5s linear infinite`） |
| 伸缩 `1.5s ease-in-out infinite` | `_spinnerArc_1i3xo_48`（`_dsh-state-dot-dash_1i3xo_1`） |
| 关键帧 `spin`：`to { transform: rotate(360deg) }` | `@keyframes _dsh-state-dot-spin_1i3xo_1` |
| 关键帧 `dash`：`0% 12 150 / 0` → `50% 24 150 / -6` → `to 12 150 / 0` | `@keyframes _dsh-state-dot-dash_1i3xo_1` |
| 颜色 `--dsw-alias-label-tertiary` | `_spinner_1i3xo_37 { color: … }`（实测 rgb(129,133,140)） |
| 减动效：动画停、弧停在 `18 150 / -3` | `@media (prefers-reduced-motion: reduce)` 分支 |
| 读屏文字「进行中」与环并列，本身视觉隐藏 | 采集到的 `hIlkoa_visuallyHidden`（`<span class="…">进行中</span>`） |

### 官方自身的不统一：库里一套、产品里一套

同一个「正在进行」在官方代码里有两套实现，这属于**官方没有统一**，不是我们抄错：

| 实现 | 出处 | 形态 |
| --- | --- | --- |
| 像素追逐矩阵 | `@deepseek-ai/dsh-client-ui-primitives/lib/StateDot.module.css` `.matrix` + `@keyframes dsh-state-dot-chase` | 10×10 viewBox 外圈 8 个 2×2 方块，1s 逐格衰减 |
| 转圈环（本组件） | 客户端 CSS 模块 `_spinner_1i3xo_37`，产品里实际渲染在左栏会话行首 | 24 viewBox、r 9.5、stroke 2、1.5s 转 + 1.5s 伸缩 |

**按 Apple HIG 判定**（[Progress indicators](https://developer.apple.com/cn/design/human-interface-guidelines/progress-indicators)，2023-09-12 版）：

- HIG 把「时长不可估」的等待归为 *indeterminate*，其形态就是 activity indicator（spinner）：「All platforms support a circular image that appears to spin」。
- 「Prefer an activity indicator (spinner) to communicate the status of a background operation or when space is constrained. Spinners are small and unobtrusive … good for communicating progress within a small area」——会话行首那 14px 正是「空间受限的小区域」，转圈环是对的形状。
- 「Keep progress indicators moving so people know something is continuing to happen. People tend to associate a stationary indicator with a stalled process or a frozen app」——所以产品里它是无限循环的；而 `prefers-reduced-motion` 下停住，属于**无障碍优先于这条建议**的正当例外，产品用「停在未转完的那一帧（18 150 / -3）」保住语义，本组件照抄这一处理。
- 「Avoid labeling a spinning progress indicator … a label is usually unnecessary」——产品没有可见标签，只给读屏一段「进行中」；本组件的 `label` 因此渲染成视觉隐藏文本，而不是可见文案。

**结论**：像素追逐是库里保留的一条路（装饰性更强、信息量并不更多），产品在真实界面里没有用它。插件作者要复现「会话行正在跑」这件事，跟产品走——用转圈环。这也是本仓库把它单列成一个组件、而不是塞进 `StateDot` 的原因。

### 本仓库建议值（非官方数值）

- 关键帧改名 `dsh-design-running-ring-spin` / `-dash`：官方关键帧名（`_dsh-state-dot-spin_1i3xo_1`）带构建哈希，同名定义在同一个页面里会互相覆盖；改名不影响形态。
- `.root { display: inline-flex; align-items: center }`：本仓库加的包装，让环与旁边的行内文字对齐；产品那边这层由座位容器（`hIlkoa_slot`）承担。
- `focusable="false"`：IE/旧 Edge 遗留属性，现代浏览器忽略；写上是为了让内联 SVG 在任何宿主里都不会被当成可聚焦元素。

## api

`RunningRingProps`，`forwardRef<HTMLSpanElement, RunningRingProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `number` | `14` | 渲染尺寸（px）。viewBox 固定 24，所以尺寸可缩放而线宽比例不变 |
| `label` | `ReactNode` | 无 | 给读屏的说明文字（如「进行中」），渲染成视觉隐藏元素；不传则不渲染 |
| `className` | `string` | 无 | 追加在最外层 `<span>` 的类名之后 |
| `ref` | `Ref<HTMLSpanElement>` | 无 | 透传到最外层 `<span>` |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认 | — | 1.5s 线性旋转 + 1.5s 往复伸缩 |
| 减少动效 | `prefers-reduced-motion: reduce` | 两条动画都停；弧停在 `18 150 / -3` |
| 无标签 | `label` 未传 | 只有环，对辅助技术不可见（`aria-hidden`） |
| 有标签 | `label` 已传 | 环仍 `aria-hidden`，说明文字由视觉隐藏的 `<span>` 提供 |

组件没有任何交互状态：它不是按钮，不接受点击，也没有 hover / focus 样式。

## tokens

- `--dsw-alias-label-tertiary` — 环的颜色（产品里那一枚的实测值 rgb(129,133,140) 就是它的浅色取值）

## a11y

- 环本身 `aria-hidden="true"`：它不携带可读文本，状态必须由旁边文字（或用 `label`）表达。
- **只给读屏、不给可见标签**是照 HIG 来的（转圈不需要可见标签），也照产品来（行首只有环，文字是 `hIlkoa_visuallyHidden`）。
- `prefers-reduced-motion` 下必须停：持续旋转对前庭敏感用户是负担；停下时保留「未完成的弧」这一静态信号，别停成一个整圆（那读起来像「完成」）。
- 它替代的是会话行首的状态字形：**别丢掉行本身的可读名称**——行文本仍然要写清是哪条会话。

## checks

1. 根元素是 `<span>`，内含且仅含一个 `<svg>`（`label` 存在时另加一个视觉隐藏的 `<span>`）。
2. `<svg>` 带 `aria-hidden="true"` 与 `viewBox="0 0 24 24"`，`width`/`height` 等于 `size`。
3. 两个 `<circle>` 的 `cx/cy` 为 12、`r` 为 9.5；轨道与弧的 `stroke-width` 为 2、`stroke-linecap` 为 round。
4. 轨道 `opacity: .25`；弧初始 `stroke-dasharray: 12 150`。
5. 旋转 `1.5s linear infinite`、伸缩 `1.5s ease-in-out infinite`（时长与缓动都不许改）。
6. 存在 `prefers-reduced-motion: reduce` 分支，且该分支里动画为 `none`、弧为 `18 150 / -3`。
7. 组件不 import 除 `react` 以外的任何运行时依赖（含 `@deepseek-ai/*`）。
8. `running-ring.module.css` 里不出现十六进制颜色字面量、`rgb(`、`hsl(`（颜色只走 `var(--dsw-*)`）。
9. 源码里不出现 `onClick` / `onKeyDown` / `tabIndex`（它不是交互元素）。

## demo

- `components/feedback/RunningRing/demo.html`

## 相关

- 人读版：`README.md`
- 同一族的静态状态：`components/data-display/StateDot/`（含官方库里的像素追逐实现）
- 动效档位：`spec/40-motion.md`
- 参照：Apple HIG · Progress indicators（转圈属于 *indeterminate*；空间受限时优先用 spinner）
