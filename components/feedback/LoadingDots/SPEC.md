# LoadingDots · SPEC

- id: loading-dots
- category: feedback
- source: `components/feedback/LoadingDots/`（`index.tsx` / `loading-dots.module.css`）
- official-counterpart: 官方没有这个组件；时序派生自 `@deepseek-ai/dsh-client-ui-primitives/lib/ConnectionIndicator.module.css` 的 `.dots` / `.secondDot` / `.thirdDot`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

写法为「数值 ← 文件名 选择器」：左列是箭头左侧，右列是「文件名 + 选择器」。
官方来源为 `@deepseek-ai/dsh-client-ui-primitives/lib/`。

| 数值 | 出处 |
| --- | --- |
| 「三点依次出现」这件事本身 / 动画周期 `1.5s` / `infinite` | `ConnectionIndicator.module.css` → `.secondDot`、`.thirdDot`（`animation: reveal-second-dot 1.5s step-end infinite` / `reveal-third-dot 1.5s step-end infinite`） |
| 第二个点在 `33.33%`、第三个点在 `66.66%` 处出现 | `ConnectionIndicator.module.css` → `@keyframes reveal-second-dot`（`0%, 33.32%` 隐藏 → `33.33%, 100%` 显示）/ `@keyframes reveal-third-dot`（`0%, 66.65%` → `66.66%, 100%`） |
| 隐藏的那一半用 `opacity` 表达（`opacity: 0` / `opacity: 1`） | `ConnectionIndicator.module.css` → 上述两条关键帧 |
| 减弱动态效果时关掉第二、三个点的动画 | `ConnectionIndicator.module.css` → `@media (prefers-reduced-motion: reduce) .secondDot, .thirdDot` |
| 官方 `.dots` 为 `display: inline-block` + 固定宽度 `1.5em` + `text-align: left` | `ConnectionIndicator.module.css` → `.dots`（本组件不采用，理由见「本仓库建议值」） |
| `--dsh-dots-delay: 500ms` / `1000ms` | 由官方的 `33.33%` / `66.66%` × `1.5s` 换算得到 |
| `--dsh-dots-cycle: 1500ms` | 官方 `.secondDot` / `.thirdDot` 的 `1.5s` |

### 本仓库建议值（非官方数值）

- `dotSize` 默认 `4px`：官方那三个点是「.」字符，尺寸由字体决定、不是可控数值，所以官方没有可引用的点尺寸。4px 是本仓库规则（自造尺寸取 4 的倍数）下的最小值，也正好等于默认 `gap`，三个点排起来是 4+4+4+4+4 = 20px 宽。
- `gap` 默认 `4px`：与 `dotSize` 相等，视觉上点与点是「分开的但不能被读成省略号」。4 也是本仓库通用间距基数。
- **用固定尺寸的圆点 + `inline-flex`，而不是官方的文字「...」**：官方那套依赖字体里句点的字宽，不同平台会错位；`inline-flex` + `gap` 让三个点在所有字体下都等距，也不需要给容器写死 `1.5em` 宽度。
- **出现做成 250ms 微型淡入 + 1px 上移，而不是官方的 `step-end` 硬切**：官方硬切是为了让断线提示的文案宽度绝对稳定；三点加载没有这个约束，硬切在 1.5s 的循环里会显得闪。出现时刻完全保留官方节奏。
- 三个点在周期末尾（约 `96%` → `100%`）一起淡出：留一个很短的「清空」窗口，让「重新开始」看得见。这是纯视觉节奏，不表达任何状态。
- 容器 `position: relative`：给视觉隐藏的说明文本一个定位父级，否则它会相对最近的已定位祖先（在 demo 里就是 `document`）定位。
- **减弱动态效果时三个点静态全亮**：官方只关掉第二、三个点的动画——那会让这两个点永远停在 `opacity: 0`，加载中这个事实就消失了。本仓库选择全部保持可见（`animation: none; opacity: 1`），宁可没有动画也不丢信息。
- 视觉隐藏文本用 `clip-path: inset(50%)` 的现代写法（`position: absolute` + `1×1px` + `overflow: hidden` + `white-space: nowrap`），不依赖 `clip: rect()` 这种旧属性。

### 实现说明

- 本仓库实现为原创：几何用 `--dsh-dots-*` 变量承载，关键帧 `dsh-dots-appear` 自行组织，没有抄官方 CSS 源码。
- 组件只暴露三个自由度给 CSS：点直径、间距、单个动画周期；后两者中 `dotSize` / `gap` 由 props 写入内联变量。

## api

`LoadingDotsProps extends HTMLAttributes<HTMLSpanElement>`，`forwardRef<HTMLSpanElement, LoadingDotsProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dotSize` | `number` | `4` | 每个点的直径（px）；按本仓库规则取 4 的倍数 |
| `gap` | `number` | `4` | 点间距（px） |
| `label` | `string` | `'加载中'` | 无障碍名称；渲染成视觉隐藏文本，屏幕阅读器读它 |
| `className` | `string` | 无 | 与内部类名拼接 |
| `style` | `CSSProperties` | 无 | 与组件写入的内联变量合并，可用于覆盖 `--dsh-dots-*` |
| 其余 | `HTMLAttributes<HTMLSpanElement>` | — | `role` / `aria-busy` / `aria-label` 等原样透传到根 `<span>` |
| `ref` | `Ref<HTMLSpanElement>` | 无 | 透传到根 `<span>` |

`--dsh-dots-cycle` 固定为 `1500ms`，不由 props 暴露（除经 `style` 覆盖）。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认（动画中） | 挂载 | 三个点按 `--dsh-dots-delay` 为 `0ms` / `500ms` / `1000ms` 依次出现；周期 `1500ms`、`linear`、`infinite` |
| 单点出现 | 关键帧 `dsh-dots-appear` 的 `0%` → `16.666%` | `opacity 0 → 1`，`transform: translateY(1px) → translateY(0)` |
| 周期末清空 | 关键帧 `96%` → `100%` | 三个点一起 `opacity → 0`、`translateY(1px)` |
| 自定义直径 | `dotSize` | 内联 `--dsh-dots-size` 覆盖 `.dots` 的兜底值 |
| 自定义间距 | `gap` | 内联 `--dsh-dots-gap` 覆盖 `.dots` 的兜底值 |
| 无脚本兜底值 | 未内联时 | `.dots` 自带 `--dsh-dots-size: 4px` / `--dsh-dots-gap: 4px` / `--dsh-dots-cycle: 1500ms` |
| 视觉层 | 始终 | `.visual` 带 `aria-hidden="true"`，三个点在内 |
| 说明文本 | 始终 | `.srOnly` 视觉隐藏，可被屏幕阅读器读取 |
| 减弱动态效果 | `prefers-reduced-motion: reduce` | `animation: none` + `opacity: 1` + `transform: none`，三点静态全亮 |

## tokens

DSH 语义 token：无。本组件不引用任何 `--dsw-*` 变量，颜色通过 `color: inherit` 继承父级 `currentColor`。

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-dots-size`（默认 `4px`，可经 `dotSize` 覆盖）
- `--dsh-dots-gap`（默认 `4px`，可经 `gap` 覆盖）
- `--dsh-dots-cycle`（`1500ms`）
- `--dsh-dots-delay`（`.dotSecond` 为 `500ms`，`.dotThird` 为 `1000ms`，`.dot` 默认 `0ms`）

## a11y

- 三个点包在带 `aria-hidden="true"` 的 `.visual` 里，不读给屏幕阅读器；另有一段 `.srOnly` 文本作为可读名字。
- 需要播报「开始加载 / 加载完成」时由调用方把 `role="status"` 透传到根节点：`status` 对应礼貌播报，不打断当前朗读。
- 不使用 `role="alert"`：加载开始不是需要立刻打断的紧急事件。
- 动画不能是唯一线索：如果三个点是页面上唯一的「正在忙」信号，调用方应同时给对应区域加 `aria-busy="true"`，或让按钮文字变成「生成中」。
- 替代整块内容时，被替换的区域也要带 `aria-busy`，否则屏幕阅读器会以为该区域本来就是空的。
- 颜色继承 `currentColor`：在次级文字色里会自动变浅，需确认在两种主题下的对比度都够（`AC-MF-05`）。
- 减弱动态效果下动画关闭、三点常亮，信息不丢。
- 命中区结论：本组件不含可交互元素，`AC-MF-01` 的命中区要求不作用于它。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `.visual` 带 `aria-hidden="true"`。
2. 根节点内存在带文本的 `.srOnly` 节点，且文本非空（`AC-MF-14`；清单 `A49`）。
3. 根节点默认不带 `role="alert"`（源码中不出现）。
4. 无限循环动画仅存在于本组件的加载指示器上（`MO-MF-07`；清单 `A32`）。
5. 存在 `@media (prefers-reduced-motion: reduce)` 分支，且该分支下 `.dot` 的 `opacity` 为 `1`、`transform` 为 `none`（`MO-MF-09`；清单 `A34`）。
6. 视觉隐藏样式使用 `clip-path: inset(50%)`，不使用已废弃的 `clip: rect()`。
7. `.dots` 为 `position: relative`（给 `.srOnly` 提供定位父级）。
8. 关键帧只动 `opacity` 与 `transform`，未对 `width` / `height` / `top` / `left` / `margin` / `padding` 做动画（`MO-MF-08`；清单 `A33`）。
9. 动画周期为 `1500ms`，与官方 `1.5s` 一致；`--dsh-dots-delay` 为 `0ms` / `500ms` / `1000ms`，与官方 `0%` / `33.33%` / `66.66%` 换算一致。
10. 单次出现的过渡时长 `250ms` 与 `MO-MF-01` 的五档（100 / 150 / 200 / 300 / 350）不一致，属本仓库建议值（清单 `A30`，需人工确认）。
11. 动画曲线为 `linear`，与 `MO-MF-05`「线性曲线只允许用于持续进度」一致。
12. 源码中无硬编码色值，点色来自 `background: currentColor`（清单 `A23`）。
13. `dotSize` / `gap` 写入内联变量，`.dots` 中保留同值兜底（SSR 或样式未加载时仍可渲染）。
14. 调用方传入 `role="status"` 时，`label` 同时被提供（人审，见 `README.md`「怎么用得好」）。

## demo

- `components/feedback/LoadingDots/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A23`、`A30`、`A32`、`A33`、`A34`、`A49`）
