(() => {
  const root = document.querySelector('[data-invitation-create-page]')
  if (!root) return

  const currency = value => `${new Intl.NumberFormat('vi-VN').format(value)} ₫`

  const TUTORS = {
    'GS-01': {
      id: 'GS-01', name: 'Nguyễn Minh Anh', initials: 'MA', subjects: 'Toán · Vật lý',
      rating: '4,9', ratingCount: 126, experience: '5 năm kinh nghiệm', classes: '84 lớp đã dạy',
      location: 'Thủ Đức, TP. Hồ Chí Minh', district: 'Thủ Đức', delivery: 'Dạy tại nhà & trực tuyến',
      availability: 'Thứ 2 (18:00–21:00), Thứ 4 (18:00–21:00), Thứ 6 (18:30–21:00), Thứ 7 (08:00–11:30)',
      invite: 'INV-20261009-024',
      plans: [
        { subject: 'Toán', grade: 'THPT', price: 200000 },
        { subject: 'Toán', grade: 'THCS', price: 180000 },
        { subject: 'Vật lý', grade: 'THPT', price: 220000 }
      ]
    },
    'GS-02': {
      id: 'GS-02', name: 'Trần Quốc Huy', initials: 'QH', subjects: 'Tiếng Anh · IELTS',
      rating: '4,8', ratingCount: 89, experience: '4 năm kinh nghiệm', classes: '62 lớp đã dạy',
      location: 'Quận 7, TP. Hồ Chí Minh', district: 'Quận 7', delivery: 'Dạy trực tuyến & tại nhà',
      availability: 'Thứ 3 (19:00–21:00), Thứ 5 (19:00–21:00), Thứ 7 (09:00–11:30), Chủ nhật (09:00–11:30)',
      invite: 'INV-20261009-018',
      plans: [
        { subject: 'Tiếng Anh', grade: 'THPT', price: 250000 },
        { subject: 'IELTS', grade: 'Người đi làm', price: 300000 },
        { subject: 'Tiếng Anh', grade: 'THCS', price: 220000 }
      ]
    },
    'GS-03': {
      id: 'GS-03', name: 'Lê Thảo Vy', initials: 'TV', subjects: 'Ngữ văn · Luyện viết',
      rating: '4,9', ratingCount: 61, experience: '3 năm kinh nghiệm', classes: '45 lớp đã dạy',
      location: 'Bình Thạnh, TP. Hồ Chí Minh', district: 'Bình Thạnh', delivery: 'Dạy tại nhà',
      availability: 'Thứ 3 (18:00–20:30), Thứ 5 (18:00–20:30), Thứ 7 (08:00–11:00)',
      invite: 'INV-20261009-011',
      plans: [
        { subject: 'Ngữ văn', grade: 'THCS', price: 180000 },
        { subject: 'Ngữ văn', grade: 'THPT', price: 200000 },
        { subject: 'Luyện viết', grade: 'THCS', price: 160000 }
      ]
    },
    'GS-04': {
      id: 'GS-04', name: 'Phạm Hoàng Long', initials: 'PL', subjects: 'Toán · Vật lý',
      rating: '5,0', ratingCount: 42, experience: '6 năm kinh nghiệm', classes: '110 lớp đã dạy',
      location: 'Quận 3, TP. Hồ Chí Minh', district: 'Quận 3', delivery: 'Dạy tại nhà & trực tuyến',
      availability: 'Thứ 3 (18:30–21:00), Thứ 5 (18:30–21:00), Thứ 7 (08:00–11:30)',
      invite: 'INV-20261009-005',
      plans: [
        { subject: 'Toán', grade: 'Luyện thi', price: 300000 },
        { subject: 'Toán', grade: 'THPT', price: 280000 },
        { subject: 'Vật lý', grade: 'THPT', price: 260000 }
      ]
    }
  }

  const requestedTutor = new URLSearchParams(window.location.search).get('tutor')
  const tutor = (requestedTutor && TUTORS[requestedTutor]) || TUTORS['GS-01']

  const form = root.querySelector('[data-invitation-form]')
  const sessionsInput = root.querySelector('#total-sessions')
  const rateInput = root.querySelector('#rate-input')
  const startInput = root.querySelector('#start-date')
  const messageInput = root.querySelector('#invitation-message')
  const confirmModal = document.querySelector('#confirm-invitation-modal')
  const successModal = document.querySelector('#invitation-success-modal')
  const state = {
    subject: `${tutor.plans[0].subject} • ${tutor.plans[0].grade}`,
    listedRate: tutor.plans[0].price,
    rate: tutor.plans[0].price,
    sessions: 8,
    frequency: 2,
    format: `Tại nhà (${tutor.district})`
  }
  let openSuccessAfterClose = false

  const formatNumber = value => new Intl.NumberFormat('vi-VN').format(Math.max(0, Number(value) || 0))
  const formatMoney = value => `${formatNumber(value)} ₫`
  const setText = (selector, value) => {
    root.querySelectorAll(selector).forEach(element => { element.textContent = value })
  }
  const setAttr = (selector, attribute, value) => {
    const element = root.querySelector(selector)
    if (element) element.setAttribute(attribute, value)
  }
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min))

  const slugify = value => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const getSchedule = () => {
    const slots = [...root.querySelectorAll('[data-slot]')]
    if (!slots.length) return 'Chưa chọn khung giờ'
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

  const selectSubject = input => {
    state.subject = input.dataset.label
    state.listedRate = Number(input.dataset.rate)
    state.rate = state.listedRate
    root.querySelectorAll('[data-subject-card]').forEach(card => {
      const selected = card.contains(input)
      card.classList.toggle('is-selected', selected)
      card.setAttribute('aria-pressed', String(selected))
    })
    if (rateInput) rateInput.value = formatNumber(state.rate)
    setText('[data-listed-subject]', state.subject)
    setText('[data-listed-rate]', formatMoney(state.listedRate))
    updateSummary()
  }

  const bindSubjectInputs = () => {
    root.querySelectorAll('input[name="subject"]').forEach(input => {
      input.addEventListener('change', () => selectSubject(input))
    })
  }

  const renderSubjectCards = () => {
    const group = root.querySelector('[data-subject-group]')
    if (!group) return
    group.querySelectorAll('[data-subject-card]').forEach(card => card.remove())
    tutor.plans.forEach((plan, index) => {
      const label = document.createElement('label')
      label.className = 'card card--interactive invitation-subject'
      label.dataset.subjectCard = ''
      const input = document.createElement('input')
      input.type = 'radio'
      input.name = 'subject'
      input.value = slugify(`${plan.subject}-${plan.grade}`)
      input.dataset.label = `${plan.subject} • ${plan.grade}`
      input.dataset.rate = String(plan.price)
      if (index === 0) {
        input.checked = true
        label.classList.add('is-selected')
      }
      const check = document.createElement('span')
      check.className = 'invitation-subject__check'
      check.setAttribute('aria-hidden', 'true')
      check.textContent = '✓'
      const title = document.createElement('strong')
      title.textContent = `${plan.subject} • ${plan.grade}`
      const price = document.createElement('b')
      price.textContent = currency(plan.price)
      const unit = document.createElement('small')
      unit.textContent = '90 phút / buổi'
      label.append(input, check, title, price, unit)
      if (index === 0) {
        const badge = document.createElement('span')
        badge.className = 'badge badge--info'
        badge.textContent = 'Phổ biến nhất'
        label.append(badge)
      }
      group.append(label)
    })
    bindSubjectInputs()
  }

  const prefillTutor = () => {
    document.title = `Mời ${tutor.name} dạy | Edu Connect`
    const breadcrumb = root.querySelector('[data-breadcrumb-tutor]')
    if (breadcrumb) {
      breadcrumb.textContent = tutor.name
      breadcrumb.href = `../tutor/profile.html?id=${encodeURIComponent(tutor.id)}`
    }
    const backLink = root.querySelector('[data-back-link]')
    if (backLink) backLink.href = `../tutor/profile.html?id=${encodeURIComponent(tutor.id)}`
    const heading = root.querySelector('[data-create-heading]')
    if (heading) heading.textContent = `Mời ${tutor.name} dạy`
    const avatar = root.querySelector('[data-create-avatar]')
    if (avatar) {
      avatar.textContent = tutor.initials
      avatar.setAttribute('aria-label', `Ảnh đại diện ${tutor.name}`)
    }
    setText('[data-create-name]', tutor.name)
    setText('[data-create-subjects]', tutor.subjects)
    setText('[data-create-rating]', tutor.rating)
    setText('[data-create-rating-count]', `(${tutor.ratingCount} đánh giá)`)
    setText('[data-create-experience]', tutor.experience)
    setText('[data-create-classes]', tutor.classes)
    setText('[data-create-location]', tutor.location)
    setText('[data-create-delivery]', tutor.delivery)
    setText('[data-tutor-availability]', tutor.availability)
    const summaryAvatar = root.querySelector('[data-summary-avatar]')
    if (summaryAvatar) {
      summaryAvatar.textContent = tutor.initials
      summaryAvatar.setAttribute('aria-label', `Ảnh đại diện ${tutor.name}`)
    }
    setText('[data-summary-name]', tutor.name)
    setAttr('#invitation-tutor-name', 'aria-label', tutor.name)
    const heroRating = root.querySelector('.invitation-tutor .rating')
    if (heroRating) heroRating.setAttribute('aria-label', `Đánh giá ${tutor.rating} trên 5 sao từ ${tutor.ratingCount} đánh giá`)
  }

  root.querySelectorAll('[data-session-adjust]').forEach(button => {
    button.addEventListener('click', () => {
      state.sessions = clamp(state.sessions + Number(button.dataset.sessionAdjust), 1, 60)
      sessionsInput.value = state.sessions
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
      state.format = home ? `Tại nhà (${tutor.district})` : 'Trực tuyến (Google Meet)'
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
    if (root.querySelector('[data-slot][data-day="Thứ 6"]')) {
      window.EduToast?.show({ type: 'info', title: 'Đã đủ lịch mẫu', message: 'Bạn có thể xóa một khung giờ trước khi thêm lịch khác.' })
      return
    }
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

  const openConfirm = () => {
    const total = state.sessions * state.rate
    window.EduModal?.open('confirm-invitation-modal', {
      title: `Gửi lời mời cho ${tutor.name}?`,
      message: `Đề xuất học môn ${state.subject} gồm ${state.sessions} buổi, ${state.frequency} buổi mỗi tuần với học phí ${formatMoney(state.rate)}/buổi. Tổng dự kiến ${formatMoney(total)}.`,
      confirmText: 'Xác nhận gửi',
      cancelText: 'Xem lại'
    })
  }

  root.querySelectorAll('[data-open-confirm]').forEach(button => button.addEventListener('click', openConfirm))
  confirmModal?.addEventListener('modal:confirm', () => { openSuccessAfterClose = true })
  confirmModal?.addEventListener('modal:close', () => {
    if (!openSuccessAfterClose) return
    openSuccessAfterClose = false
    setTimeout(() => {
      window.EduModal?.open('invitation-success-modal', {
        title: 'Đã gửi lời mời thành công!',
        message: `Gia sư ${tutor.name} đã nhận được đề xuất dạy của bạn. Thầy/cô sẽ có 7 ngày để phản hồi hoặc đề xuất thời gian biểu phù hợp hơn.`,
        confirmText: 'Xem chi tiết lời mời',
        cancelText: 'Về danh sách gia sư',
        variant: 'success'
      })
    }, 0)
  })

  successModal?.addEventListener('modal:confirm', () => {
    window.location.href = `../invitation/negotiation.html?invite=${encodeURIComponent(tutor.invite)}`
  })

  form?.addEventListener('submit', event => event.preventDefault())

  prefillTutor()
  renderSubjectCards()
  state.subject = `${tutor.plans[0].subject} • ${tutor.plans[0].grade}`
  state.listedRate = tutor.plans[0].price
  state.rate = tutor.plans[0].price
  if (rateInput) rateInput.value = formatNumber(state.rate)
  setText('[data-listed-subject]', state.subject)
  setText('[data-listed-rate]', formatMoney(state.listedRate))
  setText('[data-message-counter]', `${messageInput?.value.length || 0} / 500`)
  updateSummary()
})()
