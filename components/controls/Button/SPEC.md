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
| `height: 36px` | `Button.module.css` → `.md`（本仓库落在 `.button` 基值 `--dsh-btn-height`） |
| `padding: 0 14px` / `gap: 4px` / `border-radius: 18px` / `font-size: 14px` / `line-height: 22px` | `Button.module.css` → `.button` |
| `height: 28px` / `font-size: 12px` / `line-height: 18px` / `padding: 0 10px` / `border-radius: 14px` | `Button.module.css` → `.sm` |
| 图标容器 `16×16` | `Button.module.css` → `.icon` |
| `border: 0.5px solid var(--dsw-alias-border-l3)` | `Button.module.css` → `.outline` |
| `opacity: 0.4` | `Button.module.css` → `.button:disabled` |
| 变体配色 token | `Button.module.css` → `.primary` / `.ghost` / `.outline` / `.toolbar` |
| 图标形态容器 `28×28` | `Button.module.css` 顶部注释：胶囊几何来自 Figma Button 组件（h36, pad 14/7, gap 4, r18），并写明「Icon_container 28×28 是图标形态」；本仓库 `iconOnly` 的高度取自此注释 |
| `box-sizing: border-box` / `display: inline-flex` / `align-items: center` / `justify-content: center` / `white-space: nowrap` / `cursor: pointer` / `background: transparent` / `color: var(--dsw-alias-label-primary)` / `font-family: inherit` | 本仓库实现（`.button`），几何与官方等价，非官方 CSS 复制 |

### 本仓库建议值（非官方数值）

- `.iconOnly` 的 `width` 与 `padding: 0`：官方只给了 28×28 的图标容器尺寸，**没有方形按钮类**；本仓库把宽度锁成高度（`width: var(--dsh-btn-height)`）。
- `.button:focus-visible` 的 `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`：官方 `Button.module.css` 没有焦点样式。规格取自 `spec/60-accessibility.md` 的 `AC-MF-11`，写法与官方 `Switch.module.css` 的 `:focus-visible` 一致。

### 实现说明

- 本仓库实现为原创：几何由 `.button` 上的组件级 CSS 变量承载（`--dsh-btn-height` / `--dsh-btn-pad-x` / `--dsh-btn-radius` / `--dsh-btn-font-size` / `--dsh-btn-line-height` / `--dsh-btn-gap`），`.sm` 与 `.iconOnly` 只覆盖变量，尺寸切换是单类切换。几何等价于官方，但不是官方 CSS 的复制。
- `--dsh-btn-*` 是本仓库内部变量，不是 DSH token。

## api

`ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`，`forwardRef<HTMLButtonElement, ButtonProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'ghost' \| 'outline' \| 'toolbar'` | `'ghost'` | 视觉家族 |
| `size` | `'md' \| 'sm'` | `'md'` | `md` 为标准 36px 胶囊，`sm` 为紧凑 28px |
| `icon` | `ReactNode` | 无 | 前置图标，放进 16×16 的图标容器 |
| `iconOnly` | `boolean` | `false` | 仅图标按钮：渲染成正方形（宽 = 高）；开启后必须自行提供 `aria-label` |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 组件固定默认值，避免在 `<form>` 中意外提交 |
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
| 键盘焦点 | `.button:focus-visible` | `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`（本仓库建议值） |
| 仅图标 | `iconOnly` | 宽度锁定为高度（方形），水平 padding 归零 |
| 尺寸 | `size` | `md` = 36px / 14-22 / radius 18 / padding 0 14px；`sm` = 28px / 12-18 / radius 14 / padding 0 10px |

## tokens

DSH 语义 token（均可在 `data/tokens.json` 中查到）：

- `--dsw-alias-label-primary` — `.button` 基础文字色
- `--dsw-alias-label-primary-foreground` — `.primary` 文字色
- `--dsw-alias-button-primary-fill` — `.primary` 底色
- `--dsw-alias-button-primary-hover` — `.primary` 悬停底色
- `--dsw-alias-button-tool-bar-fill` — `.toolbar` 底色
- `--dsw-alias-button-tool-bar-hover` — `.toolbar` 悬停底色
- `--dsw-alias-border-l3` — `.outline` 描边色
- `--dsw-alias-interactive-bg-hover` — `.ghost:hover` / `.outline:hover` 底色
- `--dsw-alias-interactive-bg-active` — `.ghost:active` 底色
- `--dsw-alias-brand-primary` — 焦点环颜色（本仓库建议值）

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-btn-height`（`36px` / `.sm`、`.iconOnly` 下 `28px`）
- `--dsh-btn-pad-x`（`14px` / `10px` / `iconOnly` 下 `0`）
- `--dsh-btn-radius`（`18px` / `14px`）
- `--dsh-btn-font-size`（`14px` / `12px`）
- `--dsh-btn-line-height`（`22px` / `18px`）
- `--dsh-btn-gap`（`4px`）

## a11y

- 仅图标按钮必须由调用方提供 `aria-label`（例如「新建会话」）。没有可读文本时图标对屏幕阅读器是空的。
- 图标节点本身应 `aria-hidden`，名字由 `aria-label` 提供，避免读两遍。
- 组件默认 `type="button"`，不会在 `<form>` 里意外提交；要提交表单需显式传 `type="submit"`。
- 禁用使用原生 `disabled` 属性（不是 `aria-disabled` 包一层），焦点与点击都被真正拦住。
- 焦点环用 `outline` 而不是 `box-shadow`，避免被父级 `overflow: hidden` 裁掉。
- 命中区：`md` 高 36px、`sm` 高 28px，均达到 `AC-MF-01` 的常规控件目标 28×28。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. `iconOnly` 为真且无子文本时，必须存在 `aria-label`。
2. 存在 `:focus-visible` 焦点样式，且不以 `outline: none` 移除后无替代（`AC-MF-10`）。
3. 焦点环规格为 2px 实线 + `--dsw-alias-brand-primary` + 2px 外偏移（`AC-MF-11`）。
4. 禁用状态使用原生 `disabled`，源码中不得出现以 `aria-disabled` 替代 `disabled` 的写法。
5. `<button>` 的 `type` 默认值为 `button`（源码中 `type = 'button'` 不得被移除）。
6. `iconOnly` 为真时，渲染宽度等于高度（方形），且水平 padding 为 0。
7. 图标容器固定 16×16，不被外部尺寸覆盖。
8. 各尺寸高度 ≥ 28px（`AC-MF-01` 常规控件目标）。
9. 类名拼接顺序为「基础类 + 变体类 + 尺寸类 + iconOnly + 外部 className」，外部类名必须最后追加，以便覆盖。
10. 不得把按钮当链接使用：跳转场景必须使用 `<a>`（人审，见 `README.md`「什么时候不要用它」）。

## demo

- `components/controls/Button/demo.html`

## 真实场景（docs/reference 截图核对）

demo 不再凭源码想象，改为对着 `docs/reference/*.png` 里的真实位置复现。逐处核对：

| 图 | 区域 | 上下文 | 实拍尺寸 |
| --- | --- | --- | --- |
| `06-plugins.png` | 页头右上 | 「＋ 添加插件」primary + 前置加号 | 96 × 32 |
| `03-settings-open.png` | 设置面板页头右侧 | 「打开配置文件」outline | 94 × 28（= `sm`） |
| `03-settings-open.png` | 通用设置「快捷键」行尾 | 「编辑快捷键」outline | 97 × 36（= `md`） |
| `04-settings-models.png` | 模型提供商行尾 | 「编辑」outline | 47 × 28，圆角约 8px |

### 已知偏差（截图核对新增）

- `04-settings-models.png` 行尾的「编辑」实拍约 47×28、圆角约 **8px**，既不是 `sm` 的 `r14` 也不是 `md` 的 `r18`。`Button.module.css` 顶部注释已声明「使用方对宽形态自行设定 radius / width」，所以这不是本组件基类的取值，**不应据此改写 `.sm`**；demo 里没有收录这一处。
- `06-plugins.png` 页头主按钮实拍 **96 × 32**，比 `md` 的 `36px` 矮 4px。demo 用 `--dsh-btn-height: 32px` 的 owner 覆写复现这一处，**不改 `.md` 的 36px**。
- 侧栏「新会话」按钮在 `01-hero.png` 里实拍 **252 × 38**、`border-radius: 12px`（`geometry.json` 的 `_2H3hWW_newSession`）。它是侧栏自有的类，不是本组件；但 `Button.module.css` 顶部注释说宽形态的 New Session 是「r24 at h38」，与这一枚实测的 12px 圆角对不上。两者是否指同一个按钮**未确认**，照实记录待查，不据此改任何数值。

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 清单条目：`spec/70-checklist.md`（`A20`、`A43`、`A46`、`A48`）
