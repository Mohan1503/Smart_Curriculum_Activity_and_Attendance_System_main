package com.management.smartclass.payload;
public class DailyAttendanceDTO {

    private String startTime;
    private String endTime;

    private String subjectCode;
    private String subjectName;

    private boolean isBreak;
    private String status; // PRESENT / ABSENT / BREAK

    public DailyAttendanceDTO() {
    }

    public DailyAttendanceDTO(String startTime, String endTime, String subjectCode, String subjectName, boolean isBreak, String status) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.isBreak = isBreak;
        this.status = status;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public boolean isBreak() {
        return isBreak;
    }

    public void setBreak(boolean aBreak) {
        isBreak = aBreak;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

