(() => {
  const root = document.querySelector('[data-invitation-create-page]')
  if (!root) return

  const form = root.querySelector('[data-invitation-form]')
  const sessionsInput = root.querySelector('#total-sessions')
  const rateInput = root.querySelector('#rate-input')
  const startInput = root.querySelector('#start-date')
  const messageInput = root.querySelector('#invitation-message')
  const confirmModal = document.querySelector('#confirm-invitation-modal')
  const successModal = document.querySelector('#invitation-success-modal')
  const state = {
    subject: 'Toán • THPT',
    listedRate: 200000,
    rate: 200000,
    sessions: 8,
    frequency: 2,
    format: 'Tại nhà (Thủ Đức)'
  }
  let openSuccessAfterClose = false

  const formatNumber = value => new Intl.NumberFormat('vi-VN').format(Math.max(0, Number(value) || 0))
  const formatMoney = value => `${formatNumber(value)} ₫`
  const setText = (selector, value) => {
    root.querySelectorAll(selector).forEach(element => { element.textContent = value })
  }
  const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min))

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
    setText('[data-total-cost], [data-summary-total], [data-preview-total]', formatMoney(total))
    setText('[data-summary-subject], [data-preview-subject]', state.subject)
    setText('[data-summary-rate], [data-preview-rate]', `${formatMoney(state.rate)} / buổi`)
    setText('[data-summary-sessions], [data-preview-sessions]', `${state.sessions} buổi`)
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

  root.querySelectorAll('input[name="subject"]').forEach(input => {
    input.addEventListener('change', () => selectSubject(input))
  })

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
      state.format = home ? 'Tại nhà (Thủ Đức)' : 'Trực tuyến (Google Meet)'
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
      title: 'Gửi lời mời cho Nguyễn Minh Anh?',
      message: `Đề xuất học môn ${state.subject} gồm ${state.sessions} buổi, ${state.frequency} buổi mỗi tuần với học phí ${formatMoney(state.rate)}/buổi. Tổng dự kiến ${formatMoney(total)}.`,
      confirmText: 'Xác nhận gửi',
      cancelText: 'Xem lại'
    })
  }

  root.querySelectorAll('[data-open-confirm]').forEach(button => button.addEventListener('click', openConfirm))
  root.querySelectorAll('[data-open-success]').forEach(button => button.addEventListener('click', () => {
    window.EduModal?.open('invitation-success-modal', {
      title: 'Đã gửi lời mời thành công!',
      message: 'Gia sư Nguyễn Minh Anh đã nhận được đề xuất dạy của bạn. Thầy sẽ có 7 ngày để phản hồi hoặc đề xuất thời gian biểu phù hợp hơn.',
      confirmText: 'Xem chi tiết lời mời',
      cancelText: 'Về danh sách gia sư',
      variant: 'success'
    })
  }))

  confirmModal?.addEventListener('modal:confirm', () => { openSuccessAfterClose = true })
  confirmModal?.addEventListener('modal:close', () => {
    if (!openSuccessAfterClose) return
    openSuccessAfterClose = false
    setTimeout(() => {
      window.EduModal?.open('invitation-success-modal', {
        title: 'Đã gửi lời mời thành công!',
        message: 'Gia sư Nguyễn Minh Anh đã nhận được đề xuất dạy của bạn. Thầy sẽ có 7 ngày để phản hồi hoặc đề xuất thời gian biểu phù hợp hơn.',
        confirmText: 'Xem chi tiết lời mời',
        cancelText: 'Về danh sách gia sư',
        variant: 'success'
      })
    }, 0)
  })

  successModal?.addEventListener('modal:confirm', () => {
    window.EduToast?.show({ type: 'success', title: 'Đã ghi nhận lời mời mẫu', message: `${state.subject} · ${state.sessions} buổi · ${formatMoney(state.rate)}/buổi. Prototype chưa gửi dữ liệu thật.` })
  })

  form?.addEventListener('submit', event => event.preventDefault())
  setText('[data-message-counter]', `${messageInput?.value.length || 0} / 500`)
  updateSummary()
})()
