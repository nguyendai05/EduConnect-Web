/** DAT-01: progressive enhancement only; all persistence and authorization run on the server. */
(() => {
  const root = document.querySelector('[data-tutor-manage]')
  if (!root) return

  const tab = new URLSearchParams(window.location.search).get('tab')
  if (tab === 'orders' || tab === 'revenue') document.getElementById(`tm-tab-${tab}`)?.click()

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
      if (item.hasAttribute('data-tm-close') && !window.confirm('Đóng dịch vụ/lớp này? Các giao dịch đã có vẫn được giữ nguyên.')) {
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
})()
