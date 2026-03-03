package com.management.smartclass.controllers;

import com.management.smartclass.Repos.AttendanceRepo;

import com.management.smartclass.models.Students;
import com.management.smartclass.payload.*;
import com.management.smartclass.services.AttendanceService;
import com.management.smartclass.services.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/student")

public class StudentController {
        @Autowired
        private StudentService studentService;
        @Autowired
        private AttendanceService attendanceService;
        @Autowired
        private AttendanceRepo attendanceRepo;

        // profile bhai
        @GetMapping("/profile")
        public ResponseEntity<Students> viewProfile(Authentication auth) {
                return ResponseEntity.ok(
                                studentService.getProfile(auth.getName()));
        }

        @PutMapping("/profile")
        public ResponseEntity<Students> editProfile(
                        Authentication auth,
                        @RequestBody StudentProfileDTO dto) {

                return ResponseEntity.ok(
                                studentService.updateProfile(auth.getName(), dto));
        }

        // complete timetable bhai
        @GetMapping("/week")
        public ResponseEntity<List<StudentPeriodDTO>> getWeek(
                        Authentication auth) {

                return ResponseEntity.ok(
                                studentService.getFullWeekTimetable(auth.getName()));
        }

        // today's timetable bhai
        @GetMapping("/today")
        public ResponseEntity<List<StudentPeriodDTO>> getToday(
                        Authentication auth) {

                return ResponseEntity.ok(
                                studentService.getTodayTimetable(auth.getName()));
        }

        // attendance scan chey bhai
        @PostMapping("/scan")
        public ResponseEntity<String> scanQr(
                        @RequestBody QrScanDTO dto,
                        Authentication auth) {

                return ResponseEntity.ok(
                                attendanceService.markAttendance(
                                                dto.getToken(), auth.getName()));
        }

        @GetMapping("/daily")
        public ResponseEntity<List<DailyAttendanceDTO>> daily(
                        Authentication auth) {

                return ResponseEntity.ok(
                                attendanceService.getDailyAttendance(
                                                auth.getName(),
                                                LocalDate.now()));
        }

        // SUBJECT-WISE attendance bhai
        @GetMapping("/subject/{code}")
        public ResponseEntity<Long> subjectAttendance(
                        Authentication auth,
                        @PathVariable String code) {

                return ResponseEntity.ok(
                                attendanceService.getSubjectAttendance(
                                                auth.getName(),
                                                code));
        }

        // no need this route just return no of classes attended
        @GetMapping("/semester/{sem}")
        public ResponseEntity<Long> semesterAttendance(
                        Authentication auth,
                        @PathVariable int sem) {

                return ResponseEntity.ok(
                                attendanceService.getSemesterAttendance(
                                                auth.getName(),
                                                sem));
        }

        @GetMapping("/month-attendance")
        public ResponseEntity<List<MonthlyAttendanceDTO>> monthly(
                        Authentication auth,
                        @RequestParam int year,
                        @RequestParam int month) {

                return ResponseEntity.ok(
                                attendanceService.getMonthlyAttendance(
                                                auth.getName(),
                                                year,
                                                month));
        }

        // SEMESTER wise bhai attendancee
        @GetMapping("/semester/{sem}/percentage")
        public ResponseEntity<SemesterAttendanceDTO> semesterPercentage(
                        Authentication auth,
                        @PathVariable int sem) {

                return ResponseEntity.ok(
                                attendanceService.getSemesterAttendancePercentage(
                                                auth.getName(),
                                                sem));
        }

        @Autowired
        private com.management.smartclass.Repos.TimeTableRepo timeTableRepo;

        @GetMapping("/timetable")
        @PreAuthorize("hasRole('STUDENT')")
        public ResponseEntity<?> getTimetable(Authentication auth) {
                Students student = studentService.getProfile(auth.getName());
                if (student == null)
                        return ResponseEntity.badRequest().body("Student profile not found");

                return ResponseEntity.ok(timeTableRepo.findByDeptAndSectionAndSemesterOrderByDayAscStartTimeAsc(
                                student.getDept(),
                                student.getSection(),
                                student.getSemester()));
        }
}
