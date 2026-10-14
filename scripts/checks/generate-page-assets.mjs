import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const rows = readFileSync(resolve(root, 'src/test/resources/pages.csv'), 'utf8').trim().split(/\r?\n/).slice(1)
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(m => [m[1], m[3]]))
const assets = {}
for (const line of rows) {
  const [url, view] = line.split(',')
  if (!/^pages\/(?:[a-z0-9-]+\/)?[a-z0-9-]+$/.test(view)) throw new Error('Invalid prototype view path')
  const source = readFileSync(resolve(root, 'ui-prototype', `${view}.html`), 'utf8')
  const base = `https://prototype.invalid/${view}.html`
  const scan = html => {
    const css = [], js = []
    for (const match of html.matchAll(/<(link|script)\b[^>]*>/gi)) {
      const attrs = attributes(match[0])
      if (match[1].toLowerCase() === 'link' && attrs.rel === 'stylesheet') css.push(new URL(attrs.href, base).pathname)
      if (match[1].toLowerCase() === 'script' && attrs.src) js.push(new URL(attrs.src, base).pathname)
    }
    return { css, js }
  }
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(source)?.[1] || ''
  const body = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(source)?.[1] || ''
  assets[url] = { ...scan(source), headJs: scan(head).js, bodyJs: scan(body).js }
}
writeFileSync(resolve(root, 'src/test/resources/page-assets.json'), `${JSON.stringify(assets, null, 2)}\n`, 'utf8')
console.log(`Generated asset contracts: ${Object.keys(assets).length} pages from frozen prototype`)
