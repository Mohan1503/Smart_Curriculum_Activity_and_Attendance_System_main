package com.management.smartclass.payload;

import java.time.LocalDate;

public class AttendanceDTO {

    private LocalDate date;
    private String subjectCode;
    private boolean present;

    public AttendanceDTO() {
    }

    public AttendanceDTO(LocalDate date, String subjectCode, boolean present) {
        this.date = date;
        this.subjectCode = subjectCode;
        this.present = present;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }
}

