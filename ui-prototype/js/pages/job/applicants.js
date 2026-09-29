(() => {
  const page = document.querySelector('[data-applicants-page]')
  if (!page) return

  const list = page.querySelector('[data-applicants-list]')
  const cards = Array.from(page.querySelectorAll('[data-applicant-card]'))
  const search = page.querySelector('[data-applicant-search]')
  const filters = Array.from(page.querySelectorAll('[data-applicant-filter]'))
  const sort = page.querySelector('[data-applicant-sort]')
  const resultCount = page.querySelector('[data-result-count]')
  const empty = page.querySelector('[data-applicants-empty]')
  const compareBar = page.querySelector('[data-compare-bar]')
  const compareTitle = page.querySelector('[data-compare-title]')
  const compareSummary = page.querySelector('[data-compare-summary]')
  const comparisonContent = document.querySelector('[data-comparison-content]')
  const confirmSummary = document.querySelector('[data-confirm-summary]')
  const compareModal = document.getElementById('applicants-compare-modal')
  const confirmModal = document.getElementById('applicants-confirm-modal')
  let activeFilter = 'all'
  let pendingTutor = null

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

  const formatMoney = value => `${Number(value).toLocaleString('vi-VN')} ₫`

  const showToast = (type, title, message) => {
    window.EduToast?.show({ type, title, message })
  }

  const selectedForComparison = () => cards.filter(card => card.querySelector('[data-compare-checkbox]')?.checked)

  const updateCompareLabels = () => {
    cards.forEach(card => {
      const checkbox = card.querySelector('[data-compare-checkbox]')
      const label = card.querySelector('.checkbox-option__title')
      label?.classList.toggle('checkbox-option__title--checked', Boolean(checkbox?.checked))
    })
  }

  const updateCompareBar = () => {
    const selected = selectedForComparison()
    compareBar.hidden = selected.length === 0
    if (!selected.length) return

    compareTitle.textContent = `Đang chọn ${selected.length} gia sư để so sánh`
    compareSummary.textContent = selected
      .map(card => `${card.dataset.name} (${formatMoney(card.dataset.fee)})`)
      .join(' · ')
    updateCompareLabels()
  }

  const makeCell = (tag, text, scope) => {
    const cell = document.createElement(tag)
    cell.textContent = text
    if (scope) cell.scope = scope
    return cell
  }

  const buildComparison = selected => {
    comparisonContent.replaceChildren()
    const table = document.createElement('table')
    const thead = document.createElement('thead')
    const heading = document.createElement('tr')
    heading.append(makeCell('th', 'Tiêu chí so sánh', 'col'))
    selected.forEach(card => heading.append(makeCell('th', card.dataset.name, 'col')))
    thead.append(heading)

    const tbody = document.createElement('tbody')
    const rows = [
      ['Đánh giá phụ huynh', card => `${card.dataset.rating} ★ (${card.dataset.reviews} đánh giá)`],
      ['Kinh nghiệm & bằng cấp', card => `${card.dataset.experience} năm · ${card.dataset.degree}`],
      ['Khu vực & khoảng cách', card => card.dataset.distance],
      ['Học phí đề xuất', card => `${formatMoney(card.dataset.fee)} / buổi`],
      ['Lịch dạy đề xuất', card => card.dataset.schedule]
    ]

    rows.forEach(([label, getValue]) => {
      const row = document.createElement('tr')
      row.append(makeCell('th', label, 'row'))
      selected.forEach(card => row.append(makeCell('td', getValue(card))))
      tbody.append(row)
    })

    const actionRow = document.createElement('tr')
    actionRow.append(makeCell('th', 'Hành động', 'row'))
    selected.forEach(card => {
      const cell = document.createElement('td')
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'modal__button modal__button--primary'
      button.dataset.compareSelect = card.dataset.name
      button.textContent = `Chọn ${card.dataset.name.split(' ').slice(-2).join(' ')}`
      cell.append(button)
      actionRow.append(cell)
    })
    tbody.append(actionRow)
    table.append(thead, tbody)
    comparisonContent.append(table)
  }

  const openComparison = () => {
    const selected = selectedForComparison()
    if (selected.length < 2) {
      showToast('warning', 'Chưa đủ ứng viên', 'Hãy chọn ít nhất 2 gia sư để mở bảng so sánh.')
      return
    }
    buildComparison(selected)
    window.EduModal?.open(compareModal, {
      variant: 'info',
      title: 'So sánh đối chiếu gia sư',
      message: `Đang so sánh ${selected.length} ứng viên theo các tiêu chí quan trọng.`,
      cancelText: 'Đóng'
    })
  }

  const openConfirm = card => {
    if (!card) return
    pendingTutor = card
    confirmSummary.replaceChildren()
    const name = document.createElement('strong')
    name.textContent = card.dataset.name
    const details = document.createElement('span')
    details.textContent = `${card.dataset.degree} · ${card.dataset.experience} năm kinh nghiệm`
    const fee = document.createElement('span')
    fee.textContent = `${formatMoney(card.dataset.fee)} / buổi · ${card.dataset.schedule}`
    confirmSummary.append(name, details, fee)
    window.EduModal?.open(confirmModal, {
      title: `Xác nhận chọn gia sư ${card.dataset.name}?`,
      message: `Bạn sắp chọn ${card.dataset.name} cho yêu cầu học Toán lớp 11 của em Gia Huy.`,
      confirmText: 'Đồng ý & tiếp tục',
      cancelText: 'Xem lại',
      variant: 'confirm'
    })
  }

  const updateFilterCounts = () => {
    const counts = cards.reduce((values, card) => {
      values.all += 1
      if (Object.hasOwn(values, card.dataset.status)) values[card.dataset.status] += 1
      return values
    }, { all: 0, pending: 0, selected: 0, withdrawn: 0 })
    const labels = { all: 'Tất cả', pending: 'Đang chờ', selected: 'Đã chọn', withdrawn: 'Đã rút' }
    filters.forEach(filter => {
      const key = filter.dataset.applicantFilter
      filter.textContent = `${labels[key]} (${counts[key]})`
    })
  }

  const applyView = () => {
    const query = normalize(search?.value)
    const selectedOption = sort?.querySelector('.select-option.is-selected')
    const sortKey = selectedOption?.dataset.sort || 'default'
    const ordered = [...cards].sort((left, right) => {
      if (sortKey === 'fee-asc') return Number(left.dataset.fee) - Number(right.dataset.fee)
      if (sortKey === 'fee-desc') return Number(right.dataset.fee) - Number(left.dataset.fee)
      if (sortKey === 'experience') return Number(right.dataset.experience) - Number(left.dataset.experience)
      if (sortKey === 'rating') return Number(right.dataset.rating) - Number(left.dataset.rating)
      return Number(left.dataset.order) - Number(right.dataset.order)
    })

    let visible = 0
    ordered.forEach(card => {
      list.append(card)
      const matchesSearch = normalize(`${card.dataset.name} ${card.dataset.degree} ${card.dataset.distance}`).includes(query)
      const matchesFilter = activeFilter === 'all' || card.dataset.status === activeFilter
      card.hidden = !(matchesSearch && matchesFilter)
      if (!card.hidden) visible += 1
    })
    resultCount.textContent = `Đang hiển thị ${visible} ứng viên`
    empty.hidden = visible !== 0
  }

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      activeFilter = filter.dataset.applicantFilter
      filters.forEach(item => {
        const selected = item === filter
        item.classList.toggle('filter-chip--selected', selected)
        item.setAttribute('aria-pressed', String(selected))
      })
      applyView()
    })
  })

  search?.addEventListener('input', applyView)
  sort?.addEventListener('click', event => {
    if (event.target.closest('.select-option')) queueMicrotask(applyView)
  })

  page.addEventListener('change', event => {
    const checkbox = event.target.closest('[data-compare-checkbox]')
    if (!checkbox) return
    if (checkbox.checked && selectedForComparison().length > 3) {
      checkbox.checked = false
      showToast('warning', 'Tối đa 3 ứng viên', 'Bạn chỉ có thể so sánh đồng thời tối đa 3 gia sư.')
    }
    updateCompareBar()
  })

  page.addEventListener('click', event => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest('[data-open-compare]')) {
      openComparison()
      return
    }
    if (target.closest('[data-clear-compare]')) {
      cards.forEach(card => { card.querySelector('[data-compare-checkbox]').checked = false })
      updateCompareBar()
      return
    }
    if (target.closest('[data-open-confirm-demo]')) {
      openConfirm(cards[0])
      return
    }
    const card = target.closest('[data-applicant-card]')
    if (!card) {
      if (target.closest('[data-view-job]')) showToast('info', 'Xem tin đăng', 'Bản mẫu giữ nguyên tại trang hiện tại và chưa điều hướng sang backend.')
      return
    }
    if (target.closest('[data-select-tutor]')) openConfirm(card)
    if (target.closest('[data-view-profile]')) showToast('info', card.dataset.name, 'Hồ sơ chi tiết sẽ được mở khi trang hồ sơ gia sư được tích hợp.')
    if (target.closest('[data-message]')) showToast('info', 'Mở cuộc trò chuyện', `Bắt đầu nhắn tin với ${card.dataset.name}.`)
  })

  comparisonContent?.addEventListener('click', event => {
    const button = event.target.closest('[data-compare-select]')
    if (!button) return
    const card = cards.find(item => item.dataset.name === button.dataset.compareSelect)
    compareModal.addEventListener('modal:close', () => openConfirm(card), { once: true })
    window.EduModal?.close(compareModal)
  })

  confirmModal?.addEventListener('modal:confirm', () => {
    if (!pendingTutor) return
    cards.forEach(card => {
      if (card.dataset.status === 'selected') {
        card.dataset.status = 'pending'
        card.classList.remove('is-selected')
        const previousStatus = card.querySelector('[data-card-status]')
        previousStatus.textContent = 'Đang chờ'
        previousStatus.className = 'applicant-card__status applicant-card__status--pending'
      }
    })
    pendingTutor.dataset.status = 'selected'
    pendingTutor.classList.add('is-selected')
    const status = pendingTutor.querySelector('[data-card-status]')
    status.textContent = 'Đã chọn'
    status.className = 'applicant-card__status applicant-card__status--selected'
    updateFilterCounts()
    applyView()
    showToast('success', 'Đã ghi nhận lựa chọn', `${pendingTutor.dataset.name} đã được chọn. Hệ thống chuyển sang bước xác nhận điều khoản.`)
    pendingTutor = null
  })

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    if (event.detail.action !== 'logout') showToast('info', 'Tính năng minh họa', 'Thao tác này chưa kết nối dữ liệu thật trong giai đoạn prototype.')
  })

  updateFilterCounts()
  updateCompareBar()
  applyView()
})()
