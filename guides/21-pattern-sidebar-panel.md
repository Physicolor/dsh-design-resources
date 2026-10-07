# 左侧栏、对话区与右栏

> 先分清内容属于全局导航、当前会话，还是独立的宿主右栏，再选择扩展位置。

## 读完这一页要能做什么

- 看懂 DSH 左侧栏的宿主分区与插件注册位置。
- 区分会话内容里的浮层与独立 `rightbar`。
- 将插件贡献与 DSH 原生内容分开说明。

## 左侧栏由哪些区域组成

干净 profile 的左侧栏依次呈现品牌区、「新会话」动作、「插件」与「自动化任务」全局面板入口、工作区/会话列表，以及底部「设置」。下图只重现隔离 profile 中实际看到的文字；外部图例说明每个区域的归属。无第三方插件时，底部扩展动作区为空。

<!-- demo: sidebar-anatomy | 品牌、面板列表、工作区、空的底部扩展位和设置入口；图例放在窗体外。 -->

| 区域 | 干净实景中看到的内容 | 官方座位/归属 | 插件作者应怎样理解 |
| --- | --- | --- | --- |
| 品牌行 | DeepSeek 标志与 Harness 名称 | `sidebar.brand.mark`、`sidebar.brand.name`，宿主单一座位 | 保留宿主品牌；不要把品牌行当插件标题区。 |
| 全局面板入口 | `插件`、`自动化任务` | `sidebar.panellist`，root 作用域 list | 此处是全局面板列表；具体入口可能由官方功能或插件提供，逐个核实归属。 |
| 工作区和会话 | `工作区`、`默认工作区`、`新会话` | `sidebar.workspaces`，宿主 single 座位 | 列表区由宿主管理；扩展子项应使用它声明的子座位，不能替换整块工作区区域。 |
| 设置与底部动作 | `设置` | `sidebar.settings` 是宿主入口；`sidebar.footer.action` 是旁边可注册的 list | 干净截图中注册位为空；用户截图里的「用量中心」等是插件入口，不是默认宿主内容。 |
| Desktop 账户/登录 | Desktop 外壳可出现账户入口 | `settings.launcher` 是宿主拥有的可选账户入口 | 这是桌面外壳功能，不是普通插件菜单项；Web 干净截图不呈现该 Desktop 状态。 |

Apple HIG 将侧栏定位为顶层导航，并提醒避免把关键操作只放在侧栏底部。[外部指南借鉴] 因此，`sidebar.footer.action` 适合次要的可选入口；主流程仍须在其他区域可完成。这是审阅建议，实际扩展能力仍以 DSH 公开座位表为准。

左栏整体 `sidebar` 和工作区 `sidebar.workspaces` 都是宿主拥有的 `single` 座位。插件应向 `sidebar.panellist`、`sidebar.footer.action` 等可追加 list 注册；不要覆盖整栏。

## 宿主的会话视图页签

真实会话头部有「对话」「轨迹」「上下文」三个宿主页签。它们切换同一会话的呈现视图，不是插件设置导航，也不等同于 dsh-widgets 的分段控件示例。

<!-- demo: session-tabs | 只呈现宿主真实的会话视图页签；不借用插件设置页截图。 -->

插件若要显示当前会话的主要内容，使用公开的 `conversation.view` 等会话座位；不要把自有视图伪装成宿主页签。

## 会话区内的插件内容

对话区属于当前 session。正文视图通过 `conversation.view` 追加；输入卡周围还有 `conversation.composer.dock` 与 `conversation.input.overlay` 等公开位置。

`dsh-widgets` 展示了一种插件自己的布局：右侧统计轨注册在 `conversation.input.overlay`，面板开关位于 `conversation.session.header.utilities`，会话统计位于 `conversation.composer.dock`。它贴靠主对话列并随会话变化。轨道、统计卡和按钮都是插件内容，不能标成 DSH 自带组件。[插件示例]

座位表对 `conversation.input.overlay` 的公开描述是“在常驻输入卡内部显示的浮动内容”。`dsh-widgets` 把它用作对话区域右侧的会话面板，是该插件自己的实现选择；插件作者应对照自身版本验证层级和遮挡，不要将它宣传成通用宿主右栏。

还有一件事这一页要说清：**中栏正文右侧那条留白带，官方没有给它座位。** `dsh-widgets` 的统计轨之所以出现在那里，是因为它借了 `conversation.input.overlay` 这个座位、再用绝对定位把浮层挪到了留白带上。这是一条社区做法，不是官方区域。借道的写法、声明要求与降级行为，以及另外三处「官方没有座位」的位置，见[官方没有座位的位置](31-unofficial-regions.md)；该占中栏哪一档见[中栏能不能单独使用](15-middle-column.md)。

## 宿主右栏是另一列

DSH `rightbar` 是窗口最右侧独立轨道；`rightbar.session` 是宿主控制的 session 内容区。插件添加内容时，应使用 `sidebar.right.pane.tab` 与对应标题座位，不要替换 `rightbar`。

干净 profile 的空白新会话右栏显示「开始」页、空状态图标，以及「工作区文件」「新建终端」两项宿主操作和各自的说明、快捷键。它们属于 DSH 开始页；示意只复现实景里出现的这两项操作。右栏与 dsh-widgets 的会话区浮层仍是两个不同位置。

<!-- demo: frame-rightbar | 干净 profile 的宿主开始页右栏；保留两项真实操作，与 dsh-widgets 的会话区浮层分开。 -->

## 位置选择表

| 内容关系 | 优先区域 | 判断要点 |
| --- | --- | --- |
| 我还不确定内容属于哪条轨道、哪一段 | 先读[区域地图](../spec/05-region-map.md) | 区域定不下来，座位一定选错。 |
| 切换全局页面或对象 | 左侧栏 | 选择官方声明的 panel/workspace 子座位。 |
| 设置全局偏好 | 宿主设置窗口 | 一项偏好用 `settings.general.item`；一组设置页用 `settings.section`。 |
| 显示当前会话的主要内容 | `conversation.session` / `conversation.view` | 内容随 session 切换，属于对话主体。 |
| 占满中栏，或成为会话头部的一枚页签 | `main` 面板页 / `conversation.view` | 先读[中栏的占用档位](../spec/15-middle-column.md)：一次只渲染一个视图，用户此刻看不到正文。 |
| 当前会话的常驻辅助内容，需要与正文同屏 | 中栏内的插入点 | 见[中栏能不能单独使用](15-middle-column.md)。这类内容会随窗口变窄先消失。 |
| 当前会话的常驻辅助内容，必须始终可达或跨会话常驻 | `rightbar.session` | 右栏是页面第 4 列，自己定宽、最窄 300px、可折叠；折叠后主流程仍须可完成。 |
| 官方没有座位，但我确实想放在那里 | 借道已有座位 | 见[官方没有座位的位置](31-unofficial-regions.md)：要写明官方无此座位。 |
| 全局浮层或通知 | `shell.overlay` | 只有确实跨区域、且不属于会话内容时才使用。 |

右栏可以折叠，所以它只能承载辅助查看内容。发送、停止、设置入口等主流程动作必须在用户收起右栏后仍能找到。

## 共存与键盘操作

- 根 sidebar、workspace region、rightbar 和 session rightbar 都是 `shadows-shipped-ui` single 座位；插件只向 `replaceRisk: none` 的公开子座位追加。
- `sidebar.footer.action` 一个 entry 对应一个按钮，外壳负责统一间距与对齐。
- 导航当前项要同时有可见状态与语义状态；图标按钮提供可读名称，焦点不能被父容器裁切。
- 新挂载的侧栏或会话面板不要自动抢焦点；关闭后将焦点还给触发按钮。

尺寸与焦点规格见 [主页面骨架](../spec/10-frame-layout.md)、[座位目录与选择](../spec/11-slot-seats.md) 和 [可访问性](../spec/60-accessibility.md)。

## 依据

- `data/slots.json`：sidebar、rightbar 与 conversation 座位的公开用途。
- `docs/reference/review-crops/sidebar-top-clean-2026-10-05.png`、`rightbar-clean-2026-10-05.png`：专用官方 bundle profile 中的左栏顶部与宿主开始页右栏裁图；不含会话正文。
- `dsh-widgets/src/client/index.ts`：该插件如何选择 conversation overlay、header utility 和 composer dock；这是插件源码，不是 DSH 原生 UI。
