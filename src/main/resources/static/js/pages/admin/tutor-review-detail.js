(() => {
  const page = document.querySelector('[data-tutor-review-detail]');
  if (!page) return;
  const store = window.EduTutorReview;
  const statuses = store.statuses;
  const requested = new URLSearchParams(window.location.search).get('id');
  const all = store.list();
  //Mã `id` thiếu hoặc không tồn tại → rơi về hồ sơ đầu tiên trong hàng đợi.
  let profile = store.get(requested) || all[0];
  const currency = new Intl.NumberFormat('vi-VN');
  const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  const formatDate = value => `${dateFormat.format(new Date(value))} · ${timeFormat.format(new Date(value))}`;
  const setText = (selector, value) => { page.querySelector(selector).textContent = value; };
  const setBadge = (selector, className, label) => { const badge = page.querySelector(selector); badge.className = `badge ${className}`; badge.textContent = label; };
  const approveModal = page.querySelector('#review-approve-modal');
  const rejectModal = page.querySelector('#review-reject-modal');
  const previewModal = page.querySelector('#review-file-modal');
  const reason = page.querySelector('[data-reject-reason]');
  const reasonError = page.querySelector('[data-reason-error]');
  const decision = page.querySelector('[data-detail-decision]');
  const fileStatus = {
    pending: { badge: 'badge--warning', label: 'Chờ duyệt' },
    approved: { badge: 'badge--success', label: 'Tệp hợp lệ' },
    rejected: { badge: 'badge--danger', label: 'Tệp bị từ chối' },
  };
  let errorToast;

  const renderSubjects = () => {
    const body = page.querySelector('[data-detail-subjects]');
    const fragment = document.createDocumentFragment();
    profile.subjects.forEach(subject => {
      const row = document.createElement('tr');
      const name = document.createElement('th');
      name.scope = 'row';
      name.textContent = subject.label;
      const level = document.createElement('td');
      level.textContent = subject.level;
      const format = document.createElement('td');
      format.textContent = profile.formats.join(' & ') || 'Chưa chọn hình thức';
      const rate = document.createElement('td');
      rate.className = 'table__amount';
      rate.textContent = `${currency.format(subject.rate)} ₫ / ${subject.duration}p`;
      row.append(name, level, format, rate);
      fragment.append(row);
    });
    body.replaceChildren(fragment);
  };

  const renderSlots = () => {
    const fragment = document.createDocumentFragment();
    const items = profile.slots.length ? profile.slots : ['Chưa cấu hình lịch rảnh'];
    items.forEach(slot => {
      const item = document.createElement('li');
      item.textContent = slot;
      fragment.append(item);
    });
    page.querySelector('[data-detail-slots]').replaceChildren(fragment);
  };

  const renderFiles = () => {
    const list = page.querySelector('[data-detail-files]');
    const fragment = document.createDocumentFragment();
    profile.files.forEach((file, index) => {
      const item = document.createElement('li');
      item.className = 'file-attachment-item';
      const symbol = document.createElement('span');
      symbol.className = 'file-attachment-item__symbol';
      symbol.setAttribute('aria-hidden', 'true');
      const icon = document.createElement('span');
      icon.className = `component-icon component-icon--${file.type === 'PDF' ? 'file' : 'image'}`;
      symbol.append(icon);
      const body = document.createElement('div');
      body.className = 'file-attachment-item__body';
      const name = document.createElement('h3');
      name.className = 'file-attachment-item__name';
      name.textContent = file.name;
      const badge = document.createElement('span');
      badge.className = `badge ${fileStatus[file.status].badge}`;
      badge.textContent = fileStatus[file.status].label;
      const meta = document.createElement('p');
      meta.className = 'file-attachment-item__meta';
      meta.textContent = `${file.type} · ${file.size} · Tải lên ${formatDate(file.uploadedAt)}`;
      const label = document.createElement('p');
      label.className = 'tutor-review-detail__file-label';
      label.textContent = file.label;
      body.append(name, badge, meta, label);
      const actions = document.createElement('div');
      actions.className = 'file-attachment-item__actions';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button--outline button--small';
      button.dataset.filePreview = String(index);
      const eye = document.createElement('span');
      eye.className = 'component-icon component-icon--eye';
      eye.setAttribute('aria-hidden', 'true');
      button.append(eye, document.createTextNode('Xem trước'));
      button.setAttribute('aria-label', `Xem trước tệp ${file.name}`);
      actions.append(button);
      item.append(symbol, body, actions);
      fragment.append(item);
    });
    list.replaceChildren(fragment);
    page.querySelector('[data-detail-files-empty]').hidden = profile.files.length > 0;
    setBadge('[data-detail-files-count]', profile.fileTotal ? (profile.filePending ? 'badge--warning' : profile.fileRejected ? 'badge--danger' : 'badge--success') : 'badge--neutral', profile.fileTotal ? `${profile.fileTotal} tệp · ${profile.filePending} chờ duyệt` : 'Chưa có minh chứng');
    setText('[data-summary-files]', profile.fileTotal ? `${profile.fileTotal} tệp (${profile.fileApproved} hợp lệ · ${profile.filePending} chờ)` : '0 tệp');
  };

  const render = () => {
    const found = Boolean(profile);
    page.querySelector('[data-detail-content]').hidden = !found;
    page.querySelector('[data-detail-not-found]').hidden = found;
    page.querySelector('[data-detail-status]').hidden = !found;
    if (!found) {
      document.title = 'Không tìm thấy hồ sơ gia sư | Edu Connect';
      return;
    }
    document.title = `${profile.id} · Chi tiết duyệt hồ sơ gia sư | Edu Connect`;
    try {
      window.history.replaceState({}, '', `${window.location.pathname}?id=${encodeURIComponent(profile.id)}`);
    } catch {
      // File:// hoặc môi trường bị chặn lịch sử: bỏ qua, trang vẫn hiển thị đúng hồ sơ.
    }
    setText('[data-detail-viewing-id]', profile.id);
    setText('[data-detail-viewing-name]', profile.tutor);
    setText('[data-detail-avatar]', profile.initials);
    setText('[data-detail-tutor]', profile.tutor);
    setText('[data-detail-kind]', profile.kindLabel);
    setText('[data-detail-profile-tag]', profile.profileTag);
    setText('[data-detail-acceptance]', profile.capacity);
    page.querySelector('[data-detail-acceptance]').className = `badge ${profile.status === 'verified' ? 'badge--success' : profile.status === 'draft' ? 'badge--neutral' : 'badge--info'}`;
    // Chỉ hồ sơ trạng thái verified mới được mang dấu "Đã xác minh".
    setBadge('[data-detail-verified-note]', profile.isVerified ? 'badge--success' : 'badge--neutral', profile.isVerified ? 'Đã xác minh trên hệ thống' : 'Chưa được xác minh');
    setText('[data-detail-region]', profile.region);
    setText('[data-detail-email]', profile.contact.email);
    setText('[data-detail-phone]', profile.contact.phone);
    setText('[data-detail-citizen-id]', profile.contact.citizenId);
    setText('[data-detail-intro]', profile.intro);
    setText('[data-detail-education-level]', profile.educationLevel);
    setText('[data-detail-education-note]', profile.educationNote);
    setText('[data-detail-school]', profile.school);
    setText('[data-detail-school-years]', profile.schoolYears);
    setText('[data-detail-major]', profile.major);
    setText('[data-detail-faculty]', profile.faculty);
    setText('[data-detail-experience]', `${profile.experienceYears} năm kinh nghiệm`);
    setText('[data-detail-experience-note]', profile.experienceNote);
    setText('[data-detail-subject-count]', `${profile.subjects.length} môn / cấp đăng ký`);
    renderSubjects();
    setText('[data-detail-region-2]', profile.region);
    setText('[data-detail-area-detail]', profile.areaDetail);
    setText('[data-detail-formats]', profile.formats.join(' & ') || 'Chưa chọn');
    setText('[data-detail-capacity]', profile.capacity);
    setText('[data-detail-capacity-note]', profile.status === 'draft' ? 'Hồ sơ nháp, chưa mở nhận lớp' : 'Áp dụng sau khi hồ sơ được duyệt');
    renderSlots();
    renderFiles();
    const submitted = page.querySelector('[data-detail-submitted]');
    submitted.dateTime = profile.submitted;
    submitted.textContent = formatDate(profile.submitted);
    page.querySelector('[data-detail-signal-card]').hidden = !profile.reviewFlag;
    page.querySelector('[data-detail-flag]').hidden = !profile.reviewFlag;
    setText('[data-detail-signal]', profile.reviewFlag || '');
    setText('[data-summary-id]', profile.id);
    setText('[data-summary-tutor]', profile.tutor);
    setText('[data-summary-kind]', profile.kindLabel);
    setText('[data-summary-submitted]', formatDate(profile.submitted));
    setText('[data-summary-subjects]', `${profile.subjects.length} môn / cấp`);
    setBadge('[data-detail-status]', profile.statusBadge, profile.statusLabel);
    setBadge('[data-summary-status]', profile.statusBadge, profile.statusLabel);

    const blocked = page.querySelector('[data-detail-blocked]');
    blocked.hidden = !(profile.status === 'pending' && profile.evidenceMissing.length);
    setText('[data-detail-blocked-list]', profile.evidenceMissing.join(' · '));

    const approve = page.querySelector('[data-review-approve]');
    const reject = page.querySelector('[data-review-reject]');
    approve.disabled = !profile.isReviewable;
    reject.disabled = profile.status !== 'pending';
    setText('[data-approve-help]', profile.status === 'pending'
      ? (profile.isReviewable ? 'Cấp dấu Đã duyệt; hồ sơ sẽ xuất hiện trong kết quả tìm gia sư.' : `Chưa thể xác minh vì hồ sơ còn thiếu: ${profile.evidenceMissing.join(', ')}.`)
      : 'Chỉ hồ sơ ở trạng thái Chờ duyệt mới có thể xác minh.');
    setText('[data-reject-help]', profile.status === 'pending'
      ? 'Nhập lý do từ chối (10–1000 ký tự) để gia sư bổ sung và gửi lại hồ sơ.'
      : profile.status === 'rejected' ? 'Hồ sơ đã bị từ chối; xem lý do ở khối trạng thái phía trên.'
        : profile.status === 'verified' ? 'Hồ sơ đã duyệt, không thể từ chối lần nữa trong prototype.'
          : 'Hồ sơ còn ở dạng nháp, chưa được gửi để kiểm duyệt.');

    decision.hidden = profile.status === 'pending';
    if (!decision.hidden) {
      const rejected = profile.status === 'rejected';
      const approved = profile.status === 'verified';
      decision.classList.toggle('alert--warning', rejected || profile.status === 'draft');
      decision.classList.toggle('alert--success', approved);
      setText('[data-decision-title]', rejected ? 'Hồ sơ đã bị từ chối' : approved ? 'Hồ sơ đã được xác minh' : 'Hồ sơ đang ở dạng nháp');
      const reviewed = profile.reviewedAt ? `Xử lý lúc ${formatDate(profile.reviewedAt)} · ${profile.reviewer || 'Quản trị viên'}. ` : '';
      setText('[data-decision-description]', rejected
        ? `${reviewed}Lý do từ chối: ${profile.reason || 'Hồ sơ chưa đạt yêu cầu xác minh.'}`
        : approved ? `${reviewed}Gia sư đã mang dấu Đã duyệt và được hiển thị trong kết quả tìm gia sư.` : 'Gia sư chưa gửi hồ sơ để kiểm duyệt; hệ thống không cấp dấu xác minh cho hồ sơ nháp.');
    }

    const pendingCount = store.list().filter(item => item.status === 'pending').length;
    const sidebarCount = page.querySelector('.admin-sidebar__item.is-active .admin-sidebar__badge');
    sidebarCount.textContent = pendingCount;
    sidebarCount.setAttribute('aria-label', `${pendingCount} hồ sơ chờ xử lý`);
  };

  const clearReasonError = () => {
    reason.removeAttribute('aria-invalid');
    reasonError.hidden = true;
    setText('[data-reason-count]', `${reason.value.length}/1000`);
    page.querySelector('[data-review-error="reject"]').hidden = true;
  };

  const submitReview = action => {
    if (!profile || profile.status !== 'pending') return;
    const rejecting = action === 'reject';
    const modal = rejecting ? rejectModal : approveModal;
    const message = modal.querySelector('[data-review-error]');
    message.hidden = true;
    if (rejecting && (reason.value.trim().length < 10 || reason.value.trim().length > 1000)) {
      setText('[data-reason-error]', 'Vui lòng nhập lý do từ chối từ 10 đến 1000 ký tự.');
      reasonError.hidden = false;
      reason.setAttribute('aria-invalid', 'true');
      reason.focus();
      return;
    }
    try {
      profile = store.review(profile.id, rejecting ? 'rejected' : 'verified', reason.value);
      render();
      window.EduModal.close(modal, 'confirm');
      errorToast?.close();
      window.EduToast.show({ type: 'success', title: rejecting ? 'Đã từ chối hồ sơ' : 'Đã xác minh hồ sơ thành công', message: rejecting ? `${profile.id} được lưu cùng lý do từ chối và hiển thị lại ở hàng đợi.` : `${profile.id} đã chuyển sang Đã duyệt.`, duration: 6000 });
      window.setTimeout(() => decision.focus(), 0);
    } catch {
      message.textContent = 'Chưa thể lưu kết quả kiểm duyệt. Vui lòng thử lại hoặc kiểm tra quyền lưu dữ liệu của trình duyệt. Trạng thái hồ sơ chưa thay đổi.';
      message.hidden = false;
      errorToast?.close();
      errorToast = window.EduToast.show({ type: 'error', title: 'Không thể lưu kết quả', message: 'Trạng thái hồ sơ chưa thay đổi. Bạn có thể thử lại.', duration: 0 });
    }
  };

  page.querySelector('[data-review-approve]').addEventListener('click', () => {
    if (!profile || !profile.isReviewable) return;
    setText('[data-approve-id]', profile.id);
    setText('[data-approve-tutor]', profile.tutor);
    setText('[data-approve-education]', `${profile.educationLevel} · ${profile.school} · ${profile.major}`);
    setText('[data-approve-files]', profile.fileTotal ? `${profile.fileTotal} tệp (${profile.fileApproved} hợp lệ · ${profile.filePending} chờ duyệt)` : 'Chưa có tệp minh chứng');
    page.querySelector('[data-approve-warning]').hidden = !profile.reviewFlag;
    setText('[data-approve-signal]', `${profile.reviewFlag} Hãy chắc chắn minh chứng đã được đối chiếu trước khi cấp dấu Đã duyệt.`);
    page.querySelector('[data-review-error="approve"]').hidden = true;
    window.EduModal.open(approveModal, { title: 'Xác minh hồ sơ gia sư', message: `Nếu xác nhận, hồ sơ ${profile.id} chuyển từ "Chờ duyệt" sang "Đã duyệt" và xuất hiện công khai trong danh sách tìm gia sư.`, confirmText: 'Xác nhận hồ sơ', cancelText: 'Xem lại' });
  });

  page.querySelector('[data-review-reject]').addEventListener('click', () => {
    if (!profile || profile.status !== 'pending') return;
    clearReasonError();
    window.EduModal.open(rejectModal, { variant: 'danger', title: 'Từ chối hồ sơ gia sư', message: `Yêu cầu gia sư ${profile.tutor} bổ sung hoặc chỉnh sửa hồ sơ. Lý do hiển thị kèm trạng thái Bị từ chối.`, confirmText: 'Xác nhận từ chối', cancelText: 'Xem lại' });
    reason.focus();
  });

  page.querySelector('[data-detail-files]').addEventListener('click', event => {
    const button = event.target.closest('[data-file-preview]');
    if (!button) return;
    const file = profile.files[Number(button.dataset.filePreview)];
    if (!file) return;
    setText('[data-preview-name]', file.name);
    setText('[data-preview-meta]', `${file.type} · ${file.size}`);
    setText('[data-preview-uploaded]', formatDate(file.uploadedAt));
    setText('[data-preview-label]', file.label);
    setText('[data-preview-paper-owner]', profile.tutor);
    setBadge('[data-preview-status]', fileStatus[file.status].badge, `${fileStatus[file.status].label} · chưa quyết định cho hồ sơ`);
    window.EduModal.open(previewModal, { variant: 'info', title: `Xem trước tệp · ${file.name}`, message: 'Bản xem trước chỉ hiển thị trong phiên của quản trị viên; đường dẫn lưu trữ không được công khai.', cancelText: 'Đóng cửa sổ' });
  });

  approveModal.addEventListener('modal:confirm', event => { event.preventDefault(); submitReview('approve'); });
  rejectModal.addEventListener('modal:confirm', event => { event.preventDefault(); submitReview('reject'); });
  reason.addEventListener('input', clearReasonError);
  const templates = {
    education: 'Thông tin học vấn chưa đủ căn cứ đối chiếu với tệp bằng cấp đã tải lên. Vui lòng cập nhật trình độ, trường đào tạo, chuyên ngành và tải lại văn bằng trước khi gửi lại hồ sơ.',
    files: 'Tệp minh chứng không đọc được hoặc còn thiếu chứng chỉ nghiệp vụ. Vui lòng tải lại tệp PDF/JPG/PNG rõ nét, đúng dung lượng tối đa 5 MB và còn hiệu lực.',
    rates: 'Danh mục môn dạy và mức học phí đề xuất chưa thống nhất với cấp học đã đăng ký. Vui lòng rà soát lại bảng môn dạy, thời lượng buổi học và học phí từng cấp.',
    contact: 'Phần giới thiệu hoặc thông tin hồ sơ chứa dữ liệu liên hệ ngoài nền tảng. Vui lòng loại bỏ số điện thoại, email, tài khoản mạng xã hội và đường dẫn liên hệ trực tiếp trước khi gửi lại.',
  };
  page.querySelectorAll('[data-reason-template]').forEach(button => button.addEventListener('click', () => {
    reason.value = templates[button.dataset.reasonTemplate];
    clearReasonError();
    reason.focus();
  }));

  if (requested && profile && !store.get(requested)) {
    window.EduToast?.show({ type: 'warning', title: 'Mã hồ sơ không tồn tại', message: `Không tìm thấy hồ sơ ${requested}. Trang đang hiển thị hồ sơ ${profile.id} đầu tiên trong hàng đợi.`, duration: 8000 });
  }
  render();
})();
