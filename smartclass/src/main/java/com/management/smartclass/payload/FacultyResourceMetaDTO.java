package com.management.smartclass.payload;

import java.time.LocalDateTime;

public class FacultyResourceMetaDTO {

    private Long id;
    private String fileName;
    private String subject;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private String uploadedBy;
    private String dept;

    public FacultyResourceMetaDTO() {
    }

    public FacultyResourceMetaDTO(Long id, String fileName, String subject, Long fileSize, LocalDateTime uploadedAt, String uploadedBy, String dept) {
        this.id = id;
        this.fileName = fileName;
        this.subject = subject;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
        this.uploadedBy = uploadedBy;
        this.dept = dept;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getDept() {
        return dept;
    }

    public void setDept(String dept) {
        this.dept = dept;
    }
}
