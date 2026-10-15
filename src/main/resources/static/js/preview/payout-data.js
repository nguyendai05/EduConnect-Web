/**
 * Dữ liệu minh họa chung cho trang "Danh sách yêu cầu rút tiền" (37) và "Xử lý yêu cầu rút tiền" (38).
 * Prototype thuần giao diện: không gọi API, không kết nối ngân hàng/PayOS, không có tài khoản thật.
 * Kết quả xử lý (duyệt / đang xử lý / đã chuyển tiền / từ chối) lưu trong sessionStorage.
 */
(() => {
  const storageKey = 'educonnect:payout-decisions:v1';
  const minimumAmount = 100000;
  const monthlyLimit = 20000000;
  const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
  const formatMoney = value => currency.format(Number(value) || 0);

  const statuses = Object.freeze({
    pending: { key: 'pending', label: 'Chờ xử lý', short: 'chờ xử lý', badge: 'badge--warning', terminal: false, actions: ['process', 'reject'] },
    processing: { key: 'processing', label: 'Đang xử lý', short: 'đang xử lý', badge: 'badge--info', terminal: false, actions: ['complete', 'reject'] },
    completed: { key: 'completed', label: 'Đã chuyển tiền', short: 'đã chuyển tiền', badge: 'badge--success', terminal: true, actions: [] },
    rejected: { key: 'rejected', label: 'Từ chối', short: 'bị từ chối', badge: 'badge--danger', terminal: true, actions: [] },
  });

  // Toàn bộ thông tin định danh/tài khoản dưới đây là giá trị giả lập đã che.
  const fixtures = [
    { id: 'PO-2026-0841', tutor: 'Nguyễn Minh Anh', initials: 'MA', tutorCode: 'GS-2026-089', subject: 'Toán học · THPT', teaching: 'Đang hoạt động giảng dạy', profileComplete: true, verified: true, email: 'nguyen.minh.anh@example.com', phone: '09** *** 456', finishedClasses: '24 lớp học (100% đánh giá 5★)', bank: 'Vietcombank', bankFullName: 'Ngân hàng TMCP Ngoại thương Việt Nam', bankCode: 'VCB', accountNumber: '007***841', accountHolder: 'NGUYỄN MINH ANH', accountVerified: true, nameMatches: true, amount: 1000000, amountWords: 'Một triệu đồng chẵn', availableBalance: 584000, escrowBalance: 0, usedThisMonth: 0, createdVia: 'Ứng dụng di động v2.4 (giả lập)', createdAt: '2026-10-09T10:15:32+07:00', status: 'pending', handledBy: null, duplicate: false },
    { id: 'PO-2026-0840', tutor: 'Trần Bảo Ngọc', initials: 'TN', tutorCode: 'GS-2026-114', subject: 'Tiếng Anh · IELTS', teaching: 'Đang hoạt động giảng dạy', profileComplete: true, verified: true, email: 'tran.bao.ngoc@example.com', phone: '09** *** 118', finishedClasses: '17 lớp học (96% đánh giá 5★)', bank: 'Techcombank', bankFullName: 'Ngân hàng TMCP Kỹ thương Việt Nam', bankCode: 'TCB', accountNumber: '190***226', accountHolder: 'TRẦN BẢO NGỌC', accountVerified: false, nameMatches: true, amount: 2400000, amountWords: 'Hai triệu bốn trăm nghìn đồng chẵn', availableBalance: 1240000, escrowBalance: 350000, usedThisMonth: 2400000, createdVia: 'Nền tảng web (giả lập)', createdAt: '2026-10-09T09:42:10+07:00', status: 'pending', handledBy: null, duplicate: false },
    { id: 'PO-2026-0839', tutor: 'Lê Hoàng Nam', initials: 'LN', tutorCode: 'GS-2026-072', subject: 'Vật lý · Lớp 12', teaching: 'Đang hoạt động giảng dạy', profileComplete: true, verified: true, email: 'le.hoang.nam@example.com', phone: '09** *** 731', finishedClasses: '41 lớp học (98% đánh giá 5★)', bank: 'BIDV', bankFullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', bankCode: 'BIDV', accountNumber: '511***407', accountHolder: 'LÊ HOÀNG NAM', accountVerified: true, nameMatches: true, amount: 15000000, amountWords: 'Mười lăm triệu đồng chẵn', availableBalance: 15000000, escrowBalance: 0, usedThisMonth: 12750000, createdVia: 'Nền tảng web (giả lập)', createdAt: '2026-10-09T08:20:00+07:00', status: 'pending', handledBy: null, duplicate: false },
    { id: 'PO-2026-0838', tutor: 'Phạm Thị Hương', initials: 'PH', tutorCode: 'GS-2026-058', subject: 'Ngữ văn · Lớp 10', teaching: 'Tạm nghỉ 1 lớp trong kỳ', profileComplete: true, verified: true, email: 'pham.thi.huong@example.com', phone: '09** *** 502', finishedClasses: '9 lớp học (100% đánh giá 5★)', bank: 'MB Bank', bankFullName: 'Ngân hàng TMCP Quân đội', bankCode: 'MB', accountNumber: '098***312', accountHolder: 'PHẠM THỊ HƯƠNG', accountVerified: true, nameMatches: true, amount: 90000, amountWords: 'Chín mươi nghìn đồng chẵn', availableBalance: 90000, escrowBalance: 0, usedThisMonth: 0, createdVia: 'Ứng dụng di động v2.4 (giả lập)', createdAt: '2026-10-08T21:05:00+07:00', status: 'pending', handledBy: null, duplicate: false },
    { id: 'PO-2026-0832', tutor: 'Đỗ Thị Lan', initials: 'DL', tutorCode: 'GS-2026-125', subject: 'Vật lý · Lớp 8', teaching: 'Đang hoạt động giảng dạy', profileComplete: false, verified: true, email: 'do.thi.lan@example.com', phone: '09** *** 640', finishedClasses: '6 lớp học (92% đánh giá 5★)', bank: 'Sacombank', bankFullName: 'Ngân hàng TMCP Sài Gòn Thương Tín', bankCode: 'STB', accountNumber: '044***690', accountHolder: 'ĐỖ THỊ HƯƠNG', accountVerified: true, nameMatches: false, amount: 1200000, amountWords: 'Một triệu hai trăm nghìn đồng chẵn', availableBalance: 1200000, escrowBalance: 0, usedThisMonth: 0, createdVia: 'Nền tảng web (giả lập)', createdAt: '2026-10-07T16:48:00+07:00', status: 'pending', handledBy: null, duplicate: false },
    { id: 'PO-2026-0837', tutor: 'Vũ Thùy Linh', initials: 'VL', tutorCode: 'GS-2026-031', subject: 'Hóa học · Lớp 11', teaching: 'Đang hoạt động giảng dạy', profileComplete: true, verified: true, email: 'vu.thuy.linh@example.com', phone: '09** *** 204', finishedClasses: '33 lớp học (99% đánh giá 5★)', bank: 'Agribank', bankFullName: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', bankCode: 'Agribank', accountNumber: '318***905', accountHolder: 'VŨ THÙY LINH', accountVerified: true, nameMatches: true, amount: 3500000, amountWords: 'Ba triệu năm trăm nghìn đồng chẵn', availableBalance: 480000, escrowBalance: 0, usedThisMonth: 3500000, createdVia: 'Nền tảng web (giả lập)', createdAt: '2026-10-06T14:10:00+07:00', status: 'processing', handledBy: 'admin.educonnect', duplicate: false },
    { id: 'PO-2026-0836', tutor: 'Đặng Thanh Tú', initials: 'ĐT', tutorCode: 'GS-2026-044', subject: 'Toán học · Lớp 9', teaching: 'Đang hoạt động giảng dạy', profileComplete: true, verified: true, email: 'dang.thanh.tu@example.com', phone: '09** *** 877', finishedClasses: '21 lớp học (97% đánh giá 5★)', bank: 'VietinBank', bankFullName: 'Ngân hàng TMCP Công Thương Việt Nam', bankCode: 'CTG', accountNumber: '104***771', accountHolder: 'ĐẶNG THANH TÚ', accountVerified: true, nameMatches: true, amount: 1800000, amountWords: 'Một triệu tám trăm nghìn đồng chẵn', availableBalance: 620000, escrowBalance: 1400000, usedThisMonth: 3600000, createdVia: 'Ứng dụng di động v2.4 (giả lập)', createdAt: '2026-10-03T10:30:00+07:00', status: 'processing', handledBy: 'admin.educonnect', duplicate: true },
    { id: 'PO-2026-0835', tutor: 'Hoàng Thu Hà', initials: 'HH', tutorCode: 'GS-2026-019', subject: 'Tiếng Anh · Lớp 6', teaching: 'Đang hoạt động giảng dạy', profileComplete: true, verified: true, email: 'hoang.thu.ha@example.com', phone: '09** *** 355', finishedClasses: '28 lớp học (100% đánh giá 5★)', bank: 'ACB', bankFullName: 'Ngân hàng TMCP Á Châu', bankCode: 'ACB', accountNumber: '220***148', accountHolder: 'HOÀNG THU HÀ', accountVerified: true, nameMatches: true, amount: 4200000, amountWords: 'Bốn triệu hai trăm nghìn đồng chẵn', availableBalance: 310000, escrowBalance: 0, usedThisMonth: 4200000, createdVia: 'Nền tảng web (giả lập)', createdAt: '2026-09-28T09:05:00+07:00', status: 'completed', handledBy: 'admin.educonnect', transactionCode: 'FT26100884127', duplicate: false },
    { id: 'PO-2026-0834', tutor: 'Bùi Đức Minh', initials: 'BM', tutorCode: 'GS-2026-063', subject: 'IELTS · Người đi làm', teaching: 'Đang hoạt động giảng dạy', profileComplete: true, verified: true, email: 'bui.duc.minh@example.com', phone: '09** *** 928', finishedClasses: '15 lớp học (94% đánh giá 5★)', bank: 'Vietcombank', bankFullName: 'Ngân hàng TMCP Ngoại thương Việt Nam', bankCode: 'VCB', accountNumber: '012***556', accountHolder: 'BÙI ĐỨC MINH', accountVerified: true, nameMatches: true, amount: 2750000, amountWords: 'Hai triệu bảy trăm năm mươi nghìn đồng chẵn', availableBalance: 1450000, escrowBalance: 0, usedThisMonth: 2750000, createdVia: 'Ứng dụng di động v2.3 (giả lập)', createdAt: '2026-09-21T19:40:00+07:00', status: 'completed', handledBy: 'admin.educonnect', transactionCode: 'FT26100773215', duplicate: false },
    { id: 'PO-2026-0833', tutor: 'Trương Quốc Bảo', initials: 'TB', tutorCode: 'GS-2026-097', subject: 'Toán học · Lớp 10', teaching: 'Đang hoạt động giảng dạy', profileComplete: true, verified: false, email: 'truong.quoc.bao@example.com', phone: '09** *** 173', finishedClasses: '4 lớp học (88% đánh giá 5★)', bank: 'Đông Á Bank', bankFullName: 'Ngân hàng TMCP Đông Á', bankCode: 'DAB', accountNumber: '060***233', accountHolder: 'TRƯƠNG QUỐC BẢO', accountVerified: false, nameMatches: false, amount: 5600000, amountWords: 'Năm triệu sáu trăm nghìn đồng chẵn', availableBalance: 5600000, escrowBalance: 0, usedThisMonth: 0, createdVia: 'Nền tảng web (giả lập)', createdAt: '2026-09-19T08:15:00+07:00', status: 'rejected', handledBy: 'admin.educonnect', reason: 'Tên chủ tài khoản nhận không khớp hồ sơ gia sư đã xác minh và tài khoản chưa hoàn tất xác minh. Gia sư cần cập nhật lại thông tin thụ hưởng rồi gửi yêu cầu mới.', duplicate: false },
  ];

  /** Cảnh báo nghiệp vụ suy ra từ dữ liệu, dùng chung cho danh sách và trang chi tiết. */
  const warningsOf = request => {
    const warnings = [];
    if (request.amount < minimumAmount) warnings.push({ code: 'below-minimum', severity: 'danger', label: 'Dưới mức tối thiểu', detail: `Số tiền rút phải từ ${formatMoney(minimumAmount)} trở lên.` });
    if (!request.nameMatches) warnings.push({ code: 'name-mismatch', severity: 'danger', label: 'Tên không khớp', detail: `Tên chủ tài khoản “${request.accountHolder}” khác họ tên trên hồ sơ đã xác minh.` });
    if (!request.accountVerified) warnings.push({ code: 'unverified-account', severity: 'danger', label: 'TK chưa xác minh', detail: 'Thông tin tài khoản nhận chưa được xác minh theo quy trình đối soát.' });
    if (request.amount > request.remainingLimit) warnings.push({ code: 'over-limit', severity: 'warning', label: 'Vượt hạn mức tháng', detail: `Vượt ${formatMoney(request.amount - request.remainingLimit)} so với hạn mức còn lại của tháng. Cần quản lý tài chính phê duyệt bổ sung.` });
    if (request.duplicate) warnings.push({ code: 'duplicate', severity: 'warning', label: 'Trùng 24 giờ', detail: 'Có yêu cầu rút tiền khác cùng giá trị trong vòng 24 giờ. Kiểm tra để tránh chi hai lần.' });
    if (request.escrowBalance > 0) warnings.push({ code: 'escrow-active', severity: 'info', label: 'Còn tiền Escrow', detail: `${formatMoney(request.escrowBalance)} đang giữ cho khóa học chưa tất toán.` });
    return warnings;
  };

  const criteriaOf = request => ([
    { code: 'identity', label: 'Hồ sơ gia sư đã xác minh danh tính', passed: Boolean(request.verified) },
    { code: 'minimum', label: `Số tiền rút đạt tối thiểu (${formatMoney(minimumAmount)})`, passed: request.amount >= minimumAmount },
    { code: 'holder', label: 'Tên chủ tài khoản khớp tên gia sư', passed: request.nameMatches },
    { code: 'account', label: 'Tài khoản nhận đã xác minh', passed: request.accountVerified },
    { code: 'limit', label: 'Nằm trong hạn mức rút của tháng', passed: request.amount <= request.remainingLimit },
    { code: 'locked', label: 'Số tiền nằm ở Số dư chờ rút hoặc đã tất toán', passed: request.lockedBalance > 0 || request.status === 'completed' },
  ]);

  const decorate = request => {
    const locked = ['pending', 'processing'].includes(request.status) ? request.amount : 0;
    const enriched = {
      ...request,
      lockedBalance: locked,
      remainingLimit: Math.max(0, monthlyLimit - request.usedThisMonth),
      monthlyLimit,
      minimumAmount,
    };
    enriched.warnings = warningsOf(enriched);
    enriched.blocking = enriched.warnings.filter(warning => warning.severity === 'danger');
    enriched.criteria = criteriaOf(enriched);
    return enriched;
  };

  // Trạng thái lưu được chỉ chấp nhận nếu đi đúng chiều vòng đời so với trạng thái gốc của bản ghi mẫu.
  const reachableFrom = { pending: ['processing', 'completed', 'rejected'], processing: ['completed', 'rejected'], completed: [], rejected: [] };

  const readDecisions = () => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(storageKey) || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
      const valid = {};
      fixtures.forEach(request => {
        const decision = saved[request.id];
        if (!decision || !['processing', 'completed', 'rejected'].includes(decision.status)) return;
        if (typeof decision.decidedAt !== 'string' || !Number.isFinite(Date.parse(decision.decidedAt))) return;
        if (typeof decision.reason !== 'string' || decision.reason.length > 1000) return;
        if (decision.status === 'rejected' && decision.reason.trim().length < 10) return;
        if (!reachableFrom[request.status].includes(decision.status)) return;
        if (decision.status === 'completed' && typeof decision.transactionCode !== 'string') return;
        valid[request.id] = {
          status: decision.status,
          reason: decision.reason,
          decidedAt: decision.decidedAt,
          handledBy: typeof decision.handledBy === 'string' ? decision.handledBy : 'admin.educonnect',
          transactionCode: typeof decision.transactionCode === 'string' ? decision.transactionCode : '',
        };
      });
      return valid;
    } catch {
      return {};
    }
  };

  const list = () => {
    const decisions = readDecisions();
    return fixtures.map(request => {
      const decision = decisions[request.id];
      if (!decision) return decorate(request);
      const merged = decorate({
        ...request,
        status: decision.status,
        handledBy: decision.handledBy,
        reason: decision.status === 'rejected' ? decision.reason : '',
        transactionCode: decision.status === 'completed' ? decision.transactionCode : request.transactionCode,
        decidedAt: decision.decidedAt,
      });
      // Yêu cầu bị từ chối đã hoàn tiền về Số dư khả dụng nên không còn khoản khóa.
      if (decision.status === 'rejected') merged.availableBalance = request.availableBalance + request.amount;
      merged.decision = decision;
      return merged;
    });
  };

  const get = id => list().find(request => request.id === id);

  const actions = Object.freeze({
    process: { from: ['pending'], to: 'processing', requires: [] },
    complete: { from: ['processing'], to: 'completed', requires: ['transactionCode'] },
    reject: { from: ['pending', 'processing'], to: 'rejected', requires: ['reason'] },
  });

  /** Chuyển trạng thái theo vòng đời rút tiền. Vứt Error khi nghiệp vụ không cho phép. */
  const decide = (id, action, payload = {}) => {
    const transition = actions[action];
    if (!transition) throw new Error('Thao tác xử lý không hợp lệ.');
    const current = get(id);
    if (!current) throw new Error('Không tìm thấy yêu cầu rút tiền.');
    if (!transition.from.includes(current.status)) throw new Error('Yêu cầu không còn ở trạng thái có thể xử lý.');
    const reason = String(payload.reason ?? '').trim();
    const transactionCode = String(payload.transactionCode ?? '').trim();
    if (transition.to === 'rejected' && (reason.length < 10 || reason.length > 1000)) throw new Error('Lý do từ chối cần có từ 10 đến 1000 ký tự.');
    if (transition.to === 'completed' && (transactionCode.length < 5 || transactionCode.length > 24)) throw new Error('Mã giao dịch ngân hàng cần có từ 5 đến 24 ký tự.');
    if (transition.to === 'processing' && current.blocking.length) throw new Error('Yêu cầu còn cảnh báo bắt buộc xử lý trước khi duyệt.');
    const decisions = readDecisions();
    decisions[id] = {
      status: transition.to,
      reason: transition.to === 'rejected' ? reason : '',
      transactionCode: transition.to === 'completed' ? transactionCode : '',
      handledBy: 'admin.educonnect',
      decidedAt: new Date().toISOString(),
    };
    // Chỉ đổi trạng thái sau khi ghi thành công; lỗi ghi do trang xử lý bằng Alert/Toast.
    window.sessionStorage.setItem(storageKey, JSON.stringify(decisions));
    return get(id);
  };

  window.EduPayout = Object.freeze({
    list,
    get,
    decide,
    formatMoney,
    statuses,
    actions,
    minimumAmount,
    monthlyLimit,
    adminName: 'admin.educonnect',
  });
})();
