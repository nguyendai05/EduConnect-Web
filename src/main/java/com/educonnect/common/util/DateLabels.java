package com.educonnect.common.util;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/** Nhãn ngày giờ theo múi giờ Việt Nam; dữ liệu lưu UTC. */
public final class DateLabels {
    private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");

    private DateLabels() {}

    public static String vietnam(Instant instant) {
        return instant == null ? "" : FORMAT.format(instant.atZone(VIETNAM));
    }
}
