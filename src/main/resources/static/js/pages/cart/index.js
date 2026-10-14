/**
 * Giỏ đăng ký học: thêm/sửa lựa chọn/sửa số chỗ/xóa/tổng/checkout.
 * Tổng luôn đọc từ EduStore.cartTotal(), không hard-code.
 * GIẢ ĐỊNH DEMO: mỗi item mang `seats` = số học viên/chỗ; SERVICE mặc định 1,
 * không mặc định mọi dịch vụ đều có quantity như hàng hóa.
 * Checkout chỉ điều hướng khi result.ok === true; bấm lặp không tạo hai đơn nhờ idempotency key.
 */
(() => {
  const page = document.querySelector('[data-cart-page]')
  if (!page || !window.EduRoute || !window.EduStore) return

  const route = window.EduRoute
  const store = window.EduStore
  const toast = window.EduToast
  const modal = window.EduModal

  const layoutEl = page.querySelector('[data-cart-layout]')
  const listEl = page.querySelector('[data-cart-list]')
  const emptyEl = page.querySelector('[data-cart-empty]')
  const linesEl = page.querySelector('[data-cart-lines]')
  const seatsCountEl = page.querySelector('[data-cart-seats-count]')
  const totalEl = page.querySelector('[data-cart-total]')
  const learnerRowEl = page.querySelector('[data-cart-learner-row]')
  const learnerEl = page.querySelector('[data-cart-learner]')
  const learnerAlertEl = page.querySelector('[data-cart-learner-alert]')
  const issuesEl = page.querySelector('[data-checkout-issues]')
  const checkoutButton = page.querySelector('[data-checkout]')
  const clearButton = page.querySelector('[data-clear-cart]')
  const clearModal = document.getElementById('clear-cart-modal')

  let pendingIdempotencyKey = null
  let checkoutInFlight = false

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    if (event.detail?.action === 'logout') return
    toast?.show({ type: 'info', title: 'Thông báo', message: 'Tính năng chưa sẵn sàng.' })
  })

  const ITEM_TEMPLATE = `
<article class="card cart-item" data-cart-item>
  <div class="cart-item__body">
    <header class="cart-item__header">
      <div class="cart-item__heading">
        <h2 class="cart-item__title" data-item-title></h2>
        <p class="cart-item__meta"><span data-item-offering-id></span> <span aria-hidden="true">·</span> <span data-item-type></span></p>
      </div>
      <a class="cart-item__link" data-item-detail>Xem chi tiết</a>
    </header>
    <dl class="cart-item__info">
      <div class="info-row"><dt class="info-row__label">Gia sư</dt><dd class="info-row__value" data-item-tutor></dd></div>
      <div class="info-row"><dt class="info-row__label">Lịch học</dt><dd class="info-row__value" data-item-schedule></dd></div>
      <div class="info-row"><dt class="info-row__label">Số buổi × thời lượng</dt><dd class="info-row__value" data-item-sessions></dd></div>
      <div class="info-row"><dt class="info-row__label">Học phí</dt><dd class="info-row__value" data-item-price></dd></div>
      <div class="info-row"><dt class="info-row__label">Lựa chọn</dt><dd class="info-row__value" data-item-selection></dd></div>
      <div class="info-row"><dt class="info-row__label">Điều khoản</dt><dd class="info-row__value" data-item-terms></dd></div>
    </dl>
    <div class="cart-item__controls">
      <div class="cart-item__options" data-item-options hidden></div>
      <div class="cart-item__seats" data-item-seats hidden>
        <label class="cart-seats__label" data-seats-label>Số chỗ đăng ký</label>
        <span class="cart-seats__row">
          <span class="input-control cart-seats__control" data-seats-control>
            <input class="input-control__input" type="number" min="1" step="1" inputmode="numeric" data-seats-input>
          </span>
          <span class="cart-seats__hint" data-seats-hint></span>
        </span>
        <span class="cart-seats__error" data-seats-error hidden></span>
      </div>
      <p class="cart-item__seats-fixed" data-seats-fixed hidden></p>
    </div>
  </div>
  <footer class="cart-item__footer">
    <p class="cart-item__total">Tạm tính <strong data-item-total></strong></p>
    <button class="button button--ghost button--medium cart-item__remove" type="button" data-item-remove>Xóa khỏi giỏ</button>
  </footer>
</article>`

  const selectionLabel = item => {
    const source = store.offering(item.offeringId)
    const entries = Object.entries(item.selection || {})
    if (!entries.length) return 'Không có lựa chọn thêm'
    return entries.map(([key, valueId]) => {
      const option = (source?.options || []).find(entry => entry.key === key)
      const value = option?.values.find(entry => entry.id === valueId)
      return `${option ? option.label : key}: ${value ? value.label : valueId}`
    }).join('; ')
  }

  const fillItemNode = (card, item) => {
    const source = store.offering(item.offeringId)
    const seatsLeft = source ? store.seatsLeft(source) : null
    card.querySelector('[data-item-title]').textContent = item.offeringTitle
    card.querySelector('[data-item-offering-id]').textContent = item.offeringId
    card.querySelector('[data-item-type]').textContent = item.offeringType === 'GROUP_CLASS' ? 'Lớp nhóm' : 'Dịch vụ 1 kèm 1'
    card.querySelector('[data-item-detail]').setAttribute('href', route.page('catalogDetail', { id: item.offeringId }))
    card.querySelector('[data-item-tutor]').textContent = `${item.tutorName} (${item.tutorId})`
    card.querySelector('[data-item-schedule]').textContent = item.scheduleText || 'Chưa xếp lịch'
    card.querySelector('[data-item-sessions]').textContent = `${store.formatNumber(item.sessions)} buổi × ${store.formatNumber(item.durationMinutes)} phút`
    card.querySelector('[data-item-price]').textContent = `${store.formatMoney(item.unitPrice)} ${item.unitLabel || (item.unit === 'per-session' ? '/buổi' : '/trọn gói')}`
    card.querySelector('[data-item-selection]').textContent = selectionLabel(item)
    card.querySelector('[data-item-terms]').textContent = item.termsVersion
    card.querySelector('[data-item-total]').textContent = store.formatMoney(store.itemTotal(item))

    const optionsContainer = card.querySelector('[data-item-options]')
    optionsContainer.replaceChildren()
    const options = source?.options || []
    if (item.offeringType === 'SERVICE' && options.length) {
      optionsContainer.hidden = false
      options.forEach(option => {
        const fieldset = document.createElement('fieldset')
        fieldset.className = 'radio-field cart-item__field'
        const legend = document.createElement('legend')
        legend.textContent = option.label
        fieldset.append(legend)
        const chosen = (item.selection || {})[option.key] || option.values[0]?.id || null
        ;(option.values || []).forEach(value => {
          const label = document.createElement('label')
          label.className = chosen === value.id ? 'radio-option radio-option--selected' : 'radio-option'
          const hit = document.createElement('span')
          hit.className = 'radio-hit-area'
          const input = document.createElement('input')
          input.type = 'radio'
          input.name = `cart-option-${item.offeringId}-${option.key}`
          input.value = value.id
          input.dataset.optionKey = option.key
          input.checked = chosen === value.id
          const circle = document.createElement('span')
          circle.className = 'radio-circle'
          circle.setAttribute('aria-hidden', 'true')
          hit.append(input, circle)
          const caption = document.createElement('span')
          const delta = Number(value.delta || 0)
          caption.textContent = delta
            ? `${value.label} (${delta > 0 ? '+' : '−'}${store.formatMoney(Math.abs(delta))})`
            : value.label
          label.append(hit, caption)
          fieldset.append(label)
        })
        optionsContainer.append(fieldset)
      })
    } else {
      optionsContainer.hidden = true
    }

    const seatsBlock = card.querySelector('[data-item-seats]')
    const seatsFixed = card.querySelector('[data-seats-fixed]')
    const seatsInput = card.querySelector('[data-seats-input]')
    if (item.offeringType === 'GROUP_CLASS') {
      seatsBlock.hidden = false
      seatsFixed.hidden = true
      const inputId = `cart-seats-${item.offeringId}`
      const hintId = `${inputId}-hint`
      const errorId = `${inputId}-error`
      seatsInput.id = inputId
      seatsInput.value = String(item.seats || 1)
      if (seatsLeft !== null) seatsInput.max = String(Math.max(1, seatsLeft))
      seatsInput.setAttribute('aria-describedby', `${hintId} ${errorId}`)
      const hint = card.querySelector('[data-seats-hint]')
      hint.id = hintId
      hint.textContent = seatsLeft !== null ? `Còn ${seatsLeft} chỗ — số chỗ = số học viên đăng ký` : 'Số chỗ = số học viên đăng ký'
      card.querySelector('[data-seats-error]').id = errorId
      const seatsLabel = card.querySelector('[data-seats-label]')
      seatsLabel.id = `${inputId}-label`
      seatsLabel.setAttribute('for', inputId)
    } else {
      seatsBlock.hidden = true
      seatsFixed.hidden = false
      seatsFixed.textContent = `Số chỗ: ${item.seats || 1} — dịch vụ 1 kèm 1 mặc định một học viên, không dùng số lượng như hàng hóa.`
    }
  }

  const buildItemNode = item => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = ITEM_TEMPLATE
    const card = wrapper.firstElementChild
    card.dataset.offeringId = item.offeringId
    fillItemNode(card, item)
    return card
  }

  const refreshSummary = () => {
    const items = store.cartItems()
    linesEl.textContent = store.formatNumber(items.length)
    seatsCountEl.textContent = store.formatNumber(store.cartCount())
    totalEl.textContent = store.formatMoney(store.cartTotal())
    const learnerId = store.sessionLearnerId(store.getSession().personaId)
    const learner = learnerId ? store.learner(learnerId) : null
    if (learner) {
      learnerRowEl.hidden = false
      learnerAlertEl.hidden = true
      learnerEl.textContent = `${learner.name} — học viên ${learner.studentName} (${learner.id})`
      checkoutButton.disabled = false
    } else {
      learnerRowEl.hidden = true
      learnerAlertEl.hidden = false
      learnerEl.textContent = '—'
      checkoutButton.disabled = true
    }
  }

  const hideIssues = () => {
    issuesEl.replaceChildren()
    issuesEl.hidden = true
  }

  const renderAll = () => {
    const items = store.cartItems()
    listEl.replaceChildren(...items.map(buildItemNode))
    const hasItems = items.length > 0
    layoutEl.hidden = !hasItems
    emptyEl.hidden = hasItems
    clearButton.disabled = !hasItems
    hideIssues()
    if (hasItems) refreshSummary()
  }

  const setSeatsError = (card, message) => {
    const input = card.querySelector('[data-seats-input]')
    const control = card.querySelector('[data-seats-control]')
    const error = card.querySelector('[data-seats-error]')
    input.setAttribute('aria-invalid', 'true')
    control.classList.add('is-error')
    error.textContent = message
    error.hidden = false
  }

  const clearSeatsError = card => {
    const input = card.querySelector('[data-seats-input]')
    const control = card.querySelector('[data-seats-control]')
    const error = card.querySelector('[data-seats-error]')
    input.removeAttribute('aria-invalid')
    control.classList.remove('is-error')
    error.hidden = true
  }

  const findCartItem = offeringId => store.cartItems().find(item => item.offeringId === offeringId) || null

  const applyOptionChange = (card, input) => {
    const offeringId = card.dataset.offeringId
    const item = findCartItem(offeringId)
    if (!item) return
    const selection = Object.assign({}, item.selection, { [input.dataset.optionKey]: input.value })
    const rebuilt = store.buildCartItem(offeringId, { selection, seats: item.seats, learnerRef: item.learnerRef })
    if (!rebuilt.ok) {
      toast?.show({ type: 'error', title: 'Không cập nhật được lựa chọn', message: 'Dịch vụ/lớp không còn nhận đăng ký với lựa chọn này.' })
      renderAll()
      return
    }
    const updated = store.cartUpdate(offeringId, {
      selection,
      unitPrice: rebuilt.item.unitPrice,
      priceVersion: rebuilt.item.priceVersion,
      termsVersion: rebuilt.item.termsVersion
    })
    if (!updated.ok) {
      toast?.show({ type: 'error', title: 'Không lưu được thay đổi', message: 'Storage thất bại, lựa chọn cũ được giữ nguyên.' })
      renderAll()
      return
    }
    card.querySelectorAll(`input[data-option-key="${input.dataset.optionKey}"]`).forEach(entry => {
      entry.closest('.radio-option')?.classList.toggle('radio-option--selected', entry.checked)
    })
    fillItemNode(card, updated.item)
    refreshSummary()
    hideIssues()
  }

  const applySeatsChange = (card, input) => {
    const offeringId = card.dataset.offeringId
    const item = findCartItem(offeringId)
    if (!item) return
    const source = store.offering(offeringId)
    const seatsLeft = source ? store.seatsLeft(source) : null
    const requested = Math.floor(Number(input.value))
    if (!Number.isFinite(requested) || requested < 1 || (seatsLeft !== null && requested > seatsLeft)) {
      setSeatsError(card, `Số chỗ phải từ 1 đến ${seatsLeft !== null ? seatsLeft : '—'} theo dữ liệu mẫu hiện tại.`)
      input.value = String(item.seats || 1)
      return
    }
    const updated = store.cartUpdate(offeringId, { seats: requested })
    if (!updated.ok) {
      if (updated.reason === 'not-enough-seats') setSeatsError(card, `Chỉ còn ${updated.seatsLeft} chỗ cho lớp này.`)
      else toast?.show({ type: 'error', title: 'Không lưu được thay đổi', message: 'Storage thất bại, số chỗ cũ được giữ nguyên.' })
      input.value = String(item.seats || 1)
      return
    }
    clearSeatsError(card)
    fillItemNode(card, updated.item)
    refreshSummary()
    hideIssues()
  }

  listEl.addEventListener('change', event => {
    const card = event.target.closest('[data-cart-item]')
    if (!card) return
    if (event.target.matches('input[type="radio"][data-option-key]')) applyOptionChange(card, event.target)
    else if (event.target.matches('[data-seats-input]')) applySeatsChange(card, event.target)
  })

  listEl.addEventListener('click', event => {
    const removeButton = event.target.closest('[data-item-remove]')
    if (!removeButton) return
    const card = removeButton.closest('[data-cart-item]')
    const offeringId = card?.dataset.offeringId
    const item = findCartItem(offeringId)
    const result = store.cartRemove(offeringId)
    if (!result.ok) {
      toast?.show({ type: 'error', title: 'Không xóa được dòng này', message: 'Storage thất bại, giỏ được giữ nguyên.' })
      return
    }
    renderAll()
    toast?.show({ type: 'info', title: 'Đã xóa khỏi giỏ', message: item ? item.offeringTitle : offeringId })
  })

  const ISSUE_ACTIONS = {
    'stale-price': { label: 'Cập nhật lựa chọn', action: 'refresh' },
    'not-enough-seats': { label: 'Chọn lại số chỗ', action: 'focus-seats' },
    closed: { label: 'Xóa khỏi giỏ', action: 'remove' },
    'not-published': { label: 'Xóa khỏi giỏ', action: 'remove' },
    'unknown-offering': { label: 'Xóa khỏi giỏ', action: 'remove' }
  }

  const renderIssues = issues => {
    issuesEl.replaceChildren()
    issues.forEach(issue => {
      const alert = document.createElement('div')
      alert.className = 'alert alert--error cart-issue'
      alert.setAttribute('role', 'alert')
      const icon = document.createElement('span')
      icon.className = 'alert__icon'
      icon.setAttribute('aria-hidden', 'true')
      const content = document.createElement('div')
      content.className = 'alert__content'
      const title = document.createElement('h3')
      title.className = 'alert__title'
      title.textContent = issue.code === 'stale-price'
        ? 'Giá/điều khoản đã thay đổi'
        : 'Dòng không đủ điều kiện đăng ký'
      const message = document.createElement('p')
      message.className = 'alert__message'
      message.textContent = issue.message
      content.append(title, message)
      const config = ISSUE_ACTIONS[issue.code]
      if (config) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'button button--outline button--small cart-issue__action'
        button.textContent = config.label
        button.dataset.issueAction = config.action
        button.dataset.offeringId = issue.offeringId
        content.append(button)
      }
      alert.append(icon, content)
      issuesEl.append(alert)
    })
    issuesEl.hidden = false
  }

  const refreshStaleItem = offeringId => {
    const item = findCartItem(offeringId)
    if (!item) return
    const rebuilt = store.buildCartItem(offeringId, { selection: item.selection, seats: item.seats, learnerRef: item.learnerRef })
    if (!rebuilt.ok) {
      toast?.show({ type: 'error', title: 'Không cập nhật được', message: 'Dịch vụ/lớp không còn nhận đăng ký, hãy xóa dòng này khỏi giỏ.' })
      return
    }
    const updated = store.cartUpdate(offeringId, {
      unitPrice: rebuilt.item.unitPrice,
      priceVersion: rebuilt.item.priceVersion,
      termsVersion: rebuilt.item.termsVersion,
      selection: rebuilt.item.selection,
      seats: rebuilt.item.seats
    })
    if (!updated.ok) {
      toast?.show({ type: 'error', title: 'Không lưu được cập nhật', message: 'Storage thất bại, giá cũ được giữ nguyên.' })
      return
    }
    renderAll()
    toast?.show({ type: 'success', title: 'Đã cập nhật', message: 'Giá và điều khoản mới nhất đã được áp dụng cho dòng này.' })
  }

  issuesEl.addEventListener('click', event => {
    const button = event.target.closest('[data-issue-action]')
    if (!button) return
    const offeringId = button.dataset.offeringId
    if (button.dataset.issueAction === 'refresh') {
      refreshStaleItem(offeringId)
      return
    }
    if (button.dataset.issueAction === 'focus-seats') {
      const card = listEl.querySelector(`[data-cart-item][data-offering-id="${CSS.escape(offeringId)}"]`)
      const input = card?.querySelector('[data-seats-input]')
      if (input) {
        input.scrollIntoView({ block: 'center' })
        input.focus()
      }
      return
    }
    if (button.dataset.issueAction === 'remove') {
      const result = store.cartRemove(offeringId)
      if (!result.ok) {
        toast?.show({ type: 'error', title: 'Không xóa được dòng này', message: 'Storage thất bại, giỏ được giữ nguyên.' })
        return
      }
      renderAll()
      toast?.show({ type: 'info', title: 'Đã xóa khỏi giỏ', message: offeringId })
    }
  })

  checkoutButton.addEventListener('click', () => {
    if (checkoutInFlight) return
    const validation = store.validateCartForCheckout()
    if (!validation.ok) {
      renderIssues(validation.issues)
      toast?.show({ type: 'error', title: 'Giỏ chưa hợp lệ', message: 'Hãy xử lý từng dòng được đánh dấu trước khi đăng ký. Giá thay đổi sẽ không được tự cập nhật.' })
      return
    }
    const learnerId = store.sessionLearnerId(store.getSession().personaId)
    if (!learnerId) {
      toast?.show({ type: 'error', title: 'Thiếu học viên', message: 'Phiên demo hiện tại không gắn với học viên nào.' })
      return
    }
    if (!pendingIdempotencyKey) pendingIdempotencyKey = `checkout-${Date.now()}`
    checkoutInFlight = true
    checkoutButton.disabled = true
    checkoutButton.setAttribute('aria-busy', 'true')
    const result = store.checkoutFromCart({ learnerId, idempotency: pendingIdempotencyKey })
    checkoutInFlight = false
    checkoutButton.removeAttribute('aria-busy')
    if (result.ok) {
      pendingIdempotencyKey = null
      route.go('contractConfirm', { contract: result.data.contractId, order: result.data.orderId })
      return
    }
    checkoutButton.disabled = false
    if (result.reason === 'duplicated') {
      toast?.show({ type: 'info', title: 'Yêu cầu đã được xử lý', message: 'Đơn từ giỏ này đã được tạo trước đó, không tạo lại lần hai.' })
      return
    }
    if (result.reason === 'storage-failed') {
      toast?.show({ type: 'error', title: 'Không lưu được đơn', message: 'Storage thất bại — giỏ và trạng thái được giữ nguyên, không điều hướng. Hãy thử lại.' })
      return
    }
    if (result.reason === 'cart-invalid' && Array.isArray(result.issues)) {
      renderIssues(result.issues)
      toast?.show({ type: 'error', title: 'Giỏ chưa hợp lệ', message: 'Hãy xử lý từng dòng được đánh dấu trước khi đăng ký.' })
      return
    }
    if (result.reason === 'cart-empty') {
      renderAll()
      toast?.show({ type: 'info', title: 'Giỏ trống', message: 'Không còn dòng nào để tạo đơn.' })
      return
    }
    toast?.show({ type: 'error', title: 'Chưa tạo được đơn', message: `Thao tác thất bại (${result.reason}).` })
  })

  clearButton.addEventListener('click', () => {
    modal?.open('clear-cart-modal', {
      title: 'Xóa toàn bộ giỏ?',
      message: 'Tất cả dòng trong giỏ đăng ký sẽ bị xóa và không khôi phục được trong phiên demo này.',
      confirmText: 'Xóa tất cả',
      cancelText: 'Giữ lại',
      variant: 'danger'
    })
  })

  clearModal?.addEventListener('modal:confirm', event => {
    const result = store.cartClear()
    if (!result.ok) {
      event.preventDefault()
      toast?.show({ type: 'error', title: 'Không xóa được giỏ', message: 'Storage thất bại, giỏ được giữ nguyên.' })
      return
    }
    pendingIdempotencyKey = null
    renderAll()
    toast?.show({ type: 'info', title: 'Đã xóa toàn bộ giỏ', message: 'Giỏ đăng ký hiện trống.' })
  })

  renderAll()
})()
