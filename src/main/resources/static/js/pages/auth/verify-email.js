(() => {
  const page = document.querySelector('[data-verify-page]');
  if (!page) return;
  const expiry = page.querySelector('[data-otp-expiry]');
  const resend = page.querySelector('[data-otp-resend]');
  const started = performance.now();
  const expires = Number(expiry?.dataset.seconds || 0);
  const cooldown = Number(resend?.dataset.seconds || 0);
  const update = () => {
    const elapsed = Math.floor((performance.now() - started) / 1000);
    const remaining = Math.max(0, expires - elapsed);
    const wait = Math.max(0, cooldown - elapsed);
    const text = page.querySelector('[data-otp-countdown]');
    if (text) text.textContent = remaining ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : 'Mã đã hết hạn';
    if (resend && !resend.dataset.submitting) {
      resend.querySelector('button').disabled = wait > 0;
      resend.querySelector('[data-resend-countdown]').textContent = wait ? `(${wait}s)` : '';
    }
  };
  update();
  window.setInterval(update, 1000);
  page.querySelectorAll('form').forEach(form => form.addEventListener('submit', event => {
    if (form.dataset.submitting) { event.preventDefault(); return; }
    form.dataset.submitting = 'true';
    form.querySelector('button[type="submit"]').disabled = true;
  }));
  window.addEventListener('pageshow', () => {
    page.querySelectorAll('form').forEach(form => {
      delete form.dataset.submitting;
      form.querySelector('button[type="submit"]').disabled = false;
    });
    update();
  });
})();
