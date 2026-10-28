package com.educonnect.wallet.repository;

import java.math.BigDecimal;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import com.educonnect.wallet.domain.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.context.annotation.Profile;

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
}
