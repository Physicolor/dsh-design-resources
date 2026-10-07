/**
 * The gallery itself: i18n, hash routing, three independently scrolling
 * columns, resizable rails, and search.
 *
 * No framework and no build step — the page is opened straight from disk
 * (`file://`), so every input already sits inlined in `js/data.js`.
 */
(function () {
    'use strict'

    var D = window.DSHDR || {}
    /* Documents arrive per language (`docs/I18N.md`): the raw arrays hold every
     * document in both languages, and `SPECS` / `GUIDES` / `COMPONENTS` below are
     * the flat, single-language projections the renderers read. A document with
     * no version in the reader's language is not projected at all, so it cannot
     * be reached from the index, a card or a search hit. */
    var SPECS_RAW = D.specs || []
    /* 指南：按作者任务写的内容层（guides/）。规范回答「规则是什么」，指南回答「我现在该做什么」。 */
    var GUIDES_RAW = D.guides || []
    var COMPONENTS_RAW = D.components || []
    var SPECS = []
    var GUIDES = []
    var COMPONENTS = []
    var SEATS = D.seats || []
    var ICONS = D.icons || []
    var TOKENS = D.tokens || { light: {}, dark: {}, resolvedLight: {}, resolvedDark: {}, palette: {}, scale: {} }
    /* 元素清单：运行中的界面扫出来的每个身份，以及它有没有落进规范。 */
    var INVENTORY = D.inventory || { elements: [], counts: {} }
    var COVERAGE = D.coverage || { coverage: [], counts: {} }
    var ANCHORS = D.anchors || { anchors: [], pluginFamilies: [] }
    var I18N = D.i18n || { zh: {}, en: {} }

    var shell = document.getElementById('shell')
    var mainEl = document.getElementById('main')
    var indexEl = document.getElementById('index')
    var asideEl = document.getElementById('aside')
    var resultsEl = document.getElementById('results')
    var resultsPanel = document.getElementById('resultsPanel')
    var queryEl = document.getElementById('q')
    var topnavEl = document.getElementById('topnav')
    var langEl = document.getElementById('lang')

    /* ── storage ───────────────────────────────────────────────────── */

    /**
     * Read a preference, tolerating private mode and file:// quirks.
     * @param key - storage key.
     * @param fallback - value when absent.
     * @returns the stored string, or the fallback.
     */
    function load(key, fallback) {
        try {
            var v = localStorage.getItem(key)
            return v === null ? fallback : v
        } catch (e) { return fallback }
    }

    /**
     * Persist a preference.
     * @param key - storage key.
     * @param value - value to store.
     */
    function save(key, value) {
        try { localStorage.setItem(key, String(value)) } catch (e) { /* private mode */ }
    }

    /* ── i18n ──────────────────────────────────────────────────────── */

    var LANG = load('dshdr-lang', (navigator.language || 'zh').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en')
    if (I18N[LANG] === undefined) LANG = 'zh'

    /**
     * Translate a dotted key.
     * @param key - dotted path into the dictionary.
     * @param vars - substitutions for `{name}` placeholders.
     * @returns the translated string, or the key itself when missing.
     */
    function t(key, vars) {
        var node = I18N[LANG]
        var parts = key.split('.')
        for (var i = 0; i < parts.length; i++) {
            if (node === undefined || node === null) { node = undefined; break }
            node = node[parts[i]]
        }
        var text = typeof node === 'string' ? node : key
        if (vars) {
            Object.keys(vars).forEach(function (name) {
                text = text.split('{' + name + '}').join(String(vars[name]))
            })
        }
        return text
    }

    /**
     * Look a dotted key up as the raw value, objects included.
     *
     * `t` answers with text; some blocks are authored as objects (column headings,
     * the token → description map) and are read with this instead.
     * @param key - dotted path into the dictionary.
     * @returns the value, or null when missing.
     */
    function raw(key) {
        var node = I18N[LANG]
        var parts = key.split('.')
        for (var i = 0; i < parts.length; i++) {
            if (node === undefined || node === null) return null
            node = node[parts[i]]
        }
        return node === undefined ? null : node
    }

    /* ── language projection ───────────────────────────────────────── */

    /**
     * Merge one language's view of a document over its record.
     *
     * The generator stores each document as `doc[lang]`; every renderer below
     * wants a flat record, so the projection happens once here instead of at
     * forty call sites. A missing language means the document is dropped, not
     * shown in Chinese.
     * @param rows - raw records carrying a `doc` pair.
     * @returns flat records for the current language, translated ones only.
     */
    function project(rows) {
        var out = []
        rows.forEach(function (row) {
            var side = row.doc && row.doc[LANG]
            if (!side) return
            var flat = {}
            Object.keys(row).forEach(function (key) { flat[key] = row[key] })
            Object.keys(side).forEach(function (key) { flat[key] = side[key] })
            flat.groupLabel = LANG === 'en' ? row.groupLabelEn : row.groupLabel
            if (row.geometrySource) flat.geometrySource = row.geometrySource[LANG]
            if (row.tags) flat.tags = row.tags[LANG]
            if (row.evidence) flat.evidence = { status: row.evidence.status, reason: LANG === 'en' ? row.evidence.reasonEn : row.evidence.reason }
            out.push(flat)
        })
        return out
    }

    /**
     * Rebuild the three document lists for the current language.
     *
     * Called at boot and on every language switch, before anything renders.
     */
    function applyLanguage() {
        SPECS = project(SPECS_RAW)
        GUIDES = project(GUIDES_RAW)
        COMPONENTS = project(COMPONENTS_RAW)
    }

    /* ── helpers ───────────────────────────────────────────────────── */

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
     * Build a hash href.
     * @param hash - route, leading slash.
     * @returns href.
     */
    function href(hash) { return '#' + hash }

    /**
     * Find an official icon by its short name.
     * @param short - e.g. `panel-left`, `light`, `search`.
     * @returns the icon record, or null.
     */
    function icon(short) {
        /* Some icons carry an authored name (`ic_ds_close_outline_16`), others
         * only a component name (`IconAlarmClockOutline16`) — match either, and
         * ignore separators so a caller can write `alarm-clock`. */
        var needle = String(short).replace(/[_-]/gu, '').toLowerCase()
        for (var i = 0; i < ICONS.length; i++) {
            var hay = ((ICONS[i].name || '') + ' ' + (ICONS[i].component || '')).replace(/[_-]/gu, '').toLowerCase()
            if (hay.indexOf(needle) !== -1) return ICONS[i]
        }
        return null
    }

    /**
     * Icon aliases.
     *
     * The official set has no right-hand panel glyph, and inventing one would be
     * exactly the kind of near-duplicate this repository tells plugin authors not
     * to draw — so the left-hand glyph is mirrored instead.
     */
    var ICON_ALIAS = { 'panel-right': { name: 'panel-left', flip: true } }

    /**
     * Inline an official icon's SVG.
     * @param short - short icon name.
     * @param flip - mirror horizontally.
     * @returns SVG markup, or an empty string.
     */
    function iconSvg(short, flip) {
        var found = icon(short)
        if (found === null) return ''
        return flip ? '<span style="display:block;transform:scaleX(-1)">' + (found.svg || '') + '</span>' : (found.svg || '')
    }

    /**
     * Replace every `[data-icon]` placeholder in a subtree.
     * @param root - element to scan.
     */
    function hydrateIcons(root) {
        Array.prototype.forEach.call(root.querySelectorAll('[data-icon]'), function (node) {
            var short = node.getAttribute('data-icon')
            var flip = false
            if (icon(short) === null && ICON_ALIAS[short] !== undefined) {
                flip = ICON_ALIAS[short].flip === true
                short = ICON_ALIAS[short].name
            }
            var markup = iconSvg(short, flip)
            if (markup !== '') node.innerHTML = markup
        })
    }

    /**
     * Copy text, tolerating file:// where the async clipboard API is absent.
     * @param text - text to copy.
     * @param button - button to confirm on.
     */
    function copy(text, button) {
        var done = function () {
            if (button == null) return
            var old = button.textContent
            button.textContent = t('actions.copied')
            setTimeout(function () { button.textContent = old }, 1200)
        }
        var fallback = function () {
            var ta = document.createElement('textarea')
            ta.value = text
            ta.style.position = 'fixed'
            ta.style.opacity = '0'
            document.body.appendChild(ta)
            ta.select()
            try { document.execCommand('copy'); done() } catch (e) { /* nothing left to try */ }
            document.body.removeChild(ta)
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, fallback)
        } else { fallback() }
    }

    /**
     * Split a manifest field into list items (the source packs sentences with `；`).
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

    /**
     * Localised label for a component category.
     * @param key - category key.
     * @returns label.
     */
    function categoryLabel(key) {
        var label = t('categories.' + key)
        return label === 'categories.' + key ? (key || '') : label
    }

    /**
     * Localised short title for a spec document.
     * @param spec - spec record.
     * @returns title.
     */
    function specTitle(spec) {
        return (LANG === 'en' ? spec.shortEn : spec.short) || spec.title
    }

    /**
     * Localised display name for a component.
     *
     * The component's own name is English (`EmptyState`), which tells a designer
     * nothing. In Chinese the dictionary carries a plain-language name; the code
     * name is still shown on the page for whoever has to type it.
     * @param c - component record.
     * @returns label.
     */
    function componentLabel(c) {
        if (LANG !== 'zh') return c.name
        var key = 'componentNames.' + c.id
        var label = t(key)
        return label === key ? c.name : label
    }

    /**
     * The badge and one-line explanation for where a component comes from.
     * @param c - component record.
     * @returns html.
     */
    function originNote(c) {
        var kind = c.origin === 'official' ? 'official' : 'proposed'
        return '<p class="origin-note">'
            + badge(t('origin.' + kind), kind === 'official' ? 'safe' : 'warn')
            + '<span>' + esc(t('origin.' + kind + 'Note')) + '</span></p>'
    }

    /* ── theme ─────────────────────────────────────────────────────── */

    var THEME_ICON = { light: 'light', dark: 'dark' }

    /**
     * Apply and reflect the theme.
     * @param mode - `auto`, `light` or `dark`.
     */
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

        /* Show the mode currently in force, not the one a click would reach:
         * an icon beside a control is a state readout first and a button second,
         * and a moon on a light page reads as "you are in dark mode". */
        document.getElementById('themeIcon').innerHTML = iconSvg(effective === 'dark' ? 'dark' : 'light')
        save('dshdr-theme', mode)
    }

    /* ── layout: toggles, widths, drag ─────────────────────────────── */

    var NAV_MIN = 190
    var NAV_MAX = 460
    var ASIDE_MIN = 240
    var ASIDE_MAX = 560

    /**
     * Clamp a width.
     * @param value - proposed width.
     * @param min - lower bound.
     * @param max - upper bound.
     * @returns clamped width.
     */
    function clamp(value, min, max) { return Math.max(min, Math.min(max, value)) }

    /**
     * Read a column's current width from its user variable.
     * @param kind - `nav` or `aside`.
     * @returns width in px.
     */
    function currentWidth(kind) {
        var name = kind === 'nav' ? '--nav-w-user' : '--aside-w-user'
        var fallback = kind === 'nav' ? 268 : 348
        var raw = getComputedStyle(shell).getPropertyValue(name).trim()
        var value = parseFloat(raw)
        return Number.isFinite(value) && value > 0 ? value : fallback
    }

    /**
     * Set a column's user width.
     * @param kind - `nav` or `aside`.
     * @param width - width in px.
     */
    function setWidth(kind, width) {
        shell.style.setProperty(kind === 'nav' ? '--nav-w-user' : '--aside-w-user', width + 'px')
    }

    /** Persist both rail widths. */
    function saveWidths() {
        save('dshdr-nav-w', Math.round(currentWidth('nav')))
        save('dshdr-aside-w', Math.round(currentWidth('aside')))
    }

    /**
     * Show or hide a column.
     * @param kind - `nav` or `aside`.
     * @param visible - whether it should be visible.
     */
    function setColumn(kind, visible) {
        var attr = kind === 'nav' ? 'data-nav' : 'data-aside'
        shell.setAttribute(attr, visible ? 'shown' : 'hidden')
        var col = document.getElementById(kind === 'nav' ? 'colNav' : 'colAside')
        col.setAttribute('data-collapsed', visible ? 'false' : 'true')
        var toggle = document.getElementById(kind === 'nav' ? 'navToggle' : 'asideToggle')
        toggle.setAttribute('aria-pressed', visible ? 'true' : 'false')
        save(kind === 'nav' ? 'dshdr-nav' : 'dshdr-aside', visible ? 'shown' : 'hidden')
    }

    /** Wire the drag handles. */
    function initResizers() {
        Array.prototype.forEach.call(document.querySelectorAll('.resizer'), function (handle) {
            var kind = handle.getAttribute('data-resize')

            handle.addEventListener('pointerdown', function (event) {
                if (event.button !== 0) return
                event.preventDefault()
                var startX = event.clientX
                var startW = currentWidth(kind)
                handle.setAttribute('data-active', 'true')
                shell.setAttribute('data-dragging', 'true')
                document.body.setAttribute('data-resizing', '')
                handle.setPointerCapture(event.pointerId)

                var move = function (ev) {
                    var delta = ev.clientX - startX
                    var next = kind === 'nav' ? startW + delta : startW - delta
                    setWidth(kind, clamp(next, kind === 'nav' ? NAV_MIN : ASIDE_MIN, kind === 'nav' ? NAV_MAX : ASIDE_MAX))
                }
                var up = function () {
                    window.removeEventListener('pointermove', move)
                    window.removeEventListener('pointerup', up)
                    handle.removeAttribute('data-active')
                    shell.removeAttribute('data-dragging')
                    document.body.removeAttribute('data-resizing')
                    saveWidths()
                }
                window.addEventListener('pointermove', move)
                window.addEventListener('pointerup', up)
            })

            /* Keyboard resizing: the handle is focusable, so this must work too. */
            handle.addEventListener('keydown', function (event) {
                var step = event.shiftKey ? 40 : 12
                var min = kind === 'nav' ? NAV_MIN : ASIDE_MIN
                var max = kind === 'nav' ? NAV_MAX : ASIDE_MAX
                if (event.key === 'ArrowLeft') {
                    event.preventDefault()
                    setWidth(kind, clamp(currentWidth(kind) + (kind === 'nav' ? -step : step), min, max))
                    saveWidths()
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault()
                    setWidth(kind, clamp(currentWidth(kind) + (kind === 'nav' ? step : -step), min, max))
                    saveWidths()
                }
            })
        })
    }

    /* ── index (left) ──────────────────────────────────────────────── */

    /** Which navigation groups are open, persisted. */
    var OPEN_GROUPS = (function () {
        try { return JSON.parse(load('dshdr-groups', '{}')) || {} } catch (e) { return {} }
    })()

    /**
     * Build the navigation model for the current page.
     * @param path - current route path.
     * @returns list of groups.
     */
    function navModel(path) {
        var groups = []
        var guidesIn = function (group) { return GUIDES.filter(function (g) { return g.group === group }) }
        var guideLink = function (g) {
            return { href: href('/guide/' + g.id), label: g.title, active: path === '/guide/' + g.id }
        }

        groups.push({
            id: 'start',
            title: t('groups.start'),
            links: guidesIn('start').map(guideLink).concat([
                { href: href('/why'), label: t('index.why'), active: path === '/why' },
                { href: href('/window'), label: t('index.window'), active: path === '/window' },
            ]),
        })

        if (guidesIn('principles').length > 0) {
            groups.push({ id: 'principles', title: t('groups.principles'), links: guidesIn('principles').map(guideLink) })
        }

        if (guidesIn('patterns').length > 0) {
            groups.push({ id: 'patterns', title: t('groups.patterns'), links: guidesIn('patterns').map(guideLink) })
        }

        groups.push({
            id: 'integration',
            title: t('groups.integration'),
            links: guidesIn('integration').map(guideLink).concat([
                { href: href('/seats'), label: t('index.seats'), active: path === '/seats' },
                { href: href('/inventory'), label: t('index.inventory'), active: path === '/inventory' },
            ]),
        })

        var byCategory = {}
        COMPONENTS.forEach(function (c) {
            var cat = c.category || 'uncategorized'
            byCategory[cat] = byCategory[cat] || []
            byCategory[cat].push(c)
        })
        var categories = Object.keys(byCategory).sort()
        if (categories.length > 0) {
            var openId = path.indexOf('/component/') === 0 ? path.slice('/component/'.length) : null
            var componentLinks = [{
                href: href('/components'),
                label: t('index.allComponents'),
                active: path === '/components',
            }].concat(categories.map(function (cat) {
                var holdsOpen = openId !== null && byCategory[cat].some(function (c) { return c.id === openId })
                var key = 'cat-' + cat
                var flag = OPEN_GROUPS[key]
                var open = flag === true || (flag === undefined && holdsOpen)
                return {
                    key: key,
                    href: href('/components/' + cat),
                    label: categoryLabel(cat),
                    active: path === '/components/' + cat,
                    collapsible: true,
                    open: open,
                    children: byCategory[cat].map(function (c) {
                        return { href: href('/component/' + c.id), label: componentLabel(c), active: path === '/component/' + c.id, sub: true }
                    }),
                }
            }))
            groups.push({ id: 'components', title: t('index.components'), links: componentLinks })
        }

        var basics = SPECS.filter(function (s) {
            return ['10-frame-layout', '11-slot-seats', '20-controls', '30-tokens', '40-motion', '50-icons', '60-accessibility'].indexOf(s.id) !== -1
        })
        if (basics.length > 0) {
            groups.push({
                id: 'spec-basics',
                title: t('groups.basics'),
                links: basics.map(function (spec) {
                    return { href: href('/spec/' + spec.id), label: specTitle(spec), active: path === '/spec/' + spec.id }
                }),
            })
        }

        var verifySpecs = SPECS.filter(function (s) { return ['70-checklist', '80-conflicts'].indexOf(s.id) !== -1 })
        groups.push({
            id: 'verify',
            title: t('groups.verify'),
            links: guidesIn('verify').map(guideLink).concat(verifySpecs.map(function (spec) {
                return { href: href('/spec/' + spec.id), label: specTitle(spec), active: path === '/spec/' + spec.id }
            })).concat([
                { href: href('/icons'), label: t('index.icons'), active: path === '/icons' },
                { href: href('/tokens'), label: t('index.tokens'), active: path === '/tokens' },
            ]),
        })

        return groups
    }
    /**
     * One leaf navigation row.
     * @param link - { href, label, count, active, sub }.
     * @returns html.
     */
    function linkRow(link) {
        return '<a class="index__link' + (link.sub === true ? ' index__link--sub' : '') + '" href="' + esc(link.href) + '"'
            + (link.active ? ' aria-current="page"' : '') + '>'
            + '<span class="index__label">' + esc(link.label) + '</span>'
            + (link.count == null ? '' : '<span class="index__count">' + link.count + '</span>')
            + '</a>'
    }

    /**
     * A branch row: the whole row is the fold control.
     *
     * The label used to be a link with a separate chevron button beside it,
     * which made both halves lie: hovering the label did not light the arrow,
     * and clicking the title — the biggest target in the row — navigated
     * instead of folding. A reader who wants the category page gets it from the
     * component index ("查看全部 N"); a reader clicking a branch wants it open.
     *
     * Folded content is rendered and collapsed with `grid-template-rows`, so
     * opening a branch costs no re-render and the animation has something to
     * animate.
     * @param link - { key, label, count, open, children }.
     * @param chevron - chevron SVG markup.
     * @returns html.
     */
    function branchRow(link, chevron) {
        return '<div class="index__branch" data-open="' + link.open + '" data-key="' + esc(link.key) + '">'
            + '<button class="index__link index__row" type="button" aria-expanded="' + link.open + '"'
            + (link.active ? ' aria-current="page"' : '')
            + ' data-branch-toggle aria-label="' + esc(link.label) + '">'
            + '<span class="index__label">' + esc(link.label) + '</span>'
            + (link.count == null ? '' : '<span class="index__count">' + link.count + '</span>')
            + '<span class="index__chevron">' + chevron + '</span>'
            + '</button>'
            + '<div class="index__children"><div>'
            + (link.children || []).map(linkRow).join('')
            + '</div></div></div>'
    }

    /**
     * Render the left index.
     *
     * Groups are plain captions, not foldable headers: a caption that hides its
     * own contents saves vertical space at the cost of hiding the answer to
     * "what is in here". Only the component branches fold, because there the
     * list really is long.
     * @param path - current route path.
     */
    function renderIndex(path) {
        var chevron = iconSvg('chevron-down')
        indexEl.innerHTML = navModel(path).map(function (group) {
            return '<div class="index__group">'
                + '<p class="index__title">' + esc(group.title) + '</p>'
                + group.links.map(function (link) {
                    return link.collapsible === true ? branchRow(link, chevron) : linkRow(link)
                }).join('')
                + '</div>'
        }).join('')

        Array.prototype.forEach.call(indexEl.querySelectorAll('[data-branch-toggle]'), function (button) {
            button.addEventListener('click', function () {
                var branch = button.closest('.index__branch')
                var open = branch.getAttribute('data-open') !== 'true'
                branch.setAttribute('data-open', String(open))
                button.setAttribute('aria-expanded', String(open))
                OPEN_GROUPS[branch.getAttribute('data-key')] = open
                save('dshdr-groups', JSON.stringify(OPEN_GROUPS))
            })
        })
    }

    /* ── aside (right) ─────────────────────────────────────────────── */

    /**
     * Render the rationale column.
     *
     * A rationale column with nothing to say should not be on screen. File paths
     * and character counts are metadata, not rationale — they tell a reader
     * nothing they need while reading — so they do not count as content here, and
     * a page carrying only metadata collapses the column and hides its toggle.
     * @param blocks - array of { title, html }.
     */
    function renderAside(blocks) {
        var useful = (blocks || []).filter(function (block) {
            return block && typeof block.html === 'string' && block.html.replace(/<[^>]*>/gu, '').trim() !== ''
        })
        var toggle = document.getElementById('asideToggle')
        if (useful.length === 0) {
            asideEl.innerHTML = ''
            setColumn('aside', false)
            toggle.hidden = true
            return
        }
        toggle.hidden = false
        asideEl.innerHTML = useful.map(function (block) {
            return '<section class="aside__block"><p class="aside__title">' + esc(block.title) + '</p>' + block.html + '</section>'
        }).join('')
    }

    /**
     * A paragraph block.
     * @param text - text.
     * @returns html.
     */
    function p(text) { return '<p>' + esc(text) + '</p>' }

    /**
     * A list block.
     * @param items - items.
     * @returns html.
     */
    function ul(items) {
        if (items == null || items.length === 0) return ''
        return '<ul>' + items.map(function (text) { return '<li>' + esc(text) + '</li>' }).join('') + '</ul>'
    }

    /**
     * A list of internal links.
     * @param items - [{ label, hash }].
     * @returns html.
     */
    function ulLinks(items) {
        if (items == null || items.length === 0) return ''
        return '<ul>' + items.map(function (item) {
            return '<li><a href="' + esc(href(item.hash)) + '">' + esc(item.label) + '</a></li>'
        }).join('') + '</ul>'
    }

    /* ── shared blocks ─────────────────────────────────────────────── */

    /**
     * A code block with a copy control and an optional fold.
     *
     * Source is folded by default on component pages: an electronic manual reads
     * best when the specimen and its rationale come first and the listing is
     * available rather than mandatory.
     * @param label - caption.
     * @param code - source text.
     * @param options - { folded }.
     * @returns html.
     */
    function codeBlock(label, code, options) {
        var folded = options !== undefined && options.folded === true
        return '<div class="code"' + (folded ? ' data-fold="true"' : '') + '>'
            + '<div class="code__head"><span>' + esc(label) + '</span>'
            + '<span class="code__actions">'
            + (folded ? '<button class="code__toggle" type="button" data-fold-toggle>' + esc(t('actions.expand')) + '</button>' : '')
            + '<button class="copy" type="button" data-copy>' + esc(t('actions.copy')) + '</button>'
            + '</span></div>'
            + '<pre><code>' + esc(code) + '</code></pre>'
            + '</div>'
    }

    /* ── specimens ─────────────────────────────────────────────────── */

    /** Demo documents for the current render, keyed by the stage that hosts them. */
    var DEMOS = {}
    var demoSeq = 0

    /**
     * Rewrite a standalone demo document so it survives inside a shadow root.
     *
     * A demo is authored as a complete HTML page (`:root` tokens, a `body` box),
     * and neither selector matches anything inside a shadow tree — so the tokens
     * would be lost and the component would render unstyled. Both become `:host`,
     * which is the shadow tree's equivalent of "the element that contains us".
     * @param demoHtml - the demo document.
     * @returns markup suitable for `shadowRoot.innerHTML`.
     */
    function toShadowMarkup(demoHtml) {
        /* The prefix guard excludes `.`, `#` and `-` as well as word characters:
         * `.body {` is a class selector, and rewriting it to `.:host {` yields an
         * invalid selector that the CSS parser **drops silently** — the rule
         * disappears and the demo quietly loses its geometry. Measured: four
         * demos were losing padding and min-width that way. A selector only
         * counts when it is followed by `{` or `,`. */
        return String(demoHtml).replace(/(^|[^\w<>/#.-])(:root|html|body)(?=\s*[,{])/gu, function (_m, prefix) {
            return prefix + ':host'
        })
    }

    /**
     * A specimen stage holding a live demo.
     *
     * The demo renders into a **shadow root**, not an iframe. An iframe was the
     * obvious choice until the site was opened from disk: under `file://` every
     * document is its own opaque origin, so the parent may not read the frame's
     * height nor measure its content, and the preview silently degrades. A shadow
     * root needs no measuring — the content participates in normal layout — and
     * it still isolates the demo's styles from the page.
     * @param title - caption.
     * @param demoHtml - the demo document.
     * @returns html.
     */
    function specimen(title, demoHtml, evidence, withheld) {
        if (demoHtml == null || demoHtml === '') {
            if (withheld !== true) return ''
            return '<div class="specimen specimen--withheld"><div class="demo__withheld"><strong>'
                + esc(t('components.withheldLabel')) + '</strong><p>'
                + esc((evidence && evidence.reason) || t('components.withheldText')) + '</p></div></div>'
        }
        if (evidence == null || ['verified', 'source-verified'].indexOf(evidence.status) === -1) return ''
        var id = 'demo-' + (demoSeq++)
        DEMOS[id] = demoHtml
        var proof = evidence.status === 'source-verified'
            ? t('components.sourceVerifiedNote')
            : t('components.screenshotCheckedNote')
        return '<div class="specimen"><p class="specimen__label"><span>' + esc(title) + '</span></p>'
            + '<div class="specimen__stage" data-demo-id="' + id + '"></div>'
            + '<p class="specimen__proof">' + esc(proof) + '</p></div>'
    }
    /**
     * The style every shadow-hosted document starts from.
     *
     * Appended AFTER the embedded document so it wins the tie: the document
     * still owns its canvas colour, while the page owns the type and the text
     * colour, and no extra frame is wrapped around it.
     *
     * `position: relative` + `contain: layout` are load-bearing, not decoration.
     * A shadow root is not a containing block by itself, so a demo that writes
     * `position: fixed; inset: 0` (Modal, Toast) covered the *whole site window*
     * with its mask, and a demo's visually-hidden checkbox landed at the top of
     * the document — clicking its label then scrolled a column by ~950px, which
     * reads as "the page went blank". Layout containment makes the stage the
     * containing block for absolutely and fixed positioned descendants, so a
     * demo's overlays stay inside the demo. Verified in a real browser: see
     * `scripts/audit-demos.mjs`.
     */
    var SHADOW_RESET = '<style>'
        + ':host{display:block;position:relative;contain:layout;font-family:var(--site-font);font-size:var(--site-text-body);color:var(--site-label)}'
        + ':host *{box-sizing:border-box}'
        + '</style>'

    /**
     * Mount one product-shell instance into a shadow root.
     *
     * Two shapes reach this function, and both end with the replica rendering
     * into the same root as the stylesheet that positions it:
     *   - a demo document that declares `<div data-shell="…">` inside its own
     *     markup → the demo's stage gets a root, the replica mounts there;
     *   - a page that declares the replica directly → the `[data-shell]` element
     *     is handed to `DSHShell.mount`, which gives it a root of its own.
     * Handing a demo's nested `[data-shell]` element a root of its own (what
     * `mountShells` used to do) put the replica one boundary deeper than the
     * demo's stylesheets, and it rendered as an unstyled 3159px stack of blocks.
     * @param host - the stage element (document form) or the `[data-shell]` element.
     * @param markup - the demo document, when there is one.
     * @param options - parsed `data-shell` attributes for the document form.
     * @param shellStylesInjected - true when `host` is the `[data-shell]` element itself.
     */
    function mountShellInTree(host, markup, options, shellStylesInjected) {
        var shadow
        if (shellStylesInjected === true) {
            /* `host` is the `[data-shell]` element itself (a page declares the
             * replica directly). `DSHShell.mount` attaches the root, renders into
             * it and wires it in one call. */
            window.DSHShell.mount(host, {
                css: D.shellCss || '',
                icon: function (name) { return iconSvg(name) },
                chrome: D.chrome || { icons: {}, header: [] },
                esc: esc,
                brandMark: (D.brand && D.brand.fish) || '',
                left: options.left === 'closed' ? 'closed' : 'open',
                right: options.right === 'open' ? 'open' : 'closed',
                highlight: options.highlight || null,
                highlightOnHover: options.hover === true,
                docks: options.docks === true,
                sidebarOnly: options.sidebarOnly === true,
            })
            return
        }
        /* A demo document declares the replica inside its own markup, so the
         * replica is mounted where it stands. The stylesheet goes in through
         * `DSHShell.mount` itself: a `<style>` appended by hand here came back
         * empty once the shell was nested one level deeper (measured: 0 rules in
         * the nested root, so `.sh-root` computed to `transform: none` and the
         * rail laid out at 894px instead of 280). */
        shadow = host.attachShadow({ mode: 'open' })
        shadow.innerHTML = toShadowMarkup(markup) + SHADOW_RESET
        var shell = shadow.querySelector('[data-shell]')
        if (shell === null) return
        var config = {}
        try { config = JSON.parse(shell.getAttribute('data-shell') || '{}') } catch (e) { config = {} }
        window.DSHShell.mount(shell, {
            css: D.shellCss || '',
            icon: function (name) { return iconSvg(name) },
            chrome: D.chrome || { icons: {}, header: [] },
            esc: esc,
            brandMark: (D.brand && D.brand.fish) || '',
            left: config.left === 'closed' ? 'closed' : 'open',
            right: config.right === 'open' ? 'open' : 'closed',
            highlight: config.highlight || null,
            highlightOnHover: config.hover === true,
            docks: config.docks === true,
            sidebarOnly: config.sidebarOnly === true,
        })
    }

    /**
     * Mount every product-shell instance a document declares.
     *
     * A document asks for one with `data-shell='{"highlight":"composer"}'`. The
     * shell renders into its own shadow root, so its styles cannot leak into the
     * page and the page's cannot leak into it.
     * @param root - subtree to scan; a shadow root works too.
     */
    function mountShells(root) {
        if (window.DSHShell === undefined) return
        Array.prototype.forEach.call(root.querySelectorAll('[data-shell]'), function (shell) {
            if (shell.shadowRoot !== null && shell.shadowRoot !== undefined) return
            var shellOptions = {}
            try { shellOptions = JSON.parse(shell.getAttribute('data-shell') || '{}') } catch (e) { shellOptions = {} }
            mountShellInTree(shell, '', shellOptions, true)
        })
    }

    /**
     * Mount every staged demo into its own shadow root.
     *
     * Two kinds share this path: the component specimens collected from each
     * component's own demo.html, and the demos a spec document embeds with a
     * `demo:` marker comment. (The marker is never spelled out literally here:
     * an HTML comment opener inside a classic script is parsed as a comment
     * start, which silently truncates the file.)
     * @param root - subtree to scan.
     */
    function mountDemos(root) {
        /**
         * Translate a specimen's own copy, and mark the strings that are not ours.
         *
         * A demo is one file for both languages because its geometry and CSS are
         * shared (`docs/I18N.md` §5). Copy *we* wrote carries `data-t` and is
         * replaced here. Copy copied verbatim off the running product carries
         * `data-capture`: it stays exactly as captured — the SPEC's geometry was
         * checked against a screenshot of that string — and it is tagged
         * `lang="zh-CN"` so fonts, hyphenation and screen readers treat it as the
         * Chinese quotation it is. Nothing is inserted around it: the specimen's
         * box geometry is part of what the page is asserting.
         * @param scope - the mounted shadow root.
         */
        var localize = function (scope) {
            Array.prototype.forEach.call(scope.querySelectorAll('[data-t]'), function (node) {
                var key = node.getAttribute('data-t')
                var text = t(key)
                if (text !== key) node.textContent = text
            })
            Array.prototype.forEach.call(scope.querySelectorAll('[data-capture]'), function (node) {
                node.setAttribute('lang', 'zh-CN')
            })
        }

        /**
         * Fill one host with its document.
         * @param host - the stage element.
         * @param html - the embedded document.
         */
        var mount = function (host, html) {
            /* A demo document whose markup *is* a product replica is mounted
             * with the shell stylesheet already part of the same shadow root, so
             * the replica renders where it stands instead of into a nested root.
             * The test has to look at the structure, not at the string: several
             * demos (`seat-map`, `session-tabs`) *contain* a replica inside a
             * larger demo, and their own script still has to run against the
             * demo's shadow root. */
            var probe = document.createElement('template')
            probe.innerHTML = toShadowMarkup(html)
            var only = probe.content.children.length === 1 ? probe.content.firstElementChild : null
            if (only !== null && only.getAttribute('data-shell') !== null) {
                mountShellInTree(host, html, null, false)
                return
            }
            var shadow = host.attachShadow({ mode: 'open' })
            shadow.innerHTML = toShadowMarkup(html) + SHADOW_RESET
            /* `[data-icon]` 占位符在 demo 里也管用：`hydrateIcons` 走的是
             * querySelectorAll，不会穿过 shadow 边界，所以每个 demo 自己的根要单独喂一次。
             * 有了它，demo 不用把官方图标再抄一份进来。 */
            hydrateIcons(shadow)
            localize(shadow)
            /* `innerHTML` never executes a `<script>`, so an embedded demo would
             * be a picture of an interaction rather than an interaction. The
             * nodes are rebuilt so the demo can actually be operated.
             *
             * A rebuilt script executes *inside the shadow root*, where
             * `document.querySelector` cannot see its own markup — the first
             * version of every interactive demo silently did nothing for exactly
             * this reason. So the root is published on `window` for the duration
             * of the mount, and a demo script starts with
             * `var root = window.__DSH_DEMO_ROOT || document`. */
            var previousRoot = window.__DSH_DEMO_ROOT
            window.__DSH_DEMO_ROOT = shadow
            Array.prototype.forEach.call(shadow.querySelectorAll('script'), function (old) {
                var fresh = document.createElement('script')
                for (var i = 0; i < old.attributes.length; i++) {
                    fresh.setAttribute(old.attributes[i].name, old.attributes[i].value)
                }
                fresh.textContent = old.textContent
                old.parentNode.replaceChild(fresh, old)
            })
            window.__DSH_DEMO_ROOT = previousRoot
            mountShells(shadow)
        }

        Array.prototype.forEach.call(root.querySelectorAll('[data-demo-id]'), function (host) {
            var html = DEMOS[host.getAttribute('data-demo-id')]
            if (html !== undefined) mount(host, html)
        })

        Array.prototype.forEach.call(root.querySelectorAll('[data-inline-demo]'), function (host) {
            var html = (D.demos || {})[host.getAttribute('data-inline-demo')]
            if (html !== undefined) mount(host, html)
        })
    }

    /**
     * A badge.
     * @param text - label.
     * @param tone - modifier suffix.
     * @returns html.
     */
    /**
     * The "guide / spec" switch.
     *
     * Two audiences, two documents. The guide answers "should I reach for
     * this?", the spec answers "what exactly is it?" — shown at once, the second
     * buries the first.
     * @returns html.
     */
    function docSwitch() {
        return '<div class="doc-switch"><div class="segmented" data-doc-switch>'
            + '<button type="button" data-doc="readme" aria-selected="true">' + esc(t('components.docHuman')) + '</button>'
            + '<button type="button" data-doc="spec" aria-selected="false">' + esc(t('components.docSpec')) + '</button>'
            + '</div></div>'
    }

    /**
     * A badge.
     * @param text - label.
     * @param tone - modifier suffix.
     * @returns html.
     */
    function badge(text, tone) {
        return '<span class="badge badge--' + tone + '">' + esc(text) + '</span>'
    }

    /**
     * A breadcrumb trail with a back control.
     *
     * Every drill-down page keeps a visible position and one-click way back: a
     * manual that only moves forward is a manual people get lost in.
     * @param items - [{ label, hash }], the last being the current page.
     * @param backHref - route the back control returns to.
     * @returns html.
     */
    function crumbs(items, backHref) {
        return '<nav class="crumbs" aria-label="breadcrumb">'
            + (backHref === undefined
                ? ''
                : '<button class="crumbs__back" type="button" data-back="' + esc(backHref) + '" data-tip="' + esc(t('actions.back')) + '">'
                  + iconSvg('chevron-left') + '</button>')
            + items.map(function (item, i) {
                if (i === items.length - 1 || item.hash === undefined) {
                    return '<span class="crumbs__current">' + esc(item.label) + '</span>'
                }
                return '<a href="' + esc(href(item.hash)) + '">' + esc(item.label) + '</a><span class="crumbs__sep">/</span>'
            }).join('')
            + '</nav>'
    }

    /* ── pages ─────────────────────────────────────────────────────── */

    /** The landing page. */
    function pageHome() {
        var s = D.stats || {}
        mainEl.innerHTML = '<div class="main-inner">'
            + '<div class="hero">'
            + '<p class="hero__eyebrow">' + esc(t('home.eyebrow')) + '</p>'
            + '<h1 class="hero__title">' + t('home.title') + '</h1>'
            + '<p class="hero__lede">' + esc(t('home.lede')) + '</p>'
            + '</div>'
            + '<section class="section">'
            + '<div class="section__head"><h2 class="section__title">' + esc(t('home.sectionTitle')) + '</h2>'
            + '<span class="section__hint">' + esc(t('home.sectionHint')) + '</span></div>'
            + '<div class="cards">' + GUIDES.map(function (guide) {
                return '<a class="card" href="' + esc(href('/guide/' + guide.id)) + '">'
                    + '<p class="card__meta">' + esc(t('groups.' + guide.group)) + '</p>'
                    + '<p class="card__title">' + esc(guide.title) + '</p>'
                    + '<p class="card__body">' + esc(guide.summary) + '</p>'
                    + '</a>'
            }).join('') + '</div></section>'
            + '<section class="section">'
            + '<div class="section__head"><h2 class="section__title">' + esc(t('home.indexTitle')) + '</h2>'
            + '<span class="section__hint">' + esc(t('home.indexHint')) + '</span></div>'
            + '<div class="cards">'
            + card('home.cards.spec', (s.specs || 0) + ' ' + t('components.count'), '/spec')
            + card('home.cards.components', (s.components || 0) + ' ' + t('components.count'), '/components')
            + card('home.cards.seats', (s.seats || 0) + ' ' + t('components.count'), '/seats')
            + card('home.cards.icons', (s.icons || 0) + ' ' + t('components.count'), '/icons')
            + card('home.cards.tokens', (s.aliases || 0) + ' ' + t('components.count'), '/tokens')
            + '</div></section>'
            + familySection()
            + '</div>'

        renderAside([])
    }

    /**
     * The other half of the set.
     *
     * This site is the spec; the plugin is what makes it true inside the running
     * product, and a reader who only finds the spec has half of the answer. The
     * members and their URLs come from `data/family.json`, the wording from the
     * dictionary — the runtime repository can move without a template edit.
     * @returns html, or an empty string when the data file is absent.
     */
    function familySection() {
        var members = (D.family || {}).members || []
        if (members.length === 0) return ''
        return '<section class="section">'
            + '<div class="section__head"><h2 class="section__title">' + esc(t('set.title')) + '</h2>'
            + '<span class="section__hint">' + esc(t('set.hint')) + '</span></div>'
            + '<div class="cards">' + members.map(function (member) {
                var prefix = 'set.cards.' + member.id
                return '<a class="card" href="' + esc(member.url) + '" rel="noopener">'
                    + '<p class="card__meta">' + esc(t(prefix + '.role')) + '</p>'
                    + '<p class="card__title">' + esc(t(prefix + '.title')) + '</p>'
                    + '<p class="card__body">' + esc(t(prefix + '.body')) + '</p>'
                    + '<p class="card__meta">' + esc(t(prefix + '.note')) + '</p>'
                    + '</a>'
            }).join('') + '</div></section>'
    }

    /**
     * A landing card built from an i18n prefix.
     * @param prefix - i18n prefix, e.g. `home.cards.spec`.
     * @param meta - small meta line.
     * @param hash - target route.
     * @returns html.
     */
    function card(prefix, meta, hash) {
        return '<a class="card" href="' + esc(href(hash)) + '">'
            + '<p class="card__title">' + esc(t(prefix + '.title')) + '</p>'
            + '<p class="card__body">' + esc(t(prefix + '.body')) + '</p>'
            + '<p class="card__meta">' + (meta === '' ? '' : esc(meta) + ' · ') + esc(t(prefix + '.note')) + '</p>'
            + '</a>'
    }

    /** The positioning page. */
    function pageWhy() {
        mainEl.innerHTML = '<div class="main-inner">'
            + '<div class="hero"><p class="hero__eyebrow">' + esc(t('groups.start')) + '</p><h1 class="hero__title">' + esc(t('why.title')) + '</h1>'
            + '<p class="hero__lede">' + esc(t('why.lede')) + '</p></div>'
            + '<section class="section"><div class="prose">'
            + '<h2>' + esc(t('why.officialTitle')) + '</h2>'
            + '<ul>'
            + '<li>' + esc(t('why.items.tokens')) + '</li>'
            + '<li>' + esc(t('why.items.primitives')) + '</li>'
            + '<li>' + esc(t('why.items.seats')) + '</li>'
            + '<li>' + esc(t('why.items.icons')) + '</li>'
            + '</ul>'
            + '<h2>' + esc(t('why.missingTitle')) + '</h2>'
            + '<ul>'
            + gap('layout') + gap('order') + gap('motion') + gap('iconGeometry') + gap('conflict')
            + '</ul>'
            + '<h2>' + esc(t('why.proofTitle')) + '</h2>'
            + '<div class="callout callout--warn"><span class="callout__mark">!</span><div>'
            + '<p><code>shell.overlay</code> — ' + esc(t('why.proof.overlay')) + '</p>'
            + '<p><code>settings.section</code> — ' + esc(t('why.proof.settings')) + '</p>'
            + '</div></div>'
            + '<p>' + esc(t('why.closing')) + '</p>'
            + '<h2>' + esc(t('why.scopeTitle')) + '</h2>'
            + '<ul>'
            + '<li>' + esc(t('why.items.aesthetics')) + '</li>'
            + '<li>' + esc(t('why.items.force')) + '</li>'
            + '<li>' + esc(t('why.items.invent')) + '</li>'
            + '</ul>'
            + '</div></section></div>'

        renderAside([
            { title: t('why.proofTitle'), html: p(t('why.asideNote')) },
            { title: t('index.resources'), html: ul([t('index.seats'), t('index.icons'), t('index.tokens')]) },
        ])
    }

    /**
     * One table per region: band, what you see, official seat, extendable.
     *
     * The rows are the same facts as `spec/05-region-map.md` §2–§5, kept here as
     * data because this page is the "recognise the screen first" entry: the
     * reader should be able to name a band before any seat name is mentioned.
     * @param id - which region.
     * @returns an object keyed by language.
     */
    function windowParts(id) {
        var parts = {
            left: {
                zh: [
                    ['品牌行', '标志与产品名', 'sidebar.brand.mark /.name', '宿主 single'],
                    ['全局面板入口', '「插件」「自动化任务」', 'sidebar.panellist', '可追加'],
                    ['工作区与会话列表', '工作区、会话列表、搜索', 'sidebar.workspaces', '宿主 single'],
                    ['会话行的悬停动作', '每行末尾的按钮与「…」菜单', 'sidebar.workspaces.session.row.action', '可追加'],
                    ['底部：设置入口', '「设置」', 'sidebar.settings', '宿主 single'],
                    ['底部：扩展动作区', '没有插件时是空的', 'sidebar.footer.action', '可追加'],
                ],
                en: [
                    ['Brand row', 'Mark and product name', 'sidebar.brand.mark /.name', 'Host single'],
                    ['Global panel entries', 'Plugins, Automated tasks', 'sidebar.panellist', 'Extendable'],
                    ['Workspaces and sessions', 'Workspaces, session list, search', 'sidebar.workspaces', 'Host single'],
                    ['Row hover actions', 'Buttons and the ... menu at each row end', 'sidebar.workspaces.session.row.action', 'Extendable'],
                    ['Footer: settings', 'Settings', 'sidebar.settings', 'Host single'],
                    ['Footer: action area', 'Empty with no plugins installed', 'sidebar.footer.action', 'Extendable'],
                ],
            },
            middle: {
                zh: [
                    ['常驻导航头', '会话标题左边的全局导航；没有选中会话时也在', 'conversation.header.leading', '宿主'],
                    ['会话头', '标题、标题旁动作、右对齐工具行、最右角', 'conversation.session.header.actions / .utilities / .corner', '工具行可追加'],
                    ['视图区', '「对话 / 轨迹 / 上下文」这类会话视图，一次渲染一个', 'conversation.view → conversation.session', '可注册视图'],
                    ['输入卡', '输入框与它的工具行', 'conversation.composer.bar → conversation.input.left / .right', '左右两个 list 可追加'],
                    ['输入卡上下的插入点', '卡上方、卡下方、卡内浮层', 'conversation.input.dock / composer.dock / input.overlay', '可追加'],
                ],
                en: [
                    ['Persistent nav header', 'Global navigation left of the title; present with no session selected', 'conversation.header.leading', 'Host'],
                    ['Session head', 'Title, title-side actions, right-aligned tool row, far corner', 'conversation.session.header.actions / .utilities / .corner', 'Tool row extendable'],
                    ['View area', 'Conversation views such as Conversation / Trajectory / Context; one renders at a time', 'conversation.view → conversation.session', 'Registerable view'],
                    ['Input card', 'The box and its tool row', 'conversation.composer.bar → conversation.input.left / .right', 'Both lists extendable'],
                    ['Insertion points', 'Above the card, below the card, inside it as an overlay', 'conversation.input.dock / composer.dock / input.overlay', 'Extendable'],
                ],
            },
            right: {
                zh: [
                    ['轨道本体', '第 4 列本身，中栏为它让出宽度', 'rightbar', '替代点'],
                    ['会话内容区', '当前会话在右栏里的内容', 'rightbar.session', '替代点'],
                    ['页签正文与标题', '上下文、文件、预览这些页签', 'sidebar.right.pane.tab / .tab.title', '按 key 分发'],
                    ['页签菜单尾部项', '页签「…」菜单里的追加项', 'sidebar.right.tab.menu.item', '可追加'],
                    ['文件页签的动作', '文件树页签里的动作位', 'sidebar.right.tab.files.actions', '可追加'],
                    ['文档预览页签的动作', '预览页签里的动作位', 'sidebar.right.tab.document.actions', '可追加'],
                    ['展开 / 收起开关', '会话头最右角', 'conversation.session.header.corner', '已被占用'],
                ],
                en: [
                    ['The track itself', 'The fourth column; the centre makes room for it', 'rightbar', 'Replacement point'],
                    ['Session content', 'What the current session shows in the column', 'rightbar.session', 'Replacement point'],
                    ['Tab body and title', 'Context, files, previews', 'sidebar.right.pane.tab / .tab.title', 'Dispatched by key'],
                    ['Tab menu tail items', 'Additions to a tab ... menu', 'sidebar.right.tab.menu.item', 'Extendable'],
                    ['File tab actions', 'Action slots inside the file-tree tab', 'sidebar.right.tab.files.actions', 'Extendable'],
                    ['Document tab actions', 'Action slots inside the preview tab', 'sidebar.right.tab.document.actions', 'Extendable'],
                    ['Open / close control', 'The session head far corner', 'conversation.session.header.corner', 'Already occupied'],
                ],
            },
            unofficial: {
                zh: [
                    ['中栏正文两侧的留白带', '无', '社区借道其他座位实现'],
                    ['被当作面板用的 conversation.input.overlay', '有，但用途是「输入卡内的浮层」', '被当作中栏面板使用'],
                    ['独立插件设置窗口入口', '无', '用 settings.section 落到宿主设置窗口'],
                    ['全局顶栏 / 窗口级命令栏', '无', '不存在；shell.overlay 是浮层不是栏'],
                ],
                en: [
                    ['The bands beside the reading column', 'None', 'The community borrows another seat'],
                    ['conversation.input.overlay used as a panel', 'Exists, but means "overlay inside the input card"', 'Used as a centre-column panel'],
                    ['An entry for a plugin\'s own settings window', 'None', 'Use settings.section inside the host settings window'],
                    ['A global top bar / window-level command bar', 'None', 'It does not exist; shell.overlay is an overlay, not a bar'],
                ],
            },
        }
        return parts[id][LANG === 'en' ? 'en' : 'zh']
    }

    /**
     * The window-structure page: one screen, region by region.
     *
     * This is the page a plugin author should read before any seat name is
     * useful — the author's first question is "what is this screen made of",
     * not "which seat do I register".
     */
    function pageWindow() {
        var columns = {
            part: t('window.columns.part'),
            what: t('window.columns.what'),
            seat: t('window.columns.seat'),
            append: t('window.columns.append'),
        }
        /** One region table. */
        var table = function (id) {
            return '<table><thead><tr><th>' + esc(columns.part) + '</th><th>' + esc(columns.what)
                + '</th><th>' + esc(columns.seat) + '</th><th>' + esc(columns.append) + '</th></tr></thead><tbody>'
                + windowParts(id).map(function (row) {
                    return '<tr><td>' + esc(row[0]) + '</td><td>' + esc(row[1]) + '</td><td><code>' + esc(row[2]) + '</code></td><td>' + esc(row[3]) + '</td></tr>'
                }).join('')
                + '</tbody></table>'
        }
        var section = function (title, hint, id) {
            return '<h2>' + esc(title) + '</h2><p class="window__hint">' + esc(hint) + '</p>' + table(id)
        }

        mainEl.innerHTML = '<div class="main-inner">'
            + '<div class="hero">'
            + '<p class="hero__eyebrow">' + esc(t('groups.start')) + '</p>'
            + '<h1 class="hero__title">' + esc(t('window.title')) + '</h1>'
            + '<p class="hero__lede">' + esc(t('window.lede')) + '</p>'
            + '</div>'
            + '<section class="section">'
            + '<div class="window__split">'
            + '<figure class="window__figure">'
            + '<figcaption class="window__figureTitle">' + esc(t('window.liveTitle')) + '</figcaption>'
            + '<div class="window__stage" style="display:block;border:1px solid var(--site-line-soft);overflow:hidden;background:var(--site-bg-sunken)" data-shell=\'{"hover":true,"highlight":"left","right":"closed"}\'></div>'
            + '<p class="window__note">' + esc(t('window.liveNote')) + '</p>'
            + '</figure>'
            + '<div class="prose window__rails">'
            + section(t('window.leftTitle'), t('window.leftHint'), 'left')
            + section(t('window.middleTitle'), t('window.middleHint'), 'middle')
            + '</div>'
            + '</div>'
            + '</section>'
            + '<section class="section"><div class="prose">'
            + section(t('window.rightTitle'), t('window.rightHint'), 'right')
            + '</div></section>'
            + '<section class="section"><div class="prose">'
            + section(t('window.unofficialTitle'), t('window.unofficialHint'), 'unofficial')
            + '<p><a class="window__link" href="' + esc(href('/spec/05-region-map')) + '">' + esc(t('window.openSpec')) + '</a></p>'
            + '</div></section>'
            + '</div>'

        /* The page declares a product replica directly, so it is mounted from
         * here rather than through a demo stage. */
        var stage = mainEl.querySelector('.window__stage')
        if (stage !== null) mountShells(mainEl)

        renderAside([
            { title: t('window.unofficialTitle'), html: p(t('window.unofficialHint')) },
            { title: t('index.spec'), html: ul([t('index.seats'), t('index.inventory')]) },
        ])
    }


    /**
     * How much of one document group exists in the reader's language.
     *
     * Untranslated documents are absent from the English site rather than shown
     * in Chinese, which is honest but leaves the reader wondering why the list is
     * short. The count is computed by the generator (`i18nCoverage`), never
     * written down here, so it cannot go stale.
     * @param kind - `specs`, `guides` or `components`.
     * @returns html, or an empty string in Chinese and when nothing is missing.
     */
    function coverageNote(kind) {
        var counts = (D.i18nCoverage || {})[kind]
        if (!counts || counts.translated === counts.total) return ''
        return '<div class="callout"><span class="callout__mark">i</span><div><p>'
            + esc(t('coverage.line', {
                translated: counts.translated,
                total: counts.total,
                kind: t('coverage.kind.' + kind),
            }))
            + '</p></div></div>'
    }

    /**
     * Localised name of the plugin that drew an element.
     *
     * Most families are already named by their package (`dsh-widgets`), which
     * reads the same in both languages. The few that describe the owner in words
     * go through the table's `pluginNamesEn` map, so the label is translated
     * without duplicating the family list.
     * @param name - the family's `plugin` value.
     * @returns the label for the current language.
     */
    function pluginLabel(name) {
        if (LANG !== 'en') return name
        return (ANCHORS.pluginNamesEn || {})[name] || name
    }

    /**
     * One thing the product does not answer, as a claim plus its explanation.
     *
     * The claim is what the reader has already seen happen; the explanation says
     * why it happens. Both sentences live in the dictionary so each language can
     * phrase them its own way.
     * @param id - gap id, e.g. `layout`.
     * @returns html.
     */
    function gap(id) {
        return '<li><strong>' + esc(t('why.gaps.' + id + 'Claim')) + '</strong> '
            + esc(t('why.gaps.' + id + 'Body')) + '</li>'
    }

    /**
     * A guide page: one author task, start to finish.
     *
     * Guides exist because a spec answers "what is the rule" while an author
     * arrives with "my plugin needs to add a row to the settings page — what do
     * I do". Same evidence, different order: task first, rule second.
     * @param id - guide id, or null for the index.
     */
    function pageGuide(id) {
        if (id == null || GUIDES.filter(function (g) { return g.id === id }).length === 0) { pageNotFound(); return }
        var guide = GUIDES.filter(function (g) { return g.id === id })[0]

        var body = guide.html
        var head = /<h1 id="h\d+">([\s\S]*?)<\/h1>/u.exec(body)
        var titleHtml = head === null ? esc(guide.title) : head[1]
        if (head !== null) body = body.slice(0, head.index) + body.slice(head.index + head[0].length)
        if (guide.summary !== '') {
            body = body.replace(/<blockquote>\s*<p>[\s\S]*?<\/p>\s*<\/blockquote>\s*/u, '')
        }
        if (guide.tasks.length > 0 && guide.tasksHeading) {
            /* The task list is lifted into the page head below, so the copy still
             * inside the body has to go. The heading text comes from the data,
             * not from a regex that knows Chinese. */
            var escapeRe = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&') }
            body = body.replace(
                new RegExp('<h2 id="[^"]+">' + escapeRe(guide.tasksHeading) + '</h2>\\s*<ul>[\\s\\S]*?</ul>\\s*', 'u'),
                '',
            )
        }

        var outline = []
        var re = /<h([23]) id="([^"]+)">([^<]*)<\/h\1>/gu
        var m
        while ((m = re.exec(body)) !== null) outline.push({ level: Number(m[1]), id: m[2], text: m[3] })

        var siblings = GUIDES.filter(function (g) { return g.group === guide.group && g.id !== guide.id })

        mainEl.innerHTML = '<div class="main-inner">'
            + '<div class="doc-head">'
            + '<p class="doc-head__eyebrow">' + esc(t('groups.' + guide.group)) + '</p>'
            + '<h1 class="doc-head__title">' + titleHtml + '</h1>'
            + (guide.summary === '' ? '' : '<p class="doc-head__lede">' + esc(guide.summary) + '</p>')
            + (guide.tasks.length === 0 ? '' : '<div class="doc-head__tasks-wrap"><p class="doc-head__tasks-label">' + esc(t('guide.taskLabel')) + '</p>'
                + '<ul class="doc-head__tasks">' + guide.tasks.map(function (task) {
                    return '<li>' + esc(task) + '</li>'
                }).join('') + '</ul></div>')
            + '</div>'
            + '<article class="prose">' + body + '</article>'
            + '</div>'

        /* 右栏只在能提供独立价值时出现：页内目录（长文才给）与同组的下一条任务。
         * 不复制正文、不放字数、不放采集时间。 */
        renderAside([
            outline.length >= 4 ? {
                title: t('spec.outline'),
                html: '<ul class="outline">' + outline.map(function (item) {
                    return '<li class="outline__item outline__item--h' + item.level + '">'
                        + '<a href="' + esc(href('/guide/' + guide.id)) + '" data-jump="' + esc(item.id) + '">'
                        + esc(item.text) + '</a></li>'
                }).join('') + '</ul>',
            } : null,
            siblings.length > 0 ? {
                title: t('groups.' + guide.group),
                html: ulLinks(siblings.map(function (g) { return { label: g.title, hash: '/guide/' + g.id } })),
            } : null,
        ].filter(Boolean))
    }

    /**
     * The spec list, or one document.
     * @param id - document id, when selected.
     */
    function pageSpec(id) {
        if (id == null) {
            mainEl.innerHTML = '<div class="main-inner"><div class="hero"><h1 class="hero__title">' + esc(t('spec.title')) + '</h1>'
                + '<p class="hero__lede">' + esc(t('spec.lede')) + '</p></div>'
                + '<div class="cards">' + SPECS.map(function (spec) {
                    return '<a class="card" href="' + esc(href('/spec/' + spec.id)) + '">'
                        + '<p class="card__meta">' + esc(t('groups.' + spec.group)) + '</p>'
                        + '<p class="card__title">' + esc(specTitle(spec)) + '</p>'
                        + '<p class="card__body">' + esc(spec.summary || '') + '</p>'
                        + '</a>'
                }).join('') + '</div></div>'
            renderAside([{ title: t('spec.relatedNote'), html: p(t('spec.lede')) }])
            return
        }

        var spec = SPECS.filter(function (s) { return s.id === id })[0]
        if (spec == null) { pageNotFound(); return }

        var outline = []
        var re = /<h([23]) id="([^"]+)">([^<]*)<\/h\1>/gu
        var m
        while ((m = re.exec(spec.html)) !== null) outline.push({ level: Number(m[1]), id: m[2], text: m[3] })

        var siblings = SPECS.filter(function (s) { return s.group === spec.group && s.id !== spec.id })

        /* 文档自己的 `# 标题` 就是页面大标题，并且排在最前：页面顶部只认标题，
         * 不认面包屑，也不认任何演示台——顶栏和左栏已经回答了「我在哪」。 */
        var bodyHtml = spec.html
        var head = /<h1 id="h\d+">([\s\S]*?)<\/h1>/u.exec(bodyHtml)
        var titleHtml = head === null ? esc(specTitle(spec)) : head[1]
        if (head !== null) bodyHtml = bodyHtml.slice(0, head.index) + bodyHtml.slice(head.index + head[0].length)

        mainEl.innerHTML = '<div class="main-inner">'
            + '<div class="doc-head">'
            + '<p class="doc-head__eyebrow">' + esc(t('spec.title')) + ' · ' + esc(t('groups.' + spec.group)) + '</p>'
            + '<h1 class="doc-head__title">' + titleHtml + '</h1>'
            + '</div>'
            + '<article class="prose">' + bodyHtml + '</article>'
            + (LANG === 'en' ? coverageNote('specs') : '')
            + '</div>'

        /* The right column carries what you need *while reading this document*:
         * where you can jump to inside it, and what to read next. The file name
         * and character count are provenance, not orientation, so they live in
         * the repository rather than on screen. */
        renderAside([
            outline.length > 0 ? {
                title: t('spec.outline'),
                html: '<ul class="outline">' + outline.map(function (item) {
                    return '<li class="outline__item outline__item--h' + item.level + '">'
                        + '<a href="' + esc(href('/spec/' + spec.id)) + '" data-jump="' + esc(item.id) + '">'
                        + esc(item.text) + '</a></li>'
                }).join('') + '</ul>',
            } : null,
            siblings.length > 0 ? {
                title: t('index.spec'),
                html: ulLinks(siblings.map(function (s) { return { label: specTitle(s), hash: '/spec/' + s.id } })),
            } : null,
        ].filter(Boolean))
    }

    /**
     * The component index, a category page, or one component.
     * @param arg - category key, component id, or null.
     */
    function pageComponents(arg) {
        if (arg == null) {
            var byCategory = {}
            COMPONENTS.forEach(function (c) {
                var cat = c.category || 'uncategorized'
                byCategory[cat] = byCategory[cat] || []
                byCategory[cat].push(c)
            })
            mainEl.innerHTML = '<div class="main-inner"><div class="hero"><h1 class="hero__title">' + esc(t('components.title')) + '</h1>'
                + '<p class="hero__lede">' + esc(t('components.lede')) + '</p></div>'
                + Object.keys(byCategory).sort().map(function (cat) {
                    return '<section class="section"><div class="section__head">'
                        + '<h2 class="section__title">' + esc(categoryLabel(cat)) + '</h2>'
                        + '<a class="section__link" href="' + esc(href('/components/' + cat)) + '">' + esc(t('components.viewAll')) + ' ' + byCategory[cat].length + '</a></div>'
                        + '<div class="cards">' + byCategory[cat].map(componentCard).join('') + '</div></section>'
                }).join('') + '</div>'
            renderAside([{ title: t('components.title'), html: p(t('components.usage')) }])
            return
        }

        var isCategory = COMPONENTS.some(function (c) { return (c.category || 'uncategorized') === arg })
        var isComponent = COMPONENTS.some(function (c) { return c.id === arg })

        if (isCategory && !isComponent) {
            var list = COMPONENTS.filter(function (c) { return (c.category || 'uncategorized') === arg })
            mainEl.innerHTML = '<div class="main-inner">'
                + crumbs([{ label: t('components.title'), hash: '/components' }, { label: categoryLabel(arg) }], '/components')
                + '<div class="hero"><h1 class="hero__title">' + esc(categoryLabel(arg)) + '</h1>'
                + '<p class="hero__lede">' + list.length + ' ' + esc(t('components.count')) + '</p></div>'
                + '<div class="cards">' + list.map(componentCard).join('') + '</div></div>'
            renderAside([{ title: t('components.title'), html: p(t('components.usage')) }])
            return
        }

        var c = COMPONENTS.filter(function (x) { return x.id === arg })[0]
        if (c == null) { pageNotFound(); return }

        mainEl.innerHTML = '<div class="main-inner">'
            + crumbs([
                { label: t('components.title'), hash: '/components' },
                { label: categoryLabel(c.category), hash: '/components/' + (c.category || 'uncategorized') },
                { label: componentLabel(c) },
            ], '/components/' + (c.category || 'uncategorized'))
            + '<div class="hero"><h1 class="hero__title">' + esc(componentLabel(c))
            + '<span class="hero__code">' + esc(c.name) + '</span></h1>'
            + '<p class="hero__lede">' + esc(toPlain(c.summary)) + '</p>'
            + originNote(c) + '</div>'
            + (LANG === 'en' ? coverageNote('components') : '')
            + specimen(t('components.preview'), c.demo, c.evidence, c.demoWithheld)
            + (c.hasSpec === true ? docSwitch() : '')
            + (c.readmeHtml ? '<article class="prose" data-doc-panel="readme">' + c.readmeHtml + '</article>' : '')
            + (c.hasSpec === true ? '<article class="prose" data-doc-panel="spec" hidden>' + c.specHtml + '</article>' : '')
            + (c.tsx ? codeBlock((c.path || '') + 'index.tsx', c.tsx, { folded: true }) : '')
            + (c.css ? codeBlock((c.path || '') + (c.id || 'component').toLowerCase() + '.module.css', c.css, { folded: true }) : '')
            + '</div>'

        renderAside([
            c.whenToUse ? { title: t('components.whenToUse'), html: ul(toList(c.whenToUse)) } : null,
            c.whenNotToUse ? { title: t('components.whenNotToUse'), html: ul(toList(c.whenNotToUse)) } : null,
            c.geometrySource ? { title: t('components.geometrySource'), html: p(toPlain(c.geometrySource)) } : null,
            c.tags ? { title: t('components.tags'), html: p(toList(c.tags).join(' · ')) } : null,
        ].filter(Boolean))
    }

    /**
     * A component card.
     * @param c - component record.
     * @returns html.
     */
    function componentCard(c) {
        return '<a class="card" href="' + esc(href('/component/' + c.id)) + '">'
            + '<p class="card__title">' + esc(componentLabel(c)) + '<span class="card__code">' + esc(c.name) + '</span></p>'
            + '<p class="card__body">' + esc(toPlain(c.summary)) + '</p>'
            + '<p class="card__meta">'
            + badge(t('origin.' + (c.origin === 'official' ? 'official' : 'proposed')), c.origin === 'official' ? 'safe' : 'warn')
            + (c.demoWithheld === true ? ' ' + badge(t('components.withheldBadge'), 'warn') : '')
            + '</p>'
            + '</a>'
    }

    /**
     * The seat directory, optionally filtered.
     * @param q - filter text.
     */
    function pageSeats(q) {
        var query = (q || '').trim().toLowerCase()
        var seats = SEATS.filter(function (s) {
            if (query === '') return true
            return s.name.toLowerCase().indexOf(query) !== -1
                || (s.purpose || '').toLowerCase().indexOf(query) !== -1
                || s.kind === query || s.scope === query || s.replaceRisk === query
        })
        var risky = SEATS.filter(function (s) { return s.replaceRisk === 'shadows-shipped-ui' }).length

        mainEl.innerHTML = '<div class="main-inner">'
            + '<div class="hero"><h1 class="hero__title">' + esc(t('seats.title')) + '</h1>'
            + '<p class="hero__lede">' + esc(t('seats.lede', { n: SEATS.length })) + '</p></div>'
            + '<div class="callout callout--warn"><span class="callout__mark">!</span><div><p>'
            + esc(t('seats.riskyNote', { n: risky })) + '</p></div></div>'
            + '<section class="section">'
            + '<div class="section__head"><h2 class="section__title">' + esc(t('seats.tableTitle', { n: seats.length })) + '</h2>'
            + '<span class="section__hint">' + (query === '' ? esc(t('seats.treeOrder')) : esc(t('seats.filter')) + '：' + esc(query)) + '</span></div>'
            + '<div class="table-wrap"><table><thead><tr>'
            + '<th>' + esc(t('seats.columns.name')) + '</th><th>' + esc(t('seats.columns.kind')) + '</th>'
            + '<th>' + esc(t('seats.columns.scope')) + '</th><th>' + esc(t('seats.columns.risk')) + '</th>'
            + '<th>' + esc(t('seats.columns.purpose')) + '</th></tr></thead><tbody>'
            + seats.map(function (s) {
                return '<tr><td class="mono">' + esc(s.name) + '</td>'
                    + '<td>' + badge(s.kind, s.kind === 'single' ? 'warn' : 'neutral') + '</td>'
                    + '<td>' + esc(s.scope) + '</td>'
                    + '<td>' + badge(s.replaceRisk === 'none' ? t('seats.safe') : t('seats.shadows'), s.replaceRisk === 'none' ? 'safe' : 'risk') + '</td>'
                    + '<td>' + esc(s.purpose) + '</td></tr>'
            }).join('')
            + '</tbody></table></div></section></div>'

        renderAside([
            {
                title: t('seats.kindsTitle'),
                html: ul(['single', 'list', 'keyed', 'chain'].map(function (k) { return t('seats.kinds.' + k) })),
            },
            {
                title: t('seats.scopesTitle'),
                html: ul(['root', 'maybe', 'session'].map(function (k) { return t('seats.scopes.' + k) })),
            },
            { title: t('seats.orderTitle'), html: p(t('seats.orderNote')) },
        ])
    }

    /**
     * The official icon set.
     * @param q - filter text.
     */
    function pageIcons(q) {
        var query = (q || '').trim().toLowerCase()
        var items = ICONS.filter(function (i) {
            return query === '' || i.name.toLowerCase().indexOf(query) !== -1 || i.component.toLowerCase().indexOf(query) !== -1
        })

        var families = {}
        ICONS.forEach(function (i) {
            var parts = String(i.viewBox || '').split(' ')
            if (parts.length < 4) return
            var key = parts[2] + '×' + parts[3]
            families[key] = (families[key] || 0) + 1
        })
        var familyText = Object.keys(families).sort(function (a, b) {
            return parseFloat(b) - parseFloat(a)
        }).map(function (k) { return k + ' · ' + families[k] }).join('、')

        mainEl.innerHTML = '<div class="main-inner">'
            + '<div class="hero"><h1 class="hero__title">' + esc(t('icons.title')) + '</h1>'
            + '<p class="hero__lede">' + t('icons.lede', { n: ICONS.length }) + '</p></div>'
            + '<div class="callout"><span class="callout__mark">i</span><div><p>'
            + esc(t('icons.familyNote')) + '：' + esc(familyText) + '。' + esc(t('icons.familyTail')) + '</p></div></div>'
            + '<section class="section"><div class="section__head"><h2 class="section__title">' + esc(t('icons.tableTitle', { n: items.length })) + '</h2>'
            + '<span class="section__hint">' + (query === '' ? esc(t('icons.order')) : esc(t('seats.filter')) + '：' + esc(query)) + '</span></div>'
            + '<div class="icons">' + items.map(function (i) {
                return '<button class="icon-cell" type="button" data-icon-name="' + esc(i.name) + '" data-tip="' + esc(i.name) + '">'
                    + '<span style="display:block;width:22px;height:22px">' + (i.svg || '') + '</span>'
                    + '<span class="icon-cell__name">' + esc(i.name.replace(/^ic_ds_/u, '')) + '</span>'
                    + '</button>'
            }).join('') + '</div></section></div>'

        renderAside([
            { title: t('icons.whyTitle'), html: p(t('icons.why')) },
            {
                title: t('icons.namingTitle'),
                html: '<dl><dt>' + esc(t('icons.authored')) + '</dt><dd>ic_ds_close_outline_16</dd>'
                    + '<dt>' + esc(t('icons.component')) + '</dt><dd>IconCloseOutline16</dd>'
                    + '<dt>' + esc(t('icons.file')) + '</dt><dd>icons/close-outline-16.svg</dd></dl>',
            },
        ])
    }

    /**
     * The token reference.
     * @param q - filter text.
     */
    function pageTokens(q) {
        var query = (q || '').trim().toLowerCase()
        var names = Object.keys(TOKENS.light).filter(function (n) { return query === '' || n.toLowerCase().indexOf(query) !== -1 })

        mainEl.innerHTML = '<div class="main-inner">'
            + '<div class="hero"><h1 class="hero__title">' + esc(t('tokens.title')) + '</h1>'
            + '<p class="hero__lede">' + esc(t('tokens.lede', {
                palette: Object.keys(TOKENS.palette || {}).length,
                aliases: Object.keys(TOKENS.light).length,
            })) + '</p></div>'
            + '<div class="callout"><span class="callout__mark">i</span><div><p>' + esc(t('tokens.usageNote')) + '</p></div></div>'
            + '<section class="section"><div class="section__head"><h2 class="section__title">' + esc(t('tokens.tableTitle', { n: names.length })) + '</h2>'
            + '<span class="section__hint">' + (query === '' ? esc(t('tokens.order')) : esc(t('seats.filter')) + '：' + esc(query)) + '</span></div>'
            + '<div class="table-wrap"><table><thead><tr>'
            + '<th>' + esc(t('tokens.columns.name')) + '</th><th>' + esc(t('tokens.columns.swatch')) + '</th>'
            + '<th>' + esc(t('tokens.columns.light')) + '</th><th>' + esc(t('tokens.columns.dark')) + '</th></tr></thead><tbody>'
            + names.map(function (n) {
                var lightValue = TOKENS.resolvedLight[n] || TOKENS.light[n] || ''
                var darkValue = TOKENS.resolvedDark[n] || TOKENS.dark[n] || ''
                var swatch = /^(#|rgb|hsl)/u.test(lightValue)
                    ? '<span style="display:inline-block;width:18px;height:18px;border-radius:5px;background:' + esc(lightValue)
                      + ';box-shadow:inset 0 0 0 1px var(--site-swatch-edge)"></span>'
                    : '<span style="color:var(--site-label-3)">—</span>'
                return '<tr><td class="mono">' + esc(n) + '</td><td>' + swatch + '</td>'
                    + '<td class="mono">' + esc(lightValue) + '</td><td class="mono">' + esc(darkValue) + '</td></tr>'
            }).join('')
            + '</tbody></table></div></section>'
            + geometrySection()
            + '</div>'

        renderAside([
            { title: t('tokens.depthTitle'), html: p(t('tokens.depth')) },
            { title: t('tokens.geometryTitle'), html: p(t('tokens.geometryNote')) },
            { title: t('tokens.sourceTitle'), html: p(t('tokens.source')) },
        ])
    }

    /**
     * The token reference's second half: corners, elevations, shadow levels.
     *
     * The colour table alone makes the system look like it is only made of
     * colours, which is how a plugin author ends up inventing a seventh corner
     * radius or stacking a shadow on a card. Values come from the collected
     * theme (`TOKENS.scale`); the wording of "where it goes" is authored here.
     * @returns HTML.
     */
    function geometrySection() {
        var scale = TOKENS.scale || {}
        var use = raw('tokens.geometryUse') || {}
        /* Fixed order: the corner scale first, then the elevation recipes. */
        var order = Object.keys(use).filter(function (name) { return scale[name] !== undefined })
        if (order.length === 0) return ''
        return '<section class="section"><div class="section__head">'
            + '<h2 class="section__title">' + esc(t('tokens.geometryTitle')) + '</h2></div>'
            + p(t('tokens.geometryLead'))
            + '<div class="table-wrap"><table><thead><tr>'
            + '<th>' + esc(t('tokens.geometryColumns.name')) + '</th>'
            + '<th>' + esc(t('tokens.geometryColumns.value')) + '</th>'
            + '<th>' + esc(t('tokens.geometryColumns.use')) + '</th></tr></thead><tbody>'
            + order.map(function (name) {
                return '<tr><td class="mono">' + esc(name) + '</td>'
                    + '<td class="mono">' + esc(scale[name]) + '</td>'
                    + '<td>' + esc(use[name]) + '</td></tr>'
            }).join('')
            + '</tbody></table></div></section>'
    }

    /**
     * 元素清单：界面上有什么，规范里有没有它的位置。
     *
     * 这一页是从界面出发的：`scripts/scan-ui.mjs` 把产品跑起来，逐个状态登记每个
     * 占尺寸的元素，再用仓库自己的文字去问「这件东西有没有出处」。`missing` 不是
     * 判决，是待办——自动对照只做包含判断，命中与否都要人再核一遍。
     * @param q - 过滤文本。
     */
    function pageInventory(q) {
        var query = (q || '').trim().toLowerCase()
        var all = COVERAGE.coverage || []
        var counts = COVERAGE.counts || { identities: all.length, referenced: 0, missing: 0, pluginOwned: 0 }
        var families = (ANCHORS.pluginFamilies || [])

        /**
         * 这条身份是哪家插件画的（产品自己的元素返回 null）。
         * @param row - 清单里的一行。
         * @returns 插件名，或 null。
         */
        function pluginOf(row) {
            /* 类名与座位都要看：有些插件元素的归一化身份里只有通用词（如 `tag currentTag`），
             * 真正的出处写在没被剥掉的那半截类名里（`_tag_brmue_4`）；匿名元素则只认座位。 */
            var hay = (row.key + ' ' + (row.cls || '') + ' ' + (row.slot || '')).toLowerCase()
            for (var i = 0; i < families.length; i++) {
                if (hay.indexOf(String(families[i].match).toLowerCase()) !== -1) {
                    return pluginLabel(families[i].plugin)
                }
            }
            return row.pluginOwned === true ? t('inventory.pluginUnknown') : null
        }

        var official = all.filter(function (row) { return pluginOf(row) === null })
        var thirdParty = all.filter(function (row) { return pluginOf(row) !== null })
        var match = function (row) {
            if (query === '') return true
            return (row.key + ' ' + row.slot + ' ' + (row.texts || []).join(' ')).toLowerCase().indexOf(query) !== -1
        }
        var rows = official.filter(match)

        if (all.length === 0) {
            mainEl.innerHTML = '<div class="main-inner"><div class="hero"><h1 class="hero__title">' + esc(t('inventory.title')) + '</h1>'
                + '<p class="hero__lede">' + esc(t('inventory.empty')) + '</p></div></div>'
            renderAside([])
            return
        }

        /**
         * 一行清单。
         * @param row - 清单条目。
         * @returns HTML。
         */
        function rowHtml(row) {
            var plugin = pluginOf(row)
            var state = plugin !== null
                ? '<span class="badge badge--neutral">' + esc(t('inventory.stateParked')) + '</span>'
                : (row.coverage === 'missing'
                    ? '<span class="badge badge--warn">' + esc(t('inventory.stateMissing')) + '</span>'
                    : (row.coverage === 'covered'
                        ? (row.described === true
                            ? '<span class="badge badge--safe">' + esc(t('inventory.stateDescribed')) + '</span>'
                            : '<span class="badge badge--warn">' + esc(t('inventory.stateNotDescribed')) + '</span>')
                        : '<span class="badge badge--neutral">' + esc(t('inventory.stateCovered')) + '</span>'))
            var where = (row.hits || []).slice(0, 2).map(function (hit) {
                return '<code class="mono">' + esc(hit.where.replace(/^components\//u, '').replace(/^spec\//u, 'spec/')) + '</code>'
            }).join('<br>') || '<span style="color:var(--site-label-3)">—</span>'
            var seen = (row.steps || []).slice(0, 3).join(' · ')
            return '<tr><td><code class="mono">' + esc(row.key.split('|')[0] || row.key) + '</code>'
                + (row.slot ? '<br><span style="color:var(--site-label-3)">' + esc(row.slot) + '</span>' : '')
                + '</td><td>' + esc(seen) + '</td><td class="mono">' + esc(row.size) + '</td>'
                + '<td>' + state + (plugin === null ? '' : '<br><span style="color:var(--site-label-3)">' + esc(plugin) + '</span>') + '</td>'
                + '<td>' + where + '</td></tr>'
        }

        var head = function (title, hint) {
            return '<section class="section"><div class="section__head"><h2 class="section__title">' + esc(title) + '</h2>'
                + '<span class="section__hint">' + esc(hint) + '</span></div>'
                + '<div class="table-wrap"><table><thead><tr>'
                + '<th>' + esc(t('inventory.columns.identity')) + '</th>'
                + '<th>' + esc(t('inventory.columns.where')) + '</th>'
                + '<th>' + esc(t('inventory.columns.size')) + '</th>'
                + '<th>' + esc(t('inventory.columns.state')) + '</th>'
                + '<th>' + esc(t('inventory.columns.source')) + '</th>'
                + '</tr></thead><tbody>'
        }

        /* 官方元素排前面：这份资源的顺序是「先把产品自己的东西讲清楚」，第三方插件
         * 只登记、不展开——它们不是 DSH 的界面语言。 */
        var officialRowsHtml = rows.map(rowHtml).join('')
        var thirdRows = thirdParty.filter(match)
        var thirdRowsHtml = thirdRows.slice(0, 60).map(rowHtml).join('')

        mainEl.innerHTML = '<div class="main-inner">'
            + '<div class="hero"><h1 class="hero__title">' + esc(t('inventory.title')) + '</h1>'
            + '<p class="hero__lede">' + esc(t('inventory.lede', {
                identities: counts.identities || 0, official: official.length, third: thirdParty.length,
                described: counts.described || 0, notDescribed: counts.coveredNotDescribed || 0,
            })) + '</p></div>'
            + '<div class="callout"><span class="callout__mark">i</span><div><p>' + esc(t('inventory.note')) + '</p></div></div>'
            + head(t('inventory.tableTitle', { n: rows.length }), query === '' ? t('inventory.order') : t('seats.filter') + '：' + query)
            + officialRowsHtml + '</tbody></table></div></section>'
            + '<section class="section"><div class="section__head">'
            + '<h2 class="section__title">' + esc(t('inventory.thirdTitle', { n: thirdParty.length })) + '</h2>'
            + '<span class="section__hint">' + esc(t('inventory.thirdHint')) + '</span></div>'
            + p(t('inventory.thirdNote'))
            + (thirdRows.length === 0 ? '' : head('', '') + thirdRowsHtml + '</tbody></table></div>')
            + '</section></div>'

        renderAside([
            { title: t('inventory.howTitle'), html: p(t('inventory.how')) },
            { title: t('inventory.stateTitle'), html: p(t('inventory.stateNote')) },
        ])
    }

    /** Fallback page. */
    function pageNotFound() {
        mainEl.innerHTML = '<div class="main-inner"><div class="hero"><h1 class="hero__title">' + esc(t('notFound.title')) + '</h1>'
            + '<p class="hero__lede">' + esc(t('notFound.lede')) + '</p></div></div>'
        renderAside([])
    }

    /* ── routing ───────────────────────────────────────────────────── */

    /**
     * Parse the current hash.
     * @returns {{path: string, q: string}} route parts.
     */
    function route() {
        var raw = location.hash.replace(/^#/u, '') || '/'
        var q = ''
        var at = raw.indexOf('?')
        if (at !== -1) {
            q = (new URLSearchParams(raw.slice(at + 1))).get('q') || ''
            raw = raw.slice(0, at)
        }
        if (raw.charAt(0) !== '/') raw = '/' + raw
        return { path: raw.replace(/\/+$/u, '') || '/', q: q }
    }

    /** Render the current route. */
    function render() {
        DEMOS = {}
        demoSeq = 0
        var r = route()
        var path = r.path
        var parts = path.split('/').filter(Boolean)

        if (path === '/') pageHome()
        else if (path === '/why') pageWhy()
        else if (path === '/window') pageWindow()
        else if (parts[0] === 'guide') pageGuide(parts[1] || null)
        else if (parts[0] === 'spec') pageSpec(parts[1] || null)
        else if (parts[0] === 'components') pageComponents(parts[1] || null)
        else if (parts[0] === 'component') pageComponents(parts[1] || null)
        else if (parts[0] === 'seats') pageSeats(r.q)
        else if (parts[0] === 'icons') pageIcons(r.q)
        else if (parts[0] === 'tokens') pageTokens(r.q)
        else if (parts[0] === 'inventory') pageInventory(r.q)
        else pageNotFound()

        renderIndex(path)
        renderTopnav(path)
        hydrateIcons(document)

        Array.prototype.forEach.call(mainEl.querySelectorAll('[data-copy]'), function (button) {
            button.addEventListener('click', function () {
                var pre = button.parentElement.parentElement.querySelector('pre code')
                copy(pre.textContent, button)
            })
        })
        Array.prototype.forEach.call(mainEl.querySelectorAll('[data-fold-toggle]'), function (button) {
            button.addEventListener('click', function () {
                var code = button.closest('.code')
                var folded = code.getAttribute('data-fold') === 'true'
                code.setAttribute('data-fold', folded ? 'false' : 'true')
                button.textContent = folded ? t('actions.collapse') : t('actions.expand')
            })
        })
        Array.prototype.forEach.call(mainEl.querySelectorAll('[data-doc-switch] button'), function (button) {
            button.addEventListener('click', function () {
                var want = button.getAttribute('data-doc')
                Array.prototype.forEach.call(button.parentElement.children, function (sibling) {
                    sibling.setAttribute('aria-selected', String(sibling === button))
                })
                Array.prototype.forEach.call(mainEl.querySelectorAll('[data-doc-panel]'), function (panel) {
                    panel.hidden = panel.getAttribute('data-doc-panel') !== want
                })
            })
        })
        Array.prototype.forEach.call(mainEl.querySelectorAll('[data-back]'), function (button) {
            button.addEventListener('click', function () {
                location.hash = '#' + button.getAttribute('data-back')
            })
        })
        /* 正文里的引用角标 [1] 与右栏目录用同一套跳转：只滚动，不动路由——
         * 站点是 hash 路由，`#cite-1` 这样的链接会把路由本身顶掉。 */
        Array.prototype.forEach.call(mainEl.querySelectorAll('[data-jump]'), function (node) {
            node.addEventListener('click', function () {
                var target = document.getElementById(node.getAttribute('data-jump'))
                if (target !== null) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            })
        })
        Array.prototype.forEach.call(asideEl.querySelectorAll('[data-jump]'), function (node) {
            node.addEventListener('click', function (event) {
                event.preventDefault()
                var target = document.getElementById(node.getAttribute('data-jump'))
                if (target !== null) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            })
        })
        Array.prototype.forEach.call(mainEl.querySelectorAll('.icon-cell'), function (cell) {
            cell.addEventListener('click', function () {
                var name = cell.getAttribute('data-icon-name')
                var found = ICONS.filter(function (i) { return i.name === name })[0]
                copy(found ? found.svg : '', null)
                cell.style.background = 'var(--site-good-soft)'
                setTimeout(function () { cell.style.background = '' }, 400)
            })
        })

        mountDemos(mainEl)
        mainEl.scrollTop = 0
        mainEl.focus({ preventScroll: true })
    }

    /**
     * Render the quick links in the top bar.
     * @param path - current route.
     */
    function renderTopnav(path) {
        var links = [
            { key: 'topnav.guides', href: '/guide/00-start', match: '/guide' },
            { key: 'topnav.spec', href: '/spec', match: '/spec' },
            { key: 'topnav.components', href: '/components', match: '/component' },
            { key: 'topnav.seats', href: '/seats', match: '/seats' },
            { key: 'topnav.icons', href: '/icons', match: '/icons' },
            { key: 'topnav.tokens', href: '/tokens', match: '/tokens' },
        ]
        topnavEl.innerHTML = links.map(function (link) {
            var active = path.indexOf(link.match) === 0
            return '<a href="' + esc(href(link.href)) + '"' + (active ? ' style="color:var(--site-label)"' : '') + '>'
                + esc(t(link.key)) + '</a>'
        }).join('')
    }

    /* ── search ────────────────────────────────────────────────────── */

    var INDEX = null

    /**
     * Build the cross-resource search index once.
     * @returns the index.
     */
    function buildIndex() {
        if (INDEX !== null) return INDEX
        var out = []
        SPECS.forEach(function (s) {
            out.push({ kind: t('index.spec'), name: LANG === 'en' ? (s.shortEn || s.title) : s.title, desc: s.id, hash: '/spec/' + s.id })
        })
        COMPONENTS.forEach(function (c) {
            out.push({
                kind: t('topnav.components'),
                name: componentLabel(c),
                desc: c.name + ' · ' + toPlain(c.summary).slice(0, 46),
                hash: '/component/' + c.id,
            })
        })
        SEATS.forEach(function (s) { out.push({ kind: t('topnav.seats'), name: s.name, desc: s.purpose.slice(0, 70), hash: '/seats?q=' + encodeURIComponent(s.name) }) })
        ICONS.forEach(function (i) { out.push({ kind: t('topnav.icons'), name: i.name, desc: i.component, hash: '/icons?q=' + encodeURIComponent(i.name) }) })
        Object.keys(TOKENS.light).forEach(function (n) { out.push({ kind: t('topnav.tokens'), name: n, desc: '', hash: '/tokens?q=' + encodeURIComponent(n) }) })
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
            var inDesc = (item.desc || '').toLowerCase().indexOf(q) !== -1
            if (at === -1 && !inDesc) return
            hits.push({ item: item, score: at === 0 ? 0 : at === -1 ? 2 : 1 })
        })
        hits.sort(function (a, b) { return a.score - b.score })
        return hits.slice(0, 24).map(function (h) { return h.item })
    }

    /** Hide the results panel. */
    function closeResults() {
        resultsEl.setAttribute('data-open', 'false')
        resultsPanel.innerHTML = ''
    }

    /**
     * Render search results.
     * @param items - matches.
     * @param activeIndex - highlighted row.
     */
    function showResults(items, activeIndex) {
        if (items.length === 0) {
            resultsPanel.innerHTML = '<p class="results__empty">' + esc(t('search.empty')) + '</p>'
            resultsEl.setAttribute('data-open', 'true')
            return
        }
        resultsPanel.innerHTML = items.map(function (item, i) {
            return '<a class="results__item" href="' + esc(href(item.hash)) + '" data-active="' + (i === activeIndex) + '">'
                + '<span class="results__kind">' + esc(item.kind) + '</span>'
                + '<span class="results__name">' + esc(item.name) + '</span>'
                + '<span class="results__desc">' + esc((item.desc || '').slice(0, 56)) + '</span>'
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
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            activeHit = (activeHit + 1) % currentHits.length
            showResults(currentHits, activeHit)
        } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            activeHit = (activeHit - 1 + currentHits.length) % currentHits.length
            showResults(currentHits, activeHit)
        } else if (event.key === 'Enter' && activeHit >= 0) {
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
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault()
            queryEl.focus()
            queryEl.select()
        }
    })

    /* ── language ──────────────────────────────────────────────────── */

    /** Render the language switch. */
    function renderLangSwitch() {
        langEl.innerHTML = ['zh', 'en'].map(function (code) {
            var label = (I18N[code] && I18N[code].meta && I18N[code].meta.short) || code.toUpperCase()
            return '<button type="button" role="tab" data-lang="' + code + '" aria-selected="' + (code === LANG) + '">'
                + esc(label) + '</button>'
        }).join('')
        Array.prototype.forEach.call(langEl.querySelectorAll('button'), function (button) {
            button.addEventListener('click', function () {
                var next = button.getAttribute('data-lang')
                if (next === LANG) return
                LANG = next
                save('dshdr-lang', LANG)
                applyLanguage()
                applyStaticText()
                renderLangSwitch()
                render()
            })
        })
    }

    /** Apply translations to the static chrome and document metadata. */
    function applyStaticText() {
        document.documentElement.lang = LANG === 'zh' ? 'zh-CN' : 'en'
        document.title = LANG === 'zh'
            ? 'DeepSeek Design Resources — 插件界面规范、组件与图标'
            : 'DeepSeek Design Resources — spec, components and icons for plugin UI'
        Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (node) {
            node.textContent = t(node.getAttribute('data-t'))
        })
        /* Accessible names carry no visible text, so they are easy to leave
         * behind in one language: the static shell is English and these nodes
         * are what a screen reader announces in Chinese (`docs/I18N.md`). */
        Array.prototype.forEach.call(document.querySelectorAll('[data-t-aria]'), function (node) {
            node.setAttribute('aria-label', t(node.getAttribute('data-t-aria')))
        })
        queryEl.placeholder = t('search.placeholder')
        queryEl.setAttribute('aria-label', t('search.placeholder'))
        setTip('navToggle', t('actions.nav'))
        setTip('asideToggle', t('actions.aside'))
        setTip('theme', t('actions.theme'))
    }

    /**
     * Give a control its accessible name and its self-drawn tooltip.
     *
     * The native `title` bubble is browser chrome — its shape, font, delay and
     * animation belong to the browser, not to this page — so it is never used.
     * `data-tip` feeds a bubble drawn with the harness's own tooltip geometry
     * (`padding 3/7, radius 8, 13px/20`), which is what this repository asks of
     * plugins and therefore what it has to do itself.
     * @param id - element id.
     * @param text - label.
     */
    function setTip(id, text) {
        var node = document.getElementById(id)
        node.setAttribute('data-tip', text)
        node.setAttribute('aria-label', text)
    }

    /** Mount the shared tooltip bubble and its listeners. */
    function initTooltips() {
        var tip = document.createElement('div')
        tip.className = 'tip'
        tip.setAttribute('role', 'tooltip')
        document.body.appendChild(tip)

        /**
         * Show the bubble under a control.
         * @param target - element carrying `data-tip`.
         */
        var show = function (target) {
            var text = target.getAttribute('data-tip')
            if (text === null || text === '') return
            tip.textContent = text
            tip.setAttribute('data-open', 'true')
            var rect = target.getBoundingClientRect()
            var left = Math.min(
                Math.max(8, rect.left + rect.width / 2 - tip.offsetWidth / 2),
                window.innerWidth - tip.offsetWidth - 8,
            )
            tip.style.left = left + 'px'
            tip.style.top = (rect.bottom + 6) + 'px'
        }
        var hide = function () { tip.setAttribute('data-open', 'false') }
        var closest = function (event) {
            return event.target && event.target.closest ? event.target.closest('[data-tip]') : null
        }

        document.addEventListener('mouseover', function (event) {
            var target = closest(event)
            if (target !== null) show(target)
        })
        document.addEventListener('mouseout', function (event) {
            if (closest(event) !== null) hide()
        })
        document.addEventListener('focusin', function (event) {
            var target = closest(event)
            if (target !== null) show(target)
        })
        document.addEventListener('focusout', hide)
        window.addEventListener('scroll', hide, true)
    }

    /* ── boot ──────────────────────────────────────────────────────── */

    /* restore rail widths before first paint so nothing jumps */
    var savedNav = parseFloat(load('dshdr-nav-w', ''))
    var savedAside = parseFloat(load('dshdr-aside-w', ''))
    if (Number.isFinite(savedNav)) setWidth('nav', clamp(savedNav, NAV_MIN, NAV_MAX))
    if (Number.isFinite(savedAside)) setWidth('aside', clamp(savedAside, ASIDE_MIN, ASIDE_MAX))

    setColumn('nav', load('dshdr-nav', 'shown') === 'shown')
    setColumn('aside', load('dshdr-aside', 'shown') === 'shown')
    initResizers()
    initTooltips()

    document.getElementById('navToggle').addEventListener('click', function () {
        setColumn('nav', shell.getAttribute('data-nav') !== 'shown')
    })
    document.getElementById('asideToggle').addEventListener('click', function () {
        setColumn('aside', shell.getAttribute('data-aside') !== 'shown')
    })
    document.getElementById('theme').addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme')
        var isDark = current !== null
            ? current === 'dark'
            : window.matchMedia('(prefers-color-scheme: dark)').matches
        applyTheme(isDark ? 'light' : 'dark')
    })

    applyTheme(load('dshdr-theme', 'auto'))
    applyLanguage()
    renderLangSwitch()
    applyStaticText()

    window.addEventListener('hashchange', render)

    if (ICONS.length === 0 && SEATS.length === 0 && COMPONENTS.length === 0) {
        mainEl.innerHTML = '<div class="main-inner"><div class="hero"><h1 class="hero__title">Data not generated yet</h1>'
            + '<p class="hero__lede">Run <code>node scripts/collect-icons.mjs &amp;&amp; node scripts/collect-tokens.mjs &amp;&amp; node scripts/collect-slots.mjs &amp;&amp; node website/gen-site.mjs</code> first.</p></div></div>'
    } else {
        render()
    }
})()
