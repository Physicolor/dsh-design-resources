/**
 * gen-site.mjs — build the website's data file from the repository's own data.
 *
 * Everything the gallery shows is inlined into `website/js/data.js` on purpose:
 * the site has to work when opened straight from disk (`file://`), where a page
 * cannot fetch its neighbours. That is why spec documents are converted to HTML
 * here rather than in the browser.
 *
 * Inputs : data/*.json, spec/*.md + spec/en/*.md, components/** (index.json +
 *          per-component files plus their `.en.md` siblings), guides/**
 * Output : website/js/data.js
 *
 * Every document is emitted per language (`{ zh, en }`) and a document with no
 * English counterpart is absent from the English build: `docs/I18N.md` forbids
 * serving a Chinese page to a reader who asked for English. Coverage is counted
 * here and shown on the English home page rather than asserted anywhere.
 *
 * Usage: node website/gen-site.mjs [--check]   (--check fails when the output is stale)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { README_HEADINGS, TASK_HEADINGS, parseFrontmatter } from '../scripts/lib/i18n.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'website', 'js', 'data.js')

/** Both languages, in the order the site lists them. */
const LANGS = ['zh', 'en']

/**
 * Read a JSON file, or a fallback when it is absent.
 * @param rel - repository-relative path.
 * @param fallback - value to use when missing.
 * @returns parsed value.
 */
function readJson(rel, fallback) {
  const p = join(ROOT, rel)
  if (!existsSync(p)) return fallback
  try { return JSON.parse(readFileSync(p, 'utf8')) } catch (error) {
    throw new Error(`Invalid JSON in ${rel}: ${error.message}`)
  }
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

/**
 * Read a document and strip its translation frontmatter.
 *
 * The Chinese side has no frontmatter by design; the English side must have
 * one, and it must not reach the page (it would render as a stray paragraph
 * because the markdown converter escapes raw HTML). An empty file reads as
 * `null`, which every caller treats as "this language does not have it".
 * @param rel - repository-relative path.
 * @returns document body, or `null` when absent.
 */
function readDoc(rel) {
  const raw = readText(rel)
  return raw === '' ? null : parseFrontmatter(raw).body
}

/**
 * One entry of the page furniture, in both languages.
 *
 * These strings are emitted by this file rather than read from
 * `language/*.json` because they are part of a document's markup: they are
 * built once, at generation time, and the browser has no key to look up.
 */
const FURNITURE = {
  evidence: { zh: '核对记录', en: 'Evidence checked' },
  proposal: { zh: '本仓库提案', en: 'Proposal in this repository' },
  noteVerified: {
    zh: '产品截图只用于本地核验；此处仅展示 HTML 结构示意。',
    en: 'The product screenshot is a local check only; what is shown here is the HTML structure.',
  },
  noteSourceVerified: {
    zh: '此示意依据产品源码与本地审阅参照核对；截图不随网页发布。',
    en: 'This specimen was reconciled against the product source and a local review reference; the screenshot is not published.',
  },
  withheldTitle: { zh: '暂不显示 HTML 演示', en: 'No HTML specimen yet' },
  withheldReason: { zh: '尚缺可核对依据。', en: 'There is no checkable basis for it yet.' },
  kindProposal: { zh: '社区提案（非产品界面）', en: 'Community proposal (not a product surface)' },
  kindAudit: { zh: '规则工具（非产品界面）', en: 'Rule tool (not a product surface)' },
  kindPlugin: { zh: '插件扩展示意', en: 'Plugin extension specimen' },
  kindScene: { zh: '交互示意', en: 'Interaction specimen' },
  componentSpecimen: { zh: '组件示意', en: 'Component specimen' },
  captureNote: { zh: '含产品实景文案（原样保留）', en: 'includes product copy, kept as captured' },
  citation: { zh: '引用', en: 'Source' },
}

/**
 * Sample a demo's visible copy and report whether any of it is product copy.
 *
 * A specimen that re-creates a real surface quotes the product's own strings —
 * `打开配置文件` on a settings button, say. Those must not be translated (the
 * geometry was checked against a screenshot of exactly that string), so the
 * figure says so instead of leaving the reader to wonder. Reading the demo here
 * costs one file read and keeps the note out of the specimen's DOM, where an
 * injected element would change the box geometry the page is asserting.
 * @param html - the demo document.
 * @returns true when it contains `data-capture` markup.
 */
function demoHasCapturedCopy(html) {
  return /data-capture=/u.test(html)
}

/** Component id → its demo document, filled in by {@link loadComponents}. */
const COMPONENT_DEMO = new Map()

/**
 * Look a furniture string up for one language.
 * @param key - key of {@link FURNITURE}.
 * @param lang - `zh` or `en`.
 * @returns the string; a missing key throws rather than shipping a blank label.
 */
function furniture(key, lang) {
  const entry = FURNITURE[key]
  if (entry === undefined) throw new Error(`unknown furniture key: ${key}`)
  return entry[lang]
}

/**
 * Pick one language out of a `{ zh, en }` pair, or `null` when that language
 * has no version of the thing.
 * @param value - `{ zh, en }` pair, a plain value, or `null`.
 * @param lang - `zh` or `en`.
 * @returns the value for that language, or `null`.
 */
function pick(value, lang) {
  if (value === null || value === undefined) return null
  if (typeof value === 'object' && !Array.isArray(value) && ('zh' in value || 'en' in value)) return value[lang] ?? null
  return value
}

const DEMO_EVIDENCE = readJson('data/demo-evidence.json', { demos: {}, components: {} })

/**
 * The product's own interface strings, and their English glosses.
 *
 * A guide quoting `通用设置` is quoting the running UI: the Chinese has to stay
 * verbatim or the instruction stops matching what the reader sees. What an
 * English reader needs on top of that is the meaning, and this map is the one
 * place it lives — see the file's own `$comment` for what belongs here.
 */
const PRODUCT_LABELS = readJson('data/product-labels.json', { labels: {} }).labels ?? {}

/* ── markdown ──────────────────────────────────────────────────────── */

/**
 * Escape the characters that would break out of HTML text.
 * @param s - raw text.
 * @returns escaped text.
 */
function esc(s) {
  return s.replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;').replace(/"/gu, '&quot;')
}

/** Validate evidence and proposal metadata without publishing screenshots. */
function validateEvidence(evidence, owner) {
  if (evidence === undefined || !['verified', 'source-verified', 'proposed', 'withheld'].includes(evidence.status)) {
    throw new Error(`${owner} has no evidence status`)
  }
  if (evidence.status === 'verified' && (typeof evidence.source !== 'string' || evidence.source === '')) {
    throw new Error(`${owner} must name its local screenshot source`)
  }
  if (evidence.source !== undefined && !existsSync(join(ROOT, evidence.source))) {
    throw new Error(`${owner} source evidence is missing: ${evidence.source}`)
  }
  if (evidence.reviewAsset !== undefined && !existsSync(join(ROOT, evidence.reviewAsset))) {
    throw new Error(`${owner} review crop is missing: ${evidence.reviewAsset}`)
  }
  if (evidence.status === 'source-verified' && (!evidence.reference || !evidence.sourceCode)) {
    throw new Error(`${owner} must name its user reference and official source`)
  }
  if (evidence.status === 'proposed' && (
    evidence.kind !== 'proposal'
    || typeof evidence.reason !== 'string'
    || evidence.reason === ''
    || evidence.source !== undefined
    || evidence.reviewAsset !== undefined
  )) {
    throw new Error(`${owner} proposal must be explicit and must not claim screenshot evidence`)
  }
}

/** A plain provenance note, in the reader's language; screenshots never enter the markup. */
function evidencePanel(evidence, owner, lang) {
  const label = pick({ zh: evidence.scene, en: evidence.sceneEn ?? evidence.scene }, lang) ?? owner
  const title = evidence.status === 'proposed' ? furniture('proposal', lang) : furniture('evidence', lang)
  const note = evidence.status === 'proposed'
    ? pick({ zh: evidence.reason, en: evidence.reasonEn ?? evidence.reason }, lang)
    : furniture(evidence.status === 'source-verified' ? 'noteSourceVerified' : 'noteVerified', lang)
  return '<aside class="demo__proof"><strong>' + title + '</strong><p>'
    + esc(label) + '</p><p>' + esc(note) + '</p></aside>'
}
/** Render a document demo with verified, source-verified, or proposed provenance. */
function demoFigure(id, caption, lang) {
  const evidence = DEMO_EVIDENCE.demos?.[id]
  validateEvidence(evidence, `demo ${id}`)
  const reason = evidence.reason === undefined
    ? furniture('withheldReason', lang)
    : pick({ zh: evidence.reason, en: evidence.reasonEn ?? evidence.reason }, lang)
  if (evidence.status === 'withheld') {
    return `<figure class="demo demo--withheld"><div class="demo__withheld"><strong>${furniture('withheldTitle', lang)}</strong><p>${esc(reason)}</p></div>`
      + (caption === '' ? '' : `<figcaption>${inline(caption, lang)}</figcaption>`)
      + '</figure>'
  }
  const label = furniture(
    evidence.kind === 'proposal' ? 'kindProposal'
      : evidence.kind === 'audit' ? 'kindAudit'
        : evidence.kind === 'plugin' ? 'kindPlugin' : 'kindScene',
    lang,
  )
  const wideDemos = new Set(['sidebar-anatomy', 'settings-section', 'settings-independent-window'])
  const figureClass = wideDemos.has(id) ? 'demo demo--wide' : 'demo'
  const capture = demoHasCapturedCopy(readText(`website/demos/${id}.html`))
    ? `<span class="demo__capture">${furniture('captureNote', lang)}</span>` : ''
  return '<figure class="' + figureClass + '"><div class="demo__comparison">'
    + evidencePanel(evidence, id, lang)
    + `<section class="demo__example"><h3 class="demo__panel-title">${label}${capture}</h3>`
    + `<div class="demo__stage" data-inline-demo="${esc(id)}"></div></section></div>`
    + (caption === '' ? '' : `<figcaption>${inline(caption, lang)}</figcaption>`)
    + '</figure>'
}

/** Render a component comparison, or show why its HTML specimen is withheld. */
function componentFigure(id, caption, lang) {
  const evidence = DEMO_EVIDENCE.components?.[id]
  validateEvidence(evidence, `component ${id}`)
  const image = evidencePanel(evidence, id, lang)
  const figureClass = id === 'settings-page' ? 'demo demo--wide' : 'demo'
  if (evidence.status === 'withheld') {
    const reason = evidence.reason === undefined
      ? furniture('withheldReason', lang)
      : pick({ zh: evidence.reason, en: evidence.reasonEn ?? evidence.reason }, lang)
    return `<figure class="demo demo--withheld">${image}`
      + `<div class="demo__withheld"><strong>${furniture('withheldTitle', lang)}</strong><p>${esc(reason)}</p></div>`
      + (caption === '' ? '' : `<figcaption>${inline(caption, lang)}</figcaption>`)
      + '</figure>'
  }
  const capture = demoHasCapturedCopy(COMPONENT_DEMO.get(id) ?? '')
    ? `<span class="demo__capture">${furniture('captureNote', lang)}</span>` : ''
  return '<figure class="' + figureClass + '"><div class="demo__comparison">'
    + image
    + `<section class="demo__example"><h3 class="demo__panel-title">${furniture('componentSpecimen', lang)}${capture}</h3>`
    + `<div class="demo__stage" data-inline-demo="component/${esc(id)}"></div></section></div>`
    + (caption === '' ? '' : `<figcaption>${inline(caption, lang)}</figcaption>`)
    + '</figure>'
}

/**
 * Inline markdown: code spans, bold, links, citation markers.
 *
 * `[^1]` is a citation marker: it renders as a superscript and points at the
 * numbered source list at the end of the document, so prose can name the
 * authority instead of paraphrasing it ("[HIG] 讲的是同一件事…" cannot be
 * checked; "[1]" can).
 * @param s - raw inline text.
 * @param lang - `zh` or `en`; the citation marker's tooltip is furniture, and
 *   English prose glosses quoted product labels.
 * @returns HTML.
 */
function inline(s, lang) {
  let out = esc(s)
  out = out.replace(/`([^`]+)`/gu, (_m, c) => {
    /* A quoted product label stays Chinese — it has to match the running UI —
       so the English page appends what it means. The map is the single place
       that translation lives; see data/product-labels.json. */
    const gloss = lang === 'en' ? PRODUCT_LABELS[c] : undefined
    const quoted = lang === 'en' && PRODUCT_LABELS[c] !== undefined
      ? `<code lang="zh-CN">${c}</code>`
      : `<code>${c}</code>`
    if (gloss === undefined) return quoted
    return quoted + `<span class="site-gloss">${esc(gloss)}</span>`
  })
  out = out.replace(/\*\*([^*]+)\*\*/gu, '<strong>$1</strong>')
  out = out.replace(/\[\^(\d+)\]/gu, (_m, num) =>
    `<sup class="cite" data-jump="cite-${num}" title="${furniture('citation', lang)} ${num}">[${num}]</sup>`)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/gu, (_m, text, href) => `<a href="${href}">${text}</a>`)
  return out
}

/** Monotonic heading counter, so every heading gets a stable in-document anchor. */
let headingSeq = 0

/**
 * Convert the repository's markdown to HTML.
 *
 * Deliberately small: headings, tables, lists, fences, quotes, rules, inline
 * spans. It covers what `spec/` and the component READMEs actually use, and it
 * fails visibly (renders as text) rather than silently mangling structure.
 * Headings carry an `id` because the site builds "on this page" navigation from
 * them — a document outline you cannot click is decoration.
 * @param md - markdown source.
 * @param lang - `zh` or `en`; decides the specimen furniture's language.
 * @returns HTML.
 */
function mdToHtml(md, lang) {
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

   /* A live demo is only emitted after its actual DSH scene has been captured
     * and its local evidence record has been checked. Screenshots remain in
     * docs/reference; the generated page never includes those images. */
    const demoRef = /^<!--\s*demo:\s*([\w-]+)\s*(?:\|\s*(.*?))?\s*-->$/u.exec(line.trim())
    if (demoRef !== null) {
      html.push(demoFigure(demoRef[1], demoRef[2] ?? '', lang))
      i++
      continue
    }

    /* `<!-- component: id | caption -->` reuses a component's own demo.html as a
     * live specimen inside a guide. Guides are supposed to show the pattern
     * working, not describe it — and the component demos already exist, so the
     * guide points at one instead of shipping a second copy that drifts. */
    const componentRef = /^<!--\s*component:\s*([\w-]+)\s*(?:\|\s*(.*?))?\s*-->$/u.exec(line.trim())
    if (componentRef !== null) {
      html.push(componentFigure(componentRef[1], componentRef[2] ?? '', lang))
      i++
      continue
    }

    const heading = /^(#{1,4})\s+(.*)$/u.exec(line)
    if (heading !== null) {
      const level = heading[1].length
      headingSeq += 1
      html.push(`<h${level} id="h${headingSeq}">${inline(heading[2], lang)}</h${level}>`)
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
      html.push('<table><thead><tr>' + head.map(c => `<th>${inline(c, lang)}</th>`).join('') + '</tr></thead><tbody>'
        + rows.map(r => '<tr>' + r.map(c => `<td>${inline(c, lang)}</td>`).join('') + '</tr>').join('')
        + '</tbody></table>')
      continue
    }

    if (/^\s*>\s?/u.test(line)) {
      const body = []
      while (i < lines.length && /^\s*>\s?/u.test(lines[i])) { body.push(lines[i].replace(/^\s*>\s?/u, '')); i++ }
      html.push(`<blockquote>${mdToHtml(body.join('\n'), lang)}</blockquote>`)
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
      /* An item that opens with `[1]` is a cited source: it carries the anchor
       * the superscript marker in the prose jumps to. */
      html.push(`<${tag}>` + items.map(t => {
        const cite = /^\[(\d+)\]/u.exec(t)
        const id = cite === null ? '' : ` id="cite-${cite[1]}"`
        return `<li${id}>${inline(t, lang)}</li>`
      }).join('') + `</${tag}>`)
      continue
    }

    if (line.trim() === '') { i++; continue }

    const para = []
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4}\s|```|\s*>|\s*([-*+]|\d+\.)\s)/u.test(lines[i])) {
      para.push(lines[i])
      i++
    }
    if (para.length > 0) html.push(`<p>${inline(para.join(' '), lang)}</p>`)
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
 * The first prose paragraph of a markdown document.
 * @param md - markdown source.
 * @returns the paragraph, with newlines folded.
 */
function firstParagraph(md) {
  for (const block of md.split(/\r?\n\r?\n/u)) {
    const text = block.trim()
    if (text === '') continue
    if (/^(#{1,6}\s|[-*+]\s|\d+\.\s|\||>|```)/u.test(text)) continue
    return text.replace(/\s+/gu, ' ').trim()
  }
  return ''
}

/**
 * The bullet items under a `## heading`.
 * @param md - markdown source.
 * @param heading - exact heading text, without the hashes.
 * @returns list items.
 */
function listUnder(md, heading) {
  const out = []
  let inside = false
  for (const line of md.split(/\r?\n/u)) {
    const found = /^##\s+(.+?)\s*$/u.exec(line)
    if (found !== null) { inside = found[1] === heading; continue }
    if (!inside) continue
    const item = /^\s*[-*]\s+(.+)$/u.exec(line)
    if (item !== null) out.push(item[1].trim())
  }
  return out
}

/**
 * Load the reusable-source knowledge base.
 * @returns component records with source, styles, demo and docs inlined.
 */
function loadComponents() {
  const manifest = readJson('components/index.json', null)
  if (manifest === null || !Array.isArray(manifest.components)) return { manifestMissing: true, items: [] }

  /* Which components mirror something the product actually ships, and which are
   * this repository's own proposals. Showing both as if they were the same
   * thing is how a design resource starts inventing UI. */
  const origins = readJson('components/origins.json', { official: [], proposed: [] })
  const official = new Set(origins.official ?? [])

  const items = manifest.components.map(entry => {
    const dir = entry.path ?? ''
    const base = dir === '' ? '' : `${dir.replace(/\/$/u, '')}/`
    const sourceDemo = readText(`${base}demo.html`)
    const evidence = DEMO_EVIDENCE.components?.[entry.id]
    validateEvidence(evidence, `component ${entry.id}`)
    const evidenceVerified = evidence.status === 'verified' || evidence.status === 'source-verified'
    if (evidenceVerified && sourceDemo === '') {
      throw new Error(`component ${entry.id} has verified evidence but no demo.html`)
    }
    const demoWithheld = sourceDemo !== '' && !evidenceVerified
    const demo = evidenceVerified ? sourceDemo : ''
    COMPONENT_DEMO.set(entry.id, sourceDemo)

    /* The documents are the source of truth for the documents: the manifest's
     * prose fields were written back when the READMEs still spoke in
     * engineering voice, so they are read out of the prose rather than
     * maintained in two places that drift. `docs/I18N.md` extends the same rule
     * to the English side: `README.en.md` supplies the English card, and a
     * component without one is simply absent from the English site. */
    const docs = {}
    const prose = {}
    for (const lang of LANGS) {
      const readmeRel = `${base}${lang === 'en' ? 'README.en.md' : 'README.md'}`
      const specRel = `${base}${lang === 'en' ? 'SPEC.en.md' : 'SPEC.md'}`
      const readme = readDoc(readmeRel)
      const spec = readDoc(specRel)
      docs[lang] = { readme, spec, readmeRel, specRel }
      if (readme === null) { prose[lang] = null; continue }
      const whenToUse = listUnder(readme, README_HEADINGS.whenToUse[lang])
      const whenNotToUse = listUnder(readme, README_HEADINGS.whenNotToUse[lang])
      if (whenToUse.length === 0 || whenNotToUse.length === 0) {
        throw new Error(
          `${readmeRel}: expected "## ${README_HEADINGS.whenToUse[lang]}" and`
          + ` "## ${README_HEADINGS.whenNotToUse[lang]}" lists; found ${whenToUse.length}/${whenNotToUse.length}`,
        )
      }
      prose[lang] = { summary: firstParagraph(readme), whenToUse, whenNotToUse }
    }

    const langDoc = {}
    for (const lang of LANGS) {
      langDoc[lang] = docs[lang].readme === null ? null : {
        summary: prose[lang].summary,
        whenToUse: prose[lang].whenToUse,
        whenNotToUse: prose[lang].whenNotToUse,
        readme: docs[lang].readme,
        readmeHtml: mdToHtml(docs[lang].readme, lang),
        specHtml: docs[lang].spec === null ? '' : mdToHtml(docs[lang].spec, lang),
        hasSpec: docs[lang].spec !== null,
      }
    }
    const zhDoc = langDoc.zh
    if (zhDoc === null) throw new Error(`component ${entry.id} has no README.md`)

    return {
      ...entry,
      origin: official.has(entry.id) ? 'official' : 'proposed',
      translated: langDoc.en !== null,
      doc: langDoc,
      geometrySource: { zh: entry.geometrySource, en: entry.geometrySourceEn ?? entry.geometrySource },
      tags: { zh: entry.tags, en: entry.tagsEn ?? entry.tags },
      /* Kept flat for the English fallback path in `app.js`: the Chinese side is
       * always present, so a reader who somehow reaches a page without an
       * English document still sees the authored text rather than a blank. */
      summary: zhDoc.summary,
      whenToUse: zhDoc.whenToUse,
      whenNotToUse: zhDoc.whenNotToUse,
      hasSpec: zhDoc.hasSpec,
      demo,
      demoWithheld,
      evidence: {
        status: evidence.status,
        reason: evidence.reason,
        reasonEn: evidence.reasonEn ?? evidence.reason,
      },
      tsx: readText(`${base}index.tsx`),
      css: readText(`${base}${(entry.id ?? 'component').toLowerCase()}.module.css`),
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
      const id = basename(f, '.md')
      const meta = SPEC_META[id] ?? { group: 'basics', short: id, shortEn: id }
      const doc = {}
      for (const lang of LANGS) {
        const body = readDoc(lang === 'en' ? `spec/en/${f}` : `spec/${f}`)
        doc[lang] = body === null ? null : {
          title: titleOf(body, id).replace(/^\d+\s*/u, ''),
          /* 卡片上要有内容摘要而不是字数：读者挑的是「这一页解决什么问题」。 */
          summary: firstParagraph(body),
          /* The `60` in `60 可访问性` is a filing number, not part of the title the
           * reader is looking for — it belongs in the filename. */
          html: mdToHtml(body, lang).replace(/<h1([^>]*)>\s*\d+\s*/u, '<h1$1>'),
          chars: body.length,
        }
      }
      if (doc.zh === null) throw new Error(`spec/${f} is empty`)
      return {
        id,
        file: `spec/${f}`,
        fileEn: `spec/en/${f}`,
        translated: doc.en !== null,
        doc,
        short: meta.short,
        shortEn: meta.shortEn,
        group: meta.group,
      }
    })
}

/**
 * Load every embedded demo document.
 * @returns demo name → html.
 */
function loadDemos() {
  const dir = join(ROOT, 'website', 'demos')
  if (!existsSync(dir)) return {}
  const out = {}
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.html')) continue
    const id = basename(f, '.html')
   const evidence = DEMO_EVIDENCE.demos?.[id]
   validateEvidence(evidence, `demo ${id}`)
    if (evidence.status === 'withheld') continue
   out[id] = readFileSync(join(dir, f), 'utf8')
  }
 for (const id of Object.keys(DEMO_EVIDENCE.demos ?? {})) {
    if (DEMO_EVIDENCE.demos[id]?.status === 'withheld') continue
   if (!existsSync(join(dir, `${id}.html`))) throw new Error(`evidence entry has no demo HTML: ${id}`)
  }
  return out
}

/* ── guides ────────────────────────────────────────────────────────── */

/**
 * Guide presentation metadata.
 *
 * A guide answers a question an author actually has ("my plugin needs a
 * settings page — what now?"), so the navigation names the question, not the
 * file. `group` decides which navigation branch it sits in.
 */
const GUIDE_GROUPS = {
  start: { zh: '指南概览', en: 'Guide overview' },
  principles: { zh: '先选扩展位置', en: 'Choose an extension area' },
  patterns: { zh: '按场景搭建', en: 'Build by task' },
  integration: { zh: '公开座位与登记', en: 'Public seats and registration' },
  verify: { zh: '核对与来源', en: 'Evidence and sources' },
}

/**
 * Read one guide's short metadata out of its own prose.
 *
 * The guide is the source of truth: title from the `# heading`, the one-line
 * summary from the first blockquote, the task list from the heading named in
 * `TASK_HEADINGS`. Nothing is duplicated into a manifest that then drifts.
 * @param md - markdown source.
 * @param lang - `zh` or `en`; decides which heading names the task list.
 * @returns { title, summary, tasks, tasksHeading }.
 */
function guideMeta(md, lang) {
  const title = titleOf(md, '')
  const quote = /^>\s*(.+)$/mu.exec(md)
  const summary = quote === null ? '' : quote[1].trim()
  const heading = TASK_HEADINGS[lang]
  const tasks = []
  let inside = false
  for (const line of md.split(/\r?\n/u)) {
    const head = /^##\s+(.+?)\s*$/u.exec(line)
    if (head !== null) { inside = head[1] === heading; continue }
    if (!inside) continue
    const item = /^\s*[-*]\s+(.+)$/u.exec(line)
    if (item !== null) tasks.push(item[1].trim())
  }
  return { title, summary, tasks, tasksHeading: heading }
}

/**
 * Load every guide document.
 * @returns guide records in filename order.
 */
function loadGuides() {
  const dir = join(ROOT, 'guides')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(f => {
      const id = basename(f, '.md')
      const groupKey = /^0\d/u.test(id) ? 'start'
        : /^1\d/u.test(id) ? 'principles'
          : /^2\d/u.test(id) ? 'patterns'
            : /^3\d/u.test(id) ? 'integration' : 'verify'
      const group = GUIDE_GROUPS[groupKey]
      const doc = {}
      for (const lang of LANGS) {
        const body = readDoc(lang === 'en' ? `guides/en/${f}` : `guides/${f}`)
        if (body === null) { doc[lang] = null; continue }
        const meta = guideMeta(body, lang)
        doc[lang] = {
          title: meta.title,
          summary: meta.summary,
          tasks: meta.tasks,
          tasksHeading: meta.tasksHeading,
          html: mdToHtml(body, lang).replace(/<h1([^>]*)>\s*\d+\s*/u, '<h1$1>'),
          chars: body.length,
        }
      }
      if (doc.zh === null) throw new Error(`guides/${f} is empty`)
      return {
        id,
        group: groupKey,
        groupLabel: group.zh,
        groupLabelEn: group.en,
        translated: doc.en !== null,
        doc,
      }
    })
}

/**
 * Load the interface dictionaries, plus the per-specimen copy tables.
 *
 * A demo's own strings live in `language/demos/<demo>.json` instead of the two
 * big dictionaries, for two reasons: a specimen's copy is authored next to the
 * specimen, and one file per demo means two people (or two agents) translating
 * two demos never touch the same file. Both are merged under `demo.<id>` here,
 * so `app.js` looks them up with the ordinary `t()` path.
 * @returns { zh, en } — each an object of nested translation tables.
 */
function loadI18n() {
  const zh = readJson('language/zh.json', {})
  const en = readJson('language/en.json', {})
  const dir = join(ROOT, 'language', 'demos')
  if (!existsSync(dir)) return { zh, en }
  zh.demo = zh.demo ?? {}
  en.demo = en.demo ?? {}
  for (const file of readdirSync(dir).sort()) {
    if (!file.endsWith('.json')) continue
    const id = basename(file, '.json')
    const table = readJson(`language/demos/${file}`, null)
    if (table === null) continue
    if (typeof table.zh !== 'object' || typeof table.en !== 'object') {
      throw new Error(`language/demos/${file} must be { zh: {...}, en: {...} }`)
    }
    const zhKeys = Object.keys(table.zh).sort()
    const enKeys = Object.keys(table.en).sort()
    if (zhKeys.join(',') !== enKeys.join(',')) {
      throw new Error(`language/demos/${file}: zh and en keys differ (${zhKeys.length} vs ${enKeys.length})`)
    }
    zh.demo[id] = table.zh
    en.demo[id] = table.en
  }
  return { zh, en }
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
const guides = loadGuides()
const i18n = loadI18n()

/* 指南里用 `<!-- component: id -->` 复用组件自己的 demo：把每份组件 demo 也放进 demos，
 * 键名 `component/<id>`，站点挂载时和其它 demo 走同一条路。 */
const demos = loadDemos()
for (const item of components.items) {
  if (typeof item.demo === 'string' && item.demo !== '') demos['component/' + item.id] = item.demo
}

/* Counted, never asserted here: the English home page states how much of the
 * corpus is translated, and `scripts/check-i18n.mjs` is what refuses a stale or
 * missing translation. gen-site has to keep building while a translation is in
 * flight, otherwise nobody can render the Chinese site. */
const i18nCoverage = {
  specs: { translated: specs.filter(s => s.translated).length, total: specs.length },
  guides: { translated: guides.filter(g => g.translated).length, total: guides.length },
  components: { translated: components.items.filter(c => c.translated).length, total: components.items.length },
}

const data = {
  generatedAt: new Date().toISOString(),
  stats: {
    icons: icons.icons?.length ?? 0,
    seats: slots.seats?.length ?? 0,
    components: components.items.length,
    specs: specs.length,
    guides: guides.length,
    palette: Object.keys(tokens.palette ?? {}).length,
    aliases: Object.keys(tokens.light ?? {}).length,
    darkAliases: Object.keys(tokens.dark ?? {}).length,
    scale: Object.keys(tokens.scale ?? {}).length,
  },
  source: {
    icons: icons.source ?? null,
    tokens: tokens.source ?? null,
    slots: slots.source ?? null,
  },
  i18n,
  i18nCoverage,
  demos,
  /* 指南（guides/）：面向作者任务的内容层，和规范正文分开——规范回答「规则是什么」，
   * 指南回答「我现在该做什么」。 */
  guides,
  /* The reproduction draws its chrome from the live product: these are the SVGs
   * the real sidebar and header render, harvested by scripts/capture-dsh.mjs. */
  chrome: readJson('docs/reference/chrome.json', { icons: {}, header: [] }),
  /* The shell's stylesheet travels with the data because the shell renders into
   * a shadow root, where a <link> to the page's stylesheets would not apply. */
  shellCss: readText('website/shell/shell.css'),
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
    /* Theme-independent geometry: radius scale, elevation recipes, shadow
     * levels. Without it the token page can only talk about colours. */
    scale: tokens.scale ?? {},
  },
  components: components.items,
  specs,
  /* 元素清单：scripts/scan-ui.mjs 的产物。没扫过就是空数组，站点会提示去扫。 */
  inventory: readJson('data/ui-inventory.json', { elements: [], counts: {} }),
  coverage: readJson('data/ui-coverage.json', { coverage: [], counts: {} }),
  /* 类名族 → 插件名：用来把「插件专有」的东西归到具体插件名下，搁置时也说得清是谁的。 */
  anchors: readJson('data/inventory-anchors.json', { anchors: [], pluginFamilies: [] }),
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
  /* 时间戳出现两次：横幅里的 `Generated at:` 和数据体里的 `"generatedAt"`。
   * 只擦横幅的话，这个检查永远报 stale——它自己就成了一个假的告警。 */
  const strip = s => s
    .replace(/Generated at: [^\n]+/u, 'Generated at: X')
    .replace(/"generatedAt":"[^"]*"/u, '"generatedAt":"X"')
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
