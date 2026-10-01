# Pill 胶囊

一枚 24px 高的小胶囊，用来表示「一组里选一个」或展示一个可点的短标签。

## 是什么

一个按 `onClick` 分岔的双形态组件：

| 传了 `onClick` | 渲染 | 光标 | 可透传属性 |
| --- | --- | --- | --- |
| 是 | `<button type="button">` | `pointer` | 全部 `button` 原生属性 |
| 否 | `<span>` | 默认 | 全部 `span` 原生属性 |

`active` 是受控值 —— 组件只把选中态画出来，状态本身归调用方。选中态的画法是
文字升到 `label-primary`、底色换成 `button-ghost-active-fill`，再叠一圈
`inset 0 0 0 1px` 的内描边。

TS 上用判别联合表达：判别键就是 `onClick` 有没有传。没传 `onClick` 时，
`onClick` 在类型层面被设成 `undefined`，所以静态胶囊不可能被误加点击行为；
传了之后拿到的则是完整的 `ButtonHTMLAttributes<HTMLButtonElement>`。

零依赖，只用到 `react` 和 CSS Modules。

## 什么时候用

- 一组互斥筛选条件里选一个：「今天 / 最近 7 天 / 最近 30 天」。
- 展示一个可点的短状态，点了之后直接切到那个状态（标签页式的轻量导航）。
- 需要一枚 24px 高、比 Button 更小更静的胶囊时。

## 什么时候不要用

- 触发一个命令（保存 / 删除 / 重试）：用 `Button`。Pill 表达的是「选中了哪一个」，
  不是「执行一件事」。
- 只读的状态标注：用 `Tag`。Pill 有选中态语义，Tag 没有。
- 开关：用 `Switch`；`active` 是可点出来的选中态，不是开关的 on/off。
- 多个可以同时选中：Pill 的 `active` 是单个布尔值，多选场景它表达不了。
- 纯展示且不带 `active` 的静态胶囊：这其实是 `Tag` 的 `neutral` tone，
  用 Pill 会让人以为能点。

## 几何来源

全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/Pill.module.css`：

| 数值 | 出处（选择器） |
| --- | --- |
| `height: 24px`、`padding: 0 8px`、`gap: 4px`、`border-radius: 12px`、`font-size: 12px`、`line-height: 18px` | `.pill` |
| `border: none`、`color: var(--dsw-alias-label-secondary)`、`background: var(--dsw-alias-bg-layer-2)` | `.pill` |
| `cursor: pointer` | `.interactive` |
| `background: var(--dsw-alias-interactive-bg-hover)` | `.interactive:hover` |
| `color: var(--dsw-alias-label-primary)`、`background: var(--dsw-alias-button-ghost-active-fill)`、`box-shadow: inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)` | `.active` |

同样读自官方 `lib/index.js` 的 `function Pill`：`onClick` 存在时渲染
`<button type="button" className={pill + interactive + active}>`，否则渲染
`<span className={pill + active}>`；`active` 默认 `false`。

**本仓库建议值（非官方数值）：**

- `.interactive:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }`
  —— 官方 `Pill.module.css` 没有焦点样式。可点击的 Pill 是一个真正的按钮，键盘用户
  按 Tab 走到它时必须有可见落点。写法直接对齐官方 `Switch.module.css` 的
  `:focus-visible`，全库统一。
- `.pill` 上的 `box-sizing: border-box`：官方没有显式声明。Pill 没有 border
  （只有 `box-shadow` 内描边），所以这一条不改变任何官方几何，只是防止调用方
  在 `*` 选择器缺失时把尺寸算错。

实现为本仓库原创（CSS 变量承载几何 + 尺寸/状态类切换），几何等价但不是官方 CSS 的复制。

## 可访问性要点

- **可点击时它就是按钮**：键盘 Enter / Space 天然可触发，不需要自己加 `keydown`。
  组件固定 `type="button"`，不会在 `<form>` 里意外提交。
- **选中态要给辅助技术一个说法**：`active` 只改颜色，屏幕阅读器读不到。如果这排
  Pill 是一组单选，请用 `role="radiogroup"` + 每枚 `role="radio"` + `aria-checked`
  （或 `aria-pressed`），颜色变化只是它的视觉表现。
- **只有图标没有文字的 Pill 必须给 `aria-label`**，否则名字是空的。
- **静态形态不要塞交互**：没有 `onClick` 时渲染的是 `<span>`，不是按钮也不是链接，
  不要给它挂 `role="button"` —— 直接用可点击形态。
- 焦点环用 `outline`（不是 `box-shadow`），避免被父级 `overflow: hidden` 裁掉。
- 文字与底色对比：未选中是 `label-secondary` 配 `bg-layer-2`，选中是
  `label-primary` 配 `button-ghost-active-fill`，两套都随主题走，不要自行覆盖颜色。
