# Stepper 数字步进器

在一个 32px 高的输入外壳里，用「−」「数字」「+」三件套逐格调整一个数字。

## 是什么

一个受控组件：`value` 由宿主持有，`onChange` 收到的一定是收敛后的合法值。

```tsx
const [count, setCount] = useState(1);

<Stepper value={count} onChange={setCount} min={1} max={99} aria-label="生成数量" />
```

| 能力 | 说明 |
| --- | --- |
| 步进 | 单击「−」/「+」走一格；`step` 默认 `1`，可否小数（`step={0.5}`） |
| 键盘 | 输入框上 `↑` / `↓` 走一格，`Enter` 提交手输草稿，`Esc` 丢弃草稿 |
| 手输 | 直接在数字上打字；在界内的输入即时生效，越界或空的输入在失焦时收敛回边界 |
| 边界 | 到 `min` / `max` 时对应的按钮变成原生 `disabled`（`opacity: 0.4`） |
| 零依赖 | 只 import `react` 与本目录的 CSS Modules，没有 `clsx`、没有 `@deepseek-ai/*` |

不做的事：不做拖动改值、不做长按连加、不做滑杆、不做滚轮改值。

## 什么时候用

- 数量、份数、字号、重试次数这类「有下界上界、以固定步长变化」的数值。
- 需要精确到某一格（例如端口号、页码），键盘上下键比滑杆更可控时。
- 表单里已经有 `min` / `max` 语义，希望越界在交互层就被拦住时。

## 什么时候不要用

- 值域很大或没有边界（音量、进度、任意金额）：用 `Slider` 或直接 `Input`，逐格点太慢。
- 连续型输入、需要一次性输入长数字：用普通 `Input`，步进器每点一次只走一格。
- 候选项是有限的固定集合：用 `SegmentedControl` 或 `Select`，不要让用户按加减去凑。
- 布尔开关：用 `Switch`。
- **不要**把它当成「只能点不能打字」的展示件：`role="spinbutton"` 隐含「键盘可改值」的承诺。

## 几何来源

外壳与状态色全部来自官方 CSS（本仓库没有这两个组件的官方对应物，所有几何都是「官方锚点 + 建议值」拼装）：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| `height: 32px`、`padding: 0 8px`、`gap: 6px` | `Input.module.css` `.wrap` |
| `border: 0.5px solid var(--dsw-alias-border-l4)`、`border-radius: 8px` | `Input.module.css` `.wrap` |
| `background: var(--dsw-alias-bg-layer-1)` | `Input.module.css` `.wrap` |
| `:focus-within { border-color: var(--dsw-alias-brand-primary) }` | `Input.module.css` `.wrap:focus-within` |
| `font-size: 14px`、`line-height: 22px`、`color: var(--dsw-alias-label-primary)` | `Input.module.css` `.input`（本组件用 `color: inherit` 继承外壳同名 token） |
| 图标容器 `16×16` | `Button.module.css` `.icon`；`Input.module.css` `.icon` 同值 |
| hover 背景 `--dsw-alias-interactive-bg-hover` | `Button.module.css` `.ghost:hover`（`Pill.module.css` `.interactive:hover` 同值） |
| active 背景 `--dsw-alias-interactive-bg-active` | `Button.module.css` `.ghost:active` |
| `:disabled { opacity: 0.4 }`、`cursor: not-allowed` | `Button.module.css` `.button:disabled` |
| 按钮字形 `color: var(--dsw-alias-label-primary)` | `Button.module.css` `.button` |
| 禁用态文字降为 `--dsw-alias-label-tertiary` | `Menu.module.css` `.label`、`Input.module.css` `.icon` 使用的三级文字 token（CT-MF-09 指定） |

**本仓库建议值（官方没有这些数值，逐条给理由）：**

| 数值 | 理由 |
| --- | --- |
| 加减按钮 `28×28` | 官方未定义步进器按钮尺寸。[HIG] 常规控件命中区 28×28（`60-accessibility.md` `AC-MF-01` / `AC-MF-04`）；外壳内容高 31px（32 − 0.5×2），28×28 正好放得下且不与外壳冲撞。不用 32×32：会顶满外壳高度，边缘没有余量。 |
| 加减按钮 `border-radius: 8px` | 外壳官方圆角就是 r8（`Input.module.css` `.wrap`），内件取同值，避免引入官方尺度表之外的 r10/r12（`TK-MF-03`）。 |
| 数字区 `width: 40px` | 官方 `Input.module.css` `.input` 是 `flex: 1`，在固定宽度的步进器里需要显式宽度。40px 是 4 的倍数，按 14px 字号下等宽数字每字不超过 0.7em（≈10px）估算可容纳 4 位数字。宿主需要更宽时用 `className` 覆盖。 |
| `font-variant-numeric: tabular-nums` | 等宽数字，加减时读数不横向跳动。官方在 CSS 里没有这条（它的输入框是自由文本）。 |
| `text-align: center` | 步进器的通行读数方式；官方 Input 未规定对齐（自由文本默认左对齐，不适用于此形态）。 |
| 焦点环 `outline: 2px solid var(--dsw-alias-brand-primary)`，偏移 `0` | 官方 `Button.module.css` 没有焦点样式，`AC-MF-10` / `AC-MF-11` 要求可见焦点环。偏移取 0 而非规范建议的 2px：外壳内容高只有 31px、按钮 28px，2px 外偏移会把焦点环画到外壳边框之外；0 偏移时环恰好落在外壳内（28 + 2×2 = 32 = 外壳高度）。 |
| 输入框也补 2px 焦点环 | 官方 `Input.module.css` 只用 `.wrap:focus-within` 的 `border-color` 变色表达焦点；0.5px 细线变色在浅色与深色主题下都偏弱，故额外补环（保留官方的 `border-color` 变色）。 |

实现为本仓库原创：几何由 `--dsh-stepper-*` 局部变量承载，用一组规则组织，未复制官方 CSS 源码。

## 可访问性要点

- **`aria-label` 是必填 prop**：它落在内部的数字输入框上（`role="spinbutton"`），这是本组件唯一的可访问名称来源。外部若另有 `<label>`，用 `id` 关联，不要让两处名字打架（屏幕阅读器会以 `<label>` 为准）。
- `role="spinbutton"` 配 `aria-valuenow` / `aria-valuemin` / `aria-valuemax`：`min` / `max` 未传时对应属性不下发，读屏不会报出一个假的边界。
- 「−」/「+」是纯图标按钮，各自带 `aria-label`（`decreaseLabel` / `increaseLabel`，默认「减少」「增加」）；图标本身 `aria-hidden`，避免读两遍。多语言站点请显式传入本地化文案。
- 边界即禁用：到 `min` / `max` 时按钮是真的 `disabled`（不是 `aria-disabled`），焦点与点击都被拦住，读屏也会播报为不可用。
- 键盘可达：两个按钮是原生 `<button>`，`Tab` 可到、`Enter`/`Space` 可触发；输入框支持 `↑`/`↓`/`Enter`/`Esc`。
- 焦点环用 `outline` 而非 `box-shadow`，不会被父级 `overflow: hidden` 裁掉（`AC-MF-12`）。
- 已知限制（照实说）：单击「+」后焦点留在按钮上，屏幕阅读器**不会**自动播报新的数值（数值变的是另一个元素）。需要播报的宿主请自行在外部加一个 `aria-live="polite"` 区域显示当前值；本组件不内置，以免与宿主的播报策略重复。
- 已知取舍：输入框在每次合法输入后立即回写受控值，数字被规范化时（例如手输 `007` 变成 `7`）光标会跳到末尾。宁可规范化，也不要让显示值与 `value` 长期不一致。
