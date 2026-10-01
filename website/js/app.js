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
    var SPECS = D.specs || []
    var COMPONENTS = D.components || []
    var SEATS = D.seats || []
    var ICONS = D.icons || []
    var TOKENS = D.tokens || { light: {}, dark: {}, resolvedLight: {}, resolvedDark: {}, palette: {} }
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
        for (var i = 0; i < ICONS.length; i++) {
            var name = ICONS[i].name || ''
            if (name.indexOf(short.replace(/-/gu, '_')) !== -1) return ICONS[i]
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
        if (LANG === 'en' && spec.shortEn) return spec.shortEn
        return spec.short || spec.title
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
        groups.push({
            id: 'overview',
            title: t('index.overview'),
            links: [
                { href: href('/'), label: t('index.home'), active: path === '/' },
                { href: href('/why'), label: t('index.why'), active: path === '/why' },
            ],
        })

        if (SPECS.length > 0) {
            var byGroup = { basics: [], visual: [], quality: [] }
            SPECS.forEach(function (spec) { (byGroup[spec.group] || byGroup.basics).push(spec) })
            Object.keys(byGroup).forEach(function (key) {
                if (byGroup[key].length === 0) return
                groups.push({
                    id: 'spec-' + key,
                    title: t('groups.' + key),
                    links: byGroup[key].map(function (spec) {
                        return { href: href('/spec/' + spec.id), label: specTitle(spec), active: path === '/spec/' + spec.id }
                    }),
                })
            })
        }

        var byCategory = {}
        COMPONENTS.forEach(function (c) {
            var cat = c.category || 'uncategorized'
            byCategory[cat] = byCategory[cat] || []
            byCategory[cat].push(c)
        })
        var categories = Object.keys(byCategory).sort()
        if (categories.length > 0) {
            var openComponent = path.indexOf('/component/') === 0 ? path.slice('/component/'.length) : null
            var componentLinks = [{
                href: href('/components'),
                label: t('index.allComponents'),
                count: COMPONENTS.length,
                active: path === '/components',
            }].concat(categories.map(function (cat) {
                var holdsOpen = openComponent !== null && byCategory[cat].some(function (c) { return c.id === openComponent })
                return {
                    href: href('/components/' + cat),
                    label: categoryLabel(cat),
                    count: byCategory[cat].length,
                    /* reading a component keeps its category lit and lists the
                     * item underneath, so the index answers "where am I?" */
                    active: path === '/components/' + cat || holdsOpen,
                    children: holdsOpen ? byCategory[cat].filter(function (c) { return c.id === openComponent }).map(function (c) {
                        return { href: href('/component/' + c.id), label: c.name, active: true, sub: true }
                    }) : [],
                }
            }))
            groups.push({ id: 'components', title: t('index.components'), links: componentLinks })
        }

        groups.push({
            id: 'resources',
            title: t('index.resources'),
            links: [
                { href: href('/seats'), label: t('index.seats'), count: SEATS.length, active: path === '/seats' },
                { href: href('/icons'), label: t('index.icons'), count: ICONS.length, active: path === '/icons' },
                { href: href('/tokens'), label: t('index.tokens'), count: Object.keys(TOKENS.light).length, active: path === '/tokens' },
            ],
        })

        return groups
    }

    /**
     * One navigation row.
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
     * Render the left index.
     * @param path - current route path.
     */
    function renderIndex(path) {
        var chevron = iconSvg('chevron-down')
        indexEl.innerHTML = navModel(path).map(function (group) {
            var open = OPEN_GROUPS[group.id] !== false
            return '<div class="index__group" data-open="' + open + '" data-group="' + esc(group.id) + '">'
                + '<button class="index__head" type="button" aria-expanded="' + open + '">'
                + '<span class="index__chevron">' + chevron + '</span>'
                + '<span>' + esc(group.title) + '</span>'
                + '</button>'
                + '<div class="index__list"><div>'
                + group.links.map(function (link) {
                    return linkRow(link) + (link.children || []).map(linkRow).join('')
                }).join('')
                + '</div></div></div>'
        }).join('')

        Array.prototype.forEach.call(indexEl.querySelectorAll('.index__head'), function (head) {
            head.addEventListener('click', function () {
                var group = head.parentElement
                var open = group.getAttribute('data-open') === 'true'
                group.setAttribute('data-open', open ? 'false' : 'true')
                head.setAttribute('aria-expanded', open ? 'false' : 'true')
                OPEN_GROUPS[group.getAttribute('data-group')] = !open
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
        /* The boundary guard `[^\w<>/-]` matters: without it the tag name in
         * `<html lang="zh-CN">` is rewritten too, and the demo then renders a
         * literal `<:host lang="zh-CN">` line above its content. A selector is
         * only a selector when it is followed by `{` or `,`. */
        return String(demoHtml).replace(/(^|[^\w<>/-])(:root|html|body)(?=\s*[,{])/gu, function (_m, prefix) {
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
    function specimen(title, demoHtml) {
        if (demoHtml == null || demoHtml === '') return ''
        var id = 'demo-' + (demoSeq++)
        DEMOS[id] = demoHtml
        return '<div class="specimen">'
            + '<p class="specimen__label"><span>' + esc(title) + '</span></p>'
            + '<div class="specimen__stage" data-demo-id="' + id + '"></div>'
            + '</div>'
    }

    /**
     * Mount every staged demo into its own shadow root.
     * @param root - subtree to scan.
     */
    function mountDemos(root) {
        Array.prototype.forEach.call(root.querySelectorAll('[data-demo-id]'), function (host) {
            var html = DEMOS[host.getAttribute('data-demo-id')]
            if (html === undefined) return
            var shadow = host.attachShadow({ mode: 'open' })
            /* The first rule is the site's, the rest is the demo's own document:
             * both themes are already resolved into `--dsw-*` on the page, so the
             * specimen follows the page theme without a second token set. */
            shadow.innerHTML = '<style>'
                + ':host{display:block;font-family:var(--site-font);font-size:var(--site-text-body);color:var(--site-label);background:var(--site-bg-stage);border-radius:var(--site-radius-s);overflow:hidden}'
                + ':host *{box-sizing:border-box}'
                + '</style>'
                + toShadowMarkup(html)
        })
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

    /* ── motion bench ──────────────────────────────────────────────── */

    /** The five durations the spec hands to plugin authors. */
    var MOTION_DURATIONS = [100, 150, 200, 300, 350]

    /** The two curves the spec names. */
    var MOTION_CURVES = [
        { id: 'standard', value: 'cubic-bezier(0.40, 0, 0.20, 1)' },
        { id: 'linear', value: 'linear' },
    ]

    /**
     * The interactive motion bench embedded in the motion spec.
     *
     * A spec that only states "200ms" asks the reader to imagine it. Letting them
     * run two durations back to back is the one thing a paper document cannot do
     * and an HTML one can — which is the whole reason this reference is a site.
     * @returns html.
     */
    function motionLab() {
        return '<section class="lab" data-lab>'
            + '<p class="specimen__label"><span>' + esc(t('lab.motionTitle')) + '</span></p>'
            + '<p class="lab__note">' + esc(t('lab.motionNote')) + '</p>'
            + '<div class="lab__controls">'
            + '<div class="lab__group"><span class="lab__caption">' + esc(t('lab.duration')) + '</span>'
            + '<div class="segmented" data-lab-durations>' + MOTION_DURATIONS.map(function (ms) {
                return '<button type="button" data-ms="' + ms + '" aria-selected="' + (ms === 200) + '">' + ms + 'ms</button>'
            }).join('') + '</div></div>'
            + '<div class="lab__group"><span class="lab__caption">' + esc(t('lab.curve')) + '</span>'
            + '<div class="segmented" data-lab-curves>' + MOTION_CURVES.map(function (curve, i) {
                return '<button type="button" data-curve="' + esc(curve.value) + '" aria-selected="' + (i === 0) + '">'
                    + esc(t('lab.' + curve.id)) + '</button>'
            }).join('') + '</div></div>'
            + '<button class="lab__play" type="button" data-lab-play>' + esc(t('lab.play')) + '</button>'
            + '</div>'
            + '<div class="lab__stage" data-lab-stage><span class="lab__box" data-lab-box></span></div>'
            + '</section>'
    }

    /** Wire the motion bench, if the current page has one. */
    function mountMotionLab() {
        var lab = document.querySelector('[data-lab]')
        if (lab === null) return

        var box = lab.querySelector('[data-lab-box]')
        var stage = lab.querySelector('[data-lab-stage]')
        var duration = 200
        var curve = MOTION_CURVES[0].value
        var moved = false

        var play = function () {
            var travel = Math.max(0, stage.clientWidth - box.offsetWidth - 12)
            box.style.transition = 'transform ' + duration + 'ms ' + curve
            box.style.transform = moved ? 'translateX(' + travel + 'px)' : 'translateX(0px)'
        }

        lab.querySelector('[data-lab-play]').addEventListener('click', function () {
            moved = !moved
            play()
        })

        Array.prototype.forEach.call(lab.querySelectorAll('[data-lab-durations] button'), function (button) {
            button.addEventListener('click', function () {
                duration = Number(button.getAttribute('data-ms'))
                Array.prototype.forEach.call(button.parentElement.children, function (sibling) {
                    sibling.setAttribute('aria-selected', String(sibling === button))
                })
                moved = !moved
                play()
            })
        })

        Array.prototype.forEach.call(lab.querySelectorAll('[data-lab-curves] button'), function (button) {
            button.addEventListener('click', function () {
                curve = button.getAttribute('data-curve')
                Array.prototype.forEach.call(button.parentElement.children, function (sibling) {
                    sibling.setAttribute('aria-selected', String(sibling === button))
                })
                moved = !moved
                play()
            })
        })
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
            + '<div class="cards">'
            + card('home.cards.spec', (s.specs || 0) + ' ' + t('components.count'), '/spec')
            + card('home.cards.components', (s.components || 0) + ' ' + t('components.count'), '/components')
            + card('home.cards.seats', (s.seats || 0) + ' ' + t('components.count'), '/seats')
            + card('home.cards.icons', (s.icons || 0) + ' ' + t('components.count'), '/icons')
            + card('home.cards.tokens', (s.aliases || 0) + ' ' + t('components.count'), '/tokens')
            + card('home.cards.why', '', '/why')
            + '</div></section></div>'

        renderAside([
            { title: t('tokens.sourceTitle'), html: p(t('tokens.source')) },
            { title: t('tokens.depthTitle'), html: p(t('tokens.depth')) },
            { title: t('footer.generated'), html: p(String(D.generatedAt || '').slice(0, 19).replace('T', ' ')) },
        ])
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
        var s = D.stats || {}
        mainEl.innerHTML = '<div class="main-inner">'
            + '<div class="hero"><h1 class="hero__title">' + esc(t('why.title')) + '</h1>'
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
            + '<li><strong>' + esc(t('why.items.layout')) + '</strong></li>'
            + '<li><strong>' + esc(t('why.items.order')) + '</strong></li>'
            + '<li><strong>' + esc(t('why.items.motion')) + '</strong></li>'
            + '<li><strong>' + esc(t('why.items.iconGeometry')) + '</strong></li>'
            + '<li><strong>' + esc(t('why.items.conflict')) + '</strong></li>'
            + '</ul>'
            + '<h2>' + esc(t('why.proofTitle')) + '</h2>'
            + '<div class="callout callout--warn"><span class="callout__mark">!</span><div>'
            + '<p><code>shell.overlay</code> — ' + (s.seats ? '' : '') + esc(whyOverlayLine()) + '</p>'
            + '<p><code>settings.section</code> — ' + esc(whySettingsLine()) + '</p>'
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
            { title: t('spec.relatedNote'), html: p(t('why.proofTitle')) },
            { title: t('index.resources'), html: ul([t('index.seats'), t('index.icons'), t('index.tokens')]) },
        ])
    }

    /**
     * The measured `shell.overlay` finding, in the current language.
     * @returns sentence.
     */
    function whyOverlayLine() {
        return LANG === 'zh'
            ? '14 个占用者，其中 13 个没有声明 order，全部落在默认值 0——层级顺序由注册时序决定，不可预测。'
            : '14 occupants, 13 of them without an explicit order, all landing on the default 0 — stacking is decided by registration timing and is unpredictable.'
    }

    /**
     * The measured `settings.section` finding, in the current language.
     * @returns sentence.
     */
    function whySettingsLine() {
        return LANG === 'zh'
            ? '11 个占用者，其中三个把 order 都写成 40，顺序无法解释。'
            : '11 occupants, three of them declaring order 40 — the resulting order cannot be explained.'
    }

    /**
     * The spec list, or one document.
     * @param id - document id, when selected.
     */
    function pageSpec(id) {
        if (id == null) {
            mainEl.innerHTML = '<div class="main-inner"><div class="hero"><h1 class="hero__title">' + esc(t('spec.title')) + '</h1>'
                + '<p class="hero__lede">' + esc(t('spec.lede')) + '</p></div>'
                + '<div class="cards">' + SPECS.map(function (spec, i) {
                    return '<a class="card" href="' + esc(href('/spec/' + spec.id)) + '">'
                        + '<p class="card__meta">' + esc(t('groups.' + spec.group)) + ' · ' + String(i + 1).padStart(2, '0') + '</p>'
                        + '<p class="card__title">' + esc(specTitle(spec)) + '</p>'
                        + '<p class="card__body">' + spec.chars + ' ' + esc(t('spec.chars')) + '</p>'
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

        mainEl.innerHTML = '<div class="main-inner">'
            + crumbs([{ label: t('spec.title'), hash: '/spec' }, { label: specTitle(spec) }], '/spec')
            + (LANG === 'en' ? '<div class="callout"><span class="callout__mark">i</span><div><p>' + esc(t('spec.chineseOnly')) + '</p></div></div>' : '')
            + (spec.id === '40-motion' ? motionLab() : '')
            + '<article class="prose">' + spec.html + '</article></div>'

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
                { label: c.name },
            ], '/components/' + (c.category || 'uncategorized'))
            + '<div class="hero"><h1 class="hero__title">' + esc(c.name) + '</h1>'
            + '<p class="hero__lede">' + esc(toPlain(c.summary)) + '</p></div>'
            + (LANG === 'en' ? '<div class="callout"><span class="callout__mark">i</span><div><p>' + esc(t('components.chineseOnly')) + '</p></div></div>' : '')
            + specimen(t('components.preview'), c.demo)
            + (c.readmeHtml ? '<article class="prose">' + c.readmeHtml + '</article>' : '')
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
            + '<p class="card__title">' + esc(c.name) + '</p>'
            + '<p class="card__body">' + esc(toPlain(c.summary)) + '</p>'
            + '<p class="card__meta">' + esc(categoryLabel(c.category)) + '</p>'
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
            + '</tbody></table></div></section></div>'

        renderAside([
            { title: t('tokens.depthTitle'), html: p(t('tokens.depth')) },
            { title: t('tokens.sourceTitle'), html: p(t('tokens.source')) },
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
        else if (parts[0] === 'spec') pageSpec(parts[1] || null)
        else if (parts[0] === 'components') pageComponents(parts[1] || null)
        else if (parts[0] === 'component') pageComponents(parts[1] || null)
        else if (parts[0] === 'seats') pageSeats(r.q)
        else if (parts[0] === 'icons') pageIcons(r.q)
        else if (parts[0] === 'tokens') pageTokens(r.q)
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
        Array.prototype.forEach.call(mainEl.querySelectorAll('[data-back]'), function (button) {
            button.addEventListener('click', function () {
                location.hash = '#' + button.getAttribute('data-back')
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
        mountMotionLab()
        mainEl.scrollTop = 0
        mainEl.focus({ preventScroll: true })
    }

    /**
     * Render the quick links in the top bar.
     * @param path - current route.
     */
    function renderTopnav(path) {
        var links = [
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
        COMPONENTS.forEach(function (c) { out.push({ kind: t('topnav.components'), name: c.name, desc: toPlain(c.summary).slice(0, 70), hash: '/component/' + c.id }) })
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
            ? 'DeepSeek Design Resources — DeepSeek Harness 界面规范与资源'
            : 'DeepSeek Design Resources — interface spec and resources for DeepSeek Harness'
        Array.prototype.forEach.call(document.querySelectorAll('[data-t]'), function (node) {
            node.textContent = t(node.getAttribute('data-t'))
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
