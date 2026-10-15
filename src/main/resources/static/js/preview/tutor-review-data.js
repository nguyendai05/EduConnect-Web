/** Dữ liệu minh họa chung cho hàng đợi và chi tiết duyệt hồ sơ gia sư. Không gọi API. */
(() => {
  // Mã hồ sơ HSGS-90xx là mã giả định của prototype, không ánh xạ tới bản ghi thật nào.
  // mọi thông tin liên hệ đều đã được che; không dùng số điện thoại, email hay mã số thật.
  const fixtures = [
    {
      id: 'HSGS-9041',
      tutor: 'Trần Minh Khoa',
      initials: 'TMK',
      kind: 'first',
      kindLabel: 'Đăng ký lần đầu',
      profileTag: 'Gia sư tự do',
      status: 'pending',
      area: 'tp-hcm',
      region: 'TP. Thủ Đức, TP.HCM',
      areaDetail: 'Linh Chiểu, Hiệp Bình Chánh, Bình Thọ, Tăng Nhơn Phú',
      formats: ['Tại nhà', 'Trực tuyến'],
      school: 'ĐH Sư phạm TP.HCM',
      schoolYears: 'Khóa 2018 – 2022',
      major: 'Sư phạm Toán học',
      faculty: 'Khoa Toán – Tin học',
      educationLevel: 'Đại học',
      educationNote: 'Hệ chính quy 4 năm',
      degreeLabel: 'Tốt nghiệp Cử nhân',
      experienceYears: 4,
      experienceNote: 'Gia sư tư gia & trung tâm ôn thi',
      subjects: [
        { key: 'math', label: 'Toán học', level: 'THPT (Lớp 10 – 12)', rate: 220000, duration: 90 },
        { key: 'math', label: 'Toán học', level: 'THCS (Lớp 6 – 9)', rate: 180000, duration: 90 },
        { key: 'physics', label: 'Vật lý', level: 'THPT (Lớp 10 – 12)', rate: 200000, duration: 90 },
      ],
      files: [
        { name: 'Bang_DaiHoc_SuPham.pdf', type: 'PDF', size: '1,8 MB', uploadedAt: '2026-10-08T14:15:00+07:00', label: 'Bằng tốt nghiệp đại học – xếp loại Giỏi', status: 'pending' },
        { name: 'BangDiem_ToanHoc.pdf', type: 'PDF', size: '2,4 MB', uploadedAt: '2026-10-08T14:18:00+07:00', label: 'Bảng điểm toàn khóa – GPA 3,62/4,0', status: 'pending' },
        { name: 'ChungChi_NghiepVu.jpg', type: 'JPG', size: '1,2 MB', uploadedAt: '2026-10-08T14:20:00+07:00', label: 'Chứng chỉ bồi dưỡng nghiệp vụ sư phạm', status: 'pending' },
      ],
      slots: ['Thứ Hai · 18:00–21:00', 'Thứ Tư · 18:00–21:00', 'Thứ Sáu · 18:30–21:00', 'Thứ Bảy · 08:00–11:30'],
      capacity: 'Đang mở · tối đa 4 lớp đồng thời',
      intro: 'Tôi dạy Toán và Vật lý cho học sinh THCS, THPT, tập trung củng cố nền tảng, giải thích bản chất kiến thức rồi luyện theo từng dạng bài. Mỗi khóa đều có bài kiểm tra đầu vào và báo cáo tiến độ cho phụ huynh sau bốn tuần.',
      contact: { email: 't.m.khoa@••••.test (đã che)', phone: '09•• ••• 812 (đã che)', citizenId: 'CCCD 079••••••012 (đã che)' },
      submitted: '2026-10-08T14:20:00+07:00',
      reviewFlag: 'Tệp bằng cấp có góc phải bị mờ, cần đối chiếu bản gốc.',
      evidenceMissing: [],
    },
    {
      id: 'HSGS-9038',
      tutor: 'Lê Thu Thảo',
      initials: 'LTT',
      kind: 'reverify',
      kindLabel: 'Xác minh lại',
      profileTag: 'Gia sư IELTS',
      status: 'pending',
      area: 'tp-hcm',
      region: 'Quận 1, Bình Thạnh, TP.HCM',
      areaDetail: 'Bến Thành, Đa Kao, Phường 1 – Phường 5 Bình Thạnh',
      formats: ['Trực tuyến'],
      school: 'ĐH Ngoại thương CS2',
      schoolYears: 'Khóa 2017 – 2021',
      major: 'Kinh tế đối ngoại',
      faculty: 'Khoa Kinh tế quốc tế',
      educationLevel: 'Đại học',
      educationNote: 'Cử nhân, chứng chỉ IELTS 8.0',
      degreeLabel: 'Cử nhân · 3 năm KN dạy IELTS',
      experienceYears: 3,
      experienceNote: 'Luyện IELTS Writing & Speaking',
      subjects: [
        { key: 'english', label: 'Tiếng Anh', level: 'THPT (Lớp 10 – 12)', rate: 250000, duration: 90 },
        { key: 'ielts', label: 'IELTS Foundation', level: 'Người đi làm', rate: 300000, duration: 90 },
      ],
      files: [
        { name: 'ChungChi_IELTS_8.0.pdf', type: 'PDF', size: '0,9 MB', uploadedAt: '2026-10-07T16:40:00+07:00', label: 'Chứng chỉ IELTS – cấp ngày 12/03/2025', status: 'pending' },
        { name: 'BangDien_HD.pdf', type: 'PDF', size: '1,5 MB', uploadedAt: '2026-10-07T16:44:00+07:00', label: 'Xác nhận hoàn thành khóa nghiệp vụ giảng dạy', status: 'approved' },
      ],
      slots: ['Thứ Ba · 19:00–21:00', 'Thứ Năm · 19:00–21:00', 'Chủ nhật · 09:00–11:30'],
      capacity: 'Đang mở · tối đa 3 lớp đồng thời',
      intro: 'Tôi hướng dẫn IELTS theo lộ trình 4 kỹ năng, chữa bài Writing chi tiết từng câu và luyện Speaking theo chủ đề thi thật. Học viên theo học trực tuyến là chủ yếu nên tôi có thể sắp xếp linh hoạt khung giờ tối.',
      contact: { email: 'l.t.thao@••••.test (đã che)', phone: '09•• ••• 704 (đã che)', citizenId: 'CCCD 079••••••118 (đã che)' },
      submitted: '2026-10-07T16:45:00+07:00',
      reviewFlag: '',
      evidenceMissing: [],
    },
    {
      id: 'HSGS-9035',
      tutor: 'Phạm Đức Hải',
      initials: 'PDH',
      kind: 'first',
      kindLabel: 'Đăng ký lần đầu',
      profileTag: 'Sinh viên sư phạm',
      status: 'pending',
      area: 'tp-hcm',
      region: 'TP. Thủ Đức, TP.HCM',
      areaDetail: 'Phường Đông Hòa, Khu phố 6, Linh Xuân',
      formats: ['Tại nhà'],
      school: 'ĐH Khoa học Tự nhiên TP.HCM',
      schoolYears: 'Khóa 2022 – 2026',
      major: 'Vật lý học',
      faculty: 'Khoa Vật lý – Vật lý kỹ thuật',
      educationLevel: 'Sinh viên năm 4',
      educationNote: 'Đang học liên thông nghiệp vụ sư phạm',
      degreeLabel: 'Sinh viên năm 4',
      experienceYears: 1,
      experienceNote: 'Trợ giảng phòng thực hành Vật lý',
      subjects: [
        { key: 'physics', label: 'Vật lý', level: 'THPT (Lớp 10 – 12)', rate: 200000, duration: 90 },
        { key: 'math', label: 'Toán học', level: 'THCS (Lớp 6 – 9)', rate: 160000, duration: 90 },
      ],
      files: [
        { name: 'The_Sinh_Vien.jpg', type: 'JPG', size: '0,6 MB', uploadedAt: '2026-10-03T14:05:00+07:00', label: 'Thẻ sinh viên năm thứ tư (mặt trước)', status: 'pending' },
      ],
      slots: ['Thứ Bảy · 13:30–17:00', 'Chủ nhật · 13:30–17:00'],
      capacity: 'Đang mở · tối đa 2 lớp đồng thời',
      intro: 'Em là sinh viên năm 4 ngành Vật lý, có kinh nghiệm trợ giảng phòng thực hành và dạy kèm học sinh lớp 10 – 12. Em ưu tiên giúp các bạn hiểu bản chất hiện tượng trước khi luyện công thức.',
      contact: { email: 'p.d.hai@••••.test (đã che)', phone: '08•• ••• 336 (đã che)', citizenId: 'Chưa tải lên' },
      submitted: '2026-10-03T14:10:00+07:00',
      reviewFlag: 'Chưa có thẻ sinh viên bản rõ nét; thông tin vùng ghi chưa thống nhất.',
      evidenceMissing: ['CCCD/số định danh cá nhân', 'Văn bằng hoặc giấy xác nhận sinh viên có xác thực'],
    },
    {
      id: 'HSGS-9031',
      tutor: 'Nguyễn Bảo Trâm',
      initials: 'NBT',
      kind: 'first',
      kindLabel: 'Đăng ký lần đầu',
      profileTag: 'Giáo viên THPT',
      status: 'pending',
      area: 'ha-noi',
      region: 'Quận Cầu Giấy, Hà Nội',
      areaDetail: 'Dịch Vọng Hậu, Quan Hoa, Nghĩa Đô',
      formats: ['Tại nhà', 'Trực tuyến'],
      school: 'ĐH Sư phạm Hà Nội',
      schoolYears: 'Khóa 2019 – 2023',
      major: 'Sư phạm Ngữ văn',
      faculty: 'Khoa Ngữ văn',
      educationLevel: 'Thạc sĩ',
      educationNote: 'Thạc sĩ Văn học Việt Nam',
      degreeLabel: 'Thạc sĩ · 2 năm KN giảng dạy',
      experienceYears: 2,
      experienceNote: 'Giáo viên Ngữ văn tại trường THPT công lập',
      subjects: [
        { key: 'literature', label: 'Ngữ văn', level: 'THCS (Lớp 6 – 9)', rate: 170000, duration: 90 },
        { key: 'literature', label: 'Ngữ văn', level: 'THPT (Lớp 10 – 12)', rate: 190000, duration: 90 },
      ],
      files: [
        { name: 'Bang_Thac_Si.pdf', type: 'PDF', size: '2,1 MB', uploadedAt: '2026-10-06T09:10:00+07:00', label: 'Bằng thạc sĩ Ngữ văn – ĐH Sư phạm Hà Nội', status: 'approved' },
        { name: 'ChungChi_NVSP.pdf', type: 'PDF', size: '1,1 MB', uploadedAt: '2026-10-06T09:12:00+07:00', label: 'Chứng chỉ nghiệp vụ sư phạm', status: 'approved' },
        { name: 'XacNhan_GiangDay.jpg', type: 'JPG', size: '0,8 MB', uploadedAt: '2026-10-06T09:14:00+07:00', label: 'Xác nhận đang giảng dạy tại trường THPT', status: 'pending' },
      ],
      slots: ['Thứ Ba · 18:30–20:30', 'Thứ Năm · 18:30–20:30', 'Chủ nhật · 08:00–11:00'],
      capacity: 'Đang mở · tối đa 3 lớp đồng thời',
      intro: 'Tôi dạy Ngữ văn theo hướng xây dựng dàn ý và phản biện cùng học sinh, không học thuộc văn mẫu. Với học sinh lớp 12, tôi luyện song song nghị luận xã hội và nghị luận văn học kèm nhận xét chi tiết mỗi bài viết.',
      contact: { email: 'n.b.tram@••••.test (đã che)', phone: '02•• ••• 951 (đã che)', citizenId: 'CCCD 001••••••044 (đã che)' },
      submitted: '2026-10-06T09:15:00+07:00',
      reviewFlag: '',
      evidenceMissing: [],
    },
    {
      id: 'HSGS-9024',
      tutor: 'Đỗ Hoàng Long',
      initials: 'ĐHL',
      kind: 'first',
      kindLabel: 'Đăng ký lần đầu',
      profileTag: 'Kỹ sư hóa học',
      status: 'verified',
      area: 'tp-hcm',
      region: 'Quận 5, TP.HCM',
      areaDetail: 'Phường 1 – Phường 9 Quận 5, giáp Quận 8',
      formats: ['Trực tuyến'],
      school: 'ĐH Bách khoa TP.HCM',
      schoolYears: 'Khóa 2014 – 2018',
      major: 'Kỹ thuật Hóa học',
      faculty: 'Khoa Kỹ thuật Hóa học',
      educationLevel: 'Đại học',
      educationNote: 'Kỹ sư, chứng chỉ IELTS 7.0',
      degreeLabel: 'Kỹ sư · 5 năm KN giảng dạy',
      experienceYears: 5,
      experienceNote: 'Dạy Hóa THPT và luyện thi ĐGNL',
      subjects: [
        { key: 'chemistry', label: 'Hóa học', level: 'THPT (Lớp 10 – 12)', rate: 240000, duration: 90 },
        { key: 'chemistry', label: 'Hóa học', level: 'THCS (Lớp 8 – 9)', rate: 210000, duration: 90 },
      ],
      files: [
        { name: 'Bang_KySu.pdf', type: 'PDF', size: '1,9 MB', uploadedAt: '2026-09-18T10:00:00+07:00', label: 'Bằng kỹ sư Kỹ thuật Hóa học', status: 'approved' },
        { name: 'BangDiem_ToanKhoa.pdf', type: 'PDF', size: '2,7 MB', uploadedAt: '2026-09-18T10:04:00+07:00', label: 'Bảng điểm toàn khóa', status: 'approved' },
        { name: 'CCCD_dao_mat.jpg', type: 'JPG', size: '0,7 MB', uploadedAt: '2026-09-18T10:06:00+07:00', label: 'Ảnh định danh đã che số', status: 'approved' },
        { name: 'XacNhan_Luong.pdf', type: 'PDF', size: '0,5 MB', uploadedAt: '2026-09-18T10:08:00+07:00', label: 'Xác nhận hoàn thành khóa phương pháp giảng dạy', status: 'approved' },
      ],
      slots: ['Thứ Hai · 20:00–21:30', 'Thứ Tư · 20:00–21:30', 'Thứ Bảy · 09:00–11:00'],
      capacity: 'Đang mở · tối đa 5 lớp đồng thời',
      intro: 'Tôi dạy Hóa theo hệ thống chuyên đề: lý thuyết nền, bài tập định lượng và dạng đề thi đánh giá năng lực. Học viên được cấp bộ đề tự luyện kèm lời giải sau mỗi chuyên đề.',
      contact: { email: 'd.h.long@••••.test (đã che)', phone: '09•• ••• 208 (đã che)', citizenId: 'CCCD 079••••••208 (đã che)' },
      submitted: '2026-09-18T10:10:00+07:00',
      reviewedAt: '2026-09-19T08:30:00+07:00',
      reviewer: 'Quản trị viên · Nguyễn Xuân Đại',
      reviewFlag: '',
      evidenceMissing: [],
    },
    {
      id: 'HSGS-9018',
      tutor: 'Vũ Nguyễn Hương',
      initials: 'VNH',
      kind: 'reverify',
      kindLabel: 'Xác minh lại',
      profileTag: 'Gia sư Tiếng Anh',
      status: 'verified',
      area: 'ha-noi',
      region: 'Quận Đống Đa, Hà Nội',
      areaDetail: 'Láng Thượng, Trung Liệt, Cát Linh',
      formats: ['Tại nhà', 'Trực tuyến'],
      school: 'ĐH Hà Nội',
      schoolYears: 'Khóa 2015 – 2019',
      major: 'Ngôn ngữ Anh',
      faculty: 'Khoa Ngôn ngữ Anh',
      educationLevel: 'Đại học',
      educationNote: 'Cử nhân, chứng chỉ TESOL',
      degreeLabel: 'Cử nhân · 6 năm KN giảng dạy',
      experienceYears: 6,
      experienceNote: 'Tiếng Anh thiếu nhi và giao tiếp người đi làm',
      subjects: [
        { key: 'english', label: 'Tiếng Anh', level: 'THCS (Lớp 6 – 9)', rate: 220000, duration: 90 },
        { key: 'english', label: 'Tiếng Anh', level: 'Người đi làm', rate: 320000, duration: 90 },
      ],
      files: [
        { name: 'Bang_Cu_Nhan.pdf', type: 'PDF', size: '1,6 MB', uploadedAt: '2026-09-10T20:15:00+07:00', label: 'Bằng cử nhân Ngôn ngữ Anh', status: 'approved' },
        { name: 'ChungChi_TESOL.pdf', type: 'PDF', size: '1,2 MB', uploadedAt: '2026-09-10T20:18:00+07:00', label: 'Chứng chỉ TESOL 120 giờ', status: 'approved' },
      ],
      slots: ['Thứ Ba · 19:00–20:30', 'Thứ Năm · 19:00–20:30', 'Chủ nhật · 15:00–17:00'],
      capacity: 'Đang mở · tối đa 4 lớp đồng thời',
      intro: 'Tôi dạy Tiếng Anh giao tiếp và hỗ trợ học sinh THCS củng cố ngữ pháp, phát âm. Giáo án xây dựng theo tình huống thực tế, học viên được ghi âm bài nói và nhận xét từng tuần.',
      contact: { email: 'v.n.huong@••••.test (đã che)', phone: '08•• ••• 415 (đã che)', citizenId: 'CCCD 001••••••077 (đã che)' },
      submitted: '2026-09-10T20:20:00+07:00',
      reviewedAt: '2026-09-11T09:05:00+07:00',
      reviewer: 'Quản trị viên · Nguyễn Xuân Đại',
      reviewFlag: '',
      evidenceMissing: [],
    },
    {
      id: 'HSGS-9012',
      tutor: 'Ngô Gia Hân',
      initials: 'NGH',
      kind: 'first',
      kindLabel: 'Đăng ký lần đầu',
      profileTag: 'Sư phạm Hóa học',
      status: 'verified',
      area: 'can-tho',
      region: 'Ninh Kiều, Cần Thơ',
      areaDetail: 'Phường Xuân Khánh, An Hòa, Cái Khế',
      formats: ['Tại nhà'],
      school: 'ĐH Cần Thơ',
      schoolYears: 'Khóa 2018 – 2022',
      major: 'Sư phạm Hóa học',
      faculty: 'Khoa Sư phạm',
      educationLevel: 'Đại học',
      educationNote: 'Cử nhân sư phạm hạng Giỏi',
      degreeLabel: 'Cử nhân · 3 năm KN giảng dạy',
      experienceYears: 3,
      experienceNote: 'Dạy Hóa THCS và ôn thi vào lớp 10',
      subjects: [
        { key: 'chemistry', label: 'Hóa học', level: 'THCS (Lớp 8 – 9)', rate: 165000, duration: 90 },
      ],
      files: [
        { name: 'Bang_SP_Hoa.pdf', type: 'PDF', size: '1,4 MB', uploadedAt: '2026-09-02T08:30:00+07:00', label: 'Bằng cử nhân Sư phạm Hóa học', status: 'approved' },
        { name: 'GiayXacNhan_Giang.jpg', type: 'JPG', size: '0,9 MB', uploadedAt: '2026-09-02T08:34:00+07:00', label: 'Giấy xác nhận giảng dạy tại trung tâm', status: 'approved' },
      ],
      slots: ['Thứ Tư · 17:30–19:00', 'Thứ Sáu · 17:30–19:00'],
      capacity: 'Đang mở · tối đa 3 lớp đồng thời',
      intro: 'Tôi dạy Hóa THCS theo sát sách giáo khoa, bổ sung thí nghiệm mô phỏng để học sinh nhớ hiện tượng thay vì học thuộc. Có báo cáo tiến độ cho phụ huynh mỗi tháng.',
      contact: { email: 'n.g.han@••••.test (đã che)', phone: '09•• ••• 630 (đã che)', citizenId: 'CCCD 092••••••011 (đã che)' },
      submitted: '2026-09-02T08:35:00+07:00',
      reviewedAt: '2026-09-03T14:00:00+07:00',
      reviewer: 'Quản trị viên · Nguyễn Xuân Đại',
      reviewFlag: '',
      evidenceMissing: [],
    },
    {
      id: 'HSGS-9007',
      tutor: 'Trịnh Phú Quý',
      initials: 'TPQ',
      kind: 'first',
      kindLabel: 'Đăng ký lần đầu',
      profileTag: 'Gia sư tự do',
      status: 'rejected',
      area: 'tp-hcm',
      region: 'Quận 12, TP.HCM',
      areaDetail: 'Hiệp Thành, Tân Thới Nhất',
      formats: ['Tại nhà'],
      school: 'ĐH Công nghiệp TP.HCM',
      schoolYears: 'Khóa 2020 – 2024',
      major: 'Quản trị kinh doanh',
      faculty: 'Khoa Quản trị',
      educationLevel: 'Đại học',
      educationNote: 'Cử nhân, không có chứng chỉ sư phạm',
      degreeLabel: 'Cử nhân · 1 năm KN',
      experienceYears: 1,
      experienceNote: 'Dạy kèm Toán THCS tự do',
      subjects: [
        { key: 'math', label: 'Toán học', level: 'THCS (Lớp 6 – 9)', rate: 150000, duration: 90 },
      ],
      files: [
        { name: 'Bang_Cu_Nhan_QT.pdf', type: 'PDF', size: '1,7 MB', uploadedAt: '2026-09-25T21:00:00+07:00', label: 'Bằng cử nhân Quản trị kinh doanh', status: 'approved' },
        { name: 'Minh_Chung_Kinh_Nghiem.jpg', type: 'JPG', size: '0,4 MB', uploadedAt: '2026-09-25T21:04:00+07:00', label: 'Ảnh chụp giấy xác nhận (không rõ nội dung)', status: 'rejected' },
      ],
      slots: ['Thứ Bảy · 08:00–10:00'],
      capacity: 'Tạm khóa · chờ bổ sung hồ sơ',
      intro: 'Tôi nhận dạy Toán cho học sinh THCS tại khu vực Quận 12, ưu tiên luyện lại căn bản đại số cho các em bị hổng kiến thức.',
      contact: { email: 't.p.quy@••••.test (đã che)', phone: '07•• ••• 559 (đã che)', citizenId: 'CCCD 079••••••355 (đã che)' },
      submitted: '2026-09-25T21:05:00+07:00',
      reviewedAt: '2026-09-26T10:20:00+07:00',
      reviewer: 'Quản trị viên · Nguyễn Xuân Đại',
      reason: 'Hồ sơ thiếu chứng chỉ nghiệp vụ sư phạm và tệp xác nhận kinh nghiệm không đọc được nội dung. Vui lòng tải lại tệp rõ nét và bổ sung chứng chỉ giảng dạy trước khi gửi lại hồ sơ.',
      reviewFlag: 'Đã từ chối; gia sư cần bổ sung minh chứng.',
      evidenceMissing: ['Chứng chỉ nghiệp vụ sư phạm'],
    },
    {
      id: 'HSGS-9002',
      tutor: 'Bùi Khánh Vy',
      initials: 'BKV',
      kind: 'first',
      kindLabel: 'Đăng ký lần đầu',
      profileTag: 'Sinh viên năm 3',
      status: 'draft',
      area: 'tp-hcm',
      region: 'Quận Bình Thạnh, TP.HCM',
      areaDetail: 'Phường 12, Phường 17',
      formats: ['Trực tuyến'],
      school: 'ĐH Sư phạm TP.HCM',
      schoolYears: 'Khóa 2023 – 2027',
      major: 'Sư phạm Tiếng Anh',
      faculty: 'Khoa Tiếng Anh',
      educationLevel: 'Sinh viên năm 3',
      educationNote: 'Chưa hoàn tất học phần thực tập sư phạm',
      degreeLabel: 'Chưa cập nhật bằng cấp',
      experienceYears: 0,
      experienceNote: 'Chưa ghi nhận kinh nghiệm giảng dạy',
      subjects: [
        { key: 'english', label: 'Tiếng Anh', level: 'THCS (Lớp 6 – 9)', rate: 150000, duration: 60 },
      ],
      files: [],
      slots: [],
      capacity: 'Chưa bật nhận lớp',
      intro: 'Phần giới thiệu đang soạn.',
      contact: { email: 'Chưa cập nhật', phone: 'Chưa cập nhật', citizenId: 'Chưa cập nhật' },
      submitted: '2026-10-05T11:30:00+07:00',
      updatedAt: '2026-10-09T07:45:00+07:00',
      reviewFlag: '',
      evidenceMissing: ['Bằng cấp/chứng chỉ', 'Lịch rảnh', 'Thông tin liên hệ'],
    },
  ];

  const statuses = {
    pending: { label: 'Chờ duyệt', summary: 'chờ duyệt', badge: 'badge--warning' },
    verified: { label: 'Đã duyệt', summary: 'đã duyệt', badge: 'badge--success' },
    rejected: { label: 'Từ chối', summary: 'bị từ chối', badge: 'badge--danger' },
    draft: { label: 'Bản nháp', summary: 'ở dạng nháp', badge: 'badge--neutral' },
  };

  const storageKey = 'educonnect:tutor-review-decisions:v1';

  const readDecisions = () => {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(storageKey) || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
      const valid = {};
      fixtures.forEach(profile => {
        const decision = saved[profile.id];
        if (!decision || !['verified', 'rejected'].includes(decision.status)) return;
        if (typeof decision.reviewedAt !== 'string' || !Number.isFinite(Date.parse(decision.reviewedAt))) return;
        if (typeof decision.reason !== 'string' || decision.reason.length > 1000) return;
        if (decision.status === 'rejected' && decision.reason.trim().length < 10) return;
        // Chỉ chấp nhận quyết định cho hồ sơ đang chờ duyệt; hồ sơ nháp/đã xử lý bị bỏ qua.
        if (profile.status !== 'pending') return;
        valid[profile.id] = { status: decision.status, reason: decision.reason, reviewedAt: decision.reviewedAt };
      });
      return valid;
    } catch {
      return {};
    }
  };

  const decorate = (profile, decision) => {
    const status = decision ? decision.status : profile.status;
    return {
      ...profile,
      ...decision,
      status,
      subjectKeys: [...new Set(profile.subjects.map(subject => subject.key))],
      subjectLabels: profile.subjects.map(subject => `${subject.label} · ${subject.level}`),
      rateFrom: Math.min(...profile.subjects.map(subject => subject.rate)),
      durationFrom: profile.subjects[0].duration,
      fileTotal: profile.files.length,
      fileApproved: profile.files.filter(file => file.status === 'approved').length,
      filePending: profile.files.filter(file => file.status === 'pending').length,
      fileRejected: profile.files.filter(file => file.status === 'rejected').length,
      // Không bao giờ suy ra "đã duyệt" từ trạng thái tệp tin; chỉ trạng thái hồ sơ quyết định.
      isVerified: status === 'verified',
      isReviewable: status === 'pending' && profile.evidenceMissing.length === 0,
      blockedReason: profile.evidenceMissing.length ? profile.evidenceMissing.join(' · ') : '',
      statusLabel: statuses[status].label,
      statusBadge: statuses[status].badge,
    };
  };

  const list = () => {
    const decisions = readDecisions();
    return fixtures.map(profile => decorate(profile, decisions[profile.id]));
  };

  const get = id => list().find(profile => profile.id === id);

  const review = (id, nextStatus, reason = '') => {
    const profile = get(id);
    if (!profile || profile.status !== 'pending') throw new Error('Hồ sơ không còn ở trạng thái chờ duyệt.');
    if (!['verified', 'rejected'].includes(nextStatus)) throw new Error('Trạng thái duyệt không hợp lệ.');
    if (nextStatus === 'verified' && profile.evidenceMissing.length) throw new Error('Chưa thể xác minh khi hồ sơ còn thiếu chứng thực cơ bản.');
    const trimmedReason = String(reason).trim();
    if (nextStatus === 'rejected' && (trimmedReason.length < 10 || trimmedReason.length > 1000)) throw new Error('Lý do từ chối cần có từ 10 đến 1000 ký tự.');
    const decisions = readDecisions();
    decisions[id] = { status: nextStatus, reason: nextStatus === 'rejected' ? trimmedReason : '', reviewedAt: new Date().toISOString() };
    // Chỉ đổi trạng thái sau khi lưu thành công; lỗi lưu được trang xử lý bằng Alert/Toast.
    window.sessionStorage.setItem(storageKey, JSON.stringify(decisions));
    return get(id);
  };

  window.EduTutorReview = Object.freeze({ list, get, review, statuses, storageKey });
})();
