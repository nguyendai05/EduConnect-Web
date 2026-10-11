/**
 * Bộ phân giải đường dẫn và sổ đăng ký tuyến dùng chung cho prototype.
 * Không phải SPA router: mỗi trang vẫn là một file HTML riêng.
 *
 * Lý do tồn tại: `pages/home.html` nằm nông hơn `pages/<module>/<page>.html` một cấp,
 * nên cùng một markup shell không thể hard-code `../../`. Module này suy ra gốc
 * prototype từ chính thẻ <script> đang nạp rồi chuẩn hoá mọi href/src cục bộ.
 */
(() => {
  const LOCAL_ROOTS = ['assets', 'css', 'js', 'pages', 'components']
  const ROUTE_MARKER = 'js/core/route.js'

  /** Danh sách tuyến của 40 trang sản phẩm. Dùng để sinh link và kiểm tra tĩnh. */
  const ROUTES = Object.freeze({
    home: { path: 'pages/home.html', shell: 'user', roles: ['public', 'learner', 'tutor', 'admin'] },
    login: { path: 'pages/auth/login.html', shell: 'auth', roles: ['public'], params: ['state'] },
    register: { path: 'pages/auth/register.html', shell: 'auth', roles: ['public'] },
    verifyEmail: { path: 'pages/auth/verify-email.html', shell: 'auth', roles: ['public'], params: ['token'] },
    forgotPassword: { path: 'pages/auth/forgot-password.html', shell: 'auth', roles: ['public'] },
    resetPassword: { path: 'pages/auth/reset-password.html', shell: 'auth', roles: ['public'], params: ['token'] },
    profile: { path: 'pages/account/profile.html', shell: 'user', roles: ['learner', 'tutor'] },
    tutorSearch: { path: 'pages/tutor/search.html', shell: 'user', roles: ['public', 'learner'] },
    tutorProfile: { path: 'pages/tutor/profile.html', shell: 'user', roles: ['public', 'learner'], params: ['id'] },
    tutorMyProfile: { path: 'pages/tutor/my-profile.html', shell: 'user', roles: ['tutor'], params: ['hash'] },
    tutorManage: { path: 'pages/tutor/manage.html', shell: 'user', roles: ['tutor'], params: ['tab'] },
    invitationCreate: { path: 'pages/invitation/create.html', shell: 'user', roles: ['learner'], params: ['tutor', 'offering'] },
    invitationNegotiation: { path: 'pages/invitation/negotiation.html', shell: 'user', roles: ['learner', 'tutor'], params: ['invite'] },
    jobCreate: { path: 'pages/job/create.html', shell: 'user', roles: ['learner'] },
    jobMyJob: { path: 'pages/job/my-job.html', shell: 'user', roles: ['learner'] },
    jobDiscover: { path: 'pages/job/discover.html', shell: 'user', roles: ['tutor'] },
    jobDetail: { path: 'pages/job/detail.html', shell: 'user', roles: ['public', 'tutor', 'learner'], params: ['id'] },
    jobApplicants: { path: 'pages/job/applicants.html', shell: 'user', roles: ['learner'], params: ['id'] },
    catalogDetail: { path: 'pages/catalog/detail.html', shell: 'user', roles: ['public', 'learner'], params: ['id'] },
    cart: { path: 'pages/cart/index.html', shell: 'user', roles: ['learner'] },
    orderHistory: { path: 'pages/order/history.html', shell: 'user', roles: ['learner'], params: ['status', 'channel', 'id'] },
    contractConfirm: { path: 'pages/contract/confirm.html', shell: 'user', roles: ['learner', 'tutor'], params: ['contract', 'order'] },
    contractStudentDetail: { path: 'pages/contract/student-detail.html', shell: 'user', roles: ['learner'], params: ['id'] },
    contractTutorDetail: { path: 'pages/contract/tutor-detail.html', shell: 'user', roles: ['tutor'], params: ['id'] },
    paymentCheckout: { path: 'pages/payment/checkout.html', shell: 'user', roles: ['learner'], params: ['contract', 'from', 'order', 'payment'] },
    paymentQr: { path: 'pages/payment/qr.html', shell: 'user', roles: ['learner'], params: ['contract', 'payment'] },
    paymentResult: { path: 'pages/payment/result.html', shell: 'user', roles: ['learner'], params: ['status', 'id', 'view', 'payment'] },
    walletOverview: { path: 'pages/wallet/overview.html', shell: 'user', roles: ['learner', 'tutor'], params: ['hash'] },
    chatMessages: { path: 'pages/chat/messages.html', shell: 'user', roles: ['learner', 'tutor'], params: ['contract', 'tutor'] },
    adminDashboard: { path: 'pages/admin/dashboard.html', shell: 'admin', roles: ['admin'] },
    adminManage: { path: 'pages/admin/manage.html', shell: 'admin', roles: ['admin'], params: ['tab'] },
    adminTutorReviewQueue: { path: 'pages/admin/tutor-review-queue.html', shell: 'admin', roles: ['admin'], params: ['status'] },
    adminTutorReviewDetail: { path: 'pages/admin/tutor-review-detail.html', shell: 'admin', roles: ['admin'], params: ['id'] },
    adminJobReviewQueue: { path: 'pages/admin/job-review-queue.html', shell: 'admin', roles: ['admin'], params: ['status'] },
    adminJobReviewDetail: { path: 'pages/admin/job-review-detail.html', shell: 'admin', roles: ['admin'], params: ['id'] },
    adminReports: { path: 'pages/admin/reports.html', shell: 'admin', roles: ['admin'], params: ['status'] },
    adminReportDetail: { path: 'pages/admin/report-detail.html', shell: 'admin', roles: ['admin'], params: ['id'] },
    adminPayoutRequests: { path: 'pages/admin/payout-requests.html', shell: 'admin', roles: ['admin'], params: ['status'] },
    adminPayoutRequestDetail: { path: 'pages/admin/payout-request-detail.html', shell: 'admin', roles: ['admin'], params: ['id'] },
    adminAuditLogs: { path: 'pages/admin/audit-logs.html', shell: 'admin', roles: ['admin'], params: ['module'] },
    components: { path: 'components/index.html', shell: 'none', roles: ['public'] }
  })

  /** Các giá trị `from` được phép ở trang thanh toán. Không nhận đường dẫn tuỳ ý. */
  const RETURN_ALLOWLIST = Object.freeze(['contract', 'contract-detail', 'cart', 'order-history'])

  const scriptTag = Array.from(document.querySelectorAll('script[src]'))
    .find(el => el.getAttribute('src').replace(/\\/g, '/').endsWith(ROUTE_MARKER))

  const scriptSrc = scriptTag ? scriptTag.src : null

  /** Gốc tuyệt đối của thư mục ui-prototype, ví dụ http://host/ui-prototype/ */
  const base = scriptSrc ? scriptSrc.slice(0, scriptSrc.lastIndexOf(ROUTE_MARKER)) : null

  /** Đường dẫn trang hiện tại tính từ gốc prototype, ví dụ pages/home.html */
  const pagePath = (() => {
    if (!base) return null
    const href = window.location.href
    return href.startsWith(base) ? decodeURIComponent(href.slice(base.length).split('?')[0].split('#')[0]) : null
  })()

  /** Số cấp `../` cần thiết để về gốc prototype từ trang hiện tại. */
  const depth = pagePath ? Math.max(0, pagePath.split('/').length - 1) : 2
  const prefix = '../'.repeat(depth)

  const isExternal = value => /^(https?:|mailto:|tel:|data:|blob:|#|javascript:)/i.test(value)

  /** Tách phần đường dẫn cục bộ khỏi tiền tố `../` lặp, giữ query/anchor. */
  const splitLocal = value => {
    const match = /^((?:\.\.\/)+)((?:[^/?#]+))(.*$)/.exec(value)
    if (!match) return null
    const root = LOCAL_ROOTS.find(name => match[2] === name || match[2].startsWith(`${name}/`))
    if (!root) return null
    return { local: match[2], suffix: match[3] }
  }

  /** Chuẩn hoá một href/src cục bộ về đúng độ sâu của trang hiện tại. */
  const normalize = value => {
    if (typeof value !== 'string' || !value) return value
    const parts = splitLocal(value.trim())
    return parts ? `${prefix}${parts.local}${parts.suffix}` : value
  }

  const ATTRIBUTES = ['href', 'src']

  /** Chuẩn hoá mọi href/src cục bộ trong một gốc DOM. Idempotent. */
  const applyScope = (root = document) => {
    if (!root || !root.querySelectorAll) return root
    ATTRIBUTES.forEach(attribute => {
      const nodes = Array.from(root.querySelectorAll(`[${attribute}]`))
      if (root.nodeType === 1 && root.hasAttribute && root.hasAttribute(attribute)) nodes.push(root)
      nodes.forEach(node => {
        const current = node.getAttribute(attribute)
        const next = normalize(current)
        if (next !== current) node.setAttribute(attribute, next)
      })
    })
    return root
  }

  /** Sinh query string đã encode; bỏ qua giá trị rỗng/null/undefined. */
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

  /** Link tương đối tới một tài nguyên cục bộ, ví dụ asset('assets/icons/star.svg'). */
  const asset = path => `${prefix}${String(path).replace(/^\/+/, '')}`

  /** Link tương đối tới một trang theo key trong ROUTES. */
  const page = (key, params) => {
    const route = ROUTES[key]
    if (!route) throw new Error(`EduRoute: không có tuyến "${key}" trong sổ đăng ký`)
    return `${prefix}${route.path}${toQuery(params)}`
  }

  /** Link tương đối tới một đường dẫn trang thô, dùng khi key chưa có trong ROUTES. */
  const path = (rawPath, params) => `${prefix}${String(rawPath).replace(/^\/+/, '')}${toQuery(params)}`

  /** URL tuyệt đối, dùng cho window.location hoặc kiểm tra trong QA. */
  const absolute = (key, params) => {
    const route = ROUTES[key]
    const target = route ? route.path : String(key)
    return base ? `${base}${target}${toQuery(params)}` : `${prefix}${target}${toQuery(params)}`
  }

  /** Kiểm tra một key tuyến có cho phép tham số này không. */
  const allowsParam = (key, name) => {
    const route = ROUTES[key]
    return Boolean(route && Array.isArray(route.params) && route.params.includes(name))
  }

  /** Giá trị `from` hợp lệ hoặc null. Ngăn open redirect. */
  const safeReturn = value => {
    const raw = typeof value === 'string' ? value.trim() : ''
    return RETURN_ALLOWLIST.includes(raw) ? raw : null
  }

  /** Đọc tham số hiện tại, chỉ nhận khi nằm trong danh sách cho phép của tuyến. */
  const query = () => new URLSearchParams(window.location.search)

  const param = (key, routeKey, fallback = null) => {
    if (routeKey && !allowsParam(routeKey, key)) return fallback
    const value = query().get(key)
    return value === null || value === '' ? fallback : value
  }

  /** Điều hướng nội bộ. Chỉ chấp nhận key đã đăng ký để tránh redirect tuỳ ý. */
  const go = (key, params) => {
    window.location.assign(page(key, params))
  }

  const api = Object.freeze({
    ROUTES,
    RETURN_ALLOWLIST,
    base,
    pagePath,
    depth,
    prefix,
    isExternal,
    normalize,
    applyScope,
    asset,
    page,
    path,
    absolute,
    allowsParam,
    safeReturn,
    query,
    param,
    go,
    toQuery
  })

  window.EduRoute = api

  applyScope(document)

  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === 1) applyScope(node)
    }))
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
  window.EduRouteObserver = observer
})()
