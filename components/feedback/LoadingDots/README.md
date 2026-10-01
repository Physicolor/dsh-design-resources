# LoadingDots 三点加载

等一个还没回来的东西时用的三点指示器：点依次亮起，形成连续的「还在跑」的节奏。

## 是什么

`inline-flex` 的一行三个圆点，颜色继承父级 `color`，尺寸和间距由 props 控制。
三个点包在 `aria-hidden="true"` 的视觉层里，只把一段视觉隐藏的文本交给屏幕阅读器朗读。
零依赖，只用到 `react` 和 CSS Modules。

| Prop | 默认 | 说明 |
| --- | --- | --- |
| `dotSize` | `4`（px） | 每个点的直径，按本仓库规则取 4 的倍数 |
| `gap` | `4`（px） | 点间距 |
| `label` | `加载中` | 视觉隐藏文本，屏幕阅读器读它 |
| 其余属性 | — | 展开到根 `<span>`，例如 `role="status"`、`className`、`style` |

## 什么时候用

- 一次请求 / 一次生成正在进行，但**位置已知**：紧跟在「正在生成回复」这类文案后面。
- 按钮内部短时等待（配 `aria-busy` 或改用按钮自己的 loading 态）。
- 工具条、状态行这种一行高的紧凑位置。

## 什么时候不要用

- 页面首次加载、大块区域还空着：用骨架屏（`--dsw-alias-bg-skeleton` 就是给它的），三点太小、不足以占位。
- 耗时可能超过几秒且进度可估：用进度条，三点不会告诉用户「还要多久」。
- 需要用户等待时**不能做别的**：这是阻塞式加载，应当给对话框或遮罩，而不是角落里转三个点。
- 只是装饰性的「活跃」标记：用 `StateDot`，它表达的是状态而不是加载。

## 几何来源

**官方没有 LoadingDots 组件**，但 `ConnectionIndicator.module.css` 里有一套现成的三点时序，
下表「出处」明确区分了哪些是官方事实、哪些是本仓库建议值。

| 数值 | 出处 |
| --- | --- |
| 「三点依次出现」这件事本身、动画周期 `1.5s`、`infinite` | 官方 `ConnectionIndicator.module.css` 的 `.secondDot` / `.thirdDot`（`animation: reveal-second-dot 1.5s step-end infinite`） |
| 第二个点 `33.33%` 出现、第三个点 `66.66%` 出现（本组件映射成 `--dsh-dots-delay: 500ms` / `1000ms`） | 官方 `@keyframes reveal-second-dot`（`0%, 33.32%` 隐藏 → `33.33%, 100%` 显示）与 `@keyframes reveal-third-dot`（`0%, 66.65%` → `66.66%, 100%`） |
| `prefers-reduced-motion: reduce` 时关掉动画 | 官方 `@media (prefers-reduced-motion: reduce) .secondDot, .thirdDot { animation: none }` |
| 隐藏点的那一半用 `opacity` 表达（而不是 `visibility` / `display`） | 官方同上：`opacity: 0` / `opacity: 1` |
| 官方 `.dots` 是 `display: inline-block` + 固定宽度 + `text-align: left` | 官方 `.dots`（本组件不用固定宽度，理由见下） |

**本仓库建议值（非官方数值）：**

- `dotSize` 默认 `4px`：官方那三个点是「.」字符，尺寸由字体决定、不是可控数值，所以官方没有可引用的点尺寸。4px 是本仓库规则（自造尺寸取 4 的倍数）下的最小值，也正好等于默认 `gap`，三个点排起来是 4+4+4+4+4 = 20px 宽。
- `gap` 默认 `4px`：与 `dotSize` 相等，视觉上点与点是「分开的但不能被读成省略号」。4 也是本仓库通用间距基数。
- **用固定尺寸的圆点 + `inline-flex`，而不是官方的文字「...」**：官方那套依赖字体里句点的字宽，不同平台会错位；`inline-flex` + `gap` 让三个点在所有字体下都等距，也不需要给容器写死 `1.5em` 宽度。
- **出现做成 250ms 微型淡入 + 1px 上移，而不是官方的 `step-end` 硬切**：官方硬切是为了让断线提示的文案宽度绝对稳定；三点加载没有这个约束，硬切在 1.5s 的循环里会显得闪。出现时刻完全保留官方节奏。
- 三个点在周期末尾（约 `96%` → `100%`）一起淡出：留一个很短的「清空」窗口，让「重新开始」看得见。这是纯视觉节奏，不表达任何状态。
- 容器 `position: relative`：给视觉隐藏的说明文本一个定位父级，否则它会相对最近的已定位祖先（在 demo 里就是 `document`）定位。
- **减弱动态效果时三个点静态全亮**：官方只关掉第二、三个点的动画——那会让这两个点永远停在 `opacity: 0`，加载中这个事实就消失了。本仓库选择全部保持可见（`animation: none; opacity: 1`），宁可没有动画也不丢信息。
- 视觉隐藏文本用 `clip-path: inset(50%)` 的现代写法（`position: absolute` + 1×1px + `overflow: hidden` + `white-space: nowrap`），不依赖 `clip: rect()` 这种旧属性。

实现为本仓库原创：几何用 `--dsh-dots-*` 变量承载，关键帧 `dsh-dots-appear` 自行组织，没有抄官方 CSS 源码。

## 可访问性要点

- **不要把三个点读给屏幕阅读器**：三个点包在 `aria-hidden="true"` 的视觉层里，另有一段 `sr-only` 文本，读出来是「加载中」而不是「点点点」。
- 需要「开始加载 / 加载完成」这件事被播报时，把 `role="status"` 传到根节点：`<LoadingDots role="status" label="正在生成回复" />`。`status` 是 `aria-live="polite"`，不会打断用户当前的朗读。
- 不要用 `role="alert"`：加载开始不是需要立刻打断的紧急事件。
- **动画不能是唯一线索**：如果三个点是页面上唯一的「正在忙」信号，请同时给对应区域加 `aria-busy="true"`，或让按钮文字变成「生成中」。
- **它必须能停下来**：三点加载只有在自己消失时才有意义。如果加载可能失败，请在同一个位置给出失败态（`InlineNotice`）和重试入口，不要让它永远转下去——持续动画对注意力障碍用户负担很重。
- `prefers-reduced-motion: reduce` 下动画被关掉、三点常亮（见上），信息不丢、动作不抖。
- 颜色继承 `currentColor`：在次级文字色里会自动变浅，请确认在两种主题下的对比度都够；需要强制颜色时用 `style={{ color: 'var(--dsw-alias-…)' }}` 或 `className`。
- 当它替代了一整块内容（例如列表正在加载）时，记得给被替换的区域加 `aria-busy`，否则屏幕阅读器会以为列表就是空的。
