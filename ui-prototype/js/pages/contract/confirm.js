/* Trang xác nhận hợp đồng: đọc CÙNG một bản ghi contract + order + payments từ EduStore.
 * Local confirmation chỉ là trình diễn UI (sessionStorage cùng tab), không phải chữ ký server. */
(() => {
  const Route = window.EduRoute
  const Store = window.EduStore
  if (!Route || !Store) return

  const byId = id => document.getElementById(id)

  /**
   * Chot an toan giong trang ví: script doc theo contract/order trong EduStore, nen neu
   * thieu hook thi PHAI dung — de lai gia tri tinh tren trang la hien sai so lieu
   * cua mot hop dong khac (§5.3: cung reference thi số phai khop).
   */
  const REQUIRED_IDS = ['confirm-content', 'not-found', 'not-found-title', 'not-found-description', 'reference-alert-title', 'confirm-reference', 'learner-name', 'learner-meta', 'tutor-name', 'tutor-meta', 'contract-id', 'sidebar-contract-id', 'contract-status-badge', 'contract-terms']
  const absentIds = REQUIRED_IDS.filter(id => !byId(id))
  if (absentIds.length) {
    document.title = 'Xác nhận hợp đồng — trang chưa hoàn tất chuyển đổi'
    const main = document.querySelector('main')
    if (main) {
      const notice = document.createElement('div')
      notice.className = 'alert alert--error'
      notice.setAttribute('role', 'alert')
      const title = document.createElement('strong')
      title.textContent = 'Không hiển thị nội dung xác nhận hợp đồng. '
      const detail = document.createElement('span')
      detail.textContent = ` Script đọc theo dữ liệu dùng chung nhưng thiếu ${absentIds.length} phần tử bắt buộc (${absentIds.join(', ')}). Trang không giữ lại số liệu mẫu cũ vì nó thuộc về một hợp đồng khác.`
      notice.append(title, detail)
      main.replaceChildren(notice)
    }
    return
  }

  const {
    formatMoney, formatDate, statusOf, splitRelease, itemTotal,
    ORDER_STATUS, CONTRACT_STATUS, PAYMENT_STATUS, CHANNELS, DEMO_REFUND_POLICY
  } = Store

  const contractParam = Route.param('contract', 'contractConfirm')
  const orderParam = Route.param('order', 'contractConfirm')

  let contract = contractParam ? Store.contract(contractParam) : null
  if (!contract && orderParam) contract = Store.contractByOrder(orderParam)

  if (!contract) {
    byId('confirm-content').hidden = true
    byId('not-found').hidden = false
    byId('not-found-title').textContent = contractParam || orderParam
      ? `Không tìm thấy hợp đồng ${contractParam || orderParam}`
      : 'Thiếu mã hợp đồng'
    byId('not-found-description').textContent = contractParam || orderParam
      ? 'Mã trong liên kết không tồn tại trong dữ liệu mẫu. Không tự động thay bằng hợp đồng khác.'
      : 'Mở trang này từ liên kết có tham số ?contract= (hoặc ?order=) hợp lệ.'
    return
  }

  const order = Store.order(contract.orderId)
  const payments = order ? Store.paymentsByOrder(order.id) : []
  const learner = Store.learner(contract.learnerId)
  const tutor = Store.tutor(contract.tutorId)
  const session = Store.getSession()
  const viewerLearnerId = Store.sessionLearnerId()
  const viewerTutorId = Store.sessionTutorId()
  const isOwnerLearner = Boolean(viewerLearnerId) && viewerLearnerId === contract.learnerId
  const isContractTutor = Boolean(viewerTutorId) && viewerTutorId === contract.tutorId

  const header = document.querySelector('.user-header')
  if (header) {
    header.dataset.userVariant = isContractTutor ? 'TUTOR' : (session.persona && session.persona.headerVariant) || 'A'
  }

  document.title = `Xác nhận hợp đồng ${contract.id} — Edu Connect`

  /* ---------------- Tham chiếu nguồn ---------------- */

  const sourceRef = order ? order.sourceRef : null
  const firstItem = order && order.items && order.items[0]
  const sourceTarget = (() => {
    if (!sourceRef) return { href: Route.page('orderHistory'), label: 'Đơn đăng ký' }
    if (sourceRef.type === 'invitation') return { href: Route.page('invitationNegotiation', { invite: sourceRef.id }), label: 'Lời mời gia sư' }
    if (sourceRef.type === 'application') return { href: Route.page('jobDetail', { id: sourceRef.jobId || sourceRef.id }), label: 'Tin tìm gia sư' }
    if (sourceRef.type === 'enrollment') return { href: firstItem && firstItem.offeringId ? Route.page('catalogDetail', { id: firstItem.offeringId }) : Route.page('orderHistory'), label: 'Lớp nhóm' }
    if (sourceRef.type === 'cart') return { href: Route.page('cart'), label: 'Giỏ đăng ký' }
    return { href: Route.page('orderHistory'), label: 'Đơn đăng ký' }
  })()
  byId('crumb-source').href = sourceTarget.href
  byId('crumb-source').textContent = sourceTarget.label
  byId('back-link').href = sourceTarget.href
  byId('back-link').textContent = `Quay lại ${sourceTarget.label.toLowerCase()}`

  /* ---------------- Trạng thái & cảnh báo ---------------- */

  const contractStatus = statusOf(CONTRACT_STATUS, contract.status)

  if (!order) {
    byId('reference-alert').hidden = false
    byId('reference-alert-title').textContent = 'Thiếu đơn đăng ký liên kết'
    byId('reference-alert-message').textContent = `Không tìm thấy đơn ${contract.orderId} của hợp đồng ${contract.id}. Chỉ hiển thị thông tin hợp đồng; không có thao tác.`
  } else if (orderParam && orderParam !== contract.orderId) {
    byId('reference-alert').hidden = false
    byId('reference-alert-message').textContent = `Tham chiếu ?order=${orderParam} không khớp đơn ${contract.orderId} của hợp đồng. Trang hiển thị theo hợp đồng ${contract.id} làm nguồn duy nhất.`
  }

  const personaAlert = byId('persona-alert')
  if (!isOwnerLearner && !isContractTutor) {
    personaAlert.hidden = false
    byId('persona-alert-message').textContent = `Phiên demo đang là “${session.persona.name}”. Learner và tutor cùng đọc một bản ghi contract + order + payments; việc lọc theo persona chỉ là xem trước, không phải phân quyền thật.`
  } else if (isContractTutor) {
    personaAlert.hidden = false
    personaAlert.className = 'alert alert--warning'
    byId('persona-alert-message').textContent = 'Bạn đang xem theo persona gia sư của hợp đồng. Xác nhận / thanh toán / hủy là thao tác của học viên; gia sư chỉ xem cùng bản ghi.'
  }

  /* ---------------- Thông tin cố định ---------------- */

  byId('confirm-reference').textContent = order
    ? `${contract.id} · Đơn ${order.id} · Kênh ${(CHANNELS.find(channel => channel.key === order.channel) || { label: order.channel }).label}`
    : `${contract.id} · Đơn liên kết không tồn tại`

  byId('learner-name').textContent = learner ? learner.name : contract.learnerId
  byId('learner-avatar').textContent = learner ? learner.initials : '—'
  byId('learner-avatar').setAttribute('aria-label', learner ? learner.name : contract.learnerId)
  byId('learner-meta').textContent = learner ? `Học viên: ${learner.studentName} · ${learner.grade}` : ''
  byId('tutor-name').textContent = tutor ? tutor.name : contract.tutorId
  byId('tutor-avatar').textContent = tutor ? tutor.initials : '—'
  byId('tutor-avatar').setAttribute('aria-label', tutor ? tutor.name : contract.tutorId)
  byId('tutor-meta').textContent = tutor ? `Hồ sơ: ${tutor.profileStatus === 'approved' ? 'đã duyệt' : tutor.profileStatus} · ${tutor.district}` : ''

  byId('contract-id').textContent = contract.id
  byId('sidebar-contract-id').textContent = contract.id
  const contractBadge = byId('contract-status-badge')
  contractBadge.className = `badge ${contractStatus.badge}`
  contractBadge.textContent = contractStatus.label
  byId('contract-terms').textContent = `termsVersion ${contract.termsVersion} · ${contract.sessions} buổi`
  byId('contract-signed').textContent = contract.signedAt ? formatDate(contract.signedAt, true) : 'Chưa ký (bản demo)'

  if (order) {
    const orderStatus = statusOf(ORDER_STATUS, order.status)
    const paymentStatus = statusOf(PAYMENT_STATUS, order.paymentStatus)
    byId('order-id').textContent = order.id
    byId('order-channel').textContent = (CHANNELS.find(channel => channel.key === order.channel) || { label: order.channel }).label
    byId('order-source').textContent = sourceRef ? `${sourceRef.type} · ${sourceRef.id}${sourceRef.version ? ` (phiên bản ${sourceRef.version})` : ''}` : '—'
    const orderBadge = byId('order-status-badge')
    orderBadge.className = `badge ${orderStatus.badge}`
    orderBadge.textContent = orderStatus.label
    const payBadge = byId('order-payment-badge')
    payBadge.className = `badge ${paymentStatus.badge}`
    payBadge.textContent = paymentStatus.label

    const itemsBody = byId('items-body')
    order.items.forEach(item => {
      const row = document.createElement('tr')
      const th = document.createElement('th')
      th.scope = 'row'
      th.textContent = item.offeringTitle
      const itemMeta = document.createElement('small')
      itemMeta.textContent = `${item.id} · termsVersion ${item.termsVersion}${item.seats > 1 ? ` · ${item.seats} chỗ` : ''}`
      const reason = document.createElement('small')
      reason.textContent = item.snapshotReason || 'Snapshot bất biến tại thời điểm tạo đơn.'
      th.append(itemMeta, reason)
      const cells = [
        formatMoney(item.unitPrice),
        String(item.sessions),
        `${item.durationMinutes} phút/buổi`,
        formatMoney(itemTotal(item))
      ]
      row.append(th)
      cells.forEach(value => {
        const td = document.createElement('td')
        td.textContent = value
        row.append(td)
      })
      itemsBody.append(row)
    })
  }

  /* ---------------- Tiền: một nguồn duy nhất ---------------- */

  const total = order ? Store.toInteger(order.total) : Store.toInteger(contract.total)
  const itemsSum = order ? order.items.reduce((sum, item) => sum + itemTotal(item), 0) : null
  byId('fee-total').textContent = formatMoney(total)
  byId('summary-total').textContent = formatMoney(total)

  const feeRate = Number.isFinite(Number(contract.feeRate)) ? Number(contract.feeRate) : Store.DEMO_FEE_RATE
  byId('fee-rate-note').textContent = `Phí nền tảng demo ${Math.round(feeRate * 100)}% khấu trừ từ thù lao gia sư khi giải ngân — giả định mẫu chưa được nhóm chốt.`
  const split = splitRelease(total, feeRate)
  const unitPrice = order && firstItem ? firstItem.unitPrice : contract.unitPrice
  const feeGrid = byId('fee-grid')
  ;[
    ['Học phí mỗi buổi', formatMoney(unitPrice), order && firstItem ? `${firstItem.sessions} buổi × ${firstItem.durationMinutes} phút` : `${contract.sessions} buổi`],
    ['Phí nền tảng khi giải ngân hết', formatMoney(split.platformFeeReleased), 'platformFeeReleased = tổng × mức phí demo'],
    ['Gia sư thực nhận khi giải ngân hết', formatMoney(split.tutorNetReleased), 'tutorNetReleased = tổng − phí nền tảng']
  ].forEach(([label, value, note]) => {
    const cell = document.createElement('div')
    const p = document.createElement('p')
    p.textContent = label
    const strong = document.createElement('strong')
    strong.textContent = value
    const small = document.createElement('small')
    small.textContent = note
    cell.append(p, strong, small)
    feeGrid.append(cell)
  })

  const reconcile = byId('reconcile-note')
  if (order && itemsSum === total && Store.toInteger(contract.total) === total) {
    reconcile.textContent = `Đã đối soát khớp: tổng đơn = tổng hạng mục = tổng hợp đồng = ${formatMoney(total)}.`
  } else if (order) {
    reconcile.textContent = `Cảnh báo đối soát: tổng đơn ${formatMoney(total)} · tổng hạng mục ${formatMoney(itemsSum)} · tổng hợp đồng ${formatMoney(contract.total)}. Số hiển thị lấy từ đơn đăng ký.`
    reconcile.classList.add('confirm-reconcile-warning')
  } else {
    reconcile.textContent = `Chưa đối soát được với đơn: tổng hiển thị lấy từ hợp đồng ${formatMoney(contract.total)}.`
  }

  /* ---------------- Phiên thanh toán ---------------- */

  if (payments.length) {
    const body = byId('payments-body')
    payments.forEach(payment => {
      const status = statusOf(PAYMENT_STATUS, payment.status)
      const row = document.createElement('tr')
      const th = document.createElement('th')
      th.scope = 'row'
      th.textContent = payment.id
      const meta = document.createElement('small')
      meta.textContent = formatDate(payment.createdAt, true)
      const note = document.createElement('small')
      note.textContent = payment.note || ''
      th.append(meta, note)
      row.append(th)
      ;[payment.method, formatMoney(payment.total), formatMoney(payment.walletUsed), formatMoney(payment.payosDue)].forEach(value => {
        const td = document.createElement('td')
        td.textContent = value
        row.append(td)
      })
      const statusCell = document.createElement('td')
      const badge = document.createElement('span')
      badge.className = `badge ${status.badge}`
      badge.textContent = status.label
      statusCell.append(badge)
      row.append(statusCell)
      body.append(row)
    })
  } else {
    byId('payments-wrapper').hidden = true
    byId('payments-empty').hidden = false
  }

  /* ---------------- Trạng thái xác nhận cục bộ (demo, không mutate store tiền) ---------------- */

  const CONFIRM_KEY = 'educonnect:contract-confirm:v1'
  const readConfirmation = () => {
    try {
      const raw = window.sessionStorage.getItem(CONFIRM_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || parsed.contractId !== contract.id || !Number.isFinite(parsed.confirmedAt)) return null
      return parsed
    } catch {
      return null
    }
  }
  const writeConfirmation = record => {
    try {
      window.sessionStorage.setItem(CONFIRM_KEY, JSON.stringify(record))
      return true
    } catch {
      return false
    }
  }
  let confirmation = readConfirmation()

  const confirmable = Boolean(order) && isOwnerLearner &&
    ['draft', 'awaiting_payment'].includes(contract.status) &&
    ['created', 'awaiting_payment'].includes(order.status)

  const checks = [...document.querySelectorAll('[data-consent]')]
  const selectAll = byId('select-all')

  const updateConsent = () => {
    const count = checks.filter(field => field.checked).length
    selectAll.checked = count === checks.length
    selectAll.indeterminate = count > 0 && count < checks.length
    byId('consent-count').textContent = `Đã chọn ${count}/5 điều khoản`
    const confirmButton = byId('confirm-button')
    if (confirmButton) confirmButton.disabled = count !== checks.length || Boolean(confirmation)
  }

  checks.forEach(field => field.addEventListener('change', updateConsent))
  selectAll.addEventListener('change', () => {
    checks.forEach(field => { field.checked = selectAll.checked })
    updateConsent()
  })

  /* ---------------- Actions theo state chung ---------------- */

  const actions = order ? Store.orderActions(order.id) : []
  const sidebarActions = byId('sidebar-actions')

  const detailHref = isContractTutor && !viewerLearnerId
    ? Route.page('contractTutorDetail', { id: contract.id })
    : Route.page('contractStudentDetail', { id: contract.id })

  const renderActions = () => {
    sidebarActions.replaceChildren()

    if (confirmable) {
      byId('consent-card').hidden = false
      if (confirmation) {
        const checkout = document.createElement('a')
        checkout.className = 'button button--primary'
        checkout.href = Route.page('paymentCheckout', { contract: contract.id, from: 'contract', order: order.id })
        checkout.textContent = 'Tiếp tục ký quỹ / thanh toán'
        sidebarActions.append(checkout)
        byId('confirm-hint').textContent = `Đã xác nhận điều khoản (demo, ${formatDate(confirmation.confirmedAt)}). Bước này chưa trừ tiền; thanh toán xử lý ở trang checkout.`
      } else {
        const confirmButton = document.createElement('button')
        confirmButton.className = 'button button--primary'
        confirmButton.type = 'button'
        confirmButton.id = 'confirm-button'
        confirmButton.disabled = true
        confirmButton.textContent = 'Xác nhận hợp đồng'
        sidebarActions.append(confirmButton)
        byId('confirm-hint').textContent = 'Cần chọn đủ 5 cam kết để tiếp tục.'
        updateConsent()
      }
    } else {
      byId('consent-card').hidden = true
      byId('confirm-hint').textContent = isOwnerLearner
        ? `Hợp đồng ở trạng thái “${contractStatus.label}” — bước xác nhận điều khoản không còn áp dụng.`
        : 'Persona hiện tại không có thao tác trên đơn này (xem trước, không phải phân quyền thật).'
    }

    if (actions.includes('pay') && !confirmable) {
      const pay = document.createElement('a')
      pay.className = 'button button--primary'
      pay.href = Route.page('paymentCheckout', { contract: contract.id, from: 'contract', order: order.id })
      pay.textContent = 'Thanh toán đơn'
      sidebarActions.append(pay)
    }

    if (actions.includes('cancel')) {
      const cancel = document.createElement('button')
      cancel.className = 'button button--outline'
      cancel.type = 'button'
      cancel.id = 'cancel-button'
      cancel.textContent = 'Hủy đơn / hợp đồng'
      sidebarActions.append(cancel)
    }

    if (['view-contract', 'view-refund', 'review', 'report'].some(action => actions.includes(action))) {
      const detail = document.createElement('a')
      detail.className = 'button button--outline'
      detail.href = detailHref
      detail.textContent = 'Xem chi tiết hợp đồng'
      sidebarActions.append(detail)
    }

    if (!sidebarActions.children.length) {
      const detail = document.createElement('a')
      detail.className = 'button button--outline'
      detail.href = detailHref
      detail.textContent = 'Xem chi tiết hợp đồng'
      sidebarActions.append(detail)
    }
  }

  const renderStatus = () => {
    const label = order ? statusOf(ORDER_STATUS, order.status).label : contractStatus.label
    const badgeClass = order ? statusOf(ORDER_STATUS, order.status).badge : contractStatus.badge
    ;[['confirm-status', label, badgeClass], ['summary-status', contractStatus.label, contractStatus.badge]].forEach(([id, text, badge]) => {
      const node = byId(id)
      node.textContent = text
      node.className = `badge ${badge}`
    })
  }

  /* ---------------- Modal xác nhận ---------------- */

  const openConfirmModal = () => {
    byId('confirm-modal-summary').textContent =
      `Hợp đồng: ${contract.id} (termsVersion ${contract.termsVersion})\n` +
      (order ? `Đơn: ${order.id} · ${(CHANNELS.find(channel => channel.key === order.channel) || { label: order.channel }).label}\n` : '') +
      `Học viên: ${learner ? learner.name : contract.learnerId} · Gia sư: ${tutor ? tutor.name : contract.tutorId}\n` +
      `${contract.sessions} buổi × ${formatMoney(unitPrice)}\n` +
      `Tổng (nguồn đơn đăng ký): ${formatMoney(total)}`
    window.EduModal.open('confirm-modal', {
      title: 'Xác nhận hợp đồng dạy – học',
      message: 'Bạn đồng ý với điều khoản đã kiểm tra và 5 cam kết đã chọn. Sau bước này bạn chuyển sang thanh toán ký quỹ; trang này không trừ tiền.',
      confirmText: 'Tôi đồng ý xác nhận',
      cancelText: 'Xem lại'
    })
  }

  byId('confirm-modal').addEventListener('modal:confirm', event => {
    if (!confirmable || confirmation || !checks.every(field => field.checked)) {
      event.preventDefault()
      renderActions()
      return
    }
    const record = { contractId: contract.id, confirmedAt: Date.now() }
    if (!writeConfirmation(record)) {
      event.preventDefault()
      window.EduToast.show({ type: 'error', title: 'Không lưu được xác nhận', message: 'Trình duyệt chặn lưu trữ phiên. State trước đó được giữ nguyên.' })
      return
    }
    confirmation = record
    renderActions()
    window.EduToast.show({ type: 'success', title: 'Đã xác nhận điều khoản (demo)', message: 'Chuyển sang bước thanh toán ký quỹ khi sẵn sàng.' })
  })

  sidebarActions.addEventListener('click', event => {
    const button = event.target.closest('#confirm-button')
    if (button && !button.disabled) openConfirmModal()
    const cancelButton = event.target.closest('#cancel-button')
    if (cancelButton) openCancelModal()
  })

  /* ---------------- Modal hủy: reason + preview chính sách ---------------- */

  const policySelect = byId('cancel-policy')
  Object.values(DEMO_REFUND_POLICY).forEach(policy => {
    const option = document.createElement('option')
    option.value = policy.code
    option.textContent = `${policy.label} — hoàn ${Math.round(policy.refundRate * 100)}%`
    policySelect.append(option)
  })

  const verifiedAmount = () => payments
    .filter(payment => payment.status === 'verified')
    .reduce((sum, payment) => sum + Store.toInteger(payment.total), 0)

  const renderCancelPreview = () => {
    const policy = Object.values(DEMO_REFUND_POLICY).find(item => item.code === policySelect.value) || DEMO_REFUND_POLICY.beforeFirstSession
    byId('cancel-policy-note').textContent = policy.note
    const paid = verifiedAmount()
    const refund = Math.round(paid * policy.refundRate)
    byId('cancel-preview').textContent =
      `Đã thanh toán xác nhận (verified): ${formatMoney(paid)}.\n` +
      `Chính sách demo “${policy.label}”: hoàn dự kiến ${formatMoney(refund)} về ví học viên (mô phỏng).\n` +
      `Sau khi gửi: trạng thái hủy = pending; trạng thái hoàn tiền = ${refund > 0 ? 'pending (chờ xử lý)' : 'succeeded (không có tiền hoàn)'}. Đây là hai trạng thái riêng.\n` +
      `Phần đã giải ngân cho gia sư không hoàn theo demo policy. Chính sách này là giả định chưa chốt, không cam kết hoàn 100% mọi trường hợp.`
  }
  policySelect.addEventListener('change', renderCancelPreview)

  const openCancelModal = () => {
    byId('cancel-target').textContent = `Đơn ${order.id} · Hợp đồng ${contract.id} · Tổng ${formatMoney(total)}`
    byId('cancel-reason').value = ''
    byId('cancel-error').hidden = true
    byId('cancel-error').textContent = ''
    byId('cancel-reason').removeAttribute('aria-invalid')
    renderCancelPreview()
    window.EduModal.open('cancel-modal', {
      title: 'Hủy đơn & hợp đồng',
      variant: 'danger',
      confirmText: 'Gửi yêu cầu hủy',
      cancelText: 'Giữ lại hợp đồng'
    })
  }

  byId('cancel-modal').addEventListener('modal:confirm', event => {
    const reason = byId('cancel-reason').value.trim()
    const errorNode = byId('cancel-error')
    if (reason.length < 5 || reason.length > 400) {
      event.preventDefault()
      errorNode.textContent = 'Lý do hủy cần từ 5 đến 400 ký tự.'
      errorNode.hidden = false
      byId('cancel-reason').setAttribute('aria-invalid', 'true')
      byId('cancel-reason').focus()
      return
    }
    const result = Store.cancelOrder({
      orderId: order.id,
      reason,
      policyCode: policySelect.value,
      idempotency: `confirm:cancel:${order.id}`
    })
    if (result.ok) {
      const data = result.data || {}
      if (data.refundState === 'pending') {
        window.EduToast.show({ type: 'info', title: 'Đã gửi yêu cầu hủy', message: `Hoàn tiền ${formatMoney(data.refundAmount || 0)} đang chờ xử lý (refund = pending, cancellation = pending).` })
      } else {
        window.EduToast.show({ type: 'success', title: 'Đã hủy đơn', message: `Không phát sinh tiền hoàn (${formatMoney(data.refundAmount || 0)}). Trạng thái đơn: đã hủy.` })
      }
      window.setTimeout(() => window.location.reload(), 900)
      return
    }
    event.preventDefault()
    if (result.duplicated) {
      window.EduToast.show({ type: 'warning', title: 'Yêu cầu đã gửi trước đó', message: 'Bấm lặp không tạo thêm yêu cầu hủy/hoàn tiền mới (idempotency).' })
      return
    }
    if (result.reason === 'storage-failed') {
      errorNode.textContent = 'Không lưu được vào storage demo. State trước đó được giữ nguyên, chưa có yêu cầu hủy nào được tạo thêm.'
      errorNode.hidden = false
      window.EduToast.show({ type: 'error', title: 'Lưu thất bại', message: 'Yêu cầu hủy chưa được ghi nhận; state trước đó được giữ.' })
      return
    }
    const messages = {
      'cannot-cancel': 'Trạng thái đơn hiện tại không cho phép hủy.',
      'cancellation-pending': 'Đơn đang có yêu cầu hủy chờ xử lý.',
      'reason-too-short': 'Lý do hủy quá ngắn.',
      'reason-too-long': 'Lý do hủy quá dài.'
    }
    errorNode.textContent = messages[result.reason] || `Không thể hủy (${result.reason}).`
    errorNode.hidden = false
    window.EduToast.show({ type: 'error', title: 'Không thể hủy đơn', message: messages[result.reason] || result.reason })
  })

  renderStatus()
  renderActions()
})()
