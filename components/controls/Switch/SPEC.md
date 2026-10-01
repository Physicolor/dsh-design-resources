# Switch · SPEC

- id: switch
- category: controls
- source: `components/controls/Switch/`（`index.tsx` / `switch.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Switch.module.css` 与 `lib/index.js` 的 `function Switch`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 `Switch.module.css`，写法为「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| `width: 36px` / `height: 20px` / `padding: 2px` / `border: 0` / `border-radius: 10px` / `corner-shape: round` | `Switch.module.css` → `.switch` |
| `box-sizing: border-box` / `position: relative` / `flex: 0 0 auto` / `cursor: pointer` | `Switch.module.css` → `.switch` |
| `background: var(--dsw-alias-border-l3)` | `Switch.module.css` → `.switch` |
| `background: var(--dsw-alias-brand-primary)` | `Switch.module.css` → `.switch[aria-checked='true']` |
| `cursor: default` / `opacity: 0.5` | `Switch.module.css` → `.switch:disabled` |
| `outline: 2px solid var(--dsw-alias-brand-primary)` / `outline-offset: 2px` | `Switch.module.css` → `.switch:focus-visible` |
| `width: 16px` / `height: 16px` / `border-radius: 50%` / `corner-shape: round` | `Switch.module.css` → `.thumb` |
| `display: block` / `background: var(--dsw-alias-label-primary-foreground)` / `transition: transform 120ms ease` | `Switch.module.css` → `.thumb` |
| `transform: translateX(16px)` | `Switch.module.css` → `.switch[aria-checked='true'] .thumb` |
| 根节点为 `<button type="button" role="switch">`，带 `aria-checked` / `aria-label` / `title` / `disabled`，子节点为 `<span class=thumb>` | `lib/index.js` → `function Switch({ checked, onChange, label, disabled = false, title, className })` |

官方源码注释（`Switch.module.css` 顶部）解释了轨道的圆角为什么写 `corner-shape: round`：轨道圆角是自身高度的一半（10px = 20px / 2），会被全局超椭圆规则当成「不够圆」而把两端压方，和里面的圆形滑块打架；`corner-shape` 规范只认 50%、100% 和 ≥99px 的半径，认不出「只相对自身盒子的全圆」，所以需要显式退出。滑块同理。

### 本仓库建议值（非官方数值）

- `@media (prefers-reduced-motion: reduce) { .thumb { transition: none; } }`：官方 `Switch.module.css` 没有声明 reduced-motion 分支。位移只有 16px、时长 120ms，影响很小，但前庭敏感用户对横向滑动更敏感，跟随系统偏好关掉过渡是零成本的。依据 `spec/40-motion.md` 的 `MO-MF-09`（必须响应 `prefers-reduced-motion: reduce`）。

### 已知偏差（照实记录，不视为本仓库发明）

- 官方过渡为 `120ms ease`。`spec/40-motion.md` 的 `MO-MF-01` 要求时长取 100 / 150 / 200 / 300 / 350 之一（`MO-MF-01` 表格把 Switch 归入 150ms 档），`MO-MF-06` 禁止把 `ease` 作为交互过渡曲线。本仓库原样保留官方数值，因为 `CT-MF-01` 要求复用官方几何、`CT-MF-12` 禁止覆盖官方控件的几何属性。两个条款在此冲突，记录而不擅自改写；`checks` 中相应条目因此判定为 false。

### 实现说明

- 本仓库实现为原创：几何由 `.switch` 上的组件级 CSS 变量承载（`--dsh-switch-width` / `--dsh-switch-height` / `--dsh-switch-pad` / `--dsh-switch-thumb-size` / `--dsh-switch-thumb-offset` / `--dsh-switch-duration`），状态由 `aria-checked` 属性选择器驱动。
- 外观挂在 `aria-checked` 而不是另起一个并行 class：视觉状态与辅助技术读到的状态来自同一个属性，不可能互相说谎。
- `--dsh-switch-*` 是本仓库内部变量，不是 DSH token。

## api

`SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children' | 'type'>`，`forwardRef<HTMLButtonElement, SwitchProps>`。组件完全受控，自身不保存状态。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `checked` | `boolean` | 必填 | 当前状态，受控 |
| `onChange` | `(next: boolean) => void` | 必填 | 点击后请求切换到的状态（`!checked`） |
| `label` | `string` | 必填 | 可访问名，写进 `aria-label`；开关没有可见文字，这是唯一名字来源 |
| `disabled` | `boolean` | `false` | 是否拒绝输入；写入进行中时也应置为 `true` |
| `title` | `string` | 无 | 悬浮提示，通常解释开关为什么被锁住 |
| `className` | `string` | 无 | 追加到根节点的 class，用于外部布局定位 |
| 其余 | `ButtonHTMLAttributes<HTMLButtonElement>` | — | 透传到根 `<button>`；`onChange` / `children` / `type` 被排除 |
| `ref` | `Ref<HTMLButtonElement>` | 无 | 透传到根 `<button>` |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 关 | 默认 | 轨道底色 `--dsw-alias-border-l3`；滑块 `translateX(0)` |
| 开 | `aria-checked='true'` | 轨道底色 `--dsw-alias-brand-primary`；滑块 `translateX(16px)` |
| 过渡 | `.thumb` | `transition: transform 120ms ease` |
| hover | 无 | 官方与实现均未定义 `:hover`；`CT-MF-07` 的五态里这一态缺失，`cursor: pointer` 只表达可点 |
| active（按下） | 无 | 未定义 `:active` 视觉 |
| 键盘焦点 | `.switch:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` |
| disabled | `.switch:disabled` | `cursor: default` + `opacity: 0.5`；焦点与点击都被原生 `disabled` 拦住 |
| 减弱动效 | `@media (prefers-reduced-motion: reduce)` | `.thumb` 的 `transition: none`（本仓库建议值） |

## tokens

DSH 语义 token：

- `--dsw-alias-border-l3` — 关闭态轨道底色
- `--dsw-alias-brand-primary` — 打开态轨道底色；焦点环颜色
- `--dsw-alias-label-primary-foreground` — 滑块颜色

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-switch-width`（`36px`）
- `--dsh-switch-height`（`20px`）
- `--dsh-switch-pad`（`2px`）
- `--dsh-switch-thumb-size`（`16px`）
- `--dsh-switch-thumb-offset`（`16px`）
- `--dsh-switch-duration`（`120ms`）

## a11y

- `label` 必填：开关没有可见文字，`aria-label` 是它唯一的名字；漏了读屏只会读出一个没有名字的「开关」。
- `role="switch"` + `aria-checked` 是 ARIA 规定的组合；不得用 `aria-pressed` 代替。
- `onChange(!checked)` 只是「请求」，不是「已经切了」。写入失败需要回滚时，让父级持有真值，不要在组件里先改视觉做乐观更新。
- 写入进行中应置 `disabled`（官方注释明确写了这一点：不只是部署锁死开关时才用），并用 `title` 说明原因。
- 键盘：根节点是原生 `<button>`，Space / Enter 都能切换，`focus-visible` 已给 2px 焦点环；不要自行再绑 `onKeyDown` 处理 Space，重复处理会触发两次。
- 禁用使用原生 `disabled` 属性而不是 `aria-disabled` 包一层，焦点与点击都被真正拦住。
- 命中区：20px × 36px，宽度达标、高度低于 `AC-MF-01` 的常规控件目标 28×28，也低于最小命中区 20×20；纵向命中区依赖调用方留白或扩展热区（见 `checks`）。
- 开关的关与开之间有滑块位移 + 轨道填充两处差异，转灰度后仍可区分（`AC-MF-07`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 根节点为 `<button>`，`type="button"`，`role="switch"`，`aria-checked` 绑定 `checked`。
2. `label` 为必填属性且最终落到 `aria-label` 上，不允许为空字符串。
3. 开关外观由 `[aria-checked='true']` 驱动；源码中不出现与 `aria-checked` 并行的第二套状态 class。
4. 打开态轨道为 `--dsw-alias-brand-primary`；关闭态轨道为 `--dsw-alias-border-l3`。
5. 滑块在打开态 `translateX(16px)`，过渡只动 `transform`，不动布局属性（`MO-MF-08`）。
6. 几何为 36×20，`CT-MF-01` 要求复用官方几何，不得被外部覆盖。
7. 存在 `:focus-visible` 焦点样式，且不以 `outline: none` 移除后无替代（`AC-MF-10`）。
8. 焦点环规格为 2px 实线 + `--dsw-alias-brand-primary` + 2px 外偏移（`AC-MF-11`）。
9. 存在 `prefers-reduced-motion: reduce` 分支并关掉滑块过渡（`MO-MF-09`、`MO-MF-10`；本仓库建议值）。
10. 禁用使用原生 `disabled`，源码中不得出现以 `aria-disabled` 替代 `disabled` 的写法。
11. 轨道存在 `:hover` 视觉（`CT-MF-07` 要求 default / hover / active / focus-visible / disabled 五态齐全）。当前判定：false。
12. 过渡时长为 150ms 且曲线为 `cubic-bezier(0.40, 0, 0.20, 1)`（`MO-MF-01`、`MO-MF-06`）。当前判定：false，见「已知偏差」。

## demo

- `components/controls/Switch/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A15`、`A18`、`A30`、`A31`、`A34`、`A43`、`A46`、`A47`、`A48`、`A49`）
