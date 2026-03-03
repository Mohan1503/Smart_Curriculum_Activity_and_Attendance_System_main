package com.management.smartclass.controllers;

import com.management.smartclass.Repos.FacultyRepo;
import com.management.smartclass.Repos.StudentRepo;
import com.management.smartclass.Repos.UserRepo;
import com.management.smartclass.Repos.AttendanceRepo;
import com.management.smartclass.models.Faculty;
import com.management.smartclass.models.Students;
import com.management.smartclass.models.Users;
import com.management.smartclass.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    private AdminService adminService;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private StudentRepo studentRepo;
    @Autowired
    private FacultyRepo facultyRepo;
    @Autowired
    private AttendanceRepo attendanceRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/upload-users")
    public ResponseEntity<String> uploadUsers(@RequestParam MultipartFile file) {
        try {
            String res = adminService.uploadUsers(file);
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── Dashboard Stats ─────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepo.count());
        stats.put("totalStudents", userRepo.countByRole("STUDENT"));
        stats.put("totalFaculty", userRepo.countByRole("FACULTY"));
        stats.put("totalDEOs", userRepo.countByRole("DEO"));
        stats.put("totalAdmins", userRepo.countByRole("ADMIN"));

        List<String> departments = facultyRepo.findDistinctDepartments();
        stats.put("totalDepartments", departments.size());
        stats.put("departments", departments);

        // Department-wise breakdown
        List<Map<String, Object>> deptBreakdown = new ArrayList<>();
        for (String dept : departments) {
            Map<String, Object> d = new HashMap<>();
            d.put("name", dept);
            d.put("students", studentRepo.countByDept(dept));
            d.put("faculty", facultyRepo.countByDept(dept));
            deptBreakdown.add(d);
        }
        stats.put("departmentBreakdown", deptBreakdown);

        // Role distribution for charts
        List<Map<String, Object>> roleDistribution = new ArrayList<>();
        for (String role : List.of("STUDENT", "FACULTY", "DEO", "ADMIN")) {
            Map<String, Object> r = new HashMap<>();
            r.put("role", role);
            r.put("count", userRepo.countByRole(role));
            roleDistribution.add(r);
        }
        stats.put("roleDistribution", roleDistribution);

        return ResponseEntity.ok(stats);
    }

    // ─── User CRUD ───────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(required = false) String role) {
        List<Users> users;
        if (role != null && !role.isEmpty()) {
            users = userRepo.findByRole(role);
        } else {
            users = userRepo.findAll();
        }
        // Don't expose passwords
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("firstlogin", u.isFirstlogin());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String role = payload.get("role");
        String password = payload.getOrDefault("password", "Welcome@123");

        if (userRepo.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("User with this email already exists");
        }

        Users user = new Users();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setFirstlogin(true);
        userRepo.save(user);

        return ResponseEntity.ok("User created successfully");
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Users user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (payload.containsKey("role")) {
            user.setRole(payload.get("role"));
        }
        if (payload.containsKey("email")) {
            user.setEmail(payload.get("email"));
        }
        if (payload.containsKey("password") && !payload.get("password").isEmpty()) {
            user.setPassword(passwordEncoder.encode(payload.get("password")));
        }
        userRepo.save(user);
        return ResponseEntity.ok("User updated successfully");
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        Users user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Also delete related profile
        studentRepo.findByEmail(user.getEmail()).ifPresent(studentRepo::delete);
        facultyRepo.findByEmail(user.getEmail()).ifPresent(facultyRepo::delete);
        userRepo.delete(user);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ─── Department Management ───────────────────────────────
    @GetMapping("/departments")
    public ResponseEntity<?> getDepartments() {
        List<String> departments = facultyRepo.findDistinctDepartments();
        List<Map<String, Object>> result = new ArrayList<>();
        for (String dept : departments) {
            Map<String, Object> d = new HashMap<>();
            d.put("name", dept);
            d.put("studentCount", studentRepo.countByDept(dept));
            d.put("facultyCount", facultyRepo.countByDept(dept));
            // Find DEO for this department
            List<Users> deos = userRepo.findByRole("DEO");
            String deoEmail = null;
            for (Users deo : deos) {
                Optional<Faculty> f = facultyRepo.findByEmail(deo.getEmail());
                if (f.isPresent() && dept.equals(f.get().getDept())) {
                    deoEmail = deo.getEmail();
                    break;
                }
            }
            d.put("deoEmail", deoEmail);
            result.add(d);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/departments")
    public ResponseEntity<?> createDepartment(@RequestBody Map<String, String> payload) {
        String deptName = payload.get("name");
        String deoEmail = payload.get("deoEmail");
        String deoPassword = payload.get("deoPassword");

        if (deptName == null || deptName.isEmpty()) {
            return ResponseEntity.badRequest().body("Department name is required");
        }

        // Check if department already exists
        List<String> existingDepts = facultyRepo.findDistinctDepartments();
        if (existingDepts.contains(deptName)) {
            return ResponseEntity.badRequest().body("Department already exists");
        }

        // If DEO email provided, create or update the DEO's faculty profile with this department
        if (deoEmail != null && !deoEmail.isEmpty()) {
            // Ensure user exists with DEO role
            Optional<Users> userOpt = userRepo.findByEmail(deoEmail);
            if (userOpt.isEmpty()) {
                // Create user
                String password = (deoPassword != null && !deoPassword.isEmpty()) ? deoPassword : "Welcome@123";
                Users user = new Users();
                user.setEmail(deoEmail);
                user.setPassword(passwordEncoder.encode(password));
                user.setRole("DEO");
                user.setFirstlogin(true);
                userRepo.save(user);
            }

            // Create or update faculty profile
            Faculty faculty = facultyRepo.findByEmail(deoEmail).orElse(new Faculty());
            faculty.setEmail(deoEmail);
            faculty.setDept(deptName);
            if (faculty.getName() == null) faculty.setName("DEO - " + deptName);
            if (faculty.getPosition() == null) faculty.setPosition("Department Executive Officer");
            facultyRepo.save(faculty);
        }

        return ResponseEntity.ok("Department '" + deptName + "' created successfully");
    }

    @PutMapping("/departments/{name}")
    public ResponseEntity<?> updateDepartment(@PathVariable String name, @RequestBody Map<String, String> payload) {
        String newName = payload.get("name");
        String newDeoEmail = payload.get("deoEmail");
        String deoPassword = payload.get("deoPassword");

        // Verify department exists
        List<String> existingDepts = facultyRepo.findDistinctDepartments();
        if (!existingDepts.contains(name)) {
            return ResponseEntity.badRequest().body("Department '" + name + "' not found");
        }

        // If renaming, update all faculty and students in this department
        if (newName != null && !newName.isEmpty() && !newName.equals(name)) {
            // Check new name doesn't conflict
            if (existingDepts.contains(newName)) {
                return ResponseEntity.badRequest().body("Department '" + newName + "' already exists");
            }
            List<Faculty> faculties = facultyRepo.findAllByDept(name);
            for (Faculty f : faculties) {
                f.setDept(newName);
                facultyRepo.save(f);
            }
            List<Students> students = studentRepo.findByDept(name);
            for (Students s : students) {
                s.setDept(newName);
                studentRepo.save(s);
            }
        }

        String effectiveDept = (newName != null && !newName.isEmpty()) ? newName : name;

        // Update DEO assignment if provided
        if (newDeoEmail != null && !newDeoEmail.isEmpty()) {
            // Remove old DEO assignment for this dept (set their dept to empty)
            List<Users> deos = userRepo.findByRole("DEO");
            for (Users deo : deos) {
                Optional<Faculty> fOpt = facultyRepo.findByEmail(deo.getEmail());
                if (fOpt.isPresent() && effectiveDept.equals(fOpt.get().getDept())) {
                    if (!deo.getEmail().equals(newDeoEmail)) {
                        // Old DEO - don't remove, just let new one take over
                    }
                }
            }

            // Create user if doesn't exist
            Optional<Users> userOpt = userRepo.findByEmail(newDeoEmail);
            if (userOpt.isEmpty()) {
                String password = (deoPassword != null && !deoPassword.isEmpty()) ? deoPassword : "Welcome@123";
                Users user = new Users();
                user.setEmail(newDeoEmail);
                user.setPassword(passwordEncoder.encode(password));
                user.setRole("DEO");
                user.setFirstlogin(true);
                userRepo.save(user);
            }

            // Create or update faculty profile for new DEO
            Faculty faculty = facultyRepo.findByEmail(newDeoEmail).orElse(new Faculty());
            faculty.setEmail(newDeoEmail);
            faculty.setDept(effectiveDept);
            if (faculty.getName() == null) faculty.setName("DEO - " + effectiveDept);
            if (faculty.getPosition() == null) faculty.setPosition("Department Executive Officer");
            facultyRepo.save(faculty);
        }

        return ResponseEntity.ok("Department updated successfully");
    }

    @DeleteMapping("/departments/{name}")
    public ResponseEntity<?> deleteDepartment(@PathVariable String name) {
        List<String> existingDepts = facultyRepo.findDistinctDepartments();
        if (!existingDepts.contains(name)) {
            return ResponseEntity.badRequest().body("Department '" + name + "' not found");
        }

        // Separate DEO faculty from non-DEO faculty
        List<Faculty> allFaculty = facultyRepo.findAllByDept(name);
        List<Faculty> deoFaculty = new ArrayList<>();
        List<Faculty> nonDeoFaculty = new ArrayList<>();
        for (Faculty f : allFaculty) {
            Optional<Users> u = userRepo.findByEmail(f.getEmail());
            if (u.isPresent() && "DEO".equalsIgnoreCase(u.get().getRole())) {
                deoFaculty.add(f);
            } else {
                nonDeoFaculty.add(f);
            }
        }

        // Check if department has students or non-DEO faculty
        long studentCount = studentRepo.countByDept(name);
        if (studentCount > 0 || !nonDeoFaculty.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    "Cannot delete department '" + name + "' — it still has " + studentCount + " student(s) and " + nonDeoFaculty.size() + " faculty member(s). Remove them first.");
        }

        // Delete DEO faculty profiles and their user accounts
        for (Faculty deo : deoFaculty) {
            String deoEmail = deo.getEmail();
            facultyRepo.delete(deo);
            userRepo.findByEmail(deoEmail).ifPresent(userRepo::delete);
        }

        return ResponseEntity.ok("Department '" + name + "' deleted successfully");
    }

    // ─── Attendance Overview ─────────────────────────────────
    @GetMapping("/attendance-overview")
    public ResponseEntity<?> getAttendanceOverview(@RequestParam(required = false) String date) {
        LocalDate targetDate = (date != null && !date.isEmpty()) ? LocalDate.parse(date) : LocalDate.now();
        List<String> departments = facultyRepo.findDistinctDepartments();

        List<Map<String, Object>> deptBreakdown = new ArrayList<>();
        long totalPresent = 0;
        long totalRecords = 0;

        for (String dept : departments) {
            long deptTotal = attendanceRepo.countByDeptAndDate(dept, targetDate);
            long deptPresent = attendanceRepo.countByDeptAndDateAndPresent(dept, targetDate, true);
            long deptAbsent = deptTotal - deptPresent;
            totalPresent += deptPresent;
            totalRecords += deptTotal;

            Map<String, Object> d = new HashMap<>();
            d.put("department", dept);
            d.put("totalRecords", deptTotal);
            d.put("presentCount", deptPresent);
            d.put("absentCount", deptAbsent);
            d.put("rate", deptTotal > 0 ? Math.round((deptPresent * 100.0) / deptTotal * 10) / 10.0 : 0);
            deptBreakdown.add(d);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("date", targetDate.toString());
        result.put("totalRecords", totalRecords);
        result.put("presentCount", totalPresent);
        result.put("absentCount", totalRecords - totalPresent);
        result.put("overallRate", totalRecords > 0 ? Math.round((totalPresent * 100.0) / totalRecords * 10) / 10.0 : 0);
        result.put("departmentBreakdown", deptBreakdown);
        return ResponseEntity.ok(result);
    }
}
