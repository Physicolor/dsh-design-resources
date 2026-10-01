# 双轨写作：给人看的 README，给 Agent 看的 SPEC

## 为什么分两套文件

这个仓库有两个读者，他们问的问题不一样。

**设计师和产品**打开一个组件，想解决的是「我这个场景该不该用它」。他们不关心行高是 24px 还是 26px，关心的是「点开之后用户会不会找不到」。他们读的是判断。

**AI Agent 和工程师**打开同一个组件，要的是能直接落进代码和 lint 的精确值：高度取自哪个选择器的哪条声明、API 默认值是什么、哪些约束可以自动检测。他们读的是事实。

把两者塞进一份文件，结果是两边都读不下去：设计师看到 `expandOnRowClick={false}` 就走了，Agent 在一堆「什么时候不要用」的散文里翻不到选择器。

所以：**README.md 讲判断，SPEC.md 讲事实，两份内容不重叠。**

判据只有一条：

- README 里的每一句，都应该能回答「所以我该怎么选」。
- SPEC 里的每一条，都应该能被机器核对。

## Apple 是怎么写这类文档的

（提炼自 Apple Human Interface Guidelines 中文版：小组件、按钮、切换、菜单、文本栏五页，实际抓取方式见下文。语言模式主要来自前三页，菜单与文本栏用于验证。）

1. **摘要一句话。** 页面开头一句「按钮用于发起瞬时操作。」——先给定义，不铺垫。
2. **先场景，后规则。** 紧接着一段把抽象概念落到具体位置：「用户可能会在以下位置放置天气小组件：iPhone 和 iPad 的主屏幕和锁屏……」。读者先认出「哦是那个东西」，再读规则。
3. **规则是一句加粗的祈使句 + 一到三句解释。** 「平衡信息密度。布局稀疏可能会使小组件显得多余，而布局过于紧密则不够简单明了。」加粗句独立成句、动词开头，不写「该组件应当注意信息密度」。
4. **例子都是真产品。** 天气、股市、日历、播客、Safari 设置、邮件规则面板。不写「某类场景下」。
5. **第二人称。**「你可以」「如果你需要」「确保用户」。没有「本组件」「应当」「必须」。
6. **平台差异单独成节，只写差异。** 一节叫「平台考量因素」，iOS 一节、macOS 一节、visionOS 一节。没有差异就写一句「无针对 Apple tvOS 的额外考量因素。」，不重复通用规则。
7. **表只用于对照。** 尺寸矩阵、按钮形状与尺寸的对应、帮助按钮该放哪、更新日志。正文里不插表。
8. **图注是并列名词短语。**「打开 / 关闭 / 混合」「空闲 / 悬停 / 已选择 / 不可用」。不写成句子。
9. **API 名不进正文。** 需要提实现时写「有关开发者指南，请参阅 flexiblePush」，把标识符放到句尾的外链里。
10. **不用 emoji，不用感叹号。** 段落 2–4 句，一屏能读完。

## 哪些内容只能进 README

- 开头一到两段场景：这个控件是什么，用户在什么处境下会遇到它。至少一个具体例子，不写抽象定义。
- 「什么时候用它」/「什么时候不要用它」：写成判断句。「想要 X 就用它；想要 Y 请改用 Z」，必要时点名替代组件。
- 「怎么用得好」：取舍、常见错误、边界情况。Apple 管这个叫最佳实践。
- 对照表格：平台差异 / 变体对照 / 状态对照。表里不出现数值和标识符。
- 结尾一句「实现细节见 SPEC.md」。

README 里**不得出现**：API 名与属性名、JSX 默认值写法、CSS 选择器、`--dsw-*` / `--dsh-*` 变量名、行号、文件名与路径、精确数值（px / ms / 百分比）、a11y 属性名、公文体措辞（「应当」「必须」「该组件」「本组件」）、emoji。

## 哪些内容只能进 SPEC

- `id` / `category`：与 `components/index.json` 保持一致。
- `geometry-source`：逐条列出「数值 ← 文件名 选择器」。原有 README 中标注为**「本仓库建议值（非官方数值）」**的条目必须原样保留该标注，并保留其理由与依据的条款号。
- `api`：属性名 / 类型 / 默认值 / 说明，表格。
- `states`：状态清单，每条给出触发条件（选择器或属性）与表现。
- `tokens`：用到的每个 `--dsw-*` 变量；组件内部变量另列一节并注明「不是 DSH token」。
- `a11y`：角色、键盘行为、aria 属性、命中区结论。
- `checks`：可自动检测的二元约束，每条 true / false 即可判定，能直接落成 lint 规则。凡引用 `spec/` 条款的都写明条款号。
- `demo`：对应的 `demo.html` 路径。

SPEC 里**不得出现**：主观推荐（「更适合」「更好看」）、没有出处的数值、把判断句当结论。

## 正反例对照

改写自 `components/data-display/DisclosureRow/` 与 `components/controls/Button/` 的原 README。

| 改前（原 README） | 改后（人读版） | 事实去了哪 |
| --- | --- | --- |
| 两种命中形态：默认（`expandOnRowClick={false}`）：只有左侧 16×16 的图标按钮可切换。 | 折叠状态下默认只有左边那个小图标能被点到，手指上去就得瞄准。做触摸为主的界面时，让整行都能点。 | 保留 `expandOnRowClick` 的默认值 `false`；16×16 与命中区 20×24 移入 SPEC 的 `geometry-source` 与 `checks` |
| 折叠态悬停整行时，行内图标 100ms 淡出、箭头 100ms 淡入（两个过渡都只动 `opacity`）。 | 折叠着把鼠标移到整行上，左边的小图标淡出、箭头淡入，等于说一句「这里能点」。这只是给鼠标的提示，别让它成为唯一的线索。 | 100ms 与 `opacity` 移入 SPEC 的 `geometry-source` 与 `states` |
| `primary` \| 主操作，一个界面里最多一个（保存 / 确认 / 发送） | 一个界面里只留一个最重的按钮。满屏都是高亮按钮时，用户反而要花时间比较哪一个才是主路。 | 变体名 `primary` 与配色 token 移入 SPEC 的 `api` 与 `tokens` |
| 一个动作还没准备好时不要把 `primary` 换成 `ghost` 来「禁用」——直接 `disabled` | 动作暂时做不了。直接把按钮置灰，别把它降级成次级样式——用户分不清「不能用」和「不是重点」。 | 「禁用使用原生 `disabled` 而非 `aria-disabled`」移入 SPEC 的 `a11y` 与 `checks` |

注意最后一组：改后句子更长了，但读者从「记住两个变体名的搭配禁忌」变成了「知道用户会怎么误解」。这正是两套文件的差别——**README 可以为了讲清一个判断而多写两句，SPEC 则一句废话都不能有。**

## 批量改造检查清单

对每个组件目录执行。

### 一、README 禁止项（可用 grep 自动检测）

- [ ] 反引号包裹的标识符：`` `open` ``、`` `onToggle` ``、`` `primary` ``、`` `disabled` ``
- [ ] JSX 默认值写法：出现 `{` 或 `}`
- [ ] CSS 选择器：`.row`、`[data-`、`::after`、`button.`
- [ ] 设计 token：`--dsw-`、`--dsh-`
- [ ] 行号：形如 `:12`、`L12`、`第 12 行`
- [ ] 文件名与路径：`index.tsx`、`*.module.css`、`spec/`（唯一例外是结尾那句「实现细节见 SPEC.md」）
- [ ] 精确数值：`24px`、`100ms`、`0.4`、`16×16`（对照表格里也不得出现）
- [ ] a11y 属性名：`aria-label`、`role=`、`tabIndex`
- [ ] 公文体：`应当`、`必须`、`该组件`、`本组件`、`使用者`
- [ ] emoji

### 二、README 必须项

- [ ] 标题下第一段给出一到两句场景，含至少一个具体、可指认的例子
- [ ] 存在「什么时候用它」一节，全部是判断句
- [ ] 存在「什么时候不要用它」一节，至少三条，其中至少一条点名改用的替代组件
- [ ] 存在「怎么用得好」一节，至少三条；每条是一句加粗的主张 + 一到三句解释
- [ ] 若用了表格，表格只做对照，且表头是「场景 / 场合 / 什么时候」这类判断维度
- [ ] 结尾一句「实现细节见 SPEC.md」
- [ ] 出现「你」或「用户」，不出现「本组件」

### 三、SPEC 必须项

- [ ] `id`、`category` 与 `components/index.json` 的条目一致
- [ ] `geometry-source` 每条写成「数值 ← 文件名 选择器」
- [ ] 原 README 里的「本仓库建议值（非官方数值）」标注与理由原样保留
- [ ] 「本仓库决策（改写官方行为）」与「本仓库建议值」分开成节，不混为一谈
- [ ] `api` 表含 属性名 / 类型 / 默认值 / 说明 四列
- [ ] `states` / `tokens` / `a11y` / `checks` / `demo` 五节齐全
- [ ] `checks` 每一条都能用 true / false 判定，引用 `spec/` 条款的写明条款号
- [ ] 没有无出处的数值

### 四、交叉检查

- [ ] 两套文件没有一句话重复
- [ ] README 里提到的每个「用错了会怎样」，SPEC 里都能找到对应的检测条目
- [ ] SPEC 里的每个数值，都能在 `index.tsx` / `*.module.css` 或原 README 里找到出处
- [ ] 没有改动 `index.tsx`、`*.module.css`、`demo.html`

### 五、可执行的粗略自检

在组件目录下跑：

```sh
grep -nE '`|\{|\}|--dsw-|--dsh-|\.module\.css|index\.tsx|aria-|role=' README.md
```

命中任何一条都需要人工确认；结尾那行「实现细节见 SPEC.md」是唯一豁免。再跑：

```sh
grep -cE '^(#{2,3}) (什么时候用它|什么时候不要用它|怎么用得好)' README.md
```

结果应为 `3`。

## 本次抓取的原始来源

Apple 中文页是客户端渲染的，直接取 HTML 只能拿到标题。正文走 Apple 文档数据接口：

- `https://developer.apple.com/tutorials/data/cn/design/human-interface-guidelines/widgets.json`
- `https://developer.apple.com/tutorials/data/cn/design/human-interface-guidelines/buttons.json`
- `https://developer.apple.com/tutorials/data/cn/design/human-interface-guidelines/toggles.json`
- `https://developer.apple.com/tutorials/data/cn/design/human-interface-guidelines/menus.json`
- `https://developer.apple.com/tutorials/data/cn/design/human-interface-guidelines/text-fields.json`

注意两点：`?language=zh-CN` 查询参数无效（返回的仍是英文，字节与 en-US 完全相同）；中文版本在路径里，即 `/tutorials/data/cn/...`。返回的 JSON 里 `primaryContentSections` 是内容树，标题、正文、表格、图注、变更日志都在里面。

关于「一节一条加粗祈使句」这条规律的两个例外，抓取时都看到了：菜单页没有「最佳实践」节，规则直接按「标签 / 图标 / 整理」分主题；文本栏页没有开头的摘要段，直接从「最佳实践」开始。也就是说 Apple 固定的是「一句话一条规则」的粒度，而不是固定的章节骨架。
