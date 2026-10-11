/* Trang chi tiết hợp đồng phía gia sư — MỌI số liệu đọc từ EduStore.
 * Bản trước cất bảng hằng số riêng theo mã hợp đồng (8 buổi · 220.000 ₫ cho
 * HD-20260919-024, attendance là object rỗng), trong khi trang học viên và trang xác nhận
 * đọc cùng hợp đồng đó là 24 buổi · 210.000 ₫ · 5.040.000 ₫ với 7 bản ghi điểm danh thật.
 * Cùng một hợp đồng phải hiện cùng số ở mọi màn (§5 nhiệm vụ). */
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
  const attendanceLabels = Object.freeze({ present: 'Có mặt', late: 'Đi muộn', absent: 'Vắng mặt' })

  const channelLabel = key => (CHANNELS.find(item => item.key === key) || { label: key || '—' }).label

  const buildFromStore = id => {
    const record = Store.contract(id)
    if (!record) return null
    const order = Store.order(record.orderId)
    const item = order && Array.isArray(order.items) ? order.items[0] : null
    const learner = Store.learner(record.learnerId)
    const tutor = Store.tutor(record.tutorId)
    const offering = item && item.offeringId ? Store.offering(item.offeringId) : null
    const payments = order ? Store.paymentsByOrder(order.id) : []
    const status = statusOf(CONTRACT_STATUS, record.status)
    const modeLabel = (offering && MODE_LABEL[offering.mode])
      || (item && item.offeringType === 'GROUP_CLASS' ? 'Lớp nhóm (tại trung tâm)' : 'Chưa ghi rõ hình thức')
    const scheduleParts = String((item && item.scheduleText) || '').split(',').map(part => part.trim()).filter(Boolean)
    const weekdayText = scheduleParts[0] || 'Chưa ghi trong snapshot'
    const timeOfDay = scheduleParts.length > 1 ? scheduleParts.slice(1).join(', ') : '—'
    const startAt = timeOfDay.split('–')[0].trim().replace('.', ':').slice(0, 5)
    const course = (offering && offering.subjectLabel) || (item && item.offeringTitle) || record.id
    const gradeLabel = (offering && offering.gradeLabel) || ''
    const sessionsList = Store.sessionsOf(record.id)
    const dates = sessionsList.map(entry => entry.date)
    const releasedSessions = Store.sessionsReleasedOf(record.id)
    const byLesson = new Map(sessionsList.filter(entry => entry.attendance).map(entry => [entry.no, entry.attendance]))
    const states = sessionsList.map(entry => {
      if (entry.no <= releasedSessions) return 'completed'
      if (entry.attendance && entry.attendance.status !== 'absent') return 'pending'
      if (entry.attendance) return 'cancelled'
      return ['cancelled', 'cancellation_pending'].includes(record.status) ? 'cancelled' : 'upcoming'
    })
    const pendingEntry = sessionsList.find(entry => entry.no > releasedSessions && entry.attendance && entry.attendance.status !== 'absent')
    const upcomingEntry = sessionsList.find((entry, index) => states[index] === 'upcoming')
    const deadlineOf = iso => {
      const ms = Date.parse(iso)
      return Number.isFinite(ms) ? Store.formatDate(new Date(ms + 72 * 3600000).toISOString(), true) : '72 giờ theo điều khoản'
    }
    const walletSummary = Store.walletSummary(record.learnerId)
    const split = Store.splitRelease(record.unitPrice, Number(record.feeRate) || Store.DEMO_FEE_RATE)

    const activityEntries = []
    if (order) activityEntries.push({ iso: order.createdAt, note: 'Đơn ' + order.id + ' tạo ' + channelLabel(order.channel).toLowerCase() + '.' })
    if (record.signedAt) activityEntries.push({ iso: record.signedAt, note: 'Hai bên xác nhận điều khoản ' + record.termsVersion + ' · ' + record.sessions + ' buổi.' })
    payments.forEach(payment => activityEntries.push({ iso: payment.createdAt, note: 'Phiên ' + payment.id + ' — ' + statusOf(PAYMENT_STATUS, payment.status).label + ' · ' + money(payment.total) + '.' }))
    byLesson.forEach(entry => activityEntries.push({ iso: entry.at, note: 'Điểm danh buổi ' + entry.lesson + ': ' + (attendanceLabels[entry.status] || entry.status) + '.' }))
    Store.list('financialEvents')
      .filter(event => event.contractId === record.id && event.type === 'release')
      .forEach(event => activityEntries.push({ iso: event.date, note: 'Giải ngân ' + money(event.grossReleased) + ' cho ' + event.sessionsReleased + ' buổi · ledger ' + (event.ledgerId || 'chưa có') + '.' }))
    if (order && order.refund) activityEntries.push({ iso: order.refund.completedAt || order.refund.requestedAt, note: 'Hoàn tiền ' + money(order.refund.amount) + ' — ' + statusOf(REFUND_STATE, order.refund.state).label + '.' })

    return {
      contract: record,
      title: 'Hợp đồng ' + course + ' cho ' + (learner ? learner.studentName : record.learnerId),
      status: status.label,
      statusKey: record.status,
      summary: record.id + ' · ' + course + ' · ' + modeLabel,
      student: learner ? learner.studentName : record.learnerId,
      studentNote: 'Học viên ' + (learner ? learner.grade : '—'),
      studentInitials: learner ? learner.initials : '—',
      guardian: learner ? learner.name : record.learnerId,
      tutor: tutor ? tutor.name : record.tutorId,
      initials: tutor ? tutor.initials : '—',
      course: course + (gradeLabel ? ' · ' + gradeLabel : ''),
      courseLabel: course + (gradeLabel ? ' — ' + gradeLabel : ''),
      mode: modeLabel,
      modeLine: modeLabel + '.',
      schedule: [weekdayText, timeOfDay],
      weekdayText,
      timeOfDay,
      startAt,
      minutes: item ? item.durationMinutes : 0,
      dates,
      states,
      period: dates.length
        ? dates[0] + ' – ' + dates[dates.length - 1] + ' (' + sessionsList.filter(entry => entry.source === 'attendance').length
          + ' mốc lấy từ bản ghi điểm danh thật, ' + sessionsList.filter(entry => entry.source === 'suy-dien').length + ' mốc suy diễn theo nhịp 3 ngày)'
        : 'Chưa có ngày ký trong dữ liệu mẫu',
      fee: Store.toInteger(record.unitPrice),
      feeRate: Number(record.feeRate) || Store.DEMO_FEE_RATE,
      income: split.tutorNetReleased,
      serviceFee: split.platformFeeReleased,
      total: Store.toInteger(record.total),
      sessions: record.sessions,
      completedSessions: Store.toInteger(record.completedSessions),
      releasedSessions,
      held: Store.escrowOf(record.id),
      releasedMoney: Store.grossReleasedOf(record.id),
      pendingLesson: pendingEntry
        ? { lesson: pendingEntry.no, attended: Store.formatDate(pendingEntry.attendance.at, true), deadline: deadlineOf(pendingEntry.attendance.at) }
        : null,
      next: upcomingEntry
        ? { lesson: upcomingEntry.no, weekday: weekdayText, date: upcomingEntry.date, topic: 'Nội dung theo kế hoạch của gia sư (dữ liệu mẫu chưa ghi từng buổi)' }
        : null,
      awaitingDeposit: record.status === 'awaiting_payment'
        ? { wallet: walletSummary.availableToUse, due: Math.max(0, Store.toInteger(record.total) - Store.toInteger(walletSummary.availableToUse)) }
        : null,
      activity: activityEntries.filter(entry => entry.iso)
        .sort((a, b) => String(b.iso).localeCompare(String(a.iso)))
        .map(entry => ({ iso: String(entry.iso), text: Store.formatDate(entry.iso, true), note: entry.note })),
      chat: Boolean(tutor) && !status.terminal
    }
  }

  const requested = Route.param('id', 'contractTutorDetail')
  /* Bản cũ fallback cứng về HD-20260919-024 khi thiếu/sai tham số. */
  const contractId = requested || null
  const contract = contractId ? buildFromStore(contractId) : null
  if (!contract) {
    byId('not-found-title').textContent = requested ? 'Không tìm thấy hợp đồng ' + requested : 'Thiếu mã hợp đồng'
    byId('not-found-description').textContent = requested
      ? 'Mã trong liên kết không tồn tại trong dữ liệu dùng chung. Trang không tự mở một hợp đồng khác.'
      : 'Mở trang này từ liên kết có tham số ?id= hợp lệ (từ trang việc đã nhận hoặc trang ví).'
    for (const node of [byId('contract-header'), byId('contract-progress'), byId('contract-spotlight'), byId('contract-columns')]) {
      if (node) node.hidden = true
    }
    byId('contract-not-found').hidden = false
    return
  }
  const fee = contract.fee
  const income = contract.income
  const serviceFee = contract.serviceFee
  const sessions = contract.sessions
  const incomeTotal = Store.list('financialEvents')
    .filter(event => event.type === 'release' && event.contractId === contract.contract.id)
    .reduce((sum, event) => sum + Store.toInteger(event.tutorNetReleased), 0)
  const weekdayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const weekdayOf = date => {
    const [day, month, year] = String(date).split('/')
    const parsed = new Date(year + '-' + month + '-' + day + 'T12:00:00+07:00')
    return Number.isNaN(parsed.getTime()) ? '—' : weekdayNames[parsed.getUTCDay()]
  }
  const lessons = contract.dates.map((date, index) => {
    const storeSession = Store.sessionsOf(contract.contract.id)[index]
    const record = storeSession && storeSession.attendance
    return {
      id: index + 1,
      date: date || ('buổi ' + (index + 1)),
      status: contract.states[index],
      attendance: record ? record.status : null,
      note: record ? record.note : '',
      homework: record ? record.homework : ''
    }
  })
  /**
   * Bản cũ đóng băng "bây giờ" vào data-snapshot-at (05/10/2026), nên mọi câu "còn X giờ"
   * hay "đã qua hạn" là số bịa quanh một mốc cố định. Window điểm danh cần giờ thật của
   * máy đang xem prototype; khi tích hợp, thay bằng server time.
   */
  const currentTime = () => Date.now()
  const startTime = lesson => {
    const [day, month, year] = String(lesson.date).split('/')
    const ms = Date.parse(year + '-' + month + '-' + day + 'T' + contract.startAt + ':00+07:00')
    return Number.isFinite(ms) ? ms : NaN
  }
  const canAttend = lesson => lesson.status === 'upcoming' && !contract.awaitingDeposit
    && Number.isFinite(startTime(lesson))
    && currentTime() >= startTime(lesson) && currentTime() <= startTime(lesson) + (49.5 * 60 * 60 * 1000)
  const labels = {
    completed: 'Đã giải ngân',
    pending: 'Chờ xác nhận',
    upcoming: 'Sắp dạy',
    reported: 'Chờ xử lý',
    cancelled: 'Đã hủy'
  }
  const list = document.getElementById('lesson-list')
  const modal = document.getElementById('shared-modal')
  const attendanceOptions = document.createElement('fieldset')
  let filter = 'all'
  let action = null
  let selected = null

  attendanceOptions.className = 'attendance-options radio-field'
  attendanceOptions.hidden = true
  attendanceOptions.innerHTML = `
    <legend>Tình trạng tham gia của học viên</legend>
    <label class="radio-option radio-option--selected">
      <span class="radio-hit-area"><input type="radio" name="attendance" value="present" checked><span class="radio-circle" aria-hidden="true"></span></span>
      <span><strong>Có mặt</strong><span>Học viên tham gia đầy đủ buổi học.</span></span>
    </label>
    <label class="radio-option">
      <span class="radio-hit-area"><input type="radio" name="attendance" value="late"><span class="radio-circle" aria-hidden="true"></span></span>
      <span><strong>Đi muộn</strong><span>Học viên đến muộn nhưng vẫn tham gia buổi học.</span></span>
    </label>
    <label class="radio-option">
      <span class="radio-hit-area"><input type="radio" name="attendance" value="absent"><span class="radio-circle" aria-hidden="true"></span></span>
      <span><strong>Vắng mặt</strong><span>Học viên không tham gia buổi học.</span></span>
    </label>`
  modal.querySelector('.modal__body').after(attendanceOptions)
  const notes = document.createElement('div')
  notes.className = 'contract-modal-fields'
  notes.hidden = true
  notes.innerHTML = '<div class="form-field"><label class="form-field__label" for="lesson-note">Nhận xét buổi học</label><textarea class="textarea-control" id="lesson-note" maxlength="2000" placeholder="Nội dung đã học, mức độ tiếp thu và điểm cần cải thiện"></textarea></div><div class="form-field"><label class="form-field__label" for="lesson-homework">Bài tập về nhà</label><textarea class="textarea-control" id="lesson-homework" maxlength="1000" placeholder="Bài tập cần hoàn thành trước buổi tiếp theo"></textarea></div>'
  attendanceOptions.after(notes)

  attendanceOptions.addEventListener('change', event => {
    if (!event.target.matches('input[type="radio"]')) return
    attendanceOptions.querySelectorAll('.radio-option').forEach(option => {
      option.classList.toggle('radio-option--selected', option.querySelector('input').checked)
    })
  })

  const renderFacts = () => {
    document.title = `${contract.title} — Edu Connect`
    byId('contract-title').textContent = contract.title
    byId('contract-status').textContent = contract.status
    byId('contract-summary').textContent = contract.summary
    byId('fact-student').textContent = `${contract.student} · ${contract.studentNote.replace('Học viên ', '')}`
    byId('fact-guardian').textContent = contract.guardian
    byId('fact-course').textContent = contract.course
    byId('fact-mode').textContent = contract.mode
    byId('fact-period').textContent = contract.period
    byId('fact-schedule').replaceChildren()
    contract.schedule.forEach((line, index) => {
      if (index) byId('fact-schedule').append(document.createElement('br'))
      byId('fact-schedule').append(line)
    })
    byId('income-total-label').textContent = contract.awaitingDeposit ? 'Thu nhập dự kiến sau ký quỹ' : 'Thu nhập thực nhận dự kiến'
    byId('income-total-value').textContent = `${money(incomeTotal)} · ${money(income)}/buổi`
    byId('student-name').textContent = contract.student
    byId('student-note').textContent = contract.studentNote
    byId('student-avatar').textContent = contract.studentInitials
    byId('guardian-line').textContent = `Phụ huynh: ${contract.guardian} · ${contract.modeLine}`
    const chatHref = `../chat/messages.html?contract=${encodeURIComponent(contractId)}`
    byId('message-link').href = chatHref
    byId('header-chat').href = chatHref
    byId('message-link').hidden = !contract.chat
    byId('header-chat').hidden = !contract.chat
    byId('header-wallet').href = '../wallet/overview.html'
    byId('finance-wallet').href = '../wallet/overview.html#transactions'
    byId('income-facts-note').textContent = `Học phí ${money(fee)}/buổi. Thu nhập thực nhận là ${money(income)} sau phí dịch vụ 10%.`
    byId('escrow-warning').hidden = !contract.awaitingDeposit
    if (contract.awaitingDeposit) {
      byId('income-note').textContent = `Chưa kích hoạt · phụ huynh cần ký quỹ ${money(contract.awaitingDeposit.total)}`
    }
  }

  const renderAlert = () => {
    const banner = byId('pending-alert')
    const actions = byId('pending-actions')
    actions.replaceChildren()
    if (contract.pendingLesson) {
      const lesson = lessons.find(item => item.id === contract.pendingLesson.lesson)
      if (!lesson || lesson.status !== 'pending') { banner.hidden = true; return }
      banner.hidden = false
      banner.classList.remove('alert--success')
      banner.classList.add('alert--warning')
      byId('pending-title').textContent = `Buổi ${lesson.id} đang chờ học viên hoặc phụ huynh xác nhận`
      byId('pending-description').textContent = `Đã điểm danh: ${attendanceLabels[lesson.attendance] || 'Có mặt'} · ${contract.pendingLesson.attended}. Hạn phản hồi: ${contract.pendingLesson.deadline}. Khoản thu nhập ${money(income)} đang chờ xác nhận.`
      const button = document.createElement('button')
      button.className = 'contract-button contract-button--secondary'
      button.type = 'button'
      button.dataset.action = 'detail'
      button.dataset.lesson = String(lesson.id)
      button.textContent = `Xem chi tiết buổi ${lesson.id}`
      actions.append(button)
      return
    }
    if (contract.awaitingDeposit) {
      banner.hidden = false
      banner.classList.remove('alert--success')
      banner.classList.add('alert--warning')
      byId('pending-title').textContent = 'Hợp đồng chưa kích hoạt'
      byId('pending-description').textContent = `Phụ huynh chưa hoàn tất ký quỹ ${money(contract.awaitingDeposit.total)} (${money(contract.awaitingDeposit.due)} qua PayOS sau khi cấn trừ ${money(contract.awaitingDeposit.wallet)} từ ví). Điểm danh và thu nhập chỉ khả dụng sau khi khoản ký quỹ được xác nhận.`
      return
    }
    banner.hidden = true
  }

  const render = () => {
    list.replaceChildren()
    const visible = lessons.filter(lesson => filter === 'all' || lesson.status === filter)

    visible.forEach(lesson => {
      const card = document.createElement('article')
      card.className = `lesson-card lesson-card--compact lesson-card--${lesson.status}`
      card.id = `lesson-${lesson.id}`
      card.setAttribute('aria-labelledby', `lesson-title-${lesson.id}`)

      const details = {
        completed: `Đã điểm danh: ${attendanceLabels[lesson.attendance]} · Thu nhập đã giải ngân: ${money(income)}`,
        pending: `Điểm danh: ${attendanceLabels[lesson.attendance]} · Thu nhập ${money(income)} đang chờ xác nhận`,
        upcoming: contract.awaitingDeposit
          ? `Chưa ký quỹ · Thu nhập dự kiến ${money(income)} chỉ ghi nhận sau khi phụ huynh ký quỹ`
          : `Ký quỹ bảo chứng: ${money(fee)} · Chưa điểm danh`
      }[lesson.status]
      const actionMarkup = canAttend(lesson)
        ? `<button class="contract-button" type="button" data-action="attendance" data-lesson="${lesson.id}">Điểm danh buổi ${lesson.id}</button>`
        : `<button class="contract-button contract-button--secondary" type="button" data-action="detail" data-lesson="${lesson.id}">Chi tiết buổi dạy</button>`

      card.innerHTML = `
        <span class="lesson-card__number" aria-hidden="true">B${lesson.id}</span>
        <div class="lesson-card__content">
          <header class="lesson-card__header"><h3 class="lesson-card__title" id="lesson-title-${lesson.id}">Buổi ${lesson.id} · ${lesson.date}</h3><span class="lesson-card__status">${labels[lesson.status]}</span></header>
          <p class="lesson-card__schedule">${contract.timeOfDay} · ${contract.courseLabel}</p>
          <p class="lesson-card__detail">${details}</p>
          <div class="lesson-card__actions">${actionMarkup}</div>
        </div>`
      list.append(card)
    })

    document.getElementById('lessons-empty').hidden = visible.length > 0
    document.getElementById('filter-status').textContent = `Đang hiển thị ${visible.length} buổi dạy.`
    document.querySelectorAll('[data-filter]').forEach(button => {
      const value = button.dataset.filter
      const title = { all: 'Tất cả', completed: 'Đã giải ngân', pending: 'Chờ xác nhận', upcoming: 'Sắp dạy' }[value]
      const count = value === 'all' ? lessons.length : lessons.filter(lesson => lesson.status === value).length
      button.textContent = `${title} (${count})`
      button.setAttribute('aria-pressed', String(value === filter))
      button.classList.toggle('filter-chip--selected', value === filter)
    })

    const completed = lessons.filter(lesson => lesson.status === 'completed').length
    const pending = lessons.filter(lesson => lesson.status === 'pending').length
    const upcoming = lessons.filter(lesson => lesson.status === 'upcoming').length
    document.getElementById('completion-summary').textContent = `${completed} buổi đã giải ngân · ${pending} buổi chờ xác nhận`
    document.getElementById('released-income').textContent = money(completed * income)
    document.getElementById('pending-income').textContent = money(pending * income)
    document.getElementById('upcoming-income').textContent = money(upcoming * income)
    const incomeProgress = document.getElementById('income-progress')
    incomeProgress.max = String(incomeTotal)
    incomeProgress.value = String(completed * income)
    incomeProgress.textContent = `${money(completed * income)} / ${money(incomeTotal)}`
    document.getElementById('income-total').textContent = money(incomeTotal)
    const attended = lessons.filter(lesson => lesson.attendance && lesson.attendance !== 'absent').length
    document.getElementById('teaching-summary').textContent = `Tiến độ giảng dạy: ${attended} / ${lessons.length} buổi`
    const teachingProgress = document.getElementById('teaching-progress')
    teachingProgress.max = String(lessons.length)
    teachingProgress.value = String(attended)
    teachingProgress.textContent = `${attended}/${lessons.length}`
    byId('progress-remaining').textContent = `Còn ${lessons.length - attended} buổi`
    const next = lessons.find(lesson => lesson.status === 'upcoming')
    const panel = document.getElementById('next-lesson')
    panel.hidden = !next
    if (next) {
      byId('next-title').textContent = `Buổi ${next.id} · ${weekdayOf(next.date)}`
      byId('next-date').textContent = next.date
      byId('next-time').textContent = `${contract.timeOfDay} · ${contract.minutes} phút`
      byId('next-topic').textContent = contract.next && contract.next.lesson === next.id
        ? contract.next.topic
        : 'Nội dung theo kế hoạch đã thống nhất với phụ huynh'
      const button = document.getElementById('next-attendance-button')
      button.dataset.lesson = next.id
      button.textContent = `Điểm danh buổi ${next.id}`
      button.disabled = !canAttend(next)
      document.getElementById('next-attendance-note').textContent = contract.awaitingDeposit
        ? 'Điểm danh chỉ mở khi phụ huynh hoàn tất ký quỹ hợp đồng.'
        : currentTime() < startTime(next)
          ? `Mở điểm danh từ ${contract.startAt} ngày ${next.date}, đến 48 giờ sau khi kết thúc buổi học.`
          : canAttend(next) ? 'Đang trong thời gian điểm danh.' : 'Đã hết thời gian điểm danh. Vui lòng liên hệ hỗ trợ.'
    }
  }

  const openInfo = (title, message) => {
    action = null
    attendanceOptions.hidden = true
    notes.hidden = true
    window.EduModal.open(modal, { title, message, variant: 'info' })
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action], [data-filter]')
    if (!button || button.disabled) return

    if (button.dataset.filter) {
      filter = button.dataset.filter
      render()
      return
    }

    action = button.dataset.action
    selected = lessons.find(lesson => lesson.id === Number(button.dataset.lesson)) || null
    attendanceOptions.hidden = true
    notes.hidden = true

    if (action === 'attendance' && selected && canAttend(selected)) {
      notes.hidden = false
      notes.querySelectorAll('textarea').forEach(field => { field.value = '' })
      attendanceOptions.hidden = false
      const present = attendanceOptions.querySelector('[value="present"]')
      present.checked = true
      attendanceOptions.querySelectorAll('.radio-option').forEach(option => {
        option.classList.toggle('radio-option--selected', option.contains(present))
      })
      window.EduModal.open(modal, {
        title: `Điểm danh buổi ${selected.id}`,
        message: `Buổi học ngày ${selected.date}, ${contract.timeOfDay} với học viên ${contract.student}. Sau khi điểm danh, buổi học sẽ chờ phụ huynh xác nhận.`,
        confirmText: 'Xác nhận điểm danh'
      })
    } else if (action === 'detail' && selected) {
      const attendance = selected.attendance ? `Đã điểm danh: ${attendanceLabels[selected.attendance]}.` : 'Chưa điểm danh.'
      openInfo(`Buổi ${selected.id} · ${selected.date}`, `${contract.courseLabel} · ${contract.timeOfDay}. ${attendance} Trạng thái: ${labels[selected.status]}. Thu nhập dự kiến: ${money(income)}.${selected.note ? ' Nhận xét: ' + selected.note : ''}${selected.homework ? ' Bài tập: ' + selected.homework : ''}`)
    } else if (action === 'contract-detail') {
      openInfo(`Hợp đồng ${contractId}`, `Gia sư Nguyễn Minh Anh · Học viên ${contract.student} · Phụ huynh ${contract.guardian}. ${contract.courseLabel}, ${sessions} buổi, ${contract.schedule.join(' ')} ${contract.timeOfDay}. Học phí ${money(fee)}/buổi, phí dịch vụ 10% (${money(serviceFee)}/buổi), thu nhập dự kiến ${money(income)}/buổi. Tổng thu nhập dự kiến: ${money(incomeTotal)}. Trạng thái: ${contract.status}.`)
    } else if (action === 'policy') {
      openInfo('Quy định điểm danh', 'Điểm danh được mở từ giờ bắt đầu buổi học. Sau khi điểm danh, phụ huynh có thời gian xác nhận hoặc báo vấn đề trước khi khoản thu nhập được giải ngân.')
    } else if (action === 'support') {
      openInfo('Hỗ trợ hợp đồng', 'Liên hệ bộ phận hỗ trợ khi bạn cần đổi lịch, không thể tiếp tục buổi dạy hoặc phát sinh vấn đề về điểm danh và đối soát.')
    }
  })

  modal.addEventListener('modal:confirm', event => {
    if (action !== 'attendance' || !selected || selected.status !== 'upcoming') return

    if (!canAttend(selected)) {
      event.preventDefault()
      window.EduToast.show({ type: 'warning', title: 'Ngoài thời gian điểm danh', message: 'Vui lòng kiểm tra lịch học hoặc liên hệ hỗ trợ.' })
      return
    }
    const attendance = attendanceOptions.querySelector('input[name="attendance"]:checked').value
    const result = Store.markAttendance({
      contractId: contract.contract.id,
      lessonNo: selected.id,
      status: attendance,
      note: notes.querySelector('#lesson-note').value.trim(),
      homework: notes.querySelector('#lesson-homework').value.trim(),
      idempotency: 'tutor-detail:attendance:' + contract.contract.id + ':' + selected.id
    })
    if (!result.ok) {
      event.preventDefault()
      const messages = {
        'not-next-lesson': `Cần điểm danh buổi ${result.lastMarkedLesson + 1} trước; dữ liệu không cho phép nhảy số buổi.`,
        'already-marked': 'Buổi này đã được điểm danh rồi.',
        'contract-not-active': 'Hợp đồng không ở trạng thái đang chạy nên không ghi điểm danh.',
        'contract-terminal': 'Hợp đồng đã kết thúc.',
        'invalid-lesson': 'Buổi học nằm ngoài phạm vi hợp đồng.',
        'invalid-attendance-status': 'Tình trạng tham gia không hợp lệ.',
        'invalid-note-length': 'Nhận xét hoặc bài tập vượt giới hạn ký tự.',
        duplicated: 'Yêu cầu đã gửi trước đó — bấm lặp không tạo lần điểm danh thứ hai.',
        'storage-failed': 'Không lưu được vào storage của tab. State trước đó được giữ nguyên.',
        'invalid-state': 'Không lưu được vì dữ liệu không hợp lệ. State trước đó được giữ nguyên.'
      }
      window.EduToast.show({ type: 'error', title: 'Chưa ghi được điểm danh', message: messages[result.reason] || result.reason })
      return
    }
    const attendanceLabel = { present: 'Có mặt', late: 'Đi muộn', absent: 'Vắng mặt' }[attendance]
    window.EduToast.show({
      type: 'success',
      title: 'Đã điểm danh buổi ' + selected.id + ': ' + attendanceLabel,
      message: attendance === 'absent'
        ? 'Buổi vắng được ghi nhận và KHÔNG tính là buổi hoàn thành, nên không có khoản giải ngân chờ xác nhận.'
        : `Đã ghi vào dữ liệu dùng chung: ${result.data.completedSessions}/${contract.sessions} buổi đã học. Thu nhập ${money(income)} chỉ giải ngân khi học viên xác nhận.`
    })
    /* Reload để mọi màn (học viên, ví, dashboard) đọc cùng một state,
       thay vì sửa object trong trang rồi báo "đã ghi nhận" như bản trước. */
    window.setTimeout(() => window.location.reload(), 900)
  })

  modal.addEventListener('modal:close', () => {
    attendanceOptions.hidden = true
    notes.hidden = true
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
      const note = document.createElement('p')
      note.textContent = entry.note
      item.append(time, note)
      byId('activity-list').append(item)
    })
  }

  renderFacts()
  renderAlert()
  renderActivity()
  render()
})()
