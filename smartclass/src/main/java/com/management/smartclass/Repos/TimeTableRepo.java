package com.management.smartclass.Repos;

import com.management.smartclass.models.TimeTableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TimeTableRepo extends JpaRepository<TimeTableSlot, Long> {
        List<TimeTableSlot> findByFacultyEmailAndDayOrderByStartTime(
                        String facultyEmail,
                        String day);

        List<TimeTableSlot> findByDeptAndSectionAndSemesterOrderByDayAscStartTimeAsc(
                        String dept,
                        String section,
                        int semester);

        List<TimeTableSlot> findByDeptAndSectionAndSemesterAndDayOrderByStartTime(
                        String dept,
                        String section,
                        int semester,
                        String day);

        List<TimeTableSlot> findByFacultyEmail(String facultyEmail);

        @Transactional
        void deleteByDeptAndSectionAndSemester(String dept, String section, int semester);

        @Query("SELECT DISTINCT t.dept, t.section, t.semester, t.year FROM TimeTableSlot t ORDER BY t.dept, t.section, t.semester")
        List<Object[]> findDistinctSections();
}
