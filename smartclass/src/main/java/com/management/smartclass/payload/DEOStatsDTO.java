package com.management.smartclass.payload;

public class DEOStatsDTO {
    private long totalStudents;
    private long totalFaculty;

    public DEOStatsDTO(long totalStudents, long totalFaculty) {
        this.totalStudents = totalStudents;
        this.totalFaculty = totalFaculty;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public long getTotalFaculty() {
        return totalFaculty;
    }
}
