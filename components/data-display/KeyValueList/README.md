# KeyValueList 键值列表

多行「键 → 值」列表，键列固定层级、值列可换行，可选对齐方式与行间 hairline。

## 是什么

一个 `<dl>`：每对键值是 `<dt>` / `<dd>`，用 `<div>` 包成一行（HTML 规范允许用 `<div>` 分组 dl 里的 dt/dd）。
零依赖，只用到 `react` 和 CSS Modules。官方 `dsh-client-ui-primitives` 没有对应组件，
几何按官方若干选择器拼装（见「几何来源」）。

| 属性 | 取值 | 默认 | 作用 |
| --- | --- | --- | --- |
| `items` | `{ key, value }[]` | 必填 | 按传入顺序渲染，不排序、不去重 |
| `align` | `'start' \| 'center'` | `center` | 键与值的垂直对齐；值是长文本时用 `start` |
| `valueAlign` | `'start' \| 'end'` | `start` | 值列水平对齐；`end` 把整列贴到容器右缘 |
| `divider` | `boolean` | `false` | 行间画 0.5px hairline（第一行之前不画） |

实现上是 `grid-template-columns: minmax(0, max-content) minmax(0, 1fr)`：键列按内容取宽、空间紧张时可收缩，值列吃掉剩余宽度并在必要时换行。

## 什么时候用

- 展示对象的只读明细：模型参数、请求头、配置摘要、文件元信息、环境变量。
- 键是固定短词、值可能较长（URL、路径、模型名）——值列会换行而不是撑破容器。
- 需要纵向比对一列数值时用 `valueAlign="end"`，小数点位置能对上。

## 什么时候不要用

- 只有一两行、且需要强调数值大小：用 `StatRow`，它的数值是正文级字号 + 等宽数字，语义也更窄。
- 需要用户编辑这些键值：`<dl>` 是只读语义的展示结构，请用表单控件。
- 值是列表、树、代码块等块级内容：`<dd>` 里放块级内容是合法的，但视觉上会被行高 14/22 的节奏压扁，建议改用自定义卡片布局。
- 键与值是同一层级的并列项（没有主从关系）：用表格或 `Tag` 列表，`dl` 表达的是「名称—描述」配对。

## 几何来源

官方没有 KeyValueList，以下数值逐条读自官方文件：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| 键 `font-size: 13px`、`line-height: 20px` | 官方合成 token `--dsw-font-xs-13`；官方消费点见 `ReadBlock.module.css` → `.count`（`font: var(--dsw-font-xs-13)`） |
| 键色 `var(--dsw-alias-label-tertiary)` | 官方 `Menu.module.css` → `.label`（三级文字取色） |
| 值 `font-size: 14px`、`line-height: 22px` | 官方 `Button.module.css` → `.button`（等价于合成 token `--dsw-font-s-14`） |
| 值色 `var(--dsw-alias-label-primary)` | 官方 `Button.module.css` → `.button` |
| 分隔线 `0.5px solid var(--dsw-alias-border-l2)` | 官方 `markdown/MarkdownText.module.css` → `.markdown hr`（`height: 0.5px` + `background: var(--dsw-alias-border-l2)`） |

`--dsw-font-xs-13` 在官方样式表里以 `font:` 简写消费（ReadBlock、DiffBlock、SearchBlock、WebBlock……），
本仓库只用其中的 13px/20px 两条，因此写成 `font-size` + `line-height`，避免简写把 `font-family` 也一起覆盖。

**本仓库建议值（非官方数值）：**

- 键列与值列之间的 `column-gap: 12px`：官方没有这种两列布局可抄，取 4 的倍数（4×3）。12px 是「键是短词（2–4 字）时仍能一眼分清两列」的最小距离。
- 每行 `padding: 4px 0`：官方列表项（Menu `.item` 的 `padding: 8px 10px`）是为可点击行设计的，键值行不可点击，取 4px（4×1）；行高本身由 13/20 与 14/22 的行盒撑开，行与行之间约 8px 呼吸。
- `grid-template-columns: minmax(0, max-content) minmax(0, 1fr)`：官方没有对应布局，这是本仓库为「键短值长」选的分配方式；`minmax(0, …)` 是为了让两列都能收缩到 0 以下不溢出（`min-width: auto` 的默认值会让长 URL 撑破容器）。
- `overflow-wrap: break-word`（值）：官方文件未对普通文本使用该属性；无空格的长 URL / 路径必须能断行。
- `divider` 用相邻兄弟选择器画在行与行之间：官方 `.markdown hr` 是独立横线元素，没有「行分隔」写法，本仓库用 `.item + .item` 让第一行之前不出现线。

实现为本仓库原创：用 grid + data 属性 (`.list[data-align]` / `[data-value-align]` / `[data-divider]`) 组织规则，几何等价但非官方 CSS 的复制。

## 可访问性要点

- **语义来自原生元素**：`<dl>` / `<dt>` / `<dd>` 让屏幕阅读器把每对键值读成「术语 — 描述」，不需要 `role` 或 `aria-*`。这也是不用一堆 `<div>` + `<span>` 的原因。
- 不要给 `<dl>` 加 `aria-label` 之外的额外角色；如果要给整组起名（例如「请求头」），用外层 `<section aria-labelledby>` 或直接给 `<dl>` 加 `aria-label="请求头"`。
- **不设置任何焦点与交互**：键值对是纯展示内容。如果值是一个链接或按钮，把可交互元素放进 `<dd>` 并保证它有可读文本。
- 值的颜色（`--dsw-alias-label-primary`）与键的颜色（`--dsw-alias-label-tertiary`）在两种主题下都由宿主 token 保证对比度；不要在 `value` 里再套一层颜色 span 把它调淡。
- 长值会换行而不是被截断（`overflow-wrap: break-word`），避免出现「复制不到完整值」的情况。
