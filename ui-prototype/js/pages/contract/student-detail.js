/* Page-only interaction state; connect to server data when integrating JSP. */
(() => {
  // Configure the shared header without changing the teammate's component source.
  const header = document.querySelector('[data-component="user-header"]')
  const walletLink = header.querySelector('[data-menu-item="2"]')
  walletLink.querySelector('[data-menu-label]').textContent = 'Ví Edu Connect'
  walletLink.href = '#finance'
  header.querySelector('[data-menu-item="1"]').href = '#contract'
  header.querySelector('[data-menu-item="4"]').href = '#history-title'
  const dates = ['28/09/2026', '02/10/2026', '05/10/2026', '09/10/2026', '12/10/2026', '16/10/2026', '19/10/2026', '23/10/2026']
  const lessons = dates.map((date, index) => ({ id: index + 1, date, status: index < 2 ? 'completed' : index === 2 ? 'pending' : 'upcoming' }))
  const labels = { completed: 'Đã hoàn thành', pending: 'Chờ xác nhận', upcoming: 'Sắp tới', reported: 'Chờ xử lý' }
  const list = document.getElementById('lesson-list')
  const modal = document.getElementById('shared-modal')
  let filter = 'all'
  let action = null
  let selected = null
  const money = value => new Intl.NumberFormat('vi-VN').format(value) + ' ₫'
  const report = document.createElement('div')
  report.className = 'contract-report form-field'
  report.hidden = true
  report.innerHTML = '<label class="form-field__label" for="report-detail">Nội dung cần hỗ trợ</label><textarea class="textarea-control" id="report-detail" maxlength="2000" aria-describedby="report-error" placeholder="Mô tả vấn đề xảy ra trong buổi học..."></textarea><p class="form-field__message form-field__message--error" hidden id="report-error" role="alert"></p>'
  modal.querySelector('.modal__body').after(report)
  const render = () => {
    list.replaceChildren()
    const visible = lessons.filter(lesson => filter === 'all' || lesson.status === filter)
    visible.forEach(lesson => {
      const card = document.createElement('article')
      card.className = 'lesson-card lesson-card--' + (lesson.status === 'reported' ? 'pending' : lesson.status)
      card.id = 'lesson-' + lesson.id
      card.setAttribute('aria-labelledby', 'lesson-title-' + lesson.id)
      const detail = lesson.status === 'completed' ? 'Ký quỹ: Đã giải ngân 220.000 ₫' : lesson.status === 'reported' ? 'Báo cáo đang chờ xử lý · Tạm dừng xác nhận tự động' : lesson.status === 'pending' ? 'Gia sư đã điểm danh lúc 20:34 · Ký quỹ đang giữ: 220.000 ₫' : 'Ký quỹ đang giữ: 220.000 ₫'
      card.innerHTML = `<span class="lesson-card__icon" aria-hidden="true"></span><div class="lesson-card__content"><header class="lesson-card__header"><h3 class="lesson-card__title" id="lesson-title-${lesson.id}">Buổi ${lesson.id} · ${lesson.date}</h3><span class="lesson-card__status">${labels[lesson.status]}</span></header><p class="lesson-card__schedule">19:00–20:30 · Toán lớp 11</p><p class="lesson-card__detail">${detail}</p><div class="contract-lesson-actions">${lesson.status === 'pending' ? `<button class="contract-button" type="button" data-action="confirm" data-lesson="${lesson.id}">Xác nhận buổi ${lesson.id}</button><button class="contract-button contract-button--plain" type="button" data-action="report" data-lesson="${lesson.id}">Báo vấn đề</button>` : `<button class="contract-button contract-button--secondary" type="button" data-action="detail" data-lesson="${lesson.id}">Chi tiết buổi học</button>`}</div></div>`
      list.append(card)
    })
    document.getElementById('lessons-empty').hidden = visible.length > 0
    document.getElementById('filter-status').textContent = `Đang hiển thị ${visible.length} buổi học.`
    const completed = lessons.filter(l => l.status === 'completed').length
    const pending = lessons.filter(l => l.status === 'pending').length
    document.getElementById('completion-summary').textContent = `${completed} buổi hoàn thành · ${pending} buổi chờ xác nhận`
    document.getElementById('released-money').textContent = money(completed * 220000)
    document.getElementById('held-money').textContent = money((8 - completed) * 220000)
    document.getElementById('finance-progress').value = completed * 220000
    document.querySelectorAll('[data-filter]').forEach(button => {
      const value = button.dataset.filter
      const title = { all: 'Tất cả', completed: 'Hoàn thành', pending: 'Chờ xác nhận', upcoming: 'Sắp tới' }[value]
      button.textContent = `${title} (${value === 'all' ? lessons.length : lessons.filter(l => l.status === value).length})`
      button.setAttribute('aria-pressed', String(value === filter))
      button.classList.toggle('filter-chip--selected', value === filter)
    })
  }
  const info = (title, message) => {
    action = null
    report.hidden = true
    window.EduModal.open(modal, { title, message, variant: 'info' })
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action], [data-filter]')
    if (!button) return
    if (button.dataset.filter) { filter = button.dataset.filter; render(); return }
    action = button.dataset.action
    selected = lessons.find(l => l.id === Number(button.dataset.lesson))
    report.hidden = true
    if (action === 'confirm' && selected?.status === 'pending') {
      window.EduModal.open(modal, { title: `Xác nhận hoàn thành buổi ${selected.id}?`, message: `Buổi học ngày ${selected.date}, 19:00–20:30 với gia sư Nguyễn Minh Anh. Chỉ xác nhận khi buổi học đã diễn ra đầy đủ. Khoản ký quỹ của buổi học là 220.000 ₫.`, confirmText: 'Xác nhận hoàn thành' })
    } else if (action === 'report' && selected?.status === 'pending') {
      report.hidden = false
      report.querySelector('textarea').value = ''
      document.getElementById('report-error').textContent = ''
      document.getElementById('report-error').hidden = true
      report.querySelector('textarea').removeAttribute('aria-invalid')
      window.EduModal.open(modal, { title: `Báo vấn đề · Buổi ${selected.id}`, message: 'Mô tả vấn đề để bộ phận hỗ trợ xem xét. Buổi học sẽ chuyển sang trạng thái chờ xử lý.', confirmText: 'Gửi báo cáo' })
    } else if (action === 'detail' && selected) info(`Buổi ${selected.id} · ${selected.date}`, `Toán lớp 11 · 19:00–20:30 · Gia sư Nguyễn Minh Anh. Trạng thái: ${labels[selected.status]}. Học phí: 220.000 ₫.`)
    else if (action === 'policy') info('Quy định đổi lịch', 'Hãy trao đổi và thống nhất với gia sư trước ít nhất 24 giờ nếu bạn cần thay đổi lịch học. Các trường hợp phát sinh sát giờ cần được bộ phận hỗ trợ xem xét theo điều khoản hợp đồng.')
    else if (action === 'support') info('Hỗ trợ hợp đồng', 'Nếu có vấn đề với buổi học, chọn “Báo vấn đề” tại buổi đang chờ xác nhận và cung cấp nội dung cụ thể để được hỗ trợ.')
    else if (action === 'message') info('Tin nhắn', 'Mục trò chuyện với gia sư sẽ được mở khi tính năng Tin nhắn sẵn sàng.')
  })
  modal.addEventListener('modal:confirm', event => {
    if (!selected || selected.status !== 'pending' || !['confirm', 'report'].includes(action)) return
    if (action === 'report' && report.querySelector('textarea').value.trim().length < 10) {
      event.preventDefault()
      document.getElementById('report-error').textContent = 'Vui lòng mô tả vấn đề ít nhất 10 ký tự.'
      document.getElementById('report-error').hidden = false
      report.querySelector('textarea').setAttribute('aria-invalid', 'true')
      report.querySelector('textarea').focus()
      return
    }
    const confirmed = action === 'confirm'
    selected.status = confirmed ? 'completed' : 'reported'
    const title = confirmed ? `Đã xác nhận hoàn thành buổi ${selected.id}` : `Đã ghi nhận báo cáo buổi ${selected.id}`
    const banner = document.getElementById('pending-alert')
    banner.classList.toggle('alert--success', confirmed)
    banner.classList.toggle('alert--warning', !confirmed)
    document.getElementById('pending-title').textContent = title
    document.getElementById('pending-description').textContent = confirmed ? 'Thông tin buổi học và trạng thái ký quỹ đã được cập nhật.' : 'Buổi học đang chờ xử lý. Xác nhận tự động được tạm dừng.'
    document.getElementById('pending-actions').hidden = true
    const item = document.createElement('li')
    const time = document.createElement('time')
    time.dateTime = new Date().toISOString()
    time.textContent = 'Vừa xong'
    const text = document.createElement('p')
    text.textContent = title
    item.append(time, text)
    document.getElementById('activity-list').prepend(item)
    render()
    window.EduToast.show({ type: 'success', title, message: confirmed ? 'Cảm ơn bạn đã phản hồi về buổi học.' : 'Vui lòng theo dõi trạng thái xử lý của buổi học.' })
  })
  modal.addEventListener('modal:close', () => {
    report.hidden = true
    // The original trigger can be replaced when the lesson list is re-rendered.
    if (document.activeElement === document.body) document.querySelector('[data-filter][aria-pressed="true"]').focus()
    action = null
    selected = null
  })
  render()
})()