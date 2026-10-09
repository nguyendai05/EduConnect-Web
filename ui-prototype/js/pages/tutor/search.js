(() => {
  const page = document.querySelector('[data-tutor-search-page]')
  if (!page) return

  const searchForm = page.querySelector('[data-tutor-search-form]')
  const searchInput = page.querySelector('[data-search-query]')
  const clearSearch = page.querySelector('[data-clear-search]')
  const filter = page.querySelector('[data-tutor-filter]')
  const list = page.querySelector('[data-tutor-list]')
  const cards = Array.from(page.querySelectorAll('[data-tutor-card]'))
  const emptyState = page.querySelector('[data-tutor-empty]')
  const pagination = page.querySelector('[data-pagination]')
  const resultCount = page.querySelector('[data-result-count]')
  const resultLocation = page.querySelector('[data-result-location]')
  const filterCount = page.querySelector('[data-filter-count]')
  const feeOutput = page.querySelector('[data-fee-output]')
  const feeMaxLabel = page.querySelector('[data-fee-max-label]')

  if (!searchForm || !searchInput || !filter || !list) return

  const initialOrder = new Map(cards.map((card, index) => [card, index]))
  let hasAppliedFilters = false

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .trim()

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
    feeOutput.textContent = `150k - ${Math.round(value / 1000)}k`
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
    const searchable = normalize([
      card.dataset.name,
      card.dataset.subject,
      card.dataset.grade,
      card.dataset.district
    ].join(' '))
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
      return initialOrder.get(first) - initialOrder.get(second)
    })
    sorted.forEach(card => list.append(card))
  }

  const applyView = ({ preserveReferenceCount = false } = {}) => {
    const state = getState()
    sortCards(currentSort())
    let visible = 0
    cards.forEach(card => {
      const show = !hasAppliedFilters || cardMatches(card, state)
      card.hidden = !show
      if (show) visible += 1
    })

    const showEmpty = visible === 0
    if (emptyState) emptyState.hidden = !showEmpty
    if (pagination) pagination.hidden = showEmpty
    if (resultCount) resultCount.textContent = preserveReferenceCount || !hasAppliedFilters ? '128' : String(visible)
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

  const resetFilters = () => {
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
    searchInput.value = ''
    hasAppliedFilters = true
    syncChoiceStyles()
    applyView()
  }

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
    window.requestAnimationFrame(() => applyView({ preserveReferenceCount: !hasAppliedFilters }))
  })

  page.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return
    const profileButton = event.target.closest('[data-view-profile]')
    if (profileButton) {
      window.EduToast?.show({
        type: 'info',
        title: `Hồ sơ ${profileButton.dataset.tutorName}`,
        message: 'Đây là prototype giao diện; trang hồ sơ chi tiết chưa kết nối dữ liệu thật.'
      })
    }
  })

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    const labels = {
      messages: 'Tin nhắn',
      notifications: 'Thông báo',
      logout: 'Đăng xuất'
    }
    const title = labels[event.detail?.action]
    if (!title) return
    window.EduToast?.show({ type: 'info', title, message: 'Chức năng này chưa kết nối dữ liệu thật.' })
  })

  syncChoiceStyles()
  applyView({ preserveReferenceCount: true })
})()
