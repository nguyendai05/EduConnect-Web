/** Tác giả: Trường Đạt. DAT-04: nghiệp vụ lưu/kiểm ở server, không dùng fixture/store. */
(() => {
  const searchForm = document.getElementById('discover-search-form')
  const sort = document.querySelector('[data-discover-live-sort]')
  sort?.addEventListener('change', () => searchForm?.requestSubmit())

  // Reveal invalid sidebar fields before browser validation focuses them on mobile.
  document.addEventListener('invalid', event => {
    if (event.target.form !== searchForm) return
    const panel = event.target.closest('[data-search-filters]')
    if (panel) panel.open = true
  }, true)

  document.querySelectorAll('[data-job-live-form]').forEach(form => {
    form.addEventListener('submit', () => {
      if (form.checkValidity()) form.setAttribute('aria-busy', 'true')
    })
  })
})()
