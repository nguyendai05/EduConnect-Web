(() => {
  const form = document.querySelector('[data-profile-form]');
  if (!form) return;

  const editButton = document.querySelector('[data-profile-edit]');
  const saveButton = document.querySelector('[data-profile-save]');
  const cancelButton = document.querySelector('[data-profile-cancel]');
  const statusContainer = document.querySelector('.profile-status');
  const status = document.querySelector('[data-profile-status]');
  const avatar = document.querySelector('[data-profile-avatar]');
  const displayName = document.querySelector('[data-profile-display-name]');
  const fields = {
    name: document.querySelector('#profile-name'),
    email: document.querySelector('#profile-email'),
    phone: document.querySelector('#profile-phone'),
    bio: document.querySelector('#profile-bio')
  };
  const initialValues = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));

  const setEditing = (isEditing) => {
    Object.keys(fields).forEach((key) => {
      document.querySelector(`[data-profile-display="${key}"]`).hidden = isEditing;
      document.querySelector(`[data-profile-control="${key}"]`)?.toggleAttribute('hidden', !isEditing);
    });
    fields.bio.hidden = !isEditing;
    document.querySelector('[data-profile-bio-count]').hidden = !isEditing;
    editButton.hidden = isEditing;
    saveButton.hidden = !isEditing;
    cancelButton.hidden = !isEditing;
  };

  const setError = (key, message) => {
    const control = document.querySelector(`[data-profile-control="${key}"]`);
    const error = document.querySelector(`#profile-${key}-error`);
    control?.classList.toggle('is-error', Boolean(message));
    if (!error) return;
    error.hidden = !message;
    error.textContent = message || '';
  };

  const updateBioCount = () => {
    const counter = document.querySelector('[data-profile-bio-count]');
    counter.textContent = `${fields.bio.value.length}/300`;
  };

  const validate = () => {
    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const phone = fields.phone.value.replace(/[\s.-]/g, '');
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validPhone = /^(?:\+84|0)\d{9,10}$/.test(phone);
    setError('name', name.length >= 2 ? '' : 'Vui lòng nhập họ và tên hợp lệ.');
    setError('email', validEmail ? '' : 'Vui lòng nhập địa chỉ email hợp lệ.');
    setError('phone', validPhone ? '' : 'Vui lòng nhập số điện thoại hợp lệ.');
    return name.length >= 2 && validEmail && validPhone;
  };

  const initialsFromName = (name) => name.trim().split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase();

  editButton.addEventListener('click', () => {
    statusContainer.hidden = true;
    setEditing(true);
    updateBioCount();
    fields.name.focus();
  });

  cancelButton.addEventListener('click', () => {
    Object.entries(initialValues).forEach(([key, value]) => { fields[key].value = value; setError(key, ''); });
    setEditing(false);
  });

  saveButton.addEventListener('click', () => {
    if (!validate()) return;
    const name = fields.name.value.trim();
    document.querySelector('[data-profile-display="name"]').textContent = name;
    document.querySelector('[data-profile-display-email]').textContent = fields.email.value.trim();
    document.querySelector('[data-profile-display="phone"]').textContent = fields.phone.value.trim();
    document.querySelector('[data-profile-display="bio"]').textContent = fields.bio.value.trim() || 'Chưa có giới thiệu. Hãy thêm vài dòng để mọi người hiểu hơn về bạn.';
    displayName.textContent = name;
    avatar.textContent = initialsFromName(name);
    Object.entries(fields).forEach(([key, field]) => {
      initialValues[key] = field.value;
    });
    status.textContent = 'Đã lưu thay đổi hồ sơ trên phiên xem trước.';
    statusContainer.hidden = false;
    setEditing(false);
  });

  Object.entries(fields).forEach(([key, field]) => field.addEventListener('input', () => { setError(key, ''); if (key === 'bio') updateBioCount(); }));
})();
