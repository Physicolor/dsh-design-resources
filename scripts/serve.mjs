/**
 * serve.mjs — a zero-dependency static server for local preview.
 *
 * The site is `file://`-safe by design (all data is inlined), so this exists
 * only to give the browser a real origin while you are editing: it sets no
 * cache headers, so a refresh always shows the current files.
 *
 * Usage: node scripts/serve.mjs [port]     (default 4173)
 */

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'website')
const PORT = Number(process.argv[2] ?? 4173)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
  let pathname = decodeURIComponent(url.pathname)
  if (pathname.endsWith('/')) pathname += 'index.html'

  const target = join(ROOT, normalize(pathname).replace(/^(\.\.[/\\])+/u, ''))
  if (!target.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return }

  try {
    const info = await stat(target)
    const file = info.isDirectory() ? join(target, 'index.html') : target
    const body = await readFile(file)
    res.writeHead(200, {
      'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    })
    res.end(body)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('not found')
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`DeepSeek Design Resources → http://127.0.0.1:${PORT}/`)
})
