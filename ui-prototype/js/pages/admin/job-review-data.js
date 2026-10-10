/** Dữ liệu minh họa chung cho hàng đợi và chi tiết duyệt tin. Không gọi API. */
(() => {
  const fixtures = [
    { id: 'TT-8841', title: 'Gia sư Tiếng Anh lớp 10', poster: 'Lê Hoàng Nam', initials: 'LN', role: 'Phụ huynh', subject: 'english', subjectLabel: 'Tiếng Anh', grade: 'Lớp 10', fee: 250000, region: 'Q. Bình Thạnh, TP.HCM', format: 'Tại nhà phụ huynh', sessions: '2 buổi/tuần', submitted: '2026-10-09T08:20:00+07:00', signal: 'Phát hiện số điện thoại ẩn', status: 'pending', description: 'Cần gia sư hỗ trợ học sinh lớp 10 củng cố ngữ pháp, luyện kỹ năng đọc hiểu và giao tiếp tiếng Anh. Học vào tối thứ Ba và thứ Năm, mỗi buổi 90 phút. Ưu tiên gia sư có kinh nghiệm giảng dạy chương trình THPT.' },
    { id: 'TT-8840', title: 'Gia sư Hóa học 11 ôn thi ĐGNL', poster: 'Trần Thị Hồng', initials: 'TH', role: 'Phụ huynh', subject: 'chemistry', subjectLabel: 'Hóa học', grade: 'Lớp 11', fee: 220000, region: 'Q. Cầu Giấy, Hà Nội', format: 'Trực tuyến', sessions: '3 buổi/tuần', submitted: '2026-10-09T08:35:00+07:00', signal: 'Chứa từ khóa tài khoản mạng xã hội', status: 'pending', description: 'Tìm gia sư Hóa học lớp 11 để hệ thống kiến thức và luyện bài tập đánh giá năng lực. Học trực tuyến vào các tối thứ Hai, thứ Tư và thứ Sáu. Cần có lộ trình và bài kiểm tra tiến bộ hàng tuần.' },
    { id: 'TT-8839', title: 'Tìm gia sư Toán lớp 9 ôn thi vào 10', poster: 'Nguyễn Văn An', initials: 'NA', role: 'Phụ huynh', subject: 'math', subjectLabel: 'Toán học', grade: 'Lớp 9', fee: 200000, region: 'Q. Tân Bình, TP.HCM', format: 'Tại nhà', sessions: '2 buổi/tuần', submitted: '2026-10-09T09:05:00+07:00', signal: '', status: 'pending', description: 'Cần gia sư Toán giúp học sinh lớp 9 ôn thi vào lớp 10, tập trung đại số và hình học. Học tại nhà vào cuối tuần, mỗi buổi 90 phút. Ưu tiên người kiên nhẫn, có kinh nghiệm luyện thi.' },
    { id: 'TT-8838', title: 'Luyện thi IELTS General 6.5 cấp tốc', poster: 'Phạm Minh Quân', initials: 'MQ', role: 'Học viên đi làm', subject: 'ielts', subjectLabel: 'IELTS', grade: 'Người đi làm', fee: 350000, region: 'Toàn quốc', format: 'Trực tuyến', sessions: '3 buổi/tuần', submitted: '2026-10-09T09:30:00+07:00', signal: '', status: 'pending', description: 'Tìm gia sư IELTS General với mục tiêu 6.5 trong 3 tháng. Trình độ hiện tại khoảng 5.0, cần cải thiện Writing và Speaking. Học trực tuyến sau 20 giờ để phù hợp lịch làm việc.' },
    { id: 'TT-8837', title: 'Kèm môn Ngữ văn lớp 12 tốt nghiệp THPT', poster: 'Vũ Mai Trang', initials: 'MT', role: 'Phụ huynh', subject: 'literature', subjectLabel: 'Ngữ văn', grade: 'Lớp 12', fee: 230000, region: 'Q. 7, TP.HCM', format: 'Tại nhà', sessions: '1 buổi/tuần', submitted: '2026-10-09T10:10:00+07:00', signal: '', status: 'pending', description: 'Cần gia sư Ngữ văn lớp 12 hướng dẫn kỹ năng đọc hiểu, nghị luận xã hội và nghị luận văn học để chuẩn bị thi tốt nghiệp THPT. Học sáng Chủ nhật, mỗi buổi 120 phút.' },
    { id: 'TT-8836', title: 'Gia sư Toán lớp 8 củng cố kiến thức', poster: 'Đỗ Thị Lan', initials: 'DL', role: 'Phụ huynh', subject: 'math', subjectLabel: 'Toán học', grade: 'Lớp 8', fee: 180000, region: 'Q. Thanh Xuân, Hà Nội', format: 'Tại nhà', sessions: '2 buổi/tuần', submitted: '2026-10-08T15:15:00+07:00', signal: '', status: 'hiring', description: 'Hỗ trợ học sinh lớp 8 củng cố kiến thức Toán, luyện bài tập và chuẩn bị kiểm tra giữa kỳ. Lịch học vào tối thứ Ba và thứ Sáu.' },
    { id: 'TT-8835', title: 'Tiếng Anh giao tiếp cho người đi làm', poster: 'Bùi Đức Minh', initials: 'BM', role: 'Học viên đi làm', subject: 'english', subjectLabel: 'Tiếng Anh', grade: 'Người đi làm', fee: 300000, region: 'Toàn quốc', format: 'Trực tuyến', sessions: '2 buổi/tuần', submitted: '2026-10-08T14:00:00+07:00', signal: '', status: 'hiring', description: 'Luyện giao tiếp tiếng Anh trong công việc, tập trung thuyết trình và trao đổi với đồng nghiệp. Học trực tuyến buổi tối.' },
    { id: 'TT-8834', title: 'Ôn tập Vật lý lớp 12', poster: 'Hoàng Thu Hà', initials: 'HH', role: 'Phụ huynh', subject: 'physics', subjectLabel: 'Vật lý', grade: 'Lớp 12', fee: 240000, region: 'Q. Hải Châu, Đà Nẵng', format: 'Tại nhà', sessions: '2 buổi/tuần', submitted: '2026-10-07T10:00:00+07:00', signal: '', status: 'closed', description: 'Ôn tập Vật lý lớp 12 và luyện đề tốt nghiệp. Tin đã đóng vì phụ huynh đã tìm được gia sư phù hợp.' },
    { id: 'TT-8833', title: 'Tìm gia sư Toán lớp 10', poster: 'Trương Quốc Bảo', initials: 'TB', role: 'Phụ huynh', subject: 'math', subjectLabel: 'Toán học', grade: 'Lớp 10', fee: 200000, region: 'TP. Thủ Đức, TP.HCM', format: 'Tại nhà', sessions: '2 buổi/tuần', submitted: '2026-10-07T09:00:00+07:00', signal: 'Nội dung chứa thông tin liên hệ ngoài', status: 'rejected', description: 'Tìm gia sư Toán lớp 10 hỗ trợ học tại nhà. Tin bị từ chối do chứa thông tin liên hệ ngoài nền tảng; người đăng cần chỉnh sửa trước khi gửi lại.' },
  ];

  const details = {
    'TT-8841': { schedule: ['Thứ Ba · 19:00–20:30', 'Thứ Năm · 19:00–20:30'], duration: '90 phút/buổi', experience: 'Tối thiểu 2 năm giảng dạy', qualification: 'Sinh viên Sư phạm hoặc đã tốt nghiệp chuyên ngành Tiếng Anh', tutorNote: 'Ưu tiên gia sư phát âm chuẩn, kiên nhẫn và có phương pháp tương tác phản xạ chủ động. Cần xem trước chứng chỉ hoặc thẻ sinh viên khi nhận lớp.', privateNote: 'Buổi tối nếu đến ngõ thì gọi cho mẹ cháu qua số không chín 0 ba 8 tám tám xxx hoặc nhắn qua Zalo để mở cửa hầm gửi xe.' },
    'TT-8840': { schedule: ['Thứ Hai · 19:30–21:00', 'Thứ Tư · 19:30–21:00', 'Thứ Sáu · 19:30–21:00'], duration: '90 phút/buổi', experience: 'Tối thiểu 2 năm luyện thi', qualification: 'Chuyên ngành Hóa học hoặc Sư phạm Hóa học', tutorNote: 'Có lộ trình ôn thi đánh giá năng lực và bài kiểm tra tiến bộ hàng tuần.', privateNote: 'Có thể trao đổi thêm qua tài khoản Zalo của phụ huynh trước khi nhận lớp.' },
    'TT-8839': { schedule: ['Thứ Bảy · 09:00–10:30', 'Chủ nhật · 09:00–10:30'], duration: '90 phút/buổi', experience: 'Có kinh nghiệm ôn thi vào lớp 10', qualification: 'Chuyên ngành Toán hoặc Sư phạm Toán', tutorNote: 'Kiên nhẫn, giải thích rõ từng bước và theo sát mức độ tiến bộ của học sinh.' },
    'TT-8838': { schedule: ['Thứ Hai · 20:00–21:30', 'Thứ Tư · 20:00–21:30', 'Thứ Sáu · 20:00–21:30'], duration: '90 phút/buổi', experience: 'Có kinh nghiệm luyện IELTS General', qualification: 'IELTS 7.5 trở lên hoặc trình độ tương đương', tutorNote: 'Có thể chữa bài Writing chi tiết và luyện Speaking theo tình huống thực tế.' },
    'TT-8837': { schedule: ['Chủ nhật · 08:00–10:00'], duration: '120 phút/buổi', experience: 'Có kinh nghiệm luyện thi tốt nghiệp THPT', qualification: 'Chuyên ngành Ngữ văn hoặc Sư phạm Ngữ văn', tutorNote: 'Hướng dẫn xây dựng dàn ý và nhận xét bài viết sau mỗi buổi học.' },
    'TT-8836': { schedule: ['Thứ Ba · 19:00–20:30', 'Thứ Sáu · 19:00–20:30'], duration: '90 phút/buổi', experience: 'Có kinh nghiệm dạy chương trình THCS', qualification: 'Chuyên ngành Toán hoặc Sư phạm Toán', tutorNote: 'Củng cố kiến thức nền và hướng dẫn phương pháp tự học.' },
    'TT-8835': { schedule: ['Thứ Ba · 20:00–21:30', 'Thứ Năm · 20:00–21:30'], duration: '90 phút/buổi', experience: 'Có kinh nghiệm dạy tiếng Anh giao tiếp', qualification: 'Chuyên ngành Tiếng Anh hoặc chứng chỉ giảng dạy phù hợp', tutorNote: 'Ưu tiên tình huống giao tiếp trong công việc và thuyết trình.' },
    'TT-8834': { schedule: ['Thứ Tư · 19:00–20:30', 'Thứ Bảy · 19:00–20:30'], duration: '90 phút/buổi', experience: 'Có kinh nghiệm luyện thi tốt nghiệp THPT', qualification: 'Chuyên ngành Vật lý hoặc Sư phạm Vật lý', tutorNote: 'Có hệ thống bài tập từ cơ bản đến nâng cao.' },
    'TT-8833': { schedule: ['Thứ Ba · 19:00–20:30', 'Thứ Năm · 19:00–20:30'], duration: '90 phút/buổi', experience: 'Có kinh nghiệm dạy chương trình THPT', qualification: 'Chuyên ngành Toán hoặc Sư phạm Toán', tutorNote: 'Theo sát chương trình học và hỗ trợ bài tập trên lớp.', privateNote: 'Ghi chú gửi kèm có thông tin liên hệ ngoài nền tảng.' },
  };
  const storageKey = 'educonnect:job-review-decisions:v1';
  const readDecisions = () => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(storageKey) || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
      const valid = {};
      fixtures.forEach(job => {
        const decision = saved[job.id];
        if (!decision || !['hiring', 'rejected'].includes(decision.status)) return;
        if (typeof decision.reviewedAt !== 'string' || !Number.isFinite(Date.parse(decision.reviewedAt))) return;
        if (typeof decision.reason !== 'string' || decision.reason.length > 1000) return;
        if (decision.status === 'rejected' && decision.reason.trim().length < 10) return;
        if (job.status !== 'pending') return;
        valid[job.id] = { status: decision.status, reason: decision.reason, reviewedAt: decision.reviewedAt };
      });
      return valid;
    } catch {
      return {};
    }
  };
  const list = () => {
    const decisions = readDecisions();
    return fixtures.map(job => ({ ...job, ...details[job.id], gender: 'Không yêu cầu', ...decisions[job.id] }));
  };
  const get = id => list().find(job => job.id === id);
  const review = (id, nextStatus, reason = '') => {
    const job = get(id);
    if (!job || job.status !== 'pending') throw new Error('Tin không còn ở trạng thái chờ duyệt.');
    if (!['hiring', 'rejected'].includes(nextStatus)) throw new Error('Trạng thái duyệt không hợp lệ.');
    const trimmedReason = String(reason).trim();
    if (nextStatus === 'rejected' && (trimmedReason.length < 10 || trimmedReason.length > 1000)) throw new Error('Lý do từ chối cần có từ 10 đến 1000 ký tự.');
    const decisions = readDecisions();
    decisions[id] = { status: nextStatus, reason: nextStatus === 'rejected' ? trimmedReason : '', reviewedAt: new Date().toISOString() };
    // Chỉ đổi trạng thái sau khi lưu thành công; lỗi lưu được trang xử lý bằng Alert/Toast.
    window.sessionStorage.setItem(storageKey, JSON.stringify(decisions));
    return get(id);
  };
  window.EduJobReview = Object.freeze({ list, get, review });
})();
