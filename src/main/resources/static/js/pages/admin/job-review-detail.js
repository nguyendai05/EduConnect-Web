/** Tác giả: Trường Đạt. DAT-04: nghiệp vụ lưu/kiểm ở server, không dùng fixture/store. */
(() => {
  document.querySelectorAll('[data-job-live-form]').forEach(form => {
    form.addEventListener('submit', event => {
      // Từ chối bắt buộc có lý do; phê duyệt thì không.
      const reason = form.querySelector('textarea[name="reason"]')
      if (reason && event.submitter && event.submitter.value === 'reject' && reason.value.trim().length < 10) {
        event.preventDefault()
        reason.focus()
        window.alert('Hãy nhập lý do từ chối (ít nhất 10 ký tự).')
        return
      }
      if (form.checkValidity()) form.setAttribute('aria-busy', 'true')
    })
  })
})()
