(() => {
  const page = document.querySelector('[data-tutor-profile-page]')
  if (!page) return

  const plans = Array.from(page.querySelectorAll('[data-plan]'))
  const selectedSubject = page.querySelector('[data-selected-subject]')
  const selectedGrade = page.querySelector('[data-selected-grade]')
  const selectedPrice = page.querySelector('[data-selected-price]')
  const inviteTrigger = page.querySelector('[data-invite-tutor]')
  const inviteModal = document.getElementById('invite-tutor-modal')
  const inviteDescription = document.getElementById('invite-modal-description')

  const currentPlan = () => plans.find(plan => plan.getAttribute('aria-pressed') === 'true') || plans[0]

  const syncPlan = plan => {
    plans.forEach(item => {
      const selected = item === plan
      item.classList.toggle('is-selected', selected)
      item.setAttribute('aria-pressed', String(selected))
    })
    if (selectedSubject) selectedSubject.textContent = plan.dataset.subject
    if (selectedGrade) selectedGrade.textContent = plan.dataset.grade
    if (selectedPrice) selectedPrice.textContent = plan.dataset.price
  }

  plans.forEach(plan => {
    plan.addEventListener('click', () => syncPlan(plan))
  })

  inviteTrigger?.addEventListener('click', () => {
    const plan = currentPlan()
    if (!plan) return
    const message = `Bạn đang mời gia sư dạy môn ${plan.dataset.subject} (${plan.dataset.grade}) với học phí dự kiến ${plan.dataset.price} mỗi buổi 90 phút.`
    if (inviteDescription) inviteDescription.textContent = message
    window.EduModal?.open('invite-tutor-modal', {
      title: 'Gửi lời mời dạy?',
      message,
      confirmText: 'Gửi lời mời',
      cancelText: 'Hủy'
    })
  })

  inviteModal?.addEventListener('modal:confirm', () => {
    const plan = currentPlan()
    window.EduToast?.show({
      type: 'success',
      title: 'Đã ghi nhận lời mời mẫu',
      message: `${plan.dataset.subject} ${plan.dataset.grade} · ${plan.dataset.price}/buổi. Prototype chưa gửi dữ liệu thật.`
    })
  })

  page.querySelector('[data-chat]')?.addEventListener('click', () => {
    window.EduToast?.show({
      type: 'info',
      title: 'Tư vấn với Nguyễn Minh Anh',
      message: 'Hộp thoại tư vấn chưa kết nối dữ liệu thật trong giai đoạn prototype.'
    })
  })

  page.querySelector('[data-view-reviews]')?.addEventListener('click', () => {
    window.EduToast?.show({
      type: 'info',
      title: '126 đánh giá đã xác minh',
      message: 'Danh sách đầy đủ sẽ được hiển thị khi kết nối dữ liệu đánh giá.'
    })
  })

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    const labels = {
      messages: 'Tin nhắn',
      notifications: 'Thông báo',
      logout: 'Đăng xuất'
    }
    const title = labels[event.detail?.action]
    if (!title) return
    window.EduToast?.show({ type: 'info', title, message: 'Chức năng này chưa kết nối dữ liệu thật.' })
  })

  if (plans[0]) syncPlan(plans[0])
})()
