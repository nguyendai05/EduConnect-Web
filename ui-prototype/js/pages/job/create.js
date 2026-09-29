(() => {
  const page = document.querySelector('[data-create-job-page]')
  if (!page) return

  const form = page.querySelector('#create-job-form')
  const titleInput = page.querySelector('#post-title')
  const feeInput = page.querySelector('#fee-input')
  const addressInput = page.querySelector('#address-input')
  const descriptionInput = page.querySelector('#description-textarea')
  const titleCounter = page.querySelector('#title-counter')
  const descriptionCounter = page.querySelector('#description-counter')
  const contactNotice = page.querySelector('#contact-notice')
  const confirmModal = document.querySelector('#create-confirm-modal')
  const limitAlert = page.querySelector('#limit-alert')
  const draftKey = 'edu-connect:create-job-draft'
  let suppressDraftSave = false

  const selectDefaults = {
    subject: 'Toán',
    grade: 'Lớp 11 · THPT',
    frequency: '2 buổi / tuần',
    district: 'TP. Thủ Đức, TP. Hồ Chí Minh',
    experience: 'Từ 3 năm kinh nghiệm',
    gender: 'Không yêu cầu (Nam hoặc Nữ)'
  }

  const selectValue = name => page.querySelector(`[data-create-select="${name}"] [data-select-value]`)?.textContent.trim() || ''
  const selectedMode = () => form.querySelector('input[name="learning-mode"]:checked')?.value || 'Tại nhà'
  const text = (selector, value) => {
    const target = document.querySelector(selector)
    if (target) target.textContent = value
  }
  const formatFee = value => {
    const digits = String(value).replace(/\D/g, '')
    return digits ? Number(digits).toLocaleString('vi-VN') : '220.000'
  }
  const excerpt = value => {
    const normalized = value.trim()
    if (!normalized) return 'Chưa có mô tả chi tiết.'
    return normalized.length > 180 ? `${normalized.slice(0, 177).trim()}...` : normalized
  }

  const saveDraft = () => {
    if (suppressDraftSave) return
    const selects = Object.fromEntries(Object.keys(selectDefaults).map(name => [name, selectValue(name)]))
    sessionStorage.setItem(draftKey, JSON.stringify({
      title: titleInput.value,
      fee: feeInput.value,
      address: addressInput.value,
      description: descriptionInput.value,
      mode: selectedMode(),
      selects
    }))
  }

  const selectOption = (name, value) => {
    const root = page.querySelector(`[data-create-select="${name}"]`)
    const option = Array.from(root?.querySelectorAll('.select-option') || []).find(item => item.dataset.value === value)
    option?.click()
  }

  const restoreDraft = () => {
    const rawDraft = sessionStorage.getItem(draftKey)
    if (!rawDraft) return

    try {
      const draft = JSON.parse(rawDraft)
      suppressDraftSave = true
      if (typeof draft.title === 'string') titleInput.value = draft.title
      if (typeof draft.fee === 'string') feeInput.value = draft.fee
      if (typeof draft.address === 'string') addressInput.value = draft.address
      if (typeof draft.description === 'string') descriptionInput.value = draft.description
      if (draft.selects && typeof draft.selects === 'object') {
        Object.entries(draft.selects).forEach(([name, value]) => selectOption(name, value))
      }
      const radio = Array.from(form.querySelectorAll('input[name="learning-mode"]')).find(input => input.value === draft.mode)
      if (radio) {
        radio.checked = true
        radio.dispatchEvent(new Event('change', { bubbles: true }))
      }
      suppressDraftSave = false
    } catch {
      suppressDraftSave = false
      sessionStorage.removeItem(draftKey)
    }
  }

  const updateContactNotice = () => {
    const hasContact = /(?:\+?84|0)(?:\s|\.|-)*\d(?:[\s.-]*\d){7,9}\b|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|\b(?:zalo|facebook|fb\.com)\b/i.test(descriptionInput.value)
    const title = contactNotice.querySelector('.alert__title')
    const message = contactNotice.querySelector('.alert__message')
    contactNotice.classList.toggle('is-contact-error', hasContact)
    contactNotice.setAttribute('role', hasContact ? 'alert' : 'status')

    if (hasContact) {
      title.textContent = 'Phát hiện thông tin liên hệ cá nhân'
      message.textContent = 'Vui lòng xóa số điện thoại, email hoặc tài khoản mạng xã hội để tin được kiểm duyệt nhanh hơn.'
    } else {
      title.textContent = 'Hệ thống bảo vệ quyền riêng tư phụ huynh'
      message.textContent = 'Tin đăng không chứa số điện thoại, email, link mạng xã hội hay số tài khoản. Hồ sơ gia sư sẽ được gửi qua hệ thống tin nhắn nội bộ.'
    }
  }

  const updatePreview = () => {
    const title = titleInput.value.trim() || 'Tìm gia sư Toán lớp 11 tại Thủ Đức'
    const subject = selectValue('subject')
    const grade = selectValue('grade')
    const frequency = selectValue('frequency')
    const district = selectValue('district')
    const experience = selectValue('experience')
    const location = addressInput.value.trim() || district
    const mode = selectedMode()
    const fee = `${formatFee(feeInput.value)} ₫`

    text('#preview-title', title)
    text('#preview-fee', fee)
    text('#preview-subject', subject)
    text('#preview-grade', grade)
    text('#preview-frequency', frequency)
    text('#preview-location', location)
    text('#preview-mode', mode)
    text('#preview-experience', experience === 'Không yêu cầu' ? experience : `Ưu tiên ${experience.toLowerCase()}`)
    text('#preview-description', excerpt(descriptionInput.value))
    titleCounter.textContent = `${titleInput.value.length} / 200 ký tự`
    descriptionCounter.textContent = `${descriptionInput.value.length} / 500 ký tự`
    updateContactNotice()
  }

  const updateModalSummary = () => {
    text('[data-summary-title]', titleInput.value.trim() || 'Tìm gia sư Toán lớp 11 tại Thủ Đức')
    text('[data-summary-subject]', `${selectValue('subject')} · ${selectValue('grade')}`)
    text('[data-summary-fee]', `${formatFee(feeInput.value)} ₫ / buổi`)
    text('[data-summary-mode]', `${selectedMode()} · ${addressInput.value.trim() || selectValue('district')}`)
  }

  const openConfirm = () => {
    updateModalSummary()
    window.EduModal?.open('create-confirm-modal', {
      title: 'Xác nhận gửi tin để duyệt',
      message: 'Vui lòng kiểm tra nhanh tóm tắt tin tìm gia sư trước khi gửi cho đội ngũ kiểm duyệt.',
      confirmText: 'Xác nhận gửi duyệt',
      cancelText: 'Xem lại nội dung'
    })
  }

  const openSuccess = () => {
    window.EduModal?.open('create-success-modal', {
      variant: 'info',
      title: 'Đã gửi tin thành công!',
      message: 'Tin tìm gia sư đã được tiếp nhận và chuyển sang trạng thái Chờ duyệt. Thời gian duyệt dự kiến từ 30 đến 60 phút.',
      cancelText: 'Đã hiểu'
    })
  }

  form.addEventListener('input', () => {
    updatePreview()
    saveDraft()
  })
  form.addEventListener('change', () => {
    updatePreview()
    saveDraft()
  })

  page.querySelectorAll('[data-create-select] .select-option').forEach(option => {
    option.addEventListener('click', () => requestAnimationFrame(() => {
      updatePreview()
      saveDraft()
    }))
  })

  form.addEventListener('submit', event => {
    event.preventDefault()
    openConfirm()
  })

  form.addEventListener('reset', () => {
    setTimeout(() => {
      suppressDraftSave = true
      sessionStorage.removeItem(draftKey)
      Object.entries(selectDefaults).forEach(([name, value]) => selectOption(name, value))
      updatePreview()
      requestAnimationFrame(() => {
        suppressDraftSave = false
        sessionStorage.removeItem(draftKey)
      })
      window.EduToast?.show({ type: 'info', title: 'Đã khôi phục biểu mẫu', message: 'Nội dung đã trở về dữ liệu mẫu ban đầu.' })
    })
  })

  page.querySelector('[data-scroll-preview]')?.addEventListener('click', () => {
    page.querySelector('#live-preview-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })

  page.querySelector('[data-open-confirm]')?.addEventListener('click', openConfirm)
  page.querySelector('[data-open-success]')?.addEventListener('click', openSuccess)
  page.querySelector('[data-toggle-limit]')?.addEventListener('click', () => {
    limitAlert.hidden = !limitAlert.hidden
    if (!limitAlert.hidden) limitAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

  confirmModal?.addEventListener('modal:confirm', () => {
    sessionStorage.removeItem(draftKey)
    setTimeout(() => {
      openSuccess()
      window.EduToast?.show({ type: 'success', title: 'Đã gửi tin', message: 'Tin của bạn đang chờ kiểm duyệt.' })
    }, 50)
  })

  restoreDraft()
  updatePreview()
})()
