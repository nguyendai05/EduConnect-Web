/* Trang chi tiết hợp đồng phía gia sư. Dữ liệu nội trang dùng cho bản mẫu; snapshot 05/10/2026 thay bằng giờ server khi tích hợp JSP. */
(() => {
  const contracts = {
    'HD-20260919-024': {
      title: 'Hợp đồng dạy Toán cho Gia Huy', status: 'Đang thực hiện', crumb: 'Chi tiết hợp đồng dạy HD-20260919-024',
      summary: 'HD-20260919-024 · Toán lớp 11 · Học trực tiếp', student: 'Trần Gia Huy', studentNote: 'Học viên lớp 11',
      studentInitials: 'GH', guardian: 'Chị Mai Lan', course: 'Toán · Chương trình THPT', courseLabel: 'Toán lớp 11',
      mode: 'Trực tiếp tại nhà học viên', modeLine: 'Học trực tiếp tại nhà.', schedule: ['Thứ Hai & Thứ Sáu', '19:00–20:30'],
      timeOfDay: '19:00–20:30', startAt: '19:00', minutes: 90, period: '28/09/2026 – 23/10/2026', fee: 220000,
      dates: ['28/09/2026', '02/10/2026', '05/10/2026', '09/10/2026', '12/10/2026', '16/10/2026', '19/10/2026', '23/10/2026'],
      states: ['completed', 'completed', 'pending', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
      attendance: { 1: 'present', 2: 'present', 3: 'present' },
      pendingLesson: { lesson: 3, attended: '05/10/2026, 20:34', deadline: '08/10/2026, 20:34' },
      next: { lesson: 4, weekday: 'Thứ Sáu', date: '09/10/2026', topic: 'Phương trình lượng giác nâng cao' },
      awaitingDeposit: null, chat: true,
      activity: [
        { iso: '2026-10-05T20:34', text: '05/10/2026 · 20:34', note: 'Bạn đã điểm danh buổi 3: học viên có mặt.' },
        { iso: '2026-10-05T20:30', text: '05/10/2026 · 20:30', note: 'Buổi 2 được tự động xác nhận. 198.000 ₫ đã chuyển vào số dư khả dụng.' },
        { iso: '2026-09-28T21:02', text: '28/09/2026 · 21:02', note: 'Phụ huynh đã xác nhận buổi 1 và đánh giá 5 sao.' }
      ]
    },
    'HD-20260926-025': {
      title: 'Hợp đồng dạy Toán lớp 11 (kỳ 2) cho Gia Huy', status: 'Chờ ký quỹ', crumb: 'Chi tiết hợp đồng dạy HD-20260926-025',
      summary: 'HD-20260926-025 · Toán lớp 11 · Học trực tiếp', student: 'Trần Gia Huy', studentNote: 'Học viên lớp 11',
      studentInitials: 'GH', guardian: 'Chị Mai Lan', course: 'Toán · Chương trình THPT', courseLabel: 'Toán lớp 11',
      mode: 'Trực tiếp tại nhà học viên', modeLine: 'Học trực tiếp tại nhà.', schedule: ['Thứ Hai & Thứ Sáu', '19:00–20:30'],
      timeOfDay: '19:00–20:30', startAt: '19:00', minutes: 90, period: '02/11/2026 – 27/11/2026', fee: 220000,
      dates: ['02/11/2026', '06/11/2026', '09/11/2026', '13/11/2026', '16/11/2026', '20/11/2026', '23/11/2026', '27/11/2026'],
      states: ['upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
      attendance: {}, pendingLesson: null, next: null,
      awaitingDeposit: { total: 1760000, wallet: 340000, due: 1420000 }, chat: true,
      activity: [
        { iso: '2026-09-26T21:05', text: '26/09/2026 · 21:05', note: 'Phụ huynh đã xác nhận điều khoản. Hợp đồng chờ hoàn tất ký quỹ.' },
        { iso: '2026-09-26T20:12', text: '26/09/2026 · 20:12', note: 'Bạn và phụ huynh thống nhất lịch Thứ Hai & Thứ Sáu, 19:00–20:30.' }
      ]
    },
    'HD-20260928-027': {
      title: 'Hợp đồng dạy Toán lớp 10 cho Minh Khang', status: 'Đang thực hiện', crumb: 'Chi tiết hợp đồng dạy HD-20260928-027',
      summary: 'HD-20260928-027 · Toán lớp 10 · Học trực tiếp', student: 'Nguyễn Minh Khang', studentNote: 'Học viên lớp 10',
      studentInitials: 'MK', guardian: 'Anh Hoàng Nam', course: 'Toán · Chương trình THPT', courseLabel: 'Toán lớp 10',
      mode: 'Trực tiếp tại nhà học viên', modeLine: 'Học trực tiếp tại nhà.', schedule: ['Thứ Ba & Thứ Bảy', '20:00–21:30'],
      timeOfDay: '20:00–21:30', startAt: '20:00', minutes: 90, period: '15/09/2026 – 17/10/2026', fee: 180000,
      dates: ['15/09/2026', '19/09/2026', '22/09/2026', '26/09/2026', '29/09/2026', '03/10/2026', '06/10/2026', '10/10/2026', '13/10/2026', '17/10/2026'],
      states: ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
      attendance: { 1: 'present', 2: 'present', 3: 'late', 4: 'present', 5: 'present', 6: 'present' },
      pendingLesson: null,
      next: { lesson: 7, weekday: 'Thứ Bảy', date: '06/10/2026', topic: 'Hàm số bậc hai và đồ thị' },
      awaitingDeposit: null, chat: true,
      activity: [
        { iso: '2026-10-03T21:32', text: '03/10/2026 · 21:32', note: 'Buổi 6 được xác nhận. 162.000 ₫ đã chuyển vào số dư khả dụng.' },
        { iso: '2026-09-28T22:10', text: '28/09/2026 · 22:10', note: 'Phụ huynh đã ký quỹ đầy đủ 1.800.000 ₫ cho 10 buổi học.' },
        { iso: '2026-09-15T21:28', text: '15/09/2026 · 21:28', note: 'Buổi đầu tiên hoàn thành.' }
      ]
    },
    'HD-20260905-019': {
      title: 'Hợp đồng ôn Toán lớp 9 cho Ngọc Anh', status: 'Đang thực hiện', crumb: 'Chi tiết hợp đồng dạy HD-20260905-019',
      summary: 'HD-20260905-019 · Toán lớp 9 · Học trực tuyến', student: 'Trần Ngọc Anh', studentNote: 'Học viên lớp 9',
      studentInitials: 'NA', guardian: 'Chị Thu Hà', course: 'Toán · Chương trình THCS', courseLabel: 'Toán lớp 9',
      mode: 'Trực tuyến', modeLine: 'Học trực tuyến qua lớp học của nền tảng.', schedule: ['Chủ Nhật & Thứ Năm', '19:00–20:30'],
      timeOfDay: '19:00–20:30', startAt: '19:00', minutes: 90, period: '20/09/2026 – 29/10/2026', fee: 160000,
      dates: ['20/09/2026', '24/09/2026', '27/09/2026', '01/10/2026', '04/10/2026', '08/10/2026', '11/10/2026', '15/10/2026', '18/10/2026', '22/10/2026', '25/10/2026', '29/10/2026'],
      states: ['completed', 'completed', 'completed', 'completed', 'pending', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming', 'upcoming'],
      attendance: { 1: 'present', 2: 'present', 3: 'present', 4: 'late', 5: 'present' },
      pendingLesson: { lesson: 5, attended: '04/10/2026, 20:36', deadline: '07/10/2026, 20:36' },
      next: { lesson: 6, weekday: 'Thứ Năm', date: '08/10/2026', topic: 'Hệ phương trình và bài toán thực tế' },
      awaitingDeposit: null, chat: true,
      activity: [
        { iso: '2026-10-04T20:36', text: '04/10/2026 · 20:36', note: 'Bạn đã điểm danh buổi 5: học viên có mặt. Đang chờ phụ huynh xác nhận.' },
        { iso: '2026-10-01T20:31', text: '01/10/2026 · 20:31', note: 'Buổi 4 được xác nhận. 144.000 ₫ đã chuyển vào số dư khả dụng.' },
        { iso: '2026-09-20T20:29', text: '20/09/2026 · 20:29', note: 'Hợp đồng bắt đầu sau khi phụ huynh ký quỹ 1.920.000 ₫.' }
      ]
    }
  }
  const byId = id => document.getElementById(id)
  const money = value => new Intl.NumberFormat('vi-VN').format(value) + ' ₫'
  const serviceRate = 0.1
  const params = new URLSearchParams(location.search)
  const requested = params.get('id') || params.get('contract')
  const contractId = requested && !contracts[requested] ? null : requested || 'HD-20260919-024'
  const contract = contractId ? contracts[contractId] : null
  if (!contract) {
    byId('crumb-contract').textContent = 'Không tìm thấy hợp đồng'
    byId('not-found-title').textContent = `Không tìm thấy hợp đồng ${requested}`
    byId('not-found-description').textContent = 'Mã hợp đồng trong liên kết không thuộc danh sách lớp bạn đang nhận. Vui lòng mở hợp đồng từ tin nhắn hoặc trang việc đã nhận.'
    for (const node of [byId('contract-header'), byId('contract-progress'), byId('contract-spotlight'), byId('contract-columns')]) node.hidden = true
    byId('contract-not-found').hidden = false
    return
  }
  const fee = contract.fee
  const income = Math.round(fee * (1 - serviceRate))
  const serviceFee = Math.round(fee * serviceRate)
  const sessions = contract.dates.length
  const incomeTotal = income * sessions
  const weekdayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const weekdayOf = date => {
    const [day, month, year] = date.split('/')
    return weekdayNames[new Date(`${year}-${month}-${day}T12:00:00+07:00`).getUTCDay()]
  }
  const lessons = contract.dates.map((date, index) => ({
    id: index + 1,
    date,
    status: contract.states[index],
    attendance: contract.attendance[index + 1] || null
  }))
  // The static design represents 05/10/2026. Replace this snapshot with server time in JSP.
  const snapshot = Date.parse(document.getElementById('contract').dataset.snapshotAt)
  const openedAt = Date.now()
  const currentTime = () => snapshot + Date.now() - openedAt
  const attendanceLabels = { present: 'Có mặt', late: 'Đi muộn', absent: 'Vắng mặt' }
  const startTime = lesson => {
    const [day, month, year] = lesson.date.split('/')
    return Date.parse(`${year}-${month}-${day}T${contract.startAt}:00+07:00`)
  }
  const canAttend = lesson => lesson.status === 'upcoming' && !contract.awaitingDeposit &&
    currentTime() >= startTime(lesson) && currentTime() <= startTime(lesson) + (49.5 * 60 * 60 * 1000)
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
    byId('crumb-contract').textContent = contract.crumb
    byId('crumb-contract').title = contract.crumb
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
    selected.note = notes.querySelector('#lesson-note').value.trim()
    selected.homework = notes.querySelector('#lesson-homework').value.trim()
    const attendance = attendanceOptions.querySelector('input[name="attendance"]:checked').value
    selected.attendance = attendance
    selected.status = 'pending'
    const attendanceLabel = { present: 'Có mặt', late: 'Đi muộn', absent: 'Vắng mặt' }[attendance]
    const title = `Đã điểm danh buổi ${selected.id}: ${attendanceLabel}`

    const banner = document.getElementById('pending-alert')
    banner.hidden = false
    banner.classList.remove('alert--success')
    banner.classList.add('alert--warning')
    document.getElementById('pending-title').textContent = `Buổi ${selected.id} đang chờ học viên hoặc phụ huynh xác nhận`
    document.getElementById('pending-description').textContent = `Điểm danh đã được ghi nhận: ${attendanceLabel}. Thu nhập ${money(income)} đang chờ xác nhận.`
    const actions = document.getElementById('pending-actions')
    actions.replaceChildren()
    const detail = document.createElement('button')
    detail.className = 'contract-button contract-button--secondary'
    detail.type = 'button'
    detail.dataset.action = 'detail'
    detail.dataset.lesson = String(selected.id)
    detail.textContent = `Xem chi tiết buổi ${selected.id}`
    actions.append(detail)
    const timelineItem = document.createElement('li')
    const time = document.createElement('time')
    const description = document.createElement('p')
    time.dateTime = new Date().toISOString()
    time.textContent = 'Vừa xong'
    description.textContent = title
    timelineItem.append(time, description)
    document.getElementById('activity-list').prepend(timelineItem)
    const nextAttendanceButton = document.getElementById('next-attendance-button')
    const nextAttendanceNote = document.getElementById('next-attendance-note')
    if (nextAttendanceButton) nextAttendanceButton.hidden = false
    if (nextAttendanceNote) nextAttendanceNote.textContent = `Đã điểm danh: ${attendanceLabel}. Đang chờ phụ huynh xác nhận.`
    render()
    window.EduToast.show({ type: 'success', title, message: 'Buổi học đã chuyển sang trạng thái chờ xác nhận.' })
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
