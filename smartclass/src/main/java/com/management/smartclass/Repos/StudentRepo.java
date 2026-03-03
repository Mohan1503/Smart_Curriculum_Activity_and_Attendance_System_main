package com.management.smartclass.Repos;

import com.management.smartclass.models.Students;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepo extends JpaRepository<Students, Long> {
    Optional<Students> findByEmail(String email);
    List<Students> findByDeptAndSectionAndSemester(
            String dept,
            String section,
            int semester
    );

    long countByDept(String dept);

    List<Students> findByDept(String dept);
    List<Students> findByDeptAndSection(String dept, String section);
}
