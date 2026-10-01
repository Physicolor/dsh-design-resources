/**
 * check-refs.mjs — catch spec documents that name a seat the harness does not have.
 *
 * The spec's whole value is that its claims are checkable, so a seat name that
 * no longer exists (or never did) is a defect, not a typo: a reader who follows
 * it writes a plugin that silently does nothing.
 *
 * Every `` `a.b.c` `` token inside backticks in `spec/`, `components/` and
 * `README*.md` whose first segment is a known seat namespace is checked against
 * `data/slots.json`.
 *
 * Usage: node scripts/check-refs.mjs
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const slotsPath = join(ROOT, 'data', 'slots.json')
if (!existsSync(slotsPath)) {
  console.error('data/slots.json missing — run scripts/collect-slots.mjs first')
  process.exit(1)
}

const seats = new Set(JSON.parse(readFileSync(slotsPath, 'utf8')).seats.map(s => s.name))

/** Namespaces that only ever prefix a real seat. */
const NAMESPACES = ['sidebar', 'conversation', 'settings', 'shell', 'rightbar', 'main', 'plugins']

/**
 * Collect markdown files to scan.
 * @returns absolute paths.
 */
function targets() {
  const out = []
  const specDir = join(ROOT, 'spec')
  if (existsSync(specDir)) {
    for (const f of readdirSync(specDir)) if (f.endsWith('.md')) out.push(join(specDir, f))
  }
  for (const f of ['README.md', 'README.zh-CN.md', join('icons', 'README.md')]) {
    const p = join(ROOT, f)
    if (existsSync(p)) out.push(p)
  }
  return out
}

const problems = []
let checked = 0

for (const file of targets()) {
  const text = readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/u)
  lines.forEach((line, index) => {
    /**
     * Record a candidate seat name and test it.
     * @param token - a full dotted seat name.
     */
    const test = token => {
      checked++
      if (seats.has(token)) return
      if ([...seats].some(s => s.startsWith(`${token}.`))) return
      problems.push({ file: relative(ROOT, file).replace(/\\/gu, '/'), line: index + 1, token })
    }

    const re = /`([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)+)`/gu
    let m
    while ((m = re.exec(line)) !== null) {
      if (NAMESPACES.includes(m[1].split('.')[0])) test(m[1])
    }

    /* Shorthand siblings: `` `conversation.input.left` / `.right` `` means
     * conversation.input.right, not conversation.input.left.right — so a
     * shorthand passes when ANY reading resolves, and only fails when none do. */
    const shortRe = /`(\.[a-zA-Z][a-zA-Z0-9]*)`/gu
    while ((m = shortRe.exec(line)) !== null) {
      const before = line.slice(0, m.index)
      const fulls = [...before.matchAll(/`([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)+)`/gu)]
      const last = fulls[fulls.length - 1]
      if (last === undefined) continue
      const parts = last[1].split('.')
      if (parts.length < 2 || !NAMESPACES.includes(parts[0])) continue
      const parent = parts.slice(0, -1).join('.')
      const name = m[1].slice(1)
      const candidates = [`${parent}.${name}`, `${last[1]}.${name}`]
      checked++
      const resolves = candidates.some(c => seats.has(c) || [...seats].some(s => s.startsWith(`${c}.`)))
      if (resolves) continue
      problems.push({ file: relative(ROOT, file).replace(/\\/gu, '/'), line: index + 1, token: candidates.join(' | ') })
    }
  })
}

console.log(`seat references checked: ${checked}`)
if (problems.length === 0) {
  console.log('all seat names resolve against data/slots.json')
  process.exit(0)
}

console.log(`unresolved seat names: ${problems.length}`)
for (const p of problems) console.log(`  ${p.file}:${p.line}  ${p.token}`)
process.exit(1)
