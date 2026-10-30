package com.educonnect.user.service;

import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.common.reference.repository.AreaJpaRepository;
import com.educonnect.common.reference.repository.GradeLevelJpaRepository;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccount;
import com.educonnect.user.domain.LearnerKind;
import com.educonnect.user.domain.LearnerProfile;
import com.educonnect.user.dto.AccountProfileDTO;
import com.educonnect.user.dto.AccountProfileForm;
import com.educonnect.user.repository.LearnerProfileJpaRepository;
import com.educonnect.user.repository.UserAccountJpaRepository;
import jakarta.validation.Validator;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** DAI-02 (TC01): xem/sửa hồ sơ cá nhân của chính người đăng nhập. */
@Service
@Profile("db-dev")
@Transactional(readOnly = true)
public class AccountProfileService {
    private final AccountGuard guard;
    private final UserAccountJpaRepository users;
    private final LearnerProfileJpaRepository learners;
    private final GradeLevelJpaRepository grades;
    private final AreaJpaRepository areas;
    private final Validator validator;

    public AccountProfileService(AccountGuard guard, UserAccountJpaRepository users, LearnerProfileJpaRepository learners,
                                 GradeLevelJpaRepository grades, AreaJpaRepository areas, Validator validator) {
        this.guard = guard;
        this.users = users;
        this.learners = learners;
        this.grades = grades;
        this.areas = areas;
        this.validator = validator;
    }

    public AccountProfileDTO view(AccountPrincipal principal) {
        UserAccount auth = guard.require(principal, null);
        var account = users.findById(auth.id()).orElseThrow(() -> ServiceProblem.notFound("Không tìm thấy hồ sơ."));
        var learner = learners.findById(auth.id()).orElse(null);
        List<String> labels = new ArrayList<>();
        if (auth.roles().contains("LEARNER")) labels.add("Người học / Phụ huynh");
        if (auth.roles().contains("TUTOR")) labels.add("Gia sư");
        if (auth.roles().contains("ADMIN")) labels.add("Quản trị viên");
        return new AccountProfileDTO(account.getId(), account.getPublicCode(), account.getEmail(), account.getDisplayName(),
                account.getPhone(), account.getBio(), account.getVersion(), labels, auth.roles().contains("TUTOR"),
                learner != null, learner == null ? null : learner.getLearnerKind().name(),
                learner == null ? null : learner.getGradeLevelId(), learner == null ? null : learner.getAreaId(),
                grades.findAll(Sort.by("id")).stream().map(g -> new AccountProfileDTO.Option(g.getId(), g.getName())).toList(),
                areas.findAll(Sort.by("id")).stream().map(a -> new AccountProfileDTO.Option(a.getId(), a.getName())).toList());
    }

    /** Dữ liệu ban đầu cho form từ DB. */
    public AccountProfileForm formOf(AccountProfileDTO profile) {
        var form = new AccountProfileForm();
        form.setDisplayName(profile.displayName());
        form.setPhone(profile.phone());
        form.setBio(profile.bio());
        form.setLearnerKind(profile.learnerKind());
        form.setGradeLevelId(profile.gradeLevelId());
        form.setAreaId(profile.areaId());
        form.setVersion(profile.version());
        return form;
    }

    @Transactional
    public void update(AccountPrincipal principal, AccountProfileForm form) {
        UserAccount auth = guard.require(principal, null);
        var violations = validator.validate(form);
        if (!violations.isEmpty()) {
            throw ServiceProblem.invalid(violations.iterator().next().getMessage());
        }
        var account = users.findLockedById(auth.id()).orElseThrow(() -> ServiceProblem.notFound("Không tìm thấy hồ sơ."));
        if (!account.getVersion().equals(form.getVersion())) {
            throw ServiceProblem.conflict("Hồ sơ đã được thay đổi ở nơi khác. Hãy tải lại trang rồi chỉnh sửa lại.");
        }
        account.setDisplayName(form.getDisplayName().strip());
        account.setPhone(blankToNull(form.getPhone() == null ? null : form.getPhone().strip()));
        account.setBio(blankToNull(form.getBio() == null ? null : form.getBio().strip()));
        account.setUpdatedAt(Instant.now());
        users.saveAndFlush(account);

        var learner = learners.findById(auth.id()).orElse(null);
        if (learner != null) {
            if (form.getLearnerKind() != null && !form.getLearnerKind().isBlank()) {
                try {
                    learner.setLearnerKind(LearnerKind.valueOf(form.getLearnerKind()));
                } catch (IllegalArgumentException invalid) {
                    throw ServiceProblem.invalid("Loại người học không hợp lệ.");
                }
            }
            if (form.getGradeLevelId() != null && !grades.existsById(form.getGradeLevelId())) {
                throw ServiceProblem.invalid("Cấp học không tồn tại.");
            }
            if (form.getAreaId() != null && !areas.existsById(form.getAreaId())) {
                throw ServiceProblem.invalid("Khu vực không tồn tại.");
            }
            learner.setGradeLevelId(form.getGradeLevelId());
            learner.setAreaId(form.getAreaId());
            learners.saveAndFlush(learner);
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isEmpty() ? null : value;
    }
}
