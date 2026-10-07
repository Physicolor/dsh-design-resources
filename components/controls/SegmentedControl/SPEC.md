# SegmentedControl · SPEC

- id: segmentedcontrol
- category: controls
- source: `components/controls/SegmentedControl/`（`index.tsx` / `segmentedcontrol.module.css`）
- official-counterpart: 官方包在产品 `app.asar` 中包含 `SegmentedControl.module.css` 和 `SegmentedControl` 导出；这证明源码包提供该 primitive，不证明当前宿主界面使用本仓库这套外观。混合截图中的 `duc-seg` 234 × 28 / `duc-seg-thumb` 42 × 24 / `duc-seg-btn` 44 × 24 属于插件内容。
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

官方 primitives 导出 SegmentedControl；下列数值读自官方 CSS，本仓库的实现只负责把它们组合起来。写法为「数值 ← 文件名 选择器」。组件包的导出事实不等于任一截图中的通用分段 UI 都是宿主界面。

### screenshot provenance

`docs/reference/05-settings-components.png` 是混合插件截图；其中的「组件」页包含 Command Code 与 dsh-widgets 内容，不能作为 DSH 宿主原生分段控件的证据。该图对应的 HTML 示例已暂缓。宿主会话头部「对话／轨迹／上下文」另见 `guides/21-pattern-sidebar-panel.md`；它是会话视图页签，不是本组件的通用设置示例。

| 数值 ← 文件名 选择器 |
| --- |
| 容器 `padding: 4px` / 段间 `gap: 0` ← `Menu.module.css` `.list` |
| 容器 `border-radius: 12px` ← `Pill.module.css` `.pill` |
| 容器底色 `var(--dsw-alias-bg-module-platform)` ← `Tag.module.css` `.tag[data-tone='neutral']` 的 `background` |
| 段高 `36px`（`md`）← `Button.module.css` `.md` |
| 段高 `28px` / `font-size: 12px` / `line-height: 18px` / `padding: 0 10px`（`sm`）← `Button.module.css` `.sm` |
| 段 `font-size: 14px` / `line-height: 22px` / `padding: 0 14px` ← `Button.module.css` `.button` |
| 段内图标与文字 `gap: 4px` ← `Button.module.css` `.button`（`Pill.module.css` `.pill` 同值） |
| 未选中段文字色 `var(--dsw-alias-label-secondary)` ← `Pill.module.css` `.pill` |
| 选中段文字色 `var(--dsw-alias-label-primary)` ← `Pill.module.css` `.active` |
| 选中段填充 `var(--dsw-alias-button-ghost-active-fill)` / 描边 `box-shadow: inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)` ← `Pill.module.css` `.active` |
| 未选中段 hover 底色 `var(--dsw-alias-interactive-bg-hover)` ← `Pill.module.css` `.interactive:hover`（`Button.module.css` `.ghost:hover` 同值） |
| 图标容器 `16×16` ← `Button.module.css` `.icon` |
| 段圆角 `8px` 的取值本体 ← `Input.module.css` `.wrap` 的 `border-radius: 8px`；`8 = 12（外层，Pill）− 4（内边距，Menu）` |

### 本仓库建议值（非官方数值）

官方没有这些数值，逐条给理由。

| 数值 | 理由 |
| --- | --- |
| 段圆角 `8px` | 同心圆角：外层 r12 + 4px 内边距，内件取 12 − 4 = 8。不选官方 Button `.sm` 的 r14：那段是胶囊，套在方形段上会与外层 r12 冲突；不选 r10/r12 中间值，避免 `TK-MF-03` 的「自造并混用中间圆角」。 |
| 未选中段的 `:active` 态底色 `var(--dsw-alias-interactive-bg-active)` | 官方 `Pill` 只有 `:hover`，没有 `:active`；`CT-MF-07` 要求五态齐全，取官方 `Button.module.css` `.ghost:active` 的同名 token，不发明新色。 |
| 焦点环 `2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` | 官方 `Button` / `Pill` 都没有键盘焦点样式；`AC-MF-10` / `AC-MF-11` 要求可见焦点环。段在容器 4px 内边距里，2px 外偏移后环正好落在容器边界内，不会被裁。 |
| 容器的 `gap: 0` | 直接取 `Menu.module.css` `.list` 的 `gap: 0`；段之间靠选中段的填充与 `inset` 描边区分，不额外加间距（加间距会出现两个相邻的描边，视觉变脏）。 |
| 只对未选中段做 hover / active | 选中段已有 `ghost-active-fill` 填充；再叠 hover 底色会让它在鼠标悬停时「变色」，读起来像未选中。 |

### 本仓库决策（改写官方行为）

- **补一个整组 `disabled` prop。** 任务给定的 API 没有 `disabled`，但 `CT-MF-07` 要求每个交互控件有五态，故补上：按钮走原生 `disabled`，文字降到 `--dsw-alias-label-tertiary`（`CT-MF-09`：不靠整体降透明度），并保留选中段的填充以便读出「当前是哪一段」。
- **语义选 `radiogroup` / `radio` 而不是 `tablist` / `tab`。** 两种语义都要求「一组互斥项、方向键移动、只有一个 Tab 落点」，本组件都满足。区别在结果：`tablist` 的每一格必须用 `aria-controls` 指向一个 `tabpanel`，切换的是可见内容；本组件不渲染也不控制任何面板，它产出的只是一个值（`onChange`），这正是 `radiogroup` 的语义。用 `tablist` 而不给 `tabpanel` 会让读屏播报「选项卡 1/2」却找不到对应面板，属于语义撒谎。选 `radiogroup` 的代价是读屏会播报「单选按钮」，对「互相排斥的视图切换」这种场景同样贴切。

### 实现说明

- 本仓库实现为原创：几何由 `.control` 上的组件级 CSS 变量承载（`--dsh-seg-pad` / `--dsh-seg-radius` / `--dsh-seg-inner-radius` / `--dsh-seg-height` / `--dsh-seg-pad-x` / `--dsh-seg-font-size` / `--dsh-seg-line-height` / `--dsh-seg-gap` / `--dsh-seg-icon`），`.sm` 只覆盖其中四个变量。未复制官方 CSS 源码。
- `--dsh-seg-*` 是本仓库内部变量，不是 DSH token。
- `className` 可由外部覆盖局部变量微调段宽。

## api

`SegmentedControlProps<Value extends string> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'aria-label' | 'children'>`，通过 `forwardRef` 导出（对外类型保留泛型，`options` 的字面量值会收窄 `value` / `onChange`）。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `options` | `ReadonlyArray<{ value: Value; label: ReactNode; icon?: ReactNode }>` | 必填 | 全部分段，顺序即渲染顺序；`value` 组内必须唯一 |
| `value` | `Value` | 必填 | 当前选中的值（受控） |
| `onChange` | `(value: Value) => void` | 必填 | 只在点选或键盘选中另一段时回调 |
| `size` | `'md' \| 'sm'` | `'md'` | `md` 为标准 36px 段，`sm` 为紧凑 28px 段 |
| `disabled` | `boolean` | `false` | 整组禁用（本仓库决策）：按钮用原生 `disabled`，容器加 `aria-disabled` |
| `aria-label` | `string` | 必填 | 可访问名称，落在 `role="radiogroup"` 的容器上 |
| 其余 | `HTMLAttributes<HTMLDivElement>` | — | `id` / `className` / `style` / `data-*` 透传到容器 |
| `ref` | `ForwardedRef<HTMLDivElement>` | 无 | 透传到容器 |

`SegmentedControlSize` / `SegmentedControlOption` 为导出的类型别名。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 未选中 | `.option` | 底色透明；文字 `--dsw-alias-label-secondary` |
| hover | `.option:hover:not(:disabled):not([aria-checked='true'])` | `background: var(--dsw-alias-interactive-bg-hover)` |
| active（按下） | `.option:active:not(:disabled):not([aria-checked='true'])` | `background: var(--dsw-alias-interactive-bg-active)`（本仓库建议值） |
| 选中 | `.option[aria-checked='true']` | 文字 `--dsw-alias-label-primary`；填充 `--dsw-alias-button-ghost-active-fill`；`box-shadow: inset 0 0 0 1px --dsw-alias-button-ghost-active-border` |
| 键盘焦点 | `.option:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`（本仓库建议值） |
| 整组禁用 | `.disabled .option` | `cursor: not-allowed`；文字降为 `--dsw-alias-label-tertiary`；选中段保留填充、文字同样降级 |
| Tab 落点 | `tabIndex` | 选中的那一段为 `0`，其余为 `-1`（roving tabindex） |
| 无选中项 | `value` 不在 `options` 里 | `checkedIndex === -1`，Tab 落点落到第一段；没有任何一段点亮 |
| 方向键 | `ArrowRight` / `ArrowDown` / `ArrowLeft` / `ArrowUp` / `Home` / `End` | 焦点与选中一起走（follow-focus），并在首尾循环；`preventDefault` 阻止页面滚动 |
| 减弱动效 | — | 组件不含过渡与动画，无 `prefers-reduced-motion` 分支 |

## tokens

DSH 语义 token：

- `--dsw-alias-bg-module-platform` — 容器底色
- `--dsw-alias-label-secondary` — 未选中段文字色
- `--dsw-alias-label-primary` — 选中段文字色
- `--dsw-alias-label-tertiary` — 整组禁用时的段文字色
- `--dsw-alias-interactive-bg-hover` — 未选中段悬停底色
- `--dsw-alias-interactive-bg-active` — 未选中段按下底色（本仓库建议值）
- `--dsw-alias-button-ghost-active-fill` — 选中段填充
- `--dsw-alias-button-ghost-active-border` — 选中段内描边色
- `--dsw-alias-brand-primary` — 焦点环颜色（本仓库建议值）

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-seg-pad`（`4px`）
- `--dsh-seg-radius`（`12px`）
- `--dsh-seg-inner-radius`（`8px`）
- `--dsh-seg-height`（`36px` / `.sm` 下 `28px`）
- `--dsh-seg-pad-x`（`14px` / `.sm` 下 `10px`）
- `--dsh-seg-font-size`（`14px` / `.sm` 下 `12px`）
- `--dsh-seg-line-height`（`22px` / `.sm` 下 `18px`）
- `--dsh-seg-gap`（`4px`）
- `--dsh-seg-icon`（`16px`）

## a11y

- `aria-label` 是必填 prop：`role="radiogroup"` 必须有可访问名称，否则读屏只会读出「单选按钮组」而不知道在选什么。容器另有 `aria-orientation="horizontal"`。
- `role="radio"` + `aria-checked`：选中态靠 ARIA 表达，不依赖颜色（`AC-MF-07`：转灰度后仍有填充 + 内描边的形状差异）。
- **roving tabindex**：只有选中的那一段 `tabIndex=0`，其余 `-1`。`value` 不在 `options` 里时（无选中项）落到第一段，保证组内始终有一个 Tab 落点，否则键盘用户会整组跳过（`AC-MF-09`）。
- 方向键按 follow-focus 模型：`←` `→`（含 `↑` `↓` `Home` `End`）既移动焦点也改变选中，与原生 radio 组一致；`preventDefault` 防止页面本身被方向键滚动。
- 每段是原生 `<button type="button">`：`Tab` 可到、`Enter` / `Space` 可触发，且不会在 `<form>` 里意外提交。
- 图标是装饰：`icon` 节点被 `aria-hidden="true"` 包住，名字只来自 `label`。**只给图标不给文字会让这一段没有可访问名称**，必须同时提供 `label`（可以是给读屏用的视觉隐藏文本）（`AC-MF-14`）。
- 禁用：按钮是真的 `disabled`（焦点与点击都被拦住），容器另有 `aria-disabled="true"` 供读屏播报整组状态。
- 焦点环用 `outline`（不是 `box-shadow`），段被容器的 4px 内边距兜住，不会被裁（`AC-MF-12`）。
- 段高只有两档（36 / 28），点击命中区即段本身，均 ≥28px 高（`AC-MF-01`）；相邻段的命中区不重叠（`AC-MF-03`）。
- 已知取舍（照实说）：`--dsw-alias-bg-module-platform` 在浅色主题下是 `#f9fafb`，与页面底色 `#fff` 只差一点点，容器本身几乎看不出来；这时「当前是哪一段」靠选中段的填充与内描边表达，仍然成立（深色主题下容器是 `#353638`，对比明显）。两套主题的渲染结果见 `demo.html`（把宿主主题切到深色再看一遍）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 容器为 `role="radiogroup"` 且带非空 `aria-label`；每段为 `role="radio"` 且 `aria-checked` 绑定 `option.value === value`。
2. 容器带 `aria-orientation="horizontal"`；`disabled` 为真时容器带 `aria-disabled="true"`。
3. 组内 `tabIndex` 恰有一个 `0`，其余全为 `-1`；`value` 不在 `options` 里时第 0 段为 `0`。
4. 方向键处理覆盖 `ArrowRight` / `ArrowDown` / `ArrowLeft` / `ArrowUp` / `Home` / `End` 六键，且调用 `preventDefault`。
5. `onChange` 只在新值与原 `value` 不同时触发。
6. 每段为原生 `<button type="button">`；`disabled` 为真时每段带原生 `disabled`（不是 `aria-disabled` 包一层）。
7. 段圆角为同心圆角 8 = 外层 12 − 内边距 4（本仓库建议值）。
8. 容器 `gap` 为 `0`，段间不额外加间距（本仓库建议值）。
9. hover 与 active 规则带 `:not([aria-checked='true'])`，选中段不叠 hover / active 底色（本仓库建议值）。
10. 存在 `:focus-visible` 焦点样式，且不以 `outline: none` 移除后无替代（`AC-MF-10`）。
11. 焦点环规格为 2px 实线 + `--dsw-alias-brand-primary` + 2px 外偏移（`AC-MF-11`）。
12. 整组禁用时文字降为 `--dsw-alias-label-tertiary`，不用整体降低不透明度代替（`CT-MF-09`）。
13. 段内图标容器固定 16×16、`flex: none`，图标节点带 `aria-hidden="true"`（`AC-MF-14`）。
14. 两个尺寸的段高分别为 36px 与 28px，均 ≥28px（`AC-MF-01`），且相邻段命中区不重叠（`AC-MF-03`）。
15. 未选中段的 `:active` 底色来自 `--dsw-alias-interactive-bg-active`，与 hover 底色分属两个官方 token（本仓库建议值）。
16. 组件不含过渡与动画，因此没有需要 `prefers-reduced-motion` 覆盖的位移（`MO-RC-09` 的适用前提不成立）。

## demo

- `components/controls/SegmentedControl/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A18`、`A19`、`A25`、`A36`、`A43`、`A46`、`A47`、`A48`、`A49`）
