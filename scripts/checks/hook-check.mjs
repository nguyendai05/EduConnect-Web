/**
 * KIEM HOOK CONTRACT: moi selector `data-*` / `#id` / class mà JS của một trang tra cứu
 * phai xuat hien trong HTML cua chinh trang do (hoac duoc tao dong tai trong chinh JS).
 *
 * Ly do ton tai: mot tien trinh da ghi de `pages/contract/confirm.html` va lam mat
 * `data-contract-signature`, `confirm-button`, `report-modal`… trong khi
 * `js/pages/contract/confirm.js` still querySelector chuweung — trang chay im lang voi
 * mot phan noi dung mat. `node --check` va kiem link khong phat hien duoc dieu nay.
 *
 * Chay: node scripts/checks/hook-check.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname, relative, basename } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')
const UI = resolve(ROOT, 'ui-prototype')

/** Ghép mỗi trang HTML với JS "của nó": js/pages/<module>/<name>.js (+ data file cùng module). */
const htmlFiles = []
const walk = dir => {
  readdirSync(dir).forEach(name => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (name.endsWith('.html')) htmlFiles.push(full)
  })
}
walk(resolve(UI, 'pages'))

htmlFiles.sort()

/**
 * Chi nghi the duoc tao dong khi co bang chung CUM THE cho chinh token do.
 * Ban truoc dung `js.includes('innerHTML')` lam dieu kien thoat toan cuc -> moi khi
 * file co nhac innerHTML o dau thi check TRAC NIEM VO HIEU hoa (khong the bao that).
 */
const createdInJs = (js, needle, kind) => {
  const esc = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const idEvidence = [
    new RegExp(`\\.id\\s*=\\s*['"\`]${esc}['"\`]`),
    new RegExp(`setAttribute\\(\\s*['"]id['"]\\s*,\\s*['"\`]?${esc}`),
    /* Chuỗi markup gán qua innerHTML: `... id="report-error" ...` cũng là bằng chứng tạo thẻ. */
    new RegExp(`id=['"\`]${esc}['"\`]`)
  ]
  /*
   * VOI ID: KHONG duoc dung dem lan xuat hien lam bang chung. `byId('owner-initials')`
   * nam vua trong REQUIRED_IDS vua trong lenh doc => 2 lan, du de cho rule dem, va khi
   * HTML mat han id do thi check van bao "xanh" (da do that nghiem voi id bi doi ten).
   * Chi nhan bang chung tao element: .id = '...' / setAttribute('id', ...).
   */
  if (kind === 'id') return idEvidence.some(re => re.test(js))
  const evidence = [
    ...idEvidence,
    new RegExp(`className\\s*=[^;\\n]*\\b${esc}\\b`),
    new RegExp(`classList\\.add\\([^)]*\\b${esc}\\b`),
    new RegExp(`\\$\\{[^}]*\\}?${esc}`)
  ]
  if (needle.startsWith('data-')) {
    const camel = needle.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    evidence.push(new RegExp(`dataset\\.${camel.replace(/\$/g, '\\$')}\\s*=`))
    evidence.push(new RegExp(`setAttribute\\(\\s*['"]${esc}['"]`))
    evidence.push(new RegExp(`['"\`]${esc}(?=[\\s=\\]>])`))
  }
  if (evidence.some(re => re.test(js))) return true
  // Token xuat hien >= 2 lan trong JS: lan thu nhat la truy van, lan thu hai nam trong markup chuoi
  // (template/innerHTML) ma JS chen vao DOM. Mot lan duy nhat = chi truy van, khong phai tao ra.
  return js.split(needle).length - 1 >= 2
}

const problems = []
const stats = []

htmlFiles.forEach(htmlPath => {
  const html = readFileSync(htmlPath, 'utf8')
  const relHtml = relative(UI, htmlPath).replace(/\\/g, '/')

  /**
   * Chi doi chieu voi dung nhung JS ma chinh trang nay nap (qua the <script src> trong HTML).
   * Gop ca module se sinh duong tinh gia (hook cua login.js bi doi o forgot-password.html).
   */
  const jsFiles = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)]
    .map(m => m[1])
    .filter(src => /(^|\/)js\/pages\//.test(src))
    .map(src => resolve(dirname(htmlPath), src.split('?')[0].split('#')[0]))
    .filter(p => existsSync(p))
  if (!jsFiles.length) { stats.push({ page: relHtml, checked: 0, note: 'khong nap JS trang nao' }); return }

  const js = jsFiles.map(p => readFileSync(p, 'utf8')).join('\n')

  const selectors = new Set()
  /**
   * `byId('panel-' + category)` la ID dong: phan trich ra duoc chuoi dan toi 'panel-'.
   * Doi chieu chuoi do nhu ID tinh se bao that (khong co id="panel-" nao ca), nen giu no
   * o mot danh sach RIENG va yeu cau HTML co it nhat mot id bat dau bang tien to ay.
   */
  const dynamicIdPrefixes = new Set()
  const collectId = (source, re) => {
    for (const m of source.matchAll(re)) {
      if (/^\s*\+/.test(source.slice(m.index + m[0].length))) dynamicIdPrefixes.add(m[1])
      else selectors.add(`#${m[1]}`)
    }
  }
  // querySelector('[data-x]') / querySelectorAll('[data-x="y"]') / querySelector('.cls') / '#id'
  for (const m of js.matchAll(/querySelector(?:All)?\(\s*['"]([^'"]+)['"]/g)) selectors.add(m[1])
  for (const m of js.matchAll(/closest\(\s*['"]([^'"]+)['"]/g)) selectors.add(m[1])
  for (const m of js.matchAll(/matches\(\s*['"]([^'"]+)['"]/g)) selectors.add(m[1])
  collectId(js, /getElementById\(\s*['"]([^'"]+)['"]/g)
  /**
   * Ham tro giup kiem hieu id, vi du `const byId = id => document.getElementById(id)`.
   * Khi agent doi ten helper thi `byId('x')` khong bi bat boi pattern getElementById,
   * va toan bo lop loi "JS can id khong co trong HTML" se tron kiem tra.
   */
  const idHelperNames = [...js.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*id\s*=>\s*document\.getElementById/g)].map(m => m[1])
  idHelperNames.forEach(name => {
    collectId(js, new RegExp(`\\b${name.replace(/\$/g, '\\$')}\\(\\s*['"]([^'"]+)['"]`, 'g'))
  })
  for (const m of js.matchAll(/(?:^|[^-\w])dataset\.([a-zA-Z0-9]+)/g)) {
    const kebab = m[1].replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)
    selectors.add(`[data-${kebab}]`)
  }
  /**
   * Chot an toan dang mang ID: `const REQUIRED_IDS = ['a','b']` roi
   * `REQUIRED_IDS.filter(id => !byId(id))`. Pattern theo doi so cu the khong bat duoc vi
   * cac id nam trong array literal. Bo qua lop nay la de tran `#wallet-content`,
   * `#owner-name`... thoat check trong khi trang that su khong co chung.
   */
  const idCallNames = new Set(['getElementById', ...idHelperNames])
  const arrayIdRe = new RegExp(
    `const\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*\\[([\\s\\S]{0,600}?)\\][\\s\\S]{0,300}?\\b\\1\\.filter\\(\\s*(\\w+)\\s*=>\\s*!\\s*([\\w.]+)\\(\\s*\\3\\s*\\)`,
    'g'
  )
  for (const m of js.matchAll(arrayIdRe)) {
    if (!idCallNames.has(m[4].split('.').pop())) continue
    for (const s of m[2].matchAll(/['"]([^'"]+)['"]/g)) selectors.add(`#${s[1]}`)
  }

  let checked = 0
  const missing = []
  selectors.forEach(raw => {
    const sel = String(raw).trim()
    if (!sel) return
    // Tach selector gop thanh tung the dieu kien can tim trong HTML.
    const dataTokens = [...sel.matchAll(/\[(data-[a-z0-9-]+)/g)].map(m => m[1])
    const idTokens = [...sel.matchAll(/#([A-Za-z][\w-]*)/g)].map(m => `#${m[1]}`)
    const classTokens = [...sel.matchAll(/(?:^|[^\w-])\.([A-Za-z][\w-]*)/g)].map(m => `.${m[1]}`)
    const all = [...new Set([...dataTokens, ...idTokens, ...classTokens])]
    if (!all.length) return

    all.forEach(token => {
      checked++
      const bare = token.replace(/^[#.]/, '')
      const kind = token.startsWith('#') ? 'id' : token.startsWith('.') ? 'class' : 'attr'
      // The duoc tao dong tai trong JS (dataset.x= / .id= / innerHTML) thi khong doi trong HTML.
      const dynamic = createdInJs(js, bare, kind)
      const esc = bare.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      let present
      if (kind === 'id') present = html.includes(`id="${bare}"`)
      /* Class phai nam TRONG attribute class="..."; html.includes() thuan tuy cho phep
         ten class xuat hien trong prose/JS ten file va bao "du" nham. */
      else if (kind === 'class') present = new RegExp(`class="[^"]*\\b${esc}\\b[^"]*"`).test(html)
      else present = new RegExp(`\\b${esc}\\b[=\\s>"]`).test(html)
      if (!present && !dynamic) missing.push(token)
    })
  })

  dynamicIdPrefixes.forEach(prefix => {
    const esc = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    checked++
    if (!new RegExp(`id="${esc}[\\w-]+"`).test(html) && !createdInJs(js, prefix)) {
      missing.push(`#${prefix}<dinhdan>`)
    }
  })

  const uniqMissing = [...new Set(missing)]
  stats.push({ page: relHtml, checked, missing: uniqMissing.length })
  if (uniqMissing.length) problems.push({ page: relHtml, missing: uniqMissing, jsFiles: jsFiles.map(f => relative(UI, f).replace(/\\/g, '/')) })
})

console.log('=== HOOK CONTRACT CHECK ===')
stats.forEach(s => console.log(`  ${s.page}: ${s.checked} hook${s.note ? ` (${s.note})` : ''}`))
if (problems.length) {
  console.log(`\nFAIL: ${problems.length} trang co hook JS thieu trong HTML`)
  /* Moi hook tren mot dong: danh sach dai bi cat khi gop chung dong la self-check bi vo nghia. */
  problems.forEach(p => {
    console.log(`  - ${p.page} [${p.jsFiles.join(', ')}] thieu ${p.missing.length} hook:`)
    p.missing.forEach(m => console.log(`      ${m}`))
  })
  process.exitCode = 1
} else {
  console.log('\nFAIL: 0')
}
