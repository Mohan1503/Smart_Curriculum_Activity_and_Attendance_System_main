package com.management.smartclass.controllers;

import com.management.smartclass.Repos.TimeTableRepo;
import com.management.smartclass.models.TimeTableSlot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/timetable")
public class TimetableController {

    @Autowired
    private TimeTableRepo timetableRepo;

    /**
     * Returns a list of all distinct (dept, section, semester, year) combinations
     * that have timetable data. Accessible to any authenticated user.
     */
    @GetMapping("/all-sections")
    public ResponseEntity<List<Map<String, Object>>> getAllSections() {
        List<Object[]> rows = timetableRepo.findDistinctSections();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("dept", row[0]);
            entry.put("section", row[1]);
            entry.put("semester", row[2]);
            entry.put("year", row[3]);
            result.add(entry);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Fetches the full timetable for a specific dept/section/semester.
     * Accessible to any authenticated user.
     */
    @GetMapping("/view")
    public ResponseEntity<List<TimeTableSlot>> viewTimetable(
            @RequestParam String dept,
            @RequestParam String section,
            @RequestParam int semester) {
        List<TimeTableSlot> slots = timetableRepo.findByDeptAndSectionAndSemesterOrderByDayAscStartTimeAsc(
                dept, section, semester);
        return ResponseEntity.ok(slots);
    }
}
