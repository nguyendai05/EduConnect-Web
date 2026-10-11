(() => {
  const Store = window.EduStore
  const Route = window.EduRoute
  const root = document.querySelector('[data-admin-manage-content]')
  if (!Store || !Route || !root) return

  const { ORDER_STATUS, PAYMENT_STATUS, REFUND_STATE, CANCELLATION_STATE, OFFERING_STATUS, OFFERING_TRANSITIONS, CHANNELS } = Store
  const TABS = ['users', 'offerings', 'orders']

  const ACCOUNT_STATE = {
    active: { label: 'Đang hoạt động', badge: 'badge--success' },
    locked: { label: 'Đang khóa', badge: 'badge--warning' },
    disabled: { label: 'Vô hiệu hóa', badge: 'badge--danger' }
  }

  const personaAlert = root.querySelector('[data-am-persona-alert]')
  const tabAlert = root.querySelector('[data-am-tab-alert]')
  const tabsRoot = root.querySelector('[data-am-tabs]')

  const session = Store.getSession()
  if (session.persona.role !== 'admin') {
    personaAlert.textContent = `Phiên demo hiện là “${session.persona.name}” (${session.persona.role}), không phải admin. Trang vẫn hiển thị dữ liệu quản trị để xem trước — đây chỉ là demo access theo persona, không phải phân quyền thật.`
    personaAlert.hidden = false
  }

  const el = (tag, className, textValue) => {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (textValue !== undefined) node.textContent = textValue
    return node
  }
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim()
  const channelLabel = key => (CHANNELS.find(channel => channel.key === key) || { label: key }).label
  const tutorName = id => { const record = Store.tutor(id); return record ? `${record.name} (${id})` : id }
  const learnerName = id => { const record = Store.learner(id); return record ? `${record.name} (${id})` : id }

  /* Tabs theo ?tab= */

  const setPanels = key => {
    TABS.forEach(panelKey => {
      const panel = document.getElementById(`am-panel-${panelKey}`)
      if (panel) panel.hidden = panelKey !== key
    })
  }

  const activateTab = key => {
    tabsRoot.querySelectorAll('[role="tab"]').forEach(tab => {
      const active = tab.dataset.amTab === key
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
    })
    setPanels(key)
  }

  const rawTab = Route.param('tab', 'adminManage', 'users')
  let initialTab = 'users'
  if (TABS.includes(rawTab)) initialTab = rawTab
  else {
    tabAlert.textContent = `Tab "${rawTab}" không hợp lệ. Các tab cho phép: ${TABS.join(', ')}. Đã chuyển về tab Người dùng.`
    tabAlert.hidden = false
  }

  tabsRoot.addEventListener('tabs:change', event => {
    const tab = document.getElementById(event.detail.tabId)
    const key = tab && tab.dataset.amTab ? tab.dataset.amTab : 'users'
    setPanels(key)
    window.history.replaceState(null, '', `${window.location.pathname}?tab=${encodeURIComponent(key)}`)
  })

  /* Người dùng */

  const usersSearch = root.querySelector('[data-am-users-search]')
  const usersRole = root.querySelector('[data-am-users-role]')
  const usersState = root.querySelector('[data-am-users-state]')
  const usersPagination = root.querySelector('[data-am-users-pagination]')
  const userTemplate = document.getElementById('am-user-row-template')

  const allUsers = () => Store.userList().map(user => Object.assign({}, user, { accountState: Store.accountStateOf(user.id) }))

  const filteredUsers = () => {
    const query = normalize(usersSearch.value)
    return allUsers().filter(user => {
      if (usersRole.value !== 'all' && user.role !== usersRole.value) return false
      if (usersState.value !== 'all' && user.accountState !== usersState.value) return false
      if (query && !normalize([user.id, user.name, user.email, user.label].join(' ')).includes(query)) return false
      return true
    })
  }

  const STATE_ACTION_LABELS = { active: 'Mở khóa', locked: 'Khóa tài khoản', disabled: 'Vô hiệu hóa' }

  const renderUserRows = () => {
    const users = filteredUsers()
    const current = Number(usersPagination.dataset.current) || 1
    const size = Number(usersPagination.dataset.pageSize) || 5
    const visible = users.slice((current - 1) * size, current * size)
    const fragment = document.createDocumentFragment()
    visible.forEach(user => {
      const row = userTemplate.content.firstElementChild.cloneNode(true)
      const personaRecord = Store.persona(user.id)
      row.querySelector('[data-am-user-initials]').textContent = personaRecord ? personaRecord.initials : '??'
      row.querySelector('[data-am-user-name]').textContent = user.name
      row.querySelector('[data-am-user-role]').textContent = ({ learner: 'Học viên / Phụ huynh', tutor: 'Gia sư', admin: 'Quản trị' })[user.role] || user.role
      row.querySelector('[data-am-user-id]').textContent = user.id
      row.querySelector('[data-am-user-email]').textContent = user.email
      row.querySelector('[data-am-user-label]').textContent = user.label
      const linksNode = row.querySelector('[data-am-user-links]')
      const linksNote = row.querySelector('[data-am-user-links-note]')
      if (user.tutorId) {
        const tutorRecord = Store.tutor(user.tutorId)
        const link = el('a', undefined, `Gia sư ${user.tutorId}`)
        link.href = Route.page('tutorProfile', { id: user.tutorId })
        linksNode.appendChild(link)
        linksNote.textContent = tutorRecord ? `Hồ sơ: ${tutorRecord.profileStatus}` : ''
      } else if (user.learnerId) {
        linksNode.textContent = `Học viên ${user.learnerId}`
        linksNote.textContent = 'Bản ghi learner trong fixture dùng chung'
      } else {
        linksNode.textContent = 'Tài khoản quản trị'
        linksNote.textContent = 'Không liên kết gia sư/học viên'
      }
      const stateBadge = row.querySelector('[data-am-user-state]')
      const stateConfig = ACCOUNT_STATE[user.accountState] || ACCOUNT_STATE.active
      stateBadge.classList.add(stateConfig.badge)
      stateBadge.textContent = stateConfig.label
      const stateRecord = Store.accountStates().find(item => item.userId === user.id)
      row.querySelector('[data-am-user-state-note]').textContent = stateRecord ? `Lý do: ${stateRecord.reason}` : 'Chưa có thay đổi trạng thái trong phiên demo'

      const actions = row.querySelector('[data-am-user-actions]')
      const detailButton = el('button', 'button button--outline button--small', 'Chi tiết')
      detailButton.type = 'button'
      detailButton.dataset.amUserDetail = user.id
      actions.appendChild(detailButton)
      const targets = user.accountState === 'active' ? ['locked', 'disabled'] : ['active']
      targets.forEach(target => {
        const button = el('button', `button button--small ${target === 'active' ? 'button--secondary' : 'button--danger'}`, target === 'active' && user.accountState === 'disabled' ? 'Kích hoạt lại' : STATE_ACTION_LABELS[target])
        button.type = 'button'
        button.dataset.amUserState = `${user.id}:${target}`
        actions.appendChild(button)
      })
      fragment.appendChild(row)
    })
    root.querySelector('[data-am-users-list]').replaceChildren(fragment)
    root.querySelector('[data-am-users-table]').hidden = users.length === 0
    root.querySelector('[data-am-users-empty]').hidden = users.length !== 0
    root.querySelector('[data-am-users-count]').textContent = `${users.length}/${allUsers().length} người dùng demo`
  }

  const renderUsers = () => {
    usersPagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { total: filteredUsers().length, pageSize: 5, current: Number(usersPagination.dataset.current) || 1 } }))
    renderUserRows()
  }

  usersPagination.addEventListener('pagination:change', renderUserRows)
  usersSearch.addEventListener('input', () => { usersPagination.dataset.current = '1'; renderUsers() })
  usersRole.addEventListener('change', () => { usersPagination.dataset.current = '1'; renderUsers() })
  usersState.addEventListener('change', () => { usersPagination.dataset.current = '1'; renderUsers() })

  /* Đổi trạng thái tài khoản */

  const stateModal = document.getElementById('am-state-modal')
  const stateTargetText = document.querySelector('[data-am-state-target]')
  const stateReason = document.querySelector('[data-am-state-reason]')
  const stateError = document.querySelector('[data-am-state-error]')
  let stateTarget = null

  const openStateModal = (userId, nextState) => {
    const user = allUsers().find(item => item.id === userId)
    if (!user) return
    stateTarget = { userId, nextState }
    stateTargetText.textContent = `${user.name} (${user.id}) · ${ACCOUNT_STATE[user.accountState].label} → ${ACCOUNT_STATE[nextState].label}`
    stateReason.value = ''
    stateError.hidden = true
    stateReason.removeAttribute('aria-invalid')
    window.EduModal.open(stateModal.id, {
      variant: nextState === 'active' ? undefined : 'danger',
      title: `${STATE_ACTION_LABELS[nextState] === 'Khóa tài khoản' ? 'Khóa' : STATE_ACTION_LABELS[nextState]} — ${user.id}`,
      message: nextState === 'active'
        ? 'Khôi phục trạng thái hoạt động cho tài khoản demo. Không đổi role, mật khẩu hay sổ cái.'
        : 'Tài khoản bị thay đổi trạng thái sẽ được ghi lý do trong bản ghi mẫu. Không đổi role, mật khẩu hay sổ cái.',
      confirmText: 'Xác nhận'
    })
  }

  stateModal.addEventListener('modal:confirm', event => {
    if (!stateTarget) { event.preventDefault(); return }
    const reason = stateReason.value.trim()
    if (reason.length < 5 || reason.length > 400) {
      stateError.textContent = reason.length < 5 ? 'Lý do cần tối thiểu 5 ký tự.' : 'Lý do tối đa 400 ký tự.'
      stateError.hidden = false
      stateReason.setAttribute('aria-invalid', 'true')
      event.preventDefault()
      return
    }
    stateError.hidden = true
    stateReason.removeAttribute('aria-invalid')
    const { userId, nextState } = stateTarget
    const result = Store.setAccountState({ userId, accountState: nextState, reason })
    if (result.ok) {
      window.EduToast.show({ type: 'success', title: 'Đã cập nhật trạng thái (demo)', message: `${userId} → ${ACCOUNT_STATE[nextState].label}. Lý do đã lưu vào bản ghi trạng thái mẫu.` })
      stateTarget = null
      renderUsers()
      return
    }
    event.preventDefault()
    if (result.reason === 'duplicated') {
      window.EduToast.show({ type: 'info', title: 'Không tạo bản ghi lặp lại', message: `Thao tác chuyển ${userId} sang ${nextState} đã chạy một lần trong phiên demo này (chống bấm lặp).` })
      return
    }
    if (result.reason === 'storage-failed') {
      window.EduToast.show({ type: 'error', title: 'Không lưu được thay đổi', message: 'sessionStorage không ghi được; trạng thái tài khoản giữ nguyên như trước.' })
      return
    }
    const messages = {
      'already-in-state': `Tài khoản đã ở trạng thái ${ACCOUNT_STATE[nextState] ? ACCOUNT_STATE[nextState].label : nextState}.`,
      'invalid-state': 'Trạng thái đích không hợp lệ.',
      'invalid-reason': 'Lý do cần từ 5 đến 400 ký tự.'
    }
    stateError.textContent = messages[result.reason] || `Không thực hiện được (${result.reason}).`
    stateError.hidden = false
  })

  /* Chi tiết người dùng */

  const openUserDetail = userId => {
    const user = allUsers().find(item => item.id === userId)
    if (!user) return
    const fragment = document.createDocumentFragment()
    const meta = el('dl', 'admin-manage__detail-meta')
    const addMeta = (label, value) => {
      meta.appendChild(el('dt', undefined, label))
      meta.appendChild(el('dd', undefined, value))
    }
    addMeta('Mã persona', user.id)
    addMeta('Tên', user.name)
    addMeta('Vai trò', user.role)
    addMeta('Mô tả', user.label)
    addMeta('Email demo', user.email)
    addMeta('Trạng thái tài khoản', ACCOUNT_STATE[user.accountState].label)
    if (user.tutorId) {
      const tutorRecord = Store.tutor(user.tutorId)
      addMeta('Hồ sơ gia sư', `${user.tutorId} · profileStatus: ${tutorRecord ? tutorRecord.profileStatus : '—'}`)
    }
    if (user.learnerId) addMeta('Bản ghi học viên', user.learnerId)
    const stateRecord = Store.accountStates().find(item => item.userId === user.id)
    if (stateRecord) addMeta('Lần đổi trạng thái gần nhất', `${stateRecord.accountState} · ${Store.formatDate(stateRecord.updatedAt, true)} · lý do: ${stateRecord.reason}`)
    fragment.appendChild(meta)
    fragment.appendChild(el('p', 'admin-manage__detail-note', 'Bản demo không lưu và không hiển thị mật khẩu. Role và sổ cái/ví không thể chỉnh sửa từ trang này.'))
    document.querySelector('[data-am-user-detail]').replaceChildren(fragment)
    window.EduModal.open('am-user-detail-modal', { variant: 'info', title: user.name, message: `${user.id} · ${user.label} · ${ACCOUNT_STATE[user.accountState].label}.` })
  }

  /* Dịch vụ / Lớp */

  const offeringsSearch = root.querySelector('[data-am-offerings-search]')
  const offeringsType = root.querySelector('[data-am-offerings-type]')
  const offeringsStatus = root.querySelector('[data-am-offerings-status]')
  const offeringsPagination = root.querySelector('[data-am-offerings-pagination]')
  const offeringTemplate = document.getElementById('am-offering-row-template')

  const filteredOfferings = () => {
    const query = normalize(offeringsSearch.value)
    return Store.list('offerings').filter(item => {
      if (offeringsType.value !== 'all' && item.type !== offeringsType.value) return false
      if (offeringsStatus.value !== 'all' && item.status !== offeringsStatus.value) return false
      if (query) {
        const tutorRecord = Store.tutor(item.tutorId)
        const haystack = [item.id, item.title, item.subjectLabel, item.gradeLabel, tutorRecord ? tutorRecord.name : '', item.tutorId].join(' ')
        if (!normalize(haystack).includes(query)) return false
      }
      return true
    })
  }

  const ADMIN_TRANSITIONS = {
    publish: { label: 'Duyệt & công khai', danger: false, message: 'Công khai dịch vụ/lớp sau khi duyệt. Chỉ thành công nếu hồ sơ gia sư đã approved (UI gate demo).' },
    reject: { label: 'Từ chối', danger: true, message: 'Từ chối duyệt: gia sư nhận trạng thái rejected và có thể sửa rồi gửi lại.' },
    unpublish: { label: 'Ngừng công khai', danger: false, message: 'Gỡ khỏi catalog công khai, ngừng nhận đăng ký mới; đơn cũ giữ snapshot.' },
    close: { label: 'Đóng', danger: true, message: 'Đóng vĩnh viễn, không nhận đăng ký mới. Đơn/hợp đồng cũ không đổi.' }
  }

  const adminActionsFor = item => {
    const allowed = OFFERING_TRANSITIONS[item.status] || []
    const actions = []
    if (allowed.includes('published')) actions.push('publish')
    if (allowed.includes('rejected')) actions.push('reject')
    if (allowed.includes('unpublished')) actions.push('unpublish')
    if (allowed.includes('closed')) actions.push('close')
    return actions
  }

  const renderOfferingRows = () => {
    const items = filteredOfferings()
    const current = Number(offeringsPagination.dataset.current) || 1
    const size = Number(offeringsPagination.dataset.pageSize) || 5
    const visible = items.slice((current - 1) * size, current * size)
    const fragment = document.createDocumentFragment()
    visible.forEach(item => {
      const row = offeringTemplate.content.firstElementChild.cloneNode(true)
      const status = Store.statusOf(OFFERING_STATUS, item.status)
      const tutorRecord = Store.tutor(item.tutorId)
      row.querySelector('[data-am-offering-title]').textContent = item.title
      row.querySelector('[data-am-offering-id]').textContent = `${item.id} · điều khoản ${item.termsVersion}`
      row.querySelector('[data-am-offering-schedule]').textContent = item.scheduleText || 'Chưa xếp lịch'
      row.querySelector('[data-am-offering-tutor]').textContent = tutorRecord ? tutorRecord.name : item.tutorId
      row.querySelector('[data-am-offering-tutor-state]').textContent = tutorRecord ? `Hồ sơ: ${tutorRecord.profileStatus}` : ''
      row.querySelector('[data-am-offering-type]').textContent = item.type === 'GROUP_CLASS' ? 'Lớp nhóm' : 'Dịch vụ'
      row.querySelector('[data-am-offering-subject]').textContent = `${item.subjectLabel} · ${item.gradeLabel}`
      row.querySelector('[data-am-offering-price]').textContent = Store.formatMoney(item.price)
      row.querySelector('[data-am-offering-unit]').textContent = item.type === 'GROUP_CLASS' ? `${item.unitLabel} · ${item.enrolled}/${item.capacity} học viên` : item.unitLabel
      const statusBadge = row.querySelector('[data-am-offering-status]')
      statusBadge.classList.add(status.badge)
      statusBadge.textContent = status.label
      row.querySelector('[data-am-offering-availability]').textContent = item.availability === 'open' ? 'Còn nhận đăng ký' : 'Ngừng nhận đăng ký'

      const actions = row.querySelector('[data-am-offering-actions]')
      const detailButton = el('button', 'button button--outline button--small', 'Chi tiết')
      detailButton.type = 'button'
      detailButton.dataset.amOfferingDetail = item.id
      actions.appendChild(detailButton)
      adminActionsFor(item).forEach(action => {
        const config = ADMIN_TRANSITIONS[action]
        const button = el('button', `button button--small ${config.danger ? 'button--danger' : action === 'publish' ? 'button--primary' : 'button--secondary'}`, config.label)
        button.type = 'button'
        button.dataset.amTransition = `${item.id}:${action}`
        actions.appendChild(button)
      })
      fragment.appendChild(row)
    })
    root.querySelector('[data-am-offerings-list]').replaceChildren(fragment)
    root.querySelector('[data-am-offerings-table]').hidden = items.length === 0
    root.querySelector('[data-am-offerings-empty]').hidden = items.length !== 0
    const all = Store.list('offerings')
    root.querySelector('[data-am-offerings-count]').textContent = `${items.length}/${all.length} mục trong catalog dùng chung`
  }

  const renderOfferings = () => {
    offeringsPagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { total: filteredOfferings().length, pageSize: 5, current: Number(offeringsPagination.dataset.current) || 1 } }))
    renderOfferingRows()
  }

  offeringsPagination.addEventListener('pagination:change', renderOfferingRows)
  offeringsSearch.addEventListener('input', () => { offeringsPagination.dataset.current = '1'; renderOfferings() })
  offeringsType.addEventListener('change', () => { offeringsPagination.dataset.current = '1'; renderOfferings() })
  offeringsStatus.addEventListener('change', () => { offeringsPagination.dataset.current = '1'; renderOfferings() })

  /* Quyết định duyệt offering */

  const transitionModal = document.getElementById('am-transition-modal')
  let transitionTarget = null

  const openTransition = (offeringId, action) => {
    const item = Store.offering(offeringId)
    const config = ADMIN_TRANSITIONS[action]
    if (!item || !config) return
    transitionTarget = { offeringId, action }
    window.EduModal.open(transitionModal.id, {
      variant: config.danger ? 'danger' : undefined,
      title: `${config.label} — ${item.id}`,
      message: `${config.message} Mục tiêu: “${item.title}” của ${tutorName(item.tutorId)}, hiện ở trạng thái ${Store.statusOf(OFFERING_STATUS, item.status).label}.`,
      confirmText: config.label
    })
  }

  transitionModal.addEventListener('modal:confirm', event => {
    if (!transitionTarget) { event.preventDefault(); return }
    const { offeringId, action } = transitionTarget
    const result = Store.transitionOffering({ offeringId, action, decidedBy: 'admin.educonnect' })
    if (result.ok) {
      window.EduToast.show({ type: 'success', title: 'Đã cập nhật catalog (demo)', message: `${offeringId} → ${Store.statusOf(OFFERING_STATUS, result.data.status).label}. Trang tìm kiếm, trang gia sư và trang này đọc cùng bản ghi.` })
      transitionTarget = null
      renderOfferings()
      return
    }
    event.preventDefault()
    if (result.reason === 'duplicated') {
      window.EduToast.show({ type: 'info', title: 'Không lặp lại quyết định', message: `Quyết định “${action}” cho ${offeringId} đã được ghi một lần trong phiên demo này (chống bấm lặp).` })
      return
    }
    if (result.reason === 'storage-failed') {
      window.EduToast.show({ type: 'error', title: 'Không lưu được thay đổi', message: 'sessionStorage không ghi được; catalog giữ nguyên trạng thái trước đó.' })
      return
    }
    if (result.reason === 'profile-not-approved') {
      const item = Store.offering(offeringId)
      window.EduToast.show({ type: 'error', title: 'Không thể công khai', message: `Hồ sơ gia sư ${item ? item.tutorId : ''} chưa approved. Đây chỉ là UI GATE demo, không phải phân quyền thật.` })
      return
    }
    if (result.reason === 'invalid-transition') {
      window.EduToast.show({ type: 'error', title: 'Chuyển trạng thái không hợp lệ', message: `${result.from} không cho phép thao tác “${action}” theo bảng OFFERING_TRANSITIONS.` })
      return
    }
    window.EduToast.show({ type: 'error', title: 'Không thực hiện được', message: `Lý do: ${result.reason}.` })
  })

  /* Chi tiết offering */

  const openOfferingDetail = offeringId => {
    const item = Store.offering(offeringId)
    if (!item) return
    const status = Store.statusOf(OFFERING_STATUS, item.status)
    const tutorRecord = Store.tutor(item.tutorId)
    const fragment = document.createDocumentFragment()
    const meta = el('dl', 'admin-manage__detail-meta')
    const addMeta = (label, value) => {
      meta.appendChild(el('dt', undefined, label))
      meta.appendChild(el('dd', undefined, value))
    }
    addMeta('Mã', item.id)
    addMeta('Loại', item.type === 'GROUP_CLASS' ? 'Lớp nhóm' : 'Dịch vụ')
    addMeta('Trạng thái', status.label)
    addMeta('Gia sư', tutorRecord ? `${tutorRecord.name} (${item.tutorId}) · hồ sơ ${tutorRecord.profileStatus}` : item.tutorId)
    addMeta('Môn / cấp', `${item.subjectLabel} · ${item.gradeLabel}`)
    addMeta('Buổi / thời lượng', `${item.sessions} buổi × ${item.durationMinutes} phút`)
    addMeta('Giá', `${Store.formatMoney(item.price)} ${item.unitLabel}`)
    addMeta('Hình thức / khu vực', `${item.mode} · ${item.district}`)
    addMeta('Lịch', item.scheduleText || 'Chưa xếp lịch')
    addMeta('Điều khoản', item.termsVersion)
    if (item.type === 'GROUP_CLASS') addMeta('Sức chứa', `${item.enrolled}/${item.capacity} · còn ${Store.seatsLeft(item)} chỗ`)
    if (item.publishedAt) addMeta('Công khai lúc', Store.formatDate(item.publishedAt, true))
    addMeta('Transition cho phép', (OFFERING_TRANSITIONS[item.status] || []).join(', ') || 'không có (trạng thái cuối)')
    fragment.appendChild(meta)
    if (item.description) fragment.appendChild(el('p', 'admin-manage__detail-note', item.description))
    const linkedOrders = Store.list('orders').filter(order => order.items.some(line => line.offeringId === item.id))
    addMeta('Đơn liên quan', linkedOrders.length ? linkedOrders.map(order => order.id).join(', ') : 'chưa có')
    fragment.appendChild(el('p', 'admin-manage__detail-note', 'Giá/điều khoản hiện tại có thể khác snapshot trong đơn cũ — khác biệt này có lý do và được ghi trong từng đơn.'))
    document.querySelector('[data-am-offering-detail]').replaceChildren(fragment)
    window.EduModal.open('am-offering-detail-modal', { variant: 'info', title: item.title, message: `${item.id} · ${status.label} · ${tutorName(item.tutorId)}.` })
  }

  /* Đơn đăng ký */

  const ordersSearch = root.querySelector('[data-am-orders-search]')
  const ordersStatus = root.querySelector('[data-am-orders-status]')
  const ordersChannel = root.querySelector('[data-am-orders-channel]')
  const ordersPagination = root.querySelector('[data-am-orders-pagination]')
  const orderTemplate = document.getElementById('am-order-row-template')

  const filteredOrders = () => {
    const query = normalize(ordersSearch.value)
    return Store.list('orders').filter(order => {
      if (ordersStatus.value !== 'all' && order.status !== ordersStatus.value) return false
      if (ordersChannel.value !== 'all' && order.channel !== ordersChannel.value) return false
      if (query) {
        const item = order.items[0] || {}
        const haystack = [order.id, order.learnerId, order.tutorId, item.offeringTitle, item.tutorName, order.contractId || ''].join(' ')
        if (!normalize(haystack).includes(query)) return false
      }
      return true
    })
  }

  const renderOrderRows = () => {
    const orders = filteredOrders()
    const current = Number(ordersPagination.dataset.current) || 1
    const size = Number(ordersPagination.dataset.pageSize) || 5
    const visible = orders.slice((current - 1) * size, current * size)
    const fragment = document.createDocumentFragment()
    visible.forEach(order => {
      const row = orderTemplate.content.firstElementChild.cloneNode(true)
      const status = Store.statusOf(ORDER_STATUS, order.status)
      const payment = Store.statusOf(PAYMENT_STATUS, order.paymentStatus)
      const item = order.items[0] || {}
      row.querySelector('[data-am-order-id]').textContent = order.id
      row.querySelector('[data-am-order-channel]').textContent = channelLabel(order.channel)
      row.querySelector('[data-am-order-date]').textContent = Store.formatDate(order.createdAt, true)
      row.querySelector('[data-am-order-learner]').textContent = learnerName(order.learnerId)
      row.querySelector('[data-am-order-tutor]').textContent = tutorName(order.tutorId)
      row.querySelector('[data-am-order-item]').textContent = item.offeringTitle || '—'
      row.querySelector('[data-am-order-snapshot]').textContent = `${item.sessions || 0} buổi × ${Store.formatMoney(item.unitPrice || 0)}/buổi (snapshot)`
      row.querySelector('[data-am-order-total]').textContent = Store.formatMoney(order.total)
      row.querySelector('[data-am-order-terms]').textContent = `Điều khoản ${item.termsVersion || '—'}`
      const statusBadge = row.querySelector('[data-am-order-status]')
      statusBadge.classList.add(status.badge)
      statusBadge.textContent = status.label
      row.querySelector('[data-am-order-cancellation]').textContent = order.cancellation && CANCELLATION_STATE[order.cancellation.state] ? CANCELLATION_STATE[order.cancellation.state].label : ''
      const paymentBadge = row.querySelector('[data-am-order-payment]')
      paymentBadge.classList.add(payment.badge)
      paymentBadge.textContent = payment.label
      row.querySelector('[data-am-order-refund]').textContent = order.refund && REFUND_STATE[order.refund.state] ? `Hoàn tiền: ${REFUND_STATE[order.refund.state].label} · ${Store.formatMoney(order.refund.amount)}` : ''
      const contractCell = row.querySelector('[data-am-order-contract]')
      if (order.contractId) {
        const link = el('a', undefined, order.contractId)
        link.href = Route.page('contractStudentDetail', { id: order.contractId })
        link.setAttribute('aria-label', `Xem hợp đồng ${order.contractId} của đơn ${order.id} (trang chi tiết hợp đồng demo)`)
        contractCell.appendChild(link)
      } else {
        contractCell.appendChild(el('span', undefined, 'Chưa có hợp đồng'))
      }
      const actions = row.querySelector('[data-am-order-actions]')
      const detailButton = el('button', 'button button--outline button--small', 'Chi tiết')
      detailButton.type = 'button'
      detailButton.dataset.amOrderDetail = order.id
      actions.appendChild(detailButton)
      fragment.appendChild(row)
    })
    root.querySelector('[data-am-orders-list]').replaceChildren(fragment)
    root.querySelector('[data-am-orders-table]').hidden = orders.length === 0
    root.querySelector('[data-am-orders-empty]').hidden = orders.length !== 0
    const all = Store.list('orders')
    root.querySelector('[data-am-orders-count]').textContent = `${orders.length}/${all.length} đơn · tổng giá trị ${Store.formatMoney(all.reduce((sum, order) => sum + Store.toInteger(order.total), 0))}`
  }

  const renderOrders = () => {
    ordersPagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { total: filteredOrders().length, pageSize: 5, current: Number(ordersPagination.dataset.current) || 1 } }))
    renderOrderRows()
  }

  ordersPagination.addEventListener('pagination:change', renderOrderRows)
  ordersSearch.addEventListener('input', () => { ordersPagination.dataset.current = '1'; renderOrders() })
  ordersStatus.addEventListener('change', () => { ordersPagination.dataset.current = '1'; renderOrders() })
  ordersChannel.addEventListener('change', () => { ordersPagination.dataset.current = '1'; renderOrders() })

  /* Chi tiết đơn */

  const openOrderDetail = orderId => {
    const order = Store.orderById(orderId)
    if (!order) return
    const status = Store.statusOf(ORDER_STATUS, order.status)
    const payment = Store.statusOf(PAYMENT_STATUS, order.paymentStatus)
    const fragment = document.createDocumentFragment()
    const statusLine = el('p', 'admin-manage__detail-status')
    const statusBadge = el('span', `badge ${status.badge}`, status.label)
    const paymentBadge = el('span', `badge ${payment.badge}`, payment.label)
    statusLine.append('Trạng thái đơn: ', statusBadge, ' · Thanh toán: ', paymentBadge)
    fragment.appendChild(statusLine)

    const meta = el('dl', 'admin-manage__detail-meta')
    const addMeta = (label, value) => {
      meta.appendChild(el('dt', undefined, label))
      meta.appendChild(el('dd', undefined, value))
    }
    addMeta('Mã đơn', order.id)
    addMeta('Kênh', channelLabel(order.channel))
    addMeta('Học viên', learnerName(order.learnerId))
    addMeta('Gia sư', tutorName(order.tutorId))
    addMeta('Tạo lúc', Store.formatDate(order.createdAt, true))
    addMeta('Tổng đơn', Store.formatMoney(order.total))
    fragment.appendChild(meta)

    const itemsList = el('ul', 'admin-manage__items')
    order.items.forEach(item => {
      const li = el('li')
      li.appendChild(el('strong', undefined, item.offeringTitle))
      li.appendChild(el('span', undefined, `${item.sessions} buổi × ${Store.formatMoney(item.unitPrice)}/buổi${item.seats > 1 ? ` × ${item.seats} chỗ` : ''} = ${Store.formatMoney(Store.itemTotal(item))} · điều khoản ${item.termsVersion}`))
      li.appendChild(el('span', undefined, `Snapshot: ${item.snapshotReason}`))
      itemsList.appendChild(li)
    })
    fragment.appendChild(itemsList)

    if (order.contractId) {
      const contract = Store.contract(order.contractId)
      const contractLine = el('p')
      const link = el('a', undefined, `Hợp đồng ${order.contractId}`)
      link.href = Route.page('contractStudentDetail', { id: order.contractId })
      contractLine.append(link, el('span', undefined, contract ? ` · ${Store.statusOf(Store.CONTRACT_STATUS, contract.status).label} · ${contract.completedSessions}/${contract.sessions} buổi` : ''))
      fragment.appendChild(contractLine)
    } else {
      fragment.appendChild(el('p', 'admin-manage__detail-note', 'Đơn chưa có hợp đồng — không liên kết tới bản ghi hợp đồng nào khác.'))
    }

    const payments = Store.paymentsByOrder(order.id)
    fragment.appendChild(el('h3', 'admin-manage__detail-heading', `Phiên thanh toán (${payments.length})`))
    if (payments.length) {
      const paymentList = el('ul', 'admin-manage__items')
      payments.forEach(record => {
        const li = el('li')
        li.appendChild(el('strong', undefined, `${record.id} · ${Store.statusOf(PAYMENT_STATUS, record.status).label}`))
        li.appendChild(el('span', undefined, `Tổng ${Store.formatMoney(record.total)} · ví ${Store.formatMoney(record.walletUsed)} · cổng ngoài ${Store.formatMoney(record.payosDue)} · ${record.method} · ${Store.formatDate(record.createdAt, true)}`))
        paymentList.appendChild(li)
      })
      fragment.appendChild(paymentList)
    }

    if (order.cancellation || order.refund) {
      fragment.appendChild(el('h3', 'admin-manage__detail-heading', 'Hủy & hoàn tiền (hai trạng thái riêng)'))
      if (order.cancellation) {
        const cancellation = CANCELLATION_STATE[order.cancellation.state] || { label: order.cancellation.state }
        fragment.appendChild(el('p', 'admin-manage__detail-note', `Yêu cầu hủy: ${cancellation.label} · lý do: ${order.cancellation.reason} · gửi lúc ${Store.formatDate(order.cancellation.requestedAt, true)}.`))
      }
      if (order.refund) {
        const refund = REFUND_STATE[order.refund.state] || { label: order.refund.state }
        fragment.appendChild(el('p', 'admin-manage__detail-note', `Hoàn tiền: ${refund.label} · ${Store.formatMoney(order.refund.amount)}${order.refund.completedAt ? ` · hoàn tất ${Store.formatDate(order.refund.completedAt, true)}` : ''}${order.refund.note ? ` · ${order.refund.note}` : ''}`))
      }
    }

    fragment.appendChild(el('p', 'admin-manage__detail-note', 'Admin không đổi trạng thái đơn trực tiếp từ hộp thoại này; trạng thái chỉ dịch chuyển qua sự kiện nghiệp vụ trong store (thanh toán, hủy, hoàn tiền).'))
    document.querySelector('[data-am-order-detail]').replaceChildren(fragment)
    window.EduModal.open('am-order-detail-modal', { variant: 'info', title: `Đơn ${order.id}`, message: `${status.label} · thanh toán: ${payment.label} · ${learnerName(order.learnerId)}.` })
  }

  /* Ủy quyền sự kiện trong các bảng */

  root.addEventListener('click', event => {
    const userDetailButton = event.target.closest('[data-am-user-detail]')
    if (userDetailButton) { openUserDetail(userDetailButton.dataset.amUserDetail); return }
    const userStateButton = event.target.closest('[data-am-user-state]')
    if (userStateButton) {
      const [userId, nextState] = userStateButton.dataset.amUserState.split(':')
      openStateModal(userId, nextState)
      return
    }
    const offeringDetailButton = event.target.closest('[data-am-offering-detail]')
    if (offeringDetailButton) { openOfferingDetail(offeringDetailButton.dataset.amOfferingDetail); return }
    const transitionButton = event.target.closest('[data-am-transition]')
    if (transitionButton) {
      const [offeringId, action] = transitionButton.dataset.amTransition.split(':')
      openTransition(offeringId, action)
      return
    }
    const orderDetailButton = event.target.closest('[data-am-order-detail]')
    if (orderDetailButton) openOrderDetail(orderDetailButton.dataset.amOrderDetail)
  })

  renderUsers()
  renderOfferings()
  renderOrders()
  activateTab(initialTab)
})()
