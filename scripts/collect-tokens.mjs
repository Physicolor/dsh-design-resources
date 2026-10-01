/**
 * collect-tokens.mjs — extract the harness's real design tokens.
 *
 * The product ships its theme inside the desktop bundle: a `:root` block of raw
 * palette values (`--dsw-static-*`), a `body` block of semantic aliases for the
 * light theme, and a `body[data-ds-dark-theme]` block for the dark one. That is
 * the authority this repository mirrors; nothing here is invented.
 *
 * Output:
 *   data/tokens.json  — palette + both alias maps + resolved values per theme
 *   website/css/dsh-tokens.css — the same tokens as plain CSS, so gallery pages
 *                                can render real `var(--dsw-*)` components
 *
 * Usage: node scripts/collect-tokens.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ASAR = process.env.DSH_ASAR
  ?? 'D:/Users/12404/AppData/Local/Programs/DeepSeek Harness/resources/app.asar'

if (!existsSync(ASAR)) {
  console.error(`app.asar not found: ${ASAR}\nset DSH_ASAR to the desktop bundle path`)
  process.exit(1)
}

const buf = readFileSync(ASAR)

/** The dark-theme selector is unique to the authored (pretty-printed) copy. */
const DARK = Buffer.from('body[data-ds-dark-theme]{', 'utf8')
const darkAt = buf.indexOf(DARK)
if (darkAt === -1) {
  console.error('dark theme block not found — the bundle layout changed; fix the locator instead of shipping empty tokens')
  process.exit(2)
}

/** The palette block opens at `:root{` immediately before the light `body{`. */
const ROOT_OPEN = Buffer.from(':root{', 'utf8')
const staticAt = buf.lastIndexOf(ROOT_OPEN, darkAt)
if (staticAt === -1) {
  console.error('palette block not found before the dark theme block')
  process.exit(2)
}

/* The theme is authored as a run of rules: a `:root` block holding the palette
 * **and the geometry** (radius scale, font stacks, motion), then `body` with the
 * light aliases, then `body[data-ds-dark-theme]` with the dark ones. Only the
 * palette happens to sit in the last `:root{` before the dark block, so a slice
 * that starts there silently loses every corner and every shadow. Start well
 * before it instead; the classifier below keeps component-level CSS out. */
const sliceStart = Math.max(0, Math.min(staticAt, darkAt - 400000))
const slice = buf.subarray(sliceStart, darkAt + 40000).toString('utf8')

/**
 * Theme-level selectors, as opposed to a component's own rule.
 *
 * The geometry block is written as `:root` / `body,body *`; a component that
 * happens to redefine `--dsw-elevation-stroke-color` for itself must not be
 * mistaken for the definition.
 * @param selector - the rule's selector text.
 * @returns true when the rule belongs to the theme layer.
 */
function isThemeLevel(selector) {
  const parts = selector.split(',').map(part => part.trim())
  if (parts.length === 0) return false
  return parts.every(part => part === ':root' || part === 'html' || part === 'body' || part === 'body *')
}

/**
 * Parse every `selector{ ... }` rule in a CSS fragment.
 * @param css - the fragment.
 * @returns rules in source order.
 */
function rules(css) {
  const out = []
  const re = /([^{}]+)\{([^{}]*)\}/gu
  let m
  while ((m = re.exec(css)) !== null) out.push({ selector: m[1].trim(), body: m[2] })
  return out
}

/**
 * Pull the custom properties out of one rule body.
 * @param body - declarations text.
 * @returns name → value.
 */
function decls(body) {
  const out = {}
  for (const part of body.split(';')) {
    const at = part.indexOf(':')
    if (at === -1) continue
    const name = part.slice(0, at).trim()
    if (!name.startsWith('--dsw-')) continue
    out[name] = part.slice(at + 1).trim()
  }
  return out
}

const parsed = rules(slice)
const palette = {}
const light = {}
const dark = {}
const scale = {}
let lightWhere = null
let darkWhere = null
let scaleWhere = null

for (const rule of parsed) {
  const vars = decls(rule.body)
  const names = Object.keys(vars)
  if (names.length === 0) continue
  const allStatic = names.every(n => n.startsWith('--dsw-static-'))
  if (allStatic) { Object.assign(palette, vars); continue }
  if (rule.selector.includes('data-ds-dark-theme')) {
    Object.assign(dark, vars)
    darkWhere ??= rule.selector
    continue
  }
  if (rule.selector === 'body' && names.some(n => n.startsWith('--dsw-alias-'))) {
    Object.assign(light, vars)
    lightWhere ??= rule.selector
  }
}

/**
 * The geometry the theme is made of, read as declarations rather than as rules.
 *
 * Radius, elevation, shadow and type scales live in `:root` blocks that the
 * packager wraps inside JS modules, so the text before the opening brace is
 * whatever JavaScript preceded it — a rule-based reader ends up with a selector
 * like `…var base_css_default = ":root` and drops the block, which is exactly
 * how the radius scale went missing while the colours came through. Reading the
 * declarations directly sidesteps that. First definition wins, and the family
 * filter keeps component-level overrides (`--dsw-alias-*`, `--dsw-specific-*`)
 * out of the theme layer.
 */
const SCALE_FAMILY = /^--dsw-(?:radius|corner-shape|shadow|elevation|focus-ring|mask|menu-backdrop|font-|linear-|gradient-)/
const DECL = /(--dsw-[a-z0-9-]+)\s*:\s*([^;{}]+)/gu
for (let m = DECL.exec(slice); m !== null; m = DECL.exec(slice)) {
  const name = m[1]
  if (!SCALE_FAMILY.test(name)) continue
  if (scale[name] === undefined) { scale[name] = m[2].trim(); scaleWhere ??= ':root' }
}

/**
 * Resolve `var(--x, fallback)` chains against a base map.
 * Values that cannot be fully resolved (color-mix, calc on unknown vars) are
 * returned as authored — the caller must not pretend they are final.
 * @param value - the authored value.
 * @param base - palette + theme map.
 * @param depth - recursion guard.
 * @returns the resolved value.
 */
function resolve(value, base, depth = 0) {
  if (depth > 12) return value
  const trimmed = value.trim()
  if (!trimmed.startsWith('var(')) return trimmed
  const inner = trimmed.slice(4, -1)
  const comma = inner.indexOf(',')
  const name = (comma === -1 ? inner : inner.slice(0, comma)).trim()
  const fallback = comma === -1 ? null : inner.slice(comma + 1).trim()
  const next = base[name] ?? fallback
  return next === null || next === undefined ? trimmed : resolve(next, base, depth + 1)
}

/**
 * Resolve a whole map.
 * @param map - theme alias map.
 * @returns resolved map.
 */
function resolveAll(map) {
  const base = { ...palette, ...map }
  const out = {}
  for (const [name, value] of Object.entries(map)) out[name] = resolve(value, base)
  return out
}

const resolvedLight = resolveAll(light)
const resolvedDark = resolveAll(dark)

const doc = {
  $comment: 'Generated by scripts/collect-tokens.mjs from the shipped desktop bundle. Values are the product\'s own; do not hand-edit.',
  source: ASAR.replace(/\\/gu, '/'),
  generatedAt: new Date().toISOString(),
  blocks: { palette: ':root', light: lightWhere, dark: darkWhere, scale: scaleWhere },
  counts: {
    palette: Object.keys(palette).length,
    lightAliases: Object.keys(light).length,
    darkAliases: Object.keys(dark).length,
    scale: Object.keys(scale).length,
  },
  palette,
  light,
  dark,
  scale,
  resolved: { light: resolvedLight, dark: resolvedDark },
}

mkdirSync(join(ROOT, 'data'), { recursive: true })
writeFileSync(join(ROOT, 'data', 'tokens.json'), `${JSON.stringify(doc, null, 4)}\n`, 'utf8')

/* A CSS mirror for the gallery: `:root` carries the light theme, the dark one
 * is selected by the same attribute the product uses. */
const css = []
css.push('/* Generated by scripts/collect-tokens.mjs — the product\'s own tokens.')
css.push(' * Gallery pages use this so a component written against var(--dsw-*)')
css.push(' * renders exactly as it does inside the harness. Do not hand-edit. */')
css.push('')
css.push(':root {')
for (const [name, value] of Object.entries(palette)) css.push(`    ${name}: ${value};`)
css.push('')
/* Theme-independent geometry: radii, elevations, shadow levels. */
for (const [name, value] of Object.entries(scale)) css.push(`    ${name}: ${value};`)
css.push('')
for (const [name, value] of Object.entries(light)) css.push(`    ${name}: ${value};`)
css.push('}')
css.push('')
css.push('body[data-ds-dark-theme] {')
for (const [name, value] of Object.entries(dark)) css.push(`    ${name}: ${value};`)
css.push('}')
css.push('')

mkdirSync(join(ROOT, 'website', 'css'), { recursive: true })
writeFileSync(join(ROOT, 'website', 'css', 'dsh-tokens.css'), css.join('\n'), 'utf8')

console.log(`tokens: palette=${doc.counts.palette} light=${doc.counts.lightAliases} dark=${doc.counts.darkAliases}`)
console.log(`  resolved: light=${Object.keys(resolvedLight).length} dark=${Object.keys(resolvedDark).length}`)
console.log(`  wrote data/tokens.json + website/css/dsh-tokens.css`)
