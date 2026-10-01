# 30 颜色与字体

- 适用对象：任何自带样式的插件 UI。
- 效力：含 MF / RC / AD，逐条标注。
- 本文的判据是否可自动检测：是（主要判据均可静态扫描源码或构建产物）。

## 1. 只用语义 token

颜色、字号、圆角全部走 `--dsw-*` 语义 token。语义 token 的价值在于同时满足三件事：主题切换无需改代码、层级表达统一、审核可用一条正则判定。

- `TK-MF-01`：禁止硬编码颜色。判定（可自动检测）：源码或构建产物中出现 `#` 开头的十六进制色值、`rgb(` / `rgba(` / `hsl(` / `hsla(`、或 CSS 具名色（white、black、red、gray 等）。
- 例外（不计违规）：图片与插画资产、`transparent`、`currentColor`、`none`、以及 SVG 资产内的 `fill="currentColor"`。
- `TK-MF-02`：字号必须取 `--dsw-font-*` 令牌（已核实形如 `--dsw-font-s-14`、`--dsw-font-xs-13`、`--dsw-font-xxs-12`）；禁止写字面 px 字号。判定：样式声明中出现 `font-size: <数字>px`。
- `TK-MF-03`：圆角只允许官方尺度：18（默认按钮）、14（小号按钮）与官方容器自身圆角。禁止自造并混用 r8 / r10 / r12 等中间值。[DSH-CSS]
- `TK-RC-04`：无对应令牌的字号（例如官方 Tag 的 11px）应直接复用官方组件，而不是新增 `--dsw-font-xxs-11` 之类的自造令牌。[DSH-CSS]：11px 出现在官方 Tag 几何中，但不在已核实的字号令牌清单内。

## 2. 语义映射

| 用途 | Token |
| --- | --- |
| 正文／主标签 | `--dsw-alias-label-primary` |
| 次级标签 | `--dsw-alias-label-secondary` |
| 三级说明、辅助文字 | `--dsw-alias-label-tertiary` |
| 页面底色 | `--dsw-alias-bg-base` |
| 一层容器 | `--dsw-alias-bg-layer-1` |
| 二层容器 | `--dsw-alias-bg-layer-2` |
| 浮层 | `--dsw-alias-bg-overlay` |
| 弱边界／分隔 | `--dsw-alias-border-l1` |
| 强边界 | `--dsw-alias-border-l2` |
| 悬停态背景 | `--dsw-alias-interactive-bg-hover` |
| 错误 | `--dsw-alias-state-error-primary` |
| 成功 | `--dsw-alias-state-success-primary` |
| 警告 | `--dsw-alias-state-warn-primary` |
| 品牌 | `--dsw-alias-brand-primary` |
| 主按钮填充 | `--dsw-alias-button-primary-fill` |
| 主按钮文字 | `--dsw-alias-label-primary-foreground` |

- `TK-MF-05`：层级用背景分层表达（`bg-base` < `bg-layer-1` < `bg-layer-2` < `bg-overlay`），不得用 `box-shadow` 表达层级。理由：官方已公开的层级手段是背景分层与边框（`border-l1` / `border-l2`）两类；DSH 未公开阴影尺度表，因此阴影层级无权威数值，不能作为层级判据。
- `TK-MF-06`：不得同时用背景分层与阴影重复表达同一层级（同一层级只允许一种手段）。[本仓库建议]

## 3. 主题

- `TK-MF-07`：不得假设浅色主题。任何依赖硬编码浅色底或硬编码深色文字的样式判违规（与 `TK-MF-01` 同一检测）。
- `TK-MF-08`：自定义色必须提供 light、dark、Increase Contrast 三套变体。[HIG] 在 DSH 中的执行方式：不自造色值，而是选择在不同主题下都成立的语义 token；确需新颜色时应走 DSH 官方 token 提案，而非在插件内联色值。
- `TK-MF-09`：文字与背景的对比度阈值见 60-accessibility.md；换用 token 不等于自动达标，必须核对。

## 4. 字号阶梯

| DSH 令牌 | 像素 | 典型用途 | 近似对应的 [HIG] 阶梯 |
| --- | --- | --- | --- |
| `--dsw-font-s-14` | 14 / 行高 22 | 正文、按钮 | 接近 Title3 15/20 与 Body 13/16 之间 |
| `--dsw-font-xs-13` | 13 | 次级说明 | 接近 Body 13/16、Headline 13/16 |
| `--dsw-font-xxs-12` | 12 | 最小辅助文字 | 接近 Callout 12/15 |

HIG 的 11 级阶梯属于 macOS 体系，DSH 令牌属于插件体系，两者不是同一套阶梯，上表只作近似对应，不得据此声称 DSH 实现了 HIG 阶梯。

- `TK-RC-10`：正文用 14（`--dsw-font-s-14`），辅助说明用 13，最小 12。正文不得小于 12px。无权威数值（DSH 未公开最小字号规则），本仓库建议 12，理由：[HIG] 最小正文为 13pt；DSH 已有最小令牌为 12；低于 12 无令牌可用且对比度难以维持。
- `TK-MF-11`：字号与行高必须成对使用。HIG 阶梯均为「字号/行高」成对给出；只改字号导致行高失配判为缺陷。
- `TK-RC-12`：同一层级元素的字号在同一界面内必须一致；不得因容器宽度不同而改变字号（宽度不足时改变布局，不改变字号）。[本仓库建议]，与 [HIG]「功能不随空间变化，只改变可见量」一致。

## 5. 不声称的部分

- DSH 未公开完整 token 清单，本篇只列已核实的语义 token。引用新 token 前必须确认它在当前 profile 的 `:root` 计算样式中存在（可自动检测）。
- DSH 未公开阴影尺度表；因此本规范不对阴影数值作任何断言，并据此禁止用阴影表达层级。
