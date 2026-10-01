# ToolbarRow 工具条行

一排按钮 / 控件的容器：水平 flex、垂直居中、可吸顶、可加底部 hairline。

## 是什么

一个纯布局的 `<div>`，本身不含任何按钮样式：

| 属性 | 取值 | 效果 |
| --- | --- | --- |
| `variant` | `plain`（默认） | 透明底，页面 / 面板内部的普通工具分区 |
| | `filled` | 官方工具条按钮底 `var(--dsw-alias-button-tool-bar-fill)`，浮在内容之上的浮层工具条 |
| `size` | `md`（默认） | 行高 32px，左右内边距 12px，间距 4px |
| | `sm` | 行高 28px，左右内边距 8px，间距 4px |
| `divider` | `false`（默认） | 无 |
| | `true` | 底部 `0.5px` 的 `var(--dsw-alias-border-l1)` |
| `sticky` | `false`（默认） | 无 |
| | `true` | `position: sticky; top: 0; z-index: 1` |

`flex-wrap: wrap` 默认开启，窗口变窄时按钮换行而不是溢出。零依赖，只用到 `react` 和 CSS Modules。

## 什么时候用

- 一排并列的动作按钮（筛选 / 排序 / 格式化 / 刷新）。
- 需要吸顶的工具条：`<ToolbarRow sticky divider size="sm">`。
- 浮在内容上方的悬浮工具条：`variant="filled"` 配 `Button variant="toolbar"`。

## 什么时候不要用

- 一组互斥选项（今天 / 本周 / 全部）：那是 `SegmentedControl` 或 `Pill` 的语义，工具条不表达「选中」。
- 单一动作：直接放一个 `Button`，不要为它套一层容器。
- 需要自动折行到第二行的导航菜单：用 `Menu`，工具条不做菜单语义。
- 页面顶部的完整应用栏（含 logo、搜索）：那是导航栏，不是工具条。

## 几何来源

数值全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib`：

| 数值 | 出处（文件名 + 选择器） |
| --- | --- |
| `min-height: 32px`（`md`） | `ConnectionIndicator.module.css` `.indicator`（`height: 32px`） |
| `var(--dsw-alias-button-tool-bar-fill)`（`filled` 形态的底色） | `Button.module.css` `.toolbar` |
| `gap: 4px`（默认间距） | `Button.module.css` `.button`（`gap: 4px`） |
| `min-height: 28px` + `gap: 4px`（`sm`） | `Button.module.css` `.sm`（`height: 28px`）——`Button size="sm"` 放进 `sm` 档工具条刚好撑满 |
| hairline `0.5px` + `var(--dsw-alias-border-l1)` | `Menu.module.css` `.separator`（`height: 0.5px; background: var(--dsw-alias-border-l1)`） |
| `border-radius: 8px` | `ConnectionIndicator.module.css` `.indicator`（`border-radius: 8px`）——透明底时不可见，`filled` 时才显示；不用官方 `Button` 的 18px 胶囊，因为整条工具条不是胶囊 |

`--dsw-alias-button-tool-bar-fill` / `--dsw-alias-border-l1` 均在 `website/css/dsh-tokens.css` 中查到（第 124 / 102 行，light 与 dark 两套都有）。

**为什么默认 `plain`（透明）而不是官方工具条底色：** 官方 `Button.module.css` 的 `.toolbar` 底色 `#54555780` 是**半透明深灰**，它是为「浮在聊天内容之上」的浮层按钮设计的。一个普通的页面内工具分区如果默认带上它，会在一块浅色面板上凭空多出一条灰带；所以本组件把 `filled` 作为显式选项，只有真的浮在内容之上时才打开。

**本仓库建议值（非官方数值）：**

- `padding: 0 12px`（`md`）/ `0 8px`（`sm`）：官方没有工具条容器。12px 是 4 的倍数，并与官方 `ConnectionIndicator.module.css` `.indicator` 的 `padding: 0 10px` 保持同一量级（略宽，因为工具条内是多个元素而不是单个胶囊）。`sm` 取 8px 与 `sm` 档自身高度 28px 成比例。
- `gap` 默认取 **4px**（官方 `Button.module.css` `.button` 的确切值）而不是 8px：工具条里相邻按钮通常已有自己的内边距，4px 的视觉分组更接近官方的工具条形态（官方把 4px 用在按钮内部 gap 与 Menu 分隔线四周）。`sm` 档同样是 4px。
- `z-index: 1`（`sticky`）：官方菜单用 100 / 1100、Modal 用 1000，都是浮层层级。工具条只是盖住同容器内后续内容，1 足够，也不至于把菜单压住。
- `flex-wrap: wrap`：官方没有列表容器可供参照，这是本仓库为保证窄容器可用的建议值；不接受换行的场景请自行传 `style={{ flexWrap: 'nowrap' }}` 或写自己的容器。
- `border-radius: 8px`：非官方必需项，仅为让 `filled` 形态的矩形底有圆角；若你把它铺满整行，可自行覆盖为 0。

实现为本仓库原创（CSS 变量承载几何 + 单类切换形态/尺寸），几何等价但不是官方 CSS 的复制。

## 可访问性要点

- 本组件是纯布局容器，**没有 `role`**。一排动作按钮应各自是 `<button>`；不要给它加 `role="toolbar"`，除非你真的实现了方向键在按钮间移动焦点的行为（ARIA `toolbar` 语义要求键盘方向键导航，做不到就是误导）。
- 如果加 `role="toolbar"`，请同时给 `aria-label="编辑器工具"` 之类的名字。
- 按钮若是**仅图标**，必须给 `aria-label`；图标 `aria-hidden="true"`。
- `variant="filled"` 的底色在浅色主题下是半透明深灰，其上的文字必须用 `var(--dsw-alias-label-primary-foreground)` 一类的反色文字（`Button variant="toolbar"` 已由官方 token 处理）。别把 `var(--dsw-alias-label-primary)` 的深色文字直接放上去。
- `sticky` 会让工具条盖住下方内容；用 `divider` 或底色把它和滚动内容分开，否则用户滚动时分不清边界。
