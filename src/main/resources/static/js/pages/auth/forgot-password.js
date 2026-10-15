(() => {
  const page = document.querySelector('[data-forgot-page]');
  if (!page) return;

  const form = page.querySelector('[data-forgot-form]');
  const emailInput = page.querySelector('#forgot-email');
  const emailControl = page.querySelector('[data-forgot-email-control]');
  const emailError = page.querySelector('#forgot-email-error');
  const statusAlert = page.querySelector('[data-forgot-status]');
  const statusMessage = page.querySelector('[data-forgot-status-message]');
  const receivedAlert = page.querySelector('[data-forgot-received]');
  const submitButton = page.querySelector('[data-forgot-submit]');
  const submitLabel = page.querySelector('[data-forgot-submit-label]');
  const submitSpinner = page.querySelector('[data-forgot-submit-spinner]');

  if (!form || !emailInput || !submitButton) return;

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setFieldError = (message) => {
    emailControl.classList.toggle('is-error', Boolean(message));
    emailInput.setAttribute('aria-invalid', String(Boolean(message)));
    emailError.hidden = !message;
    emailError.textContent = message;
  };

  const setStatus = (message) => {
    statusAlert.hidden = !message;
    statusMessage.textContent = message || '';
  };

  const setLoading = (loading) => {
    submitButton.disabled = loading;
    submitButton.setAttribute('aria-busy', String(loading));
    submitSpinner.hidden = !loading;
    submitLabel.textContent = loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu';
  };

  const validate = () => {
    const email = emailInput.value.trim();
    if (!email) {
      setFieldError('Vui lòng nhập email.');
      return false;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setFieldError('Vui lòng nhập địa chỉ email hợp lệ.');
      return false;
    }
    setFieldError('');
    return true;
  };

  const submit = () => {
    receivedAlert.hidden = true;
    if (!validate()) {
      // Nhánh lỗi duy nhất của demo: validate client-side, không gọi mạng nên không có lỗi máy chủ.
      setStatus('Chưa gửi được yêu cầu. Hãy kiểm tra lại địa chỉ email rồi thử lại.');
      emailInput.focus();
      return;
    }
    setStatus('');
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      receivedAlert.hidden = false;
    }, 800);
  };

  emailInput.addEventListener('input', () => {
    setFieldError('');
    setStatus('');
    receivedAlert.hidden = true;
  });

  submitButton.addEventListener('click', submit);

  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.target.tagName === 'BUTTON') return;
    event.preventDefault();
    submit();
  });
})();
