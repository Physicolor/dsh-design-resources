# FishMark · SPEC

- id: fishmark
- category: brand
- source: `components/brand/FishMark/`（`index.tsx` / `fishmark.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/index.js` 的 `//#region lib/types/FishLogo.js` 区块（官方该组件**没有**配套 `.module.css`，几何只有 JS 一处来源）
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 `lib/index.js`，写法为「数值 ← 文件名 标识符」。

| 数值 | 出处 |
| --- | --- |
| `viewBox "0 0 23.16 17.04"` | ← `lib/index.js` `const FISH_LOGO_VIEWBOX = { width: 23.16, height: 17.04 }`（其上一行注释：Native viewBox of FISH_LOGO_PATH） |
| 默认宽 `24` | ← `lib/index.js` `function FishLogo({ size = 24, className })` |
| `height = size * 17.04 / 23.16`（24 → 17.6580310880829） | ← `lib/index.js` `FishLogo` 的 `height: size * FISH_LOGO_VIEWBOX.height / FISH_LOGO_VIEWBOX.width` |
| 路径 `d`（3448 字符） | ← `lib/index.js` `const FISH_LOGO_PATH`；与 `icons/brand/fish.svg` 的 `path@d` 逐字一致（已核对：两侧 sha256 前 12 位同为 `5bee701f3922`，长度同为 3448） |
| svg `fill="none"`、path `fill="currentColor"` | ← `lib/index.js` `FishLogo` 的 `jsx("svg", { fill: "none", … })` 与 `jsx("path", { fill: "currentColor" })` |
| `aria-hidden="true"`（未传 `title` 时的默认形态） | ← `lib/index.js` `FishLogo` 的 `"aria-hidden": "true"` |

### 本仓库建议值（非官方数值，官方没有对应声明）

- `.mark { flex: none }`：官方 `FishLogo` 只接受 `size` / `className`，没有任何默认类样式。品牌标记放进 flex 行（例如「鱼标 + 字标」的品牌条）时不该被压成非等比尺寸。
- `.mark { vertical-align: middle }`：`<svg>` 默认按基线对齐，与同排文字并排时视觉上会下坠；居中后与文字中线一致。
- `title` 参数（`role="img"` + `<title>`）：官方始终 `aria-hidden="true"`，鱼标无法作为独立图形被读出；品牌区里鱼标常常是唯一的品牌信息，因此提供可选标题。不传时行为与官方完全一致。
- 透传 `SVGProps`（`style`、`aria-*`、事件等）：官方只接受 `size` / `className`，本仓库放开以便参与布局与测试。

### 本仓库决策（改写官方行为）

- 尺寸不取整：`height` 按官方公式保留小数（24 → 17.6580310880829），刻意不做像素取整，避免图形被压扁。这是本仓库对官方公式的实现选择，数值本身来自官方。
- `title` 存在时渲染 `role="img"` + `<title>` 并**移除** `aria-hidden`（官方恒为 `aria-hidden="true"`）。这是本仓库对官方无障碍行为的一处主动改写，不传 `title` 时与官方一致。

实现为本仓库原创：路径数据逐字取自官方导出常量，尺寸按官方公式重写，官方没有可供复制的 CSS。

## api

`FishMarkProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'width' | 'height' | 'title' | 'children'>`，`forwardRef<SVGSVGElement, FishMarkProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `number` | `24` | 宽度（px）。高度 = `size × 17.04 / 23.16`，保留小数不取整 |
| `title` | `string` | 无 | 传了就渲染 `role="img"` + `<title>`；不传则 `aria-hidden="true"` |
| `className` | `string` | 无 | 追加到 `.mark` 之后 |
| 其余 | `Omit<ComponentPropsWithoutRef<'svg'>, 'width' \| 'height' \| 'title' \| 'children'>` | — | 原样透传到 `<svg>`；`width` / `height` / `title` / `children` 已在类型上排除 |
| `ref` | `Ref<SVGSVGElement>` | 无 | 透传到 `<svg>` |

尺寸对照（高度按官方比例换算）：

| 宽度 | 高度 |
| --- | --- |
| `24px`（默认） | `17.6580310880829px` |
| `32px` | `23.5440414507772px` |
| `48px` | `35.3160621761658px` |

## states

组件为静态图形，没有交互状态；下表是全部渲染分支。

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 装饰（默认） | 未传 `title`（或为空字符串） | `aria-hidden="true"`，`role` 不输出 |
| 有名字 | `title` 非空 | `role="img"` + `<title>{title}</title>`，不输出 `aria-hidden` |
| 尺寸 | `size` | `width = size`，`height = size × 17.04 / 23.16` |
| 颜色 | 外层 `color` | path 的 `fill="currentColor"`，随父级文字色 |
| 悬停 / 聚焦 / 禁用 | — | 组件不定义任何交互样式 |

## tokens

本组件不使用 `--dsw-*` / `--dsh-*` 变量：

- 颜色只有 `fill="currentColor"` 一个控制点，取值由调用方外层 `color` 决定（推荐 `var(--dsw-alias-label-primary)` 之类的语义 token）。
- 尺寸由 `<svg>` 的 `width` / `height` 属性承载，不经过 CSS。

组件级 class（本仓库内部，不是 DSH token）：

- `.mark`（`flex: none`、`vertical-align: middle`）

## a11y

- 默认 `aria-hidden="true"`——鱼标默认是装饰，不污染朗读顺序。
- 只有鱼标是这块区域**唯一**的品牌信息时才传 `title`，它会渲染成 `<title>` 并被读作图形名。
- 装饰用法下不要再叠加 `aria-label`：`aria-hidden="true"` 与 `aria-label` 同时存在是自相矛盾的。
- 颜色来自外层 `color`，请用语义 token（`var(--dsw-alias-label-primary)` 等），不要写死十六进制色；深浅主题才能自动跟随。
- 缩放请用 `size`，不要用 CSS `transform: scale()`：非整数缩放会让细笔画发虚。
- 鱼标的可点击区域如果来自父级包裹元素，请确保该元素是真的可聚焦控件（`<button>` / `<a>`），不要在 `svg` 上挂 `onClick` 了事（`AC-MF-09`、`AC-MF-13`）。
- 纯装饰图形必须 `aria-hidden`（`AC-MF-14`）；作为图形被读出时必须提供可访问名（`<title>`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 未传 `title` 时 `<svg>` 上存在 `aria-hidden="true"`，且**不**输出 `role`。
2. 未传 `title` 时不存在 `aria-label`（与 `aria-hidden="true"` 互斥）。
3. 传 `title` 时输出 `role="img"` 与 `<title>`，且**不**输出 `aria-hidden="true"`。
4. `viewBox` 恰为 `0 0 23.16 17.04`（与官方 `FISH_LOGO_VIEWBOX` 一致）。
5. `width` 等于 `size`，`height` 等于 `size × 17.04 / 23.16`，不得取整。
6. `FISH_LOGO_PATH` 与官方常量逐字一致（核对方式：`icons/brand/fish.svg` 的 `path@d` 与本文件常量 sha256 前 12 位同为 `5bee701f3922`，长度同为 3448）。
7. 颜色只有一个控制点：path 为 `fill="currentColor"`，源码中不出现十六进制颜色字面量（`#`）、`rgb(`、`hsl(`。
8. `<svg>` 的 `fill` 为 `none`。
9. 组件不 import 除 `react` 以外的任何运行时依赖（含 `@deepseek-ai/*`）。
10. `<svg>` 上不绑定 `onClick` / `onKeyDown` 等交互处理（可点击区域由父级控件承担，`AC-MF-09`）。
11. `.mark` 声明 `flex: none` 与 `vertical-align: middle`。
12. 类型中已 `Omit` 掉 `width` / `height` / `title` / `children`，透传属性不得覆盖这四项。
13. `fishmark.module.css` 中不出现任何几何数值（尺寸只走 svg 属性），也不出现颜色字面量。

## demo

- `components/brand/FishMark/demo.html`

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 品牌资产素材：`icons/brand/fish.svg`
- 相关条款：`spec/60-accessibility.md`（`AC-MF-09`、`AC-MF-13`、`AC-MF-14`）
