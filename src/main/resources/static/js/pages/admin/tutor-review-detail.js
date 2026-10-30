/* DAI-02: chi tiết duyệt gia sư — xác nhận lý do khi từ chối và chống gửi quyết định hai lần. */
(() => {
  const form = document.querySelector('[data-review-form]');
  if (!form) return;
  const reason = form.querySelector('#review-reason');
  let submitting = false;
  form.addEventListener('submit', (event) => {
    if (submitting) {
      event.preventDefault();
      return;
    }
    const action = event.submitter && event.submitter.value;
    if (action === 'reject' && reason && reason.value.trim().length < 10) {
      event.preventDefault();
      reason.focus();
      window.alert('Hãy nhập lý do từ chối (ít nhất 10 ký tự).');
      return;
    }
    submitting = true;
    // Nút bị vô hiệu hóa sẽ không gửi giá trị action, nên giữ lại bằng input ẩn.
    if (action) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'action';
      hidden.value = action;
      form.appendChild(hidden);
    }
    form.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  });
})();
