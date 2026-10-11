(() => {
  const Store = window.EduStore
  const Route = window.EduRoute
  const root = document.querySelector('[data-tutor-manage]')
  if (!Store || !Route || !root) return

  const { ORDER_STATUS, PAYMENT_STATUS, REFUND_STATE, CANCELLATION_STATE, OFFERING_STATUS, OFFERING_TRANSITIONS, CHANNELS } = Store
  const TABS = ['services', 'classes', 'orders', 'revenue']

  const personaAlert = root.querySelector('[data-tm-persona-alert]')
  const gateAlert = root.querySelector('[data-tm-gate-alert]')
  const tabAlert = root.querySelector('[data-tm-tab-alert]')
  const tabsRoot = root.querySelector('[data-tm-tabs]')

  const session = Store.getSession()
  let personaId = session.personaId
  let tutorId = Store.sessionTutorId(personaId)
  if (!tutorId) {
    tutorId = Store.sessionTutorId('TUTOR-01')
    personaId = 'TUTOR-01'
    personaAlert.textContent = `Phiên demo hiện là “${session.persona.name}” (không phải gia sư). Trang hiển thị tài nguyên của persona gia sư demo Lê Hoàng Yến (GS-05). Đây chỉ là xem trước theo persona, không phải phân quyền thật.`
    personaAlert.hidden = false
  }
  const persona = Store.getPersona(personaId)
  const headerName = document.querySelector('.user-header [data-profile-name]')
  const headerInitials = document.querySelector('.user-header [data-profile-initials]')
  const headerRole = document.querySelector('.user-header [data-profile-role]')
  if (headerName) headerName.textContent = persona.name
  if (headerInitials) headerInitials.textContent = persona.initials
  if (headerRole) headerRole.textContent = persona.label

  const tutorRecord = Store.tutor(tutorId)
  root.querySelector('[data-tm-subtitle]').textContent = `Gia sư ${tutorRecord ? tutorRecord.name : tutorId} · ${tutorId} · hồ sơ: ${tutorRecord ? tutorRecord.profileStatus : '—'}. Chỉ hiển thị tài nguyên thuộc gia sư này.`
  const canPublish = Store.canTutorPublish(tutorId)
  if (!canPublish) {
    gateAlert.textContent = `Hồ sơ ${tutorId} chưa được duyệt (profileStatus: ${tutorRecord ? tutorRecord.profileStatus : '—'}): các thao tác công khai/duyệt sẽ KHÔNG thành công và báo “profile-not-approved”. Đây chỉ là UI GATE của bản demo để trình diễn trạng thái, không phải phân quyền thật.`
    gateAlert.hidden = false
  }

  const el = (tag, className, textValue) => {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (textValue !== undefined) node.textContent = textValue
    return node
  }
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim()
  const channelLabel = key => (CHANNELS.find(channel => channel.key === key) || { label: key }).label
  const modeLabel = mode => ({ online: 'Trực tuyến', home: 'Tại nhà học viên', both: 'Cả hai' }[mode] || mode)

  const myOfferings = () => Store.offeringsByTutor(tutorId)
  const myOrders = () => Store.list('orders').filter(order => order.tutorId === tutorId)

  /* Tabs theo ?tab= */

  const activateTab = key => {
    tabsRoot.querySelectorAll('[role="tab"]').forEach(tab => {
      const active = tab.dataset.tmTab === key
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
    })
    TABS.forEach(panelKey => {
      const panel = document.getElementById(`tm-panel-${panelKey}`)
      if (panel) panel.hidden = panelKey !== key
    })
    if (key === 'revenue') renderCharts()
  }

  const rawTab = Route.param('tab', 'tutorManage', 'services')
  let initialTab = 'services'
  if (TABS.includes(rawTab)) initialTab = rawTab
  else if (rawTab !== 'services' && rawTab !== null) {
    tabAlert.textContent = `Tab "${rawTab}" không hợp lệ. Các tab cho phép: ${TABS.join(', ')}. Đã chuyển về tab Dịch vụ.`
    tabAlert.hidden = false
  }

  tabsRoot.addEventListener('tabs:change', event => {
    const tab = document.getElementById(event.detail.tabId)
    const key = tab && tab.dataset.tmTab ? tab.dataset.tmTab : 'services'
    TABS.forEach(panelKey => {
      const panel = document.getElementById(`tm-panel-${panelKey}`)
      if (panel) panel.hidden = panelKey !== key
    })
    window.history.replaceState(null, '', `${window.location.pathname}?tab=${encodeURIComponent(key)}`)
    if (key === 'revenue') renderCharts()
  })

  /* Danh sách dịch vụ / lớp nhóm */

  const serviceSearch = root.querySelector('[data-tm-search][data-tm-type="SERVICE"]')
  const serviceStatus = root.querySelector('[data-tm-status][data-tm-type="SERVICE"]')
  const classSearch = root.querySelector('[data-tm-search][data-tm-type="GROUP_CLASS"]')
  const classStatus = root.querySelector('[data-tm-status][data-tm-type="GROUP_CLASS"]')
  const serviceTemplate = document.getElementById('tm-service-row-template')
  const classTemplate = document.getElementById('tm-class-row-template')
  const orderTemplate = document.getElementById('tm-order-row-template')

  const TRANSITION_LABELS = {
    submit: { label: 'Gửi duyệt', variant: 'default', message: 'Gửi dịch vụ/lớp tới hàng đợi duyệt của quản trị (trạng thái in_review).' },
    publish: { label: 'Công khai', variant: 'success', message: 'Công khai dịch vụ/lớp để học viên thấy và đăng ký. Chỉ thành công nếu hồ sơ gia sư đã được duyệt (UI gate demo).' },
    unpublish: { label: 'Ngừng công khai', variant: 'default', message: 'Ngừng công khai và ngừng nhận đăng ký mới; đơn cũ giữ nguyên snapshot.' },
    close: { label: 'Đóng', variant: 'danger', message: 'Đóng vĩnh viễn dịch vụ/lớp, không nhận đăng ký mới. Đơn/hợp đồng cũ không đổi.' }
  }

  const offeringFilter = (type, searchInput, statusSelect) => myOfferings()
    .filter(item => item.type === type)
    .filter(item => statusSelect.value === 'all' || item.status === statusSelect.value)
    .filter(item => !normalize(searchInput.value).length || normalize([item.id, item.title, item.subjectLabel, item.gradeLabel, item.district].join(' ')).includes(normalize(searchInput.value)))

  const renderOfferingRow = (item, template, tbody) => {
    const row = template.content.firstElementChild.cloneNode(true)
    const status = Store.statusOf(OFFERING_STATUS, item.status)
    row.querySelector('[data-tm-row-title]').textContent = item.title
    row.querySelector('[data-tm-row-id]').textContent = item.id
    row.querySelector('[data-tm-row-mode]').textContent = `${modeLabel(item.mode)} · ${item.district}`
    row.querySelector('[data-tm-row-subject]').textContent = item.subjectLabel
    row.querySelector('[data-tm-row-grade]').textContent = item.gradeLabel
    row.querySelector('[data-tm-row-price]').textContent = Store.formatMoney(item.price)
    row.querySelector('[data-tm-row-unit]').textContent = item.unitLabel
    const statusBadge = row.querySelector('[data-tm-row-status]')
    statusBadge.classList.add(status.badge)
    statusBadge.textContent = status.label
    row.querySelector('[data-tm-row-availability]').textContent = item.availability === 'open' ? 'Còn nhận đăng ký' : 'Ngừng nhận đăng ký'
    if (item.type === 'GROUP_CLASS') {
      row.querySelector('[data-tm-row-schedule]').textContent = item.scheduleText || 'Chưa xếp lịch'
      row.querySelector('[data-tm-row-start]').textContent = item.startDate ? `Khai giảng: ${Store.formatDate(item.startDate)}` : ''
      row.querySelector('[data-tm-row-capacity]').textContent = `${item.enrolled}/${item.capacity} học viên`
      const left = Store.seatsLeft(item)
      row.querySelector('[data-tm-row-seats]').textContent = left > 0 ? `Còn ${left} chỗ` : 'Đã đủ chỗ'
    } else {
      row.querySelector('[data-tm-row-sessions]').textContent = `${item.sessions} buổi`
      row.querySelector('[data-tm-row-duration]').textContent = `${item.durationMinutes} phút/buổi`
      row.querySelector('[data-tm-row-terms]').textContent = item.termsVersion
      row.querySelector('[data-tm-row-published]').textContent = item.publishedAt ? `Công khai: ${Store.formatDate(item.publishedAt)}` : 'Chưa công khai'
    }

    const actions = row.querySelector('[data-tm-row-actions]')
    const detailButton = el('button', 'button button--outline button--small', 'Chi tiết')
    detailButton.type = 'button'
    detailButton.dataset.tmDetailOffering = item.id
    actions.appendChild(detailButton)
    if (OFFERING_STATUS[item.status] && OFFERING_STATUS[item.status].actions.includes('edit')) {
      const editButton = el('button', 'button button--outline button--small', 'Sửa')
      editButton.type = 'button'
      editButton.dataset.tmEdit = item.id
      actions.appendChild(editButton)
    }
    (OFFERING_TRANSITIONS[item.status] || []).forEach(target => {
      const action = { in_review: 'submit', published: 'publish', unpublished: 'unpublish', rejected: 'reject', closed: 'close' }[target]
      if (!action || action === 'reject') return
      const config = TRANSITION_LABELS[action]
      if (!config) return
      if (target === 'closed' && (OFFERING_TRANSITIONS[item.status] || []).includes('closed')) {
        const closeButton = el('button', 'button button--danger button--small', config.label)
        closeButton.type = 'button'
        closeButton.dataset.tmTransition = `${item.id}:${'close'}`
        actions.appendChild(closeButton)
      }
      if (target !== 'closed') {
        const button = el('button', `button button--small ${action === 'publish' ? 'button--primary' : 'button--secondary'}`, config.label)
        button.type = 'button'
        button.dataset.tmTransition = `${item.id}:${action}`
        actions.appendChild(button)
      }
    })
    tbody.appendChild(row)
  }

  const renderOfferings = (type, searchInput, statusSelect, template, tbody, tableFrame, emptyNode, countNode) => {
    const items = offeringFilter(type, searchInput, statusSelect)
    const fragment = document.createDocumentFragment()
    const tbodyBuffer = document.createElement('tbody')
    items.forEach(item => renderOfferingRow(item, template, tbodyBuffer))
    while (tbodyBuffer.firstChild) fragment.appendChild(tbodyBuffer.firstChild)
    tbody.replaceChildren(fragment)
    tableFrame.hidden = items.length === 0
    emptyNode.hidden = items.length !== 0
    const total = myOfferings().filter(item => item.type === type).length
    countNode.textContent = `${items.length}/${total} ${type === 'GROUP_CLASS' ? 'lớp nhóm' : 'dịch vụ'} của ${tutorId}${items.length ? ` · tổng giá theo buổi: ${Store.formatMoney(items.reduce((sum, item) => sum + Store.toInteger(item.price), 0))}` : ''}`
  }

  const renderServices = () => renderOfferings('SERVICE', serviceSearch, serviceStatus, serviceTemplate, root.querySelector('[data-tm-services-list]'), root.querySelector('[data-tm-services-table]'), root.querySelector('[data-tm-services-empty]'), root.querySelector('[data-tm-services-count]'))
  const renderClasses = () => renderOfferings('GROUP_CLASS', classSearch, classStatus, classTemplate, root.querySelector('[data-tm-classes-list]'), root.querySelector('[data-tm-classes-table]'), root.querySelector('[data-tm-classes-empty]'), root.querySelector('[data-tm-classes-count]'))

  /* Danh sách đơn */

  const renderOrders = () => {
    const orders = myOrders()
    const tbody = root.querySelector('[data-tm-orders-list]')
    const fragment = document.createDocumentFragment()
    orders.forEach(order => {
      const row = orderTemplate.content.firstElementChild.cloneNode(true)
      const status = Store.statusOf(ORDER_STATUS, order.status)
      const payment = Store.statusOf(PAYMENT_STATUS, order.paymentStatus)
      const item = order.items[0] || {}
      const learnerRecord = Store.learner(order.learnerId)
      row.querySelector('[data-tm-order-id]').textContent = order.id
      row.querySelector('[data-tm-order-channel]').textContent = channelLabel(order.channel)
      row.querySelector('[data-tm-order-date]').textContent = Store.formatDate(order.createdAt, true)
      row.querySelector('[data-tm-order-learner]').textContent = learnerRecord ? learnerRecord.name : order.learnerId
      row.querySelector('[data-tm-order-learner-id]').textContent = order.learnerId
      row.querySelector('[data-tm-order-item]').textContent = item.offeringTitle || '—'
      row.querySelector('[data-tm-order-snapshot]').textContent = `${item.sessions || 0} buổi × ${Store.formatMoney(item.unitPrice || 0)}/buổi (snapshot)`
      row.querySelector('[data-tm-order-total]').textContent = Store.formatMoney(order.total)
      row.querySelector('[data-tm-order-terms]').textContent = `Điều khoản ${item.termsVersion || '—'}`
      const statusBadge = row.querySelector('[data-tm-order-status]')
      statusBadge.classList.add(status.badge)
      statusBadge.textContent = status.label
      row.querySelector('[data-tm-order-cancellation]').textContent = order.cancellation && CANCELLATION_STATE[order.cancellation.state] ? CANCELLATION_STATE[order.cancellation.state].label : ''
      const paymentBadge = row.querySelector('[data-tm-order-payment]')
      paymentBadge.classList.add(payment.badge)
      paymentBadge.textContent = payment.label
      row.querySelector('[data-tm-order-refund]').textContent = order.refund && REFUND_STATE[order.refund.state] ? `Hoàn tiền: ${REFUND_STATE[order.refund.state].label}` : ''
      const contractCell = row.querySelector('[data-tm-order-contract]')
      if (order.contractId) {
        const link = el('a', undefined, order.contractId)
        link.href = Route.page('contractTutorDetail', { id: order.contractId })
        contractCell.appendChild(link)
      } else {
        contractCell.appendChild(el('span', undefined, 'Chưa có hợp đồng'))
        contractCell.appendChild(el('small', undefined, 'Mở chi tiết để xem đơn'))
      }
      const actions = row.querySelector('[data-tm-order-actions]')
      const detailButton = el('button', 'button button--outline button--small', 'Chi tiết')
      detailButton.type = 'button'
      detailButton.dataset.tmDetailOrder = order.id
      actions.appendChild(detailButton)
      fragment.appendChild(row)
    })
    tbody.replaceChildren(fragment)
    root.querySelector('[data-tm-orders-table]').hidden = orders.length === 0
    root.querySelector('[data-tm-orders-empty]').hidden = orders.length !== 0
    root.querySelector('[data-tm-orders-count]').textContent = `${orders.length} đơn đăng ký có gia sư ${tutorId} · tổng giá trị ${Store.formatMoney(orders.reduce((sum, order) => sum + Store.toInteger(order.total), 0))}`
  }

  /* Chi tiết đơn (drawer/modal) */

  const openOrderDetail = orderId => {
    const order = myOrders().find(item => item.id === orderId)
    if (!order) return
    const status = Store.statusOf(ORDER_STATUS, order.status)
    const payment = Store.statusOf(PAYMENT_STATUS, order.paymentStatus)
    const learnerRecord = Store.learner(order.learnerId)
    const fragment = document.createDocumentFragment()
    const statusLine = el('p', 'tutor-manage__detail-status')
    const statusBadge = el('span', `badge ${status.badge}`, status.label)
    const paymentBadge = el('span', `badge ${payment.badge}`, payment.label)
    statusLine.append('Trạng thái đơn: ', statusBadge, ' · Thanh toán: ', paymentBadge)
    fragment.appendChild(statusLine)

    const meta = el('dl', 'tutor-manage__detail-meta')
    const addMeta = (label, value) => {
      meta.appendChild(el('dt', undefined, label))
      meta.appendChild(el('dd', undefined, value))
    }
    addMeta('Học viên', learnerRecord ? `${learnerRecord.name} (${order.learnerId})` : order.learnerId)
    addMeta('Kênh', channelLabel(order.channel))
    addMeta('Tạo lúc', Store.formatDate(order.createdAt, true))
    addMeta('Tổng đơn', Store.formatMoney(order.total))
    fragment.appendChild(meta)

    const itemsList = el('ul', 'tutor-manage__items')
    order.items.forEach(item => {
      const li = el('li')
      li.appendChild(el('strong', undefined, item.offeringTitle))
      li.appendChild(el('span', undefined, `${item.sessions} buổi × ${Store.formatMoney(item.unitPrice)}/buổi = ${Store.formatMoney(Store.itemTotal(item))} · điều khoản ${item.termsVersion}`))
      li.appendChild(el('span', undefined, `Snapshot: ${item.snapshotReason}`))
      itemsList.appendChild(li)
    })
    fragment.appendChild(itemsList)
    fragment.appendChild(el('p', 'tutor-manage__detail-note', 'Đơn giữ snapshot giá/điều khoản bất biến: sửa giá hoặc điều khoản của dịch vụ/lớp KHÔNG làm thay đổi đơn và hợp đồng cũ.'))

    if (order.contractId) {
      const contractLine = el('p')
      const link = el('a', undefined, `Xem hợp đồng ${order.contractId} (góc nhìn gia sư)`)
      link.href = Route.page('contractTutorDetail', { id: order.contractId })
      contractLine.appendChild(link)
      fragment.appendChild(contractLine)
    } else {
      fragment.appendChild(el('p', 'tutor-manage__detail-note', 'Đơn chưa có hợp đồng — không có bản ghi hợp đồng mẫu nào được liên kết.'))
    }

    const payments = Store.paymentsByOrder(order.id)
    if (payments.length) {
      fragment.appendChild(el('h3', 'tutor-manage__detail-heading', 'Phiên thanh toán'))
      const paymentList = el('ul', 'tutor-manage__items')
      payments.forEach(record => {
        const li = el('li')
        li.appendChild(el('strong', undefined, `${record.id} · ${Store.statusOf(PAYMENT_STATUS, record.status).label}`))
        li.appendChild(el('span', undefined, `Tổng ${Store.formatMoney(record.total)} · ví ${Store.formatMoney(record.walletUsed)} · cổng ngoài ${Store.formatMoney(record.payosDue)} · ${record.method}`))
        paymentList.appendChild(li)
      })
      fragment.appendChild(paymentList)
    }

    if (order.refund) {
      const refund = REFUND_STATE[order.refund.state] || { label: order.refund.state }
      fragment.appendChild(el('p', 'tutor-manage__detail-note', `Hoàn tiền: ${refund.label} · ${Store.formatMoney(order.refund.amount)}. Trạng thái hoàn tiền riêng với trạng thái hủy đơn.`))
    }

    document.querySelector('[data-tm-order-detail]').replaceChildren(fragment)
    window.EduModal.open('tm-order-detail-modal', { variant: 'info', title: `Đơn ${order.id}`, message: `${status.label} · thanh toán: ${payment.label}. Dữ liệu từ store demo, chỉ gồm đơn có gia sư ${tutorId}.` })
  }

  /* Chi tiết offering */

  const openOfferingDetail = offeringId => {
    const item = myOfferings().find(offering => offering.id === offeringId)
    if (!item) return
    const status = Store.statusOf(OFFERING_STATUS, item.status)
    const fragment = document.createDocumentFragment()
    const meta = el('dl', 'tutor-manage__detail-meta')
    const addMeta = (label, value) => {
      meta.appendChild(el('dt', undefined, label))
      meta.appendChild(el('dd', undefined, value))
    }
    addMeta('Mã', item.id)
    addMeta('Loại', item.type === 'GROUP_CLASS' ? 'Lớp nhóm' : 'Dịch vụ')
    addMeta('Trạng thái', status.label)
    addMeta('Môn / cấp', `${item.subjectLabel} · ${item.gradeLabel}`)
    addMeta('Buổi / thời lượng', `${item.sessions} buổi × ${item.durationMinutes} phút`)
    addMeta('Giá', `${Store.formatMoney(item.price)} ${item.unitLabel}`)
    addMeta('Hình thức / khu vực', `${modeLabel(item.mode)} · ${item.district}`)
    addMeta('Lịch', item.scheduleText || 'Chưa xếp lịch')
    addMeta('Điều khoản', item.termsVersion)
    if (item.type === 'GROUP_CLASS') {
      addMeta('Sức chứa', `${item.enrolled}/${item.capacity} · còn ${Store.seatsLeft(item)} chỗ`)
      if (item.startDate) addMeta('Khai giảng', Store.formatDate(item.startDate))
    }
    if (item.publishedAt) addMeta('Công khai lúc', Store.formatDate(item.publishedAt, true))
    addMeta('Chuyển trạng thái cho phép', (OFFERING_TRANSITIONS[item.status] || []).join(', ') || 'không có (trạng thái cuối)')
    fragment.appendChild(meta)
    if (item.description) fragment.appendChild(el('p', 'tutor-manage__detail-note', item.description))

    const linkedOrders = myOrders().filter(order => order.items.some(line => line.offeringId === item.id))
    fragment.appendChild(el('h3', 'tutor-manage__detail-heading', `Đơn liên quan (${linkedOrders.length})`))
    if (linkedOrders.length) {
      const orderList = el('ul', 'tutor-manage__items')
      linkedOrders.forEach(order => {
        const line = order.items.find(item2 => item2.offeringId === item.id)
        const li = el('li')
        li.appendChild(el('strong', undefined, `${order.id} · ${Store.statusOf(ORDER_STATUS, order.status).label}`))
        li.appendChild(el('span', undefined, `Snapshot đơn: ${Store.formatMoney(line.unitPrice)}/buổi · điều khoản ${line.termsVersion} — không đổi theo giá hiện tại ${Store.formatMoney(item.price)} (${item.termsVersion}).`))
        orderList.appendChild(li)
      })
      fragment.appendChild(orderList)
    } else {
      fragment.appendChild(el('p', 'tutor-manage__detail-note', 'Chưa có đơn nào dùng dịch vụ/lớp này.'))
    }

    document.querySelector('[data-tm-offering-detail]').replaceChildren(fragment)
    window.EduModal.open('tm-offering-detail-modal', { variant: 'info', title: item.title, message: `${item.id} · ${status.label} · thuộc ${tutorId}.` })
  }

  /* Chuyển trạng thái offering */

  let transitionTarget = null
  const transitionModal = document.getElementById('tm-transition-modal')

  const openTransition = (offeringId, action) => {
    const item = myOfferings().find(offering => offering.id === offeringId)
    const config = TRANSITION_LABELS[action]
    if (!item || !config) return
    transitionTarget = { offeringId, action }
    window.EduModal.open(transitionModal.id, {
      variant: config.variant === 'danger' ? 'danger' : (config.variant === 'success' ? 'success' : undefined),
      title: `${config.label} — ${item.id}`,
      message: `${config.message} Mục tiêu: “${item.title}” (${Store.statusOf(OFFERING_STATUS, item.status).label}).`,
      confirmText: config.label
    })
  }

  transitionModal.addEventListener('modal:confirm', event => {
    if (!transitionTarget) { event.preventDefault(); return }
    const { offeringId, action } = transitionTarget
    const result = Store.transitionOffering({ offeringId, action, tutorId })
    if (result.ok) {
      window.EduToast.show({ type: 'success', title: 'Đã cập nhật trạng thái (demo)', message: `${offeringId} → ${Store.statusOf(OFFERING_STATUS, result.data.status).label}.` })
      transitionTarget = null
      renderAll()
      return
    }
    event.preventDefault()
    if (result.reason === 'duplicated') {
      window.EduToast.show({ type: 'info', title: 'Không lặp lại chuyển trạng thái', message: `Thao tác “${action}” cho ${offeringId} đã chạy một lần trong phiên demo này (chống bấm lặp tạo bản ghi trùng).` })
      return
    }
    if (result.reason === 'storage-failed') {
      window.EduToast.show({ type: 'error', title: 'Không lưu được thay đổi', message: 'sessionStorage không ghi được; trạng thái giữ nguyên như trước.' })
      return
    }
    if (result.reason === 'profile-not-approved') {
      window.EduToast.show({ type: 'error', title: 'Hồ sơ chưa được duyệt', message: `Không thể công khai: hồ sơ ${tutorId} chưa ở trạng thái approved. Đây chỉ là UI GATE demo, không phải phân quyền thật.` })
      return
    }
    if (result.reason === 'invalid-transition') {
      window.EduToast.show({ type: 'error', title: 'Chuyển trạng thái không hợp lệ', message: `${result.from} → không cho phép thao tác “${action}” theo bảng OFFERING_TRANSITIONS.` })
      return
    }
    window.EduToast.show({ type: 'error', title: 'Không thực hiện được', message: `Lý do: ${result.reason}.` })
  })

  /* Form tạo/sửa offering */

  const offeringModal = document.getElementById('tm-offering-modal')
  const offeringForm = document.querySelector('[data-tm-offering-form]')
  const offeringError = document.querySelector('[data-tm-offering-error]')
  const capacityField = document.querySelector('[data-tm-capacity-field]')
  const fieldNodes = {}
  offeringForm.querySelectorAll('[data-tm-field]').forEach(node => { fieldNodes[node.dataset.tmField] = node })
  let editingId = null
  let editingType = 'SERVICE'
  let offeringSaving = false

  const setFieldError = (name, message) => {
    const node = fieldNodes[name]
    const errorNode = document.getElementById(`tm-err-${name}`)
    if (errorNode) {
      errorNode.textContent = message || ''
      errorNode.hidden = !message
    }
    if (node) {
      if (message) node.setAttribute('aria-invalid', 'true')
      else node.removeAttribute('aria-invalid')
    }
  }

  const clearOfferingErrors = () => {
    ['title', 'sessions', 'price', 'district', 'capacity'].forEach(name => setFieldError(name, null))
    offeringError.hidden = true
  }

  const openCreate = type => {
    editingId = null
    editingType = type === 'GROUP_CLASS' ? 'GROUP_CLASS' : 'SERVICE'
    offeringForm.reset()
    fieldNodes.grade.value = '10'
    fieldNodes.durationMinutes.value = '90'
    fieldNodes.mode.value = 'both'
    capacityField.hidden = editingType !== 'GROUP_CLASS'
    fieldNodes.capacity.required = editingType === 'GROUP_CLASS'
    clearOfferingErrors()
    window.EduModal.open(offeringModal.id, {
      title: editingType === 'GROUP_CLASS' ? 'Thêm lớp nhóm' : 'Thêm dịch vụ',
      message: 'Bản lưu mới ở trạng thái nháp; cần gửi duyệt và hồ sơ đã được duyệt mới công khai được (UI gate demo). Đơn/hợp đồng cũ luôn giữ snapshot giá và điều khoản riêng.',
      confirmText: 'Tạo bản nháp'
    })
  }

  const openEdit = offeringId => {
    const item = myOfferings().find(offering => offering.id === offeringId)
    if (!item) return
    editingId = item.id
    editingType = item.type
    fieldNodes.title.value = item.title
    fieldNodes.subject.value = item.subject
    fieldNodes.grade.value = item.grade
    fieldNodes.sessions.value = item.sessions
    fieldNodes.durationMinutes.value = String(item.durationMinutes)
    fieldNodes.price.value = item.price
    fieldNodes.mode.value = item.mode
    fieldNodes.district.value = item.district
    fieldNodes.scheduleText.value = item.scheduleText || ''
    fieldNodes.description.value = item.description || ''
    capacityField.hidden = editingType !== 'GROUP_CLASS'
    fieldNodes.capacity.required = editingType === 'GROUP_CLASS'
    if (editingType === 'GROUP_CLASS') fieldNodes.capacity.value = item.capacity
    clearOfferingErrors()
    window.EduModal.open(offeringModal.id, {
      title: `Sửa ${item.id}`,
      message: `Đang sửa “${item.title}” (điều khoản hiện tại ${item.termsVersion}). Nếu đổi giá/số buổi/thời lượng, phiên bản điều khoản sẽ tăng và chỉ áp dụng cho đơn MỚI; đơn/hợp đồng cũ giữ snapshot.`,
      confirmText: 'Lưu thay đổi'
    })
  }

  const labelOf = select => select.options[select.selectedIndex] ? select.options[select.selectedIndex].textContent : ''

  const buildPatch = () => {
    const sessions = Store.toInteger(fieldNodes.sessions.value)
    const durationMinutes = Store.toInteger(fieldNodes.durationMinutes.value)
    const price = Store.toInteger(fieldNodes.price.value)
    return {
      title: fieldNodes.title.value.trim(),
      subject: fieldNodes.subject.value,
      subjectLabel: labelOf(fieldNodes.subject),
      grade: fieldNodes.grade.value,
      gradeLabel: labelOf(fieldNodes.grade),
      sessions,
      durationMinutes,
      price,
      unit: 'per-session',
      unitLabel: `/buổi ${durationMinutes} phút`,
      mode: fieldNodes.mode.value,
      region: tutorRecord && tutorRecord.region ? tutorRecord.region : 'ho-chi-minh',
      district: fieldNodes.district.value.trim(),
      scheduleText: fieldNodes.scheduleText.value.trim() || 'Chưa xếp lịch',
      description: fieldNodes.description.value.trim(),
      type: editingType
    }
  }

  offeringModal.addEventListener('modal:confirm', event => {
    if (offeringSaving) { event.preventDefault(); return }
    clearOfferingErrors()
    const patch = buildPatch()
    let invalid = false
    if (patch.title.length < 5) { setFieldError('title', 'Tiêu đề cần tối thiểu 5 ký tự.'); invalid = true }
    if (!Number.isInteger(patch.sessions) || patch.sessions < 1 || patch.sessions > 200) { setFieldError('sessions', 'Số buổi từ 1 đến 200.'); invalid = true }
    if (patch.price < 50000 || patch.price > 5000000) { setFieldError('price', 'Giá mỗi buổi từ 50.000đ đến 5.000.000đ.'); invalid = true }
    if (patch.district.length < 3) { setFieldError('district', 'Nhập khu vực (tối thiểu 3 ký tự).'); invalid = true }
    if (editingType === 'GROUP_CLASS') {
      const capacity = Store.toInteger(fieldNodes.capacity.value)
      const existing = editingId ? myOfferings().find(item => item.id === editingId) : null
      if (capacity < 2 || capacity > 30) { setFieldError('capacity', 'Sức chứa từ 2 đến 30.'); invalid = true }
      else if (existing && capacity < Store.toInteger(existing.enrolled)) { setFieldError('capacity', `Không thấp hơn số học viên đã ghi danh (${existing.enrolled}).`); invalid = true }
      else patch.capacity = capacity
    }
    if (invalid) { event.preventDefault(); return }

    if (editingId) {
      const existing = myOfferings().find(item => item.id === editingId)
      const termsChanged = existing && (existing.price !== patch.price || existing.sessions !== patch.sessions || existing.durationMinutes !== patch.durationMinutes)
      if (termsChanged && existing) {
        const versionNumber = Number(String(existing.termsVersion).replace(/^v/i, '')) || 1
        patch.termsVersion = `v${versionNumber + 1}`
      }
    }

    offeringSaving = true
    const result = Store.saveOffering({ id: editingId, tutorId, patch })
    offeringSaving = false
    if (result.ok) {
      window.EduToast.show({
        type: 'success',
        title: result.data.mode === 'create' ? 'Đã tạo bản nháp (demo)' : 'Đã lưu thay đổi (demo)',
        message: result.data.mode === 'create'
          ? `${result.data.offeringId} ở trạng thái nháp. Dùng “Gửi duyệt” để chuyển sang chờ duyệt; công khai chỉ thành công khi hồ sơ đã được duyệt.`
          : `${result.data.offeringId} đã cập nhật${patch.termsVersion ? ` · điều khoản mới ${patch.termsVersion}, đơn/hợp đồng cũ vẫn giữ snapshot cũ` : ''}.`
      })
      renderAll()
      return
    }
    event.preventDefault()
    const messages = {
      'invalid-sessions': 'Số buổi từ 1 đến 200.',
      'invalid-price': 'Giá mỗi buổi từ 50.000đ đến 5.000.000đ.',
      'invalid-duration': 'Thời lượng mỗi buổi từ 30 đến 240 phút.',
      'invalid-capacity': 'Sức chứa lớp nhóm từ 2 đến 30.',
      'not-owner': 'Dịch vụ/lớp không thuộc gia sư hiện tại.',
      'unknown-offering': 'Không tìm thấy dịch vụ/lớp trong dữ liệu mẫu.',
      'profile-not-approved': `Hồ sơ ${tutorId} chưa được duyệt — không thể lưu ở trạng thái công khai (UI gate demo, không phải phân quyền thật).`,
      'storage-failed': 'Không lưu được vào sessionStorage; dữ liệu giữ nguyên như trước, không có thay đổi nào được ghi.'
    }
    offeringError.textContent = messages[result.reason] || `Không lưu được (${result.reason}).`
    offeringError.hidden = false
  })

  offeringModal.addEventListener('modal:close', () => { offeringSaving = false })

  /* Doanh thu + biểu đồ */

  const barContainer = root.querySelector('[data-tm-bar]')
  const pieContainer = root.querySelector('[data-tm-pie]')
  const chartForm = root.querySelector('[data-tm-chart-form]')
  const chartFrom = root.querySelector('[data-tm-chart-from]')
  const chartTo = root.querySelector('[data-tm-chart-to]')
  const chartMetric = root.querySelector('[data-tm-chart-metric]')

  const METRIC_LABELS = { tutorNetReleased: 'Thực nhận gia sư', platformFeeReleased: 'Phí nền tảng', count: 'Số buổi giải ngân' }

  const renderRevenue = () => {
    const revenue = Store.revenueSummary(tutorId)
    const wallet = Store.walletSummary(tutorId)
    root.querySelector('[data-tm-rev-gross]').textContent = Store.formatMoney(revenue.grossReleased)
    root.querySelector('[data-tm-rev-net]').textContent = Store.formatMoney(revenue.tutorNetReleased)
    root.querySelector('[data-tm-rev-fee]').textContent = Store.formatMoney(revenue.platformFeeReleased)
    root.querySelector('[data-tm-fee-rate]').textContent = `${Math.round(Store.DEMO_FEE_RATE * 100)}% (giả định demo)`
    root.querySelector('[data-tm-rev-held]').textContent = Store.formatMoney(Store.heldSummary(tutorId))
    root.querySelector('[data-tm-rev-planned]').textContent = Store.formatMoney(Store.plannedSummary(tutorId))
    root.querySelector('[data-tm-rev-refunded]').textContent = Store.formatMoney(Store.refundedSummary(tutorId))
    root.querySelector('[data-tm-rev-wallet]').textContent = Store.formatMoney(wallet.availableToUse)
  }

  const renderBar = () => {
    const metric = chartMetric.value
    const series = Store.revenueSeries({ tutorId, metric, from: chartFrom.value || null, to: chartTo.value || null })
    window.EduChart.bar(barContainer, {
      title: 'Giải ngân theo ngày',
      metricLabel: METRIC_LABELS[metric] || metric,
      unit: series.unit || (metric === 'count' ? 'buổi' : 'đ'),
      from: series.from || chartFrom.value || null,
      to: series.to || chartTo.value || null,
      rows: series.rows,
      total: series.total,
      invalidReason: series.invalid ? series.reason : null,
      emptyLabel: 'Chưa có khoản giải ngân nào trong khoảng ngày này.',
      description: `Biểu đồ cột doanh thu đã giải ngân của gia sư ${tutorId} theo ngày, chỉ số ${METRIC_LABELS[metric] || metric}.`
    })
  }

  const renderPie = () => {
    const orders = myOrders()
    const slices = Object.keys(ORDER_STATUS).map(key => ({ key, label: ORDER_STATUS[key].label, count: orders.filter(order => order.status === key).length }))
    window.EduChart.pie(pieContainer, {
      title: 'Trạng thái đơn của gia sư',
      slices,
      emptyLabel: 'Chưa có đơn đăng ký nào để thống kê.',
      description: `Biểu đồ tròn phân bố ${orders.length} đơn đăng ký của gia sư ${tutorId} theo trạng thái.`
    })
  }

  const renderCharts = () => {
    renderRevenue()
    renderBar()
    renderPie()
  }

  chartForm.addEventListener('submit', event => { event.preventDefault(); renderBar() })
  chartMetric.addEventListener('change', renderBar)

  /* Sự kiện chung */

  root.addEventListener('click', event => {
    const createButton = event.target.closest('[data-tm-create]')
    if (createButton) { openCreate(createButton.dataset.tmCreate); return }
    const editButton = event.target.closest('[data-tm-edit]')
    if (editButton) { openEdit(editButton.dataset.tmEdit); return }
    const detailOfferingButton = event.target.closest('[data-tm-detail-offering]')
    if (detailOfferingButton) { openOfferingDetail(detailOfferingButton.dataset.tmDetailOffering); return }
    const detailOrderButton = event.target.closest('[data-tm-detail-order]')
    if (detailOrderButton) { openOrderDetail(detailOrderButton.dataset.tmDetailOrder); return }
    const transitionButton = event.target.closest('[data-tm-transition]')
    if (transitionButton) {
      const [offeringId, action] = transitionButton.dataset.tmTransition.split(':')
      openTransition(offeringId, action)
    }
  })

  ;[[serviceSearch, serviceStatus], [classSearch, classStatus]].forEach(([searchInput, statusSelect]) => {
    searchInput.addEventListener('input', () => (searchInput.dataset.tmType === 'SERVICE' ? renderServices() : renderClasses()))
    statusSelect.addEventListener('change', () => (statusSelect.dataset.tmType === 'SERVICE' ? renderServices() : renderClasses()))
  })

  const renderAll = () => {
    renderServices()
    renderClasses()
    renderOrders()
    renderRevenue()
  }

  renderAll()
  renderPie()
  renderBar()
  activateTab(initialTab)
})()
