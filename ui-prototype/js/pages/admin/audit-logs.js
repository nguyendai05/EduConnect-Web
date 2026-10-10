/**
 * Trang 41 — Nhật ký hệ thống.
 * Dữ liệu mẫu + rendering, tự chứa trong một tệp, không gọi API.
 * QUY TẮC DỮ LIỆU: nhật ký không bao giờ chứa mật khẩu, token, API key, session id,
 * số CCCCD hoặc số điện thoại đầy đủ. Trường nhạy cảm chỉ được biểu diễn ở dạng đã che.
 */
(() => {
  const page = document.querySelector('[data-audit-logs]');
  if (!page) return;

  /* ===== Từ điển nhãn ===== */
  const results = {
    success: { label: 'Thành công', badge: 'badge--success' },
    review: { label: 'Cần rà soát', badge: 'badge--warning' },
    failed: { label: 'Thất bại', badge: 'badge--danger' },
  };
  const actorKinds = { admin: 'Quản trị viên', moderator: 'Điều phối viên', system: 'Tác vụ tự động' };
  const targetLabels = {
    'tutor-profile': 'Hồ sơ gia sư',
    'job-post': 'Tin tìm gia sư',
    contract: 'Hợp đồng',
    lesson: 'Buổi học & lớp nhóm',
    dispute: 'Báo cáo & tranh chấp',
    payout: 'Yêu cầu rút tiền',
    account: 'Tài khoản',
    report: 'Báo cáo đối soát',
  };
  const actionGroups = {
    tutor: 'Duyệt hồ sơ gia sư',
    job: 'Duyệt tin tìm gia sư',
    payout: 'Yêu cầu rút tiền & giải ngân',
    dispute: 'Báo cáo & tranh chấp',
    contract: 'Hợp đồng & hoàn tiền',
    automation: 'Tác vụ tự động của lớp học',
    account: 'Tài khoản & bảo mật',
    report: 'Xuất báo cáo đối soát',
  };
  const rangeLabels = { today: 'Hôm nay', '7d': '7 ngày gần đây', '30d': '30 ngày gần đây', custom: 'Ngày tùy chọn', all: 'Toàn bộ thời gian' };
  const ACTORS = {
    dai: { kind: 'admin', name: 'Nguyễn Xuân Đại', initials: 'NX', account: 'admin.nd', userId: 'usr_admin_01', roleCode: 'SYSTEM_ADMIN' },
    ngoc: { kind: 'admin', name: 'Trần Bảo Ngọc', initials: 'TB', account: 'admin.tb', userId: 'usr_admin_02', roleCode: 'SYSTEM_ADMIN' },
    ha: { kind: 'moderator', name: 'Lê Thu Hà', initials: 'LH', account: 'moderator.lt', userId: 'usr_mod_07', roleCode: 'OPERATION_MODERATOR' },
    system: { kind: 'system', name: 'Hệ thống', initials: 'HT', account: 'scheduler', userId: 'usr_system_scheduler', roleCode: 'SYSTEM_WORKER' },
  };
  const ACTIONS = {
    'approve-payout': { label: 'Duyệt yêu cầu rút tiền', code: 'APPROVE_PAYOUT_REQUEST', group: 'payout' },
    'reject-payout': { label: 'Từ chối yêu cầu rút tiền', code: 'REJECT_PAYOUT_REQUEST', group: 'payout' },
    'auto-payout': { label: 'Tự động giải ngân', code: 'AUTO_RELEASE_ESCROW', group: 'payout' },
    'verify-tutor': { label: 'Duyệt hồ sơ gia sư', code: 'VERIFY_TUTOR_PROFILE', group: 'tutor' },
    'review-job': { label: 'Duyệt tin tìm gia sư', code: 'APPROVE_JOB_POST', group: 'job' },
    'reject-job': { label: 'Từ chối tin tìm gia sư', code: 'REJECT_JOB_POST', group: 'job' },
    'resolve-dispute': { label: 'Xử lý báo cáo & tranh chấp', code: 'RESOLVE_DISPUTE_REPORT', group: 'dispute' },
    'refund-contract': { label: 'Hoàn tiền hợp đồng', code: 'REFUND_CONTRACT', group: 'contract' },
    'auto-attendance': { label: 'Tự động điểm danh', code: 'AUTO_MARK_ATTENDANCE', group: 'automation' },
    'auto-cancel-class': { label: 'Tự động hủy lớp do thiếu số lượng', code: 'AUTO_CANCEL_CLASS', group: 'automation' },
    'lock-account': { label: 'Khóa tài khoản vi phạm', code: 'LOCK_USER_ACCOUNT', group: 'account' },
    'reset-password': { label: 'Đặt lại thông tin đăng nhập', code: 'RESET_ACCOUNT_CREDENTIAL', group: 'account' },
    'revoke-session': { label: 'Thu hồi phiên đăng nhập', code: 'REVOKE_ADMIN_SESSION', group: 'account' },
    'enable-2fa': { label: 'Bật xác thực hai lớp', code: 'ENABLE_TOTP', group: 'account' },
    'change-role': { label: 'Cập nhật phân quyền tài khoản', code: 'UPDATE_USER_ROLE', group: 'account' },
    'export-report': { label: 'Xuất báo cáo đối soát', code: 'EXPORT_AUDIT_REPORT', group: 'report' },
  };

  /* ===== Dữ liệu mẫu (30 bản ghi) ===== */
  const logs = [
    { id: 'LOG-99418290', at: '2026-10-09T10:20:15+07:00', actor: 'dai', action: 'approve-payout', target: { type: 'payout', ref: 'PO-882914', label: 'Nguyễn Minh Anh', amount: 1000000, href: 'payout-request-detail.html?id=PO-882914' }, result: 'success', change: ['Chờ xử lý', 'Đã duyệt'], ip: '118.69.182.44', redacted: ['so_tai_khoan_ngan_hang'], extra: { account_masked: '****4412' } },
    { id: 'LOG-99418286', at: '2026-10-09T09:58:40+07:00', actor: 'system', action: 'auto-payout', target: { type: 'contract', ref: 'HĐ-2026-0917-024', label: 'Buổi 2 · Toán 12 Nâng cao', amount: 220000 }, result: 'success', change: ['Đang giữ (escrow)', 'Đã giải ngân'], ip: '' },
    { id: 'LOG-99418281', at: '2026-10-09T09:32:05+07:00', actor: 'ha', action: 'review-job', target: { type: 'job-post', ref: 'TT-8841', label: 'Gia sư Tiếng Anh lớp 10', href: 'job-review-detail.html?id=TT-8841' }, result: 'review', change: ['Chờ duyệt', 'Cần kiểm tra'], ip: '42.117.22.9', note: 'Phát hiện số điện thoại trong phần ghi chú riêng.' },
    { id: 'LOG-99418277', at: '2026-10-09T09:12:55+07:00', actor: 'dai', action: 'verify-tutor', target: { type: 'tutor-profile', ref: 'HS-30412', label: 'Vũ Thùy Linh' }, result: 'success', change: ['Chờ xác minh', 'Đã xác minh'], ip: '118.69.182.44', redacted: ['cccd', 'so_dien_thoai'] },
    { id: 'LOG-99418270', at: '2026-10-09T08:40:10+07:00', actor: 'ngoc', action: 'reset-password', target: { type: 'account', ref: 'TK-70119', label: 'Phạm Minh Quân' }, result: 'success', change: ['mật khẩu (đã ẩn)', 'mật khẩu (đã ẩn)'], ip: '113.161.87.25', redacted: ['mat_khau', 'duong_dan_kich_hoat'], extra: { credential: '(đã ẩn)' } },
    { id: 'LOG-99418264', at: '2026-10-08T22:15:03+07:00', actor: 'system', action: 'auto-cancel-class', target: { type: 'lesson', ref: 'LH-1002', label: 'Lớp Hóa 10 Nâng cao', amount: 1980000 }, result: 'failed', change: ['Đang tuyển', 'Đã hủy (hoàn 100%)'], ip: '' },
    { id: 'LOG-99418258', at: '2026-10-08T20:05:44+07:00', actor: 'dai', action: 'revoke-session', target: { type: 'account', ref: 'TK-70119', label: 'Phạm Minh Quân' }, result: 'success', change: ['phiên đăng nhập (đã ẩn)', 'Phiên đã thu hồi'], ip: '118.69.182.44', redacted: ['session_id', 'refresh_token'], extra: { session_reference: '(đã ẩn)' } },
    { id: 'LOG-99418251', at: '2026-10-08T17:41:26+07:00', actor: 'ha', action: 'resolve-dispute', target: { type: 'dispute', ref: 'BC-5521', label: 'Buổi 3 · HĐ-2026-0917-024' }, result: 'review', change: ['Đang thực hiện', 'Đang tranh chấp'], ip: '42.117.22.9' },
    { id: 'LOG-99418244', at: '2026-10-08T16:20:00+07:00', actor: 'dai', action: 'export-report', target: { type: 'report', ref: 'BC-Q102026', label: 'Báo cáo đối soát quý IV/2026' }, result: 'success', change: ['Chưa xuất', 'Đã xuất (CSV)'], ip: '118.69.182.44' },
    { id: 'LOG-99418238', at: '2026-10-08T14:02:19+07:00', actor: 'system', action: 'auto-attendance', target: { type: 'lesson', ref: 'BH-4410', label: 'Buổi 4 · Lớp nhóm Toán 11' }, result: 'success', change: ['Chưa diễn ra', 'Có mặt (6/6 học viên)'], ip: '' },
    { id: 'LOG-99418231', at: '2026-10-08T11:47:52+07:00', actor: 'dai', action: 'change-role', target: { type: 'account', ref: 'TK-70088', label: 'Đặng Thanh Tú' }, result: 'success', change: ['Điều phối viên', 'Quản trị viên'], ip: '118.69.182.44' },
    { id: 'LOG-99418225', at: '2026-10-08T10:15:31+07:00', actor: 'ha', action: 'reject-job', target: { type: 'job-post', ref: 'TT-8833', label: 'Tìm gia sư Toán lớp 10', href: 'job-review-detail.html?id=TT-8833' }, result: 'failed', change: ['Chờ duyệt', 'Bị từ chối'], ip: '42.117.22.9', note: 'Tin chứa thông tin liên hệ ngoài nền tảng.' },
    { id: 'LOG-99418219', at: '2026-10-07T21:33:08+07:00', actor: 'dai', action: 'lock-account', target: { type: 'account', ref: 'TK-70203', label: 'Trương Quốc Bảo' }, result: 'success', change: ['Hoạt động', 'Bị khóa'], ip: '118.69.182.44', redacted: ['cccd'] },
    { id: 'LOG-99418212', at: '2026-10-07T19:05:47+07:00', actor: 'system', action: 'auto-payout', target: { type: 'contract', ref: 'HĐ-2026-0915-118', label: 'Buổi 7 · Hóa 11 Chuyên', amount: 180000 }, result: 'failed', change: ['Đang giữ (escrow)', 'Lỗi cổng thanh toán'], ip: '' },
    { id: 'LOG-99418205', at: '2026-10-07T16:22:14+07:00', actor: 'ngoc', action: 'approve-payout', target: { type: 'payout', ref: 'PO-882877', label: 'Hoàng Thu Hà', amount: 3500000, href: 'payout-request-detail.html?id=PO-882877' }, result: 'success', change: ['Chờ xử lý', 'Đã duyệt'], ip: '113.161.87.25', redacted: ['so_tai_khoan_ngan_hang'], extra: { account_masked: '****8830' } },
    { id: 'LOG-99418198', at: '2026-10-07T13:40:02+07:00', actor: 'ha', action: 'verify-tutor', target: { type: 'tutor-profile', ref: 'HS-30398', label: 'Ngô Đình Lâm' }, result: 'review', change: ['Chờ xác minh', 'Cần bổ sung chứng chỉ'], ip: '42.117.22.9', redacted: ['cccd', 'so_dien_thoai'] },
    { id: 'LOG-99418190', at: '2026-10-07T09:18:26+07:00', actor: 'dai', action: 'review-job', target: { type: 'job-post', ref: 'TT-8840', label: 'Gia sư Hóa học 11 ôn thi ĐGNL', href: 'job-review-detail.html?id=TT-8840' }, result: 'success', change: ['Chờ duyệt', 'Đang tuyển'], ip: '118.69.182.44' },
    { id: 'LOG-99418183', at: '2026-10-06T20:55:11+07:00', actor: 'system', action: 'auto-cancel-class', target: { type: 'lesson', ref: 'LH-0987', label: 'Lớp Toán 12 Chuyên đề', amount: 2400000 }, result: 'failed', change: ['Đang tuyển', 'Đã hủy (hoàn 100%)'], ip: '' },
    { id: 'LOG-99418176', at: '2026-10-06T18:12:39+07:00', actor: 'dai', action: 'enable-2fa', target: { type: 'account', ref: 'TK-70119', label: 'Phạm Minh Quân' }, result: 'success', change: ['Xác thực hai lớp: tắt', 'Xác thực hai lớp: 2FA ****12'], ip: '118.69.182.44', redacted: ['khóa_bí_mật_totp', 'mật_khau'], extra: { totp_reference: '2FA ****12', password: '(đã ẩn)' } },
    { id: 'LOG-99418169', at: '2026-10-06T15:44:58+07:00', actor: 'ngoc', action: 'refund-contract', target: { type: 'contract', ref: 'HĐ-2026-0902-077', label: 'Lớp Tiếng Anh 6 · Trực tuyến', amount: 660000 }, result: 'success', change: ['Đã thanh toán', 'Đã hoàn tiền'], ip: '113.161.87.25' },
    { id: 'LOG-99418162', at: '2026-10-06T11:20:05+07:00', actor: 'ha', action: 'resolve-dispute', target: { type: 'dispute', ref: 'BC-5498', label: 'Buổi 5 · HĐ-2026-0905-131' }, result: 'failed', change: ['Đang tranh chấp', 'Bác báo cáo'], ip: '42.117.22.9' },
    { id: 'LOG-99418155', at: '2026-10-05T22:41:33+07:00', actor: 'system', action: 'auto-attendance', target: { type: 'lesson', ref: 'BH-4388', label: 'Buổi 2 · IELTS Speaking' }, result: 'review', change: ['Chưa diễn ra', 'Vắng mặt (0/4 học viên)'], ip: '' },
    { id: 'LOG-99418148', at: '2026-10-05T17:09:21+07:00', actor: 'dai', action: 'verify-tutor', target: { type: 'tutor-profile', ref: 'HS-30377', label: 'Bùi Đức Minh' }, result: 'success', change: ['Chờ xác minh', 'Đã xác minh'], ip: '118.69.182.44', redacted: ['cccd', 'so_dien_thoai'] },
    { id: 'LOG-99418141', at: '2026-10-05T10:26:47+07:00', actor: 'ngoc', action: 'reject-payout', target: { type: 'payout', ref: 'PO-882860', label: 'Đỗ Thị Lan', amount: 1200000, href: 'payout-request-detail.html?id=PO-882860' }, result: 'failed', change: ['Chờ xử lý', 'Bị từ chối'], ip: '113.161.87.25', redacted: ['so_tai_khoan_ngan_hang'], note: 'Số tài khoản thụ hưởng không khớp hồ sơ đã xác minh.', extra: { account_masked: '****2207' } },
    { id: 'LOG-99418134', at: '2026-10-04T19:52:08+07:00', actor: 'ha', action: 'review-job', target: { type: 'job-post', ref: 'TT-8836', label: 'Gia sư Toán lớp 8 củng cố kiến thức', href: 'job-review-detail.html?id=TT-8836' }, result: 'success', change: ['Chờ duyệt', 'Đang tuyển'], ip: '42.117.22.9' },
    { id: 'LOG-99418127', at: '2026-10-04T14:31:55+07:00', actor: 'system', action: 'auto-payout', target: { type: 'contract', ref: 'HĐ-2026-0911-206', label: 'Buổi 1 · Ngữ văn 12', amount: 250000 }, result: 'review', change: ['Đang giữ (escrow)', 'Chờ đối soát ngân hàng'], ip: '' },
    { id: 'LOG-99418120', at: '2026-10-03T16:18:42+07:00', actor: 'dai', action: 'export-report', target: { type: 'report', ref: 'BC-KYQUY-3', label: 'Báo cáo đối soát quý III/2026' }, result: 'success', change: ['Chưa xuất', 'Đã xuất (XLSX)'], ip: '118.69.182.44' },
    { id: 'LOG-99418113', at: '2026-10-02T09:44:17+07:00', actor: 'ngoc', action: 'change-role', target: { type: 'account', ref: 'TK-70052', label: 'Nguyễn Hữu Nam' }, result: 'failed', change: ['Điều phối viên', 'Không thay đổi (thiếu quyền)'], ip: '113.161.87.25' },
    { id: 'LOG-99418106', at: '2026-09-25T08:30:00+07:00', actor: 'dai', action: 'verify-tutor', target: { type: 'tutor-profile', ref: 'HS-30299', label: 'Đặng Thanh Tú' }, result: 'success', change: ['Chờ xác minh', 'Đã xác minh'], ip: '118.69.182.44', redacted: ['cccd', 'so_dien_thoai'] },
    { id: 'LOG-99418099', at: '2026-09-18T21:10:00+07:00', actor: 'system', action: 'auto-attendance', target: { type: 'lesson', ref: 'BH-4201', label: 'Buổi 9 · Vật lý 12' }, result: 'success', change: ['Chưa diễn ra', 'Có mặt (4/5 học viên)'], ip: '' },
  ];

  /* ===== Nền tảng: định dạng, ngày, chuẩn hóa ===== */
  // Mốc "hiện tại" của prototype để việc lọc theo ngày cho kết quả ổn định giữa các lần mở trang.
  const NOW = new Date('2026-10-09T12:00:00+07:00');
  const DAY = 86400000;
  const TZ_OFFSET = 7 * 60 * 60 * 1000; // Asia/Ho_Chi_Minh = UTC+7
  const money = new Intl.NumberFormat('vi-VN');
  const dateOnly = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
  const timeOnly = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  const stampFull = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
  const setText = (root, selector, value) => { root.querySelector(selector).textContent = value; };
  const setOrHide = (root, selector, value) => { const el = root.querySelector(selector); el.textContent = value; el.hidden = !value; };
  const dayIndex = ms => Math.floor((ms + TZ_OFFSET) / DAY);
  const calendarIndex = value => { const [y, m, d] = value.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / DAY); };
  const formatMoney = amount => `${money.format(amount)} ₫`;

  /* ===== Tham chiếu DOM ===== */
  const form = page.querySelector('[data-audit-filters]');
  const search = page.querySelector('[data-audit-search]');
  const tabs = page.querySelector('[data-audit-result-tabs]');
  const resultsRegion = page.querySelector('[data-audit-results]');
  const list = page.querySelector('[data-audit-list]');
  const table = page.querySelector('[data-audit-table]');
  const empty = page.querySelector('[data-audit-empty]');
  const loading = page.querySelector('[data-audit-loading]');
  const pagination = page.querySelector('[data-pagination]');
  const pageSize = page.querySelector('[data-audit-page-size]');
  const refresh = page.querySelector('[data-audit-refresh]');
  const chips = page.querySelector('[data-audit-chips]');
  const rangeFields = page.querySelector('[data-audit-range-fields]');
  const template = page.querySelector('#audit-row-template');
  const modal = document.querySelector('#audit-detail-modal');
  const copyButton = document.querySelector('[data-audit-copy]');
  const copyStatus = document.querySelector('[data-audit-copy-status]');
  const DEFAULTS = { query: '', actor: 'all', action: 'all', target: 'all', range: '30d', sort: 'newest', dateFrom: '2026-09-10', dateTo: '2026-10-09' };
  let result = 'all';
  let filtered = [];
  let isLoading = true;
  let activeRow = null;

  /* ===== Lọc ===== */
  const haystack = row => [
    row.id, ACTORS[row.actor].name, ACTORS[row.actor].account, actorKinds[ACTORS[row.actor].kind],
    ACTIONS[row.action].label, ACTIONS[row.action].code, targetLabels[row.target.type],
    row.target.label, row.target.ref, results[row.result].label, row.ip, row.change.join(' '),
  ].join(' ');

  const bounds = () => {
    const range = form.elements.range.value;
    if (range === 'all') return null;
    if (range === 'custom') {
      const from = form.elements.dateFrom.value;
      const to = form.elements.dateTo.value;
      if (!from || !to) return null;
      return [calendarIndex(from), calendarIndex(to)];
    }
    const today = dayIndex(NOW.getTime());
    if (range === 'today') return [today, today];
    const days = range === '7d' ? 7 : 30;
    return [today - days + 1, today];
  };

  const inRange = (row, limit) => {
    if (!limit) return true;
    const index = dayIndex(new Date(row.at).getTime());
    return index >= limit[0] && index <= limit[1];
  };

  const filterContext = () => ({
    query: normalize(search.value),
    actor: form.elements.actor.value,
    action: form.elements.action.value,
    target: form.elements.target.value,
    limit: bounds(),
  });

  const matchesExceptResult = (row, context) => (
    (!context.query || normalize(haystack(row)).includes(context.query))
    && (context.actor === 'all' || ACTORS[row.actor].kind === context.actor)
    && (context.action === 'all' || ACTIONS[row.action].group === context.action)
    && (context.target === 'all' || row.target.type === context.target)
    && inRange(row, context.limit)
  );

  /* ===== Chip bộ lọc đang áp dụng ===== */
  const activeChips = () => {
    const items = [];
    if (search.value.trim()) items.push(['query', `Từ khóa: “${search.value.trim()}”`]);
    if (form.elements.actor.value !== DEFAULTS.actor) items.push(['actor', `Người: ${form.elements.actor.selectedOptions[0].textContent}`]);
    if (form.elements.action.value !== DEFAULTS.action) items.push(['action', `Hành động: ${actionGroups[form.elements.action.value]}`]);
    if (form.elements.target.value !== DEFAULTS.target) items.push(['target', `Đối tượng: ${targetLabels[form.elements.target.value]}`]);
    if (form.elements.range.value !== DEFAULTS.range) items.push(['range', `Thời gian: ${rangeLabels[form.elements.range.value]}`]);
    if (form.elements.sort.value !== DEFAULTS.sort) items.push(['sort', `Sắp xếp: ${form.elements.sort.selectedOptions[0].textContent}`]);
    if (result !== 'all') items.push(['result', `Kết quả: ${results[result].label}`]);
    return items;
  };

  const renderChips = items => {
    const fragment = document.createDocumentFragment();
    if (!items.length) {
      const none = document.createElement('span');
      none.className = 'audit-logs__chips-empty';
      none.textContent = 'Chưa áp dụng bộ lọc nào.';
      fragment.append(none);
    }
    items.forEach(([key, label]) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'filter-chip';
      chip.dataset.chip = key;
      chip.setAttribute('aria-label', `Xóa bộ lọc: ${label}`);
      const text = document.createElement('span');
      text.textContent = label;
      const remove = document.createElement('span');
      remove.className = 'filter-chip__remove';
      remove.setAttribute('aria-hidden', 'true');
      remove.textContent = '×';
      chip.append(text, remove);
      fragment.append(chip);
    });
    chips.replaceChildren(fragment);
  };

  const resetChip = key => {
    if (key === 'query') { search.value = ''; return; }
    if (key === 'result') {
      result = 'all';
      const tab = tabs.querySelector('[data-audit-result="all"]');
      tabs.querySelectorAll('[role="tab"]').forEach(item => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      resultsRegion.setAttribute('aria-labelledby', tab.id);
      return;
    }
    form.elements[key].value = DEFAULTS[key];
  };

  /* ===== Hiển thị danh sách ===== */
  const renderRows = () => {
    if (isLoading) return;
    const current = Number(pagination.dataset.current);
    const size = Number(pageSize.value);
    const visible = filtered.slice((current - 1) * size, current * size);
    const fragment = document.createDocumentFragment();
    visible.forEach(row => {
      const tr = template.content.firstElementChild.cloneNode(true);
      const actor = ACTORS[row.actor];
      const action = ACTIONS[row.action];
      const date = new Date(row.at);
      tr.dataset.auditRow = row.id;

      const time = tr.querySelector('[data-audit-time]');
      time.dateTime = row.at;
      time.textContent = dateOnly.format(date);
      setText(tr, '[data-audit-clock]', timeOnly.format(date));

      const icon = tr.querySelector('[data-audit-actor-icon]');
      const avatar = tr.querySelector('[data-audit-avatar]');
      icon.hidden = actor.kind !== 'system';
      avatar.hidden = actor.kind === 'system';
      avatar.textContent = actor.initials;
      setText(tr, '[data-audit-actor]', actor.name);
      setText(tr, '[data-audit-actor-role]', actorKinds[actor.kind]);

      setText(tr, '[data-audit-action]', action.label);
      setText(tr, '[data-audit-action-code]', action.code);

      const target = tr.querySelector('[data-audit-target]');
      target.textContent = `${targetLabels[row.target.type]}: ${row.target.label}`;
      if (row.target.href) {
        target.href = row.target.href;
        target.setAttribute('aria-label', `Mở ${row.target.ref} trong trang quản trị tương ứng`);
      } else {
        target.removeAttribute('href');
      }
      setOrHide(tr, '[data-audit-target-ref]', row.target.ref);

      const badge = tr.querySelector('[data-audit-result]');
      badge.classList.add(results[row.result].badge);
      badge.textContent = results[row.result].label;
      setOrHide(tr, '[data-audit-change]', row.change ? `${row.change[0]} → ${row.change[1]}` : '');
      setText(tr, '[data-audit-ip]', row.ip || '—');

      tr.querySelector('[data-audit-detail]').addEventListener('click', () => openDetail(row));
      fragment.append(tr);
    });
    list.replaceChildren(fragment);
    table.hidden = filtered.length === 0;
    empty.hidden = filtered.length !== 0;
    // pagination.js ghi số nguyên thô vào slot này; trang định dạng lại theo chuẩn vi-VN.
    pagination.querySelector('[data-total-count]').textContent = money.format(filtered.length);
  };

  const applyFilters = () => {
    const sort = form.elements.sort.value;
    const context = filterContext();
    filtered = logs.filter(row => (result === 'all' || row.result === result) && matchesExceptResult(row, context));
    filtered.sort((left, right) => {
      const delta = new Date(right.at) - new Date(left.at);
      return sort === 'oldest' ? -delta : delta;
    });

    const scoped = logs.filter(row => matchesExceptResult(row, context));
    Object.keys(results).forEach(key => setText(page, `[data-result-count="${key}"]`, money.format(scoped.filter(row => row.result === key).length)));
    setText(page, '[data-result-count="all"]', money.format(scoped.length));

    const label = result === 'all' ? 'bản ghi' : `bản ghi ${results[result].label.toLowerCase()}`;
    setText(page, '[data-audit-result-summary]', `${money.format(filtered.length)} ${label} · ${rangeLabels[form.elements.range.value]} · sắp xếp ${form.elements.sort.selectedOptions[0].textContent.toLowerCase()}`);

    const items = activeChips();
    renderChips(items);
    page.querySelectorAll('[data-audit-reset]').forEach(button => { button.hidden = items.length === 0; });
    rangeFields.hidden = form.elements.range.value !== 'custom';

    pagination.dispatchEvent(new CustomEvent('pagination:update', { detail: { total: filtered.length, pageSize: Number(pageSize.value), current: 1 } }));
    renderRows();
  };

  /* ===== Hộp thoại chi tiết (chỉ đọc) ===== */
  const infoRow = (label, value) => {
    const row = document.createElement('dl');
    row.className = 'info-row info-row--compact';
    const term = document.createElement('dt');
    term.className = 'info-row__label';
    term.textContent = label;
    const detail = document.createElement('dd');
    detail.className = 'info-row__value';
    detail.textContent = value;
    row.append(term, detail);
    return row;
  };

  const diffCard = field => {
    const card = document.createElement('div');
    card.className = 'audit-logs__diff';
    const name = document.createElement('p');
    name.className = 'audit-logs__diff-field';
    name.textContent = field.name;
    if (field.label) {
      const note = document.createElement('small');
      note.textContent = ` (${field.label})`;
      name.append(note);
    }
    const values = document.createElement('div');
    values.className = 'audit-logs__diff-values';
    [['Trước thao tác', field.before, 'audit-logs__diff-cell'], ['Sau thao tác', field.after, 'audit-logs__diff-cell audit-logs__diff-cell--after']].forEach(([caption, value, className]) => {
      const cell = document.createElement('div');
      cell.className = className;
      const label = document.createElement('span');
      label.className = 'audit-logs__diff-label';
      label.textContent = caption;
      const strong = document.createElement('strong');
      strong.textContent = value;
      cell.append(label, strong);
      values.append(cell);
    });
    card.append(name, values);
    return card;
  };

  const diffFields = row => {
    const fields = [];
    if (row.change) fields.push({ name: 'trang_thai', label: 'Trạng thái đối tượng', before: row.change[0], after: row.change[1] });
    fields.push({ name: 'ket_qua', label: 'Kết quả thao tác', before: 'Chưa ghi nhận', after: results[row.result].label });
    if (row.target.amount) fields.push({ name: 'so_tien', label: 'Số tiền liên quan', before: formatMoney(row.target.amount), after: `${formatMoney(row.target.amount)} (không đổi)` });
    if (row.note) fields.push({ name: 'ghi_quan_try', label: 'Ghi chú kiểm soát', before: '—', after: row.note });
    return fields;
  };

  const payloadOf = row => {
    const actor = ACTORS[row.actor];
    const target = { type: row.target.type.toUpperCase().replace(/-/g, '_'), id: row.target.ref };
    if (row.target.amount) { target.amount = row.target.amount; target.currency = 'VND'; }
    Object.assign(target, row.extra || {});
    return {
      log_id: row.id,
      timestamp_utc: new Date(row.at).toISOString(),
      actor: { user_id: actor.userId, role: actor.roleCode, ip_address: row.ip || '(worker nội bộ)' },
      action: ACTIONS[row.action].code,
      target,
      result: row.result.toUpperCase(),
      redacted_fields: row.redacted && row.redacted.length ? row.redacted : ['(không có trường nhạy cảm)'],
      append_only: true,
    };
  };

  const openDetail = row => {
    activeRow = row;
    const actor = ACTORS[row.actor];
    const fields = diffFields(row);
    const event = document.querySelector('[data-audit-d-event]');
    event.replaceChildren(
      infoRow('Mã bản ghi', row.id),
      infoRow('Hành động', ACTIONS[row.action].label),
      infoRow('Thời gian tạo', `${stampFull.format(new Date(row.at))} GMT+7`),
      infoRow('Người thực hiện', actor.kind === 'system' ? 'Hệ thống (tác vụ tự động)' : `${actor.name} · ${actor.account}`),
      infoRow('Vai trò', actorKinds[actor.kind]),
      infoRow('Địa chỉ IP nguồn', row.ip || 'Worker nội bộ'),
      infoRow('Đối tượng', `${targetLabels[row.target.type]} · ${row.target.ref}`),
      infoRow('Mô tả đối tượng', row.target.label),
      infoRow('Kết quả', results[row.result].label),
    );
    const diffBox = document.querySelector('[data-audit-d-diff]');
    diffBox.replaceChildren(...fields.map(diffCard));
    setText(document, '[data-audit-d-fields]', `${fields.length} trường được ghi nhận`);
    const redacted = row.redacted && row.redacted.length
      ? `Các trường đã che trước khi ghi nhật ký: ${row.redacted.join(', ')}. Giá trị gốc không được lưu trong nhật ký.`
      : 'Bản ghi này không chứa trường nhạy cảm. Mật khẩu, token, session id, CCCCD và số điện thoại đầy đủ không bao giờ được ghi vào nhật ký.';
    setText(document, '[data-audit-d-redacted]', redacted);
    document.querySelector('[data-audit-d-payload]').textContent = JSON.stringify(payloadOf(row), null, 2);
    setText(document, '[data-audit-d-scope]', `Phạm vi: ${targetLabels[row.target.type]}`);
    copyStatus.textContent = '';
    window.EduModal.open('audit-detail-modal', {
      variant: 'info',
      title: `Chi tiết nhật ký ${row.id}`,
      message: 'Bản ghi đối soát chỉ đọc, không thể chỉnh sửa hay xóa khỏi giao diện quản trị.',
      cancelText: 'Đóng chi tiết',
    });
  };

  /* ===== Tải dữ liệu ===== */
  const loadLogs = () => {
    isLoading = true;
    resultsRegion.setAttribute('aria-busy', 'true');
    loading.hidden = false;
    table.hidden = true;
    empty.hidden = true;
    refresh.disabled = true;
    refresh.setAttribute('aria-busy', 'true');
    window.setTimeout(() => {
      isLoading = false;
      loading.hidden = true;
      resultsRegion.setAttribute('aria-busy', 'false');
      refresh.disabled = false;
      refresh.removeAttribute('aria-busy');
      setText(page, '[data-audit-updated]', `Đồng bộ lúc ${timeOnly.format(new Date())} · ${logs.length} bản ghi mẫu`);
      applyFilters();
    }, 450);
  };

  /* ===== Sự kiện ===== */
  form.addEventListener('submit', event => { event.preventDefault(); applyFilters(); });
  form.addEventListener('input', event => { if (event.target === search) applyFilters(); });
  form.addEventListener('change', event => { if (event.target instanceof HTMLSelectElement) applyFilters(); });
  form.addEventListener('change', event => { if (event.target.type === 'date') applyFilters(); });
  // SearchInput dùng chung chỉ xóa giá trị; trang tự đồng bộ lại danh sách.
  form.querySelector('[data-clear-search]').addEventListener('click', applyFilters);
  pageSize.addEventListener('change', applyFilters);
  pagination.addEventListener('pagination:change', renderRows);
  tabs.addEventListener('tabs:change', () => {
    const selected = tabs.querySelector('[aria-selected="true"]');
    result = selected.dataset.auditResult;
    resultsRegion.setAttribute('aria-labelledby', selected.id);
    applyFilters();
  });
  chips.addEventListener('click', event => {
    const chip = event.target.closest('[data-chip]');
    if (!chip) return;
    resetChip(chip.dataset.chip);
    if (chip.dataset.chip === 'query') search.dispatchEvent(new Event('input', { bubbles: true }));
    else applyFilters();
  });
  page.querySelectorAll('[data-audit-reset]').forEach(button => button.addEventListener('click', () => {
    search.value = DEFAULTS.query;
    Object.keys(DEFAULTS).forEach(key => { if (key !== 'query' && form.elements[key]) form.elements[key].value = DEFAULTS[key]; });
    result = 'all';
    const tab = tabs.querySelector('[data-audit-result="all"]');
    tabs.querySelectorAll('[role="tab"]').forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    resultsRegion.setAttribute('aria-labelledby', tab.id);
    search.dispatchEvent(new Event('input', { bubbles: true }));
  }));
  refresh.addEventListener('click', loadLogs);
  modal.addEventListener('close', () => { copyStatus.textContent = ''; activeRow = null; });
  copyButton.addEventListener('click', async () => {
    if (!activeRow) return;
    const reference = activeRow.id;
    try {
      await navigator.clipboard.writeText(reference);
      copyStatus.textContent = `Đã sao chép mã tham chiếu ${reference}.`;
    } catch {
      copyStatus.textContent = `Trình duyệt không cho phép sao chép. Hãy chọn thủ công mã ${reference} trong khối JSON.`;
    }
  });
  /* ===== Liên kết từ trang Tổng quan ===== */
  // ?module= nhận đúng giá trị của select "Loại hành động" (mặc định là all); giá trị lạ bị bỏ qua.
  const applyIncomingQuery = () => {
    const module = new URLSearchParams(window.location.search).get('module');
    if (!module) return;
    if (![...form.elements.action.options].some(option => option.value === module)) return;
    form.elements.action.value = module;
  };

  applyIncomingQuery();
  window.addEventListener('pageshow', event => { if (event.persisted) loadLogs(); });
  loadLogs();
})();
