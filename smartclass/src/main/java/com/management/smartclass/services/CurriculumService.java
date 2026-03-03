package com.management.smartclass.services;

import com.management.smartclass.Repos.CurriculumRepo;
import com.management.smartclass.models.Curriculum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CurriculumService {
    @Autowired
    private CurriculumRepo curriculumRepo;
    private static final String UPLOAD_DIR = "uploads/deo/";
    public String uploadCurriculam(MultipartFile file,int year,int semester,String username) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new RuntimeException("Only PDF files are allowed");
        }

        // Base directory (change once, works everywhere)
        Path baseDir = Paths.get(UPLOAD_DIR, username);


        Files.createDirectories(baseDir);


        String storedFilename =
                UUID.randomUUID() + "_" + file.getOriginalFilename();

        Path filePath = baseDir.resolve(storedFilename);


        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );
        Curriculum curriculum = new Curriculum();
        curriculum.setSemester(semester);
        curriculum.setYear(year);
        curriculum.setFileName(file.getOriginalFilename());
        curriculum.setFileType(file.getContentType());
        curriculum.setFilePath(filePath.toAbsolutePath().toString());
        curriculum.setFileSize(file.getSize());
        curriculum.setUploadedBy(username);
        curriculum.setUploadAt(LocalDateTime.now());
        curriculumRepo.save(curriculum);
        return "Uploaded Successfully.";
    }

    public Curriculum getCurriculum(int year,int semester){
        Curriculum curriculum = curriculumRepo.findByYearAndSemester(year,semester).orElse(new Curriculum());
        return curriculum;
    }
}
