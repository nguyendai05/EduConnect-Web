/* Tương tác riêng của trang hợp đồng dạy; dữ liệu sẽ đến từ backend khi tích hợp JSP. */
(() => {
  const header = document.querySelector('[data-component="user-header"]')
  const walletLink = header?.querySelector('[data-menu-item="2"]')
  const contractLink = header?.querySelector('[data-menu-item="1"]')

  if (walletLink) {
    walletLink.querySelector('[data-menu-label]').textContent = 'Ví Edu Connect & Rút tiền'
    walletLink.href = '#finance'
  }
  if (contractLink) contractLink.href = '#contract'

  const dates = ['28/09/2026', '02/10/2026', '05/10/2026', '09/10/2026', '12/10/2026', '16/10/2026', '19/10/2026', '23/10/2026']
  const lessons = dates.map((date, index) => ({
    id: index + 1,
    date,
    status: index < 2 ? 'completed' : index === 2 ? 'pending' : 'upcoming',
    attendance: index < 3 ? 'present' : null
  }))
  // The static design represents 05/10/2026. Replace this snapshot with server time in JSP.
  const snapshot = Date.parse(document.getElementById('contract').dataset.snapshotAt)
  const openedAt = Date.now()
  const currentTime = () => snapshot + Date.now() - openedAt
  const attendanceLabels = { present: 'Có mặt', late: 'Đi muộn', absent: 'Vắng mặt' }
  const startTime = lesson => {
    const [day, month, year] = lesson.date.split('/')
    return Date.parse(`${year}-${month}-${day}T19:00:00+07:00`)
  }
  const canAttend = lesson => lesson.status === 'upcoming' &&
    currentTime() >= startTime(lesson) && currentTime() <= startTime(lesson) + (49.5 * 60 * 60 * 1000)
  const labels = {
    completed: 'Đã giải ngân',
    pending: 'Chờ xác nhận',
    upcoming: 'Sắp dạy'
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

  const money = value => new Intl.NumberFormat('vi-VN').format(value) + ' ₫'

  const render = () => {
    list.replaceChildren()
    const visible = lessons.filter(lesson => filter === 'all' || lesson.status === filter)

    visible.forEach(lesson => {
      const card = document.createElement('article')
      card.className = `lesson-card lesson-card--compact lesson-card--${lesson.status}`
      card.id = `lesson-${lesson.id}`
      card.setAttribute('aria-labelledby', `lesson-title-${lesson.id}`)

      const details = {
        completed: `Đã điểm danh: ${attendanceLabels[lesson.attendance]} · Thu nhập đã giải ngân: ${money(198000)}`,
        pending: `Điểm danh: ${attendanceLabels[lesson.attendance]} · Thu nhập ${money(198000)} đang chờ xác nhận`,
        upcoming: `Ký quỹ bảo chứng: ${money(220000)} · Chưa điểm danh`
      }[lesson.status]
      const actionMarkup = canAttend(lesson)
        ? `<button class="contract-button" type="button" data-action="attendance" data-lesson="${lesson.id}">Điểm danh buổi ${lesson.id}</button>`
        : `<button class="contract-button contract-button--secondary" type="button" data-action="detail" data-lesson="${lesson.id}">Chi tiết buổi dạy</button>`

      card.innerHTML = `
        <span class="lesson-card__number" aria-hidden="true">B${lesson.id}</span>
        <div class="lesson-card__content">
          <header class="lesson-card__header"><h3 class="lesson-card__title" id="lesson-title-${lesson.id}">Buổi ${lesson.id} · ${lesson.date}</h3><span class="lesson-card__status">${labels[lesson.status]}</span></header>
          <p class="lesson-card__schedule">19:00–20:30 · Toán lớp 11</p>
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
    document.getElementById('released-income').textContent = money(completed * 198000)
    document.getElementById('pending-income').textContent = money(pending * 198000)
    document.getElementById('upcoming-income').textContent = money(upcoming * 198000)
    document.getElementById('income-progress').value = completed * 198000
    const attended = lessons.filter(lesson => lesson.attendance && lesson.attendance !== 'absent').length
    document.getElementById('teaching-summary').textContent = `Tiến độ giảng dạy: ${attended} / ${lessons.length} buổi`
    document.getElementById('teaching-progress').value = attended
    const progressLabel = document.querySelector('[for="teaching-progress"]')
    progressLabel.textContent = `Đã dạy ${attended} buổi · Còn ${lessons.length - attended} buổi`
    const next = lessons.find(lesson => lesson.status === 'upcoming')
    const panel = document.getElementById('next-lesson')
    panel.hidden = !next
    if (next) {
      panel.querySelector('h2').textContent = `Buổi ${next.id} · ${next.id % 2 === 0 ? 'Thứ Sáu' : 'Thứ Hai'}`
      panel.querySelector('.contract-next-date').textContent = next.date
      const button = document.getElementById('next-attendance-button')
      button.dataset.lesson = next.id
      button.textContent = `Điểm danh buổi ${next.id}`
      button.disabled = !canAttend(next)
      document.getElementById('next-attendance-note').textContent = currentTime() < startTime(next)
        ? `Mở điểm danh từ 19:00 ngày ${next.date}, đến 48 giờ sau khi kết thúc buổi học.`
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
    selected = lessons.find(lesson => lesson.id === Number(button.dataset.lesson))
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
        message: `Buổi học ngày ${selected.date}, 19:00–20:30 với học viên Trần Gia Huy. Sau khi điểm danh, buổi học sẽ chờ phụ huynh xác nhận.`,
        confirmText: 'Xác nhận điểm danh'
      })
    } else if (action === 'detail' && selected) {
      const attendance = selected.attendance ? `Đã điểm danh: ${attendanceLabels[selected.attendance]}.` : 'Chưa điểm danh.'
      openInfo(`Buổi ${selected.id} · ${selected.date}`, `Toán lớp 11 · 19:00–20:30. ${attendance} Trạng thái: ${labels[selected.status]}. Thu nhập dự kiến: 198.000 ₫.${selected.note ? ' Nhận xét: ' + selected.note : ''}${selected.homework ? ' Bài tập: ' + selected.homework : ''}`)
    } else if (action === 'contract-detail') {
      openInfo('Hợp đồng HD-20260919-024', 'Gia sư Nguyễn Minh Anh · Học viên Trần Gia Huy · Phụ huynh Chị Mai Lan. Toán lớp 11, 8 buổi, Thứ Hai và Thứ Sáu 19:00–20:30. Học phí 220.000 ₫/buổi, phí dịch vụ 10%, thu nhập dự kiến 198.000 ₫/buổi. Tổng thu nhập dự kiến: 1.584.000 ₫.')
    } else if (action === 'policy') {
      openInfo('Quy định điểm danh', 'Điểm danh được mở từ giờ bắt đầu buổi học. Sau khi điểm danh, phụ huynh có thời gian xác nhận hoặc báo vấn đề trước khi khoản thu nhập được giải ngân.')
    } else if (action === 'support') {
      openInfo('Hỗ trợ hợp đồng', 'Liên hệ bộ phận hỗ trợ khi bạn cần đổi lịch, không thể tiếp tục buổi dạy hoặc phát sinh vấn đề về điểm danh và đối soát.')
    } else if (action === 'message') {
      openInfo('Tin nhắn', 'Cuộc trò chuyện với phụ huynh Chị Mai Lan sẽ được mở tại trang Tin nhắn.')
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

    document.getElementById('pending-title').textContent = `Buổi ${selected.id} đang chờ học viên hoặc phụ huynh xác nhận`
    document.getElementById('pending-description').textContent = `Điểm danh đã được ghi nhận: ${attendanceLabel}. Thu nhập 198.000 ₫ đang chờ xác nhận.`
    const timelineItem = document.createElement('li')
    const time = document.createElement('time')
    const description = document.createElement('p')
    time.dateTime = new Date().toISOString()
    time.textContent = 'Vừa xong'
    description.textContent = title
    timelineItem.append(time, description)
    document.getElementById('activity-list').prepend(timelineItem)
    const pendingButton = document.querySelector('#pending-alert [data-action="detail"]')
    pendingButton.dataset.lesson = selected.id
    pendingButton.textContent = `Xem chi tiết buổi ${selected.id}`
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

  render()
})()
