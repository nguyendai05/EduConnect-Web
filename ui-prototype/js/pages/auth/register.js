(() => {
  const page = document.querySelector('.auth-register-page');
  const form = document.querySelector('[data-register-form]');
  if (!page || !form) return;

  const fields = {
    name: document.querySelector('#register-name'),
    email: document.querySelector('#register-email'),
    phone: document.querySelector('#register-phone'),
    password: document.querySelector('#register-password'),
    confirmPassword: document.querySelector('#register-confirm-password')
  };
  const status = document.querySelector('[data-register-status]');
  const statusContainer = document.querySelector('.auth-register-status');
  const submitButton = document.querySelector('[data-register-submit]');
  const submitLabel = document.querySelector('[data-register-submit-label]');
  const spinner = document.querySelector('.auth-register-form__spinner');

  const setError = (key, message) => {
    const input = fields[key];
    const control = document.querySelector(`[data-register-control="${key === 'confirmPassword' ? 'confirm-password' : key}"]`);
    const messageElement = document.querySelector(`#register-${key === 'confirmPassword' ? 'confirm-password' : key}-error`);
    control?.classList.toggle('is-error', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    messageElement.hidden = !message;
    messageElement.textContent = message;
  };

  const validate = () => {
    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const phone = fields.phone.value.replace(/[\s.-]/g, '');
    const password = fields.password.value;
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validPhone = /^(?:\+84|0)\d{9,10}$/.test(phone);

    setError('name', name.length >= 2 ? '' : 'Vui lòng nhập họ và tên hợp lệ.');
    setError('email', validEmail ? '' : 'Vui lòng nhập địa chỉ email hợp lệ.');
    setError('phone', validPhone ? '' : 'Vui lòng nhập số điện thoại hợp lệ.');
    setError('password', password.length >= 8 ? '' : 'Mật khẩu cần tối thiểu 8 ký tự.');
    setError('confirmPassword', password && password === fields.confirmPassword.value ? '' : 'Mật khẩu xác nhận chưa khớp.');
    return name.length >= 2 && validEmail && validPhone && password.length >= 8 && password === fields.confirmPassword.value;
  };

  const setLoading = (isLoading) => {
    submitButton.disabled = isLoading;
    submitButton.setAttribute('aria-busy', String(isLoading));
    spinner.hidden = !isLoading;
    submitLabel.textContent = isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản';
  };

  const showSuccess = () => {
    form.reset();
    statusContainer.hidden = false;
    status.textContent = 'Tạo tài khoản thành công! Bạn có thể chuyển sang trang đăng nhập.';
    form.hidden = true;
  };

  Object.entries(fields).forEach(([key, input]) => {
    input.addEventListener('input', () => setError(key, ''));
  });

  const simulateSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      showSuccess();
    }, 700);
  };

  submitButton.addEventListener('click', simulateSubmit);
  form.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') {
      event.preventDefault();
      simulateSubmit();
    }
  });
})();
