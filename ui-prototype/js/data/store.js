/**
 * STORE DEMO DÙNG CHUNG — façade duy nhất để các trang đọc/ghi dữ liệu mẫu.
 *
 * PHẠM VI: prototype UI thuần. sessionStorage chỉ đồng bộ trong CÙNG TAB và CÙNG ORIGIN.
 * Không có server, không xác thực, không phân quyền thật, không persistence liên thiết bị.
 * Việc lọc theo persona chỉ phục vụ preview — server authorization là việc khác, chưa triển khai.
 *
 * Quy tắc ghi: clone → mutate → validate → persist → commit/render.
 * Nếu persist thất bại, state KHÔNG được commit và hàm trả { ok:false, reason:'storage-failed' }.
 */
(() => {
  const FIX = window.EduFixtures
  if (!FIX) throw new Error('EduStore: cần nạp js/data/fixtures.js trước js/data/store.js')

  /* v3: but toan doi tien to TT- -> BT- de TT- con la ma tin tim gia su duy nhat
     (TT-8841 tung la ca ma but toan lan ma tin). */
  const STATE_VERSION = 4
  /* Key đổi theo version: state cũ không được âm thầm đọc lại sau khi fixture tiền đổi
     (escrow/refunded không còn là field cứng, event gắn đúng tutor, thêm release/payment
     còn thiếu). Key v1 được dọn có kiểm soát ở LEGACY_KEYS bên dưới. */
  const STORE_KEY = `educonnect:demo-store:v${STATE_VERSION}`
  const SESSION_KEY = 'educonnect:session:v1'
  const CART_KEY = 'educonnect:cart:v1'
  const IDEMPOTENCY_KEY = 'educonnect:idempotency:v1'
  const CURRENCY = FIX.CURRENCY

  const moneyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 })
  const numberFormatter = new Intl.NumberFormat('vi-VN')

  const formatMoney = value => moneyFormatter.format(Math.round(Number(value) || 0))
  const formatNumber = value => numberFormatter.format(Number(value) || 0)
  const toInteger = value => Math.round(Number(value) || 0)

  const formatDate = (iso, withTime = false) => {
    if (!iso) return '—'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '—'
    return new Intl.DateTimeFormat('vi-VN', withTime
      ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
  }

  const clone = value => JSON.parse(JSON.stringify(value))

  /* ------------------------------------------------------------------ */
  /* Bảng status / event / action dùng chung                             */
  /* ------------------------------------------------------------------ */

  /** Không dùng một chuỗi `pending` chung cho nhiều khái niệm. */
  const ORDER_STATUS = Object.freeze({
    created: { key: 'created', label: 'Mới tạo', badge: 'badge--neutral', terminal: false, actions: ['continue-contract', 'cancel'] },
    awaiting_payment: { key: 'awaiting_payment', label: 'Chờ thanh toán', badge: 'badge--warning', terminal: false, actions: ['pay', 'cancel'] },
    active: { key: 'active', label: 'Đang thực hiện', badge: 'badge--info', terminal: false, actions: ['view-contract', 'cancel', 'report'] },
    completed: { key: 'completed', label: 'Hoàn tất', badge: 'badge--success', terminal: true, actions: ['view-contract', 'review', 'report'] },
    cancellation_pending: { key: 'cancellation_pending', label: 'Đang chờ hủy', badge: 'badge--warning', terminal: false, actions: ['view-refund'] },
    cancelled: { key: 'cancelled', label: 'Đã hủy', badge: 'badge--danger', terminal: true, actions: ['view-refund'] }
  })

  const PAYMENT_STATUS = Object.freeze({
    unpaid: { key: 'unpaid', label: 'Chưa thanh toán', badge: 'badge--neutral', terminal: false },
    pending: { key: 'pending', label: 'Phiên QR đang chờ', badge: 'badge--warning', terminal: false },
    verified: { key: 'verified', label: 'Đã xác nhận', badge: 'badge--success', terminal: true },
    failed: { key: 'failed', label: 'Thất bại', badge: 'badge--danger', terminal: true },
    expired: { key: 'expired', label: 'Hết hạn', badge: 'badge--neutral', terminal: true },
    cancelled: { key: 'cancelled', label: 'Đã hủy phiên QR', badge: 'badge--neutral', terminal: true },
    refunded: { key: 'refunded', label: 'Đã hoàn', badge: 'badge--info', terminal: true },
    refund_pending: { key: 'refund_pending', label: 'Đang chờ hoàn', badge: 'badge--warning', terminal: false }
  })

  /** Refund state KHÁC cancellation state. */
  const REFUND_STATE = Object.freeze({
    none: { key: 'none', label: 'Không có hoàn tiền', badge: 'badge--neutral', terminal: true },
    pending: { key: 'pending', label: 'Đang chờ hoàn tiền', badge: 'badge--warning', terminal: false },
    succeeded: { key: 'succeeded', label: 'Đã hoàn tiền', badge: 'badge--success', terminal: true },
    failed: { key: 'failed', label: 'Hoàn tiền thất bại', badge: 'badge--danger', terminal: true }
  })

  const CANCELLATION_STATE = Object.freeze({
    none: { key: 'none', label: 'Không có yêu cầu hủy', badge: 'badge--neutral' },
    pending: { key: 'pending', label: 'Yêu cầu hủy đang chờ', badge: 'badge--warning' },
    cancelled: { key: 'cancelled', label: 'Đã hủy', badge: 'badge--danger' },
    rejected: { key: 'rejected', label: 'Yêu cầu hủy bị từ chối', badge: 'badge--info' }
  })

  const CONTRACT_STATUS = Object.freeze({
    draft: { key: 'draft', label: 'Bản nháp', badge: 'badge--neutral', terminal: false },
    awaiting_payment: { key: 'awaiting_payment', label: 'Chờ thanh toán', badge: 'badge--warning', terminal: false },
    active: { key: 'active', label: 'Đang hiệu lực', badge: 'badge--info', terminal: false },
    completed: { key: 'completed', label: 'Đã hoàn tất', badge: 'badge--success', terminal: true },
    cancellation_pending: { key: 'cancellation_pending', label: 'Đang chờ hủy', badge: 'badge--warning', terminal: false },
    cancelled: { key: 'cancelled', label: 'Đã hủy', badge: 'badge--danger', terminal: true }
  })

  const OFFERING_STATUS = Object.freeze({
    draft: { key: 'draft', label: 'Bản nháp', badge: 'badge--neutral', actions: ['edit', 'submit', 'close'] },
    in_review: { key: 'in_review', label: 'Chờ duyệt', badge: 'badge--warning', actions: [] },
    published: { key: 'published', label: 'Đang công khai', badge: 'badge--success', actions: ['edit', 'close'] },
    rejected: { key: 'rejected', label: 'Bị từ chối', badge: 'badge--danger', actions: ['edit', 'submit'] },
    unpublished: { key: 'unpublished', label: 'Ngừng công khai', badge: 'badge--neutral', actions: ['edit', 'publish'] },
    closed: { key: 'closed', label: 'Đã đóng', badge: 'badge--neutral', actions: ['edit'] }
  })

  const OFFERING_TRANSITIONS = Object.freeze({
    draft: ['in_review', 'closed'],
    in_review: ['published', 'rejected'],
    rejected: ['in_review', 'closed'],
    published: ['unpublished', 'closed'],
    unpublished: ['published', 'closed'],
    closed: []
  })

  const REVIEW_STATE = Object.freeze({ draft: 'Bản nháp', published: 'Đã hiển thị công khai', hidden: 'Đã ẩn' })

  const REPORT_STATE = Object.freeze({
    open: { key: 'open', label: 'Mới tiếp nhận', badge: 'badge--warning', terminal: false, actions: ['investigate', 'resolve', 'dismiss'] },
    investigating: { key: 'investigating', label: 'Đang xác minh', badge: 'badge--info', terminal: false, actions: ['resolve', 'dismiss'] },
    resolved: { key: 'resolved', label: 'Đã xử lý', badge: 'badge--success', terminal: true, actions: [] },
    dismissed: { key: 'dismissed', label: 'Đã từ chối', badge: 'badge--neutral', terminal: true, actions: [] }
  })

  const REPORT_REASONS = Object.freeze([
    { code: 'wrong-schedule', label: 'Sai lịch hẹn' },
    { code: 'no-show', label: 'Vắng mặt không báo' },
    { code: 'content', label: 'Nội dung không đúng mô tả' },
    { code: 'conduct', label: 'Hành vi không phù hợp' },
    { code: 'payment', label: 'Vấn đề tiền/học phí' },
    { code: 'other', label: 'Khác' }
  ])

  const CHANNELS = Object.freeze([
    { key: 'INVITATION', label: 'Qua lời mời' },
    { key: 'JOB', label: 'Qua tin tìm gia sư' },
    { key: 'GROUP_CLASS', label: 'Qua lớp nhóm' }
  ])

  /* ------------------------------------------------------------------ */
  /* Baseline state                                                      */
  /* ------------------------------------------------------------------ */

  const SHAPES = ['offerings', 'orders', 'contracts', 'payments', 'wallets', 'financialEvents', 'ledger', 'reviews', 'reports', 'enrollments', 'invitations', 'jobs', 'applications']

  const baseline = () => {
    const state = { version: STATE_VERSION, corruptReset: false }
    SHAPES.forEach(key => { state[key] = clone(FIX[key]) })
    return state
  }

  /** `wallets` định danh bằng ownerId, không phải id — validate theo đúng khoá của từng tập. */
  const ID_KEYS = Object.freeze({ wallets: 'ownerId' })

  const isValidState = candidate => {
    if (!candidate || typeof candidate !== 'object') return false
    if (Number(candidate.version) !== STATE_VERSION) return false
    return SHAPES.every(key => Array.isArray(candidate[key]) && candidate[key].every(item => {
      if (!item || typeof item !== 'object') return false
      const idKey = ID_KEYS[key] || 'id'
      return typeof item[idKey] === 'string' && item[idKey].length > 0
    }))
  }

  const readJson = (key, fallback) => {
    try {
      const raw = window.sessionStorage.getItem(key)
      if (!raw) return fallback
      const parsed = JSON.parse(raw)
      return parsed === null || parsed === undefined ? fallback : parsed
    } catch (error) {
      return fallback
    }
  }

  const writeJson = (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      return false
    }
  }

  /* Migrate key cũ có kiểm soát — KHÔNG dùng sessionStorage.clear().
     Danh sách SUY RA từ STATE_VERSION: tăng version là các key cũ tự được dọn, không thể quên. */
  const LEGACY_KEYS = Array.from({ length: Math.max(0, STATE_VERSION - 1) }, (_, index) => `educonnect:demo-store:v${index}`)
  const migrateLegacyKeys = () => {
    const migrated = []
    LEGACY_KEYS.forEach(key => {
      try {
        if (window.sessionStorage.getItem(key) !== null) {
          window.sessionStorage.removeItem(key)
          migrated.push(key)
        }
      } catch (error) { /* bỏ qua nếu storage bị chặn */ }
    })
    return migrated
  }

  let state = (() => {
    const migrated = migrateLegacyKeys()
    const stored = readJson(STORE_KEY, null)
    if (stored && isValidState(stored)) return stored
    const fresh = baseline()
    if (stored !== null) fresh.corruptReset = true
    fresh.migratedLegacyKeys = migrated
    return fresh
  })()

  const snapshot = () => clone(state)

  /** Commit: validate → persist → thay state. Trả ok:false nếu không lưu được. */
  const commit = next => {
    if (!isValidState(next)) return { ok: false, reason: 'invalid-state' }
    const candidate = clone(next)
    candidate.corruptReset = state.corruptReset
    if (!writeJson(STORE_KEY, candidate)) return { ok: false, reason: 'storage-failed' }
    state = candidate
    document.dispatchEvent(new CustomEvent('edu-store:change', { detail: { reason: 'commit' } }))
    return { ok: true }
  }

  /** Thực thi một mutation trên bản clone; không commit nếu mutation báo lỗi. */
  const mutate = (fn, options = {}) => {
    const draft = clone(state)
    let result
    try {
      result = fn(draft)
    } catch (error) {
      return { ok: false, reason: 'mutation-failed', message: error.message }
    }
    if (result && result.ok === false) return result
    const committed = commit(draft)
    if (!committed.ok) return committed
    return { ok: true, data: result && result.data !== undefined ? result.data : result }
  }

  /* ------------------------------------------------------------------ */
  /* Idempotency — bấm lặp không tạo hai bản ghi                        */
  /* ------------------------------------------------------------------ */

  const idempotencySet = () => new Set(readJson(IDEMPOTENCY_KEY, []))

  const hasRun = key => idempotencySet().has(key)

  const markRun = key => {
    const set = idempotencySet()
    set.add(key)
    return writeJson(IDEMPOTENCY_KEY, Array.from(set))
  }

  /**
   * Chạy `fn` đúng một lần cho mỗi `key`. Nếu đã chạy, trả kết quả cũ kèm duplicated:true.
   * `fn` phải là mutate() để lỗi storage không bị nuốt.
   */
  const once = (key, fn) => {
    if (hasRun(key)) return { ok: false, reason: 'duplicated', duplicated: true, key }
    const result = fn()
    if (result && result.ok === true) {
      if (!markRun(key)) return { ok: false, reason: 'storage-failed', key }
      return Object.assign({ idempotencyKey: key }, result)
    }
    return result
  }

  const resetIdempotency = () => writeJson(IDEMPOTENCY_KEY, [])

  /* ------------------------------------------------------------------ */
  /* Session / persona                                                   */
  /* ------------------------------------------------------------------ */

  const DEFAULT_PERSONA_ID = 'PARENT-01'

  /**
   * Không truyền id → trả persona CỦA PHIÊN ĐANG MỞ. Trước đây hàm này luôn trả
   * DEFAULT_PERSONA_ID kể cả khi `setSession('TUTOR-01')` đã ghi, nên nó bất đồng với
   * `sessionTutorId()`/`sessionLearnerId()` (đọc getSession) và các trang suy vai trò từ
   * getPersona() dựng sai persona sau khi đổi vai demo.
   */
  const getPersona = (id = null) => {
    const target = id || getSession().personaId || DEFAULT_PERSONA_ID
    return FIX.personas.find(persona => persona.id === target) || FIX.personas[0]
  }

  const getSession = () => {
    const stored = readJson(SESSION_KEY, null)
    const personaId = stored && typeof stored.personaId === 'string' ? stored.personaId : null
    const persona = personaId ? FIX.personas.find(item => item.id === personaId) : null
    return persona ? { personaId: persona.id, persona } : { personaId: DEFAULT_PERSONA_ID, persona: getPersona(DEFAULT_PERSONA_ID) }
  }

  const setSession = personaId => {
    const persona = FIX.personas.find(item => item.id === personaId)
    if (!persona) return { ok: false, reason: 'unknown-persona' }
    if (!writeJson(SESSION_KEY, { personaId: persona.id, at: new Date().toISOString() })) return { ok: false, reason: 'storage-failed' }
    return { ok: true, persona }
  }

  const clearSession = () => {
    try { window.sessionStorage.removeItem(SESSION_KEY) } catch (error) { return { ok: false, reason: 'storage-failed' } }
    return { ok: true }
  }

  /** Đăng nhập DEMO: thất bại không đổi persona. Không phải auth thật. */
  const login = (identifier, personaId) => {
    const persona = FIX.personas.find(item => item.email === String(identifier || '').trim().toLowerCase() || item.id === personaId)
    if (!persona) return { ok: false, reason: 'invalid-credentials', personaId: getSession().personaId }
    const result = setSession(persona.id)
    return result.ok ? { ok: true, persona } : result
  }

  const logout = () => clearSession()

  /* ------------------------------------------------------------------ */
  /* Reader helpers                                                      */
  /* ------------------------------------------------------------------ */

  const find = (collection, id) => (Array.isArray(state[collection]) ? state[collection].find(item => item.id === id) || null : null)

  const list = collection => (Array.isArray(state[collection]) ? clone(state[collection]) : [])

  const tutor = id => FIX.tutors.find(item => item.id === id) || null
  const learner = id => FIX.learners.find(item => item.id === id) || null
  const persona = id => FIX.personas.find(item => item.id === id) || null

  const offering = id => find('offerings', id)
  const order = id => find('orders', id)
  const contract = id => find('contracts', id)
  const payment = id => find('payments', id)
  const job = id => find('jobs', id)
  const invitation = id => find('invitations', id)
  const review = id => find('reviews', id)
  const report = id => find('reports', id)

  const contractByOrder = orderId => state.contracts.find(item => item.orderId === orderId) || null
  const orderById = id => state.orders.find(item => item.id === id) || null
  const ordersByLearner = learnerId => state.orders.filter(item => item.learnerId === learnerId)
  const offeringsByTutor = tutorId => state.offerings.filter(item => item.tutorId === tutorId)
  const reviewsByTutor = tutorId => state.reviews.filter(item => item.tutorId === tutorId && item.status === 'published')
  const paymentsByOrder = orderId => state.payments.filter(item => item.orderId === orderId)
  const walletOf = ownerId => state.wallets.find(item => item.ownerId === ownerId) || null

  const isPubliclyListable = item => item.status === 'published' && item.availability === 'open'
  const seatsLeft = item => (item.type === 'GROUP_CLASS' ? Math.max(0, Number(item.capacity || 0) - Number(item.enrolled || 0)) : null)

  /** Sắp xếp "mới công khai": ưu tiên publishedAt, tie-break theo ID. */
  const latestOfferings = (limit = 6) => state.offerings
    .filter(isPubliclyListable)
    .filter(item => Boolean(item.publishedAt))
    .slice()
    .sort((a, b) => {
      const diff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      return diff !== 0 ? diff : String(a.id).localeCompare(String(b.id))
    })
    .slice(0, limit)

  const nextId = (prefix, collection) => nextIdIn(state[collection] || [], prefix)

  const nowIso = () => new Date().toISOString()

  /* ------------------------------------------------------------------ */
  /* Tin tìm gia sư (JOB) — mọi reader dẫn xuất; trang không tự giữ bảng  */
  /* ------------------------------------------------------------------ */

  const application = id => find('applications', id)
  const applicationsOfJob = jobId => state.applications.filter(item => item.jobId === jobId)
  const applicationsByTutor = tutorId => state.applications.filter(item => item.tutorId === tutorId)
  const applicationOfTutor = (jobId, tutorId) =>
    state.applications.find(item => item.jobId === jobId && item.tutorId === tutorId) || null
  const jobsByLearner = learnerId => state.jobs.filter(item => item.learnerId === learnerId)

  /** Bảng tin công khai: tin đã duyệt và đã đăng; tin đã đóng vẫn hiện nhưng không nhận hồ sơ. */
  const jobBoard = () => state.jobs
    .filter(item => item.status === 'approved' && Boolean(item.publishedAt))
    .slice()
    .sort((a, b) => {
      const diff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      return diff !== 0 ? diff : String(a.id).localeCompare(String(b.id))
    })

  /** Đơn hàng sinh ra từ một hồ sơ ứng tuyển được chọn (kênh JOB). */
  const orderByApplication = applicationId =>
    state.orders.find(item => item.channel === 'JOB' && item.sourceRef?.id === applicationId) || null

  /** Hợp đồng của tin: suy từ application được chọn → đơn → hợp đồng, không ghi tay mã HD. */
  const contractOfJob = jobId => {
    const job = find('jobs', jobId)
    if (!job?.selectedApplicationId) return null
    const orderRecord = orderByApplication(job.selectedApplicationId)
    if (!orderRecord) return null
    return orderRecord.contractId ? find('contracts', orderRecord.contractId) : contractByOrder(orderRecord.id)
  }

  /**
   * Mốc thời gian tương đối cho bảng tin. Dùng `now` bất kỳ để kiểm tra được trong store-check
   * (mặc định là giờ thật của máy đang xem demo).
   */
  const timeAgo = (iso, now = nowIso()) => {
    if (!iso) return 'chưa đăng'
    const then = new Date(iso).getTime()
    const reference = new Date(now).getTime()
    if (!Number.isFinite(then) || !Number.isFinite(reference)) return '—'
    const minutes = Math.floor((reference - then) / 60000)
    if (minutes <= 0) return 'vừa đăng'
    if (minutes < 60) return `${minutes} phút trước`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} ngày trước`
    return `ngày ${formatDate(iso)}`
  }

  const JOB_APPLICATION_STATUS = Object.freeze(['submitted', 'shortlisted', 'selected', 'rejected', 'withdrawn'])

  /**
   * Gia sư nộp hồ sơ vào một tin. Chặn: tin không tồn tại / chưa duyệt / đã đóng /
   * học phí không hợp lệ / một gia sư chỉ được nộp một lượt trên cùng một tin.
   */
  const applyToJob = ({ jobId, tutorId, proposedRate = 0, message = '', slots = [], idempotency = null } = {}) => {
    let failure = null
    const apply = draft => {
      const job = draft.jobs.find(item => item.id === jobId)
      if (!job) { failure = { reason: 'job-not-found' }; return null }
      if (job.status !== 'approved') { failure = { reason: 'job-not-approved' }; return null }
      if (job.availability !== 'open') { failure = { reason: 'job-closed' }; return null }
      if (!FIX.tutors.some(item => item.id === tutorId)) { failure = { reason: 'tutor-not-found' }; return null }
      if (toInteger(proposedRate) <= 0) { failure = { reason: 'invalid-rate' }; return null }
      const existing = draft.applications.find(item => item.jobId === jobId && item.tutorId === tutorId)
      if (existing && existing.status !== 'withdrawn') { failure = { reason: 'already-applied', applicationId: existing.id }; return null }
      const record = {
        id: nextIdIn(draft.applications, 'APP-2026-'),
        jobId,
        tutorId,
        proposedRate: toInteger(proposedRate),
        message: String(message),
        status: 'submitted',
        slots: slots.map(slot => ({ day: String(slot.day), time: String(slot.time) })),
        createdAt: nowIso()
      }
      draft.applications.push(record)
      return record
    }
    const run = () => {
      const result = mutate(apply)
      if (failure) return { ok: false, ...failure }
      return result
    }
    return idempotency ? once(idempotency, run) : run()
  }

  /**
   * Phụ huynh chọn một hồ sơ: hồ sơ thành `selected`, các hồ sơ còn lại của tin bị `rejected`,
   * tin chuyển sang `closed` và gắn `selectedApplicationId`. Không tự tạo đơn/hợp đồng —
   * đơn theo kênh JOB do người dùng tạo ở luồng đặt dịch vụ, để tiền không tự sinh ra.
   */
  const selectApplication = ({ jobId, applicationId, learnerId, idempotency = null } = {}) => {
    let failure = null
    const apply = draft => {
      const job = draft.jobs.find(item => item.id === jobId)
      if (!job) { failure = { reason: 'job-not-found' }; return null }
      if (learnerId && job.learnerId !== learnerId) { failure = { reason: 'not-job-owner' }; return null }
      if (job.availability !== 'open') { failure = { reason: 'job-closed' }; return null }
      const chosen = draft.applications.find(item => item.id === applicationId && item.jobId === jobId)
      if (!chosen) { failure = { reason: 'application-not-found' }; return null }
      if (!['submitted', 'shortlisted'].includes(chosen.status)) { failure = { reason: 'application-not-selectable', status: chosen.status }; return null }
      chosen.status = 'selected'
      job.selectedApplicationId = chosen.id
      job.availability = 'closed'
      draft.applications
        .filter(item => item.jobId === jobId && item.id !== chosen.id && ['submitted', 'shortlisted'].includes(item.status))
        .forEach(item => { item.status = 'rejected' })
      return { job, application: chosen }
    }
    const run = () => {
      const result = mutate(apply)
      if (failure) return { ok: false, ...failure }
      return result
    }
    return idempotency ? once(idempotency, run) : run()
  }

  /** Đóng tin mà chưa chọn gia sư: không nhận thêm hồ sơ, giữ các hồ sơ đã nộp để xem. */
  const closeJob = ({ jobId, learnerId, idempotency = null } = {}) => {
    let failure = null
    const apply = draft => {
      const job = draft.jobs.find(item => item.id === jobId)
      if (!job) { failure = { reason: 'job-not-found' }; return null }
      if (learnerId && job.learnerId !== learnerId) { failure = { reason: 'not-job-owner' }; return null }
      if (job.availability !== 'open') { failure = { reason: 'job-not-open', availability: job.availability }; return null }
      job.availability = 'closed'
      return job
    }
    const run = () => {
      const result = mutate(apply)
      if (failure) return { ok: false, ...failure }
      return result
    }
    return idempotency ? once(idempotency, run) : run()
  }

  /* --------- Kiểm duyệt tin (admin) — hàng đợi SUY RA từ jobs, không có store thứ hai -------- */

  const JOB_QUEUE_BUCKETS = Object.freeze(['pending', 'hiring', 'closed', 'rejected'])

  /**
   * Nhóm trạng thái hiển thị của một tin theo đúng từ vựng hàng đợi kiểm duyệt đang có:
   * pending = chưa duyệt; hiring = đã duyệt còn nhận hồ sơ; closed = đã duyệt, đã đóng; rejected = bị từ chối.
   */
  const jobBucket = item => {
    if (item.status === 'pending') return 'pending'
    if (item.status === 'rejected') return 'rejected'
    return item.availability === 'open' ? 'hiring' : 'closed'
  }

  const jobQueue = (bucket = 'all') => state.jobs
    .slice()
    .sort((a, b) => {
      const diff = new Date(a.submittedAt || a.publishedAt || 0).getTime() - new Date(b.submittedAt || b.publishedAt || 0).getTime()
      return diff !== 0 ? diff : String(a.id).localeCompare(String(b.id))
    })
    .filter(item => bucket === 'all' || jobBucket(item) === bucket)

  const jobQueueCounts = () => {
    const counts = { all: state.jobs.length, total: state.jobs.length }
    JOB_QUEUE_BUCKETS.forEach(bucket => { counts[bucket] = 0 })
    state.jobs.forEach(item => { counts[jobBucket(item)] += 1 })
    return counts
  }

  /** Người đăng tin: tên/initials/vai trò lấy từ learner, không viết tay ở trang admin. */
  const jobPoster = jobId => {
    const item = find('jobs', jobId)
    const person = item ? learner(item.learnerId) : null
    if (!person) return null
    return {
      name: person.name,
      initials: person.initials,
      role: person.grade === 'Người đi làm' ? 'Học viên đi làm' : 'Phụ huynh',
      district: person.district,
      responseRate: person.responseRate,
      learnerId: person.id
    }
  }

  const JOB_DECISIONS = Object.freeze(['approve', 'reject', 'close', 'reopen'])

  /**
   * Quản trị quyết định một tin. Từ chối phải có lý do ≥ 10 ký tự (giữ quy tắc UI đang có).
   * Duyệt thì tin được đăng ngay (publishedAt = now, hết hạn sau 30 ngày) và xuất hiện trên bảng tin.
   * Không tạo tiền, không tạo đơn — chỉ đổi trạng thái kiểm duyệt/đóng mở.
   */
  const decideJob = ({ jobId, decision, reviewerId = null, note = '', idempotency = null } = {}) => {
    let failure = null
    const apply = draft => {
      const item = draft.jobs.find(job => job.id === jobId)
      if (!item) { failure = { reason: 'job-not-found' }; return null }
      /* Vết kiểm duyệt phải ghi ĐÚNG người quyết định. Persona không có role 'admin' mà duyệt tin
         thì audit log sẽ nói dối (đã xảy ra khi trang truyền getPersona()?.id của phiên phụ huynh). */
      const reviewer = FIX.personas.find(persona => persona.id === reviewerId)
      if (!reviewer || reviewer.role !== 'admin') { failure = { reason: 'reviewer-not-admin', reviewerId: reviewerId || null }; return null }
      if (!JOB_DECISIONS.includes(decision)) { failure = { reason: 'invalid-decision', decision }; return null }
      const bucket = jobBucket(item)
      if (decision === 'approve' && bucket !== 'pending') { failure = { reason: 'invalid-transition', bucket }; return null }
      if (decision === 'reject' && bucket === 'rejected') { failure = { reason: 'invalid-transition', bucket }; return null }
      if (decision === 'close' && bucket !== 'hiring') { failure = { reason: 'invalid-transition', bucket }; return null }
      if (decision === 'reopen' && bucket !== 'closed') { failure = { reason: 'invalid-transition', bucket }; return null }
      if (decision === 'reject' && String(note).trim().length < 10) { failure = { reason: 'reason-required' }; return null }
      const at = nowIso()
      if (decision === 'approve') {
        item.status = 'approved'
        item.availability = 'open'
        item.publishedAt = at
        item.expiresAt = new Date(new Date(at).getTime() + 30 * 86400000).toISOString()
      } else if (decision === 'reject') {
        item.status = 'rejected'
        item.signal = item.signal || String(note).trim()
      } else if (decision === 'close') {
        item.availability = 'closed'
      } else {
        item.availability = 'open'
      }
      item.decision = { action: decision, reviewerId: reviewerId ? String(reviewerId) : null, note: String(note), at }
      return item
    }
    const run = () => {
      const result = mutate(apply)
      if (failure) return { ok: false, ...failure }
      return result
    }
    return idempotency ? once(idempotency, run) : run()
  }

  /* ------------------------------------------------------------------ */
  /* Lời mời & thương lượng (INVITATION) — một nguồn cho create + negotiation */
  /* ------------------------------------------------------------------ */

  const INVITATION_STATUS = Object.freeze(['pending', 'negotiating', 'accepted', 'declined', 'expired'])
  const INVITATION_TERMINAL = Object.freeze(['accepted', 'declined', 'expired'])

  const invitationsOfLearner = learnerId => state.invitations.filter(item => item.learnerId === learnerId)
  const invitationsOfTutor = tutorId => state.invitations.filter(item => item.tutorId === tutorId)

  const currentProposal = invitation => {
    if (!invitation) return null
    return invitation.proposals.find(item => item.version === invitation.currentVersion) || null
  }

  /** Mã lời mời theo ngày: INV-<YYYYMMDD>-<số thứ tự trong ngày>, cùng khuôn với fixture đang có. */
  const nextInvitationId = (items, at) => {
    const dayKey = String(toDateKey(at) || '').replace(/-/g, '')
    const prefix = `INV-${dayKey}-`
    const used = items
      .map(item => String(item.id))
      .filter(id => id.startsWith(prefix))
      .map(id => Number(id.slice(prefix.length)))
      .filter(value => Number.isFinite(value))
    const max = used.length ? Math.max.apply(null, used) : 0
    return `${prefix}${String(max + 1).padStart(3, '0')}`
  }

  const normalizeProposal = proposal => ({
    pricePerSession: toInteger(proposal?.pricePerSession),
    sessions: toInteger(proposal?.sessions),
    durationMinutes: toInteger(proposal?.durationMinutes),
    scheduleText: String(proposal?.scheduleText || '')
  })

  /** Người học gửi lời mời kèm đề xuất đầu tiên cho một dịch vụ/lớp của gia sư. */
  const createInvitation = ({ learnerId, tutorId, offeringId, message = '', proposal, idempotency = null } = {}) => {
    let failure = null
    const apply = draft => {
      if (!learnerId) { failure = { reason: 'learner-required' }; return null }
      const tutor = FIX.tutors.find(item => item.id === tutorId)
      if (!tutor) { failure = { reason: 'tutor-not-found' }; return null }
      const offering = draft.offerings.find(item => item.id === offeringId)
      if (!offering) { failure = { reason: 'offering-not-found' }; return null }
      if (offering.tutorId !== tutorId) { failure = { reason: 'offering-not-of-tutor' }; return null }
      if (!isPubliclyListable(offering)) { failure = { reason: 'offering-not-listable' }; return null }
      const shape = normalizeProposal(proposal)
      if (shape.pricePerSession <= 0 || shape.sessions <= 0 || shape.durationMinutes <= 0) { failure = { reason: 'invalid-proposal' }; return null }
      const duplicated = draft.invitations.find(item =>
        item.learnerId === learnerId && item.offeringId === offeringId && !INVITATION_TERMINAL.includes(item.status))
      if (duplicated) { failure = { reason: 'invitation-open-exists', invitationId: duplicated.id }; return null }
      const at = nowIso()
      const record = {
        id: nextInvitationId(draft.invitations, at),
        learnerId,
        tutorId,
        offeringId,
        status: 'pending',
        currentVersion: 1,
        createdAt: at,
        message: String(message),
        proposals: [Object.assign({ version: 1, by: 'learner', status: 'pending', createdAt: at }, shape)]
      }
      draft.invitations.push(record)
      return record
    }
    const run = () => {
      const result = mutate(apply)
      if (failure) return { ok: false, ...failure }
      return result
    }
    return idempotency ? once(idempotency, run) : run()
  }

  /**
   * Phản hồi một đề xuất: `accept`/`decline` chỉ do NGƯỜI CÒN LẠI quyết (không tự duyệt đề xuất của mình);
   * `counter` thay đề xuất hiện hành bằng phiên bản mới và đưa lời mời về `negotiating`.
   */
  const respondInvitation = ({ invitationId, by, decision, proposal = null, note = '', idempotency = null } = {}) => {
    let failure = null
    const apply = draft => {
      const item = draft.invitations.find(invitation => invitation.id === invitationId)
      if (!item) { failure = { reason: 'invitation-not-found' }; return null }
      if (INVITATION_TERMINAL.includes(item.status)) { failure = { reason: 'invitation-terminal', status: item.status }; return null }
      if (!['learner', 'tutor'].includes(by)) { failure = { reason: 'invalid-side' }; return null }
      const active = currentProposal(item)
      if (!active) { failure = { reason: 'no-active-proposal' }; return null }
      if (active.by === by) { failure = { reason: 'cannot-answer-own-proposal' }; return null }
      const at = nowIso()
      if (decision === 'counter') {
        const shape = normalizeProposal(proposal)
        if (shape.pricePerSession <= 0 || shape.sessions <= 0 || shape.durationMinutes <= 0) { failure = { reason: 'invalid-proposal' }; return null }
        active.status = 'countered'
        const version = item.currentVersion + 1
        item.proposals.push(Object.assign({
          version, by, status: 'pending', createdAt: at, note: String(note)
        }, shape))
        item.currentVersion = version
        item.status = 'negotiating'
        return item
      }
      if (decision === 'accept' || decision === 'decline') {
        active.status = decision === 'accept' ? 'accepted' : 'declined'
        if (note) active.note = String(note)
        item.status = decision === 'accept' ? 'accepted' : 'declined'
        item.resolvedBy = by
        item.resolvedAt = at
        return item
      }
      failure = { reason: 'invalid-decision', decision }; return null
    }
    const run = () => {
      const result = mutate(apply)
      if (failure) return { ok: false, ...failure }
      return result
    }
    return idempotency ? once(idempotency, run) : run()
  }

  /** snapshot đề xuất đã chấp nhận — nguồn duy nhất để dựng đơn (channel INVITATION). */
  const acceptedProposal = invitationId => {
    const item = find('invitations', invitationId)
    if (!item || item.status !== 'accepted') return null
    return item.proposals.find(proposal => proposal.status === 'accepted') || null
  }

  /* ------------------------------------------------------------------ */
  /* Tiền: total / held / released / fee — các khái niệm riêng           */
  /* ------------------------------------------------------------------ */

  const itemTotal = item => toInteger(Number(item.unitPrice) * Number(item.sessions) * Number(item.seats || 1))

  const orderTotal = items => items.reduce((sum, item) => sum + itemTotal(item), 0)

  /** grossReleased = tutorNetReleased + platformFeeReleased (bất biến). */
  const splitRelease = (gross, feeRate) => {
    const rate = Number.isFinite(Number(feeRate)) ? Number(feeRate) : FIX.DEMO_FEE_RATE
    const grossAmount = toInteger(gross)
    const fee = toInteger(grossAmount * rate)
    return { grossReleased: grossAmount, platformFeeReleased: fee, tutorNetReleased: grossAmount - fee, feeRateSnapshot: rate }
  }

  const releasesOf = tutorId => state.financialEvents.filter(event => event.type === 'release' && (!tutorId || event.tutorId === tutorId))

  /** Doanh thu CHỈ tính từ release event. held/planned/withdrawal không vào doanh thu. */
  const revenueSummary = tutorId => releasesOf(tutorId).reduce((acc, event) => ({
    grossReleased: acc.grossReleased + toInteger(event.grossReleased),
    tutorNetReleased: acc.tutorNetReleased + toInteger(event.tutorNetReleased),
    platformFeeReleased: acc.platformFeeReleased + toInteger(event.platformFeeReleased)
  }), { grossReleased: 0, tutorNetReleased: 0, platformFeeReleased: 0 })

  /**
   * Ký quỹ (escrow) của MỘT hợp đồng, dẫn xuất một nơi duy nhất:
   * tiền đã thực nhận qua các phiên thanh toán − phần đã giải ngân − phần đã hoàn về ví.
   * Trước đây escrowHeld là field cứng trong fixtures và trùng với sự kiện 'hold'; ba trang
   * đọc ba nguồn nên HV-2001 hiện 5.040.000 ₫ trong khi hợp đồng chỉ còn giữ 3.780.000 ₫.
   */
  const RECEIVED_STATES = Object.freeze(['verified', 'refund_pending', 'refunded'])
  const orderOfContract = contract => state.orders.find(item => item.id === contract.orderId) || null
  const receivedOf = contract => {
    const order = orderOfContract(contract)
    if (!order) return 0
    return state.payments
      .filter(payment => payment.orderId === order.id && RECEIVED_STATES.includes(payment.status))
      .reduce((sum, payment) => sum + toInteger(payment.total), 0)
  }
  const grossReleasedOf = contractId => state.financialEvents
    .filter(event => event.type === 'release' && event.contractId === contractId)
    .reduce((sum, event) => sum + toInteger(event.grossReleased), 0)
  const succeededRefundOf = contract => {
    const order = orderOfContract(contract)
    return order && order.refund && order.refund.state === 'succeeded' ? toInteger(order.refund.amount) : 0
  }
  const escrowOf = contractId => {
    const contract = state.contracts.find(item => item.id === contractId)
    if (!contract) return 0
    return Math.max(0, receivedOf(contract) - grossReleasedOf(contractId) - succeededRefundOf(contract))
  }
  const contractsOfOwner = ownerId => state.contracts.filter(item => item.learnerId === ownerId || item.tutorId === ownerId)
  const escrowHeldOf = ownerId => contractsOfOwner(ownerId).reduce((sum, item) => sum + escrowOf(item.id), 0)
  /** Hoàn tiền tất toán tính từ đơn (một lần cho mỗi đơn), không cộng trùng với sự kiện refund. */
  const refundedOf = ownerId => state.orders
    .filter(order => (order.learnerId === ownerId || order.tutorId === ownerId) && order.refund && order.refund.state === 'succeeded')
    .reduce((sum, order) => sum + toInteger(order.refund.amount), 0)

  /** API cũ giữ tên nhưng số giờ dẫn từ escrowOf — không còn sự kiện 'hold' thứ hai. */
  const heldSummary = ownerId => escrowHeldOf(ownerId)

  const plannedSummary = tutorId => state.financialEvents
    .filter(event => event.type === 'planned' && (!tutorId || event.tutorId === tutorId))
    .reduce((sum, event) => sum + toInteger(event.plannedAmount || 0), 0)

  const refundedSummary = tutorId => state.financialEvents
    .filter(event => event.type === 'refund' && (!tutorId || event.tutorId === tutorId))
    .reduce((sum, event) => sum + toInteger(event.refunded || 0), 0)

  const walletSummary = ownerId => {
    const wallet = walletOf(ownerId)
    const revenue = revenueSummary(ownerId)
    const held = escrowHeldOf(ownerId)
    return {
      availableToUse: wallet ? toInteger(wallet.availableToUse) : 0,
      escrowHeld: held,
      grossReleased: revenue.grossReleased,
      tutorNetReleased: revenue.tutorNetReleased,
      platformFeeReleased: revenue.platformFeeReleased,
      held,
      planned: plannedSummary(ownerId),
      refunded: refundedOf(ownerId),
      currency: CURRENCY
    }
  }

  /* ------------------------------------------------------------------ */
  /* Dataset cho biểu đồ                                                 */
  /* ------------------------------------------------------------------ */

  const toDateKey = value => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  /**
   * Chuỗi ngày theo release event. `metric`: tutorNetReleased | platformFeeReleased | count.
   * from > to → trả invalid để caller báo lỗi, không âm thầm đảo ngược.
   */
  const revenueSeries = ({ tutorId = null, metric = 'tutorNetReleased', from = null, to = null } = {}) => {
    const fromKey = from ? toDateKey(from) : null
    const toKey = to ? toDateKey(to) : null
    if (fromKey && toKey && fromKey > toKey) return { invalid: true, reason: 'from-after-to', rows: [], total: 0 }
    const events = releasesOf(tutorId).filter(event => {
      const key = toDateKey(event.date)
      if (!key) return false
      if (fromKey && key < fromKey) return false
      if (toKey && key > toKey) return false
      return true
    })
    const rows = events.map(event => ({
      key: toDateKey(event.date),
      label: formatDate(event.date),
      value: metric === 'count' ? toInteger(event.sessionsReleased || 1) : toInteger(event[metric] || 0),
      refId: event.id
    })).sort((a, b) => String(a.key).localeCompare(String(b.key)))
    return {
      invalid: false,
      rows,
      total: rows.reduce((sum, row) => sum + row.value, 0),
      metric,
      unit: metric === 'count' ? 'buổi' : 'đ',
      from: fromKey,
      to: toKey
    }
  }

  const orderStatusDistribution = (learnerId = null) => {
    const scoped = learnerId ? ordersByLearner(learnerId) : list('orders')
    return Object.keys(ORDER_STATUS).map(key => ({
      key,
      label: ORDER_STATUS[key].label,
      count: scoped.filter(item => item.status === key).length
    }))
  }

  const orderChannelDistribution = (learnerId = null) => {
    const scoped = learnerId ? ordersByLearner(learnerId) : list('orders')
    return CHANNELS.map(channel => ({
      key: channel.key,
      label: channel.label,
      count: scoped.filter(item => item.channel === channel.key).length
    }))
  }

  /* ------------------------------------------------------------------ */
  /* Giỏ đăng ký                                                         */
  /* ------------------------------------------------------------------ */

  /**
   * GIẢ ĐỊNH DEMO (ghi trong bàn giao): không mặc định mọi dịch vụ đều có quantity như hàng hóa.
   * Mỗi item mang `seats` = số học viên/chỗ (SERVICE mặc định 1, GROUP_CLASS chọn theo chỗ còn).
   */
  const readCart = () => {
    const stored = readJson(CART_KEY, null)
    if (!stored || !Array.isArray(stored.items)) return { version: 1, items: [] }
    return { version: 1, items: stored.items.filter(item => item && typeof item.offeringId === 'string') }
  }

  const writeCart = cart => writeJson(CART_KEY, { version: 1, items: cart.items })

  const cartItems = () => readCart().items

  const cartCount = () => readCart().items.reduce((sum, item) => sum + toInteger(item.seats || 1), 0)

  const cartTotal = () => readCart().items.reduce((sum, item) => sum + toInteger(item.unitPrice * item.sessions * (item.seats || 1)), 0)

  const cartFind = (offeringId, learnerRef) => readCart().items.find(item => item.offeringId === offeringId && (item.learnerRef || null) === (learnerRef || null)) || null

  const buildCartItem = (offeringId, { selection = {}, seats = 1, learnerRef = null } = {}) => {
    const source = offering(offeringId)
    if (!source) return { ok: false, reason: 'unknown-offering', offeringId }
    if (source.status !== 'published') return { ok: false, reason: 'not-published', offeringId }
    if (source.availability !== 'open') return { ok: false, reason: 'closed', offeringId }
    const optionDelta = (source.options || []).reduce((delta, option) => {
      const chosen = selection[option.key]
      if (!chosen) return delta
      const value = option.values.find(item => item.id === chosen)
      return delta + (value ? toInteger(value.delta || 0) : delta)
    }, 0)
    const unitPrice = toInteger(source.price) + optionDelta
    const left = seatsLeft(source)
    if (left !== null && toInteger(seats) > left) return { ok: false, reason: 'not-enough-seats', offeringId, seatsLeft: left, requested: toInteger(seats) }
    const tutorRecord = tutor(source.tutorId)
    return {
      ok: true,
      item: {
        offeringId: source.id,
        offeringType: source.type,
        offeringTitle: source.title,
        tutorId: source.tutorId,
        tutorName: tutorRecord ? tutorRecord.name : source.tutorId,
        subjectLabel: source.subjectLabel,
        gradeLabel: source.gradeLabel,
        scheduleText: source.scheduleText,
        sessions: toInteger(source.sessions),
        durationMinutes: toInteger(source.durationMinutes),
        unit: source.unit,
        unitLabel: source.unitLabel,
        selection: clone(selection),
        seats: toInteger(seats),
        unitPrice,
        termsVersion: source.termsVersion,
        priceVersion: `${source.id}:${source.termsVersion}:${unitPrice}`,
        learnerRef,
        addedAt: nowIso()
      }
    }
  }

  const cartAdd = (offeringId, options) => {
    const built = buildCartItem(offeringId, options)
    if (!built.ok) return built
    const cart = readCart()
    const existingIndex = cart.items.findIndex(item => item.offeringId === offeringId && (item.learnerRef || null) === (built.item.learnerRef || null))
    if (existingIndex >= 0) {
      const source = offering(offeringId)
      const left = seatsLeft(source)
      const mergedSeats = toInteger(cart.items[existingIndex].seats) + built.item.seats
      if (left !== null && mergedSeats > left) return { ok: false, reason: 'not-enough-seats', seatsLeft: left, requested: mergedSeats }
      cart.items[existingIndex] = Object.assign({}, cart.items[existingIndex], built.item, { seats: mergedSeats })
    } else {
      cart.items.push(built.item)
    }
    return writeCart(cart) ? { ok: true, item: built.item } : { ok: false, reason: 'storage-failed' }
  }

  const cartUpdate = (offeringId, patch) => {
    const cart = readCart()
    const index = cart.items.findIndex(item => item.offeringId === offeringId)
    if (index < 0) return { ok: false, reason: 'not-in-cart', offeringId }
    const next = Object.assign({}, cart.items[index], patch)
    const source = offering(offeringId)
    const left = source ? seatsLeft(source) : null
    if (left !== null && toInteger(next.seats) > left) return { ok: false, reason: 'not-enough-seats', seatsLeft: left, requested: toInteger(next.seats) }
    cart.items[index] = next
    return writeCart(cart) ? { ok: true, item: next } : { ok: false, reason: 'storage-failed' }
  }

  const cartRemove = offeringId => {
    const cart = readCart()
    const next = cart.items.filter(item => item.offeringId !== offeringId)
    if (next.length === cart.items.length) return { ok: false, reason: 'not-in-cart', offeringId }
    cart.items = next
    return writeCart(cart) ? { ok: true } : { ok: false, reason: 'storage-failed' }
  }

  const cartClear = () => writeCart({ items: [] }) ? { ok: true } : { ok: false, reason: 'storage-failed' }

  /**
   * Validate lại item khi checkout: published/open, cùng price/terms version, group còn chỗ.
   * Trả về `stale` để UI thông báo — KHÔNG âm thầm đổi giá.
   */
  const validateCartForCheckout = () => {
    const issues = []
    const valid = []
    readCart().items.forEach(item => {
      const source = offering(item.offeringId)
      if (!source) { issues.push({ offeringId: item.offeringId, code: 'unknown-offering', message: 'Không tìm thấy dịch vụ/lớp trong dữ liệu mẫu.' }); return }
      if (source.status !== 'published') { issues.push({ offeringId: item.offeringId, code: 'not-published', message: `“${source.title}” không còn ở trạng thái công khai.` }); return }
      if (source.availability !== 'open') { issues.push({ offeringId: item.offeringId, code: 'closed', message: `“${source.title}” đã đóng, không nhận đăng ký.` }); return }
      const rebuilt = buildCartItem(item.offeringId, { selection: item.selection, seats: item.seats, learnerRef: item.learnerRef })
      if (!rebuilt.ok) {
        issues.push({ offeringId: item.offeringId, code: rebuilt.reason, message: rebuilt.reason === 'not-enough-seats' ? `Chỉ còn ${rebuilt.seatsLeft} chỗ cho “${source.title}”.` : `“${source.title}” không còn nhận đăng ký.` })
        return
      }
      if (rebuilt.item.unitPrice !== toInteger(item.unitPrice) || rebuilt.item.termsVersion !== item.termsVersion) {
        issues.push({ offeringId: item.offeringId, code: 'stale-price', message: `Giá/điều khoản của “${source.title}” đã thay đổi: ${formatMoney(item.unitPrice)} → ${formatMoney(rebuilt.item.unitPrice)}. Vui lòng cập nhật lại lựa chọn.`, current: rebuilt.item.unitPrice, previous: toInteger(item.unitPrice) })
        return
      }
      valid.push(item)
    })
    return { ok: issues.length === 0, issues, validItems: valid }
  }

  /* ------------------------------------------------------------------ */
  /* Checkout: tạo order + contract + enrollment theo mô hình mẫu         */
  /* ------------------------------------------------------------------ */

  const checkoutFromCart = ({ learnerId, idempotency = null } = {}) => {
    const run = () => {
      const validation = validateCartForCheckout()
      if (!validation.ok) return { ok: false, reason: 'cart-invalid', issues: validation.issues }
      if (!validation.validItems.length) return { ok: false, reason: 'cart-empty' }
      if (!learnerId) return { ok: false, reason: 'missing-learner' }
      const result = mutate(draft => {
        const orderId = nextIdIn(draft.orders, 'OD-2026-')
        const contractId = nextIdIn(draft.contracts, 'HD-2026-')
        const learnerRecord = FIX.learners.find(item => item.id === learnerId)
        const firstTutorId = validation.validItems[0].tutorId
        const total = validation.validItems.reduce((sum, item) => sum + itemTotal(item), 0)
        const items = validation.validItems.map((item, index) => Object.assign({}, item, {
          id: `OI-${orderId.slice(-4)}-${index + 1}`,
          snapshotReason: 'Snapshot bất biến tại thời điểm tạo đơn từ giỏ đăng ký.'
        }))
        const enrollmentIds = []
        validation.validItems.forEach(item => {
          if (item.offeringType !== 'GROUP_CLASS') return
          const source = draft.offerings.find(off => off.id === item.offeringId)
          if (!source) return
          const left = Math.max(0, Number(source.capacity) - Number(source.enrolled))
          if (Number(item.seats) > left) return
          source.enrolled = Number(source.enrolled) + Number(item.seats)
          if (!Array.isArray(source.enrolledLearnerIds)) source.enrolledLearnerIds = []
          source.enrolledLearnerIds.push(learnerId)
          const enrollmentId = nextIdIn(draft.enrollments, 'EN-2026-')
          draft.enrollments.push({ id: enrollmentId, offeringId: source.id, learnerId, seats: Number(item.seats), status: 'active', orderId, createdAt: nowIso() })
          enrollmentIds.push(enrollmentId)
        })
        const at = nowIso()
        draft.orders.push({
          id: orderId,
          learnerId,
          tutorId: firstTutorId,
          channel: validation.validItems[0].offeringType === 'GROUP_CLASS' ? 'GROUP_CLASS' : 'INVITATION',
          sourceRef: { type: 'cart', id: orderId },
          status: 'awaiting_payment',
          paymentStatus: 'unpaid',
          contractId,
          enrollmentId: enrollmentIds[0] || null,
          createdAt: at,
          updatedAt: at,
          items,
          total,
          cancellation: null,
          refund: null,
          reviewId: null,
          learnerName: learnerRecord ? learnerRecord.name : learnerId
        })
        draft.contracts.push({
          id: contractId,
          orderId,
          learnerId,
          tutorId: firstTutorId,
          status: 'awaiting_payment',
          sessions: validation.validItems[0].sessions,
          completedSessions: 0,
          unitPrice: validation.validItems[0].unitPrice,
          total,
          feeRate: FIX.DEMO_FEE_RATE,
          signedAt: null,
          termsVersion: validation.validItems[0].termsVersion
        })
        draft.payments.push({
          id: nextIdIn(draft.payments, 'PAY-2026-'),
          orderId,
          contractId,
          learnerId,
          total,
          walletUsed: 0,
          payosDue: total,
          status: 'unpaid',
          method: 'wallet+payos',
          createdAt: at,
          note: 'Phiên thanh toán DEMO vừa tạo từ giỏ.'
        })
        const data = { orderId, contractId, total, itemCount: items.length, enrollmentIds }
        return { data }
      })
      // Chỉ xoá giỏ sau khi state đã persist thành công; nếu lưu lỗi thì giỏ phải còn nguyên.
      if (result.ok) cartClear()
      return result
    }
    return idempotency ? once(idempotency, run) : run()
  }

  /**
   * Sinh ID kế tiếp trong một tập. `prefix` phải là tiền tố đầy đủ (kèm dấu phân cách)
   * để không suy ra số thứ tự từ ID của họ khác (OF-SVC-* vs OF-GRP-*).
   */
  const nextIdIn = (items, prefix) => {
    const numeric = items
      .map(item => String(item.id))
      .filter(id => id.startsWith(prefix))
      .map(id => Number(id.slice(prefix.length)))
      .filter(value => Number.isFinite(value))
    const max = numeric.length ? Math.max.apply(null, numeric) : 0
    return `${prefix}${String(max + 1).padStart(4, '0')}`
  }

  const nextOfferingId = (items, type) => {
    const prefix = type === 'GROUP_CLASS' ? 'OF-GRP-' : 'OF-SVC-'
    const numeric = items
      .map(item => String(item.id))
      .filter(id => id.startsWith(prefix))
      .map(id => Number(id.slice(prefix.length)))
      .filter(value => Number.isFinite(value))
    const max = numeric.length ? Math.max.apply(null, numeric) : (type === 'GROUP_CLASS' ? 2000 : 1000)
    return `${prefix}${max + 1}`
  }

  /* ------------------------------------------------------------------ */
  /* Order / contract actions                                            */
  /* ------------------------------------------------------------------ */

  /** Action hợp lệ phải kiểm tra record hiện tại + persona + điều kiện. */
  const orderActions = (orderId, personaId = null) => {
    const record = orderById(orderId)
    if (!record) return []
    const session = personaId || getSession().personaId
    if (record.learnerId !== sessionLearnerId(session)) return []
    const status = ORDER_STATUS[record.status]
    if (!status) return []
    const allowed = status.actions.slice()
    if (allowed.includes('review')) {
      if (reviewEligibility(orderId).code !== 'eligible') allowed.splice(allowed.indexOf('review'), 1)
    }
    if (allowed.includes('cancel') && record.cancellation && record.cancellation.state === 'pending') {
      allowed.splice(allowed.indexOf('cancel'), 1)
    }
    return allowed
  }

  /** Không truyền personaId thì phải đọc persona đang đăng nhập, không rơi về mặc định. */
  const sessionLearnerId = personaId => {
    const record = getPersona(personaId || getSession().personaId)
    if (!record) return null
    if (record.role !== 'learner') return null
    const learnerRecord = FIX.learners.find(item => item.personaId === record.id)
    return learnerRecord ? learnerRecord.id : null
  }

  const sessionTutorId = personaId => {
    const record = getPersona(personaId || getSession().personaId)
    return record && record.role === 'tutor' ? record.tutorId : null
  }

  /**
   * Hủy đơn: cập nhật order/cancellation/refund MỘT LẦN qua state layer,
   * hoàn chỗ lớp nhóm theo demo policy, không tự refund khi policy không cho.
   */
  const cancelOrder = ({ orderId, reason, policyCode = 'before-first-session', idempotency = null } = {}) => {
    const run = () => mutate(draft => {
      const record = draft.orders.find(item => item.id === orderId)
      if (!record) return { ok: false, reason: 'unknown-order' }
      const status = ORDER_STATUS[record.status]
      if (!status || !status.actions.includes('cancel')) return { ok: false, reason: 'cannot-cancel', currentStatus: record.status }
      if (record.cancellation && record.cancellation.state === 'pending') return { ok: false, reason: 'cancellation-pending' }
      const trimmed = String(reason || '').trim()
      if (trimmed.length < 5) return { ok: false, reason: 'reason-too-short' }
      if (trimmed.length > 400) return { ok: false, reason: 'reason-too-long' }
      const policy = FIX.DEMO_REFUND_POLICY[policyCode] || FIX.DEMO_REFUND_POLICY.beforeFirstSession
      const refundRate = policy ? policy.refundRate : 0
      const paid = paymentsByOrderId(draft, orderId).filter(item => RECEIVED_STATES.includes(item.status))
      const paidAmount = paid.reduce((sum, item) => sum + toInteger(item.total), 0)
      /* Chính sách hủy áp trên PHẦN CHƯA GIẢI NGÂN, không trên toàn bộ tiền đã nhận:
         phần đã trả cho gia sư không hoàn, nên lấy paid − released làm cơ sở. */
      const contractRec = draft.contracts.find(item => item.orderId === orderId) || null
      const releasedSoFar = contractRec
        ? draft.financialEvents.filter(e => e.type === 'release' && e.contractId === contractRec.id)
          .reduce((sum, e) => sum + toInteger(e.grossReleased), 0)
        : 0
      const refundable = Math.max(0, paidAmount - releasedSoFar)
      const refundAmount = toInteger(refundable * refundRate)
      const at = nowIso()
      record.cancellation = { code: 'learner-request', reason: trimmed, requestedAt: at, state: 'pending', policyCode: policy ? policy.code : policyCode }
      record.status = 'cancellation_pending'
      record.updatedAt = at
      if (paidAmount === 0) {
        record.cancellation.state = 'cancelled'
        record.status = 'cancelled'
        record.paymentStatus = 'refunded'
        record.refund = { state: 'succeeded', amount: 0, policyCode: record.cancellation.policyCode, completedAt: at, note: 'Chưa phát sinh thanh toán, không có tiền để hoàn.' }
        releaseGroupSeats(draft, record, 0)
      } else if (refundAmount === 0) {
        record.refund = { state: 'succeeded', amount: 0, policyCode: record.cancellation.policyCode, completedAt: at, note: 'Demo policy không cho hoàn phần đã giải ngân.' }
        record.cancellation.state = 'cancelled'
        record.status = 'cancelled'
        record.paymentStatus = 'refunded'
        releaseGroupSeats(draft, record, 0)
      } else {
        record.refund = { state: 'pending', amount: refundAmount, policyCode: record.cancellation.policyCode, requestedAt: at, paymentId: paid[0] ? paid[0].id : null }
        record.paymentStatus = 'refund_pending'
      }
      syncContractForOrder(draft, record)
      return { data: { orderId: record.id, status: record.status, refundState: record.refund ? record.refund.state : 'none', refundAmount: record.refund ? record.refund.amount : 0 } }
    })
    return idempotency ? once(idempotency, run) : run()
  }

  const paymentsByOrderId = (draft, orderId) => draft.payments.filter(item => item.orderId === orderId)

  /**
   * Đơn bị hủy thì hợp đồng liên kết cũng phải đổi trạng thái. Trước đây cancelOrder chỉ
   * động tới order, nên trang xác nhận hợp đồng vẫn ghi "Chờ thanh toán" trong khi đơn đã
   * "Đã hủy" — làm hỏng đúng mục tiêu đồng bộ trạng thái đơn → hợp đồng → thanh toán.
   */
  const syncContractForOrder = (draft, record) => {
    const contract = draft.contracts.find(item => item.orderId === record.id)
    if (!contract) return null
    if (record.status === 'cancelled') contract.status = 'cancelled'
    else if (record.status === 'cancellation_pending') contract.status = 'cancellation_pending'
    else return null
    return contract.id
  }

  const nextFinancialEventId = draft => {
    const year = new Date().getFullYear()
    const prefix = `FE-${year}-`
    const used = draft.financialEvents.map(item => String(item.id)).filter(id => id.startsWith(prefix))
      .map(id => Number(id.slice(prefix.length))).filter(Number.isFinite)
    return `${prefix}${String(Math.max(0, ...used) + 1).padStart(4, '0')}`
  }

  /**
   * Tất toán hoàn tiền phải để lại dấu vết dòng tiền, nếu không escrow dẫn từ
   * payment − release − refund sẽ không bao giờ về 0:
   *  - một event 'refund' cho đúng số đã hoàn;
   *  - nếu chính sách demo giữ lại một phần (rate < 1), phần đó thành event
   *    'release' net 0 = phí hủy của nền tảng, không phải thù lao gia sư.
   */
  const syncFinancialSettlement = (draft, record) => {
    const contract = draft.contracts.find(item => item.orderId === record.id)
    if (!contract) return
    const already = draft.financialEvents.some(event => event.type === 'refund' && event.contractId === contract.id)
    if (!already) {
      draft.financialEvents.push({
        id: nextFinancialEventId(draft), type: 'refund', tutorId: contract.tutorId, contractId: contract.id,
        orderId: record.id, ledgerId: record.refund.ledgerId || null, date: String(record.refund.completedAt || nowIso()).slice(0, 10),
        grossReleased: 0, feeRateSnapshot: contract.feeRate, tutorNetReleased: 0, platformFeeReleased: 0,
        refunded: toInteger(record.refund.amount), note: 'Hoàn tiền tất toán theo yêu cầu hủy (demo).'
      })
    }
    const received = draft.payments.filter(payment => payment.orderId === record.id && RECEIVED_STATES.includes(payment.status))
      .reduce((sum, payment) => sum + toInteger(payment.total), 0)
    const released = draft.financialEvents.filter(event => event.type === 'release' && event.contractId === contract.id)
      .reduce((sum, event) => sum + toInteger(event.grossReleased), 0)
    const retained = Math.max(0, received - released - toInteger(record.refund.amount))
    if (retained > 0) {
      draft.financialEvents.push({
        id: nextFinancialEventId(draft), type: 'release', tutorId: contract.tutorId, contractId: contract.id,
        orderId: record.id, ledgerId: null, date: String(record.refund.completedAt || nowIso()).slice(0, 10),
        grossReleased: retained, feeRateSnapshot: 1, tutorNetReleased: 0, platformFeeReleased: retained, sessionsReleased: 0,
        note: 'PHÍ HỦY theo chính sách demo: phần chưa giải ngân không hoàn lại học viên, nền tảng giữ, KHÔNG phải thù lao gia sư.'
      })
    }
  }

  const releaseGroupSeats = (draft, record, extra) => {
    if (!record.enrollmentId) return extra
    const enrollment = draft.enrollments.find(item => item.id === record.enrollmentId)
    if (!enrollment) return extra
    const source = draft.offerings.find(item => item.id === enrollment.offeringId)
    if (!source) return extra
    source.enrolled = Math.max(0, Number(source.enrolled) - Number(enrollment.seats || 1))
    if (Array.isArray(source.enrolledLearnerIds)) {
      source.enrolledLearnerIds = source.enrolledLearnerIds.filter(id => id !== enrollment.learnerId)
    }
    enrollment.status = 'released'
    return extra
  }

  /** Hoàn tất hoàn tiền đang chờ (chỉ dùng trong QA flow có kiểm soát). */
  const completeRefund = orderId => mutate(draft => {
    const record = draft.orders.find(item => item.id === orderId)
    if (!record || !record.refund || record.refund.state !== 'pending') return { ok: false, reason: 'no-pending-refund' }
    const at = nowIso()
    record.refund.state = 'succeeded'
    record.refund.completedAt = at
    record.cancellation.state = 'cancelled'
    record.status = 'cancelled'
    record.paymentStatus = 'refunded'
    const wallet = draft.wallets.find(item => item.ownerId === record.learnerId)
    if (wallet) wallet.availableToUse = toInteger(wallet.availableToUse) + toInteger(record.refund.amount)
    const ledgerId = nextIdIn(draft.ledger, 'BT-')
    draft.ledger.push({ id: ledgerId, ownerId: record.learnerId, ownerType: 'learner', direction: 'in', amount: toInteger(record.refund.amount), kind: 'refund', label: 'Hoàn tiền hủy lớp', refType: 'order', refId: record.id, at, balanceAfter: wallet ? toInteger(wallet.availableToUse) : toInteger(record.refund.amount) })
    record.refund.ledgerId = ledgerId
    syncFinancialSettlement(draft, record)
    releaseGroupSeats(draft, record, 0)
    syncContractForOrder(draft, record)
    return { data: { orderId: record.id, refundAmount: record.refund.amount, ledgerId } }
  })

  /* ------------------------------------------------------------------ */
  /* Xác nhận buổi học → giải ngân                                       */
  /* ------------------------------------------------------------------ */

  /** Số buổi đã giải ngân của một hợp đồng (đếm từ release event, không phải field). */
  const sessionsReleasedOf = (contractId, source = state) => source.financialEvents
    .filter(event => event.type === 'release' && event.contractId === contractId)
    .reduce((sum, event) => sum + toInteger(event.sessionsReleased || 0), 0)

  /**
   * Học viên xác nhận một buổi ĐÃ DIỄN RA (contract.completedSessions đã tính buổi đó nhưng
   * chưa có release event) → ký quỹ chuyển thành thù lao: gross = unitPrice,
   * net = gross − phí nền tảng, ví gia sư += net, kèm dòng ledger.
   * Không có action này thì nút "Xác nhận buổi học" trên trang hợp đồng chỉ sửa object cục bộ
   * mà vẫn báo "đã giải ngân" — tức một thành công giả.
   */
  const releaseSession = ({ contractId, lessonNo, idempotency = null } = {}) => {
    const run = () => mutate(draft => {
      const contract = draft.contracts.find(item => item.id === contractId)
      if (!contract) return { ok: false, reason: 'unknown-contract' }
      const status = CONTRACT_STATUS[contract.status]
      if (!status || status.terminal) return { ok: false, reason: 'contract-terminal', currentStatus: contract.status }
      const lesson = Number(lessonNo)
      if (!Number.isInteger(lesson) || lesson < 1 || lesson > contract.sessions) return { ok: false, reason: 'invalid-lesson' }
      if (lesson > contract.completedSessions) return { ok: false, reason: 'lesson-not-attended', completedSessions: contract.completedSessions }
      const released = sessionsReleasedOf(contractId, draft)
      if (lesson <= released) return { ok: false, reason: 'already-released', releasedSessions: released }
      if (lesson !== released + 1) return { ok: false, reason: 'not-next-session', releasedSessions: released }
      const rate = Number.isFinite(Number(contract.feeRate)) && Number(contract.feeRate) > 0
        ? Number(contract.feeRate) : FIX.DEMO_FEE_RATE
      const split = splitRelease(contract.unitPrice, rate)
      const at = nowIso()
      const ledgerId = nextIdIn(draft.ledger, 'BT-')
      const wallet = draft.wallets.find(item => item.ownerId === contract.tutorId)
      if (wallet) wallet.availableToUse = toInteger(wallet.availableToUse) + split.tutorNetReleased
      draft.financialEvents.push({
        id: nextFinancialEventId(draft), type: 'release', tutorId: contract.tutorId, contractId: contract.id,
        orderId: contract.orderId, ledgerId, date: at.slice(0, 10),
        grossReleased: split.grossReleased, feeRateSnapshot: rate,
        tutorNetReleased: split.tutorNetReleased, platformFeeReleased: split.platformFeeReleased,
        sessionsReleased: 1, note: `Học viên xác nhận buổi ${lesson} (demo, chưa có backend).`
      })
      draft.ledger.push({
        id: ledgerId, ownerId: contract.tutorId, ownerType: 'tutor', direction: 'in',
        amount: split.tutorNetReleased, kind: 'release', label: `Giải ngân buổi ${lesson}`,
        refType: 'contract', refId: contract.id, at,
        balanceAfter: wallet ? toInteger(wallet.availableToUse) : split.tutorNetReleased
      })
      return { data: { contractId: contract.id, lessonNo: lesson, ...split, ledgerId, walletUpdated: Boolean(wallet) } }
    })
    return idempotency ? once(idempotency, run) : run()
  }

  /**
   * Điểm danh của gia sư theo từng buổi. Trang hợp đồng phía gia sư trước đây cất
   * `attendance` trong bảng hằng số nội trang, nên "buổi đã diễn ra" không tồn tại ở
   * nguồn dùng chung — và chính nó là căn cứ cho releaseSession.
   * Quy tắc: đánh dấu theo thứ tự (buổi kế tiếp sau buổi đã đánh dấu gần nhất);
   * vắng mặt KHÔNG tăng completedSessions vì không có buổi học để giải ngân.
   */
  const ATTENDANCE_STATUS = Object.freeze(['present', 'late', 'absent'])
  const attendanceOf = (contractId, source = state) => {
    const contract = source.contracts.find(item => item.id === contractId)
    return contract && Array.isArray(contract.attendance) ? contract.attendance : []
  }

  const markAttendance = ({ contractId, lessonNo, status = 'present', note = '', homework = '', idempotency = null } = {}) => {
    const run = () => mutate(draft => {
      const contract = draft.contracts.find(item => item.id === contractId)
      if (!contract) return { ok: false, reason: 'unknown-contract' }
      const st = CONTRACT_STATUS[contract.status]
      if (!st || st.terminal) return { ok: false, reason: 'contract-terminal', currentStatus: contract.status }
      /* Chỉ hợp đồng đang chạy mới nhận điểm danh: awaiting_payment / cancellation_pending
         không có lớp để dạy, nên không được phép đẩy completedSessions. */
      if (contract.status !== 'active') return { ok: false, reason: 'contract-not-active', currentStatus: contract.status }
      const lesson = Number(lessonNo)
      if (!Number.isInteger(lesson) || lesson < 1 || lesson > contract.sessions) return { ok: false, reason: 'invalid-lesson' }
      if (!ATTENDANCE_STATUS.includes(status)) return { ok: false, reason: 'invalid-attendance-status', allowed: ATTENDANCE_STATUS }
      if (String(note || '').length > 2000 || String(homework || '').length > 1000) return { ok: false, reason: 'invalid-note-length' }
      const list = Array.isArray(contract.attendance) ? contract.attendance : (contract.attendance = [])
      if (list.some(item => item.lesson === lesson)) return { ok: false, reason: 'already-marked' }
      const lastMarked = list.reduce((max, item) => Math.max(max, Number(item.lesson) || 0), 0)
      if (lesson !== lastMarked + 1) return { ok: false, reason: 'not-next-lesson', lastMarkedLesson: lastMarked }
      const at = nowIso()
      list.push({ lesson, status, at, note: String(note || ''), homework: String(homework || '') })
      if (status !== 'absent') contract.completedSessions = toInteger(contract.completedSessions) + 1
      contract.updatedAt = at
      return { data: { contractId: contract.id, lessonNo: lesson, status, completedSessions: contract.completedSessions, markedLessons: list.length } }
    })
    return idempotency ? once(idempotency, run) : run()
  }

  /**
   * Lịch từng buổi của một hợp đồng — tính MỘT nơi để trang học viên và trang gia sư
   * không tự sinh ngày rồi lệch nhau (đúng loại lỗi §5 của nhiệm vụ: cùng hợp đồng nhưng
   * hai màn khác số buổi/ngày).
   * Buổi đã điểm danh dùng ngày thật của bản ghi attendance. Buổi chưa điểm danh được nối
   * từ ngày điểm danh gần nhất theo nhịp 2 ngày (lịch "Thứ 3 & Thứ 5" ≈ hai buổi/tuần);
   * hợp đồng chưa có điểm danh nào mới dùng nhịp 3 ngày tính từ ngày ký.
   * Mọi mốc suy diễn đều gắn `source` để UI nói rõ đâu là ngày thật, đâu là ước lượng.
   */
  const SESSION_STEP_MS = 3 * 86400000
  const SESSION_GAP_FROM_ATTENDANCE_MS = 2 * 86400000
  const sessionsOf = contractId => {
    const contract = state.contracts.find(item => item.id === contractId)
    if (!contract) return []
    const records = attendanceOf(contractId)
    const byLesson = new Map(records.map(item => [Number(item.lesson), item]))
    const marked = records
      .map(item => ({ lesson: Number(item.lesson), ms: Date.parse(item.at) }))
      .filter(item => Number.isFinite(item.ms) && Number.isFinite(item.lesson))
      .sort((a, b) => a.lesson - b.lesson)
    const order = orderOfContract(contract)
    const anchorIso = contract.signedAt || (order && order.createdAt) || null
    const anchor = anchorIso ? Date.parse(anchorIso) : NaN
    const hasAnchor = Number.isFinite(anchor)
    const lessonMs = no => {
      if (!marked.length) return hasAnchor ? anchor + (no - 1) * SESSION_STEP_MS : NaN
      const nearest = marked.reduce((best, item) => (Math.abs(item.lesson - no) < Math.abs(best.lesson - no) ? item : best), marked[0])
      const est = nearest.ms + (no - nearest.lesson) * SESSION_GAP_FROM_ATTENDANCE_MS
      return hasAnchor ? Math.max(est, anchor) : est
    }
    return Array.from({ length: toInteger(contract.sessions) }, (_, index) => {
      const no = index + 1
      const record = byLesson.get(no)
      const ms = record ? Date.parse(record.at) : lessonMs(no)
      const iso = Number.isFinite(ms) ? new Date(ms).toISOString() : null
      return {
        no,
        iso,
        date: iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—',
        source: record ? 'attendance' : (iso ? 'suy-dien' : 'khong-xac-dinh'),
        attendance: record || null
      }
    })
  }

  /* ------------------------------------------------------------------ */
  /* Review                                                              */
  /* ------------------------------------------------------------------ */

  const reviewEligibility = orderId => {
    const record = orderById(orderId)
    if (!record) return { code: 'unknown-order', message: 'Không tìm thấy đơn.' }
    if (record.reviewId && state.reviews.some(item => item.id === record.reviewId)) return { code: 'already-reviewed', message: 'Đơn này đã được đánh giá.', reviewId: record.reviewId }
    if (record.status !== 'completed') return { code: 'not-completed', message: 'Chỉ đơn hoàn tất mới được đánh giá.' }
    return { code: 'eligible', message: 'Có thể đánh giá.' }
  }

  const submitReview = ({ orderId, rating, comment, idempotency = null } = {}) => {
    const run = () => mutate(draft => {
      const eligibility = reviewEligibility(orderId)
      if (eligibility.code !== 'eligible') return { ok: false, reason: eligibility.code, message: eligibility.message }
      const score = Number(rating)
      if (!Number.isInteger(score) || score < 1 || score > 5) return { ok: false, reason: 'invalid-rating' }
      const text = String(comment || '').trim()
      if (text.length < 10) return { ok: false, reason: 'comment-too-short' }
      if (text.length > 600) return { ok: false, reason: 'comment-too-long' }
      const record = draft.orders.find(item => item.id === orderId)
      const learnerRecord = FIX.learners.find(item => item.id === record.learnerId)
      const item = record.items[0] || {}
      const reviewId = nextIdIn(draft.reviews, 'RV-2026-')
      draft.reviews.push({
        id: reviewId, orderId, contractId: record.contractId, learnerId: record.learnerId,
        learnerName: learnerRecord ? learnerRecord.name : record.learnerId,
        tutorId: item.tutorId || record.tutorId, offeringId: item.offeringId || null, itemId: item.id || null,
        rating: score, comment: text, createdAt: nowIso(), status: 'published', eligibility: 'eligible'
      })
      record.reviewId = reviewId
      return { data: { reviewId, rating: score } }
    })
    return idempotency ? once(idempotency, run) : run()
  }

  const ratingSummary = tutorId => {
    const items = reviewsByTutor(tutorId)
    if (!items.length) return { average: 0, count: 0, hasData: false }
    const sum = items.reduce((total, item) => total + Number(item.rating || 0), 0)
    return { average: Math.round((sum / items.length) * 10) / 10, count: items.length, hasData: true }
  }

  /* ------------------------------------------------------------------ */
  /* Report                                                              */
  /* ------------------------------------------------------------------ */

  const submitReport = ({ reporterId, targetType, targetId, reason, evidenceNote = '', screenshotCount = 0, idempotency = null } = {}) => {
    const run = () => mutate(draft => {
      const validTargetTypes = ['tutor', 'contract', 'order', 'offering', 'job']
      if (!validTargetTypes.includes(targetType)) return { ok: false, reason: 'invalid-target-type' }
      const known = ({
        tutor: FIX.tutors,
        contract: draft.contracts,
        order: draft.orders,
        offering: draft.offerings,
        job: draft.jobs
      })[targetType]
      if (!known.some(item => item.id === targetId)) return { ok: false, reason: 'unknown-target', targetId }
      if (!REPORT_REASONS.some(item => item.code === reason)) return { ok: false, reason: 'invalid-reason' }
      const note = String(evidenceNote || '').trim()
      if (note.length > 800) return { ok: false, reason: 'evidence-too-long' }
      const shots = Number(screenshotCount)
      if (!Number.isInteger(shots) || shots < 0 || shots > 5) return { ok: false, reason: 'invalid-screenshot-count' }
      const duplicate = draft.reports.find(item => item.reporterId === reporterId && item.targetType === targetType && item.targetId === targetId && !REPORT_STATE[item.state].terminal)
      if (duplicate) return { ok: false, reason: 'duplicate-open-report', reportId: duplicate.id }
      const reportId = nextIdIn(draft.reports, 'RP-2026-')
      const reasonRecord = REPORT_REASONS.find(item => item.code === reason)
      const target = known.find(item => item.id === targetId)
      draft.reports.push({
        id: reportId, reporterId, reporterName: (FIX.learners.find(item => item.id === reporterId) || {}).name || reporterId,
        targetType, targetId, targetLabel: target ? (target.name || target.title || target.id) : targetId,
        reason, reasonLabel: reasonRecord.label, evidenceMeta: { screenshots: shots, note },
        state: 'open', resolution: null, createdAt: nowIso(), notices: []
      })
      return { data: { reportId } }
    })
    return idempotency ? once(idempotency, run) : run()
  }

  const decideReport = ({ reportId, decision, summary = '', decidedBy = 'admin.educonnect' }) => {
    const run = () => mutate(draft => {
      const record = draft.reports.find(item => item.id === reportId)
      if (!record) return { ok: false, reason: 'unknown-report' }
      const status = REPORT_STATE[record.state]
      if (status.terminal) return { ok: false, reason: 'terminal-state', currentState: record.state }
      if (!status.actions.includes(decision)) return { ok: false, reason: 'invalid-decision', decision }
      const text = String(summary || '').trim()
      if (decision === 'resolve' || decision === 'dismiss') {
        if (text.length < 10) return { ok: false, reason: 'summary-too-short' }
        if (text.length > 600) return { ok: false, reason: 'summary-too-long' }
      }
      const at = nowIso()
      if (decision === 'investigate') {
        record.state = 'investigating'
        record.notices.push({ at, text: 'Đã chuyển sang xác minh.' })
        return { data: { reportId, state: record.state } }
      }
      record.state = decision === 'resolve' ? 'resolved' : 'dismissed'
      record.resolution = { code: decision === 'resolve' ? 'resolved' : 'insufficient-evidence', decidedAt: at, decidedBy, summary: text }
      record.notices.push({ at, text: decision === 'resolve' ? `Báo cáo đã xử lý: ${text}` : `Báo cáo bị từ chối: ${text}` })
      return { data: { reportId, state: record.state } }
    })
    return once(`report:${reportId}:${decision}`, run)
  }

  /* ------------------------------------------------------------------ */
  /* Offering CRUD (tutor manage / admin manage)                          */
  /* ------------------------------------------------------------------ */

  /** Chỉ là UI GATE: hồ sơ chưa duyệt thì không publish thành công. Không phải phân quyền thật. */
  const canTutorPublish = tutorId => {
    const record = tutor(tutorId)
    return Boolean(record && record.profileStatus === 'approved')
  }

  const saveOffering = ({ id = null, tutorId, patch }) => {
    const run = () => mutate(draft => {
      const owner = FIX.tutors.find(item => item.id === tutorId)
      if (!owner) return { ok: false, reason: 'unknown-tutor' }
      if (!patch || typeof patch !== 'object') return { ok: false, reason: 'invalid-patch' }

      const existing = id ? draft.offerings.find(item => item.id === id) : null
      if (id && !existing) return { ok: false, reason: 'unknown-offering' }
      if (existing && existing.tutorId !== tutorId) return { ok: false, reason: 'not-owner' }

      // Validate trên bản ghi SAU khi gộp: patch cục bộ không được suy ra thành 0.
      const merged = Object.assign({}, existing || {}, patch)
      const type = merged.type === 'GROUP_CLASS' ? 'GROUP_CLASS' : 'SERVICE'
      const title = String(merged.title || '').trim()
      if (title.length < 5 || title.length > 120) return { ok: false, reason: 'invalid-title' }
      const sessions = toInteger(merged.sessions)
      if (sessions < 1 || sessions > 200) return { ok: false, reason: 'invalid-sessions' }
      const price = toInteger(merged.price)
      if (price < 50000 || price > 5000000) return { ok: false, reason: 'invalid-price' }
      const durationMinutes = toInteger(merged.durationMinutes)
      if (durationMinutes < 30 || durationMinutes > 240) return { ok: false, reason: 'invalid-duration' }
      if (type === 'GROUP_CLASS') {
        const capacity = toInteger(merged.capacity)
        if (capacity < 2 || capacity > 30) return { ok: false, reason: 'invalid-capacity' }
        if (existing && capacity < toInteger(existing.enrolled)) return { ok: false, reason: 'capacity-below-enrolled', enrolled: toInteger(existing.enrolled) }
      }

      if (existing) {
        // enrolled/publishedAt do luồng nghiệp vụ khác sở hữu, không cho form ghi đè.
        const immutableKeys = ['id', 'tutorId', 'type', 'enrolled', 'enrolledLearnerIds', 'publishedAt']
        Object.keys(patch).forEach(key => { if (!immutableKeys.includes(key)) existing[key] = patch[key] })
        return { data: { offeringId: existing.id, mode: 'update' } }
      }

      if (!canTutorPublish(tutorId) && patch.status === 'published') return { ok: false, reason: 'profile-not-approved' }
      const offeringId = nextOfferingId(draft.offerings, type)
      draft.offerings.push(Object.assign({
        id: offeringId, type, tutorId,
        status: 'draft', availability: 'open', termsVersion: 'v1', publishedAt: null,
        options: [], enrolled: 0, enrolledLearnerIds: []
      }, patch, { id: offeringId, type }))
      return { data: { offeringId, mode: 'create' } }
    })
    // Không khoá idempotency cho bản cập nhật: gia sư được phép sửa lại nhiều lần.
    return run()
  }

  const transitionOffering = ({ offeringId, action, tutorId = null, decidedBy = null }) => {
    const run = () => mutate(draft => {
      const record = draft.offerings.find(item => item.id === offeringId)
      if (!record) return { ok: false, reason: 'unknown-offering' }
      if (tutorId && record.tutorId !== tutorId) return { ok: false, reason: 'not-owner' }
      const allowed = OFFERING_TRANSITIONS[record.status] || []
      const target = { submit: 'in_review', publish: 'published', reject: 'rejected', close: 'closed', unpublish: 'unpublished' }[action]
      if (!target) return { ok: false, reason: 'unknown-action', action }
      if (!allowed.includes(target)) return { ok: false, reason: 'invalid-transition', from: record.status, to: target }
      if (target === 'published' && !canTutorPublish(record.tutorId)) return { ok: false, reason: 'profile-not-approved' }
      record.status = target
      if (target === 'published') record.publishedAt = record.publishedAt || nowIso()
      if (target === 'closed') record.availability = 'closed'
      if (target === 'unpublished') record.availability = 'closed'
      if (decidedBy) record.decidedBy = decidedBy
      return { data: { offeringId, status: record.status, availability: record.availability } }
    })
    return once(`offering-transition:${offeringId}:${action}`, run)
  }

  /* ------------------------------------------------------------------ */
  /* Payment — query `status=success` KHÔNG mutate financial store        */
  /* ------------------------------------------------------------------ */

  /**
   * Chỉ bản ghi verified do fixture/QA kiểm soát mới được coi là thành công.
   * `queryStatus` chỉ chọn presentation, không tạo giao dịch.
   */
  const resolvePaymentResult = ({ paymentId = null, contractId = null, queryStatus = null } = {}) => {
    const record = paymentId ? payment(paymentId) : (contractId ? state.payments.find(item => item.contractId === contractId) : null)
    if (!record) return { state: 'missing', presentation: queryStatus === 'success' ? 'success' : 'unknown', record: null, message: 'Không tìm thấy phiên thanh toán theo tham số.' }
    const verified = record.status === 'verified'
    const presentation = verified ? 'success' : (queryStatus === 'success' ? 'success-presentation-only' : record.status)
    return { state: record.status, presentation, record: clone(record), verified, message: verified ? 'Giao dịch DEMO đã được xác nhận bởi fixture.' : 'Tham số URL chỉ chọn cách hiển thị, không làm thay đổi số dư.' }
  }

  /* ------------------------------------------------------------------ */
  /* Admin manage: users                                                 */
  /* ------------------------------------------------------------------ */

  const userList = () => FIX.personas.map(item => ({
    id: item.id, name: item.name, role: item.role, email: item.email, label: item.label,
    tutorId: item.tutorId || null,
    learnerId: (FIX.learners.find(learnerRecord => learnerRecord.personaId === item.id) || {}).id || null,
    accountState: 'active'
  }))

  const setAccountState = ({ userId, accountState, reason }) => {
    const run = () => mutate(draft => {
      if (!['active', 'locked', 'disabled'].includes(accountState)) return { ok: false, reason: 'invalid-state' }
      const text = String(reason || '').trim()
      if (text.length < 5 || text.length > 400) return { ok: false, reason: 'invalid-reason' }
      if (!Array.isArray(draft.accountStates)) draft.accountStates = []
      const existing = draft.accountStates.find(item => item.userId === userId)
      if (existing) {
        if (existing.accountState === accountState) return { ok: false, reason: 'already-in-state', accountState }
        existing.accountState = accountState
        existing.reason = text
        existing.updatedAt = nowIso()
      } else {
        draft.accountStates.push({ userId, accountState, reason: text, updatedAt: nowIso() })
      }
      return { data: { userId, accountState } }
    })
    return once(`account:${userId}:${accountState}`, run)
  }

  const accountStates = () => (Array.isArray(state.accountStates) ? clone(state.accountStates) : [])

  const accountStateOf = userId => {
    const record = accountStates().find(item => item.userId === userId)
    return record ? record.accountState : 'active'
  }

  /* ------------------------------------------------------------------ */
  /* Escaping — dữ liệu người dùng không nội suy thẳng vào innerHTML      */
  /* ------------------------------------------------------------------ */

  const escapeHtml = value => String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

  const text = (node, value) => { if (node) node.textContent = value === null || value === undefined ? '' : String(value) }

  const statusOf = (table, key) => table[key] || { key, label: key || '—', badge: 'badge--neutral', terminal: true, actions: [] }

  window.EduStore = Object.freeze({
    STORE_KEY, SESSION_KEY, CART_KEY, IDEMPOTENCY_KEY, STATE_VERSION,
    CURRENCY, DEMO_FEE_RATE: FIX.DEMO_FEE_RATE, DEMO_REFUND_POLICY: FIX.DEMO_REFUND_POLICY,
    FIXTURES: FIX,
    ORDER_STATUS, PAYMENT_STATUS, REFUND_STATE, CANCELLATION_STATE, CONTRACT_STATUS,
    OFFERING_STATUS, OFFERING_TRANSITIONS, REVIEW_STATE, REPORT_STATE, REPORT_REASONS, CHANNELS,
    formatMoney, formatNumber, formatDate, toInteger, escapeHtml, text, statusOf,
    state: () => clone(state), snapshot, isValidState, baseline, mutate, commit,
    corruptReset: () => Boolean(state.corruptReset),
    once, hasRun, markRun, resetIdempotency,
    getSession, setSession, clearSession, login, logout, getPersona, sessionLearnerId, sessionTutorId,
    find, list, tutor, learner, persona, offering, order, contract, payment, job, invitation, review, report,
    application, applicationsOfJob, applicationsByTutor, applicationOfTutor, jobsByLearner, jobBoard,
    orderByApplication, contractOfJob, timeAgo, JOB_APPLICATION_STATUS,
    jobQueue, jobQueueCounts, jobPoster, jobBucket, JOB_QUEUE_BUCKETS, JOB_DECISIONS, decideJob,
    contractByOrder, orderById, ordersByLearner, offeringsByTutor, reviewsByTutor, paymentsByOrder, walletOf,
    isPubliclyListable, seatsLeft, latestOfferings, nextId, nowIso, toDateKey,
    itemTotal, orderTotal, splitRelease, releasesOf, revenueSummary, heldSummary, plannedSummary, refundedSummary, walletSummary,
    escrowOf, escrowHeldOf, receivedOf, grossReleasedOf, succeededRefundOf, contractsOfOwner, RECEIVED_STATES,
    revenueSeries, orderStatusDistribution, orderChannelDistribution,
    readCart, cartItems, cartCount, cartTotal, cartFind, cartAdd, cartUpdate, cartRemove, cartClear,
    buildCartItem, validateCartForCheckout, checkoutFromCart,
    orderActions, reviewEligibility, submitReview, ratingSummary,
    submitReport, decideReport, reportsByReporter: reporterId => state.reports.filter(item => item.reporterId === reporterId),
    canTutorPublish, saveOffering, transitionOffering,
    cancelOrder, completeRefund, resolvePaymentResult,
    releaseSession, sessionsReleasedOf,
    applyToJob, selectApplication, closeJob,
    invitationsOfLearner, invitationsOfTutor, currentProposal, acceptedProposal,
    INVITATION_STATUS, INVITATION_TERMINAL, createInvitation, respondInvitation,
    markAttendance, attendanceOf, ATTENDANCE_STATUS,
    sessionsOf, SESSION_STEP_MS,
    userList, setAccountState, accountStates, accountStateOf
  })
})()
