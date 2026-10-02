# 22 输入区扩展模式

## 任务

- 判断这块内容到底该不该进输入区，还是该去别处
- 在 `conversation.input.*` / `conversation.composer.*` 里选出唯一正确的座位
- 按官方几何和 order 纪律把内容加进去，不遮挡官方唯一入口
- 交付前跑完这一页的自查表

## 这一页解决什么

「我的插件想在输入区露个头」这一类需求。输入区是官方唯一入口最密集的地方（发送、停止、权限、模型），加错位置的代价比其他区域都高：用户可能因此发不出消息，或者你的入口被官方的工具行挤没。本页给纵向五个插入点的分工、官方实测几何、order 纪律与「不遮蔽官方入口」的判定方法。

## 适用情景

- 你的入口作用于「本次输入」或「本次发送」：附件、预设、参数、模板、上下文开关。
- 你想在输入卡上方或下方加一条整宽的状态／提示带。
- 你想在输入卡内部加一个必须盖在卡上的瞬时浮层（补全、下拉、提示）。

## 什么时候不要用

| 你的内容 | 不要放进输入区的原因 | 替代位置 |
| --- | --- | --- |
| 全局设置项、偏好开关 | 与「本次输入」无关，会在每次发送时持续占据空间 | `settings.section`（single 座位，占用纪律见 [11-slot-seats.md](../spec/11-slot-seats.md) 第 4 节） |
| 跨会话的对象切换、导航 | 输入区属于当前会话 | 左栏 `sidebar` |
| 常驻可折叠的查看面板 | 输入区高度是硬预算，面板会把输入卡顶出视野 | 右栏 `rightbar` |
| 与会话强相关、需要长期驻留的信息 | 输入区随草稿变化，不适合承载长期状态 | 会话区 `conversation.view` / `conversation.session` |
| 全屏或跨区域浮层 | 输入卡内的浮层只允许瞬时 UI | `shell.overlay`，且必须显式声明 order |

来源：[10-frame-layout.md](../spec/10-frame-layout.md) 第 3、4 节（内容归属判定树与跨区域决策表）。

## 界面结构

输入区是一个纵向堆叠，从上到下三段，各段有名字：

| 段 | 座位 | 位置 |
| --- | --- | --- |
| 输入卡上方 | `conversation.input.dock` | 整宽，位于输入卡之上 |
| 输入卡本体 | `conversation.composer.bar` | 输入卡及其工具行 |
| 输入卡下方 | `conversation.composer.dock` | 卡下状态行 |

卡内还有一层：`conversation.input.overlay`（浮在卡内的浮层）。工具行内部按左右分两段：`conversation.input.left`（行左紧凑控件）、`conversation.input.right`（发送动作之前的紧凑控件）；另有若干 `single` 座位（`.permission` / `.plan` / `.model` / `.activity`）。

来源：`data/slots.json`（`conversation.input.dock` 的 `purpose` 为 "Full-width entries above the composer card."，`conversation.composer.dock` 为 "Ambient entries below the composer card."，`conversation.input.overlay` 为 "Floating entries rendered inside the resident composer card."）。座位总数 90（来源：`data/slots.json` 的 `counts.seats`）。

<!-- demo: frame-composer | 输入区的纵向结构。两侧的留白不是「剩下的空间」，而是有名字、有用途的座位。 -->

## 关键状态

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 无会话 | 未选中任何会话 | `conversation.composer.bar` 为 `session-maybe`，渲染「惰性」输入卡；其余输入区座位为 `session`，不渲染 |
| 有会话·单行 | 草稿一行 | 输入卡 780 × 98 |
| 有会话·多行 | 草稿多行 | 输入卡长高至 780 × 114（新会话页实测值），输入区座位高 128 |
| 浮层展开 | 补全／下拉打开 | 只有此刻才允许卡内出现覆盖层 |
| 空内容 | 草稿为空 | 占位行「描述你想要构建的内容, / 调用指令, @ 文件或对话」可见 |

来源：座位 kind/scope 与 purpose 来自 `data/slots.json`；尺寸来自 [10-frame-layout.md](../spec/10-frame-layout.md) §2 实测尺寸表与 `docs/reference/composer-geometry.json`。

## 键盘与焦点

- 输入区没有公开的官方键盘契约。「Enter 发送、Shift+Enter 换行」这类行为在本仓库可核对的文件里没有记录：**无证据**。不要在你的文档里断言它。
- 座位树没有声明 `conversation.input.*` 的 Tab 顺序，输入卡内部的可聚焦序列也**无证据**。
- 有证据且可执行的两条：`AC-MF-09` 要求所有可交互元素可 Tab 到达、Enter/Space 可触发，顺序与视觉一致；`AC-MF-14` 要求纯图标按钮有可访问名称。对应自检项 `A47`、`A49`。
- 官方自己在输入区就是这么做的：加号按钮的可访问名称是「添加文件或调用指令」，权限胶囊是「访问模式，当前：完全权限」（来源：`data/ui-inventory.json` 中 `cls` 为 `RlGAzG_add`、`dlU_AG_trigger` 的 `arias` 字段）。
- 你要往 `conversation.input.left` / `.right` 加按钮时，图标容器用 16×16、行内容器高度 ≥28（`CT-MF-13`）。

## 浅色深色

- 颜色一律取 `--dsw-*` 语义 token，禁止硬编码（`TK-MF-01`）。输入卡内可用的取色锚点：卡片自身是 `--dsw-alias-bg-layer-1`，占位与辅助文字用 `--dsw-alias-label-tertiary`，工具行触发器的标签用 `--dsw-alias-label-secondary`。
- 已知偏差：`--dsw-alias-label-tertiary` 在浅色白底下对比度约 3.7:1，低于 4.5:1，而输入区占位行与工具行标签正在用它。这是产品既有实现，按「官方优先」记录为偏差、不覆盖官方控件；插件作者的结论是：**不要把关键信息只放在这个颜色里**（来源：[60-accessibility.md](../spec/60-accessibility.md) §3）。
- 输入卡在采集时底色为 `rgb(255, 255, 255)`（来源：`docs/reference/composer-geometry.json` `RlGAzG_card` 的 `bg`）。这是浅色主题下的取值，不要把它当常量写进插件。

## 窄窗口

- 输入卡宽度是 `min(780px, 100%)`（来源：`website/shell/shell.css` 的 `.sh-card`，其注释指向 `RlGAzG_card`）。它已经处理了窄窗口。
- 加东西时的规则是「功能不随空间变化，只改变可见量」：窗口收窄时收起或折叠入口，不得删除入口（`AC-MF-16`，自检项 `A51`）。
- 同一段内可见控件不超过 6 个（`FL-RC-05`，自检项 `B01`）。官方自己的同类工具行样本 `conversation.session.header.utilities` 只有 4 项（来源：`data/raw/occupancy-2026-10-01.json`，采集时间 2026-10-01）。
- 工具行控件高度必须与同行一致（`CT-MF-13`）。你自己的容器要允许换行，不要用固定 px 高度夹死文本（`AC-RC-17`）。

## 可访问性

| 判据 | 数值 | 条文 | 来源 |
| --- | --- | --- | --- |
| 常规控件命中区 | 28×28 | `AC-MF-01` | [60-accessibility.md](../spec/60-accessibility.md) §2 |
| 最小命中区 | 20×20 | `AC-MF-01` | 同上 |
| 含图标按钮的容器行高 | ≥28 | `AC-MF-04` | 同上 |
| ≤17pt 文本对比度 | ≥4.5:1 | `AC-MF-05` | 同上 §3 |
| 非文本元素对比度 | ≥3:1 | `AC-MF-06` | 同上（本仓库建议） |
| 焦点环 | 2px 实线 + `--dsw-alias-brand-primary` + 外偏移 2px | `AC-MF-11` | 同上 §4 |

## 与他人共存

输入区的座位是共享的：`conversation.input.left` / `.right` / `conversation.input.dock` / `conversation.composer.dock` / `conversation.input.overlay` 都是 `list`，多个插件会同时坐在里面。

| 冲突类型 | 表现 | 你的处置 |
| --- | --- | --- |
| 未声明 order | entry 落在默认 0，顺序由注册时序决定 | 补上声明，取现有最大值 + 10（`SL-MF-03`、`SL-MF-05`） |
| order 撞车 | 同一座位多个占用者同值 | 先取空缺值；撞车后按「声明了区间意图 → 登记更早 → 后到者让位」裁决（`CF-MF-03`、`CF-RC-04`） |
| 视觉空间争抢 | 同一行控件过多、命中区被压到 <20×20 | 后到者收敛为菜单或折叠，不得要求先到者缩小（`CF-MF-05`） |
| 语义重复 | 两个插件提供同名同功能入口 | 后到者把入口并入自身面板，不新增顶层级入口（`CF-RC-06`） |

- 同一插件在同一座位的 entry 不超过 3 个（`SL-AD-07`，自检项 `B04`）；超出说明你把座位当菜单用了，应改用 `keyed` 或自带弹出层。
- 同一 bundle 在同一座位的相邻 order 间隔 ≥5（`SL-RC-06`，自检项 `B03`）。
- 占用了 `single` 座位就是遮蔽官方界面：必须在插件 README 或 manifest 显式声明「本插件遮蔽官方 X 界面」并提供关闭开关（`SL-MF-08`，自检项 `A11`）。
- 冲突裁决只针对座位与视觉空间，不针对功能价值；「我的功能更重要」不构成占用理由（[80-conflicts.md](../spec/80-conflicts.md) §5）。

## 实现资源

| 用途 | 组件 id | 路径 |
| --- | --- | --- |
| 工具行里的紧凑触发器／状态胶囊 | `pill` | [components/controls/Pill](../components/controls/Pill/SPEC.md) |
| 需要提交语义或确认的动作 | `button` | [components/controls/Button](../components/controls/Button/SPEC.md) |
| 立即生效的布尔开关 | `switch` | [components/controls/Switch](../components/controls/Switch/SPEC.md) |
| 工具提示里的键位提示 | `shortcut-keys` | [components/controls/ShortcutKeys](../components/controls/ShortcutKeys/SPEC.md) |
| 自己拼一条工具行容器 | `toolbarrow` | [components/layout/ToolbarRow](../components/layout/ToolbarRow/SPEC.md) |

<!-- component: pill | 可点击胶囊的三种状态与焦点环。输入卡工具行里的权限胶囊与模型选择器就是这一族几何。 -->

## 规格

单位 px。除标注外均为浏览器现测的计算样式。

| 部位 | 数值 | 标记 | 来源 |
| --- | --- | --- | --- |
| 输入卡 | 780 × 114（新会话页），圆角 28，padding `8px 0 0 0` | `[官方源码]` | `docs/reference/composer-geometry.json` `RlGAzG_card` |
| 输入卡圆角来源 | `var(--dsw-radius-panel)` 解析为 28 | `[官方源码]` | `docs/reference/composer-geometry.json` `RlGAzG_card` 的 `radius: 28px` |
| 输入卡宽度 | `min(780px, 100%)` | `[本仓库建议]` | `website/shell/shell.css` `.sh-card` |
| 卡内间距 | gap 12 | `[官方源码]` | `docs/reference/composer-geometry.json` `RlGAzG_card` 的 `gap` |
| 输入区容器 | 780 × 52（`RlGAzG_input`），占位行 754 × 24 | `[官方源码]` | 同上 `RlGAzG_input`、`RlGAzG_placeholder` |
| 工具行 | 780 × 42，padding `2px 8px 6px 8px`，gap 12 | `[官方源码]` | 同上 `RlGAzG_row` |
| 行内工具区 | 140 × 28 | `[官方源码]` | 同上 `RlGAzG_tools` |
| 加号按钮 | 28 × 28，圆角 999，底 `rgb(245, 246, 247)` | `[官方源码]` | 同上 `RlGAzG_add`；可访问名称见 `data/ui-inventory.json` |
| 发送按钮 | 34 × 34，圆角 999，底 `rgb(65, 118, 230)` | `[官方源码]` | 同上 `RlGAzG_primary` |
| 权限胶囊 | 100 × 28，圆角 8，padding `0 4px 0 8px`，gap 4，标签 13/20 字重 500 | `[官方源码]` | 同上 `dlU_AG_trigger` |
| 模型选择器 | 180 × 28，圆角 8，padding `0 4px 0 8px`，gap 4，标签 13/20 | `[官方源码]` | 同上 `wq12jW_trigger` |
| 工具行触发器的宽度 | 100 与 180 之差来自标签长度（52 vs 118 宽的标签），不是两套定宽 | `[官方源码]` | 同上 `dlU_AG_triggerLabel`（52 × 20）、`wq12jW_triggerLabel`（118 × 20） |
| 触发器折叠角 | 14 × 14，色三级 | `[官方源码]` | 同上 `dlU_AG_chevron` |
| 输入区座位高度 | 128（新会话页 1283 × 128） | `[官方源码]` | [10-frame-layout.md](../spec/10-frame-layout.md) §2 |
| 卡下状态行（dock） | `RlGAzG_dock` 464 × 26，padding-top 4，gap 12 | `[官方源码]` | `docs/reference/status-line.json` 中 `cls` 为 `RlGAzG_dock` 的链节 |
| dock 内部两级 | 外容器 `iq1doa_root` gap 12、内胶囊 `iq1doa_pill` gap 6 padding `1px 8px` | `[官方源码]` | 同上；采集文本形如 `≈$0.0013`（12/20，色 `rgb(129, 133, 140)`） |
| 工具行加号命中区 | 28 × 28 | `[运行时实测]` | `data/ui-inventory.json` `RlGAzG_add` 的 `size`；`docs/reference/composer-geometry.json` 同值 |
| 工具行触发器命中区 | 100 × 28（权限）、180 × 28（模型） | `[运行时实测]` | `data/ui-inventory.json` `dlU_AG_trigger` 的 `size`；`docs/reference/composer-geometry.json` 同值 |

## 观察到的官方做法

以下都是产品实际这么渲染的，带证据。

1. 输入区是一个纵向三段堆叠，三段各有座位名，不是一块自由画布（来源：`data/slots.json` 的 `conversation.input.dock` / `conversation.composer.bar` / `conversation.composer.dock`）。
2. 工具行左右分工：左边是「加东西」与「本次发送的权限」，右边是「模型」与「发送」（来源：`docs/reference/composer-geometry.json`：`RlGAzG_add` 在 x=540、`dlU_AG_trigger` 在 x=580、`wq12jW_trigger` 在 x=1066、`RlGAzG_primary` 在 x=1270）。
3. 工具行对外只开放左右两个 `list` 座位，其余是 `single`（来源：`data/slots.json` 的 `conversation.input.left` / `.right` 为 `list`，`.permission` / `.plan` / `.model` / `.activity` / `.attachments` 为 `single`）。
4. 官方给工具行触发器定了统一几何：同高 28、同圆角 8、标签 13/20（来源：`docs/reference/composer-geometry.json` 的 `dlU_AG_trigger` 与 `wq12jW_trigger`，两者 `rect` 高度均为 28、`radius` 均为 8、`font` 均为 `13px/20px`）。
5. 官方自己在触发器上加粗了一档：权限胶囊的 `font` 为 `13px/20px 500`，模型选择器为常规字重（来源：`docs/reference/composer-geometry.json` 两条 `font` 字段）。规范把这一点写成「只有权限胶囊重一档」（[20-controls.md](../spec/20-controls.md) `CT-MF-23`）。
6. 卡下方的 dock 由占用者填内容、由产品给盒子：夹在卡与视口下沿之间（来源：`website/shell/parts/composer.js` 文件头注释：`composerSeat 最后贴住视口下沿：卡 → dock 26px → 底 4px`）。
7. 官方在工具行上的可访问做法是显式命名：加号「添加文件或调用指令」、权限「访问模式，当前：完全权限」（来源：`data/ui-inventory.json` 的 `arias`）。

## 推荐插件作者这样做

以下是本仓库建议，附理由。

1. **先回答「属于哪一段」，答案不唯一就不要动手。** 理由：`FL-MF-01` 要求归属唯一；输入区三段的宽度与滚动行为不同，放错段落在窄窗口下会先坏。（`[本仓库建议]`）
2. **只放作用于本次输入或本次发送的控件。** 全局开关放会话头部或右栏；理由：`FL-MF-03`。（`[本仓库建议]`）
3. **纵向插入点优先级：`conversation.input.dock` > `conversation.composer.dock` > `conversation.input.overlay`。** 前两者是稳定的整宽插入点，第三个只用于瞬时 UI（补全、下拉、提示），严禁常驻；理由：`FL-MF-04`，自检项 `A04` 会直接检查 overlay 里有没有常驻 UI。（`[本仓库建议]`）
4. **`conversation.composer.dock` 里只放只读状态，不要放唯一操作入口。** 理由：该行在视觉上是「气氛信息」，不是操作区；而且它只有 26px 高，命中区难以达标。（`[本仓库建议]`）
5. **新增 `list` entry 必须显式声明 order，取值 = 该座位现有最大值 + 10。** 理由：未声明 order 会落到默认 0，顺序由注册时序决定；官方 `shell.overlay` 14 个占用者里 11 个未声明 order 就是反例，而 `conversation.session.header.utilities` 的 -10 / -5 / 5 是正例（`SL-MF-03`、`SL-MF-05`；`data/raw/occupancy-2026-10-01.json`，采集时间 2026-10-01）。（`[本仓库建议]`）
6. **不要占用 `single` 座位。** `conversation.input.permission` / `.plan` / `.model` / `.activity` / `.attachments` 都是 `single` 且 `replaceRisk: shadows-shipped-ui`，占用即遮蔽官方控件（来源：`data/slots.json`）。（`[本仓库建议]`）
7. **禁止遮蔽官方唯一入口。** 判定方法：该控件在官方 UI 中位于 `single` 座位且不存在替代路径；输入区里明确属于此类的是发送与停止。（`SL-MF-09`，自检项 `A12`）（`[本仓库建议]`）
8. **同行控件同高同圆角同间距，图标容器固定 16×16。** 触发器高度 28、圆角 8、间距 12（`CT-MF-23`）；行内容器高度 ≥28（`CT-MF-13`）。（`[本仓库建议]`）
9. **按钮必须用真 `<button>`，不要用 `div` + `onClick` 冒充。** `CT-MF-11` 会按「出现 `role="button"` 但无键盘事件处理」判定违规。（`[本仓库建议]`）
10. **用自己的 class，不要覆盖官方控件类。** `CT-MF-12` 判定「插件样式中出现对官方控件类的几何属性覆盖」。（`[本仓库建议]`）
11. **提供关闭开关。** 只要你的插件在输入区引入了可见元素，就要能一键移除；理由：输入区的空间预算属于用户，`SL-MF-08` 对遮蔽官方界面的座位已经要求关闭开关，输入区的可见新增应当同标准。（`[本仓库建议]`）
12. **同一段内可见控件不超过 6 个，超出的收进你自己的菜单。** `FL-RC-05`，自检项 `B01`。（`[本仓库建议]`）
13. **给每个纯图标按钮写可访问名称。** `AC-MF-14`、自检项 `A49`；官方在输入区已经这么做（见「观察到的官方做法」第 7 条）。（`[本仓库建议]`）

## 自查表

| 是／否 | 判定项 | 条文 |
| --- | --- | --- |
|  | 新增 UI 能一句话说清属于输入区哪一段 | `FL-MF-01` |
|  | 只放作用于本次输入或本次发送的控件 | `FL-MF-03` |
|  | `conversation.input.overlay` 里没有常驻 UI | `FL-MF-04` |
|  | 座位 id 全部来自 DSH 官方声明，未自造 | `SL-MF-01` |
|  | 每个 `list` entry 都显式声明了 order，且不撞车 | `SL-MF-03` / `SL-MF-05` |
|  | 没有遮蔽发送、停止、设置、关闭 | `SL-MF-09` |
|  | 同行控件同高同圆角，图标容器 16×16 | `CT-MF-02` / `CT-MF-13` |
|  | 所有可交互元素命中区 ≥20×20，常规控件达 28×28 | `AC-MF-01` |
|  | 纯图标按钮有可访问名称 | `AC-MF-14` |
|  | 窗口收窄时功能收起而非消失 | `AC-MF-16` |

## 来源与已知偏差

| 项 | 说明 | 标记 |
| --- | --- | --- |
| 输入卡高度两个值 | `composer-geometry.json` 实测 780 × 114（新会话页）；`website/shell/parts/composer.js` 注释写「会话里单行时 780 × 98」；[10-frame-layout.md](../spec/10-frame-layout.md) §2 两个都收，分别注明场景。不是矛盾，是两种草稿行数 | `[已知偏差]` |
| `conversation.input.dock` 的父座位 | `data/slots.json` 记父为 `conversation.content`（depth 0），`data/raw/slot-tree-2026-10-01.json` 的原始树把它放在 `conversation.composer.bar` 之下（其 `purpose` 却是「above the composer card」）。两处快照不一致；**座位名、kind、purpose 两处一致，只有父级归属不同**。定位置时以原始树为准，不要凭 `parent` 字段推断上下 | `[已知偏差]` |
| 「卡下方的 dock」对应哪个座位 | 原始树里「below the composer card」是 `conversation.composer.dock`，但 `website/shell/shell.css` 的 `.sh-status` 注释把它称作 `conversation.input.dock`。位置描述以原始树的 `purpose` 为准 | `[已知偏差]` |
| 工具行的水平间距 | `CT-RC-14` 建议行内相邻控件 8px，实测工具行是 `gap 12`。有实测的场景以实测为准（[components/layout/ToolbarRow/SPEC.md](../components/layout/ToolbarRow/SPEC.md) 第 11 条 check 记录了这一偏离） | `[已知偏差]` |
| 输入区的 Enter / Shift+Enter 行为 | 本仓库可核对的文件里没有记录 | 无证据 |
| 输入卡内部的 Tab 顺序 | 座位树没有声明 | 无证据 |
| 输入区浮层的 `z-index` | DSH 未公开浮层层级 token；本仓库不做断言。菜单用 100 / 1100、Modal 用 1000 都是本仓库实现值，不是官方公开值 | 无证据 |
| 输入卡圆角 28 是否在圆角阶梯里 | `TK-MF-03` 只允许 18 / 14 与「官方容器自身圆角」；28 属于容器自身圆角，不是新增值 | `[已知偏差]` |
| dock 的组间距 | 采集链显示 12（`iq1doa_root` gap），而 `website/shell/parts/composer.js` 注释写「组间 14」。两处不一致；以采集链的 12 为准 | `[已知偏差]` |
| 插件在输入区的占用者数量 | 本仓库的占用者快照（`data/raw/occupancy-2026-10-01.json`）只覆盖 `shell.overlay` / `settings.section` / `conversation.session.header.utilities` / `sidebar.footer.action` 四个座位，**没有采集输入区** | 无证据 |

外部借鉴说明：本页引用的 `[OH]`（4/8 倍数与间距自检项）、`[HIG]`（命中区、对比度）属于外部指南借鉴，经过本仓库规范转写后引用；不引用任何平台专属数值（如系统组件名或移动端单位）。相关转写见 [20-controls.md](../spec/20-controls.md) §5 与 [60-accessibility.md](../spec/60-accessibility.md) §1。

## 依据

本页实际读过的文件：

- `website/shell/parts/composer.js`
- `website/shell/shell.css`
- `docs/reference/composer-geometry.json`
- `docs/reference/status-line.json`
- `data/slots.json`
- `data/raw/slot-tree-2026-10-01.json`
- `data/raw/occupancy-2026-10-01.json`
- `data/ui-inventory.json`
- `spec/10-frame-layout.md`
- `spec/11-slot-seats.md`
- `spec/20-controls.md`
- `spec/30-tokens.md`
- `spec/60-accessibility.md`
- `spec/70-checklist.md`
- `spec/80-conflicts.md`
- `components/controls/Pill/SPEC.md`
- `components/controls/ShortcutKeys/SPEC.md`
- `components/layout/ToolbarRow/SPEC.md`
- `website/demos/README.md`
