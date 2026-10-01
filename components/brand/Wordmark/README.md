# Wordmark 字标

官方品牌字标：鲸鱼 + “deepseek” 文字 + 右侧 HARNESS 角标，纯内联 SVG，主色跟随 `currentColor`。

## 是什么

一个 `<svg>` 里画三段东西（顺序即绘制顺序）：

1. 9 条文字路径（p / d / e / e / s / e / e / l / k），`fill="currentColor"`；
2. 1 条鲸鱼路径，同样 `currentColor`，外面套一个 `clipPath` 修边；
3. 角标：圆角矩形 `fill="currentColor"` + 7 条字母路径（HARNESS），字母用 `--dsh-wordmark-badge-ink`（默认就是官方的 `var(--dsw-alias-label-primary-inverted)`）。

零依赖：只 import `react`（用到 `forwardRef` / `useId`）和一份 CSS Modules，不 import 任何 `@deepseek-ai/*` 包。

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `size` | `number` | `24` | 高度（px）。宽度 = `size × 182 / 24`（含 mark）或 `size × 156 / 24`（不含） |
| `includeMark` | `boolean` | `true` | 是否画前面的鲸鱼；关闭时视框换成 `26 0 156 24`，角标仍然保留 |
| `title` | `string` | — | 传了就渲染 `role="img"` + `<title>`；不传则 `aria-hidden="true"` |
| `className` | `string` | — | 追加到 `.mark` 之后 |
| 其它 | `SVGProps` | — | 除 `width` / `height` / `title` / `children` 外全部透传到 `<svg>` |

| 高度 | 宽（含 mark） | 宽（不含 mark） |
| --- | --- | --- |
| 24px（默认） | 182px | 156px |
| 32px | 242.667px | 208px |
| 48px | 364px | 312px |

## 什么时候用

- 首屏、关于页、导出图、文档页眉页脚：需要一次写出完整品牌名。
- 需要官方的「图形 + 文字」组合：保持 `includeMark`（默认）。
- 位置偏窄、只要文字部分：`includeMark={false}`。

## 什么时候不要用

- 位置只够放一个图形：用 `FishMark`。
- 需要屏幕阅读器读出品牌名：字标里**没有文本节点**，默认 `aria-hidden`，读不出「deepseek」。要可读就用真实文字，或传 `title`，或「可见文本 + `FishMark`」。
- 当页面标题用：用 `<h1>` 文本 + `FishMark`，字标没有文本层级，也不参与文档大纲。
- 小于 16px 高：文字笔画会糊，那个尺寸请只用 `FishMark`。
- 需要多色 / 渐变 / 描边品牌字：字标是单色图形，只提供 `color` 与 `--dsh-wordmark-badge-ink` 两处控制点。

## 几何来源

全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/index.js` 的 `//#region lib/types/BrandWordmark.js` 区块
（官方这个组件**没有**配套 `.module.css`）：

| 数值 | 出处（文件名 + 选择器 / 标识符） |
| --- | --- |
| `viewBox "0 0 182 24"` / `"26 0 156 24"` | `lib/index.js` · `BrandWordmark` 的 `viewBox: includeMark ? "0 0 182 24" : "26 0 156 24"` |
| `size = 24`、`height = size`、`width = size * (includeMark ? 182 : 156) / 24` | `lib/index.js` · `function BrandWordmark({ size = 24, className, includeMark = true })` 的 `width` / `height` |
| 角标矩形 `x="129.348" y="5.5" width="52" height="14" rx="2"` | `lib/index.js` · `jsx("rect", { x: "129.348", y: "5.5", width: "52", height: "14", rx: "2", fill: "currentColor" })` |
| 鲸鱼剪裁 `23.16 × 17.0435`、`translate(0.141602 3.52185)` | `lib/index.js` · `<defs>` 里 `clipPath#dsh-wordmark-whale-clip > rect` |
| 角标剪裁 `46 × 14`、`translate(132.348 5.5)` | `lib/index.js` · `<defs>` 里 `clipPath#dsh-wordmark-badge-clip > rect` |
| 17 条路径 `d`：文字 9 条 + 鲸鱼 1 条 + 角标字母 7 条，长度依次 660 / 654 / 816 / 823 / 1173 / 827 / 820 / 45 / 97 / 3469 / 136 / 272 / 1023 / 190 / 188 / 1368 / 1370 | `lib/index.js` · `BrandWordmark` 区域各 `jsx("path", { d: … })`；逐条与 `icons/brand/wordmark.svg` 的 `path@d` 一致（已逐字比对，含 sha256 前 12 位校验） |
| 文字与鲸鱼 `fill="currentColor"` | `lib/index.js` · 前 10 条 `jsx("path", { fill: "currentColor" })` |
| 角标字母 `fill="var(--dsw-alias-label-primary-inverted)"` | `lib/index.js` · 后 7 条 `jsx("path", { fill: "var(--dsw-alias-label-primary-inverted)" })` |
| 默认 `aria-hidden="true"` | `lib/index.js` · `BrandWordmark` 的 `"aria-hidden": "true"` |

**本仓库建议值（非官方数值，官方没有对应声明）：**

- `--dsh-wordmark-badge-ink`（默认 `var(--dsw-alias-label-primary-inverted)`）：官方把 token 直接写在 7 条路径的 `fill` 属性上。提升成一个自定义属性后，字标落在非 token 底色上时只需覆盖一个变量，不必改组件；默认值与官方行为完全一致（同样只用这两个 token）。
- `.mark { flex: none }` / `.mark { vertical-align: middle }`：官方没有配套 CSS 也没有默认类。品牌标记放进 flex 行时不该被压成非等比尺寸；`<svg>` 默认基线对齐会让它与同排文字错位。
- clipPath 的 id 用 `useId()` 生成（并把 React 生成的 `:` 过滤掉）：官方写作固定 id `dsh-wordmark-whale-clip` / `dsh-wordmark-badge-clip`。同一页面渲染多个字标时固定 id 会重复，几何相同的剪裁渲染上没差别，但重复 id 属于无效 HTML，也会干扰自动化测试选择器。
- 省略剪裁 `rect` 上的 `fill="white"`：官方有这一条。`clipPath` 只取几何、填充不参与渲染，省略后视觉等价，同时避免在 TSX 里引入一个非 token 的颜色字面量。
- `includeMark={false}` 时**不渲染**鲸鱼那条路径：官方无论开关都渲染它。鲸鱼的坐标（约 x 0.14 → 23.30）完全落在 `26 0 156 24` 视框之外，会被 `<svg>` 默认的 `overflow: hidden` 裁掉，所以视觉等价，只是少一个 DOM 节点。
- `title` 参数与 `SVGProps` 透传：官方只接受 `size` / `className` / `includeMark`。字标默认不可读，提供一个可选的图形名更实用；透传属性便于布局与测试。

实现为本仓库原创：路径数据逐字取自官方导出常量，尺寸与剪裁按官方公式与属性重写，官方没有可供复制的 CSS。

## 角标配色与深浅主题

角标是两段配色——圆角矩形 `currentColor`，字母 `--dsh-wordmark-badge-ink`（默认 `var(--dsw-alias-label-primary-inverted)`）：

| 主题 | 常继承的 `color`（token → 实际值） | 矩形底色 | 字母颜色 | 结果 |
| --- | --- | --- | --- | --- |
| 浅色（默认 `:root`） | `--dsw-alias-label-primary` → `--dsw-static-neutral-bluish-1000`（近黑） | 近黑 | `--dsw-static-neutral-bluish-00`（白） | 深底白字，可读 |
| 深色（`body[data-ds-dark-theme]`） | `--dsw-alias-label-primary` → `--dsw-static-neutral-bluish-50`（近白） | 近白 | `--dsw-static-neutral-bluish-800`（深灰） | 浅底深字，可读 |

两段 token 的数值出处：`website/css/dsh-tokens.css` 的 `:root` 与 `body[data-ds-dark-theme]` 区块。

注意：**角标底色就是 `currentColor`**，所以对比度取决于父级 `color`。把字标放在品牌色块、渐变或图片上并继承了一个非标签色时，`--dsw-alias-label-primary-inverted` 不一定还与底色形成对比。两种应对：让字标继续继承 `--dsw-alias-label-primary`，或者只覆盖 `--dsh-wordmark-badge-ink`。

`demo.html` 里有这两块对照（浅色块 / 深色块），可以直观看到角标在两种主题下的两段配色。

## 与 icons/brand/wordmark.svg 的差异（本仓库既有素材的修正）

`icons/brand/wordmark.svg` 的 `d` 数据与官方逐字一致，但属性上有两处不一致（该 SVG 文件本身不在本任务写入范围，未作改动）：

1. **角标字母的填充色**：素材把 7 条字母路径写成 `fill="currentColor"`。角标矩形同样是 `currentColor`，字母与底色同色 → HARNESS 完全看不见。官方定义是 `var(--dsw-alias-label-primary-inverted)`，本组件以官方为准。
2. **缺少两个 `clipPath`**：官方 `<defs>` 里有 `dsh-wordmark-whale-clip`（`23.16 × 17.0435` @ `translate(0.141602 3.52185)`）与 `dsh-wordmark-badge-clip`（`46 × 14` @ `translate(132.348 5.5)`），素材里没有，鲸鱼与角标字母的溢出部分不会被修剪。本组件补上。

对比之下，`icons/brand/fish.svg` 与官方 `FISH_LOGO_PATH` 完全一致（`FishMark` 直接用这条）。

## 可访问性要点

- 字标是图形：默认 `aria-hidden="true"`，屏幕阅读器读不出里面的「deepseek」；装饰场景保持默认即可，品牌名由页面上真实文字承担。
- 字标是这块区域**唯一**的品牌信息时传 `title`，会渲染 `role="img"` + `<title>`。
- 更稳的可读组合是「可见文本 + `FishMark`」：不依赖 `title` 的朗读支持差异，也省掉一次图形朗读。
- 角标里的 HARNESS 是图形不是文本，不要指望它提供可读信息。
- 别用 CSS `filter: invert()` 之类反色：矩形与字母两段配色会一起翻转，对比度失控；要换色请改 `color` 或 `--dsh-wordmark-badge-ink`。
- 缩放用 `size`，不要 `transform: scale()`：非整数缩放会让细笔画发虚，也会让角标字母糊掉。
