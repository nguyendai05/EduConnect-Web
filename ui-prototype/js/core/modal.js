/**
 * Usage: data-modal-open="dialog-id", data-modal-close, data-modal-confirm.
 * API: EduModal.open(id, { title, message, confirmText, cancelText, variant }), EduModal.close(id).
 * Events on dialog: modal:open, modal:confirm (cancelable), modal:close.
 * Handle business actions in page JS; preventDefault() on modal:confirm to keep open.
 * Native showModal provides focus containment and makes the background inert.
 */
(() => {
  if (window.EduModal) return
  let activeModal = null
  let opener = null
  let previousOverflow = ''
  let backdropPointer = false

  const resolve = target => typeof target === 'string' ? document.getElementById(target) : target
  const close = (target = activeModal, reason = 'close') => {
    const modal = resolve(target)
    if (modal instanceof HTMLDialogElement && modal.open) modal.close(reason)
  }
  const open = (target, options = {}) => {
    const modal = resolve(target)
    if (!(modal instanceof HTMLDialogElement) || !modal.matches('.modal') || modal.open || activeModal) return
    // Configure one reusable shell; page JS handles modal:confirm.
    const title = modal.querySelector('.modal__heading h2')
    const description = modal.querySelector('.modal__body p')
    const confirm = modal.querySelector('[data-modal-confirm]')
    const cancel = modal.querySelector('.modal__footer [data-modal-close]')
    const icon = modal.querySelector('.modal__icon')
    const information = options.variant === 'info'
    if (title) title.textContent = options.title || (information ? 'Thông tin' : 'Xác nhận thao tác')
    if (description) description.textContent = options.message || (information ? 'Vui lòng kiểm tra thông tin trước khi tiếp tục.' : 'Bạn có chắc muốn thực hiện thao tác này?')
    if (confirm) {
      confirm.hidden = information
      confirm.textContent = options.confirmText || 'Xác nhận'
    }
    if (cancel) cancel.textContent = options.cancelText || (information ? 'Đã hiểu' : 'Quay lại')
    if (icon) {
      icon.classList.toggle('modal__icon--info', information)
      icon.classList.toggle('modal__icon--confirm', !information)
    }
    opener = document.activeElement
    modal.returnValue = ''
    modal.showModal()
    activeModal = modal
    previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    const onPointerDown = event => { backdropPointer = event.target === modal && outside(event, modal) }
    const onClick = event => {
      if (backdropPointer && event.target === modal && outside(event, modal)) close(modal, 'backdrop')
      backdropPointer = false
    }
    const onCancel = event => {
      event.preventDefault()
      close(modal, 'escape')
    }
    modal.addEventListener('pointerdown', onPointerDown)
    modal.addEventListener('click', onClick)
    modal.addEventListener('cancel', onCancel)
    modal.addEventListener('close', () => {
      modal.removeEventListener('pointerdown', onPointerDown)
      modal.removeEventListener('click', onClick)
      modal.removeEventListener('cancel', onCancel)
      document.documentElement.style.overflow = previousOverflow
      activeModal = null
      backdropPointer = false
      if (opener?.isConnected) opener.focus()
      opener = null
      modal.dispatchEvent(new CustomEvent('modal:close', { bubbles: true, detail: { reason: modal.returnValue } }))
    }, { once: true })
    modal.dispatchEvent(new CustomEvent('modal:open', { bubbles: true }))
  }
  const outside = (event, modal) => {
    const rect = modal.getBoundingClientRect()
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
  }
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return
    const trigger = event.target.closest('[data-modal-open]')
    if (trigger) { open(trigger.dataset.modalOpen); return }
    const control = event.target.closest('[data-modal-close], [data-modal-confirm]')
    const modal = control?.closest('dialog.modal')
    if (!modal || !modal.open) return
    if (control.hasAttribute('data-modal-confirm')) {
      const accepted = modal.dispatchEvent(new CustomEvent('modal:confirm', { bubbles: true, cancelable: true }))
      if (accepted) close(modal, 'confirm')
    } else close(modal, 'dismiss')
  })
  window.EduModal = Object.freeze({ open, close })
  // Opt-in for the standalone HTML. Omit this attribute in production pages.
  const autoOpen = () => {
    const modal = document.querySelector('dialog.modal[data-modal-auto-open]')
    if (modal) open(modal)
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoOpen, { once: true })
  else autoOpen()
})()