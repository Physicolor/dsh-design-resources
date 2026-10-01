# Pill · SPEC

- id: pill
- category: controls
- source: `components/controls/Pill/`（`index.tsx` / `pill.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Pill.module.css` 与 `lib/index.js` 的 `function Pill`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 `Pill.module.css`，写法为「数值 ← 文件名 选择器」。

| 数值 | 出处 |
| --- | --- |
| `height: 24px` / `padding: 0 8px` / `gap: 4px` / `border-radius: 12px` / `font-size: 12px` / `line-height: 18px` | `Pill.module.css` → `.pill` |
| `border: none` / `color: var(--dsw-alias-label-secondary)` / `background: var(--dsw-alias-bg-layer-2)` | `Pill.module.css` → `.pill` |
| `cursor: pointer` | `Pill.module.css` → `.interactive` |
| `background: var(--dsw-alias-interactive-bg-hover)` | `Pill.module.css` → `.interactive:hover` |
| `color: var(--dsw-alias-label-primary)` / `background: var(--dsw-alias-button-ghost-active-fill)` / `box-shadow: inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)` | `Pill.module.css` → `.active` |
| `display: inline-flex` / `align-items: center` | `Pill.module.css` → `.pill` |
| 形态分岔：`onClick` 存在时渲染 `<button type="button">`，否则渲染 `<span>`；`active` 默认 `false` | `lib/index.js` → `function Pill({ active = false, className, children, onClick, ...rest })` |

### 本仓库建议值（非官方数值）

- `.pill` 上的 `box-sizing: border-box`：官方没有显式声明。Pill 没有 border（只有 `box-shadow` 内描边），所以这一条不改变任何官方几何，只是防止调用方在 `*` 选择器缺失时把尺寸算错。
- `.interactive:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }`：官方 `Pill.module.css` 没有焦点样式。可点击的 Pill 是一个真正的按钮，键盘用户按 Tab 走到它时必须有可见落点。写法直接对齐官方 `Switch.module.css` 的 `:focus-visible`，全库统一。依据 `spec/60-accessibility.md` 的 `AC-MF-10` / `AC-MF-11`。

### 本仓库决策（改写官方行为）

- 官方 `function Pill` 无条件把 `className` 拼接进 class 列表；本仓库只在 `onClick` 分支追加外部 `className`，静态 `<span>` 分支的 `className` 被丢弃。这是既有实现行为，与官方不一致，记录在此以免被当成有意忽略。

### 实现说明

- 本仓库实现为原创：几何由 `.pill` 上的组件级 CSS 变量承载（`--dsh-pill-height` / `--dsh-pill-pad-x` / `--dsh-pill-radius` / `--dsh-pill-gap` / `--dsh-pill-font-size` / `--dsh-pill-line-height`），状态由 `.active` / `.interactive` 两个类切换。几何等价于官方，但不是官方 CSS 的复制。
- `--dsh-pill-*` 是本仓库内部变量，不是 DSH token。

## api

`PillProps` 是判别联合，判别键为 `onClick` 是否存在。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `active` | `boolean` | `false` | 选中态，受控；组件只画状态，不持有状态 |
| `children` | `ReactNode` | 无 | 胶囊内容，通常是短文本或「图标 + 短文本」 |
| `className` | `string` | 无 | 追加到根节点的 class，用于外部布局定位 |
| `onClick` | `ButtonHTMLAttributes<HTMLButtonElement>['onClick']` | 无 | 存在即渲染 `<button type="button">`；不传则渲染 `<span>`，且类型层面禁止再传 |
| 其余（交互分支） | `ButtonHTMLAttributes<HTMLButtonElement>` | — | 全部 `button` 原生属性透传 |
| 其余（静态分支） | `HTMLAttributes<HTMLSpanElement>` | — | 全部 `span` 原生属性透传 |
| `ref` | `Ref<HTMLButtonElement \| HTMLSpanElement>` | 无 | 按分支透传到根节点 |

`PillBaseProps` / `InteractivePillProps` / `StaticPillProps` 为导出的类型别名。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认（未选中） | `.pill` | `border: none`；`background: var(--dsw-alias-bg-layer-2)`；`color: var(--dsw-alias-label-secondary)` |
| hover | `.interactive:hover` | `background: var(--dsw-alias-interactive-bg-hover)` |
| active（选中） | `.active` | 文字升到 `--dsw-alias-label-primary`；底色换 `--dsw-alias-button-ghost-active-fill`；叠 `inset 0 0 0 1px --dsw-alias-button-ghost-active-border` |
| 键盘焦点 | `.interactive:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`（本仓库建议值） |
| 静态 | 未传 `onClick` | 渲染 `<span>`，无 `cursor: pointer`、无 hover、无焦点态 |
| 按下 | 无 | 官方与实现均未定义 `:active`；`CT-MF-07` 的五态里这一态缺失 |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-bg-layer-2` — 未选中底色
- `--dsw-alias-label-secondary` — 未选中文字色
- `--dsw-alias-interactive-bg-hover` — 可点击胶囊的悬停底色
- `--dsw-alias-label-primary` — 选中态文字色
- `--dsw-alias-button-ghost-active-fill` — 选中态底色
- `--dsw-alias-button-ghost-active-border` — 选中态内描边色
- `--dsw-alias-brand-primary` — 焦点环颜色（本仓库建议值）

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-pill-height`（`24px`）
- `--dsh-pill-pad-x`（`8px`）
- `--dsh-pill-radius`（`12px`）
- `--dsh-pill-gap`（`4px`）
- `--dsh-pill-font-size`（`12px`）
- `--dsh-pill-line-height`（`18px`）

## a11y

- 可点击形态是原生 `<button type="button">`：Enter / Space 天然可触发，不需要自行绑 `keydown`；默认 `type` 为 `button`，不会在 `<form>` 中意外提交。
- 静态形态是 `<span>`，不是按钮也不是链接；不得给它挂 `role="button"`，需要点击时直接改用可点击形态。
- `active` 只改颜色与内描边，辅助技术读不到。作为单选组使用时，需要由调用方提供 `role="radiogroup"` + 每枚 `role="radio"` + `aria-checked`（或 `aria-pressed`）。
- 只有图标没有文字的胶囊必须有可访问名称，否则读屏读到的是空名字。
- 焦点环用 `outline` 而不是 `box-shadow`，避免被父级 `overflow: hidden` 裁掉。
- 命中区：高度 24px，低于 `AC-MF-01` 的常规控件目标 28×28，也低于最小命中区 20×20；纵向命中区依赖调用方留白或扩展热区（见 `checks` 第 5 条）。
- 对比度：未选中是 `label-secondary` 配 `bg-layer-2`，选中是 `label-primary` 配 `button-ghost-active-fill`，两套都随主题走，不得自行覆盖颜色（`AC-MF-08`）。
- 选中态与非选中态之间存在填充 + 内描边的形状差异，转灰度后仍可区分（`AC-MF-07`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `active` 为真时同时具备三项：文字色 `--dsw-alias-label-primary`、底色 `--dsw-alias-button-ghost-active-fill`、`inset 0 0 0 1px --dsw-alias-button-ghost-active-border`。
2. 传了 `onClick` 时根节点为 `<button>` 且 `type="button"`；未传时为 `<span>` 且不带 `role`、`tabIndex`、`onKeyDown`（对应 `CT-MF-11`：不得用 span 冒充按钮）。
3. 未传 `onClick` 时 `onClick` 可以是 `undefined`；传了之后其类型非空（判别联合的两条分支都成立）。
4. 存在 `:focus-visible` 焦点样式，且不以 `outline: none` 移除后无替代（`AC-MF-10`）。
5. 焦点环规格为 2px 实线 + `--dsw-alias-brand-primary` + 2px 外偏移（`AC-MF-11`）。
6. 只有图标（无文本子节点）的可点击胶囊存在可访问名称。
7. 可点击胶囊的 `.pill` 计算高度按 `CT-MF-01` 复用官方几何，不得被外部覆盖为 36px 或 28px。
8. 源码中不出现硬编码色值（`TK-MF-01`）与字面 `font-size` 之外的色值声明。
9. 静态胶囊不得绑定点击（`CT-MF-04` 的同源约束：标记不是按钮）。
10. 同一组互斥胶囊中至多一枚 `active` 为真（人审 + 宿主状态检查）。

## demo

- `components/controls/Pill/demo.html`

## 真实场景（docs/reference 截图核对）

| 图 | 区域 | 上下文 | 实拍 |
| --- | --- | --- | --- |
| `07-composer.png` | 输入卡底部工具行 | 「完全权限」（盾牌图标 + 文案 + 下拉箭头） | 高 24 |
| `07-composer.png` | 输入卡底部工具行 | 「DeepSeek V4.1 Flash High」+ 下拉箭头 | 高 24 |
| `01-hero.png` | 新会话页输入卡 | 同上的两枚 | 高 24 |

### 已知偏差（截图核对新增）

- 两处胶囊都落在**白色卡片**上，而浅色主题的 `--dsw-alias-bg-layer-2` 就是 `#fff` —— 截图上因此**看不到填充边界**，只能量到内容（图标 16 / 文案 / 箭头）的墨迹。也就是说：不能靠「有没有底色」判断页面上有没有 Pill。
- 「外观」三选一（浅色 / 深色 / 跟随系统）在 `03-settings-open.png` 里实拍是 **185 × 72 的带框图块**，不是 Pill；那个控件在本仓库归 `proposed` 的 `SegmentedControl`。`Pill` 与它无关。
- `06-plugins.png` 每行插件名后的「实验性」是 **Tag**（`tone=info`），也不是 Pill —— 两者高 24 与高 19、填充色完全不同。
- 截图里没有任何一枚胶囊处于选中态，`.active` 的观感（`ghost-active-fill` + `inset 0 0 0 1px`）没有实拍依据。

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A17`、`A18`、`A43`、`A46`、`A47`、`A48`、`A49`）
