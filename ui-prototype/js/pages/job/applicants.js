(() => {
  const page = document.querySelector('[data-applicants-page]')
  if (!page) return

  // Dữ liệu tin đăng dùng chung với trang "Tin của tôi" (my-job.html).
  const jobs = {
    'TT-88412': {
      code: 'TT-88412',
      title: 'Tìm gia sư Toán lớp 11 tại Thủ Đức',
      status: 'Đang tuyển',
      tags: ['Toán', 'Lớp 11 · THPT', 'Tại nhà'],
      fee: '220.000 ₫ / buổi',
      frequency: '2 buổi / tuần',
      region: 'P. Linh Trung, TP. Thủ Đức',
      experience: 'Tối thiểu 3 năm kinh nghiệm',
      goal: 'Củng cố Hình học không gian & Hàm số 11',
      subjectLine: 'yêu cầu học Toán lớp 11 của em Gia Huy',
      contract: 'HD-20260926-025'
    },
    'TT-88209': {
      code: 'TT-88209',
      title: 'Tìm gia sư Tiếng Anh giao tiếp cho học sinh THPT',
      status: 'Đang tuyển',
      tags: ['Tiếng Anh', 'THPT', 'Trực tuyến'],
      fee: '250.000 ₫ / buổi',
      frequency: '2 buổi / tuần',
      region: 'Google Meet / Zoom',
      experience: 'Ưu tiên có chứng chỉ IELTS',
      goal: 'Luyện phản xạ, thuyết trình và phát âm chuẩn IPA',
      subjectLine: 'yêu cầu học Tiếng Anh giao tiếp của em Khánh My',
      contract: 'HD-20260926-018'
    },
    'TT-88590': {
      code: 'TT-88590',
      title: 'Tìm gia sư Vật lý lớp 11 luyện giữa học kỳ',
      status: 'Chờ duyệt',
      tags: ['Vật lý', 'Lớp 11 · THPT', 'Tại nhà'],
      fee: '200.000 ₫ / buổi',
      frequency: '2 buổi / tuần',
      region: 'P. Linh Trung, TP. Thủ Đức',
      experience: 'Tối thiểu 2 năm kinh nghiệm',
      goal: 'Ôn dao động cơ và sóng cơ trước bài kiểm tra giữa học kỳ 1',
      subjectLine: 'yêu cầu học Vật lý lớp 11 của em Gia Huy',
      contract: null
    },
    'TT-87910': {
      code: 'TT-87910',
      title: 'Tìm gia sư Ngữ văn lớp 10',
      status: 'Đã đóng',
      tags: ['Ngữ văn', 'Lớp 10 · THPT', 'Tại nhà'],
      fee: '180.000 ₫ / buổi',
      frequency: '2 buổi / tuần',
      region: 'P. 25, Quận Bình Thạnh',
      experience: 'Từ 1 năm kinh nghiệm',
      goal: 'Rèn nghị luận xã hội và cảm thụ tác phẩm văn học',
      subjectLine: 'yêu cầu học Ngữ văn lớp 10 của em Bảo Anh',
      contract: 'HD-20260926-011'
    }
  }

  const list = page.querySelector('[data-applicants-list]')
  const search = page.querySelector('[data-applicant-search]')
  const filters = Array.from(page.querySelectorAll('[data-applicant-filter]'))
  const sort = page.querySelector('[data-applicant-sort]')
  const resultCount = page.querySelector('[data-result-count]')
  const empty = page.querySelector('[data-applicants-empty]')
  const emptyTitle = page.querySelector('#applicants-empty-title')
  const emptyDescription = page.querySelector('.applicants-empty .empty-state__description')
  const compareBar = page.querySelector('[data-compare-bar]')
  const compareTitle = page.querySelector('[data-compare-title]')
  const compareSummary = page.querySelector('[data-compare-summary]')
  const comparisonContent = document.querySelector('[data-comparison-content]')
  const confirmSummary = document.querySelector('[data-confirm-summary]')
  const compareModal = document.getElementById('applicants-compare-modal')
  const confirmModal = document.getElementById('applicants-confirm-modal')
  const handoff = page.querySelector('[data-contract-handoff]')
  let activeFilter = 'all'
  let pendingTutor = null

  const requestedJob = (new URLSearchParams(window.location.search).get('job') || '').trim().toUpperCase()
  const job = jobs[requestedJob]
  const allCards = Array.from(page.querySelectorAll('[data-applicant-card]'))

  if (!job) {
    page.querySelectorAll('[data-applicants-content]').forEach(node => { node.hidden = true })
    const notFound = page.querySelector('[data-job-not-found]')
    if (notFound) notFound.hidden = false
    const requestedLabel = page.querySelector('[data-requested-job-id]')
    if (requestedLabel) requestedLabel.textContent = requestedJob || 'chưa được cung cấp'
    document.title = 'Không tìm thấy tin tìm gia sư | Edu Connect'
    return
  }

  allCards.forEach(card => { card.hidden = card.dataset.job !== requestedJob })
  const cards = allCards.filter(card => card.dataset.job === requestedJob)

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
    // Component: Table | Nguồn: components/data-display/table.html
    const table = document.createElement('table')
    table.className = 'table'
    const caption = document.createElement('caption')
    caption.className = 'table__caption table__caption--sr-only'
    caption.textContent = 'So sánh các gia sư đã chọn'
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
      if (card.dataset.status === 'pending') {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'modal__button modal__button--primary'
        button.dataset.compareSelect = card.dataset.name
        button.textContent = `Chọn ${card.dataset.name.split(' ').slice(-2).join(' ')}`
        cell.append(button)
      } else {
        cell.textContent = card.dataset.status === 'selected' ? 'Đã chọn gia sư này' : 'Không còn mở ứng tuyển'
      }
      actionRow.append(cell)
    })
    tbody.append(actionRow)
    table.append(caption, thead, tbody)
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
      message: `Bạn sắp chọn ${card.dataset.name} cho ${job.subjectLine}.`,
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

  const setRender = (key, value) => {
    const node = page.querySelector(`[data-render="${key}"]`)
    if (node) node.textContent = value
  }

  const renderJob = () => {
    document.title = `Ứng viên · ${job.title} | Edu Connect`
    setRender('breadcrumb', `Ứng viên (Mã tin: ${job.code})`)
    setRender('title', `${cards.length} gia sư đã ứng tuyển`)
    setRender('status', job.status)
    setRender('job-title', job.title)
    setRender('job-fee', job.fee)
    setRender('job-frequency', job.frequency)
    setRender('job-region', job.region)
    setRender('job-experience', job.experience)
    setRender('job-goal', job.goal)
    setRender('modal-subject', `Bạn sắp chọn gia sư cho ${job.subjectLine}.`)

    const tags = page.querySelector('[data-render="job-tags"]')
    if (tags) {
      const classes = ['tag', 'tag tag--neutral', 'tag tag--format']
      tags.replaceChildren(...job.tags.map((label, index) => {
        const tag = document.createElement('span')
        tag.className = classes[index] || 'tag'
        tag.textContent = label
        return tag
      }))
    }

    const viewJob = page.querySelector('[data-view-job]')
    if (viewJob) viewJob.href = `detail.html?id=${job.code}`

    if (job.contract && handoff) handoff.href = `../contract/confirm.html?contract=${job.contract}`

    if (!cards.length && emptyTitle && emptyDescription) {
      emptyTitle.textContent = 'Tin chưa mở ứng tuyển'
      emptyDescription.textContent = 'Tin đang chờ kiểm duyệt nên chưa nhận hồ sơ gia sư. Bạn sẽ thấy ứng viên tại đây sau khi tin được đăng công khai.'
    }
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
      cards.forEach(card => {
        const checkbox = card.querySelector('[data-compare-checkbox]')
        if (checkbox) checkbox.checked = false
      })
      updateCompareBar()
      return
    }
    const card = target.closest('[data-applicant-card]')
    if (!card) return
    if (target.closest('[data-select-tutor]')) openConfirm(card)
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
    if (handoff) {
      if (job.contract) handoff.hidden = false
      else showToast('info', 'Tin chưa mở ứng tuyển', 'Gia sư sẽ bắt đầu gửi hồ sơ sau khi tin được duyệt.')
    }
    showToast('success', 'Đã ghi nhận lựa chọn', `${pendingTutor.dataset.name} đã được chọn. Hệ thống chuyển sang bước xác nhận điều khoản.`)
    pendingTutor = null
  })

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    if (event.detail.action !== 'logout') showToast('info', 'Thông báo', 'Tính năng chưa sẵn sàng.')
  })

  renderJob()
  updateFilterCounts()
  updateCompareBar()
  applyView()
})()
