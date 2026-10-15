import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const templates = join(root, 'src/main/resources/templates')
const staticRoot = join(root, 'src/main/resources/static')
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)])
const failures = []
let assets = 0
for (const file of walk(templates).filter(f => f.endsWith('.html'))) {
  const source = readFileSync(file, 'utf8')
  const name = relative(root, file)
  if (/<script\b(?![^>]*\b(?:src|th:src)=)[^>]*>[\s\S]*?\S[\s\S]*?<\/script>|<style\b/i.test(source)) failures.push(`${name}: inline script/style`)
  for (const match of source.matchAll(/\bth:href\s*=\s*(["'])(.*?)\1/gs)) if (match[2].includes('.html')) failures.push(`${name}: legacy navigation`)
  for (const match of source.matchAll(/@\{\/(css|js|assets)\/([^}]+)\}/g)) {
    const path = `${match[1]}/${match[2]}`
    if (path.includes('{') || path.includes('${')) continue
    const target = resolve(staticRoot, path.split(/[?#(]/)[0])
    if (!target.startsWith(`${staticRoot}\\`) && !target.startsWith(`${staticRoot}/`)) failures.push(`${name}: asset outside static`)
    else if (!existsSync(target)) failures.push(`${name}: missing asset ${path}`)
    assets++
  }
  // Preview paths are parameterized, so validate each explicit fragment argument.
  for (const match of source.matchAll(/preview-scripts\s*::\s*scripts\('([a-z-]+)'\)/g)) {
    if (!existsSync(join(staticRoot, 'js/preview', `${match[1]}.js`))) failures.push(`${name}: missing preview script`)
  }
}
for (const file of walk(staticRoot).filter(f => /\.(js|css)$/.test(f))) {
  // Match the Thymeleaf namespace; CSS width: and JS path: are ordinary identifiers.
  if (/\bth:[a-z][\w-]*/i.test(readFileSync(file, 'utf8'))) failures.push(`${relative(root, file)}: Thymeleaf namespace in static source`)
}
assert.equal(failures.length, 0, failures.join('\n'))
console.log(`Template checks: PASS; templates=${walk(templates).filter(f => f.endsWith('.html')).length}; static references=${assets}`)
