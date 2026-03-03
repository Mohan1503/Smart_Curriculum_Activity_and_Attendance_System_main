package com.management.smartclass.controllers;

import com.management.smartclass.models.Faculty;
import com.management.smartclass.payload.TimeTableGridDTO;
import com.management.smartclass.services.DEOService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/deo")
@PreAuthorize("hasAnyRole('DEPT_ADMIN', 'DEO')")
public class DEOController {

    @Autowired
    private DEOService deoService;

    @PostMapping("/post-timetable")
    public ResponseEntity<String> saveTimetable(
            @RequestBody TimeTableGridDTO dto) {

        return ResponseEntity.ok(
                deoService.saveGridTimetable(dto));
    }

    @Autowired
    private com.management.smartclass.Repos.StudentRepo studentRepo;

    @Autowired
    private com.management.smartclass.Repos.FacultyRepo facultyRepo;

    // Helper to get Dept from logged in user (assuming DEO email stored in UserRepo
    // or context)
    // For simplicity, we'll accept dept as param or assume Computer Science for now
    // if not in token
    // But in real app, we fetch DEO profile. Let's assume passed as Query Param or
    // Fixed for MVP

    @org.springframework.web.bind.annotation.GetMapping("/stats")
    public ResponseEntity<?> getStats(org.springframework.security.core.Authentication auth) {
        // In a real scenario, we'd fetch the DEO's department.
        // For MVP, we'll hardcode or fetch from a profile service.
        // Let's assume the DEO manages "CSE" by default or fetch from user details if
        // extended.
          // default for MVP
        Faculty faculty = facultyRepo.findByEmail(auth.getName()).orElseThrow(()->new RuntimeException("deo controller line 50"));
        String dept =faculty.getDept();
        return ResponseEntity.ok(new com.management.smartclass.payload.DEOStatsDTO(
                studentRepo.countByDept(dept),
                facultyRepo.countByDept(dept)));
    }

    @org.springframework.web.bind.annotation.GetMapping("/faculty-list")
    public ResponseEntity<java.util.List<com.management.smartclass.models.Faculty>> getFacultyList(
            org.springframework.security.core.Authentication auth) {
        // Use DEO's department dynamically
        Faculty deoFaculty = facultyRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("DEO profile not found"));
        return ResponseEntity.ok(facultyRepo.findAllByDept(deoFaculty.getDept()));
    }

    @PostMapping("/assign-section")
    public ResponseEntity<?> assignSection(@RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        String section = payload.get("section");
        String dept = payload.get("dept");

        var studentOpt = studentRepo.findByEmail(email);
        if (studentOpt.isPresent()) {
            var student = studentOpt.get();
            student.setSection(section);
            student.setDept(dept);
            studentRepo.save(student);
            return ResponseEntity.ok("Student assigned to " + section);
        }
        return ResponseEntity.badRequest().body("Student not found");
    }

    @org.springframework.web.bind.annotation.GetMapping("/students-list")
    public ResponseEntity<?> getStudentsList(org.springframework.security.core.Authentication auth) {
        Faculty deoFaculty = facultyRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("DEO profile not found"));
        return ResponseEntity.ok(studentRepo.findByDept(deoFaculty.getDept()));
    }

    @Autowired
    private com.management.smartclass.Repos.AttendanceRepo attendanceRepo;

    @org.springframework.web.bind.annotation.GetMapping("/attendance-stats")
    public ResponseEntity<?> getAttendanceStats(org.springframework.security.core.Authentication auth) {
        Faculty deoFaculty = facultyRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("DEO profile not found"));
        String dept = deoFaculty.getDept();

        long totalStudents = studentRepo.countByDept(dept);
        java.time.LocalDate today = java.time.LocalDate.now();
        long presentToday = attendanceRepo.countByDeptAndDateAndPresent(dept, today, true);
        long absentToday = totalStudents - presentToday;
        long totalClasses = attendanceRepo.countByDeptAndDate(dept, today);

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("presentToday", presentToday);
        stats.put("absentToday", absentToday);
        stats.put("totalClassesToday", totalClasses);
        stats.put("attendanceRate", totalStudents > 0 ? Math.round((presentToday * 100.0) / totalStudents) : 0);
        return ResponseEntity.ok(stats);
    }

    @org.springframework.web.bind.annotation.GetMapping("/my-dept")
    public ResponseEntity<?> getMyDept(org.springframework.security.core.Authentication auth) {
        Faculty deoFaculty = facultyRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("DEO profile not found"));
        java.util.Map<String, String> result = new java.util.HashMap<>();
        result.put("department", deoFaculty.getDept());
        result.put("name", deoFaculty.getName());
        return ResponseEntity.ok(result);
    }
}
