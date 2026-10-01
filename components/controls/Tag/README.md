# Tag 标签

只读的小标签。全库只有一种尺寸，变化的只有配色。

## 是什么

一个 `<span>`，几何固定、配色由 `tone` 决定。配色全部通过 `data-tone` 属性选择器
切换（与官方一致），所以调用方仍然可以叠自己的 class 去调整摆放而不影响 palette。

TS 上用 `TagTone` 联合类型穷举 8 种 tone，默认 `outline`。

| tone | 观感 | 语义 |
| --- | --- | --- |
| `outline`（默认） | 0.5px 细描边 + 三级文字 | 只读的默认外观 |
| `solid` | 反色填充 | 一组里标出当前选中的那一个 |
| `neutral` | 平台灰底 | 纯中性事实，不带状态含义 |
| `quiet` | 只有文字，无底色 | 比 `neutral` 更安静的事实 |
| `success` | 绿色淡底 | 健康 / 已启用 |
| `info` | 蓝色淡底 | 信息性归类，不代表健康度 |
| `warning` | 琥珀色淡底 | 需要关注但还没失败 |
| `danger` | 红色淡底 | 已经失败 |

零依赖，只用到 `react` 和 CSS Modules。

## 什么时候用

- 给列表项、卡片、表格行加一小段元信息：版本号、许可证、体积、环境。
- 标注状态：「已启用」「待处理」「构建失败」。
- 在一组标签里用 `solid` 指出当前选中的那一个。

## 什么时候不要用

- 需要点击：用 `Pill`。Tag 是只读的 `<span>`，没有 hover 也没有焦点态。
- 表达开关状态：用 `Switch`。
- 放长句子或说明文字：Tag 是 `white-space: nowrap` 的单行胶囊，长文案会撑开布局。
  文案应由调用方截断。
- 当按钮用（「删除」这类动作）：用 `Button`。给它加 `onClick` 会造出一个
  没有键盘可达性的假按钮。
- 同一行堆超过 3~4 个：考虑改用纯文本或 `quiet`，颜色太多会淹掉真正的状态信号。

## 几何来源

全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/Tag.module.css`：

| 数值 | 出处（选择器） |
| --- | --- |
| `border-radius: 999px`、`corner-shape: round`、`padding: 1px 8px`、`font-size: 11px`、`line-height: 17px`、`font-weight: 500`、`white-space: nowrap` | `.tag` |
| `border: 0.5px solid var(--dsw-alias-border-l4)`、`color: var(--dsw-alias-label-tertiary)` | `.tag[data-tone='outline']` |
| `background: var(--dsw-alias-label-primary)`、`color: var(--dsw-alias-bg-layer-3)` | `.tag[data-tone='solid']` |
| `background: var(--dsw-alias-bg-module-platform)`、`color: var(--dsw-alias-label-secondary)` | `.tag[data-tone='neutral']` |
| `color: var(--dsw-alias-label-tertiary)` | `.tag[data-tone='quiet']` |
| `color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent)` + 同色文字 | `.tag[data-tone='success']` |
| `color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent)` + 同色文字 | `.tag[data-tone='info']` |
| `color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent)` + 同色文字 | `.tag[data-tone='warning']` |
| `color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent)` + 同色文字 | `.tag[data-tone='danger']` |

官方源码注释说明：胶囊几何是固定的（一个 tag 到哪里都读作同一个尺寸，只有 palette
变）；状态色的填充由文字色混合而来，所以 palette 一改填充和文字一起动，不需要第二个
token；10% 是通用值，`warning` 保持 12% 是为了和插件清单里已有的条件标签对齐。

**本仓库建议值（非官方数值）：**

- `.tag` 上的 `box-sizing: border-box`：官方没有显式声明。`outline` 是唯一带
  `border` 的 tone（`0.5px`），没有 `border-box` 时它比其余 7 个 tone 高 1px、
  宽 1px，同一行里会看出参差。加这一条是给 8 个 tone 拉平外框，不改变任何
  单个 tone 的官方数值。
- `font-family: inherit`：官方未声明。`<span>` 本身就会继承，写出来只是为了在
  这个标签被放进 `<button>` / `<input>` 等不会自动继承字体的容器里时也保持一致。

实现为本仓库原创（CSS 变量承载几何 + `data-tone` 属性选择器配色），
选择器结构与官方一致，但未复制官方 CSS 源码。

## 可访问性要点

- **Tag 是只读文本，不是控件**：没有 `role`、没有 tabindex，这是对的。不要为了
  「看起来能点」给它加 `onClick`。
- **颜色不能是唯一的信息载体**：`success` / `danger` 之间的差别如果只靠红绿，
  色觉障碍用户读不出。文案本身要写清楚（「构建失败」而不是「构建」）。
- **`solid` 用来标选中项时，光靠反色也不够**：同一组里如果用 `solid` 表示当前项，
  请让该项同时带上 `aria-current="true"`（或等价的文本标记）。
- **不要把 Tag 放进可点击的父元素里还期待它被单独聚焦**：它是文本，焦点属于父元素。
- 对比度：`quiet` / `outline` 用的是 `label-tertiary`，属于最低对比的一档，
  只适合辅助信息，不要用它承载关键状态。
