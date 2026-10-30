package com.educonnect.file.service;

import com.educonnect.common.exception.ServiceProblem;
import com.educonnect.file.domain.FilePurpose;
import com.educonnect.file.domain.PrivateFile;
import com.educonnect.file.repository.PrivateFileJpaRepository;
import com.educonnect.security.AccountPrincipal;
import com.educonnect.user.UserAccount;
import com.educonnect.user.service.AccountGuard;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.UUID;

/**
 * DAI-02: lưu minh chứng riêng tư ngoài thư mục static. Tệp chỉ đọc được qua {@link #open},
 * nơi kiểm chủ tệp hoặc admin; storage_key là mã ngẫu nhiên, không phải đường dẫn.
 */
@Service
@Profile("db-dev")
public class PrivateFileService {
    public static final long MAX_BYTES = 5L * 1024 * 1024;

    private final PrivateFileJpaRepository files;
    private final AccountGuard guard;
    private final Path root;

    public PrivateFileService(PrivateFileJpaRepository files, AccountGuard guard,
                              @Value("${app.storage.private-dir:storage/private}") String directory) {
        this.files = files;
        this.guard = guard;
        this.root = Path.of(directory).toAbsolutePath().normalize();
    }

    /** Kết quả đọc tệp: nội dung cùng metadata đã kiểm. */
    public record Download(Resource resource, String name, String mimeType, long size) {}

    /** Kiểm loại/kích thước theo nội dung thật (không tin Content-Type của trình duyệt) rồi ghi tệp và metadata. */
    @Transactional
    public PrivateFile store(Long ownerId, FilePurpose purpose, MultipartFile upload) {
        if (upload == null || upload.isEmpty()) {
            throw ServiceProblem.invalid("Hãy chọn một tệp để tải lên.");
        }
        if (upload.getSize() > MAX_BYTES) {
            throw ServiceProblem.invalid("Mỗi tệp tối đa 5 MB.");
        }
        byte[] content;
        try {
            content = upload.getBytes();
        } catch (IOException failure) {
            throw ServiceProblem.invalid("Không đọc được tệp đã chọn.");
        }
        String mime = detectMime(content);
        if (mime == null) {
            throw ServiceProblem.invalid("Chỉ hỗ trợ tệp PDF, PNG hoặc JPG.");
        }
        PrivateFile file = PrivateFile.create();
        file.setOwnerUserId(ownerId);
        file.setPurpose(purpose);
        file.setStorageKey(UUID.randomUUID().toString());
        file.setOriginalName(cleanName(upload.getOriginalFilename(), mime));
        file.setMimeType(mime);
        file.setByteSize((long) content.length);
        file.setSha256(sha256(content));
        file.setCreatedAt(Instant.now());
        Path target = path(file.getStorageKey());
        try {
            Files.createDirectories(root);
            Files.write(target, content);
        } catch (IOException failure) {
            throw new IllegalStateException("Không ghi được tệp minh chứng.", failure);
        }
        try {
            return files.saveAndFlush(file);
        } catch (RuntimeException failure) {
            deleteQuietly(target);
            throw failure;
        }
    }

    /** Xóa metadata và tệp; gọi sau khi đã gỡ mọi liên kết tới tệp. */
    @Transactional
    public void delete(PrivateFile file) {
        String key = file.getStorageKey();
        files.delete(file);
        files.flush();
        deleteQuietly(path(key));
    }

    /** Chủ tệp hoặc admin mới được đọc. */
    @Transactional(readOnly = true)
    public Download open(AccountPrincipal principal, Long id) {
        UserAccount account = guard.require(principal, null);
        PrivateFile file = files.findById(id).orElseThrow(() -> ServiceProblem.notFound("Không tìm thấy tệp."));
        boolean owner = file.getOwnerUserId().equals(account.id());
        if (!owner && !account.roles().contains("ADMIN")) {
            // Trả 404 thay vì 403 để không xác nhận tệp có tồn tại.
            throw ServiceProblem.notFound("Không tìm thấy tệp.");
        }
        Path target = path(file.getStorageKey());
        if (!Files.isRegularFile(target)) {
            throw ServiceProblem.notFound("Tệp không còn trên máy chủ.");
        }
        return new Download(new FileSystemResource(target), file.getOriginalName(), file.getMimeType(), file.getByteSize());
    }

    private Path path(String key) {
        Path target = root.resolve(key).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalStateException("Đường dẫn lưu trữ không hợp lệ.");
        }
        return target;
    }

    static String detectMime(byte[] c) {
        if (c.length >= 5 && c[0] == '%' && c[1] == 'P' && c[2] == 'D' && c[3] == 'F' && c[4] == '-') return "application/pdf";
        if (c.length >= 8 && (c[0] & 0xFF) == 0x89 && c[1] == 'P' && c[2] == 'N' && c[3] == 'G') return "image/png";
        if (c.length >= 3 && (c[0] & 0xFF) == 0xFF && (c[1] & 0xFF) == 0xD8 && (c[2] & 0xFF) == 0xFF) return "image/jpeg";
        return null;
    }

    static String cleanName(String original, String mime) {
        String name = original == null ? "" : original.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}<>:\"|?*]", "").strip();
        if (name.isEmpty()) {
            name = "minh-chung" + switch (mime) { case "application/pdf" -> ".pdf"; case "image/png" -> ".png"; default -> ".jpg"; };
        }
        return name.length() > 200 ? name.substring(name.length() - 200) : name;
    }

    private static byte[] sha256(byte[] content) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(content);
        } catch (java.security.NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    private static void deleteQuietly(Path target) {
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // tệp mồ côi không ảnh hưởng dữ liệu; có thể dọn tay.
        }
    }
}
