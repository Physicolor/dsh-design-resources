# Button 按钮

胶囊形按钮，DSH 里所有「点一下就发生一件事」的地方都用它。

## 是什么

一个 `<button>` 包装：四种视觉家族 + 两种尺寸 + 可选前置图标。
零依赖，只用到 `react` 和 CSS Modules。

| 变体 | 用途 |
| --- | --- |
| `primary` | 主操作，一个界面里最多一个（保存 / 确认 / 发送） |
| `ghost` | 默认变体。次级操作、工具条里的文字按钮 |
| `outline` | 有边框的胶囊，用于对话框的「取消」，需要与 `primary` 拉开层次时 |
| `toolbar` | 半透明底，浮在内容之上的工具条按钮 |

| 尺寸 | 高度 | 字号 / 行高 | 用途 |
| --- | --- | --- | --- |
| `md`（默认） | 36px | 14/22 | 常规页面、对话框页脚 |
| `sm` | 28px | 12/18 | 密集列表行、卡片角上的小操作 |

## 什么时候用

- 触发一个动作：提交、保存、删除、打开菜单、重试。
- 工具条里需要一组视觉权重明确的动作时，用 `ghost` + `toolbar` 分层。

## 什么时候不要用

- 只是跳转链接：用 `<a>`，按钮的语义是「执行」不是「导航」。
- 切换开关状态：用 `Switch`。
- 在若干互斥选项间选择：用 `Pill` 或 `SegmentedControl`，按钮不表达「选中」。
- 静态标签：用 `Tag`。
- 一个动作还没准备好时不要把 `primary` 换成 `ghost` 来「禁用」——直接 `disabled`，否则用户无法分辨「不能用」和「不是主操作」。

## 几何来源

全部读自官方 `@deepseek-ai/dsh-client-ui-primitives/lib/Button.module.css`：

| 数值 | 出处（选择器） |
| --- | --- |
| `height: 36px` | `.md` |
| `padding: 0 14px`、`gap: 4px`、`border-radius: 18px`、`font-size: 14px`、`line-height: 22px` | `.button` |
| `height: 28px`、`font-size: 12px`、`line-height: 18px`、`padding: 0 10px`、`border-radius: 14px` | `.sm` |
| 图标容器 `16×16` | `.icon` |
| `outline` 的 `0.5px solid var(--dsw-alias-border-l3)` | `.outline` |
| `disabled` 的 `opacity: 0.4` | `.button:disabled` |
| 变体配色 token | `.primary` / `.ghost` / `.outline` / `.toolbar` |

该文件顶部注释同时写明这组胶囊几何来自 Figma Button 组件（h36, pad 14/7, gap 4, r18），
并指出「Icon_container 28×28 是图标形态」——本仓库的 `iconOnly` 高度即取自此注释。

**本仓库建议值（非官方数值）：**

- `.iconOnly` 的 `width` / `padding: 0`：官方只给了 28×28 的图标容器尺寸，没有方形按钮类；本仓库把宽度锁成高度。
- `:focus-visible` 的 `outline: 2px solid var(--dsw-alias-brand-primary)` + `outline-offset: 2px`：官方 `Button.module.css` 没有焦点样式。键盘用户需要可见焦点，写法与官方 `Switch.module.css` 的 `:focus-visible` 保持一致。

实现为本仓库原创（用 CSS 变量承载几何 + 单类切换尺寸），几何等价但不是官方 CSS 的复制。

## 可访问性要点

- **仅图标按钮必须给 `aria-label`**：`<Button iconOnly icon={<IconPlus />} aria-label="新建会话" />`。没有可读文本时图标对屏幕阅读器是空的。
- 图标节点本身应 `aria-hidden`，名字由 `aria-label` 提供，避免读两遍。
- 组件默认 `type="button"`，不会在 `<form>` 里意外提交；要提交表单请显式传 `type="submit"`。
- 禁用时用 `disabled` 属性（不是 `aria-disabled` 包一层），这样焦点和点击都被真正拦住。
- 焦点环用 `outline` 而不是 `box-shadow`，避免被父级 `overflow: hidden` 裁掉。
