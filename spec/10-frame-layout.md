# 10 主页面骨架

- 适用对象：向主界面任意区域添加 UI 的插件作者。
- 效力：含 MF / RC / AD，逐条标注。
- 本文的判据是否可自动检测：部分。座位选择（manifest 与代码中的 slot id）可静态检测；「这段内容是否属于这一区」只能人工审查。

## 1. 三列职责

[实测] DSH 主页面为三列结构：左栏 `sidebar`、中栏 `main` / `main.conversation`（当前会话）、右栏 `rightbar`。

| 区域 | 职责 | 允许内容 | 禁止内容 |
| --- | --- | --- | --- |
| 左栏 `sidebar` | 全局导航与对象列表 | 会话切换、列表、插件侧栏入口（`sidebar.footer.action`） | 当前会话的消息内容、临时详情面板 |
| 中栏 `main.conversation` | 当前会话的全部内容与交互 | 会话记录、输入、会话级工具与状态 | 与任何会话无关的全局设置入口 |
| 右栏 `rightbar` | 常驻可见、与当前会话弱相关的面板 | 临时查看类内容：上下文、检查器、预览、引用来源 | 主流程必经操作（不点它就无法完成任务） |

- `FL-MF-01`：任何新增 UI 必须能回答「它属于哪一列」，且答案唯一。答案不唯一即判定为设计未定稿。[本仓库建议]
- `FL-MF-02`：主流程必经操作不得只放在右栏。右栏天生层级更强（常驻、与中栏并列），但可被折叠；折叠后主流程仍必须可完成。[本仓库建议]

<!-- demo: frame-columns | 三列分区示意图。把指针移到任意一栏或任意一段上，它会被标出来——先看清位置，再读下面的条文。 -->

## 2. 中栏三分段

| 分段 | 座位 | 职责 |
| --- | --- | --- |
| 顶部 | `conversation.header` | 会话身份与全局作用于本次会话的操作；工具行见 `conversation.session.header.utilities` |
| 对话记录 | `conversation.view` → `conversation.session` | 消息流本体及其内联附件 |
| 输入区 | `conversation.composer.bar` | 输入卡与其工具行：`conversation.input.left` / `.right` 两个 list 座位，加上 `.plan` / `.model` / `.activity` / `.permission` 等 single 座位 |

输入区还有三个纵向插入点：`conversation.input.dock`（输入卡上方）、`conversation.composer.dock`（输入卡下方）、`conversation.input.overlay`（输入卡内部浮层）。

### 实测尺寸（1570 × 905 视口）

规范正文此前只讲职责、不讲尺寸，量出来的数都留在 `docs/reference/`；这里把与本篇有关的几条写进来，改版时对着它核。

| 部位 | 实测 | 出处 |
| --- | --- | --- |
| 左栏 | **280 × 905**（拖拽手柄 8px 宽 @ x = 276） | `geometry.json` |
| 中栏 | 1290 × 905 @ x = 280（无插件右栏时） | 同上 |
| 会话头部 | 高 **50**；标题左沿 = 中栏 + 28；顶栏工具右沿 = 视口 − 12 | `top-strip.json` |
| 会话头部页签 | 每枚 **26 × 26**（宽随文字，实测「对话」26 × 26），三枚共 **139 × 26**，间距 25 | `top-strip.json` |
| 折叠角 | chip 上 10 × 10；工作区行上 12 × 12 | `top-strip.json`、`composer-geometry.json` |
| 输入区座位 | 中栏宽 × **128** 高（卡 114 + dock 26 及间距；会话里卡单行时座位随之变矮） | `conversation-geometry.json` |
| 会话头部 chip | 高 **28**（图标 14、标签 12/16） | `top-strip.json`，规范见 20-controls §7.1 |
| 阅读列 | **748 宽居中**，左右各 32 内边距 | `conversation-geometry.json` |
| 输入卡 | **780 × 114**（hero；会话里单行时 780 × 98），圆角 28 | `composer-geometry.json` |
| 卡下 dock | 高 **26**（padding-top 4 + 内容 22） | `status-line.json` |

- `FL-MF-03`：工具行（`conversation.input.left` / `.right` / `.plan` / `.model` / `.activity`）只放「作用于本次输入或本次发送」的控件；全局开关放 `conversation.header` 或右栏。[本仓库建议]
- `FL-MF-04`：`conversation.input.dock` / `composer.dock` 用于扩展本次输入的能力列表（附件、参数、预设）；`conversation.input.overlay` 只用于必须盖在输入卡之上的瞬时 UI（补全、下拉、提示），不得常驻。[本仓库建议]
- `FL-RC-05`：同一段内可见控件不超过 6 个。无权威数值，本仓库建议 6，理由：官方同类工具行样本 `conversation.session.header.utilities` 为 4 项；超过 6 项后，28×28 命中区与视觉密度难以同时满足。超出时收进菜单（依据 [HIG]：功能不随空间变化，只改变可见量）。

<!-- demo: frame-composer | 输入区的纵向结构。两侧的留白不是「剩下的空间」，而是有名字、有用途的座位。 -->

## 3. 内容归属判定树

按顺序回答，第一个「是」即为归属：

1. 未选中任何会话时也必须存在？否 → 会话区（`session` 作用域），进第 2 步。
2. 是全局设置或偏好项？是 → `settings.section`（single 座位，占用纪律见 11-slot-seats.md 第 4 节）。
3. 用于在多个会话／工作区／对象之间切换？是 → 左栏 `sidebar`。
4. 与当前会话强相关，但需要常驻可见且可随时折叠？是 → 右栏 `rightbar`。
5. 是跨区域、覆盖全屏的框架级浮层？是 → `shell.overlay`，且必须显式声明 order（见 `SL-MF-01`）。
6. 全部为否 → 它不属于主页面骨架，应做成独立页面或文档，不要塞进现有区域。

## 4. 跨区域决策表

| 内容类型 | 首选 | 次选 | 禁止 | 条文 |
| --- | --- | --- | --- | --- |
| 与当前会话相关的信息 | 会话区 `conversation.view` / `session` | 右栏（仅当作临时查看） | 左栏 | `FL-MF-06` |
| 需要长期驻留的会话级信息 | 会话区 | 右栏（须可折叠） | — | `FL-MF-06` |
| 全局设置 | `settings.section` | — | 会话区、左栏列表区 | `FL-MF-01` |
| 对象切换 / 导航 | 左栏 | — | 右栏 | `FL-MF-01` |
| 临时查看（预览、检查器、来源） | 右栏 | 会话区内联展开 | — | `FL-MF-02` |
| 跨区域浮层 | `shell.overlay` | `conversation.input.overlay`（仅输入卡内） | 绝对定位越界 | `FL-MF-08` |

- `FL-MF-06`：与会话相关的信息优先放会话区而不是右栏。无权威数值，本仓库建议按此裁决，理由：右栏天生层级更强且常驻，长期信息占用右栏会持续压缩中栏主流程宽度，且右栏可被折叠，折叠即信息消失。

<!-- demo: frame-rightbar | 右栏打开与收起时的两种布局。点一下右栏，看中栏是怎么让位的。 -->

## 5. 间距与边界

- `FL-AD-07`：中栏各段之间的垂直分区边界间距。无权威数值（DSH 官方未公开 token 化的布局间距），本仓库建议 16px，理由：（a）16 是 8 的倍数，符合 [OH] 4/8 倍数与 8vp 基线网格；（b）[OH] 官方自检项规定间距小于 16vp 判「过挤」，16 为其通过下限。
- `FL-MF-08`：跨区域内容不得用负 margin 或绝对定位越出所属区域边界去覆盖相邻区域。框架级浮层是唯一例外，且必须走 `shell.overlay`。[本仓库建议]

## 6. 左栏底部入口纪律

- `FL-MF-09`：[实测] `sidebar.footer.action` 的每个按钮必须是独立的 list entry（一个 entry 一个按钮），不得用一个 wrapper 元素包住多个按钮。shell 统一管理该区域的间距与对齐，包裹会破坏对齐。
- 违反判定：该座位单个 list entry 渲染出的子树中包含多于一个可交互控件。可自动检测（渲染后遍历 DOM）。
