/** Trang Tổng quan quản trị: dữ liệu mẫu + dựng giao diện. Không gọi API, không thêm thư viện biểu đồ. */
(() => {
  const page = document.querySelector('[data-dashboard]');
  if (!page) return;

  // Dữ liệu minh họa của bản mẫu; thay bằng dữ liệu server khi nối backend.
  /**
   * Số liệu tài chính lấy từ fixture dùng chung để mọi màn cùng reference khớp nhau.
   * Không hard-code: escrow tính từ ví học viên, giải ngân tính từ release event.
   */
  const storeFinance = () => {
    const Store = window.EduStore;
    if (!Store) return { escrowHeld: 0, escrowByContract: 0, tutorNetReleased: 0, grossReleased: 0, platformFeeReleased: 0, awaiting: 0, disputed: 0, walletCount: 0 };
    const wallets = Store.list('wallets');
    /* Hai đường tính độc lập cho cùng một khái niệm ký quỹ: cộng theo ví học viên
       và cộng theo từng hợp đồng. Lệch nhau là defect dữ liệu, không phải lỗi hiển thị. */
    const escrowHeld = wallets.filter(item => item.ownerType === 'learner')
      .reduce((sum, item) => sum + Store.escrowHeldOf(item.ownerId), 0);
    const escrowByContract = Store.list('contracts').reduce((sum, item) => sum + Store.escrowOf(item.id), 0);
    const revenue = Store.revenueSummary();
    const awaiting = Store.list('payments').filter(item => item.status === 'pending').reduce((sum, item) => sum + Store.toInteger(item.payosDue), 0);
    const disputed = Store.list('orders').filter(item => item.refund && item.refund.state === 'pending').reduce((sum, item) => sum + Store.toInteger(item.refund.amount), 0);
    return { escrowHeld, escrowByContract, tutorNetReleased: revenue.tutorNetReleased, grossReleased: revenue.grossReleased, platformFeeReleased: revenue.platformFeeReleased, awaiting, disputed, walletCount: wallets.length };
  };

  /**
   * Số liệu vận hành của luồng kiểm duyệt TIN lấy thẳng từ EduStore.
   * Trước hàm này hai thẻ "Tin tìm gia sư chờ duyệt" và "Tin chờ duyệt quá SLA" ghi chữ ký tay
   * (count: 5, "Tin TT-8839 gửi lúc 09:05") nên sau khi admin duyệt thật trên trang hàng đợi,
   * dashboard vẫn báo còn tin chờ — hai màn cùng một con số nhưng lệch nhau.
   */
  const jobOps = () => {
    const Store = window.EduStore;
    if (!Store || typeof Store.jobQueue !== 'function') {
      return { pending: 0, flagged: 0, overdueCount: 0, oldest: null, oldestWaitHours: 0 };
    }
    const pending = Store.jobQueue('pending');
    const oldest = pending.length ? pending[0] : null;
    const waitHours = oldest
      ? Math.max(0, Math.floor((Date.now() - new Date(oldest.submittedAt || oldest.publishedAt).getTime()) / 3600000))
      : 0;
    return {
      pending: pending.length,
      flagged: pending.filter(item => Boolean(item.signal)).length,
      overdueCount: pending.filter(item => {
        const at = new Date(item.submittedAt || item.publishedAt).getTime();
        return Number.isFinite(at) && Date.now() - at >= 4 * 3600000;
      }).length,
      oldest,
      oldestWaitHours: waitHours
    };
  };

  /** Số đếm vận hành lấy từ fixture dùng chung, không hard-code số toàn hệ thống. */
  const storeCounts = () => {
    const Store = window.EduStore;
    if (!Store) return { users: 0, tutorsApproved: 0, openPosts: 0, reportsOpen: 0 };
    const reports = Store.list('reports');
    return {
      users: Store.userList().length,
      tutorsApproved: Store.FIXTURES.tutors.filter(item => item.profileStatus === 'approved').length,
      openPosts: Store.list('jobs').filter(item => item.status === 'approved' && item.availability === 'open').length
        + Store.list('offerings').filter(Store.isPubliclyListable).length,
      reportsOpen: reports.filter(item => !Store.REPORT_STATE[item.state].terminal).length
    };
  };

  const buildSnapshot = () => {
    const ops = jobOps();
    const admin = window.EduAdminSummary.summary();
    const queues = [
      { key: 'tutor', title: 'Hồ sơ gia sư chờ xác minh', icon: 'tutor-verification.svg', count: admin.tutors, countUnit: 'hồ sơ', badge: { label: 'Chờ duyệt', tone: 'warning' }, meta: 'Các hồ sơ đang chờ quyết định trong hàng đợi xác minh.', reason: 'Kiểm tra thông tin và tài liệu trước khi duyệt.', urgent: admin.tutors > 0, href: window.EduRoute.path("/admin/tutor-review-queue?status=pending"), linkLabel: 'Xem hàng đợi' },
      { key: 'job', title: 'Tin tìm gia sư chờ duyệt', icon: 'tutor-search.svg', count: ops.pending, countUnit: 'tin', badge: { label: `${ops.flagged} tin có tín hiệu liên hệ ngoài`, tone: 'warning' }, meta: 'Đếm từ jobQueue("pending") của EduStore — cùng tập mà hàng đợi duyệt tin đang trưng bày; tín hiệu gắn cờ lấy từ field signal của từng tin.', reason: 'Ưu tiên rà soát thủ công trước khi công khai tin.', urgent: ops.pending > 0, href: window.EduRoute.path("/admin/job-review-queue?status=pending"), linkLabel: 'Xem hàng đợi' },
      { key: 'report', title: 'Báo cáo & tranh chấp đang mở', icon: 'dispute.svg', count: storeCounts().reportsOpen, countUnit: 'vụ việc', amount: storeFinance().disputed, badge: { label: 'Cần xử lý', tone: 'danger' }, meta: 'Đếm từ report có state chưa terminal trong fixture dùng chung; cùng tập với trang Reports và với report người dùng vừa gửi.', reason: 'Có {amount} đang chờ hoàn tiền theo đơn đã yêu cầu hủy.', urgent: true, href: window.EduRoute.path("/admin/reports?status=unresolved"), linkLabel: 'Xem báo cáo' },
      { key: 'payout', title: 'Yêu cầu rút tiền chờ xử lý', icon: 'wallet.svg', count: admin.payouts, countUnit: 'yêu cầu', amount: admin.payoutAmount, badge: { label: 'Chờ phê duyệt', tone: 'warning' }, meta: `Tổng {amount} từ ${admin.payouts} yêu cầu đang chờ xử lý.`, reason: 'Đối chiếu yêu cầu trong hàng đợi rút tiền.', urgent: admin.payouts > 0, href: window.EduRoute.path("/admin/payout-requests?status=pending"), linkLabel: 'Xem yêu cầu' },
      { key: 'sla', title: 'Tin chờ duyệt quá SLA', icon: 'clock.svg', count: ops.overdueCount, countUnit: 'tin', badge: { label: ops.oldest ? `Chờ ${ops.oldestWaitHours} giờ` : 'Không có tin chờ', tone: 'info' }, meta: ops.oldest ? `Tin ${ops.oldest.id} gửi lúc ${new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(ops.oldest.submittedAt))}, hiện chưa có kiểm duyệt viên phụ trách.` : 'Hàng đợi kiểm duyệt đang trống — mọi tin đã được duyệt hoặc từ chối trong dữ liệu mẫu.', reason: 'Sắp xếp: ưu tiên tin chờ lâu nhất.', urgent: false, href: window.EduRoute.path("/admin/job-review-queue?status=pending&sort=oldest"), linkLabel: 'Xem hàng đợi' },
    ];
    const queueCount = key => queues.filter(item => item.key === key).reduce((total, item) => total + item.count, 0);

    return {
      asOf: new Date().toISOString(),
      operations: [
        { key: 'users', label: 'Người dùng trong dữ liệu mẫu', icon: 'profile.svg', kind: 'count', value: storeCounts().users, unit: 'persona demo', note: 'Đếm từ persona trong fixture dùng chung, không phải số người dùng toàn hệ thống.', badge: { label: 'Dữ liệu demo', tone: 'success' }, href: window.EduRoute.path("/admin/manage?tab=users"), linkLabel: 'Xem người dùng' },
        { key: 'tutors', label: 'Hồ sơ gia sư đã duyệt', icon: 'verified.svg', kind: 'count', value: admin.verifiedTutors, unit: 'hồ sơ', note: 'Cùng dữ liệu với hàng đợi xác minh và các quyết định đã lưu trong phiên xem trước.', badge: { label: 'Dữ liệu demo', tone: 'verified' }, href: window.EduRoute.path("/admin/tutor-review-queue?status=verified"), linkLabel: 'Xem hồ sơ gia sư' },
        { key: 'pending-tutor', label: 'Hồ sơ chờ duyệt', icon: 'certificate.svg', kind: 'count', value: queueCount('tutor'), unit: 'hồ sơ', tone: 'warning', note: 'Chờ xác minh chứng chỉ giảng dạy và giấy tờ tùy thân.', badge: { label: 'Cần xử lý hôm nay', tone: 'warning' }, href: window.EduRoute.path("/admin/tutor-review-queue?status=pending"), linkLabel: 'Xem hàng đợi' },
        { key: 'pending-job', label: 'Tin tìm gia sư chờ duyệt', icon: 'tutor-search.svg', kind: 'count', value: queueCount('job'), unit: 'tin đăng', tone: 'warning', note: `${ops.flagged} tin có tín hiệu chứa thông tin liên hệ ngoài nền tảng.`, badge: { label: `${ops.flagged} tin cần kiểm tra`, tone: 'warning' }, href: window.EduRoute.path("/admin/job-review-queue?status=pending"), linkLabel: 'Xem hàng đợi' },
        { key: 'open-posts', label: 'Tin đăng & lớp đang mở', icon: 'calendar.svg', kind: 'count', value: storeCounts().openPosts, unit: 'niêm yết', note: 'Tin tìm gia sư approved+open cộng với offering/lớp nhóm public+open trong fixture dùng chung.', badge: { label: 'Dữ liệu demo', tone: 'success' }, href: window.EduRoute.path("/admin/manage?tab=offerings"), linkLabel: 'Xem dịch vụ và lớp' },
        { key: 'contracts', label: 'Hợp đồng đang hoạt động', icon: 'receipt.svg', kind: 'count', value: 317, unit: 'hợp đồng', note: 'Hợp đồng đã cọc và đang trong giai đoạn diễn ra buổi học.', badge: { label: 'Theo dõi tiến độ', tone: 'info' }, href: window.EduRoute.path("/admin/audit-logs?module=contract"), linkLabel: 'Xem nhật ký hợp đồng' },
        { key: 'reports', label: 'Báo cáo đang mở', icon: 'shield-alert.svg', kind: 'count', value: queueCount('report'), unit: 'vụ việc', tone: 'danger', note: 'Báo cáo vi phạm nội dung hoặc tranh chấp buổi học, hợp đồng.', badge: { label: 'Cần xử lý', tone: 'danger' }, href: window.EduRoute.path("/admin/reports?status=unresolved"), linkLabel: 'Xem báo cáo' },
        { key: 'payouts', label: 'Yêu cầu rút tiền chờ xử lý', icon: 'wallet.svg', kind: 'count', value: queueCount('payout'), unit: 'yêu cầu', tone: 'warning', amount: admin.payoutAmount, note: 'Tổng {amount} đang chờ quản trị phê duyệt.', badge: { label: 'Chờ phê duyệt', tone: 'warning' }, href: window.EduRoute.path("/admin/payout-requests?status=pending"), linkLabel: 'Xem yêu cầu' },
      ],
      finance: [
        { key: 'gmv', label: 'Tổng giá trị đã giải ngân (demo)', icon: 'payment-copy.svg', kind: 'money', value: window.EduStore ? window.EduStore.revenueSummary().grossReleased : 0, unit: 'grossReleased từ fixture', tone: 'success', note: 'Tính từ release event trong fixture dùng chung. Held/planned/withdrawal không được cộng vào.', badge: { label: 'Dữ liệu demo', tone: 'success' }, href: window.EduRoute.path("/admin/audit-logs?module=payout"), linkLabel: 'Xem nhật ký thanh toán' },
        { key: 'fee', label: 'Phí nền tảng đã giải ngân (demo)', icon: 'receipt.svg', kind: 'money', value: window.EduStore ? window.EduStore.revenueSummary().platformFeeReleased : 0, unit: 'platformFeeReleased', note: `Tính từ release event với feeRateSnapshot; DEMO_FEE_RATE = ${window.EduStore ? Math.round(window.EduStore.DEMO_FEE_RATE * 100) : 10}% là giả định demo chưa được nhóm chốt.`, badge: { label: 'Giả định demo', tone: 'info' }, href: window.EduRoute.path("/admin/payout-requests?status=completed"), linkLabel: 'Xem khoản đã đối soát' },
        { key: 'escrow', label: 'Ký quỹ đang giữ (demo)', icon: 'lock.svg', kind: 'money', value: storeFinance().escrowHeld, unit: 'suy từ payment − release − refund', note: 'Tổng ký quỹ đang giữ của các hợp đồng trong fixture dùng chung; phần chưa xác nhận đủ buổi học thì chưa giải ngân.', badge: { label: 'Từ fixture chung', tone: 'escrow' }, href: window.EduRoute.path("/admin/reports?status=open"), linkLabel: 'Xem tiền đang giữ' },
        { key: 'released', label: 'Đã giải ngân cho gia sư (demo)', icon: 'check-double.svg', kind: 'money', value: storeFinance().tutorNetReleased, unit: 'tutorNetReleased', tone: 'success', note: 'Tổng tutorNetReleased từ release event; không cộng held/planned và không tính lại withdrawal.', badge: { label: 'Từ fixture chung', tone: 'success' }, href: window.EduRoute.path("/admin/payout-requests?status=completed"), linkLabel: 'Xem yêu cầu rút tiền' },
      ],
      queues,
      activity: [
        { actor: 'Hệ thống', tone: 'neutral', initials: 'HT', title: 'Tự động giải ngân buổi học đã xác nhận', target: 'Buổi 3 — HĐ-20261008-019 · {amount}', amount: 200000, result: 'Tiền chuyển vào số dư khả dụng của gia sư, không cần thao tác thủ công.', at: '2026-10-10T02:05:00+07:00', href: window.EduRoute.path("/admin/payout-requests?status=completed"), linkLabel: 'Xem bản ghi liên quan' },
        { actor: 'Quản trị viên', tone: 'info', initials: 'QT', title: 'Duyệt hồ sơ gia sư', target: 'Lê Quỳnh Chi · Toán cấp hai, Hà Nội', result: 'Hồ sơ chuyển sang Đã xác minh và được gắn huy hiệu bảo chứng.', at: '2026-10-10T01:20:00+07:00', href: window.EduRoute.path("/admin/tutor-review-queue?status=verified"), linkLabel: 'Xem hồ sơ gia sư' },
        { actor: 'Phụ huynh', tone: 'danger', initials: 'PH', title: 'Gửi báo cáo tranh chấp buổi học', target: 'Buổi 3 — HĐ-20260919-024 · Ngữ văn 12', result: '{amount} đang bị khóa trong ký quỹ chờ quản trị kết luận.', amount: 220000, at: '2026-10-09T20:42:00+07:00', href: window.EduRoute.path("/admin/reports?status=open"), linkLabel: 'Xem báo cáo' },
        { actor: 'Gia sư', tone: 'warning', initials: 'GS', title: 'Gửi yêu cầu rút tiền', target: 'Trần Minh Khoa · {amount} về tài khoản ngân hàng đã liên kết', amount: 2500000, result: 'Đáp ứng điều kiện thời gian giữ tiền, chờ quản trị phê duyệt.', at: '2026-10-09T18:15:00+07:00', href: window.EduRoute.path("/admin/payout-requests?status=pending"), linkLabel: 'Xem yêu cầu rút tiền' },
        { actor: 'Hệ thống', tone: 'neutral', initials: 'HT', title: 'Gắn cờ tin tìm gia sư cần rà soát', target: jobOps().flagged ? (() => { const flagged = window.EduStore.jobQueue('pending').filter(item => Boolean(item.signal)); return flagged.length ? `${flagged[0].id} · ${flagged[0].title}` : 'Không còn tin chờ duyệt có tín hiệu'; })() : 'Không còn tin chờ duyệt có tín hiệu', result: 'Phát hiện số điện thoại trong ghi chú riêng ở bản ghi kiểm duyệt; tin vẫn nằm trong hàng đợi cho tới khi quản trị quyết định.', at: '2026-10-09T15:30:00+07:00', href: window.EduRoute.path("/admin/job-review-queue?status=pending"), linkLabel: 'Xem hàng đợi tin' },
        { actor: 'Hệ thống', tone: 'neutral', initials: 'HT', title: 'Hủy lớp nhóm thiếu số lượng tối thiểu', target: 'Lớp Hóa 10 Nâng cao · LH-1002', result: 'Hoàn 100% {amount} ký quỹ cho 2 học viên vào ví khả dụng.', amount: 800000, at: '2026-10-09T09:05:00+07:00', href: window.EduRoute.path("/admin/audit-logs?module=automation"), linkLabel: 'Xem nhật ký lớp học' },
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
        { key: 'released', label: 'Đã giải ngân (tutorNetReleased)', value: storeFinance().tutorNetReleased },
        { key: 'held', label: 'Đang ký quỹ (escrowHeld)', value: storeFinance().escrowHeld },
        { key: 'awaiting', label: 'Phiên thanh toán đang chờ', value: storeFinance().awaiting },
        { key: 'disputed', label: 'Đang chờ hoàn tiền', value: storeFinance().disputed },
      ],
      integrity: (() => {
        const Store = window.EduStore;
        const finance = storeFinance();
        const wallets = Store ? Store.list('wallets') : [];
        const negative = wallets.filter(item => Store.toInteger(item.availableToUse) < 0 || Store.escrowHeldOf(item.ownerId) < 0).length;
        const releases = Store ? Store.releasesOf() : [];
        const unbalanced = releases.filter(item => Store.toInteger(item.grossReleased) !== Store.toInteger(item.tutorNetReleased) + Store.toInteger(item.platformFeeReleased)).length;
        const escrowDelta = Math.abs(finance.escrowHeld - finance.escrowByContract);
        return [
          { title: '1. Không có số dư âm', status: { label: negative === 0 ? 'Đạt (tính từ fixture)' : `${negative} ví bất thường`, tone: negative === 0 ? 'success' : 'danger' }, description: 'Đếm trực tiếp từ ví trong fixture dùng chung, không phải con số cố định.', value: `${negative} ví bất thường trong ${wallets.length} ví của fixture` },
          { title: '2. Ký quỹ khớp giữa hai đường tính', status: { label: escrowDelta === 0 ? 'Đạt (đối soát fixture)' : `Lệch ${escrowDelta.toLocaleString('vi-VN')} ₫`, tone: escrowDelta === 0 ? 'success' : 'danger' }, description: 'Cộng escrow theo từng ví học viên và theo từng hợp đồng phải ra cùng một số. escrow dẫn từ payment − release − refund. Đây là đối soát trong dữ liệu demo, CHƯA phải đối soát ledger phía server.', value: `Escrow theo ví: ${finance.escrowHeld.toLocaleString('vi-VN')} ₫ · theo hợp đồng: ${finance.escrowByContract.toLocaleString('vi-VN')} ₫` },
          { title: '3. gross = net + fee', status: { label: unbalanced === 0 ? 'Đạt (tính từ fixture)' : `${unbalanced} release lệch`, tone: unbalanced === 0 ? 'success' : 'danger' }, description: 'Kiểm bất biến grossReleased = tutorNetReleased + platformFeeReleased trên từng release event.', value: `${releases.length} release event, ${unbalanced} lệch bất biến` },
        ];
      })(),
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
    score.className = 'badge badge--neutral';
    // Các mục "kiểm tra" dưới đây là GIẢ ĐỊNH của dữ liệu mẫu, chưa có kiểm tra đối soát thật ở backend.
    score.textContent = `${passed} / ${snapshot.integrity.length} giả định demo (chưa có kiểm tra thật)`;
    setText(page, '[data-dashboard-integrity-time]', `Hiển thị từ fixture mẫu lúc ${timeFormat.format(now)} · ${dateFormat.format(now)} — không phải kết quả đối soát`);
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

  // Biểu đồ dùng module chung js/core/charts.js — cùng implementation với tutor/manage, không tự tính riêng.
  const renderRevenueChart = () => {
    const chart = page.querySelector('[data-gmv-chart]');
    if (!chart || !window.EduChart || !window.EduStore) return;
    const Store = window.EduStore;
    const Chart = window.EduChart;

    const draw = (from, to) => {
      const series = Store.revenueSeries({ metric: 'platformFeeReleased', from, to });
      Chart.bar(chart, {
        title: 'Phí nền tảng đã giải ngân (demo)',
        metricLabel: 'platformFeeReleased',
        unit: series.unit,
        from,
        to,
        rows: series.rows,
        total: series.total,
        invalidReason: series.invalid ? series.reason : null,
        emptyLabel: 'Không có release event trong khoảng ngày này.',
        description: 'Tính từ release event trong fixture dùng chung; held/planned/withdrawal không được tính vào doanh thu.'
      });
      setText(page, '[data-gmv-summary]', series.invalid
        ? 'Khoảng ngày không hợp lệ: ngày bắt đầu phải trước hoặc bằng ngày kết thúc.'
        : `Mô tả dữ liệu: ${series.rows.length ? series.rows.map(row => `${row.label} ${Store.formatMoney(row.value)}`).join('; ') : 'không có dữ liệu'}.`);
    };

    if (!chart.dataset.rangeBuilt) {
      chart.dataset.rangeBuilt = 'true';
      const range = document.createElement('div');
      range.className = 'dashboard__chart-range';
      range.innerHTML = '<label for="dashboard-range-from">Từ ngày</label>' +
        '<input id="dashboard-range-from" type="date" data-range-from value="2026-07-01">' +
        '<label for="dashboard-range-to">Đến ngày</label>' +
        '<input id="dashboard-range-to" type="date" data-range-to value="2026-10-31">';
      chart.parentNode.insertBefore(range, chart);
      range.addEventListener('change', () => {
        draw(range.querySelector('[data-range-from]').value, range.querySelector('[data-range-to]').value);
      });
      draw('2026-07-01', '2026-10-31');
    }
  };

  // Pie thật (SVG) cho trạng thái đơn đăng ký — không dùng thanh tỷ trọng thay cho pie.
  const renderOrderStatusPie = () => {
    if (!window.EduChart || !window.EduStore) return;
    const anchor = page.querySelector('[data-gmv-chart]');
    if (!anchor) return;
    let host = page.querySelector('[data-order-status-pie]');
    if (!host) {
      const section = document.createElement('section');
      section.className = 'dashboard__pie-panel';
      const heading = document.createElement('h2');
      heading.textContent = 'Cơ cấu trạng thái đơn đăng ký (demo)';
      host = document.createElement('div');
      host.setAttribute('data-order-status-pie', '');
      section.append(heading, host);
      const block = anchor.closest('section') || anchor;
      block.parentNode.insertBefore(section, block.nextSibling);
    }
    window.EduChart.pie(host, {
      title: null,
      slices: window.EduStore.orderStatusDistribution(),
      emptyLabel: 'Chưa có đơn đăng ký trong dữ liệu mẫu.'
    });
  };

  const renderEscrowChart = (segments, total) => {
    const chart = page.querySelector('[data-escrow-chart]');
    const list = page.querySelector('[data-escrow-list]');
    const chartFragment = document.createDocumentFragment();
    const listFragment = document.createDocumentFragment();
    segments.forEach(item => {
      // total = 0 thì share phải là 0, không được ra NaN.
      const share = total > 0 ? item.value / total : 0;
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
      [window.EduRoute.path("/admin/tutor-review-queue")]: total('tutor'),
      [window.EduRoute.path("/admin/job-review-queue")]: total('job'),
      [window.EduRoute.path("/admin/reports")]: total('report'),
      [window.EduRoute.path("/admin/payout-requests")]: total('payout'),
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
    renderRevenueChart();
    renderEscrowChart(snapshot.escrowMix, escrowTotal);
    renderOrderStatusPie();
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
