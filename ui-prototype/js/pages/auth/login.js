(() => {
  const loginPage = document.querySelector('.auth-login-page');
  const loginForm = document.querySelector('[data-login-form]');

  if (!loginPage || !loginForm) return;

  const emailInput = document.querySelector('#login-email');
  const passwordInput = document.querySelector('#login-password');
  const emailControl = document.querySelector('[data-email-control]');
  const emailError = document.querySelector('#login-email-error');
  const passwordError = document.querySelector('#login-password-error');
  const status = document.querySelector('[data-login-status]');
  const statusContainer = document.querySelector('.auth-login-status');
  const submitButton = document.querySelector('[data-login-submit]');
  const submitLabel = document.querySelector('[data-login-submit-label]');
  const spinner = document.querySelector('.auth-login-form__spinner');
  const allowedStates = new Set(['invalid_credentials', 'account_locked', 'account_banned']);

  const setFieldError = (control, messageElement, message) => {
    control?.classList.toggle('is-error', Boolean(message));
    messageElement.hidden = !message;
    messageElement.textContent = message;
  };

  const setStatus = (state) => {
    const messages = {
      invalid_credentials: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
      account_locked: 'Tài khoản đang tạm khóa. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
      account_banned: 'Tài khoản đã bị vô hiệu hóa. Bạn không thể tiếp tục đăng nhập.'
    };
    const message = messages[state];

    statusContainer.hidden = !message;
    status.textContent = message || '';
    statusContainer.classList.toggle('is-locked', state === 'account_locked');
    statusContainer.classList.toggle('alert--warning', state === 'account_locked');
    statusContainer.classList.toggle('alert--error', state !== 'account_locked');
    const disabled = state === 'account_locked' || state === 'account_banned';
    submitButton.disabled = disabled;
    emailInput.disabled = disabled;
    passwordInput.disabled = disabled;
  };

  const validate = () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    setFieldError(emailControl, emailError, email ? (validEmail ? '' : 'Vui lòng nhập địa chỉ email hợp lệ.') : 'Vui lòng nhập email.');
    setFieldError(passwordInput.closest('.password-control'), passwordError, password ? '' : 'Vui lòng nhập mật khẩu.');
    return validEmail && password.length > 0;
  };

  const setLoading = (isLoading) => {
    submitButton.disabled = isLoading;
    submitButton.setAttribute('aria-busy', String(isLoading));
    spinner.hidden = !isLoading;
    submitLabel.textContent = isLoading ? 'Đang kiểm tra...' : 'Đăng nhập';
  };

  const initialState = new URLSearchParams(window.location.search).get('state') || loginPage.dataset.loginState;
  if (allowedStates.has(initialState)) setStatus(initialState);

  emailInput.addEventListener('input', () => setFieldError(emailControl, emailError, ''));
  passwordInput.addEventListener('input', () => setFieldError(passwordInput.closest('.password-control'), passwordError, ''));

  const simulateSubmit = () => {
    if (!validate()) return;
    setStatus('');
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStatus('invalid_credentials');
    }, 700);
  };

  submitButton.addEventListener('click', simulateSubmit);
  loginForm.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') {
      event.preventDefault();
      simulateSubmit();
    }
  });
})();
