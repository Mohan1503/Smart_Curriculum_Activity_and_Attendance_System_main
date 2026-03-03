package com.management.smartclass.Repos;

import com.management.smartclass.models.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepo extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByEmail(String email);

    long countByDept(String department);

    java.util.List<Faculty> findAllByDept(String department);

    @Query("SELECT DISTINCT f.dept FROM Faculty f WHERE f.dept IS NOT NULL AND f.dept <> ''")
    List<String> findDistinctDepartments();
}
