(() => {
  const page = document.querySelector('[data-payout-request-detail]');
  if (!page) return;
  const store = window.EduPayout;
  const statuses = store.statuses;
  const requestedId = new URLSearchParams(window.location.search).get('id');
  // Không có id hoặc id lạ: rơi về yêu cầu mới nhất và báo rõ đang xem bản ghi nào.
  const initial = store.list();
  const isUnknownId = () => !requestedId || !initial.some(request => request.id === requestedId);
  let request = store.get(requestedId) || initial[0];
  let errorToast;
  const approveModal = page.querySelector('#payout-approve-modal');
  const completeModal = page.querySelector('#payout-complete-modal');
  const rejectModal = page.querySelector('#payout-reject-modal');
  const reason = page.querySelector('[data-reject-reason]');
  const reasonError = page.querySelector('[data-reason-error]');
  const txInput = page.querySelector('[data-tx-code]');
  const txError = page.querySelector('[data-tx-error]');
  const ack = page.querySelector('[data-detail-ack]');
  const decision = page.querySelector('[data-detail-decision]');
  const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  const money = store.formatMoney;
  const setText = (selector, value) => { page.querySelector(selector).textContent = value; };
  const shift = (value, hours) => new Date(Date.parse(value) + hours * 3600000).toISOString();
  const clockTime = value => `${timeFormat.format(new Date(value)).slice(0, 5)} · ${dateFormat.format(new Date(value))}`;
  const statusInfo = () => statuses[request.status];
  // Mốc thời gian của các bước đã xảy ra; bản ghi mẫu dùng offset cố định, quyết định mới dùng thời gian thật.
  const acceptedAt = () => (request.decision ? request.decision.decidedAt : shift(request.createdAt, 3));
  const closedAt = () => (request.decision ? request.decision.decidedAt : shift(request.createdAt, 6));
  const blocked = () => request.blocking.length > 0 && request.status === 'pending';

  /** Ghi nội dung có đoạn nhấn mạnh bằng DOM, không dùng innerHTML. */
  const fillRich = (target, segments) => {
    const fragment = document.createDocumentFragment();
    segments.forEach(([text, strong]) => {
      if (strong) fragment.append(Object.assign(document.createElement('strong'), { textContent: text }));
      else fragment.append(text);
    });
    target.replaceChildren(fragment);
  };

  const flowIcons = {
    clock: '../../assets/icons/clock.svg',
    check: '../../assets/icons/check-circle.svg',
    cancel: '../../assets/icons/cancel.svg',
    receipt: '../../assets/icons/receipt.svg',
    wallet: '../../assets/icons/wallet.svg',
  };
  const flowStates = {
    pending: {
      two: { state: 'is-active', icon: 'clock', label: 'Đang chờ quyết định' },
      three: { state: 'is-upcoming', icon: 'receipt', label: 'Bước tiếp theo' },
    },
    processing: {
      two: { state: 'is-done', icon: 'check', label: 'Đã duyệt & ủy quyền chi' },
      three: { state: 'is-active', icon: 'wallet', label: 'Chờ chuyển khoản & mã giao dịch' },
    },
    completed: {
      two: { state: 'is-done', icon: 'check', label: 'Đã duyệt & ủy quyền chi' },
      three: { state: 'is-done', icon: 'check', label: 'Đã chuyển ngoài hệ thống' },
    },
    rejected: {
      two: { state: 'is-failed', icon: 'cancel', label: 'Đã từ chối, rút lại ủy quyền chi' },
      three: { state: 'is-cancelled', icon: 'cancel', label: 'Hủy bỏ, hoàn tiền về Khả dụng' },
    },
  };

  const renderTutor = () => {
    setText('[data-crumb-tutor]', request.tutor);
    setText('[data-detail-avatar]', request.initials);
    setText('[data-detail-tutor]', request.tutor);
    setText('[data-detail-subject]', request.subject);
    setText('[data-detail-teaching]', request.teaching);
    setText('[data-detail-tutor-code]', request.tutorCode);
    setText('[data-detail-profile-state]', request.profileComplete ? 'Đầy đủ' : 'Còn thiếu');
    setText('[data-detail-verified-name]', request.tutor);
    setText('[data-detail-email]', request.email);
    setText('[data-detail-phone]', request.phone);
    setText('[data-detail-classes]', request.finishedClasses);
    const badge = page.querySelector('[data-detail-verified]');
    badge.classList.toggle('badge--verified', request.verified);
    badge.classList.toggle('badge--danger', !request.verified);
    badge.querySelector('span').textContent = request.verified ? 'Đã xác minh danh tính' : 'Chưa xác minh danh tính';
  };

  const renderRequest = () => {
    setText('[data-detail-code]', request.id);
    setText('[data-detail-amount]', money(request.amount));
    setText('[data-detail-amount-words]', `(${request.amountWords})`);
    const created = page.querySelector('[data-detail-created]');
    created.dateTime = request.createdAt;
    created.textContent = `${dateFormat.format(new Date(request.createdAt))} · ${timeFormat.format(new Date(request.createdAt))}`;
    setText('[data-detail-created-via]', `Kênh: ${request.createdVia}`);
    setText('[data-detail-available]', money(request.availableBalance));
    setText('[data-detail-locked]', money(request.lockedBalance));
    setText('[data-detail-escrow]', money(request.escrowBalance));
    fillRich(page.querySelector('[data-detail-balance-note]'), [
      [`${money(request.amount)} `, true],
      [request.lockedBalance > 0 ? 'hiện đang được bảo lưu trong ví mục ' : 'đã tất toán nên không còn bảo lưu trong ví mục ', false],
      ['Số dư chờ rút', true],
      ['. Duyệt yêu cầu chỉ xác nhận tính hợp lệ của lệnh rút và KHÔNG trừ thêm bất kỳ khoản tiền nào khỏi số dư ví gia sư; từ chối sẽ hoàn trả toàn bộ về Số dư khả dụng.', false],
    ]);
  };

  const renderBank = () => {
    setText('[data-detail-bank-code]', request.bankCode);
    setText('[data-detail-bank]', request.bank);
    setText('[data-detail-bank-full]', request.bankFullName);
    setText('[data-detail-account]', request.accountNumber);
    setText('[data-detail-holder]', request.accountHolder);
    setText('[data-detail-verified-name-2]', request.tutor);
    setText('[data-detail-holder-2]', request.accountHolder);
    const match = page.querySelector('[data-detail-match-result]');
    match.textContent = request.nameMatches ? 'Thông tin họ tên trùng khớp 100%' : 'Tên chủ tài khoản không khớp hồ sơ đã xác minh';
    match.classList.toggle('is-pass', request.nameMatches);
    match.classList.toggle('is-fail', !request.nameMatches);
  };

  const renderWarnings = () => {
    const panel = page.querySelector('[data-detail-warnings]');
    panel.hidden = request.warnings.length === 0;
    const fragment = document.createDocumentFragment();
    request.warnings.forEach(warning => {
      const item = document.createElement('li');
      item.className = `payout-request-detail__warning is-${warning.severity}`;
      item.append(Object.assign(document.createElement('strong'), { textContent: `${warning.label}: ` }));
      item.append(warning.detail);
      fragment.append(item);
    });
    page.querySelector('[data-warning-list]').replaceChildren(fragment);
    setText('[data-warning-footnote]', request.blocking.length
      ? `${request.blocking.length} cảnh báo ở mức bắt buộc nên thao tác duyệt bị khóa cho tới khi gia sư cập nhật thông tin. Quản trị viên vẫn có thể từ chối yêu cầu này.`
      : 'Chỉ còn cảnh báo mức tham khảo. Hãy đối soát lại trước khi xác nhận đã chuyển khoản.');
    page.querySelector('[data-detail-blocked]').hidden = request.blocking.length === 0 || request.status !== 'pending';
  };

  const renderFlow = () => {
    setText('[data-detail-flow-1]', `${money(request.amount)} được chuyển tự động từ Khả dụng sang Chờ rút khi gia sư gửi yêu cầu.`);
    setText('[data-detail-flow-2]', 'Quản trị viên xác nhận thông tin, KHÔNG làm phát sinh dịch chuyển tiền trong ví.');
    setText('[data-detail-flow-3]', request.status === 'rejected'
      ? 'Yêu cầu bị từ chối nên không có lệnh chuyển khoản nào được ủy quyền.'
      : 'Sau khi chuyển khoản ngoài ngân hàng và nhập mã giao dịch, khoản tiền chính thức rời khỏi ví hệ thống.');
    const current = flowStates[request.status];
    [[page.querySelector('[data-detail-flow-step-2]'), '[data-detail-flow-2-icon]', '[data-detail-flow-2-state]', current.two],
     [page.querySelector('[data-detail-flow-step-3]'), '[data-detail-flow-3-icon]', '[data-detail-flow-3-state]', current.three]].forEach(([step, iconSelector, stateSelector, config]) => {
      step.classList.remove('is-done', 'is-active', 'is-upcoming', 'is-failed', 'is-cancelled');
      step.classList.add(config.state);
      page.querySelector(iconSelector).src = flowIcons[config.icon];
      const stateNode = page.querySelector(stateSelector);
      stateNode.className = `payout-request-detail__flow-state ${config.state}`;
      stateNode.textContent = config.label;
    });
  };

  const adminEvent = (when, segments, meta) => ({ at: when, kind: 'admin', badge: 'Admin Decision', segments, meta });

  const buildEvents = () => {
    const handler = request.handledBy || store.adminName;
    const events = [
      {
        at: request.createdAt, kind: 'user', badge: 'User Action',
        segments: [[request.tutor, true], [' gửi yêu cầu rút tiền về ngân hàng ', false], [request.bank, true], [' qua ', false], [request.createdVia, false]],
        meta: `Mã phiếu ${request.id} · Số tiền ${money(request.amount)}`,
      },
      {
        at: shift(request.createdAt, 0.0006), kind: 'system', badge: 'System Ledger',
        segments: [['Hệ thống tự động bảo lưu ', false], [money(request.amount), true], [' từ ', false], ['Số dư khả dụng', true], [' sang ', false], ['Số dư chờ rút', true], ['.', false]],
        meta: `Mã giao dịch ví: #TX-${request.id.replace(/\D/g, '')}`,
      },
    ];
    if (statusInfo().terminal || request.status === 'processing') {
      events.push(adminEvent(acceptedAt(), [['Quản trị viên ', false], [handler, true], [' đã duyệt và ủy quyền chi hồ sơ rút tiền.', false]], `Khoản ${money(request.amount)} vẫn nằm ở Số dư chờ rút.`));
    }
    if (request.status === 'completed') {
      events.push(adminEvent(closedAt(), [['Quản trị viên ', false], [handler, true], [' xác nhận đã chuyển khoản ', false], [money(request.amount), true], ['. Mã giao dịch ngân hàng: ', false], [request.transactionCode || '—', true], ['.', false]], `Số dư chờ rút của yêu cầu này trở về ${money(0)}.`));
    }
    if (request.status === 'rejected') {
      events.push(adminEvent(closedAt(), [['Quản trị viên ', false], [handler, true], [' từ chối yêu cầu. Lý do: ', false], [request.reason || 'Không đạt tiêu chí đối soát.', false], [' Đã hoàn trả ', false], [money(request.amount), true], [' về Số dư khả dụng.', false]], 'Yêu cầu ở trạng thái cuối, không thể xử lý lần nữa.'));
    }
    return events.reverse();
  };

  const renderTimeline = () => {
    const fragment = document.createDocumentFragment();
    buildEvents().forEach(event => {
      const item = document.createElement('li');
      item.className = `payout-request-detail__event is-${event.kind}`;
      const dot = document.createElement('span');
      dot.className = 'payout-request-detail__event-dot';
      dot.setAttribute('aria-hidden', 'true');
      const head = document.createElement('p');
      head.className = 'payout-request-detail__event-head';
      const time = document.createElement('time');
      time.className = 'payout-request-detail__event-time';
      time.dateTime = event.at;
      time.textContent = clockTime(event.at);
      const kind = document.createElement('span');
      kind.className = `payout-request-detail__event-kind kind--${event.kind}`;
      kind.textContent = event.badge;
      head.append(time, kind);
      const body = document.createElement('p');
      body.className = 'payout-request-detail__event-body';
      fillRich(body, event.segments);
      const meta = document.createElement('p');
      meta.className = 'payout-request-detail__event-meta';
      meta.textContent = event.meta;
      item.append(dot, head, body, meta);
      fragment.append(item);
    });
    page.querySelector('[data-detail-timeline]').replaceChildren(fragment);
  };

  const renderCriteria = () => {
    const fragment = document.createDocumentFragment();
    request.criteria.forEach(criterion => {
      const item = document.createElement('li');
      item.className = `payout-request-detail__criterion ${criterion.passed ? 'is-pass' : 'is-fail'}`;
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'payout-request-detail__criterion-icon');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('fill', 'none');
      icon.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', criterion.passed ? 'm5 13 4 4 10-10' : 'M6 6l12 12M18 6 6 18');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      icon.append(path);
      const label = document.createElement('span');
      label.textContent = criterion.label;
      const verdict = document.createElement('span');
      verdict.className = 'payout-request-detail__criterion-verdict';
      verdict.textContent = criterion.passed ? 'Đạt' : 'Chưa đạt';
      item.append(icon, label, verdict);
      fragment.append(item);
    });
    page.querySelector('[data-detail-criteria]').replaceChildren(fragment);
  };

  const renderRail = () => {
    setText('[data-summary-amount]', money(request.amount));
    setText('[data-summary-bank]', request.bank);
    setText('[data-summary-account]', request.accountNumber);
    setText('[data-summary-holder]', request.accountHolder);
    setText('[data-summary-limit]', `${money(request.remainingLimit)} của ${money(store.monthlyLimit)}`);
    setText('[data-summary-handler]', request.handledBy || 'Chưa phân công');
    page.querySelector('[data-summary-status]').className = `badge ${statusInfo().badge}`;
    setText('[data-summary-status]', statusInfo().label);
    page.querySelector('[data-detail-status]').className = `badge ${statusInfo().badge}`;
    setText('[data-detail-status]', statusInfo().label);
    page.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== request.status; });
    const actionable = statusInfo().actions.length > 0;
    page.querySelector('[data-detail-ack-wrap]').hidden = !actionable;
    page.querySelectorAll('[data-payout-approve]').forEach(button => {
      button.disabled = blocked();
      if (blocked()) button.setAttribute('aria-describedby', 'payout-hint');
      else button.removeAttribute('aria-describedby');
    });
    page.querySelectorAll('[data-payout-reject]').forEach(button => { button.disabled = !actionable; });
    setText('[data-detail-hint]', blocked()
      ? `Chưa thể duyệt: yêu cầu còn ${request.blocking.length} cảnh báo bắt buộc (${request.blocking.map(warning => warning.label).join(', ')}).`
      : actionable ? 'Tích xác nhận đã đối chiếu hồ sơ trước khi duyệt hoặc xác nhận chuyển khoản.' : 'Yêu cầu ở trạng thái cuối, chỉ xem được lịch sử xử lý.');
    if (request.status === 'completed') setText('[data-completed-summary]', `Đã chuyển ${money(request.amount)} về ${request.bank} ${request.accountNumber}. Mã giao dịch: ${request.transactionCode || '—'}. Xác nhận lúc ${clockTime(closedAt())} bởi ${request.handledBy || store.adminName}.`);
    if (request.status === 'rejected') setText('[data-rejected-summary]', `${request.reason} Đã hoàn trả ${money(request.amount)} về Số dư khả dụng của gia sư lúc ${clockTime(closedAt())}.`);
  };

  const renderDecisionNotice = () => {
    const terminal = statusInfo().terminal;
    decision.hidden = !terminal;
    if (!terminal) return;
    const rejected = request.status === 'rejected';
    decision.classList.toggle('alert--error', rejected);
    decision.classList.toggle('alert--success', !rejected);
    setText('[data-decision-title]', rejected ? 'Yêu cầu đã bị từ chối' : 'Yêu cầu đã chuyển tiền thành công');
    setText('[data-decision-description]', rejected
      ? `Không còn thao tác xử lý. ${money(request.amount)} đã hoàn trả về Số dư khả dụng của ${request.tutor}.`
      : `Không còn thao tác xử lý. ${money(request.amount)} đã rời khỏi Số dư chờ rút với mã giao dịch ${request.transactionCode || '—'}.`);
  };

  const render = () => {
    document.title = `${request.id} · Xử lý yêu cầu rút tiền | Edu Connect`;
    setText('[data-detail-record]', `${request.id} · ${request.tutor} (${request.tutorCode})`);
    const notice = page.querySelector('[data-detail-fallback]');
    notice.hidden = !isUnknownId();
    if (!notice.hidden) setText('[data-fallback-description]', `Mã “${requestedId || '(để trống)'}” không khớp yêu cầu nào trong danh sách, trang đang hiển thị yêu cầu mới nhất ${request.id}. Hãy chọn lại đúng yêu cầu trong danh sách nếu cần xử lý bản ghi khác.`);
    renderTutor();
    renderRequest();
    renderBank();
    renderWarnings();
    renderFlow();
    renderCriteria();
    renderTimeline();
    renderRail();
    renderDecisionNotice();
    page.querySelector('[data-detail-content]').setAttribute('aria-busy', 'false');
    const pending = store.list().filter(item => item.status === 'pending').length;
    const sidebarBadge = page.querySelector('.admin-sidebar__item.is-active .admin-sidebar__badge');
    sidebarBadge.textContent = pending;
    sidebarBadge.setAttribute('aria-label', `${pending} yêu cầu rút tiền chờ xử lý`);
  };

  const applyDecision = (action, payload, options) => {
    const modal = options.modal;
    const message = modal.querySelector('[data-modal-error]');
    try {
      request = store.decide(request.id, action, payload);
      window.EduModal.close(modal, 'confirm');
      errorToast?.close();
      window.EduToast.show({ type: 'success', title: options.successTitle, message: options.successMessage, duration: 6000 });
      render();
      window.setTimeout(() => (statusInfo().terminal ? decision : page.querySelector('[data-detail-record]')).focus(), 0);
    } catch (error) {
      message.textContent = `Không thể lưu kết quả xử lý: ${error?.message || 'bộ nhớ đệm trình duyệt bị khóa'}. Trạng thái yêu cầu chưa thay đổi.`;
      message.hidden = false;
      errorToast?.close();
      errorToast = window.EduToast.show({ type: 'error', title: 'Không thể lưu kết quả', message: 'Trạng thái yêu cầu chưa thay đổi. Bạn có thể thử lại.', duration: 0 });
    }
  };

  const clearReasonError = () => {
    reason.removeAttribute('aria-invalid');
    reasonError.hidden = true;
    setText('[data-reason-count]', `${reason.value.length}/1000`);
    page.querySelector('[data-modal-error="reject"]').hidden = true;
  };

  page.querySelector('[data-payout-approve]').addEventListener('click', () => {
    if (request.status !== 'pending' || blocked()) return;
    if (!ack.checked) {
      setText('[data-detail-hint]', 'Tích chọn “Tôi xác nhận đã đối chiếu hồ sơ” trước khi duyệt yêu cầu.');
      ack.focus();
      return;
    }
    setText('[data-approve-tutor]', `${request.tutor} · ${request.tutorCode}`);
    setText('[data-approve-id]', request.id);
    setText('[data-approve-amount]', money(request.amount));
    setText('[data-approve-account]', `${request.bank} ${request.accountNumber} · ${request.accountHolder}`);
    page.querySelector('[data-modal-error="approve"]').hidden = true;
    window.EduModal.open(approveModal, { title: 'Xác nhận duyệt yêu cầu rút tiền', message: `Yêu cầu ${request.id} sẽ chuyển sang Đang xử lý. Khoản ${money(request.amount)} tiếp tục nằm trong Số dư chờ rút.`, confirmText: 'Xác nhận duyệt', cancelText: 'Xem lại' });
  });

  page.querySelector('[data-payout-complete]').addEventListener('click', () => {
    if (request.status !== 'processing') return;
    const code = txInput.value.trim();
    txError.hidden = true;
    txInput.removeAttribute('aria-invalid');
    if (code.length < 5 || code.length > 24) {
      txError.textContent = 'Nhập mã giao dịch ngân hàng từ 5 đến 24 ký tự, lấy từ ủy nhiệm chi.';
      txError.hidden = false;
      txInput.setAttribute('aria-invalid', 'true');
      txInput.focus();
      return;
    }
    setText('[data-complete-id]', request.id);
    setText('[data-complete-amount]', money(request.amount));
    setText('[data-complete-tx]', code);
    page.querySelector('[data-modal-error="complete"]').hidden = true;
    window.EduModal.open(completeModal, { title: 'Xác nhận đã chuyển khoản', message: `Khẳng định ${money(request.amount)} đã được chuyển tới ${request.bank} ${request.accountNumber}. Thao tác này không thể hoàn tác trong prototype.`, confirmText: 'Xác nhận hoàn tất', cancelText: 'Xem lại' });
  });

  page.querySelectorAll('[data-payout-reject]').forEach(button => button.addEventListener('click', () => {
    if (!statusInfo().actions.includes('reject')) return;
    clearReasonError();
    setText('[data-reject-id]', request.id);
    setText('[data-reject-refund]', `+${money(request.amount)} (khả dụng mới: ${money(request.availableBalance + request.lockedBalance)})`);
    window.EduModal.open(rejectModal, { variant: 'danger', title: 'Từ chối yêu cầu rút tiền', message: `Khoản ${money(request.amount)} đang bảo lưu sẽ được hoàn trả về Số dư khả dụng của ${request.tutor}.`, confirmText: 'Xác nhận từ chối', cancelText: 'Xem lại' });
    reason.focus();
  }));

  approveModal.addEventListener('modal:confirm', event => {
    event.preventDefault();
    applyDecision('process', {}, { modal: approveModal, successTitle: 'Đã duyệt yêu cầu rút tiền', successMessage: `${request.id} chuyển sang Đang xử lý, chờ xác nhận chuyển khoản.` });
  });
  completeModal.addEventListener('modal:confirm', event => {
    event.preventDefault();
    applyDecision('complete', { transactionCode: txInput.value.trim() }, { modal: completeModal, successTitle: 'Đã tất toán yêu cầu', successMessage: `${request.id} chuyển sang Đã chuyển tiền.` });
  });
  rejectModal.addEventListener('modal:confirm', event => {
    event.preventDefault();
    const value = reason.value.trim();
    if (value.length < 10 || value.length > 1000) {
      reasonError.textContent = 'Vui lòng nhập lý do từ chối từ 10 đến 1000 ký tự.';
      reasonError.hidden = false;
      reason.setAttribute('aria-invalid', 'true');
      reason.focus();
      return;
    }
    applyDecision('reject', { reason: value }, { modal: rejectModal, successTitle: 'Đã từ chối yêu cầu', successMessage: `${request.id} bị từ chối và hoàn tiền về Số dư khả dụng.` });
  });
  reason.addEventListener('input', clearReasonError);
  txInput.addEventListener('input', () => { txError.hidden = true; txInput.removeAttribute('aria-invalid'); });
  ack.addEventListener('change', () => {
    if (blocked()) return;
    setText('[data-detail-hint]', ack.checked ? 'Đã ghi nhận xác nhận đối chiếu. Bạn có thể thực hiện thao tác xử lý.' : 'Bỏ tích xác nhận — thao tác duyệt sẽ được yêu cầu tích lại.');
  });

  const templates = {
    holder: 'Tên chủ tài khoản nhận không khớp họ tên trên hồ sơ gia sư đã xác minh. Gia sư vui lòng cập nhật lại thông tin tài khoản thụ hưởng rồi gửi yêu cầu rút tiền mới.',
    unverified: 'Tài khoản nhận chưa hoàn tất xác minh theo quy trình đối soát. Gia sư vui lòng xác minh lại số tài khoản trong phần Ví của tôi trước khi gửi yêu cầu mới.',
    limit: 'Số tiền rút vượt hạn mức còn lại trong tháng của gia sư. Gia sư vui lòng chia nhỏ yêu cầu hoặc chờ sang chu kỳ hạn mức kế tiếp.',
  };
  page.querySelectorAll('[data-reason-template]').forEach(button => button.addEventListener('click', () => {
    reason.value = templates[button.dataset.reasonTemplate];
    clearReasonError();
    reason.focus();
  }));

  page.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const value = button.dataset.copy === 'id' ? request.id : `${request.bank} ${request.accountNumber}`;
    try {
      await navigator.clipboard.writeText(value);
      window.EduToast.show({ type: 'copy', title: 'Đã sao chép', message: value, duration: 4000 });
    } catch {
      window.EduToast.show({ type: 'info', title: 'Không sao chép được', message: `Bạn có thể sao chép thủ công: ${value}`, duration: 6000 });
    }
  }));

  render();
  // Quay lại trang sau khi xử lý ở tab khác (bfcache): đọc lại sessionStorage và vẽ lại.
  let firstShow = true;
  window.addEventListener('pageshow', () => {
    if (firstShow) { firstShow = false; return; }
    request = store.get(request.id) || store.get(requestedId) || store.list()[0];
    render();
  });
})();
