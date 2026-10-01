# docs/reference — 真实界面基准

这个目录里的东西**不是设计稿，是运行中的 DeepSeek Harness 本身**。

## 为什么要有它

一份设计资源如果"复现"了一个它从没见过的组件，那就是在编造，而编造出来的组件会教错插件作者。所以这里的规矩是：

> **先截图 → 再量几何 → 才动手复现。**
> 任何 `website/shell/` 或 `website/demos/` 里的界面，都必须能对着本目录的截图解释"为什么是这个样子"。

之前 29 个组件 demo 全是"对着源码想象"出来的，结果是写出了并不存在的使用场景（例如给「列表行组」编了「恢复上次会话」这种按钮组合）。截图入库就是为了断掉这条路。

## 怎么重新采集

```sh
node scripts/capture-dsh.mjs                # 全部场景
node scripts/capture-dsh.mjs 01-hero 06-plugins
```

脚本用 `.credentials.yaml` 里的密钥铸造与浏览器同款的签名 cookie，认证到本机运行中的 `dsh web`（默认 `http://127.0.0.1:19387`），再用无头 Edge 逐场景截图。

**全程只读**：打开页面、切视图、量尺寸、拍照。不改设置、不发消息、不碰用户会话。

| 场景 | 文件 | 拍的是什么 |
| --- | --- | --- |
| `01-hero` | `01-hero.png` | 新会话页：hero、输入卡、工具行 |
| `02-session` | `02-session.png` | 会话页：消息流、工具调用卡、输入区、dock |
| `03-settings-open` | `03-settings-open.png` | 设置面板：分段按钮、开关、下拉、数字输入 |
| `04-settings-models` | `04-settings-models.png` | 设置 · 模型 |
| `05-settings-components` | `05-settings-components.png` | 设置 · 组件 |
| `06-plugins` | `06-plugins.png` | 插件列表：分组标题、行、行尾开关、主按钮 |
| `07-composer` | `07-composer.png` | 输入区特写 |
| `08-session-geometry` | `geometry.json` | 框架骨架的**真实渲染树**：每个占位节点的盒子与计算样式 |
| `09-chrome` | `chrome.json` | 侧栏图标 + 顶栏全部控件（含 SVG / 位图原样） |
| `10-composer-geometry` | `composer-geometry.json` | 输入卡子树（深 14 层）：圆角、内边距、工具行 |
| `11-status-line` | `status-line.json` | 卡下方 dock 的每一项：文字、字号、颜色、容器链与间距 |
| `12-conversation-geometry` | `conversation-geometry.json` | 会话区子树：阅读列、气泡、活动行、输入区、dock |
| `13-top-strip` | `top-strip.json` | 首行按像素位置扫出来的全部控件 |
| `14-settings-panel` | `settings-panel.json` | 设置窗口（800 × 800）：遮罩、导航列、内容行、选择器、主题方块 |
| `15-plugin-row` | `plugin-row.json` | 插件列表一行：应用图标方块、标题、状态标签、说明、开关 |
| `16-running-row` | `running-row.json` | 左栏会话行首的运行字形（转圈环）与它的动画 |

## 插件的部分不算产品的

采集是照着一台**装了插件**的机器拍的，所以图里混着插件画的界面。判据是类名与座位：

| 画面里的东西 | 是谁的 |
| --- | --- |
| 中栏右侧那列卡片（`Command Code`、`Token 用量` …） | 插件 `dsh-widgets`（`dsx-stats-*`、`dsx-stats-rail`），占的是产品的右栏；复刻官方骨架时不画 |
| 顶栏「组件」那枚胶囊（`dsx-stats-capsule`） | 同上，坐在 `conversation.session.header.utilities` 里 |
| 卡下方那行数字（轮/步、tok/s、缓存命中…） | 内容由座位占用者给出，坐在产品为 `conversation.input.dock` 留的盒子里；**盒子的几何是产品的**（`RlGAzG_dock`） |

## 会话页的横向几何（1570×905，无插件右栏时）

会话页最容易复刻错的是"一段话能有多宽"。它不是中栏宽度，而是中栏里再收一次的一条固定宽度的阅读列。

| 部位 | 数值 | 来源节点 |
| --- | --- | --- |
| 会话头部 | **50 高**（0..50）：页签 26 高、下划线在 y 37..38 | `conversation.session.header` |
| 标题左沿 | x = 308（中栏左沿 + **28**） | 头部首个子节点 |
| 阅读列 | **748 宽居中**（中栏 1290 时即 551..1299） | `xz4KEq_column` |
| 阅读区内边距 | 16px 32px | `xz4KEq_scroll` |
| 用户气泡 | 右沿贴阅读列右沿；圆角 **20**；padding 10px 16px；底色 rgb(237,243,254) | `cJsG2q_bubble` |
| 助手正文 | 没有气泡，14/24 直接落在背景上 | `v5IAXa_root` |
| 工具调用行 | 16px 图标 + 14px 标题，高 19 | `WW4l1q_title` |
| 输入卡 | **780 宽居中**、圆角 28、padding 8px 0 0、内 gap 12 | `RlGAzG_card` |
| 卡下 dock | 高 **26**（padding-top 4 + 22 的内容）；组内 gap 6、组间 14；字号 12/20 | `RlGAzG_dock` |
| 顶栏工具 | 右沿 x = 1558（离视口右沿 **12**）；按钮 28×28 居中于 50 高的首行 | `top-strip.json` |

## 插件侧台账（只统计，搁置）

产品侧的元素逐个归了位；第三方插件画出来的界面**只登记不展开**——它们不是 DSH 的界面语言，按「官方优先」的次序先放一边。台账由元素清单按类名族归类得出（`data/inventory-anchors.json` 的 `pluginFamilies`）：

| 插件 | 登记身份数 | 典型元素 |
| --- | --- | --- |
| `dsh-usage-center` | 109 | 热力格 `duc-heat-cell 15×15`、`lc-heat-cell 20×20`、侧栏入口 `260×34` |
| Command Code 插件 | 21 | 指标标签 `58×18`、分组标题 `28×22`、行标题 `98×22` |
| `dsh-widgets` | 18 | dock 统计胶囊 `153×22`、顶栏胶囊 `28×28`、通知开关行 `530×43` |
| 插件市场页（插件未识别） | 18 | 星标 `45×15`、描述块 `243×72`、仓库标记 `12×12` |
| `dsh-ui-harmonizer` | 15 | 数字微调 `72×36`、被规范化的表头 `564×26` |
| `dsh-market-fork` | 5 | 收录徽标 `91×20`、收藏按钮 `14×14` |
| 未识别 | 5 | 右栏标签宿主 `707×871`、标签条 `706×38` |
| 其它（lucide 图标、DeepSeek 客户端鲸鱼） | 2 | `lucide-smartphone 16×16`、`dpp-chat-launcher__whale 32×32` |
| **合计** | **193** | — |

**它们和产品的关系**：多数是「产品留了座位，插件放内容」——dock 里那行统计、右栏那列卡片、设置页里那些 section 都是这么来的。所以复刻产品骨架时不计入，但插件作者要知道这些座位存在（见 `spec/11-slot-seats.md`）。

## 采集方法上的一个坑

`[data-slot]` 节点是 `display: contents` 的**逻辑座位**，它们自己没有盒子——量出来全是 0。所以 `geometry.json` 量的是座位**渲染出来的元素**：从 `#root` 走一遍真实 DOM，留下每个占尺寸的节点及其计算样式（`geometry.json` 里 `nodes` 数组，每项含 `d` 深度、`cls` 类名、`rect` 盒子、`style` 计算样式）。

## 已量到的骨架（1580×905 视口）

| 部位 | 数值 | 来源节点 |
| --- | --- | --- |
| 框架 | 1570 × 905 | `*_frame` |
| 左栏 | **280 × 905**，x=0 | `*_sidebarCol` |
| 中栏 | **1290 × 905**，x=280 | `*_centerCol` |
| 侧栏拖拽手柄 | **8 px 宽**，x=276 | `*_handle` |
| 左栏内容根 | 280 × 905，padding 见下 | `*_root` |
| 品牌行 | 256 × 60 @ (12, 6) | `*_logoRow` |
| 品牌按钮 | 216 × 24 @ (16, 24) | `*_brand` |
| 品牌图标 | 24 × 18 @ (16, 27) | `*_brandMark` |
| 品牌文字起点 | **x = 48** | `*_brandName` |
| 折叠按钮 | 28 × 28 @ (240, 22) | `*_iconButton` |
| 新会话按钮 | **252 × 38** @ (14, 70) | `*_newSession` |
| 面板导航 | 256 × 76 @ (12, 120) | `*_panelList` |
| 面板行 | **252 × 36**，行距 40（即 4px 间隙） | `*_panelRow` |
| 工作区区域 | 272 × 569 @ (8, 204) | `*_regionArea` |
| 分组标题行 | **260 × 36** @ (12, 206) | `*_sectionHeader` |
| 列表区 | 272 × 527 @ (8, 246) | `*_listArea` |
| 底部区 | 256 × 126 @ (12, 773) | `*_footArea` |
| 底部动作行 | **260 × 42** @ (10, 815) | `lc-ov-entry` |
| 设置行 | **260 × 34** @ (10, 861) | `*_triggerRow` |
| 会话头部 | 新会话页没有它；会话页是 **1290 × 50** @ (280, 0) | `conversation.session.header` |
| 会话主体 | 1290 × 865 @ (280, 40) | `*_body` |
| 输入区座位 | 1283 × 238 @ (280, 354) | `*_composerSeat` |
| 输入卡 | **780 宽**，圆角 **28 px**，白底，padding 8px 0 0；hero 里高 114（输入区 52），会话里单行时高 98（输入区 36） | `RlGAzG_card` |

> 说明：`geometry.json` 里还出现了 `OUqwTW_panel`（707 px 宽）——那是**插件**（右侧组件栏）渲染的面板，不是产品自身的右栏。复刻官方骨架时不计入。

## 复刻时怎么用

1. 先看对应截图，确认"这里到底有什么"；
2. 再到 `geometry.json` 里查同类节点的 `rect` 与 `style`，取值而不是取感觉；
3. 复刻出的东西放进 `website/shell/`（界面骨架）或 `website/demos/`（规范演示）；
4. 演示数据一律用**假的示例数据**，不要放用户真实会话标题。
