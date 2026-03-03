package com.management.smartclass.controllers;

import com.management.smartclass.models.Faculty;
import com.management.smartclass.payload.*;
import com.management.smartclass.services.AttendanceService;
import com.management.smartclass.services.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/faculty")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyController {
        @Autowired
        private FacultyService facultyService;

        @GetMapping("/profile")
        public ResponseEntity<Faculty> viewProfile(Authentication auth) {
                return ResponseEntity.ok(
                                facultyService.getProfile(auth.getName()));
        }

        @PutMapping("/profile")
        public ResponseEntity<Faculty> editProfile(
                        Authentication auth,
                        @RequestBody FacultyProfileDTO dto) {

                return ResponseEntity.ok(
                                facultyService.updateProfile(auth.getName(), dto));
        }

        @GetMapping("/today")
        public ResponseEntity<List<FacultyPeriodDTO>> getToday(
                        Authentication auth) {

                return ResponseEntity.ok(
                                facultyService.getTodayTimetable(auth.getName()));
        }

        // perticlar DAY
        @GetMapping("/day/{day}")
        public ResponseEntity<List<FacultyPeriodDTO>> getByDay(
                        @PathVariable String day,
                        Authentication auth) {

                return ResponseEntity.ok(
                                facultyService.getTimetableByDay(
                                                auth.getName(),
                                                day));
        }

        @Autowired
        private com.management.smartclass.services.AttendanceService attendanceService;

        @PostMapping("/attendance/manual")
        public ResponseEntity<String> manualAttendance(
                        @RequestBody com.management.smartclass.payload.ManualAttendanceDTO dto) {
                return ResponseEntity.ok(
                                attendanceService.manualAttendance(
                                                dto.getStudentEmail(),
                                                dto.getSubjectCode(),
                                                java.time.LocalDate.parse(dto.getDate()),
                                                java.time.LocalTime.parse(dto.getStartTime()),
                                                dto.isPresent()));
        }

        @GetMapping("/attendance/monitor")
        public ResponseEntity<List<com.management.smartclass.models.Attendance>> monitorAttendance(
                        @RequestParam String subjectCode,
                        @RequestParam String date,
                        @RequestParam String startTime) {

                return ResponseEntity.ok(
                                attendanceService.getClassAttendance(
                                                subjectCode,
                                                java.time.LocalDate.parse(date),
                                                java.time.LocalTime.parse(startTime)));
        }

        @PostMapping("/generate-qr")
        public ResponseEntity<String> generateQr(
                        @RequestBody QrGenerateDTO dto,
                        Authentication auth) {

                return ResponseEntity.ok(
                                facultyService.generateQr(dto, auth.getName()));
        }

        @Autowired
        private com.management.smartclass.Repos.TimeTableRepo timeTableRepo;

        @GetMapping("/timetable")
        public ResponseEntity<?> getTimetable(Authentication auth) {
                return ResponseEntity.ok(timeTableRepo.findByFacultyEmail(auth.getName()));
        }
}
