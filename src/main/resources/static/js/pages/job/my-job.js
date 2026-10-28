/** Tác giả: Trường Đạt. DAT-04: nghiệp vụ lưu/kiểm ở server, không dùng fixture/store. */
(() => {
  document.querySelectorAll('[data-job-live-form]').forEach(form => {
    form.addEventListener('submit', () => {
      if (form.checkValidity()) form.setAttribute('aria-busy', 'true')
    })
  })
})()
