/**
 * audit-demos.mjs — 在真实浏览器里把每个演示逐个点一遍。
 *
 * 起因：演示是活的界面，而「活」意味着能点坏。已经出过两次同类事故——
 * 点了选择器整个窗口变白（浮层逃出演示框盖住整页）、折叠目录里按钮自带的边框把
 * 行画成一个个方框。静态检查看不见这些：DOM 是对的，几何是错的。
 *
 * 做法：逐页打开站点，对每个演示（组件 specimen 与规范页内嵌 demo）的 shadow root
 * 里每一个可交互元素，合成点击一次，然后量三件事：
 *   1. 有没有元素的盒子盖住 ≥85% 视口（浮层逃逸、遮罩铺满）；
 *   2. 有没有元素的盒子超出演示框 60px 以上（飞出去）；
 *   3. 演示框自己的高度有没有暴涨（内容把容器撑开）。
 * 任何一条命中就打印出来，退出码 1。
 *
 * Usage: node scripts/audit-demos.mjs [--route "#/component/modal"] [--verbose]
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = join(ROOT, 'website')
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png',
}

const argv = process.argv.slice(2)
const ONLY = argv.includes('--route') ? argv[argv.indexOf('--route') + 1] : null
const VERBOSE = argv.includes('--verbose')

/**
 * 找 Chromium 系浏览器。
 * @returns 可执行文件路径，找不到返回 null。
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

/**
 * 路由清单：组件页 + 带演示的规范页。
 * @returns 路由数组。
 */
function routes() {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'components', 'index.json'), 'utf8'))
  const componentRoutes = (manifest.components ?? []).map(c => `#/component/${c.id}`)
  const specRoutes = readdirSync(join(ROOT, 'spec'))
    .filter(f => f.endsWith('.md'))
    .sort()
    .filter(f => readFileSync(join(ROOT, 'spec', f), 'utf8').includes('demo:'))
    .map(f => `#/spec/${f.replace(/\.md$/u, '')}`)
  const landing = ['#/components', '#/spec', '#/icons', '#/seats', '#/tokens', '#/inventory']
  return [...componentRoutes, ...specRoutes, ...landing]
}

const browserPath = findBrowser()
if (browserPath === null) {
  console.error('no Edge/Chrome found')
  process.exit(1)
}

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
await new Promise((resolve, reject) => {
  server.once('error', error => {
    if (error.code === 'EADDRINUSE') { server.listen(0, '127.0.0.1', resolve); return }
    reject(error)
  })
  server.listen(4191, '127.0.0.1', resolve)
})
const PORT = server.address().port

const profile = join(tmpdir(), `dshdr-audit-${Date.now()}`)
const proc = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--window-size=1600,1200',
  `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank',
], { stdio: 'ignore' })

/**
 * 读浏览器自己选的调试端口。
 * @returns 端口号。
 */
async function devtoolsPort() {
  const file = join(profile, 'DevToolsActivePort')
  for (let i = 0; i < 150; i++) {
    try {
      const port = Number(readFileSync(file, 'utf8').split('\n')[0])
      if (Number.isFinite(port) && port > 0) return port
    } catch { /* 还没写 */ }
    await new Promise(r => setTimeout(r, 100))
  }
  throw new Error('DevToolsActivePort was never written')
}

const list = await (async () => {
  const port = await devtoolsPort()
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`)
      const targets = await res.json()
      if (Array.isArray(targets) && targets.some(t => t.type === 'page')) return targets
    } catch { /* 还没起 */ }
    await new Promise(r => setTimeout(r, 250))
  }
  throw new Error('DevTools endpoint timeout')
})()

const page = list.find(t => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('ws open failed')) })

let nextId = 1
const pending = new Map()
const pageErrors = []
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
  if (msg.method === 'Page.loadEventFired') for (const waiter of loadWaiters.splice(0)) waiter()
  if (msg.method === 'Runtime.exceptionThrown') {
    pageErrors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text)
  }
}

/**
 * 发一条 CDP 命令。
 * @param method - 方法名。
 * @param params - 参数。
 * @returns 结果。
 */
function send(method, params) {
  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params: params ?? {} }))
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`${method} timeout`)) } }, 30000)
  })
}

await send('Page.enable')
await send('Runtime.enable')

/**
 * 打开一个地址并等它稳定。
 * @param url - 目标地址。
 */
async function goto(url) {
  const loaded = new Promise(resolve => { loadWaiters.push(resolve) })
  await send('Page.navigate', { url })
  await Promise.race([loaded, new Promise(r => setTimeout(r, 2500))])
  await new Promise(r => setTimeout(r, 350))
}

/**
 * 在页面里求值。
 * @param expression - 表达式。
 * @returns 值。
 */
async function evaluate(expression) {
  const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (out.exceptionDetails) throw new Error(out.exceptionDetails.text ?? 'evaluate threw')
  return out.result.value
}

/* 遍历一棵子树，遇到 shadow root 就进去——产品复刻（website/shell）是嵌在演示里的
   第二层 shadow root，只查第一层的话，那些真正会弹菜单的触发按钮一个也点不到。 */
const WALK = `
  function auditWalk(root, fn) {
    var nodes = root.querySelectorAll('*');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      fn(el);
      if (el.shadowRoot) auditWalk(el.shadowRoot, fn);
    }
  }`

/* 量一次：把每个演示框里的最大盒子、越界盒子、框高都报回来，外加页面里所有
   「滚动位置不为 0 的容器」——点一下就把某一栏滚走 ~950px 这种事，只有看滚动位置才抓得到。 */
const MEASURE = `(function () {
  ${WALK}
  var hosts = document.querySelectorAll('[data-demo-id],[data-inline-demo]');
  var vw = innerWidth, vh = innerHeight;
  var out = [];
  for (var i = 0; i < hosts.length; i++) {
    var host = hosts[i];
    if (!host.shadowRoot) continue;
    var box = host.getBoundingClientRect();
    var worst = null, escaped = null, count = 0;
    auditWalk(host.shadowRoot, function (el) {
      if (el.tagName === 'STYLE' || el.tagName === 'SCRIPT') return;
      var r = el.getBoundingClientRect();
      if (r.width < 1 && r.height < 1) return;
      count++;
      var style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') return;
      var area = r.width * r.height;
      if (style.opacity !== '0' && area > vw * vh * 0.85 && (worst === null || area > worst.area)) {
        worst = { tag: el.tagName, cls: String(el.className || '').slice(0, 60), area: Math.round(area), rect: [Math.round(r.width), Math.round(r.height)] };
      }
      var over = Math.max(box.left - r.left, r.right - box.right, box.top - r.top, r.bottom - box.bottom);
      if (over > 60 && (escaped === null || over > escaped.over)) {
        escaped = { tag: el.tagName, cls: String(el.className || '').slice(0, 60), over: Math.round(over), rect: [Math.round(r.width), Math.round(r.height)] };
      }
    });
    out.push({
      id: host.getAttribute('data-demo-id') || host.getAttribute('data-inline-demo') || ('#' + i),
      height: Math.round(box.height),
      nodes: count,
      viewportCover: worst,
      escaped: escaped,
    });
  }
  var scrollers = [];
  var nodes = document.querySelectorAll('*');
  for (var k = 0; k < nodes.length; k++) {
    var n = nodes[k];
    if (n.scrollTop > 0 || n.scrollLeft > 0) {
      scrollers.push((n.id || String(n.className || '').split(' ')[0] || n.tagName) + ':' + Math.round(n.scrollTop) + ',' + Math.round(n.scrollLeft));
    }
  }
  return { demos: out, scrollers: scrollers.join(' | ') };
})()`

/* 逐演示列可交互元素（含嵌套 shadow root 里的产品复刻），点其中第 n 个。 */
const INTERACTIVES = `(function () {
  ${WALK}
  var SELECTOR = 'button,[role="switch"],[role="radio"],[role="checkbox"],input,label,a[href],select,summary';
  var hosts = document.querySelectorAll('[data-demo-id],[data-inline-demo]');
  var out = [];
  for (var i = 0; i < hosts.length; i++) {
    if (!hosts[i].shadowRoot) continue;
    var index = 0;
    auditWalk(hosts[i].shadowRoot, function (el) {
      if (!el.matches(SELECTOR)) return;
      var tag = el.tagName.toLowerCase();
      var type = el.getAttribute('type') || '';
      if (tag === 'input' && type === 'hidden') return;
      var r = el.getBoundingClientRect();
      var onScreen = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && r.width > 0 && r.height > 0;
      out.push({
        host: i,
        index: index++,
        tag: tag,
        type: type,
        cls: String(el.className || '').slice(0, 50),
        text: (el.textContent || '').trim().slice(0, 24),
        label: el.getAttribute('aria-label') || '',
        visible: onScreen,
      });
    });
  }
  return out;
})()`

/**
 * 点第 host 个演示里的第 index 个可交互元素（同一套遍历顺序）。
 * @param host - 演示序号。
 * @param index - 该演示内可交互元素序号。
 * @returns 是否点到。
 */
function clickExpr(host, index) {
  return `(function () {
    ${WALK}
    var SELECTOR = 'button,[role="switch"],[role="radio"],[role="checkbox"],input,label,a[href],select,summary';
    var hosts = document.querySelectorAll('[data-demo-id],[data-inline-demo]');
    var el = hosts[${host}];
    if (!el || !el.shadowRoot) return false;
    var found = null, seen = 0;
    auditWalk(el.shadowRoot, function (node) {
      if (found !== null || !node.matches(SELECTOR)) return;
      if (node.tagName.toLowerCase() === 'input' && (node.getAttribute('type') || '') === 'hidden') return;
      if (seen === ${index}) found = node;
      seen++;
    });
    if (found === null) return false;
    if (found.tagName === 'INPUT' && found.type === 'checkbox') found.checked = !found.checked;
    found.click();
    return true;
  })()`
}

const findings = []
const base = `http://127.0.0.1:${PORT}/`
const allRoutes = ONLY === null ? routes() : [ONLY]
let demosSeen = 0
let controlsSeen = 0
let clicks = 0

await goto(base)

/**
 * 记录一条问题（去重：同一路由+演示+类型只留第一条）。
 * @param entry - { route, demo, what, detail, control }。
 */
function report(entry) {
  const key = `${entry.route}|${entry.demo}|${entry.what}`
  if (findings.some(f => `${f.route}|${f.demo}|${f.what}` === key)) return
  findings.push(entry)
}

for (const route of allRoutes) {
  await goto(base + route)
  const before = await evaluate(MEASURE)
  const interactives = await evaluate(INTERACTIVES)
  demosSeen += before.demos.length
  controlsSeen += interactives.length

  if (VERBOSE || interactives.length === 0) {
    console.log(`${route}  demos=${before.demos.length}  controls=${interactives.length}`)
  }

  /* 先看「没点之前」的样子：一个演示如果一上来就盖住整页，那不需要点也算问题。 */
  for (const demo of before.demos) {
    if (demo.viewportCover !== null) {
      report({
        route, demo: demo.id, what: '初始就覆盖视口',
        detail: `${demo.viewportCover.tag}.${demo.viewportCover.cls} ${demo.viewportCover.rect.join('×')}`,
        control: '—',
      })
    }
    if (demo.escaped !== null) {
      report({
        route, demo: demo.id, what: '初始就逃出演示框',
        detail: `${demo.escaped.tag}.${demo.escaped.cls} 超出 ${demo.escaped.over}px`,
        control: '—',
      })
    }
  }

  /* 逐个点：同一页里不重载，点完一次量一次。 */
  for (const control of interactives) {
    const clicked = await evaluate(clickExpr(control.host, control.index))
    if (clicked !== true) continue
    clicks++
    await new Promise(r => setTimeout(r, 220))
    const after = await evaluate(MEASURE)
    const demo = after.demos[control.host]
    const was = before.demos[control.host]
    if (!demo || !was) continue

    const label = `${control.tag}${control.type ? '[' + control.type + ']' : ''} ${control.text || control.label}`

    if (demo.viewportCover !== null) {
      report({
        route, demo: demo.id, what: '点击后覆盖视口',
        detail: `${demo.viewportCover.tag}.${demo.viewportCover.cls} ${demo.viewportCover.rect.join('×')}`,
        control: label,
      })
    }
    if (demo.escaped !== null) {
      report({
        route, demo: demo.id, what: '点击后逃出演示框',
        detail: `${demo.escaped.tag}.${demo.escaped.cls} 超出 ${demo.escaped.over}px`,
        control: label,
      })
    }
    if (demo.height > was.height + 120) {
      report({
        route, demo: demo.id, what: '演示框被撑高',
        detail: `${was.height}px → ${demo.height}px`,
        control: label,
      })
    }
    /* 点一下把某一栏滚走，就是「整页变白」那种事故：内容还在，只是不在视野里。
       只对「真人点得到」的元素报——脚本点屏幕外的元素，浏览器滚过去是应该的。 */
    if (after.scrollers !== before.scrollers && control.visible) {
      report({
        route, demo: demo.id, what: '点击触发滚动',
        detail: `滚动位置 ${before.scrollers || '0'} → ${after.scrollers || '0'}`,
        control: label,
      })
    }
  }
}

console.log('')
console.log(`点过 ${allRoutes.length} 条路由 · ${demosSeen} 个演示 · ${controlsSeen} 个控件 · 实际点击 ${clicks} 次`)
if (findings.length === 0) {
  console.log('OK  没有发现覆盖视口 / 逃出演示框 / 撑高容器 / 点击触发滚动')
} else {
  console.log(`发现 ${findings.length} 处：`)
  for (const f of findings) {
    console.log(`  ${f.route}  ·  ${f.demo}  ·  ${f.what}  ·  ${f.detail}  ← 点的是 ${f.control}`)
  }
}
if (pageErrors.length > 0) {
  console.log(`页面报错 ${pageErrors.length} 条：`)
  for (const e of pageErrors.slice(0, 5)) console.log(`  ${String(e).split('\n')[0]}`)
}

ws.close()
proc.kill()
server.close()
process.exit(findings.length === 0 && pageErrors.length === 0 ? 0 : 1)
