(() => {
  const loginPage = document.querySelector('.auth-login-page');
  const loginForm = document.querySelector('[data-login-form]');

  if (!loginPage || !loginForm) return;

  const Route = window.EduRoute;
  const Store = window.EduStore;
  const FIX = window.EduFixtures;
  const demoReady = Boolean(Route && Store && FIX);

  const emailInput = document.querySelector('#login-email');
  const passwordInput = document.querySelector('#login-password');
  const emailControl = document.querySelector('[data-email-control]');
  const emailError = document.querySelector('#login-email-error');
  const passwordError = document.querySelector('#login-password-error');
  const status = document.querySelector('[data-login-status]');
  const statusContainer = status.closest('.alert');
  const submitButton = document.querySelector('[data-login-submit]');
  const submitLabel = document.querySelector('[data-login-submit-label]');
  const spinner = document.querySelector('.auth-login-form__spinner');
  const successAlert = document.querySelector('[data-login-success]');
  const successMessage = document.querySelector('[data-login-success-message]');
  const demoEmails = document.querySelector('[data-login-demo-emails]');
  const sessionBlock = document.querySelector('[data-login-session]');
  const sessionMessage = document.querySelector('[data-login-session-message]');
  const logoutButton = document.querySelector('[data-login-logout]');

  // Cờ trạng thái do js/pages/auth/reset-password.js ghi; không bao giờ chứa mật khẩu.
  const NOTICE_KEY = 'educonnect:auth-notice:v1';
  const allowedStates = new Set(['invalid_credentials', 'account_locked', 'account_banned']);
  const HOME_LABELS = { home: 'trang chủ', tutorManage: 'trang quản lý của gia sư', adminDashboard: 'bảng điều khiển quản trị' };

  const setFieldError = (input, control, messageElement, message) => {
    control?.classList.toggle('is-error', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    messageElement.hidden = !message;
    messageElement.textContent = message;
  };

  const setStatus = (state) => {
    const messages = {
      invalid_credentials: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
      account_locked: 'Tài khoản đang tạm khóa. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
      account_banned: 'Tài khoản đã bị vô hiệu hóa. Bạn không thể tiếp tục đăng nhập.',
      demo_unavailable: 'Không tải được module demo (route/fixtures/store) nên trang chưa thể mô phỏng đăng nhập.'
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

  const setSuccess = (message) => {
    successAlert.hidden = !message;
    successMessage.textContent = message || '';
  };

  const validate = () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    setFieldError(emailInput, emailControl, emailError, email ? (validEmail ? '' : 'Vui lòng nhập địa chỉ email hợp lệ.') : 'Vui lòng nhập email.');
    setFieldError(passwordInput, passwordInput.closest('.password-control'), passwordError, password ? '' : 'Vui lòng nhập mật khẩu.');
    return validEmail && password.length > 0;
  };

  const setLoading = (isLoading) => {
    submitButton.disabled = isLoading;
    submitButton.setAttribute('aria-busy', String(isLoading));
    spinner.hidden = !isLoading;
    submitLabel.textContent = isLoading ? 'Đang kiểm tra...' : 'Đăng nhập';
  };

  const consumeNotice = () => {
    try {
      const raw = window.sessionStorage.getItem(NOTICE_KEY);
      if (!raw) return null;
      window.sessionStorage.removeItem(NOTICE_KEY);
      const parsed = JSON.parse(raw);
      return parsed && parsed.code === 'password-reset' ? parsed : null;
    } catch (error) {
      return null;
    }
  };

  const hasStoredSession = () => {
    try {
      return Boolean(window.sessionStorage.getItem(Store.SESSION_KEY));
    } catch (error) {
      return false;
    }
  };

  const renderSession = () => {
    if (!demoReady || !sessionBlock) return;
    const stored = hasStoredSession();
    sessionBlock.hidden = !stored;
    if (!stored) return;
    const persona = Store.getSession().persona;
    sessionMessage.textContent = `Phiên demo hiện tại: ${persona.name} — ${persona.label}. Đăng nhập bằng email khác sẽ ghi đè phiên này.`;
  };

  if (demoEmails && demoReady) {
    demoEmails.textContent = `Email demo: ${FIX.personas.map((persona) => `${persona.email} (${persona.label})`).join(' · ')}`;
  }

  renderSession();

  if (demoReady && consumeNotice()) {
    setSuccess('Đặt lại mật khẩu thành công (mô phỏng). Bạn có thể đăng nhập lại bằng một email demo.');
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      if (!demoReady) return;
      Store.logout();
      Route.go('login');
    });
  }

  const initialState = new URLSearchParams(window.location.search).get('state') || loginPage.dataset.loginState;
  if (allowedStates.has(initialState)) setStatus(initialState);

  emailInput.addEventListener('input', () => setFieldError(emailInput, emailControl, emailError, ''));
  passwordInput.addEventListener('input', () => setFieldError(passwordInput, passwordInput.closest('.password-control'), passwordError, ''));

  const simulateSubmit = () => {
    if (!validate()) return;
    setStatus('');
    setSuccess('');
    setLoading(true);
    window.setTimeout(() => {
      if (!demoReady) {
        setLoading(false);
        setStatus('demo_unavailable');
        return;
      }
      const result = Store.login(emailInput.value.trim(), null);
      if (!result.ok) {
        // Thất bại thì không đổi persona và không điều hướng.
        setLoading(false);
        setStatus('invalid_credentials');
        return;
      }
      const target = Route.ROUTES[result.persona.homePage] ? result.persona.homePage : 'home';
      setSuccess(`Đã đăng nhập demo với vai trò ${result.persona.label}. Đang chuyển tới ${HOME_LABELS[target] || HOME_LABELS.home}.`);
      submitLabel.textContent = 'Đang chuyển hướng...';
      window.setTimeout(() => Route.go(target), 700);
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
