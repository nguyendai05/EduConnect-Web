package com.educonnect.file.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/** DAI-02: nhận dạng loại tệp theo nội dung và làm sạch tên tệp, không cần DB. */
class PrivateFileServiceTest {
    @Test void detectsOnlyPdfPngAndJpegByContent() {
        assertEquals("application/pdf", PrivateFileService.detectMime("%PDF-1.7 ...".getBytes()));
        assertEquals("image/png", PrivateFileService.detectMime(new byte[]{(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10}));
        assertEquals("image/jpeg", PrivateFileService.detectMime(new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0}));
        assertNull(PrivateFileService.detectMime("MZ executable".getBytes()));
        assertNull(PrivateFileService.detectMime("<html><script>alert(1)</script>".getBytes()));
        assertNull(PrivateFileService.detectMime(new byte[0]));
    }

    @Test void cleansNamesAndFallsBackWhenEmpty() {
        assertEquals("bang.pdf", PrivateFileService.cleanName("..\\..\\tmp/bang.pdf", "application/pdf"));
        assertEquals("minh-chung.png", PrivateFileService.cleanName("  ", "image/png"));
        assertEquals("minh-chung.jpg", PrivateFileService.cleanName(null, "image/jpeg"));
        assertEquals("ab.pdf", PrivateFileService.cleanName("a<b>\u0000.pdf", "application/pdf"));
        assertTrue(PrivateFileService.cleanName("x".repeat(400) + ".pdf", "application/pdf").length() <= 200);
    }
}
