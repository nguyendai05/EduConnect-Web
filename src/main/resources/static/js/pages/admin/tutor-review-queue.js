(() => {
  const page = document.querySelector('[data-tutor-review-queue]');
  if (!page) return;

  // Dữ liệu mẫu của prototype; thay bằng dữ liệu server khi nối backend.
  const store = window.EduTutorReview;
  const statuses = store.statuses;
  let profiles = store.list();
  const form = page.querySelector('[data-queue-filters]');
  const search = page.querySelector('[data-queue-search]');
  const tabs = page.querySelector('[data-queue-status-tabs]');
  const results = page.querySelector('[data-queue-results]');
  const list = page.querySelector('[data-queue-list]');
  const table = page.querySelector('[data-queue-table]');
  const empty = page.querySelector('[data-queue-empty]');
  const loading = page.querySelector('[data-queue-loading]');
  const pagination = page.querySelector('[data-pagination]');
  const pageSize = page.querySelector('[data-queue-page-size]');
  const refresh = page.querySelector('[data-queue-refresh]');
  const template = page.querySelector('#queue-row-template');
  const currency = new Intl.NumberFormat('vi-VN');
  const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  let status = 'pending';
  let filtered = [];
  let isLoading = true;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
  const setText = (root, selector, value) => { root.querySelector(selector).textContent = value; };
  const shorten = (value, max = 96) => (value.length > max ? `${value.slice(0, max).trimEnd()}…` : value);
  const fileBadge = profile => {
    if (!profile.fileTotal) return { badge: 'badge--neutral', label: 'Chưa tải minh chứng' };
    if (profile.fileRejected) return { badge: 'badge--danger', label: `${profile.fileTotal} tệp · ${profile.fileRejected} bị từ chối` };
    if (profile.filePending) return { badge: 'badge--warning', label: `${profile.fileTotal} tệp · ${profile.filePending} chờ duyệt` };
    return { badge: 'badge--success', label: `${profile.fileTotal} tệp hợp lệ` };
  };

  const renderRows = () => {
    if (isLoading) return;
    const current = Number(pagination.dataset.current);
    const size = Number(pageSize.value);
    const visible = filtered.slice((current - 1) * size, current * size);
    const fragment = document.createDocumentFragment();
    visible.forEach(profile => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.dataset.queueRow = profile.id;
      setText(row, '[data-profile-avatar]', profile.initials);
      setText(row, '[data-profile-name]', profile.tutor);
      setText(row, '[data-profile-tag]', `${profile.kindLabel} · ${profile.profileTag}`);
      setText(row, '[data-profile-school]', profile.school);
      setText(row, '[data-profile-major]', profile.major);
      setText(row, '[data-profile-degree]', `${profile.degreeLabel} · ${profile.experienceYears} năm KN`);
      const rates = row.querySelector('[data-profile-rates]');
      profile.subjects.forEach(subject => {
        const item = document.createElement('li');
        const label = document.createElement('small');
        label.textContent = `${subject.label} · ${subject.level}`;
        const price = document.createElement('b');
        price.textContent = `${currency.format(subject.rate)} ₫ `;
        const unit = document.createElement('span');
        unit.textContent = `/ ${subject.duration}p`;
        price.append(unit);
        item.append(label, price);
        rates.append(item);
      });
      setText(row, '[data-profile-region]', profile.region);
      setText(row, '[data-profile-formats]', profile.formats.join(' · '));
      const files = row.querySelector('[data-profile-files]');
      const fileState = fileBadge(profile);
      files.classList.add(fileState.badge);
      files.textContent = fileState.label;
      setText(row, '[data-profile-evidence]', profile.status === 'pending' && profile.evidenceMissing.length ? `Thiếu: ${profile.evidenceMissing.join(', ')}` : '');
      const badge = row.querySelector('[data-profile-status]');
      badge.classList.add(profile.statusBadge);
      badge.textContent = profile.statusLabel;
      const note = profile.status === 'rejected' ? `Lý do: ${shorten(profile.reason || 'Hồ sơ chưa đạt yêu cầu xác minh.')}` : profile.status === 'draft' ? 'Hồ sơ đang nháp, chưa gửi duyệt' : '';
      setText(row, '[data-profile-reason]', note);
      const submitted = new Date(profile.submitted);
      const date = row.querySelector('[data-profile-date]');
      date.dateTime = profile.submitted;
      date.textContent = dateFormat.format(submitted);
      setText(row, '[data-profile-time]', timeFormat.format(submitted));
      const link = row.querySelector('[data-profile-detail]');
      link.href = `${window.EduRoute.path('/admin/tutor-review-detail')}?id=${encodeURIComponent(profile.id)}`;
      link.setAttribute('aria-label', `Xem chi tiết hồ sơ gia sư ${profile.id} của ${profile.tutor}`);
      fragment.append(row);
    });
    list.replaceChildren(fragment);
    table.hidden = filtered.length === 0;
    empty.hidden = filtered.length !== 0;
  };

  const applyFilters = () => {
    const query = normalize(search.value);
    const subject = form.elements.subject.value;
    const area = form.elements.area.value;
    const kind = form.elements.kind.value;
    const sort = form.elements.sort.value;
    filtered = profiles.filter(profile => profile.status === status
      && (!query || normalize([profile.id, profile.tutor, profile.school, profile.major, profile.region, profile.profileTag, profile.kindLabel, ...profile.subjectLabels].join(' ')).includes(query))
      && (subject === 'all' || profile.subjectKeys.includes(subject))
      && (area === 'all' || profile.area === area)
      && (kind === 'all' || profile.kind === kind));
    filtered.sort((left, right) => {
      if (sort === 'priority') {
        const priority = Number(Boolean(right.evidenceMissing.length)) - Number(Boolean(left.evidenceMissing.length));
        if (priority) return priority;
        return new Date(left.submitted) - new Date(right.submitted);
      }
      return sort === 'oldest' ? new Date(left.submitted) - new Date(right.submitted) : new Date(right.submitted) - new Date(left.submitted);
    });
    setText(page, '[data-queue-result-summary]', `${filtered.length} hồ sơ ${statuses[status].summary}`);
    const hasFilters = Boolean(query) || subject !== 'all' || area !== 'all' || kind !== 'all' || sort !== 'newest';
    page.querySelector('.tutor-review-queue__results-heading [data-queue-reset]').hidden = !hasFilters;
    pagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { total: filtered.length, pageSize: Number(pageSize.value), current: 1 } }));
    renderRows();
  };

  const syncCounts = () => {
    Object.keys(statuses).forEach(key => setText(page, `[data-status-count="${key}"]`, profiles.filter(profile => profile.status === key).length));
    const pending = profiles.filter(profile => profile.status === 'pending');
    const blocked = pending.filter(profile => profile.evidenceMissing.length);
    const verified = profiles.filter(profile => profile.status === 'verified');
    const rejected = profiles.filter(profile => profile.status === 'rejected');
    const draft = profiles.filter(profile => profile.status === 'draft');
    setText(page, '[data-queue-pending-count]', pending.length);
    setText(page, '[data-queue-verified-count]', verified.length);
    setText(page, '[data-queue-closed-count]', rejected.length + draft.length);
    setText(page, '[data-queue-rejected-count-label]', `${rejected.length} từ chối · ${draft.length} nháp`);
    setText(page, '[data-queue-priority-count]', `${blocked.length} hồ sơ`);
    setText(page, '[data-queue-approval-note]', `${verified.length} hồ sơ đang hiển thị trong kết quả tìm gia sư`);
    const sidebarCount = page.querySelector('.admin-sidebar__item.is-active .admin-sidebar__badge');
    sidebarCount.textContent = pending.length;
    sidebarCount.setAttribute('aria-label', `${pending.length} hồ sơ chờ xử lý`);
  };

  const loadProfiles = () => {
    profiles = store.list();
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
      setText(page, '[data-queue-updated]', `Cập nhật lúc ${timeFormat.format(new Date())}`);
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
    status = selected.dataset.queueStatus;
    results.setAttribute('aria-labelledby', selected.id);
    applyFilters();
  });
  page.querySelectorAll('[data-queue-reset]').forEach(button => button.addEventListener('click', () => {
    form.reset();
    search.dispatchEvent(new Event('input', { bubbles: true }));
  }));
  // Liên kết từ trang Tổng quan mang theo ?status=; chỉ nhận khóa tab đã có, giá trị lạ giữ tab mặc định.
  const applyIncomingQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('status');
    if (!requested) return;
    const tab = [...tabs.querySelectorAll('[data-queue-status]')].find(item => item.dataset.queueStatus === requested);
    if (!tab) return;
    status = tab.dataset.queueStatus;
    tabs.querySelectorAll('[role="tab"]').forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    results.setAttribute('aria-labelledby', tab.id);
  };

  applyIncomingQuery();
  refresh.addEventListener('click', loadProfiles);
  window.addEventListener('pageshow', event => { if (event.persisted) loadProfiles(); });
  loadProfiles();
})();

