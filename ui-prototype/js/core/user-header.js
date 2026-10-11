(() => {
  const initUserHeader = () => {
    const header = document.querySelector('[data-component="user-header"]')
    if (!header) return

    const Route = window.EduRoute
    const Store = window.EduStore

    /** Khi route.js chưa được nạp (trang showcase), giữ tiền tố hai cấp như trước. */
    const FALLBACK_PATHS = {
      home: 'home.html',
      login: 'auth/login.html',
      profile: 'account/profile.html',
      cart: 'cart/index.html',
      orderHistory: 'order/history.html',
      walletOverview: 'wallet/overview.html',
      tutorManage: 'tutor/manage.html',
      tutorMyProfile: 'tutor/my-profile.html',
      tutorSearch: 'tutor/search.html',
      jobDiscover: 'job/discover.html',
      adminDashboard: 'admin/dashboard.html',
      adminManage: 'admin/manage.html'
    }
    const href = (key, params, hash) => {
      if (Route) return Route.page(key, hash ? Object.assign({}, params, { hash }) : params)
      return `../../pages/${FALLBACK_PATHS[key] || ''}${hash ? `#${hash}` : ''}`
    }
    const iconSrc = name => (Route ? Route.asset(`assets/icons/${name}.svg`) : `../../assets/icons/${name}.svg`)

    /**
     * Menu theo VAI TRÒ của persona, không theo chữ cái variant.
     * Chỉ dùng icon có thật trong assets/icons.
     */
    const learnerMenuItems = [
      { label: 'Hồ sơ cá nhân', href: href('profile'), icon: 'profile' },
      { label: 'Giỏ đăng ký', href: href('cart'), icon: 'library' },
      { label: 'Đơn đăng ký của tôi', href: href('orderHistory'), icon: 'activity-log' },
      { label: 'Ví Edu Connect', href: href('walletOverview'), icon: 'wallet' },
      { label: 'Lịch sử giao dịch & Hóa đơn', href: href('walletOverview', null, 'transactions'), icon: 'receipt' }
    ]

    const tutorMenuItems = [
      { label: 'Quản lý dịch vụ & lớp', href: href('tutorManage'), icon: 'settings' },
      { label: 'Đơn đăng ký', href: href('tutorManage', { tab: 'orders' }), icon: 'activity-log' },
      { label: 'Doanh thu', href: href('tutorManage', { tab: 'revenue' }), icon: 'wallet' },
      { label: 'Hồ sơ giảng dạy', href: href('tutorMyProfile'), icon: 'profile' },
      { label: 'Thiết lập lịch rảnh', href: href('tutorMyProfile', null, 'lich-ranh'), icon: 'calendar' },
      { label: 'Ví Edu Connect', href: href('walletOverview'), icon: 'wallet' }
    ]

    const adminMenuItems = [
      { label: 'Tổng quan quản trị', href: href('adminDashboard'), icon: 'dashboard' },
      { label: 'Quản lý nền tảng', href: href('adminManage'), icon: 'settings' }
    ]

    const NAV_LINKS = [
      { key: 'home', label: 'Trang chủ', href: href('home') },
      { key: 'tutors', label: 'Tìm gia sư', href: href('tutorSearch') },
      { key: 'requests', label: 'Tin tìm gia sư', href: href('jobDiscover') }
    ]

    const variants = {
      A: { activeNav: 'none', role: 'learner', logoutLabel: 'Đăng xuất' },
      B: { activeNav: 'tutors', role: 'learner', logoutLabel: 'Đăng xuất' },
      C: { activeNav: 'requests', role: 'learner', logoutLabel: 'Đăng xuất' },
      D: { activeNav: 'none', role: 'learner', logoutLabel: 'Đăng xuất' },
      E: { activeNav: 'none', role: 'learner', logoutLabel: 'Đăng xuất' },
      STUDENT: { activeNav: 'none', role: 'learner', logoutLabel: 'Đăng xuất' },
      TUTOR: { activeNav: 'requests', role: 'tutor', logoutLabel: 'Đăng xuất tài khoản', summary: { title: 'Tài khoản xác thực' } }
    }

    const variantKey = (header.dataset.userVariant || 'A').toUpperCase()
    const variant = variants[variantKey] || variants.A

    /**
     * Danh tính lấy từ persona demo đang đăng nhập (sessionStorage, chỉ trong cùng tab).
     * Đây KHÔNG phải xác thực thật — lọc theo persona chỉ phục vụ preview.
     */
    const sessionPersona = Store ? Store.getSession().persona : null
    const isTutor = sessionPersona ? sessionPersona.role === 'tutor' : variant.role === 'tutor'
    const isAdmin = sessionPersona?.role === 'admin'
    const identity = sessionPersona
      ? { name: sessionPersona.name, initials: sessionPersona.initials, role: sessionPersona.label, verified: Boolean(sessionPersona.verified) }
      : { name: isTutor ? 'Lê Hoàng Yến' : 'Chị Mai Lan', initials: isTutor ? 'LY' : 'ML', role: isTutor ? 'Gia sư Chuyên Toán' : 'Phụ huynh', verified: isTutor }

    const nav = header.querySelector('.user-header__nav')
    const existingLinks = Array.from(header.querySelectorAll('[data-nav-key]'))
    const navLinks = []

    if (nav) {
      NAV_LINKS.forEach(item => {
        const node = existingLinks.find(link => link.dataset.navKey === item.key) || document.createElement('a')
        node.classList.add('user-header__nav-link')
        node.dataset.navKey = item.key
        node.removeAttribute('data-route')
        node.removeAttribute('aria-current')
        node.textContent = item.label
        node.setAttribute('href', item.href)
        navLinks.push(node)
      })
      nav.replaceChildren(...navLinks)
    }

    const currentPath = Route?.pagePath || window.location.pathname.replace(/^.*\/pages\//, 'pages/')
    const activeNav = currentPath.startsWith('pages/')
      ? currentPath === 'pages/home.html' ? 'home'
        : /^pages\/(tutor\/(search|profile)\.html|catalog\/|invitation\/)/.test(currentPath) ? 'tutors'
          : currentPath.startsWith('pages/job/') ? 'requests' : 'none'
      : header.dataset.activeNav || variant.activeNav
    header.dataset.activeNav = activeNav

    navLinks.forEach(link => {
      const isActive = link.dataset.navKey === activeNav && activeNav !== 'none'
      link.classList.toggle('is-active', isActive)
      if (isActive) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    })

    header.classList.toggle('user-header--private', variantKey === 'E')
    header.classList.toggle('user-header--tutor', isTutor)

    const brand = header.querySelector('.user-header__brand')
    if (brand) {
      brand.setAttribute('href', href('home'))
      brand.setAttribute('aria-label', 'Edu Connect - Trang chủ')
    }

    const profileNameElement = header.querySelector('[data-profile-name]')
    const profileInitialsElement = header.querySelector('[data-profile-initials]')
    const profileRole = header.querySelector('[data-profile-role]')
    const profileVerified = header.querySelector('[data-profile-verified]')
    const menuSummary = header.querySelector('[data-menu-summary]')
    const menuSummaryTitle = header.querySelector('[data-menu-summary-title]')
    const menuBalance = header.querySelector('[data-menu-balance]')
    const menuLogoutLabel = header.querySelector('[data-menu-logout-label]')
    const menuSection = header.querySelector('[data-menu-links]')

    const profileName = sessionPersona ? identity.name : header.dataset.profileName || identity.name
    const profileInitials = sessionPersona ? identity.initials : header.dataset.profileInitials || identity.initials
    if (sessionPersona) {
      header.dataset.profileName = identity.name
      header.dataset.profileInitials = identity.initials
      header.dataset.profileRole = identity.role
      header.dataset.userVariant = sessionPersona.headerVariant || (isTutor ? 'TUTOR' : isAdmin ? 'ADMIN' : 'A')
    }

    if (profileNameElement) profileNameElement.textContent = profileName
    if (profileInitialsElement) profileInitialsElement.textContent = profileInitials
    if (profileRole) profileRole.textContent = sessionPersona ? identity.role : header.dataset.profileRole || identity.role

    if (profileVerified) {
      const showVerifiedBadge = Boolean(identity.verified)
      profileVerified.hidden = !showVerifiedBadge
      profileVerified.setAttribute('aria-hidden', String(!showVerifiedBadge))
      if (showVerifiedBadge && Route) profileVerified.setAttribute('src', Route.asset('assets/icons/verified.svg'))
    }

    const menuItemsConfig = isAdmin ? adminMenuItems : isTutor ? tutorMenuItems : learnerMenuItems

    /** Dựng lại toàn bộ mục menu từ registry để mọi trang có cùng danh sách. */
    if (menuSection) {
      const template = menuSection.querySelector('[data-menu-item]')
      const existing = Array.from(menuSection.querySelectorAll('[data-menu-item]'))
      existing.forEach(node => node.remove())

      menuItemsConfig.forEach((itemConfig, index) => {
        let node = template ? template.cloneNode(true) : null
        if (!node) {
          node = document.createElement('a')
          node.className = 'user-header__menu-item'
          node.setAttribute('role', 'menuitem')
          node.innerHTML = '<img class="user-header__menu-item-leading" src="" alt="" data-menu-icon=""><span data-menu-label></span><img class="user-header__menu-item-chevron" src="" alt="">'
        }
        node.dataset.menuItem = String(index)
        node.hidden = false
        node.removeAttribute('aria-hidden')
        node.setAttribute('href', itemConfig.href)
        const labelNode = node.querySelector('[data-menu-label]')
        if (labelNode) labelNode.textContent = itemConfig.label
        const menuIcon = node.querySelector('[data-menu-icon]')
        if (menuIcon) {
          menuIcon.dataset.menuIcon = itemConfig.icon
          menuIcon.setAttribute('src', iconSrc(itemConfig.icon))
          menuIcon.setAttribute('alt', '')
        }
        const chevron = node.querySelector('.user-header__menu-item-chevron')
        if (chevron) chevron.setAttribute('src', iconSrc('chevron-right'))
        menuSection.appendChild(node)
      })

      if (menuSummary) menuSummary.hidden = !isTutor
      if (isTutor && menuSummaryTitle) menuSummaryTitle.textContent = identity.verified ? 'Gia sư đã xác minh' : 'Hồ sơ chờ xác minh'
      if (isTutor && menuBalance && Store) {
        const tutorId = Store.sessionTutorId()
        if (tutorId) {
          const summary = Store.walletSummary(tutorId)
          menuBalance.textContent = Store.formatMoney(summary.availableToUse)
        }
      }
    }

    if (menuLogoutLabel) menuLogoutLabel.textContent = isTutor ? 'Đăng xuất tài khoản' : 'Đăng xuất'

    const logoutIcon = header.querySelector('[data-menu-icon="dang-xuat"], .user-header__menu-item--danger img')
    if (logoutIcon && Route) logoutIcon.setAttribute('src', Route.asset('assets/icons/dang-xuat.svg'))

    const account = header.querySelector('.user-header__account')
    const trigger = header.querySelector('.user-header__profile')
    const menu = header.querySelector('.user-header__menu')
    const chevron = header.querySelector('.user-header__chevron')

    if (chevron && Route) {
      chevron.dataset.iconClosed = Route.asset('assets/icons/mui-ten-xuong.svg')
      chevron.dataset.iconOpen = Route.asset('assets/icons/mui-ten-len.svg')
      chevron.setAttribute('src', Route.asset('assets/icons/mui-ten-xuong.svg'))
    }

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
      trigger.setAttribute('aria-label', nextOpen ? triggerCloseLabel : triggerLabel)
      trigger.classList.toggle('is-open', nextOpen)
      menu.setAttribute('aria-hidden', String(!nextOpen))

      if (chevron) chevron.src = nextOpen ? chevron.dataset.iconOpen : chevron.dataset.iconClosed

      if (nextOpen) {
        menu.hidden = false
        menu.classList.add('is-open')
        if (focusTarget === 'first') menuItems[0]?.focus()
        if (focusTarget === 'last') menuItems[menuItems.length - 1]?.focus()
        return
      }

      menu.classList.remove('is-open')
      closeTimer = window.setTimeout(() => {
        if (!isOpen) menu.hidden = true
      }, prefersReducedMotion ? 0 : 180)
    }

    trigger.addEventListener('click', () => setOpen(!isOpen))

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
      item.addEventListener('click', () => setOpen(false))

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

        if (action === 'logout') {
          setOpen(false)
          if (Store && !Store.logout().ok) {
            window.EduToast?.show({ type: 'error', title: 'Chưa thể đăng xuất', message: 'Không thể cập nhật phiên xem trước. Vui lòng thử lại.' })
            return
          }
          if (Route) Route.go('login')
          else window.location.href = href('login')
        }

        header.dispatchEvent(new CustomEvent('user-header:action', {
          bubbles: true,
          detail: { action }
        }))
      })
    })

    document.addEventListener('click', event => {
      if (!account.contains(event.target)) setOpen(false)
    })

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && isOpen) {
        setOpen(false)
        trigger.focus()
      }
    })

    /** Brand ở footer cũng phải dẫn về trang chủ. */
    document.querySelectorAll('[data-component="user-footer"] .user-footer__brand-link').forEach(node => {
      node.setAttribute('href', href('home'))
      node.setAttribute('aria-label', 'Edu Connect - Trang chủ')
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserHeader, { once: true })
  } else {
    initUserHeader()
  }
})()
