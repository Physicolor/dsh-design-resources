# Wordmark · SPEC

- id: wordmark
- category: brand
- source: `components/brand/Wordmark/`（`index.tsx` / `wordmark.module.css`）
- official-counterpart: `@deepseek-ai/dsh-client-ui-primitives/lib/index.js` 的 `//#region lib/types/BrandWordmark.js` 区块（官方该组件**没有**配套 `.module.css`）
- human-doc: `README.md`（判断与取舍；本文件只放事实）

## geometry-source

数值逐条读自官方 `lib/index.js`，写法为「数值 ← 文件名 标识符 / 属性」。

| 数值 | 出处 |
| --- | --- |
| `viewBox "0 0 182 24"` / `"26 0 156 24"` | ← `lib/index.js` `BrandWordmark` 的 `viewBox: includeMark ? "0 0 182 24" : "26 0 156 24"` |
| `size = 24`、`height = size`、`width = size * (includeMark ? 182 : 156) / 24` | ← `lib/index.js` `function BrandWordmark({ size = 24, className, includeMark = true })` 的 `width` / `height` |
| 角标矩形 `x="129.348" y="5.5" width="52" height="14" rx="2"` | ← `lib/index.js` `jsx("rect", { x: "129.348", y: "5.5", width: "52", height: "14", rx: "2", fill: "currentColor" })` |
| 鲸鱼剪裁 `23.16 × 17.0435`、`translate(0.141602 3.52185)` | ← `lib/index.js` `<defs>` 里 `clipPath#dsh-wordmark-whale-clip > rect` |
| 角标剪裁 `46 × 14`、`translate(132.348 5.5)` | ← `lib/index.js` `<defs>` 里 `clipPath#dsh-wordmark-badge-clip > rect` |
| 17 条路径 `d`：文字 9 条 + 鲸鱼 1 条 + 角标字母 7 条，长度依次 660 / 654 / 816 / 823 / 1173 / 827 / 820 / 45 / 97 / 3469 / 136 / 272 / 1023 / 190 / 188 / 1368 / 1370 | ← `lib/index.js` `BrandWordmark` 区域各 `jsx("path", { d: … })`；逐条与 `icons/brand/wordmark.svg` 的 `path@d` 一致（已逐字比对；本仓库实现里 17 条路径的长度已按上表复核一致） |
| 文字与鲸鱼 `fill="currentColor"` | ← `lib/index.js` 前 10 条 `jsx("path", { fill: "currentColor" })` |
| 角标字母 `fill="var(--dsw-alias-label-primary-inverted)"` | ← `lib/index.js` 后 7 条 `jsx("path", { fill: "var(--dsw-alias-label-primary-inverted)" })` |
| 默认 `aria-hidden="true"` | ← `lib/index.js` `BrandWordmark` 的 `"aria-hidden": "true"` |

### 本仓库建议值（非官方数值，官方没有对应声明）

- `--dsh-wordmark-badge-ink`（默认 `var(--dsw-alias-label-primary-inverted)`）：官方把 token 直接写在 7 条路径的 `fill` 属性上。提升成一个自定义属性后，字标落在非 token 底色上时只需覆盖一个变量，不必改组件；默认值与官方行为完全一致（同样只用这两个 token）。
- `.mark { flex: none }` / `.mark { vertical-align: middle }`：官方没有配套 CSS 也没有默认类。品牌标记放进 flex 行时不该被压成非等比尺寸；`<svg>` 默认基线对齐会让它与同排文字错位。
- clipPath 的 id 用 `useId()` 生成（并把 React 生成的 `:` 过滤掉）：官方写作固定 id `dsh-wordmark-whale-clip` / `dsh-wordmark-badge-clip`。同一页面渲染多个字标时固定 id 会重复，几何相同的剪裁渲染上没差别，但重复 id 属于无效 HTML，也会干扰自动化测试选择器。
- 省略剪裁 `rect` 上的 `fill="white"`：官方有这一条。`clipPath` 只取几何、填充不参与渲染，省略后视觉等价，同时避免在 TSX 里引入一个非 token 的颜色字面量。
- `includeMark={false}` 时**不渲染**鲸鱼那条路径：官方无论开关都渲染它。鲸鱼的坐标（约 x 0.14 → 23.30）完全落在 `26 0 156 24` 视框之外，会被 `<svg>` 默认的 `overflow: hidden` 裁掉，所以视觉等价，只是少一个 DOM 节点。
- `title` 参数与 `SVGProps` 透传：官方只接受 `size` / `className` / `includeMark`。字标默认不可读，提供一个可选的图形名更实用；透传属性便于布局与测试。

### 本仓库决策（改写官方行为）

- 角标字母颜色从「写在 7 条路径的 `fill` 属性上」改为「写在 `.badgeInk` 组的 `fill` 上、取值走 `--dsh-wordmark-badge-ink`」：默认渲染结果与官方一致（同为 `var(--dsw-alias-label-primary-inverted)`），差别只在可覆盖性。
- clipPath id 由固定值改为 `useId()` 派生值（`dsh-wordmark-whale-clip-<uid>` / `dsh-wordmark-badge-clip-<uid>`）：官方为固定 id，本仓库改写为唯一 id，避免同页多实例的重复 id。
- `includeMark={false}` 时不渲染鲸鱼路径：官方恒渲染。视觉等价（被视框裁掉），本仓库少输出一个 DOM 节点。
- 省略剪裁 `rect` 的 `fill="white"`：官方有；`clipPath` 不看填充，视觉等价。

实现为本仓库原创：路径数据逐字取自官方导出常量，尺寸与剪裁按官方公式与属性重写，官方没有可供复制的 CSS。

## api

`WordmarkProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'width' | 'height' | 'title' | 'children'>`，`forwardRef<SVGSVGElement, WordmarkProps>`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `number` | `24` | 高度（px）。宽度 = `size × 182 / 24`（含 mark）或 `size × 156 / 24`（不含） |
| `includeMark` | `boolean` | `true` | 是否画前面的鲸鱼；关闭时视框换成 `26 0 156 24`，角标仍然保留 |
| `title` | `string` | 无 | 传了就渲染 `role="img"` + `<title>`；不传则 `aria-hidden="true"` |
| `className` | `string` | 无 | 追加到 `.mark` 之后 |
| 其余 | `Omit<ComponentPropsWithoutRef<'svg'>, 'width' \| 'height' \| 'title' \| 'children'>` | — | 原样透传到 `<svg>` |
| `ref` | `Ref<SVGSVGElement>` | 无 | 透传到 `<svg>` |

尺寸对照：

| 高度 | 宽（含 mark） | 宽（不含 mark） |
| --- | --- | --- |
| `24px`（默认） | `182px` | `156px` |
| `32px` | `242.66666666666666px` | `208px` |
| `48px` | `364px` | `312px` |

## states

组件为静态图形，没有交互状态；下表是全部渲染分支。

| 状态 | 触发条件 | 表现 |
| --- | --- | --- |
| 装饰（默认） | 未传 `title`（或为空字符串） | `aria-hidden="true"`，`role` 不输出 |
| 有名字 | `title` 非空 | `role="img"` + `<title>{title}</title>`，不输出 `aria-hidden` |
| 含鲸鱼 | `includeMark === true`（默认） | `viewBox "0 0 182 24"`，宽度 `size × 182 / 24`，渲染鲸鱼组 |
| 不含鲸鱼 | `includeMark === false` | `viewBox "26 0 156 24"`，宽度 `size × 156 / 24`，不渲染鲸鱼组 |
| 主色 | 外层 `color` | 文字 9 条、鲸鱼、角标矩形均为 `fill="currentColor"` |
| 角标墨色 | `--dsh-wordmark-badge-ink` | 角标 7 条字母路径的填充；默认 `var(--dsw-alias-label-primary-inverted)` |
| 悬停 / 聚焦 / 禁用 | — | 组件不定义任何交互样式 |

## tokens

DSH 语义 token：

- `--dsw-alias-label-primary-inverted` — 角标字母墨色的默认值（官方写法）

组件级 CSS 变量（本仓库内部，不是 DSH token）：

- `--dsh-wordmark-badge-ink`（默认 `var(--dsw-alias-label-primary-inverted)`）

### 角标配色与深浅主题

角标是两段配色——圆角矩形 `currentColor`，字母 `--dsh-wordmark-badge-ink`（默认 `var(--dsw-alias-label-primary-inverted)`）：

| 主题 | 常继承的 `color`（token → 实际值） | 矩形底色 | 字母颜色 | 结果 |
| --- | --- | --- | --- | --- |
| 浅色（默认 `:root`） | `--dsw-alias-label-primary` → `--dsw-static-neutral-bluish-1000`（近黑） | 近黑 | `--dsw-static-neutral-bluish-00`（白） | 深底白字，可读 |
| 深色（`body[data-ds-dark-theme]`） | `--dsw-alias-label-primary` → `--dsw-static-neutral-bluish-50`（近白） | 近白 | `--dsw-static-neutral-bluish-800`（深灰） | 浅底深字，可读 |

两段 token 的数值出处：`website/css/dsh-tokens.css` 的 `:root`（第 138 行）与 `body[data-ds-dark-theme]` 区块（第 254 行）。

注意：**角标底色就是 `currentColor`**，所以对比度取决于父级 `color`。把字标放在品牌色块、渐变或图片上并继承了一个非标签色时，`--dsw-alias-label-primary-inverted` 不一定还与底色形成对比。两种应对：让字标继续继承 `--dsw-alias-label-primary`，或者只覆盖 `--dsh-wordmark-badge-ink`。

`demo.html` 里有这两块对照（浅色块 / 深色块）。

## a11y

- 字标是图形：默认 `aria-hidden="true"`，屏幕阅读器读不出里面的「deepseek」；装饰场景保持默认即可，品牌名由页面上真实文字承担（`AC-MF-14`）。
- 字标是这块区域**唯一**的品牌信息时传 `title`，会渲染 `role="img"` + `<title>`。
- 更稳的可读组合是「可见文本 + `FishMark`」：不依赖 `title` 的朗读支持差异，也省掉一次图形朗读。
- 角标里的 HARNESS 是图形不是文本，不要指望它提供可读信息。
- 别用 CSS `filter: invert()` 之类反色：矩形与字母两段配色会一起翻转，对比度失控（`AC-MF-08`：颜色只走语义 token）；要换色请改 `color` 或 `--dsh-wordmark-badge-ink`。
- 缩放用 `size`，不要 `transform: scale()`：非整数缩放会让细笔画发虚，也会让角标字母糊掉。
- `<svg>` 上不绑定交互处理；需要点击时由父级真控件承担（`AC-MF-09`）。

## checks

可自动检测的二元约束（true / false 即可判定，可直接落成 lint 规则）。

1. 未传 `title` 时 `<svg>` 上存在 `aria-hidden="true"`，且**不**输出 `role`、**不**输出 `aria-label`。
2. 传 `title` 时输出 `role="img"` 与 `<title>`，且**不**输出 `aria-hidden="true"`。
3. `viewBox` 恰为 `0 0 182 24`（`includeMark` 为真）或 `26 0 156 24`（为假）。
4. `height` 等于 `size`；`width` 等于 `size × 182 / 24` 或 `size × 156 / 24`，不得取整。
5. `includeMark` 为假时不渲染鲸鱼路径（源码中鲸鱼 path 位于 `includeMark ? … : null` 分支内）。
6. 角标矩形属性为 `x="129.348" y="5.5" width="52" height="14" rx="2"`。
7. 两处 `clipPath` 的几何为 `23.16 × 17.0435` @ `translate(0.141602 3.52185)` 与 `46 × 14` @ `translate(132.348 5.5)`。
8. 剪裁 id 唯一：由 `useId()` 派生（不含 React 原生 `:` 字符），同一页面渲染多个字标时 id 不重复。
9. 角标字母的颜色只经 `--dsh-wordmark-badge-ink` 一个控制点，默认值为 `var(--dsw-alias-label-primary-inverted)`。
10. 文字 9 条、鲸鱼 1 条、角标矩形为 `fill="currentColor"`；源码中不出现十六进制颜色字面量（`#`）、`rgb(`、`hsl(`。
11. 剪裁 `rect` 上不出现 `fill="white"` 之类的非 token 颜色。
12. `<svg>` 的 `fill` 为 `none`。
13. 组件不 import 除 `react`（仅 `forwardRef` / `useId`）以外的任何运行时依赖（含 `@deepseek-ai/*`）。
14. `.mark` 声明 `flex: none` 与 `vertical-align: middle`；`.badgeInk` 声明 `fill: var(--dsh-wordmark-badge-ink)`。
15. 类型中已 `Omit` 掉 `width` / `height` / `title` / `children`，透传属性不得覆盖这四项。
16. 17 条路径的 `d` 与 `icons/brand/wordmark.svg` 逐字一致（长度依次 660 / 654 / 816 / 823 / 1173 / 827 / 820 / 45 / 97 / 3469 / 136 / 272 / 1023 / 190 / 188 / 1368 / 1370）。

### 与 icons/brand/wordmark.svg 的差异（本仓库既有素材的修正）

`icons/brand/wordmark.svg` 的 `d` 数据与官方逐字一致，但属性上有两处不一致（该 SVG 文件本身不在本任务写入范围，未作改动）：

1. **角标字母的填充色**：素材把 7 条字母路径写成 `fill="currentColor"`。角标矩形同样是 `currentColor`，字母与底色同色 → HARNESS 完全看不见。官方定义是 `var(--dsw-alias-label-primary-inverted)`，本组件以官方为准。
2. **缺少两个 `clipPath`**：官方 `<defs>` 里有 `dsh-wordmark-whale-clip`（`23.16 × 17.0435` @ `translate(0.141602 3.52185)`）与 `dsh-wordmark-badge-clip`（`46 × 14` @ `translate(132.348 5.5)`），素材里没有，鲸鱼与角标字母的溢出部分不会被修剪。本组件补上。

对比之下，`icons/brand/fish.svg` 与官方 `FISH_LOGO_PATH` 完全一致（`FishMark` 直接用这条）。

## demo

- `components/brand/Wordmark/demo.html`

## 真实场景（docs/reference 截图核对）

| 图 | 区域 | 上下文 | 实拍 ink |
| --- | --- | --- | --- |
| `01-hero.png` | 左栏品牌行 | 鱼标 + 「deepseek」+ 反色「HARNESS」角标 | **187 × 18 @ (16, 28)** |
| `06-plugins.png` | 左栏品牌行 | 同上 | 同上 |

核对结论：`size = 24` 的 182 × 24 视框里，墨迹范围约 x 0.14–181.35 / y 3.52–20.56（约 181 × 17）；按 `y = 24` 摆放时落在 y 27.5–44.6，与实拍 (28…45) 吻合。宽度差 187 − 181 = 6px 落在抗锯齿量级内。

### 已知偏差（截图核对新增）

- `01-hero.png` Hero 居中处的「探索未至之境」**不是 Wordmark**：官方 BrandWordmark 只有 `deepseek` + `HARNESS` 那一套路径（`WORDMARK_VIEWBOX.withMark = '0 0 182 24'`），中文标语是页面自己的文字，demo 里没有收录到本组件。
- 截图里只出现过侧栏那一处 `size = 24`、`includeMark = true` 的形态。`includeMark={false}` 与 `size` 32 / 48 在 demo 中已标注「截图未覆盖」。

## 相关

- 人读版：`README.md`
- 双轨写作约定：`docs/WRITING.md`
- 品牌资产素材：`icons/brand/wordmark.svg`、`icons/brand/fish.svg`
- 相关条款：`spec/60-accessibility.md`（`AC-MF-08`、`AC-MF-09`、`AC-MF-14`）
