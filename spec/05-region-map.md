# 05 区域地图：新建一个对话之后，这一屏由什么组成

- 适用对象：任何要往主界面里放界面的插件作者，以及审阅这些界面的审核者。
- 效力：含 RG / AD，逐条标注。
- 本文的判据是否可自动检测：区域归属可半自动（manifest 与代码里的 slot id 是否属于自己声称的那一列）；「官方有没有给过这块区域座位」可静态对照 `data/slots.json`。座位名与用途均来自实测座位树（采集时间 2026-10-01）。

这一页回答一个前置问题：**你打算动的那块地方，官方到底有没有给它一个名字。** 有名字的，座位表说话；没有名字的，第 5 节说话。跳过这一步的人会在后面每一个决定上多花时间——他分不清「我选错了座位」和「这里根本没有座位」。

## 1. 三条全高轨道，没有全局顶栏

[官方源码] DSH 主页面是三条各自全高的轨道，chrome（页头、工具行、状态行）由每条轨道自己拥有，不存在横跨整个窗口的全局顶栏，也不存在全局状态栏。

这一条决定了所有「这个按钮放哪」的问题怎么问：**先问它属于哪一条轨道，再问它在这条轨道的哪一段。** 拿别的桌面应用的习惯来套会走错——那里是「窗口有一条命令栏，所有全局动作都进去」，这里是「每条轨道自己的头部」。

| 轨道 | 座位根 | 它装什么 |
| --- | --- | --- |
| 左栏 | `sidebar` | 全局导航与被管理的对象列表（工作区、会话） |
| 中栏 | `main` → `main.conversation` | 当前选中的面板；会话时是对话本体 |
| 右栏 | `rightbar` | 一条中栏为它让出空间、或干脆不存在的轨道 |

`main` 是 `keyed` / root 座位，官方用途是「按左栏条目 id 选中的中央面板」；`main.conversation` 是它下面 `single` / `session-maybe` 的会话外壳。右栏的官方用途只有一句：**「The right column: a track the centre makes room for, or nothing.」**——它是一条轨道，中栏给它腾地方；没有它，中栏就是满宽。这句话是第 4 节所有结论的依据。

<!-- demo: frame-columns | 一屏区域地图：产品复刻按实测尺寸搭（左栏 280、中栏流动、右栏可开合），指针扫过哪一块就标出哪一块。中栏里那两条贴在正文左右的带子是**正文居中的副产物**，在官方座位树里没有名字，附图上的标线只在窗口之外——真机不画这些标记。 -->

- `RG-MF-01`：任何新增 UI 必须先声明它属于哪一条轨道、哪一段；声明与实际渲染位置不一致即判为缺陷（与 `FL-MF-01` 同一条纪律的区域侧表述）。[本仓库建议]

## 2. 左栏由哪几段组成

自上而下六段。前三段是宿主的地盘，后三段里有可追加的座位。

| 段 | 实景里看到什么 | 官方座位 | 归属与可追加性 |
| --- | --- | --- | --- |
| 品牌行 | 标志与产品名 | `sidebar.brand.mark`、`sidebar.brand.name` | 宿主 `single`；折叠后只留标志 |
| 全局面板入口 | 「插件」「自动化任务」 | `sidebar.panellist` | `list` / root，**可追加**；这里是全局面板图标列 |
| 工作区与会话列表 | 工作区、会话列表、搜索 | `sidebar.workspaces` | 宿主 `single`，官方用途含「分区头、搜索、分组/平铺的会话列表和全部工作区对话框」。整体不可替换，只能挂它声明的子座位 |
| 会话行的悬停动作与「…」菜单 | 每行末尾的按钮、菜单项 | `sidebar.workspaces.session.row.action`、`sidebar.workspaces.session.menu.item` | 两个 `list` / root，**可追加** |
| 底部：设置入口 | 「设置」 | `sidebar.settings` | 宿主 `single` |
| 底部：扩展动作区 | 无插件时为空 | `sidebar.footer.action` | `list` / root，**可追加**；官方用途是「设置旁边的可选动作」 |

Desktop 外壳另有账户入口，占用 `settings.launcher`（`single` / root，打开的是 shell 自己的设置面板）。它不是普通插件菜单项。

- `RG-MF-02`：[官方源码] `sidebar.footer.action` 的一个 list entry 渲染一个控件，不得用 wrapper 包多个按钮；外壳统一管理该区的间距与对齐（与 `FL-MF-09`、`SL-MF-13` 同源）。

## 3. 中栏由哪几段组成

中栏在会话状态下自下而上分成四段，外加一条不属于任何座位的东西（见第 5 节）。

| 段 | 装什么 | 官方座位 | 作用域 |
| --- | --- | --- | --- |
| 常驻导航头 | 会话标题左边的全局导航；没有选中会话时也在 | `conversation.header` → `conversation.header.leading` | `session-maybe` / `root` |
| 会话头 | 会话标题、标题旁边的动作、右对齐工具行、最右角 | `conversation.session.header` → `conversation.session.header.actions`（标题旁）、`.utilities`（右对齐，升序）、`.corner`（最右角，**只放一个控件**） | `session` |
| 视图区 | `conversation.view` 注册的会话视图，**一次渲染一个** | `conversation.view` → `conversation.session` → `conversation.chat.node` | `session` |
| 输入卡 | 输入框与工具行 | `conversation.composer.bar` → `conversation.input.left` / `.right`（两个 `list`）、`.plan` / `.model` / `.activity` / `.permission`（`single`） | `session` / `session-maybe` |
| 输入卡上下的插入点 | 卡上方整宽条目、卡下方环境条目、卡内浮层 | `conversation.input.dock`（上）、`conversation.composer.dock`（下）、`conversation.input.overlay`（卡内浮层） | `session` |

两条容易被忽略的官方语义：

- `conversation.view` 的官方用途是「已注册的会话目标视图，一次渲染一个」——**这就是宿主那排「对话 / 轨迹 / 上下文」页签的机制**，不是三个写死的页面。谁在这里注册，谁就多一个可切换的视图。
- `conversation.composer` 是 `chain` / `session`，官方用途是「按选择器路由替换当前会话的常驻输入卡」。它是路由接管口，不是新增入口。
- `conversation.session.header.corner` 是 `single` / `session`，官方用途写明「工具行边缘之外、进入头部自身内边距的最右角，**给一个控件**」。它已经被占用（右栏开关就在这里），而 `single` 座位不存在共存——想放第二个控件只能遮蔽先来的那个。动这个位置之前先读 `spec/11-slot-seats.md` 第 4 节。

<!-- demo: session-tabs | 会话头部那排页签是宿主真实渲染的会话视图，不是三个写死的页面；插件往 conversation.view 注册就是走这条路。 -->

## 4. 右栏打开之后由什么组成

右栏是**页面第 4 列**，不是压在中栏之上的浮层卡片 [官方源码]。因此它的宽度和它出现的方式都是声明式的，与中栏内部那些浮层性质完全不同。

| 部分 | 官方座位 | 说明 |
| --- | --- | --- |
| 轨道本体 | `rightbar` | `single` / root；轨道是否存在由根作用域的右栏控制器决定 |
| 会话内容区 | `rightbar.session` | `single` / `session`；由右栏控制器选中 |
| 页签正文 | `sidebar.right.pane.tab` | `keyed` / session，按 `tab.kind` 当值的 id 分发 |
| 页签标题 | `sidebar.right.pane.tab.title` | `keyed` / session，同一 key |
| 页签菜单尾部项 | `sidebar.right.tab.menu.item` | `list` / session，**可追加** |
| 文件页签的目录动作 | `sidebar.right.tab.files.actions` | `list` / session，**可追加** |
| 文档预览页签的动作 | `sidebar.right.tab.document.actions` | `list` / session，**可追加** |
| 开始页的两项宿主操作 | 无独立座位 | 干净 profile 的空白会话右栏显示「工作区文件」「新建终端」，属宿主开始页 |
| 展开 / 收起开关 | `conversation.session.header.corner` | 位于会话头最右角 |

**可追加的只有页签内部的动作位**。`rightbar`、`rightbar.session`、`sidebar.right.pane.tab` 都是 `shadows-shipped-ui` 的替代点：插件往这里注册，是**换掉**官方那一块界面，不是并排加一个。

## 5. 官方没有座位的区域

这一节是本篇存在的理由。下面四处，官方公开座位表里**没有**对应的座位。它们不是「你还没找到」，是「本来就没有」。凡属此类，写进插件 README 时要照这个口径说明，不要让下一个作者继续猜。

### 5.1 中栏对话区左右两侧的留白带

正文阅读列是固定宽度并居中的，中栏比阅读列宽出来的部分，左右各分到一半。这段留白**在座位树里没有名字**，它不是一个座位，而是居中的副产物。

社区已经有插件把这段留白当作常驻信息带使用（俗称 rail），并且是通过借道别的座位实现的——最常见的是 `conversation.input.overlay`：在输入卡内部渲染一个浮层，再用绝对定位把它放到中栏右侧。这是**插件的实现选择**，不是官方提供的区域。

- `RG-MF-03`：往这段留白放东西的插件，必须在 README 写明「官方无此座位，本插件借道 X 实现」，并说明 X 被官方调整时的降级行为。[本仓库建议]
- `RG-MF-04`：不得把借道实现描述成官方区域或宿主右栏。借道座位的官方用途原文是判断依据（例如 `conversation.input.overlay` 是「渲染在常驻输入卡内部的浮动条目」）。[本仓库建议]
- `RG-AD-05`：这段留白在窗口变窄时会先消失，而座位不会跟着消失——浮层会变成越界或重新定位。任何依赖它的内容都必须能在零宽度下退场，而不是压到正文上。[本仓库建议]

判断「该放这段留白还是该放右栏」用的是结构差异，不是视觉偏好：右栏自己定宽、中栏为它让路、且永远至少 300px；留白是正文算完之后剩下的余数，可以是 0。完整的判据与反例见 [15 中栏的占用档位](15-middle-column.md) 与 [指南：中栏能不能单独使用](../guides/15-middle-column.md)。

### 5.2 被当作通用面板用的 `conversation.input.overlay`

官方用途只有一句：「渲染在常驻输入卡内部的浮动条目」（`list` / `session`）。官方没有说它能当中栏面板，也没有说它不能。

现实是：**没有任何插件能新开槽位**。官方 `packages/client/AGENTS.md` 写明「渲染一个你没有声明的 slot，或者声明一个别人已经声明的 slot，都会在加载期失败」，裸 `slots.register` 进一个未声明的 slot 同样是加载期错误。留白没有座位，插件要放东西，只能借一个已有的 `list`，`conversation.input.overlay` 是当前的社区选择。

- `RG-MF-06`：占用 `conversation.input.overlay` 时，不得让浮层在输入卡不可见的状态下仍然占据交互区域；输入卡被隐藏时浮层必须一起退场。[本仓库建议]
- `RG-RC-07`：同一份界面不要在 `conversation.input.overlay` 与 `rightbar.session` 之间「两边都放一份」来规避选择；用户会看到同一信息出现两次。[本仓库建议]

### 5.3 独立插件设置窗口

`settings.section` 是「一个设置页 = 一个 list entry」，宿主设置窗口承载它；`settings.general.item` 是「通用分区里的一行偏好」。**公开座位表里没有「插件自己的设置窗口」这个入口座位。** 这是官方未涉及，不是缺漏。详见 [20-pattern-settings](../guides/20-pattern-settings.md) 的「独立插件窗口的边界」。

### 5.4 「全局顶栏」本身

回到第 1 节：DSH 没有全局顶栏。所以任何「把所有插件的全局按钮收进一条窗口级命令栏」的想法，在今天的座位树里**无处可放**。`shell.overlay` 是框架级浮层（`list` / root，覆盖全列且在各列滚动容器之外），它是浮层不是栏；拿它拼一条常驻顶栏，等价于自己造一条并不存在的 chrome，并且必然与 `conversation.header` 抢同一片视觉空间。

### 5.5 汇总

| 位置 | 官方座位 | 现状 | 想用它的时候读 |
| --- | --- | --- | --- |
| 中栏对话区两侧留白带 | 无 | 社区借道 `conversation.input.overlay` 等座位实现 | 本篇 5.1、[guides/15](../guides/15-middle-column.md) |
| 借道座位本身（如 `conversation.input.overlay`） | 有，但用途不是面板 | 官方用途为「输入卡内浮层」；被当作面板用是插件选择 | 本篇 5.2、[guides/21](../guides/21-pattern-sidebar-panel.md) |
| 独立插件设置窗口入口 | 无 | 用 `settings.section` 落在宿主设置窗口里 | [guides/20](../guides/20-pattern-settings.md) |
| 全局顶栏 / 窗口级命令栏 | 无 | 不存在；`shell.overlay` 是浮层不是栏 | 本篇 5.4 |

- `RG-MF-08`：凡属上表「官方座位：无」的四类位置，插件文档必须显式写出「官方无此座位」这一结论，并写明它实际借用了哪个座位。缺失即判为缺陷。[本仓库建议]

## 6. 拿到这张地图之后怎么走

1. 你的内容属于哪条轨道？答案不唯一就说明还没定稿（`RG-MF-01`）。
2. 如果落在中栏：它要占满中栏、进 `conversation.view` 的页签，还是只做中栏内的浮层带？读 [15 中栏的占用档位](15-middle-column.md)。
3. 如果落在左栏或右栏：从 `data/slots.json` 找一个 `replaceRisk: none` 的子座位追加，不要替换宿主整块。读 [11 座位目录与选择](11-slot-seats.md)。
4. 三条轨道都没给出座位：进第 5 节对号入座，按 `RG-MF-08` 把结论写进插件文档。
5. 内容确实跨区域、覆盖全屏：只有 `shell.overlay`，且必须显式声明 order。

## 7. 依据

- `data/slots.json`（90 个座位的 `name` / `kind` / `scope` / `purpose` 原文；采集时间 2026-10-01）`[运行时实测]`
- `data/raw/slot-tree-2026-10-01.json`（座位树原始结构）`[运行时实测]`
- `docs/reference/chrome.json`、`docs/reference/clean-capture/19-rightbar-empty.png`（右栏开始页两项宿主操作的实景）`[运行时实测]`
- `packages/client/AGENTS.md`：slot 声明与贡献纪律（「渲染未声明的 slot、声明别人已声明的 slot 都在加载期失败」）`[官方源码]`
- `docs/subsystems/slots.md`：座位基数、作用域与 Extension rules `[官方源码]`
- `spec/10-frame-layout.md`、`spec/11-slot-seats.md`、`spec/80-conflicts.md`：区域职责、座位纪律、冲突裁决
