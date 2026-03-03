package com.management.smartclass.payload;
public class FacultyAttendanceUpdateDTO {

    private String studentEmail;
    private boolean present;

    public FacultyAttendanceUpdateDTO() {
    }

    public FacultyAttendanceUpdateDTO(String studentEmail, boolean present) {
        this.studentEmail = studentEmail;
        this.present = present;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }
}

