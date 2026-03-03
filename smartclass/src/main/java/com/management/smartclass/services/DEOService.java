package com.management.smartclass.services;

import com.management.smartclass.Repos.SubjectFacultyRepo;
import com.management.smartclass.Repos.TimeTableRepo;
import com.management.smartclass.models.SubjectFaculty;
import com.management.smartclass.models.TimeTableSlot;
import com.management.smartclass.payload.DayGridDTO;
import com.management.smartclass.payload.PeriodCellDTO;
import com.management.smartclass.payload.TimeTableGridDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.Map;
@Service
public class DEOService {
    @Autowired
    private TimeTableRepo timetableRepo;

    @Autowired
    private SubjectFacultyRepo subjectFacultyRepo;
    public String saveGridTimetable(TimeTableGridDTO dto) {

        // Delete existing timetable for this dept/section/semester before re-saving
        timetableRepo.deleteByDeptAndSectionAndSemester(dto.getDept(), dto.getSection(), dto.getSemester());

        LocalTime currentTime = LocalTime.parse(dto.getCollegeStartTime());

        for (Map.Entry<String, DayGridDTO> dayEntry : dto.getDays().entrySet()) {

            currentTime = LocalTime.parse(dto.getCollegeStartTime());
            String day = dayEntry.getKey();

            for (int period = 1; period <= 7; period++) {

                // ⏸ Morning Break
                if (period == dto.getMorningBreakAfter() + 1) {
                    saveBreak(dto, day, currentTime,
                            dto.getMorningBreakMinutes());
                    currentTime = currentTime
                            .plusMinutes(dto.getMorningBreakMinutes());
                }

                // 🍴 Lunch Break
                if (period == dto.getLunchBreakAfter() + 1) {
                    saveBreak(dto, day, currentTime,
                            dto.getLunchBreakMinutes());
                    currentTime = currentTime
                            .plusMinutes(dto.getLunchBreakMinutes());
                }

                LocalTime start = currentTime;
                LocalTime end = start.plusMinutes(dto.getPeriodDurationMinutes());

                PeriodCellDTO cell =
                        dayEntry.getValue().getPeriods().get(period);

                TimeTableSlot slot = new TimeTableSlot();
                slot.setYear(dto.getYear());
                slot.setSemester(dto.getSemester());
                slot.setDept(dto.getDept());
                slot.setSection(dto.getSection());
                slot.setDay(day);
                slot.setStartTime(start);
                slot.setEndTime(end);

                if (cell == null) {
                    slot.setBreak(true);
                } else {
                    // Save Subject–Faculty mapping (idempotent)
                    subjectFacultyRepo
                            .findByDeptAndSemesterAndSubjectCode(
                                    dto.getDept(),
                                    dto.getSemester(),
                                    cell.getSubjectCode())
                            .orElseGet(() -> {
                                SubjectFaculty sf = new SubjectFaculty();
                                sf.setDept(dto.getDept());
                                sf.setSemester(dto.getSemester());
                                sf.setSubjectCode(cell.getSubjectCode());
                                sf.setSubjectName(cell.getSubjectName());
                                sf.setFacultyEmail(cell.getFacultyEmail());
                                return subjectFacultyRepo.save(sf);
                            });

                    slot.setSubjectCode(cell.getSubjectCode());
                    slot.setSubjectName(cell.getSubjectName());
                    slot.setFacultyEmail(cell.getFacultyEmail());
                    slot.setBreak(false);
                }

                timetableRepo.save(slot);
                currentTime = end;
            }
        }

        return "Timetable saved successfully";
    }

    private void saveBreak(
            TimeTableGridDTO dto,
            String day,
            LocalTime start,
            int minutes) {

        TimeTableSlot breakSlot = new TimeTableSlot();
        breakSlot.setYear(dto.getYear());
        breakSlot.setSemester(dto.getSemester());
        breakSlot.setDept(dto.getDept());
        breakSlot.setSection(dto.getSection());
        breakSlot.setDay(day);
        breakSlot.setStartTime(start);
        breakSlot.setEndTime(start.plusMinutes(minutes));
        breakSlot.setBreak(true);

        timetableRepo.save(breakSlot);
    }
}

