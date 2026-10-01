/**
 * capture-dsh.mjs — photograph the real product UI.
 *
 * A design resource that "reproduces" a component it has never seen is
 * inventing it, and an invented component teaches plugin authors the wrong
 * thing. So the demos are checked against photographs of the running app:
 * this script authenticates to the local dsh web server with the same signed
 * cookie the browser uses, drives headless Edge over CDP, and writes reference
 * screenshots to `docs/reference/`.
 *
 * The cookie is minted from `<DSH_HOME>/.credentials.yaml` (the launch `?token=`
 * lives only in the server's memory). Nothing here writes to the app, changes a
 * setting or sends a message — it opens pages and photographs them.
 *
 * Usage:
 *   node scripts/capture-dsh.mjs                 # every scene
 *   node scripts/capture-dsh.mjs 01-hero 03-settings
 */

import { mkdir, writeFile, rm, readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { authCookieFor } from './lib/auth.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'docs', 'reference')

const DSH_URL = process.env.DSH_URL ?? 'http://127.0.0.1:19387'
const CREDENTIALS = process.env.DSH_CREDENTIALS ?? 'D:/dsh-home/.credentials.yaml'

/**
 * Open the settings panel.
 *
 * The seat is `settings.trigger` and it holds content, not the button — and the
 * visible label is the reliable handle, so the click target is found from the
 * text and walked up to whatever actually handles a click.
 */
const OPEN_SETTINGS = `(() => {
  const labels = [...document.querySelectorAll('*')]
    .filter(el => el.children.length === 0 && (el.textContent || '').trim() === '设置')
  if (labels.length === 0) throw new Error('settings label not found')
  const target = labels[0].closest('button, [role="button"], a') ?? labels[0].parentElement
  target.click()
  return true
})()`

/**
 * Open one session from the sidebar.
 *
 * Rows are the elements carrying `sidebar.workspaces.session.row.action`, which
 * is a seat the product declares — unlike the hashed class names (`hIlkoa_…`),
 * which change between builds. The **first row that is not the selected one** is
 * picked on purpose: the selected row is the empty new session, and the screen
 * worth measuring is a session that already has turns (header, messages, input
 * and the status line under it). Nothing here writes to a session; it only
 * switches which one is displayed.
 */
const OPEN_SESSION = `(() => {
  const rows = [...document.querySelectorAll('[data-slot="sidebar.workspaces.session.row.action"]')]
    .map(el => el.closest('[class*="sessionRow"]') || el.parentElement)
    .filter(el => el !== null)
  const selected = rows.find(row => [...row.classList].some(c => c.endsWith('_selected')))
  const target = rows.find(row => row !== selected) ?? rows[0]
  if (target === undefined) throw new Error('no session row matched')
  target.click()
  return true
})()`

/**
 * Measure the real render tree.
 *
 * `[data-slot]` nodes are `display: contents` — logical seats with no box of
 * their own — so measuring them yields zeros. What matters is the elements the
 * seats actually render, so this walks the live tree and keeps every node that
 * occupies space, with its computed style.
 */
const GEOMETRY_PROBE = `(() => {
  const PROPS = ['display','position','width','height','minHeight','maxWidth','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','gap','rowGap','columnGap','gridTemplateColumns','flexDirection','alignItems','justifyContent','flexGrow','flexShrink','backgroundColor','color','borderRadius','borderTopWidth','borderBottomWidth','borderLeftWidth','borderRightWidth','borderColor','borderStyle','fontSize','fontWeight','lineHeight','fontFamily','boxShadow','opacity','overflowX','overflowY','backdropFilter','transitionDuration','transitionTimingFunction']
  const nodes = []
  const walk = (el, depth) => {
    if (depth > 9 || nodes.length > 3000) return
    const r = el.getBoundingClientRect()
    if (r.width > 1 && r.height > 1) {
      const cs = getComputedStyle(el)
      const style = {}
      for (const p of PROPS) style[p] = cs[p]
      nodes.push({
        d: depth,
        tag: el.tagName.toLowerCase(),
        slot: el.getAttribute('data-slot') || undefined,
        cls: (el.className || '').toString().slice(0, 140),
        rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        style,
      })
    }
    for (const child of el.children) walk(child, depth + 1)
  }
  walk(document.getElementById('root') || document.body, 0)
  return JSON.stringify({ viewport: { w: innerWidth, h: innerHeight }, nodes })
})()`

/**
 * The top strip, as an expression: every control on the first row of the app.
 *
 * The right-hand tools (ellipsis, open the working directory, open the right
 * sidebar) belong to the conversation header's utility group and its corner, so
 * a harvest that only looks at `conversation.header` misses them — which is how
 * a reproduction ends up with two of the three, or with an invented third. This
 * walks the whole first row by pixel position, so whatever is up there gets
 * measured, seat or no seat. Some of them are not glyphs at all: "open in file
 * explorer" draws the OS folder bitmap, so the markup is kept when there is no
 * inline SVG.
 */
const TOP_STRIP_EXPR = `(() => {
  const out = []
  for (const el of document.querySelectorAll('button, [role="button"], a')) {
    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4 || r.width > 420) continue
    if (r.y > 60) continue
    const svg = el.querySelector('svg')
    const seat = el.closest('[data-slot]')
    out.push({
      label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      cls: String(el.className || '').slice(0, 70),
      seat: seat === null ? null : seat.getAttribute('data-slot'),
      svg: svg === null ? null : svg.outerHTML,
      html: svg === null ? el.outerHTML.slice(0, 700) : null,
    })
  }
  return out
})()`

/** The same harvest, standing alone as a scene probe. */
const TOPSTRIP_PROBE = `JSON.stringify(${TOP_STRIP_EXPR}, null, 1)`

/**
 * Harvest the chrome that carries no seat of its own: the sidebar glyphs and the
 * session-header controls.
 *
 * Icons are grabbed as the **live SVG the product renders**, not looked up by
 * name in a package. Guessing by name is how `lock` silently resolved to a clock
 * and how the sidebar glyphs ended up looking nothing like the real ones.
 */
const CHROME_PROBE = `(() => {
  const svgFor = (label) => {
    const leaf = [...document.querySelectorAll('*')].find(el => el.children.length === 0 && (el.textContent || '').trim() === label)
    if (leaf === undefined) return null
    let node = leaf
    for (let i = 0; i < 4 && node; i++) {
      const svg = node.querySelector('svg')
      if (svg) return svg.outerHTML
      node = node.parentElement
    }
    return null
  }
  const icons = {}
  for (const label of ['新会话', '插件', '自动化任务', '用量中心', '上下文洞察', '设置']) {
    icons[label] = svgFor(label)
  }

  const header = []
  const scope = document.querySelector('[data-slot="conversation.header"]') ?? document.body
  for (const el of scope.querySelectorAll('button, [role="button"]')) {
    const svg = el.querySelector('svg')
    const rect = el.getBoundingClientRect()
    if (rect.width < 4) continue
    header.push({
      label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 48),
      svg: svg === null ? null : svg.outerHTML,
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    })
  }
  return JSON.stringify({ icons, header, top: ${TOP_STRIP_EXPR} }, null, 2)
})()`

/**
 * Measure the composer area in full detail.
 *
 * The general geometry probe stops at depth 9, which is exactly where the input
 * card starts — so the card's own subtree (its radius, its status line, the gaps
 * between the status items) was never captured, and eyeballing it produced a
 * wrong radius and a wrong status-bar rhythm. This probe goes deeper, on purpose,
 * and on one area.
 */
const COMPOSER_PROBE = `(() => {
  const out = []
  const bar = document.querySelector('[data-slot="conversation.composer.bar"]')
  /* Start one level above the bar: the status line lives in a dock outside it. */
  const seat = bar && bar.parentElement ? bar.parentElement : document.body
  const walk = (el, depth) => {
    if (depth > 14) return
    const r = el.getBoundingClientRect()
    if (r.width > 1 && r.height > 1) {
      const cs = getComputedStyle(el)
      out.push({
        d: depth,
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 110),
        rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        font: cs.fontSize + '/' + cs.lineHeight,
        color: cs.color,
        gap: cs.gap,
        pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '),
        margin: [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].join(' '),
        radius: cs.borderRadius,
        bg: cs.backgroundColor,
        text: el.children.length === 0 ? (el.textContent || '').trim().slice(0, 40) : '',
      })
    }
    for (const child of el.children) walk(child, depth + 1)
  }
  walk(seat, 0)
  return JSON.stringify(out, null, 1)
})()`

/**
 * Locate the composer status line and describe its container chain.
 *
 * The status line turned out not to live inside the composer seat's subtree at
 * all, so scanning that seat for it found nothing. This probe searches the whole
 * document for the line's text and walks up from it, which is also how you find
 * where a piece of chrome actually belongs when the seat model does not say.
 */
const STATUS_PROBE = `(() => {
  const found = []
  for (const el of document.querySelectorAll('*')) {
    if (el.children.length !== 0) continue
    const text = (el.textContent || '').trim()
    if (text === '' || text.length > 28) continue
    if (!/tok\\/s|缓存|≈|轮|%/.test(text)) continue
    const rect = el.getBoundingClientRect()
    if (rect.width < 2 || rect.height < 2) continue
    const cs = getComputedStyle(el)
    const chain = []
    let node = el.parentElement
    for (let i = 0; i < 5 && node !== null; i++) {
      const ncs = getComputedStyle(node)
      const nr = node.getBoundingClientRect()
      chain.push({
        cls: String(node.className || node.tagName).slice(0, 60),
        gap: ncs.gap,
        pad: [ncs.paddingTop, ncs.paddingRight, ncs.paddingBottom, ncs.paddingLeft].join(' '),
        rect: [Math.round(nr.x), Math.round(nr.y), Math.round(nr.width), Math.round(nr.height)],
      })
      node = node.parentElement
    }
    found.push({
      text,
      rect: [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)],
      font: cs.fontSize + '/' + cs.lineHeight,
      color: cs.color,
      chain,
    })
  }
  return JSON.stringify(found, null, 1)
})()`

/**
 * Measure the conversation column itself.
 *
 * The reading column is not the centre column: the product insets the message
 * list inside it, and the numbers of that inset (how wide the text runs, where a
 * user bubble starts and stops, the gap between turns) are what makes a
 * reproduction look like the product rather than like a chat page in general.
 * The general probe stops at depth 9, so this one goes deep on one seat.
 */
const CONVERSATION_PROBE = `(() => {
  const out = []
  const walk = (el, depth) => {
    if (depth > 12 || out.length > 900) return
    const r = el.getBoundingClientRect()
    if (r.width > 1 && r.height > 1) {
      const cs = getComputedStyle(el)
      out.push({
        d: depth,
        tag: el.tagName.toLowerCase(),
        slot: el.getAttribute('data-slot') || undefined,
        cls: String(el.className || '').slice(0, 90),
        rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        font: cs.fontSize + '/' + cs.lineHeight,
        color: cs.color,
        gap: cs.gap,
        pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '),
        margin: [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].join(' '),
        radius: cs.borderRadius,
        bg: cs.backgroundColor,
        maxWidth: cs.maxWidth,
        text: el.children.length === 0 ? (el.textContent || '').trim().slice(0, 40) : '',
      })
    }
    for (const child of el.children) walk(child, depth + 1)
  }
  const root = document.querySelector('[data-slot="conversation.session"]')
    ?? document.querySelector('[data-slot="conversation.session.header"]')
    ?? document.querySelector('[data-slot="main.conversation"]')
  if (root === null) throw new Error('conversation seat not found')
  walk(root.parentElement ?? root, 0)
  return JSON.stringify(out, null, 1)
})()`

/**
 * Photograph the settings panel as a window.
 *
 * The settings screen is the repository's clearest example of a *surface*: an
 * 800×800 rounded panel on a mask, with cards inside it. A reproduction built
 * from imagination gets the radius and the elevation wrong, so this walks the
 * real panel — found by its own metrics (a large rounded box), not by a hash —
 * and records its subtree, the mask behind it, and the card inside it.
 */
const SETTINGS_PANEL_PROBE = `(() => {
  const out = { panel: null, mask: null, nodes: [] }
  const all = [...document.querySelectorAll('body *')]
  let panel = null
  for (const el of all) {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    if (r.width > 700 && r.height > 600 && parseFloat(cs.borderRadius) >= 24) { panel = el; break }
  }
  if (panel === null) throw new Error('settings panel not found')
  const describe = (el, depth) => {
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) return
    const cs = getComputedStyle(el)
    out.nodes.push({
      d: depth,
      tag: el.tagName.toLowerCase(),
      slot: el.getAttribute('data-slot') || undefined,
      cls: String(el.className || '').slice(0, 90),
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      radius: cs.borderRadius,
      bg: cs.backgroundColor,
      shadow: cs.boxShadow === 'none' ? '' : cs.boxShadow,
      pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '),
      gap: cs.gap === 'normal' ? '' : cs.gap,
      border: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor,
      font: cs.fontSize + '/' + cs.lineHeight + ' ' + cs.fontWeight,
      color: cs.color,
      backdrop: cs.backdropFilter === 'none' ? '' : cs.backdropFilter,
      text: el.children.length === 0 ? (el.textContent || '').trim().slice(0, 40) : '',
    })
  }
  describe(panel, 0)
  const walk = (el, depth) => {
    if (depth > 11 || out.nodes.length > 700) return
    for (const child of el.children) { describe(child, depth); walk(child, depth + 1) }
  }
  walk(panel, 1)
  /* 遮罩：面板之外那一层压暗的背景 */
  const mask = all.find(el => {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return r.width > 1000 && r.height > 600 && cs.backgroundColor.startsWith('rgba(') && cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
  })
  if (mask !== undefined) {
    const cs = getComputedStyle(mask)
    const r = mask.getBoundingClientRect()
    out.mask = { cls: String(mask.className || '').slice(0, 80), rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], bg: cs.backgroundColor, backdrop: cs.backdropFilter === 'none' ? '' : cs.backdropFilter }
  }
  return JSON.stringify(out, null, 1)
})()`

/**
 * Photograph one row of the plugin list.
 *
 * A plugin row is a small composite that shows up nowhere else in the product:
 * a tinted rounded square holding the plugin's own glyph, a title, a line of
 * description, a tag, and a switch. The tile is what "icon" means to a plugin
 * author, so it gets measured rather than described.
 */
const PLUGIN_ROW_PROBE = `(() => {
  const rows = [...document.querySelectorAll('li, [class*="row"]')]
    .filter(el => el.querySelector('input[type="checkbox"], [role="switch"]') !== null && el.getBoundingClientRect().height > 30)
  if (rows.length === 0) throw new Error('no plugin row found')
  const row = rows[0]
  const out = { row: null, nodes: [] }
  const describe = (el, depth) => {
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) return
    const cs = getComputedStyle(el)
    out.nodes.push({
      d: depth,
      tag: el.tagName.toLowerCase(),
      cls: String(el.className || '').slice(0, 90),
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      radius: cs.borderRadius,
      bg: cs.backgroundColor,
      shadow: cs.boxShadow === 'none' ? '' : cs.boxShadow,
      border: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor,
      pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '),
      gap: cs.gap === 'normal' ? '' : cs.gap,
      font: cs.fontSize + '/' + cs.lineHeight + ' ' + cs.fontWeight,
      color: cs.color,
      img: el.tagName.toLowerCase() === 'img' ? { src: (el.getAttribute('src') || '').slice(0, 60), w: el.getAttribute('width'), h: el.getAttribute('height') } : undefined,
      svg: el.tagName.toLowerCase() === 'svg' ? el.outerHTML.slice(0, 400) : undefined,
      text: el.children.length === 0 ? (el.textContent || '').trim().slice(0, 40) : '',
    })
  }
  describe(row, 0)
  const walk = (el, depth) => {
    if (depth > 7) return
    for (const child of el.children) { describe(child, depth); walk(child, depth + 1) }
  }
  walk(row, 1)
  out.row = { text: (row.textContent || '').trim().slice(0, 60) }
  return JSON.stringify(out, null, 1)
})()`

/**
 * Photograph the sidebar rows that live outside any list seat.
 *
 * A session row carries its own state glyph — a running session shows a rotating
 * ring where a finished one shows a chat glyph. The ring is product chrome, and a
 * design resource that says "the product has no loading indicator" has simply
 * never looked at the sidebar.
 */
const RUNNING_ROW_PROBE = `(() => {
  const out = []
  const rows = [...document.querySelectorAll('[data-slot="sidebar.workspaces.session.row.action"]')]
    .map(el => el.closest('[class*="sessionRow"]') || el.parentElement)
    .filter(el => el !== null)
  for (const row of rows) {
    /* 行首那枚状态字形：可能是图标、可能是正在转的环。整行扫一遍带 animation 的元素，
     * 因为「运行中」这件事在产品里就是一段 CSS 动画。 */
    const animated = [...row.querySelectorAll('*')]
      .map(el => {
        const cs = getComputedStyle(el)
        return {
          tag: el.tagName.toLowerCase(),
          cls: String(el.getAttribute('class') || '').slice(0, 70),
          animation: cs.animation === 'none' ? '' : cs.animation,
          border: cs.borderTopWidth + ' ' + cs.borderTopColor,
          radius: cs.borderRadius,
          stroke: cs.stroke,
          dash: cs.strokeDasharray === 'none' ? '' : cs.strokeDasharray,
        }
      })
      .filter(item => item.animation !== '')
      .slice(0, 5)
    const first = row.firstElementChild
    const r = first === null ? null : first.getBoundingClientRect()
    out.push({
      rowText: (row.textContent || '').trim().slice(0, 50),
      selected: [...row.classList].some(c => c.endsWith('_selected')),
      leadingSlot: row.querySelector('[data-slot="sidebar.session.row.leading"]') === null ? false : true,
      firstRect: r === null ? null : [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      firstHtml: first === null ? '' : first.outerHTML.slice(0, 900),
      svg: (() => { const s = row.querySelector('svg'); return s === null ? null : s.outerHTML.slice(0, 900) })(),
      animated,
    })
    if (out.length >= 8) break
  }
  return JSON.stringify(out, null, 1)
})()`

/**
 * Click one entry in the settings nav by its exact label.
 * @param label - the nav item's text, e.g. `通用设置`.
 * @returns a step snippet.
 */
function clickNav(label) {
  return `(() => {
    const item = [...document.querySelectorAll('button, a, [role="tab"], [role="menuitem"]')]
      .find(el => (el.textContent || '').trim() === ${JSON.stringify(label)})
    if (item === undefined) throw new Error('settings nav item not found: ' + ${JSON.stringify(label)})
    item.click()
    return true
  })()`
}

/**
 * The pages worth photographing.
 *
 * `steps` are JS snippets run in order after the page settles; each returns
 * nothing — they exist to put the app into the state being photographed. A step
 * that cannot find its target throws, so a scene fails loudly instead of
 * quietly capturing the wrong screen.
 */
const SCENES = [
  {
    name: '01-hero',
    title: '新会话（Hero）',
    steps: [],
  },
  {
    name: '02-session',
    title: '会话页',
    steps: [OPEN_SESSION],
  },
  {
    name: '08-session-geometry',
    title: '会话页 · 几何采集',
    steps: [OPEN_SESSION],
    collect: true,
  },
  {
    name: '09-chrome',
    title: '侧栏与头部的图标采集',
    steps: [OPEN_SESSION],
    collect: 'chrome',
  },
  {
    name: '10-composer-geometry',
    title: '输入区 · 逐像素几何',
    steps: [OPEN_SESSION],
    collect: 'composer',
  },
  {
    name: '11-status-line',
    title: '输入区状态条定位',
    steps: [OPEN_SESSION],
    collect: 'status',
  },
  {
    name: '12-conversation-geometry',
    title: '会话区 · 逐像素几何',
    steps: [OPEN_SESSION],
    collect: 'conversation',
  },
  {
    name: '13-top-strip',
    title: '顶栏 · 全部控件与图标',
    steps: [OPEN_SESSION],
    collect: 'topstrip',
  },
  {
    name: '14-settings-panel',
    title: '设置面板 · 窗口几何',
    steps: [OPEN_SETTINGS],
    collect: 'settings-panel',
  },
  {
    name: '15-plugin-row',
    title: '插件列表 · 一行',
    steps: [`(() => {
      const leaf = [...document.querySelectorAll('*')]
        .find(el => el.children.length === 0 && (el.textContent || '').trim() === '插件')
      if (leaf === undefined) throw new Error('plugins nav not found')
      const target = leaf.closest('button, [role="button"], a') ?? leaf.parentElement
      target.click()
      return true
    })()`],
    collect: 'plugin-row',
  },
  {
    name: '16-running-row',
    title: '左栏 · 运行中的会话行',
    steps: [OPEN_SESSION],
    collect: 'running-row',
  },
  {
    name: '03-settings-open',
    title: '设置面板',
    steps: [OPEN_SETTINGS],
  },
  {
    name: '04-settings-models',
    title: '设置 · 模型',
    steps: [OPEN_SETTINGS, clickNav('模型')],
  },
  {
    name: '05-settings-components',
    title: '设置 · 组件',
    steps: [OPEN_SETTINGS, clickNav('组件')],
  },
  {
    name: '06-plugins',
    title: '插件列表',
    steps: [`(() => {
      const label = [...document.querySelectorAll('*')]
        .find(el => el.children.length === 0 && (el.textContent || '').trim() === '插件')
      if (label === undefined) throw new Error('plugins nav not found')
      const target = label.closest('button, [role="button"], a') ?? label.parentElement
      target.click()
      return true
    })()`],
  },
  {
    name: '07-composer',
    title: '输入区与工具行',
    steps: [`(() => {
      const box = document.querySelector('[data-input-scroll], textarea')
      if (box === null) throw new Error('composer not found')
      box.scrollIntoView({ block: 'center' })
      return true
    })()`],
  },
]

/* ── browser plumbing ──────────────────────────────────────────────── */

const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
]

const browserPath = BROWSERS.find(p => existsSync(p))
if (browserPath === undefined) {
  console.error('no Edge/Chrome found')
  process.exit(1)
}

if (!existsSync(CREDENTIALS)) {
  console.error(`credentials not found: ${CREDENTIALS}`)
  process.exit(1)
}

const { cookie } = authCookieFor({ credentialsPath: CREDENTIALS, url: DSH_URL })

const PROFILE = join(tmpdir(), `dsh-capture-${Date.now()}`)
const proc = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--window-size=1600,1000',
  `--user-data-dir=${PROFILE}`, '--remote-debugging-port=0', 'about:blank',
], { stdio: 'ignore' })

/**
 * Read the DevTools port the browser chose.
 * @returns the port.
 */
async function devtoolsPort() {
  const file = join(PROFILE, 'DevToolsActivePort')
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
 * Poll the DevTools endpoint until a page target exists.
 * @param port - the port to ask.
 * @returns the target list.
 */
async function devtools(port) {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      if (Array.isArray(list) && list.some(t => t.type === 'page')) return list
    } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 250))
  }
  throw new Error('DevTools endpoint timeout')
}

/**
 * Clean up the browser tree and the scratch profile.
 */
async function shutdown() {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    proc.kill('SIGKILL')
  }
  await rm(PROFILE, { recursive: true, force: true }).catch(() => {})
}

/* ── main ──────────────────────────────────────────────────────────── */

const wanted = process.argv.slice(2)
const scenes = wanted.length === 0 ? SCENES : SCENES.filter(s => wanted.includes(s.name))
if (scenes.length === 0) {
  console.error(`no scene matched. known: ${SCENES.map(s => s.name).join(', ')}`)
  await shutdown()
  process.exit(1)
}

let ws
try {
  const list = await devtools(await devtoolsPort())
  const page = list.find(t => t.type === 'page')
  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('ws open failed')) })

  let nextId = 1
  const pending = new Map()
  ws.onmessage = event => {
    const msg = JSON.parse(event.data)
    if (msg.id === undefined || !pending.has(msg.id)) return
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) reject(new Error(msg.error.message))
    else resolve(msg.result)
  }

  /**
   * Send one CDP command.
   * @param method - CDP method.
   * @param params - parameters.
   * @returns the result.
   */
  const send = (method, params) => new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params: params ?? {} }))
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`${method} timeout`)) } }, 60000)
  })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')

  const set = await send('Network.setCookie', {
    name: cookie.name,
    value: cookie.value,
    url: DSH_URL + '/',
    path: '/',
    httpOnly: true,
    sameSite: 'Strict',
    expires: cookie.expires,
  })
  if (set.success !== true) throw new Error('the session cookie was rejected')

  await mkdir(OUT, { recursive: true })

  /**
   * Evaluate an expression in the page and return its value.
   * @param expression - JS source.
   * @returns the value.
   */
  const evaluate = async expression => {
    const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (out.exceptionDetails) throw new Error(out.exceptionDetails.exception?.description ?? out.exceptionDetails.text)
    return out.result.value
  }

  for (const scene of scenes) {
    await send('Page.navigate', { url: DSH_URL + '/' })
    await new Promise(r => setTimeout(r, 3500))
    for (const step of scene.steps) {
      await evaluate(step)
      await new Promise(r => setTimeout(r, 1200))
    }
    const shot = await send('Page.captureScreenshot', { format: 'png' }, 90000)
    await writeFile(join(OUT, `${scene.name}.png`), Buffer.from(shot.data, 'base64'))
    console.log(`captured  ${scene.name}  ${scene.title}`)

    if (scene.collect === true) {
      const json = await evaluate(GEOMETRY_PROBE)
      await writeFile(join(OUT, 'geometry.json'), json, 'utf8')
      console.log(`geometry  ${scene.name}  ${Math.round(json.length / 1024)} KB`)
    }

    if (scene.collect === 'chrome') {
      const json = await evaluate(CHROME_PROBE)
      await writeFile(join(OUT, 'chrome.json'), json, 'utf8')
      console.log(`chrome    ${scene.name}  ${Math.round(json.length / 1024)} KB`)
    }

    if (scene.collect === 'composer') {
      const json = await evaluate(COMPOSER_PROBE)
      await writeFile(join(OUT, 'composer-geometry.json'), json, 'utf8')
      console.log(`composer  ${scene.name}  ${Math.round(json.length / 1024)} KB`)
    }

    if (scene.collect === 'status') {
      const json = await evaluate(STATUS_PROBE)
      await writeFile(join(OUT, 'status-line.json'), json, 'utf8')
      console.log(`status    ${scene.name}  ${Math.round(json.length / 1024)} KB`)
    }

    if (scene.collect === 'conversation') {
      const json = await evaluate(CONVERSATION_PROBE)
      await writeFile(join(OUT, 'conversation-geometry.json'), json, 'utf8')
      console.log(`conversa. ${scene.name}  ${Math.round(json.length / 1024)} KB`)
    }

    if (scene.collect === 'topstrip') {
      const json = await evaluate(TOPSTRIP_PROBE)
      await writeFile(join(OUT, 'top-strip.json'), json, 'utf8')
      console.log(`topstrip  ${scene.name}  ${Math.round(json.length / 1024)} KB`)
    }

    if (scene.collect === 'settings-panel') {
      const json = await evaluate(SETTINGS_PANEL_PROBE)
      await writeFile(join(OUT, 'settings-panel.json'), json, 'utf8')
      console.log(`settings  ${scene.name}  ${Math.round(json.length / 1024)} KB`)
    }

    if (scene.collect === 'plugin-row') {
      const json = await evaluate(PLUGIN_ROW_PROBE)
      await writeFile(join(OUT, 'plugin-row.json'), json, 'utf8')
      console.log(`plugrow   ${scene.name}  ${Math.round(json.length / 1024)} KB`)
    }

    if (scene.collect === 'running-row') {
      const json = await evaluate(RUNNING_ROW_PROBE)
      await writeFile(join(OUT, 'running-row.json'), json, 'utf8')
      console.log(`running   ${scene.name}  ${Math.round(json.length / 1024)} KB`)
    }
  }
} catch (error) {
  console.error(`capture failed: ${error.message}`)
  process.exitCode = 1
} finally {
  if (ws !== undefined) ws.close()
  await shutdown()
}
