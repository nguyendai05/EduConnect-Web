// Hỏi tin mới mỗi 4 giây và thêm vào khung chat; gửi tin dùng form thường nên không cần JS.
document.addEventListener('DOMContentLoaded', () => {
  const thread = document.querySelector('[data-chat-poll]')
  const box = document.querySelector('[data-chat-messages]')
  if (!thread || !box) return
  let lastId = Number(thread.dataset.lastId) || 0
  box.scrollTop = box.scrollHeight

  const format = iso => {
    const d = new Date(iso)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  setInterval(async () => {
    try {
      const res = await fetch(`${thread.dataset.chatPoll}&after=${lastId}`, { headers: { Accept: 'application/json' } })
      if (!res.ok) return
      const items = await res.json()
      if (!items.length) return
      box.querySelector('[data-chat-empty]')?.remove()
      for (const m of items) {
        const row = document.createElement('div')
        row.className = 'chat-msg' + (m.mine ? ' chat-msg--mine' : '')
        const body = document.createElement('p')
        body.className = 'chat-msg__body'
        body.textContent = m.body
        const time = document.createElement('time')
        time.className = 'chat-msg__time'
        time.textContent = format(m.sentAt)
        row.append(body, time)
        box.append(row)
        lastId = Math.max(lastId, m.id)
      }
      box.scrollTop = box.scrollHeight
    } catch (error) {
      // lỗi mạng tạm thời: lần hỏi sau sẽ thử lại
    }
  }, 4000)
})
