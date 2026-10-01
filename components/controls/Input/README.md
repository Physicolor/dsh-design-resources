# Input 输入框

32px 高的单行输入框，可选一个 16×16 的前置图标。

## 是什么

一个 `<span>` 外壳包着原生 `<input>`：

- `ref` 直接透传到内部 `<input>`（不是外壳），所以 `ref.current.focus()`、
  读 `selectionStart` 都能用。
- 除 `className`（挂在外壳上）之外的全部 input 属性原样透传：
  `value` / `onChange` / `placeholder` / `type` / `disabled` / `readOnly` /
  `autoFocus` / `onKeyDown` / `aria-*` …
- `icon` 会给一个 16×16 的图标容器。传 `null` / `undefined` 时容器整个不渲染。

外壳负责所有视觉：0.5px 描边、8px 圆角、`bg-layer-1` 底色，聚焦时
（`:focus-within`）边框换成 `brand-primary`。内部 `<input>` 自己无边框、无轮廓、
透明底。

零依赖，只用到 `react` 和 CSS Modules。

## 什么时候用

- 单行文本录入：搜索框、会话标题、路径、URL。
- 需要 32px 紧凑高度、和 `Button` 的 `sm` / `Pill` 同处一行的表单。

## 什么时候不要用

- 多行文本：用 `<textarea>`。Input 固定 32px 高，塞多行会溢出。
- 需要在若干固定选项里选一个：用 `Pill` / 下拉菜单，不要让用户手打。
- 纯展示的只读值：用文本或 `Tag`。禁用输入框会带来「这里本来能改」的错觉。
- 带校验错误的表单行：本组件不含错误态。错误信息应由外层容器渲染在输入框下方，
  并给 `input` 挂 `aria-invalid` + `aria-describedby`（属性可以透传进来）。
- 数字调节：用 stepper；Input 只是文本输入。

## 几何来源

全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/Input.module.css`：

| 数值 | 出处（选择器） |
| --- | --- |
| `height: 32px`、`padding: 0 8px`、`gap: 6px`、`border-radius: 8px` | `.wrap` |
| `border: 0.5px solid var(--dsw-alias-border-l4)`、`background: var(--dsw-alias-bg-layer-1)`、`display: inline-flex`、`align-items: center` | `.wrap` |
| `border-color: var(--dsw-alias-brand-primary)` | `.wrap:focus-within` |
| `width: 16px`、`height: 16px`、`color: var(--dsw-alias-label-tertiary)` | `.icon` |
| `flex: 1`、`min-width: 0`、`border: none`、`outline: none`、`background: transparent` | `.input` |
| `font-size: 14px`、`line-height: 22px`、`color: var(--dsw-alias-label-primary)` | `.input` |
| `color: var(--dsw-alias-label-dimmed)` | `.input::placeholder` |

同样读自官方 `lib/index.js` 的 `function Input`：外壳是 `<span class=wrap>`，
有 `icon` 时先在前面插一个 `<span class=icon>`，然后是 `<input class=input>`，
其余属性全部展开到 `<input>` 上。

**本仓库建议值（非官方数值）：**

- `.wrap:has(.input:disabled) { opacity: 0.4; cursor: not-allowed; }`
  —— 官方 `Input.module.css` 完全没有 disabled 视觉：禁用的输入框看起来和可用的
  一模一样，用户会先点一下才发现不能用。取值直接沿用官方
  `Button.module.css` 的 `.button:disabled`（`opacity: 0.4` + `cursor: not-allowed`），
  让「禁用 = 0.4」成为全库同一条读法。
  注意这一条用了 `:has()`（Chrome 105+ / Safari 15.4+ / Firefox 121+）；
  需要兼容更老的运行时，请改成由调用方在外壳上加一个 class。
- `.icon` 上的 `flex: none`：官方只写了 `display: inline-flex` + 16×16。
  容器没有 flex 收缩约束时，长内容可能把图标压扁；`flex: none` 锁住 16×16。
- `.input` 上的 `font-family: inherit`：官方未声明。`<input>` 不会从祖先继承字体，
  不写的话浏览器会用系统默认字体，和页面其余文字不一致。
- `.wrap` 上的 `box-sizing: border-box`：官方未声明。外壳有 `0.5px` 边框，
  没有 `border-box` 时实际高度会多出 1px。

实现为本仓库原创（CSS 变量承载几何 + 外壳/图标/输入三段式），未复制官方 CSS 源码。

## 可访问性要点

- **输入框需要一个可访问名**。占位文字不是名字（它会在输入后消失，读屏软件也不
  总把它当标签）。请给 `aria-label`，或者让外层 `<label htmlFor>` 指到内部 input 的 id。
- **前置图标要 `aria-hidden="true"`**，否则图标里的文本节点会被读一遍；
  它的含义应由输入框自己的名字承担。
- **焦点只用一个信号**：内部 `<input>` 设了 `outline: none`，焦点靠外壳的
  `:focus-within` 边框变色表达。这是官方做法，所以不要再给 input 加别的焦点环，
  否则会出现两圈。
- **错误态不是本组件的职责**：透传 `aria-invalid` 与 `aria-describedby`，
  由外层渲染错误文案。
- `disabled` 会让输入框从 Tab 序列里消失。如果只是想「暂时不给改但还要能被读到」，
  用 `readOnly` + `aria-readonly`。
- 输入框的 `type` 请按语义选（`email` / `url` / `search`），移动端会给出更合适的键盘。
