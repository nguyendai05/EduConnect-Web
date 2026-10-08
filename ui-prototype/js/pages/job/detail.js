(() => {
  const page = document.querySelector('[data-detail-page]')
  if (!page) return

  const form = page.querySelector('[data-application-form]')
  const rateInput = page.querySelector('[data-rate-input]')
  const comparison = page.querySelector('[data-rate-comparison]')
  const slotList = page.querySelector('[data-slot-list]')
  const slotError = page.querySelector('[data-slot-error]')
  const note = page.querySelector('[data-cover-note]')
  const summaryRate = page.querySelector('[data-summary-rate]')
  const summarySlots = page.querySelector('[data-summary-slots]')
  const modalRate = document.querySelector('[data-modal-rate]')
  const modalSlots = document.querySelector('[data-modal-slots]')
  const parentRate = 220000
  const extraSlots = [
    { day: 'Thứ 4', time: '19:00 - 20:30' },
    { day: 'Thứ 7', time: '08:00 - 09:30' },
    { day: 'Chủ nhật', time: '14:00 - 15:30' }
  ]

  const digits = value => String(value || '').replace(/\D/g, '')
  const formatNumber = value => new Intl.NumberFormat('vi-VN').format(Number(value) || 0)
  const formatRate = () => `${formatNumber(digits(rateInput?.value))} ₫ / buổi`

  const slotElements = () => [...slotList.querySelectorAll('[data-slot]')]
  const slotDays = () => slotElements().map(slot => slot.dataset.day)

  const slotSummary = () => {
    const days = slotDays()
    if (!days.length) return 'Chưa chọn khung giờ'
    const time = slotElements()[0]?.querySelector('span')?.textContent.split('·')[1]?.trim() || ''
    return `${days.join(' & ')}${time ? ` (${time})` : ''}`
  }

  const updateSummary = () => {
    const rate = formatRate()
    const slots = slotSummary()
    if (summaryRate) summaryRate.textContent = rate
    if (summarySlots) summarySlots.textContent = slots
    if (modalRate) modalRate.textContent = rate
    if (modalSlots) modalSlots.textContent = slots
    if (slotError) slotError.hidden = slotElements().length > 0
  }

  const updateRate = () => {
    if (!rateInput) return
    const value = Number(digits(rateInput.value))
    rateInput.value = value ? formatNumber(value) : ''
    if (comparison) {
      const difference = value - parentRate
      comparison.classList.toggle('is-different', difference !== 0)
      comparison.textContent = difference === 0
        ? '✓ Bằng mức phụ huynh mong muốn (220.000 ₫)'
        : difference > 0
          ? `ⓘ Cao hơn mức phụ huynh mong muốn ${formatNumber(difference)} ₫`
          : `ⓘ Thấp hơn mức phụ huynh mong muốn ${formatNumber(Math.abs(difference))} ₫`
    }
    updateSummary()
  }

  const makeSlot = ({ day, time }) => {
    const slot = document.createElement('div')
    slot.className = 'application-slot'
    slot.dataset.slot = ''
    slot.dataset.day = day

    const label = document.createElement('span')
    const icon = document.createElement('img')
    icon.src = '../../assets/icons/calendar.svg'
    icon.alt = ''
    label.append(icon, document.createTextNode(`${day} · ${time}`))

    const remove = document.createElement('button')
    remove.type = 'button'
    remove.dataset.removeSlot = ''
    remove.setAttribute('aria-label', `Xóa khung giờ ${day}`)
    remove.textContent = '×'
    slot.append(label, remove)
    return slot
  }

  const replaceSlots = slots => {
    slotList.replaceChildren(...slots.map(makeSlot))
    updateSummary()
  }

  rateInput?.addEventListener('input', updateRate)
  rateInput?.addEventListener('blur', updateRate)

  slotList?.addEventListener('click', event => {
    const remove = event.target.closest('[data-remove-slot]')
    if (!remove) return
    remove.closest('[data-slot]')?.remove()
    updateSummary()
  })

  page.querySelector('[data-add-slot]')?.addEventListener('click', () => {
    const used = new Set(slotDays())
    const next = extraSlots.find(slot => !used.has(slot.day))
    if (!next) {
      window.EduToast?.show({ type: 'info', title: 'Đã đủ khung giờ mẫu', message: 'Bạn có thể dùng lịch rảnh từ hồ sơ để khôi phục lịch đề xuất.' })
      return
    }
    slotList.append(makeSlot(next))
    updateSummary()
  })

  page.querySelector('[data-prefill-slots]')?.addEventListener('click', () => {
    replaceSlots([
      { day: 'Thứ 2', time: '19:00 - 20:30' },
      { day: 'Thứ 4', time: '19:00 - 20:30' },
      { day: 'Thứ 6', time: '19:00 - 20:30' }
    ])
    window.EduToast?.show({ type: 'success', title: 'Đã dùng lịch rảnh', message: 'Ba khung giờ từ hồ sơ đã được thêm vào đơn ứng tuyển.' })
  })

  const openModal = (id, options) => window.EduModal?.open(id, options)
  const openConfirm = () => openModal('application-confirm-modal', {
    title: 'Xác nhận gửi ứng tuyển',
    message: 'Bạn chuẩn bị gửi đề xuất học phí và lịch dạy cho phụ huynh Chị Mai Lan. Mỗi gia sư chỉ có 1 lượt ứng tuyển cho tin này.',
    confirmText: 'Xác nhận gửi',
    cancelText: 'Hủy bỏ'
  })

  const openSuccess = () => openModal('application-success-modal', {
    variant: 'info',
    title: 'Ứng tuyển thành công!',
    message: 'Hồ sơ và đề xuất của bạn đã được chuyển tới phụ huynh Chị Mai Lan. Bạn sẽ nhận được thông báo ngay khi phụ huynh phản hồi.',
    cancelText: 'Đóng cửa sổ'
  })

  const openClosed = () => openModal('closed-post-modal', {
    variant: 'info',
    title: 'Tin đã đóng nhận hồ sơ',
    message: 'Phụ huynh Chị Mai Lan đã tìm được gia sư phù hợp hoặc đã đủ số lượng hồ sơ tiếp nhận cho tin này (#TT-8841).',
    cancelText: 'Đã hiểu, quay lại'
  })

  form?.addEventListener('submit', event => {
    event.preventDefault()
    const hasRate = Number(digits(rateInput?.value)) > 0
    const hasSlots = slotElements().length > 0
    const hasNote = Boolean(note?.value.trim())
    if (slotError) slotError.hidden = hasSlots
    if (!hasRate || !hasSlots || !hasNote) {
      window.EduToast?.show({ type: 'error', title: 'Chưa đủ thông tin', message: 'Vui lòng nhập học phí, chọn lịch dạy và viết lời giới thiệu trước khi gửi.' })
      if (!hasRate) rateInput?.focus()
      else if (!hasNote) note?.focus()
      return
    }
    updateSummary()
    openConfirm()
  })

  const confirmModal = document.getElementById('application-confirm-modal')
  confirmModal?.addEventListener('modal:close', event => {
    if (event.detail?.reason === 'confirm') window.setTimeout(openSuccess, 0)
  })

  page.querySelector('[data-open-confirm]')?.addEventListener('click', openConfirm)
  page.querySelector('[data-open-success]')?.addEventListener('click', openSuccess)
  page.querySelector('[data-open-closed]')?.addEventListener('click', openClosed)

  document.querySelector('[data-track-application]')?.addEventListener('click', () => {
    window.EduToast?.show({ type: 'info', title: 'Quản lý ứng tuyển', message: 'Bản prototype chưa kết nối trang quản lý ứng tuyển.' })
  })

  updateRate()
})()
