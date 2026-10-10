(() => {
  const desktop = window.matchMedia('(min-width: 64rem)')
  const filters = Array.from(document.querySelectorAll('[data-search-filters]'))
  if (!filters.length) return

  const syncLayout = () => {
    filters.forEach(panel => { panel.open = desktop.matches })
  }

  syncLayout()
  desktop.addEventListener('change', syncLayout)
})()
