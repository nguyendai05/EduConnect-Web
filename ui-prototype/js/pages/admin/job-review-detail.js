(() => {
  const page = document.querySelector('[data-job-review-detail]');
  if (!page) return;
  const store = window.EduJobReview;
  const id = new URLSearchParams(window.location.search).get('id') || 'TT-8841';
  let job = store.get(id);
  const statuses = {
    pending: { label: 'Chờ duyệt', badge: 'badge--warning' },
    hiring: { label: 'Đang tuyển', badge: 'badge--success' },
    closed: { label: 'Đã đóng', badge: 'badge--neutral' },
    rejected: { label: 'Bị từ chối', badge: 'badge--danger' },
  };
  const setText = (selector, value) => { page.querySelector(selector).textContent = value; };
  const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  const formatDate = value => `${dateFormat.format(new Date(value))} · ${timeFormat.format(new Date(value))}`;
  const approveModal = page.querySelector('#review-approve-modal');
  const rejectModal = page.querySelector('#review-reject-modal');
  const reason = page.querySelector('[data-reject-reason]');
  const reasonError = page.querySelector('[data-reason-error]');
  const decision = page.querySelector('[data-detail-decision]');
  let errorToast;

  const render = () => {
    const found = Boolean(job);
    page.querySelector('[data-detail-content]').hidden = !found;
    page.querySelector('[data-detail-not-found]').hidden = found;
    page.querySelector('[data-detail-status]').hidden = !found;
    if (!found) {
      document.title = 'Không tìm thấy tin | Edu Connect';
      return;
    }
    document.title = `${job.id} · Chi tiết duyệt tin | Edu Connect`;
    setText('[data-detail-avatar]', job.initials);
    setText('[data-detail-poster]', job.poster);
    setText('[data-detail-poster-role]', job.role);
    setText('[data-detail-student]', `Đối tượng học: ${job.grade}`);
    setText('[data-detail-id]', job.id);
    setText('[data-detail-title]', job.title);
    setText('[data-detail-description]', job.description);
    setText('[data-detail-subject]', job.subjectLabel);
    setText('[data-detail-grade]', job.grade);
    setText('[data-detail-duration]', `${job.sessions} · ${job.duration}`);
    setText('[data-detail-budget]', `${new Intl.NumberFormat('vi-VN').format(job.fee)} ₫ / buổi`);
    setText('[data-detail-format]', job.format);
    setText('[data-detail-region]', job.region);
    setText('[data-detail-experience]', job.experience);
    setText('[data-detail-qualification]', job.qualification);
    setText('[data-detail-gender]', job.gender);
    setText('[data-detail-tutor-note]', job.tutorNote);
    const submitted = page.querySelector('[data-detail-submitted]');
    submitted.dateTime = job.submitted;
    submitted.textContent = formatDate(job.submitted);
    const schedule = document.createDocumentFragment();
    job.schedule.forEach(session => {
      const item = document.createElement('li');
      item.textContent = session;
      schedule.append(item);
    });
    page.querySelector('[data-detail-schedule]').replaceChildren(schedule);
    page.querySelector('[data-detail-signal-card]').hidden = !job.signal;
    page.querySelector('[data-detail-flag]').hidden = !job.signal;
    setText('[data-detail-signal]', job.signal);
    setText('[data-detail-private-note]', job.privateNote || 'Không có ghi chú bổ sung.');
    setText('[data-summary-id]', job.id);
    setText('[data-summary-poster]', job.poster);
    setText('[data-summary-subject]', `${job.subjectLabel} · ${job.grade}`);
    setText('[data-summary-signal]', job.signal ? 'Cần kiểm tra' : 'Bình thường');
    ['[data-detail-status]', '[data-summary-status]'].forEach(selector => {
      const badge = page.querySelector(selector);
      badge.className = `badge ${statuses[job.status].badge}`;
      badge.textContent = statuses[job.status].label;
    });
    page.querySelectorAll('[data-review-approve], [data-review-reject]').forEach(button => { button.disabled = job.status !== 'pending'; });
    const pendingCount = store.list().filter(item => item.status === 'pending').length;
    const sidebarCount = page.querySelector('.admin-sidebar__item.is-active .admin-sidebar__badge');
    sidebarCount.textContent = pendingCount;
    sidebarCount.setAttribute('aria-label', `${pendingCount} tin chờ xử lý`);
    decision.hidden = job.status === 'pending';
    if (!decision.hidden) {
      const rejected = job.status === 'rejected';
      const approved = job.status === 'hiring';
      decision.classList.toggle('alert--warning', rejected);
      decision.classList.toggle('alert--success', approved);
      setText('[data-decision-title]', rejected ? 'Tin đã bị từ chối' : approved ? 'Tin đang tuyển gia sư' : 'Tin đã đóng');
      const reviewed = job.reviewedAt ? `Xử lý lúc ${formatDate(job.reviewedAt)}. ` : '';
      setText('[data-decision-description]', rejected ? `${reviewed}Lý do: ${job.reason || 'Nội dung chứa thông tin liên hệ ngoài nền tảng; cần chỉnh sửa trước khi gửi lại.'}` : `${reviewed}${approved ? 'Tin đã được duyệt và chuyển sang trạng thái Đang tuyển.' : 'Tin không còn nhận hồ sơ ứng tuyển.'}`);
    }
  };

  const clearReasonError = () => {
    reason.removeAttribute('aria-invalid');
    reasonError.hidden = true;
    setText('[data-reason-count]', `${reason.value.length}/1000`);
    page.querySelector('[data-review-error="reject"]').hidden = true;
  };
  const submitReview = action => {
    if (!job || job.status !== 'pending') return;
    const rejecting = action === 'reject';
    const modal = rejecting ? rejectModal : approveModal;
    const message = modal.querySelector('[data-review-error]');
    message.hidden = true;
    if (rejecting && (reason.value.trim().length < 10 || reason.value.trim().length > 1000)) {
      reasonError.textContent = 'Vui lòng nhập lý do từ chối từ 10 đến 1000 ký tự.';
      reasonError.hidden = false;
      reason.setAttribute('aria-invalid', 'true');
      reason.focus();
      return;
    }
    try {
      job = store.review(job.id, rejecting ? 'rejected' : 'hiring', reason.value);
      render();
      window.EduModal.close(modal, 'confirm');
      errorToast?.close();
      window.EduToast.show({ type: 'success', title: rejecting ? 'Đã từ chối tin' : 'Đã duyệt tin thành công', message: rejecting ? `${job.id} đã được lưu cùng lý do từ chối.` : `${job.id} đã chuyển sang Đang tuyển.`, duration: 6000 });
      window.setTimeout(() => decision.focus(), 0);
    } catch {
      message.textContent = 'Chưa thể lưu kết quả kiểm duyệt. Vui lòng thử lại hoặc kiểm tra quyền lưu dữ liệu của trình duyệt. Trạng thái tin chưa thay đổi.';
      message.hidden = false;
      errorToast?.close();
      errorToast = window.EduToast.show({ type: 'error', title: 'Không thể lưu kết quả', message: 'Trạng thái tin chưa thay đổi. Bạn có thể thử lại.', duration: 0 });
    }
  };
  page.querySelector('[data-review-approve]').addEventListener('click', () => {
    if (!job || job.status !== 'pending') return;
    setText('[data-approve-id]', job.id);
    setText('[data-approve-title]', job.title);
    setText('[data-approve-poster]', job.poster);
    page.querySelector('[data-approve-warning]').hidden = !job.signal;
    setText('[data-approve-signal]', `${job.signal}. Hãy chắc chắn nội dung đã được rà soát trước khi duyệt.`);
    page.querySelector('[data-review-error="approve"]').hidden = true;
    window.EduModal.open(approveModal, { title: 'Xác nhận duyệt tin', message: 'Sau khi xác nhận, tin sẽ chuyển sang Đang tuyển và hiển thị tới gia sư. Thao tác này không tạo hợp đồng hoặc thu phí.', confirmText: 'Xác nhận duyệt', cancelText: 'Xem lại' });
  });
  page.querySelector('[data-review-reject]').addEventListener('click', () => {
    if (!job || job.status !== 'pending') return;
    clearReasonError();
    window.EduModal.open(rejectModal, { variant: 'danger', title: 'Từ chối tin tìm gia sư', message: 'Nêu rõ nội dung cần chỉnh sửa để người đăng có thể gửi lại tin.', confirmText: 'Xác nhận từ chối', cancelText: 'Xem lại' });
    reason.focus();
  });
  approveModal.addEventListener('modal:confirm', event => { event.preventDefault(); submitReview('approve'); });
  rejectModal.addEventListener('modal:confirm', event => { event.preventDefault(); submitReview('reject'); });
  reason.addEventListener('input', clearReasonError);
  const templates = {
    contact: 'Nội dung có thông tin liên hệ ngoài nền tảng. Vui lòng loại bỏ số điện thoại, tài khoản mạng xã hội hoặc đường dẫn liên hệ trước khi gửi lại tin.',
    budget: 'Ngân sách và cách tính học phí chưa rõ ràng. Vui lòng bổ sung mức học phí theo buổi, thời lượng và tần suất học trước khi gửi lại tin.',
    content: 'Nội dung chưa đủ chi tiết. Vui lòng bổ sung mục tiêu học tập, môn và cấp lớp, lịch học, khu vực, hình thức học và yêu cầu đối với gia sư.',
  };
  page.querySelectorAll('[data-reason-template]').forEach(button => button.addEventListener('click', () => {
    reason.value = templates[button.dataset.reasonTemplate];
    clearReasonError();
    reason.focus();
  }));
  render();
})();
