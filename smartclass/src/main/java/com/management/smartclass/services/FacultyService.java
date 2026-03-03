package com.management.smartclass.services;

import com.management.smartclass.Repos.FacultyRepo;
import com.management.smartclass.Repos.QrSessionRepo;
import com.management.smartclass.Repos.TimeTableRepo;
import com.management.smartclass.models.Faculty;
import com.management.smartclass.models.QrSession;
import com.management.smartclass.models.TimeTableSlot;
import com.management.smartclass.payload.FacultyPeriodDTO;
import com.management.smartclass.payload.FacultyProfileDTO;
import com.management.smartclass.payload.QrGenerateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepo facultyRepo;
    @Autowired
    private TimeTableRepo timeTableRepo;
    @Autowired
    private QrSessionRepo qrRepo;
    public Faculty getProfile(String email) {
        return facultyRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
    }


    public Faculty updateProfile(String email, FacultyProfileDTO dto) {

        Faculty faculty = facultyRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        faculty.setName(dto.getName());
        faculty.setDept(dto.getDept());
        faculty.setPosition(dto.getPosition());
        faculty.setQualification(dto.getQualification());

        return facultyRepo.save(faculty);
    }
    public List<FacultyPeriodDTO> getTodayTimetable(String facultyEmail) {

        String today = LocalDate.now()
                .getDayOfWeek()
                .name(); // MONDAY, TUESDAY...

        return getTimetableByDay(facultyEmail, today);
    }


    public List<FacultyPeriodDTO> getTimetableByDay(
            String facultyEmail,
            String day) {

        List<TimeTableSlot> slots =
                timeTableRepo.findByFacultyEmailAndDayOrderByStartTime(
                        facultyEmail,
                        day.toUpperCase()
                );

        return slots.stream().map(slot -> {

            FacultyPeriodDTO dto = new FacultyPeriodDTO();
            dto.setDay(slot.getDay());
            dto.setStartTime(slot.getStartTime().toString());
            dto.setEndTime(slot.getEndTime().toString());
            dto.setSubjectCode(slot.getSubjectCode());
            dto.setSubjectName(slot.getSubjectName());
            dto.setDept(slot.getDept());
            dto.setSection(slot.getSection());
            dto.setBreak(slot.isBreak());

            return dto;
        }).toList();
    }
    public String generateQr(QrGenerateDTO dto, String facultyEmail) {

        String token = UUID.randomUUID().toString();

        QrSession qr = new QrSession();
        qr.setToken(token);
        qr.setFacultyEmail(facultyEmail);
        qr.setSubjectCode(dto.getSubjectCode());
        qr.setSubjectName(dto.getSubjectName());
        qr.setDept(dto.getDept());
        qr.setSection(dto.getSection());
        qr.setSemester(dto.getSemester());
        qr.setDate(LocalDate.now());
        qr.setStartTime(LocalTime.parse(dto.getStartTime()));
        qr.setEndTime(LocalTime.parse(dto.getEndTime()));
        qr.setExpiresAt(LocalDateTime.now().plusMinutes(2));

        qrRepo.save(qr);
        return token;
    }
}

