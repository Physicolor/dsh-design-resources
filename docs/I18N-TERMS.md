# 英译术语表（I18N-TERMS）

`docs/I18N.md` 定义"中英两份放在哪里"；这份文件定义**同一个中文词在英文里永远叫同一个词**。
72 篇文档由不同的人（或不同的 Agent）分头译，术语一旦各自发挥，英文站就会读起来像几个仓库。

**动手前必读**：`docs/I18N.md`（结构与门禁）、`docs/LANGUAGE.md`（写作语气）、本文件（用词）。
`website/gen-site.mjs` 与 `website/js/app.js` 里已有的英文串（`language/en.json`）是这份表的来源；
表中没有的词，先在同语言命名空间里找最接近的说法，实在没有就自己定一个并**加到本文件末尾**。

## 一、结构标题：逐字照抄，不能改

构建会按这些标题取内容，翻译时改动一个字，构建就会报错或某一段内容消失。

| 中文标题 | 英文标题（逐字） | 用在哪 |
| --- | --- | --- |
| `## 读完这一页要能做什么` | `## What this page gets you` | 每篇 `guides/*.md` 的任务清单 |
| `## 什么时候用它` | `## When to use it` | 每个 `components/**/README.md` |
| `## 什么时候不要用它` | `## When not to use it` | 每个 `components/**/README.md` |

这三条的源串也定义在 `scripts/lib/i18n.mjs` 的 `TASK_HEADINGS` 与 `README_HEADINGS` 里；
改标题必须同时改那里。

## 二、依据标记：两套，不能混

规范与指南各用一套方括号标记，表示这条规定是从哪来的。它们**不是标识符**，要译；但同一套里的
每个词必须全仓库一致。`language/en.json` 的 `markers.*` 与 `components.*` 是权威取值。

| 中文 | 英文 | 出处（`language/en.json`） |
| --- | --- | --- |
| `[官方源码]` | `[Official source]` | `markers.source` |
| `[运行时实测]` | `[Runtime measurement]` | `markers.measured` |
| `[外部指南借鉴]` | `[Borrowed principle]` | `markers.external` |
| `[本仓库建议]` | `[Proposed here]` | `markers.proposed` |
| `[已知偏差]` | `[Known deviation]` | `markers.deviation` |

`spec/` 里另有一套短标记，是这几个的简写，各自保留为独立词形：

| 中文 | 英文 |
| --- | --- |
| `[实测]` | `[measured]` |
| `[HIG]` | `[HIG]` |
| `[OH]` | `[OH]` |
| `[DSH-CSS]` | `[DSH-CSS]` |
| `[插件示例]` | `[Plugin example]` |
| `[待核对]` | `[Not yet checked]` |

## 三、核心词表

按"中文 → 英文"给。左列在源文里出现过的写法都要译成同一个右列。

| 中文 | 英文 | 备注 |
| --- | --- | --- |
| 座位 / 公开座位 | seat / public seat | `language/en.json` `seats.title` |
| 遮蔽风险 / 会不会盖住官方界面 | replacement risk / covers official UI | `seats.columns.risk` |
| 宿主 | host | |
| 插件作者 | plugin author | 不写 "developer" |
| 界面元素 | interface elements | `topnav.components` |
| 组件 | component | |
| 控件 | control | |
| 规范 | spec | 不写 "standard"／"specification" |
| 规范层 | design spec layer | |
| 指南 | guide | |
| 令牌 / 语义别名 | token / semantic alias | `topnav.tokens` |
| 原始色板 | palette | |
| 层级 / 阴影等级 | elevation / shadow level | |
| 圆角 | corner radius | 表格列里用 `radius` |
| 动效 / 时长 | motion / duration | |
| 图标 | icon | |
| 可访问性 | accessibility | |
| 自检清单 | checklist | `rules/rules.json` |
| 审计规则 | auditor's rules | |
| 通用设置 | Settings → General | 界面位置，大写首字母 |
| 设置分区 | settings section | |
| 左侧栏 | left sidebar | `sidebar.*` 座位前缀保留 |
| 右栏 / 宿主右栏 | rightbar / host rightbar | 座位名 `rightbar.*` 保留 |
| 会话区 | conversation | |
| 浮层 | overlay | |
| 输入区 / 输入框胶囊 | composer / composer capsule | |
| 界面语言 | interface language | 不是 "UI language" |
| 实景 / 实景文案 | real capture / copy as captured | 截图逐字抄来的串 |
| 示意 / 结构示意 | specimen / structural example | |
| 核验 | check / reconcile against | 不用 "verify" 作名词 |
| 出处 | where it comes from | 表格列用 `Source` |
| 判据 / 能不能自动检查 | criterion / machine-checkable | |
| 待办 | to-do | |
| 已收录 / 缺 | covered / gap | `inventory.stateCovered`／`stateMissing` |
| 第三方插件 | third-party plugin | |
| 插件市场 | plugin market | |
| 深色 / 浅色 | dark / light | |
| 令牌名 / 色值 | token name / colour value | |
| 长任务阻塞 | long-task blocking | 性能数字口径 |
| 掉帧 | dropped frames | |

拼写跟随仓库既有英文，统一到**英式**（`language/en.json` 主体如此）。下表左边是仓库里已经出现过的
美式写法，它们是要被清掉的漏洞，不是可选项：

| 不要写 | 写 |
| --- | --- |
| color / colors | colour / colours |
| behavior | behaviour |
| organized / organizes / organizing | organised / organises / organising |
| categorized | categorised |
| labeled | labelled |
| artifact | artefact |
| gray | grey |
| center | centre |
| meter（长度） | metre |

单位与数字原样，不改。

## 四、链接

英文文件住在 `en/` 子目录里，比中文源多一层，因此：

1. **相对路径要多补偿一级**：源文 `../components/index.json`，英文版写 `../../components/index.json`。
2. **锚点片段必须是 ASCII**：源文 `#通用设置里的一项偏好` → `#a-preference-in-general-settings`
   （小写、连字符、无空格）。`website/verify.mjs` 会把 href 里的中文判为漏译。
3. **文件名原样**：`20-pattern-settings.md` 不改名，只改前面的相对层级。

## 五、不译的东西

- 代码跨度里的标识符、类名、座位名、CSS 变量、文件路径、`[^1]` 引用标号。
- 产品实景文案（截图里逐字抄下的按钮文字）。它只出现在示意页里，用 `data-capture` 标记，
  见 `docs/I18N.md` 第五节。
- 数字、单位、百分比、毫秒值。改一个数就是改一条结论。

## 六、正例与反例

| 反例（直译腔） | 正例（仓库语气） |
| --- | --- |
| The present component should be noticed that the ordering is not predictable. | The same seat can come up in a different order after a refresh. |
| It is necessary for plugin authors to select an appropriate seat. | Pick the seat whose meaning fits best; if none does, consider `single`. |
| The specification stipulates that the value must be 16px. | Two independent controls closer than 16px read as cramped. |

语气规则以 `docs/LANGUAGE.md` 为准：具体场景、第二人称、一段一到四句、判断必给替代方案、
理由落在用户身上、不写「应当／必须」。
