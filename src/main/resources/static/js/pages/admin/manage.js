/* DAI-03: Quản lý nền tảng dùng dữ liệu máy chủ; script mở hộp thoại đổi trạng thái, kiểm lý do và chống gửi hai lần. */
(() => {
  // Bộ lọc áp dụng ngay khi chọn, không cần bấm nút Lọc.
  document.querySelectorAll('.pl-search select').forEach((select) => {
    select.addEventListener('change', () => select.form.submit());
  });

  const dialog = document.querySelector('[data-status-dialog]');
  if (!dialog) return;
  const form = dialog.querySelector('[data-status-form]');
  const reason = form.querySelector('textarea[name="reason"]');
  const base = (document.querySelector('meta[name="app-base"]') || {}).content || '/';
  const labels = { ACTIVE: 'đang hoạt động', LOCKED: 'đang khóa', DISABLED: 'vô hiệu hóa' };
  const confirms = { LOCKED: 'Khóa tài khoản này?', DISABLED: 'Vô hiệu hóa tài khoản này?', ACTIVE: 'Mở khóa tài khoản này?' };
  let submitting = false;

  document.querySelectorAll('[data-status-open]').forEach((button) => {
    button.addEventListener('click', () => {
      const { userId, userName, userStatus, userVersion } = button.dataset;
      form.action = base.replace(/\/$/, '') + '/admin/manage/users/' + userId + '/status';
      form.querySelector('input[name="version"]').value = userVersion;
      dialog.querySelector('[data-status-name]').textContent = userName;
      dialog.querySelector('[data-status-current]').textContent = labels[userStatus] || userStatus;
      dialog.querySelectorAll('[data-status-action]').forEach((action) => {
        action.hidden = action.dataset.statusAction === userStatus;
      });
      reason.value = '';
      submitting = false;
      dialog.showModal();
      reason.focus();
    });
  });

  dialog.querySelector('[data-status-cancel]').addEventListener('click', () => dialog.close());

  form.addEventListener('submit', (event) => {
    const action = event.submitter && event.submitter.value;
    if (submitting) {
      event.preventDefault();
      return;
    }
    if (reason.value.trim().length < 10) {
      event.preventDefault();
      reason.focus();
      window.alert('Hãy nhập lý do (ít nhất 10 ký tự).');
      return;
    }
    if (action && !window.confirm(confirms[action] || 'Xác nhận thay đổi?')) {
      event.preventDefault();
      return;
    }
    submitting = true;
    // Nút bị vô hiệu hóa không gửi giá trị status, nên giữ lại bằng input ẩn.
    if (action) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'status';
      hidden.value = action;
      form.appendChild(hidden);
    }
    form.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  });
})();
