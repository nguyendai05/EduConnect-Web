/**
 * Dữ liệu minh họa cho trang "Báo cáo & tranh chấp" (35) và "Xử lý tranh chấp" (36).
 * Toàn bộ tên người, nội dung và số liệu đều là dữ liệu giả lập phục vụ thiết kế giao diện.
 * Không gọi API, không có thông tin cá nhân thật, không số điện thoại / email / mã truy cập.
 */
(() => {
  const storageKey = 'educonnect:report-decisions:v1';

  const statuses = Object.freeze({
    open: Object.freeze({ label: 'Mới tiếp nhận', summary: 'mới tiếp nhận', badge: 'badge--info' }),
    investigating: Object.freeze({ label: 'Đang xác minh', summary: 'đang xác minh', badge: 'badge--warning' }),
    resolved: Object.freeze({ label: 'Đã xử lý', summary: 'đã xử lý', badge: 'badge--success' }),
    dismissed: Object.freeze({ label: 'Đã bác bỏ', summary: 'đã bác bỏ', badge: 'badge--neutral' }),
  });

  const severities = Object.freeze({
    high: Object.freeze({ label: 'Cao', short: 'Mức độ cao', rank: 3, badge: 'badge--danger' }),
    medium: Object.freeze({ label: 'Trung bình', short: 'Mức độ trung bình', rank: 2, badge: 'badge--warning' }),
    low: Object.freeze({ label: 'Thấp', short: 'Mức độ thấp', rank: 1, badge: 'badge--neutral' }),
  });

  const types = Object.freeze({
    session: Object.freeze({ label: 'Buổi học', icon: 'calendar' }),
    message: Object.freeze({ label: 'Tin nhắn', icon: 'message' }),
    contract: Object.freeze({ label: 'Hợp đồng', icon: 'receipt' }),
    class: Object.freeze({ label: 'Lớp nhóm', icon: 'library' }),
    user: Object.freeze({ label: 'Người dùng', icon: 'profile' }),
  });

  const refundSet = Object.freeze([
    Object.freeze({ key: 'refund', label: 'Hoàn khoản đang giữ của buổi đang phản ánh', detail: 'Khoản đang giữ chuyển sang Đã hoàn về ví người học; buổi học không tính phí.' }),
    Object.freeze({ key: 'release', label: 'Giải ngân khoản đang giữ cho gia sư', detail: 'Khoản đang giữ chuyển sang Đã giải ngân sau khi đối chiếu thấy buổi học diễn ra đầy đủ.' }),
    Object.freeze({ key: 'terminate', label: 'Chấm dứt hợp đồng và hoàn phần còn đang giữ', detail: 'Kết thúc hợp đồng, hoàn toàn bộ khoản chưa giải ngân; các khoản đã tất toán giữ nguyên.' }),
  ]);

  const contentSet = Object.freeze([
    Object.freeze({ key: 'remind', label: 'Nhắc nhở các bên và lưu hồ sơ vụ việc', detail: 'Gửi thông báo nhắc nhở quy tắc trao đổi, không thay đổi trạng thái tài chính.' }),
    Object.freeze({ key: 'correct', label: 'Yêu cầu chỉnh sửa nội dung liên quan', detail: 'Các bên cập nhật lại nội dung/tin đăng; vụ việc đóng sau khi chỉnh sửa.' }),
    Object.freeze({ key: 'terminate', label: 'Chấm dứt hợp đồng và hoàn phần còn đang giữ', detail: 'Kết thúc hợp đồng, hoàn toàn bộ khoản chưa giải ngân; các khoản đã tất toán giữ nguyên.' }),
  ]);

  const accountSet = Object.freeze([
    Object.freeze({ key: 'secure', label: 'Đặt lại phiên đăng nhập và ghi nhận cảnh báo bảo mật', detail: 'Vô hiệu phiên đăng nhập cũ, nhắc bật xác thực hai bước; không ảnh hưởng ký quỹ.' }),
    Object.freeze({ key: 'correct', label: 'Cập nhật lại thông tin hiển thị trong hồ sơ', detail: 'Hồ sơ được chỉnh sửa theo dữ liệu người dùng cung cấp.' }),
    Object.freeze({ key: 'dismiss', label: 'Kết luận không có dấu hiệu bất thường', detail: 'Đối chiếu nhật ký đăng nhập, không ghi nhận hành vi bất thường.' }),
  ]);

  const fixtures = [
    {
      id: 'BC-2026-041',
      title: 'Phản ánh thời lượng Buổi 3 ngắn hơn thỏa thuận',
      type: 'session',
      severity: 'medium',
      status: 'open',
      reporter: 'Chị Mai Lan',
      initials: 'ML',
      reporterRole: 'Phụ huynh',
      reported: 'Gia sư Nguyễn Minh Anh',
      reportedRole: 'Gia sư Toán · Lớp 11',
      reference: 'HĐ-2026-0919-024',
      referenceLabel: 'Hợp đồng liên quan',
      scope: 'Buổi 3 / 8',
      moneyLock: true,
      heldAmount: 220000,
      assignee: '',
      created: '2026-10-06T09:42:00+07:00',
      summary: 'Thời lượng buổi học chưa khớp thỏa thuận; đề nghị kiểm tra trước khi xử lý khoản đang giữ.',
      description: 'Người báo cáo cho biết buổi học kết thúc sớm hơn thời gian đã thống nhất và phần nội dung ôn tập chưa được thực hiện đầy đủ, vì vậy đề nghị nền tảng đối chiếu trước khi xử lý khoản học phí của buổi này. Đây là dữ liệu minh họa, chưa phải kết luận vi phạm.',
      parties: [
        { name: 'Chị Mai Lan', role: 'Người báo cáo · Phụ huynh', initials: 'ML' },
        { name: 'Gia sư Nguyễn Minh Anh', role: 'Bị báo cáo · Gia sư phụ trách', initials: 'MA' },
        { name: 'Học sinh Gia Huy', role: 'Người học liên quan · Lớp 11', initials: 'GH' },
      ],
      evidence: [
        { name: 'anh-chup-trao-doi-05-10.png', kind: 'Ảnh chụp màn hình', meta: 'PNG · 1,4 MB · Tải lên 06/10 09:42 bởi người báo cáo' },
      ],
      excerpt: [
        { author: 'Chị Mai Lan', side: 'left', time: '20:05', text: 'Hôm nay buổi học kết thúc sớm hơn dự kiến khoảng 20 phút phải không ạ?' },
        { author: 'Gia sư Nguyễn Minh Anh', side: 'right', time: '20:12', text: 'Dạ hôm nay có việc gấp nên em cho học sinh làm bài trước 20 phút, buổi sau em dạy bù thêm giờ ạ.' },
      ],
      timeline: [
        { title: 'Người báo cáo gửi phản ánh về Buổi 3', at: '2026-10-06T09:42:00+07:00', actor: 'Chị Mai Lan', detail: 'Lý do ghi nhận: thời lượng buổi học chưa trọn vẹn.' },
        { title: 'Hợp đồng chuyển sang trạng thái Đang tranh chấp', at: '2026-10-06T09:43:00+07:00', actor: 'Hệ thống minh họa', detail: 'Kích hoạt quy trình đối chiếu mức 1.' },
        { title: 'Tạm dừng cơ chế tự động tất toán khoản đang giữ', at: '2026-10-06T09:43:00+07:00', actor: 'Hệ thống minh họa', detail: 'Khoản 220.000 ₫ được giữ nguyên cho tới khi có kết luận.' },
      ],
      resolutions: refundSet,
    },
    {
      id: 'BC-2026-040',
      title: 'Trao đổi trước khi ký hợp đồng có dấu hiệu liên hệ ngoài nền tảng',
      type: 'message',
      severity: 'high',
      status: 'investigating',
      reporter: 'Anh Lê Hoàng Nam',
      initials: 'LN',
      reporterRole: 'Phụ huynh',
      reported: 'Gia sư Trần Quốc Huy',
      reportedRole: 'Gia sư IELTS',
      reference: 'Không gắn hợp đồng',
      referenceLabel: 'Hợp đồng liên quan',
      scope: 'Đoạn chat trước khi ký',
      moneyLock: false,
      heldAmount: 0,
      assignee: 'Quản trị viên',
      created: '2026-10-05T16:18:00+07:00',
      summary: 'Nội dung trao đổi có đề nghị chuyển sang kênh liên lạc khác; cần đối chiếu quy tắc nền tảng.',
      description: 'Người báo cáo phản ánh rằng đoạn trao đổi trước khi ký có nội dung đề nghị liên hệ qua kênh ngoài nền tảng. Quản trị viên đang đối chiếu với quy tắc sử dụng và lịch sử chat. Nội dung minh họa, không kèm dữ liệu liên hệ thật.',
      parties: [
        { name: 'Anh Lê Hoàng Nam', role: 'Người báo cáo · Phụ huynh', initials: 'LN' },
        { name: 'Gia sư Trần Quốc Huy', role: 'Bị báo cáo · Gia sư', initials: 'TH' },
      ],
      evidence: [
        { name: 'trich-xuat-chat-05-10.png', kind: 'Ảnh chụp màn hình', meta: 'PNG · 820 KB · Tải lên 05/10 16:18 bởi người báo cáo' },
        { name: 'quy-tac-trao-doi-v2.txt', kind: 'Tệp văn bản', meta: 'TXT · 12 KB · Tài liệu nội bộ đi kèm quy tắc' },
      ],
      excerpt: [
        { author: 'Gia sư Trần Quốc Huy', side: 'right', time: '15:40', text: 'Mình trao đổi nhanh qua kênh ngoài cho tiện chị nhé.' },
        { author: 'Anh Lê Hoàng Nam', side: 'left', time: '15:44', text: 'Em thấy nên giữ trao đổi trên nền tảng để hai bên đều có căn cứ đối chiếu.' },
      ],
      timeline: [
        { title: 'Người báo cáo gửi phản ánh về nội dung tin nhắn', at: '2026-10-05T16:18:00+07:00', actor: 'Anh Lê Hoàng Nam', detail: 'Đính kèm bản trích xuất đoạn chat.' },
        { title: 'Quản trị viên tiếp nhận và chuyển sang Đang xác minh', at: '2026-10-05T17:02:00+07:00', actor: 'Quản trị viên', detail: 'Cán bộ thụ lý đối chiếu quy tắc trao đổi.' },
      ],
      resolutions: contentSet,
    },
    {
      id: 'BC-2026-039',
      title: 'Đề nghị xác nhận lại lịch nghỉ buổi học ngày 28/09',
      type: 'session',
      severity: 'low',
      status: 'open',
      reporter: 'Chị Đỗ Thị Lan',
      initials: 'DL',
      reporterRole: 'Phụ huynh',
      reported: 'Gia sư Phạm Minh Quân',
      reportedRole: 'Gia sư Toán · Lớp 8',
      reference: 'HĐ-2026-0901-011',
      referenceLabel: 'Hợp đồng liên quan',
      scope: 'Buổi 5 / 12',
      moneyLock: false,
      heldAmount: 180000,
      assignee: '',
      created: '2026-10-05T08:05:00+07:00',
      summary: 'Hai bên nhớ khác nhau về việc đã báo nghỉ buổi học hay chưa.',
      description: 'Người báo cáo và gia sư ghi nhận khác nhau về thời điểm báo nghỉ buổi học. Đề nghị nền tảng xem lại lịch sử thông báo để thống nhất cách tính buổi. Vụ việc mức độ thấp, không phát sinh khóa khoản.',
      parties: [
        { name: 'Chị Đỗ Thị Lan', role: 'Người báo cáo · Phụ huynh', initials: 'DL' },
        { name: 'Gia sư Phạm Minh Quân', role: 'Bị báo cáo · Gia sư', initials: 'PQ' },
      ],
      evidence: [
        { name: 'thong-bao-nghi-hoc-28-09.png', kind: 'Ảnh chụp màn hình', meta: 'PNG · 460 KB · Tải lên 05/10 08:05 bởi người báo cáo' },
      ],
      excerpt: [
        { author: 'Chị Đỗ Thị Lan', side: 'left', time: '21:10', text: 'Em đã nhắn báo nghỉ từ tối 27/09 nhưng hình như tin bị trôi ạ.' },
      ],
      timeline: [
        { title: 'Người báo cáo gửi phản ánh về lịch nghỉ buổi học', at: '2026-10-05T08:05:00+07:00', actor: 'Chị Đỗ Thị Lan', detail: 'Đính kèm bản chụp thông báo trong ứng dụng.' },
      ],
      resolutions: refundSet,
    },
    {
      id: 'BC-2026-038',
      title: 'Học viên được thêm vào lớp nhóm không đúng môn đã đăng ký',
      type: 'class',
      severity: 'medium',
      status: 'investigating',
      reporter: 'Anh Trương Quốc Bảo',
      initials: 'TB',
      reporterRole: 'Phụ huynh',
      reported: 'Lớp nhóm "Toán nâng cao 6 – Cơ sở 2"',
      reportedRole: 'Lớp nhóm do gia sư vận hành',
      reference: 'LOP-2026-0037',
      referenceLabel: 'Lớp nhóm liên quan',
      scope: 'Học viên lớp nhóm',
      moneyLock: false,
      heldAmount: 0,
      assignee: 'Quản trị viên',
      created: '2026-10-04T14:20:00+07:00',
      summary: 'Danh sách lớp và môn học hiển thị chưa khớp với phiếu đăng ký.',
      description: 'Người báo cáo phản ánh học viên được thêm vào lớp nhóm có tên môn khác với phiếu đăng ký. Quản trị viên đang đối chiếu danh sách lớp, thời khóa biểu và phiếu đăng ký. Nội dung minh họa.',
      parties: [
        { name: 'Anh Trương Quốc Bảo', role: 'Người báo cáo · Phụ huynh', initials: 'TB' },
        { name: 'Gia sư Hoàng Thu Hà', role: 'Người vận hành lớp nhóm', initials: 'HH' },
      ],
      evidence: [
        { name: 'phieu-dang-ky-lop-nhom.txt', kind: 'Tệp văn bản', meta: 'TXT · 8 KB · Tải lên 04/10 14:20 bởi người báo cáo' },
      ],
      excerpt: [],
      timeline: [
        { title: 'Người báo cáo gửi phản ánh về lớp nhóm', at: '2026-10-04T14:20:00+07:00', actor: 'Anh Trương Quốc Bảo', detail: 'Đính kèm phiếu đăng ký bản minh họa.' },
        { title: 'Quản trị viên tiếp nhận và chuyển sang Đang xác minh', at: '2026-10-04T15:00:00+07:00', actor: 'Quản trị viên', detail: 'Đối chiếu danh sách lớp và thời khóa biểu.' },
      ],
      resolutions: contentSet,
    },
    {
      id: 'BC-2026-037',
      title: 'Khiếu nại cách tính phí buổi học hủy trước 24 giờ',
      type: 'contract',
      severity: 'medium',
      status: 'resolved',
      reporter: 'Chị Vũ Mai Trang',
      initials: 'MT',
      reporterRole: 'Phụ huynh',
      reported: 'Gia sư Bùi Đức Minh',
      reportedRole: 'Gia sư Tiếng Anh · Lớp 12',
      reference: 'HĐ-2026-0822-006',
      referenceLabel: 'Hợp đồng liên quan',
      scope: 'Buổi 9 / 16',
      moneyLock: true,
      heldAmount: 230000,
      assignee: 'Quản trị viên',
      created: '2026-10-02T10:12:00+07:00',
      reviewedAt: '2026-10-03T11:20:00+07:00',
      resolution: 'refund',
      decisionNote: 'Sau khi đối chiếu lịch sử thông báo, buổi học được hủy trước hơn 24 giờ nên khoản đang giữ của buổi 9 được hoàn về ví người học. Hai buổi còn lại giữ nguyên lịch. Kết quả lưu vết trong nhật ký kiểm toán.',
      summary: 'Điều khoản hủy buổi trong hợp đồng được hai bên hiểu khác nhau.',
      description: 'Người báo cáo cho rằng buổi học đã hủy đúng thời hạn quy định nên không tính phí. Gia sư giữ quan điểm ngược lại. Quản trị viên đối chiếu điều khoản hợp đồng và lịch sử thông báo rồi đưa ra kết luận.',
      parties: [
        { name: 'Chị Vũ Mai Trang', role: 'Người báo cáo · Phụ huynh', initials: 'MT' },
        { name: 'Gia sư Bùi Đức Minh', role: 'Bị báo cáo · Gia sư', initials: 'BM' },
      ],
      evidence: [
        { name: 'dieukhoan-huy-buoi-trang-3.png', kind: 'Ảnh chụp màn hình', meta: 'PNG · 640 KB · Trích xuất điều khoản hợp đồng' },
      ],
      excerpt: [
        { author: 'Chị Vũ Mai Trang', side: 'left', time: '08:30', text: 'Em báo nghỉ từ chiều hôm qua, tức là còn hơn 24 giờ so với buổi học ạ.' },
      ],
      timeline: [
        { title: 'Người báo cáo gửi khiếu nại về cách tính phí', at: '2026-10-02T10:12:00+07:00', actor: 'Chị Vũ Mai Trang', detail: 'Đính kèm trích xuất điều khoản hợp đồng.' },
        { title: 'Quản trị viên chuyển hồ sơ sang Đang xác minh', at: '2026-10-02T13:40:00+07:00', actor: 'Quản trị viên', detail: 'Đối chiếu thời điểm gửi thông báo hủy buổi.' },
      ],
      resolutions: refundSet,
    },
    {
      id: 'BC-2026-036',
      title: 'Phản ánh thông tin chuyên môn trong hồ sơ gia sư chưa cập nhật',
      type: 'user',
      severity: 'low',
      status: 'dismissed',
      reporter: 'Anh Nguyễn Văn An',
      initials: 'NA',
      reporterRole: 'Phụ huynh',
      reported: 'Gia sư Trần Thị Mai Hương',
      reportedRole: 'Gia sư Ngữ văn · Lớp 12',
      reference: 'HĐ-2026-0815-003',
      referenceLabel: 'Hợp đồng liên quan',
      scope: 'Hồ sơ gia sư',
      moneyLock: false,
      heldAmount: 0,
      assignee: 'Quản trị viên',
      created: '2026-10-01T09:30:00+07:00',
      reviewedAt: '2026-10-01T16:05:00+07:00',
      resolution: 'dismiss',
      decisionNote: 'Đối chiếu hồ sơ cho thấy thông tin chuyên môn đã được cập nhật trước thời điểm người báo cáo xem trang; nội dung hiển thị chậm do bộ nhớ đệm của trình duyệt. Không ghi nhận vi phạm từ phía gia sư, vụ việc được bác và đóng hồ sơ.',
      summary: 'Người dùng cho rằng hồ sơ hiển thị thông tin cũ so với thực tế.',
      description: 'Người báo cáo phản ánh trang hồ sơ hiển thị khối lớp giảng dạy chưa đúng. Quản trị viên kiểm tra lại dữ liệu nguồn và lịch sử cập nhật hồ sơ. Kết luận: không có sai lệch tại thời điểm đối chiếu.',
      parties: [
        { name: 'Anh Nguyễn Văn An', role: 'Người báo cáo · Phụ huynh', initials: 'NA' },
        { name: 'Gia sư Trần Thị Mai Hương', role: 'Bên liên quan · Gia sư', initials: 'MH' },
      ],
      evidence: [
        { name: 'ho-so-hien-thi-01-10.png', kind: 'Ảnh chụp màn hình', meta: 'PNG · 510 KB · Tải lên 01/10 09:30 bởi người báo cáo' },
      ],
      excerpt: [],
      timeline: [
        { title: 'Người báo cáo gửi phản ánh về hồ sơ gia sư', at: '2026-10-01T09:30:00+07:00', actor: 'Anh Nguyễn Văn An', detail: 'Đính kèm bản chụp trang hồ sơ.' },
        { title: 'Quản trị viên đối chiếu dữ liệu nguồn', at: '2026-10-01T14:20:00+07:00', actor: 'Quản trị viên', detail: 'Kiểm tra lịch sử cập nhật hồ sơ và phiên hiển thị.' },
      ],
      resolutions: accountSet,
    },
    {
      id: 'BC-2026-035',
      title: 'Tài khoản nhận được cảnh báo đăng nhập từ thiết bị lạ',
      type: 'user',
      severity: 'high',
      status: 'resolved',
      reporter: 'Chị Đặng Thanh Tú',
      initials: 'DT',
      reporterRole: 'Học viên',
      reported: 'Tài khoản của người báo cáo',
      reportedRole: 'Tài khoản học viên',
      reference: 'Không gắn hợp đồng',
      referenceLabel: 'Hợp đồng liên quan',
      scope: 'Phiên đăng nhập',
      moneyLock: false,
      heldAmount: 0,
      assignee: 'Quản trị viên',
      created: '2026-09-30T21:48:00+07:00',
      reviewedAt: '2026-10-01T08:15:00+07:00',
      resolution: 'secure',
      decisionNote: 'Nhật ký đăng nhập ghi nhận một phiên mới từ thiết bị chưa từng sử dụng. Toàn bộ phiên trước đó đã được vô hiệu lực, người dùng được hướng dẫn bật xác thực hai bước. Không phát sinh giao dịch nào trong phiên lạ.',
      summary: 'Người dùng đề nghị kiểm tra phiên đăng nhập và khóa các phiên đáng ngờ.',
      description: 'Người báo cáo nhận được thông báo đăng nhập mới và đề nghị nền tảng kiểm tra giúp. Quản trị viên đối chiếu nhật ký phiên, không ghi nhận thao tác tài chính nào từ phiên lạ.',
      parties: [
        { name: 'Chị Đặng Thanh Tú', role: 'Người báo cáo · Học viên', initials: 'DT' },
        { name: 'Bộ phận vận hành', role: 'Bên xử lý · Nội bộ', initials: 'VH' },
      ],
      evidence: [
        { name: 'nhat-ky-dang-nhan-minh-hoa.txt', kind: 'Tệp văn bản', meta: 'TXT · 16 KB · Trích xuất nhật ký phiên (dữ liệu giả lập)' },
      ],
      excerpt: [],
      timeline: [
        { title: 'Người dùng gửi yêu cầu kiểm tra phiên đăng nhập', at: '2026-09-30T21:48:00+07:00', actor: 'Chị Đặng Thanh Tú', detail: 'Kèm bản chụp thông báo trong ứng dụng.' },
        { title: 'Quản trị viên mở hồ sơ xác minh bảo mật', at: '2026-10-01T07:50:00+07:00', actor: 'Quản trị viên', detail: 'Đối chiếu nhật ký phiên và lịch sử giao dịch.' },
      ],
      resolutions: accountSet,
    },
    {
      id: 'BC-2026-034',
      title: 'Học phí ghi trong hợp đồng khác với tin đăng ban đầu',
      type: 'contract',
      severity: 'high',
      status: 'open',
      reporter: 'Anh Bùi Đức Minh',
      initials: 'BM',
      reporterRole: 'Người học',
      reported: 'Gia sư Vũ Thùy Linh',
      reportedRole: 'Gia sư Hóa học · Lớp 10',
      reference: 'HĐ-2026-0928-018',
      referenceLabel: 'Hợp đồng liên quan',
      scope: 'Điều khoản học phí',
      moneyLock: true,
      heldAmount: 660000,
      assignee: '',
      created: '2026-09-29T19:25:00+07:00',
      summary: 'Chênh lệch mức học phí giữa tin đăng và hợp đồng; cần đối chiếu trước khi giữ khoản đầu tiên.',
      description: 'Người báo cáo phản ánh mức học phí trong bản hợp đồng điện tử cao hơn mức ghi ở tin đăng. Hệ thống minh họa tạm giữ khoản thanh toán đầu tiên để chờ đối chiếu. Chưa có kết luận về bên nào đúng.',
      parties: [
        { name: 'Anh Bùi Đức Minh', role: 'Người báo cáo · Người học', initials: 'BM' },
        { name: 'Gia sư Vũ Thùy Linh', role: 'Bị báo cáo · Gia sư', initials: 'VL' },
      ],
      evidence: [
        { name: 'tin-dang-goc-22-09.png', kind: 'Ảnh chụp màn hình', meta: 'PNG · 720 KB · Bản chụp tin đăng ngày 22/09' },
        { name: 'hop-dong-ban-ky.pdf.txt', kind: 'Tệp văn bản', meta: 'TXT · 24 KB · Bản văn bản hợp đồng đã ký (minh họa)' },
      ],
      excerpt: [
        { author: 'Anh Bùi Đức Minh', side: 'left', time: '19:05', text: 'Tin đăng ghi 200.000 ₫ một buổi nhưng hợp đồng lại thể hiện 220.000 ₫ ạ.' },
      ],
      timeline: [
        { title: 'Người báo cáo gửi phản ánh về điều khoản học phí', at: '2026-09-29T19:25:00+07:00', actor: 'Anh Bùi Đức Minh', detail: 'Đính kèm bản chụp tin đăng và văn bản hợp đồng.' },
      ],
      resolutions: refundSet,
    },
    {
      id: 'BC-2026-033',
      title: 'Cách tính số buổi còn lại của lớp nhóm chưa thống nhất',
      type: 'class',
      severity: 'low',
      status: 'investigating',
      reporter: 'Chị Phạm Ngọc Hân',
      initials: 'PH',
      reporterRole: 'Phụ huynh',
      reported: 'Lớp nhóm "Tiếng Anh giao tiếp cuối tuần"',
      reportedRole: 'Lớp nhóm do gia sư vận hành',
      reference: 'LOP-2026-0044',
      referenceLabel: 'Lớp nhóm liên quan',
      scope: 'Tiến độ lớp nhóm',
      moneyLock: false,
      heldAmount: 0,
      assignee: 'Quản trị viên',
      created: '2026-09-28T09:10:00+07:00',
      summary: 'Bảng tiến độ lớp và tin nhắn trao đổi hiển thị số buổi còn lại khác nhau.',
      description: 'Người báo cáo thắc mắc vì sao bảng tiến độ còn 6 buổi trong khi thông báo lớp nêu 5 buổi. Quản trị viên đối chiếu lịch nghỉ lễ và cách làm tròn số buổi. Vụ việc mức độ thấp, không liên quan tới khoản đang giữ.',
      parties: [
        { name: 'Chị Phạm Ngọc Hân', role: 'Người báo cáo · Phụ huynh', initials: 'PH' },
        { name: 'Gia sư Lê Khánh Toàn', role: 'Người vận hành lớp nhóm', initials: 'LT' },
      ],
      evidence: [
        { name: 'bang-tien-do-lop-nhom.png', kind: 'Ảnh chụp màn hình', meta: 'PNG · 380 KB · Tải lên 28/09 09:10 bởi người báo cáo' },
      ],
      excerpt: [
        { author: 'Chị Phạm Ngọc Hân', side: 'left', time: '08:55', text: 'Chị thấy bảng tiến độ và thông báo lớp lệch nhau một buổi ạ.' },
      ],
      timeline: [
        { title: 'Người báo cáo gửi thắc mắc về tiến độ lớp nhóm', at: '2026-09-28T09:10:00+07:00', actor: 'Chị Phạm Ngọc Hân', detail: 'Đính kèm bản chụp bảng tiến độ.' },
        { title: 'Quản trị viên chuyển hồ sơ sang Đang xác minh', at: '2026-09-28T11:35:00+07:00', actor: 'Quản trị viên', detail: 'Đối chiếu lịch nghỉ lễ và số buổi đã học.' },
      ],
      resolutions: contentSet,
    },
  ];

  const readDecisions = () => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(storageKey) || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
      const valid = {};
      fixtures.forEach(report => {
        const decision = saved[report.id];
        if (!decision || typeof decision !== 'object') return;
        if (!['investigating', 'resolved', 'dismissed'].includes(decision.status)) return;
        if (report.status === 'resolved' || report.status === 'dismissed') return;
        if (typeof decision.reviewedAt !== 'string' || !Number.isFinite(Date.parse(decision.reviewedAt))) return;
        if (typeof decision.note !== 'string' || decision.note.length > 1000) return;
        const closed = decision.status === 'resolved' || decision.status === 'dismissed';
        if (closed && (decision.note.trim().length < 10 || decision.note.trim().length > 1000)) return;
        if (decision.status === 'resolved' && !report.resolutions.some(item => item.key === decision.resolution)) return;
        valid[report.id] = {
          status: decision.status,
          resolution: closed ? decision.resolution : '',
          note: decision.note,
          reviewedAt: decision.reviewedAt,
        };
      });
      return valid;
    } catch {
      return {};
    }
  };

  const list = () => {
    const decisions = readDecisions();
    return fixtures.map(report => {
      const decision = decisions[report.id];
      if (!decision) return { ...report };
      const closed = decision.status !== 'investigating';
      const chosen = report.resolutions.find(item => item.key === decision.resolution);
      const event = {
        title: decision.status === 'investigating'
          ? 'Quản trị viên chuyển hồ sơ sang Đang xác minh'
          : `Quản trị viên kết luận vụ việc: ${statuses[decision.status].label}`,
        at: decision.reviewedAt,
        actor: 'Quản trị viên',
        detail: chosen ? `${chosen.label}. ${decision.note}` : decision.note || 'Đang thu thập thêm dữ liệu đối chiếu.',
      };
      return {
        ...report,
        status: decision.status,
        assignee: 'Quản trị viên',
        resolution: decision.resolution,
        resolutionLabel: chosen ? chosen.label : '',
        decisionNote: decision.note,
        reviewedAt: decision.reviewedAt,
        moneyLock: decision.status === 'resolved' ? false : report.moneyLock,
        timeline: [...report.timeline, event],
        closedSummary: closed ? (chosen ? chosen.detail : '') : '',
      };
    });
  };

  const get = id => list().find(report => report.id === id);

  const decide = (id, payload = {}) => {
    const current = get(id);
    if (!current) throw new Error('Không tìm thấy báo cáo cần xử lý.');
    if (current.status === 'resolved' || current.status === 'dismissed') {
      throw new Error('Vụ việc đã có kết luận và không thể xử lý lần thứ hai.');
    }
    const next = payload.status;
    if (!['investigating', 'resolved', 'dismissed'].includes(next)) {
      throw new Error('Trạng thái xử lý không hợp lệ.');
    }
    if (next === 'investigating' && current.status === 'investigating') {
      throw new Error('Vụ việc đang trong quá trình xác minh.');
    }
    const note = String(payload.note ?? '').trim();
    if (note.length > 1000) throw new Error('Ghi chú xử lý tối đa 1000 ký tự.');
    if (next !== 'investigating' && (note.length < 10 || note.length > 1000)) {
      throw new Error('Kết luận xử lý cần có từ 10 đến 1000 ký tự.');
    }
    let resolution = '';
    if (next === 'resolved') {
      resolution = String(payload.resolution ?? '');
      if (!current.resolutions.some(item => item.key === resolution)) {
        throw new Error('Hãy chọn một phương án xử lý trước khi kết luận.');
      }
    }
    const decisions = readDecisions();
    decisions[id] = { status: next, resolution, note, reviewedAt: new Date().toISOString() };
    // Chỉ ghi nhận sau khi lưu thành công; lỗi lưu được trang xử lý bằng Toast/Alert.
    window.sessionStorage.setItem(storageKey, JSON.stringify(decisions));
    return get(id);
  };

  window.EduReport = Object.freeze({
    statuses: Object.freeze({ ...statuses }),
    severities: Object.freeze({ ...severities }),
    types: Object.freeze({ ...types }),
    list,
    get,
    decide,
  });
})();
