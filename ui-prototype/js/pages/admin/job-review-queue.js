(() => {
  const page = document.querySelector('[data-job-review-queue]');
  if (!page) return;

  // Dữ liệu mẫu của prototype; thay bằng dữ liệu server khi tích hợp JSP.
  let jobs = window.EduJobReview.list();
  const statuses = {
    pending: { label: 'Chờ duyệt', summary: 'chờ duyệt', badge: 'badge--warning' },
    hiring: { label: 'Đang tuyển', summary: 'đang tuyển', badge: 'badge--success' },
    closed: { label: 'Đã đóng', summary: 'đã đóng', badge: 'badge--neutral' },
    rejected: { label: 'Bị từ chối', summary: 'bị từ chối', badge: 'badge--danger' },
  };
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

  const renderRows = () => {
    if (isLoading) return;
    const current = Number(pagination.dataset.current);
    const size = Number(pageSize.value);
    const visible = filtered.slice((current - 1) * size, current * size);
    const fragment = document.createDocumentFragment();
    visible.forEach(job => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.dataset.queueRow = job.id;
      setText(row, '[data-job-title]', job.title);
      setText(row, '[data-job-reference]', job.id);
      setText(row, '[data-job-sessions]', job.sessions);
      setText(row, '[data-job-avatar]', job.initials);
      setText(row, '[data-job-poster]', job.poster);
      setText(row, '[data-job-role]', job.role);
      setText(row, '[data-job-subject]', `${job.subjectLabel} · ${job.grade}`);
      setText(row, '[data-job-fee]', `${currency.format(job.fee)} ₫ / buổi`);
      setText(row, '[data-job-region]', job.region);
      setText(row, '[data-job-format]', job.format);
      const submitted = new Date(job.submitted);
      const date = row.querySelector('[data-job-date]');
      date.dateTime = job.submitted;
      date.textContent = dateFormat.format(submitted);
      setText(row, '[data-job-time]', timeFormat.format(submitted));
      const signal = row.querySelector('[data-job-signal]');
      signal.classList.add(job.signal ? 'badge--warning' : 'badge--neutral');
      signal.textContent = job.signal ? 'Cần kiểm tra' : 'Bình thường';
      setText(row, '[data-job-signal-note]', job.signal);
      const badge = row.querySelector('[data-job-status]');
      badge.classList.add(statuses[job.status].badge);
      badge.textContent = statuses[job.status].label;
      const button = row.querySelector('[data-job-detail]');
      button.href = `job-review-detail.html?id=${encodeURIComponent(job.id)}`;
      button.setAttribute('aria-label', `Xem chi tiết tin ${job.id}`);
      fragment.append(row);
    });
    list.replaceChildren(fragment);
    table.hidden = filtered.length === 0;
    empty.hidden = filtered.length !== 0;
  };

  const applyFilters = () => {
    const query = normalize(search.value);
    const signal = form.elements.signal.value;
    const subject = form.elements.subject.value;
    const sort = form.elements.sort.value;
    filtered = jobs.filter(job => job.status === status
      && (!query || normalize(`${job.id} ${job.title} ${job.poster} ${job.subjectLabel} ${job.grade} ${job.region} ${job.format}`).includes(query))
      && (signal === 'all' || (signal === 'flagged' ? Boolean(job.signal) : !job.signal))
      && (subject === 'all' || job.subject === subject));
    filtered.sort((left, right) => {
      if (sort === 'priority') {
        const priority = Number(Boolean(right.signal)) - Number(Boolean(left.signal));
        if (priority) return priority;
      }
      return sort === 'newest' ? new Date(right.submitted) - new Date(left.submitted) : new Date(left.submitted) - new Date(right.submitted);
    });
    setText(page, '[data-queue-result-summary]', `${filtered.length} tin ${statuses[status].summary}`);
    const hasFilters = Boolean(query) || signal !== 'all' || subject !== 'all' || sort !== 'priority';
    page.querySelector('.job-review-queue__results-heading [data-queue-reset]').hidden = !hasFilters;
    pagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { total: filtered.length, pageSize: Number(pageSize.value), current: 1 } }));
    renderRows();
  };

  const syncCounts = () => {
    Object.keys(statuses).forEach(key => setText(page, `[data-status-count="${key}"]`, jobs.filter(job => job.status === key).length));
    const pending = jobs.filter(job => job.status === 'pending');
    const flagged = pending.filter(job => job.signal).length;
    setText(page, '[data-queue-pending-count]', pending.length);
    setText(page, '[data-queue-flagged-count]', flagged);
    setText(page, '[data-queue-priority-count]', `${flagged} tin`);
    const sidebarCount = page.querySelector('.admin-sidebar__item.is-active .admin-sidebar__badge');
    sidebarCount.textContent = pending.length;
    sidebarCount.setAttribute('aria-label', `${pending.length} tin chờ xử lý`);
  };

  const loadJobs = () => {
    jobs = window.EduJobReview.list();
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
  // Liên kết từ trang Tổng quan mang theo ?status= và ?sort=; chỉ nhận giá trị có sẵn trong tab và select của trang.
  const applyIncomingQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('status');
    if (requested) {
      const tab = [...tabs.querySelectorAll('[data-queue-status]')].find(item => item.dataset.queueStatus === requested);
      if (tab) {
        status = tab.dataset.queueStatus;
        tabs.querySelectorAll('[role="tab"]').forEach(item => {
          const active = item === tab;
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
        });
        results.setAttribute('aria-labelledby', tab.id);
      }
    }
    const sort = params.get('sort');
    if (sort && [...form.elements.sort.options].some(option => option.value === sort)) form.elements.sort.value = sort;
  };

  applyIncomingQuery();
  refresh.addEventListener('click', loadJobs);
  window.addEventListener('pageshow', event => { if (event.persisted) loadJobs(); });
  loadJobs();
})();
