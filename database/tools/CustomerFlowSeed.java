import com.educonnect.EduConnectApplication;
import com.educonnect.invitation.dto.InvitationActionRequest;
import com.educonnect.invitation.dto.InvitationRequest;
import com.educonnect.invitation.service.InvitationService;
import com.educonnect.job.dto.JobApplicationActionRequest;
import com.educonnect.job.dto.JobApplicationRequest;
import com.educonnect.job.dto.JobReviewRequest;
import com.educonnect.job.dto.JobSearchRequest;
import com.educonnect.job.service.JobReviewService;
import com.educonnect.job.service.JobService;
import com.educonnect.lesson.service.CatalogService;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccountRepository;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.orm.jpa.EntityManagerFactoryUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Tác giả: Trường Đạt.
 * Bộ dữ liệu thao tác khách hàng trong DB development, không phải migration hay dữ liệu production.
 * Chỉ tạo bộ riêng một lần; chạy lại giữ nguyên các thay đổi người dùng đã thao tác.
 * Phạm vi DAT-01/02/03/04: dịch vụ, tìm gia sư, lời mời và tin/ứng tuyển.
 * Đăng lời mời/tin/ứng tuyển qua Service thực tế; không tạo dữ liệu giao dịch của Huy.
 */
public class CustomerFlowSeed {
    private static final String FIXTURE = "educonnect-customer-flows-v1";
    private static final String PUBLIC_PASSWORD = "EduconnectDemo!2026";
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private final ConfigurableApplicationContext context;
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transaction;
    private final UserAccountRepository accounts;
    private final InvitationService invitations;
    private final JobService jobs;
    private final JobReviewService reviews;
    private final CatalogService catalog;
    private final EntityManagerFactory entityManagerFactory;
    private final Instant now = Instant.now().truncatedTo(ChronoUnit.MICROS);
    private final Map<String, Long> offerings = new LinkedHashMap<>();
    private AccountPrincipal admin;
    private AccountPrincipal customer;
    private AccountPrincipal parent;
    private final List<AccountPrincipal> tutors = new ArrayList<>();

    public CustomerFlowSeed(ConfigurableApplicationContext context) {
        this.context = context;
        this.jdbc = context.getBean(JdbcTemplate.class);
        this.transaction = new TransactionTemplate(context.getBean(PlatformTransactionManager.class));
        this.accounts = context.getBean(UserAccountRepository.class);
        this.invitations = context.getBean(InvitationService.class);
        this.jobs = context.getBean(JobService.class);
        this.reviews = context.getBean(JobReviewService.class);
        this.catalog = context.getBean(CatalogService.class);
        this.entityManagerFactory = context.getBean(EntityManagerFactory.class);
    }

    public static void main(String[] args) throws Exception {
        if (args.length != 1 || !List.of("--inspect", "--apply").contains(args[0])) {
            throw new IllegalArgumentException("Dùng --inspect để đọc hoặc --apply để nạp bộ mẫu riêng.");
        }
        var loadEnvironment = EduConnectApplication.class.getDeclaredMethod("loadDotEnvLocal");
        loadEnvironment.setAccessible(true);
        loadEnvironment.invoke(null);
        try (var context = SpringApplication.run(EduConnectApplication.class,
                "--spring.profiles.active=db-dev", "--server.port=0", "--spring.flyway.enabled=false",
                "--spring.main.banner-mode=off", "--logging.level.root=ERROR")) {
            var seed = new CustomerFlowSeed(context);
            seed.requireDevelopmentDatabase();
            if ("--inspect".equals(args[0])) {
                seed.inspect();
                return;
            }
            seed.apply();
            seed.printSummary();
        }
    }

    /** Tác giả: Trường Đạt. Chỉ chấp nhận DB development/test của dự án, trước mọi thao tác ghi. */
    private void requireDevelopmentDatabase() {
        String schema = jdbc.queryForObject("select database()", String.class);
        if (schema == null || !(schema.equals("educonnect_dev") || schema.matches("educonnect_test(?:_[a-z0-9_]+)?"))) {
            throw new IllegalStateException("Chỉ nạp vào educonnect_dev hoặc educonnect_test đã được chỉ định.");
        }
        if (jdbc.queryForObject("select count(*) from information_schema.tables where table_schema=database() and table_name='dev_seed_runs'", Integer.class) != 1) {
            throw new IllegalStateException("Thiếu schema nền; công cụ không tự chạy migration.");
        }
    }

    /** Tác giả: Trường Đạt. Kiểm kê chỉ đọc, không in credential/hash hoặc cấu hình kết nối. */
    private void inspect() {
        System.out.println("COUNTS " + jdbc.queryForList("""
                select 'accounts' as entity, count(*) as total from user_accounts
                union all select 'offerings',count(*) from offerings
                union all select 'invitations',count(*) from invitations
                union all select 'jobs',count(*) from job_posts
                """));
        System.out.println("OFFERING_STATES " + jdbc.queryForList("select status,count(*) as total from offerings group by status"));
        System.out.println("REFERENCES " + jdbc.queryForList("select code,name from subjects order by id"));
        System.out.println("CUSTOMER_SEED_EXISTS " + jdbc.queryForObject(
                "select count(*) from dev_seed_runs where fixture_set=?", Integer.class, FIXTURE));
    }

    /** Tác giả: Trường Đạt. Toàn bộ bộ mẫu cùng marker được commit hoặc rollback trong một transaction. */
    private void apply() throws Exception {
        byte[] manifestHash = MessageDigest.getInstance("SHA-256").digest(FIXTURE.getBytes(StandardCharsets.UTF_8));
        transaction.executeWithoutResult(status -> {
            var markers = jdbc.queryForList("select manifest_hash from dev_seed_runs where fixture_set=? for update", byte[].class, FIXTURE);
            if (!markers.isEmpty()) {
                if (!Arrays.equals(markers.get(0), manifestHash)) {
                    throw new IllegalStateException("Marker bộ mẫu không khớp; dừng thay vì ghi đè.");
                }
                System.out.println("UNCHANGED_NOOP: giữ nguyên dữ liệu đã thao tác.");
                return;
            }
            admin = new AccountPrincipal(accounts.findByEmail("admin@example.test")
                    .filter(a -> a.roles().contains("ADMIN") && "ACTIVE".equals(a.status()) && a.emailVerified())
                    .orElseThrow(() -> new IllegalStateException("Cần tài khoản admin mẫu đang hoạt động, không tự cấp ADMIN mới.")));
            createAccounts();
            createOfferings();
            createInvitations();
            createJobs();
            verifyNewDataset();
            jdbc.update("insert into dev_seed_runs(fixture_set,manifest_hash,applied_at) values(?,?,?)",
                    FIXTURE, manifestHash, Timestamp.from(now));
        });
    }

    /** Tác giả: Trường Đạt. Tài khoản mới tách biệt các tài khoản cũ, không gửi email hoặc đổi quyền người có sẵn. */
    private void createAccounts() {
        customer = createAccount("KH01", "khachhang01@example.test", "Nguyễn Hoài An", "LEARNER", "SELF", "GRADE_10", "HANOI_CAU_GIAY");
        parent = createAccount("KH02", "khachhang02@example.test", "Trần Thu Hà", "LEARNER", "PARENT", "GRADE_8", "HCM_THU_DUC");
        tutors.add(createAccount("GS01", "giasu01@example.test", "Lê Minh Phương", "TUTOR", null, null, null));
        tutors.add(createAccount("GS02", "giasu02@example.test", "Nguyễn Thành Nam", "TUTOR", null, null, null));
        tutors.add(createAccount("GS03", "giasu03@example.test", "Phạm Bảo Ngọc", "TUTOR", null, null, null));
        String[] headlines = {"Gia sư Toán THCS, THPT và luyện thi", "Gia sư Toán, Vật lý, Hóa học theo chuyên đề", "Gia sư Toán phổ thông, Tiếng Anh và IELTS nền tảng"};
        String[][] subjects = {{"MATH"}, {"MATH", "PHYSICS", "CHEMISTRY"}, {"MATH", "ENGLISH"}};
        for (int index = 0; index < tutors.size(); index++) {
            Long id = tutors.get(index).getId();
            jdbc.update("update tutor_profiles set headline=?,experience_years=? where user_id=?", headlines[index], 4 + index * 2, id);
            for (String code : subjects[index]) {
                jdbc.update("insert into tutor_subjects(tutor_id,subject_id) values(?,?)", id, reference("subjects", code));
            }
            for (String grade : List.of("GRADE_8", "GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12", "EXAM_PREP")) {
                jdbc.update("insert into tutor_grade_levels(tutor_id,grade_level_id) values(?,?)", id, reference("grade_levels", grade));
            }
            for (String area : List.of("HANOI_CAU_GIAY", "HCM_THU_DUC", "NATIONWIDE")) {
                jdbc.update("insert into tutor_areas(tutor_id,area_id) values(?,?)", id, reference("areas", area));
            }
            for (String mode : List.of("ONLINE", "IN_PERSON", "HYBRID")) {
                jdbc.update("insert into tutor_delivery_modes(tutor_id,delivery_mode_id) values(?,?)", id, reference("delivery_modes", mode));
            }
        }
    }

    private AccountPrincipal createAccount(String suffix, String email, String name, String role,
                                            String kind, String grade, String area) {
        if (accounts.findByEmail(email).isPresent()) {
            throw new IllegalStateException("Email bộ mẫu đã có trước nhưng chưa có marker; không ghi đè: " + email);
        }
        String hash = context.getBean(PasswordEncoder.class).encode(PUBLIC_PASSWORD);
        long id = insert("""
                insert into user_accounts(public_code,email,password_hash,status,email_verified_at,display_name,bio,
                    version,authentication_version,created_at,updated_at)
                values(?,?,?,'ACTIVE',?,?,?,0,0,?,?)
                """, "DEMO-CUSTOMER-" + suffix, email, hash, Timestamp.from(now), name,
                "Tài khoản mẫu riêng cho thao tác luồng khách hàng, không phải người dùng thực.", Timestamp.from(now), Timestamp.from(now));
        jdbc.update("insert into user_roles(user_id,role_code) values(?,?)", id, role);
        if ("LEARNER".equals(role)) {
            jdbc.update("insert into learner_profiles(user_id,learner_kind,grade_level_id,area_id) values(?,?,?,?)",
                    id, kind, reference("grade_levels", grade), reference("areas", area));
        } else {
            jdbc.update("""
                    insert into tutor_profiles(user_id,review_status,headline,experience_years,reviewed_by,reviewed_at,review_note,version,updated_at)
                    values(?,'APPROVED','Hồ sơ gia sư mẫu',4,?,?,'Hồ sơ mẫu đã duyệt phục vụ thao tác ứng dụng',0,?)
                    """, id, admin.getId(), Timestamp.from(now.minus(1, ChronoUnit.DAYS)), Timestamp.from(now));
        }
        return new AccountPrincipal(accounts.findById(id).orElseThrow());
    }

    /** Tác giả: Trường Đạt. Nội dung/lịch/giá đầy đủ; ngày lớp tính tương đối để không dùng lịch cũ từ seed lịch sử. */
    private void createOfferings() {
        addOffering("S01", 0, "SERVICE", "Toán 10: củng cố kiến thức và luyện bài tập", "MATH", "GRADE_10", "ONLINE", 180000, 8, 90, null, "PUBLISHED");
        addOffering("S02", 0, "SERVICE", "Toán 12: ôn thi tốt nghiệp theo chuyên đề", "MATH", "GRADE_12", "IN_PERSON", 220000, 10, 90, null, "PUBLISHED");
        addOffering("S03", 1, "SERVICE", "Vật lý 11: điện học và kỹ năng giải bài", "PHYSICS", "GRADE_11", "ONLINE", 200000, 8, 90, null, "PUBLISHED");
        addOffering("S04", 1, "SERVICE", "Hóa học 10: lấy lại nền tảng và thực hành bài tập", "CHEMISTRY", "GRADE_10", "ONLINE", 190000, 8, 90, null, "PUBLISHED");
        addOffering("S05", 2, "SERVICE", "Tiếng Anh 8: ngữ pháp và giao tiếp căn bản", "ENGLISH", "GRADE_8", "ONLINE", 170000, 12, 60, null, "PUBLISHED");
        addOffering("S06", 2, "SERVICE", "IELTS nền tảng: lộ trình bốn kỹ năng", "ENGLISH", "EXAM_PREP", "HYBRID", 250000, 12, 90, null, "PUBLISHED");
        addOffering("G01", 0, "GROUP_CLASS", "Lớp nhóm Toán 10: học chắc, luyện đều", "MATH", "GRADE_10", "ONLINE", 120000, 8, 90, 8, "PUBLISHED");
        addOffering("G02", 1, "GROUP_CLASS", "Lớp nhóm Vật lý 11: luyện bài theo chủ đề", "PHYSICS", "GRADE_11", "HYBRID", 140000, 8, 90, 6, "PUBLISHED");
        addOffering("G03", 2, "GROUP_CLASS", "Lớp nhóm Tiếng Anh 9: chuẩn bị vào lớp 10", "ENGLISH", "GRADE_9", "ONLINE", 130000, 10, 90, 10, "PUBLISHED");
        addOffering("G04", 2, "GROUP_CLASS", "Lớp nhóm IELTS cơ bản: luyện bốn kỹ năng", "ENGLISH", "EXAM_PREP", "ONLINE", 180000, 12, 90, 5, "PUBLISHED");
        addOffering("C01", 0, "SERVICE", "Toán 9: khóa mẫu đã ngừng nhận đăng ký", "MATH", "GRADE_9", "ONLINE", 160000, 6, 90, null, "CLOSED");
        addOffering("D01", 1, "SERVICE", "Hóa học 8: bản nháp chưa được công khai", "CHEMISTRY", "GRADE_8", "ONLINE", 150000, 6, 90, null, "DRAFT");
        clearPersistenceContext();
    }

    private void addOffering(String code, int tutorIndex, String type, String title, String subject, String grade,
                              String mode, int price, int sessions, int duration, Integer capacity, String state) {
        LocalDate start = LocalDate.now(ZONE).plusDays(14);
        String description = "Lộ trình " + sessions + " buổi, đánh giá đầu vào và xây dựng kế hoạch theo năng lực. "
                + "Mỗi buổi ôn kiến thức trọng tâm, hướng dẫn bài tập và trao đổi phần chưa hiểu. "
                + "Tài liệu học được cung cấp trước buổi học; có bài luyện tập và nhận xét sau buổi. "
                + "Đây là dữ liệu mẫu để thao tác trên ứng dụng.";
        String terms = sessions + " buổi, " + duration + " phút/buổi; học phí " + price + " VND/buổi/người học. "
                + "Học thứ Hai và thứ Năm từ 19:00 đến " + (duration == 60 ? "20:00" : "20:30")
                + " theo giờ Asia/Ho_Chi_Minh. "
                + ("ONLINE".equals(mode) ? "Học trực tuyến; đường dẫn buổi học do gia sư cung cấp sau khi thống nhất. "
                : "Địa điểm dự kiến Cầu Giấy, Hà Nội; địa chỉ cụ thể được hai bên thống nhất trước buổi đầu. ")
                + "Chuẩn bị tài liệu và bài tập trước buổi học; nhu cầu đổi lịch cần được hai bên đồng ý. "
                + "Điều khoản mẫu, không đại diện chính sách phí/hủy/hoàn chính thức.";
        boolean publicHistory = !"DRAFT".equals(state);
        Timestamp published = publicHistory ? Timestamp.from(now.minus(1, ChronoUnit.DAYS)) : null;
        long id = insert("""
                insert into offerings(public_code,tutor_id,offering_type,title,description,subject_id,grade_level_id,area_id,
                    delivery_mode_id,unit_price,currency,session_count,duration_minutes,capacity,starts_on,ends_on,status,
                    first_published_at,published_at,reviewed_by,reviewed_at,terms_version,terms_text,version,created_at,updated_at)
                values(?,?,?,?,?,?,?,?,?,?,'VND',?,?,?,?,?,?,?,?,?,?,1,?,0,?,?)
                """, "DEMO-CUSTOMER-" + code, tutors.get(tutorIndex).getId(), type, title, description,
                reference("subjects", subject), reference("grade_levels", grade), reference("areas", "HANOI_CAU_GIAY"),
                reference("delivery_modes", mode), price, sessions, duration, capacity,
                capacity == null ? null : java.sql.Date.valueOf(start), capacity == null ? null : java.sql.Date.valueOf(start.plusDays(90)),
                state, published, published, publicHistory ? admin.getId() : null, published, terms,
                Timestamp.from(now.minus(2, ChronoUnit.DAYS)), Timestamp.from(now));
        offerings.put(code, id);
        jdbc.update("insert into offering_time_slots(offering_id,weekday,start_time,end_time,time_zone) values(?,1,'19:00',?,'Asia/Ho_Chi_Minh'),(?,4,'19:00',?,'Asia/Ho_Chi_Minh')",
                id, duration == 60 ? "20:00" : "20:30", id, duration == 60 ? "20:00" : "20:30");
    }

    /** Tác giả: Trường Đạt. Các lời mời được tạo/phản hồi bằng Service, giữ đúng đồng ý và phiên bản. */
    private void createInvitations() {
        seedInvitation("pending", "S01", "pending");
        seedInvitation("accepted", "S03", "accept");
        seedInvitation("declined", "S05", "decline");
        seedInvitation("cancelled", "S02", "cancel");
        long expired = seedInvitation("expired", "S04", "pending");
        jdbc.update("update invitations set created_at=?,expires_at=? where id=?", Timestamp.from(now.minus(3, ChronoUnit.DAYS)),
                Timestamp.from(now.minus(1, ChronoUnit.DAYS)), expired);
        clearPersistenceContext();
    }

    private long seedInvitation(String key, String offeringCode, String action) {
        Long offeringId = offerings.get(offeringCode);
        InvitationRequest form = invitations.prepare(customer, null, offeringId);
        form.setRequestKey(requestKey("invitation-" + key));
        form.setExpiresAt(LocalDateTime.now(ZONE).plusDays(30).withNano(0));
        form.setConsent(true);
        form.setTermsText(form.getTermsText() + "\nĐề xuất từ học viên mẫu: cần hướng dẫn kỹ phần nền tảng và giao bài luyện sau mỗi buổi.");
        long id = invitations.create(customer, form);
        clearPersistenceContext();
        if (!"pending".equals(action)) {
            var detail = invitations.detail(customer, id);
            var response = new InvitationActionRequest();
            response.setAction(action);
            response.setVersion(detail.version());
            response.setTermsVersion(detail.termsVersion());
            response.setConsent(true);
            AccountPrincipal actor = "cancel".equals(action) ? customer : tutors.stream()
                    .filter(t -> t.getId().equals(detail.tutorId())).findFirst().orElseThrow();
            invitations.respond(actor, id, response);
            clearPersistenceContext();
        }
        return id;
    }

    /** Tác giả: Trường Đạt. Tạo đủ nháp/chờ duyệt/mở/từ chối/đóng/đã chọn cùng các đề xuất thật trong DB. */
    private void createJobs() {
        seedJob("draft", "Cần gia sư Toán 10 học buổi tối — bản nháp", "draft", "MATH", "GRADE_10");
        seedJob("pending", "Tìm gia sư Tiếng Anh 8 cho học viên mất gốc — chờ duyệt", "submit", "ENGLISH", "GRADE_8");
        long open = openJob("open", "Tìm gia sư Toán 10: học tối thứ Hai và thứ Năm");
        for (int index = 0; index < tutors.size(); index++) { apply(open, index); }
        long matched = openJob("matched", "Tìm gia sư Toán 10 ôn kiểm tra học kỳ — đã chọn");
        long selected = apply(matched, 0);
        apply(matched, 1);
        var selectedForm = new JobApplicationActionRequest();
        selectedForm.setAction("select");
        selectedForm.setConsent(true);
        selectedForm.setJobVersion(jobs.detail(customer, matched).version());
        selectedForm.setApplicationVersion(jobs.ownApplication(tutors.get(0), matched).version());
        jobs.decideApplication(customer, matched, selected, selectedForm);
        clearPersistenceContext();
        long rejected = seedJob("rejected", "Tìm gia sư Toán 10 — cần bổ sung yêu cầu trước khi đăng", "submit", "MATH", "GRADE_10");
        review(rejected, "reject", "Cần ghi rõ mục tiêu học, thời lượng mỗi buổi và địa điểm để gia sư xem xét.");
        long closed = openJob("closed", "Tìm gia sư Toán 10 — đã đóng tuyển ứng viên");
        var close = new com.educonnect.job.dto.JobActionRequest();
        close.setAction("close");
        close.setVersion(jobs.detail(customer, closed).version());
        jobs.change(customer, closed, close);
        clearPersistenceContext();
        // Một tin của người khác để học viên mẫu xem bảng tin công khai và kiểm quyền riêng tư.
        AccountPrincipal main = customer;
        customer = parent;
        long otherJob = seedJob("other-owner", "Phụ huynh tìm gia sư Toán 8 cho con học trực tuyến", "submit", "MATH", "GRADE_8");
        review(otherJob, "approve", "Tin mẫu của phụ huynh có đầy đủ mục tiêu, lịch và ngân sách.");
        customer = main;
    }

    private long seedJob(String key, String title, String action, String subject, String grade) {
        var form = jobs.prepare(customer, null);
        form.setRequestKey(requestKey("job-" + key));
        form.setTitle(title);
        form.setDescription("Mục tiêu: củng cố kiến thức, cải thiện kỹ năng giải bài và tự học. "
                + "Học 8 buổi, 90 phút/buổi; tối thứ Hai và thứ Năm 19:00–20:30, Asia/Ho_Chi_Minh. "
                + "Học trực tuyến, ưu tiên gia sư giải thích dễ hiểu, giao bài luyện và nhận xét sau từng buổi. "
                + "Gia sư ghi rõ kinh nghiệm, giá đề xuất và xác nhận lịch khi ứng tuyển. Tin mẫu phục vụ thao tác ứng dụng.");
        form.setSubjectId(reference("subjects", subject));
        form.setGradeLevelId(reference("grade_levels", grade));
        form.setAreaId(reference("areas", customer.getId().equals(parent.getId()) ? "HCM_THU_DUC" : "HANOI_CAU_GIAY"));
        form.setDeliveryModeId(reference("delivery_modes", "ONLINE"));
        form.setBudgetPerSession(BigDecimal.valueOf(200000));
        form.setSessionCount((short) 8);
        form.setAction(action);
        long id = jobs.save(customer, null, form);
        clearPersistenceContext();
        return id;
    }

    private long openJob(String key, String title) {
        long id = seedJob(key, title, "submit", "MATH", "GRADE_10");
        review(id, "approve", "Tin mẫu có đủ mục tiêu, lịch học và ngân sách; được duyệt để thao tác ứng tuyển.");
        return id;
    }

    private void review(long id, String action, String reason) {
        var form = new JobReviewRequest();
        form.setVersion(reviews.detail(admin, id).version());
        form.setAction(action);
        form.setReason(reason);
        reviews.review(admin, id, form);
        clearPersistenceContext();
    }

    private long apply(long id, int index) {
        var form = new JobApplicationRequest();
        form.setJobVersion(jobs.detail(tutors.get(index), id).version());
        form.setProposedUnitPrice(BigDecimal.valueOf(180000 + index * 10000));
        form.setMessage("Tôi có " + (4 + index * 2) + " năm kinh nghiệm hướng dẫn học sinh. Đồng ý lịch và nhu cầu của tin. "
                + "Đề xuất: đánh giá đầu vào ở buổi đầu, chia nội dung theo từng tuần, giao bài vừa sức và nhận xét sau buổi học.");
        form.setConsent(true);
        long applicationId = jobs.apply(tutors.get(index), id, form);
        clearPersistenceContext();
        return applicationId;
    }

    /** Tác giả: Trường Đạt. Kiểm dữ liệu mới trước commit; không thêm test hoặc đổi dữ liệu cũ. */
    private void verifyNewDataset() {
        for (String code : List.of("S01", "S02", "S03", "S04", "S05", "S06", "G01", "G02", "G03", "G04")) {
            var detail = catalog.detail(offerings.get(code));
            if (detail.registrationIssue() != null || detail.slots().isEmpty()) {
                throw new IllegalStateException("Dịch vụ mới không sẵn sàng thao tác: " + code);
            }
        }
        if (invitations.list(customer, 0).getTotalElements() != 5
                || jobs.mine(customer, new JobSearchRequest(), null).getTotalElements() != 6) {
            throw new IllegalStateException("Thiếu kịch bản lời mời/tin trong bộ mới.");
        }
        PasswordEncoder encoder = context.getBean(PasswordEncoder.class);
        for (AccountPrincipal principal : List.of(customer, parent, tutors.get(0), tutors.get(1), tutors.get(2))) {
            if (!encoder.matches(PUBLIC_PASSWORD, accounts.findById(principal.getId()).orElseThrow().passwordHash())) {
                throw new IllegalStateException("Mật khẩu tài khoản mẫu không khớp.");
            }
        }
    }

    private void printSummary() throws Exception {
        Long learnerId = accounts.findByEmail("khachhang01@example.test").orElseThrow().id();
        var output = new LinkedHashMap<String, Object>();
        output.put("dataset", FIXTURE);
        output.put("accounts", jdbc.queryForList("select id,email,display_name from user_accounts where public_code like 'DEMO-CUSTOMER-%' order by id"));
        output.put("offerings", jdbc.queryForList("select id,title,status from offerings where public_code like 'DEMO-CUSTOMER-%' order by id"));
        output.put("invitations", jdbc.queryForList("select id,status,expires_at from invitations where learner_id=? order by id", learnerId));
        output.put("jobs", jdbc.queryForList("select id,title,status from job_posts where learner_id=? order by id", learnerId));
        var mapper = context.getBean(com.fasterxml.jackson.databind.ObjectMapper.class);
        Path outputFile = Path.of("target/customer-flow-seed/data.json");
        Files.createDirectories(outputFile.getParent());
        mapper.writerWithDefaultPrettyPrinter().writeValue(outputFile.toFile(), output);
        System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(output));
    }

    private long reference(String table, String code) {
        if (!List.of("subjects", "grade_levels", "areas", "delivery_modes").contains(table)) {
            throw new IllegalArgumentException("Danh mục không được phép.");
        }
        Long id = jdbc.queryForObject("select id from " + table + " where code=?", Long.class, code);
        if (id == null) { throw new IllegalStateException("Thiếu danh mục chuẩn: " + code); }
        return id;
    }

    private long insert(String sql, Object... values) {
        var key = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            var statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            for (int index = 0; index < values.length; index++) { statement.setObject(index + 1, values[index]); }
            return statement;
        }, key);
        if (key.getKey() == null) { throw new IllegalStateException("Không nhận được ID mới."); }
        return key.getKey().longValue();
    }

    private void clearPersistenceContext() {
        var entityManager = EntityManagerFactoryUtils.getTransactionalEntityManager(entityManagerFactory);
        if (entityManager != null) {
            entityManager.flush();
            entityManager.clear();
        }
    }

    private String requestKey(String name) {
        return UUID.nameUUIDFromBytes((FIXTURE + ":" + name).getBytes(StandardCharsets.UTF_8)).toString();
    }
}
