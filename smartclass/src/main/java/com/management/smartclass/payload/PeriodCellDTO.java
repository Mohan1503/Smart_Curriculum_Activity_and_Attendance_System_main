package com.management.smartclass.payload;
public class PeriodCellDTO {

    private String subjectCode;     // OS
    private String subjectName;     // Operating Systems
    private String facultyEmail;    // os@college.com

    public PeriodCellDTO() {
    }

    public PeriodCellDTO(String subjectCode, String subjectName, String facultyEmail) {
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.facultyEmail = facultyEmail;
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

    public String getFacultyEmail() {
        return facultyEmail;
    }

    public void setFacultyEmail(String facultyEmail) {
        this.facultyEmail = facultyEmail;
    }
}

