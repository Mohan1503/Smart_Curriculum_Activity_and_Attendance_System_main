package com.management.smartclass.payload;
public class FacultyAttendanceViewDTO {

    private String studentEmail;
    private String studentName;
    private String rollNo;
    private boolean present;

    public FacultyAttendanceViewDTO() {
    }

    public FacultyAttendanceViewDTO(String studentEmail, String studentName,String rollNo, boolean present) {
        this.studentEmail = studentEmail;
        this.studentName = studentName;
        this.rollNo = rollNo;
        this.present = present;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }
}

