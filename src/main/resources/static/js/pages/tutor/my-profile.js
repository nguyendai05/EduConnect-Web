(() => {
  const page = document.querySelector('.tutor-profile-page');
  const form = document.querySelector('[data-tutor-form]');
  if (!page || !form) return;

  const states = {
    draft: { label: 'Bản nháp', message: 'Hồ sơ đang là bản nháp và chưa đủ điều kiện nhận lớp. Hoàn thiện thông tin rồi gửi duyệt.', alert: 'warning', editable: true, primaryAction: 'Gửi duyệt hồ sơ' },
    pending: { label: 'Chờ duyệt', message: 'Hồ sơ đang chờ xác minh. Trong thời gian này, bạn chưa đủ điều kiện nhận lớp.', alert: 'warning', editable: false, primaryAction: 'Đang chờ duyệt' },
    rejected: { label: 'Cần bổ sung', message: 'Hồ sơ cần bổ sung trước khi có thể gửi xét duyệt lại. Bạn chưa đủ điều kiện nhận lớp.', alert: 'error', editable: true, primaryAction: 'Gửi lại duyệt', rejection: 'Vui lòng bổ sung ảnh chứng chỉ nghiệp vụ sư phạm và mô tả rõ hơn phương pháp giảng dạy.' },
    verified: { label: 'Đã xác minh', message: 'Hồ sơ hiện đã được xác minh. Thay đổi quan trọng sẽ cần được hệ thống xét duyệt lại.', alert: 'success', editable: false, primaryAction: 'Chỉnh sửa hồ sơ' }
  };
  const requestedState = new URLSearchParams(window.location.search).get('state') || page.dataset.tutorState;
  let currentState = Object.hasOwn(states, requestedState) ? requestedState : 'draft';
  let editing = states[currentState].editable;
  const fields = [...document.querySelectorAll('[data-tutor-field]')];
  const editableControls = [...document.querySelectorAll('[data-tutor-editable]')];
  const scheduleButtons = [...document.querySelectorAll('[data-tutor-slot]')];
  const status = document.querySelector('[data-tutor-status-label]');
  const stateMessage = document.querySelector('[data-tutor-state-message]');
  const stateAlert = document.querySelector('.tutor-profile-state-message');
  const rejectionAlert = document.querySelector('.tutor-profile-rejection');
  const rejectionReason = document.querySelector('[data-tutor-rejection-reason]');
  const editButton = document.querySelector('[data-tutor-edit]');
  const cancelButton = document.querySelector('[data-tutor-cancel]');
  const submitButton = document.querySelector('[data-tutor-submit]');
  const bio = document.querySelector('#tutor-bio');
  const bioCount = document.querySelector('[data-tutor-bio-count]');
  const acceptingInput = document.querySelector('[data-tutor-accepting]');
  const acceptingRow = acceptingInput.closest('.switch-row');
  const acceptingTitle = document.querySelector('[data-tutor-accepting-title]');
  const acceptingHelp = document.querySelector('[data-tutor-accepting-help]');
  const initialValues = Object.fromEntries(fields.map((field) => [field.name, field.value]));
  const initialSlots = scheduleButtons.map((button) => button.getAttribute('aria-pressed'));
  const initialEditableValues = editableControls.map((control) => ({ control, checked: control.checked, value: control.value }));

  const setError = (id, message) => {
    const messageElement = document.querySelector(`#${id}-error`);
    const input = document.querySelector(`#${id}`);
    const control = input?.closest('.input-control');
    control?.classList.toggle('is-error', Boolean(message));
    if (!messageElement) return;
    messageElement.hidden = !message;
    messageElement.textContent = message || '';
  };

  const updateBioCount = () => {
    bioCount.textContent = `${bio.value.length}/600`;
  };

  const setEditing = (nextEditing) => {
    editing = nextEditing;
    fields.forEach((field) => { field.disabled = !editing; });
    editableControls.forEach((control) => {
      const isAcceptanceSwitch = control === acceptingInput;
      control.disabled = !editing || (isAcceptanceSwitch && currentState !== 'verified');
    });
    scheduleButtons.forEach((button) => { button.disabled = !editing; });
    editButton.hidden = editing || currentState === 'pending';
    cancelButton.hidden = !editing;
    submitButton.hidden = currentState === 'verified' && !editing;
    submitButton.disabled = currentState === 'pending';
    submitButton.textContent = currentState === 'verified' && editing ? 'Gửi duyệt lại' : states[currentState].primaryAction;
  };

  const applyState = (state) => {
    currentState = state;
    const config = states[state];
    page.dataset.tutorState = state;
    status.textContent = config.label;
    stateMessage.textContent = config.message;
    stateAlert.classList.toggle('alert--success', config.alert === 'success');
    stateAlert.classList.toggle('alert--warning', config.alert === 'warning');
    stateAlert.classList.toggle('alert--error', config.alert === 'error');
    rejectionAlert.hidden = !config.rejection;
    if (config.rejection) rejectionReason.textContent = config.rejection;
    const isVerified = state === 'verified';
    acceptingInput.checked = isVerified;
    acceptingRow.classList.toggle('switch-row--on', isVerified);
    acceptingTitle.textContent = isVerified ? 'Đang nhận lớp mới' : 'Chưa đủ điều kiện nhận lớp';
    acceptingHelp.textContent = isVerified
      ? 'Hồ sơ có thể xuất hiện trong kết quả tìm kiếm khi phù hợp nhu cầu học viên.'
      : 'Hồ sơ cần được xác minh trước khi xuất hiện trong kết quả tìm kiếm.';
    setEditing(config.editable);
    updateBioCount();
  };

  const validate = () => {
    const bioIsValid = bio.value.trim().length >= 50;
    const education = document.querySelector('#tutor-education').value.trim();
    const subjects = document.querySelector('#tutor-subjects').value.trim();
    const rate = Number(document.querySelector('#tutor-rate').value.replace(/\D/g, ''));
    const selectedSlots = scheduleButtons.filter((button) => button.getAttribute('aria-pressed') === 'true').length;
    setError('tutor-bio', bioIsValid ? '' : 'Giới thiệu cần ít nhất 50 ký tự.');
    setError('tutor-education', education ? '' : 'Vui lòng bổ sung trình độ học vấn.');
    setError('tutor-subjects', subjects ? '' : 'Vui lòng nhập ít nhất một môn dạy.');
    setError('tutor-rate', rate > 0 ? '' : 'Học phí cần lớn hơn 0.');
    const scheduleError = document.querySelector('[data-tutor-schedule-error]');
    scheduleError.hidden = selectedSlots > 0;
    scheduleError.textContent = selectedSlots > 0 ? '' : 'Chọn ít nhất một khung giờ rảnh.';
    return bioIsValid && Boolean(education) && Boolean(subjects) && rate > 0 && selectedSlots > 0;
  };

  fields.forEach((field) => field.addEventListener('input', () => { setError(field.id, ''); if (field === bio) updateBioCount(); }));
  scheduleButtons.forEach((button) => button.addEventListener('click', () => { button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true')); document.querySelector('[data-tutor-schedule-error]').hidden = true; }));
  editButton.addEventListener('click', () => setEditing(true));
  cancelButton.addEventListener('click', () => {
    fields.forEach((field) => { field.value = initialValues[field.name]; setError(field.id, ''); });
    initialEditableValues.forEach(({ control, checked, value }) => {
      control.checked = checked;
      control.value = value;
    });
    scheduleButtons.forEach((button, index) => button.setAttribute('aria-pressed', initialSlots[index]));
    document.querySelector('[data-tutor-schedule-error]').hidden = true;
    applyState(currentState);
  });
  submitButton.addEventListener('click', () => { if (editing && validate()) applyState('pending'); else if (currentState === 'verified') setEditing(true); });
  applyState(currentState);
})();
