package com.management.smartclass.models;

import jakarta.persistence.*;

@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"dept","semester","subjectCode"})
})
public class SubjectFaculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dept;
    private int semester;

    private String subjectCode;
    private String subjectName;
    private String facultyEmail;

    public SubjectFaculty() {
    }

    public SubjectFaculty(Long id, String dept, int semester, String subjectCode, String subjectName, String facultyEmail) {
        this.id = id;
        this.dept = dept;
        this.semester = semester;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.facultyEmail = facultyEmail;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDept() {
        return dept;
    }

    public void setDept(String dept) {
        this.dept = dept;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
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

