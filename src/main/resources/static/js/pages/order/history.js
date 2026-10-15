(() => {
  const Store = window.EduStore
  const Route = window.EduRoute
  const root = document.querySelector('[data-order-history]')
  if (!Store || !Route || !root) return

  const { ORDER_STATUS, PAYMENT_STATUS, REFUND_STATE, CANCELLATION_STATE, CHANNELS, DEMO_REFUND_POLICY } = Store
  const ALLOWED_STATUS = Object.keys(ORDER_STATUS)
  const ALLOWED_CHANNELS = CHANNELS.map(channel => channel.key)

  const paramAlert = root.querySelector('[data-oh-param-alert]')
  const idAlert = root.querySelector('[data-oh-id-alert]')
  const personaAlert = root.querySelector('[data-oh-persona-alert]')
  const tabsRoot = root.querySelector('[data-oh-status-tabs]')
  const results = root.querySelector('[data-oh-results]')
  const list = root.querySelector('[data-oh-list]')
  const tableFrame = root.querySelector('[data-oh-table]')
  const emptyState = root.querySelector('[data-oh-empty]')
  const pagination = root.querySelector('[data-oh-pagination]')
  const pageSizeSelect = root.querySelector('[data-oh-page-size]')
  const searchInput = root.querySelector('[data-oh-search]')
  const channelSelect = root.querySelector('[data-oh-channel]')
  const fromInput = root.querySelector('[data-oh-from]')
  const toInput = root.querySelector('[data-oh-to]')
  const sortSelect = root.querySelector('[data-oh-sort]')
  const summaryText = root.querySelector('[data-oh-result-summary]')
  // <template> nằm ngoài [data-order-history] (sau </main>) nên phải tra từ document, giống các modal.
  const rowTemplate = document.getElementById('oh-row-template')

  const detailModal = document.getElementById('oh-detail-modal')
  const detailBody = root.ownerDocument.querySelector('[data-oh-detail]')
  const cancelModal = document.getElementById('oh-cancel-modal')
  const cancelTargetText = document.querySelector('[data-oh-cancel-target]')
  const cancelPolicySelect = document.querySelector('[data-oh-cancel-policy]')
  const cancelPolicyNote = document.querySelector('[data-oh-cancel-policy-note]')
  const cancelPreview = document.querySelector('[data-oh-cancel-preview]')
  const cancelReason = document.querySelector('[data-oh-cancel-reason]')
  const cancelError = document.querySelector('[data-oh-cancel-error]')
  const reviewModal = document.getElementById('oh-review-modal')
  const reviewTargetText = document.querySelector('[data-oh-review-target]')
  const reviewRating = document.querySelector('[data-oh-review-rating]')
  const reviewComment = document.querySelector('[data-oh-review-comment]')
  const reviewError = document.querySelector('[data-oh-review-error]')
  const reportModal = document.getElementById('oh-report-modal')
  const reportTargetText = document.querySelector('[data-oh-report-target]')
  const reportReason = document.querySelector('[data-oh-report-reason]')
  const reportShots = document.querySelector('[data-oh-report-shots]')
  const reportNote = document.querySelector('[data-oh-report-note]')
  const reportError = document.querySelector('[data-oh-report-error]')

  const session = Store.getSession()
  let personaId = session.personaId
  let learnerId = Store.sessionLearnerId(personaId)
  if (!learnerId) {
    learnerId = Store.sessionLearnerId('PARENT-01')
    personaId = 'PARENT-01'
    personaAlert.textContent = `Phiên demo hiện là “${session.persona.name}” (không phải học viên). Trang hiển thị đơn của persona học viên demo Chị Mai Lan (HV-2001). Đây chỉ là xem trước theo persona, không phải phân quyền thật.`
    personaAlert.hidden = false
  }

  const headerName = document.querySelector('.user-header [data-profile-name]')
  const headerInitials = document.querySelector('.user-header [data-profile-initials]')
  const headerRole = document.querySelector('.user-header [data-profile-role]')
  const persona = Store.getPersona(personaId)
  if (headerName) headerName.textContent = persona.name
  if (headerInitials) headerInitials.textContent = persona.initials
  if (headerRole) headerRole.textContent = persona.label

  const state = { status: 'all', channel: 'all', query: '', from: '', to: '', sort: 'newest', pageSize: 5 }

  const invalidParams = []
  const rawStatus = Route.param('status', 'orderHistory')
  if (rawStatus !== null) {
    if (ALLOWED_STATUS.includes(rawStatus)) state.status = rawStatus
    else invalidParams.push(`status="${rawStatus}"`)
  }
  const rawChannel = Route.param('channel', 'orderHistory')
  if (rawChannel !== null) {
    if (ALLOWED_CHANNELS.includes(rawChannel)) state.channel = rawChannel
    else invalidParams.push(`channel="${rawChannel}"`)
  }
  if (invalidParams.length) {
    paramAlert.textContent = `Bộ lọc trên URL không hợp lệ: ${invalidParams.join(', ')}. Giá trị allowed của status: ${ALLOWED_STATUS.join(', ')}; của channel: ${ALLOWED_CHANNELS.join(', ')}. Đã đặt lại về “Tất cả”.`
    paramAlert.hidden = false
    state.status = 'all'
    state.channel = 'all'
  }
  channelSelect.value = state.channel

  const el = (tag, className, textValue) => {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (textValue !== undefined) node.textContent = textValue
    return node
  }

  const allOrders = () => Store.ordersByLearner(learnerId)
  const channelLabel = key => (CHANNELS.find(channel => channel.key === key) || { label: key }).label
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim()

  const dateFilterInvalid = () => Boolean(state.from && state.to && state.from > state.to)

  const filteredOrders = () => {
    const query = normalize(state.query)
    const rows = allOrders().filter(order => {
      if (state.status !== 'all' && order.status !== state.status) return false
      if (state.channel !== 'all' && order.channel !== state.channel) return false
      if (!dateFilterInvalid()) {
        const key = Store.toDateKey(order.createdAt)
        if (state.from && key && key < state.from) return false
        if (state.to && key && key > state.to) return false
      }
      if (query) {
        const haystack = [order.id, channelLabel(order.channel), (order.items[0] || {}).offeringTitle, (order.items[0] || {}).tutorName].join(' ')
        if (!normalize(haystack).includes(query)) return false
      }
      return true
    })
    rows.sort((left, right) => {
      if (state.sort === 'oldest') return new Date(left.createdAt) - new Date(right.createdAt)
      if (state.sort === 'amount-desc') return right.total - left.total
      if (state.sort === 'amount-asc') return left.total - right.total
      return new Date(right.createdAt) - new Date(left.createdAt)
    })
    return rows
  }

  const activateTab = key => {
    tabsRoot.querySelectorAll('[role="tab"]').forEach(tab => {
      const active = tab.dataset.ohStatus === key
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
      if (active) results.setAttribute('aria-labelledby', tab.id)
    })
  }

  const renderStats = () => {
    const orders = allOrders()
    root.querySelector('[data-oh-stat-count]').textContent = Store.formatNumber(orders.length)
    root.querySelector('[data-oh-stat-total]').textContent = Store.formatMoney(orders.reduce((sum, order) => sum + Store.toInteger(order.total), 0))
    const pending = orders.filter(order => ['created', 'awaiting_payment', 'cancellation_pending'].includes(order.status)).length
    root.querySelector('[data-oh-stat-pending]').textContent = Store.formatNumber(pending)
    root.querySelector('[data-oh-count="all"]').textContent = orders.length
    ALLOWED_STATUS.forEach(key => {
      const badge = root.querySelector(`[data-oh-count="${key}"]`)
      if (badge) badge.textContent = orders.filter(order => order.status === key).length
    })
  }

  const sourceLabel = order => {
    const ref = order.sourceRef || {}
    if (ref.type === 'invitation') return `Nguồn: lời mời ${ref.id} (phiên bản ${ref.version})`
    if (ref.type === 'application') return `Nguồn: ứng tuyển ${ref.id} · tin ${ref.jobId}`
    if (ref.type === 'enrollment') return `Nguồn: ghi danh ${ref.id}`
    if (ref.type === 'cart') return 'Nguồn: giỏ đăng ký'
    return 'Nguồn: —'
  }

  const buildActions = (order, container) => {
    const detailButton = el('button', 'button button--outline button--small', 'Chi tiết')
    detailButton.type = 'button'
    detailButton.dataset.ohAction = 'detail'
    detailButton.dataset.order = order.id
    detailButton.setAttribute('aria-label', `Xem chi tiết đơn ${order.id}`)
    container.appendChild(detailButton)

    const actions = Store.orderActions(order.id, personaId)
    actions.forEach(action => {
      if (action === 'continue-contract' && order.contractId) {
        const link = el('a', 'button button--primary button--small', 'Tiếp tục xác nhận')
        link.href = Route.page('contractConfirm', { contract: order.contractId, order: order.id })
        container.appendChild(link)
      } else if (action === 'pay' && order.contractId) {
        const link = el('a', 'button button--primary button--small', 'Thanh toán')
        link.href = Route.page('paymentCheckout', { contract: order.contractId, from: Route.safeReturn('contract-detail'), order: order.id })
        container.appendChild(link)
      } else if (action === 'view-contract' && order.contractId) {
        const link = el('a', 'button button--outline button--small', 'Xem hợp đồng')
        link.href = Route.page('contractStudentDetail', { id: order.contractId })
        container.appendChild(link)
      } else if (action === 'cancel') {
        const button = el('button', 'button button--danger button--small', 'Hủy đơn')
        button.type = 'button'
        button.dataset.ohAction = 'cancel'
        button.dataset.order = order.id
        container.appendChild(button)
      } else if (action === 'view-refund') {
        const button = el('button', 'button button--outline button--small', 'Trạng thái hoàn tiền')
        button.type = 'button'
        button.dataset.ohAction = 'detail'
        button.dataset.order = order.id
        container.appendChild(button)
      } else if (action === 'review') {
        const button = el('button', 'button button--outline button--small', 'Đánh giá')
        button.type = 'button'
        button.dataset.ohAction = 'review'
        button.dataset.order = order.id
        container.appendChild(button)
      } else if (action === 'report') {
        const button = el('button', 'button button--outline button--small', 'Báo cáo')
        button.type = 'button'
        button.dataset.ohAction = 'report'
        button.dataset.order = order.id
        container.appendChild(button)
      }
    })
  }

  const renderRows = () => {
    const rows = filteredOrders()
    const current = Number(pagination.dataset.current) || 1
    const size = Number(pageSizeSelect.value) || 5
    const visible = rows.slice((current - 1) * size, current * size)
    const fragment = document.createDocumentFragment()
    visible.forEach(order => {
      const row = rowTemplate.content.firstElementChild.cloneNode(true)
      const status = Store.statusOf(ORDER_STATUS, order.status)
      const payment = Store.statusOf(PAYMENT_STATUS, order.paymentStatus)
      const item = order.items[0] || {}
      row.querySelector('[data-oh-row-id]').textContent = order.id
      row.querySelector('[data-oh-row-channel]').textContent = channelLabel(order.channel)
      row.querySelector('[data-oh-row-source]').textContent = sourceLabel(order)
      row.querySelector('[data-oh-row-item]').textContent = item.offeringTitle || '—'
      row.querySelector('[data-oh-row-snapshot]').textContent = `${item.sessions || 0} buổi × ${Store.formatMoney(item.unitPrice || 0)}${item.unit === 'per-session' ? '/buổi' : ''} · ${item.durationMinutes || 0} phút/buổi${item.seats > 1 ? ` · ${item.seats} chỗ` : ''}`
      row.querySelector('[data-oh-row-total]').textContent = Store.formatMoney(order.total)
      row.querySelector('[data-oh-row-terms]').textContent = `Điều khoản ${item.termsVersion || '—'} (snapshot)`
      const statusBadge = row.querySelector('[data-oh-row-status]')
      statusBadge.classList.add(status.badge)
      statusBadge.textContent = status.label
      row.querySelector('[data-oh-row-status-note]').textContent = order.cancellation ? CANCELLATION_STATE[order.cancellation.state] ? `${CANCELLATION_STATE[order.cancellation.state].label}` : '' : ''
      const paymentBadge = row.querySelector('[data-oh-row-payment]')
      paymentBadge.classList.add(payment.badge)
      paymentBadge.textContent = payment.label
      row.querySelector('[data-oh-row-payment-note]').textContent = 'Trạng thái phiên thanh toán, riêng với trạng thái đơn'
      const contractCell = row.querySelector('[data-oh-row-contract]')
      if (order.contractId) {
        const link = el('a', undefined, order.contractId)
        link.href = Route.page('contractStudentDetail', { id: order.contractId })
        contractCell.appendChild(link)
      } else {
        contractCell.appendChild(el('span', undefined, 'Chưa có hợp đồng'))
        contractCell.appendChild(el('small', undefined, 'Mở chi tiết để xem đơn'))
      }
      const dateNode = row.querySelector('[data-oh-row-date]')
      dateNode.dateTime = order.createdAt
      dateNode.textContent = Store.formatDate(order.createdAt, true)
      buildActions(order, row.querySelector('[data-oh-row-actions]'))
      fragment.appendChild(row)
    })
    list.replaceChildren(fragment)
    tableFrame.hidden = rows.length === 0
    emptyState.hidden = rows.length !== 0
    return rows
  }

  let dateAlertShown = false
  const render = () => {
    renderStats()
    if (dateFilterInvalid()) {
      paramAlert.textContent = 'Khoảng ngày không hợp lệ (ngày “từ” sau ngày “đến”): bộ lọc ngày đang được bỏ qua.'
      paramAlert.hidden = false
      dateAlertShown = true
    } else if (dateAlertShown && !invalidParams.length) {
      paramAlert.hidden = true
      dateAlertShown = false
    }
    pagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { total: filteredOrders().length, pageSize: Number(pageSizeSelect.value) || 5, current: Number(pagination.dataset.current) || 1 } }))
    const rows = renderRows()
    const totalValue = rows.reduce((sum, order) => sum + Store.toInteger(order.total), 0)
    summaryText.textContent = `${rows.length} đơn · tổng giá trị ${Store.formatMoney(totalValue)}${state.status === 'all' ? '' : ` · trạng thái ${ORDER_STATUS[state.status].label}`}`
    const hasFilters = Boolean(state.query) || state.channel !== 'all' || Boolean(state.from) || Boolean(state.to) || state.sort !== 'newest' || state.status !== 'all'
    root.querySelectorAll('[data-oh-reset]').forEach(button => { button.hidden = !hasFilters })
  }

  const openDetail = orderId => {
    const order = Store.orderById(orderId)
    if (!order || order.learnerId !== learnerId) return
    const status = Store.statusOf(ORDER_STATUS, order.status)
    const payment = Store.statusOf(PAYMENT_STATUS, order.paymentStatus)
    const fragment = document.createDocumentFragment()

    const statusLine = el('p', 'order-history__detail-status')
    const statusBadge = el('span', `badge ${status.badge}`, status.label)
    const paymentBadge = el('span', `badge ${payment.badge}`, payment.label)
    statusLine.append('Trạng thái đơn: ', statusBadge, ' · Thanh toán: ', paymentBadge)
    fragment.appendChild(statusLine)

    const meta = el('dl', 'order-history__detail-meta')
    const addMeta = (label, value) => {
      meta.appendChild(el('dt', undefined, label))
      meta.appendChild(el('dd', undefined, value))
    }
    addMeta('Mã đơn', order.id)
    addMeta('Kênh', channelLabel(order.channel))
    addMeta('Nguồn đơn', sourceLabel(order).replace('Nguồn: ', ''))
    addMeta('Gia sư', (order.items[0] || {}).tutorName || order.tutorId)
    addMeta('Tạo lúc', Store.formatDate(order.createdAt, true))
    addMeta('Cập nhật lúc', Store.formatDate(order.updatedAt, true))
    fragment.appendChild(meta)

    fragment.appendChild(el('h3', 'order-history__detail-heading', 'Snapshot hạng mục (bất biến)'))
    const itemsList = el('ul', 'order-history__items')
    order.items.forEach(item => {
      const li = el('li')
      li.appendChild(el('strong', undefined, item.offeringTitle))
      li.appendChild(el('span', undefined, `${item.sessions} buổi × ${Store.formatMoney(item.unitPrice)}/buổi${item.seats > 1 ? ` × ${item.seats} chỗ` : ''} = ${Store.formatMoney(Store.itemTotal(item))}`))
      li.appendChild(el('span', undefined, `Điều khoản ${item.termsVersion} · lý do snapshot: ${item.snapshotReason}`))
      if (item.offeringId) {
        const link = el('a', undefined, `Xem dịch vụ/lớp ${item.offeringId}`)
        link.href = Route.page('catalogDetail', { id: item.offeringId })
        li.appendChild(link)
      }
      itemsList.appendChild(li)
    })
    fragment.appendChild(itemsList)
    const totalLine = el('p', 'order-history__detail-total')
    totalLine.append('Tổng đơn: ', el('strong', undefined, Store.formatMoney(Store.orderTotal(order.items))))
    fragment.appendChild(totalLine)

    fragment.appendChild(el('h3', 'order-history__detail-heading', 'Hợp đồng'))
    if (order.contractId) {
      const contract = Store.contract(order.contractId)
      const contractLine = el('p')
      const link = el('a', undefined, `Hợp đồng ${order.contractId}`)
      link.href = Route.page('contractStudentDetail', { id: order.contractId })
      contractLine.append(link, el('span', undefined, contract ? ` · ${Store.statusOf(Store.CONTRACT_STATUS, contract.status).label} · ${contract.completedSessions}/${contract.sessions} buổi` : ''))
      fragment.appendChild(contractLine)
    } else {
      fragment.appendChild(el('p', 'order-history__detail-note', 'Đơn này CHƯA có hợp đồng. Không có bản ghi hợp đồng mẫu nào được liên kết; các thao tác xác nhận/thanh toán sẽ mở ra khi hợp đồng được tạo.'))
    }

    fragment.appendChild(el('h3', 'order-history__detail-heading', 'Phiên thanh toán'))
    const payments = Store.paymentsByOrder(order.id)
    if (payments.length) {
      const paymentList = el('ul', 'order-history__items')
      payments.forEach(record => {
        const paymentStatus = Store.statusOf(PAYMENT_STATUS, record.status)
        const li = el('li')
        li.appendChild(el('strong', undefined, `${record.id} · ${paymentStatus.label}`))
        li.appendChild(el('span', undefined, `Tổng ${Store.formatMoney(record.total)} · ví ${Store.formatMoney(record.walletUsed)} · cổng ngoài ${Store.formatMoney(record.payosDue)} · ${record.method}`))
        li.appendChild(el('span', undefined, `${Store.formatDate(record.createdAt, true)}${record.note ? ` · ${record.note}` : ''}`))
        paymentList.appendChild(li)
      })
      fragment.appendChild(paymentList)
    } else {
      fragment.appendChild(el('p', 'order-history__detail-note', 'Chưa có phiên thanh toán nào gắn với đơn này.'))
    }

    if (order.cancellation || order.refund) {
      fragment.appendChild(el('h3', 'order-history__detail-heading', 'Hủy & hoàn tiền (hai trạng thái riêng)'))
      const cancelList = el('ul', 'order-history__items')
      if (order.cancellation) {
        const cancellation = CANCELLATION_STATE[order.cancellation.state] || { label: order.cancellation.state }
        const policy = DEMO_REFUND_POLICY[order.cancellation.policyCode]
        const li = el('li')
        li.appendChild(el('strong', undefined, `Yêu cầu hủy: ${cancellation.label}`))
        li.appendChild(el('span', undefined, `Lý do: ${order.cancellation.reason} · gửi lúc ${Store.formatDate(order.cancellation.requestedAt, true)}${policy ? ` · chính sách “${policy.label}”` : ''}`))
        cancelList.appendChild(li)
      }
      if (order.refund) {
        const refund = REFUND_STATE[order.refund.state] || { label: order.refund.state }
        const li = el('li')
        li.appendChild(el('strong', undefined, `Hoàn tiền: ${refund.label} · ${Store.formatMoney(order.refund.amount)}`))
        li.appendChild(el('span', undefined, `${order.refund.note || ''}${order.refund.completedAt ? ` · hoàn tất ${Store.formatDate(order.refund.completedAt, true)}` : ''}${order.refund.ledgerId ? ` · bút toán ví ${order.refund.ledgerId}` : ''}`))
        cancelList.appendChild(li)
      }
      fragment.appendChild(cancelList)
    }

    if (order.reviewId) {
      fragment.appendChild(el('p', 'order-history__detail-note', `Đơn đã có đánh giá ${order.reviewId}.`))
    }

    const ledgerNote = el('p', 'order-history__detail-note')
    const walletLink = el('a', undefined, 'xem Lịch sử giao dịch ví')
    walletLink.href = Route.page('walletOverview', { hash: 'transactions' })
    ledgerNote.append('Dòng tiền ví (ký quỹ/giải ngân/hoàn tiền) là ledger riêng, không nằm trong trang đơn: ', walletLink)
    fragment.appendChild(ledgerNote)

    detailBody.replaceChildren(fragment)
    window.EduModal.open(detailModal.id, { variant: 'info', title: `Đơn ${order.id}`, message: `${status.label} · thanh toán: ${payment.label}. Nội dung bên dưới lấy từ store demo.` })
  }

  let cancelTarget = null
  const updateCancelPreview = () => {
    if (!cancelTarget) return
    const policy = DEMO_REFUND_POLICY[cancelPolicySelect.value] || DEMO_REFUND_POLICY.beforeFirstSession
    const paid = Store.paymentsByOrder(cancelTarget.id).filter(record => record.status === 'verified')
    const paidAmount = paid.reduce((sum, record) => sum + Store.toInteger(record.total), 0)
    const refundAmount = Store.toInteger(paidAmount * policy.refundRate)
    cancelPolicyNote.textContent = policy.note
    cancelPreview.textContent = `Đã thanh toán (verified): ${Store.formatMoney(paidAmount)} · chính sách “${policy.label}” (hoàn ${Math.round(policy.refundRate * 100)}%) · dự kiến hoàn: ${Store.formatMoney(refundAmount)}. Phần đã giải ngân cho gia sư không hoàn theo demo policy; kết quả cuối do store tính khi xác nhận.`
  }

  const openCancel = orderId => {
    const order = Store.orderById(orderId)
    if (!order) return
    cancelTarget = order
    cancelPolicySelect.replaceChildren(...Object.values(DEMO_REFUND_POLICY).map(policy => {
      const option = el('option', undefined, `${policy.label} — hoàn ${Math.round(policy.refundRate * 100)}%`)
      option.value = policy.code
      return option
    }))
    cancelTargetText.textContent = `Đơn ${order.id} · ${Store.formatMoney(order.total)} · ${Store.statusOf(ORDER_STATUS, order.status).label}`
    cancelReason.value = ''
    cancelError.hidden = true
    cancelReason.removeAttribute('aria-invalid')
    updateCancelPreview()
    window.EduModal.open(cancelModal.id, { variant: 'danger', title: `Hủy đơn ${order.id}`, message: 'Hủy đơn tạo YÊU CẦU HỦY và tính tiền hoàn theo chính sách demo. Trạng thái hoàn tiền là khái niệm riêng với trạng thái hủy; phần đã giải ngân cho gia sư không hoàn theo demo policy.', confirmText: 'Hủy đơn' })
  }

  cancelPolicySelect.addEventListener('change', updateCancelPreview)

  cancelModal.addEventListener('modal:confirm', event => {
    if (!cancelTarget) { event.preventDefault(); return }
    const orderId = cancelTarget.id
    const reason = cancelReason.value.trim()
    if (reason.length < 5 || reason.length > 400) {
      cancelError.textContent = reason.length < 5 ? 'Lý do hủy cần tối thiểu 5 ký tự.' : 'Lý do hủy tối đa 400 ký tự.'
      cancelError.hidden = false
      cancelReason.setAttribute('aria-invalid', 'true')
      event.preventDefault()
      return
    }
    cancelError.hidden = true
    cancelReason.removeAttribute('aria-invalid')
    const result = Store.cancelOrder({ orderId, reason, policyCode: cancelPolicySelect.value, idempotency: `oh:cancel:${orderId}` })
    if (result.ok) {
      const data = result.data
      const refundLabel = REFUND_STATE[data.refundState] ? REFUND_STATE[data.refundState].label : data.refundState
      window.EduToast.show({ type: 'success', title: 'Đã ghi nhận yêu cầu hủy (demo)', message: `Đơn ${orderId}: trạng thái ${Store.statusOf(ORDER_STATUS, data.status).label} · hoàn tiền ${refundLabel}${data.refundAmount ? ` ${Store.formatMoney(data.refundAmount)}` : ''}.` })
      cancelTarget = null
      render()
      return
    }
    event.preventDefault()
    if (result.reason === 'duplicated') {
      window.EduToast.show({ type: 'info', title: 'Không tạo bản ghi thứ hai', message: `Yêu cầu hủy cho đơn ${orderId} đã được gửi trước đó trong phiên demo này.` })
      cancelTarget = null
      window.EduModal.close(cancelModal.id)
      render()
      return
    }
    if (result.reason === 'storage-failed') {
      window.EduToast.show({ type: 'error', title: 'Không lưu được thay đổi', message: 'sessionStorage không ghi được; đơn giữ nguyên trạng thái trước đó, không có yêu cầu hủy nào được tạo.' })
      return
    }
    const messages = {
      'unknown-order': 'Không tìm thấy đơn trong dữ liệu mẫu.',
      'cannot-cancel': `Trạng thái hiện tại (${Store.statusOf(ORDER_STATUS, result.currentStatus).label}) không cho phép hủy.`,
      'cancellation-pending': 'Đơn đang có yêu cầu hủy chờ xử lý, không gửi lặp lại.',
      'reason-too-short': 'Lý do hủy cần tối thiểu 5 ký tự.',
      'reason-too-long': 'Lý do hủy tối đa 400 ký tự.'
    }
    cancelError.textContent = messages[result.reason] || `Không thực hiện được (${result.reason}).`
    cancelError.hidden = false
  })

  let reviewTarget = null
  const openReview = orderId => {
    const eligibility = Store.reviewEligibility(orderId)
    if (eligibility.code !== 'eligible') {
      window.EduToast.show({ type: 'warning', title: 'Chưa đủ điều kiện đánh giá', message: eligibility.message })
      return
    }
    const order = Store.orderById(orderId)
    reviewTarget = order
    reviewTargetText.textContent = `Đơn ${order.id} · ${(order.items[0] || {}).offeringTitle || ''} · gia sư ${(order.items[0] || {}).tutorName || order.tutorId}`
    reviewComment.value = ''
    reviewError.hidden = true
    reviewComment.removeAttribute('aria-invalid')
    window.EduModal.open(reviewModal.id, { title: `Đánh giá đơn ${order.id}`, message: 'Đơn hoàn tất và chưa có đánh giá. Đánh giá mẫu được lưu unique theo đơn và hiển thị công khai trên hồ sơ gia sư.', confirmText: 'Gửi đánh giá' })
  }

  reviewModal.addEventListener('modal:confirm', event => {
    if (!reviewTarget) { event.preventDefault(); return }
    const orderId = reviewTarget.id
    const comment = reviewComment.value.trim()
    if (comment.length < 10 || comment.length > 600) {
      reviewError.textContent = comment.length < 10 ? 'Nhận xét cần tối thiểu 10 ký tự.' : 'Nhận xét tối đa 600 ký tự.'
      reviewError.hidden = false
      reviewComment.setAttribute('aria-invalid', 'true')
      event.preventDefault()
      return
    }
    reviewError.hidden = true
    reviewComment.removeAttribute('aria-invalid')
    const result = Store.submitReview({ orderId, rating: Number(reviewRating.value), comment, idempotency: `oh:review:${orderId}` })
    if (result.ok) {
      window.EduToast.show({ type: 'success', title: 'Đã lưu đánh giá (demo)', message: `Mã đánh giá ${result.data.reviewId}, hiển thị công khai trên hồ sơ gia sư.` })
      reviewTarget = null
      render()
      return
    }
    event.preventDefault()
    if (result.reason === 'duplicated') {
      window.EduToast.show({ type: 'info', title: 'Không tạo đánh giá thứ hai', message: `Đơn ${orderId} đã được gửi đánh giá trong phiên demo này.` })
      reviewTarget = null
      window.EduModal.close(reviewModal.id)
      render()
      return
    }
    if (result.reason === 'storage-failed') {
      window.EduToast.show({ type: 'error', title: 'Không lưu được đánh giá', message: 'sessionStorage không ghi được; không có đánh giá nào được tạo.' })
      return
    }
    reviewError.textContent = result.message || (result.reason === 'already-reviewed' ? 'Đơn này đã được đánh giá.' : `Không gửi được (${result.reason}).`)
    reviewError.hidden = false
  })

  let reportTarget = null
  reportReason.replaceChildren(...Store.REPORT_REASONS.map(reason => {
    const option = el('option', undefined, reason.label)
    option.value = reason.code
    return option
  }))

  const openReport = orderId => {
    const order = Store.orderById(orderId)
    if (!order) return
    reportTarget = order
    reportTargetText.textContent = `Báo cáo đơn ${order.id} · gia sư ${(order.items[0] || {}).tutorName || order.tutorId}`
    reportNote.value = ''
    reportError.hidden = true
    window.EduModal.open(reportModal.id, { variant: 'danger', title: `Báo cáo đơn ${order.id}`, message: 'Báo cáo được gửi tới quản trị với mã RP-…; minh chứng chỉ là metadata mẫu, không có tệp nào được tải lên server. Đang có báo cáo mở trùng đối tượng sẽ bị chặn.', confirmText: 'Gửi báo cáo' })
  }

  reportModal.addEventListener('modal:confirm', event => {
    if (!reportTarget) { event.preventDefault(); return }
    const orderId = reportTarget.id
    const result = Store.submitReport({
      reporterId: learnerId,
      targetType: 'order',
      targetId: orderId,
      reason: reportReason.value,
      evidenceNote: reportNote.value.trim(),
      screenshotCount: Number(reportShots.value),
      idempotency: `oh:report:${orderId}:${reportReason.value}`
    })
    if (result.ok) {
      window.EduToast.show({ type: 'success', title: 'Đã gửi báo cáo (demo)', message: `Mã báo cáo ${result.data.reportId}. Quản trị xử lý trong hàng đợi Báo cáo & tranh chấp; bạn sẽ nhận thông báo kết quả trên cùng bản ghi.` })
      reportTarget = null
      render()
      return
    }
    event.preventDefault()
    if (result.reason === 'duplicated') {
      window.EduToast.show({ type: 'info', title: 'Không tạo báo cáo thứ hai', message: 'Báo cáo với cùng lý do cho đơn này đã được gửi trong phiên demo này.' })
      return
    }
    if (result.reason === 'storage-failed') {
      window.EduToast.show({ type: 'error', title: 'Không lưu được báo cáo', message: 'sessionStorage không ghi được; không có báo cáo nào được tạo.' })
      return
    }
    const messages = {
      'duplicate-open-report': `Đang có báo cáo mở ${result.reportId} cho đơn này; không tạo bản ghi trùng.`,
      'invalid-reason': 'Chọn lý do báo cáo trong danh sách.',
      'evidence-too-long': 'Mô tả tối đa 800 ký tự.',
      'unknown-target': 'Không tìm thấy đơn trong dữ liệu mẫu.'
    }
    reportError.textContent = messages[result.reason] || `Không gửi được (${result.reason}).`
    reportError.hidden = false
  })

  tabsRoot.addEventListener('tabs:change', event => {
    const tab = document.getElementById(event.detail.tabId)
    state.status = tab && tab.dataset.ohStatus ? tab.dataset.ohStatus : 'all'
    pagination.dataset.current = '1'
    render()
  })

  searchInput.addEventListener('input', () => { state.query = searchInput.value; pagination.dataset.current = '1'; render() })
  channelSelect.addEventListener('change', () => { state.channel = channelSelect.value; pagination.dataset.current = '1'; render() })
  fromInput.addEventListener('change', () => { state.from = fromInput.value; pagination.dataset.current = '1'; render() })
  toInput.addEventListener('change', () => { state.to = toInput.value; pagination.dataset.current = '1'; render() })
  sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; pagination.dataset.current = '1'; render() })
  pageSizeSelect.addEventListener('change', () => { state.pageSize = Number(pageSizeSelect.value); pagination.dataset.current = '1'; render() })

  pagination.addEventListener('pagination:change', () => renderRows())

  root.addEventListener('click', event => {
    const resetButton = event.target.closest('[data-oh-reset]')
    if (resetButton) {
      state.status = 'all'
      state.channel = 'all'
      state.query = ''
      state.from = ''
      state.to = ''
      state.sort = 'newest'
      searchInput.value = ''
      channelSelect.value = 'all'
      fromInput.value = ''
      toInput.value = ''
      sortSelect.value = 'newest'
      searchInput.dispatchEvent(new Event('input'))
      activateTab('all')
      pagination.dataset.current = '1'
      render()
      return
    }
    const actionButton = event.target.closest('[data-oh-action]')
    if (!actionButton) return
    const orderId = actionButton.dataset.order
    const action = actionButton.dataset.ohAction
    if (action === 'detail') openDetail(orderId)
    if (action === 'cancel') openCancel(orderId)
    if (action === 'review') openReview(orderId)
    if (action === 'report') openReport(orderId)
  })

  activateTab(state.status)
  render()

  const rawId = Route.param('id', 'orderHistory')
  if (rawId !== null) {
    const record = Store.orderById(rawId)
    if (!record || record.learnerId !== learnerId) {
      idAlert.textContent = `Không tìm thấy đơn "${rawId}" trong danh sách đơn của persona hiện tại. Không tự động thay bằng đơn khác.`
      idAlert.hidden = false
    } else {
      openDetail(rawId)
    }
  }
})()
