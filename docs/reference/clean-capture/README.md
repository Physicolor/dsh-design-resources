# 干净采集边界

干净采集用于核对 DSH 宿主界面。2026-10-05 的独立 profile 名为 design-guide-clean，bundle 清单仅含 DeepSeek 官方 base、web-app 与 experimental-schedule-bundle；第三方插件没有登记或加载。profile 位于 DSH_HOME 下，与日常 web、web2 和 Desktop profile 分开。

采集脚本只打开页面、切换已有视图并截图，不发送消息、不保存设置。完整图保留在 docs/reference/clean-capture-2026-10-05/ 供本地逐项核对，可能包含用户工作区和会话标题；不得嵌入或部署这些全屏图。可分享的局部裁图保存在 docs/reference/review-crops/，生成网页不引用截图。

session-tabs-user-reference.png 是用户提供图五中“对话／轨迹／上下文”的局部裁图。它仅用来核对页签标签；原图其他区域含插件内容，所以它不算干净采集，也不用于推断右栏或侧栏的宿主默认内容。完整会话截图在官方核心 profile 下超时，页签示意据此标为源码与用户参照核验，不标成干净实景验证。

旧的 02-session.png、05-settings-components.png 和 12-conversation-geometry.png 来自混合插件环境。05-settings-components.png 中的“组件”页包含 Command Code 与 dsh-widgets；它不能证明 DSH 宿主原生分段控件。
