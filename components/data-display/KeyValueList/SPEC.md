# KeyValueList · SPEC

- id: key-value-list
- category: data-display
- source: `components/data-display/KeyValueList/`（`index.tsx` / `key-value-list.module.css`）
- official-counterpart: 无。官方 `@deepseek-ai/dsh-client-ui-primitives/lib/index.js` 的导出列表里没有 KeyValueList；几何逐条锚定官方既有选择器（见下）
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

逐条读作「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| 键 `font-size: 13px`、`line-height: 20px` | 官方合成 token `--dsw-font-xs-13`；官方消费点见 `ReadBlock.module.css` → `.count`（`font: var(--dsw-font-xs-13)`） |
| 键色 `var(--dsw-alias-label-tertiary)` | `Menu.module.css` → `.label`（三级文字取色） |
| 值 `font-size: 14px`、`line-height: 22px` | `Button.module.css` → `.button`（等价于合成 token `--dsw-font-s-14`） |
| 值色 `var(--dsw-alias-label-primary)` | `Button.module.css` → `.button` |
| 分隔线 `0.5px solid var(--dsw-alias-border-l2)` | `markdown/MarkdownText.module.css` → `.markdown hr`（`height: 0.5px` + `background: var(--dsw-alias-border-l2)`） |

`--dsw-font-xs-13` 在官方样式表里以 `font:` 简写消费（ReadBlock、DiffBlock、SearchBlock、WebBlock……），本仓库只用其中的 13px/20px 两条，因此写成 `font-size` + `line-height`，避免简写把 `font-family` 也一起覆盖。

### 本仓库建议值（非官方数值）

- 键列与值列之间的 `column-gap: 12px`：官方没有这种两列布局可抄，取 4 的倍数（4×3）。12px 是「键是短词（2–4 字）时仍能一眼分清两列」的最小距离。
- 每行 `padding: 4px 0`：官方列表项（Menu `.item` 的 `padding: 8px 10px`）是为可点击行设计的，键值行不可点击，取 4px（4×1）；行高本身由 13/20 与 14/22 的行盒撑开，行与行之间约 8px 呼吸。
- `grid-template-columns: minmax(0, max-content) minmax(0, 1fr)`：官方没有对应布局，这是本仓库为「键短值长」选的分配方式；`minmax(0, …)` 是为了让两列都能收缩到 0 以下不溢出（`min-width: auto` 的默认值会让长 URL 撑破容器）。
- `overflow-wrap: break-word`（值）：官方文件未对普通文本使用该属性；无空格的长 URL / 路径必须能断行。
- `divider` 用相邻兄弟选择器画在行与行之间：官方 `.markdown hr` 是独立横线元素，没有「行分隔」写法，本仓库用 `.item + .item` 让第一行之前不出现线。

### 实现说明

实现为本仓库原创：用 grid + data 属性（`.list[data-align]` / `[data-value-align]` / `[data-divider]`）组织规则，几何等价但非官方 CSS 的复制。

## api

`KeyValueListProps extends HTMLAttributes<HTMLDListElement>`，`forwardRef<HTMLDListElement, KeyValueListProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `KeyValueItem[]`（`{ key: ReactNode; value: ReactNode }`） | 必填 | 按传入顺序渲染，不排序、不去重 |
| `align` | `'start' \| 'center'` | `'center'` | 键与值的垂直对齐；值换行成多行时影响明显 |
| `valueAlign` | `'start' \| 'end'` | `'start'` | 值列水平对齐；`end` 把整列贴到容器右缘 |
| `divider` | `boolean` | `false` | 行间画 0.5px hairline（第一行之前不画） |
| `className` | `string` | 无 | 与内部类名拼接，供外部布局使用 |
| 其余 | `HTMLAttributes<HTMLDListElement>` | — | `aria-label` 等原样透传到 `<dl>` |
| `ref` | `Ref<HTMLDListElement>` | 无 | 透传到 `<dl>` |

`KeyValueItem` / `KeyValueListAlign` / `KeyValueListValueAlign` 为导出的类型别名。行内用 `index` 作为 React key（静态展示数据，不重排、不增删）。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认 | — | 根元素 `<dl>` 为纵向 flex，每行是 `<div>` 包住 `<dt>` / `<dd>` |
| 垂直居中 | `align === 'center'`（默认） | 行 `align-items: center` |
| 顶部对齐 | `align === 'start'` | 行 `align-items: start`，值换行成多行时键仍贴顶 |
| 值靠左 | `valueAlign === 'start'`（默认） | 值紧跟键列 |
| 值靠右 | `valueAlign === 'end'` | 值列 `justify-self: end` + `text-align: end`，整列贴住容器右缘 |
| 有分隔线 | `divider === true` | `.item + .item` 加 `border-top: 0.5px solid var(--dsw-alias-border-l2)`；第一行之前无线 |
| 无分隔线 | `divider === false`（默认） | 不输出 `data-divider` |
| 长值 | 值超过剩余宽度 | `overflow-wrap: break-word` 折行，不撑破容器 |
| 交互态 | — | 本组件无 hover / active / focus / disabled；不可聚焦、不进入 Tab 顺序 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-tertiary` — 键文字色
- `--dsw-alias-label-primary` — 值文字色
- `--dsw-alias-border-l2` — 分隔线颜色

组件级 CSS 变量（本仓库内部，不是 DSH token；定义在 `.list`）：

- `--dsh-kv-column-gap` = `12px`
- `--dsh-kv-row-padding` = `4px`

## a11y

- 语义来自原生元素：`<dl>` / `<dt>` / `<dd>` 让屏幕阅读器把每对键值读成「术语 — 描述」，不需要 `role` 或 `aria-*`。这是不用 `<div>` + `<span>` 拼写的原因。
- 需要给整组起名（例如「请求头」）时，用外层 `<section aria-labelledby>` 或直接给 `<dl>` 传 `aria-label`；不要给 `<dt>` / `<dd>` 另加角色。
- 不设置任何焦点与交互：键值对是纯展示内容。如果值本身是链接或按钮，把可交互元素放进 `<dd>` 并保证它有可读文本。
- 值色 `--dsw-alias-label-primary` 与键色 `--dsw-alias-label-tertiary` 在两种主题下都由宿主 token 保证对比度；不要在 `value` 里再套一层改色元素把它调淡。
- 长值折行而不是截断（`overflow-wrap: break-word`），避免出现「复制不到完整值」的情况。
- `dd` 的默认 `margin-inline-start` 已清零，避免浏览器默认缩进破坏两列对齐。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 根元素是 `<dl>`，每条键值由 `<dt>` 与 `<dd>` 承载，且两者被同一个分组元素包住。
2. `<dl>` / `<dt>` / `<dd>` 上除外部透传外不输出 `role`。
3. `items` 按传入顺序渲染：源码中不得对 `items` 调用 `sort` / `filter` / `reverse`。
4. `divider === true` 时，分隔线只落在 `.item + .item` 上，第一行之前没有线。
5. `valueAlign === 'end'` 时，值列同时声明 `justify-self: end` 与 `text-align: end`。
6. 值元素声明 `overflow-wrap: break-word`。
7. 键与值元素均声明 `min-width: 0`（grid 子项可收缩，不溢出容器）。
8. `<dd>` 的 `margin` 被清零（`margin: 0`），不保留浏览器默认的 `margin-inline-start`。
9. 组件不输出 `tabIndex`、不绑定 `onClick` / `onKeyDown`（纯展示）。
10. 值文本不得被额外的一层改色元素包住（人审，见 `README.md`「怎么用得好」）。
11. 字段顺序由调用方在传入 `items` 前决定；组件不得依赖重排来「理顺」顺序（与第 3 条同源，人审）。

## demo

- `components/data-display/KeyValueList/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
