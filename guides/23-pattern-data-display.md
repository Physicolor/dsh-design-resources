# 数据展示

> 根据读数精度、比较任务和信息层级，为指标、只读字段、离散状态和补充明细选择合适的展示形式。

官方没有单独的「数据展示」组件族，因此本页提供形态选择、数值依据和自查项。官方做法与本仓库建议分开说明；相互矛盾的实现标为 `[已知偏差]`；未经核实的取值注明「无证据」。

## 适用情景

- 一个指标占了多少：上下文窗口、缓存命中、磁盘占用、任务进度。
- 一个对象的只读字段：模型参数、请求头、文件信息、环境变量。
- 一列离散状态：任务、会话、工具调用的成功 / 警告 / 失败 / 进行中 / 空闲。
- 一片补充明细，默认收起来：逐文件明细、原始参数、高级选项。

## 何时不要用及替代

| 你的数据 | 不要用 | 原因 | 改用 |
| --- | --- | --- | --- |
| 需要读出精确数值 | 只有比例的条 | 条旁百分比是取整值 | 键值列表，把精确值写进文字 |
| 几组数据横向比长短 | 单条轨道的条 | 没有共用基线，长度不可比 | 共用基线的条形图 |
| 让用户拖着改数值 | 条或圆点 | 两者都是只读展示，不可聚焦 | 滑块 / 输入控件 |
| 表达开与关 | 条 | 长度表达程度，开关只有两个状态 | Switch 或状态圆点 |
| 表达「跑到一半」 | 状态圆点 | 圆点只有几个离散档 | 迷你条形图 |
| 只有一两行、重点是数值本身 | 键值列表 | 语义过宽，数值不够醒目 | 数值 + 副标的指标行 |
| 用户需要编辑这些字段 | 键值列表 | 只读说明结构 | 输入控件 |
| 值本身是列表、树、代码块 | 键值列表 | 行距会把块级内容压扁 | 自定义卡片或代码块 |
| 内容用户每次都要看 | 可展开行 | 把必经内容藏进抽屉 | 直接写成标题加正文 |
| 点它是为了跳到别处 | 可展开行 | 展开是「就地看到更多」 | 链接 |
| 一组内容只能看一个 | 可展开行 | 可展开行可以同时开多个 | 标签页 / 分段控件 |

来源：`components/data-display/{MiniBar,KeyValueList,StateDot,DisclosureRow}/README.md` 的「什么时候不要用它」。

## 界面结构

| 形态 | 结构 | 组件 id |
| --- | --- | --- |
| 键值列表 | `<dl>` 纵向 flex，每行 `<div>` 包 `<dt>` / `<dd>`；键列 `max-content`、值列 `1fr` | `key-value-list` |
| 迷你条形图 | 根元素即 `role="progressbar"`；轨道 `flex: 1` + 填充（宽度 = 百分比）；可选右侧取整百分比 | `mini-bar` |
| 状态圆点 | 标记 + 相邻文字；颜色与形状随状态变 | `state-dot` |
| 可展开行 | 一行 24px：左侧 16×16 图标盒（内嵌 14×14 字形）+ 标题 13/24 + 可选折叠态补充 | `disclosure-row` |

列表类容器用 `list-row-group`（分组标题 + 行），会话流里的数据面板用 `panel-seat`。

<!-- component: mini-bar | 迷你条形图。business / success / warn / error 四档语义色，显示百分比与不显示两种形态。 -->
<!-- component: key-value-list | 键值列表。键是短词、值可折行；divider 与 valueAlign 两档可选。 -->
<!-- component: state-dot | 状态圆点。五种状态，只有进行中是动画，减少动态时停住。 -->
<!-- component: disclosure-row | 可展开行。折叠与展开两态、整行可点与仅图标可点两种交互口径。 -->

## 关键状态

| 形态 | 状态 | 表现 |
| --- | --- | --- |
| 键值列表 | 长值 | `overflow-wrap: break-word` 折行，不截断、不撑破容器 |
| 键值列表 | 值靠右 | `valueAlign="end"`：`justify-self: end` + `text-align: end` |
| 迷你条形图 | 值更新 | 填充宽度 `width 120ms ease` 过渡；减少动态时 `transition: none` |
| 迷你条形图 | `max <= 0` 或非有限数 | `aria-valuemax` 为 0、进度恒为 0（退化输入） |
| 迷你条形图 | 值越界 | 夹紧到 `[0, max]` 再参与计算，`aria-valuenow` 也取夹紧值 |
| 状态圆点 | `ongoing` | 8 个 2×2 方块跑 1s 无限追逐动画，`animation-delay = (index − 8) × 125ms` |
| 状态圆点 | 减少动态 | 动画停掉，全部格子停在 `opacity: 0.6` |
| 可展开行 | 折叠 / 展开 | 折叠时 leading 为「图标 + 悬停箭头」且渲染 `collapsedContent`；展开时只留箭头 |
| 可展开行 | 悬停（折叠态） | 图标 `opacity 1→0`、箭头 `0→1`，各 `100ms ease`，只动 `opacity` |
| 数据面 | 加载中 | 列表用骨架屏；其他页面级加载用居中裸 spinner；一页只一种加载样式 |
| 数据面 | 失败 | 保留已加载数据可见，不清空内容显示错误 |

来源：四个组件的 `SPEC.md` 的 `states` 小节；末两行来自 `.agents/skills/dsh-client-ui-ux/SKILL.md`（[官方源码]，https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md）。

## 键盘与焦点

| 形态 | 可聚焦 | 键盘行为 |
| --- | --- | --- |
| 键值列表 | 否 | 不进入 Tab 顺序；值里放链接或按钮时焦点落在那个元素上 |
| 迷你条形图 | 否 | 纯展示：源码中不得出现 `tabIndex` / `onClick` / `onKeyDown` |
| 状态圆点 | 否 | 硬编码 `aria-hidden="true"`，不进入无障碍树 |
| 可展开行 | 是（`expandable` 为真时） | 整行可点：`role="button"` + `tabIndex=0`，Enter 与空格触发，空格调用 `preventDefault()`；仅图标：原生 `<button type="button">` |

焦点环规格：2px 实线 + `--dsw-alias-brand-primary`，外偏移 2px；容器带 `overflow: hidden` 时改用内偏移 `-2px`（来源：`components/data-display/DisclosureRow/SPEC.md`，依据 `spec/60-accessibility.md` 的 `AC-MF-11` / `AC-MF-12`）`[本仓库建议]`。

## 浅色深色

- 颜色一律取 `--dsw-*` 语义 token，不写字面色值（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md）`[官方源码]`。
- 四个组件的取色：键值列表键 `--dsw-alias-label-tertiary`、值 `--dsw-alias-label-primary`、分隔线 `--dsw-alias-border-l2`；迷你条形图轨道 `--dsw-alias-border-l1`、填充取 `business` / `success` / `warn` / `error` 四档；状态圆点 `done` / `warning` / `error` / `idle` 分别取 success / warn / error / `label-tertiary`，`ongoing` 取 `--dsw-static-deepseek-450`；可展开行 leading 取 `label-tertiary`、标题取 `label-secondary`（来源：四个组件的 `SPEC.md` `tokens` 小节）`[官方源码]`。
- 轨道色选 `--dsw-alias-border-l1`（半透明叠加：浅色 `#0000000a`、深色 `#ffffff0f`）而非不透明表面色，可自适应所在表面；代价是浅色一层底上轨道很淡，因此轨道可见性不作为信息载体（来源：`components/data-display/MiniBar/SPEC.md`）`[本仓库建议]`。
- token 口径按 `data/tokens.json` 的 `counts` 分开写：palette 77 / lightAliases 115 / darkAliases 119 / scale 207（来源：`data/tokens.json`，由 `scripts/collect-tokens.mjs` 从随包产物采集）`[运行时实测]`。四块作用域不同——`palette` 与 `scale` 在 `:root`，light 在 `body`，dark 在 `body[data-ds-dark-theme]`——不要相加后笼统称「113 个令牌」。
- 每对颜色都要在浅深两套主题下各验一次再交付（来源：`.agents/skills/dsh-client-ui-ux/SKILL.md`）`[官方源码]`。

## 窄窗口

- 键值列表的值列是 `minmax(0, 1fr)`，两列都能收缩，长 URL 折行不溢出；宽度不足不改变字号（`TK-RC-12`，来源：`spec/30-tokens.md`）`[本仓库建议]`。
- 迷你条形图轨道 `flex: 1` 随容器伸缩；填充与轨道同为 999px 圆角，轨道带 `overflow: hidden`，防极窄宽度下填充方角外露（来源：`MiniBar/SPEC.md`）`[本仓库建议]`。
- 状态圆点与可展开行是固定尺寸元素，不随窗口缩放；行内文字用省略号，被截断的文字要能在悬停时看全（来源：`components/patterns/ListRowGroup/SPEC.md`）`[官方源码]`。
- 窗口收窄时收起或折叠入口，不得删除入口（`AC-MF-16`，来源：`spec/60-accessibility.md`）`[外部指南借鉴]`；不要用固定 px 高度夹死文本容器（`AC-RC-17`，同文件）`[本仓库建议]`。

## 可访问性

| 判据 | 要求 | 条文 |
| --- | --- | --- |
| 可访问名称 | 迷你条形图必须有 `label` 或 `aria-label`，否则读屏只剩「进度条」 | `AC-MF-14` |
| 进度语义 | `role="progressbar"` + `aria-valuemin`（固定 0）+ `aria-valuemax` + `aria-valuenow`，缺一不可 | 组件 checks |
| 可见百分比 | 带 `aria-hidden="true"`，不得当作唯一数值来源 | 组件 checks |
| 颜色不是唯一线索 | 状态圆点旁必须有可读文字；`tone` 为 `warn` / `error` 时相邻要有文字说明 | `AC-MF-07` |
| 命中区 | 可展开行仅图标形态有效热区 20×24，低于常规目标 28×28 | `AC-MF-01` |
| 对比度 | 三级文字在浅色白底下约 3.7:1，低于 4.5:1（见 `[已知偏差]`） | `AC-MF-05` |
| 放大 | 浏览器放大 200% 时文本不截断、不重叠 | `AC-MF-15` |

## 实现资源

| 用途 | 组件 id | 路径 |
| --- | --- | --- |
| 一个对象的只读明细 | `key-value-list` | [KeyValueList](../components/data-display/KeyValueList/SPEC.md) |
| 单值比例 | `mini-bar` | [MiniBar](../components/data-display/MiniBar/SPEC.md) |
| 离散状态标记 | `state-dot` | [StateDot](../components/data-display/StateDot/SPEC.md) |
| 默认收起的补充明细 | `disclosure-row` | [DisclosureRow](../components/data-display/DisclosureRow/SPEC.md) |
| 分组行列表 | `list-row-group` | [ListRowGroup](../components/patterns/ListRowGroup/SPEC.md) |
| 会话流里的数据面板 | `panel-seat` | [PanelSeat](../components/patterns/PanelSeat/SPEC.md) |

## 规格

单位 px，写法为「值（来源：路径或 URL）」；标记见每行。

| 部位 | 数值 | 标记 | 来源 |
| --- | --- | --- | --- |
| 键值列表·键 | 13 / 20 | `[官方源码]` | `KeyValueList/SPEC.md`，锚官方 `ReadBlock.module.css` `.count` |
| 键值列表·值 | 14 / 22 | `[官方源码]` | 同上，锚 `Button.module.css` `.button` |
| 键值列表·列间距 / 行内上下内边距 | 12 / 4 | `[本仓库建议]` | 同上「建议值」：4 的倍数；行高由 13/20 与 14/22 的行盒撑开 |
| 键值列表·分隔线 | 0.5 + `--dsw-alias-border-l2` | `[官方源码]` | 同上，锚 `MarkdownText.module.css` `.markdown hr`；0.5px 发丝线政策见 https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md |
| 迷你条形图·条高 / 与百分比间距 | 8 / 8 | `[本仓库建议]` | `MiniBar/SPEC.md`「建议值」：均为 4 的倍数 |
| 迷你条形图·圆角 | 999（胶囊） | `[官方源码]` | 同上，锚 `Tag.module.css` `.tag`；胶囊须在同一规则配 `corner-shape: round`（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md） |
| 迷你条形图·过渡 / 百分比字号 | `width 120ms ease` / 12 / 18 | `[官方源码]` | 同上，锚 `Switch.module.css` `.thumb` 与 `Button.module.css` `.sm` |
| 迷你条形图·轨道色 | `--dsw-alias-border-l1` | `[本仓库建议]` | 同上；浅色 `#0000000a`、深色 `#ffffff0f` |
| 状态圆点·外径 / 实心核 | 10 / `inset: 20%`（核 = 外径的 60%） | `[官方源码]` | `StateDot/SPEC.md`，锚官方 `lib/index.js` 的 `size = 10` 与 `StateDot.module.css` `.dot::after` |
| 状态圆点·ongoing | 8 个 2×2；`(index − 8) × 125ms`；台阶 `1 / 0.6 / 0.35 / 0.15` | `[官方源码]` | 同上，锚官方 `MATRIX_CELLS` 与 `@keyframes dsh-state-dot-chase` |
| 状态圆点·实拍实心核 | 8 × 8（反推外径约 13.3） | `[运行时实测]` | `StateDot/SPEC.md`「真实场景」，对应 `docs/reference/04-settings-models.png` |
| 可展开行·行高 / leading 盒 / 内嵌字形 | 24 / 16 / 14 | `[官方源码]` | `DisclosureRow/SPEC.md`，锚官方 `DisclosureRow.module.css` `.row`、`.leading` |
| 可展开行·标题 / 悬停过渡 | 13 / 24，色 `--dsw-alias-label-secondary` / `opacity 100ms ease` | `[官方源码]` | 同上 `.title` |
| 可展开行·仅图标形态有效热区 | 20 × 24 | `[本仓库建议]` | 同上：`::after { inset: -4px }` 被左侧 4px 裁掉后的实际值 |
| 行组·分组标题 / 行最小高 | 12 / 16，padding `8px 10px` / 40 | `[官方源码]` | `ListRowGroup/SPEC.md`，锚 `Menu.module.css` `.label`、`.item` |
| 行组·行圆角 | 10 | `[已知偏差]` | 同上；10 不在官方圆角阶梯（4 / 8 / 12 / 16 / 20 / 28）内 |
| 面板容器·圆角 / 内边距 | 12 / `12px 16px` | `[官方源码]` | `PanelSeat/SPEC.md`，锚 `ReadBlock.module.css` `.block` 与 `HoverCard.module.css` `.card` |
| 官方分组标题 / 计数 | 14 / 22 字重 500，28 × 22 / 14px normal，色 `rgb(173, 178, 184)`，8 × 19 | `[运行时实测]` | `data/ui-inventory.json` `fO69Vq_groupTitle`、`fO69Vq_count`（slot=main） |
| 设置页·插件分组标题 | 14 / 22，字重 500，28 × 22 | `[运行时实测]` | 同上 `cc-groupTitle`（slot=settings.section） |
| 用量面板·键值标签 / 键值值 | 12 / 18 色 `rgb(129, 133, 140)`，260 × 18 / 12 / 18 色 `rgb(15, 17, 21)` | `[运行时实测]` | 同上 `duc-profile-kv-label`、`duc-profile-kv-value` |
| 设置页·迷你仪表标签 / 值 | 12 / 18 色 `rgb(129, 133, 140)`，58 × 18 / 12 / 18 色 `rgb(97, 102, 107)`，16 × 18 | `[运行时实测]` | 同上 `cc-miniMeterLabel`、`cc-miniMeterValue` |
| 用量面板·占比条 | 10 × 36，圆角 `3px 3px 0 0` | `[运行时实测]` | 同上 `lc-ov-usage-bar lc-ov-usage-tokens`（竖条，半透明业务色填充） |
| 上下文面板·百分比 | 12px / 行高 normal，字重 700，34 × 16 | `[运行时实测]` | 同上 `lc-sl-pct` |
| 用量面板·统计数值 / 副标 | 20 / normal 字重 600，24 × 27 / 11 / normal 色 `rgb(97, 102, 107)`，46 × 15 | `[运行时实测]` | 同上 `lc-stat-value`、`lc-stat-sub` |
| 字号档位 | 26 / 18 / 16 / 14 / 13 / 12 / 11 / 10 | `[本仓库建议]` | `spec/30-tokens.md`：`TK-RC-13` 判定集，档位外字号判违规 |
| 命中区下限 / 常规目标 | 20 × 20 / 28 × 28 | `[外部指南借鉴]` | `spec/60-accessibility.md` `AC-MF-01`（HIG 转写） |
| 文本对比度阈值 | ≤17pt 需 4.5:1；≥18pt 或粗体 3:1 | `[外部指南借鉴]` | `spec/60-accessibility.md` `AC-MF-05`（HIG 引 WCAG） |
| token 口径 | palette 77 / light 115 / dark 119 / scale 207 | `[运行时实测]` | `data/tokens.json` 的 `counts` |

## 观察到的官方做法

1. 中性分隔与描边统一用 0.5px 发丝线，Chromium 画成一个设备像素；虚线提示与状态色描边仍为 1px（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md）`[官方源码]`。
2. 圆角只在 4 / 8 / 12 / 16 / 20 / 28 六档取值，并各有 token；同心嵌套用 `inner = max(0, outer − inset)`，如 outer R16、inset 4 → inner R12（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md）`[官方源码]`。
3. 共享组件目录把状态标记记成「10px 槽位里的实心点 + 一个持续旋转的进行中加载器」，并写明它 `aria-hidden`、名字由使用处负责（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-primitives/README.md）`[官方源码]`。
4. 同一份目录把可展开行记成 24px 紧凑行，折叠态悬停预览向下箭头、展开态保持向上箭头（来源：同上）`[官方源码]`。
5. 官方在插件页用 14/22、字重 500 的分组标题，右侧跟一个 14px 三级色计数；设置页里第三方插件的分组标题也是 14/22、字重 500（来源：`data/ui-inventory.json` 的 `fO69Vq_groupTitle`、`fO69Vq_count`、`cc-groupTitle`）`[运行时实测]`。
6. 真实界面里的用量与上下文面板由第三方插件渲染：键值行键值同为 12/18、只靠颜色分层；统计值是 20px 字重 600 配 11px 副标；占比条是 10 × 36 的竖条、顶部圆角 3（来源：`data/ui-inventory.json` 的 `duc-profile-kv-*`、`lc-stat-*`、`lc-ov-usage-bar`、`lc-sl-pct`）`[运行时实测]`。
7. 列表加载用骨架屏，其他页面级加载用居中裸 spinner，一页只允许一种加载样式（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md）`[官方源码]`。
8. 失败时保留数据可见、绝不清空内容显示错误；配色要在浅深两套主题下都验过；功能 CSS 字重上限 500（来源：同上）`[官方源码]`。
9. 渲染不可信模型输出时丢原始 HTML、限制链接、解析 ANSI 转义（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-primitives/README.md）`[官方源码]`。

## 推荐插件作者这样做

1. 先定形态再挑组件；同一个数字只出现在一个组件里，既画条又列进键值列表会让两处可能不一致（来源：`MiniBar/README.md`）`[本仓库建议]`。
2. 精确读数写进文字，条只回答「离满还有多远」；可见百分比取整且 `aria-hidden`，不能当唯一数值来源（来源：`MiniBar/SPEC.md` `a11y`）`[本仓库建议]`。
3. 条必须有名字：`label="缓存命中率"` 或 `aria-label`；没有名字时读屏只剩「进度条 82%」（来源：同上）`[本仓库建议]`。
4. 量程要能退化：分母为零时不要显示成「0%」，那是「算不出来」，改用 `aria-valuetext` 并在文字里说清（来源：同上）`[本仓库建议]`。
5. 越接近满越要说话：`warn` / `error` 只改颜色，必须在相邻文字里写出状态（`AC-MF-07`）`[本仓库建议]`。
6. 状态圆点旁必须有文字；组件两个分支都硬编码 `aria-hidden="true"`，只有圆点没有文字是缺陷（来源：`StateDot/SPEC.md` `a11y`）`[本仓库建议]`。
7. 只有「进行中」允许持续动画，其余状态加循环动画即违规（来源：`spec/40-motion.md` `MO-RC-07`）`[本仓库建议]`。
8. 默认收起的内容必须是补充信息；标题要能独立读懂，写「已修改文件」而不是「详情」（来源：`DisclosureRow/README.md`）`[本仓库建议]`。
9. 触摸为主的场景让整行可点：仅图标形态有效热区只有 20 × 24，低于常规目标 28 × 28（`AC-MF-01`）`[外部指南借鉴]`。
10. 不引入档位外字号：判定集是 {26, 18, 16, 14, 13, 12, 11, 10} 并与行高配对（来源：`spec/30-tokens.md` `TK-RC-13`）`[本仓库建议]`。
11. 数值排版优先取 `label-primary` / `label-secondary`；用 `label-tertiary` 时不要把关键信息只放在那里（来源：`spec/60-accessibility.md` 实测段）`[运行时实测]`。
12. 用 `panel-seat` 承载数据面板时不自带外边距，会话流行距交给宿主（`FL-AD-07` 建议 16）（来源：`PanelSeat/SPEC.md`）`[本仓库建议]`。

## 来源与已知偏差

| 项 | 说明 | 标记 |
| --- | --- | --- |
| 键值列表字号两套 | 插件实测键值同为 12/18、只靠颜色分层（`data/ui-inventory.json` `duc-profile-kv-label` / `-value`）；本仓库 `KeyValueList` 用键 13/20 + 值 14/22，把主从关系做进字号。两者都在官方档位内，取舍不同 | `[已知偏差]` |
| 状态圆点 ongoing 形态 | 公开 README 写「三级灰的 14px 旋转加载器」；本仓库 `StateDot/SPEC.md` 锚随包产物里的 8 格蓝色追逐矩阵。两处描述不是同一种观感 | `[已知偏差]` |
| 可展开行箭头与展开体 | 公开 README 写折叠悬停预览向下箭头、展开保持向上箭头，且标题与内容并排；本仓库 SPEC 锚「同一方向、不旋转」且子内容渲染在行下方 | `[已知偏差]` |
| 占比条方向 | 产品 `lc-ov-usage-bar` 是 10 × 36 竖条、顶部圆角 3；本仓库 `MiniBar` 是横向 999px 胶囊。两种形态的数值不可互相引用 | `[已知偏差]` |
| 百分比字重与行高 | 产品 `lc-sl-pct` 是 12px / 行高 normal、字重 700；本仓库 `MiniBar` 用 `Button.module.css` `.sm` 的 12/18 常规字重 | `[已知偏差]` |
| 圆角阶梯两套口径 | 公开 `docs/ui-radius.md` 只给 4/8/12/16/20/28；本仓库 `spec/30-tokens.md` `TK-MF-03` 只允许 18 / 14 与官方容器自身圆角；行组行的锚点是 10。三者互不相等，交付前按所在容器确认 | `[已知偏差]` |
| 字重上限与实测 600/700 | 官方要求新增或改动的功能 CSS 字重不超过 500，而实测的 600 / 700 出现在第三方插件自绘里，不构成对官方上限的反例 | `[已知偏差]` |
| 三级色对比度 | 浅色白底下 `--dsw-alias-label-tertiary` 约 3.7:1，低于 `AC-MF-05` 的 4.5:1，而 13px 说明与 10px 状态标签用的正是它；按「官方优先」记录、不覆盖官方控件 | `[已知偏差]` |
| cc-miniMeter 的仪表本体 | 采集只覆盖 `cc-miniMeterLabel` 与 `cc-miniMeterValue` 两个文本节点；仪表轨道与填充的几何没有实测数据 | 无证据 |
| 键值列表有没有官方对应物 | 官方共享组件目录里没有键值列表，几何是逐条锚定官方既有选择器得到的 | `[已知偏差]` |
| 表格形态 / 阴影尺度 | `data-display` 分类下没有表格组件；DSH 未公开阴影尺度表，本篇不对任何阴影数值作断言 | 无证据 |

## 依据

- `components/data-display/{KeyValueList,MiniBar,StateDot,DisclosureRow}/{README.md,SPEC.md}`
- `components/patterns/{ListRowGroup,PanelSeat}/SPEC.md`、`components/layout/SettingsRow/SPEC.md`
- `data/ui-inventory.json`（`duc-profile-kv-*`、`lc-ov-usage-bar`、`lc-sl-pct`、`lc-stat-*`、`cc-miniMeter*`、`cc-groupTitle`、`fO69Vq_groupTitle`、`fO69Vq_count`）
- `data/tokens.json` 的 `counts`；`spec/30-tokens.md`、`spec/60-accessibility.md`
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-primitives/README.md
