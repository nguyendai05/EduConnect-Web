/* Trang chi tiết hợp đồng phía phụ huynh — MỌI số liệu đọc từ EduStore.
 * Bản trước cất bảng hằng số riêng theo mã hợp đồng: HD-20260919-024 ở đây ghi
 * "8 buổi · 220.000 ₫", trong khi trang xác nhận hợp đồng đọc đúng hợp đồng đó là
 * "24 buổi · 210.000 ₫ · 5.040.000 ₫". Yêu cầu của nhiệm vụ: các màn cùng một
 * hợp đồng/đơn/phiên thanh toán phải khớp total/fee/sessions/schedule. */
(() => {
  const Route = window.EduRoute
  const Store = window.EduStore
  if (!Route || !Store) return

  const byId = id => document.getElementById(id)
  const money = value => Store.formatMoney(value)
  const { CONTRACT_STATUS, PAYMENT_STATUS, REFUND_STATE, CHANNELS, statusOf } = Store

  const MODE_LABEL = Object.freeze({
    online: 'Trực tuyến',
    home: 'Trực tiếp tại nhà học viên',
    both: 'Trực tiếp tại nhà hoặc trực tuyến'
  })

  /**
   * Mốc từng buổi lấy từ store (EduStore.sessionsOf) — cùng một nguồn với trang gia sư,
   * để hai màn không tự sinh ngày rồi lệch nhau. Buổi đã điểm danh dùng ngày thật của
   * bản ghi điểm danh; phần còn lại nối tiếp theo nhịp 3 ngày và được ghi rõ là suy diễn.
   */

  const channelLabel = key => (CHANNELS.find(item => item.key === key) || { label: key || '—' }).label
  const modeOf = (offering, item) => (offering && MODE_LABEL[offering.mode])
    || (item && item.offeringType === 'GROUP_CLASS' ? 'Lớp nhóm (tại trung tâm)' : 'Chưa ghi rõ hình thức')

  const buildActivity = (contract, order, payments) => {
    const entries = []
    if (order) {
      entries.push({ iso: order.createdAt, note: 'Đơn ' + order.id + ' tạo ' + channelLabel(order.channel).toLowerCase() + ', snapshot ' + order.items.length + ' hạng mục.' })
      if (order.cancellation) entries.push({ iso: order.cancellation.requestedAt, note: 'Yêu cầu hủy: ' + order.cancellation.reason + ' — trạng thái hủy ' + order.cancellation.state + '.' })
      if (order.refund) entries.push({ iso: order.refund.completedAt || order.refund.requestedAt, note: 'Hoàn tiền ' + money(order.refund.amount) + ' — ' + statusOf(REFUND_STATE, order.refund.state).label + '.' })
    }
    if (contract.signedAt) entries.push({ iso: contract.signedAt, note: 'Hai bên xác nhận điều khoản ' + contract.termsVersion + ' · ' + contract.sessions + ' buổi.' })
    payments.forEach(payment => entries.push({ iso: payment.createdAt, note: 'Phiên ' + payment.id + ' — ' + statusOf(PAYMENT_STATUS, payment.status).label + ' · ' + money(payment.total) + '.' }))
    Store.list('financialEvents')
      .filter(event => event.contractId === contract.id && event.type === 'release')
      .forEach(event => entries.push({ iso: event.date, note: 'Giải ngân ' + money(event.grossReleased) + ' cho ' + event.sessionsReleased + ' buổi · ledger ' + (event.ledgerId || 'chưa có') + '.' }))
    return entries.filter(entry => entry.iso)
      .sort((a, b) => String(b.iso).localeCompare(String(a.iso)))
      .map(entry => ({ iso: String(entry.iso), text: Store.formatDate(entry.iso, true), note: entry.note }))
  }

  const buildFromStore = id => {
    const contract = Store.contract(id)
    if (!contract) return null
    const order = Store.order(contract.orderId)
    const item = order && Array.isArray(order.items) ? order.items[0] : null
    const learner = Store.learner(contract.learnerId)
    const tutor = Store.tutor(contract.tutorId)
    const offering = item && item.offeringId ? Store.offering(item.offeringId) : null
    const payments = order ? Store.paymentsByOrder(order.id) : []
    const status = statusOf(CONTRACT_STATUS, contract.status)
    const releasedSessions = Store.sessionsReleasedOf(contract.id)
    const held = Store.escrowOf(contract.id)
    const scheduleParts = String((item && item.scheduleText) || '').split(',').map(part => part.trim()).filter(Boolean)
    const weekdayText = scheduleParts[0] || 'Chưa ghi trong snapshot'
    const timeOfDay = scheduleParts.length > 1 ? scheduleParts.slice(1).join(', ') : '—'
    const course = (offering && offering.subjectLabel) || (item && item.offeringTitle) || contract.id
    const sessionList = Store.sessionsOf(contract.id)
    const dates = sessionList.map(item => item.date)
    const markedDates = sessionList.filter(item => item.source === 'attendance').length
    const states = Array.from({ length: contract.sessions }, (_, index) => {
      const no = index + 1
      if (no <= releasedSessions) return 'completed'
      if (no <= contract.completedSessions) return 'pending'
      return ['cancelled', 'cancellation_pending'].includes(contract.status) ? 'cancelled' : 'upcoming'
    })
    const pendingIndex = states.indexOf('pending')
    const upcomingIndex = states.indexOf('upcoming')
    const walletSummary = Store.walletSummary(contract.learnerId)
    const awaitingDeposit = contract.status === 'awaiting_payment'
      ? { wallet: walletSummary.availableToUse, due: Math.max(0, Store.toInteger(contract.total) - Store.toInteger(walletSummary.availableToUse)) }
      : null
    return {
      id: contract.id,
      contract,
      order,
      item,
      title: course + ' — ' + (tutor ? tutor.name : contract.tutorId),
      status: status.label,
      statusKey: contract.status,
      summary: contract.id + ' · ' + course + ' · ' + modeOf(offering, item),
      student: learner ? learner.studentName : contract.learnerId,
      guardian: learner ? learner.name : contract.learnerId,
      tutor: tutor ? tutor.name : contract.tutorId,
      tutorNote: (tutor ? tutor.district + ' · ' : '') + (tutor && tutor.verified ? 'Đã xác minh hồ sơ' : 'Hồ sơ chưa xác minh'),
      initials: tutor ? tutor.initials : '—',
      course,
      level: course + ' · ' + ((offering && offering.gradeLabel) || 'khối chưa ghi trong snapshot'),
      mode: modeOf(offering, item),
      schedule: [weekdayText, timeOfDay + ' · ' + money(contract.unitPrice) + '/buổi'],
      weekdayText,
      timeOfDay,
      minutes: item ? item.durationMinutes : 0,
      dates,
      states,
      period: dates.length ? dates[0] + ' – ' + dates[dates.length - 1] + ' (' + markedDates + ' mốc lấy từ bản ghi điểm danh thật, ' + (dates.length - markedDates) + ' mốc suy diễn theo nhịp 3 ngày)' : 'Hợp đồng chưa có ngày ký trong dữ liệu mẫu',
      fee: Store.toInteger(contract.unitPrice),
      feeRate: Number.isFinite(Number(contract.feeRate)) && Number(contract.feeRate) > 0 ? Number(contract.feeRate) : Store.DEMO_FEE_RATE,
      total: Store.toInteger(contract.total),
      held,
      releasedMoney: Store.grossReleasedOf(contract.id),
      refundedMoney: Store.succeededRefundOf(contract),
      sessions: contract.sessions,
      completedSessions: contract.completedSessions,
      releasedSessions,
      pending: pendingIndex >= 0
        ? { lesson: pendingIndex + 1, attended: 'buổi ' + (pendingIndex + 1) + ' ngày ' + (dates[pendingIndex] || '—'), deadline: 'quy tắc 72 giờ nêu trong điều khoản' }
        : null,
      next: upcomingIndex >= 0
        ? { lesson: upcomingIndex + 1, weekday: weekdayText, date: dates[upcomingIndex] || '—', topic: 'Nội dung theo kế hoạch của gia sư (dữ liệu mẫu chưa ghi từng buổi)' }
        : null,
      awaitingDeposit,
      activity: buildActivity(contract, order, payments),
      escrowNote: 'Ký quỹ đang giữ ' + money(held) + ' / ' + money(contract.total) + ' · đã giải ngân '
        + money(Store.grossReleasedOf(contract.id)) + ' (' + releasedSessions + '/' + contract.sessions + ' buổi). '
        + 'escrow = payment − release − refund, tính một nguồn trong store.',
      chat: Boolean(tutor) && !status.terminal
    }
  }

  const requested = Route.param('id', 'contractStudentDetail')
  /* Không fallback cứng về một hợp đồng cụ thể khi thiếu/ sai tham số: bản cũ luôn mở
     HD-20260919-024, nên link hỏng vẫn hiện "hợp đồng của bạn" với số của người khác. */
  const contractId = requested || null
  const contract = contractId ? buildFromStore(contractId) : null
  const hidden = [byId('contract-header'), byId('contract-progress'), byId('pending-alert'), byId('contract-columns')]
  if (!contract) {
    byId('not-found-title').textContent = requested ? 'Không tìm thấy hợp đồng ' + requested : 'Thiếu mã hợp đồng'
    byId('not-found-description').textContent = requested
      ? 'Mã trong liên kết không tồn tại trong dữ liệu dùng chung. Trang không tự mở một hợp đồng khác.'
      : 'Mở trang này từ liên kết có tham số ?id= hợp lệ (ví dụ từ trang ví, lịch sử đơn hoặc trang xác nhận hợp đồng).'
    hidden.forEach(node => { if (node) node.hidden = true })
    byId('contract-not-found').hidden = false
    return
  }
  const total = contract.total
  const serviceRate = contract.feeRate
  const labels = { completed: 'Đã hoàn thành', pending: 'Chờ xác nhận', upcoming: 'Sắp tới', reported: 'Chờ xử lý', cancelled: 'Đã hủy' }
  let lessons = contract.dates.map((date, index) => ({ id: index + 1, date: date || ('buổi ' + (index + 1)), status: contract.states[index] }))
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
      byId('pending-description').textContent = `Buổi học đã được ghi nhận là diễn ra (${contract.pending.attended}). Hạn phản hồi: ${contract.pending.deadline}. Hãy xác nhận hoàn thành để giải ngân, hoặc báo vấn đề nếu buổi học không đúng thỏa thuận.`
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
    /* Tiền lấy thẳng từ dòng tiền trong store, không phải (số buổi × đơn giá).
       Công thức cũ hiển thị count.cancelled × fee như "đã hoàn" dù số hoàn thật khác,
       và coi released = completed × unitPrice dù feeRate có thể khác DEMO_FEE_RATE. */
    const released = contract.releasedMoney
    const held = contract.held
    const refunded = contract.refundedMoney
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
    const note = report.querySelector('textarea').value.trim()
    const record = contract.contract
    if (confirmed) {
      const result = Store.releaseSession({
        contractId: record.id,
        lessonNo: selected.id,
        idempotency: 'student-detail:release:' + record.id + ':' + selected.id
      })
      if (!result.ok) {
        event.preventDefault()
        const messages = {
          'lesson-not-attended': 'Buổi này chưa được ghi nhận là đã diễn ra trong dữ liệu mẫu, nên chưa có căn cứ giải ngân.',
          'already-released': 'Buổi này đã được xác nhận và giải ngân trước đó.',
          'contract-terminal': 'Hợp đồng đã ở trạng thái cuối nên không giải ngân thêm.',
          'not-next-session': 'Buổi học được giải ngân theo thứ tự; hãy xác nhận buổi gần nhất trước.',
          duplicated: 'Yêu cầu đã gửi trước đó — bấm lặp không tạo thêm khoản giải ngân.',
          'storage-failed': 'Không lưu được vào storage của tab. State trước đó được giữ nguyên.',
          'invalid-state': 'Không lưu được vì dữ liệu không hợp lệ. State trước đó được giữ nguyên.'
        }
        window.EduToast.show({ type: 'error', title: 'Chưa xác nhận được buổi học', message: messages[result.reason] || result.reason })
        return
      }
      window.EduToast.show({
        type: 'success',
        title: 'Đã xác nhận buổi ' + selected.id,
        message: 'Giải ngân ' + money(result.data.grossReleased) + ' (gia sư nhận ' + money(result.data.tutorNetReleased)
          + ', phí nền tảng ' + money(result.data.platformFeeReleased) + ') · bút toán ' + result.data.ledgerId + '.'
      })
    } else {
      const result = Store.submitReport({
        reporterId: record.learnerId,
        targetType: 'contract',
        targetId: record.id,
        reason: 'other',
        evidenceNote: 'Buổi ' + selected.id + ': ' + note,
        screenshotCount: 0,
        idempotency: 'student-detail:report:' + record.id + ':' + selected.id
      })
      if (!result.ok) {
        event.preventDefault()
        const messages = {
          'duplicate-open-report': 'Hợp đồng này đang có báo cáo chưa được xử lý (' + (result.reportId || '') + ').',
          duplicated: 'Yêu cầu đã gửi trước đó — bấm lặp không tạo thêm báo cáo.',
          'unknown-target': 'Không tìm thấy đối tượng để báo cáo.',
          'storage-failed': 'Không lưu được vào storage của tab. State trước đó được giữ nguyên.'
        }
        window.EduToast.show({ type: 'error', title: 'Chưa gửi được báo cáo', message: messages[result.reason] || result.reason })
        return
      }
      window.EduToast.show({
        type: 'success',
        title: 'Đã ghi nhận báo cáo buổi ' + selected.id,
        message: 'Mã báo cáo ' + result.data.reportId + ' — hàng đợi quản trị đọc cùng một bản ghi này.'
      })
    }
    /* Reload để mọi màn (tiến độ, escrow, ví, dashboard) đọc lại cùng một state;
       không sửa object cục bộ rồi báo "đã giải ngân" như bản trước. */
    window.setTimeout(() => window.location.reload(), 900)
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
