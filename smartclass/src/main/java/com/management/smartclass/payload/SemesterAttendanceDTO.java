package com.management.smartclass.payload;
public class SemesterAttendanceDTO {

    private int semester;
    private long totalClasses;
    private long presentClasses;
    private double percentage;

    public SemesterAttendanceDTO() {
    }

    public SemesterAttendanceDTO(int semester, long totalClasses, long presentClasses, double percentage) {
        this.semester = semester;
        this.totalClasses = totalClasses;
        this.presentClasses = presentClasses;
        this.percentage = percentage;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public long getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(long totalClasses) {
        this.totalClasses = totalClasses;
    }

    public long getPresentClasses() {
        return presentClasses;
    }

    public void setPresentClasses(long presentClasses) {
        this.presentClasses = presentClasses;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}

