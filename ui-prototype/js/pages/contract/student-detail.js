/* Trang chi tiết hợp đồng phía phụ huynh. Dữ liệu ký quỹ nội trang, dùng cho bản mẫu giao diện. */
(() => {
  const contracts = {
    'HD-20260919-024': {
      title: 'Học Toán cùng Nguyễn Minh Anh', status: 'Đang thực hiện', crumb: 'Chi tiết hợp đồng học HD-20260919-024',
      summary: 'HD-20260919-024 · Toán lớp 11 · Học trực tiếp', student: 'Trần Gia Huy', guardian: 'Chị Mai Lan',
      tutor: 'Nguyễn Minh Anh', tutorNote: 'Gia sư Toán · Đã xác minh', initials: 'MA', course: 'Toán lớp 11',
      level: 'Toán · Lớp 11 (THPT)', mode: 'Trực tiếp tại nhà học viên', schedule: ['Thứ Hai & Thứ Sáu', '19:00–20:30 · 90 phút/buổi'],
      timeOfDay: '19:00–20:30', minutes: 90, period: '28/09/2026 – 23/10/2026', fee: 220000,
      dates: ['28/09/2026', '02/10/2026', '05/10/2026', '09/10/2026', '12/10/2026', '16/10/2026', '19/10/2026', '23/10/2026'],
      states: ['completed', 'completed', 'pending', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
      pending: { lesson: 3, attended: '05/10/2026 lúc 20:34', deadline: '08/10/2026 · 20:34' },
      next: { lesson: 4, weekday: 'Thứ Sáu', date: '09/10/2026', topic: 'Phương trình lượng giác nâng cao' },
      activity: [
        { iso: '2026-10-05T20:34', text: '05/10/2026 · 20:34', note: 'Gia sư đã điểm danh buổi 3. Đang chờ học viên xác nhận.' },
        { iso: '2026-10-05T20:30', text: '05/10/2026 · 20:30', note: 'Buổi 2 đã hoàn thành. Khoản ký quỹ 220.000 ₫ đã được giải ngân.' },
        { iso: '2026-09-28T21:02', text: '28/09/2026 · 21:02', note: 'Bạn đã xác nhận hoàn thành buổi 1.' }
      ],
      escrowNote: 'Khoản ký quỹ được theo dõi theo từng buổi học. Buổi học có báo cáo sẽ chờ xử lý trước khi giải ngân.',
      chat: true
    },
    'HD-20260926-025': {
      title: 'Học Toán cùng Nguyễn Minh Anh', status: 'Chờ ký quỹ', crumb: 'Chi tiết hợp đồng học HD-20260926-025',
      summary: 'HD-20260926-025 · Toán lớp 11 · Học trực tiếp', student: 'Trần Gia Huy', guardian: 'Chị Mai Lan',
      tutor: 'Nguyễn Minh Anh', tutorNote: 'Gia sư Toán · Đã xác minh', initials: 'MA', course: 'Toán lớp 11',
      level: 'Toán · Lớp 11 (THPT)', mode: 'Trực tiếp tại nhà học viên', schedule: ['Thứ Hai & Thứ Sáu', '19:00–20:30 · 90 phút/buổi'],
      timeOfDay: '19:00–20:30', minutes: 90, period: '02/11/2026 – 27/11/2026', fee: 220000,
      dates: ['02/11/2026', '06/11/2026', '09/11/2026', '13/11/2026', '16/11/2026', '20/11/2026', '23/11/2026', '27/11/2026'],
      states: ['upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
      pending: null, next: null, awaitingDeposit: { wallet: 340000, due: 1420000 },
      activity: [
        { iso: '2026-09-26T21:05', text: '26/09/2026 · 21:05', note: 'Gia sư và phụ huynh đã thống nhất điều khoản. Hợp đồng chờ ký quỹ để kích hoạt lịch học.' },
        { iso: '2026-09-26T20:40', text: '26/09/2026 · 20:40', note: 'Bạn đã xác nhận nội dung hợp đồng.' }
      ],
      escrowNote: 'Học phí chưa chuyển ngay cho gia sư. Ký quỹ chỉ được ghi nhận khi nhận được xác nhận thanh toán hợp lệ.',
      chat: true
    },
    'HD-20260810-018': {
      title: 'Ôn Toán lớp 11 cùng Nguyễn Minh Anh', status: 'Đã hủy', crumb: 'Chi tiết hợp đồng học HD-20260810-018',
      summary: 'HD-20260810-018 · Toán lớp 11 · Học trực tiếp', student: 'Trần Gia Huy', guardian: 'Chị Mai Lan',
      tutor: 'Nguyễn Minh Anh', tutorNote: 'Gia sư Toán · Đã xác minh', initials: 'MA', course: 'Toán lớp 11',
      level: 'Toán · Lớp 11 (THPT)', mode: 'Trực tiếp tại nhà học viên', schedule: ['Thứ Ba & Thứ Năm', '18:00–19:30 · 90 phút/buổi'],
      timeOfDay: '18:00–19:30', minutes: 90, period: '11/08/2026 – 25/08/2026', fee: 180000,
      dates: ['11/08/2026', '13/08/2026', '18/08/2026', '20/08/2026', '25/08/2026'],
      states: ['completed', 'completed', 'completed', 'completed', 'cancelled'],
      pending: null, next: null,
      activity: [
        { iso: '2026-09-15T18:10', text: '15/09/2026 · 18:10', note: 'Buổi 5 đã hủy theo thỏa thuận. 180.000 ₫ ký quỹ được hoàn về số dư khả dụng (REF-260915-0012).' },
        { iso: '2026-08-20T19:32', text: '20/08/2026 · 19:32', note: 'Buổi 4 hoàn thành. Khoản ký quỹ 180.000 ₫ đã được giải ngân.' },
        { iso: '2026-08-11T19:28', text: '11/08/2026 · 19:28', note: 'Hợp đồng bắt đầu với buổi học đầu tiên.' }
      ],
      escrowNote: 'Hợp đồng đã kết thúc sớm. Số dư hoàn trả hiển thị trong lịch sử giao dịch của ví.',
      chat: true
    },
    'HD-20260715-012': {
      title: 'Toán lớp 9 cùng Nguyễn Minh Anh', status: 'Đã kết thúc', crumb: 'Chi tiết hợp đồng học HD-20260715-012',
      summary: 'HD-20260715-012 · Toán lớp 9 · Học trực tiếp', student: 'Trần Gia Huy', guardian: 'Chị Mai Lan',
      tutor: 'Nguyễn Minh Anh', tutorNote: 'Gia sư Toán · Đã xác minh', initials: 'MA', course: 'Toán lớp 9',
      level: 'Toán · Lớp 9 (THCS)', mode: 'Trực tiếp tại nhà học viên', schedule: ['Thứ Tư & Thứ Bảy', '19:00–20:30 · 90 phút/buổi'],
      timeOfDay: '19:00–20:30', minutes: 90, period: '15/07/2026 – 08/08/2026', fee: 220000,
      dates: ['15/07/2026', '18/07/2026', '22/07/2026', '25/07/2026', '29/07/2026', '01/08/2026', '05/08/2026', '08/08/2026'],
      states: ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'cancelled'],
      pending: null, next: null,
      activity: [
        { iso: '2026-08-30T09:20', text: '30/08/2026 · 09:20', note: 'Hợp đồng kết thúc. 220.000 ₫ ký quỹ còn lại của buổi không diễn ra được hoàn về ví (REF-260830-0008).' },
        { iso: '2026-08-05T20:31', text: '05/08/2026 · 20:31', note: 'Buổi 7 hoàn thành. Khoản ký quỹ 220.000 ₫ đã được giải ngân.' },
        { iso: '2026-07-15T20:34', text: '15/07/2026 · 20:34', note: 'Hợp đồng bắt đầu với buổi học đầu tiên.' }
      ],
      escrowNote: 'Hợp đồng đã tất toán. Không còn khoản ký quỹ đang giữ cho hợp đồng này.',
      chat: true
    }
  }
  const byId = id => document.getElementById(id)
  const money = value => new Intl.NumberFormat('vi-VN').format(value) + ' ₫'
  const params = new URLSearchParams(location.search)
  const requested = params.get('id') || params.get('contract')
  const fallback = 'HD-20260919-024'
  const contractId = requested && contracts[requested] ? requested : requested ? null : fallback
  const contract = contractId ? contracts[contractId] : null
  const hidden = [byId('contract-header'), byId('contract-progress'), byId('pending-alert'), byId('contract-columns')]
  if (!contract) {
    byId('crumb-contract').textContent = 'Không tìm thấy hợp đồng'
    byId('not-found-title').textContent = `Không tìm thấy hợp đồng ${requested}`
    byId('not-found-description').textContent = 'Mã hợp đồng trong liên kết không thuộc danh sách hợp đồng của bạn. Vui lòng mở hợp đồng từ ví hoặc trang xác nhận hợp đồng.'
    hidden.forEach(node => { node.hidden = true })
    byId('contract-not-found').hidden = false
    return
  }
  const total = contract.fee * contract.dates.length
  const serviceRate = 0.1
  const labels = { completed: 'Đã hoàn thành', pending: 'Chờ xác nhận', upcoming: 'Sắp tới', reported: 'Chờ xử lý', cancelled: 'Đã hủy' }
  let lessons = contract.dates.map((date, index) => ({ id: index + 1, date, status: contract.states[index] }))
  let filter = 'all'
  let action = null
  let selected = null
  const list = byId('lesson-list')
  const modal = byId('shared-modal')
  const report = document.createElement('div')
  report.className = 'contract-report form-field'
  report.hidden = true
  report.innerHTML = '<label class="form-field__label" for="report-detail">Nội dung cần hỗ trợ</label><textarea class="textarea-control" id="report-detail" maxlength="2000" aria-describedby="report-error" placeholder="Mô tả vấn đề xảy ra trong buổi học..."></textarea><p class="form-field__message form-field__message--error" hidden id="report-error" role="alert"></p>'
  modal.querySelector('.modal__body').after(report)
  const counters = () => ({
    completed: lessons.filter(l => l.status === 'completed').length,
    pending: lessons.filter(l => l.status === 'pending').length,
    upcoming: lessons.filter(l => l.status === 'upcoming').length,
    reported: lessons.filter(l => l.status === 'reported').length,
    cancelled: lessons.filter(l => l.status === 'cancelled').length
  })
  const renderFacts = () => {
    const panel = byId('finance')
    document.title = `${contract.title} — Edu Connect`
    byId('crumb-contract').textContent = contract.crumb
    byId('crumb-contract').title = contract.crumb
    byId('contract-title').textContent = contract.title
    byId('contract-status').textContent = contract.status
    byId('contract-summary').textContent = contract.summary
    byId('fact-tutor').textContent = contract.tutor
    byId('fact-course').textContent = contract.level
    byId('fact-mode').textContent = contract.mode
    byId('fact-period').textContent = contract.period
    byId('fact-scale').textContent = `${contract.dates.length} buổi · ${money(contract.fee)}/buổi`
    byId('fact-schedule').replaceChildren()
    contract.schedule.forEach((line, index) => {
      if (index) byId('fact-schedule').append(document.createElement('br'))
      byId('fact-schedule').append(line)
    })
    byId('total-label').textContent = contract.awaitingDeposit ? 'Tổng ký quỹ cần hoàn tất' : 'Tổng giá trị hợp đồng'
    byId('total-value').textContent = money(total)
    byId('tutor-name').textContent = contract.tutor
    byId('tutor-note').textContent = contract.tutorNote
    byId('tutor-avatar').textContent = contract.initials
    const chatHref = `../chat/messages.html?contract=${encodeURIComponent(contractId)}`
    byId('header-chat').href = chatHref
    byId('message-link').href = chatHref
    byId('header-chat').hidden = !contract.chat
    byId('message-link').hidden = !contract.chat
    byId('header-wallet').href = '../wallet/overview.html'
    byId('finance-wallet').href = `../wallet/overview.html#transactions`
    byId('finance-per-session').textContent = money(contract.fee)
    byId('finance-note').textContent = contract.escrowNote
    const refundRow = byId('finance-refunded')
    if (!refundRow) {
      const row = document.createElement('div')
      row.id = 'finance-refunded'
      row.hidden = true
      const dt = document.createElement('dt')
      const dd = document.createElement('dd')
      dt.textContent = 'Đã hoàn về ví'
      row.append(dt, dd)
      panel.querySelector('.contract-finance').append(row)
    }
    const checkoutHref = `../payment/checkout.html?contract=${encodeURIComponent(contractId)}&from=contract-detail`
    byId('finance-pay').href = checkoutHref
    byId('finance-pay').hidden = !contract.awaitingDeposit
  }
  const renderAlert = () => {
    const banner = byId('pending-alert')
    const actions = byId('pending-actions')
    actions.replaceChildren()
    if (contract.awaitingDeposit) {
      banner.hidden = false
      banner.classList.remove('alert--success')
      banner.classList.add('alert--warning')
      byId('pending-title').textContent = 'Hợp đồng chưa thể bắt đầu'
      byId('pending-description').textContent = `Cần hoàn tất ký quỹ ${money(total)} cho ${contract.dates.length} buổi học. Ví đang có ${money(contract.awaitingDeposit.wallet)} sẽ được tự động cấn trừ, số còn lại ${money(contract.awaitingDeposit.due)} thanh toán qua PayOS. Lịch học chỉ kích hoạt khi nhận được xác nhận thanh toán hợp lệ.`
      const pay = document.createElement('a')
      pay.className = 'contract-button'
      pay.href = `../payment/checkout.html?contract=${encodeURIComponent(contractId)}&from=contract-detail`
      pay.textContent = 'Thanh toán ký quỹ'
      const terms = document.createElement('button')
      terms.className = 'contract-button contract-button--plain'
      terms.type = 'button'
      terms.dataset.action = 'policy'
      terms.textContent = 'Xem điều khoản ký quỹ'
      actions.append(pay, terms)
      return
    }
    if (contract.pending) {
      banner.hidden = false
      banner.classList.remove('alert--success')
      banner.classList.add('alert--warning')
      byId('pending-title').textContent = `Buổi ${contract.pending.lesson} đang chờ bạn xác nhận`
      byId('pending-description').textContent = `Gia sư đã điểm danh ngày ${contract.pending.attended}. Hạn phản hồi: ${contract.pending.deadline}. Hãy xác nhận hoàn thành hoặc báo vấn đề trước thời hạn.`
      for (const [label, kind, style] of [['Xác nhận buổi ' + contract.pending.lesson, 'confirm', 'contract-button'], ['Báo vấn đề', 'report', 'contract-button contract-button--plain']]) {
        const button = document.createElement('button')
        button.className = style
        button.type = 'button'
        button.dataset.action = kind
        button.dataset.lesson = String(contract.pending.lesson)
        button.textContent = label
        actions.append(button)
      }
      return
    }
    banner.hidden = true
  }
  const renderFinance = () => {
    const count = counters()
    const released = count.completed * contract.fee
    const held = (count.pending + count.upcoming + count.reported) * contract.fee
    const refunded = count.cancelled * contract.fee
    byId('finance-status').textContent = contract.awaitingDeposit ? 'Chưa ký quỹ' : refunded ? `Đã tất toán · hoàn ${money(refunded)}` : held ? `Đang giữ ${money(held)}` : 'Đã ký quỹ đầy đủ'
    byId('finance-amount').textContent = money(total)
    byId('finance-progress').max = String(total)
    byId('finance-progress').value = String(released)
    byId('finance-progress').textContent = `${money(released)} / ${money(total)}`
    byId('released-money').textContent = money(released)
    byId('held-money').textContent = money(held)
    const refundRow = byId('finance-refunded')
    refundRow.querySelector('dd').textContent = money(refunded)
    refundRow.hidden = !refunded
    const attended = lessons.length - count.upcoming - count.cancelled
    byId('progress-title').textContent = `Tiến độ học tập: ${attended} / ${lessons.length} buổi`
    byId('progress-remaining').textContent = `Còn ${count.upcoming + count.cancelled} buổi`
    byId('completion-summary').textContent = `${count.completed} buổi hoàn thành · ${count.pending} buổi chờ xác nhận${count.cancelled ? ` · ${count.cancelled} buổi đã hủy` : ''}`
    byId('learning-progress').max = String(lessons.length)
    byId('learning-progress').value = String(attended)
    byId('learning-progress').textContent = `${attended}/${lessons.length}`
    const next = contract.next
    byId('next-lesson').hidden = !next
    if (next) {
      byId('next-title').textContent = `Buổi ${next.lesson} · ${next.weekday}`
      byId('next-date').textContent = next.date
      byId('next-time').textContent = `${contract.timeOfDay} · ${contract.minutes} phút`
      byId('next-topic').textContent = next.topic
      const button = byId('next-lesson-button')
      button.dataset.lesson = String(next.lesson)
      button.textContent = 'Xem buổi học'
    }
  }
  const lessonDetail = lesson => {
    if (lesson.status === 'completed') return `Ký quỹ: Đã giải ngân ${money(contract.fee)}`
    if (lesson.status === 'reported') return 'Báo cáo đang chờ xử lý · Tạm dừng xác nhận tự động'
    if (lesson.status === 'pending') return `Gia sư đã điểm danh lúc ${contract.timeOfDay.split('–')[1]} · Ký quỹ đang giữ: ${money(contract.fee)}`
    if (lesson.status === 'cancelled') return `Buổi học đã hủy · Hoàn ${money(contract.fee)} về số dư khả dụng`
    return contract.awaitingDeposit ? `Chưa ký quỹ · Lịch học chỉ kích hoạt sau khi hoàn tất ký quỹ ${money(contract.fee)}` : `Ký quỹ đang giữ: ${money(contract.fee)}`
  }
  const render = () => {
    list.replaceChildren()
    const visible = lessons.filter(lesson => filter === 'all' || lesson.status === filter)
    visible.forEach(lesson => {
      const card = document.createElement('article')
      card.className = 'lesson-card lesson-card--compact lesson-card--' + (lesson.status === 'reported' ? 'pending' : lesson.status)
      card.id = 'lesson-' + lesson.id
      card.setAttribute('aria-labelledby', 'lesson-title-' + lesson.id)
      card.innerHTML = `<span class="lesson-card__number" aria-hidden="true">B${lesson.id}</span><div class="lesson-card__content"><header class="lesson-card__header"><h3 class="lesson-card__title" id="lesson-title-${lesson.id}">Buổi ${lesson.id} · ${lesson.date}</h3><span class="lesson-card__status">${labels[lesson.status]}</span></header><p class="lesson-card__schedule">${contract.timeOfDay} · ${contract.course}</p><p class="lesson-card__detail">${lessonDetail(lesson)}</p><div class="lesson-card__actions">${lesson.status === 'pending' ? `<button class="contract-button" type="button" data-action="confirm" data-lesson="${lesson.id}">Xác nhận buổi ${lesson.id}</button><button class="contract-button contract-button--plain" type="button" data-action="report" data-lesson="${lesson.id}">Báo vấn đề</button>` : `<button class="contract-button contract-button--secondary" type="button" data-action="detail" data-lesson="${lesson.id}">Chi tiết buổi học</button>`}</div></div>`
      list.append(card)
    })
    byId('lessons-empty').hidden = visible.length > 0
    byId('filter-status').textContent = `Đang hiển thị ${visible.length} buổi học.`
    const count = counters()
    document.querySelectorAll('[data-filter]').forEach(button => {
      const value = button.dataset.filter
      const title = { all: 'Tất cả', completed: 'Hoàn thành', pending: 'Chờ xác nhận', upcoming: 'Sắp tới', reported: 'Chờ xử lý' }[value]
      const shown = value === 'all' ? lessons.length : count[value] || 0
      button.textContent = `${title} (${shown})`
      button.setAttribute('aria-pressed', String(value === filter))
      button.classList.toggle('filter-chip--selected', value === filter)
    })
    renderFinance()
  }
  const contractSummary = () => `${contract.guardian}: ${contract.student} · Gia sư: ${contract.tutor}. ${contract.level}, ${contract.mode.toLowerCase()}, ${contract.dates.length} buổi × ${contract.minutes} phút. Lịch học: ${contract.schedule.join(', ')}. Học phí: ${money(contract.fee)}/buổi. Tổng giá trị: ${money(total)}. Trạng thái: ${contract.status}.`
  const info = (title, message) => {
    action = null
    report.hidden = true
    window.EduModal.open(modal, { title, message, variant: 'info' })
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action], [data-filter]')
    if (!button || button.disabled) return
    if (button.dataset.filter) { filter = button.dataset.filter; render(); return }
    action = button.dataset.action
    selected = lessons.find(l => l.id === Number(button.dataset.lesson)) || null
    report.hidden = true
    if (action === 'confirm' && selected?.status === 'pending') {
      window.EduModal.open(modal, { title: `Xác nhận hoàn thành buổi ${selected.id}?`, message: `Buổi học ngày ${selected.date}, ${contract.timeOfDay} với gia sư ${contract.tutor}. Chỉ xác nhận khi buổi học đã diễn ra đầy đủ. Khoản ký quỹ giải ngân: ${money(contract.fee)}, gồm thu nhập gia sư ${money(Math.round(contract.fee * (1 - serviceRate)))} và phí dịch vụ ${money(Math.round(contract.fee * serviceRate))}. Xác nhận của bạn là căn cứ hoàn tất buổi học.`, confirmText: 'Xác nhận hoàn thành' })
    } else if (action === 'report' && selected?.status === 'pending') {
      report.hidden = false
      report.querySelector('textarea').value = ''
      byId('report-error').textContent = ''
      byId('report-error').hidden = true
      report.querySelector('textarea').removeAttribute('aria-invalid')
      window.EduModal.open(modal, { title: `Báo vấn đề · Buổi ${selected.id}`, message: 'Mô tả vấn đề để bộ phận hỗ trợ xem xét. Buổi học sẽ chuyển sang trạng thái chờ xử lý.', confirmText: 'Gửi báo cáo' })
    } else if (action === 'detail' && selected) info(`Buổi ${selected.id} · ${selected.date}`, `${contract.course} · ${contract.timeOfDay} · Gia sư ${contract.tutor}. Trạng thái: ${labels[selected.status]}. Học phí: ${money(contract.fee)}.`)
    else if (action === 'contract-detail') info(`Hợp đồng ${contractId}`, contractSummary())
    else if (action === 'policy') info('Quy định đổi lịch', 'Hãy trao đổi và thống nhất với gia sư trước ít nhất 24 giờ nếu bạn cần thay đổi lịch học. Các trường hợp phát sinh sát giờ cần được bộ phận hỗ trợ xem xét theo điều khoản hợp đồng. Buổi đã hủy được hoàn ký quỹ về số dư khả dụng.')
    else if (action === 'support') info('Hỗ trợ hợp đồng', 'Nếu có vấn đề với buổi học, chọn “Báo vấn đề” tại buổi đang chờ xác nhận và cung cấp nội dung cụ thể để được hỗ trợ.')
  })
  modal.addEventListener('modal:confirm', event => {
    if (!selected || selected.status !== 'pending' || !['confirm', 'report'].includes(action)) return
    if (action === 'report' && report.querySelector('textarea').value.trim().length < 10) {
      event.preventDefault()
      byId('report-error').textContent = 'Vui lòng mô tả vấn đề ít nhất 10 ký tự.'
      byId('report-error').hidden = false
      report.querySelector('textarea').setAttribute('aria-invalid', 'true')
      report.querySelector('textarea').focus()
      return
    }
    const confirmed = action === 'confirm'
    selected.status = confirmed ? 'completed' : 'reported'
    const title = confirmed ? `Đã xác nhận hoàn thành buổi ${selected.id}` : `Đã ghi nhận báo cáo buổi ${selected.id}`
    const banner = byId('pending-alert')
    banner.classList.toggle('alert--success', confirmed)
    banner.classList.toggle('alert--warning', !confirmed)
    byId('pending-title').textContent = title
    byId('pending-description').textContent = confirmed ? `Thông tin buổi học và trạng thái ký quỹ đã được cập nhật. Giải ngân ${money(contract.fee)}.` : 'Buổi học đang chờ xử lý. Xác nhận tự động được tạm dừng.'
    byId('pending-actions').hidden = true
    const item = document.createElement('li')
    const time = document.createElement('time')
    time.dateTime = new Date().toISOString()
    time.textContent = 'Vừa xong'
    const text = document.createElement('p')
    text.textContent = title
    item.append(time, text)
    byId('activity-list').prepend(item)
    contract.pending = null
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
  const renderActivity = () => {
    byId('activity-list').replaceChildren()
    contract.activity.forEach(entry => {
      const item = document.createElement('li')
      const time = document.createElement('time')
      time.dateTime = entry.iso
      time.textContent = entry.text
      const text = document.createElement('p')
      text.textContent = entry.note
      item.append(time, text)
      byId('activity-list').append(item)
    })
  }
  renderFacts()
  renderAlert()
  renderActivity()
  render()
})()
