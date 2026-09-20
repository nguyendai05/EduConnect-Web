(() => {
  const initUserHeader = () => {
    const header = document.querySelector('[data-component="user-header"]')
    if (!header) return

    const variants = {
      A: { activeNav: 'home', profileRole: 'Phụ huynh' },
      B: { activeNav: 'tutors', profileRole: 'Phụ huynh' },
      C: { activeNav: 'requests', profileRole: 'Phụ huynh' },
      D: { activeNav: 'groups', profileRole: 'Phụ huynh' },
      E: { activeNav: 'none', profileRole: 'Đang quản lý ví' }
    }

    const variantKey = (header.dataset.userVariant || 'A').toUpperCase()
    const variant = variants[variantKey] || variants.A
    const navLinks = Array.from(header.querySelectorAll('[data-nav-key]'))
    const profileRole = header.querySelector('[data-profile-role]')
    const currentPath = window.location.pathname.replace(/\/$/, '')
    const routeMatch = navLinks.find(link => {
      const route = link.dataset.route
      return route && (currentPath === route || currentPath.endsWith(route))
    })
    const activeNav = header.dataset.activeNav || routeMatch?.dataset.navKey || variant.activeNav

    navLinks.forEach(link => {
      const isActive = link.dataset.navKey === activeNav && activeNav !== 'none'
      link.classList.toggle('is-active', isActive)

      if (isActive) {
        link.setAttribute('aria-current', 'page')
      } else {
        link.removeAttribute('aria-current')
      }
    })

    header.classList.toggle('user-header--private', variantKey === 'E')

    if (profileRole) {
      profileRole.textContent = header.dataset.profileRole || variant.profileRole
    }

    const account = header.querySelector('.user-header__account')
    const trigger = header.querySelector('.user-header__profile')
    const menu = header.querySelector('.user-header__menu')
    const chevron = header.querySelector('.user-header__chevron')
    const menuItems = menu
      ? Array.from(menu.querySelectorAll('[role="menuitem"]'))
      : []

    if (!account || !trigger || !menu) return

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const triggerLabel = trigger.getAttribute('aria-label')
    const triggerCloseLabel = trigger.dataset.closeLabel || triggerLabel?.replace(/^Mở /, 'Đóng ')
    let isOpen = false
    let closeTimer = null

    menu.setAttribute('aria-hidden', 'true')

    const setOpen = (nextOpen, focusTarget = null) => {
      if (closeTimer) {
        window.clearTimeout(closeTimer)
        closeTimer = null
      }

      isOpen = nextOpen
      trigger.setAttribute('aria-expanded', String(nextOpen))
      if (triggerLabel && triggerCloseLabel) {
        trigger.setAttribute('aria-label', nextOpen ? triggerCloseLabel : triggerLabel)
      }
      trigger.classList.toggle('is-open', nextOpen)
      menu.setAttribute('aria-hidden', String(!nextOpen))

      if (chevron) {
        chevron.src = nextOpen
          ? chevron.dataset.iconOpen
          : chevron.dataset.iconClosed
      }

      if (nextOpen) {
        menu.hidden = false
        window.requestAnimationFrame(() => {
          if (isOpen) menu.classList.add('is-open')
        })

        if (focusTarget === 'first') menuItems[0]?.focus()
        if (focusTarget === 'last') menuItems[menuItems.length - 1]?.focus()
        return
      }

      menu.classList.remove('is-open')
      closeTimer = window.setTimeout(() => {
        if (!isOpen) menu.hidden = true
      }, prefersReducedMotion ? 0 : 180)
    }

    trigger.addEventListener('click', () => {
      setOpen(!isOpen)
    })

    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setOpen(true, 'first')
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setOpen(true, 'last')
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

    account.addEventListener('focusout', () => {
      window.requestAnimationFrame(() => {
        if (isOpen && !account.contains(document.activeElement)) setOpen(false)
      })
    })

    header.querySelectorAll('[data-user-action]').forEach(actionButton => {
      actionButton.addEventListener('click', () => {
        const action = actionButton.dataset.userAction
        if (!action) return

        if (action === 'logout') setOpen(false)

        header.dispatchEvent(new CustomEvent('user-header:action', {
          bubbles: true,
          detail: { action }
        }))
      })
    })

    document.addEventListener('click', event => {
      if (!account.contains(event.target)) {
        setOpen(false)
      }
    })

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && isOpen) {
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
