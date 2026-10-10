/** Trang Tổng quan quản trị: dữ liệu mẫu + dựng giao diện. Không gọi API, không thêm thư viện biểu đồ. */
(() => {
  const page = document.querySelector('[data-dashboard]');
  if (!page) return;

  // Dữ liệu minh họa của bản mẫu; thay bằng dữ liệu server khi tích hợp JSP.
  const buildSnapshot = () => {
    const queues = [
      { key: 'tutor', title: 'Hồ sơ gia sư chờ xác minh', icon: 'tutor-verification.svg', count: 4, countUnit: 'hồ sơ', badge: { label: 'Chờ duyệt', tone: 'warning' }, meta: '1 hồ sơ đã xác thực CCCD điện tử, có thể duyệt ngay trong hôm nay.', reason: 'SLA kiểm duyệt: dưới 4 giờ làm việc.', urgent: true, href: 'tutor-review-queue.html?status=pending', linkLabel: 'Xem hàng đợi' },
      { key: 'job', title: 'Tin tìm gia sư chờ duyệt', icon: 'tutor-search.svg', count: 5, countUnit: 'tin', badge: { label: '2 tin cần kiểm tra', tone: 'warning' }, meta: 'Hệ thống gắn cờ vì nghi chứa số điện thoại hoặc tài khoản Zalo trong ghi chú riêng.', reason: 'Ưu tiên rà soát thủ công trước khi công khai tin.', urgent: true, href: 'job-review-queue.html?status=pending', linkLabel: 'Xem hàng đợi' },
      { key: 'report', title: 'Báo cáo & tranh chấp đang mở', icon: 'dispute.svg', count: 6, countUnit: 'vụ việc', amount: 1060000, badge: { label: 'Cần xử lý', tone: 'danger' }, meta: '3 báo cáo mới về buổi học và 3 vụ đang được xác minh.', reason: 'Có {amount} đang bị khóa trong ký quỹ chờ kết luận.', urgent: true, href: 'reports.html?status=unresolved', linkLabel: 'Xem báo cáo' },
      { key: 'payout', title: 'Yêu cầu rút tiền chờ xử lý', icon: 'wallet.svg', count: 5, countUnit: 'yêu cầu', amount: 19690000, badge: { label: 'Chờ phê duyệt', tone: 'warning' }, meta: 'Tổng {amount} từ 5 gia sư đang chờ quản trị xử lý.', reason: 'Ưu tiên yêu cầu gửi trước 09:00 để giải ngân trong ngày.', urgent: true, href: 'payout-requests.html?status=pending', linkLabel: 'Xem yêu cầu' },
      { key: 'sla', title: 'Tin chờ duyệt quá SLA', icon: 'clock.svg', count: 1, countUnit: 'tin', badge: { label: 'Quá 4 giờ', tone: 'info' }, meta: 'Tin TT-8839 gửi lúc 09:05, hiện chưa có kiểm duyệt viên phụ trách.', reason: 'Sắp xếp: ưu tiên tin chờ lâu nhất.', urgent: false, href: 'job-review-queue.html?status=pending&sort=oldest', linkLabel: 'Xem hàng đợi' },
    ];
    const queueCount = key => queues.filter(item => item.key === key).reduce((total, item) => total + item.count, 0);

    return {
      asOf: new Date().toISOString(),
      operations: [
        { key: 'users', label: 'Người dùng hoạt động', icon: 'profile.svg', kind: 'count', value: 12486, unit: 'người dùng', note: 'Phụ huynh và học viên đăng nhập trong 30 ngày gần nhất.', badge: { label: 'Tăng 840 so với tháng trước', tone: 'success' }, href: 'audit-logs.html?module=account', linkLabel: 'Xem nhật ký người dùng' },
        { key: 'tutors', label: 'Gia sư đã xác minh', icon: 'verified.svg', kind: 'count', value: 1284, unit: 'gia sư', note: 'Hồ sơ đã duyệt chứng chỉ và xác thực giấy tờ tùy thân.', badge: { label: 'Đã bảo chứng', tone: 'verified' }, href: 'tutor-review-queue.html?status=verified', linkLabel: 'Xem hồ sơ gia sư' },
        { key: 'pending-tutor', label: 'Hồ sơ chờ duyệt', icon: 'certificate.svg', kind: 'count', value: queueCount('tutor'), unit: 'hồ sơ', tone: 'warning', note: 'Chờ xác minh chứng chỉ giảng dạy và giấy tờ tùy thân.', badge: { label: 'Cần xử lý hôm nay', tone: 'warning' }, href: 'tutor-review-queue.html?status=pending', linkLabel: 'Xem hàng đợi' },
        { key: 'pending-job', label: 'Tin tìm gia sư chờ duyệt', icon: 'tutor-search.svg', kind: 'count', value: queueCount('job'), unit: 'tin đăng', tone: 'warning', note: '2 tin có tín hiệu chứa thông tin liên hệ ngoài nền tảng.', badge: { label: '2 tin cần kiểm tra', tone: 'warning' }, href: 'job-review-queue.html?status=pending', linkLabel: 'Xem hàng đợi' },
        { key: 'open-posts', label: 'Tin đăng & lớp đang mở', icon: 'calendar.svg', kind: 'count', value: 148, unit: 'niêm yết', note: '96 tin đang tuyển và 52 lớp nhóm đang mở nhận học viên.', badge: { label: 'Đang tuyển', tone: 'success' }, href: 'job-review-queue.html?status=hiring', linkLabel: 'Xem tin đang tuyển' },
        { key: 'contracts', label: 'Hợp đồng đang hoạt động', icon: 'receipt.svg', kind: 'count', value: 317, unit: 'hợp đồng', note: 'Hợp đồng đã cọc và đang trong giai đoạn diễn ra buổi học.', badge: { label: 'Theo dõi tiến độ', tone: 'info' }, href: 'audit-logs.html?module=contract', linkLabel: 'Xem nhật ký hợp đồng' },
        { key: 'reports', label: 'Báo cáo đang mở', icon: 'shield-alert.svg', kind: 'count', value: queueCount('report'), unit: 'vụ việc', tone: 'danger', note: 'Báo cáo vi phạm nội dung hoặc tranh chấp buổi học, hợp đồng.', badge: { label: 'Cần xử lý', tone: 'danger' }, href: 'reports.html?status=unresolved', linkLabel: 'Xem báo cáo' },
        { key: 'payouts', label: 'Yêu cầu rút tiền chờ xử lý', icon: 'wallet.svg', kind: 'count', value: queueCount('payout'), unit: 'yêu cầu', tone: 'warning', amount: 19690000, note: 'Tổng {amount} đang chờ quản trị phê duyệt.', badge: { label: 'Chờ phê duyệt', tone: 'warning' }, href: 'payout-requests.html?status=pending', linkLabel: 'Xem yêu cầu' },
      ],
      finance: [
        { key: 'gmv', label: 'Tổng giá trị giao dịch', icon: 'payment-copy.svg', kind: 'money', value: 18472500000, unit: 'GMV 30 ngày', tone: 'success', note: 'Giá trị hợp đồng đã thanh toán qua ký quỹ, chưa trừ phí nền tảng.', badge: { label: 'Tăng 2,3% theo tháng', tone: 'success' }, href: 'audit-logs.html?module=payout', linkLabel: 'Xem nhật ký thanh toán' },
        { key: 'fee', label: 'Doanh thu phí nền tảng', icon: 'receipt.svg', kind: 'money', value: 1477800000, unit: 'phí thu 30 ngày', note: 'Mức phí 8% áp trên giá trị hợp đồng đã hoàn tất buổi học.', badge: { label: 'Đối soát tự động', tone: 'info' }, href: 'payout-requests.html?status=completed', linkLabel: 'Xem khoản đã đối soát' },
        { key: 'escrow', label: 'Ký quỹ đang giữ', icon: 'lock.svg', kind: 'money', value: 6820000000, unit: 'escrow đang giữ', note: 'Tiền phụ huynh đã cọc, chờ xác nhận đủ số buổi học trước khi giải ngân.', badge: { label: 'Khớp sổ cái', tone: 'escrow' }, href: 'reports.html?status=open', linkLabel: 'Xem tiền đang giữ' },
        { key: 'released', label: 'Đã giải ngân cho gia sư', icon: 'check-double.svg', kind: 'money', value: 11940000000, unit: 'giải ngân 30 ngày', tone: 'success', note: 'Chuyển vào số dư khả dụng sau khi học viên xác nhận buổi học.', badge: { label: 'Không số dư âm', tone: 'success' }, href: 'payout-requests.html?status=completed', linkLabel: 'Xem yêu cầu rút tiền' },
      ],
      queues,
      activity: [
        { actor: 'Hệ thống', tone: 'neutral', initials: 'HT', title: 'Tự động giải ngân buổi học đã xác nhận', target: 'Buổi 3 — HĐ-20261008-019 · {amount}', amount: 200000, result: 'Tiền chuyển vào số dư khả dụng của gia sư, không cần thao tác thủ công.', at: '2026-10-10T02:05:00+07:00', href: 'payout-requests.html?status=completed', linkLabel: 'Xem bản ghi liên quan' },
        { actor: 'Quản trị viên', tone: 'info', initials: 'QT', title: 'Duyệt hồ sơ gia sư', target: 'Lê Quỳnh Chi · Toán cấp hai, Hà Nội', result: 'Hồ sơ chuyển sang Đã xác minh và được gắn huy hiệu bảo chứng.', at: '2026-10-10T01:20:00+07:00', href: 'tutor-review-queue.html?status=verified', linkLabel: 'Xem hồ sơ gia sư' },
        { actor: 'Phụ huynh', tone: 'danger', initials: 'PH', title: 'Gửi báo cáo tranh chấp buổi học', target: 'Buổi 3 — HĐ-20260919-024 · Ngữ văn 12', result: '{amount} đang bị khóa trong ký quỹ chờ quản trị kết luận.', amount: 220000, at: '2026-10-09T20:42:00+07:00', href: 'reports.html?status=open', linkLabel: 'Xem báo cáo' },
        { actor: 'Gia sư', tone: 'warning', initials: 'GS', title: 'Gửi yêu cầu rút tiền', target: 'Trần Minh Khoa · {amount} về tài khoản ngân hàng đã liên kết', amount: 2500000, result: 'Đáp ứng điều kiện thời gian giữ tiền, chờ quản trị phê duyệt.', at: '2026-10-09T18:15:00+07:00', href: 'payout-requests.html?status=pending', linkLabel: 'Xem yêu cầu rút tiền' },
        { actor: 'Hệ thống', tone: 'neutral', initials: 'HT', title: 'Gắn cờ tin tìm gia sư cần rà soát', target: 'TT-8841 · Gia sư Tiếng Anh lớp 10', result: 'Phát hiện số điện thoại trong ghi chú riêng; tin đang chờ kiểm duyệt.', at: '2026-10-09T15:30:00+07:00', href: 'job-review-queue.html?status=pending', linkLabel: 'Xem hàng đợi tin' },
        { actor: 'Hệ thống', tone: 'neutral', initials: 'HT', title: 'Hủy lớp nhóm thiếu số lượng tối thiểu', target: 'Lớp Hóa 10 Nâng cao · LH-1002', result: 'Hoàn 100% {amount} ký quỹ cho 2 học viên vào ví khả dụng.', amount: 800000, at: '2026-10-09T09:05:00+07:00', href: 'audit-logs.html?module=automation', linkLabel: 'Xem nhật ký lớp học' },
      ],
      gmvTrend: [
        { label: 'T5', full: 'Tháng 5/2026', gmv: 13850000000, fee: 1108000000 },
        { label: 'T6', full: 'Tháng 6/2026', gmv: 14920000000, fee: 1194000000 },
        { label: 'T7', full: 'Tháng 7/2026', gmv: 16310000000, fee: 1305000000 },
        { label: 'T8', full: 'Tháng 8/2026', gmv: 17240000000, fee: 1379000000 },
        { label: 'T9', full: 'Tháng 9/2026', gmv: 18060000000, fee: 1445000000 },
        { label: 'T10', full: 'Tháng 10/2026', gmv: 18472500000, fee: 1477800000 },
      ],
      escrowMix: [
        { key: 'released', label: 'Đã giải ngân', value: 11940000000 },
        { key: 'held', label: 'Đang ký quỹ (HELD)', value: 6820000000 },
        { key: 'awaiting', label: 'Chờ học viên xác nhận buổi học', value: 1265000000 },
        { key: 'disputed', label: 'Đang tranh chấp', value: 385000000 },
      ],
      integrity: [
        { title: '1. Không có số dư âm', status: { label: 'Đạt', tone: 'success' }, description: 'Không phát hiện ví nào có số dư khả dụng, đang giữ hoặc chờ rút nhỏ hơn 0.', value: '0 ví bất thường trong {count} ví đang mở', count: 4812 },
        { title: '2. Số dư đang giữ khớp ký quỹ', status: { label: 'Đạt', tone: 'success' }, description: 'Tổng số dư đang giữ khớp toàn bộ khoản escrow ở trạng thái HELD.', value: 'Khớp {amount}, độ lệch 0', amount: 6820000000 },
        { title: '3. Tiền không tự sinh ra hoặc mất đi', status: { label: 'Đạt', tone: 'success' }, description: 'Tổng tiền nạp trừ tổng tiền đã rút khớp với tổng số dư hiện có của toàn hệ thống.', value: 'Tổng dư {amount}, khớp tuyệt đối', amount: 20410000000 },
      ],
      services: [
        { label: 'Task quét giải ngân 72 giờ', status: { label: 'Bình thường', tone: 'success' }, tone: 'ok' },
        { label: 'Task quét cờ tin tuyển', status: { label: 'Đang chạy', tone: 'info' }, tone: 'ok' },
        { label: 'Task kiểm toán sổ cái ký quỹ', status: { label: 'Đang chạy', tone: 'info' }, tone: 'ok' },
        { label: 'Cổng đối soát sao kê ngân hàng', status: { label: 'Chậm 12 phút', tone: 'warning' }, tone: 'warning' },
      ],
    };
  };

  const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
  const count = new Intl.NumberFormat('vi-VN');
  const percent = new Intl.NumberFormat('vi-VN', { style: 'percent', maximumFractionDigits: 1 });
  const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  const timeFormat = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  const relativeTime = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' });
  const badgeTones = { success: 'badge--success', warning: 'badge--warning', danger: 'badge--danger', info: 'badge--info', neutral: 'badge--neutral', verified: 'badge--verified', escrow: 'badge--escrow' };

  const content = page.querySelector('[data-dashboard-content]');
  const loading = page.querySelector('[data-dashboard-loading]');
  const refresh = page.querySelector('[data-dashboard-refresh]');
  const updated = page.querySelector('[data-dashboard-updated]');
  const templates = {
    metric: page.querySelector('#dashboard-metric-template'),
    queue: page.querySelector('#dashboard-queue-template'),
    activity: page.querySelector('#dashboard-activity-template'),
    check: page.querySelector('#dashboard-check-template'),
    service: page.querySelector('#dashboard-service-template'),
  };

  const setText = (root, selector, value) => {
    const target = root.querySelector(selector);
    if (target) target.textContent = value;
  };
  // Số tiền và số lượng luôn đi qua Intl; {amount} là chỗ trống trong chuỗi fixture.
  const varsOf = item => ({ amount: item.amount === undefined ? '' : money.format(item.amount), count: item.count === undefined ? '' : count.format(item.count) });
  const expand = (value, vars) => String(value).replace(/\{(\w+)\}/g, (match, key) => (key in vars ? vars[key] : match));
  const clone = (template, mutate) => {
    const node = template.content.firstElementChild.cloneNode(true);
    mutate(node);
    return node;
  };
  const fillBadge = (root, selector, spec) => {
    const badge = root.querySelector(selector);
    if (!badge || !spec) return;
    badge.classList.add(badgeTones[spec.tone] || 'badge--neutral');
    badge.textContent = spec.label;
  };
  const relativeFrom = (iso, now) => {
    const minutes = Math.round((new Date(iso) - now) / 60000);
    if (minutes > -2) return 'vừa xong';
    const absolute = Math.abs(minutes);
    if (absolute < 45) return relativeTime.format(minutes, 'minute');
    if (absolute < 60 * 36) return relativeTime.format(Math.round(minutes / 60), 'hour');
    return relativeTime.format(Math.round(minutes / 1440), 'day');
  };

  const renderMetrics = (root, items) => {
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      fragment.append(clone(templates.metric, node => {
        if (item.tone) {
          node.classList.add(`stat-card--${item.tone}`);
          // Chỉ tone danger nhuộm màu con số; các tone còn lại giữ màu chữ mặc định
          // vì pastille và badge đã tải thông tin mức độ.
          if (item.tone !== 'danger') node.querySelector('[data-metric-value]').classList.add('stat-card__value--neutral');
        }
        if (item.kind === 'money') node.classList.add('dashboard__metric--money');
        setText(node, '[data-metric-label]', item.label);
        node.querySelector('[data-metric-icon]').src = `../../assets/icons/${item.icon}`;
        setText(node, '[data-metric-value]', item.kind === 'money' ? money.format(item.value) : count.format(item.value));
        setText(node, '[data-metric-unit]', item.unit);
        setText(node, '[data-metric-note]', expand(item.note, varsOf(item)));
        fillBadge(node, '[data-metric-badge]', item.badge);
        const link = node.querySelector('[data-metric-link]');
        link.href = item.href;
        link.setAttribute('aria-label', `${item.linkLabel} — ${item.label}`);
        setText(node, '[data-metric-link-label]', item.linkLabel);
      }));
    });
    root.replaceChildren(fragment);
  };

  const renderQueues = (queues, now) => {
    const root = page.querySelector('[data-dashboard-queue]');
    const fragment = document.createDocumentFragment();
    queues.forEach(item => {
      fragment.append(clone(templates.queue, node => {
        setText(node, '[data-queue-title]', item.title);
        node.querySelector('[data-queue-icon]').src = `../../assets/icons/${item.icon}`;
        setText(node, '[data-queue-meta]', expand(item.meta, varsOf(item)));
        setText(node, '[data-queue-reason]', expand(item.reason, varsOf(item)));
        setText(node, '[data-queue-count]', `${count.format(item.count)} ${item.countUnit}`);
        fillBadge(node, '[data-queue-badge]', item.badge);
        const link = node.querySelector('[data-queue-link]');
        link.href = item.href;
        link.setAttribute('aria-label', `${item.linkLabel} — ${item.title}, ${count.format(item.count)} ${item.countUnit}`);
        setText(node, '[data-queue-link-label]', item.linkLabel);
      }));
    });
    root.replaceChildren(fragment);
    setText(page, '[data-dashboard-priority-total]', `${count.format(queues.filter(item => item.urgent).length)} mục cần chú ý`);
    setText(page, '[data-dashboard-queue-updated]', `Kiểm tra hàng đợi lúc ${timeFormat.format(now)}`);
  };

  const renderActivity = (items, now) => {
    const root = page.querySelector('[data-dashboard-activity]');
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
      fragment.append(clone(templates.activity, node => {
        setText(node, '[data-activity-avatar]', item.initials);
        fillBadge(node, '[data-activity-actor]', { label: item.actor, tone: item.tone });
        setText(node, '[data-activity-title]', item.title);
        setText(node, '[data-activity-target]', expand(item.target, varsOf(item)));
        setText(node, '[data-activity-result]', expand(item.result, varsOf(item)));
        const time = node.querySelector('[data-activity-time]');
        const at = new Date(item.at);
        const stamp = `${dateFormat.format(at)} · ${timeFormat.format(at)}`;
        time.dateTime = item.at;
        time.textContent = `${stamp} · ${relativeFrom(item.at, now)}`;
        time.setAttribute('aria-label', `${item.actor} thao tác lúc ${stamp}`);
        const link = node.querySelector('[data-activity-link]');
        link.href = item.href;
        link.setAttribute('aria-label', `${item.linkLabel} — ${item.title}`);
        setText(node, '[data-activity-link-label]', item.linkLabel);
      }));
    });
    root.replaceChildren(fragment);
  };

  const renderChecks = (snapshot, now) => {
    const root = page.querySelector('[data-dashboard-checks]');
    const fragment = document.createDocumentFragment();
    snapshot.integrity.forEach(item => {
      fragment.append(clone(templates.check, node => {
        setText(node, '[data-check-title]', item.title);
        setText(node, '[data-check-description]', item.description);
        setText(node, '[data-check-value]', expand(item.value, varsOf(item)));
        fillBadge(node, '[data-check-badge]', item.status);
      }));
    });
    root.replaceChildren(fragment);
    const passed = snapshot.integrity.filter(item => item.status.tone === 'success').length;
    const score = page.querySelector('[data-dashboard-integrity-score]');
    score.className = `badge ${passed === snapshot.integrity.length ? 'badge--success' : 'badge--warning'}`;
    score.textContent = `${passed} / ${snapshot.integrity.length} kiểm tra đạt`;
    setText(page, '[data-dashboard-integrity-time]', `Kiểm tra tự động lúc ${timeFormat.format(now)} · ${dateFormat.format(now)}`);
  };

  const renderServices = services => {
    const root = page.querySelector('[data-dashboard-services]');
    const fragment = document.createDocumentFragment();
    services.forEach(item => {
      fragment.append(clone(templates.service, node => {
        if (item.tone !== 'ok') node.querySelector('[data-service-dot]').classList.add('dashboard__service-dot--warning');
        setText(node, '[data-service-label]', item.label);
        fillBadge(node, '[data-service-badge]', item.status);
      }));
    });
    root.replaceChildren(fragment);
  };

  // Biểu đồ chỉ là markup + CSS của trang: chiều cao cột và bề rộng đoạn thanh đặt nội tuyến từ dữ liệu mẫu.
  const renderGmvChart = trend => {
    const chart = page.querySelector('[data-gmv-chart]');
    const fragment = document.createDocumentFragment();
    const max = Math.max(...trend.map(item => item.gmv));
    trend.forEach(item => {
      const group = document.createElement('div');
      group.className = 'dashboard__bar-group';
      const pair = document.createElement('div');
      pair.className = 'dashboard__bar-pair';
      [{ modifier: 'dashboard__bar--gmv', value: item.gmv }, { modifier: 'dashboard__bar--fee', value: item.fee }].forEach(series => {
        const bar = document.createElement('span');
        bar.className = `dashboard__bar ${series.modifier}`;
        bar.style.height = `${Math.max((series.value / max) * 100, 2).toFixed(1)}%`;
        pair.append(bar);
      });
      const label = document.createElement('p');
      label.className = 'dashboard__bar-label';
      label.textContent = item.label;
      group.append(pair, label);
      fragment.append(group);
    });
    chart.replaceChildren(fragment);
    chart.setAttribute('aria-label', `Biểu đồ cột nhóm: GMV và phí nền tảng thu theo ${trend.length} tháng gần nhất, dữ liệu minh họa. Chi tiết giá trị nằm ở phần mô tả bên dưới biểu đồ.`);
    setText(page, '[data-gmv-summary]', `Mô tả dữ liệu: ${trend.map(item => `${item.full} GMV ${money.format(item.gmv)}, phí nền tảng thu ${money.format(item.fee)}`).join('; ')}.`);
  };

  const renderEscrowChart = (segments, total) => {
    const chart = page.querySelector('[data-escrow-chart]');
    const list = page.querySelector('[data-escrow-list]');
    const chartFragment = document.createDocumentFragment();
    const listFragment = document.createDocumentFragment();
    segments.forEach(item => {
      const share = item.value / total;
      const segment = document.createElement('span');
      segment.className = `dashboard__stack-segment dashboard__stack-segment--${item.key}`;
      segment.style.width = `${(share * 100).toFixed(2)}%`;
      chartFragment.append(segment);

      const row = document.createElement('li');
      row.className = 'dashboard__mix-item';
      const label = document.createElement('span');
      label.className = 'dashboard__mix-label';
      const swatch = document.createElement('span');
      swatch.className = `dashboard__swatch dashboard__swatch--${item.key}`;
      swatch.setAttribute('aria-hidden', 'true');
      label.append(swatch, document.createTextNode(item.label));
      const value = document.createElement('span');
      value.className = 'dashboard__mix-value';
      value.textContent = money.format(item.value);
      const shareLabel = document.createElement('span');
      shareLabel.className = 'dashboard__mix-share';
      shareLabel.textContent = ` · ${percent.format(share)}`;
      value.append(shareLabel);
      row.append(label, value);
      listFragment.append(row);
    });
    chart.replaceChildren(chartFragment);
    list.replaceChildren(listFragment);
    chart.setAttribute('aria-label', 'Biểu đồ thanh tỷ trọng các trạng thái dòng tiền ký quỹ, dữ liệu minh họa. Chi tiết giá trị nằm ở danh sách bên dưới biểu đồ.');
    setText(page, '[data-escrow-total]', money.format(total));
    setText(page, '[data-escrow-summary]', `Mô tả dữ liệu: trên tổng ${money.format(total)} dòng tiền 30 ngày, ${segments.map(item => `${item.label.toLowerCase()} ${money.format(item.value)} (${percent.format(item.value / total)})`).join('; ')}.`);
  };

  const syncSidebar = () => {
    const total = key => snapshot.queues.filter(item => item.key === key).reduce((sum, item) => sum + item.count, 0);
    const counts = {
      'tutor-review-queue.html': total('tutor'),
      'job-review-queue.html': total('job'),
      'reports.html': total('report'),
      'payout-requests.html': total('payout'),
    };
    Object.keys(counts).forEach(href => {
      const badge = page.querySelector(`.admin-sidebar__item[href="${href}"] .admin-sidebar__badge`);
      if (!badge) return;
      badge.textContent = count.format(counts[href]);
      badge.setAttribute('aria-label', `${count.format(counts[href])} mục chờ xử lý`);
    });
  };

  let snapshot = buildSnapshot();

  const render = () => {
    const asOf = new Date(snapshot.asOf);
    const escrowTotal = snapshot.escrowMix.reduce((sum, item) => sum + item.value, 0);
    renderMetrics(page.querySelector('[data-dashboard-metrics]'), snapshot.operations);
    renderMetrics(page.querySelector('[data-dashboard-finance]'), snapshot.finance);
    renderQueues(snapshot.queues, asOf);
    renderActivity(snapshot.activity, asOf);
    renderChecks(snapshot, asOf);
    renderServices(snapshot.services);
    renderGmvChart(snapshot.gmvTrend);
    renderEscrowChart(snapshot.escrowMix, escrowTotal);
    syncSidebar();
  };

  const load = () => {
    refresh.disabled = true;
    refresh.setAttribute('aria-busy', 'true');
    loading.hidden = false;
    content.hidden = true;
    content.setAttribute('aria-busy', 'true');
    updated.textContent = 'Đang cập nhật số liệu tổng quan…';
    window.setTimeout(() => {
      snapshot = buildSnapshot();
      render();
      loading.hidden = true;
      content.hidden = false;
      content.setAttribute('aria-busy', 'false');
      refresh.disabled = false;
      refresh.removeAttribute('aria-busy');
      const now = new Date();
      updated.textContent = `Cập nhật lúc ${timeFormat.format(now)} · ${dateFormat.format(now)} · dữ liệu minh họa`;
    }, 450);
  };

  refresh.addEventListener('click', load);
  window.addEventListener('pageshow', event => { if (event.persisted) load(); });
  load();
})();
