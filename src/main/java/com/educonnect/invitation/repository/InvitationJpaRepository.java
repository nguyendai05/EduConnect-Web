package com.educonnect.invitation.repository;

import com.educonnect.invitation.domain.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import com.educonnect.order.domain.RegistrationSource;
import java.util.List;
import java.util.Optional;

/**
 * Tác giả: Trường Đạt.
 * Lưu lời mời, truy vấn theo hai bên và khóa dữ liệu khi phản hồi hoặc sử dụng nguồn.
 * Thuộc trang: /invitation/create và /invitation/negotiation.
 */
@Profile("db-dev")
public interface InvitationJpaRepository extends JpaRepository<Invitation, Long> {
    /** Khóa mã gửi để kiểm lượt tạo lời mời lặp bằng trạng thái hiện tại của DB. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Invitation> findByPublicCode(String publicCode);

    /** Nạp trang lời mời của người gửi/người nhận cùng dữ liệu cần để dựng Response. */
    @EntityGraph(attributePaths = {"learnerReference.account", "tutorReference.account", "subjectReference",
            "gradeLevelReference", "areaReference", "deliveryModeReference"})
    @Query("select i from Invitation i where i.learnerId = :actorId or i.tutorId = :actorId")
    Page<Invitation> findForParticipant(@Param("actorId") Long actorId, Pageable pageable);

    /** Đọc một lời mời chỉ khi tài khoản là một trong hai bên. */
    @EntityGraph(attributePaths = {"learnerReference.account", "tutorReference.account", "subjectReference",
            "gradeLevelReference", "areaReference", "deliveryModeReference"})
    @Query("select i from Invitation i where i.id = :id and (i.learnerId = :actorId or i.tutorId = :actorId)")
    Optional<Invitation> findOwned(@Param("id") Long id, @Param("actorId") Long actorId);

    /** Khóa đúng lời mời thuộc người thao tác trước khi Service kiểm trạng thái và phiên bản. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Invitation i where i.id = :id and (i.learnerId = :actorId or i.tutorId = :actorId)")
    Optional<Invitation> lockOwned(@Param("id") Long id, @Param("actorId") Long actorId);

    /** Đọc số giao dịch đã dùng lời mời để hiển thị trạng thái nguồn. */
    @Query("select count(s) from RegistrationSource s where s.invitationId = :id")
    long countSources(@Param("id") Long id);

    /** Khóa nguồn đã có trong transaction của Huy; không ghi bảng RegistrationSource ở DAT-03. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from RegistrationSource s where s.invitationId = :id")
    List<RegistrationSource> lockSources(@Param("id") Long id);
}
