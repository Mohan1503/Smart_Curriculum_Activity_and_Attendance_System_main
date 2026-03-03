package com.management.smartclass.Repos;


import com.management.smartclass.models.FacultyResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacultyResourceRepo
        extends JpaRepository<FacultyResource, Long> {

    List<FacultyResource> findByUploadedBy(String uploadedBy);
    List<FacultyResource> findBySubjectIgnoreCase(String subject);
    List<FacultyResource> findByDeptOrderByUploadedAtDesc(String dept);
    List<FacultyResource> findByDeptAndSubjectIgnoreCase(String dept, String subject);
}

