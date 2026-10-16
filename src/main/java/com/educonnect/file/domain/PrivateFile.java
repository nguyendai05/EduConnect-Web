package com.educonnect.file.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

/** Mapping private_files; maintainer: Đại. Không chứa logic nghiệp vụ. */
@Entity
@Table(name = "private_files", uniqueConstraints = {@UniqueConstraint(name = "uq_files_storage", columnNames = {"storage_key"})})
public class PrivateFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "owner_user_id", nullable = false)
    private Long ownerUserId;

    @Column(name = "storage_key", nullable = false, length = 160)
    private String storageKey;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "purpose", nullable = false, length = 32)
    private FilePurpose purpose;

    @Column(name = "original_name", nullable = false, length = 255)
    private String originalName;

    @Column(name = "mime_type", nullable = false, length = 80)
    private String mimeType;

    @Column(name = "byte_size", nullable = false)
    private Long byteSize;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "sha256", nullable = false, length = 32, columnDefinition = "binary(32)")
    private byte[] sha256;

    @JdbcTypeCode(SqlTypes.TIMESTAMP)
    @Column(name = "created_at", nullable = false, columnDefinition = "datetime(6)")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private com.educonnect.user.domain.UserAccount ownerUserReference;

    protected PrivateFile() {}

    public static PrivateFile create() { return new PrivateFile(); }

    public Long getId() { return id; }

    public Long getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(Long ownerUserId) { this.ownerUserId = ownerUserId; }

    public String getStorageKey() { return storageKey; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }

    public FilePurpose getPurpose() { return purpose; }
    public void setPurpose(FilePurpose purpose) { this.purpose = purpose; }

    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public Long getByteSize() { return byteSize; }
    public void setByteSize(Long byteSize) { this.byteSize = byteSize; }

    public byte[] getSha256() { return sha256 == null ? null : sha256.clone(); }
    public void setSha256(byte[] sha256) { this.sha256 = sha256 == null ? null : sha256.clone(); }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public com.educonnect.user.domain.UserAccount getOwnerUserReference() { return ownerUserReference; }
}
