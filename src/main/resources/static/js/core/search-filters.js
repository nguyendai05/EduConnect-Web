(() => {
  const compact = window.matchMedia('(max-width: 64rem)')
  const filters = Array.from(document.querySelectorAll('[data-search-filters]'))
  if (!filters.length) return

  const syncLayout = () => {
    filters.forEach(panel => { panel.open = !compact.matches })
  }

  syncLayout()
  compact.addEventListener('change', syncLayout)
})()
