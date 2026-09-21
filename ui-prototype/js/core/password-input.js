(() => {
  const initPasswordInput = root => {
    const input = root.querySelector('input')
    const toggle = root.querySelector('[data-password-toggle]')
    const icon = toggle?.querySelector('img')

    if (!input || !toggle || !icon) return

    toggle.addEventListener('click', () => {
      const shouldShow = input.type === 'password'

      input.type = shouldShow ? 'text' : 'password'
      toggle.setAttribute('aria-pressed', String(shouldShow))
      toggle.setAttribute('aria-label', shouldShow ? 'Ẩn mật khẩu' : 'Hiện mật khẩu')
      icon.src = shouldShow ? icon.dataset.iconHide : icon.dataset.iconShow
    })
  }

  const init = () => {
    document.querySelectorAll('[data-component="password-input"]').forEach(initPasswordInput)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
})()
