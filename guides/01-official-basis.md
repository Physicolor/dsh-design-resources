# 官方依据与适用范围

> 官方样式、交互和插件接口依据分布在仓库文档、Agent 指引与源码中。本页区分可用于社区插件的规则、仅适用于官方客户端的工程约束，以及本仓库的补充建议。

## 任务

- 知道官方公开仓库在哪、本文引用的规则出自哪个文件
- 拿到「插件作者必须遵守」的那批官方规则（附原文关键词与链接）
- 分清哪些只对官方 monorepo 成立、第三方不必照搬
- 知道官方没有表态的地方在哪，那些地方由本仓库建议补位

## 来源与版本

| 项 | 值 |
| --- | --- |
| 公开仓库 | `https://github.com/deepseek-ai/deepseek-harness`（`DeepSeek-Harness` 会重定向到该小写名） |
| 默认分支 | `master`（不是 `main`；`/main/...` 全部 404） |
| 仓库版本 | 根 `package.json`：`@deepseek-ai/dsh-root` **0.2.0-rc.2**，MIT |
| 本机运行版本 | `@deepseek-ai/dsh-*` **0.2.0-rc.2**（nightly 通道，Windows x64 10.0.26200） `[运行时实测]` |
| 抓取时间 | 2026-10-02 `[运行时实测]` |

**版本号一致，但不等价**：`master` 是浮动引用（最近一次推送 2026-09-29），本机是某个构建快照。本文引用的是文档正文，未逐字比对产物。本机 `app.asar` 里只有构建后的 `node_modules/@deepseek-ai/**`（62 个 `dsh-client-*` 包），**没有** `AGENTS.md` / `docs/` / skill 正文，所以无法在本机逐字复核文档。

## 前置结论：官方有没有「面向插件作者的设计规范」

**有规则，但没有一页面向社区插件作者的完整设计手册。** 已核对的官方文档目录里没有 client-plugin 设计章节；`docs/cookbook/extension-cookbook.md` 只有一小节 "A UI plugin"。规则分散在 `docs/web-styling.md`、`docs/ui-radius.md`、`.agents/skills/dsh-client-ui-ux/SKILL.md`、`packages/client/AGENTS.md`、`docs/subsystems/slots.md` 与各包 README 里。

这是「在目录清单里没看到」+「这些文件里写的是给官方 client 包用的」，**不是**「官方完全没有 UI 规范」。本仓库的定位就是把它们整理成插件作者可发现、可理解、可验证的一份参考。

## 一、样式与令牌 `[官方源码]`

出处：`docs/web-styling.md`、`docs/ui-radius.md`（URL 前缀 `https://github.com/deepseek-ai/deepseek-harness/blob/master/`）。

| 规则 | 原文关键词 |
| --- | --- |
| 功能组件只用 `--dsw-alias-*` 语义 token，不写字面色 | "Use `--dsw-alias-*` semantic tokens in feature components" |
| 圆角按角色取 `--dsw-radius-xs\|sm\|md\|lg\|xl\|panel`（4/8/12/16/20/28），不要引入 10/14/18/24 这类本地值 | "instead of introducing local values such as 10px, 14px, 18px, or 24px" |
| 同心嵌套圆角：inner R = max(0, outer R − inset) | "Concentric inset" |
| 设置卡统一材料：R20 + `0.5px solid var(--dsw-alias-settings-card-stroke)` + `--dsw-alias-settings-card-fill` | `.card { border-radius: var(--dsw-radius-xl); border: 0.5px solid … }` |
| 浮起表面 `border: 0` + `box-shadow: var(--dsw-elevation-panel\|prominent\|soft)`；绝不再叠 `--dsw-alias-border-*` | "Never pair a `--dsw-alias-border-*` border with an lv/elevation shadow" |
| 满圆 `border-radius`（50%/pill）必须配 `corner-shape: round` | "Pair `corner-shape: round` with every full-round `border-radius`" |
| 中性分隔 / 描边用 0.5px 发丝线 | "draw at `0.5px`" |
| 功能 CSS 字重上限 500；不要为单个元素发明字号 | "Font weight tops out at 500 in feature CSS" / "never invent a size for a single element" |
| 菜单一律 `Menu` 或 `MenuSurface`；不得覆盖 `--dsw-menu-surface-fill` / `--dsw-menu-backdrop-filter` | "use `Menu` or wrap custom content in `MenuSurface`" |
| 模态遮罩保持半透明深色、无模糊 | "retain their translucent dark mask without blur" |
| 滚动条用共享样式，不写组件专有滚动条选择器；滚动条留在容器内、不被圆角裁切 | "shared scrollbar styles rather than component-specific scrollbar selectors" |
| 每个颜色在明暗两套主题下都要验过 | "Verify every color in both light and dark mode" |

## 二、交互与反馈 `[官方源码]`

出处：`.agents/skills/dsh-client-ui-ux/SKILL.md`。

| 规则 | 原文关键词 |
| --- | --- |
| 先扩展既有组件 / 容器 / 交互，再考虑新建 | "Extend an existing component, container, or interaction before creating a new one" |
| 图标只用既有图标库 | "Icons come from the existing icon library" |
| 右栏内容在既有 sidebar 注册 slot，不做第二个 sidebar；tab 必带图标 | "never a separate sidebar" |
| 语义不明的图标按钮配 Tooltip；需驻留阅读的信息用 HoverCard，不用裸 `title` | "Informational content the pointer must rest on or select uses HoverCard" |
| 失败时保留数据可见，绝不清空内容显示错误 | "A failed operation keeps the data visible" |
| 就地 notice 只用于与该表面绑定的状态（查询失败 + Retry、字段校验） | "states tied to the surface itself" |
| 错误文案平实短句；中文提示 ≤2 句时省略句末句号 | "A Chinese notice of at most two sentences omits the trailing 句号（。）" |
| 提示不得撑破布局：预留空间或覆盖它，绝不推挤相邻元素 | "reserve its space or overlay it; never shift neighbouring elements" |
| 列表用骨架屏；其他页面级加载居中一个裸 spinner，不放角落；一页只一种加载样式 | "Lists use their skeleton; every other page-level load centers a bare spinner" |
| 菜单 / popover / tooltip 上线前三验：可关闭、视口内翻转、不被裁剪（必要时 portal 到 body） | "Dismissable / Viewport-fitting / Unclipped" |
| 即时操作结果用全局 Toast，且 Toast 宿主必须比触发它的面板活得久 | "a toast rendered by the panel itself unmounts with that panel" |
| 间距审查：不应出现未解释的贴边与一次性偏移 | "nothing sits flush against its neighbour without an intentional gap" |
| 保留键盘焦点可见性与 reduced-motion | "Preserve keyboard focus visibility and reduced-motion behavior" |

## 三、插件结构、座位与导出纪律 `[官方源码]`

出处：`packages/client/AGENTS.md`、`docs/subsystems/slots.md`、`packages/client/ui-primitives/README.md`。

- 一个 UI 功能 = 一个插件包；`dsh.client` manifest 固定 `platform:'web'`、必须有 `./client` 导出；`inject` 只是信息性边，不决定激活顺序。
- 客户端插件 `/client` 入口是公开浏览器 API：只导出 cordis 装载所需（`apply` / `inject` / `Config`）与类型，组件与 store handle 留内部。
- 禁止运行时 import 或再导出另一个 feature 插件的值；UI 跨包只通过 **slot**，行为走注入的 Cordis 服务，共享类型只 `import type`。
- 组件永远拿不到 `ctx`：数据与回调经派生 props 传入；业务组件里不写订阅机制。
- 注册一律在 `apply` 内，禁止模块级副作用；每个注册贡献都要能在 dispose 时移除（HMR 安全）。
- 往别人的 slot 贡献用 `ctx.slots.inject(key, () => ctx.slots.register(...))`；裸 `register` 未声明的 slot 在加载期报错。
- 只能渲染自己 `children` 里声明的 slot key，命名 `<domain>.<entry>.<hole>`——**声明即授权**。
- `single` 与已被占用的 `keyed` 单元是**替代点**；附加扩展要另找 list id 或未占用的 key。这条与 `30 座位与集成` 是同一件事的官方说法。
- 插件之间不共享组件：共享控件只能来自 `ui-primitives`；零 Cordis 原子组件由调用方给完整本地化 label，包内无兜底文案。
- 产品可见文案（含 aria 名、tooltip、placeholder、单位格式化）必须走本地化字典或已本地化的 props。
- 第三方主题可经 `ctx.theme` 注册 alias-token 覆盖。

## 四、只对官方 `packages/client` 成立、第三方不必照搬 `[官方源码]`

这些是官方 monorepo 的工程纪律，插件作者没有对应的三个注册文件、CI 与评审人，照搬只会变成噪声：

| 内部约束 | 为什么不必照搬 |
| --- | --- |
| 三处注册面（`tsconfig.client.json` references、`packages/bundle/web-app/cordis.patch.yml` 的 `dsh.client` 行、bundle 包依赖） | 官方 monorepo 的装配方式；第三方是 npm 包 + 运行时装载 |
| `pnpm run test:gui` / `DSH_SNAPSHOT=replay pnpm run test:web` / 快照回放 | 官方 CI 与 fixtures |
| 每文件 100% 覆盖率门槛、`/* v8 ignore -- <reason> */` | 仓库级 gate |
| 同 PR 落 Agent Note（`.agents/notes/implemented/…`） | 官方文档流程产物 |
| `verify-client-ui-i18n` / `verify-client-packages` / `verify-client-domain-graph` / `gen-client-catalog` | 官方脚本；背后的「文案走字典」规则可迁移，脚本不可 |
| workspace glob、`workspace:*`、`pnpm --filter … bundle` | monorepo 构建 |
| `PLATFORM_MODULES` / `web/src/platform.ts` / `ClientModuleSystem` | shell 内部实现；第三方只需注意别重复声明基线 externals |
| `dsh.client.external` 仅限基础设施 / 传输 / 生成装配 | feature 插件不得请求 |
| 单包目录制度（`contract/` + 不互 import 的 domain 目录 + 唯一 `apply.ts`） | 官方大包的域图约束 |
| 「第二个包需要同一控件就提升进 ui-primitives」 | 第三方无合入权：复用或自建 |
| 设计评审人名单、品牌资产（FishLogo / Wordmark / Montserrat 品牌字体） | 官方内部流程与品牌许可 |

## 五、官方未表态的地方（由本仓库建议补位）

以下问题在已核对的官方文档里没有明文答案，本仓库按运行时实测 + 合理取值给出建议，并明确标注 `[本仓库建议]`：

- 列表座位的 `order` 具体该取什么值（官方只说 `list` 按 order 排序，没规定取值策略）→ 见 `30` 与 `spec/11-slot-seats.md`
- 设置分区页表头的排版契约（`h2` 18/26/600 + `p` 13/20 + 12px）在官方页面之间并不统一 → 见 `20`
- 提交前的自检清单条目与判定方式 → 见 `spec/70-checklist.md` 与 `40`
- 冲突裁决的让位顺序（order 撞车时谁先）→ 见 `spec/80-conflicts.md`

## 依据

- 官方公开仓库（master，2026-10-02 抓取）：`docs/web-styling.md`、`docs/ui-radius.md`、`.agents/skills/dsh-client-ui-ux/SKILL.md`、`packages/client/AGENTS.md`、`packages/AGENTS.md`、`docs/subsystems/slots.md`、`packages/client/ui-primitives/README.md`、`packages/client/ui-theme/README.md`、`docs/cookbook/extension-cookbook.md`、根 `package.json`
- 本机：`resources/app.asar`（62 个 `dsh-client-*` 包，均为 0.2.0-rc.2）、`resources/app-update.yml`（nightly 通道）
- 未能核实：官方文档正文与本机 0.2.0-rc.2 产物是否逐字一致；`docs/` 与 `docs/cookbook/` 的完整清单里是否还有未取到的相关页（本次靠仓库目录接口与直接路径取文件，未做全文检索）
