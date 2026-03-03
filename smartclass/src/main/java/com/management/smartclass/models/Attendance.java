package com.management.smartclass.models;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "studentEmail",
                                "subjectCode",
                                "date",
                                "startTime"
                        }
                )
        }
)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentEmail;

    private String subjectCode;
    private String subjectName;

    private String facultyEmail;

    private String dept;
    private String section;
    private int semester;

    private LocalDate date;

    private LocalTime startTime;
    private LocalTime endTime;

    private boolean present;

    public Attendance() {
    }

    public Attendance(Long id, String studentEmail, String subjectCode, String subjectName, String facultyEmail, String dept, String section, int semester, LocalDate date, LocalTime startTime, LocalTime endTime, boolean present) {
        this.id = id;
        this.studentEmail = studentEmail;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.facultyEmail = facultyEmail;
        this.dept = dept;
        this.section = section;
        this.semester = semester;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.present = present;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }
}
