(() => {
  const form = document.querySelector('[data-register-form]');
  if (!form) return;
  let submitting = false;
  form.addEventListener('submit', event => {
    if (submitting) { event.preventDefault(); return; }
    submitting = true;
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    form.querySelector('[data-register-submit-label]').textContent = '冒';
  });
  window.addEventListener('pageshow', () => {
    submitting = false;
    const button = form.querySelector('[type="submit"]');
    if (button.getAttribute('aria-busy') === 'true') {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      form.querySelector('[data-register-submit-label]').textContent = 'Nhận mã xác minh';
    }
  });
})();
