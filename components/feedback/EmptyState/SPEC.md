# EmptyState · SPEC

- id: empty-state
- category: feedback
- source: `components/feedback/EmptyState/`（`index.tsx` / `empty-state.module.css`）
- official-counterpart: 无。`@deepseek-ai/dsh-client-ui-primitives/lib/` 下没有任何同名文件
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

写法为「数值 ← 文件名 选择器」：左列是箭头左侧，右列是「文件名 + 选择器」。
官方来源为 `@deepseek-ai/dsh-client-ui-primitives/lib/`。本组件没有官方对应物，下表只列有官方锚点的条目；其余全部在「本仓库建议值」一节。

| 数值 | 出处 |
| --- | --- |
| `font-size: 14px` / `line-height: 22px` | 官方合成 token `--dsw-font-s-14`（即 `14px/22px`）；官方消费点 `Button.module.css` → `.button` |
| `font-weight: 500` | `Modal.module.css` → `.title`（原注释：figma wt510，渲染 500） |
| `font: var(--dsw-font-xs-13)`（`13px/20px`，含字体族） | 官方合成 token `--dsw-font-xs-13`；官方消费点 `ReadBlock.module.css` → `.count` |
| `color: var(--dsw-alias-label-primary)`（标题） | `Modal.module.css` → `.title` |
| `color: var(--dsw-alias-label-secondary)`（说明） | 本仓库取色，取自语义层级（二级文字）；官方无同结构选择器可锚定 |
| `color: var(--dsw-alias-label-tertiary)`（图标位） | `Menu.module.css` → `.itemIcon`（官方次级 / 三级文字色的常见用法） |

### 本仓库建议值（非官方数值）

- `gap: 12px`：建议值。4 的倍数；同族间距里 8px 太紧（图标与标题贴在一起）、16px 太散。
- 标题与说明之间 `margin-top: 6px`：建议值。两者是同一段文案的两行，应当比 12px 的块间距更紧，取 flex `gap` 的一半节奏（`calc(-1 * 12px + 6px) = -6px` 抵消）。6 是 4 的倍数以外的值，这里刻意取，理由同上。
- 动作插槽 `margin-top: 16px`：建议值。动作与文字是两个层级，间距应当明显大于块内间距（12px），取 16px。
- 图标位 `32×32`：建议值。比本仓库 `Button` 的 `md` 高度（36px）略小一档；32 是 4 的倍数，图标本身通常传 24–32px 的线稿。
- 图标颜色 `--dsw-alias-label-tertiary`：建议值取色。空状态的图标是氛围而非信息，用三级文字色。
- `max-width: 280px`：建议值。空状态文案通常 1–2 行；280px 在 14px 字号下约 20 个汉字一行，超过就该分两行了。
- `padding: 32px 12px`：建议值，4 的倍数。空的容器需要呼吸感；左右 12px 是给「容器被压窄时文字不贴边」留的余量。
- `text-wrap: pretty`：建议值。避免最后一行孤字（orphan），不支持的浏览器会忽略这条，无副作用。
- `justify-content: center` + `width: auto`：建议值。flex 列容器的子项是 shrink-to-fit，所以标题 / 说明在自然宽度不足 280px 时会收缩到内容宽度再居中，`max-width` 只是长文本的上限——组件不会把文字拉满整行。

### 实现说明

- 本仓库实现为原创：几何用 `--dsh-empty-*` 变量承载，版式用 flex 列 + 负外边距微调，没有抄任何官方 CSS。
- 间距一律取 4 的倍数，例外只有标题与说明之间的 `6px`（理由见上）。

## api

`EmptyStateProps extends HTMLAttributes<HTMLDivElement>`，`forwardRef<HTMLDivElement, EmptyStateProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `icon` | `ReactNode` | 无 | 图标节点，渲染在 32×32 的图标位里；缺省则整个图标位不渲染 |
| `title` | `ReactNode` | 无（必填） | 标题，渲染为 `<p>`，14/22、字重 500 |
| `description` | `ReactNode` | 无 | 补充说明，13/20、次级色；缺省则不渲染 |
| `action` | `ReactNode` | 无 | 动作插槽，放在标题 / 说明下方，间距 16px，横向居中 |
| `className` | `string` | 无 | 与内部类名拼接 |
| 其余 | `HTMLAttributes<HTMLDivElement>` | — | `role` / `aria-hidden` / `aria-live` 等原样透传到根节点 |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到根节点 |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 完整形态 | `icon` + `title` + `description` + `action` 全传 | 图标位 → 标题（间距 12px）→ 说明（与标题间距 6px）→ 动作（间距 16px） |
| 极简形态 | 只传 `title` | 单行居中文本 |
| 无图标 | `icon` 未传 | `.icon` 节点不渲染，`gap` 由剩余子项之间承担 |
| 无说明 | `description` 未传 | `.description` 不渲染，负外边距一并消失 |
| 无动作 | `action` 未传 | `.action` 不渲染 |
| 长标题 | 文本自然宽度超过 280px | 在 `max-width` 处换行；`text-wrap: pretty` 生效 |
| 窄标题 | 文本自然宽度不足 280px | 子项收缩到内容宽度后居中，不撑满容器 |
| 无官方对应 | — | 组件的所有状态均为本仓库定义，不存在「官方状态」可对照 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-font-xs-13` — `.description` 的字体简写（`13px/20px`，含字体族）
- `--dsw-font-s-14` — 标题 14/22 所对应的合成 token；本仓库在 `.title` 中写成等价的 longhand（`font-size` + `line-height`），未直接引用该 token
- `--dsw-alias-label-primary` — `.title` 文字色
- `--dsw-alias-label-secondary` — `.description` 文字色
- `--dsw-alias-label-tertiary` — `.icon` 图标色

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-empty-icon-slot`（`32px`）
- `--dsh-empty-gap`（`12px`）
- `--dsh-empty-title-desc-gap`（`6px`）
- `--dsh-empty-action-gap`（`16px`）
- `--dsh-empty-max-w`（`280px`）
- `--dsh-empty-pad-y`（`32px`）/ `--dsh-empty-pad-x`（`12px`）

## a11y

- 图标位带 `aria-hidden="true"`：图标只是氛围，语义由标题和说明承担；不存在「只有一个图标、没有任何文字」的空状态。
- 标题渲染成 `<p>` 而不是 `<h2>`：空状态常出现在文章结构中间，硬塞一个标题层级会破坏页面的标题大纲。需要参与大纲时，调用方在空状态外面放自己的标题。
- 空状态往往是异步出现的（点了筛选、删了最后一条）。需要播报时由调用方把 `role="status"` 透传到根节点；`status` 是礼貌播报，不打断当前朗读。
- 如果整块空状态只是视觉占位、内容已由别处播报，由调用方给根节点加 `aria-hidden="true"`，避免读两遍。
- 动作插槽里的按钮：仅图标按钮需要 `aria-label`，装饰图标 `aria-hidden`（`AC-MF-14`）。
- 对比度：`--dsw-alias-label-tertiary` 在深色 / 浅色主题下都可能低于正文标准（`AC-MF-05`），所以它只用在图标上；标题与说明分别用 `primary` / `secondary`。
- 命中区结论：本组件自身不含可交互元素，命中区要求不作用于根节点；动作插槽里的控件由各自组件负责（`AC-MF-01`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `title` 未传时渲染结果为空状态块且无标题节点——调用方必传 `title`。
2. `icon` 未传时，源码不渲染 `.icon` 节点（无空占位元素）。
3. `description` 未传时，源码不渲染 `.description` 节点。
4. `action` 未传时，源码不渲染 `.action` 节点。
5. 传入 `icon` 时，图标位带 `aria-hidden="true"`（`AC-MF-14`；清单 `A49`）。
6. 标题节点是 `<p>`，不是 `<h1>`–`<h6>`。
7. `.empty` 为 flex 列容器且 `align-items: center` / `justify-content: center`，子项不铺满整行。
8. `.title` 与 `.description` 均带 `max-width`，长文本在容器内换行、不溢出（`AC-MF-15`；清单 `A50`）。
9. `.description` 的间距为 `calc(-1 * var(--dsh-empty-gap) + var(--dsh-empty-title-desc-gap))`，净值为 `6px`。
10. 根节点没有固定 `height`（只有 `padding` 与 `gap`），文本放大后不被裁切（`AC-RC-17`；清单 `B13`）。
11. 颜色全部来自 `--dsw-*` 语义 token，源码中无硬编码色值（清单 `A19` / `A23`）。
12. 说明文字字号为 `13px`，不小于 `B08` 的最小 12px，且与行高成对（`TK-MF-11`）。
13. `--dsh-empty-*` 之外的间距值不得出现在本组件样式中（自造间距统一走变量，取 4 的倍数或标题 / 说明之间的 6px）。

## demo

- `components/feedback/EmptyState/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A19`、`A23`、`A49`、`A50`、`B08`、`B13`）
