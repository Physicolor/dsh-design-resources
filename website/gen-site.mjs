/**
 * gen-site.mjs — build the website's data file from the repository's own data.
 *
 * Everything the gallery shows is inlined into `website/js/data.js` on purpose:
 * the site has to work when opened straight from disk (`file://`), where a page
 * cannot fetch its neighbours. That is why spec documents are converted to HTML
 * here rather than in the browser.
 *
 * Inputs : data/*.json, spec/*.md, components/** (index.json + per-component files)
 * Output : website/js/data.js
 *
 * Usage: node website/gen-site.mjs [--check]   (--check fails when the output is stale)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'website', 'js', 'data.js')

/**
 * Read a JSON file, or a fallback when it is absent.
 * @param rel - repository-relative path.
 * @param fallback - value to use when missing.
 * @returns parsed value.
 */
function readJson(rel, fallback) {
  const p = join(ROOT, rel)
  if (!existsSync(p)) return fallback
  try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return fallback }
}

/**
 * Read a text file, or an empty string.
 * @param rel - repository-relative path.
 * @returns file contents.
 */
function readText(rel) {
  const p = join(ROOT, rel)
  return existsSync(p) ? readFileSync(p, 'utf8') : ''
}

/* ── markdown ──────────────────────────────────────────────────────── */

/**
 * Escape the characters that would break out of HTML text.
 * @param s - raw text.
 * @returns escaped text.
 */
function esc(s) {
  return s.replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;').replace(/"/gu, '&quot;')
}

/**
 * Inline markdown: code spans, bold, links.
 * @param s - raw inline text.
 * @returns HTML.
 */
function inline(s) {
  let out = esc(s)
  out = out.replace(/`([^`]+)`/gu, (_m, c) => `<code>${c}</code>`)
  out = out.replace(/\*\*([^*]+)\*\*/gu, '<strong>$1</strong>')
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/gu, (_m, text, href) => `<a href="${href}">${text}</a>`)
  return out
}

/**
 * Convert the repository's markdown to HTML.
 *
 * Deliberately small: headings, tables, lists, fences, quotes, rules, inline
 * spans. It covers what `spec/` and the component READMEs actually use, and it
 * fails visibly (renders as text) rather than silently mangling structure.
 * @param md - markdown source.
 * @returns HTML.
 */
function mdToHtml(md) {
  const lines = md.replace(/\r\n/gu, '\n').split('\n')
  const html = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (/^```/u.test(line)) {
      const lang = line.slice(3).trim()
      const body = []
      i++
      while (i < lines.length && !/^```/u.test(lines[i])) { body.push(lines[i]); i++ }
      i++
      html.push(`<pre><code data-lang="${esc(lang)}">${esc(body.join('\n'))}</code></pre>`)
      continue
    }

    const heading = /^(#{1,4})\s+(.*)$/u.exec(line)
    if (heading !== null) {
      const level = heading[1].length
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      i++
      continue
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/u.test(line)) { html.push('<hr>'); i++; continue }

    // table: a header row followed by a delimiter row
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/u.test(lines[i + 1])) {
      const cells = row => row.replace(/^\s*\|/u, '').replace(/\|\s*$/u, '').split('|').map(c => c.trim())
      const head = cells(line)
      i += 2
      const rows = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') { rows.push(cells(lines[i])); i++ }
      html.push('<table><thead><tr>' + head.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'
        + rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('')
        + '</tbody></table>')
      continue
    }

    if (/^\s*>\s?/u.test(line)) {
      const body = []
      while (i < lines.length && /^\s*>\s?/u.test(lines[i])) { body.push(lines[i].replace(/^\s*>\s?/u, '')); i++ }
      html.push(`<blockquote>${mdToHtml(body.join('\n'))}</blockquote>`)
      continue
    }

    if (/^\s*([-*+]|\d+\.)\s+/u.test(line)) {
      const ordered = /^\s*\d+\./u.test(line)
      const items = []
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/u.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/u, ''))
        i++
      }
      const tag = ordered ? 'ol' : 'ul'
      html.push(`<${tag}>` + items.map(t => `<li>${inline(t)}</li>`).join('') + `</${tag}>`)
      continue
    }

    if (line.trim() === '') { i++; continue }

    const para = []
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4}\s|```|\s*>|\s*([-*+]|\d+\.)\s)/u.test(lines[i])) {
      para.push(lines[i])
      i++
    }
    if (para.length > 0) html.push(`<p>${inline(para.join(' '))}</p>`)
  }

  return html.join('\n')
}

/** First `# heading` of a markdown document, used as its title. */
function titleOf(md, fallback) {
  const m = /^#\s+(.+)$/mu.exec(md)
  return m === null ? fallback : m[1].trim()
}

/* ── components ────────────────────────────────────────────────────── */

/**
 * Load the reusable-source knowledge base.
 * @returns component records with source, styles, demo and docs inlined.
 */
function loadComponents() {
  const manifest = readJson('components/index.json', null)
  if (manifest === null || !Array.isArray(manifest.components)) return { manifestMissing: true, items: [] }

  const items = manifest.components.map(entry => {
    const dir = entry.path ?? ''
    const base = dir === '' ? '' : `${dir.replace(/\/$/u, '')}/`
    const readme = readText(`${base}README.md`)
    const demo = readText(`${base}demo.html`)
    const tsx = readText(`${base}index.tsx`)
    const css = readText(`${base}${(entry.id ?? 'component').toLowerCase()}.module.css`)
    return {
      ...entry,
      readme,
      readmeHtml: readme === '' ? '' : mdToHtml(readme),
      demo,
      tsx,
      css,
    }
  })

  return { manifestMissing: false, items }
}

/* ── specs ─────────────────────────────────────────────────────────── */

/**
 * Spec presentation metadata.
 *
 * A numeric filename order (`00`, `10`, `11`, `20`…) is a good filing system and
 * a poor table of contents: nobody looking for "how do I draw an icon" thinks
 * "fifty". So the navigation groups by intent and shows a short title, while the
 * document keeps its number in its own heading.
 */
const SPEC_META = {
  '00-overview': { group: 'basics', short: '总览', shortEn: 'Overview' },
  '10-frame-layout': { group: 'basics', short: '主页面骨架', shortEn: 'Frame layout' },
  '11-slot-seats': { group: 'basics', short: '座位目录与选择', shortEn: 'Seat directory' },
  '20-controls': { group: 'visual', short: '控件', shortEn: 'Controls' },
  '30-tokens': { group: 'visual', short: '颜色与字体', shortEn: 'Colour and type' },
  '40-motion': { group: 'visual', short: '动效', shortEn: 'Motion' },
  '50-icons': { group: 'visual', short: '图标', shortEn: 'Icons' },
  '60-accessibility': { group: 'quality', short: '可访问性', shortEn: 'Accessibility' },
  '70-checklist': { group: 'quality', short: '提交前自检', shortEn: 'Checklist' },
  '80-conflicts': { group: 'quality', short: '冲突裁决', shortEn: 'Conflicts' },
}

/**
 * Load and render every spec document.
 * @returns spec records in filename order.
 */
function loadSpecs() {
  const dir = join(ROOT, 'spec')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => {
      const md = readFileSync(join(dir, f), 'utf8')
      const id = basename(f, '.md')
      const meta = SPEC_META[id] ?? { group: 'basics', short: id, shortEn: id }
      return {
        id,
        file: `spec/${f}`,
        title: titleOf(md, id),
        short: meta.short,
        shortEn: meta.shortEn,
        group: meta.group,
        html: mdToHtml(md),
        chars: md.length,
      }
    })
}

/**
 * Load the interface dictionaries.
 * @returns { zh, en } — each an object of nested translation tables.
 */
function loadI18n() {
  return {
    zh: readJson('language/zh.json', {}),
    en: readJson('language/en.json', {}),
  }
}

/* ── assemble ──────────────────────────────────────────────────────── */

const icons = readJson('data/icons.json', { icons: [], counts: {} })

/**
 * Inline each emitted SVG. The gallery must work from `file://`, where a page
 * cannot fetch a sibling file, and an `<img>` to a local path would also lose
 * `currentColor`.
 */
const iconItems = (icons.icons ?? []).map(icon => ({ ...icon, svg: readText(icon.file) }))
const slots = readJson('data/slots.json', { seats: [], counts: {} })
const tokens = readJson('data/tokens.json', { palette: {}, light: {}, dark: {}, resolved: { light: {}, dark: {} } })
const components = loadComponents()
const specs = loadSpecs()
const i18n = loadI18n()

const data = {
  generatedAt: new Date().toISOString(),
  stats: {
    icons: icons.icons?.length ?? 0,
    seats: slots.seats?.length ?? 0,
    components: components.items.length,
    specs: specs.length,
    palette: Object.keys(tokens.palette ?? {}).length,
    aliases: Object.keys(tokens.light ?? {}).length,
    darkAliases: Object.keys(tokens.dark ?? {}).length,
  },
  source: {
    icons: icons.source ?? null,
    tokens: tokens.source ?? null,
    slots: slots.source ?? null,
  },
  i18n,
  icons: iconItems,
  brand: {
    fish: readText('icons/brand/fish.svg'),
    wordmark: readText('icons/brand/wordmark.svg'),
    viewBoxes: icons.brand ?? {},
  },
  seats: slots.seats ?? [],
  tokens: {
    palette: tokens.palette ?? {},
    light: tokens.light ?? {},
    dark: tokens.dark ?? {},
    resolvedLight: tokens.resolved?.light ?? {},
    resolvedDark: tokens.resolved?.dark ?? {},
  },
  components: components.items,
  specs,
}

const banner = `/**
 * Generated by website/gen-site.mjs — do not hand-edit.
 * Rebuild: node website/gen-site.mjs
 * Generated at: ${data.generatedAt}
 */

`
const body = `window.DSHDR = ${JSON.stringify(data)};\n`
const next = banner + body

if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : ''
  const strip = s => s.replace(/Generated at: [^\n]+/u, 'Generated at: X')
  if (strip(current) !== strip(next)) {
    console.error('website/js/data.js is stale — run: node website/gen-site.mjs')
    process.exit(1)
  }
  console.log('website/js/data.js is up to date')
  process.exit(0)
}

writeFileSync(OUT, next, 'utf8')

const kb = (statSync(OUT).size / 1024).toFixed(0)
console.log(`data.js: ${kb} KB`)
console.log(`  icons=${data.stats.icons} seats=${data.stats.seats} components=${data.stats.components} specs=${data.stats.specs}`)
console.log(`  tokens: palette=${data.stats.palette} light=${data.stats.aliases} dark=${data.stats.darkAliases}`)
if (components.manifestMissing) console.log('  note: components/index.json not present yet — gallery shows icons/seats/tokens only')
