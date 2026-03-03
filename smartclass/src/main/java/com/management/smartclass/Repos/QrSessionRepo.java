package com.management.smartclass.Repos;

import com.management.smartclass.models.QrSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QrSessionRepo extends JpaRepository<QrSession, Long> {
    Optional<QrSession> findByToken(String token);
}

