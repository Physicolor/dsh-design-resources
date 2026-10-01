# 20 控件规范

- 适用对象：在主页面任何位置渲染交互控件的插件作者。
- 效力：含 MF / RC / AD，逐条标注。
- 本文的判据是否可自动检测：部分。尺寸、圆角、字号、命中区可用渲染后计算样式核对（自动）；变体选择是否恰当、层级是否清晰需人工审查。

## 1. 官方控件几何

[DSH-CSS] 以下数值读自官方未压缩 CSS 源，官方注释注明几何来自 Figma 组件（1:155 实例）。

| 控件 | 尺寸与几何 |
| --- | --- |
| Button（默认） | 高 36px，padding 0 14px，gap 4px，border-radius 18px，字号 14px / 行高 22px |
| Button `.sm` | 高 28px，padding 0 10px，border-radius 14px，字号 12px / 行高 18px |
| Button 内图标容器 | 16×16 |
| Switch | 36×20 |
| Tag | 11px 胶囊 |
| Pill | 在 24px 文字行上使用 |
| DisclosureRow | 24px 紧凑折叠行 |
| FileTypeIcon | 28px 文件／文件夹图标 |

- `CT-MF-01`：实现上述控件时必须复用官方几何，不得自定义高度、圆角、内边距或字号。判定：Button 计算高度只允许 36 或 28；圆角只允许 18 或 14；Switch 只允许 36×20。
- `CT-MF-02`：Button 内图标容器固定 16×16；图标不得改变按钮高度（不允许因图标更大而抬高行高）。
- `CT-MF-03`：FileTypeIcon 固定 28px，不得缩放到列表行高之下；行高不足时调整行高，不缩图标。

## 2. 变体选择判定

| 需求 | 应选控件 | 判据 |
| --- | --- | --- |
| 触发一个动作、提交 | Button 默认（h36） | 动作是主流程的一步 |
| 紧凑行内的动作 | Button `.sm`（h28） | 所在行高不允许 36px |
| 同一行动作超过 3 个 | 收进菜单 | 依据 [HIG] 功能不随空间变化，只改变可见量 |
| 表示当前选中项／筛选态 | Pill | 在 24px 文字行上表达状态 |
| 只做标记、不承载操作 | Tag（11px） | 无点击行为 |
| 布尔开关，立即生效 | Switch（36×20） | 改变后立即生效，无提交语义 |
| 需要确认后生效 | Button | 有提交／取消语义 |
| 折叠或展开一段紧凑内容 | DisclosureRow（24px） | 内容是次级信息 |
| 文件／文件夹身份 | FileTypeIcon（28px） | 表达对象类型 |

- `CT-MF-04`：Tag 不得绑定点击动作。Tag 是标记，不是按钮；需要点击的标记用 Pill 或 Button `.sm`。理由：Tag 的 11px 视觉尺寸无法满足 20×20 最小命中区，除非显式扩展热区（见 60-accessibility.md）。
- `CT-MF-05`：同一行不得混用 Button 与 Button `.sm` 表达同一层级的动作；层级差异用主次按钮（填充／描边）表达，不用尺寸混排。[本仓库建议]
- `CT-MF-06`：禁止用 Pill 或 Tag 承载提交动作，禁止用 Button 承载纯状态显示。

## 3. 状态

- `CT-MF-07`：每个交互控件必须定义五态：default、hover、active、focus-visible、disabled。缺任一态即判为缺陷。
- `CT-MF-08`：状态色只能取 token：hover → `--dsw-alias-interactive-bg-hover`；主按钮填充 `--dsw-alias-button-primary-fill`，其上文字 `--dsw-alias-label-primary-foreground`；错误 `--dsw-alias-state-error-primary`；成功 `--dsw-alias-state-success-primary`；警告 `--dsw-alias-state-warn-primary`；品牌 `--dsw-alias-brand-primary`。
- `CT-MF-09`：disabled 态不得仅靠整体降低不透明度到不可读；文字用 `--dsw-alias-label-tertiary`，并保持可辨识。[本仓库建议]
- `CT-RC-10`：同一区域（header、footer、dock 之一）内主按钮至多 1 个。理由：`--dsw-alias-button-primary-fill` 表达唯一主行动，多个主按钮使视觉层级失效。[本仓库建议]

## 4. 禁止事项

- `CT-MF-11`：禁止自造官方已有控件的替代品：自定义 checkbox、自定义 switch、仿下拉、`div` + onClick 冒充按钮。
- 自动判定：DOM 中出现 `role="button"` 但无键盘事件处理；或出现高度为 36／28／20 的自绘仿制控件而样式不来自官方类；或出现自绘 switch（宽高比非 36:20 的滑动开关）。
- `CT-MF-12`：禁止用 CSS 覆盖官方控件类的高度、圆角、字号。判定：插件样式中出现对官方控件类的几何属性覆盖。
- `CT-MF-13`：工具行控件高度必须与同行其他控件一致；`conversation.input.left` / `.right` / `.plan` / `.model` / `.activity` 中的图标按钮使用 16×16 图标容器，行内容器高度 ≥28（命中区要求，见 60-accessibility.md）。

## 5. 间距

- `CT-RC-14`：同一行相邻控件的水平间距取 8px，不同组之间取 16px。无权威数值：DSH 官方 CSS 只公开控件内部 padding 与 gap（如 Button 的 `gap 4px`），未公开控件之间的间距 token。本仓库建议 8 / 16，理由：8 符合 [OH] 的 4/8 倍数与 8vp 基线网格；16 为 [OH] 官方自检项「间距小于 16vp 判过挤」的通过下限。
- `CT-MF-15`：相邻独立控件之间的垂直间距小于 16px 判过挤。[OH]
- `CT-MF-16`：同一区域内所有同级控件的间距必须相等；逐个手写不同 margin 判为缺陷（自动判定：同级控件间距值集合不唯一）。[本仓库建议]

## 6. 快捷键按键帽（ShortcutKeys）

产品里有这个控件：新会话按钮行尾的 `Ctrl Alt N`、菜单项行尾的快捷键、工具提示里的按键。几何读自客户端 CSS 模块 `_keys_38b9q_1`（与 `_dot_1i3xo_2`、`_spinner_1i3xo_37` 同批），共三种形态：

| 形态 | 几何 | 用在哪 |
| --- | --- | --- |
| 平排（默认） | `.keys`：`display:inline-flex` · `align-items:center` · `gap:3px` · `font-size:12px` · `line-height:16px` · `white-space:nowrap` · 色 `--dsw-alias-label-tertiary`；每枚 `.key` 只做居中与 `font:inherit`（**没有底色、没有圆角、没有内边距**）；`+` 是一枚 `.separator` | 左栏新会话按钮行尾（采集：19 × 16、12/16、rgb(129,133,140)、bg 透明、radius 0） |
| 提示气泡 | `.tooltip`：`font-size:11px` · `line-height:14px` · `gap:2px`；`.tooltip .key`：`min-width:16px` · `height:16px` · `padding:0 2px` · `border-radius:4px` · 底 `--dsw-alias-tooltip-key-bg`（解析为 `color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)`，浅色即 #2c2c2e 混白 18%） | 工具提示里的按键 |
| 连排 | `.joined`：`height:16px` · `padding:0 4px` · `border-radius:4px` · 底 `--dsw-alias-tooltip-key-bg`，内部 `.key` 去掉自己的底 | 需要把一组键画成一个整体时 |

- `CT-MF-17`：按键帽只有这三种形态，不得自造第四种。平排形态**禁止**加底色或圆角——那是提示气泡形态的样子。判定：扫描平排按键帽上的 `background` / `border-radius`。
- `CT-MF-18`：按钮行尾的快捷键提示平时不可见。产品的写法是 `newSessionShortcut { opacity: 0; pointer-events: none }`，`newSession:is(:hover, :focus-visible)` 时才 `opacity: 1`；同一时刻给按钮文字加 `mask-image: linear-gradient(90deg, #000 calc(100% - 16px), #0000)`，让被挤到的文字渐隐而不是硬截断。判定：常驻可见的快捷键提示判违规。
- `CT-MF-19`：按键帽对辅助技术是装饰（产品把它包在 `aria-hidden="true"` 的容器里）；键位本身要能被读屏念到，就写在按钮的 `aria-keyshortcuts` 上——产品在两处这么做：搜索会话 `Control+Alt+K`、添加工作区 `Control+Alt+O`。

## 7. 会话头部的 chip、选择型菜单单元与菜单浮层

这三样在规范里一直没有位置，但产品里天天都在用（采集：`docs/reference/top-strip.json` 与元素清单的产品侧条目）。

### 7.1 会话头部 chip

| 部位 | 实测值 |
| --- | --- |
| 容器 | 高 **28**（实测 `智能体团队` 为 93 × 28 @ [532, 11]） |
| 图标 | **14 × 14**，色 `--dsw-alias-label-secondary` |
| 标签 | **12 / 16**，色 `--dsw-alias-label-tertiary`（实测 60 × 16 @ [572, 17]） |
| 折叠角 | 10 × 10，色 `--dsw-alias-label-tertiary` |
| 展开后的面板 | `dialog`，320 × 141 · 圆角 **12** · padding `8px 2px 0 2px` |
| 面板里的成员行 | 288 × 52 · 圆角 **8** · padding `10px 12px` · gap 8 · 图标 14 × 14 |

- `CT-MF-20`：会话头部 chip 的标签是 **12/16 三级色**，容器高 28。判定：把 chip 标签写成 13/20 或 14/22 判违规（本仓库的复刻曾把它做成 13/20，已按采集值改正）。
- 已知产品疏漏（不是设计决定）：面板里成员行的名字**没有取任何字号 token**，渲染成 Chromium 按钮的 UA 默认值 `13.3333px`。同一个面板里其余文字都是 12/16 或 13/20，只有它是浏览器默认值。插件作者照抄这一处会把疏漏一起抄走，所以规范取 13/20。

### 7.2 选择型菜单单元

产品里的「模型 / 推理等级」这类菜单项不是按钮排一行，而是一个单元：左边标签、右边当前值、末尾折叠角（`wq12jW_cell*`，实测于模型菜单）。

| 部位 | 实测值 |
| --- | --- |
| 左标签 | **13 / 20** · `--dsw-alias-label-primary`（实测 26 × 20 @ [1010, 731]） |
| 当前值 | **13 / 20** · `--dsw-alias-label-tertiary`（实测 174 × 20，与标签同一基线） |
| 折叠角 | **12 × 12**（实测 @ [1222, 735]） |

- `CT-MF-21`：选择型菜单项必须是「标签 + 当前值 + 折叠角」三段，当前值用三级色；不得把当前值做成按钮、也不得省略当前值——用户点开菜单就是为了看现在选的是哪个。

### 7.3 菜单浮层

| 部位 | 实测值 |
| --- | --- |
| 圆角 | **16**（`--dsw-radius-lg`；紧凑形态 12 = `--dsw-radius-md`） |
| 底 | `rgba(248, 249, 250, 0.58)`（material 层） |
| 背景模糊 | `--dsw-menu-backdrop-filter` = `blur(40px) saturate(150%)` |
| 高度 | 内容自适应，实测模型菜单 248 × 76 |

- `CT-MF-22`：菜单是**浮层**，圆角取 16（紧凑 12）、底走 material + 背景模糊，禁止把菜单画成不透明的白卡片；也禁止给菜单另加一层自造阴影——高程配方见 `components/patterns/SettingsPage/SPEC.md` 的 surface 一节。
