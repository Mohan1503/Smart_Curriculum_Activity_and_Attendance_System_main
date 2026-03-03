package com.management.smartclass.payload;
public class FacultyPeriodDTO {

    private String day;

    private String startTime;
    private String endTime;

    private String subjectCode;
    private String subjectName;

    private String dept;
    private String section;

    private boolean isBreak;

    public FacultyPeriodDTO() {
    }

    public FacultyPeriodDTO(String day, String startTime, String endTime, String subjectCode, String subjectName, String dept, String section, boolean isBreak) {
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.dept = dept;
        this.section = section;
        this.isBreak = isBreak;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
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

    public String getDept() {
        return dept;
    }

    public void setDept(String dept) {
        this.dept = dept;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public boolean isBreak() {
        return isBreak;
    }

    public void setBreak(boolean aBreak) {
        isBreak = aBreak;
    }
}

