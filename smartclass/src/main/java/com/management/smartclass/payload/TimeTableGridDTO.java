package com.management.smartclass.payload;


import java.util.Map;

public class TimeTableGridDTO {

    private int year;
    private int semester;
    private String dept;
    private String section;

    private String collegeStartTime;   // "08:30"
    private int periodDurationMinutes; // 50

    private int morningBreakAfter;     // 2
    private int morningBreakMinutes;   // 10

    private int lunchBreakAfter;       // 4
    private int lunchBreakMinutes;     // 60

    // MONDAY → SATURDAY
    private Map<String, DayGridDTO> days;

    public TimeTableGridDTO() {
    }

    public TimeTableGridDTO(int year, int semester, String dept, String section, String collegeStartTime, int periodDurationMinutes, int morningBreakAfter, int morningBreakMinutes, int lunchBreakAfter, int lunchBreakMinutes, Map<String, DayGridDTO> days) {
        this.year = year;
        this.semester = semester;
        this.dept = dept;
        this.section = section;
        this.collegeStartTime = collegeStartTime;
        this.periodDurationMinutes = periodDurationMinutes;
        this.morningBreakAfter = morningBreakAfter;
        this.morningBreakMinutes = morningBreakMinutes;
        this.lunchBreakAfter = lunchBreakAfter;
        this.lunchBreakMinutes = lunchBreakMinutes;
        this.days = days;
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

    public String getCollegeStartTime() {
        return collegeStartTime;
    }

    public void setCollegeStartTime(String collegeStartTime) {
        this.collegeStartTime = collegeStartTime;
    }

    public int getPeriodDurationMinutes() {
        return periodDurationMinutes;
    }

    public void setPeriodDurationMinutes(int periodDurationMinutes) {
        this.periodDurationMinutes = periodDurationMinutes;
    }

    public int getMorningBreakAfter() {
        return morningBreakAfter;
    }

    public void setMorningBreakAfter(int morningBreakAfter) {
        this.morningBreakAfter = morningBreakAfter;
    }

    public int getMorningBreakMinutes() {
        return morningBreakMinutes;
    }

    public void setMorningBreakMinutes(int morningBreakMinutes) {
        this.morningBreakMinutes = morningBreakMinutes;
    }

    public int getLunchBreakAfter() {
        return lunchBreakAfter;
    }

    public void setLunchBreakAfter(int lunchBreakAfter) {
        this.lunchBreakAfter = lunchBreakAfter;
    }

    public int getLunchBreakMinutes() {
        return lunchBreakMinutes;
    }

    public void setLunchBreakMinutes(int lunchBreakMinutes) {
        this.lunchBreakMinutes = lunchBreakMinutes;
    }

    public Map<String, DayGridDTO> getDays() {
        return days;
    }

    public void setDays(Map<String, DayGridDTO> days) {
        this.days = days;
    }
}


