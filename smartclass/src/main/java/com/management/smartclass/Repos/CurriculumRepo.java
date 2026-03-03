package com.management.smartclass.Repos;

import com.management.smartclass.models.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurriculumRepo extends JpaRepository<Curriculum, Long> {
    Optional<Curriculum> findByYearAndSemester(int year, int semester);
}
