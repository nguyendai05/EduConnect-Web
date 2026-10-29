// Khi vừa quay về từ PayOS mà hệ thống chưa ghi nhận, hỏi trạng thái vài lần rồi tải lại trang khi có kết quả.
document.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector('[data-result-poll="true"]')
  if (!box) return
  let tries = 0
  const timer = setInterval(async () => {
    tries += 1
    if (tries > 40) { clearInterval(timer); return }
    try {
      const res = await fetch(box.dataset.statusUrl, { headers: { Accept: 'application/json' } })
      if (!res.ok) return
      const data = await res.json()
      if (data.status !== 'PENDING') {
        clearInterval(timer)
        location.reload()
      }
    } catch (error) {
      // lỗi mạng tạm thời: lần hỏi sau sẽ thử lại
    }
  }, 3000)
})
