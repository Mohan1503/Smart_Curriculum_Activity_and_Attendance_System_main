package com.management.smartclass.services;

import com.management.smartclass.Repos.StudentRepo;
import com.management.smartclass.Repos.TimeTableRepo;
import com.management.smartclass.models.Students;
import com.management.smartclass.models.TimeTableSlot;
import com.management.smartclass.payload.StudentPeriodDTO;
import com.management.smartclass.payload.StudentProfileDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class StudentService {

    @Autowired
    private StudentRepo studentRepo;
    @Autowired
    private TimeTableRepo timetableRepo;


    public Students getProfile(String email) {
        return studentRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }


    public Students updateProfile(String email, StudentProfileDTO dto) {

        Students student = studentRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setName(dto.getName());
        student.setSection(dto.getSection());
        student.setDept(dto.getDept());
        student.setYear(dto.getYear());
        student.setSemester(dto.getSemester());
        student.setMobile(dto.getMobile());
        student.setAddress(dto.getAddress());
        student.setBloodGroup(dto.getBloodGroup());
        student.setMothername(dto.getMothername());
        student.setFathername(dto.getFathername());

        return studentRepo.save(student);
    }
    public List<StudentPeriodDTO> getFullWeekTimetable(String studentEmail) {

        Students student = studentRepo.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<TimeTableSlot> slots =
                timetableRepo.findByDeptAndSectionAndSemesterOrderByDayAscStartTimeAsc(
                        student.getDept(),
                        student.getSection(),
                        student.getSemester()
                );

        return mapToDTO(slots);
    }
    public List<StudentPeriodDTO> getTodayTimetable(String studentEmail) {

        Students student = studentRepo.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String today = LocalDate.now()
                .getDayOfWeek()
                .name();

        List<TimeTableSlot> slots =
                timetableRepo.findByDeptAndSectionAndSemesterAndDayOrderByStartTime(
                        student.getDept(),
                        student.getSection(),
                        student.getSemester(),
                        today
                );

        return mapToDTO(slots);
    }
    private List<StudentPeriodDTO> mapToDTO(List<TimeTableSlot> slots) {

        return slots.stream().map(slot -> {
            StudentPeriodDTO dto = new StudentPeriodDTO();
            dto.setDay(slot.getDay());
            dto.setStartTime(slot.getStartTime().toString());
            dto.setEndTime(slot.getEndTime().toString());
            dto.setSubjectCode(slot.getSubjectCode());
            dto.setSubjectName(slot.getSubjectName());
            dto.setFacultyEmail(slot.getFacultyEmail());
            dto.setBreak(slot.isBreak());
            return dto;
        }).toList();
    }

}

