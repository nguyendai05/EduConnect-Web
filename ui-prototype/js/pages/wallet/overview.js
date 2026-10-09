/* Static wallet ledger for the HTML UI; replace with authenticated server data in JSP. */
(() => {
  const transactions = [
    { id: 'TR-261005-9981', type: 'release', title: 'Giải ngân buổi 2 · Toán 11', date: '2026-10-05', time: '20:30', amount: -220000, account: 'Ký quỹ', before: 1540000, after: 1320000, status: 'Đã giải ngân', contract: 'HD-20260919-024' },
    { id: 'TR-260928-1120', type: 'release', title: 'Giải ngân buổi 1 · Toán 11', date: '2026-09-28', time: '21:02', amount: -220000, account: 'Ký quỹ', before: 1760000, after: 1540000, status: 'Đã giải ngân', contract: 'HD-20260919-024' },
    { id: 'PAYOS-260919-8F4K2', type: 'payos', title: 'Thanh toán ký quỹ qua PayOS', date: '2026-09-19', time: '22:05', amount: 1160000, account: 'Ký quỹ', before: 600000, after: 1760000, status: 'Thành công', contract: 'HD-20260919-024' },
    { id: 'TR-ESC-260919-02', type: 'escrow', title: 'Trích số dư ví để ký quỹ', date: '2026-09-19', time: '22:02', amount: -600000, account: 'Khả dụng', before: 940000, after: 340000, status: 'Thành công', contract: 'HD-20260919-024', note: '600.000 ₫ được chuyển từ số dư khả dụng sang ký quỹ hợp đồng.' },
    { id: 'REF-260915-0012', type: 'refund', title: 'Hoàn tiền buổi học đã hủy', date: '2026-09-15', time: '18:10', amount: 180000, account: 'Khả dụng', before: 760000, after: 940000, status: 'Đã hoàn tiền', contract: 'HD-20260810-018' },
    { id: 'REF-260830-0008', type: 'refund', title: 'Hoàn ký quỹ hợp đồng kết thúc', date: '2026-08-30', time: '09:20', amount: 220000, account: 'Khả dụng', before: 540000, after: 760000, status: 'Đã hoàn tiền', contract: 'HD-20260715-012' }
  ]
  const money = value => new Intl.NumberFormat('vi-VN').format(value) + ' ₫'
  const dateLabel = date => date.split('-').reverse().join('/')
  const byId = id => document.getElementById(id)
  let category = 'all'
  let page = 1
  const pageSize = 4
  const detail = document.createElement('dl')
  detail.className = 'wallet-detail'
  byId('shared-modal').querySelector('.modal__body').after(detail)
  const validDates = () => !byId('date-from').value || !byId('date-to').value || byId('date-from').value <= byId('date-to').value
  const filtered = () => validDates() ? transactions.filter(t =>
    (category === 'all' || t.type === category) &&
    (!byId('date-from').value || t.date >= byId('date-from').value) &&
    (!byId('date-to').value || t.date <= byId('date-to').value)) : []
  const render = () => {
    const items = filtered()
    const pages = Math.max(1, Math.ceil(items.length / pageSize))
    page = Math.min(page, pages)
    byId('filter-error').hidden = validDates()
    byId('filter-error').textContent = 'Ngày bắt đầu không được sau ngày kết thúc.'
    byId('export-statement').disabled = !items.length
    const panel = byId('panel-' + category)
    panel.replaceChildren()
    if (!items.length) {
      panel.innerHTML = '<section class="empty-state"><span class="empty-state__icon" aria-hidden="true"></span><h3 class="empty-state__title">Không có giao dịch phù hợp</h3><p class="empty-state__description">Chọn khoảng ngày hoặc loại giao dịch khác.</p></section>'
    } else {
      const wrapper = document.createElement('div')
      wrapper.className = 'table-wrapper'
      wrapper.tabIndex = 0
      wrapper.setAttribute('role', 'region')
      wrapper.setAttribute('aria-label', 'Danh sách giao dịch, có thể cuộn ngang')
      wrapper.innerHTML = '<table class="table"><caption class="table__caption">Giao dịch trong kỳ</caption><thead><tr><th scope="col">Giao dịch</th><th scope="col">Số tiền</th><th scope="col">Trạng thái</th><th scope="col">Thao tác</th></tr></thead><tbody></tbody></table>'
      items.slice((page - 1) * pageSize, page * pageSize).forEach(t => {
        const row = document.createElement('tr')
        row.innerHTML = '<th scope="row">' + t.title + '<small>' + t.id + '</small><small>' + dateLabel(t.date) + ' · ' + t.time + '</small></th><td class="table__amount ' + (t.amount > 0 ? 'wallet-credit' : '') + '">' + (t.amount > 0 ? '+' : '−') + money(Math.abs(t.amount)) + '<small>' + t.account + '</small></td><td><span class="table__status table__status--success">' + t.status + '</span></td><td><button class="wallet-button" type="button" data-transaction="' + t.id + '" aria-label="Chi tiết ' + t.id + '">Chi tiết</button></td>'
        wrapper.querySelector('tbody').append(row)
      })
      panel.append(wrapper)
    }
    byId('transaction-count').textContent = items.length ? 'Hiển thị ' + ((page - 1) * pageSize + 1) + '–' + Math.min(page * pageSize, items.length) + ' / ' + items.length + ' giao dịch' : '0 giao dịch'
    byId('page-number').textContent = page + ' / ' + pages
    byId('previous-page').disabled = page === 1
    byId('next-page').disabled = page === pages
  }
  byId('transaction-tabs').addEventListener('tabs:change', event => { category = event.detail.tabId.replace('tab-', ''); page = 1; render() })
  for (const id of ['date-from', 'date-to']) byId(id).addEventListener('change', () => { page = 1; render() })
  byId('reset-dates').addEventListener('click', () => { byId('date-from').value = ''; byId('date-to').value = ''; page = 1; render() })
  byId('previous-page').addEventListener('click', () => { page--; render() })
  byId('next-page').addEventListener('click', () => { page++; render() })
  byId('transactions').addEventListener('click', event => {
    const button = event.target.closest('[data-transaction]')
    if (!button) return
    const t = transactions.find(item => item.id === button.dataset.transaction)
    detail.hidden = false
    detail.replaceChildren()
    const fields = [['Mã giao dịch', t.id], ['Thời gian', dateLabel(t.date) + ' · ' + t.time], ['Hợp đồng', t.contract], ['Tài khoản biến động', t.account], ['Số dư trước', money(t.before)], ['Biến động', (t.amount > 0 ? '+' : '−') + money(Math.abs(t.amount))], ['Số dư sau', money(t.after)], ['Trạng thái', t.status]]
    fields.forEach(([label, value]) => {
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd')
      dt.textContent = label
      dd.textContent = value
      row.append(dt, dd)
      detail.append(row)
    })
    window.EduModal.open('shared-modal', { title: t.title, message: t.note || 'Đối chiếu biến động của giao dịch với số dư tài khoản liên quan.', variant: 'info' })
  })
  byId('wallet-policy').addEventListener('click', () => {
    detail.hidden = true
    window.EduModal.open('shared-modal', { title: 'Chính sách số dư & rút tiền', message: 'Số dư khả dụng được dùng để cấn trừ học phí hợp đồng mới. Khoản đang ký quỹ không thể sử dụng cho giao dịch khác. Tiền hoàn được ghi nhận vào số dư sau khi yêu cầu được duyệt. Việc rút tiền cần tài khoản ngân hàng và thông tin định danh được xác thực.', variant: 'info' })
  })
  byId('export-statement').addEventListener('click', () => {
    const items = filtered()
    if (!items.length) return
    const rows = [['Mã giao dịch', 'Ngày', 'Giờ', 'Nội dung', 'Hợp đồng', 'Tài khoản', 'Số tiền (VND)', 'Trạng thái'], ...items.map(t => [t.id, t.date, t.time, t.title, t.contract, t.account, t.amount, t.status])]
    const csv = '\uFEFF' + rows.map(row => row.map(cell => '"' + String(cell).replaceAll('"', '""') + '"').join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'sao-ke-vi-' + category + '.csv'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    window.EduToast.show({ type: 'success', title: 'Đã tạo sao kê', message: items.length + ' giao dịch theo bộ lọc hiện tại.' })
  })
  const walletLink = document.querySelector('[data-menu-item="2"]')
  walletLink.href = '#wallet'
  walletLink.querySelector('[data-menu-label]').textContent = 'Ví Edu Connect'
  document.querySelector('[data-menu-item="1"]').href = '../contract/student-detail.html'
  document.querySelector('[data-menu-item="4"]').href = '#transactions'
  render()
})()
