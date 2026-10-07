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

  /* 图文并茂：每篇规范都要带至少一个能操作的演示——规范页只有文字的话，
   * 「看规范」就退化成「读规范」。演示由 markdown 里的 `demo:` 标记嵌进来，
   * 生成后是 `data-inline-demo` 的舞台。 */
  const noDemo = data.specs.filter(s => !s.doc.zh.html.includes('data-inline-demo=')).map(s => s.id)
  check('every spec carries an operable demo', noDemo.length === 0, noDemo.length === 0 ? `${data.specs.length}/${data.specs.length}` : noDemo.join(', '))

  /* 双语契约（docs/I18N.md）：每篇中文文档都在 data 里，每篇英文文档都是干净的——
   * 断言的是「英文页面不出现中文」，而唯一允许的中文是 <code> 里的产品实景串
   * （那是引用，不是我们的文案）。覆盖率数字由 gen-site 算出，这里只比一致性。 */
  const translatedSpecs = data.specs.filter(s => s.doc.en !== null)
  const translatedGuides = data.guides.filter(g => g.doc.en !== null)
  const translatedComponents = data.components.filter(c => c.doc.en !== null)
  check('every document carries a Chinese body', data.specs.every(s => s.doc.zh !== null)
    && data.guides.every(g => g.doc.zh !== null)
    && data.components.every(c => c.doc.zh !== null))
  check('i18n coverage counts what is actually translated', data.i18nCoverage.specs.translated === translatedSpecs.length
    && data.i18nCoverage.guides.translated === translatedGuides.length
    && data.i18nCoverage.components.translated === translatedComponents.length,
    `specs ${translatedSpecs.length}/${data.specs.length}, guides ${translatedGuides.length}/${data.guides.length}, components ${translatedComponents.length}/${data.components.length}`)

  /* 「两个仓库是一套」要在页面上成立：family.json 得进 data.js、得同时有 spec 与
   * runtime 两个成员，而且两侧的文案都得有（只有一份就是漏译）。 */
  const family = (data.family ?? {}).members ?? []
  const familyIds = family.map(m => m.id).sort().join(',')
  check('the set names both halves, in both languages',
    familyIds === 'runtime,spec'
    && family.every(m => typeof m.url === 'string' && m.url.startsWith('https://github.com/Physicolor/'))
    && family.every(m => ['zh', 'en'].every(lang => ['role', 'title', 'body', 'note']
      .every(field => typeof data.i18n[lang]?.set?.cards?.[m.id]?.[field] === 'string'))),
    `${family.length} members: ${familyIds}`)

  const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/u
  const cjkIn = s => CJK.test(String(s ?? ''))
  /* `<code>` 里可以引用产品实景串；别处出现中文就是漏译。`<code lang="zh-CN">` 是
   * 带英文释义的产品标签，同样属于引用，所以剥标签时要认属性。 */
  const codeSpan = /<code\b[^>]*>[\s\S]*?<\/code>/gu
  const outsideCode = html => String(html ?? '').replace(codeSpan, '')
  /* 引用了中文就必须紧跟释义：`data/product-labels.json` 的每条都会被 gen-site
   * 渲染成 <code lang="zh-CN">…</code><span class="site-gloss">…</span>。
   * 含 < > = 或引号的代码跨度是代码示例（`'设置分区'`、`<span>进行中</span>`），
   * 不是产品标签，不要求释义——它们旁边本来就有解释。 */
  const glossed = html => {
    const source = String(html ?? '')
    const spans = [...source.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/gu)]
    const unglossed = []
    for (const span of spans) {
      if (!cjkIn(span[1])) continue
      if (/[<>="']/u.test(span[1])) continue
      const after = source.slice(span.index + span[0].length, span.index + span[0].length + 40)
      if (!after.includes('site-gloss')) unglossed.push(span[1].slice(0, 30))
    }
    return unglossed
  }
  const latinOnlyProblems = []
  const unglossedProblems = []
  const checkEnglish = (label, ...htmls) => {
    for (const html of htmls) {
      const bad = glossed(html)
      if (bad.length > 0) unglossedProblems.push(`${label}: ${bad.join(' | ')}`)
    }
  }
  for (const s of translatedSpecs) {
    if (cjkIn(s.doc.en.title) || cjkIn(s.doc.en.summary) || cjkIn(outsideCode(s.doc.en.html))) latinOnlyProblems.push(`spec ${s.id}`)
    checkEnglish(`spec ${s.id}`, s.doc.en.html)
  }
  for (const g of translatedGuides) {
    if (cjkIn(g.doc.en.title) || cjkIn(g.doc.en.summary) || cjkIn(outsideCode(g.doc.en.html))
      || g.doc.en.tasks.some(cjkIn)) latinOnlyProblems.push(`guide ${g.id}`)
    checkEnglish(`guide ${g.id}`, g.doc.en.html)
  }
  for (const c of translatedComponents) {
    if (cjkIn(c.doc.en.summary) || cjkIn(outsideCode(c.doc.en.readmeHtml)) || cjkIn(outsideCode(c.doc.en.specHtml))
      || c.doc.en.whenToUse.some(cjkIn) || c.doc.en.whenNotToUse.some(cjkIn) || cjkIn(c.tags.en.join(' '))) {
      latinOnlyProblems.push(`component ${c.id}`)
    }
    checkEnglish(`component ${c.id}`, c.doc.en.html, c.doc.en.readmeHtml, c.doc.en.specHtml)
  }
  check('the English build contains no Chinese outside <code> quotes', latinOnlyProblems.length === 0,
    latinOnlyProblems.length === 0 ? `${translatedSpecs.length + translatedGuides.length + translatedComponents.length} documents` : latinOnlyProblems.join(', '))
  check('every Chinese quotation in the English build carries a gloss', unglossedProblems.length === 0,
    unglossedProblems.length === 0 ? 'all glossed' : unglossedProblems.slice(0, 4).join(' ;; '))
  const dictionaryCjk = /\u4e00-\u9fff|[\u3000-\u303f]/u
  check('the English dictionary is free of Chinese', !dictionaryCjk.test(JSON.stringify(data.i18n.en)),
    JSON.stringify(data.i18n.en).match(/[\u4e00-\u9fff]+/gu)?.slice(0, 5).join(', ') ?? '')

  /* 组件的归属不能含糊：清单里的每个 id 要么在 official、要么在 proposed；
   * proposed 必须写明它服务的真实场景（origins.json 的 scenes），
   * 没有真实场景的界面不该留在这个仓库里——那是编造。 */
  const originsJson = JSON.parse(await readFile(join(ROOT, 'components', 'origins.json'), 'utf8'))
  const originIds = [...(originsJson.official ?? []), ...(originsJson.proposed ?? [])]
  const componentIds = data.components.map(c => c.id)
  const unknownOrigin = originIds.filter(id => !componentIds.includes(id))
  check('origins lists only components that exist', unknownOrigin.length === 0, unknownOrigin.join(', '))
  const unlabelled = componentIds.filter(id => !originIds.includes(id))
  check('every component is labelled official or proposed', unlabelled.length === 0, unlabelled.join(', '))
  const sceneMissing = (originsJson.proposed ?? []).filter(id => (originsJson.scenes ?? {})[id] === undefined)
  check('every proposed component names its real scene', sceneMissing.length === 0, sceneMissing.join(', '))

  /* 元素清单的验收条件：产品侧每一个身份都要有家——要么规范里写下了它的尺寸，
   * 要么被明确判定「尺寸随内容走」。第三方插件的按插件搁置，不计入这条。
   * 这一条把「扫完并一一对应」变成 build 能判的断言，而不是一句自我评价。
   * 没扫过（data/ui-coverage.json 不存在）时不判，免得新克隆一上来就红。 */
  let coverageJson = { coverage: [] }
  try {
    coverageJson = JSON.parse(await readFile(join(ROOT, 'data', 'ui-coverage.json'), 'utf8'))
  } catch { /* 还没扫过 */ }
  if (coverageJson.coverage.length > 0) {
    const families = (JSON.parse(await readFile(join(ROOT, 'data', 'inventory-anchors.json'), 'utf8')).pluginFamilies ?? [])
    const isThirdParty = row => {
      const hay = `${row.key} ${row.cls ?? ''} ${row.slot ?? ''}`.toLowerCase()
      return row.pluginOwned === true || families.some(f => hay.includes(String(f.match).toLowerCase()))
    }
    const ownRows = coverageJson.coverage.filter(row => !isThirdParty(row))
    const unresolved = ownRows.filter(row => row.coverage !== 'covered' || row.described === false)
    check('every product element has a documented home', unresolved.length === 0,
      `${ownRows.length} own identities, ${unresolved.length} unresolved${unresolved.length === 0 ? '' : ': ' + unresolved.slice(0, 3).map(r => r.key).join(', ')}`)
  }
}

/* ── 3. browser ────────────────────────────────────────────────────── */

/* `DSHDR_STRUCTURAL_ONLY=1` stops after the static pass. CI uses it: the
 * browser pass needs a Chromium-family binary at a path this file knows, and a
 * pipeline whose green/red depends on the runner image's browser is a pipeline
 * that reports the wrong thing. The structural and static passes are the ones
 * that guard the repository's own claims — including "the English build renders
 * no Chinese" — and they are enough to gate a pull request. */
if (process.env.DSHDR_STRUCTURAL_ONLY === '1') {
  const failed = results.filter(r => r.ok !== true)
  console.log(`\n${results.filter(r => r.ok === true).length}/${results.length} checks passed (browser pass skipped)`)
  if (failed.length > 0) { console.log('failed:'); for (const f of failed) console.log(`  - ${f.name}${f.detail ? ` — ${f.detail}` : ''}`) }
  process.exit(failed.length === 0 ? 0 : 1)
}

/**
 * Locate a Chromium-family browser.
 * @returns the executable path, or null.
 */
function findBrowser() {
  /* An explicit override wins, so a machine with an unusual install does not
   * need this list edited. */
  for (const key of ['DSHDR_BROWSER', 'CHROME_PATH', 'PUPPETEER_EXECUTABLE_PATH']) {
    const value = process.env[key]
    if (value !== undefined && value !== '' && existsSync(value)) return value
  }
  const candidates = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
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
    const guideRoutes = (data && data.guides ? data.guides : []).map(guide => `#/guide/${guide.id}`)
    const routes = ['#/', '#/why', '#/spec', '#/components', '#/seats', '#/icons', '#/tokens', ...guideRoutes]

    await goto(base)
    check('home renders hero', await evaluate(`document.querySelector('.hero__title') !== null`))
    /* 首页必须点得到另一半（data/family.json）。这条把「两个仓库是一套」从一句话
     * 变成页面上能验收的东西：链接丢了、或者 family.json 没进 data.js，这里就红。 */
    check('home links to the runtime half of the set',
      await evaluate(`document.querySelectorAll('a.card[href^="https://github.com/Physicolor/dsh-ui-harmonizer"]').length === 1`),
      String(await evaluate(`document.querySelectorAll('a.card[href^="https://github.com/Physicolor/dsh-ui-harmonizer"]').length`)))
    check('left index built', await evaluate(`document.querySelectorAll('.index__link').length > 5`), String(await evaluate(`document.querySelectorAll('.index__link').length`)))
    check('cards rendered', await evaluate(`document.querySelectorAll('.card').length > 0`), String(await evaluate(`document.querySelectorAll('.card').length`)))
    const initialLocale = await evaluate(`(function(){
      var selected = document.querySelector("#lang button[aria-selected=true]");
      var code = selected ? selected.getAttribute("data-lang") : "";
      var locale = window.DSHDR && window.DSHDR.i18n && window.DSHDR.i18n[code];
      var iconTitle = locale && locale.home && locale.home.cards && locale.home.cards.icons && locale.home.cards.icons.title;
      return { code: code, eyebrow: locale && locale.home && locale.home.eyebrow, title: locale && locale.home && locale.home.title, iconTitle: iconTitle, renderedTitle: document.querySelector(".hero__title")?.textContent, renderedIconCard: !!iconTitle && document.body.innerText.includes(iconTitle) };
    })()`)
    check('stats include icons', await evaluate(`(function(){var tab=document.querySelector("#lang button[aria-selected=true]");var locale=window.DSHDR.i18n[tab.getAttribute("data-lang")];var title=locale&&locale.home&&locale.home.cards&&locale.home.cards.icons&&locale.home.cards.icons.title;return !!title&&document.body.innerText.includes(title)})()`), JSON.stringify(initialLocale))

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
    /* Use a page with real aside blocks and normalize its starting state. */
    await goto(base + '#/component/button')
    await evaluate(`(function(){var shell=document.getElementById('shell');if(shell.getAttribute('data-aside')!=='shown')document.getElementById('asideToggle').click();return 1})()`)
    await evaluate(`document.getElementById('asideToggle').click()`)
    check('aside collapses', await evaluate(`document.getElementById('shell').getAttribute('data-aside')==='hidden'`))
    await evaluate(`document.getElementById('asideToggle').click()`)
    check('aside restores', await evaluate(`document.getElementById('shell').getAttribute('data-aside')==='shown'`))

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

    /* The window page moved the browser; come back before probing the shell. */
    await goto(base + '#/spec/10-frame-layout')
    /* A demo document may mount a replica inside its own markup, so the shell
     * element and everything it renders live one shadow boundary deeper than the
     * demo stage. These checks therefore reach the shell element first and query
     * through it, instead of assuming a single level. */
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
    check('shell shows only the observed new-session row', shellInfo !== null && shellInfo.sessions === 1, shellInfo === null ? 'n/a' : String(shellInfo.sessions))

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

    /* The window-structure page is the "recognise the screen" entry: it must
     * carry the live replica (mounted and fitted), the band tables, and a link
     * back to the spec. A page that loses its replica still renders prose, so
     * without this check the most useful half could vanish silently. */
    await goto(base + '#/window')
    const windowPage = await evaluate(`(function () {
      function deep(node, selector, out) {
        out = out || [];
        var hits = node.querySelectorAll(selector);
        for (var i = 0; i < hits.length; i++) if (out.indexOf(hits[i]) === -1) out.push(hits[i]);
        var all = node.querySelectorAll('*');
        for (var j = 0; j < all.length; j++) if (all[j].shadowRoot) deep(all[j].shadowRoot, selector, out);
        return out;
      }
      var host = document.querySelector('.window__stage');
      var sr = host ? host.shadowRoot : null;
      var root = sr ? sr.querySelector('.sh-root') : null;
      var navEntry = 0;
      var links = document.querySelectorAll('.index__link');
      for (var i = 0; i < links.length; i++) if (links[i].getAttribute('href') === '#/window') navEntry++;
      return {
        regions: sr ? deep(sr, '.sh-side, .sh-head, .sh-flow, .sh-composer, .sh-right').length : 0,
        fitted: root ? getComputedStyle(root).transform !== 'none' : false,
        display: root ? getComputedStyle(root).display : null,
        rows: document.querySelectorAll('#main tbody tr').length,
        navEntry: navEntry,
        specLink: document.querySelector('.window__link') ? document.querySelector('.window__link').getAttribute('href') : null
      };
    })()`)
    check('window page carries the live replica', windowPage.regions >= 5 && windowPage.fitted && windowPage.display === 'flex',
      `regions=${windowPage.regions} fitted=${windowPage.fitted} display=${windowPage.display}`)
    check('window page carries the band tables', windowPage.rows >= 20, `${windowPage.rows} rows`)
    check('window page is reachable from the index', windowPage.navEntry === 1, `${windowPage.navEntry} nav entry`)
    check('window page links to the region-map spec', windowPage.specLink === '#/spec/05-region-map', String(windowPage.specLink))

    /* The worked example must actually operate: its whole point is that one
     * example answers placement, sizing and motion. A demo whose toggle does
     * nothing would still pass every structural check. */
    await goto(base + '#/guide/32-header-controls')
    const pinned = await evaluate(`(function () {
      var stages = document.querySelectorAll('[data-inline-demo]');
      for (var i = 0; i < stages.length; i++) {
        var sr = stages[i].shadowRoot;
        if (!sr) continue;
        var card = sr.querySelector('[data-pinned-card]');
        var toggle = sr.querySelector('.pinned__toggle');
        if (card === null || toggle === null) continue;
        var before = card.getAttribute('data-open');
        var timing = getComputedStyle(card).transitionDuration;
        var curve = getComputedStyle(card).transitionTimingFunction;
        toggle.click();
        var after = card.getAttribute('data-open');
        var pressed = toggle.getAttribute('aria-pressed');
        return { id: stages[i].getAttribute('data-inline-demo'), before: before, after: after, pressed: pressed, timing: timing, curve: curve };
      }
      return null;
    })()`)
    check('pinned-summary example is mounted', pinned !== null, JSON.stringify(pinned))
    check('pinned-summary toggle operates', pinned !== null && pinned.before === 'true' && pinned.after === 'false' && pinned.pressed === 'false',
      pinned === null ? 'n/a' : `${pinned.before} -> ${pinned.after}, aria-pressed=${pinned.pressed}`)
    check('pinned-summary card uses the frozen motion step', pinned !== null && /0\.3s|300ms/u.test(pinned.timing) && pinned.curve.indexOf('cubic-bezier') === 0,
      pinned === null ? 'n/a' : `${pinned.timing} ${pinned.curve}`)
    await goto(base + '#/spec/10-frame-layout')
    await evaluate(`(function(){var a=document.querySelector('.aside .outline__item a');if(a)a.click();return 1})()`)
    /* smooth scrolling is animated, so give it time before measuring */
    await new Promise(resolve => setTimeout(resolve, 900))
    const jumped = await evaluate(`(function(){var a=document.querySelector('.aside .outline__item a');if(!a)return null;var t=document.getElementById(a.getAttribute('data-jump'));return t===null?null:Math.round(t.getBoundingClientRect().top)})()`)
    check('outline jumps into the document', jumped !== null && jumped < 420, jumped === null ? 'n/a' : `heading at y=${jumped}`)
    check('theme icon shows the mode in force', await evaluate(`document.getElementById('themeIcon').innerHTML.indexOf('<svg') !== -1`))

    /* 规范页的顶部只认大标题：演示台、试验台一律排到正文里，不许抢标题的位置。 */
    await goto(base + '#/spec/40-motion')
    check('spec page leads with its own title', await evaluate(`(function(){
        var inner = document.querySelector('.main-inner');
        if (!inner) return false;
        var head = inner.firstElementChild;
        return head !== null && head.classList.contains('doc-head') && head.querySelector('h1') !== null;
    })()`))
    check('spec page carries no invented bench', await evaluate(`document.querySelectorAll('[data-lab]').length === 0`))
    check('spec title is not a breadcrumb', await evaluate(`document.querySelectorAll('.main-inner > .crumbs').length === 0`))

    /* 图文并茂不能只是「插了一个空壳」：逐个规范页确认它的演示真的把内容算出来了。
     * 脚本跑在 shadow root 里，必须用它自己的根查询（`window.__DSH_DEMO_ROOT`）——
     * 这一条同时防住两类退化：演示没写、演示写了但脚本静默不跑。 */
    const demoProbes = [
      ['00-overview', '.tag', 8, '规则与来源对照板的标签'],
      ['11-slot-seats', '[data-seat-tree] li', 11, '座位树 11 个代表座位'],
      ['20-controls', '[data-read]', 9, '控件量板 9 格读数'],
      ['30-tokens', '[data-radius]', 6, '圆角六档'],
      ['50-icons', '[data-chips] .chip', 12, '应用图标量板的读数 chip'],
      ['60-accessibility', '[data-contrast] tr', 5, '对比度实测表'],
      ['70-checklist', '[data-items] li', 5, '自检清单条目'],
      ['80-conflicts', '[data-overlay] tr', 14, 'shell.overlay 占用者 14 行'],
      /* 区域地图：这一页的演示必须真的把产品复刻挂起来——五个区域缺一个，
       * 「这一屏由什么组成」这张图就少一块。 */
      ['05-region-map', '.sh-side, .sh-head, .sh-flow, .sh-composer, .sh-right', 5, '一屏区域地图的五个区域'],
    ]
    /* `product replica` figures put their markup one boundary deeper than the
     * demo stage: the shell mounts in a shadow root of its own, so a plain
     * `shadowRoot.querySelector` finds nothing. Probe walks the whole subtree,
     * crossing nested shadow roots, and counts each node once — a match inside a
     * nested root is also reached from the root above.
     *
     * Written as a plain function and serialised with `String()`: the selector
     * is a parameter, so nothing has to be spliced into source text. */
    function demoProbe(selector) {
      function deep(node) {
        var out = []
        var push = function (found) { if (out.indexOf(found) === -1) out.push(found) }
        var walk = function (current) {
          if (current === null || current === undefined) return
          var hits = current.querySelectorAll(selector)
          for (var i = 0; i < hits.length; i++) push(hits[i])
          var all = current.querySelectorAll('*')
          for (var j = 0; j < all.length; j++) if (all[j].shadowRoot) walk(all[j].shadowRoot)
        }
        walk(node)
        return out
      }
      /* A replica that mounts but is not scaled is the other failure this probe
       * exists for: `.sh-root` draws at 1570px and relies on the scale set by
       * DSHShell.wire, so `transform: none` means the fit never ran and the
       * figure is a 1570px-wide box clipped by the column. Asking for
       * `.sh-root` therefore counts fitted replicas, not elements. */
      var stages = document.querySelectorAll('[data-inline-demo]')
      var total = 0
      var fitted = 0
      for (var i = 0; i < stages.length; i++) {
        var sr = stages[i].shadowRoot
        if (!sr) continue
        var hits = deep(sr)
        total += hits.length
        if (hits.length === 0) continue
        var allScaled = true
        for (var k = 0; k < hits.length; k++) {
          if (getComputedStyle(hits[k]).transform === 'none') allScaled = false
        }
        if (allScaled) fitted += 1
      }
      return selector === '.sh-root' ? fitted : total
    }
    const probeSource = '(' + String(demoProbe) + ')'
    for (const [id, selector, min, label] of demoProbes) {
      await goto(base + '#/spec/' + id)
      const counts = await evaluate(probeSource + '(' + JSON.stringify(selector) + ')')
      check(`spec demo renders — ${id}`, counts >= min, `${label}: ${counts} ≥ ${min}`)
    }
    /* Replicas must be mounted *and* fitted: a mount that silently fails renders
     * nothing, and a fit that silently fails renders at the replica's own 1570px
     * and gets clipped by the column. `frame-layout` carries three of them. */
    await goto(base + '#/spec/10-frame-layout')
    const fittedCount = await evaluate(probeSource + '(' + JSON.stringify('.sh-root') + ')')
    check('spec demo replicas are mounted and fitted', fittedCount === 3, `${fittedCount} scaled replicas (3 expected)`)
    await goto(base + '#/spec/40-motion')

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

    /* 演示是活的界面，而 shadow root 本身不是包含块：对话框演示里 `position: fixed;
     * inset: 0` 的遮罩会盖住整个站点窗口，视觉隐藏的 checkbox 会被丢到文档顶端、
     * 点它的标签就把某一栏滚走——两样都在真实浏览器里复现过（scripts/audit-demos.mjs）。
     * 这里把不变量钉住：演示框必须是绝对/固定定位后代的包含块，且没有后代逃出它。
     * 用对话框页当样本，因为那是唯一真的写 fixed 全铺遮罩的演示。 */
    await goto(base + '#/component/modal')
    const stageGuard = await evaluate(`(function(){
      var host = document.querySelector('[data-demo-id]');
      if (!host || !host.shadowRoot) return null;
      var cs = getComputedStyle(host);
      var box = host.getBoundingClientRect();
      var worst = null;
      Array.prototype.forEach.call(host.shadowRoot.querySelectorAll('*'), function (el) {
        var r = el.getBoundingClientRect();
        if (r.width < 1 && r.height < 1) return;
        var over = Math.max(box.left - r.left, r.right - box.right, box.top - r.top, r.bottom - box.bottom);
        if (worst === null || over > worst) worst = over;
      });
      return { position: cs.position, contain: cs.contain, over: Math.round(worst === null ? 0 : worst) };
    })()`)
    check('demo stage contains its overlays', stageGuard !== null && stageGuard.position === 'relative' && stageGuard.contain.indexOf('layout') !== -1, JSON.stringify(stageGuard))
    check('no demo element escapes its stage', stageGuard !== null && stageGuard.over <= 60, stageGuard === null ? 'n/a' : `worst overflow ${stageGuard.over}px`)
    check('index marks the open component', await evaluate(`document.querySelector('.index__link--sub[aria-current="page"]') !== null`))
    check('exactly one row is current', await evaluate(`document.querySelectorAll('.index__link[aria-current="page"]').length === 1`), String(await evaluate(`document.querySelectorAll('.index__link[aria-current="page"]').length`)))
    check('nav groups are captions, not toggles', await evaluate(`document.querySelectorAll('.index__head').length === 0`))
    check('a branch row folds from the row itself', await evaluate(`(function(){var b=document.querySelector('.index__branch');if(!b)return false;var was=b.getAttribute('data-open');b.querySelector('.index__row').click();var now=b.getAttribute('data-open');return was!==now})()`))
    check('the fold control is the row, not a second target', await evaluate(`document.querySelectorAll('.index__row .index__disclosure').length === 0 && document.querySelectorAll('.index__row[aria-expanded]').length > 0`))
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

   for (const [name, route] of [
     ['home', '#/'], ['window', '#/window'], ['components', '#/components'], ['component', '#/component/button'],
      ['guide-start', '#/guide/00-start'], ['guide-settings', '#/guide/20-pattern-settings'],
      ['guide-sidebar', '#/guide/21-pattern-sidebar-panel'],
     ['icons', '#/icons'], ['seats', '#/seats'], ['spec', '#/spec'],
      ['frame-layout', '#/spec/10-frame-layout'], ['icon-anatomy', '#/spec/50-icons'],
      ['tokens', '#/tokens'],
      /* 图文并茂那一轮的记录：每篇规范都带演示，截图也得留下它们的样子 */
      ['spec-controls', '#/spec/20-controls'], ['spec-tokens', '#/spec/30-tokens'],
      ['spec-seats', '#/spec/11-slot-seats'], ['spec-a11y', '#/spec/60-accessibility'],
      ['spec-checklist', '#/spec/70-checklist'], ['spec-conflicts', '#/spec/80-conflicts'],
      ['spec-overview', '#/spec/00-overview'], ['component-settings-page', '#/component/settings-page'],
      /* 演示容器与浮层：对话框的 fixed 遮罩、输入区选择器——都在这一组里核过 */
      ['component-modal', '#/component/modal'], ['component-toast', '#/component/toast'],
      ['spec-motion', '#/spec/40-motion'],
      /* 区域地图与中栏占用档位：本轮新增的两页，截图留档 */
      ['spec-region-map', '#/spec/05-region-map'],
      ['spec-middle-column', '#/spec/15-middle-column'],
      ['guide-middle-column', '#/guide/15-middle-column'],
    ]) {
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
