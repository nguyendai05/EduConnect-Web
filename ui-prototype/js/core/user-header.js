(() => {
  const initUserHeader = () => {
    const header = document.querySelector('[data-component="user-header"]')
    if (!header) return

    const parentMenuItems = [
      { label: 'Hồ sơ cá nhân', href: '#ho-so', icon: 'profile' },
      { label: 'Hợp đồng của tôi', href: '#hop-dong', icon: 'calendar' },
      { label: 'Ví TriThức', href: '#vi-tri-thuc', icon: 'wallet' },
      { label: 'Bảo mật tài khoản', href: '#bao-mat', icon: 'shield' },
      { label: 'Lịch sử giao dịch & Hóa đơn', href: '#lich-su-giao-dich', icon: 'receipt' }
    ]

    const tutorMenuItems = [
      { label: 'Hồ sơ giảng dạy công khai', href: '#ho-so-gia-su', icon: 'profile' },
      { label: 'Lịch dạy & Khung rảnh', href: '#lich-day', icon: 'calendar' },
      { label: 'Ví TriThức & Rút tiền', href: '#vi-tri-thuc', icon: 'wallet' },
      { label: 'Bảo mật & Xác thực CCCD', href: '#bao-mat', icon: 'shield' }
    ]
    const iconAssetPath = '../../assets/icons/'

    const variants = {
      A: { activeNav: 'home', profileName: 'Chị Mai Lan', initials: 'ML', profileRole: 'Phụ huynh', menuItems: parentMenuItems, logoutLabel: 'Đăng xuất' },
      B: { activeNav: 'tutors', profileName: 'Chị Mai Lan', initials: 'ML', profileRole: 'Phụ huynh', menuItems: parentMenuItems, logoutLabel: 'Đăng xuất' },
      C: { activeNav: 'requests', profileName: 'Chị Mai Lan', initials: 'ML', profileRole: 'Phụ huynh', menuItems: parentMenuItems, logoutLabel: 'Đăng xuất' },
      D: { activeNav: 'groups', profileName: 'Chị Mai Lan', initials: 'ML', profileRole: 'Phụ huynh', menuItems: parentMenuItems, logoutLabel: 'Đăng xuất' },
      E: { activeNav: 'none', profileName: 'Chị Mai Lan', initials: 'ML', profileRole: 'Đang quản lý ví', menuItems: parentMenuItems, logoutLabel: 'Đăng xuất' },
      STUDENT: { activeNav: 'home', profileName: 'Minh Quân', initials: 'MQ', profileRole: 'Học viên Lớp 12 - Tự nhiên', menuItems: parentMenuItems, logoutLabel: 'Đăng xuất' },
      TUTOR: {
        activeNav: 'home',
        profileName: 'Lê Hoàng Yến',
        initials: 'LY',
        profileRole: 'Gia sư Chuyên Toán',
        verified: true,
        menuItems: tutorMenuItems,
        logoutLabel: 'Đăng xuất tài khoản',
        summary: {
          title: 'Tài khoản xác thực',
          badge: 'Gia sư TOP 1%',
          balance: '4.850.000đ'
        }
      }
    }

    const variantKey = (header.dataset.userVariant || 'A').toUpperCase()
    const variant = variants[variantKey] || variants.A
    const navLinks = Array.from(header.querySelectorAll('[data-nav-key]'))
    const profileNameElement = header.querySelector('[data-profile-name]')
    const profileInitialsElement = header.querySelector('[data-profile-initials]')
    const profileRole = header.querySelector('[data-profile-role]')
    const profileVerified = header.querySelector('[data-profile-verified]')
    const menuSummary = header.querySelector('[data-menu-summary]')
    const menuSummaryTitle = header.querySelector('[data-menu-summary-title]')
    const menuSummaryBadge = header.querySelector('[data-menu-summary-badge]')
    const menuBalance = header.querySelector('[data-menu-balance]')
    const menuLogoutLabel = header.querySelector('[data-menu-logout-label]')
    const menuLinkElements = Array.from(header.querySelectorAll('[data-menu-item]'))
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

    const isTutor = variantKey === 'TUTOR'
    header.classList.toggle('user-header--private', variantKey === 'E')
    header.classList.toggle('user-header--tutor', isTutor)

    const profileName = header.dataset.profileName || variant.profileName
    const profileInitials = header.dataset.profileInitials || variant.initials

    if (profileNameElement) profileNameElement.textContent = profileName
    if (profileInitialsElement) profileInitialsElement.textContent = profileInitials
    if (profileRole) {
      profileRole.textContent = header.dataset.profileRole || variant.profileRole
    }

    if (profileVerified) {
      const showVerifiedBadge = isTutor && variant.verified === true
      profileVerified.hidden = !showVerifiedBadge
      profileVerified.setAttribute('aria-hidden', String(!showVerifiedBadge))
    }

    if (menuSummary) menuSummary.hidden = !variant.summary
    if (variant.summary) {
      if (menuSummaryTitle) menuSummaryTitle.textContent = variant.summary.title
      if (menuSummaryBadge) menuSummaryBadge.textContent = variant.summary.badge
      if (menuBalance) menuBalance.textContent = variant.summary.balance
    }

    menuLinkElements.forEach((item, index) => {
      const itemConfig = variant.menuItems[index]
      item.hidden = !itemConfig
      item.setAttribute('aria-hidden', String(!itemConfig))

      if (!itemConfig) return

      item.href = itemConfig.href
      item.querySelector('[data-menu-label]').textContent = itemConfig.label
      const menuIcon = item.querySelector('[data-menu-icon]')
      menuIcon.dataset.menuIcon = itemConfig.icon
      menuIcon.src = `${iconAssetPath}${itemConfig.icon}.svg`
    })

    if (menuLogoutLabel) menuLogoutLabel.textContent = variant.logoutLabel

    const account = header.querySelector('.user-header__account')
    const trigger = header.querySelector('.user-header__profile')
    const menu = header.querySelector('.user-header__menu')
    const chevron = header.querySelector('.user-header__chevron')

    if (!account || !trigger || !menu) return

    const menuItems = Array.from(menu.querySelectorAll('[role="menuitem"]:not([hidden])'))

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const triggerLabel = `Mở menu tài khoản của ${profileName}`
    const triggerCloseLabel = `Đóng menu tài khoản của ${profileName}`
    trigger.setAttribute('aria-label', triggerLabel)
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
