/**
 * check-demos-i18n.mjs — the gate for the specimen layer.
 *
 * A demo is ONE file for both languages (`docs/I18N.md` §5). Its geometry and
 * CSS are shared, so the only things that may differ are the comments (written
 * in English, full stop) and the visible copy, which is either
 *   - ours: carried in `language/demos/<id>.json` and applied at mount time
 *     through `data-t` / `data-t-aria` / `data-t-title`, or
 *   - the product's: kept verbatim and marked `data-capture`.
 *
 * This walks each demo with a small element tree and checks exactly that: a
 * Chinese text node or attribute is legal only under a `data-capture` ancestor,
 * or as the fallback text of a `data-t*` element. It also checks the sidecars,
 * because a key present in one language and missing from the other is the
 * failure that looks finished on disk and blank on screen.
 *
 * Usage: node scripts/check-demos-i18n.mjs
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join } from 'node:path'
import { ROOT } from './lib/i18n.mjs'

const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/u
const RULES = ['data-t', 'data-t-aria', 'data-t-title']
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
  'path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'ellipse', 'use', 'stop'])
const problems = []
const seenIds = new Map()

/** Every demo file, as `{ id, rel }`. */
function demoFiles() {
  const out = []
  const dir = join(ROOT, 'website', 'demos')
  if (existsSync(dir)) {
    for (const f of readdirSync(dir)) {
      if (f.endsWith('.html')) out.push({ id: basename(f, '.html'), rel: `website/demos/${f}` })
    }
  }
  const manifest = JSON.parse(readFileSync(join(ROOT, 'components', 'index.json'), 'utf8'))
  for (const c of manifest.components ?? []) {
    const rel = `${String(c.path).replace(/\/$/u, '')}/demo.html`
    if (existsSync(join(ROOT, rel))) out.push({ id: c.id, rel })
  }
  return out
}

/**
 * Build a minimal element tree.
 *
 * Not a parser — it is enough for these files, which have no attribute value
 * containing `>`, and whose comments have already been removed. Void elements
 * are closed immediately, which is what keeps the tree shallow where it should
 * be (the `<svg>` demos).
 * @param html - markup to walk.
 * @returns the synthetic root node.
 */
function buildTree(html) {
  const root = { name: '#root', attrs: {}, children: [] }
  const stack = [root]
  const re = /<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>|([^<]+)/gu
  let m
  while ((m = re.exec(html)) !== null) {
    const parent = stack[stack.length - 1]
    if (m[4] !== undefined) {
      parent.children.push({ type: 'text', text: m[4] })
      continue
    }
    const name = m[2].toLowerCase()
    if (m[1] === '/') {
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].name === name) { stack.length = i; break }
      }
      continue
    }
    const attrs = {}
    const attrRe = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gu
    let a
    while ((a = attrRe.exec(m[3] ?? '')) !== null) attrs[a[1]] = a[2] ?? a[3] ?? ''
    const node = { type: 'element', name, attrs, children: [] }
    parent.children.push(node)
    if (!VOID.has(name)) stack.push(node)
  }
  return root
}

/** Walk every element, with the ancestors that carry a key or a capture. */
function walk(node, ancestors, visit) {
  for (const child of node.children ?? []) {
    if (child.type === 'text') { visit(child, ancestors, node); continue }
    visit(child, ancestors, node)
    walk(child, [...ancestors, child], visit)
  }
}

for (const file of demoFiles()) {
  if (seenIds.has(file.id)) problems.push(`duplicate demo id "${file.id}": ${seenIds.get(file.id)} and ${file.rel}`)
  seenIds.set(file.id, file.rel)

  const raw = readFileSync(join(ROOT, file.rel), 'utf8')
  /* Comments are not painted copy; styles and scripts are not either, but their
   * contents still have to be English, which the CJK scan below enforces. */
  const html = raw
    .replace(/<!--[\s\S]*?-->/gu, ' ')
    .replace(/<style[\s\S]*?<\/style>/giu, ' ')
    .replace(/<script[\s\S]*?<\/script>/giu, ' ')
  const tree = buildTree(html)

  const insideCapture = ancestors => ancestors.some(n => n.attrs['data-capture'] !== undefined)
  const insideKeyed = ancestors => ancestors.some(n => RULES.some(r => n.attrs[r] !== undefined))

  walk(tree, [], (node, ancestors) => {
    if (node.type === 'text') {
      if (!CJK.test(node.text)) return
      if (insideCapture(ancestors) || insideKeyed(ancestors)) return
      problems.push(`${file.rel}: Chinese text with no home: "${node.text.replace(/\s+/gu, ' ').trim().slice(0, 44)}"`)
      return
    }
    for (const [name, value] of Object.entries(node.attrs)) {
      if (!CJK.test(value)) continue
      if (name === 'data-capture' || RULES.includes(name)) continue
      /* An attribute's Chinese is the fallback its own rule replaces:
       * `aria-label` ← `data-t-aria`, `title` ← `data-t-title`. */
      if (name === 'aria-label' && node.attrs['data-t-aria'] !== undefined) continue
      if (name === 'title' && node.attrs['data-t-title'] !== undefined) continue
      problems.push(`${file.rel}: <${node.name} ${name}="${value.slice(0, 26)}"> contains Chinese (key it, or mark the element data-capture)`)
    }
    for (const rule of RULES) {
      const key = node.attrs[rule]
      if (key === undefined) continue
      if (!key.startsWith(`demo.${file.id}.`)) {
        problems.push(`${file.rel}: ${rule}="${key}" must start with "demo.${file.id}."`)
      }
      if (rule === 'data-t' && node.children.some(c => c.type === 'element')) {
        /* `data-t` replaces textContent, so element children would be lost at
         * mount time — the label would swallow the icon next to it. */
        problems.push(`${file.rel}: data-t="${key}" sits on an element with element children`)
      }
    }
  })

  const sidecarRel = `language/demos/${file.id}.json`
  if (!existsSync(join(ROOT, sidecarRel))) {
    problems.push(`${file.rel}: missing ${sidecarRel}`)
    continue
  }
  let sidecar
  try { sidecar = JSON.parse(readFileSync(join(ROOT, sidecarRel), 'utf8')) } catch (error) {
    problems.push(`${sidecarRel}: ${error.message}`)
    continue
  }
  const zhKeys = Object.keys(sidecar.zh ?? {}).sort()
  const enKeys = Object.keys(sidecar.en ?? {}).sort()
  if (zhKeys.join(',') !== enKeys.join(',')) problems.push(`${sidecarRel}: zh has ${zhKeys.length} keys, en has ${enKeys.length}`)
  for (const key of enKeys) {
    if (CJK.test(String(sidecar.en[key]))) problems.push(`${sidecarRel}: en.${key} still contains Chinese`)
  }
  const used = new Set()
  walk(tree, [], node => {
    if (node.type !== 'element') return
    for (const rule of RULES) {
      const key = node.attrs[rule]
      if (key === undefined) continue
      const short = key.slice(`demo.${file.id}.`.length)
      used.add(short)
      if (sidecar.zh?.[short] === undefined) problems.push(`${sidecarRel}: ${rule}="${key}" has no sidecar key "${short}"`)
    }
  })
  for (const key of zhKeys) if (!used.has(key)) problems.push(`${sidecarRel}: "${key}" is not used by ${file.rel}`)
}

console.log(`demos checked: ${seenIds.size}`)
if (problems.length === 0) {
  console.log('every specimen is bilingual-ready')
  process.exit(0)
}
console.log(`\n${problems.length} problem(s):`)
for (const p of problems.slice(0, 80)) console.log(`  - ${p}`)
if (problems.length > 80) console.log(`  … and ${problems.length - 80} more`)
process.exit(1)
