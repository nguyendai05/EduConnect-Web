(() => {
  const page = document.querySelector('[data-verify-page]');
  if (!page) return;

  const Route = window.EduRoute;
  const FIX = window.EduFixtures;
  const Store = window.EduStore;

  const panels = {};
  page.querySelectorAll('[data-verify-state]').forEach((panel) => { panels[panel.dataset.verifyState] = panel; });

  const show = (key) => {
    Object.keys(panels).forEach((name) => { panels[name].hidden = name !== key; });
  };

  if (!Route || !FIX || !Store) {
    show('missing');
    return;
  }

  const STATE_LABELS = { valid: 'Token hợp lệ', expired: 'Token hết hạn', used: 'Token đã dùng' };
  const STATE_BADGES = { valid: 'badge--success', expired: 'badge--warning', used: 'badge--neutral' };

  const emailBlock = page.querySelector('[data-verify-email-block]');
  const emailValue = page.querySelector('[data-verify-email]');
  const expiresValue = page.querySelector('[data-verify-expires-at]');
  const usedValue = page.querySelector('[data-verify-used-at]');
  const tokenValue = page.querySelector('[data-verify-token-value]');
  const resendButton = page.querySelector('[data-verify-resend]');
  const resendLabel = page.querySelector('[data-verify-resend-label]');
  const resendSpinner = page.querySelector('[data-verify-resend-spinner]');
  const resendStatus = page.querySelector('[data-verify-resend-status]');
  const tokenList = page.querySelector('[data-verify-token-list]');

  const token = Route.param('token', 'verifyEmail', null);
  const record = FIX.authTokens.find((item) => item.token === token && item.kind === 'verify-email') || null;
  const state = !token ? 'missing' : (!record || !STATE_LABELS[record.state] ? 'unknown' : record.state);

  Store.text(emailValue, record ? record.email : '');
  Store.text(expiresValue, record && record.expiresAt ? Store.formatDate(record.expiresAt, true) : '');
  Store.text(usedValue, record && record.usedAt ? Store.formatDate(record.usedAt, true) : '');
  Store.text(tokenValue, token || '');
  if (emailBlock) emailBlock.hidden = !record;
  show(state);

  let resendRequested = false;
  const setResendLoading = (loading) => {
    resendButton.disabled = loading;
    resendButton.setAttribute('aria-busy', String(loading));
    resendSpinner.hidden = !loading;
    resendLabel.textContent = loading ? 'Đang gửi lại...' : 'Gửi lại email xác minh';
  };

  if (resendButton) {
    resendButton.addEventListener('click', () => {
      if (resendRequested) return;
      resendRequested = true;
      setResendLoading(true);
      window.setTimeout(() => {
        setResendLoading(false);
        resendLabel.textContent = 'Đã gửi lại email xác minh';
        resendButton.disabled = true;
        resendStatus.hidden = false;
      }, 800);
    });
  }

  if (!tokenList) return;

  FIX.authTokens
    .filter((item) => item.kind === 'verify-email')
    .forEach((item) => {
      const entry = document.createElement('li');
      entry.className = 'auth-verify-tokens__item';

      const link = document.createElement('a');
      link.className = 'auth-verify-tokens__link';
      link.href = Route.page('verifyEmail', { token: item.token });
      link.textContent = item.token;

      const badge = document.createElement('span');
      badge.className = `badge ${STATE_BADGES[item.state] || 'badge--neutral'}`;
      badge.textContent = STATE_LABELS[item.state] || item.state;

      entry.append(link, badge);
      tokenList.append(entry);
    });
})();
