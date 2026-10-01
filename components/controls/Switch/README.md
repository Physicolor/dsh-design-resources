# Switch 开关

36×20 的开关。完全受控，只有 `checked` 进、`onChange` 出。

## 是什么

一个带 `role="switch"` 的 `<button type="button">`，里面是一枚 16×16 的圆形滑块。

| 属性 | 必填 | 说明 |
| --- | --- | --- |
| `checked` | 是 | 当前状态，受控 |
| `onChange` | 是 | 点击后请求切到的状态，值为 `!checked` |
| `label` | 是 | 可访问名，写进 `aria-label` |
| `disabled` | 否 | 默认 `false`，写入进行中时也应置 `true` |
| `title` | 否 | 悬浮提示，通常解释为什么锁住 |

外观挂在 `aria-checked` 而不是另一个并行 class 上：视觉状态和辅助技术读到的状态
来自同一个属性，不可能互相说谎。选中时轨道换成 `brand-primary`、滑块
`translateX(16px)`，过渡 120ms。

零依赖，只用到 `react` 和 CSS Modules。

## 什么时候用

- 立刻生效的二态设置：自动保存、深色模式、实验特性。
- 设置项的效果不需要「保存」按钮确认的场景。

## 什么时候不要用

- 需要按「保存 / 提交」才生效的表单：用复选框。开关的语义是「马上生效」，
  放在表单里会误导用户以为已经生效了。
- 两个互斥选项里选一个（列表 / 网格）：用 `Pill` 或分段控件，那是选择不是开关。
- 触发动词（删除、重试）：用 `Button`。
- 展示状态而不可改：用 `Tag` 或只读文本，别给一个永远 `disabled` 的开关。
- 一个开关控制一整组设置：说明层级没理清，拆开或用别的控件。

## 几何来源

全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/Switch.module.css`：

| 数值 | 出处（选择器） |
| --- | --- |
| `width: 36px`、`height: 20px`、`padding: 2px`、`border: 0`、`border-radius: 10px`、`corner-shape: round` | `.switch` |
| `background: var(--dsw-alias-border-l3)`、`cursor: pointer`、`flex: 0 0 auto` | `.switch` |
| `background: var(--dsw-alias-brand-primary)` | `.switch[aria-checked='true']` |
| `cursor: default`、`opacity: 0.5` | `.switch:disabled` |
| `outline: 2px solid var(--dsw-alias-brand-primary)`、`outline-offset: 2px` | `.switch:focus-visible` |
| `width: 16px`、`height: 16px`、`border-radius: 50%`、`corner-shape: round` | `.thumb` |
| `background: var(--dsw-alias-label-primary-foreground)`、`transition: transform 120ms ease` | `.thumb` |
| `transform: translateX(16px)` | `.switch[aria-checked='true'] .thumb` |

同样读自官方 `lib/index.js` 的 `function Switch`：`<button type="button" role="switch"
aria-checked={checked} aria-label={label} title disabled onClick={() => onChange(!checked)}>`，
子节点是 `<span className={thumb}>`。

官方源码注释解释了为什么轨道要写 `corner-shape: round`：轨道圆角是自身高度的一半
（10px = 20px / 2），会被全局超椭圆规则当成「不够圆」而把两端压方，和里面的圆形滑块
打架；`corner-shape: round` 让轨道退出那套规则。滑块同理。

**本仓库建议值（非官方数值）：**

- `@media (prefers-reduced-motion: reduce) { .thumb { transition: none; } }`
  —— 官方 `Switch.module.css` 没有声明 reduced-motion 分支。位移只有 16px、时长
  120ms，影响很小，但前庭敏感用户对横向滑动更敏感，跟随系统偏好关掉过渡是零成本的。
  本仓库 `Toast` 也遵循同一个原则（官方那边只在淡出上保留动画）。

实现为本仓库原创（用 `aria-checked` 驱动状态、CSS 变量承载几何），
未复制官方 CSS 源码。

## 可访问性要点

- **`label` 必填**。开关没有可见文字，`aria-label` 是它唯一的名字；漏了
  屏幕阅读器只会读出一个没有名字的「开关」。
- **自己写 `onChange` 的乐观更新**：`onChange(!checked)` 只是「请求」，不是「已经切了」。
  如果写入失败要回滚，请让父级持有真值，而不是在组件里先改视觉。
- **写入中要 `disabled`**：官方注释明确写了这一点 —— 不只是部署把开关锁死时才用。
  锁住的同时用 `title` 说明原因（「正在写入配置」）。
- **不要用 `aria-pressed` 代替 `aria-checked`**：开关是 `role="switch"` +
  `aria-checked`，这是 ARIA 规定的组合。
- **键盘**：它是 `<button>`，Space / Enter 都能切换；`focus-visible` 已给 2px 焦点环。
- **不要自己加 `onKeyDown` 处理 Space**：原生按钮已经做了，重复处理会触发两次。
- `disabled` 用真属性而不是 `aria-disabled` 包一层 —— 前者同时拦住焦点和点击。
