package com.educonnect.wallet.dto;

import com.educonnect.wallet.domain.EntrySide;
import com.educonnect.wallet.domain.LedgerEntry;
import java.math.BigDecimal;
import java.time.Instant;

/** Một dòng biến động trong lịch sử ví; amount dương là tiền vào, âm là tiền ra. */
public record WalletEntryDTO(Instant postedAt, String kindLabel, String memo, BigDecimal amount) {

    public static WalletEntryDTO from(LedgerEntry entry) {
        var journal = entry.getJournalReference();
        String kind = switch (journal.getJournalKind()) {
            case TOP_UP -> "Nạp ví";
            case WALLET_PAYMENT, PROVIDER_PAYMENT -> "Thanh toán hợp đồng";
            case RELEASE -> "Nhận tiền hợp đồng";
            case REFUND -> "Hoàn tiền";
        };
        BigDecimal signed = entry.getEntrySide() == EntrySide.CREDIT ? entry.getAmount() : entry.getAmount().negate();
        return new WalletEntryDTO(journal.getPostedAt(), kind, journal.getMemo(), signed);
    }
}
