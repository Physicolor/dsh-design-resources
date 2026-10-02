# 21 侧栏与面板扩展模式

读者：DSH 第三方插件作者。你要往左栏加行或底部入口，或往右栏加一块面板、给面板加标题栏。

## 这一页解决什么

左栏负责「在多个会话／工作区／对象之间切换」，右栏负责「常驻可见、与当前会话弱相关的临时查看」，中栏才是会话本体（来源：`spec/10-frame-layout.md` 第 1 节）`[本仓库建议]`。插件的扩展需求集中在四处：左栏加一条入口行、左栏底部加一个按钮、右栏加一块面板、给面板加一个标签页。这四处各有自己的座位、几何与占用纪律，但行与标题栏共用同一套尺寸语言。

最重要的一条纪律：`sidebar`、`sidebar.workspaces`、`rightbar`、`rightbar.session` 都是 **`single` + `replaceRisk: shadows-shipped-ui`**，占用即遮蔽官方界面（来源：`data/slots.json`）`[运行时实测]`。插件只在 `replaceRisk: none` 的 `list` / `keyed` 子座位里追加条目。

全篇五类标记：`[官方源码]`、`[运行时实测]`、`[外部指南借鉴]`、`[本仓库建议]`、`[已知偏差]`。没有证据的地方写「无证据」。

## 适用情景

| 你手上的任务 | 首选座位 | kind / scope / replaceRisk | 来源 |
| --- | --- | --- | --- |
| 左栏加一条可点选的导航行 | `sidebar.panellist` | `list` / `root` / `none` | `data/slots.json`；`[运行时实测]` |
| 左栏底部「设置」旁加一个按钮 | `sidebar.footer.action` | `list` / `root` / `none` | 同上 |
| 会话行尾加一个悬停动作 | `sidebar.workspaces.session.row.action` | `list` / `root` / `none` | 同上 |
| 会话行会话菜单加一项 | `sidebar.workspaces.session.menu.item` | `list` / `root` / `none` | 同上 |
| 会话行行首加一点装饰 | `sidebar.session.row.leading` | `list` / `root` / `none` | 同上 |
| 右栏加一个标签页（正文 + 标题） | `sidebar.right.pane.tab` / `sidebar.right.pane.tab.title` | `keyed` / `session` / `none` | 同上 |
| 右栏标签动作菜单加一项 | `sidebar.right.tab.menu.item` | `list` / `session` / `none` | 同上 |
| 会话流里插一块带标题的内容 | `conversation.view` / `conversation.session` + `panel-seat` | 会话区 | `components/patterns/PanelSeat/SPEC.md`；`[本仓库建议]` |

## 什么时候不要用

| 不是这个模式 | 改用 | 为什么 |
| --- | --- | --- |
| 覆盖整个左栏或整个右栏 | 在既有子座位里追加条目 | 四列座位都是 `shadows-shipped-ui`，占用即遮蔽官方界面（`data/slots.json`）`[运行时实测]` |
| 建第二个侧栏 | 在既有 sidebar / rightbar 座位注册 | 官方要求右栏内容在既有 sidebar 注册 slot，不做第二个 sidebar（`.agents/skills/dsh-client-ui-ux/SKILL.md`）`[官方源码]` |
| 内容与当前会话强相关，只是想常驻 | 会话区 | 右栏天生层级更强且常驻，长期占用会持续压缩中栏；右栏可折叠，折叠即信息消失（`FL-MF-06`，`spec/10-frame-layout.md`）`[本仓库建议]` |
| 主流程里必经的操作 | 会话区或对话框 | 主流程必经操作不得只放右栏，折叠后主流程仍必须可完成（`FL-MF-02`）`[本仓库建议]` |
| 全局设置或偏好项 | `settings.section` | 见 `guides/20-pattern-settings.md` 与 `spec/10-frame-layout.md` 第 3 节判定树 |
| 一行里要塞标题、说明、标签多层内容 | `settingsrow` | 侧栏行表达「去一个地方」，设置行表达「改一个值」 |
| 从按钮旁弹出的菜单项 | 官方菜单项 | 菜单自带键盘导航与子菜单，不要自己搭一套 |
| 纯展示、点不动的行 | 静态文本或标签 | 一个永远可点却什么都不做的按钮是键盘用户的陷阱 |
| 把多个按钮包进一个 wrapper 占一个 entry | 一个 entry 一个按钮 | shell 统一管理该区域的间距与对齐（`FL-MF-09` / `SL-MF-13`）`[运行时实测]` |

## 界面结构

### 左栏行

<!-- component: sidebarrow | 侧栏行：前置 16×16 图标 + 标题（可截断）+ 尾部计数 / 快捷键 / 对勾。 -->

| 部位 | 实测 | 来源与标记 |
| --- | --- | --- |
| 左栏整体 | 280 × 905；拖拽手柄 8 宽 @ x = 276 | `docs/reference/README.md`；`[运行时实测]` |
| 会话行 `sessionRow` | 256 × 32 · 圆角 12 · padding `0 8px` · gap 0 · 14px 文字 · `role="treeitem"`（22 处） | `data/ui-inventory.json` `sessionRow\|div\|treeitem`；`[运行时实测]` |
| 工作区行 `projectRow` | 256 × 34 · 圆角 12 · padding `0 8px` · gap 6（20 处） | 同上 `projectRow\|div\|treeitem`；`[运行时实测]` |
| 面板导航行 `panelRow` | 252 × 36 · 圆角 12 · padding `7px 8px` · gap 8 · 14/22（43 处） | 同上 `panelRow\|button\|`；`[运行时实测]` |
| 新会话按钮 | 252 × 38 · 圆角 12 · 14px 文字 | `docs/reference/README.md`；`[运行时实测]` |
| 折叠按钮 | 28 × 28 · 圆角 8 | `components/layout/SidebarRow/SPEC.md`；`[运行时实测]` |
| 行尾溢出按钮 | 256 × 28 · 圆角 8 · padding `0 12px 0 28px`（左 28 留给行首字形） | 同上；`[运行时实测]` |
| 行尾时间 | 38 × 16（另一次量到 32 × 16）· 12/16 · `--dsw-alias-label-tertiary` | 同上；`[运行时实测]` `[已知偏差]` |
| 搜索行 | 252 × 30 · 圆角 12；输入框 196 × 20、清除按钮 24 × 24 | 同上；`[运行时实测]` |
| 底部动作行 | 260 × 42 · 圆角 12 · padding `0 10px`（本次采集另一例 `duc-sidebar-entry`：260 × 34 · padding `6px 2px 6px 10px` · gap 8） | `docs/reference/README.md`、`data/ui-inventory.json` `duc-sidebar-entry`；`[运行时实测]` |
| 底部「设置」行 | 260 × 34 · 圆角 12 · padding `0 10px`（标签 28 × 22 · 14/22） | `docs/reference/README.md`；`[运行时实测]` |
| 列表区 | 270 × 477 | `components/layout/SidebarRow/SPEC.md` 记 270 × 477；`docs/reference/geometry.json` 记 270 × 527；`docs/reference/README.md` 记 272 × 527 | `[已知偏差]` |

`[已知偏差]` 同一个左栏里会话行 32 / 工作区行 34 / 面板行 36 三档并存，圆角都是 12。这不是排版事故——各行要放的字形不同。**但插件没有理由跟着分三档**：按会话行（32）或面板行（36）取一档即可，别自造第四个数（来源：`components/layout/SidebarRow/SPEC.md`）`[运行时实测]`。

### 面板头与右栏标签条

<!-- component: panelheader | 面板标题栏：左 title（14/22、500）+ 可选 description（12/18），右 actions，底部 0.5px 发丝线。 -->

| 部位 | 实测 | 来源与标记 |
| --- | --- | --- |
| 设置窗口内容头 | 612 × 54 · padding `20px 14px 8px 10px` · gap 8 | `components/layout/PanelHeader/SPEC.md`、`docs/reference/settings-panel.json`；`[运行时实测]` |
| 头部动作区 | 94 × 28 · gap 8；关闭按钮 28 × 28 · 圆角 8 | `docs/reference/settings-panel.json`；`[运行时实测]` |
| 右栏标签条 `tabStrip` | 706 × 38 · `role="tablist"` · padding `10px 6px 0 10px` · gap 4 @ `rightbar.session` | `data/ui-inventory.json` `tabStrip\|div\|tablist`；`[运行时实测]` |
| 标签条内一组页签 | 100 × 28 @ (874, 10) | 同上 `stripTabs\|div\|presentation`；`[运行时实测]` |
| 左栏面板标题 `panelTitle` | 28 × 22 · 14/22（文本形如「插件」「自动化任务」） | `components/layout/SidebarRow/SPEC.md`；`[运行时实测]` |
| 右栏入口行 | 380 × 68 · 圆角 20 · padding `14px 20px` · gap 14 | `spec/10-frame-layout.md`（元素清单）；`[运行时实测]` |
| 右栏折叠字形 | 15 × 15 | 同上；`[运行时实测]` |

标题栏自身建议取 `md` 44 高 / 左右内边距 12（或 `sm` 36 / 8），标题与说明间距 4，底部发丝线用 `box-shadow: inset 0 -0.5px 0 0 var(--dsw-alias-border-l1)` 而不是 `border-bottom`（否则把高度顶成 44.5）（来源：`components/layout/PanelHeader/SPEC.md`）`[本仓库建议]`。

<!-- demo: frame-columns | 三列分区示意：指针移到哪一栏就标出哪一栏，右栏可开合——先看清位置，再决定座位。 -->

### 右栏的座位关系（追加，不是替换）

要往右栏加东西，走 `rightbar.session` 下面的追加点；它自己是 `single` / `shadows-shipped-ui`，插件不占。

| 座位 | kind | scope | purpose | replaceRisk |
| --- | --- | --- | --- | --- |
| `sidebar.right.pane.tab` | `keyed` | session | 一个页签的正文，按 `tab.kind` 的 `id` 分发 | `none` |
| `sidebar.right.pane.tab.title` | `keyed` | session | 同一 key 的页签标题（chip / 浮层头） | `none` |
| `sidebar.right.tab.menu.item` | `list` | session | 页签动作菜单尾部的额外项 | `none` |
| `sidebar.right.tab.guide` | `chain` | session | 引导页签正文，可整段路由替换 | `none` |
| `sidebar.right.tab.guide.entry` | `keyed` | session | 单个提供方的引导卡，未匹配时回落官方标准卡 | `none` |
| `rightbar` / `rightbar.session` | `single` | root / session | 整列与整列内容 | `shadows-shipped-ui` |

来源：`data/slots.json`（2026-10-01 采集，`counts.seats` = 90：`single` 38 · `list` 34 · `keyed` 15 · `chain` 3）`[运行时实测]`。

## 关键状态

| 状态 | 触发条件 | 建议表现 | 来源与标记 |
| --- | --- | --- | --- |
| 选中（对勾式） | `selectionStyle="check"` + `selected` | 保持透明底，尾部 16 × 16 对勾；`aria-pressed="true"` | `SidebarRow/SPEC.md`；`[本仓库建议]` |
| 选中（填充式） | `selectionStyle="fill"` + `selected` | 整行 `--dsw-alias-interactive-bg-hover` | 同上；`[官方源码]` |
| 悬停 / 按压 | `.row:hover` / `.row:active` | `--dsw-alias-interactive-bg-hover` / `--dsw-alias-interactive-bg-active` | 同上（锚 `Menu.module.css`、`Button.module.css`）；`[官方源码]` |
| 多选 | `checkbox` 为真 | 行首 16 × 16 复选框（`readOnly` + `tabIndex={-1}`），写 `accent-color`，不写 `aria-pressed` | 同上；`[本仓库建议]` |
| 禁用 | `.row:disabled` | 原生 `disabled` + `opacity: 0.4` + `cursor: not-allowed` | 同上；`[官方源码]` |
| 折叠 | 左栏收起 | 只留品牌行与展开按钮；`sidebar.toggle.badge`（`single`，非交互）承载提示 | `data/slots.json`、`docs/reference/README.md`；`[运行时实测]` |
| 面板加载 | 面板内容等数据 | 列表用骨架屏；其他页面级加载用居中裸 spinner，一页只一种加载样式 | `.agents/skills/dsh-client-ui-ux/SKILL.md`；`[官方源码]` |
| 面板失败 | 取数被拒 | 保留已加载数据可见，不清空内容显示错误 | 同上；`[官方源码]` |
| 面板空 | 确实没有内容 | 一句说明 + 一个动作；不要画成加载中 | `[本仓库建议]` |
| 无会话 | 座位作用域是 `session` | `rightbar.session`、`sidebar.right.pane.tab` 在无会话时不渲染，别渲染空壳（`SL-MF-02`） | `data/slots.json`、`spec/11-slot-seats.md` |
| 标题过长 | 超出可用宽度 | 省略号截断不换行；截断只影响视觉，读屏仍读到完整文本 | `SidebarRow/SPEC.md`；`[本仓库建议]` |

## 键盘与焦点

- 行是原生 `<button type="button">`，天然可 Tab、可用 Enter / Space 激活（`AC-MF-09`）；不要用 `<div onClick>` 替代（来源：`spec/60-accessibility.md`）`[外部指南借鉴]`。
- 一组可选中行必须放在带名字的容器里（例如 `<nav aria-label="对话列表">`），否则读屏用户听到的是一串孤立按钮（来源：`SidebarRow/SPEC.md`）`[本仓库建议]`。
- 焦点环：2px 实线 + `--dsw-alias-brand-primary`；侧栏行用**内偏移 −2px**，否则会被侧栏的 `overflow: hidden` 裁掉（`AC-MF-11` / `AC-MF-12`）`[本仓库建议]`；标题栏这类不被裁剪的容器用外偏移 2px。
- 面板标题栏自身不渲染交互元素（不出现 `onClick` / `tabIndex` / `role`）；`actions` 里的仅图标按钮必须自己带 `aria-label`，图标 `aria-hidden="true"`（`AC-MF-14`，来源：`PanelHeader/SPEC.md`）`[本仓库建议]`。
- 右栏标签条是 `role="tablist"`（来源：`data/ui-inventory.json`）`[运行时实测]`；页签是标签语义，方向键在标签间移动、Tab 只在当前标签正文内走——插件不要给标签另搭一套按键。
- 关掉右栏 / 收起左栏的键盘路径：本仓库**没有实测证据**，无证据。只用标题栏右侧 28 × 28 的关闭按钮与 28 × 28 的折叠按钮表达「怎么关」（来源：`docs/reference/settings-panel.json`、`SidebarRow/SPEC.md`）`[运行时实测]`；实现时至少保证关闭后焦点不丢失，落回触发关闭的那个按钮。
- 挂载面板不得抢焦点：不设 `tabIndex`、不 `autoFocus`、不监听全局按键（来源：`components/patterns/PanelSeat/SPEC.md` 的同类约定）`[本仓库建议]`。
- 面板内的浮层三验：可关闭、视口内翻转、不被裁剪（必要时 portal 到 body）（来源：`.agents/skills/dsh-client-ui-ux/SKILL.md`）`[官方源码]`。

## 浅色 / 深色

- 颜色一律取 `--dsw-*` 语义 token，禁止写字面色值（`TK-MF-01` / `TK-MF-07`，来源：`spec/30-tokens.md`）`[本仓库建议]`。
- 行的取色：文字 `--dsw-alias-label-primary`，前置图标与尾注 `--dsw-alias-label-tertiary`，悬停 / 选中 `--dsw-alias-interactive-bg-hover`（来源：`SidebarRow/SPEC.md`）`[官方源码]`。
- 标题栏取色：标题 `--dsw-alias-label-primary`、说明 `--dsw-alias-label-tertiary`、底部发丝线 `--dsw-alias-border-l1`（来源：`PanelHeader/SPEC.md`）`[官方源码]`。
- 浮起表面 `border: 0` + `box-shadow: var(--dsw-elevation-panel|prominent|soft)`，绝不再叠 `--dsw-alias-border-*`；中性分隔与描边用 0.5px 发丝线；满圆（50% / pill）必须配 `corner-shape: round`（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md）`[官方源码]`。
- 圆角只用 `--dsw-radius-xs|sm|md|lg|xl|panel`（4 / 8 / 12 / 16 / 20 / 28），不要引入 10 / 14 / 18 / 24；同心嵌套 inner R = max(0, outer R − inset)（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md）`[官方源码]`。
- 面板标签必带图标（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md）`[官方源码]`；图标跟文字一起取语义色。
- 每对颜色在浅深两套主题下各验一次再交付（来源：同上）`[官方源码]`。
- `[已知偏差]` 浅色白底下 `--dsw-alias-label-tertiary` 约 3.7:1，而行尾时间（12/16）与前置图标用的正是它（来源：`spec/60-accessibility.md`）`[运行时实测]`；关键信息不要只放在三级色里。
- `[已知偏差]` `SidebarRow` 刻意**不用** `--dsw-specific-sidebar-nav-item-active`：该 token 属于 `--dsw-specific-*` 家族，不在组件可用的语义 token 表内；若侧边栏整体已是 `--dsw-specific-sidebar-fill`，由调用方自行覆盖选中底（来源：`SidebarRow/SPEC.md`）`[已知偏差]`。

## 窄窗口

- 窗口收窄时功能收起而非消失：收进菜单或浮层，**不得删除入口**（`AC-MF-16`，来源：`spec/60-accessibility.md`）`[外部指南借鉴]`。左栏的折叠态就是这条的产品实现。
- 中栏宽度由左右两栏让位决定：无插件右栏时中栏 1290 @ x = 280；有插件栏时输入区实测从 1283 降到 853（来源：`docs/reference/README.md`、`spec/10-frame-layout.md`）`[运行时实测]`。插件面板越宽，主流程越窄。
- 右栏可被折叠，折叠后主流程仍必须可完成（`FL-MF-02`）`[本仓库建议]`；主流程必经操作不得只放右栏。
- 同一行 / 同一段可见控件不超过 6 个（`FL-RC-05`，来源：`spec/10-frame-layout.md`）`[本仓库建议]`；超出收进 `sidebar.right.tab.menu.item`。
- 标题挤压动作区时，标题侧 `min-width: 0`、动作区 `flex: none`（来源：`PanelHeader/SPEC.md`）`[本仓库建议]`。
- 不得用固定 px 高度夹死文本容器（`AC-RC-17`）`[本仓库建议]`；左栏行 32–42 全靠 `min-height`，文本放大后不裁切。
- 窄下来不能丢的：当前对象是谁、怎么切回去、每个动作的可读名字（视觉收起不影响读屏）。

## 可访问性

| 判据 | 要求 | 条文 |
| --- | --- | --- |
| 命中区 | 常规控件目标 28 × 28，最小 20 × 20，相邻不重叠 | `AC-MF-01` / `AC-MF-03` |
| 含图标按钮的容器行高 | ≥28（左栏行 32 / 34 / 36、标题栏 54 均达标） | `AC-MF-04` |
| 可访问名称 | 仅图标按钮必须带 `aria-label`；装饰图标与尾部对勾 `aria-hidden` | `AC-MF-14` |
| 选中语义 | `aria-pressed` = `selected`；`checkbox` 形态不写 `aria-pressed`，名字由 `checkboxLabel` 提供 | 组件 checks |
| 颜色不是唯一线索 | 选中态除底色外还要有对勾或文字色差 | `AC-MF-07` |
| 地标 | 页面已有多个 `<nav>` 时，新导航必须换名字 | `[本仓库建议]` |
| 标题栏 | `title` 是纯文本容器不是标题元素；面板若有 `<section>` / `<aside>`，调用方给 `aria-labelledby`，或直接在 `title` 里传 `<h2>` | `PanelHeader/SPEC.md` |
| 放大 | 浏览器放大 200% 时文本不截断、不重叠、不被容器裁剪 | `AC-MF-15` |
| 文案 | 产品可见文案（含 aria 名、tooltip、placeholder）走本地化字典 | `packages/client/AGENTS.md` `[官方源码]` |

命中区与对比度阈值的外部来源：`spec/60-accessibility.md`（HIG 转写）`[外部指南借鉴]`。

## 与他人共存

- `list` 座位必须显式声明 order，禁止依赖默认 0（`SL-MF-03`）`[运行时实测]`。证据：`shell.overlay` 14 个占用者中 11 个未声明 order、全落默认 0；反例 `conversation.session.header.utilities` 4 个占用者里 3 个显式声明了 −10 / −5 / 5（来源：`data/raw/occupancy-2026-10-01.json`）`[运行时实测]`。
- order 分段：≤ −10 预留框架级；−9..−1 优先级前置；0 保留给官方既有占用；1..99 常规新增按 +10 递增；≥100 保留（`SL-RC-04`）`[本仓库建议]`。
- 新进者取该座位当前最大 order + 10；撞车视为缺陷（`SL-MF-05`）`[本仓库建议]`。
- 同一 bundle 在同一座位的多个 entry 相邻间隔 ≥5（`SL-RC-06`，步长依据官方样板 `conversation.session.header.utilities` 的 −10 / −5 / 5）`[本仓库建议]`。
- 同一插件在同一座位不得注册超过 3 个 entry（`SL-AD-07`）`[本仓库建议]`。
- 一个按钮 = 一个 list entry，禁止 wrapper 包多个按钮，否则 shell 的对齐被破坏（`SL-MF-13` / `FL-MF-09`）`[运行时实测]`；`sidebar.footer.action` 上同一 bundle 通常只需 1 个 entry（`SL-RC-14`）`[本仓库建议]`。
- 占用 `shadows-shipped-ui` 座位，必须在插件 manifest 或 README 显式声明「本插件遮蔽官方 X 界面」并提供关闭开关（`SL-MF-08`）`[本仓库建议]`；禁止遮蔽官方唯一入口：发送、停止、设置总入口、关闭（`SL-MF-09`）`[本仓库建议]`。
- `keyed` 座位的 key 必须稳定（常量或稳定标识），禁止时间戳、随机数、会话内递增序号（`SL-MF-11`）`[本仓库建议]`。
- `chain` 座位未匹配时必须回落到官方实现，不得吞掉未知输入（`SL-MF-12`）`[本仓库建议]`。
- 座位 id 必须来自 DSH 自身声明，不得自造；未声明座位不保证渲染（`SL-MF-01`）`[本仓库建议]`。

占用数字取决于采集时本机装了哪些插件与启用状态，引用必须带采集时间（2026-10-01）（来源：`data/raw/occupancy-2026-10-01.json` 的 `caveat`）`[运行时实测]`。

## 实现资源

| 用途 | 组件 id | 路径 |
| --- | --- | --- |
| 左栏行（含多选与两种选中画法） | `sidebarrow` | [SidebarRow](../components/layout/SidebarRow/SPEC.md) |
| 面板标题栏 | `panelheader` | [PanelHeader](../components/layout/PanelHeader/SPEC.md) |
| 会话流里的数据面板 | `panel-seat` | [PanelSeat](../components/patterns/PanelSeat/SPEC.md) |
| 三列分区活体演示 | — | `website/demos/frame-columns.html`（右栏可开合，中栏跟着让位） |
| 座位目录与占用快照 | — | `data/slots.json`、`data/raw/occupancy-2026-10-01.json`、`spec/11-slot-seats.md` |
| 提交前自检 | — | `spec/70-checklist.md` 的 `A43`、`A44`、`A48`、`A49`、`A51`、`B01` |

先扩展既有组件 / 容器 / 交互，再考虑新建（来源：`.agents/skills/dsh-client-ui-ux/SKILL.md`）`[官方源码]`。

## 规格

单位 px，写法「值（来源：路径或 URL）」。

| 项 | 值 | 标记 | 来源 |
| --- | --- | --- | --- |
| 左栏 / 中栏 | 280 / 1290（1570 × 905 视口，无插件右栏） | `[运行时实测]` | `docs/reference/README.md` |
| 侧栏拖拽手柄 | 8 宽 @ x = 276 | `[运行时实测]` | 同上 |
| 会话行 | 256 × 32 · 圆角 12 · padding `0 8px` · gap 0 · 14px | `[运行时实测]` | `data/ui-inventory.json` `sessionRow\|div\|treeitem` |
| 工作区行 | 256 × 34 · 圆角 12 · padding `0 8px` · gap 6 | `[运行时实测]` | 同上 `projectRow\|div\|treeitem` |
| 面板导航行 | 252 × 36 · 圆角 12 · padding `7px 8px` · gap 8 · 14/22 | `[运行时实测]` | 同上 `panelRow\|button\|` |
| 新会话按钮 | 252 × 38 · 圆角 12 | `[运行时实测]` | `docs/reference/README.md` |
| 折叠按钮 | 28 × 28 · 圆角 8 | `[运行时实测]` | `components/layout/SidebarRow/SPEC.md` |
| 底部动作行 / 底部设置行 | 260 × 42（另一例 260 × 34）/ 260 × 34 · 圆角 12 | `[运行时实测]` `[已知偏差]` | `docs/reference/README.md`、`data/ui-inventory.json` |
| 溢出按钮 / 行尾时间 | 256 × 28（圆角 8）/ 38 × 16（另一例 32 × 16，12/16 三级色） | `[运行时实测]` `[已知偏差]` | `components/layout/SidebarRow/SPEC.md`、`data/ui-inventory.json` |
| 列表区 | 270 × 477（另记 270 × 527 / 272 × 527） | `[运行时实测]` `[已知偏差]` | `SidebarRow/SPEC.md`、`docs/reference/geometry.json`、`docs/reference/README.md` |
| 内容头 | 612 × 54 · padding `20px 14px 8px 10px` · gap 8 | `[运行时实测]` | `components/layout/PanelHeader/SPEC.md` |
| 头部动作区 / 关闭按钮 | 94 × 28 · gap 8 / 28 × 28 · 圆角 8 | `[运行时实测]` | `docs/reference/settings-panel.json` |
| 右栏标签条 / 一组页签 | 706 × 38 · `role="tablist"` · padding `10px 6px 0 10px` · gap 4 / 100 × 28 | `[运行时实测]` | `data/ui-inventory.json` `tabStrip\|div\|tablist`、`stripTabs\|div\|presentation` |
| 左栏面板标题 | 28 × 22 · 14/22 | `[运行时实测]` | `components/layout/SidebarRow/SPEC.md` |
| 右栏入口行 / 折叠字形 | 380 × 68 · 圆角 20 · padding `14px 20px` · gap 14 / 15 × 15 | `[运行时实测]` | `spec/10-frame-layout.md`（元素清单） |
| `SidebarRow` 建议几何 | `min-height` 40 · padding `8px 10px` · 圆角 10 · gap 8（借官方弹出菜单单元 `.item`，非左栏实测） | `[本仓库建议]` `[已知偏差]` | `components/layout/SidebarRow/SPEC.md` |
| `SidebarRow.selectionStyle` | `'check'`（默认）\| `'fill'`，非此二者回落 `check` | `[本仓库建议]` | 同上 |
| `SidebarRow.checkbox` 为真 | `<input type="checkbox" readOnly tabIndex={-1}>` 16 × 16 · `accent-color: var(--dsw-alias-button-primary-fill)` · 不写 `aria-pressed` | `[官方源码]` | 同上 |
| `PanelHeader` 尺寸 | `md` 44 高 / padding `0 12px`；`sm` 36 高 / padding `0 8px` | `[本仓库建议]` `[已知偏差]` | `components/layout/PanelHeader/SPEC.md` |
| `PanelHeader` 标题 / 说明 | 14 / 22 · 500 · `--dsw-alias-label-primary`；12 / 18 · `--dsw-alias-label-tertiary` | `[官方源码]` | 同上 |
| 标题栏分隔线 | 0.5px + `--dsw-alias-border-l1`，用 inset `box-shadow` 而非 `border-bottom` | `[本仓库建议]` | 同上 |
| 焦点环 | 2px 实线 `--dsw-alias-brand-primary`；侧栏行内偏移 −2px，标题栏容器外偏移 2px | `[本仓库建议]` | `spec/60-accessibility.md` `AC-MF-11` / `AC-MF-12` |
| 圆角阶梯 | 4 / 8 / 12 / 16 / 20 / 28；同心 inner = max(0, outer − inset) | `[官方源码]` | https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md |
| 浮起表面 | `border: 0` + `box-shadow: var(--dsw-elevation-panel\|prominent\|soft)`，不叠语义边框 | `[官方源码]` | https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md |
| 发丝线 | 中性分隔与描边 0.5px | `[官方源码]` | 同上 |
| 右栏内容注册点 | 既有 sidebar 的 slot，不做第二个 sidebar；标签必带图标 | `[官方源码]` | https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md |
| 座位总数 | 90（`single` 38 · `list` 34 · `keyed` 15 · `chain` 3） | `[运行时实测]` | `data/slots.json` `counts.seats` |
| 左栏底部动作占用 | 2026-10-01 采集到 4 个：`cordis-panel`(null) / `usage-center-entry`(null) / `commandcode-panel`(1) / `context-overview`(10) | `[运行时实测]` | `data/raw/occupancy-2026-10-01.json` |
| 字号档位 | 26 / 18 / 16 / 14 / 13 / 12 / 11 / 10，档位外判违规 | `[本仓库建议]` | `spec/30-tokens.md` `TK-RC-13` |
| 功能 CSS 字重上限 | 500；不为单个元素发明字号 | `[官方源码]` | `.agents/skills/dsh-client-ui-ux/SKILL.md` |

## 观察到的官方做法

1. 主页面三列：左栏 280、中栏 1290、右栏可开合；中栏宽度随右栏让位（1570 × 905 视口，来源：`docs/reference/README.md`）`[运行时实测]`。
2. 左栏自己就用了三种行高：会话行 256 × 32、工作区行 256 × 34、面板导航行 252 × 36，圆角都是 12（来源：`data/ui-inventory.json`）`[运行时实测]`。
3. 左栏底部动作区实测行 260 × 34（`duc-sidebar-entry`：padding `6px 2px 6px 10px`、gap 8、圆角 12；来源：`data/ui-inventory.json`）`[运行时实测]`。
4. 右栏顶部是一条 706 × 38 的 `role="tablist"`，padding `10px 6px 0 10px`、gap 4；里面一组页签 100 × 28（来源：`data/ui-inventory.json`）`[运行时实测]`。
5. 设置窗口内容头 612 × 54（padding `20px 14px 8px 10px`），关闭按钮 28 × 28 圆角 8（来源：`docs/reference/settings-panel.json`）`[运行时实测]`。
6. `rightbar` 与 `rightbar.session` 都是 `single` / `shadows-shipped-ui`；它们下面才有 `keyed` / `list` 且 `replaceRisk: none` 的追加点（来源：`data/slots.json`）`[运行时实测]`。
7. 官方要求右栏内容在既有 sidebar 注册 slot，不做第二个 sidebar；标签必带图标（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md）`[官方源码]`。
8. 官方要求先扩展既有组件 / 容器 / 交互再新建；功能 CSS 字重上限 500、不为单个元素发明字号；菜单 / popover / tooltip 上线前三验（可关闭、视口内翻转、不被裁剪，必要时 portal 到 body）；间距审查不应有未解释的贴边与一次性偏移（来源：同上）`[官方源码]`。
9. 圆角只取 4 / 8 / 12 / 16 / 20 / 28；浮起表面 `border: 0` + `box-shadow`；中性分隔与描边统一 0.5px 发丝线；满圆配 `corner-shape: round`（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md、https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md）`[官方源码]`。
10. 产品可见文案（含 aria 名、tooltip、placeholder）走本地化字典，零 Cordis 原子组件不给兜底文案（来源：https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/AGENTS.md、https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-primitives/README.md）`[官方源码]`。
11. 列表加载用骨架屏、其他页面级加载用居中裸 spinner；失败时保留数据可见、绝不清空内容显示错误（来源：`.agents/skills/dsh-client-ui-ux/SKILL.md`）`[官方源码]`。

## 推荐插件作者这样做

1. 先回答「这个入口属于哪一列」且答案唯一（`FL-MF-01`）`[本仓库建议]`：切换对象 → 左栏；临时查看且可折叠 → 右栏；与当前会话强相关 → 会话区。
2. 只往 `replaceRisk: none` 的子座位追加条目；整列座位（`sidebar` / `sidebar.workspaces` / `rightbar` / `rightbar.session`）不要碰（来源：`data/slots.json`）`[运行时实测]`。
3. 左栏行从 32 或 36 里取一档，别自造第四个数；圆角统一 12（来源：`SidebarRow/SPEC.md`）`[本仓库建议]`。
4. 一套列表只用一种选中画法：`check` 或 `fill`，混用会让用户以为那是两种状态（来源：`SidebarRow/README.md`）`[本仓库建议]`。
5. 行尾只挂一个元素（一个计数或一个快捷键）；挂满一行小字会压掉扫视节奏（同上）`[本仓库建议]`。
6. 「改一个值」用 `settingsrow`，不要用侧栏行冒充；一行只放一个表单控件（来源：`components/layout/SettingsRow/SPEC.md`）`[本仓库建议]`。
7. 右栏面板上只留一条 `panelheader`；面板内部分段用更轻的分节标题（来源：`PanelHeader/README.md`）`[本仓库建议]`。
8. 面板每个 list 座位显式写 order，取该座位当前最大 order + 10；`sidebar.footer.action` 上通常只需 1 个 entry（来源：`spec/11-slot-seats.md`）`[本仓库建议]`。
9. 一个按钮占一个 entry，不要 wrapper 包多个按钮（`FL-MF-09`）`[运行时实测]`。
10. 右栏内容必须可折叠且折叠后主流程仍可完成（`FL-MF-02`）`[本仓库建议]`；主流程必经操作不要只放右栏。
11. 面板标签带图标，标签正文与标题用同一个 key 注册（来源：`data/slots.json` 的 `sidebar.right.pane.tab` / `.title`）`[运行时实测]`。
12. 交付前在浅深两套主题下各验一次，并跑一遍 `spec/70-checklist.md` 的 `A43`、`A44`、`A48`、`A49`、`A51`、`B01`（来源：`.agents/skills/dsh-client-ui-ux/SKILL.md`）`[官方源码]`。

## 来源与已知偏差

| 项 | 说明 | 标记 |
| --- | --- | --- |
| 左栏三档行高 | 会话行 32 / 工作区行 34 / 面板行 36 并存，官方自身不一致；插件按 32 或 36 取一档 | `[已知偏差]` |
| 建议值与实测不一致 | `SidebarRow` 建议 `min-height 40` / 圆角 10（锚弹出菜单 `.item`），实测左栏行是 32 / 34 / 36、圆角 12；`PanelHeader` 建议 44 / 36，实测产品头 54、右栏标签条 38。有实测的场景以实测为准 | `[已知偏差]` |
| 官方 Button 自身圆角 | 官方 Button 用 r14（`.sm`）与 r18（默认），而官方圆角规范只允许 4 / 8 / 12 / 16 / 20 / 28 | `[已知偏差]` |
| 列表区三个量 | 270 × 477（`SidebarRow/SPEC.md`）、270 × 527（`docs/reference/geometry.json`）、272 × 527（`docs/reference/README.md`）互不相等 | `[已知偏差]` |
| 行尾时间两个量 | 38 × 16（`SidebarRow/SPEC.md`）与 32 × 16（`data/ui-inventory.json`） | `[已知偏差]` |
| 底部动作行两个量 | 260 × 42（`docs/reference/README.md`）与 260 × 34（`duc-sidebar-entry`） | `[已知偏差]` |
| 右栏标签条只在装插件栏时量到 | `docs/reference/README.md` 明确说复刻官方骨架时不把插件面板计入；本页的 706 × 38 与 100 × 28 来自该次采集 | `[运行时实测]` |
| 官方右栏列宽 | `geometry.json` 里 707 宽的 `OUqwTW_panel` 是插件渲染的面板，不计入官方骨架，因此本页不写右栏列宽 | 无证据 |
| 关闭右栏后的焦点去向 | 没有实测数据 | 无证据 |
| 右栏折叠的键盘快捷键 | 官方快捷键清单未采集 | 无证据 |
| 可追加子座位的完整性 | 以 DSH 自身声明为准；本仓库快照只覆盖 2026-10-01 的 90 个座位 | `[运行时实测]` |
| 占用数字随环境变化 | 取决于采集时本机装了哪些插件与启用状态，引用必须带采集时间（2026-10-01） | `[运行时实测]` |

## 依据

- `components/layout/SidebarRow/README.md`、`SPEC.md`
- `components/layout/PanelHeader/README.md`、`SPEC.md`
- `components/patterns/PanelSeat/SPEC.md`
- `components/layout/SettingsRow/SPEC.md`
- `data/slots.json`、`data/raw/occupancy-2026-10-01.json`、`data/ui-inventory.json`
- `docs/reference/README.md`、`docs/reference/geometry.json`、`docs/reference/settings-panel.json`
- `spec/10-frame-layout.md`、`spec/11-slot-seats.md`、`spec/30-tokens.md`、`spec/60-accessibility.md`、`spec/70-checklist.md`
- `website/demos/frame-columns.html`
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/web-styling.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/.agents/skills/dsh-client-ui-ux/SKILL.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/AGENTS.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-primitives/README.md
