/* Bảng tin tìm gia sư — MỌI thẻ tin đọc từ EduStore.jobBoard(); số hồ sơ dẫn xuất từ
 * applicationsOfJob(); trạng thái "đã ứng tuyển" suy từ applicationOfTutor của persona gia sư.
 * Bản trước cất 5 thẻ hard-code trong HTML (TT-8841 ở đây là "Toán lớp 11 tại Thủ Đức",
 * trái ngược store: TT-8841 = "Gia sư Tiếng Anh lớp 10") và ghi cứng "24 tin phù hợp". */
(() => {
  const Store = window.EduStore
  if (!Store) return

  const page = document.querySelector('[data-discover-page]')
  if (!page) return

  const form = page.querySelector('[data-discover-filter]')
  const searchForm = page.querySelector('[data-discover-search-form]')
  const searchInput = page.querySelector('[data-discover-search]')
  const list = page.querySelector('[data-discover-list]')
  const template = page.querySelector('[data-discover-job-template]')
  const empty = page.querySelector('[data-discover-empty]')
  const resultTitle = page.querySelector('[data-result-title]')
  const sort = page.querySelector('[data-discover-sort]')
  const pagination = page.querySelector('[data-pagination]')
  const applicationsCount = page.querySelector('[data-applications-count]')
  const chips = page.querySelector('.discover-results__chips')
  let filtersActive = false
  let selectedSessions = 'all'
  let selectedGender = 'all'
  let onlyApplied = false

  /* Persona gia sư đang đăng nhập (null nếu persona khác) — quyết định trạng thái "đã ứng tuyển". */
  const tutorId = Store.sessionTutorId()

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()

  const toast = (type, title, message) => window.EduToast?.show({ type, title, message })

  /* Nhãn trạng thái hồ sơ — suy từ application.status, không ghi chữ ký tay. */
  const APPLICATION_LABEL = Object.freeze({
    submitted: 'Đã gửi, chờ phụ huynh phản hồi',
    shortlisted: 'Được chọn vào danh sách ngắn',
    selected: 'Hồ sơ đã được chọn',
    rejected: 'Hồ sơ chưa được chọn',
    withdrawn: 'Bạn đã rút hồ sơ'
  })

  /* Khóa lọc khu vực trong HTML: thu-duc | binh-thanh | online | other. */
  const regionKey = job => {
    if (job.region === 'toan-quoc') return 'online'
    const district = normalize(job.district)
    if (district.includes('thu duc')) return 'thu-duc'
    if (district.includes('binh thanh')) return 'binh-thanh'
    return 'other'
  }

  const selectedValue = name => form.querySelector(`[name="${name}"]:checked`)?.value || 'all'

  const currentFilters = () => ({
    query: normalize(searchInput.value),
    subject: normalize(form.querySelector('[data-filter-subject]')?.value),
    grade: selectedValue('grade'),
    region: form.querySelector('[data-filter-region]')?.value || 'all',
    format: selectedValue('format'),
    fee: Number(form.querySelector('[data-filter-fee]')?.value || Infinity),
    sessions: selectedSessions,
    experience: Number(form.querySelector('[data-filter-experience]')?.value || 0),
    gender: selectedGender,
    hiringOnly: Boolean(form.querySelector('[data-filter-hiring]')?.checked)
  })

  const matches = (card, filters) => {
    const searchable = normalize(`${card.dataset.title} ${card.dataset.subject} ${card.dataset.grade} ${card.dataset.region}`)
    const matchesSearch = !filters.query || searchable.includes(filters.query)
    const matchesSubject = !filters.subject || normalize(card.dataset.subject) === filters.subject
    const matchesGrade = filters.grade === 'all' || (filters.grade === '10' ? card.dataset.grade === 'thpt' : card.dataset.grade === filters.grade)
    const matchesRegion = filters.region === 'all' || card.dataset.region === filters.region
    const matchesFormat = filters.format === 'all' || card.dataset.format === filters.format
    const matchesFee = Number(card.dataset.fee) <= filters.fee
    const matchesSessions = filters.sessions === 'all' || Number(card.dataset.sessions) >= Number(filters.sessions)
    const matchesExperience = Number(card.dataset.experience) >= filters.experience
    const matchesGender = filters.gender === 'all' || card.dataset.gender === 'all' || card.dataset.gender === filters.gender
    const matchesHiring = !filters.hiringOnly || card.dataset.status === 'hiring'
    return matchesSearch && matchesSubject && matchesGrade && matchesRegion && matchesFormat && matchesFee && matchesSessions && matchesExperience && matchesGender && matchesHiring
  }

  const fill = (card, selector, value) => {
    const node = card.querySelector(selector)
    if (node) node.textContent = value
  }

  /* Một thẻ tin từ <template data-discover-job-template> — không nối chuỗi HTML. */
  const buildCard = (job, order) => {
    const card = template.content.firstElementChild.cloneNode(true)
    const application = tutorId ? Store.applicationOfTutor(job.id, tutorId) : null
    const applicants = Store.applicationsOfJob(job.id).length
    const status = application ? 'applied' : (job.availability === 'open' ? 'hiring' : 'closed')

    card.dataset.jobId = job.id
    card.dataset.order = String(order)
    card.dataset.title = job.title
    card.dataset.subject = job.subjectLabel
    card.dataset.grade = job.level
    card.dataset.region = regionKey(job)
    card.dataset.format = job.mode
    card.dataset.fee = String(job.budgetPerSession)
    card.dataset.sessions = String(job.sessionsPerWeek)
    card.dataset.experience = String(job.experienceYears)
    card.dataset.gender = job.gender
    card.dataset.status = status
    card.dataset.applicants = String(applicants)
    card.dataset.created = String(job.publishedAt ? new Date(job.publishedAt).getTime() : 0)

    const badge = card.querySelector('[data-job-badge]')
    if (status === 'applied') {
      badge.className = 'job-card__badge job-card__badge--info'
      badge.textContent = 'Bạn đã ứng tuyển'
    } else if (status === 'hiring') {
      badge.className = 'job-card__badge job-card__badge--info'
      badge.textContent = 'Đang tuyển'
    } else {
      badge.className = 'job-card__badge'
      badge.textContent = 'Đã đóng'
    }

    fill(card, '[data-job-code]', `· ${Store.timeAgo(job.publishedAt)} · Mã tin #${job.id}`)
    fill(card, '[data-job-title-node]', job.title)
    fill(card, '[data-job-fee-node]', Store.formatMoney(job.budgetPerSession))
    fill(card, '[data-job-tag-subject]', job.subjectLabel)
    fill(card, '[data-job-tag-grade]', job.gradeLabel)
    fill(card, '[data-job-tag-mode]', job.modeLabel)
    fill(card, '[data-job-frequency]', `${job.sessionsPerWeek} buổi / tuần · ${job.durationMinutes} phút`)
    fill(card, '[data-job-district]', job.district)
    fill(card, '[data-job-requirement]', job.experienceLabel)
    fill(card, '[data-job-description]', job.description)
    fill(card, '[data-job-applicants-node]', `${applicants} gia sư`)
    fill(card, '[data-job-deadline]', `Hạn nhận hồ sơ: ${Store.formatDate(job.expiresAt)}`)

    const detailLink = card.querySelector('[data-job-detail-link]')
    detailLink.href = `detail.html?id=${encodeURIComponent(job.id)}`
    detailLink.textContent = status === 'hiring' ? 'Xem chi tiết để ứng tuyển' : 'Xem chi tiết tin'

    const viewLink = card.querySelector('[data-view-application]')
    viewLink.href = `detail.html?id=${encodeURIComponent(job.id)}`

    if (application) {
      card.querySelector('[data-job-application]').hidden = false
      fill(card, '[data-job-application-status]', APPLICATION_LABEL[application.status] || application.status)
      fill(card, '[data-job-application-rate]', `Bạn đề xuất ${Store.formatMoney(application.proposedRate)}`)
      detailLink.hidden = true
      card.querySelector('[data-save-job]').hidden = true
      viewLink.hidden = false
    } else if (status === 'closed') {
      card.querySelector('[data-save-job]').hidden = true
    }
    return card
  }

  const cards = Store.jobBoard().map((job, index) => buildCard(job, index + 1))
  list.replaceChildren(...cards)

  /* Neo "Xem ứng tuyển của bạn" cuộn tới thẻ đã ứng tuyển đầu tiên (chỉ gán id khi thẻ tồn tại). */
  const appliedCard = cards.find(card => card.dataset.status === 'applied')
  if (appliedCard) appliedCard.id = 'ung-tuyen-cua-toi'

  if (applicationsCount) {
    applicationsCount.textContent = String(tutorId ? Store.applicationsByTutor(tutorId).length : 0)
  }

  const renderChips = filters => {
    if (!chips) return
    const buttons = []
    const add = (label, clear) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'filter-chip filter-chip--selected'
      button.textContent = `${label} ×`
      button.setAttribute('aria-label', `Bỏ bộ lọc ${label}`)
      button.addEventListener('click', () => { clear(); filtersActive = true; applyView() })
      buttons.push(button)
    }
    if (filters.query) add(searchInput.value.trim(), () => { searchInput.value = '' })
    if (filters.subject) add(form.querySelector('[data-filter-subject]').value, () => { form.querySelector('[data-filter-subject]').value = '' })
    if (filters.region !== 'all') add(form.querySelector('[data-filter-region]').selectedOptions[0].textContent, () => { form.querySelector('[data-filter-region]').value = 'all' })
    if (filters.grade !== 'all') add('Cấp học đã chọn', () => { form.querySelectorAll('[name="grade"]').forEach(input => { input.checked = input.value === 'all' }) })
    if (filters.format !== 'all') add(filters.format === 'home' ? 'Tại nhà' : 'Trực tuyến', () => { form.querySelectorAll('[name="format"]').forEach(input => { input.checked = input.value === 'all' }) })
    if (filters.hiringOnly) add('Đang tuyển', () => { form.querySelector('[data-filter-hiring]').checked = false })
    if (onlyApplied) add('Ứng tuyển của tôi', () => { onlyApplied = false })
    chips.replaceChildren(...buttons)
    chips.hidden = buttons.length === 0
  }

  const applyView = ({ preservePage = false } = {}) => {
    const option = sort.querySelector('.select-option.is-selected')
    const sortKey = option?.dataset.sort || 'default'
    const ordered = [...cards].sort((left, right) => {
      if (sortKey === 'fee-desc') return Number(right.dataset.fee) - Number(left.dataset.fee)
      if (sortKey === 'applicants') return Number(left.dataset.applicants) - Number(right.dataset.applicants)
      if (sortKey === 'newest') return Number(right.dataset.created) - Number(left.dataset.created)
      return Number(left.dataset.order) - Number(right.dataset.order)
    })

    const filters = currentFilters()
    const matching = ordered.filter(card => (!filtersActive || matches(card, filters)) && (!onlyApplied || card.dataset.status === 'applied'))
    const pageSize = Number(pagination?.dataset.pageSize) || 5
    const lastPage = Math.max(1, Math.ceil(matching.length / pageSize))
    const current = preservePage ? Math.min(Number(pagination?.dataset.current) || 1, lastPage) : 1
    const shown = new Set(matching.slice((current - 1) * pageSize, current * pageSize))
    ordered.forEach(card => {
      list.append(card)
      card.hidden = !shown.has(card)
    })

    empty.hidden = matching.length !== 0
    resultTitle.textContent = `${matching.length} tin phù hợp`
    pagination?.dispatchEvent(new CustomEvent('pagination:update', {
      detail: { total: matching.length, pageSize, current }
    }))
    renderChips(filters)
  }

  const setSingleButton = (buttons, selectedButton) => {
    buttons.forEach(button => button.classList.toggle('is-selected', button === selectedButton))
  }

  searchForm.addEventListener('submit', event => {
    event.preventDefault()
    filtersActive = true
    applyView()
  })

  form.addEventListener('input', event => {
    if (event.target.matches('[data-filter-fee]')) {
      filtersActive = true
      applyView()
    }
  })

  pagination?.addEventListener('pagination:change', () => applyView({ preservePage: true }))

  form.addEventListener('change', () => {
    filtersActive = true
    applyView()
  })

  form.addEventListener('click', event => {
    const sessionButton = event.target.closest('[data-filter-sessions]')
    const genderButton = event.target.closest('[data-filter-gender]')
    if (sessionButton) {
      selectedSessions = sessionButton.dataset.filterSessions
      setSingleButton(Array.from(form.querySelectorAll('[data-filter-sessions]')), sessionButton)
      filtersActive = true
      applyView()
    }
    if (genderButton) {
      selectedGender = genderButton.dataset.filterGender
      setSingleButton(Array.from(form.querySelectorAll('[data-filter-gender]')), genderButton)
      filtersActive = true
      applyView()
    }
  })

  const resetFilters = () => {
    filtersActive = true
    selectedSessions = 'all'
    selectedGender = 'all'
    onlyApplied = false
    searchInput.value = ''
    form.querySelector('[data-filter-subject]').value = ''
    form.querySelector('[data-filter-region]').value = 'all'
    form.querySelector('[data-filter-experience]').value = '0'
    form.querySelector('[data-filter-fee]').value = form.querySelector('[data-filter-fee]').max
    form.querySelector('[data-filter-hiring]').checked = false
    form.querySelectorAll('[name="grade"], [name="format"]').forEach(input => { input.checked = input.value === 'all' })
    setSingleButton(Array.from(form.querySelectorAll('[data-filter-sessions]')), form.querySelector('[data-filter-sessions="all"]'))
    setSingleButton(Array.from(form.querySelectorAll('[data-filter-gender]')), form.querySelector('[data-filter-gender="all"]'))
    applyView()
  }
  form.addEventListener('reset', () => requestAnimationFrame(resetFilters))

  sort.addEventListener('click', event => {
    if (event.target.closest('.select-option')) queueMicrotask(applyView)
  })

  page.addEventListener('click', event => {
    const target = event.target
    if (!(target instanceof Element)) return

    if (target.closest('[data-show-applied]')) {
      resetFilters()
      onlyApplied = true
      applyView()
      document.getElementById('ung-tuyen-cua-toi')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    const card = target.closest('[data-discover-job]')
    if (!card) return

    const saveButton = target.closest('[data-save-job]')
    if (saveButton) {
      /* Hành vi demo tại chỗ: danh sách lưu không ghi vào store, toast phải nói rõ điều đó. */
      const saved = saveButton.classList.toggle('is-saved')
      saveButton.textContent = saved ? 'Đã lưu' : 'Lưu tin'
      toast(saved ? 'success' : 'info', saved ? 'Đã đánh dấu lưu' : 'Đã bỏ đánh dấu', `${card.dataset.title} — đánh dấu chỉ hiển thị trên trang này, chưa lưu vào tài khoản.`)
    }
  })

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    if (event.detail.action !== 'logout') toast('info', 'Thông báo', 'Tính năng chưa sẵn sàng.')
  })

  resetFilters()
})()
