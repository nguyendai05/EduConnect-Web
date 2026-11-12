/** DAT-01: progressive enhancement only; all persistence and authorization run on the server. */
(() => {
  const root = document.querySelector('[data-tutor-manage]')
  if (!root) return

  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab')
  if (tab === 'orders' || tab === 'attendance' || tab === 'revenue') document.getElementById(`tm-tab-${tab}`)?.click()

  // Form tạo/sửa nằm trong hộp thoại; tự mở khi đang sửa, khi có lỗi lưu hoặc khi vào bằng ?create=1.
  const modal = document.getElementById('tm-editor-modal')
  if (modal) {
    const editing = modal.classList.contains('is-editing')
    const open = () => { if (!modal.open) modal.showModal() }
    root.querySelectorAll('[data-tm-open-editor]').forEach(button => {
      button.addEventListener('click', event => {
        if (editing) return // đang sửa một mục: để liên kết tải lại trang ở chế độ tạo mới
        event.preventDefault()
        open()
      })
    })
    if (editing || params.has('create') || modal.querySelector('[data-tm-has-errors]')) open()
  }

  const form = root.querySelector('[data-tm-form]')
  if (form) {
    const type = form.querySelector('[data-tm-type-select]')
    const group = form.querySelector('[data-tm-group-fields]')
    const updateType = () => {
      const enabled = type.value === 'GROUP_CLASS'
      group.hidden = !enabled
      group.disabled = !enabled
      group.querySelectorAll('input').forEach(input => { input.required = enabled })
    }
    type.addEventListener('change', updateType)
    updateType()

    const slots = form.querySelector('[data-tm-slots]')
    const add = form.querySelector('[data-tm-add-slot]')
    const renumber = () => {
      const rows = [...slots.querySelectorAll('[data-tm-slot]')]
      rows.forEach((row, index) => {
        row.querySelectorAll('[data-slot-field]').forEach(input => {
          input.name = `slots[${index}].${input.dataset.slotField}`
          input.id = `tm-slot-${index}-${input.dataset.slotField}`
        })
        row.querySelector('[data-tm-remove-slot]').disabled = rows.length === 1
      })
      add.disabled = rows.length >= 14
    }
    add.addEventListener('click', () => {
      if (slots.children.length >= 14) return
      const row = slots.firstElementChild.cloneNode(true)
      row.querySelectorAll('[data-slot-field]').forEach(input => {
        if (input.dataset.slotField !== 'timeZone') input.value = ''
        input.removeAttribute('aria-invalid')
      })
      slots.append(row)
      renumber()
      row.querySelector('select').focus()
    })
    slots.addEventListener('click', event => {
      const remove = event.target.closest('[data-tm-remove-slot]')
      if (!remove || slots.children.length <= 1) return
      remove.closest('[data-tm-slot]').remove()
      renumber()
    })
    renumber()
  }

  root.querySelectorAll('[data-tm-submit]').forEach(item => {
    item.addEventListener('submit', event => {
      if (item.dataset.submitting === 'true') { event.preventDefault(); return }
      if (item.hasAttribute('data-tm-close') && !window.confirm('Đóng khóa học này? Các giao dịch đã có vẫn được giữ nguyên.')) {
        event.preventDefault()
        return
      }
      item.dataset.submitting = 'true'
      item.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = true })
    })
  })
  window.addEventListener('pageshow', () => {
    root.querySelectorAll('[data-tm-submit]').forEach(item => {
      delete item.dataset.submitting
      item.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = false })
    })
  })
  const attendance = document.getElementById('tm-panel-attendance')
  if (attendance) {
    const selectAttendanceTab = key => {
      attendance.querySelectorAll('[data-att-tab]').forEach(button => {
        const active = button.dataset.attTab === key
        button.classList.toggle('is-active', active)
        button.setAttribute('aria-pressed', String(active))
      })
      attendance.querySelectorAll('[data-att-panel]').forEach(panel => {
        panel.hidden = panel.dataset.attPanel !== key
      })
    }
    attendance.addEventListener('click', event => {
      const button = event.target.closest('[data-att-tab]')
      if (button) selectAttendanceTab(button.dataset.attTab)
    })
    let saving = false
    attendance.addEventListener('submit', async event => {
      const form = event.target
      if (!(form instanceof HTMLFormElement)) return
      event.preventDefault()
      if (saving) return
      saving = true
      const selected = attendance.querySelector('[data-att-tab].is-active')?.dataset.attTab || 'group'
      const buttons = [...attendance.querySelectorAll('button[type="submit"]')]
      buttons.forEach(button => { button.disabled = true })
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new URLSearchParams(new FormData(form)),
          credentials: 'same-origin'
        })
        const page = new DOMParser().parseFromString(await response.text(), 'text/html')
        const updated = page.getElementById('tm-panel-attendance')
        if (!response.ok || !updated) throw new Error('Chưa cập nhật được điểm danh. Vui lòng kiểm tra lại hoặc tải lại trang')
        const error = page.querySelector('.alert--error')
        attendance.replaceChildren(...updated.childNodes)
        selectAttendanceTab(selected)
        const notice = document.createElement('p')
        notice.className = error ? 'alert alert--error' : 'alert alert--success'
        notice.setAttribute('role', error ? 'alert' : 'status')
        notice.textContent = error?.textContent.trim() || page.querySelector('.alert--success')?.textContent.trim() || 'Đã cập nhật điểm danh'
        attendance.prepend(notice)
        window.EduToast?.show({ type: error ? 'error' : 'success', title: notice.textContent })
      } catch (error) {
        const notice = document.createElement('p')
        notice.className = 'alert alert--error'
        notice.setAttribute('role', 'alert')
        notice.textContent = error.message
        attendance.prepend(notice)
      } finally {
        saving = false
        buttons.forEach(button => { button.disabled = false })
      }
    })
  }
})()
