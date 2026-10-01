# FishMark 鱼标

官方 DeepSeek 鱼形标志，纯内联 SVG，颜色永远跟随父级 `currentColor`。

## 是什么

单条 `<path>` 的装饰性图形，路径就是官方导出的 `FISH_LOGO_PATH`，原生视框 23.16 × 17.04，默认宽 24px。
零依赖：只 import `react` 和一份 CSS Modules（`fishmark.module.css`），运行时不读文件、不 import 任何 `@deepseek-ai/*` 包。

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `size` | `number` | `24` | 宽度（px）。高度 = `size × 17.04 / 23.16`，保留小数不取整 |
| `title` | `string` | — | 传了就渲染 `role="img"` + `<title>`；不传则 `aria-hidden="true"` |
| `className` | `string` | — | 追加到 `.mark` 之后 |
| 其它 | `SVGProps` | — | 除 `width` / `height` / `title` / `children` 外全部透传到 `<svg>` |

| 尺寸 | 宽度 | 高度（按官方比例换算） |
| --- | --- | --- |
| 默认 | 24px | 17.658px |
| — | 32px | 23.544px |
| — | 48px | 35.316px |

## 什么时候用

- 品牌区、启动页、关于页、加载态里需要「这是 DeepSeek」的图形符号。
- 位置只够放一个图形：favicon 位、头像位、工具条品牌位。
- 需要图形跟随文字色变化：外层换 `color` 就够，不用准备第二份图。
- 与 `Wordmark` 搭配时，它负责图形、`Wordmark` 负责可读的品牌名。

## 什么时候不要用

- 需要用户读出品牌名：用 `Wordmark` 或直接写文字。鱼标本身不含可读文本。
- 需要「图形 + 文字」的官方组合：那是 `Wordmark`（`includeMark` 默认开启）。
- 只是想要一个装饰性占位块：用骨架屏或图标组件，鱼标的品牌语义太强。
- 想改多色 / 渐变 / 双色调：`path` 固定 `fill="currentColor"`，本组件不提供改色参数，用 CSS `color` 控制。
- 当成图标按钮的内容：按钮要自己画图标并给 `aria-label`，别把品牌标当功能图标。

## 几何来源

全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/index.js` 的 `//#region lib/types/FishLogo.js` 区块
（官方这个组件**没有**配套 `.module.css`，所以几何只有 JS 一处来源）：

| 数值 | 出处（文件名 + 选择器 / 标识符） |
| --- | --- |
| `viewBox "0 0 23.16 17.04"` | `lib/index.js` · `const FISH_LOGO_VIEWBOX = { width: 23.16, height: 17.04 }`（其上一行注释：Native viewBox of FISH_LOGO_PATH） |
| 默认宽 `24` | `lib/index.js` · `function FishLogo({ size = 24, className })` |
| `height = size * 17.04 / 23.16`（24 → 17.6580310880829） | `lib/index.js` · `FishLogo` 的 `height: size * FISH_LOGO_VIEWBOX.height / FISH_LOGO_VIEWBOX.width` |
| 路径 `d`（3448 字符） | `lib/index.js` · `const FISH_LOGO_PATH`；与 `icons/brand/fish.svg` 的 `path@d` 逐字一致（sha256 前 12 位 `5bee701f3922`） |
| svg `fill="none"`、path `fill="currentColor"` | `lib/index.js` · `FishLogo` 的 `jsx("svg", { fill: "none", … })` 与 `jsx("path", { fill: "currentColor" })` |
| `aria-hidden="true"`（未传 `title` 时的默认形态） | `lib/index.js` · `FishLogo` 的 `"aria-hidden": "true"` |

**本仓库建议值（非官方数值，官方没有对应声明）：**

- `.mark { flex: none }`：官方 `FishLogo` 只接受 `size` / `className`，没有任何默认类样式。品牌标记放进 flex 行（例如「鱼标 + 字标」的品牌条）时不该被压成非等比尺寸。
- `.mark { vertical-align: middle }`：`<svg>` 默认按基线对齐，与同排文字并排时视觉上会下坠；居中后与文字中线一致。
- `title` 参数（`role="img"` + `<title>`）：官方始终 `aria-hidden="true"`，鱼标无法作为独立图形被读出；品牌区里鱼标常常是唯一的品牌信息，因此提供可选标题。不传时行为与官方完全一致。
- 透传 `SVGProps`（`style`、`aria-*`、事件等）：官方只接受 `size` / `className`，本仓库放开以便参与布局与测试。

实现为本仓库原创：路径数据逐字取自官方导出常量，尺寸按官方公式重写，官方没有可供复制的 CSS。

## 可访问性要点

- 默认 `aria-hidden="true"`——鱼标默认是装饰，不要让它污染朗读顺序。
- 只有鱼标是这块区域**唯一**的品牌信息时才传 `title`，它会渲染成 `<title>` 并被读作图形名。
- 装饰用法下不要再叠加 `aria-label`：`aria-hidden="true"` 与 `aria-label` 同时存在是自相矛盾的。
- 颜色来自外层 `color`，请用语义 token（`var(--dsw-alias-label-primary)` 等），不要写死十六进制色；深浅主题才能自动跟随。
- 缩放请用 `size`，不要用 CSS `transform: scale()`：非整数缩放会让细笔画发虚。
- 鱼标的可点击区域如果来自父级包裹元素，请确保该元素是真的可聚焦控件（`<button>` / `<a>`），不要在 `svg` 上挂 `onClick` 了事。
