package com.educonnect.file.web;

import com.educonnect.file.service.PrivateFileService;
import com.educonnect.security.AccountPrincipal;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.nio.charset.StandardCharsets;

/** DAI-02: đọc tệp riêng tư (minh chứng) — chỉ chủ tệp hoặc admin; không bao giờ phục vụ từ thư mục static. */
@Controller
@Profile("db-dev")
public class PrivateFileController {
    private final PrivateFileService files;

    public PrivateFileController(PrivateFileService files) {
        this.files = files;
    }

    @GetMapping("/files/private/{id}")
    public ResponseEntity<Resource> download(@AuthenticationPrincipal AccountPrincipal principal, @PathVariable Long id) {
        var file = files.open(principal, id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.mimeType()))
                .contentLength(file.size())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(file.name(), StandardCharsets.UTF_8).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
                .body(file.resource());
    }
}
