// Hỏi trạng thái thanh toán mỗi vài giây và chuyển sang trang kết quả khi không còn chờ; đếm ngược hạn của phiên.
document.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector('[data-payment-poll="true"]')
  if (!box) return

  const countdown = box.querySelector('[data-countdown]')
  const expires = box.dataset.expiresAt ? Date.parse(box.dataset.expiresAt) : NaN
  const pad = value => String(value).padStart(2, '0')
  const tick = () => {
    if (!countdown || Number.isNaN(expires)) return
    const left = Math.max(0, Math.floor((expires - Date.now()) / 1000))
    if (left === 0) {
      countdown.textContent = 'Phiên đã hết hạn'
      countdown.classList.add('is-over')
      return
    }
    countdown.textContent = `Còn ${pad(Math.floor(left / 60))}:${pad(left % 60)}`
  }
  tick()
  setInterval(tick, 1000)

  const timer = setInterval(async () => {
    try {
      const res = await fetch(box.dataset.statusUrl, { headers: { Accept: 'application/json' } })
      if (!res.ok) return
      const data = await res.json()
      if (data.status !== 'PENDING' || data.attempt !== 'PENDING') {
        clearInterval(timer)
        location.href = box.dataset.resultUrl
      }
    } catch (error) {
      // lỗi mạng tạm thời: lần hỏi sau sẽ thử lại
    }
  }, 4000)
})
