# StatRow 指标行

一行「标签 … 数值」的指标展示行，可选单位、可选变化量、可选行间 hairline。

## 是什么

一个 `<div>` 行：左侧标签，右侧数值组（数值 + 可选单位），最右可选变化量。
零依赖，只用到 `react` 和 CSS Modules。官方 `dsh-client-ui-primitives` 没有对应组件，
几何是按官方若干选择器拼装的（见「几何来源」）。

| 部位 | 内容 | 排版 |
| --- | --- | --- |
| 标签 | 指标名 | 13/24，`--dsw-alias-label-secondary` |
| 数值 | 主体数字 | 14/22，`--dsw-alias-label-primary`，等宽数字 |
| 单位 | `%` / `ms` / `GB` | 12/18，`--dsw-alias-label-tertiary` |
| 变化量 | `+3.1%` / `-12ms` | 12/18，色调由 `deltaTone` 决定 |

数值组用 `margin-left: auto` 顶到右侧；如果只传 `label` + `value`，它就是一行普通的左右对齐文本。

## 什么时候用

- 展示成组的只读指标：缓存命中率、延迟、token 用量、磁盘占用、并发数。
- 需要「当前值 + 相对基准的变化」一起出现时（`delta` + `deltaTone`）。
- 面板里用 `<StatRow divider />` 堆叠成一列，行间自带 hairline。

## 什么时候不要用

- 一项数据需要突出的大字号展示（仪表盘大数字）：用专门的统计卡，StatRow 的字号是正文级。
- 数据是「键 → 值」的通用对象（可能是多行、长文本）：用 `KeyValueList`，它的键列有固定层级、值可换行。
- 需要用户输入或选择：这是纯展示组件，没有交互、没有焦点。
- 需要与目标值比较的条形可视化：`StatRow` 里放 `MiniBar` 才是那个场景。

## 几何来源

官方没有 StatRow，以下数值逐条读自官方文件：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| 标签 `font-size: 13px`、`line-height: 24px` | 官方 `DisclosureRow.module.css` → `.title` |
| 标签色 `var(--dsw-alias-label-secondary)` | 官方 `DisclosureRow.module.css` → `.title` |
| 数值 `font-size: 14px`、`line-height: 22px` | 官方 `Button.module.css` → `.button` |
| 数值色 `var(--dsw-alias-label-primary)` | 官方 `Button.module.css` → `.button` |
| 单位与变化量 `font-size: 12px`、`line-height: 18px` | 官方 `Button.module.css` → `.sm` |
| 单位与变化量色 `var(--dsw-alias-label-tertiary)` | 官方 `Menu.module.css` → `.label`（同为三级文字的取色） |
| 分隔线 `border-top: 0.5px solid var(--dsw-alias-border-l2)` | 官方 `markdown/MarkdownText.module.css` → `.markdown hr`（`height: 0.5px` + `background: var(--dsw-alias-border-l2)`） |
| 变化量色 `--dsw-alias-state-{success\|warn\|error}-primary` | 官方 `Tag.module.css` → `.tag[data-tone='success'\|'warning'\|'danger']` 用的同批状态主色 token；取值见 `website/css/dsh-tokens.css` |

`DisclosureRow.module.css` 的 `.title` 把字号写成 `var(--dsh-content-font-size-secondary, 13px)`、
行高写成 `calc(24px + var(--dsh-content-font-delta, 0px))`；本组件取字体偏好默认值（delta = 0）后的 13/24，
不实现该偏好联动。

**本仓库建议值（非官方数值）：**

- `min-height: 32px`：**数值**来自官方 `Input.module.css` 的 `.wrap`（`height: 32px`），但把它用作指标行行高是本仓库决定——让指标行与表单控件同高，成列时节奏一致；同时是 4 的倍数。
- `.row` 的 `gap: 8px`、`.valueGroup` 的 `gap: 4px`、`.valueGroup` 的 `margin-left: auto`：官方没有行内间距可抄，取 4 的倍数（8px = 4×2，4px = 4×1）。8px 是标签与数值之间「同组但可区分」的最小距离；`margin-left: auto` 实现右对齐，不引入额外数值。
- `font-variant-numeric: tabular-nums`（数值 / 单位 / 变化量）：官方文件未使用该属性。多行指标纵向排列时，比例数字会让小数点位置左右跳动；等宽数字消除抖动。用属性而非数值，不影响几何。
- 变化量色：官方没有「变化量」这个概念，本仓库把状态主色 token 复用为涨跌语义。默认 `neutral` → `--dsw-alias-label-tertiary`（无好坏倾向），涨/跌由调用方通过 `deltaTone` 指定，不在这里假定「涨=好」。
- `divider` 画在**行上方**（`border-top`）：官方 `.markdown hr` 是一条独立横线，没有「行分隔」写法，本仓库选上边框以便用「除第一行外都加」的简单规则。

实现为本仓库原创：用 CSS 变量 + 单个 `data-divider` 属性组织规则，几何等价但非官方 CSS 的复制。

## 可访问性要点

- **变化量不能只靠颜色表达**：`deltaTone` 只改颜色。请让 `delta` 文本自带 `+` / `-`（或 `↑` / `↓` 之外的文字），否则色觉障碍用户、以及屏幕阅读器用户都读不出涨跌方向。
- **读屏顺序是「标签 → 数值 → 单位 → 变化量」**，与视觉顺序一致（数值组在 DOM 中位于标签之后）。不要用 `order` 之类的 CSS 把视觉顺序改得和 DOM 不一致。
- 标签与数值是两个独立文本节点，屏幕阅读器会连读成「缓存命中率 92.4 %」；这正好是想要的读法，因此**不要**给行加 `aria-label`——那会覆盖掉里面更细的文本。
- 数值请以纯文本形式传入（`value="92.4"`），不要传 `<img>` 或纯图标；图标对读屏是空的。
- 本组件是纯展示元素，不可聚焦、不可交互；如果需要点击跳转，请在外部包一层链接或按钮，并把整行文本作为其可访问名称。
