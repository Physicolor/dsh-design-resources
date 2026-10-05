/**
 * Shared mechanics for the repository's bilingual corpus.
 *
 * The contract this implements is `docs/I18N.md`: Chinese documents stay where
 * they are, their English counterparts live at a fixed sibling path, and every
 * English document pins the exact Chinese revision it was translated from with
 * a `source-sha256` frontmatter field. Rendering strips the frontmatter;
 * `scripts/check-i18n.mjs` is what makes a stale translation a build failure.
 *
 * Keep this dependency-free: both `scripts/check-i18n.mjs` (node) and
 * `website/gen-site.mjs` (node) import it, and neither runs in a bundler.
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repository root, derived from this file's location (`scripts/lib/`). */
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/**
 * The heading a guide uses to introduce its task list. Both languages are
 * pinned here because `website/js/app.js` has to recognise the same heading in
 * the rendered page and lift it out of the body.
 */
export const TASK_HEADINGS = {
  zh: '读完这一页要能做什么',
  en: 'What this page gets you',
}

/** Section headings a component README uses for its two judgement lists. */
export const README_HEADINGS = {
  whenToUse: { zh: '什么时候用它', en: 'When to use it' },
  whenNotToUse: { zh: '什么时候不要用它', en: 'When not to use it' },
}

/** Both languages the site renders, Chinese first (it is the authored one). */
export const LANGS = ['zh', 'en']

/* ── paths ─────────────────────────────────────────────────────────── */

/**
 * Where the English counterpart of a Chinese document lives.
 *
 * `spec/x.md` → `spec/en/x.md`; `guides/x.md` → `guides/en/x.md`;
 * a document that already ends in `.md` inside a component keeps the stem and
 * gains `.en`: `components/…/README.md` → `components/…/README.en.md`.
 * @param zhRel - repository-relative path of the Chinese document.
 * @returns repository-relative path of its English counterpart.
 */
export function enPathOf(zhRel) {
  const rel = zhRel.replace(/\\/gu, '/')
  if (rel.startsWith('spec/')) return rel.replace(/^spec\//u, 'spec/en/')
  if (rel.startsWith('guides/')) return rel.replace(/^guides\//u, 'guides/en/')
  return rel.replace(/\.md$/u, '.en.md')
}

/**
 * The inverse of {@link enPathOf}.
 * @param enRel - repository-relative path of an English document.
 * @returns repository-relative path of the Chinese source.
 */
export function zhPathOf(enRel) {
  const rel = enRel.replace(/\\/gu, '/')
  if (rel.startsWith('spec/en/')) return rel.replace(/^spec\/en\//u, 'spec/')
  if (rel.startsWith('guides/en/')) return rel.replace(/^guides\/en\//u, 'guides/')
  return rel.replace(/\.en\.md$/u, '.md')
}

/* ── text ──────────────────────────────────────────────────────────── */

/**
 * Split a document into its frontmatter and its body.
 *
 * A document without frontmatter is returned whole, with empty metadata: the
 * Chinese side has none by design, and a missing block must not be an error.
 * @param text - raw file contents.
 * @returns `{ meta, body }`; `body` is what every renderer consumes.
 */
export function parseFrontmatter(text) {
  const norm = String(text).replace(/\r\n/gu, '\n')
  if (!norm.startsWith('---\n')) return { meta: {}, body: norm }
  const end = norm.indexOf('\n---', 4)
  if (end === -1) return { meta: {}, body: norm }
  const meta = {}
  for (const line of norm.slice(4, end).split('\n')) {
    const at = line.indexOf(':')
    if (at === -1) continue
    meta[line.slice(0, at).trim()] = line.slice(at + 1).trim()
  }
  let body = norm.slice(end + 4)
  if (body.startsWith('\n')) body = body.slice(1)
  return { meta, body }
}

/**
 * The first 16 hex digits of a string's sha256.
 *
 * Sixteen digits is ample for "did this document change": the corpus holds
 * dozens of files, and the value is read by humans in diffs.
 * @param text - text to hash.
 * @returns hex digest prefix.
 */
export function sha16(text) {
  return createHash('sha256').update(String(text), 'utf8').digest('hex').slice(0, 16)
}

/**
 * Read a text file relative to the repository root, or `''` when absent.
 * @param rel - repository-relative path.
 * @returns file contents.
 */
export function readText(rel) {
  const p = join(ROOT, rel)
  return existsSync(p) ? readFileSync(p, 'utf8') : ''
}

/* ── corpus inventory ──────────────────────────────────────────────── */

/**
 * Every Chinese document that must have an English counterpart.
 * @returns repository-relative paths, sorted.
 */
export function sourceDocuments() {
  const out = []
  for (const dir of ['spec', 'guides']) {
    const abs = join(ROOT, dir)
    if (!existsSync(abs)) continue
    for (const f of readdirSync(abs)) {
      if (f.endsWith('.md')) out.push(`${dir}/${f}`)
    }
  }
  const componentsDir = join(ROOT, 'components')
  if (existsSync(componentsDir)) {
    const walk = dir => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) { walk(full); continue }
        if (entry.name !== 'README.md' && entry.name !== 'SPEC.md') continue
        out.push(relative(ROOT, full).replace(/\\/gu, '/'))
      }
    }
    walk(componentsDir)
  }
  return out.sort()
}

/**
 * Load one language pair.
 * @param zhRel - repository-relative path of the Chinese document.
 * @returns `{ zh, en }`; each is `{ meta, body, rel }` or `null` when absent.
 */
export function readPair(zhRel) {
  const enRel = enPathOf(zhRel)
  const zhRaw = readText(zhRel)
  const enRaw = readText(enRel)
  const zh = zhRaw === '' ? null : { ...parseFrontmatter(zhRaw), rel: zhRel }
  const en = enRaw === '' ? null : { ...parseFrontmatter(enRaw), rel: enRel }
  return { zh, en, zhRel, enRel }
}

/**
 * Everything wrong with one English document's frontmatter.
 *
 * Returns an empty array when the document is fine. The checks are the ones a
 * reader of `docs/I18N.md` would ask for: does it name a real source, and is
 * that source still the revision it was translated from?
 * @param zhRel - repository-relative path of the Chinese source.
 * @returns list of human-readable problems.
 */
export function freshnessIssues(zhRel) {
  const { zh, en, enRel } = readPair(zhRel)
  if (en === null) return [`missing translation: ${enRel}`]
  if (zh === null) return [`translation without a source: ${enRel}`]
  const issues = []
  if (en.meta.source !== zhRel) {
    issues.push(`${enRel}: frontmatter source is ${en.meta.source ?? '(absent)'}, expected ${zhRel}`)
  }
  const want = sha16(zh.body)
  if (en.meta['source-sha256'] !== want) {
    issues.push(
      `${enRel}: source-sha256 is ${en.meta['source-sha256'] ?? '(absent)'} but ${zhRel} hashes to ${want}`
      + ' — re-read the source and run: node scripts/check-i18n.mjs --update',
    )
  }
  if (en.meta['translated-at'] === undefined) issues.push(`${enRel}: frontmatter has no translated-at`)
  return issues
}

/* ── parallel JSON prose ───────────────────────────────────────────── */

/**
 * Fields that must carry an `En` twin, per file.
 *
 * Only fields the site actually renders are listed. A maintainer note in a data
 * file (`$comment`, `note`, `revision`, `anchors[].note`) never reaches a page,
 * so it is not part of the English build and forcing a translation would just
 * add a second thing to keep in sync — see `docs/I18N.md` §1.
 */
const JSON_PROSE = {
  'components/index.json': {
    entries: 'components',
    /* `；`-separated items: the count has to survive, because the site renders
     * each one as its own list entry. */
    fields: ['geometrySource'],
    lists: { geometrySource: true },
    arrayFields: ['tags'],
  },
  'data/demo-evidence.json': {
    entries: ['demos', 'components'],
    /* Plain sentences. A semicolon in one of them is punctuation, not a
     * separator, so only presence is checked. */
    fields: ['scene', 'reason'],
    lists: {},
    arrayFields: [],
  },
}

/**
 * Problems with the `*En` twins of the manifest-style JSON files.
 *
 * Items joined by a full-width or ASCII semicolon must keep their count across
 * languages: the site renders them as a list, and a translation that merges two
 * items silently drops one.
 * @returns list of human-readable problems.
 */
export function jsonProseIssues() {
  const issues = []
  const separator = /[;；]/u
  const itemCount = value => (Array.isArray(value) ? value.length : String(value).split(separator).length)

  for (const [rel, spec] of Object.entries(JSON_PROSE)) {
    const text = readText(rel)
    if (text === '') { issues.push(`${rel}: missing`); continue }
    let json
    try { json = JSON.parse(text) } catch (error) { issues.push(`${rel}: ${error.message}`); continue }
    const groups = []
    if (spec.entries === null) groups.push({ label: rel, value: json })
    else if (Array.isArray(spec.entries)) {
      for (const key of spec.entries) {
        for (const [id, entry] of Object.entries(json[key] ?? {})) groups.push({ label: `${key}.${id}`, value: entry })
      }
    } else {
      for (const entry of json[spec.entries] ?? []) groups.push({ label: `${spec.entries}.${entry.id}`, value: entry })
    }
    for (const { label, value } of groups) {
      for (const field of [...spec.fields, ...(spec.arrayFields ?? [])]) {
        const zh = value[field]
        if (zh === undefined) continue
        const en = value[`${field}En`]
        if (en === undefined) { issues.push(`${rel} ${label}: ${field} has no ${field}En`); continue }
        if (Array.isArray(zh)) {
          if (!Array.isArray(en)) { issues.push(`${rel} ${label}: ${field} is a list, ${field}En is not`); continue }
          if (zh.length !== en.length) issues.push(`${rel} ${label}: ${field} has ${zh.length} items, ${field}En has ${en.length}`)
          continue
        }
        if (typeof en !== 'string' || en.trim() === '') { issues.push(`${rel} ${label}: ${field}En is empty`); continue }
        /* Only list-shaped prose has to keep its item count: the site renders
         * each item separately, so a translation that merges two silently drops
         * one. In a sentence, a semicolon is just punctuation. */
        if (spec.lists?.[field] === true && itemCount(zh) !== itemCount(en)) {
          issues.push(`${rel} ${label}: ${field} has ${itemCount(zh)} items, ${field}En has ${itemCount(en)}`)
        }
      }
    }
  }
  return issues
}
