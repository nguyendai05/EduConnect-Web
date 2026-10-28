/** DAT-03: phản hồi qua form POST/CSRF; không thay trạng thái hoặc tạo giao dịch trên trình duyệt. */
(() => {
  const forms = document.querySelectorAll('[data-invitation-action]')
  forms.forEach(form => {
    form.addEventListener('submit', () => {
      if (!form.checkValidity()) return
      forms.forEach(other => other.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = true }))
    })
  })
  window.addEventListener('pageshow', () => {
    forms.forEach(form => form.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = false }))
  })
})()
