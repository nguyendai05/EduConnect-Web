/* Hồ sơ gia sư: đọc ?id qua EduRoute, dựng từ EduStore/EduFixtures. Không fallback sang gia sư khác.
 * Nguồn duy nhất cho hồ sơ/dịch vụ/đánh giá là EduStore — trang không tự giữ bảng hồ sơ thứ hai.
 * Những khối DETAILS cũ (lịch rảnh trong tuần, bằng cấp & chứng chỉ) không có trong store nên được ẨN,
 * không bịa dữ liệu và không chuyển sang nơi khác. */
(() => {
  const page = document.querySelector('[data-tutor-profile-page]')
  if (!page) return

  const Store = window.EduStore
  const Route = window.EduRoute

  const SUBJECT_LABELS = { toan: 'Toán học', 'vat-ly': 'Vật lý', 'tieng-anh': 'Tiếng Anh', 'ngu-van': 'Ngữ văn', 'hoa-hoc': 'Hóa học', ielts: 'IELTS', 'luyen-viet': 'Luyện viết' }
  const GRADE_LABELS = { 'tieu-hoc': 'Tiểu học', thcs: 'THCS', '10': 'Lớp 10', '11': 'Lớp 11', '12': 'Lớp 12', 'luyen-thi': 'Luyện thi' }
  const DELIVERY_LABELS = { home: 'Dạy tại nhà', online: 'Dạy trực tuyến', both: 'Dạy tại nhà & trực tuyến' }
  const TYPE_LABELS = { SERVICE: 'Dịch vụ 1 kèm 1', GROUP_CLASS: 'Lớp nhóm' }

  const el = (tag, className, labelText) => {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (labelText !== undefined) node.textContent = labelText
    return node
  }

  const subjectText = tutor => tutor.subjects.map(code => SUBJECT_LABELS[code] || code).join(' · ')
  const gradeText = tutor => tutor.grades.map(code => GRADE_LABELS[code] || code).join(' · ')
  const formatScore = value => Number(value).toFixed(1).replace('.', ',')

  const layout = page.querySelector('[data-tutor-layout]')
  const breadcrumb = page.querySelector('.breadcrumb')
  const missing = page.querySelector('[data-tutor-missing]')

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    const labels = { messages: 'Tin nhắn', notifications: 'Thông báo' }
    const title = labels[event.detail?.action]
    if (!title) return
    window.EduToast?.show({ type: 'info', title, message: 'Tính năng chưa sẵn sàng.' })
  })

  /* ?id= là nguồn; hồ sơ công khai không tự rơi về gia sư khác khi thiếu id. */
  const tutorId = Route.param('id', 'tutorProfile')
  const tutor = tutorId ? Store.tutor(tutorId) : null

  if (!tutor) {
    document.title = 'Không tìm thấy gia sư | Edu Connect'
    const desc = page.querySelector('[data-tutor-missing-desc]')
    if (desc) {
      desc.textContent = tutorId
        ? `Mã gia sư "${tutorId}" không tồn tại trong dữ liệu mẫu hoặc hồ sơ đã bị gỡ.`
        : 'Thiếu mã gia sư (?id=…) trên đường dẫn. Vui lòng chọn gia sư từ trang tìm kiếm.'
    }
    if (layout) layout.hidden = true
    if (breadcrumb) breadcrumb.hidden = true
    if (missing) missing.hidden = false
    return
  }

  layout.hidden = false
  document.title = `${tutor.name} | Edu Connect`
  Store.text(page.querySelector('[data-tutor-crumb]'), tutor.name)
  Store.text(page.querySelector('[data-tutor-name]'), tutor.name)

  const avatar = page.querySelector('[data-tutor-avatar]')
  avatar.textContent = tutor.initials
  avatar.setAttribute('aria-label', `Ảnh đại diện ${tutor.name}`)

  const verifiedBadge = page.querySelector('[data-tutor-verified]')
  verifiedBadge.hidden = !tutor.verified

  Store.text(page.querySelector('[data-tutor-subjects]'), subjectText(tutor))

  const availabilityBadge = page.querySelector('[data-tutor-availability]')
  const availabilityLabel = page.querySelector('[data-tutor-availability-label]')
  const availabilityByStatus = {
    approved: { badge: 'badge badge--info', label: 'Đang nhận học viên', dot: true },
    pending: { badge: 'badge badge--warning', label: 'Hồ sơ đang chờ xác minh', dot: false },
    rejected: { badge: 'badge badge--danger', label: 'Hồ sơ không được duyệt', dot: false }
  }
  const availability = availabilityByStatus[tutor.profileStatus] || availabilityByStatus.pending
  availabilityBadge.className = availability.badge
  if (availability.dot) availabilityBadge.append(el('span', 'tutor-profile-hero__online'))
  Store.text(availabilityLabel, availability.label)
  const isApproved = tutor.profileStatus === 'approved'

  /* Đánh giá: cùng nguồn reviewsByTutor/ratingSummary với danh sách bên dưới, không hard-code. */
  const summary = Store.ratingSummary(tutor.id)
  const ratingWrap = page.querySelector('[data-tutor-rating-wrap]')
  const noRating = page.querySelector('[data-tutor-no-rating]')
  if (summary.hasData) {
    const score = formatScore(summary.average)
    Store.text(page.querySelector('[data-tutor-rating]'), score)
    Store.text(page.querySelector('[data-tutor-rating-count]'), `(${summary.count} đánh giá)`)
    ratingWrap.setAttribute('aria-label', `Đánh giá ${score} trên 5 sao từ ${summary.count} đánh giá`)
    noRating.hidden = true
  } else {
    ratingWrap.hidden = true
    noRating.hidden = false
  }

  Store.text(page.querySelector('[data-tutor-experience]'), `${tutor.experienceYears} năm kinh nghiệm`)
  Store.text(page.querySelector('[data-tutor-classes]'), `${tutor.classesTaught} lớp đã dạy`)
  Store.text(page.querySelector('[data-tutor-location]'), tutor.district)
  Store.text(page.querySelector('[data-tutor-delivery]'), DELIVERY_LABELS[tutor.delivery] || tutor.delivery)

  /* Giới thiệu: chỉ dùng bio có trong store — không bịa thêm đoạn văn. */
  const about = page.querySelector('[data-tutor-about]')
  about.replaceChildren(el('p', undefined, tutor.bio || 'Gia sư chưa cập nhật phần giới thiệu.'))

  /* Học vấn & kinh nghiệm: mọi dòng dẫn xuất từ trường thật của store. */
  const facts = page.querySelector('[data-tutor-facts]')
  const factItems = [
    { label: 'Trạng thái hồ sơ', title: availability.label, note: tutor.verified ? 'Đã xác minh danh tính' : 'Chưa xác minh danh tính' },
    { label: 'Môn dạy', title: subjectText(tutor), note: `Cấp lớp: ${gradeText(tutor)}` },
    { label: 'Khu vực', title: tutor.district, note: DELIVERY_LABELS[tutor.delivery] || tutor.delivery },
    { label: 'Thâm niên giảng dạy', title: `${tutor.experienceYears} năm`, note: '' },
    { label: 'Lớp đã dạy', title: `${tutor.classesTaught} lớp`, note: '' }
  ]
  facts.replaceChildren(...factItems.map(fact => {
    const article = document.createElement('article')
    article.append(el('small', undefined, fact.label), el('strong', undefined, fact.title))
    if (fact.note) article.append(el('p', undefined, fact.note))
    return article
  }))

  /* Lịch rảnh trong tuần và bằng cấp & chứng chỉ: store KHÔNG có dữ liệu → ẨN khối, không bịa. */
  const scheduleSection = page.querySelector('[data-section-schedule]')
  if (scheduleSection) scheduleSection.hidden = true
  const certificatesSection = page.querySelector('[data-section-certificates]')
  if (certificatesSection) certificatesSection.hidden = true

  /* ---------------- Offerings (chỉ dịch vụ/lớp công khai) ---------------- */

  const sessionTutorId = Store.sessionTutorId()
  const isOwnerPreview = sessionTutorId === tutor.id
  const visibleOfferings = Store.offeringsByTutor(tutor.id).filter(item => Store.isPubliclyListable(item))

  const offeringList = page.querySelector('[data-offering-list]')
  const offeringEmpty = page.querySelector('[data-offering-empty]')
  if (tutor.profileStatus !== 'approved') {
    Store.text(page.querySelector('[data-offering-empty-desc]'), 'Hồ sơ gia sư chưa được duyệt nên chưa có dịch vụ/lớp công khai.')
  }

  const offeringRow = (label, value) => {
    const li = document.createElement('li')
    li.append(el('span', undefined, label), el('span', undefined, value))
    return li
  }

  const buildOfferingCard = item => {
    const article = el('article', 'card tutor-profile-plan')
    article.dataset.offeringId = item.id

    const head = el('div', 'tutor-profile-plan__head')
    const hit = el('label', 'radio-hit-area tutor-profile-plan__hit')
    const input = document.createElement('input')
    input.type = 'radio'
    input.name = 'tp-offering'
    input.value = item.id
    input.setAttribute('aria-label', `Chọn ${item.title}`)
    const circle = el('span', 'radio-circle')
    circle.setAttribute('aria-hidden', 'true')
    hit.append(input, circle)
    head.append(hit, el('span', 'badge badge--success', 'Đang công khai'))

    const tags = el('span', 'tutor-card__tags')
    tags.append(
      el('span', 'tag', TYPE_LABELS[item.type] || item.type),
      el('span', 'tag', item.subjectLabel || SUBJECT_LABELS[item.subject] || item.subject),
      el('span', 'tag tag--neutral', item.gradeLabel || GRADE_LABELS[item.grade] || item.grade)
    )

    const price = el('p', 'tutor-profile-plan__price')
    price.append(el('strong', undefined, Store.formatMoney(item.price)), el('small', undefined, item.unitLabel || ''))

    const rows = el('ul', 'tutor-profile-plan__rows')
    rows.append(offeringRow('Mã gói', item.id))
    rows.append(offeringRow('Số buổi', `${item.sessions} buổi × ${item.durationMinutes} phút`))
    if (item.type === 'GROUP_CLASS') {
      rows.append(offeringRow('Chỗ còn lại', `${Store.seatsLeft(item)}/${item.capacity}`))
    }
    if (item.scheduleText) rows.append(offeringRow('Lịch', item.scheduleText))

    const link = el('a', 'button button--outline button--small tutor-profile-plan__link', 'Xem chi tiết')
    link.href = Route.page('catalogDetail', { id: item.id })

    article.append(head, el('h3', 'tutor-profile-plan__title', item.title), tags, price, rows, link)
    article.addEventListener('click', event => {
      if (event.target.closest('a')) return
      input.checked = true
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    return { card: article, input }
  }

  const cards = visibleOfferings.map(buildOfferingCard)
  offeringList.replaceChildren(...cards.map(entry => entry.card))
  offeringList.hidden = cards.length === 0
  offeringEmpty.hidden = cards.length !== 0

  /* ---------------- Booking sidebar ---------------- */

  const bookingSelection = page.querySelector('[data-booking-selection]')
  const selectedTitle = page.querySelector('[data-selected-title]')
  const selectedTags = page.querySelector('[data-selected-tags]')
  const selectedPrice = page.querySelector('[data-selected-price]')
  const selectedUnit = page.querySelector('[data-selected-unit]')
  const selectedFacts = page.querySelector('[data-selected-facts]')
  const blockedAlert = page.querySelector('[data-booking-blocked]')
  const blockedMessage = page.querySelector('[data-booking-blocked-message]')
  const inviteLink = page.querySelector('[data-invite-tutor]')
  const cartButton = page.querySelector('[data-add-cart]')
  const chatLink = page.querySelector('[data-chat]')

  const setChatEnabled = enabled => {
    if (enabled) {
      chatLink.removeAttribute('aria-disabled')
      chatLink.classList.remove('is-disabled')
      chatLink.href = Route.page('chatMessages', { tutor: tutor.id })
    } else {
      chatLink.setAttribute('aria-disabled', 'true')
      chatLink.classList.add('is-disabled')
      chatLink.removeAttribute('href')
    }
  }

  const showBlocked = message => {
    Store.text(blockedMessage, message)
    blockedAlert.hidden = false
    inviteLink.hidden = true
    cartButton.hidden = true
  }

  const hideBlocked = () => { blockedAlert.hidden = true }

  const syncBooking = item => {
    if (isOwnerPreview) {
      bookingSelection.hidden = true
      setChatEnabled(false)
      showBlocked('Bạn đang xem với tư cách gia sư của hồ sơ này (demo) — mời dạy và đặt chỗ chỉ dành cho tài khoản học viên.')
      return
    }
    if (!isApproved) {
      bookingSelection.hidden = true
      setChatEnabled(false)
      cartButton.hidden = true
      showBlocked(`${availability.label} — hồ sơ chưa được duyệt nên chưa thể nhắn tin hay mời dạy từ trang này.`)
      return
    }
    setChatEnabled(true)
    if (!item) {
      bookingSelection.hidden = true
      hideBlocked()
      inviteLink.href = Route.page('invitationCreate', { tutor: tutor.id })
      inviteLink.hidden = false
      cartButton.hidden = true
      return
    }

    bookingSelection.hidden = false
    Store.text(selectedTitle, item.title)
    selectedTags.replaceChildren(
      el('span', 'tag', TYPE_LABELS[item.type] || item.type),
      el('span', 'tag tag--neutral', item.subjectLabel || ''),
      el('span', 'tag tag--neutral', item.gradeLabel || '')
    )
    Store.text(selectedPrice, Store.formatMoney(item.price))
    Store.text(selectedUnit, item.unitLabel || '')
    const facts2 = [offeringRow('Mã gói', item.id), offeringRow('Số buổi', `${item.sessions} buổi × ${item.durationMinutes} phút`)]
    const seats = Store.seatsLeft(item)
    if (item.type === 'GROUP_CLASS') facts2.push(offeringRow('Chỗ còn lại', `${seats}/${item.capacity}`))
    if (item.scheduleText) facts2.push(offeringRow('Lịch', item.scheduleText))
    selectedFacts.replaceChildren(...facts2)

    const status = Store.statusOf(Store.OFFERING_STATUS, item.status)
    const listable = Store.isPubliclyListable(item)
    if (listable && (item.type !== 'GROUP_CLASS' || seats > 0)) {
      hideBlocked()
      inviteLink.href = Route.page('invitationCreate', { tutor: tutor.id, offering: item.id })
      inviteLink.hidden = false
      cartButton.hidden = !(item.type === 'GROUP_CLASS' && seats > 0)
    } else if (!listable && item.status !== 'published') {
      showBlocked(`Gói ở trạng thái ${status.label} — chưa công khai, không thể mời dạy hoặc đặt chỗ từ trang này.`)
    } else if (!listable) {
      showBlocked('Gói đã đóng — không nhận đăng ký mới.')
    } else {
      showBlocked(`Lớp đã đủ chỗ (${item.enrolled}/${item.capacity}) — không thể thêm vào giỏ.`)
    }
  }

  let selectedItem = null

  const syncSelection = () => {
    const checked = offeringList.querySelector('input[name="tp-offering"]:checked')
    selectedItem = checked ? Store.offering(checked.value) : null
    cards.forEach(entry => entry.card.classList.toggle('is-selected', Boolean(checked && entry.input === checked)))
    syncBooking(selectedItem)
  }

  offeringList.addEventListener('change', syncSelection)

  cartButton.addEventListener('click', () => {
    if (!selectedItem) return
    const result = Store.cartAdd(selectedItem.id, { seats: 1 })
    if (result.ok) {
      window.EduToast?.show({ type: 'success', title: 'Đã thêm vào giỏ (demo)', message: `${selectedItem.title} · 1 chỗ.` })
      Route.go('cart')
      return
    }
    const messages = {
      'not-enough-seats': `Chỉ còn ${result.seatsLeft} chỗ cho lớp này.`,
      'not-published': 'Gói không còn ở trạng thái công khai.',
      closed: 'Gói đã đóng, không nhận đăng ký.',
      'storage-failed': 'Không lưu được giỏ — sessionStorage không ghi được.'
    }
    window.EduToast?.show({ type: 'error', title: 'Không thêm được vào giỏ', message: messages[result.reason] || `Không thêm được (${result.reason}).` })
    syncSelection()
  })

  const preferred = visibleOfferings.find(item => item.type !== 'GROUP_CLASS' || Store.seatsLeft(item) > 0) || visibleOfferings[0] || null
  if (preferred) {
    const entry = cards.find(card => card.card.dataset.offeringId === preferred.id)
    if (entry) entry.input.checked = true
  }
  syncSelection()

  /* ---------------- Jobs phù hợp (lọc jobBoard theo môn/cấp của gia sư) ---------------- */

  const jobList = page.querySelector('[data-tutor-jobs]')
  const jobEmpty = page.querySelector('[data-tutor-jobs-empty]')
  const jobTemplate = page.querySelector('[data-job-suggestion-template]')
  const jobMatchesTutor = job => {
    const subjectMatch = tutor.subjects.includes(job.subject)
    if (!subjectMatch) return false
    const gradeMatch = tutor.grades.includes(job.grade)
      || (job.level === 'thpt' && (tutor.grades.includes('10') || tutor.grades.includes('luyen-thi')))
      || (job.level === 'thcs' && tutor.grades.includes('thcs'))
      || (job.level === 'adult' && tutor.grades.includes('luyen-thi'))
    return gradeMatch
  }
  const matchedJobs = Store.jobBoard().filter(jobMatchesTutor)
  if (matchedJobs.length && jobTemplate) {
    const nodes = matchedJobs.map(job => {
      const card = jobTemplate.content.firstElementChild.cloneNode(true)
      const titleNode = card.querySelector('[data-job-suggestion-title]')
      const metaNode = card.querySelector('[data-job-suggestion-meta]')
      const budgetNode = card.querySelector('[data-job-suggestion-budget]')
      const linkNode = card.querySelector('[data-job-suggestion-link]')
      if (titleNode) titleNode.textContent = job.title
      if (metaNode) metaNode.textContent = `${job.subjectLabel} · ${job.gradeLabel} · ${job.district}`
      if (budgetNode) budgetNode.textContent = Store.formatMoney(job.budgetPerSession)
      if (linkNode) linkNode.href = Route.page('jobDetail', { id: job.id })
      return card
    })
    jobList.replaceChildren(...nodes)
    jobList.hidden = false
    if (jobEmpty) jobEmpty.hidden = true
  } else {
    jobList.hidden = true
    if (jobEmpty) jobEmpty.hidden = false
  }

  /* ---------------- Reviews ---------------- */

  const starsFor = score => {
    const wrap = el('span', 'rating')
    wrap.setAttribute('role', 'img')
    const label = `${score} trên 5 sao`
    wrap.setAttribute('aria-label', label)
    const stars = el('span', 'rating__stars')
    stars.setAttribute('aria-hidden', 'true')
    for (let index = 1; index <= 5; index += 1) {
      stars.append(el('span', index <= score ? 'rating__star' : 'rating__star rating__star--empty'))
    }
    wrap.append(stars)
    return wrap
  }

  const reviewItems = Store.reviewsByTutor(tutor.id).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const reviewsList = page.querySelector('[data-tutor-reviews]')
  const reviewsEmpty = page.querySelector('[data-reviews-empty]')
  const scoreBlock = page.querySelector('[data-reviews-score]')

  if (reviewItems.length) {
    Store.text(page.querySelector('[data-tutor-reviews-sub]'), `Dựa trên ${summary.count} đánh giá công khai sau các khóa học hoàn tất trong dữ liệu demo`)
    const score = formatScore(summary.average)
    Store.text(page.querySelector('[data-tutor-reviews-score]'), score)
    Store.text(page.querySelector('[data-reviews-score-count]'), `${summary.count} đánh giá`)
    const scoreStars = starsFor(Math.round(summary.average))
    scoreStars.setAttribute('aria-label', `Điểm trung bình ${score} trên 5 sao từ ${summary.count} đánh giá`)
    page.querySelector('[data-reviews-stars]').replaceWith(scoreStars)
    scoreBlock.hidden = false
    reviewsEmpty.hidden = true

    reviewsList.replaceChildren(...reviewItems.map(review => {
      const article = el('article', 'tutor-profile-review')
      const header = document.createElement('header')
      const avatarSmall = el('span', 'avatar avatar--small', review.learnerName.charAt(0).toUpperCase())
      avatarSmall.setAttribute('role', 'img')
      avatarSmall.setAttribute('aria-label', `Ảnh đại diện ${review.learnerName}`)
      const person = document.createElement('div')
      person.append(el('strong', undefined, review.learnerName))
      const time = el('time', undefined, Store.formatDate(review.createdAt))
      time.dateTime = review.createdAt
      header.append(avatarSmall, person, time)
      article.append(header, starsFor(review.rating), el('p', undefined, review.comment))
      return article
    }))
  } else {
    scoreBlock.hidden = true
    reviewsList.hidden = true
    reviewsEmpty.hidden = false
    Store.text(page.querySelector('[data-tutor-reviews-sub]'), 'Chưa có đánh giá công khai cho gia sư này.')
  }

  /* ---------------- Report ---------------- */

  const reportModal = document.getElementById('tp-report-modal')
  const reportOpenButton = page.querySelector('[data-report-open]')
  const reportLocked = page.querySelector('[data-report-locked]')
  const reasonSelect = page.querySelector('[data-report-reason]')
  const shotsSelect = page.querySelector('[data-report-shots]')
  const noteInput = page.querySelector('[data-report-note]')
  const noteCounter = page.querySelector('[data-report-counter]')
  const reportError = page.querySelector('[data-report-error]')
  const myReports = page.querySelector('[data-my-reports]')
  const myReportsList = page.querySelector('[data-my-reports-list]')

  const learnerId = Store.sessionLearnerId()

  const renderMyReports = () => {
    const mine = learnerId
      ? Store.reportsByReporter(learnerId).filter(item => item.targetType === 'tutor' && item.targetId === tutor.id)
      : []
    if (!mine.length) { myReports.hidden = true; return }
    myReports.hidden = false
    myReportsList.replaceChildren(...mine.map(item => {
      const li = el('li', 'tutor-profile-report__item')
      const state = Store.statusOf(Store.REPORT_STATE, item.state)
      const head = el('div', 'tutor-profile-report__item-head')
      head.append(el('strong', undefined, item.id), el('span', `badge ${state.badge}`, state.label))
      li.append(head)
      li.append(el('p', undefined, `Lý do: ${item.reasonLabel} · Gửi ngày ${Store.formatDate(item.createdAt)}`))
      const outcome = item.resolution
        ? `Kết quả: ${item.resolution.summary}`
        : (item.notices.length ? item.notices[item.notices.length - 1].text : 'Đang chờ quản trị xử lý.')
      li.append(el('p', undefined, outcome))
      return li
    }))
  }

  if (!learnerId) {
    const persona = Store.getSession().persona
    reportOpenButton.hidden = true
    Store.text(reportLocked, `Phiên demo hiện tại là ${persona.label} — chỉ tài khoản học viên/phụ huynh mới gửi được báo cáo. Không có báo cáo giả nào được tạo.`)
    reportLocked.hidden = false
  } else {
    renderMyReports()

    const placeholder = el('option', undefined, '— Chọn lý do —')
    placeholder.value = ''
    reasonSelect.replaceChildren(placeholder, ...Store.REPORT_REASONS.map(reason => {
      const option = el('option', undefined, reason.label)
      option.value = reason.code
      return option
    }))

    noteInput.addEventListener('input', () => {
      Store.text(noteCounter, `${noteInput.value.length}/800`)
    })

    const showReportError = (message, invalidNode) => {
      Store.text(reportError, message)
      reportError.hidden = false
      reasonSelect.setAttribute('aria-invalid', String(invalidNode === reasonSelect))
      noteInput.setAttribute('aria-invalid', String(invalidNode === noteInput))
    }

    reportOpenButton.addEventListener('click', () => {
      reasonSelect.value = ''
      shotsSelect.value = '0'
      noteInput.value = ''
      Store.text(noteCounter, '0/800')
      reportError.hidden = true
      reasonSelect.removeAttribute('aria-invalid')
      noteInput.removeAttribute('aria-invalid')
      window.EduModal.open(reportModal.id, {
        variant: 'danger',
        title: `Báo cáo gia sư ${tutor.name}`,
        message: `Báo cáo gia sư ${tutor.id} được gửi tới quản trị với mã RP-…; minh chứng chỉ là metadata mẫu, không có tệp nào được tải lên server. Báo cáo đang mở trùng đối tượng sẽ bị chặn.`,
        confirmText: 'Gửi báo cáo'
      })
    })

    reportModal.addEventListener('modal:confirm', event => {
      const reason = reasonSelect.value
      const note = noteInput.value.trim()
      const shots = Number(shotsSelect.value)
      if (!reason) { event.preventDefault(); showReportError('Chọn lý do báo cáo trong danh sách.', reasonSelect); return }
      if (note.length > 800) { event.preventDefault(); showReportError('Ghi chú bằng chứng tối đa 800 ký tự.', noteInput); return }
      if (!Number.isInteger(shots) || shots < 0 || shots > 5) { event.preventDefault(); showReportError('Số ảnh chụp minh chứng phải từ 0 đến 5.', shotsSelect); return }

      const result = Store.submitReport({
        reporterId: learnerId,
        targetType: 'tutor',
        targetId: tutor.id,
        reason,
        evidenceNote: note,
        screenshotCount: shots,
        idempotency: `tp:report:${tutor.id}:${reason}`
      })
      if (result.ok) {
        window.EduToast?.show({ type: 'success', title: 'Đã gửi báo cáo (demo)', message: `Mã báo cáo ${result.data.reportId}. Quản trị xử lý trên cùng bản ghi; kết quả/thông báo hiển thị lại ở mục “Báo cáo của bạn”.` })
        renderMyReports()
        return
      }
      event.preventDefault()
      if (result.reason === 'duplicated') {
        showReportError('Báo cáo với cùng lý do cho gia sư này đã được gửi trong phiên demo này; không tạo bản ghi thứ hai.', null)
        return
      }
      if (result.reason === 'storage-failed') {
        showReportError('Không lưu được báo cáo — sessionStorage không ghi được. Chưa có báo cáo nào được tạo.', null)
        return
      }
      const messages = {
        'duplicate-open-report': `Đã có báo cáo đang mở (${result.reportId}) cho gia sư này; không tạo bản ghi trùng.`,
        'invalid-reason': 'Chọn lý do báo cáo trong danh sách.',
        'unknown-target': 'Không tìm thấy gia sư trong dữ liệu mẫu.',
        'evidence-too-long': 'Ghi chú bằng chứng tối đa 800 ký tự.',
        'invalid-screenshot-count': 'Số ảnh chụp minh chứng phải từ 0 đến 5.'
      }
      showReportError(messages[result.reason] || `Không gửi được báo cáo (${result.reason}).`, null)
    })
  }
})()
