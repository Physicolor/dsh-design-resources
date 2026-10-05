# 演示实景证据

本表记录 HTML 示意的本地核验依据、归属和当前状态。截图与裁图只留在 `docs/reference/` 供逐项对照；网站生成的 HTML 只包含结构示意和核验说明，不嵌入 DSH 截图。映射由 `data/demo-evidence.json` 驱动；没有可靠状态依据的组件会隐藏示意。

## 文档演示

| 示例 | 原始 DSH 场景 | 归属说明 |
| --- | --- | --- |
| settings-general-item | [通用设置](clean-capture-2026-10-05/03-settings-open.png) | 干净 profile 实景；只抽取真实的一项偏好，说明 `settings.general.item` |
| settings-section | [模型设置页](clean-capture-2026-10-05/04-settings-models.png) | 干净 profile 实景；宿主菜单与内容列，说明 `settings.section` 的承载位置 |
| settings-independent-window | [公开座位表](../data/slots.json) | 非产品界面的支持边界图；当前没有独立插件设置窗口座位 |
| a11y-board | [设置通用页](03-settings-open.png) | 可访问性审核工具，图表本身不是产品 UI |
| app-icon-board | [插件列表行](15-plugin-row.png) | 插件图标坐在 DSH 插件列表里 |
| conflict-board | [插件列表](06-plugins.png) | 使用真实座位占用数据；冲突表不是 DSH 页面 |
| controls-geometry | [设置通用页](03-settings-open.png) | 以真实设置控件为测量对象 |
| frame-columns | [新会话页](01-hero.png) | DSH 左栏与主栏 |
| frame-composer | [输入区](07-composer.png) | DSH 实际输入卡和工具行 |
| frame-rightbar | [宿主右栏](review-crops/rightbar-clean-2026-10-05.png) | 干净采集可见「开始」「工作区文件」「新建终端」及其说明；不加入插件卡片 |
| icon-anatomy | [顶栏图标](13-top-strip.png) | 真实窗口图标的尺寸参照 |
| motion-panels | [会话与右栏](09-chrome.png) | 说明扩展栏布局，不推断未采集的动画时长 |
| motion-select | [设置通用页](03-settings-open.png) | DSH 实际选择控件 |
| preflight-checklist | [插件列表](06-plugins.png) | 提交检查工具，不是 DSH 页面 |
| rule-legend | [新会话页](01-hero.png) | 规则标记图例，不是 DSH 页面 |
| seat-map | [新会话页](01-hero.png) | 结构图以运行时座位树为依据，不是 DSH 页面 |
| sidebar-anatomy | [左栏顶部](review-crops/sidebar-top-clean-2026-10-05.png) | 官方核心 profile；注册位与 Desktop 差异放在栏外说明 |
| session-tabs | [用户图五页签裁图](review-crops/session-tabs-user-reference.png) | 仅核对三个宿主页签文字；原图插件区域不作依据，也不标成干净采集 |
| token-scale | [设置通用页](03-settings-open.png) | DSH 实际主题、字号、表面与控件 |

## 组件示例

| 组件 | 原始 DSH 场景 | 页面状态 |
| --- | --- | --- |
| Button | [通用设置](review-crops/settings-general-clean-2026-10-05.png)、[模型页](review-crops/settings-models-clean-2026-10-05.png) | 只展示干净实景中可见的正常态按钮 |
| Input | [通用设置](review-crops/settings-general-clean-2026-10-05.png) | 显示实景和示意 |
| Pill | [输入区](07-composer.png) | 显示实景和示意 |
| ShortcutKeys | [快捷键设置入口](03-settings-open.png) | 暂缓：未拍到实际键帽状态 |
| SegmentedControl | [设置组件页签](05-settings-components.png) | 暂缓：混合图含 Command Code 与 dsh-widgets，不能证明宿主原生控件 |
| Switch | [设置通用页](03-settings-open.png) | 显示实景和示意 |
| Tag | [插件列表](06-plugins.png) | 显示实景和示意 |
| Card | [插件列表行](15-plugin-row.png) | 显示实景和示意 |
| Modal | [设置窗口](03-settings-open.png) | 显示实景和示意 |
| EmptyState | [新会话页](01-hero.png) | 暂缓：图标、标题、说明和动作组合未被观察到 |
| InlineNotice | [顶栏状态区](13-top-strip.png) | 暂缓：通知条状态未拍到 |
| RunningRing | [运行中的会话行](16-running-row.png) | 显示实景和示意 |
| Toast | — | 暂缓：没有产品实际弹出的 Toast 截图 |
| DisclosureRow | [左侧导航](01-hero.png) | 暂缓：未拍到组件展开/收起状态 |
| KeyValueList | [右侧扩展区](09-chrome.png) | 插件贡献内容，明确标记 |
| MiniBar | [右侧扩展区](09-chrome.png) | 插件贡献内容，明确标记 |
| StateDot | [模型设置页](04-settings-models.png) | 显示实景和示意 |
| PanelHeader | [设置窗口](03-settings-open.png) | 显示实景和示意 |
| SettingsRow | [设置通用页](03-settings-open.png) | 显示实景和示意 |
| SidebarRow | [新会话页](01-hero.png) | 显示实景和示意 |
| ToolbarRow | [输入区](07-composer.png) | 显示实景和示意 |
| ListRowGroup | [插件列表](06-plugins.png) | 显示实景和示意 |
| PanelSeat | [右侧扩展区](09-chrome.png) | 社区建议；截图只说明真实宿主位置 |
| SettingsPage | [干净设置裁图](review-crops/settings-general-clean-2026-10-05.png) | 显示实景与窗外图例；不含虚构页面说明 |
| FishMark | [新会话页](01-hero.png) | 显示实景和示意 |
| Wordmark | [新会话页](01-hero.png) | 显示实景和示意 |

## 裁图与归属

`docs/reference/review-crops/` 中的裁图只供本地审核，生成网页不引用。干净采集使用的 profile 与 bundle 清单见 [clean-capture README](clean-capture/README.md)。旧 `02-session.png`、`05-settings-components.png`、`12-conversation-geometry.png` 属于混合插件采集；不要用它们证明宿主默认 UI。每张图只证明画面中实际显示的场景和状态，不推断未拍到的交互。
