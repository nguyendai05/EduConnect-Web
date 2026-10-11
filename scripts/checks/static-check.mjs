/**
 * Kiểm tra TĨNH toàn bộ prototype: trang bắt buộc, cú pháp JS, href/src, anchor/aria, ID unique, CDN.
 * Đây là kiểm tra tĩnh — KHÔNG phải E2E/browser pass.
 * Chạy: node scripts/checks/static-check.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, dirname, join } from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '../..')
const UI = resolve(ROOT, 'ui-prototype')

const REQUIRED_PAGES = [
  'pages/auth/login.html', 'pages/auth/register.html', 'pages/auth/verify-email.html',
  'pages/auth/forgot-password.html', 'pages/auth/reset-password.html',
  'pages/home.html', 'pages/account/profile.html',
  'pages/tutor/search.html', 'pages/tutor/profile.html', 'pages/tutor/my-profile.html', 'pages/tutor/manage.html',
  'pages/invitation/create.html', 'pages/invitation/negotiation.html',
  'pages/job/create.html', 'pages/job/my-job.html', 'pages/job/discover.html', 'pages/job/detail.html', 'pages/job/applicants.html',
  'pages/catalog/detail.html', 'pages/cart/index.html', 'pages/order/history.html',
  'pages/contract/confirm.html', 'pages/contract/student-detail.html', 'pages/contract/tutor-detail.html',
  'pages/payment/checkout.html', 'pages/payment/qr.html', 'pages/payment/result.html',
  'pages/wallet/overview.html', 'pages/chat/messages.html',
  'pages/admin/dashboard.html', 'pages/admin/manage.html',
  'pages/admin/tutor-review-queue.html', 'pages/admin/tutor-review-detail.html',
  'pages/admin/job-review-queue.html', 'pages/admin/job-review-detail.html',
  'pages/admin/reports.html', 'pages/admin/report-detail.html',
  'pages/admin/payout-requests.html', 'pages/admin/payout-request-detail.html', 'pages/admin/audit-logs.html'
]

const failures = []
const notes = []
const fail = (group, message) => failures.push(`[${group}] ${message}`)

/* ---------- A1. Đủ 40 trang bắt buộc, không trùng ---------- */
const existingHtml = []
const walk = dir => {
  readdirSync(dir).forEach(name => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (name.endsWith('.html')) existingHtml.push(relative(UI, full).replace(/\\/g, '/'))
  })
}
walk(resolve(UI, 'pages'))

REQUIRED_PAGES.forEach(page => {
  if (!existsSync(resolve(UI, page))) fail('pages', `thiếu trang bắt buộc: ${page}`)
})
const unique = new Set(REQUIRED_PAGES)
if (unique.size !== REQUIRED_PAGES.length) fail('pages', 'danh sách trang bắt buộc có phần tử trùng')
notes.push(`trang bắt buộc: ${REQUIRED_PAGES.length}; trang HTML thực tế dưới pages/: ${existingHtml.length}`)
const extra = existingHtml.filter(page => !REQUIRED_PAGES.includes(page))
if (extra.length) notes.push(`trang ngoài danh sách bắt buộc (giữ lại, không xoá): ${extra.join(', ')}`)

/* Navigation is a shared UI contract, including the markup before scripts run. */
const userNavKeys = ['home', 'tutors', 'requests']
const adminTargets = ['dashboard.html', 'manage.html', 'tutor-review-queue.html', 'job-review-queue.html', 'reports.html', 'payout-requests.html', 'audit-logs.html']
let userHeaders = 0
let adminSidebars = 0
existingHtml.forEach(page => {
  const html = readFileSync(resolve(UI, page), 'utf8')
  const userNav = html.match(/<nav\b[^>]*class="user-header__nav"[^>]*>([\s\S]*?)<\/nav>/)
  if (userNav) {
    userHeaders++
    const keys = [...userNav[1].matchAll(/data-nav-key="([^"]+)"/g)].map(match => match[1])
    if (JSON.stringify(keys) !== JSON.stringify(userNavKeys)) fail('navigation', `${page}: thứ tự nav phải là home → tutors → requests`)
  }
  const adminNav = html.match(/<nav\b[^>]*class="admin-sidebar__nav"[^>]*>([\s\S]*?)<\/nav>/)
  if (adminNav) {
    adminSidebars++
    const targets = [...adminNav[1].matchAll(/href="([^"]+)"/g)].map(match => match[1].split(/[?#]/)[0].split('/').pop())
    if (JSON.stringify(targets) !== JSON.stringify(adminTargets)) fail('navigation', `${page}: sidebar thiếu mục hoặc sai thứ tự`)
    const sidebarScript = html.indexOf('js/core/admin-sidebar.js')
    for (const required of ['js/pages/admin/tutor-review-data.js', 'js/pages/admin/payout-data.js']) {
      const index = html.indexOf(required)
      if (index < 0 || sidebarScript < index) fail('navigation', `${page}: cần nạp ${required} trước sidebar`)
    }
  }
  if (page.startsWith('pages/auth/')) {
    for (const anchor of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
      const isHome = anchor[1].includes('aria-label="Edu Connect - Trang chủ"') || anchor[2].includes('Về trang chủ')
      const href = anchor[1].match(/href="([^"]+)"/)?.[1] || ''
      if (isHome && !/(?:^|\/)home\.html(?:[?#]|$)/.test(href)) fail('navigation', `${page}: liên kết về trang chủ phải trỏ home.html`)
    }
  }
})
notes.push(`navigation: ${userHeaders} header người dùng và ${adminSidebars} sidebar quản trị cùng thứ tự`)

/* ---------- A2. node --check toàn bộ JS ---------- */
const jsFiles = []
const walkJs = dir => {
  readdirSync(dir).forEach(name => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walkJs(full)
    else if (name.endsWith('.js')) jsFiles.push(full)
  })
}
walkJs(resolve(UI, 'js'))
let jsOk = 0
jsFiles.forEach(file => {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' })
    jsOk += 1
  } catch (error) {
    fail('syntax', `${relative(UI, file)}: ${String(error.stderr || error.message).split('\n')[0]}`)
  }
})
notes.push(`node --check: ${jsOk}/${jsFiles.length} file JS hợp lệ`)

/* ---------- helper đọc HTML ---------- */
const ATTR_RE = /\s(href|src)\s*=\s*"([^"]*)"/g
const ID_RE = /\sid\s*=\s*"([^"]+)"/g
const ARIA_REF_RE = /\s(aria-controls|aria-describedby|aria-labelledby|aria-details|for)\s*=\s*"([^"]+)"/g
const CSS_URL_RE = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g

const isLocalRef = value => {
  if (!value) return false
  if (/^(https?:|mailto:|tel:|data:|blob:|javascript:)/i.test(value)) return false
  return true
}

const pageFiles = [...REQUIRED_PAGES, ...existingHtml.filter(p => !REQUIRED_PAGES.includes(p))]
const allPages = Array.from(new Set(pageFiles)).filter(page => existsSync(resolve(UI, page)))

const cdnHits = []
const placeholderLinks = []
const brokenLinks = []
const duplicateIds = []
const danglingAria = []

allPages.forEach(page => {
  const file = resolve(UI, page)
  const source = readFileSync(file, 'utf8')
  const base = dirname(file)

  ATTR_RE.lastIndex = 0
  let match
  while ((match = ATTR_RE.exec(source)) !== null) {
    const [, attr, raw] = match
    const value = raw.trim()
    if (value === '' ) { placeholderLinks.push(`${page}: ${attr}="" rỗng`); continue }
    if (value === '#' || /^#\s*$/.test(value)) { placeholderLinks.push(`${page}: ${attr}="#" placeholder`); continue }
    if (/^(https?:)?\/\//i.test(value) || /^https?:/i.test(value)) { cdnHits.push(`${page}: ${attr}="${value}"`); continue }
    if (!isLocalRef(value)) continue
    const [pathPart] = value.split('#')
    if (!pathPart) continue
    const target = resolve(base, decodeURIComponent(pathPart.split('?')[0]))
    if (!existsSync(target)) brokenLinks.push(`${page}: ${attr}="${value}" -> không tồn tại`)
  }

  ID_RE.lastIndex = 0
  const ids = new Map()
  while ((match = ID_RE.exec(source)) !== null) {
    const id = match[1]
    ids.set(id, (ids.get(id) || 0) + 1)
  }
  ids.forEach((count, id) => { if (count > 1) duplicateIds.push(`${page}: id="${id}" lặp ${count} lần`) })

  ARIA_REF_RE.lastIndex = 0
  while ((match = ARIA_REF_RE.exec(source)) !== null) {
    const [, attr, raw] = match
    raw.split(/\s+/).filter(Boolean).forEach(ref => {
      if (ref.includes('{{') || ref.includes('%')) return
      if (!ids.has(ref)) danglingAria.push(`${page}: ${attr}="${ref}" không trỏ tới id nào trong trang`)
    })
  }
})

placeholderLinks.forEach(item => fail('link', item))
brokenLinks.forEach(item => fail('link', item))
cdnHits.forEach(item => fail('cdn', `tham chiếu mạng ngoài phạm vi — ${item}`))
duplicateIds.forEach(item => fail('id', item))
danglingAria.forEach(item => notes.push(`aria chưa khớp (cần JS render mới có node đích): ${item}`))

/* ---------- A3. CSS url() ---------- */
const cssFiles = []
const walkCss = dir => {
  readdirSync(dir).forEach(name => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walkCss(full)
    else if (name.endsWith('.css')) cssFiles.push(full)
  })
}
walkCss(resolve(UI, 'css'))
let cssUrlChecked = 0
cssFiles.forEach(file => {
  const source = readFileSync(file, 'utf8')
  CSS_URL_RE.lastIndex = 0
  let match
  while ((match = CSS_URL_RE.exec(source)) !== null) {
    const value = match[1].trim()
    if (!value || /^(data:|https?:|#)/i.test(value)) continue
    if (/^var\(/.test(value)) continue
    cssUrlChecked += 1
    const target = resolve(dirname(file), decodeURIComponent(value.split('?')[0]))
    if (!existsSync(target)) fail('css', `${relative(UI, file)}: url(${value}) không tồn tại`)
  }
})
notes.push(`CSS url(): đã kiểm ${cssUrlChecked} tham chiếu trong ${cssFiles.length} file css`)

/* ---------- A4. Mỗi trang mới phải có JS + CSS riêng ---------- */
const NEW_PAGES = [
  ['pages/auth/verify-email.html', 'js/pages/auth/verify-email.js', 'css/pages/auth/verify-email.css'],
  ['pages/auth/forgot-password.html', 'js/pages/auth/forgot-password.js', 'css/pages/auth/forgot-password.css'],
  ['pages/auth/reset-password.html', 'js/pages/auth/reset-password.js', 'css/pages/auth/reset-password.css'],
  ['pages/catalog/detail.html', 'js/pages/catalog/detail.js', 'css/pages/catalog/detail.css'],
  ['pages/cart/index.html', 'js/pages/cart/index.js', 'css/pages/cart/index.css'],
  ['pages/order/history.html', 'js/pages/order/history.js', 'css/pages/order/history.css'],
  ['pages/tutor/manage.html', 'js/pages/tutor/manage.js', 'css/pages/tutor/manage.css'],
  ['pages/admin/manage.html', 'js/pages/admin/manage.js', 'css/pages/admin/manage.css'],
  ['pages/home.html', 'js/pages/home.js', 'css/pages/home.css']
]
NEW_PAGES.forEach(([html, js, css]) => {
  if (!existsSync(resolve(UI, html))) { fail('new-page', `thiếu ${html}`); return }
  if (!existsSync(resolve(UI, js))) fail('new-page', `thiếu ${js} cho ${html}`)
  if (!existsSync(resolve(UI, css))) fail('new-page', `thiếu ${css} cho ${html}`)
  const source = readFileSync(resolve(UI, html), 'utf8')
  if (!source.includes('js/core/route.js')) fail('new-page', `${html} không nạp js/core/route.js (base path sẽ sai)`)
  // Chỉ bắt buộc store khi JS của trang thực sự tiêu thụ nguồn dữ liệu chung.
  const jsSource = existsSync(resolve(UI, js)) ? readFileSync(resolve(UI, js), 'utf8') : ''
  if (/EduStore/.test(jsSource) && !source.includes('js/data/store.js')) fail('new-page', `${html} dùng EduStore nhưng không nạp js/data/store.js`)
  if (/EduChart/.test(jsSource) && !source.includes('js/core/charts.js')) fail('new-page', `${html} dùng EduChart nhưng không nạp js/core/charts.js`)
  if (!/EduStore/.test(jsSource)) notes.push(`${html} không dùng store chung (trang chỉ cần route.js)`);
  if (/<script(?![^>]*\bsrc=)[^>]*>[\s\S]{40,}?<\/script>/.test(source)) fail('inline-js', `${html} có khối <script> nội dung dài (nghi inline business JS)`)
})

/* ---------- A5. home.html phải dùng 1 cấp ../ ; trang con dùng 2 cấp ---------- */
const homeFile = resolve(UI, 'pages/home.html')
if (existsSync(homeFile)) {
  const source = readFileSync(homeFile, 'utf8')
  const bad = [...source.matchAll(/(?:href|src)="\.\.\/\.\.\//g)]
  if (bad.length) fail('base-path', `pages/home.html còn ${bad.length} tham chiếu "../../" (home chỉ sâu 1 cấp)`)
}

/* ---------- A6. Không hard-code total/count mâu thuẫn ---------- */
const searchFile = resolve(UI, 'pages/tutor/search.html')
if (existsSync(searchFile)) {
  const source = readFileSync(searchFile, 'utf8')
  const hardcoded = /data-total="128"|>128</.test(source)
  /* Trước đây chỉ ghi note → defect hiện ra nhưng cổng vẫn xanh, tức bộ kiểm tự câm.
     Lệch là FAIL. */
  if (hardcoded) fail('hardcoded-count', 'tutor/search.html còn tổng 128 hard-code trong markup — phải do JS ghi từ store')
}

/* ---------- A7. Trang không được cất bảng hằng số theo mã hợp đồng ---------- */
/* Đây là lớp lỗi §5 đã sửa ở confirm/student-detail: một bảng JS riêng cho cùng
   một hợp đồng sẽ luôn lệch với trang đọc store.
   Cho phép ĐÚNG danh sách dưới đây:
     - file mới vi phạm  => FAIL
     - file trong danh sách đã được nối store => FAIL (phải xóa tên), nên danh sách
       không thể phình ra âm thầm và cũng không thể "quên" cập nhật. */
const CONTRACT_TABLE_ALLOWLIST = [
  { file: 'js/data/fixtures.js', reason: 'fixtures LÀ nguồn duy nhất; map id→id ở dòng 266 không phải dữ liệu thứ hai' },
]
const allowedFiles = CONTRACT_TABLE_ALLOWLIST.map(item => item.file)
const contractOffenders = jsFiles
  .filter(file => /['"]HD-\d{8}-\d{3}['"]\s*:/.test(readFileSync(file, 'utf8')))
  .map(file => relative(UI, file).replace(/\\/g, '/'))
contractOffenders.forEach(rel => {
  if (!allowedFiles.includes(rel)) fail('hardcoded-contract', `${rel} cất bảng hằng số theo mã hợp đồng — phải đọc EduStore`)
})
allowedFiles.forEach(rel => {
  if (!contractOffenders.includes(rel)) fail('hardcoded-contract', `${rel} không còn bảng hard-code nữa — xóa nó khỏi CONTRACT_TABLE_ALLOWLIST`)
})
notes.push(`A7: ${contractOffenders.length} file còn bảng hợp đồng hard-code [${contractOffenders.join(', ') || 'không'}]`)
CONTRACT_TABLE_ALLOWLIST.forEach(item => notes.push(`A7 nợ: ${item.file} — ${item.reason}`))

/* ---------- A9. Đơn vị tiền không được lặp ----------
   `Store.formatMoney()` đã tự thêm "₫" (Intl currency), nên chuỗi nào nối thêm "₫" sau nó
   in ra "220.000 ₫ ₫ / buổi" — lỗi từng nằm ở admin/job-review-queue.js và job-review-detail.js,
   không lỗi cú pháp nào bắt được.
   PHẠM VI CHẶN: chỉ cặp (a) "₫ ₫" in ra, (b) `Store.formatMoney(...)` có "₫" nối tiếp trong cùng dòng.
   Không chặn formatter TIỀN CỤC BỘ của trang (vd `formatNumber(value)} ₫` ở job/detail.js cho ô nhập
   học phí) — cái đó chỉ một lần "₫" nên không phải lỗi hiển thị; nó được ghi ở A10 như nợ trùng lặp. */
const currencyTargets = [...jsFiles, ...Array.from(allPages).map(page => resolve(UI, page))]
const moneyCall = /Store\.format(?:Money)\([^)]*\)[^\n]{0,24}₫/
const currencyOffenders = currencyTargets.filter(file => {
  const text = readFileSync(file, 'utf8')
  return /₫\s*₫/.test(text) || moneyCall.test(text)
})
currencyOffenders.forEach(file => fail('currency-suffix-duplicated', relative(UI, file)))
notes.push(`A9: ${currencyOffenders.length} file nối "₫" sau Store.formatMoney [${currencyOffenders.map(f => relative(UI, f)).join(', ') || 'không'}]`)

/* ---------- A10. Trang tự định nghĩa formatter tiền song song với store ----------
   Không chặn: có trường hợp chính đáng (định dạng khi đang gõ). Chỉ ghi để nợ không vô hình. */
const localMoney = currencyTargets.filter(file => /const formatMoney\s*=|function formatMoney\s*\(/.test(readFileSync(file, 'utf8')))
notes.push(`A10: ${localMoney.length} file tự định nghĩa formatMoney riêng [${localMoney.map(f => relative(UI, f)).join(', ') || 'không'}]`)

/* ---------- Kết quả ---------- */
console.log('=== GHI CHÚ ===')
notes.forEach(n => console.log(`  · ${n}`))
console.log(`\nPASS-CHECKS: ${notes.length} nhóm ghi chú`)
if (failures.length) {
  console.log(`\nFAIL: ${failures.length}`)
  failures.forEach(f => console.log(`  - ${f}`))
  process.exitCode = 1
} else {
  console.log('\nFAIL: 0')
}
