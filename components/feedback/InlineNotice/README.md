# InlineNotice 内联提示条

留在文档流里的状态说明条：警告、成功、报错、信息各一条，可带图标、可关闭、可多行。

## 是什么

一个横向的提示条：`图标? + 文案 + 关闭按钮?`。
单行形态高 32px、圆角 8px、12/18 字号、字重 500，视觉上就是官方 `ConnectionIndicator` 那条断线提示的通用化版本。
零依赖，只用到 `react` 和 CSS Modules。

| 语气 | 底色 | 文字 / 图标色 | 来源 |
| --- | --- | --- | --- |
| `info`（默认） | `color-mix(--dsw-alias-state-business-primary 10%, transparent)` | `--dsw-alias-state-business-primary` | 底色本仓库建议值 |
| `success` | `--dsw-alias-state-success-tertiary` | `--dsw-alias-state-success-primary` | 官方 `.success` |
| `warn` | `--dsw-alias-state-warn-tertiary` | `--dsw-alias-state-warn-label` | 官方 `.warning` |
| `error` | `color-mix(--dsw-alias-state-error-primary 10%, transparent)` | `--dsw-alias-state-error-primary` | 底色本仓库建议值 |

## 什么时候用

- 页面里需要一段持续存在、用户可能慢慢读的状态说明：网络不稳定、配额快用完、保存到了哪里。
- 表单提交失败的整体原因（放在表单上方或下方）。
- 设置项的副作用提醒：「关闭后本地草稿会被清除」。

## 什么时候不要用

- 一次性的成功反馈、说完就消失：用 `Toast`，它不占文档流。
- 有多个操作要选（重试 / 忽略 / 查看详情）：提示条只有文字和一个关闭，选不动；用带按钮的区域或对话框。
- 字段级的校验错误：直接贴在字段下方用一句红色的 `<span>` 和一个 `aria-invalid`，不要为每一行输入都套一个提示条。
- 全局的、需要用户立刻响应的错误：用对话框，`InlineNotice` 不会抢焦点。
- 一屏放三条以上：提示条一多就变成噪音，考虑合并成一条或收进设置页。

## 几何来源

单行几何读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/ConnectionIndicator.module.css`：

| 数值 | 出处（选择器） |
| --- | --- |
| `height: 32px`、`padding: 0 10px`、`border-radius: 8px` | `.indicator` |
| `box-sizing: border-box`、`border: none` | `.indicator` |
| `font-size: 12px`、`font-weight: 500`、`line-height: 18px`、`white-space: nowrap` | `.indicator` |
| `display: inline-grid`、`grid-template-columns: 14px max-content`、`column-gap: 4px`、`align-items: center` | `.indicator` |
| `transition: background-color 160ms ease-out, color 160ms ease-out` | `.indicator` |
| `flex: none`（官方在 `.indicator` 上，本仓库放在根节点之外不需要，图标上保留 `flex: none`） | `.indicator` / `.icon` |
| 图标容器 `14×14`、`display: grid`、`place-items: center` | `.icon` |
| `warn` = `--dsw-alias-state-warn-tertiary` + `--dsw-alias-state-warn-label` | `.warning` |
| `success` = `--dsw-alias-state-success-tertiary` + `--dsw-alias-state-success-primary` | `.success` |
| 按下时 `color-mix(in srgb, 底色, 主色 10%)` | `.warning:active` |
| 焦点环 `outline: 2px solid 状态色` + `outline-offset: 2px` | `.warning:focus-visible` |

配色 token 逐个在 `website/css/dsh-tokens.css` 里核对过存在（light 与 dark 两套都有）：
`--dsw-alias-state-business-primary` / `--dsw-alias-state-success-primary` / `--dsw-alias-state-success-tertiary` /
`--dsw-alias-state-warn-label` / `--dsw-alias-state-warn-primary` / `--dsw-alias-state-warn-tertiary` / `--dsw-alias-state-error-primary`。

**本仓库建议值（非官方数值）：**

- **布局用 flex 而不是官方那套两列网格**：官方的 `grid-template-columns: 14px max-content` 是为了让 hover 前后的两段文案互相撑住宽度、避免抖动，这个需求只有 ConnectionIndicator 有。通用提示条的文案长度本来就随内容变，用 `inline-flex + gap: 4px`（gap 值仍是官方的 4px）等价且更简单。关闭按钮出现时右侧也不会有多余空列。
- **`info` / `error` 的底色**：官方没有「三级底 + 主色」的完整组合可用——
  `--dsw-alias-state-success-tertiary` / `--dsw-alias-state-warn-tertiary` 都存在，`--dsw-alias-state-business-tertiary`（= `--dsw-static-deepseek-100`）虽然存在，但它在 dark 主题下被定义成 `--dsw-static-deepseek-800` 这类「深色底」，直接当浅色提示条的底色会在 light 主题下显得过深；`--dsw-alias-state-error` 则根本没有 tertiary 变体，只有 `primary` / `secondary`。
  为了一条规则覆盖两种主题，本仓库不新增任何 token，改用官方 `Tag.module.css` 已经用过的手法
  `color-mix(in srgb, 主色 10%, transparent)` 从对应主色派生底色（Tag 对 success / info / danger 就是这个写法，warning 用 12%）。
- **多行形态 `.multiline`**：官方 ConnectionIndicator 只有单行 32px。高度改 `auto` + `min-height: 32px`，上下内边距取 `6px`。
  6px 的来历：单行形态把 18px 行高在 32px 里居中后，上下各留 `(32 - 18) / 2 = 7px`；自造间距按本仓库规则取 4 的倍数，4px 比原形态更紧，所以取 6px 作为「介于 4 与 7 之间、视觉上不松」的值，同时仍让单行时总高回到 32px 附近（6 + 18 + 6 = 30 < 32，靠 `min-height` 兜底到 32）。
- **多行时图标的 `margin-top: 2px`**：文案首行行高 18px、图标 14px，居中差为 `(18 - 14) / 2 = 2px`。这是从官方数值推导出来的，不是新造尺寸。
- **关闭控件 `.dismiss`**：官方没有关闭态。20×20 热区（`--dsh-notice-dismiss-size`）、圆角 6px、`margin: 0 -4px 0 2px`（右侧负外边距抵掉一部分 10px 内边距，让图标视觉上仍贴着右边缘）、默认 `opacity: 0.75`、hover 底色 `color-mix(in srgb, currentColor 12%, transparent)`。
  这里用 `role="button"` + `tabIndex=0` 的 `<span>` 而不是 `<button>`：传了 `onDismiss` 时根节点本身就是 `<button>`，而 HTML 不允许按钮嵌套按钮。键盘 Enter / 空格由组件自己处理（`preventDefault` + `stopPropagation`，避免触发两次）。
  20px 热区小于 24px 的常见下限，但提示条本身只有 32px 高，40px 触控下限在桌面端不适用；这是有意取舍。
- **有 `onDismiss` 时根节点变成 `<button>`，整条可点关闭**：官方 ConnectionIndicator 的 warning 分支也是整条 `<button>`（点击重连），这里沿用同一交互模型。

实现为本仓库原创：几何用 `--dsh-notice-*` 变量承载、语气用四个类改同一组变量，不是官方 CSS 的复制。

## 可访问性要点

- 根节点默认 `role`：无 `onDismiss` 时是普通 `div`（保留你传入的 `role`，例如 `role="status"`）；有 `onDismiss` 时是 `<button type="button">`，请务必同时传 `aria-label` 说明「点它会做什么」（例如「忽略这条警告」），因为按钮里只有文案，读出来是「网络已断开，正在重试 按钮」，用户不知道按下去会发生什么。
- 需要被屏幕阅读器主动播报时传 `role="alert"`；只是静态展示就不要传，`alert` 会打断当前朗读。
- 图标容器已经 `aria-hidden="true"`：图标是装饰，语义必须写在文案里。绝对不要用颜色 + 图标表达状态而不给文字。
- **颜色不是唯一线索**：`info`/`success`/`warn`/`error` 四种底色在灰度或色觉障碍下差别有限，所以要么带图标，要么文案本身写清状态（「成功」「警告」）。
- 焦点环用的是当前语气的文字色（`--dsh-notice-accent`），在四种底色上都保证可见；`outline` 不会被父级 `overflow: hidden` 裁掉。
- 关闭控件带 `aria-label`（默认「关闭提示」，可用 `dismissLabel` 覆盖）；它同时也是可聚焦元素（`tabIndex=0`），Tab 能停在上面，Enter / 空格可触发。用 `title` 属性当无障碍名是不行的。
- 关掉之后焦点会掉回 `body`：如果这条提示是从别处聚焦过来的，调用方应在卸载后把焦点还给触发它的元素。
- 文案尽量短。提示条不换行时（单行形态）超出容器会被裁，多行形态请显式传 `multiline`。
