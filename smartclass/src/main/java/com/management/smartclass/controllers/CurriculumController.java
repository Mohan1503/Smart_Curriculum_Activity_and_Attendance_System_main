package com.management.smartclass.controllers;

import com.management.smartclass.models.Curriculum;
import com.management.smartclass.services.CurriculumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/curriculum")
public class CurriculumController {
    @Autowired
    private CurriculumService curriculumService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('DEO') or hasRole('DEPT_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<String> addCurriculum(@RequestParam int year, @RequestParam int semester, @RequestParam MultipartFile file,Authentication auth) throws IOException {
        return ResponseEntity.ok(curriculumService.uploadCurriculam(file,year,semester, auth.getName()));
    }
    @GetMapping("/view")
    public ResponseEntity<Resource> getCurriculum(@RequestParam int year, @RequestParam int semester){
        Curriculum curriculum = curriculumService.getCurriculum(year,semester);
        FileSystemResource file = new FileSystemResource(curriculum.getFilePath());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + curriculum.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

}
