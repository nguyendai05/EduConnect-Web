(() => {
  const page = document.querySelector('[data-detail-page]')
  if (!page) return

  const Store = window.EduStore
  if (!Store) return

  const requestedId = (new URLSearchParams(window.location.search).get('id') || '').trim().toUpperCase()
  const notFound = page.querySelector('[data-detail-not-found]')
  const job = requestedId ? Store.job(requestedId) : null

  if (!job) {
    page.querySelectorAll('[data-detail-content]').forEach(node => { node.hidden = true })
    if (notFound) notFound.hidden = false
    const requestedLabel = page.querySelector('[data-detail-requested-id]')
    if (requestedLabel) requestedLabel.textContent = requestedId || 'chưa được cung cấp'
    document.title = 'Không tìm thấy tin tìm gia sư | Edu Connect'
    return
  }

  const form = page.querySelector('[data-application-form]')
  const rateInput = page.querySelector('[data-rate-input]')
  const comparison = page.querySelector('[data-rate-comparison]')
  const slotList = page.querySelector('[data-slot-list]')
  const slotError = page.querySelector('[data-slot-error]')
  const note = page.querySelector('[data-cover-note]')
  const summaryRate = page.querySelector('[data-summary-rate]')
  const summarySlots = page.querySelector('[data-summary-slots]')
  const modalRate = document.querySelector('[data-modal-rate]')
  const modalSlots = document.querySelector('[data-modal-slots]')
  const parentRate = Store.toInteger(job.budgetPerSession)
  const extraSlots = [
    { day: 'Thứ 4', time: '19:00 - 20:30' },
    { day: 'Thứ 7', time: '08:00 - 09:30' },
    { day: 'Chủ nhật', time: '14:00 - 15:30' }
  ]

  const digits = value => String(value || '').replace(/\D/g, '')
  const formatNumber = value => new Intl.NumberFormat('vi-VN').format(Number(value) || 0)
  const formatRate = () => `${formatNumber(digits(rateInput?.value))} ₫ / buổi`

  const slotElements = () => [...(slotList?.querySelectorAll('[data-slot]') || [])]
  const slotDays = () => slotElements().map(slot => slot.dataset.day)
  const slotTimeOf = slot => slot.querySelector('span')?.textContent.split('·')[1]?.trim() || ''
  const slotEntries = () => slotElements().map(slot => ({ day: slot.dataset.day, time: slotTimeOf(slot) }))

  const slotSummary = () => {
    const days = slotDays()
    if (!days.length) return 'Chưa chọn khung giờ'
    const time = slotTimeOf(slotElements()[0])
    return `${days.join(' & ')}${time ? ` (${time})` : ''}`
  }

  const updateSummary = () => {
    const rate = formatRate()
    const slots = slotSummary()
    if (summaryRate) summaryRate.textContent = rate
    if (summarySlots) summarySlots.textContent = slots
    if (modalRate) modalRate.textContent = rate
    if (modalSlots) modalSlots.textContent = slots
    if (slotError) slotError.hidden = slotElements().length > 0
  }

  const updateRate = () => {
    if (!rateInput) return
    const value = Number(digits(rateInput.value))
    rateInput.value = value ? formatNumber(value) : ''
    if (comparison) {
      const difference = value - parentRate
      comparison.classList.toggle('is-different', difference !== 0)
      comparison.textContent = difference === 0
        ? `✓ Bằng mức phụ huynh mong muốn (${formatNumber(parentRate)} ₫)`
        : difference > 0
          ? `ⓘ Cao hơn mức phụ huynh mong muốn ${formatNumber(difference)} ₫`
          : `ⓘ Thấp hơn mức phụ huynh mong muốn ${formatNumber(Math.abs(difference))} ₫`
    }
    updateSummary()
  }

  const makeSlot = ({ day, time }) => {
    const slot = document.createElement('div')
    slot.className = 'application-slot'
    slot.dataset.slot = ''
    slot.dataset.day = day

    const label = document.createElement('span')
    const icon = document.createElement('img')
    icon.src = '../../assets/icons/calendar.svg'
    icon.alt = ''
    label.append(icon, document.createTextNode(`${day} · ${time}`))

    const remove = document.createElement('button')
    remove.type = 'button'
    remove.dataset.removeSlot = ''
    remove.setAttribute('aria-label', `Xóa khung giờ ${day}`)
    remove.textContent = '×'
    slot.append(label, remove)
    return slot
  }

  const replaceSlots = slots => {
    slotList.replaceChildren(...slots.map(makeSlot))
    updateSummary()
  }

  const setRender = (key, value) => {
    const node = document.querySelector(`[data-render="${key}"]`)
    if (node) node.textContent = value
  }

  // Mọi trường đều suy ra từ EduStore — không còn bảng `jobs` tự giữ trong trang.
  const LEVEL_LABEL = Object.freeze({ thpt: 'THPT', thcs: 'THCS', adult: 'Đi làm' })
  const learner = Store.learner(job.learnerId)
  const parentName = learner ? learner.name : 'người đăng tin'
  const parentInitials = learner ? learner.initials : '—'
  const parentChild = learner ? `${learner.studentName} (${learner.grade})` : '—'
  const parentResponse = learner ? `${learner.responseRate}%` : '—'
  const parentSince = learner ? `Thành viên từ ${learner.memberSince}` : '—'

  const tutorId = Store.sessionTutorId()
  const tutor = tutorId ? Store.tutor(tutorId) : null
  const applicationCount = Store.applicationsOfJob(job.id).length

  const statusInfo = () => {
    if (job.status === 'pending') return { label: 'Chờ duyệt', className: 'badge badge--warning detail-status' }
    if (job.availability === 'closed') return { label: 'Đã đóng', className: 'badge detail-status' }
    return { label: 'Đang tuyển', className: 'badge badge--info detail-status detail-status--hiring' }
  }

  const renderJob = () => {
    document.title = `${job.title} | Edu Connect`
    setRender('breadcrumb', `${job.title} (Mã tin: ${job.id})`)
    setRender('title', job.title)
    setRender('code', `Mã tin: #${job.id}`)
    setRender('posted', Store.timeAgo(job.publishedAt))
    setRender('applicants', `${applicationCount} gia sư đã ứng tuyển`)
    setRender('match-subject', `Môn ${job.subjectLabel}`)
    setRender('match-grade', LEVEL_LABEL[job.level] || job.level)
    setRender('match-region', job.district)
    setRender('match-experience', tutor ? `${tutor.experienceYears} năm kinh nghiệm` : 'Đạt yêu cầu')
    setRender('subject', job.subjectLabel)
    setRender('grade', job.gradeLabel)
    setRender('frequency', `${job.sessionsPerWeek} buổi / tuần`)
    setRender('fee', `${Store.formatMoney(job.budgetPerSession)} / buổi`)
    setRender('format', job.modeLabel)
    setRender('region', job.district)
    setRender('experience', job.experienceLabel)
    setRender('gender', job.genderLabel)
    setRender('goals', job.description)
    setRender('parent-name', parentName)
    setRender('parent-initials', parentInitials)
    setRender('parent-child', parentChild)
    setRender('parent-response', parentResponse)
    setRender('parent-since', parentSince)
    setRender('modal-confirm-parent', `Bạn chuẩn bị gửi đề xuất học phí và lịch dạy cho phụ huynh ${parentName}. Mỗi gia sư chỉ có 1 lượt ứng tuyển cho tin này.`)

    const status = statusInfo()
    const statusNode = document.querySelector('[data-render="status"]')
    if (statusNode) {
      statusNode.className = status.className
      statusNode.replaceChildren(document.createElement('i'), document.createTextNode(status.label))
    }

    const focusList = document.querySelector('[data-render="focus-list"]')
    if (focusList) focusList.replaceChildren(...(job.focus || []).map(item => {
      const marker = document.createElement('span')
      marker.textContent = item
      return marker
    }))

    const parentAvatar = document.querySelector('[data-render="parent-initials"]')
    if (parentAvatar) parentAvatar.setAttribute('aria-label', `Ảnh đại diện ${parentName}`)
  }

  rateInput?.addEventListener('input', updateRate)
  rateInput?.addEventListener('blur', updateRate)

  slotList?.addEventListener('click', event => {
    const remove = event.target.closest('[data-remove-slot]')
    if (!remove) return
    remove.closest('[data-slot]')?.remove()
    updateSummary()
  })

  page.querySelector('[data-add-slot]')?.addEventListener('click', () => {
    const used = new Set(slotDays())
    const next = extraSlots.find(slot => !used.has(slot.day))
    if (!next) {
      window.EduToast?.show({ type: 'info', title: 'Đã đủ khung giờ mẫu', message: 'Bạn có thể dùng lịch rảnh từ hồ sơ để khôi phục lịch đề xuất.' })
      return
    }
    slotList.append(makeSlot(next))
    updateSummary()
  })

  page.querySelector('[data-prefill-slots]')?.addEventListener('click', () => {
    replaceSlots([
      { day: 'Thứ 2', time: '19:00 - 20:30' },
      { day: 'Thứ 4', time: '19:00 - 20:30' },
      { day: 'Thứ 6', time: '19:00 - 20:30' }
    ])
    window.EduToast?.show({ type: 'success', title: 'Đã dùng lịch rảnh', message: 'Ba khung giờ từ hồ sơ đã được thêm vào đơn ứng tuyển.' })
  })

  const openModal = (id, options) => window.EduModal?.open(id, options)
  const openConfirm = () => openModal('application-confirm-modal', {
    title: 'Xác nhận gửi ứng tuyển',
    message: `Bạn chuẩn bị gửi đề xuất học phí và lịch dạy cho phụ huynh ${parentName}. Mỗi gia sư chỉ có 1 lượt ứng tuyển cho tin này.`,
    confirmText: 'Xác nhận gửi',
    cancelText: 'Hủy bỏ'
  })

  let createdApplicationId = null
  const openSuccess = () => openModal('application-success-modal', {
    variant: 'info',
    title: 'Ứng tuyển thành công!',
    message: `Hồ sơ ${createdApplicationId} của bạn đã được chuyển tới phụ huynh ${parentName}. Bạn sẽ nhận được thông báo ngay khi phụ huynh phản hồi.`,
    cancelText: 'Đóng cửa sổ'
  })

  // Lời báo cho từng lý do applyToJob chặn (reason trả về từ store).
  const REASON_MESSAGES = Object.freeze({
    'job-not-found': 'Tin không còn tồn tại trong hệ thống, vui lòng chọn tin khác.',
    'job-not-approved': 'Tin này đang chờ duyệt nên chưa nhận hồ sơ ứng tuyển.',
    'job-closed': 'Tin này đã đóng, không còn nhận ứng tuyển nữa.',
    'invalid-rate': 'Mức học phí đề xuất không hợp lệ. Vui lòng nhập một số lớn hơn 0.',
    'already-applied': 'Bạn đã ứng tuyển tin này trước đó — mỗi gia sư chỉ có 1 lượt cho mỗi tin.',
    'tutor-not-found': 'Không tìm thấy hồ sơ gia sư của bạn. Vui lòng đăng nhập bằng persona gia sư.',
    duplicated: 'Yêu cầu đã được gửi trước đó — bấm lặp không tạo thêm hồ sơ.'
  })

  form?.addEventListener('submit', event => {
    event.preventDefault()
    const hasRate = Number(digits(rateInput?.value)) > 0
    const hasSlots = slotElements().length > 0
    const hasNote = Boolean(note?.value.trim())
    if (slotError) slotError.hidden = hasSlots
    if (!hasRate || !hasSlots || !hasNote) {
      window.EduToast?.show({ type: 'error', title: 'Chưa đủ thông tin', message: 'Vui lòng nhập học phí, chọn lịch dạy và viết lời giới thiệu trước khi gửi.' })
      if (!hasRate) rateInput?.focus()
      else if (!hasNote) note?.focus()
      return
    }
    if (!tutorId) {
      window.EduToast?.show({ type: 'error', title: 'Chưa đăng nhập gia sư', message: 'Bạn cần đăng nhập bằng hồ sơ gia sư (persona gia sư) trước khi ứng tuyển tin này.' })
      return
    }
    updateSummary()
    openConfirm()
  })

  const confirmModal = document.getElementById('application-confirm-modal')
  // Ghi store THẬT khi người dùng xác nhận; giữ modal mở nếu store từ chối.
  confirmModal?.addEventListener('modal:confirm', event => {
    event.preventDefault()
    const result = Store.applyToJob({
      jobId: job.id,
      tutorId,
      proposedRate: Number(digits(rateInput?.value)),
      message: note?.value.trim() || '',
      slots: slotEntries(),
      idempotency: `job-detail:apply:${job.id}:${tutorId}`
    })
    if (!result.ok) {
      window.EduToast?.show({ type: 'error', title: 'Chưa gửi được ứng tuyển', message: REASON_MESSAGES[result.reason] || result.reason })
      return
    }
    createdApplicationId = result.data.id
    window.EduModal?.close('application-confirm-modal', 'confirm')
  })

  confirmModal?.addEventListener('modal:close', event => {
    if (event.detail?.reason === 'confirm') window.setTimeout(openSuccess, 0)
  })

  renderJob()
  if (rateInput) rateInput.value = formatNumber(parentRate)
  updateRate()
})()
