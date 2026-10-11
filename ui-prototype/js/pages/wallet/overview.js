/* Ví demo đọc từ EduStore: số dư theo persona phiên, ledger theo ownerId.
 * availableToUse / escrowHeld / grossReleased / tutorNetReleased / platformFeeReleased /
 * held / planned / refunded là các khái niệm riêng, hiển thị tách bạch.
 * Doanh thu gia sư chỉ tính từ sự kiện release; withdrawal không phải doanh thu. */
(() => {
  const Route = window.EduRoute
  const Store = window.EduStore
  if (!Route || !Store) return

  const byId = id => document.getElementById(id)
  const { formatMoney, formatDate, CONTRACT_STATUS, statusOf } = Store

  /**
   * Chot an toan: script nay doc theo bo hook moi, nen neu HTML chua duoc cap nhat thi
   * khong duoc phep de lai gia tri tinh cua ban ghi khac tren trang (seo sai lech
   * so du lieu theo §5.3). Thay vao do hien loi ro rang va dung ve.
   */
  const REQUIRED_IDS = ['wallet-content', 'wallet-missing', 'wallet-balances', 'wallet-revenue', 'revenue-invariant', 'wallet-owner-line', 'owner-name', 'owner-role', 'owner-initials', 'balances-persona', 'crumb-parent', 'sidebar-primary-link']
  const absentIds = REQUIRED_IDS.filter(id => !document.getElementById(id))
  if (absentIds.length) {
    const main = document.querySelector('main')
    if (main) {
      const notice = document.createElement('div')
      notice.className = 'alert alert--error'
      notice.setAttribute('role', 'alert')
      const title = document.createElement('strong')
      title.textContent = 'Trang ví chưa hiển thị số dư. '
      const detail = document.createElement('span')
      detail.textContent = `Script đang đọc theo cấu trúc dữ liệu dùng chung nhưng ${absentIds.length} phần tử bắt buộc không có trong trang (${absentIds.join(', ')}). Trang không hiển thị số dư mẫu cũ để tránh đưa sai lệch số liệu.`
      notice.append(title, detail)
      main.replaceChildren(notice)
    }
    return
  }

  const session = Store.getSession()
  const persona = session.persona
  const learnerId = Store.sessionLearnerId()
  const tutorId = Store.sessionTutorId()
  const ownerId = learnerId || tutorId
  const isTutor = Boolean(tutorId)

  const header = document.querySelector('.user-header')
  if (header) {
    header.dataset.userVariant = isTutor ? 'TUTOR' : (persona && persona.headerVariant) || 'A'
  }

  if (!ownerId) {
    byId('wallet-content').hidden = true
    byId('wallet-missing').hidden = false
    return
  }

  const wallet = Store.walletOf(ownerId)
  const summary = Store.walletSummary(ownerId)
  const netReleased = summary.tutorNetReleased || 0
  const feeReleased = summary.platformFeeReleased || 0
  const heldTotal = summary.held || 0
  const plannedTotal = summary.planned || 0
  const withdrawnTotal = Store.list('financialEvents')
    .filter(event => event.type === 'withdrawal' && event.tutorId === ownerId)
    .reduce((sum, event) => sum + Store.toInteger(event.withdrawn || 0), 0)

  const ownerRecord = isTutor ? Store.tutor(ownerId) : Store.learner(ownerId)
  const ownerName = ownerRecord ? ownerRecord.name : ownerId
  const ownerRole = isTutor ? 'Gia sư' : 'Học viên / Phụ huynh'

  byId('wallet-owner-line').textContent = `Chủ ví: ${ownerName} (${ownerId}) · ${isTutor ? 'Ví thù lao gia sư' : 'Ví học viên'}`
  byId('owner-name').textContent = ownerName
  byId('owner-role').textContent = ownerRole
  byId('owner-initials').textContent = (ownerRecord && ownerRecord.initials) || '—'
  byId('balances-persona').textContent = persona.label || persona.id

  const crumb = byId('crumb-parent')
  const sidebarLink = byId('sidebar-primary-link')
  if (isTutor) {
    crumb.href = Route.page('tutorManage', { tab: 'orders' })
    crumb.textContent = 'Quản lý của gia sư'
    sidebarLink.href = Route.page('tutorManage', { tab: 'orders' })
    sidebarLink.textContent = 'Đơn đăng ký'
  } else {
    crumb.href = Route.page('orderHistory')
    crumb.textContent = 'Đơn đăng ký của tôi'
    sidebarLink.href = Route.page('orderHistory')
    sidebarLink.textContent = 'Đơn đăng ký của tôi'
  }

  /* ---------------- Số dư: mỗi khái niệm một thẻ riêng ---------------- */

  const balanceCard = (variant, title, amount, description) => {
    const card = document.createElement('article')
    card.className = `wallet-balance-card wallet-balance-card--${variant}`
    const headingId = `balance-${variant}-${title.length}`
    card.setAttribute('aria-labelledby', headingId)
    const head = document.createElement('header')
    head.className = 'wallet-balance-card__header'
    const h2 = document.createElement('h2')
    h2.className = 'wallet-balance-card__title'
    h2.id = headingId
    h2.textContent = title
    const icon = document.createElement('span')
    icon.className = 'wallet-balance-card__icon'
    icon.setAttribute('aria-hidden', 'true')
    head.append(h2, icon)
    const amountNode = document.createElement('p')
    amountNode.className = 'wallet-balance-card__amount'
    const value = document.createElement('span')
    value.textContent = formatMoney(amount).replace(/\s*₫\s*$/, '')
    amountNode.append(value)
    const unit = document.createElement('span')
    unit.textContent = ' ₫'
    amountNode.append(unit)
    const desc = document.createElement('p')
    desc.className = 'wallet-balance-card__description'
    desc.textContent = description
    card.append(head, amountNode, desc)
    return card
  }

  const balances = byId('wallet-balances')
  if (isTutor) {
    balances.append(
      balanceCard('available', 'Số dư khả dụng', summary.availableToUse, 'Số dư có thể rút về ngân hàng hoặc chờ cấn trừ. Đã gồm phần thực nhận giải ngân.'),
      balanceCard('escrow', 'Escrow đang giữ', summary.escrowHeld, 'Tiền học viên ký quỹ cho lớp của bạn, chưa giải ngân — chưa phải doanh thu.'),
      balanceCard('pending', 'Đã rút về ngân hàng', withdrawnTotal, 'Withdrawal chỉ chuyển số dư ra ngân hàng, không tạo doanh thu lần nữa.')
    )
    byId('balances-note').textContent = wallet
      ? 'Số dư khả dụng và escrow là hai khoản riêng; escrow không dùng để thanh toán hay rút.'
      : 'Ví của gia sư này chưa có số dư trong dữ liệu mẫu; các khoản dưới đây tính từ sự kiện tài chính.'
  } else {
    balances.append(
      balanceCard('available', 'Số dư khả dụng', summary.availableToUse, 'Dùng để cấn trừ học phí hợp đồng tiếp theo. Không phải doanh thu.'),
      balanceCard('escrow', 'Đang ký quỹ (escrow)', summary.escrowHeld, 'Nền tảng đang giữ cho hợp đồng; không khả dụng cho giao dịch khác.'),
      balanceCard('pending', 'Đã hoàn tiền', summary.refunded, 'Tổng tiền hoàn đã ghi nhận về ví, tách riêng với số dư khả dụng.')
    )
    byId('balances-note').textContent = wallet
      ? 'Khả dụng, ký quỹ và tiền hoàn là ba khái niệm riêng, không cộng dồn vào nhau.'
      : 'Ví này chưa có bản ghi trong dữ liệu mẫu.'
  }

  /* ---------------- Doanh thu gia sư: chỉ từ release event ---------------- */

  const breakdownRow = (term, value, note) => {
    const row = document.createElement('div')
    const dt = document.createElement('dt')
    dt.textContent = term
    const dd = document.createElement('dd')
    const strong = document.createElement('strong')
    strong.textContent = formatMoney(value)
    dd.append(strong)
    if (note) {
      const small = document.createElement('small')
      small.textContent = note
      dd.append(small)
    }
    row.append(dt, dd)
    return row
  }

  if (isTutor) {
    const revenuePanel = byId('wallet-revenue')
    revenuePanel.hidden = false
    const revenue = byId('revenue-breakdown')
    revenue.append(
      breakdownRow('Tổng đã giải ngân (grossReleased)', summary.grossReleased, 'Tổng tiền giải ngân từ escrow, gồm cả phí nền tảng.'),
      breakdownRow('Gia sư thực nhận (tutorNetReleased)', netReleased, 'Phần chuyển vào số dư khả dụng của bạn.'),
      breakdownRow('Phí nền tảng (platformFeeReleased)', feeReleased, `Mức phí demo ${Math.round((Store.DEMO_FEE_RATE || 0) * 100)}% — giả định chưa chốt.`)
    )
    const invariantOk = summary.grossReleased === netReleased + feeReleased
    byId('revenue-invariant').textContent = invariantOk
      ? `Đối soát: ${formatMoney(summary.grossReleased)} = ${formatMoney(netReleased)} + ${formatMoney(feeReleased)} (grossReleased = tutorNetReleased + platformFeeReleased).`
      : 'Cảnh báo đối soát: tổng giải ngân không khớp phần thực nhận cộng phí nền tảng.'
    byId('non-revenue-breakdown').append(
      breakdownRow('Escrow đang giữ (suy từ payment − release − refund)', heldTotal, 'Không tính vào doanh thu.'),
      breakdownRow('Dự kiến giải ngân (planned)', plannedTotal, 'Kế hoạch tương lai, chưa phải doanh thu.'),
      breakdownRow('Đã hoàn tiền (refunded)', summary.refunded, 'Tiền hoàn cho học viên, không phải doanh thu.'),
      breakdownRow('Đã rút về ngân hàng (withdrawal)', withdrawnTotal, 'Chuyển số dư ra ngoài, không tạo doanh thu mới.')
    )
  }

  /* ---------------- Hợp đồng liên quan ---------------- */

  const contracts = Store.list('contracts').filter(item => (isTutor ? item.tutorId === ownerId : item.learnerId === ownerId))
  const contractsNode = byId('wallet-contracts')
  byId('escrow-empty').hidden = contracts.length > 0
  contracts.forEach(contract => {
    const order = Store.order(contract.orderId)
    const item = order && order.items && order.items[0]
    const status = statusOf(CONTRACT_STATUS, contract.status)
    const card = document.createElement('article')
    card.className = 'wallet-contract'
    const heading = document.createElement('div')
    heading.className = 'wallet-section-heading'
    const titleWrap = document.createElement('div')
    const h3 = document.createElement('h3')
    h3.textContent = item ? item.offeringTitle : contract.id
    const meta = document.createElement('p')
    meta.textContent = `${contract.id} · ${isTutor ? 'Học viên ' + (Store.learner(contract.learnerId) || {}).name : 'Gia sư ' + ((Store.tutor(contract.tutorId) || {}).name || contract.tutorId)}`
    titleWrap.append(h3, meta)
    const badge = document.createElement('span')
    badge.className = `badge ${status.badge}`
    badge.textContent = status.label
    heading.append(titleWrap, badge)
    const progressLabel = document.createElement('label')
    progressLabel.textContent = `Đã hoàn thành ${contract.completedSessions} / ${contract.sessions} buổi · Tổng ${formatMoney(contract.total)}`
    const progress = document.createElement('progress')
    progress.max = contract.sessions
    progress.value = contract.completedSessions
    progress.textContent = `${contract.completedSessions}/${contract.sessions}`
    const progressId = `contract-progress-${contract.id}`
    progress.id = progressId
    progressLabel.setAttribute('for', progressId)
    const link = document.createElement('a')
    link.className = 'wallet-button wallet-button--secondary'
    link.href = isTutor
      ? Route.page('contractTutorDetail', { id: contract.id })
      : Route.page('contractStudentDetail', { id: contract.id })
    link.textContent = 'Xem chi tiết hợp đồng'
    card.append(heading, progressLabel, progress, link)
    contractsNode.append(card)
  })

  /* ---------------- Ledger #transactions ---------------- */

  const ledger = Store.list('ledger')
    .filter(entry => entry.ownerId === ownerId)
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
  const KIND_LABELS = { escrow: 'Ký quỹ', release: 'Giải ngân', refund: 'Hoàn tiền', withdrawal: 'Rút tiền' }
  let category = 'all'
  let page = 1
  const pageSize = 5

  const detail = document.createElement('dl')
  detail.className = 'wallet-detail'
  detail.hidden = true
  byId('shared-modal').querySelector('.modal__body').after(detail)

  const validDates = () => !byId('date-from').value || !byId('date-to').value || byId('date-from').value <= byId('date-to').value
  const dayOf = entry => String(entry.at || '').slice(0, 10)
  const filtered = () => validDates() ? ledger.filter(entry =>
    (category === 'all' || entry.kind === category) &&
    (!byId('date-from').value || dayOf(entry) >= byId('date-from').value) &&
    (!byId('date-to').value || dayOf(entry) <= byId('date-to').value)) : []

  const refHref = entry => {
    if (!entry.refId) return null
    if (entry.refType === 'contract') return isTutor ? Route.page('contractTutorDetail', { id: entry.refId }) : Route.page('contractStudentDetail', { id: entry.refId })
    if (entry.refType === 'order') return Route.page('orderHistory', { id: entry.refId })
    if (entry.refType === 'payout') return Route.page('adminPayoutRequestDetail', { id: entry.refId })
    return null
  }

  const buildTable = items => {
    const wrapper = document.createElement('div')
    wrapper.className = 'table-wrapper'
    wrapper.tabIndex = 0
    wrapper.setAttribute('role', 'region')
    wrapper.setAttribute('aria-label', 'Danh sách giao dịch, có thể cuộn ngang')
    const table = document.createElement('table')
    table.className = 'table'
    const caption = document.createElement('caption')
    caption.className = 'table__caption table__caption--sr-only'
    caption.textContent = 'Bút toán ví trong kỳ, mã BT-*, kèm tham chiếu hợp đồng/đơn/yêu cầu rút'
    const head = document.createElement('thead')
    head.innerHTML = '<tr><th scope="col">Giao dịch</th><th scope="col">Số tiền</th><th scope="col">Số dư sau</th><th scope="col">Thao tác</th></tr>'
    const body = document.createElement('tbody')
    items.forEach(entry => {
      const row = document.createElement('tr')
      const th = document.createElement('th')
      th.scope = 'row'
      const title = document.createElement('span')
      title.textContent = entry.label
      th.append(title)
      const kind = document.createElement('small')
      kind.textContent = KIND_LABELS[entry.kind] || entry.kind
      th.append(kind)
      const ref = document.createElement('small')
      const href = refHref(entry)
      if (href) {
        const link = document.createElement('a')
        link.href = href
        link.textContent = `${entry.refType === 'contract' ? 'Hợp đồng' : entry.refType === 'order' ? 'Đơn' : 'Yêu cầu rút'} ${entry.refId}`
        ref.append(link)
      } else {
        ref.textContent = entry.refId ? `${entry.refType} ${entry.refId}` : 'Không có tham chiếu'
      }
      th.append(ref)
      const code = document.createElement('small')
      code.textContent = `${entry.id} · ${formatDate(entry.at, true)}`
      th.append(code)
      const amount = document.createElement('td')
      amount.className = 'table__amount' + (entry.direction === 'in' ? ' wallet-credit' : '')
      amount.textContent = `${entry.direction === 'in' ? '+' : '−'}${formatMoney(entry.amount)}`
      const after = document.createElement('td')
      after.className = 'table__amount'
      after.textContent = formatMoney(entry.balanceAfter)
      const action = document.createElement('td')
      const button = document.createElement('button')
      button.className = 'wallet-button'
      button.type = 'button'
      button.dataset.transaction = entry.id
      button.textContent = 'Chi tiết'
      button.setAttribute('aria-label', `Chi tiết giao dịch ${entry.id}`)
      action.append(button)
      row.append(th, amount, after, action)
      body.append(row)
    })
    table.append(caption, head, body)
    wrapper.append(table)
    return wrapper
  }

  const render = () => {
    const items = filtered()
    const pages = Math.max(1, Math.ceil(items.length / pageSize))
    page = Math.min(Math.max(1, page), pages)
    byId('filter-error').hidden = validDates()
    byId('filter-error').textContent = 'Ngày bắt đầu không được sau ngày kết thúc.'
    byId('export-statement').disabled = !items.length
    const panel = byId('panel-' + category)
    panel.replaceChildren()
    if (!items.length) {
      const empty = document.createElement('div')
      empty.innerHTML = '<section class="empty-state"><span class="empty-state__icon" aria-hidden="true"></span><h3 class="empty-state__title">Không có giao dịch phù hợp</h3><p class="empty-state__description">Chọn khoảng ngày hoặc loại giao dịch khác.</p></section>'
      panel.append(empty)
    } else {
      panel.append(buildTable(items.slice((page - 1) * pageSize, page * pageSize)))
    }
    byId('transaction-count').textContent = items.length
      ? `Hiển thị ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, items.length)} / ${items.length} giao dịch`
      : '0 giao dịch'
    byId('page-number').textContent = `${page} / ${pages}`
    byId('previous-page').disabled = page === 1
    byId('next-page').disabled = page === pages
  }

  byId('transaction-tabs').addEventListener('tabs:change', event => {
    category = event.detail.tabId.replace('tab-', '')
    page = 1
    render()
  })
  for (const id of ['date-from', 'date-to']) byId(id).addEventListener('change', () => { page = 1; render() })
  byId('reset-dates').addEventListener('click', () => { byId('date-from').value = ''; byId('date-to').value = ''; page = 1; render() })
  byId('previous-page').addEventListener('click', () => { page--; render() })
  byId('next-page').addEventListener('click', () => { page++; render() })

  byId('transactions').addEventListener('click', event => {
    const button = event.target.closest('[data-transaction]')
    if (!button) return
    const entry = ledger.find(item => item.id === button.dataset.transaction)
    if (!entry) return
    detail.hidden = false
    detail.replaceChildren()
    const fields = [
      ['Mã bút toán', entry.id],
      ['Thời gian', formatDate(entry.at, true)],
      ['Loại', KIND_LABELS[entry.kind] || entry.kind],
      ['Nội dung', entry.label],
      ['Biến động', `${entry.direction === 'in' ? '+' : '−'}${formatMoney(entry.amount)}`],
      ['Số dư khả dụng sau', formatMoney(entry.balanceAfter)]
    ]
    fields.forEach(([label, value]) => {
      const row = document.createElement('div')
      const dt = document.createElement('dt')
      const dd = document.createElement('dd')
      dt.textContent = label
      dd.textContent = value
      row.append(dt, dd)
      detail.append(row)
    })
    const refRow = document.createElement('div')
    const refLabel = document.createElement('dt')
    refLabel.textContent = 'Tham chiếu'
    const refValue = document.createElement('dd')
    const href = refHref(entry)
    if (href) {
      const link = document.createElement('a')
      link.href = href
      link.textContent = `${entry.refType} ${entry.refId}`
      refValue.append(link)
    } else {
      refValue.textContent = entry.refId ? `${entry.refType} ${entry.refId}` : 'Không có'
    }
    refRow.append(refLabel, refValue)
    detail.append(refRow)
    window.EduModal.open('shared-modal', {
      title: entry.label,
      message: entry.kind === 'withdrawal'
        ? 'Rút tiền là chuyển số dư khả dụng ra ngân hàng (mô phỏng), không phải doanh thu mới.'
        : 'Đối chiếu biến động của bút toán với số dư tài khoản liên quan. Giao dịch mô phỏng.',
      variant: 'info'
    })
  })

  byId('wallet-policy').addEventListener('click', () => {
    detail.hidden = true
    window.EduModal.open('shared-modal', {
      title: 'Chính sách số dư & rút tiền (demo)',
      message: 'Số dư khả dụng dùng để cấn trừ học phí hoặc rút về ngân hàng (mô phỏng). Escrow đang giữ không khả dụng. Doanh thu gia sư chỉ ghi nhận khi có sự kiện giải ngân (release): tổng giải ngân bằng phần thực nhận cộng phí nền tảng. Tiền đang hold hoặc planned chưa phải doanh thu; rút tiền không tạo doanh thu lần nữa. Chính sách phí và hoàn tiền là giả định demo chưa được chốt.',
      variant: 'info'
    })
  })

  byId('export-statement').addEventListener('click', () => {
    const items = filtered()
    if (!items.length) return
    const rows = [['Mã bút toán', 'Thời gian', 'Loại', 'Nội dung', 'Tham chiếu', 'Số tiền (VND)', 'Số dư sau (VND)'],
      ...items.map(entry => [entry.id, entry.at, KIND_LABELS[entry.kind] || entry.kind, entry.label, `${entry.refType || ''} ${entry.refId || ''}`.trim(), entry.direction === 'in' ? entry.amount : -entry.amount, entry.balanceAfter])]
    const csv = '\uFEFF' + rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `sao-ke-vi-${ownerId}-${category}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    window.EduToast.show({ type: 'success', title: 'Đã tạo sao kê', message: `${items.length} giao dịch mô phỏng theo bộ lọc hiện tại.` })
  })

  render()
})()
