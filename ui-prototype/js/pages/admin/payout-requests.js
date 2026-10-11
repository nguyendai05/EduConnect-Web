(() => {
  const page = document.querySelector('[data-payout-requests]');
  if (!page) return;

  // Dữ liệu mẫu của prototype; thay bằng dữ liệu server khi tích hợp JSP.
  const store = window.EduPayout;
  const statuses = store.statuses;
  const filtersForm = page.querySelector('[data-payout-filters]');
  const search = page.querySelector('[data-payout-search]');
  const tabs = page.querySelector('[data-payout-status-tabs]');
  const results = page.querySelector('[data-payout-results]');
  const list = page.querySelector('[data-payout-list]');
  const table = page.querySelector('[data-payout-table]');
  const empty = page.querySelector('[data-payout-empty]');
  const loading = page.querySelector('[data-payout-loading]');
  const pagination = page.querySelector('[data-pagination]');
  const pageSizeSelect = page.querySelector('[data-payout-page-size]');
  const refresh = page.querySelector('[data-payout-refresh]');
  const template = page.querySelector('#payout-row-template');
  const bankSelect = filtersForm.elements.bank;
  const periodSelect = filtersForm.elements.period;
  const sortSelect = filtersForm.elements.sort;
  const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  const dayFormat = new Intl.DateTimeFormat('en-CA', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  // Đồng hồ của prototype: bám theo yêu cầu mới nhất để bộ lọc thời gian cho kết quả ổn định trên mọi máy.
  let now = new Date();
  let requests = [];
  let status = 'all';
  let filtered = [];
  let isLoading = true;
  let firstLoad = true;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/gi, 'd').toLowerCase().trim();
  const setText = (root, selector, value) => { root.querySelector(selector).textContent = value; };
  const statusLabel = key => (statuses[key] || { label: key }).label;
  const dayStamp = key => Date.parse(`${key}T12:00:00+07:00`);

  const relativeDay = value => {
    const created = new Date(value);
    const days = Math.round((dayStamp(dayFormat.format(now)) - dayStamp(dayFormat.format(created))) / 86400000);
    if (days <= 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    return dateFormat.format(created);
  };

  const populateBanks = () => {
    const banks = [...new Set(requests.map(request => request.bank))].sort((left, right) => left.localeCompare(right, 'vi'));
    banks.forEach(bank => {
      const option = document.createElement('option');
      option.value = bank;
      option.textContent = `Ngân hàng: ${bank}`;
      bankSelect.append(option);
    });
  };

  const matchesPeriod = request => {
    const period = periodSelect.value;
    if (period === 'all') return true;
    const created = new Date(request.createdAt);
    if (period === 'today') return dayFormat.format(created) === dayFormat.format(now);
    if (period === '7d') return now - created <= 7 * 86400000;
    if (period === '30d') return now - created <= 30 * 86400000;
    const open = request.status === 'pending' || request.status === 'processing';
    return open && now - created > 3 * 86400000;
  };

  const renderRows = () => {
    if (isLoading) return;
    const current = Number(pagination.dataset.current);
    const size = Number(pageSizeSelect.value);
    const visible = filtered.slice((current - 1) * size, current * size);
    const fragment = document.createDocumentFragment();
    visible.forEach(request => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.dataset.payoutRow = request.id;
      setText(row, '[data-payout-code]', request.id);
      setText(row, '[data-payout-avatar]', request.initials);
      setText(row, '[data-payout-tutor]', request.tutor);
      setText(row, '[data-payout-tutor-meta]', `${request.tutorCode} · ${request.subject}`);
      setText(row, '[data-payout-amount]', store.formatMoney(request.amount));
      setText(row, '[data-payout-balance]', `Khả dụng ${store.formatMoney(request.availableBalance)} · Chờ rút ${store.formatMoney(request.lockedBalance)}`);
      setText(row, '[data-payout-bank]', request.bank);
      setText(row, '[data-payout-account]', request.accountNumber);
      setText(row, '[data-payout-holder]', request.accountHolder);
      setText(row, '[data-payout-time]', `${timeFormat.format(new Date(request.createdAt))} · ${dateFormat.format(new Date(request.createdAt))}`);
      const date = row.querySelector('[data-payout-date]');
      date.dateTime = request.createdAt;
      date.textContent = relativeDay(request.createdAt);
      const topWarning = request.warnings[0];
      const severityBadge = { danger: 'badge--danger', warning: 'badge--warning', info: 'badge--info' };
      const warningBadge = row.querySelector('[data-payout-warning-badge]');
      warningBadge.classList.add(topWarning ? severityBadge[topWarning.severity] : 'badge--success');
      warningBadge.textContent = topWarning ? topWarning.label : 'Đủ điều kiện';
      const warningNote = row.querySelector('[data-payout-warning-note]');
      warningNote.classList.toggle('table__review-note', Boolean(topWarning));
      warningNote.textContent = topWarning ? `${topWarning.detail}${request.warnings.length > 1 ? ` (+${request.warnings.length - 1} cảnh báo khác)` : ''}` : 'Không có cảnh báo đối soát.';
      const badge = row.querySelector('[data-payout-status]');
      badge.classList.add(statuses[request.status].badge);
      badge.textContent = statusLabel(request.status);
      setText(row, '[data-payout-handler]', request.handledBy ? `Người xử lý: ${request.handledBy}` : 'Chưa phân công');
      const link = row.querySelector('[data-payout-detail]');
      link.href = `payout-request-detail.html?id=${encodeURIComponent(request.id)}`;
      link.setAttribute('aria-label', `Xem và xử lý yêu cầu ${request.id} của ${request.tutor}`);
      fragment.append(row);
    });
    list.replaceChildren(fragment);
    table.hidden = filtered.length === 0;
    empty.hidden = filtered.length !== 0;
  };

  const applyFilters = () => {
    const query = normalize(search.value);
    const bank = bankSelect.value;
    const sort = sortSelect.value;
    filtered = requests.filter(request => (status === 'all' || request.status === status)
      && (!query || normalize(`${request.id} ${request.tutor} ${request.tutorCode} ${request.subject} ${request.bank} ${request.bankCode} ${request.accountNumber} ${request.accountHolder} ${statusLabel(request.status)}`).includes(query))
      && (bank === 'all' || request.bank === bank)
      && matchesPeriod(request));
    filtered.sort((left, right) => {
      if (sort === 'amount') return right.amount - left.amount;
      if (sort === 'warning') {
        const severity = right.blocking.length - left.blocking.length;
        if (severity) return severity;
        return new Date(right.createdAt) - new Date(left.createdAt);
      }
      return sort === 'oldest' ? new Date(left.createdAt) - new Date(right.createdAt) : new Date(right.createdAt) - new Date(left.createdAt);
    });
    const scope = status === 'all' ? 'yêu cầu rút tiền' : statuses[status].short;
    setText(page, '[data-payout-result-summary]', `${filtered.length} ${scope} · tổng ${store.formatMoney(filtered.reduce((sum, request) => sum + request.amount, 0))}`);
    const hasFilters = Boolean(query) || bank !== 'all' || periodSelect.value !== 'all' || sort !== 'newest';
    page.querySelector('.payout-requests__results-heading [data-payout-reset]').hidden = !hasFilters;
    pagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { total: filtered.length, pageSize: Number(pageSizeSelect.value), current: 1 } }));
    renderRows();
  };

  const syncCounts = () => {
    Object.keys(statuses).forEach(key => {
      const group = requests.filter(request => request.status === key);
      const total = group.reduce((sum, request) => sum + request.amount, 0);
      setText(page, `[data-status-count="${key}"]`, group.length);
      setText(page, `[data-payout-count="${key}"]`, group.length);
      setText(page, `[data-payout-total="${key}"]`, group.length ? `Tổng ${store.formatMoney(total)}` : 'Chưa phát sinh');
    });
    setText(page, '[data-status-count="all"]', requests.length);
    const open = requests.filter(request => request.status === 'pending' || request.status === 'processing');
    setText(page, '[data-payout-flagged-count]', `${open.filter(request => request.blocking.length > 0).length} yêu cầu`);
    const sidebarBadge = page.querySelector('.admin-sidebar__item.is-active .admin-sidebar__badge');
    const pending = requests.filter(request => request.status === 'pending').length;
    sidebarBadge.textContent = pending;
    sidebarBadge.setAttribute('aria-label', `${pending} yêu cầu rút tiền chờ xử lý`);
  };

  const loadRequests = () => {
    requests = store.list();
    now = new Date(Math.max(...requests.map(request => Date.parse(request.createdAt))) + 2 * 3600000);
    if (bankSelect.options.length === 1) populateBanks();
    syncCounts();
    isLoading = true;
    results.setAttribute('aria-busy', 'true');
    loading.hidden = false;
    table.hidden = true;
    empty.hidden = true;
    refresh.disabled = true;
    refresh.setAttribute('aria-busy', 'true');
    window.setTimeout(() => {
      isLoading = false;
      loading.hidden = true;
      results.setAttribute('aria-busy', 'false');
      refresh.disabled = false;
      refresh.removeAttribute('aria-busy');
      setText(page, '[data-payout-updated]', `Cập nhật lúc ${timeFormat.format(new Date())}`);
      applyFilters();
    }, 450);
  };

  filtersForm.addEventListener('submit', event => { event.preventDefault(); applyFilters(); });
  filtersForm.addEventListener('input', event => { if (event.target === search) applyFilters(); });
  filtersForm.addEventListener('change', event => { if (event.target instanceof HTMLSelectElement) applyFilters(); });
  // SearchInput dùng chung xóa giá trị; trang đồng bộ lại danh sách sau thao tác đó.
  filtersForm.querySelector('[data-clear-search]').addEventListener('click', applyFilters);
  pageSizeSelect.addEventListener('change', applyFilters);
  pagination.addEventListener('pagination:change', renderRows);
  tabs.addEventListener('tabs:change', () => {
    const selected = tabs.querySelector('[aria-selected="true"]');
    status = selected.dataset.payoutStatus;
    results.setAttribute('aria-labelledby', selected.id);
    applyFilters();
  });
  page.querySelectorAll('[data-payout-reset]').forEach(button => button.addEventListener('click', () => {
    filtersForm.reset();
    search.dispatchEvent(new Event('input', { bubbles: true }));
  }));
  // Liên kết từ trang Tổng quan mang theo ?status=; chỉ nhận khóa tab đã có, giá trị lạ giữ tab mặc định.
  const applyIncomingQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('status');
    if (!requested) return;
    const tab = [...tabs.querySelectorAll('[data-payout-status]')].find(item => item.dataset.payoutStatus === requested);
    if (!tab) return;
    status = tab.dataset.payoutStatus;
    tabs.querySelectorAll('[role="tab"]').forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    results.setAttribute('aria-labelledby', tab.id);
  };

  applyIncomingQuery();
  refresh.addEventListener('click', loadRequests);
  // Kết quả xử lý ở trang chi tiết lưu trong sessionStorage; quay lại danh sách là trạng thái cập nhật theo.
  window.addEventListener('pageshow', () => {
    if (!firstLoad) loadRequests();
    firstLoad = false;
  });
  loadRequests();
})();
