# 演示：先核对依据，再看结构

本目录的 HTML 是可单独检查的结构示意。截图只用于本地逐项核对；生成网页只显示核验说明与 HTML，不输出 DSH 截图图片。

截图映射由 `data/demo-evidence.json` 驱动，逐项审阅表见 `docs/reference/demo-evidence.md`。原始采集和审阅裁图保存在 `docs/reference/`，不作为网页素材。

## 证据规则

1. 新增或更改产品界面示例前，先用只加载官方 DSH bundles 的独立 profile 核对对应场景。
2. 在 `data/demo-evidence.json` 登记本地截图来源、审阅裁图、场景和归属。
3. 产品控件示例只画截图和运行时数据能证明的状态。插件贡献内容标为插件场景；规则图、审核清单等工具标为说明图，不伪装成 DSH 页面。
4. 没有干净截图或官方源码证明的产品状态标为 `withheld`，不显示 HTML 示例；只有源码和用户参照时标为 `source-verified`。概念方案可标为 `proposed`，但必须在窗体外明示其不是产品实景或公开 API，且不能挂截图证据。
5. HTML 示意用于解释结构或行为，不替代实景，也不把社区建议标成官方实现。生成页面不嵌入截图。
6. 组件是否为 DSH 原生还要看 components/origins.json。有截图不等于归属已确认。

## Markdown 引用

在 spec/ 或 guides/ 的 Markdown 文件里独占一行写：

    <!-- demo: frame-columns | 新会话页的两栏关系。截图为产品实景，旁边是布局示意。 -->

引用名对应 `website/demos/<名称>.html`。每个演示都要有证据状态：`verified` 与 `source-verified` 显示来源说明，`proposed` 显示为非产品概念，`withheld` 不挂载 HTML。

复用组件示例时写：

    <!-- component: settingsrow | 对照设置页中的真实设置行。 -->

组件示例也需要来源依据。没有干净实景或官方源码支持的状态，网页显示暂缓说明，不挂载 demo.html。

## 可见示例清单

| 文件 | 原始 DSH 场景 | 内容性质 |
| --- | --- | --- |
| a11y-board.html | 03-settings-open.png | 设置控件的可访问性审核工具，不是 DSH 页面 |
| app-icon-board.html | 15-plugin-row.png | DSH 插件列表中的插件图标 |
| conflict-board.html | 06-plugins.png | 真实座位占用数据的冲突图解，不是 DSH 页面 |
| controls-geometry.html | 03-settings-open.png | 实测控件与规则说明 |
| frame-columns.html | 01-hero.png | 新会话页窗口分栏 |
| frame-composer.html | 07-composer.png | 会话输入区与工具行 |
| frame-rightbar.html | review-crops/rightbar-clean-2026-10-05.png | 干净 profile 中的「开始」右栏及「工作区文件」「新建终端」操作卡 |
| icon-anatomy.html | 13-top-strip.png | 顶栏真实图标的几何说明 |
| motion-panels.html | 09-chrome.png | 右侧插件区域的布局变化说明 |
| motion-select.html | 03-settings-open.png | 设置页实际选择控件 |
| preflight-checklist.html | 06-plugins.png | 检查插件界面的清单工具，不是 DSH 页面 |
| rule-legend.html | 01-hero.png | 规范标签说明，不是 DSH 页面 |
| seat-map.html | 01-hero.png | 运行时座位结构说明，不是 DSH 页面 |
| sidebar-anatomy.html | review-crops/sidebar-top-clean-2026-10-05.png | 左栏宿主分区与栏外注册说明 |
| session-tabs.html | 用户图五页签裁图 | 宿主页签文字的局部参照，不含会话正文 |
| settings-general-item.html | clean-capture-2026-10-05/03-settings-open.png | 干净实景中的真实通用设置项 |
| settings-section.html | clean-capture-2026-10-05/04-settings-models.png | 干净实景中的宿主设置页；图例说明扩展位置 |
| settings-independent-window.html | data/slots.json | 公开座位边界图；不模拟 DSH 窗口或控件 |
| token-scale.html | 03-settings-open.png | 实际设置界面中的令牌应用 |

## HTML 约定

示意使用独立 HTML 文件和官方语义令牌，不加载外部图片、字体或 CDN。站点将其隔离在 shadow root 中；实景截图只保存在本地参考目录，不进入网页。示例数据使用中性内容，不复制真实会话正文、文件路径或用户数据。
