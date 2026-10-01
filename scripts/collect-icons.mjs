/**
 * collect-icons.mjs — extract the harness's own icon set and brand marks.
 *
 * Source of truth: the shipped `@deepseek-ai/dsh-client-ui-primitives` bundle.
 * Every glyph in it carries its authored name in a JSDoc comment
 * (`ic_ds_close_outline_16`), and the component name encodes shape + size
 * (`IconCloseOutline16`). Both are kept: the authored name is the naming
 * convention this repository documents, the component name is what a plugin
 * imports.
 *
 * Nothing here is redrawn or "cleaned up": path data is copied verbatim, and
 * the emitted SVG differs from the component only by becoming a static file
 * (fill: currentColor, aria-hidden, no React wrapper).
 *
 * Usage: node scripts/collect-icons.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = process.env.DSH_PRIMITIVES
  ?? 'D:/dsh-home/profiles/web/node_modules/@deepseek-ai/dsh-client-ui-primitives/lib/index.js'

if (!existsSync(SRC)) {
  console.error(`primitive bundle not found: ${SRC}\nset DSH_PRIMITIVES to @deepseek-ai/dsh-client-ui-primitives/lib/index.js`)
  process.exit(1)
}

const text = readFileSync(SRC, 'utf8')
const lines = text.split(/\r?\n/)

/**
 * Walk forward from `start` until the brace/paren nesting opened on that line
 * closes again. Returns the slice covering the whole expression.
 * @param start - 0-based line index.
 * @returns the block text.
 */
function blockFrom(start) {
  let depth = 0
  let seen = false
  const out = []
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]
    out.push(line)
    for (const ch of line) {
      if (ch === '{' || ch === '(' || ch === '[') { depth++; seen = true } else if (ch === '}' || ch === ')' || ch === ']') depth--
    }
    if (seen && depth <= 0) break
  }
  return out.join('\n')
}

/**
 * Pull the path data out of a component block, in source order.
 * @param block - the component expression.
 * @returns path data strings.
 */
function pathsOf(block) {
  const out = []
  const re = /\bd:\s*"((?:[^"\\]|\\.)*)"/gu
  let m
  while ((m = re.exec(block)) !== null) out.push(m[1])
  return out
}

/**
 * Read the viewBox of a component block.
 * @param block - the component expression.
 * @param fallback - size-derived viewBox when the block has none.
 * @returns the viewBox string.
 */
function viewBoxOf(block, fallback) {
  const m = /\bviewBox:\s*"([^"]+)"/u.exec(block)
  return m === null ? fallback : m[1]
}

/** Authored icon name (`ic_ds_*`) declared directly above a component. */
const NAMED = /^\/\*\*\s*(ic_ds_[a-z0-9_]+)\s*\*\/\s*$/
/** `const IconXxx = ({ size = N, className }) => jsx(s)("svg", {` */
const COMPONENT = /^const\s+(Icon\w+)\s*=\s*\(\{\s*size\s*=\s*(\d+)\s*,\s*className\s*\}\)\s*=>\s*jsxs?\(\s*"svg"/u

const icons = []
let pendingName = null

for (let i = 0; i < lines.length; i++) {
  const named = NAMED.exec(lines[i])
  if (named !== null) { pendingName = named[1]; continue }

  const comp = COMPONENT.exec(lines[i])
  if (comp === null) continue

  const [, component, size] = comp
  const block = blockFrom(i)
  const paths = pathsOf(block)
  const viewBox = viewBoxOf(block, `0 0 ${size} ${size}`)
  icons.push({
    component,
    name: pendingName ?? component,
    size: Number(size),
    viewBox,
    paths,
    family: viewBox.split(' ').slice(2).join('x'),
  })
  pendingName = null
  i += block.split('\n').length - 1
}

/* ── brand marks ─────────────────────────────────────────────────── */

/** The fish silhouette, exported by the bundle as a bare path constant. */
const fishPath = (() => {
  const m = /\bFISH_LOGO_PATH\s*=\s*"((?:[^"\\]|\\.)*)"/u.exec(text)
  return m === null ? null : m[1]
})()

/** The wordmark's own component block (its paths are not `Icon*`-named). */
const wordmark = (() => {
  const idx = lines.findIndex(l => /^function\s+BrandWordmark\s*\(/u.test(l))
  if (idx === -1) return null
  const block = blockFrom(idx)
  const viewBox = /viewBox:\s*includeMark\s*\?\s*"([^"]+)"\s*:\s*"([^"]+)"/u.exec(block)
  return {
    paths: pathsOf(block),
    viewBoxWithMark: viewBox === null ? '0 0 182 24' : viewBox[1],
    viewBoxMarkOnly: viewBox === null ? '26 0 156 24' : viewBox[2],
  }
})()

/* ── emit ────────────────────────────────────────────────────────── */

const ICON_DIR = join(ROOT, 'icons')
mkdirSync(join(ICON_DIR, 'brand'), { recursive: true })

/**
 * `IconCloseOutline16` → `ic_ds_close_outline_16` when the authored name is
 * missing, so every file still lands on the documented naming scheme.
 * @param entry - one collected icon.
 * @returns the file stem.
 */
function stemOf(entry) {
  return entry.name.replace(/^ic_ds_/u, '').replace(/_/gu, '-')
}

/** Wrap paths in a standalone SVG document. */
function toSvg(viewBox, paths, comment) {
  return `<!-- ${comment} -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" aria-hidden="true">\n${paths.map(d => `  <path d="${d}" fill="currentColor"/>`).join('\n')}\n</svg>\n`
}

for (const icon of icons) {
  writeFileSync(
    join(ICON_DIR, `${stemOf(icon)}.svg`),
    toSvg(icon.viewBox, icon.paths, `${icon.component} · ${icon.name} · viewBox ${icon.viewBox} · default ${icon.size}px`),
    'utf8',
  )
}

if (fishPath !== null) {
  writeFileSync(
    join(ICON_DIR, 'brand', 'fish.svg'),
    toSvg('0 0 23.16 17.04', [fishPath], 'FISH_LOGO_PATH · native viewBox 23.16 x 17.04 · default 24px wide'),
    'utf8',
  )
}

if (wordmark !== null) {
  writeFileSync(
    join(ICON_DIR, 'brand', 'wordmark.svg'),
    toSvg(wordmark.viewBoxWithMark, wordmark.paths, 'BrandWordmark · viewBox 0 0 182 24 · default 24px tall · includeMark variant'),
    'utf8',
  )
}

const byFamily = {}
for (const icon of icons) byFamily[icon.family] = (byFamily[icon.family] ?? 0) + 1

const doc = {
  $comment: 'Generated by scripts/collect-icons.mjs from @deepseek-ai/dsh-client-ui-primitives. Path data is copied verbatim; do not hand-edit.',
  source: SRC.replace(/\\/gu, '/'),
  generatedAt: new Date().toISOString(),
  naming: {
    authored: 'ic_ds_<name>_<style>_<size>',
    component: 'Icon<Name><Style><Size>',
    file: '<name>-<style>.svg',
  },
  counts: { total: icons.length, byFamily },
  brand: {
    fish: fishPath === null ? null : { viewBox: '0 0 23.16 17.04', file: 'icons/brand/fish.svg', path: fishPath },
    wordmark: wordmark === null ? null : {
      viewBoxWithMark: wordmark.viewBoxWithMark,
      viewBoxMarkOnly: wordmark.viewBoxMarkOnly,
      file: 'icons/brand/wordmark.svg',
      pathCount: wordmark.paths.length,
    },
  },
  icons: icons.map(icon => ({
    component: icon.component,
    name: icon.name,
    size: icon.size,
    viewBox: icon.viewBox,
    file: `icons/${stemOf(icon)}.svg`,
    pathCount: icon.paths.length,
  })),
}

writeFileSync(join(ROOT, 'data', 'icons.json'), `${JSON.stringify(doc, null, 4)}\n`, 'utf8')

console.log(`icons: ${icons.length} extracted`)
console.log(`  families: ${Object.entries(byFamily).map(([k, v]) => `${k}=${v}`).join(' ')}`)
console.log(`  brand: fish=${fishPath === null ? 'missing' : 'ok'} wordmark=${wordmark === null ? 'missing' : `${wordmark.paths.length} paths`}`)
if (icons.length === 0) {
  console.error('extracted zero icons — the bundle format changed; fix the parser instead of shipping an empty set')
  process.exit(2)
}
