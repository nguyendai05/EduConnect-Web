(() => {
  const page = document.querySelector('[data-detail-page]')
  if (!page) return

  // Dữ liệu mẫu dùng chung với bảng tin (discover.html) và trang "Tin của tôi" (my-job.html).
  const tutorExperience = '5 năm'
  const jobs = {
    'TT-8841': {
      code: 'TT-8841',
      title: 'Tìm gia sư Toán lớp 11 tại Thủ Đức',
      breadcrumb: 'Toán lớp 11 tại Thủ Đức (Mã tin: TT-8841)',
      status: 'Đang tuyển',
      statusClass: 'badge badge--info detail-status detail-status--hiring',
      posted: 'Đăng 2 giờ trước',
      applicants: 3,
      subject: 'Toán',
      matchSubject: 'Môn Toán',
      grade: 'Lớp 11 · THPT',
      matchGrade: 'THPT',
      frequency: '2 buổi / tuần',
      fee: 220000,
      format: 'Tại nhà học sinh',
      region: 'P. Linh Trung, TP. Thủ Đức',
      matchRegion: 'TP. Thủ Đức',
      experience: 'Từ 3 năm trở lên',
      gender: 'Không yêu cầu (Nam/Nữ)',
      goals: 'Gia Huy hiện đang học lớp 11 và cần củng cố phần Hàm số lượng giác và Hình học không gian. Gia đình mong muốn tìm gia sư có kinh nghiệm dạy THPT, giảng dễ hiểu và có phương pháp sư phạm rõ ràng để chuẩn bị cho kỳ kiểm tra sắp tới.',
      focus: ['✓ Hàm số lượng giác', '✓ Hình học không gian', '▣ Lộ trình ôn tập giữa kỳ & học kỳ 1'],
      parent: { name: 'Chị Mai Lan', initials: 'ML', child: 'Gia Huy (Lớp 11)', response: '100%', since: 'Thành viên từ 2024' }
    },
    'TT-8820': {
      code: 'TT-8820',
      title: 'Tìm gia sư Vật lý lớp 11 luyện giữa học kỳ',
      breadcrumb: 'Vật lý lớp 11 luyện giữa học kỳ (Mã tin: TT-8820)',
      status: 'Đang tuyển',
      statusClass: 'badge badge--info detail-status detail-status--hiring',
      posted: 'Đăng 5 giờ trước',
      applicants: 2,
      subject: 'Vật lý',
      matchSubject: 'Môn Vật lý',
      grade: 'Lớp 11 · THPT',
      matchGrade: 'THPT',
      frequency: '2 buổi / tuần',
      fee: 200000,
      format: 'Tại nhà học sinh',
      region: 'P. Hiệp Bình Chánh, TP. Thủ Đức',
      matchRegion: 'TP. Thủ Đức',
      experience: 'Từ 2 năm trở lên',
      gender: 'Không yêu cầu (Nam/Nữ)',
      goals: 'Học sinh cần ôn tập dao động cơ và sóng cơ theo chương trình của trường, kết hợp bài tập phân loại để chuẩn bị bài kiểm tra giữa học kỳ 1.',
      focus: ['✓ Dao động cơ', '✓ Sóng cơ', '▣ Bài tập phân loại giữa kỳ'],
      parent: { name: 'Anh Hoàng Phúc', initials: 'HP', child: 'Khánh Văn (Lớp 11)', response: '92%', since: 'Thành viên từ 2025' }
    },
    'TT-8796': {
      code: 'TT-8796',
      title: 'Cần gia sư Toán lớp 9 ôn thi vào lớp 10',
      breadcrumb: 'Toán lớp 9 ôn thi vào lớp 10 (Mã tin: TT-8796)',
      status: 'Đang tuyển',
      statusClass: 'badge badge--info detail-status detail-status--hiring',
      posted: 'Đăng 1 ngày trước',
      applicants: 8,
      subject: 'Toán',
      matchSubject: 'Môn Toán',
      grade: 'Lớp 9 · THCS',
      matchGrade: 'THCS',
      frequency: '3 buổi / tuần',
      fee: 250000,
      format: 'Tại nhà học sinh',
      region: 'P. 25, Quận Bình Thạnh',
      matchRegion: 'Quận Bình Thạnh',
      experience: 'Từ 2 năm trở lên',
      gender: 'Không yêu cầu (Nam/Nữ)',
      goals: 'Học sinh cần gia cố hình học đường tròn và các bài toán thực tế bằng cách lập phương trình. Gia đình ưu tiên gia sư kiên nhẫn, giải thích trực quan và theo sát đề ôn thi vào lớp 10.',
      focus: ['✓ Đường tròn', '✓ Bài toán lập phương trình', '▣ Đề ôn thi vào lớp 10'],
      parent: { name: 'Chị Thu Hằng', initials: 'TH', child: 'Bảo Trâm (Lớp 9)', response: '96%', since: 'Thành viên từ 2023' }
    },
    'TT-8750': {
      code: 'TT-8750',
      title: 'Tìm gia sư Toán lớp 10 tại Quận 3',
      breadcrumb: 'Toán lớp 10 tại Quận 3 (Mã tin: TT-8750)',
      status: 'Đang tuyển',
      statusClass: 'badge badge--info detail-status detail-status--hiring',
      posted: 'Đăng 1 ngày trước',
      applicants: 5,
      subject: 'Toán',
      matchSubject: 'Môn Toán',
      grade: 'Lớp 10 · THPT',
      matchGrade: 'THPT',
      frequency: '2 buổi / tuần',
      fee: 220000,
      format: 'Tại nhà học sinh',
      region: 'P. Võ Thị Sáu, Quận 3',
      matchRegion: 'Quận 3',
      experience: 'Từ 3 năm trở lên',
      gender: 'Không yêu cầu (Nam/Nữ)',
      goals: 'Học sinh lớp 10 cần học lại nền tảng Hàm số và Phương trình lượng giác trước khi bước vào chương trình học kỳ 1. Gia đình mong muốn gia sư có lộ trình rõ ràng và kiểm tra tiến độ định kỳ.',
      focus: ['✓ Hàm số', '✓ Phương trình lượng giác', '▣ Kiểm tra tiến độ hằng tháng'],
      parent: { name: 'Anh Đức Kiên', initials: 'DK', child: 'Gia Bảo (Lớp 10)', response: '88%', since: 'Thành viên từ 2025' }
    },
    'TT-8620': {
      code: 'TT-8620',
      title: 'Tìm gia sư Tiếng Anh giao tiếp cho học sinh THPT',
      breadcrumb: 'Tiếng Anh giao tiếp cho học sinh THPT (Mã tin: TT-8620)',
      status: 'Đang tuyển',
      statusClass: 'badge badge--info detail-status detail-status--hiring',
      posted: 'Đăng 4 ngày trước',
      applicants: 3,
      subject: 'Tiếng Anh',
      matchSubject: 'Môn Tiếng Anh',
      grade: 'Lớp 10 – 12 · THPT',
      matchGrade: 'THPT',
      frequency: '2 buổi / tuần',
      fee: 230000,
      format: 'Trực tuyến (Google Meet)',
      region: 'Trực tuyến toàn quốc',
      matchRegion: 'Trực tuyến toàn quốc',
      experience: 'Ưu tiên có chứng chỉ IELTS',
      gender: 'Không yêu cầu (Nam/Nữ)',
      goals: 'Học sinh cần luyện phát âm chuẩn IPA và phản xạ giao tiếp tự tin để chuẩn bị kế hoạch du học cuối cấp. Buổi học diễn ra trực tuyến qua Google Meet, gia đình mong muốn gia sư sửa lỗi phát âm cụ thể sau mỗi buổi.',
      focus: ['✓ Phát âm chuẩn IPA', '✓ Phản xạ giao tiếp', '▣ Hồ sơ du học cuối cấp'],
      parent: { name: 'Chị Ngọc Anh', initials: 'NA', child: 'Hải Yến (Lớp 12)', response: '94%', since: 'Thành viên từ 2024' }
    },
    'TT-88412': {
      code: 'TT-88412',
      title: 'Tìm gia sư Toán lớp 11 tại Thủ Đức',
      breadcrumb: 'Toán lớp 11 tại Thủ Đức (Mã tin: TT-88412)',
      status: 'Đang tuyển',
      statusClass: 'badge badge--info detail-status detail-status--hiring',
      posted: 'Đăng 2 ngày trước',
      applicants: 6,
      subject: 'Toán',
      matchSubject: 'Môn Toán',
      grade: 'Lớp 11 · THPT',
      matchGrade: 'THPT',
      frequency: '2 buổi / tuần',
      fee: 220000,
      format: 'Tại nhà học sinh',
      region: 'P. Linh Trung, TP. Thủ Đức',
      matchRegion: 'TP. Thủ Đức',
      experience: 'Ưu tiên từ 3 năm kinh nghiệm',
      gender: 'Không yêu cầu (Nam/Nữ)',
      goals: 'Gia Huy hiện đang học lớp 11 và cần củng cố phần Hàm số lượng giác và Hình học không gian. Gia đình mong muốn gia sư kèm sát chương trình ôn thi THPT và có lộ trình theo năng lực của học sinh.',
      focus: ['✓ Hàm số lượng giác', '✓ Hình học không gian', '▣ Lộ trình ôn thi THPT'],
      parent: { name: 'Chị Mai Lan', initials: 'ML', child: 'Gia Huy (Lớp 11)', response: '100%', since: 'Thành viên từ 2024' }
    },
    'TT-88209': {
      code: 'TT-88209',
      title: 'Tìm gia sư Tiếng Anh giao tiếp cho học sinh THPT',
      breadcrumb: 'Tiếng Anh giao tiếp cho học sinh THPT (Mã tin: TT-88209)',
      status: 'Đang tuyển',
      statusClass: 'badge badge--info detail-status detail-status--hiring',
      posted: 'Đăng 4 ngày trước',
      applicants: 2,
      subject: 'Tiếng Anh',
      matchSubject: 'Môn Tiếng Anh',
      grade: 'Lớp 10 – 12 · THPT',
      matchGrade: 'THPT',
      frequency: '2 buổi / tuần',
      fee: 250000,
      format: 'Trực tuyến (Google Meet / Zoom)',
      region: 'Trực tuyến toàn quốc',
      matchRegion: 'Trực tuyến toàn quốc',
      experience: 'Ưu tiên có chứng chỉ IELTS',
      gender: 'Không yêu cầu (Nam/Nữ)',
      goals: 'Học sinh cần luyện phản xạ, thuyết trình và phát âm chuẩn IPA theo khung thời gian linh hoạt cuối tuần. Gia đình ưu tiên gia sư có chứng chỉ quốc tế và giáo án giao tiếp rõ ràng.',
      focus: ['✓ Phản xạ giao tiếp', '✓ Thuyết trình bằng tiếng Anh', '▣ Phát âm chuẩn IPA'],
      parent: { name: 'Chị Mai Lan', initials: 'ML', child: 'Khánh My (Lớp 12)', response: '100%', since: 'Thành viên từ 2024' }
    },
    'TT-88590': {
      code: 'TT-88590',
      title: 'Tìm gia sư Vật lý lớp 11 luyện giữa học kỳ',
      breadcrumb: 'Vật lý lớp 11 luyện giữa học kỳ (Mã tin: TT-88590)',
      status: 'Chờ duyệt',
      statusClass: 'badge badge--warning detail-status',
      posted: 'Gửi 3 giờ trước',
      applicants: 0,
      subject: 'Vật lý',
      matchSubject: 'Môn Vật lý',
      grade: 'Lớp 11 · THPT',
      matchGrade: 'THPT',
      frequency: '2 buổi / tuần',
      fee: 200000,
      format: 'Tại nhà học sinh',
      region: 'P. Linh Trung, TP. Thủ Đức',
      matchRegion: 'TP. Thủ Đức',
      experience: 'Từ 2 năm trở lên',
      gender: 'Không yêu cầu (Nam/Nữ)',
      goals: 'Học sinh cần ôn dao động cơ và sóng cơ trước bài kiểm tra giữa học kỳ 1. Tin đang trong thời gian kiểm duyệt nên chưa nhận hồ sơ ứng tuyển.',
      focus: ['✓ Dao động cơ', '✓ Sóng cơ', '▣ Bài tập giữa học kỳ 1'],
      parent: { name: 'Chị Mai Lan', initials: 'ML', child: 'Gia Huy (Lớp 11)', response: '100%', since: 'Thành viên từ 2024' }
    },
    'TT-87910': {
      code: 'TT-87910',
      title: 'Tìm gia sư Ngữ văn lớp 10',
      breadcrumb: 'Ngữ văn lớp 10 (Mã tin: TT-87910)',
      status: 'Đã đóng',
      statusClass: 'badge detail-status',
      posted: 'Đăng 2 tuần trước',
      applicants: 5,
      subject: 'Ngữ văn',
      matchSubject: 'Môn Ngữ văn',
      grade: 'Lớp 10 · THPT',
      matchGrade: 'THPT',
      frequency: '2 buổi / tuần',
      fee: 180000,
      format: 'Tại nhà học sinh',
      region: 'P. 25, Quận Bình Thạnh',
      matchRegion: 'Quận Bình Thạnh',
      experience: 'Từ 1 năm kinh nghiệm',
      gender: 'Gia sư Nữ',
      goals: 'Học sinh lớp 10 cần rèn kỹ năng nghị luận xã hội và cảm tác phẩm văn học. Tin đã đóng vì gia đình đã chọn được gia sư phù hợp và lớp đang hoạt động.',
      focus: ['✓ Nghị luận xã hội', '✓ Cảm tác phẩm văn học', '▣ Rèn kỹ năng viết văn'],
      parent: { name: 'Chị Mai Lan', initials: 'ML', child: 'Bảo Anh (Lớp 10)', response: '100%', since: 'Thành viên từ 2024' }
    }
  }

  const requestedId = (new URLSearchParams(window.location.search).get('id') || '').trim().toUpperCase()
  const job = jobs[requestedId]
  const notFound = page.querySelector('[data-detail-not-found]')

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
  const parentRate = job.fee
  const extraSlots = [
    { day: 'Thứ 4', time: '19:00 - 20:30' },
    { day: 'Thứ 7', time: '08:00 - 09:30' },
    { day: 'Chủ nhật', time: '14:00 - 15:30' }
  ]

  const digits = value => String(value || '').replace(/\D/g, '')
  const formatNumber = value => new Intl.NumberFormat('vi-VN').format(Number(value) || 0)
  const formatRate = () => `${formatNumber(digits(rateInput?.value))} ₫ / buổi`

  const slotElements = () => [...slotList.querySelectorAll('[data-slot]')]
  const slotDays = () => slotElements().map(slot => slot.dataset.day)

  const slotSummary = () => {
    const days = slotDays()
    if (!days.length) return 'Chưa chọn khung giờ'
    const time = slotElements()[0]?.querySelector('span')?.textContent.split('·')[1]?.trim() || ''
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

  const renderJob = () => {
    document.title = `${job.title} | Edu Connect`
    setRender('breadcrumb', job.breadcrumb)
    setRender('title', job.title)
    setRender('code', `Mã tin: #${job.code}`)
    setRender('posted', job.posted)
    setRender('applicants', `${job.applicants} gia sư đã ứng tuyển`)
    setRender('match-subject', job.matchSubject)
    setRender('match-grade', job.matchGrade)
    setRender('match-region', job.matchRegion)
    setRender('match-experience', tutorExperience)
    setRender('subject', job.subject)
    setRender('grade', job.grade)
    setRender('frequency', job.frequency)
    setRender('fee', `${formatNumber(job.fee)} ₫ / buổi`)
    setRender('format', job.format)
    setRender('region', job.region)
    setRender('experience', job.experience)
    setRender('gender', job.gender)
    setRender('goals', job.goals)
    setRender('parent-name', job.parent.name)
    setRender('parent-initials', job.parent.initials)
    setRender('parent-child', job.parent.child)
    setRender('parent-response', job.parent.response)
    setRender('parent-since', job.parent.since)
    setRender('modal-confirm-parent', `Bạn chuẩn bị gửi đề xuất học phí và lịch dạy cho phụ huynh ${job.parent.name}. Mỗi gia sư chỉ có 1 lượt ứng tuyển cho tin này.`)
    setRender('modal-success-parent', `Hồ sơ và đề xuất của bạn đã được chuyển tới phụ huynh ${job.parent.name}. Bạn sẽ nhận được thông báo ngay khi phụ huynh phản hồi.`)

    const statusNode = document.querySelector('[data-render="status"]')
    if (statusNode) {
      statusNode.className = job.statusClass
      statusNode.replaceChildren(document.createElement('i'), document.createTextNode(job.status))
    }

    const focusList = document.querySelector('[data-render="focus-list"]')
    if (focusList) focusList.replaceChildren(...job.focus.map(item => {
      const marker = document.createElement('span')
      marker.textContent = item
      return marker
    }))

    const parentAvatar = document.querySelector('[data-render="parent-initials"]')
    if (parentAvatar) parentAvatar.setAttribute('aria-label', `Ảnh đại diện ${job.parent.name}`)
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
    message: `Bạn chuẩn bị gửi đề xuất học phí và lịch dạy cho phụ huynh ${job.parent.name}. Mỗi gia sư chỉ có 1 lượt ứng tuyển cho tin này.`,
    confirmText: 'Xác nhận gửi',
    cancelText: 'Hủy bỏ'
  })

  const openSuccess = () => openModal('application-success-modal', {
    variant: 'info',
    title: 'Ứng tuyển thành công!',
    message: `Hồ sơ và đề xuất của bạn đã được chuyển tới phụ huynh ${job.parent.name}. Bạn sẽ nhận được thông báo ngay khi phụ huynh phản hồi.`,
    cancelText: 'Đóng cửa sổ'
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
    updateSummary()
    openConfirm()
  })

  const confirmModal = document.getElementById('application-confirm-modal')
  confirmModal?.addEventListener('modal:close', event => {
    if (event.detail?.reason === 'confirm') window.setTimeout(openSuccess, 0)
  })

  renderJob()
  if (rateInput) rateInput.value = formatNumber(job.fee)
  updateRate()
})()
