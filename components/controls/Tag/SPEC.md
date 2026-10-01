# Tag · SPEC

- id: tag
- category: controls
- source: `components/controls/Tag/`（`index.tsx` / `tag.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Tag.module.css` 与 `lib/index.js` 的 `function Tag`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 `Tag.module.css`，写法为「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| `border-radius: 999px` / `corner-shape: round` / `padding: 1px 8px` / `font-size: 11px` / `line-height: 17px` / `font-weight: 500` / `white-space: nowrap` | `Tag.module.css` → `.tag` |
| `display: inline-flex` / `align-items: center` | `Tag.module.css` → `.tag` |
| `border: 0.5px solid var(--dsw-alias-border-l4)` / `color: var(--dsw-alias-label-tertiary)` | `Tag.module.css` → `.tag[data-tone='outline']` |
| `background: var(--dsw-alias-label-primary)` / `color: var(--dsw-alias-bg-layer-3)` | `Tag.module.css` → `.tag[data-tone='solid']` |
| `background: var(--dsw-alias-bg-module-platform)` / `color: var(--dsw-alias-label-secondary)` | `Tag.module.css` → `.tag[data-tone='neutral']` |
| `color: var(--dsw-alias-label-tertiary)` | `Tag.module.css` → `.tag[data-tone='quiet']` |
| `color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent)` + 同色文字 | `Tag.module.css` → `.tag[data-tone='success']` |
| `color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent)` + 同色文字 | `Tag.module.css` → `.tag[data-tone='info']` |
| `color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent)` + 同色文字 | `Tag.module.css` → `.tag[data-tone='warning']` |
| `color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent)` + 同色文字 | `Tag.module.css` → `.tag[data-tone='danger']` |
| 渲染形态：`<span>` + `data-tone`，`tone` 默认 `outline`，外部 `className` 与官方 class 拼接 | `lib/index.js` → `function Tag({ tone = "outline", className, children })` |

官方源码注释的两条理由（`Tag.module.css` 顶部）：胶囊几何是固定的（一个 tag 到哪里都读作同一个尺寸，只有 palette 变）；状态色的填充由文字色混合而来，所以 palette 一改填充和文字一起动，不需要第二个 token。`10%` 是通用值，`warning` 保持 `12%` 是为了和插件清单里已有的条件标签对齐。

### 本仓库建议值（非官方数值）

- `.tag` 上的 `box-sizing: border-box`：官方没有显式声明。`outline` 是唯一带 `border` 的 tone（`0.5px`），没有 `border-box` 时它比其余 7 个 tone 高 1px、宽 1px，同一行里会看出参差。加这一条是给 8 个 tone 拉平外框，不改变任何单个 tone 的官方数值。
- `.tag` 上的 `font-family: inherit`：官方未声明。`<span>` 本身就会继承，写出来只是为了在这个标签被放进 `<button>` / `<input>` 等不会自动继承字体的容器里时也保持一致。

### 实现说明

- 本仓库实现为原创：几何由 `.tag` 上的组件级 CSS 变量承载（`--dsh-tag-radius` / `--dsh-tag-pad-y` / `--dsh-tag-pad-x` / `--dsh-tag-font-size` / `--dsh-tag-line-height` / `--dsh-tag-font-weight`），配色由 8 个 `data-tone` 属性选择器切换。选择器结构与官方一致，但未复制官方 CSS 源码。
- `--dsh-tag-*` 是本仓库内部变量，不是 DSH token。
- `font-size: 11px` 无对应 `--dsw-font-*` 令牌（已核实的令牌清单最小为 12）；按 `TK-RC-04` 的口径，无对应令牌的字号应直接复用官方组件，本仓库的做法是原样采用官方几何 `11px` / `17px`，不新增自造令牌。

## api

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tone` | `'outline' \| 'solid' \| 'neutral' \| 'quiet' \| 'success' \| 'info' \| 'warning' \| 'danger'` | `'outline'` | 调色板；落在根节点的 `data-tone` 上 |
| `children` | `ReactNode` | 无 | 标签文案，由调用方负责本地化 |
| `className` | `string` | 无 | 追加到根节点的 class，用于外部布局定位 |
| 其余 | `HTMLAttributes<HTMLSpanElement>` | — | 原样透传到 `<span>` |
| `ref` | `Ref<HTMLSpanElement>` | 无 | 透传到根节点 |

`TagTone` 为导出的类型别名。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认 | `tone='outline'` | `border: 0.5px solid var(--dsw-alias-border-l4)`；`color: var(--dsw-alias-label-tertiary)` |
| 中性 | `tone='neutral'` | `background: var(--dsw-alias-bg-module-platform)`；`color: var(--dsw-alias-label-secondary)` |
| 最安静 | `tone='quiet'` | 无底色、无描边，只有 `--dsw-alias-label-tertiary` 文字 |
| 反色 | `tone='solid'` | 底色 `--dsw-alias-label-primary`，文字 `--dsw-alias-bg-layer-3` |
| 成功 / 信息 / 警告 / 失败 | `tone='success' \| 'info' \| 'warning' \| 'danger'` | `color-mix` 10%（`warning` 为 12%）透明底 + 同色文字 |
| hover / active / focus-visible / disabled | — | 均不定义。Tag 是只读文本，没有交互态 |

## tokens

DSH 语义 token：

- `--dsw-alias-border-l4` — `outline` 的描边色
- `--dsw-alias-label-tertiary` — `outline` / `quiet` 的文字色
- `--dsw-alias-label-secondary` — `neutral` 的文字色
- `--dsw-alias-bg-module-platform` — `neutral` 的底色
- `--dsw-alias-label-primary` — `solid` 的底色
- `--dsw-alias-bg-layer-3` — `solid` 的文字色
- `--dsw-alias-state-success-primary` — `success` 的文字色与填充来源
- `--dsw-alias-state-business-primary` — `info` 的文字色与填充来源
- `--dsw-alias-state-warn-primary` — `warning` 的文字色与填充来源
- `--dsw-alias-state-error-primary` — `danger` 的文字色与填充来源

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-tag-radius`（`999px`）
- `--dsh-tag-pad-y`（`1px`）
- `--dsh-tag-pad-x`（`8px`）
- `--dsh-tag-font-size`（`11px`）
- `--dsh-tag-line-height`（`17px`）
- `--dsh-tag-font-weight`（`500`）

## a11y

- Tag 是只读文本，不是控件：没有 `role`、没有 `tabindex`，这是正确状态。不得为「看起来能点」而给它加 `onClick`（`CT-MF-04`：Tag 不得绑定点击动作）。
- 视觉高度约 19px（17px 行高 + 上下各 1px 内边距），低于 `AC-MF-01` 的最小命中区 20×20；因此纯标记 Tag 不得可点击。若确实需要可点击的标记，改用 Pill 或把热区显式扩展到不小于 20×20（`AC-MF-02`）。
- 颜色不能是唯一的信息载体：`success` 与 `danger` 的差别若只靠红绿，色觉障碍用户读不出。文案本身要写清楚（「构建失败」而不是「构建」）（`AC-MF-07`）。
- 用 `solid` 标出当前项时，反色同样不够：同一组里应让该项同时带上 `aria-current="true"` 或等价的文本标记（`AC-MF-07`）。
- 把 Tag 放进可点击的父元素时，焦点属于父元素，Tag 自身不会单独获得焦点。
- 对比度：`quiet` 与 `outline` 使用 `label-tertiary`，属于最低对比的一档，只适合辅助信息，不得用来承载关键状态（`AC-MF-05`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 根节点是 `<span>`，且不带 `role`、`tabIndex`、`onClick`、`onKeyDown`（`CT-MF-04`、`CT-MF-11`）。
2. `data-tone` 取值落在 8 个枚举之内，未传时默认 `outline`。
3. `tone` 的 8 个分支各自只声明 `background` / `border` / `color`，不含几何属性（几何固定，只有 palette 变）。
4. 状态 tone 的填充与文字来自同一个 `--dsw-alias-state-*-primary` token，且 `color-mix` 透明度为 10%（`warning` 为 12%）。
5. `.tag` 上存在 `box-sizing: border-box`（本仓库建议值；缺失时 8 个 tone 的外框差 1px）。
6. 8 个 tone 的声明中不出现硬编码色值（`TK-MF-01`）。
7. 不出现 `font-size` 或 `line-height` 的字面值改动，几何保持 `11px` / `17px`（`CT-MF-12`）。
8. `white-space: nowrap` 未被移除（移除后长文案会与其他控件混排，违背单行胶囊定位）。
9. 可点击的 Tag 实例为零；若出现，其命中区必须不小于 20×20（`AC-MF-01`、`AC-MF-02`）。
10. `solid` 用于标注当前项时，该项同时带有 `aria-current` 或等价文本标记（人审 + 属性扫描）。

## demo

- `components/controls/Tag/demo.html`

## 真实场景（docs/reference 截图核对）

| 图 | 区域 | 上下文 | 实拍 | tone |
| --- | --- | --- | --- | --- |
| `06-plugins.png` | 官方分组行，插件名之后 | 「实验性」 | 42 × 18 | `info` |
| `01-hero.png` | Hero 标语「探索未至之境」之后 | 「预览版」 | 50 × 19 | `info` |

核对结论：源码几何 `padding 1px 8px` + `line-height 17px` = **19px** 高，与实拍 18–19px 一致；3 个汉字实拍墨迹宽 30px（≈ 11px/字），与 `font-size: 11px` 一致。

### 已知偏差（截图核对新增）

- 横向内边距实测约 **6px**（`预览版`：50 − 36 = 14，两侧各 7）；源码写的是 `8px`。差 1–2px，落在浅色底与抗锯齿混合后被阈值切掉的量级内，**未改动源码数值**，仅记录。
- 截图里只出现过 `info` 一种 tone。其余 7 个 tone（`outline` / `solid` / `neutral` / `quiet` / `success` / `warning` / `danger`）在 demo 中已标注「截图未覆盖」。
- `06-plugins.png` 的「官方 8」「已安装 11」是分组标题里的计数文字，不是 Tag。

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A17`、`A43`、`A45`、`A46`）
