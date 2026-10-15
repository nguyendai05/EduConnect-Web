/* Trang tạo lời mời: danh sách gia sư + dịch vụ/lớp lấy từ EduStore (một nguồn). */
(() => {
  const root = document.querySelector('[data-invitation-create-page]')
  if (!root) return

  const Store = window.EduStore
  if (!Store) return

  const params = new URLSearchParams(window.location.search)
  const requestedOfferingId = params.get('offeringId') || params.get('offering')
  const requestedTutorId = params.get('tutorId') || params.get('tutor')

  const DELIVERY_LABEL = { both: 'Dạy tại nhà & trực tuyến', home: 'Dạy tại nhà', online: 'Dạy trực tuyến' }

  const listableOfferings = Store.list('offerings').filter(offering => Store.isPubliclyListable(offering))
  const offeringsById = new Map(listableOfferings.map(offering => [offering.id, offering]))

  const form = root.querySelector('[data-invitation-form]')
  const notFound = root.querySelector('[data-invitation-not-found]')
  const notFoundTitle = root.querySelector('[data-not-found-title]')
  const notFoundMessage = root.querySelector('[data-not-found-message]')
  const notFoundBack = root.querySelector('[data-not-found-back]')

  const showNotFound = (title, message) => {
    if (form) form.hidden = true
    if (notFound) {
      notFound.hidden = false
      if (notFoundTitle) notFoundTitle.textContent = title
      if (notFoundMessage) notFoundMessage.textContent = message
      if (notFoundBack) notFoundBack.href = window.EduRoute ? window.EduRoute.page('tutorSearch') : window.EduRoute.path("/tutor/search")
    }
  }

  /* Không fallback về gia sư khác khi deep-link trỏ tới id không tồn tại. */
  let scopedTutorId = null
  let initialOffering = null

  if (requestedOfferingId) {
    const offering = offeringsById.get(requestedOfferingId)
    if (!offering) {
      showNotFound('Không tìm thấy dịch vụ/lớp',
        `Mã dịch vụ “${requestedOfferingId}” không tồn tại hoặc không còn mở để gửi lời mời.`)
      return
    }
    if (requestedTutorId && offering.tutorId !== requestedTutorId) {
      showNotFound('Gia sư và dịch vụ không khớp',
        `Dịch vụ “${offering.title}” không thuộc gia sư mang mã “${requestedTutorId}”.`)
      return
    }
    scopedTutorId = offering.tutorId
    initialOffering = offering
  } else if (requestedTutorId) {
    const tutor = Store.tutor(requestedTutorId)
    if (!tutor) {
      showNotFound('Không tìm thấy gia sư',
        `Mã gia sư “${requestedTutorId}” không có trong dữ liệu mẫu.`)
      return
    }
    const theirs = listableOfferings.filter(offering => offering.tutorId === requestedTutorId)
    if (!theirs.length) {
      showNotFound('Gia sư chưa mở dịch vụ',
        `${tutor.name} hiện chưa có dịch vụ/lớp công khai để gửi lời mời.`)
      return
    }
    scopedTutorId = requestedTutorId
    initialOffering = theirs[0]
  } else {
    if (!listableOfferings.length) {
      showNotFound('Chưa có dịch vụ để mời',
        'Chưa có gia sư nào mở dịch vụ/lớp công khai trong dữ liệu mẫu.')
      return
    }
    scopedTutorId = listableOfferings[0].tutorId
    initialOffering = listableOfferings[0]
  }

  const offeringsToShow = scopedTutorId
    ? listableOfferings.filter(offering => offering.tutorId === scopedTutorId)
    : listableOfferings

  const sessionsInput = root.querySelector('#total-sessions')
  const rateInput = root.querySelector('#rate-input')
  const startInput = root.querySelector('#start-date')
  const messageInput = root.querySelector('#invitation-message')
  const confirmModal = document.querySelector('#confirm-invitation-modal')

  const state = {
    offering: initialOffering,
    subject: `${initialOffering.subjectLabel} • ${initialOffering.gradeLabel}`,
    listedRate: initialOffering.price,
    rate: initialOffering.price,
    durationMinutes: initialOffering.durationMinutes,
    sessions: Math.min(initialOffering.sessions, 24),
    frequency: 2,
    format: `Tại nhà (${initialOffering.district})`
  }

  const formatNumber = value => new Intl.NumberFormat('vi-VN').format(Math.max(0, Number(value) || 0))
  const formatMoney = value => Store.formatMoney(value)
  const setText = (selector, value) => {
    root.querySelectorAll(selector).forEach(element => { element.textContent = value })
  }
  const setAttr = (selector, attribute, value) => {
    const element = root.querySelector(selector)
    if (element) element.setAttribute(attribute, value)
  }
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min))

  const getSchedule = () => {
    const slots = [...root.querySelectorAll('[data-slot]')]
    if (!slots.length) return state.offering.scheduleText || 'Chưa chọn khung giờ'
    return slots.map(slot => `${slot.dataset.day} (${slot.dataset.time.split('–')[0]})`).join('\n')
  }

  const updateSummary = () => {
    const total = state.sessions * state.rate
    const weeks = Math.max(1, Math.ceil(state.sessions / state.frequency))
    setText('[data-estimated-timeline]', `Thời lượng dự kiến: khoảng ${weeks} tuần`)
    setText('[data-calculation]', `${state.sessions} buổi × ${formatMoney(state.rate)}`)
    setText('[data-total-cost], [data-summary-total]', formatMoney(total))
    setText('[data-summary-subject]', state.subject)
    setText('[data-summary-rate]', `${formatMoney(state.rate)} / buổi`)
    setText('[data-summary-sessions]', `${state.sessions} buổi`)
    setText('[data-summary-frequency]', `${state.frequency} buổi / tuần`)
    setText('[data-summary-format]', state.format)
    setText('[data-summary-start]', startInput?.value || 'Chưa xác định')
    setText('[data-summary-slots]', getSchedule())
  }

  const subjectLabelsFor = tutorId => {
    const labels = [...new Set(listableOfferings
      .filter(offering => offering.tutorId === tutorId)
      .map(offering => offering.subjectLabel))]
    return labels.length ? labels.join(' · ') : '—'
  }

  const availabilityFor = tutorId => {
    const schedules = [...new Set(listableOfferings
      .filter(offering => offering.tutorId === tutorId)
      .map(offering => offering.scheduleText)
      .filter(Boolean))]
    return schedules.length ? schedules.join(' · ') : 'Chưa có lịch công khai'
  }

  const prefillHero = offering => {
    const tutor = Store.tutor(offering.tutorId) || { name: offering.tutorId, initials: 'GS', rating: 0, reviewCount: 0, experienceYears: 0, classesTaught: 0, district: offering.district, delivery: 'home' }
    document.title = `Mời ${tutor.name} dạy | Edu Connect`

    const breadcrumb = root.querySelector('[data-breadcrumb-tutor]')
    if (breadcrumb) {
      breadcrumb.textContent = tutor.name
      breadcrumb.href = `${window.EduRoute.path('/tutor/profile')}?id=${encodeURIComponent(tutor.id || offering.tutorId)}`
    }
    const backLink = root.querySelector('[data-back-link]')
    if (backLink) backLink.href = `${window.EduRoute.path('/tutor/profile')}?id=${encodeURIComponent(tutor.id || offering.tutorId)}`

    const heading = root.querySelector('[data-create-heading]')
    if (heading) heading.textContent = `Mời ${tutor.name} dạy`
    const avatar = root.querySelector('[data-create-avatar]')
    if (avatar) {
      avatar.textContent = tutor.initials
      avatar.setAttribute('aria-label', `Ảnh đại diện ${tutor.name}`)
    }
    setText('[data-create-name]', tutor.name)
    setText('[data-create-subjects]', subjectLabelsFor(offering.tutorId))
    setText('[data-create-rating]', formatNumber(tutor.rating))
    setText('[data-create-rating-count]', `(${tutor.reviewCount} đánh giá)`)
    setText('[data-create-experience]', `${tutor.experienceYears} năm kinh nghiệm`)
    setText('[data-create-classes]', `${tutor.classesTaught} lớp đã dạy`)
    setText('[data-create-location]', tutor.district || '—')
    setText('[data-create-delivery]', DELIVERY_LABEL[tutor.delivery] || '—')
    setText('[data-tutor-availability]', availabilityFor(offering.tutorId))

    const summaryAvatar = root.querySelector('[data-summary-avatar]')
    if (summaryAvatar) {
      summaryAvatar.textContent = tutor.initials
      summaryAvatar.setAttribute('aria-label', `Ảnh đại diện ${tutor.name}`)
    }
    setText('[data-summary-name]', tutor.name)
    setAttr('#invitation-tutor-name', 'aria-label', tutor.name)

    const heroRating = root.querySelector('.invitation-tutor .rating')
    if (heroRating) heroRating.setAttribute('aria-label', `Đánh giá ${formatNumber(tutor.rating)} trên 5 sao từ ${tutor.reviewCount} đánh giá`)
  }

  const applyOffering = offering => {
    state.offering = offering
    state.subject = `${offering.subjectLabel} • ${offering.gradeLabel}`
    state.listedRate = offering.price
    state.rate = offering.price
    state.durationMinutes = offering.durationMinutes
    const home = root.querySelector('input[name="learning-format"]:checked')
    state.format = home && home.value === 'online'
      ? 'Trực tuyến (Google Meet)'
      : `Tại nhà (${offering.district})`
    root.querySelectorAll('[data-subject-card]').forEach(card => {
      const input = card.querySelector('input[name="subject"]')
      const selected = input && input.dataset.offeringId === offering.id
      card.classList.toggle('is-selected', selected)
      if (input) input.checked = selected
    })
    if (rateInput) rateInput.value = formatNumber(state.rate)
    setText('[data-listed-subject]', state.subject)
    setText('[data-listed-rate]', formatMoney(state.listedRate))
    prefillHero(offering)
    updateSummary()
  }

  const renderOfferingCards = () => {
    const group = root.querySelector('[data-subject-group]')
    const template = root.querySelector('[data-invitation-offering-template]')
    if (!group || !template) return
    group.querySelectorAll('[data-subject-card]').forEach(card => card.remove())
    offeringsToShow.forEach(offering => {
      const tutor = Store.tutor(offering.tutorId)
      const node = template.content.firstElementChild.cloneNode(true)
      const input = node.querySelector('input[name="subject"]')
      if (input) {
        input.value = offering.id
        input.dataset.label = `${offering.subjectLabel} • ${offering.gradeLabel}`
        input.dataset.rate = String(offering.price)
        input.dataset.offeringId = offering.id
        input.dataset.tutorId = offering.tutorId
      }
      const title = node.querySelector('[data-offering-title]')
      if (title) title.textContent = offering.title
      const price = node.querySelector('[data-offering-price]')
      if (price) price.textContent = formatMoney(offering.price)
      const meta = node.querySelector('[data-offering-meta]')
      if (meta) meta.textContent = `${tutor ? tutor.name : offering.tutorId} · ${offering.unitLabel}`
      group.append(node)
    })
    group.querySelectorAll('input[name="subject"]').forEach(input => {
      input.addEventListener('change', () => {
        const offering = offeringsById.get(input.dataset.offeringId)
        if (offering) applyOffering(offering)
      })
    })
    applyOffering(initialOffering)
  }

  root.querySelectorAll('[data-session-adjust]').forEach(button => {
    button.addEventListener('click', () => {
      state.sessions = clamp(state.sessions + Number(button.dataset.sessionAdjust), 1, 60)
      if (sessionsInput) sessionsInput.value = state.sessions
      updateSummary()
    })
  })

  sessionsInput?.addEventListener('input', () => {
    state.sessions = clamp(sessionsInput.value, 1, 60)
    updateSummary()
  })
  sessionsInput?.addEventListener('blur', () => { sessionsInput.value = state.sessions })

  root.querySelectorAll('[data-frequency]').forEach(button => {
    button.addEventListener('click', () => {
      state.frequency = Number(button.dataset.frequency)
      root.querySelectorAll('[data-frequency]').forEach(option => {
        const selected = option === button
        option.classList.toggle('is-selected', selected)
        option.setAttribute('aria-pressed', String(selected))
      })
      updateSummary()
    })
  })

  rateInput?.addEventListener('input', () => {
    state.rate = Number(rateInput.value.replace(/\D/g, '')) || 0
    updateSummary()
  })
  rateInput?.addEventListener('blur', () => { rateInput.value = formatNumber(state.rate) })
  startInput?.addEventListener('input', updateSummary)

  root.querySelectorAll('input[name="learning-format"]').forEach(input => {
    input.addEventListener('change', () => {
      const home = input.value === 'home'
      state.format = home ? `Tại nhà (${state.offering.district})` : 'Trực tuyến (Google Meet)'
      root.querySelector('[data-location-field]')?.toggleAttribute('hidden', !home)
      root.querySelectorAll('[data-format-card]').forEach(card => {
        card.classList.toggle('radio-option--selected', card.contains(input))
      })
      updateSummary()
    })
  })

  messageInput?.addEventListener('input', () => {
    setText('[data-message-counter]', `${messageInput.value.length} / 500`)
  })

  const bindRemoveSlot = button => {
    button.addEventListener('click', () => {
      button.closest('[data-slot]')?.remove()
      updateSummary()
    })
  }
  root.querySelectorAll('[data-remove-slot]').forEach(bindRemoveSlot)

  root.querySelector('[data-add-slot]')?.addEventListener('click', () => {
    const slot = document.createElement('article')
    slot.dataset.slot = ''
    slot.dataset.day = 'Thứ 6'
    slot.dataset.time = '19:00–20:30'
    const day = document.createElement('span')
    day.textContent = 'T6'
    const copy = document.createElement('p')
    const title = document.createElement('strong')
    title.textContent = 'Thứ 6'
    const time = document.createElement('small')
    time.textContent = '19:00–20:30 (90 phút)'
    copy.append(title, time)
    const remove = document.createElement('button')
    remove.type = 'button'
    remove.dataset.removeSlot = ''
    remove.setAttribute('aria-label', 'Xóa khung giờ Thứ 6')
    const icon = document.createElement('img')
    icon.src = '../../assets/icons/cancel.svg'
    icon.alt = ''
    remove.append(icon)
    slot.append(day, copy, remove)
    root.querySelector('[data-slot-list]')?.append(slot)
    bindRemoveSlot(remove)
    updateSummary()
  })

  /* Lý do tiếng Việt cho TỪNG reason mà Store.createInvitation chặn. */
  const REASON_MESSAGES = {
    'learner-required': 'Bạn cần đăng nhập bằng tài khoản phụ huynh/học viên để gửi lời mời.',
    'tutor-not-found': 'Không tìm thấy gia sư trong dữ liệu mẫu.',
    'offering-not-found': 'Không tìm thấy dịch vụ/lớp được chọn.',
    'offering-not-of-tutor': 'Dịch vụ/lớp này không thuộc gia sư đang được mời.',
    'offering-not-listable': 'Dịch vụ/lớp này không còn mở công khai để nhận lời mời.',
    'invalid-proposal': 'Đề xuất chưa hợp lệ: học phí, số buổi và thời lượng phải lớn hơn 0.',
    'duplicated': 'Lời mời cho dịch vụ/lớp này đã được gửi trước đó; không tạo trùng lặp.',
    'storage-failed': 'Không lưu được lời mời do bộ nhớ trình duyệt bị chặn. Vui lòng thử lại.',
    'invalid-state': 'Dữ liệu lời mời không hợp lệ, vui lòng tải lại trang.',
    'mutation-failed': 'Không gửi được lời mời do lỗi dữ liệu nội bộ.'
  }

  const errorNode = confirmModal ? confirmModal.querySelector('[data-invitation-error]') : null

  const clearError = () => {
    if (errorNode) { errorNode.textContent = ''; errorNode.hidden = true }
  }

  const renderError = message => {
    if (errorNode) {
      errorNode.textContent = message
      errorNode.hidden = false
    } else {
      window.EduToast?.show({ type: 'error', title: 'Không gửi được lời mời', message })
    }
  }

  const openConfirm = () => {
    const total = state.sessions * state.rate
    clearError()
    window.EduModal?.open('confirm-invitation-modal', {
      title: `Gửi lời mời cho ${Store.tutor(state.offering.tutorId)?.name || 'gia sư'}?`,
      message: `Đề xuất học môn ${state.subject} gồm ${state.sessions} buổi, ${state.frequency} buổi mỗi tuần với học phí ${formatMoney(state.rate)}/buổi. Tổng dự kiến ${formatMoney(total)}.`,
      confirmText: 'Xác nhận gửi',
      cancelText: 'Xem lại'
    })
  }

  root.querySelectorAll('[data-open-confirm]').forEach(button => button.addEventListener('click', openConfirm))

  confirmModal?.addEventListener('modal:confirm', event => {
    const result = Store.createInvitation({
      learnerId: Store.sessionLearnerId(),
      tutorId: state.offering.tutorId,
      offeringId: state.offering.id,
      message: messageInput ? messageInput.value.trim() : '',
      proposal: {
        pricePerSession: state.rate,
        sessions: state.sessions,
        durationMinutes: state.durationMinutes,
        scheduleText: getSchedule()
      },
      idempotency: 'invite:create:' + state.offering.id
    })
    if (result.ok) {
      window.location.href = `${window.EduRoute.path('/invitation/negotiation')}?id=${encodeURIComponent(result.data.id)}`
      return
    }
    event.preventDefault()
    let message = REASON_MESSAGES[result.reason] || `Không gửi được lời mời (${result.reason}).`
    if (result.reason === 'invitation-open-exists' && result.invitationId) {
      message = `Bạn đã có lời mời đang mở cho dịch vụ/lớp này (mã ${result.invitationId}). Vui lòng chờ gia sư phản hồi.`
    }
    renderError(message)
  })

  form?.addEventListener('submit', event => event.preventDefault())

  renderOfferingCards()
  setText('[data-message-counter]', `${messageInput ? messageInput.value.length : 0} / 500`)
  updateSummary()
})()
