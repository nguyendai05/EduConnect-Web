(() => {
  const page = document.querySelector('[data-discover-page]')
  if (!page) return

  const form = page.querySelector('[data-discover-filter]')
  const searchForm = page.querySelector('[data-discover-search-form]')
  const searchInput = page.querySelector('[data-discover-search]')
  const list = page.querySelector('[data-discover-list]')
  const cards = Array.from(page.querySelectorAll('[data-discover-job]'))
  const empty = page.querySelector('[data-discover-empty]')
  const resultTitle = page.querySelector('[data-result-title]')
  const sort = page.querySelector('[data-discover-sort]')
  let filtersActive = false
  let selectedSessions = '2'
  let selectedGender = 'all'

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()

  const toast = (type, title, message) => window.EduToast?.show({ type, title, message })

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

  const applyView = () => {
    const option = sort.querySelector('.select-option.is-selected')
    const sortKey = option?.dataset.sort || 'default'
    const ordered = [...cards].sort((left, right) => {
      if (sortKey === 'fee-desc') return Number(right.dataset.fee) - Number(left.dataset.fee)
      if (sortKey === 'applicants') return Number(left.dataset.applicants) - Number(right.dataset.applicants)
      if (sortKey === 'newest') return Number(left.dataset.order) - Number(right.dataset.order)
      return Number(left.dataset.order) - Number(right.dataset.order)
    })

    const filters = currentFilters()
    let visible = 0
    ordered.forEach(card => {
      list.append(card)
      card.hidden = filtersActive ? !matches(card, filters) : false
      if (!card.hidden) visible += 1
    })

    empty.hidden = visible !== 0
    resultTitle.textContent = filtersActive ? `${visible} tin phù hợp` : '24 tin phù hợp'
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

  form.addEventListener('reset', () => {
    filtersActive = false
    selectedSessions = '2'
    selectedGender = 'all'
    requestAnimationFrame(() => {
      setSingleButton(Array.from(form.querySelectorAll('[data-filter-sessions]')), form.querySelector('[data-filter-sessions="2"]'))
      setSingleButton(Array.from(form.querySelectorAll('[data-filter-gender]')), form.querySelector('[data-filter-gender="all"]'))
      applyView()
    })
  })

  sort.addEventListener('click', event => {
    if (event.target.closest('.select-option')) queueMicrotask(applyView)
  })

  page.addEventListener('click', event => {
    const target = event.target
    if (!(target instanceof Element)) return

    if (target.closest('[data-show-applied]')) {
      filtersActive = false
      applyView()
      document.getElementById('ung-tuyen-cua-toi')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (target.closest('[data-profile-action]')) {
      toast('info', 'Hồ sơ gia sư', 'Trang hồ sơ công khai sẽ được kết nối ở giai đoạn tích hợp.')
      return
    }

    const card = target.closest('[data-discover-job]')
    if (!card) return

    const saveButton = target.closest('[data-save-job]')
    if (saveButton) {
      const saved = saveButton.classList.toggle('is-saved')
      saveButton.textContent = saved ? 'Đã lưu' : 'Lưu tin'
      toast(saved ? 'success' : 'info', saved ? 'Đã lưu tin' : 'Đã bỏ lưu', card.dataset.title)
      return
    }

    if (target.closest('[data-view-application]')) {
      toast('info', 'Ứng tuyển của bạn', 'Phụ huynh đang xem xét hồ sơ và chưa yêu cầu thêm thông tin.')
      return
    }

    if (target.closest('[data-view-job]')) {
      toast('info', card.dataset.title, 'Trang chi tiết ứng tuyển chưa được kết nối trong prototype này.')
    }
  })

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    if (event.detail.action !== 'logout') toast('info', 'Tính năng minh họa', 'Chức năng này chưa kết nối dữ liệu thật.')
  })

  applyView()
})()
