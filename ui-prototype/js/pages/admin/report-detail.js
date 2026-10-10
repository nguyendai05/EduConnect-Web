(() => {
  const page = document.querySelector('[data-report-detail]');
  if (!page) return;
  const store = window.EduReport;
  const { statuses, severities, types } = store;
  const records = store.list();
  const requestedId = new URLSearchParams(window.location.search).get('id');
  let report = records.find(item => item.id === requestedId) || records[0] || null;
  const usedFallback = Boolean(requestedId) && Boolean(report) && report.id !== requestedId;

  const currency = new Intl.NumberFormat('vi-VN');
  const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  const formatDate = value => `${dateFormat.format(new Date(value))} · ${timeFormat.format(new Date(value))}`;
  const setText = (selector, value) => { page.querySelector(selector).textContent = value; };
  const money = value => (value ? `${currency.format(value)} ₫` : 'Không giữ khoản');

  const note = page.querySelector('[data-decision-note]');
  const noteError = page.querySelector('[data-note-error]');
  const optionsHost = page.querySelector('[data-resolution-options]');
  const decision = page.querySelector('[data-detail-decision]');
  const resolveModal = page.querySelector('#report-resolve-modal');
  const dismissModal = page.querySelector('#report-dismiss-modal');
  const investigateModal = page.querySelector('#report-investigate-modal');
  const evidenceModal = page.querySelector('#report-evidence-modal');
  let errorToast;

  const isClosed = () => Boolean(report) && (report.status === 'resolved' || report.status === 'dismissed');
  const selectedResolution = () => optionsHost.querySelector('input[name="report-resolution"]:checked');

  const renderOptions = () => {
    const fragment = document.createDocumentFragment();
    const closed = isClosed();
    report.resolutions.forEach(option => {
      const label = document.createElement('label');
      label.className = 'radio-option';
      const hit = document.createElement('span');
      hit.className = 'radio-hit-area';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'report-resolution';
      input.value = option.key;
      input.checked = report.resolution === option.key;
      input.disabled = closed;
      const circle = document.createElement('span');
      circle.className = 'radio-circle';
      circle.setAttribute('aria-hidden', 'true');
      hit.append(input, circle);
      const copy = document.createElement('span');
      copy.className = 'report-detail__option-copy';
      const strong = document.createElement('strong');
      strong.textContent = option.label;
      const small = document.createElement('small');
      small.textContent = option.detail;
      copy.append(strong, small);
      label.append(hit, copy);
      if (input.checked) label.classList.add('radio-option--selected');
      fragment.append(label);
    });
    optionsHost.replaceChildren(fragment);
    syncOptionDetail();
  };

  const syncOptionDetail = () => {
    const chosen = selectedResolution();
    const option = report.resolutions.find(item => item.key === (chosen ? chosen.value : ''));
    setText('[data-resolution-detail]', option ? `Tác động minh họa: ${option.detail}` : 'Chọn một phương án để xem mô tả tác động.');
  };

  const renderList = (selector, items, build) => {
    const host = page.querySelector(selector);
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => fragment.append(build(item, index)));
    host.replaceChildren(fragment);
  };

  const renderSteps = () => {
    const last = report.status === 'dismissed' ? 'Đã bác bỏ' : 'Đã xử lý';
    const steps = ['Mới tiếp nhận', 'Đang xác minh', last];
    const current = { open: 0, investigating: 1, resolved: 2, dismissed: 2 }[report.status];
    renderList('[data-detail-steps]', steps, (label, index) => {
      const item = document.createElement('li');
      item.className = 'report-detail__step';
      if (index < current) item.classList.add('is-done');
      if (index === current) item.classList.add('is-current');
      item.textContent = label;
      if (index === current) item.setAttribute('aria-current', 'step');
      return item;
    });
  };

  const renderTimeline = () => {
    renderList('[data-detail-timeline]', report.timeline, event => {
      const item = document.createElement('li');
      item.className = 'report-detail__timeline-item';
      const head = document.createElement('div');
      head.className = 'report-detail__timeline-head';
      const title = document.createElement('h3');
      title.textContent = event.title;
      const time = document.createElement('time');
      time.dateTime = event.at;
      time.textContent = formatDate(event.at);
      head.append(title, time);
      const actor = document.createElement('p');
      actor.className = 'report-detail__timeline-actor';
      actor.textContent = event.actor;
      const detail = document.createElement('p');
      detail.className = 'report-detail__timeline-detail';
      detail.textContent = event.detail;
      item.append(head, actor, detail);
      return item;
    });
  };

  const renderEvidence = () => {
    renderList('[data-detail-evidence]', report.evidence, (file, index) => {
      const item = document.createElement('li');
      const card = document.createElement('article');
      card.className = 'file-attachment-item';
      const symbol = document.createElement('div');
      symbol.className = 'file-attachment-item__symbol';
      const icon = document.createElement('span');
      icon.className = `component-icon component-icon--${file.kind.startsWith('Ảnh') ? 'image' : 'file'}`;
      icon.setAttribute('aria-hidden', 'true');
      symbol.append(icon);
      const body = document.createElement('div');
      body.className = 'file-attachment-item__body';
      const name = document.createElement('h3');
      name.className = 'file-attachment-item__name';
      name.textContent = file.name;
      const kind = document.createElement('span');
      kind.className = 'badge badge--neutral';
      kind.textContent = file.kind;
      const meta = document.createElement('p');
      meta.className = 'file-attachment-item__meta';
      meta.textContent = file.meta;
      body.append(name, kind, meta);
      const actions = document.createElement('div');
      actions.className = 'file-attachment-item__actions';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button--outline button--small';
      button.dataset.evidenceView = String(index);
      const eye = document.createElement('span');
      eye.className = 'component-icon component-icon--eye';
      eye.setAttribute('aria-hidden', 'true');
      button.append(eye, document.createTextNode('Xem minh chứng'));
      button.setAttribute('aria-label', `Xem trước minh chứng giữ chỗ ${file.name}`);
      actions.append(button);
      card.append(symbol, body, actions);
      item.append(card);
      return item;
    });
  };

  const renderThread = () => {
    const card = page.querySelector('[data-detail-thread-card]');
    card.hidden = report.excerpt.length === 0;
    if (!report.excerpt.length) return;
    renderList('[data-detail-thread]', report.excerpt, message => {
      const item = document.createElement('li');
      item.className = `report-detail__message report-detail__message--${message.side}`;
      const head = document.createElement('p');
      head.className = 'report-detail__message-head';
      const author = document.createElement('strong');
      author.textContent = message.author;
      const time = document.createElement('span');
      time.textContent = message.time;
      head.append(author, time);
      const bubble = document.createElement('p');
      bubble.className = 'report-detail__bubble';
      bubble.textContent = message.text;
      item.append(head, bubble);
      return item;
    });
  };

  const render = () => {
    const found = Boolean(report);
    page.querySelector('[data-detail-content]').hidden = !found;
    page.querySelector('[data-detail-not-found]').hidden = found;
    page.querySelector('[data-detail-status]').hidden = !found;
    page.querySelector('[data-detail-fallback]').hidden = !usedFallback;
    if (usedFallback) setText('[data-fallback-message]', `Không tìm thấy vụ việc “${requestedId}” trong dữ liệu mẫu, trang đang hiển thị vụ việc đầu tiên (${report.id}).`);
    if (!found) {
      document.title = 'Không có vụ việc nào | Edu Connect';
      return;
    }
    document.title = `${report.id} · Xử lý báo cáo | Edu Connect`;
    setText('[data-detail-heading]', `Xử lý báo cáo · ${report.scope}`);
    setText('[data-detail-viewing]', `Đang xem vụ việc ${report.id} — ${report.reporter} báo cáo ${report.reported}.`);
    const statusBadge = page.querySelector('[data-detail-status]');
    statusBadge.className = `badge ${statuses[report.status].badge}`;
    statusBadge.textContent = statuses[report.status].label;
    const severityBadge = page.querySelector('[data-detail-severity]');
    severityBadge.className = `badge ${severities[report.severity].badge}`;
    severityBadge.textContent = severities[report.severity].short;
    page.querySelector('[data-detail-lock]').hidden = !report.moneyLock;
    setText('[data-detail-code]', `Mã vụ việc: ${report.id}`);
    setText('[data-detail-reporter]', `${report.reporter} · ${report.reporterRole}`);
    setText('[data-detail-reported]', `${report.reported} · ${report.reportedRole}`);
    setText('[data-detail-type]', `${types[report.type].label} · ${report.scope}`);
    setText('[data-detail-scope]', report.scope);
    setText('[data-detail-reference-label]', report.referenceLabel);
    setText('[data-detail-reference]', report.reference);
    setText('[data-detail-description]', report.description);
    const created = page.querySelector('[data-detail-created]');
    created.dateTime = report.created;
    created.textContent = `${formatDate(report.created)} · ${types[report.type].label}`;
    setText('[data-detail-parties-count]', `${report.parties.length} bên`);
    setText('[data-detail-evidence-count]', `${report.evidence.length} minh chứng giữ chỗ`);
    setText('[data-detail-timeline-state]', isClosed() ? statuses[report.status].label : 'Chưa có kết luận');
    renderList('[data-detail-parties]', report.parties, party => {
      const item = document.createElement('li');
      item.className = 'report-detail__party';
      const avatar = document.createElement('span');
      avatar.className = 'avatar avatar--small';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = party.initials;
      const copy = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = party.name;
      const role = document.createElement('small');
      role.textContent = party.role;
      copy.append(name, role);
      item.append(avatar, copy);
      return item;
    });
    renderEvidence();
    renderThread();
    renderSteps();
    renderTimeline();
    renderOptions();

    const summaryStatus = page.querySelector('[data-summary-status]');
    summaryStatus.className = `badge ${statuses[report.status].badge}`;
    summaryStatus.textContent = statuses[report.status].label;
    const summarySeverity = page.querySelector('[data-summary-severity]');
    summarySeverity.className = `badge ${severities[report.severity].badge}`;
    summarySeverity.textContent = severities[report.severity].short;
    setText('[data-summary-money]', `${money(report.heldAmount)}${report.moneyLock ? ' · đang giữ' : ''}`);
    setText('[data-summary-assignee]', report.assignee || 'Chưa phân công');

    const closed = isClosed();
    note.disabled = closed;
    page.querySelector('[data-action-investigate]').disabled = closed || report.status === 'investigating';
    page.querySelector('[data-action-resolve]').disabled = closed;
    page.querySelector('[data-action-dismiss]').disabled = closed;
    setText('[data-action-help]', closed
      ? 'Vụ việc đã có kết luận nên không thể ghi nhận quyết định lần thứ hai.'
      : 'Chọn phương án và nhập kết luận trước khi ghi nhận quyết định.');
    clearNoteError();

    decision.hidden = !closed;
    if (closed) {
      const resolved = report.status === 'resolved';
      decision.classList.toggle('alert--success', resolved);
      decision.classList.toggle('alert--warning', !resolved);
      setText('[data-decision-title]', resolved ? 'Vụ việc đã được xử lý' : 'Báo cáo đã bị bác bỏ');
      setText('[data-decision-description]', `${report.resolutionLabel ? `Phương án đã chốt: ${report.resolutionLabel}. ` : ''}Kết luận lúc ${formatDate(report.reviewedAt)}. Nội dung ghi chú: ${report.decisionNote}`);
    }

    const pendingCount = store.list().filter(item => item.status === 'open' || item.status === 'investigating').length;
    const sidebarCount = page.querySelector('.admin-sidebar__item.is-active .admin-sidebar__badge');
    sidebarCount.textContent = pendingCount;
    sidebarCount.setAttribute('aria-label', `${pendingCount} báo cáo cần xử lý`);
  };

  const clearNoteError = () => {
    note.removeAttribute('aria-invalid');
    noteError.hidden = true;
    setText('[data-note-count]', `${note.value.length}/1000`);
  };

  const validateDecision = nextStatus => {
    const trimmed = note.value.trim();
    if (trimmed.length > 1000) {
      noteError.textContent = 'Kết luận xử lý tối đa 1000 ký tự.';
    } else if (trimmed.length < 10) {
      noteError.textContent = 'Vui lòng nhập kết luận xử lý từ 10 đến 1000 ký tự để làm căn cứ lưu vết.';
    } else if (nextStatus === 'resolved' && !selectedResolution()) {
      noteError.textContent = 'Hãy chọn một phương án xử lý trước khi xác nhận kết luận.';
    } else {
      return true;
    }
    noteError.hidden = false;
    note.setAttribute('aria-invalid', 'true');
    note.focus();
    return false;
  };

  const submitDecision = nextStatus => {
    if (!report || isClosed()) return;
    const modal = nextStatus === 'resolved' ? resolveModal : nextStatus === 'dismissed' ? dismissModal : investigateModal;
    const message = modal.querySelector('[data-modal-error]');
    message.hidden = true;
    try {
      report = store.decide(report.id, { status: nextStatus, note: note.value, resolution: selectedResolution() ? selectedResolution().value : '' });
      render();
      window.EduModal.close(modal, 'confirm');
      errorToast?.close();
      const titles = { investigating: 'Đã chuyển sang đang xác minh', resolved: 'Đã ghi nhận kết luận xử lý', dismissed: 'Đã bác báo cáo' };
      window.EduToast.show({ type: 'success', title: titles[nextStatus], message: `${report.id} đã được cập nhật trong phiên làm việc. Danh sách báo cáo sẽ hiển thị trạng thái mới.`, duration: 6000 });
      window.setTimeout(() => decision.focus(), 0);
    } catch {
      message.textContent = 'Chưa thể lưu kết quả xử lý. Trạng thái vụ việc giữ nguyên; bạn có thể thử lại hoặc kiểm tra quyền lưu dữ liệu của trình duyệt.';
      message.hidden = false;
      errorToast?.close();
      errorToast = window.EduToast.show({ type: 'error', title: 'Không thể lưu kết quả', message: 'Trạng thái vụ việc chưa thay đổi. Hãy thử lại.', duration: 0 });
    }
  };

  page.querySelector('[data-action-investigate]').addEventListener('click', () => {
    if (!report || isClosed() || report.status === 'investigating') return;
    setText('[data-investigate-id]', `${report.id} — ${report.title}`);
    setText('[data-investigate-severity]', severities[report.severity].short);
    investigateModal.querySelector('[data-modal-error]').hidden = true;
    window.EduModal.open(investigateModal, { title: 'Chuyển hồ sơ sang đang xác minh', message: 'Hồ sơ được gán cho quản trị viên và ghi thêm một mốc vào lịch sử xử lý. Chưa ghi nhận kết luận.', confirmText: 'Xác nhận chuyển', cancelText: 'Xem lại' });
  });

  page.querySelector('[data-action-resolve]').addEventListener('click', () => {
    if (!report || isClosed() || !validateDecision('resolved')) return;
    const chosen = selectedResolution();
    const option = report.resolutions.find(item => item.key === chosen.value);
    setText('[data-resolve-id]', `${report.id} — ${report.title}`);
    setText('[data-resolve-option]', option.label);
    setText('[data-resolve-money]', `${money(report.heldAmount)} · ${report.reference}`);
    setText('[data-resolve-note]', `Kết luận đính kèm: ${note.value.trim()}`);
    resolveModal.querySelector('[data-modal-error]').hidden = true;
    window.EduModal.open(resolveModal, { title: 'Xác nhận xử lý vụ việc', message: 'Giao diện sẽ chuyển vụ việc sang Đã xử lý và ghi chú kết luận vào lịch sử. Không có thao tác tiền thật nào được thực hiện.', confirmText: 'Chốt kết luận', cancelText: 'Xem lại' });
  });

  page.querySelector('[data-action-dismiss]').addEventListener('click', () => {
    if (!report || isClosed() || !validateDecision('dismissed')) return;
    setText('[data-dismiss-id]', `${report.id} — ${report.title}`);
    setText('[data-dismiss-reporter]', `${report.reporter} · ${report.reporterRole}`);
    setText('[data-dismiss-note]', `Kết luận đính kèm: ${note.value.trim()}`);
    dismissModal.querySelector('[data-modal-error]').hidden = true;
    window.EduModal.open(dismissModal, { variant: 'danger', title: 'Bác báo cáo', message: 'Dùng khi đối chiếu không có căn cứ xử lý. Kết luận bắt buộc ghi chú để lưu vết kiểm toán.', confirmText: 'Xác nhận bác bỏ', cancelText: 'Xem lại' });
  });

  resolveModal.addEventListener('modal:confirm', event => { event.preventDefault(); submitDecision('resolved'); });
  dismissModal.addEventListener('modal:confirm', event => { event.preventDefault(); submitDecision('dismissed'); });
  investigateModal.addEventListener('modal:confirm', event => { event.preventDefault(); submitDecision('investigating'); });

  page.addEventListener('click', event => {
    const trigger = event.target.closest('[data-evidence-view]');
    if (!trigger) return;
    const file = report.evidence[Number(trigger.dataset.evidenceView)];
    setText('[data-evidence-name]', file.name);
    setText('[data-evidence-kind]', `${file.kind} (phần tử giữ chỗ, không có tệp thật)`);
    setText('[data-evidence-meta]', file.meta);
    window.EduModal.open(evidenceModal, { variant: 'info', title: 'Minh chứng đính kèm', message: 'Khung xem trước chỉ là phần tử giữ chỗ; bản mẫu không chứa tệp đính kèm thật.', cancelText: 'Đóng cửa sổ' });
  });

  optionsHost.addEventListener('change', event => {
    if (!(event.target instanceof HTMLInputElement)) return;
    optionsHost.querySelectorAll('.radio-option').forEach(label => {
      label.classList.toggle('radio-option--selected', Boolean(label.querySelector('input')?.checked));
    });
    syncOptionDetail();
    clearNoteError();
  });
  note.addEventListener('input', clearNoteError);

  render();
})();
