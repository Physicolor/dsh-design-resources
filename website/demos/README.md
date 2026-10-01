# website/demos — 嵌入规范文档的实况演示

这个目录里的每个 `.html` 都是一段**可以直接跑**的界面演示，被规范文档引用后就地渲染在页面上。

## 为什么不用图片

Apple 的 HIG 用渲染图演示小组件的外观差异，效果好，但图是死的：读者只能看，不能碰，也不能把它复制走。

这里的内容本来就是 WebUI 技术栈做出来的，所以演示用**原生 HTML**写：可交互、可 hover、可复制，而且和真实实现共用同一套 token。这是电子说明书相对纸面文档的唯一优势，不用掉就白做了。

## 怎么被引用

在 `spec/*.md` 里写一行占位符（独占一行）：

```markdown
<!-- demo: frame-columns | 只开左栏与中栏时的分区。把指针移到任意一栏上，它会高亮。 -->
```

- `frame-columns` 对应本目录的 `frame-columns.html`；
- `|` 后面是图注，会渲染成居中的小字（Apple 的做法：先看，再看说明）。

渲染结果是一个 `<figure>`：演示本体 + 图注。

## 演示文件怎么写

1. **独立可用**：双击也能在浏览器里打开看到完整效果。
2. **style 写在文件里**：会被注入到一个 **shadow root**，样式不会泄漏到页面，也不会被页面影响。
3. **`body` / `:root` 会被自动改写成 `:host`**：所以按普通页面写即可，`body { padding: 24px }` 这种写法是安全的。
4. **用官方 token**：颜色、圆角、字号一律 `var(--dsw-*)`；页面已经把这套 token 注入好了，直接引用。
5. **交互两条路都行**：纯 CSS（`:hover`、`:has()`、checkbox/radio + label、CSS 动画）最省事，双击打开与嵌入文档行为一致；需要 JS 也可以——站点挂载后会**重建 script 节点**，所以 `<script>` 真的会执行（`innerHTML` 本身不执行脚本，这一步是站点补上的）。shadow root 内的事件不会跑到外面。
6. **高度自然撑开**：不要固定高度，不要出现内部滚动条——读者只应该滚一次。
7. **可以动**：hover 高亮、循环播放、手动触发都行。动效演示尤其应该给「自动播放 / 暂停 / 手动触发」三种入口。
8. **不要外部资源**：不引图片、字体、CDN。

## 已有的演示

| 文件 | 用在哪 | 演示什么 |
| --- | --- | --- |
| `frame-columns.html` | `spec/10-frame-layout.md` | 三列分区：hover 高亮每一栏，标出各栏职责 |
| `frame-composer.html` | `spec/10-frame-layout.md` | 输入区三段与两侧留白的关系 |
| `frame-rightbar.html` | `spec/10-frame-layout.md` | 右栏什么时候存在、什么时候不该占用 |
| `motion-select.html` | `spec/40-motion.md` | 选择器右侧箭头的展开动效，可循环 |
| `motion-panels.html` | `spec/40-motion.md` | 左右栏开合时整个页面的位移 |
| `icon-anatomy.html` | `spec/50-icons.md` | 官方图标的画板、安全区、描边与光学居中标注 |
