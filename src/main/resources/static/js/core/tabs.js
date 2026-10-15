/** Generic tabs: unique tab/panel IDs per instance; Arrow keys, Home and End supported. */
(() => {
  const init = () => document.querySelectorAll('[data-tabs]').forEach(root => {
    if (root.dataset.tabsReady) return
    root.dataset.tabsReady = 'true'
    const tabs = [...root.querySelectorAll('[role="tab"]')].filter(tab => tab.closest('[data-tabs]') === root)
    const enabled = () => tabs.filter(tab => !tab.disabled && tab.getAttribute('aria-disabled') !== 'true')
    const activate = (target, focus = true) => {
      tabs.forEach(tab => {
        const active = tab === target
        tab.setAttribute('aria-selected', String(active))
        tab.tabIndex = active ? 0 : -1
        const panel = document.getElementById(tab.getAttribute('aria-controls'))
        if (panel && panel.closest('[data-tabs]') === root) panel.hidden = !active
      })
      if (focus) target.focus()
      root.dispatchEvent(new CustomEvent('tabs:change', { bubbles: true, detail: { tabId: target.id, panelId: target.getAttribute('aria-controls') } }))
    }
    tabs.forEach(tab => {
      tab.addEventListener('click', () => { if (enabled().includes(tab)) activate(tab) })
      tab.addEventListener('keydown', event => {
        const items = enabled()
        const index = items.indexOf(tab)
        if (index < 0) return
        const vertical = tab.closest('[role="tablist"]').getAttribute('aria-orientation') === 'vertical'
        let next
        if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next = items[(index + 1) % items.length]
        if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next = items[(index - 1 + items.length) % items.length]
        if (event.key === 'Home') next = items[0]
        if (event.key === 'End') next = items[items.length - 1]
        if (next) { event.preventDefault(); activate(next) }
      })
    })
    const selected = enabled().find(tab => tab.getAttribute('aria-selected') === 'true') || enabled()[0]
    if (selected) activate(selected, false)
  })
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
})()
