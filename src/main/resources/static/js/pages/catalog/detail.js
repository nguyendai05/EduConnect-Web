/**
 * Trang chi tiết dùng chung cho SERVICE và GROUP_CLASS, đọc ?id=<offeringId>.
 * ID không tồn tại → empty/error state, KHÔNG fallback sang bản ghi khác.
 * Khi sang giỏ/mời luôn giữ offeringId, selection và termsVersion.
 */
(() => {
  const page = document.querySelector('[data-catalog-detail-page]')
  if (!page || !window.EduRoute || !window.EduStore) return

  const route = window.EduRoute
  const store = window.EduStore
  const toast = window.EduToast

  const MODE_LABELS = { home: 'Tại nhà học viên', online: 'Trực tuyến', both: 'Tại nhà & trực tuyến' }
  const REGION_LABELS = { 'ho-chi-minh': 'TP. Hồ Chí Minh', 'ha-noi': 'Hà Nội', 'da-nang': 'Đà Nẵng', 'can-tho': 'Cần Thơ' }
  const DAY_LABELS = { 0: 'Chủ nhật', 1: 'Chủ nhật', 2: 'Thứ 2', 3: 'Thứ 3', 4: 'Thứ 4', 5: 'Thứ 5', 6: 'Thứ 6', 7: 'Thứ 7', cn: 'Chủ nhật' }

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    if (event.detail?.action === 'logout') return
    toast?.show({ type: 'info', title: 'Thông báo', message: 'Tính năng chưa sẵn sàng.' })
  })

  const layout = page.querySelector('[data-offering-layout]')
  const breadcrumb = page.querySelector('[data-detail-breadcrumb]')
  const missing = page.querySelector('[data-offering-missing]')

  const offeringId = route.param('id', 'catalogDetail')
  const offering = offeringId ? store.offering(offeringId) : null

  if (!offering) {
    document.title = 'Không tìm thấy dịch vụ / lớp học | Edu Connect'
    layout.hidden = true
    breadcrumb.hidden = true
    missing.hidden = false
    missing.querySelector('[data-missing-description]').textContent = offeringId
      ? `Không có dịch vụ/lớp nào mang mã “${offeringId}” trong dữ liệu mẫu. Trang không tự thay thế bằng bản ghi khác.`
      : 'Thiếu tham số ?id=<mã dịch vụ/lớp> trên URL. Hãy mở từ trang chủ hoặc kết quả tìm kiếm.'
    return
  }

  const tutor = store.tutor(offering.tutorId)
  const isGroup = offering.type === 'GROUP_CLASS'
  const seatsLeft = store.seatsLeft(offering)
  const status = store.statusOf(store.OFFERING_STATUS, offering.status)
  const isOpen = offering.availability === 'open'
  const isPublished = offering.status === 'published'
  const unitText = offering.unitLabel || (offering.unit === 'per-session' ? '/buổi' : '/trọn gói toàn khóa')

  const selection = {}
  ;(offering.options || []).forEach(option => {
    const first = Array.isArray(option.values) ? option.values[0] : null
    selection[option.key] = first ? first.id : null
  })
  let seats = 1

  const query = selector => page.querySelector(selector)
  const crumb = query('[data-crumb-title]')
  const typeBadge = query('[data-offering-type]')
  const statusBadge = query('[data-offering-status]')
  const availabilityBadge = query('[data-offering-availability]')
  const tutorAvatar = query('[data-tutor-avatar]')
  const tutorLink = query('[data-tutor-link]')
  const groupSection = query('[data-group-section]')
  const optionsContainer = query('[data-booking-options]')
  const seatsBlock = query('[data-booking-seats]')
  const seatsControl = query('[data-seats-control]')
  const seatsInput = query('[data-seats-input]')
  const seatsHint = query('[data-seats-hint]')
  const seatsError = query('[data-seats-error]')
  const bookingAlert = query('[data-booking-alert]')
  const bookingAlertTitle = query('[data-booking-alert-title]')
  const bookingAlertMessage = query('[data-booking-alert-message]')
  const bookingActions = query('[data-booking-actions]')
  const inviteLink = query('[data-invite-link]')
  const addCartButton = query('[data-add-cart]')

  const setText = (selector, value) => store.text(query(selector), value)

  document.title = `${offering.title} | Edu Connect`
  crumb.textContent = offering.title
  typeBadge.textContent = isGroup ? 'Lớp nhóm' : 'Dịch vụ 1 kèm 1'
  statusBadge.textContent = status.label
  statusBadge.classList.add(status.badge)
  // Lớp đủ chỗ không được gắn nhãn "Đang nhận đăng ký" dù availability vẫn là open.
  const seatsLeftValue = store.seatsLeft(offering)
  const isFull = seatsLeftValue === 0
  availabilityBadge.textContent = !isOpen ? 'Đã đóng đăng ký' : (isFull ? 'Đã đủ chỗ' : 'Đang nhận đăng ký')
  availabilityBadge.classList.add(isOpen && !isFull ? 'badge--success' : 'badge--neutral')

  setText('[data-offering-title]', offering.title)
  setText('[data-offering-subject]', offering.subjectLabel)
  setText('[data-offering-grade]', offering.gradeLabel)
  setText('[data-offering-mode]', MODE_LABELS[offering.mode] || offering.mode)
  setText('[data-offering-description]', offering.description)

  tutorAvatar.textContent = tutor ? tutor.initials : '—'
  tutorAvatar.setAttribute('aria-label', `Ảnh đại diện ${tutor ? tutor.name : offering.tutorId}`)
  setText('[data-tutor-name]', tutor ? tutor.name : offering.tutorId)
  setText('[data-tutor-id]', `Mã gia sư: ${offering.tutorId}`)
  if (tutor) tutorLink.setAttribute('href', route.page('tutorProfile', { id: tutor.id }))
  else tutorLink.hidden = true

  setText('[data-info-id]', offering.id)
  setText('[data-info-tutor]', tutor ? `${tutor.name} (${tutor.id})` : offering.tutorId)
  setText('[data-info-subject]', offering.subjectLabel)
  setText('[data-info-grade]', offering.gradeLabel)
  setText('[data-info-sessions]', `${store.formatNumber(offering.sessions)} buổi`)
  setText('[data-info-duration]', `${store.formatNumber(offering.durationMinutes)} phút/buổi`)
  setText('[data-info-price]', `${store.formatMoney(offering.price)} ${unitText}`)
  setText('[data-info-mode]', MODE_LABELS[offering.mode] || offering.mode)
  setText('[data-info-region]', `${offering.district} — ${REGION_LABELS[offering.region] || offering.region}`)
  setText('[data-info-schedule]', offering.scheduleText || 'Chưa xếp lịch')
  setText('[data-info-terms]', `Phiên bản điều khoản ${offering.termsVersion}`)
  setText('[data-info-status]', `${status.label}${isPublished ? ' — hiển thị công khai' : ' — không hiển thị công khai'}`)
  setText('[data-info-published]', offering.publishedAt ? store.formatDate(offering.publishedAt) : 'Chưa công khai')

  const canRegisterNow = isPublished && isOpen && (!isGroup || seatsLeft > 0)
  setText('[data-info-condition]', canRegisterNow
    ? (isGroup
      ? `Lớp đang công khai, đang mở và còn ${seatsLeft}/${offering.capacity} chỗ.`
      : 'Dịch vụ đang công khai và đang mở nhận học viên.')
    : `Hiện không nhận đăng ký: ${status.label}${isOpen ? '' : ', đã đóng đăng ký'}${isGroup && seatsLeft === 0 ? ', lớp đã đủ chỗ' : ''}.`)

  if (isGroup) {
    groupSection.hidden = false
    const scheduleList = query('[data-group-schedule]')
    const slots = Array.isArray(offering.schedule) && offering.schedule.length ? offering.schedule : null
    if (slots) {
      slots.forEach(slot => {
        const li = document.createElement('li')
        const day = document.createElement('span')
        day.textContent = DAY_LABELS[slot.day] || `Thứ ${slot.day}`
        const time = document.createElement('span')
        time.textContent = `${slot.start} – ${slot.end}`
        li.append(day, time)
        scheduleList.append(li)
      })
    } else {
      const li = document.createElement('li')
      li.textContent = offering.scheduleText || 'Chưa xếp lịch'
      scheduleList.append(li)
    }
    setText('[data-group-capacity]', `${store.formatNumber(offering.capacity)} chỗ`)
    setText('[data-group-enrolled]', `${store.formatNumber(offering.enrolled)} học viên`)
    setText('[data-group-seats-left]', `${store.formatNumber(seatsLeft)} chỗ`)
    setText('[data-group-start]', offering.startDate ? store.formatDate(offering.startDate) : 'Chưa chốt')
    setText('[data-group-condition]', `Điều kiện nhận đăng ký: lớp ở trạng thái công khai, đang mở và còn chỗ (hiện còn ${seatsLeft}/${offering.capacity}). Mỗi chỗ tương ứng một học viên.`)
  }

  const computeUnitPrice = () => {
    const delta = (offering.options || []).reduce((sum, option) => {
      const chosen = selection[option.key]
      if (!chosen) return sum
      const value = (option.values || []).find(item => item.id === chosen)
      return sum + (value ? Number(value.delta || 0) : 0)
    }, 0)
    return store.toInteger(offering.price) + store.toInteger(delta)
  }

  const updateInviteHref = () => {
    const params = { tutor: offering.tutorId, offering: offering.id, terms: offering.termsVersion }
    const chosenKeys = Object.keys(selection).filter(key => selection[key])
    if (chosenKeys.length) params.selection = JSON.stringify(selection)
    inviteLink.setAttribute('href', route.page('invitationCreate', params))
  }

  const updateSummary = () => {
    const unitPrice = computeUnitPrice()
    setText('[data-booking-price]', store.formatMoney(unitPrice))
    setText('[data-booking-unit]', unitText)
    const parts = [`${store.formatNumber(offering.sessions)} buổi × ${store.formatMoney(unitPrice)}`]
    if (isGroup) parts.push(`${seats} chỗ`)
    setText('[data-booking-estimate]', `Tạm tính: ${parts.join(' × ')} = ${store.formatMoney(unitPrice * offering.sessions * seats)}`)
    updateInviteHref()
  }

  const renderOptions = () => {
    optionsContainer.replaceChildren()
    const options = offering.options || []
    if (!isGroup && options.length) {
      optionsContainer.hidden = false
      options.forEach(option => {
        const fieldset = document.createElement('fieldset')
        fieldset.className = 'radio-field catalog-booking__field'
        const legend = document.createElement('legend')
        legend.textContent = option.label
        fieldset.append(legend)
        ;(option.values || []).forEach(value => {
          const label = document.createElement('label')
          label.className = selection[option.key] === value.id ? 'radio-option radio-option--selected' : 'radio-option'
          const hit = document.createElement('span')
          hit.className = 'radio-hit-area'
          const input = document.createElement('input')
          input.type = 'radio'
          input.name = `offering-option-${option.key}`
          input.value = value.id
          input.dataset.optionKey = option.key
          input.checked = selection[option.key] === value.id
          const circle = document.createElement('span')
          circle.className = 'radio-circle'
          circle.setAttribute('aria-hidden', 'true')
          hit.append(input, circle)
          const caption = document.createElement('span')
          const delta = Number(value.delta || 0)
          caption.textContent = delta
            ? `${value.label} (${delta > 0 ? '+' : '−'}${store.formatMoney(Math.abs(delta))})`
            : value.label
          label.append(hit, caption)
          fieldset.append(label)
        })
        optionsContainer.append(fieldset)
      })
    } else {
      optionsContainer.hidden = true
    }
  }

  optionsContainer.addEventListener('change', event => {
    const input = event.target.closest('input[type="radio"][data-option-key]')
    if (!input) return
    selection[input.dataset.optionKey] = input.value
    optionsContainer.querySelectorAll(`input[data-option-key="${input.dataset.optionKey}"]`).forEach(item => {
      item.closest('.radio-option')?.classList.toggle('radio-option--selected', item.checked)
    })
    updateSummary()
  })

  seatsInput.addEventListener('change', () => {
    const max = Math.max(1, seatsLeft === null ? 1 : seatsLeft)
    const requested = Math.floor(Number(seatsInput.value))
    if (!Number.isFinite(requested) || requested < 1 || requested > max) {
      seatsInput.setAttribute('aria-invalid', 'true')
      seatsControl.classList.add('is-error')
      seatsError.textContent = `Số chỗ phải từ 1 đến ${max}${seatsLeft !== null ? ` (lớp còn ${seatsLeft} chỗ)` : ''}.`
      seatsError.hidden = false
      seatsInput.value = String(seats)
      return
    }
    seatsInput.removeAttribute('aria-invalid')
    seatsControl.classList.remove('is-error')
    seatsError.hidden = true
    seats = requested
    updateSummary()
  })

  addCartButton.addEventListener('click', () => {
    const result = store.cartAdd(offering.id, { selection: isGroup ? {} : selection, seats: isGroup ? seats : 1 })
    if (result.ok) {
      toast?.show({
        type: 'success',
        title: 'Đã thêm vào giỏ đăng ký',
        message: `${offering.title} — tạm tính ${store.formatMoney(store.itemTotal(result.item))}`,
        actionLabel: 'Xem giỏ',
        onAction: () => route.go('cart')
      })
      return
    }
    const messages = {
      'not-enough-seats': `Lớp chỉ còn ${result.seatsLeft} chỗ, không thể thêm ${result.requested} chỗ.`,
      closed: 'Dịch vụ/lớp đã đóng, không nhận đăng ký mới.',
      'not-published': 'Dịch vụ/lớp chưa ở trạng thái công khai.',
      'unknown-offering': 'Không tìm thấy dịch vụ/lớp trong dữ liệu mẫu.',
      'storage-failed': 'Không lưu được giỏ (sessionStorage bị chặn). Trạng thái được giữ nguyên.'
    }
    if (result.reason === 'not-enough-seats' && seatsLeft !== null) {
      seatsInput.setAttribute('aria-invalid', 'true')
      seatsControl.classList.add('is-error')
      seatsError.textContent = `Chỉ còn ${result.seatsLeft} chỗ cho lớp này.`
      seatsError.hidden = false
    }
    toast?.show({ type: 'error', title: 'Chưa thêm được vào giỏ', message: messages[result.reason] || `Thao tác thất bại (${result.reason}).` })
  })

  const applyBookingState = () => {
    const full = isGroup && seatsLeft === 0
    const canRegister = store.isPubliclyListable(offering) && !full
    if (canRegister) {
      bookingAlert.hidden = true
      bookingActions.hidden = false
      inviteLink.hidden = isGroup
      addCartButton.disabled = false
      if (isGroup) {
        seatsBlock.hidden = false
        seatsInput.max = String(Math.max(1, seatsLeft))
        seatsHint.textContent = `Còn ${seatsLeft}/${offering.capacity} chỗ`
      } else {
        renderOptions()
      }
      setText('[data-booking-note]', `Điều khoản ${offering.termsVersion} · khi thêm vào giỏ hoặc gửi lời mời, giá và điều khoản được snapshot; đơn/hợp đồng cũ không đổi theo catalog.`)
      return
    }
    bookingActions.hidden = true
    optionsContainer.hidden = true
    seatsBlock.hidden = true
    bookingAlert.hidden = false
    bookingAlert.classList.add('alert--warning')
    if (!isPublished) {
      bookingAlertTitle.textContent = 'Chưa ở trạng thái công khai'
      bookingAlertMessage.textContent = `Trạng thái hiện tại: ${status.label}. Dịch vụ/lớp không hiển thị công khai nên chưa thể đăng ký.`
    } else if (!isOpen) {
      bookingAlertTitle.textContent = 'Đã đóng đăng ký'
      bookingAlertMessage.textContent = 'Dịch vụ/lớp này đã đóng và không nhận học viên mới. Không có thao tác đăng ký nào cho trạng thái này.'
    } else {
      bookingAlertTitle.textContent = 'Lớp đã đủ chỗ'
      bookingAlertMessage.textContent = `Đã đăng ký ${offering.enrolled}/${offering.capacity} chỗ. Bạn có thể xem hồ sơ gia sư và tìm lớp tương tự.`
    }
    setText('[data-booking-note]', 'Giá và lịch hiển thị chỉ để tham khảo; trạng thái trên là nguồn quyết định việc nhận đăng ký.')
  }

  applyBookingState()
  updateSummary()
})()
