(() => {
  const initSelect = root => {
    const trigger = root.querySelector('[data-select-trigger]')
    const value = root.querySelector('[data-select-value]')
    const options = root.querySelector('[data-select-options]')
    const chevron = trigger?.querySelector('.select-control__chevron')
    const optionItems = options ? Array.from(options.querySelectorAll('[role="option"]')) : []
    const initialCheck = options?.querySelector('.select-option[aria-selected="true"] img')
    const checkIconSrc = initialCheck?.src

    if (!trigger || !value || !options || !chevron || optionItems.length === 0) return

    const setOpen = (isOpen, focusSelected = false) => {
      options.hidden = !isOpen
      trigger.setAttribute('aria-expanded', String(isOpen))
      chevron.src = isOpen ? chevron.dataset.iconOpen : chevron.dataset.iconClosed

      if (isOpen && focusSelected) {
        const selected = optionItems.find(option => option.getAttribute('aria-selected') === 'true')
        ;(selected || optionItems[0]).focus()
      }
    }

    const selectOption = option => {
      optionItems.forEach(item => {
        const selected = item === option
        item.classList.toggle('is-selected', selected)
        item.setAttribute('aria-selected', String(selected))

        const existingCheck = item.querySelector('img')
        if (selected && !existingCheck && checkIconSrc) {
          const check = document.createElement('img')
          check.src = checkIconSrc
          check.alt = ''
          item.append(check)
        } else if (!selected) {
          existingCheck?.remove()
        }
      })

      value.textContent = option.dataset.value
      setOpen(false)
      trigger.focus()
    }

    trigger.addEventListener('click', () => {
      setOpen(options.hidden, options.hidden)
    })

    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        setOpen(true, true)
      }
    })

    optionItems.forEach((option, index) => {
      option.addEventListener('click', () => selectOption(option))
      option.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          optionItems[(index + 1) % optionItems.length].focus()
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault()
          optionItems[(index - 1 + optionItems.length) % optionItems.length].focus()
        }

        if (event.key === 'Home') {
          event.preventDefault()
          optionItems[0].focus()
        }

        if (event.key === 'End') {
          event.preventDefault()
          optionItems[optionItems.length - 1].focus()
        }

        if (event.key === 'Escape') {
          event.preventDefault()
          setOpen(false)
          trigger.focus()
        }
      })
    })

    document.addEventListener('click', event => {
      if (!root.contains(event.target)) setOpen(false)
    })

    setOpen(root.dataset.initialOpen === 'true')
  }

  const init = () => {
    document.querySelectorAll('[data-component="select"]').forEach(initSelect)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
})()
