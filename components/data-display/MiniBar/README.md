# MiniBar 迷你条形图 / 进度条

一条水平轨道 + 填充，用来在列表行里表达「占了多少」。

## 是什么

一个 `role="progressbar"` 的 `<div>`：内部是轨道（`.track`）和填充（`.fill`），填充宽度按 `value / max` 计算；可选在右侧显示取整后的百分比文本。
零依赖，只用到 `react` 和 CSS Modules。官方 `dsh-client-ui-primitives` 没有对应组件，
几何按官方若干选择器拼装（见「几何来源」）。

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | 必填 | 当前值；超出 `[0, max]` 会被夹紧，非有限数按 0 |
| `max` | `number` | `100` | 满值；`<= 0` 时按 0 处理，进度恒为 0 |
| `showPercent` | `boolean` | `false` | 右侧显示百分比文本（`Math.round` 取整） |
| `tone` | `'business' \| 'success' \| 'warn' \| 'error'` | `'business'` | 填充的语义色 |
| `label` | `string` | — | 可访问名称；也可直接传 `aria-label`（未同时传 `label` 时生效） |

百分比文本按 `Math.round` 取整：`0.4%` 会显示成 `0%`，但填充宽度仍是精确值。需要更精确的读法就传 `aria-valuetext`。

## 什么时候用

- 列表行里表达占比：上下文窗口占用、缓存命中、磁盘使用、任务进度。
- 与 `StatRow` 搭配：`StatRow` 给标签和数字，`MiniBar` 给同一指标的视觉比例。
- 需要一眼看出「接近满了」的场景：`tone="warn"` / `tone="error"`。

## 什么时候不要用

- 多组数据横向对比：那是条形图（一组条按同一基线对齐），MiniBar 只有一条轨道。
- 数值本身已经足够、比例没有意义：只写数字或 `StatRow` 就好，多余的条形是噪声。
- 需要用户拖动改变数值：这是只读展示元素，不是滑块。
- 需要精确读数的仪表：百分比文本会取整，精确值请放在旁边的文本里。

## 几何来源

官方没有 MiniBar，以下数值逐条读自官方文件：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| 圆角 `border-radius: 999px` | 官方 `Tag.module.css` → `.tag`（胶囊几何） |
| 过渡 `transition: width 120ms ease` | 官方 `Switch.module.css` → `.thumb`（`transition: transform 120ms ease`，时长与缓动照抄） |
| 填充色 `var(--dsw-alias-state-business-primary)`（默认） | 官方 `Tag.module.css` → `.tag[data-tone='info']` 用的同一批状态主色 token（Tag 里这个 tone 叫 `info`，本组件叫 `business`）；取值见 `website/css/dsh-tokens.css` |
| `success` / `warn` / `error` 填充色 | 官方 `Tag.module.css` → `.tag[data-tone='success'\|'warning'\|'danger']` 的同批 token（`--dsw-alias-state-{success,warn,error}-primary`；Tag 里 warn 写作 `warning`） |
| 百分比文本 `font-size: 12px`、`line-height: 18px` | 官方 `Button.module.css` → `.sm` |
| 百分比文本色 `var(--dsw-alias-label-tertiary)` | 官方 `Menu.module.css` → `.label`（三级文字取色） |

`prefers-reduced-motion: reduce` 时去掉过渡，做法与官方 `Toast.module.css` 一致（它在该媒体查询里只保留淡出）。

**本仓库建议值（非官方数值）：**

- 条高 `8px`：官方没有条形图可抄。取 8px 是 4 的倍数（保持全库间距/尺寸的栅格一致），且能与 32px 的 `StatRow` 行高搭配。更常见的 6px 更纤细，但不是 4 的倍数，本仓库不用；4px 在浅色轨道上太细、圆角几乎看不出来。
- 条形与百分比之间的 `gap: 8px`：4 的倍数，与 `StatRow` 的 `gap` 同值，两组件并排时不出现两套间距。
- 轨道色选 `var(--dsw-alias-border-l1)` 而不是 `var(--dsw-alias-bg-module-platform)`：前者是半透明叠加色（light `#0000000a`、dark `#ffffff0f`，见 `website/css/dsh-tokens.css`），能自适应它所在的任意表面；后者是不透明的固定表面色（light `#f9fafb`、dark `#353638`，同样见该文件），嵌在 `--dsw-alias-bg-layer-2` 卡片上时会和卡片底色对一个「近似但不相等」的灰，边缘显得脏。
  **代价要说清楚**：在浅色 `bg-layer-1` 上轨道只有约 `#f5f5f5`，非常淡。因此 MiniBar 不把「轨道可见性」当作信息载体——数值始终由 `aria-valuenow` / `aria-valuemax` 承载，需要视觉读数时加 `showPercent`。
- `overflow: hidden`（轨道）：官方没有对应写法。填充与轨道同为 999px 圆角，正常情况下不会溢出；加上它是为了防止极窄宽度下浏览器夹紧圆角时填充的方角露出来。
- `font-variant-numeric: tabular-nums`（百分比）：官方未使用该属性；多个条形纵向排列时，等宽数字让百分比列宽度不抖动。
- `aria-hidden="true"` 加在可见百分比上：`role="progressbar"` 的后代按 ARIA 规范已经是 presentational，这里显式标出是为了避免个别读屏实现把「82%」和 `aria-valuenow` 读两遍。
- 不变式：根元素即 `role="progressbar"`，`{...rest}` 先展开、计算出的 `aria-valuenow/min/max` 后写，保证这三个值永远由 `value`/`max` 推导，不会被外部 props 覆盖。

实现为本仓库原创：用 CSS 变量 + `data-tone` 属性组织规则（挑色写法参照官方 Tag），几何等价但非官方 CSS 的复制。

## 可访问性要点

- **必须给可访问名称**：`<MiniBar value={82} label="缓存命中率" />`，或直接传 `aria-label`。没有名字时读屏只会念出「进度条 82%」，用户不知道这是什么指标。
- `role="progressbar"` + `aria-valuemin={0}` + `aria-valuemax={max}` + `aria-valuenow={value}` 三者缺一不可：读屏靠 `valuenow / valuemax` 换算百分比，只给 `valuenow` 会被当成 0–100 解释。
- `value` 会被夹紧到 `[0, max]`，`aria-valuenow` 用的是夹紧后的值——不会出现 `aria-valuenow=150` 这种非法状态。
- `max <= 0` 时 `aria-valuemax` 是 0：这是退化输入（例如分母为 0 的比率）。此时请改成 `aria-valuetext="暂无数据"`，不要把「无法计算」显示成「0%」。
- `showPercent` 的可见文本标了 `aria-hidden`，所以**不要**用它当唯一的数值来源；数值要么在上面那条 `aria-*` 里，要么另写一段文本。
- 颜色不是唯一线索：`tone` 只改填充色。如果 `warn` / `error` 表达了「超标」这类必须知道的信息，请在旁边的文本里也写出来（例如 `StatRow` 的 `delta`）。
- 条形是纯展示元素，不可聚焦、不可交互；行内其他文本请保持正常 DOM 顺序，不要用 CSS `order` 打乱。
