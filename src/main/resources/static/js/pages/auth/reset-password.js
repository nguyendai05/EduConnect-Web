(() => {
  const page = document.querySelector('[data-reset-page]');
  if (!page) return;

  const Route = window.EduRoute;
  const FIX = window.EduFixtures;
  const Store = window.EduStore;

  const panels = {};
  page.querySelectorAll('[data-reset-panel]').forEach((panel) => { panels[panel.dataset.resetPanel] = panel; });

  const show = (key) => {
    Object.keys(panels).forEach((name) => { panels[name].hidden = name !== key; });
  };

  if (!Route || !FIX || !Store) {
    show('missing');
    return;
  }

  const NOTICE_KEY = 'educonnect:auth-notice:v1';
  const MIN_LENGTH = 8;
  const KNOWN_STATES = ['valid', 'expired', 'used'];
  const STATE_LABELS = { valid: 'Token hợp lệ', expired: 'Token hết hạn', used: 'Token đã dùng' };
  const STATE_BADGES = { valid: 'badge--success', expired: 'badge--warning', used: 'badge--neutral' };

  const emailBlock = page.querySelector('[data-reset-email-block]');
  const emailValue = page.querySelector('[data-reset-email]');
  const expiresValue = page.querySelector('[data-reset-expires-at]');
  const usedValue = page.querySelector('[data-reset-used-at]');
  const tokenValue = page.querySelector('[data-reset-token-value]');
  const tokenList = page.querySelector('[data-reset-token-list]');
  const form = page.querySelector('[data-reset-form]');
  const passwordInput = page.querySelector('#reset-password');
  const confirmInput = page.querySelector('#reset-confirm-password');
  const passwordControl = page.querySelector('[data-reset-control="password"]');
  const confirmControl = page.querySelector('[data-reset-control="confirm-password"]');
  const passwordError = page.querySelector('#reset-password-error');
  const confirmError = page.querySelector('#reset-confirm-password-error');
  const submitButton = page.querySelector('[data-reset-submit]');
  const submitLabel = page.querySelector('[data-reset-submit-label]');
  const submitSpinner = page.querySelector('[data-reset-submit-spinner]');
  const storageError = page.querySelector('[data-reset-storage-error]');
  const usernameInput = page.querySelector('[data-reset-username]');

  const token = Route.param('token', 'resetPassword', null);
  const record = FIX.authTokens.find((item) => item.token === token && item.kind === 'reset-password') || null;
  const state = !token ? 'missing' : (!record || !KNOWN_STATES.includes(record.state) ? 'unknown' : record.state);

  Store.text(emailValue, record ? record.email : '');
  Store.text(expiresValue, record && record.expiresAt ? Store.formatDate(record.expiresAt, true) : '');
  Store.text(usedValue, record && record.usedAt ? Store.formatDate(record.usedAt, true) : '');
  Store.text(tokenValue, token || '');
  if (emailBlock) emailBlock.hidden = !record;
  show(state);

  // Ô username ẩn chỉ để trình quản lý mật khẩu hiểu ngữ cảnh form; không phải trường người dùng nhập.
  if (usernameInput && record) {
    usernameInput.value = record.email;
    usernameInput.setAttribute('value', record.email);
  }

  const setFieldError = (input, control, messageNode, message) => {
    control.classList.toggle('is-error', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    messageNode.hidden = !message;
    messageNode.textContent = message;
  };

  const passwordRuleMessage = (value) => {
    if (value.length < MIN_LENGTH) return `Mật khẩu cần tối thiểu ${MIN_LENGTH} ký tự.`;
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return 'Mật khẩu cần có cả chữ và số.';
    return '';
  };

  const validate = () => {
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    const passwordMessage = passwordRuleMessage(password);
    let confirmMessage = '';
    if (!confirm) confirmMessage = 'Vui lòng nhập lại mật khẩu mới.';
    else if (confirm !== password) confirmMessage = 'Mật khẩu xác nhận chưa khớp.';
    setFieldError(passwordInput, passwordControl, passwordError, passwordMessage);
    setFieldError(confirmInput, confirmControl, confirmError, confirmMessage);
    return !passwordMessage && !confirmMessage;
  };

  const setLoading = (loading) => {
    submitButton.disabled = loading;
    submitButton.setAttribute('aria-busy', String(loading));
    submitSpinner.hidden = !loading;
    submitLabel.textContent = loading ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu';
  };

  // Chỉ ghi cờ trạng thái không chứa mật khẩu; mật khẩu không đi vào storage, fixture hay log.
  const writeNotice = () => {
    try {
      window.sessionStorage.setItem(NOTICE_KEY, JSON.stringify({ code: 'password-reset', at: new Date().toISOString() }));
      return true;
    } catch (error) {
      return false;
    }
  };

  let submitting = false;

  const submit = () => {
    if (submitting) return;
    storageError.hidden = true;
    if (!validate()) {
      (passwordInput.getAttribute('aria-invalid') === 'true' ? passwordInput : confirmInput).focus();
      return;
    }
    submitting = true;
    setLoading(true);
    window.setTimeout(() => {
      if (!writeNotice()) {
        submitting = false;
        setLoading(false);
        storageError.hidden = false;
        return;
      }
      form.reset();
      setLoading(false);
      show('done');
      window.setTimeout(() => Route.go('login'), 1200);
    }, 800);
  };

  passwordInput.addEventListener('input', () => setFieldError(passwordInput, passwordControl, passwordError, ''));
  confirmInput.addEventListener('input', () => setFieldError(confirmInput, confirmControl, confirmError, ''));
  submitButton.addEventListener('click', submit);
  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.target.tagName === 'BUTTON') return;
    event.preventDefault();
    submit();
  });

  if (!tokenList) return;

  FIX.authTokens
    .filter((item) => item.kind === 'reset-password')
    .forEach((item) => {
      const entry = document.createElement('li');
      entry.className = 'auth-reset-tokens__item';

      const link = document.createElement('a');
      link.className = 'auth-reset-tokens__link';
      link.href = Route.page('resetPassword', { token: item.token });
      link.textContent = item.token;

      const badge = document.createElement('span');
      badge.className = `badge ${STATE_BADGES[item.state] || 'badge--neutral'}`;
      badge.textContent = STATE_LABELS[item.state] || item.state;

      entry.append(link, badge);
      tokenList.append(entry);
    });
})();
