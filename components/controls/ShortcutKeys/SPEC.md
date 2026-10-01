# ShortcutKeys · SPEC

- id: shortcut-keys
- category: controls
- source: `components/controls/ShortcutKeys/`（`index.tsx` / `shortcut-keys.module.css`）
- official-counterpart: 产品里真实存在——客户端 CSS 模块 `_keys_38b9q_1`（`.keys` / `.key` / `.separator` / `.tooltip` / `.joined`），Markup 为 `<kbd className={key === '+' ? separator : key}>`。官方 primitives 包里没有单独的 ShortcutKeys 条目（产品客户端自己带了一套）
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

逐条采自运行中的产品：`docs/reference/plugin-row.json`、`01-hero.png`，以及产品 bundle 里该模块的 CSS 文本。

| 数值 | 出处 |
| --- | --- |
| `.keys { display:inline-flex; flex:none; align-items:center; gap:3px; color: var(--dsw-alias-label-tertiary); font-size:12px; line-height:16px; white-space:nowrap }` | `_keys_38b9q_1 { … }`（实测：键帽 19 × 16、色 rgb(129,133,140)） |
| `.key { box-sizing:border-box; display:inline-flex; align-items:center; justify-content:center; font:inherit }` | `_key_38b9q_1`；实测 `background: rgba(0,0,0,0)`、`border-radius: 0`、`padding: 0` —— 平排形态没有底 |
| `.separator { font:inherit }` | `_separator_38b9q_30`；实测分隔符 `+` 宽 8px、与键同字号 |
| `.tooltip { color:inherit; font-size:11px; line-height:14px; gap:2px }` | `_tooltip_38b9q_20` |
| `.tooltip .key { min-width:16px; height:16px; padding:0 2px; border-radius:4px; background: var(--dsw-alias-tooltip-key-bg) }` | `_tooltip_38b9q_20 ._key_38b9q_1` |
| `.joined { box-sizing:border-box; height:16px; padding:0 4px; border-radius:4px; background: var(--dsw-alias-tooltip-key-bg) }` `.joined .key { min-width:0; height:auto; padding:0; background:transparent }` | `_joined_38b9q_32` 与其子选择器 |

使用侧的显隐（产品写成另一个模块，见 `spec/20-controls.md` 的 `CT-MF-18`）：

| 数值 | 出处 |
| --- | --- |
| `newSessionShortcut { opacity: 0; pointer-events: none; flex: none; font-weight: 400; display: inline-flex }` | `_2H3hWW_newSessionShortcut` |
| `newSession:is(:hover, :focus-visible) .newSessionShortcut { opacity: 1 }` | 同上模块 |
| `newSession:is(:hover, :focus-visible) .newSessionLabelMask:has(+ .newSessionShortcut) { overflow:hidden; mask-image: linear-gradient(90deg, #000 calc(100% - 16px), #0000) }` | 同上模块 |
| 容器 `aria-hidden="true"`；键位写在触发按钮的 `aria-keyshortcuts` 上 | 产品 Markup（如搜索会话 `Control+Alt+K`、添加工作区 `Control+Alt+O`） |

### 本仓库建议值（无官方来源）

- `ShortcutKeysVariant` 的命名（`plain` / `tooltip` / `joined`）：产品只有 CSS 类名，没有公开的 variant 枚举；这里的三个词是本仓库给同一组形态起的名字。
- `keys: string[]` + 「`+` 自动渲染成分隔符」：产品在调用处就把 `+` 当成数组元素传进来（`keys.map(key => key === '+' ? separator : key)`），本组件按同一约定实现，不额外提供 `join` 参数。
- forwardRef 到最外层 `<span>`：产品那层由调用方的容器承担，本组件自己暴露出来，方便调用方做布局或测量。

### 与规范的关系

- `spec/20-controls.md` §6 是本组件的规范出处（`CT-MF-17` / `18` / `19`）。
- `spec/50-icons.md` 讲的是图标，不适用于键帽；键帽是文字，不是图形资产。

## api

`ShortcutKeysProps`，`forwardRef<HTMLSpanElement, ShortcutKeysProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `keys` | `string[]` | 必填 | 键位，按书写顺序。`+` 会渲染成分隔符 |
| `variant` | `'plain' \| 'tooltip' \| 'joined'` | `'plain'` | 三种官方形态 |
| `className` | `string` | 无 | 追加在最外层 `<span>` 的类名之后 |
| `ref` | `Ref<HTMLSpanElement>` | 无 | 透传到最外层 `<span>` |

## states

组件没有交互状态（不接受点击、没有 hover / focus 样式）。渲染分支只有 `variant` 与 `keys` 的内容：

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 平排 | `variant` 缺省 | 纯文字键位，无底色 |
| 提示气泡 | `variant="tooltip"` | 11px，每枚键一层浅底 |
| 连排 | `variant="joined"` | 整组一层浅底，键自身无底 |
| 空数组 | `keys=[]` | 渲染空容器（调用方应避免；没有键位就不要渲染） |
| 含 `+` | `keys` 内含 `'+'` | 该枚渲染成 `.separator`，与键同字号 |

## tokens

- `--dsw-alias-label-tertiary` — 平排形态的文字色
- `--dsw-alias-tooltip-key-bg` — 提示气泡 / 连排形态的键底（解析为 `color-mix(in srgb, var(--dsw-alias-tooltip-bg), white 18%)`）
- `--dsw-alias-tooltip-bg` — 上面那个 token 的基础色（浅色 #2c2c2e）；本组件不直接用，列出来是为了让改主题的人知道键底从哪来

## a11y

- 容器固定 `aria-hidden="true"`：键位是装饰，读屏由触发元素的 `aria-keyshortcuts` 提供。**不要**为了让读屏念出键位而给这个容器去掉 aria-hidden——那会让同一个键位被念两遍。
- 不承载任何交互：没有 `tabIndex`、没有 `onClick`；键盘用户按的是那个真正的按钮。
- 显隐（`opacity: 0` → hover / focus-visible 显示）由调用方的容器负责，本组件不做——因为「什么时候显示键位」是那个按钮的决定，不是键帽的决定。
- 颜色只取 `--dsw-alias-label-tertiary`：在深色主题下由 token 反转，不需要组件分支。

## checks

1. 根元素是 `<span>`，带 `aria-hidden="true"`。
2. 每枚键渲染成 `<kbd>`；`'+'` 渲染成 `.separator`，其余渲染成 `.key`。
3. `.keys` 的 `gap` 为 `3px`、`font-size` 为 `12px`、`line-height` 为 `16px`（平排形态）。
4. 平排形态的 `.key` 不带 `background` 与 `border-radius`（`CT-MF-17`）。
5. `variant="tooltip"` 时 `.key` 为 `min-width:16px; height:16px; padding:0 2px; border-radius:4px`，且底色为 `--dsw-alias-tooltip-key-bg`。
6. `variant="joined"` 时容器为 `height:16px; padding:0 4px; border-radius:4px`，内部 `.key` 无底色。
7. 组件不 import 除 `react` 以外的任何运行时依赖（含 `@deepseek-ai/*`）。
8. `shortcut-keys.module.css` 里不出现十六进制颜色字面量、`rgb(`、`hsl(`。
9. 源码里不出现 `onClick` / `onKeyDown` / `tabIndex`。

## demo

- `components/controls/ShortcutKeys/demo.html`

## 相关

- 人读版：`README.md`
- 规范：`spec/20-controls.md` §6（`CT-MF-17/18/19`）
- 采集：`docs/reference/plugin-row.json`、`docs/reference/01-hero.png`
