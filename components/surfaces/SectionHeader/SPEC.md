# SectionHeader · SPEC

- id: sectionheader
- category: surfaces
- source: `components/surfaces/SectionHeader/`（`index.tsx` / `sectionheader.module.css`）
- official-counterpart: 官方没有这个组件；副标题与 hairline 借用已核实的官方选择器，标题字号来自官方设置页实测（见下）
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 primitives 包与官方设置页实测，写法为「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| 副标题 `font: var(--dsw-font-xs-13)`（13px / 20px） | ← `ReadBlock.module.css` `.count`、`.copyButton`（官方对这条合成 token 的实际用法）；token 本体定义在官方主题，demo 脚手架的 `:root` 里逐字内联 |
| 副标题色 `var(--dsw-alias-label-tertiary)` | ← `Menu.module.css` `.label`；`ReadBlock.module.css` `.count` / `.lang`（官方把补充说明设为该 token） |
| `border-bottom: 0.5px solid var(--dsw-alias-border-l2)` | ← `markdown/MarkdownText.module.css` `.markdown hr`（`height: 0.5px` + `background: var(--dsw-alias-border-l2)`）；同款 hairline 写法见 `Menu.module.css` `.footer` 的 `border-top` |
| 标题色 `var(--dsw-alias-label-primary)` | ← `Modal.module.css` `.title` |
| 副标题的 `font` 简写写法（而不是 `font-size` + `line-height`） | ← `ReadBlock.module.css` `.count`（`font: var(--dsw-font-xs-13)`） |

### 本仓库建议值（非官方数值）

- **标题 `18px` + `font-weight: 600` + `line-height: 26px`：来自官方设置页的实测值，不是本仓库发明的。**
  锚点是官方设置页自己的表头——Agent Presets 与 Models 页的 `h2.<hash>_title` 与 `p.<hash>_intro`——对已发布的 Web UI 实测得到 `18px/26px/600 + var(--dsw-alias-label-primary)`。同一份实测还给出了副标题 `13px/20px` 与 hairline 的写法，记录见 dsh-ui-harmonizer 的 `docs/settings-section-style.md`（该文档标题即写明 "measured against the shipped web UI"）。
  为什么在官方 primitives 包里找不到这个字号：primitives 的 `.module.css` 里确实没有任何 `18px`（已逐文件确认），因为设置页样式在 `@deepseek-ai/dsh-client-ui-settings` 的构建产物中，而本机该包的 junction 已失效、读不到原文。**读不到原文不等于该数值没有官方依据**——依据来自对渲染结果的实测。
- `.sectionHeader { gap: 4px }`：4 的倍数，且 4px 是官方最小的间距档（`Button.module.css` `.button`、`Pill.module.css` `.pill` 的 `gap: 4px`）。
- `.sectionHeader { padding-bottom: 12px }`（副标题到 hairline 的距离）：4 的倍数；取 12px 与官方内联内容的纵向间距同档（`HoverCard.module.css` `.card` 纵向 `padding: 12px`、`ReadBlock.module.css` `.body` 纵向 `padding: 12px`）。再小（8px）hairline 会贴住文字降部，再大（16px）表头会显得空。
- `titleAs` 默认 `h2` 与 `description` 用 `<p>` 渲染：API 选择，不是数值。设置页的大纲是「页面 `h1` → 区块 `h2`」，所以默认 `h2`；视觉完全由 CSS 决定，改 `titleAs` 不会改字号。

### 本仓库决策（改写官方行为）

- 无。官方没有同名组件，本组件属新增。组件自身不带任何外边距（`margin` 交给使用方），只负责自己的高度与那条 hairline。

实现为本仓库原创（用 CSS 变量承载几何 + 一个容器同时表达标题、副标题与 hairline）。

## api

`SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'>`，`forwardRef<HTMLDivElement, SectionHeaderProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | 必填 | 区块标题，渲染成标题元素（级别由 `titleAs` 决定） |
| `description` | `ReactNode` | 无 | 标题下方一句话补充说明，13/20 三级色；不传则不渲染 |
| `titleAs` | `'h2' \| 'h3' \| 'h4'` | `'h2'` | 标题渲染成哪个级别的标题；只改标签，不改视觉 |
| `className` | `string` | 无 | 与内部类名拼接，追加在最后 |
| 其余 | `HTMLAttributes<HTMLDivElement>` | — | 除 `title` 外原样透传到根元素 |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到根元素 |

`SectionHeaderTitleAs` 为导出的类型别名。

## states

组件为静态结构，没有交互状态；下表是全部渲染分支。

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 有副标题 | `description != null` | 渲染 `.description`，`font: var(--dsw-font-xs-13)` + `--dsw-alias-label-tertiary` |
| 无副标题 | `description` 为 `null` / 未传 | 不渲染 `.description`，`.sectionHeader` 的 `padding-bottom` 与 hairline 保持不变 |
| 标题级别 | `titleAs` | 依次渲染为 `h2` / `h3` / `h4`，视觉不变 |
| hairline | 恒有 | `.sectionHeader` 自身的 `border-bottom: 0.5px solid var(--dsw-alias-border-l2)`，是装饰不承载语义 |
| 悬停 / 聚焦 / 禁用 | — | 组件不定义任何 `:hover` / `:focus` / `:disabled` 样式 |
| 合成 token 缺失 | 宿主未注入 `--dsw-font-xs-13` | `font` 简写整条声明无效，副标题退回继承字号（不崩版） |

## tokens

DSH 语义 token：

- `--dsw-alias-label-primary` — `.title` 颜色
- `--dsw-alias-label-tertiary` — `.description` 颜色
- `--dsw-alias-border-l2` — 底部 hairline 色
- `--dsw-font-xs-13` — `.description` 的 `font` 简写（合成 token，宿主注入；本仓库 `demo.html` 已在 `:root` 内联）

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-sh-title-size`（`18px`）
- `--dsh-sh-title-line`（`26px`）
- `--dsh-sh-title-weight`（`600`）
- `--dsh-sh-gap`（`4px`）
- `--dsh-sh-pad-bottom`（`12px`）

## a11y

- **标题必须是真标题**：`title` 渲染成 `<h2>`（`titleAs` 可改级别），这是屏幕阅读器在设置页里按标题跳转的锚点。不要把标题写成 `<div>` + 加粗。
- 按大纲选级别，不要按视觉选级别：字号由 CSS 固定，`titleAs` 只影响标签。页面 `h1` 只有一个，区块用 `h2`，区块内的子组用 `h3`。
- 副标题是补充，不是正文：不要把它当成唯一的信息载体（三级色 + 13px 对低视力用户可读性最差），关键约束（如「此操作不可撤销」）应放进正文或用状态的语义色。
- hairline 是装饰，不承载语义。区块之间的分隔不能只靠这条线，仍要有间距；也不要为过不了对比度的浅线调深颜色。
- `font: var(--dsw-font-xs-13)` 依赖宿主注入该合成 token：宿主没注入时这条声明整体无效，副标题会退回继承字号（不会崩版）。本仓库 `demo.html` 已在 `:root` 内联该 token。
- 组件内没有可聚焦元素，`AC-MF-10` / `AC-MF-11` 在本组件不适用。
- 副标题 13px 文本的对比度仍须满足 `AC-MF-05`（≤17pt 文本 ≥4.5:1）；该对比由三级色 token 的官方取值承担，本组件不得改用更低对比的自定义色。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `title` 为必填属性（类型中不可选）。
2. 渲染出的标题标签属于 `h2` / `h3` / `h4`，默认 `h2`。
3. `titleAs` 只影响标签：`.title` 的 `font-size` / `line-height` / `font-weight` 为固定声明，不随 `titleAs` 变化。
4. `.sectionHeader` 声明 `border-bottom: 0.5px solid var(--dsw-alias-border-l2)`。
5. `.sectionHeader` 不声明 `margin` / `margin-top` / `margin-bottom`（外边距交给使用方）。
6. `.description` 的颜色为 `--dsw-alias-label-tertiary`，`.title` 为 `--dsw-alias-label-primary`，两者不同色。
7. `.description` 使用 `font: var(--dsw-font-xs-13)` 简写，不退化为字面 px 字号（`TK-MF-02` 对字号令牌的要求；`.title` 的 18px 为本仓库建议值，见上）。
8. 标题与副标题容器 `gap: 4px`，`padding-bottom: 12px`。
9. `sectionheader.module.css` 中不出现十六进制颜色字面量（`#`）、`rgb(`、`hsl(`；颜色全部走 `var(--dsw-*)`。
10. 组件不 import 除 `react` 以外的任何运行时依赖（含 `@deepseek-ai/*`）。
11. 类名拼接顺序为「基础类 + 外部 className」，外部类名最后追加。
12. 组件内不出现 `:focus-visible`（无交互元素）。

## demo

- `components/surfaces/SectionHeader/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 相关条款：`spec/30-tokens.md`（`TK-MF-02`）、`spec/60-accessibility.md`（`AC-MF-05`、`AC-MF-10`、`AC-MF-11`）
- 标题字号实测记录：dsh-ui-harmonizer `docs/settings-section-style.md`
