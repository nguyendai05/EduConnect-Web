/* Trang "Hồ sơ ứng tuyển" của MỘT tin tìm gia sư — mọi dữ liệu đọc từ window.EduStore.
 *
 * Bản trước cất bảng `const jobs` riêng gồm bốn mã TT-88412 / TT-88209 / TT-88590 / TT-87910
 * KHÔNG tồn tại trong store, cộng hai mã hợp đồng tự viết nên bấm "Xem hợp đồng" là sang trang
 * not-found, và số "6 gia sư đã ứng tuyển" là chữ ký tay. Từ bản này:
 *   tin        = Store.job(id)                (mã TT-8833…TT-8841 do fixtures sở hữu)
 *   hồ sơ      = Store.applicationsOfJob(id)   (APP-2026-0401…0414)
 *   hợp đồng   = Store.contractOfJob(id)        (chỉ hiện khi lần ra đơn kênh JOB)
 *   chọn gia sư = Store.selectApplication(...)  (ghi store thật, có idempotency)
 * Thẻ hồ sơ clone từ <template data-applicant-card-template> trong HTML — xem
 * docs/ui/qa/20261010-2340/04-JOB-STORE-WIRING.md §4: giữ markup trong HTML để mọi selector
 * mà JS dùng vẫn tồn tại trong trang. */
(() => {
  const page = document.querySelector('[data-applicants-page]')
  if (!page) return

  const Store = window.EduStore
  const params = new URLSearchParams(window.location.search)
  // job/detail.html dẫn sang bằng ?id=, các link cũ dùng ?job= — chấp nhận cả hai.
  const requestedJob = (params.get('id') || params.get('job') || '').trim().toUpperCase()

  const contentNodes = Array.from(page.querySelectorAll('[data-applicants-content]'))
  const notFound = page.querySelector('[data-job-not-found]')
  const requestedLabel = page.querySelector('[data-requested-job-id]')

  const showJobNotFound = () => {
    contentNodes.forEach(node => { node.hidden = true })
    if (notFound) notFound.hidden = false
    if (requestedLabel) requestedLabel.textContent = requestedJob || 'chưa được cung cấp'
    document.title = 'Không tìm thấy tin tìm gia sư | Edu Connect'
  }

  // Thiếu store (fixtures/store.js chưa nạp) thì không có nguồn nào để hiển thị.
  if (!Store) { showJobNotFound(); return }

  const jobId = requestedJob
  let job = jobId ? Store.job(jobId) : null
  if (!job) { showJobNotFound(); return }

  /* ------------------------------------------------------------------ */
  /* Persona / phiên — trang phải chạy được khi chưa đăng nhập           */
  /* ------------------------------------------------------------------ */

  const hasSession = (() => {
    try { return Boolean(window.sessionStorage.getItem(Store.SESSION_KEY)) } catch (error) { return false }
  })()
  /* sessionLearnerId() null khi persona là gia sư/quản trị hoặc chưa có học viên nào —
     đó là điều kiện "không có learnerId" để khoá thao tác (giống quy ước các trang store khác:
     store luôn fallback về persona demo PARENT-01, nên ở đây cũng không ném lỗi). */
  const learnerId = Store.sessionLearnerId()

  const sessionNote = !learnerId
    ? 'Trang đang ở chế độ chỉ đọc: phiên hiện tại không có learnerId phụ huynh/học viên, nên “Chọn gia sư” và “Nhắn tin” bị khoá để không ghi lựa chọn vào tin của người khác.'
    : learnerId !== job.learnerId
      ? `Tin ${job.id} thuộc hồ sơ ${job.learnerId}; phiên đang là ${learnerId}. Bấm chọn sẽ bị store chặn với lý do not-job-owner — đây chỉ là xem trước demo, không phải phân quyền thật.`
      : hasSession
        ? ''
        : `Chưa có phiên đăng nhập được ghi trong tab này; trang dùng persona demo mặc định (${learnerId}) để xem trước. Lọc theo persona chỉ phục vụ demo, không phải phân quyền thật.`

  /* ------------------------------------------------------------------ */
  /* Bảng nhãn dẫn xuất từ JOB_APPLICATION_STATUS của store               */
  /* ------------------------------------------------------------------ */

  const STATUS_LABEL = Object.freeze({
    submitted: 'Hồ sơ mới nộp',
    shortlisted: 'Đã vào vòng chọn',
    selected: 'Đã chọn',
    rejected: 'Chưa được chọn',
    withdrawn: 'Gia sư đã rút'
  })

  /* Chỉ hai biến thể badge có trong css/components/domain/job/applicant-card.css
     (--pending, --selected); trạng thái còn lại dùng class trung tính, không bịa CSS mới. */
  const STATUS_BADGE = Object.freeze({
    submitted: 'applicant-card__status applicant-card__status--pending',
    shortlisted: 'applicant-card__status applicant-card__status--pending',
    selected: 'applicant-card__status applicant-card__status--selected',
    rejected: 'applicant-card__status',
    withdrawn: 'applicant-card__status'
  })

  const SELECTABLE_STATUS = ['submitted', 'shortlisted']

  const FILTER_LABELS = Object.freeze({
    all: 'Tất cả',
    pending: 'Đang chờ',
    selected: 'Đã chọn',
    rejected: 'Chưa được chọn',
    withdrawn: 'Đã rút'
  })

  /** Chip "Đang chờ" gộp hai trạng thái còn mở của store; các chip khác ánh xạ 1-1. */
  const FILTER_STATUSES = Object.freeze({
    pending: ['submitted', 'shortlisted'],
    selected: ['selected'],
    rejected: ['rejected'],
    withdrawn: ['withdrawn']
  })

  const DELIVERY_LABEL = Object.freeze({
    home: 'Dạy tại nhà học viên',
    online: 'Dạy trực tuyến',
    both: 'Dạy tại nhà hoặc trực tuyến'
  })

  const SELECT_FAILURE = Object.freeze({
    'job-not-found': 'Tin không còn trong dữ liệu chung nên lựa chọn chưa được ghi.',
    'not-job-owner': 'Tin này thuộc phụ huynh khác — tài khoản hiện tại không có quyền chọn gia sư cho tin.',
    'job-closed': 'Tin đã đóng nên không chọn thêm hồ sơ được nữa.',
    'application-not-found': 'Hồ sơ không thuộc tin này hoặc không còn trong dữ liệu.',
    'application-not-selectable': 'Hồ sơ không còn ở trạng thái có thể chọn (chỉ chọn được hồ sơ mới nộp hoặc đã vào vòng chọn).',
    duplicated: 'Lựa chọn đã được ghi trước đó — bấm lặp không tạo lần chọn thứ hai.',
    'storage-failed': 'Không lưu được vào storage của tab; state trước đó được giữ nguyên.',
    'invalid-state': 'Dữ liệu sau thay đổi không hợp lệ nên store từ chối ghi; state trước đó được giữ nguyên.',
    'mutation-failed': 'Store từ chối thay đổi. State trước đó được giữ nguyên.'
  })

  const filterMatches = (status, key) => key === 'all' || (FILTER_STATUSES[key] || []).includes(status)
  const statusLabel = status => STATUS_LABEL[status] || status || '—'

  const jobStatusLine = () => {
    if (job.status === 'pending') return 'Chờ duyệt'
    if (job.status === 'rejected') return 'Bị từ chối'
    if (job.availability === 'closed') return job.selectedApplicationId ? 'Đã chọn gia sư · tin đã đóng' : 'Đã đóng'
    return 'Đang tuyển'
  }

  /* ------------------------------------------------------------------ */
  /* Nodes                                                               */
  /* ------------------------------------------------------------------ */

  const list = page.querySelector('[data-applicants-list]')
  const cardTemplate = page.querySelector('[data-applicant-card-template]')
  const search = page.querySelector('[data-applicant-search]')
  const filters = Array.from(page.querySelectorAll('[data-applicant-filter]'))
  const sort = page.querySelector('[data-applicant-sort]')
  const resultCount = page.querySelector('[data-result-count]')
  const empty = page.querySelector('[data-applicants-empty]')
  const emptyTitle = empty?.querySelector('#applicants-empty-title')
  const emptyDescription = empty?.querySelector('.empty-state__description')
  const compareBar = page.querySelector('[data-compare-bar]')
  const compareTitle = page.querySelector('[data-compare-title]')
  const compareSummary = page.querySelector('[data-compare-summary]')
  const sessionNoteNode = page.querySelector('[data-session-note]')
  const contractNote = page.querySelector('[data-contract-note]')
  const contractNoteText = page.querySelector('[data-contract-note-text]')
  const handoff = page.querySelector('[data-contract-handoff]')
  const handoffLabel = page.querySelector('[data-contract-handoff-label]')
  const viewJob = page.querySelector('[data-view-job]')
  const comparisonContent = document.querySelector('[data-comparison-content]')
  const confirmSummary = document.querySelector('[data-confirm-summary]')
  const confirmError = document.querySelector('[data-confirm-error]')
  const compareModal = document.getElementById('applicants-compare-modal')
  const confirmModal = document.getElementById('applicants-confirm-modal')

  let cards = []
  let activeFilter = 'all'
  let pendingCard = null

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

  const formatMoney = value => Store.formatMoney(Store.toInteger(value))

  const showToast = (type, title, message) => window.EduToast?.show({ type, title, message })

  const setRender = (key, value) => {
    const node = page.querySelector(`[data-render="${key}"]`)
    if (node) node.textContent = value
  }

  const slotText = slot => `${slot.day} · ${slot.time}`.trim()
  const slotsText = application => {
    const slots = Array.isArray(application.slots) ? application.slots.map(slotText).filter(Boolean) : []
    return slots.length ? slots.join(', ') : 'Chưa đề xuất khung giờ'
  }

  const feeNote = rate => {
    const delta = Store.toInteger(rate) - Store.toInteger(job.budgetPerSession)
    if (delta === 0) return 'Khớp ngân sách tin đăng'
    return delta > 0
      ? `Cao hơn ngân sách ${formatMoney(delta)}`
      : `Thấp hơn ngân sách ${formatMoney(Math.abs(delta))}`
  }

  const cardSelectable = card => Boolean(learnerId) && job.availability === 'open' && SELECTABLE_STATUS.includes(card.dataset.status)

  /* ------------------------------------------------------------------ */
  /* Render thẻ hồ sơ từ template                                        */
  /* ------------------------------------------------------------------ */

  const buildCard = (application, index) => {
    const card = cardTemplate.content.firstElementChild.cloneNode(true)
    const tutor = Store.tutor(application.tutorId)
    const name = tutor ? tutor.name : application.tutorId
    const status = Store.JOB_APPLICATION_STATUS.includes(application.status) ? application.status : 'submitted'
    const verified = Boolean(tutor && tutor.verified)

    card.dataset.applicationId = application.id
    card.dataset.job = job.id
    card.dataset.tutorId = application.tutorId
    card.dataset.name = name
    card.dataset.status = status
    card.dataset.fee = String(Store.toInteger(application.proposedRate))
    card.dataset.rating = tutor ? String(tutor.rating) : '0'
    card.dataset.reviews = tutor ? String(tutor.reviewCount) : '0'
    card.dataset.experience = tutor ? String(tutor.experienceYears) : '0'
    card.dataset.credentials = tutor ? tutor.bio : 'Không tìm thấy gia sư trong dữ liệu chung'
    card.dataset.region = tutor ? tutor.district : '—'
    card.dataset.schedule = slotsText(application)
    card.dataset.order = String(index + 1)

    const avatar = card.querySelector('[data-card-avatar]')
    avatar.textContent = tutor ? tutor.initials : '—'
    avatar.className = `applicant-card__avatar ${status === 'selected' ? 'applicant-card__avatar--selected' : 'applicant-card__avatar--pending'}`

    card.querySelector('[data-card-name]').textContent = name
    card.querySelector('[data-card-verified]').hidden = !verified
    card.querySelector('[data-card-rating]').textContent = tutor && Number(tutor.rating) > 0
      ? `★ ${Number(tutor.rating).toFixed(1)}`
      : 'Chưa có đánh giá'
    card.querySelector('[data-card-reviews]').textContent = `${tutor ? Store.toInteger(tutor.reviewCount) : 0} đánh giá`
    card.querySelector('[data-card-experience]').textContent = `${tutor ? Store.toInteger(tutor.experienceYears) : 0} năm kinh nghiệm`
    card.querySelector('[data-card-meta]').textContent = tutor
      ? `${tutor.district} · ${DELIVERY_LABEL[tutor.delivery] || 'Hình thức chưa ghi trong hồ sơ'}`
      : 'Hồ sơ gia sư không còn trong dữ liệu chung'

    const badge = card.querySelector('[data-card-status]')
    badge.className = STATUS_BADGE[status] || 'applicant-card__status'
    badge.textContent = statusLabel(status)

    card.querySelector('[data-card-fee]').textContent = `${formatMoney(application.proposedRate)} / buổi`
    card.querySelector('[data-card-fee-note]').textContent = feeNote(application.proposedRate)
    card.querySelector('[data-card-slots]').textContent = slotsText(application)
    card.querySelector('[data-card-message]').textContent = application.message || 'Gia sư không để lại lời nhắn.'
    card.querySelector('[data-card-created]').textContent = `Nộp ${Store.timeAgo(application.createdAt)} · hồ sơ ${application.id}`
    card.querySelector('[data-card-verification]').textContent = verified
      ? 'Hồ sơ đã được nền tảng xác minh.'
      : 'Hồ sơ chưa được xác minh — hãy kiểm chứng bằng cấp trước khi nhận lớp.'

    const profileLink = card.querySelector('[data-view-profile]')
    if (tutor) profileLink.href = `../tutor/profile.html?id=${encodeURIComponent(tutor.id)}`
    else { profileLink.removeAttribute('href'); profileLink.textContent = 'Hồ sơ không tồn tại' }

    const selectButton = card.querySelector('[data-select-tutor]')
    const messageButton = card.querySelector('[data-message]')

    if (status === 'selected') {
      selectButton.textContent = 'Đã chọn'
      selectButton.disabled = true
      selectButton.title = 'Hồ sơ này đã được chọn cho tin.'
    } else if (!learnerId) {
      selectButton.disabled = true
      selectButton.title = 'Cần đăng nhập bằng tài khoản phụ huynh sở hữu tin mới chọn được gia sư.'
    } else if (!SELECTABLE_STATUS.includes(status)) {
      selectButton.textContent = statusLabel(status)
      selectButton.disabled = true
      selectButton.title = `Hồ sơ đang ở trạng thái ${statusLabel(status)} nên không còn chọn được.`
    } else if (job.availability !== 'open') {
      selectButton.textContent = 'Tin đã đóng'
      selectButton.disabled = true
      selectButton.title = 'Tin đã đóng nên không chọn thêm hồ sơ được nữa.'
    }

    messageButton.disabled = !learnerId
    if (!learnerId) messageButton.title = 'Cần đăng nhập để mở cuộc trò chuyện.'

    if (status === 'selected') card.classList.add('is-selected')
    return card
  }

  const renderList = () => {
    const rows = Store.applicationsOfJob(jobId)
      .slice()
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)) || String(a.id).localeCompare(String(b.id)))
    const fragment = document.createDocumentFragment()
    rows.forEach((application, index) => fragment.append(buildCard(application, index)))
    list.replaceChildren(fragment)
    cards = Array.from(list.querySelectorAll('[data-applicant-card]'))
    setRender('title', `${cards.length} gia sư đã ứng tuyển`)
  }

  /* ------------------------------------------------------------------ */
  /* Header + mốc nối hợp đồng (chỉ khi store lần ra hợp đồng thật)       */
  /* ------------------------------------------------------------------ */

  const renderContractHandoff = () => {
    const contract = Store.contractOfJob(jobId)
    if (contract) {
      handoff.href = `../contract/confirm.html?contract=${encodeURIComponent(contract.id)}`
      handoff.hidden = false
      if (handoffLabel) handoffLabel.textContent = `Xem hợp đồng ${contract.id}`
      const status = Store.statusOf(Store.CONTRACT_STATUS, contract.status).label
      contractNoteText.textContent = `Tin đã có hợp đồng ${contract.id} (đơn ${contract.orderId} · trạng thái ${status}), lần ra qua hồ sơ được chọn ${job.selectedApplicationId}.`
    } else if (job.selectedApplicationId) {
      handoff.removeAttribute('href')
      handoff.hidden = true
      contractNoteText.textContent = `Đã chọn gia sư (hồ sơ ${job.selectedApplicationId}) nhưng chưa tạo đơn, nên chưa có hợp đồng.`
    } else {
      handoff.removeAttribute('href')
      handoff.hidden = true
      contractNoteText.textContent = `Chưa có hợp đồng: tin ${job.id} chưa chọn gia sư.`
    }
    if (contractNote) contractNote.hidden = false
  }

  const renderJob = () => {
    document.title = `Ứng viên · ${job.title} | Edu Connect`
    setRender('breadcrumb', `Ứng viên (Mã tin: ${job.id})`)
    setRender('status', jobStatusLine())
    setRender('job-title', job.title)
    setRender('job-fee', `${formatMoney(job.budgetPerSession)} / buổi`)
    setRender('job-frequency', `${job.sessionsPerWeek} buổi / tuần · tổng ${job.sessions} buổi`)
    setRender('job-duration', `${job.durationMinutes} phút / buổi`)
    setRender('job-region', `${job.district}`)
    setRender('job-experience', job.experienceLabel)
    setRender('job-goal', (job.focus || []).join(' · ') || job.description || '—')
    setRender('modal-subject', `Bạn sắp chọn gia sư cho tin ${job.id} — ${job.title}.`)

    const tags = page.querySelector('[data-render="job-tags"]')
    if (tags) {
      const classes = ['tag', 'tag tag--neutral', 'tag tag--format']
      tags.replaceChildren(...[job.subjectLabel, job.gradeLabel, job.modeLabel]
        .filter(Boolean)
        .map((label, index) => {
          const tag = document.createElement('span')
          tag.className = classes[index] || 'tag'
          tag.textContent = label
          return tag
        }))
    }

    if (viewJob) viewJob.href = `detail.html?id=${encodeURIComponent(job.id)}`
    renderContractHandoff()

    if (sessionNoteNode) {
      sessionNoteNode.textContent = sessionNote
      sessionNoteNode.hidden = !sessionNote
    }
  }

  /* ------------------------------------------------------------------ */
  /* Lọc / tìm / sắp xếp / so sánh — chạy trên danh sách đã render         */
  /* ------------------------------------------------------------------ */

  const updateFilterCounts = () => {
    filters.forEach(filter => {
      const key = filter.dataset.applicantFilter
      const count = key === 'all' ? cards.length : cards.filter(card => filterMatches(card.dataset.status, key)).length
      filter.textContent = `${FILTER_LABELS[key] || key} (${count})`
    })
  }

  const syncEmptyState = visible => {
    if (!empty || !emptyTitle || !emptyDescription) return
    empty.hidden = visible !== 0
    if (cards.length === 0) {
      if (job.status === 'pending') {
        emptyTitle.textContent = 'Tin chưa mở ứng tuyển'
        emptyDescription.textContent = 'Tin đang chờ kiểm duyệt nên chưa nhận hồ sơ gia sư. Bạn sẽ thấy ứng viên tại đây sau khi tin được đăng công khai.'
      } else if (job.status === 'rejected') {
        emptyTitle.textContent = 'Tin bị từ chối kiểm duyệt'
        emptyDescription.textContent = `Tin ${job.id} không được đăng công khai nên không có hồ sơ ứng tuyển.`
      } else {
        emptyTitle.textContent = 'Tin chưa có hồ sơ ứng tuyển'
        emptyDescription.textContent = `Chưa gia sư nào nộp hồ sơ vào tin ${job.id}. Chia sẻ tin từ bảng tin để thêm ứng viên.`
      }
      return
    }
    if (visible === 0) {
      emptyTitle.textContent = 'Không tìm thấy hồ sơ phù hợp'
      emptyDescription.textContent = 'Thử từ khóa khác (bỏ bộ lọc trạng thái hoặc đổi sắp xếp) — danh sách trên là toàn bộ hồ sơ thật của tin này.'
    }
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
      const haystack = `${card.dataset.name} ${card.dataset.credentials} ${card.dataset.region} ${card.dataset.applicationId}`
      const matchesSearch = !query || normalize(haystack).includes(query)
      const matchesFilter = filterMatches(card.dataset.status, activeFilter)
      card.hidden = !(matchesSearch && matchesFilter)
      if (!card.hidden) visible += 1
    })

    if (resultCount) resultCount.textContent = `Đang hiển thị ${visible} / ${cards.length} hồ sơ ứng tuyển của tin ${job.id}`
    syncEmptyState(visible)
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
    if (!compareBar) return
    compareBar.hidden = selected.length === 0
    if (!selected.length) return
    compareTitle.textContent = `Đang chọn ${selected.length} gia sư để so sánh`
    compareSummary.textContent = selected.map(card => `${card.dataset.name} (${formatMoney(card.dataset.fee)})`).join(' · ')
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
      ['Đánh giá từ học viên', card => Number(card.dataset.reviews) > 0 ? `${card.dataset.rating} ★ (${card.dataset.reviews} đánh giá)` : 'Chưa có đánh giá'],
      ['Kinh nghiệm & hồ sơ', card => `${card.dataset.experience} năm · ${card.dataset.credentials}`],
      ['Khu vực & hình thức', card => card.dataset.region],
      ['Học phí đề xuất', card => `${formatMoney(card.dataset.fee)} / buổi (${feeNote(card.dataset.fee)})`],
      ['Lịch đề xuất', card => card.dataset.schedule],
      ['Trạng thái hồ sơ', card => `${statusLabel(card.dataset.status)} · ${card.dataset.applicationId}`]
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
      if (cardSelectable(card)) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'modal__button modal__button--primary'
        button.dataset.compareSelect = card.dataset.applicationId
        button.textContent = `Chọn ${card.dataset.name.split(' ').slice(-2).join(' ')}`
        cell.append(button)
      } else {
        cell.textContent = card.dataset.status === 'selected'
          ? 'Đã chọn gia sư này'
          : `${statusLabel(card.dataset.status)} — không còn chọn được`
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
    if (!learnerId) {
      showToast('warning', 'Chưa đăng nhập', 'Bạn cần đăng nhập bằng tài khoản phụ huynh đã đăng tin để chọn gia sư.')
      return
    }
    pendingCard = card
    if (confirmError) { confirmError.textContent = ''; confirmError.hidden = true }
    confirmSummary.replaceChildren()
    const name = document.createElement('strong')
    name.textContent = card.dataset.name
    const details = document.createElement('span')
    details.textContent = `${card.dataset.experience} năm kinh nghiệm · ${card.dataset.credentials}`
    const fee = document.createElement('span')
    fee.textContent = `${formatMoney(card.dataset.fee)} / buổi · ${card.dataset.schedule}`
    const reference = document.createElement('span')
    reference.textContent = `Hồ sơ ${card.dataset.applicationId} của tin ${job.id}. Chọn gia sư chỉ đóng tin và chốt hồ sơ, chưa tạo đơn và chưa phát sinh thanh toán.`
    confirmSummary.append(name, details, fee, reference)
    window.EduModal?.open(confirmModal, {
      title: `Xác nhận chọn gia sư ${card.dataset.name}?`,
      message: `Bạn sắp chọn ${card.dataset.name} cho tin ${job.id} — ${job.title}.`,
      confirmText: 'Đồng ý & tiếp tục',
      cancelText: 'Xem lại',
      variant: 'confirm'
    })
  }

  /* ------------------------------------------------------------------ */
  /* Ghi store thật                                                      */
  /* ------------------------------------------------------------------ */

  const refreshFromStore = () => {
    job = Store.job(jobId) || job
    renderJob()
    renderList()
    updateFilterCounts()
    updateCompareBar()
    applyView()
  }

  const commitSelection = (card, event) => {
    const applicationId = card.dataset.applicationId
    const result = Store.selectApplication({
      jobId: job.id,
      applicationId,
      learnerId,
      idempotency: `applicants:select:${applicationId}`
    })

    if (!result.ok) {
      /* Báo lý do thật, giữ nguyên modal + danh sách: không giả vờ thành công như bản cũ. */
      if (event) event.preventDefault()
      const message = SELECT_FAILURE[result.reason] || `Không ghi được lựa chọn (lý do: ${result.reason}).`
      if (confirmError) { confirmError.textContent = message; confirmError.hidden = false }
      pendingCard = card
      showToast('error', 'Chưa chọn được gia sư', message)
      return
    }

    if (confirmError) { confirmError.textContent = ''; confirmError.hidden = true }
    pendingCard = null
    refreshFromStore()
    showToast('success', 'Đã ghi nhận lựa chọn', `${card.dataset.name} (hồ sơ ${applicationId}) đã được chọn. Tin ${job.id} chuyển sang đã đóng và các hồ sơ còn lại của tin bị từ chối.`)
    window.setTimeout(() => window.location.reload(), 900)
  }

  /* ------------------------------------------------------------------ */
  /* Sự kiện                                                             */
  /* ------------------------------------------------------------------ */

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
  page.querySelector('[data-clear-search]')?.addEventListener('click', () => queueMicrotask(applyView))
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
    const card = cards.find(item => item.dataset.applicationId === button.dataset.compareSelect)
    compareModal.addEventListener('modal:close', () => openConfirm(card), { once: true })
    window.EduModal?.close(compareModal)
  })

  confirmModal?.addEventListener('modal:confirm', event => {
    if (!pendingCard) return
    commitSelection(pendingCard, event)
  })

  confirmModal?.addEventListener('modal:close', () => {
    pendingCard = null
    if (confirmError) { confirmError.textContent = ''; confirmError.hidden = true }
  })

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    if (event.detail.action !== 'logout') showToast('info', 'Thông báo', 'Tính năng chưa sẵn sàng.')
  })

  renderJob()
  renderList()
  updateFilterCounts()
  updateCompareBar()
  applyView()
})()
