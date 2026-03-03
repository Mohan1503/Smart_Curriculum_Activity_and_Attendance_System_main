package com.management.smartclass.payload;
public class QrGenerateDTO {

    private String subjectCode;
    private String subjectName;

    private String dept;
    private String section;
    private int semester;

    private String startTime;
    private String endTime;

    public QrGenerateDTO() {
    }

    public QrGenerateDTO(String subjectCode, String subjectName, String dept, String section, int semester, String startTime, String endTime) {
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.dept = dept;
        this.section = section;
        this.semester = semester;
        this.startTime = startTime;
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

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
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
}
