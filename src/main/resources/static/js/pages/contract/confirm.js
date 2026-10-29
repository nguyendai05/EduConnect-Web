// Chỉ bật nút xác nhận khi đã tick đủ ba cam kết (máy chủ vẫn kiểm tra lại); chặn bấm hai lần.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signContractForm')
  if (!form) return
  const boxes = [...document.querySelectorAll('input.flow-consent-box')]
  const button = form.querySelector('[data-confirm-submit]')
  const update = () => { button.disabled = !boxes.every(box => box.checked) }
  boxes.forEach(box => box.addEventListener('change', update))
  form.addEventListener('submit', () => { button.disabled = true })
  update()
})
