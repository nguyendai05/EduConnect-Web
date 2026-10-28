// Hỏi trạng thái thanh toán mỗi vài giây; khi không còn chờ thì chuyển sang trang kết quả.
document.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector('[data-payment-poll="true"]')
  if (!box) return
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
