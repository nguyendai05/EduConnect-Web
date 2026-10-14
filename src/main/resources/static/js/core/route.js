/** MVC navigation. Context path comes from the server-rendered app-base meta tag. */
(() => {
  const ROUTES = Object.freeze({
    home: { path: '/', shell: 'user', roles: ['public', 'learner', 'tutor', 'admin'] },
    login: { path: '/auth/login', shell: 'auth', roles: ['public'], params: ['state'] },
    register: { path: '/auth/register', shell: 'auth', roles: ['public'] },
    verifyEmail: { path: '/auth/verify-email', shell: 'auth', roles: ['public'], params: ['token'] },
    forgotPassword: { path: '/auth/forgot-password', shell: 'auth', roles: ['public'] },
    resetPassword: { path: '/auth/reset-password', shell: 'auth', roles: ['public'], params: ['token'] },
    profile: { path: '/account/profile', shell: 'user', roles: ['learner', 'tutor'] },
    tutorSearch: { path: '/tutor/search', shell: 'user', roles: ['public', 'learner'] },
    tutorProfile: { path: '/tutor/profile', shell: 'user', roles: ['public', 'learner'], params: ['id'] },
    tutorMyProfile: { path: '/tutor/my-profile', shell: 'user', roles: ['tutor'], params: ['hash'] },
    tutorManage: { path: '/tutor/manage', shell: 'user', roles: ['tutor'], params: ['tab'] },
    invitationCreate: { path: '/invitation/create', shell: 'user', roles: ['learner'], params: ['tutor', 'offering'] },
    invitationNegotiation: { path: '/invitation/negotiation', shell: 'user', roles: ['learner', 'tutor'], params: ['invite'] },
    jobCreate: { path: '/job/create', shell: 'user', roles: ['learner'] },
    jobMyJob: { path: '/job/my-job', shell: 'user', roles: ['learner'] },
    jobDiscover: { path: '/job/discover', shell: 'user', roles: ['tutor'] },
    jobDetail: { path: '/job/detail', shell: 'user', roles: ['public', 'tutor', 'learner'], params: ['id'] },
    jobApplicants: { path: '/job/applicants', shell: 'user', roles: ['learner'], params: ['id'] },
    catalogDetail: { path: '/catalog/detail', shell: 'user', roles: ['public', 'learner'], params: ['id'] },
    cart: { path: '/cart/index', shell: 'user', roles: ['learner'] },
    orderHistory: { path: '/order/history', shell: 'user', roles: ['learner'], params: ['status', 'channel', 'id'] },
    contractConfirm: { path: '/contract/confirm', shell: 'user', roles: ['learner', 'tutor'], params: ['contract', 'order'] },
    contractStudentDetail: { path: '/contract/student-detail', shell: 'user', roles: ['learner'], params: ['id'] },
    contractTutorDetail: { path: '/contract/tutor-detail', shell: 'user', roles: ['tutor'], params: ['id'] },
    paymentCheckout: { path: '/payment/checkout', shell: 'user', roles: ['learner'], params: ['contract', 'from', 'order', 'payment'] },
    paymentQr: { path: '/payment/qr', shell: 'payment-minimal', roles: ['learner'], params: ['contract', 'payment'] },
    paymentResult: { path: '/payment/result', shell: 'user', roles: ['learner'], params: ['status', 'id', 'view', 'payment'] },
    walletOverview: { path: '/wallet/overview', shell: 'user', roles: ['learner', 'tutor'], params: ['hash'] },
    chatMessages: { path: '/chat/messages', shell: 'user', roles: ['learner', 'tutor'], params: ['contract', 'tutor'] },
    adminDashboard: { path: '/admin/dashboard', shell: 'admin', roles: ['admin'] },
    adminManage: { path: '/admin/manage', shell: 'admin', roles: ['admin'], params: ['tab'] },
    adminTutorReviewQueue: { path: '/admin/tutor-review-queue', shell: 'admin', roles: ['admin'], params: ['status'] },
    adminTutorReviewDetail: { path: '/admin/tutor-review-detail', shell: 'admin', roles: ['admin'], params: ['id'] },
    adminJobReviewQueue: { path: '/admin/job-review-queue', shell: 'admin', roles: ['admin'], params: ['status'] },
    adminJobReviewDetail: { path: '/admin/job-review-detail', shell: 'admin', roles: ['admin'], params: ['id'] },
    adminReports: { path: '/admin/reports', shell: 'admin', roles: ['admin'], params: ['status'] },
    adminReportDetail: { path: '/admin/report-detail', shell: 'admin', roles: ['admin'], params: ['id'] },
    adminPayoutRequests: { path: '/admin/payout-requests', shell: 'admin', roles: ['admin'], params: ['status'] },
    adminPayoutRequestDetail: { path: '/admin/payout-request-detail', shell: 'admin', roles: ['admin'], params: ['id'] },
    adminAuditLogs: { path: '/admin/audit-logs', shell: 'admin', roles: ['admin'], params: ['module'] },
    components: { path: '/components', shell: 'none', roles: ['public'] }
  })


  const RETURN_ALLOWLIST = Object.freeze(['contract', 'contract-detail', 'cart', 'order-history'])
  const meta = document.querySelector('meta[name="app-base"]')
  const base = (meta?.content || '').replace(/\/+$/, '')
  const prefix = `${base}/`
  const depth = 0
  const pagePath = decodeURIComponent(window.location.pathname.slice(base.length) || '/')
  const isExternal = value => /^(https?:|mailto:|tel:|data:|blob:|#|javascript:)/i.test(value)
  const local = value => `${base}/${String(value).replace(/^\/+/, '')}`
  // Compatibility helpers: consumers may call these, but MVC URLs are never rewritten in the DOM.
  const normalize = value => value
  const applyScope = (root = document) => root

  const toQuery = params => {
    if (!params) return ''
    const search = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (key === 'hash') return
      const value = params[key]
      if (value === undefined || value === null || value === '') return
      search.append(key, String(value))
    })
    const query = search.toString()
    const hash = params.hash ? `#${encodeURIComponent(String(params.hash)).replace(/^%23/, '')}` : ''
    return `${query ? `?${query}` : ''}${hash}`
  }

  const asset = value => local(value)
  const page = (key, params) => {
    const route = ROUTES[key]
    if (!route) throw new Error(`EduRoute: unknown route "${key}"`)
    return `${local(route.path)}${toQuery(params)}`
  }
  const path = (rawPath, params) => `${local(rawPath)}${toQuery(params)}`
  const absolute = (key, params) => new URL(ROUTES[key] ? page(key, params) : path(key, params), window.location.origin).href
  const allowsParam = (key, name) => Boolean(ROUTES[key]?.params?.includes(name))
  const safeReturn = value => RETURN_ALLOWLIST.includes(typeof value === 'string' ? value.trim() : '') ? value.trim() : null
  const query = () => new URLSearchParams(window.location.search)
  const param = (key, routeKey, fallback = null) => {
    if (routeKey && !allowsParam(routeKey, key)) return fallback
    const value = query().get(key)
    return value === null || value === '' ? fallback : value
  }
  const go = (key, params) => window.location.assign(page(key, params))
  window.EduRoute = Object.freeze({ ROUTES, RETURN_ALLOWLIST, base, pagePath, depth, prefix,
    isExternal, normalize, applyScope, asset, page, path, absolute, allowsParam, safeReturn,
    query, param, go, toQuery })
  // Preserve the former public handle without installing a MutationObserver.
  window.EduRouteObserver = Object.freeze({ disconnect() {} })
})()
