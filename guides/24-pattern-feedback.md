# 24 空 / 加载 / 错误 / 完成：四类反馈模式

> 先判断是哪一类反馈，再决定用哪个组件、放进文档流还是覆盖层、留多久、失败时用户能做什么。

插件作者最常做错的事，是四类反馈用同一个壳子接住：「还没加载」被画成「暂无数据」、一次性的成功也占一块常驻位置、失败只给一句红字不给出口、完成了却什么都不显示。这一页把空、加载、错误、完成四类的适用情景与替代、所在层级、关键状态与时长、键盘与焦点、主题与窄窗口行为列成可核对的表，并在「规格」一节给出可直接判定的自检条目。官方做法与本仓库建议严格分开；官方自相矛盾处标 `[已知偏差]`；每个数值都带来源标记与文件路径。

## 任务

- 判断手上这次反馈属于四类中的哪一类，以及不该用当前组件时改用什么。
- 决定它进文档流还是覆盖层，占用哪个座位、是否必须显式声明 order。
- 对齐关键状态与时长：进场、停留、退出、循环周期。
- 处理键盘、焦点与读屏播报：谁能被 Tab 到、播报是礼貌还是打断、关闭后焦点还给谁。
- 核对浅色 / 深色、窄窗口、放大到 200% 时的行为。
- 提交前跑一遍「规格」一节的二元条目。

## 四类反馈：适用情景与替代

| 类别 | 适用情景 | 不该用它时的替代 | 组件 | 层级 |
| --- | --- | --- | --- | --- |
| 空 | 确实没有数据、筛选零匹配、加载失败但结构还在、权限或配额挡住、刚删掉最后一条 | 加载中改运行圆环；一句话的错误改内联提示条；要用户在多件事里选改引导页 | EmptyState | 文档流内 |
| 加载 | 正在进行、时长不可估（会话行首、任务行左侧） | 时长可算改进度条；不足约一秒什么都不显示；完成 / 失败 / 警告改静态状态点或标签 | RunningRing、StateDot（ongoing） | 文档流内（随行） |
| 错误 | 整份提交失败且原因不属于任何一栏；网络不稳、配额将满、被降级的状态说明 | 字段级错误改贴在栏位下方；需要用户挑动作改用带按钮的区域或对话框；阻断性错误改对话框 | InlineNotice（error）、EmptyState（+ 重试） | 文档流内 |
| 完成 | 动作已完成、用户不需要再做任何一步（保存、复制、重连） | 需要读很久或需要动手改内联提示条；阻塞式确认改对话框；多条提示合并成一句 | Toast、StateDot（done） | 覆盖层 |

### 空状态

<!-- component: empty-state | 空状态：图标（可选）加标题、说明（可选）、一个主操作。产品里真实渲染的是空状态文案，这套组合形态没有被实测到。 -->

- 几何：标题 14px / 22px、字重 500；说明 13px / 20px；两者分别锚定官方 `Button.module.css` 的 `.button` 与 `Modal.module.css` 的 `.title`，说明走官方合成 token `--dsw-font-xs-13`（来源：components/feedback/EmptyState/SPEC.md）`[官方源码]`。
- 建议值：间距 12px、标题与说明之间 6px、动作上边距 16px、图标位 32×32、`max-width: 280px`、`padding: 32px 12px`（来源：components/feedback/EmptyState/SPEC.md）`[本仓库建议]`。
- `[已知偏差]` 产品里实测到的是空状态文案本体：`EBLgjq_emptyNotice` 284 × 16、`dsh_notification_empty` 530 × 20、`enhc-doctor-empty` 564 × 20；「图标 + 标题 + 说明 + 动作」的组合形态未出现在采集里（来源：components/origins.json 的 scenes 字段）`[运行时实测]`。

### 加载与运行态

<!-- component: running-ring | 14px 的运行圆环：25% 不透明度的轨道，加一段边转边伸缩的弧。它就是产品左栏会话「正在跑」时行首那一枚，数值全部来自运行中的界面。 -->

<!-- component: state-dot | 静态状态点。ongoing 走 8 个方块 1 秒追逐；done / warning / error / idle 是实心圆点，全部 aria-hidden，必须配文字。 -->

- 运行圆环：行内 14 × 14、`viewBox="0 0 24 24"`、两枚 `circle` 的 `cx/cy` 12 与 `r` 9.5、`stroke-width` 2、轨道 `opacity: .25`、弧 `stroke-dasharray: 12 150`、旋转 `1.5s linear infinite`、伸缩 `1.5s ease-in-out infinite`、颜色 `--dsw-alias-label-tertiary`、减动效停在 `18 150 / -3`（来源：docs/reference/running-row.json、components/feedback/RunningRing/SPEC.md）`[运行时实测]`。
- 采集细节：动画进行中抓到的计算值是 `20.7652px, 150px`（来源：docs/reference/running-row.json）；`12 150` 是声明初值与检查条目里的值（来源：components/feedback/RunningRing/SPEC.md）`[运行时实测]`。
- 状态点 `ongoing`：默认外径 10px，`viewBox="0 0 10 10"`，外圈 8 个 2 × 2 方块，`1s` 无限追逐，`animation-delay = (index − 8) × 125ms`，四段 `opacity` 为 1 / 0.6 / 0.35 / 0.15，分界在 0 / 12.5% / 25% / 37.5%，蓝色取 `--dsw-static-deepseek-450`（alias 层没有对应档）（来源：components/data-display/StateDot/SPEC.md）`[官方源码]`。
- 规则：进行中的周期只能取 `1s` 或 `1.5s` 且必须 `infinite`（MO-MF-12）；同一条「正在进行」一个界面里只用一种形态（MO-MF-13）；无限循环只允许表达正在进行的进程（MO-MF-07）；只动 `transform` / `opacity`（MO-MF-08）（来源：spec/40-motion.md）`[本仓库建议]`。
- 时长可算时不要用转圈顶替确定式进度（MO-MF-14）；等待不足约一秒不要显示圆环（来源：components/feedback/RunningRing/README.md）`[本仓库建议]`。
- `[已知偏差]` 官方两套并存：primitives 包给 `ongoing` 的是像素追逐矩阵，产品左栏会话行首实际渲染的是转圈环，库里那套在真实界面里没有出现；按 HIG 判定属官方未统一，不是设计分工，插件跟产品走（来源：components/feedback/RunningRing/SPEC.md、spec/40-motion.md 第 3.1 节）`[外部指南借鉴]`。

### 错误

<!-- component: inline-notice | 通用提示条：图标（可选）加文案，加可选关闭控件。几何逐条锚定官方 ConnectionIndicator，但 info / error 两种语气产品里没有对应物。 -->

- 适用：整份表单提交失败、原因不属于任何一栏；网络不稳、配额快满、草稿存在哪里；设置项的副作用提醒；页面还在用只是某件事被降级（来源：components/feedback/InlineNotice/README.md）`[本仓库建议]`。
- 字段级错误不要套提示条：错误文案由外层容器渲染在输入框下方，调用方透传 `aria-invalid` 与 `aria-describedby`（来源：components/controls/Input/SPEC.md）`[本仓库建议]`。
- 官方对应物（产品里真实挂载的 `ConnectionIndicator`）：单行高 28px、`padding: 0 8px`、圆角 8px、字体 12px / 18px 字重 500、图标容器 14 × 14、`column-gap: 4px`、`transition: background-color 160ms ease-out, color 160ms ease-out`、`warn` = 三级警告底 + 警告标签色、`success` = 三级成功底 + 成功主色、焦点环 2px 加 2px 外偏移（来源：components/feedback/InlineNotice/SPEC.md，取自产品 `app.asar` 内 `ConnectionIndicator.module.css`）`[官方源码]`。
- 建议值：通用提示条单行取 32 高、`padding: 0 10px`（关闭控件 20 × 20 要塞进去；要与产品原生提示并排时改用官方的 28 / 0 8）；多行形态 `height: auto` 加 `min-height: 32px`、上下内边距 6px、图标 `margin-top: 2px`；info / error 的底色用 `color-mix(in srgb, 主色 10%, transparent)` 从对应主色派生（来源：components/feedback/InlineNotice/SPEC.md）`[本仓库建议]`。
- `tone` 缺省时的底色（`--dsw-alias-bg-module-platform`）与显式传 `tone="info"` 时的派生底色不是同一个值，调用方要按需显式传（来源：components/feedback/InlineNotice/SPEC.md 的 states 表）`[本仓库建议]`。
- `[已知偏差]` `info` / `error` 两种语气产品里没有对应物；`--dsw-alias-state-error` 没有 tertiary 变体，`--dsw-alias-state-business-tertiary` 在 dark 主题下被定义为深色底，不能直接当浅色提示条底色（来源：components/feedback/InlineNotice/SPEC.md）`[已知偏差]`。

### 完成

<!-- component: toast | 瞬时提示：窗口顶部居中、停留 3 秒、自己淡走。role 是 alert，指针事件关闭，所以它不能承载任何要点击的操作。 -->

- 适用：动作已完成、用户不需要做任何一步；需要稍纵即逝的确认感又不想永久占位（来源：components/feedback/Toast/README.md）`[本仓库建议]`。
- 官方数值：`position: fixed`、`top: 40px`、`left: 50%`、`translateX(-50%)`、`z-index: 1100`、`pointer-events: none`、`padding: 12px 16px`、圆角 14px、字体 14px / 22px、`width: max-content`、`max-width: min(640px, calc(100vw - 48px))`、底色 `--dsw-alias-button-contrast-fill`、文字 `--dsw-alias-label-primary-inverted`、阴影 `--dsw-shadow-lv3`（来源：components/feedback/Toast/SPEC.md，取自产品 `app.asar` 内 `Toast.module.css`）`[官方源码]`。
- 时间线：进场 160ms `ease-out`（位移 -6px 加透明度）、停留 `HOLD_MS = 3000ms`、淡出 1000ms、卸载计时器为 `holdMs + 1000ms`，挂到 `document.body`，根节点 `role="alert"`（来源：components/feedback/Toast/SPEC.md）`[官方源码]`。
- 完成态的静态标记：`StateDot` 的 `done` / `warning` / `error` 分别取 `--dsw-alias-state-success-primary` / `warn-primary` / `error-primary`（来源：components/data-display/StateDot/SPEC.md）`[官方源码]`。
- `[已知偏差]` 160ms 与 1000ms 不在 `MO-MF-01` 的五档（100 / 150 / 200 / 300 / 350ms）内，也不满足「不超过 350ms」；曲线 `ease-out` / `ease` 不等于 `MO-MF-04` 的标准曲线。按 00-overview 第 4.1 节「官方优先」沿用官方值，checklist 的 A30 / A31 两项需人工确认（来源：components/feedback/Toast/SPEC.md、spec/00-overview.md）`[已知偏差]`。

## 放在哪：文档流内 vs 覆盖层

| 组件 | 层 | 落点 | 依据 |
| --- | --- | --- | --- |
| EmptyState | 文档流内 | 所占区块的竖向空间，替换原内容 | 组件形态（来源：components/feedback/EmptyState/SPEC.md）`[本仓库建议]` |
| InlineNotice | 文档流内 | 问题所在位置旁（表单上方或下方），常驻到被关闭 | 组件形态（来源：components/feedback/InlineNotice/SPEC.md）`[本仓库建议]` |
| RunningRing / StateDot | 文档流内（随行） | 列表行首、行内文字之前 | 采集：左栏会话行首 16 × 20 的槽位（来源：docs/reference/running-row.json）`[运行时实测]` |
| Toast | 覆盖层 | 框架级浮层，横跨所有栏并浮在滚动容器之外 | `createPortal(..., document.body)` 加 `position: fixed`（来源：components/feedback/Toast/SPEC.md）`[官方源码]` |

- 跨区域、覆盖全屏的框架级浮层走 `shell.overlay`，且必须显式声明 `order`（来源：spec/10-frame-layout.md 的内容归属判定树第 5 步、spec/11-slot-seats.md 的 `SL-MF-03`，清单 A09）`[本仓库建议]`。
- `conversation.input.overlay` 只用于必须盖在输入卡之上的瞬时 UI，不得常驻（来源：spec/10-frame-layout.md 的 `FL-MF-04`，清单 A04）`[本仓库建议]`。
- 跨区域内容不得用负 margin 或绝对定位越出所属区域边界；框架级浮层是唯一例外且必须走 `shell.overlay`（来源：spec/10-frame-layout.md 的 `FL-MF-08`，清单 A05）`[本仓库建议]`。
- `[已知偏差]` `shell.overlay` 有 14 个占用者，其中 11 个未声明 `order`、全部落在默认值 0，层级顺序由注册时序决定、不可预测（来源：data/raw/occupancy-2026-10-01.json，采集时间 2026-10-01；占用数量随本机启用的插件而变）`[运行时实测]`。
- 新插件进入已有占用者的座位时必须取空缺值（现有最大值 + 10），不得复刻已有值（`CF-MF-03`）；冲突判定只看声明与配置、不看注册时序（`CF-MF-01`）（来源：spec/80-conflicts.md）`[本仓库建议]`。

## 关键状态与时长

| 形态 | 进场 | 停留 | 退出 | 循环周期 | 来源 |
| --- | --- | --- | --- | --- | --- |
| Toast | 160ms `ease-out` | 3000ms | 1000ms 淡出；卸载在 hold + fade | 无 | components/feedback/Toast/SPEC.md `[官方源码]` |
| RunningRing | 无 | 持续 | 无（随所在行消失） | 旋转 1.5s `linear`；伸缩 1.5s `ease-in-out` | docs/reference/running-row.json `[运行时实测]` |
| StateDot（ongoing） | 无 | 持续 | 无 | 1s 无限，逐格错开 125ms | components/data-display/StateDot/SPEC.md `[官方源码]` |
| InlineNotice（语气切换） | 160ms `ease-out`（底色与文字色） | 常驻直到关闭 | 无动画，节点直接卸载 | 无 | components/feedback/InlineNotice/SPEC.md `[官方源码]` |
| EmptyState | SPEC 未列出任何过渡或动画 | 常驻到条件改变 | 无 | 无 | components/feedback/EmptyState/SPEC.md `[本仓库建议]` |

- 减动效分支：提示条的过渡在 `prefers-reduced-motion: reduce` 下为 `none`（来源：components/feedback/InlineNotice/SPEC.md）；Toast 去掉滑入位移、只保留延迟淡出（来源：components/feedback/Toast/SPEC.md）；运行圆环两条动画都停（来源：components/feedback/RunningRing/SPEC.md）`[官方源码]`。

## 键盘与焦点（含读屏播报）

| 组件 | Tab 可达 | 键盘 | 焦点去向 | 读屏 |
| --- | --- | --- | --- | --- |
| EmptyState | 自身不可交互，动作插槽里的控件各自可达 | 由插槽内控件决定 | 由插槽内控件决定 | 由调用方透传 `role="status"`；已由别处播报时加 `aria-hidden` `[本仓库建议]` |
| InlineNotice | 关闭控件是 `role="button"` 加 `tabIndex=0` 的 `<span>` | Enter / 空格触发关闭，组件自行 `preventDefault` 与 `stopPropagation` | 关闭后落回 `body`，调用方应还给触发元素 | 静态不传 `alert`；需要播报由调用方传 `role="status"` 或 `role="alert"` `[本仓库建议]` |
| Toast | 不可达（`pointer-events: none`，不接收点击） | 无 | 无 | 固定 `role="alert"`，会打断当前朗读 `[官方源码]` |
| RunningRing / StateDot | 不可达，`aria-hidden` | 无 | 无 | 圆环用视觉隐藏的「进行中」；状态点必须由相邻可读文字承担语义 `[官方源码]` |

- 播报语义分两档：`status` 是礼貌播报、不打断；`alert` 会打断当前朗读。异步出现的空状态与提示条由调用方把 `role` 透传到根节点（来源：components/feedback/EmptyState/SPEC.md、components/feedback/InlineNotice/SPEC.md）`[官方源码]`。
- Toast 不接收点击、也放不下按钮，因此不能承载唯一入口的操作；重要或信息量大的提示应调长 `holdMs` 或改用 InlineNotice（来源：components/feedback/Toast/SPEC.md）`[本仓库建议]`。
- 通用要求：所有可交互元素可 Tab 到达、Enter / Space 可触发、顺序与视觉一致（`AC-MF-09`）；焦点必须可见，禁止 `outline: none` 后无替代（`AC-MF-10`）；焦点环 2px 实线加 2px 外偏移（`AC-MF-11`）；不得被容器 `overflow: hidden` 裁剪（`AC-MF-12`）；纯图标按钮必须有可访问名称、装饰图标 `aria-hidden`（`AC-MF-14`）（来源：spec/60-accessibility.md，清单 A47 / A48 / A49）`[本仓库建议]`。

## 浅色与深色

- 颜色只走 `--dsw-*` 语义 token，源码中不得出现硬编码色值（`TK-MF-01`，清单 A23 / A19）；增强对比变体由宿主主题承担，禁止绕过 token（`AC-MF-08`，清单 A28）（来源：spec/30-tokens.md、spec/60-accessibility.md）`[本仓库建议]`。
- token 自身按 `light-dark()` 成对定义，例如 `--dsw-alias-label-tertiary: light-dark(neutral-bluish-600, neutral-bluish-400)`（来源：website/demos/a11y-board.html）`[官方源码]`。
- `[已知偏差]` 浅色白底实测：`--dsw-alias-label-primary` 约 18.9:1、`label-secondary` 约 5.8:1、`label-tertiary` 约 3.7:1（低于 4.5:1），而 13px 说明文字与 10px 状态标签用的正是三级色。按 00-overview 第 4.1 节「官方优先」记录为已知偏差、不覆盖官方控件；插件用 `label-tertiary` 时不要把关键信息只放在那里（来源：spec/60-accessibility.md、website/demos/a11y-board.html 的浏览器现算）`[运行时实测]`。
- 深色主题的对比度：无证据（本仓库只对浅色白底做过现算；`a11y-board` 的对比度表读的是当前主题的计算色值，未留下深色实测数字）。
- InlineNotice 的 info / error 底色改从对应主色 `color-mix` 派生，为的是一条规则同时覆盖两种主题（来源：components/feedback/InlineNotice/SPEC.md）`[本仓库建议]`。

## 窄窗口

| 组件 | 窄窗口行为 | 来源 |
| --- | --- | --- |
| Toast | `max-width: min(640px, calc(100vw - 48px))`；锚点按 `rect.left + rect.width / 2` 定位并监听 `resize` 重测 | components/feedback/Toast/SPEC.md `[官方源码]` |
| InlineNotice | 单行 `white-space: nowrap`，文案超出会被裁切，需改用多行形态 | components/feedback/InlineNotice/SPEC.md `[官方源码]` |
| EmptyState | `max-width: 280px` 加左右 12px 内边距，文本在容器内换行；根节点无固定 `height` | components/feedback/EmptyState/SPEC.md `[本仓库建议]` |
| RunningRing / StateDot | 固定 14px / 10px，不随容器缩放；同行文字负责被截断的部分 | components/feedback/RunningRing/SPEC.md、components/data-display/StateDot/SPEC.md `[运行时实测]``[官方源码]` |

- 功能不随空间变化，只改变可见量：窗口收窄时收起或折叠，不得删除入口（`AC-MF-16`，清单 A51）；不得用固定 px 高度夹死文本容器（`AC-RC-17`，清单 B13）；浏览器放大 200% 时文本不截断、不重叠（`AC-MF-15`，清单 A50）（来源：spec/60-accessibility.md、spec/70-checklist.md）`[本仓库建议]`。
- 官方 `ConnectionIndicator` 在窄容器里的行为：无证据（采集只覆盖 1570 × 905 视口，来源：docs/reference/running-row.json）`[运行时实测]`。

## 可访问性

- 命中区：任何可交互元素不得小于 20 × 20，常规控件目标 28 × 28，相邻命中区不重叠（`AC-MF-01` / `AC-MF-03`，清单 A43）；含图标按钮的容器行高 ≥28（`AC-MF-04`，清单 A44）（来源：spec/60-accessibility.md）`[本仓库建议]`。
- Toast 整体 `pointer-events: none`、不是可交互元素，命中区要求不作用于它；InlineNotice 的关闭控件 20 × 20 达到下限但小于常规控件目标 28 × 28（来源：components/feedback/Toast/SPEC.md、components/feedback/InlineNotice/SPEC.md）`[本仓库建议]`。
- 对比度：≤17pt 文本 ≥4.5:1，≥18pt 或粗体 ≥3:1（`AC-MF-05`，清单 A45）；非文本 UI 元素建议 ≥3:1（`AC-MF-06`）（来源：spec/60-accessibility.md）`[本仓库建议]`。
- 颜色不得是唯一的信息载体（`AC-MF-07`，清单 A46）：提示条四种语气在灰度下差别有限，需要带图标或在文案里写明状态；状态点必须有相邻可读文字（来源：components/feedback/InlineNotice/SPEC.md、components/data-display/StateDot/SPEC.md）`[本仓库建议]`。
- 动效：必须有 `prefers-reduced-motion: reduce` 分支（`MO-MF-09`，清单 A34），且用媒体查询或 `matchMedia` 监听实现（`MO-MF-10`）；加载指示器不得有大幅位移（来源：spec/40-motion.md）`[本仓库建议]`。
- 定时关闭对认知障碍用户不友好：信息量大或重要时应调长 `holdMs`，或改用 InlineNotice（来源：components/feedback/Toast/SPEC.md）`[本仓库建议]`。

## 实现资源

| 用途 | 路径 |
| --- | --- |
| 空状态组件（README / SPEC / demo） | components/feedback/EmptyState/ |
| 内联提示条组件 | components/feedback/InlineNotice/ |
| 运行圆环组件 | components/feedback/RunningRing/ |
| 瞬时提示组件 | components/feedback/Toast/ |
| 静态状态点组件 | components/data-display/StateDot/ |
| 输入框错误态约定 | components/controls/Input/SPEC.md |
| 运行态实采数据 | docs/reference/running-row.json |
| 进行中动效与时长五档 | spec/40-motion.md |
| 座位与跨区域归属 | spec/10-frame-layout.md |
| 座位占用纪律 | spec/11-slot-seats.md |
| 可访问性（对比度、命中区、焦点） | spec/60-accessibility.md |
| 冲突裁决 | spec/80-conflicts.md |
| 座位占用快照 | data/raw/occupancy-2026-10-01.json |
| 官方 / 建议归属 | components/origins.json |
| 演示（对比度现算 / 冲突 / 动效） | website/demos/a11y-board.html、website/demos/conflict-board.html、website/demos/motion-select.html |
| 提交前二元清单 | spec/70-checklist.md |

## 规格

对插件作者的可判定条目。出处栏给出条文号或组件文件；无对应条文的是本页新增的建议，理由写在同栏。

| 条目 | 判定（是 / 否） | 出处 |
| --- | --- | --- |
| 四类反馈没有共用同一个壳 | 加载中出现的不是空状态文案；失败与「真的没有」不画成同一样子 | components/feedback/EmptyState/README.md `[本仓库建议]` |
| 持续动效的频率合规 | 周期取 1s 或 1.5s 且 `animation-iteration-count: infinite` | `MO-MF-12`，清单 A32 |
| 一条信息只用一种运行形态 | 同一行不同时出现圆环与追逐方块或三点 | `MO-MF-13` |
| 减动效分支存在 | 样式表含 `@media (prefers-reduced-motion: reduce)` | `MO-MF-09` / `MO-MF-10`，清单 A34 |
| 循环与过渡只动合成属性 | 不动 `width` / `height` / `top` / `left` / `margin` | `MO-MF-08`，清单 A33 |
| 覆盖层的座位与顺序 | 走 `shell.overlay` 且显式声明 `order`，取该座位现有最大值 +10 | `FL-MF-08`、`SL-MF-03`、`CF-MF-03`，清单 A09 / A10 |
| 输入卡浮层无常驻 UI | `conversation.input.overlay` 里没有常驻元素 | `FL-MF-04`，清单 A04 |
| 没有越界覆盖 | 无负 margin 或绝对定位越出所属区域 | `FL-MF-08`，清单 A05 |
| 颜色全部来自语义 token | 源码无 hex / rgb / hsl 硬编码 | `TK-MF-01`，清单 A19 / A23 |
| 颜色不是唯一线索 | 灰度下四种语气与五个状态仍可区分 | `AC-MF-07`，清单 A46 |
| 文本对比度达标 | ≤17pt 文本 ≥4.5:1 | `AC-MF-05`，清单 A45 |
| 命中区达标 | 可交互元素 ≥20 × 20；含图标按钮容器行高 ≥28 | `AC-MF-01` / `AC-MF-04`，清单 A43 / A44 |
| 焦点可见 | 有焦点样式，且未以 `outline: none` 移除后无替代 | `AC-MF-10` / `AC-MF-11`，清单 A48 |
| 装饰与命名的分工 | 装饰图标 `aria-hidden`；纯图标按钮有可访问名称 | `AC-MF-14`，清单 A49 |
| 状态点永远配文字 | 每个 `StateDot` 旁有承担语义的可读文本 | components/data-display/StateDot/SPEC.md 的 a11y 节 |
| 提示不承载必经操作 | Toast 不承载唯一入口；InlineNotice 不用于多选一 | components/feedback/Toast/SPEC.md 的 a11y 节 |
| 关闭后焦点有归处 | 提示条卸载后把焦点还给触发它的元素 | components/feedback/InlineNotice/SPEC.md 的 a11y 节 |

## 来源与已知偏差

### 依据

- `components/feedback/EmptyState/{README,SPEC}.md`、`components/feedback/InlineNotice/{README,SPEC}.md`、`components/feedback/RunningRing/{README,SPEC}.md`、`components/feedback/Toast/{README,SPEC}.md`、`components/data-display/StateDot/SPEC.md`：四类反馈的几何、状态、a11y 与 checks。
- `components/controls/Input/SPEC.md`：字段级错误由外层容器渲染，透传 `aria-invalid` / `aria-describedby`。
- `components/origins.json`：哪些组件在产品里真实存在（`official` 与 `scenes` 字段）。
- `docs/reference/running-row.json`：左栏会话行首运行圆环的实采 SVG 与动画值（1570 × 905 视口）。
- `spec/10-frame-layout.md`、`spec/11-slot-seats.md`、`spec/30-tokens.md`、`spec/40-motion.md`、`spec/60-accessibility.md`、`spec/70-checklist.md`、`spec/80-conflicts.md`：层级归属、座位 order、token、动效、可访问性、清单与冲突裁决。
- `spec/00-overview.md` 第 4.1 节：官方实现优先的处理方式。
- `data/raw/occupancy-2026-10-01.json`：座位占用者快照（采集时间 2026-10-01）。
- `website/demos/a11y-board.html`：对比度按 WCAG 相对亮度公式在浏览器里现算。

### 已知偏差

- 官方 `ongoing` 有两套实现（primitives 包的像素追逐矩阵与产品实际渲染的转圈环），真实界面里只出现了后者。
- `label-tertiary` 在浅色白底上约 3.7:1，低于 4.5:1，而 13px 说明与 10px 状态标签用它；按官方优先记录，不覆盖官方控件 `[运行时实测]`。
- Toast 的 160ms / 1000ms 与 `ease-out` / `ease` 不在动效规范的五档与标准曲线内；按官方优先沿用，清单 A30 / A31 需人工确认 `[已知偏差]`。
- EmptyState 的「图标 + 标题 + 说明 + 动作」组合形态、InlineNotice 的 `info` / `error` 语气，在产品里都没有对应物，整组几何是 `[本仓库建议]`。
- 深色主题对比度、官方 `ConnectionIndicator` 在窄容器中的行为：无证据。
