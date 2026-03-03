package com.management.smartclass.models;

import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {
                "dept","section","semester","day","startTime","endTime"
        })
})
public class TimeTableSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int year;
    private int semester;
    private String dept;
    private String section;

    private String day;

    private LocalTime startTime;
    private LocalTime endTime;

    private String subjectCode;
    private String subjectName;
    private String facultyEmail;

    private boolean isBreak;


    public TimeTableSlot() {
    }

    public TimeTableSlot(Long id, int year, int semester, String dept, String section, String day, LocalTime startTime, LocalTime endTime, String subjectCode, String subjectName, String facultyEmail, boolean isBreak) {
        this.id = id;
        this.year = year;
        this.semester = semester;
        this.dept = dept;
        this.section = section;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.facultyEmail = facultyEmail;
        this.isBreak = isBreak;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
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

    public boolean isBreak() {
        return isBreak;
    }

    public void setBreak(boolean aBreak) {
        isBreak = aBreak;
    }
}

