(() => {
  const form = document.querySelector('[data-profile-form]');
  if (!form || form.dataset.profileInitialized) return;
  form.dataset.profileInitialized = 'true';
  const card = form.closest('.profile-card');
  const editButton = card.querySelector('[data-profile-edit]');
  const saveButton = card.querySelector('[data-profile-save]');
  const cancelButton = card.querySelector('[data-profile-cancel]');
  const statusContainer = card.querySelector('.profile-status');
  const status = card.querySelector('[data-profile-status]');
  const fields = Object.fromEntries(['name', 'email', 'phone', 'bio'].map((key) => [key, form.elements.namedItem(key)]));
  let editing = false;
  let savedValues = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));

  const setError = (key, message) => {
    form.querySelector(`[data-profile-control="${key}"]`)?.classList.toggle('is-error', Boolean(message));
    fields[key].setAttribute('aria-invalid', String(Boolean(message)));
    const error = form.querySelector(`#profile-${key}-error`);
    error.hidden = !message;
    error.textContent = message || '';
  };
  const clearErrors = () => Object.keys(fields).forEach((key) => setError(key, ''));
  const updateBioCount = () => {
    form.querySelector('[data-profile-bio-count]').textContent = `${fields.bio.value.length}/300`;
  };
  const updateDirty = () => {
    form.dataset.profileDirty = String(Object.entries(fields).some(([key, field]) => field.value !== savedValues[key]));
  };
  const setEditing = (next) => {
    editing = next;
    Object.keys(fields).forEach((key) => {
      form.querySelector(`[data-profile-display="${key}"]`).hidden = next;
      form.querySelector(`[data-profile-control="${key}"]`)?.toggleAttribute('hidden', !next);
    });
    fields.bio.hidden = !next;
    form.querySelector('[data-profile-bio-count]').hidden = !next;
    editButton.hidden = next;
    saveButton.hidden = !next;
    cancelButton.hidden = !next;
    updateBioCount();
    updateDirty();
  };
  const validate = () => {
    const errors = {
      name: fields.name.value.trim().length >= 2 ? '' : 'Vui lòng nhập họ và tên hợp lệ.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value.trim()) ? '' : 'Vui lòng nhập địa chỉ email hợp lệ.',
      phone: /^(?:\+84|0)\d{9,10}$/.test(fields.phone.value.replace(/[\s.-]/g, '')) ? '' : 'Vui lòng nhập số điện thoại hợp lệ.',
      bio: fields.bio.value.length <= 300 ? '' : 'Giới thiệu không được vượt quá 300 ký tự.'
    };
    Object.entries(errors).forEach(([key, message]) => setError(key, message));
    const invalidKey = Object.keys(errors).find((key) => errors[key]);
    if (invalidKey) fields[invalidKey].focus();
    return !invalidKey;
  };
  const showStatus = (message) => {
    status.textContent = message;
    statusContainer.hidden = false;
  };
  const save = () => {
    if (!editing) return;
    if (!validate()) return;
    savedValues = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value.trim()]));
    Object.entries(savedValues).forEach(([key, value]) => { fields[key].value = value; });
    form.querySelector('[data-profile-display="name"]').textContent = savedValues.name;
    form.querySelector('[data-profile-display-email]').textContent = savedValues.email;
    form.querySelector('[data-profile-display="phone"]').textContent = savedValues.phone;
    const bioDisplay = form.querySelector('[data-profile-display="bio"]');
    bioDisplay.textContent = savedValues.bio || 'Chưa có giới thiệu. Hãy thêm vài dòng để mọi người hiểu hơn về bạn.';
    bioDisplay.classList.toggle('profile-value--empty', !savedValues.bio);
    const initials = savedValues.name.split(/\s+/).filter(Boolean).slice(-2).map((part) => Array.from(part)[0]).join('').toLocaleUpperCase('vi');
    card.querySelector('[data-profile-display-name]').textContent = savedValues.name;
    card.querySelector('[data-profile-avatar]').textContent = initials;
    showStatus('Đã áp dụng thay đổi trên giao diện. Chưa lưu vào hệ thống; tải lại trang sẽ khôi phục dữ liệu được cấp ban đầu.');
    setEditing(false);
    editButton.focus();
  };

  // No GET/PATCH calls or owner fields until A02 is available. Prevent Enter from sending form data.
  form.addEventListener('submit', (event) => { event.preventDefault(); save(); });
  editButton.disabled = false;
  editButton.addEventListener('click', () => {
    clearErrors();
    statusContainer.hidden = true;
    setEditing(true);
    fields.name.focus();
  });
  cancelButton.addEventListener('click', () => {
    Object.entries(savedValues).forEach(([key, value]) => { fields[key].value = value; });
    clearErrors();
    statusContainer.hidden = true;
    setEditing(false);
    editButton.focus();
  });
  Object.entries(fields).forEach(([key, field]) => field.addEventListener('input', () => {
    setError(key, '');
    if (key === 'bio') updateBioCount();
    updateDirty();
  }));
  const initialErrors = Object.fromEntries(Object.keys(fields).map((key) => [key, form.querySelector(`#profile-${key}-error`).textContent.trim()]));
  Object.entries(initialErrors).forEach(([key, message]) => setError(key, message));
  setEditing(Object.values(initialErrors).some(Boolean));
})();
