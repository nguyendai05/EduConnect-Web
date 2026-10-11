/**
 * Kiểm chứng store demo bằng Node (không cần browser).
 * Chạy: node scripts/checks/store-check.mjs
 * Shim tối thiểu window/document/sessionStorage để nạp fixtures.js + store.js.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vm from 'node:vm'

const ROOT = resolve(import.meta.dirname, '../..')
const UI = resolve(ROOT, 'ui-prototype')

const failures = []
const passes = []

const check = (name, condition, detail = '') => {
  if (condition) passes.push(name)
  else {
    const line = `${name}${detail ? ` — ${detail}` : ''}`
    failures.push(line)
    /* In ngay khi đỏ: nhiều lần lỗi thật bị mất vì script crash ở assertion kế tiếp,
       và người đọc chỉ thấy "1 failed" không kèm nguyên nhân. */
    console.log(`RED: ${line}`)
  }
}

const makeStorage = () => {
  const map = new Map()
  return {
    getItem: key => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => { map.set(key, String(value)) },
    removeItem: key => { map.delete(key) },
    get length() { return map.size },
    key: index => Array.from(map.keys())[index] ?? null,
    clear: () => { map.clear() }
  }
}

const listeners = []
const sandbox = {
  sessionStorage: makeStorage(),
  localStorage: makeStorage(),
  console,
  Intl,
  Date,
  JSON,
  Math,
  Number,
  String,
  Array,
  Object,
  Set,
  Map,
  Error,
  isNaN,
  isFinite,
  URLSearchParams,
  document: {
    addEventListener: (type, fn) => { listeners.push({ type, fn }) },
    dispatchEvent: event => { listeners.filter(l => l.type === event.type).forEach(l => l.fn(event)) ; return true },
    querySelectorAll: () => [],
    createElement: () => ({ setAttribute() {}, appendChild() {}, classList: { add() {}, remove() {} } }),
    documentElement: {}
  }
}
sandbox.window = sandbox
sandbox.globalThis = sandbox
sandbox.CustomEvent = class CustomEvent {
  constructor(type, options = {}) { this.type = type; this.detail = options.detail ?? null }
}

const context = vm.createContext(sandbox)
for (const file of ['js/data/fixtures.js', 'js/data/store.js']) {
  const code = readFileSync(resolve(UI, file), 'utf8')
  vm.runInContext(code, context, { filename: file })
}

const F = sandbox.EduFixtures
const S = sandbox.EduStore

check('EduFixtures được export', Boolean(F))
check('EduStore được export', Boolean(S))

/* ---------- 1. Bất biến tài chính ---------- */
const releases = F.financialEvents.filter(e => e.type === 'release')
check('có release event để kiểm', releases.length > 0)
releases.forEach(e => {
  check(`gross = net + fee (${e.id})`, e.grossReleased === e.tutorNetReleased + e.platformFeeReleased,
    `${e.grossReleased} != ${e.tutorNetReleased} + ${e.platformFeeReleased}`)
  check(`feeRateSnapshot = DEMO_FEE_RATE (${e.id})`, e.feeRateSnapshot === F.DEMO_FEE_RATE)
  const expectedFee = Math.round(e.grossReleased * F.DEMO_FEE_RATE)
  check(`fee khớp 10% (${e.id})`, e.platformFeeReleased === expectedFee,
    `${e.platformFeeReleased} != ${expectedFee}`)
})

F.orders.forEach(o => {
  const itemsTotal = o.items.reduce((s, i) => s + Math.round(i.unitPrice * i.sessions * (i.seats || 1)), 0)
  check(`order.total khớp tổng item (${o.id})`, o.total === itemsTotal, `${o.total} != ${itemsTotal}`)
  o.items.forEach(i => check(`giá không âm (${i.id})`, i.unitPrice >= 0 && i.total >= 0))
})

check('không có số tiền âm trong payments', F.payments.every(p => p.total >= 0 && p.walletUsed >= 0 && p.payosDue >= 0))
F.payments.forEach(p => check(`walletUsed + payosDue = total (${p.id})`, p.walletUsed + p.payosDue === p.total,
  `${p.walletUsed} + ${p.payosDue} != ${p.total}`))

check('wallet không âm', F.wallets.every(w => w.availableToUse >= 0))
/**
 * escrowHeld / grossReleased / refunded từng là field cứng trong fixtures và TRÙNG
 * với đường tính từ payment+event (HV-2001 ghi 5.040.000 ₫ escrow trong khi hợp đồng
 * chỉ còn giữ 3.780.000 ₫). Cấm field dẫn xuất quay lại để không tái tạo hai nguồn.
 */
check('wallet không còn field dẫn xuất (escrowHeld/grossReleased/refunded)',
  F.wallets.every(w => !('escrowHeld' in w) && !('grossReleased' in w) && !('refunded' in w)),
  F.wallets.filter(w => 'escrowHeld' in w || 'grossReleased' in w || 'refunded' in w).map(w => w.ownerId).join(','))

/* ---------- 2. Referential integrity ---------- */
const ids = {
  offerings: new Set(F.offerings.map(o => o.id)),
  tutors: new Set(F.tutors.map(t => t.id)),
  learners: new Set(F.learners.map(l => l.id)),
  contracts: new Set(F.contracts.map(c => c.id)),
  orders: new Set(F.orders.map(o => o.id)),
  jobs: new Set(F.jobs.map(j => j.id)),
  applications: new Set(F.applications.map(a => a.id)),
  invitations: new Set(F.invitations.map(i => i.id)),
  payments: new Set(F.payments.map(p => p.id)),
  reviews: new Set(F.reviews.map(r => r.id)),
  reports: new Set(F.reports.map(r => r.id)),
  enrollments: new Set(F.enrollments.map(e => e.id)),
  personas: new Set(F.personas.map(p => p.id))
}

F.orders.forEach(o => {
  check(`order.learnerId tồn tại (${o.id})`, ids.learners.has(o.learnerId))
  check(`order.tutorId tồn tại (${o.id})`, ids.tutors.has(o.tutorId))
  if (o.contractId) check(`order.contractId tồn tại (${o.id})`, ids.contracts.has(o.contractId))
  if (o.reviewId) check(`order.reviewId tồn tại (${o.id})`, ids.reviews.has(o.reviewId))
  if (o.refund?.paymentId) check(`refund.paymentId tồn tại (${o.id})`, ids.payments.has(o.refund.paymentId))
  o.items.forEach(i => {
    if (i.offeringId) check(`item.offeringId tồn tại (${i.id})`, ids.offerings.has(i.offeringId))
    check(`item.tutorId tồn tại (${i.id})`, ids.tutors.has(i.tutorId))
  })
})

F.contracts.forEach(c => {
  check(`contract.orderId tồn tại (${c.id})`, ids.orders.has(c.orderId))
  const o = F.orders.find(x => x.id === c.orderId)
  check(`contract.total khớp order.total (${c.id})`, o && c.total === o.total, `${c.total} vs ${o?.total}`)
  check(`contract↔order hai chiều (${c.id})`, o && o.contractId === c.id)
})

F.payments.forEach(p => {
  if (p.orderId) check(`payment.orderId tồn tại (${p.id})`, ids.orders.has(p.orderId))
  if (p.contractId) check(`payment.contractId tồn tại (${p.id})`, ids.contracts.has(p.contractId))
})

F.offerings.forEach(o => {
  check(`offering.tutorId tồn tại (${o.id})`, ids.tutors.has(o.tutorId))
  if (o.type === 'GROUP_CLASS') {
    check(`group có capacity (${o.id})`, Number.isFinite(o.capacity))
    check(`enrolled <= capacity (${o.id})`, o.enrolled <= o.capacity, `${o.enrolled} > ${o.capacity}`)
  }
})

F.reviews.forEach(r => {
  check(`review.orderId tồn tại (${r.id})`, ids.orders.has(r.orderId))
  const o = F.orders.find(x => x.id === r.orderId)
  check(`review chỉ trên đơn completed (${r.id})`, o && o.status === 'completed', o?.status)
})

F.reports.forEach(r => {
  const set = { tutor: ids.tutors, contract: ids.contracts, order: ids.orders, offering: ids.offerings, job: ids.jobs }[r.targetType]
  check(`report.targetId tồn tại (${r.id})`, Boolean(set) && set.has(r.targetId))
  check(`report.reason hợp lệ (${r.id})`, S.REPORT_REASONS.some(x => x.code === r.reason))
})

F.enrollments.forEach(e => {
  check(`enrollment.offeringId là GROUP_CLASS (${e.id})`, F.offerings.find(o => o.id === e.offeringId)?.type === 'GROUP_CLASS')
  check(`enrollment.orderId tồn tại (${e.id})`, ids.orders.has(e.orderId))
})

/* Job / application: một thực thể một mã, đã hợp nhất về hệ TT-* */
F.jobs.forEach(j => {
  check(`job.learnerId tồn tại (${j.id})`, ids.learners.has(j.learnerId))
  check(`job ID dùng hệ TT-* (${j.id})`, /^TT-\d+$/.test(j.id), j.id)
  if (j.selectedApplicationId) check(`job.selectedApplicationId tồn tại (${j.id})`, ids.applications.has(j.selectedApplicationId))
  if (j.status === 'approved' && j.availability === 'open') check(`job open phải có publishedAt (${j.id})`, Boolean(j.publishedAt))
})
F.applications.forEach(a => {
  check(`application.jobId tồn tại (${a.id})`, ids.jobs.has(a.jobId))
  check(`application.tutorId tồn tại (${a.id})`, ids.tutors.has(a.tutorId))
})
check('chọn duy nhất: mỗi application selected thuộc đúng job đã đánh dấu', F.applications.filter(a => a.status === 'selected').every(a => F.jobs.find(j => j.id === a.jobId)?.selectedApplicationId === a.id))
check('có job approved/open, closed và pending', F.jobs.some(j => j.status === 'approved' && j.availability === 'open') && F.jobs.some(j => j.availability === 'closed') && F.jobs.some(j => j.status === 'pending'))
F.orders.filter(o => o.channel === 'JOB').forEach(o => {
  check(`order JOB sourceRef trỏ application có thật (${o.id})`, ids.applications.has(o.sourceRef?.id))
  check(`order JOB sourceRef.jobId có thật (${o.id})`, ids.jobs.has(o.sourceRef?.jobId))
})

/* ---------- 3. Phủ đủ các trạng thái bắt buộc ---------- */
const channels = new Set(F.orders.map(o => o.channel))
;['INVITATION', 'JOB', 'GROUP_CLASS'].forEach(c => check(`có order channel ${c}`, channels.has(c)))

const orderStates = new Set(F.orders.map(o => o.status))
;['created', 'awaiting_payment', 'active', 'completed', 'cancellation_pending', 'cancelled'].forEach(s =>
  check(`có order status ${s}`, orderStates.has(s)))

check('có order chưa có contract', F.orders.some(o => o.contractId === null))
const payStates = new Set(F.payments.map(p => p.status))
;['verified', 'pending', 'failed', 'expired', 'cancelled', 'refunded', 'refund_pending'].forEach(s =>
  check(`có payment status ${s}`, payStates.has(s)))
check('có payment due=0 (ví đủ)', F.payments.some(p => p.payosDue === 0 && p.status === 'verified'))
check('có payment partial wallet', F.payments.some(p => p.walletUsed > 0 && p.payosDue > 0))
check('có verified-success fixture cho QA', F.payments.some(p => p.demoVerifiedSuccess === true))

check('có offering published/open', F.offerings.some(o => o.status === 'published' && o.availability === 'open'))
check('có offering closed', F.offerings.some(o => o.availability === 'closed'))
check('có offering unpublished', F.offerings.some(o => o.status === 'unpublished'))
check('có group còn chỗ', F.offerings.some(o => o.type === 'GROUP_CLASS' && o.enrolled < o.capacity && o.availability === 'open'))
check('có group FULL', F.offerings.some(o => o.type === 'GROUP_CLASS' && o.enrolled >= o.capacity))
check('có group còn đúng 1 chỗ', F.offerings.some(o => o.type === 'GROUP_CLASS' && o.capacity - o.enrolled === 1))
check('có tutor pending', F.tutors.some(t => t.profileStatus === 'pending'))
check('có tutor rejected', F.tutors.some(t => t.profileStatus === 'rejected'))

const reviewCodes = F.orders.map(o => S.reviewEligibility(o.id).code)
check('có review eligible', reviewCodes.includes('eligible'))
check('có review already-reviewed', reviewCodes.includes('already-reviewed'))
check('có review not-completed (ineligible)', reviewCodes.includes('not-completed'))

const reportStates = new Set(F.reports.map(r => r.state))
;['open', 'investigating', 'resolved', 'dismissed'].forEach(s => check(`có report state ${s}`, reportStates.has(s)))

const tokenStates = new Set(F.authTokens.filter(t => t.kind === 'verify-email').map(t => t.state))
;['valid', 'expired', 'used'].forEach(s => check(`có verify token ${s}`, tokenStates.has(s)))

check('mỗi persona role đều có', ['learner', 'tutor', 'admin'].every(r => F.personas.some(p => p.role === r)))

/* ---------- 4. Không lộ secret / dữ liệu thật ---------- */
const raw = readFileSync(resolve(UI, 'js/data/fixtures.js'), 'utf8')
check('không có email domain thật', !/@(gmail|yahoo|outlook|hotmail)\./i.test(raw))
check('không có chuỗi password=', !/password\s*[:=]/i.test(raw))
check('không có số điện thoại 10 chữ liên tiếp', !/(?<!\d)0\d{9}(?!\d)/.test(raw))

/* ---------- 5. Store runtime: session, cart, checkout, cancel, review, report ---------- */
const session0 = S.getSession()
check('session mặc định là learner', session0.persona.role === 'learner')

const loginBad = S.login('khong-ton-tai@demo.test')
check('login sai không đổi persona', loginBad.ok === false && S.getSession().personaId === session0.personaId)
const loginOk = S.login('mai.lan@demo.test')
check('login đúng email thành công', loginOk.ok === true && S.getSession().personaId === 'PARENT-01')

const learnerId = S.sessionLearnerId('PARENT-01')
check('sessionLearnerId resolve được', learnerId === 'HV-2001')
check('sessionTutorId của learner là null', S.sessionTutorId('PARENT-01') === null)
check('sessionTutorId của tutor persona', S.sessionTutorId('TUTOR-01') === 'GS-05')

/* Hồi quy: bỏ tham số thì phải đọc persona đang đăng nhập, không rơi về mặc định. */
S.setSession('TUTOR-01')
check('sessionTutorId() không tham số đọc đúng session', S.sessionTutorId() === 'GS-05', String(S.sessionTutorId()))
check('sessionLearnerId() của phiên gia sư là null', S.sessionLearnerId() === null)
S.setSession('PARENT-01')
check('sessionLearnerId() không tham số đọc đúng session', S.sessionLearnerId() === 'HV-2001', String(S.sessionLearnerId()))

/* getPersona() không tham số PHẢI trả persona của phiên. Trước hàm này luôn trả
   DEFAULT_PERSONA_ID, nên trang suy vai trò từ getPersona() dựng nhầm persona sau khi
   setSession('TUTOR-01') — lỗi thật tìm ra lúc browser-verify job/discover. */
check('getPersona() không tham số đồng thuận với getSession()',
  S.getPersona().id === S.getSession().personaId, JSON.stringify([S.getPersona().id, S.getSession().personaId]))
S.setSession('TUTOR-01')
check('đổi phiên sang gia sư thì getPersona() theo phiên',
  S.getPersona().id === 'TUTOR-01' && S.getPersona().role === 'tutor' && S.getPersona().tutorId === 'GS-05')
check('getPersona(id) truyền tường minh vẫn hoạt động (order/history, tutor/manage dùng)',
  S.getPersona('TUTOR-02')?.tutorId === 'GS-13' && S.getPersona('ADMIN-01')?.role === 'admin')
S.setSession('STUDENT-01')
check('persona học viên: learnerId theo phiên, tutorId null',
  S.sessionLearnerId() === 'HV-2002' && S.sessionTutorId() === null)
S.setSession('ADMIN-01')
check('persona quản trị không phải learner cũng không phải tutor',
  S.sessionLearnerId() === null && S.sessionTutorId() === null && S.getPersona().role === 'admin')
const badPersona = S.setSession('PARENT-99')
check('setSession persona lạ bị chặn và KHÔNG làm lệch getPersona()',
  badPersona.ok === false && badPersona.reason === 'unknown-persona' && S.getPersona().id === 'ADMIN-01',
  JSON.stringify([badPersona, S.getPersona().id]))
S.clearSession()
check('xóa phiên thì getPersona() rơi về persona mặc định, vẫn khớp getSession()',
  S.getPersona().id === S.getSession().personaId && S.getPersona().id === 'PARENT-01')
check('sessionTutorId() của phiên học viên là null', S.sessionTutorId() === null)
const logoutRes = S.logout()
check('logout thành công', logoutRes.ok === true)
check('sau logout về persona mặc định', S.getSession().personaId === 'PARENT-01')
S.setSession('PARENT-01')

check('cart rỗng lúc đầu', S.cartItems().length === 0)
const addClosed = S.cartAdd('OF-SVC-1006', {})
check('không thêm được offering closed', addClosed.ok === false && addClosed.reason === 'closed')
const addDraft = S.cartAdd('OF-SVC-1007', {})
check('không thêm được offering draft', addDraft.ok === false && addDraft.reason === 'not-published')
const addUnknown = S.cartAdd('OF-SVC-9999', {})
check('offering không tồn tại bị từ chối', addUnknown.ok === false && addUnknown.reason === 'unknown-offering')

const addFull = S.cartAdd('OF-GRP-2002', { seats: 1 })
check('group FULL bị chặn', addFull.ok === false && addFull.reason === 'not-enough-seats')

const addOk = S.cartAdd('OF-GRP-2004', { seats: 1 })
check('thêm group còn 1 chỗ thành công', addOk.ok === true)
const addOver = S.cartAdd('OF-GRP-2004', { seats: 1 })
check('thêm lần 2 vượt chỗ bị chặn', addOver.ok === false && addOver.reason === 'not-enough-seats')

const svc = S.cartAdd('OF-SVC-1002', { selection: { target: '7.0' } })
check('thêm SERVICE có option thành công', svc.ok === true)
const expectedUnit = 250000 + 50000
check(`option delta cộng đúng giá (${expectedUnit})`, S.cartItems().find(i => i.offeringId === 'OF-SVC-1002').unitPrice === expectedUnit)

const cartExpectedTotal = 140000 * 16 * 1 + expectedUnit * 30 * 1
check('cartTotal tính đúng', S.cartTotal() === cartExpectedTotal, `${S.cartTotal()} != ${cartExpectedTotal}`)

const validation = S.validateCartForCheckout()
check('validateCartForCheckout ok trước checkout', validation.ok === true)

const firstCheckout = S.checkoutFromCart({ learnerId, idempotency: 'ck-1' })
check('checkout thành công', firstCheckout.ok === true && Boolean(firstCheckout.data?.orderId),
  `reason=${firstCheckout.reason} issues=${JSON.stringify(firstCheckout.issues || firstCheckout.data?.issues || null)}`)
const createdOrderId = firstCheckout.data?.orderId
const createdContractId = firstCheckout.data?.contractId

const replay = S.checkoutFromCart({ learnerId, idempotency: 'ck-1' })
check('bấm lặp không tạo đơn thứ hai', replay.ok === false && replay.reason === 'duplicated')

const newOrder = S.order(createdOrderId)
check('đơn mới đọc lại được từ store', Boolean(newOrder))
check('đơn mới ở trạng thái chờ thanh toán', newOrder?.status === 'awaiting_payment')
check('đơn mới có contract liên kết', newOrder?.contractId === createdContractId)
check('contract mới trỏ ngược về order', S.contract(createdContractId)?.orderId === createdOrderId)
check('contract.total = order.total', S.contract(createdContractId)?.total === newOrder?.total)
check('giỏ đã rỗng sau checkout', S.cartItems().length === 0)

const grp = S.offering('OF-GRP-2004')
check('chỗ lớp nhóm được giữ sau checkout', grp.enrolled === 4, `enrolled=${grp.enrolled}`)
check('seatsLeft = 0 khi full', S.seatsLeft(grp) === 0)

const cancelShort = S.cancelOrder({ orderId: createdOrderId, reason: 'ng' })
check('reason quá ngắn bị chặn', cancelShort.ok === false && cancelShort.reason === 'reason-too-short')
check('state không đổi khi validate lỗi', S.order(createdOrderId)?.status === 'awaiting_payment')

const cancelOk = S.cancelOrder({ orderId: createdOrderId, reason: 'Đổi kế hoạch học của con', policyCode: 'before-first-session', idempotency: 'cancel-1' })
check('hủy đơn thành công', cancelOk.ok === true)
const cancelReplay = S.cancelOrder({ orderId: createdOrderId, reason: 'Đổi kế hoạch học của con', idempotency: 'cancel-1' })
check('hủy lặp bị chặn bởi idempotency', cancelReplay.ok === false && cancelReplay.reason === 'duplicated')

const grpAfterCancel = S.offering('OF-GRP-2004')
check('chỗ lớp nhóm được trả lại sau khi hủy', grpAfterCancel.enrolled === 3, `enrolled=${grpAfterCancel.enrolled}`)

const cancelCompleted = S.cancelOrder({ orderId: 'OD-2026-0002', reason: 'Muốn hủy đơn đã hoàn tất' })
check('không hủy được đơn completed', cancelCompleted.ok === false && cancelCompleted.reason === 'cannot-cancel')

const reviewBad = S.submitReview({ orderId: 'OD-2026-0001', rating: 5, comment: 'Rất tốt, dạy dễ hiểu.' })
check('đơn active không được review', reviewBad.ok === false && reviewBad.reason === 'not-completed')
const reviewDup = S.submitReview({ orderId: 'OD-2026-0007', rating: 5, comment: 'Rất tốt, dạy dễ hiểu.' })
check('đơn đã review bị chặn', reviewDup.ok === false && reviewDup.reason === 'already-reviewed')
const reviewRating = S.submitReview({ orderId: 'OD-2026-0002', rating: 6, comment: 'Rất tốt, dạy dễ hiểu.' })
check('rating ngoài 1-5 bị chặn', reviewRating.ok === false && reviewRating.reason === 'invalid-rating')
const reviewShort = S.submitReview({ orderId: 'OD-2026-0002', rating: 5, comment: 'ok' })
check('comment quá ngắn bị chặn', reviewShort.ok === false && reviewShort.reason === 'comment-too-short')
const reviewOk = S.submitReview({ orderId: 'OD-2026-0002', rating: 5, comment: 'Thầy dạy rất kỹ, con hiểu bài ngay trên lớp.' })
check('review hợp lệ được lưu', reviewOk.ok === true)
check('review mới xuất hiện trong list tutor', S.reviewsByTutor('GS-04').some(r => r.id === reviewOk.data.reviewId))
const summary = S.ratingSummary('GS-04')
check('ratingSummary cập nhật sau review', summary.count === 1 && summary.average === 5, JSON.stringify(summary))
const reviewAfter = S.submitReview({ orderId: 'OD-2026-0002', rating: 4, comment: 'Đánh giá lần hai không được chấp nhận.' })
check('không review lần hai cùng đơn', reviewAfter.ok === false && reviewAfter.reason === 'already-reviewed')

const reportBadReason = S.submitReport({ reporterId: 'HV-2001', targetType: 'tutor', targetId: 'GS-05', reason: 'khong-co' })
check('report reason không hợp lệ bị chặn', reportBadReason.ok === false && reportBadReason.reason === 'invalid-reason')
const reportBadTarget = S.submitReport({ reporterId: 'HV-2001', targetType: 'tutor', targetId: 'GS-9999', reason: 'no-show' })
check('report target không tồn tại bị chặn', reportBadTarget.ok === false && reportBadTarget.reason === 'unknown-target')
const reportDup = S.submitReport({ reporterId: 'HV-2001', targetType: 'tutor', targetId: 'GS-03', reason: 'no-show' })
check('report trùng (đang open) bị chặn', reportDup.ok === false && reportDup.reason === 'duplicate-open-report')
const reportOk = S.submitReport({ reporterId: 'HV-2001', targetType: 'tutor', targetId: 'GS-05', reason: 'no-show', evidenceNote: 'Vắng 1 buổi không báo trước.' })
check('report hợp lệ được lưu', reportOk.ok === true)
const senderSees = S.reportsByReporter('HV-2001').some(r => r.id === reportOk.data?.reportId)
check('người gửi và admin thấy CÙNG report ID', senderSees && Boolean(S.report(reportOk.data?.reportId)))

const decideShort = S.decideReport({ reportId: reportOk.data?.reportId, decision: 'resolve', summary: 'ngắn' })
check('resolve summary quá ngắn bị chặn', decideShort.ok === false && decideShort.reason === 'summary-too-short')
const decideInvestigate = S.decideReport({ reportId: reportOk.data?.reportId, decision: 'investigate' })
check('chuyển investigating được', decideInvestigate.ok === true)
const decideResolve = S.decideReport({ reportId: reportOk.data?.reportId, decision: 'resolve', summary: 'Đã nhắc nhở gia sư về việc báo vắng.' })
check('resolve thành công', decideResolve.ok === true)
const decideAgain = S.decideReport({ reportId: reportOk.data?.reportId, decision: 'dismiss', summary: 'Quyết định lần hai phải bị chặn.' })
check('report terminal không quyết định lại', decideAgain.ok === false && (decideAgain.reason === 'terminal-state' || decideAgain.reason === 'duplicated'))
check('report resolved không tự refund', S.order('OD-2026-0007').refund === null)

const pendingRefundOrder = F.orders.find(o => o.refund?.state === 'pending')
check('có đơn refund pending để hoàn tất', Boolean(pendingRefundOrder))
const walletBefore = S.walletOf(pendingRefundOrder.learnerId)?.availableToUse ?? 0
const refundDone = S.completeRefund(pendingRefundOrder.id)
check('completeRefund thành công', refundDone.ok === true)
check('completeRefund chỉ chạy một lần', S.completeRefund(pendingRefundOrder.id).ok === false)
const walletAfter = S.walletOf(pendingRefundOrder.learnerId)?.availableToUse ?? 0
const refundedAmount = S.order(pendingRefundOrder.id).refund.amount
check('số dư ví tăng đúng bằng tiền hoàn', walletAfter - walletBefore === refundedAmount, `${walletAfter}-${walletBefore} != ${refundedAmount}`)
check('refund succeeded và order cancelled', S.order(pendingRefundOrder.id).refund.state === 'succeeded' && S.order(pendingRefundOrder.id).status === 'cancelled')

/* ---------- 6. Offering CRUD + UI gate ---------- */
check('tutor approved được publish', S.canTutorPublish('GS-05') === true)
check('tutor pending KHÔNG được publish', S.canTutorPublish('GS-13') === false)
const createPending = S.saveOffering({ tutorId: 'GS-13', patch: { title: 'Hóa 10 thử', subject: 'hoa-hoc', subjectLabel: 'Hóa học', grade: '10', gradeLabel: 'Lớp 10', sessions: 10, price: 150000, unit: 'per-session', unitLabel: '/buổi', durationMinutes: 90, mode: 'online', region: 'ho-chi-minh', district: 'Quận 10', status: 'published' } })
check('tutor pending không tạo được offering published', createPending.ok === false && createPending.reason === 'profile-not-approved')
const createDraft = S.saveOffering({ tutorId: 'GS-05', patch: { title: 'Toán 11 (mới)', type: 'SERVICE', subject: 'toan', subjectLabel: 'Toán học', grade: '10', gradeLabel: 'Lớp 11', sessions: 12, price: 200000, unit: 'per-session', unitLabel: '/buổi', durationMinutes: 90, mode: 'both', region: 'ho-chi-minh', district: 'Thủ Đức', status: 'draft' } })
check('tutor approved tạo draft được', createDraft.ok === true)
const createdOfferingId = createDraft.data.offeringId
check('offering mới KHÔNG public ngay', S.isPubliclyListable(S.offering(createdOfferingId)) === false)
const badTransition = S.transitionOffering({ offeringId: createdOfferingId, action: 'publish', tutorId: 'GS-05' })
check('draft không publish thẳng được (phải qua duyệt)', badTransition.ok === false && badTransition.reason === 'invalid-transition')
const toReview = S.transitionOffering({ offeringId: createdOfferingId, action: 'submit', tutorId: 'GS-05' })
check('draft -> in_review hợp lệ', toReview.ok === true)
const notOwner = S.transitionOffering({ offeringId: createdOfferingId, action: 'publish', tutorId: 'GS-01' })
check('không phải owner bị chặn', notOwner.ok === false && notOwner.reason === 'not-owner')
const published = S.transitionOffering({ offeringId: createdOfferingId, action: 'publish' })
check('in_review -> published hợp lệ', published.ok === true)
check('offering đã publish xuất hiện công khai', S.isPubliclyListable(S.offering(createdOfferingId)) === true)
const badPrice = S.saveOffering({ id: createdOfferingId, tutorId: 'GS-05', patch: { price: 1000 } })
check('giá dưới sàn bị chặn', badPrice.ok === false && badPrice.reason === 'invalid-price')

/* ---------- 6b. Định dạng ID sinh ra phải đúng họ, không lẫn prefix ---------- */
const newSvc = S.saveOffering({ tutorId: 'GS-05', patch: { title: 'Toán 12 (kiểm định dạng ID)', type: 'SERVICE', subject: 'toan', subjectLabel: 'Toán học', grade: '12', gradeLabel: 'Lớp 12', sessions: 10, price: 200000, unit: 'per-session', unitLabel: '/buổi', durationMinutes: 90, mode: 'both', region: 'ho-chi-minh', district: 'Thủ Đức', status: 'draft' } })
check('SERVICE mới có ID dạng OF-SVC-<số>', /^OF-SVC-\d+$/.test(newSvc.data.offeringId), newSvc.data.offeringId)
const newGrp = S.saveOffering({ tutorId: 'GS-05', patch: { title: 'Lớp nhóm Lý (kiểm định dạng ID)', type: 'GROUP_CLASS', subject: 'vat-ly', subjectLabel: 'Vật lý', grade: '10', gradeLabel: 'Lớp 10', sessions: 10, price: 140000, unit: 'per-session', unitLabel: '/buổi', durationMinutes: 90, mode: 'home', region: 'ho-chi-minh', district: 'Thủ Đức', capacity: 6, status: 'draft' } })
check('GROUP_CLASS mới có ID dạng OF-GRP-<số>', /^OF-GRP-\d+$/.test(newGrp.data.offeringId), newGrp.data.offeringId)
check('hai offering mới không trùng ID', newSvc.data.offeringId !== newGrp.data.offeringId)
const allIds = S.list('offerings').map(o => o.id)
check('không trùng ID offering sau khi tạo', new Set(allIds).size === allIds.length)
const ck2 = S.checkoutFromCart({ learnerId: 'HV-2003', idempotency: 'ck-idfmt' })
S.cartAdd('OF-SVC-1003', { seats: 1 })
const ck3 = S.checkoutFromCart({ learnerId: 'HV-2003', idempotency: 'ck-idfmt-2' })
if (ck3.ok) {
  check('order ID sinh ra đúng dạng OD-2026-xxxx', /^OD-2026-\d{4}$/.test(ck3.data.orderId), ck3.data.orderId)
  check('contract ID sinh ra đúng dạng HD-2026-xxxx', /^HD-2026-\d{4}$/.test(ck3.data.contractId), ck3.data.contractId)
} else {
  check('checkout lần hai để kiểm định dạng ID', false, JSON.stringify(ck3))
}
void ck2
const ledgerIds = S.list('ledger').map(l => l.id)
check('ledger ID không có dạng TT-8-xxxxx sai', !ledgerIds.some(id => /^TT-\d+-\d+$/.test(id)), ledgerIds.join(','))
const reviewIds = S.list('reviews').map(r => r.id)
check('review ID đúng dạng RV-2026-xxxx', reviewIds.every(id => /^RV-2026-\d{4}$/.test(id)), reviewIds.join(','))
const reportIds = S.list('reports').map(r => r.id)
check('report ID đúng dạng RP-2026-xxxx', reportIds.every(id => /^RP-2026-\d{4}$/.test(id)), reportIds.join(','))

const snapshotBefore = S.order('OD-2026-0001').items[0].unitPrice
S.saveOffering({ id: 'OF-SVC-1005', tutorId: 'GS-05', patch: { price: 999000, termsVersion: 'v9' } })
check('sửa giá offering KHÔNG đổi snapshot đơn cũ', S.order('OD-2026-0007').items[0].unitPrice === 220000)
check('sửa offering không đổi đơn khác', S.order('OD-2026-0001').items[0].unitPrice === snapshotBefore)

/* ---------- 7. Chart dataset ---------- */
const badRange = S.revenueSeries({ tutorId: 'GS-05', from: '2026-10-01', to: '2026-09-01' })
check('from > to được báo invalid', badRange.invalid === true && badRange.reason === 'from-after-to')
const series = S.revenueSeries({ tutorId: 'GS-05', metric: 'tutorNetReleased', from: '2026-08-01', to: '2026-10-31' })
check('revenueSeries hợp lệ', series.invalid === false && series.rows.length > 0)
const revSum = S.revenueSummary('GS-05')
check('revenueSummary chỉ tính release (khớp chuỗi)', series.rows.reduce((s, r) => s + r.value, 0) === revSum.tutorNetReleased,
  `${series.rows.reduce((s, r) => s + r.value, 0)} != ${revSum.tutorNetReleased}`)
check('escrow không được tính vào doanh thu release',
  revSum.grossReleased === S.releasesOf('GS-05').reduce((sum, e) => sum + S.toInteger(e.grossReleased), 0))
check('heldSummary dẫn từ escrow: GS-01 đang giữ ký quỹ HD-20260919-024', S.heldSummary('GS-01') > 0,
  `GS-01 held=${S.heldSummary('GS-01')}`)
check('GS-05 không còn giữ ký quỹ sau khi các hợp đồng của bạn tất toán', S.heldSummary('GS-05') === 0,
  `GS-05 held=${S.heldSummary('GS-05')}`)
check('plannedSummary gắn đúng tutor của hợp đồng (FE-2026-0007 thuộc GS-01)',
  S.plannedSummary('GS-01') > 0 && S.plannedSummary('GS-05') === 0,
  `GS-01=${S.plannedSummary('GS-01')} GS-05=${S.plannedSummary('GS-05')}`)
const emptySeries = S.revenueSeries({ tutorId: 'GS-05', from: '2030-01-01', to: '2030-12-31' })
check('range không dữ liệu trả 0, không NaN', emptySeries.rows.length === 0 && emptySeries.total === 0 && Number.isFinite(emptySeries.total))
const split = S.splitRelease(1000000, 0.10)
check('splitRelease đúng bất biến', split.grossReleased === split.tutorNetReleased + split.platformFeeReleased && split.platformFeeReleased === 100000)
const zero = S.splitRelease(0, 0.10)
check('splitRelease(0) không NaN', zero.grossReleased === 0 && Number.isFinite(zero.tutorNetReleased))
const dist = S.orderStatusDistribution()
check('orderStatusDistribution có tổng > 0', dist.reduce((s, d) => s + d.count, 0) > 0)
const chDist = S.orderChannelDistribution()
check('orderChannelDistribution phủ 3 channel', chDist.length === 3 && chDist.every(c => c.count > 0))

/* ---------- 8. latestOfferings predicate ---------- */
const latest = S.latestOfferings(20)
check('latestOfferings chỉ public+open', latest.every(o => o.status === 'published' && o.availability === 'open'))
check('latestOfferings sort giảm dần publishedAt', latest.every((o, i) => i === 0 || new Date(latest[i - 1].publishedAt) >= new Date(o.publishedAt)))
check('latestOfferings loại unpublished', !latest.some(o => o.id === 'OF-GRP-2005'))
check('latestOfferings loại draft', !latest.some(o => o.id === 'OF-SVC-1007'))

/* ---------- 9. Payment result không mutate từ URL ---------- */
const before = JSON.stringify(S.state().payments)
const byQuery = S.resolvePaymentResult({ paymentId: 'PAY-2026-0003', queryStatus: 'success' })
check('query status=success KHÔNG biến pending thành verified', byQuery.state === 'pending' && byQuery.verified === false)
check('query status=success chỉ là presentation', byQuery.presentation === 'success-presentation-only')
check('financial store không đổi sau resolvePaymentResult', JSON.stringify(S.state().payments) === before)
const verifiedFixture = S.resolvePaymentResult({ paymentId: 'PAY-2026-0007' })
check('verified-success fixture nhận diện được', verifiedFixture.verified === true && verifiedFixture.presentation === 'success')
const missing = S.resolvePaymentResult({ paymentId: 'PAY-9999', queryStatus: 'success' })
check('paymentId không tồn tại -> missing, không fallback', missing.state === 'missing' && missing.record === null)

/* ---------- 10. Persistence: corrupt data không crash, không thay record khác ---------- */
sandbox.sessionStorage.setItem(S.STORE_KEY, '{ json hong')
check('store đọc được corruptReset khi nạp (cần reload)', typeof S.corruptReset === 'function')
sandbox.sessionStorage.setItem(S.STORE_KEY, JSON.stringify({ version: 999, orders: [] }))
check('isValidState từ chối version lạ', S.isValidState({ version: 999, orders: [] }) === false)
check('isValidState chấp nhận state hợp lệ', S.isValidState(S.baseline()) === true)
check('isValidState từ chối thiếu collection', S.isValidState({ version: 1 }) === false)
check('baseline wallets validate được bằng ownerId', S.isValidState(S.baseline()) === true)

/* ---------- 11. Admin account state ---------- */
const lockBad = S.setAccountState({ userId: 'STUDENT-01', accountState: 'locked', reason: 'ng' })
check('reason quá ngắn bị chặn', lockBad.ok === false && lockBad.reason === 'invalid-reason')
const lockOk = S.setAccountState({ userId: 'STUDENT-01', accountState: 'locked', reason: 'Vi phạm quy tắc cộng đồng' })
check('lock thành công', lockOk.ok === true && S.accountStateOf('STUDENT-01') === 'locked')
const lockAgain = S.setAccountState({ userId: 'STUDENT-01', accountState: 'locked', reason: 'Vi phạm quy tắc cộng đồng' })
check('lock lặp cùng trạng thái bị chặn', lockAgain.ok === false && (lockAgain.reason === 'already-in-state' || lockAgain.reason === 'duplicated'))
const unlock = S.setAccountState({ userId: 'STUDENT-01', accountState: 'active', reason: 'Đã xác minh và mở khóa' })
check('unlock thành công', unlock.ok === true && S.accountStateOf('STUDENT-01') === 'active')
const badState = S.setAccountState({ userId: 'STUDENT-01', accountState: 'admin-super', reason: 'Cố nâng quyền trái phép' })
check('trạng thái ngoài allowlist bị chặn', badState.ok === false && badState.reason === 'invalid-state')

/* ---------- 12. escapeHtml chống XSS ---------- */
check('escapeHtml thoát < > & " \'', S.escapeHtml(`<img src=x onerror="a&b">`) === '&lt;img src=x onerror=&quot;a&amp;b&quot;&gt;')

/* ---------- 12bis. Đối soát tiền mẫu: hợp đồng – release – payment – ví ----------
   Tính thẳng từ danh sách bản ghi, KHÔNG gọi helper của store, để phép thử là
   một thực thi độc lập (hai cách tính phải cho cùng một số). */
const RECEIVED_STATES = ['verified', 'refund_pending', 'refunded']
const releasesForId = contractId => S.list('financialEvents').filter(e => e.type === 'release' && e.contractId === contractId)
const grossReleasedOf = contractId => releasesForId(contractId).reduce((sum, e) => sum + S.toInteger(e.grossReleased), 0)
const sessionsReleasedOf = contractId => releasesForId(contractId).reduce((sum, e) => sum + (e.sessionsReleased || 0), 0)
const receivedOfContract = contract => {
  const order = S.order(contract.orderId)
  if (!order) return 0
  return S.list('payments').filter(p => p.orderId === order.id && RECEIVED_STATES.includes(p.status))
    .reduce((sum, p) => sum + S.toInteger(p.total), 0)
}
const refundedOut = contract => {
  const order = S.order(contract.orderId)
  return order && order.refund && order.refund.state === 'succeeded' ? S.toInteger(order.refund.amount) : 0
}
const heldOfContract = contract => Math.max(0, receivedOfContract(contract) - grossReleasedOf(contract.id) - refundedOut(contract))
const ownerSum = ownerId => S.list('contracts').filter(c => c.learnerId === ownerId || c.tutorId === ownerId)
  .reduce((sum, c) => sum + heldOfContract(c), 0)

const unfinished = S.list('contracts').filter(c => c.status === 'completed'
  && (grossReleasedOf(c.id) !== S.toInteger(c.total) || sessionsReleasedOf(c.id) !== c.sessions))
check('hợp đồng completed phải giải ngân hết total và đúng số buổi',
  unfinished.length === 0,
  unfinished.map(c => `${c.id}: released ${grossReleasedOf(c.id)}/${c.total} ₫ · sessions ${sessionsReleasedOf(c.id)}/${c.sessions}`).join(' | '))

const ghostHeld = S.list('contracts').filter(c => c.status === 'cancelled' && heldOfContract(c) !== 0)
check('hợp đồng đã hủy không còn giữ ký quỹ', ghostHeld.length === 0,
  ghostHeld.map(c => `${c.id} vẫn giữ ${heldOfContract(c)} ₫`).join(' | '))

const overHeld = S.list('contracts').filter(c => heldOfContract(c) > receivedOfContract(c))
check('ký quỹ đang giữ không vượt tiền đã nhận', overHeld.length === 0,
  overHeld.map(c => `${c.id} held ${heldOfContract(c)} > received ${receivedOfContract(c)}`).join(' | '))

const conservation = S.list('contracts').filter(c => {
  const received = receivedOfContract(c)
  if (!received) return heldOfContract(c) !== 0 || grossReleasedOf(c.id) !== 0
  return heldOfContract(c) + grossReleasedOf(c.id) + refundedOut(c) > received
})
check('bảo toàn tiền: held + released + refunded không vượt số đã nhận', conservation.length === 0,
  conservation.map(c => `${c.id}: held ${heldOfContract(c)} + released ${grossReleasedOf(c.id)} + refunded ${refundedOut(c)} > received ${receivedOfContract(c)}`).join(' | '))

const paymentMismatch = S.list('payments').filter(p => {
  if (!p.orderId) return false
  const order = S.order(p.orderId)
  return !order || S.toInteger(p.total) !== S.toInteger(order.total) || S.toInteger(p.walletUsed) + S.toInteger(p.payosDue) !== S.toInteger(p.total)
})
check('phiên thanh toán khớp total của đơn và walletUsed + payosDue = total', paymentMismatch.length === 0,
  paymentMismatch.map(p => { const o = S.order(p.orderId); return `${p.id} total ${p.total} vs đơn ${o ? o.total : '∅'} (wallet ${p.walletUsed} + payos ${p.payosDue})` }).join(' | '))

/* Điểm danh và giải ngân phải khớp nhau qua từng hợp đồng. */
const attendanceMismatch = S.list('contracts').filter(c => Array.isArray(c.attendance) && c.attendance.length
  && S.toInteger(c.completedSessions) !== c.attendance.filter(item => item.status !== 'absent').length)
check('completedSessions = số buổi điểm danh không vắng', attendanceMismatch.length === 0,
  attendanceMismatch.map(c => `${c.id}: completed ${c.completedSessions} vs attendance ${c.attendance.filter(i => i.status !== 'absent').length}`).join(' | '))

const gapsInAttendance = S.list('contracts').filter(c => Array.isArray(c.attendance) && c.attendance.length)
  .filter(c => {
    const lessons = c.attendance.map(item => Number(item.lesson)).sort((a, b) => a - b)
    return lessons.some((value, index) => value !== index + 1)
  })
check('attendance đánh dấu liên tục từ buổi 1, không nhảy số', gapsInAttendance.length === 0,
  gapsInAttendance.map(c => `${c.id}: ${c.attendance.map(i => i.lesson).join(',')}`).join(' | '))

const overReleased = S.list('contracts').filter(c => sessionsReleasedOf(c.id) > S.toInteger(c.completedSessions))
check('số buổi đã giải ngân không vượt số buổi đã điểm danh', overReleased.length === 0,
  overReleased.map(c => `${c.id}: released ${sessionsReleasedOf(c.id)} > completed ${c.completedSessions}`).join(' | '))

const noWallet = [...new Set(S.list('contracts').flatMap(c => [c.learnerId, c.tutorId]).filter(id => !S.walletOf(id)))]
check('mọi bên của hợp đồng đều có bản ghi ví', noWallet.length === 0, `thiếu ví: ${noWallet.join(', ')}`)

const negativeWallet = S.list('wallets').filter(w => S.toInteger(w.availableToUse) < 0)
check('số dư khả dụng không âm', negativeWallet.length === 0, negativeWallet.map(w => `${w.ownerId}=${w.availableToUse}`).join(' | '))

/* Không gian tên mã: một string không được vừa là mã tin vừa là mã bút toán.
   Trước khi đổi tiền to ledger, TT-8841 là CẢ HAI (job "Gia sư Tiếng Anh lớp 10"
   và bút toán escrow), nên trang ví và trang quản trị cùng hiển thị một mã cho hai vật. */
const stateNow = S.state()
const collections = Object.keys(stateNow).filter(key => Array.isArray(stateNow[key]))
const idOwner = new Map()
const sharedIds = []
collections.forEach(key => {
  stateNow[key].forEach(item => {
    if (!item || typeof item !== 'object') return
    const id = typeof item.id === 'string' ? item.id : (typeof item.ownerId === 'string' ? item.ownerId : null)
    if (!id) return
    const known = idOwner.get(id)
    if (known && known !== key) sharedIds.push(`${id}: ${known} vs ${key}`)
    else if (!known) idOwner.set(id, key)
  })
})
check('một mã chỉ thuộc đúng một bộ sưu tập', sharedIds.length === 0, sharedIds.slice(0, 8).join(' | '))
const prefixUse = {}
collections.forEach(key => {
  stateNow[key].forEach(item => {
    if (!item || typeof item !== 'object') return
    const id = String(item.id || item.ownerId || '')
    const match = /^([A-Z]{2,})-[0-9]+$/.exec(id)
    if (match) (prefixUse[match[1]] = prefixUse[match[1]] || new Set()).add(key)
  })
})
check('tiền tố TT- chỉ dành cho tin tìm gia sư', [...(prefixUse.TT || [])].join(',') === 'jobs',
  `TT- đang dùng bởi: ${[...(prefixUse.TT || [])].join(', ') || 'không'}`)
check('tiền tố BT- chỉ dành cho bút toán ví', [...(prefixUse.BT || [])].join(',') === 'ledger',
  `BT- đang dùng bởi: ${[...(prefixUse.BT || [])].join(', ') || 'không'}`)
check('mọi financialEvent tham chiếu ledgerId đều có dòng ledger thật',
  S.list('financialEvents').every(event => !event.ledgerId || S.list('ledger').some(row => row.id === event.ledgerId)),
  S.list('financialEvents').filter(event => event.ledgerId && !S.list('ledger').some(row => row.id === event.ledgerId)).map(event => `${event.id}→${event.ledgerId}`).join(' | '))

/* store.escrowOf phải khớp công thức độc lập ở nhóm này (hai cách tính, một con số). */
const escrowDrift = S.list('contracts').filter(c => S.toInteger(S.escrowOf(c.id)) !== heldOfContract(c))
check('store.escrowOf khớp công thức độc lập trên từng hợp đồng', escrowDrift.length === 0,
  escrowDrift.map(c => `${c.id}: store=${S.escrowOf(c.id)} độc lập=${heldOfContract(c)}`).join(' | '))
const ownerIds = [...new Set(S.list('contracts').flatMap(c => [c.learnerId, c.tutorId]))]
const ownerDrift = ownerIds.filter(id => S.toInteger(S.escrowHeldOf(id)) !== ownerSum(id))
check('store.escrowHeldOf khớp tổng escrow theo chủ ví', ownerDrift.length === 0,
  ownerDrift.map(id => `${id}: store=${S.escrowHeldOf(id)} độc lập=${ownerSum(id)}`).join(' | '))
check('walletSummary.escrowHeld = escrowHeldOf (một nguồn cho mọi trang)',
  ownerIds.every(id => S.walletSummary(id).escrowHeld === S.escrowHeldOf(id)),
  ownerIds.filter(id => S.walletSummary(id).escrowHeld !== S.escrowHeldOf(id)).join(', '))

/* Sự kiện tài chính phải gắn đúng tutor của hợp đồng nó tham chiếu. */
const wrongTutor = S.list('financialEvents').filter(e => {
  if (!e.contractId) return false
  const contract = S.contract(e.contractId)
  return !contract || contract.tutorId !== e.tutorId
})
check('mọi financialEvent gắn đúng tutorId của hợp đồng', wrongTutor.length === 0,
  wrongTutor.map(e => `${e.id}: ${e.tutorId} vs hợp đồng ${(S.contract(e.contractId) || {}).tutorId}`).join(' | '))

/* Mỗi đơn đã tất toán hoàn tiền phải có event refund tương ứng (escrow mới về 0 được). */
const missingRefundEvent = S.list('orders').filter(o => o.refund && o.refund.state === 'succeeded'
  && S.toInteger(o.refund.amount) > 0
  && o.contractId && !S.list('financialEvents').some(e => e.type === 'refund' && e.contractId === o.contractId))
check('refund succeeded nào cũng có event refund cùng số', missingRefundEvent.length === 0,
  missingRefundEvent.map(o => `${o.id} refund ${o.refund.amount} (hợp đồng ${o.contractId})`).join(' | '))

/* ---------- 12ter. releaseSession: học viên xác nhận buổi → giải ngân ----------
   Phải chạy TRƯỚC nhóm 13 (nhóm đó hủy OD-2026-0001, khiến hợp đồng terminal). */
const relContract = 'HD-20260919-024'
const relSnapshot = () => ({
  completed: S.contract(relContract).completedSessions,
  released: S.sessionsReleasedOf(relContract),
  escrow: S.escrowOf(relContract),
  wallet: S.walletOf('GS-01').availableToUse
})
const relBefore = relSnapshot()
check('fixture có đúng một buổi đã điểm danh nhưng chưa giải ngân',
  relBefore.completed - relBefore.released === 1, JSON.stringify(relBefore))
check('buổi chưa điểm danh không giải ngân được',
  S.releaseSession({ contractId: relContract, lessonNo: relBefore.completed + 1 }).ok === false
    && S.releaseSession({ contractId: relContract, lessonNo: relBefore.completed + 1 }).reason === 'lesson-not-attended')
check('lessonNo ngoài khoảng bị chặn',
  S.releaseSession({ contractId: relContract, lessonNo: 0 }).reason === 'invalid-lesson')
const relOk = S.releaseSession({ contractId: relContract, lessonNo: relBefore.completed, idempotency: 'rel-1' })
check('giải ngân buổi đã điểm danh thành công', relOk.ok === true && Boolean(relOk.data?.ledgerId), JSON.stringify(relOk))
check('release mới đúng bất biến gross = net + fee',
  relOk.data?.grossReleased === relOk.data?.tutorNetReleased + relOk.data?.platformFeeReleased, JSON.stringify(relOk.data))
check('release mới đúng bằng unitPrice của hợp đồng',
  relOk.data?.grossReleased === S.contract(relContract).unitPrice, `${relOk.data?.grossReleased}`)
const relAfter = relSnapshot()
check('escrow giảm đúng bằng gross vừa giải ngân',
  relAfter.escrow === relBefore.escrow - relOk.data.grossReleased, `${relAfter.escrow} vs ${relBefore.escrow - relOk.data.grossReleased}`)
check('ví gia sư tăng đúng bằng net (không phải gross)',
  relAfter.wallet === relBefore.wallet + relOk.data.tutorNetReleased, `${relAfter.wallet} vs ${relBefore.wallet + relOk.data.tutorNetReleased}`)
check('dòng ledger giải ngân thuộc đúng gia sư và loại release',
  S.list('ledger').some(l => l.id === relOk.data.ledgerId && l.ownerId === 'GS-01' && l.kind === 'release' && l.refId === relContract))
const relReplay = S.releaseSession({ contractId: relContract, lessonNo: relBefore.completed, idempotency: 'rel-1' })
check('bấm lặp theo idempotency không tạo release thứ hai', relReplay.ok === false && relReplay.reason === 'duplicated')
check('cùng buổi đó cũng bị chặn ở tầng nghiệp vụ',
  S.releaseSession({ contractId: relContract, lessonNo: relBefore.completed }).reason === 'already-released')
check('không còn buổi chờ xác nhận sau khi giải ngân',
  S.contract(relContract).completedSessions - S.sessionsReleasedOf(relContract) === 0)
const relTerminal = S.releaseSession({ contractId: 'HD-20260905-019', lessonNo: 1 })
check('hợp đồng đã hủy không giải ngân được', relTerminal.ok === false && relTerminal.reason === 'contract-terminal')
check('tổng giải ngân của GS-01 khớp chuỗi release event',
  S.revenueSummary('GS-01').grossReleased === S.releasesOf('GS-01').reduce((s, e) => s + S.toInteger(e.grossReleased), 0))

/* ---------- 12quinquies. sessionsOf: MỘT nguồn lịch cho cả hai trang hợp đồng ---------- */
const sess24 = S.sessionsOf('HD-20260919-024')
check('sessionsOf trả đúng số buổi của hợp đồng',
  sess24.length === S.contract('HD-20260919-024').sessions, `${sess24.length} buổi`)
check('buổi đã điểm danh dùng ngày thật của bản ghi attendance',
  sess24[6].source === 'attendance' && sess24[6].date === '08/10/2026', JSON.stringify(sess24[6]))
check('buổi chưa điểm danh bị đánh dấu là mốc suy diễn',
  sess24[7].source === 'suy-dien' && sess24[7].attendance === null, JSON.stringify(sess24[7]))
check('mốc suy diễn nối từ ngày điểm danh gần nhất (buổi 7 = 08/10 → buổi 8 = 10/10)',
  sess24[7].date === '10/10/2026', sess24[7].date)
const ascending = sess24.every((entry, index) => index === 0 || String(sess24[index - 1].iso) <= String(entry.iso))
check('các mốc buổi học không đi ngược thời gian', ascending,
  sess24.map(entry => entry.no + ':' + entry.date).join(' '))
check('hợp đồng chưa có attendance vẫn có đủ mốc (và nói rõ là suy diễn)',
  S.sessionsOf('HD-20260928-027').length === 24 && S.sessionsOf('HD-20260928-027').every(item => item.source === 'suy-dien'))
check('sessionsOf của mã không tồn tại trả rỗng, không ném lỗi', S.sessionsOf('HD-KHONG-TON-TAI').length === 0)

/* ---------- 12quater. markAttendance: gia sư điểm danh từng buổi ----------
   Trạng thái "chờ xác nhận" của trang học viên suy từ completedSessions − Σ sessionsReleased,
   nên điểm danh phải là dữ liệu thật trong store, không phải chữ ký hardcoded trong JS trang. */
const attContract = 'HD-20260919-024'
const attSnapshot = () => ({
  completed: S.contract(attContract).completedSessions,
  marked: S.attendanceOf(attContract).length,
  released: S.sessionsReleasedOf(attContract),
  escrow: S.escrowOf(attContract),
  wallet: S.walletOf('GS-01').availableToUse
})
const attBefore = attSnapshot()
check('trạng thái đầu: 7 buổi đã điểm danh và 7 buổi đã giải ngân',
  attBefore.marked === 7 && attBefore.completed === 7 && attBefore.released === 7, JSON.stringify(attBefore))
const att8 = S.markAttendance({ contractId: attContract, lessonNo: 8, status: 'late', note: 'Học viên đến muộn 10 phút nhưng học đủ 90 phút.', homework: 'Ôn chương phương trình.' })
check('điểm danh buổi kế tiếp thành công', att8.ok === true && att8.data?.completedSessions === 8, JSON.stringify(att8))
check('buổi late vẫn tính là đã diễn ra (tăng completedSessions)', att8.data?.completedSessions === attBefore.completed + 1)
const attDup = S.markAttendance({ contractId: attContract, lessonNo: 8, status: 'present' })
check('không đánh dấu lại cùng một buổi', attDup.ok === false && attDup.reason === 'already-marked')
const attJump = S.markAttendance({ contractId: attContract, lessonNo: 10, status: 'present' })
check('không được nhảy số buổi', attJump.ok === false && attJump.reason === 'not-next-lesson' && attJump.lastMarkedLesson === 8,
  JSON.stringify(attJump))
check('trạng thái điểm danh ngoài allowlist bị chặn',
  S.markAttendance({ contractId: attContract, lessonNo: 9, status: 'ghost' }).reason === 'invalid-attendance-status')
check('lessonNo ngoài khoảng hợp đồng bị chặn',
  S.markAttendance({ contractId: attContract, lessonNo: 99, status: 'present' }).reason === 'invalid-lesson')
check('note vượt 2000 ký tự bị chặn',
  S.markAttendance({ contractId: attContract, lessonNo: 9, status: 'present', note: 'x'.repeat(2001) }).reason === 'invalid-note-length')
const attAbsent = S.markAttendance({ contractId: attContract, lessonNo: 9, status: 'absent' })
check('buổi vắng mặt không tăng completedSessions',
  attAbsent.ok === true && S.contract(attContract).completedSessions === 8, JSON.stringify(attAbsent))
check('đánh dấu lại cùng buổi bị chặn ở tầng nghiệp vụ',
  S.markAttendance({ contractId: attContract, lessonNo: 9, status: 'present' }).reason === 'already-marked')
const releaseAbsent = S.releaseSession({ contractId: attContract, lessonNo: 9 })
check('buổi vắng mặt không giải ngân được (lesson-not-attended)',
  releaseAbsent.ok === false && releaseAbsent.reason === 'lesson-not-attended')
/* Điểm danh chỉ đi theo thứ tự: buổi 10 mở khóa sau khi buổi 9 đã được đánh dấu. */
const attIdemFirst = S.markAttendance({ contractId: attContract, lessonNo: 10, status: 'present', idempotency: 'att-10' })
check('bấm lặp theo idempotency không tạo lần đánh dấu thứ hai',
  attIdemFirst.ok === true
    && S.markAttendance({ contractId: attContract, lessonNo: 10, status: 'present', idempotency: 'att-10' }).reason === 'duplicated'
    && S.attendanceOf(attContract).filter(a => a.lesson === 10).length === 1)
check('hợp đồng đã hủy không điểm danh được',
  S.markAttendance({ contractId: 'HD-20260905-019', lessonNo: 1, status: 'present' }).reason === 'contract-terminal')
check('hợp đồng chờ thanh toán chưa có lớp nên không nhận điểm danh',
  S.markAttendance({ contractId: 'HD-20260928-027', lessonNo: 1, status: 'present' }).reason === 'contract-not-active')
const attWalletBefore = attSnapshot()
const releaseAtt8 = S.releaseSession({ contractId: attContract, lessonNo: 8 })
check('buổi late đã điểm danh thì giải ngân bình thường', releaseAtt8.ok === true)
check('escrow và ví sau release của buổi điểm danh: escrow −gross, ví +net',
  attSnapshot().escrow === attWalletBefore.escrow - releaseAtt8.data.grossReleased
    && attSnapshot().wallet === attWalletBefore.wallet + releaseAtt8.data.tutorNetReleased,
  JSON.stringify({ truoc: attWalletBefore, sau: attSnapshot() }))
check('sau mọi mutation, completedSessions vẫn khớp attendance không vắng',
  S.contract(attContract).completedSessions === S.attendanceOf(attContract).filter(a => a.status !== 'absent').length)
check('attendance của hợp đồng vẫn liên tục từ buổi 1',
  S.attendanceOf(attContract).map(a => a.lesson).sort((x, y) => x - y).join(',') === '1,2,3,4,5,6,7,8,9,10')

/* ---------- 12sexies. Bảng tin JOB: một nguồn dữ liệu + ứng tuyển/chọn hồ sơ thật ----------
   Trước nhóm này job/detail.js, job/applicants.js, job/my-job.js, job/discover.js và
   admin/job-review-data.js mỗi nơi giữ một bảng tin riêng, nên cùng một mã TT-8841 là
   "Tiếng Anh lớp 10" trong store nhưng "Toán lớp 11 tại Thủ Đức" trên bảng tin công khai,
   và trang applicants nối sang hợp đồng HD-20260926-018 / -011 vốn không tồn tại.
   Nhóm này chốt: tin, hồ sơ, số lượng và mốc nối đơn/hợp đồng đều đọc từ store. */
const board = S.jobBoard()
check('bảng tin chỉ gồm tin đã duyệt và đã đăng',
  board.every(j => j.status === 'approved' && Boolean(j.publishedAt)),
  board.filter(j => j.status !== 'approved' || !j.publishedAt).map(j => j.id).join(','))
check('bảng tin loại tin chờ duyệt (TT-8839, TT-8840)',
  !board.some(j => j.id === 'TT-8839' || j.id === 'TT-8840'))
check('bảng tin sắp theo ngày đăng giảm dần',
  board.every((j, i) => i === 0 || new Date(board[i - 1].publishedAt) >= new Date(j.publishedAt)),
  board.map(j => j.publishedAt).join(' '))
check('mọi pending job chưa có publishedAt (không lộ tin chưa duyệt)',
  F.jobs.filter(j => j.status === 'pending').every(j => !j.publishedAt))
check('mọi job closed trong fixture đều đã chọn gia sư',
  F.jobs.filter(j => j.availability === 'closed').every(j => Boolean(j.selectedApplicationId)),
  F.jobs.filter(j => j.availability === 'closed' && !j.selectedApplicationId).map(j => j.id).join(','))
check('một gia sư chỉ nộp một lượt trên một tin',
  new Set(F.applications.map(a => `${a.jobId}|${a.tutorId}`)).size === F.applications.length,
  F.applications.map(a => `${a.jobId}|${a.tutorId}`).join(','))
check('hồ sơ chỉ nộp vào tin đã duyệt',
  F.applications.every(a => F.jobs.find(j => j.id === a.jobId)?.status === 'approved'))
check('hồ sơ không nộp trước khi tin được đăng',
  F.applications.every(a => {
    const j = F.jobs.find(item => item.id === a.jobId)
    return !j?.publishedAt || new Date(a.createdAt) >= new Date(j.publishedAt)
  }),
  F.applications.filter(a => {
    const j = F.jobs.find(item => item.id === a.jobId)
    return j?.publishedAt && new Date(a.createdAt) < new Date(j.publishedAt)
  }).map(a => a.id).join(','))
check('đơn kênh JOB được tạo sau khi chọn hồ sơ',
  F.orders.filter(o => o.channel === 'JOB').every(o => {
    const app = F.applications.find(a => a.id === o.sourceRef?.id)
    return Boolean(app) && new Date(o.createdAt) >= new Date(app.createdAt)
  }))
check('contractOfJob lần ra hợp đồng thật qua hồ sơ được chọn → đơn',
  S.contractOfJob('TT-8833')?.id === 'HD-20260926-025',
  JSON.stringify(S.contractOfJob('TT-8833')?.id))
check('tin đã chọn gia sư nhưng chưa có đơn thì contractOfJob trả null (không bịa mã HD)',
  S.contractOfJob('TT-8838') === null && S.job('TT-8838').selectedApplicationId === 'APP-2026-0404')
check('tin chưa chọn gia sư không có hợp đồng', S.contractOfJob('TT-8835') === null)
check('applicationsOfJob đếm đúng số hồ sơ của từng tin',
  S.applicationsOfJob('TT-8841').length === F.applications.filter(a => a.jobId === 'TT-8841').length
    && S.applicationsOfJob('TT-8839').length === 0)
check('applicationOfTutor tìm theo cặp (tin, gia sư)',
  S.applicationOfTutor('TT-8841', 'GS-05')?.id === 'APP-2026-0401'
    && S.applicationOfTutor('TT-8841', 'GS-04') === null)
check('applicationsByTutor chỉ trả hồ sơ của gia sư đó',
  S.applicationsByTutor('GS-05').every(a => a.tutorId === 'GS-05')
    && S.applicationsByTutor('GS-05').length === F.applications.filter(a => a.tutorId === 'GS-05').length)
check('timeAgo deterministic với mốc now đưa vào',
  S.timeAgo('2026-10-09T09:00:00+07:00', '2026-10-09T11:00:00+07:00') === '2 giờ trước'
    && S.timeAgo('2026-10-06T09:00:00+07:00', '2026-10-09T09:00:00+07:00') === '3 ngày trước'
    && S.timeAgo('2026-10-09T09:00:00+07:00', '2026-10-09T09:00:00+07:00') === 'vừa đăng'
    && S.timeAgo(null) === 'chưa đăng',
  [S.timeAgo('2026-10-09T09:00:00+07:00', '2026-10-09T11:00:00+07:00'),
    S.timeAgo('2026-10-06T09:00:00+07:00', '2026-10-09T09:00:00+07:00')].join(' | '))

/* applyToJob — gia sư bấm "Ứng tuyển" phải tạo hồ sơ thật, không mở modal thành công suông. */
const jobEventsBefore = S.state().financialEvents.length
const jobLedgerBefore = S.state().ledger.length
const jobWalletTotal = () => S.state().wallets.reduce((sum, w) => sum + S.toInteger(w.availableToUse), 0)
const jobWalletBefore = jobWalletTotal()
const jobOrdersBefore = S.state().orders.length
const applied = S.applyToJob({
  jobId: 'TT-8837', tutorId: 'GS-01', proposedRate: 215000,
  message: 'Nhận kèm Ngữ văn cho học sinh lớp 12, có dàn ý mẫu.',
  slots: [{ day: 'Chủ nhật', time: '08:00 - 10:00' }]
})
check('applyToJob tạo hồ sơ mới với mã APP-2026-*',
  applied.ok === true && /^APP-2026-\d{4}$/.test(applied.data?.id) && applied.data.status === 'submitted',
  JSON.stringify(applied.data))
check('hồ sơ vừa nộp lưu đủ khung giờ đề xuất',
  S.application(applied.data.id)?.slots?.[0]?.day === 'Chủ nhật'
    && S.application(applied.data.id)?.proposedRate === 215000,
  JSON.stringify(S.application(applied.data.id)))
check('nộp lại cùng một tin bị chặn (already-applied)',
  S.applyToJob({ jobId: 'TT-8837', tutorId: 'GS-01', proposedRate: 215000 }).reason === 'already-applied')
check('không nộp được vào tin chờ duyệt',
  S.applyToJob({ jobId: 'TT-8839', tutorId: 'GS-01', proposedRate: 200000 }).reason === 'job-not-approved')
check('không nộp được vào tin đã đóng',
  S.applyToJob({ jobId: 'TT-8833', tutorId: 'GS-01', proposedRate: 200000 }).reason === 'job-closed')
check('học phí phải lớn hơn 0',
  S.applyToJob({ jobId: 'TT-8835', tutorId: 'GS-01', proposedRate: 0 }).reason === 'invalid-rate')
check('gia sư không tồn tại bị chặn',
  S.applyToJob({ jobId: 'TT-8835', tutorId: 'GS-99', proposedRate: 200000 }).reason === 'tutor-not-found')
check('tin không tồn tại bị chặn',
  S.applyToJob({ jobId: 'TT-9999', tutorId: 'GS-01', proposedRate: 200000 }).reason === 'job-not-found')
const idemApplied = S.applyToJob({ jobId: 'TT-8836', tutorId: 'GS-02', proposedRate: 175000, idempotency: 'job-apply-8836' })
check('idempotency chặn hồ sơ thứ hai khi bấm đúp',
  idemApplied.ok === true
    && S.applyToJob({ jobId: 'TT-8836', tutorId: 'GS-04', proposedRate: 175000, idempotency: 'job-apply-8836' }).reason === 'duplicated'
    && S.applicationsOfJob('TT-8836').filter(a => a.tutorId === 'GS-04').length === 0)
check('ứng tuyển không động vào tiền (events/ledger/ví giữ nguyên)',
  S.state().financialEvents.length === jobEventsBefore
    && S.state().ledger.length === jobLedgerBefore
    && jobWalletTotal() === jobWalletBefore)

/* selectApplication — phụ huynh chọn hồ sơ: đóng tin, từ chối các hồ sơ còn lại. */
const selectWrongOwner = S.selectApplication({ jobId: 'TT-8835', applicationId: 'APP-2026-0407', learnerId: 'HV-2001' })
check('người không phải chủ tin không chọn được hồ sơ', selectWrongOwner.reason === 'not-job-owner')
const selectCrossJob = S.selectApplication({ jobId: 'TT-8835', applicationId: 'APP-2026-0401', learnerId: 'HV-2007' })
check('hồ sơ của tin khác không chọn được', selectCrossJob.reason === 'application-not-found')
const selected = S.selectApplication({ jobId: 'TT-8835', applicationId: 'APP-2026-0407', learnerId: 'HV-2007' })
check('chọn hồ sơ thành công và gắn selectedApplicationId',
  selected.ok === true && S.job('TT-8835').selectedApplicationId === 'APP-2026-0407')
check('chọn hồ sơ thì tin đóng lại', S.job('TT-8835').availability === 'closed')
check('các hồ sơ còn lại của tin bị từ chối',
  S.application('APP-2026-0408')?.status === 'rejected'
    && S.applicationsOfJob('TT-8835').every(a => ['selected', 'rejected'].includes(a.status)))
check('không chọn lại hồ sơ đã selected',
  S.selectApplication({ jobId: 'TT-8835', applicationId: 'APP-2026-0407', learnerId: 'HV-2007' }).reason === 'job-closed')
check('tin đã đóng không cho thao tác chọn hồ sơ nữa',
  S.selectApplication({ jobId: 'TT-8833', applicationId: 'APP-2026-0405', learnerId: 'HV-2001' }).reason === 'job-closed')

/* closeJob — chủ tin đóng thủ công mà chưa chọn gia sư. */
const closeWrongOwner = S.closeJob({ jobId: 'TT-8836', learnerId: 'HV-2001' })
check('đóng tin của người khác bị chặn', closeWrongOwner.reason === 'not-job-owner')
const closed = S.closeJob({ jobId: 'TT-8836', learnerId: 'HV-2003' })
check('đóng tin thành công, hồ sơ đã nộp vẫn giữ để xem',
  closed.ok === true && S.job('TT-8836').availability === 'closed'
    && S.applicationsOfJob('TT-8836').length >= 3, JSON.stringify(S.job('TT-8836').availability))
check('đóng tin đã đóng bị chặn (job-not-open)',
  S.closeJob({ jobId: 'TT-8836', learnerId: 'HV-2003' }).reason === 'job-not-open')
check('đóng tin không tồn tại bị chặn', S.closeJob({ jobId: 'TT-9999' }).reason === 'job-not-found')
check('tin đóng thủ công không có selectedApplicationId (khác với tin đã chọn gia sư)',
  S.job('TT-8836').selectedApplicationId === null)
check('jobsByLearner chỉ trả tin của đúng người',
  S.jobsByLearner('HV-2001').every(j => j.learnerId === 'HV-2001')
    && S.jobsByLearner('HV-2001').some(j => j.id === 'TT-8833'))

/* 12sexies (tiếp) — hàng đợi kiểm duyệt admin đọc từ cùng một bảng jobs.
   Trang admin trước đây tự giữ `job-review-data.js` (9 tin, người đăng khác hẳn store)
   và ghi quyết định vào key riêng `educonnect:job-review-decisions:v1` = store thứ hai. */
check('mọi tin đều có submittedAt + scheduleText + qualification (trang duyệt tin cần mà không tự viết)',
  F.jobs.every(j => j.submittedAt && j.scheduleText && j.qualification),
  F.jobs.filter(j => !j.submittedAt || !j.scheduleText || !j.qualification).map(j => j.id).join(','))
check('jobBucket phân hoạch rõ: mọi tin rơi vào đúng một nhóm',
  F.jobs.every(j => S.JOB_QUEUE_BUCKETS.includes(S.jobBucket(j))),
  F.jobs.map(j => `${j.id}:${S.jobBucket(j)}`).join(','))
const queueAll = S.jobQueue('all')
check('jobQueue(all) phủ đủ mọi tin, không trùng',
  queueAll.length === F.jobs.length && new Set(queueAll.map(j => j.id)).size === F.jobs.length)
check('jobQueue sắp theo tin gửi lâu nhất trước (đọc SLA)',
  queueAll.every((j, i) => i === 0 || new Date(queueAll[i - 1].submittedAt) <= new Date(j.submittedAt)),
  queueAll.map(j => j.submittedAt).join(' '))
const counts = S.jobQueueCounts()
check('jobQueueCounts khớp với jobQueue từng nhóm (hai cách dẫn xuất phải cùng số)',
  S.JOB_QUEUE_BUCKETS.every(b => counts[b] === S.jobQueue(b).length)
    && S.JOB_QUEUE_BUCKETS.reduce((sum, b) => sum + counts[b], 0) === counts.total,
  JSON.stringify(counts))
check('baseline fixture phân hoạch 2 pending / 4 hiring / 3 closed / 0 rejected',
  S.JOB_QUEUE_BUCKETS.map(b => F.jobs.filter(j => S.jobBucket(j) === b).length).join(',') === '2,4,3,0',
  S.JOB_QUEUE_BUCKETS.map(b => `${b}:${F.jobs.filter(j => S.jobBucket(j) === b).length}`).join(' '))
check('hàng đợi pending chỉ chứa tin chưa duyệt',
  S.jobQueue('pending').every(j => j.status === 'pending')
    && S.jobQueue('pending').map(j => j.id).sort().join(',') === 'TT-8839,TT-8840',
  S.jobQueue('pending').map(j => j.id).join(','))
check('jobPoster lấy người đăng từ learner, không viết tay',
  S.jobPoster('TT-8841')?.name === S.learner(S.job('TT-8841').learnerId).name
    && S.jobPoster('TT-8841')?.initials === S.learner(S.job('TT-8841').learnerId).initials)
check('jobPoster phân loại vai trò theo cấp học của người đăng',
  S.jobPoster('TT-8835')?.role === 'Học viên đi làm' && S.jobPoster('TT-8841')?.role === 'Phụ huynh',
  JSON.stringify([S.jobPoster('TT-8835'), S.jobPoster('TT-8841')]))
check('jobPoster của mã tin sai trả null', S.jobPoster('TT-9999') === null)
const approved = S.decideJob({ jobId: 'TT-8839', decision: 'approve', reviewerId: 'ADMIN-01', note: 'Nội dung hợp lệ, không lộ thông tin liên hệ.' })
check('duyệt tin pending: status approved, có publishedAt và hết hạn 30 ngày',
  approved.ok === true && S.job('TT-8839').status === 'approved'
    && Boolean(S.job('TT-8839').publishedAt)
    && Math.round((new Date(S.job('TT-8839').expiresAt) - new Date(S.job('TT-8839').publishedAt)) / 86400000) === 30,
  JSON.stringify(S.job('TT-8839').decision))
check('tin vừa duyệt lập tức xuất hiện trên bảng tin công khai',
  S.jobBoard().some(j => j.id === 'TT-8839'))
check('quyết định lưu vết kiểm duyệt viên và ghi chú (audit trail)',
  S.job('TT-8839').decision?.reviewerId === 'ADMIN-01'
    && S.job('TT-8839').decision?.action === 'approve'
    && S.job('TT-8839').decision?.note.startsWith('Nội dung hợp lệ'))

/* Lỗi tìm ra khi browser-verify: trang admin truyền `getPersona()?.id` của phiên đang mở,
   nên phụ huynh đứng tên quyết định kiểm duyệt — audit log nói dối. Store phải chặn theo role. */
const nonAdminBefore = `${S.job('TT-8837').status}/${S.job('TT-8837').availability}`
check('phụ huynh không ghi được quyết định kiểm duyệt (reviewer-not-admin)',
  S.decideJob({ jobId: 'TT-8837', reviewerId: 'PARENT-01', decision: 'reject', note: 'Nội dung không phù hợp.' }).reason === 'reviewer-not-admin')
check('phiên gia sư cũng bị chặn khi duyệt tin',
  S.decideJob({ jobId: 'TT-8837', reviewerId: 'TUTOR-01', decision: 'close' }).reason === 'reviewer-not-admin')
check('thiếu reviewerId thì chặn, không âm thầm đứng tên người khác',
  S.decideJob({ jobId: 'TT-8837', reviewerId: null, decision: 'close' }).reason === 'reviewer-not-admin')
check('persona lạ (không tồn tại) không ghi được quyết định',
  S.decideJob({ jobId: 'TT-8837', reviewerId: 'ROLE-KHONG-TON-TAI', decision: 'close' }).reason === 'reviewer-not-admin')
check('bốn lần chặn trên không làm tin đổi trạng thái',
  `${S.job('TT-8837').status}/${S.job('TT-8837').availability}` === nonAdminBefore,
  `${S.job('TT-8837').status}/${S.job('TT-8837').availability} != ${nonAdminBefore}`)
check('quản trị thật vẫn ghi được quyết định sau các lần chặn',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8837', decision: 'close', note: 'Gỡ tin theo yêu cầu người đăng.' }).ok === true
    && S.job('TT-8837').decision?.reviewerId === 'ADMIN-01')
/* Trả TT-8837 về nhóm hiring để chuỗi assertion phía dưới (đóng/mở lại + đếm dịch chuyển)
   chạy trên đúng trạng thái nó mô tả — block này chỉ chứng minh role, không được đổi dữ liệu vĩnh viễn. */
check('mở lại đưa tin về hiring cho các kiểm tra kế tiếp',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8837', decision: 'reopen' }).ok === true
    && S.jobBucket(S.job('TT-8837')) === 'hiring')
check('duyệt lại tin đã duyệt bị chặn (invalid-transition)',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8839', decision: 'approve' }).reason === 'invalid-transition')
check('duyệt tin đang đăng công khai bị chặn',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8837', decision: 'approve' }).reason === 'invalid-transition')
check('quyết định ngoài allowlist bị chặn',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8837', decision: 'delete' }).reason === 'invalid-decision')
check('từ chối không có lý do bị chặn (reason-required)',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8840', decision: 'reject', note: '' }).reason === 'reason-required')
check('lý do từ chối quá ngắn bị chặn',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8840', decision: 'reject', note: ' Sai' }).reason === 'reason-required')
const rejected = S.decideJob({ jobId: 'TT-8840', decision: 'reject', reviewerId: 'ADMIN-01', note: 'Tin chứa tài khoản liên hệ ngoài nền tảng.' })
check('từ chối: status rejected và rời bảng tin',
  rejected.ok === true && S.job('TT-8840').status === 'rejected' && !S.jobBoard().some(j => j.id === 'TT-8840'))
check('từ chối không xóa signal đã có', S.job('TT-8840').signal.includes('liên hệ ngoài'))
check('đếm hàng đợi dịch chuyển đúng sau hai quyết định',
  S.jobQueueCounts().pending === counts.pending - 2
    && S.jobQueueCounts().hiring === counts.hiring + 1
    && S.jobQueueCounts().rejected === counts.rejected + 1,
  JSON.stringify({ truoc: counts, sau: S.jobQueueCounts() }))
check('tin rejected không duyệt lại được',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8840', decision: 'approve' }).reason === 'invalid-transition')
check('từ chối lại tin đã từ chối bị chặn',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8840', decision: 'reject', note: 'Lý do thứ hai đủ dài.' }).reason === 'invalid-transition')
const closedByAdmin = S.decideJob({ jobId: 'TT-8837', decision: 'close', reviewerId: 'ADMIN-01', note: 'Gỡ tin theo yêu cầu người đăng.' })
check('admin đóng tin đang tuyển', closedByAdmin.ok === true && S.jobBucket(S.job('TT-8837')) === 'closed')
check('đóng lại tin đã đóng bị chặn',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8837', decision: 'close' }).reason === 'invalid-transition')
check('mở lại tin đã đóng đưa tin về hàng tuyển',
  S.decideJob({ jobId: 'TT-8837', decision: 'reopen', reviewerId: 'ADMIN-01' }).ok === true
    && S.jobBucket(S.job('TT-8837')) === 'hiring')
check('mở lại tin đang tuyển bị chặn',
  S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8837', decision: 'reopen' }).reason === 'invalid-transition')
const idemDecide = S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8841', decision: 'close', idempotency: 'admin-close-8841' })
check('idempotency chặn quyết định lặp khi bấm đúp',
  idemDecide.ok === true
    && S.decideJob({ reviewerId: 'ADMIN-01', jobId: 'TT-8837', decision: 'reopen', idempotency: 'admin-close-8841' }).reason === 'duplicated'
    && S.job('TT-8837').availability === 'open',
  JSON.stringify(idemDecide))
check('quyết định kiểm duyệt không tạo bản ghi tiền nào',
  S.state().financialEvents.length === jobEventsBefore
    && S.state().ledger.length === jobLedgerBefore
    && jobWalletTotal() === jobWalletBefore
    && S.state().orders.length === jobOrdersBefore)
check('kiểm duyệt không xóa hồ sơ ứng tuyển đã nộp',
  S.applicationsOfJob('TT-8840').length === 0 && S.applicationsOfJob('TT-8833').length === 3)

/* ---------- 12septies. INVITATION: thương lượng là bản ghi thật, không phải chữ ký trong JS trang ----------
   invitation/create.js giữ `const TUTORS = {…}` và negotiation.js giữ `const invitations = {…} + versions = [...]`,
   nên "gửi lời mời" không lại được trang thương lượng và các phiên bản đề xuất không có chủ sở hữu thật. */
check('mọi lời mời fixture dùng trạng thái nằm trong INVITATION_STATUS',
  F.invitations.every(i => S.INVITATION_STATUS.includes(i.status)),
  F.invitations.filter(i => !S.INVITATION_STATUS.includes(i.status)).map(i => `${i.id}:${i.status}`).join(','))
check('acceptedProposal trả đúng phiên bản đã chốt của fixture',
  S.acceptedProposal('INV-20261009-024')?.version === 2
    && S.acceptedProposal('INV-20261009-024')?.pricePerSession === 210000)
check('lời mời đang thương lượng chưa có snapshot chấp nhận',
  S.acceptedProposal('INV-20261009-018') === null
    && S.currentProposal(S.invitation('INV-20261009-018'))?.version === 1)
check('lời mời đã từ chối/trạng thái cuối không có proposal pending',
  F.invitations.filter(i => S.INVITATION_TERMINAL.includes(i.status))
    .every(i => !i.proposals.some(p => p.status === 'pending')))
const invitationsBefore = S.state().invitations.length
const invited = S.createInvitation({
  learnerId: 'HV-2001', tutorId: 'GS-02', offeringId: 'OF-SVC-1002',
  message: 'Em cần lộ trình IELTS 6.5 trong 3 tháng.',
  proposal: { pricePerSession: 240000, sessions: 30, durationMinutes: 90, scheduleText: 'Thứ 2 & Thứ 6, 19:00 – 20:30' }
})
check('createInvitation tạo lời mời pending với đề xuất phiên bản 1 do người học gửi',
  invited.ok === true && invited.data.status === 'pending'
    && invited.data.currentVersion === 1 && invited.data.proposals.length === 1
    && invited.data.proposals[0].by === 'learner' && invited.data.proposals[0].status === 'pending',
  JSON.stringify(invited.data))
check('mã lời mời mới theo đúng khuôn INV-YYYYMMDD-NNN của fixture',
  /^INV-\d{8}-\d{3}$/.test(invited.data.id), invited.data.id)
check('lời mời lưu snapshot giá/số buổi/thời lượng ngay lúc gửi',
  S.invitation(invited.data.id).proposals[0].pricePerSession === 240000
    && S.invitation(invited.data.id).proposals[0].sessions === 30
    && S.invitation(invited.data.id).proposals[0].durationMinutes === 90)
check('createInvitation từ chối offering không thuộc gia sư được mời',
  S.createInvitation({ learnerId: 'HV-2001', tutorId: 'GS-01', offeringId: 'OF-SVC-1002', proposal: { pricePerSession: 200000, sessions: 20, durationMinutes: 90 } }).reason === 'offering-not-of-tutor')
check('createInvitation từ chối offering chưa công khai',
  S.createInvitation({ learnerId: 'HV-2001', tutorId: 'GS-13', offeringId: 'OF-SVC-1007', proposal: { pricePerSession: 150000, sessions: 12, durationMinutes: 90 } }).reason === 'offering-not-listable')
check('createInvitation từ chối offering không tồn tại',
  S.createInvitation({ learnerId: 'HV-2001', tutorId: 'GS-02', offeringId: 'OF-KHONG', proposal: { pricePerSession: 200000, sessions: 20, durationMinutes: 90 } }).reason === 'offering-not-found')
check('createInvitation từ chối gia sư không tồn tại',
  S.createInvitation({ learnerId: 'HV-2001', tutorId: 'GS-99', offeringId: 'OF-SVC-1002', proposal: { pricePerSession: 200000, sessions: 20, durationMinutes: 90 } }).reason === 'tutor-not-found')
check('createInvitation đòi người học đăng nhập',
  S.createInvitation({ tutorId: 'GS-02', offeringId: 'OF-SVC-1002', proposal: { pricePerSession: 200000, sessions: 20, durationMinutes: 90 } }).reason === 'learner-required')
check('đề xuất thiếu số buổi/giá bị chặn',
  S.createInvitation({ learnerId: 'HV-2001', tutorId: 'GS-02', offeringId: 'OF-SVC-1002', proposal: { pricePerSession: 240000, sessions: 0, durationMinutes: 90 } }).reason === 'invalid-proposal')
check('không mở hai lời mời cùng lúc cho một dịch vụ',
  S.createInvitation({ learnerId: 'HV-2001', tutorId: 'GS-02', offeringId: 'OF-SVC-1002', proposal: { pricePerSession: 240000, sessions: 30, durationMinutes: 90 } }).reason === 'invitation-open-exists')
check('đối tác không tự duyệt đề xuất của mình',
  S.respondInvitation({ invitationId: invited.data.id, by: 'learner', decision: 'accept' }).reason === 'cannot-answer-own-proposal')
check('người ngoài cuộc không phản hồi được',
  S.respondInvitation({ invitationId: invited.data.id, by: 'admin', decision: 'accept' }).reason === 'invalid-side')
check('quyết định ngoài allowlist bị chặn',
  S.respondInvitation({ invitationId: invited.data.id, by: 'tutor', decision: 'maybe' }).reason === 'invalid-decision')
check('lời mời không tồn tại bị chặn',
  S.respondInvitation({ invitationId: 'INV-20991231-001', by: 'tutor', decision: 'accept' }).reason === 'invitation-not-found')
const countered = S.respondInvitation({
  invitationId: invited.data.id, by: 'tutor', decision: 'counter',
  note: 'Xin điều chỉnh theo thời lượng chuẩn bị bài.',
  proposal: { pricePerSession: 260000, sessions: 30, durationMinutes: 90, scheduleText: 'Thứ 2 & Thứ 6, 19:00 – 20:30' }
})
check('counter tạo phiên bản 2 và chuyển phiên bản 1 thành countered',
  countered.ok === true && S.invitation(invited.data.id).currentVersion === 2
    && S.invitation(invited.data.id).proposals[0].status === 'countered'
    && S.invitation(invited.data.id).proposals[1].version === 2
    && S.invitation(invited.data.id).proposals[1].by === 'tutor'
    && S.invitation(invited.data.id).proposals[1].status === 'pending',
  JSON.stringify(S.invitation(invited.data.id).proposals))
check('counter đưa lời mời về trạng thái negotiating', S.invitation(invited.data.id).status === 'negotiating')
check('counter thiếu đề xuất bị chặn',
  S.respondInvitation({ invitationId: invited.data.id, by: 'learner', decision: 'counter' }).reason === 'invalid-proposal')
check('phiên bản mới mang mức giá của người phản hồi, không lấy lại giá cũ',
  S.currentProposal(S.invitation(invited.data.id)).pricePerSession === 260000)
const accepted = S.respondInvitation({ invitationId: invited.data.id, by: 'learner', decision: 'accept', note: 'Đồng ý 260.000đ/buổi.' })
check('chấp nhận khóa lời mời ở trạng thái accepted',
  accepted.ok === true && S.invitation(invited.data.id).status === 'accepted'
    && S.acceptedProposal(invited.data.id)?.version === 2
    && S.acceptedProposal(invited.data.id)?.pricePerSession === 260000)
check('chấp nhận lưu bên quyết và thời điểm', S.invitation(invited.data.id).resolvedBy === 'learner'
  && Boolean(S.invitation(invited.data.id).resolvedAt))
check('lời mời đã chốt không thương lượng tiếp',
  S.respondInvitation({ invitationId: invited.data.id, by: 'tutor', decision: 'counter', proposal: { pricePerSession: 250000, sessions: 30, durationMinutes: 90 } }).reason === 'invitation-terminal')
const second = S.createInvitation({
  learnerId: 'HV-2002', tutorId: 'GS-05', offeringId: 'OF-SVC-1005',
  proposal: { pricePerSession: 200000, sessions: 16, durationMinutes: 90, scheduleText: 'Thứ 3, 18:00 – 19:30' }
})
check('từ chối đưa lời mời về declined và proposal thành declined',
  second.ok === true
    && S.respondInvitation({ invitationId: second.data.id, by: 'tutor', decision: 'decline', note: 'Lịch trùng học kỳ.' }).ok === true
    && S.invitation(second.data.id).status === 'declined'
    && S.invitation(second.data.id).proposals[0].status === 'declined')
check('tạo hai lời mời không mở lại được cho cùng offering (terminal cho phép mở lại)',
  S.createInvitation({ learnerId: 'HV-2002', tutorId: 'GS-05', offeringId: 'OF-SVC-1005', proposal: { pricePerSession: 210000, sessions: 16, durationMinutes: 90 } }).ok === true)
check('invitationsOfLearner và invitationsOfTutor lọc đúng vai',
  S.invitationsOfLearner('HV-2001').every(i => i.learnerId === 'HV-2001')
    && S.invitationsOfTutor('GS-02').every(i => i.tutorId === 'GS-02')
    && S.invitationsOfTutor('GS-02').length >= 2)
check('thương lượng lời mời không tự tạo đơn hay động vào tiền',
  S.state().orders.length === jobOrdersBefore
    && S.state().financialEvents.length === jobEventsBefore
    && S.state().ledger.length === jobLedgerBefore
    && jobWalletTotal() === jobWalletBefore
    && S.state().invitations.length === invitationsBefore + 3)

/* ---------- 13. Đồng bộ trạng thái đơn → hợp đồng (đặt cuối: hai thao tác này mutate đơn đã thanh toán) ---------- */
const syncOrder = 'OD-2026-0001'
const syncContractNode = S.contractByOrder(syncOrder)
check('đơn OD-2026-0001 có hợp đồng liên kết để đối chiếu', Boolean(syncContractNode))
const syncContractBefore = syncContractNode.status
const syncCancel = S.cancelOrder({ orderId: syncOrder, reason: 'Gia đình thay kế hoạch nên xin tạm dừng', policyCode: 'after-first-session' })
check('hủy đơn đã thanh toán một phần được', syncCancel.ok === true)
check(
  'hợp đồng theo đơn: cancellation_pending',
  S.contractByOrder(syncOrder).status === 'cancellation_pending',
  `trước=${syncContractBefore} sau=${S.contractByOrder(syncOrder).status} (đơn=${S.order(syncOrder).status})`
)
const syncRefund = S.completeRefund(syncOrder)
check(
  'hoàn tiền xong thì hợp đồng chuyển cancelled theo đơn',
  syncRefund.ok === true && S.order(syncOrder).status === 'cancelled' && S.contractByOrder(syncOrder).status === 'cancelled'
)
check('hủy không tự ý chuyển hợp đồng completed', S.contractByOrder(syncOrder).status !== 'completed')

/* Report façade must satisfy both queue and detail consumers. */
S.commit(S.baseline())
S.resetIdempotency()
vm.runInContext(readFileSync(resolve(UI, 'js/pages/admin/report-data.js'), 'utf8'), context, { filename: 'report-data.js' })
const reportFacade = sandbox.EduReport
const reportView = reportFacade.get('RP-2026-0011')
check('report façade được export', Boolean(reportFacade))
check('report evidence có cấu trúc renderer cần', reportView.evidence.length > 0 && reportView.evidence.every(file => typeof file.name === 'string' && typeof file.kind === 'string' && typeof file.meta === 'string'))
check('report detail có timeline/excerpt/resolutions', Array.isArray(reportView.timeline) && Array.isArray(reportView.excerpt) && Array.isArray(reportView.resolutions) && reportView.resolutions.length > 0)
check('report reference giữ đúng target', reportView.reference === reportView.targetId && typeof reportView.referenceLabel === 'string')
check('report không có ID không fallback record khác', !reportFacade.get('UNKNOWN-REPORT'))
check('report façade từ chối event không có', reportFacade.decide(reportView.id, { status: 'unknown' }).ok === false)
check('report façade nêu đúng giới hạn ghi chú', reportFacade.bounds.summaryMin === 10 && reportFacade.bounds.summaryMax === 600)
const reportDecision = reportFacade.decide(reportView.id, { status: 'resolved', note: 'Đã đối chiếu lịch hẹn và ghi nhận kết luận trong dữ liệu mẫu.' })
check('report decision trả record trong result.report', reportDecision.ok === true && reportDecision.report.status === 'resolved')
check('report decision không xử lý lặp', reportFacade.decide(reportView.id, { status: 'dismissed', note: 'Không thay đổi kết luận đã lưu trong dữ liệu mẫu.' }).ok === false)

/* ---------- Kết quả ---------- */
console.log(`PASS: ${passes.length}`)
if (failures.length) {
  console.log(`FAIL: ${failures.length}`)
  failures.forEach(f => console.log(`  - ${f}`))
  process.exitCode = 1
} else {
  console.log('FAIL: 0')
}
