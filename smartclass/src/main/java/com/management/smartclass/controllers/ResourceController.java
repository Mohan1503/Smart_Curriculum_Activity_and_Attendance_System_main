package com.management.smartclass.controllers;

import com.management.smartclass.Repos.FacultyRepo;
import com.management.smartclass.Repos.StudentRepo;
import com.management.smartclass.models.Faculty;
import com.management.smartclass.models.FacultyResource;
import com.management.smartclass.models.Students;
import com.management.smartclass.payload.FacultyResourceMetaDTO;
import com.management.smartclass.services.ResourcesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/faculty/resources")
public class ResourceController {

    @Autowired
    private ResourcesService service;

    @Autowired
    private FacultyRepo facultyRepo;

    @Autowired
    private StudentRepo studentRepo;

    // Upload PDF
    @PostMapping("/upload")
    public ResponseEntity<FacultyResource> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam("subject") String subject,
            Authentication auth
    ) throws IOException {
        String facultyUsername = auth.getName();

        return ResponseEntity.ok(
                service.uploadPdf(file, subject, facultyUsername)
        );
    }

    // View own uploaded PDFs
    @GetMapping("/my-uploads")
    public ResponseEntity<List<FacultyResourceMetaDTO>> listMetadata(
            Authentication auth
    ) {
        return ResponseEntity.ok(
                service.getMyResourceMetadata(auth.getName())
        );
    }

    // VIEW PDF BY ID
    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewPdf(@PathVariable Long id)
            throws IOException {

        FacultyResource resource = service.getResourceById(id);

        FileSystemResource file =
                new FileSystemResource(resource.getFilePath());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<FacultyResourceMetaDTO>> bySubject(
            @PathVariable String subject
    ) {
        return ResponseEntity.ok(
                service.getAllResourcesBySubject(subject)
        );
    }

    // All resources (no dept filter)
    @GetMapping("/view/all")
    public ResponseEntity<List<FacultyResourceMetaDTO>> viewAll() {
        return ResponseEntity.ok(service.getAllResources());
    }

    // Resources filtered by department name
    @GetMapping("/dept/{dept}")
    public ResponseEntity<List<FacultyResourceMetaDTO>> byDept(
            @PathVariable String dept
    ) {
        return ResponseEntity.ok(service.getResourcesByDept(dept));
    }

    /**
     * Returns resources for the authenticated user's own department.
     * Works for FACULTY, DEO, and STUDENT roles — looks up department
     * from faculty or student profile.
     */
    @GetMapping("/my-dept")
    public ResponseEntity<?> myDeptResources(Authentication auth) {
        String email = auth.getName();

        // Try faculty/DEO first
        Optional<Faculty> facultyOpt = facultyRepo.findByEmail(email);
        if (facultyOpt.isPresent() && facultyOpt.get().getDept() != null) {
            return ResponseEntity.ok(service.getResourcesByDept(facultyOpt.get().getDept()));
        }

        // Try student
        Optional<Students> studentOpt = studentRepo.findByEmail(email);
        if (studentOpt.isPresent() && studentOpt.get().getDept() != null) {
            return ResponseEntity.ok(service.getResourcesByDept(studentOpt.get().getDept()));
        }

        return ResponseEntity.ok(List.of());
    }
}
