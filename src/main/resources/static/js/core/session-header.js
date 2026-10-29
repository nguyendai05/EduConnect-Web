// Menu avatar của header thật và cửa sổ chat nổi (kéo được, nhớ trạng thái giữa các trang).
document.addEventListener('DOMContentLoaded', () => {
  initAccountMenu()
  initChatWidget()
  initBadges()
})

/** Hỏi số việc đang chờ và tin chưa đọc: hiện chấm đỏ trên avatar và số trên biểu tượng chat; làm mới mỗi 30 giây. */
function initBadges() {
  const root = document.querySelector('[data-account-menu]')
  if (!root) return
  const dot = root.querySelector('[data-pending-dot]')
  const text = root.querySelector('[data-pending-text]')
  const chat = document.querySelector('[data-chat-badge]')
  const refresh = async () => {
    try {
      const res = await fetch(root.dataset.badges, { headers: { Accept: 'application/json' } })
      if (!res.ok) return
      const { pending, chatUnread } = await res.json()
      dot.hidden = pending === 0
      text.hidden = pending === 0
      text.textContent = `Có ${pending} việc đang chờ bạn xử lý`
      if (chat) {
        chat.hidden = chatUnread === 0
        chat.textContent = chatUnread > 9 ? '9+' : String(chatUnread)
      }
    } catch (e) {
      // lỗi mạng tạm thời: lần sau thử lại
    }
  }
  refresh()
  setInterval(refresh, 30000)
  window.refreshHeaderBadges = refresh
}

/** Mở/đóng menu avatar; đóng khi bấm ra ngoài hoặc nhấn Esc. */
function initAccountMenu() {
  const root = document.querySelector('[data-account-menu]')
  if (!root) return
  const button = root.querySelector('button')
  const menu = root.querySelector('.user-header__menu')
  const set = open => {
    menu.hidden = !open
    menu.classList.toggle('is-open', open)
    button.classList.toggle('is-open', open)
    button.setAttribute('aria-expanded', String(open))
  }
  const avatar = root.querySelector('[data-avatar]')
  const name = root.querySelector('.user-header__menu-summary strong')?.textContent.trim()
  if (name) avatar.textContent = name.split(/\s+/).pop().charAt(0).toUpperCase()
  button.addEventListener('click', () => set(menu.hidden))
  document.addEventListener('click', event => { if (!root.contains(event.target)) set(false) })
  document.addEventListener('keydown', event => { if (event.key === 'Escape') set(false) })
}

function initChatWidget() {
  const root = document.querySelector('[data-chat-widget]')
  if (!root) return
  // Trang tin nhắn đầy đủ đã có khung chat nên không cần cửa sổ nổi.
  if (location.pathname.endsWith('/chat/messages')) { root.remove(); return }

  const $ = selector => root.querySelector(selector)
  const fab = $('[data-chat-fab]'), panel = $('[data-chat-panel]'), handle = $('[data-chat-handle]')
  const title = $('[data-chat-title]'), back = $('[data-chat-back]'), full = $('[data-chat-full]')
  const list = $('[data-chat-list]'), thread = $('[data-chat-thread]'), box = $('[data-chat-messages]')
  const form = $('[data-chat-form]'), error = $('[data-chat-error]')
  const urls = root.dataset
  const KEY = 'educonnect.chat'
  const state = Object.assign({ open: false, right: null, bottom: null, conv: null, name: '' }, load())
  let lastId = 0
  let timer = null
  let moved = false

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch (e) { return {} }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) { /* không lưu được thì bỏ qua */ }
  }
  const small = () => matchMedia('(max-width: 40rem)').matches
  const showError = text => { error.textContent = text || ''; error.hidden = !text }
  const pad = n => String(n).padStart(2, '0')
  const format = iso => { const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}` }

  /** Giữ khung trong màn hình rồi ghi vị trí (khoảng cách tới mép phải và mép dưới). */
  function place() {
    if (small() || state.right === null) { root.style.right = ''; root.style.bottom = ''; return }
    state.right = Math.min(Math.max(0, state.right), innerWidth - root.offsetWidth)
    state.bottom = Math.min(Math.max(0, state.bottom), innerHeight - root.offsetHeight)
    root.style.right = state.right + 'px'
    root.style.bottom = state.bottom + 'px'
  }

  function render() {
    root.classList.toggle('is-open', state.open)
    panel.hidden = !state.open
    place()
  }

  /** Mở cửa sổ: vào cuộc trò chuyện đang nhớ hoặc danh sách. */
  function open() {
    state.open = true
    save(); render()
    if (state.conv) openConversation(state.conv, state.name); else showList()
  }

  function close() {
    state.open = false
    stopPolling(); save(); render()
  }

  async function showList() {
    stopPolling()
    state.conv = null; save()
    title.textContent = 'Tin nhắn'
    back.hidden = true; full.hidden = false
    thread.hidden = true; list.hidden = false
    showError('')
    try {
      const res = await fetch(urls.list, { headers: { Accept: 'application/json' } })
      const items = res.ok ? await res.json() : []
      list.replaceChildren()
      if (!items.length) {
        const empty = document.createElement('p')
        empty.className = 'chat-widget__empty'
        empty.textContent = 'Chưa có cuộc trò chuyện nào. Bấm "Nhắn tin" ở hồ sơ gia sư, ứng viên hoặc lời mời để bắt đầu.'
        list.append(empty)
      }
      for (const c of items) {
        const item = document.createElement('button')
        item.type = 'button'
        item.className = 'chat-widget__item'
        item.textContent = c.otherName
        item.addEventListener('click', () => openConversation(c.id, c.otherName))
        list.append(item)
      }
    } catch (e) {
      showError('Không tải được danh sách tin nhắn')
    }
  }

  function addMessage(m) {
    const row = document.createElement('div')
    row.className = 'chat-widget__msg' + (m.mine ? ' chat-widget__msg--mine' : '')
    const body = document.createElement('p')
    body.textContent = m.body
    const time = document.createElement('time')
    time.textContent = format(m.sentAt)
    row.append(body, time)
    box.append(row)
    lastId = Math.max(lastId, m.id)
  }

  async function openConversation(id, name) {
    state.conv = id; state.name = name; save()
    title.textContent = name
    back.hidden = false; full.hidden = true
    list.hidden = true; thread.hidden = false
    form.elements.conversation.value = id
    showError('')
    box.replaceChildren()
    lastId = 0
    try {
      const res = await fetch(`${urls.messages}?conversation=${id}`, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('không mở được')
      for (const m of await res.json()) addMessage(m)
      box.scrollTop = box.scrollHeight
      startPolling()
      window.refreshHeaderBadges?.()
    } catch (e) {
      await showList()
      showError('Không mở được cuộc trò chuyện')
    }
  }

  async function poll() {
    if (!state.conv) return
    try {
      const res = await fetch(`${urls.poll}?conversation=${state.conv}&after=${lastId}`, { headers: { Accept: 'application/json' } })
      if (!res.ok) return
      const items = await res.json()
      if (!items.length) return
      const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 40
      for (const m of items) addMessage(m)
      if (atBottom) box.scrollTop = box.scrollHeight
      window.refreshHeaderBadges?.()
    } catch (e) {
      // lỗi mạng tạm thời: lần hỏi sau sẽ thử lại
    }
  }

  function startPolling() { stopPolling(); timer = setInterval(poll, 4000) }
  function stopPolling() { clearInterval(timer); timer = null }

  form.addEventListener('submit', async event => {
    event.preventDefault()
    const text = form.elements.body
    if (!text.value.trim()) return
    try {
      const res = await fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form)) })
      if (res.ok) {
        text.value = ''
        showError('')
        await poll()
        box.scrollTop = box.scrollHeight
      } else {
        showError((await res.json().catch(() => ({}))).error || 'Không gửi được tin nhắn')
      }
    } catch (e) {
      showError('Không gửi được tin nhắn')
    }
  })

  // Enter gửi, Shift+Enter xuống dòng.
  form.elements.body.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit() }
  })

  /** Kéo thả dùng chung cho biểu tượng và thanh tiêu đề; di chuyển quá 4px thì không tính là bấm. */
  function drag(target) {
    target.addEventListener('pointerdown', event => {
      if (small() || event.target.closest('button, a') && target === handle) return
      const startX = event.clientX, startY = event.clientY
      const rect = root.getBoundingClientRect()
      const startRight = innerWidth - rect.right, startBottom = innerHeight - rect.bottom
      moved = false
      target.setPointerCapture(event.pointerId)
      const move = e => {
        const dx = e.clientX - startX, dy = e.clientY - startY
        if (Math.abs(dx) + Math.abs(dy) > 4) moved = true
        if (!moved) return
        state.right = startRight - dx
        state.bottom = startBottom - dy
        place()
      }
      const up = () => {
        target.removeEventListener('pointermove', move)
        target.removeEventListener('pointerup', up)
        if (moved) save()
      }
      target.addEventListener('pointermove', move)
      target.addEventListener('pointerup', up)
    })
  }
  drag(fab)
  drag(handle)

  fab.addEventListener('click', () => { if (moved) { moved = false; return } open() })
  $('[data-chat-close]').addEventListener('click', close)
  back.addEventListener('click', showList)
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.open && !document.querySelector('[data-account-menu] .is-open')) close()
  })
  addEventListener('resize', place)

  // Các nút "Nhắn tin" có sẵn (/chat/with?...) mở thẳng cuộc trò chuyện trong cửa sổ nổi, không chuyển trang.
  document.addEventListener('click', async event => {
    const link = event.target.closest('a[href*="/chat/with"]')
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey) return
    event.preventDefault()
    const query = new URL(link.href, location.href).search
    state.open = true; save(); render()
    try {
      const res = await fetch(urls.open + query, { headers: { Accept: 'application/json' } })
      const data = await res.json()
      if (!res.ok) { await showList(); showError(data.error || 'Không mở được cuộc trò chuyện'); return }
      openConversation(data.id, data.otherName)
    } catch (e) {
      await showList()
      showError('Không mở được cuộc trò chuyện')
    }
  })

  render()
  if (state.open) open()
}
