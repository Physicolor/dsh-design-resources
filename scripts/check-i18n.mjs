/**
 * check-i18n.mjs — the bilingual corpus gate.
 *
 * Reports, per document, whether an English counterpart exists, and whether the
 * one that exists still matches the Chinese revision it claims to translate.
 * Exits non-zero when anything is missing or stale, so it can stand in a build
 * pipeline. `--update` is the other half: after writing an English document, it
 * pins that document to the current Chinese hash.
 *
 * Usage:
 *   node scripts/check-i18n.mjs            # status + freshness, non-zero on any gap
 *   node scripts/check-i18n.mjs --update   # re-pin every English document to its source
 *   node scripts/check-i18n.mjs --json     # machine-readable status
 */

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT, freshnessIssues, jsonProseIssues, readPair, readText, sha16, sourceDocuments,
} from './lib/i18n.mjs'

const args = process.argv.slice(2)
const update = args.includes('--update')
const asJson = args.includes('--json')

const docs = sourceDocuments()
const rows = []
const issues = []

/* 中文是"就地"的那一份，英文住 `en` 兄弟路径（docs/I18N.md §2）。这份约定一旦在某个文件上
 * 被反过来做——原文写成英文、没有中文——它就从中文站上悄悄消失，而"兄弟文件是否存在"这类
 * 检查不会有任何提示。所以这里先按字符统计，把 base 不是中文的文档直接判为失败。 */
for (const zhRel of docs) {
  const body = readText(zhRel).replace(/^---\n[\s\S]*?\n---\n/u, '')
  const cjk = (body.match(/[\u3400-\u4dbf\u4e00-\u9fff]/gu) ?? []).length
  /* 中文正文的汉字占比是两位数百分比；一份英文文档即使引用几处产品标签，也到不了 2%。
   * 绝对门槛单独留着，是为了不漏掉极短的文件。 */
  const ratio = body.length === 0 ? 0 : cjk / body.length
  if (cjk < 20 || ratio < 0.02) {
    issues.push(`base document is not in Chinese (${cjk} CJK characters, ${(ratio * 100).toFixed(1)}% of the file): ${zhRel} — the language pair is inverted`)
  }
}

for (const zhRel of docs) {
  const { zh, en, enRel } = readPair(zhRel)
  if (zh === null) { issues.push(`missing Chinese source: ${zhRel}`); continue }
  const state = en === null ? 'missing' : 'translated'
  rows.push({ zhRel, enRel, state, chars: zh.body.length })
  if (state === 'missing') { issues.push(`missing translation: ${enRel}`); continue }
  issues.push(...freshnessIssues(zhRel))
}

if (update) {
  let touched = 0
  for (const row of rows) {
    if (row.state === 'missing') continue
    const raw = readText(row.enRel).replace(/\r\n/gu, '\n')
    const source = readText(row.zhRel)
    const body = source.replace(/^---\n[\s\S]*?\n---\n/u, '')
    const wantSha = sha16(body)
    /* A translator writes the English body and nothing else; this is what turns
     * it into a document the gate accepts. That keeps the hash out of human
     * hands, where it would be copied from the wrong revision. */
    const hasFrontmatter = raw.startsWith('---\n') && raw.indexOf('\n---', 4) !== -1
    const end = hasFrontmatter ? raw.indexOf('\n---', 4) : -1
    const meta = []
    const seen = new Set()
    if (hasFrontmatter) {
      for (const line of raw.slice(4, end).split('\n')) {
        const key = line.slice(0, Math.max(0, line.indexOf(':'))).trim()
        if (key === 'source') { meta.push(`source: ${row.zhRel}`); seen.add('source'); continue }
        if (key === 'source-sha256') { meta.push(`source-sha256: ${wantSha}`); seen.add('source-sha256'); continue }
        if (key === 'translated-at') { meta.push(`translated-at: ${new Date().toISOString().slice(0, 10)}`); seen.add('translated-at'); continue }
        if (line.trim() !== '') meta.push(line)
      }
    }
    if (!seen.has('source')) meta.unshift(`source: ${row.zhRel}`)
    if (!seen.has('source-sha256')) meta.push(`source-sha256: ${wantSha}`)
    if (!seen.has('translated-at')) meta.push(`translated-at: ${new Date().toISOString().slice(0, 10)}`)
    const rest = hasFrontmatter ? raw.slice(end + 4).replace(/^\n/u, '') : raw
    writeFileSync(join(ROOT, row.enRel), `---\n${meta.join('\n')}\n---\n${rest}`, 'utf8')
    touched += 1
  }
  console.log(`pinned ${touched} English document(s) to their Chinese source`)
  issues.length = 0
  for (const row of rows) if (row.state === 'missing') issues.push(`missing translation: ${row.enRel}`)
  for (const row of rows) if (row.state !== 'missing') issues.push(...freshnessIssues(row.zhRel))
}

issues.push(...jsonProseIssues())

const translated = rows.filter(r => r.state === 'translated').length
const coverage = { translated, total: rows.length }

if (asJson) {
  console.log(JSON.stringify({ coverage, rows, issues }, null, 1))
} else {
  const width = Math.max(...rows.map(r => r.enRel.length), 20)
  for (const row of rows) {
    const mark = row.state === 'translated' ? 'ok  ' : '—   '
    console.log(`${mark}${row.enRel.padEnd(width)}  ${String(Math.round(row.chars / 1000)).padStart(4)}k zh chars`)
  }
  console.log(`\ndocuments translated: ${translated}/${rows.length}`)
  if (issues.length > 0) {
    console.log(`\n${issues.length} issue(s):`)
    for (const issue of issues.slice(0, 60)) console.log(`  - ${issue}`)
    if (issues.length > 60) console.log(`  … and ${issues.length - 60} more`)
  }
}

process.exit(issues.length === 0 ? 0 : 1)
