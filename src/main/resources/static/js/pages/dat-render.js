/* Native GET forms keep server filters and page state as the source of truth. */
(() => {
  document.querySelectorAll('[data-dat-sort]').forEach(select => {
    select.addEventListener('change', () => select.form?.requestSubmit())
  })
  document.addEventListener('invalid', event => {
    const panel = event.target.closest('[data-search-filters]')
    if (panel) panel.open = true
  }, true)
})()
