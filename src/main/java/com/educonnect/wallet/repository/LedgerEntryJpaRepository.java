package com.educonnect.wallet.repository;

import java.math.BigDecimal;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import com.educonnect.wallet.domain.JournalKind;
import com.educonnect.wallet.domain.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

import java.time.Instant;
import java.util.Collection;

/** Repository JPA chuẩn; giữ riêng đường ghi JDBC auth. */
@Profile("db-dev")
public interface LedgerEntryJpaRepository extends JpaRepository<LedgerEntry, Long> {

    /** Số dư = tổng CREDIT trừ tổng DEBIT của tài khoản. */
    @Query("select coalesce(sum(case when e.entrySide = com.educonnect.wallet.domain.EntrySide.CREDIT then e.amount else -e.amount end), 0)"
            + " from LedgerEntry e where e.ledgerAccountId = :id")
    BigDecimal balance(@Param("id") Long accountId);

    /** Lịch sử biến động của một tài khoản, mới nhất trước. */
    @Query(value = "select e from LedgerEntry e join fetch e.journalReference where e.ledgerAccountId = :id order by e.id desc",
            countQuery = "select count(e) from LedgerEntry e where e.ledgerAccountId = :id")
    Page<LedgerEntry> history(@Param("id") Long accountId, Pageable pageable);

    /** Lịch sử biến động theo loại bút toán và khoảng thời gian [from, to), mới nhất trước. */
    @Query(value = "select e from LedgerEntry e join fetch e.journalReference j where e.ledgerAccountId = :id"
            + " and j.journalKind in :kinds and j.postedAt >= :from and j.postedAt < :to order by e.id desc",
            countQuery = "select count(e) from LedgerEntry e join e.journalReference j where e.ledgerAccountId = :id"
            + " and j.journalKind in :kinds and j.postedAt >= :from and j.postedAt < :to")
    Page<LedgerEntry> filtered(@Param("id") Long accountId, @Param("kinds") Collection<JournalKind> kinds,
                               @Param("from") Instant from, @Param("to") Instant to, Pageable pageable);

    /** Tổng tiền vào ví (CREDIT) của một loại bút toán, ví dụ hoàn tiền hoặc giải ngân. */
    @Query("select coalesce(sum(e.amount), 0) from LedgerEntry e join e.journalReference j where e.ledgerAccountId = :id"
            + " and e.entrySide = com.educonnect.wallet.domain.EntrySide.CREDIT and j.journalKind = :kind")
    BigDecimal creditTotal(@Param("id") Long accountId, @Param("kind") JournalKind kind);
}
