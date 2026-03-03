package com.management.smartclass.Repos;

import com.management.smartclass.models.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<Users,Long> {
    Optional<Users> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Users> findByRole(String role);
    long countByRole(String role);

    @Query("SELECT DISTINCT u.role FROM Users u")
    List<String> findDistinctRoles();
}
