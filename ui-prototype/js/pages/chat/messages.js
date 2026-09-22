/* Page-local UI data. Replace with authenticated conversation APIs when integrating JSP.
 * No messages or attachments are uploaded; state is kept for this page session only.
 */
(() => {
  const conversations = [
    { id: 'lan', name: 'Chị Mai Lan', initials: 'ML', student: 'Trần Gia Huy', course: 'Toán · Lớp 11', unread: 0, contract: true, messages: [
      { text: 'Chào chị Lan, hôm nay Gia Huy học khá tốt phần hệ phương trình. Em đã giao thêm bài về nhà để luyện phần tham số m.', sent: true, time: '20:38' },
      { text: 'Vâng thầy. Phần nào cháu còn yếu nhất để tôi nhắc cháu ôn thêm ạ?', time: '20:41' },
      { text: 'Gia Huy làm tốt phần cơ bản, nhưng cần luyện thêm cách biện luận số nghiệm theo tham số. Chị nhắc em làm lại các bài đã chữa nhé.', sent: true, time: '20:44' },
      { text: 'Thầy ơi buổi thứ 4 vẫn học tối thứ Sáu lúc 19h đúng không ạ?', time: '20:46' },
      { text: 'Đúng chị nhé. Buổi 4 học ngày 09/10, từ 19:00 đến 20:30 tại nhà mình theo lịch đã thống nhất.', sent: true, time: '20:48' },
      { text: 'Vâng thầy, tôi sẽ nhắc Gia Huy hoàn thành bài tập trước buổi học.', time: '20:50' }
    ] },
    { id: 'nam', name: 'Anh Hoàng Nam', initials: 'HN', student: 'Minh Khang', course: 'Toán · Lớp 10', unread: 2, messages: [
      { text: 'Chào thầy, Minh Khang cần ôn thêm phần hàm số.', time: '18:20' },
      { text: 'Thầy gửi lại nội dung bài tập buổi trước giúp anh nhé.', time: '18:22' }
    ] },
    { id: 'ha', name: 'Chị Thu Hà', initials: 'TH', student: 'Ngọc Anh', course: 'Toán · Lớp 9', unread: 0, messages: [
      { text: 'Em đã gửi kế hoạch ôn tập cho Ngọc Anh, chị xem giúp em nhé.', sent: true, time: '16:10' },
      { text: 'Cảm ơn thầy.', time: '16:15' }
    ] },
    { id: 'binh', name: 'Lê Thanh Bình', initials: 'TB', student: 'Lê Thanh Bình', course: 'Toán · Luyện thi đại học', unread: 0, messages: [
      { text: 'Em đã xem lịch học mới rồi ạ.', time: '15:30' }
    ] }
  ]
  const byId = id => document.getElementById(id)
  const layout = byId('chat-layout')
  const input = byId('message-input')
  const history = byId('message-history')
  const drafts = new Map()
  const urls = new Set()
  let active = conversations[0]
  let filter = 'all'
  let attachment = null
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase()
  const node = (tag, className, text) => {
    const element = document.createElement(tag)
    if (className) element.className = className
    if (text !== undefined) element.textContent = text
    return element
  }
  const renderThreads = () => {
    const query = normalize(byId('conversation-search').value.trim())
    const visible = conversations.filter(c => (filter === 'all' || c.unread > 0) && normalize(c.name + ' ' + c.student).includes(query))
    const list = byId('thread-list')
    list.replaceChildren()
    visible.forEach(c => {
      const button = node('button', 'message-thread-item' + (c.id === active.id ? ' message-thread-item--active' : '') + (c.unread ? ' message-thread-item--unread' : ''))
      button.type = 'button'
      button.dataset.conversationId = c.id
      button.setAttribute('aria-pressed', String(c.id === active.id))
      button.setAttribute('aria-label', c.name + (c.unread ? ', ' + c.unread + ' tin nhắn chưa đọc' : ''))
      const content = node('span', 'message-thread-item__content')
      const heading = node('span', 'message-thread-item__heading')
      const last = c.messages[c.messages.length - 1]
      heading.append(node('span', 'message-thread-item__name', c.name), node('time', 'message-thread-item__time', last.time))
      const bottom = node('span', 'message-thread-item__bottom')
      bottom.append(node('span', 'message-thread-item__message', last.text || last.file?.name || 'Tệp đính kèm'), node('span', 'message-thread-item__unread', c.unread))
      content.append(heading, bottom)
      button.append(node('span', 'message-thread-item__avatar', c.initials), content)
      list.append(button)
    })
    byId('thread-empty').hidden = visible.length > 0
    byId('contact-count').textContent = visible.length + ' cuộc trò chuyện'
    byId('unread-total').textContent = conversations.reduce((sum, c) => sum + c.unread, 0)
    document.querySelectorAll('[data-chat-filter]').forEach(button => {
      const selected = button.dataset.chatFilter === filter
      button.setAttribute('aria-pressed', String(selected))
      button.classList.toggle('filter-chip--selected', selected)
    })
  }
  const messageNode = message => {
    const item = node('article', 'chat-message' + (message.sent ? ' chat-message--sent' : ''))
    item.setAttribute('aria-label', message.sent ? 'Bạn' : active.name)
    if (message.text) item.append(node('p', 'chat-message__body', message.text))
    if (message.file) {
      const link = node('a', 'chat-message__file', message.file.name)
      link.href = message.file.url
      link.download = message.file.name
      if (message.file.type.startsWith('image/')) {
        const image = node('img', 'chat-message__image')
        image.src = message.file.url
        image.alt = message.file.name
        link.prepend(image)
      }
      item.append(link)
    }
    const time = node('time', '', message.time)
    time.dateTime = message.dateTime || '2026-10-05T' + message.time + ':00+07:00'
    item.append(time)
    return item
  }
  const renderAttachment = () => {
    const preview = byId('attachment-preview')
    preview.replaceChildren()
    preview.hidden = !attachment
    if (attachment) {
      preview.append(node('span', '', attachment.name + ' · ' + Math.max(1, Math.round(attachment.size / 1024)) + ' KB'))
      const remove = node('button', 'chat-icon-button')
      remove.type = 'button'
      remove.setAttribute('aria-label', 'Bỏ tệp đính kèm')
      const icon = node('img')
      icon.src = '../../assets/icons/close.svg'
      icon.alt = ''
      remove.append(icon)
      remove.addEventListener('click', () => {
        URL.revokeObjectURL(attachment.url)
        urls.delete(attachment.url)
        attachment = null
        renderAttachment()
        updateSend()
      })
      preview.append(remove)
    }
  }
  const updateSend = () => { byId('send-button').disabled = !input.value.trim() && !attachment }
  const renderConversation = () => {
    byId('contact-name').textContent = active.name
    byId('contact-avatar').textContent = active.initials
    byId('contact-description').textContent = active.course + ' · ' + active.student
    byId('student-name').textContent = active.student
    byId('student-course').textContent = active.course
    byId('guardian-name').textContent = active.name
    for (const id of ['contract-link', 'linked-contract', 'linked-lesson']) byId(id).hidden = !active.contract
    history.replaceChildren(node('p', 'chat-day', 'Thứ Hai, 05/10/2026'))
    let day = '2026-10-05'
    active.messages.forEach(message => {
      const messageDay = message.dateTime?.slice(0, 10) || '2026-10-05'
      if (messageDay !== day) { history.append(node('p', 'chat-day', new Date(message.dateTime).toLocaleDateString('vi-VN'))); day = messageDay }
      history.append(messageNode(message))
    })
    history.scrollTop = history.scrollHeight
    input.value = drafts.get(active.id)?.text || ''
    attachment = drafts.get(active.id)?.attachment || null
    renderAttachment()
    updateSend()
    byId('composer-error').hidden = true
  }
  byId('thread-list').addEventListener('click', event => {
    const button = event.target.closest('[data-conversation-id]')
    if (!button) return
    drafts.set(active.id, { text: input.value, attachment })
    active = conversations.find(c => c.id === button.dataset.conversationId)
    active.unread = 0
    layout.classList.add('chat-layout--conversation')
    renderThreads()
    renderConversation()
    input.focus()
  })
  byId('conversation-search').addEventListener('input', renderThreads)
  document.querySelector('[data-clear-search]').addEventListener('click', renderThreads)
  document.querySelectorAll('[data-chat-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.chatFilter; renderThreads() }))
  byId('back-to-contacts').addEventListener('click', () => {
    layout.classList.remove('chat-layout--conversation', 'chat-layout--context')
    byId('conversation-search').focus()
  })
  const closeContext = () => {
    layout.classList.remove('chat-layout--context')
    byId('toggle-context').setAttribute('aria-expanded', 'false')
    byId('toggle-context').focus()
  }
  byId('toggle-context').addEventListener('click', () => {
    const open = layout.classList.toggle('chat-layout--context')
    byId('toggle-context').setAttribute('aria-expanded', String(open))
    if (open) byId('close-context').focus()
  })
  byId('close-context').addEventListener('click', closeContext)
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && layout.classList.contains('chat-layout--context')) closeContext() })
  input.addEventListener('input', updateSend)
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault()
      byId('message-form').requestSubmit()
    }
  })
  byId('message-form').addEventListener('submit', event => {
    event.preventDefault()
    const text = input.value.trim()
    if (!text && !attachment) return
    const now = new Date()
    const message = { text, sent: true, file: attachment, dateTime: now.toISOString(), time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }
    const previous = active.messages[active.messages.length - 1]
    if (previous.dateTime?.slice(0, 10) !== message.dateTime.slice(0, 10)) history.append(node('p', 'chat-day', now.toLocaleDateString('vi-VN')))
    active.messages.push(message)
    history.append(messageNode(message))
    history.scrollTop = history.scrollHeight
    input.value = ''
    attachment = null
    drafts.delete(active.id)
    renderAttachment()
    updateSend()
    renderThreads()
    input.focus()
    byId('chat-status').textContent = 'Đã thêm tin nhắn vào cuộc trò chuyện với ' + active.name
  })
  byId('attach-button').addEventListener('click', () => byId('attachment-input').click())
  byId('attachment-input').addEventListener('change', event => {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain']
    if (file.size > 10 * 1024 * 1024 || !allowed.includes(file.type)) {
      byId('composer-error').textContent = 'Chọn ảnh PNG, JPG, WebP, PDF hoặc TXT không quá 10 MB.'
      byId('composer-error').hidden = false
      return
    }
    if (attachment) { URL.revokeObjectURL(attachment.url); urls.delete(attachment.url) }
    attachment = { name: file.name, size: file.size, type: file.type, url: URL.createObjectURL(file) }
    urls.add(attachment.url)
    byId('composer-error').hidden = true
    renderAttachment()
    updateSend()
  })
  window.addEventListener('pagehide', event => { if (!event.persisted) urls.forEach(url => URL.revokeObjectURL(url)) })
  const wallet = document.querySelector('[data-menu-item="2"] [data-menu-label]')
  if (wallet) wallet.textContent = 'Ví Edu Connect'
  renderThreads()
  renderConversation()
})()
