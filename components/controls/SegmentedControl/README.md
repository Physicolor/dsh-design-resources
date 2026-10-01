# SegmentedControl 分段控件

2–5 个互斥选项并排放在一个 4px 内边距的浅色容器里，选中的那一段带填充和描边。

## 是什么

一个受控组件：`value` 由宿主持有，`onChange` 只在选中项真的变了时才触发。

```tsx
const [view, setView] = useState<'list' | 'grid'>('list');

<SegmentedControl
  aria-label="视图"
  value={view}
  onChange={setView}
  options={[
    { value: 'list', label: '列表' },
    { value: 'grid', label: '网格' },
  ]}
/>
```

| prop | 说明 |
| --- | --- |
| `options` | `{ value, label, icon? }[]`，顺序即渲染顺序，`value` 需唯一 |
| `value` / `onChange` | 受控值；`onChange` 只在点/键盘选中另一段时回调 |
| `size` | `md`（默认，段高 36px）或 `sm`（段高 28px） |
| `disabled` | 整组禁用（原生 `disabled` + `aria-disabled`） |
| `aria-label` | 必填，加在 `role="radiogroup"` 的容器上 |
| `id` / `className` / `style` / `data-*` | 透传到容器，`className` 可覆盖局部变量微调段宽 |

键盘：`Tab` 进组一次，`←` `→`（以及 `↑` `↓` `Home` `End`）在段间移动，焦点与选中一起走，`Space` / `Enter` 选中当前段。

**为什么用 `radiogroup` / `radio` 而不是 `tablist` / `tab`**：两种语义都要求「一组互斥项、方向键移动、只有一个 Tab 落点」，本组件都满足。区别在结果：
`tablist` 的每一格必须用 `aria-controls` 指向一个 `tabpanel`，切换的是**可见内容**；本组件不渲染也不控制任何面板，它产出的只是一个值（`onChange`），这正是 `radiogroup` 的语义。
用 `tablist` 而不给 `tabpanel` 会让读屏播报「选项卡 1/2」却找不到对应面板，属于语义撒谎。选 radiogroup 的代价是读屏会播报「单选按钮」，对「互相排斥的视图切换」这种场景同样贴切。

## 什么时候用

- 2–5 个互斥选项，且需要一眼看全所有选项（视图切换、时间区间、对齐方式、单位）。
- 选项少到不值得开一个下拉菜单，且切换后立即生效（无提交语义）。
- 需要在同一行里表达「当前选中项」，但 Pill 的单行 24px 装不下时。

## 什么时候不要用

- 选项超过 5 个，或文案长度不可控：横向空间会失控，用 `Select` / `Menu`。
- 选项不是互斥的（可以同时选多个）：用 `Checkbox` 组。
- 每一项会切换出一块**面板内容**、并且需要读屏播报「选项卡 N/M」：用 `tablist` / `tab` 自己实现，本组件不承担面板语义。
- 触发一个动作（保存、删除）：用 `Button`，分段不表达「执行」。
- 只是标记状态、不可点击：用 `Tag`。
- 布尔开关：用 `Switch`（两段的分段控件做开关是过度设计）。
- 表单里需要「未选择」这一初始态时慎用：分段控件视觉上总有一段被选中，`value` 不在 `options` 里时会没有任何一段点亮，读屏也读不出当前值——这种场景用 `Radio` 组更诚实。

## 几何来源

官方没有此控件。下列数值全部读自官方 CSS，本仓库只负责把它们组合起来：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| 容器 `padding: 4px`、段间 `gap: 0` | `Menu.module.css` `.list`（`padding: 4px` / `gap: 0`） |
| 容器 `border-radius: 12px` | `Pill.module.css` `.pill` |
| 容器底色 `--dsw-alias-bg-module-platform` | `Tag.module.css` `.tag[data-tone='neutral']` 的 `background` |
| 段高 `36px`（`md`） | `Button.module.css` `.md` |
| 段高 `28px`、`font-size: 12px`、`line-height: 18px`、`padding: 0 10px`（`sm`） | `Button.module.css` `.sm` |
| 段 `font-size: 14px`、`line-height: 22px`、`padding: 0 14px`、段内图标与文字 `gap: 4px` | `Button.module.css` `.button`（`gap: 4px` 亦见 `Pill.module.css` `.pill`） |
| 段圆角 `8px` | `8 = 12（外层，Pill）− 4（内边距，Menu）`；`8px` 本身取自 `Input.module.css` `.wrap` 的 `border-radius: 8px` |
| 未选中段文字色 `--dsw-alias-label-secondary` | `Pill.module.css` `.pill` |
| 选中段文字色 `--dsw-alias-label-primary` | `Pill.module.css` `.active` |
| 选中段填充 `--dsw-alias-button-ghost-active-fill`、描边 `box-shadow: inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)` | `Pill.module.css` `.active` |
| 未选中段 hover 底色 `--dsw-alias-interactive-bg-hover` | `Pill.module.css` `.interactive:hover`；`Button.module.css` `.ghost:hover` 同值 |
| 图标容器 `16×16` | `Button.module.css` `.icon` |

**本仓库建议值（官方没有这些数值，逐条给理由）：**

| 数值 | 理由 |
| --- | --- |
| 段圆角 `8px` | 同心圆角：外层 r12 + 4px 内边距，内件取 12 − 4 = 8。不选官方 Button `.sm` 的 r14：那段是胶囊，套在方形段上会与外层 r12 冲突；不选 r10/r12 中间值，避免 `TK-MF-03` 的「自造并混用中间圆角」。 |
| 未选中段的 `:active` 态底色 `--dsw-alias-interactive-bg-active` | 官方 `Pill` 只有 `:hover`，没有 `:active`；`CT-MF-07` 要求五态齐全，取官方 `Button.module.css` `.ghost:active` 的同名 token，不发明新色。 |
| 焦点环 `2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px` | 官方 `Button` / `Pill` 都没有键盘焦点样式；`AC-MF-10` / `AC-MF-11` 要求可见焦点环。段在容器 4px 内边距里，2px 外偏移后环正好落在容器边界内，不会被裁。 |
| 整组禁用态 | 任务给定的 API 没有 `disabled`，但 `CT-MF-07` 要求每个交互控件有五态，故补一个整组 `disabled` prop：按钮走原生 `disabled`，文字降到 `--dsw-alias-label-tertiary`（`CT-MF-09`：不靠整体降透明度），保留选中段的填充以便读出「当前是哪一段」。 |
| 容器的 `gap: 0` | 直接取 `Menu.module.css` `.list` 的 `gap: 0`；段之间靠选中段的填充与 `inset` 描边区分，不额外加间距（加间距会出现两个相邻的描边，视觉变脏）。 |
| 只对未选中段做 hover / active | 选中段已有 `ghost-active-fill` 填充；再叠 hover 底色会让它在鼠标悬停时「变色」，读起来像未选中。 |

实现为本仓库原创：几何由 `--dsh-seg-*` 局部变量承载，用一组规则组织，未复制官方 CSS 源码。

## 可访问性要点

- **`aria-label` 是必填 prop**：`role="radiogroup"` 必须有可访问名称，否则读屏只会读出「单选按钮组」而不知道在选什么。
- `role="radio"` + `aria-checked`：选中态靠 ARIA 表达，不依赖颜色（`AC-MF-07`：转灰度后仍有填充 + 内描边的形状差异）。
- **roving tabindex**：只有选中的那一段 `tabIndex=0`，其余 `-1`。`value` 不在 `options` 里时（无选中项）落到第一段，保证组内始终有一个 Tab 落点——否则键盘用户会整组跳过。
- 方向键按 follow-focus 模型：`←` `→`（含 `↑` `↓` `Home` `End`）既移动焦点也改变选中，与原生 radio 组一致；`preventDefault` 防止页面本身被方向键滚动。
- 每段是原生 `<button type="button">`：`Tab` 可到、`Enter` / `Space` 可触发，且不会在 `<form>` 里意外提交。
- 图标是装饰：`icon` 节点被 `aria-hidden="true"` 包住，名字只来自 `label`。**只给图标不给文字会让这一段没有可访问名称**，请务必同时提供 `label`（可以是 `aria-label` 用的视觉隐藏文本）。
- 禁用：按钮是真的 `disabled`（焦点与点击都被拦住），容器另有 `aria-disabled="true"` 供读屏播报整组状态。
- 焦点环用 `outline`（不是 `box-shadow`），段被容器的 4px 内边距兜住，不会被裁（`AC-MF-12`）。
- 段高只有两档（36 / 28），点击命中区即段本身，均 ≥28px 高（`AC-MF-01`）；相邻段的命中区不重叠（`AC-MF-03`）。
- 已知取舍（照实说）：`--dsw-alias-bg-module-platform` 在浅色主题下是 `#f9fafb`，与页面底色 `#fff` 只差一点点，容器本身几乎看不出来；这时「当前是哪一段」靠选中段的填充与内描边表达，仍然成立（深色主题下容器是 `#353638`，对比明显）。实测两套主题的渲染结果见 README 附带的 demo（把宿主主题切到深色再看一遍即可）。
