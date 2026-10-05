# Button · SPEC

- id: button
- category: controls
- source: `components/controls/Button/`（`index.tsx` / `button.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/Button.module.css`
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 `Button.module.css`，写法为「数值 ← 选择器」。

| 数值 | 出处 |
| --- | --- |
| 标准：`height: 36px` / `padding: 0 14px` / `gap: 4px` / `border-radius: var(--dsw-radius-md)`（= 12px）/ `font-size: 14px` / `line-height: 22px` | `Button.module.css` → `.md` 与 `.button`（本仓库落在 `.button` 基值 `--dsh-btn-height` 一族） |
| 紧凑：`height: 28px` / `padding: 0 10px` / `border-radius: var(--dsw-radius-sm)`（= 8px）/ `font-size: 12px` / `line-height: 18px` | `Button.module.css` → `.sm` |
| 前置图标：容器 `16 × 16` | `Button.module.css` → `.icon` |
| 描边：`border: 0.5px solid var(--dsw-alias-border-l3)` | `Button.module.css` → `.outline` |
| 禁用：`opacity: 0.4` + 原生 `disabled` 属性 | `Button.module.css` → `.button:disabled` |
| 图标形态容器 `28 × 28` | `Button.module.css` 顶部注释：`Icon_container` 28 × 28 是图标形态；本仓库 `iconOnly` 的高度取自此注释 |
| `box-sizing: border-box` / `display: inline-flex` / `align-items: center` / `justify-content: center` / `white-space: nowrap` / `cursor: pointer` / `background: transparent` / `color: var(--dsw-alias-label-primary)` / `font-family: inherit` | 本仓库实现（`.button`），几何与官方等价，非官方 CSS 复制 |

两档圆角取的是产品包共享的圆角令牌：`--dsw-radius-md` = 12px、`--dsw-radius-sm` = 8px（`data/tokens.json`）。较早的本地 DSH primitives 副本报的是 **18px / 14px**，那两个值与当前安装的产品 CSS 不符，**已作废**，只留作对照，不是要复现的几何。

### 本仓库建议值（非官方数值）

- `.iconOnly` 的 `width` 与 `padding: 0`：官方只给了 28×28 的图标容器尺寸，**没有方形按钮类**；本仓库把宽度锁成高度（`width: var(--dsh-btn-height)`）。
- `.button:focus-visible` 的 `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`：官方 `Button.module.css` 没有焦点样式。规格取自 `spec/60-accessibility.md` 的 `AC-MF-11`，写法与官方 `Switch.module.css` 的 `:focus-visible` 一致。

### 实现说明

- 本仓库实现为原创：几何由 `.button` 上的组件级 CSS 变量承载（`--dsh-btn-height` / `--dsh-btn-pad-x` / `--dsh-btn-radius` / `--dsh-btn-font-size` / `--dsh-btn-line-height` / `--dsh-btn-gap`），`.sm` 与 `.iconOnly` 只覆盖变量，尺寸切换是单类切换。几何等价于官方，但不是官方 CSS 的复制。
- `--dsh-btn-*` 是本仓库内部变量，不是 DSH token。

## api

本仓库实现为原创：围绕原生 `<button>` 的一层薄封装，复用官方尺寸与视觉 token，不是官方导出的 DSH 实现。

`ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`，`forwardRef<HTMLButtonElement, ButtonProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'ghost' \| 'outline' \| 'toolbar'` | `'ghost'` | 视觉家族 |
| `size` | `'md' \| 'sm'` | `'md'` | `md` 为标准 36px 胶囊，`sm` 为紧凑 28px |
| `icon` | `ReactNode` | 无 | 前置图标，放进 16×16 的图标容器 |
| `iconOnly` | `boolean` | `false` | 仅图标按钮：渲染成正方形（宽 = 高）；开启后必须自行提供 `aria-label`。本仓库封装独有的选项 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 组件固定默认值，避免在 `<form>` 中意外提交 |
| `disabled` | `boolean` | `false` | 原生禁用状态，原样透传到 `<button>` |
| `className` | `string` | 无 | 与内部类名拼接，供外部布局使用 |
| 其余 | `ButtonHTMLAttributes<HTMLButtonElement>` | — | `onClick` / `disabled` / `aria-*` 等原样透传到 `<button>` |
| `ref` | `Ref<HTMLButtonElement>` | 无 | 透传到 `<button>` |

`ButtonVariant` / `ButtonSize` 为导出的类型别名。

## states

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 默认 | — | `background: transparent`；`.primary` / `.toolbar` 各自覆盖底色 |
| hover（primary） | `.primary:hover:not(:disabled)` | `background: var(--dsw-alias-button-primary-hover)` |
| hover（ghost） | `.ghost:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-hover)` |
| hover（outline） | `.outline:hover:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-hover)` |
| hover（toolbar） | `.toolbar:hover:not(:disabled)` | `background: var(--dsw-alias-button-tool-bar-hover)` |
| active | `.ghost:active:not(:disabled)` | `background: var(--dsw-alias-interactive-bg-active)`（仅 ghost 单独定义） |
| disabled | `.button:disabled` | `opacity: 0.4` + `cursor: not-allowed` |
| 键盘焦点 | `.button:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`（本仓库建议值，不是官方 Button 模块的规定） |
| 仅图标 | `iconOnly` | 宽度锁定为高度（方形），水平 padding 归零 |
| 尺寸 | `size` | `md` = 36px / 14-22 / radius `var(--dsw-radius-md)`（12px）/ padding 0 14px；`sm` = 28px / 12-18 / radius `var(--dsw-radius-sm)`（8px）/ padding 0 10px |

## 真实场景（docs/reference 截图核对）

示意页用的是干净环境里核对过的文案，逐处核对：

| 实景文案 | 位置 | 实拍尺寸 |
| --- | --- | --- |
| `打开配置文件` | 通用设置页头，紧凑 `outline` 的官方 Button primitives | 94 × 28 |
| `编辑` | 模型提供商卡片行尾的动作 | 截图只证到文案与 `outline` 外观，不声明精确尺寸 |

`编辑快捷键` 在通用设置里也可见，但截图里那一枚是 `SettingsRow` 自己的动作，不是官方导出的 Button primitives，因此不作为 Button 的变体呈现。截图留在 `docs/reference/` 供本地核对，不进站点。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 标准与紧凑两档高度保持 `36px` / `28px`。
2. 圆角一律走官方令牌：`md` 为 12px、`sm` 为 8px；源码里不出现 `18px` / `14px`（那两个值是已作废的旧副本口径）。
3. 图标容器固定 16×16，不被外部尺寸覆盖。
4. 禁用使用原生 `disabled`（不是 `aria-disabled` 包一层）；`<button>` 的 `type` 默认值为 `button`（源码中 `type = 'button'` 不得被移除）。
5. 不得把按钮当链接、设置值或选中态使用：跳转场景必须使用 `<a>`（人审，见 `README.md`「什么时候不要用它」）。
