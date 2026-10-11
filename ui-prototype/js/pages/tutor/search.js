/* Tìm gia sư: danh sách RENDER từ EduStore.list('offerings') (lọc publicly listable) + Store.tutor.
 * Trang không còn giữ card cứng trong HTML; markup thẻ nằm trong <template data-tutor-card-template>.
 * Số kết quả = số thẻ thật vừa render. Bộ lọc môn/cấp/khu vực/học phí ánh xạ vào đúng trường store. */
(() => {
  const page = document.querySelector('[data-tutor-search-page]')
  if (!page) return

  const Store = window.EduStore
  const Route = window.EduRoute
  if (!Store || !Route) return

  const SUBJECT_LABELS = { toan: 'Toán học', 'vat-ly': 'Vật lý', 'tieng-anh': 'Tiếng Anh', 'ngu-van': 'Ngữ văn', 'hoa-hoc': 'Hóa học', ielts: 'IELTS', 'luyen-viet': 'Luyện viết' }
  const GRADE_LABELS = { 'tieu-hoc': 'Tiểu học', thcs: 'THCS', '10': 'Lớp 10', '11': 'Lớp 11', '12': 'Lớp 12', 'luyen-thi': 'Luyện thi' }
  const DELIVERY_LABELS = { home: 'Dạy tại nhà', online: 'Dạy trực tuyến', both: 'Dạy tại nhà & trực tuyến' }
  const TYPE_LABELS = { SERVICE: 'Dịch vụ 1 kèm 1', GROUP_CLASS: 'Lớp nhóm' }

  const searchForm = page.querySelector('[data-tutor-search-form]')
  const searchInput = page.querySelector('[data-search-query]')
  const clearSearch = page.querySelector('[data-clear-search]')
  const filter = page.querySelector('[data-tutor-filter]')
  const list = page.querySelector('[data-tutor-list]')
  const template = page.querySelector('[data-tutor-card-template]')
  const emptyState = page.querySelector('[data-tutor-empty]')
  const pagination = page.querySelector('[data-pagination]')
  const resultCount = page.querySelector('[data-result-count]')
  const resultLocation = page.querySelector('[data-result-location]')
  const filterCount = page.querySelector('[data-filter-count]')
  const feeOutput = page.querySelector('[data-fee-output]')
  const feeMaxLabel = page.querySelector('[data-fee-max-label]')

  if (!searchForm || !searchInput || !filter || !list || !template) return

  let hasAppliedFilters = false

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .trim()

  const fill = (card, selector, value) => {
    const node = card.querySelector(selector)
    if (node) node.textContent = value
  }

  /* Ngày/khung giờ chỉ tồn tại cho GROUP_CLASS (schedule); SERVICE không có → để trống, không bịa. */
  const scheduleSignals = offering => {
    const days = []
    const periods = []
    if (offering.type === 'GROUP_CLASS' && Array.isArray(offering.schedule)) {
      offering.schedule.forEach(slot => {
        const key = slot.day === 1 ? 'cn' : String(slot.day)
        if (!days.includes(key)) days.push(key)
        const hour = Number(String(slot.start || '').slice(0, 2))
        const period = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
        if (!periods.includes(period)) periods.push(period)
      })
    }
    return { days: days.join(','), periods: periods.join(',') }
  }

  /* Một thẻ từ store: ghép offering + tutor + ratingSummary; không có chuỗi HTML nối tay. */
  const buildCard = (offering, order) => {
    const tutor = Store.tutor(offering.tutorId)
    if (!tutor) return null
    const summary = Store.ratingSummary(tutor.id)
    const schedule = scheduleSignals(offering)
    const card = template.content.firstElementChild.cloneNode(true)

    card.dataset.offeringId = offering.id
    card.dataset.tutorId = tutor.id
    card.dataset.order = String(order)
    card.dataset.publishedAt = offering.publishedAt || ''
    card.dataset.name = normalize(`${tutor.name} ${offering.title}`)
    card.dataset.subject = offering.subject
    card.dataset.grade = offering.grade
    card.dataset.region = offering.region
    card.dataset.district = normalize(offering.district)
    card.dataset.delivery = offering.mode || tutor.delivery
    card.dataset.price = String(offering.price)
    card.dataset.rating = String(summary.hasData ? summary.average : 0)
    card.dataset.verified = String(tutor.verified === true)
    card.dataset.days = schedule.days
    card.dataset.periods = schedule.periods

    fill(card, '[data-card-avatar]', tutor.initials)
    const avatar = card.querySelector('[data-card-avatar]')
    if (avatar) avatar.setAttribute('aria-label', `Ảnh đại diện ${tutor.name}`)
    fill(card, '[data-card-name]', tutor.name)
    const verifiedBadge = card.querySelector('[data-card-verified]')
    if (verifiedBadge) verifiedBadge.hidden = !tutor.verified
    fill(card, '[data-card-tag-subject]', offering.subjectLabel || SUBJECT_LABELS[offering.subject] || offering.subject)
    fill(card, '[data-card-tag-grade]', offering.gradeLabel || GRADE_LABELS[offering.grade] || offering.grade)
    fill(card, '[data-card-tag-type]', TYPE_LABELS[offering.type] || offering.type)
    fill(card, '[data-card-bio]', tutor.bio || '')
    fill(card, '[data-card-experience]', `${tutor.experienceYears} năm kinh nghiệm`)
    fill(card, '[data-card-district]', offering.district || tutor.district)
    fill(card, '[data-card-delivery]', DELIVERY_LABELS[offering.mode || tutor.delivery] || '')
    fill(card, '[data-card-classes]', `Đã dạy ${tutor.classesTaught} lớp`)
    fill(card, '[data-card-price]', Store.formatMoney(offering.price))
    fill(card, '[data-card-unit]', offering.unitLabel || '')

    const ratingWrap = card.querySelector('[data-card-rating-wrap]')
    if (summary.hasData) {
      const score = summary.average.toFixed(1).replace('.', ',')
      fill(card, '[data-card-rating]', score)
      fill(card, '[data-card-rating-count]', `(${summary.count} đánh giá)`)
      if (ratingWrap) ratingWrap.setAttribute('aria-label', `Đánh giá ${score} trên 5 sao từ ${summary.count} đánh giá`)
    } else {
      fill(card, '[data-card-rating]', '—')
      fill(card, '[data-card-rating-count]', 'Chưa có đánh giá công khai')
      if (ratingWrap) ratingWrap.setAttribute('aria-label', 'Chưa có đánh giá công khai')
    }

    const link = card.querySelector('[data-card-link]')
    if (link) link.href = Route.page('tutorProfile', { id: tutor.id })

    return card
  }

  const cards = Store.list('offerings')
    .filter(item => Store.isPubliclyListable(item))
    .map((item, index) => buildCard(item, index + 1))
    .filter(Boolean)

  list.replaceChildren(...cards)

  const selectedValues = selector => Array.from(filter.querySelectorAll(selector))
    .filter(input => input.checked)
    .map(input => input.value)

  const selectedButtons = selector => Array.from(filter.querySelectorAll(selector))
    .filter(button => button.getAttribute('aria-pressed') === 'true')
    .map(button => button.dataset.day || button.dataset.period)

  const matchesAny = (candidate, selected) => {
    if (selected.length === 0) return true
    const values = String(candidate || '').split(',')
    return selected.some(value => values.includes(value))
  }

  const getState = () => ({
    query: normalize(searchInput.value),
    subject: filter.querySelector('[data-filter-subject]')?.value || 'all',
    grades: selectedValues('[name="grade"]'),
    region: filter.querySelector('[data-filter-region]')?.value || 'all',
    district: normalize(filter.querySelector('[data-filter-district]')?.value),
    delivery: filter.querySelector('[name="delivery"]:checked')?.value || 'both',
    fee: Number(filter.querySelector('[data-filter-fee]')?.value || 1000000),
    days: selectedButtons('[data-day]'),
    periods: selectedButtons('[data-period]'),
    verifiedOnly: filter.querySelector('[data-filter-verified]')?.checked === true
  })

  const updateFilterCount = state => {
    let count = 0
    if (state.subject !== 'all') count += 1
    if (state.grades.length > 0) count += 1
    if (state.region !== 'all') count += 1
    if (state.delivery !== 'both') count += 1
    if (filterCount) filterCount.textContent = String(count)
  }

  const updateFee = () => {
    const range = filter.querySelector('[data-filter-fee]')
    if (!range || !feeOutput) return
    const value = Number(range.value)
    const formatted = value.toLocaleString('vi-VN')
    feeOutput.textContent = `Tối đa ${formatted} ₫`
    if (feeMaxLabel) feeMaxLabel.textContent = `${formatted} ₫/buổi`
  }

  const updateLocationLabel = state => {
    if (!resultLocation) return
    const regionSelect = filter.querySelector('[data-filter-region]')
    const selectedLabel = regionSelect?.selectedOptions?.[0]?.textContent?.trim()
    resultLocation.textContent = state.region === 'all'
      ? 'trên toàn quốc'
      : `tại khu vực ${selectedLabel || 'đã chọn'}`
  }

  const cardMatches = (card, state) => {
    const searchable = normalize([card.dataset.name, card.dataset.subject, card.dataset.grade, card.dataset.district].join(' '))
    const queryMatches = !state.query || searchable.includes(state.query)
    const subjectMatches = state.subject === 'all' || card.dataset.subject === state.subject
    const gradeMatches = state.grades.length === 0 || matchesAny(card.dataset.grade, state.grades)
    const regionMatches = state.region === 'all' || card.dataset.region === state.region
    const districtMatches = !state.district || normalize(card.dataset.district).includes(state.district.replace(/,.*$/, '').trim())
    const deliveryMatches = state.delivery === 'both' || card.dataset.delivery === 'both' || card.dataset.delivery === state.delivery
    const feeMatches = Number(card.dataset.price) <= state.fee
    const dayMatches = matchesAny(card.dataset.days, state.days)
    const periodMatches = matchesAny(card.dataset.periods, state.periods)
    const verifiedMatches = !state.verifiedOnly || card.dataset.verified === 'true'
    return queryMatches && subjectMatches && gradeMatches && regionMatches && districtMatches && deliveryMatches && feeMatches && dayMatches && periodMatches && verifiedMatches
  }

  const currentSort = () => page.querySelector('[data-sort-select] .select-option[aria-selected="true"]')?.dataset.sort || 'match'

  const sortCards = sort => {
    const sorted = [...cards].sort((first, second) => {
      if (sort === 'rating') return Number(second.dataset.rating) - Number(first.dataset.rating)
      if (sort === 'price-asc') return Number(first.dataset.price) - Number(second.dataset.price)
      if (sort === 'price-desc') return Number(second.dataset.price) - Number(first.dataset.price)
      if (sort === 'newest') return (Date.parse(second.dataset.publishedAt) || 0) - (Date.parse(first.dataset.publishedAt) || 0)
      return Number(first.dataset.order) - Number(second.dataset.order)
    })
    sorted.forEach(card => list.append(card))
    return sorted
  }

  const applyView = ({ preservePage = false } = {}) => {
    const state = getState()
    const matching = sortCards(currentSort()).filter(card => !hasAppliedFilters || cardMatches(card, state))
    const visible = matching.length
    const pageSize = Number(pagination?.dataset.pageSize) || visible || 1
    const lastPage = Math.max(1, Math.ceil(visible / pageSize))
    const current = preservePage ? Math.min(Number(pagination?.dataset.current) || 1, lastPage) : 1
    const shown = new Set(matching.slice((current - 1) * pageSize, current * pageSize))
    cards.forEach(card => { card.hidden = !shown.has(card) })

    const showEmpty = visible === 0
    if (emptyState) emptyState.hidden = !showEmpty
    if (pagination) {
      pagination.hidden = showEmpty
      pagination.dispatchEvent(new CustomEvent('pagination:update', {
        bubbles: true,
        detail: { total: visible, pageSize, current }
      }))
    }
    if (resultCount) resultCount.textContent = String(visible)
    updateLocationLabel(state)
    updateFilterCount(state)
    updateFee()
  }

  const setToggle = button => {
    const selected = button.getAttribute('aria-pressed') !== 'true'
    button.setAttribute('aria-pressed', String(selected))
    button.classList.toggle('is-selected', selected)
  }

  const syncChoiceStyles = () => {
    filter.querySelectorAll('.tutor-search-filter__grade-grid label').forEach(label => {
      label.classList.toggle('is-selected', label.querySelector('input')?.checked === true)
    })
    filter.querySelectorAll('.tutor-search-filter__radios label').forEach(label => {
      label.classList.toggle('is-selected', label.querySelector('input')?.checked === true)
    })
  }

  const resetFilters = (preserveQuery = false) => {
    const subject = filter.querySelector('[data-filter-subject]')
    const region = filter.querySelector('[data-filter-region]')
    const district = filter.querySelector('[data-filter-district]')
    const fee = filter.querySelector('[data-filter-fee]')
    const verified = filter.querySelector('[data-filter-verified]')
    if (subject) subject.value = 'all'
    if (region) region.value = 'all'
    if (district) district.value = ''
    if (fee) fee.value = fee.max
    if (verified) verified.checked = false
    filter.querySelectorAll('[name="grade"]').forEach(input => { input.checked = false })
    const delivery = filter.querySelector('[name="delivery"][value="both"]')
    if (delivery) delivery.checked = true
    filter.querySelectorAll('[data-day], [data-period]').forEach(button => {
      button.classList.remove('is-selected')
      button.setAttribute('aria-pressed', 'false')
    })
    if (!preserveQuery) searchInput.value = ''
    hasAppliedFilters = true
    syncChoiceStyles()
    applyView()
  }

  pagination?.addEventListener('pagination:change', () => applyView({ preservePage: true }))

  searchForm.addEventListener('submit', event => {
    event.preventDefault()
    hasAppliedFilters = true
    applyView()
  })

  clearSearch?.addEventListener('click', () => {
    window.requestAnimationFrame(() => {
      hasAppliedFilters = true
      applyView()
    })
  })

  filter.addEventListener('input', event => {
    if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)) return
    hasAppliedFilters = true
    syncChoiceStyles()
    applyView()
  })

  filter.addEventListener('change', () => {
    hasAppliedFilters = true
    syncChoiceStyles()
    applyView()
  })

  filter.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return
    const toggle = event.target.closest('[data-day], [data-period]')
    if (!toggle) return
    setToggle(toggle)
    hasAppliedFilters = true
    applyView()
  })

  filter.addEventListener('reset', event => {
    event.preventDefault()
    window.requestAnimationFrame(resetFilters)
  })

  page.querySelector('[data-sort-select]')?.addEventListener('click', event => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-sort]')) return
    window.requestAnimationFrame(() => applyView())
  })

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    const labels = {
      messages: 'Tin nhắn',
      notifications: 'Thông báo'
    }
    const title = labels[event.detail?.action]
    if (!title) return
    window.EduToast?.show({ type: 'info', title, message: 'Tính năng chưa sẵn sàng.' })
  })

  // Trang chủ dẫn sang kèm ?q= — phải nạp vào ô tìm kiếm trước lần render đầu.
  const initialQuery = new URLSearchParams(window.location.search).get('q')
  if (initialQuery && searchInput) searchInput.value = initialQuery

  resetFilters(true)
})()
