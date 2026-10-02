# 20 设置页模式

读者：DSH 第三方插件作者。你要么给插件做一整套设置界面，要么只在宿主设置窗口的导航列里占一格。

## 这一页解决什么

设置是用户可以一直不来的地方，但来了就想一次改完。插件对它的需求分两种：**要一整页**（自己一个独立设置界面），或**只要一格**（往宿主设置窗口的导航列加一个分区，点进去是自己那一页）。两者的容器、标题层级、对宿主的影响都不同；混用就会出现两层导航。本页给这两套做法、分区页的表头契约、关键状态与可核对的规格。

全篇五类标记：`[官方源码]`、`[运行时实测]`、`[外部指南借鉴]`、`[本仓库建议]`、`[已知偏差]`。没有证据的地方写「无证据」。

## 适用情景

| 你手上的任务 | 用哪套 | 判据 |
| --- | --- | --- |
| 插件要提供一整页设置 | 整页骨架 `settings-page` | 分区 ≥3，需要左列导航才扫得完 |
| 只往宿主设置页加一个分区 | 宿主给的容器（`settings.section` 座位） | 宿主已排好版，再套骨架就成两层导航；这一档是如今插件最常见的落点 |
| 分区里「一个开关管一件事」 | `settingsrow` | 不需要新页面 |
| 一页里反复出现「小标题 + 若干行」 | `settingsrow` 成列 + 分区 `<h2>` | 统一同一页的排版节奏 |

## 什么时候不要用

| 不要用 | 改用 | 为什么 |
| --- | --- | --- |
| 只有 1–2 个分区却套整页骨架 | 一个分区标题 + `list-row-group` | 左边空着一列导航是浪费 |
| 内容其实是会话语义 | 会话区容器（`panel-seat` / `conversation.view`） | 会话语义的东西不属于设置区（来源：`spec/10-frame-layout.md` 第 3 节判定树）`[本仓库建议]` |
| 主流程里必经的一步 | 会话区或对话框 | 设置页是用户可以选择不去的地方 |
| 只要一个区块的抬头 | 区块标题 | 整页骨架的一级分区是另一回事，叠用会出现双层标题 |
| 点击后弹出选项列表 | 官方菜单项 | 设置行表达「改一个值」，不表达「弹一层菜单」 |
| 一行里塞两个互不相关的控件 | 拆成两行 | 一行的标题是标签，只关联第一个控件（来源：`components/layout/SettingsRow/SPEC.md`）`[本仓库建议]` |

## 界面结构

<!-- component: settings-page | 整页设置骨架：左 188 导航列 + 右 612 内容列，几何逐条采自运行中的设置窗口。 -->

<!-- component: settingsrow | 设置项行：左标题（14/22）+ 可选说明（12/18），右侧控件区，行间一条 0.5px 发丝线。 -->

### 分区页的表头契约（往 `settings.section` 注册时最要紧的一步）

导航列上那一格只是门牌。用户点进来第一眼看到的是这一页的标题与描述，**两件都不能缺**：

| 件 | 规格 | 依据 |
| --- | --- | --- |
| 语义 `<h2>` | 18 / 26、字重 600、主文字色 | `components/patterns/SettingsPage/README.md`、`demo.html`；`[运行时实测]` |
| `<p>` 描述 | 13 / 20、三级文字色 `--dsw-alias-label-tertiary`、下方 12px | 同上；`[运行时实测]` |
| 两者间距 | 12px（标题底边到描述顶边） | `demo.html` 末尾对照脚本现测；`[运行时实测]` |
| 标题行 | 不放 logo 图标；图标只出现在左侧导航格里 | `components/patterns/SettingsPage/README.md`；`[运行时实测]` |

这不是提醒，是可以失败的检查：`demo.html` 末尾的脚本对每块表头现测 `<h2>` 是否存在、描述是否 `13/20`、标题底边到描述顶边是否为 12px，**缺标题或缺描述都当场判 ✗**（来源：`components/patterns/SettingsPage/demo.html`）`[运行时实测]`。

### 设置行

| 部位 | 实测 | 来源与标记 |
| --- | --- | --- |
| 行本体 | 564 × 77 · padding `16px 0` · gap 8 · 行间一条发丝线 | `docs/reference/settings-panel.json`；`[运行时实测]` |
| 文字列 | 标题 398 × 22（14/22，主文字色）；说明 398 × 18（12/18，三级色）；文字列右侧留 48 | 同上；`[运行时实测]` |
| 右侧选择器 | 110 × 36 · 圆角 12 · padding `0 14` · gap 12 · 底 `rgb(245,246,247)` | 同上；`[运行时实测]` |
| 行内开关 | 36 × 20 · 圆角 999 · 滑块 16 · 打开时 `--dsw-alias-brand-primary` | `components/patterns/SettingsPage/SPEC.md`；`[运行时实测]` |
| 主题方块 | 183 × 84 · 圆角 20 · padding `20px 32px` | `docs/reference/settings-panel.json`；`[运行时实测]` |
| 设置页里的卡片 | 统一圆角 20（`--dsw-radius-xl`）；插件卡片为两列网格、每格 277 × 84 | `components/patterns/SettingsPage/SPEC.md`；`[运行时实测]` |

窗口的圆角 28 是浮层那一档（`--dsw-radius-panel`），卡片是窗口里的内容块，**不要**跟着用 28（来源：`components/patterns/SettingsPage/SPEC.md`）`[本仓库建议]`。

## 关键状态

| 状态 | 触发条件 | 建议表现 |
| --- | --- | --- |
| 加载 | 设置项等宿主或远端数据 | 骨架屏或占位环；不要画成空状态 |
| 空 | 该分区确实没有可配置项 | 一句话 + 一个动作（例如「去安装」） |
| 禁用 | 前置条件未满足 | 原生 `disabled`；导航行禁用是 `opacity: 0.4` + `cursor: not-allowed`（来源：`components/patterns/SettingsPage/SPEC.md` 锚 `Menu.module.css` `.item:disabled`）`[官方源码]` |
| 只读 / 未登录 | 值可看不可改 | 说明原因后禁用控件；不要留一个永远禁用的开关 |
| 保存中 | 有提交语义的字段 | 提交按钮进加载态，同区其他控件禁用，避免改一半 |
| 保存失败 | 写入被拒 | 表单旁给整体原因，字段级错误贴字段并加 `aria-invalid` |
| 选中（导航项） | `active` 为真 | `aria-current="page"` + 主文字色 + 底色 `--dsw-alias-interactive-bg-hover`（来源：`components/patterns/SettingsPage/SPEC.md`）`[本仓库建议]` |

立即生效的二态设置（开关）没有「保存中」：开关的语义是马上生效，放进需要提交的表单会误导用户（来源：`components/index.json` 的 `switch`）`[本仓库建议]`。

## 键盘与焦点

- Tab 顺序：左列导航 → 内容列控件，与视觉顺序一致（`AC-MF-09`，来源：`spec/60-accessibility.md`）`[外部指南借鉴]`。
- 导航列是 `<nav aria-label="…">` 里的一组按钮；当前分区必须带 `aria-current="page"`，不要只靠底色（来源：`components/patterns/SettingsPage/SPEC.md`）`[本仓库建议]`。
- 焦点环规格：2px 实线 + `--dsw-alias-brand-primary` + 外偏移 2px；容器带 `overflow: hidden` 时改用内偏移 `-2px`（来源：`spec/60-accessibility.md` `AC-MF-11` / `AC-MF-12`）`[本仓库建议]`。
- 导航列**不得**声明 `overflow: hidden`，否则边界行的焦点环会被裁掉（`AC-MF-12`）`[本仓库建议]`。
- 设置行的根节点是 `<label>`，只关联行内第一个表单控件：一行只放一个表单控件（来源：`components/layout/SettingsRow/SPEC.md`）`[本仓库建议]`。
- 打开页面、切换分区都不得把输入焦点从用户正在用的地方抢走（来源：`components/patterns/PanelSeat/SPEC.md` 的同类约定）`[本仓库建议]`。
- 设置窗口是宿主的 `role="dialog"`（见 demo），Esc 关闭属宿主行为；本仓库**没有实测到该键盘路径**，插件不要自己再绑一层 Esc（来源：`components/patterns/SettingsPage/demo.html`）无证据。

## 浅色 / 深色

- 颜色一律取 `--dsw-*` 语义 token，禁止写字面色值（`TK-MF-01` / `TK-MF-07`，来源：`spec/30-tokens.md`）`[本仓库建议]`。
- 设置卡统一材料：`border-radius: var(--dsw-radius-xl)`（20px）+ `0.5px solid var(--dsw-alias-settings-card-stroke)` + `--dsw-alias-settings-card-fill`（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md）`[官方源码]`。本仓库 `data/tokens.json` 里三个值都在：`--dsw-radius-xl: 20px`、`--dsw-alias-settings-card-fill: var(--dsw-alias-bg-layer-2)`、`--dsw-alias-settings-card-stroke: var(--dsw-alias-border-l4)`（`[运行时实测]`）。
- 圆角只用 `--dsw-radius-xs|sm|md|lg|xl|panel`（4 / 8 / 12 / 16 / 20 / 28），不要引入 10 / 14 / 18 / 24 这类本地值；同心嵌套 inner R = max(0, outer R − inset)（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md）`[官方源码]`。
- 浮起表面用 `border: 0` + `box-shadow: var(--dsw-elevation-panel|prominent|soft)`，绝不再叠 `--dsw-alias-border-*`；满圆（50% / pill）必须配 `corner-shape: round`（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md）`[官方源码]`。
- 中性分隔与描边用 0.5px 发丝线（来源：同上）`[官方源码]`。
- 每对颜色都要在浅深两套主题下各验一次再交付（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md）`[官方源码]`。
- `[已知偏差]` 浅色白底下 `--dsw-alias-label-tertiary` 约 3.7:1，低于 4.5:1，而 12–13px 说明文字用的正是它（来源：`spec/60-accessibility.md`）`[运行时实测]`。处理方式是记录而不覆盖官方控件：正文取 `label-primary` / `label-secondary`，关键信息不要只写在三级色说明里。

## 窄窗口 / 高密度

- 骨架**不做**响应式折叠：窄屏下导航列仍是固定宽度，由调用方在宿主断点里调小 `navWidth`、改成横向滚动或收进菜单（来源：`components/patterns/SettingsPage/SPEC.md`）`[本仓库建议]`。
- 内容列阅读宽度上限 640px（来源：`components/patterns/SettingsPage/SPEC.md`，借自官方 `Toast.module.css` 的 `max-width: min(640px, …)`）`[本仓库建议]`；实测窗口内容列 612（来源：`docs/reference/settings-panel.json`）`[运行时实测]`，量级一致。
- 同一段内可见控件不超过 6 个（`FL-RC-05`，来源：`spec/10-frame-layout.md`）`[本仓库建议]`；超出收进菜单——功能不随空间变化，只改变可见量（`AC-MF-16`）`[外部指南借鉴]`。
- 收窄时不能丢的：当前分区入口、每个设置项的标题、禁用与错误的原因说明。
- `[已知偏差]` 间距审查项写「不应有未解释的贴边与一次性偏移」（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md）`[官方源码]`；而实测设置页里同一页同时存在 24（选项区左右）、16（设置行上下）、8（行内 gap）、12（导航列左右）四种节奏。写插件时按所在容器的既有值走，不要自造第五种。

## 可访问性

| 判据 | 要求 | 条文 |
| --- | --- | --- |
| 命中区 | 常规控件目标 28 × 28，最小 20 × 20，相邻不重叠 | `AC-MF-01` / `AC-MF-03` |
| 行命中区 | 设置行整行可点（实测 564 × 77，远超下限） | `[运行时实测]` |
| 地标 | 导航列是 `<nav aria-label>`；页面已有别的导航时换一个名字，否则读屏地标列表出现重名 | `[本仓库建议]` |
| 标题层级 | 页面标题 `<h1>`、分区 `<h2>`、行组 `<h3>`，不跳级 | `components/patterns/SettingsPage/SPEC.md` |
| 可访问名称 | 仅图标按钮必须带 `aria-label`；开关必须有可读名字 | `AC-MF-14` |
| 颜色不是唯一线索 | 选中态在底色之外还要有文字色或 `aria-current` | `AC-MF-07` |
| 放大 | 浏览器放大 200% 时文本不截断、不重叠 | `AC-MF-15` |
| 文案 | 所有产品可见文案（含 aria 名、tooltip、placeholder）走本地化字典，零 Cordis 原子组件不给兜底文案 | `packages/client/AGENTS.md`、`packages/client/ui-primitives/README.md` `[官方源码]` |

命中区与对比度阈值的外部来源：`spec/60-accessibility.md`（HIG 转写）`[外部指南借鉴]`。

## 实现资源

| 用途 | 组件 id | 路径 |
| --- | --- | --- |
| 整页骨架（导航列 + 分区） | `settings-page` | [SettingsPage](../components/patterns/SettingsPage/SPEC.md) |
| 设置项行 | `settingsrow` | [SettingsRow](../components/layout/SettingsRow/SPEC.md) |
| 活体样例 | — | `components/patterns/SettingsPage/demo.html`（800 × 800 复刻 + 表头契约的三种情况，含判 ✗ 的两种） |
| 控件几何 | — | `spec/20-controls.md` |
| 提交前自检 | — | `spec/70-checklist.md` 的 `A43`、`A48`、`B01`、`B08`、`B13` |

嵌入宿主时只占 `settings.section` 这一个座位，一个插件一个 entry；要自己的整页界面才渲染 `settings-page`，只在宿主窗口里报一格就只渲染分区内容。先扩展既有组件 / 容器 / 交互，再考虑新建（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md）`[官方源码]`。

<!-- demo: conflict-board | 冲突裁决板：`settings.section` 上三个 order 40 撞车那张表用的就是真实占用登记。 -->

## 规格

单位 px，写法「值（来源：路径或 URL）」。

| 项 | 值 | 标记 | 来源 |
| --- | --- | --- | --- |
| 窗口 | 800 × 800 · 圆角 28 · `box-shadow: --dsw-elevation-prominent` | `[运行时实测]` | `docs/reference/settings-panel.json` |
| 遮罩 | 全屏 `--dsw-alias-bg-mask-1`（计算值 `rgba(0,0,0,.24)`） | `[运行时实测]` | 同上 |
| 导航列 | 188 宽 · padding `22px 12px 0` · 标题与列表 gap 18 · 列表行距 4 | `[运行时实测]` | 同上 |
| 导航格 | 164 × 40 · 圆角 12 · padding `9px 16px 9px 12px` · gap 8 | `[运行时实测]` | 同上 |
| 内容列 | 612 宽 · 头部 54 高（padding `20px 14px 8px 10px`）· 选项区 padding `0 24px 24px` | `[运行时实测]` | 同上 |
| 关闭按钮 | 28 × 28 · 圆角 8 | `[运行时实测]` | 同上 |
| 分区标题 / 描述 | 18 / 26 · 600 / 13 / 20 三级色 · 相距 12 | `[运行时实测]` | `components/patterns/SettingsPage/demo.html` |
| 设置行 | 564 × 77 · padding `16px 0` · gap 8 · 标题 14 / 22 · 说明 12 / 18 · 文字列右留 48 | `[运行时实测]` | `docs/reference/settings-panel.json` |
| 选择器 | 110 × 36 · 圆角 12 · padding `0 14` · gap 12 · 底 `rgb(245,246,247)` | `[运行时实测]` | 同上 |
| 开关 | 36 × 20 · 圆角 999 · 滑块 16 | `[运行时实测]` | `components/patterns/SettingsPage/SPEC.md` |
| 主题方块 | 183 × 84 · 圆角 20 · padding `20px 32px` | `[运行时实测]` | `docs/reference/settings-panel.json` |
| 设置卡材料 | 圆角 `--dsw-radius-xl`（20）+ `0.5px solid --dsw-alias-settings-card-stroke` + `--dsw-alias-settings-card-fill` | `[官方源码]` | https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md |
| 圆角阶梯 | 4 / 8 / 12 / 16 / 20 / 28，同心 inner = max(0, outer − inset) | `[官方源码]` | 同上 |
| 浮层圆角 | 28（`--dsw-radius-panel`） | `[官方源码]` | 同上 |
| 焦点环 | 2px 实线 `--dsw-alias-brand-primary` + 外偏移 2px，被裁剪时改用 −2px | `[本仓库建议]` | `spec/60-accessibility.md` `AC-MF-11` / `AC-MF-12` |
| 骨架默认导航列宽 | 218（内部变量 `--dsh-settings-nav-width`） | `[本仓库建议]` | `components/patterns/SettingsPage/SPEC.md` |
| `--dsh-settings-gap` / `--dsh-settings-pad` / `--dsh-settings-block-gap` / `--dsh-settings-content-max` | 32 / 24 / 24 / 640 | `[本仓库建议]` | 同上 |
| `--dsh-settings-radius` / `--dsh-settings-nav-pad` | 12 / 4 | `[本仓库建议]` | 同上 |
| `titleLevel` / `headingLevel` 默认 | 1 / 2 | `[本仓库建议]` | 同上 |
| 分隔线写法 | `box-shadow: inset 0 -0.5px 0 0 var(--dsw-alias-border-l2)`，不用 `border-bottom`（避免把高度顶成 44.5） | `[本仓库建议]` | `components/layout/SettingsRow/SPEC.md` |
| 行内表单控件数量 | ≤1（`<label>` 只关联第一个控件） | `[本仓库建议]` | 同上 |
| 座位 | `settings.section`：`kind: list` · `scope: root` · `replaceRisk: none` | `[运行时实测]` | `data/slots.json` |
| 座位占用 | 2026-10-01 采集到 11 个占用者；`research-cordis` / `market` / `ui-harmony` 三个 order 都是 40 | `[运行时实测]` | `data/raw/occupancy-2026-10-01.json` |
| list 座位 order 纪律 | 必须显式声明 order，禁止依赖默认 0；新进者取当前最大 order + 10；同一 bundle 相邻 entry 间隔 ≥5；同座位同插件不超过 3 个 entry | `[本仓库建议]` | `spec/11-slot-seats.md` `SL-MF-03` / `SL-MF-05` / `SL-RC-06` / `SL-AD-07` |
| 字号档位 | 26 / 18 / 16 / 14 / 13 / 12 / 11 / 10，档位外判违规 | `[本仓库建议]` | `spec/30-tokens.md` `TK-RC-13` |
| 功能 CSS 字重上限 | 500；不为单个元素发明字号 | `[官方源码]` | https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md |

## 观察到的官方做法

1. 设置窗口是一个 800 × 800 的浮层：圆角 28、`--dsw-elevation-prominent`，背后是 `--dsw-alias-bg-mask-1`（来源：`docs/reference/settings-panel.json`）`[运行时实测]`。
2. 窗口分两列：左 188 的导航列（padding `22px 12px 0`），右 612 的内容列（头部 54 高）；导航格 164 × 40、圆角 12（来源：同上）`[运行时实测]`。
3. 内容列里设置行 `padding: 16px 0`、行间一条发丝线，标题 14/22、说明 12/18，右侧控件区固定宽（选择器 110 × 36）（来源：同上）`[运行时实测]`。
4. 设置页里的卡片统一圆角 20（`--dsw-radius-xl`），插件卡片是两列网格、每格 277 × 84；窗口的 28 属于浮层，不是卡片那一档（来源：`components/patterns/SettingsPage/SPEC.md`）`[运行时实测]`。
5. 设置卡材料在官方规范里是「圆角 `--dsw-radius-xl` + 0.5px `--dsw-alias-settings-card-stroke` + `--dsw-alias-settings-card-fill`」（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md）`[官方源码]`。本仓库 token 表里三条都在（`data/tokens.json`）`[运行时实测]`。
6. 圆角只在 4 / 8 / 12 / 16 / 20 / 28 六档取值并各有 token；同心嵌套用 inner = max(0, outer − inset)（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md）`[官方源码]`。
7. 浮起表面 `border: 0` + `box-shadow`（`--dsw-elevation-panel|prominent|soft`），不再叠语义边框；中性分隔与描边统一 0.5px 发丝线（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md）`[官方源码]`。
8. 先扩展既有组件 / 容器 / 交互，再考虑新建；功能 CSS 字重上限 500，不为单个元素发明字号；菜单 / popover / tooltip 上线前三验——可关闭、视口内翻转、不被裁剪（必要时 portal 到 body）；间距审查里不应有未解释的贴边与一次性偏移（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md）`[官方源码]`。
9. 所有产品可见文案（含 aria 名、tooltip、placeholder）走本地化字典，零 Cordis 原子组件不给兜底文案（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/AGENTS.md、https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-primitives/README.md）`[官方源码]`。
10. `settings.section` 是 `list` 座位、`replaceRisk: none`；2026-10-01 采集到 11 个占用者（来源：`data/slots.json`、`data/raw/occupancy-2026-10-01.json`）`[运行时实测]`。

## 推荐插件作者这样做

1. 先决定是「整页」还是「一格」；只有一格时不要套整页骨架，否则导航列上会出现两层（来源：`components/patterns/SettingsPage/README.md`）`[本仓库建议]`。
2. 注册 `settings.section` 时显式写 order，取该座位当前最大 order + 10（当前最大是 60，来源：`data/raw/occupancy-2026-10-01.json`）`[本仓库建议]`；不要取已被三个占用者挤住的 40。
3. 分区页必须同时写 `<h2>` 与 `<p>`：缺任一在站点演示里当场判 ✗（来源：`components/patterns/SettingsPage/demo.html`）`[运行时实测]`。
4. 表头的规范化读数（18/26/600 + 13/20 + 12）是本机规范化后的统一值；官方各页自己并不统一，第三方插件按这套统一写法走最省事（来源：`components/patterns/SettingsPage/SPEC.md`）`[已知偏差]`。
5. 卡片用圆角 20 + 官方设置卡材料，不要沿用窗口的 28（来源：`components/patterns/SettingsPage/SPEC.md`、`docs/ui-radius.md`）`[本仓库建议]`。
6. 圆角从六档 token 里取，不要写 10 / 14 / 18 / 24（来源：`docs/ui-radius.md`）`[官方源码]`。
7. 设置行一行只放一个表单控件，分隔线用 inset `box-shadow` 而不是 `border-bottom`（来源：`components/layout/SettingsRow/SPEC.md`）`[本仓库建议]`。
8. 当前分区用 `aria-current="page"` 标出，导航列不要 `overflow: hidden`（来源：`components/patterns/SettingsPage/SPEC.md`）`[本仓库建议]`。
9. 窄窗口由调用方处理：调小 `navWidth`、横向滚动或收进菜单；功能不随空间变化，只改变可见量（`AC-MF-16`）`[外部指南借鉴]`。
10. 产品可见文案全部走本地化字典，包括 aria 名与 placeholder（来源：`packages/client/AGENTS.md`）`[官方源码]`。
11. 两个入口合并成一个分区，别在导航列里占两格（来源：`spec/80-conflicts.md` `CF-RC-06`）`[本仓库建议]`。
12. 交付前在浅深两套主题下各验一次设置卡与说明文字（来源：`.agents/skills/dsh-client-ui-ux/SKILL.md`）`[官方源码]`。

## 来源与已知偏差

| 项 | 说明 | 标记 |
| --- | --- | --- |
| 表头不是产品原样 | 官方各页自己的表头并不统一（模型页 `16/500` + `14/22`，Agent 预设页另一套）；`18/26/600` + `13/20` 是本机 `dsh-ui-harmonizer` 规范化后的统一值 | `[已知偏差]` |
| 导航列宽两个量 | 骨架默认 218（借自官方 `Menu.module.css` `.list { min-width: 218px }`），设置窗口实测 188。写 `navWidth` 时按宿主给的宽度走 | `[已知偏差]` |
| 组件建议值与实测不一致 | 导航格圆角建议 10、实测 12；设置行说明建议 13/20、实测 12/18；设置行建议 `min-height 44 / padding 12 / gap 12`、实测 `77 / 16px 0 / 8`。有实测的场景以实测为准 | `[已知偏差]` |
| 描述下那条 hairline | demo 的判定要求它存在，但 2026-10-02 采集到的 `p.enhc-page-intro` 计算样式是 `padding-bottom: 12px`、`border: 0 none`。本页因此只把「12px 间距」写成事实 | `[已知偏差]` |
| 官方 Button 自身圆角 | 官方 Button 用 r14（`.sm`）与 r18（默认），而官方圆角规范只允许 4 / 8 / 12 / 16 / 20 / 28。按钮走按钮自己的值，其余表面按六档走 | `[已知偏差]` |
| 间距节奏 | 规范审查项要求「无未解释的贴边与一次性偏移」，实测设置页同页存在 24 / 16 / 12 / 8 四种节奏 | `[已知偏差]` |
| 设置窗口 Esc 关闭路径 | demo 只给了 28 × 28 的关闭按钮，键盘关闭没有实测数据 | 无证据 |
| `settings.section` 座位数随环境变化 | 占用数字取决于采集时本机装了哪些插件，引用必须带采集时间（2026-10-01） | `[运行时实测]` |

## 依据

- `components/patterns/SettingsPage/README.md`、`SPEC.md`、`demo.html`
- `components/layout/SettingsRow/README.md`、`SPEC.md`
- `components/patterns/PanelSeat/SPEC.md`
- `data/slots.json`、`data/tokens.json`
- `data/raw/occupancy-2026-10-01.json`
- `docs/reference/settings-panel.json`、`docs/reference/README.md`
- `spec/10-frame-layout.md`、`spec/11-slot-seats.md`、`spec/30-tokens.md`、`spec/60-accessibility.md`、`spec/70-checklist.md`、`spec/80-conflicts.md`
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/AGENTS.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-primitives/README.md
