/**
 * EduToast.show({ type: 'success'|'error'|'warning'|'info', title, message, duration })
 * Returns { close }. Duration is milliseconds; 0 keeps the toast until dismissed.
 * Errors persist by default; other types last 6000 ms. No business logic belongs here.
 * Declarative trigger: data-toast="success" data-toast-title="..." data-toast-message="...".
 * Uses textContent so messages are always plain text, never interpreted as HTML.
 */
(() => {
  if (window.EduToast) return
  const variants = {
    success: { title: 'Thành công', icon: '✓' },
    error: { title: 'Có lỗi xảy ra' },
    warning: { title: 'Cảnh báo' },
    info: { title: 'Thông tin' }
  }
  let region
  let polite
  let urgent
  const create = (tag, className, text) => {
    const element = document.createElement(tag)
    element.className = className
    if (text !== undefined) element.textContent = text
    return element
  }
  const init = () => {
    if (region?.isConnected) return
    region = document.querySelector('.toast-region') || create('section', 'toast-region')
    region.setAttribute('aria-label', 'Thông báo')
    polite = document.querySelector('[data-toast-announcer=polite]') || create('div', 'toast-announcer')
    urgent = document.querySelector('[data-toast-announcer=urgent]') || create('div', 'toast-announcer')
    polite.setAttribute('role', 'status')
    urgent.setAttribute('role', 'alert')
    for (const announcer of [polite, urgent]) {
      announcer.setAttribute('aria-atomic', 'false')
      announcer.setAttribute('aria-relevant', 'additions')
    }
    document.body.append(region, polite, urgent)
  }
  const show = (options = {}) => {
    init()
    const type = Object.hasOwn(variants, options.type) ? options.type : 'info'
    const variant = variants[type]
    const title = String(options.title || variant.title)
    const message = String(options.message || '')
    const duration = options.duration === undefined ? (type === 'error' ? 0 : 6000) : Number(options.duration)
    let remaining = Number.isFinite(duration) && duration >= 0 ? duration : 6000
    const persistent = remaining === 0
    const previousFocus = document.activeElement
    const toast = create('div', `toast toast--${type}`)
    const icon = create('span', 'toast__icon')
    icon.setAttribute('aria-hidden', 'true')
    const content = create('div', 'toast__content')
    content.append(create('p', 'toast__title', title))
    if (message) content.append(create('p', 'toast__message', message))
    const button = create('button', 'toast__close', '×')
    button.type = 'button'
    button.setAttribute('aria-label', `Đóng thông báo: ${title}`)
    toast.append(icon, content, button)
    region.append(toast)

    let timer
    let started = 0
    let closed = false
    let hovered = false
    let focused = false
    const announcement = create('p', '', `${title}. ${message}`)
    const announceTimer = setTimeout(() => {
      if (!closed) (type === 'error' ? urgent : polite).append(announcement)
    }, 50)
    const clearAnnouncement = setTimeout(() => announcement.remove(), 10000)
    const pause = () => {
      if (timer !== undefined) {
        clearTimeout(timer)
        timer = undefined
        remaining = Math.max(0, remaining - (performance.now() - started))
      }
    }
    const close = () => {
      if (closed) return
      closed = true
      pause()
      clearTimeout(announceTimer)
      clearTimeout(clearAnnouncement)
      document.removeEventListener('visibilitychange', onVisibility)
      if (toast.contains(document.activeElement) && previousFocus?.isConnected) previousFocus.focus()
      toast.remove()
      announcement.remove()
    }
    const resume = () => {
      if (closed || persistent || hovered || focused || document.hidden || timer !== undefined) return
      started = performance.now()
      timer = setTimeout(close, remaining)
    }
    const onVisibility = () => document.hidden ? pause() : resume()
    toast.addEventListener('pointerenter', () => { hovered = true; pause() })
    toast.addEventListener('pointerleave', () => { hovered = false; resume() })
    toast.addEventListener('focusin', () => { focused = true; pause() })
    toast.addEventListener('focusout', event => {
      if (!toast.contains(event.relatedTarget)) { focused = false; resume() }
    })
    button.addEventListener('click', close)
    document.addEventListener('visibilitychange', onVisibility)
    resume()
    return Object.freeze({ close })
  }
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return
    const trigger = event.target.closest('[data-toast]')
    if (!trigger) return
    show({ type: trigger.dataset.toast, title: trigger.dataset.toastTitle, message: trigger.dataset.toastMessage, duration: trigger.dataset.toastDuration })
  })
  window.EduToast = Object.freeze({ show })
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
})()