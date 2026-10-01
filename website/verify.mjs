/**
 * verify.mjs — self-check for the site, including a real browser render.
 *
 * Three passes:
 *   1. structural — required files and generated data are present and sane;
 *   2. static     — `data.js` parses and its counts agree with the collected JSON;
 *   3. browser    — Edge/Chrome headless renders the site over a local origin,
 *                   every route is visited, console errors are collected, and a
 *                   screenshot of the home page is written to docs/screenshots/.
 *
 * Nothing here needs a dev dependency: the browser is driven over the DevTools
 * protocol with the WebSocket client built into Node.
 *
 * Usage: node website/verify.mjs
 */

import { createServer } from 'node:http'
import { readFile, stat, mkdir, writeFile, rm } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = join(ROOT, 'website')
const SHOTS = join(ROOT, 'docs', 'screenshots')
/** `DSHDR_NO_SHOTS=1` skips the (slow) screenshot pass while iterating. */
const SKIP_SHOTS = process.env.DSHDR_NO_SHOTS === '1'

const results = []
/**
 * Record one check.
 * @param name - check name.
 * @param ok - whether it passed.
 * @param detail - optional detail.
 */
function check(name, ok, detail) {
  results.push({ name, ok, detail: detail ?? '' })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8' }

/* ── 1. structural ─────────────────────────────────────────────────── */

const required = [
  'package.json',
  'website/index.html',
  'website/css/tokens.css',
  'website/css/site.css',
  'website/css/dsh-tokens.css',
  'website/js/app.js',
  'website/js/data.js',
  'website/gen-site.mjs',
  'data/icons.json',
  'data/slots.json',
  'data/tokens.json',
]

for (const rel of required) {
  check(`file: ${rel}`, existsSync(join(ROOT, rel)))
}

/* ── 2. data ───────────────────────────────────────────────────────── */

const dataSrc = await readFile(join(SITE, 'js', 'data.js'), 'utf8').catch(() => '')
const match = /^window\.DSHDR = (.*);\s*$/mu.exec(dataSrc)
let data = null
try { data = match === null ? null : JSON.parse(match[1]) } catch { data = null }
check('data.js parses', data !== null)

if (data !== null) {
  const iconsJson = JSON.parse(await readFile(join(ROOT, 'data', 'icons.json'), 'utf8'))
  const slotsJson = JSON.parse(await readFile(join(ROOT, 'data', 'slots.json'), 'utf8'))
  const tokensJson = JSON.parse(await readFile(join(ROOT, 'data', 'tokens.json'), 'utf8'))
  check('icons count matches source', data.icons.length === iconsJson.icons.length, `${data.icons.length}`)
  check('seats count matches source', data.seats.length === slotsJson.seats.length, `${data.seats.length}`)
  check('token aliases match source', Object.keys(data.tokens.light).length === Object.keys(tokensJson.light).length, `${Object.keys(data.tokens.light).length}`)
  check('every icon carries inlined svg', data.icons.every(i => typeof i.svg === 'string' && i.svg.includes('<svg')), `${data.icons.filter(i => (i.svg || '').includes('<svg')).length}/${data.icons.length}`)
  check('brand fish mark present', typeof data.brand.fish === 'string' && data.brand.fish.includes('path'))
  check('every seat has a purpose', data.seats.every(s => typeof s.purpose === 'string' && s.purpose.length > 0))
  check('spec documents rendered', data.specs.length > 0, `${data.specs.length}`)
}

/* ── 3. browser ────────────────────────────────────────────────────── */

/**
 * Locate a Chromium-family browser.
 * @returns the executable path, or null.
 */
function findBrowser() {
  const candidates = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ]
  return candidates.find(p => existsSync(p)) ?? null
}

const browserPath = findBrowser()
if (browserPath === null) {
  check('browser available', false, 'no Edge/Chrome found — browser pass skipped')
} else {
  const PREFERRED_PORT = 4189
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    let path = decodeURIComponent(url.pathname)
    if (path.endsWith('/')) path += 'index.html'
    try {
      const body = await readFile(join(SITE, path.replace(/^\/+/u, '')))
      res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' }).end(body)
    } catch {
      res.writeHead(404).end('not found')
    }
  })
  /* A previous run's socket may still be in TIME_WAIT; falling back to an
   * ephemeral port keeps the check runnable instead of failing on EADDRINUSE. */
  await new Promise((resolve, reject) => {
    server.once('error', error => {
      if (error.code === 'EADDRINUSE') { server.listen(0, '127.0.0.1', resolve); return }
      reject(error)
    })
    server.listen(PREFERRED_PORT, '127.0.0.1', resolve)
  })
  const PORT = server.address().port

  const profile = join(tmpdir(), `dshdr-verify-${Date.now()}`)
  /* Port 0 lets the browser pick a free port and write it to
   * `<profile>/DevToolsActivePort`. A fixed port is a trap: a browser left over
   * from an earlier run answers first, this process then drives *that* browser
   * and every check reads an empty page. */
  const proc = spawn(browserPath, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--hide-scrollbars', '--window-size=1600,1200',
    `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank',
  ], { stdio: 'ignore' })

  /**
   * Read the DevTools port the browser actually chose.
   * @returns the port.
   */
  async function devtoolsPort() {
    const file = join(profile, 'DevToolsActivePort')
    for (let i = 0; i < 150; i++) {
      try {
        const port = Number(readFileSync(file, 'utf8').split('\n')[0])
        if (Number.isFinite(port) && port > 0) return port
      } catch { /* not written yet */ }
      await new Promise(r => setTimeout(r, 100))
    }
    throw new Error('DevToolsActivePort was never written')
  }

  /**
   * Poll the DevTools endpoint until it answers.
   * @param port - the port to ask.
   * @returns the list of targets.
   */
  async function devtools(port) {
    for (let i = 0; i < 60; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/list`)
        const list = await res.json()
        if (Array.isArray(list) && list.some(t => t.type === 'page')) return list
      } catch { /* not up yet */ }
      await new Promise(r => setTimeout(r, 250))
    }
    throw new Error('DevTools endpoint timeout')
  }

  try {
    const list = await devtools(await devtoolsPort())
    const page = list.find(t => t.type === 'page')
    check('browser launched', page !== undefined)

    const ws = new WebSocket(page.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('ws open failed')) })

    let nextId = 1
    const pending = new Map()
    const consoleErrors = []
    const pageErrors = []
    /** Load-event waiters; a hash-only navigation never fires one, so callers race it. */
    const loadWaiters = []

    ws.onmessage = event => {
      const msg = JSON.parse(event.data)
      if (msg.id !== undefined && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) reject(new Error(msg.error.message))
        else resolve(msg.result)
        return
      }
      if (msg.method === 'Page.loadEventFired') {
        for (const waiter of loadWaiters.splice(0)) waiter()
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value ?? a.description ?? '').join(' '))
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        pageErrors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text)
      }
    }

    /**
     * Send one CDP command.
     * @param method - CDP method.
     * @param params - parameters.
     * @param timeoutMs - per-call timeout (screenshots need far more than a query).
     * @returns the result.
     */
    function send(method, params, timeoutMs) {
      const id = nextId++
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject })
        ws.send(JSON.stringify({ id, method, params: params ?? {} }))
        setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`${method} timeout`)) } }, timeoutMs ?? 20000)
      })
    }

    await send('Page.enable')
    await send('Runtime.enable')

    /**
     * Navigate and wait for either the load event or a short settle window.
     *
     * A hash-only change does not fire `Page.loadEventFired`, and most routes
     * here differ from the previous one only in the fragment — so waiting for
     * the event alone would hang forever on the second route.
     * @param url - target url.
     */
    async function goto(url) {
      const loaded = new Promise(resolve => { loadWaiters.push(resolve) })
      await send('Page.navigate', { url })
      await Promise.race([loaded, new Promise(r => setTimeout(r, 2500))])
      await new Promise(r => setTimeout(r, 300))
    }

    /**
     * Evaluate an expression in the page.
     * @param expression - JS source.
     * @returns the value.
     */
    async function evaluate(expression) {
      const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
      if (out.exceptionDetails) throw new Error(out.exceptionDetails.text ?? 'evaluate threw')
      return out.result.value
    }

    const base = `http://127.0.0.1:${PORT}/`
    const routes = ['#/', '#/why', '#/spec', '#/components', '#/seats', '#/icons', '#/tokens']

    await goto(base)
    check('home renders hero', await evaluate(`document.querySelector('.hero__title') !== null`))
    check('left index built', await evaluate(`document.querySelectorAll('.index__link').length > 5`), String(await evaluate(`document.querySelectorAll('.index__link').length`)))
    check('cards rendered', await evaluate(`document.querySelectorAll('.card').length > 0`), String(await evaluate(`document.querySelectorAll('.card').length`)))
    check('stats include icons', await evaluate(`document.body.innerText.includes('官方图标集')`))

    // every route must render and leave the main column non-empty
    for (const route of routes) {
      await goto(base + route)
      const len = await evaluate(`document.getElementById('main').innerText.trim().length`)
      check(`route ${route} renders`, len > 40, `${len} chars`)
    }

    // icon gallery inlines real svg
    await goto(base + '#/icons')
    check('icon gallery draws svg', await evaluate(`document.querySelectorAll('.icon-cell svg').length > 50`), String(await evaluate(`document.querySelectorAll('.icon-cell svg').length`)))

    // seat directory renders rows
    await goto(base + '#/seats')
    const seatRows = await evaluate(`document.querySelectorAll('.table-wrap tbody tr').length`)
    check('seat table renders rows', seatRows > 50, `${seatRows} rows`)

    // spec documents render converted markdown
    await goto(base + '#/spec')
    check('spec list renders', await evaluate(`document.querySelectorAll('.card').length > 5`), String(await evaluate(`document.querySelectorAll('.card').length`)))

    // a component page must carry all three columns' worth of content
    await goto(base + '#/component/button')
    check('component page renders specimen', await evaluate(`document.querySelectorAll('.specimen').length === 1`))
    check('component page renders source', await evaluate(`document.querySelectorAll('.code pre').length >= 2`), String(await evaluate(`document.querySelectorAll('.code pre').length`)))
    check('component page renders rationale', await evaluate(`document.querySelectorAll('.aside__block').length >= 3`), String(await evaluate(`document.querySelectorAll('.aside__block').length`)))
    check('component page offers a guide/spec switch', await evaluate(`document.querySelectorAll('[data-doc-switch] button').length === 2`))
    check('spec panel starts hidden', await evaluate(`document.querySelector('[data-doc-panel="spec"]') !== null && document.querySelector('[data-doc-panel="spec"]').hidden === true`))
    await evaluate(`document.querySelector('[data-doc-switch] button[data-doc="spec"]').click()`)
    check('spec panel opens and the guide collapses', await evaluate(`document.querySelector('[data-doc-panel="spec"]').hidden === false && document.querySelector('[data-doc-panel="readme"]').hidden === true`))
    check('spec content is rendered', await evaluate(`document.querySelector('[data-doc-panel="spec"]').textContent.trim().length > 400`), String(await evaluate(`document.querySelector('[data-doc-panel="spec"]').textContent.trim().length`)))

    // a category page lists its members
    await goto(base + '#/components/controls')
    check('category page lists components', await evaluate(`document.querySelectorAll('.card').length >= 5`), String(await evaluate(`document.querySelectorAll('.card').length`)))

    // search returns hits for a known seat
    await goto(base)
    const hits = await evaluate(`(function(){var q=document.getElementById('q');q.value='shell.overlay';q.dispatchEvent(new Event('input'));return document.querySelectorAll('.results__item').length})()`)
    check('search finds a seat', hits > 0, `${hits} hits`)

    // token table renders swatches
    await goto(base + '#/tokens')
    check('token table renders', await evaluate(`document.querySelectorAll('.table-wrap tbody tr').length > 50`), String(await evaluate(`document.querySelectorAll('.table-wrap tbody tr').length`)))
    /* 颜色之外的另一半：圆角档位与高程配方。少这一块，令牌页看起来就只有颜色。 */
    const geometryRows = await evaluate(`(function(){
        var tables = [].slice.call(document.querySelectorAll('.table-wrap table'));
        var geo = tables.filter(function(x){ return x.textContent.indexOf('--dsw-radius-panel') !== -1 })[0];
        return geo ? geo.querySelectorAll('tbody tr').length : 0;
    })()`)
    check('token page carries the geometry table', geometryRows >= 12, `${geometryRows} rows`)

    /* 元素清单：从界面出发的那一页，缺了它这份资源就只能谈组件。 */
    await goto(base + '#/inventory')
    const inventoryRows = await evaluate(`document.querySelectorAll('.table-wrap tbody tr').length`)
    check('element inventory renders', inventoryRows > 50, `${inventoryRows} rows`)
    /* 深度检查：清单要区分「归了位」和「规范里真的写下了尺寸」。 */
    const describedBadges = await evaluate(`document.querySelectorAll('.badge').length`)
    check('element inventory distinguishes documented rows', describedBadges > 10, `${describedBadges} badges`)

    /* ── shell behaviour: one page, three independently scrolling columns ── */

    await goto(base)
    check('page itself does not scroll', await evaluate(`document.documentElement.scrollHeight <= document.documentElement.clientHeight + 1`))
    check('three columns scroll on their own', await evaluate(`(function(){var c=document.querySelectorAll('.col__scroll');if(c.length!==3)return false;for(var i=0;i<3;i++){if(getComputedStyle(c[i]).overflowY!=='auto')return false}return true})()`))
    check('top bar is glass', await evaluate(`(function(){var s=getComputedStyle(document.querySelector('.topbar'));var v=s.backdropFilter||s.webkitBackdropFilter||'';return v.indexOf('blur')!==-1})()`))
    check('custom scrollbar styling', await evaluate(`(function(){var sheets=[].slice.call(document.styleSheets);return sheets.some(function(s){try{return [].slice.call(s.cssRules).some(function(r){return (r.cssText||'').indexOf('scrollbar-thumb')!==-1})}catch(e){return false}})})()`))

    // rail toggles collapse and restore
    await evaluate(`document.getElementById('navToggle').click()`)
    check('nav collapses', await evaluate(`document.getElementById('shell').getAttribute('data-nav')==='hidden'`))
    await evaluate(`document.getElementById('navToggle').click()`)
    check('nav restores', await evaluate(`document.getElementById('shell').getAttribute('data-nav')==='shown'`))
    await evaluate(`document.getElementById('asideToggle').click()`)
    check('aside collapses', await evaluate(`document.getElementById('shell').getAttribute('data-aside')==='hidden'`))
    await evaluate(`document.getElementById('asideToggle').click()`)

    // drag handles: present, focusable, keyboard-operable
    check('two rail handles', await evaluate(`document.querySelectorAll('.resizer').length === 2`))
    const widthBefore = await evaluate(`getComputedStyle(document.getElementById('shell')).getPropertyValue('--nav-w').trim()`)
    await evaluate(`(function(){var h=document.querySelector('.resizer[data-resize="nav"]');h.focus();h.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));return 1})()`)
    const widthAfter = await evaluate(`getComputedStyle(document.getElementById('shell')).getPropertyValue('--nav-w').trim()`)
    check('rail resizes from the keyboard', widthBefore !== widthAfter, `${widthBefore} → ${widthAfter}`)

    // markdown conversion of the spec documents
    await goto(base + '#/spec/70-checklist')
    check('spec renders tables', await evaluate(`document.querySelectorAll('.prose table').length > 0`), String(await evaluate(`document.querySelectorAll('.prose table').length`)))
    check('spec carries an on-this-page outline', await evaluate(`document.querySelectorAll('.aside .outline__item').length > 2`), String(await evaluate(`document.querySelectorAll('.aside .outline__item').length`)))

    // embedded live demos: a figure in the prose that is real, operable UI
    await goto(base + '#/spec/10-frame-layout')
    const demoCount = await evaluate(`document.querySelectorAll('[data-inline-demo]').length`)
    check('layout doc embeds live demos', demoCount === 3, String(demoCount))
    /* A demo mounts into a shadow root; a demo that declares `data-shell` then
     * mounts the reproduced interface into a shadow root of its own. Both count
     * as mounted — the second just has one more level. */
    check('declared demos mount', await evaluate(`(function(){
        var stages = document.querySelectorAll('[data-inline-demo]');
        if (stages.length === 0) return false;
        var ok = 0;
        Array.prototype.forEach.call(stages, function (stage) {
            var sr = stage.shadowRoot;
            if (!sr) return;
            var shell = sr.querySelector('[data-shell]');
            if (shell && shell.shadowRoot && shell.shadowRoot.querySelector('.sh-root')) { ok++; return }
            if (sr.querySelectorAll('*').length > 4) ok++;
        });
        return ok === stages.length;
    })()`))
    check('embedded demos carry a caption', await evaluate(`document.querySelectorAll('.demo figcaption').length === document.querySelectorAll('[data-inline-demo]').length`))

    /* The product-shell reproduction: a document declares `data-shell`, and the
     * page mounts a measured copy of the real interface into a shadow root. */
    const shellInfo = await evaluate(`(function(){
        var stages = document.querySelectorAll('[data-inline-demo]');
        for (var i = 0; i < stages.length; i++) {
            var stage = stages[i].shadowRoot;
            if (!stage) continue;
            var host = stage.querySelector('[data-shell]');
            if (!host || !host.shadowRoot) continue;
            var sr = host.shadowRoot;
            var root = sr.querySelector('.sh-root');
            if (!root) continue;
            var side = sr.querySelector('.sh-side');
            var head = sr.querySelector('.sh-head');
            var stage = sr.querySelector('.sh-stage');
            var column = sr.querySelector('.sh-flow__column');
            var card = sr.querySelector('.sh-card');
            var dock = sr.querySelector('.sh-status');
            /* offsetWidth/offsetHeight, not getBoundingClientRect: the shell is
             * scaled to fit its container, so a rect reports screen pixels while
             * the layout these numbers describe lives in the 1570-wide coordinate
             * system the reproduction is drawn in. */
            return {
                side: side ? side.offsetWidth : -1,
                head: head ? head.offsetHeight : -1,
                ratio: side ? Math.round(side.offsetWidth / 1570 * 1000) / 1000 : -1,
                scale: stage ? Math.round((stage.getBoundingClientRect().height / 1010) * 1000) / 1000 : -1,
                sessions: sr.querySelectorAll('.sh-session').length,
                column: column ? column.offsetWidth : -1,
                card: card ? card.offsetWidth : -1,
                dock: dock ? dock.offsetHeight : -1,
                tools: sr.querySelectorAll('.sh-head__tools > *').length
            };
        }
        return null;
    })()`)
    check('shell reproduction mounts', shellInfo !== null, JSON.stringify(shellInfo))
    check('shell left rail is 280px', shellInfo !== null && Math.abs(shellInfo.side - 280) <= 2, shellInfo === null ? 'n/a' : shellInfo.side + 'px')
    /* The whole point of scaling rather than stretching: the rail has to keep the
     * share of the frame it has in the product (280 / 1570 = 17.8%). */
    check('shell keeps the product proportion', shellInfo !== null && Math.abs(shellInfo.ratio - 0.178) <= 0.003, shellInfo === null ? 'n/a' : String(shellInfo.ratio))
    /* 会话头部在会话页是 50 高（页签 26、下划线落在 y 37..38）；采集值见
     * docs/reference/README.md 的「会话页的横向几何」。 */
    check('shell session header is 50px', shellInfo !== null && Math.abs(shellInfo.head - 50) <= 2, shellInfo === null ? 'n/a' : shellInfo.head + 'px')
    /* 一段话能有多宽，取决于这条阅读列，而不是中栏宽度。 */
    check('shell reading column is 748px', shellInfo !== null && Math.abs(shellInfo.column - 748) <= 2, shellInfo === null ? 'n/a' : shellInfo.column + 'px')
    check('shell composer card is 780px', shellInfo !== null && Math.abs(shellInfo.card - 780) <= 2, shellInfo === null ? 'n/a' : shellInfo.card + 'px')
    /* 卡下方 dock：padding-top 4 + 内容 22 = 26。 */
    check('shell composer dock is 26px', shellInfo !== null && Math.abs(shellInfo.dock - 26) <= 2, shellInfo === null ? 'n/a' : shellInfo.dock + 'px')
    /* 顶栏右上角：打开方式分段按钮、省略号、右侧边栏开关，三样都要在。 */
    check('shell top strip carries the three real tools', shellInfo !== null && shellInfo.tools === 3, shellInfo === null ? 'n/a' : String(shellInfo.tools))
    check('shell shows demo sessions', shellInfo !== null && shellInfo.sessions >= 3, shellInfo === null ? 'n/a' : String(shellInfo.sessions))

    const shellToggle = await evaluate(`(function(){
        var stages = document.querySelectorAll('[data-inline-demo]');
        for (var i = 0; i < stages.length; i++) {
            var stage = stages[i].shadowRoot;
            if (!stage) continue;
            var host = stage.querySelector('[data-shell]');
            if (!host || !host.shadowRoot) continue;
            var sr = host.shadowRoot;
            var root = sr.querySelector('.sh-root');
            if (!root) continue;
            var button = sr.querySelector('[data-action="toggle-left"]');
            if (!button) return 'no button';
            button.click();
            var after = root.getAttribute('data-left');
            button.click();
            return after + '->' + root.getAttribute('data-left');
        }
        return 'no shell';
    })()`)
    check('shell side rail folds and unfolds', shellToggle === 'closed->open', shellToggle)

    /* The rail width animates, so set it, let the transition finish, then read
     * the box — reading immediately returns the old width. */
    await evaluate(`(function(){
        var stages = document.querySelectorAll('[data-inline-demo]');
        for (var i = 0; i < stages.length; i++) {
            var stage = stages[i].shadowRoot;
            if (!stage) continue;
            var host = stage.querySelector('[data-shell]');
            if (!host || !host.shadowRoot) continue;
            var root = host.shadowRoot.querySelector('.sh-root');
            if (!root) continue;
            root.style.setProperty('--sh-side-w', '320px');
            return 1;
        }
        return 0;
    })()`)
    await new Promise(resolve => setTimeout(resolve, 600))
    const shellResize = await evaluate(`(function(){
        var stages = document.querySelectorAll('[data-inline-demo]');
        for (var i = 0; i < stages.length; i++) {
            var stage = stages[i].shadowRoot;
            if (!stage) continue;
            var host = stage.querySelector('[data-shell]');
            if (!host || !host.shadowRoot) continue;
            var sr = host.shadowRoot;
            var root = sr.querySelector('.sh-root');
            var side = sr.querySelector('.sh-side');
            if (!root || !side) continue;
            return getComputedStyle(root).getPropertyValue('--sh-side-w').trim()
                + '|' + side.offsetWidth + 'px';
        }
        return 'no shell';
    })()`)
    check('shell side rail responds to a width change', shellResize === '320px|320px', shellResize)
    await evaluate(`(function(){var a=document.querySelector('.aside .outline__item a');if(a)a.click();return 1})()`)
    /* smooth scrolling is animated, so give it time before measuring */
    await new Promise(resolve => setTimeout(resolve, 900))
    const jumped = await evaluate(`(function(){var a=document.querySelector('.aside .outline__item a');if(!a)return null;var t=document.getElementById(a.getAttribute('data-jump'));return t===null?null:Math.round(t.getBoundingClientRect().top)})()`)
    check('outline jumps into the document', jumped !== null && jumped < 420, jumped === null ? 'n/a' : `heading at y=${jumped}`)
    check('theme icon shows the mode in force', await evaluate(`document.getElementById('themeIcon').innerHTML.indexOf('<svg') !== -1`))

    // the motion spec carries a bench you can actually operate
    await goto(base + '#/spec/40-motion')
    check('motion bench renders', await evaluate(`document.querySelectorAll('[data-lab]').length === 1`))
    await evaluate(`document.querySelector('[data-lab-play]').click()`)
    check('motion bench animates', await evaluate(`(document.querySelector('[data-lab-box]').style.transform || '').indexOf('translateX') === 0`))
    await evaluate(`document.querySelector('[data-lab-durations] button[data-ms="350"]').click()`)
    check('motion bench switches duration', await evaluate(`document.querySelector('[data-lab-box]').style.transition.indexOf('350ms') !== -1`))
    await evaluate(`document.querySelector('[data-lab-curves] button[data-curve="linear"]').click()`)
    check('motion bench switches curve', await evaluate(`document.querySelector('[data-lab-box]').style.transition.indexOf('linear') !== -1`))

    // bilingual switch
    await goto(base)
    await evaluate(`document.querySelector('#lang button[data-lang="en"]').click()`)
    check('language switches to english', await evaluate(`document.documentElement.lang === 'en'`), await evaluate(`document.documentElement.lang`))
    const firstGroup = await evaluate(`(function(){var el=document.querySelector('.index__title');return el===null?'':el.textContent.trim()})()`)
    check('english chrome is translated', firstGroup !== '' && !/[\u4e00-\u9fa5]/u.test(firstGroup), firstGroup)
    check('english search placeholder', await evaluate(`document.getElementById('q').placeholder.toLowerCase().indexOf('search') !== -1`))
    await evaluate(`document.querySelector('#lang button[data-lang="zh"]').click()`)
    check('language switches back', await evaluate(`document.documentElement.lang === 'zh-CN'`))

    // the specimen renders into a shadow root — an iframe under `file://` is an
    // opaque origin, so its height cannot be read and the preview degrades
    await goto(base + '#/component/button')
    const demoInfo = await evaluate('(function(){var h=document.querySelector(".specimen__stage");if(!h)return null;var s=h.shadowRoot;if(!s)return null;return {height:Math.round(h.getBoundingClientRect().height),nodes:s.querySelectorAll("*").length,text:(s.textContent||"").trim().length}})()')
    check('specimen mounts a shadow root', demoInfo !== null && demoInfo.nodes > 3, JSON.stringify(demoInfo))
    check('specimen lays out at real height', demoInfo !== null && demoInfo.height > 60, demoInfo === null ? 'n/a' : `${demoInfo.height}px`)
    check('specimen carries its demo text', demoInfo !== null && demoInfo.text > 20)
    /* `textContent` would include the shadow root's own <style> text, where
     * `:host` legitimately appears — so only non-style subtrees are searched. */
    check('no selector text leaks into the specimen', await evaluate('(function(){var h=document.querySelector(".specimen__stage");if(!h||!h.shadowRoot)return false;var parts=h.shadowRoot.querySelectorAll(":scope > *:not(style)");var text="";Array.prototype.forEach.call(parts,function(n){text+=n.textContent||""});return text.indexOf(":host")===-1&&text.indexOf("lang=")===-1})()'))
    /* `.body {` rewritten as `.:host {` is an invalid selector the parser drops
     * without a word, so the demo silently loses that rule. */
    check('no selector was rewritten into an invalid one', await evaluate('(function(){var bad=0;Array.prototype.forEach.call(document.querySelectorAll("[data-demo-id],[data-inline-demo]"),function(host){if(!host.shadowRoot)return;Array.prototype.forEach.call(host.shadowRoot.querySelectorAll("style"),function(sheet){if(/[\\w#.-]:host/u.test(sheet.textContent))bad++})});return bad===0})()'))
    check('breadcrumb with a back control', await evaluate(`document.querySelectorAll('.crumbs__back').length === 1 && document.querySelectorAll('.crumbs a').length >= 1`))
    check('index marks the open component', await evaluate(`document.querySelector('.index__link--sub[aria-current="page"]') !== null`))
    check('exactly one row is current', await evaluate(`document.querySelectorAll('.index__link[aria-current="page"]').length === 1`), String(await evaluate(`document.querySelectorAll('.index__link[aria-current="page"]').length`)))
    check('nav groups are captions, not toggles', await evaluate(`document.querySelectorAll('.index__head').length === 0`))
    check('branches fold from the right-end control', await evaluate(`(function(){var b=document.querySelector('.index__branch');if(!b)return false;var was=b.getAttribute('data-open');b.querySelector('.index__disclosure').click();var now=b.getAttribute('data-open');return was!==now})()`))
    check('folded branches keep their children', await evaluate(`(function(){var b=document.querySelector('.index__branch[data-open="false"]');return b!==null&&b.querySelectorAll('.index__children .index__link').length>0})()`))
    check('tooltip bubble is self-drawn', await evaluate(`document.querySelectorAll('body > .tip').length === 1`))
    check('source is folded by default', await evaluate(`document.querySelectorAll('.code[data-fold="true"]').length >= 1`))
    await evaluate(`document.querySelector('[data-fold-toggle]').click()`)
    check('source unfolds', await evaluate(`document.querySelector('.code').getAttribute('data-fold') === 'false'`))

    // theme switch mirrors onto the specimen tokens
    await evaluate(`document.getElementById('theme').click()`)
    check('dark theme applies', await evaluate(`document.body.hasAttribute('data-ds-dark-theme')`))
    await evaluate(`document.getElementById('theme').click()`)
    check('light theme restores', await evaluate(`!document.body.hasAttribute('data-ds-dark-theme')`))

    check('no uncaught page errors', pageErrors.length === 0, pageErrors.slice(0, 2).join(' | '))
    check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '))

    // screenshots for the record — a slow first paint must not fail the run
    if (SKIP_SHOTS) {
      console.log('SKIP  screenshots (DSHDR_NO_SHOTS=1)')
    } else {
    await mkdir(SHOTS, { recursive: true })
    let shots = 0

    /**
     * Photograph one route.
     * @param name - output file stem.
     * @param route - hash route.
     */
    async function shoot(name, route) {
      try {
        await goto(base + route)
        // a leftover query from the search check would sit over the screenshot
        await evaluate(`(function(){var q=document.getElementById('q');if(q){q.value='';q.dispatchEvent(new Event('input'))}return 1})()`)
        const shot = await send('Page.captureScreenshot', { format: 'png' }, 90000)
        await writeFile(join(SHOTS, `site-${name}.png`), Buffer.from(shot.data, 'base64'))
        shots++
      } catch (error) {
        console.log(`WARN  screenshot ${name} skipped — ${error.message}`)
      }
    }

    for (const [name, route] of [['home', '#/'], ['components', '#/components'], ['component', '#/component/button'], ['icons', '#/icons'], ['seats', '#/seats'], ['spec', '#/spec'], ['frame-layout', '#/spec/10-frame-layout'], ['icon-anatomy', '#/spec/50-icons'], ['tokens', '#/tokens']]) {
      await shoot(name, route)
    }

    /* A dark pass: several defects a shell like this fixes are invisible in
     * light mode and obvious in dark, so the record has to include both. */
    await goto(base)
    if (!(await evaluate(`document.body.hasAttribute('data-ds-dark-theme')`))) {
      await evaluate(`document.getElementById('theme').click()`)
    }
    for (const [name, route] of [['home-dark', '#/'], ['component-dark', '#/component/button']]) {
      await shoot(name, route)
    }
    await evaluate(`document.getElementById('theme').click()`)

    check('screenshots written', shots > 0, `${shots} files`)
    }
    ws.close()
  } catch (error) {
    check('browser pass completed', false, error.message)
  } finally {
    /* `proc.kill()` leaves the renderer children alive on Windows, and those
     * orphans are what poison the next run. Kill the tree. */
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      proc.kill('SIGKILL')
    }
    server.close()
    await rm(profile, { recursive: true, force: true }).catch(() => {})
  }
}

/* ── summary ───────────────────────────────────────────────────────── */

const failed = results.filter(r => !r.ok)
console.log('')
console.log(`${results.length - failed.length}/${results.length} checks passed`)
if (failed.length > 0) {
  console.log('failed:')
  for (const f of failed) console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ''}`)
  process.exit(1)
}
