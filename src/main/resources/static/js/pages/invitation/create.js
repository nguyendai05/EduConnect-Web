/** DAT-03: chỉ xem trước tổng tiền và hạn chế bấm gửi liên tiếp; dữ liệu do server kiểm tra/lưu. */
(() => {
  const selection = document.querySelector('[data-invitation-selection]')
  if (selection) {
    selection.querySelector('[name="tutorId"]').addEventListener('change', () => {
      selection.querySelector('[name="offeringId"]').value = ''
    })
  }
  const form = document.querySelector('[data-invitation-create-form]')
  if (!form) return
  const price = form.querySelector('[data-invitation-price]')
  const sessions = form.querySelector('[data-invitation-sessions]')
  const total = document.querySelector('[data-invitation-total]')
  const updateTotal = () => {
    if (!total) return
    const valid = /^[0-9]{1,19}$/.test(price.value) && /^[0-9]{1,5}$/.test(sessions.value)
    total.textContent = valid ? new Intl.NumberFormat('vi-VN').format(BigInt(price.value) * BigInt(sessions.value)) + ' ₫' : '—'
  }
  price.addEventListener('input', updateTotal)
  sessions.addEventListener('input', updateTotal)
  updateTotal()
  form.addEventListener('submit', () => {
    if (!form.checkValidity()) return
    form.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = true })
  })
  window.addEventListener('pageshow', () => {
    form.querySelectorAll('button[type="submit"]').forEach(button => { button.disabled = false })
  })
})()
