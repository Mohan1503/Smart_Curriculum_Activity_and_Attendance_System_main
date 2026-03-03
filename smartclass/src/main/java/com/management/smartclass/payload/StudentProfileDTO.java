package com.management.smartclass.payload;
public class StudentProfileDTO {

    private String name;
    private String rollno;
    private String section;
    private String dept;
    private int year;
    private int semester;
    private Long mobile;
    private String address;
    private String bloodGroup;
    private String mothername;
    private String fathername;

    public StudentProfileDTO() {
    }

    public StudentProfileDTO(String name, String rollno, String section, String dept, int year, int semester, Long mobile, String address, String bloodGroup, String mothername, String fathername) {
        this.name = name;
        this.rollno = rollno;
        this.section = section;
        this.dept = dept;
        this.year = year;
        this.semester = semester;
        this.mobile = mobile;
        this.address = address;
        this.bloodGroup = bloodGroup;
        this.mothername = mothername;
        this.fathername = fathername;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRollno() {
        return rollno;
    }

    public void setRollno(String rollno) {
        this.rollno = rollno;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getDept() {
        return dept;
    }

    public void setDept(String dept) {
        this.dept = dept;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public Long getMobile() {
        return mobile;
    }

    public void setMobile(Long mobile) {
        this.mobile = mobile;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getMothername() {
        return mothername;
    }

    public void setMothername(String mothername) {
        this.mothername = mothername;
    }

    public String getFathername() {
        return fathername;
    }

    public void setFathername(String fathername) {
        this.fathername = fathername;
    }
}

