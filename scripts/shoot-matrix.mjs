/**
 * shoot-matrix.mjs — 信息架构改版的验收截图矩阵。
 *
 * 首页 / 规范页 / 组件页 × 中英 × 浅深 × 两种桌面宽度，落 docs/screenshots/ia-*.png，
 * 并顺手量三件容易坏的事：正文有没有横向溢出、右栏在窄宽度下是否让位、左栏是否仍然可折叠。
 *
 * 这些图写在 docs/screenshots/，**不碰 docs/reference/**（那是产品原始采集，只由 capture 写）。
 *
 * Usage: node scripts/shoot-matrix.mjs
 */

import { createServer } from 'node:http'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = join(ROOT, 'website')
const OUT = join(ROOT, 'docs', 'screenshots')
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json; charset=utf-8', '.png': 'image/png' }

const browserPath = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(p => existsSync(p))
if (browserPath === undefined) { console.error('no browser'); process.exit(1) }

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  let path = decodeURIComponent(url.pathname)
  if (path.endsWith('/')) path += 'index.html'
  try {
    const body = await readFile(join(SITE, path.replace(/^\/+/u, '')))
    res.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' }).end(body)
  } catch { res.writeHead(404).end('not found') }
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const PORT = server.address().port

const profile = join(tmpdir(), `dshdr-matrix-${Date.now()}`)
const proc = spawn(browserPath, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=1600,1200`, `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { stdio: 'ignore' })
const devtoolsPort = await (async () => {
  for (let i = 0; i < 150; i++) {
    try { const p = Number(readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]); if (p > 0) return p } catch { /* wait */ }
    await new Promise(r => setTimeout(r, 100))
  }
  throw new Error('no devtools port')
})()
const targets = await (async () => {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${devtoolsPort}/json/list`); const j = await r.json(); if (j.some(t => t.type === 'page')) return j } catch { /* wait */ }
    await new Promise(r => setTimeout(r, 250))
  }
  throw new Error('devtools timeout')
})()
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws')) })
let nextId = 1
const pending = new Map()
const loadWaiters = []
ws.onmessage = e => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); return }
  if (m.method === 'Page.loadEventFired') for (const w of loadWaiters.splice(0)) w()
}
const send = (method, params) => new Promise((resolve, reject) => {
  const id = nextId++
  pending.set(id, { resolve, reject })
  ws.send(JSON.stringify({ id, method, params: params ?? {} }))
  setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(method + ' timeout')) } }, 30000)
})
await send('Page.enable')
await send('Runtime.enable')
const evaluate = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text)
  return r.result.value
}

/**
 * 打开并等稳定。
 * @param url - 地址。
 */
async function goto(url) {
  const loaded = new Promise(resolve => { loadWaiters.push(resolve) })
  await send('Page.navigate', { url })
  await Promise.race([loaded, new Promise(r => setTimeout(r, 2500))])
  await new Promise(r => setTimeout(r, 400))
}

await mkdir(OUT, { recursive: true })
await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` })
await new Promise(r => setTimeout(r, 2500))

const pages = [['home', '#/'], ['spec', '#/spec/20-controls'], ['component', '#/component/button'], ['guide', '#/guide/10-principles']]
const widths = [1600, 1180]
const langs = ['zh', 'en']
const themes = ['light', 'dark']
const report = []

for (const width of widths) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false })
  for (const lang of langs) {
    for (const theme of themes) {
      for (const [name, route] of pages) {
        /* 语言与主题都是页面上的按钮，点它们比改 URL 更接近真实使用 */
        await goto(`http://127.0.0.1:${PORT}/${route}`)
        await evaluate(`(function(){var b=document.querySelector('#lang button[data-lang="${lang}"]');if(b)b.click();var t=document.getElementById('theme');var dark=document.body.hasAttribute('data-ds-dark-theme');if((${theme === 'dark'})!==dark)t.click();return 1})()`)
        await new Promise(r => setTimeout(r, 350))
        const metrics = await evaluate(`(function(){
          var main = document.getElementById('main');
          var inner = document.querySelector('.main-inner');
          var aside = document.getElementById('aside');
          return {
            overflowX: document.documentElement.scrollWidth - innerWidth,
            mainOverflow: main ? main.scrollWidth - main.clientWidth : -1,
            asideVisible: !!(aside && aside.offsetWidth > 0),
            indexRows: document.querySelectorAll('.index__link').length,
            lang: document.documentElement.lang,
            dark: document.body.hasAttribute('data-ds-dark-theme'),
          };
        })()`)
        const shot = await send('Page.captureScreenshot', { format: 'png' })
        const file = `ia-${name}-${lang}-${theme}-${width}.png`
        await writeFile(join(OUT, file), Buffer.from(shot.data, 'base64'))
        report.push({ file, ...metrics })
      }
    }
  }
}

console.log('file | 文档横向溢出 | 中栏溢出 | 右栏 | 左栏行数')
for (const r of report) {
  console.log(`${r.file} | ${r.overflowX} | ${r.mainOverflow} | ${r.asideVisible ? 'on' : 'off'} | ${r.indexRows}`)
}
const bad = report.filter(r => r.overflowX > 0 || r.mainOverflow > 0)
console.log(bad.length === 0 ? 'OK  24 张截图，无横向溢出' : `有 ${bad.length} 张存在横向溢出`)

ws.close(); proc.kill(); server.close()
process.exit(bad.length === 0 ? 0 : 1)
