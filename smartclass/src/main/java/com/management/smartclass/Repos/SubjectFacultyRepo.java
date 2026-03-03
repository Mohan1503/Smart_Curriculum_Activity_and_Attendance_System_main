package com.management.smartclass.Repos;

import com.management.smartclass.models.SubjectFaculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectFacultyRepo extends JpaRepository<SubjectFaculty, Long> {

    Optional<SubjectFaculty> findByDeptAndSemesterAndSubjectCode(
            String dept, int semester, String subjectCode);
}

