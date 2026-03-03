package com.management.smartclass.payload;
public class FacultyProfileDTO {

    private String name;
    private String dept;
    private String position;
    private String qualification;

    public FacultyProfileDTO() {
    }

    public FacultyProfileDTO(String name, String qualification, String position, String dept) {
        this.name = name;
        this.qualification = qualification;
        this.position = position;
        this.dept = dept;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDept() {
        return dept;
    }

    public void setDept(String dept) {
        this.dept = dept;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }
}

