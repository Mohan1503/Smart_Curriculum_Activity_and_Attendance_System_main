package com.management.smartclass.services;

import com.management.smartclass.Repos.FacultyRepo;
import com.management.smartclass.Repos.StudentRepo;
import com.management.smartclass.Repos.UserRepo;
import com.management.smartclass.models.Faculty;
import com.management.smartclass.models.Students;
import com.management.smartclass.models.Users;
import com.opencsv.CSVReader;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.*;

@Service
public class AdminService {
    @Autowired
    private UserRepo userRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private FacultyRepo facultyRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Upload users from CSV or Excel file.
     * The file MUST have a header row. The "role" column in each row determines the account type.
     * Supported formats: .csv, .xlsx, .xls
     *
     * Required columns: email, role
     * Optional student columns: rollno, name, section, dept, year, semester, mobile, address, bloodgroup, mothername, fathername
     * Optional faculty/DEO columns: name, dept, position, qualification
     */
    public String uploadUsers(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) throw new RuntimeException("File name is empty");
        filename = filename.toLowerCase();

        List<Map<String, String>> rows;
        if (filename.endsWith(".csv")) {
            rows = parseCsv(file);
        } else if (filename.endsWith(".xlsx")) {
            rows = parseExcel(file, true);
        } else if (filename.endsWith(".xls")) {
            rows = parseExcel(file, false);
        } else {
            throw new RuntimeException("Unsupported file format. Please upload .csv, .xlsx, or .xls files.");
        }

        if (rows.isEmpty()) {
            throw new RuntimeException("File is empty or has no data rows.");
        }

        // Validate that required columns exist
        Map<String, String> first = rows.get(0);
        if (!first.containsKey("email")) {
            throw new RuntimeException("Missing required column: 'email'. Found columns: " + first.keySet());
        }
        if (!first.containsKey("role")) {
            throw new RuntimeException("Missing required column: 'role'. Found columns: " + first.keySet());
        }

        int created = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            Map<String, String> row = rows.get(i);
            String email = getVal(row, "email");
            String role = getVal(row, "role").toUpperCase();

            if (email.isEmpty()) {
                skipped++;
                continue;
            }
            if (role.isEmpty()) {
                errors.add("Row " + (i + 2) + ": missing role for " + email);
                continue;
            }
            if (!List.of("STUDENT", "FACULTY", "DEO", "ADMIN").contains(role)) {
                errors.add("Row " + (i + 2) + ": invalid role '" + role + "' for " + email);
                continue;
            }

            if (userRepo.existsByEmail(email)) {
                skipped++;
                continue;
            }

            try {
                Users user = new Users();
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode("Welcome@123"));
                user.setRole(role);
                user.setFirstlogin(true);
                userRepo.save(user);

                if ("STUDENT".equals(role)) {
                    saveStudent(row, email);
                } else if ("FACULTY".equals(role) || "DEO".equals(role)) {
                    saveFaculty(row, email);
                }
                created++;
            } catch (Exception e) {
                errors.add("Row " + (i + 2) + ": " + e.getMessage());
            }
        }

        StringBuilder result = new StringBuilder();
        result.append(created).append(" account(s) created successfully.");
        if (created > 0) result.append(" Default password: Welcome@123");
        if (skipped > 0) result.append(" ").append(skipped).append(" skipped (duplicate or empty).");
        if (!errors.isEmpty()) result.append(" Errors: ").append(String.join("; ", errors));
        return result.toString();
    }

    private List<Map<String, String>> parseCsv(MultipartFile file) {
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> allRows = reader.readAll();
            if (allRows.size() < 2) return Collections.emptyList();

            String[] headers = allRows.get(0);
            for (int i = 0; i < headers.length; i++) {
                headers[i] = headers[i].trim().toLowerCase().replaceAll("[^a-z0-9]", "");
            }

            List<Map<String, String>> result = new ArrayList<>();
            for (int i = 1; i < allRows.size(); i++) {
                String[] values = allRows.get(i);
                Map<String, String> row = new HashMap<>();
                for (int j = 0; j < headers.length && j < values.length; j++) {
                    row.put(headers[j], values[j] != null ? values[j].trim() : "");
                }
                // Skip entirely empty rows
                if (row.values().stream().allMatch(String::isEmpty)) continue;
                result.add(row);
            }
            return result;
        } catch (Exception e) {
            throw new RuntimeException("CSV parsing failed: " + e.getMessage());
        }
    }

    private List<Map<String, String>> parseExcel(MultipartFile file, boolean isXlsx) {
        try (Workbook workbook = isXlsx ? new XSSFWorkbook(file.getInputStream()) : new HSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet.getLastRowNum() < 1) return Collections.emptyList();

            // Read header row
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) return Collections.emptyList();
            String[] headers = new String[headerRow.getLastCellNum()];
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                headers[i] = getCellString(cell).trim().toLowerCase().replaceAll("[^a-z0-9]", "");
            }

            List<Map<String, String>> result = new ArrayList<>();
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                Map<String, String> rowMap = new HashMap<>();
                for (int j = 0; j < headers.length; j++) {
                    rowMap.put(headers[j], getCellString(row.getCell(j)));
                }
                if (rowMap.values().stream().allMatch(String::isEmpty)) continue;
                result.add(rowMap);
            }
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Excel parsing failed: " + e.getMessage());
        }
    }

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val) && !Double.isInfinite(val)) {
                    return String.valueOf((long) val);
                }
                return String.valueOf(val);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try { return cell.getStringCellValue().trim(); }
                catch (Exception e) { return String.valueOf(cell.getNumericCellValue()); }
            default:
                return "";
        }
    }

    private String getVal(Map<String, String> row, String key) {
        String v = row.getOrDefault(key, "");
        return v != null ? v.trim() : "";
    }

    private void saveStudent(Map<String, String> row, String email) {
        Students s = new Students();
        s.setEmail(email);
        s.setRollno(getVal(row, "rollno"));
        s.setName(getVal(row, "name"));
        s.setSection(getVal(row, "section"));
        s.setDept(getVal(row, "dept"));
        String yearStr = getVal(row, "year");
        s.setYear(yearStr.isEmpty() ? 0 : Integer.parseInt(yearStr));
        String semStr = getVal(row, "semester");
        s.setSemester(semStr.isEmpty() ? 0 : Integer.parseInt(semStr));
        String mobStr = getVal(row, "mobile");
        s.setMobile(mobStr.isEmpty() ? 0L : Long.parseLong(mobStr));
        s.setAddress(getVal(row, "address"));
        s.setBloodGroup(getVal(row, "bloodgroup"));
        s.setMothername(getVal(row, "mothername"));
        s.setFathername(getVal(row, "fathername"));
        studentRepo.save(s);
    }

    private void saveFaculty(Map<String, String> row, String email) {
        Faculty f = new Faculty();
        f.setEmail(email);
        f.setName(getVal(row, "name"));
        f.setDept(getVal(row, "dept"));
        f.setPosition(getVal(row, "position"));
        f.setQualification(getVal(row, "qualification"));
        facultyRepo.save(f);
    }
}
