# 自检与证据来源

> 提交前检查界面行为与可访问性，并确认每项关键数值都有版本、时间和可复现来源。

这一页面向 DSH 第三方插件作者。它不讲怎么设计，讲怎么**验证**：先跑哪些检查、哪些检查跑不了、每个数值来自哪里、以及哪些看起来像要求的东西其实只是官方 monorepo 的内部约束、与你无关。

## 来源标签：五选一

本仓库只有五种来源标记，任何数值必须携带其中一个。没有标签的数值即为缺陷（来源：`spec/00-overview.md` §4「凡数值无来源标签，即为缺陷」）`[本仓库建议]`。

| 标记 | 含义 | 什么时候用 |
| --- | --- | --- |
| `[官方源码]` | 公开仓库或随产品发布的源码、包、文档里的原文 | 引官方 `docs/`、`packages/client/`、随产品分发的 npm 包内容 |
| `[运行时实测]` | 在本机 DSH 上量到的值，方法可复现、附采集时间 | 座位占用数、几何读数、计算样式、对比度 |
| `[外部指南借鉴]` | 外部指南的条文，经本仓库转写后引用，不搬平台专属数值 | 命中区、对比度这类通用判据 |
| `[本仓库建议]` | 无权威数值时本仓库给出的建议值与理由 | order 分段、间距 8/16、关闭开关 |
| `[已知偏差]` | 官方实现与本仓库规范冲突，或两处证据互相矛盾 | 记录，不覆盖官方 |

注意 `spec/00-overview.md` §4 列的旧标签是 `[HIG]` / `[OH]` / `[DSH-CSS]` / `[实测]` / `[本仓库建议]`；`guides/` 用的是上表这套，两者含义对应，引用时不要混用。

## Apple 与华为设计指南的对照审阅

这次对照聚焦两个实际问题：插件设置应放在哪个层级，按钮示例如何展示。借用判断方法与文档编排，不把平台尺寸、外观或 API 转写成 DSH 规范。

| 官方指南 | 可迁移的审阅问题 | 本指南的对应调整 | DSH 差距与边界 |
| --- | --- | --- | --- |
| [Apple HIG：Settings](https://developer.apple.com/cn/design/human-interface-guidelines/settings) | 这是影响整体体验、低频调整的偏好，还是只影响当前任务／会话的选项？ | `00-start` 与 `20-pattern-settings` 先判断全局偏好、完整设置分区或会话内选项，再选择 `settings.general.item`、`settings.section` 或 `conversation.*` 座位。 | Apple 描述的平台设置入口和窗口不等于 DSH 插件 API。DSH 公开座位表没有独立插件设置窗口入口；本指南明确该情形当前不受支持，也不生成概念 HTML。 |
| [Apple HIG：Sidebars](https://developer.apple.com/cn/design/human-interface-guidelines/sidebars) | 侧栏是否只承担顶层导航？关键操作是否只能从侧栏底部找到？ | `21-pattern-sidebar-panel` 将左栏分成品牌、全局面板、工作区和宿主设置；将 `sidebar.footer.action` 限定为次要快捷入口。 | Apple 的侧栏层级规则不变成 DSH API；实际可挂载位置仍以 `data/slots.json` 为准。 |
| [Apple HIG：Buttons](https://developer.apple.com/cn/design/human-interface-guidelines/buttons) | 控件是立即执行动作，还是表达持续状态／一组选项？主次靠样式还是尺寸？自定义按钮是否有按下反馈？ | 设置指南把动作按钮与下拉、外观选项和开关分开；Button 页面按变体展示干净实景里可核对的真实文案，并提供实现源码。 | DSH 实景截图只证明拍到的状态；Apple 的命中区数值和平台状态外观不复制到 DSH。按钮源码里哪些是官方几何、哪些是本仓库建议分别标注。 |
| [HUAWEI Vision Design Guide：Buttons](https://developer.huawei.com/consumer/en/doc/design-guides-V1/button-0000001052807858-V1) | 按钮是否按用途、视觉类型和状态组织；文案是否直接说明动作；相邻按钮是否保持一致？ | Button 页面借用分类和并列对照的展示方式，先列实际存在的 DSH 按钮，再附本仓库的 TSX/CSS 实现。 | 华为的视觉类型、状态和间距规则属于其平台。本站不把 HarmonyOS 分类映射成 DSH 官方组件。 |
| [HUAWEI HarmonyOS：按钮开发指导](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V13/arkts-common-components-button-V13) | 示例能否从成品回到具体的组件声明与事件实现？ | Button 页展示可复制的 `components/controls/Button/index.tsx` 与 `button.module.css`，并把它们标成资源仓库实现。 | 本仓库实现参考 DSH 官方 CSS 几何，但不是 DSH 官方 React 组件源码；HarmonyOS ArkTS 写法不能直接用于 DSH 插件。 |

本轮还保留两项未验证：Desktop 账户／登录状态没有干净 Web 截图，只说明宿主管理的 `settings.launcher`；会话页签没有取得干净全屏截图，只用用户图五的页签局部与 UI inventory 交叉核对，并在证据映射中标为 `source-verified`。Button gallery 只展示干净采集中的正常态；没有采到的键盘焦点、禁用或按下态不会画成 DSH 现状。

## 官方自检清单

| 分组 | 条数 | 不通过的后果 | 来源 |
| --- | --- | --- | --- |
| A 必选 | 51 | 任一条为「否」即不得提交 | `spec/70-checklist.md` `[本仓库建议]` |
| B 推荐 | 13 | 为「否」需在 README 写明理由 | 同上 `[本仓库建议]` |
| 合计 | 64 | — | 同上；`rules/rules.json` 的 `counts.total` = 64 复核一致 `[运行时实测]` |

按可检测性分：自动 36 / 半自动 19 / 人审 9（来源：`rules/rules.json` 的 `counts.byDetection`）`[运行时实测]`。这三个数决定你的验证策略：**自动那 36 条应该进 CI，人审那 9 条只能靠你自己看**。

人审项集中在 A01–A04、A12、A14、A35、A38、A41、A51（来源：`spec/70-checklist.md` 第 85–89 行「审核者备注」）`[本仓库建议]`。它们是：归属是否唯一、主流程是否只在右栏、工具行是否只放本次输入的控件、overlay 里有没有常驻 UI、是否遮蔽唯一入口、chain 是否回落、帧率、自绘图标视觉重量、光学居中、200% 放大、窄窗口功能是否消失。

## 本仓库怎么自检

| 命令 | 做什么 | 覆盖到什么 | 来源 |
| --- | --- | --- | --- |
| `npm run verify` | 三趟：结构（必需文件与生成数据齐全）、静态（`website/js/data.js` 能解析且计数与采集 JSON 一致）、浏览器（无头 Edge/Chrome 逐路由访问、收控制台错误、出首页截图） | 站点与生成数据的一致性 | `website/verify.mjs` 文件头 `[本仓库建议]` |
| `npm run audit` | 真实浏览器里逐页展开每个演示、对 shadow root 内**每一个可交互元素**合成点击一次，然后量三件事：有没有盒子盖住 ≥85% 视口、有没有盒子越出演示框 60px、演示框高度有没有暴涨 | 演示的交互副作用（静态检查看不见的那类） | `scripts/audit-demos.mjs` 文件头与第 8–13 行 `[本仓库建议]` |
| `npm run refs` | 把 `spec/`、`README*.md`、`icons/README.md` 里反引号中的点号标识（首段属于 `sidebar`/`conversation`/`settings`/`shell`/`rightbar`/`main`/`plugins`）逐个对 `data/slots.json` 校验 | **不含 `guides/`**——本页与 30 篇里的座位名不会被这条检查覆盖 | `scripts/check-refs.mjs` 第 30、36–47 行 `[本仓库建议]` |
| `npm run build` | 依次跑 `gen-rules.mjs` → `gen-site.mjs` → `check-refs.mjs` → `verify.mjs` | 提交前的完整链路 | `package.json` 的 `scripts.build` `[本仓库建议]` |

第三条值得单独记住：`guides/` 不在 `check-refs.mjs` 的扫描范围内（该脚本的 `targets()` 只收 `spec/*.md`、`README.md`、`README.zh-CN.md`、`icons/README.md`，来源：`scripts/check-refs.mjs` 第 36–47 行）`[本仓库建议]`。所以指南里写错一个座位名，工具不会提示你。

## 每个数字凭什么可信

| 数字 | 口径（必须一起写） | 来源 |
| --- | --- | --- |
| 座位 90 · single 38 / list 34 / keyed 15 / chain 3 | 采集时间 2026-10-01，本机版本 0.2.0-rc.2 的座位树 | `data/slots.json` 的 `counts` `[运行时实测]` |
| 作用域 root 42 / session 43 / session-maybe 5 | 同上，三种互斥，相加 = 90 | 同上 `[运行时实测]` |
| 占用风险 41 / 49 | 同上，`shadows-shipped-ui` 41、`none` 49 | 同上 `[运行时实测]` |
| 座位占用者 14 / 11 / 4 / 4 | **只对 4 个座位**采样；数量取决于当时装了哪些插件，引用必须带采集时间 2026-10-01 19:02 | `data/raw/occupancy-2026-10-01.json` `[运行时实测]` |
| 界面身份 436 · 覆盖 covered 390 / described 102 / referenced 8 / missing 38 · 插件自有 119 | 身份 = 采集到的去重元素族；covered = 人工锚点命中，described = 目标文件里写下了实测尺寸，missing = 待办 | `data/ui-coverage.json` 的 `counts`、`data/ui-inventory.json` 的 `counts` `[运行时实测]` |
| 组件归属 official 23 / proposed 3 | official = 产品里真实存在（官方 primitives 有同名组件，或产品自有 CSS 模块在渲染它）；proposed = 产品里没有这个界面，几何是锚定官方选择器拼出的建议 | `components/origins.json` `[运行时实测]` |
| token 计数 palette 77 / lightAliases 115 / darkAliases 119 / scale 207 | **四组分属不同选择器口径**：palette 与 scale 来自 `:root`，lightAliases 来自 `body`，darkAliases 来自 `body[data-ds-dark-theme]`；四个数不可相加，也不是「DSH 一共有多少 token」 | `data/tokens.json` 的 `blocks` 与 `counts` `[运行时实测]` |
| 图标 75 | 官方图标集采集计数 | `data/icons.json` 的 `counts.total` `[运行时实测]` |

### 「口径」长什么样

token 那四项是最容易被引用错的。它们的来源选择器互不相同，所以既不能相加，也不能说成「DSH 的 token 总数」（来源：`data/tokens.json` 的 `blocks` 与 `$comment`）`[官方源码]`：

| 分组 | 计数 | 选择器 | 这是什么的计数 |
| --- | --- | --- | --- |
| palette | 77 | `:root` | 静态色板变量 |
| lightAliases | 115 | `body` | 浅色主题下的语义别名 |
| darkAliases | 119 | `body[data-ds-dark-theme]` | 深色主题下的语义别名 |
| scale | 207 | `:root` | 尺寸、字号、圆角、动效等非颜色标尺 |

采集脚本是 `scripts/collect-tokens.mjs`，源是随产品分发的 bundle（`data/tokens.json` 的 `source` 指向本机 `app.asar`）`[官方源码]`。深色别名比浅色多 4 个（119 对 115）是产品事实，不是采集误差；不要拿 115 当「唯一正确值」。

### 一个数字怎么追到来源

以「浅色白底下三级文字对比度约 3.7:1」为例，完整可复算的链条是：

1. 语义别名定义：`--dsw-alias-label-tertiary: var(--dsw-static-neutral-bluish-600)`，浅色在 `body`，深色在 `body[data-ds-dark-theme]`（来源：`data/tokens.json` 第 157、272 行）`[官方源码]`。
2. 解析后的十六进制值：浅色 `#81858c`、深色 `#adb2b8`（来源：`data/tokens.json` 的 `resolved.light` 与 `resolved.dark`）`[官方源码]`。
3. 底是 `#ffffff`（浅色白底，产品实测底值来自 `docs/reference/composer-geometry.json` 的 `bg` 字段）`[运行时实测]`。
4. 按 WCAG 相对亮度公式现算得到 3.7:1，不是查表（来源：`website/demos/a11y-board.html`，公式与取值都在该页脚本里）`[运行时实测]`。

换其他文字色按同一条链条走：`label-primary` 浅色 `#0f1115`、约 18.9:1；`label-secondary` 浅色 `#61666b`、约 5.8:1（来源：`data/tokens.json` 的 `resolved.light`，比值为 `spec/60-accessibility.md` §3 的现算结果）`[运行时实测]`。三个值放在一起才能说明问题：不是「对比度不达标」，而是**只有第三级不达标**。

## 自检的深度：静态检查看不见什么

`npm run audit` 的存在本身是一条证据（来源：`scripts/audit-demos.mjs` 文件头）`[本仓库建议]`。它记录的两次事故是：点了选择器整个窗口变白（浮层逃出演示框盖住整页）、折叠目录里按钮自带的边框把行画成一个个方框。这两类问题里 DOM 是对的，**几何是错的**，所以任何只看 DOM 的检查都抓不到。

对你的插件，可迁移的结论是三条：交互出现后要重新量几何、浮层要确认没有逃出自己的容器、自带边框的第三方控件要确认没有把布局画坏。这三条都不在 64 条清单里，属于自检要自己补的部分。

采集方法上有两个坑，任何人复算前必须知道（来源：`docs/reference/README.md` 第 89–97 行）`[本仓库建议]`：

1. `[data-slot]` 节点是 `display: contents` 的逻辑座位，**自己没有盒子**，量出来全是 0。要量座位渲染出来的元素，不是量座位。
2. `profiles/node_modules/@deepseek-ai/dsh-client-ui-primitives/lib` 是**旧版**（只有 24 个 CSS 模块，没有 `SegmentedControl` / `MenuGroup` / `SegmentedTabs` / `TextShimmer` / `SettingsForm` / `Checkbox`）。判定「官方有没有某个控件或字号」必须查产品实际加载的那份（`app.asar` 内 `node_modules/@deepseek-ai/dsh-client-ui-primitives/lib/`），只看 profiles 那份会得出与事实相反的答案。

## 哪些是官方内部约束，第三方不必照搬

下列条目写在官方 `packages/client/AGENTS.md`（以及它引用的仓库规则）里，服务于官方 monorepo 自身的开发流程，**不是第三方插件的提交门槛**。列在这里是为了让你读到它们时不要误以为自己违规。

| 官方内部约束 | 对谁生效 | 第三方怎么办 |
| --- | --- | --- |
| 三处注册面：`tsconfig.client.json` 的 `references`、`packages/bundle/web-app/cordis.patch.yml` 的 `dsh.client` 行、`bundle/web-app/package.json` 的依赖 | 官方 workspace 内的 `packages/client/*` | 你从自己的 profile/包加载插件，不走这三处 |
| `pnpm run test:gui`、`DSH_SNAPSHOT=replay/refresh/record` 快照回放 | 官方仓库的改动 | 跑你自己的测试即可 |
| 每个 client 源文件 100% 覆盖率门槛、`/* v8 ignore */` 注释纪律 | 官方 `packages/client/*` | 不适用 |
| 同 PR 落 Agent Note（非平凡变更） | 官方仓库 | 不适用；你的 README 承担同样角色 |
| `verify-package-dependencies` / `verify-client-packages` / `verify-client-ui-i18n` / `verify-client-domain-graph` | 官方仓库脚本 | 不适用 |
| workspace 协议与 `pnpm --filter … bundle`（注册表服务的是 `lib/client.js`，不是源码） | 官方包 | 这条对你有用：改了插件必须重新构建，运行中的界面才看得到 |
| `PLATFORM_MODULES` / `ClientModuleSystem` / 基线 externals / `dsh.client.external` 仅限基础设施 | 官方模块图 | 你只声明自己真实需要的导入；`external` 不是功能插件拿别的包值的通道 |
| 「一个 UI 功能 = 一个插件包」、`dsh.client` 固定 `platform:'web'` 且必须有 `./client` 导出 | 官方目录制度 | 这条第三方也适用，且成本很低，建议照做 |
| 设计评审名单、品牌资产（FishLogo / Wordmark / Montserrat） | 官方品牌 | 不适用；不要在自己的插件里复制品牌资产 |

来源：`packages/client/AGENTS.md` 的 Export discipline / Directory regime / Testing and coverage / New plugin package checklist / Shared modules and the module graph 各节 `[官方源码]`。

## 已知偏差

以下是本仓库记录在案、**不覆盖官方实现**的偏差。处理方式统一为「记录 + 给插件作者可执行结论」，依据 `spec/00-overview.md` §4.1「官方优先」。

| 序号 | 偏差 | 证据 | 本仓库怎么处理 |
| --- | --- | --- | --- |
| 1 | 官方 Button 自身的圆角与本仓库记的官方圆角规范对不上：`spec/20-controls.md` 第 13、14 行与 `components/controls/Button/SPEC.md` 记 `md` r18 / `sm` r14；`docs/ui-radius.md` 只允许 4/8/12/16/20/28 并写明 Button `sm` R8 / `md` R12。复核产品实际加载的 `Button.module.css`（`app.asar` 内 `@deepseek-ai/dsh-client-ui-primitives`）用 `border-radius: var(--dsw-radius-md)` 与 `--dsw-radius-sm`，即 12 与 8，**与 `docs/ui-radius.md` 一致、与本仓库记的 r18/r14 不一致**（来源：`app.asar` 内该模块，`[官方源码]`） | `components/controls/Button/SPEC.md`、`spec/20-controls.md`、`docs/ui-radius.md`、`app.asar` | 记为本条偏差，不改官方；作者侧结论是**新写的控件只取 4/8/12/16/20/28**，不要照抄 r18/r14。`A15` / `A25` 按圆角阶梯判定 |
| 2 | 浅色白底下 `--dsw-alias-label-tertiary` 约 3.7:1，低于 4.5:1，而 13px 说明文字与 10px 状态标签用的正是它 | `spec/60-accessibility.md` §3、`guides/24-pattern-feedback.md`、`website/demos/a11y-board.html`（浏览器现算）；解析值为 `#81858c`（`data/tokens.json` 的 `resolved.light`），深色为 `#adb2b8` | 记录为已知偏差，不覆盖官方控件。作者侧结论：正文与说明优先 `label-primary` / `label-secondary`；用三级色时不要把关键信息只放在那里 |
| 3 | 三个组件只有场景、没有实测本体：`key-value-list`（产品无键值列表，只有插件在用量面板渲染的键值行）、`mini-bar`（比例读数的位置实测到了，条本体 track/fill 没实测到）、`panel-seat`（座位系统真实，但「插件插入的块」本体没实测到） | `components/origins.json` 的 `proposed` 与 `scenes` | 标记为 `proposed`，网站分开显示；作者照用时自行承担与真实界面的差异，不要当成官方界面引用 |

上面第 1–3 条是最需要先知道的三条：一条是官方读数与官方规范互相矛盾，一条是可访问性硬指标不达标，一条是组件只有场景没有实测本体。下面是本仓库当前记录在案的完整偏差索引，每条都能追到证据文件。

| 序号 | 偏差 | 证据 |
| --- | --- | --- |
| 4 | `conversation.input.dock` 的父座位：`data/slots.json` 记父为 `conversation.content`（depth 0），原始树把它放在 `conversation.composer.bar` 之下，而它的 `purpose` 写的是「above the composer card」。两处快照不一致，座位名 / kind / purpose 一致 | `data/slots.json`、`data/raw/slot-tree-2026-10-01.json`、`guides/22-pattern-composer.md` |
| 5 | 「卡下方的 dock」对应哪个座位：原始树里「below the composer card」是 `conversation.composer.dock`，但 `website/shell/shell.css` 的 `.sh-status` 注释把它称作 `conversation.input.dock` | 同上 |
| 6 | 输入卡高度有两个值：`docs/reference/composer-geometry.json` 实测 780 × 114（新会话页），`website/shell/parts/composer.js` 注释写会话里单行时 780 × 98。不是矛盾，是两种草稿行数 | `docs/reference/composer-geometry.json`、`website/shell/parts/composer.js` |
| 7 | 输入卡圆角 28 不在 `TK-MF-03` 的字面尺度里，属「官方容器自身圆角」 | `spec/30-tokens.md`、`docs/ui-radius.md` |
| 8 | 工具行水平间距：`CT-RC-14` 建议行内相邻控件 8px，实测工具行是 `gap 12`。有实测的场景以实测为准 | `spec/20-controls.md`、`components/layout/ToolbarRow/SPEC.md` |
| 9 | Switch 滑块过渡是官方 `120ms ease`，不在五档内 | `spec/40-motion.md`、`spec/00-overview.md` §4.1 |
| 10 | Toast 进场 `160ms ease-out`、淡出 `1000ms ease`，既不在五档内也超过 350ms，曲线也不是标准曲线；以官方锚点优先，`A30` / `A31` 需人工确认 | `components/feedback/Toast/SPEC.md` 第 119、120 条 |
| 11 | 持续动效的曲线：官方 `ease-in-out` 与 `linear` 并存，而 `MO-MF-06` 禁止非标准曲线用于交互过渡；持续动效不在该条管辖范围 | `spec/40-motion.md` 第 52–56 行 |
| 12 | `ongoing` 状态有两套官方实现（primitives 包的像素追逐矩阵与产品实际渲染的转圈环），真实界面里只出现了后者 | `guides/24-pattern-feedback.md` |
| 13 | EmptyState 的「图标 + 标题 + 说明 + 动作」组合形态、InlineNotice 的 `info` / `error` 语气，产品里没有对应物，整组几何是 `[本仓库建议]` | `components/feedback/EmptyState/SPEC.md`、`components/feedback/InlineNotice/SPEC.md` |
| 14 | 深色主题对比度、官方 `ConnectionIndicator` 在窄容器中的行为 | 无证据 |

第 4–5、11–13 条的详细说明见 `guides/22-pattern-composer.md` 与 `guides/24-pattern-feedback.md` 末尾的「来源与已知偏差」节。**处理原则统一**：记录、写明作者侧可执行结论、不改官方实现（依据：`spec/00-overview.md` §4.1）。

## 提交前你怎么自查

| 步骤 | 动作 | 判定 |
| --- | --- | --- |
| 1 | 从 `rules/rules.json` 取出 `level: "required"` 的 51 条，逐条对照 | 任一条为否 → 不提交 |
| 2 | 把 `detection.tier: "auto"` 的 36 条写成脚本（静态扫描源码与构建产物） | 应为全绿 |
| 3 | `detection.tier: "semi"` 的 19 条逐条人工确认脚本给的候选 | 记录确认结论 |
| 4 | 人审的 9 条按各篇文档口径逐条看，尤其是 A01–A04、A12、A51 | 无脚本可依赖 |
| 5 | 推荐组 13 条若有「否」，在 README 写明理由 | 写清楚即可 |
| 6 | 检查你写下的每个数值都带五标签之一；无标签的当场补来源或删掉 | `spec/00-overview.md` §4 铁律 |
| 7 | 确认没有把上节「官方内部约束」当成自己的门槛去满足 | 不必照搬 |

## 依据

实际读过的文件与 URL：

- `spec/00-overview.md`（§4 来源标签、§4.1 官方优先）、`spec/70-checklist.md`（A 51 / B 13、检测方式、审核者备注）、`spec/60-accessibility.md`（§3 对比度）
- `rules/rules.json`（`counts.total` 64、`byLevel` 51/13、`byDetection` 36/19/9）
- `website/verify.mjs`（三趟自检）、`scripts/audit-demos.mjs`（交互审计）、`scripts/check-refs.mjs`（扫描范围）、`package.json`（`scripts.build`）
- `docs/reference/README.md`（采集方法与两个坑）、`components/origins.json`（official / proposed / scenes）
- `data/slots.json`、`data/raw/occupancy-2026-10-01.json`、`data/tokens.json`、`data/ui-inventory.json`、`data/ui-coverage.json`、`data/icons.json`
- `components/controls/Button/SPEC.md`、`components/controls/Button/button.module.css`、`spec/20-controls.md`、`website/demos/a11y-board.html`
- https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/AGENTS.md
- https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/ui-radius.md
