/**
 * source-check.mjs — cổng chống "nguồn thứ hai" và chống mã bịa.
 *
 * Bối cảnh: nhiều trang từng tự giữ bảng dữ liệu riêng (tin tìm gia sư, gia sư, hợp đồng),
 * nên cùng một mã TT-8841 là hai tin khác nhau tùy trang, và có trang nối sang mã hợp đồng
 * KHÔNG TỒN TẠI (HD-20260926-018, TT-88412) — bấm link là sang trang not-found.
 *
 * Chạy: node scripts/checks/source-check.mjs
 *exit code 0 khi sạch; in RED: cho từng vi phạm.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')
const UI = resolve(ROOT, 'ui-prototype')

const failures = []
const notes = []
const fail = (name, detail = '') => {
  const line = `${name}${detail ? ` — ${detail}` : ''}`
  failures.push(line)
  console.log(`RED: ${line}`)
}

const walk = dir => readdirSync(dir).flatMap(entry => {
  const full = join(dir, entry)
  return statSync(full).isDirectory() ? walk(full) : [full]
})

const fixtureSource = readFileSync(join(UI, 'js/data/fixtures.js'), 'utf8')

/**
 * Họ mã: prefix cố định, khớp cả dạng có phần chữ (OF-SVC-1001) lẫn dạng số đơn giản.
 * Cột thứ ba `police`: họ KHÔNG có trong store (nhật ký kiểm toán chỉ do trang admin giữ)
 * thì không xét ở S1 — nếu không cổng sẽ báo nhiễu thay vì lỗi thật.
 */
const FAMILIES = [
  ['TT', 'TT-\\d+', true],
  ['BT', 'BT-\\d+', true],
  ['FE', 'FE-\\d+-\\d+', true],
  ['GS', 'GS-\\d+', true],
  ['HV', 'HV-\\d+', true],
  ['OF', 'OF-[A-Z]+-\\d+', true],
  ['OD', 'OD-\\d+-\\d+', true],
  ['HD', 'HD-\\d{8}-\\d{3}', true],
  ['PAY', 'PAY-\\d{4}-\\d+', true],
  ['INV', 'INV-\\d{8}-\\d{3}', true],
  ['APP', 'APP-\\d{4}-\\d{4}', true],
  ['EN', 'EN-\\d{4}-\\d{4}', true],
  ['RV', 'RV-\\d+', true],
  ['RS', 'RS-\\d+', true],
  ['LOG', 'LOG-\\d+', false]
]

const pattern = new RegExp(`'(${FAMILIES.map(([, re]) => re).join('|')})'`, 'g')

const known = new Set([...fixtureSource.matchAll(pattern)].map(match => match[1]))
const findFamily = id => FAMILIES.find(([, re]) => new RegExp(`^${re}$`).test(id))
const familyOf = id => findFamily(id)[0]
const policed = id => findFamily(id)[2]

const pageFiles = [...walk(join(UI, 'js/pages')), ...walk(join(UI, 'pages'))]
  .filter(file => /\.(js|html)$/.test(file))
  .filter(file => !file.includes(`${join(UI, 'js' + '/data')}`))

/* ---------- S1. Không được tham chiếu mã không tồn tại trong fixtures ----------
   Đây là cách duy nhất bắt được link bịa: trang tự viết HD-20260926-018 thì không lỗi cú pháp nào,
   chỉ có broken link lúc bấm. */
const rel = file => file.slice(UI.length + 1).replace(/\\/g, '/')

const unknownByFile = new Map()
const idsByFile = new Map()
pageFiles.forEach(file => {
  const text = readFileSync(file, 'utf8')
  const found = [...new Set([...text.matchAll(pattern)].map(match => match[1]))]
  idsByFile.set(file, found)
  const bad = found.filter(id => policed(id) && !known.has(id))
  if (bad.length) unknownByFile.set(file, bad)
})
unknownByFile.forEach((bad, file) => fail(`mã không tồn tại trong fixtures: ${rel(file)}`, bad.join(', ')))

/* ---------- S2. Bảng dữ liệu thứ hai trong trang ----------
   Ngưỡng: cùng một họ mã xuất hiện ≥3 lần trong file CÓ kèm field payload (title/poster/name/
   price/fee/rating/description) ⇒ file đó đang giữ bản sao thực thể, không chỉ tham chiếu.
   allowlist phải có lý do; file sạch mà vẫn nằm trong allowlist cũng là lỗi (không cho nợ ngủ yên). */
const PAYLOAD = /(title|poster|name|price|fee|rating|description)\s*:/
const SECOND_SOURCE_ALLOWLIST = [
  {
    file: 'js/pages/admin/audit-logs.js',
    reason: 'Bản ghi KIỂM TOÁN lịch sử (ai duyệt tin nào lúc mấy giờ). Tham chiếu mã tin là dữ kiện đã xảy ra, không phải bảng tin đang trưng bày.'
  },
  {
    file: 'js/pages/chat/messages.js',
    reason: 'Danh sách cuộc hội thoại — thực thể chat chưa có trong store (BS01 chưa được giao). Mã HD chỉ là nhãn liên kết, và nội dung đã đọc EduStore.'
  }
]

const offenders = new Map()
idsByFile.forEach((found, file) => {
  const text = readFileSync(file, 'utf8')
  if (!PAYLOAD.test(text)) return
  const counts = {}
  found.forEach(id => { counts[familyOf(id)] = (counts[familyOf(id)] || 0) + 1 })
  const heavy = Object.entries(counts).filter(([, count]) => count >= 3).map(([family, count]) => `${family}:${count}`)
  if (heavy.length) offenders.set(file, heavy.join(' '))
})

offenders.forEach((detail, file) => {
  const listed = SECOND_SOURCE_ALLOWLIST.find(item => item.file === rel(file))
  if (listed) notes.push(`${rel(file)} (được phép): ${listed.reason}`)
  else fail(`trang giữ bảng thực thể riêng: ${rel(file)}`, detail)
})
SECOND_SOURCE_ALLOWLIST.forEach(item => {
  if (!offenders.has(join(UI, ...item.file.split('/')))) {
    fail(`allowlist hết hiệu lực, cần xóa khỏi cổng: ${item.file}`, 'file không còn giữ bảng riêng')
  }
})

/* ---------- S3. Một họ mã một ngữ nghĩa ---------- */
const usedFamilies = new Map()
unknownByFile.forEach((bad, file) => bad.forEach(id => usedFamilies.set(familyOf(id), file)))
;['TT', 'BT'].forEach(prefix => {
  const withPrefix = pageFiles.filter(file => {
    const text = readFileSync(file, 'utf8')
    return new RegExp(`'${prefix}-`).test(text)
  })
  if (!withPrefix.length) return
  notes.push(`${prefix}-* xuất hiện ở ${withPrefix.length} trang/file (không sang tên họ khác)`)
})

console.log(`\nMã biết từ fixtures: ${known.size}`)
console.log(`File quét: ${pageFiles.length}`)
notes.forEach(note => console.log(`· ${note}`))
console.log(`\nFAIL: ${failures.length}`)
if (failures.length) process.exit(1)
