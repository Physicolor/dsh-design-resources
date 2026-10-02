# ToolbarRow · SPEC

- id: toolbarrow
- category: layout
- source: `components/layout/ToolbarRow/`（`index.tsx` / `toolbarrow.module.css`）
- official-counterpart: **产品里有对应的界面**：输入卡工具行 `RlGAzG_row` 780 × 42 · `padding 2px 8px 6px 8px` · `gap 12`，行内工具区 `RlGAzG_tools` 140 × 28；同座位控件 `RlGAzG_add` 28 × 28、`RlGAzG_primary` 34 × 34、`dlU_AG_trigger` 100 × 28（`docs/reference/composer-geometry.json`、`data/ui-inventory.json`）。本组件是把这一行抽成可复用容器，其余锚点取自 `@deepseek-ai/dsh-client-ui-primitives/lib/` 的 `ConnectionIndicator.module.css` / `Button.module.css` / `Menu.module.css`
- measured-2026-10-02: 本文档下面的建议值（`md` 32 / `sm` 28 高）与实测（行高 42、行内控件 28）不一致。**有实测的场景以实测为准**；建议值只在作为独立骨架使用时适用（依据 00-overview §4.1「官方优先」）
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

写法为「数值 ← 文件名 选择器」：左列是箭头左侧，右列是「文件名 + 选择器」。
官方来源为 `@deepseek-ai/dsh-client-ui-primitives/lib/`。

| 数值 | 出处 |
| --- | --- |
| `min-height: 28px`（`md`） | `ConnectionIndicator.module.css` → `.indicator`（`height: 28px`） |
| `background: var(--dsw-alias-button-tool-bar-fill)`（`filled` 形态底色） | `Button.module.css` → `.toolbar` |
| `gap: 4px`（默认间距） | `Button.module.css` → `.button`（`gap: 4px`） |
| `min-height: 28px` + `gap: 4px`（`sm`） | `Button.module.css` → `.sm`（`height: 28px`）——`Button size="sm"` 放进 `sm` 档工具条刚好撑满 |
| hairline `0.5px` + `border-bottom: 0.5px solid var(--dsw-alias-border-l1)` | `Menu.module.css` → `.separator`（`height: 0.5px; background: var(--dsw-alias-border-l1)`） |
| `border-radius: 8px` | `ConnectionIndicator.module.css` → `.indicator`（`border-radius: 8px`）——透明底时不可见，`filled` 时才显示；不用官方 `Button` 的 18px 胶囊，因为整条工具条不是胶囊 |

### 为什么默认 `plain`（透明）而不是官方工具条底色

官方 `Button.module.css` 的 `.toolbar` 底色是半透明深灰，它是为「浮在聊天内容之上」的浮层按钮设计的。一个普通的页面内工具分区如果默认带上它，会在一块浅色面板上凭空多出一条灰带；所以本组件把 `filled` 作为显式选项，只有真的浮在内容之上时才打开。

### 本仓库建议值（非官方数值）

- `padding: 0 12px`（`md`）/ `0 8px`（`sm`）：官方没有工具条容器。12px 是 4 的倍数，并与官方 `ConnectionIndicator.module.css` `.indicator` 的 `padding: 0 8px` 保持同一量级（略宽，因为工具条内是多个元素而不是单个胶囊）。`sm` 取 8px 与 `sm` 档自身高度 28px 成比例。
- `gap` 默认取 **4px**（官方 `Button.module.css` `.button` 的确切值）而不是 8px：工具条里相邻按钮通常已有自己的内边距，4px 的视觉分组更接近官方的工具条形态（官方把 4px 用在按钮内部 gap 与 Menu 分隔线四周）。`sm` 档同样是 4px。
- `z-index: 1`（`sticky`）：官方菜单用 100 / 1100、Modal 用 1000，都是浮层层级。工具条只是盖住同容器内后续内容，1 足够，也不至于把菜单压住。
- `flex-wrap: wrap`：官方没有列表容器可供参照，这是本仓库为保证窄容器可用的建议值；不接受换行的场景请自行传 `style` 覆盖为 `nowrap`，或写自己的容器。
- `border-radius: 8px`：非官方必需项，仅为让 `filled` 形态的矩形底有圆角；若铺满整行，可自行覆盖为 0。

### 实现说明

- 本仓库实现为原创：CSS 变量承载几何 + 单类切换形态 / 尺寸，几何等价但不是官方 CSS 的复制。
- `--dsh-tb-*` 是本仓库内部变量，不是 DSH token。
- `--dsw-alias-button-tool-bar-fill` / `--dsw-alias-border-l1` 均在 `website/css/dsh-tokens.css` 中查到（light 与 dark 两套都有）。

## api

`ToolbarRowProps extends HTMLAttributes<HTMLDivElement>`，`forwardRef<HTMLDivElement, ToolbarRowProps>`。导出类型 `ToolbarRowVariant` / `ToolbarRowSize`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'plain' \| 'filled'` | `'plain'` | `plain` 透明底，作为页面 / 面板内的普通工具分区；`filled` 用官方工具条按钮底，用于浮在内容之上的浮层工具条 |
| `size` | `'md' \| 'sm'` | `'md'` | `md` 行高 32px、左右内边距 12px；`sm` 行高 28px、左右内边距 8px；两档间距均为 4px |
| `divider` | `boolean` | `false` | 底部 hairline（`0.5px` + `var(--dsw-alias-border-l1)`） |
| `sticky` | `boolean` | `false` | `position: sticky; top: 0; z-index: 1`；需要外层滚动容器不要有 `overflow: hidden` |
| `children` | `ReactNode` | 无 | 行内控件 |
| `className` | `string` | 无 | 与内部类名拼接，外部类名最后追加 |
| 其余 | `HTMLAttributes<HTMLDivElement>` | — | `role` / `aria-label` / `style` 等原样透传到根 `<div>` |
| `ref` | `Ref<HTMLDivElement>` | 无 | 透传到根 `<div>` |

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认（`plain` + `md`） | `variant` / `size` 缺省 | `background: transparent`；`min-height: 28px`；`padding: 0 12px`；`gap: 4px` |
| `filled` | `variant="filled"` | `background: var(--dsw-alias-button-tool-bar-fill)`，`border-radius: 8px` 可见 |
| `sm` | `size="sm"` | `min-height: 28px`；`padding: 0 8px`；`gap: 4px` |
| 有分隔线 | `divider` 为真 | `border-bottom: 0.5px solid var(--dsw-alias-border-l1)` |
| 无分隔线 | `divider` 为假（默认） | 无 `border-bottom` |
| 吸顶 | `sticky` 为真 | `position: sticky`；`top: 0`；`z-index: 1` |
| 窄容器 | 内容总宽超出容器 | `flex-wrap: wrap` 折行，不溢出、不裁切（`AC-MF-16`） |
| 交互 | 任意时刻 | 无：本组件是纯布局容器，不渲染交互元素，也不带 `role` |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-button-tool-bar-fill` — `filled` 形态底色
- `--dsw-alias-border-l1` — 底部 hairline 颜色

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-tb-height`（`32px` / `.sm` 下 `28px`）
- `--dsh-tb-pad-x`（`12px` / `.sm` 下 `8px`）
- `--dsh-tb-gap`（`4px`，两档相同）

## a11y

- 本组件是纯布局容器，没有 `role`。一排动作按钮应各自是 `<button>`。
- 不要给它加 `role="toolbar"`，除非真的实现了方向键在按钮间移动焦点的行为——ARIA `toolbar` 语义要求键盘方向键导航；若加，需同时提供 `aria-label`。
- 按钮若是仅图标，必须由调用方提供 `aria-label`；图标 `aria-hidden="true"`（`AC-MF-14`；清单 `A49`）。
- `variant="filled"` 的底色在浅色主题下是半透明深灰，其上的文字必须用反色（`Button variant="toolbar"` 已由官方 token 处理），不要把深色正文文字直接放上去（`AC-MF-05`）。
- `sticky` 会让工具条盖住下方内容；需用 `divider` 或底色把它与滚动内容分开。
- 命中区结论：本组件不含可交互元素；容器行高 `md` 32px / `sm` 28px 均 ≥ 28px，符合 `AC-MF-04`（含图标按钮的容器行高 ≥ 28；清单 `A44`）。行内控件自身的命中区由各自组件负责（`AC-MF-01`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `variant` 取值属于 `plain` / `filled`；`size` 取值属于 `md` / `sm`；越界回落默认值。
2. `min-height` 为 `32px`（`md`）/ `28px`（`sm`），均 ≥ 28px（`AC-MF-04`；清单 `A44`）。
3. `plain` 形态下 `background` 为 `transparent`，源码中不出现默认写入 `--dsw-alias-button-tool-bar-fill`。
4. `divider` 为假时根节点无 `border-bottom`。
5. hairline 颜色为 `var(--dsw-alias-border-l1)`（清单 `A19`）。
6. `sticky` 为真时 `position: sticky` + `top: 0` + `z-index: 1`；为假时不出现 `position: sticky`。
7. `flex-wrap: wrap` 默认生效（除非调用方通过 `style` 覆盖），窄容器不裁切内容（`AC-MF-16`；清单 `A51`，人工确认入口未消失）。
8. 类名拼接顺序为「基础类 + 形态类 + 尺寸类 + divider 类 + sticky 类 + 外部 className」，外部类名最后追加。
9. 组件源码不主动写 `role`；出现 `role="toolbar"` 时必须同时存在方向键处理与 `aria-label`（否则判违规）。
10. 颜色全部来自 `--dsw-*` 语义 token，源码中无硬编码色值（清单 `A23`）。
11. `gap` 为 `4px`，与 `CT-RC-14` 建议的「行内相邻控件间距 8px」不一致：本仓库以官方 `Button.module.css` `.button` 的 `gap: 4px` 为准（清单 `B06`，属偏离项，需在仓库层面确认）。
12. 同一工具条内控件高度一致（`CT-MF-13`；清单 `A44`）：`md` 档配 `Button` 默认尺寸、`sm` 档配 `Button size="sm"`。
13. 同一工具条内可见控件不超过 6 个（`FL-RC-05`；清单 `B01`），超出应改用人审确认是否收进菜单。

## demo

- `components/layout/ToolbarRow/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A19`、`A23`、`A44`、`A49`、`A51`、`B01`、`B06`）
