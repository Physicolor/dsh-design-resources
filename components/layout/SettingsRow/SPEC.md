# SettingsRow · SPEC

- id: settingsrow
- category: layout
- source: `components/layout/SettingsRow/`（`index.tsx` / `settingsrow.module.css`）
- official-counterpart: 无同名组件；几何锚点取自 `@deepseek-ai/dsh-client-ui-primitives/lib/` 的 `Button.module.css` / `Modal.module.css` / `Menu.module.css` / `ReadBlock.module.css`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

写法为「数值 ← 文件名 选择器」：左列是箭头左侧，右列是「文件名 + 选择器」。
官方来源为 `@deepseek-ai/dsh-client-ui-primitives/lib/`。

| 数值 | 出处 |
| --- | --- |
| 标题 `font-size: 14px` / `line-height: 22px` | `Button.module.css` → `.button`（面板 / 设置项标题沿用这一档字号，与 `PanelHeader` 一致） |
| 标题色 `color: var(--dsw-alias-label-primary)` | `Modal.module.css` → `.title` / `Button.module.css` → `.button` |
| 说明字体 `font: var(--dsw-font-xs-13)`（`13px/20px`） | 官方合成 token；官方消费点 `ReadBlock.module.css` → `.count` |
| 说明色 `color: var(--dsw-alias-label-tertiary)` | `Menu.module.css` → `.itemIcon` |
| 分隔线 `border-top: 0.5px solid var(--dsw-alias-border-l2)` | `Menu.module.css` → `.footer` |
| `border-radius: 10px` | `Menu.module.css` → `.item`（只为让悬停底不露直角） |
| 悬停底 `background: var(--dsw-alias-interactive-bg-hover)` | `Menu.module.css` → `.item:hover:not(:disabled)` / `Button.module.css` → `.ghost:hover` |
| `.control` 的 `gap: 8px` | `Menu.module.css` → `.item`（`gap: 8px`） |
| `.text` 的 `gap: 4px` | `Button.module.css` → `.button`（`gap: 4px`） |

### 为什么分隔线用 `border-l2` 而不是 `border-l1`

官方把 `l2` 用在「浮层 / 分区与外部之间的边界」（`Menu.module.css` `.footer` 的顶边，注释原话：*l1 is near-invisible on the menu surface*），把 `l1` 用在同层内容分隔（`.separator`）。设置项之间是一条需要看得见的分区线，因此取 `l2`。

### 本仓库建议值（非官方数值，全部为 4 的倍数）

- `min-height: 44px`：官方没有设置行。44 的取法：标题行高 22 + 上下各 11px 视觉留白 → 取 4 的倍数 44；同时保证右侧放一个 28px 的图标按钮（官方 `Modal.module.css` `.close` 的 28×28）时上下各余 8px。
- `padding: 12px`（上下、左右同值）：`12` 是 4 的倍数，也是本仓库面板类组件的统一水平节奏（`PanelHeader` 的 `md` 档同样是 12px），把设置面板与面板标题栏左对齐。
- `gap: 12px`（文字区 ↔ 控件区）：4 的倍数。取 12px 而不是 8px，是为了让「标签」和「开关」之间有明确的呼吸感——8px 在长标题行上会让两者视觉粘连。
- `.control` 的 `gap: 8px`：官方 `Menu.module.css` `.item` 的 `gap: 8px` 同值，一行里放多个控件时用。
- `.row:hover` 的整行悬停底：官方没有任何「设置行」可参照。加它是因为根节点可点（`<label>`），需要让鼠标用户看出来。若不需要行有悬停反馈，调用方可自行覆盖 `.row:hover` 的 `background`。
- 圆角 `10px` 纯为悬停底服务；不想要悬停底也就不需要圆角。
- hairline 用 `box-shadow: inset 0 -0.5px 0 0` 而非官方 `border-bottom`：本行有 `min-height` 和圆角，`border-bottom` 会把总高度顶成 44.5px，且会被圆角切成弧线。`box-shadow` 不参与布局。

### 实现说明

- 本仓库实现为原创：CSS 变量承载几何 + 单类切换分隔线，几何等价但不是官方 CSS 的复制。
- `--dsh-sr-*` 是本仓库内部变量，不是 DSH token。
- `.description` 优先使用官方合成 token `--dsw-font-xs-13`（`@supports` 判定），宿主未注入时以 longhand 兜底同一组数值（`13px` / `20px`，经 `--dsh-sr-desc-size` / `--dsh-sr-desc-line`）。用 longhand 而不是 `font` 简写，是因为简写的兜底值必须自带 `font-family`，而这里没有可靠的字族可写。

## api

`SettingsRowProps extends LabelHTMLAttributes<HTMLLabelElement>`，`forwardRef<HTMLLabelElement, SettingsRowProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | 无（必填） | 设置项标题，14/22、`var(--dsw-alias-label-primary)` |
| `description` | `ReactNode` | 无 | 可选说明文字，13/20、官方合成 token `--dsw-font-xs-13`、`var(--dsw-alias-label-tertiary)` |
| `control` | `ReactNode` | 无 | 右侧控件区，通常是 `Switch` / `Input` / `Button` / `<select>` |
| `divider` | `boolean` | `true` | 是否绘制底部 hairline（`0.5px` + `var(--dsw-alias-border-l2)`） |
| `children` | `ReactNode` | 无 | 追加在 `.text` 内、`description` 之后 |
| `className` | `string` | 无 | 与内部类名拼接 |
| 其余 | `LabelHTMLAttributes<HTMLLabelElement>` | — | `onClick` / `aria-*` 等原样透传到根 `<label>` |
| `ref` | `Ref<HTMLLabelElement>` | 无 | 透传到根 `<label>` |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认 | — | 根节点为 `<label>`；`display: flex` + `align-items: center` + `justify-content: space-between`；`gap: 12px`；`min-height: 44px`；`padding: 12px` |
| 有分隔线 | `divider` 为真（默认） | `box-shadow: inset 0 -0.5px 0 0 var(--dsw-alias-border-l2)` |
| 无分隔线 | `divider={false}` | 无 `box-shadow` |
| 悬停 | `.row:hover` | `background: var(--dsw-alias-interactive-bg-hover)`；圆角 `10px` 生效 |
| 有说明 | `description != null` | `.description` 渲染，与标题间距 `4px` |
| 无说明 | `description` 为 `null` / `undefined` | `.description` 不渲染 |
| 无控件 | `control` 为 `null` / `undefined` | `.control` 不渲染 |
| 长标题 | 文本宽度超过可用空间 | `.text` 带 `min-width: 0`，可在行内收缩 |
| 宿主未注入合成 token | 不支持 `font: var(--dsw-font-xs-13)` | `.description` 回落到 `13px` / `20px` 的 longhand 兜底值 |
| 交互 | 任意时刻 | 组件自身不监听事件；行内控件的交互由控件负责 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-primary` — `.title` 文字色
- `--dsw-alias-label-tertiary` — `.description` 文字色
- `--dsw-alias-border-l2` — 底部 hairline 颜色
- `--dsw-alias-interactive-bg-hover` — `.row:hover` 底色
- `--dsw-font-xs-13` — 说明文字的合成 token（`13px/20px`，含字体族）

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-sr-min-height`（`44px`）
- `--dsh-sr-pad-y`（`12px`）/ `--dsh-sr-pad-x`（`12px`）
- `--dsh-sr-gap`（`12px`）
- `--dsh-sr-desc-size`（`13px`）/ `--dsh-sr-desc-line`（`20px`）：合成 token 不可用时的兜底值

## a11y

- 根节点是 `<label>`，行内的第一个表单控件会被它隐式关联（`AC-MF-14` 的可访问名称来源）：**一行只放一个表单控件**。放两个会导致标签指向第一个、第二个没有名字。
- `<label>` 上的 `onClick` 会被控件自身再触发一次（事件冒泡）；在 `onClick` 里做切换逻辑时注意别切两次，能交给控件自己的 `onChange` 就交给控件。
- 标题是 `<span>` 不是标题元素。整块设置区若有 `<section>` 语义，由调用方给该 section `aria-labelledby`，或直接用 `<fieldset><legend>`。
- 右侧控件若是仅图标按钮，必须给 `aria-label`；`Switch` 必须给 `aria-label`（`role="switch"` 需要一个可读名字）（`AC-MF-14`；清单 `A49`）。
- 说明文字是三级文字色：它承载补充信息，不要把「必须知道才能操作」的内容只写在说明里（`AC-MF-05` / `AC-MF-07`）。
- 行间分隔线是纯装饰，不带语义。
- 焦点：官方 `Input.module.css` / `Switch.module.css` 只给控件本身定义焦点样式，不给「行」定义。本组件不动控件，键盘焦点环由右侧控件自行提供（官方 `Switch.module.css` 的 `:focus-visible`：2px `--dsw-alias-brand-primary`）；整行悬停底只服务鼠标用户（清单 `A48`）。
- 命中区结论：行高 `min-height: 44px`，整行可点；行内控件自身的命中区由各自组件负责（`AC-MF-01`）。含 28px 图标按钮时上下各余 8px，容器行高 ≥ 28（`AC-MF-04`；清单 `A44`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 根节点为 `<label>`。
2. 一行内至多一个表单控件元素（`input` / `select` / `textarea` / `[role="switch"]` 计数 ≤ 1），否则判违规（`AC-MF-14`）。
3. `divider` 为假时不渲染 hairline 的 `box-shadow`。
4. hairline 颜色为 `var(--dsw-alias-border-l2)`（清单 `A19`）。
5. hairline 用 `box-shadow` 而非 `border-bottom`，根节点高度为整数（`44px`）而非 `44.5px`。
6. `control` 为 `null` / `undefined` 时源码不渲染 `.control` 节点。
7. `.text` 带 `min-width: 0`。
8. `.row` 的 `min-height` ≥ 28px（实测 `44px`；`AC-MF-04`；清单 `A44`）。
9. `.description` 的兜底字号为 `13px`、行高 `20px`，且经 `@supports (font: var(--dsw-font-xs-13))` 优先采用合成 token（`TK-MF-11`；清单 `B08`）。
10. 颜色全部来自 `--dsw-*` 语义 token，源码中无硬编码色值（清单 `A23`）。
11. 无固定 `height`，只有 `min-height`，文本放大后不被裁切（`AC-RC-17`；清单 `B13`）。
12. 源码不出现 `aria-disabled` 冒充原生禁用；行内控件是否禁用由控件自身表达。
13. 列表最后一行由调用方传 `divider={false}` 或由父级以 `:last-child` 覆盖（人审，见 `README.md`「怎么用得好」）。
14. 组件源码不主动给 `.title` 渲染 `<h1>`–`<h6>`（避免破坏页面标题大纲）。

## demo

- `components/layout/SettingsRow/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A19`、`A23`、`A44`、`A48`、`A49`、`B08`、`B13`）
