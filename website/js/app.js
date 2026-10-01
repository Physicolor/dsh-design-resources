/**
 * The gallery itself: hash routing, three-column rendering, search.
 *
 * No framework and no build step — the page is opened straight from disk
 * (`file://`), so every input already sits inlined in `js/data.js`.
 */
(function () {
    'use strict'

    var D = window.DSHDR || { icons: [], seats: [], components: [], specs: [], tokens: { light: {}, dark: {}, resolvedLight: {}, resolvedDark: {} }, stats: {}, brand: {} }

    var mainEl = document.getElementById('main')
    var indexEl = document.getElementById('index')
    var asideEl = document.getElementById('aside')
    var resultsEl = document.getElementById('results')
    var resultsPanel = document.getElementById('resultsPanel')
    var queryEl = document.getElementById('q')

    var CATEGORY_LABEL = {
        layout: '布局',
        controls: '控件',
        surfaces: '容器',
        feedback: '反馈',
        'data-display': '数据展示',
        patterns: '页面模式',
        brand: '品牌',
        uncategorized: '未分类',
    }

    /**
     * Escape text for HTML.
     * @param s - raw text.
     * @returns escaped text.
     */
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;').replace(/"/gu, '&quot;')
    }

    /**
     * Build an absolute href for a generated SVG's detail page.
     * @param id - item id.
     * @returns hash href.
     */
    function href(hash) { return '#' + hash }

    /**
     * Copy text to the clipboard, tolerating file:// where the async API is absent.
     * @param text - text to copy.
     * @param button - button to confirm on.
     */
    function copy(text, button) {
        var done = function () {
            if (button == null) return
            var old = button.textContent
            button.textContent = '已复制'
            setTimeout(function () { button.textContent = old }, 1200)
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () { fallback() })
        } else { fallback() }

        function fallback() {
            var ta = document.createElement('textarea')
            ta.value = text
            ta.style.position = 'fixed'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.select()
            try { document.execCommand('copy'); done() } catch (e) { /* nothing else to try */ }
            document.body.removeChild(ta)
        }
    }

    /* ── index (left column) ───────────────────────────────────────── */

    /**
     * Render the left navigation.
     * @param path - current route path.
     */
    function renderIndex(path) {
        var groups = []

        groups.push({
            title: '概览',
            links: [
                { href: href('/'), label: '设计资源首页', active: path === '/' },
                { href: href('/why'), label: '为什么需要这份规范', active: path === '/why' },
            ],
        })

        if (D.specs.length > 0) {
            groups.push({
                title: '规范',
                links: D.specs.map(function (s) {
                    return { href: href('/spec/' + s.id), label: s.title, active: path === '/spec/' + s.id }
                }),
            })
        }

        var byCategory = {}
        D.components.forEach(function (c) {
            var cat = c.category || 'uncategorized'
            byCategory[cat] = byCategory[cat] || []
            byCategory[cat].push(c)
        })
        var categoryLinks = Object.keys(byCategory).sort().map(function (cat) {
            return {
                href: href('/components/' + cat),
                label: CATEGORY_LABEL[cat] || cat,
                count: byCategory[cat].length,
                active: path === '/components/' + cat,
            }
        })
        if (categoryLinks.length > 0) {
            groups.push({
                title: '组件源码',
                links: [{ href: href('/components'), label: '全部组件', count: D.components.length, active: path === '/components' }].concat(categoryLinks),
            })
        }

        groups.push({
            title: '资源',
            links: [
                { href: href('/seats'), label: '座位目录', count: D.seats.length, active: path === '/seats' },
                { href: href('/icons'), label: '官方图标集', count: D.icons.length, active: path === '/icons' },
                { href: href('/tokens'), label: '设计令牌', count: Object.keys(D.tokens.light).length, active: path === '/tokens' },
            ],
        })

        indexEl.innerHTML = groups.map(function (group) {
            return '<div class="index__group">'
                + '<p class="index__title">' + esc(group.title) + '</p>'
                + group.links.map(function (link) {
                    return '<a class="index__link" href="' + esc(link.href) + '"' + (link.active ? ' aria-current="page"' : '') + '>'
                        + '<span>' + esc(link.label) + '</span>'
                        + (link.count == null ? '' : '<span class="index__count">' + link.count + '</span>')
                        + '</a>'
                }).join('')
                + '</div>'
        }).join('')
    }

    /* ── aside (right column) ──────────────────────────────────────── */

    /**
     * Render the right-hand rationale column.
     * @param blocks - array of { title, html }.
     */
    function renderAside(blocks) {
        if (blocks == null || blocks.length === 0) {
            asideEl.innerHTML = ''
            return
        }
        asideEl.innerHTML = blocks.map(function (block) {
            return '<section class="aside__block"><p class="aside__title">' + esc(block.title) + '</p>' + block.html + '</section>'
        }).join('')
    }

    /**
     * A `<p>` block.
     * @param text - text.
     * @returns html.
     */
    function p(text) { return '<p>' + esc(text) + '</p>' }

    /**
     * A `<ul>` block.
     * @param items - list items.
     * @returns html.
     */
    function ul(items) {
        if (items == null || items.length === 0) return ''
        return '<ul>' + items.map(function (t) { return '<li>' + esc(t) + '</li>' }).join('') + '</ul>'
    }

    /**
     * Split a manifest field into list items.
     *
     * Component metadata packs several sentences into one string, separated by
     * `；` (the source convention) or a newline; rendering it as one paragraph
     * would bury the second reason.
     * @param value - string, or array of strings.
     * @returns trimmed items.
     */
    function toList(value) {
        if (value == null) return []
        var out = []
        ;[].concat(value).forEach(function (entry) {
            String(entry).split(/[；\n]+/u).forEach(function (part) {
                var text = part.trim().replace(/[；;，,]$/u, '')
                if (text !== '') out.push(text)
            })
        })
        return out
    }

    /**
     * Collapse a manifest field into one readable sentence.
     * @param value - field text.
     * @returns cleaned text.
     */
    function toPlain(value) {
        return String(value == null ? '' : value)
            .replace(/。\s*；/gu, '。 ')
            .replace(/；/gu, ' ')
            .replace(/\s+/gu, ' ')
            .trim()
    }

    /* ── shared blocks ─────────────────────────────────────────────── */

    /**
     * A code block with a copy control.
     * @param label - block caption.
     * @param code - code text.
     * @returns html.
     */
    function codeBlock(label, code) {
        return '<div class="code">'
            + '<div class="code__head"><span>' + esc(label) + '</span>'
            + '<button class="copy" type="button" data-copy>复制</button></div>'
            + '<pre><code>' + esc(code) + '</code></pre>'
            + '</div>'
    }

    /**
     * A specimen stage holding a live demo, rendered in an isolated frame so a
     * demo's own styles cannot leak into the surrounding page.
     * @param title - stage caption.
     * @param demoHtml - the demo document.
     * @param height - frame height in px.
     * @returns html.
     */
    function specimen(title, demoHtml, height) {
        if (demoHtml == null || demoHtml === '') return ''
        return '<div class="specimen">'
            + '<p class="specimen__label">' + esc(title) + '</p>'
            + '<iframe title="' + esc(title) + '" style="width:100%;height:' + height + 'px;border:0;background:transparent;display:block" srcdoc="' + esc(demoHtml) + '"></iframe>'
            + '</div>'
    }

    /**
     * A badge span.
     * @param text - label.
     * @param tone - badge tone suffix.
     * @returns html.
     */
    function badge(text, tone) {
        return '<span class="badge badge--' + tone + '">' + esc(text) + '</span>'
    }

    /* ── pages ─────────────────────────────────────────────────────── */

    /** The landing page. */
    function pageHome() {
        var s = D.stats
        mainEl.innerHTML = ''
            + '<div class="hero">'
            + '<p class="hero__eyebrow">DeepSeek Design Resources</p>'
            + '<h1 class="hero__title">让社区的插件<br>看起来像同一个产品。</h1>'
            + '<p class="hero__lede">DeepSeek Harness 为插件提供了技术栈与开发规范，却没有提供设计规范：控件该多大、间距多少、动效多长、图标怎么画、两个插件抢同一个位置时谁优先，都没有裁决依据。这份资源补上这一层——每一条数值都标注来源，每一个组件都能直接拿去用。</p>'
            + '</div>'
            + '<section class="section">'
            + '<div class="section__head"><h2 class="section__title">仓库里有什么</h2>'
            + '<span class="section__hint">全部由脚本从运行中的 Harness 采集，可重新生成</span></div>'
            + '<div class="cards">'
            + card('规范', s.specs + ' 篇', '主页面骨架、座位选择、控件、令牌、动效、图标、可访问性与提交前自检清单。', '/spec', '先把这一层读完再动手')
            + card('组件源码', s.components + ' 个', '分类归档、零依赖、只使用官方 token 的 React 实现，附几何来源与使用时机。', '/components', '复制即可用')
            + card('座位目录', s.seats + ' 个', 'Harness 声明了 ' + s.seats + ' 个 UI 座位；每个座位的用途、注册契约与遮蔽风险都在这儿。', '/seats', '决定你的 UI 该放在哪里')
            + card('官方图标集', s.icons + ' 个', '从产品自身提取的图标，保持原始路径数据与命名规范。', '/icons', '别再画第五种关闭按钮')
            + card('设计令牌', s.aliases + ' 个', '官方语义 token 的浅色与深色取值，直接对照使用。', '/tokens', '颜色不要硬编码')
            + card('为什么', '一页说清', '官方兼容了技术栈，却没有兼容设计规范——这就是这个仓库存在的原因。', '/why', '两分钟读完')
            + '</div></section>'
        renderAside([
            { title: '来源', html: p('站点数据由 scripts/ 下的采集脚本从本机运行中的 DeepSeek Harness 提取：图标与令牌来自产品自身的客户端包，座位目录来自 Harness 的座位检查接口。') },
            { title: '更新方式', html: p('任何一条数据都可以重新生成，不依赖手工记录。生成时间见页面底部。') },
        ])
        document.getElementById('stamp').textContent = '数据生成于 ' + (D.generatedAt || '').slice(0, 19).replace('T', ' ')
    }

    /**
     * A landing card.
     * @param title - card title.
     * @param meta - small meta line.
     * @param body - description.
     * @param hash - target route.
     * @param note - footer note.
     * @returns html.
     */
    function card(title, meta, body, hash, note) {
        return '<a class="card" href="' + esc(href(hash)) + '">'
            + '<p class="card__title">' + esc(title) + '</p>'
            + '<p class="card__body">' + esc(body) + '</p>'
            + '<p class="card__meta">' + esc(meta) + ' · ' + esc(note) + '</p>'
            + '</a>'
    }

    /** The positioning page: what the product does and does not provide. */
    function pageWhy() {
        mainEl.innerHTML = ''
            + '<div class="hero"><h1 class="hero__title">为什么需要这份规范</h1>'
            + '<p class="hero__lede">一句话：官方给了插件能跑起来的技术栈，没有给插件看起来一致的设计规范。</p></div>'
            + '<section class="section"><div class="prose">'
            + '<h2>官方已经做了什么</h2>'
            + '<ul>'
            + '<li>一套完整的语义 token（' + esc(String(D.stats.aliases)) + ' 个别名，分浅色与深色两套），颜色、层级、状态都有官方取值。</li>'
            + '<li>一套共享控件原语（按钮、胶囊、标签、开关、输入、菜单、弹窗、提示等），并且明文写着「不要复制已经存在的控件」。</li>'
            + '<li>一套座位系统：' + esc(String(D.stats.seats)) + ' 个已声明座位，每个都标注了用途、注册契约与遮蔽风险。</li>'
            + '<li>一套图标集：' + esc(String(D.stats.icons)) + ' 个图标，命名与尺寸族都有规律。</li>'
            + '</ul>'
            + '<h2>官方没有做什么</h2>'
            + '<ul>'
            + '<li><strong>没有布局规范</strong>：一个插件该占用哪个区域、占多大、与会话区怎么协调，没有条文。</li>'
            + '<li><strong>没有摆放契约</strong>：座位是 <code>list</code> 类型时，<code>order</code> 该取什么值全靠自觉。</li>'
            + '<li><strong>没有动效规范</strong>：时长与曲线的档位没有统一。</li>'
            + '<li><strong>没有图标几何规范</strong>：自绘图标该用多粗的描边、怎么对齐，没有依据。</li>'
            + '<li><strong>没有冲突裁决</strong>：两个插件抢同一个座位、同一段视觉空间时，没有任何机制提示。</li>'
            + '</ul>'
            + '<h2>这件事有实证</h2>'
            + '<p>在本机运行中的 Harness 上实测（' + esc(String(D.stats.seats)) + ' 个座位）：</p>'
            + '<div class="callout callout--warn"><span class="callout__mark">!</span><div>'
            + '<p><code>shell.overlay</code> 有 14 个占用者，其中 13 个没有声明 <code>order</code>，全部落在默认值 0——层级顺序由注册时序决定，不可预测。</p>'
            + '<p><code>settings.section</code> 有 11 个占用者，其中三个把 order 都写成 40，顺序无法解释。</p>'
            + '</div></div>'
            + '<p>这不是某个插件的错，是缺少规范与检查的必然结果。这份资源做两件事：把该有的规范补上，并让冲突变得可见。</p>'
            + '<h2>这个仓库不做什么</h2>'
            + '<ul>'
            + '<li>不评判审美。规范只保证一致与可用，不宣称哪种风格更好看。</li>'
            + '<li>不强制别人改代码。规范是给愿意遵守的人的公共依据。</li>'
            + '<li>不发明数值。每一条尺寸、间距、时长都标注来源；没有权威依据的地方会明确写出来。</li>'
            + '</ul>'
            + '</div></section>'
        renderAside([
            { title: '效力层级', html: p('文档中的条目分为强制（MF）、推荐（RC）、建议（AD）三档，可自动检测的条目在自检清单里单独标注。') },
            { title: '配套检查', html: p('座位冲突、死规则、间距越界等可自动判定的项目，由 dsh-ui-harmonizer 的只读审计器检测并在设置页提示。') },
        ])
    }

    /**
     * The spec list, or one document.
     * @param id - document id, when one is selected.
     */
    function pageSpec(id) {
        if (id == null) {
            mainEl.innerHTML = '<div class="hero"><h1 class="hero__title">规范</h1>'
                + '<p class="hero__lede">按阅读顺序排列。第一次接触这个生态，建议从主页面骨架与座位选择读起。</p></div>'
                + '<div class="cards">' + D.specs.map(function (s, i) {
                    return '<a class="card" href="' + esc(href('/spec/' + s.id)) + '">'
                        + '<p class="card__meta">' + String(i + 1).padStart(2, '0') + ' · ' + esc(s.id) + '</p>'
                        + '<p class="card__title">' + esc(s.title) + '</p>'
                        + '<p class="card__body">' + s.chars + ' 字</p>'
                        + '</a>'
                }).join('') + '</div>'
            renderAside([{ title: '说明', html: p('每篇文档开头写明适用对象与效力层级，可自动检测的判据会单独标注。') }])
            return
        }
        var spec = D.specs.filter(function (s) { return s.id === id })[0]
        if (spec == null) { pageNotFound(); return }
        mainEl.innerHTML = '<article class="prose">' + spec.html + '</article>'
        var headings = []
        var re = /<h3>([^<]+)<\/h3>/gu
        var m
        while ((m = re.exec(spec.html)) !== null) headings.push(m[1])
        renderAside([
            { title: '文件', html: '<dl><dt>路径</dt><dd>' + esc(spec.file) + '</dd><dt>字数</dt><dd>' + spec.chars + '</dd></dl>' },
            headings.length > 0 ? { title: '小节', html: ul(headings) } : null,
            { title: '相关', html: p('规范条目中的可检测项，对应自检清单与审计器规则。') },
        ].filter(Boolean))
    }

    /**
     * The component index, a category page, or one component.
     * @param arg - category key, component id, or undefined.
     */
    function pageComponents(arg) {
        if (arg == null) {
            var byCategory = {}
            D.components.forEach(function (c) {
                var cat = c.category || 'uncategorized'
                byCategory[cat] = byCategory[cat] || []
                byCategory[cat].push(c)
            })
            mainEl.innerHTML = '<div class="hero"><h1 class="hero__title">组件源码</h1>'
                + '<p class="hero__lede">每个组件都是零依赖的 React 实现，只使用官方令牌，并附上几何来源与使用时机。复制即可用。</p></div>'
                + Object.keys(byCategory).sort().map(function (cat) {
                    return '<section class="section"><div class="section__head">'
                        + '<h2 class="section__title">' + esc(CATEGORY_LABEL[cat] || cat) + '</h2>'
                        + '<a class="section__hint" href="' + esc(href('/components/' + cat)) + '">查看全部 ' + byCategory[cat].length + ' 个</a></div>'
                        + '<div class="cards">' + byCategory[cat].slice(0, 3).map(componentCard).join('') + '</div></section>'
                }).join('')
            renderAside([{ title: '怎么用', html: p('组件目录本身就是一个 npm 包，可以被安装；也可以直接把单个目录复制进你的插件源码。') }])
            return
        }

        var byCategoryKey = {}
        D.components.forEach(function (c) { byCategoryKey[c.category || 'uncategorized'] = true })
        if (byCategoryKey[arg] === true && !D.components.some(function (c) { return c.id === arg })) {
            var list = D.components.filter(function (c) { return (c.category || 'uncategorized') === arg })
            mainEl.innerHTML = '<div class="hero"><h1 class="hero__title">' + esc(CATEGORY_LABEL[arg] || arg) + '</h1>'
                + '<p class="hero__lede">' + list.length + ' 个组件。</p></div>'
                + '<div class="cards">' + list.map(componentCard).join('') + '</div>'
            renderAside([{ title: '分类', html: p('分类按用途划分，不按视觉形态。同一个功能只应存在一个实现。') }])
            return
        }

        var c = D.components.filter(function (x) { return x.id === arg })[0]
        if (c == null) { pageNotFound(); return }

        mainEl.innerHTML = ''
            + '<div class="hero"><h1 class="hero__title">' + esc(c.name) + '</h1>'
            + '<p class="hero__lede">' + esc(toPlain(c.summary)) + '</p></div>'
            + specimen('实况预览', c.demo, 300)
            + (c.tsx ? codeBlock((c.path || '') + 'index.tsx', c.tsx) : '')
            + (c.css ? codeBlock((c.path || '') + (c.id || 'component').toLowerCase() + '.module.css', c.css) : '')
            + (c.readmeHtml ? '<article class="prose">' + c.readmeHtml + '</article>' : '')

        renderAside([
            c.whenToUse ? { title: '什么时候用', html: ul(toList(c.whenToUse)) } : null,
            c.whenNotToUse ? { title: '什么时候不要用', html: ul(toList(c.whenNotToUse)) } : null,
            c.geometrySource ? { title: '几何来源', html: p(c.geometrySource) } : null,
            c.tags ? { title: '标签', html: p([].concat(c.tags).join(' · ')) } : null,
        ].filter(Boolean))
    }

    /**
     * A component card.
     * @param c - component record.
     * @returns html.
     */
    function componentCard(c) {
        return '<a class="card" href="' + esc(href('/component/' + c.id)) + '">'
            + '<p class="card__title">' + esc(c.name) + '</p>'
            + '<p class="card__body">' + esc(toPlain(c.summary)) + '</p>'
            + '<p class="card__meta">' + esc(CATEGORY_LABEL[c.category] || c.category || '') + '</p>'
            + '</a>'
    }

    /**
     * The seat directory, optionally filtered.
     * @param q - filter text.
     */
    function pageSeats(q) {
        var query = (q || '').trim().toLowerCase()
        var seats = D.seats.filter(function (s) {
            if (query === '') return true
            return s.name.toLowerCase().indexOf(query) !== -1
                || (s.purpose || '').toLowerCase().indexOf(query) !== -1
                || s.kind === query || s.scope === query || s.replaceRisk === query
        })
        var risky = D.seats.filter(function (s) { return s.replaceRisk === 'shadows-shipped-ui' }).length
        mainEl.innerHTML = ''
            + '<div class="hero"><h1 class="hero__title">座位目录</h1>'
            + '<p class="hero__lede">Harness 声明了 ' + D.seats.length + ' 个 UI 座位。你的插件只能挂在这些座位上——选错座位比写错样式代价更大。</p></div>'
            + '<div class="callout callout--warn"><span class="callout__mark">!</span><div>'
            + '<p>' + risky + ' 个座位的遮蔽风险为 <code>shadows-shipped-ui</code>：占用它会替换官方界面。这类座位只在确实要替换官方 UI 时使用。</p>'
            + '</div></div>'
            + '<section class="section">'
            + '<div class="section__head"><h2 class="section__title">' + seats.length + ' 个座位</h2>'
            + '<span class="section__hint">' + (query === '' ? '按树序排列' : '过滤：' + esc(query)) + '</span></div>'
            + '<div class="table-wrap"><table><thead><tr><th>座位</th><th>类型</th><th>作用域</th><th>遮蔽风险</th><th>用途</th></tr></thead><tbody>'
            + seats.map(function (s) {
                return '<tr><td class="mono">' + esc(s.name) + '</td>'
                    + '<td>' + badge(s.kind, s.kind === 'single' ? 'warn' : 'neutral') + '</td>'
                    + '<td>' + esc(s.scope) + '</td>'
                    + '<td>' + badge(s.replaceRisk === 'none' ? '安全' : '遮蔽官方', s.replaceRisk === 'none' ? 'safe' : 'risk') + '</td>'
                    + '<td>' + esc(s.purpose) + '</td></tr>'
            }).join('')
            + '</tbody></table></div></section>'
        renderAside([
            { title: '座位类型', html: ul(['single — 唯一占用，后注册者遮蔽先注册者', 'list — 多插件按 order 升序排列', 'keyed — 按 key 分发', 'chain — 选择器路由，可整段替换']) },
            { title: '作用域', html: ul(['root — 全局，无会话时也存在', 'session-maybe — 与会话相关但可空', 'session — 必须选中会话才渲染']) },
            { title: '选择顺序', html: p('先找语义最贴合的 list 座位；没有合适的再考虑 single 座位；replaceRisk 为 shadows-shipped-ui 的座位最后考虑。') },
        ])
    }

    /**
     * The official icon set.
     * @param q - filter text.
     */
    function pageIcons(q) {
        var query = (q || '').trim().toLowerCase()
        var icons = D.icons.filter(function (i) {
            return query === '' || i.name.toLowerCase().indexOf(query) !== -1 || i.component.toLowerCase().indexOf(query) !== -1
        })
        mainEl.innerHTML = ''
            + '<div class="hero"><h1 class="hero__title">官方图标集</h1>'
            + '<p class="hero__lede">' + D.icons.length + ' 个图标，全部从产品自身的客户端包提取，路径数据原样保留。命名规律：<code>ic_ds_&lt;名称&gt;_&lt;风格&gt;_&lt;尺寸&gt;</code>。点击任意图标复制 SVG。</p></div>'
            + '<div class="callout"><span class="callout__mark">i</span><div>'
            + '<p>尺寸族：' + (function () {
                var families = {}
                D.icons.forEach(function (i) {
                    var parts = String(i.viewBox || '').split(' ')
                    if (parts.length < 4) return
                    var key = parts[2] + '×' + parts[3]
                    families[key] = (families[key] || 0) + 1
                })
                return Object.keys(families).sort(function (a, b) {
                    return parseFloat(b) - parseFloat(a)
                }).map(function (k) { return k + ' · ' + families[k] + ' 个' }).join('、')
            })() + '。自绘图标请与相邻图标保持同一视觉重量与描边粗细。</p>'
            + '</div></div>'
            + '<section class="section"><div class="section__head"><h2 class="section__title">' + icons.length + ' 个图标</h2>'
            + '<span class="section__hint">' + (query === '' ? '按提取顺序' : '过滤：' + esc(query)) + '</span></div>'
            + '<div class="icons">' + icons.map(function (i) {
                return '<button class="icon-cell" type="button" data-svg="' + esc(i.file) + '" title="' + esc(i.name) + '">'
                    + '<span style="display:block;width:24px;height:24px">' + (i.svg || '') + '</span>'
                    + '<span class="icon-cell__name">' + esc(i.name.replace(/^ic_ds_/u, '')) + '</span>'
                    + '</button>'
            }).join('')
            + '</div></section>'
        renderAside([
            { title: '为什么用它', html: p('图标风格不一致是插件界面最容易露馅的地方。官方图标已经处理好视觉重量与留白，直接复用比自己画一个「差不多的」更省事，也更一致。') },
            { title: '命名', html: '<dl><dt>授权名</dt><dd>ic_ds_close_outline_16</dd><dt>组件名</dt><dd>IconCloseOutline16</dd><dt>文件</dt><dd>icons/close-outline.svg</dd></dl>' },
        ])
    }

    /** The token reference. */
    function pageTokens(q) {
        var query = (q || '').trim().toLowerCase()
        var names = Object.keys(D.tokens.light).filter(function (n) { return query === '' || n.toLowerCase().indexOf(query) !== -1 })
        mainEl.innerHTML = ''
            + '<div class="hero"><h1 class="hero__title">设计令牌</h1>'
            + '<p class="hero__lede">' + Object.keys(D.tokens.palette).length + ' 个原始色板值支撑 ' + Object.keys(D.tokens.light).length + ' 个语义别名。插件只应使用语义别名——浅色与深色由产品负责。</p></div>'
            + '<div class="callout"><span class="callout__mark">i</span><div>'
            + '<p>用法：<code>color: var(--dsw-alias-label-primary)</code>。硬编码色值是插件在深色模式下翻车的第一大原因。</p>'
            + '</div></div>'
            + '<section class="section"><div class="section__head"><h2 class="section__title">' + names.length + ' 个别名</h2>'
            + '<span class="section__hint">' + (query === '' ? '按定义顺序' : '过滤：' + esc(query)) + '</span></div>'
            + '<div class="table-wrap"><table><thead><tr><th>令牌</th><th>色块</th><th>浅色</th><th>深色</th></tr></thead><tbody>'
            + names.map(function (n) {
                var light = D.tokens.resolvedLight[n] || D.tokens.light[n] || ''
                var dark = D.tokens.resolvedDark[n] || D.tokens.dark[n] || ''
                var swatch = /^(#|rgb|hsl)/u.test(light)
                    ? '<span style="display:inline-block;width:20px;height:20px;border-radius:5px;border:1px solid var(--site-line-soft);background:' + esc(light) + '"></span>'
                    : '<span style="color:var(--site-label-3)">—</span>'
                return '<tr><td class="mono">' + esc(n) + '</td><td>' + swatch + '</td>'
                    + '<td class="mono">' + esc(light) + '</td><td class="mono">' + esc(dark) + '</td></tr>'
            }).join('')
            + '</tbody></table></div></section>'
        renderAside([
            { title: '层级怎么表达', html: p('用背景层级（bg-base → bg-layer-1 → bg-layer-2 → bg-overlay）而不是阴影来表达深度。阴影是例外，不是默认手段。') },
            { title: '来源', html: p('取值直接来自产品客户端包里的主题定义，浅色与深色各一套，未经改写。') },
        ])
    }

    /** Fallback page. */
    function pageNotFound() {
        mainEl.innerHTML = '<div class="hero"><h1 class="hero__title">没有这一页</h1>'
            + '<p class="hero__lede">链接可能指向了尚未生成的内容。回到<a href="' + esc(href('/')) + '">首页</a>，或用上方搜索。</p></div>'
        renderAside([])
    }

    /* ── routing ───────────────────────────────────────────────────── */

    /**
     * Parse the current hash into a path and a query.
     * @returns {{path: string, q: string}} route parts.
     */
    function route() {
        var raw = location.hash.replace(/^#/u, '') || '/'
        var q = ''
        var at = raw.indexOf('?')
        if (at !== -1) {
            var params = new URLSearchParams(raw.slice(at + 1))
            q = params.get('q') || ''
            raw = raw.slice(0, at)
        }
        if (raw.charAt(0) !== '/') raw = '/' + raw
        return { path: raw.replace(/\/+$/u, '') || '/', q: q }
    }

    /** Render the current route. */
    function render() {
        var r = route()
        var path = r.path
        var parts = path.split('/').filter(Boolean)

        if (path === '/') pageHome()
        else if (path === '/why') pageWhy()
        else if (parts[0] === 'spec') pageSpec(parts[1] || null)
        else if (parts[0] === 'components') pageComponents(parts[1] || null)
        else if (parts[0] === 'component') pageComponents(parts[1] || null)
        else if (parts[0] === 'seats') pageSeats(r.q)
        else if (parts[0] === 'icons') pageIcons(r.q)
        else if (parts[0] === 'tokens') pageTokens(r.q)
        else pageNotFound()

        renderIndex(path)
        Array.prototype.forEach.call(mainEl.querySelectorAll('[data-copy]'), function (button) {
            button.addEventListener('click', function () {
                var pre = button.closest('.code').querySelector('pre code')
                copy(pre.textContent, button)
            })
        })
        Array.prototype.forEach.call(mainEl.querySelectorAll('.icon-cell'), function (cell) {
            cell.addEventListener('click', function () {
                var name = cell.getAttribute('title')
                var icon = D.icons.filter(function (i) { return i.name === name })[0]
                copy(icon ? icon.svg : '', null)
                cell.style.background = 'var(--site-good-soft)'
                setTimeout(function () { cell.style.background = '' }, 400)
            })
        })
        window.scrollTo(0, 0)
        mainEl.focus({ preventScroll: true })
    }

    /* ── search ────────────────────────────────────────────────────── */

    var INDEX = null

    /**
     * Build (once) the cross-resource search index.
     * @returns the index.
     */
    function buildIndex() {
        if (INDEX !== null) return INDEX
        var out = []
        D.specs.forEach(function (s) { out.push({ kind: '规范', name: s.title, desc: s.id, hash: '/spec/' + s.id }) })
        D.components.forEach(function (c) { out.push({ kind: '组件', name: c.name, desc: c.summary || '', hash: '/component/' + c.id }) })
        D.seats.forEach(function (s) { out.push({ kind: '座位', name: s.name, desc: s.purpose.slice(0, 72), hash: '/seats?q=' + encodeURIComponent(s.name) }) })
        D.icons.forEach(function (i) { out.push({ kind: '图标', name: i.name, desc: i.component, hash: '/icons?q=' + encodeURIComponent(i.name) }) })
        Object.keys(D.tokens.light).forEach(function (n) { out.push({ kind: '令牌', name: n, desc: '', hash: '/tokens?q=' + encodeURIComponent(n) }) })
        INDEX = out
        return out
    }

    /**
     * Search the index.
     * @param text - query.
     * @returns ranked matches.
     */
    function search(text) {
        var q = text.trim().toLowerCase()
        if (q === '') return []
        var hits = []
        buildIndex().forEach(function (item) {
            var name = item.name.toLowerCase()
            var at = name.indexOf(q)
            if (at === -1 && (item.desc || '').toLowerCase().indexOf(q) === -1) return
            hits.push({ item: item, score: at === 0 ? 0 : at === -1 ? 2 : 1 })
        })
        hits.sort(function (a, b) { return a.score - b.score })
        return hits.slice(0, 24).map(function (h) { return h.item })
    }

    /** Close the results panel. */
    function closeResults() {
        resultsEl.setAttribute('data-open', 'false')
        resultsPanel.innerHTML = ''
    }

    /**
     * Render search results.
     * @param items - matched entries.
     * @param activeIndex - highlighted row.
     */
    function showResults(items, activeIndex) {
        if (items.length === 0) {
            resultsPanel.innerHTML = '<p class="results__empty">没有匹配项</p>'
            resultsEl.setAttribute('data-open', 'true')
            return
        }
        resultsPanel.innerHTML = items.map(function (item, i) {
            return '<a class="results__item" href="' + esc(href(item.hash)) + '" data-active="' + (i === activeIndex) + '">'
                + '<span class="results__kind">' + esc(item.kind) + '</span>'
                + '<span class="results__name">' + esc(item.name) + '</span>'
                + '<span class="results__desc">' + esc((item.desc || '').slice(0, 60)) + '</span>'
                + '</a>'
        }).join('')
        resultsEl.setAttribute('data-open', 'true')
    }

    var currentHits = []
    var activeHit = -1

    queryEl.addEventListener('input', function () {
        currentHits = search(queryEl.value)
        activeHit = currentHits.length > 0 ? 0 : -1
        if (queryEl.value.trim() === '') { closeResults(); return }
        showResults(currentHits, activeHit)
    })

    queryEl.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') { closeResults(); queryEl.blur(); return }
        if (currentHits.length === 0) return
        if (event.key === 'ArrowDown') { event.preventDefault(); activeHit = (activeHit + 1) % currentHits.length; showResults(currentHits, activeHit) }
        if (event.key === 'ArrowUp') { event.preventDefault(); activeHit = (activeHit - 1 + currentHits.length) % currentHits.length; showResults(currentHits, activeHit) }
        if (event.key === 'Enter' && activeHit >= 0) {
            event.preventDefault()
            location.hash = '#' + currentHits[activeHit].hash
            closeResults()
            queryEl.blur()
        }
    })

    document.addEventListener('click', function (event) {
        if (!resultsEl.contains(event.target) && event.target !== queryEl) closeResults()
    })

    document.addEventListener('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') { event.preventDefault(); queryEl.focus(); queryEl.select() }
    })

    /* ── theme ─────────────────────────────────────────────────────── */

    /** Apply a theme choice to the document. */
    function applyTheme(mode) {
        if (mode === 'light' || mode === 'dark') document.documentElement.setAttribute('data-theme', mode)
        else document.documentElement.removeAttribute('data-theme')
        var effective = mode
        if (effective !== 'light' && effective !== 'dark') {
            effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        /* Component previews use the product's tokens, which the product selects
         * with `body[data-ds-dark-theme]` — mirror it so specimens match the page. */
        if (effective === 'dark') document.body.setAttribute('data-ds-dark-theme', '')
        else document.body.removeAttribute('data-ds-dark-theme')
        try { localStorage.setItem('dshdr-theme', mode) } catch (e) { /* private mode */ }
    }

    var stored = null
    try { stored = localStorage.getItem('dshdr-theme') } catch (e) { stored = null }
    applyTheme(stored || 'auto')

    document.getElementById('theme').addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme')
        var isDark = current !== null
            ? current === 'dark'
            : window.matchMedia('(prefers-color-scheme: dark)').matches
        applyTheme(isDark ? 'light' : 'dark')
    })

    /* ── boot ──────────────────────────────────────────────────────── */

    window.addEventListener('hashchange', render)

    if (D.icons.length === 0 && D.seats.length === 0 && D.components.length === 0) {
        mainEl.innerHTML = '<div class="hero"><h1 class="hero__title">数据尚未生成</h1>'
            + '<p class="hero__lede">先在仓库根目录运行 <code>node scripts/collect-icons.mjs &amp;&amp; node scripts/collect-tokens.mjs &amp;&amp; node scripts/collect-slots.mjs &amp;&amp; node website/gen-site.mjs</code>。</p></div>'
    } else {
        render()
    }
})()
