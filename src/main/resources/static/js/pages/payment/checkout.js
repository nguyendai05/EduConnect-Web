// Đổi số tiền hiển thị khi bật hoặc tắt "Dùng số dư ví"; máy chủ luôn tính lại từ số dư thật khi bấm Thanh toán.
document.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector('[data-pay]')
  const toggle = document.querySelector('[data-wallet-toggle]')
  if (!box || !toggle || box.dataset.locked === 'true') return
  const total = Number(box.dataset.total)
  const balance = Number(box.dataset.balance)
  const money = value => new Intl.NumberFormat('vi-VN').format(value) + ' ₫'
  const render = () => {
    const wallet = toggle.checked ? Math.min(balance, total) : 0
    const provider = total - wallet
    document.querySelectorAll('[data-wallet-amount]').forEach(node => { node.textContent = money(wallet) })
    document.querySelectorAll('[data-provider-amount]').forEach(node => { node.textContent = money(provider) })
    const row = document.querySelector('[data-wallet-row]')
    if (row) row.classList.toggle('is-off', !toggle.checked)
    const button = document.querySelector('[data-pay-submit]')
    if (button) button.textContent = provider === 0 ? 'Thanh toán bằng ví' : `Thanh toán ${money(total)}`
  }
  toggle.addEventListener('change', render)
  document.getElementById('payForm')?.addEventListener('submit', event => {
    const button = event.target.querySelector('[data-pay-submit]')
    if (button) button.disabled = true
  })
  render()
})
