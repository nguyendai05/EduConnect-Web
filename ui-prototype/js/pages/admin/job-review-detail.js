/**
 * Chi tiết một tin tìm gia sư (admin) — MỌI trường đọc Store.job(id); trang không tự giữ
 * bảng tin riêng và cũng không đọc/ghi kho quyết định riêng của nó nữa (khoá cũ được
 * façade js/pages/admin/job-review-data.js xoá có kiểm soát khi khởi tạo).
 * Nút Duyệt / Từ chối / Đóng tin / Mở lại gọi thật Store.decideJob (có idempotency),
 * ok:false → hiện lý do tiếng Việt và KHÔNG đổi badge, ok:true → reload 900 ms
 * để hàng đợi + trang Tổng quan đọc lại cùng một state.
 */
(() => {
  const page = document.querySelector('[data-job-review-detail]');
  if (!page) return;

  const content = page.querySelector('[data-detail-content]');
  const notFound = page.querySelector('[data-detail-not-found]');
  const statusBadge = page.querySelector('[data-detail-status]');
  const decisionBox = page.querySelector('[data-detail-decision]');
  const decisionTrace = page.querySelector('[data-decision-trace]');
  const signalCard = page.querySelector('[data-detail-signal-card]');
  const privateCard = page.querySelector('[data-detail-private-card]');
  const focusWrap = page.querySelector('[data-detail-focus-wrap]');
  const lifecycle = {
    close: page.querySelector('[data-review-close-group]'),
    reopen: page.querySelector('[data-review-reopen-group]'),
  };
  const approveModal = page.querySelector('#review-approve-modal');
  const rejectModal = page.querySelector('#review-reject-modal');
  const archiveModal = page.querySelector('#review-archive-modal');
  const reason = page.querySelector('[data-reject-reason]');
  const reasonError = page.querySelector('[data-reason-error]');
  const archiveNote = page.querySelector('[data-archive-note]');
  const storeError = page.querySelector('[data-store-error]');

  const Review = window.EduJobReview;
  const Store = window.EduStore;

  /* Store vắng mặt: ẩn toàn bộ nội dung và nói rõ lý do, không ném Uncaught. */
  if (!Store || !Review || !Review.available) {
    [content, notFound, statusBadge, decisionBox, privateCard, focusWrap, lifecycle.close, lifecycle.reopen]
      .forEach(node => { if (node) node.hidden = true; });
    document.title = 'Không đọc được dữ liệu | Edu Connect';
    if (storeError) storeError.hidden = false;
    return;
  }

  const setText = (selector, value) => { page.querySelector(selector).textContent = value; };
  const setList = (selector, items) => {
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      fragment.append(li);
    });
    page.querySelector(selector).replaceChildren(fragment);
  };
  const ACTION_LABELS = Object.freeze({ approve: 'Duyệt tin', reject: 'Từ chối tin', close: 'Đóng tin', reopen: 'Mở lại tin' });
  const DECISION_TITLES = Object.freeze({
    pending: 'Tin đang chờ kiểm duyệt',
    hiring: 'Tin đang tuyển gia sư',
    closed: 'Tin đã đóng',
    rejected: 'Tin đã bị từ chối',
  });
  const DECISION_BODIES = Object.freeze({
    pending: 'Tin chưa được công khai — gia sư chỉ thấy tin trên bảng tin sau khi quản trị duyệt.',
    hiring: 'Tin đã duyệt và đang nhận hồ sơ ứng tuyển trên bảng tin công khai.',
    closed: 'Tin không còn nhận hồ sơ ứng tuyển mới.',
    rejected: 'Tin không hiển thị trên bảng tin. Người đăng cần chỉnh sửa rồi gửi lại.',
  });
  const VARIANTS = Object.freeze({ pending: 'alert--warning', hiring: 'alert--success', closed: '', rejected: 'alert--warning' });

  /* ?id=… là bắt buộc: thiếu id thì hiện not-found chứ KHÔNG âm thầm chọn một tin khác. */
  const requestedId = (new URLSearchParams(window.location.search).get('id') || '').trim().toUpperCase();
  let entry = requestedId ? Review.detail(requestedId) : null;
  let busy = false;
  let errorToast;

  const render = () => {
    /* Số chờ duyệt trong sidebar luôn lấy từ store, kể cả khi mã tin trong URL sai. */
    const tally = Review.counts();
    const sidebarCount = page.querySelector('.admin-sidebar__item.is-active .admin-sidebar__badge');
    sidebarCount.textContent = tally.pending;
    sidebarCount.setAttribute('aria-label', `${tally.pending} tin chờ xử lý`);

    const found = Boolean(entry);
    content.hidden = !found;
    notFound.hidden = found;
    statusBadge.hidden = !found;
    if (!found) {
      document.title = 'Không tìm thấy tin | Edu Connect';
      return;
    }
    const { job, poster, bucket, applicationCount, learner } = entry;
    const info = Review.bucketInfo(bucket);
    document.title = `${job.id} · Chi tiết duyệt tin | Edu Connect`;
    setText('[data-detail-avatar]', poster.initials);
    setText('[data-detail-poster]', poster.name);
    setText('[data-detail-poster-role]', `${poster.role}${poster.learnerId ? ` · ${poster.learnerId}` : ''}`);
    setText('[data-detail-student]', learner && learner.studentName
      ? `Học sinh: ${learner.studentName} · ${job.gradeLabel}`
      : `Đối tượng học: ${job.gradeLabel}`);
    setText('[data-detail-response-rate]', poster.responseRate === null || poster.responseRate === undefined
      ? 'Tỷ lệ phản hồi: không có dữ liệu' : `Tỷ lệ phản hồi: ${poster.responseRate}%`);
    setText('[data-detail-id]', job.id);
    setText('[data-detail-title]', job.title);
    setText('[data-detail-description]', job.description);
    setText('[data-detail-subject]', `${job.subjectLabel} · mã lọc ${job.subject}`);
    setText('[data-detail-grade]', job.gradeLabel);
    setText('[data-detail-duration]', `${job.durationMinutes} phút/buổi · ${job.sessionsPerWeek} buổi/tuần · ${job.sessions} buổi`);
    // Store.formatMoney() đã tự thêm đơn vị tiền tệ — không nối ký hiệu đồng thủ công (A9).
    setText('[data-detail-budget]', `${Store.formatMoney(job.budgetPerSession)} / buổi`);
    setText('[data-detail-format]', job.modeLabel);
    setText('[data-detail-region]', job.district);
    setText('[data-detail-experience]', `${job.experienceLabel} (${job.experienceYears} năm)`);
    setText('[data-detail-qualification]', job.qualification);
    setText('[data-detail-gender]', job.genderLabel);
    setText('[data-detail-tutor-note]', job.tutorNote);
    const submitted = page.querySelector('[data-detail-submitted]');
    submitted.dateTime = job.submittedAt;
    submitted.textContent = Store.formatDate(job.submittedAt, true);
    setList('[data-detail-schedule]', [job.scheduleText]);
    setList('[data-detail-focus]', job.focus || []);
    signalCard.hidden = !job.signal;
    page.querySelector('[data-detail-flag]').hidden = !job.signal;
    setText('[data-detail-signal]', job.signal || 'Không có tín hiệu cần kiểm tra.');
    /* Ghi chú riêng: không có thì ẩn khối, không in "—". */
    privateCard.hidden = !job.privateNote;
    focusWrap.hidden = !job.focus || job.focus.length === 0;
    setText('[data-detail-private-note]', job.privateNote || '');
    setText('[data-detail-applications]', `${applicationCount} hồ sơ`);
    setText('[data-detail-posted]', job.publishedAt
      ? `${Store.formatDate(job.publishedAt, true)} → hết hạn ${Store.formatDate(job.expiresAt)}`
      : 'chưa đăng công khai');
    setText('[data-summary-id]', job.id);
    setText('[data-summary-poster]', poster.name);
    setText('[data-summary-subject]', `${job.subjectLabel} · ${job.gradeLabel}`);
    setText('[data-summary-signal]', job.signal ? 'Cần kiểm tra' : 'Bình thường');
    [statusBadge, page.querySelector('[data-summary-status]')].forEach(badge => {
      badge.className = `badge ${info.badge}`;
      badge.textContent = info.label;
    });

    /* Vết quyết định kiểm duyệt: ai, lúc nào, lý do — chỉ khi store có job.decision. */
    const trace = job.decision ? Object.freeze({
      label: ACTION_LABELS[job.decision.action] || job.decision.action,
      reviewer: job.decision.reviewerId || '—',
      at: Store.formatDate(job.decision.at, true),
      note: String(job.decision.note || '').trim(),
    }) : null;
    const showDecision = bucket !== 'pending' || Boolean(trace);
    decisionBox.hidden = !showDecision;
    if (showDecision) {
      decisionBox.className = `alert alert--contextual${VARIANTS[bucket] ? ` ${VARIANTS[bucket]}` : ''}`;
      setText('[data-decision-title]', DECISION_TITLES[bucket]);
      const note = trace && trace.note ? ` Lý do/ghi chú đã lưu: ${trace.note}.` : '';
      setText('[data-decision-description]', `${DECISION_BODIES[bucket]}${bucket === 'rejected' && trace ? note : ''}`);
      decisionTrace.hidden = !trace;
      if (trace) setText('[data-decision-trace]', `${trace.label} · người xử lý ${trace.reviewer} · lúc ${trace.at}${trace.note ? ` · ghi chú: ${trace.note}` : ''}`);
    }

    /* Nút thao tác theo đúng transition mà Store.decideJob cho phép. */
    page.querySelectorAll('[data-review-approve]').forEach(button => { button.disabled = busy || bucket !== 'pending'; });
    page.querySelectorAll('[data-review-reject]').forEach(button => { button.disabled = busy || bucket === 'rejected'; });
    page.querySelectorAll('[data-review-close]').forEach(button => { button.disabled = busy || bucket !== 'hiring'; });
    page.querySelectorAll('[data-review-reopen]').forEach(button => { button.disabled = busy || bucket !== 'closed'; });
    lifecycle.close.hidden = bucket !== 'hiring';
    lifecycle.reopen.hidden = bucket !== 'closed';
  };

  /* ---------------- Ghi quyết định vào store ---------------- */

  const showFailure = (modal, result) => {
    const message = Review.reasonMessage(result) || 'Chưa ghi được quyết định. Trạng thái tin giữ nguyên.';
    const node = modal.querySelector('[data-review-error]');
    node.textContent = message;
    node.hidden = false;
    errorToast?.close();
    errorToast = window.EduToast?.show({ type: 'error', title: 'Không ghi được quyết định', message, duration: 0 });
  };

  const commit = (action, note, modal) => {
    if (!entry || busy) return;
    busy = true;
    render();
    const result = Review.decide({ jobId: entry.job.id, decision: action, note });
    if (!result.ok) {
      busy = false;
      render();
      showFailure(modal, result);
      return;
    }
    errorToast?.close();
    errorToast = null;
    /* Badge + vết kiểm duyệt cũng đọc lại thẳng từ store; `busy` vẫn true nên nút bị khoá chờ tải lại. */
    entry = Review.detail(entry.job.id);
    render();
    window.EduModal?.close(modal, 'confirm');
    window.EduToast?.show({
      type: 'success',
      title: `Đã ${ACTION_LABELS[action].toLowerCase()}`,
      message: `${entry.job.id} · ${Review.bucketInfo(Store.jobBucket(Store.job(entry.job.id))).label} — người xử lý ${result.reviewerId}. Trang sẽ tải lại để hàng đợi và Tổng quan đọc cùng dữ liệu.`,
      duration: 6000,
    });
    /* Reload: hàng đợi, số đếm, dashboard đọc lại từ store thay vì tự sửa object trong trang. */
    window.setTimeout(() => window.location.reload(), 900);
  };

  const clearReasonError = () => {
    reason.removeAttribute('aria-invalid');
    reasonError.hidden = true;
    setText('[data-reason-count]', `${reason.value.length}/1000`);
    page.querySelector('[data-review-error="reject"]').hidden = true;
  };

  const openModal = (modal, options) => {
    if (busy || !entry) return;
    modal.querySelector('[data-review-error]').hidden = true;
    window.EduModal?.open(modal, options);
  };

  page.querySelector('[data-review-approve]').addEventListener('click', () => {
    if (!entry || entry.bucket !== 'pending') return;
    const { job } = entry;
    setText('[data-approve-id]', job.id);
    setText('[data-approve-title]', job.title);
    setText('[data-approve-poster]', entry.poster.name);
    approveModal.querySelector('[data-approve-warning]').hidden = !job.signal;
    setText('[data-approve-signal]', job.signal ? `${job.signal} — hãy chắc chắn nội dung đã được rà soát trước khi duyệt.` : 'Không có tín hiệu rà soát cho tin này.');
    openModal(approveModal, { title: 'Xác nhận duyệt tin', message: `Sau khi xác nhận, ${job.id} được đăng công khai và chuyển sang nhóm Đang tuyển. Thao tác này không tạo hợp đồng, không thu phí.`, confirmText: 'Xác nhận duyệt', cancelText: 'Xem lại' });
  });

  page.querySelector('[data-review-reject]').addEventListener('click', () => {
    if (!entry || entry.bucket === 'rejected') return;
    clearReasonError();
    setText('[data-reject-id]', entry.job.id);
    openModal(rejectModal, { variant: 'danger', title: 'Từ chối tin tìm gia sư', message: `Nêu rõ nội dung cần chỉnh sửa để người đăng ${entry.poster.name} có thể gửi lại tin ${entry.job.id}.`, confirmText: 'Xác nhận từ chối', cancelText: 'Xem lại' });
    reason.focus();
  });

  const openLifecycleModal = action => {
    if (!entry || entry.bucket !== action) return;
    archiveNote.value = '';
    setText('[data-archive-note-count]', '0/500');
    setText('[data-archive-id]', entry.job.id);
    setText('[data-archive-bucket]', Review.bucketInfo(entry.bucket).label);
    openModal(archiveModal, action === 'close'
      ? { title: 'Đóng tin tìm gia sư', message: `${entry.job.id} sẽ ngừng nhận hồ sơ và chuyển sang nhóm Đã đóng. Nội dung tin và ${entry.applicationCount} hồ sơ đã nộp vẫn giữ nguyên.`, confirmText: 'Xác nhận đóng tin', cancelText: 'Xem lại' }
      : { title: 'Mở lại tin tìm gia sư', message: `${entry.job.id} sẽ nhận hồ sơ trở lại và về nhóm Đang tuyển.`, confirmText: 'Xác nhận mở lại', cancelText: 'Xem lại' });
    archiveNote.focus();
  };
  page.querySelector('[data-review-close]').addEventListener('click', () => openLifecycleModal('close'));
  page.querySelector('[data-review-reopen]').addEventListener('click', () => openLifecycleModal('reopen'));

  approveModal.addEventListener('modal:confirm', event => { event.preventDefault(); commit('approve', '', approveModal); });
  rejectModal.addEventListener('modal:confirm', event => {
    event.preventDefault();
    const trimmed = reason.value.trim();
    if (trimmed.length < 10 || trimmed.length > 1000) {
      reasonError.textContent = 'Vui lòng nhập lý do từ chối từ 10 đến 1000 ký tự.';
      reasonError.hidden = false;
      reason.setAttribute('aria-invalid', 'true');
      reason.focus();
      return;
    }
    commit('reject', trimmed, rejectModal);
  });
  archiveModal.addEventListener('modal:confirm', event => {
    event.preventDefault();
    if (!entry) return;
    const action = entry.bucket === 'closed' ? 'reopen' : 'close';
    commit(action, archiveNote.value.trim(), archiveModal);
  });
  reason.addEventListener('input', clearReasonError);
  archiveNote.addEventListener('input', () => {
    setText('[data-archive-note-count]', `${archiveNote.value.length}/500`);
    page.querySelector('[data-review-error="archive"]').hidden = true;
  });

  const templates = {
    contact: 'Nội dung có thông tin liên hệ ngoài nền tảng. Vui lòng loại bỏ số điện thoại, tài khoản mạng xã hội hoặc đường dẫn liên hệ trước khi gửi lại tin.',
    budget: 'Ngân sách và cách tính học phí chưa rõ ràng. Vui lòng bổ sung mức học phí theo buổi, thời lượng và tần suất học trước khi gửi lại tin.',
    content: 'Nội dung chưa đủ chi tiết. Vui lòng bổ sung mục tiêu học tập, môn và cấp lớp, lịch học, khu vực, hình thức học và yêu cầu đối với gia sư.',
  };
  page.querySelectorAll('[data-reason-template]').forEach(button => button.addEventListener('click', () => {
    reason.value = templates[button.dataset.reasonTemplate] || '';
    clearReasonError();
    reason.focus();
  }));

  render();
})();
