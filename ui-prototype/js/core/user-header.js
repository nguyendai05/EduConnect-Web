(() => {
  const initUserHeader = () => {
    const header = document.querySelector('[data-component="user-header"]')
    if (!header) return

    const account = header.querySelector('.user-header__account')
    const trigger = header.querySelector('.user-header__profile')
    const menu = header.querySelector('.user-header__menu')
    const chevron = header.querySelector('.user-header__chevron')
    const menuItems = menu
      ? Array.from(menu.querySelectorAll('[role="menuitem"]'))
      : []

    if (!account || !trigger || !menu) return

    const setOpen = (isOpen, focusFirstItem = false) => {
      menu.hidden = !isOpen
      trigger.setAttribute('aria-expanded', String(isOpen))
      trigger.classList.toggle('is-open', isOpen)

      if (chevron) {
        chevron.src = isOpen
          ? chevron.dataset.iconOpen
          : chevron.dataset.iconClosed
      }

      if (isOpen && focusFirstItem) {
        menuItems[0]?.focus()
      }
    }

    trigger.addEventListener('click', () => {
      setOpen(menu.hidden)
    })

    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setOpen(true, true)
      }
    })

    menuItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        setOpen(false)
      })

      item.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          menuItems[(index + 1) % menuItems.length]?.focus()
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault()
          menuItems[(index - 1 + menuItems.length) % menuItems.length]?.focus()
        }

        if (event.key === 'Home') {
          event.preventDefault()
          menuItems[0]?.focus()
        }

        if (event.key === 'End') {
          event.preventDefault()
          menuItems[menuItems.length - 1]?.focus()
        }

        if (event.key === 'Escape') {
          event.preventDefault()
          setOpen(false)
          trigger.focus()
        }
      })
    })

    document.addEventListener('click', event => {
      if (!account.contains(event.target)) {
        setOpen(false)
      }
    })

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) {
        setOpen(false)
        trigger.focus()
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserHeader, { once: true })
  } else {
    initUserHeader()
  }
})()
