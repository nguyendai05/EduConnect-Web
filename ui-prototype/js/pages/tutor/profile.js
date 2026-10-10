/* Hồ sơ gia sư tĩnh: đọc mã gia sư từ ?id và dựng đúng gia sư đó. Không gọi API. */
(() => {
  const page = document.querySelector('[data-tutor-profile-page]')
  if (!page) return

  const currency = value => `${new Intl.NumberFormat('vi-VN').format(value)} ₫`

  const TUTORS = {
    'GS-01': {
      id: 'GS-01',
      name: 'Nguyễn Minh Anh',
      initials: 'MA',
      subjects: 'Toán · Vật lý',
      rating: '4,9',
      ratingCount: 126,
      experience: '5 năm kinh nghiệm',
      classes: '84 lớp đã dạy',
      location: 'TP. Thủ Đức, TP.HCM',
      delivery: 'Dạy tại nhà & trực tuyến',
      online: 'Đang nhận học viên',
      about: [
        'Tôi có 5 năm kinh nghiệm giảng dạy Toán và Vật lý cho học sinh THCS, THPT. Phương pháp học tập tập trung vào việc củng cố kiến thức nền, hiểu bản chất và luyện kỹ năng giải bài thay vì học thuộc công thức.',
        'Tôi thường xây dựng lộ trình riêng dựa trên năng lực hiện tại và mục tiêu của từng học sinh, phối hợp đều đặn cùng gia đình để cập nhật tiến độ sau từng buổi học.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Đại học Sư phạm chính quy', note: 'Trường Đại học Sư phạm TP. Hồ Chí Minh' },
        { label: 'Chuyên ngành chính', title: 'Sư phạm Toán học', note: 'Tốt nghiệp loại Giỏi (GPA 3.65 / 4.0)' },
        { label: 'Thâm niên giảng dạy', title: '5 năm tích lũy', note: 'Chuyên luyện thi vào 10 và thi tốt nghiệp THPT' },
        { label: 'Hồ sơ hoàn thành', title: '84 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Toán', grade: 'THPT', price: 200000, desc: 'Khối 10, 11, 12 và ôn thi Tốt nghiệp THPT Quốc gia.' },
        { subject: 'Toán', grade: 'THCS', price: 180000, desc: 'Toán lớp 6–9, củng cố mất gốc và luyện thi chuyển cấp vào 10.' },
        { subject: 'Vật lý', grade: 'THPT', price: 220000, desc: 'Vật lý 10, 11, 12, giải thích hiện tượng và bồi dưỡng tư duy đề thi.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: '18:00–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 3', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 4', time: '18:00–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 5', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 6', time: '18:30–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 7', time: '08:00–11:30', period: 'Buổi sáng', available: true },
        { day: 'Chủ nhật', time: 'Đã kín lịch', period: '—', available: false }
      ],
      certificates: [
        { name: 'Bằng tốt nghiệp Đại học Sư phạm', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Chứng chỉ nghiệp vụ sư phạm', meta: 'Hình ảnh JPG · Đã đối soát CCCD' }
      ],
      reviews: [
        { author: 'Chị Hương', initials: 'H', sub: 'Phụ huynh em Bảo Long (Lớp 11)', time: '2 tháng trước', score: 5, text: '“Thầy giảng rất dễ hiểu, con tôi tiến bộ rõ sau khoảng hai tháng học. Từ chỗ sợ môn Toán, con đã tự tin làm được các bài vận dụng cao.”' },
        { author: 'Anh Minh', initials: 'M', sub: 'Phụ huynh em Quốc Anh (Lớp 9)', time: '3 tháng trước', score: 5, text: '“Có lộ trình rõ ràng và luôn gửi nhận xét sau buổi học. Thầy rèn cách trình bày tự luận Toán vào 10 cực kỳ chỉn chu.”' },
        { author: 'Chị Thu', initials: 'T', sub: 'Phụ huynh em Linh Đan (Lớp 12)', time: '4 tháng trước', score: 4, text: '“Kiến thức chắc, đúng giờ và trao đổi với phụ huynh rất kỹ. Thầy cho bài tập vừa sức và sửa bài cặn kẽ.”' }
      ]
    },
    'GS-02': {
      id: 'GS-02',
      name: 'Trần Quốc Huy',
      initials: 'QH',
      subjects: 'Tiếng Anh · IELTS',
      rating: '4,8',
      ratingCount: 89,
      experience: '4 năm kinh nghiệm',
      classes: '62 lớp đã dạy',
      location: 'Quận 7, TP.HCM',
      delivery: 'Dạy trực tuyến & tại nhà',
      online: 'Đang nhận học viên',
      about: [
        'Tôi tốt nghiệp Cử nhân ĐH Sư phạm với chứng chỉ IELTS 8.0, chuyên luyện thi chứng chỉ và phát triển kỹ năng nghe – nói cho học sinh phổ thông cùng người đi làm.',
        'Giáo án được thiết kế theo từng chủ đề thi thật, kết hợp chữa chi tiết Writing và luyện Speaking phản xạ, có ghi âm và nhận xét hằng tuần.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Cử nhân Sư phạm English', note: 'Trường Đại học Sư phạm TP. Hồ Chí Minh' },
        { label: 'Chứng chỉ quốc tế', title: 'IELTS 8.0', note: 'Cấp tháng 03/2025 · kỹ năng Nói 7.5' },
        { label: 'Thâm niên giảng dạy', title: '4 năm tích lũy', note: 'Luyện IELTS và tiếng Anh giao tiếp' },
        { label: 'Hồ sơ hoàn thành', title: '62 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Tiếng Anh', grade: 'THPT', price: 250000, desc: 'Tiếng Anh 10–12, trọng ngữ và ôn thi tốt nghiệp.' },
        { subject: 'IELTS', grade: 'Người đi làm', price: 300000, desc: 'Lộ trình 4 kỹ năng, chữa Writing & luyện Speaking đề thật.' },
        { subject: 'Tiếng Anh', grade: 'THCS', price: 220000, desc: 'Tiếng Anh lớp 6–9, củng cố ngữ pháp và phát âm.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 3', time: '19:00–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 4', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 5', time: '19:00–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 6', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 7', time: '09:00–11:30', period: 'Buổi sáng', available: true },
        { day: 'Chủ nhật', time: '09:00–11:30', period: 'Buổi sáng', available: true }
      ],
      certificates: [
        { name: 'Bằng cử nhân Sư phạm Tiếng Anh', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Chứng chỉ IELTS 8.0', meta: 'Tài liệu PDF · Đã đối soát mã tra cứu' }
      ],
      reviews: [
        { author: 'Chị Lan', initials: 'L', sub: 'Phụ huynh em Mỹ Anh (Lớp 11)', time: '1 tháng trước', score: 5, text: '“Thầy sửa Writing rất kỹ, cháu tăng từ 5.5 lên 6.5 sau hai tháng. Cách dạy gần gũi, đúng giờ.”' },
        { author: 'Anh Dũng', initials: 'D', sub: 'Học viên IELTS 6.5', time: '2 tháng trước', score: 5, text: '“Luyện Speaking theo chủ đề thi thật, được ghi âm và nhận xét từng câu nên tiến bộ rõ.”' },
        { author: 'Chị Ngọc', initials: 'N', sub: 'Phụ huynh em Gia Hân (Lớp 8)', time: '3 tháng trước', score: 4, text: '“Con tự tin phát âm hơn, cần thêm bài tập về nhà vừa sức để bé luyện đều.”' }
      ]
    },
    'GS-03': {
      id: 'GS-03',
      name: 'Lê Thảo Vy',
      initials: 'TV',
      subjects: 'Ngữ văn · Luyện viết',
      rating: '4,9',
      ratingCount: 61,
      experience: '3 năm kinh nghiệm',
      classes: '45 lớp đã dạy',
      location: 'Bình Thạnh, TP.HCM',
      delivery: 'Dạy tại nhà',
      online: 'Đang nhận học viên',
      about: [
        'Tôi tốt nghiệp xuất sắc ĐH Khoa học Xã hội & Nhân văn, giúp học sinh nắm vững phương pháp làm bài và cảm thụ văn học thay vì học thuộc văn mẫu.',
        'Tôi rèn kỹ năng dựng dàn ý, nghị luận xã hội và nghị luận văn học qua phản biện trực tiếp, kèm nhận xét chi tiết cho mỗi bài viết.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Cử nhân Ngữ văn', note: 'Trường ĐH Khoa học Xã hội & Nhân văn' },
        { label: 'Chuyên ngành chính', title: 'Văn học Việt Nam', note: 'Tốt nghiệp xuất sắc (GPA 3.72 / 4.0)' },
        { label: 'Thâm niên giảng dạy', title: '3 năm tích lũy', note: 'Ngữ văn THCS và luyện thi vào 10' },
        { label: 'Hồ sơ hoàn thành', title: '45 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Ngữ văn', grade: 'THCS', price: 180000, desc: 'Ngữ văn 6–9, rèn cảm thụ và kỹ năng làm bài tự luận.' },
        { subject: 'Ngữ văn', grade: 'THPT', price: 200000, desc: 'Nghị luận xã hội & văn học, ôn thi vào 10 và tốt nghiệp.' },
        { subject: 'Luyện viết', grade: 'THCS', price: 160000, desc: 'Rèn chữ, dựng dàn ý và sửa lỗi diễn đạt cho học sinh.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 3', time: '18:00–20:30', period: 'Buổi tối', available: true },
        { day: 'Thứ 4', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 5', time: '18:00–20:30', period: 'Buổi tối', available: true },
        { day: 'Thứ 6', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 7', time: '08:00–11:00', period: 'Buổi sáng', available: true },
        { day: 'Chủ nhật', time: 'Đã kín lịch', period: '—', available: false }
      ],
      certificates: [
        { name: 'Bằng cử nhân Ngữ văn', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Chứng chỉ bồi dưỡng nghiệp vụ sư phạm', meta: 'Tài liệu PDF · Đã duyệt' }
      ],
      reviews: [
        { author: 'Chị Hà', initials: 'H', sub: 'Phụ huynh em Bảo Ngọc (Lớp 9)', time: '1 tháng trước', score: 5, text: '“Cô hướng dẫn con lập dàn ý rất logic, bài văn có chiều hơn hẳn. Cô nhiệt tình sửa từng câu.”' },
        { author: 'Anh Tuấn', initials: 'T', sub: 'Phụ huynh em Minh Khuê (Lớp 6)', time: '2 tháng trước', score: 5, text: '“Con hết sợ môn Văn, biết cách cảm thụ tác phẩm và viết mạch lạc hơn.”' },
        { author: 'Chị Oanh', initials: 'O', sub: 'Phụ huynh em Thu Trang (Lớp 12)', time: '4 tháng trước', score: 4, text: '“Kiến thức chắc, đúng giờ, đề cương sát cấu trúc đề thi. Cần thêm thời lượng luyện nghị luận xã hội.”' }
      ]
    },
    'GS-04': {
      id: 'GS-04',
      name: 'Phạm Hoàng Long',
      initials: 'PL',
      subjects: 'Toán · Vật lý',
      rating: '5,0',
      ratingCount: 42,
      experience: '6 năm kinh nghiệm',
      classes: '110 lớp đã dạy',
      location: 'Quận 3, TP.HCM',
      delivery: 'Dạy tại nhà & trực tuyến',
      online: 'Đang nhận học viên',
      about: [
        'Tôi là Thạc sĩ Toán ứng dụng ĐH Bách Khoa, chuyên bồi dưỡng học sinh giỏi và luyện thi THPT Quốc gia các môn Toán – Vật lý.',
        'Tôi xây dựng hệ thống chuyên đề kèm bộ đề tự luyện theo mức độ, giúp học sinh vững bản chất trước khi luyện đề vận dụng cao.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Thạc sĩ Toán ứng dụng', note: 'Trường ĐH Bách khoa TP. Hồ Chí Minh' },
        { label: 'Chuyên ngành chính', title: 'Toán ứng dụng', note: 'Cử nhân loại Giỏi, Thạc sĩ đúng chuyên ngành' },
        { label: 'Thâm niên giảng dạy', title: '6 năm tích lũy', note: 'Bồi dưỡng học sinh giỏi và luyện thi Quốc gia' },
        { label: 'Hồ sơ hoàn thành', title: '110 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Toán', grade: 'Luyện thi', price: 300000, desc: 'Luyện thi THPT Quốc gia theo chuyên đề và đề vận dụng cao.' },
        { subject: 'Toán', grade: 'THPT', price: 280000, desc: 'Toán 10–12, bồi dưỡng học sinh giỏi và củng cố nền tảng.' },
        { subject: 'Vật lý', grade: 'THPT', price: 260000, desc: 'Vật lý 10–12, phân tích hiện tượng và phương pháp giải đề.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 3', time: '18:30–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 4', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 5', time: '18:30–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 6', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 7', time: '08:00–11:30', period: 'Buổi sáng', available: true },
        { day: 'Chủ nhật', time: 'Đã kín lịch', period: '—', available: false }
      ],
      certificates: [
        { name: 'Bằng Thạc sĩ Toán ứng dụng', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Bằng cử nhân Sư phạm Toán học', meta: 'Tài liệu PDF · Đã đối soát CCCD' }
      ],
      reviews: [
        { author: 'Chị Mai', initials: 'M', sub: 'Phụ huynh em Đăng Khoa (Lớp 12)', time: '1 tháng trước', score: 5, text: '“Thầy bám sát đề thi thật, con đạt 9.0 Toán tốt nghiệp. Hệ thống chuyên đề rất rõ ràng.”' },
        { author: 'Anh Phúc', initials: 'P', sub: 'Phụ huynh em Bảo Nam (Lớp 10)', time: '2 tháng trước', score: 5, text: '“Con được bồi dưỡng học sinh giỏi và tự tin hơn hẳn khi làm bài vận dụng cao.”' },
        { author: 'Chị Yến', initials: 'Y', sub: 'Phụ huynh em Hải Đăng (Lớp 11)', time: '3 tháng trước', score: 5, text: '“Dạy Vật lý hiểu bản chất hiện tượng trước khi dùng công thức, cháu rất thích.”' }
      ]
    },
    'GS-05': {
      id: 'GS-05',
      name: 'Võ Minh Khôi',
      initials: 'MK',
      subjects: 'Toán · Vật lý',
      rating: '4,7',
      ratingCount: 64,
      experience: '3 năm kinh nghiệm',
      classes: '38 lớp đã dạy',
      location: 'TP. Thủ Đức, TP.HCM',
      delivery: 'Dạy tại nhà & trực tuyến',
      online: 'Đang nhận học viên',
      about: [
        'Tôi tốt nghiệp ĐH Khoa học Tự nhiên, chuyên kèm Toán và Vật lý cho học sinh THPT, tập trung vào phần hàm số và hình học không gian – hai nội dung học sinh lớp 11 thường mất gốc.',
        'Tôi xây dựng bộ bài tập phân tầng theo mức độ, giúp học sinh lấy lại nền tảng trước khi tăng tốc luyện đề, và gửi nhận xét tiến độ sau mỗi buổi học.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Cử nhân Khoa học Tự nhiên', note: 'Trường ĐH Khoa học Tự nhiên – ĐHQG TP. Hồ Chí Minh' },
        { label: 'Chuyên ngành chính', title: 'Toán học', note: 'Chuyên đề hàm số và hình học không gian' },
        { label: 'Thâm niên giảng dạy', title: '3 năm tích lũy', note: 'Luyện Toán – Vật lý chương trình THPT' },
        { label: 'Hồ sơ hoàn thành', title: '38 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Toán', grade: 'THPT', price: 200000, desc: 'Toán 10–12, trọng tâm hàm số và hình học không gian.' },
        { subject: 'Toán', grade: 'Luyện thi', price: 220000, desc: 'Luyện thi tốt nghiệp THPT theo chuyên đề và đề vận dụng.' },
        { subject: 'Vật lý', grade: 'THPT', price: 190000, desc: 'Vật lý 10–12, phương pháp giải bài tập và trắc nghiệm.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 3', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 4', time: '19:00–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 5', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 6', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 7', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Chủ nhật', time: '09:00–11:00', period: 'Buổi sáng', available: true }
      ],
      certificates: [
        { name: 'Bằng cử nhân Toán học', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Chứng nhận bồi dưỡng nghiệp vụ sư phạm', meta: 'Tài liệu PDF · Đã duyệt' }
      ],
      reviews: [
        { author: 'Chị Lan', initials: 'L', sub: 'Phụ huynh em Minh Thư (Lớp 11)', time: '1 tháng trước', score: 5, text: '“Thầy giảng hình học không gian rất trực quan, con hiểu bản chất và tự làm được bài vận dụng.”' },
        { author: 'Anh Khoa', initials: 'K', sub: 'Phụ huynh em Đăng Khoa (Lớp 10)', time: '2 tháng trước', score: 4, text: '“Bài tập phân tầng vừa sức, thầy sửa chi tiết. Cần thêm thời lượng ôn phần hàm số.”' },
        { author: 'Chị Hạnh', initials: 'H', sub: 'Phụ huynh em Bảo An (Lớp 12)', time: '4 tháng trước', score: 5, text: '“Đúng giờ, có lộ trình rõ ràng, con tiến bộ đều sau mỗi buổi.”' }
      ]
    },
    'GS-06': {
      id: 'GS-06',
      name: 'Đặng Thu Trang',
      initials: 'TT',
      subjects: 'Toán · Ngữ văn',
      rating: '4,9',
      ratingCount: 73,
      experience: '5 năm kinh nghiệm',
      classes: '58 lớp đã dạy',
      location: 'Quận 9, TP.HCM',
      delivery: 'Dạy tại nhà & trực tuyến',
      online: 'Đang nhận học viên',
      about: [
        'Tôi tốt nghiệp ĐH Sư phạm TP.HCM, kèm cả Toán và Ngữ văn cho học sinh THCS – THPT. Tôi ưu tiên phương pháp gợi mở để học sinh tự phát hiện lỗi sai và hình thành thói quen trình bày mạch lạc.',
        'Với Ngữ văn, tôi có giáo án nghị luận xã hội theo dạng đề mở, hướng dẫn học sinh dựng dàn ý và tìm dẫn chứng phù hợp cho mỗi bài viết.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Cử nhân Sư phạm', note: 'Trường ĐH Sư phạm TP. Hồ Chí Minh' },
        { label: 'Chuyên ngành chính', title: 'Toán & Ngữ văn', note: 'Bồi dưỡng nền tảng và luyện thi chuyển cấp' },
        { label: 'Thâm niên giảng dạy', title: '5 năm tích lũy', note: 'Kèm sát theo từng chủ đề học sinh đang mất gốc' },
        { label: 'Hồ sơ hoàn thành', title: '58 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Toán', grade: 'THPT', price: 220000, desc: 'Toán 10–12, củng cố nền tảng và rèn kỹ năng trình bày.' },
        { subject: 'Ngữ văn', grade: 'THCS', price: 200000, desc: 'Ngữ văn 6–9, lập dàn ý và sửa lỗi diễn đạt.' },
        { subject: 'Ngữ văn', grade: 'THPT', price: 210000, desc: 'Nghị luận xã hội & văn học, ôn thi vào 10 và tốt nghiệp.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: '18:30–20:30', period: 'Buổi tối', available: true },
        { day: 'Thứ 3', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 4', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 5', time: '19:00–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 6', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 7', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Chủ nhật', time: 'Đã kín lịch', period: '—', available: false }
      ],
      certificates: [
        { name: 'Bằng cử nhân Sư phạm', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Chứng chỉ bồi dưỡng nghiệp vụ sư phạm', meta: 'Tài liệu PDF · Đã duyệt' }
      ],
      reviews: [
        { author: 'Chị Hà', initials: 'H', sub: 'Phụ huynh em Bảo Ngọc (Lớp 9)', time: '1 tháng trước', score: 5, text: '“Cô hướng dẫn con lập dàn ý rất logic, bài văn có chiều hơn hẳn và tự giác sửa lỗi diễn đạt.”' },
        { author: 'Anh Tuấn', initials: 'T', sub: 'Phụ huynh em Minh Khuê (Lớp 11)', time: '2 tháng trước', score: 5, text: '“Cô gợi mở để con tự tìm ra lỗi sai thay vì làm hộ, tiến bộ rõ ở cả Toán và Văn.”' },
        { author: 'Chị Oanh', initials: 'O', sub: 'Phụ huynh em Thu Trang (Lớp 12)', time: '4 tháng trước', score: 4, text: '“Kiến thức chắc, đúng giờ, đề cương sát cấu trúc đề thi.”' }
      ]
    },
    'GS-07': {
      id: 'GS-07',
      name: 'Lê Quốc Bảo',
      initials: 'LB',
      subjects: 'Toán · Vật lý',
      rating: '4,8',
      ratingCount: 38,
      experience: '3 năm kinh nghiệm',
      classes: '30 lớp đã dạy',
      location: 'Làng Đại học, TP. Thủ Đức',
      delivery: 'Dạy tại nhà & trực tuyến',
      online: 'Đang nhận học viên',
      about: [
        'Tôi là Thủ khoa ĐH Bách Khoa, kèm Toán và Vật lý theo hướng trực quan hóa, đặc biệt mạnh ở phần hình học không gian và bài toán cực trị.',
        'Tôi thiết kế mỗi buổi xoay quanh một chủ đề trọng tâm, kèm theo hệ thống câu hỏi tăng dần mức độ để học sinh hiểu bản chất trước khi giải đề.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Kỹ sư — Thủ khoa', note: 'Trường ĐH Bách khoa – ĐHQG TP. Hồ Chí Minh' },
        { label: 'Chuyên ngành chính', title: 'Toán ứng dụng & Kỹ thuật', note: 'Tốt nghiệp Thủ khoa, chuyên ngành kỹ thuật' },
        { label: 'Thâm niên giảng dạy', title: '3 năm tích lũy', note: 'Bồi dưỡng Toán – Vật lý theo chuyên đề' },
        { label: 'Hồ sơ hoàn thành', title: '30 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Toán', grade: 'THPT', price: 210000, desc: 'Toán 10–12, trực quan hóa hình học và hàm số.' },
        { subject: 'Toán', grade: 'Luyện thi', price: 230000, desc: 'Luyện thi THPT Quốc gia theo chuyên đề vận dụng.' },
        { subject: 'Vật lý', grade: 'THPT', price: 200000, desc: 'Vật lý 10–12, phân tích hiện tượng và phương pháp giải.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: '19:30–21:30', period: 'Buổi tối', available: true },
        { day: 'Thứ 3', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 4', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 5', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 6', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 7', time: '14:00–16:00', period: 'Buổi chiều', available: true },
        { day: 'Chủ nhật', time: 'Đã kín lịch', period: '—', available: false }
      ],
      certificates: [
        { name: 'Bằng kỹ sư ĐH Bách Khoa', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Giấy chứng nhận tốt nghiệp Thủ khoa', meta: 'Tài liệu PDF · Đã đối soát CCCD' }
      ],
      reviews: [
        { author: 'Chị Mai', initials: 'M', sub: 'Phụ huynh em Gia Huy (Lớp 11)', time: '1 tháng trước', score: 5, text: '“Thầy trực quan hóa hình học không gian rất tốt, con hiểu và tự vẽ được thiết diện.”' },
        { author: 'Anh Phúc', initials: 'P', sub: 'Phụ huynh em Bảo Nam (Lớp 10)', time: '3 tháng trước', score: 4, text: '“Giải thích dễ hiểu, có bài tập tăng dần mức độ. Thầy kèm sát chủ đề con đang mất gốc.”' }
      ]
    },
    'GS-09': {
      id: 'GS-09',
      name: 'Hoàng Thu Hà',
      initials: 'HH',
      subjects: 'Tiếng Anh · Giao tiếp',
      rating: '4,9',
      ratingCount: 44,
      experience: '5 năm kinh nghiệm',
      classes: '55 lớp đã dạy',
      location: 'TP. Thủ Đức, TP.HCM',
      delivery: 'Dạy trực tuyến',
      online: 'Đang nhận học viên',
      about: [
        'Tôi là Cử nhân Sư phạm Tiếng Anh, dạy online với phương pháp lấy người học làm trung tâm, ưu tiên phản xạ nói và tự tin trình bày trước đám đông.',
        'Tôi có bộ chủ đề thuyết trình ngắn dành cho học sinh cuối cấp, kèm phản hồi sau mỗi hai buổi và ghi âm để học sinh tự nghe, chỉnh phát âm.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Cử nhân Sư phạm Anh', note: 'Trường ĐH Sư phạm TP. Hồ Chí Minh' },
        { label: 'Chứng chỉ quốc tế', title: 'IELTS 7.5', note: 'Cấp 06/2024 · kỹ năng Nói 7.0' },
        { label: 'Thâm niên giảng dạy', title: '5 năm tích lũy', note: 'Tiếng Anh giao tiếp và thuyết trình' },
        { label: 'Hồ sơ hoàn thành', title: '55 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Tiếng Anh', grade: 'Giao tiếp', price: 240000, desc: 'Luyện phản xạ nói và thuyết trình theo chủ đề thật.' },
        { subject: 'IELTS', grade: 'Người đi làm', price: 260000, desc: 'Lộ trình 4 kỹ năng, chữa Speaking có ghi âm nhận xét.' },
        { subject: 'Tiếng Anh', grade: 'THPT', price: 220000, desc: 'Tiếng Anh 10–12, trọng ngữ và ôn thi tốt nghiệp.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: '19:30–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 3', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 4', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 5', time: '20:00–21:30', period: 'Buổi tối', available: true },
        { day: 'Thứ 6', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 7', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Chủ nhật', time: 'Đã kín lịch', period: '—', available: false }
      ],
      certificates: [
        { name: 'Bằng cử nhân Sư phạm Tiếng Anh', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Chứng chỉ IELTS 7.5', meta: 'Tài liệu PDF · Đã đối soát mã tra cứu' }
      ],
      reviews: [
        { author: 'Chị Lan', initials: 'L', sub: 'Phụ huynh em Mỹ Anh (Lớp 12)', time: '1 tháng trước', score: 5, text: '“Con tự tin thuyết trình hơn hẳn sau hai tháng, cô sửa phát âm rất chi tiết.”' },
        { author: 'Anh Dũng', initials: 'D', sub: 'Học viên giao tiếp', time: '2 tháng trước', score: 5, text: '“Luyện nói theo chủ đề thật, có ghi âm và nhận xét từng câu nên tiến bộ rõ.”' },
        { author: 'Chị Ngọc', initials: 'N', sub: 'Phụ huynh em Gia Hân (Lớp 11)', time: '3 tháng trước', score: 4, text: '“Cô nhiệt tình, đúng giờ. Cần thêm bài tập về nhà để con luyện đều hơn.”' }
      ]
    },
    'GS-10': {
      id: 'GS-10',
      name: 'Hồ Ngọc Anh',
      initials: 'HA',
      subjects: 'Ngữ văn · Luyện viết',
      rating: '4,7',
      ratingCount: 34,
      experience: '3 năm kinh nghiệm',
      classes: '24 lớp đã dạy',
      location: 'Quận 1, TP.HCM',
      delivery: 'Dạy tại nhà',
      online: 'Đang nhận học viên',
      about: [
        'Tôi tốt nghiệp ĐH Khoa học Xã hội & Nhân văn, chuyên Ngữ văn. Tôi tập trung rèn kỹ năng cảm thụ tác phẩm thông qua hệ thống câu hỏi gợi mở thay vì học thuộc văn mẫu.',
        'Tôi hướng dẫn học sinh cách dựng dàn ý, viết đoạn nghị luận có dẫn chứng và sửa lỗi diễn đạt sau mỗi bài viết.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Cử nhân Văn học', note: 'Trường ĐH Khoa học Xã hội & Nhân văn' },
        { label: 'Chuyên ngành chính', title: 'Văn học Việt Nam', note: 'Phương pháp cảm thụ và nghị luận' },
        { label: 'Thâm niên giảng dạy', title: '3 năm tích lũy', note: 'Ngữ văn THCS và luyện thi vào 10' },
        { label: 'Hồ sơ hoàn thành', title: '24 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Ngữ văn', grade: 'THCS', price: 170000, desc: 'Ngữ văn 6–9, rèn cảm thụ và kỹ năng làm bài tự luận.' },
        { subject: 'Ngữ văn', grade: 'THPT', price: 190000, desc: 'Nghị luận xã hội & văn học, ôn thi vào 10 và tốt nghiệp.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 3', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 4', time: '19:00–21:00', period: 'Buổi tối', available: true },
        { day: 'Thứ 5', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 6', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 7', time: '09:00–11:00', period: 'Buổi sáng', available: true },
        { day: 'Chủ nhật', time: 'Đã kín lịch', period: '—', available: false }
      ],
      certificates: [
        { name: 'Bằng cử nhân Ngữ văn', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Chứng chỉ bồi dưỡng nghiệp vụ sư phạm', meta: 'Tài liệu PDF · Đã duyệt' }
      ],
      reviews: [
        { author: 'Chị Hà', initials: 'H', sub: 'Phụ huynh em Bảo Ngọc (Lớp 8)', time: '2 tháng trước', score: 5, text: '“Cô dùng câu hỏi gợi mở, con biết cách cảm thụ và viết mạch lạc hơn.”' },
        { author: 'Anh Tuấn', initials: 'T', sub: 'Phụ huynh em Minh Khuê (Lớp 9)', time: '3 tháng trước', score: 4, text: '“Kiến thức chắc, cô sửa bài chi tiết. Cần thêm đề nghị luận xã hội để con luyện.”' }
      ]
    },
    'GS-11': {
      id: 'GS-11',
      name: 'Ngô Bảo Trân',
      initials: 'BT',
      subjects: 'Ngữ văn · Luyện viết',
      rating: '4,8',
      ratingCount: 51,
      experience: '4 năm kinh nghiệm',
      classes: '40 lớp đã dạy',
      location: 'Gò Vấp, TP.HCM',
      delivery: 'Dạy tại nhà & trực tuyến',
      online: 'Đang nhận học viên',
      about: [
        'Tôi là Cao học Văn học, chuyên luyện Ngữ văn và kỹ năng viết. Tôi rèn học sinh dựng dàn ý, viết đoạn và liên kết ý chặt chẽ.',
        'Tôi có phiếu bài tập viết lại đoạn văn mỗi tuần để học sinh thấy rõ tiến bộ về diễn đạt và cách dùng dẫn chứng.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Cao học Văn học', note: 'Trường ĐH Khoa học Xã hội & Nhân văn' },
        { label: 'Chuyên ngành chính', title: 'Lý luận & Phê bình văn học', note: 'Trọng tâm kỹ năng nghị luận và tạo lập văn bản' },
        { label: 'Thâm niên giảng dạy', title: '4 năm tích lũy', note: 'Ngữ văn THCS – THPT và luyện viết' },
        { label: 'Hồ sơ hoàn thành', title: '40 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Ngữ văn', grade: 'THPT', price: 190000, desc: 'Nghị luận xã hội & văn học, ôn thi tốt nghiệp và vào 10.' },
        { subject: 'Luyện viết', grade: 'THCS', price: 185000, desc: 'Rèn dựng dàn ý, liên kết đoạn và sửa lỗi diễn đạt.' },
        { subject: 'Ngữ văn', grade: 'THCS', price: 175000, desc: 'Ngữ văn 6–9, củng cố cảm thụ và kỹ năng làm bài tự luận.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 3', time: '18:30–20:30', period: 'Buổi tối', available: true },
        { day: 'Thứ 4', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 5', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 6', time: '18:30–20:30', period: 'Buổi tối', available: true },
        { day: 'Thứ 7', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Chủ nhật', time: 'Đã kín lịch', period: '—', available: false }
      ],
      certificates: [
        { name: 'Bằng thạc sĩ / Cao học Văn học', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Chứng chỉ nghiệp vụ sư phạm', meta: 'Tài liệu PDF · Đã duyệt' }
      ],
      reviews: [
        { author: 'Chị Oanh', initials: 'O', sub: 'Phụ huynh em Thu Trang (Lớp 12)', time: '1 tháng trước', score: 5, text: '“Phiếu viết lại đoạn văn mỗi tuần giúp con tiến bộ rõ về diễn đạt và dẫn chứng.”' },
        { author: 'Anh Minh', initials: 'M', sub: 'Phụ huynh em Quốc Anh (Lớp 9)', time: '2 tháng trước', score: 5, text: '“Cô hướng dẫn dựng dàn ý rất chắc, bài viết của con có chiều hơn.”' },
        { author: 'Chị Hà', initials: 'H', sub: 'Phụ huynh em Bảo Ngọc (Lớp 10)', time: '4 tháng trước', score: 4, text: '“Kiến thức tốt, đúng giờ, sửa bài cặn kẽ từng câu.”' }
      ]
    },
    'GS-12': {
      id: 'GS-12',
      name: 'Võ Hương Giang',
      initials: 'HG',
      subjects: 'Ngữ văn',
      rating: '4,6',
      ratingCount: 22,
      experience: '2 năm kinh nghiệm',
      classes: '16 lớp đã dạy',
      location: 'TP. Thủ Đức, TP.HCM',
      delivery: 'Dạy tại nhà & trực tuyến',
      online: 'Đang nhận học viên',
      about: [
        'Tôi là Cử nhân Sư phạm Văn, kèm Ngữ văn cho học sinh THCS và đầu cấp THPT. Tôi ưu tiên sự gần gũi và khích lệ để học sinh hết sợ môn Văn.',
        'Tôi phù hợp với các buổi học cuối tuần, kèm theo bài kiểm tra ngắn 15 phút cuối mỗi buổi để củng cố ngay kiến thức vừa học.'
      ],
      facts: [
        { label: 'Trình độ đào tạo', title: 'Cử nhân Sư phạm Ngữ văn', note: 'Trường ĐH Sư phạm TP. Hồ Chí Minh' },
        { label: 'Chuyên ngành chính', title: 'Sư phạm Ngữ văn', note: 'Phương pháp dạy học Ngữ văn phổ thông' },
        { label: 'Thâm niên giảng dạy', title: '2 năm tích lũy', note: 'Ngữ văn 6–10, rèn nền tảng và kỹ năng viết' },
        { label: 'Hồ sơ hoàn thành', title: '16 lớp kèm riêng', note: '' }
      ],
      plans: [
        { subject: 'Ngữ văn', grade: 'THCS', price: 175000, desc: 'Ngữ văn 6–9, rèn cảm thụ và kỹ năng làm bài tự luận.' },
        { subject: 'Ngữ văn', grade: 'THPT', price: 185000, desc: 'Ngữ văn 10, củng cố nền tảng và dựng dàn ý nghị luận.' }
      ],
      schedule: [
        { day: 'Thứ 2', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 3', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 4', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 5', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 6', time: 'Đã kín lịch', period: '—', available: false },
        { day: 'Thứ 7', time: '14:00–16:00', period: 'Buổi chiều', available: true },
        { day: 'Chủ nhật', time: '09:00–11:00', period: 'Buổi sáng', available: true }
      ],
      certificates: [
        { name: 'Bằng cử nhân Sư phạm Ngữ văn', meta: 'Tài liệu PDF · Đã xác minh bản gốc' },
        { name: 'Giấy xác nhận thực tập sư phạm', meta: 'Tài liệu PDF · Đã duyệt' }
      ],
      reviews: [
        { author: 'Chị Lan', initials: 'L', sub: 'Phụ huynh em Mỹ Anh (Lớp 8)', time: '2 tháng trước', score: 5, text: '“Cô gần gũi, con hết sợ môn Văn. Bài kiểm tra ngắn cuối buổi rất hữu ích.”' },
        { author: 'Anh Tuấn', initials: 'T', sub: 'Phụ huynh em Minh Khuê (Lớp 7)', time: '3 tháng trước', score: 4, text: '“Dạy cuối tuần linh hoạt, có bài kiểm tra 15 phút củng cố ngay. Cần thêm buổi trong tuần.”' }
      ]
    }
  }

  const setText = (selector, value) => {
    const node = page.querySelector(selector)
    if (node) node.textContent = value
  }

  const requestedId = new URLSearchParams(window.location.search).get('id')
  const tutor = requestedId ? TUTORS[requestedId] : null

  const layout = page.querySelector('[data-tutor-layout]')
  const breadcrumb = page.querySelector('.breadcrumb')
  const missing = page.querySelector('[data-tutor-missing]')

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    const labels = {
      messages: 'Tin nhắn',
      notifications: 'Thông báo',
      logout: 'Đăng xuất'
    }
    const title = labels[event.detail?.action]
    if (!title) return
    window.EduToast?.show({ type: 'info', title, message: 'Tính năng chưa sẵn sàng.' })
  })

  if (!tutor) {
    document.title = 'Không tìm thấy gia sư | Edu Connect'
    if (layout) layout.hidden = true
    if (breadcrumb) breadcrumb.hidden = true
    if (missing) missing.hidden = false
    return
  }

  document.title = `${tutor.name} | Edu Connect`

  setText('[data-tutor-crumb]', tutor.name)
  setText('[data-tutor-name]', tutor.name)
  setText('[data-tutor-subjects]', tutor.subjects)
  setText('[data-tutor-rating]', tutor.rating)
  setText('[data-tutor-rating-count]', `(${tutor.ratingCount} đánh giá)`)
  setText('[data-tutor-experience]', tutor.experience)
  setText('[data-tutor-classes]', tutor.classes)
  setText('[data-tutor-location]', tutor.location)
  setText('[data-tutor-delivery]', tutor.delivery)
  setText('[data-tutor-reviews-sub]', `Dựa trên ${tutor.ratingCount} đánh giá thực tế sau các khóa học hoàn tất`)
  setText('[data-tutor-reviews-score]', tutor.rating)

  const avatar = page.querySelector('[data-tutor-avatar]')
  if (avatar) {
    avatar.textContent = tutor.initials
    avatar.setAttribute('aria-label', `Ảnh đại diện ${tutor.name}`)
  }

  const hero = page.querySelector('.tutor-profile-hero .rating')
  if (hero) hero.setAttribute('aria-label', `Đánh giá ${tutor.rating} trên 5 sao từ ${tutor.ratingCount} đánh giá`)

  const inviteLink = page.querySelector('[data-invite-tutor]')
  if (inviteLink) inviteLink.href = `../invitation/create.html?tutor=${encodeURIComponent(tutor.id)}`
  const chatLink = page.querySelector('[data-chat]')
  if (chatLink) chatLink.href = `../chat/messages.html?tutor=${encodeURIComponent(tutor.id)}`

  const viewReviews = page.querySelector('[data-view-reviews]')
  if (viewReviews) viewReviews.textContent = `Xem tất cả ${tutor.ratingCount} đánh giá`

  const about = page.querySelector('[data-tutor-about]')
  if (about) {
    about.replaceChildren(...tutor.about.map(text => {
      const p = document.createElement('p')
      p.textContent = text
      return p
    }))
  }

  const facts = page.querySelector('[data-tutor-facts]')
  if (facts) {
    facts.replaceChildren(...tutor.facts.map(fact => {
      const article = document.createElement('article')
      const label = document.createElement('small')
      label.textContent = fact.label
      const title = document.createElement('strong')
      title.textContent = fact.title
      article.append(label, title)
      if (fact.note) {
        const note = document.createElement('p')
        note.textContent = fact.note
        article.append(note)
      }
      return article
    }))
  }

  const schedule = page.querySelector('[data-tutor-schedule]')
  if (schedule) {
    schedule.replaceChildren(...tutor.schedule.map(slot => {
      const article = document.createElement('article')
      if (slot.available) article.className = 'is-available'
      const day = document.createElement('strong')
      day.textContent = slot.day
      const time = document.createElement('span')
      time.textContent = slot.time
      const period = document.createElement('small')
      period.textContent = slot.period
      article.append(day, time, period)
      return article
    }))
  }

  const certificates = page.querySelector('[data-tutor-certificates]')
  if (certificates) {
    certificates.replaceChildren(...tutor.certificates.map(certificate => {
      const article = document.createElement('article')
      article.className = 'file-attachment-item'
      const symbol = document.createElement('div')
      symbol.className = 'file-attachment-item__symbol'
      const icon = document.createElement('span')
      icon.className = 'component-icon component-icon--file'
      icon.setAttribute('aria-hidden', 'true')
      symbol.append(icon)
      const body = document.createElement('div')
      body.className = 'file-attachment-item__body'
      const name = document.createElement('h3')
      name.className = 'file-attachment-item__name'
      name.textContent = certificate.name
      const meta = document.createElement('p')
      meta.className = 'file-attachment-item__meta'
      meta.textContent = certificate.meta
      body.append(name, meta)
      const badge = document.createElement('span')
      badge.className = 'badge badge--success'
      const check = document.createElement('span')
      check.className = 'component-icon component-icon--check'
      check.setAttribute('aria-hidden', 'true')
      badge.append(check, document.createTextNode('Đã duyệt'))
      article.append(symbol, body, badge)
      return article
    }))
  }

  const starsFor = score => {
    const wrap = document.createElement('span')
    wrap.className = 'rating'
    wrap.setAttribute('role', 'img')
    wrap.setAttribute('aria-label', `${score} trên 5 sao`)
    const stars = document.createElement('span')
    stars.className = 'rating__stars'
    stars.setAttribute('aria-hidden', 'true')
    for (let index = 1; index <= 5; index += 1) {
      const star = document.createElement('span')
      star.className = index <= score ? 'rating__star' : 'rating__star rating__star--empty'
      stars.append(star)
    }
    wrap.append(stars)
    return wrap
  }

  const reviews = page.querySelector('[data-tutor-reviews]')
  if (reviews) {
    reviews.replaceChildren(...tutor.reviews.map(review => {
      const article = document.createElement('article')
      article.className = 'tutor-profile-review'
      const header = document.createElement('header')
      const avatarSmall = document.createElement('span')
      avatarSmall.className = 'avatar avatar--small'
      avatarSmall.setAttribute('role', 'img')
      avatarSmall.setAttribute('aria-label', `Ảnh đại diện ${review.author}`)
      avatarSmall.textContent = review.initials
      const person = document.createElement('div')
      const author = document.createElement('strong')
      author.textContent = review.author
      const sub = document.createElement('small')
      sub.textContent = review.sub
      person.append(author, sub)
      const time = document.createElement('time')
      time.textContent = review.time
      header.append(avatarSmall, person, time)
      article.append(header, starsFor(review.score))
      const text = document.createElement('p')
      text.textContent = review.text
      article.append(text)
      return article
    }))
  }

  const planList = page.querySelector('[data-plan-list]')
  const selectedSubject = page.querySelector('[data-selected-subject]')
  const selectedGrade = page.querySelector('[data-selected-grade]')
  const selectedPrice = page.querySelector('[data-selected-price]')

  const plans = tutor.plans.map(plan => {
    const button = document.createElement('button')
    button.className = 'card card--interactive tutor-profile-plan'
    button.type = 'button'
    button.setAttribute('aria-pressed', 'false')
    button.dataset.plan = ''
    button.dataset.subject = plan.subject
    button.dataset.grade = plan.grade
    button.dataset.price = currency(plan.price)
    const check = document.createElement('span')
    check.className = 'tutor-profile-plan__check'
    check.setAttribute('aria-hidden', 'true')
    check.textContent = '✓'
    const tags = document.createElement('span')
    tags.className = 'tutor-card__tags'
    const subjectTag = document.createElement('span')
    subjectTag.className = 'tag'
    subjectTag.textContent = plan.subject
    const gradeTag = document.createElement('span')
    gradeTag.className = 'tag tag--neutral'
    gradeTag.textContent = plan.grade
    tags.append(subjectTag, gradeTag)
    const price = document.createElement('strong')
    price.textContent = currency(plan.price)
    const unit = document.createElement('small')
    unit.textContent = '90 phút / buổi'
    const desc = document.createElement('p')
    desc.textContent = plan.desc
    button.append(check, tags, price, unit, desc)
    return button
  })

  if (planList) {
    planList.replaceChildren(...plans)
  }

  const syncPlan = plan => {
    plans.forEach(item => {
      const selected = item === plan
      item.classList.toggle('is-selected', selected)
      item.setAttribute('aria-pressed', String(selected))
    })
    if (selectedSubject) selectedSubject.textContent = plan.dataset.subject
    if (selectedGrade) selectedGrade.textContent = plan.dataset.grade
    if (selectedPrice) selectedPrice.textContent = plan.dataset.price
  }

  plans.forEach(plan => plan.addEventListener('click', () => syncPlan(plan)))
  if (plans[0]) syncPlan(plans[0])
})()
