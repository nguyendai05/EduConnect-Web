(() => {
  const page = document.querySelector('[data-reports]');
  if (!page) return;

  // Dữ liệu mẫu của prototype; thay bằng dữ liệu server khi nối backend.
  let reports = window.EduReport.list();
  const { statuses, severities, types } = window.EduReport;
  const form = page.querySelector('[data-reports-filters]');
  const search = page.querySelector('[data-reports-search]');
  const tabs = page.querySelector('[data-reports-status-tabs]');
  const results = page.querySelector('[data-reports-results]');
  const list = page.querySelector('[data-reports-list]');
  const table = page.querySelector('[data-reports-table]');
  const empty = page.querySelector('[data-reports-empty]');
  const loading = page.querySelector('[data-reports-loading]');
  const pagination = page.querySelector('[data-pagination]');
  const pageSize = page.querySelector('[data-reports-page-size]');
  const refresh = page.querySelector('[data-reports-refresh]');
  // <template> nam ngoai phan tu `page` (dat cuoi body) nen phai tra tu document.
  const template = document.getElementById('reports-row-template');
  const currency = new Intl.NumberFormat('vi-VN');
  const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  const statusKeys = ['open', 'investigating', 'resolved', 'dismissed'];
  let status = 'all';
  let filtered = [];
  let isLoading = true;

  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
  const setText = (root, selector, value) => { root.querySelector(selector).textContent = value; };
  const relativeTime = value => {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.round(hours / 24);
    return days === 1 ? 'Hôm qua' : `${days} ngày trước`;
  };

  const renderRows = () => {
    if (isLoading) return;
    const current = Number(pagination.dataset.current);
    const size = Number(pageSize.value);
    const visible = filtered.slice((current - 1) * size, current * size);
    const fragment = document.createDocumentFragment();
    visible.forEach(report => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.dataset.reportsRow = report.id;
      setText(row, '[data-report-title]', report.title);
      setText(row, '[data-report-reference]', report.id);
      setText(row, '[data-report-summary]', report.summary);
      setText(row, '[data-report-evidence-count]', `${report.evidence.length} minh chứng`);
      setText(row, '[data-report-avatar]', report.initials);
      setText(row, '[data-report-reporter]', report.reporter);
      setText(row, '[data-report-reporter-role]', report.reporterRole);
      setText(row, '[data-report-reported]', report.reported);
      setText(row, '[data-report-scope]', `${types[report.type].label} · ${report.scope}`);
      setText(row, '[data-report-type]', types[report.type].label);
      const severity = row.querySelector('[data-report-severity]');
      severity.classList.add(severities[report.severity].badge);
      setText(row, '[data-report-severity]', severities[report.severity].short);
      setText(row, '[data-report-money]', report.heldAmount ? `${currency.format(report.heldAmount)} ₫` : 'Không giữ khoản');
      setText(row, '[data-report-money-note]', report.moneyLock ? 'Đang tạm giữ chờ kết luận' : 'Không chặn thao tác tất toán');
      const created = new Date(report.created);
      const date = row.querySelector('[data-report-date]');
      date.dateTime = report.created;
      date.textContent = dateFormat.format(created);
      setText(row, '[data-report-relative]', `${timeFormat.format(created)} · ${relativeTime(report.created)}`);
      const badge = row.querySelector('[data-report-status]');
      badge.classList.add(statuses[report.status].badge);
      badge.textContent = statuses[report.status].label;
      setText(row, '[data-report-assignee]', report.assignee ? `Người thụ lý: ${report.assignee}` : 'Chưa có người thụ lý');
      const link = row.querySelector('[data-report-detail]');
      link.href = `${window.EduRoute.path('/admin/report-detail')}?id=${encodeURIComponent(report.id)}`;
      link.textContent = report.status === 'investigating' ? 'Tiếp tục xác minh' : 'Xem chi tiết';
      link.setAttribute('aria-label', `Xem chi tiết báo cáo ${report.id}: ${report.title}`);
      fragment.append(row);
    });
    list.replaceChildren(fragment);
    table.hidden = filtered.length === 0;
    empty.hidden = filtered.length !== 0;
  };

  const applyFilters = () => {
    const query = normalize(search.value);
    const type = form.elements.type.value;
    const severity = form.elements.severity.value;
    const money = form.elements.money.value;
    const sort = form.elements.sort.value;
    filtered = reports.filter(report => (status === 'all' || (status === 'unresolved' ? report.status === 'open' || report.status === 'investigating' : report.status === status))
      && (!query || normalize([report.id, report.title, report.summary, report.reporter, report.reported, report.reference, report.scope, types[report.type].label].join(' ')).includes(query))
      && (type === 'all' || report.type === type)
      && (severity === 'all' || report.severity === severity)
      && (money === 'all' || (money === 'locked' ? report.moneyLock : !report.moneyLock)));
    filtered.sort((left, right) => {
      if (sort === 'priority') {
        const weight = severities[right.severity].rank - severities[left.severity].rank
          || Number(right.moneyLock) - Number(left.moneyLock)
          || new Date(left.created) - new Date(right.created);
        if (weight) return weight;
      }
      return sort === 'oldest' ? new Date(left.created) - new Date(right.created) : new Date(right.created) - new Date(left.created);
    });
    const scopeLabel = status === 'all' ? 'toàn bộ trạng thái'
      : status === 'unresolved' ? 'vụ việc đang mở (chưa kết luận)'
      : statuses[status].summary;
    setText(page, '[data-reports-result-summary]', `${filtered.length} báo cáo · ${scopeLabel}`);
    const hasFilters = Boolean(query) || type !== 'all' || severity !== 'all' || money !== 'all' || sort !== 'priority';
    page.querySelector('.reports__results-heading [data-reports-reset]').hidden = !hasFilters;
    pagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { total: filtered.length, pageSize: Number(pageSize.value), current: 1 } }));
    renderRows();
  };

  const syncCounts = () => {
    statusKeys.forEach(key => setText(page, `[data-status-count="${key}"]`, reports.filter(report => report.status === key).length));
    setText(page, '[data-status-count="all"]', reports.length);
    const open = reports.filter(report => report.status === 'open');
    const investigating = reports.filter(report => report.status === 'investigating');
    const resolved = reports.filter(report => report.status === 'resolved');
    const dismissed = reports.filter(report => report.status === 'dismissed');
    const priority = reports.filter(report => report.status === 'open' || report.status === 'investigating');
    setText(page, '[data-reports-total-count]', reports.length);
    setText(page, '[data-reports-open-count]', open.length);
    setText(page, '[data-reports-investigating-count]', investigating.length);
    setText(page, '[data-reports-resolved-count]', resolved.length);
    setText(page, '[data-reports-dismissed-count]', `${dismissed.length} vụ đã bác bỏ`);
    setText(page, '[data-reports-open-lock]', `${open.filter(report => report.moneyLock).length} vụ đang giữ khoản`);
    setText(page, '[data-reports-priority-count]', `${priority.length} vụ việc`);
    const sidebarCount = page.querySelector('.admin-sidebar__item.is-active .admin-sidebar__badge');
    sidebarCount.textContent = priority.length;
    sidebarCount.setAttribute('aria-label', `${priority.length} báo cáo cần xử lý`);
  };

  const loadReports = () => {
    reports = window.EduReport.list();
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
      setText(page, '[data-reports-updated]', `Cập nhật lúc ${timeFormat.format(new Date())}`);
      applyFilters();
    }, 450);
  };

  form.addEventListener('submit', event => { event.preventDefault(); applyFilters(); });
  form.addEventListener('input', event => { if (event.target === search) applyFilters(); });
  form.addEventListener('change', event => { if (event.target instanceof HTMLSelectElement) applyFilters(); });
  // SearchInput dùng chung xóa giá trị; trang đồng bộ lại danh sách sau thao tác đó.
  form.querySelector('[data-clear-search]').addEventListener('click', applyFilters);
  pageSize.addEventListener('change', applyFilters);
  pagination.addEventListener('pagination:change', renderRows);
  tabs.addEventListener('tabs:change', () => {
    const selected = tabs.querySelector('[aria-selected="true"]');
    status = selected.dataset.reportsStatus;
    results.setAttribute('aria-labelledby', selected.id);
    applyFilters();
  });
  page.querySelectorAll('[data-reports-reset]').forEach(button => button.addEventListener('click', () => {
    form.reset();
    search.dispatchEvent(new Event('input', { bubbles: true }));
  }));
  // Liên kết từ trang Tổng quan mang theo ?status=; chỉ nhận khóa tab đã có, giá trị lạ giữ tab mặc định.
  const applyIncomingQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('status');
    if (!requested) return;
    // "?status=unresolved" = vụ việc đang mở, chưa kết luận (Mới + Đang xác minh).
    // Bộ lọc sâu khớp số 6 trên thẻ Tổng quan; không thêm tab mới, không đổi nghĩa tab "Mới"/"Đang xác minh".
    if (requested === 'unresolved') {
      status = 'unresolved';
      tabs.querySelectorAll('[role="tab"]').forEach(item => {
        item.setAttribute('aria-selected', 'false');
        item.tabIndex = -1;
      });
      const firstTab = tabs.querySelector('[role="tab"]');
      if (firstTab) firstTab.tabIndex = 0;
      results.removeAttribute('aria-labelledby');
      results.setAttribute('aria-label', 'Các vụ việc đang mở, chưa kết luận');
      return;
    }
    const tab = [...tabs.querySelectorAll('[data-reports-status]')].find(item => item.dataset.reportsStatus === requested);
    if (!tab) {
      // Giá trị ngoài danh sách phải được nói rõ, không âm thầm trả về tab mặc định như thể không có vấn đề gì.
      const allowed = [...tabs.querySelectorAll('[data-reports-status]')].map(item => item.dataset.reportsStatus);
      allowed.push('unresolved');
      const notice = document.createElement('p');
      notice.className = 'alert alert--warning reports__query-alert';
      notice.setAttribute('role', 'status');
      const bold = document.createElement('strong');
      bold.textContent = `Bộ lọc không hợp lệ: ?status=${requested}. `;
      const rest = document.createElement('span');
      rest.textContent = `Giá trị được chấp nhận: ${allowed.join(', ')}. Đã hiển thị toàn bộ báo cáo.`;
      notice.append(bold, rest);
      results.parentNode.insertBefore(notice, results);
      return;
    }
    status = tab.dataset.reportsStatus;
    tabs.querySelectorAll('[role="tab"]').forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    results.setAttribute('aria-labelledby', tab.id);
  };

  applyIncomingQuery();
  refresh.addEventListener('click', loadReports);
  // Trang chi tiết lưu kết luận vào sessionStorage; quay lại danh sách phải đọc lại trạng thái.
  window.addEventListener('pageshow', event => { if (event.persisted) loadReports(); });
  loadReports();
})();

