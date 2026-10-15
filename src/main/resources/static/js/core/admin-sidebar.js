/**
 * Chuẩn hoá AdminSidebar dùng chung: mọi trang admin có CÙNG danh sách mục và CÙNG active state.
 * Lý do tồn tại: markup sidebar được inline trong từng trang admin và trước đây mỗi trang
 * tự đánh dấu `is-active`, nên thêm một mục mới chỉ ở một trang sẽ làm lệch điều hướng.
 */
(() => {
  /** Trang chi tiết được coi là đang ở mục hàng đợi cha của nó. */
  const ACTIVE_PARENT = {
    'tutor-review-detail': 'tutor-review-queue',
    'job-review-detail': 'job-review-queue',
    'report-detail': 'reports',
    'payout-request-detail': 'payout-requests'
  }

  const ITEMS = [
    { key: 'adminDashboard', href: 'dashboard', label: 'Tổng quan', icon: 'dashboard.svg' },
    { key: 'adminManage', href: 'manage', label: 'Quản lý nền tảng', icon: 'settings.svg' },
    { key: 'adminTutorReviewQueue', href: 'tutor-review-queue', label: 'Hồ sơ gia sư', icon: 'tutor-verification.svg', count: 'tutors', unit: 'hồ sơ chờ xử lý' },
    { key: 'adminJobReviewQueue', href: 'job-review-queue', label: 'Tin tìm gia sư', icon: 'tutor-search.svg', count: 'jobs', unit: 'tin chờ xử lý' },
    { key: 'adminReports', href: 'reports', label: 'Báo cáo & tranh chấp', icon: 'dispute.svg', count: 'reports', unit: 'báo cáo cần xử lý' },
    { key: 'adminPayoutRequests', href: 'payout-requests', label: 'Yêu cầu rút tiền', icon: 'wallet.svg', count: 'payouts', unit: 'yêu cầu rút tiền chờ xử lý' },
    { key: 'adminAuditLogs', href: 'audit-logs', label: 'Nhật ký hệ thống', icon: 'activity-log.svg' }
  ]

  const summary = () => {
    const Store = window.EduStore
    const profiles = window.EduTutorReview?.list() || []
    const payouts = window.EduPayout?.list().filter(item => item.status === 'pending') || []
    const reports = Store?.list('reports').filter(item => !Store.REPORT_STATE[item.state]?.terminal) || []
    return {
      tutors: profiles.filter(item => item.status === 'pending').length,
      verifiedTutors: profiles.filter(item => item.status === 'verified').length,
      jobs: Store?.jobQueue('pending').length || 0,
      reports: reports.length,
      payouts: payouts.length,
      payoutAmount: payouts.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    }
  }
  window.EduAdminSummary = Object.freeze({ summary })

  const initAdminSidebar = () => {
    const Route = window.EduRoute
    const sidebars = Array.from(document.querySelectorAll('[data-component="admin-sidebar"]'))
    if (!sidebars.length) return

    const currentFile = decodeURIComponent(window.location.pathname.split('/').pop() || '')
    const activeFile = ACTIVE_PARENT[currentFile] || currentFile

    sidebars.forEach(sidebar => {
      const nav = sidebar.querySelector('.admin-sidebar__nav')
      if (!nav) return

      const existing = Array.from(nav.querySelectorAll('.admin-sidebar__item'))
      const template = existing[0]
      if (!template) return
      const ordered = ITEMS.map(required => {
        const node = existing.find(item => (item.getAttribute('href') || '').split(/[?#]/)[0].split('/').pop() === required.href) || template.cloneNode(true)
        node.setAttribute('href', Route ? Route.page(required.key) : `/admin/${required.href}`)
        node.dataset.adminNav = required.key
        const label = node.querySelector('.admin-sidebar__item-label')
        if (label) label.textContent = required.label
        const icon = node.querySelector('.admin-sidebar__icon')
        if (icon) icon.setAttribute('src', Route ? Route.asset(`assets/icons/${required.icon}`) : `../../assets/icons/${required.icon}`)
        const isActive = required.href === activeFile
        node.classList.toggle('is-active', isActive)
        if (isActive) node.setAttribute('aria-current', 'page')
        else node.removeAttribute('aria-current')
        if (required.count) {
          let badge = node.querySelector('.admin-sidebar__badge')
          if (!badge) {
            badge = document.createElement('span')
            badge.className = 'admin-sidebar__badge'
            node.appendChild(badge)
          }
          badge.dataset.adminCount = required.count
        } else node.querySelectorAll('.admin-sidebar__badge').forEach(badge => badge.remove())
        return node
      })
      nav.replaceChildren(...ordered)

      const brand = sidebar.querySelector('.admin-sidebar__brand')
      if (brand) brand.setAttribute('href', Route ? Route.page('adminDashboard') : '/admin/dashboard')
    })

    const syncCounts = () => {
      const values = summary()
      sidebars.forEach(sidebar => ITEMS.filter(item => item.count).forEach(item => {
        const badge = sidebar.querySelector(`[data-admin-count="${item.count}"]`)
        if (!badge) return
        const value = values[item.count]
        badge.textContent = String(value)
        badge.hidden = false
        badge.setAttribute('aria-label', `${value} ${item.unit}`)
      }))
    }
    syncCounts()
    document.addEventListener('edu-store:change', syncCounts)
    window.addEventListener('pageshow', syncCounts)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminSidebar, { once: true })
  } else {
    initAdminSidebar()
  }
})()
