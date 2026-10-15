/**
 * Hàng đợi duyệt tin tìm gia sư — mọi dòng tin, số đếm và bộ lọc đọc từ EduStore
 * (Store.jobQueue(bucket) / Store.jobQueueCounts()), không còn bảng fixture riêng.
 * Card render bằng <template id="queue-row-template"> nên hook-check vẫn thấy markup trong HTML.
 */
(() => {
  const page = document.querySelector('[data-job-review-queue]');
  if (!page) return;

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
  const storeError = page.querySelector('[data-store-error]');

  const Review = window.EduJobReview;
  const Store = window.EduStore;

  /* Store vắng mặt (script lỗi): ẩn nội dung, nói rõ lý do, KHÔNG ném Uncaught và KHÔNG
     hiển thị bảng tin mẫu — số liệu stale còn tệ hơn trang trống. */
  if (!Store || !Review || !Review.available) {
    page.querySelectorAll('[data-store-content]').forEach(node => { node.hidden = true; });
    if (storeError) storeError.hidden = false;
    const updated = page.querySelector('[data-queue-updated]');
    if (updated) updated.textContent = 'Không tải được hàng đợi';
    return;
  }

  const { buckets, queue, counts } = Review;
  const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  let status = 'pending';
  let filtered = [];
  let isLoading = true;
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
  const setText = (root, selector, value) => { root.querySelector(selector).textContent = value; };

  const renderRows = () => {
    if (isLoading) return;
    const current = Number(pagination.dataset.current);
    const size = Number(pageSize.value);
    const visible = filtered.slice((current - 1) * size, current * size);
    const fragment = document.createDocumentFragment();
    visible.forEach(entry => {
      const { job, poster, bucket, applicationCount } = entry;
      const row = template.content.firstElementChild.cloneNode(true);
      row.dataset.queueRow = job.id;
      setText(row, '[data-job-title]', job.title);
      setText(row, '[data-job-reference]', job.id);
      setText(row, '[data-job-sessions]', `${job.sessionsPerWeek} buổi/tuần · ${job.durationMinutes} phút/buổi`);
      setText(row, '[data-job-applications]', `${applicationCount} hồ sơ ứng tuyển`);
      setText(row, '[data-job-avatar]', poster.initials);
      setText(row, '[data-job-poster]', poster.name);
      setText(row, '[data-job-role]', `${poster.role} · ${poster.learnerId || '—'}`);
      setText(row, '[data-job-subject]', `${job.subjectLabel} · ${job.gradeLabel}`);
      // Store.formatMoney() đã tự thêm đơn vị tiền tệ — không nối ký hiệu đồng thủ công (A9).
      setText(row, '[data-job-fee]', `${Store.formatMoney(job.budgetPerSession)} / buổi`);
      setText(row, '[data-job-region]', job.district);
      setText(row, '[data-job-format]', job.modeLabel);
      const submitted = new Date(job.submittedAt);
      const date = row.querySelector('[data-job-date]');
      date.dateTime = job.submittedAt;
      date.textContent = dateFormat.format(submitted);
      setText(row, '[data-job-time]', timeFormat.format(submitted));
      const signal = row.querySelector('[data-job-signal]');
      signal.classList.add(job.signal ? 'badge--warning' : 'badge--neutral');
      signal.textContent = job.signal ? 'Cần kiểm tra' : 'Bình thường';
      setText(row, '[data-job-signal-note]', job.signal || 'Không có tín hiệu rà soát.');
      const badge = row.querySelector('[data-job-status]');
      badge.classList.add(buckets[bucket].badge);
      badge.textContent = buckets[bucket].label;
      const button = row.querySelector('[data-job-detail]');
      button.href = `${window.EduRoute.path('/admin/job-review-detail')}?id=${encodeURIComponent(job.id)}`;
      button.setAttribute('aria-label', `Xem chi tiết tin ${job.id}`);
      fragment.append(row);
    });
    list.replaceChildren(fragment);
    table.hidden = filtered.length === 0;
    empty.hidden = filtered.length !== 0;
  };

  const applyFilters = () => {
    const info = buckets[status];
    const query = normalize(search.value);
    const signal = form.elements.signal.value;
    const subject = form.elements.subject.value;
    const sort = form.elements.sort.value;
    // Store.jobQueue(bucket) đã sắp theo submittedAt TĂNG dần — tin chờ lâu nhất lên đầu.
    filtered = queue(status).filter(entry => {
      const { job, poster } = entry;
      return (!query || normalize([job.id, job.title, poster.name, job.subjectLabel, job.gradeLabel, job.district, job.modeLabel].join(' ')).includes(query))
        && (signal === 'all' || (signal === 'flagged' ? Boolean(job.signal) : !job.signal))
        && (subject === 'all' || job.subject === subject);
    });
    if (sort === 'newest') filtered = filtered.slice().reverse();
    if (sort === 'priority') filtered = filtered.slice().sort((left, right) => Number(Boolean(right.job.signal)) - Number(Boolean(left.job.signal)));
    setText(page, '[data-queue-result-summary]', `${filtered.length} tin ${info.summary}`);
    const hasFilters = Boolean(query) || signal !== 'all' || subject !== 'all' || sort !== 'priority';
    page.querySelector('.job-review-queue__results-heading [data-queue-reset]').hidden = !hasFilters;
    pagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { total: filtered.length, pageSize: Number(pageSize.value), current: 1 } }));
    renderRows();
  };

  const syncCounts = () => {
    const tally = counts();
    Object.keys(buckets).forEach(key => setText(page, `[data-status-count="${key}"]`, tally[key]));
    const pending = queue('pending');
    const flagged = pending.filter(entry => Boolean(entry.job.signal)).length;
    setText(page, '[data-queue-pending-count]', tally.pending);
    setText(page, '[data-queue-flagged-count]', flagged);
    setText(page, '[data-queue-priority-count]', `${flagged} tin`);
    setText(page, '[data-queue-store-total]', `${tally.total} tin trong dữ liệu dùng chung`);
    const sidebarCount = page.querySelector('.admin-sidebar__item.is-active .admin-sidebar__badge');
    sidebarCount.textContent = tally.pending;
    sidebarCount.setAttribute('aria-label', `${tally.pending} tin chờ xử lý`);
  };

  const loadJobs = () => {
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
