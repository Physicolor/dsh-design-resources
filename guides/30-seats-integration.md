# 座位选择与扩展集成

> 在设计界面前先确定扩展座位、替代风险与插件共存方式。

这一页面向 DSH 第三方插件作者。读者不需要读官方 monorepo 的内部文档，只需要能用 `data/slots.json` 与公开的 `docs/subsystems/slots.md` 把自己的 UI 放到正确的位置上。座位随版本变化，权威清单是 DSH 自己声明的，本页只讲选择方法与占用纪律。

## 先看数字

<!-- demo: seat-map | 座位图：树里每个座位的名字、类型、作用域与用途都抄自实测座位树（data/slots.json，共 90 个），上面那扇界面是产品复刻，指针扫到哪一栏就标哪一栏。 -->

<!-- demo: conflict-board | 冲突裁决板：三张表用的都是真实占用登记（data/raw/occupancy-2026-10-01.json）——「换个时序」按钮把未声明 order 的那些换个注册次序，可见顺序跟着变。 -->

| 事实 | 数值 | 来源 |
| --- | --- | --- |
| 座位总数 | 90（来源：`data/slots.json` 的 `counts.seats`）`[运行时实测]` | 采集时间 2026-10-01 |
| 按类型 | `single` 38 / `list` 34 / `keyed` 15 / `chain` 3（来源：`data/slots.json` 的 `counts.byKind`）`[运行时实测]` | 同上 |
| 按作用域 | `root` 42 / `session` 43 / `session-maybe` 5（来源：`data/slots.json` 的 `counts.byScope`）`[运行时实测]` | 同上 |
| 按占用风险 | `shadows-shipped-ui` 41 / `none` 49（来源：`data/slots.json` 的 `counts.byRisk`）`[运行时实测]` | 同上；两组相加 = 90 |

41 个高风险座位不是 41 个「不许碰」的座位。`shadows-shipped-ui` 的实际含义是「占用它会遮蔽某个官方界面」，多数根本没必要碰；四个 `chain` 座位（`shell.quota-notice` / `sidebar.right.tab.guide` / `conversation.composer`，来源：`data/slots.json`）语义上是路由接管，和新增一个入口完全不是同一件事。

## 官方怎么做（观察到的官方做法）

以下都是官方可核对的做法，出自公开仓库 github.com/deepseek-ai/deepseek-harness（master，版本 0.2.0-rc.2，与本机运行版本一致）。

| 事实 | 原文位置 |
| --- | --- |
| UI 跨包只通过 slots；组件永远拿不到 `ctx`，数据与回调经 props 传入 | `packages/client/AGENTS.md`（ctx discipline 一节、slot 与 props 纪律）`[官方源码]` |
| 往别人的 slot 贡献用 `ctx.slots.inject(key, () => ctx.slots.register(...))`；它等真正的声明、声明塌陷时移除贡献、重新声明后再跑一次、随调用方 fiber 一起走 | `packages/client/AGENTS.md` 第 4 条、`docs/subsystems/slots.md` `[官方源码]` |
| 裸 `slots.register` 进一个未声明的 slot 仍然是错误（加载期失败） | `packages/client/AGENTS.md` 第 4 条 `[官方源码]` |
| 只能渲染自己 `children` 里声明的 slot key；声明即授权，且一个 live entry 只拥有一个声明 | `docs/subsystems/slots.md` `[官方源码]` |
| 座位名镜像组合路径：`<domain>.<entry>.<hole>`（例 `tool.call.toolview`） | `packages/client/AGENTS.md` 第 2 条 `[官方源码]` |
| `single` 与「已被占用的 keyed 单元」是**替代点**；附加扩展应找新的 list `id` 或未占用的 key | `docs/subsystems/slots.md` 的 Extension rules `[官方源码]` |
| `list` 单元按必填 `id` 寻址，按 `order` 排序，然后才是注册顺序 | `docs/subsystems/slots.md` 的 Cardinality and scope `[官方源码]` |
| 注册一律在 `apply` 内，禁止模块级副作用；每个注册贡献都要能 dispose（HMR 安全） | `packages/client/AGENTS.md`、`packages/AGENTS.md` `[官方源码]` |
| 一个 UI 功能 = 一个插件包；`dsh.client` manifest 固定 `platform: 'web'` 且必须有 `./client` 导出 | `packages/client/AGENTS.md` `[官方源码]` |
| 浮起表面 `border: 0` + `box-shadow: var(--dsw-elevation-*)`，不要叠 `--dsw-alias-border-*` 边框 | `docs/web-styling.md`（Component rules）`[官方源码]` |
| 圆角只取 4 / 8 / 12 / 16 / 20 / 28，对应 `--dsw-radius-xs/sm/md/lg/xl/panel` | `docs/ui-radius.md`（Select the radius）`[官方源码]` |

官方写出 `order` 纪律但没有给出分段值，也没有写「同一个 list 座位最多几个 entry」。这两处是本仓库建议，见下节。

## 占用登记说了什么

`data/raw/occupancy-2026-10-01.json` 是本机 2026-10-01 19:02 的真实占用者快照（采集方式：`cordis_inspect_query` → client / Slots / listSubTree）。它的 `caveat` 明说：占用数量取决于当时装了哪些插件，引用时必须同时说明采集时间。

| 座位 | 类型 / 作用域 | 占用者 | 未声明 order | 已知撞车 | 来源 |
| --- | --- | --- | --- | --- | --- |
| `shell.overlay` | list / root | 14 | 11 | 无 | `data/raw/occupancy-2026-10-01.json` `[运行时实测]` |
| `settings.section` | list / root | 11 | 0 | order 40 三个（research-cordis / market / ui-harmony） | 同上 `[运行时实测]` |
| `conversation.session.header.utilities` | list / session | 4 | 1 | 无 | 同上 `[运行时实测]` |
| `sidebar.footer.action` | list / root | 4 | 2 | 无 | 同上 `[运行时实测]` |

三个 `order` 为 40 的占用者（research-cordis / market / ui-harmony，来源：同文件 `settings.section.summary.orderFortyIds`）与 11 个未声明 order 的 `shell.overlay` 占用者，都是同一类缺陷的两个面：**可见顺序不再由声明决定**。按 `CF-MF-01`，顺序依赖注册时序即判为缺陷，责任在未声明的一方。

## 裁决规则

| 条号 | 规则 | 效力 | 来源 |
| --- | --- | --- | --- |
| `CF-MF-01` | 冲突判定只看声明与配置，不看注册时序；顺序依赖时序即缺陷 | 强制（本仓库） | `spec/80-conflicts.md` `[本仓库建议]` |
| `CF-MF-02` | `single` 被遮蔽时 order 不参与裁决——order 对 single 无意义，被遮蔽方不得靠调 order 对抗 | 强制（本仓库） | 同上 `[本仓库建议]` |
| `CF-MF-03` | 进入已有占用者的座位，目标 order 被占用时必须取空缺值（现有最大值 +10），不得复刻已有值 | 强制（本仓库） | 同上 `[本仓库建议]` |
| `CF-MF-05` | 视觉空间争抢（同行控件 >6 或命中区被压到 <20×20）时，后到者收敛为菜单或折叠，不得要求先到者缩小 | 强制（本仓库） | 同上 `[本仓库建议]`、清单 A43 |
| `CF-RC-04` | order 撞车的临时裁决：声明了区间意图者优先 → 登记更早者优先 → 仍无法区分则由后到者让位 | 推荐（本仓库） | 同上 `[本仓库建议]` |

申诉路径写在 `spec/80-conflicts.md` 第 4 节：先提交座位占用登记（座位名、类型、order、用途、截图、插件版本），再按条号向占用方仓库提 issue。涉及 `shadows-shipped-ui` 座位且遮蔽方没有关闭开关的，上报 DSH 官方——这超出社区规范能裁决的范围。

## 推荐插件作者这样做

以下都是本仓库建议，附理由。它们约束的是**新写的界面**，不推翻产品自身实现。

| 建议 | 理由 | 标记 |
| --- | --- | --- |
| 座位 id 一律来自 `data/slots.json`，不要自造 | 未声明的 slot 不保证渲染；`A07` 是自动检测项 | `[本仓库建议]` |
| 先判断「无会话时是否需要存在」，据此选 `root` / `session-maybe` / `session` | 选错会在没有会话时渲染空壳，`A08` 半自动检测 | `[本仓库建议]` |
| 优先拿新的 list `id`；需要多目标分发用未占用的 key；`chain` 只在确实要接管路由时用 | 官方明确 `single` 与已占用的 keyed 单元是替代点（`docs/subsystems/slots.md`） | `[本仓库建议]` |
| 每个 list entry 显式声明 order，取该座位当前最大值 +10 | `A09` / `A10` 是最高频违规项，也最容易自动化 | `[本仓库建议]` |
| order 分段：≤ -10 框架级、-9..-1 前置、0 留给官方既有项、1..99 常规按 +10 递增、≥100 保留 | 让「忘记声明」与「有意居中」可区分，并给后续插入留空间；`B02` | `[本仓库建议]` |
| 同一 bundle 在同一座位的相邻 order 间隔 ≥5，同一座位不超过 3 个 entry | `B03` / `B04`；超出说明该座位被当菜单用，应改用 keyed 或自带弹出层 | `[本仓库建议]` |
| 占用 `shadows-shipped-ui` 座位时，在 README 写明「遮蔽官方 X 界面」并提供关闭开关 | `A11`；`SL-MF-08` | `[本仓库建议]` |
| 不遮蔽官方唯一入口：发送、停止、设置总入口、关闭 | `A12`、`SL-MF-09`；判定方法是该控件在官方 UI 里位于 `single` 且无替代路径 | `[本仓库建议]` |
| `keyed` 的 key 必须是常量或稳定标识，禁止时间戳 / 随机数 / 会话内递增序号 | `A13`；key 变更属破坏性变更（官方未公开 key 稳定性要求） | `[本仓库建议]` |
| `chain` 未匹配时必须回落到官方实现，不吞未知输入 | `A14`、`SL-MF-12` | `[本仓库建议]` |
| 注册写在 `apply` 内，用 `ctx.slots.inject` 而不是裸 `register`，并保证可 dispose | 官方明文；HMR 下模块级副作用会重复注册 | `[本仓库建议]` |
| 新增浮起表面用 `border: 0` + `--dsw-elevation-*`，不要给官方控件加第二层边框 | 官方 `docs/web-styling.md` 的 elevation spec 会拒绝边框与阴影配对 | `[本仓库建议]` |
| 圆角只取 4 / 8 / 12 / 16 / 20 / 28 | 官方 `docs/ui-radius.md`；`A25` 自动检测 | `[本仓库建议]` |

## 「我的 UI 该挂哪儿」判定流程

按顺序走，任一步得出结论即停止：

0. 先定区域：内容属于哪一条轨道、哪一段？不确定就先读[区域地图](../spec/05-region-map.md)。落在中栏的，先用[中栏的占用档位](../spec/15-middle-column.md)定下「占满 / 页签 / 浮层带」。`RG-MF-01`
1. 同类内容官方是否已有座位？有就复用，不要新造。`SL-MF-01` / `A07`
2. 没有座位，但内容确实属于这一屏？走[官方没有座位的位置](31-unofficial-regions.md)的借道纪律，并写明「官方无此座位」；不要因为它没有座位就硬塞进名字最像的那个。`RG-MF-08`
3. 无会话时是否必须存在？是 → `root` 或 `session-maybe`；否 → `session`。`SL-MF-02` / `A08`
4. 需要多插件共存 → `list`；需要在多个同类目标间分发 → `keyed`；需要接管一段路由 → `chain`；独占替换 → `single`（进第 6 步）
5. 目标是 `list` → 必须显式声明 order，取现有最大值 +10。`SL-MF-03` / `SL-MF-05`
6. 目标是 `keyed` → key 必须稳定。`SL-MF-11`
7. 目标 `replaceRisk` 是 `shadows-shipped-ui` → 写声明、给关闭开关、确认没遮蔽唯一入口。`SL-MF-08` / `SL-MF-09`

## 自查表

| 是 / 否 | 判定项 | 条文 | 检测 |
| --- | --- | --- | --- |
|  | 界面声明了自己占的是哪一档，且与实际渲染位置一致 | RG-MF-01 | 半自动 |
|  | 占用官方没有座位的区域时，已写明「官方无此座位」并给出降级行为 | RG-MF-08 | 半自动 |
|  | 所用座位 id 全部来自 DSH 官方声明 | SL-MF-01 | 自动 |
|  | 作用域与会话依赖一致 | SL-MF-02 | 半自动 |
|  | 每个 list entry 都显式声明了 order | SL-MF-03 | 自动 |
|  | order 不撞车且取现有最大值 +10 | SL-MF-05 | 自动 |
|  | 占用 `shadows-shipped-ui` 时有声明与关闭开关 | SL-MF-08 | 半自动 |
|  | 没有遮蔽发送 / 停止 / 设置总入口 / 关闭 | SL-MF-09 | 人审 |
|  | `keyed` 用稳定 key | SL-MF-11 | 半自动 |
|  | `chain` 未匹配时回落官方实现 | SL-MF-12 | 人审 |
|  | `sidebar.footer.action` 一个按钮 = 一个 list entry，无 wrapper | FL-MF-09 / SL-MF-13 | 自动 |
|  | 同行可见控件不超过 6 个 | FL-RC-05 | 自动 |

<!-- component: panel-seat | 往会话流里插一个自带边框与标题的块。座位本身是真的（data/slots.json 有 90 个座位），但这个块的本体在本仓库没有实测到——它是 proposed，照用前请自己对着真实界面复核（见 components/origins.json 的 scenes）。 -->

## 已知偏差

| 项 | 说明 | 标记 |
| --- | --- | --- |
| 「order 必须显式声明」的性质 | 官方 `docs/subsystems/slots.md` 只说 list 按 order 排序、然后才是注册顺序，**没有把「未声明即缺陷」写进官方规则**。这是本仓库的纪律（`SL-MF-03`），依据是 11 个未声明 order 的实测后果 | `[已知偏差]` |
| Button 圆角与官方圆角规范不一致 | 本仓库 `spec/20-controls.md` 第 13、14 行与 `components/controls/Button/SPEC.md` 记官方 Button 为 `md` r18 / `sm` r14；官方 `docs/ui-radius.md` 只允许 4/8/12/16/20/28 并列明 Button `sm` R8、`md` R12。读数与规范对不上，细节与处理见 [40-selfcheck-sources.md](40-selfcheck-sources.md) 的已知偏差清单 | `[已知偏差]` |
| `replaceRisk` 的判定口径 | `data/slots.json` 的 `byRisk` 是本仓库工具从座位树算出来的（`shadows-shipped-ui` 41 / `none` 49），官方公开文档只给出「`single` 与已占用的 keyed 是替代点」这条语义，没有公开 41 这个分类计数 | `[已知偏差]` |
| `order` 的分段值 | 官方未公开任何分段。`SL-RC-04` 的 ≤-10 / -9..-1 / 0 / 1..99 / ≥100 全部是 `[本仓库建议]` | `[本仓库建议]` |
| 官方是否用 DOM 标记座位 | 座位在 `docs/reference/README.md` 里被描述为 `[data-slot]` 的 `display: contents` 逻辑节点，但公开的 `docs/subsystems/slots.md` 未提到这个属性；本仓库不对它做断言 | 无证据 |
| `conversation.input.activity` 的归属 | `docs/subsystems/slots.md` 开头把 `conversation.input.activity` 描述为「模型选择器与发送之间的一个动作」，但该页末尾的 shipped hierarchy 树里没有列出它 | `[已知偏差]` |
| 输入区占用者数量 | 占用者快照只覆盖 4 个座位，**没有采集输入区**，所以「输入区有几个插件」无证据 | 无证据 |

## 依据

实际读过的文件与 URL：

- `data/slots.json`（`counts`、`seats` 全表）
- `data/raw/occupancy-2026-10-01.json`（采集时间 2026-10-01 19:02）
- `data/raw/slot-tree-2026-10-01.json`
- `spec/11-slot-seats.md`、`spec/70-checklist.md`、`spec/80-conflicts.md`、`spec/00-overview.md`
- `components/origins.json`、`components/controls/Button/SPEC.md`、`components/controls/Button/button.module.css`
- `docs/reference/README.md`、`website/demos/README.md`
- https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/AGENTS.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/slots.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md
