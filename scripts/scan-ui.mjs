/**
 * scan-ui.mjs — 把运行中的界面逐个元素登记成册。
 *
 * 这份资源此前是按「组件」为单位写的：先想到 Button/Card，再去产品里找证据。那是
 * 从实现出发，不是从界面出发——产品里真实存在、而组件目录里没有对应物的东西
 * （左栏会话行的运行圆环、插件列表的彩色图标方块、输入区的权限胶囊……）就一直
 * 不在册。这个脚本反过来做：把产品跑起来，一个状态一个状态地把**每个占尺寸的
 * 元素**登记下来（身份、盒子、计算样式、座位），再去问规范里有没有它的位置。
 *
 * 输出：
 *   data/ui-inventory.json  元素清单（按归一化身份聚合）
 *   data/ui-coverage.json   清单 ↔ 规范/组件的自动对照结果（命中处 / 缺口）
 *
 * 用法：
 *   node scripts/scan-ui.mjs                 # 全部场景
 *   node scripts/scan-ui.mjs hero session    # 指定场景
 *
 * 与 capture-dsh.mjs 一样：只打开页面、切视图、量尺寸，不改设置、不发消息。
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { authCookieFor } from './lib/auth.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'data')
const DSH_URL = process.env.DSH_URL ?? 'http://127.0.0.1:19387'
const CREDENTIALS = process.env.DSH_CREDENTIALS ?? 'D:/dsh-home/.credentials.yaml'

/* ── 场景 ───────────────────────────────────────────────────────────── */

/**
 * 打开一条有内容的会话。
 *
 * 行是产品自己声明的座位 `sidebar.workspaces.session.row.action`，不是哈希类名；
 * 选**第一个不是当前选中**的行（选中的那条是空的新会话）。
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

/** 点在文案上：找**真正能点**的那一个，而不是文档里第一个同名文字。
 *
 * 设置页的导航项和内容标题会重名（「模型」既是左栏的一项，也可能是正文里的标题），
 * 取第一个叶子文本就会点到标题上——面板一动不动，扫描却以为切过去了。 */
function clickLabel(label) {
  return `(() => {
    const leaves = [...document.querySelectorAll('*')]
      .filter(el => el.children.length === 0 && (el.textContent || '').trim() === ${JSON.stringify(label)})
    for (const leaf of leaves) {
      const target = leaf.closest('button, [role="button"], a, [role="tab"], [role="menuitem"], label')
      if (target !== null) { target.click(); return true }
    }
    if (leaves.length > 0) { (leaves[0].parentElement ?? leaves[0]).click(); return true }
    throw new Error('label not found: ' + ${JSON.stringify(label)})
  })()`
}

/** 点一个座位（座位是 display:contents 的逻辑位置，点它渲染出来的第一个控件）。 */
function clickSeat(seat) {
  return `(() => {
    const host = document.querySelector('[data-slot="${seat}"]')
    if (host === null) throw new Error('seat not found: ${seat}')
    const target = host.querySelector('button, [role="button"], a, input') ?? host
    target.click()
    return true
  })()`
}

const SCROLL_BOTTOM = `(() => {
  const scroller = document.querySelector('[data-conversation-scroll]') ?? document.querySelector('[class*="scrollBody"]')
  if (scroller === null) throw new Error('conversation scroller not found')
  scroller.scrollTop = scroller.scrollHeight
  return true
})()`

const OPEN_SEARCH = `(() => {
  const button = document.querySelector('[data-slot="sidebar.workspaces"] [aria-label="搜索会话"]')
  if (button === null) throw new Error('search button not found')
  button.click()
  return true
})()`

const SETTINGS_SECTIONS = ['通用设置', '模型', 'Command Code', '内置插件', 'Agent 预设', '组件', '科研', 'UI 兼容性', '插件市场', '通知']

/**
 * 场景表。
 *
 * `steps` 是运行时依次执行的片段；带 `perStep: true` 的场景会在**每一步之后**各采
 * 一份清单（设置面板十节就是靠这个一次走完，而不是十个场景各开一遍）。
 */
const SCENES = [
  { name: 'hero', title: '新会话页', steps: [] },
  { name: 'session', title: '会话页 · 顶部', steps: [OPEN_SESSION] },
  { name: 'sidebar', title: '左栏 · 搜索展开', steps: [OPEN_SEARCH] },
  { name: 'plugins', title: '插件页（官方 / 已安装）', steps: [clickLabel('插件')] },
  {
    name: 'settings',
    title: '设置面板 · 逐节',
    steps: [clickLabel('设置'), ...SETTINGS_SECTIONS.map(label => clickLabel(label))],
    perStep: true,
  },
  { name: 'usage-center', title: '用量中心（插件）', steps: [clickLabel('用量中心')] },
  { name: 'context-insight', title: '上下文洞察（插件）', steps: [clickLabel('上下文洞察')] },
  {
    name: 'menus',
    title: '会话标题菜单 / 输入区菜单',
    steps: [OPEN_SESSION, clickSeat('conversation.session.header'), clickSeat('conversation.input.model'), clickSeat('conversation.input.permission')],
    perStep: true,
  },
  { name: 'rightbar', title: '右侧边栏', steps: [OPEN_SESSION, `(() => {
      const button = document.querySelector('[data-slot="conversation.session.header.corner"] button')
        ?? [...document.querySelectorAll('button')].find(el => (el.getAttribute('aria-label') || '').indexOf('右侧边栏') !== -1)
      if (button === undefined || button === null) throw new Error('right sidebar toggle not found')
      button.click()
      return true
    })()`] },
]

/* ── 采集片段 ───────────────────────────────────────────────────────── */

/**
 * 元素清单探针。
 *
 * 身份（`key`）刻意不用哈希类名：CSS Modules 会把 `card` 变成 `RlGAzG_card`，把
 * `_root_4ub78_1` 这种名字留给包装组件，而哈希每次构建都会变。这里把哈希段剥掉，
 * 只留语义名，再拼上标签与 role——同一件东西在不同场景里才会落到同一个 key 上。
 */
const INVENTORY_PROBE = `(() => {
  const HASH_HEAD = /^[A-Za-z0-9-]{5,8}_/
  const HASH_TAIL = /_[A-Za-z0-9]{5,8}_\\d+$/
  /* SVG 元素的 className 是 SVGAnimatedString，不是字符串——直接 String() 会得到
   * 一个 [object SVGAnimatedString] 字面量，把一千多个图标全并成同一个身份。 */
  const classOf = (el) => (typeof el.className === 'string' ? el.className : (el.getAttribute('class') || ''))
  const norm = (cls) => String(cls || '').split(/\\s+/).filter(Boolean).map(t => {
    /* 先剥词尾的哈希（spinner_1i3xo_37 → spinner），再剥词首的
     * （RlGAzG_card → card）。顺序反了会把 spinner_ 当成哈希头，
     * 留下一个 1i3xo_37 这种谁也看不懂的身份。 */
    let name = t.replace(/^_/, '')
    name = name.replace(HASH_TAIL, '').replace(HASH_HEAD, '')
    return name
  }).join(' ')

  const SVG = new Set(['svg','path','g','defs','clippath','use','circle','rect','line','polyline','polygon','stop','lineargradient','mask','filter','feflood','fecolormatrix','feoffset','fegaussianblur','fecomposite','feblend','title'])
  /* 代码块里的高亮 span 有成千上万个，它们是内容而不是界面零件；整棵 pre 只留容器。 */
  const SKIP_TREE = new Set(['pre', 'code'])
  const out = []
  const walk = (el, depth, slot) => {
    if (depth > 22 || out.length > 3500) return
    const tag = el.tagName.toLowerCase()
    const ownSlot = el.getAttribute && el.getAttribute('data-slot') ? el.getAttribute('data-slot') : slot
    if (tag === 'style' || tag === 'script' || tag === 'noscript') return
    const r = el.getBoundingClientRect()
    /* 只登记看得见的东西：一份 90 轮的会话里有几千个已经滚出屏幕的节点，逐个算
     * 计算样式会让探针超时，而它们本来就不该出现在「界面上有什么」的清单里。 */
    if (r.bottom < -200 || r.top > innerHeight + 200 || r.right < -200 || r.left > innerWidth + 200) return
    const cs = getComputedStyle(el)
    /* 光看自己和 visibility 不够：父级 opacity:0 的子树里，子元素的计算 opacity 仍是 1，
     * 于是「悬停才出现」的东西（新会话按钮行尾的快捷键、悬停才露出的行内动作）会被
     * 当成常驻元素登记进来。checkVisibility 会把祖先的 opacity / visibility 一起算。 */
    const shown = typeof el.checkVisibility === 'function'
      ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true })
      : (cs.visibility !== 'hidden' && Number(cs.opacity) > 0.05)
    const visible = r.width > 6 && r.height > 6 && shown && cs.display !== 'none'
    const isIcon = tag === 'svg'
    const isControl = ['button','a','input','textarea','select','label'].includes(tag) || el.getAttribute('role') !== null
    const hasSurface = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== 'none' || cs.backgroundImage !== 'none'
    const text = el.children.length === 0 ? (el.textContent || '').trim().slice(0, 60) : ''
    const skip = SVG.has(tag) && !isIcon
    /* 没有类名、没有座位、也没有 role 的容器不是「一件东西」，是布局的中间层：
     * 把它们全登记进来，清单会被大量同名的空 div 身份淹没。但**有文字的匿名元素**要留——
     * 它们是排版本身（hero 标题、状态文字）。这类元素只按类名归一化会全部并成一个
     * 空身份（106 次计数里混着好几种字号），所以补上字体签名，让不同排版各自成一条。 */
    const name = norm(classOf(el))
    const anon = name === ''
    /* 没有类名的元素按「它是什么」认：
     *   图标 → viewBox + 第一条路径的指纹（同一枚字形在不同位置重复出现时才并得起来，
     *          不同字形即使 viewBox 相同也不会混）；
     *   文字 → 字体签名（26/32/500 的 hero 标题与 13/20/400 的状态文字是两回事）。
     * 早前用父级字号给 svg 分类，结果 158 次计数里混着好几种字形——字号对图标毫无意义。 */
    const firstPath = isIcon ? (el.querySelector('path')?.getAttribute('d') ?? '') : ''
    const anonKey = isIcon
      ? ('svg:' + (el.getAttribute('viewBox') ?? '') + ':' + firstPath.slice(0, 24))
      : ('text:' + cs.fontSize + '/' + cs.lineHeight + '/' + cs.fontWeight)
    const keyName = anon ? anonKey : name
    const anonymous = anon && (ownSlot === null || ownSlot === '') && (el.getAttribute('role') || '') === '' && !isControl && !isIcon
    if (visible && !skip && !anonymous && (isControl || hasSurface || text !== '' || isIcon)) {
      out.push({
        key: keyName + '|' + tag + '|' + (el.getAttribute('role') || ''),
        tag,
        cls: classOf(el).slice(0, 120),
        slot: ownSlot || '',
        role: el.getAttribute('role') || '',
        aria: (el.getAttribute('aria-label') || '').slice(0, 40),
        rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        text,
        viewBox: isIcon ? (el.getAttribute('viewBox') || '') : '',
        style: {
          display: cs.display,
          position: cs.position,
          font: cs.fontSize + '/' + cs.lineHeight + ' ' + cs.fontWeight,
          color: cs.color,
          bg: cs.backgroundColor,
          radius: cs.borderRadius,
          border: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor,
          shadow: cs.boxShadow === 'none' ? '' : cs.boxShadow.slice(0, 120),
          pad: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '),
          gap: cs.gap === 'normal' ? '' : cs.gap,
          size: Math.round(r.width) + 'x' + Math.round(r.height),
        },
      })
    }
    if (isIcon) return
    if (SKIP_TREE.has(tag)) return
    for (const child of el.children) walk(child, depth + 1, ownSlot)
  }
  /* 从 body 走：菜单、对话框、设置面板都是 portal，挂在 #root 之外，从 #root 起步
   * 会把它们整片漏掉——而「点开菜单之后长什么样」正是这份清单要回答的问题。 */
  walk(document.body, 0, '')
  return JSON.stringify({ viewport: { w: innerWidth, h: innerHeight }, nodes: out })
})()`

/**
 * 目标文件里有没有写下这件东西的实测尺寸。
 *
 * 「命中锚点」只说明「它该归到哪个文件」，不等于那个文件真的描述了它。这一道检查
 * 拿元素实测尺寸去目标文档里找（`50 × 50` / `50×50` / `50x50` 都算），把「归位」
 * 升级成「已描述」。
 * @param textByFile - 文件路径 → 小写正文。
 * @param where - 锚点给的目标路径（可能是目录前缀，如 `components/controls/Button`）。
 * @param size - 实测尺寸，形如 `50x50`。
 * @returns 找到返回 true，尺寸无法解析返回 null，没找到返回 false。
 */
function describedIn(textByFile, where, size) {
  const match = /^(\d+)x(\d+)$/u.exec(String(size ?? ''))
  if (match === null) return null
  const [, w, h] = match
  /* 文档里写尺寸的花样不少：`280 × 905`、`280px × 905px`、`780x114`、`50 × 50`。
   * 单位可有可无，位置在数字与分隔符之间。 */
  const unit = '\\s*(?:px|dp|pt|vp)?\\s*'
  const sep = `${unit}[×xX*]${unit}`
  const forward = new RegExp(`${w}${sep}${h}`, 'u')
  const reverse = new RegExp(`${h}${sep}${w}`, 'u')
  for (const [file, text] of textByFile) {
    if (!file.startsWith(where)) continue
    if (forward.test(text) || reverse.test(text)) return true
  }
  return false
}

/**
 * 目标文件里有没有提到这个高度。
 *
 * 宽度随文字走的元素（按钮、胶囊、标签、文字行），规范里该写的是**高度**，不是
 * 「92 × 28」这种实例尺寸。这类锚点标 `flexible: 'width'`，检查只要求目标文件出现
 * 这个高度数字。
 * @param textByFile - 文件路径 → 小写正文。
 * @param where - 锚点给的目标路径。
 * @param size - 实测尺寸，形如 `92x28`。
 * @returns 找到返回 true，尺寸无法解析返回 null，没找到返回 false。
 */
function heightDescribedIn(textByFile, where, size) {
  const match = /^(\d+)x(\d+)$/u.exec(String(size ?? ''))
  if (match === null) return null
  const height = Number(match[2])
  const probe = new RegExp(`(^|[^0-9])${height}([^0-9]|$)`, 'u')
  for (const [file, text] of textByFile) {
    if (!file.startsWith(where)) continue
    if (probe.test(text)) return true
  }
  return false
}

/**
 * 给清单打分：每个身份在规范/组件语料里有没有位置，位子上有没有写下它的尺寸。
 *
 * 先问人工锚点（产品叫什么 ↔ 仓库里叫什么），再去语料里做包含判断。包含判断只能
 * 给线索——命中的可能是真覆盖，也可能是碰巧同名——所以命中处一并写进结果，留给人复核。
 * 锚点命中的再走一次深度检查（`described`）。
 * @param elements - 清单条目（data/ui-inventory.json 的 elements）。
 * @returns 对照结果。
 */
function scoreCoverage(elements) {
  const corpus = readCorpus()
  const anchors = readAnchors()
  const textByFile = new Map()
  for (const item of corpus) {
    if (!textByFile.has(item.file)) textByFile.set(item.file, item.text)
  }
  return elements.map(el => {
    const tokens = keyTokens(el.key)
    const pluginOwned = /dsx-|lc-|duc-|dye-|mrat-|_6nhg2/i.test(el.cls)
    /* 锚点要连着原始类名与座位一起匹配：身份里的哈希已经被剥掉了（`_0Fr0Ha_stepper` → `stepper`），
     * 「这个 section 是哪套模块」这条线索只在没剥的那半截里；而匿名元素（没有类名的 svg / span）
     * 只能靠座位认领。 */
    const hay = `${el.key} ${el.cls ?? ''} ${el.slot ?? ''}`.toLowerCase()
    const anchor = anchors.find(a => hay.includes(String(a.match).toLowerCase()))
    const base = {
      key: el.key, cls: el.cls ?? '', slot: el.slot, count: el.count, size: el.style?.size ?? '',
      steps: (el.steps ?? []).slice(0, 6), texts: el.texts ?? [], arias: el.arias ?? [],
      pluginOwned,
    }
    if (anchor !== undefined) {
      /* `flexible: true` 的锚点表示「尺寸完全随内容走」（会话标题、状态文字……），规范不该为它
       * 写死一个数；`flexible: 'width'` 表示只有宽度随内容（按钮、胶囊、文字行），检查退一步，
       * 只要求目标文件写了它的高度。两种都不计入待办。 */
      const described = anchor.flexible === true
        ? null
        : (anchor.flexible === 'width'
            ? heightDescribedIn(textByFile, anchor.where, el.style?.size)
            : describedIn(textByFile, anchor.where, el.style?.size))
      return {
        ...base,
        coverage: 'covered',
        described,
        hits: [{ where: anchor.where, token: anchor.match, kind: 'anchor', id: anchor.note }],
      }
    }
    const hits = []
    for (const item of corpus) {
      const token = tokens.find(t => item.text.includes(t))
      if (token !== undefined && hits.length < 4) hits.push({ where: item.file, token, kind: item.kind, id: item.id })
    }
    return { ...base, coverage: hits.length === 0 ? 'missing' : 'referenced', described: null, hits }
  })
}

/**
 * 写 data/ui-coverage.json 并打印一行摘要。
 * @param elements - 清单条目。
 */
async function writeCoverage(elements) {
  const coverage = scoreCoverage(elements)
  await mkdir(OUT, { recursive: true })
  await writeFile(join(OUT, 'ui-coverage.json'), `${JSON.stringify({
    $comment: 'Whether each identity in the inventory has a home in the spec/component corpus. covered = a human anchor matched (described means the target file states its measured size); referenced = the word merely appears somewhere in the corpus (needs review); missing = a to-do.',
    generatedAt: new Date().toISOString(),
    counts: {
      identities: coverage.length,
      covered: coverage.filter(c => c.coverage === 'covered').length,
      described: coverage.filter(c => c.described === true).length,
      coveredNotDescribed: coverage.filter(c => c.coverage === 'covered' && c.described === false).length,
      referenced: coverage.filter(c => c.coverage === 'referenced').length,
      missing: coverage.filter(c => c.coverage === 'missing').length,
      pluginOwned: coverage.filter(c => c.pluginOwned).length,
    },
    coverage,
  }, null, 2)}\n`, 'utf8')
  const count = kind => coverage.filter(c => c.coverage === kind).length
  const described = coverage.filter(c => c.described === true).length
  const notDescribed = coverage.filter(c => c.coverage === 'covered' && c.described === false).length
  console.log(`coverage  identities=${coverage.length}  covered=${count('covered')}（已写清 ${described} / 未写清 ${notDescribed}）  referenced=${count('referenced')}  missing=${count('missing')}`)
}

/* `--coverage-only`：只重算对照，不开浏览器。
 * 锚点表是手写的，改一条就要重扫十来分钟没有道理——采集与打分拆开，
 * 手工判断可以随时重算。 */
if (process.argv.includes('--coverage-only')) {
  const file = join(OUT, 'ui-inventory.json')
  if (!existsSync(file)) {
    console.error('data/ui-inventory.json 不存在：先跑一次 node scripts/scan-ui.mjs')
    process.exit(1)
  }
  const inventory = JSON.parse(readFileSync(file, 'utf8'))
  await writeCoverage(inventory.elements ?? [])
  console.log('wrote data/ui-coverage.json（未重新采集）')
  process.exit(0)
}

/* ── 浏览器 ─────────────────────────────────────────────────────────── */

const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
]
const browserPath = BROWSERS.find(p => existsSync(p))
if (browserPath === undefined) { console.error('no Edge/Chrome found'); process.exit(1) }
if (!existsSync(CREDENTIALS)) { console.error(`credentials not found: ${CREDENTIALS}`); process.exit(1) }

const { cookie } = authCookieFor({ credentialsPath: CREDENTIALS, url: DSH_URL })
const PROFILE = join(tmpdir(), `dsh-scan-${Date.now()}`)
const proc = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--window-size=1600,1000',
  `--user-data-dir=${PROFILE}`, '--remote-debugging-port=0', 'about:blank',
], { stdio: 'ignore' })

/**
 * 等浏览器写出它选的调试端口。
 * @returns 端口号。
 */
async function devtoolsPort() {
  const file = join(PROFILE, 'DevToolsActivePort')
  for (let i = 0; i < 150; i++) {
    try {
      const port = Number(readFileSync(file, 'utf8').split('\n')[0])
      if (Number.isFinite(port) && port > 0) return port
    } catch { /* 还没写出来 */ }
    await new Promise(r => setTimeout(r, 100))
  }
  throw new Error('DevToolsActivePort was never written')
}

/**
 * 等 DevTools 端点起来。
 * @param port - 端口。
 * @returns 目标列表。
 */
async function devtools(port) {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      if (Array.isArray(list) && list.some(t => t.type === 'page')) return list
    } catch { /* 还没起来 */ }
    await new Promise(r => setTimeout(r, 250))
  }
  throw new Error('DevTools endpoint timeout')
}

/** 收摊。 */
async function shutdown() {
  spawnSync('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' })
}

/* ── 清单 ↔ 规范 的对照 ─────────────────────────────────────────────── */

/**
 * 把规范与组件语料读成「关键词 → 出处」的表。
 *
 * 语料是仓库自己的文字：每个 spec 文档、每个组件的 README/SPEC、以及每份
 * `*.module.css`。做法是朴素的包含判断——命中的可能是真覆盖，也可能是碰巧同名，
 * 所以结果里同时给出命中的出处，让人（和下一轮的我）能复核，而不是当成结论。
 * @returns 语料条目数组。
 */
function readCorpus() {
  const items = []
  const push = (file, text, kind, id) => items.push({ file, text: text.toLowerCase(), kind, id })

  const specDir = join(ROOT, 'spec')
  if (existsSync(specDir)) {
    for (const name of readdirSync(specDir)) {
      if (!name.endsWith('.md')) continue
      push(`spec/${name}`, readFileSync(join(specDir, name), 'utf8'), 'spec', name.replace(/\.md$/u, ''))
    }
  }
  const compDir = join(ROOT, 'components')
  if (existsSync(compDir)) {
    for (const category of readdirSync(compDir)) {
      const catPath = join(compDir, category)
      if (!statSync(catPath).isDirectory()) continue
      for (const id of readdirSync(catPath)) {
        const dir = join(catPath, id)
        if (!statSync(dir).isDirectory()) continue
        for (const name of readdirSync(dir)) {
          if (!/\.(md|css)$/u.test(name)) continue
          push(`components/${category}/${id}/${name}`, readFileSync(join(dir, name), 'utf8'), 'component', id.toLowerCase())
        }
      }
    }
  }
  return items
}

/**
 * 归一化身份的各个片段，用作对照的关键词。
 * @param key - 归一化身份。
 * @returns 关键词数组（已小写、去重、丢掉太短的）。
 */
function keyTokens(key) {
  const [cls, tag, role] = key.split('|')
  const tokens = []
  for (const name of cls.split(' ')) {
    if (name.length < 4) continue
    tokens.push(name.toLowerCase())
    /* `sectionHeader` 也要能被 `section-header` / `section header` 命中。 */
    const spaced = name.replace(/([a-z0-9])([A-Z])/gu, '$1-$2').toLowerCase()
    if (spaced !== name.toLowerCase()) tokens.push(spaced)
  }
  if (role !== '') tokens.push(role.toLowerCase())
  if (tag !== '' && tokens.length === 0) tokens.push(tag)
  return [...new Set(tokens)]
}

/**
 * 人工锚点：产品里的类名族 → 仓库里的出处。
 *
 * 自动对照只做包含判断，而同一件东西在两个地方常常不叫同一个名字（产品叫
 * `sessionRow`，仓库叫 SidebarRow）。锚点表是人的判断，命中即判为已收录。
 * @returns 锚点数组。
 */
function readAnchors() {
  const file = join(ROOT, 'data', 'inventory-anchors.json')
  if (!existsSync(file)) return []
  const parsed = JSON.parse(readFileSync(file, 'utf8'))
  return Array.isArray(parsed.anchors) ? parsed.anchors : []
}

/* ── 主流程 ─────────────────────────────────────────────────────────── */

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
  const send = (method, params) => new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params: params ?? {} }))
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`${method} timeout`)) } }, 180000)
  })

  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')
  const set = await send('Network.setCookie', {
    name: cookie.name, value: cookie.value, url: DSH_URL + '/', path: '/',
    httpOnly: true, sameSite: 'Strict', expires: cookie.expires,
  })
  if (set.success !== true) throw new Error('the session cookie was rejected')

  const evaluate = async expression => {
    const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (out.exceptionDetails) throw new Error(out.exceptionDetails.exception?.description ?? out.exceptionDetails.text)
    return out.result.value
  }
  const settle = ms => new Promise(r => setTimeout(r, ms))

  /** 采集样本：一个场景一步一份。 */
  const samples = []

  /**
   * 把页面拉回一个干净状态。
   *
   * 会话页的「轨迹」这类视图能把渲染进程跑到几秒钟不响应；一次卡死不该让后面
   * 所有场景跟着白跑。先退回空白页，让下一场景的导航有一个可用的渲染进程。
   */
  async function hardReset() {
    try { await send('Page.navigate', { url: 'about:blank' }) } catch { /* 卡死了也只能继续 */ }
    await settle(1200)
  }

  for (const scene of scenes) {
    let opened = false
    for (let attempt = 0; attempt < 2 && !opened; attempt++) {
      try {
        await send('Page.navigate', { url: DSH_URL + '/' })
        opened = true
      } catch (error) {
        console.log(`retry    ${scene.name.padEnd(16)} 打不开页面（第 ${attempt + 1} 次）：${error.message.split('\n')[0].slice(0, 50)}`)
        await hardReset()
      }
    }
    if (!opened) {
      console.log(`skipped  ${scene.name.padEnd(16)} 页面始终打不开`)
      continue
    }
    await settle(3500)
    /* 每一步都单独兜住：某个视图打不开（菜单点不开、标签页没内容）不该让整轮扫描
     * 白跑——「先把界面登记完」需要这种容错。 */
    const probeAfter = i => scene.perStep === true || i === scene.steps.length - 1
    if (scene.steps.length === 0) {
      try {
        const json = JSON.parse(await evaluate(INVENTORY_PROBE))
        samples.push({ scene: scene.name, step: scene.title, viewport: json.viewport, nodes: json.nodes })
        console.log(`scanned  ${scene.name.padEnd(16)} ${scene.title}  ${json.nodes.length} nodes`)
      } catch (error) {
        console.log(`skipped  ${scene.name.padEnd(16)} ${scene.title}  探针失败：${error.message.split('\n')[0].slice(0, 70)}`)
      }
      continue
    }
    for (let i = 0; i < scene.steps.length; i++) {
      const label = scene.name === 'settings'
        ? (i === 0 ? '设置 · 打开' : `设置 · ${SETTINGS_SECTIONS[i - 1] ?? i}`)
        : (scene.perStep === true ? `${scene.title} · ${i === 0 ? '基视图' : `第 ${i} 步`}` : scene.title)
      try {
        await evaluate(scene.steps[i])
        await settle(1200)
      } catch (error) {
        console.log(`skipped  ${scene.name.padEnd(16)} ${label}  步骤失败：${error.message.split('\n')[0].slice(0, 70)}`)
        continue
      }
      if (!probeAfter(i)) continue
      try {
        const json = JSON.parse(await evaluate(INVENTORY_PROBE))
        samples.push({ scene: scene.name, step: label, viewport: json.viewport, nodes: json.nodes })
        console.log(`scanned  ${scene.name.padEnd(16)} ${label}  ${json.nodes.length} nodes`)
      } catch (error) {
        console.log(`skipped  ${scene.name.padEnd(16)} ${label}  探针超时：${error.message.split('\n')[0].slice(0, 70)}`)
      }
    }
  }

  /* 聚合：同一身份在不同场景里只留一条，但记下它出现在哪些场景。 */
  const byKey = new Map()
  let totalNodes = 0
  for (const sample of samples) {
    for (const node of sample.nodes) {
      totalNodes++
      const existing = byKey.get(node.key)
      if (existing === undefined) {
        byKey.set(node.key, {
          key: node.key, tag: node.tag, role: node.role, cls: node.cls, slot: node.slot,
          viewBox: node.viewBox, style: node.style, rect: node.rect,
          count: 1, steps: [sample.step], texts: node.text === '' ? [] : [node.text],
          arias: node.aria === '' ? [] : [node.aria],
        })
        continue
      }
      existing.count++
      if (!existing.steps.includes(sample.step)) existing.steps.push(sample.step)
      if (node.text !== '' && existing.texts.length < 4 && !existing.texts.includes(node.text)) existing.texts.push(node.text)
      if (node.aria !== '' && existing.arias.length < 3 && !existing.arias.includes(node.aria)) existing.arias.push(node.aria)
    }
  }

  const elements = [...byKey.values()].sort((a, b) => b.count - a.count)

  await mkdir(OUT, { recursive: true })
  await writeFile(join(OUT, 'ui-inventory.json'), `${JSON.stringify({
    $comment: 'Collected from the running product by scripts/scan-ui.mjs. key is the identity with the CSS Modules hash stripped off; do not hand-edit.',
    generatedAt: new Date().toISOString(),
    viewport: samples[0]?.viewport ?? null,
    scenes: samples.map(s => ({ scene: s.scene, step: s.step })),
    counts: { samples: samples.length, nodes: totalNodes, identities: elements.length },
    elements,
  }, null, 2)}\n`, 'utf8')

  await writeCoverage(elements)
  console.log('\nwrote data/ui-inventory.json + data/ui-coverage.json')
} catch (error) {
  console.error(`scan failed: ${error.message}`)
  process.exitCode = 1
} finally {
  if (ws !== undefined) ws.close()
  await shutdown()
}
